import { appState, basePath, TUserInfo, TInvite, TFold, navigate, parseUrl } from '../../index.js';
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
        't-block[id="1p"]',
        't-block[id="2p"]',
        't-block[id="3p"]',
        't-block[id="4p"]',
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
          populateUserInfo(data.users, objects);
          if (data.type === "create")
            resolve(data.data);
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
      const userCount = user_info_list.length;
      console.log(document.querySelector('t-block[id="1p"]'));
      const objects = select_objects.slice(0, userCount).map(selector => document.querySelector(selector));
      console.log(objects);
      
      // user_info_list의 각 사용자 정보를 요소에 적용합니다.
      user_info_list.forEach((user_info, index) => {
          // 이미지와 이름 요소를 가져와서, 해당 사용자 정보를 적용합니다.
          if (objects[index]) {
              objects[index].setImageNick(user_info,picture, user_info.nickname);
          }
      });
    }