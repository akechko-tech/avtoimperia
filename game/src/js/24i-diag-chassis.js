/* ================= 0.25: чертежи кинохроники — рама, подвеска, колёса и шины, завод ================= */
// схема Панара: мотор впереди под капотом, за ним сцепление и коробка, привод назад; раньше мотор стоял под сиденьем
DIAG.layout=(g,t,p)=>{const k=Math.floor(t/4)%2,f=DG.inn(t%4,0,0.6);DG.big(g,k?'Система Панара, 1891 год':'Раньше: мотор под сиденьем',480,100,{size:32,col:DGC.brass});
  const gy=520,rot=-t*3;DG.ground(g,gy,-t*60);
  if(!k){// экипаж: высокий кузов, мотор сзади под сиденьем
    DG.poly(g,[[300,gy-90],[640,gy-90],[650,gy-180],[560,gy-190],[520,gy-260],[470,gy-260],[450,gy-190],[300,gy-180]],'#3c3328',DGC.ink,2.5);DG.wheel(g,330,gy-70,70,rot,{tyre:'solid'});DG.wheel(g,610,gy-90,90,rot,{tyre:'solid'});
    DG.rect(g,520,gy-180,90,70,'rgba(196,85,60,.35)',DGC.red,2);DG.lab(g,'мотор под сиденьем',700,gy-230,{size:22,lead:[565,gy-145]});DG.lab(g,'высоко, тесно, трясёт',480,620,{al:'center',size:24,col:DGC.dim});}
  else{// низкая длинная машина, мотор впереди
    DG.poly(g,[[180,gy-70],[780,gy-70],[790,gy-150],[600,gy-160],[560,gy-230],[500,gy-230],[470,gy-150],[300,gy-150],[300,gy-180],[180,gy-180]],'#3c3328',DGC.ink,2.5);
    DG.rect(g,190,gy-170,120,90,'rgba(212,174,74,.3)',DGC.brass,2);DG.rect(g,330,gy-130,50,40,'rgba(212,174,74,.2)',DGC.ink,2);DG.rect(g,400,gy-140,90,50,'rgba(212,174,74,.2)',DGC.ink,2);DG.ln(g,[[490,gy-115],[700,gy-90]],DGC.steel,5);
    DG.wheel(g,250,gy-60,60,rot,{tyre:'pneu'});DG.wheel(g,700,gy-70,70,rot,{tyre:'pneu'});
    DG.lab(g,'мотор',150,gy-260,{size:22,lead:[250,gy-170]});DG.lab(g,'сцепление',300,gy-300,{size:20,lead:[355,gy-130]});DG.lab(g,'коробка',450,gy-320,{size:20,lead:[445,gy-140]});DG.lab(g,'привод на задние колёса',640,gy-300,{size:20,lead:[620,gy-100]});
    DG.lab(g,'низко, устойчиво — схему переняли все',480,620,{al:'center',size:24,col:DGC.brass});}
  DG.lab(g,'Мотор впереди, коробка посередине, ведущие — задние: так строят машины до сих пор',480,672,{al:'center',size:21});};
