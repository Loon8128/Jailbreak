// Allow reentrant loading via loading the entire script.
if (typeof jailbreak !== 'undefined') jailbreak.unload();

// Replace the global mod instance
jailbreak = {
    author: 'Loon8128',
    version: '1.18',
    loaderVersion: document.getElementById('jailbreak-main').getAttribute('data-loader-version'),
    targetVersion: 'R93',

    reload: () => {
        const params = new URLSearchParams(window.location.search);
        const url = `${params.has('jailbreak') && params.get('jailbreak') === 'local' ? 'http://localhost:8080' : 'https://loon8128.github.io/Jailbreak'}/jailbreak.js?_=${Date.now()}`;
    
        const script = document.createElement('script');
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

    // Chat-visible API via the /api command
    api: {},

    // Non-chat visible API
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

/**
 * Rewrites (or patches) a given function by string replacement
 * @param f The function to patch
 * @param patches A object of {replace: with} key value pairs, which are applied as patches to the original function
 */
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

/**
 * Executes a given function and logs the runtime in ms
 */
profiler = function(fn) {
    let tick = performance.now();
    fn();
    console.log(`${performance.now() - tick} ms`);
}

/**
 * Dispatches a series of hooks in the form `(args, next) => {}` sequentially.
 */
apiDispatch = function(hooks, args, fn) {
    const term = fn.delegate;
    fn = args => term(...args);
    for (const hook of hooks) {
        const next = fn;
        fn = args => hook.hook(args, () => next(args));
    }
    return fn(args);
}

escapeHtml = (() => {
    const HTML_ESCAPE_ENTITIES = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };
    
    return text => String(text).replace(/[\&<>"'`=\/]/g, s => HTML_ESCAPE_ENTITIES[s]);
})();

// Opens a new tab, with some plain text html, good for large copy-paste operations
openAsPlainText = function(lines) {
    let text = lines.map(t => `<p>${escapeHtml(t)}</p>`).join('');
    let w = window.open();
    w.document.write(text);
}


// ============================ Jailbreak Main Functionality ============================


// FEATURE: Add all items, including restricted ones.

// No-op the login functions which remove select items and add them manually
hook(LoginMistressItems, () => {});
hook(LoginStableItems, () => {});
hook(LoginMaidItems, () => {});
hook(LoginAsylumItems, () => {});

jailbreak.obtainAllItems = () => {

    const SPECIAL_ITEMS = [
        {Name: "MistressGloves", Group: "Gloves"},
        {Name: "MistressBoots", Group: "Shoes"},
        {Name: "MistressTop", Group: "Cloth"},
        {Name: "MistressBottom", Group: "ClothLower"},
        {Name: "MistressPadlock", Group: "ItemMisc"},
        {Name: "MistressPadlockKey", Group: "ItemMisc"},
        {Name: "MistressTimerPadlock", Group: "ItemMisc"},
        {Name: "DeluxeBoots", Group: "Shoes"},
        {Name: "HarnessPonyBits", Group: "ItemMouth"},
        {Name: "HarnessPonyBits", Group: "ItemMouth2"},
        {Name: "HarnessPonyBits", Group: "ItemMouth3"},
        {Name: "PonyBoots", Group: "Shoes"},
        {Name: "PonyBoots", Group: "ItemBoots"},
        {Name: "PonyHood", Group: "ItemHood"},
        {Name: "HoofMittens", Group: "ItemHands"},
        {Name: "MaidOutfit1", Group: "Cloth"},
        {Name: "MaidOutfit2", Group: "Cloth"},
        {Name: "MaidHairband1", Group: "Cloth"},
        {Name: "MaidApron1", Group: "Cloth"},
        {Name: "MaidHairband1", Group: "Hat"},
        {Name: "ServingTray", Group: "ItemMisc"},
        {Name: "DusterGag", Group: "ItemMouth"},
        {Name: "MedicalBedRestraints", Group: "ItemArms"},
        {Name: "MedicalBedRestraints", Group: "ItemLegs"},
        {Name: "MedicalBedRestraints", Group: "ItemFeet"},
        {Name: "Camera1", Group: "ClothAccessory"},
        {Name: "SpankingToysGavel", Group: "ItemHands"},
        {Name: "SpankingToysLongDuster", Group: "ItemHands"},
        {Name: "LeatherCuffs", Group: "ItemArms"},
        {Name: "LeatherCuffsKey", Group: "ItemArms"},
        {Name: "SpankingToysBaguette", Group: "ItemHands"},
        {Name: "PandoraPadlock", Group: "ItemMisc"},
        {Name: "PandoraPadlockKey", Group: "ItemMisc"},
        {Name: "CollegeOutfit1", Group: "Cloth"},
        {Name: "NurseUniform", Group: "Cloth"},
        {Name: "CollegeSkirt", Group: "ClothLower"},
        {Name: "NurseCap", Group: "Hat"},
        {Name: "CollegeDunce", Group: "Hat"},
        {Name: "Ribbons2", Group: "HairAccessory3"},
        {Name: "Ribbons2", Group: "HairAccessory1"},
        {Name: "StraponPanties", Group: "ItemPelvis"},
        {Name: "Pillory", Group: "ItemArms"},
        {Name: "SpankingToysTennisRacket", Group: "ItemHands"},
        {Name: "SpankingToysRainbowWand", Group: "ItemHands"},
        {Name: "ChloroformCloth", Group: "ItemMouth2"},
        {Name: "ChloroformCloth", Group: "ItemMouth3"},
        {Name: "WoodenPaddle", Group: "ItemMisc"},
        {Name: "SpankingToys", Group: "ItemHands"},
    ];

    let items = Asset.filter(asset => asset.Value > 0).map(asset => ({Name: asset.Name, Group: asset.Group.Name}));
    SPECIAL_ITEMS.forEach(asset => items.push(asset));
    ShopSellExceptions.forEach(asset => items.push(asset));

    InventoryAddMany(Player, items);
    LoginValideBuyGroups();
};

jailbreak.checkForMissingItems = () => {
    // Checks items that we didn't obtain, either because they're special, or hardcoded, or we need to add exceptions to them
    let ownedAssets = new Set(Player.Inventory.map(a => a.Asset));
    return Asset.filter(a => !ownedAssets.has(a))
        .filter(a => !(a.Group.Category === 'Appearance' && a.Value === 0)); // These are 'Default' clothing items
};

hookTail(LoginResponse, data => {
    if (typeof data === 'object' && data.Name != null && data.AccountName != null) {
        jailbreak.obtainAllItems();
    }

    // Fix certain settings that are expected / are broken without
    Object.assign(Player?.GenderSettings?.AutoJoinSearch || {}, {Male: true, Female: true});
    Object.assign(Player?.ChatSettings || {}, {
        ColorTheme: 'Light',
        EnterLeave: 'Smaller',
        FontSize: 'Medium',
        MemberNumbers: 'Always',
        ShrinkNonDialogue: true,
        ShowChatHelp: false,
        DisplayTimestamps: true,
    });
});


// FEATURE: Allow player to use all backgrounds, including identifying them with a 'custom' tag.
(() => {
    const backgrounds = [
        ShopBackground,
        'Pandora/Ground/Entrance',
        'Pandora/Second/Entrance',
        'Pandora/Underground/Entrance'
    ];
    const specialBackgroundTag = 'Special';
    const addedBackgroundTags = ['Asylum', specialBackgroundTag];
    
    // Pandora backgrounds
    for (let i = 0; i < 6; i++) {
        ['Cell', 'Fork', 'Tunnel'].forEach(shape => backgrounds.push(`Pandora/Second/${shape}${i}`, `Pandora/Underground/${shape}${i}`));
    }
    
    backgrounds.forEach(bg => BackgroundsList.push({Name: bg, Tag: [specialBackgroundTag]}));
    addedBackgroundTags.forEach(tag => BackgroundsTagList.push(tag));
})();


// FEATURE: Custom CSS for chat rooms
(() => {
    const customStyleId = 'jailbreak-custom-style';
    let styleElement = document.getElementById(customStyleId);
    if (styleElement === null) {
        styleElement = document.createElement('style');
        styleElement.id = customStyleId;
        document.body.appendChild(styleElement);
    }
    
    styleElement.innerHTML = `
    .ChatMessageHiddenFeedback {
        font-style: italic;
        font-size: 0.75em;
        color: silver;
    }

    #TextAreaChatLog[data-shrinknondialogue=true] .ChatMessageEmote {
        font-size: 1.0em;
    }
    `;
})();


// FEATURE: Allow movement into the asylum chat rooms at will
hook(AsylumEntranceCanWander, () => true);


// FEATURE: Allow taking photos anywhere
hook(DialogCanTakePhotos, () => true);


// FEATURE: Allow clicking on the appearance button in chat rooms at any time, even if it is greyed out due to restraints
// FEATURE: Allow kneeling and standing up at any time, without triggering a minigame
// FEATURE: Allow leaving chat rooms, independent of slowing effects or preventing effects, while still displaying yellow/red
rewrite(ChatRoomMenuClick, {
    'case "Exit": {': 'case "Exit": { ChatRoomLeave(); CommonSetScreen("Online", "ChatSearch"); break;',
    'Player.CanKneel()': '(Player.CanKneel() || ChatRoomCanAttemptKneel() || ChatRoomCanAttemptStand())',
    'Player.CanChangeOwnClothes()': 'true',
});

// FEATURE: Allow interacting with inventory, even when it would be blocked
// FEATURE: When interacting with the player, bypass blocked groups
rewrite(DialogDraw, { 
    'DialogDraw() {': 'DialogDraw() { jailbreak.hook.dialog_draw();',
    '!Player.CanInteract()': 'false',
    'InventoryGroupIsBlocked(C)': '(C != Player && InventoryGroupIsBlocked(C))',
});

rewrite(DialogClick, {
    'DialogClick() {': 'DialogClick() { { const ret = jailbreak.hook.dialog_click(); if (ret) return ret[0]; }',
    'Player.CanInteract() && ': '',
    'InventoryGroupIsBlocked(C, null, true)': '(C != Player && InventoryGroupIsBlocked(C, null, true))'
});

// FEATURE: Remove the 'Tighten / Loosen' button
// - It's useless, given we ignore any sort of restraint restriction in favor of not giving the user carpal tunnel mashing keys
// - It annoyingly fixes expressions and doesn't clear them, because it was written by a muppet
rewrite(DialogMenuButtonBuild, {
    'DialogMenuButton.push("TightenLoosen");': '{}',
    'Player.CanInteract()': 'true',
    'InventoryGroupIsBlocked(C)': '(C != Player && InventoryGroupIsBlocked(C))',
});

rewrite(DialogItemClick, {
    'InventoryGroupIsBlocked(C, null, true)': '(C != Player && InventoryGroupIsBlocked(C, null, true))'
});


// FEATURE: Bypass the struggle minigame for applying, and removing items, entirely.
hook(DialogStruggleStart, (player, action, prevItem, nextItem) => {
    if (nextItem && nextItem.Asset) {
        let played = AudioPlaySoundForAsset(player, nextItem.Asset);
        if (!played && prevItem && prevItem.Asset) {
            AudioPlaySoundForAsset(player, prevItem.Asset)
        }
    }
    DialogStruggleAction = action;
    DialogStruggleStop(player, 'Strength', {
        Progress: 100,
        PrevItem: prevItem,
        NextItem: nextItem,
        Skill: 0,
        Attempts: 1,
        Interrupted: false,
    });
});

// FEATURE: API for using `ItemScript`
getScriptItem = (player) => {
    if (player === undefined) player = Player;
    let script = InventoryGet(player, 'ItemScript');
    if (!script)
    {
        InventoryWear(player, 'Script', 'ItemScript');
        script = InventoryGet(player, 'ItemScript');
        script.Property ||= {};
        ChatRoomCharacterUpdate(player);
    }
    return script;
}


function setItemLayerPriority(item, priority) {
    if (item) {
        if (!item.Property) {
            item.Property = {};
        }
        item.Property.OverridePriority = priority;
    }
}


// FEATURE: Chat command API for editing item priority and script item properties
hookTail(AssetLoadAll, () => {
    Object.assign(jailbreak.api, {
        item: {
            reset(player) {
                getScriptItem(player).Property = {};
                syncPlayer(player);
            }
        },
        layer: {}
    });

    function arrayRemove(arr, value) {
        let index = arr.indexOf(value);
        if (index > -1) {
            arr.splice(index, 1);
        }
    }

    for (const group of AssetGroup) {
        jailbreak.api.item[group.Name] = {
            hide: (player) => {
                let script = getScriptItem(player);
                script.Property.Hide ||= [];
                script.Property.Hide.push(group.Name);
                syncPlayer(player);
            },
            unHide: (player) => {
                let script = getScriptItem(player);
                script.Property.UnHide ||= [];
                script.Property.UnHide.push(group.Name);
                syncPlayer(player);
            },
            reset: (player) => {
                let script = getScriptItem(player);
                arrayRemove(script.Property?.Hide, group.Name);
                arrayRemove(script.Property?.UnHide, group.Name);
                syncPlayer(player);
            }
        };

        jailbreak.api.layer[group.Name] = {
            set: (priority, player) => {
                if (player === undefined) player = Player;
                const item = InventoryGet(player, group.Name);
                setItemLayerPriority(item, priority);
                syncPlayer(player);
            },
            reset: (player) => {
                if (player === undefined) player = Player;
                const item = InventoryGet(player, group.Name);
                if (item && item.Property && item.Property.OverridePriority) {
                    delete item.Property.OverridePriority;
                }
                syncPlayer(player);
            }
        };
    }
});

// FEATURE: Allow coloring anything, even if we couldn't normally interact due to restraints.
// Replace `DialogCanColor` with one that checks only if the item is colorable.
hook(DialogCanColor, (C, Item) => !Item || (Item && Item.Asset && Item.Asset.ColorableLayerCount > 0) || DialogAlwaysAllowRestraint())

// FEATURE: Decode garbled messages and display beneath
// Even the minimal API is crap, and not reentrant. So we have to do this check
ChatRoomMessageHandlers = ChatRoomMessageHandlers.filter(c => typeof c.from === 'undefined' || c.from !== 'jailbreak');
ChatRoomMessageHandlers.push({
    from: 'jailbreak',
    Priority: 501, // After the chat message is saved to log, and displayed
    Callback: (data) => {
        const last = ChatRoomChatLog[ChatRoomChatLog.length - 1];
        if (data.Type === 'Chat' && last !== undefined && last.Garbled !== last.Original) {
            sendHiddenMessage(`(${data.Content})`);
        }
        return false;
    }
});


// FEATURE: Custom commands support, for /**, /*, /export, /save, /restore
// FEATURE: Use API for even more reentrancy
jailbreak.hook.chat_room_send_chat = [{
    from: 'jailbreak',
    hook: (_, next) => {
    // Inject into ChatRoomSendChat to handle new commands.
    // R71's command handler fails on many levels (calls .trim() too aggressively, bad assumptions about word boundaries, doesn't support substring commands, etc.)
    const text = ElementValue('InputChat').trim().replace('\\', '/');
    if (text.startsWith('/**')) {
        sendCustomEmote(text.substring('/**'.length).trim());
    } else if (text.startsWith('/*')) {
        sendCustomEmote(Player.Name + text.substring('/*'.length));
    } else if (text === '/export') {
        exportChat();
    } else if (text === '/save') {
        savePlayerAppearance();
    } else if (text === '/restore') {
        restorePlayerAppearance();
    } else if (text === '/blind' || text == '/truesight') {
        toggleTrueSight();
    } else if (text.startsWith('/api')) {
        let apiScript = text.substring('/api'.length).trim();
        try {
            if (apiScript.startsWith('.')) apiScript = apiScript.substring(1);
            if (apiScript !== '') apiScript = 'jailbreak.api.' + apiScript;
            else apiScript = 'jailbreak.api';
            let ret = (1, eval)(apiScript);
            if (ret !== undefined) {
                try {
                    ret = `[${Object.keys(ret).reduce((a, b) => a + ', ' + b)}]`;
                } catch (e) {}
                sendHiddenMessage(ret, true);
            }
        } catch (e) {
            sendHiddenMessage(e, true);
        }
    } else {
        // Default behavior
        return next();
    }
    ElementValue('InputChat', '');
}}];

hook(ChatRoomSendChat, () => apiDispatch(jailbreak.hook.chat_room_send_chat, [], ChatRoomSendChat));


// FEATURE: Send only typing indicators (not status indicators)
hook(ChatRoomStatusUpdate, status => {
    // Send: [Talk (Typing)], Ignore: [Crawl, Orgasm, Preference, Struggle, Wardrobe]
    if (status === 'Talk') {
        ChatRoomStatusUpdate.delegate(status);
    }
});

sendBCXHello = () => sendBCXMessage('hello', {version: '☠️', request: false, effects: {}, typingIndicatorEnable: true});
sendBCXGoodbye = () => sendBCXMessage('goodbye', {});

sendBCXMessage = function(type, message) {
    ServerSend('ChatRoomChat', {
        Type: 'Hidden',
        Content: 'BCXMsg',
        Dictionary: {type: type, message: message}
    });
}


// FEATURE: Save and load player appearance including restraints
savePlayerAppearance = function(player) {
    if (player === undefined) {
        player = Player;
    }

    let packed = [];
    for (let asset of player.Appearance) {

        packed.push([
            asset.Asset.Name,
            asset.Asset.Group.Name,
            asset.Color === undefined ? -1 : (asset.Color === 'Default' ? -2 : asset.Color),
            asset.Property === undefined ? -1 : asset.Property,
            asset.Difficulty === undefined || asset.Difficulty === 0 ? -1 : asset.Difficulty,
        ]);
    }

    let compressed = LZString.compressToBase64(JSON.stringify(packed));
    console.log(`Compressed to ${compressed.length} bytes`);
    prompt('Saved player appearance (press CTRL-C to copy)', compressed);
}

restorePlayerAppearance = function(player) {
    if (player === undefined) {
        player = Player;
    }
    let compressed = prompt('Input player appearance string');
    if (compressed === undefined || compressed === null || compressed === '') return; // Canceled prompt

    let packed = JSON.parse(LZString.decompressFromBase64(compressed));
    let appearance = [];
    for (let packedAsset of packed) {
        if (Array.isArray(packedAsset)) {
            // v2 compression - properties are stored in an array of predictable index
            // produces about 25% smaller results than v1
            [assetName, assetGroup, color, property, difficulty] = packedAsset;
            let asset = {Asset: AssetGet('Female3DCG', assetGroup, assetName)};
            if (color == -2) asset.Color = 'Default';
            else if (color !== -1) asset.Color = color;
            if (property !== -1) asset.Property = property;
            if (difficulty !== -1) asset.Difficulty = difficulty;
            appearance.push(asset);
        } else {
            // legacy v1 compression
            let asset = {Asset: AssetGet('Female3DCG', packedAsset.Group, packedAsset.Name)};
            for (let property of ['Difficulty', 'Color', 'Property']) {
                if (packedAsset[property] !== undefined) {
                    asset[property] = packedAsset[property];
                }
            }
            appearance.push(asset);
        }
    }
    player.Appearance = appearance;
    syncPlayer(player);
}

// Basic sync behavior
syncPlayer = function(player) {
    if (player === undefined) player = Player;
    CharacterRefresh(player, false, false);
    ChatRoomCharacterUpdate(player);
}


sendHiddenMessage = function(feedback, ignoreInExport = false) {
    // Borrowed from ChatRoomMessage
    let div = document.createElement("div");
    div.setAttribute('class', 'ChatMessage ChatMessageHiddenFeedback');
    div.setAttribute('data-time', ChatRoomCurrentTime());
    div.setAttribute('data-sender', 0);
    div.innerHTML = feedback;

    if (ignoreInExport) {
        div.setAttribute('data-ignore-in-export', 'yes');
    }

    // Returns the focus on the chat box
    let Refocus = document.activeElement.id == "InputChat";
    let ShouldScrollDown = ElementIsScrolledToEnd("TextAreaChatLog");
    if (document.getElementById("TextAreaChatLog") != null) {
        document.getElementById("TextAreaChatLog").appendChild(div);
        if (ShouldScrollDown) ElementScrollToEnd("TextAreaChatLog");
        if (Refocus) ElementFocus("InputChat");
    }
}

sendCustomEmote = function(emote) {
    ServerSend("ChatRoomChat", {
        Type: "Action",
        Content: "gag",
        Dictionary: [{Tag: "gag", Text: emote}],
    });
}

// FEATURE: Allow exporting chat into a markdown compatible format.
// Includes some styling (colored names, italics, colors for whispers, etc.)
exportChat = function() {
    let lines = [];
    let chat = document.getElementById('TextAreaChatLog');

    let escapeMarkdown = text => String(text).replace(/[<>_\*\\]/g, t => '\\' + t);
    let escapeMarkdownEmote = text => escapeMarkdown(String(text).replace(/^\*+|\*+$/g, ''));

    for (let child of chat.children) {

        if (child.getAttribute('data-ignore-in-export')) {
            continue;
        }

        let cls = child.attributes.class.value;
        if (cls.startsWith('ChatMessage ChatMessageChat')) {
            // Normal chat
            let prefix = child.querySelector('span.ChatMessageName');
            let text = child.childNodes[1]; // text
            lines.push(`<span style="${prefix.attributes.style.value}">${prefix.innerText}</span>${escapeMarkdown(text.nodeValue)}`);
        } else if (cls.startsWith('ChatMessage ChatMessageWhisper')) {
            // Whisper
            let prefix = child.querySelector('span.ChatMessageName');
            if (prefix != null) {
                // Whisper from other player (has name)
                let text = child.childNodes[1]; // text
                lines.push(`<span style="color:silver;">*${escapeMarkdown(prefix.innerText)}${escapeMarkdown(text.nodeValue)}*</span>`);
            } else {
                // Whisper to other player (no name)
                lines.push(`<span style="color:silver;">*${escapeMarkdown(child.innerText)}*</span>`);
            }
        } else if (cls.startsWith('ChatMessage ChatMessageEmote') || cls.startsWith('ChatMessage ChatMessageActivity') || cls.startsWith('ChatMessage ChatMessageAction')) {
            // ChatMessageEmote - * style action
            // ChatMessageActivity - ( ) style action, caused by sexual activities
            // ChatMessageAction - ( ) style action, caused by restraints
            lines.push(`<span style="color:gray;">*${escapeMarkdownEmote(child.innerText)}*</span>`);
        } else if (cls.startsWith('ChatMessage ChatMessageHiddenFeedback')) {
            // Hidden feedback (garbled text decoding)
            lines.push(`<span style="color:silver;">*${escapeMarkdown(child.innerText)}*</span>`);
        } else if (cls.startsWith('ChatMessage ChatMessageLocalMessage')) {
            // Messages like /help results
        } else {
            console.log('Unknown class:', cls);
        }
    }
    openAsPlainText(lines);
};


// FEATURE: Adjust layer priority via UI for appearance (clothes) and restraints (items)
(() => {

    const layerPriorityId = 'jailbreak-layer-priority';
    const layerPriorityIcon = 'data:image/png;base64,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';

    ElementCreateInput(layerPriorityId, 'number', '', '20');

    // 'commit changes' button
    let layerButton = {
        isTargeted: () => MouseIn(160, 946, 52, 52),
        render: () => DrawButton(160, 946, 52, 52, '', 'White', layerPriorityIcon, 'Set Render Layer')
    };

    // numerical input for the layer
    let layerInputLastItem = null;
    let layerInput = {
        element: document.getElementById(layerPriorityId),
        render: () => {
            layerInput.element.style.display = 'inline';
            ElementPosition(layerPriorityId, 10 + 150/2, 940 + 50/2, 150);
        },
        unrender: () => {
            layerInput.element.style.display = 'none';
        },

        setDefault: (player, item) => {
            if (!layerInputLastItem || layerInputLastItem !== item) {
                const defaultPriority = item ? (player.AppearanceLayers.find(a => a.Asset === item.Asset) ?.Priority || 0).toString() : '';
                ElementValue(layerPriorityId, defaultPriority);
            }
            layerInputLastItem = item;
        },
    };

    layerInput.unrender();

    function renderUI(player, item) {
        layerButton.render();
        layerInput.render();
        layerInput.setDefault(player, item);        
    }

    function unrenderUI() {
        layerInput.unrender();
    }

    function unrenderUIAndClearItem() {
        unrenderUI();
        layerInputLastItem = null;
    }
    
    function setPriority(item) {
        setItemLayerPriority(item, parseInt(ElementValue(layerPriorityId)));
    }

    hookHead(AppearanceLoad, () => unrenderUI());
    hookHead(AppearanceExit, () => {
        if (CharacterAppearanceMode === '') unrenderUI();
    });

    hookTail(AppearanceRun, () => {
        // Runs the layer priority selection on the appearance screen
        if (CharacterAppearanceMode === 'Cloth') {
            const player = CharacterAppearanceSelection;
            const item = player.Appearance.find(a => a.Asset.Group === player.FocusGroup);
            renderUI(player, item);
        } else {
            unrenderUI();
        }
    });

    hookTail(AppearanceClick, () => {
        const player = CharacterAppearanceSelection;
        if (layerButton.isTargeted() && CharacterAppearanceMode === 'Cloth') {
            const item = player.Appearance.find(a => a.Asset.Group?.Name === player.FocusGroup?.Name);
            setPriority(item);
            CharacterRefresh(player, false);
        }
    });

    // Hooks for dialog menus, which are used for item interactions

    hookHead(DialogLeave, () => unrenderUIAndClearItem());
    hookHead(DialogLeaveItemMenu, () => unrenderUIAndClearItem());

    hookHead(DialogDrawItemMenu, (...args) => {
        const [player] = args;
        const item = InventoryGet(player, player.FocusGroup?.Name);
        if (item && !!player.AppearanceLayers.find(a => a.Asset === item.Asset)) {
            renderUI(player, item);
        } else {
            unrenderUI();
        }
    });

    jailbreak.hook.dialog_draw = () => {
        const player = CharacterGetCurrent();
        const item = InventoryGet(player, player.FocusGroup?.Name);
        if (item) {
            renderUI(player, item);
        }
    };

    jailbreak.hook.dialog_click = () => {
        const player = CharacterGetCurrent();
        const item = InventoryGet(player, player.FocusGroup?.Name);
        if (item && layerButton.isTargeted()) {
            setPriority(item);
            CharacterRefresh(player, false, false);
            ChatRoomCharacterItemUpdate(player, player.FocusGroup?.Name);
            return [null];
        }
    };
})();


// FEATURE: Toggle blindness with a custom command
toggleTrueSight = (() => {

    let trueSightEnabled = false;

    return () => {
        if (trueSightEnabled) {
            // Disable
            trueSightEnabled = false;
            if (typeof Player.GetBlindLevel.delegate === 'function') {
                Player.GetBlindLevel = Player.GetBlindLevel.delegate;
            }
            sendHiddenMessage('True Sight Disabled', true);
        } else {
            // Enable
            trueSightEnabled = true;
            if (typeof Player.GetBlindLevel.delegate !== 'function') {
                let delegate = Player.GetBlindLevel;
                Player.GetBlindLevel = () => 0;
                Player.GetBlindLevel.delegate = delegate;
            }
            sendHiddenMessage('True Sight Enabled', true);
        }
    };
})();


// FEATURE: Cleanup login screen
hook(LoginDrawCredits, () => {});
rewrite(LoginRun, {'DrawCharacter(LoginCharacter': 'return; //'});

// FEATURE: Don't log console warning message.
rewrite(ServerConnect, {'console.log': '// console.log'});

// FEATURE: Cleanup main hall, disable most SP content. Enable all buttons even when restrained.
rewrite(MainHallRun, {
    'DrawTextWrap(TextGet("Tip" + MainHallTip)': '//',
    'Player.CanChangeOwnClothes()': 'true',
    'Player.CanWalk()': 'true',
    '// Introduction, Maid & Management': 'DrawButton(1885, 265, 90, 90, "", "White", "Icons/Management.png", TextGet("ClubManagement")); return;'
});
rewrite(MainHallClick, {
    'Player.CanChangeOwnClothes()': 'true',
    'Player.CanWalk()': 'true',
    '// Introduction, Maid & Management': 'if ((MouseX >= 1885) && (MouseX < 1975) && (MouseY >= 265) && (MouseY < 355)) MainHallWalk("Management"); return;'
});

// FEATURE: Allow entry into arbitrary spaces (M / F / MF / Asylum), bypass the space selection screen.
(() => {

    hook(ChatSelectLoad, () => { // Bypass the chat select screen entirely
        chatSpaceSelect.value = Player.GenderSettings.AutoJoinSearch.Female == Player.GenderSettings.AutoJoinSearch.Male ? 'X' : (Player.GenderSettings.AutoJoinSearch.Female ? '' : 'M'); // Default null (both false) and both true to any gender
        ChatSelectAllowedInFemaleOnly = ChatSelectAllowedInMaleOnly = true;
        loadTargetedChatSpace();
    });
    rewrite(ChatSearchRun, { // Don't draw the 'search' message, as we render the space dropdown there instead
        'DrawTextFit(TextGet(ChatSearchMessage)': '//'
    });

    // Define a dropdown for chat space
    const chatSpaceSelectId = 'jailbreak-chat-space-select';
    document.getElementById(chatSpaceSelectId)?.remove();
    const chatSpaceSelect = document.createElement('select');

    chatSpaceSelect.id = chatSpaceSelectId;
    for (let option of [['X', 'All Genders'], ['M', 'Male Only (M)'], ['', 'Female Only (F)'], ['Asylum', 'Asylum']]) {
        const chatSpaceOption = document.createElement('option');
        chatSpaceOption.value = option[0];
        chatSpaceOption.innerText = option[1];
        chatSpaceSelect.appendChild(chatSpaceOption);
    }

    document.body.appendChild(chatSpaceSelect);
    chatSpaceSelect.addEventListener('change', () => loadTargetedChatSpace());

    // Loading and unloading for the render element, including defining ChatSearchUnload (since BC doesn't)
    hookTail(ChatSearchLoad, () => renderUI());
    hookTail(ChatSearchExit, () => unrenderUI());
    ChatSearchUnload = () => unrenderUI();

    function renderUI() {
        ElementPosition(chatSpaceSelectId, 255, 932.5, 400, 60);
        chatSpaceSelect.style.display = '';
    }

    function unrenderUI() {
        chatSpaceSelect.style.display = 'none';
    }

    function loadTargetedChatSpace() {
        ChatRoomStart(chatSpaceSelect.value, '', 'MainHall', 'Room', chatSpaceSelect.value === 'Asylum' ? 'AsylumEntrance' : 'MainHall', BackgroundsTagList);
    }

    unrenderUI();
})();


// Finished Loading
jailbreak.loaded = true;
console.log(`Loaded Jailbreak v${jailbreak.version}-${jailbreak.loaderVersion} for BC ${jailbreak.targetVersion} by ${jailbreak.author}`);
