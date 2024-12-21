import OBR from '@owlbear-rodeo/sdk';
import './blockrain/blockrain.css';
import './blockrain/blockrain.jquery.js';
import $ from "jquery";
import './style.css'
import * as Utilities from './utilities/bsUtilities';
import { BSCACHE } from './utilities/bsSceneCache';
import { Constants } from './utilities/bsConstants';
import { FetchUtcTime } from './utilities/bsWorldTime.js';

OBR.onReady(async () =>
{
    await BSCACHE.InitializeCache();
    BSCACHE.SetupHandlers();

    if (BSCACHE.playerRole === "PLAYER")
    {
        await SHORTREST.InitiatePlayer();
    }
    else
    {
        await SHORTREST.InitiateGM();
    }

    const patreonContainer = document.getElementById("patreonContainer")!;
    patreonContainer.appendChild(Utilities.GetPatreonButton());
});

class ShortRest
{
    baseHeight = 420;
    paused = false;
    pausedAt = "";
    obscure = false;
    game = false;
    selfReady: boolean;
    timerId: number;
    version: string;

    MAINAPP = document.getElementById('app') as HTMLDivElement;
    PLAYERLISTING = document.getElementById('playerList') as HTMLUListElement;
    PAUSEBUTTON = document.getElementById('pauseButton') as HTMLButtonElement;
    HIDEVIEWBUTTON = document.getElementById('hideViewButton') as HTMLButtonElement;
    GAMEVIEWBUTTON = document.getElementById('gameViewButton') as HTMLButtonElement;
    BREAKLENGTHBUTTON = document.getElementById('breakLength') as HTMLInputElement;
    BREAKTIMER = document.getElementById('breakTimer') as HTMLDivElement;
    SENDMESSAGE = document.getElementById('sendMessage') as HTMLButtonElement;
    MESSAGETEXT = document.getElementById('MessageTextarea') as HTMLTextAreaElement;
    BODYELEMENT = document.getElementById('bodyElement') as HTMLElement;

    constructor(version: string)
    {
        this.version = `SHORTREST-${version}`;
        this.selfReady = false;
        this.timerId = 0;
    }

    public RetrieveSettings()
    {
        this.paused = BSCACHE.roomMetadata[`${Constants.EXTENSIONID}/paused`] as boolean ?? false;
        this.pausedAt = BSCACHE.roomMetadata[`${Constants.EXTENSIONID}/pausedAt`] as string ?? '';
        this.obscure = BSCACHE.roomMetadata[`${Constants.EXTENSIONID}/obscure`] as boolean ?? false;
        this.game = BSCACHE.roomMetadata[`${Constants.EXTENSIONID}/game`] as boolean ?? false;
    }

