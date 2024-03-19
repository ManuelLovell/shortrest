import OBR from '@owlbear-rodeo/sdk';
import './blockrain/blockrain.css';
import './blockrain/blockrain.jquery.js';
import $ from "jquery";
import './style.css'
import * as Utilities from './utilities/bsUtilities';
import { BSCACHE } from './utilities/bsSceneCache';
import { Constants } from './utilities/bsConstants';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <div class="header">Short Rest!</div><div id="whatsNew"></div>
    <table>
        <tr>
            <td>
                <button id="pauseButton">Pause</br>Game</button>
            </td>
            <td>
                <button id="hideViewButton">Hide View</br>Disabled</button>
            </td>
        </tr>
        <tr>
            <td>
                <div class="wrapper">
                    <label for="breakLength">Break Timer (Mins):</label>
                    <div id="timeWrapper">
                        <input type="number" id="breakLength" name="breakLength" maxlength="2" min="0">
                        <div id="breakTimer">--:--</div>
                    </div>
                </div>
            </td>
            <td>
                <button id="gameViewButton">Mini-Game</br>Disabled</button>
            </td>
        </tr>
    </table>
    </br>
    <div id="messageSendingControls">
        <textarea id="MessageTextarea" rows="4" placeholder="Add a message to the pause screen..."></textarea>
        <button id="sendMessage">SEND</button>
    </div>
        
    <div id="attendanceBox">
        <ul id="playerList"></ul>
    </div>
    <div id="blockGameContainer" class="block-game"></div>
