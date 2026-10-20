/* ================= 0.37: ПОЛЁТ В 3D — ЭКРАН, УПРАВЛЕНИЕ, КАМЕРА, ПРИБОРЫ =================
   Ручка — правый палец (к себе — нос вверх, вбок — крен), газ — левая шкала (вверх — больше). Отпустили ручку — аэроплан сам идёт ровно.
   Камера: сзади, из кабины, издали, с земли (пролёт мимо). Долгие перелёты и рекорды — автопилот и ускорение времени.
   Задания (41n-flymis.js): первый полёт, гонка вокруг пилонов, дальность, высота, перелёт, военный конкурс, круг 1908 года, петля, рекорды, вылеты на фронт. */
const FLY={el:null,cam:0,warp:1,auto:false,keys:{},st:{x:0,y:0,id:null,ox:0,oy:0,R:62},thrT:0.85,fire:false,bomb:false,raf:0,last:0,hudT:0};
function flyCan(){try{return typeof r3dWanted==='function'&&r3dWanted();}catch(_){return false;}}
function flyEl(){if(FLY.el)return FLY.el;const d=document.createElement('div');d.id='flyScreen';d.hidden=true;
  d.innerHTML=`<div class="f-view" id="fView"></div>
  <div class="f-top"><span class="label" id="fName"></span><span class="f-clock" id="fClock"></span><div class="btns"><button class="btn sm" id="fCam" aria-label="Сменить вид">Вид</button><button class="btn sm" id="fWarp" aria-label="Ускорить время">×1</button><button class="btn sm" id="fAuto" hidden>Автопилот</button><button class="btn sm" id="fSkip" hidden title="Долететь без ожидания">⏩ Долететь</button><button class="btn sm" id="fLand" hidden>Сесть</button><button class="btn sm" id="fHelp" aria-label="Как лететь">?</button><button class="btn sm" id="fQuit">Выход</button></div></div>
  <div class="f-goal" id="fGoal"></div><div class="f-board" id="fBoard"></div>
  <div class="f-ins" id="fIns"></div><div class="f-msg" id="fMsg"></div><div class="f-mark" id="fMark" hidden><i></i><b></b></div><div class="f-aim" id="fAim" hidden><i></i><b></b></div><div class="f-warn" id="fWarn" hidden></div>
  <div class="f-thr" id="fThr"><div class="f-thr-bar"><i id="fThrI"></i><em id="fThrK"></em></div><b>ГАЗ</b></div>
  <div class="f-stick" id="fStick"><div class="f-base" id="fBase"><div class="f-knob" id="fKnob"></div></div><small>ручка</small></div>
  <button class="f-fire" id="fFire" hidden>ОГОНЬ</button><button class="f-bomb" id="fBomb" hidden>БОМБЫ</button><button class="f-brake" id="fBrake" hidden>ТОРМОЗ</button>
  <div class="f-eng" id="fEng" hidden></div><div class="f-skip" id="fSkipBox" hidden></div><div class="f-rain" id="fRain" hidden></div><div class="f-flash" id="fFlash"></div>
  <div class="f-load" id="fLoad"><b id="fLoadT">Выкатываем аэроплан…</b><span id="fLoadS"></span></div>
  <div class="f-help" id="fHelpBox" hidden></div><div class="f-end" id="fEnd" hidden></div>`;
  document.body.appendChild(d);FLY.el=d;flyBind();return d;}
function flyBind(){const $=id=>document.getElementById(id),st=FLY.st;
  const stick=$('fStick'),base=$('fBase'),knob=$('fKnob');
  stick.addEventListener('pointerdown',e=>{if(st.id!==null)return;st.id=e.pointerId;st.ox=e.clientX;st.oy=e.clientY;try{stick.setPointerCapture(e.pointerId);}catch(_){}
    const r=stick.getBoundingClientRect();base.style.left=(e.clientX-r.left)+'px';base.style.top=(e.clientY-r.top)+'px';stick.classList.add('on');e.preventDefault();});
  stick.addEventListener('pointermove',e=>{if(e.pointerId!==st.id)return;const dx=e.clientX-st.ox,dy=e.clientY-st.oy,R=st.R,l=Math.hypot(dx,dy),k=l>R?R/l:1;st.x=clamp(dx/R,-1,1);st.y=clamp(dy/R,-1,1);knob.style.transform=`translate(${dx*k}px,${dy*k}px)`;e.preventDefault();});
  const up=e=>{if(e.pointerId!==st.id)return;st.id=null;st.x=0;st.y=0;knob.style.transform='';stick.classList.remove('on');};stick.addEventListener('pointerup',up);stick.addEventListener('pointercancel',up);
  const thr=$('fThr');let tid=null;const setT=e=>{const b=thr.querySelector('.f-thr-bar').getBoundingClientRect();FLY.thrT=clamp(1-(e.clientY-b.top)/b.height,0,1);if(FL.on&&FL.me&&!FLY.auto)FL.me.ctl.thr=FLY.thrT;};
  thr.addEventListener('pointerdown',e=>{tid=e.pointerId;try{thr.setPointerCapture(e.pointerId);}catch(_){}setT(e);e.preventDefault();});thr.addEventListener('pointermove',e=>{if(e.pointerId===tid)setT(e);});thr.addEventListener('pointerup',()=>{tid=null;});thr.addEventListener('pointercancel',()=>{tid=null;});
  const hold=(id,k)=>{const b=$(id);b.addEventListener('pointerdown',e=>{FLY[k]=true;b.classList.add('down');e.preventDefault();});['pointerup','pointercancel','pointerleave'].forEach(t=>b.addEventListener(t,()=>{FLY[k]=false;b.classList.remove('down');}));};hold('fFire','fire');hold('fBomb','bomb');
  $('fCam').onclick=()=>{FLY.cam=(FLY.cam+1)%4;FLY.ce=null;flToast(['Вид сзади','Из кабины','Издали','С земли'][FLY.cam]);};
  $('fWarp').onclick=()=>{const M=FL.mi,L=[1,2,4,8,16,32,64].filter(w=>w<=(M?flWarpMax():1));const i=L.indexOf(FLY.warp);FLY.warp=L[(i+1)%L.length]||1;$('fWarp').textContent='×'+FLY.warp;};
  $('fAuto').onclick=()=>{FLY.auto=!FLY.auto;if(!FLY.auto&&FLY.skip)flySkip(false);$('fAuto').classList.toggle('on',FLY.auto);flToast(FLY.auto?'Автопилот: лётчик ведёт сам':'Ручное управление');if(!FLY.auto){FLY.warp=Math.min(FLY.warp,4);$('fWarp').textContent='×'+FLY.warp;if(FL.me)FL.me.ctl.aCmd=null;}};
  // 0.38: «Сесть» — лётчик честно заходит на посадку (дальняя точка, глиссада, выравнивание), а не «сел» мгновенно; ещё нажатие — снова ручное
  $('fLand').onclick=()=>{const M=FL.mi;if(!M||!M.land)return;if(FLY.landing){FLY.landing=null;if(FL.me){FL.me.ld=null;FL.me.ctl.aCmd=null;}flToast('Ручное управление');return;}
    const at=M.landAt?M.landAt():[M.A[0],M.A[1],FW&&FW.S.A?FW.S.A.y:0];FLY.landing={at,fin:()=>M.land()};FLY.auto=false;$('fAuto').classList.remove('on');if(FL.me)FL.me.ld=null;FLY.warp=Math.min(FLY.warp,2);$('fWarp').textContent='×'+FLY.warp;flToast('Лётчик заходит на посадку','good');};
  $('fQuit').onclick=()=>flyQuitAsk();$('fHelp').onclick=()=>flyHelp();
  // 0.39: тормоз (держать), «Долететь» — досчитать полёт без ожидания, панель «мотор стоит»
  hold('fBrake','brake');
  $('fSkip').onclick=()=>flySkip(!FLY.skip);$('fSkipBox').onclick=()=>flySkip(false);
  $('fEng').addEventListener('click',e=>{const b=e.target.closest('[data-k]');if(!b||!FL.me)return;flyEngAct(b.dataset.k,+b.dataset.min||0,+b.dataset.cost||0);});
  window.addEventListener('keydown',e=>{if(!FL.on)return;FLY.keys[e.code]=true;if(e.code==='KeyC')$('fCam').click();if(e.code==='KeyT')$('fWarp').click();if(e.code==='KeyP')$('fAuto').click();if(e.code==='Escape')flyQuitAsk();
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();});
  window.addEventListener('keyup',e=>{FLY.keys[e.code]=false;});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)FLY.last=performance.now();});}
