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

export function disconnect_ws(ws) {
	if (ws && ws.readyState === WebSocket.OPEN){
		ws.close();
		ws = null;
	}
}