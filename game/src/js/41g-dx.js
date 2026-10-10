/* ================= 0.30: ДУЭЛИ ВЖИВУЮ — ГОНКА С ЭКСПРЕССОМ, АЭРОПЛАНОМ И РЫСАКОМ =================
   Раньше дуэль приходила газетой: «машина обогнала экспресс» — и всё. Теперь в неё можно сесть за руль:
   • экспресс — дорога идёт рядом с железной дорогой; поезд трогается со станции вместе с вами, по пути стоит у полустанка,
     а перед финишем рельсы пересекают шоссе: подоспеете к переезду позже паровоза — шлагбаум закрыт, ждите;
   • аэроплан — над овалом ипподрома или аэродрома кружит биплан: взлёт, круги на высоте, вираж с креном;
   • рысак — на беговой дорожке ипподрома, у бровки, рядом с вами бежит рысак в качалке; к концу он устаёт.
   Как и гонки, дуэль «сжата»: тысяча километров до Кале — несколько минут за рулём. Соперник идёт с той же сжатой скоростью:
   её считаем по пробному заезду вашей же машины (хороший шофёр) и по истории — насколько поезд, биплан или рысак эпохи
   были быстрее или медленнее машины. Победил — ставка, слава, грамота в шкаф; проиграл — газеты посмеются. */

/* ---------- заезд: настройки гонки для дуэли ---------- */
const DX_TOWN={train:{fr:['НИЦЦА','КАЛЕ'],uk:['КАННЫ','КАЛЕ'],us:['ЛОС-АНДЖЕЛЕС','САН-ФРАНЦИСКО'],de:['БЕРЛИН','МЮНХЕН'],it:['МИЛАН','РИМ']}};
function dxRc(s,o){const d=DX_KIND[o.k],c=o.c||s.country,y=s.y,train=o.k==='train';
  const terr=train?(y<1908?'dirt':y<1920?'macadam':'asphalt'):o.k==='plane'?'dirt':'dirt';
  const span=train?clamp(o.km/Math.max(30,o.trainV||60),2,26):0.4,tw=DX_TOWN.train[c]||DX_TOWN.train.fr;
  const ev=train?[{p:0.02,k:'atmo',t:`${o.opp}: ПАРОВОЗ ДАЁТ ГУДОК — ТРОНУЛИСЬ!`},{p:0.3,k:'atmo',t:'ПОЕЗД ВСТАЁТ У ПОЛУСТАНКА: БЕРЁТ ВОДУ'},{p:0.55,k:'atmo',t:'НОЧЬ. ФАРЫ И ОГОНЬ ПАРОВОЗНОЙ ТОПКИ'},{p:0.6,k:'atmo',t:'ВПЕРЕДИ ПЕРЕЕЗД: КТО УСПЕЕТ?'}]
    :o.k==='plane'?[{p:0.01,k:'atmo',t:`${o.opp} ЗАПУСКАЕТ МОТОР «ГНОМ»`},{p:0.5,k:'atmo',t:'ТРИБУНЫ ВСТАЛИ: ВИРАЖ НАД ПОВОРОТОМ'}]
    :[{p:0.01,k:'atmo',t:`${o.opp} В КАЧАЛКЕ: ЗВОНОК — ПОШЛИ!`},{p:0.7,k:'atmo',t:'РЫСАК ВЫДЫХАЕТСЯ? ПОСЛЕДНЯЯ ПРЯМАЯ'}];
  const rc={id:'dx-'+o.k,key:'dx-'+o.k+'-'+c+'-'+mi(s),y,m:s.m,c,host:c,t:train?'road':'oval',terr,km:o.km,name:d.title+': '+o.opp,venue:o.venue,
    dx:o.k,dxO:{opp:o.opp,venue:o.venue,km:o.km,trainV:o.trainV||0,c,from:tw[0],to:tw[1]},dnfK:train?0.85:0.4,purse:0,crowd:o.k!=='train'?1:0,
    hist:d.hist,img:'',scn:{st:'grid',h0:train?7.5:14,span,ev,b:train?`Старт у вокзала: экспресс и машина трогаются вместе. Рельсы идут вдоль шоссе; ${o.opp} делает остановку у полустанка, а у самого финиша дорога пересекает пути — к переезду лучше успеть раньше паровоза.`:o.k==='plane'?'Биплан взлетает с поля внутри овала и идёт над дорожкой на высоте трибун. Кто первым пройдёт финишную черту — аэроплан или машина?':'Рысак бежит у бровки, ваша машина — по внешней. Две мили — несколько кругов по ипподрому; к концу рысак устаёт.'}};
  return rc;}

