/* ================= 0.19: звуки мира в гонке и голос с трибун =================
   Записи с Викисклада (общественное достояние и свободные лицензии): трибуны, толпа у дороги, аплодисменты, птицы по месту
   и времени суток (утренний хор, жаворонок над полем, воробьи в городе, кукушка в горах, цикады на юге, сверчки ночью),
   колокола, лай собак, петух, извозчик на булыжнике, духовой оркестр, паровоз, дождь, гром, ручей у моста, овцы.
   Рожки и клаксоны соседей по гонке — синтез: груша-рожок (1890–1900-е), «а-у-га» Klaxon (с 1908), электрический сигнал (1920-е).
   Диктор с трибуны говорит в рупор (запись голоса + фильтр рупора и эхо трибун); в 1920-е — «как по радио». */
const AMB={idx:null,loadP:null,buf:{},pend:{},beds:{},bus:null,on:false,feat:null,cd:{},seen:{},t:0,ann:{buf:{},pend:{},busy:0,q:[],said:{}}};
const SFX_REMOTE=()=>(location.protocol==='file:'?VOICE_REMOTE:'');
function ambIndex(){if(AMB.idx)return Promise.resolve(AMB.idx);if(AMB.loadP)return AMB.loadP;
  AMB.loadP=new Promise(res=>{if(window.SFX_INDEX){AMB.idx=window.SFX_INDEX;res(AMB.idx);return;}
    try{const s=document.createElement('script');s.src=SFX_REMOTE()+'sfx/index.js';s.async=true;s.onload=()=>{AMB.idx=window.SFX_INDEX||{};res(AMB.idx);};s.onerror=()=>{AMB.idx={};res(AMB.idx);};document.head.appendChild(s);}catch(e){AMB.idx={};res(AMB.idx);}});
  return AMB.loadP;}
// звук по имени: скачать и разобрать один раз
function ambBuf(id){if(AMB.buf[id])return Promise.resolve(AMB.buf[id]);if(AMB.pend[id])return AMB.pend[id];if(!AU.ctx)return Promise.resolve(null);
  AMB.pend[id]=ambIndex().then(ix=>{if(!ix||!ix[id])return null;return fetch(SFX_REMOTE()+'sfx/'+id+'.mp3').then(r=>r.ok?r.arrayBuffer():null).then(ab=>ab?new Promise((ok,no)=>AU.ctx.decodeAudioData(ab,ok,no)):null);})
    .then(b=>{if(b)AMB.buf[id]=ambLoopable(b);return AMB.buf[id]||null;}).catch(()=>null);return AMB.pend[id];}
// петля без щелчка: хвост плавно переходит в начало
function ambLoopable(b){try{const n=b.length,x=Math.min(Math.floor(b.sampleRate*0.6),Math.floor(n/4));if(n<b.sampleRate*3)return b;
  const out=AU.ctx.createBuffer(b.numberOfChannels,n-x,b.sampleRate);for(let ch=0;ch<b.numberOfChannels;ch++){const s=b.getChannelData(ch),d=out.getChannelData(ch);
    for(let i=0;i<n-x;i++)d[i]=s[i];for(let i=0;i<x;i++){const k=i/x;d[i]=s[i]*k+s[n-x+i]*(1-k);}}return out;}catch(_){return b;}}
/* ---------- особенности трассы: где толпа, церкви, города, мосты, лес, поле ---------- */
function ambFeatures(T){const n=T.n,crowd=new Float32Array(n),church=[],set=SCEN_SETS[T.cfg.host]||{},ch=new Set([set.church,'church','campanile','minaret','spire','cathedral','church_ru'].filter(Boolean));
  for(let i=0;i<n;i++){const L=T.spr&&T.spr[i];if(!L)continue;for(const it of L){if(it.k==='p'&&it.t==='crowd')crowd[i]+=8;else if(it.t==='stand')crowd[i]+=40;else if(ch.has(it.t))church.push(i);}}
  (T.lm||[]).forEach(q=>{if(/church|campanile|minaret|kremlin|cathedral/.test(q.t))church.push(q.i);});
  return {crowd,church:[...new Set(church)].sort((a,b)=>a-b)};}
