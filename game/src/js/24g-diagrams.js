/* ================= 0.25: живые чертежи кинохроники — как устроена новинка =================
   Игрок просил: «по каждой новой технологии покажи и расскажи о ней». Кадр {d:'planet', p:{…}, cap, say} — анимированная схема
   в духе учебных фильмов двадцатых: светлые линии на тёмной плёнке, подписи от руки. Холст 960×720 (кадр 4:3);
   верхние ~80 px занимает подпись кадра. Каждая схема — DIAG[id](g,t,p): t — секунды с начала кадра, p — параметры. */
const DIAG={};
const DGC={bg:'#15120d',grid:'#272118',ink:'#ece2c8',dim:'#8d826b',brass:'#d4ae4a',red:'#c4553c',steel:'#9fb0b8',oil:'#c98d3a',dark:'#0c0a07',wood:'#b08a58',rub:'#2a241c'};
const DG={
  bg(g){g.fillStyle=DGC.bg;g.fillRect(0,0,960,720);g.strokeStyle=DGC.grid;g.lineWidth=1;g.beginPath();for(let x=0;x<=960;x+=48){g.moveTo(x+.5,0);g.lineTo(x+.5,720);}for(let y=0;y<=720;y+=48){g.moveTo(0,y+.5);g.lineTo(960,y+.5);}g.stroke();},
  st(g,col,lw){g.strokeStyle=col||DGC.ink;g.lineWidth=lw||3;g.lineJoin='round';g.lineCap='round';},
  ln(g,P,col,lw,close){DG.st(g,col,lw);g.beginPath();P.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));if(close)g.closePath();g.stroke();},
  dash(g,P,col,lw,d,off){g.save();g.setLineDash(d||[14,10]);g.lineDashOffset=off||0;DG.ln(g,P,col,lw);g.restore();},
  poly(g,P,fill,col,lw){g.beginPath();P.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();if(fill){g.fillStyle=fill;g.fill();}if(col!==null){DG.st(g,col,lw);g.stroke();}},
  rect(g,x,y,w,h,fill,col,lw){if(fill){g.fillStyle=fill;g.fillRect(x,y,w,h);}if(col!==null){DG.st(g,col,lw);g.strokeRect(x,y,w,h);}},
  rrect(g,x,y,w,h,r,fill,col,lw){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();if(fill){g.fillStyle=fill;g.fill();}if(col!==null){DG.st(g,col,lw);g.stroke();}},
  circ(g,x,y,r,col,lw,fill){g.beginPath();g.arc(x,y,Math.max(0.5,r),0,Math.PI*2);if(fill){g.fillStyle=fill;g.fill();}if(col!==null){DG.st(g,col,lw);g.stroke();}},
  arc(g,x,y,r,a0,a1,col,lw){DG.st(g,col,lw);g.beginPath();g.arc(x,y,r,a0,a1);g.stroke();},
  // шестерня: n зубьев, поворот rot
  gear(g,x,y,r,n,rot,col,fill,lw){const td=Math.max(5,r*0.14);g.beginPath();for(let i=0;i<n;i++){const a=rot+i*2*Math.PI/n,da=Math.PI/n;
      const P=[[r-td*0.2,a-da*0.55],[r+td*0.8,a-da*0.3],[r+td*0.8,a+da*0.3],[r-td*0.2,a+da*0.55]];P.forEach(([rr,aa],k)=>{const px=x+rr*Math.cos(aa),py=y+rr*Math.sin(aa);(i===0&&k===0)?g.moveTo(px,py):g.lineTo(px,py);});}
    g.closePath();if(fill){g.fillStyle=fill;g.fill();}DG.st(g,col||DGC.ink,lw||2.5);g.stroke();DG.circ(g,x,y,r*0.22,col||DGC.ink,2);
    DG.ln(g,[[x+r*0.22*Math.cos(rot),y+r*0.22*Math.sin(rot)],[x+(r-td)*Math.cos(rot),y+(r-td)*Math.sin(rot)]],col||DGC.ink,2);},
  // шестерня сбоку (как в разрезе коробки): прямоугольник с зубцами
  gearSide(g,x,y,h,w,col,fill){DG.rect(g,x-w/2,y-h/2,w,h,fill||'#3a3122',col||DGC.ink,2);for(let k=-h/2+6;k<h/2-4;k+=10)DG.ln(g,[[x-w/2,y+k],[x+w/2,y+k]],DGC.dim,1);},
  font(g,size,it,b){g.font=`${it?'italic ':''}${b?'700 ':''}${size}px Georgia,'Times New Roman',serif`;},
  // подпись: не вылезает за кадр (уменьшается, а длинная — в две строки); lead — куда тянуть выноску
  lab(g,txt,x,y,o){o=o||{};let size=o.size||26;const al=o.al||'left';DG.font(g,size,o.it!==false,o.b);
    const room=Math.min(o.w||1e9,al==='left'?952-x:al==='right'?x-8:Math.min(x,960-x)*2-16);let L=[txt];
    if(g.measureText(txt).width>room){const w=txt.split(' ');if(w.length>1){let best=null;for(let i=1;i<w.length;i++){const a=w.slice(0,i).join(' '),b=w.slice(i).join(' '),m=Math.max(g.measureText(a).width,g.measureText(b).width);if(!best||m<best[0])best=[m,[a,b]];}L=best[1];}
      while(size>15&&Math.max(...L.map(s=>g.measureText(s).width))>room){size-=1;DG.font(g,size,o.it!==false,o.b);}}
    g.textAlign=al;g.textBaseline='middle';const lh=size*1.15,y0=y-(L.length-1)*lh/2;
    if(o.lead){const lx=x+(al==='right'?6:al==='center'?0:-6);DG.ln(g,[[lx,y],o.lead],o.lc||DGC.dim,1.5);DG.circ(g,o.lead[0],o.lead[1],3,null,0,o.lc||DGC.dim);}
    g.fillStyle=o.col||DGC.ink;L.forEach((s,i)=>g.fillText(s,x,y0+i*lh));},
  big(g,txt,x,y,o){o=o||{};DG.lab(g,txt,x,y,{size:o.size||40,b:o.b,it:false,al:o.al||'center',col:o.col});},
  arrow(g,x1,y1,x2,y2,col,lw){DG.ln(g,[[x1,y1],[x2,y2]],col||DGC.red,lw||4);const a=Math.atan2(y2-y1,x2-x1),h=(lw||4)*3.4;
    DG.poly(g,[[x2,y2],[x2-h*Math.cos(a-0.45),y2-h*Math.sin(a-0.45)],[x2-h*Math.cos(a+0.45),y2-h*Math.sin(a+0.45)]],col||DGC.red,null);},
  spring(g,x1,y1,x2,y2,n,amp,col,lw){const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,P=[[x1,y1]];
    for(let i=1;i<n*2;i++){const f=i/(n*2),s=(i%2?1:-1)*amp;P.push([x1+dx*f-uy*s,y1+dy*f+ux*s]);}P.push([x2,y2]);DG.ln(g,P,col||DGC.steel,lw||3);},
  // листовая рессора (полуэллиптическая): дуга из листов
  leaf(g,x1,x2,y,sag,n,col){for(let k=0;k<(n||4);k++){const w=(x2-x1)*(1-k*0.18),c=(x1+x2)/2,P=[];for(let i=0;i<=16;i++){const f=i/16,x=c-w/2+w*f;P.push([x,y+k*5-sag*(1-Math.pow(2*f-1,2))]);}DG.ln(g,P,col||DGC.steel,3);}},
  // колесо сбоку: обод ('wood' спицы, 'wire', 'disc'), шина ('solid','pneu','balloon'); rot — поворот; flat — приплюснутость снизу
  wheel(g,x,y,r,rot,o){o=o||{};const tyre=o.tyre||'pneu',rim=o.rim||'wood',tw=tyre==='solid'?r*0.1:tyre==='balloon'?r*0.24:r*0.16;
    DG.circ(g,x,y,r,DGC.ink,3,tyre==='solid'?'#3a3025':DGC.rub);
    if(o.tread&&tyre!=='solid'){for(let i=0;i<36;i++){const a=rot+i*Math.PI/18;DG.ln(g,[[x+(r-2)*Math.cos(a),y+(r-2)*Math.sin(a)],[x+(r-tw*0.45)*Math.cos(a+0.05),y+(r-tw*0.45)*Math.sin(a+0.05)]],DGC.dim,2.5);}}
    const ri=r-tw;DG.circ(g,x,y,ri,DGC.ink,2,DGC.bg);
    if(rim==='disc'){DG.circ(g,x,y,ri*0.95,DGC.ink,2,'#3b3328');for(let i=0;i<5;i++){const a=rot+i*2*Math.PI/5;DG.circ(g,x+ri*0.5*Math.cos(a),y+ri*0.5*Math.sin(a),ri*0.11,DGC.dim,2,DGC.bg);}DG.circ(g,x,y,ri*0.22,DGC.ink,2,'#5a4e3c');}
    else if(rim==='wire'){for(let i=0;i<40;i++){const a=rot+i*Math.PI/20,b=a+(i%2?0.5:-0.5);DG.ln(g,[[x+ri*0.17*Math.cos(b),y+ri*0.17*Math.sin(b)],[x+ri*0.95*Math.cos(a),y+ri*0.95*Math.sin(a)]],DGC.steel,1.3);}DG.circ(g,x,y,ri*0.17,DGC.ink,2,'#5a4e3c');
      if(o.knock){for(let k=0;k<3;k++){const a=rot+k*2*Math.PI/3+0.5;DG.ln(g,[[x,y],[x+ri*0.36*Math.cos(a),y+ri*0.36*Math.sin(a)]],DGC.brass,7);}DG.circ(g,x,y,ri*0.1,null,0,DGC.brass);}}
    else{for(let i=0;i<12;i++){const a=rot+i*Math.PI/6;DG.ln(g,[[x+ri*0.2*Math.cos(a),y+ri*0.2*Math.sin(a)],[x+ri*0.97*Math.cos(a),y+ri*0.97*Math.sin(a)]],DGC.wood,Math.max(3,r*0.07));}DG.circ(g,x,y,ri*0.22,DGC.ink,2,'#5a4e3c');}},
  // машина сбоку (ранний автомобиль): x — середина, y — земля, s — масштаб; rot — колёса
  carSide(g,x,y,s,rot,o){o=o||{};const r=34*s,wb=150*s,yb=y-r;
    DG.poly(g,[[x-wb/2-50*s,yb-18*s],[x+wb/2+40*s,yb-18*s],[x+wb/2+52*s,yb-48*s],[x+wb/2-10*s,yb-58*s],[x-wb/2+30*s,yb-60*s],[x-wb/2-30*s,yb-96*s],[x-wb/2-56*s,yb-96*s],[x-wb/2-60*s,yb-40*s]],o.fill||'#3c3328',DGC.ink,2.5);
    DG.ln(g,[[x+wb/2-10*s,yb-58*s],[x+wb/2-24*s,yb-104*s]],DGC.ink,2);
    DG.wheel(g,x-wb/2,y-r,r,rot,{tyre:o.tyre||'pneu',rim:o.rim||'wood'});DG.wheel(g,x+wb/2,y-r,r,rot,{tyre:o.tyre||'pneu',rim:o.rim||'wood'});},
  // секундомер: f — доля круга
  clock(g,x,y,r,f,lab){DG.circ(g,x,y,r,DGC.ink,3,'#211c15');for(let i=0;i<12;i++){const a=i*Math.PI/6;DG.ln(g,[[x+r*0.82*Math.cos(a),y+r*0.82*Math.sin(a)],[x+r*0.95*Math.cos(a),y+r*0.95*Math.sin(a)]],DGC.dim,2);}
    const a=-Math.PI/2+f*2*Math.PI;g.beginPath();g.moveTo(x,y);g.arc(x,y,r*0.78,-Math.PI/2,a);g.closePath();g.fillStyle='rgba(212,174,74,.25)';g.fill();DG.ln(g,[[x,y],[x+r*0.8*Math.cos(a),y+r*0.8*Math.sin(a)]],DGC.red,4);if(lab)DG.big(g,lab,x,y+r+30,{size:26,col:DGC.brass});},
  ground(g,y,off,col){DG.ln(g,[[0,y],[960,y]],col||DGC.dim,2);for(let x=-48+((off||0)%48+48)%48;x<960;x+=48)DG.ln(g,[[x,y+6],[x-14,y+20]],DGC.grid,2);},
  ease:t=>t<0?0:t>1?1:t*t*(3-2*t),
  ping:(t,p)=>{const x=(t%p)/p;return x<0.5?x*2:2-x*2;},
  cyc:(t,p)=>(t%p)/p,
  // плавное появление: 0 до a, 1 после b
  inn:(t,a,b)=>DG.ease((t-a)/Math.max(0.01,b-a))};
