import { loginUser, basePath, navigate, parseUrl } from '../../index.js';
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
		loginUser(data['token'], data['email'], data['nickname'], data['picture']);
		navigate(parseUrl(basePath));
	})
	.catch(error => {
		console.log('Error: ', error);
	});
}