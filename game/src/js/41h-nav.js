/* ================= 0.30: МЕХАНИК РЯДОМ С ГОНЩИКОМ ВЕДЁТ ПО МАРШРУТУ ГОЛОСОМ =================
   До 1925 года в гоночной машине рядом с гонщиком сидел механик. Он не читал стенограмму, как штурман ралли
   полвека спустя: смотрел на дорогу вперёд, оглядывался назад, следил за шинами, маслом и бензином и КРИЧАЛ —
   сквозь ветер и рёв мотора, коротко: «Круто вправо!», «Яма!», «Переезд!», «Сзади догоняют!», «Заднее левое спустило!».
   Голос — живой, записанный заранее (Silero, голос eugene, обработан как крик в открытой машине: выше, быстрее,
   «в лоб»), в игре — сухо, без эха, со стороны пассажира. Без звука — те же слова пузырём под подсказкой поворота.
   Разведка трассы (оснащение команды) — механик знает дорогу: подсказывает раньше и не пропускает поворотов. */
const NAV_L={
  r:'Направо!',l:'Налево!',r2:'Круто вправо!',l2:'Круто влево!',rh:'Шпилька вправо! Тормози!',lh:'Шпилька влево! Тормози!',brk:'Тормози!',
  sr:'Вправо и сразу влево!',sl:'Влево и сразу вправо!',str:'Прямая! Гони!',
  bridge:'Мост!',rail:'Переезд!',gate:'Шлагбаум! Стой!',town:'Город! Сбавь, люди!',vill:'Деревня! Сбавь ход!',geese:'Гуси на дороге!',tunnel:'Тоннель!',serp:'Серпантин! Обрыв рядом!',
  mud:'Грязь!',water:'Лужа!',hole:'Яма!',holeL:'Яма слева!',holeR:'Яма справа!',
  crowd:'Люди на дороге!',post:'Контроль! Тормози!',storm:'Дерево поперёк!',pass:'Перевал! Держи газ!',summit:'Вершина! Дальше вниз!',desc:'Спуск! Береги тормоза!',climb:'Подъём! Переключай!',sbag:'Мешки! Шикана!',
  behind:'Сзади догоняют!',passL:'Слева обходит!',passR:'Справа обходит!',past:'Обошли!',lost:'Нас обошли!',p1:'Мы первые!',p2:'Мы вторые!',p3:'Мы третьи!',dust:'Пыль! Держи прямо!',
  pFL:'Переднее левое спустило!',pFR:'Переднее правое спустило!',pRL:'Заднее левое спустило!',pRR:'Заднее правое спустило!',rim:'Едем на ободе!',
  heat:'Мотор кипит! Сбавь!',oil:'Качаю масло!',fuel:'Бензина мало!',fuelBox:'Бензин кончается! В боксы!',dmg:'Стучит что-то! Береги машину!',
  crash:'Держись!',ok:'Цел? Поехали!',start:'Ну, с Богом!',half:'Полпути позади!',near:'Скоро финиш!',fin1:'Финиш близко! Жми!',last:'Последний круг!',
  fin:'Финиш! Доехали!',win:'Победа! Мы первые!',dnf:'Всё, приехали.',rain:'Дождь! Скользко будет!',dog:'Собака!'};
const NAV_PK=['pFL','pFR','pRL','pRR'];
function navLines(){return Object.values(NAV_L);}
const NAV={buf:{},pend:{},q:[],until:0,cd:{},said:{},R:null};
// голос механика есть только там, где он сидит в машине: до 1925 года (и пока он не в больнице)
function navActive(){const me=R&&R.me;return !!(me&&R.mode==='drive'&&me.mech&&!R.film&&!R.demo&&R.trk);}
function navReset(){NAV.R=R;NAV.lt=undefined;NAV.q=[];NAV.until=0;NAV.cd={};NAV.said={};NAV.curve=null;NAV.rank=0;NAV.rankT=0;NAV.tp=null;NAV.dmg=0;NAV.prog=0;NAV.oilT=60+Math.random()*60;NAV.wet=0;NAV.start=0;NAV.fin=0;NAV.dustT=0;
  NAV.pan=R.rc.c==='us'&&R.rc.y>=1910?0.32:-0.32;   // руль справа (Европа, ранние американцы) — механик слева; у американцев с 1910-х — наоборот
  if(AU.ctx&&AU.on.sfx&&reelVoiceOn())voiceLoad().then(()=>{if(NAV.R===R)navLines().forEach(t=>navBuf(t));}).catch(()=>{});}
