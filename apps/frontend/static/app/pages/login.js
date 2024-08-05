import { appState, navigate, parseUrl } from '../../index.js';

export function loginPage() {
	const mainHTML = `
	<span class="logo-big">PONG</span>
	<div class="m-button" id="start">
		<span>start</span>
		<img src="assets/cloud-origin.svg">
	</div>
	`;
	if (appState.isLoggedIn) {
		navigate(parseUrl('/'));
		return;
	}
	document.getElementById('main').innerHTML = mainHTML;

	document.getElementById('start').addEventListener('click', handleStart);
}

function handleStart() {
	if (appState.isLoggedIn) {
		navigate(parseUrl('/'));
		return ;
	}
	const mainHTML = `
	<span class="logo-big">PONG</span>
	<div class="m-button" id="join">
		<span>join</span>
		<img src="assets/cloud-origin.svg">
	</div>
	<div class="m-button" id="login">
		<span>login</span>
		<img src="assets/cloud-origin.svg">
	</div>
	`;
	document.getElementById('main').innerHTML = mainHTML;

	document.getElementById('join').addEventListener('click', handleJoin);
	document.getElementById('login').addEventListener('click', handleLogin);
}

function handleJoin() {
	const mainHTML = `
	<span class="logo-big">PONG</span>
	<input type="text" id="idInput" class="type-info" placeholder="Enter ID" autocomplete="off"></input>
	<input type="password" id="passwordInput" class="type-info" placeholder="Enter PW" autocomplete="off"></input>
	<input type="password" id="pwAgainInput" class="type-info" placeholder="Enter PW again" autocomplete="off"></input>
	<div class="m-button" id="join">
		<span>join</span>
		<img src="assets/cloud-origin.svg">
	</div>
	`;
	document.getElementById('main').innerHTML = mainHTML;

	document.getElementById('join').addEventListener('click', setNickPage);
}

function handleLogin() {
	const mainHTML = `
	<span class="logo-big">PONG</span>
	<input type="text" id="idInput" class="type-info" placeholder="Enter ID" autocomplete="off"></input>
	<input type="password" id="passwordInput" class="type-info" placeholder="Enter PW" autocomplete="off"></input>
	<div class="m-button" id="login">
		<span>login</span>
		<img src="assets/cloud-origin.svg">
	</div>
	`;
	document.getElementById('main').innerHTML = mainHTML;

	document.getElementById('login').addEventListener('click', () => {
		appState.isLoggedIn = true;
		navigate(parseUrl('/'));
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
		<img src="assets/default-picture.png">
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
	navigate(parseUrl('/'));
}
