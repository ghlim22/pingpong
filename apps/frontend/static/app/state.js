import { navigate, parseUrl } from '/index.js';
export let appState = {
	isLoggedIn:			false,
	token:				null,
	email:				null,
	nickname:			null,
	picture:			null,
	id:					null,
	currentCleanupFn:	null,
	ws:					null,
	chat_ws:			null,
	tour_ws:			null,
	inTournament:		false,
};
// 나중에는 export 지우기

//export const basePath = window.location.pathname;
export const basePath = {
	pathname: '/',
	search: ""
};

const savedState = sessionStorage.getItem('appState');
if (savedState) {
	appState = JSON.parse(savedState);
}

function updateAppState(newState) {
	appState = { ...appState, ...newState };
	sessionStorage.setItem('appState', JSON.stringify(appState));
}

export function loginUser(_token, _email, _nickname, _picture) {
	updateAppState({
		isLoggedIn: true,
		token: _token,
		email: _email,
		nickname: _nickname,
		picture: _picture
	});
}

export function logoutUser() {
	if (appState.ws && appState.ws.readyState === WebSocket.OPEN) {
		appState.ws.close();
	}
	if (appState.chat_ws && appState.chat_ws.readyState === WebSocket.OPEN) {
		appState.chat_ws.close();
	}
	if (appState.tour_ws && appState.tour_ws.readyState === WebSocket.OPEN) {
		appState.tour_ws.close();
	}
	
	appState.isLoggedIn = false;
	appState.token = null;
	appState.email = null;
	appState.nickname = null;
	appState.picture = null;
	appState.id = null;
	appState.currentCleanupFn = null;
	appState.ws = null;
	appState.chat_ws = null;
	appState.tour_ws = null;
	appState.inTournament = false;
	sessionStorage.setItem('appState', JSON.stringify(appState));
	navigate(parseUrl({
		pathname: '/login',
		search: ""
	}));
	alert('Logged out');
}