import { appState, basePath, TUserInfo, TInvite, TFold, navigate, parseUrl, pong1VS1Page } from '../../index.js';

const topHTML = `
<span class="logo-small">PONG</span>
`;

const mainHTML = `  
<div class="inner_chat">
    <div class="inner_chat_list">
        <t-user-info class="p-button-user"></t-user-info>
        <t-user-info class="p-button-user"></t-user-info>
        <t-user-info class="p-button-user"></t-user-info>
        <t-user-info class="p-button-user"></t-user-info>
        <t-user-info class="p-button-user"></t-user-info>
        <t-user-info class="p-button-user"></t-user-info>
        <t-user-info class="p-button-user"></t-user-info>
        <t-user-info class="p-button-user"></t-user-info>
        <t-user-info class="p-button-user"></t-user-info>
    </div>
    <div class="inner_chat_window">
        <div class="inner_chat_top">
            <span class="t-button">x</span>
        </div>
        <div class="inner_chat_main"></div>
        <div class="inner_chat_bottom"></div>
    </div>
</div>
`;

export function chatPage() {
	document.getElementById('top').innerHTML = topHTML;
	document.getElementById('main').innerHTML = mainHTML;

	document.querySelector('.t-button').addEventListener('click', () => {
        navigate(parseUrl(basePath));
    });
}


{/* <div>nickname</div>
        <textarea id="chat-log" readonly></textarea><br></br> */}