function flToast(t,cls){const el=document.getElementById('fMsg');if(!el)return;el.textContent=t;el.className='f-msg show '+(cls||'');clearTimeout(FLY.msgT);FLY.msgT=setTimeout(()=>{el.className='f-msg';},2600);}
function flyHelp(){const b=document.getElementById('fHelpBox');if(!b.hidden){b.hidden=true;return;}FL.paused=true;
  b.innerHTML=`<h3>Как лететь</h3><p><b>Ручка</b> — правым пальцем в любом месте справа: к себе (вниз) — нос вверх, от себя — вниз, вбок — крен и вираж. Отпустите — лётчик сам выровняет аэроплан.</p>
  <p><b>Газ</b> — шкала слева. Разбег: полный газ и ручку не трогать — хвост лежит на земле, аэроплан оторвётся сам, когда хватит скорости. Посадка: газ убрать, планировать и у самой земли плавно взять ручку на себя.</p>
  <p>Скорость меньше посадочной — <b>срыв</b>: крыло теряет опору, аэроплан валится на крыло. Отдайте ручку и дайте газ.</p>
  <p><b>Пробег</b>: газ долой, ручку на себя — костыль пашет землю и тормозит. Колёсные тормоза есть только у шасси с тормозами (кнопка <b>ТОРМОЗ</b>, держать).</p>
  <p><b>Мотор стал</b> — внизу появятся кнопки: завести (в воздухе — винт раскрутит встречный поток, на земле — механик), починить или заправиться в поле. Долгий перелёт — <b>⏩ Долететь</b>: лётчик ведёт сам, а часы бегут, пока не случится что-то, что требует вас.</p>
  <p>На клавиатуре: стрелки или W/A/S/D — ручка, Shift/Ctrl — газ, X — тормоз, пробел — огонь, B — бомбы, C — вид, T — время, P — автопилот.</p><button class="btn primary" id="fHelpOk">Понятно</button>`;b.hidden=false;document.getElementById('fHelpOk').onclick=()=>{b.hidden=true;FL.paused=false;FLY.last=performance.now();};}
function flyQuitAsk(){if(!FL.on)return;const M=FL.mi;if(M&&M.over){flyClose();return;}FL.paused=true;const b=document.getElementById('fHelpBox');
  b.innerHTML=`<h3>Прервать полёт?</h3><p>${esc(M&&M.quitText?M.quitText():'Результат не будет засчитан.')}</p><div class="btns"><button class="btn" id="fQ1">Продолжить полёт</button><button class="btn primary" id="fQ2">Прервать</button></div>`;b.hidden=false;
  document.getElementById('fQ1').onclick=()=>{b.hidden=true;FL.paused=false;FLY.last=performance.now();};document.getElementById('fQ2').onclick=()=>{b.hidden=true;if(M&&M.quit)M.quit();else flyClose();};}
/* ---------- управление ---------- */
function flyInput(dt){const me=FL.me,c=me.ctl,K=FLY.keys,st=FLY.st;if(me.crash)return;
  if(FLY.landing)return;if(FLY.auto&&FL.mi&&FL.mi.auto){FL.mi.auto(dt);return;}c.aCmd=null;c.lvl=true;
  let sx=st.x,sy=st.y;const kx=(K.ArrowRight||K.KeyD?1:0)-(K.ArrowLeft||K.KeyA?1:0),ky=(K.ArrowDown||K.KeyS?1:0)-(K.ArrowUp||K.KeyW?1:0);
  FLY.kx=(FLY.kx||0)+(kx-(FLY.kx||0))*Math.min(1,dt*(kx?5:9));FLY.ky=(FLY.ky||0)+(ky-(FLY.ky||0))*Math.min(1,dt*(ky?4:9));if(Math.abs(FLY.kx)>0.01)sx=FLY.kx;if(Math.abs(FLY.ky)>0.01)sy=FLY.ky;
  const ex=v=>Math.sign(v)*Math.pow(Math.abs(v),1.25);c.sx=ex(sx);c.sy=ex(sy);c.rd=(K.KeyE?1:0)-(K.KeyQ?1:0);
  if(K.ShiftLeft||K.ShiftRight)FLY.thrT=Math.min(1,FLY.thrT+dt*0.6);if(K.ControlLeft||K.ControlRight)FLY.thrT=Math.max(0,FLY.thrT-dt*0.6);c.thr=FLY.thrT;
  FL.fire=FLY.fire||!!K.Space;FL.bomb=FLY.bomb||!!K.KeyB;c.brk=FLY.brake||K.KeyX?1:0;}
function flWarpMax(){const M=FL.mi,me=FL.me;if(!M||!me)return 1;if(me.crash||M.over)return 1;const agl=me.p[1]-Math.max(0,fwHgt(FW.S,me.p[0],me.p[2]));
  if(me.gnd)return 2;if(FLY.landing)return 4;/* 0.38: лётчик ведёт на посадку — можно ×4, у земли ×2 */if(agl<60&&!FLY.auto)return 2;/* 0.39: автопилот держит высоту сам — у земли его не режем (рекорд дальности шёл на ×2 часами) */
  if(M.foes&&M.foes.some(f=>!f.crash&&!f.down&&Math.hypot(f.p[0]-me.p[0],f.p[2]-me.p[2])<3500))return 1;return FLY.auto?(M.warpAuto||16):(M.warpMax||8);}
/* ---------- 0.39: «Долететь» — полёт досчитывается без ожидания, пока не случится что-то, что требует лётчика ---------- */
function flySkipStop(){const me=FL.me,M=FL.mi;if(!me||!M)return 'нет полёта';if(M.over)return '';if(me.crash)return 'авария';if(!me.eng.run)return 'мотор стоит';
  if(me.fuel/Math.max(1,me.fuelMax)<0.12)return 'бензин на исходе';if(me.dmg.eng>0.3)return 'мотор повреждён';if(M.foes&&M.foes.some(f=>!f.crash&&!f.down&&Math.hypot(f.p[0]-me.p[0],f.p[2]-me.p[2])<4000))return 'противник рядом';
  if(M.skipStop){const r=M.skipStop();if(r)return r;}return null;}
function flySkip(on){const b=document.getElementById('fSkipBox'),M=FL.mi;if(on&&(!M||!M.auto||!FL.me||FL.me.gnd))return;FLY.skip=!!on;
  if(on){FLY.auto=true;document.getElementById('fAuto').classList.add('on');FLY.landing=null;b.hidden=false;b.innerHTML='<b>Летим…</b><span></span><small>нажмите, чтобы взять управление</small>';}
  else{b.hidden=true;}document.getElementById('fSkip').classList.toggle('on',!!on);}
function flySkipTick(){const me=FL.me,M=FL.mi,t0=performance.now();let n=0;const d=1/30;
  while(performance.now()-t0<20&&n<4000){const p0=[me.p[0],me.p[1],me.p[2]];if(M.auto)M.auto(d);flStep(me,d);if(M.ai)M.ai(d);for(const k of M.rivals)flKinStep(k,d);FL.t+=d;if(!M.over&&M.step)M.step(d,p0);n++;
    const why=flySkipStop();if(why!==null){flySkip(false);if(why)flToast(why==='мотор стоит'?'Мотор стоит — вы за ручкой':why==='бензин на исходе'?'Бензин на исходе — вы за ручкой':why,why?'bad':'');break;}}
  if(me.fuel/Math.max(1,me.fuelMax)<0.12&&!FLY.skipFuelHint){FLY.skipFuelHint=1;flToast('Бензин на исходе: «Сесть» — лётчик подберёт поле, заправимся у деревни','bad');}
  const b=document.getElementById('fSkipBox');if(!b.hidden){const g=M.goal?M.goal().replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim():'';b.querySelector('span').textContent=g.slice(0,120);}}
