/* ================= 0.25: чертежи кинохроники — мотор, коробка передач, тормоза ================= */
// порядок вспышек: смещение фазы цикла (0…4π) для каждого цилиндра — рабочие ходы идут равномерно
function engOffsets(n){const FO={1:[1],2:[1,2],4:[1,3,4,2],6:[1,5,3,6,2,4],8:[1,6,2,5,8,3,7,4]}[n]||[...Array(n)].map((_,i)=>i+1),step=4*Math.PI/n,off=[];
  FO.forEach((c,k)=>{off[c-1]=((4*Math.PI-k*step)%(4*Math.PI)+4*Math.PI)%(4*Math.PI);});return off;}
// такт цикла: 0 впуск, 1 сжатие, 2 рабочий ход, 3 выпуск
function strokeOf(ph){return Math.floor((((ph%(4*Math.PI))+4*Math.PI)%(4*Math.PI))/Math.PI);}
const STROKE_COL=['rgba(212,174,74,.16)','rgba(212,174,74,.38)','rgba(196,85,60,.62)','rgba(141,130,107,.3)'];
DIAG.eng=(g,t,p)=>{const n=p.cyl||4;if(p.lay==='v')return DIAG.engV(g,t,p);
  const valve=p.valve||'side',W=Math.min(200,780/n),cx=480,y0=190,H=210,crY=510,cr=34,L=200,rot=t*(p.slow?1.4:2.4),off=engOffsets(n);
  DG.big(g,p.title||`${n} ${n===1?'цилиндр':n<5?'цилиндра':'цилиндров'}${n>2?' в ряд':''}`,cx,100,{size:32,col:DGC.brass});
  const x0=cx-(n-1)*W/2,cw=Math.min(W*0.62,120);
  // верхний распредвал: вал над головкой, привод от коленвала вертикальным валиком с коническими шестернями
  if(valve==='ohc'){const cy=y0-52,xa=x0-W/2+14,xb=x0+(n-1)*W+W/2-14;DG.ln(g,[[xa,cy],[xb,cy]],DGC.steel,4);DG.ln(g,[[xb,cy],[xb,crY]],DGC.dim,3);DG.circ(g,xb,cy,8,DGC.steel,2,'#3b342b');DG.circ(g,xb,crY,8,DGC.steel,2,'#3b342b');}
  if(p.mono){DG.rrect(g,x0-W/2+8,y0-6,W*n-16,H+16,10,'rgba(236,226,200,.05)',DGC.ink,3);const lift=Math.max(0,Math.sin(t*1.1))*14;DG.rect(g,x0-W/2+4,y0-34-lift,W*n-8,26,'#4a4035',DGC.brass,3);}
  DG.ln(g,[[x0-W/2,crY],[x0+(n-1)*W+W/2,crY]],DGC.steel,9);
  for(let i=0;i<n;i++){const x=x0+i*W,ph=rot+off[i],a=ph%(2*Math.PI),px=x+cr*Math.sin(a),py=crY-cr*Math.cos(a),pinY=py-Math.sqrt(L*L-Math.pow(cr*Math.sin(a),2)),pTop=pinY-36,sk=strokeOf(ph);
    // гильзы Найта: две тонкие гильзы ходят вверх-вниз вдвое медленнее вала; окна совпадают на впуске и выпуске
    if(valve==='sleeve'){const s1=Math.sin(ph/2)*16,s2=Math.sin(ph/2+1.2)*16;DG.rect(g,x-cw/2-14,y0+20+s1,7,H-20,'#5d5143',DGC.dim,1);DG.rect(g,x-cw/2-6,y0+26+s2,6,H-26,'#6b5d4c',DGC.dim,1);
      DG.rect(g,x+cw/2,y0+20-s1,7,H-20,'#5d5143',DGC.dim,1);DG.rect(g,x+cw/2+7,y0+26-s2,6,H-26,'#6b5d4c',DGC.dim,1);if(sk===0||sk===3){DG.rect(g,sk===0?x-cw/2-22:x+cw/2,y0+30,22,18,sk===0?'rgba(212,174,74,.6)':'rgba(141,130,107,.6)',null);}}
    if(!p.mono)DG.rect(g,x-cw/2-4,y0-8,cw+8,10,'#4a4035',DGC.ink,2);
    DG.ln(g,[[x-cw/2,y0],[x-cw/2,y0+H]],DGC.ink,3);DG.ln(g,[[x+cw/2,y0],[x+cw/2,y0+H]],DGC.ink,3);
    g.fillStyle=STROKE_COL[sk];g.fillRect(x-cw/2+3,y0+3,cw-6,Math.max(0,pTop-y0-3));
    if(sk===2&&a<0.9)DG.circ(g,x,y0+14,9+5*Math.sin(t*40),null,0,'#ffd27a');
    DG.rrect(g,x-cw/2+4,pTop,cw-8,46,4,'#5b4f3d',DGC.ink,2);DG.ln(g,[[x,pinY],[px,py]],DGC.steel,6);DG.circ(g,x,crY,cr+12,DGC.dim,2,'rgba(159,176,184,.08)');DG.circ(g,px,py,7,DGC.steel,2,DGC.steel);
    const op=k=>(sk===k?Math.sin((ph%Math.PI))*14:0);
    if(valve==='ohv'){[-1,1].forEach(sd=>{const vx=x+sd*cw*0.22,o=op(sd<0?0:3);DG.ln(g,[[vx,y0+4+o],[vx,y0-40]],DGC.brass,4);DG.ln(g,[[vx-9,y0+4+o],[vx+9,y0+4+o]],DGC.brass,4);
        DG.ln(g,[[vx-4,y0-44],[vx+sd*30,y0-52+o*0.6]],DGC.ink,4);DG.ln(g,[[vx+sd*30,y0-52+o*0.6],[vx+sd*40,crY-80]],DGC.dim,2);});}
    else if(valve==='ohc'){const cy=y0-52;[-1,1].forEach(sd=>{const vx=x+sd*cw*0.22,k=sd<0?0:3,o=op(k),th=ph/2+(k?-0.75:0.75)*Math.PI;
        DG.ln(g,[[vx,y0+4+o],[vx,y0-42+o]],DGC.brass,4);DG.ln(g,[[vx-9,y0+4+o],[vx+9,y0+4+o]],DGC.brass,4);
        DG.circ(g,vx,cy,10,DGC.steel,2,'#3b342b');DG.ln(g,[[vx,cy],[vx+Math.sin(th)*24,cy-Math.cos(th)*24]],DGC.steel,7);});}
    else if(valve==='side'){const bx=x+cw/2+4,o=(sk===0||sk===3)?Math.sin(ph%Math.PI)*14:0;DG.rect(g,bx,y0,Math.min(36,W-cw-10),40,'rgba(212,174,74,.08)',DGC.ink,2);const sx=bx+Math.min(18,(W-cw-10)/2);DG.ln(g,[[sx,y0+6+o],[sx,y0+90]],DGC.brass,4);DG.ln(g,[[sx-8,y0+6+o],[sx+8,y0+6+o]],DGC.brass,4);}
    else if(valve==='t'){[[1,0],[-1,3]].forEach(([sd,k])=>{const pw=Math.min(36,(W-cw)/2-6),bx=sd>0?x+cw/2+3:x-cw/2-3-pw,o=op(k),sx=bx+pw/2;DG.rect(g,bx,y0,pw,40,'rgba(212,174,74,.08)',DGC.ink,2);DG.ln(g,[[sx,y0+6+o],[sx,y0+90]],DGC.brass,4);DG.ln(g,[[sx-7,y0+6+o],[sx+7,y0+6+o]],DGC.brass,4);});}
    else if(valve==='atm'){const o=op(0),o2=op(3);DG.ln(g,[[x-cw*0.2,y0+4+o],[x-cw*0.2,y0-36]],DGC.brass,4);DG.spring(g,x-cw*0.2-12,y0-40,x-cw*0.2-12,y0-8,4,5,DGC.dim,1.5);DG.ln(g,[[x+cw*0.2,y0+4+o2],[x+cw*0.2,y0-36]],DGC.brass,4);}}
  const notes={ohc:'распредвал над головкой: клапаны без штанг, мотор охотно крутится',ohv:'клапаны в головке: камера сгорания компактная',side:'клапаны сбоку: просто и надёжно',t:'впуск и выпуск по разные стороны',atm:'впускной клапан открывает разрежение',sleeve:'гильзы с окнами вместо клапанов: тихо'};
  DG.lab(g,notes[valve]||'',480,672,{al:'center',size:24,col:DGC.ink});
  if(p.mono)DG.lab(g,'один чугунный блок и съёмная головка — ремонт без разборки мотора',480,630,{al:'center',size:21,col:DGC.brass});
  const top=valve==='ohv'||valve==='ohc';
  if(p.hp)DG.big(g,`${p.hp} л. с.`,top?930:40,top?60:150,{size:36,b:1,col:DGC.brass,al:top?'right':'left'});
  engLegend(g,top);};
