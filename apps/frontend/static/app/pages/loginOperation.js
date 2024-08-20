import { appState, loginUser, basePath, navigate, parseUrl, TUserInfo } from '../../index.js';
import { loginHTML } from './loginRender.js';

export function handleSubmit(event) {
	if (event.target.matches('[data-join]')) {
		submitJoin(event);
		return ;
	} else if (event.target.matches('[data-login]')) {
		submitLogin(event);
		return ;
	}
}

export function submitJoin(event) {
	if (!(event.target.matches('[data-join]'))) {
		return ;
	}
	event.preventDefault();

	const email = event.target.querySelector('#idInput').value;
	const password = event.target.querySelector('#passwordInput').value;
	const confirm_password = event.target.querySelector('#pwAgainInput').value;
	const nickname = event.target.querySelector('#nickInput').value;
	const picture = event.target.querySelector('#imgInput').files[0];

	const formData = new FormData();
	formData.append('email', email);
	formData.append('password', password);
	formData.append('confirm_password', confirm_password);
	formData.append('nickname', nickname);
	formData.append('picture', picture);

	fetch('api/users/signup/', {
		method: 'POST',
		body: formData
	})
	.then((response) => {
		if (response.status === 201) {
			return response.json().then(data => {
				return data;
			});
		} else if (response.status === 400) {
			return response.json().then(data => {
				let errorMessage = 'Error 400: Bad Request\n';
				for (const [key, value] of Object.entries(data)) {
					errorMessage +=`${key}: ${value.join(', ')}\n`;
				}
				alert(errorMessage);
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
		alert(data['nickname'] + ', Welcome to join pong!');
		document.getElementById('main').innerHTML = loginHTML;
	})
	.catch(error => {
		console.log('Error: ', error);
	});
}

export function submitLogin(event) {
	if (!(event.target.matches('[data-login]'))) {
		return ;
	}
	event.preventDefault();

	const email = event.target.querySelector('#idInput').value;
	const password = event.target.querySelector('#passwordInput').value;

	const formData = new FormData();
	formData.append('email', email);
	formData.append('password', password);

	fetch('api/users/signin/', {
		method: 'POST',
		body: formData
	})
	.then((response) => {
		if (response.status === 200) {
			return response.json().then(data => {
				return data;
			});
		} else if (response.status === 400) {
			return response.json().then(data => {
				let errorMessage = 'Error 400: Bad Request\n';
				for (const [key, value] of Object.entries(data)) {
					errorMessage +=`${key}: ${value.join(', ')}\n`;
				}
				alert(errorMessage);
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
		loginUser(data['token'], data['email'], data['nickname'], data['picture'])
		navigate(parseUrl(basePath));
		main_ws(appState.token);
	})
	.catch(error => {
		console.log('Error: ', error);
	});
}

function main_ws(token) {
	let ws = new WebSocket(`wss://localhost/wss/games/main/?token=${token}`);
	const connect = document.querySelector('.connect');
	const friend = document.querySelector('.friend');

	ws.onmessage = (event) => {
		const data = JSON.parse(event.data);
		console.log('on message', data);
		const user = document.createElement('t-user-info');
		user.classList.add("p-button-current")
		user.setAttribute('data-nick', data.nick);
		user.setAttribute('data-img', data.img);
		user.setAttribute('data-id', data.id);

		if (data.type == 'connected')
		{
			user.setAttribute('data-isLoggedin', 'true');
			
			connect.addUserInfo(user);
			// connect.appendChild(user);
			const isExist = friend.querySelector('#${data.id}');
			if (isExist)
				friend.removeChild(isExist);
			friend.appendChild(user);
		}
		else if (data.type == 'disconnected')
		{
			user.setAttribute('data-isLoggedin', 'false');
			
			connect.removeChild(connect.querySelector('#${data.id}'));
			friend.removeChild(friend.querySelector('#${data.id}'));
			friend.appendChild(user);
		}
		else if (data.type == 'modify')
		{
			user.setAttribute('data-isLoggedin', 'true');

			const isExist = connect.querySelector('#${data.id}');
			if (isExist)
				connect.removeChild(isExist);
			friend.removeChild(friend.querySelector('#${data.id}'));

			connect.appendChild(user);
			friend.appendChild(user);
		}
	}

	ws.onerror = (error) => {

	}
}