/* ================= 0.37: ПОЛЁТ — ФИЗИКА, АВТОПИЛОТ, СОПЕРНИКИ =================
   Те же числа, что в характеристиках аэроплана (105h-air.js): взлётный вес, площадь и удлинение крыла, наибольший коэффициент
   подъёмной силы, вредное сопротивление, тяга винта по скорости, мощность мотора на высоте. Крыло срывается за критическим углом,
   у земли — подушка (меньше индуктивное сопротивление). Ручка задаёт угол атаки (как руль высоты), крен — скорость крена;
   брошенная ручка — аэроплан сам выравнивается (лётчик держит его ровно), педали — сами (координированный вираж).
   Мир (земля, вода, лес, дома) — 49j-air3d.js; экран, приборы и задания — 41m-fly.js. */
const FLG=9.81;
const d3=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],l3=a=>Math.hypot(a[0],a[1],a[2]);
const FL={on:false,wind:[0,0,0],k:1};
// мир по умолчанию (для расчётов без 3D): ровное поле на уровне 30 м
const FW0={H:()=>30,surf:()=>'grass',obst:()=>null};
function flW(){return (typeof FW!=='undefined'&&FW&&FW.H)?FW:FW0;}
/* ---------- аэроплан ---------- */
function flCraft(md,y,o){o=o||{};const st=airStats(md,y),A=st.A,P=A.P,gr=air3dGear(md,y);
  const CLa=2*Math.PI*A.ar/(A.ar+2),a0=-0.035,as=a0+A.clm/CLa,Vs=airVs(A,0);
  const ac={md,y,st,A,P,gr,CLa,a0,as,an:a0-0.75*A.clm/CLa,Vs,qRef:0.5*RHO0*Math.pow(Vs*1.3,2),
    mE:A.W-A.fuel,fuel:A.fuel*(o.fuelK===undefined?1:o.fuelK),fuelMax:A.fuel,m:A.W,
    p:[0,0,0],v:[0,0,0],fw:[0,0,1],up:[0,1,0],rt:[1,0,0],w:[0,0,0],
    thr:0,eng:{run:1,rpm:0,fail:null,smoke:0},dmg:{eng:0,wing:0,tail:0,pil:0,fire:0},hp:1,
    gnd:1,th:gr.gp,sea:st.sea,rail:!!P.g.rail,tr:a0+0.12,al:0,be:0,V:0,n:1,stall:0,drop:0,crash:null,hard:0,
    ctl:{sx:0,sy:0,rd:0,thr:0,brk:0},brakes:P.g.id==='g3',ovs:0,starts:0,pm:Math.max(40,st.roll*1.5)*Math.PI/180,tractor:!(P.f.id==='fp'||P.f.id==='fc'),
    tau:0.08+Math.min(0.22,A.W/20000),kA:o.kA||4.6,trimK:o.trimK===undefined?1.4:o.trimK,lvlK:o.lvlK===undefined?1.1:o.lvlK,
    name:md.name,dist:0,air:0,t:0,rnd:o.rnd||Math.random,ai:o.ai||null,team:o.team||0,id:o.id||0};
  ac.thMax=gr.gp>0.05?gr.gp:0.14;ac.burn=A.hpN*A.P.e.sfc/3600;ac.haz=-Math.log(clamp(st.rel,0.2,0.9999))/3600;return ac;}
// высота центра тяжести над землёй на колёсах при угле тангажа th (хвост на земле — при th = gp)
function flHcg(ac,th){const g=ac.gr,c=Math.cos(th),s=Math.sin(th);return Math.max(g.gearY*c-g.wheelZ*s,g.skidY*c-g.skidZ*s);}
// поставить: на землю (gnd) — по курсу hdg; в воздух — на высоте и скорости
function flPlace(ac,x,z,hdg,air){const W=flW(),gy=Math.max(W.H(x,z),ac.sea?0:-1e9);
  const s=Math.sin(hdg),c=Math.cos(hdg);
  if(!air){ac.gnd=1;ac.th=ac.gr.gp;const ct=Math.cos(ac.th),st=Math.sin(ac.th);ac.fw=[s*ct,st,c*ct];ac.rt=[c,0,-s];ac.up=v3x(ac.fw,ac.rt);ac.p=[x,gy+flHcg(ac,ac.th),z];ac.v=[0,0,0];ac.w=[0,0,0];}
  else{ac.gnd=0;ac.fw=[s,0,c];ac.rt=[c,0,-s];ac.up=[0,1,0];ac.p=[x,gy+air.h,z];const V=air.v||ac.Vs*1.6;ac.v=[s*V,0,c*V];ac.thr=ac.ctl.thr=air.thr===undefined?0.8:air.thr;
    const qd=0.5*RHO0*airSig(ac.p[1])*V*V;ac.tr=clamp(ac.a0+ac.m*FLG/Math.max(1,qd*ac.A.S*ac.CLa),ac.an,ac.as-0.02);ac.w=[0,0,0];}
  ac.p0=[x,ac.p[1],z];ac.gy0=gy;}