// условные цвета тактов: впуск, сжатие, рабочий ход, выпуск
function engLegend(g,low){['впуск','сжатие','рабочий ход','выпуск'].forEach((n,i)=>{const x=low?[190,330,470,660][i]:660+(i%2)*150,y=low?598:136+Math.floor(i/2)*28;DG.rect(g,x,y-9,18,18,STROKE_COL[i].replace(/[\d.]+\)$/,'.9)'),DGC.dim,1);DG.lab(g,n,x+26,y,{size:18,col:DGC.dim});});}
// V-образный мотор — вид спереди: две «четвёрки» под прямым углом на общем валу
DIAG.engV=(g,t,p)=>{const cx=480,cy=560,cr=40,L=230,rot=t*2.2,ang=[-Math.PI/4,Math.PI/4],cw=120,n=p.cyl||8;
  DG.big(g,p.title||`V${n}: ${n/2} пары цилиндров на одном валу`,cx,112,{size:32,col:DGC.brass});
  DG.circ(g,cx,cy,cr+16,DGC.dim,2,'rgba(159,176,184,.08)');const a0=rot%(2*Math.PI),px=cx+cr*Math.sin(a0),py=cy-cr*Math.cos(a0);
  ang.forEach((A,k)=>{const ph=rot*1+(k?1.5*Math.PI:0),rel=a0-A,d=cr*Math.cos(rel)+Math.sqrt(L*L-Math.pow(cr*Math.sin(rel),2)),sk=strokeOf(ph+(k?Math.PI:0));
    g.save();g.translate(cx,cy);g.rotate(A);const top=-L-cr-70,bot=-L+cr+30;
    DG.ln(g,[[-cw/2,top],[-cw/2,bot]],DGC.ink,3);DG.ln(g,[[cw/2,top],[cw/2,bot]],DGC.ink,3);DG.rect(g,-cw/2-6,top-12,cw+12,12,'#4a4035',DGC.ink,2);
    g.fillStyle=STROKE_COL[sk];g.fillRect(-cw/2+3,top,cw-6,Math.max(0,-d-36-top));
    DG.rrect(g,-cw/2+5,-d-36,cw-10,48,4,'#5b4f3d',DGC.ink,2);g.restore();
    const pinx=cx+d*Math.sin(A),piny=cy-d*Math.cos(A);DG.ln(g,[[pinx,piny],[px,py]],DGC.steel,6);});
  DG.circ(g,px,py,9,DGC.steel,2,DGC.steel);DG.circ(g,cx,cy,8,DGC.ink,2,DGC.dark);
  DG.lab(g,'левый ряд',150,250,{size:22});DG.lab(g,'правый ряд',810,250,{size:22,al:'right'});DG.lab(g,'общий коленчатый вал',cx+90,cy+60,{size:22,lead:[cx+20,cy+10]});
  DG.lab(g,'вспышки чаще — мотор тянет ровно и тихо',480,668,{al:'center',size:24});
  if(p.hp)DG.big(g,`${p.hp} л. с.`,40,150,{size:36,b:1,col:DGC.brass,al:'left'});};
