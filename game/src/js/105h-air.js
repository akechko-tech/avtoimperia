/* ================= 0.37: АВИАЦИЯ — РАСЧЁТ АЭРОПЛАНА, АВИАЦЕХ, РЫНОК, ВОЕННЫЕ ЗАКАЗЫ =================
   Расчёт по физике полёта (те же числа летают в 3D, 41l-flight.js):
   взлётный вес W = (моторы + топливо + полезный груз) / (1 − доля конструкции); площадь крыла S = W / нагрузка на крыло;
   скорость — из равенства мощности на винте и мощности сопротивления (вредное + индуктивное); скороподъёмность — избыток мощности;
   потолок — где подъём падает до 0,5 м/с (мощность мотора падает с плотностью воздуха); вираж — установившийся, по тяге и прочности. */
const AG=9.81,RHO0=1.225;
const airSig=h=>Math.pow(Math.max(0.05,1-h/44330),4.256);
function airParts(md){return {f:byId(AIR_FRAME,md.f)||AIR_FRAME[1],m:byId(AIR_MAT,md.m)||AIR_MAT[0],e:byId(AIR_ENG,md.e)||AIR_ENG[0],c:byId(AIR_CTL,md.c)||AIR_CTL[0],g:byId(AIR_GEAR,md.g)||AIR_GEAR[1],
  p:byId(AIR_PROP,md.p)||AIR_PROP[0],a:byId(AIR_ARM,md.a||'w0')||AIR_ARM[0],k:byId(AIR_CAB,md.k||'k1')||AIR_CAB[0],w:byId(AIR_WING,md.w||'mid')||AIR_WING[1]};}
// мощность мотора на высоте (доля от земной): обычный мотор теряет мощность с плотностью, высотный держит её до 2 км
function airPowK(e,h){const s=airSig(h),k=1.132*s-0.132;return clamp(e&&e.alt?k*e.alt:k,0,1);}
// аэродинамика и вес — основа и для экономики, и для 3D-полёта
function airAero(md,y){const P=airParts(md),n=Math.max(1,md.n||1),role=md.role||'sport';
  const hp=P.e.hp*n,engKg=P.e.kg*n,seats=Math.max(P.k.seats,P.a.obs?2:1),fuelH=(AIR_END[role]||2)*(P.k.fuel||1);
  const crew=P.f.ne[1]>1&&n>1&&role==='bomb'?2+n:seats,fuel=hp*0.75*P.e.sfc*fuelH,pay=crew*80+(P.k.mail||0)+(P.a.bomb||0)+P.a.kg+P.k.kg+10;
  const gw=P.f.boat?0:P.g.wf,gd=P.f.boat?0:P.g.drag,af=Math.min(0.62,P.f.af*P.m.wk+gw+(n>1?0.01*(n-1):0)),W=(engKg+fuel+pay)/(1-af);
  const wl=tabAt(AIR_WL,y)*(AIR_WL_R[role]||1)*P.w.wl*(P.f.race?1.25:1),S=W/wl;
  const clm=tabAt(AIR_CLM,y)+P.f.clm+(P.w.id==='big'?0.05:0);
  const cd0=(1+4/Math.max(4,S))*P.f.cd0*tabAt(AIR_CDE,y)*P.m.cd+gd+(P.a.bomb>0?0.004:0)+(P.e.cool==='w'?0.004:P.e.cool==='a'?0.003:0.002)+(n>1?0.004*(n-1):0)+(P.k.closed?0.002:0);
  return {P,n,role,hp:hp*(P.e.cool==='r'?0.92:1)*(P.e.pe||1),hpN:hp,engKg,seats,crew,fuel,fuelH,pay,af,W,S,wl,clm,cd0,ar:P.f.ar,e:P.f.e,eta:P.p.eff*(md.pk||1),strK:P.m.g};}
// сопротивление (Н) на скорости V (м/с) при плотности rho
function airDrag(A,V,rho,n){const q=0.5*rho*V*V;return q*A.S*A.cd0+Math.pow((n||1)*A.W*AG,2)/(q*A.S*Math.PI*A.ar*A.e);}
// тяга винта (Н): на расчётной скорости vd — КПД × мощность / скорость; на месте — в 1,6 раза больше (у медленного аэроплана — около 40 Н на л.с., у гоночного — 7);
// выше расчётной скорости (пикирование) винт быстро «разгружается». Без vd (подбор винта) — чистая мощность
function airThrust(A,V,h,thr){const k=airPowK(A.P.e,h||0)*(thr===undefined?1:thr),P=A.hp*745.7*k;if(!A.vd)return P*A.eta/Math.max(V,1);
  const T1=P*A.eta/A.vd,u=Math.max(0,V)/A.vd;return u<=1?T1*(1.6-0.6*Math.pow(u,1.3)):T1*Math.max(0.2,1-2*(u-1));}
function airVmax(A,h){const rho=RHO0*airSig(h);let lo=3,hi=320;for(let i=0;i<40;i++){const v=(lo+hi)/2;if(airThrust(A,v,h)>airDrag(A,v,rho))lo=v;else hi=v;}return lo;}
function airVs(A,h){return Math.sqrt(2*A.W*AG/(RHO0*airSig(h||0)*A.S*A.clm));}
function airClimb(A,h){const rho=RHO0*airSig(h),vs=Math.sqrt(2*A.W*AG/(rho*A.S*A.clm)),vm=airVmax(A,h);if(vm<vs*1.05)return -1;let best=-9;
  for(let i=0;i<=24;i++){const v=vs*1.15+(vm-vs*1.15)*i/24;if(v<=0)continue;const ex=(airThrust(A,v,h)-airDrag(A,v,rho))*v/(A.W*AG);if(ex>best)best=ex;}return best;}
function airCeil(A){if(airClimb(A,0)<0.5)return 0;let lo=0,hi=14000;for(let i=0;i<22;i++){const h=(lo+hi)/2;if(airClimb(A,h)>=0.5)lo=h;else hi=h;}return lo;}
// установившийся вираж на земле: перегрузка, при которой тяги хватает, не больше прочности и наибольшей подъёмной силы
function airTurn(A,g){const rho=RHO0,vs=airVs(A,0);let best=0,bv=vs*1.4;
  for(let i=0;i<=16;i++){const v=vs*1.15+vs*0.9*i/16,q=0.5*rho*v*v,T=airThrust(A,v,0),D0=q*A.S*A.cd0,Di1=Math.pow(A.W*AG,2)/(q*A.S*Math.PI*A.ar*A.e);
    const ns=Math.sqrt(Math.max(1,(T-D0)/Di1)),nc=q*A.S*A.clm/(A.W*AG),nn=Math.min(ns,nc,g);if(nn<=1.02)continue;const w=AG*Math.sqrt(nn*nn-1)/v;if(w>best){best=w;bv=v;}}
  return {w:best,v:bv};}
/* ---------- характеристики аэроплана ----------
   v — наибольшая скорость у земли, км/ч; vc — крейсерская; climb — подъём у земли, м/мин; t1k — время подъёма на 1000 м, мин;
   ceil — практический потолок, м; range — дальность, км; vs — посадочная, км/ч; turn — время виража, с; roll — крен, °/с;
   g — прочность; stab — устойчивость (0–1); ease — лёгкость для пилота (0–1); rel — надёжность за час полёта; W — взлётный вес, кг */
const AIR_STAT_CACHE=new Map();
function airStats(md,y){const key=[md.f,md.m,md.e,md.n||1,md.c,md.g,md.p,md.a,md.k,md.w,md.role,Math.round(y*4)/4,md.pk||1,md.vk||1].join('|');const hit=AIR_STAT_CACHE.get(key);if(hit)return hit;
  const A=airAero(md,y),P=A.P,vk=md.vk||1;A.vd=airVmax(A,0);
  const vm=airVmax(A,0)*vk,vs=airVs(A,0),cl=airClimb(A,0)*vk,ceil=airCeil(A)*Math.min(1.05,vk),g=P.f.g*P.m.g*(P.c.id==='c1'?0.95:1);
  const T=airTurn(A,g),manK=P.f.man*(P.e.cool==='r'?1.12:P.e.cool==='w'&&A.n===1?0.96:1),turn=T.w>0?2*Math.PI/T.w/manK:99;
  const t1k=cl>0.2?(()=>{let t=0,h=0;while(h<1000&&t<3600){const c=airClimb(A,h);if(c<0.2)return 99;h+=c*10;t+=10;}return t/60;})():99;
  const vc=vm*0.85,range=A.fuelH*vc*3.6*0.92;
  const roll=Math.round(clamp(42*P.c.roll*P.f.roll*clamp(vm/45,0.75,1.6)/(1+Math.max(0,A.S-20)/60),10,260));
  const stab=clamp(P.f.stab*(P.c.ease||1)*(P.w.id==='big'?1.08:P.w.id==='small'?0.9:1),0.1,1);
  const vsK=vs*3.6,ease=clamp(stab*0.45+(1-clamp((vsK-45)/80,0,1))*0.35+(P.c.ease-0.85)*0.6+(P.g.ease?0.05:0)+0.12,0.05,1);
  const engRel=P.e.rel*(md.rk||1),n=A.n,relE=n===1?engRel:1-Math.pow(1-engRel,2)*n*0.7,rel=clamp(relE*(0.97+0.03*clamp(P.m.dur,0,1.2))*(P.f.race?0.92:1),0.2,0.995);
  const gun=P.a.gun,obs=P.a.obs?1:0,bomb=P.a.bomb||0,mail=P.k.mail||0,pax=Math.max(0,P.k.seats-(P.k.closed?(P.k.seats>6?2:1):P.k.seats)),seats=A.seats;
  const S={v:vm*3.6,vc:vc*3.6,climb:cl*60,t1k,ceil,range,vs:vsK,turn,roll,g,stab,ease,rel,W:A.W,S:A.S,hp:A.hp,hpN:A.hpN,gun,obs,bomb,mail,pax,seats,sea:!!(P.g.sea||P.f.boat),closed:!!P.k.closed,n,A};
  if(AIR_STAT_CACHE.size>4000)AIR_STAT_CACHE.clear();AIR_STAT_CACHE.set(key,S);return S;}
