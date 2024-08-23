import { appState, basePath, TUserInfo, TInvite, TFold, navigate, parseUrl } from '../../index.js';

const topHTML = `
<span class="logo-small">PONG</span>
`;

const mainHTML = `
<div class="inner_setting">
    <div class="inner_setting_window">
		<span class="t-button">x</span>
        <div class="inner_profile_top">
			<span>Edit Profile</span>
        </div>
        <div class="inner_profile_main"></div>
        <div class="inner_profile_bottom"></div>
    </div>
</div>
`;

const rightSideHTML = `
<div class="p-button-setting">
	<img src="/assets/s-button-cog.svg">
	<span>setting</span>
</div>
<t-fold class="friend"></t-fold>
`;

export function profileUserPage() {
	if (!appState.isLoggedIn) {
		navigate(parseUrl(basePath + 'login'));
		return;
	}
	const leftSideHTML = `
	<t-user-info class="p-button-current" data-nick="${appState.nickname}" data-img="${appState.picture}" data-id="${appState.token}" data-isloggedin="true"></t-user-info>
	<t-invite class="receive-invitation"></t-invite>
	<t-fold class="connect"></t-fold>
	`;

	document.getElementById('top').innerHTML = topHTML;
	document.getElementById('bottom').innerHTML = "";
	document.getElementById('main').innerHTML = mainHTML;
	document.getElementById('left-side').innerHTML = leftSideHTML;
	document.getElementById('right-side').innerHTML = rightSideHTML;

	document.querySelector('.p-button-setting').addEventListener('click', () => {
		navigate(parseUrl(basePath + 'setting'))
	});
}
