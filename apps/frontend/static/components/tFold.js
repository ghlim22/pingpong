import { appState, TUserInfo } from '../index.js';

'use strict';

async function fetchTFold() {
    const templateHTML = await fetch('./components/tFold.html');
    const textHTMLTemplate = await templateHTML.text();
    return new DOMParser().parseFromString(textHTMLTemplate, 'text/html').querySelector('template');
}

const HTMLTemplate = await fetchTFold();

export class TFold extends HTMLElement {
    constructor() {
        super();
		this.fold = this.fold.bind(this)
    }

    connectedCallback() {
        const shadowRoot = this.attachShadow({mode: 'open'});
        const instance = HTMLTemplate.content.cloneNode(true);
        shadowRoot.appendChild(instance);
		this.render();
    }

    render() {
        const span = this.shadowRoot.querySelector('.t-fold__id span');
        const img = this.shadowRoot.querySelector('.t-fold__id img');
        const folder = this.shadowRoot.querySelector('.t-fold__users');
		let folderHTML = "";
		let foldState = "";

		if (this.classList.contains('connect')) {
			foldState = appState.connect;
			span.innerHTML = "connect";
		}
		else {
			foldState = appState.friend;
			span.innerHTML = "friend";
			this.shadowRoot.querySelector('.t-fold__id').classList.add('friend');
		}
		for (let i = 0; i < foldState; i++) {
			folderHTML = folderHTML + `<t-user-info class="p-button-user"></t-user-info>`;
		}
		folder.innerHTML = folderHTML;
        img.addEventListener('click', this.fold);
	}

	fold() {
        const container = this.shadowRoot.querySelector('.t-fold__container');
        const folder = this.shadowRoot.querySelector('.t-fold__users');
		const isContain = container.classList.contains('fold');
		if (!isContain) {
			container.classList.add('fold');
			folder.classList.add('fold');
		} else {
			container.classList.remove('fold');
			folder.classList.remove('fold');
		}
	}
}

customElements.define('t-fold', TFold);