/* ---------- эталон класса и оценка аэроплана ---------- */
function airRefEntry(role,t){const L=AIR_RIVAL[role]||AIR_RIVAL.sport;let e=L[0];for(const x of L)if(x[0]<=t+1e-6)e=x;return e;}
function airRefMd(role,t){const e=airRefEntry(role,t);return {...e[2],role,name:e[1],ref:1};}
const AIR_W={sport:{v:.2,cl:.1,ease:.3,rel:.3,rng:.1},train:{ease:.4,rel:.3,cl:.1,v:.1,rng:.1},recon:{v:.2,ceil:.2,rng:.15,cl:.1,rel:.1,ease:.1,obs:.15},
  fight:{v:.27,cl:.22,man:.2,ceil:.11,gun:.2},bomb:{bomb:.35,rng:.2,rel:.15,v:.1,obs:.1,ceil:.1},sea:{rng:.3,rel:.2,v:.15,pay:.15,ceil:.1,ease:.1},
  mail:{mail:.25,v:.3,rng:.25,rel:.2},pax:{pax:.3,rel:.25,v:.15,rng:.15,comf:.15},race:{v:1}};
const AIR_FN={v:'скорость',cl:'подъём',ceil:'потолок',rng:'дальность',man:'вираж',ease:'лёгкость',rel:'надёжность',gun:'оружие',obs:'стрелок',bomb:'бомбы',pay:'груз',mail:'почта',pax:'пассажиры',comf:'удобство'};
function airFeat(st){return {v:st.v,cl:Math.max(5,st.climb),ceil:Math.max(100,st.ceil),rng:st.range,man:1/Math.max(3,st.turn)*(0.7+0.3*st.roll/60),ease:st.ease,rel:1/Math.max(0.005,1-st.rel),
  gun:Math.max(0.05,st.gun),obs:0.3+st.obs,bomb:Math.max(10,st.bomb),pay:Math.max(80,st.bomb+st.pax*80+st.mail+st.seats*40),mail:Math.max(20,st.mail+(st.closed?250:0)),pax:Math.max(0.5,st.pax),comf:st.closed?1.5:0.8};}
const AIR_EXP={v:1.6,cl:0.8,ceil:0.7,rng:0.6,man:1,ease:0.9,rel:0.35,gun:0.8,obs:0.5,bomb:0.8,pay:0.7,mail:0.8,pax:0.9,comf:0.6};
// оценка: 1 — как эталон класса; что лучше и что хуже (для подсказки)
function airQ(md,t,role){role=role||md.role;const st=airStats(md,t),ref=airRefMd(role,t),rs=airStats(ref,t),W=AIR_W[role]||AIR_W.sport,f=airFeat(st),fr=airFeat(rs);
  let q=0,by={};for(const k in W){let w=W[k];if(k==='obs'&&role==='recon'&&t<1915)w=0;const r=clamp(f[k]/Math.max(1e-6,fr[k]),0.15,4),v=Math.pow(r,AIR_EXP[k]||1);by[k]=r;q+=w*v;}
  const sw=Object.keys(W).reduce((a,k)=>a+(k==='obs'&&role==='recon'&&t<1915?0:W[k]),0);q/=sw;
  const why=[];if(role==='fight'&&st.gun<0.5){q*=0.35;why.push('нет пулемёта, стреляющего вперёд');}
  if((role==='train'||role==='recon')&&st.seats<2){q*=0.4;why.push('одно место — нужен второй (ученик, наблюдатель)');}
  if(role==='bomb'&&st.bomb<50){q*=0.25;why.push('нет бомбодержателей');}
  if(role==='sea'&&!st.sea){q*=0.15;why.push('нет поплавков или лодки');}
  if(role==='mail'&&st.mail<100&&!st.closed){q*=0.3;why.push('нет почтового отсека');}
  if(role==='pax'&&st.pax<3){q*=0.3;why.push('мало мест для пассажиров');}
  if(st.climb<15){q*=0.3;why.push('еле отрывается от земли');}
  if(!md.ref){q*=bn('airQ');if(st.n>1)q*=bn('airMulti');if(role==='fight')q*=bn('airFight');}
  return {q,by,why,st,rs,ref};}
/* ---------- стоимость: материалы, мотор, работа ---------- */
const AIR_FCX={fc:1.1,fp:1,fm:0.9,fb:1,fs:1.05,ft:1.2,fx:1.25,fw:1.4,fk:1.15,fr:1.4};
// мотор дешевеет: заводы учатся (−5% в год, не дешевле 40%); в войну — поток (−15%); после войны — излишки армии
// (моторы военных лет продают за 40% до 1925 года — «Дженни» и «Авро» с моторами за гроши)
function airEngCost(e,y,s){const ck=tabAt(CPI,y)/tabAt(CPI,Math.max(1895,e.y));let k=Math.max(0.4,1-0.05*Math.max(0,y-e.y))*ck;
  if(y>=1915&&y<1918.9&&e.y<=1918)k*=0.85;if(y>=1919&&y<1925&&e.y<=1918&&!e.race)k*=0.45;
  if(s&&e.cty&&e.cty!==s.country&&e.cty!=='intl'&&!(e.lic&&e.lic[s.country]<=y))k*=1.15;return e.c*k;}
function airCost(md,y,s,made){const A=airAero(md,y),P=A.P,n=A.n,ck=tabAt(CPI,y);
  const struct=A.W*A.af,eng=airEngCost(P.e,y,s)*n*bn('airEng'),mat=struct*4*P.m.c*ck+(P.a.c+P.k.c+P.c.c+P.p.c+60)*ck;
  const learn=Math.max(0.35,Math.pow((made||0)/10+1,-0.32)),lvK=s&&s.air?(AIR_LINE[s.air.line||1]||AIR_LINE[1]).k:1;
  const hrs=(250+struct*9*P.m.hrs*(AIR_FCX[P.f.id]||1)+n*90+(P.a.gun>0?60:0)+(P.k.closed?300:0))*learn*lvK;
  const wph=s?airWage(s)/hoursPerWorker(s):0.12*ck;
  return {eng,mat:(mat+eng)*bn('airCost'),hrs,lab:hrs*wph,unit:(mat+eng)*bn('airCost')+hrs*wph,kg:A.W,struct};}
function airWage(s){return wageNow(s)*1.3;}
/* ---------- рынок ---------- */
const AIR_SEASON=[0.5,0.6,0.85,1.15,1.35,1.4,1.4,1.3,1.1,0.8,0.6,0.5].map(x=>x/0.9625);
function airMix(T,t,role){const m=tabAtObj(T,t);return m[role]||0;}
function tabAtObj(T,t){const ks=Object.keys(T).map(Number).sort((a,b)=>a-b);let a=ks[0],b=ks[ks.length-1];if(t<=a)return T[a];if(t>=b)return T[b];
  for(let i=0;i<ks.length-1;i++)if(ks[i]<=t&&ks[i+1]>t){a=ks[i];b=ks[i+1];break;}const k=(t-a)/(b-a),A=T[a],B=T[b],o={};new Set([...Object.keys(A),...Object.keys(B)]).forEach(r=>o[r]=(A[r]||0)*(1-k)+(B[r]||0)*k);return o;}
// годовой рынок назначения в стране: гражданская и военная части
function airMktRole(c,role,t,part){const M=AIR_MKT[c];if(!M)return 0;let v=0;
  if((!part||part==='civ')&&(role==='sport'||role==='train'))v+=tabAt(M.priv,t)*airMix(AIR_PRIV_MIX,t,role);
  if((!part||part==='civ')&&(role==='mail'||role==='pax'||role==='sea'))v+=tabAt(M.line,t)*airMix(AIR_LINE_MIX,t,role);
  if((!part||part==='mil')&&['recon','fight','bomb','train','sea'].includes(role))v+=tabAt(M.mil,t)*airMix(AIR_MIL_MIX,t,role);
  return Math.max(0,v);}
// авиазаводы страны в этом назначении: вес — выпуск по истории
function airComps(c,role,t,s){const me=(s||(typeof G!=='undefined'&&G)||{}).pioneer;return (ACOMPS[c]||[]).filter(x=>x.since<=t&&(!x.until||x.until>t)&&(x.mix[role]||0)>0&&!(x.pk&&x.pk===me)).map(x=>({x,w:tabAt(x.v,t)*(x.mix[role]||0)})).filter(o=>o.w>0.01);}
// союзники и враги в войне 1914–1918 (Россия — до Брестского мира; США — с апреля 1917; Италия — с мая 1915)
function airWarOn(c,t){if(c==='us')return t>=1917.26&&t<1918.87;if(c==='it')return t>=1915.39&&t<1918.87;if(c==='ru')return t>=1914.58&&t<1918.2;return t>=1914.58&&t<1918.87;}
function airFoe(a,b,t){if(a===b)return false;if(!airWarOn(a,t)||!airWarOn(b,t))return false;return (a==='de')!==(b==='de');}
// можно ли продавать в стране: враг — нет; Германия 1919–1922 — Версаль (только за границу); Советская Россия — только своя
function airVersailles(t){return t>=1919.5&&t<1922.4;}
function airReach(s,c,seg){const t=tNow(s),home=c===s.country;if(airFoe(s.country,c,t))return 0;
  if(s.soviet&&!home)return 0;if(c==='ru'&&!home&&t>=1918&&t<1924)return 0;
  if(home)return (s.country==='de'&&airVersailles(t)&&seg!=='line')?0:1;
  if(c==='de'&&airVersailles(t))return seg==='line'?0.3:0;
  if(seg==='mil')return airWarOn(s.country,t)||airWarOn(c,t)?(airWarOn(c,t)&&airWarOn(s.country,t)?0.12:0.05):0.25;
  if(airWarOn(s.country,t)||airWarOn(c,t))return 0;return 0.22;}
