import { appState, navigate, parseUrl, basePath } from '/index.js';
import { TUserInfo } from '/index.js';

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
		//this.render();
    }

//    render() {
//        const border = this.shadowRoot.querySelector('.t-invite__container');
//    }

	setInvitation(nickData, imgData) {
        const nick = this.shadowRoot.querySelector('.t-user-info__nickname');
        const img = this.shadowRoot.querySelector('.image-profile-small img');

		nick.innerText = nickData;
		img.src = imgData;

		this.displayOn();
	}

	displayOn() {
        const border = this.shadowRoot.querySelector('.t-invite__container');
        const yes = this.shadowRoot.querySelector('.invite_yes');
        const no = this.shadowRoot.querySelector('.invite_no');
		border.classList.add("receive-invitation");

		yes.addEventListener('click', () => {
    border.classList.remove("receive-invitation");
    if (!appState.inTournament)
			navigate(parseUrl({
				pathname: '/tournament',
				search: ""
			}));
		})
		no.addEventListener('click', () => {
            border.classList.remove("receive-invitation");
        });
	}
}

customElements.define('t-invite', TInvite);
