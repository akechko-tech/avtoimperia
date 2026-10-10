/* ================= ПОКРЫТИЕ, ЛУЖИ, ГРЯЗЬ, ВОДА, АВАРИИ, ПОЕЗД ================= */
// 0.18: машина чувствует дорогу. Сцепление (mu) и сопротивление качению (crr) — по покрытию под колёсами:
// асфальт, бетон, клинкер, булыжник в городах, щебень, грунт, доски; обочина, трава, пашня, лес, камни, песок, снег.
// Дождь делает гладкое скользким (мокрый булыжник и доски — почти лёд), а грунт — вязким. Лужи и грязь на дороге — пятна,
// которые видно на картинке и чувствует физика. В реке и в море машина глохнет — её вытаскивают. Удар о дерево,
// дом, камень или поезд — авария: машина встаёт, механик чинит, при сильном ударе — сход.
const SURF={
  asphalt:{mu:1.0,crr:1,wet:0.78,rough:0.8,n:'асфальт'},concrete:{mu:0.97,crr:1,wet:0.8,rough:0.9,n:'бетон'},
  brick:{mu:0.95,crr:1.1,wet:0.7,rough:1.0,n:'клинкер'},pave:{mu:0.9,crr:1.15,wet:0.63,rough:1.35,n:'булыжник'},
  board:{mu:0.97,crr:0.9,wet:0.64,rough:0.7,n:'доски'},macadam:{mu:0.9,crr:1.15,wet:0.84,rough:1.0,n:'щебень'},
  dirt:{mu:0.82,crr:1.5,wet:0.74,wc:1.3,rough:1.3,n:'грунт'},mount:{mu:0.84,crr:1.3,wet:0.78,wc:1.2,rough:1.4,n:'горная дорога'},
  mud:{mu:0.58,crr:2.1,wet:0.9,wc:1.15,rough:1.4,n:'грязь'},sand:{mu:0.7,crr:2.2,wet:1.05,rough:1.0,n:'песок'},
  beach:{mu:0.8,crr:1.5,wet:1.0,rough:0.8,n:'пляж'},snow:{mu:0.5,crr:1.8,wet:1,rough:1.1,n:'снег'},
  // вне дороги: чем дальше от полотна, тем вязче и скользче
  verge:{mu:0.7,crr:2.2,wet:0.78,wc:1.2,rough:1.6,n:'обочина'},grass:{mu:0.55,crr:4,wet:0.7,wc:1.2,rough:1.8,n:'трава'},
  field:{mu:0.45,crr:5.5,wet:0.72,wc:1.35,rough:2.2,n:'пашня'},forest:{mu:0.5,crr:5,wet:0.8,rough:2.4,n:'лес'},
  rock:{mu:0.72,crr:2.4,wet:0.8,rough:2.8,n:'камни'},dune:{mu:0.45,crr:6,wet:1,rough:1.2,n:'песок'},
  // пятна на дороге
  puddle:{mu:0.5,crr:2.6,rough:1,n:'лужа'},mudhole:{mu:0.34,crr:7,rough:1.7,n:'грязь'},water:{mu:0.3,crr:14,rough:2,n:'вода'}};
// Покрытие дороги в точке: в городах до 1920-х — булыжник вместо грунта и щебня; в тоннеле — щебень (грунт под сводом сухой и укатан)
function roadSurfKey(trk,i){const t=trk.terrAt(i),town=trk.town&&trk.town[i];if(town&&trk.rc.y<1922&&(t==='dirt'||t==='macadam'||t==='mount'||t==='mud'))return 'pave';
  if(trk.tunAt&&trk.tunAt[i]&&(t==='dirt'||t==='mud'||t==='mount'))return 'macadam';return SURF[t]?t:'dirt';}