function airFameK(s){return 0.35+((s.air&&s.air.fame)||0)/55;}
// привлекательность модели в стране: как средний авиазавод страны × качество × слава × цена × досягаемость
function airAttr(s,md,c,seg,t,q,comps){const W=comps.map(o=>o.w).sort((a,b)=>a-b),ref=W.length?W[Math.floor(W.length/2)]:Math.max(2,airMktRole(c,md.role,t)*0.25),
  beta=seg==='mil'?5:3.5,pr=seg==='mil'?1:Math.pow(clamp(airPriceOf(md,s)/Math.max(1,airRefPrice(md.role,t)),0.25,4),-2.2),mil=seg==='mil'?0.6+(md.milRep||0)/80:1;
  return ref*Math.exp(beta*(q-1))*airFameK(s)*airReach(s,c,seg)*pr*mil*(seg==='mil'?bn('airMil'):bn('airPriv')*(md.boost||1));}
// цена типичного аэроплана назначения: себестоимость эталона в серии (≈60 штук) и треть сверху — так цена и стоимость всегда согласованы
// (таблица AIR_PRICE — для справки: Блерио XI в 1909 году — 12 000 франков, «Дженни» — $5 465, «Мот» — £650, «Форд-тримотор» — $42 000)
const AIR_RP_CACHE=new Map();
function airRefPrice(role,t){const k=role+'|'+Math.round(t*4);let v=AIR_RP_CACHE.get(k);if(v===undefined){const md=airRefMd(role,t);v=Math.round(airCost(md,t,null,60).unit*1.3/50)*50;AIR_RP_CACHE.set(k,v);}return v;}
function airPriceOf(md,s){if(md.price>0)return md.price;return airAutoPrice(md,s);}
// цена по оценке: как у эталона с поправкой на качество, но не ниже себестоимости с наценкой 15%
function airAutoPrice(md,s){const t=tNow(s),q=airQ(md,t).q,c=airCost(md,t,s,md.made||0).unit;return Math.round(Math.max(airRefPrice(md.role,t)*Math.pow(clamp(q,0.3,2.5),0.6),c*1.15)/50)*50;}
/* ---------- авиацех: постройка, ангары, цех, поток ---------- */
const AIRSHOP={y:1909,c:7000,mo:4,cap:1.2,wk:12};
const AIR_CAPB=[{k:'hangar',n:'Ангар',y:1909,add:1.5,c:3000,mo:3,d:'ещё один ангар: стапели, верстаки и швейная мастерская для полотна'},
  {k:'shop',n:'Сборочный цех',y:1912,add:10,c:18000,mo:5,d:'большой цех со стапелями для серии — десятки аэропланов в месяц'},
  {k:'plant',n:'Авиазавод',y:1915,add:60,c:90000,mo:8,d:'завод военного времени: сотни аэропланов в месяц'}];
const AIR_LINE=[null,{lv:1,n:'Мастерская',k:1},{lv:2,n:'Серийный цех (шаблоны и стапели)',y:1912,k:0.8,c:15000,mo:4,d:'одинаковые детали по шаблонам: часов на аэроплан на пятую часть меньше'},
  {lv:3,n:'Поточная сборка',y:1917,k:0.65,c:60000,mo:6,d:'аэропланы движутся от стапеля к стапелю, как на автозаводе: часов на треть меньше'}];
function airOn(s){return !!(s&&s.air&&s.air.lv>0);}
function airOnly(s){return airOn(s)&&!lineOn(s,'car')&&!lineOn(s,'moto');}
function airInit(s){if(!s.air)s.air={lv:0,cap:0,capB:[],wk:0,wkAuto:true,models:[],nid:1,fame:8,rd:[],tech:{},orders:[],rec:{},ev:{},wins:0,prizes:0,made:0,sold:0,line:1,pil:[],hist:[],lastQ:{},y:{sold:0,rev:0}};return s.air;}
function airShopCost(s){return Math.round(AIRSHOP.c*cpi(s)/100)*100;}
function airShopCan(s){return !airOn(s)&&!(s.air&&s.air.b)&&tNow(s)>=AIRSHOP.y&&!s.soviet;}
function airShopStart(s){if(!airShopCan(s))return false;const c=airShopCost(s);if(s.cash<c)return false;const A=airInit(s);s.cash-=c;s.plantVal=(s.plantVal||0)+c*0.6;
  const mo=Math.max(2,Math.round(AIRSHOP.mo*(DIF().build??1)));A.b={left:mo,t:mo};addLog(`Строим авиацех: ангар, стапели, швейная для полотна, стенд для мотора — ${money(c)}, ${mo} мес.`,'good');return true;}
function airCapCost(s,k){const B=AIR_CAPB.find(b=>b.k===k);return Math.round(B.c*cpi(s)/100)*100;}
function airCapCan(s,k){const B=AIR_CAPB.find(b=>b.k===k);return airOn(s)&&B&&tNow(s)>=B.y&&(s.air.capB||[]).length<3&&!(s.country==='de'&&airVersailles(tNow(s)));}
function airCapStart(s,k){if(!airCapCan(s,k))return false;const B=AIR_CAPB.find(b=>b.k===k),c=airCapCost(s,k);if(s.cash<c)return false;s.cash-=c;s.plantVal=(s.plantVal||0)+c*0.7;
  const mo=Math.max(1,Math.round(B.mo*(DIF().build??1)*(airWarOn(s.country,tNow(s))?0.75:1)));s.air.capB.push({k,left:mo,t:mo,add:B.add});addLog(`Авиацех: строим «${B.n}» — ${money(c)}, ${mo} мес.`);return true;}
function airLineNext(s){const L=AIR_LINE[(s.air.line||1)+1];return L&&tNow(s)>=L.y?L:null;}
function airLineStart(s){const L=airLineNext(s);if(!L||s.air.lineB)return false;const c=Math.round(L.c*cpi(s)/100)*100;if(s.cash<c)return false;s.cash-=c;s.plantVal=(s.plantVal||0)+c*0.6;
  const mo=Math.max(1,Math.round(L.mo*(DIF().build??1)));s.air.lineB={lv:L.lv,left:mo,t:mo};addLog(`Авиацех: «${L.n}» — ${money(c)}, ${mo} мес.`);return true;}
/* ---------- конструктор: доступные детали и проверка ---------- */
// деталь доступна: по году (или своё изобретение раньше истории), в войну — без моторов врага (кроме лицензионных)
function airPartOk(s,x,cat){if(!x)return false;const t=tNow(s),A=s.air||{};
  if(x.until&&t>=x.until&&!(A.keepOld&&A.keepOld[x.id]))return false;
  let y=x.y;if(cat==='a'&&x.yA&&s.country!=='de')y=x.yA;
  const mine=Object.keys(A.tech||{}).some(id=>{const T=AIR_TECH.find(z=>z.id===id);return T&&T.unl.includes(x.id);})||(A.early&&A.early[x.id]);
  if(t+1e-6<y&&!mine)return false;
  if(cat==='e'){if(x.race&&!airHasRole(s,'race'))return true;const c=s.country;if(x.cty&&x.cty!==c&&x.cty!=='intl'){
      if(airWarOn(c,t)&&(airFoe(c,x.cty,t)||(c==='us'&&t<1917.26))&&!(x.lic&&x.lic[c]<=t))return false;
      if((s.soviet||(c==='ru'&&t>=1918&&t<1922))&&!(x.lic&&x.lic.ru<=t)&&x.cty!=='ru')return false;}}
  return true;}
function airHasRole(s,r){return true;}
function airCatList(s,cat){const L={f:AIR_FRAME,m:AIR_MAT,e:AIR_ENG,c:AIR_CTL,g:AIR_GEAR,p:AIR_PROP,a:AIR_ARM,k:AIR_CAB,w:AIR_WING}[cat];return L.filter(x=>cat==='w'||airPartOk(s,x,cat));}
// что не так с проектом (пустой список — можно строить)
function airDesignErr(s,d){const E=[],P=airParts(d),t=tNow(s),role=d.role;
  if(!AIR_ROLES[role])E.push('выберите назначение');else if(t<AIR_ROLES[role].y-0.01&&!(role==='fight'&&(s.air.tech||{}).sync))E.push(`${AIR_ROLES[role].n.toLowerCase()} — с ${Math.floor(AIR_ROLES[role].y)} года`);
  const n=d.n||1;if(n<P.f.ne[0]||n>P.f.ne[1])E.push(P.f.ne[0]===P.f.ne[1]?`у схемы «${P.f.name}» — ${P.f.ne[0]} мотор`:`моторов у схемы — от ${P.f.ne[0]} до ${P.f.ne[1]}`);
  if(P.f.needMat&&!P.f.needMat.includes(P.m.id))E.push('свободнонесущему крылу нужна металлическая или фанерная конструкция');
  if(P.f.race&&role!=='race')E.push('гоночная схема — только для гоночного аэроплана');
  if(P.k.seats>P.f.seats+(P.f.ne[1]>1?2:0))E.push(`в схеме «${P.f.name}» нет места для такой кабины`);
  if(P.a.obs&&P.k.seats<2)E.push('для стрелка нужно второе сиденье');
  if((P.a.gun>=0.6&&!P.a.obs)&&P.f.id==='fp'&&P.a.id!=='w3')E.push('у толкающей схемы пулемёт ставят в гондолу — выберите «Пулемёт наблюдателя»');
  if(P.k.closed&&n===1&&P.k.seats>6&&P.f.id!=='fk')E.push('салон на 10 мест поднимет только многомоторный аэроплан или свободнонесущий моноплан');
  if(P.g.rail&&P.f.id!=='fc')E.push('стартовый рельс — только у «утки» Райтов');
  if(P.f.boat&&P.g.id!=='g2')E.push('у летающей лодки шасси — сама лодка (выберите колёса — они не ставятся)');
  [['f',P.f],['m',P.m],['e',P.e],['c',P.c],['g',P.g],['p',P.p],['a',P.a],['k',P.k]].forEach(([k,x])=>{if(!airPartOk(s,x,k))E.push(`«${x.name}» сейчас недоступен`);});
  const st=airStats(d,t);if(st.climb<10)E.push('аэроплан не взлетит: мотор слишком слаб для такого веса');
  return E;}
