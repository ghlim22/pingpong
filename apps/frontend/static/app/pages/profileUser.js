import { appState, basePath, TUserInfo, TInvite, TFold, navigate, parseUrl, settingPage } from '/index.js';
import config from "/config/config.js";

const { SERVER_ADDR } = config;

const mainHTML = `
<div class="inner_setting">
    <div class="inner_setting_window">
        <div class="inner_profile_top">
			<div class="user-profile-field"></div>
			<div class="user-button-field"></div>
        </div>
        <div class="inner_profile_main">
			<div>
				<span>win</span>
				<span class="inner_profile_win">0</span>
			</div>
			<div>
				<span>lose</span>
				<span class="inner_profile_lose">0</span>
			</div>
		</div>
        <div class="inner_profile_bottom default"></div>
    </div>
</div>
`;

export function profileUserPage(data) {
	const above = document.getElementById('above');
	above.innerHTML = mainHTML;

	appendField(data);
	putGameLog(data);

	document.getElementById('above').classList.add('above-on');
	document.getElementById('above').classList.add('outter_setting');
}

function putGameLog(data) {
	fetch('/api/users/logs/' + data.pk, {
		method: 'GET',
		headers: {
			'Authorization': "Token " + appState.token
		}
	})
	.then((response) => {
		if (response.status === 200) {
			return response.json();
		}
		else if (response.status === 404) {
			document.querySelector('.inner_profile_bottom').innerHTML = `
			<div class="inner_profile_log_404">
				<img src="/assets/s-button-unpong.svg">
			</div>
			`;
			throw new Error('404');
		}
		else {
			console.log('Other status: ');
			throw new Error('Unexpected status code: ', response.status);
		}
	})
	.then((data) => {
		renderGameLog(data);
		console.log('Logs: ', data);
	})
	.catch(error => {
		console.log('Logs Error: ', error);
	});
}

function parseTimestamp(timestamp) {
	const date = new Date(timestamp);

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');

	const formattedDate = `${year}.${month}.${day} ${hours}:${minutes}`;

	return formattedDate;
}

function renderGameLog(data) {
	document.querySelector('.inner_profile_bottom').innerHTML = `
	<div class="inner_profile_log_date">
		<span class="inner_profile_log_head">Date</span>
	</div>
	<div class="inner_profile_log_game">
		<span class="inner_profile_log_head">Game</span>
	</div>
	<div class="inner_profile_log_result">
		<span class="inner_profile_log_head">Result</span>
	</div>
	<div class="inner_profile_log_competitor">
		<span class="inner_profile_log_head">Competitor</span>
	</div>
	`;
	Object.keys(data).forEach(log => {
		const date = document.createElement('span');
		const game = document.createElement('span');
		const result = document.createElement('span');
		const competitor = document.createElement('span');

		date.innerText = parseTimestamp(data[log].timestamp);
		if (data[log].type === '2P') {
			game.innerText = '1vs1';
			competitor.innerText = data[log].players[0];
		}
		else {
			game.innerText = 'multi';
			competitor.innerText = `${data[log].players[0]}, ${data[log].players[1]}`;
		}
		if (data[log].won) {
			result.innerText = 'win';
		}
		else {
			result.innerText = 'lose';
		}
		document.querySelector('.inner_profile_log_date').appendChild(date);
		document.querySelector('.inner_profile_log_game').appendChild(game);
		document.querySelector('.inner_profile_log_result').appendChild(result);
		document.querySelector('.inner_profile_log_competitor').appendChild(competitor);
	});
}

async function appendField(data) {
	let user = document.createElement('t-user-info');
	user.setAttribute('data-nick', data.nickname);
	user.setAttribute('data-img', data.picture);
	user.setAttribute('data-id', data.pk);
	user.setAttribute('data-isLoggedin', 'false');
	document.querySelector('.user-profile-field').appendChild(user);

	let userInfo;
	if (data.nickname === appState.nickname) {
		userInfo = await getMyInfo(data);
		if (userInfo === null)
			return false;
	}
	else {
		userInfo = await getUserInfo(data);
		if (userInfo === null)
			return false;
		appendButtons(data, userInfo);
	}
	let quit = document.createElement('span');
	quit.classList.add('t-button');
	quit.classList.add('profile_user_quit');
	quit.innerText = 'x';
	document.querySelector('.user-button-field').appendChild(quit);

	document.querySelector('.inner_profile_win').innerText = userInfo.win;
	document.querySelector('.inner_profile_lose').innerText = userInfo.lose;
	document.querySelector('.profile_user_quit').addEventListener('click', () => {
		document.getElementById('above').classList.remove('above-on');
		document.getElementById('above').classList.remove('outter_setting');
    });
	return true;
}