// карбюратор Майбаха (1893): поплавок держит уровень бензина, жиклёр распыляет его в струю воздуха
DIAG.carb=(g,t,p)=>{const fl=Math.sin(t*1.6)*4;
  DG.big(g,'Распылительный карбюратор',480,112,{size:32,col:DGC.brass});
  // поплавковая камера
  DG.rect(g,170,260,190,260,null,DGC.ink,3);g.fillStyle='rgba(201,141,58,.35)';g.fillRect(173,380+fl,184,137-fl);DG.ln(g,[[173,380+fl],[357,380+fl]],DGC.oil,3);
  DG.rrect(g,205,348+fl,120,34,10,'#5b4f3d',DGC.ink,2);DG.ln(g,[[265,348+fl],[265,262]],DGC.steel,3);DG.poly(g,[[255,262],[275,262],[265,246+fl*0.5]],DGC.steel,null);
  DG.ln(g,[[265,180],[265,246]],DGC.oil,6);DG.lab(g,'бензин из бака',285,200,{size:20,col:DGC.dim});
  // трубка к жиклёру и смесительная камера
  DG.ln(g,[[357,500],[560,500],[560,430]],DGC.oil,6);DG.rect(g,500,240,120,300,null,DGC.ink,3);DG.poly(g,[[551,430],[569,430],[565,410],[555,410]],DGC.brass,DGC.ink,2);
  // воздух снизу вверх, капли бензина
  for(let k=0;k<5;k++){const y=(600-((t*160+k*70)%260));DG.arrow(g,520+k*0,y+40,520,y,DGC.steel,3);DG.arrow(g,600,y+40,600,y,DGC.steel,3);}
  for(let k=0;k<26;k++){const f=((t*1.4+k*0.17)%1),x=560+Math.sin(k*7.1+t*3)*f*44,y=408-f*170;DG.circ(g,x,y,2.6*(1-f*0.4),null,0,'rgba(212,174,74,'+(0.9-f*0.6)+')');}
  DG.arrow(g,560,230,560,170,DGC.brass,5);DG.lab(g,'смесь — в цилиндры',580,170,{size:22,col:DGC.brass});
  DG.lab(g,'поплавок держит уровень',60,600,{size:22,lead:[230,380]});DG.lab(g,'жиклёр',650,430,{size:22,lead:[566,418]});DG.lab(g,'воздух',650,560,{size:22,lead:[602,560]});
  DG.lab(g,'Бензин не испаряется с поверхности, а распыляется: мотор заводится и тянет на любых оборотах',480,668,{al:'center',size:21,col:DGC.ink});};