/* ---------- аэродинамика ---------- */
function flCL(ac,a){const as=ac.as,an=ac.an,CLa=ac.CLa,a0=ac.a0,clm=ac.A.clm;
  if(a>=an&&a<=as)return CLa*(a-a0);
  const fp=1.05*Math.sin(2*a);
  if(a>as){const ps=clm*(1-0.35*clamp((a-as)/0.07,0,1)),w=clamp((a-as-0.1)/0.25,0,1);return ps*(1-w)+fp*w;}
  const cmn=CLa*(an-a0),ps=cmn*(1-0.35*clamp((an-a)/0.07,0,1)),w=clamp((an-a-0.1)/0.25,0,1);return ps*(1-w)+fp*w;}
function flBank(ac){return Math.atan2(-ac.rt[1],ac.up[1]);}
function flHdg(ac){return Math.atan2(ac.fw[0],ac.fw[2]);}
function flPitch(ac){return Math.asin(clamp(ac.fw[1],-1,1));}
/* ---------- шаг физики ---------- */
function flStep(ac,dt){if(ac.crash)return;const W=flW(),A=ac.A,c=ac.ctl,h=Math.max(0,ac.p[1]),gH=Math.max(W.H(ac.p[0],ac.p[2]),0),agl=ac.p[1]-gH,rho=RHO0*airSig(h)*(FL.wx?FL.wx.sig:1),S=A.S,m=ac.m;ac.t+=dt;/* 0.39: плотность — ещё и по температуре дня */
  // мотор: газ — с запаздыванием; повреждён — тянет хуже; кончился бензин или отказал — стоит
  const run=ac.eng.run&&ac.fuel>0;ac.thr+=(clamp(c.thr,0,1)-ac.thr)*Math.min(1,dt*2.2);
  const pw=run?ac.thr*(1-ac.dmg.eng*0.75):0;
  // воздух вокруг аэроплана
  const wd=FL.wx?wxWindAt(ac.p[0],ac.p[1],ac.p[2],agl,(FL.t||0)+ac.t*0.001):FL.wind,va=[ac.v[0]-wd[0],ac.v[1]-wd[1],ac.v[2]-wd[2]],V=l3(va);ac.V=V;ac.Vg=l3(ac.v);ac.wd=wd;/* 0.39: ветер по высоте, порывы, термики, гроза */   // 0.38: Vg — путевая: «остановился» считается по ней, а не по воздушной (при ветре 3 м/с стоящий аэроплан имел V=3)
  const u=d3(va,ac.fw),vn=d3(va,ac.up),vr=d3(va,ac.rt);
  const al=V>0.5?Math.atan2(-vn,u):0,be=V>0.5?Math.asin(clamp(vr/V,-1,1)):0;ac.al=al;ac.be=be;
  const qd=0.5*rho*V*V,vh=V>0.3?[va[0]/V,va[1]/V,va[2]/V]:ac.fw;
  const CL=flCL(ac,al)*(1-ac.dmg.wing*0.45),sw=clamp((Math.abs(al)-ac.as+0.02)/0.15,0,1);
  // подушка у земли: индуктивное сопротивление меньше, когда до земли меньше размаха
  const gb=Math.max(0.5,agl)/ac.gr.span,ge=gb<1?(16*gb*gb)/(1+16*gb*gb):1;
  // винт на малом газу «мельница» — тормозит (крутое планирование без мотора)
  const CD=A.cd0*(1+ac.dmg.wing*0.6+ac.dmg.tail*0.3)+CL*CL/(Math.PI*A.ar*A.e)*ge+1.25*Math.pow(Math.sin(al),2)*sw+0.5*Math.pow(Math.sin(be),2)+(pw<0.2?ac.gr.propA*0.22*(1-pw/0.2)/S:0);
  let ld=v3x(vh,ac.rt);const ll=l3(ld)||1;ld=[ld[0]/ll,ld[1]/ll,ld[2]/ll];
  const T=pw>0?airThrust(A,Math.max(0,u),h,pw)*(FL.wx?FL.wx.sig:1):0;
  const Lf=qd*S*CL,Df=qd*S*CD,Yf=-qd*S*0.25*Math.sin(be);
  const F=[ld[0]*Lf-vh[0]*Df+ac.rt[0]*Yf+ac.fw[0]*T,ld[1]*Lf-vh[1]*Df+ac.rt[1]*Yf+ac.fw[1]*T-m*FLG,ld[2]*Lf-vh[2]*Df+ac.rt[2]*Yf+ac.fw[2]*T];
  ac.n=(Lf*d3(ld,ac.up))/(m*FLG);ac.stall=Math.abs(al)>ac.as?1:0;ac.T=T;ac.L=Lf;ac.D=Df;
  if(ac.gnd){flGround(ac,dt,F,Lf,ld,Df,T,pw,qd,V);flBurn(ac,dt,pw,run);return;}
  const a=[F[0]/m,F[1]/m,F[2]/m];
  // ---- вращение: нос идёт за траекторией, ручка добавляет угол атаки; крен — скорость крена; нос — по потоку
  const ce=clamp(qd/ac.qRef,0,1.25),ceT=ac.tractor?clamp(ce+0.5*pw*(1-Math.min(1,ce)),0,1.25):ce;
  // брошенная ручка — лётчик ведёт ровно: траектория плавно выходит в горизонт (подъём и снижение гаснут за 2–3 с)
  const gam=Math.asin(clamp(ac.v[1]/Math.max(1,l3(ac.v)),-1,1)),cphi=Math.max(0.5,Math.cos(flBank(ac)));
  const aLvl=clamp(ac.a0+m*(FLG*Math.cos(gam)-0.45*Math.max(8,V)*gam)/cphi/Math.max(1,qd*S*ac.CLa),ac.an,ac.as-0.015);
  let aCmd;if(c.aCmd!==undefined&&c.aCmd!==null)aCmd=clamp(c.aCmd,ac.an,ac.as+0.06);
  else{if(Math.abs(c.sy)<0.12)ac.tr+=(aLvl-ac.tr)*Math.min(1,dt*ac.trimK);aCmd=c.sy>=0?ac.tr+c.sy*(ac.as+0.06-ac.tr):ac.tr+c.sy*(ac.tr-ac.an-0.02);}
  // 0.39: лётчик не ломает машину сам — на большой скорости тянет ручку лишь до ~1,15 предельной перегрузки (лонжероны трещат, но держат); выход из пикирования возможен
  if(ac.dmg.pil<1){if(aCmd>ac.tr){const aL=ac.a0+ac.st.g*1.15*m*FLG/Math.max(1,qd*S)/ac.CLa;aCmd=Math.min(aCmd,Math.max(aL,ac.tr));}else{const aN=ac.a0-ac.st.g*0.6*m*FLG/Math.max(1,qd*S)/ac.CLa;aCmd=Math.max(aCmd,Math.min(aN,ac.tr));}}
  const ap=[a[0]-vh[0]*d3(a,vh),a[1]-vh[1]*d3(a,vh),a[2]-vh[2]*d3(a,vh)],Vp=Math.max(3,V);
  const qP=d3(ap,ac.up)/Vp,rP=d3(ap,ac.rt)/Vp,tail=1-ac.dmg.tail*0.6;
  let qT=qP+ac.kA*Math.min(1,ceT)*tail*(aCmd-al);
  let rT=rP+2.4*Math.min(1,ce)*be+c.rd*0.6*Math.min(1,ceT);
  const phi=flBank(ac),free=Math.abs(c.sx)<0.08&&c.lvl!==false;
  let pT=c.sx*ac.pm*Math.min(1,ce)*(1-ac.dmg.wing*0.5)-(free?ac.lvlK*phi*clamp(ac.st.stab+0.3,0.3,1.2)*Math.min(1,ce):0)-0.8*Math.min(1,ce)*be;
  // срыв: одно крыло падает раньше — аэроплан валится на крыло и в штопор, если держать ручку на себя
  if(al>ac.as+0.02){if(!ac.drop)ac.drop=ac.rnd()<0.5?-1:1;const k=clamp((al-ac.as)*7,0,1.6)*(1.3-ac.st.stab*0.6);pT+=ac.drop*k;rT+=ac.drop*k*0.5;}else if(al<ac.as-0.03)ac.drop=0;
  if(ac.dmg.pil>=1){pT=0.8;qT=-0.3;}
  // 0.39: болтанка — рывки по крену, тангажу и курсу (термики, порывы у земли, горы, гроза); сильнее на малой скорости (меньше напор — меньше демпфирование)
  if(FL.wx&&!ac.gnd){const tb=wxTurb(agl,ac.p[0],ac.p[2]);if(tb>0.02){const tt=(FL.t||0)*1.7+ac.t*0.3+(ac.id||0)*2.1,k=tb*(0.7+0.6*(1-Math.min(1,ce)));pT+=k*0.9*wxN(tt,1.3);qT+=k*0.45*wxN(tt*1.13,4.1);rT+=k*0.25*wxN(tt*0.87,2.2);ac.turb=tb;}else ac.turb=0;}
  qT=clamp(qT,-2.6,2.6);rT=clamp(rT,-1.6,1.6);pT=clamp(pT,-ac.pm*1.35-0.2,ac.pm*1.35+0.2);
  const kr=1-Math.exp(-dt/ac.tau),kp=1-Math.exp(-dt/(ac.tau*0.8));
  ac.w[0]+=(pT-ac.w[0])*kp;ac.w[1]+=(qT-ac.w[1])*kr;ac.w[2]+=(rT-ac.w[2])*kr;
  flRotate(ac,ac.w[0]*dt,ac.w[1]*dt,ac.w[2]*dt);
  // ---- движение
  ac.v[0]+=a[0]*dt;ac.v[1]+=a[1]*dt;ac.v[2]+=a[2]*dt;
  const dx=ac.v[0]*dt,dz=ac.v[2]*dt;ac.p[0]+=dx;ac.p[1]+=ac.v[1]*dt;ac.p[2]+=dz;ac.dist+=Math.hypot(dx,dz);ac.air+=dt;
  if(ac.wa!==undefined&&ac.wa>0)ac.wa*=Math.exp(-dt*0.4);/* 0.39: в воздухе колёса докручиваются и встают */
  // перегрузка: за прочностью — трещат лонжероны, за полуторной — крыло ломается
  const g=ac.st.g;if(ac.n>g*1.5||ac.n<-g*0.9)flCrash(ac,'крыло сложилось от перегрузки');else if(ac.n>g){ac.dmg.wing=Math.min(1,ac.dmg.wing+(ac.n-g)*dt*0.12);ac.creak=1;}
  {const vm=ac.st.v/3.6;ac.ovs=V>vm*1.55?2:V>vm*1.3?1:0;if(ac.ovs===2){ac.dmg.wing=Math.min(1,ac.dmg.wing+dt*0.15);ac.creak=1;if(ac.dmg.wing>=1)flCrash(ac,'флаттер — обшивку сорвало в пикировании');}}
  flBurn(ac,dt,pw,run);flContact(ac);}
