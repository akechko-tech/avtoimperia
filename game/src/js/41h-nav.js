/* ================= 0.30: МЕХАНИК РЯДОМ С ГОНЩИКОМ ВЕДЁТ ПО МАРШРУТУ ГОЛОСОМ =================
   До 1925 года в гоночной машине рядом с гонщиком сидел механик. Он не читал стенограмму, как штурман ралли
   полвека спустя: смотрел на дорогу вперёд, оглядывался назад, следил за шинами, маслом и бензином и КРИЧАЛ —
   сквозь ветер и рёв мотора, коротко: «Круто вправо!», «Яма!», «Переезд!», «Сзади догоняют!», «Заднее левое спустило!».
   Голос — живой, записанный заранее (Silero, голос eugene, обработан как крик в открытой машине: выше, быстрее,
   «в лоб»), в игре — сухо, без эха, со стороны пассажира. Без звука — те же слова пузырём под подсказкой поворота.
   Разведка трассы (оснащение команды) — механик знает дорогу: подсказывает раньше и не пропускает поворотов.
   0.31: повороты механик читает по легенде трассы, как штурман ралли (41i-legend.js); здесь — крики о том, что
   случается по ходу: шлагбаум закрывается, яма под колесом, обгоны, проколы, мотор, бензин. */
const NAV_L={
  brk:'Тормози!',gate:'Шлагбаум! Стой!',water:'Лужа!',hole:'Яма!',holeL:'Яма слева!',holeR:'Яма справа!',
  crowd:'Люди на дороге!',post:'Контроль! Тормози!',storm:'Дерево поперёк!',pass:'Перевал! Держи газ!',summit:'Вершина! Дальше вниз!',desc:'Спуск! Береги тормоза!',climb:'Подъём! Переключай!',sbag:'Мешки! Шикана!',
  behind:'Сзади догоняют!',passL:'Слева обходит!',passR:'Справа обходит!',past:'Обошли!',lost:'Нас обошли!',p1:'Мы первые!',p2:'Мы вторые!',p3:'Мы третьи!',dust:'Пыль! Держи прямо!',
  pFL:'Переднее левое спустило!',pFR:'Переднее правое спустило!',pRL:'Заднее левое спустило!',pRR:'Заднее правое спустило!',rim:'Едем на ободе!',
  heat:'Мотор кипит! Сбавь!',oil:'Качаю масло!',fuel:'Бензина мало!',fuelBox:'Бензин кончается! В боксы!',dmg:'Стучит что-то! Береги машину!',
  crash:'Держись!',ok:'Цел? Поехали!',start:'Ну, с Богом!',half:'Полпути позади!',near:'Скоро финиш!',fin1:'Финиш близко! Жми!',last:'Последний круг!',
  fin:'Финиш! Доехали!',win:'Победа! Мы первые!',dnf:'Всё, приехали.',rain:'Дождь! Скользко будет!',dog:'Собака!'};
const NAV_PK=['pFL','pFR','pRL','pRR'];
function navLines(){return Object.values(NAV_L).concat(typeof legLines==='function'?legLines():[]);}
const NAV={buf:{},pend:{},q:[],until:0,cd:{},said:{},R:null};
// голос механика есть только там, где он сидит в машине: до 1925 года (и пока он не в больнице)
function navActive(){const me=R&&R.me;return !!(me&&R.mode==='drive'&&me.mech&&!R.film&&!R.demo&&R.trk&&(typeof legMode!=='function'||legMode()!=='off'));}
function navReset(){NAV.R=R;NAV.lt=undefined;NAV.legI=0;NAV.legK=undefined;NAV.legSaid=0;NAV.brkC=null;NAV.srcs=[];NAV.q=[];NAV.until=0;NAV.cd={};NAV.said={};NAV.curve=null;NAV.rank=0;NAV.rankT=0;NAV.tp=null;NAV.dmg=0;NAV.prog=0;NAV.oilT=60+Math.random()*60;NAV.wet=0;NAV.start=0;NAV.fin=0;NAV.dustT=0;
  NAV.pan=R.rc.c==='us'&&R.rc.y>=1910?0.32:-0.32;   // руль справа (Европа, ранние американцы) — механик слева; у американцев с 1910-х — наоборот
  if(AU.ctx&&AU.on.sfx&&reelVoiceOn())voiceLoad().then(()=>{if(NAV.R===R)navLines().forEach(t=>navBuf(t));}).catch(()=>{});}