    public async InitiateGM()
    {
        this.RetrieveSettings();

        this.PLAYERLISTING = document.getElementById('playerList') as HTMLUListElement;
        this.PAUSEBUTTON = document.getElementById('pauseButton') as HTMLButtonElement;
        this.HIDEVIEWBUTTON = document.getElementById('hideViewButton') as HTMLButtonElement;
        this.GAMEVIEWBUTTON = document.getElementById('gameViewButton') as HTMLButtonElement;
        this.BREAKLENGTHBUTTON = document.getElementById('breakLength') as HTMLInputElement;
        this.BREAKTIMER = document.getElementById('breakTimer') as HTMLDivElement;
        this.SENDMESSAGE = document.getElementById('sendMessage') as HTMLButtonElement;
        this.MESSAGETEXT = document.getElementById('MessageTextarea') as HTMLTextAreaElement;
        this.BODYELEMENT = document.getElementById('bodyElement') as HTMLElement;

        this.BREAKLENGTHBUTTON.value = BSCACHE.roomMetadata[`${Constants.EXTENSIONID}/time`] as string ?? "0";

        const selfitem = document.createElement('li');
        selfitem.id = `pl_${BSCACHE.playerId}`;
        selfitem.classList.add("self-list-item");
        selfitem.innerText = "Self";
        this.PLAYERLISTING.appendChild(selfitem);

        selfitem.onclick = async (e) =>
        {
            e.preventDefault();
            if (this.paused)
            {
                this.selfReady = !this.selfReady;
                selfitem.style.backgroundImage = this.selfReady ? 'url(/check.svg)' : 'url(/cross.svg)';
                selfitem.innerText = this.selfReady ? "Click to un-ready" : "Click when ready!";
                await OBR.broadcast.sendMessage(Constants.TRANSPORT, this.selfReady ? Constants.READY : Constants.BUSY);
            }
        }

        this.SENDMESSAGE.onclick = async (e) =>
        {
            e.preventDefault();

            if (this.MESSAGETEXT.value && this.paused)
            {
                await OBR.broadcast.sendMessage(Constants.MESSAGE, this.MESSAGETEXT.value);
                this.MESSAGETEXT.value = "";
                this.SENDMESSAGE.classList.add('flashing-text');

                setTimeout(async () =>
                {
                    this.SENDMESSAGE.classList.remove('flashing-text');
                }, 1000);
            }
        };

        this.PAUSEBUTTON.innerHTML = this.paused ? "Resume</br>Game" : "Pause</br>Game";
        if (this.paused)
        {
            const currentTime = new Date(await FetchUtcTime());
            const oldTime = new Date(this.pausedAt);

            const elapsedSeconds = Math.round((currentTime.getTime() - oldTime.getTime()) / 1000);

            const timer = parseInt(this.BREAKLENGTHBUTTON.value) * 60;
            const timeLeft = timer - elapsedSeconds;
            if (timeLeft > 0)
            {
                this.StartCountdown(timeLeft);
            }
            else
            {
                this.BREAKTIMER.innerText = "--:--";
            }

            const listItems = this.PLAYERLISTING.querySelectorAll('li');
            for (const item of listItems)
            {
                item.style.backgroundImage = !this.paused ? 'url(/check.svg)' : 'url(/cross.svg)';
            }
            selfitem.innerText = "Click when ready!";
            this.HIDEVIEWBUTTON.disabled = this.paused;
            this.GAMEVIEWBUTTON.disabled = this.paused;
            this.BREAKLENGTHBUTTON.disabled = this.paused;
        }
        else
        {
            const listItems = this.PLAYERLISTING.querySelectorAll<HTMLDivElement>('.player-score-item');
            for (const item of listItems)
            {
                item.innerText = '';
            }
        }

        this.PAUSEBUTTON.onclick = async (e) =>
        {
            e.preventDefault();
            this.paused = !this.paused;
            this.PAUSEBUTTON.innerHTML = this.paused ? "Resume</br>Game" : "Pause</br>Game";

            const listItems = this.PLAYERLISTING.querySelectorAll('li');
            for (const item of listItems)
            {
                item.style.backgroundImage = !this.paused ? 'url(/check.svg)' : 'url(/cross.svg)';
            }
            this.HIDEVIEWBUTTON.disabled = this.paused;
            this.GAMEVIEWBUTTON.disabled = this.paused;
            this.BREAKLENGTHBUTTON.disabled = this.paused;

            const pausedAt = await FetchUtcTime();
            OBR.room.setMetadata({
                [`${Constants.EXTENSIONID}/paused`]: this.paused ? true : false,
                [`${Constants.EXTENSIONID}/pausedAt`]: pausedAt,
            });
            if (this.paused)
            {
                const timer = parseInt(this.BREAKLENGTHBUTTON.value) * 60;
                if (timer > 0)
                {
                    this.StartCountdown(timer);
                }
                else
                {
                    this.BREAKTIMER.innerText = "--:--";
                }
                selfitem.innerText = "Click when ready!";
                setTimeout(async () =>
                {
                    if (this.MESSAGETEXT.value)
                        await OBR.broadcast.sendMessage(Constants.MESSAGE, this.MESSAGETEXT.value);
                    else
                        await OBR.broadcast.sendMessage(Constants.MESSAGE, "The session has been paused.")
                }, 2000);
            }
            else
            {
                this.BREAKTIMER.innerText = "--:--";
                clearInterval(this.timerId);
                selfitem.innerText = "Self";
            }
            await this.StartGame();
        };

        this.HIDEVIEWBUTTON.innerHTML = this.obscure ? `Hide View</br>Enabled` : `Hide View</br>Disabled`;
        this.HIDEVIEWBUTTON.onclick = async (e) =>
        {
            e.preventDefault();
            this.obscure = !this.obscure;
            this.HIDEVIEWBUTTON.innerHTML = this.obscure ? `Hide View</br>Enabled` : `Hide View</br>Disabled`;

            OBR.room.setMetadata({ [`${Constants.EXTENSIONID}/obscure`]: this.obscure ? true : false });
        };

        this.GAMEVIEWBUTTON.innerHTML = this.game ? `Mini-Game</br>Enabled` : `Mini-Game</br>Disabled`;
        this.GAMEVIEWBUTTON.onclick = async (e) =>
        {
            e.preventDefault();
            this.game = !this.game;
            this.GAMEVIEWBUTTON.innerHTML = this.game ? `Mini-Game</br>Enabled` : `Mini-Game</br>Disabled`;

            OBR.room.setMetadata({ [`${Constants.EXTENSIONID}/game`]: this.game ? true : false });
        };

        this.BREAKLENGTHBUTTON.oninput = async () =>
        {
            this.BREAKLENGTHBUTTON.value = this.BREAKLENGTHBUTTON.value.slice(0, 2);
        };
        this.BREAKLENGTHBUTTON.onblur = async () =>
        {
            const time = this.BREAKLENGTHBUTTON.value ?? 0;
            OBR.room.setMetadata({ [`${Constants.EXTENSIONID}/time`]: time });
        };

        this.RefreshPlayerList();
        await this.StartGame();
    }

