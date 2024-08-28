import { loginPage, homePage, pong1VS1Page, pongMultiPage, tournamentPage, settingPage, profileUserPage, basePath, appState } from '/index.js';

const routes = {
	[basePath + 'login']:			loginPage,
	[basePath]:						homePage,
	[basePath + '1vs1']:			pong1VS1Page,
	[basePath + 'multi']:			pongMultiPage,
	[basePath + 'tournament']:		tournamentPage,
	//[basePath + 'setting']:			settingPage,
	//[basePath + 'profile/:nick']:	profileUserPage,
	[basePath + '404']:				notFoundPage,
	//'/profile/edit-profile':		profileEditPage,
	//'/profile/:nick':				profileUserPage,
	//'/setting/:nick':					settingUserPage,
	//'/tournament/:num':			tournamentRoomPage,
};

export function parseUrl(url) {
	const params = {};
	const pathParts = url.split('/');
	const routeParts = Object.keys(routes).map(r => r.split('/'));
	console.log('pathParts', pathParts);
	console.log('routeParts', routeParts);

	for (let i = 0; i < routeParts.length; i++) {
		if (routeParts[i].length === pathParts.length) {
			let isMatch = true;
			for (let j = 0; j < routeParts[i].length; j++) {
				if (routeParts[i][j].startsWith(':')) {
					const paramName = routeParts[i][j].substring(1);
					if (pathParts[j].length === 0) {
						isMatch = false;
						break;
					}
					params[paramName] = pathParts[j];
				} else if (routeParts[i][j] !== pathParts[j]) {
					isMatch = false;
					break;
				}
			}
			if (isMatch) {
				return { path: url, route: Object.keys(routes)[i], isParams: true, params};
			}
		}
	}
	return { path: url, route: url, isParams: false, params: {} };
}

export function navigate(parsed, data = null) {
	const currentPath = window.location.pathname;
	const page = routes[parsed.route] || notFoundPage;
	//if (currentPath !== parsed.path) {
		window.history.pushState(data, parsed.path, window.location.origin + parsed.path);
	//}
	appState.currentCleanupFn = null;
	setClaslistDefault();
	//if (data !== null) {
	//	profileUserPage(data);
	//}
	//else if (parsed.isParams) {
	//	page(parsed.params);
	//}
	//else {
		page();
	//}
	if (page !== notFoundPage && appState.token !== null)
	{
		main_ws(appState.token);
	}
}

function notFoundPage() {
	const above = document.getElementById('above');

	above.innerHTML = `
		<span class="logo-big">404</span>
		<h1>page not found</h1>
		<h2 id="above_404">Click to go back</h2>
	`;;
	document.getElementById('above').classList.add('not_found');
	document.getElementById('above_404').addEventListener('click', () => {
		navigate(parseUrl(basePath));
	});
}

function setClaslistDefault() {
	document.getElementById('above').classList.remove('outter_setting');
	document.getElementById('above').classList.remove('not_found');
	document.getElementById('above').classList.remove('above-on');
	document.getElementById('left-side').classList.remove('ingame');
	document.getElementById('right-side').classList.remove('ingame');
	document.getElementById('top').classList.remove('ingame');
	document.getElementById('main').classList.remove('ingame');
	document.getElementById('bottom').classList.remove('ingame');
	document.getElementById('center').classList.remove('multi');
	document.getElementById('left-side').classList.remove('multi');
	document.getElementById('right-side').classList.remove('multi');
	document.getElementById('top').classList.remove('multi');
	document.getElementById('main').classList.remove('multi');
	document.getElementById('bottom').classList.remove('multi');
}

