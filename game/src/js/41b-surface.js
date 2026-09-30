/* ================= ПОКРЫТИЕ, ЛУЖИ, ГРЯЗЬ, ВОДА, АВАРИИ, ПОЕЗД ================= */
// 0.18: машина чувствует дорогу. Сцепление (mu) и сопротивление качению (crr) — по покрытию под колёсами:
// асфальт, бетон, клинкер, булыжник в городах, щебень, грунт, доски; обочина, трава, пашня, лес, камни, песок, снег.
// Дождь делает гладкое скользким (мокрый булыжник — как лёд), а грунт — вязким. Лужи и грязь на дороге — пятна,
// которые видно на картинке и чувствует физика. В реке и в море машина глохнет — её вытаскивают. Удар о дерево,
// дом, камень или поезд — авария: машина встаёт, механик чинит, при сильном ударе — сход.
const SURF={
  asphalt:{mu:1.0,crr:1,wet:0.72,rough:0.8,n:'асфальт'},concrete:{mu:0.97,crr:1,wet:0.75,rough:0.9,n:'бетон'},
  brick:{mu:0.95,crr:1.1,wet:0.62,rough:1.0,n:'клинкер'},pave:{mu:0.9,crr:1.15,wet:0.58,rough:1.35,n:'булыжник'},
  board:{mu:0.97,crr:0.9,wet:0.58,rough:0.7,n:'доски'},macadam:{mu:0.9,crr:1.15,wet:0.8,rough:1.0,n:'щебень'},
  dirt:{mu:0.82,crr:1.5,wet:0.66,wc:1.45,rough:1.3,n:'грунт'},mount:{mu:0.84,crr:1.3,wet:0.7,wc:1.3,rough:1.4,n:'горная дорога'},
  mud:{mu:0.56,crr:2.6,wet:0.9,wc:1.2,rough:1.4,n:'грязь'},sand:{mu:0.7,crr:2.2,wet:1.05,rough:1.0,n:'песок'},
  beach:{mu:0.78,crr:1.6,wet:1.0,rough:0.8,n:'пляж'},snow:{mu:0.52,crr:1.8,wet:1,rough:1.1,n:'снег'},
  // вне дороги
  verge:{mu:0.74,crr:1.9,wet:0.8,rough:1.5,n:'обочина'},grass:{mu:0.6,crr:3.2,wet:0.72,rough:1.8,n:'трава'},
  field:{mu:0.5,crr:4.5,wet:0.75,wc:1.3,rough:2.2,n:'пашня'},forest:{mu:0.55,crr:3.8,wet:0.8,rough:2.4,n:'лес'},
  rock:{mu:0.75,crr:2,wet:0.8,rough:2.8,n:'камни'},dune:{mu:0.48,crr:5.5,wet:1,rough:1.2,n:'песок'},
  // пятна на дороге
  puddle:{mu:0.52,crr:2.6,rough:1,n:'лужа'},mudhole:{mu:0.36,crr:6.5,rough:1.7,n:'грязь!'},water:{mu:0.3,crr:14,rough:2,n:'вода!'}};
// Покрытие дороги в точке: в городах до 1920-х — булыжник вместо грунта и щебня
function roadSurfKey(trk,i){const t=trk.terrAt(i),town=trk.town&&trk.town[i];if(town&&trk.rc.y<1922&&(t==='dirt'||t==='macadam'||t==='mount'||t==='mud'))return 'pave';return SURF[t]?t:'dirt';}
function wetK(k){const S=SURF[k];return R&&R.wx&&R.wx.rain?(S.wet||1):1;}
// Сцепление дороги для ИИ (планирование скорости) — с погодой
function roadMuAt(trk,i){const k=roadSurfKey(trk,i);return SURF[k].mu*wetK(k);}
// Что под колёсами машины: покрытие, сцепление, сопротивление, тряска
function surfUnder(c,trk,lat){const W=trk.W,al=Math.abs(lat);let k;
  if(al<=W/2+0.2){k=roadSurfKey(trk,c.idx);const P=patchAt(trk,c,lat);if(P)k=P.kind;}
  else if(al<=W/2+1.5)k=trk.town&&trk.town[c.idx]?'pave':'verge';
  else k=offSurfKey(trk,c);
  const S=SURF[k],rain=R&&R.wx&&R.wx.rain;return {k,mu:S.mu*(rain?(S.wet||1):1),crr:S.crr*(rain?(S.wc||1):1),rough:S.rough};}