/* ---------- железная дорога вдоль шоссе (выдуманная трасса, 40b-route.js кладёт переезд) ---------- */
function dxRailBuild(trk){const n=trk.n,P=trk.pts,N=trk.N,W=trk.W,O=W/2+24,rl=(trk.rails||[]).find(q=>q.duel),jc=rl?rl.i:-1,K=Math.max(8,Math.round(70/trk.step)),side0=1;
  const i0=Math.max(0,trk.startIdx-30),i1=Math.min(n-1,trk.finishIdx+30),Q=[];
  const ySm=i=>{let a=0,c=0;for(let k=-8;k<=8;k++){const j=clamp(i+k,0,n-1);a+=P[j][1];c++;}return a/c;};
  for(let i=i0;i<=i1;i++){const u=jc<0?0:sstep(jc-K,jc+K,i),off=O*side0*(1-2*u),nearRoad=Math.abs(off)<W/2+3,y=nearRoad?P[i][1]+0.02:ySm(i)+0.32;
    Q.push([P[i][0]+N[i][0]*off,y,P[i][2]+N[i][1]*off,0,i,off]);}
  // переход с насыпи на переезд — плавно
  for(let k=1;k<Q.length-1;k++){const a=Q[k-1],b=Q[k],c=Q[k+1];if(Math.abs(b[5])<W/2+14&&Math.abs(b[5])>=W/2+3)b[1]=(a[1]+b[1]+c[1])/3;}
  let cum=0;for(let k=0;k<Q.length;k++){if(k)cum+=Math.hypot(Q[k][0]-Q[k-1][0],Q[k][2]-Q[k-1][2]);Q[k][3]=cum;}
  const sAt=i=>{const k=clamp(i-i0,0,Q.length-1);return Q[k][3];};
  trk.dxRail={P:Q,L:cum,i0,i1,jc,O,side0,sStart:sAt(trk.startIdx),sFin:sAt(trk.finishIdx),sCross:jc<0?-1:sAt(jc),
    grid:(()=>{const g={};Q.forEach((q,k)=>{const key=Math.floor(q[0]/30)+','+Math.floor(q[2]/30);(g[key]=g[key]||[]).push(k);});return g;})()};
  if(rl)rl.dxS=trk.dxRail.sCross;}
// точка пути на расстоянии s: позиция, направление
function dxPathAt(D,s){const P=D.P;s=clamp(s,0,D.L);let lo=0,hi=P.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(P[m][3]<=s)lo=m;else hi=m;}
  const a=P[lo],b=P[hi],L=b[3]-a[3]||1,t=clamp((s-a[3])/L,0,1),dx=b[0]-a[0],dz=b[2]-a[2],l=Math.hypot(dx,dz)||1;
  return {x:a[0]+dx*t,y:a[1]+(b[1]-a[1])*t,z:a[2]+dz*t,tx:dx/l,tz:dz/l,k:lo};}
