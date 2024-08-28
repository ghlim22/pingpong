import { appState, TUserInfo } from '/index.js';

'use strict';

async function fetchTFold() {
    const templateHTML = await fetch('/components/tFold.html');
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

	addUserInfo(user) {
        const folder = this.shadowRoot.querySelector('.t-fold__users');
		folder.appendChild(user);
	}

	removeAll() {
		const folder = this.shadowRoot.querySelector('.t-fold__users');
		folder.replaceChildren();
	}

    render() {
        const span = this.shadowRoot.querySelector('.t-fold__id span');
        const img = this.shadowRoot.querySelector('.t-fold__id img');

		if (this.classList.contains('connect')) {
			span.innerHTML = "connect";
		}
		else {
			span.innerHTML = "friend";
			this.shadowRoot.querySelector('.t-fold__id').classList.add('friend');
		}
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