// срок и цена разработки: проект и опытный образец (обычно 3–8 месяцев до войны, в войну — вдвое быстрее)
function airDevMonths(s,d){const st=airStats(d,tNow(s)),big=clamp(Math.log2(st.W/400+1),0.6,3.5),war=airWarOn(s.country,tNow(s))?0.55:1;
  return Math.max(2,Math.round((2.2+big*1.6)*war*bn('airDev')*(DIF().build??1)));}
function airDevCost(s,d){const t=tNow(s),c=airCost(d,t,s,0);return Math.round((c.unit*2.5+1200*cpi(s)*clamp(airStats(d,t).W/600,0.6,6))/50)*50;}
function airNewModel(s,d,opt){const A=airInit(s),id=A.nid++;const md={id,name:(d.name||'').trim()||`Аэроплан ${id}`,role:d.role,f:d.f,m:d.m,e:d.e,n:d.n||1,c:d.c,g:d.g,p:d.p,a:d.a||'w0',k:d.k||'k1',w:d.w||'mid',
  paint:d.paint||'#d9cfb2',status:'dev',devLeft:0,devT:0,flown:0,vk:1,rk:1,price:0,plan:'auto',stock:0,made:0,sold:0,lastMade:0,lastSold:0,lastDem:0,fc:0,milRep:0,launched:null,born:mi(s)};
  Object.assign(md,opt||{});A.models.push(md);return md;}
function airDesignStart(s,d){const E=airDesignErr(s,d);if(E.length)return false;const c=airDevCost(s,d);if(s.cash<c)return false;const A=airInit(s);
  if(airDevBusy(s)>=airDevSlots(s))return false;s.cash-=c;const mo=airDevMonths(s,d),md=airNewModel(s,d,{status:'dev',devLeft:mo,devT:mo,devCost:c});
  addLog(`Авиацех начал проект «${md.name}» (${AIR_ROLES[md.role].n.toLowerCase()}): ${money(c)} на чертежи и опытный образец, ${mo} мес.`);return md;}
function airDevSlots(s){const A=s.air;return 1+((A.line||1)>=2?1:0)+(airWarOn(s.country,tNow(s))?1:0)+((A.cap||0)>=40?1:0);}
function airDevBusy(s){return (s.air.models||[]).filter(m=>m.status==='dev').length;}
/* ---------- спрос гражданских покупателей (спортсмены, школы, почта, авиалинии) ---------- */
function airCivSeg(role){return role==='sport'||role==='train'?'priv':'line';}
// годовой спрос на ваши модели: по странам; несколько ваших моделей одного назначения делят покупателей между собой
function airCivDemand(s,t){const A=s.air,act=A.models.filter(m=>m.status==='prod'||m.status==='sale'),out={},mk={};
  const byRole={};act.forEach(m=>{if(m.role==='race')return;(byRole[m.role]=byRole[m.role]||[]).push(m);});
  for(const role in byRole){const L=byRole[role],seg=airCivSeg(role),qs=L.map(m=>airQ(m,t).q);
    for(const c in COUNTRIES){const M=airMktRole(c,role,t,'civ');if(M<=0.01)continue;const comps=airComps(c,role,t,s),W=comps.reduce((a,o)=>a+o.w,0)+Math.max(0,M*0.15);
      const a=L.map((m,i)=>m.status==='sale'?airAttr(s,m,c,seg,t,qs[i],comps)*1.4:airAttr(s,m,c,seg,t,qs[i],comps)),Ap=a.reduce((x,y)=>x+y,0);if(Ap<=0)continue;
      const share=Math.min(0.9,Ap/(Ap+W)),K=mk[c]=mk[c]||{};K[role]=(K[role]||0)+M;
      L.forEach((m,i)=>{const d=M*share*a[i]/Ap;(out[m.id]=out[m.id]||{})[c]=d;});}}
  return {by:out,mk};}
// кризисы бьют по частным покупателям: послевоенный спад 1921 года, биржевой крах осени 1929-го
function airCivK(s,c){const t=tNow(s);let k=1;if(t>=1920.9&&t<1922)k=0.7;if(t>=1929.75)k=0.55;if(c==='de'&&t>=1922.5&&t<1924)k*=0.5;return k;}
/* ---------- военные контракты ---------- */
const AIR_MIL_ROLES=['recon','fight','bomb','train','sea'];
function airCapUnits(s,md){const kg=airStats(md,tNow(s)).W;return Math.max(0.2,(s.air.cap||0)*1000/kg);}
// сколько аэропланов этого назначения армия закажет у вас за n месяцев
function airMilWant(s,md,months,c){c=c||s.country;const t=tNow(s),M=airMktRole(c,md.role,t,'mil');if(M<=0.01)return 0;const comps=airComps(c,md.role,t,s),W=comps.reduce((a,o)=>a+o.w,0)+M*0.1,
  q=airQ(md,t).q;let a=airAttr(s,md,c,'mil',t,q,comps);if(a<=0)return 0;
  if(airWarOn(c,t)){const ref=comps.length?comps.map(o=>o.w).sort((x,y)=>x-y)[Math.floor(comps.length/2)]:M*0.2;a*=clamp(airCapUnits(s,md)*12/Math.max(1,ref),0.3,3);}
  const sh=Math.min(0.85,a/(a+W));return M*sh*months/12;}
