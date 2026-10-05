/* ================= ТИТУЛЬНЫЙ ЭКРАН: живая 3D-гонка эпохи за меню (как заставка в кино) ================= */
// Пока открыто главное меню, за ним идёт настоящая гонка знаменитого года: машины едут сами, камера — как в кино
// (сзади, у обочины, сверху). Пока грузятся фото-материалы — тёмный «кинозал» с заголовком, гонка проявляется из темноты.
const DEMO={on:false,key:null,cut:0,cutT:0,t:0,raf:0};
const DEMO_RACES=['gpacf-1906','targa-1906','x87575-1908','pbp-1895','lemans-1923','gpacf-1914','targa-1924','kaiser-1907','pv1902-1902','monaco-1929','x22765-1924','gb1903-1903'];
function demoWanted(){return !R&&typeof r3dWanted==='function'&&r3dWanted()&&!(AU.on&&AU.on.demo===false)&&!MS.hidden;}
function demoStart(){if(DEMO.on)return;if(!demoWanted()){if(!R&&MS.classList.contains('live')&&!MS.classList.contains('ready')){MS.classList.remove('live');const cap=document.getElementById('menuCap');if(cap)cap.textContent='';}return;}
  const L=DEMO_RACES.map(k=>RACES.find(r=>r.key===k)).filter(Boolean);if(!L.length){demoStop(true);return;}
  const rc=L[(DEMO.n=(DEMO.n===undefined?Math.floor(Math.random()*L.length):DEMO.n+1))%L.length];
  const s={pioneer:'custom',country:COUNTRIES[rc.c]?rc.c:'fr',company:'',drivers:[],models:[],y:rc.y,m:rc.m,cres:{},raceDone:{},titles:[],rep:50,rdept:0};
  let cars,trk;
  try{const ai=raceField(rc,s,0,[]);if(!ai.length){demoStop(true);return;}const vref=Math.max(...ai.map(e=>carStats(e.md,e.prep,rc.y).vmax));trk=buildTrack(rc,vref);
    cars=ai.map((e,i)=>{const c=mkRaceCar(Object.assign(e,{num:i+2}),rc.y,trk);c.mech=c.st.mech;c.style=carStyle(c.md,c.prep,rc.y);
      c.wheel=wheelKind(c.md,rc.y);const bid=parts(c.md).b.id;c.spriteKey=c.style+c.color+c.num+c.wheel+(c.mech?1:0)+bid+'|'+c.name;
      c.spec3={key:c.spriteKey,style:c.style,color:c.color,y:rc.y,wheel:c.wheel,mech:c.mech,num:c.num,b:bid,mq:c.name,strip:0,hp:3};wearSetup(c,trk,rc);return c;});}
  catch(e){console.warn('demo',e);demoStop(true);return;}
  cars.forEach(c=>c.q=c.vtop*(0.9+0.2*(c.sk||0.8))*(0.94+Math.random()*0.12));cars.sort((a,b)=>b.q-a.q);
  cars.forEach((c,i)=>{const row=Math.floor(i/2),col=i%2?1:-1,back=(row+1)*9;let idx=trk.startIdx-Math.round(back/trk.step);if(trk.closed)idx=(idx+trk.n)%trk.n;else idx=Math.max(0,idx);
    const p=trk.pts[idx],nn=trk.N[idx],t=trk.T[idx];c.idx=idx;c.x=p[0]+nn[0]*col*trk.W*0.22;c.z=p[2]+nn[1]*col*trk.W*0.22;c.y=p[1];c.yaw=Math.atan2(t[0],t[1]);if(trk.closed)c.lap=idx>trk.n/2?-1:0;c.lane=[-1.2,1.2,0,-2,2][i%5]*trk.W/9;trackLocal(trk,c);});
  // для заставки — красивый свет: вечер, утро или ясный день, без дождя
  const wx=r3dWeather(trk);wx.rain=false;wx.mood=['evening','clear','morning','evening','cloudy'][DEMO.n%5];wx.mist=wx.mood==='morning'?1:0;
  R={rc,trk,cars,all:cars,me:null,team:[],follow:cars[0],mode:'demo',t:-1.5,time:0,done:false,lastT:performance.now(),msgT:0,msg:'',shake:0,parts:[],speed:1,setup:{},wx,hz0:0,relRef:0.2,demo:1};
  DEMO.on=true;DEMO.key=rc.key;DEMO.t=0;DEMO.cut=-1;DEMO.cutT=0;
  const scr=document.getElementById('raceScreen');scr.classList.add('demo');
  if(!g3Init(document.getElementById('rgl'))){demoStop();return;}
  R.loading=true;texPrepare(R.wx.mood,ok=>{if(!R||!R.demo)return;if(!ok){demoStop(true);return;}
    try{r3dSetup();R.gl=true;}catch(e){console.warn('demo 3d',e);demoStop(true);return;}
    R.loading=false;R3.camHook=demoCam;R.lastT=performance.now();const cap=document.getElementById('menuCap');if(cap)cap.innerHTML=`<b>${esc(rc.name)}</b> · ${rc.y}`;
    document.getElementById('raceScreen').hidden=false;MS.classList.add('live','ready');DEMO.raf=requestAnimationFrame(demoLoop);});}
