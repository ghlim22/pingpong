import { appState, basePath, TUserInfo, TInvite, TFold, navigate, parseUrl, TBlock} from '/index.js';
import OnlineGame from "/app/pages/game.js";
import config from "/config/config.js";

const { SERVER_ADDR } = config;

export function tournament_game_queue(type, token) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`wss://${SERVER_ADDR}/wss/games/rankgames/${type}/?token=${token}`);
    appState.inQueue = true;

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

      if (appState.tour_ws && appState.tour_ws.readyState === WebSocket.OPEN){
        appState.tour_ws.close();
        appState.tour_ws = null;
      }
      appState.inQueue = false;
      appState.inTournament = false;
      // navigate(parseUrl(basePath));
    };


	document.querySelector('.logo-small').addEventListener('click', () => {
		if (ws.readyState === WebSocket.OPEN) {
			ws.close();
		}
		appState.inTournament = false;
    appState.inQueue = false;
		navigate(parseUrl({
			pathname: '/',
			search: ""
		}));
	});


    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "update")
          populateUserInfo(data.users, objects);
        else if (data.type === "create")
        {
          ws.close();
          resolve(data.data);
        }
        else if (data.type === "close_connection")
        {
          ws.close();
          appState.inQueue = false;
          resolve(data);
        }
    };
      
    ws.onerror = (error) => {
        ws.close();
        reject(error);
    };
  });
}

// export function tournament_game_queue(type, token) {
//   return new Promise((resolve, reject) => {
//     let ws = new WebSocket(`wss://localhost/wss/games/rankgames/${type}/?token=${token}`);
    
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
  // const sock = new WebSocket(`ws://localhost:8000/ws/games/start/${data.game_id}/${type}/`);
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
