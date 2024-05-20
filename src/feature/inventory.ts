// FEATURE: Add all items, including restricted ones.

// No-op the login functions which remove select items and add them manually
hook(LoginMistressItems, () => {});
hook(LoginStableItems, () => {});
hook(LoginMaidItems, () => {});
hook(LoginAsylumItems, () => {});

jailbreak.obtainAllItems = () => {
    const ITEMS = [
        {Name: "MaidLatex", Group: "Cloth"},
        {Name: "MaidLatexHairband", Group: "Hat"},
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

    Asset.filter(asset => asset.Group != null && asset.Value > 0) // This comes from 'ShopCheckBoughtEverything()'
        .map(asset => ({Name: asset.Name, Group: asset.Group.Name}))
        .forEach(a => ITEMS.push(a));

    InventoryAddMany(Player, ITEMS);
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