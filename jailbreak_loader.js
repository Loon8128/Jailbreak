// ==UserScript==
// @name         BC Jailbreak Loader
// @version      1.2
// @description  Roleplay oriented enhancements.
// @author       Loon8128
// @match        https://www.bondageprojects.elementfx.com/*
// @match        https://www.bondage-europe.com/*
// ==/UserScript==

(() => {
    const params = new URLSearchParams(window.location.search);
    const url = `${params.has('jailbreak') && params.get('jailbreak') === 'local' ? 'http://localhost:8080' : 'https://loon8128.github.io/Jailbreak'}/jailbreak.js?_=${Date.now()}`;

    const script = document.createElement('script');
    script.setAttribute('language', 'JavaScript');
    script.setAttribute('crossorigin', 'anonymous');
    script.setAttribute('src', url);
    script.setAttribute('data-loader-version', '1.2');
    script.id = 'jailbreak-main';
    script.onload = () => script.remove();
    document.head.appendChild(script);
})();