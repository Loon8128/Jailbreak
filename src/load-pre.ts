// Allow reentrant loading via loading the entire script.
if (typeof jailbreak !== 'undefined') jailbreak.unload();

// Replace the global mod instance
jailbreak = {
    version: '1.20',
    loaderVersion: document.getElementById('jailbreak-main').getAttribute('data-loader-version'),
    targetVersion: 'R106',

    reload: () => {
        const params: URLSearchParams = new URLSearchParams(window.location.search);
        const url: string = `${params.has('jailbreak') && params.get('jailbreak') === 'local' ? 'http://localhost:8080' : 'https://loon8128.github.io/Jailbreak'}/jailbreak.js?_=${Date.now()}`;
    
        const script: HTMLScriptElement = document.createElement('script');
        script.setAttribute('language', 'JavaScript');
        script.setAttribute('crossorigin', 'anonymous');
        script.setAttribute('src', url);
        script.setAttribute('data-loader-version', 'R');
        script.id = 'jailbreak-main';
        script.onload = () => script.remove();
        document.head.appendChild(script);
    },

    unload: () => {
        for (let h of jailbreak.hooks) {
            unhook(window[h]);
        }
        jailbreak.loaded = false;
        jailbreak.hooks = new Set();
    },

    hooks: new Set(),
    loaded: false,
    api: {},
    hook: {},
};

/**
 * Replaces a given function. Invoking the original function can be done via f.delegate()
 * @param f The function to replace
 * @param g The function to replace with
 */
hook = function(f, g) {
    if (typeof f.delegate === 'function') {
        if (!jailbreak.loaded) throw new Error(`Illegal reentrant hook during loading for ${f.delegate.name}`);
        f = f.delegate;
    }
    jailbreak.hooks.add(f.name);
    window[f.name] = g;
    window[f.name].delegate = f;
};

// Lambda capture binds `f` to the inner function, so an explicit call to .delegate is not required.
hookHead = (f, g) => hook(f, (...args) => { g(...args); return f(...args); });
hookTail = (f, g) => hook(f, (...args) => { const ret = f(...args); g(...args); return ret; });

rewrite = function(f, patches) {
    if (typeof f.delegate === 'function') {
        if (!jailbreak.loaded) throw new Error(`Illegal reentrant hook during loading for ${f.delegate.name}`);
        f = f.delegate;
    }
    let original = f;
    let src = f.toString().replace('\r', '');
    for (const [k, v] of Object.entries(patches)) {
        if (!src.includes(k)) {
            console.error(`Patch not applied: function ${f.name}, target ${k} -> ${v}`);
        }
        src = src.replaceAll(k, v);
    }
    try {
        (1, eval)(src);
    } catch (e) {
        console.error(`Error ${e} patching ${f.name}, new source:\n${src}`);
    }
    jailbreak.hooks.add(original.name);
    window[original.name].delegate = original;
};

/**
 * Removes the hook, or patch, for a given function.
 */
unhook = function(f) {
    if (typeof f.delegate === 'function') {
        window[f.delegate.name] = f.delegate;
    } else {
        console.error(`Function ${f.name} is not hooked or patched`);
    }
};