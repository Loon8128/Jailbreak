jailbreak = {
    author: 'Loon8128',
    version: '1.1',
    targetVersion: 'R80',

    reload: () => {
        let n = document.createElement('script');
        n.setAttribute('language', 'JavaScript');
        n.setAttribute('crossorigin', 'anonymous');
        n.setAttribute('src', 'https://loon8128.github.io/Jailbreak/jailbreak.js?_=' + Date.now());
        n.onload = () => n.remove();
        document.head.appendChild(n);
    }
};

/**
 * Replaces a given function. Invoking the original function can be done via f.delegate()
 * @param f The function to replace
 * @param g The function to replace with
 */
hook = function(f, g) {
    if (typeof f.delegate === 'function') {
        console.log(`Updating hook for ${f.delegate.name}`);
        f = f.delegate;
    }
    window[f.name] = g;
    window[f.name].delegate = f;
};

/**
 * Rewrites (or patches) a given function by string replacement
 * @param f The function to patch
 * @param patches A object of {replace: with} key value pairs, which are applied as patches to the original function
 */
rewrite = function(f, patches) {
    if (typeof f.delegate === 'function') {
        let count = Object.keys(patches).length;
        console.log(`Updating ${count} patch${count == 1 ? '' : 'es'} for ${f.delegate.name}`);
        f = f.delegate;
    }
    let original = f;
    let src = f.toString().replace('\r', '');
    for (const [k, v] of Object.entries(patches)) {
        if (!src.includes(k)) {
            console.warn(`Patch not applied: function ${f.name}, target ${k} -> ${v}`);
        }
        src = src.replaceAll(k, v);
    }
    try {
        (1, eval)(src);
    } catch (e) {
        console.error(`Error ${e} patching ${f.name}, new source:\n${src}`);
    }
    window[original.name].delegate = original;
};

/**
 * Removes the hook, or patch, for a given function.
 */
unhook = function(f) {
    if (typeof f.delegate === 'function') {
        window[f.delegate.name] = f.delegate;
        console.log(`Unhooking function ${f.name}`);
    } else {
        console.log(`Function ${f.name} is not hooked or patched`);
    }
};

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

jailbreakObtainAllItems = () => {

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

jailbreakCheckForMissingItems = () => {
    // Checks items that we didn't obtain, either because they're special, or hardcoded, or we need to add exceptions to them
    let ownedAssets = new Set(Player.Inventory.map(a => a.Asset));
    return Asset.filter(a => !ownedAssets.has(a))
        .filter(a => !(a.Group.Category === 'Appearance' && a.Value === 0)); // These are 'Default' clothing items
};

hook(LoginResponse, function(data) {
    LoginResponse.delegate(data);
    if (typeof data === 'object' && data.Name != null && data.AccountName != null) {
        jailbreakObtainAllItems();
    }
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
    let styleElement = document.createElement('style');
    styleElement.innerText = `
    .ChatMessageHiddenFeedback {
        font-style: italic;
        font-size: 0.75em;
        color: silver;
    }

    #TextAreaChatLog[data-shrinknondialogue=true] .ChatMessageEmote {
        font-size: 1.0em;
    }
    `;
    document.body.appendChild(styleElement);
})();


// FEATURE: Allow movement into the asylum chat rooms at will
hook(AsylumEntranceCanWander, () => true);


// FEATURE: Allow taking photos anywhere
hook(DialogCanTakePhotos, () => true);


// FEATURE: Allow clicking on the appearance button in chat rooms at any time, even if it is greyed out due to restraints
// FEATURE: Allow leaving chat rooms, independent of slowing effects or preventing effects, while still displaying yellow/red
rewrite(ChatRoomMenuClick, {
    'ChatRoomCanLeave() && !PlayerIsSlow': 'true',
    'Player.CanChangeOwnClothes()': 'true',
});


// FEATURE: Chat Functionality
// - Decode garbled messages and display beneath
// - Send only typing indicators (not status indicators)
// - Add custom commands
// FEATURE: BCX Compatibility
// - Draw icons so we can see who is using BCX
// - Report ourselves as using BCX to others
// - Interpret and send BCX typing indicators

// Inject into ChatRoomSendChat to handle new commands.
// R71's command handler fails on many levels (calls .trim() too aggressively, bad assumptions about word boundaries, doesn't support substring commands, etc.)
hook(ChatRoomSendChat, function() {
    let text = ElementValue('InputChat').trim();
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
    } else {
        ChatRoomSendChat.delegate();
        return;
    }
    ElementValue('InputChat', '');
});

// Don't send dumb status updates
// Additionally send typing indicators via BCX
// Send: [Talk (Typing)], Ignore: [Crawl, Orgasm, Preference, Struggle, Wardrobe]
hook(ChatRoomStatusUpdate, status => {
    if (status === 'Talk') {
        ChatRoomStatusUpdate.delegate(status);
        forceCheckBCXChatIndicator();
    }
});

// Borrowed from BCX and it's silly drawing methods
function drawIcon(ctx, icon, x, y, width, height, baseSize, alpha, lineWidth, fillColor, strokeColor = 'black') {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.scale(width / baseSize, height / baseSize);
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    const p = new Path2D(icon);
    ctx.fill(p);
    ctx.stroke(p);
    ctx.restore();
};