// рама: деревянная, из стального швеллера, штампованная (p.kind)
DIAG.frame=(g,t,p)=>{const kind=p.kind||'channel';DG.big(g,{wood:'Деревянная рама на рессорах',channel:'Рама из стального швеллера',pressed:'Штампованная рама'}[kind],480,100,{size:32,col:DGC.brass});
  // вид сверху: две балки и поперечины
  const col=kind==='wood'?DGC.wood:DGC.steel,y1=230,y2=390;DG.rect(g,140,y1-14,620,28,kind==='wood'?'#6b5236':'#56616a',DGC.ink,2);DG.rect(g,140,y2-14,620,28,kind==='wood'?'#6b5236':'#56616a',DGC.ink,2);
  [200,360,520,700].forEach(x=>DG.rect(g,x-10,y1,20,y2-y1,kind==='wood'?'#6b5236':'#56616a',DGC.ink,2));
  if(kind==='wood')for(let x=150;x<760;x+=26){DG.ln(g,[[x,y1-10],[x+18,y1+8]],'#8a6a44',1.5);DG.ln(g,[[x,y2-10],[x+18,y2+8]],'#8a6a44',1.5);}
  // сечение балки
  const sx=830,sy=310;if(kind==='wood'){DG.rect(g,sx-30,sy-50,60,100,'#6b5236',DGC.ink,2);DG.lab(g,'ясень',sx,sy+80,{al:'center',size:20});}
  else{DG.poly(g,[[sx-34,sy-60],[sx+34,sy-60],[sx+34,sy-46],[sx-20,sy-46],[sx-20,sy+46],[sx+34,sy+46],[sx+34,sy+60],[sx-34,sy+60]],'#56616a',DGC.ink,2);DG.lab(g,'сечение «швеллер»',sx,sy+90,{al:'center',size:20});}
  if(kind==='pressed'){const c=DG.cyc(t,3),ram=c<0.4?c/0.4:c<0.6?1:1-(c-0.6)/0.4;const by=470;DG.rect(g,330,by+ram*60,300,40,'#4a4035',DGC.ink,2);DG.ln(g,[[480,by-60],[480,by+ram*60]],DGC.steel,10);
    const bend=Math.min(1,ram*1.4);DG.ln(g,[[340,560+bend*0],[360,560+bend*30],[600,560+bend*30],[620,560]],DGC.brass,5);DG.rect(g,320,600,320,30,'#3a3122',DGC.ink,2);DG.lab(g,'пресс за один удар',680,520,{size:22,lead:[630,500]});}
  else{// нагрузка: мотор давит на раму, рама держит
    const L=DG.ping(t,2.4);DG.arrow(g,300,150,300,y1-24,DGC.red,4+3*L);DG.lab(g,'мотор и кузов',320,150,{size:20});const maxHp=kind==='wood'?'до 6 л. с.':kind==='channel'?'до 30 л. с.':'до 60 л. с.';
    DG.lab(g,`выдерживает мотор ${maxHp}`,480,520,{al:'center',size:26,col:DGC.brass});}
  DG.lab(g,{wood:'Как у кареты: ясень гнётся и гасит тряску, но мощный мотор её расшатает',channel:'Сталь держит мощный мотор и тяжёлый кузов, машина стала длиннее и ниже',pressed:'Рама штампуется из листа: прочно и быстро — как на конвейере'}[kind],480,672,{al:'center',size:21});};
// ванадиевая сталь (Форд, 1908): та же балка, втрое прочнее
DIAG.vanadium=(g,t,p)=>{const L=DG.ping(t,3);DG.big(g,'Ванадиевая сталь',480,100,{size:32,col:DGC.brass});
  [[260,'обычная сталь',1],[700,'ванадиевая сталь',0.3]].forEach(([x,n,k])=>{const y=330,sag=70*L*k,crack=k>0.9&&L>0.85;
    DG.poly(g,[[x-170,y+50],[x-150,y+10],[x-130,y+50]],'#3a3122',DGC.ink,2);DG.poly(g,[[x+130,y+50],[x+150,y+10],[x+170,y+50]],'#3a3122',DGC.ink,2);
    const P=[];for(let i=0;i<=20;i++){const f=i/20,xx=x-160+320*f;P.push([xx,y-sag*Math.sin(Math.PI*f)*-1]);}DG.ln(g,P,crack?DGC.red:DGC.steel,14);
    DG.rect(g,x-40,y-70+sag,80,50,'#4a4035',DGC.ink,2);DG.lab(g,'груз',x,y-45+sag,{al:'center',size:18});if(crack)DG.lab(g,'трещина!',x,y-110,{al:'center',size:24,col:'#e08a6c'});
    DG.lab(g,n,x,y+150,{al:'center',size:26});});
  DG.lab(g,'Ванадий делает сталь втрое прочнее: рама легче и дешевле, а держит больше',480,672,{al:'center',size:21});};