// поворот осей аэроплана: крен p (вправо +), тангаж q (нос вверх +), рыскание r (вправо +)
function flRotate(ac,p,q,r){const f=ac.fw,u=ac.up,rt=ac.rt;
  const w=[-p*f[0]-q*rt[0]+r*u[0],-p*f[1]-q*rt[1]+r*u[1],-p*f[2]-q*rt[2]+r*u[2]];
  const rot=e=>{const x=v3x(w,e);return [e[0]+x[0],e[1]+x[1],e[2]+x[2]];};
  let F=v3n(rot(f)),U=rot(u);let R=v3n(v3x(U,F));U=v3x(F,R);ac.fw=F;ac.up=U;ac.rt=R;}
// бензин и мотор: расход по мощности, отказ — по надёжности (за час полёта), чаще на полном газу
function flBurn(ac,dt,pw,run){if(!run){ac.eng.rpm+=(-ac.eng.rpm+(ac.V/Math.max(20,ac.st.v/3.6))*0.35)*Math.min(1,dt*1.5);return;}
  const k=FL.k||1;ac.fuel=Math.max(0,ac.fuel-ac.burn*Math.max(0.12,pw)*dt*k);ac.m=ac.mE+ac.fuel;
  ac.eng.rpm+=((0.25+0.75*pw)*(0.85+0.15*clamp(ac.V/Math.max(20,ac.st.v/3.6),0,1.4))-ac.eng.rpm)*Math.min(1,dt*3);
  if(!FL.noFail&&ac.rnd()<ac.haz*(0.45+0.75*pw)*dt*k*(1+ac.dmg.eng*20)*(1+(FL.wx?FL.wx.rain*0.7:0))){/* 0.39: в дождь магнето капризнее */ac.eng.run=0;ac.eng.fail=ac.dmg.eng>0.3?'мотор разбит':ac.rnd()<0.5?'заглох мотор':'лопнул бензопровод';flMsg(ac,'Мотор заглох!','bad');}
  if(ac.fuel<=0&&!ac.eng.fail){ac.eng.run=0;ac.eng.fail='кончился бензин';flMsg(ac,'Кончился бензин!','bad');}}
