// Adjust layer priority via UI for appearance (clothes) and restraints (items)
(() => {

    function setItemLayerPriority(item: any, priority: number) {
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

        setDefault: (player: typeof Player, item: any) => {
            if (!layerInputLastItem || layerInputLastItem !== item) {
                const defaultPriority = item ? (player.AppearanceLayers.find(a => a.Asset === item.Asset)?.Priority || 0).toString() : '';
                ElementValue(layerPriorityId, defaultPriority);
            }
            layerInputLastItem = item;
        },
    };

    layerInput.unrender();

    function renderUI(player: typeof Player, item) {
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