/* ---------- передача: цепь Панара, прямая передача Рено, планетарная коробка, ступени, синхронизатор ---------- */
// вид сверху: мотор впереди, сцепление, коробка, цепи на задние колёса (система Панара, 1891)
DIAG.chain=(g,t,p)=>{const off=t*90;DG.big(g,'Мотор впереди, привод — назад',480,112,{size:32,col:DGC.brass});
  DG.rrect(g,140,250,690,300,30,null,DGC.dim,2);
  DG.rect(g,170,330,150,140,'#4a4035',DGC.ink,3);DG.lab(g,'мотор',245,400,{al:'center',size:24});
  DG.circ(g,350,400,26,DGC.ink,2,'#3a3122');DG.lab(g,'сцепление',350,470,{al:'center',size:18,col:DGC.dim});
  DG.rect(g,400,345,150,110,'#3a3122',DGC.ink,3);[[430,380],[470,380],[510,380]].forEach(([x,y],i)=>DG.gearSide(g,x,y+(i===1?Math.sin(t*1.5)*6:0),46,22));DG.lab(g,'коробка: шестерни скользят',475,320,{al:'center',size:20});
  DG.ln(g,[[550,400],[650,400]],DGC.steel,8);DG.ln(g,[[650,300],[650,500]],DGC.steel,8);
  [300,500].forEach(y=>{DG.circ(g,650,y,18,DGC.ink,2,'#5a4e3c');DG.circ(g,780,y,34,DGC.ink,2,'#5a4e3c');DG.dash(g,[[650,y-18],[780,y-34]],DGC.brass,4,[10,8],-off);DG.dash(g,[[650,y+18],[780,y+34]],DGC.brass,4,[10,8],off);});
  [[170,240],[170,560],[780,240],[780,560]].forEach(([x,y])=>DG.rect(g,x-40,y-22,80,44,DGC.rub,DGC.ink,2));
  DG.lab(g,'цепи на задние колёса',790,630,{al:'right',size:22,lead:[720,520]});
  DG.lab(g,'Раньше мотор прятали под сиденьем — теперь он под капотом впереди',480,670,{al:'center',size:21});};
