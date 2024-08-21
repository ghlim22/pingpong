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
import { handleSubmit, submitJoin, submitLogin } from './app/pages/loginOperation.js';
import { homePage } from './app/pages/home.js';
import { pong1VS1Page } from './app/pages/1vs1Render.js';
import { pongMultiPage } from './app/pages/multiRender.js';
import { tournamentPage } from './app/pages/tournamentRender.js';
import { chatPage } from './app/pages/chat.js';

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
    chatPage,
};


window.onpopstate = () => {
	if (appState.currentCleanupFn !== null) {
        appState.currentCleanupFn();
    }
	navigate(parseUrl(window.location.pathname));
};

if (document.readyState !== 'loading') {
	navigate(parseUrl(basePath));
} else {
	document.addEventListener('DOMContentLoaded', () => {
		navigate(parseUrl(basePath));
	});
}

document.body.addEventListener('submit', handleSubmit);
