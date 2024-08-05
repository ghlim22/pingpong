//Object appState
import { appState } from './app/state.js';

//class TUserInfo
import { TUserInfo } from './components/tUserInfo.js';
import { TInvite } from './components/tInvite.js';
import { TFold } from './components/tFold.js';

//function
import { navigate, parseUrl } from './app/router.js';
import { loginPage } from './app/pages/login.js';
import { homePage } from './app/pages/home.js';
import { pong1VS1Page } from './app/pages/1vs1.js';

export {
    appState,
    TUserInfo,
    TInvite,
    TFold,
    navigate,
    parseUrl,
    loginPage,
    homePage,
    pong1VS1Page,
};

window.onpopstate = () => {
	navigate(parseUrl(window.location.pathname));
};

if (document.readyState !== 'loading') {
	navigate(parseUrl('/'));
} else {
	document.addEventListener('DOMContentLoaded', () => {
		navigate(parseUrl('/'));
	});
}