// FEATURE: Interact with BCX typing indicator messages
(() => {
    let lastKnownBCXStatus = null;
    let lastBCXStatusTimeoutId = null;

    forceCheckBCXChatIndicator = function() {
        if (Player.Status !== lastKnownBCXStatus) {
            clearTimeout(lastBCXStatusTimeoutId);
            checkBCXChatIndicator();
        }
    }

    checkBCXChatIndicator = function() {
        if (Player.Status !== lastKnownBCXStatus) {
            lastKnownBCXStatus = Player.Status;
            sendBCXMessage('ChatRoomStatusEvent', {Type: lastKnownBCXStatus === null ? 'None' : 'Typing', Target: null});
        }
        lastBCXStatusTimeoutId = setTimeout(checkBCXChatIndicator, 3000);
    }
    lastBCXStatusTimeoutId = setTimeout(checkBCXChatIndicator, 3000);
})();

sendBCXHello = () => sendBCXMessage('hello', {version: '☠️', request: false, effects: {}, typingIndicatorEnable: true});
sendBCXGoodbye = () => sendBCXMessage('goodbye', {});

sendBCXMessage = function(type, message) {
    ServerSend('ChatRoomChat', {
        Type: 'Hidden',
        Content: 'BCXMsg',
        Dictionary: {type: type, message: message}
    });
}

function jailbreakInterpretBCXMessages(data) {
    if (typeof data === 'object' && data.Type === 'Hidden' && data.Content === 'BCXMsg' && typeof data.Dictionary === 'object' && data.Sender !== Player.MemberNumber) {
        let bcxType = data.Dictionary.type;
        let bcxMessage = data.Dictionary.message;
        let sender = ChatRoomCharacter.find(c => c.MemberNumber === data.Sender);

        if (bcxType === 'hello') {
            // Respond to other players' 'hello' message
            sendBCXHello();
            if (sender != null) {
                sender.bcxEnabled = true;
            }
            return;
        } else if (bcxType === 'ChatRoomStatusEvent') {
            // Interpret the advanced typing indicator from BCX on other players
            if (bcxMessage.Type === 'None') {
                ChatRoomMessage({Sender: data.Sender, Type: 'Status', Content: 'null'});
            } else if (bcxMessage.Type === 'Typing' || bcxMessage.Type === 'Emote' || bcxMessage.Type === 'Whisper') {
                ChatRoomMessage({Sender: data.Sender, Type: 'Status', Content: 'Talk'});
            }

            if (sender != null) {
                if (typeof sender.bcxLastTypingIndicator === 'undefined') {
                    sender.bcxLastTypingIndicator = 'None';
                }
                if (sender.bcxLastTypingIndicator === 'Whisper') {
                    sender.bcxLastTypingIndicator = 'None';
                } else {
                    sender.bcxLastTypingIndicator = bcxMessage.Type;
                }
            }
        }
    }
}

// Draw the BCX overlay on other BCX players
hook(ChatRoomDrawCharacterOverlay, function(character, x, y, zoom, index) {
    ChatRoomDrawCharacterOverlay.delegate(character, x, y, zoom, index);

    if (typeof character.bcxEnabled !== 'undefined' && character.bcxEnabled) {
        const ICON_BCX_CROSS = `m7.3532 5.3725 10.98 19.412-10.98 19.803h15.294l2.3528-5.4898c0.78426 1.8299 1.5685 3.6599 2.3528 5.4898h15.294l-10.98-19.803c3.6599-6.4706 7.3197-12.941 10.98-19.412h-15.294l-2.3528 5.4898-2.3528-5.4898z`;
        drawIcon(MainCanvas, ICON_BCX_CROSS, x + 275 * zoom, y, 50 * zoom, 50 * zoom, 50, 0.7, 3, "#6e6eff")
    }
});

function jailbreakDecodeGarbledMessages(data, prev, curr) {
    if (prev !== curr && typeof data === 'object' && typeof data.Sender === 'number' && typeof data.Content === 'string') {
        let sender = ChatRoomCharacter.find(c => c.MemberNumber === data.Sender);
        if (sender != null) {
            let prevMsg = ChatRoomHTMLEntities(data.Type === 'Whisper' ? data.Content : SpeechStutter(sender, data.Content)); // pre-stutter the message, we want diffs across garbled due to deaf, gags, or baby talk. Not stuttering
            if (prevMsg !== curr.Garbled) {
                sendHiddenMessage(`(${data.Content})`);
            }
        }
    }
}

hook(ChatRoomMessage, function(data) {
    jailbreakInterpretBCXMessages(data);

    let prev = ChatRoomChatLog.length > 0 ? ChatRoomChatLog[ChatRoomChatLog.length - 1] : null;
    ChatRoomMessage.delegate(data);
    let curr = ChatRoomChatLog.length > 0 ? ChatRoomChatLog[ChatRoomChatLog.length - 1] : null;

    jailbreakDecodeGarbledMessages(data, prev, curr);
});


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
            let asset = {Asset: AssetGet('Female3DCG', packedAsset.Group, packedAsset.Name)};
            if (color !== -1) asset.Color = color;
            if (property !== -1) asset.Property = property;
            if (difficulty !== -1) asset.Difficulty = difficulty;
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
    if (player === undefined) {
        player = Player;
    }
    CharacterRefresh(player);
    ChatRoomCharacterUpdate(player);
}


sendHiddenMessage = function(feedback) {
    // Borrowed from ChatRoomMessage
    let div = document.createElement("div");
    div.setAttribute('class', 'ChatMessage ChatMessageHiddenFeedback');
    div.setAttribute('data-time', ChatRoomCurrentTime());
    div.setAttribute('data-sender', 0);
    div.innerHTML = feedback;

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
}

console.log(`Loaded Jailbreak v${jailbreak.version} for BC ${jailbreak.targetVersion} by ${jailbreak.author}`);
