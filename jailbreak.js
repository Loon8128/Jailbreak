if (typeof jailbreak !== 'undefined')
    jailbreak.unload();
jailbreak = {
    version: '1.20',
    loaderVersion: document.getElementById('jailbreak-main').getAttribute('data-loader-version'),
    targetVersion: 'R106',
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
    api: {},
    hook: {},
};
hook = function (f, g) {
    if (typeof f.delegate === 'function') {
        if (!jailbreak.loaded)
            throw new Error(`Illegal reentrant hook during loading for ${f.delegate.name}`);
        f = f.delegate;
    }
    jailbreak.hooks.add(f.name);
    window[f.name] = g;
    window[f.name].delegate = f;
};
hookHead = (f, g) => hook(f, (...args) => { g(...args); return f(...args); });
hookTail = (f, g) => hook(f, (...args) => { const ret = f(...args); g(...args); return ret; });
rewrite = function (f, patches) {
    if (typeof f.delegate === 'function') {
        if (!jailbreak.loaded)
            throw new Error(`Illegal reentrant hook during loading for ${f.delegate.name}`);
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
    }
    catch (e) {
        console.error(`Error ${e} patching ${f.name}, new source:\n${src}`);
    }
    jailbreak.hooks.add(original.name);
    window[original.name].delegate = original;
};
unhook = function (f) {
    if (typeof f.delegate === 'function') {
        window[f.delegate.name] = f.delegate;
    }
    else {
        console.error(`Function ${f.name} is not hooked or patched`);
    }
};
hook(LoginMistressItems, () => { });
hook(LoginStableItems, () => { });
hook(LoginMaidItems, () => { });
hook(LoginAsylumItems, () => { });
jailbreak.obtainAllItems = () => {
    const ITEMS = [
        { Name: "MaidLatex", Group: "Cloth" },
        { Name: "MaidLatexHairband", Group: "Hat" },
        { Name: "MistressGloves", Group: "Gloves" },
        { Name: "MistressBoots", Group: "Shoes" },
        { Name: "MistressTop", Group: "Cloth" },
        { Name: "MistressBottom", Group: "ClothLower" },
        { Name: "MistressPadlock", Group: "ItemMisc" },
        { Name: "MistressPadlockKey", Group: "ItemMisc" },
        { Name: "MistressTimerPadlock", Group: "ItemMisc" },
        { Name: "DeluxeBoots", Group: "Shoes" },
        { Name: "HarnessPonyBits", Group: "ItemMouth" },
        { Name: "HarnessPonyBits", Group: "ItemMouth2" },
        { Name: "HarnessPonyBits", Group: "ItemMouth3" },
        { Name: "PonyBoots", Group: "Shoes" },
        { Name: "PonyBoots", Group: "ItemBoots" },
        { Name: "PonyHood", Group: "ItemHood" },
        { Name: "HoofMittens", Group: "ItemHands" },
        { Name: "MaidOutfit1", Group: "Cloth" },
        { Name: "MaidOutfit2", Group: "Cloth" },
        { Name: "MaidHairband1", Group: "Cloth" },
        { Name: "MaidApron1", Group: "Cloth" },
        { Name: "MaidHairband1", Group: "Hat" },
        { Name: "ServingTray", Group: "ItemMisc" },
        { Name: "DusterGag", Group: "ItemMouth" },
        { Name: "MedicalBedRestraints", Group: "ItemArms" },
        { Name: "MedicalBedRestraints", Group: "ItemLegs" },
        { Name: "MedicalBedRestraints", Group: "ItemFeet" },
        { Name: "Camera1", Group: "ClothAccessory" },
        { Name: "SpankingToysGavel", Group: "ItemHands" },
        { Name: "SpankingToysLongDuster", Group: "ItemHands" },
        { Name: "LeatherCuffs", Group: "ItemArms" },
        { Name: "LeatherCuffsKey", Group: "ItemArms" },
        { Name: "SpankingToysBaguette", Group: "ItemHands" },
        { Name: "PandoraPadlock", Group: "ItemMisc" },
        { Name: "PandoraPadlockKey", Group: "ItemMisc" },
        { Name: "CollegeOutfit1", Group: "Cloth" },
        { Name: "NurseUniform", Group: "Cloth" },
        { Name: "CollegeSkirt", Group: "ClothLower" },
        { Name: "NurseCap", Group: "Hat" },
        { Name: "CollegeDunce", Group: "Hat" },
        { Name: "Ribbons2", Group: "HairAccessory3" },
        { Name: "Ribbons2", Group: "HairAccessory1" },
        { Name: "StraponPanties", Group: "ItemPelvis" },
        { Name: "Pillory", Group: "ItemArms" },
        { Name: "SpankingToysTennisRacket", Group: "ItemHands" },
        { Name: "SpankingToysRainbowWand", Group: "ItemHands" },
        { Name: "ChloroformCloth", Group: "ItemMouth2" },
        { Name: "ChloroformCloth", Group: "ItemMouth3" },
        { Name: "WoodenPaddle", Group: "ItemMisc" },
        { Name: "SpankingToys", Group: "ItemHands" },
    ];
    Asset.filter(asset => asset.Group != null && asset.Value > 0)
        .map(asset => ({ Name: asset.Name, Group: asset.Group.Name }))
        .forEach(a => ITEMS.push(a));
    InventoryAddMany(Player, ITEMS);
    LoginValideBuyGroups();
};
jailbreak.checkForMissingItems = () => {
    let ownedAssets = new Set(Player.Inventory.map(a => a.Asset));
    return Asset.filter(a => !ownedAssets.has(a))
        .filter(a => !(a.Group.Category === 'Appearance' && a.Value === 0));
};
hookTail(LoginResponse, data => {
    if (typeof data === 'object' && data.Name != null && data.AccountName != null) {
        jailbreak.obtainAllItems();
    }
    Object.assign(Player?.GenderSettings?.AutoJoinSearch || {}, { Male: true, Female: true });
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
(() => {
    const backgrounds = [
        'Shop',
        'Pandora/Ground/Entrance',
        'Pandora/Second/Entrance',
        'Pandora/Underground/Entrance'
    ];
    const specialBackgroundTag = 'Special';
    const addedBackgroundTags = ['Asylum', specialBackgroundTag];
    for (let i = 0; i < 6; i++) {
        ['Cell', 'Fork', 'Tunnel'].forEach(shape => backgrounds.push(`Pandora/Second/${shape}${i}`, `Pandora/Underground/${shape}${i}`));
    }
    backgrounds.forEach(bg => BackgroundsList.push({ Name: bg, Tag: [specialBackgroundTag] }));
    addedBackgroundTags.forEach(tag => BackgroundsTagList.push(tag));
})();
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
    function escapeHtml(text) {
        return String(text).replace(/[\&<>"'`=\/]/g, s => HTML_ESCAPE_ENTITIES[s]);
    }
    function openAsPlainText(lines) {
        let text = lines.map(t => `<p>${escapeHtml(t)}</p>`).join('');
        let w = window.open();
        w.document.write(text);
    }
    function exportChat() {
        const lines = [];
        const chat = document.getElementById('TextAreaChatLog');
        let escapeMarkdown = (text) => String(text).replace(/[<>_\*\\]/g, t => '\\' + t);
        let escapeMarkdownEmote = (text) => escapeMarkdown(String(text).replace(/^\*+|\*+$/g, ''));
        for (let child of chat.children) {
            if (child.getAttribute('data-ignore-in-export')) {
                continue;
            }
            let cls = child.attributes.class.value;
            if (cls.startsWith('ChatMessage ChatMessageChat')) {
                let prefix = child.querySelector('span.ChatMessageName');
                let text = child.childNodes[1];
                lines.push(`<span style="${prefix.attributes.style.value}">${prefix.innerText}</span>${escapeMarkdown(text.nodeValue)}`);
            }
            else if (cls.startsWith('ChatMessage ChatMessageWhisper')) {
                let prefix = child.querySelector('span.ChatMessageName');
                if (prefix != null) {
                    let text = child.childNodes[1];
                    lines.push(`<span style="color:silver;">*${escapeMarkdown(prefix.innerText)}${escapeMarkdown(text.nodeValue)}*</span>`);
                }
                else {
                    lines.push(`<span style="color:silver;">*${escapeMarkdown(child.innerText)}*</span>`);
                }
            }
            else if (cls.startsWith('ChatMessage ChatMessageEmote') || cls.startsWith('ChatMessage ChatMessageActivity') || cls.startsWith('ChatMessage ChatMessageAction')) {
                lines.push(`<span style="color:gray;">*${escapeMarkdownEmote(child.innerText)}*</span>`);
            }
            else if (cls.startsWith('ChatMessage ChatMessageHiddenFeedback')) {
                lines.push(`<span style="color:silver;">*${escapeMarkdown(child.innerText)}*</span>`);
            }
            else if (cls.startsWith('ChatMessage ChatMessageLocalMessage')) {
            }
            else {
                console.log('Unknown class:', cls);
            }
        }
        openAsPlainText(lines);
    }
    ;
    function sendCustomEmote(emote) {
        ServerSend("ChatRoomChat", {
            Type: "Action",
            Content: "gag",
            Dictionary: [{ Tag: "gag", Text: emote }],
        });
    }
    function sendHiddenMessage(feedback, ignoreInExport = false) {
        let div = document.createElement("div");
        div.setAttribute('class', 'ChatMessage ChatMessageHiddenFeedback');
        div.setAttribute('data-time', ChatRoomCurrentTime());
        div.setAttribute('data-sender', '0');
        div.innerHTML = feedback;
        if (ignoreInExport) {
            div.setAttribute('data-ignore-in-export', 'yes');
        }
        let Refocus = document.activeElement.id == "InputChat";
        let ShouldScrollDown = ElementIsScrolledToEnd("TextAreaChatLog");
        if (document.getElementById("TextAreaChatLog") != null) {
            document.getElementById("TextAreaChatLog").appendChild(div);
            if (ShouldScrollDown)
                ElementScrollToEnd("TextAreaChatLog");
            if (Refocus)
                ElementFocus("InputChat");
        }
    }
    function savePlayerAppearance(player = undefined) {
        if (player === undefined) {
            player = Player;
        }
        const packed = [];
        for (const asset of player.Appearance) {
            packed.push([
                asset.Asset.Name,
                asset.Asset.Group.Name,
                asset.Color === undefined ? -1 : (asset.Color === 'Default' ? -2 : asset.Color),
                asset.Property === undefined ? -1 : asset.Property,
                asset.Difficulty === undefined || asset.Difficulty === 0 ? -1 : asset.Difficulty,
            ]);
        }
        const compressed = LZString.compressToBase64(JSON.stringify(packed));
        console.log(`Compressed to ${compressed.length} bytes`);
        prompt('Saved player appearance (press CTRL-C to copy)', compressed);
    }
    function restorePlayerAppearance(player = undefined) {
        if (player === undefined) {
            player = Player;
        }
        const compressed = prompt('Input player appearance string');
        if (compressed === undefined || compressed === null || compressed === '')
            return;
        const packed = JSON.parse(LZString.decompressFromBase64(compressed));
        if (!packed) {
            sendHiddenMessage('Error parsing packed appearance?');
            return;
        }
        const appearance = [];
        for (const packedAsset of packed) {
            if (Array.isArray(packedAsset)) {
                const [assetName, assetGroup, color, property, difficulty] = packedAsset;
                const asset = { Asset: AssetGet('Female3DCG', assetGroup, assetName) };
                if (color == -2)
                    asset.Color = 'Default';
                else if (color !== -1)
                    asset.Color = color;
                if (property !== -1)
                    asset.Property = property;
                if (difficulty !== -1)
                    asset.Difficulty = difficulty;
                appearance.push(asset);
            }
            else {
                let asset = { Asset: AssetGet('Female3DCG', packedAsset.Group, packedAsset.Name) };
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
    function syncPlayer(player) {
        if (player === undefined)
            player = Player;
        CharacterRefresh(player, false, false);
        ChatRoomCharacterUpdate(player);
    }
    let trueSightEnabled = false;
    function toggleTrueSight() {
        if (trueSightEnabled) {
            trueSightEnabled = false;
            if (typeof Player.GetBlindLevel.delegate === 'function') {
                Player.GetBlindLevel = Player.GetBlindLevel.delegate;
            }
            sendHiddenMessage('True Sight Disabled', true);
        }
        else {
            trueSightEnabled = true;
            if (typeof Player.GetBlindLevel.delegate !== 'function') {
                let delegate = Player.GetBlindLevel;
                Player.GetBlindLevel = () => 0;
                Player.GetBlindLevel.delegate = delegate;
            }
            sendHiddenMessage('True Sight Enabled', true);
        }
    }
    ;
    hook(ChatRoomSendChat, () => {
        const text = ElementValue('InputChat').trim().replace('\\', '/');
        if (text.startsWith('/**')) {
            sendCustomEmote(text.substring('/**'.length).trim());
        }
        else if (text.startsWith('/*')) {
            sendCustomEmote(Player.Name + text.substring('/*'.length));
        }
        else if (text === '/export') {
            exportChat();
        }
        else if (text === '/save') {
            savePlayerAppearance();
        }
        else if (text === '/restore') {
            restorePlayerAppearance();
        }
        else if (text === '/blind' || text == '/truesight') {
            toggleTrueSight();
        }
        else if (text.startsWith('/api')) {
            let apiScript = text.substring('/api'.length).trim();
            try {
                if (apiScript.startsWith('.'))
                    apiScript = apiScript.substring(1);
                if (apiScript !== '')
                    apiScript = 'jailbreak.api.' + apiScript;
                else
                    apiScript = 'jailbreak.api';
                let ret = (1, eval)(apiScript);
                if (ret !== undefined) {
                    try {
                        ret = `[${Object.keys(ret).reduce((a, b) => a + ', ' + b)}]`;
                    }
                    catch (e) { }
                    sendHiddenMessage(ret, true);
                }
            }
            catch (e) {
                sendHiddenMessage(e, true);
            }
        }
        else {
            return ChatRoomSendChat.delegate();
        }
        ElementValue('InputChat', '');
    });
})();
(() => {
    function setItemLayerPriority(item, priority) {
        if (item) {
            if (!item.Property) {
                item.Property = {};
            }
            item.Property.OverridePriority = priority;
        }
    }
    const layerPriorityId = 'jailbreak-layer-priority';
    const layerPriorityIcon = 'data:image/png;base64,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';
    ElementCreateInput(layerPriorityId, 'number', '', '20');
    let layerButton = {
        isTargeted: () => MouseIn(160, 946, 52, 52),
        render: () => DrawButton(160, 946, 52, 52, '', 'White', layerPriorityIcon, 'Set Render Layer')
    };
    let layerInputLastItem = null;
    let layerInput = {
        element: document.getElementById(layerPriorityId),
        render: () => {
            layerInput.element.style.display = 'inline';
            ElementPosition(layerPriorityId, 10 + 150 / 2, 940 + 50 / 2, 150);
        },
        unrender: () => {
            layerInput.element.style.display = 'none';
        },
        setDefault: (player, item) => {
            if (!layerInputLastItem || layerInputLastItem !== item) {
                const defaultPriority = item ? (player.AppearanceLayers.find(a => a.Asset === item.Asset)?.Priority || 0).toString() : '';
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
        if (CharacterAppearanceMode === '')
            unrenderUI();
    });
    hookTail(AppearanceRun, () => {
        if (CharacterAppearanceMode === 'Cloth') {
            const player = CharacterAppearanceSelection;
            const item = player.Appearance.find(a => a.Asset.Group === player.FocusGroup);
            renderUI(player, item);
        }
        else {
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
    hookHead(DialogLeave, () => unrenderUIAndClearItem());
    hookHead(DialogLeaveItemMenu, () => unrenderUIAndClearItem());
    hookHead(DialogDrawItemMenu, (...args) => {
        const [player] = args;
        const item = InventoryGet(player, player.FocusGroup?.Name);
        if (item && !!player.AppearanceLayers.find(a => a.Asset === item.Asset)) {
            renderUI(player, item);
        }
        else {
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
hook(LoginDrawCredits, () => { });
rewrite(LoginRun, { 'DrawCharacter(LoginCharacter': 'return; //' });
rewrite(ServerConnect, { 'console.log': '// console.log' });
hook(MainHallAllow, key => key === 'B');
rewrite(MainHallDraw, {
    'DrawTextWrap(TextGet("Tip" + MainHallTip)': '//',
    'Player.CanChangeOwnClothes()': 'true',
    'Player.CanWalk()': 'true',
});
rewrite(MainHallClick, {
    'Player.CanChangeOwnClothes()': 'true',
    'Player.CanWalk()': 'true',
});
hook(DialogCanTakePhotos, () => true);
rewrite(ChatRoomOpenWardrobeScreen, { 'Player.CanChangeOwnClothes()': 'true' });
rewrite(ChatRoomToggleKneel, { 'switch (status)': 'switch (PoseChangeStatus.ALWAYS)' });
rewrite(ChatRoomAttemptLeave, { 'Player.IsSlow()': 'false' });
hook(ChatRoomCanLeave, () => true);
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
rewrite(DialogMenuButtonBuild, {
    'DialogMenuButton.push("TightenLoosen");': '{}',
    'Player.CanInteract()': 'true',
    'InventoryGroupIsBlocked(C)': '(C != Player && InventoryGroupIsBlocked(C))',
});
rewrite(DialogItemClick, {
    'InventoryGroupIsBlocked(C, null, true)': '(C != Player && InventoryGroupIsBlocked(C, null, true))'
});
hook(DialogStruggleStart, (player, action, prevItem, nextItem) => {
    if (nextItem && nextItem.Asset) {
        let played = AudioPlaySoundForAsset(player, nextItem.Asset);
        if (!played && prevItem && prevItem.Asset) {
            AudioPlaySoundForAsset(player, prevItem.Asset);
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
hook(DialogCanColor, (C, Item) => !Item || (Item && Item.Asset && Item.Asset.ColorableLayerCount > 0) || DialogAlwaysAllowRestraint());
hook(LoginValidCollar, () => { });
jailbreak.loaded = true;
console.log(`Loaded Jailbreak v${jailbreak.version}-${jailbreak.loaderVersion} for BC ${jailbreak.targetVersion}`);
