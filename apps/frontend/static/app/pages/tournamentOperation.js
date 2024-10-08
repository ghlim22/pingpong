import { appState, disconnect_ws, basePath, TUserInfo, TInvite, TFold, navigate, parseUrl, TBlock } from '/index.js';
import OnlineGame from "/app/pages/game.js";
import config from "/config/config.js";

const { SERVER_ADDR } = config;

export function tournament_game_queue(type, token) {
  return new Promise((resolve, reject) => {
    let ws = new WebSocket(`wss://${SERVER_ADDR}/wss/games/queue/${type}/?token=${token}`);
    const objects = [
      '.tournament-room-in .player1',
      '.tournament-room-in .player2',
      '.tournament-room-in .player3',
      '.tournament-room-in .player4',
    ];
    
    appState.currentCleanupFn = () => {
      disconnect_ws(ws);
      disconnect_ws(appState.tour_ws);
      appState.inTournament = false;
      appState.in_game_id = null;
      // navigate(parseUrl(basePath));
    };

    document.querySelector('.logo-small').addEventListener('click', () => {
      appState.inTournament = false;
      disconnect_ws(ws);
      disconnect_ws(appState.tour_ws);
      navigate(parseUrl(basePath));
    });

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "update")
          populateUserInfo(data.users, objects);
        else if (data.type === "create")
        {
          appState.in_game_id = data.data.game_id;
          disconnect_ws(ws);
          resolve(data.data);
        }
    };
      
    ws.onerror = (error) => {
      disconnect_ws(ws);
      reject(error);
    };
  });
}

// export function tournament_game_queue(type, token) {
//   return new Promise((resolve, reject) => {
//     let ws = new WebSocket(`wss://${SERVER_ADDR}/wss/games/queue/${type}/?token=${token}`);
    
//   document.querySelector('.logo-small').addEventListener('click', () => {
//   appState.inTournament = false;
//   navigate(parseUrl(basePath));
//   ws.close();
// });

//     const objects = [
//       '.tournament-room-in .player1',
//       '.tournament-room-in .player2',
//       '.tournament-room-in .player3',
//       '.tournament-room-in .player4',
//     ];
    
//     appState.currentCleanupFn = () => {
//       if (ws.readyState === WebSocket.OPEN) {
//         ws.close();
//       }
//   appState.inTournament = false;
//       navigate(parseUrl(basePath));
//     };

//     ws.onmessage = (event) => {
//         const data = JSON.parse(event.data);
//         console.log('on message', data);
//         if (data.type === "update")
//           populateUserInfo(data.users, objects);
//         else if (data.type === "create")
//         {
//           ws.close();
//           resolve(data.data);
//         }
//         else if (data.type === "close_connection")
//         {
//           ws.close();
//           resolve(data);
//         }
//     };
    
//     ws.onerror = (error) => {
//         ws.close();
//         reject(error);
//     };
//   });
// }
  // const sock = new WebSocket(`ws://${SERVER_ADDR}:8000/ws/games/start/${data.game_id}/${type}/`);
  //       OnlineGame(sock, type);
  export function populateUserInfo(user_info_list, select_objects) {
    // 사용자 정보의 수에 따라 선택할 요소의 수를 결정합니다.
    const objects = select_objects.slice(0, 4).map(selector => document.querySelector(selector));

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