function navBuf(text){const h=voiceHash(text,'nav');if(NAV.buf[h])return Promise.resolve(NAV.buf[h]);if(NAV.pend[h])return NAV.pend[h];if(!AU.ctx)return Promise.resolve(null);
  NAV.pend[h]=voiceLoad().then(()=>{if(!voiceDur(text,'nav'))return null;return fetch(voiceUrl(text,'nav')).then(r=>r.ok?r.arrayBuffer():null).then(ab=>ab?new Promise((ok,no)=>AU.ctx.decodeAudioData(ab,ok,no)):null);})
    .then(b=>{if(b)NAV.buf[h]=b;return b;}).catch(()=>null);return NAV.pend[h];}
// крик в открытой машине: без эха, чуть «в лоб», со стороны пассажира; громче, когда мотор ревёт
function navPlay(text){if(!AU.ctx||!AU.on.sfx||!reelVoiceOn())return;const b=NAV.buf[voiceHash(text,'nav')];if(!b){navBuf(text);return;}
  const c=AU.ctx,t=c.currentTime,s=c.createBufferSource(),hp=c.createBiquadFilter(),pk=c.createBiquadFilter(),g=c.createGain();s.buffer=b;
  hp.type='highpass';hp.frequency.value=150;pk.type='peaking';pk.frequency.value=2200;pk.Q.value=0.9;pk.gain.value=3;
  const me=R&&R.me,loud=me?clamp(0.95+0.35*clamp(me.rpm||0,0,1.1)+0.25*clamp((me.vx||0)/30,0,1),0.9,1.5):1;g.gain.value=1.25*loud;
  s.connect(hp);hp.connect(pk);pk.connect(g);let out=g;if(c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=NAV.pan||0;g.connect(p);out=p;}out.connect(AU.fx);s.start(t);}
// в очередь: важное (тормози, шлагбаум, прокол) вперёд; устаревшее (поворот уже проехали) — выбросить
function navSay(key,pri,ttl,cd){if(!NAV_L[key])return;const now=R.time;if(cd&&(NAV.cd[key]||-99)>now-cd)return;NAV.cd[key]=now;
  NAV.q=NAV.q.filter(x=>x.key!==key);NAV.q.push({key,pri:pri||3,t:now,ttl:ttl||3});}
function navFlush(){const now=R.time;NAV.q=NAV.q.filter(x=>now-x.t<x.ttl);if(!NAV.q.length||now<NAV.until)return;
  NAV.q.sort((a,b)=>b.pri-a.pri||a.t-b.t);const x=NAV.q.shift(),text=NAV_L[x.key],d=voiceDur(text,'nav')||Math.max(0.7,text.length/16);
  NAV.until=now+d+0.18;navPlay(text);navBubble(text,d);NAV.said[x.key]=(NAV.said[x.key]||0)+1;}
function navBubble(text,d){const el=document.getElementById('rNav');if(!el)return;el.lastChild.textContent=text;el.hidden=false;el.classList.remove('on');void el.offsetWidth;el.classList.add('on');
  clearTimeout(el._t);el._t=setTimeout(()=>{el.classList.remove('on');setTimeout(()=>{if(!el.classList.contains('on'))el.hidden=true;},250);},Math.max(1100,(d+0.6)*1000));}
