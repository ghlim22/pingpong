import { appState, basePath, TUserInfo, TInvite, TFold, navigate, parseUrl } from '../../index.js';

export function game_queue(type) {
  return new Promise((resolve, reject) => {
    let ws = new WebSocket(`ws://localhost:8000/ws/rankgames/${type}/`);
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        ws.close();
        resolve(data);
    };
    
    ws.onerror = (error) => {
        ws.close();
        reject(error);
    };
    
    console.log('make queue');
  });
}

export async function play_game(data, type) {
    const ws = new WebSocket(`ws://localhost:8000/ws/games/start/${data.game_id}/${type}/`);
    await OnlineGame(ws, type);
}


// const sock = new WebSocket(`ws://localhost:8000/ws/games/start/${data.game_id}/${type}/`);
//       OnlineGame(sock, type);
