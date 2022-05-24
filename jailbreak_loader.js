// ==UserScript==
// @name         BC Jailbreak Loader
// @version      1.0
// @description  Roleplay oriented enhancements.
// @author       Loon8128
// @match        https://www.bondageprojects.elementfx.com/*
// @match        https://www.bondage-europe.com/*
// ==/UserScript==

(() => {
    let n = document.createElement('script');
    n.setAttribute('language', 'JavaScript');
    n.setAttribute('crossorigin', 'anonymous');
    n.setAttribute('src', 'https://raw.githubusercontent.com/Loon8128/Jailbreak/main/jailbreak.js?_=' + Date.now());
    n.onload = () => n.remove();
    document.head.appendChild(n);
})();