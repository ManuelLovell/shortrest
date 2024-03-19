import{O as t,C as i}from"./bsConstants-CIv9LX59.js";import{$ as D}from"./blockrain.jquery-DqERG-6C.js";class d{static PLAYER="PLAYER";static PARTY="PARTY";static SCENEITEMS="SCENEITEMS";static SCENEMETA="SCENEMETADATA";static SCENEGRID="SCENEGRID";static ROOMMETA="ROOMMETADATA";debouncedOnSceneItemsChange;debouncedOnSceneMetadataChange;debouncedOnRoomMetadataChange;playerId;playerColor;playerName;playerMetadata;playerRole;party;gridDpi;gridScale;sceneItems;sceneSelected;sceneMetadata;sceneReady;roomMetadata;oldRoomMetadata;theme;paused;caches;sceneMetadataHandler;sceneItemsHandler;sceneGridHandler;sceneReadyHandler;playerHandler;partyHandler;themeHandler;roomHandler;constructor(e){this.playerId="",this.playerName="",this.playerColor="",this.playerMetadata={},this.playerRole="PLAYER",this.party=[],this.sceneItems=[],this.sceneSelected=[],this.sceneMetadata={},this.gridDpi=0,this.gridScale=5,this.sceneReady=!1,this.theme="DARK",this.roomMetadata={},this.oldRoomMetadata={},this.paused=!1,this.caches=e,this.debouncedOnSceneItemsChange=b(this.OnSceneItemsChange.bind(this),100),this.debouncedOnSceneMetadataChange=b(this.OnSceneMetadataChanges.bind(this),100),this.debouncedOnRoomMetadataChange=b(this.OnRoomMetadataChange.bind(this),100)}async InitializeCache(){this.sceneReady=await t.scene.isReady(),this.theme=await t.theme.getTheme(),O(this.theme,document),this.caches.includes(d.PLAYER)&&(this.playerId=await t.player.getId(),this.playerName=await t.player.getName(),this.playerColor=await t.player.getColor(),this.playerMetadata=await t.player.getMetadata(),this.playerRole=await t.player.getRole()),this.caches.includes(d.PARTY)&&(this.party=await t.party.getPlayers()),this.caches.includes(d.SCENEITEMS)&&this.sceneReady&&(this.sceneItems=await t.scene.items.getItems()),this.caches.includes(d.SCENEMETA)&&this.sceneReady&&(this.sceneMetadata=await t.scene.getMetadata()),this.caches.includes(d.SCENEGRID)&&this.sceneReady&&(this.gridDpi=await t.scene.grid.getDpi(),this.gridScale=(await t.scene.grid.getScale()).parsed?.multiplier??5),this.caches.includes(d.ROOMMETA)&&(this.roomMetadata=await t.room.getMetadata(),this.paused=this.roomMetadata[`${i.EXTENSIONID}/paused`])}KillHandlers(){this.caches.includes(d.SCENEMETA)&&this.sceneMetadataHandler!==void 0&&this.sceneMetadataHandler(),this.caches.includes(d.SCENEITEMS)&&this.sceneItemsHandler!==void 0&&this.sceneItemsHandler(),this.caches.includes(d.SCENEGRID)&&this.sceneGridHandler!==void 0&&this.sceneGridHandler(),this.caches.includes(d.PLAYER)&&this.playerHandler!==void 0&&this.playerHandler(),this.caches.includes(d.PARTY)&&this.partyHandler!==void 0&&this.partyHandler(),this.caches.includes(d.ROOMMETA)&&this.roomHandler!==void 0&&this.roomHandler(),this.themeHandler!==void 0&&this.themeHandler()}SetupHandlers(){(this.sceneMetadataHandler===void 0||this.sceneMetadataHandler.length===0)&&this.caches.includes(d.SCENEMETA)&&(this.sceneMetadataHandler=t.scene.onMetadataChange(async e=>{this.debouncedOnSceneMetadataChange(e),this.sceneMetadata=e})),(this.sceneItemsHandler===void 0||this.sceneItemsHandler.length===0)&&this.caches.includes(d.SCENEITEMS)&&(this.sceneItemsHandler=t.scene.items.onChange(async e=>{this.debouncedOnSceneItemsChange(e),this.sceneItems=e})),(this.sceneGridHandler===void 0||this.sceneGridHandler.length===0)&&this.caches.includes(d.SCENEGRID)&&(this.sceneGridHandler=t.scene.grid.onChange(async e=>{this.gridDpi=e.dpi,this.gridScale=parseInt(e.scale),await this.OnSceneGridChange(e)})),(this.playerHandler===void 0||this.playerHandler.length===0)&&this.caches.includes(d.PLAYER)&&(this.playerHandler=t.player.onChange(async e=>{this.playerName=e.name,this.playerColor=e.color,this.playerId=e.id,this.playerRole=e.role,this.playerMetadata=e.metadata,await this.OnPlayerChange(e)})),(this.partyHandler===void 0||this.partyHandler.length===0)&&this.caches.includes(d.PARTY)&&(this.partyHandler=t.party.onChange(async e=>{this.party=e,await this.OnPartyChange(e)})),(this.roomHandler===void 0||this.roomHandler.length===0)&&this.caches.includes(d.ROOMMETA)&&(this.roomHandler=t.room.onMetadataChange(async e=>{this.roomMetadata=e,this.playerRole==="PLAYER"&&(e[`${i.EXTENSIONID}/paused`]===!0&&this.paused===!1?(this.paused=!0,await t.modal.open({id:i.PAUSEID,url:"/pausescreen.html",fullScreen:!0,hideBackdrop:!1,hidePaper:!this.roomMetadata[`${i.EXTENSIONID}/obscure`],disablePointerEvents:!1})):e[`${i.EXTENSIONID}/paused`]===!1&&this.paused===!0&&(this.paused=!1,await t.modal.close(i.PAUSEID))),this.debouncedOnRoomMetadataChange(e)})),this.themeHandler===void 0&&(this.themeHandler=t.theme.onChange(async e=>{this.theme=e.mode,await this.OnThemeChange(e)})),this.sceneReadyHandler===void 0&&(this.sceneReadyHandler=t.scene.onReadyChange(async e=>{this.sceneReady=e,e&&(this.sceneItems=await t.scene.items.getItems(),this.sceneMetadata=await t.scene.getMetadata(),this.gridDpi=await t.scene.grid.getDpi(),this.gridScale=(await t.scene.grid.getScale()).parsed?.multiplier??5),await this.OnSceneReadyChange(e)}))}async OnSceneMetadataChanges(e){}async OnSceneItemsChange(e){this.sceneReady}async OnSceneGridChange(e){}async OnSceneReadyChange(e){e&&this.SetupHandlers()}async OnPlayerChange(e){}async OnPartyChange(e){if(this.playerRole==="GM"){const c=document.getElementById("playerList"),g=c.querySelectorAll("li");for(const h of g){const u=h.id.split("_")[1];e.some(y=>y.id===u)||u!==this.playerId&&h.remove()}for(const h of e)if(!document.getElementById(`pl_${h.id}`)){const y=document.createElement("li");y.id=`pl_${h.id}`,y.classList.add("player-list-item"),y.innerText=h.name,c.appendChild(y)}}}async OnRoomMetadataChange(e){this.oldRoomMetadata=e}async OnThemeChange(e){O(e,document)}}const o=new d([d.ROOMMETA,d.PLAYER,d.PARTY]);function G(){const a=document.createElement("img");a.id="whatsNewButton",a.style.cursor="pointer",a.setAttribute("class","icon"),a.classList.add("clickable"),a.setAttribute("title","Whats New?"),a.setAttribute("src","/info.svg"),a.onclick=async function(){try{localStorage.setItem(i.VERSION,"true"),a.classList.remove("whats-new-shine")}catch{}await t.modal.open({id:i.EXTENSIONWHATSNEW,url:"/bswhatsnew.html",height:500,width:350})};try{localStorage.getItem(i.VERSION)!=="true"&&a.classList.add("whats-new-shine")}catch{}return a}function b(a,e){let c;return function(){clearTimeout(c),c=setTimeout(()=>{a()},e)}}function O(a,e){const c=window.matchMedia("(prefers-color-scheme: dark)"),g=c.matches?"dark":"light",h=c.matches?"light":"dark";for(var u=0;u<e.styleSheets.length;u++)for(var y=0;y<e.styleSheets[u].cssRules.length;y++){let l=e.styleSheets[u].cssRules[y];l&&l.media&&l.media.mediaText.includes("prefers-color-scheme")&&(a.mode=="LIGHT"?(l.media.appendMedium(`(prefers-color-scheme: ${g})`),l.media.mediaText.includes(h)&&l.media.deleteMedium(`(prefers-color-scheme: ${h})`)):a.mode=="DARK"&&(l.media.appendMedium(`(prefers-color-scheme: ${h})`),l.media.mediaText.includes(g)&&l.media.deleteMedium(`(prefers-color-scheme: ${g})`)))}}document.querySelector("#app").innerHTML=`
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
`;const A=420,E=document.getElementById("playerList"),R=document.getElementById("pauseButton"),f=document.getElementById("hideViewButton"),I=document.getElementById("gameViewButton"),p=document.getElementById("breakLength"),M=document.getElementById("breakTimer"),w=document.getElementById("sendMessage"),T=document.getElementById("MessageTextarea"),C=document.getElementById("bodyElement");let S=!1,H;t.onReady(async()=>{await o.InitializeCache(),o.SetupHandlers();let a=o.roomMetadata[`${i.EXTENSIONID}/paused`]??!1,e=o.roomMetadata[`${i.EXTENSIONID}/obscure`]??!1,c=o.roomMetadata[`${i.EXTENSIONID}/game`]??!1;if(o.playerRole==="PLAYER"){await t.action.setHeight(50),document.querySelector("#app").innerHTML="<div class='header'>Enjoy your stay.</div>",a&&(o.paused=!0,await t.modal.open({id:i.PAUSEID,url:"/pausescreen.html",fullScreen:!0,hideBackdrop:!1,hidePaper:!e,disablePointerEvents:!1}));return}else{let g=function(){const s=E.querySelectorAll("li");for(const n of s){const r=n.id.split("_")[1];o.party.some(m=>m.id===r)||r!==o.playerId&&n.remove()}for(const n of o.party)if(!document.getElementById(`pl_${n.id}`)){const m=document.createElement("li");m.id=`pl_${n.id}`,m.classList.add("player-list-item"),m.innerHTML=`${n.name} <div class="player-score-item" id="con_${n.connectionId}"></div>`,E.appendChild(m)}},h=function(s){let n=s*60;u(n),H=setInterval(()=>{n--,n<=0?(clearInterval(H),M.innerText="Time is up!"):u(n)},1e3)},u=function(s){const n=Math.floor(s/60),r=s%60,m=`${String(n).padStart(2,"0")}:${String(r).padStart(2,"0")}`;M.innerText=m};document.getElementById("whatsNew").appendChild(G()),p.value=o.roomMetadata[`${i.EXTENSIONID}/time`]??"0";const l=document.createElement("li");if(l.id=`pl_${o.playerId}`,l.classList.add("self-list-item"),l.innerText="Self",E.appendChild(l),l.onclick=async s=>{s.preventDefault(),a&&(S=!S,l.style.backgroundImage=S?"url(/check.svg)":"url(/cross.svg)",l.innerText=S?"Click to un-ready":"Click when ready!",await t.broadcast.sendMessage(i.TRANSPORT,S?i.READY:i.BUSY))},w.onclick=async s=>{s.preventDefault(),T.value&&a&&(await t.broadcast.sendMessage(i.MESSAGE,T.value),T.value="",w.classList.add("flashing-text"),setTimeout(async()=>{w.classList.remove("flashing-text")},1e3))},R.innerHTML=a?"Resume</br>Game":"Pause</br>Game",a){const s=parseInt(p.value);s>0?h(s):M.innerText="--:--";const n=E.querySelectorAll("li");for(const r of n)r.style.backgroundImage=a?"url(/cross.svg)":"url(/check.svg)";l.innerText="Click when ready!",f.disabled=a,I.disabled=a,p.disabled=a}else{const s=E.querySelectorAll(".player-score-item");for(const n of s)n.innerText=""}R.onclick=async s=>{s.preventDefault(),a=!a,R.innerHTML=a?"Resume</br>Game":"Pause</br>Game";const n=E.querySelectorAll("li");for(const r of n)r.style.backgroundImage=a?"url(/cross.svg)":"url(/check.svg)";if(f.disabled=a,I.disabled=a,p.disabled=a,t.room.setMetadata({[`${i.EXTENSIONID}/paused`]:!!a}),a){const r=parseInt(p.value);r>0?h(r):M.innerText="--:--",l.innerText="Click when ready!",setTimeout(async()=>{T.value?await t.broadcast.sendMessage(i.MESSAGE,T.value):await t.broadcast.sendMessage(i.MESSAGE,"The session has been paused.")},2e3)}else M.innerText="--:--",clearInterval(H),l.innerText="Self";await v()},f.innerHTML=e?"Hide View</br>Enabled":"Hide View</br>Disabled",f.onclick=async s=>{s.preventDefault(),e=!e,f.innerHTML=e?"Hide View</br>Enabled":"Hide View</br>Disabled",t.room.setMetadata({[`${i.EXTENSIONID}/obscure`]:!!e})},I.innerHTML=c?"Mini-Game</br>Enabled":"Mini-Game</br>Disabled",I.onclick=async s=>{s.preventDefault(),c=!c,I.innerHTML=c?"Mini-Game</br>Enabled":"Mini-Game</br>Disabled",t.room.setMetadata({[`${i.EXTENSIONID}/game`]:!!c})},p.oninput=async()=>{p.value=p.value.slice(0,2)},p.onblur=async()=>{const s=p.value??0;t.room.setMetadata({[`${i.EXTENSIONID}/time`]:s})},g(),await v(),t.broadcast.onMessage(i.TRANSPORT,async s=>{if(o.playerRole==="GM"){const n=s.connectionId,r=o.party.find(m=>m.connectionId===n);if(r){const m=`pl_${r.id}`,N=document.getElementById(m);N&&(N.style.backgroundImage=s.data===i.READY?"url(/check.svg)":"url(/cross.svg)")}}}),t.broadcast.onMessage(i.SCORE,async s=>{const n=`con_${s.connectionId}`,r=document.getElementById(n);r&&(r.innerText=`Score: ${s.data}`)});async function v(){a&&c?(await t.action.setHeight(A+400),C.style.height="100%",document.getElementById("blockGameContainer").style.display="block",D(".block-game").blockrain({autoplay:!1,autoplayRestart:!1,theme:"candy",playText:"Pass some time during the break?",playButtonText:"Play",gameOverText:"Game Over",restartButtonText:"Play Again",scoreText:"Score",onStart:async function(){await t.broadcast.sendMessage(i.SCORE,0)},onRestart:function(){},onLine:async function(s,n,r){await t.broadcast.sendMessage(i.SCORE,r)}})):(await t.action.setHeight(A),document.getElementById("blockGameContainer").style.display="none",C.style.height="")}}});