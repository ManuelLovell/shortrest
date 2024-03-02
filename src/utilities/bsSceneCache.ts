import OBR, { Grid, Item, Metadata, Player, Theme } from "@owlbear-rodeo/sdk";
import * as Utilities from './bsUtilities';
import { Constants } from "./bsConstants";
class BSCache
{
    // Cache Names
    static PLAYER = "PLAYER";
    static PARTY = "PARTY";
    static SCENEITEMS = "SCENEITEMS";
    static SCENEMETA = "SCENEMETADATA";
    static SCENEGRID = "SCENEGRID";
    static ROOMMETA = "ROOMMETADATA";

    private debouncedOnSceneItemsChange: (items: Item[]) => void;
    private debouncedOnSceneMetadataChange: (items: Metadata) => void;
    private debouncedOnRoomMetadataChange: (items: Metadata) => void;

    playerId: string;
    playerColor: string;
    playerName: string;
    playerMetadata: {};
    playerRole: "GM" | "PLAYER";

    party: Player[];

    gridDpi: number;
    gridScale: number; // IE; 5ft

    sceneItems: Item[];
    sceneSelected: string[];
    sceneMetadata: Metadata;
    sceneReady: boolean;

    roomMetadata: Metadata;
    oldRoomMetadata: Metadata;

    theme: any;

    paused: boolean;

    caches: string[];

    //handlers
    sceneMetadataHandler?: () => void;
    sceneItemsHandler?: () => void;
    sceneGridHandler?: () => void;
    sceneReadyHandler?: () => void;
    playerHandler?: () => void;
    partyHandler?: () => void;
    themeHandler?: () => void;
    roomHandler?: () => void;

    constructor(caches: string[])
    {
        this.playerId = "";
        this.playerName = "";
        this.playerColor = "";
        this.playerMetadata = {};
        this.playerRole = "PLAYER";
        this.party = [];
        this.sceneItems = [];
        this.sceneSelected = [];
        this.sceneMetadata = {};
        this.gridDpi = 0;
        this.gridScale = 5;
        this.sceneReady = false;
        this.theme = "DARK";
        this.roomMetadata = {};
        this.oldRoomMetadata = {};
        this.paused = false;

        this.caches = caches;

        // Large singular updates to sceneItems can cause the resulting onItemsChange to proc multiple times, at the same time
        this.debouncedOnSceneItemsChange = Utilities.Debounce(this.OnSceneItemsChange.bind(this) as any, 100);
        this.debouncedOnSceneMetadataChange = Utilities.Debounce(this.OnSceneMetadataChanges.bind(this) as any, 100);
        this.debouncedOnRoomMetadataChange = Utilities.Debounce(this.OnRoomMetadataChange.bind(this) as any, 100);
    }

    public async InitializeCache()
    {
        // Always Cache
        this.sceneReady = await OBR.scene.isReady();
        this.theme = await OBR.theme.getTheme();
        Utilities.SetThemeMode(this.theme, document);

        if (this.caches.includes(BSCache.PLAYER))
        {
            this.playerId = await OBR.player.getId();
            this.playerName = await OBR.player.getName();
            this.playerColor = await OBR.player.getColor();
            this.playerMetadata = await OBR.player.getMetadata();
            this.playerRole = await OBR.player.getRole();
        }

        if (this.caches.includes(BSCache.PARTY))
        {
            this.party = await OBR.party.getPlayers();
        }

        if (this.caches.includes(BSCache.SCENEITEMS))
        {
            if (this.sceneReady) this.sceneItems = await OBR.scene.items.getItems();
        }

        if (this.caches.includes(BSCache.SCENEMETA))
        {
            if (this.sceneReady) this.sceneMetadata = await OBR.scene.getMetadata();
        }

        if (this.caches.includes(BSCache.SCENEGRID))
        {
            if (this.sceneReady)
            {
                this.gridDpi = await OBR.scene.grid.getDpi();
                this.gridScale = (await OBR.scene.grid.getScale()).parsed?.multiplier ?? 5;
            }
        }

        if (this.caches.includes(BSCache.ROOMMETA))
        {
            this.roomMetadata = await OBR.room.getMetadata();
            this.paused = this.roomMetadata[`${Constants.EXTENSIONID}/paused`] as boolean;
        }
    }

    public KillHandlers()
    {
        if (this.caches.includes(BSCache.SCENEMETA) && this.sceneMetadataHandler !== undefined) this.sceneMetadataHandler!();
        if (this.caches.includes(BSCache.SCENEITEMS) && this.sceneItemsHandler !== undefined) this.sceneItemsHandler!();
        if (this.caches.includes(BSCache.SCENEGRID) && this.sceneGridHandler !== undefined) this.sceneGridHandler!();
        if (this.caches.includes(BSCache.PLAYER) && this.playerHandler !== undefined) this.playerHandler!();
        if (this.caches.includes(BSCache.PARTY) && this.partyHandler !== undefined) this.partyHandler!();
        if (this.caches.includes(BSCache.ROOMMETA) && this.roomHandler !== undefined) this.roomHandler!();

        if (this.themeHandler !== undefined) this.themeHandler!();
    }

