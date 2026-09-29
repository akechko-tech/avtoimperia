/* ================= ПРАЗДНИК: победа, титул, рекорд — золотое конфетти, фанфары и крики толпы ================= */
// Большие успехи должны ощущаться: на пару секунд поверх экрана — надпись, конфетти цветов эпохи (золото, латунь, сукно, бумага), фанфары.
// Не мешает нажатиям (сквозь него можно листать газету), при «уменьшить движение» — только надпись.
let CEL=null;
function celebrate(big,sub,icon){
  try{if(CEL){CEL.el.remove();cancelAnimationFrame(CEL.raf);}}catch(_){}
  const el=document.createElement('div');el.className='cel';
  el.innerHTML=`<canvas></canvas><div class="cel-t"><i>${icon||'🏆'}</i><b>${esc(big)}</b>${sub?`<span>${esc(sub)}</span>`:''}</div>`;
  document.body.appendChild(el);
  try{if(AU.ctx&&AU.on.music)auReelFanfare();auSfx('cheer',1);}catch(_){}
  try{navigator.vibrate&&navigator.vibrate([40,60,40]);}catch(_){}
  const Q=CEL={el,t0:performance.now(),raf:0,P:[]};
  const cv=el.querySelector('canvas'),dpr=Math.min(1.5,window.devicePixelRatio||1),W=innerWidth,H=innerHeight;
  if(!REDUCE&&cv.getContext){cv.width=W*dpr;cv.height=H*dpr;const g=cv.getContext('2d');g.scale(dpr,dpr);
    const C=['#e8c35a','#d4a73a','#f3e2b0','#b8322a','#f7f1e1','#c98f2a','#8a1f1a'];
    // два залпа из нижних углов + дождь сверху
    for(let k=0;k<150;k++){const side=k%3,ang=side===0?-1.05-Math.random()*0.5:side===1?-2.09+Math.random()*0.5:1.57,sp=side===2?60+Math.random()*80:520+Math.random()*420;
      Q.P.push({x:side===0?-10:side===1?W+10:Math.random()*W,y:side===2?-20-Math.random()*H*0.5:H*0.92,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,r:Math.random()*6.28,vr:(Math.random()-0.5)*14,
        w:5+Math.random()*6,h:3+Math.random()*4,c:C[k%C.length],ph:Math.random()*6.28,d:side===2?0.2+Math.random()*0.5:0});}
    let last=performance.now();
    const loop=now=>{if(CEL!==Q)return;const dt=Math.min(0.05,(now-last)/1000);last=now;const age=(now-Q.t0)/1000;g.clearRect(0,0,W,H);
      const fade=age>2.6?Math.max(0,1-(age-2.6)/0.8):1;g.globalAlpha=fade;
      for(const p of Q.P){if(p.d>0){p.d-=dt;continue;}p.vx*=Math.pow(0.35,dt);p.vy=p.vy*Math.pow(0.5,dt)+260*dt;p.x+=(p.vx+Math.sin(age*5+p.ph)*40)*dt;p.y+=p.vy*dt;p.r+=p.vr*dt;
        g.save();g.translate(p.x,p.y);g.rotate(p.r);g.scale(1,Math.abs(Math.cos(age*6+p.ph))*0.9+0.1);g.fillStyle=p.c;g.fillRect(-p.w/2,-p.h/2,p.w,p.h);g.restore();}
      if(age<3.4)Q.raf=requestAnimationFrame(loop);};
    Q.raf=requestAnimationFrame(loop);}
  setTimeout(()=>{if(CEL===Q){el.classList.add('out');setTimeout(()=>{try{el.remove();}catch(_){}if(CEL===Q)CEL=null;},500);}},REDUCE?1800:3300);}
