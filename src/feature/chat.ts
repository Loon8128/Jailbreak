(() => {
    // Custom CSS for chat rooms
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
        
    function escapeHtml(text: any): string {
        return String(text).replace(/[\&<>"'`=\/]/g, s => HTML_ESCAPE_ENTITIES[s]);
    }

    // Opens a new tab, with some plain text html, good for large copy-paste operations
    function openAsPlainText(lines: string[]): void {
        let text = lines.map(t => `<p>${escapeHtml(t)}</p>`).join('');
        let w = window.open();
        w.document.write(text);
    }

    // Exports chat into a markdown-compatible format
    // Includes some styling (colored names, italics, colors for whispers, etc.)
    function exportChat() {
        const lines: string[] = [];
        const chat: HTMLTextAreaElement = document.getElementById('TextAreaChatLog') as HTMLTextAreaElement;

        let escapeMarkdown = (text: any) => String(text).replace(/[<>_\*\\]/g, t => '\\' + t);
        let escapeMarkdownEmote = (text: any) => escapeMarkdown(String(text).replace(/^\*+|\*+$/g, ''));

        for (let child of chat.children) {

            if (child.getAttribute('data-ignore-in-export')) {
                continue;
            }

            let cls = (child.attributes as any).class.value;
            if (cls.startsWith('ChatMessage ChatMessageChat')) {
                // Normal chat
                let prefix = child.querySelector('span.ChatMessageName');
                let text = child.childNodes[1]; // text
                lines.push(`<span style="${(prefix.attributes as any).style.value}">${(prefix as HTMLElement).innerText}</span>${escapeMarkdown(text.nodeValue)}`);
            } else if (cls.startsWith('ChatMessage ChatMessageWhisper')) {
                // Whisper
                let prefix = child.querySelector('span.ChatMessageName');
                if (prefix != null) {
                    // Whisper from other player (has name)
                    let text = child.childNodes[1]; // text
                    lines.push(`<span style="color:silver;">*${escapeMarkdown((prefix as HTMLElement).innerText)}${escapeMarkdown(text.nodeValue)}*</span>`);
                } else {
                    // Whisper to other player (no name)
                    lines.push(`<span style="color:silver;">*${escapeMarkdown((child as HTMLElement).innerText)}*</span>`);
                }
            } else if (cls.startsWith('ChatMessage ChatMessageEmote') || cls.startsWith('ChatMessage ChatMessageActivity') || cls.startsWith('ChatMessage ChatMessageAction')) {
                // ChatMessageEmote - * style action
                // ChatMessageActivity - ( ) style action, caused by sexual activities
                // ChatMessageAction - ( ) style action, caused by restraints
                lines.push(`<span style="color:gray;">*${escapeMarkdownEmote((child as HTMLElement).innerText)}*</span>`);
            } else if (cls.startsWith('ChatMessage ChatMessageHiddenFeedback')) {
                // Hidden feedback (garbled text decoding)
                lines.push(`<span style="color:silver;">*${escapeMarkdown((child as HTMLElement).innerText)}*</span>`);
            } else if (cls.startsWith('ChatMessage ChatMessageLocalMessage')) {
                // Messages like /help results
            } else {
                console.log('Unknown class:', cls);
            }
        }
        openAsPlainText(lines);
    };

    function sendCustomEmote(emote) {
        ServerSend("ChatRoomChat", {
            Type: "Action",
            Content: "gag",
            Dictionary: [{Tag: "gag", Text: emote}],
        });
    }

    function sendHiddenMessage(feedback: string, ignoreInExport: boolean = false) {
        // Borrowed from ChatRoomMessage
        let div = document.createElement("div");
        div.setAttribute('class', 'ChatMessage ChatMessageHiddenFeedback');
        div.setAttribute('data-time', ChatRoomCurrentTime());
        div.setAttribute('data-sender', '0');
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

    // Save and load player appearance including restraints
    function savePlayerAppearance(player: typeof Player = undefined) {
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

    function restorePlayerAppearance(player: typeof Player | undefined = undefined): void {
        if (player === undefined) {
            player = Player;
        }
        const compressed = prompt('Input player appearance string');
        if (compressed === undefined || compressed === null || compressed === '') return; // Canceled prompt

        const packed = JSON.parse(LZString.decompressFromBase64(compressed));
        if (!packed) {
            sendHiddenMessage('Error parsing packed appearance?');
            return;
        }
        const appearance: typeof Player.Appearance = [];
        for (const packedAsset of packed) {
            if (Array.isArray(packedAsset)) {
                // v2 compression - properties are stored in an array of predictable index
                // produces about 25% smaller results than v1
                const [assetName, assetGroup, color, property, difficulty] = packedAsset;
                const asset: typeof Player.Appearance[0] = { Asset: AssetGet('Female3DCG', assetGroup, assetName) };
                
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
    function syncPlayer(player: typeof Player | undefined) {
        if (player === undefined) player = Player;
        CharacterRefresh(player, false, false);
        ChatRoomCharacterUpdate(player);
    }

    let trueSightEnabled = false;
    
    function toggleTrueSight() {
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

    // Support for additional commands
    //
    // Inject into ChatRoomSendChat to handle new commands. R71's command handler fails on many
    // levels (calls .trim() too aggressively, bad assumptions about word boundaries, doesn't
    // support substring commands, etc.)
    hook(ChatRoomSendChat, () => {
        const text: string = ElementValue('InputChat').trim().replace('\\', '/');

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
            return ChatRoomSendChat.delegate();
        }
        ElementValue('InputChat', '');
    });

})();