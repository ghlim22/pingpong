import { navigate, parseUrl } from '/index.js';
export let appState = {
	isLoggedIn:			false,
	token:				null,
	email:				null,
	nickname:			null,
	picture:			null,
	id:					null,
	invitation:			0,
	connect:			8,
	friend:				4,
	currentCleanupFn:	null,
	ws:					null,
	in_game_id:			null,
	chat_ws:			null,
	tour_ws:			null,
	inTournament:		false,
	isMain:				true,
};
// 나중에는 export 지우기

//export const basePath = window.location.pathname;
//export const basePath = '/';
export const basePath = {
	pathname: '/',
	search: ""
};


const savedState = sessionStorage.getItem('appState');
if (savedState) {
	let tempA = JSON.parse(savedState);
	let tempB = tempA.isMain;

	appState = tempA;
	appState.isMain = tempB;
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

export function disconnect_ws(ws) {
	if (ws && ws.readyState === WebSocket.OPEN){
		ws.close();
		ws = null;
	}
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
	appState.invitation = 0;
	appState.connect = 8;
	appState.friend = 4;
	appState.currentCleanupFn = null;
	appState.ws = null;
	appState.in_game_id = null;
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