// рядом ли точка с рельсами (для декораций: дома, деревья, столбы не ставим на пути)
function dxRailNear(trk,x,z,r){const D=trk&&trk.dxRail;if(!D)return false;const cx=Math.floor(x/30),cz=Math.floor(z/30),P=D.P;
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const L=D.grid[(cx+a)+','+(cz+b)];if(!L)continue;for(const k of L){const j=Math.min(P.length-1,k+1),A=P[k],B=P[j],dx=B[0]-A[0],dz=B[2]-A[2],l2=dx*dx+dz*dz||1;
    let t=((x-A[0])*dx+(z-A[2])*dz)/l2;t=t<0?0:t>1?1:t;const qx=A[0]+dx*t-x,qz=A[2]+dz*t-z;if(qx*qx+qz*qz<r*r)return true;}}return false;}
// путь над овалом / у бровки: точки трассы со сдвигом внутрь (знак кривизны), полный круг; s по кругу
function dxOvalPath(trk,off,y0){const n=trk.n,P=trk.pts,N=trk.N;let kS=0;for(let i=0;i<n;i++)kS+=trk.K[i];const inn=kS>=0?1:-1,Q=[];
  for(let i=0;i<=n;i++){const j=i%n,p=P[j],nn=N[j];Q.push([p[0]+nn[0]*off*inn,p[1]+y0,p[2]+nn[1]*off*inn,0,j,off*inn]);}
  let cum=0;for(let k=0;k<Q.length;k++){if(k)cum+=Math.hypot(Q[k][0]-Q[k-1][0],Q[k][2]-Q[k-1][2]);Q[k][3]=cum;}return {P:Q,L:cum,lap:cum,inn};}

/* ---------- темп соперника: пробный заезд вашей машины (хороший шофёр) и история ---------- */
function dxCalib(trk,me){const c=mkRaceCar({you:false,player:false,name:'',label:'',drvName:'',sk:0.86,md:me.md,prep:me.prep,tyre:me.tyreType,gear:me.gearSet,color:'#333',pw:me.pw,relK:1},R.rc.y,trk);
  wearSetup(c,trk,R.rc);c.punctRate=0;c.rel=0.999;c.fuelRate=0;const st=trk.startIdx;c.idx=st;const p=trk.pts[st],t=trk.T[st];c.x=p[0];c.z=p[2];c.yaw=Math.atan2(t[0],t[1]);trackLocal(trk,c);
  const dt=1/15,lim=(trk.cfg.dur||200)*4;let tm=0,lap=c.lap;const hz=R.hz0;R.hz0=0;
  // пробный заезд — без невезения: проколы и износ не в счёт (их у соперника тоже нет)
  try{while(tm<lim){aiControl(c,trk,dt);for(let k=0;k<2;k++)carStep(c,trk,dt/2);if(c.punct||c.tyre>60){c.tp=[0,0,0,0];c.tw=[0,0,0,0];twSync(c);c.flat=false;}c.tyreSwap=false;c.stopT=0;c.dmg=0;tm+=dt;if(c.prog>=trk.raceLen)break;if(c.vx<0.5&&tm>20&&c.prog<5)break;}}catch(e){console.warn('dxCalib',e);}
  R.hz0=hz;return c.prog>=trk.raceLen?tm:Math.max(tm,trk.raceLen/Math.max(5,c.vtop*0.6));}
// во сколько раз соперник медленнее хорошего шофёра на этой машине (1 — вровень): по истории эпохи
function dxPace(R0,o,me){const st=me.st||{},v=(st.vmax||me.vtop||20)*3.6,y=R0.rc.y;
  if(o.k==='train'){const road=clamp(0.42+0.009*(y-1905),0.42,0.62),q=clamp((o.trainV||60)/Math.max(20,Math.min(v*road,95)),0.5,1.1);return clamp(1+(1-q)*0.35,0.99,1.12);}
  const vo=DX_KIND[o.k].opp(y),q=clamp(vo/Math.max(15,v*(o.k==='plane'?0.85:0.8)),0.5,1.3);return clamp(1+(1-q)*0.35,0.96,1.12);}