// прямая передача Рено: на высшей ступени вал мотора соединяется с карданом напрямую
DIAG.direct=(g,t,p)=>{const top=Math.floor(t/4)%2===1,sp=t*3;DG.big(g,top?'Высшая передача: вал к валу':'Низшая: через шестерни',480,112,{size:32,col:DGC.brass});
  const y=330,yl=440;DG.rect(g,150,250,420,260,null,DGC.dim,2);
  DG.ln(g,[[60,y],[350,y]],DGC.steel,10);DG.ln(g,[[370,y],[900,y]],top?DGC.steel:'#6f7d84',10);
  // кулачковая муфта
  const dx=top?0:30;DG.rect(g,340-dx/2,y-26,24,52,top?DGC.brass:'#5a4e3c',DGC.ink,2);
  // промежуточный вал с шестернями
  DG.ln(g,[[200,yl],[520,yl]],top?'#6f7d84':DGC.steel,8);DG.gearSide(g,240,y+34,40,26,DGC.ink,top?'#3a3122':'#5b4f3d');DG.gearSide(g,240,yl-28,40,26);DG.gearSide(g,470,y+30,32,26,DGC.ink,top?'#3a3122':'#5b4f3d');DG.gearSide(g,470,yl-30,52,26);
  if(!top){DG.arrow(g,120,y-40,230,y-40,DGC.red,3);DG.arrow(g,240,y+70,240,yl-60,DGC.red,3);DG.arrow(g,260,yl+30,450,yl+30,DGC.red,3);DG.arrow(g,470,yl-60,470,y+60,DGC.red,3);DG.arrow(g,500,y-40,640,y-40,DGC.red,3);}
  else{DG.arrow(g,120,y-40,640,y-40,DGC.red,4);}
  // кардан и задний мост
  [[620,y],[880,y]].forEach(([x,yy])=>{DG.circ(g,x,yy,14,DGC.ink,2,'#5a4e3c');});const ux=750+Math.sin(sp)*2;DG.lab(g,'карданный вал',ux,y+60,{al:'center',size:22});
  DG.rect(g,860,y-120,40,240,'#3a3122',DGC.ink,2);DG.lab(g,'задний мост',880,y+150,{al:'center',size:20});
  DG.lab(g,top?'Шестерни отдыхают: тише и без потерь':'Сила идёт через промежуточный вал',480,560,{al:'center',size:24,col:top?DGC.brass:DGC.ink});
  DG.lab(g,'Вместо цепей — закрытый вал: ни грязи, ни лязга',480,668,{al:'center',size:22});};
// ступенчатая коробка: шестерни скользят по шлицам, рычаг ходит по кулисе; p.n — 3 или 4 ступени
DIAG.gears=(g,t,p)=>{const n=p.n||4,k=Math.floor(t/2.2)%n,ph=DG.inn(t%2.2,0.2,0.9);DG.big(g,`${n} ${n<5?'передачи':'передач'} вперёд`,480,112,{size:32,col:DGC.brass});
  const y=330,yl=460;DG.ln(g,[[80,y],[620,y]],DGC.steel,10);DG.ln(g,[[120,yl],[600,yl]],DGC.steel,8);
  for(let i=0;i<n;i++){const x=200+i*110,hL=40+i*12,hU=86-i*12,on=i===k,sl=on?0:-34;DG.gearSide(g,x+sl*(on?(1-ph):1),y+hU/2+6,hU,30,DGC.ink,on?'#6b5a3c':'#3a3122');DG.gearSide(g,x,yl-hL/2-6,hL,30,DGC.ink,on?'#6b5a3c':'#3a3122');}
  DG.lab(g,'ведомый вал — к колёсам',640,y,{size:20});DG.lab(g,'промежуточный вал',620,yl,{size:20});
  // кулиса
  const gx=760,gy=520,pos=[[-40,-40],[-40,40],[40,-40],[40,40]].slice(0,n),q=pos[k];DG.ln(g,[[gx-40,gy-40],[gx-40,gy+40]],DGC.dim,6);DG.ln(g,[[gx+40,gy-40],[gx+40,gy+40]],DGC.dim,6);DG.ln(g,[[gx-40,gy],[gx+40,gy]],DGC.dim,6);
  DG.circ(g,gx+q[0]*ph,gy+q[1]*ph,14,DGC.ink,2,DGC.brass);DG.lab(g,`${k+1}-я`,gx,gy+80,{al:'center',size:22,col:DGC.brass});
  DG.lab(g,n===3?'Три ступени и кулиса: понятно любому шофёру':'Четыре ступени: в гору — тяга, по шоссе — скорость',480,668,{al:'center',size:22});};
