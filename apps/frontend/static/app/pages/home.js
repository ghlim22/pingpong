import { appState, basePath, TUserInfo, TInvite, TFold, navigate, parseUrl } from '../../index.js';
const mainHTML = `
<span class="logo-big">PONG</span>
<div class="m-button" id="1vs1">
	<span>1vs1</span>
	<img src="./assets/cloud-origin.svg">
</div>
<div class="m-button" id="multi">
	<span>multi</span>
	<img src="./assets/cloud-origin.svg">
</div>
<div class="m-button" id="tournament">
	<span>tournament</span>
	<img src="./assets/cloud-origin.svg">
</div>
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

export function homePage() {
	if (!appState.isLoggedIn) {
		navigate(parseUrl(basePath + 'login'));
		return;
	}
	document.getElementById('top').innerHTML = "";
	document.getElementById('bottom').innerHTML = "";
	document.getElementById('main').innerHTML = mainHTML;
	document.getElementById('left-side').innerHTML = leftSideHTML;
	document.getElementById('right-side').innerHTML = rightSideHTML;

	document.getElementById('1vs1').addEventListener('click', () => {
		navigate(parseUrl(basePath + '1vs1'))
	});
	document.getElementById('multi').addEventListener('click', () => {
		navigate(parseUrl(basePath + 'multi'))
	});
	document.getElementById('tournament').addEventListener('click', () => {
		navigate(parseUrl(basePath + 'tournament'))
	});
	document.querySelector('.p-button-chat').addEventListener('click', () => {
		navigate(parseUrl(basePath + 'chat'))
	});
}