function ambNear(F,i,rad){const T=R.trk,n=T.n,st=T.step,k=Math.round(rad/st);let s=0;for(let d=-k;d<=k;d+=2){let j=i+d;if(T.closed)j=(j%n+n)%n;else if(j<0||j>=n)continue;const w=1-Math.abs(d)/(k+1);s+=F[j]*w;}return s;}
/* ---------- фоновые петли ---------- */
function ambBed(id,vol,dt,rate){const B=AMB.beds[id]||(AMB.beds[id]={id,g:null,src:null,v:0,idle:0});B.v=vol;
  if(vol>0.003&&!B.src&&!B.loading){const b=AMB.buf[id];if(b){const g=AU.ctx.createGain();g.gain.value=0;g.connect(AMB.bus);const s=AU.ctx.createBufferSource();s.buffer=b;s.loop=true;if(rate)s.playbackRate.value=rate;s.connect(g);s.start(0,Math.random()*b.duration);B.src=s;B.g=g;}
    else{B.loading=1;ambBuf(id).then(()=>{B.loading=0;});}}
  if(B.g){B.g.gain.setTargetAtTime(vol,AU.ctx.currentTime,0.6);if(vol<0.003){B.idle+=dt;if(B.idle>6){try{B.src.stop();}catch(_){}B.src=null;B.g.disconnect();B.g=null;B.idle=0;}}else B.idle=0;}}
function ambOnce(id,vol,pan,rate){const b=AMB.buf[id];if(!b){ambBuf(id);return false;}const c=AU.ctx,s=c.createBufferSource(),g=c.createGain();s.buffer=b;if(rate)s.playbackRate.value=rate;g.gain.value=vol;
  let out=g;if(c.createStereoPanner&&pan){const p=c.createStereoPanner();p.pan.value=clamp(pan,-1,1);g.connect(p);out=p;}out.connect(AMB.bus);s.connect(g);s.start();return true;}
function ambCool(key,sec){const t=AU.ctx.currentTime;if((AMB.cd[key]||-1e9)>t)return false;AMB.cd[key]=t+sec;return true;}
/* ---------- рожки и клаксоны (синтез) ---------- */
function hornSfx(y,vol,pan){if(!AU.ctx||!AU.on.sfx)return;const c=AU.ctx,t=c.currentTime,g=c.createGain(),f=c.createBiquadFilter(),o=c.createOscillator();let out=g;
  if(c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=clamp(pan||0,-1,1);g.connect(p);out=p;}out.connect(AMB.bus||AU.fx);
  if(y<1908){// груша-рожок: язычок и раструб — «ба-ап», с понижением тона
    o.type='sawtooth';const f0=330+Math.random()*60;o.frequency.setValueAtTime(f0*1.08,t);o.frequency.exponentialRampToValueAtTime(f0*0.93,t+0.32);f.type='bandpass';f.frequency.value=900;f.Q.value=2.5;
    o.connect(f);f.connect(g);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+0.03);g.gain.setValueAtTime(vol,t+0.22);g.gain.exponentialRampToValueAtTime(0.0001,t+0.4);o.start(t);o.stop(t+0.45);
    if(Math.random()<0.5){const o2=c.createOscillator();o2.type='sawtooth';o2.frequency.setValueAtTime(f0*1.1,t+0.5);o2.frequency.exponentialRampToValueAtTime(f0*0.95,t+0.75);o2.connect(f);const g2=g;o2.start(t+0.5);o2.stop(t+0.8);g.gain.setValueAtTime(0.0001,t+0.48);g.gain.exponentialRampToValueAtTime(vol*0.9,t+0.52);g.gain.exponentialRampToValueAtTime(0.0001,t+0.8);}}
  else if(y<1922){// Klaxon: мотор трёт мембрану — «а-у-га» с подъёмом и спадом
    o.type='sawtooth';o.frequency.setValueAtTime(180,t);o.frequency.linearRampToValueAtTime(420,t+0.25);o.frequency.setValueAtTime(420,t+0.5);o.frequency.linearRampToValueAtTime(330,t+0.75);
    const lf=c.createOscillator(),lg=c.createGain();lf.frequency.value=38;lg.gain.value=35;lf.connect(lg);lg.connect(o.frequency);f.type='bandpass';f.frequency.value=1100;f.Q.value=1.6;
    o.connect(f);f.connect(g);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+0.08);g.gain.setValueAtTime(vol,t+0.65);g.gain.exponentialRampToValueAtTime(0.0001,t+0.85);o.start(t);lf.start(t);o.stop(t+0.9);lf.stop(t+0.9);}
  else{// электрический сигнал: два тона, короткие гудки
    const o2=c.createOscillator();o.type='square';o2.type='square';o.frequency.value=392;o2.frequency.value=494;f.type='lowpass';f.frequency.value=2400;o.connect(f);o2.connect(f);f.connect(g);
    [0,0.28].forEach(d=>{g.gain.setValueAtTime(0.0001,t+d);g.gain.exponentialRampToValueAtTime(vol*0.6,t+d+0.02);g.gain.setValueAtTime(vol*0.6,t+d+0.18);g.gain.exponentialRampToValueAtTime(0.0001,t+d+0.22);});
    o.start(t);o2.start(t);o.stop(t+0.55);o2.stop(t+0.55);}}
