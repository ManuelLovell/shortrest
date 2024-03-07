import{O as e,C as o}from"./bsConstants-CIv9LX59.js";const n=document.querySelector("#bs-whatsnew"),s=document.querySelector("#bs-whatsnew-notes");n.innerHTML=`
  <div id="newsContainer">
    <h1>Short Rest! 3/6</h1>
    Minor bug where a player could refresh and be no longer paused. Fixed.
    </br>
    <h1>Short Rest! 3/2</h1>
    I wanted to do something new.
    </br>
  </div>
`;e.onReady(async()=>{s.innerHTML=`
    <div id="footButtonContainer">
        <a href="https://www.patreon.com/battlesystem" target="_blank">Patreon!</a>
        <a href="https://discord.gg/ANZKDmWzr6" target="_blank">OBR Discord!</a>
    </div>
    <div class="close"><img style="height:40px; width:40px;" src="/close-button.svg"></div>
    `;const t=document.querySelector(".close");t.onclick=async()=>{await e.modal.close(o.EXTENSIONWHATSNEW)}});
