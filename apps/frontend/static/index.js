//Object appState

import { appState } from './app/state.js';
import { basePath } from './app/state.js';

//class TUserInfo
import { TUserInfo } from './components/tUserInfo.js';
import { TInvite } from './components/tInvite.js';
import { TFold } from './components/tFold.js';

//function
import { navigate, parseUrl } from './app/router.js';
import { loginPage, submitJoin } from './app/pages/login.js';
import { homePage } from './app/pages/home.js';
import { pong1VS1Page } from './app/pages/1vs1.js';

export {
    appState,
    basePath,
    TUserInfo,
    TInvite,
    TFold,
    navigate,
    parseUrl,
    loginPage,
	submitJoin,
    homePage,
    pong1VS1Page,
};


window.onpopstate = () => {
	navigate(parseUrl(basePath));
};

if (document.readyState !== 'loading') {
	navigate(parseUrl(basePath));
} else {
	document.addEventListener('DOMContentLoaded', () => {
		navigate(parseUrl(basePath));
	});
}

document.body.addEventListener('submit', submitJoin);
//	 e => {
//	if (e.target.matches('[data-link]')) {
//		e.preventDefault();
//		console.log("YYYY");
//		submitJoin(e);
//	}
//});