/* ---------- диктор с трибуны: рупор ---------- */
// Строки диктора (голос eugene) — их записывает конвейер голоса (tools/export_voice.js)
const ANN={ready:'Внимание! Приготовиться!',count:'Три! Два! Один!',go:'Марш!',last:'Последний круг!',crash:'Авария на трассе!',rain:'Дождь! Будьте осторожны на поворотах!',
  fin:'Финиш!',overtake:'Какой обгон!',pits:'Машина заходит в боксы.',crowd:'Зрители, освободите дорогу!',pace:'Машина-лидер уходит с трассы. Старт с хода!',lemans:'Гонщики, к машинам!',
  neutral:'Нейтрализация! Сбавьте ход!',record:'Лучший круг гонки!',night:'Зажигайте фонари!'};
const ANN_NUM=['','первый','второй','третий','четвёртый','пятый','шестой','седьмой','восьмой','девятый','десятый','одиннадцатый','двенадцатый','тринадцатый','четырнадцатый','пятнадцатый','шестнадцатый','семнадцатый','восемнадцатый','девятнадцатый','двадцатый',
  'двадцать первый','двадцать второй','двадцать третий','двадцать четвёртый','двадцать пятый','двадцать шестой','двадцать седьмой','двадцать восьмой','двадцать девятый','тридцатый'];
const annGo=n=>`Номер ${ANN_NUM[n]||n} — пошёл!`,annLead=n=>`Лидирует ${ANN_NUM[n]||n} номер!`,annWin=n=>`Победитель — ${ANN_NUM[n]||n} номер!`;
function annLines(){const L=Object.values(ANN);for(let k=1;k<=30;k++)L.push(annGo(k),annLead(k),annWin(k));return L;}
function annBuf(text){const A=AMB.ann,h=voiceHash(text,'eugene');if(A.buf[h])return Promise.resolve(A.buf[h]);if(A.pend[h])return A.pend[h];if(!AU.ctx)return Promise.resolve(null);
  A.pend[h]=voiceLoad().then(()=>{if(!voiceDur(text,'eugene'))return null;return fetch(voiceUrl(text,'eugene')).then(r=>r.ok?r.arrayBuffer():null).then(ab=>ab?new Promise((ok,no)=>AU.ctx.decodeAudioData(ab,ok,no)):null);})
    .then(b=>{if(b)A.buf[h]=b;return b;}).catch(()=>null);return A.pend[h];}
