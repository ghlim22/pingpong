import { appState } from '../index.js';

'use strict';

async function fetchTUserInfo() {
    const templateHTML = await fetch('/components/tUserInfo.html');
    const textHTMLTemplate = await templateHTML.text();
    return new DOMParser().parseFromString(textHTMLTemplate, 'text/html').querySelector('template');
}

const HTMLTemplate = await fetchTUserInfo();

export class TUserInfo extends HTMLElement {
    constructor() {
        super();
        //this.addEventListener('click', e => this.toggleCard());
    }

    connectedCallback() {
        const shadowRoot = this.attachShadow({mode: 'open'});
        const instance = HTMLTemplate.content.cloneNode(true);
        shadowRoot.appendChild(instance);
        //const id = this.getAttribute('data-id');
		this.render();
    }

    render() {
        const border = this.shadowRoot.querySelector('.t-user-info__container div');
        const img = this.shadowRoot.querySelector('.image-profile-small img');
        const nickname = this.shadowRoot.querySelector('.t-user-info__nickname');

        if (appState.picture !== null)
            img.src = appState.picture;
        nickname.innerHTML = appState.nickname;
		if (appState.isLoggedIn)
			border.classList.add("connected");
    }
}

customElements.define('t-user-info', TUserInfo);
