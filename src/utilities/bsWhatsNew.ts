import OBR from "@owlbear-rodeo/sdk";
import './bsWhatsNewStyle.css'
import { Constants } from "./bsConstants";


const whatsnew = document.querySelector<HTMLDivElement>('#bs-whatsnew')!;
const footer = document.querySelector<HTMLElement>('#bs-whatsnew-notes')!;

whatsnew.innerHTML = `
  <div id="newsContainer">
    <h1>Short Rest! 5/29</h1>
    Another pre-store release update.
    </br> Added the controls to the bottom of Tetris.
    </br> Added an 'end-game' button.
    </br> Improved support for role swapping.
    <h1>Short Rest! 3/20</h1>
    Found a bug with the Z/X keys being eaten by Tetris. Fixed.
    <h1>Short Rest! 3/19</h1>
    Changed the message text to not show at all by default, UNLESS you didn't type any pause text in.
    </br> Also updated it so you can send new messages while paused.  Should help with some use cases I've heard.
    <h1>Short Rest! 3/6</h1>
    Minor bug where a player could refresh and be no longer paused. Fixed.
    </br>
    <h1>Short Rest! 3/2</h1>
    I wanted to do something new.
    </br>
  </div>
`;

OBR.onReady(async () =>
{
    footer.innerHTML = `
    <div id="footButtonContainer">
        <a href="https://www.patreon.com/battlesystem" target="_blank">Patreon!</a>
        <a href="https://discord.gg/ANZKDmWzr6" target="_blank">OBR Discord!</a>
    </div>
    <div class="close"><img style="height:40px; width:40px;" src="/close-button.svg"></div>
    `;

    const closebutton = document.querySelector<HTMLElement>('.close')!;
    closebutton!.onclick = async () =>
    {
        await OBR.modal.close(Constants.EXTENSIONWHATSNEW);
    };
});
