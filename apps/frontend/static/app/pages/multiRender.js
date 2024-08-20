import { appState, TUserInfo, TInvite, TFold, navigate, parseUrl, basePath } from '../../index.js';
import { game_queue, play_game } from './1vs1Operation.js'
const matchHTML = `
<div class="match-multi">
	<div class="image-profile-middle">
		<img src="./assets/default-picture.png">
	</div>
	<span>nickname</span>
</div>
<div class="match-multi">
	<div class="image-profile-middle" id="opponent1">
		<img src="./assets/default-picture.png">
	</div>
	<span id="opponentSpan1">Wait Please</span>
</div>
<div class="match-multi">
	<div class="image-profile-middle" id="opponent2">
		<img src="./assets/default-picture.png">
	</div>
	<span id="opponentSpan2">Wait Please</span>
</div>
<div class="match-multi">
	<div class="image-profile-middle" id="opponent3">
		<img src="./assets/default-picture.png">
	</div>
	<span id="opponentSpan3">Wait Please</span>
</div>
`;

const leftSideHTML = `
<div class="user-profile-1p">
	<div class="image-profile-small">
		<img src="./assets/default-picture.png">
	</div>
	<span>nickname</span>
	<span>♥♥♥♥♥</span>
</div>
<div></div>
<div class="user-profile-4p">
	<div class="image-profile-small">
		<img src="./assets/default-picture.png">
	</div>
	<span>nickname</span>
	<span>♥♥♥♥</span>
</div>
`;

const rightSideHTML = `
<div class="user-profile-3p">
	<div class="image-profile-small">
		<img src="./assets/default-picture.png">
	</div>
	<span>nickname</span>
	<span>♥♥♥</span>
</div>
<div>
	<img src="./assets/g-button-quit.svg">
</div>
<div class="user-profile-2p">
	<div class="image-profile-small">
		<img src="./assets/default-picture.png">
	</div>
	<span>nickname</span>
	<span>♥♥</span>
</div>
`;

const mainHTML = `
<div class="in-game">
	<canvas id="gameCanvas"></canvas>
</div>
`;

const topHTML = `
`;

const bottomHTML = `
`;

const resultHTML = `
<div class="result-multi">
	<span>WINNER</span>
	<div class="image-profile-large" id="winner">
		<img src="./assets/default-picture.png">
	</div>
	<span id="winnerNick">nickname</span>
	<div class="image-profile-large" id="winner2">
		<img src="./assets/default-picture.png">
	</div>
	<span id="winner2Nick">nickname</span>
</div>
`;

let timerId;

export function pongMultiPage() {
	const above = document.getElementById('above');
	above.innerHTML = matchHTML;

	const img_opponent1 = document.querySelector('.match-multi #opponent1 img');
	const img_opponent2 = document.querySelector('.match-multi #opponent2 img'); 
	const img_opponent3 = document.querySelector('.match-multi #opponent3 img');
	const nickname_opponent1 = document.querySelector('.match-multi #opponentSpan1');
	const nickname_opponent2 = document.querySelector('.match-multi #opponentSpan2');
	const nickname_opponent3 = document.querySelector('.match-multi #opponentSpan3');

	const img_opponents = [ img_opponent1, img_opponent2, img_opponent3 ];
	const nickname_opponents = [ nickname_opponent1, nickname_opponent2, nickname_opponent3 ];
	const img = document.querySelector('.match-multi .image-profile-middle img');
	const nickname = document.querySelector('.match-multi span');
	
	above.classList.add('above-on');
	if (appState.picture !== null)
		img.src = appState.picture;
	nickname.innerHTML = appState.nickname;
	
	game_queue('4P', appState.token)
	.then((data) => {
	console.log('Received data:', data);
	  let index = 0;
	  for (const element of data.user_info) {
		if (element.nickname != appState.nickname) {
			img_opponents[index].src = element.picture;
			nickname_opponents[index].innerHTML = element.nickname;
			index++;
		}
	  }
	  setTimeout(() => { gameMultiPage(data) } , 5000); //시간 설정이 안됨
    })
    .catch((error) => {
      console.error('Error fetching game queue:', error);
    });
	// setTimeout(gameMultiPage, 1000);
	// jikang2:	임시로 0.5초 뒤에 gameMultiPage() 가 실행되도록 설정해둠.
	//			위 구문 주석처리하고,
	//			이 부분에서 gameMultiPage(*MATCH*());
	//			*MATCH* = multiOperation.js의 match하는 함수,
	//			ex)	현재 유저의 토큰을 받아서 Multi 대기큐에 넣은 후,
	//				match 되면 data {현재유저 포지션, 팀원 nick, 팀원 img, 적1 nick, 적1 img, 적2 nick, 적2 img} 반환

	//gameMultiPage(*MATCH*());
}

function gameMultiPage(data) {
	const above = document.getElementById('above');
	const left = document.getElementById('left-side');
	const right = document.getElementById('right-side');
	const top = document.getElementById('top');
	const main = document.getElementById('main');
	const bottom = document.getElementById('bottom');
	const center = document.getElementById('center');

	above.classList.remove('above-on');
	main.classList.add('ingame');
	left.classList.add('ingame');
	right.classList.add('ingame');
	left.classList.add('multi');
	right.classList.add('multi');
	center.classList.add('multi');
	left.innerHTML = leftSideHTML;
	right.innerHTML = rightSideHTML;
	main.innerHTML = mainHTML;
	top.innerHTML = topHTML;
	bottom.innerHTML = bottomHTML;

	document.querySelector('#right-side.ingame div img').addEventListener('click', handleQuitGame);
	play_game(data, '4P', appState.token)
    .then((data) => {
      console.log('Received data:', data);

      gameResultPage(data);
    })
    .catch((error) => {
      console.error('Error fetching game queue:', error);
    });
	//timerId = setTimeout(gameResultPage, 3000);
	// jikang2:	임시로 3초 뒤에 gameResultPage() 가 실행되도록 설정해둠.
	//			위 구문 주석처리하고,
	//			이 부분에서 gameResultPage(*GAME*());
	//			이 부분에서 multiOperation.js의 game 함수 실행,
	//			ex)	game 종료 시 gamelog 를 db에 넣은 후, gameResultPage(승자정보{nick, img});

	//			game 종료 조건 ...
}

function handleQuitGame() {
	clearTimeout(timerId);
	navigate(parseUrl(basePath))
}

function gameResultPage(data) {
	const above = document.getElementById('above');
	above.innerHTML = resultHTML;

	const img = document.querySelector('.result-multi #winner img');
	const nickname = document.querySelector('.result-multi #winnerNick');
	const img2 = document.querySelector('.result-multi #winner2 img');
	const nickname2 = document.querySelector('.result-multi #winner2Nick');

	above.classList.add('above-on');
	if (data.picture !== null)
		img.src = data.picture;
	nickname.innerHTML = data.nickname;
	if (data.picture2 !== null)
		img2.src = data.picture2;
	nickname2.innerHTML = data.nickname2;
	setTimeout(handleQuitGame, 2500);
}