// синхронизатор: конус уравнивает скорости, и только потом входят зубья — без скрежета
DIAG.synchro=(g,t,p)=>{const c=DG.cyc(t,4),ph=c<0.35?0:c<0.6?(c-0.35)/0.25:1,slide=c<0.3?c/0.3:1;DG.big(g,'Синхронизатор',480,112,{size:32,col:DGC.brass});
  const y=380,wA=6,wB=6-3*Math.min(1,ph*1.2),rotA=t*wA,rotB=t*(c<0.35?2.5:2.5+(wA-2.5)*ph);
  DG.ln(g,[[80,y],[880,y]],DGC.steel,10);
  // шестерня (крутится со своей скоростью) и муфта (со скоростью вала)
  DG.gear(g,640,y,110,26,rotB,DGC.ink,'#2c2a24',2.5);const mx=300+170*slide;DG.rect(g,mx-40,y-80,80,160,'#5b4f3d',DGC.ink,3);
  DG.poly(g,[[mx+40,y-60],[mx+70,y-36],[mx+70,y+36],[mx+40,y+60]],ph>0&&ph<1?'rgba(196,85,60,.6)':'#6b5a3c',DGC.ink,2);
  for(let k=0;k<6;k++){const yy=y-75+k*30+((rotA*30)%30);if(yy>y-80&&yy<y+80)DG.ln(g,[[mx-40,yy],[mx+40,yy]],DGC.dim,1.5);}
  DG.lab(g,'муфта с конусом',220,560,{size:22,lead:[mx,y+80]});DG.lab(g,'шестерня передачи',700,560,{size:22,lead:[640,y+110]});
  DG.lab(g,c<0.35?'Скорости разные — раньше здесь был скрежет':c<0.6?'Конус трётся и выравнивает скорости':'Скорости равны — зубья входят мягко',480,200,{al:'center',size:26,col:c<0.35?'#e08a6c':DGC.brass});
  DG.lab(g,'Не нужно двойного выжима сцепления: передачи переключает любой',480,668,{al:'center',size:22});};

/* ---------- тормоза ---------- */
// колодки внутри барабана (Рено, 1902): не боятся грязи и воды
DIAG.drum=(g,t,p)=>{const c=DG.cyc(t,3.2),press=c>0.35&&c<0.8?DG.ease((c-0.35)/0.12):0,spin=t*4*(1-press*0.7),cx=480,cy=400,R=200;DG.big(g,'Барабанный тормоз',480,112,{size:32,col:DGC.brass});
  DG.circ(g,cx,cy,R,DGC.ink,4,'#2c2620');for(let i=0;i<8;i++){const a=spin+i*Math.PI/4;DG.ln(g,[[cx+(R-8)*Math.cos(a),cy+(R-8)*Math.sin(a)],[cx+(R-20)*Math.cos(a),cy+(R-20)*Math.sin(a)]],DGC.dim,3);}
  DG.circ(g,cx,cy,R-24,DGC.dim,1.5,DGC.bg);const e=press*14;
  [-1,1].forEach(sd=>{g.beginPath();g.arc(cx+sd*e,cy,R-34,sd>0?-1.2:Math.PI-1.2+0.0,sd>0?1.2:Math.PI+1.2);g.lineWidth=22;g.strokeStyle=press?'#8a4a34':'#6b5a3c';g.stroke();});
  DG.circ(g,cx,cy-R+60,16,DGC.ink,2,'#5a4e3c');g.save();g.translate(cx,cy-R+60);g.rotate(press*0.6);DG.rect(g,-6,-22,12,44,DGC.brass,null);g.restore();DG.spring(g,cx-60,cy+R-70,cx+60,cy+R-70,6,8,DGC.steel,2);
  if(press>0.2)for(let k=0;k<10;k++){const a=-Math.PI/2+(k-5)*0.25;DG.circ(g,cx+(R-24)*Math.cos(a)+(Math.random()-0.5)*6,cy+(R-24)*Math.sin(a)+(Math.random()-0.5)*6,2,null,0,'#ffb070');}
  DG.lab(g,'колодки',760,360,{size:22,lead:[cx+R-40,cy]});DG.lab(g,'кулак разжимает колодки',700,230,{size:22,lead:[cx+16,cy-R+60]});DG.lab(g,'пружина возвращает',700,600,{size:22,lead:[cx+40,cy+R-70]});
  DG.lab(g,'Колодки спрятаны в барабан — грязь и вода им не мешают',480,668,{al:'center',size:22});};
