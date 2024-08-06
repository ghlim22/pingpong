import { appState, basePath, navigate, parseUrl } from '../../index.js';

export function loginPage() {
	const mainHTML = `
	<span class="logo-big">PONG</span>
	<div class="m-button" id="start">
		<span>start</span>
		<img src="./assets/cloud-origin.svg">
	</div>
	`;
	if (appState.isLoggedIn) {
		navigate(parseUrl(basePath));
		return;
	}
	document.getElementById('main').innerHTML = mainHTML;

	document.getElementById('start').addEventListener('click', handleStart);
}

function handleStart() {
	if (appState.isLoggedIn) {
		navigate(parseUrl(basePath));
		return ;
	}
	const mainHTML = `
	<span class="logo-big">PONG</span>
	<div class="m-button" id="join">
		<span>join</span>
		<img src="./assets/cloud-origin.svg">
	</div>
	<div class="m-button" id="login">
		<span>login</span>
		<img src="./assets/cloud-origin.svg">
	</div>
	`;
	document.getElementById('main').innerHTML = mainHTML;

	document.getElementById('join').addEventListener('click', handleJoin);
	document.getElementById('login').addEventListener('click', handleLogin);
}

function handleJoin() {
	const mainHTML = `
	<span class="logo-big">PONG</span>
	<form id="form-join" data-link>
		<input required type="email" id="idInput" class="type-info" placeholder="Enter E-mail" autocomplete="off"></input>
		<input required type="password" id="passwordInput" class="type-info" placeholder="Enter PW" autocomplete="off"></input>
		<input required type="password" id="pwAgainInput" class="type-info" placeholder="Enter PW again" autocomplete="off"></input>
		<button type="submit" class="m-button" id="join" data-link>
			<span>join</span>
			<img src="./assets/cloud-origin.svg">
		</button>
	</form>
	`;

	document.getElementById('main').innerHTML = mainHTML;

	//document.getElementById('join').addEventListener('click', setNickPage);
	document.getElementById('join').addEventListener('submit', submitJoin);
}

export function submitJoin(event) {
	if (!(event.target.matches('[data-link]'))) {
		return ;
	}
	event.preventDefault();

	console.log(event.target);
	console.log(event.target.querySelector('#idInput').value);
	console.log(event.target.querySelector('#passwordInput').value);
	console.log(event.target.querySelector('#pwAgainInput').value);

	const bodyJson = `{"email": "${event.target.querySelector('#idInput').value}", "password": "${event.target.querySelector('#passwordInput').value}", "confirm_password": "${event.target.querySelector('#pwAgainInput').value}"}`;

	const fetchJson = {
		method: 'POST',
		headers: {
		'Content-Type': 'application/json'
		},
		body: bodyJson
	}
	console.log(fetchJson);

	//const formData = new FormData(event.target);

//	const data = {};
//	formData.forEach((value, key) => {
//		data[key] = value;
//	});
//
//	console.log((formData));
//	console.log((data));
//	console.log(JSON.stringify(data));

	fetch('https://api/users/signup/', {
		method: 'POST',
		headers: {
		'Content-Type': 'application/json'
		},
		body: bodyJson
	})
	.then(response => {
		if (response.ok) {
		return response.json();
		} else {
		throw new Error('Network response was not ok.');
		}
	})
	.then(data => {
		console.log('Success:', data);
		// 성공 메시지 표시 또는 다른 동작 수행
	})
	.catch(error => {
		console.error('There was a problem with your fetch operation:', error);
		// 오류 메시지 표시 또는 다른 동작 수행
	});
}

function handleLogin() {
	const mainHTML = `
	<span class="logo-big">PONG</span>
	<input type="email" id="idInput" class="type-info" placeholder="Enter E-mail" autocomplete="off"></input>
	<input type="password" id="passwordInput" class="type-info" placeholder="Enter PW" autocomplete="off"></input>
	<div class="m-button" id="login">
		<span>login</span>
		<img src="./assets/cloud-origin.svg">
	</div>
	`;
	document.getElementById('main').innerHTML = mainHTML;

	document.getElementById('login').addEventListener('click', () => {
		appState.isLoggedIn = true;
		navigate(parseUrl(basePath));
	});
}


function setNickPage() {
	const mainHTML = `
	<span class="text-xlarge-48">What's your nickname?</span>
	<input type="text" id="nicknameInput" class="type-nickname" placeholder="Enter nickname" autocomplete="off"></input>
	<div id="setNick" class="t-button">v</div>
	`;
	document.getElementById('main').innerHTML = mainHTML;
	document.getElementById('setNick').addEventListener('click', handleSetNick);
}

function handleSetNick() {
	const value = document.getElementById('nicknameInput').value;
	if (value !== '' && value.match(/^[0-9a-z]+$/)) {
		appState.nickname = document.getElementById('nicknameInput').value;
		setImagePage();
	}
}

function setImagePage() {
	const mainHTML = `
	<span class="text-xlarge-48">Is this your profile picture?</span>
	<div class="image-profile-large">
		<img src="./assets/default-picture.png">
	</div>
	<div id="setImage">
		<label class="t-button" for="chooseFile">+</label>
		<input type="file" id="chooseFile" name="chooseFile" accept="image/*">
		<span class="t-button">v</span>
	</div>
	`;
	document.getElementById('main').innerHTML = mainHTML;
	document.getElementById('chooseFile').addEventListener('change', loadFile)
	document.querySelector('#setImage span.t-button').addEventListener('click', handleSetImage);
}

function loadFile(event) {
	let file = event.target.files[0];
	let img = document.querySelector('#main .image-profile-large img');
	appState.picture = URL.createObjectURL(file);
	img.src = appState.picture;
}

function handleSetImage() {
	appState.isLoggedIn = true;
	navigate(parseUrl(basePath));
}