`;

const BASEHEIGHT = 420;
const PLAYERLISTING = document.getElementById('playerList') as HTMLUListElement;
const PAUSEBUTTON = document.getElementById('pauseButton') as HTMLButtonElement;
const HIDEVIEWBUTTON = document.getElementById('hideViewButton') as HTMLButtonElement;
const GAMEVIEWBUTTON = document.getElementById('gameViewButton') as HTMLButtonElement;
const BREAKLENGTHBUTTON = document.getElementById('breakLength') as HTMLInputElement;
const BREAKTIMER = document.getElementById('breakTimer') as HTMLDivElement;
const SENDMESSAGE = document.getElementById('sendMessage') as HTMLButtonElement;
const MESSAGETEXT = document.getElementById('MessageTextarea') as HTMLTextAreaElement;
const BODYELEMENT = document.getElementById('bodyElement') as HTMLElement;

let SELFREADY = false;
let timerId: number;

OBR.onReady(async () =>
{
    await BSCACHE.InitializeCache();
    BSCACHE.SetupHandlers();

    let PAUSED = BSCACHE.roomMetadata[`${Constants.EXTENSIONID}/paused`] as boolean ?? false;
    let OBSCURE = BSCACHE.roomMetadata[`${Constants.EXTENSIONID}/obscure`] as boolean ?? false;
    let GAME = BSCACHE.roomMetadata[`${Constants.EXTENSIONID}/game`] as boolean ?? false;

    if (BSCACHE.playerRole === "PLAYER")
    {
        await OBR.action.setHeight(50);
        document.querySelector<HTMLDivElement>('#app')!.innerHTML = "<div class='header'>Enjoy your stay.</div>";;

        if (PAUSED)
        {
            BSCACHE.paused = true;
            await OBR.modal.open({
                id: Constants.PAUSEID,
                url: "/pausescreen.html",
                fullScreen: true,
                hideBackdrop: false,
                hidePaper: !OBSCURE,
                disablePointerEvents: false,
            });
        }
        return;
    }
    else
    {
        const whatsNewContainer = document.getElementById("whatsNew")!;
        whatsNewContainer.appendChild(Utilities.GetWhatsNewButton());

        BREAKLENGTHBUTTON.value = BSCACHE.roomMetadata[`${Constants.EXTENSIONID}/time`] as string ?? "0";

        const selfitem = document.createElement('li');
        selfitem.id = `pl_${BSCACHE.playerId}`;
        selfitem.classList.add("self-list-item");
        selfitem.innerText = "Self";
        PLAYERLISTING.appendChild(selfitem);

        selfitem.onclick = async (e) =>
        {
            e.preventDefault();
            if (PAUSED)
            {
                SELFREADY = !SELFREADY;
                selfitem.style.backgroundImage = SELFREADY ? 'url(/check.svg)' : 'url(/cross.svg)';
                selfitem.innerText = SELFREADY ? "Click to un-ready" : "Click when ready!";
                await OBR.broadcast.sendMessage(Constants.TRANSPORT, SELFREADY ? Constants.READY : Constants.BUSY);
            }
        }

        SENDMESSAGE.onclick = async (e) =>
        {
            e.preventDefault();
            
            if (MESSAGETEXT.value && PAUSED)
            {
                await OBR.broadcast.sendMessage(Constants.MESSAGE, MESSAGETEXT.value);
                MESSAGETEXT.value = "";
                SENDMESSAGE.classList.add('flashing-text');
                
                setTimeout(async () =>
                {
                    SENDMESSAGE.classList.remove('flashing-text');
                }, 1000);
            }
        };

        PAUSEBUTTON.innerHTML = PAUSED ? "Resume</br>Game" : "Pause</br>Game";
        if (PAUSED)
        {
            const timer = parseInt(BREAKLENGTHBUTTON.value);
            if (timer > 0)
            {
                startCountdown(timer);
            }
            else
            {
                BREAKTIMER.innerText = "--:--";
            }

            const listItems = PLAYERLISTING.querySelectorAll('li');
            for (const item of listItems)
            {
                item.style.backgroundImage = !PAUSED ? 'url(/check.svg)' : 'url(/cross.svg)';
            }
            selfitem.innerText = "Click when ready!";
            HIDEVIEWBUTTON.disabled = PAUSED;
            GAMEVIEWBUTTON.disabled = PAUSED;
            BREAKLENGTHBUTTON.disabled = PAUSED;
        }
        else
        {
            const listItems = PLAYERLISTING.querySelectorAll<HTMLDivElement>('.player-score-item');
            for (const item of listItems)
            {
                item.innerText = '';
            }
        }

        PAUSEBUTTON.onclick = async (e) =>
        {
            e.preventDefault();
            PAUSED = !PAUSED;
            PAUSEBUTTON.innerHTML = PAUSED ? "Resume</br>Game" : "Pause</br>Game";

            const listItems = PLAYERLISTING.querySelectorAll('li');
            for (const item of listItems)
            {
                item.style.backgroundImage = !PAUSED ? 'url(/check.svg)' : 'url(/cross.svg)';
            }
            HIDEVIEWBUTTON.disabled = PAUSED;
            GAMEVIEWBUTTON.disabled = PAUSED;
            BREAKLENGTHBUTTON.disabled = PAUSED;
            OBR.room.setMetadata({ [`${Constants.EXTENSIONID}/paused`]: PAUSED ? true : false });
            if (PAUSED)
            {
                const timer = parseInt(BREAKLENGTHBUTTON.value);
                if (timer > 0)
                {
                    startCountdown(timer);
                }
                else
                {
                    BREAKTIMER.innerText = "--:--";
                }
                selfitem.innerText = "Click when ready!";
                setTimeout(async () =>
                {
                    if (MESSAGETEXT.value)
                        await OBR.broadcast.sendMessage(Constants.MESSAGE, MESSAGETEXT.value);
                    else
                        await OBR.broadcast.sendMessage(Constants.MESSAGE, "The session has been paused.")
                }, 2000);
            }
            else
            {
                BREAKTIMER.innerText = "--:--";
                clearInterval(timerId);
                selfitem.innerText = "Self";
            }
            await StartGame();
        };

        HIDEVIEWBUTTON.innerHTML = OBSCURE ? `Hide View</br>Enabled` : `Hide View</br>Disabled`;
        HIDEVIEWBUTTON.onclick = async (e) =>
        {
            e.preventDefault();
            OBSCURE = !OBSCURE;
            HIDEVIEWBUTTON.innerHTML = OBSCURE ? `Hide View</br>Enabled` : `Hide View</br>Disabled`;

            OBR.room.setMetadata({ [`${Constants.EXTENSIONID}/obscure`]: OBSCURE ? true : false });
        };

        GAMEVIEWBUTTON.innerHTML = GAME ? `Mini-Game</br>Enabled` : `Mini-Game</br>Disabled`;
        GAMEVIEWBUTTON.onclick = async (e) =>
        {
            e.preventDefault();
            GAME = !GAME;
            GAMEVIEWBUTTON.innerHTML = GAME ? `Mini-Game</br>Enabled` : `Mini-Game</br>Disabled`;

            OBR.room.setMetadata({ [`${Constants.EXTENSIONID}/game`]: GAME ? true : false });
        };

        BREAKLENGTHBUTTON.oninput = async () =>
        {
            BREAKLENGTHBUTTON.value = BREAKLENGTHBUTTON.value.slice(0, 2);
        };
        BREAKLENGTHBUTTON.onblur = async () =>
        {
            const time = BREAKLENGTHBUTTON.value ?? 0;
            OBR.room.setMetadata({ [`${Constants.EXTENSIONID}/time`]: time });
        };

        RefreshPlayerList();
        await StartGame();

        ///////////////////
        /// Broadcast Handler
        ///////////////////
        // Sample: await OBR.broadcast.sendMessage(Constants.TRANSPORT, "Hello!");
        OBR.broadcast.onMessage(Constants.TRANSPORT, async (event: Broadcast) =>
        {
            if (BSCACHE.playerRole === 'GM')
            {
                const connection = event.connectionId;
                const player = BSCACHE.party.find(x => x.connectionId === connection);
                if (player)
                {
                    const listItemId = `pl_${player.id}`;
                    const listItem = document.getElementById(listItemId);
                    if (listItem)
                    {
                        listItem.style.backgroundImage = event.data === Constants.READY ? 'url(/check.svg)' : 'url(/cross.svg)';
                    }
                }
            }
        });

        OBR.broadcast.onMessage(Constants.SCORE, async (event: Broadcast) =>
        {
            const listItemId = `con_${event.connectionId}`;
            const listItem = document.getElementById(listItemId);
            if (listItem)
            {
                listItem.innerText = `Score: ${event.data}`;
            }
        });
        function RefreshPlayerList()
        {
            const listItems = PLAYERLISTING.querySelectorAll('li');
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
                    PLAYERLISTING.appendChild(playeritem);
                }
            }
        }

        function startCountdown(minutes: number)
        {
            // Calculate total seconds from minutes
            let totalSeconds = minutes * 60;

            // Update timer initially
            updateTimer(totalSeconds);

            // Update timer every second
            timerId = setInterval(() =>
            {
                totalSeconds--;
                if (totalSeconds <= 0)
                {
                    clearInterval(timerId);
                    BREAKTIMER.innerText = 'Time is up!';
                } else
                {
                    updateTimer(totalSeconds);
                }
            }, 1000);
        }

        // Function to update the timer display
        function updateTimer(totalSeconds: number)
        {
            // Calculate minutes and seconds
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;

            // Format the time as "MM:SS"
            const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

            // Update the timer display
            BREAKTIMER.innerText = formattedTime;
        }

        async function StartGame()
        {
            if (PAUSED && GAME)
            {
                await OBR.action.setHeight(BASEHEIGHT + 400);
                BODYELEMENT.style.height = "100%";
                document.getElementById('blockGameContainer')!.style.display = "block";
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
                await OBR.action.setHeight(BASEHEIGHT);
                document.getElementById('blockGameContainer')!.style.display = "none";
                BODYELEMENT.style.height = "";
            }
        }
    }
});