import{O as t,C as o}from"./bsConstants-cgXdYAIG.js";const n=document.querySelector("#bs-whatsnew"),s=document.querySelector("#bs-whatsnew-notes");n.innerHTML=`
  <div id="newsContainer">
    <h1>Short Rest! 3/2</h1>
    I wanted to do something new.
    </br>
  </div>
`;t.onReady(async()=>{s.innerHTML=`
    <div id="footButtonContainer">
        <a href="https://www.patreon.com/battlesystem" target="_blank">Patreon!</a>
        <a href="https://discord.gg/ANZKDmWzr6" target="_blank">OBR Discord!</a>
    </div>
    <div class="close"><img style="height:40px; width:40px;" src="/close-button.svg"></div>
    `;const e=document.querySelector(".close");e.onclick=async()=>{await t.modal.close(o.EXTENSIONWHATSNEW)}});