function airMilPrice(s,md){const t=tNow(s),c=airCost(md,t,s,md.made).unit,ref=airRefPrice(md.role,t);return Math.round(clamp(c*1.22,ref*0.7,ref*1.35)/10)*10;}
function airOrderAdd(s,o){const A=s.air;o.id=o.id||('ao'+(A.oid=(A.oid||0)+1));o.left=o.n;A.orders.push(o);if(o.mil)A.milN=(A.milN||0)+1;A.ordN=(A.ordN||0)+1;return o;}   // milN — для фильма: первый военный заказ
/* ---------- месяц авиацеха (из step) ---------- */
function airMonth(s,r){const A=s.air;if(!A)return;const t=tNow(s),R={rev:0,ord:0,mat:0,wage:0,ovh:0,hire:0,tool:0,made:0,sold:0,ordN:0,lic:0,mk:{},fine:0,roy:0};r.air=R;
  if(A.b){A.b.left--;if(A.b.left<=0){A.b=null;A.lv=1;A.cap=Math.max(A.cap||0,AIRSHOP.cap);A.wk=Math.max(A.wk||0,AIRSHOP.wk);s.lines=s.lines||{car:1};s.lines.air=1;
    addLog(`Авиацех готов: ангар на ${fmtN(AIRSHOP.cap*1000/300)} лёгких аэропланов в месяц, ${A.wk} мастеров — столяры, мотористы, швеи для полотна.`,'good');
    pushEvent({own:1,kicker:'Авиацех',title:`«${s.company}» строит аэропланы`,deck:'Ангар, стапели, швейная для полотна',text:`Авиацех готов. Начертите первый аэроплан: назначение, схема, мотор, крыло — расчёт покажет скорость, подъём и потолок. Опытный образец строится несколько месяцев, потом — первый полёт.\nАэропланы покупают спортсмены и лётные школы, армия проводит конкурсы, а газеты пишут о каждом рекорде.`,choices:[['Начертить аэроплан','air:design'],['Позже','ok']]},true);}}
  A.capB=(A.capB||[]).filter(b=>{b.left--;if(b.left<=0){A.cap=(A.cap||0)+b.add;const B=AIR_CAPB.find(x=>x.k===b.k)||{n:'Цех'};addLog(`Авиацех: «${B.n}» готов — места в ангарах на ${fmtN(A.cap)} т взлётного веса в месяц.`,'good');pendingToasts.push('✈ '+B.n);return false;}return true;});
  if(A.lineB){A.lineB.left--;if(A.lineB.left<=0){A.line=A.lineB.lv;A.lineB=null;const L=AIR_LINE[A.line];addLog(`Авиацех: «${L.n}» — ${L.d}.`,'good');pendingToasts.push('✈ '+L.n);}}
  if(!A.lv)return;
  // опытные работы (изобретения раньше истории)
  A.rd=(A.rd||[]).filter(p=>{p.left--;if(p.left>0)return true;A.tech[p.id]=1;const T=AIR_TECH.find(z=>z.id===p.id);if(T){const yrs=Math.max(0,Math.round(T.y-t));addLog(`Авиацех: «${T.n}» — готово${yrs>0?`, на ${yrs} ${plural(yrs,'год','года','лет')} раньше истории`:''}.`,'good');pendingToasts.push('🔬 '+T.n);
    if(yrs>0)try{recordFirst(s,'air_'+T.id,T.n,Math.floor(T.y),T.who);}catch(_){}}return false;});
  // проекты: чертежи и опытный образец; оснастка серии
  A.models.forEach(md=>{if(md.status==='dev'){md.devLeft--;if(md.devLeft<=0){md.status='proto';md.protoAt=mi(s);A.proto=(A.proto||[]).concat(md.id);}}
    else if(md.status==='tool'){md.toolLeft=(md.toolLeft||1)-1;if(md.toolLeft<=0){md.status='prod';md.launched=mi(s);addLog(`«${md.name}» пошёл в серию.`,'good');}}});
  const act=A.models.filter(m=>m.status==='prod'||m.status==='sale');
  // спрос
  const D=airCivDemand(s,t),seas=AIR_SEASON[s.m];
  act.forEach(md=>{const by=D.by[md.id]||{};let d=0;for(const c in by)d+=by[c]*airCivK(s,c);d=d/12*(airCivSeg(md.role)==='priv'?seas:1);md.dem=d;md.fc=md.fc>0?md.fc*0.6+d*0.4:d;md.byC=by;});
  for(const c in D.mk)R.mk[c]=D.mk[c];
  // производство: место в ангарах (тонны взлётного веса) и руки мастеров
  const ban=s.country==='de'&&airVersailles(t)&&!A.abroad;
  const ordNeed={};A.orders.forEach(o=>{ordNeed[o.md]=(ordNeed[o.md]||0)+Math.ceil(o.left/Math.max(1,o.due-mi(s)));});
  const C=act.map(md=>airCost(md,t,s,md.made)),kg=act.map(md=>airStats(md,t).W/1000);
  const want=act.map((md,i)=>{if(ban||md.status==='sale')return 0;const o=ordNeed[md.id]||0;return md.plan==='auto'?Math.max(0,Math.round(md.fc*1.05+o-Math.max(0,md.stock-0.5*md.fc))):Math.max(0,Math.round(+md.plan||0))+o;});
  const needT=want.reduce((a,w,i)=>a+w*kg[i],0),k1=needT>0?Math.min(1,(A.cap||0)/needT):1;
  const hpw=hoursPerWorker(s),needH=want.reduce((a,w,i)=>a+w*k1*C[i].hrs,0);
  if(A.wkAuto!==false){const target=Math.ceil(needH/hpw*1.02),d=target-A.wk,dd=d>0?Math.min(d,Math.max(10,Math.round(A.wk*0.6))):Math.max(d,-Math.round(A.wk*0.25));
    if(dd>0)R.hire=dd*8*cpi(s);A.wk=Math.max(A.lv?4:0,A.wk+dd);}
  const k2=needH>0?Math.min(1,A.wk*hpw/needH):1;
  act.forEach((md,i)=>{const x=want[i]*k1*k2,made=Math.floor(x)+(Math.random()<x%1?1:0);md.lastMade=made;if(!made)return;md.made+=made;md.stock+=made;A.made=(A.made||0)+made;R.made+=made;
    R.mat+=made*C[i].mat;if(md.lic)R.roy+=made*airMilPrice(s,md)*(md.lic.roy||0.08);});
  R.wage=A.wk*airWage(s);R.ovh=Math.round(((A.cap||0)*45+150)*cpi(s));R.load=needT>0?needT/Math.max(0.1,A.cap||0.1):0;R.k1=k1;R.k2=k2;
  // патент Райтов: отчисления с чужих аэропланов в США до 1917 года (тогда правительство заставило всех объединить патенты); у Кёртисса — суды
  {const P=PIONEERS[s.pioneer]||{};if(t>=1909.9&&t<1917.6){if(P.patent&&s.country==='us')R.lic+=Math.round(tabAt(AIR_MKT.us.priv,t)*0.25*700*cpi(s)/12);if(P.suit)R.fine+=Math.round(150*cpi(s));}}
  // лётчики на жалованье
  (A.pil||[]).forEach(p=>{if(p.id!=='hero')R.wage+=p.sal||0;});
  // поставки по контрактам — первыми
  A.orders=A.orders.filter(o=>{const md=act.find(m=>m.id===o.md);const need=Math.ceil(o.left/Math.max(1,o.due-mi(s)));
    if(md){const n=Math.min(o.left,md.stock,need*2);if(n>0){md.stock-=n;o.left-=n;const ad=Math.min(o.advLeft||0,n*o.price*0.25);o.advLeft=(o.advLeft||0)-ad;R.ord+=n*o.price-ad;R.adv=(R.adv||0)+ad;R.ordN+=n;md.sold+=n;A.sold=(A.sold||0)+n;if(o.c===s.country)R.home=(R.home||0)+n;md.milRep=clamp((md.milRep||0)+n*0.05,-40,60);}}
    if(o.left<=0){addLog(`Контракт выполнен: ${o.who} получил ${fmtN(o.n)} «${md?md.name:'аэропланов'}».`,'good');A.fame=Math.min(100,A.fame+1);if(md)md.milRep=clamp((md.milRep||0)+3,-40,60);return false;}
    if(mi(s)>=o.due){const fine=Math.round(o.left*o.price*0.1);R.fine+=fine;if(md)md.milRep=clamp((md.milRep||0)-8,-40,60);A.fame=Math.max(0,A.fame-2);
      addLog(`Сорван контракт: ${o.who} не получил ${fmtN(o.left)} аэропланов. Неустойка ${money(fine)}.`,'bad');return false;}
    return true;});
  // продажи гражданским: со склада, по спросу
  act.forEach(md=>{const d=md.dem||0,want2=d+(md.queue||0)*0.5,n=Math.min(md.stock,Math.floor(want2)+(Math.random()<want2%1?1:0));md.queue=Math.max(0,Math.min((md.queue||0)*0.5+d-n,d*2));
    md.lastSold=n;md.lastDem=d;if(n>0){md.stock-=n;md.sold+=n;A.sold=(A.sold||0)+n;R.sold+=n;const p=airPriceOf(md,s)*(md.status==='sale'?0.6:1);R.rev+=n*p;
      {const by=md.byC||{},tot=Object.values(by).reduce((x,v)=>x+v,0);R.home=(R.home||0)+(tot>0?n*(by[s.country]||0)/tot:0);}R.fameS=(R.fameS||0)+n*0.02;}
    if(md.status==='sale'&&md.stock<=0){md.status='off';addLog(`«${md.name}»: распродажа закончена.`);}});
  // слава понемногу забывается; у авиатора без автомобилей репутация фирмы — его слава
  // слава: продажи понемногу (не больше 0,3 в месяц), забывается — на 1,2% в месяц; рекорды и призы — скачком
  A.fame=clamp(A.fame+Math.min(0.3,R.fameS||0)+(8-A.fame)*0.012,0,100);
  if(airOnly(s))s.rep=clamp(s.rep+(18+A.fame*0.7-s.rep)*0.05,0,100);
  act.forEach(md=>{md.milRep=(md.milRep||0)*0.995;if(md.boost)md.boost=1+(md.boost-1)*0.93;});
  try{airEvMonth(s);}catch(e){console.warn('air ev',e);}
  A.y=A.y||{sold:0,rev:0,home:0};A.y.sold+=R.sold+R.ordN;A.y.rev+=R.rev+R.ord;A.y.home=(A.y.home||0)+(R.home||0);
  R.net=R.rev+R.ord+R.lic-R.mat-R.wage-R.ovh-R.hire-R.tool-R.fine-R.roy;r.airP=R.net;
  A.last=R;}
/* ---------- лётчики ---------- */
function airHeroSk(s){const P=PIONEERS[s.pioneer];return P&&P.air?(P.sk||0.7):0;}
function airHeroFlies(s){const P=PIONEERS[s.pioneer];return !!(P&&P.air&&(P.sk||0)>=0.6)&&!(s.air&&s.air.heroHurt>mi(s));}
function airPilotList(s){const A=s.air,L=[];if(airHeroFlies(s))L.push({id:'hero',n:PIONEERS[s.pioneer].name,sk:airHeroSk(s),hero:1});
  (A.pil||[]).forEach(p=>{if(p.id==='hero')return;const P=AIR_PILOTS.find(x=>x.id===p.id);if(P&&!(p.hurt>mi(s)))L.push({id:p.id,n:P.n,sk:P.sk,sal:p.sal});});
  if(!L.length)L.push({id:'test',n:'заводской испытатель',sk:0.62});return L;}
function airBestPilot(s){return airPilotList(s).sort((a,b)=>b.sk-a.sk)[0];}
function airPilotSal(s,P){return Math.round((60+P.sk*240)*cpi(s)/5)*5;}
function airPilotsForHire(s){const t=tNow(s),A=s.air,have=new Set((A.pil||[]).map(p=>p.id));return AIR_PILOTS.filter(P=>P.from<=t+0.01&&P.to+0.99>=t&&!(P.d&&t>=P.d+0.5)&&!have.has(P.id)&&(P.c===s.country||!airWarOn(s.country,t)));}
function airHire(s,id){const P=AIR_PILOTS.find(x=>x.id===id),A=s.air;if(!P||(A.pil||[]).length>=4)return false;const sal=airPilotSal(s,P)*(P.c===s.country?1:1.3);A.pil=(A.pil||[]).concat({id,sal:Math.round(sal),at:mi(s)});
  addLog(`В авиацех пришёл лётчик ${P.n}: ${money(Math.round(sal))} в месяц. Он будет летать на состязаниях и испытывать новые аэропланы.`,'good');return true;}