/* 0.39: мотор стоит — что делать (отзыв: «мотор заглох? и что? как его оживить? где сервис?»)
   Завести: механик (или сам лётчик) крутит винт; в воздухе — только заглохший мотор и только на скорости (винт раскручивается потоком).
   Починить: бензопровод — полчаса в поле; разбитый мотор — только где есть люди (деревня, аэродром в 2–3 км), 3 часа и деньги.
   Заправиться: там же, где есть люди. Время идёт в зачёт перелёта. */
function flHelpNear(ac){const S=(typeof FW!=='undefined'&&FW&&FW.S)||null;if(!S)return null;let best=null;
  const put=(x,z,n,r)=>{const d=Math.hypot(ac.p[0]-x,ac.p[2]-z);if(d<r&&(!best||d<best.d))best={n,d};};
  (S.fields||[]).forEach(f=>put(f.x,f.z,'аэродром',1800));(S.towns||[]).forEach(t=>put(t.x,t.z,t.city?'город':'деревня',t.city?3500:2600));return best;}
function flEngOpts(ac){const o=[];if(ac.crash)return o;const f=ac.eng.fail||'',help=flHelpNear(ac);
  if(ac.eng.run){/* 0.39: сели в поле с работающим мотором — у деревни можно долить бензин и подлатать мотор */if(!ac.gnd||(ac.Vg||0)>1.5)return o;
    if(ac.fuel<ac.fuelMax*0.6&&help)o.push({k:'fuel',t:'Заправиться',sub:`${help.n} рядом · 40 мин`,min:40,cost:12});if(ac.dmg.eng>0.3&&help)o.push({k:'fix',t:'Ремонт мотора',sub:`${help.n} рядом · 3 ч`,min:180,cost:180});return o;}
  if(ac.gnd){if(f===''||f==='заглох мотор')o.push({k:'start',t:'Завести мотор',sub:ac.starts?'ещё раз':'крутим винт'});
    if(f==='лопнул бензопровод')o.push({k:'fix',t:'Починить бензопровод',sub:'30 мин',min:30,cost:20});
    if(f==='мотор разбит'||ac.dmg.eng>0.3){if(help)o.push({k:'fix',t:'Ремонт мотора',sub:`${help.n} рядом · 3 ч`,min:180,cost:180});else o.push({k:'no',t:'Мотор разбит',sub:'чинить негде: ни деревни, ни аэродрома рядом'});}
    if(f==='кончился бензин'){if(help)o.push({k:'fuel',t:'Заправиться',sub:`${help.n} рядом · 40 мин`,min:40,cost:12});else o.push({k:'no',t:'Бензина нет',sub:'ни деревни, ни аэродрома рядом'});}}
  else if(f==='заглох мотор'&&ac.V>ac.Vs*1.25)o.push({k:'start',t:'Запустить мотор',sub:'винт раскручен потоком'});
  return o;}
