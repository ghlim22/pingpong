import OnlineGame from "./game.js";
import config from "../../config/config.js";

const { SERVER_ADDR } = config;

function init() {
  let wss = null;

  const button2P = document.getElementById('2P');
  const button4P = document.getElementById('4P');
  const buttonTournament = document.getElementById('tournament');
  const gameCanvas = document.getElementById('gameCanvas');
  let type = null;

  button2P.addEventListener('click', () => {
    console.log('2P');
    type = '2P';
    wss = new WebSocket(`wss://${SERVER_ADDR}/wss/games/rankgames/${type}/`);
    wss.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const sock = new WebSocket(`wss://${SERVER_ADDR}/wss/games/start/${data.game_id}/${type}/`);
      wss.close();
      OnlineGame(sock, type);
      button2P.style.display = 'none';
      button4P.style.display = 'none';
      buttonTournament.style.display = 'none';
      // Make gameCanvas a square based on height
    };
  });

  button4P.addEventListener('click', () => {
    console.log('4P');
    type = '4P';
    wss = new WebSocket(`wss/rankgames/${type}/`);

    wss.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const sock = new WebSocket(`wss/games/start/${data.game_id}/${type}/`);
      wss.close();
      OnlineGame(sock, type);
      button2P.style.display = 'none';
      button4P.style.display = 'none';
      buttonTournament.style.display = 'none';
    };
  });

  buttonTournament.addEventListener('click', () => {
    console.log('토너먼트');
    type = 'tournament';
    wss = new WebSocket(`wss/rankgames/${type}/`);

    wss.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const sock = new WebSocket(`wss/games/start/${data.game_id}/${type}/`);
      wss.close();
      OnlineGame(sock, type);
      button2P.style.display = 'none';
      button4P.style.display = 'none';
      buttonTournament.style.display = 'none';
    };
  });
}

init();