// амортизатор: колесо прошло по кочке — без амортизатора кузов раскачивается, с ним — успокаивается
DIAG.shock=(g,t,p)=>{const T=t%4,bump=T<0.4?Math.sin(T/0.4*Math.PI)*40:0,road=-T*180;DG.big(g,'Амортизатор',480,100,{size:32,col:DGC.brass});
  [[260,'только рессоры',0.15],[700,'с амортизатором',1.2]].forEach(([x,n,damp])=>{const gy=470,osc=T<0.4?bump*0.8:40*Math.exp(-damp*(T-0.4)*2.2)*Math.cos((T-0.4)*9);
    DG.ln(g,[[x-190,gy],[x+190,gy]],DGC.dim,2);const sx=((road%380)+380)%380-190;if(Math.abs(sx)<190)DG.arc(g,x+sx,gy,30,Math.PI,2*Math.PI,DGC.dim,3);
    DG.wheel(g,x,gy-55-bump*0.6,55,t*4,{tyre:'pneu'});const by=gy-200-osc;DG.rrect(g,x-150,by-50,300,60,10,'#3c3328',DGC.ink,2.5);
    DG.spring(g,x-30,by+10,x-30,gy-55-bump*0.6,6,14,DGC.steel,3);if(damp>1){DG.rect(g,x+18,by+10,22,40,'#4a4035',DGC.ink,2);DG.ln(g,[[x+29,by+50],[x+29,gy-55-bump*0.6]],DGC.brass,5);}
    DG.lab(g,n,x,gy+60,{al:'center',size:24});
    // след кузова
    const P=[];for(let i=0;i<=60;i++){const tt=i/60*4,o=tt<0.4?Math.sin(tt/0.4*Math.PI)*32:32*Math.exp(-damp*(tt-0.4)*2.2)*Math.cos((tt-0.4)*9);P.push([x-150+i*5,620-o*0.8]);}DG.ln(g,P,DGC.brass,2);DG.circ(g,x-150+Math.min(60,T/4*60)*5,620,5,null,0,DGC.red);});
  DG.lab(g,'Масло в амортизаторе гасит раскачку: машину не бросает на ухабах',480,676,{al:'center',size:21});};
// независимая подвеска Лянчи (1922): каждое колесо прыгает само по себе
DIAG.ifs=(g,t,p)=>{const T=t%3,bump=T<0.6?Math.sin(T/0.6*Math.PI)*50:0;DG.big(g,'Независимая подвеска',480,100,{size:32,col:DGC.brass});
  // вид спереди: слева — сплошная ось, справа — свечи Лянчи
  const gy=520,xs=[[120,360],[600,840]];DG.ln(g,[[60,gy],[440,gy]],DGC.dim,2);DG.ln(g,[[520,gy],[900,gy]],DGC.dim,2);
  // сплошная ось: правое колесо наехало — наклоняется всё
  {const [a,b]=xs[0],ya=gy-60,yb=gy-60-bump,ang=Math.atan2(yb-ya,b-a);DG.ln(g,[[a,ya],[b,yb]],DGC.steel,10);[[a,ya],[b,yb]].forEach(([x,y])=>{g.save();g.translate(x,y);g.rotate(ang);DG.rrect(g,-22,-60,44,120,10,DGC.rub,DGC.ink,2);g.restore();});
    DG.rrect(g,a+20,ya-170-bump*0.5,b-a-40,70,10,'#3c3328',DGC.ink,2);DG.lab(g,'сплошная ось: наклоняется вся машина',240,620,{al:'center',size:20});}
  {const [a,b]=xs[1];[[a,0],[b,bump]].forEach(([x,u])=>{DG.ln(g,[[x,gy-60-u],[x,gy-230]],DGC.steel,8);DG.spring(g,x+18,gy-90-u,x+18,gy-220,6,10,DGC.steel,3);DG.rrect(g,x-22,gy-120-u,44,120,10,DGC.rub,DGC.ink,2);});
    DG.rrect(g,a+20,gy-240,b-a-40,70,10,'#3c3328',DGC.ink,2);DG.lab(g,'Лянча: колесо скользит по своей свече',720,620,{al:'center',size:20});}
  DG.lab(g,'Колёса прыгают по отдельности: руль не бьёт, машина ниже и легче',480,676,{al:'center',size:21});};

