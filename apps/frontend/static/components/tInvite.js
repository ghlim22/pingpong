import { appState } from '../index.js';
import { TUserInfo } from '../index.js';

'use strict';

async function fetchTInvite() {
    const templateHTML = await fetch('/components/tInvite.html');
    const textHTMLTemplate = await templateHTML.text();
    return new DOMParser().parseFromString(textHTMLTemplate, 'text/html').querySelector('template');
}

const HTMLTemplate = await fetchTInvite();

export class TInvite extends HTMLElement {
    constructor() {
        super();
        //this.addEventListener('click', e => this.toggleCard());
    }

    connectedCallback() {
        const shadowRoot = this.attachShadow({mode: 'open'});
        const instance = HTMLTemplate.content.cloneNode(true);
        shadowRoot.appendChild(instance);
		this.render();
    }

    render() {
        const border = this.shadowRoot.querySelector('.t-invite__container');
        //if (appState.picture !== null)
        //    img.src = appState.picture;
        //nickname.innerHTML = appState.nickname;
		if (appState.invitation > 0)
			border.classList.add("receive-invitation");
    }
}

customElements.define('t-invite', TInvite);
