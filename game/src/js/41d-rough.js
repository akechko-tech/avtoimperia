/* ================= 0.22: РАЗБИТАЯ ДОРОГА — волны, колея, «гребёнка», булыжник, стыки, ямы =================
   Дорога начала века — не стол. Грунт и щебень разбиты колёсами телег: две колеи и горб между ними, длинные
   волны, после дождей — ямы (в дождь в них стоит вода). Булыжник дрожит под колёсами, бетон стучит на стыках плит,
   доски трека — на щелях. Один и тот же рельеф видят картинка (сетка дороги и шейдер), машина (кузов качается
   на рессорах, колесо бьётся в яме, колея тянет руль) и звук (удары подвески, дробь, хруст).
   Координаты: s — путь вдоль трассы (м), lat — смещение поперёк (м, как у машины: по нормали трассы). */
const ROUGH={// und — волны (м), rut — глубина колеи (м), pot — ям на км, potD — глубина ям (м), wash — «гребёнка» (м), cob — булыжник (м), jt — шаг стыков (м)
  dirt:{und:0.055,rut:0.075,pot:9,potD:0.13,wash:0.012},mud:{und:0.06,rut:0.11,pot:11,potD:0.16,wash:0.006},
  mount:{und:0.05,rut:0.05,pot:8,potD:0.12,wash:0.014},macadam:{und:0.035,rut:0.035,pot:6,potD:0.1,wash:0.01},
  pave:{und:0.025,rut:0.012,pot:2.5,potD:0.07,cob:0.014},brick:{und:0.012,rut:0,pot:0.4,potD:0.04,cob:0.006},
  asphalt:{und:0.01,rut:0.005,pot:0.8,potD:0.05},concrete:{und:0.014,rut:0,pot:0.6,potD:0.05,jt:6},
  board:{und:0.016,rut:0,pot:0,potD:0,jt:0.8},sand:{und:0.03,rut:0.06,pot:0,potD:0},beach:{und:0.012,rut:0.025,pot:0,potD:0},
  snow:{und:0.03,rut:0.09,pot:0,potD:0}};
const RUT_HALF=0.72;   // половина колеи телеги (м): колёса телеги идут в 1,45 м друг от друга
// Гладкий шум на плоскости (0…1) — для волн дороги
function rgNz(x,y,s){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,h=(a,b)=>{let t=(Math.imul(a,374761393)+Math.imul(b,668265263)+Math.imul(s,1442695041))|0;t=Math.imul(t^(t>>>13),1274126177);return ((t^(t>>>16))>>>0)/4294967296;};
  const u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);return (h(xi,yi)*(1-u)+h(xi+1,yi)*u)*(1-v)+(h(xi,yi+1)*(1-u)+h(xi+1,yi+1)*u)*v;}