/* ---------- колёса и шины ---------- */
// сплошная шина против пневматической: камень на дороге
DIAG.pneu=(g,t,p)=>{const T=t%3,st=T<0.5?Math.sin(T/0.5*Math.PI):0,rock=480-((t*240)%960);DG.big(g,'Воздух вместо резины',480,100,{size:32,col:DGC.brass});
  [[260,'сплошная шина','solid',1],[700,'пневматическая','pneu',0.25]].forEach(([x,n,ty,k])=>{const gy=470,lift=st*44*k;DG.ln(g,[[x-200,gy],[x+200,gy]],DGC.dim,2);
    DG.wheel(g,x,gy-90-lift,90,t*5,{tyre:ty,rim:'wood'});if(ty==='pneu'&&st>0.1){g.fillStyle=DGC.bg;g.fillRect(x-30,gy-12-lift*0,60,12);DG.ln(g,[[x-40,gy-4],[x+40,gy-4]],DGC.ink,3);}
    DG.poly(g,[[x-14,gy],[x,gy-26*st],[x+14,gy]],'#5a4e3c',DGC.dim,2);DG.rrect(g,x-130,gy-260-lift*1.2,260,50,8,'#3c3328',DGC.ink,2);if(k===1&&st>0.4)DG.lab(g,'удар!',x+140,gy-250,{size:22,col:'#e08a6c'});
    DG.lab(g,n,x,gy+60,{al:'center',size:24});});
  DG.lab(g,'Шина с воздухом проглатывает камни: быстрее, тише, мягче',480,672,{al:'center',size:22});};
// протектор: на мокрой дороге гладкая шина скользит, рисунок держит
DIAG.tread=(g,t,p)=>{DG.big(g,'Рисунок протектора',480,100,{size:32,col:DGC.brass});
  [[260,'гладкая шина',0],[700,'с протектором',1]].forEach(([x,n,tr])=>{const gy=470,slip=tr?0:Math.sin(t*3)*14;DG.ln(g,[[x-200,gy],[x+200,gy]],DGC.dim,2);g.fillStyle='rgba(159,176,184,.25)';g.fillRect(x-200,gy-8,400,8);
    DG.wheel(g,x+slip,gy-100,100,t*(tr?3:7),{tyre:'pneu',tread:!!tr});if(!tr)for(let k=0;k<8;k++){const a=Math.random()*Math.PI;DG.circ(g,x+slip-120+Math.random()*240,gy-10-Math.random()*40,3,null,0,'rgba(159,176,184,.7)');}
    DG.lab(g,n,x,gy+60,{al:'center',size:24});DG.lab(g,tr?'держит дорогу':'буксует и скользит',x,gy+100,{al:'center',size:20,col:tr?DGC.brass:'#e08a6c'});});
  DG.lab(g,'Канавки выдавливают воду и грязь: шина цепляется за дорогу',480,672,{al:'center',size:22});};
// съёмный обод Мишлена (1906): шину меняют вместе с ободом
DIAG.rim=(g,t,p)=>{const c=DG.cyc(t,6);DG.big(g,'Съёмный обод',480,100,{size:32,col:DGC.brass});
  [[260,'старый обод: снять шину, заклеить, накачать','15 минут',1],[700,'съёмный обод: отвернуть болты и поставить запасной','3–4 минуты',0.22]].forEach(([x,n,tm,k])=>{const f=Math.min(1,c/k),y=330;
    DG.wheel(g,x,y,110,0,{tyre:'pneu',rim:'wood'});if(k<1){const off=f<0.5?f*2*160:(1-f)*2*160;g.save();g.globalAlpha=0.9;DG.circ(g,x+off,y,110,DGC.brass,5);g.restore();}
    else{for(let i=0;i<3;i++){const a=t*2+i*2.1;DG.ln(g,[[x+80*Math.cos(a),y+80*Math.sin(a)],[x+125*Math.cos(a),y+125*Math.sin(a)]],DGC.steel,6);}}
    DG.clock(g,x,560,50,f,tm);DG.lab(g,n,x,190,{al:'center',size:21,w:400});});
  DG.lab(g,'В 1906 году съёмные ободья Мишлена принесли «Рено» первое Гран-при',480,676,{al:'center',size:21});};