// профиль скорости: разгон a, крейсерская vc, остановка у полустанка (поезд), усталость (рысак), подход к станции
function dxSpeed(D,s){const k=D.k,a=D.acc;if(D.stopAt>0&&s>D.stopAt-D.vc*D.vc/(2*a)&&s<D.stopAt&&!D.stopDone)return Math.max(1.5,Math.sqrt(Math.max(0,2*a*(D.stopAt-s))));
  let v=D.vc;if(k==='horse'&&s>D.L*0.72)v=D.vc*(1-0.12*clamp((s-D.L*0.72)/(D.L*0.2),0,1));
  if(k==='train'){const left=D.L-s;if(left<D.vc*D.vc/(2*a*0.7))v=Math.min(v,Math.max(3,Math.sqrt(2*a*0.7*left)));}
  return v;}
function dxTimeFor(D,vc){const save=D.vc;D.vc=vc;let s=0,v=0,t=0,stopped=false;const dt=0.25;D.stopDone=false;
  while(s<D.L&&t<3600){const tv=dxSpeed(D,s);v=v<tv?Math.min(tv,v+D.acc*dt):Math.max(tv,v-D.acc*1.6*dt);
    if(D.stopAt>0&&!D.stopDone&&s>=D.stopAt-0.5&&v<2){t+=D.stopT;D.stopDone=true;stopped=true;}s+=Math.max(0.5,v)*dt;t+=dt;}
  D.vc=save;D.stopDone=false;return t;}
function dxSolve(D,T){let lo=2,hi=200;for(let it=0;it<40;it++){const m=(lo+hi)/2;if(dxTimeFor(D,m)>T)lo=m;else hi=m;}return (lo+hi)/2;}

/* ---------- старт дуэли ---------- */
function dxRaceStart(){const rc=R.rc,o=Object.assign({k:rc.dx},rc.dxO||{}),trk=R.trk,me=R.me||R.team[0];if(!me)return;
  const D={k:rc.dx,short:o.k==='train'?'Экспресс':o.k==='plane'?'Биплан':'Рысак',name:o.k==='train'?o.opp:o.k==='plane'?'Биплан: '+o.opp:'Рысак '+o.opp,opp:o.opp,s:0,v:0,t:0,fin:null,acc:0.3,stopAt:-1,stopT:0,stopDone:false,pos:[0,0,0],tan:[0,1],lap:0,flash:0,saidAhead:0,said:{}};
  if(D.k==='train'){const RD=trk.dxRail;if(!RD){R.dx=null;return;}D.P=RD;D.L=RD.sFin-RD.sStart;D.s0=RD.sStart;D.acc=0.16;D.stopAt=D.L*0.3;D.stopT=12;D.cross=RD.sCross-RD.sStart;}
  else{const laps=trk.cfg.laps||3,path=dxOvalPath(trk,D.k==='plane'?trk.W/2+16:trk.W/2-1.6,D.k==='plane'?0:0);D.P=path;D.lapL=path.L;D.L=path.L*laps;D.s0=0;
    // старт: у линии старта (точка пути с её индексом)
    let k0=0;for(let k=0;k<path.P.length;k++)if(path.P[k][4]===trk.startIdx){k0=k;break;}D.s0=path.P[k0][3];D.acc=D.k==='plane'?1.4:2.2;D.alt=0;}
  // темп: пробный заезд вашей машины, поправка эпохи
  const tAI=dxCalib(trk,me),f=dxPace(R,o,me);D.T=tAI*f;D.tAI=tAI;D.f=f;
  // гонка «сжата» — и разгон сжат: поезд выходит на ход секунд за 12 (на самом деле — за пару минут), рысак — за 4, биплан разбегается секунд 10
  const tAcc=D.k==='train'?12:D.k==='plane'?10:4;let vc=D.L/Math.max(10,D.T)*1.15;for(let it=0;it<3;it++){D.acc=Math.max(0.15,vc/tAcc);vc=dxSolve(D,D.T);}D.vc=vc;D.acc=Math.max(0.15,vc/tAcc);
  R.dx=D;dxPlace(D);}