function diagHTML(sh){return `<canvas class="rl-diag" width="960" height="720" data-d="${esc(sh.d)}" data-p="${esc(JSON.stringify(sh.p||{}))}"></canvas>`;}
// рисуем схемы текущего кадра (вызывается из цикла плёнки)
function diagTick(Q,now){const c=Q.el.querySelector('.rl-shot.on canvas.rl-diag')||Q.el.querySelector('canvas.rl-diag');if(!c)return;const f=DIAG[c.dataset.d];if(!f)return;
  if(!c._t0)c._t0=now;if(Q.paused){c._pause=c._pause||now;if(c._drawn)return;}else if(c._pause){c._t0+=now-c._pause;c._pause=0;}
  if(c._last&&now-c._last<30)return;c._last=now;
  let p={};try{p=JSON.parse(c.dataset.p||'{}');}catch(_){}const g=c.getContext('2d');if(!g)return;g.save();try{DG.bg(g);f(g,((c._pause||now)-c._t0)/1000,p);c._drawn=1;}catch(e){console.warn('diag',c.dataset.d,e);}g.restore();}
// кадр-образец для проверки и миниатюр: схема в момент t
function diagStill(id,p,t){const c=document.createElement('canvas');c.width=960;c.height=720;const g=c.getContext('2d');if(!g||!DIAG[id])return null;DG.bg(g);g.save();DIAG[id](g,t===undefined?2:t,p||{});g.restore();return c;}
