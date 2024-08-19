import { appState, basePath, TUserInfo, TInvite, TFold, navigate, parseUrl } from '../../index.js';
import OnlineGame from "./game.js";

export function game_queue(type, token) {
  return new Promise((resolve, reject) => {
    let ws = new WebSocket(`wss://localhost/wss/games/rankgames/${type}/?token=${token}`);
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        ws.close(); 
        console.log('on message', data.data);
        resolve(data.data);
    };
    
    ws.onerror = (error) => {
        ws.close();
        reject(error);
    };
  });
}

export function play_game(info, type, token) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`wss://localhost/wss/games/start/${info.game_id}/${type}/?token=${token}`);
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


// const sock = new WebSocket(`ws://localhost:8000/ws/games/start/${data.game_id}/${type}/`);
//       OnlineGame(sock, type);
