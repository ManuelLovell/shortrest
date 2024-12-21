import{O as o,C as s,F as x,$ as C}from"./bsWorldTime-uy-e-eiY.js";document.querySelector("#pauseScreen").innerHTML=`
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
`;let r,c=!1,l;const m=document.getElementById("playerList"),y=document.getElementById("breakTimer"),E=document.getElementById("breakMessage");o.onReady(async()=>{r=await o.player.getId();const d=await o.room.getMetadata(),T=d[`${s.EXTENSIONID}/game`],f=d[`${s.EXTENSIONID}/time`],b=d[`${s.EXTENSIONID}/pausedAt`],i=document.createElement("li");i.id=`pl_${r}`,i.classList.add("self-list-item"),i.innerText="Click when ready!",m.appendChild(i),l=await o.party.getPlayers(),g(),o.party.onChange(e=>{l=e,g()}),i.onclick=async e=>{e.preventDefault(),c=!c,i.style.backgroundImage=c?"url(/check.svg)":"url(/cross.svg)",i.innerText=c?"Click to un-ready":"Click when ready!",await o.broadcast.sendMessage(s.TRANSPORT,c?s.READY:s.BUSY)},o.broadcast.onMessage(s.TRANSPORT,async e=>{const t=e.connectionId,n=l.find(a=>a.connectionId===t);if(n){const a=`pl_${n.id}`,I=document.getElementById(a);I&&(I.style.backgroundImage=e.data===s.READY?"url(/check.svg)":"url(/cross.svg)")}}),o.broadcast.onMessage(s.SCORE,async e=>{const t=`con_${e.connectionId}`,n=document.getElementById(t);n&&(n.innerText=`Score: ${e.data}`)}),o.broadcast.onMessage(s.MESSAGE,async e=>{e.data&&(E.innerText=e.data,E.style.display="block")});function g(){const e=m.querySelectorAll("li");for(const t of e){const n=t.id.split("_")[1];l.some(a=>a.id===n)||n!==r&&t.remove()}for(const t of l)if(!document.getElementById(`pl_${t.id}`)){const a=document.createElement("li");a.id=`pl_${t.id}`,a.classList.add("player-list-item"),a.innerHTML=`${t.name} <div id="con_${t.connectionId}"></div>`,m.appendChild(a)}}function k(e){u(e);const t=setInterval(()=>{e--,e<=0?(clearInterval(t),y.innerText="Time is up!"):u(e)},1e3)}function u(e){const t=Math.floor(e/60),n=e%60,a=`${String(t).padStart(2,"0")}:${String(n).padStart(2,"0")}`;y.innerText=a}const S=new Date(await x()),v=new Date(b),R=Math.round((S.getTime()-v.getTime())/1e3),p=f*60-R;p>0?k(p):y.style.display="none",T?C(".block-game").blockrain({autoplay:!1,autoplayRestart:!1,theme:"candy",playText:"Pass some time during the break?",playButtonText:"Play",gameOverText:"Game Over",restartButtonText:"Play Again",scoreText:"Score",onStart:async function(){await o.broadcast.sendMessage(s.SCORE,0)},onRestart:function(){},onLine:async function(e,t,n){await o.broadcast.sendMessage(s.SCORE,n)}}):(document.getElementById("blockGameContainer").style.display="none",document.getElementById("blockGameControls").style.display="none")});