// поворот впереди: первая дуга, её крутизна, сразу ли за ней обратная (S-изгиб)
function navScan(me,T,maxM){const n=T.n,st=T.step,N=Math.min(Math.round(maxM/st),n-1);let j0=-1,j1=-1,dir=0,kmax=0;
  for(let d=1;d<N;d++){let j=me.idx+d;if(T.closed)j%=n;else if(j>=n)break;const k=T.K[j];
    if(j0<0){if(Math.abs(k)>1/75){j0=d;dir=Math.sign(k);kmax=Math.abs(k);}}else if(Math.sign(k)===dir&&Math.abs(k)>1/160)kmax=Math.max(kmax,Math.abs(k));else{j1=d;break;}}
  if(j0<0)return null;if(j1<0)j1=j0+4;let s2=0;
  for(let d=j1;d<j1+Math.round(40/st);d++){let j=me.idx+d;if(T.closed)j%=n;else if(j>=n)break;const k=T.K[j];if(Math.abs(k)>1/75){if(Math.sign(k)===-dir)s2=1;break;}}
  return {d0:j0*st,d1:j1*st,dir,kmax,s2,at:Math.round((me.prog+j0*st)/15)};}
function navCurve(me,T,recon){const v=Math.max(0,me.vx),sc=navScan(me,T,Math.max(70,v*5.5));if(!sc)return;if(NAV.curve&&Math.abs(NAV.curve.at-sc.at)<=2)return;
  const mu=roadMuAt(T,me.idx)*me.grip*twAll(me)*1.08,vc=Math.sqrt(mu*GRAV/sc.kmax),lead=recon?3.9:2.7;
  // кричит заранее: за 2,7 с до поворота (с разведкой трассы — за 3,9 с), но не дальше 25–110 м
  if(sc.d0>Math.max(25,Math.min(110,v*lead))||sc.d0<6)return;
  const hair=1/sc.kmax<20,bdec=(me.brakeK||0.8)*mu*GRAV*0.8,need=v>vc?(v*v-vc*vc)/(2*bdec):0,vt=Math.max(8,me.vtop||25),sev=vc/vt;
  const right=sc.dir<0;   // кривизна < 0 — поворот вправо (как стрелка подсказки)
  NAV.curve={at:sc.at,vc};
  if(hair){navSay(right?'rh':'lh',8,1.6);return;}
  if(need>sc.d0*0.85){navSay(right?'r2':'l2',8,1.4);NAV.curve.brk=1;return;}
  // крутизна — по тому, сколько машина может на прямой: поворот, который проходят «в пол», он не называет
  if(sev<0.55||v>vc*1.04){navSay(sc.s2?(right?'sr':'sl'):(right?'r2':'l2'),6,1.5);return;}
  if(sev<0.82&&(recon||Math.random()<0.7))navSay(sc.s2?(right?'sr':'sl'):(right?'r':'l'),4,1.4);}
// тормози — если после крика «круто!» машина всё ещё не успевает
function navBrake(me,T){const C=NAV.curve;if(!C||!C.brk||C.brkSaid)return;const sc=navScan(me,T,80);if(!sc||Math.abs(sc.at-C.at)>2)return;
  const v=Math.max(0,me.vx),mu=roadMuAt(T,me.idx)*me.grip*twAll(me)*1.08,bdec=(me.brakeK||0.8)*mu*GRAV*0.8,need=v>C.vc?(v*v-C.vc*C.vc)/(2*bdec):0;
  if(need>sc.d0*0.95&&sc.d0<60&&!(me.brk>0.5)){C.brkSaid=1;navSay('brk',9,0.9);}}