function airFire(s,id){const A=s.air;A.pil=(A.pil||[]).filter(p=>p.id!==id);}
/* ---------- первый полёт и серия ---------- */
function airToolCost(s,md){return Math.round((airCost(md,tNow(s),s,0).unit*2+500*cpi(s))/50)*50;}
function airTestRisk(s,md,P){const A=s.air,st=airStats(md,tNow(s));return clamp(0.03+(1-st.ease)*0.16+(st.vs>95?0.05:0)+(1-P.sk)*0.14+(md.role==='race'?0.05:0)-(A.flights||0)*0.004,0.02,0.4)*(DIF().bad||1);}
function airTestAuto(s,md,pid){const P=airPilotList(s).find(p=>p.id===pid)||airBestPilot(s),risk=airTestRisk(s,md,P),r=Math.random();return airTestApply(s,md,P,r<risk*0.35?'crash':r<risk?'flaw':'ok');}
// итог первого полёта: разбит (o.why — как), летает с изъяном, летает; o.self — летели сами в 3D (o.secs — сколько в воздухе)
function airTestApply(s,md,P,kind,o){o=o||{};const A=s.air,t=tNow(s),st=airStats(md,t);A.flights=(A.flights||0)+1;let res;
  if(kind==='crash'){md.status='dev';md.devLeft=2;md.devT=2;const c=Math.round((md.devCost||2000)*0.4/50)*50;s.cash-=c;A.fame=Math.max(0,A.fame-3);
    if(P.hero)A.heroHurt=mi(s)+3;else if(P.id!=='test'){const p=(A.pil||[]).find(x=>x.id===P.id);if(p)p.hurt=mi(s)+3;}
    res={kind:'crash',text:`${o.why?`Аэроплан ${o.why}. `:`На разбеге «${md.name}» вильнул, задел крылом землю и скапотировал. `}${P.hero?'Вы отделались переломом — три месяца без полётов.':P.n+' в больнице: три месяца без полётов.'} Образец — в щепки: новый обойдётся в ${money(c)} и два месяца.`};}
  else if(kind==='flaw'){md.vk=Math.round((0.92+Math.random()*0.04)*1000)/1000;md.flown=1;md.flaw=1;md.status=md.role==='race'?'race':'proto';
    res={kind:'flaw',text:`«${md.name}» ${o.self?'слушается и садится, но на земле механики качают головами':'взлетел, но тянет хуже расчёта'}: мотор перегревается, полотно на крыле «дышит». Скорость — ${Math.round(airStats(md,t).v)} км/ч вместо ${Math.round(st.v)}. Доводка — месяц в авиацехе.`};}
  else{md.vk=Math.round((0.97+Math.random()*0.06+Math.min(0.02,(A.flights||0)*0.002)+(o.prog?0.01*o.prog:0))*1000)/1000;md.flown=1;md.status=md.role==='race'?'race':'proto';A.fame=Math.min(100,A.fame+(o.self?3:2)+(o.prog>=0.8?1:0));
    const s2=airStats(md,t),who=P.hero?'Вы':P.n,v=P.hero?'подняли':'поднял';
    res={kind:'ok',text:o.self?`${who} ${v} «${md.name}» в воздух${o.secs?` и пробыли в нём ${o.secs>=120?Math.round(o.secs/60)+' мин':Math.round(o.secs)+' с'}`:''}. ${o.hard?'Посадка жёсткая, но шасси выдержало. ':'Посадка — мягкая, на три точки. '}Механики снимают показания: скорость ${Math.round(s2.v)} км/ч, подъём на 1000 м за ${s2.t1k<60?s2.t1k.toFixed(1).replace('.',',')+' мин':'—'}, потолок ${fmtN(Math.round(s2.ceil/100)*100)} м.`:
      `${who} ${v} «${md.name}» после ${Math.round(40+s2.vs*1.2)} метров разбега. Круг над полем, вираж, посадка — без единой поломки. Скорость ${Math.round(s2.v)} км/ч, подъём на 1000 м за ${s2.t1k<60?s2.t1k.toFixed(1).replace('.',',')+' мин':'—'}, потолок ${fmtN(Math.round(s2.ceil/100)*100)} м.`};}
  return res;}
function airFlightNews(s,md,res){const ch=[];if(res.kind!=='crash'&&md.role!=='race'&&md.status==='proto')ch.push([`В серию (оснастка ${money(airToolCost(s,md))})`,'air:prod:'+md.id]);
  if(res.kind==='flaw')ch.push(['Доводка — месяц','air:fix:'+md.id]);ch.push(['Понятно','ok']);
  pushEvent({own:1,kicker:'Первый полёт',title:res.kind==='crash'?`«${md.name}» разбит на испытаниях`:res.kind==='flaw'?`«${md.name}» летает — но не так, как задумано`:`«${md.name}» летает!`,deck:AIR_ROLES[md.role].n,text:res.text,choices:ch},true);}
function airProdStart(s,md){if(!md||md.status!=='proto'||!md.flown)return false;const c=airToolCost(s,md);if(s.cash<c)return false;s.cash-=c;md.status='tool';md.toolLeft=1;md.toolCost=c;md.price=0;
  addLog(`«${md.name}»: стапели и шаблоны для серии — ${money(c)}. Через месяц — первые серийные аэропланы.`);return true;}
/* ---------- события авиацеха (из checkEvents) ---------- */
const AIR_RIVAL_C={'Fokker E.III':'de','Albatros D.II':'de','Fokker D.VII':'de','Rumpler C.I':'de','Albatros B.II':'de','Gotha G.IV':'de','Junkers F 13':'de','Dornier Wal':'de',
  'SPAD S.VII':'fr','SPAD S.XIII':'fr','Nieuport 11':'fr','Morane-Saulnier N':'fr','Breguet 14':'fr','Voisin III':'fr','Caudron G.3':'fr','Farman MF.7':'fr','Farman MF.11':'fr',
  'Sopwith Camel':'uk','Bristol F.2B':'uk','B.E.2':'uk','B.E.2c':'uk','Handley Page O/400':'uk','Short 184':'uk','Felixstowe F.2A':'uk','Avro 504K':'uk','Vickers Vimy':'uk',
  'Caproni Ca.3':'it','«Илья Муромец»':'ru','Curtiss JN-4':'us','Curtiss «America»':'us','DH-4 «Либерти»':'us'};
