export let appState = {
	isLoggedIn:			false,
	token:				null,
	email:				null,
	nickname:			null,
	picture:			null,
	id:					null,
	invitation:			3,
	connect:			8,
	friend:				4,
	currentCleanupFn:	null,
	ws:					null,
	chat_ws:			null,
	inTournament:		false,
};
// 나중에는 export 지우기

//export const basePath = window.location.pathname;
export const basePath = '/';

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