/* ---------- 0.39: мотор стоит — завести, починить, заправиться ---------- */
function flyEngAct(k,min,cost){const me=FL.me,M=FL.mi;if(!me||me.crash)return;
  if(k==='start'){if(flEngStart(me))flToast(me.gnd?'Механик крутит винт…':'Пробуем запустить…');return;}
  if(k==='quit'){flyQuitAsk();return;}
  if(k==='fix'||k==='fuel'){const m=flRepair(me,k);if(m>0){FL.t+=m*60/(FL.k||1);if(cost&&typeof G!=='undefined'&&G){G.cash-=Math.round(cost*cpi(G));}flToast(k==='fuel'?`Заправились — ${m} мин`:`Починили — ${m>=60?Math.round(m/60)+' ч':m+' мин'}`,'good');}return;}}
function flyEngPanel(){const el=document.getElementById('fEng'),me=FL.me,M=FL.mi;if(!el||!me)return;
  const show=!me.crash&&!M.over&&!me.starting&&(me.gnd?me.Vg<1.5:!me.eng.run)&&!FLY.landing;
  if(!show){if(me.starting){el.hidden=false;el.dataset.sig='';el.innerHTML=`<b>${me.gnd?'Крутим винт…':'Запускаем…'}</b><small>${Math.ceil(me.starting.left)} с</small>`;}else el.hidden=true;return;}
  const O=flEngOpts(me);if(!O.length&&(!me.gnd||me.eng.run)){el.hidden=true;return;}
  const sig=O.map(o=>o.k+o.t).join('|')+(me.gnd?'g':'a')+(me.eng.run?'r':'s');if(el.dataset.sig===sig&&!el.hidden)return;el.dataset.sig=sig;el.hidden=false;
  el.innerHTML=`<b>${me.eng.run?'На земле — '+(me.fuel<me.fuelMax*0.6?'бензина '+Math.round(me.fuel/me.fuelMax*100)+'%':'мотор повреждён'):'Мотор стоит'+(me.eng.fail?' — '+esc(me.eng.fail):'')}</b>`+O.map(o=>o.k==='no'?`<p class="small muted">${esc(o.t)}: ${esc(o.sub)}</p>`:`<button class="btn sm ${o.k==='start'?'primary':''}" data-k="${o.k}" data-min="${o.min||0}" data-cost="${o.cost||0}">${esc(o.t)}<small>${esc(o.sub)}</small></button>`).join('')+(me.gnd&&!me.eng.run?`<button class="btn sm" data-k="quit">Сойти с дистанции</button>`:'');}
/* ---------- камера ---------- */
function flyCam(dt){const me=FL.me,cv=G3.cv,asp=Math.max(0.3,(cv.clientWidth||1)/(cv.clientHeight||1)),mesh=FL.meMesh,v=me.v,sp=l3(v);
  const hf=FLY.cam===1?1.25:1.05;let vf=asp<1?2*Math.atan(Math.tan(hf/2)/asp):0.92;if(2*Math.atan(Math.tan(vf/2)*asp)>1.8)vf=2*Math.atan(Math.tan(0.9)/asp);
  const W=FW;let eye,fw,up,rt,near=0.35;
  if(FLY.dbg){const d=FLY.dbg;eye=d.eye;fw=v3n([d.look[0]-eye[0],d.look[1]-eye[1],d.look[2]-eye[2]]);rt=v3n(v3x([0,1,0],fw));up=v3x(fw,rt);return {eye,fw,up,rt,fov:d.fov||vf,near:0.5,mb:0,cock:false};}
  if(FLY.cam===1){const e=mesh.eye;eye=[me.p[0]+me.rt[0]*e[0]+me.up[0]*(e[1]+0.08)+me.fw[0]*e[2],me.p[1]+me.rt[1]*e[0]+me.up[1]*(e[1]+0.08)+me.fw[1]*e[2],me.p[2]+me.rt[2]*e[0]+me.up[2]*(e[1]+0.08)+me.fw[2]*e[2]];
    const sh=(me.gnd?clamp(sp/30,0,1)*0.012:0)+(me.stall?0.006:0);fw=v3n([me.fw[0]+(Math.random()-0.5)*sh,me.fw[1]+(Math.random()-0.5)*sh-0.05,me.fw[2]]);up=me.up;rt=v3n(v3x(up,fw));up=v3x(fw,rt);near=0.08;}
  else if(FLY.cam===3&&!FLY.skip){let c=FLY.fb;const ahead=sp>3?v3n(v):me.fw;if(!c||Math.hypot(c[0]-me.p[0],c[2]-me.p[2])>700||d3([c[0]-me.p[0],0,c[2]-me.p[2]],ahead)<-260){
      const sd=Math.random()<0.5?-1:1,x=me.p[0]+ahead[0]*380+ahead[2]*sd*60,z=me.p[2]+ahead[2]*380-ahead[0]*sd*60,gy=Math.max(0,fwHgt(W.S,x,z));c=FLY.fb=[x,Math.max(gy+1.7,Math.min(me.p[1]-8,gy+70)),z];}
    eye=c;fw=v3n([me.p[0]-c[0],me.p[1]-c[1],me.p[2]-c[2]]);rt=v3n(v3x([0,1,0],fw));up=v3x(fw,rt);vf*=clamp(Math.hypot(me.p[0]-c[0],me.p[2]-c[2])/260,0.35,1);}
  else{const far=FLY.cam===2||(FLY.cam===3&&FLY.skip),D=clamp(mesh.span*1.15+5,9,42)*(far?2.6:1),Hh=D*(far?0.35:0.24),dir=sp>4?v3n([v[0]/sp*0.55+me.fw[0]*0.45,v[1]/sp*0.55+me.fw[1]*0.45,v[2]/sp*0.55+me.fw[2]*0.45]):me.fw;
    // 0.39: камера догоняет в масштабе игрового времени — при ускорении и «Долететь» аэроплан не убегает из кадра
    const tg=[me.p[0]-dir[0]*D,me.p[1]-dir[1]*D+Hh,me.p[2]-dir[2]*D];if(!FLY.ce)FLY.ce=tg.slice();const k=FLY.skip?1:1-Math.exp(-dt*Math.max(1,FLY.warp)*(me.gnd?6:4.5));for(let i=0;i<3;i++)FLY.ce[i]+=(tg[i]-FLY.ce[i])*k;
    const gy=Math.max(me.sea||W.sea?0:-1e9,fwHgt(W.S,FLY.ce[0],FLY.ce[2]));if(FLY.ce[1]<gy+1.6)FLY.ce[1]=gy+1.6;eye=FLY.ce;
    const look=[me.p[0]+me.fw[0]*D*0.35,me.p[1]+Hh*0.25,me.p[2]+me.fw[2]*D*0.35];fw=v3n([look[0]-eye[0],look[1]-eye[1],look[2]-eye[2]]);
    const u0=v3n([me.up[0]*0.25,1,me.up[2]*0.25]);rt=v3n(v3x(u0,fw));up=v3x(fw,rt);near=0.4;}
  // 0.39: предельная скорость и трещащие лонжероны — камеру трясёт (видно и без приборов)
  if(me.turb>0.3&&!me.crash&&!me.gnd){const a=me.turb*0.06;eye=[eye[0]+(Math.random()-0.5)*a,eye[1]+(Math.random()-0.5)*a,eye[2]+(Math.random()-0.5)*a];}
  if((me.ovs||me.creak)&&!me.crash){const a=me.ovs===2||me.creak?0.22:0.08;eye=[eye[0]+(Math.random()-0.5)*a,eye[1]+(Math.random()-0.5)*a,eye[2]+(Math.random()-0.5)*a];}
  const mb=FLY.cam===1?0:clamp((sp-40)/120,0,1)*0.03;return {eye,fw,up,rt,fov:vf,near,mb,cock:FLY.cam===1};}
