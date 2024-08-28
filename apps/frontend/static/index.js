//Object appState

import { appState, loginUser } from './app/state.js';
import { basePath } from './app/state.js';

//class TUserInfo
import { TUserInfo } from './components/tUserInfo.js';
import { TInvite } from './components/tInvite.js';
import { TFold } from './components/tFold.js';
import { TBlock } from './components/tBlock.js';

//function
import { navigate, parseUrl } from './app/router.js';
import { loginPage } from './app/pages/loginRender.js';
import { submitJoin, submitLogin } from './app/pages/loginOperation.js';
import { homePage } from './app/pages/home.js';
import { pong1VS1Page } from './app/pages/1vs1Render.js';
import { pongMultiPage } from './app/pages/multiRender.js';
import { tournamentPage } from './app/pages/tournamentRender.js';
import { settingPage, submitPicture, submitNickname } from './app/pages/setting.js';
import { profileUserPage } from './app/pages/profileUser.js';

export {
    appState,
    loginUser,
    basePath,
    TUserInfo,
    TInvite,
    TFold,
    TBlock,
    navigate,
    parseUrl,
    loginPage,
	submitJoin,
	submitLogin,
    homePage,
    pong1VS1Page,
    pongMultiPage,
    tournamentPage,
    settingPage,
	submitPicture,
	submitNickname,
	profileUserPage,
};


window.onpopstate = () => {
	if (appState.currentCleanupFn !== null) {
        appState.currentCleanupFn();
    }
console.log("index.j 0", 'window.location.pathname', window.location.pathname);//here!!
	navigate(parseUrl(window.location.pathname));
};

if (document.readyState !== 'loading') {
console.log("index.js 1", 'navigate(parseUrl(window.location.pathname))', window.location.pathname);//here!!
	navigate(parseUrl(window.location.pathname));
} else {
	document.addEventListener('DOMContentLoaded', () => {
console.log("index.js 2", 'navigate(parseUrl(window.location.pathname))', window.location.pathname);//here!!
		navigate(parseUrl(window.location.pathname));
	});
}

document.body.addEventListener('submit', (event) => {
	event.preventDefault();
	if (event.target.matches('[data-join]')) {
		submitJoin(event);
		return ;
	} else if (event.target.matches('[data-login]')) {
		submitLogin(event);
		return ;
	} else if (event.target.matches('[data-picture]')) {
		submitPicture(event);
		return ;
	} else if (event.target.matches('[data-nickname]')) {
		submitNickname(event);
		return ;
	}
});