// дорога впереди: мост, переезд, город, деревня, тоннель, серпантин, грязь, лужа, яма
function navRoad(me,T){const n=T.n,st=T.step,v=Math.max(0,me.vx),ahead=clamp(v*3.2,35,150),N=Math.round(ahead/st),S=T.segT;
  const at=d=>{let j=me.idx+d;if(T.closed)j=(j%n+n)%n;else if(j>=n)return -1;return j;};
  for(let d=Math.round(18/st);d<N;d++){const j=at(d);if(j<0)break;const p=at(d-1);
    if(T.bridge&&T.bridge[j]&&!(p>=0&&T.bridge[p])&&!NAV.said['br|'+Math.round(j/20)]){NAV.said['br|'+Math.round(j/20)]=1;navSay('bridge',4,2,4);}
    if(T.tunAt&&T.tunAt[j]&&!(p>=0&&T.tunAt[p])&&!NAV.said['tu|'+Math.round(j/20)]){NAV.said['tu|'+Math.round(j/20)]=1;navSay('tunnel',4,2,6);}
    if(S){const sg=S[j],sp=p>=0?S[p]:sg;if(sg!==sp){const z=sg+'|'+Math.round(j/30);if(!NAV.said[z]){NAV.said[z]=1;
      if(sg===RSEG.town)navSay('town',5,2.5,20);else if(sg===RSEG.village)navSay(Math.random()<0.2?'geese':'vill',4,2.5,25);else if(sg===RSEG.serp)navSay('serp',5,2.5,60);}}}}
  // переезд: шлагбаум закрывается — стой!
  for(const rl of T.rails||[]){if(rl.duel)continue;let di=rl.i-me.idx;if(T.closed)di=((di%n)+n*1.5)%n-n/2;const dm=di*st;if(dm<15||dm>ahead+30)continue;
    const closing=(rl.gate||0)>0.1||(rl.st&&rl.st.state===1&&Math.abs(rl.st.s)<260);
    if(closing&&!NAV.said['gate|'+rl.i]){NAV.said['gate|'+rl.i]=1;navSay('gate',10,1.6);}else if(!NAV.said['rail|'+rl.i]){NAV.said['rail|'+rl.i]=1;navSay('rail',4,2);}}
  // пятна грязи и лужи на пути машины
  if(T.patchAt)for(let d=Math.round(20/st);d<Math.min(N,Math.round(70/st));d++){const j=at(d);if(j<0)break;const k=T.patchAt[j];if(!k)continue;const P=T.patches[k-1];if(!P||NAV.said['pt|'+k])continue;
    if(P.rain&&(R.wetK||0)<0.45)continue;if(Math.abs(P.lat-me.lat)>P.b+1.2)continue;NAV.said['pt|'+k]=1;if(P.kind!=='mudhole'&&P.b<1.4&&!(R.wetK>0.45))continue;navSay(P.kind==='mudhole'?'mud':'water',P.kind==='mudhole'?5:3,1.6,P.kind==='mudhole'?12:15);break;}
  // глубокая яма прямо по ходу (в колее или посреди дороги)
  const G=T.rg;if(G&&G.at)for(let d=Math.round(18/st);d<Math.min(N,Math.round(55/st));d++){const j=at(d);if(j<0)break;const L=G.at.get(j);if(!L)continue;
    for(const o of L){if(o.d<0.11||NAV.said['ph|'+o.id])continue;const dl=o.lat-me.lat;if(Math.abs(dl)>1.4)continue;NAV.said['ph|'+o.id]=1;
      navSay(Math.abs(dl)<0.45?'hole':dl>0?'holeL':'holeR',5,1.1,8);return;}}}
// соперники: догоняют сзади, обходят сбоку, мы обошли; место в гонке
function navTraffic(me){const cars=R.cars.filter(c=>c!==me&&!c.dnf&&c.fin===null);let behind=null;
  for(const c of cars){const dp=c.prog-me.prog;if(dp<-4&&dp>-28&&c.vx>me.vx+1.5)behind=c;
    if(dp>=-4&&dp<=3&&Math.abs(c.lat-me.lat)<5&&c.vx>me.vx+0.8&&!NAV.said['ps|'+c.num+'|'+Math.floor(R.time/12)]){NAV.said['ps|'+c.num+'|'+Math.floor(R.time/12)]=1;navSay(c.lat>me.lat?'passL':'passR',6,1.2,10);}}
  if(behind)navSay('behind',4,2,20);
  // пыль: на сухом грунте за машиной впереди ничего не видно
  const ahead=cars.find(c=>c.prog-me.prog>5&&c.prog-me.prog<32);if(ahead&&!(R.wetK>0.3)&&['dirt','macadam','mount','sand','field','verge'].includes(me.surf||'')&&me.vx>12)navSay('dust',3,2,60);
  if(R.scn&&R.scn.timed||R.t<8)return;
  const rank=1+R.cars.filter(c=>c!==me&&!c.dnf&&(c.fin!==null||c.prog>me.prog)).length;
  if(NAV.rank&&rank!==NAV.rank&&R.time-NAV.rankT>5){NAV.rankT=R.time;if(rank<NAV.rank){navSay(rank<=3?['p1','p2','p3'][rank-1]:'past',5,2.5);}else navSay('lost',4,2,10);}
  NAV.rank=rank;}
