interface Jailbreak {
    readonly version: string
    readonly loaderVersion: string
    readonly targetVersion: string

    reload(): void
    unload(): void

    loaded: boolean
    hooks: Set<string>

    readonly api: {} // Chat-visible API via the /api command
    readonly hook: {[_: string]: Fn} // Non-chat visible API

    obtainAllItems?: () => void
    checkForMissingItems?: () => void
}

type Fn = FnType<((...args: any[]) => any)>
type FnType<T> = T & { delegate?: FnType<T> }
type Tag<Name, T> = T & { __tag__: Name }


declare global {
    var jailbreak: Jailbreak;

    /**
     * Replaces a given function. Invoking the original function can be done via f.delegate()
     * @param f The function to replace
     * @param g The function to replace with
     */
    var hook: <T extends Function> (f: FnType<T>, g: FnType<T>) => void;
    var unhook: (f: Fn) => void

    var hookHead: (f: Fn, g: Fn) => void
    var hookTail: (f: Fn, g: Fn) => void

    /**
     * Rewrites (or patches) a given function by string replacement
     * @param f The function to patch
     * @param patches A object of {replace: with} key value pairs, which are applied as patches to the original function
     */
    var rewrite: (f: Fn, patches: {[_: string]: string}) => void;
}


// ===== BC Types ===== //

type Inventory = Tag<'Inventory', {
    readonly Asset: Asset
}[]>
type Player = Tag<'Player', {
    readonly Inventory: Inventory
    readonly Name: string

    readonly FocusGroup?: { Name: string }

    Appearance: Item[]
    AppearanceLayers: { Asset: Asset, Priority: number }[]
    
    GenderSettings?: any
    ChatSettings?: any

    GetBlindLevel: FnType<() => number>
}>
type AssetGroup = Tag<'AssetGroup', {
    readonly Name: string
    readonly Category: string
}>
type Asset = Tag<'Asset', {
    readonly Name: string
    readonly Group: AssetGroup
    readonly Value: number
    readonly ColorableLayerCount: number
}>
type Item = {
    Asset: Asset,
    Property?: any,
    Difficulty?: number,
    Color?: string | string[]
}

interface Background {
    readonly Name: string
    readonly Tag: string[]
}

type DialogStruggleAction = Tag<'DialogStruggleAction', string> | 'Strength'


declare global {
    function LoginMistressItems(): void
    function LoginStableItems(): void
    function LoginMaidItems(): void
    function LoginAsylumItems(): void
    function LoginResponse(): void
    function LoginValideBuyGroups(): void
    function LoginDrawCredits(): void
    function LoginRun(): void
    function LoginValidCollar(): void

    function ServerConnect(): void
    function ServerSend(key: string, data: {[_: string]: any}): void

    function MainHallAllow(key: string): boolean
    function MainHallDraw(): void
    function MainHallClick(): void

    function InventoryAddMany(player: Player, items: { Name: string, Group: string}[]): void
    function InventoryGet(player: Player, group: string): any
    function ChatRoomCharacterItemUpdate(player: Player, group: string): void

    function DialogCanTakePhotos(): boolean
    function DialogDraw(): void
    function DialogClick(): void
    function DialogMenuButtonBuild(): void
    function DialogItemClick(): void
    function DialogStruggleStart(player: Player, action: DialogStruggleAction, prevItem: Item, nextItem: Item): void
    function DialogStruggleStop(player: Player, action: DialogStruggleAction, args: {[_: string]: any}): void
    function DialogCanColor(player: Player, item: Item): boolean
    function DialogAlwaysAllowRestraint(): boolean
    function DialogLeave(): void
    function DialogLeaveItemMenu(): void
    function DialogDrawItemMenu(...args: any[]): void
    
    var DialogStruggleAction: DialogStruggleAction

    function ChatRoomOpenWardrobeScreen(): void
    function ChatRoomToggleKneel(): void
    function ChatRoomAttemptLeave(): void
    function ChatRoomCanLeave(): boolean
    const ChatRoomSendChat: FnType<() => void>
    function ChatRoomCurrentTime(): string

    function AudioPlaySoundForAsset(player: Player, asset: Asset | null): boolean

    function ElementValue(id: string, value?: string): string
    function ElementIsScrolledToEnd(id: string): boolean
    function ElementScrollToEnd(id: string): void
    function ElementFocus(id: string): void
    function ElementCreateInput(...args: any[]): void
    function ElementPosition(id: string, ...args: number[]): void

    function CharacterRefresh(player: Player, ...args: boolean[]): void;
    function ChatRoomCharacterUpdate(player: Player): void;
    function CharacterGetCurrent(): Player;

    function AssetGet(family: string, name: string, group: string): Asset;

    function MouseIn(x: number, y: number, w: number, h: number): boolean

    function DrawButton(x: number, y: number, w: number, h: number, ...args: any[]): void

    function AppearanceLoad(): void
    function AppearanceExit(): void
    function AppearanceRun(): void
    function AppearanceClick(): void

    const CharacterAppearanceMode: string;
    const CharacterAppearanceSelection: Player;

    const Player: Player
    const Asset: Asset[]

    const BackgroundsList: Background[]
    const BackgroundsTagList: string[]
}

interface LZString {
    compressToBase64(text: string): string
    decompressFromBase64(text: string): string
}

declare global {
    const LZString: LZString
}

export {}