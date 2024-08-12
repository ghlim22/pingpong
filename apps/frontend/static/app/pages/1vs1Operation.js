import { appState, basePath, TUserInfo, TInvite, TFold, navigate, parseUrl } from '../../index.js';

export function game_queue(type) {
    let ws = new WebSocket(`ws://localhost:8000/ws/rankgames/${type}/`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      ws.close();
    };
    console.log('make queue');
    return (data);
}

export function play_game(data, type) {
    const sock = new WebSocket(`ws://localhost:8000/ws/games/start/${data.game_id}/${type}/`);
    OnlineGame(sock, type);
}


// const sock = new WebSocket(`ws://localhost:8000/ws/games/start/${data.game_id}/${type}/`);
//       OnlineGame(sock, type);