function navBuf(text){const h=voiceHash(text,'nav');if(NAV.buf[h])return Promise.resolve(NAV.buf[h]);if(NAV.pend[h])return NAV.pend[h];if(!AU.ctx)return Promise.resolve(null);
  NAV.pend[h]=voiceLoad().then(()=>{if(!voiceDur(text,'nav'))return null;return fetch(voiceUrl(text,'nav')).then(r=>r.ok?r.arrayBuffer():null).then(ab=>ab?new Promise((ok,no)=>AU.ctx.decodeAudioData(ab,ok,no)):null);})
    .then(b=>{if(b)NAV.buf[h]=b;return b;}).catch(()=>null);return NAV.pend[h];}
// крик в открытой машине: без эха, чуть «в лоб», со стороны пассажира; громче, когда мотор ревёт.
// 0.31: фраза — из нескольких слов подряд (легенда: «Правый сорок пять», «сто», «Левый девяносто»): тишину по краям записи срезаем
function navPlaySeq(list){if(!AU.ctx||!AU.on.sfx||!reelVoiceOn())return 0;const c=AU.ctx;let t=c.currentTime+0.03;const t0=t;
  const hp=c.createBiquadFilter(),pk=c.createBiquadFilter(),g=c.createGain();hp.type='highpass';hp.frequency.value=150;pk.type='peaking';pk.frequency.value=2200;pk.Q.value=0.9;pk.gain.value=3;
  const me=R&&R.me,loud=me?clamp(0.95+0.35*clamp(me.rpm||0,0,1.1)+0.25*clamp((me.vx||0)/30,0,1),0.9,1.5):1;g.gain.value=1.25*loud;
  hp.connect(pk);pk.connect(g);let out=g;if(c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=NAV.pan||0;g.connect(p);out=p;}out.connect(AU.fx);
  const srcs=[];list.forEach((text,k)=>{const b=NAV.buf[voiceHash(text,'nav')];if(!b){navBuf(text);return;}const s=c.createBufferSource();s.buffer=b;s.connect(hp);
    const off=k?0.04:0,dur=Math.max(0.12,b.duration-off-(k<list.length-1?0.13:0));s.start(t,off);srcs.push(s);t+=dur;});
  NAV.srcs=srcs;return srcs.length?t-t0:0;}
function navPlay(text){return navPlaySeq([text]);}
function navStopVoice(){(NAV.srcs||[]).forEach(s=>{try{s.stop();}catch(_){}});NAV.srcs=[];}
// сказать: слова (голос) и подпись; длительность — по записи, без записи — по числу букв
function navSpeak(texts,subT,pri){const now=R.time;let d=0;texts.forEach((t,k)=>{d+=Math.max(0.25,(voiceDur(t,'nav')||t.length/13)-(k?0.14:0.05));});
  const real=navPlaySeq(texts);if(real)d=real;NAV.until=now+d+0.2;navBubble(subT||texts.join(' '),d);}
// в очередь: важное (тормози, шлагбаум, прокол) вперёд; устаревшее (поворот уже проехали) — выбросить
function navSay(key,pri,ttl,cd){if(!NAV_L[key])return;const now=R.time;if(cd&&(NAV.cd[key]||-99)>now-cd)return;NAV.cd[key]=now;
  NAV.q=NAV.q.filter(x=>x.key!==key);NAV.q.push({key,pri:pri||3,t:now,ttl:ttl||3});
  // «Тормози!», шлагбаум, удар — перебивают легенду на полуслове
  if((pri||0)>=9&&now<NAV.until){navStopVoice();NAV.until=now;}}