// тормоза на все колёса: тормозной путь короче почти вдвое
DIAG.brake4=(g,t,p)=>{const c=DG.cyc(t,5),v0=420,brakeX=300,gy1=360,gy2=600;DG.big(g,p.title||'Тормоза на четыре колеса',480,112,{size:32,col:DGC.brass});
  DG.ground(g,gy1,0);DG.ground(g,gy2,0);DG.dash(g,[[brakeX,150],[brakeX,640]],DGC.red,2,[8,8]);DG.lab(g,'начали тормозить',brakeX+8,160,{size:18,col:'#e08a6c'});
  [[gy1,p.a||'только задние колёса',1.0],[gy2,p.b||'все четыре колеса',0.55]].forEach(([gy,lab,k])=>{const tt=c*5,tb=brakeX/v0,L=320*k,a=v0*v0/(2*L),tau=tt-tb;let x;if(tt<tb)x=v0*tt;else x=brakeX+(tau<v0/a?v0*tau-a*tau*tau/2:L);
    DG.carSide(g,x+60,gy,1,-x/34,{});DG.lab(g,lab,40,gy-150,{size:24});const stop=brakeX+L;DG.ln(g,[[stop+60,gy-10],[stop+60,gy+24]],DGC.brass,3);DG.lab(g,k<1?'почти вдвое короче':'тормозной путь',stop+70,gy+16,{size:18,col:DGC.brass});});
  DG.lab(g,p.foot||'Передние колёса держат дорогу лучше: машина останавливается ровно',480,672,{al:'center',size:22});};
// сервотормоз Испано-Сюизы: вращение коробки помогает ноге
DIAG.servo=(g,t,p)=>{const c=DG.cyc(t,3),press=c>0.3&&c<0.8?1:0;DG.big(g,'Тормоз с усилителем',480,112,{size:32,col:DGC.brass});
  DG.ln(g,[[120,520],[180,420+press*16]],DGC.ink,7);DG.rect(g,95,516,70,18,'#4a4035',DGC.ink,2);DG.arrow(g,130,420,150,480,DGC.red,3);DG.lab(g,'лёгкое нажатие',60,380,{size:22});
  DG.ln(g,[[180,430],[400,430]],DGC.steel,4);DG.circ(g,470,430,70,DGC.ink,3,'#2c2620');for(let i=0;i<6;i++){const a=t*6+i*Math.PI/3;DG.ln(g,[[470+55*Math.cos(a),430+55*Math.sin(a)],[470+68*Math.cos(a),430+68*Math.sin(a)]],DGC.dim,3);}
  DG.lab(g,'диск усилителя крутит коробка передач',470,300,{al:'center',size:22,lead:[470,360]});if(press)DG.circ(g,405,430,10,null,0,'#ffb070');
  DG.arrow(g,540,430,720,430,DGC.red,press?12:4);DG.lab(g,'усилие на тормоза',740,430,{size:22,col:'#e08a6c'});
  [[760,250],[860,250],[760,600],[860,600]].forEach(([x,y])=>DG.circ(g,x,y,32,DGC.ink,2,press?'#7a3b2a':DGC.rub));DG.ln(g,[[720,430],[810,430],[810,250],[810,600]],DGC.steel,3);
  DG.lab(g,'Тяжёлая машина останавливается от лёгкого нажатия ноги',480,672,{al:'center',size:22});};
// гидравлические тормоза: жидкость давит одинаково на все колёса
DIAG.brake_hyd=(g,t,p)=>{const c=DG.cyc(t,3),press=c>0.25&&c<0.75?DG.ease((c-0.25)/0.1):0;DG.big(g,'Гидравлические тормоза',480,112,{size:32,col:DGC.brass});
  DG.rrect(g,300,190,360,440,60,null,DGC.dim,2);const W=[[300,260],[660,260],[300,560],[660,560]];
  const mx=480,my=640;DG.ln(g,[[mx-110,my-50+press*14],[mx-70,my]],DGC.ink,7);DG.rect(g,mx-70,my-16,140,32,'#3a3122',DGC.ink,2);DG.rect(g,mx-66+press*50,my-12,12,24,DGC.brass,null);
  W.forEach(([x,y])=>{const P=[[mx,my-16],[mx,410],[x+(x<480?40:-40),410],[x+(x<480?40:-40),y]];DG.ln(g,P,'rgba(201,141,58,.45)',9);if(press)DG.dash(g,P,'#f0b25a',4,[6,16],-t*120);
    DG.rect(g,x-24,y-50,48,100,DGC.rub,DGC.ink,2);DG.rect(g,x+(x<480?26:-48),y-16,22,32,'#3a3122',DGC.ink,2);if(press)DG.arrow(g,x+(x<480?20:-20),y,x+(x<480?4:-4),y,DGC.red,4);});
  DG.lab(g,'главный цилиндр',mx+90,my,{size:22});DG.lab(g,'колёсный цилиндр',700,200,{size:22,lead:[640,250]});
  DG.lab(g,'Жидкость давит одинаково на все колёса: мягкая педаль, ровное торможение',480,160,{al:'center',size:22,col:DGC.brass});};
