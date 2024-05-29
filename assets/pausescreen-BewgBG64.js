import{O as s,C as o}from"./bsConstants-DkgTi0D1.js";import{$ as S}from"./blockrain.jquery-2qJd7CXZ.js";document.querySelector("#pauseScreen").innerHTML=`
<div id="gameFlexBox">
    <div class="wrapper">
        <div id="breakMessage" class="break-message" style="display:none;"></div>
    </div>
    <div id="breakTimer"></div>
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
</div>
`;let d,l=!1,c;const r=document.getElementById("playerList"),m=document.getElementById("breakTimer"),E=document.getElementById("breakMessage");s.onReady(async()=>{d=await s.player.getId();const y=await s.room.getMetadata(),f=y[`${o.EXTENSIONID}/game`],g=y[`${o.EXTENSIONID}/time`],i=document.createElement("li");i.id=`pl_${d}`,i.classList.add("self-list-item"),i.innerText="Click when ready!",r.appendChild(i),c=await s.party.getPlayers(),p(),s.party.onChange(e=>{c=e,p()}),i.onclick=async e=>{e.preventDefault(),l=!l,i.style.backgroundImage=l?"url(/check.svg)":"url(/cross.svg)",i.innerText=l?"Click to un-ready":"Click when ready!",await s.broadcast.sendMessage(o.TRANSPORT,l?o.READY:o.BUSY)},s.broadcast.onMessage(o.TRANSPORT,async e=>{const t=e.connectionId,n=c.find(a=>a.connectionId===t);if(n){const a=`pl_${n.id}`,I=document.getElementById(a);I&&(I.style.backgroundImage=e.data===o.READY?"url(/check.svg)":"url(/cross.svg)")}}),s.broadcast.onMessage(o.SCORE,async e=>{const t=`con_${e.connectionId}`,n=document.getElementById(t);n&&(n.innerText=`Score: ${e.data}`)}),s.broadcast.onMessage(o.MESSAGE,async e=>{e.data&&(E.innerText=e.data,E.style.display="block")});function p(){const e=r.querySelectorAll("li");for(const t of e){const n=t.id.split("_")[1];c.some(a=>a.id===n)||n!==d&&t.remove()}for(const t of c)if(!document.getElementById(`pl_${t.id}`)){const a=document.createElement("li");a.id=`pl_${t.id}`,a.classList.add("player-list-item"),a.innerHTML=`${t.name} <div id="con_${t.connectionId}"></div>`,r.appendChild(a)}}function b(e){let t=e*60;u(t);const n=setInterval(()=>{t--,t<=0?(clearInterval(n),m.innerText="Time is up!"):u(t)},1e3)}function u(e){const t=Math.floor(e/60),n=e%60,a=`${String(t).padStart(2,"0")}:${String(n).padStart(2,"0")}`;m.innerText=a}g>0?b(g):m.style.display="none",f?S(".block-game").blockrain({autoplay:!1,autoplayRestart:!1,theme:"candy",playText:"Pass some time during the break?",playButtonText:"Play",gameOverText:"Game Over",restartButtonText:"Play Again",scoreText:"Score",onStart:async function(){await s.broadcast.sendMessage(o.SCORE,0)},onRestart:function(){},onLine:async function(e,t,n){await s.broadcast.sendMessage(o.SCORE,n)}}):(document.getElementById("blockGameContainer").style.display="none",document.getElementById("blockGameControls").style.display="none")});
