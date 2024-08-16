import { appState, basePath, TUserInfo, TInvite, TFold, navigate, parseUrl } from '../../index.js';
const topHTML = `
<span class="logo-small">PONG</span>
`;

const mainHTML = `
<span class="text-xlarge-48">tournament</span>
`;

const leftSideHTML = `
<t-user-info class="p-button-current"></t-user-info>
<t-invite class="receive-invitation"></t-invite>
<t-fold class="connect"></t-fold>
`;

const rightSideHTML = `
<div class="p-button-chat">
	<img src="./assets/s-button-message.svg">
	<span>chat</span>
</div>
<t-fold class="friend"></t-fold>
`;

export function tournamentPage() {
	if (!appState.isLoggedIn) {
		navigate(parseUrl(basePath + 'login'));
		return;
	}
	document.getElementById('bottom').innerHTML = "";
	document.getElementById('top').innerHTML = topHTML;
	document.getElementById('main').innerHTML = mainHTML;
	document.getElementById('left-side').innerHTML = leftSideHTML;
	document.getElementById('right-side').innerHTML = rightSideHTML;

	document.querySelector('.p-button-chat').addEventListener('click', () => {
		navigate(parseUrl(basePath + 'chat'))
	});
	document.querySelector('.logo-small').addEventListener('click', () => {
		navigate(parseUrl(basePath));
	})
}