// 0.39: куда садиться вне аэродрома: ближнее поле (до 6 км), луг у деревни или просто вперёд по курсу (с мёртвым мотором — сколько хватит высоты)
function flLandSpot(ac){const S=(typeof FW!=='undefined'&&FW&&FW.S)||null,W=flW();let best=null;const agl=ac.p[1]-Math.max(0,W.H(ac.p[0],ac.p[2]));const reach=ac.eng.run?6000:Math.max(600,agl*6);
  if(S){for(const f of S.fields||[]){if(f.sea&&!ac.sea)continue;const d=Math.hypot(ac.p[0]-f.x,ac.p[2]-f.z);if(d<reach&&(!best||d<best.d))best={x:f.x,z:f.z,d,n:'аэродром'};}
    if(!best)for(const t of S.towns||[]){const d=Math.hypot(ac.p[0]-t.x,ac.p[2]-t.z);if(d<reach&&d>300&&(!best||d<best.d)){const k=(d-650)/d;best={x:ac.p[0]+(t.x-ac.p[0])*k,z:ac.p[2]+(t.z-ac.p[2])*k,d,n:t.city?'луг у города':'луг у деревни'};}}}
  if(!best){const r=Math.max(700,Math.min(reach,agl*5));best={x:ac.p[0]+ac.fw[0]*r,z:ac.p[2]+ac.fw[2]*r,d:r,n:'поле впереди'};}
  best.y=Math.max(0,W.H(best.x,best.z));return best;}
function flEngStart(ac){if(ac.crash||ac.eng.run)return false;ac.starts=(ac.starts||0)+1;const rot=ac.P.e.cool==='r';
  const p=ac.gnd?(rot?0.62:0.75)-Math.min(0.3,ac.starts*0.08):0.5;ac.starting={left:ac.gnd?(rot?7:5)+ac.starts*2:4,ok:ac.rnd()<p};return true;}
function flEngTick(ac,dt){const st=ac.starting;if(!st)return null;st.left-=dt;if(st.left>0)return 'wait';ac.starting=null;
  if(st.ok){ac.eng.run=1;ac.eng.fail=null;ac.thr=0.1;flMsg(ac,'Мотор схватил!','good');return 'ok';}flMsg(ac,'Не схватывает','bad');return 'fail';}
function flRepair(ac,kind){const help=flHelpNear(ac);if(kind==='fuel'){ac.fuel=ac.fuelMax;ac.m=ac.mE+ac.fuel;ac.eng.fail=null;ac.eng.run=1;ac.thr=0.1;return 40;}
  if(kind==='fix'){const eng=ac.eng.fail==='мотор разбит'||ac.dmg.eng>0.3;ac.eng.fail=null;ac.eng.run=1;ac.thr=0.1;ac.dmg.eng=eng?0.12:ac.dmg.eng;ac.haz*=eng?1.6:1.25;ac.starts=0;return eng?180:30;}return 0;}