// План неровностей на гонку: сила волн, колеи, «гребёнки» по участкам (плавно на стыках), блуждание колеи, ямы
function planRough(trk){const n=trk.n,st=trk.step,W=trk.W,r=mulberry32(hashStr('rough|'+trk.rc.key)),y=trk.rc.y,cfg=trk.cfg;
  const era=y<1900?1.15:y<1915?1:y<1923?0.95:0.85,oval=!!(cfg.oval||trk.rc.track==='board'),beachy=cfg.terr==='beach'||cfg.sprint;
  const und=new Float32Array(n),rut=new Float32Array(n),wash=new Float32Array(n),cob=new Float32Array(n),jt=new Float32Array(n),rc=new Float32Array(n);
  for(let i=0;i<n;i++){const k=roadSurfKey(trk,i),P=ROUGH[k]||ROUGH.dirt,town=trk.town&&trk.town[i],br=trk.bridge&&trk.bridge[i],tun=trk.tunAt&&trk.tunAt[i];
    und[i]=P.und*era*(oval?0.6:1)*(br?0.4:1);rut[i]=oval?0:(P.rut||0)*era*(town?0.45:1)*(br?0.3:1)*(tun?0.6:1);wash[i]=(P.wash||0)*era*(br?0.3:1);cob[i]=P.cob||0;jt[i]=P.jt||0;}
  const sm=a=>{const b=new Float32Array(n),R_=5;for(let i=0;i<n;i++){let s=0,c=0;for(let d=-R_;d<=R_;d++){let j=i+d;if(trk.closed)j=(j%n+n)%n;else if(j<0||j>=n)continue;s+=a[j];c++;}b[i]=c?s/c:0;}return b;};
  const U=sm(und),Ru=sm(rut),Wa=sm(wash),Cb=sm(cob);
  // ровно у переездов (настил), у линий старта и финиша и на шве замкнутого круга
  const quiet=(i0,rad)=>{for(let d=-rad;d<=rad;d++){let j=i0+d;if(trk.closed)j=(j%n+n)%n;else if(j<0||j>=n)continue;const f=Math.pow(Math.abs(d)/rad,2);U[j]*=f;Ru[j]*=f;Wa[j]*=f;Cb[j]*=f;}};
  (trk.rails||[]).forEach(rl=>quiet(rl.i,5));if(!trk.closed&&trk.startIdx!==undefined)quiet(trk.startIdx,5);if(trk.finishIdx!==undefined)quiet(trk.finishIdx,4);if(trk.closed)quiet(0,4);
  // колея блуждает около середины дороги: телеги расходились, объезжали ямы
  const ph=r()*100,lim=Math.max(0,W/2-1.9);for(let i=0;i<n;i++){const s=i*st;rc[i]=clamp((rgNz(s/90+ph,0.5,7)-0.5)*1.5+(rgNz(s/23+ph,1.5,9)-0.5)*0.45,-lim,lim);}
  // ямы: по одной и гнёздами; чаще на грунте и в колее, в городе реже, на мостах, в тоннелях и у переездов — нет
  const pots=[],at=new Map();
  if(!oval&&!beachy){const s0=trk.closed?6:(trk.startIdx||0)+Math.round(80/st),s1=trk.closed?n-6:(trk.finishIdx||n-1)-Math.round(40/st);let i=s0;
    while(i<s1){const k=roadSurfKey(trk,i),P=ROUGH[k]||ROUGH.dirt,rate=(P.pot||0)*era*(trk.town&&trk.town[i]?0.6:1);
      if(rate<0.05){i+=Math.round(60/st);continue;}
      i+=Math.max(1,Math.round(-Math.log(1-r()*0.999)*1000/rate/st));if(i>=s1)break;
      if((trk.bridge&&trk.bridge[i])||(trk.tunAt&&trk.tunAt[i])||segAt(trk,i)===RSEG.rail)continue;
      const cl=r()<0.45?2+Math.floor(r()*3):1;
      for(let q=0;q<cl;q++){const ii=clamp(q?i+Math.round((r()-0.5)*12/st):i,0,n-1);
        const inRut=r()<0.55,lat=inRut?rc[ii]+(r()<0.5?-RUT_HALF:RUT_HALF)+(r()-0.5)*0.35:(r()-0.5)*(W-1.4),R0=0.28+r()*0.5,d=P.potD*(0.55+r()*0.7)*era*(q?0.8:1);
        const o={id:pots.length+1,i:ii,s:ii*st+r()*st,lat:clamp(lat,-W/2+0.45,W/2-0.45),a:R0*(1+r()*0.7),b:R0,d,ph:r()*6.28};
        const p=trk.pts[ii],nn=trk.N[ii],t=trk.T[ii],fs=o.s-ii*st;o.x=p[0]+nn[0]*o.lat+t[0]*fs;o.z=p[2]+nn[1]*o.lat+t[1]*fs;o.tx=t[0];o.tz=t[1];
        pots.push(o);for(let j=ii-1;j<=ii+1;j++){const jj=trk.closed?(j%n+n)%n:j;if(jj<0||jj>=n)continue;let L=at.get(jj);if(!L)at.set(jj,L=[]);L.push(o);}}}}
  trk.rg={und:U,rut:Ru,wash:Wa,cob:Cb,jt,rc,pots,at,seed:hashStr(trk.rc.key)&0xffff};}