function airLicChoice(s,role){const t=tNow(s),L=(AIR_RIVAL[role]||[]).filter(e=>e[0]<=t+0.01);for(let i=L.length-1;i>=0;i--){const c=AIR_RIVAL_C[L[i][1]]||'fr';if(!airFoe(s.country,c,t)&&!(s.country!=='de'&&c==='de')&&!(s.country==='de'&&c!=='de'))return L[i];}return null;}
function airBestFor(s,role){const t=tNow(s);let best=null,bq=0;(s.air.models||[]).forEach(m=>{if(m.role!==role||!(m.status==='prod'||m.status==='tool'||(m.status==='proto'&&m.flown)))return;const q=airQ(m,t).q;if(q>bq){bq=q;best=m;}});return best?{md:best,q:bq}:null;}
function airCheck(s){const A=s.air;if(!A||!A.lv||s.pending.length)return;const t=tNow(s),T=mi(s);
  // опытный образец готов — первый полёт
  if((A.proto||[]).length){const id=A.proto.shift(),md=A.models.find(m=>m.id===id);if(md&&md.status==='proto'&&!md.flown){const me=airHeroFlies(s),bp=airBestPilot(s);
    pushEvent({own:1,kicker:'Авиацех',title:`«${md.name}»: опытный образец готов`,deck:'Первый полёт',img:'',text:`Мастера выкатили «${md.name}» из ангара. ${AIR_ROLES[md.role].n}, ${airParts(md).f.name.toLowerCase()}, ${airParts(md).e.name}. Расчёт обещает ${Math.round(airStats(md,t).v)} км/ч — но расчёт ещё никогда не летал.\nКто поднимет его в воздух?`,
      choices:[[me?'✈ Лететь самому (3D)':'✈ Сесть за штурвал (3D)','air:fly:'+id],[`Доверить: ${bp.hero?'вы сами, без съёмки':bp.n}`,'air:test:'+id],['Позже','ok']]},true);return;}}
  // перемирие: военные заказы расторгнуты
  if(t>=1918.87&&!A.armist&&airWarOn(s.country,1918.8)){A.armist=1;const L=A.orders.filter(o=>o.mil);if(L.length){let comp=0;L.forEach(o=>{comp+=o.left*o.price*0.15;});A.orders=A.orders.filter(o=>!o.mil);comp=Math.round(comp);s.cash+=comp;
    pushEvent({own:1,kicker:'Перемирие',title:'Военное министерство расторгает заказы на аэропланы',deck:`Неустойка заводу — ${money(comp)}`,text:`Война кончилась — армии не нужны тысячи аэропланов. Все контракты расторгнуты, за недоделанное министерство платит пятнадцатую долю цены. На складах стоят тысячи новых машин и моторов — скоро их распродадут за гроши.\nЧто дальше? Почта, авиалинии, спортсмены и аэроклубы — рынок маленький, но он растёт.`},true);return;}}
  // Версальский договор: Германии запрещено строить аэропланы
  if(s.country==='de'&&t>=1919.5&&!A.versailles){A.versailles=1;pushEvent({own:1,kicker:'Версаль',title:'Германии запрещено строить аэропланы',deck:'До 1922 года — ни одного',text:`По Версальскому договору союзная комиссия опечатывает авиазаводы и режет моторы. Фоккер вывез в Голландию 220 самолётов и 400 моторов в шести поездах; Юнкерс строит в Швеции и под Москвой.\nПеренести сборку за границу — дорого, но авиацех будет жить.`,
    choices:[[`Перенести сборку за границу (${money(Math.round((s.plantVal||0)*0.05+8000*cpi(s)))})`,'air:abroad'],['Законсервировать авиацех','ok']]},true);return;}
  // военные заказы: в войну — раз в квартал, в мирное время — весной и осенью.
  // 0.38: первый заказ на модель — только через конкурс министерства (отзыв: «должны выполнять испытание для получения заказа,
  // и сравнивать нас будут с конкурентами»): министерство объявляет условия, участвуют фирмы страны, место решает заказ.
  // Повторные заказы на модель, уже прошедшую конкурс (или уже строившуюся для армии), приходят без конкурса, пока она не устарела.
  const war=airWarOn(s.country,t);if(t>=1910.9&&((war&&s.m%3===1)||(!war&&(s.m===2||s.m===8)))&&!(s.country==='de'&&airVersailles(t)&&!A.abroad)){
    let best=null,trial=null;AIR_MIL_ROLES.forEach(role=>{const B=airBestFor(s,role);if(!B||B.q<0.6)return;if(A.orders.some(o=>o.md===B.md.id&&o.left>0&&o.due-T>2))return;
      const months=war?4:6;let n=Math.round(airMilWant(s,B.md,months)*(war?1:0.8)),c=s.country;
      if(n<1&&war===false&&!s.soviet){['fr','uk','ru','it','us','de'].forEach(cc=>{if(cc===s.country)return;const m2=Math.round(airMilWant(s,B.md,months,cc));if(m2>n){n=m2;c=cc;}});}
      n=Math.min(n,Math.max(1,Math.round(airCapUnits(s,B.md)*months*1.1)));if(n<1)return;
      const proven=(B.md.milWon||0)>0||(B.md.milRep||0)>=5;
      if(proven&&B.q>=0.9){if(!best||n*airMilPrice(s,B.md)>best.n*best.price)best={md:B.md,n,price:airMilPrice(s,B.md),c,months,q:B.q};}
      else if(!trial||n>trial.n)trial={role,n,c,months};});
    if(best){const who=airMinistry(best.c,t,best.md.role);A.offer={md:best.md.id,n:best.n,price:best.price,due:T+best.months+1,who,c:best.c,mil:1};
      pushEvent({own:1,kicker:war?'Военный заказ':'Заказ армии',title:`${who}: ещё ${fmtN(best.n)} «${best.md.name}»`,deck:`по ${money(best.price)} — ${money(best.n*best.price)}, за ${best.months} мес.`,
        text:`«${best.md.name}» уже знают в войсках: ${war?'фронт просит ещё, и министерство заказывает без нового конкурса':'министерство продлевает заказ без нового конкурса'}. «${best.md.name}» — ${best.q>=1.05?'лучше':best.q>=0.95?'не хуже':'чуть хуже'} ${airRefEntry(best.md.role,t)[1]}. Цена — расходы завода и пятая часть сверху.\nВ авиацехе места на ${fmtN(Math.round(airCapUnits(s,best.md)))} таких аэропланов в месяц. Не успеете — неустойка десятая часть цены.${war?` Четверть суммы (${money(Math.round(best.n*best.price*0.25))}) министерство платит вперёд — на ангары и мастеров.`:''}`,
        choices:[['Подписать','air:sign'],['Отказаться','air:nosign']]},true);return;}
    if(trial){const ev=airTrialNew(s,trial.role,trial.c,trial.n,trial.months,war);if(ev){const who=airMinistry(trial.c,t,trial.role),R=AIR_ROLES[trial.role],F=airEvField(s,ev);
      pushEvent({own:1,kicker:war?'Военный конкурс':'Конкурс министерства',title:`${who} объявляет конкурс: ${R.n.toLowerCase()}`,deck:`победителю — заказ на ${fmtN(trial.n)} машин, второму — на ${fmtN(Math.round(trial.n*0.4))}`,
        text:`${who} ${war?'срочно ищет':'выбирает'} ${R.n.toLowerCase()} для своих отрядов и устраивает сравнительные испытания в ${MONTHS_P[ev.m]}: подъём на высоту на время, скорость на базе, посадка в круг у трибун. Комиссия ставит оценку каждой машине.\nУчастники: ${F.map(x=>`${x.n} (${x.plane})`).join(', ')} — и вы, если заявите облетанный аэроплан на вкладке «Небо». Лететь можно самому или доверить лётчику.\n${R.d}`,
        choices:[['К конкурсу','air:ev:'+ev.key],['Позже','ok']]},true);return;}}
    // в войну: если своих годных аэропланов нет — строить чужие по лицензии
    if(war&&(A.cap||0)>=1&&!A.licOffer||war&&A.licOffer&&T-A.licOffer>=6){for(const role of ['fight','recon','bomb']){const B=airBestFor(s,role);if(B&&B.q>=0.8)continue;const L=airLicChoice(s,role);if(!L)continue;
      if(A.models.some(m=>m.lic&&m.name===L[1]&&m.status!=='off'))continue;A.licOffer=T;const md={...L[2],role,name:L[1]},n=Math.max(2,Math.round(Math.min(airMilWant(s,{...md,milRep:20},4)*0.6,airCapUnits(s,md)*4)));
      A.licO={role,name:L[1],d:L[2],n};pushEvent({own:1,kicker:'Военный заказ',title:`Строить «${L[1]}» по лицензии`,deck:`${fmtN(n)} штук за 4 месяца`,text:`Фронту нужны ${AIR_ROLES[role].n.toLowerCase()}ы, а годного своего у «${s.company}» нет. Министерство предлагает строить «${L[1]}» по чертежам — с отчислением конструктору восьмой доли цены. Так в войну строили все: SPAD — Блерио и каретники, «Кэмелы» — мебельные фабрики, «Альбатросы» — вагонные заводы.`,
        choices:[['Строить по лицензии','air:lic'],['Отказаться','ok']]},true);return;}}}
  // исторические лётчики погибают в свой год (по истории)
  (A.pil||[]).forEach(p=>{const P=AIR_PILOTS.find(x=>x.id===p.id);if(P&&P.d&&t>=P.d+0.5&&!p.gone){p.gone=1;}});A.pil=(A.pil||[]).filter(p=>!p.gone);}
// 0.38: конкурс министерства на заказ — событие «Неба» (43i-airev.js) со сроком в следующем месяце; хранится в s.air.trials
function airTrialNew(s,role,c,n,months,war){const A=s.air,t=tNow(s);const y=s.m===11?s.y+1:s.y,m=(s.m+1)%12,key=`mil-${c}-${y}-${m}-${role}`;
  A.trials=(A.trials||[]).filter(e=>(e.y-1895)*12+e.m>=mi(s)-2);if(A.trials.some(e=>e.key===key))return null;
  const ev={key,y,m,name:`Конкурс ${c===s.country?'министерства':'в '+COUNTRIES[c].name+' (род. п.)'.replace(' (род. п.)','')}: ${AIR_ROLES[role].n.toLowerCase()}`,place:FW_HOME[c]||'reims',kind:'trial',c,prize:Math.round(1200*cpi(s)/100)*100,mil:{n,role,months,war:!!war},len:100,dyn:1,h:['','','']};
  A.trials.push(ev);return ev;}
function airMinistry(c,t,role){const sea=role==='sea';return c==='fr'?(sea?'Морское министерство Франции':'Военное министерство Франции'):c==='uk'?(sea?'Адмиралтейство':t<1918.25?'Военное министерство (Королевский лётный корпус)':'Министерство авиации'):
  c==='de'?(sea?'Имперский флот':'Инспекция авиационных войск'):c==='it'?'Военное министерство Италии':c==='us'?(sea?'Флот США':'Военное министерство США (Сигнальный корпус)'):(c==='ru'&&t>=1918?'Главкоавиа':'Военное министерство России');}
function airResolve(s,key){const A=s.air;if(!A)return false;const [,cmd,id]=key.split(':'),md=id?A.models.find(m=>String(m.id)===id):null;
  if(cmd==='ev'){s.pending.shift();tab='race';save();render();try{openAirEv(key.slice(7));}catch(e){console.warn(e);}return true;}
  if(cmd==='design'){s.pending.shift();tab='models';save();render();try{openAirDesigner();}catch(e){console.warn(e);}return true;}
  if(cmd==='fly'&&md){s.pending.shift();save();render();if(typeof flyTest==='function'&&flyTest(md))return true;const res=airTestAuto(s,md,airHeroFlies(s)?'hero':airBestPilot(s).id);airFlightNews(s,md,res);save();render();return true;}
  if(cmd==='test'&&md){s.pending.shift();const res=airTestAuto(s,md,airBestPilot(s).id);airFlightNews(s,md,res);save();render();return true;}
  if(cmd==='prod'&&md){if(!airProdStart(s,md))toast('Не хватает денег на оснастку');}
  if(cmd==='fix'&&md){md.status='dev';md.devLeft=1;md.devT=1;md.flaw=0;md.vk=Math.max(md.vk||1,0.98);md.flown=0;md.fixed=1;}
  if(cmd==='sign'&&A.offer){const o=A.offer;A.offer=null;const war=airWarOn(o.c,tNow(s)),adv=war?Math.round(o.n*o.price*0.25):0;if(adv){s.cash+=adv;}airOrderAdd(s,{md:o.md,n:o.n,price:o.price,due:o.due,who:o.who,c:o.c,mil:1,adv,advLeft:adv});const m=A.models.find(x=>x.id===o.md);addLog(`Подписан контракт: ${o.who} — ${fmtN(o.n)} «${m?m.name:''}» по ${money(o.price)}.`,'good');A.fame=Math.min(100,A.fame+1);}
  if(cmd==='nosign'&&A.offer){const m=A.models.find(x=>x.id===A.offer.md);if(m)m.milRep=(m.milRep||0)-2;A.offer=null;}
  if(cmd==='lic'&&A.licO){const L=A.licO;A.licO=null;const m=airNewModel(s,{...L.d,role:L.role,name:L.name},{status:'tool',toolLeft:2,lic:{n:L.name,roy:0.08},flown:1,milRep:20});
    const c=airToolCost(s,m);s.cash-=c;airOrderAdd(s,{md:m.id,n:L.n,price:airMilPrice(s,m),due:mi(s)+6,who:airMinistry(s.country,tNow(s),L.role),c:s.country,mil:1});addLog(`«${L.name}» по лицензии: оснастка ${money(c)}, контракт на ${fmtN(L.n)} штук.`,'good');}
  if(cmd==='abroad'){const c=Math.round((s.plantVal||0)*0.05+8000*cpi(s));s.cash-=c;A.abroad=1;A.wk=Math.round(A.wk*0.5);addLog(`Сборка аэропланов перенесена за границу (${money(c)}): продавать можно иностранцам и авиалиниям.`,'good');}
  return false;}
