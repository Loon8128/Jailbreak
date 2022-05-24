// ==UserScript==
// @name         BC Jailbreak Loader
// @version      1.1
// @description  Roleplay oriented enhancements.
// @author       Loon8128
// @match        https://www.bondageprojects.elementfx.com/*
// @match        https://www.bondage-europe.com/*
// ==/UserScript==

(() => {
    let n = document.createElement('script');
    n.setAttribute('language', 'JavaScript');
    n.setAttribute('crossorigin', 'anonymous');
    n.setAttribute('src', 'https://loon8128.github.io/Jailbreak/jailbreak.js?_=' + Date.now());
    n.onload = () => n.remove();
    document.head.appendChild(n);
})();