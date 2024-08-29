import asyncio
import json
import logging
import django

django.setup()
import redis.asyncio as redis
from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from .game import PingPongGame
from users.models import CustomUser
from .models import GameLog
logger = logging.getLogger("django")

class GameConsumer(AsyncWebsocketConsumer):
    class Games:
        pass

    async def connect(self):
        self.position = None
        self.isStart = False
        self.game_id = self.scope["url_route"]["kwargs"]["game_id"]
        self.type = self.scope["url_route"]["kwargs"]["type"]
        self.game_group = f"game_{self.game_id}"
        self.my_match = 1
        self.redis = redis.from_url("redis://redis")
        self.timeout = 3
        if self.type == "tournament" or self.type == "4P":
            max_players = 4
        else:
            max_players = 2

        await self.accept()
        await self.channel_layer.group_add(self.game_group, self.channel_name)

        self.user = self.scope["user"]
        group_size = await self._increment_and_get_group_size(self.game_group)

        if group_size == max_players:
            self.position = 'left'
        elif group_size == 1:
            self.position = 'right'
        elif group_size == 2:
            self.position = 'up'
        elif group_size == 3:
            self.position = 'down'
            
        if self.type == "tournament" or self.type == "4P" or self.type == "2P":
            asyncio.create_task(self._start_timeout(self.game_group, max_players))
        else:
            asyncio.create_task(self._start_opposite_check())


        if self.user.is_authenticated:
            await self.save_user_info(self.user)
        else:
            self.close()

        if self.position == 'left':
            user_info_dict = await self.redis.hgetall(self.game_id)
            self.user_info_list = [
                json.loads(user_info_dict[self.channel_name])
                for self.channel_name in user_info_dict
            ]
            await self.channel_layer.group_send(
                self.game_group,
                {
                    "type": "game_start",
                    "game_type": self.type,
                    "user_info": self.user_info_list,
                },
            )
        logger.info(self.position)

    async def save_user_info(self, user):
        user_info = {
            "id": user.id,
            "nickname": user.nickname,
            "picture": user.picture.url,
            "position": self.position
        }
        await self.redis.hset(self.game_id, self.channel_name, json.dumps(user_info))

    async def receive(self, text_data):
        data = json.loads(text_data)
        type = data.get("type")
        if type == "start":
            self.isStart = True
            if self.position == 'left':
                asyncio.create_task(self._game_start(data.get("data", {})))
        elif type == "keyboard":
            asyncio.create_task(self._accept_key(data.get("data", {})))

    async def disconnect(self, close_code):
        logger.info("User disconnected")
        if self.user and self.user.id:
            if isinstance(self.channel_name, bytes):
                self.channel_name = self.channel_name.decode('utf-8')
            else:
                self.channel_name = self.channel_name
            await self._decrement_group_size(self.game_group)
            await self.redis.hdel(self.game_id, self.channel_name)
            await self.channel_layer.group_discard(self.game_group, self.channel_name)

    async def _get_group_size(self, group_name):
        size = await self.redis.get(group_name)
        if size is None:
            return 0
        return int(size)

    async def _increment_group_size(self, group_name):
        await self.redis.incr(group_name)

    async def _increment_and_get_group_size(self, group_name):
        lua_script = """
        local size = redis.call('INCR', KEYS[1])
        return size
        """
        group_size = await self.redis.eval(lua_script, 1, group_name)
        return group_size

    async def _get_group_size(self, group_name):
        group_size = await self.redis.get(group_name)
        
        if group_size is None:
            return 0
        return int(group_size)
    
    async def _decrement_group_size(self, group_name):
        await self.redis.decr(group_name)

    async def _start_timeout(self, group_size, max_players):
        await asyncio.sleep(self.timeout)

        size = await self._get_group_size(group_size)
        # 타임아웃 시간 경과 후 그룹 크기 확인
        if self.isStart == False:
            await self.channel_layer.group_send(
                self.game_group,
                {
                    'type': 'disconnect_all'
                }
            )

    async def _game_start(self, message_data):
        if self.type == "tournament":
            await self._play_game_tournament(message_data)
        else:
            match = await self._make_game_object(message_data)
            if self.type == "2P":
                await self._play_game(match)
            elif self.type == "4P":
                await self._play_game_four(match)

    async def _make_game_object(self, message_data):
        await self._init_object(message_data)
        match = await self._get_object()
        await asyncio.sleep(1)
        return match

    async def _play_game(self, match):
        while not match.finished:
            await self._update_game(match)
            await self._send_state(match)
            await asyncio.sleep(0.05)
        await self._game_end(match)
        
    async def _accept_key(self, message_data):
        if self.position == "left" or self.position == "right":
            await self._move_bar_row(message_data, self.position)
        if self.position == "up" or self.position == "down":
            await self._move_bar_col(message_data, self.position)

    async def _move_bar_row(self, key, position):
        match = await self._get_object()
        player = getattr(match, f"{position}")

        if key == "up" and player.bar.y >= 0:
            player.bar._up()
        elif key == "down" and player.bar.y + match.map.height / 4 <= match.map.height:
            player.bar._down()

    async def _move_bar_col(self, key, position):
        match = await self._get_object()
        player = getattr(match, f"{position}")

        if key == "left" and player.bar.x >= 0:
            player.bar._left()
        elif key == "right" and player.bar.x + match.map.width / 4 <= match.map.width:
            player.bar._right()

    async def _update_game(self, match):
        match.ball.hit_wall(match.map)
        if match.is_left_win():
            match.plus_score("left_win")
            match.ball.reset(match.map)
        elif match.is_right_win():
            match.plus_score("right_win")
            match.ball.reset(match.map)
        if match.left.score == 5 or match.right.score == 5:
            match.finished = True
        match.ball.move()

    async def _send_state(self, match):
        data = {
            "ball": {
                "x": match.ball.x / match.map.width,
                "y": match.ball.y / match.map.height,
            },
            "left": {
                "x": match.left.bar.x / match.map.width,
                "y": match.left.bar.y / match.map.height,
                "score": match.left.score,
            },
            "right": {
                "x": match.right.bar.x / match.map.width,
                "y": match.right.bar.y / match.map.height,
                "score": match.right.score,
            },
        }
        logger.info(f"Sending in-game message: {data}")
        await self.channel_layer.group_send(self.game_group, {"type": "two_player", "data": data})

    async def _game_end(self, match):
        picture2 = None
        nickname2 = None

        if match.left.score + match.up.score == 5:
            nickname = match.left.nickname
            picture = match.left.picture
            winner_id = [user["id"] for user in self.user_info_list if user["position"] == "left"]
            loser_id = [user["id"] for user in self.user_info_list if user["position"] == "right"]
            if self.type == '4P':
                winner2_id = [user["id"] for user in self.user_info_list if user["position"] == "up"]
                loser2_id = [user["id"] for user in self.user_info_list if user["position"] == "down"]
                nickname2 = match.up.nickname
                picture2 = match.up.picture
        else:
            nickname = match.right.nickname
            picture = match.right.picture
            winner_id = [user["id"] for user in self.user_info_list if user["position"] == "right"]
            loser_id = [user["id"] for user in self.user_info_list if user["position"] == "left"]
            if self.type == '4P':
                winner2_id = [user["id"] for user in self.user_info_list if user["position"] == "down"]
                loser2_id = [user["id"] for user in self.user_info_list if user["position"] == "up"]
                nickname2 = match.down.nickname
                picture2 = match.down.picture

        # ORM 호출을 비동기적으로 변환
        game_log = await sync_to_async(GameLog.objects.create)(game_type=self.type)
        game_log.game_type = self.type
        await sync_to_async(game_log.players.add)(*winner_id)
        await sync_to_async(game_log.players.add)(*loser_id)
        await sync_to_async(game_log.winners.add)(*winner_id)
        await sync_to_async(game_log.losers.add)(*loser_id)

        winner = await sync_to_async(CustomUser.objects.get)(id=winner_id[0])#[0]
        winner.win += 1
        await sync_to_async(winner.save)()

        loser = await sync_to_async(CustomUser.objects.get)(id=loser_id[0])
        loser.lose += 1
        await sync_to_async(loser.save)()

        if self.type == '4P':
            await sync_to_async(game_log.players.add)(*winner2_id)
            await sync_to_async(game_log.players.add)(*loser2_id)
            await sync_to_async(game_log.winners.add)(*winner2_id)
            await sync_to_async(game_log.losers.add)(*loser2_id)
            winner2 = await sync_to_async(CustomUser.objects.get)(id=winner2_id[0])
            winner2.win += 1
            await sync_to_async(winner2.save)()

            loser2 = await sync_to_async(CustomUser.objects.get)(id=loser2_id[0])
            loser2.lose += 1
            await sync_to_async(loser2.save)()

        data = {
            "nickname": nickname,
            "picture": picture,
            "nickname2": nickname2,
            "picture2": picture2,
            "game_type": self.type,
        }
        await sync_to_async(game_log.save)()

        logger.info(f"Sending in-game message: {data}")
        await self.channel_layer.group_send(self.game_group, {"type": "game_end", "data": data})

    async def _play_game_four(self, match):
        while not match.finished:
            await self._update_game_four(match)
            await self._send_state_four(match)
            await asyncio.sleep(0.04)
        await self._game_end(match)

    async def _update_game_four(self, match):
        if match.is_left_win():
            match.plus_score("left_win")
            match.ball.reset(match.map)
        elif match.is_right_win():
            match.plus_score("right_win")
            match.ball.reset(match.map)
        elif match.is_up_win():
            match.plus_score("up_win")
            match.ball.reset(match.map)
        elif match.is_down_win():
            match.plus_score("down_win")
            match.ball.reset(match.map)
        if match.left.score + match.up.score == 5 or match.right.score + match.down.score == 5:
            match.finished = True
        match.ball.move()

    async def _send_state_four(self, match):
        data = {
            "ball": {
                "x": match.ball.x / match.map.width,
                "y": match.ball.y / match.map.height,
            },
            "left": {
                "x": match.left.bar.x / match.map.width,
                "y": match.left.bar.y / match.map.height,
                "score": match.left.score,
            },
            "right": {
                "x": match.right.bar.x / match.map.width,
                "y": match.right.bar.y / match.map.height,
                "score": match.right.score,
            },
            "up": {
                "x": match.up.bar.x / match.map.width,
                "y": match.up.bar.y / match.map.height,
                "score": match.up.score,
            },
            "down": {
                "x": match.down.bar.x / match.map.width,
                "y": match.down.bar.y / match.map.height,
                "score": match.down.score,
            },
        }
        logger.info(f"Sending in-game message: {data}")
        await self.channel_layer.group_send(self.game_group, {"type": "four_player", "data": data})

    async def _play_game_tournament(self, message_data):
        match = await self._make_game_object(message_data)
        while not match.finished:
            await self._update_game(match)
            await self._send_state(match)
            await asyncio.sleep(0.05)
        await self._game_end(match)

    async def _init_object(self, message_data):
        map_width = message_data["map_width"]
        map_height = message_data["map_height"]
        users = message_data["users"]
        setattr(self.Games, f"{self.game_group}", PingPongGame(map_width, map_height, users))
        return True

    async def _get_object(self):
        match_object = getattr(self.Games, f"{self.game_group}")
        return match_object

    async def close_connection(self, event):
        self.close()

    async def two_player(self, event):
        await self.send(text_data=json.dumps(event))

    async def four_player(self, event):
        await self.send(text_data=json.dumps(event))

    async def game_end(self, event):
        await self.send(text_data=json.dumps(event))

    async def url(self, event):
        await self.send(text_data=json.dumps(event))

    async def game_start(self, event):
        await self.send(text_data=json.dumps(event))

    async def disconnect_all(self, event):
        await self.send(text_data=json.dumps(event))