    public RefreshPlayerList()
    {
        const listItems = this.PLAYERLISTING.querySelectorAll('li');
        for (const listitem of listItems)
        {
            const id = listitem.id.split('_')[1];
            if (!BSCACHE.party.some(player => player.id === id))
            {
                if (id !== BSCACHE.playerId)
                {
                    listitem.remove();
                }
            }
        }

        for (const player of BSCACHE.party)
        {
            const existingitem = document.getElementById(`pl_${player.id}`);
            if (!existingitem)
            {
                const playeritem = document.createElement('li');
                playeritem.id = `pl_${player.id}`;
                playeritem.classList.add("player-list-item");
                playeritem.innerHTML = `${player.name} <div class="player-score-item" id="con_${player.connectionId}"></div>`;
                this.PLAYERLISTING.appendChild(playeritem);
            }
        }
    }

    public StartCountdown(totalSeconds: number)
    {
        // Update timer initially
        this.UpdateTimer(totalSeconds);

        // Update timer every second
        this.timerId = setInterval(() =>
        {
            totalSeconds--;
            if (totalSeconds <= 0)
            {
                clearInterval(this.timerId);
                this.BREAKTIMER.innerText = 'Time is up!';
            } else
            {
                this.UpdateTimer(totalSeconds);
            }
        }, 1000);
    }

    // Function to update the timer display
    public UpdateTimer(totalSeconds: number)
    {
        // Calculate minutes and seconds
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        // Format the time as "MM:SS"
        const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        // Update the timer display
        this.BREAKTIMER.innerText = formattedTime;
    }

    public async StartGame()
    {
        if (this.paused && this.game)
        {
            await OBR.action.setHeight(this.baseHeight + 400);
            this.BODYELEMENT.style.height = "100%";
            document.getElementById('blockGameContainer')!.style.display = "block";
            document.getElementById('blockGameControls')!.style.display = "block";
            $('.block-game').blockrain({
                autoplay: false,
                autoplayRestart: false,
                theme: "candy",
                playText: 'Pass some time during the break?',
                playButtonText: 'Play',
                gameOverText: 'Game Over',
                restartButtonText: 'Play Again',
                scoreText: 'Score',
                onStart: async function ()
                {
                    await OBR.broadcast.sendMessage(Constants.SCORE, 0);
                },
                onRestart: function () { },
                onLine: async function (_lines: string, _scoreIncrement: string, score: string)
                {
                    await OBR.broadcast.sendMessage(Constants.SCORE, score);
                }
            });
        }
        else
        {
            await OBR.action.setHeight(this.baseHeight);
            document.getElementById('blockGameContainer')!.style.display = "none";
            document.getElementById('blockGameControls')!.style.display = "none";
            this.BODYELEMENT.style.height = "";
        }
    }

    public async InitiatePlayer()
    {
        this.RetrieveSettings();

        await OBR.action.setHeight(50);
        document.querySelector<HTMLDivElement>('#app')!.innerHTML = "<div class='header'>Enjoy your stay.<div id='patreonContainer'></div></div>";;

        if (this.paused)
        {
            BSCACHE.paused = true;
            await OBR.modal.open({
                id: Constants.PAUSEID,
                url: "/pausescreen.html",
                fullScreen: true,
                hideBackdrop: false,
                hidePaper: !this.obscure,
                disablePointerEvents: false,
            });
        }
    }
}

export const SHORTREST = new ShortRest("1.03");
