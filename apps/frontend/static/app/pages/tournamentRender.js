import { appState, basePath, TUserInfo, TInvite, TFold, navigate, parseUrl } from '../../index.js';
const topHTML = `
<span class="logo-small">PONG</span>
`;

const tournamentRoomHTML = `
<div class="tournament-room-in">
	<div>
		<t-block></t-block>
		<t-block></t-block>
	</div>
	<div>
		<t-block></t-block>
		<t-block data-status="wait"></t-block>
	</div>
</div>
`;

const matchOrderHTML = `
<div class="tournament-match-order">
	<div class="tournament-match-order-left">
		<t-block></t-block>
		<t-block></t-block>
	</div>
	<div class="tournament-match-order-final">
		<t-block data-status="wait"></t-block>
		<t-block data-status="wait"></t-block>
	</div>
	<div class="tournament-match-order-right">
		<t-block></t-block>
		<t-block></t-block>
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

	//setTimeout(matchOrderPage, 1000);
}

function matchOrderPage() {
	const above = document.getElementById('above');
	above.innerHTML = matchOrderHTML;

	above.classList.add('above-on');
	//
}