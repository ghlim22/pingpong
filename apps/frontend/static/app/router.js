import { loginPage, homePage, pong1VS1Page, pongMultiPage, tournamentPage, settingPage, profileUserPage, basePath, appState } from '/index.js';
import config from "/config/config.js";

const { SERVER_ADDR } = config;

const routes = {
	["/" + 'login']:			loginPage,
	["/"]:						homePage,
	["/" + '1vs1']:			pong1VS1Page,
	["/" + 'multi']:			pongMultiPage,
	["/" + 'tournament']:		tournamentPage,
	//["/" + 'setting']:			settingPage,
	//["/" + 'profile/:nick']:	profileUserPage,
	["/" + '404']:				notFoundPage,
	//'/profile/edit-profile':		profileEditPage,
	//'/profile/:nick':				profileUserPage,
	//'/setting/:nick':					settingUserPage,
	//'/tournament/:num':			tournamentRoomPage,
};

export function parseUrl(location) {
	console.log('location', location);
	const params = {};
	const url = location.pathname;
	const pathParts = url.split('/');
	const routeParts = Object.keys(routes).map(r => r.split('/'));

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
				return {
					path: location.pathname,
					route: Object.keys(routes)[i],
					search: location.search,
					isParams: true,
					params
				};
			}
		}
	}
	return {
		path: location.pathname,
		route: location.pathname,
		search: location.search,
		isParams: false,
		params: {}
	};
}

function parseQueryString(queryString) {
    const params = new URLSearchParams(queryString);
    const expectedKeys = ['pk', 'email', 'nickname', 'picture', 'token'];
    let result = {};
    
    expectedKeys.forEach(key => {
        if (!params.has(key)) {
            throw new Error(`Missing expected key: ${key}`);
        }
        let value = params.get(key);
        if (key === 'pk' && isNaN(value)) {
            throw new Error(`Invalid value for pk: ${value}`);
        }
        if (key === 'email' && !value.includes('@')) {
            throw new Error(`Invalid value for email: ${value}`);
        }
        result[key] = decodeURIComponent(value);
    });
    return result;
}

export function navigate(parsed, data = null) {
	const currentPath = window.location.pathname;
	let page = routes[parsed.route] || notFoundPage;
	if (currentPath !== parsed.path) {
		window.history.pushState(data, parsed.path, window.location.origin + parsed.path);
	}
	appState.currentCleanupFn = null;
	setClaslistDefault();
	try {
		if (parsed.search !== "") {
			const parsedData = parseQueryString(parsed.search);
			console.log(parsedData);
			appState.id = parsedData.pk;
			loginUser(parsedData['token'], parsedData['email'], parsedData['nickname'], parsedData['picture'])
			console.log(appState);
			page = routes[parsed.route] || notFoundPage;
		}
		page = routes[parsed.route] || notFoundPage;
	} catch (error) {
		console.error("Error parsing query string:", error.message);
		page = notFoundPage;
	}

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
		setTimeout(() => { main_ws(appState.token) } , 200);
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
	if (!appState.ws || !(appState.ws instanceof WebSocket))
	{
		appState.ws = new WebSocket(`wss://${SERVER_ADDR}/wss/games/main/?token=${token}`);
	}
	else
	{
		appState.ws.send(JSON.stringify({ type: "updateMine"}));
	}
	const connect = document.querySelector('.connect');
	const friend = document.querySelector('.friend');
	const invitation = document.querySelector('.receive-invitation');
	const myprofile = document.querySelector('.p-button-current');

	appState.ws.onmessage = (event) => {
		const data = JSON.parse(event.data);
		
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
		else if (data.type === 'game_invitation') {
			invitation.setInvitation(data.nick, data.img);
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