/* ---------- приборы ---------- */
function flyHUD(dt,cam){FLY.hudT-=dt;const me=FL.me,M=FL.mi;flyMark(cam);if(FLY.hudT>0)return;FLY.hudT=0.12;
  const $=id=>document.getElementById(id),W=FW,gy=W.S.A?W.S.A.y:0,V=me.V*3.6,alt=me.p[1]-gy,vs=me.v[1],hdg=((flHdg(me)*180/Math.PI)+360)%360,fuel=me.fuel/Math.max(1,me.fuelMax),stallW=!me.gnd&&(me.stall||V<me.Vs*3.6*1.12);
  const card=['С','СВ','В','ЮВ','Ю','ЮЗ','З','СЗ'][Math.round(hdg/45)%8];
  const vmax=me.st.v,ovs=me.ovs||0,wingD=me.dmg.wing||0;
  $('fIns').innerHTML=`<div class="${stallW||ovs===2?'bad':ovs===1?'warn':''}">СКОРОСТЬ<b>${Math.round(V)}</b><small>${ovs?'предел '+Math.round(vmax*1.3)+' км/ч':'км/ч'}</small></div><div>ВЫСОТА<b>${fmtN(Math.round(alt))}</b><small>м · ${vs>=0?'↑':'↓'}${Math.abs(vs).toFixed(1).replace('.',',')}</small></div>
    <div>КУРС<b>${Math.round(hdg)}°</b><small>${card}</small></div><div class="${me.eng.run?'':'bad'}">МОТОР<b>${me.eng.run?Math.round(me.thr*100)+'%':'стоп'}</b><small>${me.eng.run?(me.n>1.6?'перегрузка '+me.n.toFixed(1).replace('.',','):'бензин '+Math.round(fuel*100)+'%'):esc(me.eng.fail||'')}</small></div>${wingD>0.02?`<div class="${wingD>0.5?'bad':'warn'}">ПЛАНЕР<b>${Math.round((1-wingD)*100)}%</b><small>${wingD>0.5?'обшивка рвётся':'лонжероны'}</small></div>`:''}`;
  $('fThrI').style.height=Math.round(FLY.thrT*100)+'%';$('fThrK').textContent=Math.round((FLY.auto?me.thr:FLY.thrT)*100)+'%';
  const w=$('fWarn');const wt=me.crash?'':me.stall&&!me.gnd?'СРЫВ!':stallW&&!me.gnd?'Мала скорость':ovs===2?'ОБШИВКА РВЁТСЯ — УБЕРИТЕ ГАЗ, РУЧКУ НА СЕБЯ':me.creak?'ТРЕЩАТ ЛОНЖЕРОНЫ':ovs===1?'ПРЕДЕЛЬНАЯ СКОРОСТЬ — ТРЯСКА':!me.eng.run&&!me.gnd?(flEngOpts(me).length?'Мотор стоит — попробуйте запустить или планируйте на посадку':'Мотор стоит — планируйте на посадку'):fuel<0.08&&!me.gnd?'Мало бензина':'';me.creak=0;w.hidden=!wt;w.textContent=wt;
  if(me.gnd&&!me.brakes&&me.Vg>8&&M&&!M.over&&FLY.landed!==1&&!FLY.landing&&!FLY.auto&&me.air>20&&me.ctl.thr<0.2){FLY.landed=1;flToast('Тормозов нет: ручку на себя — костыль пашет землю, газ долой');}
  $('fBrake').hidden=!(me.brakes&&me.gnd&&!me.crash);$('fSkip').hidden=!(M&&M.auto&&!me.gnd&&!M.over&&!me.crash);flyEngPanel();
  $('fClock').textContent=M&&M.clock?M.clock():'';if(M&&M.goal)$('fGoal').innerHTML=M.goal()+(FL.wx?'<em class="wx">'+wxLine(me)+'</em>':'');
  if(FL.wx){const r=$('fRain');r.hidden=!(FL.wx.rain>0.05);if(!r.hidden)r.style.opacity=(0.25+FL.wx.rain*0.6)*(cam.cock?1.2:1);const f=$('fFlash');f.style.opacity=FL.wx.flash>0?FL.wx.flash*0.55:0;}if(M&&M.board){const b=M.board();$('fBoard').innerHTML=b;$('fBoard').hidden=!b;}
  $('fAuto').hidden=!(M&&M.auto&&!me.gnd);$('fLand').hidden=!(M&&M.land&&(FLY.landing||M.canLand&&M.canLand()));$('fLand').textContent=FLY.landing?'Сам':'Сесть';$('fLand').classList.toggle('on',!!FLY.landing);$('fWarp').textContent='×'+FLY.warp;
  $('fFire').hidden=!(M&&M.guns);$('fBomb').hidden=!(M&&M.bombs);}
// метка цели: на экране — кружок с расстоянием, за экраном — стрелка у края
function flyMark(cam){const el=document.getElementById('fMark'),M=FL.mi,tg=M&&M.target?M.target():null;flyAimMark();if(!tg){el.hidden=true;return;}
  const VP=FWR.VPf;if(!VP)return;const p=[tg[0],tg[1]===undefined?FL.me.p[1]:tg[1],tg[2]],cw=VP[3]*p[0]+VP[7]*p[1]+VP[11]*p[2]+VP[15];let x=(VP[0]*p[0]+VP[4]*p[1]+VP[8]*p[2]+VP[12])/cw,y=(VP[1]*p[0]+VP[5]*p[1]+VP[9]*p[2]+VP[13])/cw;
  const on=cw>0&&Math.abs(x)<0.92&&Math.abs(y)<0.85;if(!on){if(cw<0){x=-x;y=-y;}const k=Math.min(0.86/Math.max(Math.abs(x),0.001),(y>0?0.4:0.48)/Math.max(Math.abs(y),0.001));x*=k;y*=k;}
  const W=el.parentNode.clientWidth,H=el.parentNode.clientHeight,d=Math.hypot(p[0]-FL.me.p[0],p[2]-FL.me.p[2])*(M.kd||1);el.hidden=false;el.classList.toggle('edge',!on);
  const sx=(x*0.5+0.5)*W,sy=(0.5-y*0.5)*H;el.style.left=sx+'px';el.style.top=sy+'px';el.querySelector('i').style.transform=on?'':`rotate(${Math.atan2(-y,x)}rad)`;
  // 0.37: цель за табличкой задания или соперников — подпись не лезет в их текст (остаётся кружок; расстояние — в табличке)
  {const now=performance.now();if(!FLY.panR||now-FLY.panRt>500){FLY.panRt=now;const R=el.parentNode.getBoundingClientRect();
      FLY.panR=['fGoal','fBoard','fIns'].map(id=>document.getElementById(id)).filter(b=>b&&!b.hidden&&b.offsetWidth).map(b=>{const r=b.getBoundingClientRect();return [r.left-R.left,r.top-R.top,r.right-R.left,r.bottom-R.top];});}
    let under=false;for(const r of FLY.panR)if(sx>r[0]-90&&sx<r[2]+8&&sy>r[1]-12&&sy<r[3]+12){under=true;break;}el.classList.toggle('under',under);}
  el.querySelector('b').textContent=(tg[3]?tg[3]+' · ':'')+(d>=1000?(d/1000).toFixed(d<10000?1:0).replace('.',',')+' км':Math.round(d)+' м');}
