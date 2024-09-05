import { appState, disconnect_ws, basePath, TUserInfo, TInvite, TFold, navigate, parseUrl } from '/index.js';
import OnlineGame from "/app/pages/game.js";
import config from "/config/config.js";

const { SERVER_ADDR } = config;

export function game_queue(type, token) {
  return new Promise((resolve, reject) => {
    let ws = new WebSocket(`wss://${SERVER_ADDR}/wss/games/queue/${type}/?token=${token}`);

    if (appState.tour_ws && appState.tour_ws.readyState === WebSocket.OPEN) {
      appState.tour_ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'client_count') {
          if (data.count == 1) {
            alert("Someone has disconnected");
            disconnect_ws(ws);
            disconnect_ws(appState.tour_ws);
            navigate(parseUrl(basePath));
            resolve(null);
          }
        }
      }
      logPeriodically();
    }

    appState.currentCleanupFn = () => {
      disconnect_ws(ws);
      disconnect_ws(appState.tour_ws);
      appState.in_game_id = null;
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      appState.in_game_id = data.data.game_id;
      disconnect_ws(ws);
      disconnect_ws(appState.tour_ws);
      resolve(data.data);
    };
    
    ws.onerror = (error) => {
      disconnect_ws(ws);
      reject(error);
    };
  });
}

export function play_game(info, type, token) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`wss://${SERVER_ADDR}/wss/games/start/${info.game_id}/${type}/?token=${token}`);
    if (info.game_id2 !== "false") {
      appState.tour_ws = new WebSocket(`wss://${SERVER_ADDR}/wss/games/tour/${info.game_id3}/?token=${token}`);
    }

    let timeoutHandle;
    
    appState.currentCleanupFn = () => {
      disconnect_ws(ws);
      disconnect_ws(appState.tour_ws);
      appState.in_game_id = null;
    };

    timeoutHandle = setTimeout(() => {
      disconnect_ws(ws);
      disconnect_ws(appState.tour_ws);
      resolve({ type: "disconnect_me" });
    }, 10000);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "disconnect_me") {
        disconnect_ws(ws);
        disconnect_ws(appState.tour_ws);
        resolve(data);
      } else if (data.type === "game_start") {
        clearTimeout(timeoutHandle);
        OnlineGame(ws, type, data)
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          console.error('Error fetching game queue:', error);
          reject(error);
        });
      }
    };
    
    ws.onerror = (error) => {
      console.error('play_game_ws error:', error);
      disconnect_ws(appState.tour_ws);
      reject(error);
    };

  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function logPeriodically() {
  while (1) {
    if (appState.tour_ws && appState.tour_ws.readyState === WebSocket.OPEN){
      appState.tour_ws.send(JSON.stringify({ type: "get_client_count"}));
    }
      await sleep(3000);
  }
}