import { appState } from '../index.js';

'use strict';

async function fetchTBlock() {
    const templateHTML = await fetch('./components/tBlock.html');
    const textHTMLTemplate = await templateHTML.text();
    return new DOMParser().parseFromString(textHTMLTemplate, 'text/html').querySelector('template');
}

const HTMLTemplate = await fetchTBlock();

export class TBlock extends HTMLElement {
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
        const border = this.shadowRoot.querySelector('.t-block__container div');
        const img = this.shadowRoot.querySelector('.image-profile-small img');
        const nickname = this.shadowRoot.querySelector('.t-block__nickname');

		if (this.getAttribute('data-status') === 'wait') {
			nickname.innerHTML = '?';
		}
        else if (appState.picture !== null) {
            img.src = appState.picture;
			nickname.innerHTML = appState.nickname;
		}
		if (appState.isLoggedIn)
			border.classList.add("connected");
    }
}

customElements.define('t-block', TBlock);