/* ---------- изобретения авиацеха ---------- */
function airTechCost(s,T){return Math.round(T.c*cpi(s)*(1+Math.max(0,T.y-tNow(s))*0.25)*bn('airTech')/50)*50;}
function airTechOpen(s){const t=tNow(s),A=s.air;return AIR_TECH.filter(T=>!A.tech[T.id]&&!(A.rd||[]).some(p=>p.id===T.id)&&T.y-t<=4&&T.y>t-0.01&&!(T.war&&!airWarOn(s.country,t)&&t<1915));}
function airTechStart(s,id){const T=AIR_TECH.find(x=>x.id===id),A=s.air;if(!T||!airTechOpen(s).includes(T)||(A.rd||[]).length>=2)return false;const c=airTechCost(s,T);if(s.cash<c)return false;
  s.cash-=c;A.rd=(A.rd||[]).concat({id,left:Math.max(2,Math.round(T.mo*bn('airDev'))),t:T.mo});addLog(`Авиацех: опытные работы «${T.n}» — ${money(c)}.`);return true;}
/* ---------- старт пути «Авиатор» ---------- */
function newAirGame(pioneer,country,company,diff,firstName){
  const P0=PIONEERS[pioneer],pk=P0&&P0.air?pioneer:'custom';newGame(pk,country,company||(P0&&P0.air?P0.co:'Авиамастерская'),diff,'');const g=G,P=PIONEERS[g.pioneer];
  const y=P.air?P.ay:(ASTART_C[country]||1909),m=P.air?(P.am||0):0;g.y=y;g.m=m;g.airStart=y+m/12;
  g.lines={car:0,moto:0,air:1};g.cap=0;g.capBuild=[];g.workers=0;g.models=[];g.dealers={};g.ad=0;g.wh=0;g.ui=g.ui||{};
  g.fleet={};g.mkY={};for(const cc in COUNTRIES)g.fleet[cc]=fleetHist(cc,y);for(const cc in COUNTRIES){try{const R2=mkCountry(cc,g,[]);g.mkY[cc]=SEGK.reduce((a,gg)=>a+R2.segs[gg].inc,0)*12/SEASON[0];}catch(_){}}
  g.cash=Math.round(COUNTRIES[country].cash*(P.air?P.acash:0.5)*bn('cash')*DIF().cash/100)*100;
  const A=airInit(g);A.lv=1;A.cap=AIRSHOP.cap;A.wk=P.air&&P.sk<0.5?12:10;A.fame=P.air?P.afame:6;(P.atech||[]).forEach(id=>{A.tech[id]=1;});
  const d0=P.air&&P.a1?P.a1:airStartDesign(country,y),nm=(firstName||'').trim()||d0.name,md=airNewModel(g,{...d0,name:nm},{status:'proto',flown:0,pk:d0.pk||1});
  if(d0.st==='prod'){md.status='prod';md.flown=1;md.launched=mi(g);md.price=0;}else A.proto=[md.id];
  g.plantVal=Math.round(3000*cpi(g));g.wh=0;
  try{awInit(g,true);}catch(_){}
  g.log=[];addLog(`${P.air?P.name+' открыл':'Вы открыли'} авиамастерскую «${g.company}», ${cityOf(g)}. ${A.wk} мастеров, ангар на поле за городом, первый аэроплан — «${md.name}».`,'hist');
  return g;}
function airIntroPapers(s){const A=s.air,md=A.models[0],t=tNow(s),st=airStats(md,t),P=PIONEERS[s.pioneer];
  pushEvent({kicker:`${s.y} год`,title:t<1908.6?'Люди летают!':t<1909.6?'Аэроплан — мода сезона':t<1914.5?'Небо зовёт':'Небо — новое поле боя',
    deck:t<1908.6?'Братья Райт молчат, французы пробуют':t<1909.6?'Фарман пролетел километр по кругу, Райт летает над Ле-Маном':t<1914.5?'Авиамитинги собирают сотни тысяч зрителей':'Армиям нужны тысячи аэропланов',img:t<1909?'Voisin 1907 biplane':t<1914.5?'Blériot XI':'SPAD S.XIII',imgCap:'',choices:[['Читать дальше','ok']],
    text:t<1908.6?'Аэроплан — машина тяжелее воздуха, которая летит сама, — ещё диковина. Сантос-Дюмон пролетел 220 метров над Багатель, братья Вуазен строят «коробки» на заказ, а в Америке братья Райт уверяют, что летают уже четыре года. Покупателей — единицы: спортсмены, мечтатели и богачи.\nКто построит аэроплан, который летает дольше минуты и поворачивает, получит приз и славу.':
      t<1914.5?'Аэроплан купить можно: спортсмены летают на митингах за призы, лётные школы учат первых авиаторов, газеты платят тысячи за перелёты — через Ла-Манш, из Лондона в Манчестер, из Парижа в Мадрид. Армии устраивают конкурсы и заказывают первые десятки аэропланов-разведчиков.\nКаждый рекорд — заголовок на первой полосе и заказы.':
      'Война: аэропланы-разведчики ведут артиллерию, истребители дерутся над окопами, бомбардировщики летят на города. Министерства заказывают тысячи машин у всех, кто может строить.'},true);
  pushEvent({own:1,kicker:cityOf(s),title:`«${s.company}» строит аэропланы`,deck:`Первый — «${md.name}»`,
    text:`В мастерской ${A.wk} мастеров, в кассе ${money(s.cash)}. «${md.name}»: ${AIR_ROLES[md.role].n.toLowerCase()}, ${airParts(md).f.name.toLowerCase()}, ${airParts(md).e.name}; по расчёту — ${Math.round(st.v)} км/ч.\n${md.status==='prod'?'Аэроплан уже летает — его можно продавать, выставлять на состязания и улучшать.':'Опытный образец готов к первому полёту.'} Деньги приносят продажи спортсменам и школам, призы состязаний и заказы армии.\nВкладки: «Ангар» — мастерская, «Аэропланы» — модели и конструктор, «Заказчики» — рынок, «Небо» — состязания, рекорды${t>=1914.5?' и фронт':''}. Один ход — один месяц.`},true);}
/* ---------- итоги года и наследие ---------- */
function airYear(s){const A=s.air;if(!A||!A.lv)return;const t=s.y+0.5,Y=A.y||{sold:0,rev:0,home:0},tot=AIR_ROLE_K.reduce((a,r)=>a+airMktRole(s.country,r,t),0);
  A.peakY=Math.max(A.peakY||0,Y.sold||0);if(tot>1){const sh=clamp((Y.home||0)/tot,0,1);A.shYrs=(A.shYrs||0)+sh;A.shLast=sh;}A.hist=(A.hist||[]).concat({y:s.y,sold:Y.sold||0,rev:Math.round(Y.rev||0),fame:Math.round(A.fame)}).slice(-40);A.y={sold:0,rev:0,home:0};}
function airLegacyBits(s){const A=s.air;if(!A||!A.lv)return {peak:0,cum:0,shY:0};const k=airOnly(s)?1:0.5;return {peak:5*Math.max(A.peakY||0,(A.y||{}).sold||0),cum:5*(A.sold||0),shY:k*(A.shYrs||0)};}
function airSportYears(s){const A=s.air,out=[];if(!A)return out;const Y={};Object.entries(A.ev||{}).forEach(([k,r])=>{if(r.place!==1)return;const ev=airEvByKey(s,k);if(ev&&ev.dyn)return;Y[r.y]=(Y[r.y]||0)+(ev&&(ev.open||ev.prize>=10000)?RACE_W.major:RACE_W.normal);});
  Object.values(A.rec||{}).forEach(r=>{Y[r.y]=(Y[r.y]||0)+4;});return Object.entries(Y).map(([y,v])=>[+y,v]);}
function airLegacyTitle(t){const me=t.me,cats=['scale','market','innov','sport','capital','brand'],top=cats.slice().sort((a,b)=>me[b]/LEG_MAX[b]-me[a]/LEG_MAX[a])[0];
  if(t.place===1)return ['Величайшая авиационная империя эпохи','Ни одна настоящая авиационная фирма 1929 года не оставила такого следа.'];
  if(top==='sport'&&me.sport>=100)return ['Повелитель рекордов','Ваши аэропланы знают по призам и мировым рекордам — как «Кёртисс» и «Макки».'];
  if(top==='innov'&&me.innov>=100)return ['Новый Юнкерс','Вы придумали то, на чём потом летал весь мир.'];
  if(top==='scale'&&me.scale>=200)return ['Новый SPAD','Ваши аэропланы строили тысячами — небо войны принадлежало им.'];
  if(t.place<=5)return ['Великая авиастроительная фирма','Одна из пяти самых заметных авиационных фирм эпохи.'];
  if(t.place<=12)return ['Заметная марка','Историки авиации знают вашу фирму.'];
  return ['Одна из сотен мастерских','Из сотен авиамастерских 1910-х до 1929 года дожили единицы. Ваша — среди них.'];}
function airNextStep(s){const A=s.air,t=tNow(s);const proto=A.models.find(m=>m.status==='proto'&&!m.flown);if(proto)return {icon:'✈',text:`«${proto.name}» ждёт первого полёта`,tab:'models'};
  if(!A.models.some(m=>['dev','proto','prod','tool','race'].includes(m.status)))return {icon:'📐',text:'Начертите аэроплан: «Аэропланы» → «Новый аэроплан»',tab:'models'};
  const ev=airEvSoon(s).find(e=>airEvStatus(s,e)==='open');if(ev)return {icon:'🏆',text:`${ev.name} — запись открыта`,tab:'race'};
  return {icon:'▶',text:'Жмите «Следующий месяц» — аэропланы строятся и продаются',tab:null};}