// Вне дороги: по участку трассы и по карте земли (поле, лес, песок, снег, камни)
function offSurfKey(trk,c){const cfg=trk.cfg;if(cfg.terr==='snow')return 'snow';if(cfg.terr==='sand')return 'dune';if(cfg.terr==='beach')return 'sand';
  const sg=segAt(trk,c.idx);
  if(typeof R3!=='undefined'&&R3.on&&R3.T===trk&&R3.mapB){const M=R3.mapB,S=R3.mapS,u=R3.mapU,x=Math.floor((c.x-u[0])*u[2]*S),z=Math.floor((c.z-u[1])*u[3]*S);
    if(x>=0&&z>=0&&x<S&&z<S){const o=(z*S+x)*4,dirt=M[o+1],forest=M[o+2],cover=M[o+3];
      if(cover>140)return cfg.terr==='snow'?'snow':'dune';if(forest>130)return 'forest';if(dirt>150)return 'field';}}
  if(sg===RSEG.forest)return 'forest';if(sg===RSEG.serp)return 'rock';if(sg===RSEG.coast)return 'sand';if(sg===RSEG.fields||sg===RSEG.vine)return 'grass';
  return 'grass';}
/* ---------- лужи и грязь на дороге: план на гонку (одни и те же для гонки и погоды) ---------- */
function planPatches(trk,rain){const n=trk.n,r=mulberry32(hashStr('patch|'+trk.rc.key+(rain?'w':'d'))),L=[],at=new Int16Array(n);trk.patches=L;trk.patchAt=at;
  if(trk.cfg.oval||trk.rc.track==='board'||trk.cfg.sprint)return;
  const soft=i=>{const k=roadSurfKey(trk,i);return k==='dirt'||k==='mount'||k==='mud'||k==='macadam';};
  const put=(i,len,lat,w,kind)=>{const i0=Math.max(0,i),i1=Math.min(n-1,i+Math.max(1,Math.round(len/trk.step)));for(let j=i0;j<=i1;j++)if(at[j])return;const o={i0,i1,lat,w,kind,ph:r()*6.28};L.push(o);for(let j=i0;j<=i1;j++)at[j]=L.length;};
  const s0=trk.closed?0:trk.startIdx+Math.round(60/trk.step),s1=trk.closed?n-2:trk.finishIdx-Math.round(40/trk.step);
  let i=s0+Math.round((20+r()*40)/trk.step);
  while(i<s1){const sg=segAt(trk,i),sft=soft(i),town=trk.town&&trk.town[i],bridge=trk.bridge&&trk.bridge[i];
    // в дождь лужи чаще; грязь — в лесу, в сёлах и на мягкой дороге; на мостах и в городах — только лужи
    let gap=rain?(sft?70:170):(sft?260:900);
    if(!bridge&&sft&&!town&&(sg===RSEG.forest||sg===RSEG.village||r()<0.25)&&r()<(rain?0.55:0.35)){const len=6+r()*10;put(i,len,(r()-0.5)*trk.W*0.25,trk.W*(0.55+r()*0.4),'mudhole');}
    else if(!bridge&&(rain||sft&&r()<0.3)){const len=2.5+r()*6,w=1.1+r()*(trk.W*0.35);put(i,len,(r()-0.5)*(trk.W-w)*0.9,w,'puddle');}
    i+=Math.round((gap*(0.6+r()*0.8))/trk.step);}}
function patchAt(trk,c,lat){if(!trk.patchAt)return null;const k=trk.patchAt[c.idx];if(!k)return null;const P=trk.patches[k-1];
  // край пятна неровный: ширина «дышит» по длине
  const u=(c.idx-P.i0)/Math.max(1,P.i1-P.i0),w=P.w*(0.75+0.25*Math.sin(u*Math.PI))*(0.92+0.08*Math.sin(P.ph+u*9));return Math.abs(lat-P.lat)<w/2?P:null;}
/* ---------- вода: реки под мостами и море у берега ---------- */
function waterAt(trk,x,z){if(typeof R3==='undefined'||!R3.on||R3.T!==trk)return null;
  for(const rv of trk.rivers||[]){const dd=riverDist(trk,rv,x,z);if(Math.abs(dd.s)<1300&&Math.abs(dd.e)<rv.w/2+1){const L=riverLine(trk,rv),m=dd.s,mc=Math.sin(m/170+rv.ph)*22*sstep(20,120,Math.abs(m))+Math.sin(m/61+rv.ph*2)*6*sstep(20,120,Math.abs(m));
      const cx=L.p[0]+L.d[0]*m+L.t[0]*mc,cz=L.p[2]+L.d[1]*m+L.t[1]*mc;return fH(cx,cz)+0.9;}}
  for(const cs of trk.coast||[])if(cs.sea!==undefined){const y=cs.sea+0.2;if(fH(x,z)<y)return y;}
  return null;}