function rainOn(trk,i){return rainW(trk,i)>0.35;}
// 0.19: насколько мокрая дорога (0 — сухо, 1 — залита): дождь мочит постепенно, без дождя — сохнет; в тоннеле сухо
function rainW(trk,i){if(!R||!R.wx||(trk.tunAt&&trk.tunAt[i]))return 0;return R.wetK!==undefined?R.wetK:R.wx.rain?1:0;}
// Сцепление дороги для ИИ (планирование скорости) — с погодой
function roadMuAt(trk,i){const k=roadSurfKey(trk,i),S=SURF[k],w=rainW(trk,i);return S.mu*(1+((S.wet||1)-1)*w);}
// Что под колёсами машины: покрытие, сцепление, сопротивление, тряска (+ пятно, если в луже или грязи)
function surfUnder(c,trk,lat){const W=trk.W,al=Math.abs(lat),i=c.idx;let k,P=null;
  if(al<=W/2+0.2){k=roadSurfKey(trk,i);P=patchAt(trk,c.x,c.z,i);if(P)k=P.kind;}
  else if(al<=W/2+1.5)k=trk.town&&trk.town[i]?'pave':trk.tunAt&&trk.tunAt[i]?'macadam':'verge';
  else k=offSurfKey(trk,c,al);
  const S=SURF[k],w=rainW(trk,i);return {k,mu:S.mu*(1+((S.wet||1)-1)*w),crr:S.crr*(1+((S.wc||1)-1)*w),rough:S.rough,P,wet:w>0.35};}
// Вне дороги: по карте земли 3D-мира (поле, лес, песок) или по участку трассы
function offSurfKey(trk,c,al){const cfg=trk.cfg;if(cfg.terr==='snow')return 'snow';if(cfg.terr==='sand')return 'dune';if(cfg.terr==='beach')return 'sand';
  const sg=segAt(trk,c.idx);
  if(al>trk.W/2+7&&typeof R3!=='undefined'&&R3.on&&R3.T===trk&&R3.smap){const M=R3.smap,S=R3.smapS,u=R3.cmU,x=Math.floor((c.x-u[0])*u[2]*S),z=Math.floor((c.z-u[1])*u[3]*S);
    if(x>=0&&z>=0&&x<S&&z<S){const o=(z*S+x)*4,dirt=M[o+1],forest=M[o+2],cover=M[o+3];
      if(cover>140)return 'dune';if(forest>130)return 'forest';if(dirt>150)return R3.F&&R3.F.mount?'rock':'field';}}
  if(sg===RSEG.forest)return 'forest';if(sg===RSEG.serp||sg===RSEG.tunnel)return 'rock';if(sg===RSEG.coast)return 'sand';
  return 'grass';}
/* ---------- лужи и грязь на дороге: план на гонку (одни и те же для гонки и погоды) ---------- */
// Пятно — эллипс вдоль дороги в мировых координатах (центр, направление, полуоси); край неровный — так же и в шейдере дороги
function planPatches(trk,rain){const n=trk.n,r=mulberry32(hashStr('patch|'+trk.rc.key+(rain?'w':'d'))),L=[],at=new Int16Array(n);trk.patches=L;trk.patchAt=at;
  if(trk.cfg.oval||trk.rc.track==='board'||trk.cfg.sprint)return;
  const soft=i=>{const k=roadSurfKey(trk,i);return k==='dirt'||k==='mount'||k==='mud'||k==='macadam';};
  const put=(i,len,lat,w,kind)=>{const nI=Math.max(1,Math.round(len/trk.step)),i0=i,i1=i+nI;if(i1>=n-3)return;for(let j=Math.max(0,i0-3);j<=Math.min(n-1,i1+3);j++)if(at[j])return;
    const ic=Math.round((i0+i1)/2),p=trk.pts[ic],nn=trk.N[ic],t=trk.T[ic];
    L.push({i0,i1,lat,w,kind,ph:r()*6.28,x:p[0]+nn[0]*lat,z:p[2]+nn[1]*lat,tx:t[0],tz:t[1],a:nI*trk.step/2+0.8,b:w/2});
    for(let j=Math.max(0,i0-2);j<=Math.min(n-1,i1+2);j++)at[j]=L.length;};
  const s0=trk.closed?4:trk.startIdx+Math.round(60/trk.step),s1=trk.closed?n-8:trk.finishIdx-Math.round(40/trk.step);
  let i=s0+Math.round((20+r()*40)/trk.step);
  while(i<s1){const sg=segAt(trk,i),sft=soft(i),town=trk.town&&trk.town[i],bridge=trk.bridge&&trk.bridge[i],tun=trk.tunAt&&trk.tunAt[i];
    // в дождь лужи чаще; грязь — в лесу, в сёлах и на мягкой дороге; на мостах, в тоннелях и у переезда — ничего
    const gap=rain?(sft?110:260):(sft?260:900);
    if(!bridge&&!tun&&sg!==RSEG.rail){
      if(sft&&!town&&(sg===RSEG.forest||sg===RSEG.village||r()<0.25)&&r()<(rain?0.55:0.35)){const len=6+r()*10;put(i,len,(r()-0.5)*trk.W*0.25,trk.W*(0.55+r()*0.4),'mudhole');}
      else if(rain||sft&&r()<0.3){const len=2.5+r()*6,w=1.1+r()*(trk.W*0.35);put(i,len,(r()-0.5)*(trk.W-w)*0.9,w,'puddle');}}
    i+=Math.max(2,Math.round((gap*(0.6+r()*0.8))/trk.step));}}