// проволочное колесо Радж-Уитворт: одна гайка в центре
DIAG.wire=(g,t,p)=>{const c=DG.cyc(t,4),y=380,hit=c<0.3?Math.sin(c/0.3*Math.PI*3):0,off=c<0.3?0:c<0.6?(c-0.3)/0.3*260:c<0.8?260-(c-0.6)/0.2*260:0;
  DG.big(g,'Колесо на одной гайке',480,100,{size:32,col:DGC.brass});DG.ln(g,[[220,y],[480,y]],DGC.steel,12);DG.wheel(g,480+off,y,150,0.3,{tyre:'pneu',rim:'wire',knock:true});
  g.save();g.translate(390,y-150);g.rotate(-0.6+hit*0.5);DG.rect(g,-8,0,16,120,DGC.wood,DGC.ink,2);DG.rect(g,-30,-20,60,30,'#8a7a5a',DGC.ink,2);g.restore();
  DG.clock(g,820,560,46,Math.min(1,c/0.8),'полминуты');DG.lab(g,'гайка-«бабочка»: два удара молотком',150,560,{size:22,lead:[480+off,y]});
  DG.lab(g,'Спицы легче дерева, а колесо меняют, не поднимая болтов',480,676,{al:'center',size:21});};
// кордовая шина: нити лежат рядом, а не переплетены — меньше трения и нагрева
DIAG.cord=(g,t,p)=>{DG.big(g,'Кордовая шина',480,100,{size:32,col:DGC.brass});const fl=Math.sin(t*4)*6;
  [[260,'ткань: нити переплетены',0],[700,'корд: нити лежат слоями',1]].forEach(([x,n,cord])=>{const y=360;DG.rrect(g,x-170,y-110,340,220,20,DGC.rub,DGC.ink,2);
    if(!cord){for(let i=-160;i<170;i+=18){DG.ln(g,[[x+i,y-100],[x+i+fl,y+100]],'#8a7a5a',2);}for(let j=-100;j<110;j+=18){DG.ln(g,[[x-160,y+j],[x+160,y+j+fl*0.5]],'#8a7a5a',2);}g.fillStyle=`rgba(196,85,60,${0.18+0.12*Math.sin(t*3)})`;g.fillRect(x-168,y-108,336,216);}
    else{for(let i=-160;i<170;i+=12)DG.ln(g,[[x+i,y-100],[x+i+fl,y+100]],'#c9b98f',2);}
    DG.lab(g,n,x,y+150,{al:'center',size:22});DG.lab(g,cord?'холоднее — живёт дольше':'нити трутся и греются',x,y+185,{al:'center',size:20,col:cord?DGC.brass:'#e08a6c'});});
  DG.lab(g,'Корд не перетирается: шина служит в разы дольше и реже лопается',480,676,{al:'center',size:21});};
// стальное дисковое колесо Сэнки: штампуют за один удар
DIAG.disc=(g,t,p)=>{const c=DG.cyc(t,3),ram=c<0.35?c/0.35:c<0.55?1:1-(c-0.55)/0.45;DG.big(g,'Стальное дисковое колесо',480,100,{size:32,col:DGC.brass});
  DG.wheel(g,250,380,140,t*2,{tyre:'pneu',rim:'wood'});DG.lab(g,'деревянное: спицы, обод, сотни деталей',250,580,{al:'center',size:20});
  DG.rect(g,560,170+ram*100,300,40,'#4a4035',DGC.ink,2);DG.ln(g,[[710,130],[710,170+ram*100]],DGC.steel,10);
  if(ram>0.6)DG.wheel(g,710,430,120,0,{tyre:'pneu',rim:'disc'});else DG.rect(g,600,420,220,16,'#56616a',DGC.ink,2);DG.lab(g,'стальной диск — один удар пресса',710,600,{al:'center',size:20});
  DG.lab(g,'Дёшево, прочно и легко мыть — дисковые колёса быстро вытесняют дерево',480,676,{al:'center',size:21});};
