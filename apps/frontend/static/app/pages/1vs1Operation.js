
import { appState, basePath, TUserInfo, TInvite, TFold, navigate, parseUrl} from '/index.js';
import OnlineGame from "/app/pages/game.js";
import config from "/config/config.js";

const { SERVER_ADDR } = config;

export function game_queue(type, token) {
  return new Promise((resolve, reject) => {

    let ws = new WebSocket(`wss://${SERVER_ADDR}/wss/games/rankgames/${type}/?token=${token}`);
    appState.inQueue = true;
    console.log("appState.tour_ws", appState.tour_ws);
    if (type !== "2P" && type !== "4P" && appState.tour_ws !== null){
      appState.tour_ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("data.count", data.count);
        if (data.type === 'client_count')
        {
          if (data.count == 1)
          {
            alert("Someone has disconnected");
            if (appState.tour_ws && appState.tour_ws.readyState === WebSocket.OPEN){
              appState.tour_ws.close();
              appState.tour_ws = null;
            }
            appState.inQueue = false;
          }
        }
      }
      logPeriodically();
      // navigate(parseUrl(basePath));
	}

    appState.currentCleanupFn = () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
	  if (appState.tour_ws && appState.tour_ws.readyState === WebSocket.OPEN){
        appState.tour_ws.close();
        appState.tour_ws = null;
      }
      appState.inQueue = false;
      // navigate(parseUrl(basePath));
    };
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        ws.close(); 
        if (appState.tour_ws && appState.tour_ws.readyState === WebSocket.OPEN){
          appState.tour_ws.close();
          appState.tour_ws = null;
        }
        console.log('on message', data.data);
        resolve(data.data);
    };

    ws.onerror = (error) => {
        ws.close();
        appState.inQueue = false;
        reject(error);
    };

  });
}

export function play_game(info, type, token) {
  return new Promise((resolve, reject) => {
    
    console.log("appState.inQueue", appState.inQueue)
    const ws = new WebSocket(`wss://${SERVER_ADDR}/wss/games/start/${info.game_id}/${type}/?token=${token}`);

    appState.currentCleanupFn = () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
      if (appState.tour_ws && appState.tour_ws.readyState === WebSocket.OPEN){
        appState.tour_ws.close();
        appState.tour_ws = null;
      }
      // navigate(parseUrl(basePath));
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function logPeriodically() {
  while (appState.tour_ws && appState.tour_ws.readyState === WebSocket.OPEN) {
      appState.tour_ws.send(JSON.stringify({ type: "get_client_count"}));
      await sleep(3000); // 1초 대기
    }
}