// где соперник: точка пути (круги — по модулю круга), для поезда — от станции
function dxPlace(D){const sp=D.s0+D.s,s=D.lapL?((sp%D.lapL)+D.lapL)%D.lapL:sp,q=dxPathAt(D.P,s);
  let y=q.y;if(D.k==='plane'){y+=D.alt;}D.pos=[q.x,y,q.z];D.tan=[q.tx,q.tz];D.k0=q.k;}
// прогресс соперника по трассе (для табло): точка пути знает индекс трассы
function dxProg(D){const T=R.trk,P=D.P.P,i=P[clamp(D.k0||0,0,P.length-1)][4];if(D.lapL){const lap=Math.floor((D.s0+D.s)/D.lapL);return lap*T.len+i*T.step;}return (i-T.startIdx)*T.step;}

/* ---------- ход соперника (каждый шаг гонки) ---------- */
function dxTick(dt){const D=R&&R.dx;if(!D||R.t<=0)return;if(D.fin!==null){D.v=Math.max(0,D.v-dt*2);if(D.k!=='train'){D.s+=D.v*dt;dxPlace(D);}return;}
  D.t+=dt;const tv=dxSpeed(D,D.s);D.v=D.v<tv?Math.min(tv,D.v+D.acc*dt):Math.max(tv,D.v-D.acc*1.6*dt);
  if(D.stopAt>0&&!D.stopDone&&D.s>=D.stopAt-0.5&&D.v<2){D.stopLeft=(D.stopLeft===undefined?D.stopT:D.stopLeft)-dt;D.v=0;if(D.stopLeft<=0){D.stopDone=true;if(R.mode!=='sim')rMsgT(`${D.name} ТРОГАЕТСЯ ОТ ПОЛУСТАНКА`,1.6);try{dxWhistle(D);}catch(_){}}}
  else D.s+=D.v*dt;
  // аэроплан: разбег по полю, отрыв, набор высоты; на кругах — 26–34 м
  if(D.k==='plane'){const tk=D.v/Math.max(1,D.vc);D.alt+=((tk>0.75?28+4*Math.sin(D.t*0.3):0)-D.alt)*Math.min(1,dt*(tk>0.75?0.35:2));}
  if(D.s>=D.L){D.fin=R.time;D.s=D.L;if(R.mode!=='sim'){const me=R.me;if(!me||me.fin===null){rMsg(D.k==='train'?'ЭКСПРЕСС ПРИБЫЛ НА СТАНЦИЮ!':D.k==='plane'?'АЭРОПЛАН ПРОШЁЛ ФИНИШ!':'РЫСАК НА ФИНИШЕ!',2.6);try{auSfx('cheer',0.6);}catch(_){}}}}
  dxPlace(D);if(D.k==='plane'&&R.mode!=='sim')try{dxPlaneSnd(D);}catch(_){}
  // поезд у переезда: шлагбаум закрыт, пока паровоз и вагоны рядом
  if(D.k==='train'){const rl=(R.trk.rails||[]).find(q=>q.duel);if(rl){const head=D.s,tail=D.s-DX_TRAIN_LEN,c=D.cross;const near=head>c-260&&tail<c+12;rl.gate=clamp((rl.gate||0)+(near?1:-1)*dt*0.9,0,1);
      rl.dxBlock=head>c-6&&tail<c+6;}
    // гудок перед переездом и у станции
    if(!D.said.cross&&D.s>D.cross-300){D.said.cross=1;try{dxWhistle(D);}catch(_){}}}
  // кто впереди — подсказка игроку (раз в несколько секунд при смене лидера)
  const me=R.me;if(me&&R.mode!=='sim'&&me.fin===null&&!me.dnf){const ahead=dxProg(D)>me.prog;if(ahead!==D.wasAhead&&R.time>4){D.wasAhead=ahead;if(R.time-(D.aheadT||-99)>6){D.aheadT=R.time;rMsgT(ahead?`${D.name} ВПЕРЕДИ!`:'ВЫ ВПЕРЕДИ!',1.4);}}}}