// машина: проколы по колёсам, обод, мотор, масло, бензин, стуки; удар
function navCar(me,T){if(me.tp){const was=NAV.tp||[0,0,0,0];for(let k=0;k<4;k++){if(me.tp[k]===1&&!was[k])navSay(NAV_PK[k],8,2.5);if(me.tp[k]===2&&was[k]!==2)navSay('rim',7,2.5,8);}NAV.tp=me.tp.slice();}
  if(me.heat>86)navSay('heat',6,2.5,30);
  if(R.rc.y<1914&&me.vx>14){NAV.oilT-=NAV.dt||0;if(NAV.oilT<=0){NAV.oilT=90+Math.random()*90;navSay('oil',1,2);}}
  if(me.fuelRate&&me.fuel<14&&me.fuel>0)navSay(T.cfg.pits?'fuelBox':'fuel',6,3,45);
  if(me.dmg>55&&!NAV.said.dmg){NAV.said.dmg=1;navSay('dmg',4,3);}
  if(me.dmg-NAV.dmg>7){navSay('crash',9,0.8,3);NAV.okT=R.time+2.2;}NAV.dmg=me.dmg;
  if(NAV.okT&&R.time>NAV.okT&&me.vx<6&&!me.dnf){NAV.okT=0;navSay('ok',5,3);}else if(NAV.okT&&R.time>NAV.okT+4)NAV.okT=0;}
// путь: старт, полпути, скоро финиш, последний круг; дождь
function navProgress(me,T){const cfg=T.cfg;
  if(!NAV.start&&R.t>-2.6&&R.t<-0.4){NAV.start=1;navSay('start',7,2.5);}
  if(R.t<1)return;
  if(T.closed&&cfg.laps>1){if(me.lap===cfg.laps-1&&!NAV.said.last&&me.idx<20){NAV.said.last=1;navSay('last',6,3);}}
  else{const f=me.prog/Math.max(1,T.raceLen);if(f>0.5&&!NAV.said.half){NAV.said.half=1;navSay('half',3,4);}
    if(f>0.85&&!NAV.said.near){NAV.said.near=1;navSay('near',4,4);}if(T.raceLen-me.prog<400&&!NAV.said.fin1){NAV.said.fin1=1;navSay('fin1',6,3);}}
  if((R.wetK||0)>0.35&&!NAV.wet){NAV.wet=1;navSay('rain',4,4);}}
function navTick(){if(!R)return;if(NAV.R!==R)navReset();NAV.dt=clamp(R.time-(NAV.lt??R.time),0,0.2);NAV.lt=R.time;if(!navActive())return;const me=R.me,T=R.trk;
  if(me.fin!==null||me.dnf){if(!NAV.fin){NAV.fin=1;NAV.q=[];NAV.until=0;navSay(me.dnf?'dnf':navRank(me)===1?'win':'fin',9,4);}navFlush();return;}
  if(R.t>0&&!(me.stopT>0)&&!(me.pitT>0)&&!me.svc){const recon=typeof kitHas==='function'&&kitHas(G,'recon');
    try{navCurve(me,T,recon);navBrake(me,T);navRoad(me,T);}catch(e){console.warn('nav road',e);}
    try{navTraffic(me);}catch(e){console.warn('nav traffic',e);}}
  try{navCar(me,T);navProgress(me,T);}catch(e){console.warn('nav car',e);}
  navFlush();}
function navRank(me){return 1+R.cars.filter(c=>c!==me&&c.fin!==null&&c.fin<me.fin).length;}
// титры сценария (толпа на дороге, контроль, буря, перевал…) — механик кричит то же самое
const NAV_EV={road:'crowd',post:'post',storm:'storm',pass:'pass',summit:'summit',desc:'desc',climb:'climb',sbag:'sbag',guard:'crowd'};
function navEv(e){if(!navActive()||!e||e.k==='chron')return;const k=NAV_EV[e.k];if(k)navSay(k,6,3,8);}