/* ---------- начало и конец полёта ---------- */
function flyTest(md){const s=G;if(!flyCan())return false;const P=airHeroFlies(s)?airPilotList(s)[0]:airBestPilot(s);return flyStart({kind:'test',md,pil:P});}
function flyEvent(ev,md,pid){const s=G;if(!flyCan())return false;const P=airPilotList(s).find(p=>p.id===pid)||airBestPilot(s);return flyStart({kind:ev.kind,md,pil:P,ev});}
function flyRecord(k,md,pid){const s=G;if(!flyCan())return false;const P=airPilotList(s).find(p=>p.id===pid)||airBestPilot(s);return flyStart({kind:'r'+k,md,pil:P});}
function flyFront(m,md,P){if(!flyCan())return false;return flyStart({kind:'war',md,pil:P,fm:m});}
function flyStart(cfg){if(FL.on)return true;const s=G;let M;try{M=flMission(cfg);}catch(e){console.error(e);return false;}
  const el=flyEl(),cv=document.getElementById('rgl');if(!cv)return false;let ok=false;try{ok=g3Init(cv);}catch(e){ok=false;}if(!ok)return false;
  FL.on=true;FL.cfg=cfg;FL.mi=M;FL.paused=false;FL.t=0;FL.k=1;FL.noFail=false;FL.wind=[0,0,0];FL.wx=null;FL.fire=false;FL.bomb=false;
  Object.assign(FLY,{cam:0,warp:1,auto:false,landing:null,ce:null,fb:null,thrT:0,fire:false,bomb:false,brake:false,skip:false,landed:0,keys:{},last:performance.now()});
  const sk=document.getElementById('fSkipBox');if(sk)sk.hidden=true;const en=document.getElementById('fEng');if(en){en.hidden=true;en.dataset.sig='';}
  FLY.cvParent=cv.parentNode;FLY.cvNext=cv.nextSibling;document.getElementById('fView').appendChild(cv);cv.hidden=false;
  el.hidden=false;document.body.classList.add('flying');document.getElementById('fName').textContent=M.title||'';document.getElementById('fEnd').hidden=true;document.getElementById('fHelpBox').hidden=true;
  document.getElementById('fLoad').hidden=false;document.getElementById('fLoadT').textContent=cfg.kind==='test'?'Выкатываем аэроплан из ангара…':'Аэродром готовится…';
  try{auInit();}catch(_){}
  const mood=M.mood||'clear';
  texPrepare(mood,res=>{if(!FL.on||FL.mi!==M)return;if(!res){flyFail(new Error('textures'));return;}
    setTimeout(()=>{if(!FL.on||FL.mi!==M)return;try{flySetup(mood);}catch(e){console.error(e);flyFail(e);}},30);});
  return true;}
function flySetup(mood){const s=G,M=FL.mi,cfg=FL.cfg,t=tNow(s),md=cfg.md;
  fwBuild(M.place,{y:t,m:s.m,A:M.A,B:M.B,sea:!!M.st.sea,objs:M.objs,mood,seed:s.y});
  FW.objOpt={stands:M.stands,crowd:M.crowd,parked:M.parked,c:s.country};FW.sunAz=1.9+(hashStr(M.place+s.y)%100)/100*1.2;FW.loading=true;
  fwPrepare(mood);FWR.sky=G3.cache.tx&&G3.cache.tx.sky[mood];FWR.postOn=!!(G3.postOK&&gq().post&&!(AU.on&&AU.on.post===false));FWR.scale=1;FWR.lowQ=false;
  FL.k=M.kind==='cross'?M.kd:1;
  const me=FL.me=flCraft(md,t,{trimK:1.4});FL.meMesh=air3dMesh(md,t,s.country);me.cat=me.rail?30:0;
  flPlace(me,M.start.x,M.start.z,M.start.hdg,M.start.air||null);if(me.sea&&!M.start.air){me.p[1]=flHcg(me,me.th)+0.0;}
  me.ctl.thr=FLY.thrT=M.start.air?0.8:0;
  M.rivals.forEach(k=>{k.mesh=air3dMesh(k.md,t,'');});if(M.init)M.init();
  // 0.39: погода дня — ветер по высоте, порывы, термики, дождь, гроза, птицы (раньше — случайный ветерок до 3 м/с)
  FL.wx=wxMake({place:M.place,bio:FW.S.bio,y:t,m:s.m,seed:s.y*131+hashStr(M.place+(cfg.ev?cfg.ev.key:M.kind)),sea:!!FW.sea,mood,A:M.A,B:M.B,hour:M.hour});if(M.wxFix)Object.assign(FL.wx,M.wxFix(FL.wx));FL.wind=FL.wx.w0.slice();wxBirdsInit(FW.S);
  // первые куски земли — сразу
  const t0=performance.now();for(let i=0;i<12&&performance.now()-t0<900;i++){const cam=flyCam(0.016);const pl=frustumOf((()=>{const V=m4(),P=m4(),VP=m4();m4view(V,cam.eye,cam.rt,cam.up,cam.fw);m4persp(P,cam.fov,1.5,20,95000);return m4mul(VP,P,V);})());fwSelect(cam.eye,pl);fwBuildSome(80);}
  flyAudioStart();document.getElementById('fLoad').hidden=true;FLY.last=performance.now();
  if(!AU.on.flyHelp){try{AU.on.flyHelp=1;localStorage.setItem('avt-audio',JSON.stringify(AU.on));}catch(_){}setTimeout(()=>{if(FL.on)flyHelp();},400);}
  else flToast(M.kind==='test'?'Газ — до отказа!':'Удачи!');
  setTimeout(()=>{if(FW)FW.loading=false;},2500);
  cancelAnimationFrame(FLY.raf);FLY.raf=requestAnimationFrame(flyLoop);}
function flyLoop(now){if(!FL.on)return;FLY.raf=requestAnimationFrame(flyLoop);const dtR=Math.min(0.05,Math.max(0.001,(now-(FLY.last||now))/1000));FLY.last=now;
  if(!FW||!FL.me||document.hidden)return;try{flyTick(FL.paused||FL.mi.over&&FL.mi.frozen?0:dtR,dtR);}catch(e){console.error(e);flyFail(e);}}
function flyTick(dt,dtR){const M=FL.mi,me=FL.me;
  if(dt>0&&FLY.skip&&!M.over){const t0=FL.t;flyInput(dt);flySkipTick();fwPartsTick(0.2);flyFx(dt);FL.pa=(FL.pa||0)+dt*(8+me.eng.rpm*110);wxTick(Math.min(FL.t-t0,30));}
  else if(dt>0){flyInput(dt);const wm=flWarpMax();if(FLY.warp>wm)FLY.warp=wm;
    if(me.starting){const r=flEngTick(me,dt*FLY.warp);if(r==='ok'&&!FLY.auto){FLY.thrT=Math.max(FLY.thrT,0.1);}}
    const sim=dt*(M.over?1:FLY.warp),h=FLY.warp<=4?1/120:1/30,n=Math.min(600,Math.ceil(sim/h)),d=sim/n;
    for(let i=0;i<n;i++){const p0=[me.p[0],me.p[1],me.p[2]];if(FLY.landing&&!me.crash){const L=FLY.landing,st=flAutoLand(me,L.at,L.at[2],d);if(st==='done'){FLY.landing=null;me.ld=null;if(!M.over)L.fin();}}else if(FLY.auto&&M.auto&&!me.crash)M.auto(d);flStep(me,d);
      if(M.ai)M.ai(d);for(const k of M.rivals)flKinStep(k,d);FL.t+=d;if(!M.over&&M.step)M.step(d,p0);}
    fwPartsTick(Math.min(dt*FLY.warp,0.2));flyFx(dt);FL.pa=(FL.pa||0)+dt*(8+me.eng.rpm*110);wxTick(sim);}
  // телефон не успевает — кадр мельче (до 0,6), тени и дальний лес — проще; успевает — обратно
  FLY.ft=(FLY.ft||0.016)*0.95+dtR*0.05;if(FL.t>3){if(FLY.ft>0.03){FLY.slow=(FLY.slow||0)+dtR;if(FLY.slow>1.5){FLY.slow=0;FWR.scale=Math.max(0.6,(FWR.scale||1)-0.1);if(FWR.scale<=0.7)FWR.lowQ=true;FLY.ft=0.022;}}
    else{FLY.slow=0;if(FLY.ft<0.018){FLY.fast=(FLY.fast||0)+dtR;if(FLY.fast>4&&(FWR.scale||1)<1){FWR.scale=Math.min(1,FWR.scale+0.1);FLY.fast=0;}}else FLY.fast=0;}}
  const cam=flyCam(Math.max(dtR,0.001));if(FL.wx)wxEnv(FWR.E);fwRender(cam,flyItems(cam),dtR);flyHUD(dtR,cam);flyAudio(cam);}
