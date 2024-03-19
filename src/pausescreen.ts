import './pause-style.css';
import './blockrain/blockrain.css';
import './blockrain/blockrain.jquery.js';
import $ from "jquery";
import OBR, { Player } from '@owlbear-rodeo/sdk';
import { Constants } from './utilities/bsConstants.js';

document.querySelector<HTMLDivElement>('#pauseScreen')!.innerHTML = `
<div id="gameFlexBox">
    <div class="wrapper">
        <div id="breakMessage" class="break-message" style="display:none;"></div>
    </div>
    <div id="breakTimer"></div>
    <div id="attendanceBox">
        <ul id="playerList"></ul>
    </div>
    <div id="blockGameContainer" class="block-game"></div>
</div>
`;

let SELFID: string;
let SELFREADY = false;
let PLAYERLIST: Player[];

const PLAYERLISTING = document.getElementById('playerList') as HTMLUListElement;
const BREAKTIMER = document.getElementById('breakTimer') as HTMLDivElement;
const MESSAGEAREA = document.getElementById('breakMessage') as HTMLDivElement;

OBR.onReady(async () =>
{
    // Setup Self
    SELFID = await OBR.player.getId();
    const roomData = await OBR.room.getMetadata();

    const gameenabled = roomData[`${Constants.EXTENSIONID}/game`] as boolean;
    const breaktime = roomData[`${Constants.EXTENSIONID}/time`] as number;

    const selfitem = document.createElement('li');
    selfitem.id = `pl_${SELFID}`;
    selfitem.classList.add("self-list-item");
    selfitem.innerText = "Click when ready!";
    PLAYERLISTING.appendChild(selfitem);

    PLAYERLIST = await OBR.party.getPlayers();
    RefreshPlayerList();
    OBR.party.onChange((players) =>
    {
        PLAYERLIST = players;
        RefreshPlayerList();
    });

    selfitem.onclick = async (e) =>
    {
        e.preventDefault();
        SELFREADY = !SELFREADY;
        selfitem.style.backgroundImage = SELFREADY ? 'url(/check.svg)' : 'url(/cross.svg)';
        selfitem.innerText = SELFREADY ? "Click to un-ready" : "Click when ready!";
        await OBR.broadcast.sendMessage(Constants.TRANSPORT, SELFREADY ? Constants.READY : Constants.BUSY);
    }

    // Sample: await OBR.broadcast.sendMessage(Constants.TRANSPORT, "Hello!");
    OBR.broadcast.onMessage(Constants.TRANSPORT, async (event: Broadcast) =>
    {
        const connection = event.connectionId;
        const player = PLAYERLIST.find(x => x.connectionId === connection);
        if (player)
        {
            const listItemId = `pl_${player.id}`;
            const listItem = document.getElementById(listItemId);
            if (listItem)
            {
                listItem.style.backgroundImage = event.data === Constants.READY ? 'url(/check.svg)' : 'url(/cross.svg)';
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
    OBR.broadcast.onMessage(Constants.MESSAGE, async (event: Broadcast) =>
    {
        if (event.data)
        {
            MESSAGEAREA.innerText = event.data;
            MESSAGEAREA.style.display = 'block';
        }
    });

    /** Function to refresh the player list */
    function RefreshPlayerList()
    {
        const listItems = PLAYERLISTING.querySelectorAll('li');
        for (const listitem of listItems)
        {
            const id = listitem.id.split('_')[1];
            if (!PLAYERLIST.some(player => player.id === id))
            {
                if (id !== SELFID)
                {
                    listitem.remove();
                }
            }
        }

        for (const player of PLAYERLIST)
        {
            const existingitem = document.getElementById(`pl_${player.id}`);
            if (!existingitem)
            {
                const playeritem = document.createElement('li');
                playeritem.id = `pl_${player.id}`;
                playeritem.classList.add("player-list-item");
                playeritem.innerHTML = `${player.name} <div id="con_${player.connectionId}"></div>`;
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
        const intervalId = setInterval(() =>
        {
            totalSeconds--;
            if (totalSeconds <= 0)
            {
                clearInterval(intervalId);
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

    // Example: Start a countdown timer for 5 minutes
    if (breaktime > 0)
    {
        startCountdown(breaktime);
    }
    else
    {
        BREAKTIMER.style.display = "none";
    }

    if (gameenabled)
    {
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
        document.getElementById('blockGameContainer')!.style.display = "none";
    }
});
