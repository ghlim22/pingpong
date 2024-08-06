import { loginPage, homePage, pong1VS1Page, basePath } from '../index.js';

const routes = {
	[basePath + 'login']: 		loginPage,
	[basePath]: 				homePage,
	[basePath + '1vs1']: 		pong1VS1Page,
	//'/profile/edit-profile': 	profileEditPage,
	//'/chat': 					chatPage,
	//'/multi': 					pongMultiPage,
	//'/tournament': 				tournamentPage,
	//'/profile/:nick': 			profileUserPage,
	//'/chat/:nick': 				chatUserPage,
	//'/tournament/:num': 		tournamentRoomPage,
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

export function navigate(parsed) {
	const currentPath = window.location.pathname;

console.log(basePath);
console.log(parsed.route);
console.log(routes[parsed.route]);

	const page = routes[parsed.route] || notFoundPage;
	if (currentPath !== parsed.path) {
		window.history.pushState({}, parsed.path, window.location.origin + parsed.path);
	}
	if (parsed.isParams)
		page(parsed.params);
	else
		page();
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