// пыль на разбеге, брызги на воде, дым подбитого мотора, обломки
function flyFx(dt){const me=FL.me,E=FW.S,M=FL.mi;
  // дымовая шашка у следующей цели: видно издалека, куда лететь (и откуда дует ветер)
  const tg=M&&!M.over&&M.target?M.target():null;if(tg){const d=Math.hypot(tg[0]-me.p[0],tg[2]-me.p[2]);FLY.smk=(FLY.smk||0)+dt;if(d<6000&&d>40&&FLY.smk>0.12){FLY.smk=0;const gy=Math.max(0,fwHgt(E,tg[0],tg[2]));
    fwPart(tg[0]+(Math.random()-0.5)*3,gy+2,tg[2]+(Math.random()-0.5)*3,FL.wind[0]*0.8+(Math.random()-0.5),3.5+Math.random(),FL.wind[2]*0.8+(Math.random()-0.5),5,26,9,[235,120,50],0.75);}}if(me.crash){if(!me.burnT)me.burnT=0;me.burnT+=dt;if(me.burnT<25&&Math.random()<dt*14)fwPart(me.p[0],me.p[1]+1,me.p[2],(Math.random()-0.5)*2,3+Math.random()*2,(Math.random()-0.5)*2,3,14,6,[54,50,46],0.6);return;}
  if(me.gnd&&me.V>6){const s=flSurf(me.p[0],me.p[2]);if(Math.random()<dt*me.V*0.8){const back=[me.p[0]-me.fw[0]*3,me.p[1]-1.2,me.p[2]-me.fw[2]*3];
    if(s.k==='water')fwPart(back[0]+(Math.random()-0.5)*2,0.3,back[2],(Math.random()-0.5)*3,2+Math.random()*2,(Math.random()-0.5)*3,0.8,4,1.2,[220,228,234],0.55,6);
    else fwPart(back[0]+(Math.random()-0.5)*2,back[1],back[2],(Math.random()-0.5),0.6,(Math.random()-0.5),0.8,5,1.6,[150,138,112],0.28);}}
  // 0.39: выхлоп мотора — сизые клубки у патрубков, чаще на полном газу; ротативный мотор дымит касторкой сильнее
  if(me.eng.run&&me.eng.rpm>0.15&&FL.meMesh&&FL.meMesh.props){const rot=me.P&&me.P.e&&me.P.e.cool==='r';if(Math.random()<dt*(4+me.eng.rpm*(rot?26:16))){const pp=FL.meMesh.props[Math.floor(Math.random()*FL.meMesh.props.length)],e=pp.eng||[pp.x,pp.y,pp.z-0.5],sd=Math.random()<0.5?-1:1;
    const ex=e[0]+sd*0.45,ey=e[1]-0.25,ez=e[2]-0.2,x=me.p[0]+me.rt[0]*ex+me.up[0]*ey+me.fw[0]*ez,y=me.p[1]+me.rt[1]*ex+me.up[1]*ey+me.fw[1]*ez,z=me.p[2]+me.rt[2]*ex+me.up[2]*ey+me.fw[2]*ez;
    fwPart(x,y,z,me.v[0]*0.9+(Math.random()-0.5)*0.6-me.rt[0]*sd*0.4,me.v[1]*0.9+0.3,me.v[2]*0.9+(Math.random()-0.5)*0.6-me.rt[2]*sd*0.4,0.16+me.eng.rpm*0.1,1.4,0.7+Math.random()*0.4,rot?[150,150,158]:[128,134,146],2.55);}}
  if(me.dmg.eng>0.3||me.dmg.fire>0){if(Math.random()<dt*8)fwPart(me.p[0]+me.fw[0]*2,me.p[1],me.p[2]+me.fw[2]*2,0,1,0,1.0,4,3,me.dmg.fire>0?[40,36,34]:[110,106,102],0.4);}
  // 0.39: обшивка рвётся — клочья полотна летят с концов крыла назад (отзыв: «обшивку сорвало — где, не вижу»)
  if(me.dmg.wing>0.15&&(me.ovs===2||me.creak||me.dmg.wing>0.6)&&Math.random()<dt*(6+me.dmg.wing*30)){const sd=Math.random()<0.5?-1:1,sp=FL.meMesh?FL.meMesh.span*0.5*(0.5+Math.random()*0.5):4;
    const x=me.p[0]+me.rt[0]*sp*sd,y=me.p[1]+me.rt[1]*sp*sd+0.3,z=me.p[2]+me.rt[2]*sp*sd;fwPart(x,y,z,me.v[0]*0.35+(Math.random()-0.5)*4,me.v[1]*0.35+1+Math.random()*2,me.v[2]*0.35+(Math.random()-0.5)*4,0.45,2.2,0.3,[236,228,206],0.95);}}
function flyItems(cam){const me=FL.me,M=FL.mi,L=[],mm=FLY.mM||(FLY.mM=new Float32Array(16));m4basis(mm,me.rt,me.up,me.fw,me.p);
  L.push({mesh:FL.meMesh,M:mm,p:me.p,rpm:me.eng.run?me.eng.rpm:me.eng.rpm*0.5,pa:FL.pa,me:1,cock:cam.cock,ctl:flyCtlVis(me),wa:me.wa||0});
  M.rivals.forEach((k,i)=>{const ax=flKinAxes(k),m=k.Mx||(k.Mx=new Float32Array(16));m4basis(m,ax.rt,ax.up,ax.fw,k.p);L.push({mesh:k.mesh,M:m,p:k.p,rpm:0.95,pa:FL.pa*1.07+i});});
  (M.foes||[]).forEach((a,i)=>{if(!a.mesh)return;const m=a.Mx||(a.Mx=new Float32Array(16));m4basis(m,a.rt,a.up,a.fw,a.p);L.push({mesh:a.mesh,M:m,p:a.p,rpm:a.crash?0:a.eng.run?a.eng.rpm:0.2,pa:FL.pa*0.93+i,ctl:flyCtlVis(a),wa:a.wa||0});});
  if(M.ball&&M.ballMesh&&!(M.ball.burn&&FL.t-M.ball.burn>20)){const q=M.ball,m=M.bM||(M.bM=new Float32Array(16));m4basis(m,[1,0,0],[0,1,0],[0,0,1],[q.x,q.y,q.z]);L.push({mesh:M.ballMesh.mesh,M:m,p:[q.x,q.y,q.z],rpm:0,pa:0});}
  (FW.parked||[]).forEach(q=>{if(!q.mesh){q.mesh=air3dMesh(q.md,FW.y,q.c);const g=q.mesh.gear,gp=g.gp,fw=[Math.sin(q.a)*Math.cos(gp),Math.sin(gp),Math.cos(q.a)*Math.cos(gp)],rt=[Math.cos(q.a),0,-Math.sin(q.a)],up=v3x(fw,rt);
      const h=Math.max(g.gearY*Math.cos(gp)-g.wheelZ*Math.sin(gp),g.skidY*Math.cos(gp)-g.skidZ*Math.sin(gp));q.p=[q.x,q.y+h,q.z];q.Mx=new Float32Array(16);m4basis(q.Mx,rt,up,fw,q.p);}
    L.push({mesh:q.mesh,M:q.Mx,p:q.p,rpm:0,pa:0.3});});
  return L;}
