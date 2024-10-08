export class Constants
{
    static VERSION = "whatsnew-shortrest-102";
    static EXTENSIONID = "com.battle-system.shortrest";
    static PAUSEID = "com.battle-system.shortrest-pause";
    static EXTENSIONWHATSNEW = "com.battle-system.shortrest-whatsnew";

    static TRANSPORT = "battle-system.shortrest.transport";
    static SCORE = "battle-system.shortrest.score";
    static MESSAGE = "battle-system.shortrest.message";

    static READY = "READY";
    static BUSY = "BUSY";

    static CHECKREGISTRATION = 'https://vrwtdtmnbyhaehtitrlb.supabase.co/functions/v1/patreon-check';
    static ANONAUTH = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
   
    static BASEHTML = `
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
    <div id="blockGameControls">
        <table style="width: 100%;">
            <tr>
                <th colspan="2">Controls</th>
            </tr>
            <tr>
                <td class="block-controls-text">A / D : Move</td>
                <td class="block-controls-text">S : Drop</td>
            </tr>
            <tr>
                <td class="block-controls-text">W : Rotate</td>
                <td class="block-controls-text">ESC : End Game</td>
            </tr>
        </table>
    </div>
`;
}