function patchIn(P,x,z){const dx=x-P.x,dz=z-P.z,u=dx*P.tx+dz*P.tz,v=-dx*P.tz+dz*P.tx,an=Math.atan2(v,u);
  return Math.hypot(u/P.a,v/P.b)*(1+0.1*Math.sin(3*an+P.ph)+0.05*Math.sin(7*an+P.ph*2));}
function patchAt(trk,x,z,i){if(!trk.patchAt)return null;const k=trk.patchAt[i];if(!k)return null;const P=trk.patches[k-1];if(P.rain&&(!R||(R.wetK||0)<0.45))return null;return patchIn(P,x,z)<1?P:null;}
/* ---------- вода: реки под мостами, море у берега, океан у пляжа ---------- */
function waterAt(trk,x,z){if(typeof R3==='undefined'||!R3.on||R3.T!==trk||!R3.F)return null;
  for(const rv of trk.rivers||[]){const dd=riverDist(trk,rv,x,z);if(Math.abs(dd.s)<1300&&Math.abs(dd.e)<rv.w/2+1){const L=riverLine(trk,rv),m=dd.s,mc=Math.sin(m/170+rv.ph)*22*sstep(20,120,Math.abs(m))+Math.sin(m/61+rv.ph*2)*6*sstep(20,120,Math.abs(m));
      const cx=L.p[0]+L.d[0]*m+L.t[0]*mc,cz=L.p[2]+L.d[1]*m+L.t[1]*mc;return fH(cx,cz)+0.9;}}
  // настоящая местность: вода — по карте моря (40c-real.js); пляжные гонки — своим морем ниже
  if(trk.real&&trk.cfg.terr!=='beach'){const wm=trk.real.wm;if(wm&&realWet(trk,x,z)>=0.5&&fH(x,z)<wm.y)return wm.y;return null;}
  for(const cs of trk.coast||[])if(cs.sea!==undefined){const y=cs.sea+0.2;if(fH(x,z)<y)return y;}
  if(R3.beachY!==undefined&&fH(x,z)<R3.beachY)return R3.beachY;
  return null;}
/* ---------- аварии: удар о дерево, дом, камень, поезд ---------- */
function crashKindOf(o){const t=o&&(o.kind||'');
  if(/^(plane|oak|elm|poplar|cypress|olive|pine|fir|birch|palm|tree)$/.test(t))return 'tree';
  if(/^(rock|cliff|boulder)$/.test(t))return 'rock';if(t==='gstone')return 'curb';
  if(/^(dune|hay|stog|bush|vine|hedge|agave|cactus)$/.test(t))return 'soft';
  if(/^(fence|fence_ru|rgate|sign|km|verst|marsh|gend|photo|post)$/.test(t))return 'fence';
  if(t==='pole'||t==='lamp')return 'pole';if(t==='crowd')return 'crowd';if(t==='wall'||t==='gate'||t==='sbag')return 'wall';if(t==='stand'||t==='pits')return 'stand';if(t==='cart')return 'cart';
  return 'house';}