function appendButtons(data, userInfo) {
	let pong = document.createElement('img');
	let message = document.createElement('img');
	let block = document.createElement('img');
	let friend = document.createElement('img');
	//<img id="s-button-pong" src="/assets/s-button-pong.svg">

	pong.classList.add('s-button');
	pong.classList.add('s-button-pong');
	message.classList.add('s-button');
	message.classList.add('s-button-message');
	block.classList.add('s-button');
	block.classList.add('s-button-block');
	friend.classList.add('s-button');
	friend.classList.add('s-button-friend');

	message.src = "/assets/s-button-message.svg";
	if (appState.inTournament)
		pong.src = "/assets/s-button-pong.svg";
	else
		pong.src = "/assets/s-button-unpong.svg";
	if (userInfo.blocked)
		block.src = "/assets/s-button-unblock.svg";
	else
		block.src = "/assets/s-button-block.svg";
	if (userInfo.following)
		friend.src = "/assets/s-button-unfollow.svg";
	else
		friend.src = "/assets/s-button-follow.svg";

	document.querySelector('.user-button-field').appendChild(pong);
	document.querySelector('.user-button-field').appendChild(message);
	document.querySelector('.user-button-field').appendChild(block);
	document.querySelector('.user-button-field').appendChild(friend);

	document.querySelector('.s-button-message').addEventListener('click', () => {messageHandler(data, userInfo);});
	document.querySelector('.s-button-block').addEventListener('click', () => {blockHandler(data, userInfo);});
	document.querySelector('.s-button-friend').addEventListener('click', () => {friendHandler(data, userInfo);});
	if (appState.inTournament)
		document.querySelector('.s-button-pong').addEventListener('click', () => {pongHandler(data);});
}

const chatHTML = `
    <textarea id="chat-log" cols="100" rows="20" readonly></textarea>
    <input id="chat-message-input" type="text" size="100" autocomplete="off" placeholder="Enter Message">
	`;
	// <img id="s-button-send" src="/assets/s-button-send.svg">

function messageHandler(data, userInfo) {
	const message = document.querySelector('.s-button-message');

	if (message.src == "https://${SERVER_ADDR}/assets/s-button-message.svg") {
		message.src = "/assets/s-button-unmessage.svg"
		document.querySelector('.inner_profile_bottom').classList.remove('default');
		document.querySelector('.inner_profile_bottom').innerHTML = chatHTML;
		initializeChat(data.pk, userInfo);
		appState.currentCleanupFn = () => {
			if (appState.chat_ws !== null)
				appState.chat_ws.close();
		};
	}
	else if (message.src == "https://${SERVER_ADDR}/assets/s-button-unmessage.svg") {
		message.src = "/assets/s-button-message.svg"
		document.querySelector('.inner_profile_bottom').innerHTML = "";
		document.querySelector('.inner_profile_bottom').classList.add('default');
		if (appState.chat_ws !== null)
			appState.chat_ws.close();
		appState.currentCleanupFn = null;
		putGameLog(data);
	}
}

function initializeChat(others, userInfo) {
    appState.chat_ws = new WebSocket(`wss://${SERVER_ADDR}/wss/chat/${others}/?token=${appState.token}`);

    // 메시지 수신 시 채팅 로그에 추가
    appState.chat_ws.onmessage = function(e) {
        const data = JSON.parse(e.data);
		if (data.type === "chat_message")
		{
			console.log(data);
        	document.querySelector('#chat-log').value += `${data.user_name}: ${data.message}\n`;
			
		}
		else if (data.type === "update")
		{
			console.log(data);
			document.querySelector('#chat-log').value += data.messages_text;
			if (data.messages_text !== "")
				document.querySelector('#chat-log').value += '\n';
		}
    };

    // WebSocket 연결 종료 시 오류 로그
    appState.chat_ws.onclose = function(e) {
		if (e.wasClean) {
			// 연결이 정상적으로 종료된 경우
			appState.chat_ws = null;
			console.log(`Chat socket closed cleanly, code=${e.code}, reason=${e.reason}`);
		} else {
			// 연결이 비정상적으로 종료된 경우
			appState.chat_ws = null;
			console.error(`Chat socket closed unexpectedly, code=${e.code}`);
		}
    };

    // 메시지 입력 및 전송 처리
    const messageInput = document.querySelector('#chat-message-input');
    if (messageInput) {
        messageInput.focus();
        messageInput.onkeyup = function(e) {
			fetch('/api/users/current/block/', {
				method: 'GET',
				headers: {
					'Authorization': "Token " + appState.token
				}
			})
			.then((response) => {
				if (response.status === 200) {
					return response.json();
				}
				else if (response.status === 401) {
					console.log('response 401')
					throw new Error('Bad Request');
				}
				else {
					console.log('Other status: ');
					throw new Error('Unexpected status code: ', response.status);
				}
			})
			.then((responseData) => {
				let isBlocked = responseData.blocked.some(user => {
					return user.pk === Number(others);
				});
				let isBlocks = responseData.blocks.some(user => {
					return user.pk === Number(others);
				});

				if (!isBlocks && !isBlocked && e.keyCode === 13 && messageInput.value.trim() !== '') {
					const message = messageInput.value;
					appState.chat_ws.send(JSON.stringify({
						'message': message,
						'sender': userInfo.username  // 사용자의 정보를 추가로 전송 가능
					}));
					messageInput.value = ''; // 입력 필드 초기화
				}
			})
			.catch(error => {
				console.log('Error: ', error);
			});
        };
    } else {
        console.error("Element with id 'chat-message-input' not found.");
    }
}