// крики ждут, пока легенда не дочитана и следующий поворот близко (штурман не отвлекается на мелочи перед поворотом)
function navFlush(){const now=R.time;NAV.q=NAV.q.filter(x=>now-x.t<x.ttl);if(!NAV.q.length||now<NAV.until)return;
  NAV.q.sort((a,b)=>b.pri-a.pri||a.t-b.t);const x=NAV.q[0];
  if(x.pri<7&&NAV.legNear)return;
  NAV.q.shift();const text=NAV_L[x.key];navSpeak([text],text,x.pri);NAV.said[x.key]=(NAV.said[x.key]||0)+1;}
// 0.31: подписи на экране нет — механик только говорит (последняя фраза — для тестов)
function navBubble(text,d){NAV.last=text;}
// по ходу: шлагбаум закрывается (стой!), лужа в дождь, глубокая яма прямо под колесом — то, чего нет в легенде
function navRoad(me,T){const n=T.n,st=T.step,v=Math.max(0,me.vx),ahead=clamp(v*3.2,35,150),N=Math.round(ahead/st);
  const at=d=>{let j=me.idx+d;if(T.closed)j=(j%n+n)%n;else if(j>=n)return -1;return j;};
  for(const rl of T.rails||[]){if(rl.duel)continue;let di=rl.i-me.idx;if(T.closed)di=((di%n)+n*1.5)%n-n/2;const dm=di*st;if(dm<15||dm>ahead+30)continue;
    const closing=(rl.gate||0)>0.1||(rl.st&&rl.st.state===1&&Math.abs(rl.st.s)<260);
    if(closing&&!NAV.said['gate|'+rl.i]){NAV.said['gate|'+rl.i]=1;navSay('gate',10,1.6);}}
  if(T.patchAt&&(R.wetK||0)>0.45)for(let d=Math.round(20/st);d<Math.min(N,Math.round(70/st));d++){const j=at(d);if(j<0)break;const k=T.patchAt[j];if(!k)continue;const P=T.patches[k-1];if(!P||NAV.said['pt|'+k])continue;
    if(P.kind==='mudhole'||P.b<1.4||Math.abs(P.lat-me.lat)>P.b+1.2)continue;NAV.said['pt|'+k]=1;navSay('water',3,1.6,15);break;}
  const G=T.rg;if(G&&G.at)for(let d=Math.round(18/st);d<Math.min(N,Math.round(50/st));d++){const j=at(d);if(j<0)break;const L=G.at.get(j);if(!L)continue;
    for(const o of L){if(o.d<0.13||NAV.said['ph|'+o.id])continue;const dl=o.lat-me.lat;if(Math.abs(dl)>1.2)continue;NAV.said['ph|'+o.id]=1;
      navSay(Math.abs(dl)<0.45?'hole':dl>0?'holeL':'holeR',5,1.1,10);return;}}}
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
  NAV.legNear=false;
  if(R.t>-1&&!(me.stopT>0)&&!(me.pitT>0)&&!me.svc){const recon=typeof kitHas==='function'&&kitHas(G,'recon');
    try{legTick(me,T,recon);legBrake(me,T);const LG=T.leg,c=LG&&LG.L[NAV.legI];if(c&&legMode()!=='off'){const d=(c.k0-legPos(T,me))*T.step;NAV.legNear=d<clamp(Math.max(5,me.vx)*4.3+30,70,300)*1.35;}}catch(e){console.warn('nav legend',e);}
    if(R.t>0){try{navRoad(me,T);}catch(e){console.warn('nav road',e);}
      try{navTraffic(me);}catch(e){console.warn('nav traffic',e);}}}
  try{navCar(me,T);navProgress(me,T);}catch(e){console.warn('nav car',e);}
  navFlush();}
function navRank(me){return 1+R.cars.filter(c=>c!==me&&c.fin!==null&&c.fin<me.fin).length;}
// титры сценария (толпа на дороге, контроль, буря, перевал…) — механик кричит то же самое
const NAV_EV={road:'crowd',post:'post',storm:'storm',pass:'pass',summit:'summit',desc:'desc',climb:'climb',sbag:'sbag',guard:'crowd'};
function navEv(e){if(!navActive()||!e||e.k==='chron')return;const k=NAV_EV[e.k];if(k)navSay(k,6,3,8);}
