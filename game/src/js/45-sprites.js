/* ================= SPRITES: cars from behind, crews, scenery (painted in code) ================= */
const SPR={cache:{}};
function mkCanvas(w,h){const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c;}
function shade(hex,amt){const n=parseInt((hex||'#333333').slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=amt<0?0:255,t=Math.abs(amt);r=Math.round((f-r)*t+r);g=Math.round((f-g)*t+g);b=Math.round((f-b)*t+b);return `rgb(${r},${g},${b})`;}
function mix(a,b,k){const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16);const f=(x,y)=>Math.round(x+(y-x)*k);return `rgb(${f(A>>16,B>>16)},${f(A>>8&255,B>>8&255)},${f(A&255,B&255)})`;}
function vgrad(c,y0,y1,stops){const g=c.createLinearGradient(0,y0,0,y1);stops.forEach(([k,col])=>g.addColorStop(k,col));return g;}
function hgrad(c,x0,x1,stops){const g=c.createLinearGradient(x0,0,x1,0);stops.forEach(([k,col])=>g.addColorStop(k,col));return g;}
function ell(c,x,y,rx,ry,fill){c.beginPath();c.ellipse(x,y,Math.max(0.1,rx),Math.max(0.1,ry),0,0,7);c.fillStyle=fill;c.fill();}
function rrect(c,x,y,w,h,r,fill){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();c.fillStyle=fill;c.fill();}
function poly(c,pts,fill){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fillStyle=fill;c.fill();}
// ---------- облик машины по эпохе, кузову и подготовке ----------
function carStyle(md,prep,y){
  const p=parts(md),b=p.b.id;
  if(p.b.truck)return b==='b6'?'van':'truck';
  if(prep===2)return y<1901?'carriage':y<1907?'gp1901':y<1912?'gp1907':y<1925?'gp1912':'gp1925';
  if(y<1901)return 'carriage';
  if(prep===1)return y<1912?'gp1901':'sport';
  return b==='b1'?(y<1912?'runabout':'sport'):b==='b2'?'tonneau':b==='b3'?'tourer':'sedan';
}
function crewKit(y){return y<1906?{coat:'#6b5a44',cap:'cap',hat:'#3a3026'}:y<1915?{coat:'#7a6a55',cap:'helmet',hat:'#5a3f28'}:y<1922?{coat:'#8a8272',cap:'helmet',hat:'#4d3524'}:{coat:'#d8d4c8',cap:'helmet',hat:'#5b4030'};}
// ---------- спрайт машины сзади: frame −2..2 — поворот, phase — развевающийся шарф ----------
function carSprite(spec,frame,phase){
  const key='car|'+spec.key+'|'+frame+'|'+phase;if(SPR.cache[key])return SPR.cache[key];
  const PPM=110,W=2.6*PPM,H=2.3*PPM,cv=mkCanvas(W,H),c=cv.getContext('2d');
  c.translate(W/2,H-0.12*PPM);c.scale(PPM,PPM); // метры, y вверх = отрицательный
  drawCarRear(c,spec,frame,phase);
  const o={img:cv,wM:2.6,hM:2.3,ax:0.5,ay:(H-0.12*PPM)/H};SPR.cache[key]=o;return o;
}
function drawCarRear(c,S,frame,phase){
  const st=S.style,col=S.color||'#23427a',yaw=frame*0.2,sv=Math.sin(yaw),cv=Math.cos(yaw),side=frame>0?1:frame<0?-1:0,av=Math.abs(sv);
  const early=st==='carriage',gpEarly=st==='gp1901'||st==='gp1907',narrow=st==='gp1912'||st==='gp1925',closed=st==='sedan'||st==='van'||st==='truck';
  const T=early?1.26:narrow?1.22:1.34,wr=early?0.47:S.y<1912?0.45:S.y<1922?0.41:0.38,tw=S.y<1906?0.085:S.y<1922?0.11:0.14;
  const len=early?2.6:3.4,dark='#15161a',brass=S.y<1916?'#c9a24a':'#c8ccd2',wood=S.y<1906?'#b58a52':'#8e6a42';
  const B=col,bl=shade(B,0.3),bd=shade(B,-0.38),bodyG=(y0,y1)=>vgrad(c,y0,y1,[[0,bl],[0.4,B],[1,bd]]);
  ell(c,0,0,T*0.78+av*0.9,0.14,'rgba(0,0,0,.33)');
  const wheel=(x,r)=>{const ww=tw+av*r*0.95;c.save();c.translate(x,-r);
    rrect(c,-ww/2,-r,ww,r*2,Math.min(ww*0.45,r),vgrad(c,-r,r,[[0,'#34353a'],[0.5,'#16171a'],[1,'#08090b']]));
    if(av>0.12){c.save();c.translate((side||1)*ww*0.22,0);c.scale(av,1);ell(c,0,0,r,r,'#141518');ell(c,0,0,r*0.76,r*0.76,S.wheel==='wire'?'#2a2c30':S.wheel==='alloy'?'#9aa0a8':wood);
      if(S.wheel==='wire'){c.strokeStyle='#dfe3e8';c.lineWidth=0.012;for(let k=0;k<18;k++){const a=k/18*6.283;c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(a)*r*0.74,Math.sin(a)*r*0.74);c.stroke();}}
      else if(S.wheel==='alloy'){c.fillStyle='#6a7078';for(let k=0;k<8;k++){c.save();c.rotate(k/8*6.283);c.fillRect(-0.035,r*0.18,0.07,r*0.55);c.restore();}}
      else{c.fillStyle=shade(wood,-0.28);for(let k=0;k<12;k++){c.save();c.rotate(k/12*6.283);c.fillRect(-0.024,0,0.048,r*0.72);c.restore();}}
      ell(c,0,0,r*0.17,r*0.17,brass);c.restore();}
    else{rrect(c,-ww*0.35,-r*0.12,ww*0.7,r*0.24,0.02,brass);}
    c.fillStyle='rgba(255,255,255,.08)';c.fillRect(-ww/2+ww*0.14,-r*0.85,ww*0.16,r*1.7);c.restore();};
  const flank=(h0,h1,w2)=>{if(av<0.05)return;const x0=side*w2/2,x1=x0+side*len*av*0.55,dy=len*av*0.16;
    poly(c,[[x0,-h0],[x1,-h0-dy*0.25],[x1,-h1-dy],[x0,-h1]],hgrad(c,x0,x1,[[0,shade(B,-0.12)],[1,shade(B,-0.5)]]));};
  const frontWheel=()=>{if(av>0.12)wheel(side*T/2+side*len*av*0.52,wr*0.94);};
  const fender=(x,r)=>{c.beginPath();c.ellipse(x,-r,tw/2+0.1,r*1.12,0,Math.PI,0);c.fillStyle=vgrad(c,-r*2.1,-r,[[0,shade(B,0.1)],[1,shade(B,-0.35)]]);c.fill();};
  // дальнее колесо, рама, мост
  if(side)frontWheel();
  wheel(side?-side*T/2:-T/2,wr);if(!side)wheel(T/2,wr);
  c.fillStyle=dark;c.fillRect(-T/2+tw/2,-wr-0.05,T-tw,0.1);ell(c,0,-wr,0.15,0.13,'#26282d');
  if(early||gpEarly){c.strokeStyle='#2c2c2c';c.lineWidth=0.04;[-1,1].forEach(sd=>{c.beginPath();c.moveTo(sd*(T/2-0.14),-wr);c.lineTo(sd*0.4,-wr*1.3);c.stroke();});}
  let crew=[],crewY=0,crewK=0.84,hideTop=null;
  if(st==='carriage'){const w=1.08*cv;flank(wr*0.95,wr*2.35,w);
    rrect(c,-w/2,-wr*2.3,w,wr*1.4,0.06,bodyG(-wr*2.3,-wr*0.9));c.strokeStyle=shade(B,0.55);c.lineWidth=0.014;c.strokeRect(-w/2+0.07,-wr*2.2,w-0.14,wr*1.2);
    rrect(c,-w/2+0.03,-wr*3.05,w-0.06,wr*0.8,0.1,vgrad(c,-wr*3.05,-wr*2.25,[[0,'#6e4d32'],[1,'#3b2718']]));
    crew=[[-0.25,0],[0.25,1]];crewY=-wr*2.85;}
  else if(gpEarly){const w=0.98*cv;flank(wr*0.95,wr*2.0,w);
    rrect(c,-w/2,-wr*1.95,w,wr*1.05,0.07,bodyG(-wr*1.95,-wr*0.9));
    crew=[[-0.24,0],[0.24,1]];crewY=-wr*2.05;
    hideTop=()=>{ell(c,0,-wr*2.0,w*0.47,0.2,vgrad(c,-wr*2-0.2,-wr*2+0.2,[[0,shade(B,0.4)],[0.5,B],[1,bd]]));c.fillStyle=brass;c.fillRect(-0.05,-wr*2.0-0.2,0.1,0.06);
      const ns=st==='gp1907'?2:1;for(let k=0;k<ns;k++){const sx=ns===1?0.26:(k?0.3:-0.3);c.save();c.translate(sx,-wr*2.05);ell(c,0,0,0.33,0.33,'#141518');ell(c,0,0,0.24,0.24,st==='gp1907'?'#6a6d72':'#3a2a1c');ell(c,0,0,0.07,0.07,brass);c.restore();}
      c.fillStyle='#7a5a32';c.fillRect(-w/2+0.05,-wr*2.05-0.03,w-0.1,0.06);};}
  else if(narrow){const w=(st==='gp1925'?0.62:0.72)*cv;flank(wr*0.95,wr*2.3,w);
    c.beginPath();c.moveTo(-w/2,-wr*0.9);c.lineTo(w/2,-wr*0.9);c.bezierCurveTo(w*0.56,-wr*1.7,w*0.3,-wr*2.45,0,-wr*2.5);c.bezierCurveTo(-w*0.3,-wr*2.45,-w*0.56,-wr*1.7,-w/2,-wr*0.9);c.fillStyle=bodyG(-wr*2.5,-wr*0.9);c.fill();
    c.fillStyle='rgba(255,255,255,.2)';c.beginPath();c.ellipse(-w*0.14,-wr*2.05,w*0.1,0.14,0,0,7);c.fill();
    ell(c,0,-wr*1.45,0.14,0.11,'#f1eee4');c.fillStyle='#111';c.font='bold 0.15px sans-serif';c.textAlign='center';c.fillText(String(S.num||1),0,-wr*1.39);
    c.fillStyle='#6b665f';rrect(c,w/2-0.03,-wr*1.1,0.1,0.06,0.02,'#6b665f');
    const solo=st==='gp1925'||!S.mech;crew=solo?[[0.12,0]]:[[-0.2,0],[0.2,1]];crewY=-wr*2.35;crewK=0.8;
    if(st==='gp1912')hideTop=()=>{c.save();c.translate(-0.02,-wr*2.12);c.scale(1,0.42);ell(c,0,0,0.34,0.34,'#141518');ell(c,0,0,0.24,0.24,'#2a2c30');c.restore();};}
  else if(st==='sport'||st==='runabout'){const w=1.0*cv;flank(wr*0.95,wr*2.0,w);
    fender(-T/2,wr);fender(T/2,wr);
    rrect(c,-w/2,-wr*2.0,w,wr*1.1,0.1,bodyG(-wr*2.0,-wr*0.9));
    rrect(c,-w*0.36,-wr*1.85,w*0.72,wr*0.45,0.06,vgrad(c,-wr*1.85,-wr*1.4,[[0,'#5d6064'],[1,'#2a2b2e']]));c.fillStyle=brass;c.fillRect(-0.05,-wr*1.9,0.1,0.07);
    crew=S.mech?[[-0.24,0],[0.24,1]]:[[-0.2,0]];crewY=-wr*2.05;
    hideTop=()=>{c.save();c.translate(w*0.28,-wr*1.35);ell(c,0,0,0.26,0.26,'#141518');ell(c,0,0,0.18,0.18,S.wheel==='wire'?'#2a2c30':wood);ell(c,0,0,0.05,0.05,brass);c.restore();};}
  else if(st==='tonneau'||st==='tourer'){const w=1.16*cv;flank(wr*0.95,wr*2.3,w);fender(-T/2,wr);fender(T/2,wr);
    c.beginPath();c.moveTo(-w/2,-wr*0.9);c.lineTo(w/2,-wr*0.9);c.lineTo(w/2,-wr*2.05);c.quadraticCurveTo(0,-wr*2.35,-w/2,-wr*2.05);c.closePath();c.fillStyle=bodyG(-wr*2.35,-wr*0.9);c.fill();
    if(st==='tonneau'){rrect(c,-0.17,-wr*2.0,0.34,wr*0.95,0.06,shade(B,-0.18));c.fillStyle=brass;c.fillRect(0.09,-wr*1.5,0.04,0.04);}
    crew=S.mech?[[-0.28,0],[0.28,1]]:[[-0.28,0]];crewY=-wr*2.25;
    if(st==='tourer')hideTop=()=>{rrect(c,-w*0.47,-wr*2.75,w*0.94,wr*0.55,0.14,vgrad(c,-wr*2.75,-wr*2.2,[[0,'#3f3a32'],[1,'#1f1b16']]));c.save();c.translate(0,-wr*1.45);ell(c,0,0,0.3,0.3,'#141518');ell(c,0,0,0.2,0.2,wood);c.restore();};}
  else if(st==='sedan'){const w=1.18*cv;flank(wr*0.95,wr*3.5,w);fender(-T/2,wr);fender(T/2,wr);
    rrect(c,-w/2,-wr*3.55,w,wr*2.65,S.y>=1923?0.24:0.07,bodyG(-wr*3.55,-wr*0.9));
    rrect(c,-w*0.32,-wr*3.15,w*0.64,wr*0.62,0.06,vgrad(c,-wr*3.15,-wr*2.5,[[0,'#b4cddd'],[1,'#56708a']]));ell(c,-w*0.05,-wr*2.85,0.1,0.11,'rgba(40,35,30,.7)');
    c.save();c.translate(0,-wr*1.6);ell(c,0,0,0.3,0.3,'#141518');ell(c,0,0,0.2,0.2,S.y>=1912?'#2a2c30':wood);c.restore();}
  else{const w=1.28*cv;flank(wr*0.95,wr*4.3,w);
    rrect(c,-w/2,-wr*4.35,w,wr*3.45,0.05,st==='truck'?vgrad(c,-wr*4.35,-wr*0.9,[[0,'#8e6e48'],[1,'#5a4128']]):bodyG(-wr*4.35,-wr*0.9));
    if(st==='truck'){c.strokeStyle='#3b2a18';c.lineWidth=0.025;for(let k=1;k<5;k++){c.beginPath();c.moveTo(-w/2,-wr*0.9-k*wr*0.69);c.lineTo(w/2,-wr*0.9-k*wr*0.69);c.stroke();}}
    else{c.fillStyle=shade(B,-0.25);c.fillRect(-0.012,-wr*4.25,0.024,wr*3.3);c.fillStyle=brass;c.fillRect(0.06,-wr*2.6,0.05,0.05);}}
  // экипаж, затем то, что сзади его заслоняет (бак, запаски, сложенный тент)
  const kit=crewKit(S.y);crew.forEach(([x,m])=>drawCrew(c,x*cv+side*av*0.18,crewY,kit,m,phase,S.y,crewK));
  if(hideTop)hideTop();
  // фонари
  if(!early){const lx=(closed?0.5:0.38)*cv;[-1,1].forEach(sd=>{if(sd===1&&S.y<1916)return;ell(c,sd*lx,-wr*1.2,0.04,0.04,S.brake?'#ff4a3a':'#7a1f18');if(S.brake)ell(c,sd*lx,-wr*1.2,0.1,0.1,'rgba(255,70,50,.35)');});}
  // ближние колёса
  if(side){wheel(side*T/2,wr);if(early||gpEarly||narrow)frontWheel();}
}
function drawCrew(c,x,seatY,kit,mech,phase,y,k){
  const sh=(mech?0.95:1)*(k||0.84),by=seatY+0.22;c.save();c.translate(x,by);c.scale(sh,sh);
  // плечи и спина
  c.beginPath();c.moveTo(-0.24,0);c.quadraticCurveTo(-0.26,-0.42,-0.13,-0.5);c.lineTo(0.13,-0.5);c.quadraticCurveTo(0.26,-0.42,0.24,0);c.closePath();
  c.fillStyle=vgrad(c,-0.5,0,[[0,shade(kit.coat,0.15)],[1,shade(kit.coat,-0.35)]]);c.fill();
  c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=0.01;c.beginPath();c.moveTo(0,-0.48);c.lineTo(0,-0.05);c.stroke();
  // шея и голова
  ell(c,0,-0.54,0.055,0.05,'#caa07c');
  ell(c,0,-0.65,0.105,0.12,'#d6ae8a');
  // шлем или кепка
  if(kit.cap==='helmet'){c.beginPath();c.ellipse(0,-0.67,0.115,0.125,0,Math.PI*1.05,Math.PI*1.95+0.2);c.lineTo(0.11,-0.6);c.lineTo(-0.11,-0.6);c.closePath();c.fillStyle=vgrad(c,-0.8,-0.6,[[0,shade(kit.hat,0.25)],[1,kit.hat]]);c.fill();
    c.fillStyle=shade(kit.hat,-0.3);c.fillRect(-0.11,-0.63,0.22,0.03);}
  else{ell(c,0,-0.72,0.115,0.07,kit.hat);c.fillStyle=shade(kit.hat,-0.25);c.fillRect(-0.13,-0.7,0.26,0.03);}
  // ремешок очков
  c.fillStyle='#2b1d12';c.fillRect(-0.105,-0.665,0.21,0.022);
  // шарф
  if(!mech){const fl=phase?0.06:-0.02;c.beginPath();c.moveTo(-0.06,-0.53);c.quadraticCurveTo(-0.2,-0.5+fl,-0.34,-0.46+fl*1.5);c.lineTo(-0.3,-0.41+fl);c.quadraticCurveTo(-0.18,-0.46,-0.04,-0.48);c.closePath();c.fillStyle=y<1920?'#e8e2cf':'#b8322a';c.fill();}
  else{c.strokeStyle=shade(kit.coat,-0.3);c.lineWidth=0.05;c.beginPath();c.moveTo(0.12,-0.4);c.lineTo(0.3,-0.25);c.stroke();} // механик держится за борт
  c.restore();
}
// ---------- декорации: деревья, дома, люди ----------
const SCEN_PPM=36;
function scenSprite(type,variant){
  const key='sc|'+type+'|'+variant;if(SPR.cache[key])return SPR.cache[key];
  const D=SCENERY[type];if(!D)return null;const P=D.ppm||SCEN_PPM,W=D.w*P,H=D.h*P,cv=mkCanvas(W,H),c=cv.getContext('2d');
  c.translate(W/2,H);c.scale(P,P);const rnd=mulberry32(hashStr(key));D.draw(c,rnd,variant);
  const o={img:cv,wM:D.w,hM:D.h,ax:0.5,ay:1,col:D.col};SPR.cache[key]=o;return o;
}
function foliage(c,rnd,cx,cy,rx,ry,base,n){for(let i=0;i<n;i++){const a=rnd()*6.283,d=Math.sqrt(rnd()),x=cx+Math.cos(a)*rx*d*0.8,y=cy+Math.sin(a)*ry*d*0.8,r=(0.25+rnd()*0.3)*Math.min(rx,ry);ell(c,x,y,r,r*0.9,shade(base,(rnd()-0.55)*0.35+(y<cy?0.08:-0.05)));}}
const SCENERY={
  plane:{w:9,h:13,col:0.5,draw:(c,r)=>{c.fillStyle=vgrad(c,-8,0,[[0,'#9a9280'],[1,'#6f6656']]);poly(c,[[-0.35,0],[0.35,0],[0.25,-7],[-0.25,-7]],c.fillStyle);for(let i=0;i<9;i++)ell(c,(r()-0.5)*0.4,-r()*6.5,0.12,0.2,r()<0.5?'#c9c2a8':'#5c5446');foliage(c,r,0,-9,4.2,3.4,'#4f7a38',38);}},
  poplar:{w:3.4,h:18,col:0.4,draw:(c,r)=>{poly(c,[[-0.2,0],[0.2,0],[0.1,-4],[-0.1,-4]],'#5a4632');foliage(c,r,0,-10.5,1.5,7.3,'#3f6a31',46);}},
  cypress:{w:2.4,h:13,col:0.4,draw:(c,r)=>{poly(c,[[-0.15,0],[0.15,0],[0.08,-1.5],[-0.08,-1.5]],'#4a3a28');c.beginPath();c.moveTo(0,-12.8);c.quadraticCurveTo(1.25,-6,0.9,-1);c.lineTo(-0.9,-1);c.quadraticCurveTo(-1.25,-6,0,-12.8);c.fillStyle=vgrad(c,-13,-1,[[0,'#355535'],[1,'#1f3a24']]);c.fill();foliage(c,r,0,-6,0.7,5,'#2d4a2e',16);}},
  olive:{w:6,h:5.5,col:0.45,draw:(c,r)=>{c.strokeStyle='#5d5040';c.lineWidth=0.4;c.beginPath();c.moveTo(0,0);c.bezierCurveTo(0.6,-1,-0.6,-2,0.2,-3);c.stroke();foliage(c,r,0,-3.6,2.7,1.6,'#7d8a64',30);}},
  pine:{w:7,h:12,col:0.5,draw:(c,r)=>{c.strokeStyle='#5b4430';c.lineWidth=0.35;c.beginPath();c.moveTo(0,0);c.bezierCurveTo(0.5,-4,-0.4,-7,0.3,-9.5);c.stroke();foliage(c,r,0.3,-10.2,3.3,1.4,'#35592f',32);}},
  fir:{w:4.5,h:13,col:0.45,draw:(c,r,v)=>{poly(c,[[-0.2,0],[0.2,0],[0.15,-1.6],[-0.15,-1.6]],'#4a3626');for(let i=0;i<5;i++){const y0=-1.2-i*2.2,w=2.1-i*0.35;poly(c,[[0,y0-3.2],[w,y0],[-w,y0]],vgrad(c,y0-3.2,y0,[[0,'#2e5a3a'],[1,'#1c3b28']]));}if(v===1){for(let i=0;i<4;i++)poly(c,[[0,-11.2-i*0.01],[0.5,-10.3],[-0.5,-10.3]],'#eef2f5');}}},
  oak:{w:9,h:10,col:0.5,draw:(c,r)=>{poly(c,[[-0.4,0],[0.4,0],[0.3,-4],[-0.3,-4]],'#5a4330');foliage(c,r,0,-6.2,4.3,3.4,'#4a6b2f',44);}},
  elm:{w:8,h:12,col:0.45,draw:(c,r)=>{c.strokeStyle='#5a4631';c.lineWidth=0.35;[-0.8,0,0.8].forEach(k=>{c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(k*0.6,-4,k*2,-7);c.stroke();});foliage(c,r,0,-8.5,3.8,3.2,'#557a37',40);}},
  palm:{w:6,h:12,col:0.35,draw:(c,r)=>{c.strokeStyle='#8a6a48';c.lineWidth=0.35;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(0.8,-6,0.2,-11);c.stroke();for(let i=0;i<8;i++){const a=i/8*6.283;c.strokeStyle='#3f6b32';c.lineWidth=0.25;c.beginPath();c.moveTo(0.2,-11);c.quadraticCurveTo(0.2+Math.cos(a)*1.5,-11.6+Math.sin(a)*0.6-1,0.2+Math.cos(a)*2.8,-10.6+Math.abs(Math.sin(a))*1.2);c.stroke();}}},
  birch:{w:4,h:12,col:0.35,draw:(c,r)=>{poly(c,[[-0.18,0],[0.18,0],[0.1,-9],[-0.1,-9]],'#ecebe4');for(let i=0;i<10;i++)c.fillRect(-0.18,-r()*8.5,0.2+r()*0.16,0.07);foliage(c,r,0,-8.5,1.9,2.8,'#78a04a',30);}},
  bush:{w:3,h:1.6,col:0,draw:(c,r)=>foliage(c,r,0,-0.8,1.4,0.75,'#4a6f35',14)},
  hedge:{w:12,h:1.8,col:0,draw:(c,r)=>{rrect(c,-6,-1.7,12,1.7,0.7,'#3f6130');foliage(c,r,0,-1.2,5.8,0.6,'#4c7236',34);}},
  wall:{w:10,h:1.3,col:0.4,draw:(c,r)=>{rrect(c,-5,-1.25,10,1.25,0.08,'#a39a88');for(let i=0;i<28;i++){c.fillStyle=shade('#a39a88',(r()-0.5)*0.35);c.fillRect(-5+r()*9.6,-1.2+r()*1.0,0.5+r()*0.4,0.22);}}},
  fence:{w:10,h:1.4,col:0,draw:(c,r)=>{c.fillStyle='#8a6a48';for(let x=-5;x<=5;x+=1.25)c.fillRect(x-0.06,-1.4,0.12,1.4);c.fillRect(-5,-1.15,10,0.1);c.fillRect(-5,-0.6,10,0.1);}},
  pole:{w:3,h:8,col:0.25,draw:(c,r)=>{c.fillStyle='#5b4632';c.fillRect(-0.1,-8,0.2,8);c.fillRect(-1.2,-7.4,2.4,0.14);[-1,-0.35,0.35,1].forEach(x=>ell(c,x,-7.5,0.06,0.08,'#dde6ea'));}},
  km:{w:0.9,h:1.1,col:0.25,draw:(c,r)=>{rrect(c,-0.35,-0.8,0.7,0.8,0.12,'#ecebe4');c.beginPath();c.ellipse(0,-0.8,0.35,0.28,0,Math.PI,0);c.fillStyle='#c0392b';c.fill();c.fillStyle='#222';c.font='0.2px sans-serif';c.textAlign='center';c.fillText(String(3+Math.floor(r()*80)),0,-0.35);}},
  rock:{w:4,h:2.2,col:0.5,draw:(c,r)=>{ell(c,0,-0.9,1.8,1.0,'#9c9384');ell(c,-0.4,-1.2,0.9,0.5,'#b7ae9e');ell(c,0.7,-0.6,0.8,0.5,'#857c6e');}},
  cliff:{w:14,h:9,col:1,draw:(c,r)=>{poly(c,[[-7,0],[-6,-6],[-3,-8.5],[1,-7.6],[4,-8.8],[7,-6],[7,0]],vgrad(c,-9,0,[[0,'#b5a98e'],[1,'#7e735f']]));for(let i=0;i<14;i++)ell(c,(r()-0.5)*12,-r()*7,0.9,0.35,'rgba(90,80,64,.35)');foliage(c,r,-4,-7.6,1.5,0.6,'#6f7d4e',8);}},
  hay:{w:4,h:3,col:0.4,draw:(c,r)=>{c.beginPath();c.moveTo(-1.8,0);c.quadraticCurveTo(-1.9,-2.4,0,-2.9);c.quadraticCurveTo(1.9,-2.4,1.8,0);c.fillStyle=vgrad(c,-3,0,[[0,'#e2c46a'],[1,'#a98a3c']]);c.fill();}},
  vine:{w:12,h:1.4,col:0,draw:(c,r)=>{for(let i=0;i<6;i++){const x=-5.5+i*2.2;foliage(c,r,x,-0.8,0.9,0.55,'#5e8a3a',6);c.fillStyle='#6b5236';c.fillRect(x-0.04,-1.3,0.08,1.3);}}},
  farm_fr:{w:11,h:7,col:0.6,draw:(c,r)=>{rrect(c,-5,-4.2,10,4.2,0.1,vgrad(c,-4.2,0,[[0,'#d8c7a4'],[1,'#b09a74']]));poly(c,[[-5.4,-4.1],[0,-7],[5.4,-4.1]],vgrad(c,-7,-4,[[0,'#c0643c'],[1,'#8e4228']]));[-3,0,3].forEach(x=>{rrect(c,x-0.5,-3.1,1.0,1.2,0.05,'#3b3530');c.fillStyle='#4f6b52';c.fillRect(x-0.95,-3.1,0.4,1.2);c.fillRect(x+0.55,-3.1,0.4,1.2);});rrect(c,-0.6,-1.8,1.2,1.8,0.05,'#5a3f2a');}},
  house_fr:{w:8,h:10,col:0.6,draw:(c,r,v)=>{const wc=['#e6dcc4','#d9c9a8','#cbbd9f'][v%3];rrect(c,-3.8,-7.5,7.6,7.5,0.08,vgrad(c,-7.5,0,[[0,wc],[1,shade(wc,-0.15)]]));poly(c,[[-4.1,-7.4],[-2.8,-9.7],[2.8,-9.7],[4.1,-7.4]],'#5c6570');for(let rr=0;rr<2;rr++)for(let k=0;k<3;k++){const x=-2.4+k*2.4,y=-6.4+rr*3.1;rrect(c,x-0.45,y,0.9,1.4,0.04,'#39414a');c.fillStyle='#5b7d8a';c.fillRect(x-0.9,y,0.4,1.4);c.fillRect(x+0.5,y,0.4,1.4);}rrect(c,-0.5,-2,1,2,0.05,'#6a4a30');}},
  church:{w:10,h:22,col:0.6,draw:(c,r)=>{rrect(c,-4.5,-7,9,7,0.1,'#cfc5ae');poly(c,[[-4.8,-6.9],[0,-10],[4.8,-6.9]],'#6a6f78');rrect(c,-1.6,-15,3.2,9,0.05,'#d8cfb8');poly(c,[[-1.9,-14.9],[0,-21.5],[1.9,-14.9]],'#555c66');c.fillStyle='#39414a';c.beginPath();c.arc(0,-12.2,0.55,0,7);c.fill();c.fillStyle='#e8d9a0';c.fillRect(-0.06,-21.9,0.12,0.8);c.fillRect(-0.3,-21.6,0.6,0.1);rrect(c,-0.7,-3,1.4,3,0.6,'#5a3f2a');}},
  cafe:{w:9,h:8,col:0.6,draw:(c,r)=>{rrect(c,-4.2,-6.8,8.4,6.8,0.1,'#e3d6b8');poly(c,[[-4.4,-6.7],[4.4,-6.7],[3.9,-7.9],[-3.9,-7.9]],'#6a6f78');for(let k=0;k<6;k++){c.fillStyle=k%2?'#b8322a':'#f1ece0';poly(c,[[-4.2+k*1.4,-3.6],[-2.8+k*1.4,-3.6],[-2.6+k*1.4,-2.6],[-4.4+k*1.4,-2.6]],c.fillStyle);}c.fillStyle='#2b2a28';c.font='bold 0.7px serif';c.textAlign='center';c.fillText('CAFÉ',0,-4.6);[-2.5,0.2,2.8].forEach(x=>{ell(c,x,-0.9,0.5,0.1,'#e8e2d0');c.fillStyle='#3a3a3a';c.fillRect(x-0.04,-0.9,0.08,0.9);});}},
  house_it:{w:8,h:8,col:0.6,draw:(c,r,v)=>{const wc=['#e0b47a','#d69a6a','#e8cf9c'][v%3];rrect(c,-3.8,-6.5,7.6,6.5,0.05,vgrad(c,-6.5,0,[[0,wc],[1,shade(wc,-0.18)]]));poly(c,[[-4.1,-6.4],[0,-7.6],[4.1,-6.4]],'#b0553a');for(let k=0;k<3;k++){const x=-2.4+k*2.4;rrect(c,x-0.4,-5.3,0.8,1.2,0.3,'#46403a');c.fillStyle='#3f6f4a';c.fillRect(x-0.8,-5.3,0.35,1.2);c.fillRect(x+0.45,-5.3,0.35,1.2);}rrect(c,-0.55,-2.1,1.1,2.1,0.5,'#5a3a24');}},
  fachwerk:{w:8,h:11,col:0.6,draw:(c,r)=>{rrect(c,-3.6,-7,7.2,7,0.05,'#f2ece0');c.strokeStyle='#4a3020';c.lineWidth=0.22;c.strokeRect(-3.6,-7,7.2,7);[-1.2,1.2].forEach(x=>{c.beginPath();c.moveTo(x,-7);c.lineTo(x,0);c.stroke();});c.beginPath();c.moveTo(-3.6,-3.5);c.lineTo(3.6,-3.5);c.moveTo(-3.6,-7);c.lineTo(-1.2,-3.5);c.moveTo(1.2,-3.5);c.lineTo(3.6,0);c.stroke();poly(c,[[-4,-6.9],[0,-10.8],[4,-6.9]],'#9a3a2a');[-2.4,2.4].forEach(x=>rrect(c,x-0.4,-6,0.8,1.1,0.03,'#3b4148'));}},
  cottage:{w:8,h:7,col:0.6,draw:(c,r)=>{rrect(c,-3.8,-4.5,7.6,4.5,0.1,'#b9b2a4');for(let i=0;i<20;i++){c.fillStyle=shade('#b9b2a4',(r()-0.5)*0.3);c.fillRect(-3.7+r()*7,-4.4+r()*4.2,0.6,0.3);}poly(c,[[-4.1,-4.4],[-2.5,-6.6],[2.5,-6.6],[4.1,-4.4]],'#4f5660');c.fillStyle='#8a4a3a';c.fillRect(2.2,-7.4,0.7,1.6);[-2,2].forEach(x=>rrect(c,x-0.5,-3.3,1,1,0.03,'#39414a'));rrect(c,-0.5,-2,1,2,0.05,'#2f4f3a');}},
  pub:{w:8,h:8,col:0.6,draw:(c,r)=>{SCENERY.cottage.draw(c,r);c.fillStyle='#5a3f2a';c.fillRect(3.9,-5.6,0.12,2.4);rrect(c,4.1,-5.3,1.3,1,0.05,'#2b3f2e');c.fillStyle='#e8d9a0';c.font='bold 0.35px serif';c.textAlign='center';c.fillText('PUB',4.75,-4.7);}},
  farm_us:{w:10,h:8,col:0.6,draw:(c,r)=>{rrect(c,-4.5,-5,9,5,0.05,'#efece4');c.strokeStyle='rgba(0,0,0,.08)';c.lineWidth=0.05;for(let y=-4.8;y<0;y+=0.35){c.beginPath();c.moveTo(-4.5,y);c.lineTo(4.5,y);c.stroke();}poly(c,[[-4.8,-4.9],[0,-7.6],[4.8,-4.9]],'#5a5f66');rrect(c,-4.5,-2.1,9,0.25,0.02,'#d8d2c4');[-3,-1,1,3].forEach(x=>{c.fillStyle='#d8d2c4';c.fillRect(x-0.08,-2.1,0.16,2.1);});[-2.5,2.5].forEach(x=>rrect(c,x-0.45,-4.2,0.9,1.2,0.03,'#39414a'));}},
  barn:{w:11,h:8,col:0.6,draw:(c,r)=>{poly(c,[[-5,0],[-5,-4.5],[-3.6,-6.8],[0,-7.8],[3.6,-6.8],[5,-4.5],[5,0]],vgrad(c,-8,0,[[0,'#a8342a'],[1,'#7a2218']]));c.strokeStyle='#efe6d8';c.lineWidth=0.18;c.strokeRect(-1.6,-4,3.2,4);c.beginPath();c.moveTo(-1.6,-4);c.lineTo(1.6,0);c.moveTo(1.6,-4);c.lineTo(-1.6,0);c.stroke();}},
  billboard:{w:8,h:5.5,col:0.2,draw:(c,r,v)=>{c.fillStyle='#5b4632';c.fillRect(-3,-2.2,0.2,2.2);c.fillRect(2.8,-2.2,0.2,2.2);const ads=[['ШИНЫ','#1f3f7a','#f1e6c8'],['БЕНЗИН','#b8322a','#f7ecd0'],['СВЕЧИ','#2b5a3a','#f1e6c8'],['МАСЛО','#3a2a1c','#e8c56a']][v%4];rrect(c,-3.8,-5.4,7.6,3.3,0.08,ads[1]);c.fillStyle=ads[2];c.font='bold 1.3px Impact,sans-serif';c.textAlign='center';c.fillText(ads[0],0,-3.3);}},
  stand:{w:16,h:7,col:0.8,draw:(c,r)=>{poly(c,[[-8,0],[-8,-3.5],[8,-6],[8,0]],'#7a6a55');c.fillStyle='#a8342a';c.fillRect(-8.4,-6.8,16.8,0.6);for(let rr=0;rr<5;rr++)for(let k=0;k<22;k++){const x=-7.6+k*0.72,y=-0.9-rr*1.05-(x+8)*0.155;ell(c,x,y,0.22,0.24,['#2b2f3a','#e8e2d0','#7a3a2a','#3a4f6a','#d6ae8a'][Math.floor(r()*5)]);ell(c,x,y-0.34,0.14,0.15,'#d6ae8a');}}},
  pits:{w:14,h:5,col:0.8,draw:(c,r)=>{rrect(c,-7,-3.6,14,3.6,0.05,'#d8cdb4');c.fillStyle='#b8322a';c.fillRect(-7.3,-4.2,14.6,0.7);for(let k=0;k<6;k++){rrect(c,-6.4+k*2.2,-2.8,1.8,2.8,0.05,'#3a3530');}c.fillStyle='#1c1406';c.font='bold 0.7px sans-serif';c.textAlign='center';c.fillText('БОКСЫ',0,-3.7);}},
  sign:{w:2,h:3,col:0.2,draw:(c,r,v)=>{c.fillStyle='#4a3a28';c.fillRect(-0.06,-3,0.12,3);rrect(c,-0.9,-3,1.8,1.1,0.05,'#f0c330');c.strokeStyle='#111';c.lineWidth=0.14;for(let k=0;k<3;k++){const x=-0.5+k*0.5,d=v?1:-1;c.beginPath();c.moveTo(x-0.12*d,-2.8);c.lineTo(x+0.12*d,-2.45);c.lineTo(x-0.12*d,-2.1);c.stroke();}}},
  banner:{w:14,h:7.5,col:0,draw:(c,r)=>{c.fillStyle='#4a3a28';c.fillRect(-6.8,-7.4,0.3,7.4);c.fillRect(6.5,-7.4,0.3,7.4);rrect(c,-6.6,-7.4,13.2,1.5,0.05,'#f1ece0');for(let k=0;k<22;k++){c.fillStyle=k%2?'#111':'#f1ece0';c.fillRect(-6.6+k*0.6,-5.9,0.6,0.3);}c.fillStyle='#1c1406';c.font='bold 1.1px Impact,sans-serif';c.textAlign='center';c.fillText('ФИНИШ',0,-6.2);}},
  lamp:{w:1.2,h:5,col:0.15,draw:(c,r)=>{c.fillStyle='#2a2c30';c.fillRect(-0.07,-4.4,0.14,4.4);poly(c,[[-0.35,-4.4],[0.35,-4.4],[0.2,-5],[-0.2,-5]],'#2a2c30');ell(c,0,-4.6,0.18,0.18,'#f2d98a');}},
  cart:{w:5,h:3,col:0.4,draw:(c,r)=>{rrect(c,-1.6,-1.8,3.2,0.9,0.05,'#8a6a44');[-0.9,1.0].forEach(x=>{ell(c,x,-0.55,0.55,0.55,'#3b2a1c');ell(c,x,-0.55,0.4,0.4,'#8a6a44');});ell(c,-2.4,-1.3,0.7,0.45,'#6a4a30');ell(c,-2.9,-1.7,0.25,0.35,'#6a4a30');c.fillStyle='#6a4a30';[-2.7,-2.1].forEach(x=>c.fillRect(x,-1.0,0.12,1.0));}},
  sea:{w:40,h:1.2,col:0,draw:(c,r)=>{rrect(c,-20,-1.1,40,1.1,0.2,'#3f7fa8');for(let i=0;i<30;i++){c.fillStyle='rgba(255,255,255,.6)';c.fillRect(-19+r()*38,-1+r()*0.8,0.8+r(),0.06);}}},
  dune:{w:10,h:2.4,col:0,draw:(c,r)=>{c.beginPath();c.ellipse(0,0,5,2.3,0,Math.PI,0);c.fillStyle=vgrad(c,-2.3,0,[[0,'#e6cf98'],[1,'#c8a86a']]);c.fill();}},
  izba:{w:8,h:7,col:0.6,draw:(c,r)=>{rrect(c,-3.6,-4.4,7.2,4.4,0.05,'#8a6a44');c.strokeStyle='#6a4a30';c.lineWidth=0.08;for(let y=-4.2;y<0;y+=0.45){c.beginPath();c.moveTo(-3.6,y);c.lineTo(3.6,y);c.stroke();}poly(c,[[-4,-4.3],[0,-6.8],[4,-4.3]],'#5a5f66');[-1.8,1.8].forEach(x=>{rrect(c,x-0.5,-3.4,1,1.1,0.03,'#39414a');c.strokeStyle='#e8e2d0';c.lineWidth=0.1;c.strokeRect(x-0.6,-3.5,1.2,1.3);});}},
  villa:{w:12,h:9,col:0.6,draw:(c,r)=>{rrect(c,-5.6,-7,11.2,7,0.05,'#f1e6d0');poly(c,[[-6,-6.9],[0,-8.6],[6,-6.9]],'#c0643c');for(let rr=0;rr<2;rr++)for(let k=0;k<4;k++){const x=-4+k*2.7,y=-6+rr*3;rrect(c,x-0.45,y,0.9,1.5,0.45,'#46505a');}c.fillStyle='#e8e2d0';c.fillRect(-5.6,-3.4,11.2,0.2);}}
};
// Люди: зрители, жандармы, маршалы, фотографы — отдельные фигурки с двумя кадрами анимации
function peopleSprite(kind,variant,frame){
  const key='pp|'+kind+'|'+variant+'|'+frame;if(SPR.cache[key])return SPR.cache[key];
  const P=60,w=kind==='crowd'?6:1.4,h=2.4,cv=mkCanvas(w*P,h*P),c=cv.getContext('2d');c.translate(w*P/2,h*P);c.scale(P,P);const rnd=mulberry32(hashStr(key+'s'));
  const person=(x,type,wave,sk)=>{const coat=type==='gend'?'#1f2b4a':type==='marsh'?'#e8e2d0':['#2b2f3a','#4a3a2a','#6a2a2a','#2f4a3a','#5a5048','#e8e2d0'][Math.floor(rnd()*6)];
    const woman=type==='crowd'&&rnd()<0.3,hgt=sk*(woman?0.95:1);
    c.save();c.translate(x,0);c.scale(hgt,hgt);
    if(woman){poly(c,[[-0.3,0],[0.3,0],[0.14,-1.05],[-0.14,-1.05]],shade(coat,0.1));}else{c.fillStyle=shade(coat,-0.3);c.fillRect(-0.16,-0.8,0.12,0.8);c.fillRect(0.04,-0.8,0.12,0.8);}
    rrect(c,-0.2,-1.45,0.4,0.72,0.08,coat);ell(c,0,-1.6,0.12,0.14,'#d6ae8a');
    if(type==='gend'){c.fillStyle='#1f2b4a';c.fillRect(-0.12,-1.86,0.24,0.22);c.fillStyle='#b8322a';c.fillRect(-0.13,-1.68,0.26,0.05);poly(c,[[-0.3,-1.44],[0.3,-1.44],[0.34,-0.9],[-0.34,-0.9]],'#27355a');}
    else if(woman){ell(c,0,-1.74,0.26,0.07,['#e8d9a0','#b8322a','#f1ece0','#3a4f6a'][Math.floor(rnd()*4)]);ell(c,0,-1.8,0.12,0.08,'#6a4a30');}
    else{ell(c,0,-1.73,0.15,0.06,'#2a2420');c.fillStyle='#2a2420';c.fillRect(-0.09,-1.86,0.18,0.12);}
    c.strokeStyle=coat;c.lineWidth=0.1;c.lineCap='round';
    if(wave){const up=frame?-0.25:0;c.beginPath();c.moveTo(0.18,-1.35);c.lineTo(0.42,-1.75+up);c.stroke();if(type==='marsh'){poly(c,[[0.42,-1.75+up],[0.95,-1.95+up],[0.95,-1.55+up],[0.42,-1.4+up]],variant%2?'#f0c330':'#b8322a');}else ell(c,0.44,-1.8+up,0.1,0.06,'#2a2420');}
    else{c.beginPath();c.moveTo(0.18,-1.35);c.lineTo(0.25,-0.95);c.stroke();}
    c.restore();};
  if(kind==='crowd'){const n=7;for(let i=0;i<n;i++){const x=-2.6+i*0.86+(rnd()-0.5)*0.2;person(x,'crowd',rnd()<0.55,0.9+rnd()*0.15);}}
  else if(kind==='gend')person(0,'gend',false,1);
  else if(kind==='marsh')person(-0.25,'marsh',true,1);
  else if(kind==='photo'){person(0.25,'crowd',false,1);c.fillStyle='#3a2a1c';c.fillRect(-0.62,-1.4,0.5,0.34);c.strokeStyle='#3a2a1c';c.lineWidth=0.05;c.beginPath();c.moveTo(-0.37,-1.06);c.lineTo(-0.6,0);c.moveTo(-0.37,-1.06);c.lineTo(-0.14,0);c.moveTo(-0.37,-1.06);c.lineTo(-0.37,0);c.stroke();}
  const o={img:cv,wM:w,hM:h,ax:0.5,ay:1};SPR.cache[key]=o;return o;
}
