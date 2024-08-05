import { appState, TUserInfo, TInvite, TFold, navigate, parseUrl } from '../../index.js';
const matchHTML = `
<div class="match-multi">
	<div class="image-profile-middle">
		<img src="assets/default-picture.png">
	</div>
	<span>nickname</span>
</div>
<div class="match-multi">
	<div class="image-profile-middle waiting">
		<img src="">
	</div>
	<span>Wait Please</span>
</div>
<div class="match-multi">
	<div class="image-profile-middle waiting">
		<img src="">
	</div>
	<span>Wait Please</span>
</div>
<div class="match-multi">
	<div class="image-profile-middle waiting">
		<img src="">
	</div>
	<span>Wait Please</span>
</div>
`;

const leftSideHTML = `
<div class="user-profile-team1">
	<span>nickname</span>
	<div class="image-profile-small">
		<img src="assets/default-picture.png">
	</div>
</div>
<div></div>
<div class="user-profile-team1">
	<span>nickname</span>
	<div class="image-profile-small">
		<img src="assets/default-picture.png">
	</div>
</div>
`;

const rightSideHTML = `
<div class="user-profile-team2">
	<span>nickname</span>
	<div class="image-profile-small">
		<img src="assets/default-picture.png">
	</div>
</div>
<div>
	<img src="assets/g-button-quit.svg">
</div>
<div class="user-profile-team2">
	<span>nickname</span>
	<div class="image-profile-small">
		<img src="assets/default-picture.png">
	</div>
</div>
`;

const topHTML = `
`;

const bottomHTML = `
`;

const resultHTML = `
<div class="result-multi">
	<span>WINNER</span>
	<div class="image-profile-large">
		<img src="assets/default-picture.png">
	</div>
	<span>nickname</span>
</div>
`;

let timerId;

export function pongMultiPage() {
	const above = document.getElementById('above');
	above.innerHTML = matchHTML;

	const img = document.querySelector('.match-multi .image-profile-middle img');
	const nickname = document.querySelector('.match-multi span');

	above.classList.add('above-on');
	if (appState.picture !== null)
		img.src = appState.picture;
	nickname.innerHTML = appState.nickname;
	setTimeout(gamemultiPage, 1000);
}

function gamemultiPage() {
	const above = document.getElementById('above');
	const left = document.getElementById('left-side');
	const right = document.getElementById('right-side');
	const top = document.getElementById('top');
	const main = document.getElementById('main');
	const bottom = document.getElementById('bottom');

	above.classList.remove('above-on');
	left.classList.add('ingame');
	right.classList.add('ingame');
	main.classList.add('ingame');
	left.innerHTML = leftSideHTML;
	right.innerHTML = rightSideHTML;
	main.innerHTML = "";
	top.innerHTML = topHTML;
	bottom.innerHTML = bottomHTML;

	document.querySelector('#right-side.ingame div img').addEventListener('click', handleQuitGame);

	timerId = setTimeout(gameResultPage, 3000);
}

function handleQuitGame() {
	clearTimeout(timerId);

	const above = document.getElementById('above');
	const left = document.getElementById('left-side');
	const right = document.getElementById('right-side');
	const top = document.getElementById('top');
	const main = document.getElementById('main');
	const bottom = document.getElementById('bottom');

	above.classList.remove('above-on');
	left.classList.remove('ingame');
	right.classList.remove('ingame');
	main.classList.remove('ingame');
	top.innerHTML = "";
	bottom.innerHTML = "";
	navigate(parseUrl('/'))
}

function gameResultPage() {
	const above = document.getElementById('above');
	above.innerHTML = resultHTML;

	const img = document.querySelector('.result-multi .image-profile-large img');
	const nickname = document.querySelector('.result-multi span:nth-of-type(2)');

	above.classList.add('above-on');
	if (appState.picture !== null)
		img.src = appState.picture;
	nickname.innerHTML = appState.nickname;
	setTimeout(handleQuitGame, 2500);
}