// баллонная шина Файрстоуна (1923): низкое давление, большое пятно контакта
DIAG.tyre_balloon=(g,t,p)=>{const T=t%2.6,st=T<0.5?Math.sin(T/0.5*Math.PI):0,ys=430;DG.big(g,'Баллонная шина',480,100,{size:32,col:DGC.brass});
  [[260,'обычная: 4–5 атмосфер',0.16,6,1],[700,'баллонная: около 2 атмосфер',0.26,18,0.3]].forEach(([x,n,tw,flat,k])=>{const r=140,lift=st*36*k,sq=flat+st*(k<1?22:4);
    g.save();g.translate(x,ys-lift);DG.circ(g,0,0,r,DGC.ink,3,DGC.rub);DG.circ(g,0,0,r*(1-tw),DGC.ink,2,DGC.bg);DG.circ(g,0,0,r*0.2,DGC.ink,2,'#5a4e3c');
    g.fillStyle=DGC.bg;g.fillRect(-r-4,r-sq,2*r+8,sq+6);DG.ln(g,[[-Math.sqrt(Math.max(0,r*r-(r-sq)*(r-sq))),r-sq],[Math.sqrt(Math.max(0,r*r-(r-sq)*(r-sq))),r-sq]],DGC.ink,3);g.restore();
    DG.ln(g,[[x-190,ys+r-flat],[x+190,ys+r-flat]],DGC.dim,2);DG.poly(g,[[x-16,ys+r-flat],[x,ys+r-flat-22*st],[x+16,ys+r-flat]],'#5a4e3c',null);
    const cp=k<1?150:70;DG.rect(g,x-cp/2,ys+r+18,cp,10,DGC.brass,null);DG.lab(g,'пятно контакта',x,ys+r+44,{al:'center',size:19,col:DGC.brass});DG.lab(g,n,x,190,{al:'center',size:22});});
  DG.lab(g,'Мягче на ухабах и крепче держит дорогу',480,676,{al:'center',size:22});};

/* ---------- завод ---------- */
// движущийся конвейер (Форд, 1913): машина едет к рабочему
DIAG.line=(g,t,p)=>{const off=(t*60)%170;DG.big(g,'Машина едет к рабочему',480,100,{size:32,col:DGC.brass});const y=430;
  DG.ln(g,[[30,y+40],[930,y+40]],DGC.steel,6);DG.dash(g,[[30,y+52],[930,y+52]],DGC.dim,3,[10,10],-t*60);
  for(let k=-1;k<6;k++){const x=40+k*170+off,st=Math.floor((x-40)/170);DG.rect(g,x,y,120,30,'#4a4035',DGC.ink,2);if(st>=1)DG.rect(g,x+10,y-40,40,40,'#5b4f3d',DGC.ink,2);if(st>=2){DG.wheel(g,x+20,y+30,20,0,{});DG.wheel(g,x+100,y+30,20,0,{});}if(st>=3)DG.poly(g,[[x+50,y],[x+120,y],[x+115,y-50],[x+60,y-50]],'#3c3328',DGC.ink,2);if(st>=4)DG.rect(g,x+60,y-80,40,30,null,DGC.ink,2);}
  ['рама','мотор','колёса','кузов','готово'].forEach((n,i)=>{const x=110+i*170;DG.circ(g,x,y-150,14,DGC.ink,2,'#5a4e3c');DG.ln(g,[[x,y-136],[x,y-90]],DGC.ink,4);DG.ln(g,[[x,y-120],[x+20,y-100+Math.sin(t*6+i)*8]],DGC.ink,3);DG.lab(g,n,x,y-190,{al:'center',size:20,col:DGC.dim});});
  DG.lab(g,'шасси собирали 12 с половиной часов',260,580,{al:'center',size:22,col:'#e08a6c'});DG.lab(g,'на конвейере — полтора часа',700,580,{al:'center',size:22,col:DGC.brass});
  DG.lab(g,'Каждый делает одну операцию, машина сама подъезжает к нему',480,676,{al:'center',size:21});};