// Итог удара (зовёт wallHit): imp — скорость в препятствие, м/с; за шаг физики остаётся самый сильный удар
function crashNote(c,imp,kind,x,z){if(!c.crash||imp>c.crash.imp)c.crash={imp,kind:kind||'wall',x:x===undefined?c.x:x,z:z===undefined?c.z:z};}
const CRASH_TXT={curb:'удар о тумбу',tree:'удар о дерево',rock:'удар о скалу',house:'удар о дом',wall:'удар о стену',stand:'удар о трибуну',train:'столкновение с поездом',pole:'удар о столб',cart:'удар о телегу',
  soft:'машина увязла',fence:'снесён забор',crowd:'зрители разбежались',slope:'удар о склон',fall:'падение с обрыва'};
// Сила удара решает всё: касание — лишь толчок; удар — заминка; сильный удар — ремонт, машина «хромает»;
// тяжёлая авария — чаще сход, и гонщик с механиком могут пострадать (больница на месяцы, иногда — конец карьеры).
// imp — скорость в препятствие поперёк (м/с); пороги сдвинуты для мягких (забор, кусты) и средних (столб, телега) препятствий
const CRASH_TIER=['касание','удар','сильный удар','тяжёлая авария'];
function crashTier(imp,kind){if(kind==='train')return imp>10?4:3;if(kind==='fall')return imp>11?4:imp>7?3:2;
  const soft=kind==='fence'||kind==='crowd'||kind==='soft'||kind==='slope',mid=kind==='pole'||kind==='cart'||kind==='curb',L0=soft?9:kind==='curb'?8:mid?6:4.5;
  if(imp<L0)return 0;if(soft)return imp<L0+6?1:2;const x=imp-L0;return x<3?1:x<7?2:x<13?3:4;}
function crashResolve(c){const K=c.crash;c.crash=null;if(!K||c.dnf||c.fin!==null)return;
  const imp=K.imp,kind=K.kind,kids=DIF().simple,me=c===R.follow,ai=!c.player,aiK=ai?0.5:1,tier=crashTier(imp,kind);
  if(!tier){if(me&&imp>3)R.shake=Math.max(R.shake,0.25);return;}
  const what=CRASH_TXT[kind]||'удар',who=c.player?'':(c.drvName||c.label)+': ',mech=c.st&&c.st.mech;c.hit=0;c.crashN=(c.crashN||0)+1;
  if(window.CRASH_LOG)CRASH_LOG.push([c.label||c.name,kind,+imp.toFixed(1),+c.lat.toFixed(1),c.idx,c.player?1:0,c.surf,tier]);
  if(tier===1){// касание: скорость теряется в самом ударе, немного помяли крыло — едем дальше
    c.vx*=0.8;c.dmg=Math.min(100,c.dmg+1+imp*0.2);if(c.you&&c.player)rMsgT('ЗАДЕЛИ — '+what,1.1);}
  else{const soft=kind==='fence'||kind==='crowd'||kind==='soft'||kind==='slope';c.vx*=soft?0.3:0.08;c.vy*=0.2;c.r*=0.3;
    c.dmg=Math.min(100,c.dmg+[0,0,6,16,34][tier]+imp*(tier>=3?0.8:0.3));
    const pDnf=kids?0:(kind==='train'?clamp(0.35+imp/25,0,0.9):tier===4?clamp(0.5+(imp-18)/25,0.5,0.92):tier===3?clamp(0.1+(imp-11)/40,0.1,0.3):0)*(ai?0.3:1)+(c.dmg>90&&!kids?0.25:0);
    if(tier>=3&&!kids)crashInjury(c,tier,imp,kind);
    if(c.inj&&c.inj.sev>=2&&!c.dnf){c.dnf='гонщик ранен';c.thr=0;if(c.you)rMsgT(`${who}${c.inj.txt.toUpperCase()} — СХОД`,3.4);}
    else if(Math.random()<pDnf){c.dnf=kind==='train'?'поезд':kind==='fall'?'падение с обрыва':'авария';c.thr=0;if(c.you)rMsgT(`${who}СХОД — ${what}`,3);}
    else if(kind==='fall'){// сорвались с обрыва: машину поднимают на дорогу верёвками и лошадьми
      const t=(30+Math.min(20,c.fallDrop||8)*2)*(mech?0.8:1)*(kids?0.5:1)*aiK;c.inWater=2;c.rescueWhy='fall';c.rescueT=t;c.rescueIdx=c.offIdx>=0?c.offIdx:c.idx;c.vx=0;c.vy=0;c.r=0;c.limp=true;
      if(c.you)rMsgT(`${who}СОРВАЛИСЬ С ОБРЫВА! Машину поднимают на дорогу — ~${Math.round(t)} с`+(c.inj&&c.inj.sev===1?' · '+c.inj.txt:''),3.2);}
    else{const t=(tier===2?(soft?2+imp*0.15:3+(imp-7)*0.6):tier===3?10+(imp-11)*1.4:26+(imp-17)*0.9)*(kind==='train'?1.5:1)*(mech?0.7:1)*(kids?0.5:1)*aiK;
      c.stopT=Math.max(c.stopT||0,t);c.stopWhy=what;if(tier===3&&!soft&&Math.random()<0.5||tier===4)c.limp=true;
      if(c.you)rMsgT(`${who}${(tier===2?what:tier===3?'сильный '+what:'тяжёлая авария').toUpperCase()}! ${soft?'Выбираемся':mech?'Механик чинит':'Ремонт'} — ~${Math.round(t)} с`+(c.inj&&c.inj.sev===1?' · '+c.inj.txt:''),2.8);}}
  if(me){R.shake=Math.min(1.2,0.3+imp*0.05*(tier>1?1:0.5));try{auSfx('crash',Math.min(1,imp/12)*(tier>1?1:0.5));if(kind==='tree'||kind==='fence'||kind==='cart'||kind==='soft')auSfx('wood',kind==='soft'?0.5:tier>1?1:0.5);}catch(_){}
    try{if(c.player&&navigator.vibrate)navigator.vibrate(Math.min(400,imp*(tier>1?25:8)));}catch(_){}}
  else try{ambCrash(c,imp,kind);}catch(_){}
  if(typeof R3!=='undefined'&&R3.on&&tier>1)try{crashFx(c,K);}catch(_){}}