// цепочка рупора: полоса 450–3600 Гц, «жесть» раструба, перегруз, эхо трибун
function annChain(radio){const c=AU.ctx,hp=c.createBiquadFilter(),pk=c.createBiquadFilter(),lp=c.createBiquadFilter(),ws=c.createWaveShaper(),g=c.createGain(),dl=c.createDelay(0.5),fb=c.createGain(),wet=c.createGain();
  hp.type='highpass';hp.frequency.value=radio?280:480;pk.type='peaking';pk.frequency.value=radio?1800:2100;pk.Q.value=1.2;pk.gain.value=radio?4:8;lp.type='lowpass';lp.frequency.value=radio?3400:3900;
  const cur=new Float32Array(1024);for(let i=0;i<1024;i++){const x=i/512-1;cur[i]=Math.tanh(x*(radio?1.6:2.6))/Math.tanh(radio?1.6:2.6);}ws.curve=cur;
  hp.connect(pk);pk.connect(lp);lp.connect(ws);ws.connect(g);dl.delayTime.value=radio?0.05:0.16;fb.gain.value=radio?0.1:0.32;wet.gain.value=radio?0.08:0.3;g.connect(dl);dl.connect(fb);fb.connect(dl);dl.connect(wet);
  return {inp:hp,g,wet};}
function annPlay(text,vol,pan){if(!AU.ctx||!AU.on.sfx||!R||R.mode==='sim')return;const A=AMB.ann,radio=R.rc.y>=1922;
  annBuf(text).then(b=>{if(!b||!AU.ctx||!R)return;const c=AU.ctx,t=c.currentTime;if(A.busy>t+0.1)return;A.busy=t+b.duration;
    const s=c.createBufferSource();s.buffer=b;const ch=annChain(radio);s.connect(ch.inp);let out=c.createGain();out.gain.value=vol*1.4;ch.g.connect(out);ch.wet.connect(out);
    if(c.createStereoPanner&&pan){const p=c.createStereoPanner();p.pan.value=clamp(pan,-1,1);out.connect(p);p.connect(AU.fx);}else out.connect(AU.fx);s.start(t);});}
// громкость диктора: он у трибун (старт и финиш); вдали не слышен (кроме «радио» 1920-х)
function annVol(){const T=R.trk,me=R.follow;if(!me)return 0;if(R.rc.y>=1922&&R.gl)return 0.6;const n=T.n,dI=i=>{let d=Math.abs(me.idx-i);if(T.closed)d=Math.min(d,n-d);return d*T.step;};
  const d=Math.min(dI(T.finishIdx),T.closed?1e9:dI(T.startIdx));return d<220?clamp(1.15-d/220,0.15,1):0;}
function annCall(key,num){if(!R)return;const v=annVol();if(v<=0)return;const text=key==='go_n'?annGo(num):key==='lead'?annLead(num):key==='win'?annWin(num):ANN[key];if(text)annPlay(text,v,0);}
// титры с голосом: рассказчик кинохроники (живой голос, если записан)
function annSay(text,kind){if(!R||R.mode==='sim'||!AU.on.sfx||!reelVoiceOn())return;try{const say=scnSpeech(text);if(voiceDur(say,'aidar')&&!(VOICE.cb))voiceSay(say,'aidar');}catch(_){}}
/* ---------- гонка: старт, такт, стоп ---------- */
function ambStart(){if(!AU.ctx||!R||R.mode==='sim')return;ambIndex();const c=AU.ctx;if(AMB.bus){try{AMB.bus.disconnect();}catch(_){}}
  AMB.bus=c.createGain();AMB.bus.gain.value=0.9;AMB.bus.connect(AU.fx);AMB.beds={};AMB.cd={};AMB.seen={};AMB.on=true;AMB.t=0;AMB.lastLead=null;AMB.lapSaid={};
  try{AMB.feat=ambFeatures(R.trk);}catch(e){AMB.feat={crowd:new Float32Array(R.trk.n),church:[]};}
  // заранее — самое нужное: трибуны, толпа, птицы
  ['crowd_big','crowd_murmur','crowd_race','applause','birds_town','birds_forest','skylark','rain'].forEach(id=>ambBuf(id));
  const L=[ANN.ready,ANN.count,ANN.go];if(R.me)L.push(annGo(R.me.num||1));L.forEach(t=>annBuf(t));}
