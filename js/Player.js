import { resolvePlatformCollisions } from "./collision.js";

export class Player {
  constructor(x, y) { this.spawnX=x; this.spawnY=y; this.reset(); }
  reset() {
    this.x=this.spawnX; this.y=this.spawnY; this.prevX=this.x; this.vx=0; this.vy=0;
    this.w=34; this.h=57; this.grounded=false; this.facing=1; this.anim=0;
  }
  update(dt, input, platforms) {
    this.prevX=this.x;
    const direction=(input.right?1:0)-(input.left?1:0);
    const speed=285, acceleration=1900;
    if (direction) { this.vx += direction*acceleration*dt; this.vx=Math.max(-speed,Math.min(speed,this.vx)); this.facing=direction; }
    else { this.vx *= Math.exp(-11*dt); if(Math.abs(this.vx)<4)this.vx=0; }
    this.x += this.vx*dt;
    this.x=Math.max(0,Math.min(1700-this.w,this.x));
    if(input.consumeJump() && this.grounded) { this.vy=-660; this.grounded=false; }
    const oldY=this.y;
    this.vy=Math.min(1050,this.vy+1750*dt);
    this.y+=this.vy*dt;
    this.grounded=false;
    resolvePlatformCollisions(this,platforms,oldY);
    this.anim += dt*(Math.abs(this.vx)>10?12:3);
  }
  draw(ctx, cameraX) {
    const x=this.x-cameraX, y=this.y;
    const bob=this.grounded && Math.abs(this.vx)>15 ? Math.sin(this.anim)*1.7 : 0;
    ctx.save(); ctx.translate(x+this.w/2,y+bob); ctx.scale(this.facing,1);
    // soft shadow
    ctx.fillStyle="#b56b9a35"; ctx.beginPath(); ctx.ellipse(0,56,17,4,0,0,Math.PI*2); ctx.fill();
    // legs and shiny boots
    ctx.strokeStyle="#71415f";ctx.lineWidth=6;ctx.lineCap="round";
    ctx.beginPath();ctx.moveTo(-5,39);ctx.lineTo(-7,49);ctx.moveTo(6,39);ctx.lineTo(8,49);ctx.stroke();
    ctx.fillStyle="#f28bb8";ctx.beginPath();ctx.roundRect(-15,46,13,7,4);ctx.roundRect(3,46,13,7,4);ctx.fill();
    // outfit
    const dress=ctx.createLinearGradient(-12,17,12,43);dress.addColorStop(0,"#ffb6d4");dress.addColorStop(1,"#e65b9e");
    ctx.fillStyle=dress;ctx.beginPath();ctx.moveTo(-8,17);ctx.lineTo(8,17);ctx.lineTo(14,41);ctx.quadraticCurveTo(0,46,-14,41);ctx.closePath();ctx.fill();
    ctx.strokeStyle="#fff0f7";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-8,21);ctx.lineTo(8,21);ctx.stroke();
    // arms
    ctx.strokeStyle="#f6c5b9";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-9,21);ctx.lineTo(-15,31);ctx.moveTo(9,21);ctx.lineTo(14,29);ctx.stroke();
    // hair behind head
    ctx.fillStyle="#70435e";ctx.beginPath();ctx.arc(0,5,15,Math.PI,Math.PI*2);ctx.lineTo(15,22);ctx.quadraticCurveTo(11,30,9,18);ctx.lineTo(-10,19);ctx.quadraticCurveTo(-13,29,-15,20);ctx.closePath();ctx.fill();
    // face
    const skin=ctx.createLinearGradient(-10,-8,10,14);skin.addColorStop(0,"#ffe1d5");skin.addColorStop(1,"#f3b6aa");
    ctx.fillStyle=skin;ctx.beginPath();ctx.arc(0,4,12,0,Math.PI*2);ctx.fill();
    // fringe
    ctx.fillStyle="#70435e";ctx.beginPath();ctx.arc(0,1,13,Math.PI,Math.PI*1.92);ctx.quadraticCurveTo(3,0,0,5);ctx.quadraticCurveTo(-7,1,-11,8);ctx.closePath();ctx.fill();
    // eye, blush, smile
    ctx.fillStyle="#55364e";ctx.beginPath();ctx.arc(4,6,1.2,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#e98da3";ctx.beginPath();ctx.ellipse(-5,10,3,1.6,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#b45b78";ctx.lineWidth=1;ctx.beginPath();ctx.arc(2,10,3,0.2,1.5);ctx.stroke();
    // hair clip
    ctx.fillStyle="#fff1a8";ctx.beginPath();ctx.arc(-8,-4,3,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
}