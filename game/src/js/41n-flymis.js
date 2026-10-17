/* ================= 0.37: ЗАДАНИЯ ПОЛЁТА — КУРС, ПИЛОНЫ, ИТОГ =================
   Гонка: пилоны по углам круга, обходить снаружи (ворота — луч от пилона наружу); время — от линии старта (старт с хода, как в Реймсе);
   скорость — длина круга по пилонам / время. Дальность и высота — с автопилотом и ускорением времени. Перелёт — карта в масштабе:
   километр мира — несколько настоящих (бензин, часы и отказы — в настоящих). Военный конкурс: подъём, скорость на базе, посадка в круг. */
function flCross(p0,p1,a,b){const d1x=p1[0]-p0[0],d1z=p1[2]-p0[2],d2x=b[0]-a[0],d2z=b[1]-a[1],den=d1x*d2z-d1z*d2x;if(Math.abs(den)<1e-9)return false;
  const ux=a[0]-p0[0],uz=a[1]-p0[2],t=(ux*d2z-uz*d2x)/den,u=(ux*d1z-uz*d1x)/den;return t>=0&&t<=1&&u>=0&&u<=1;}
// прямоугольный круг: O — середина стартовой стороны, f — направление полёта по ней, n — внутрь круга
function flRect(O,f,n,a,b){const Q=(s,w)=>[O[0]+f[0]*s+n[0]*w,O[1]+f[1]*s+n[1]*w],P=[Q(a/2,0),Q(a/2,b),Q(-a/2,b),Q(-a/2,0)],C=Q(0,b/2);
  const out=P.map(p=>{const dx=p[0]-C[0],dz=p[1]-C[1],l=Math.hypot(dx,dz);return [dx/l,dz/l];});
  const gates=P.map((p,i)=>({a:p,b:[p[0]+out[i][0]*3000,p[1]+out[i][1]*3000],aim:[p[0]+out[i][0]*80,p[1]+out[i][1]*80],n:'пилон '+(i+1),py:p}));
  return {P,C,gates,len:2*(a+b),start:{a:[O[0]-n[0]*200,O[1]-n[1]*200],b:[O[0]+n[0]*260,O[1]+n[1]*260],aim:O,n:'старт',dir:f}};}
const flFmtT=s=>{s=Math.max(0,s);const h=Math.floor(s/3600),m=Math.floor(s%3600/60),ss=Math.floor(s%60);return h?`${h} ч ${String(m).padStart(2,'0')} мин`:`${m}:${String(ss).padStart(2,'0')}`;};
const flKmh=v=>v.toFixed(1).replace('.',',');
// море рядом со стартом гидроаэроплана: точка на воде, направление вдоль берега, «к морю»
function flSeaStart(sc){const B=FW_SC[sc];if(!B)return null;if(B.bio==='lake')return {A:[B.lake.x,-2200],f:[0,1],n:[1,0]};
  if(!B.sea)return null;const c=Math.cos(B.sea.a),s=Math.sin(B.sea.a),d=B.sea.off+650;return {A:[c*d,s*d],f:[-s,c],n:[c,s]};}
