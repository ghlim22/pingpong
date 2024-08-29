/**
 * @param {WebSocket} sock
 * @param {string} game_type
 * @returns {Promise<void>}
 */
export default function OnlineGame(sock, game_type) {
  const $container = document.querySelector('.in-game');
  const $leftScore = document.querySelector('#leftScore');
  const $rightScore = document.querySelector('#rightScore');
  const ws = sock;
  let keyState = { up: false, down: false, left: false, right: false };
  let left, right, up, down, ball, canvas, ctx;

  let keyRepeatTimers = {
    up: null,
    down: null,
    left: null,
    right: null
  };

  // Promise를 반환하여 비동기 동작을 처리
  return new Promise((resolve) => {
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "two_player") {
        canvas.width = document.body.clientWidth;
        canvas.height = document.body.clientHeight;
        gameCanvas.style.width = `60vw`;
        gameCanvas.style.height = `76vh`;
        left.height = canvas.height / 4;
        left.width = canvas.width / 80;
        const gameData = data.data;
        left.x = gameData.left.x * canvas.width;
        left.y = gameData.left.y * canvas.height;
        right.x = gameData.right.x * canvas.width;
        right.y = gameData.right.y * canvas.height;
        left.score = gameData.left.score;
        right.score = gameData.right.score;
        ball.x = gameData.ball.x * canvas.width;
        ball.y = gameData.ball.y * canvas.height;
        ball.radius = right.width * (2 / 3);
        draw(left, right, ball);
      } else if (data.type === "four_player") {
        console.log('Parsed data:', data);
        canvas.width = Math.min(document.body.clientWidth, document.body.clientHeight);
        canvas.height = Math.min(document.body.clientWidth, document.body.clientHeight);
        //gameCanvas.style.width = `${canvas.width}px`;
        //gameCanvas.style.height = `${canvas.width}px`;
        gameCanvas.style.width = `76vh`;
        gameCanvas.style.height = `76vh`;
        left.height = canvas.height / 4;
        left.width = canvas.width / 80;
        up.width = canvas.width / 4;
        up.height = canvas.height / 80;
        const gameData = data.data;
        left.x = gameData.left.x * canvas.width;
        left.y = gameData.left.y * canvas.height;
        right.x = gameData.right.x * canvas.width;
        right.y = gameData.right.y * canvas.height;
        up.x = gameData.up.x * canvas.width;
        up.y = gameData.up.y * canvas.height;
        down.x = gameData.down.x * canvas.width;
        down.y = gameData.down.y * canvas.height;
        ball.x = gameData.ball.x * canvas.width;
        ball.y = gameData.ball.y * canvas.height;
        ball.radius = right.width * (2 / 3);
        draw_four(left, right, up, down, ball);
      } else if (data.type === "game_end" || data.type === "disconnect_all") {
        endGame(data, ws);
      } else if (data.type === "game_start") {
        startGame(ws, data);
      }
    };

    const init = async () => {
      console.log($container);
      console.log('this is game');
      console.log(ws);

      document.addEventListener("keydown", keyDownHandler);
      document.addEventListener("keyup", keyUpHandler);

      window.addEventListener("beforeunload", disconnectWebSocket);
      // canvas = $container.querySelector("#gameCanvas");
      canvas = document.querySelector("#gameCanvas");
      ctx = canvas.getContext("2d");
      canvas.width = Math.min(document.body.clientWidth, document.body.clientHeight);
      canvas.height = Math.min(document.body.clientWidth, document.body.clientHeight);
      if (game_type === '4P') {
        canvas.width = canvas.height;
        up = { x: canvas.width / 2, y: 0, width: 300, height: 10, score: 0};
        down = { x: canvas.width / 2, y: canvas.height - 10, width: 300, height: 10, score: 0};
      }
      left = { x: 0, y: canvas.height / 2, width: 10, height: 300, score: 0};
      right = { x: canvas.width - 10, y: canvas.height / 2, width: 10, height: 300, score: 0};
      ball = { x: canvas.width / 2, y: canvas.height / 2, radius: 10 };
    };

    ws.onopen = () => {
      console.log('WebSocket is connected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = (event) => {
      console.log('WebSocket connection closed:', event);
    };

    const disconnectWebSocket = () => {
      if (ws) {
        ws.close();
      }
    };

    const keyDownHandler = (e) => {
      if (e.key === "ArrowUp") {
        if (!keyState.up) {
          keyState.up = true;
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "keyboard", data: "up" }));
          }
          keyRepeatTimers.up = setInterval(() => {
            if (keyState.up && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "keyboard", data: "up" }));
            }
          }, 50);
        }
      } else if (e.key === "ArrowDown") {
        if (!keyState.down) {
          keyState.down = true;
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "keyboard", data: "down" }));
          }
          keyRepeatTimers.down = setInterval(() => {
            if (keyState.down && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "keyboard", data: "down" }));
            }
          }, 50);
        }
      } else if (e.key === "ArrowLeft") {
        if (!keyState.left) {
          keyState.left = true;
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "keyboard", data: "left" }));
          }
          keyRepeatTimers.left = setInterval(() => {
            if (keyState.left && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "keyboard", data: "left" }));
            }
          }, 50);
        }
      } else if (e.key === "ArrowRight") {
        if (!keyState.right) {
          keyState.right = true;
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "keyboard", data: "right" }));
          }
          keyRepeatTimers.right = setInterval(() => {
            if (keyState.right && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "keyboard", data: "right" }));
            }
          }, 50);
        }
      }
    };

    const keyUpHandler = (e) => {
      if (e.key === "ArrowUp") {
        if (keyState.up) {
          keyState.up = false;
          clearInterval(keyRepeatTimers.up);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "keyboard", data: "up" }));
          }
        }
      } else if (e.key === "ArrowDown") {
        if (keyState.down) {
          keyState.down = false;
          clearInterval(keyRepeatTimers.down);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "keyboard", data: "down" }));
          }
        }
      } else if (e.key === "ArrowLeft") {
        if (keyState.left) {
          keyState.left = false;
          clearInterval(keyRepeatTimers.left);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "keyboard", data: "left" }));
          }
        }
      } else if (e.key === "ArrowRight") {
        if (keyState.right) {
          keyState.right = false;
          clearInterval(keyRepeatTimers.right);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "keyboard", data: "right" }));
          }
        }
      }
    };

    function draw(left, right, ball) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#FFCCCC";
      ctx.fillRect(left.x, left.y, left.width, left.height);

      ctx.fillStyle = "#F9E5B1";
      ctx.fillRect(right.x, right.y, left.width, left.height);

      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, true);
      ctx.fillStyle = "#000000";
      ctx.fill();
	  $leftScore.innerText = left.score;
	  $rightScore.innerText = right.score;
    //  ctx.strokeStyle = 'black';
    //  ctx.lineWidth = 5;
    //  ctx.strokeRect(0, 0, canvas.width, canvas.height);
    }

    function draw_four(left, right, up, down, ball) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#FFCCCC";
      ctx.fillRect(left.x, left.y, left.width, left.height);

      ctx.fillStyle = "#F9E5B1";
      ctx.fillRect(right.x, right.y, left.width, left.height);

      ctx.fillStyle = "#D9F9C5";
      ctx.fillRect(up.x, up.y, up.width, up.height);

      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(down.x, down.y, up.width, up.height);

      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, true);
      ctx.fillStyle = "#000000";
      ctx.fill();
    //  ctx.strokeStyle = 'black';
    //  ctx.lineWidth = 5;
    //  ctx.strokeRect(0, 0, canvas.width, canvas.height);
    }

    init();

    function startGame(ws, info) {
      const left_img = document.querySelector('.user-profile-1p .image-profile-small img');
      const right_img = document.querySelector('.user-profile-2p .image-profile-small img');
      const left_nick = document.querySelector('.user-profile-1p span');
      const right_nick = document.querySelector('.user-profile-2p span');
      
      let up_img, down_img, up_nick, down_nick;

      if (game_type == "4P")
      {
        up_img = document.querySelector('.user-profile-3p .image-profile-small img');
        down_img = document.querySelector('.user-profile-4p .image-profile-small img');
        up_nick = document.querySelector('.user-profile-3p span');
        down_nick = document.querySelector('.user-profile-4p span');
      }

      for (const element of info.user_info){
        if (element.position == 'left'){
          left_img.src = element.picture;
          left_nick.innerHTML = element.nickname;
        }
        else if (element.position == 'right'){
          right_img.src = element.picture;
          right_nick.innerHTML = element.nickname;
        }
        else if (element.position == 'up'){
          up_img.src = element.picture;
          up_nick.innerHTML = element.nickname;
        }
        else if (element.position == 'down'){
          down_img.src = element.picture;
          down_nick.innerHTML = element.nickname;
        }
      }
      ws.send(
        JSON.stringify({
          type: "start",
          data: {
            map_width: canvas.width,
            map_height: canvas.height,
            users: info.user_info,
          },
        }),
      );
    }

    function endGame(data, ws) {
		if (ws) {
		    resolve(data); // 게임 종료 후 Promise를 완료 상태로 설정
        ws.close();
      }
    }
  });
}