const DX_TRAIN_LEN=9.8+5.4+4*10+5*0.6;
// поезд на переезде: машина, въехавшая под паровоз или вагоны, — авария (как у обычного поезда)
function dxTrainCheck(c,trk){const rl=(trk.rails||[]).find(q=>q.duel);if(!rl||!rl.dxBlock||c.dnf||c.fin!==null)return;let di=c.idx-rl.i;const d=Math.abs((di+(c.segT||0))*trk.step);
  if(d<4.5&&Math.abs(c.lat)<trk.W/2+0.5){if(!c.trainHit){c.trainHit=1;crashNote(c,Math.max(Math.hypot(c.vx,c.vy),12),'train');}}else c.trainHit=0;}
function dxWhistle(D){if(typeof AMB==='undefined'||!AMB.on||!AU.ctx)return;const id=R.trk.cfg.host==='us'&&AMB.buf.steam_whistle_us?'steam_whistle_us':'steam_whistle';
  if(AMB.buf[id])ambShot(id,()=>[D.pos[0],D.pos[2]],AMB_L.whistle,{dur:4,fade:0.2,force:1,r0:3});else{ambBuf(id);try{auSfx('whistle',0.5);}catch(_){}}}

/* ---------- итог: время по-историческому (часы пути), газета и ставка — 43f-duelx.js ---------- */
function dxOutcome(){const D=R&&R.dx,me=R.me||R.team[0];if(!D||!me)return null;const o=R.rc.dxO||{},dnf=!!me.dnf||me.fin===null;
  // время соперника — по истории: поезд идёт со своей средней, биплан и рысак — со своей; ваше — в той же пропорции, что в заезде
  const tOpR=D.fin!==null?D.fin:D.t+(D.L-D.s)/Math.max(1,D.vc),k=R.rc.dx,hist=k==='train'?o.km/Math.max(20,o.trainV)*60:o.km/Math.max(10,DX_KIND[k].opp(R.rc.y))*60;
  const tMe=dnf?null:hist*me.fin/Math.max(1,tOpR),win=!dnf&&(D.fin===null||me.fin<D.fin);
  return {played:1,win,tMe,tOp:hist,brk:me.stopN||0,fatal:dnf,stall:dnf,v:tMe?Math.round(o.km/(tMe/60)):0,opp:Math.round(o.km/(hist/60)),gapS:D.fin!==null&&me.fin!==null?me.fin-D.fin:null};}

/* ---------- приборная доска дуэли: кто впереди и на сколько ---------- */
function dxHUD(F){const D=R&&R.dx;let el=document.getElementById('rDx');if(!D||!F){if(el)el.hidden=true;return;}
  if(!el){el=document.createElement('div');el.id='rDx';el.className='r-dx';document.getElementById('raceScreen').appendChild(el);}el.hidden=false;
  const T=R.trk,me=F,pO=dxProg(D),pM=me.prog,L=T.raceLen,ico=D.k==='train'?'🚂':D.k==='plane'?'✈️':'🐎',gap=pO-pM,v=Math.max(4,me.vx||0);
  const txt=D.fin!==null&&me.fin===null?`${D.short} уже на финише`:me.fin!==null?(D.fin===null||me.fin<D.fin?'Вы первыми на финише!':'Соперник был первым'):
    Math.abs(gap)<15?'Голова в голову!':gap>0?`${D.short} впереди на ${fmtN(Math.round(gap))} м`:`Вы впереди на ${fmtN(Math.round(-gap))} м (≈${Math.round(-gap/v)} с)`;
  const pa=clamp(pO/L,0,1)*100,pb=clamp(pM/L,0,1)*100,sig=Math.round(pa)+'|'+Math.round(pb)+'|'+txt;if(el.dataset.s===sig)return;el.dataset.s=sig;
  el.innerHTML=`<b>${ico} ${esc(txt)}</b><div class="dxbar"><i class="op" style="left:${pa}%">${ico}</i><i class="me" style="left:${pb}%">🚗</i></div>`;}
