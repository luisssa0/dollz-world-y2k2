import { Player } from "./Player.js";
import { overlaps } from "./collision.js";

const W=960,H=540,WORLD=1700;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

export class Game {
  constructor(canvas,input,onChange) {
    this.canvas=canvas;this.ctx=canvas.getContext("2d");this.input=input;this.onChange=onChange;
    this.platforms=[
      {x:0,y:455,w:360,h:85},{x:420,y:385,w:205,h:22},{x:700,y:315,w:205,h:22},
      {x:990,y:385,w:210,h:22},{x:1280,y:315,w:250,h:22}
    ];
    this.player=new Player(75,398);
    this.items=[
      {x:505,y:335,emoji:"👜",name:"IT BAG",collected:false},
      {x:785,y:265,emoji:"🕶️",name:"SHADES",collected:false},
      {x:1380,y:265,emoji:"💎",name:"BLING",collected:false}
    ];
    this.danger={x:360,y:495,w:1040,h:45};
    this.goal={x:1585,y:225,w:54,h:90};
    this.camera=0;this.state="ready";this.score=0;this.best=this.readBest();
    this.particles=[];this.time=0;this.onChange({score:0,best:this.best,status:"READY",items:this.items});
  }
  readBest(){try{return Number(localStorage.getItem("dollz-best")||0)}catch{return 0}}
  saveBest(){try{localStorage.setItem("dollz-best",String(this.best))}catch{}}
  start(){if(this.state==="running")return;if(this.state==="won"||this.state==="lost")this.reset();this.state="running";this.onChange({status:"PLAYING",score:this.score,best:this.best,items:this.items});}
  pause(){if(this.state!=="running")return;this.state="paused";this.input.clear();this.onChange({status:"PAUSED",score:this.score,best:this.best,items:this.items});}
  resume(){if(this.state!=="paused")return;this.state="running";this.onChange({status:"PLAYING",score:this.score,best:this.best,items:this.items});}
  reset(){this.player.reset();this.items.forEach(i=>i.collected=false);this.score=0;this.camera=0;this.particles=[];this.state="ready";this.onChange({status:"READY",score:0,best:this.best,items:this.items});}
  finish(state){this.state=state;this.input.clear();if(this.score>this.best){this.best=this.score;this.saveBest()}this.onChange({status:state==="won"?"YOU DID IT!":"OH NO!",score:this.score,best:this.best,items:this.items});}
  update(dt){
    if(this.state!=="running")return;
    this.time+=dt;
    this.player.update(dt,this.input,this.platforms);
    const p=this.player;
    for(const item of this.items){
      if(!item.collected && overlaps({x:p.x,y:p.y,w:p.w,h:p.h},{x:item.x-17,y:item.y-17,w:34,h:34})){
        item.collected=true;this.score++;this.burst(item.x,item.y);
        this.onChange({score:this.score,best:this.best,items:this.items});
      }
    }
    if(overlaps(p,this.danger)||p.y>H+90){this.finish("lost");return}
    if(overlaps(p,this.goal)&&this.items.every(i=>i.collected)){this.finish("won");return}
    this.camera=clamp(p.x-W*.35,0,WORLD-W);
    this.particles=this.particles.filter(a=>a.life>0);
    for(const a of this.particles){a.x+=a.vx*dt;a.y+=a.vy*dt;a.vy+=250*dt;a.life-=dt}
  }
  burst(x,y){for(let i=0;i<12;i++){const a=Math.PI*2*i/12;this.particles.push({x,y,vx:Math.cos(a)*(45+Math.random()*90),vy:Math.sin(a)*(45+Math.random()*90),life:.65})}}
  render(){
    const c=this.ctx,cam=this.camera;
    c.clearRect(0,0,W,H);
    const bg=c.createLinearGradient(0,0,0,H);bg.addColorStop(0,"#f9e7f5");bg.addColorStop(.65,"#fcecf5");bg.addColorStop(1,"#f8d8e9");c.fillStyle=bg;c.fillRect(0,0,W,H);
    // soft sky haze and decorative clouds
    for(let i=0;i<7;i++){const x=((i*247-cam*.22)%(W+260)+W+260)%(W+260)-80;this.cloud(c,x,70+(i%3)*85,.7+(i%2)*.25)}
    // distant skyline
    c.fillStyle="#edcce2";for(let i=0;i<15;i++){let x=i*135-(cam*.38%135);c.fillRect(x,335-(i%4)*23,75,120);c.fillStyle="#f6dced";for(let j=0;j<3;j++)c.fillRect(x+12+j*18,350-(i%4)*23,7,10);c.fillStyle="#edcce2"}
    // floating stars
    for(let i=0;i<28;i++){const x=((i*113-cam*.5)%(W+20)+W+20)%(W+20);const y=28+(i*67%275);this.star(c,x,y,2+(i%3),"#fff9fd")}
    c.save();c.translate(-cam,0);
    // danger zone
    c.fillStyle="#e98bb8";c.fillRect(this.danger.x,this.danger.y,this.danger.w,this.danger.h);
    c.fillStyle="#f8c1d9";for(let x=this.danger.x;x<this.danger.x+this.danger.w;x+=28){c.beginPath();c.moveTo(x,495);c.lineTo(x+14,480);c.lineTo(x+28,495);c.fill()}
    // platforms
    for(const p of this.platforms)this.platform(c,p);
    // runway finish gate
    this.drawGoal(c);
    // collectibles
    for(const item of this.items)if(!item.collected)this.drawItem(c,item);
    this.player.draw(c,0);
    for(const a of this.particles){c.globalAlpha=Math.max(0,a.life/.65);this.star(c,a.x,a.y,4,"#fff7b7")}c.globalAlpha=1;
    c.restore();
    // progress ribbon
    c.fillStyle="#ffffffa8";c.beginPath();c.roundRect(18,16,165,27,14);c.fill();
    c.fillStyle="#bc7c9f";c.font="700 10px DM Sans";c.fillText("✦  RUNWAY DISTRICT",31,34);
    c.fillStyle="#ffffffaa";c.beginPath();c.roundRect(W-157,16,139,27,14);c.fill();
    c.fillStyle="#b87c9e";c.fillText("LOOKS COLLECTED  "+this.score+"/3",W-145,34);
  }
  cloud(c,x,y,s){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle="#fff9fd99";c.beginPath();c.arc(0,12,17,0,Math.PI*2);c.arc(19,3,23,0,Math.PI*2);c.arc(43,13,17,0,Math.PI*2);c.rect(-2,12,47,18);c.fill();c.restore()}
  star(c,x,y,r,color){c.fillStyle=color;c.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4-Math.PI/2,rr=i%2?r*.38:r;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}c.closePath();c.fill()}
  platform(c,p){c.save();c.shadowColor="#c77da866";c.shadowBlur=15;c.shadowOffsetY=6;c.fillStyle="#f9a9cc";c.beginPath();c.roundRect(p.x,p.y,p.w,p.h,9);c.fill();c.shadowColor="transparent";const g=c.createLinearGradient(0,p.y,0,p.y+p.h);g.addColorStop(0,"#fff0f7");g.addColorStop(.28,"#f6b4d2");g.addColorStop(1,"#e985b7");c.fillStyle=g;c.beginPath();c.roundRect(p.x,p.y,p.w,p.h,9);c.fill();c.fillStyle="#ffffff9c";c.beginPath();c.roundRect(p.x+8,p.y+4,p.w-16,3,2);c.fill();c.fillStyle="#d66b9f";for(let x=p.x+17;x<p.x+p.w-8;x+=24){c.beginPath();c.arc(x,p.y+14,1.5,0,Math.PI*2);c.fill()}c.restore()}
  drawItem(c,item){const bob=Math.sin(this.time*3+item.x)*5;c.save();c.shadowColor="#e97eb8";c.shadowBlur=18;c.fillStyle="#fff7fc";c.beginPath();c.arc(item.x,item.y+bob,20,0,Math.PI*2);c.fill();c.shadowBlur=0;c.font="23px sans-serif";c.textAlign="center";c.textBaseline="middle";c.fillText(item.emoji,item.x,item.y+bob+1);c.restore()}
  drawGoal(c){const g=this.goal;c.save();c.shadowColor="#d778ad77";c.shadowBlur=20;c.fillStyle="#fff0f7";c.beginPath();c.roundRect(g.x,g.y,g.w,g.h,15);c.fill();c.shadowBlur=0;c.strokeStyle="#e78bb8";c.lineWidth=5;c.stroke();c.fillStyle="#f4a4c8";c.beginPath();c.roundRect(g.x+10,g.y+18,g.w-20,g.h-18,10);c.fill();c.fillStyle="#fff";c.font="20px serif";c.textAlign="center";c.fillText("♡",g.x+g.w/2,g.y+43);c.fillStyle="#b26d96";c.font="800 9px DM Sans";c.fillText("FINISH",g.x+g.w/2,g.y-10);c.restore()}
}