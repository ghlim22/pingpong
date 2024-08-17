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
	<div class="image-profile-middle waiting">
		<img src="">
	</div>
	<span>Wait Please</span>
</div>
<div class="match-multi">
	<div class="image-profile-middle waiting">
		<img src="">
	</div>
	<span>Wait Please</span>
</div>
<div class="match-multi">
	<div class="image-profile-middle waiting">
		<img src="">
	</div>
	<span>Wait Please</span>
</div>
`;

const leftSideHTML = `
<div class="user-profile-team1">
	<div class="image-profile-small">
		<img src="./assets/default-picture.png">
	</div>
	<span>nickname</span>
	<span>♥♥♥♥♥</span>
</div>
<div></div>
<div class="user-profile-team1">
	<div class="image-profile-small">
		<img src="./assets/default-picture.png">
	</div>
	<span>nickname</span>
	<span>♥♥♥♥</span>
</div>
`;

const rightSideHTML = `
<div class="user-profile-team2">
	<div class="image-profile-small">
		<img src="./assets/default-picture.png">
	</div>
	<span>nickname</span>
	<span>♥♥♥</span>
</div>
<div>
	<img src="./assets/g-button-quit.svg">
</div>
<div class="user-profile-team2">
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
	<div class="result-multi-team">
		<div class="result-multi-user">
			<div class="image-profile-large">
				<img src="./assets/default-picture.png">
			</div>
			<span>nickname</span>
		</div>
		<div class="result-multi-user">
			<div class="image-profile-large">
				<img src="./assets/default-picture.png">
			</div>
			<span>nickname</span>
		</div>
	</div>
</div>
`;

let timerId;

export function pongMultiPage() {
	const above = document.getElementById('above');
	above.innerHTML = matchHTML;

	const img = document.querySelector('.match-multi .image-profile-middle img');
	const nickname = document.querySelector('.match-multi span');

	above.classList.add('above-on');
	if (appState.picture !== null)
		img.src = appState.picture;
	nickname.innerHTML = appState.nickname;
	game_queue('4P', appState.token)
    .then((data) => {
      console.log('Received data:', data);

      gameMultiPage(data);
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

function gameResultPage() {
	const above = document.getElementById('above');
	above.innerHTML = resultHTML;

	const img = document.querySelector('.result-multi .image-profile-large img');
	const nickname = document.querySelector('.result-multi .result-multi-team:nth-of-type(1) span');

	above.classList.add('above-on');
	if (appState.picture !== null)
		img.src = appState.picture;
	nickname.innerHTML = appState.nickname;
	setTimeout(handleQuitGame, 2500);
}