// Травмы: в тяжёлой аварии гонщик (и механик, если едет рядом) может пострадать.
// sev 1 — ушибы (едет дальше), 2 — больница на 1–3 месяца, 3 — тяжёлая травма: полгода и больше, иногда — уход из гонок
const INJ_TXT={1:['ушибы','разбито колено','вывих плеча'],2:['перелом руки','сломаны рёбра','сотрясение'],3:['тяжёлые переломы','травма спины','сильные ожоги']};
function crashInjury(c,tier,imp,kind){const base=tier===4?clamp(0.3+(imp-17)/30,0.3,0.75):clamp(0.06+(imp-11)/60,0.06,0.18),k=(kind==='fall'||kind==='train'?1.4:1)*(c.player?1:0.8);
  const roll=who=>{if(Math.random()>=base*k)return null;const r=Math.random(),sev=tier===4?(r<0.35?1:r<0.8?2:3):(r<0.7?1:2);
    const months=sev===1?0:sev===2?1+Math.floor(Math.random()*3):5+Math.floor(Math.random()*6),retire=sev===3&&Math.random()<(who==='drv'?0.35:0.3);
    return {sev,months,retire,txt:pick(INJ_TXT[sev]),kind};};
  const d=roll('drv');if(d&&(!c.inj||d.sev>c.inj.sev))c.inj=d;
  if(c.st&&c.st.mech){const m=roll('mech');if(m&&(!c.mInj||m.sev>c.mInj.sev)){c.mInj=m;if(c.you&&m.sev>=2)rMsgT(`${c.player?'':(c.drvName||c.label)+': '}механик ранен — ${m.txt}`,2.6);}}}
