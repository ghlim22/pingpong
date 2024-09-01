import { appState, basePath, navigate, parseUrl } from '/index.js';

const pageHTML = `
<span class="logo-big">PONG</span>
<div class="m-button" id="start">
	<span>start</span>
	<img src="/assets/cloud-origin.svg">
</div>
`;

const startHTML = `
<span class="logo-big">PONG</span>
<div class="m-button" id="join">
	<span>join</span>
	<img src="/assets/cloud-origin.svg">
</div>
<div class="m-button" id="login">
	<span>login</span>
	<img src="/assets/cloud-origin.svg">
</div>
`;

const joinHTML = `
<span class="logo-big">PONG</span>
<form id="form-join" data-join>
	<div id="form-join-box">
		<input required type="file" id="imgInput" class="type-info chooseFile" accept=".png, .jpg, .jpeg"></input>
		<div id="form-join-img-label">
			<label class="t-button" for="imgInput">choose file: </label>
			<span id="form-join-file-name">file is not selected</span>
		</div>
		<div>
			<input required type="text" id="nickInput" class="type-info" placeholder="Enter Nickname" autocomplete="off"></input>
			<input required type="email" id="idInput" class="type-info" placeholder="Enter E-mail" autocomplete="off"></input>
		</div>
		<div>
			<input required type="password" id="passwordInput" class="type-info" placeholder="Enter PW" autocomplete="off"></input>
			<input required type="password" id="pwAgainInput" class="type-info" placeholder="Enter PW again" autocomplete="off"></input>
		</div>
	</div>
	<button type="submit" class="m-button" id="join-submit" data-join>
		<span>join</span>
		<img src="/assets/cloud-origin.svg">
	</button>
</form>
`;

export const loginHTML = `
<span class="logo-big">PONG</span>
<form id="form-login" data-login>
	<input required type="email" id="idInput" class="type-info" placeholder="Enter E-mail" autocomplete="off"></input>
	<input required type="password" id="passwordInput" class="type-info" placeholder="Enter PW" autocomplete="off"></input>
	<button type="submit" class="m-button" id="login-submit" data-login>
		<span>login</span>
		<img src="/assets/cloud-origin.svg">
	</button>
</form>
`;

const main = document.getElementById('main');

export function loginPage() {
	if (appState.isLoggedIn) {
		navigate(parseUrl(basePath));
		return;
	}
	main.innerHTML = pageHTML;
	document.getElementById('top').innerHTML = "";
	document.getElementById('bottom').innerHTML = "";
	document.getElementById('left-side').innerHTML = "";
	document.getElementById('right-side').innerHTML = "";

	// document.getElementById('start').addEventListener('click', () => {
	// // window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-1a77f4bb835ced96471b037724388e48dca50409405393deeac24248b3fe0aab&redirect_uri=https%3A%2F%2F${SERVER_ADDR}%2Fapi%2Fauth%2Fredirect&response_type=code';
	// 	//fetch('api/auth/signin', {
	// 	//	method: 'GET',
	// 	//})
	// 	//.then((response) => {
	// 	//	if (response.status === 200) {
	// 	//		return response;
	// 	//	} else {
	// 	//		return response;
	// 	//	}
	// 	//})
	// 	//.then((data) => {
	// 	//	console.log('auth signin data: ', data);
	// 	//})
	// 	//.catch(error => {
	// 	//	console.log('Error: ', error);
	// 	//});
	// });

//	document.getElementById('start').addEventListener('click', () => {
//		main.innerHTML = startHTML;
//
//		document.getElementById('join').addEventListener('click', () => {
//			main.innerHTML = joinHTML;
//
//			document.getElementById('imgInput').addEventListener('change', (e) => {
//				let file = e.target.files[0];
//
//				document.getElementById('form-join-file-name').textContent = file.name;
//			});
//		});
//
//		document.getElementById('login').addEventListener('click', () => {
//			main.innerHTML = loginHTML;
//
//		});
//	});

document.getElementById('start').addEventListener('click', () => {
	window.location.href = 'api/auth/signin';
});
}