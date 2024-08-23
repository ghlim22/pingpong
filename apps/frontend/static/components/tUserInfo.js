import { appState, navigate, parseUrl, basePath } from '../index.js';

'use strict';

async function fetchTUserInfo() {
    const templateHTML = await fetch('./components/tUserInfo.html');
    const textHTMLTemplate = await templateHTML.text();
    return new DOMParser().parseFromString(textHTMLTemplate, 'text/html').querySelector('template');
}

const HTMLTemplate = await fetchTUserInfo();

export class TUserInfo extends HTMLElement {
    constructor() {
        super();
        // this.nick = null;
        // this.img = null;
        // this.id = null;
        // this.isLoggedin = false;
    }

    connectedCallback() {
        const shadowRoot = this.attachShadow({mode: 'open'});
        const instance = HTMLTemplate.content.cloneNode(true);
        shadowRoot.appendChild(instance);

        this.nick = this.getAttribute('data-nick');
        this.img = this.getAttribute('data-img');
        this.id = this.getAttribute('data-id');
        this.isLoggedin = this.getAttribute('data-isLoggedin');
        this.render();
    }
    
    render() {
        const border = this.shadowRoot.querySelector('.t-user-info__container div');
        const img = this.shadowRoot.querySelector('.image-profile-small img');
        const nickname = this.shadowRoot.querySelector('.t-user-info__nickname');
        
        if (this.img !== null) img.src = this.img;
        nickname.innerHTML = this.nick;
        if (this.isLoggedin === 'true') border.classList.add("connected");

		this.addEventListener('click', () => {
			navigate(parseUrl(basePath + 'profile/:' + this.nick));
		});
    }
}

customElements.define('t-user-info', TUserInfo);

