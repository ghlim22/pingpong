import { appState, basePath, TUserInfo, TInvite, TFold, navigate, parseUrl, pong1VS1Page } from '/index.js';


const mainHTML = `  
<div class="outter_setting">
<div class="inner_setting">
    <div class="inner_setting_window">
		<span id="setting_quit" class="t-button">x</span>
        <div class="inner_setting_top">
			<span>Edit Profile</span>
        </div>
        <div class="inner_setting_main">
			<form id="form-picture" data-picture>
				<input required type="file" id="imgInput" class="chooseFile" accept=".png, .jpg, .jpeg"></input>
				<label for="imgInput">edit picture</label>
				<div id="form-picture-img-label">
					<span id="form-picture-file-name">file is not selected</span>
					<button type="submit" id="picture-submit" data-picture>
						<span class="t-button">v</span>
					</button>
				</div>
			</form>
			<form id="form-nickname" data-nickname>
				<label for="nickInput">edit nickname</label>
				<div>
				<input required type="text" id="nickInput" class="type-info" placeholder="Enter Nickname" autocomplete="off"></input>
				<button type="submit" id="nickname-submit" data-nickname>
					<span class="t-button">v</span>
				</button>
				</div>
			</form>
		</div>
        <div class="inner_setting_bottom"></div>
    </div>
</div>
</div>
`;

export function settingPage() {

	if (appState.chat_ws !== null)
		appState.chat_ws.close();
	//appState.currentCleanupFn = null;
	const above = document.getElementById('above');
	above.innerHTML = mainHTML;

	document.getElementById('above').classList.add('above-on');
	document.getElementById('above').classList.add('outter_setting');
	document.querySelector('#setting_quit').addEventListener('click', () => {
		document.getElementById('above').classList.remove('above-on');
		document.getElementById('above').classList.remove('outter_setting');
    });
	document.getElementById('imgInput').addEventListener('change', (e) => {
		let file = e.target.files[0];
		document.getElementById('form-picture-file-name').textContent = file.name;
	});
}

export function submitPicture(event) {
	if (!(event.target.matches('[data-picture]'))) {
		return ;
	}
	const picture = event.target.querySelector('#imgInput').files[0];
	const formData = new FormData();
	formData.append('picture', picture);
	
	fetch('api/users/current/', {
		method: 'PATCH',
		headers: {
			'Authorization': "Token " + appState.token
		},
		body: formData
	})
	.then((response) => {
		if (response.status === 200) {
			return response.json().then(data => {
				return data;
			});
		} else if (response.status === 401) {
			return response.json().then(data => {
				let errorMessage = 'Error 401: Bad Request\n';
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
		console.log('edit success');
		alert('edit success');
		appState.picture = data['picture'];
		appState.ws.send(JSON.stringify({
            "type": "update_user_info",
            "field": "img",
            "value": data['picture'],
        }));
		//if (appState.ws !== null)
		//	appState.ws.close();
		//appState.ws = null;
		//navigate(parseUrl(basePath + 'setting'));
		sessionStorage.setItem('appState', JSON.stringify(appState));
	})
	.catch(error => {
		console.log('Error: ', error);
	});
}

export function submitNickname(event) {
	if (!(event.target.matches('[data-nickname]'))) {
		return ;
	}

	const nickname = event.target.querySelector('#nickInput').value;
	
	const formData = new FormData();
	formData.append('nickname', nickname);

	fetch('api/users/current/', {
		method: 'PATCH',
		headers: {
			'Authorization': "Token " + appState.token
		},
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
				alert(errorMessage + data);
				throw new Error('Bad Request');
			});
		} else {
			return response.json().then(data => {
				console.log('Other status: ', data);
				throw new Error('Unexpected status code: ', response.status);
			});
		}
	})
	.then(() => {
		console.log('edit success');
		alert('edit success');
		appState.nickname = nickname;
		appState.ws.send(JSON.stringify({
            "type": "update_user_info",
            "field": "nick",
            "value": nickname,
        }));
		//if (appState.ws !== null)
		//	appState.ws.close();
		//appState.ws = null;
		//navigate(parseUrl(basePath + 'setting'));
		sessionStorage.setItem('appState', JSON.stringify(appState));
	})
	.catch(error => {
		console.log('Error: ', error);
	});
}