/* ---------- аварии: удар о дерево, дом, камень, поезд; вода ---------- */
const HARD_KIND={tree:1,house:1,wall:1,rock:1,stand:1,train:1,church:1,bld:1};
function crashKindOf(o){const t=o&&(o.kind||'');if(!t)return 'wall';if(/^(plane|oak|elm|poplar|cypress|olive|pine|fir|birch|palm|tree)$/.test(t))return 'tree';if(/rock|stone|cliff|gstone|boulder/.test(t))return 'rock';if(/stand|pits/.test(t))return 'stand';if(/crowd/.test(t))return 'crowd';if(/fence|hedge|gate|rgate/.test(t))return 'fence';return 'house';}
// Итог удара (зовёт wallHit): imp — скорость в стену, м/с
function crashNote(c,imp,kind,x,z){if(!c.crash||imp>c.crash.imp)c.crash={imp,kind:kind||'wall',x:x===undefined?c.x:x,z:z===undefined?c.z:z};}
function crashResolve(c){const K=c.crash;c.crash=null;if(!K||c.dnf||c.fin!==null)return;const imp=K.imp,kind=K.kind,soft=kind==='fence'||kind==='crowd';
  const kids=DIF().simple,me=c===R.follow;
  if(imp<4.5||soft&&imp<9){if(me&&imp>3)R.shake=Math.max(R.shake,0.2);return;}
  // сильный удар: машина встаёт, механик чинит (без механика — дольше); очень сильный — сход
  const what=kind==='tree'?'удар о дерево':kind==='rock'?'удар о камень':kind==='house'?'удар о дом':kind==='stand'?'удар о трибуну':kind==='train'?'столкновение с поездом':'удар';
  c.vx*=0.08;c.vy*=0.2;c.r*=0.3;c.dmg=Math.min(100,c.dmg+imp*(soft?0.8:2.6));
  const pDnf=kind==='train'?0.92:kids?0:clamp((imp-14)/12,0,0.85)+(c.dmg>85?0.3:0);
  if(Math.random()<pDnf){c.dnf=kind==='train'?'поезд':'авария';c.thr=0;if(c.you)rMsgT(`${c.player?'':(c.drvName||c.label)+': '}СХОД — ${what}`,3);}
  else{const t=(kind==='train'?40:6+(imp-4.5)*1.6*(soft?0.5:1))*(c.st&&c.st.mech?0.7:1)*(kids?0.5:1);c.stopT=Math.max(c.stopT||0,t);c.stopWhy=what;
    if(imp>9&&Math.random()<0.45)c.limp=true;
    if(c.you)rMsgT(`${c.player?'':(c.drvName||c.label)+': '}${what.toUpperCase()}! ${c.st&&c.st.mech?'Механик чинит':'Ремонт'} — ~${Math.round(t)} с`,2.6);}
  if(me){R.shake=Math.min(1.2,0.5+imp*0.05);try{auSfx('crash',Math.min(1,imp/12));if(kind==='tree')auSfx('wood',1);}catch(_){}try{navigator.vibrate&&navigator.vibrate(Math.min(400,imp*25));}catch(_){}}
  if(typeof R3!=='undefined'&&R3.on)try{crashFx(c,K);}catch(_){}}
// Машина в воде: глохнет; зрители и механик вытаскивают её на дорогу — время уходит, мотор ещё кашляет
function waterCheck(c,trk,dt){if(c.dnf||c.fin!==null||c.inWater>=2)return;const lvl=waterAt(trk,c.x,c.z);if(lvl===null){c.inWater=0;return;}
  const g=fH(c.x,c.z),depth=lvl-g;if(depth<0.25){c.inWater=0;return;}
  const me=c===R.follow;
  if(!c.inWater){c.inWater=1;c.wetT=0;if(me){try{auSfx('splash',1);}catch(_){}R.shake=Math.max(R.shake,0.5);}if(typeof R3!=='undefined'&&R3.on)try{splashFx(c,lvl,1);}catch(_){}}
  c.wetT=(c.wetT||0)+dt;c.vx*=Math.pow(depth>0.6?0.05:0.3,dt);c.vy*=Math.pow(0.1,dt);
  if(depth>0.55&&c.wetT>0.8){c.inWater=2;c.vx=0;c.vy=0;c.r=0;
    const kids=DIF().simple,t=(kids?12:28)*(c.st&&c.st.mech?0.8:1);c.dmg=Math.min(100,c.dmg+12);
    if(c.you)rMsgT(`${c.player?'':(c.drvName||c.label)+': '}В ВОДЕ! Мотор залило — машину вытаскивают (~${Math.round(t)} с)`,3.2);
    c.rescueT=t;c.rescueIdx=c.offIdx>=0?c.offIdx:c.idx;}}
function rescueTick(c,dt){if(c.inWater!==2)return false;c.thr=0;c.brk=1;c.vx=0;c.vy=0;c.rescueT-=dt;
  if(c.rescueT<=0){c.inWater=0;const lap=c.lap;respawnAt(c,c.rescueIdx,lap);c.flood=18;if(c.you)rMsgT((c.player?'':(c.drvName||c.label)+': ')+'МАШИНА НА ДОРОГЕ — мотор ещё кашляет',2);}
  return true;}
