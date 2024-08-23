import { appState, basePath, TUserInfo, TInvite, TFold, navigate, parseUrl } from '../../index.js';
import { tournament_game_queue, populateUserInfo } from './tournamentOperation.js'
import { game1vs1Page } from './1vs1Render.js'
const topHTML = `
<span class="logo-small">PONG</span>
`;

const tournamentRoomHTML = `
<div class="tournament-room-in">
	<div>
		<t-block class="1p"></t-block>
		<t-block data-status="wait" class="2p"></t-block>
	</div>
	<div>
		<t-block data-status="wait" class="3P" ></t-block>
		<t-block data-status="wait" class="4p"></t-block>
	</div>
</div>
`;

const matchOrderHTML = `
<div class="tournament-match-order">
	<div class="tournament-match-order-left">
		<t-block id="1p"></t-block>
		<t-block id="2p"></t-block>
	</div>
	<div class="tournament-match-order-final">
		<t-block id="5p" data-status="wait"></t-block>
		<t-block id="6p" data-status="wait"></t-block>
	</div>
	<div class="tournament-match-order-right">
		<t-block id="3p"></t-block>
		<t-block id="4p"></t-block>
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
	matchOrderPage(info.user_info_list);

	user_info_list.forEach((user_info, index) => {
		if (user_info.nickname === appState.nickname) {
			if (index > 1)
				info.game_id = info.game_id2
			setTimeout(() => { game1vs1Page(data) } , 5000);
		}
	});
}

export function matchOrderPage(data) {
	const above = document.getElementById('above');
	above.innerHTML = matchOrderHTML;

	above.classList.add('above-on');

	const objects = [
        't-block[id="1p"]',
        't-block[id="2p"]',
        't-block[id="3p"]',
        't-block[id="4p"]',
      ];

	populateUserInfo(data, objects);
}

