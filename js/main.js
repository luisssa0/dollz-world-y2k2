import { Input } from "./input.js";
import { Game } from "./Game.js";

const $=id=>document.getElementById(id);
const canvas=$("game"), input=new Input();
const overlay=$("overlay"), startBtn=$("start-btn"), pauseBtn=$("pause-btn");
let game;
const showOverlay=(kicker,title,message,button,buttonText)=>{
  $("overlay-kicker").textContent=kicker;$("overlay-title").textContent=title;
  $("overlay-text").innerHTML=message;$("start-btn").innerHTML=buttonText;
  overlay.classList.remove("hidden");
};
const hideOverlay=()=>overlay.classList.add("hidden");
game=new Game(canvas,input,data=>{
  if(data.score!==undefined)$("score").innerHTML=`${data.score} <i>/ 3</i>`;
  if(data.best!==undefined)$("best").textContent=data.best;
  if(data.status)$("status").textContent=data.status;
  if(data.items)data.items.forEach((item,i)=>{$(`item-${i}`).textContent=item.collected?"✓":"○";$(`item-${i}`).classList.toggle("done",item.collected)});
  pauseBtn.disabled=!["running","paused"].includes(game?.state);
  pauseBtn.textContent=game?.state==="paused"?"▶ RESUME":"Ⅱ PAUSE";
});
startBtn.addEventListener("click",()=>{
  if(game.state==="paused")game.resume();else game.start();
  hideOverlay();
});
pauseBtn.addEventListener("click",()=>{
  if(game.state==="running"){game.pause();showOverlay("TAKE A BREATHER","PAUSED","Your dream look can wait a moment.","","CONTINUE ♡")}
  else if(game.state==="paused"){game.resume();hideOverlay()}
});
$("restart-btn").addEventListener("click",()=>{
  game.reset();game.start();hideOverlay();
});
document.addEventListener("visibilitychange",()=>{
  if(document.hidden&&game.state==="running"){
    game.pause();showOverlay("TAKE A BREATHER","PAUSED","The runway will be right here when you return.","","CONTINUE ♡");
  }
});
let lastTime=0;
function frame(timestamp){
  const dt=lastTime?Math.min((timestamp-lastTime)/1000,.033):0;
  lastTime=timestamp;
  game.update(dt);game.render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

const originalFinish=game.finish.bind(game);
game.finish=(state)=>{
  originalFinish(state);
  if(state==="won")showOverlay("YOU ARE THE MOMENT","LOOK COMPLETE!","All accessories collected. The runway is yours! ✨","","PLAY AGAIN ↻");
  else showOverlay("OOPS, BABE!","TRY AGAIN","The runway can be tricky. Your next look is waiting!","","TRY AGAIN ♡");
};