function flMsg(ac,t,cls){if(ac===FL.me&&typeof flToast==='function')flToast(t,cls);}
function flCrash(ac,why){if(ac.crash)return;ac.crash=why;ac.crashT=ac.t;ac.v=[ac.v[0]*0.2,Math.min(0,ac.v[1])*0.2,ac.v[2]*0.2];if(typeof flOnCrash==='function')flOnCrash(ac,why);}
/* ---------- земля и вода ---------- */
// поверхность под аэропланом: высота (вода — 0) и что там
function flSurf(x,z){const W=flW(),g=W.H(x,z);if(g<0)return {y:0,k:'water'};return {y:g,k:W.surf(x,z)};}
function flContact(ac){const W=flW(),s=flSurf(ac.p[0],ac.p[2]),th=flPitch(ac),phi=flBank(ac),hc=flHcg(ac,clamp(th,-0.6,0.6)),tip=ac.gr.span*0.5*Math.abs(Math.sin(phi));
  const low=ac.p[1]-Math.max(hc*Math.cos(phi),tip-0.3);
  // постройки, деревья, пилоны
  const ob=W.obst(ac.p[0],ac.p[1],ac.p[2],ac.gr.span*0.35);if(ob){flCrash(ac,ob);return;}
  if(low>s.y)return;
  const vy=ac.v[1],vh=Math.hypot(ac.v[0],ac.v[2]);
  if(tip-0.3>hc&&Math.abs(phi)>0.22){flCrash(ac,s.k==='water'?'задел крылом воду':'задел крылом землю');return;}
  if(th<-0.1&&vh>8){flCrash(ac,s.k==='water'?'зарылся носом в воду':'ударился носом о землю');return;}
  if(vy<-4.6-(ac.sea?0:0.4)){flCrash(ac,s.k==='water'?'разбился о воду':'удар о землю — шасси подломилось');return;}
  if(s.k==='water'&&!ac.sea){flCrash(ac,'сел на воду — аэроплан тонет');return;}
  if(s.k!=='water'&&ac.sea&&vh>4){flCrash(ac,'гидроаэроплан на суше — поплавки разбиты');return;}
  if(s.k==='forest'){flCrash(ac,'упал в лес');return;}if(s.k==='town'){flCrash(ac,'упал на крыши');return;}if(s.k==='rock'){flCrash(ac,'разбился о скалы');return;}
  if(vh>ac.Vs*1.9&&s.k!=='field'&&s.k!=='grass'){flCrash(ac,'слишком быстро — аэроплан опрокинулся');return;}
  // жёсткая посадка — отскок и поломка
  if(vy<-2.6){ac.hp-=0.18;ac.hard++;ac.dmg.tail=Math.min(1,ac.dmg.tail+0.1);ac.v[1]=-vy*0.3;ac.p[1]=s.y+hc+0.05;flMsg(ac,'Жёсткая посадка!','bad');if(ac.hp<=0)flCrash(ac,'шасси подломилось');return;}
  // касание
  ac.gnd=1;ac.th=clamp(th,-0.05,ac.thMax);ac.v[1]=0;ac.w=[0,0,0];ac.touch=(ac.touch||0)+1;ac.tdV=vy;ac.tdS=s.k;
  const hd=flHdg(ac);flSetGnd(ac,hd,ac.th,s.y);}
function flSetGnd(ac,hdg,th,gy){const s=Math.sin(hdg),c=Math.cos(hdg),ct=Math.cos(th),st=Math.sin(th);ac.fw=[s*ct,st,c*ct];ac.rt=[c,0,-s];ac.up=v3x(ac.fw,ac.rt);ac.p[1]=gy+flHcg(ac,th);}
// разбег и пробег: колёса катятся по курсу, бок гасит трение; хвост поднимается ручкой от себя; отрыв — когда подъёмная сила больше веса
function flGround(ac,dt,F,Lf,ld,Df,T,pw,qd,V){const c=ac.ctl,m=ac.m,s=flSurf(ac.p[0],ac.p[2]),water=s.k==='water';
  if(water&&!ac.sea){flCrash(ac,'аэроплан в воде');return;}
  const hd=flHdg(ac),fh=[Math.sin(hd),0,Math.cos(hd)],vg=d3(ac.v,fh),lat=[ac.v[0]-fh[0]*vg,0,ac.v[2]-fh[2]*vg];
  if(!water)ac.wa=((ac.wa||0)+vg*dt/Math.max(0.2,ac.gr.wheelR||0.35))%6.2832;/* 0.39: колёса крутятся по путевой скорости */
  const N=Math.max(0,m*FLG-Lf*ld[1]);
  // сопротивление качению: трава, пашня, вода (горб у глиссирования), полозья
  let mu=ac.rail?0.35:s.k==='field'?0.11:0.07;if(ac.gr.gp>0.05)mu+=0.06*clamp(ac.th/ac.gr.gp,0,1)*(1+0.8*clamp(c.sy,0,1));/* костыль на хвосте пашет землю, ручка на себя — глубже */
  if(ac.brakes&&c.brk>0&&!water)mu+=0.28*clamp(c.brk,0,1)*(FL.wx&&FL.wx.rain>0.3?0.6:1);/* 0.39: колёсные тормоза (шасси 1925 года); по мокрой траве хуже */
  if(FL.wx&&FL.wx.rain>0.3&&!water)mu*=0.8;/* мокрое поле — пробег длиннее */if(water){const r=V/Math.max(5,ac.Vs);mu=0.045+0.09*Math.exp(-Math.pow((r-0.5)/0.28,2));}
  if(ac.rail&&ac.cat>0){ac.cat-=vg*dt;T+=m*FLG*0.55;mu=0.02;}
  const Fx=T*Math.cos(ac.th)-Df*Math.sign(vg||1)-mu*N*Math.sign(vg||(T>0?1:0));
  let nv=vg+Fx/m*dt;if(vg>0&&nv<0&&T<mu*N)nv=0;if(Math.abs(nv)<0.05&&T<mu*N)nv=0;
  const kl=Math.exp(-dt*(water?2:7));ac.v=[fh[0]*nv+lat[0]*kl,0,fh[2]*nv+lat[2]*kl];
  // руление: руль поворота (струя от винта и встречный поток), костыль
  const ce=clamp(qd/ac.qRef,0,1),ceT=ac.tractor?clamp(ce+0.6*pw,0,1):ce,steer=clamp(c.sx+c.rd,-1,1)*(0.25+0.55*ceT)*clamp(Math.abs(nv)/3,0,1)*(nv>=0?1:-1);
  let hdg=hd+steer*dt;
  // хвост: ручка от себя на скорости — поднимается, на себя — прижат к земле
  // у аэроплана на поплавках, лодки и полозьев (стоят ровно) — нос поднимает ручка на себя
  const gp=ac.gr.gp,tl=clamp((V-0.35*ac.Vs)/(0.5*ac.Vs),0,1)*clamp(-c.sy,0,1),thT=gp>0.05?gp*(1-tl)-(c.sy<-0.6&&V>ac.Vs*0.8?0.03:0):Math.max(0,c.sy)*ac.thMax*Math.min(1,ceT);
  ac.th+=(thT-ac.th)*Math.min(1,dt*2.2);
  ac.p[0]+=ac.v[0]*dt;ac.p[2]+=ac.v[2]*dt;ac.dist+=Math.abs(nv)*dt;
  const s2=flSurf(ac.p[0],ac.p[2]);
  if(s2.k==='forest'||s2.k==='town'){flCrash(ac,s2.k==='forest'?'выкатился в лес':'врезался в постройки');return;}
  if(s2.k==='water'&&!ac.sea){flCrash(ac,'выкатился в воду');return;}
  if(!water&&s2.k!=='water'&&Math.abs(s2.y-s.y)>Math.abs(nv)*dt*0.25+0.02&&Math.abs(nv)>6){ac.hp-=0.02;}
  const ob=flW().obst(ac.p[0],ac.p[1],ac.p[2],ac.gr.span*0.35);if(ob){flCrash(ac,ob);return;}
  if(ac.th<-0.08&&nv>5){flCrash(ac,'скапотировал — нос в землю');return;}
  // отрыв
  const al=ac.th,CL=flCL(ac,al),Lv=qd*ac.A.S*CL*Math.cos(al);
  if(Lv>m*FLG*1.01&&nv>ac.Vs*0.8){ac.gnd=0;ac.lift=(ac.lift||0)+1;ac.liftT=ac.t;flSetGnd(ac,hdg,ac.th,s2.y);ac.v[1]=0.4;ac.p[1]+=0.05;
    const q=0.5*RHO0*airSig(ac.p[1])*V*V;ac.tr=clamp(ac.a0+m*FLG/Math.max(1,q*ac.A.S*ac.CLa),ac.an,ac.as-0.02);return;}
  flSetGnd(ac,hdg,ac.th,s2.y);}
