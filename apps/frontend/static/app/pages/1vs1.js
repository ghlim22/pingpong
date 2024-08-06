import { appState, basePath, TUserInfo, TInvite, TFold, navigate, parseUrl } from '../../index.js';
const matchHTML = `
<div class="match-1vs1">
	<div class="image-profile-middle">
		<img src="apps/frontend/static/assets/default-picture.png">
	</div>
	<span>nickname</span>
</div>
<div class="match-1vs1">
	<div class="image-profile-middle waiting">
		<img src="">
	</div>
	<span>Wait Please</span>
</div>
`;

const leftSideHTML = `
<div></div>
`;

const rightSideHTML = `
<div>
	<img src="apps/frontend/static/assets/g-button-quit.svg">
</div>
`;

const topHTML = `
<div class="user-profile-1p">
	<span>nickname</span>
	<div class="image-profile-small">
		<img src="apps/frontend/static/assets/default-picture.png">
	</div>
</div>
<div class="user-profile-2p">
	<div class="image-profile-small">
		<img src="apps/frontend/static/assets/default-picture.png">
	</div>
	<span>nickname</span>
</div>
`;

const bottomHTML = `
<span>0</span>
<span>0</span>
`;

const resultHTML = `
<div class="result-1vs1">
	<span>WINNER</span>
	<div class="image-profile-large">
		<img src="apps/frontend/static/assets/default-picture.png">
	</div>
	<span>nickname</span>
	<span>0 : 0</span>
</div>
`;

let timerId;

export function pong1VS1Page() {
	const above = document.getElementById('above');
	above.innerHTML = matchHTML;

	const img = document.querySelector('.match-1vs1 .image-profile-middle img');
	const nickname = document.querySelector('.match-1vs1 span');

	above.classList.add('above-on');
	if (appState.picture !== null)
		img.src = appState.picture;
	nickname.innerHTML = appState.nickname;
	setTimeout(game1vs1Page, 1000);
}

function game1vs1Page() {
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
	navigate(parseUrl(basePath))
}

function gameResultPage() {
	const above = document.getElementById('above');
	above.innerHTML = resultHTML;

	const img = document.querySelector('.result-1vs1 .image-profile-large img');
	const nickname = document.querySelector('.result-1vs1 span:nth-of-type(2)');

	above.classList.add('above-on');
	if (appState.picture !== null)
		img.src = appState.picture;
	nickname.innerHTML = appState.nickname;
	setTimeout(handleQuitGame, 2500);
}