function rgIdx(trk,s){const n=trk.n;let i=Math.floor(s/trk.step);if(trk.closed)i=((i%n)+n)%n;else i=clamp(i,0,n-1);return i;}
// Сетка дороги: длинные волны, колея и горб между колеями (то, что видно на картинке и в свете)
function roughGeoY(trk,i,s,lat){const G=trk.rg;if(!G)return 0;const a=G.und[i],ru=G.rut[i];let y=0;
  if(a>0)y+=a*(rgNz(s*0.11,lat*0.3,G.seed)-0.5)*1.6;
  if(ru>0){const c=G.rc[i],d1=lat-c+RUT_HALF,d2=lat-c-RUT_HALF,dc=lat-c;y+=ru*(0.3*Math.exp(-dc*dc*2.2)-Math.exp(-d1*d1*14)-Math.exp(-d2*d2*14));}
  return y*clamp((trk.W/2-Math.abs(lat))/0.45,0,1);}  // у самого края — ровно: обочина сходится с полотном без щели
// Глубина ямы под точкой (м, вниз — плюс); бортик вокруг чуть выше
function potDepth(o,s,lat,trk){let ds=s-o.s;if(trk.closed){const L=trk.n*trk.step;if(ds>L/2)ds-=L;else if(ds<-L/2)ds+=L;}
  const dl=lat-o.lat;if(Math.abs(ds)>o.a*1.4||Math.abs(dl)>o.b*1.4)return 0;const an=Math.atan2(dl,ds),q=Math.hypot(ds/o.a,dl/o.b)*(1+0.12*Math.sin(3*an+o.ph)+0.06*Math.sin(5*an+o.ph*2));
  if(q<1)return o.d*Math.pow(1-q*q,0.6);if(q<1.3)return -o.d*0.12*(1-(q-1)/0.3);return 0;}
// Всё, что чувствуют колёса: волны, колея, короткие волны и ямы (мелкая дробь — в тряске и звуке)
function roughY(trk,s,lat){const G=trk.rg;if(!G)return 0;const i=rgIdx(trk,s);let y=roughGeoY(trk,i,s,lat);const a=G.und[i];
  if(a>0)y+=a*(rgNz(s*0.43+17,lat*0.8,G.seed+5)-0.5)*0.7;
  const L=G.at.get(i);if(L)for(const o of L)y-=potDepth(o,s,lat,trk);
  return y;}