function ambStop(){AMB.on=false;const t=AU.ctx?AU.ctx.currentTime:0;Object.values(AMB.beds).forEach(B=>{if(B.g){B.g.gain.setTargetAtTime(0,t,0.3);const s=B.src;setTimeout(()=>{try{s.stop();}catch(_){}},1500);}});AMB.beds={};}
function ambTick(dt){if(!AMB.on||!R||!AU.ctx)return;const T=R.trk,me=R.follow;if(!me)return;AMB.t+=dt;const F=AMB.feat,S=R.scn,y=R.rc.y,mon=R.rc.m||5;
  const i=me.idx,sg=segAt(T,i),town=sg===RSEG.town||(T.town&&T.town[i]),vill=sg===RSEG.village,forest=sg===RSEG.forest||sg===RSEG.avenue||sg===RSEG.vine,mount=sg===RSEG.serp||T.cfg.uphill,inT=me.tun;
  const hh=S?((scnHour()%24)+24)%24:12,el=S?scnSun(hh,mon,S.lat||47).el*57.3:40,night=el<-4,dawn=!night&&el<12&&hh<12,rain=R.rainK||0,sp=Math.abs(me.vx||0);
  const q=inT?0.15:1,wind=clamp(1-sp/40,0.35,1);// на скорости ветер и мотор забивают тихие звуки
  // птицы: по месту и времени суток; в дождь почти молчат
  const summer=mon>=3&&mon<=8,south=['it','ly','es','mc'].includes(T.cfg.host);
  const bK=(night?0:1)*(1-rain*0.85)*q*wind*(T.cfg.oval?0.25:1);
  ambBed('birds_dawn',dawn?0.5*bK:0,dt);
  ambBed('birds_town',!dawn&&(town||vill)?0.34*bK:0,dt);
  ambBed('birds_forest',!dawn&&forest?0.42*bK:0,dt);
  ambBed('skylark',!dawn&&summer&&!town&&!forest&&!mount&&!T.cfg.oval?0.3*bK:0,dt);
  ambBed('cuckoo',mount&&summer&&!night?0.28*bK:0,dt);
  ambBed('cicada',south&&summer&&!night&&el>18&&!town?0.26*(1-rain)*q*wind:0,dt);
  ambBed('crickets',night&&mon>=4&&mon<=8?0.32*(1-rain*0.7)*q:0,dt);
  // толпа: трибуны и зрители у дороги — ближе и громче; гул, когда машины рядом
  const cr=ambNear(F.crowd,i,120),crK=clamp(cr/60,0,1)*q;
  ambBed('crowd_big',crK>0.35?crK*0.55:0,dt);ambBed('crowd_murmur',crK>0.05?Math.min(0.4,crK*0.6):0,dt);
  if(cr>12&&sp>12&&ambCool('cheer'+Math.floor(i/40),25))ambOnce('crowd_race',0.3+0.35*clamp(cr/60,0,1),(Math.random()-0.5)*0.8);
  if(S&&S.crowdRoad&&crK>0.1&&sp>10&&ambCool('road',14)){hornSfx(y,0.26,0);if(Math.random()<0.4)annPlay(ANN.crowd,0.45,0.4);}
  // дождь и гром
  ambBed('rain',rain>0.05?(0.25+0.55*rain)*(inT?0.2:1):0,dt);
  if(rain>0.7&&!inT&&ambCool('thunder',25+Math.random()*30))ambOnce('thunder',0.35+Math.random()*0.3,(Math.random()-0.5)*1.4);
  // вода у моста, извозчики в старом городе, овцы на горных пастбищах
  const br=T.bridge&&(T.bridge[i]||T.bridge[Math.min(T.n-1,i+6)]);ambBed('stream',br?0.45*q:0,dt);
  ambBed('horse_carriage',town&&y<1915&&!night?0.22*q*wind:0,dt);
  if(mount&&summer&&!night&&ambCool('sheep',50)&&Math.random()<0.35)ambOnce('sheep',0.3,(Math.random()-0.5));
  // деревня: собака, утром петух; город — колокола у церкви, иногда оркестр
  if(vill&&!AMB.seen['v'+Math.floor(i/60)]){AMB.seen['v'+Math.floor(i/60)]=1;if(Math.random()<0.45)setTimeout(()=>ambOnce('dog_bark',0.4,(Math.random()<0.5?-1:1)*0.6),400+Math.random()*1500);
    if(hh>4&&hh<10&&Math.random()<0.55)setTimeout(()=>ambOnce('rooster',0.35,(Math.random()-0.5)),800+Math.random()*2000);}
  for(const ci of F.church){let d=Math.abs(ci-i);if(T.closed)d=Math.min(d,T.n-d);if(d*T.step<90&&!AMB.seen['c'+ci]&&ambCool('bells',45)){AMB.seen['c'+ci]=1;ambOnce(town&&y<1920&&T.cfg.host==='fr'?'bells_city':'bells_village',0.4*q,0.3);break;}}
  if(town&&!night&&!AMB.seen['b'+Math.floor(i/80)]&&crK>0.05){AMB.seen['b'+Math.floor(i/80)]=1;if(Math.random()<0.18)ambOnce('brass_parade',0.35,0.5);}
  // поезд у переезда: пыхтение паровоза и стук колёс
  {let tv=0;if(T.rails&&typeof railLine==='function')T.rails.forEach(rl=>{const st=rl.st;if(!st||st.state!==1)return;const L=railLine(T,rl),x=L.p[0]+L.d[0]*st.s,z=L.p[2]+L.d[1]*st.s,d=Math.hypot(x-me.x,z-me.z);tv=Math.max(tv,0.65/(1+d/35));});ambBed('steam_train',tv>0.02?tv:0,dt);}
  // соседи сигналят: догоняют и просят дорогу
  R.cars.forEach(c=>{if(c===me||c.dnf||c.wait)return;const dg=me.prog-c.prog;if(dg>3&&dg<14&&c.vx>me.vx+1.5&&Math.abs(c.lat-me.lat)<2.2&&ambCool('horn'+c.num,7)&&Math.random()<0.5)hornSfx(y,0.3,clamp((c.lat-me.lat)/3,-0.8,0.8));});
  // диктор: лидер на круге (у трибун), последний круг, финиш
  if(T.closed&&R.t>2){const ord=raceOrder(),lead=ord[0];if(lead&&lead.lap>=1&&!AMB.lapSaid[lead.lap]&&lead.idx<40&&annVol()>0){AMB.lapSaid[lead.lap]=1;if(lead.lap===T.cfg.laps-1)annCall('last');else annCall('lead',lead.num);}}
}
// события гонки → звук
function ambEvent(k,arg){if(!AMB.on||!AU.ctx)return;const y=R?R.rc.y:1905;
  if(k==='start'){if(R.scn&&(R.scn.st==='grid'||R.scn.st==='rolling'))setTimeout(()=>annCall('go'),50);if(Math.random()<0.7)setTimeout(()=>hornSfx(y,0.22,-0.5),600);if(Math.random()<0.5)setTimeout(()=>hornSfx(y,0.18,0.6),1100);ambOnce('crowd_big',0.5,0);}
  if(k==='countdown')annCall('count');
  if(k==='ready'){annCall(R.scn&&R.scn.st==='lemans'?'lemans':'ready');}
  if(k==='finish'){ambOnce('applause',0.55,0);ambOnce('crowd_race',0.5,0.3);if(arg&&arg.win){ambOnce('fanfare',0.45,0);}setTimeout(()=>{const w=raceOrder()[0];if(w)annCall('win',w.num);else annCall('fin');},900);}
  if(k==='crash')annCall('crash');}