/* ---------- звук: мотор (свой и соседей), ветер в растяжках ---------- */
function flEnProfile(md){const e=airParts(md).e,t=e.cool==='r'?'rot7':e.cool==='a'?(e.id==='a5'?'aero6':'rad9'):e.hp>300?'v12aero':e.hp>130?'v8aero':'aero6';
  const T=Object.assign({},EN_TYPE[t]||EN_TYPE.aero6),F=enFire(T.c),p=Object.assign({kind:'ic',cyc:2},T,F,{type:t});p.open=1;p.muff=1800;return p;}
function flyAudioStart(){const c=AU.ctx;if(!c)return;try{enLoad();}catch(_){}const g=c.createGain();g.gain.value=0;g.connect(AU.fx);
  const nz=c.createBufferSource();nz.buffer=AU.noise;nz.loop=true;const bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=700;bp.Q.value=0.6;const wg=c.createGain();wg.gain.value=0;nz.connect(bp);bp.connect(wg);wg.connect(AU.fx);nz.start();
  // 0.39: шум дождя по обшивке (узкая полоса шума), гром — отдельными раскатами (wxThunder)
  const rb=c.createBiquadFilter();rb.type='bandpass';rb.frequency.value=3800;rb.Q.value=0.5;const rn=c.createGain();rn.gain.value=0;nz.connect(rb);rb.connect(rn);rn.connect(AU.fx);
  FLY.au={g,nz,bp,wg,rn,slots:new Map(),nid:900};g.gain.setTargetAtTime(1,c.currentTime,0.4);
  const tryW=()=>{if(!FL.on||!FLY.au)return;if(EN.ok){FLY.au.wk=enStart(g);}else setTimeout(tryW,300);};tryW();
  try{if(AU.mus)AU.mus.gain.setTargetAtTime(AU.on.music?0.05:0,c.currentTime,0.5);}catch(_){}
  // 0.39: в полёте граммофон молчит — только ветер и мотор; у трибун играет духовой оркестр (марш слышен с земли и на бреющем, вдали стихает)
  try{AU.flyHold=true;musicPlay();}catch(_){}
  if(FW&&FW.band&&FL.mi.stands&&AU.on.music){try{const a=new Audio('music/own_avto.m4a');a.loop=true;a.volume=0;a.preload='auto';const pr=a.play();if(pr&&pr.catch)pr.catch(()=>{});FLY.band=a;}catch(_){}}
  if(FL.mi.stands){try{auSfx('cheer',0.8);}catch(_){}
    // 0.37: гул толпы у трибун — запись, по кругу; громкость — по расстоянию от камеры до трибун
    try{ambBuf('crowd_big').then(b=>{const A=FLY.au;if(!b||!A||A.crowd||!FL.on)return;const src=c.createBufferSource();src.buffer=b;src.loop=true;const cg=c.createGain();cg.gain.value=0;
      const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=9000;src.connect(lp);lp.connect(cg);cg.connect(AU.fx);src.start();A.crowd={src,cg,lp};});}catch(_){}}}
function flyAudio(cam){const a=FLY.au,c=AU.ctx;if(!a||!c)return;const me=FL.me,t=c.currentTime,V=me.V,w=clamp((V-8)/70,0,1.2);
  if(a.crowd&&FW&&FW.S&&FW.S.A){const f=FW.S.A,sx=f.x+f.r*0.62,sz=clamp(cam.eye[2],f.z-130,f.z+130),d=Math.hypot(cam.eye[0]-sx,cam.eye[1]-fwHgt(FW.S,sx,sz),cam.eye[2]-sz);
    a.crowd.cg.gain.setTargetAtTime((AU.on.sfx?1:0)*(cam.cock?0.5:0.8)/(1+Math.pow(d/70,1.5)),t,0.4);a.crowd.lp.frequency.setTargetAtTime(clamp(16000/(1+d/90),900,12000),t,0.4);}
  const ov=me.ovs===2||me.creak?1:me.ovs===1?0.5:0,gst=FL.wx?clamp(FL.wx.ws/10,0,1)*(0.5+0.5*wxN(FL.wx.t*0.25,FL.wx.ph[0]))*(1+(me.turb||0)):0;
  if(a.rn)a.rn.gain.setTargetAtTime((FL.wx?FL.wx.rain*(cam.cock?0.2:0.1):0)*(AU.on.sfx?1:0),t,0.5);
  if(FLY.band&&FW&&FW.band){const b=FW.band,d=Math.hypot(cam.eye[0]-b.x,cam.eye[1]-b.y,cam.eye[2]-b.z),v=clamp(0.85/(1+Math.pow(d/90,1.7)),0,0.85)*(AU.on.music?1:0)*(cam.cock?0.55:1)*(AU.on.vol!==undefined?AU.on.vol:1)*(1-0.5*clamp((me.eng.rpm||0)-0.3,0,1)*(cam.cock?1:0));try{FLY.band.volume=clamp(v,0,1);}catch(_){}}
  a.wg.gain.setTargetAtTime(((cam.cock?0.16:0.07)*w*w+ov*0.22+gst*0.06)*(AU.on.sfx?1:0),t,ov?0.08:0.25);a.bp.frequency.setTargetAtTime(ov?160+Math.random()*120:500+V*14,t,ov?0.05:0.3);
  if(!a.wk||EN.node!==a.wk)return;const msgs=[],set=[],pick=[me];
  const others=FL.mi.rivals.concat(FL.mi.foes||[]).filter(x=>!x.crash).map(x=>[Math.hypot(x.p[0]-me.p[0],x.p[1]-me.p[1],x.p[2]-me.p[2]),x]).sort((p,q)=>p[0]-q[0]).slice(0,2);others.forEach(o=>{if(o[0]<900)pick.push(o[1]);});
  for(const [x,sl] of a.slots)if(!pick.includes(x)){msgs.push({t:'rm',id:sl.id});a.slots.delete(x);}
  for(const x of pick){if(!a.slots.has(x)){const p=flEnProfile(x.md||FL.cfg.md),id=a.nid++;a.slots.set(x,{id,p});msgs.push({t:'mk',id,p});}}
  for(const [x,sl] of a.slots){const p=sl.p;let rpm,g,pan=0,lp=14000,ld;
    if(x===me){const run=me.eng.run&&me.fuel>0;rpm=run?(p.idle+(p.max-p.idle)*clamp(me.eng.rpm,0,1.1)):p.idle*0.3*clamp(V/30,0,1);ld=run?me.thr:0;g=run?(cam.cock?1:0.75):0.08;lp=cam.cock?6500:12000;if(me.crash){g=0;rpm=0;}}
    else{const dx=x.p[0]-cam.eye[0],dy=x.p[1]-cam.eye[1],dz=x.p[2]-cam.eye[2],d=Math.hypot(dx,dy,dz)||1;rpm=p.idle+(p.max-p.idle)*0.92;ld=0.9;g=0.9/(1+Math.pow(d/20,1.3));pan=clamp((dx*cam.rt[0]+dz*cam.rt[2])/d,-1,1)*0.8;lp=clamp(15000/(1+d/40),700,15000);
      const xv=x.kin?[Math.sin(x.psi)*x.V,0,Math.cos(x.psi)*x.V]:x.v,vr=((xv[0]-me.v[0])*-dx+(xv[1]-me.v[1])*-dy+(xv[2]-me.v[2])*-dz)/d;rpm*=clamp(343/(343-clamp(vr,-80,80)),0.8,1.25);}
    set.push({id:sl.id,rpm,ld,g:g*(AU.on.sfx?1:0),pan,lp,spd:V});}
  msgs.push({t:'set',v:set,r:null});for(const m of msgs)a.wk.port.postMessage(m);}