// Путь машины вдоль трассы (м)
function rgS(trk,c){return (c.idx+(c.segT||0))*trk.step;}
/* ---------- физика: колея держит руль, ямы бьют колёса, «гребёнка» отнимает сцепление ---------- */
function roughStep(c,trk,lat,sp,dt){const G=trk.rg,o=ROUGH_OUT;o.ay=0;o.dr=0;o.mu=1;if(c.jolt)c.jolt*=Math.exp(-dt*3);if(!G||sp<1||c.inWater===2)return o;const i=c.idx,W=trk.W;
  if(Math.abs(lat)>W/2+0.3){if(c.potHit)c.potHit.clear();return o;}
  // колея: в ней машина идёт как по рельсам, руль «залипает»; на горбе между колеями и через край — бросает
  const ru=G.rut[i];if(ru>0.012){const d=lat-G.rc[i],ad=Math.abs(d),k=ru/0.075;
    if(ad<0.42)o.ay-=d*7*k*Math.min(1,sp/8);
    else if(ad<1.6){const e=(bumpNz(c.prog*1.3,c.num*13+5)-0.5)*2;o.ay+=e*2.2*k*Math.min(1,sp/14);o.dr+=e*0.25*k*Math.min(1,sp/14);}}
  // «гребёнка» и булыжник: колёса подпрыгивают — сцепления чуть меньше
  const wa=G.wash[i]+G.cob[i]*0.6;if(wa>0)o.mu=1-clamp(wa/0.012,0,1.4)*0.07*Math.min(1,sp/22);
  // ямы: левое и правое колесо (передние — на 1,2 м впереди центра машины)
  const L=G.at.get(i);
  if(L){const s=rgS(trk,c)+1.2;
    for(const p of L){if(c.potHit&&c.potHit.has(p.id))continue;let hit=0,side=0;
      for(const sd of [-1,1]){const dd=potDepth(p,s,lat+sd*0.68,trk);if(dd>p.d*0.3){hit=Math.max(hit,dd);side+=sd;}}
      if(!hit)continue;(c.potHit||(c.potHit=new Map())).set(p.id,p);potImpact(c,trk,p,hit,side,sp);}}
  if(c.potHit&&c.potHit.size){const s=rgS(trk,c);for(const [id,p] of c.potHit){let ds=Math.abs(s-p.s);if(trk.closed)ds=Math.min(ds,trk.n*trk.step-ds);if(ds>6)c.potHit.delete(id);}}
  return o;}
const ROUGH_OUT={ay:0,dr:0,mu:1};
// Удар колеса в яму: теряем скорость, руль дёргает, подвеска страдает; на большой скорости в глубокой яме — прокол.
// Соперники ям чаще объезжают (видят дорогу и знают её), игрок — тоже может: ямы видно на дороге.
function potImpact(c,trk,p,dep,side,sp){const ai=!(c.player&&R.mode==='drive');if(ai&&Math.random()<0.55)return;
  const k=dep/0.1,e=k*Math.min(1.6,sp/18),kids=DIF().simple,me=c===R.follow,sg=side||(Math.random()<0.5?-1:1);
  c.vx*=1-Math.min(0.12,0.04*e);c.vy+=sg*(0.25+Math.random()*0.45)*e*(ai?0.5:1)*(kids?0.5:1);c.r+=(side||0)*0.05*e*(ai?0.5:1)*(kids?0.5:1);
  c.dmg=Math.min(100,c.dmg+0.22*e*e*(ai?0.5:1)*(kids?0.3:1));
  if(sp>16&&k>0.8&&!kids&&Math.random()<0.0022*(sp-14)*k*(ai?0.5:1)){const wk=(sg>0?0:1)+(Math.random()<0.65?0:2);
    if(!c.tp[wk]){twPunct(c,wk,trk,'hole');if(c.you)rMsgT((c.player?'':(c.drvName||c.label)+': ')+'КОЛЕСО ПРОБИТО В ЯМЕ: '+TW_NM[wk].toUpperCase()+'!',1.8);}}
  c.jolt=Math.min(1.6,(c.jolt||0)+0.3+0.35*e);c.joltSide=sg;c.potN=(c.potN||0)+1;
  if(me){R.shake=Math.max(R.shake||0,Math.min(0.9,0.1+0.22*e));try{if(c.player&&navigator.vibrate&&e>0.5)navigator.vibrate(Math.min(90,18*e));}catch(_){}}}
/* ---------- звук и тряска: что сейчас под колёсами ---------- */
// Пестрота покрытия вдоль пути (0…1): свежий щебень, укатанный грунт, заплаты — шорох шин меняется на ходу
function roughTex(trk,s){const G=trk.rg,sd=G?G.seed:1;return clamp(rgNz(s/23,0.5,sd+11)*0.7+rgNz(s/6.7,1.5,sd+13)*0.3,0,1);}
function roughFine(trk,i){const G=trk.rg;if(!G)return {wash:0,cob:0,jt:0};return {wash:G.wash[i],cob:G.cob[i],jt:G.jt[i]};}