/* ---------- после дуэли: газета, ставка, грамота (43f-duelx.js) ---------- */
function dxAfterRace(rc,o,quit){const s=G;if(!s)return;try{closeSheet();}catch(_){}
  if(!o){addLog('Дуэль не состоялась.','bad');render();return;}
  if(quit&&!o.win){o.fatal=true;o.stall=true;}
  dxResolve(s,o);try{if(o.win)celebrate(rc.dx==='train'?'Быстрее экспресса!':rc.dx==='plane'?'Быстрее аэроплана!':'Быстрее рысака!',rc.dxO?rc.dxO.venue:'','⚔️','duel');}catch(_){}
  save();render();}

/* ---------- звук биплана: ротативный «Гном» — гул с дребезгом; громкость по расстоянию до слушателя ---------- */
let DXS=null;
function dxPlaneSnd(D){if(!AU.ctx||!AU.on.sfx)return;const c=AU.ctx,t=c.currentTime;
  if(!DXS){const o1=c.createOscillator(),o2=c.createOscillator(),lf=c.createOscillator(),lg=c.createGain(),f=c.createBiquadFilter(),g=c.createGain(),pn=c.createStereoPanner?c.createStereoPanner():null;
    o1.type='sawtooth';o2.type='square';lf.type='sine';lf.frequency.value=11;lg.gain.value=0.35;f.type='lowpass';f.frequency.value=900;g.gain.value=0;
    o1.connect(f);o2.connect(f);const am=c.createGain();am.gain.value=0.7;f.connect(am);lf.connect(lg);lg.connect(am.gain);am.connect(g);if(pn){g.connect(pn);pn.connect(AU.fx);}else g.connect(AU.fx);
    o1.start();o2.start();lf.start();DXS={o1,o2,lf,g,pn,f};}
  const L=typeof AMB!=='undefined'&&AMB.lis?AMB.lis:{x:R3.eye[0],z:R3.eye[2]},dx=D.pos[0]-L.x,dz=D.pos[2]-L.z,d=Math.hypot(dx,dz,(D.alt||0)*0.8)+1,k=Math.min(1,(D.v||0)/Math.max(1,D.vc));
  const base=48+40*k,vol=clamp(60/d,0,1)*0.28*(0.25+0.75*k);DXS.o1.frequency.setTargetAtTime(base,t,0.2);DXS.o2.frequency.setTargetAtTime(base*2.02,t,0.2);DXS.lf.frequency.setTargetAtTime(7+9*k,t,0.3);
  DXS.f.frequency.setTargetAtTime(400+1400*clamp(60/d,0,1),t,0.2);DXS.g.gain.setTargetAtTime(vol,t,0.15);if(DXS.pn&&typeof AMB!=='undefined'&&AMB.lis&&AMB.lis.fx!==undefined){const fx=AMB.lis.fx,fz=AMB.lis.fz,rx=fz,rz=-fx;DXS.pn.pan.setTargetAtTime(clamp((dx*rx+dz*rz)/d,-1,1)*0.8,t,0.15);}}
function dxSndStop(){if(!DXS)return;const t=AU.ctx?AU.ctx.currentTime:0;try{DXS.g.gain.setTargetAtTime(0,t,0.1);}catch(_){}const S=DXS;DXS=null;setTimeout(()=>{try{S.o1.stop();S.o2.stop();S.lf.stop();S.g.disconnect();}catch(_){}},600);}
