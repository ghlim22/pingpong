import { appState, basePath, TUserInfo, TInvite, TFold, navigate, parseUrl } from '../../index.js';
import { tournament_game_queue, populateUserInfo } from './tournamentOperation.js'
import { game1vs1Page } from './1vs1Render.js'
const topHTML = `
<span class="logo-small">PONG</span>
`;

const tournamentRoomHTML = `
<div class="tournament-room-in">
	<div>
		<t-block class="player1"></t-block>
		<t-block data-status="wait" class="player3"></t-block>
	</div>
	<div>
		<t-block data-status="wait" class="player2" ></t-block>
		<t-block data-status="wait" class="player4"></t-block>
	</div>
</div>
<div id="hi">hihi</div>
`;

const matchOrderHTML = `
<div class="tournament-match-order">
	<div class="tournament-match-order-left">
		<t-block id="player1"></t-block>
		<t-block id="player2"></t-block>
	</div>
	<div class="tournament-match-order-final">
		<t-block id="player5" data-status="wait"></t-block>
		<t-block id="player6" data-status="wait"></t-block>
	</div>
	<div class="tournament-match-order-right">
		<t-block id="player3"></t-block>
		<t-block id="player4"></t-block>
	</div>
</div>
`;

export function tournamentPage() {
	if (!appState.isLoggedIn) {
		navigate(parseUrl(basePath + 'login'));
		return;
	}
	document.getElementById('bottom').innerHTML = "";
	document.getElementById('top').innerHTML = topHTML;
	document.getElementById('main').innerHTML = tournamentRoomHTML;
	document.querySelector('.logo-small').addEventListener('click', () => {
		navigate(parseUrl(basePath));
	});
	tournament_game_queue('tournament', appState.token)
    .then((data) => {
	  tournamentGame(data);
    })
    .catch((error) => {
      console.error('Error fetching game queue:', error);
    });
	//setTimeout(() => { tournamentGame(data) } , 5000); //시간 설정이 안됨
}

function tournamentGame(info) {
	matchOrderPage(info.user_info);

	info.user_info.forEach((user_info, index) => {
		if (user_info.nickname === appState.nickname) {
			if (index > 1)
				info.game_id = info.game_id2
			setTimeout(() => { game1vs1Page(info) } , 5000);
		}
	});
}

export function matchOrderPage(data) {
	const above = document.getElementById('above');
	above.innerHTML = matchOrderHTML;

	above.classList.add('above-on');

	const objects = [
        '.tournament-match-order #player1',
        '.tournament-match-order #player2',
        '.tournament-match-order #player3',
        '.tournament-match-order #player4',
      ];
	console.log('on matchOrderPage', data);
	populateUserInfo(data, objects);
}

