import { appState, basePath, TUserInfo, TInvite, TFold, navigate, parseUrl } from '/index.js';
import OnlineGame from "/app/pages/game.js";
import config from "../../config/config.js";

const { SERVER_ADDR } = config;

export function game_queue(type, token) {
  return new Promise((resolve, reject) => {
    console.log(type);
    console.log("token", token);

    let ws = new WebSocket(`wss://${SERVER_ADDR}/wss/games/rankgames/${type}/?token=${token}`);
    
    appState.currentCleanupFn = () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
      navigate(parseUrl(basePath));
    };
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
    const ws = new WebSocket(`wss://${SERVER_ADDR}/wss/games/start/${info.game_id}/${type}/?token=${token}`);
    appState.currentCleanupFn = () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
      navigate(parseUrl(basePath));
    };
    OnlineGame(ws, type)
    .then((data) => {
      console.log('Received data:', data.data);
      resolve(data)
    })
    .catch((error) => {
      console.error('Error fetching game queue:', error);
      reject(error);
    });
  });
}