// взаимозаменяемые детали (Кадиллак, 1908): три машины разобрали, перемешали и собрали
DIAG.interchange=(g,t,p)=>{const c=DG.cyc(t,6),ph=c<0.3?0:c<0.6?1:2;DG.big(g,['Три машины','Детали в одну кучу','Собрали — и поехали!'][ph],480,100,{size:32,col:DGC.brass});
  const cols=['#7a5a3a','#3a5a6a','#5a6a3a'];
  if(ph===0)[200,480,760].forEach((x,i)=>DG.carSide(g,x,460,1,0,{fill:cols[i]}));
  else if(ph===1){for(let k=0;k<60;k++){const r=mulberry32(k+7),x=200+r()*560,y=300+r()*240,w=14+r()*30,h=8+r()*18;DG.rect(g,x+Math.sin(t*3+k)*4,y,w,h,cols[k%3],DGC.ink,1);}}
  else [200,480,760].forEach((x,i)=>DG.carSide(g,x+((t*80)%40),460,1,-t*3,{fill:cols[(i+1)%3]}));
  DG.lab(g,ph===2?'Детали подошли без напильника: точность до тысячной дюйма':'Испытание Королевского автоклуба, Бруклендс, 1908',480,640,{al:'center',size:22});};
// штампованный стальной кузов: пресс вместо столяров
DIAG.press=(g,t,p)=>{const c=DG.cyc(t,2.6),ram=c<0.35?c/0.35:c<0.5?1:1-(c-0.5)/0.5;DG.big(g,'Кузов из-под пресса',480,100,{size:32,col:DGC.brass});
  DG.rect(g,300,160+ram*140,360,60,'#4a4035',DGC.ink,3);DG.ln(g,[[480,120],[480,160+ram*140]],DGC.steel,14);DG.rect(g,280,470,400,60,'#3a3122',DGC.ink,3);
  if(ram>0.7||c>0.5)DG.poly(g,[[320,470],[360,400],[600,400],[640,470]],'#56616a',DGC.ink,2);else DG.rect(g,310,456,340,12,'#56616a',DGC.ink,2);
  DG.lab(g,'стальной лист',150,460,{size:22,lead:[310,462]});DG.lab(g,'одна деталь кузова — за один удар',480,600,{al:'center',size:24,col:DGC.brass});
  DG.lab(g,'Раньше кузов собирали из дерева неделями — теперь штампуют за минуты',480,676,{al:'center',size:21});};
// краска: лак сохнет неделями, нитроэмаль — часы
DIAG.paint=(g,t,p)=>{const f=DG.inn(t,0.3,2.5);DG.big(g,'Сколько сохнет краска',480,100,{size:32,col:DGC.brass});
  [[300,'лак: много слоёв, сушка',21,'около трёх недель'],[520,'нитроэмаль «Дюко», 1924',0.5,'несколько часов']].forEach(([y,n,d,lab])=>{DG.lab(g,n,80,y-50,{size:24});DG.rect(g,80,y-20,800,40,null,DGC.dim,2);DG.rect(g,82,y-18,796*Math.min(1,d/21)*f,36,d>1?'rgba(196,85,60,.6)':'rgba(212,174,74,.8)',null);DG.lab(g,lab,880,y+50,{al:'right',size:22,col:d>1?'#e08a6c':DGC.brass});});
  DG.lab(g,'Не нужны склады сохнущих кузовов — и машины бывают любого цвета',480,676,{al:'center',size:21});};