function flyAudioStop(){const a=FLY.au,c=AU.ctx;if(!a||!c)return;const t=c.currentTime;a.g.gain.setTargetAtTime(0,t,0.1);a.wg.gain.setTargetAtTime(0,t,0.1);if(a.crowd)a.crowd.cg.gain.setTargetAtTime(0,t,0.1);const wk=a.wk;setTimeout(()=>{try{a.nz.stop();}catch(_){}try{if(a.crowd){a.crowd.src.stop();a.crowd.cg.disconnect();}}catch(_){}if(wk&&EN.node===wk)enStop();try{a.g.disconnect();a.wg.disconnect();}catch(_){}},400);FLY.au=null;
  try{auApply();}catch(_){}}
/* ---------- итог ---------- */
function flyEnd(title,text,cls){const b=document.getElementById('fEnd'),M=FL.mi;FLY.warp=1;
  setTimeout(()=>{if(!FL.on||FL.mi!==M)return;b.innerHTML=`<h2 class="${cls||''}">${esc(title)}</h2><p>${text}</p><div class="btns"><button class="btn primary" id="fEndOk">Принять</button><button class="btn" id="fEndLook">Осмотреться</button></div>`;b.hidden=false;
    document.getElementById('fEndOk').onclick=()=>{try{if(M.apply)M.apply();}catch(e){console.error(e);}flyClose();save();render();};
    document.getElementById('fEndLook').onclick=()=>{b.hidden=true;setTimeout(()=>{if(FL.on&&FL.mi===M)b.hidden=false;},6000);};},M.res&&M.res.kind==='crash'||FL.me.crash?2600:900);}
function flyClose(){if(!FL.on&&!FLY.el)return;FL.on=false;cancelAnimationFrame(FLY.raf);flyAudioStop();if(FLY.band){try{FLY.band.pause();}catch(_){}FLY.band=null;}try{AU.flyHold=false;musicPlay();}catch(_){}try{fwDispose();}catch(e){console.warn(e);}FL.me=null;FL.mi=null;
  const cv=document.getElementById('rgl');if(cv&&FLY.cvParent){if(FLY.cvNext&&FLY.cvNext.parentNode===FLY.cvParent)FLY.cvParent.insertBefore(cv,FLY.cvNext);else FLY.cvParent.appendChild(cv);cv.hidden=true;}
  if(FLY.el)FLY.el.hidden=true;document.body.classList.remove('flying');}
// 3D не вышло: результат — по расчёту, как без съёмки
function flyFail(e){console.warn('fly',e);const M=FL.mi;flyClose();try{toast('3D-полёт недоступен — результат по расчёту');}catch(_){}try{if(M&&M.fallback)M.fallback();}catch(err){console.error(err);}try{save();render();}catch(_){}}

/* ---------- 0.39: бомбовый прицел — крестик там, куда упадёт бомба, сброшенная сейчас (прицел Райли Скотта, 1912) ---------- */
function flyAimMark(){const el=document.getElementById('fAim'),M=FL.mi,me=FL.me;if(!el)return;const want=M&&M.bombs&&!M.over&&me&&!me.gnd&&!me.crash&&(M.bombsLeft||0)>0&&(!M.aimOn||M.aimOn());if(!want){el.hidden=true;return;}
  const VP=FWR.VPf;if(!VP)return;const gy=Math.max(0,fwHgt(FW.S,me.p[0],me.p[2])),h=Math.max(1,me.p[1]-gy);
  // падение с сопротивлением (как в frBombs: горизонтальная скорость гаснет ~5 %/с): t из h≈g t²/2, снос ≈ v·(1−e^{−0.05t})/0.05
  const tf=Math.sqrt(2*h/FLG),kx=(1-Math.exp(-0.05*tf))/0.05;const p=[me.p[0]+me.v[0]*kx,gy,me.p[2]+me.v[2]*kx];
  const cw=VP[3]*p[0]+VP[7]*p[1]+VP[11]*p[2]+VP[15],x=(VP[0]*p[0]+VP[4]*p[1]+VP[8]*p[2]+VP[12])/cw,y=(VP[1]*p[0]+VP[5]*p[1]+VP[9]*p[2]+VP[13])/cw;
  if(!(cw>0&&Math.abs(x)<0.95&&Math.abs(y)<0.95)){el.hidden=true;return;}const W=el.parentNode.clientWidth,H=el.parentNode.clientHeight;el.hidden=false;el.style.left=((x*0.5+0.5)*W)+'px';el.style.top=((0.5-y*0.5)*H)+'px';
  const tg=M.tg;if(tg){const d=Math.hypot(p[0]-tg.x,p[2]-tg.z);el.classList.toggle('on',d<12);el.querySelector('b').textContent=d<12?'в круг':Math.round(d)+' м';}}
/* ---------- 0.39: видимые отклонения рулей: ручка плюс то, что делает сам аэроплан (автопилот, выравнивание, срыв) ---------- */
function flyCtlVis(a){const c=a.ctl||{},w=a.w||[0,0,0];const v=a.vis||(a.vis={sx:0,sy:0,rd:0});
  const tx=clamp((c.sx||0)+w[0]*0.5,-1,1),ty=clamp((c.sy||0)*0.9+w[1]*0.9+(a.ctl&&a.ctl.aCmd!=null?(a.ctl.aCmd-(a.al||0))*3:0),-1,1),tr=clamp((c.rd||0)+w[2]*1.5+(a.be||0)*2.5,-1,1);
  v.sx+=(tx-v.sx)*0.35;v.sy+=(ty-v.sy)*0.35;v.rd+=(tr-v.rd)*0.35;return v;}
/* ---------- 0.39: сводка погоды в полёте и гром ---------- */
function wxLine(me){const wx=FL.wx;if(!wx)return '';const W=flW(),agl=me.p[1]-Math.max(0,W.H(me.p[0],me.p[2])),wd=me.wd||wx.w0,ws=Math.hypot(wd[0],wd[2]),dirs=['С','СВ','В','ЮВ','Ю','ЮЗ','З','СЗ'];
  const from=dirs[Math.round(((Math.atan2(wd[0],wd[2])+Math.PI)%6.2832)/(Math.PI/4))%8];const L=[];
  L.push(ws<1.5?'штиль':`ветер ${Math.round(ws)} м/с с ${from}${!me.gnd&&agl>150?' на '+Math.round(agl/50)*50+' м':''}`);
  if(wx.rain)L.push(wx.rain>0.7?'ливень':'дождь');if(wx.vis<12)L.push(wx.vis<5?'туман':'дымка');if((me.turb||0)>0.5)L.push('болтанка');
  if(wx.storm){let best=null;for(const c of wx.storm.cells){const d=Math.hypot(c.x-me.p[0],c.z-me.p[2]);if(!best||d<best.d)best={d,c};}
    if(best){const dd=best.d-best.c.r;L.push(dd<0?'ГРОЗА — вы в ней':`гроза: ${Math.max(1,Math.round(dd/1000))} км на ${dirs[Math.round(((Math.atan2(best.c.x-me.p[0],best.c.z-me.p[2])%6.2832+6.2832)%6.2832)/(Math.PI/4))%8]}`);}}
  L.push(`${wx.temp>0?'+':''}${wx.temp}°`);return esc(L.join(' · '));}
function wxThunder(d){const c=AU.ctx;if(!c||!AU.on.sfx||!FLY.au||!AU.noise)return;const vol=clamp(1.3-d/10000,0.12,1);
  setTimeout(()=>{if(!FL.on||!FLY.au)return;try{const src=c.createBufferSource();src.buffer=AU.noise;src.loop=true;const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=90+vol*160;lp.Q.value=0.9;
    const g=c.createGain();const t=c.currentTime;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol*0.9,t+0.06+(1-vol)*0.4);g.gain.exponentialRampToValueAtTime(vol*0.35,t+0.8);g.gain.linearRampToValueAtTime(vol*0.6,t+1.3);g.gain.exponentialRampToValueAtTime(0.001,t+3.5+vol*2);
    src.connect(lp);lp.connect(g);g.connect(AU.fx);src.start(t);src.stop(t+6.5);}catch(_){}},Math.min(12000,d/340*1000));}