function demoLoop(now){if(!R||!R.demo||R.done){DEMO.raf=0;return;}
  const dt=clamp((now-R.lastT)/1000,0,0.05);R.lastT=now;
  if(!R.loading){R.t+=dt;if(R.t>0)R.time+=dt;
    // гонка только для картинки: физика и соперники как обычно, без поломок и итогов
    try{raceTick(dt);}catch(e){console.warn(e);}
    if(!R||R.done||!R.demo){DEMO.raf=0;return;}
    try{r3dRender(dt);}catch(e){console.warn('demo render',e);demoStop(true);return;}
    DEMO.t+=dt;if(DEMO.t>75||R.cars.every(c=>c.fin!==null||c.dnf)){demoStop();setTimeout(demoStart,50);return;}}
  DEMO.raf=requestAnimationFrame(demoLoop);}
// Камера заставки: смена планов каждые 6–8 секунд — сзади за лидером, у обочины, сверху, сбоку рядом
function demoCam(dt,W,H){const D=DEMO;D.cutT-=dt;
  const live=R.cars.filter(c=>!c.dnf&&c.fin===null);if(!live.length){r3dCamera(dt,W,H);return;}
  if(D.cutT<=0||!D.car||D.car.dnf||D.car.fin!==null){D.cut=(D.cut+1)%4;D.cutT=6+Math.random()*2.5;const L=live.slice().sort((a,b)=>b.prog-a.prog);D.car=L[Math.min(L.length-1,Math.floor(Math.random()*Math.min(3,L.length)))];R.follow=D.car;R3.cam=null;
    const T=R.trk,c=D.car,sd=Math.random()<0.5?1:-1;
    // камера у обочины — там, где рядом нет дерева или дома
    if(D.cut===1){const a=camSpot(c.idx,70,sd);if(a.blocked)D.cut=2;else D.pos=[a.p[0],a.p[1]+1.7,a.p[2]];}}
  const c=D.car,st=c.v3,y=st&&st.y!==null?st.y:c.y,fw=[Math.sin(c.yaw),0,Math.cos(c.yaw)],rt=[fw[2],0,-fw[0]];
  if(D.cut===0){r3dCamera(dt,W,H);return;}
  let eye,look=[c.x,y+0.9,c.z],fov=0.8;
  if(D.cut===1){eye=D.pos;fov=0.45;}
  else if(D.cut===2){const u=1-D.cutT/8;eye=[c.x-fw[0]*18+rt[0]*10,y+22-u*6,c.z-fw[2]*18+rt[2]*10];look=[c.x+fw[0]*12,y,c.z+fw[2]*12];fov=0.75;}
  else{eye=[c.x+rt[0]*4.5+fw[0]*1.5,y+1.1,c.z+rt[2]*4.5+fw[2]*1.5];look=[c.x+fw[0]*3,y+0.8,c.z+fw[2]*3];fov=0.85;}
  const g=fH(eye[0],eye[2])+0.5;if(eye[1]<g)eye[1]=g;r3dCamSet(eye,look,fov,W,H,0.1);}
function demoStop(fail){if(DEMO.raf)cancelAnimationFrame(DEMO.raf);DEMO.raf=0;const was=DEMO.on;DEMO.on=false;
  if(R&&R.demo){R.done=true;try{if(R.gl)r3dDispose();}catch(_){}R=null;}
  const scr=document.getElementById('raceScreen');if(scr&&was){scr.hidden=true;scr.classList.remove('demo');}
  MS.classList.remove('ready');if(fail){MS.classList.remove('live');const cap=document.getElementById('menuCap');if(cap)cap.textContent='';}}