// дешёвые тормоза на четыре колеса: тяги и тросы от педали к каждому колесу
DIAG.cable=(g,t,p)=>{const c=DG.cyc(t,3),press=c>0.3&&c<0.75?1:0;DG.big(g,'Четыре тормоза по цене двух',480,112,{size:32,col:DGC.brass});
  DG.rrect(g,300,190,360,440,60,null,DGC.dim,2);const W=[[300,260],[660,260],[300,560],[660,560]];DG.ln(g,[[330,420],[630,420]],DGC.steel,6);DG.ln(g,[[480,620],[480,420]],DGC.steel,4);
  DG.ln(g,[[440,650],[480,620+press*10]],DGC.ink,7);W.forEach(([x,y])=>{DG.ln(g,[[x<480?330:630,420],[x+(x<480?30:-30),y]],press?DGC.brass:DGC.dim,3);DG.rect(g,x-24,y-50,48,100,press?'#5a2f22':DGC.rub,DGC.ink,2);});
  DG.lab(g,'поперечный вал',650,420,{size:20,lead:[620,420]});DG.lab(g,'тяги и тросы',700,320,{size:20,lead:[620,300]});
  DG.lab(g,'Тормоза на всех колёсах — теперь и у недорогих машин',480,672,{al:'center',size:22});};
// планетарная коробка (Олдс, Ланчестер, Форд Т): солнце от мотора, сателлиты на водиле, коронная шестерня и ленты; педали
DIAG.planet=(g,t,p)=>{const cx=360,cy=400,R=180,rs=66,rp=(R-rs)/2-6,mode=Math.floor(t/4)%2,sp=t*0.9;
  const sun=sp*2.2,carrier=mode===0?sun*rs/(rs+R):sun,ring=mode===0?0:sun,pl=mode===0?-sun*rs/rp*0.5:sun;
  DG.big(g,p.title||(mode===0?'Низшая: лента держит корону':'Высшая: всё вращается одним целым'),480,100,{size:30,col:DGC.brass});
  DG.circ(g,cx,cy,R+28,DGC.ink,3,null);DG.gear(g,cx,cy,R,48,-ring,DGC.ink,null,2.5);
  DG.arc(g,cx,cy,R+42,0.3,2*Math.PI-0.3,mode===0?DGC.red:DGC.dim,mode===0?9:5);
  DG.gear(g,cx,cy,rs,18,sun,DGC.brass,'#3a3122',2.5);
  for(let i=0;i<3;i++){const a=carrier+i*2*Math.PI/3,x=cx+(rs+rp+4)*Math.cos(a),y=cy+(rs+rp+4)*Math.sin(a);DG.gear(g,x,y,rp,14,pl+a,DGC.steel,'#2c2a24',2);}
  DG.circ(g,cx,cy,rs+rp+4,DGC.dim,1.5);
  DG.lab(g,'солнечная шестерня — от мотора',600,220,{size:22,lead:[cx+rs*0.6,cy-rs*0.5]});DG.lab(g,'сателлиты на водиле — к колёсам',600,290,{size:22,lead:[cx+(rs+rp)*0.9,cy-30]});
  DG.lab(g,'коронная шестерня',600,370,{size:22,lead:[cx+R*0.92,cy+30]});DG.lab(g,'лента тормозит корону',600,440,{size:22,lead:[cx+R+40,cy+60],col:mode===0?'#e08a6c':DGC.ink});
  const px=600,py=560;['низшая','задний ход','тормоз'].forEach((n,i)=>{const down=mode===0&&i===0?14:0;DG.rect(g,px+i*110,py+down,70,22,'#4a4035',DGC.ink,2);DG.lab(g,n,px+i*110+35,py+50,{al:'center',size:18,col:DGC.dim,w:105});});
  DG.lab(g,'Педали вместо рычага: шестерни всегда в зацеплении, скрежета нет',480,672,{al:'center',size:21});};