/* ---------- поезд и шлагбаум ---------- */
function trainSpan(trk,rl){const st=rl.st;if(!st||st.state!==1)return null;const len=st.len||48;return {a:Math.min(st.s,st.s-st.dir*len),b:Math.max(st.s,st.s-st.dir*len)};}
function trainCheck(c,trk){if(!trk.rails||!trk.rails.length||c.dnf||c.fin!==null)return;
  for(const rl of trk.rails){const L=railLine(trk,rl),dx=c.x-L.p[0],dz=c.z-L.p[2],s=dx*L.d[0]+dz*L.d[1],e=Math.abs(dx*L.d[1]-dz*L.d[0]);
    if(e>18)continue;const sp=trainSpan(trk,rl);
    // сам поезд: вагоны шириной ~3 м — пройти сквозь нельзя
    if(sp&&e<2.6&&s>sp.a-1.5&&s<sp.b+1.5){const V=Math.hypot(c.vx,c.vy);if(!c.trainHit){c.trainHit=1;crashNote(c,Math.max(V,9),'train');}const nx=-L.d[1],nz=L.d[0],sg=(dx*nx+dz*nz)>=0?1:-1;c.x+=nx*sg*(2.6-e+0.2);c.z+=nz*sg*(2.6-e+0.2);c.vx*=0.2;c.vy*=0.2;continue;}
    c.trainHit=0;
    // шлагбаум опущен: стрела поперёк дороги в пяти метрах от рельсов — сносится с ударом
    if((rl.gate||0)>0.6){const gs=Math.sign(s)||1;for(const sd of [1,-1]){const gi=sd>0?1:0;if(rl.broken&&rl.broken[gi])continue;const d=s-sd*5.2;
      if(Math.abs(d)<0.9&&e<trk.W/2+1&&Math.sign(-d*0)===0){const V=Math.abs(c.vx);if(V>2&&Math.sign(sd)===Math.sign(s)){rl.broken=rl.broken||[0,0];rl.broken[gi]=1;c.dmg=Math.min(100,c.dmg+5);c.vx*=0.55;if(c===R.follow){R.shake=Math.max(R.shake,0.4);try{auSfx('wood',0.8);}catch(_){}}if(c.you)rMsgT((c.player?'':(c.drvName||c.label)+': ')+'ШЛАГБАУМ СНЕСЁН!',1.6);}}}}}}
// ИИ: у опущенного шлагбаума — стоять и ждать поезд
function aiGateStop(c,trk){if(!trk.rails||!trk.rails.length)return Infinity;let best=Infinity;
  for(const rl of trk.rails){const closing=(rl.gate||0)>0.15||(rl.st&&rl.st.state===1&&Math.abs(rl.st.s)<260);if(!closing)continue;
    const di=(rl.i-c.idx)*(trk.step);if(di>4&&di<90)best=Math.min(best,di-8);}
  return best;}
/* ---------- эффекты: брызги, грязь, щепки ---------- */
function splashFx(c,lvl,k){for(let q=0;q<26*k;q++){const a=Math.random()*6.28,v=2+Math.random()*4;r3dPart(c.x,lvl+0.1,c.z,Math.cos(a)*v,2.5+Math.random()*4,Math.sin(a)*v,0.35,1.6,1.1+Math.random()*0.6,[225,232,238],0.55);}}
function crashFx(c,K){const col=K.kind==='tree'?[120,90,60]:K.kind==='rock'?[150,145,138]:K.kind==='train'?[60,60,60]:[170,160,150];
  for(let q=0;q<22;q++){const a=Math.random()*6.28,v=1.5+Math.random()*4;r3dPart(K.x,(c.v3&&c.v3.y!==null?c.v3.y:c.y)+0.8,K.z,Math.cos(a)*v,1.5+Math.random()*3,Math.sin(a)*v,0.18,0.4,0.9+Math.random()*0.6,col,0.8);}
  if(K.kind==='tree')for(let q=0;q<30;q++)r3dPart(K.x+(Math.random()-0.5)*4,(c.y||0)+4+Math.random()*4,K.z+(Math.random()-0.5)*4,(Math.random()-0.5)*1.2,-0.4-Math.random()*0.6,(Math.random()-0.5)*1.2,0.12,0.05,2.5+Math.random()*1.5,[70,98,48],0.9);
  for(let q=0;q<10;q++)r3dPart(K.x,(c.y||0)+0.6,K.z,(Math.random()-0.5)*2,0.8+Math.random(),(Math.random()-0.5)*2,0.8,2.5,1.8,[140,130,118],0.35);}