// рассрочка: треть сразу, остальное — помесячно
DIAG.credit=(g,t,p)=>{const f=DG.inn(t,0.2,3);DG.big(g,'Машина сегодня — деньги потом',480,100,{size:32,col:DGC.brass});
  const x0=110,w=56,base=520;DG.rect(g,x0,base-220*f,w*2,220*f,'rgba(212,174,74,.8)',DGC.ink,2);DG.lab(g,'треть цены — сразу',x0+w,base+30,{al:'center',size:20});
  for(let m=0;m<12;m++){const x=x0+w*2+20+m*w,h=36*Math.min(1,Math.max(0,f*14-m-1));DG.rect(g,x,base-h,w-10,h,'rgba(159,176,184,.7)',DGC.ink,1.5);}DG.lab(g,'остальное — двенадцать месяцев',x0+w*2+20+6*w,base+30,{al:'center',size:20});
  DG.carSide(g,820,330,0.9,0,{});DG.lab(g,'машина уже у крыльца',820,380,{al:'center',size:20,col:DGC.brass});
  DG.lab(g,'Покупателей больше: машину берут те, кто не может заплатить сразу',480,676,{al:'center',size:21});};
// электромоторы у станков: вместо длинного вала и ремней от паровой машины
DIAG.elec=(g,t,p)=>{const k=Math.floor(t/4)%2;DG.big(g,k?'Свой мотор у каждого станка':'Паровая машина и ремни',480,100,{size:32,col:DGC.brass});
  const y=220;if(!k){DG.ln(g,[[60,y],[900,y]],DGC.steel,8);DG.rect(g,40,y-60,90,120,'#4a4035',DGC.ink,2);DG.lab(g,'паровая машина',85,y+90,{al:'center',size:18});
    [220,400,580,760].forEach((x,i)=>{DG.circ(g,x,y,22,DGC.ink,2,'#5a4e3c');DG.dash(g,[[x-20,y],[x-30,470]],DGC.wood,4,[12,8],-t*80);DG.dash(g,[[x+20,y],[x+30,470]],DGC.wood,4,[12,8],t*80);DG.rect(g,x-60,470,120,70,'#3a3122',DGC.ink,2);});
    DG.lab(g,'темно, шумно, станки стоят там, где проходит вал',480,620,{al:'center',size:22,col:'#e08a6c'});}
  else{[220,400,580,760].forEach((x,i)=>{DG.rect(g,x-60,470,120,70,'#3a3122',DGC.ink,2);DG.circ(g,x+40,450,22,DGC.brass,2,'#5a4e3c');DG.ln(g,[[x+40,450],[x+40+20*Math.cos(t*8),450+20*Math.sin(t*8)]],DGC.brass,3);DG.ln(g,[[x+40,428],[x+40,300],[480,300],[480,180]],DGC.dim,1.5);});
    DG.lab(g,'провода вместо ремней: станки стоят в порядке работы',480,620,{al:'center',size:22,col:DGC.brass});}
  DG.lab(g,'Светлые цеха и гибкая расстановка станков',480,676,{al:'center',size:21});};
// контроль качества: калибр «проходит — не проходит»
DIAG.qc=(g,t,p)=>{const c=DG.cyc(t,4),k=Math.floor(t/2)%2;DG.big(g,'Калибр: проходит — не проходит',480,100,{size:32,col:DGC.brass});
  DG.rect(g,300,240,360,60,'#56616a',DGC.ink,2);DG.rect(g,300,400,360,60,'#56616a',DGC.ink,2);const d=k?52:58,x=480+(c%0.5)/0.5*0;DG.rrect(g,450,300+0,60,100,6,null,DGC.ink,2);
  DG.circ(g,480,350,d/2,DGC.ink,2,k?'rgba(212,174,74,.6)':'rgba(196,85,60,.6)');DG.lab(g,k?'годна':'брак',480,520,{al:'center',size:30,col:k?DGC.brass:'#e08a6c'});
  DG.lab(g,'Каждую деталь проверяют мерой: допуск — тысячная доля дюйма',480,676,{al:'center',size:21});};
