import { loginPage, homePage, pong1VS1Page, pongMultiPage, tournamentPage, settingPage, profileUserPage, basePath, appState } from '../index.js';

const routes = {
	[basePath + 'login']:			loginPage,
	[basePath]:						homePage,
	[basePath + '1vs1']:			pong1VS1Page,
	[basePath + 'multi']:			pongMultiPage,
	[basePath + 'tournament']:		tournamentPage,
	[basePath + 'setting']:			settingPage,
	[basePath + 'profile/:nick']:	profileUserPage,
	//'/profile/edit-profile':		profileEditPage,
	//'/profile/:nick':				profileUserPage,
	//'/setting/:nick':					settingUserPage,
	//'/tournament/:num':			tournamentRoomPage,
};

export function parseUrl(url) {
	const params = {};
	const pathParts = url.split('/');
	const routeParts = Object.keys(routes).map(r => r.split('/'));

	for (let i = 0; i < routeParts.length; i++) {
		if (routeParts[i].length === pathParts.length) {
			let isMatch = true;
			for (let j = 0; j < routeParts[i].length; j++) {
				if (routeParts[i][j].startsWith(':')) {
					const paramName = routeParts[i][j].substring(1);
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
	if (currentPath !== parsed.path) {
		window.history.pushState({}, parsed.path, window.location.origin + parsed.path);
	}
	if (data !== null) {
		profileUserPage(data);
	}
	else if (parsed.isParams) {
		setClaslistDefault();
		page(parsed.params);
	}
	else {
		setClaslistDefault();
		page();
	}
	if (appState.token !== null)
	{
		main_ws(appState.token);
	}
}

function notFoundPage() {
	const above = document.getElementById('above');
	const left = document.getElementById('left-side');
	const right = document.getElementById('right-side');
	const top = document.getElementById('top');
	const main = document.getElementById('main');
	const bottom = document.getElementById('bottom');

	above.innerHTML = "";
	left.innerHTML = "";
	right.innerHTML = "";
	top.innerHTML = "";
	main.innerHTML = "<h1>404: not found</h1>";
	bottom.innerHTML = "";
}

function setClaslistDefault() {
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
	console.log(appState.ws);
	if (appState.ws === null)
		appState.ws = new WebSocket(`wss://localhost/wss/games/main/?token=${token}`);
	else
		appState.ws.send(JSON.stringify({ type: "updateMine"}));
	const connect = document.querySelector('.connect');
	const friend = document.querySelector('.friend');

	appState.ws.onmessage = (event) => {
		const data = JSON.parse(event.data);

		// let followData;
		// fetch('api/users/current/follow/', {
		// 	method: 'GET',
		// 	headers: {
		// 		'Authorization': "Token " + appState.token
		// 	}
		// })
		// .then((response) => {
		// 	if (response.status === 200) {
		// 		return response.json().then(data => {
		// 			return data;
		// 		});
		// 	} else if (response.status === 400) {
		// 		return response.json().then(data => {
		// 			throw new Error('Bad Request');
		// 		});
		// 	} else {
		// 		return response.json().then(data => {
		// 			console.log('Other status: ', data);
		// 			throw new Error('Unexpected status code: ', response.status);
		// 		});
		// 	}
		// })
		// .then((data) => {
		// 	console.log('Data: ', data);
		// 	followData = data;
		// })
		// .catch(error => {
		// 	console.log('Error: ', error);
		// });

    	if (data.type === 'update') {
			const userInfoList = data.users;
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
				// userInfoList를 반복하면서 followData에 포함된 사용자만 추가
				userInfoList.forEach(userInfo => {
					const user = document.createElement('t-user-info');
					user.classList.add("p-button-user");
					user.setAttribute('data-nick', userInfo.nick || 'Unknown');
					user.setAttribute('data-img', userInfo.img || '../assets/default.png');
					user.setAttribute('data-id', userInfo.id || '0000');
					user.setAttribute('data-isLoggedin', userInfo.isLoggedin ? 'true' : 'false');
					
					// followData에 userInfo.id가 포함된 경우에만 addUserInfo를 실행
					if (userInfo.isLoggedin) {
						connect.addUserInfo(user);
					}
				});
			});
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