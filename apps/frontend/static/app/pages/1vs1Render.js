import { appState, disconnect_ws, basePath, TUserInfo, TInvite, TFold, navigate, parseUrl } from '/index.js';
import { game_queue, play_game } from '/app/pages/1vs1Operation.js'
import { matchOrderPage } from '/app/pages/tournamentRender.js'
const matchHTML = `
<div class="match-1vs1">
	<div class="image-profile-middle" id="mine">
		<img src="/assets/default-picture.png">
	</div>
	<span id="mySpan">nickname</span>
</div>
<div class="match-1vs1">
	<div class="image-profile-middle" id="opponent">
		<img src="/assets/default-picture.png">
	</div>
	<span id="opponentSpan">Wait Please</span>
</div>
`;

const mainHTML = `
<div class="in-game">
	<canvas id="gameCanvas"></canvas>
</div>
`;

const leftSideHTML = `
<div></div>
<div></div>
<div></div>
`;

const rightSideHTML = `
<div></div>
<div>
</div>
<div></div>
`;

const topHTML = `
<div class="user-profile-1p">
	<span>nickname</span>
	<div class="image-profile-small">
		<img src="/assets/default-picture.png">
	</div>
</div>
<div class="user-profile-2p">
	<div class="image-profile-small">
		<img src="/assets/default-picture.png">
	</div>
	<span>nickname</span>
</div>
`;

const bottomHTML = `
<span id='leftScore'>0</span>
<span id='rightScore'>0</span>
`;

const resultHTML = `
<div class="result-1vs1">
	<span>WINNER</span>
	<div class="image-profile-large">
		<img src="/assets/default-picture.png">
	</div>
	<span>nickname</span>
</div>
`;

let timerId;

export function pong1VS1Page() {

	if (appState.isMain === false) {
		navigate(parseUrl(basePath));
	}
	else {
		appState.isMain = false;
		sessionStorage.setItem('appState', JSON.stringify(appState));

		const above = document.getElementById('above');
		above.innerHTML = matchHTML;
	
		const img = document.querySelector('.match-1vs1 #mine img');
		const nickname = document.querySelector('.match-1vs1 #mySpan');
		const img_opponent = document.querySelector('.match-1vs1 #opponent img');
		const nickname_opponent = document.querySelector('.match-1vs1 #opponentSpan');
	
		above.classList.add('above-on');
		if (appState.picture !== null)
			img.src = appState.picture;
		nickname.innerHTML = appState.nickname;
		
	game_queue("2P", appState.token)
    .then((data) => {
		if (data == null) {
			return ;
		} else {
			for (const element of data.user_info)
				if (element.nickname != appState.nickname) {
				img_opponent.src = element.picture;
				nickname_opponent.innerHTML = element.nickname;
				}
			setTimeout(() => { game1vs1Page(data) } , 5000); //시간 설정이 안됨
		}
    })
    .catch((error) => {
      console.error('Error fetching game queue:', error);
    });
	}
}

export function game1vs1Page(info) {
    if (appState.in_game_id != info.game_id && appState.in_game_id != info.game_id2){
      return ;
    }

	const above = document.getElementById('above');
	const left = document.getElementById('left-side');
	const right = document.getElementById('right-side');
	const top = document.getElementById('top');
	const main = document.getElementById('main');
	const bottom = document.getElementById('bottom');

	above.classList.remove('above-on');
	left.classList.add('ingame');
	right.classList.add('ingame');
	main.classList.add('ingame');
	top.classList.add('ingame');
	left.innerHTML = leftSideHTML;
	right.innerHTML = rightSideHTML;
	main.innerHTML = mainHTML;
	top.innerHTML = topHTML;
	bottom.innerHTML = bottomHTML;
	//document.querySelector('#right-side.ingame div img').addEventListener('click', handleQuitGame);

	play_game(info, "2P", appState.token)
    .then((data) => {
	  if (data.type === "disconnect_me") {
		if (appState.in_game_id != undefined && appState.in_game_id) {
			if (appState.in_game_id) {
				alert("Someone has disconnected");
				navigate(parseUrl(basePath));
			}
	  	}
	  } else if (info.game_id2 === 'false' || appState.nickname !== data.data.nickname) {
		disconnect_ws(appState.tour_ws);
      	gameResultPage(data.data);
	  } else {
		tournamentLastGame(info.game_id3);
	  }
    })
    .catch((error) => {
      console.error('Error fetching game queue:', error);
    });
}

export function tournamentLastGame(game_id) {
	const above = document.getElementById('above');
	above.innerHTML = matchHTML;

	const img = document.querySelector('.match-1vs1 #mine img');
	const img_opponent = document.querySelector('.match-1vs1 #opponent img');
	const nickname = document.querySelector('.match-1vs1 #mySpan');
	const nickname_opponent = document.querySelector('.match-1vs1 #opponentSpan');

	above.classList.add('above-on');
	if (appState.picture !== null)
		img.src = appState.picture;
	nickname.innerHTML = appState.nickname;
	
	game_queue(game_id, appState.token)
    .then((data) => {
	  if (!data)
		return ;
	  for (const element of data.user_info)
		if (element.nickname != appState.nickname){
		  img_opponent.src = element.picture;
		  nickname_opponent.innerHTML = element.nickname;
		}
	  setTimeout(() => { game1vs1Page(data) } , 5000); //시간 설정이 안됨
    })
    .catch((error) => {
      console.error('Error fetching game queue:', error);
    });
}

function gameResultPage(data) {
	const above = document.getElementById('above');
	above.innerHTML = resultHTML;
	
	const img = document.querySelector('.result-1vs1 .image-profile-large img');
	const nickname = document.querySelector('.result-1vs1 span:nth-of-type(2)');
	
	above.classList.add('above-on');
	if (data.picture !== null)
		img.src = data.picture;
	nickname.innerHTML = data.nickname;
	setTimeout(handleQuitGame, 2500);
}

function handleQuitGame() {
	clearTimeout(timerId);
	navigate(parseUrl(basePath))
}