function checkCanTalk() {
	fetch('/api/users/current/block/', {
		method: 'GET',
		headers: {
			'Authorization': "Token " + appState.token
		}
	})
	.then((response) => {
		if (response.status === 200) {
			return response.json();
		}
		else if (response.status === 401) {
			console.log('response 401')
			throw new Error('Bad Request');
		}
		else {
			console.log('Other status: ');
			throw new Error('Unexpected status code: ', response.status);
		}
	})
	.then((responseData) => {
		console.log('responseData', responseData);
	})
	.catch(error => {
		console.log('Error: ', error);
	});
}

function blockHandler(data, userInfo) {
	fetch('/api/users/current/block/' + data.pk + '/', {
		method: 'POST',
		headers: {
			'Authorization': "Token " + appState.token
		}
	})
	.then((response) => {
		if (response.status === 200) {}
		else if (response.status === 401) {
			console.log('response 401')
			throw new Error('Bad Request');
		}
		else {
			console.log('Other status: ');
			throw new Error('Unexpected status code: ', response.status);
		}
	})
	.then(() => {
		console.log('userInfo.blocked', userInfo.blocked);
		if (userInfo.blocked) {
			document.querySelector('.s-button-block').src = "/assets/s-button-block.svg";
		}
		else {
			document.querySelector('.s-button-block').src = "/assets/s-button-unblock.svg";
		}
		profileUserPage(data);
	})
	.catch(error => {
		console.log('Error: ', error);
	});
}

function pongHandler(data) {
	appState.ws.send(JSON.stringify({ type: "invite", target_user_id: data.pk}));
	alert("invite Success");
}

function friendHandler(data, userInfo) {
	fetch('/api/users/current/follow/' + data.pk + '/', {
		method: 'POST',
		headers: {
			'Authorization': "Token " + appState.token
		}
	})
	.then((response) => {
		if (response.status === 200) {}
		else if (response.status === 401) {
			console.log('response 401')
			throw new Error('Bad Request');
		}
		else {
			console.log('Other status: ');
			throw new Error('Unexpected status code: ', response.status);
		}
	})
	.then(() => {
		console.log('userInfo.blocked', userInfo.following);
		if (userInfo.following) {
			document.querySelector('.s-button-friend').src = "/assets/s-button-follow.svg";
		}
		else {
			document.querySelector('.s-button-friend').src = "/assets/s-button-unfollow.svg";
		}
		profileUserPage(data);
		appState.ws.send(JSON.stringify({
            "type": "update_user_info",
            "field": "nick",
            "value": appState.nickname,
        }));
	})
	.catch(error => {
		console.log('Error: ', error);
	});
}

async function getMyInfo(data) {
	try {
		const response = await fetch('/api/users/' + data.pk, {
			method: 'GET',
			headers: {
				'Authorization': "Token " + appState.token
			}
		});

		if (response.status === 200) {
			const responseData = await response.json();
			console.log('Success data:', responseData);
			return responseData;
		} else if (response.status === 400) {
			const errorData = await response.json();
			let errorMessage = 'Error 400: Bad Request\n';
			console.log(errorMessage, errorData);
			throw new Error('Bad Request');
		} else {
			const errorData = await response.json();
			console.log('Other status:', errorData);
			throw new Error('Unexpected status code: ' + response.status);
		}
	} catch (error) {
		console.log('Error:', error);
		throw error;
	}
}

async function getUserInfo(data) {
	try {
		const response = await fetch('/api/users/current/other/' + data.pk, {
			method: 'GET',
			headers: {
				'Authorization': "Token " + appState.token
			}
		});

		if (response.status === 200) {
			const responseData = await response.json();
			console.log('Success data:', responseData);
			return responseData;
		} else if (response.status === 400) {
			const errorData = await response.json();
			let errorMessage = 'Error 400: Bad Request\n';
			console.log(errorMessage, errorData);
			throw new Error('Bad Request');
		} else {
			const errorData = await response.json();
			console.log('Other status:', errorData);
			throw new Error('Unexpected status code: ' + response.status);
		}
	} catch (error) {
		console.log('Error:', error);
		throw error;
	}
}