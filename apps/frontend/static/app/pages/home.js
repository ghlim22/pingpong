import { appState, basePath, TUserInfo, TInvite, TFold, navigate, parseUrl, settingPage } from '/index.js';
const mainHTML = `
<span class="logo-big">PONG</span>
<div class="m-button" id="1vs1">
	<span>1vs1</span>
	<img src="/assets/cloud-origin.svg">
</div>
<div class="m-button" id="multi">
	<span>multi</span>
	<img src="/assets/cloud-origin.svg">
</div>
<div class="m-button" id="tournament">
	<span>tournament</span>
	<img src="/assets/cloud-origin.svg">
</div>
`;

const rightSideHTML = `
<div class="p-button-setting">
	<img src="/assets/s-button-cog.svg">
	<span>setting</span>
</div>
<t-fold class="friend"></t-fold>
`;

export function homePage() {
	appState.isMain = true;
	sessionStorage.setItem('appState', JSON.stringify(appState));
	appState.in_game_id = null;
	if (!appState.isLoggedIn) {
		navigate(parseUrl(basePath + 'login'));
		return;
	}
	const leftSideHTML = `
	<t-user-info class="p-button-current" data-nick="${appState.nickname}" data-img="${appState.picture}" data-id="${appState.token}" data-isloggedin="true"></t-user-info>
	<t-invite class="receive-invitation"></t-invite>
	<t-fold class="connect"></t-fold>
	`;

	document.getElementById('top').innerHTML = "";
	document.getElementById('bottom').innerHTML = "";
	document.getElementById('main').innerHTML = mainHTML;
	document.getElementById('left-side').innerHTML = leftSideHTML;
	document.getElementById('right-side').innerHTML = rightSideHTML;

	document.getElementById('1vs1').addEventListener('click', () => {
		navigate(parseUrl(basePath + '1vs1'));
	});
	document.getElementById('multi').addEventListener('click', () => {
		navigate(parseUrl(basePath + 'multi'));
	});
	document.getElementById('tournament').addEventListener('click', () => {
		navigate(parseUrl(basePath + 'tournament'));
	});
	document.querySelector('.p-button-setting').addEventListener('click', () => {
		settingPage();
	});
}