/* ---------- вода: машина глохнет, её вытаскивают на дорогу ---------- */
function waterCheck(c,trk,dt){if(c.dnf||c.fin!==null||c.inWater>=2)return;
  if(Math.abs(c.lat)<trk.W/2+0.8){c.inWater=0;return;}
  const lvl=waterAt(trk,c.x,c.z);if(lvl===null){c.inWater=0;return;}
  const g=c.v3&&c.v3.y!==null?c.v3.y:fH(c.x,c.z),depth=lvl-g;c.waterY=lvl;if(depth<0.2){c.inWater=0;return;}
  const me=c===R.follow;
  if(!c.inWater){c.inWater=1;c.wetT=0;if(me){try{auSfx('splash',1);}catch(_){}R.shake=Math.max(R.shake,0.5);}if(typeof R3!=='undefined'&&R3.on)try{splashFx(c,lvl,Math.min(1.6,0.6+Math.abs(c.vx)/12));}catch(_){}}
  c.wetT=(c.wetT||0)+dt;c.vx*=Math.pow(depth>0.6?0.05:0.3,dt);c.vy*=Math.pow(0.1,dt);
  if(depth>0.55&&c.wetT>0.8){c.inWater=2;c.vx=0;c.vy=0;c.r=0;
    const kids=DIF().simple,t=(kids?12:28)*(c.st&&c.st.mech?0.8:1);c.dmg=Math.min(100,c.dmg+12);
    if(c.you)rMsgT(`${c.player?'':(c.drvName||c.label)+': '}В ВОДЕ! Мотор залило — машину вытаскивают (~${Math.round(t)} с)`,3.2);
    c.rescueT=t;c.rescueIdx=c.offIdx>=0?c.offIdx:c.idx;}}
function rescueTick(c,dt){if(c.inWater!==2)return false;c.thr=0;c.brk=1;c.vx=0;c.vy=0;c.rescueT-=dt;
  if(c.rescueT<=0){const fall=c.rescueWhy==='fall';c.inWater=0;c.rescueWhy='';c.fallen=0;respawnAt(c,c.rescueIdx,c.lap);if(!fall)c.flood=14;c.offIdx=-1;
    if(c.you)rMsgT((c.player?'':(c.drvName||c.label)+': ')+(fall?'МАШИНА НА ДОРОГЕ — помята, но едет':'МАШИНА НА ДОРОГЕ — мотор ещё кашляет'),2);}
  return true;}
// Обрыв и ущелье: земля за обочиной круто уходит вниз от дороги — машина срывается.
// В 3D — по рельефу (перепад от дороги и крутизна склона); без рельефа — у обрыва серпантина (со стороны тумб)
function dropUnder(c,trk,lat){const W=trk.W;if(Math.abs(lat)<W/2+1.5)return 0;
  if(typeof R3!=='undefined'&&R3.on&&R3.F&&R3.T===trk&&typeof fH==='function'){const h=fH(c.x,c.z),dr=trk.pts[c.idx][1]-h;if(dr<2.4)return 0;
    const e=1.5,gx=(fH(c.x+e,c.z)-fH(c.x-e,c.z))/(2*e),gz=(fH(c.x,c.z+e)-fH(c.x,c.z-e))/(2*e),sl=Math.hypot(gx,gz);return sl>0.6||dr>7?dr:0;}
  const sg=trk.segT&&trk.segT[c.idx];if(sg===RSEG.serp){const bend=trk.K[c.idx]>0?1:-1;if(Math.sign(lat)===-bend&&Math.abs(lat)>W/2+3.5)return 8;}
  return 0;}
/* ---------- поезд и шлагбаум ---------- */
// Состав: паровоз, тендер и четыре вагона — около 56 м
function trainSpan(rl){const st=rl.st;if(!st||st.state!==1)return null;const len=56;return {a:Math.min(st.s,st.s-st.dir*len),b:Math.max(st.s,st.s-st.dir*len)};}
function trainCheck(c,trk){if(!trk.rails||!trk.rails.length||c.dnf||c.fin!==null)return;
  for(const rl of trk.rails){let di=rl.i-c.idx;if(trk.closed)di=((di%trk.n)+trk.n*1.5)%trk.n-trk.n/2;if(Math.abs(di)*trk.step>60)continue;
    const L=railLine(trk,rl),dx=c.x-L.p[0],dz=c.z-L.p[2],s=dx*L.d[0]+dz*L.d[1],e=dx*L.d[1]-dz*L.d[0],ae=Math.abs(e),sp=trainSpan(rl);
    // сам поезд: вагоны шириной ~3 м — пройти сквозь нельзя; удар отбрасывает машину от путей
    if(sp&&ae<2.7&&s>sp.a-1.2&&s<sp.b+1.2){if(!c.trainHit){c.trainHit=1;crashNote(c,Math.max(Math.hypot(c.vx,c.vy),rl.st.v*0.6,9),'train');}
      const nx=L.d[1],nz=-L.d[0],sg=e>=0?1:-1,push=2.7-ae+0.25;c.x+=nx*sg*push;c.z+=nz*sg*push;c.vx*=0.2;c.vy*=0.2;}
    else c.trainHit=0;
    // шлагбаумы опущены: стрелы поперёк дороги в 8 м до и после рельсов; на ходу — сносятся, на малой скорости — держат
    if((rl.gate||0)>0.85)for(const sd of [1,-1]){const gi=sd>0?0:1;if(rl.broken&&rl.broken[gi])continue;
      let du=c.idx-(rl.i-2*sd);if(trk.closed)du=((du%trk.n)+trk.n*1.5)%trk.n-trk.n/2;const u=(du+(c.segT||0))*trk.step;
      if(u>-2.2&&u<0.6&&Math.abs(c.lat)<trk.W/2+0.8&&c.vx>0){
        if(c.vx>2.5||sd<0){rl.broken=rl.broken||[0,0];rl.broken[gi]=1;c.dmg=Math.min(100,c.dmg+5);c.vx*=0.55;
          if(c===R.follow){R.shake=Math.max(R.shake,0.4);try{auSfx('wood',0.8);}catch(_){}}if(c.you)rMsgT((c.player?'':(c.drvName||c.label)+': ')+'ШЛАГБАУМ СНЕСЁН!',1.6);}
        else c.vx=0;}}}}