function main_ws(token) {
	console.log("before", appState.ws)
	if (!appState.ws || !(appState.ws instanceof WebSocket))
	{
		console.log("11")
		appState.ws = new WebSocket(`wss://localhost/wss/games/main/?token=${token}`);
	}
	else
	{
		appState.ws.send(JSON.stringify({ type: "updateMine"}));
		console.log("22")
	}
	console.log("after", appState.ws)
	const connect = document.querySelector('.connect');
	const friend = document.querySelector('.friend');
	const myprofile = document.querySelector('.p-button-current');

	appState.ws.onmessage = (event) => {
		const data = JSON.parse(event.data);
		console.log("app.ws.on", data);
		
    	if (data.type === 'update') {
			const userInfoList = data.users;
			appState.id = data.my_id;
			myprofile.setImageNick(appState.picture, appState.nickname);
			connect.removeAll();
			friend.removeAll();
			
			let followData = [];
			fetch('/api/users/current/follow/', {
				method: 'GET',
				headers: {
					'Authorization': "Token " + appState.token
				}
			})
			.then((response) => {
				if (response.status === 200) {
					return response.json().then(data => {
						return data;
					});
				} else if (response.status === 400) {
					return response.json().then(data => {
						throw new Error('Bad Request');
					});
				} else {
					return response.json().then(data => {
						console.log('Other status: ', data);
						throw new Error('Unexpected status code: ', response.status);
					});
				}
			})
			.then((data) => {
				followData = data; // followData 배열에 데이터를 저장
			})
			.catch(error => {
				console.log('Error: ', error);
			})
			.finally(() => {
				userInfoList.forEach(userInfo => {
					if (userInfo.isLoggedin) {
						const user = document.createElement('t-user-info');
						user.classList.add("p-button-user");
						user.setAttribute('data-nick', userInfo.nick || 'Unknown');
						user.setAttribute('data-img', userInfo.img || '/assets/default.png');
						user.setAttribute('data-id', userInfo.id || '0000');
						user.setAttribute('data-isLoggedin', userInfo.isLoggedin ? 'true' : 'false');
						connect.addUserInfo(user);
					}
					const followingsIds = followData.followings.map(user => user.pk);
					if (followingsIds.includes(userInfo.id))	{
						const user = document.createElement('t-user-info');
						user.classList.add("p-button-user");
						user.setAttribute('data-nick', userInfo.nick || 'Unknown');
						user.setAttribute('data-img', userInfo.img || '/assets/default.png');
						user.setAttribute('data-id', userInfo.id || '0000');
						user.setAttribute('data-isLoggedin', userInfo.isLoggedin ? 'true' : 'false');
						friend.addUserInfo(user);
					}
				});
			});
		}
		else if (data.type === 'invite') {
			// 게임 초대 메시지를 받았을 때 처리하는 로직
			// data.nick
			// data.img
		}
	}
		// const info = JSON.parse(event.data);
		
		// const data = info.data;
		// const user = document.createElement('t-user-info');

		// user.classList.add("p-button-current")
		// user.setAttribute('data-nick', );
		// user.setAttribute('data-img', );
		// user.setAttribute('data-id', );
		// user.setAttribute('data-isLoggedin', );

		// if (info.type == 'connected')
		// {
			
		// 	connect.addUserInfo(user);
		// 	// connect.appendChild(user);
		// 	// const isExist = friend.querySelector('#${data.id}');
		// 	if (isExist)
		// 		friend.removeChild(isExist);
		// 	friend.appendChild(user);
		// }
		// else if (info.type == 'disconnected')
		// {
		// 	// user.setAttribute('data-isLoggedin', 'false');
			
		// 	// connect.removeChild(connect.querySelector('#${data.id}'));
		// 	// friend.removeChild(friend.querySelector('#${data.id}'));
		// 	friend.appendChild(user);
		// }
		// else if (info.type == 'modify')
		// {
		// 	// user.setAttribute('data-isLoggedin', 'true');

		// 	// const isExist = connect.querySelector('#${data.id}');
		// 	if (isExist)
		// 		connect.removeChild(isExist);
		// 	// friend.removeChild(friend.querySelector('#${data.id}'));

		// 	connect.appendChild(user);
		// 	friend.appendChild(user);
		// }

	appState.ws.onclose = (error) => {
		appState.ws = null;
	}
}