/* ---------- автопилот: курс, высота, скорость ----------
   o: {x,z — точка или hdg — курс; alt — высота над морем; spd — скорость (м/с) или thr — газ; bank — наибольший крен} */
function flAuto(ac,o){const c=ac.ctl,V=Math.max(4,ac.V),W=flW();
  let hdg=o.hdg;if(o.x!==undefined)hdg=Math.atan2(o.x-ac.p[0],o.z-ac.p[2]);
  if(ac.gnd){c.aCmd=null;c.thr=o.thr===undefined?1:o.thr;const e=angWrap(hdg-flHdg(ac));c.sx=clamp(e*2,-1,1);c.sy=ac.V>ac.Vs*1.12?0.85:ac.V>ac.Vs*0.6?-0.4:0;return;}
  const psi=flHdg(ac),e=angWrap(hdg-psi),bm=o.bank||0.6,phi=flBank(ac);
  const phiT=clamp(e*1.7,-bm,bm);c.sx=clamp((phiT-phi)*2.4-ac.w[0]*0.3,-1,1);c.lvl=false;
  const gam=Math.asin(clamp(ac.v[1]/Math.max(1,l3(ac.v)),-1,1)),cmax=Math.max(0.03,Math.min(0.35,(ac.st.climb/60)/V*0.9));
  const agl=ac.p[1]-Math.max(0,W.H(ac.p[0],ac.p[2])),floor=o.floor===undefined?40:o.floor;
  let gT=clamp(((o.alt===undefined?ac.p[1]:o.alt)-ac.p[1])*0.012,-(o.dive||0.18),cmax*(o.climbK||1));
  if(agl<floor)gT=Math.max(gT,clamp((floor-agl)*0.02,0.02,cmax));
  // скорость не ниже 1,3 посадочной: на малой скорости нос — ниже
  const vmin=ac.Vs*(o.vmin||1.3);if(V<vmin&&agl>floor*0.5)gT=Math.min(gT,gam-(vmin-V)*0.03);
  // угол атаки: нормальная перегрузка, чтобы траектория шла к нужному наклону, с поправкой на крен
  const rho=RHO0*airSig(ac.p[1]),qd=0.5*rho*V*V,den=Math.max(1,qd*ac.A.S*ac.CLa),nv=(V*1.2*(gT-gam)+FLG*Math.cos(gam))/Math.max(0.35,Math.cos(phi));
  c.aCmd=clamp(ac.a0+ac.m*nv/den,ac.an+0.02,ac.as-(o.edge?0.005:0.03));c.sy=0;
  if(o.spd!==undefined)c.thr=clamp(0.55+(o.spd-ac.V)*0.12,0,1);else c.thr=o.thr===undefined?1:o.thr;}