// ИИ: у закрытого переезда — остановиться у шлагбаума и ждать поезд
function aiGateStop(c,trk){if(!trk.rails||!trk.rails.length)return Infinity;let best=Infinity;
  for(const rl of trk.rails){const st=rl.st,closing=(rl.gate||0)>0.1||(st&&st.state===1&&Math.abs(st.s)<240);if(!closing)continue;
    let di=rl.i-c.idx;if(trk.closed)di=((di%trk.n)+trk.n)%trk.n;const d=(di-(c.segT||0))*trk.step;if(d>11&&d<150)best=Math.min(best,d-11);}
  return best;}
/* ---------- эффекты: брызги, грязь, щепки ---------- */
function splashFx(c,lvl,k){for(let q=0;q<30*k;q++){const a=Math.random()*6.28,v=2+Math.random()*4.5;r3dPart(c.x+Math.cos(a)*0.8,lvl+0.1,c.z+Math.sin(a)*0.8,Math.cos(a)*v+Math.sin(c.yaw)*c.vx*0.3,2.5+Math.random()*4.5,Math.sin(a)*v+Math.cos(c.yaw)*c.vx*0.3,0.16,0.5,1.1+Math.random()*0.6,[225,232,238],0.6,1);}
  for(let q=0;q<10*k;q++)r3dPart(c.x+(Math.random()-0.5)*2,lvl+0.3,c.z+(Math.random()-0.5)*2,(Math.random()-0.5)*1.5,0.8+Math.random(),(Math.random()-0.5)*1.5,0.7,2.4,1.6,[235,240,244],0.3);}
function crashFx(c,K){const col=K.kind==='tree'?[120,90,60]:K.kind==='rock'?[150,145,138]:K.kind==='train'?[60,60,60]:K.kind==='soft'?[150,128,80]:[170,160,150],y=(c.v3&&c.v3.y!==null?c.v3.y:c.y)||0;
  for(let q=0;q<22;q++){const a=Math.random()*6.28,v=1.5+Math.random()*4;r3dPart(K.x,y+0.8,K.z,Math.cos(a)*v,1.5+Math.random()*3,Math.sin(a)*v,0.14,0.1,0.9+Math.random()*0.6,col,0.85,1);}
  if(K.kind==='tree')for(let q=0;q<30;q++)r3dPart(K.x+(Math.random()-0.5)*4,y+4+Math.random()*4,K.z+(Math.random()-0.5)*4,(Math.random()-0.5)*1.2,-0.4-Math.random()*0.6,(Math.random()-0.5)*1.2,0.12,0.05,2.5+Math.random()*1.5,[70,98,48],0.9);
  for(let q=0;q<10;q++)r3dPart(K.x,y+0.6,K.z,(Math.random()-0.5)*2,0.8+Math.random(),(Math.random()-0.5)*2,0.8,2.5,1.8,[140,130,118],0.35);}
