// Remove credits and the character from the login screen
hook(LoginDrawCredits, () => {});
rewrite(LoginRun, {'DrawCharacter(LoginCharacter': 'return; //'});

// Don't log the console warning message
rewrite(ServerConnect, {'console.log': '// console.log'});

// Cleanup main hall, disable most SP content. Enable all buttons even when restrained.
//
// To avoid duplication and complex patches, rewrite `MainHallAllow` to enable-disable buttons at will
// Normally this is used for owner rules, which we don't give a fuck about, so we can repurpose it for disabling most if not all rules
// BC uses character keys to indicate different rooms:
// B = Private Room, 2 = Photos
hook(MainHallAllow, key => key === 'B' /* Private Room */)

// We still need to rewrite permission checks to ensure they are always allowed
rewrite(MainHallDraw, {
    'DrawTextWrap(TextGet("Tip" + MainHallTip)': '//', // Don't draw tips
    'Player.CanChangeOwnClothes()': 'true',
    'Player.CanWalk()': 'true',
});
rewrite(MainHallClick, {
    'Player.CanChangeOwnClothes()': 'true',
    'Player.CanWalk()': 'true',
});

// Allow taking photos anywhere
hook(DialogCanTakePhotos, () => true);


// Allow clicking on the appearance button in chat rooms at any time, even if it is greyed out due to restraints
// Allow kneeling and standing up at any time, without triggering a minigame
// Allow leaving chat rooms, independent of slowing effects or preventing effects, while still displaying yellow/red
rewrite(ChatRoomOpenWardrobeScreen, { 'Player.CanChangeOwnClothes()': 'true' }); // Always allow wardrobe access
rewrite(ChatRoomToggleKneel, { 'switch (status)': 'switch (PoseChangeStatus.ALWAYS)' }); // Avoid the kneeling mini-game
rewrite(ChatRoomAttemptLeave, { 'Player.IsSlow()': 'false' }); // Avoid the slow-leaving delay
hook(ChatRoomCanLeave, () => true); // Allow leaving at any time - may break other things, but fuck it

// Allow interacting with inventory, even when it would be blocked
// When interacting with the player, bypass blocked groups
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

// Remove the 'Tighten / Loosen' button
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


// Bypass the struggle minigame for applying, and removing items, entirely.
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

// Allow coloring anything, even if we couldn't normally interact due to restraints.
// Replace `DialogCanColor` with one that checks only if the item is colorable.
hook(DialogCanColor, (C, Item) => !Item || (Item && Item.Asset && Item.Asset.ColorableLayerCount > 0) || DialogAlwaysAllowRestraint())

// Don't overwrite / force a collar on the player
hook(LoginValidCollar, () => {});