const FW_HOME_SEA={fr:'monaco',uk:'cowes',de:'kiel',us:'bay_us',it:'naples',ru:'spb'};
function flMission(cfg){const s=G,t=tNow(s),md=cfg.md,P=cfg.pil,ev=cfg.ev,k=cfg.kind,st=airStats(md,t),me=()=>FL.me;
  let place=cfg.place||(st.sea?FW_HOME_SEA[s.country]:FW_HOME[s.country])||'reims';
  if(st.sea&&!flSeaStart(place))place=FW_HOME_SEA[s.country]||'cowes';
  const M={kind:k,cfg,P,md,st,t0:null,place,A:[0,0],B:null,sea:st.sea,objs:[],rivals:[],stands:false,crowd:0,parked:[],warpMax:4,warpAuto:16,maxH:0,over:false,kd:1,mood:null};
  const ss=st.sea?flSeaStart(place):null;let O=[150,0],f=[0,1],n=[-1,0];
  if(ss){M.A=ss.A;O=[ss.A[0]+ss.n[0]*180+ss.f[0]*420,ss.A[1]+ss.n[1]*180+ss.f[1]*420];f=ss.f;n=ss.n;}
  M.start={x:ss?ss.A[0]:O[0]-f[0]*380+n[0]*90,z:ss?ss.A[1]:O[1]-f[1]*380+n[1]*90,hdg:Math.atan2(f[0],f[1])};
  const gyA=()=>FW&&FW.S.A?FW.S.A.y:0,agl=()=>{const a=me();return a.p[1]-Math.max(0,fwHgt(FW.S,a.p[0],a.p[2]));},altF=()=>me().p[1]-gyA();
  const who=P.hero?'Вы':P.n;
  if(k==='war')return frMission(cfg,M);
  // соперники в небе (для зрелища): эталонные аэропланы года, летят по кругу со своей скоростью
  const rivalsOn=(aims,list,alt)=>{list.slice(0,2).forEach((x,i)=>{const role=t>=1909?'race':'sport',rm={...airRefMd(t<1912?'sport':role,t),paint:['#b7bcc0','#a8261d','#2e4a7a','#d8b13a'][i%4]};
    const a=aims[(i*2+1)%aims.length];M.rivals.push(flKin({p:[a[0],gyA()+70+i*25,a[1]],psi:i*2,V:Math.max(15,(x.v||st.v*0.9)/3.6),alt:gyA()+70+i*25,wp:aims,i:(i*2+2)%aims.length,R:110,md:rm,name:x.n}));});};
  M.parked=(()=>{const L=[];['sport','train','recon','fight'].forEach((r,i)=>{if(L.length>=3)return;const e=airRefEntry(r,t);if(e&&e[0]<=t+0.01&&(i<2||airWarOn(s.country,t)))L.push({...airRefMd(r,t),paint:['#d9cfb2','#b7bcc0','#6c6a40','#b07a45'][i]});});return L;})();
  M.fin=(title,text,res,cls)=>{if(M.over)return;M.over=true;M.res=res;FLY.auto=false;flyEnd(title,text,cls);};
  M.quitText=()=>'Попытка не засчитана: аэроплан вернётся в ангар.';
  M.clock=()=>flFmtT((FL.t||0)*(FL.k||1));
  /* ===== первый полёт ===== */
  if(k==='test'){M.title=`Первый полёт: «${md.name}»`;const need=t<1909?25:t<1911?80:150,early=t<1909;M.phase=0;M.maxH=0;M.mood='clear';M.sc={};
    // 0.38: программа испытания (отзыв «миссия скучновато»): взлёт → набор высоты на время → вираж вокруг пилона → пролёт над ангарами → посадка в круг; оценка испытателя
    const py=[M.A[0]+(early?500:900),M.A[1]+(early?300:500)],pyR=early?220:260;M.objs.push({k:'pylon',x:py[0],z:py[1],h:20,col:'#f0d040'},{k:'gate',x:M.A[0],z:M.A[1],a:0,w:120,h:6});
    const PH=[['Взлёт',()=>`Газ — до отказа, ручку не трогать: оторвётся сам.`],['Набор высоты — на время',()=>`${Math.round(altF())} из ${need} м${M.tAir?' · '+flFmtT(FL.t-M.tAir):''}`],
      ['Вираж вокруг жёлтого пилона',()=>M.nearPy?'Обогнули — возвращайтесь к полю':'Обогните пилон и вернитесь к аэродрому'],['Пролёт над полем',()=>`Пройдите над кругом у ангаров ниже ${early?30:45} м — пусть видят, что аэроплан слушается`],
      ['Посадка',()=>'Газ убрать, планировать на круг, у земли — ручку на себя. Чем ближе к кругу, тем лучше']];
    M.goal=()=>`<b>${M.phase+1} из 5: ${PH[M.phase][0]}</b><span>${PH[M.phase][1]()}</span>`;
    M.target=()=>M.phase===2?(M.nearPy?[M.A[0],gyA()+30,M.A[1],'к полю']:[py[0],undefined,py[1],'пилон']):M.phase===3?[M.A[0],gyA()+20,M.A[1],'над кругом']:M.phase>=4?[M.A[0],gyA()+2,M.A[1],'круг']:null;
    M.step=()=>{const a=me();if(a.crash){M.done('crash');return;}if(!M.flew&&!a.gnd){M.flew=1;M.tAir=FL.t;flToast('Оторвался!','good');M.phase=1;}
      if(!M.flew)return;if(!a.gnd)M.maxH=Math.max(M.maxH,agl());const dA=Math.hypot(a.p[0]-M.A[0],a.p[2]-M.A[1]);
      if(M.phase===1&&agl()>need){M.sc.climb=FL.t-M.tAir;M.phase=2;flToast(`Высота ${need} м за ${flFmtT(M.sc.climb)} — теперь вираж вокруг пилона`,'good');}
      else if(M.phase===2){if(!M.nearPy&&Math.hypot(a.p[0]-py[0],a.p[2]-py[1])<pyR){M.nearPy=1;flToast('Пилон обогнут — назад к полю','good');}
        if(M.nearPy&&dA<700){M.sc.turn=1;M.phase=3;flToast('Вираж выполнен — пролёт над полем, пониже','good');}}
      else if(M.phase===3){const h=agl();if(dA<150&&h<(early?30:45)&&h>4&&!a.gnd){M.sc.fly=1;M.phase=4;flToast('Публика в восторге! Заходите на посадку','good');try{auSfx('cheer',0.7);}catch(_){}}}
      if(a.gnd&&a.Vg<2.5){if(FL.t-M.tAir<20||M.maxH<8){M.flew=0;M.phase=0;flToast('Это подлёт — нужен настоящий полёт');}else{M.sc.land=dA;M.done('land');}}};
    M.canLand=()=>M.phase>=2&&Math.hypot(me().p[0]-M.A[0],me().p[2]-M.A[1])<1600&&!me().gnd;M.land=()=>M.done('land',1);
    // оценка испытателя: подъём против расчёта, вираж, пролёт, посадка у круга; хорошая программа уменьшает шанс «не так, как задумано»
    M.score=()=>{const ref=Math.max(20,st.t1k*60*need/1000);let q=0.25;if(M.sc.climb)q+=0.25*clamp(ref/M.sc.climb,0.4,1.2);if(M.sc.turn)q+=0.2;if(M.sc.fly)q+=0.15;if(M.sc.land!=null)q+=0.15*clamp(1.2-M.sc.land/250,0,1);return clamp(q,0,1);};
    M.done=(how,auto)=>{const a=me(),risk=airTestRisk(s,md,P),q=M.score();let res;if(how==='crash')res=airTestApply(s,md,P,'crash',{why:a.crash,self:1});
      else res=airTestApply(s,md,P,Math.random()<risk*0.55*(1.35-0.7*q)?'flaw':'ok',{self:1,secs:(FL.t-(M.tAir||0)),hard:a.hard||auto&&Math.random()<0.2,prog:q});
      const prog=[M.sc.climb?`подъём на ${need} м — ${flFmtT(M.sc.climb)}`:'',M.sc.turn?'вираж вокруг пилона':'',M.sc.fly?'пролёт над полем':'',M.sc.land!=null?`посадка в ${Math.round(M.sc.land)} м от круга`:(auto?'посадку сделал испытатель':'')].filter(Boolean).join(', ');
      if(res.kind!=='crash'&&prog)res.text+=` Программа: ${prog}. Оценка испытателя — ${Math.round(q*10)} из 10.`;
      M.fin(res.kind==='crash'?'Аэроплан разбит':res.kind==='flaw'?'Летает — но не так, как задумано':'«'+md.name+'» летает!',res.text,res,res.kind==='crash'?'bad':res.kind==='ok'?'good':'');};
    M.quit=()=>{if(!M.flew){flyClose();return;}const res=airTestAuto(s,md,P.id);M.res=res;M.over=true;M.apply();flyClose();};M.quitText=()=>M.flew?'Испытатель посадит аэроплан сам — результат определит его посадка.':'Аэроплан вернётся в ангар; лететь можно позже — с карточки модели.';
    M.apply=()=>{airFlightNews(s,md,M.res);};M.fallback=()=>{const res=airTestAuto(s,md,P.id);airFlightNews(s,md,res);};
    return M;}
  /* ===== состязания ===== */
  const F=ev?airEvField(s,ev):[];M.F=F;
  if(ev){M.title=ev.name;M.place=st.sea&&!ss?place:(ev.place&&FW_SC[ev.place]?ev.place:place);if(ev.sea&&!flSeaStart(M.place))M.place=FW_HOME_SEA[ev.c]||'cowes';M.stands=['speed','dist','alt','circle','loop','trial'].includes(ev.kind);M.crowd=ev.prize>8000?380:220;
    M.mood=(['clear','clear','cloudy','morning','evening'])[hashStr(ev.key)%5];
    M.fallback=()=>airEvQuick(ev.key,md.id,P.id);M.apply=()=>{airEvApply(s,ev,M.res);};
    M.quit=()=>{const res={ev:ev.key,md:md.id,pil:P.id,field:F,place:F.length+1,txt:'сошёл с дистанции',dnf:'сошёл'};M.res=res;M.over=true;M.apply();flyClose();};M.quitText=()=>'Сход с дистанции: участие засчитано, но без места и приза.';}
  if(ev&&ev.sea&&!st.sea){}// (такие аэропланы на Кубок Шнейдера не пускают — см. airEvMds)
  const ssE=st.sea?flSeaStart(M.place):null;if(ssE&&ev){M.A=ssE.A;O=[ssE.A[0]+ssE.n[0]*180+ssE.f[0]*420,ssE.A[1]+ssE.n[1]*180+ssE.f[1]*420];f=ssE.f;n=ssE.n;M.start={x:ssE.A[0],z:ssE.A[1],hdg:Math.atan2(f[0],f[1])};}
  const circuit=(lapKm,laps)=>{const L=lapKm*1000,C=flRect(O,f,n,L*0.36,L*0.14);M.C=C;M.lapKm=C.len/1000;M.laps=laps;M.seq=[C.start];for(let l=0;l<laps;l++){C.gates.forEach(g=>M.seq.push(g));M.seq.push(C.start);}M.gi=0;M.lap=0;
    C.P.forEach((p,i)=>M.objs.push({k:'pylon',x:p[0],z:p[1],h:24,sea:!!st.sea||!!(ev&&ev.sea),col:['#e0402a','#f0d040','#2a60c0','#40a040'][i]}));
    // 0.38: трасса — по чистому полю: просеки вдоль сторон прямоугольника и от аэродрома к линии старта
    C.P.forEach((p,i)=>{const q=C.P[(i+1)%C.P.length];M.objs.push({k:'clear',a:[p[0],p[1]],b:[q[0],q[1]],w:260});});M.objs.push({k:'clear',a:[M.A[0],M.A[1]],b:[O[0],O[1]],w:300});
    M.objs.push({k:'gate',x:O[0],z:O[1],a:Math.atan2(f[0],f[1])+Math.PI/2,w:460,h:16,sea:!!st.sea});M.aims=C.gates.map(g=>g.aim);};
  const gateStep=(p0)=>{const a=me(),g=M.seq[M.gi];if(!g)return false;if(!flCross(p0,a.p,g.a,g.b))return false;if(g.dir&&a.v[0]*g.dir[0]+a.v[2]*g.dir[1]<0)return false;M.gi++;return g;};
  const nextAim=()=>{const g=M.seq&&M.seq[M.gi];return g?[g.aim[0],undefined,g.aim[1],g.n]:null;};
  /* ===== гонка вокруг пилонов ===== */
  if(k==='speed'){const laps=clamp(Math.round(ev.laps||2),1,3),lapKm=clamp((ev.len||20)/(ev.laps||1),3,5.5);circuit(lapKm,laps);M.nom=M.lapKm*laps;
    rivalsOn(M.aims,F.filter(x=>!x.hist).concat(F.filter(x=>x.hist)),70);
    M.goal=()=>M.t0===null?`<b>Старт с хода</b><span>Взлетайте и пройдите линию старта — время пойдёт. ${laps} ${laps>1?'круга':'круг'} по ${flKmh(M.lapKm)} км, пилоны — обходить снаружи.</span>`:
      `<b>Круг ${Math.min(M.lap+1,laps)} из ${laps}</b><span>${M.seq[M.gi]?'дальше: '+M.seq[M.gi].n:''} · ${flFmtT(FL.t-M.t0)}${M.dist>0.3?' · темп '+flKmh(M.pace())+' км/ч':''}</span>`;
    M.dist=0;M.pace=()=>{const el=(FL.t-M.t0)/3600;return el>0?M.dist/el:0;};
    M.board=()=>{const rows=F.map(x=>({n:x.n,plane:x.plane,v:x.v,h:x.hist})),mine=M.t0!==null&&M.dist>0.5?{n:who,v:M.pace(),me:1}:null;if(mine)rows.push(mine);rows.sort((a,b)=>b.v-a.v);
      return `<b>Соперники</b>${rows.slice(0,6).map((x,i)=>`<p class="${x.me?'me':''}">${i+1}. ${esc(x.n)} — ${flKmh(x.v)} км/ч${x.me?' (темп)':''}</p>`).join('')}`;};
    M.target=nextAim;
    M.step=(dt,p0)=>{const a=me();if(a.crash){M.done('dnf','авария: '+a.crash);return;}      const g=gateStep(p0);if(g){if(M.gi===1){M.t0=FL.t;M.dist=0;flToast('Старт! Время пошло','good');}else if(g===M.C.start){M.lap++;M.dist=M.lap*M.lapKm;flToast(`Круг ${M.lap}: ${flFmtT(FL.t-M.t0)}`,'good');if(M.gi>=M.seq.length){M.done('fin');return;}}
        else{flToast(g.n+' ✓');const done=M.lap*M.lapKm+(M.C.gates.indexOf(g)+1)*M.lapKm/5;M.dist=done;}}
      if(M.t0!==null&&a.gnd&&a.Vg<3){M.done('dnf',a.eng.run?'сел, не закончив гонку':'вынужденная посадка: '+(a.eng.fail||'мотор'));}};
    M.done=(how,why)=>{let res;if(how==='fin'){const T=FL.t-M.t0,v=M.nom/(T/3600);res={ev:ev.key,md:md.id,pil:P.id,field:F,v,place:1+F.filter(x=>x.v>v).length,txt:`${flKmh(v)} км/ч`};}
      else res={ev:ev.key,md:md.id,pil:P.id,field:F,v:0,place:F.length+1,dnf:why,txt:`сошёл: ${why}`};
      M.fin(res.place===1?'Победа!':res.dnf?'Сход':res.place+'-е место',res.dnf?res.txt:`Средняя скорость — ${res.txt}. ${res.place===1?'Быстрее всех!':'Победитель — '+esc((F.find(x=>x.v>=res.v)||F[0]).n)+'.'}`,res,res.place===1?'good':res.dnf?'bad':'');};
    return M;}
  /* ===== дальность по кругу ===== */
  if(k==='dist'||k==='rdist'){circuit(5,999);M.warpAuto=64;const aimAlt=gyA()+90;M.title=k==='rdist'?'Рекорд дальности по замкнутому кругу':M.title;
    M.goal=()=>M.t0===null?`<b>Старт с хода</b><span>Пройдите линию старта и летите круг за кругом — пока хватит бензина. Автопилот и ускорение — кнопками вверху.</span>`:
      `<b>${M.lap} ${M.lap%10===1&&M.lap%100!==11?'круг':'кругов'} · ${fmtN(Math.round(M.lap*M.lapKm))} км</b><span>${flFmtT(FL.t-M.t0)} в воздухе · бензин ${Math.round(me().fuel/me().fuelMax*100)}%</span>`;
    if(F.length)M.board=()=>`<b>${k==='rdist'?'Рекорд':'Соперники'}</b>${F.map(x=>`<p>${esc(x.n)} — ${fmtN(x.d||0)} км</p>`).join('')}<p class="me">${who} — ${fmtN(Math.round(M.lap*M.lapKm))} км</p>`;
    if(k==='rdist'){const cur=airRecCur(s,'dist');M.board=()=>`<b>Мировой рекорд</b><p>${fmtN(Math.round(cur.v))} км — ${esc(cur.who)}</p><p class="me">${who} — ${fmtN(Math.round(M.lap*M.lapKm))} км</p>`;}
    M.target=nextAim;M.auto=()=>{const a=me(),g=M.seq[M.gi];flAuto(a,{x:g.aim[0],z:g.aim[1],alt:aimAlt,spd:st.vc/3.6*0.92,bank:0.5});};
    M.step=(dt,p0)=>{const a=me();if(a.crash){M.done(a.crash);return;}const g=gateStep(p0);if(g===M.C.start){if(M.gi===1){M.t0=FL.t;flToast('Старт!','good');}else{M.lap++;flToast(`Круг ${M.lap}`);}}
      if(M.t0!==null&&a.gnd&&a.Vg<3)M.done(a.eng.run?null:(a.eng.fail||'мотор'));};
    M.canLand=()=>M.t0!==null&&!me().gnd;M.land=()=>M.done(null,1);
    M.done=(why,auto)=>{const d=Math.round(M.lap*M.lapKm),txt=`${fmtN(d)} км по кругу${why?' — '+why:''}`;
      if(k==='rdist'){M.res={rec:'dist',v:d,txt};M.fin(d>airRecCur(s,'dist').v*1.005?'Мировой рекорд!':'Рекорд не побит',txt,M.res,d>airRecCur(s,'dist').v*1.005?'good':'');return;}
      const res={ev:ev.key,md:md.id,pil:P.id,field:F,d,place:1+F.filter(x=>(x.d||0)>d).length,txt};M.fin(res.place===1?'Победа!':res.place+'-е место',txt,res,res.place===1?'good':'');};
    if(k==='rdist'){M.apply=()=>airRecApply(s,'dist',md,P,M.res.v,M.res.txt);M.fallback=()=>airRecQuick('dist',md.id,P.id);M.quit=()=>flyClose();M.quitText=()=>'Попытку можно повторить через три месяца.';}
    return M;}
  /* ===== высота ===== */
  if(k==='alt'||k==='ralt'){M.warpAuto=32;if(k==='ralt')M.title='Рекорд высоты';const cur=k==='ralt'?airRecCur(s,'alt'):null;M.hist=[];
    M.goal=()=>`<b>Барограф: ${fmtN(Math.round(M.maxH))} м</b><span>${me().gnd?'Взлетайте и набирайте высоту — кругами над полем.':M.ceil?'Потолок — мотору не хватает воздуха. Можно садиться.':'Набор: '+(me().v[1]>0?'+':'')+me().v[1].toFixed(1).replace('.',',')+' м/с'}</span>`;
    M.board=()=>cur?`<b>Мировой рекорд</b><p>${fmtN(Math.round(cur.v))} м — ${esc(cur.who)}</p>`:F.length?`<b>Соперники</b>${F.map(x=>`<p>${esc(x.n)} — ${fmtN(x.a||0)} м</p>`).join('')}`:'';
    M.auto=()=>{const a=me();flAuto(a,{hdg:flHdg(a)+0.35,alt:a.p[1]+3000,thr:1,bank:0.35,climbK:1,edge:1});};
    M.step=(dt)=>{const a=me();if(a.crash){M.done(a.crash);return;}if(!a.gnd){M.maxH=Math.max(M.maxH,altF());M.flew=1;}
      M.hist.push([FL.t,a.p[1]]);while(M.hist.length&&M.hist[0][0]<FL.t-40)M.hist.shift();if(!M.ceil&&M.maxH>150&&M.hist.length>2&&FL.t-M.hist[0][0]>30&&(a.p[1]-M.hist[0][1])/(FL.t-M.hist[0][0])<0.35&&a.thr>0.9){M.ceil=1;flToast('Потолок! Мотору не хватает воздуха','good');}
      if(M.flew&&a.gnd&&a.Vg<3)M.done(null);};
    M.canLand=()=>M.maxH>40&&!me().gnd;M.land=()=>M.done(null,1);
    M.done=(why)=>{const a2=Math.round(M.maxH/10)*10,txt=`${fmtN(a2)} м${why?' — '+why:''}`;
      if(k==='ralt'){const ok=a2>cur.v*1.005;M.res={rec:'alt',v:a2,txt};M.fin(ok?'Мировой рекорд!':'Рекорд не побит',`Барограф показал ${txt}.`,M.res,ok?'good':'');return;}
      const res={ev:ev.key,md:md.id,pil:P.id,field:F,a:a2,place:1+F.filter(x=>(x.a||0)>a2).length,txt};M.fin(res.place===1?'Победа!':res.place+'-е место',`Барограф показал ${txt}.`,res,res.place===1?'good':'');};
    if(k==='ralt'){M.apply=()=>airRecApply(s,'alt',md,P,M.res.v,M.res.txt);M.fallback=()=>airRecQuick('alt',md.id,P.id);M.quit=()=>flyClose();M.quitText=()=>'Попытку можно повторить через три месяца.';}
    return M;}
  /* ===== рекорд скорости: база 3 км, два прохода навстречу, не выше 150 м ===== */
  if(k==='rspeed'){M.title='Рекорд скорости на базе 3 км';const cur=airRecCur(s,'speed'),zb=ss?O[1]:700,xb=ss?O[0]:0,u=ss?f:[1,0],w=ss?n:[0,1];
    const G1=[xb-u[0]*1500,zb-u[1]*1500],G2=[xb+u[0]*1500,zb+u[1]*1500],seg=(c)=>({a:[c[0]-w[0]*300,c[1]-w[1]*300],b:[c[0]+w[0]*300,c[1]+w[1]*300]});
    [G1,G2].forEach(c=>{for(const sd of [-1,1])M.objs.push({k:'pylon',x:c[0]+w[0]*sd*300,z:c[1]+w[1]*sd*300,h:20,sea:!!st.sea,col:'#e0402a'});});
    M.objs.push({k:'clear',a:[G1[0]-u[0]*900,G1[1]-u[1]*900],b:[G2[0]+u[0]*900,G2[1]+u[1]*900],w:420},{k:'clear',a:[M.A[0],M.A[1]],b:[xb,zb],w:300});
    // судейские палатки и флаги на концах базы — видно, где она
    [G1,G2].forEach(c=>M.objs.push({k:'judge',x:c[0]+w[0]*380,z:c[1]+w[1]*380,a:Math.atan2(u[0],u[1])}));
    M.pass=[];M.cur=null;M.need=0;
    M.goal=()=>`<b>${M.pass.length===0?'Первый проход':M.pass.length===1?'Обратный проход':'Готово'}</b><span>${M.cur?'на базе: '+flFmtT(FL.t-M.cur.t0):'Влетайте в ворота базы ниже 150 м, на полном газу.'}${M.pass.length?' · первый: '+flKmh(3/(M.pass[0]/3600))+' км/ч':''}</span>`;
    M.board=()=>`<b>Мировой рекорд</b><p>${flKmh(cur.v)} км/ч — ${esc(cur.who)}</p>`;
    M.target=()=>{const c=M.cur?M.cur.to:(M.pass.length%2===0?G1:G2);return [c[0],undefined,c[1],M.cur?'финиш базы':'ворота базы'];};
    M.step=(dt,p0)=>{const a=me();if(a.crash){M.done(a.crash);return;}const sA=seg(G1),sB=seg(G2);
      for(const [g,other] of [[sA,G2],[sB,G1]]){if(!flCross(p0,a.p,g.a,g.b))continue;const gEnd=other===G2?sB:sA;
        if(M.cur&&M.cur.end===g){const T=FL.t-M.cur.t0;if(agl()>150){flToast('Выше 150 м — проход не засчитан','bad');}else{M.pass.push(T);flToast(`Проход ${M.pass.length}: ${flKmh(3/(T/3600))} км/ч`,'good');}M.cur=null;if(M.pass.length>=2){M.done(null);return;}continue;}
        if(!M.cur){if(agl()>150){flToast('Слишком высоко: ниже 150 м!','bad');continue;}M.cur={t0:FL.t,end:gEnd,to:other};flToast('Вход в базу!');}}
      if(a.gnd&&a.Vg<3&&M.flew)M.done('сел');if(!a.gnd)M.flew=1;};
    M.done=(why)=>{if(M.pass.length<2){M.res=null;M.fin('Попытка не удалась',why?'Аэроплан '+why+'.':'Нужно два прохода по базе навстречу друг другу.',null,'bad');return;}
      const v=6/((M.pass[0]+M.pass[1])/3600),ok=v>cur.v*1.005,txt=`${flKmh(v)} км/ч на базе 3 км`;M.res={rec:'speed',v,txt};M.fin(ok?'Мировой рекорд!':'Рекорд не побит',txt,M.res,ok?'good':'');};
    M.apply=()=>{if(M.res)airRecApply(s,'speed',md,P,M.res.v,M.res.txt);else{const A=s.air;A.rtry=A.rtry||{};A.rtry.speed=mi(s);}};M.fallback=()=>airRecQuick('speed',md.id,P.id);M.quit=()=>flyClose();M.quitText=()=>'Попытку можно повторить через три месяца.';
    return M;}
  /* ===== перелёт из A в B (карта в масштабе) ===== */
  if(k==='cross'){M.A=[-9500,0];M.B=[9500,0];const km=(ev.len||40)/19;FL.kNext=km;M.kd=km;M.warpAuto=64;M.start={x:-9500-90,z:-380,hdg:Math.PI/2};
    if(st.sea){const S2=FW_SC[M.place];if(!S2||S2.bio!=='strait'){}}
    const dest={channel:'Дувр',alps:'Домодоссола',pyrenees:'Мадрид',russia:ev.key==='spbmos-1911'?'Москва':ev.key==='kiev-1914'?'Киев':'Пекин',england:ev.key==='lonman-1910'?'Манчестер':'финиш',med:'Бизерта',atlantic:'Ирландия'}[M.place]||'финиш';M.destN=dest;
    const cruise=M.place==='alps'?2500:M.place==='pyrenees'?2000:M.place==='atlantic'||M.place==='med'?600:450;
    M.goal=()=>{const a=me(),d=Math.hypot(a.p[0]-M.B[0],a.p[2]-M.B[1])*km/1000;return `<b>До: ${dest} — ${fmtN(Math.round(d))} км</b><span>в пути ${flFmtT(FL.t*km)} · бензин ${Math.round(a.fuel/a.fuelMax*100)}%${M.place==='alps'?' · перевал — 2 000 м':''}</span>`;};
    if(!ev.dyn)M.board=()=>`<b>В истории</b><p>${esc(airEvMine(G,ev)?'Вы':ev.h[0])}: ${esc(ev.h[2])}</p>`;
    M.target=()=>[M.B[0],undefined,M.B[1],dest];
    M.auto=()=>{const a=me();flAuto(a,{x:M.B[0],z:M.B[1],alt:Math.max(gyA()+cruise,a.p[1]>gyA()+cruise?a.p[1]:0),spd:st.vc/3.6*0.95,bank:0.4,floor:120});};
    M.step=()=>{const a=me();if(a.crash){M.done(false,a.crash);return;}if(!a.gnd)M.flew=1;const d=Math.hypot(a.p[0]-M.B[0],a.p[2]-M.B[1]);
      if(M.flew&&a.gnd&&a.Vg<3){if(d<900)M.done(true);else M.done(false,a.eng.run?'сел, не долетев':'вынужденная посадка: '+(a.eng.fail||'мотор'));}};
    M.canLand=()=>{const a=me();return M.flew&&!a.gnd&&Math.hypot(a.p[0]-M.B[0],a.p[2]-M.B[1])<2600;};M.land=()=>M.done(true);M.landAt=()=>[M.B[0],M.B[1],FW&&FW.S.B?FW.S.B.y:0];
    M.done=(ok,why)=>{const h=Math.round(FL.t*km/360)/10,sea=/channel|med|atlantic/.test(M.place),wet=!ok&&why&&/вод/.test(why);
      const res={ev:ev.key,md:md.id,pil:P.id,field:F,ok,h,place:ok?1:0,txt:ok?`долетел за ${String(h).replace('.',',')} ч`:wet||(!ok&&sea)?'сел на воду — лётчика подобрал миноносец':why||'не долетел'};
      M.fin(ok?`${dest}! Перелёт удался`:'Перелёт не удался',ok?`${who} ${P.hero?'долетели':'долетел'} за ${String(h).replace('.',',')} ч.`:res.txt,res,ok?'good':'bad');};
    return M;}
  /* ===== военный конкурс: подъём, скорость на базе, посадка в круг ===== */
  if(k==='trial'){const H1=t<1912?300:500,role=ev.mil?ev.mil.role:'recon',zb=900,G1=[-1500,zb],G2=[1500,zb],ref=airStats(airRefMd(role,t),t);M.task=0;M.sc={};
    [G1,G2].forEach(c=>{for(const sd of [-1,1])M.objs.push({k:'pylon',x:c[0],z:c[1]+sd*300,h:18,col:'#e0402a'});});M.objs.push({k:'gate',x:0,z:0,a:0,w:120,h:8});
    M.objs.push({k:'clear',a:[G1[0]-900,zb],b:[G2[0]+900,zb],w:420},{k:'judge',x:G1[0]-380,z:zb,a:Math.PI/2},{k:'judge',x:G2[0]+380,z:zb,a:-Math.PI/2});
    const tasks=['Подъём на '+H1+' м — на время','Скорость на базе 3 км','Посадка в круг у трибун'];
    M.goal=()=>`<b>Задание ${M.task+1} из 3: ${tasks[Math.min(2,M.task)]}</b><span>${M.task===0?(M.tUp?flFmtT(FL.t-M.tUp)+' · '+Math.round(altF())+' м':'Дайте газ — время пойдёт с разбега'):M.task===1?(M.bas?'на базе: '+flFmtT(FL.t-M.bas.t0):'через ворота базы — по прямой'):'садитесь как можно ближе к белому кругу в середине поля'}</span>`;
    M.target=()=>M.task===1?(M.bas?[M.bas.to[0],undefined,M.bas.to[1],'финиш базы']:[G1[0],undefined,G1[1],'база']):M.task===2?[M.A[0],gyA(),M.A[1],'круг']:null;
    M.board=()=>`<b>Комиссия</b>${F.map(x=>`<p>${esc(x.n)} — ${(x.q||0).toFixed(2).replace('.',',')}</p>`).join('')}`;
    M.step=(dt,p0)=>{const a=me();if(a.crash){M.done(a.crash);return;}if(M.tUp==null&&a.thr>0.5)M.tUp=FL.t;
      if(M.task===0&&altF()>=H1){M.sc.climb=FL.t-M.tUp;M.task=1;flToast(`Подъём: ${flFmtT(M.sc.climb)}`,'good');}
      if(M.task===1){const seg=c=>({a:[c[0],c[1]-300],b:[c[0],c[1]+300]});for(const [c,o] of [[G1,G2],[G2,G1]]){const g=seg(c);if(!flCross(p0,a.p,g.a,g.b))continue;
        if(M.bas&&M.bas.to===c){const T=FL.t-M.bas.t0;M.sc.v=3/(T/3600);M.task=2;M.bas=null;flToast(`База: ${flKmh(M.sc.v)} км/ч`,'good');break;}if(!M.bas){M.bas={t0:FL.t,to:o};flToast('Вход в базу!');}}}
      if(M.task===2&&a.gnd&&a.Vg<2.5){M.sc.land=Math.hypot(a.p[0]-M.A[0],a.p[2]-M.A[1]);M.done(null);}
      if(M.task<2&&M.tUp!=null&&a.gnd&&a.Vg<2.5&&FL.t-M.tUp>30)M.done('сел, не выполнив задания');};
    M.done=(why)=>{const qd=airQ(md,t,role).q;let perf=0.75;if(!why){const cl=clamp((ref.t1k*60*H1/1000)/Math.max(30,M.sc.climb||999),0.5,1.5),sp=clamp((M.sc.v||0)/Math.max(30,ref.v*0.95),0.5,1.4),ld=clamp(1.3-(M.sc.land||300)/150,0.4,1.3);perf=(cl+sp+ld)/3;}
      const q=why?qd*0.6:qd*(0.82+0.18*perf),res={ev:ev.key,md:md.id,pil:P.id,field:F,q,place:1+F.filter(x=>x.q>q).length,txt:`оценка комиссии ${q.toFixed(2).replace('.',',')}`+(why?' — '+why:'')};
      M.fin(res.place===1?'Первое место!':res.place+'-е место',`${res.txt}.${M.sc.climb?` Подъём на ${H1} м — ${flFmtT(M.sc.climb)}.`:''}${M.sc.v?` Скорость — ${flKmh(M.sc.v)} км/ч.`:''}${M.sc.land!=null?` Посадка в ${Math.round(M.sc.land)} м от круга.`:''}`,res,res.place===1?'good':'');};
    return M;}
  /* ===== круг в километр (1908) и мёртвая петля (1913) ===== */
  if(k==='circle'){const py=[M.A[0],M.A[1]+520];M.objs.push({k:'pylon',x:py[0],z:py[1],h:16,col:'#e0402a'},{k:'gate',x:M.A[0],z:M.A[1],a:Math.PI/2,w:300,h:10});M.start={x:M.A[0],z:M.A[1]-300,hdg:0};M.phase=0;
    const line={a:[M.A[0]-150,M.A[1]],b:[M.A[0]+150,M.A[1]]},pg={a:py,b:[py[0],py[1]+3000]};
    M.goal=()=>`<b>${['Взлёт и линия старта','Обогнуть столб в 500 м','Вернуться через линию старта','Посадка'][M.phase]}</b><span>Весь круг — в воздухе, не касаясь земли.</span>`;
    M.target=()=>M.phase===1?[py[0],undefined,py[1]+40,'столб']:M.phase===2||M.phase===0?[M.A[0],undefined,M.A[1],'линия']:[M.A[0],gyA(),M.A[1],'поле'];
    M.step=(dt,p0)=>{const a=me();if(a.crash){M.done(a.crash);return;}
      if(M.phase===0&&!a.gnd&&flCross(p0,a.p,line.a,line.b)){M.phase=1;flToast('Линия старта!');}
      else if(M.phase===1&&flCross(p0,a.p,pg.a,pg.b)){M.phase=2;flToast('Столб обойдён — назад!','good');}
      else if(M.phase===2&&flCross(p0,a.p,line.a,line.b)){M.phase=3;M.ok=1;flToast('Круг замкнут!','good');}
      if(M.phase>0&&M.phase<3&&a.gnd){M.done('коснулся земли до конца круга');return;}if(M.phase===3&&a.gnd&&a.Vg<2.5)M.done(null);};
    M.canLand=()=>M.phase===3&&!me().gnd;M.land=()=>M.done(null);
    M.done=(why)=>{const ok=!why&&M.ok,res={ev:ev.key,md:md.id,pil:P.id,field:F,ok,place:ok?1:0,txt:ok?'круг замкнут, посадка у старта':why};M.fin(ok?'Круг замкнут!':'Не вышло',res.txt,res,ok?'good':'bad');};
    return M;}
  if(k==='loop'){M.phase=0;M.acc=0;M.last=null;
    M.goal=()=>`<b>${M.phase===0?'Наберите 400 м':M.phase===1?'Петля: разгон в пологом пикировании, затем ручку на себя до конца':'Петля! Посадка'}</b><span>${Math.round(agl())} м над землёй${M.phase===1&&Math.abs(M.acc)>0.3?' · '+Math.round(Math.abs(M.acc)*57.3)+'°':''}</span>`;
    M.step=()=>{const a=me();if(a.crash){M.done(a.crash);return;}if(M.phase===0&&agl()>400){M.phase=1;flToast('Высота есть — петля!');}
      if(M.phase===1){const h0=M.h0||(M.h0=[Math.sin(flHdg(a)),Math.cos(flHdg(a))]),th=Math.atan2(a.fw[1],a.fw[0]*h0[0]+a.fw[2]*h0[1]);if(M.last!==null){const d=angWrap(th-M.last);M.acc+=d;}M.last=th;
        if(Math.abs(flBank(a))>1.2&&Math.abs(M.acc)<2){M.acc=0;M.h0=null;}if(a.fw[1]<0.25&&a.fw[1]>-0.25&&Math.abs(M.acc)<0.5)M.h0=null;
        if(Math.abs(M.acc)>=6.0&&Math.abs(flBank(a))<0.7){M.phase=2;flToast('Мёртвая петля!','good');}}
      if(M.phase===2&&a.gnd&&a.Vg<2.5)M.done(null);if(M.phase<2&&a.gnd&&M.flew&&a.Vg<2.5)M.done('сел без петли');if(!a.gnd)M.flew=1;};
    M.canLand=()=>M.phase===2&&!me().gnd;M.land=()=>M.done(null);
    M.done=(why)=>{const ok=!why&&M.phase===2,res={ev:ev.key,md:md.id,pil:P.id,field:F,ok,place:ok?1:0,txt:ok?'петля!':why};M.fin(ok?'Петля!':'Не вышло',ok?'Аэроплан прошёл полный круг в вертикали — и вышел в горизонт.':why,res,ok?'good':'bad');};
    return M;}
  return M;}
