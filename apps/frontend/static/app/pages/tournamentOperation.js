import { appState, basePath, TUserInfo, TInvite, TFold, navigate, parseUrl, TBlock } from '../../index.js';
import OnlineGame from "./game.js";

export function play_tour_game(info, type, token) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`wss://localhost/wss/games/start/${info.game_id}/${type}/?token=${token}`);
      appState.currentCleanupFn = () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
        navigate(parseUrl(basePath));
      };
      OnlineGame(ws, type)
      .then((data) => {
        console.log('Received data:', data);
        resolve(data)
      })
      .catch((error) => {
        console.error('Error fetching game queue:', error);
        reject(error);
      });
    });
  }

export function tournament_game_queue(type, token) {
    return new Promise((resolve, reject) => {
      let ws = new WebSocket(`wss://localhost/wss/games/rankgames/${type}/?token=${token}`);
      
      const objects = [
        '.tournament-room-in .player1',
        '.tournament-room-in .player2',
        '.tournament-room-in .player3',
        '.tournament-room-in .player4',
      ];
      
      appState.currentCleanupFn = () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
        navigate(parseUrl(basePath));
      };
  
      ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log('on message', data);
          if (data.type === "update")
            populateUserInfo(data.users, objects);
          if (data.type === "create")
          {
            ws.close();
            resolve(data.data);
          }
      };
      
      ws.onerror = (error) => {
          ws.close();
          reject(error);
      };
    });
  }
  // const sock = new WebSocket(`ws://localhost:8000/ws/games/start/${data.game_id}/${type}/`);
  //       OnlineGame(sock, type);
  export function populateUserInfo(user_info_list, select_objects) {
      // 사용자 정보의 수에 따라 선택할 요소의 수를 결정합니다.
      const objects = select_objects.slice(0, 4).map(selector => document.querySelector(selector));
      console.log(user_info_list[0].picture);
      console.log(user_info_list[0].nickname);

      console.log(objects[0] instanceof TBlock);  
      
      for(let i = 0; i < 4;++i)
        objects[i].resetImageNick();
      
      user_info_list.forEach((user_info, index) => {
        // 이미지와 이름 요소를 가져와서, 해당 사용자 정보를 적용합니다.
        // console.log(index);  
          if (objects[index]) {
              objects[index].setImageNick(user_info.picture, user_info.nickname);
          }
      });
    }