    public SetupHandlers()
    {

        if (this.sceneMetadataHandler === undefined || this.sceneMetadataHandler.length === 0)
        {
            if (this.caches.includes(BSCache.SCENEMETA))
            {
                this.sceneMetadataHandler = OBR.scene.onMetadataChange(async (metadata) =>
                {
                    this.debouncedOnSceneMetadataChange(metadata);
                    this.sceneMetadata = metadata;
                });
            }
        }

        if (this.sceneItemsHandler === undefined || this.sceneItemsHandler.length === 0)
        {
            if (this.caches.includes(BSCache.SCENEITEMS))
            {
                this.sceneItemsHandler = OBR.scene.items.onChange(async (items) =>
                {
                    this.debouncedOnSceneItemsChange(items);
                    this.sceneItems = items;
                });
            }
        }

        if (this.sceneGridHandler === undefined || this.sceneGridHandler.length === 0)
        {
            if (this.caches.includes(BSCache.SCENEGRID))
            {
                this.sceneGridHandler = OBR.scene.grid.onChange(async (grid) =>
                {
                    this.gridDpi = grid.dpi;
                    this.gridScale = parseInt(grid.scale);
                    await this.OnSceneGridChange(grid);
                });
            }
        }

        if (this.playerHandler === undefined || this.playerHandler.length === 0)
        {
            if (this.caches.includes(BSCache.PLAYER))
            {
                this.playerHandler = OBR.player.onChange(async (player) =>
                {
                    this.playerName = player.name;
                    this.playerColor = player.color;
                    this.playerId = player.id;
                    this.playerRole = player.role;
                    this.playerMetadata = player.metadata;
                    await this.OnPlayerChange(player);
                });
            }
        }

        if (this.partyHandler === undefined || this.partyHandler.length === 0)
        {
            if (this.caches.includes(BSCache.PARTY))
            {
                this.partyHandler = OBR.party.onChange(async (party) =>
                {
                    this.party = party;
                    await this.OnPartyChange(party);
                });
            }
        }

        if (this.roomHandler === undefined || this.roomHandler.length === 0)
        {
            if (this.caches.includes(BSCache.ROOMMETA))
            {
                this.roomHandler = OBR.room.onMetadataChange(async (metadata) =>
                {
                    this.roomMetadata = metadata;
                    if (this.playerRole === 'PLAYER')
                    {
                        if (metadata[`${Constants.EXTENSIONID}/paused`] === true
                            && this.paused === false)
                        {
                            this.paused = true;
                            await OBR.modal.open({
                                id: Constants.PAUSEID,
                                url: "/pausescreen.html",
                                fullScreen: true,
                                hideBackdrop: false,
                                hidePaper: !this.roomMetadata[`${Constants.EXTENSIONID}/obscure`] as boolean,
                                disablePointerEvents: false,
                            });
                        }
                        else if (metadata[`${Constants.EXTENSIONID}/paused`] === false
                            && this.paused === true)
                        {
                            this.paused = false;
                            await OBR.modal.close(Constants.PAUSEID);
                        }
                    }
                    this.debouncedOnRoomMetadataChange(metadata);
                });
            }
        }


        if (this.themeHandler === undefined)
        {
            this.themeHandler = OBR.theme.onChange(async (theme) =>
            {
                this.theme = theme.mode;
                await this.OnThemeChange(theme);
            });
        }

        // Only setup if we don't have one, never kill
        if (this.sceneReadyHandler === undefined)
        {
            this.sceneReadyHandler = OBR.scene.onReadyChange(async (ready) =>
            {
                this.sceneReady = ready;

                if (ready)
                {
                    this.sceneItems = await OBR.scene.items.getItems();
                    this.sceneMetadata = await OBR.scene.getMetadata();
                    this.gridDpi = await OBR.scene.grid.getDpi();
                    this.gridScale = (await OBR.scene.grid.getScale()).parsed?.multiplier ?? 5;
                }
                await this.OnSceneReadyChange(ready);
            });
        }
    }

    public async OnSceneMetadataChanges(_metadata: Metadata)
    {
        if (this.playerRole === "GM")
        {
        }
        else
        {
        }
    }

    public async OnSceneItemsChange(_items: Item[])
    {
        if (this.sceneReady)
        {
            if (this.playerRole === "GM")
            {
            }
            else
            {
            }
        }
    }

    public async OnSceneGridChange(_grid: Grid)
    {

    }

    public async OnSceneReadyChange(ready: boolean)
    {

        if (ready)
        {
            this.SetupHandlers();
        }
    }

    public async OnPlayerChange(_player: Player)
    {
    }

    public async OnPartyChange(party: Player[])
    {
        if (this.playerRole === 'GM')
        {
            const PLAYERLISTING = document.getElementById('playerList') as HTMLUListElement;
            const listItems = PLAYERLISTING.querySelectorAll('li');
            for (const listitem of listItems)
            {
                const id = listitem.id.split('_')[1];
                if (!party.some(player => player.id === id))
                {
                    if (id !== this.playerId)
                    {
                        listitem.remove();
                    }
                }
            }
    
            for (const player of party)
            {
                const existingitem = document.getElementById(`pl_${player.id}`);
                if (!existingitem)
                {
                    const playeritem = document.createElement('li');
                    playeritem.id = `pl_${player.id}`;
                    playeritem.classList.add("player-list-item");
                    playeritem.innerText = player.name;
                    PLAYERLISTING.appendChild(playeritem);
                }
            }
        }
    }

    public async OnRoomMetadataChange(metadata: Metadata)
    {
        this.oldRoomMetadata = metadata;
    }

    public async OnThemeChange(theme: Theme)
    {
        Utilities.SetThemeMode(theme, document);
    }
};

// Set the handlers needed for this Extension
export const BSCACHE = new BSCache([BSCache.ROOMMETA, BSCache.PLAYER, BSCache.PARTY]);