/* ---------- 0.38: посадка лётчиком («Сесть»): выход на дальнюю точку, глиссада 4° на круг, выравнивание у земли, пробег ----------
   A — центр поля [x,z], gy — его высота. Состояние — в ac.ld; возвращает 'ip' | 'final' | 'flare' | 'roll' | 'done' */
function flAutoLand(ac,A,gy,dt){const W=flW();let L=ac.ld;const dx=ac.p[0]-A[0],dz=ac.p[2]-A[1],d=Math.hypot(dx,dz);
  if(!L){const u=d>50?[dx/d,dz/d]:[0,1];L=ac.ld={st:d>1400?'final':'ip',u,ip:[A[0]+u[0]*1900,A[1]+u[1]*1900],t:0};}
  L.t+=dt;const agl=ac.p[1]-Math.max(0,W.H(ac.p[0],ac.p[2]));
  if(ac.gnd){ac.ctl.aCmd=null;ac.ctl.thr=0;ac.ctl.sy=(ac.Vg||0)>6?0.6:0;/* 0.39: пробег — ручку на себя (костыль пашет землю) */ac.ctl.brk=ac.brakes&&(ac.Vg||0)>4?1:0;/* и тормоза, если есть */const e=angWrap(Math.atan2(A[0]-ac.p[0],A[1]-ac.p[2])-flHdg(ac));ac.ctl.sx=d>60&&(ac.Vg||0)>3?clamp(e*2,-1,1):0;L.st=(ac.Vg||0)<2.5?'done':'roll';return L.st;}
  if(L.st==='ip'){const di=Math.hypot(L.ip[0]-ac.p[0],L.ip[1]-ac.p[2]);flAuto(ac,{x:L.ip[0],z:L.ip[1],alt:gy+130,spd:ac.Vs*1.45,floor:50,bank:0.7});if(di<220||(L.t>8&&di<400))L.st='final';return L.st;}
  // прямая: нос на круг, глиссада 4°, скорость 1,3 посадочной; ниже 7 м — выравнивание: газ долой, нос подбирать, снижение 0,6 м/с
  const glide=gy+flHcg(ac,0)+Math.max(0,d-40)*Math.tan(0.07);
  if(agl>7&&L.st!=='flare'){flAuto(ac,{x:A[0],z:A[1],alt:Math.min(glide,ac.p[1]),spd:ac.Vs*1.3,floor:0,dive:0.12,bank:0.5});L.st='final';return L.st;}
  L.st='flare';flAuto(ac,{hdg:flHdg(ac),alt:ac.p[1]-0.6,thr:0,floor:0,edge:1,bank:0.3});const V=Math.max(4,ac.V),qd=0.5*RHO0*V*V,sink=-ac.v[1];
  ac.ctl.aCmd=clamp(ac.a0+ac.m*(FLG+(sink-0.6)*1.5)/Math.max(1,qd*ac.A.S*ac.CLa),ac.an,ac.as-0.01);ac.ctl.thr=0;return L.st;}
/* ---------- соперник по кругу: летит по точкам с постоянной скоростью (результат — по истории) ---------- */
function flKin(o){return Object.assign({p:[0,0,0],psi:0,phi:0,pit:0,V:30,alt:60,bm:0.75,i:0,R:120,kin:1,lap:0},o);}
function flKinStep(k,dt){const P=k.wp;if(!P||!P.length)return;const t=P[k.i];const dx=t[0]-k.p[0],dz=t[1]-k.p[2],d=Math.hypot(dx,dz);
  if(d<k.R){k.i=(k.i+1)%P.length;if(k.i===0)k.lap++;}
  const hdg=Math.atan2(dx,dz),e=angWrap(hdg-k.psi),wm=FLG*Math.tan(k.bm)/Math.max(5,k.V),w=clamp(e*1.4,-wm,wm);
  k.psi=angWrap(k.psi+w*dt);k.phi+=(Math.atan(w*k.V/FLG)-k.phi)*Math.min(1,dt*2.5);
  const W=flW(),ga=Math.max(0,W.H(k.p[0],k.p[2])),ty=Math.max(k.alt,ga+30),vy=clamp((ty-k.p[1])*0.4,-4,4);k.pit=Math.atan2(vy,k.V);
  k.p[0]+=Math.sin(k.psi)*k.V*dt;k.p[2]+=Math.cos(k.psi)*k.V*dt;k.p[1]+=vy*dt;k.dist=(k.dist||0)+k.V*dt;}
// оси соперника для отрисовки
function flKinAxes(k){const s=Math.sin(k.psi),c=Math.cos(k.psi),cp=Math.cos(k.pit),sp=Math.sin(k.pit),fw=[s*cp,sp,c*cp],rt0=[c,0,-s],up0=v3x(fw,rt0),cb=Math.cos(k.phi),sb=Math.sin(k.phi);
  const up=[up0[0]*cb+rt0[0]*sb,up0[1]*cb+rt0[1]*sb,up0[2]*cb+rt0[2]*sb],rt=v3x(up,fw);return {fw,up,rt:v3n(rt)};}
