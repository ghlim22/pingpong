import { appState, basePath, TUserInfo, TInvite, TFold, navigate, parseUrl } from '../../index.js';
import { game_queue, play_game } from './1vs1Operation.js'
import { matchOrderPage } from './tournamentRender.js'
const matchHTML = `
<div class="match-1vs1">
	<div class="image-profile-middle" id="mine">
		<img src="./assets/default-picture.png">
	</div>
	<span id="mySpan">nickname</span>
</div>
<div class="match-1vs1">
	<div class="image-profile-middle" id="opponent">
		<img src="./assets/default-picture.png">
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
	<img src="./assets/g-button-quit.svg">
</div>
<div></div>
`;

const topHTML = `
<div class="user-profile-1p">
	<span>nickname</span>
	<div class="image-profile-small">
		<img src="./assets/default-picture.png">
	</div>
</div>
<div class="user-profile-2p">
	<div class="image-profile-small">
		<img src="./assets/default-picture.png">
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
		<img src="./assets/default-picture.png">
	</div>
	<span>nickname</span>
</div>
`;

let timerId;

export function pong1VS1Page() {
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
	
	game_queue("2P", appState.token)
    .then((data) => {
      console.log('Received data:', data);
	  for (const element of data.user_info){
		if (element.nickname != appState.nickname){
		  img_opponent.src = element.picture;
		  nickname_opponent.innerHTML = element.nickname;
		}
	  }
	  
	  setTimeout(() => { game1vs1Page(data) } , 5000); //시간 설정이 안됨
    })
    .catch((error) => {
      console.error('Error fetching game queue:', error);
    });
	// setTimeout(game1vs1Page, 500);
	// jikang2:	임시로 0.5초 뒤에 game1vs1Page() 가 실행되도록 설정해둠.
	//			위 구문 주석처리하고,
	//			이 부분에서 game1vs1Page(*MATCH*());
	//			*MATCH* = 1vs1Operation.js의 match하는 함수,
	//			ex)	현재 유저의 토큰을 받아서 1vs1 대기큐에 넣은 후,
	//				match 되면 data {현재유저 포지션, 상대유저 nick, 상대유저 img} 반환
}

export function game1vs1Page(info) {
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
	console.log('Received info:', info);
	play_game(info, "2P", appState.token)
    .then((data) => {
      console.log('Received data:', data);
	  if (info.game_id2 === "false" || appState.nickname !== data.nickname)
      	gameResultPage(data);
	  else
	  {
		tournamentLastGame(info.game_id3);
	  }
    })
    .catch((error) => {
      console.error('Error fetching game queue:', error);
    });
	// timerId = setTimeout(gameResultPage, 3000);
	// jikang2:	임시로 3초 뒤에 gameResultPage() 가 실행되도록 설정해둠.
	//			위 구문 주석처리하고,
	//			이 부분에서 gameResultPage(*GAME*());
	//			이 부분에서 1vs1Operation.js의 game 함수 실행,
	//			ex)	game 종료 시 gamelog 를 db에 넣은 후, gameResultPage(승자정보{nick, img});
	//				a(user_id:11)와 b(user_id:12)가 1vs1(type:1) / a=15 : b=9로 a 승
	//				game_id:1, user_id:11, type:1, score:15, rank:0, timestamp, {'a', 'b'}
	//				game_id:1, user_id:12, type:1, score:9, rank:0, timestamp, {'a', 'b'}
	//				흠 근데 위 log는 예시라서 
	//				(gamelog 존재 이유 = 유저 프로필에서 전적 조회하기 위함)을 고려해서
	//				gamelog 에 대해 어떻게 저장해야할지 규현님과 상의해보셔야할듯?
	//				score를 빼고 result => win || lose 로 구분하던지...

	//			game 종료 조건 : (15점 발생 || quit 버튼 || 뒤로가기 || 브라우저 닫힘)
	//				15점 : 정상종료, 승자처리 후, 양측 유저에 result 띄우고 종료
	//				그외 : 비정상종료, 남은 유저 승자 처리 후, 남은 유저에 result 띄우고 종료
	//			뒤로가기와 브라우저 닫힘은 일단 제쪽인듯?
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
	
	console.log("tour last game_id", game_id);
	game_queue(game_id, appState.token)
    .then((data) => {
      console.log('Received data:', data);
	  for (const element of data.user_info){
		if (element.nickname != appState.nickname){
		  img_opponent.src = element.picture;
		  nickname_opponent.innerHTML = element.nickname;
		}
	  }
	  
	  setTimeout(() => { game1vs1Page(data) } , 5000); //시간 설정이 안됨
    })
    .catch((error) => {
      console.error('Error fetching game queue:', error);
    });
	// setTimeout(game1vs1Page, 500);
	// jikang2:	임시로 0.5초 뒤에 game1vs1Page() 가 실행되도록 설정해둠.
	//			위 구문 주석처리하고,
	//			이 부분에서 game1vs1Page(*MATCH*());
	//			*MATCH* = 1vs1Operation.js의 match하는 함수,
	//			ex)	현재 유저의 토큰을 받아서 1vs1 대기큐에 넣은 후,
	//				match 되면 data {현재유저 포지션, 상대유저 nick, 상대유저 img} 반환
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