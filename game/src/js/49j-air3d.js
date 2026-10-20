/* ================= 0.37: МИР ПОЛЁТА — ЗЕМЛЯ ДО ГОРИЗОНТА, АЭРОДРОМ, ГОРОДА, ЛЕСА, МОРЕ, ОБЛАКА =================
   Земля — квадродерево кусков 33×33 точки (вблизи шаг 16 м, у горизонта — километр) с «юбками» по краям (без щелей).
   Две карты земли: подробная (22×22 км вокруг места полёта: поля, леса, дороги, деревни) и грубая — до горизонта.
   Сцена — по месту состязания: Реймс и Шампань, Ла-Манш с белыми скалами Дувра, Альпы, Монако, Венеция, Неаполь с Везувием,
   Петербург, Киев, фронт 1914–1918 (окопы, воронки, аэростаты). Рисуется в два прохода по глубине: дальний и ближний. */
let FW=null;
const fwL=(a,b,t)=>a+(b-a)*t;
const FW_ROOT=131072,FW_N=32,FW_LMAX=8;
// стиль страны: дома, церковь, деревья, цвет лугов, сухость, рисунок полей
const FW_ST={fr:{h:['house_fr','farm_fr'],ch:'church',tr:['dec','pop'],road:'pop',tint:[128,132,114],dry:0.3},
  uk:{h:['cottage','pub'],ch:'church_uk',tr:['dec','dec'],hedge:1,tint:[114,136,108],dry:0.08},
  de:{h:['fachwerk','farm_fr'],ch:'church_at',tr:['dec','con'],tint:[122,131,112],dry:0.15},
  us:{h:['farm_us','barn'],ch:'church_us',tr:['dec','dec'],grid:1,tint:[134,132,110],dry:0.3},
  it:{h:['house_it','villa'],ch:'campanile',tr:['cyp','dec','con','oli'],tint:[134,132,106],dry:0.42},
  ru:{h:['izba','izba'],ch:'church_ru',tr:['bir','con'],strip:1,tint:[124,131,110],dry:0.18}};
/* сцены. bio: plain — равнина (холмы, река), coast — берег (море с одной стороны), strait — пролив между двумя берегами,
   lake — озеро в долине, mount — горы с перевалом, lagoon — лагуна, front — фронт. Перелёт идёт из A (−9,5 км) в B (+9,5 км) по оси x */
const FW_SC={
  issy:{bio:'plain',st:'fr',hill:22,river:{z:1800,A:700,L:2600,w:130},towns:[{x:3600,z:4600,n:420,city:1},{x:-2600,z:2300,n:30},{x:-3200,z:-2600,n:22},{x:1500,z:-3600,n:26}],lm:[{k:'eiffel',x:2900,z:5200}],forest:0.12},
  hammond:{bio:'lake',st:'us',hill:170,lake:{x:900,w:420},towns:[{x:-500,z:-1700,n:60},{x:1800,z:2600,n:18}],forest:0.35},
  fortmyer:{bio:'plain',st:'us',hill:35,river:{z:-2600,A:500,L:3200,w:320},towns:[{x:2600,z:-3400,n:380,city:1},{x:-2400,z:1800,n:28}],lm:[{k:'obelisk',x:2200,z:-3000}],forest:0.2},
  reims:{bio:'plain',st:'fr',hill:26,towns:[{x:-5400,z:4400,n:340,city:1,ch:2.4},{x:3000,z:-2500,n:26},{x:-1900,z:-4300,n:20},{x:5300,z:2700,n:30},{x:-6800,z:-1500,n:24}],vine:1,forest:0.1},
  meet:{bio:'plain',st:'us',hill:12,towns:[{x:-3800,z:3600,n:260,city:1},{x:3300,z:-2600,n:30}],forest:0.12},
  england:{bio:'plain',st:'uk',hill:40,river:{z:2800,A:500,L:2400,w:90},towns:[{x:-4200,z:3900,n:300,city:1},{x:2800,z:-2400,n:30},{x:4400,z:3100,n:26},{x:-2500,z:-3500,n:22}],lm:[{k:'bigben',x:-4000,z:4300}],forest:0.18},
  spb:{bio:'coast',st:'ru',hill:6,sea:{a:Math.PI*0.75,off:3600,warp:900},towns:[{x:-2600,z:2800,n:420,city:1},{x:2400,z:-2600,n:24}],lm:[{k:'church_ru',x:-2400,z:3300,s:1.8},{k:'gate_spb',x:-1500,z:1800}],forest:0.25},
  alps:{bio:'mount',st:'it',mtn:2300,base:680,towns:[{x:-10200,z:900,n:60},{x:10200,z:-700,n:70}],lm:[{k:'church_at',x:-10000,z:1300}],forest:0.3},
  pyrenees:{bio:'mount',st:'fr',mtn:1700,base:420,towns:[{x:-10300,z:1200,n:60},{x:10300,z:-900,n:90}],forest:0.32},
  russia:{bio:'plain',st:'ru',hill:18,river:{z:-3200,A:900,L:3000,w:140},towns:[{x:2600,z:3000,n:40},{x:-3500,z:-2500,n:30},{x:5200,z:-1200,n:26},{x:-6000,z:3400,n:28}],lm:[{k:'church_ru',x:2700,z:3400}],forest:0.32},
  monaco:{bio:'coast',st:'it',hill:420,sea:{a:-Math.PI/2,off:-500,warp:500},towns:[{x:-1500,z:600,n:220,city:1},{x:2600,z:900,n:60}],lm:[{k:'casino',x:-1300,z:450}],forest:0.2,harbor:1},
  kiev:{bio:'plain',st:'ru',hill:30,river:{z:2900,A:800,L:3600,w:560},towns:[{x:-1800,z:4200,n:360,city:1},{x:3200,z:-2600,n:26}],lm:[{k:'church_ru',x:-1300,z:3800,s:2}],forest:0.28},
  channel:{bio:'strait',st:'fr',stB:'uk',strait:6600,cliffB:70,towns:[{x:-10600,z:2400,n:160},{x:10500,z:-1500,n:140}],lm:[{k:'castle',x:9900,z:-900,s:1.6}],forest:0.1},
  med:{bio:'strait',st:'fr',stB:'it',strait:7600,towns:[{x:-10500,z:1800,n:110},{x:10500,z:-1200,n:120}],forest:0.12},
  atlantic:{bio:'strait',st:'uk',stB:'uk',strait:8200,cliffB:40,towns:[{x:-10500,z:2000,n:40},{x:10500,z:-1600,n:30}],forest:0.2},
  venice:{bio:'lagoon',st:'it',hill:3,sea:{a:-Math.PI/2,off:-600,warp:300},towns:[{x:-900,z:-2600,n:380,city:1,isl:1}],lm:[{k:'campanile',x:-900,z:-2500,s:1.6}],forest:0.05,harbor:1},
  naples:{bio:'coast',st:'it',hill:120,sea:{a:-Math.PI/2,off:-400,warp:700},volc:{x:5200,z:4600,h:1250,r:2600},towns:[{x:-2200,z:900,n:420,city:1},{x:3200,z:900,n:60}],forest:0.15,harbor:1},
  cowes:{bio:'coast',st:'uk',hill:45,sea:{a:-Math.PI/2,off:-500,warp:600},isl:{z:-6200,w:4200},towns:[{x:-1200,z:900,n:120},{x:2500,z:-6500,n:80}],forest:0.2,harbor:1},
  front:{bio:'front',st:'fr',hill:24,river:{z:4200,A:600,L:2600,w:60},towns:[{x:-3600,z:-2400,n:30,ruin:0},{x:3200,z:-3100,n:24,ruin:0},{x:-2200,z:5600,n:26,ruin:1},{x:3600,z:6400,n:30,ruin:1}],forest:0.14,front:{z:3500}},
  kiel:{bio:'coast',st:'de',hill:30,sea:{a:Math.PI/2,off:600,warp:700},towns:[{x:-2800,z:-1800,n:300,city:1},{x:2600,z:-2400,n:30}],forest:0.22,harbor:1},
  bay_us:{bio:'coast',st:'us',hill:20,sea:{a:Math.PI/2,off:500,warp:800},towns:[{x:-3000,z:-2000,n:320,city:1},{x:2400,z:-2600,n:26}],forest:0.2,harbor:1},
  heim_de:{bio:'plain',st:'de',hill:22,river:{z:2600,A:600,L:3000,w:110},towns:[{x:-4000,z:3600,n:320,city:1},{x:2800,z:-2400,n:28},{x:4200,z:2800,n:24}],forest:0.26},
  heim_it:{bio:'plain',st:'it',hill:60,river:{z:-2400,A:500,L:2400,w:120},towns:[{x:-3600,z:3800,n:300,city:1},{x:3000,z:-2000,n:30}],forest:0.16}};
const FW_HOME={fr:'reims',uk:'england',de:'heim_de',us:'meet',it:'heim_it',ru:'russia'};
/* ---------- рельеф ---------- */
function fwSeaS(S,x,z){// > 0 — море, < 0 — суша (метры от берега, с изгибами)
  if(S.bio==='strait'){const w=fbm2(x/2200,z/2200,S.seed+21,3)-0.5;return S.strait-Math.abs(x)+w*900;}
  if(S.sea){const c=Math.cos(S.sea.a),s=Math.sin(S.sea.a),w=(fbm2(x/2400,z/2400,S.seed+21,3)-0.5)*2*S.sea.warp;let d=x*c+z*s-S.sea.off+w;
    if(S.isl){const di=Math.abs(z-S.isl.z)-S.isl.w*0.5+(fbm2(x/1800,z/1800,S.seed+29,3)-0.5)*900;d=Math.min(d,di);}return d;}
  return -1e5;}
function fwHraw(S,x,z){let h=S.h0+(fbm2(x/2800,z/2800,S.seed,4)-0.5)*2*S.hill+(fbm2(x/650,z/650,S.seed+5,2)-0.5)*S.hill*0.35;
  if(S.bio==='mount'){const r=1-Math.abs(fbm2(x/4200,z/4200,S.seed+11,5)*2-1),pass=Math.exp(-Math.pow(z/2600,2))*0.45+0.55;
    const ends=sstep(9000,6500,Math.abs(x));h=S.base+S.mtn*Math.pow(r,1.9)*pass*(1-ends*0.85)+(fbm2(x/900,z/900,S.seed+13,3)-0.5)*180;}
  if(S.bio==='lake'){const d=Math.abs(x-S.lake.x+(fbm2(z/3000,1.3,S.seed+3,2)-0.5)*900);h=S.h0+S.hill*sstep(S.lake.w*0.6,S.lake.w*4,d)+(fbm2(x/700,z/700,S.seed+5,2)-0.5)*25;if(d<S.lake.w)h=-3-(S.lake.w-d)*0.02;}
  if(S.volc){const V=S.volc,d=Math.hypot(x-V.x,z-V.z);h+=V.h*Math.exp(-Math.pow(d/V.r,1.6))-V.h*0.12*Math.exp(-Math.pow(d/(V.r*0.1),2));}
  if(S.river){const R=S.river,zr=R.z+R.A*Math.sin(x/R.L+S.seed%7)+R.A*0.4*Math.sin(x/(R.L*0.37)+1.3),d=Math.abs(z-zr);
    if(d<R.w*0.5+260)h=Math.min(h,fwL(-2.5,h,sstep(R.w*0.5,R.w*0.5+220,d)));}
  if(S.bio==='coast'||S.bio==='strait'||S.bio==='lagoon'){const s=fwSeaS(S,x,z);
    if(s>0)h=-2-Math.min(40,s*0.025);
    else{const cl=S.bio==='strait'&&S.cliffB&&x>0?S.cliffB:0,t=sstep(0,-500,s);h=cl?fwL(1.2,h+cl,sstep(-8,-90,s)):fwL(1.4,Math.max(h,2),t);
      if(S.bio==='lagoon'){const q=fbm2(x/700,z/700,S.seed+31,3);h=Math.min(h,s>-4000?(q<0.47?-1.2:0.8+q*2):h);}}}
  if(S.bio==='front'){const fz=S.front.z,d=Math.abs(z-fz);if(d<1300){const k=1-sstep(700,1300,d);h+=(fbm2(x/40,z/40,S.seed+51,2)-0.5)*3.5*k;}}
  return h;}
// высота с выровненными аэродромами (поле — ровное)
function fwHgt(S,x,z){let h=fwHraw(S,x,z);for(const a of S.fields){if(a.sea)continue;const d=Math.hypot(x-a.x,z-a.z);if(d<a.r+300){const t=sstep(a.r,a.r+300,d);h=fwL(a.y,h,t);}}return h;}
/* ---------- построение сцены ---------- */
function fwBuild(key,o){o=o||{};const B=FW_SC[key]||FW_SC.reims,y=o.y||1912;
  const S=Object.assign({key,seed:hashStr('fw|'+key+'|'+(o.seed||0))%100000,h0:B.bio==='mount'?B.base:B.bio==='front'?60:40,hill:20},B);S.hill=B.hill===undefined?20:B.hill;
  S.y=y;S.st=FW_ST[B.st]||FW_ST.fr;S.stB=B.stB?FW_ST[B.stB]:S.st;S.month=o.m===undefined?6:o.m;S.fields=[];
  const A=o.A||[0,0],Bp=o.B||null,seaStart=!!o.sea;
  // аэродромы: старт и (у перелёта) место посадки; гидроаэропланы — у берега (гавань)
  const af=(x,z,sea)=>{const r=sea?0:Math.max(380,o.afR||450);const f={x,z,r,sea,y:0};f.y=sea?0:Math.max(2,fwHraw(S,x,z));S.fields.push(f);return f;};
  S.A=af(A[0],A[1],seaStart);if(Bp)S.B=af(Bp[0],Bp[1],seaStart&&!o.landB);
  // 0.38: просеки задания — база рекорда, трасса по пилонам, круг посадки без леса (отзыв: «база в деревьях, как туда сесть?»)
  S.clear=(o.objs||[]).filter(x=>x.k==='clear');(o.objs||[]).forEach(x=>{if(x.k==='pylon'||x.k==='gate'||x.k==='ring')S.clear.push({a:[x.x,x.z],b:[x.x,x.z],w:x.k==='gate'?(x.w||100)*0.7+40:90});});
  FW={S,key,H:(x,z)=>fwHgt(S,x,z),surf:(x,z)=>fwSurf(x,z),obst:(x,y2,z,r)=>fwObst(x,y2,z,r),nodes:new Map(),tiles:new Map(),queue:new Map(),tq:[],frame:0,objs:[],col:[],hot:[],extra:o.objs||[],
    sea:S.bio==='coast'||S.bio==='strait'||S.bio==='lagoon'||!!S.river||S.bio==='lake',ready:false,mood:o.mood||'clear',y};
  fwSites(S,o);fwMaps(S);
  return FW;}
// где что стоит: деревни и города (кварталы, улицы), дороги между ними, лесополосы, приметы, объекты задания
function fwSites(S,o){const rnd=mulberry32(S.seed+7);S.towns=[];S.roads=[];S.rails=[];
  const land=(x,z)=>fwHgt(S,x,z)>1.5;
  for(const t of S.towns0||(S.towns0=(FW_SC[S.key]||{}).towns||[])){if(!land(t.x,t.z)&&!t.isl)continue;const st=S.bio==='strait'&&t.x>0?S.stB:S.st;S.towns.push({...t,r:Math.sqrt(t.n)*(t.city?26:34)+40,st});}
  // деревни вокруг (кроме гор и моря)
  const nV=S.bio==='mount'?6:S.bio==='strait'?8:14;for(let i=0;i<nV;i++){const x=(rnd()-0.5)*21000,z=(rnd()-0.5)*21000;if(!land(x,z))continue;
    if(S.fields.some(f=>Math.hypot(x-f.x,z-f.z)<f.r+700))continue;if(S.towns.some(t=>Math.hypot(x-t.x,z-t.z)<t.r+900))continue;if(S.clear&&S.clear.length&&fwClear(S,x,z,250))continue;const n=8+Math.floor(rnd()*22),st=S.bio==='strait'&&x>0?S.stB:S.st;S.towns.push({x,z,n,r:Math.sqrt(n)*34+40,st,vil:1});}
  // дороги: от аэродрома к ближним городам и между соседями (прямо, с изгибами)
  const pts=[...S.fields.filter(f=>!f.sea).map(f=>[f.x,f.z]),...S.towns.map(t=>[t.x,t.z])];
  for(let i=0;i<pts.length;i++){const near=pts.map((p,j)=>[Math.hypot(p[0]-pts[i][0],p[1]-pts[i][1]),j]).filter(q=>q[1]!==i).sort((a,b)=>a[0]-b[0]).slice(0,2);
    for(const [d,j] of near){if(j<i&&near.length>1)continue;if(d>9000)continue;const a=pts[i],b=pts[j],n=Math.max(4,Math.round(d/400)),L=[];let ok=true;
      for(let k=0;k<=n;k++){const t=k/n,w=Math.sin(t*Math.PI)*(fbm2(i*3.1+k*0.37,j*1.7,S.seed+61,2)-0.5)*d*0.18,dx=(b[0]-a[0])/d,dz=(b[1]-a[1])/d,x=a[0]+(b[0]-a[0])*t-dz*w,z=a[1]+(b[1]-a[1])*t+dx*w;if(k>0&&k<n&&!land(x,z))ok=false;L.push([x,z]);}
      if(ok)S.roads.push({p:L,w:7,trees:S.st.road&&rnd()<0.7});}}
  // железная дорога через город
  const city=S.towns.find(t=>t.city);if(city&&S.bio!=='strait'){const a=rnd()*Math.PI,L=[];for(let k=-14;k<=14;k++){const x=city.x+Math.cos(a)*k*800,z=city.z+Math.sin(a)*k*800;L.push([x,z]);}S.rails.push({p:L});}
  // фронт: окопы двух сторон — ломаные линии вдоль x; воронки — в полосе между ними
  if(S.front){const fz=S.front.z;S.trench=[-1,1].map(sd=>{const L=[];for(let x=-30000;x<=30000;x+=60){const zig=((Math.floor(x/60)%2)?1:-1)*14;L.push([x,fz+sd*380+zig+(fbm2(x/1800,sd,S.seed+71,2)-0.5)*500]);}return L;});}
  // приметы
  S.lm=((FW_SC[S.key]||{}).lm||[]).filter(l=>land(l.x,l.z)||S.bio==='lagoon');}
/* ---------- что под колёсами: вода, лес, город, скалы, пашня, луг ---------- */
function fwSurf(x,z){const S=FW.S,h=fwHgt(S,x,z);if(h<0)return 'water';
  for(const t of S.towns)if(Math.hypot(x-t.x,z-t.z)<t.r*0.72)return 'town';
  for(const f of S.fields)if(!f.sea&&Math.hypot(x-f.x,z-f.z)<f.r)return 'grass';
  const M=FW.mapN;if(M&&x>M.x0&&z>M.z0&&x<M.x1&&z<M.z1){const k=Math.floor((x-M.x0)*M.kx),j=Math.floor((z-M.z0)*M.kz),q=(j*M.SZ+k)*4;if(M.B[q+2]>140)return 'forest';if(M.B[q+1]>150)return 'field';}
  else if(fwForest(S,x,z)>0.55)return 'forest';
  const e=12,sl=Math.hypot(fwHgt(S,x+e,z)-fwHgt(S,x-e,z),fwHgt(S,x,z+e)-fwHgt(S,x,z-e))/(2*e);if(sl>0.35||(S.bio==='mount'&&h>2300))return 'rock';
  return 'grass';}
// лес: пятна по шуму, не на аэродроме, не в городе, не у воды
function fwClear(S,x,z,m){for(const c of S.clear||[]){const ax=c.a[0],az=c.a[1],bx=c.b[0],bz=c.b[1],dx=bx-ax,dz=bz-az,L2=dx*dx+dz*dz;const t=L2>0?clamp(((x-ax)*dx+(z-az)*dz)/L2,0,1):0;
    const px=ax+dx*t,pz=az+dz*t;if(Math.hypot(x-px,z-pz)<c.w+(m||0))return true;}return false;}
function fwForest(S,x,z){const n=fbm2(x/1500,z/1500,S.seed+40,3),thr=0.66-S.forest*0.42;let f=sstep(thr-0.02,thr+0.05,n);if(!f)return 0;
  for(const a of S.fields)if(!a.sea&&Math.hypot(x-a.x,z-a.z)<a.r+250)return 0;
  if(S.clear&&S.clear.length&&fwClear(S,x,z))return 0;
  if(S.front&&Math.abs(z-S.front.z)<1100)f*=0.25;return f;}
// препятствия: дома, ангары, трибуны, пилоны, аэростаты, деревья, приметы
function fwObst(x,y,z,r){const W=FW;if(!W)return null;const gy=fwHgt(W.S,x,z),agl=y-Math.max(0,gy);
  for(const c of W.col){const dx=x-c.x,dz=z-c.z;if(c.k==='ball'){if(dx*dx+(y-c.y)*(y-c.y)+dz*dz<(c.r+r)*(c.r+r))return c.why;continue;}
    if(y>c.y1+r||y<c.y0-r)continue;if(c.box){const u=dx*c.ux+dz*c.uz,v=dz*c.ux-dx*c.uz;if(Math.abs(u)<c.hu+r*0.6&&Math.abs(v)<c.hv+r*0.6)return c.why;}else if(dx*dx+dz*dz<(c.r+r*0.6)*(c.r+r*0.6))return c.why;}
  if(agl<16&&gy>0){const s=fwSurf(x,z);if(s==='forest'&&agl<13)return 'задел верхушки деревьев';if(s==='town'&&agl<9)return 'задел крыши';}
  return null;}
/* ---------- карты земли: оттенок и затенение (A), доли слоёв: сухая трава, земля, лес, песок (B) ---------- */
function fwMaps(S){const cx=S.B?(S.A.x+S.B.x)/2:S.A.x,cz=S.B?(S.A.z+S.B.z)/2:S.A.z,HN=11000,q=gfxQ();
  FW.mapN=fwMap(S,cx-HN,cz-HN,cx+HN,cz+HN,q==='cine'?1536:q==='eco'?768:1024,true);
  FW.mapF=fwMap(S,-FW_ROOT/2,-FW_ROOT/2,FW_ROOT/2,FW_ROOT/2,512,false);}
function fwMap(S,x0,z0,x1,z1,SZ,det){const wx=x1-x0,kx=SZ/wx,G=det?256:160,gs=wx/G,rnd=mulberry32(S.seed+(det?3:5));
  const mk=v=>{const c=mkCanvas(SZ,SZ),g=c.getContext('2d');g.fillStyle=v;g.fillRect(0,0,SZ,SZ);g.imageSmoothingEnabled=true;return [c,g];};
  const [cT,gT]=mk('#808080'),[cA,gA]=mk('#fff'),[cL,gL]=mk('#000'),[cD,gD]=mk('#000'),[cF,gF]=mk('#000'),[cC,gC]=mk('#000');
  const sm=[0,1,2,3,4,5].map(()=>{const c=mkCanvas(G,G),g=c.getContext('2d');return {c,g,id:g.createImageData(G,G)};});
  const dryS=[0,0,0.05,0.05,0.1,0.15,0.22,0.28,0.25,0.15,0.08,0][S.month]||0,fz=S.front?S.front.z:null;
  for(let j=0;j<G;j++)for(let k=0;k<G;k++){const x=x0+(k+0.5)*gs,z=z0+(j+0.5)*gs,o=(j*G+k)*4,h=fwHgt(S,x,z),st=S.bio==='strait'&&x>0?S.stB:S.st;
    const n1=fbm2(x/260,z/260,S.seed+5,3),n2=fbm2(x/900,z/900,S.seed+17,2),v=0.86+0.28*n1,dry=clamp(st.dry+dryS,0,1);
    const e=gs*0.5,sl=Math.hypot(fwHgt(S,x+e,z)-fwHgt(S,x-e,z),fwHgt(S,x,z+e)-fwHgt(S,x,z-e))/(2*e);
    const onAF=S.fields.some(a=>!a.sea&&Math.hypot(x-a.x,z-a.z)<a.r+60);
    let F=h>1?fwForest(S,x,z):0,alt=clamp(sstep(0.45,0.8,n2)*(0.35+dry)+dry*0.35,0,1),dirt=sstep(0.3,0.8,sl)*0.55,cov=FW.sea&&!onAF&&h>-1&&h<3.4?sstep(3.4,1.1,h):0;
    let t=st.tint.map(c=>c*v);if(dry>0.3)t=[t[0]*(1+dry*0.12),t[1]*(1+dry*0.04),t[2]*(1-dry*0.12)];
    if(S.bio==='mount'&&h>1500){const a=sstep(1500,2400,h);t=t.map((c,i)=>fwL(c,[132,128,120][i],a));alt=Math.max(alt,a*0.7);F*=1-sstep(1700,2000,h);}
    if(fz!==null){const d=Math.abs(z-fz),b=1-sstep(800,1300,d);if(b>0){t=t.map((c,i)=>fwL(c,[112,100,86][i],b*0.8));dirt=Math.max(dirt,b*0.75);alt*=1-b;F*=1-b*0.85;}}
    // белые скалы Дувра: мел на обрыве
    if(S.cliffB&&x>0&&h>2){const sd=fwSeaS(S,x,z);if(sd>-160&&sd<0){const k=sstep(-160,-30,sd);t=t.map((c,i)=>fwL(c,[250,250,242][i],k));cov=Math.max(cov,k*0.55);}}
    if(h<0)t=[60,72,70];
    const ao=255-F*120;
    const put=(i,a,b,c)=>{const d=sm[i].id.data;d[o]=a;d[o+1]=b;d[o+2]=c;d[o+3]=255;};
    put(0,t[0],t[1],t[2]);put(1,ao,ao,ao);put(2,alt*255,alt*255,alt*255);put(3,dirt*255,dirt*255,dirt*255);put(4,F*255,F*255,F*255);put(5,cov*255,cov*255,cov*255);}
  [gT,gA,gL,gD,gF,gC].forEach((g,i)=>{sm[i].g.putImageData(sm[i].id,0,0);g.drawImage(sm[i].c,0,0,SZ,SZ);});
  const X=x=>(x-x0)*kx,Z=z=>(z-z0)*kx;
  const fd=(x,z)=>{const k=clamp(Math.floor((x-x0)/gs),0,G-1),j=clamp(Math.floor((z-z0)/gs),0,G-1),o=(j*G+k)*4;return sm[4].id.data[o];};
  // поля: пшеница (сухая трава), пашня (земля), луг, виноградник, у русских — полосы, у американцев — квадраты
  if(det){const area=wx*wx,avg=S.st.strip?60*500:S.st.grid?380*380:S.st.hedge?170*150:240*200,nF=Math.min(16000,Math.round(area/avg*0.55));
    for(let f=0;f<nF;f++){const x=x0+rnd()*wx,z=z0+rnd()*wx,h=fwHgt(S,x,z);if(h<1.5||fd(x,z)>60)continue;if(S.bio==='mount'&&h>1300)continue;
      if(S.fields.some(a=>!a.sea&&Math.hypot(x-a.x,z-a.z)<a.r+120))continue;if(S.towns.some(t=>Math.hypot(x-t.x,z-t.z)<t.r*0.7))continue;if(fz!==null&&Math.abs(z-fz)<1150)continue;
      const st=S.bio==='strait'&&x>0?S.stB:S.st;let w,hh,a;
      if(st.strip){w=40+rnd()*40;hh=300+rnd()*500;a=0.35+(rnd()-0.5)*0.2;}else if(st.grid){w=hh=360+rnd()*60;a=0;}else{w=90+rnd()*220;hh=70+rnd()*180;a=rnd()*3.14;}
      const q=rnd(),type=S.vine&&q<0.12&&h>60?'vine':q<0.3?'wheat':q<0.5?'plow':q<0.78?'meadow':'fallow';
      const rect=(g,style,al)=>{g.save();g.translate(X(x),Z(z));g.rotate(a);g.globalAlpha=al;g.fillStyle=style;g.fillRect(-w*kx/2,-hh*kx/2,w*kx,hh*kx);g.restore();};
      if(type==='wheat'){rect(gL,'#fff',0.7);rect(gT,'rgb(150,140,98)',0.55);rect(gD,'#000',0.6);}
      else if(type==='plow'){rect(gD,'#fff',0.9);rect(gT,'rgb(120,104,88)',0.65);rect(gL,'#000',0.9);}
      else if(type==='meadow'){rect(gT,'rgb(104,140,96)',0.55);rect(gL,'#000',0.7);rect(gD,'#000',0.5);}
      else if(type==='vine'){rect(gD,'#fff',0.6);rect(gT,'rgb(128,120,96)',0.5);}
      else{rect(gL,'#fff',0.45);rect(gT,'rgb(140,134,104)',0.4);}
      if(st.hedge){gT.save();gT.translate(X(x),Z(z));gT.rotate(a);gT.globalAlpha=0.55;gT.strokeStyle='rgb(70,96,58)';gT.lineWidth=Math.max(1,kx*5);gT.strokeRect(-w*kx/2,-hh*kx/2,w*kx,hh*kx);gT.restore();}}
    [gT,gD,gL].forEach(g=>{g.globalAlpha=1;});}
  // аэродром: скошенная трава
  for(const a of S.fields){if(a.sea)continue;[[gT,'rgba(118,146,100,.75)'],[gL,'rgba(0,0,0,.8)'],[gD,'rgba(0,0,0,.6)']].forEach(([g,c])=>{g.fillStyle=c;g.beginPath();g.arc(X(a.x),Z(a.z),a.r*kx,0,7);g.fill();});
    gD.fillStyle='rgba(255,255,255,.5)';gD.fillRect(X(a.x-a.r*0.9)-2,Z(a.z-a.r*0.35),Math.max(2,70*kx),Math.max(2,a.r*0.7*kx));}
  // дороги и железная дорога
  const line=(g,L,w,c,al)=>{g.globalAlpha=al;g.strokeStyle=c;g.lineWidth=Math.max(det?1.1:0.7,w*kx);g.lineJoin='round';g.lineCap='round';g.beginPath();L.forEach((p,i)=>i?g.lineTo(X(p[0]),Z(p[1])):g.moveTo(X(p[0]),Z(p[1])));g.stroke();g.globalAlpha=1;};
  S.roads.forEach(r=>{line(gD,r.p,r.w,'#fff',det?0.45:0.25);line(gT,r.p,r.w,'rgb(168,158,136)',det?0.45:0.3);line(gL,r.p,r.w+2,'#000',0.5);});
  S.rails.forEach(r=>{line(gT,r.p,5,'rgb(70,64,58)',0.8);line(gD,r.p,8,'#fff',0.6);});
  // города и деревни: крыши и улицы — серо-бурое пятно, вокруг — сады
  S.towns.forEach(t=>{const r=t.r*kx,gr=(g,c0,c1,rr)=>{const q=g.createRadialGradient(X(t.x),Z(t.z),0,X(t.x),Z(t.z),rr);q.addColorStop(0,c0);q.addColorStop(0.7,c0);q.addColorStop(1,c1);g.fillStyle=q;g.beginPath();g.arc(X(t.x),Z(t.z),rr,0,7);g.fill();};
    gr(gT,t.city?'rgba(132,120,108,.85)':'rgba(128,122,104,.6)','rgba(128,122,104,0)',r*1.05);gr(gD,'rgba(255,255,255,.7)','rgba(255,255,255,0)',r);gr(gA,'rgba(200,200,200,.8)','rgba(200,200,200,0)',r*1.1);gr(gL,'rgba(0,0,0,.8)','rgba(0,0,0,0)',r*1.2);gr(gF,'rgba(0,0,0,1)','rgba(0,0,0,0)',r*1.3);});
  // фронт: окопы (тёмные ломаные), воронки
  if(S.trench){S.trench.forEach(L=>{line(gT,L,3,'rgb(70,58,46)',0.9);line(gD,L,10,'#fff',0.9);});
    if(det){for(let i=0;i<9000;i++){const x=x0+rnd()*wx,z=fz+(rnd()-0.5)*(rnd()<0.7?900:2200);const r=(3+rnd()*7)*kx;gT.fillStyle=`rgba(${70+rnd()*20},${60+rnd()*14},${48},${0.5+rnd()*0.4})`;gT.beginPath();gT.arc(X(x),Z(z),Math.max(0.6,r),0,7);gT.fill();gD.fillStyle='rgba(255,255,255,.8)';gD.beginPath();gD.arc(X(x),Z(z),Math.max(0.8,r*1.3),0,7);gD.fill();}}}
  // берег реки и моря: песок у самой воды уже в доле покрова; у реки — сочная трава
  if(S.river&&det){const R=S.river,L=[];for(let x=x0;x<=x1;x+=60){L.push([x,R.z+R.A*Math.sin(x/R.L+S.seed%7)+R.A*0.4*Math.sin(x/(R.L*0.37)+1.3)]);}line(gT,L,R.w+140,'rgb(96,132,90)',0.45);line(gL,L,R.w+160,'#000',0.6);}
  const px=g=>g.getImageData(0,0,SZ,SZ).data,t=px(gT),ao=px(gA),al=px(gL),di=px(gD),fo=px(gF),co=px(gC),n=SZ*SZ,A=new Uint8Array(n*4),B=new Uint8Array(n*4);
  for(let i=0;i<n;i++){const o=i*4;A[o]=t[o];A[o+1]=t[o+1];A[o+2]=t[o+2];A[o+3]=ao[o];B[o]=al[o];B[o+1]=di[o];B[o+2]=fo[o];B[o+3]=co[o];}
  return {x0,z0,x1,z1,SZ,kx,kz:kx,A,B,u:[x0,z0,1/wx,1/wx],tex:null};}
/* ---------- постройки: дома простыми коробками с фото-фактурой (стены, черепица, шифер, солома), церкви и приметы — подробные ---------- */
function fwHouse(mb,x,y,z,a,w,d,h,rh,wc,rc,wl,rl,flat){const c=Math.cos(a),s=Math.sin(a),P=(u,v,q)=>[x+u*c+q*s,y+v,z-u*s+q*c],N=(u,v,q)=>[u*c+q*s,v,-u*s+q*c];
  mb.e[3]=wl;pBox(mb,x,y,z,w/2,h,d/2,wc,MID.wall,a);mb.e[3]=rl;const rcc=hex2rgb(rc),ov=0.45;
  if(flat){pBox(mb,x,y+h,z,w/2+0.2,0.35,d/2+0.2,rc,MID.roof,a);mb.e[3]=0;return;}
  mb.poly([P(-w/2-ov,h,-d/2-ov),P(w/2+ov,h,-d/2-ov),P(w/2+ov,h+rh,0),P(-w/2-ov,h+rh,0)],v3n(N(0,d/2,-rh)),rcc,MID.roof);
  mb.poly([P(-w/2-ov,h,d/2+ov),P(-w/2-ov,h+rh,0),P(w/2+ov,h+rh,0),P(w/2+ov,h,d/2+ov)],v3n(N(0,d/2,rh)),rcc,MID.roof);
  mb.e[3]=wl;const wcc=hex2rgb(wc);for(const sd of [-1,1])mb.poly([P(sd*w/2,h,-d/2),P(sd*w/2,h,d/2),P(sd*w/2,h+rh,0)],N(sd,0,0),wcc,MID.wall);mb.e[3]=0;}
const FW_HC={fr:{w:['#e6dcc4','#d9c9a8','#cfc3a8'],r:['#b0593a','#5c6570','#a85a3c'],wl:'plaster',rl:'roof_tiles'},uk:{w:['#a85d44','#b8735a','#e8e0cc'],r:['#5c6068','#6a5a4a','#c9a64e'],wl:'brick_wall',rl:'roof_slate'},
  de:{w:['#efe6d2','#e2d6be','#d8c8a8'],r:['#a84a32','#9a4430','#5c6068'],wl:'plaster',rl:'roof_tiles'},us:{w:['#e8e4da','#c8c0b0','#b04a3a'],r:['#5a5048','#6a6a6a','#4a4440'],wl:'wood_wall',rl:'roof_slate'},
  it:{w:['#e0b47a','#d69a6a','#e8cf9c'],r:['#b4603e','#a85a3c','#c06a44'],wl:'plaster',rl:'roof_tiles'},ru:{w:['#8a6a4a','#7a5c40','#a07a54'],r:['#7a7a72','#6a6a64','#8a7a5a'],wl:'wood_wall',rl:'roof_slate'}};
function fwTown(t,S){const mb=new MB(),rnd=mulberry32(hashStr('t'+Math.round(t.x)+','+Math.round(t.z))),sk=Object.keys(FW_ST).find(k=>FW_ST[k]===t.st)||'fr',C=FW_HC[sk],N=t.n;
  const nS=t.city?6:t.n>25?3:2,str=[];for(let i=0;i<nS;i++)str.push(rnd()*Math.PI);const pts=[];let tries=0,placed=0,hmax=0;
  const L=k=>txLay(k,1);
  while(placed<N&&tries<N*8){tries++;let a,dist,off;if(t.city&&rnd()<0.55){// город: кварталы сеткой
      a=str[0];const gx=Math.round((rnd()-0.5)*2*t.r*0.8/22),gz=Math.round((rnd()-0.5)*2*t.r*0.8/22);dist=gx*22;off=gz*22+(rnd()<0.5?-6:6);}
    else{a=str[tries%nS];dist=(rnd()-0.5)*2*t.r*0.95;off=(rnd()<0.5?-1:1)*(9+rnd()*6+(t.city?0:rnd()*12));}
    const ux=Math.cos(a),uz=Math.sin(a),x=t.x+ux*dist-uz*off,z=t.z+uz*dist+ux*off,dc=Math.hypot(x-t.x,z-t.z);if(dc>t.r)continue;
    if(pts.some(p=>Math.abs(p[0]-x)<(t.city?10:13)&&Math.abs(p[1]-z)<(t.city?10:13)))continue;const h0=fwHgt(S,x,z);if(h0<0.8&&!t.isl)continue;pts.push([x,z]);placed++;
    const core=t.city&&dc<t.r*0.55,v=Math.floor(rnd()*3),wc=C.w[v],rc=C.r[Math.floor(rnd()*3)];
    if(t.ruin){const hh=2+rnd()*4;mb.e[3]=L('stone_wall');pBox(mb,x,h0,z,4+rnd()*2,hh,0.3,'#9a948a',MID.stone,-a);pBox(mb,x+2,h0,z,0.3,hh*0.6,3.5,'#8a847a',MID.stone,-a);mb.e[3]=0;continue;}
    let w,d,h,rh,flat=sk==='it'&&rnd()<0.3;
    if(core){w=12+rnd()*9;d=10+rnd()*5;h=9+rnd()*8;rh=2.2;}else if(sk==='ru'){w=6+rnd()*2;d=6+rnd()*2;h=2.8+rnd()*0.8;rh=2.4;}else if(sk==='us'){w=7+rnd()*3;d=9+rnd()*3;h=5+rnd()*2;rh=3;}else{w=7+rnd()*5;d=6+rnd()*3;h=3.5+rnd()*3.5;rh=2.6+rnd()*1.4;}
    const y0=t.isl?Math.max(0.6,h0):h0;fwHouse(mb,x,y0-0.5,z,-a,w,d,h+0.5,rh,wc,rc,L(core&&sk!=='ru'?'plaster':C.wl),L(sk==='ru'&&!core?'planks':C.rl),flat);hmax=Math.max(hmax,h+rh);
    if(sk==='us'&&!core&&rnd()<0.3)fwHouse(mb,x+uz*16,y0-0.5,z-ux*16,-a,9,14,6,4,'#a83a2a','#4a4440',L('wood_wall'),L('roof_slate'));}
  // церковь (или собор) в середине
  const chK=t.st.ch,cs=t.ch||(t.city?1.7:1);if(!t.ruin&&BLD[chK]){const gy=fwHgt(S,t.x,t.z);mb.add(pBld(chK,0),X3(str[0],cs,[t.x,Math.max(gy,t.isl?0.6:gy),t.z]));hmax=Math.max(hmax,30*cs);}
  const g=g3Mesh(mb);if(!g)return null;FW.col.push({x:t.x,z:t.z,r:t.r*0.7,y0:-50,y1:fwHgt(S,t.x,t.z)+hmax*0.6,why:'врезался в дома'});
  return {m:g,c:[t.x,fwHgt(S,t.x,t.z)+10,t.z],r:t.r+40,town:1};}
// человечки толпы: тело, голова, шляпа
function fwCrowd(mb,x0,z0,x1,z1,n,gy,rnd,y){const cl=y<1914?['#2a2a2e','#3a3530','#e8e4dc','#4a3a30','#1f2a40','#d8d0c0']:['#2a2a2e','#4a4438','#6a6450','#1f2a40','#c8c0b0','#5a3a30'];
  for(let i=0;i<n;i++){const t=rnd(),x=x0+(x1-x0)*t+(rnd()-0.5)*3,z=z0+(z1-z0)*t+(rnd()-0.5)*3,h=1.55+rnd()*0.25,c=cl[Math.floor(rnd()*cl.length)];
    pCyl(mb,[x,gy,z],[x,gy+h*0.82,z],0.22,0.18,c,5,MID.cloth,false);pBlob(mb,x,gy+h*0.9,z,0.11,0.13,0.11,'#d8b090',()=>0.5,0,MID.skin);if(rnd()<0.6)pCyl(mb,[x,gy+h*0.97,z],[x,gy+h*1.04,z],0.16,0.14,rnd()<0.5?'#2a2a2e':'#e8e0c8',6,MID.cloth);}}
// аэродром: ангары (по эпохе), трибуны и зрители, флаги, «колдунчик», вышка судей
function fwAirfield(f,S,o){const mb=new MB(),y=S.y,rnd=mulberry32(hashStr('af'+f.x+','+f.z)),gy=f.y,hx=f.x-f.r*0.82,L=k=>txLay(k,1);
  const nH=y<1914?5:y<1919?6:3;for(let i=0;i<nH;i++){const z=f.z+(i-(nH-1)/2)*(y<1919?24:42);
    if(y<1914){fwHouse(mb,hx,gy,z,0,16,20,6.2,2.6,'#b89a74','#5c5a56',L('wood_wall'),L('roof_slate'));pBox(mb,hx+8.05,gy,z,0.05,5.4,6,'#2a2420',MID.matte);}
    else if(y<1919){// брезентовый ангар Бессоно: арка, открытым торцом — к полю
      const W=16,D=22,R=6.5,c=hex2rgb('#8a7f5c');for(let k=0;k<10;k++){const a0=k/10*Math.PI,a1=(k+1)/10*Math.PI;const p=(a,xx)=>[xx,gy+Math.sin(a)*R,z+Math.cos(a)*W/2];
        mb.poly([p(a0,hx-D/2),p(a1,hx-D/2),p(a1,hx+D/2),p(a0,hx+D/2)],[0,Math.sin((a0+a1)/2),Math.cos((a0+a1)/2)],cMul(c,0.9+0.1*Math.sin(a0*3)),MID.cloth);}
      const cap=[];for(let k=0;k<=10;k++){const a=k/10*Math.PI;cap.push([hx-D/2,gy+Math.sin(a)*R,z+Math.cos(a)*W/2]);}mb.poly(cap,[-1,0,0],hex2rgb('#7a7050'),MID.cloth);
      const dk=[];for(let k=0;k<=10;k++){const a=k/10*Math.PI;dk.push([hx+D/2-0.6,gy+Math.sin(a)*R*0.96,z+Math.cos(a)*W/2*0.96]);}mb.poly(dk,[1,0,0],hex2rgb('#2a2620'),MID.matte);}
    else{fwHouse(mb,hx,gy,z,0,30,36,9,4,'#9a9488','#5c6068',L('stone_wall'),L('roof_slate'));pBox(mb,hx+15.05,gy,z,0.05,7.8,13,'#2a2826',MID.matte);}
    FW.col.push({x:hx,z,r:13,y0:gy-5,y1:gy+9,why:'врезался в ангар'});}
  // флаги и «колдунчик» (полосатый конус ветра)
  const fl={fr:['#1f3e8c','#fff','#c8102e'],uk:['#1f3e8c','#c8102e','#fff'],de:['#141414','#fff','#c8102e'],us:['#c8102e','#fff','#1f3e8c'],it:['#1b7a3a','#fff','#c8102e'],ru:y<1918?['#fff','#1f3e8c','#c8102e']:['#c8102e','#c8102e','#c8102e']}[o.c||'fr']||['#fff','#fff','#fff'];
  for(let i=0;i<3;i++){const x=hx+12,z=f.z-40+i*40;pCyl(mb,[x,gy,z],[x,gy+14,z],0.12,0.08,'#e8e4dc',6,MID.paint);fl.forEach((c,k)=>pBox(mb,x,gy+12.6-k*0.55,z+1.2,0.03,0.55,1.1,c,MID.cloth));}
  {const x=f.x,z=f.z+f.r*0.9;pCyl(mb,[x,gy,z],[x,gy+7,z],0.1,0.08,'#e8e4dc',6,MID.paint);for(let k=0;k<4;k++)pCyl(mb,[x,gy+6.6,z+k*0.6],[x,gy+6.6,z+(k+1)*0.6],0.4-k*0.06,0.34-k*0.06,k%2?'#fff':'#e05a2a',10,MID.cloth);}
  if(o.stands){const sx=f.x+f.r*0.62;for(let i=-2;i<=2;i++)mb.add(pStand(),X3(Math.PI,1,[sx,gy,f.z+i*17]));fwCrowd(mb,sx-7,f.z-130,sx-7,f.z+130,o.crowd||260,gy,rnd,y);
    // вышка судей с табло
    const tx=sx-4,tz=f.z+60;mb.e[3]=L('wood_wall');pBox(mb,tx,gy,tz,2,9,2,'#8a6a4a',MID.wood);pBox(mb,tx,gy+9,tz,2.6,0.4,2.6,'#6a5040',MID.wood);mb.e[3]=0;pBox(mb,tx-2.7,gy+6,tz,0.1,3,3.5,'#1a1a1a',MID.paint);
    FW.col.push({x:sx,z:f.z,box:1,ux:0,uz:1,hu:45,hv:5,y0:gy-5,y1:gy+8,why:'врезался в трибуны'});}
  // стоящие аэропланы — те, что летали в этот год (в войну — свои, на стоянке у ангаров)
  FW.parked=[];(o.parked||[]).forEach((md,i)=>{const z=f.z+(i-(o.parked.length-1)/2)*26,x=hx+24;FW.parked.push({md,x,z,y:gy,a:Math.PI/2+(rnd()-0.5)*0.2,c:o.c});FW.col.push({x,z,r:5,y0:gy-3,y1:gy+3,why:'врезался в стоящий аэроплан'});});
  const g=g3Mesh(mb);return g?{m:g,c:[f.x,gy+5,f.z],r:f.r*1.2}:null;}
// объекты задания: пилоны, ворота старта, аэростаты, склады и мосты, корабли, буйки
function fwMission(objs,S){const mb=new MB(),hot=[];
  objs.forEach(o=>{const gy=o.sea?0:Math.max(0,fwHgt(S,o.x,o.z));
    if(o.k==='clear')return;
    // 0.38: судейская палатка с флагами и зрителями у концов базы — чтобы базу было видно с воздуха
    if(o.k==='judge'){const a=o.a||0,c=Math.cos(a),sn=Math.sin(a),P=(u,v,q)=>[o.x+u*c+q*sn,gy+v,o.z-u*sn+q*c];
      pBox(mb,o.x,gy,o.z,4,2.6,3,'#e8e2d2',MID.cloth,a);mb.poly([P(-4.6,2.6,-3.6),P(4.6,2.6,-3.6),P(0,5,0)],[0,0.6,-0.8],hex2rgb('#d8d0bc'),MID.cloth);mb.poly([P(4.6,2.6,3.6),P(-4.6,2.6,3.6),P(0,5,0)],[0,0.6,0.8],hex2rgb('#d8d0bc'),MID.cloth);
      mb.poly([P(4.6,2.6,-3.6),P(4.6,2.6,3.6),P(0,5,0)],[0.8,0.6,0],hex2rgb('#cfc6b0'),MID.cloth);mb.poly([P(-4.6,2.6,3.6),P(-4.6,2.6,-3.6),P(0,5,0)],[-0.8,0.6,0],hex2rgb('#cfc6b0'),MID.cloth);
      for(const q of [-7,7]){const b=P(0,0,q);pCyl(mb,[b[0],gy,b[2]],[b[0],gy+9,b[2]],0.09,0.07,'#3a3a3a',5,MID.metal);pBox(mb,b[0]+0.9,gy+7.6,b[2],0.9,1.2,0.02,q<0?'#e0402a':'#f0ece2',MID.cloth);}
      for(let i=0;i<6;i++){const b=P(6+(i%3)*1.3,0,-2+Math.floor(i/3)*4);pBox(mb,b[0],gy,b[2],0.22,1.65,0.22,['#2a2a2e','#3a3530','#1f2a40'][i%3],MID.cloth);}
      FW.col.push({x:o.x,z:o.z,r:5,y0:gy-2,y1:gy+5,why:'врезался в судейскую палатку'});return;}
    // 0.39: военные конкурсы с оружием — аэро-мишень (белый круг с крестом, как у Мишлена), щит для стрельбы, лагерь из палаток для фоторазведки
    if(o.k==='aerotarget'){const R=o.r||10,n=36;for(let i=0;i<n;i++){const a=i/n*6.2832,b=(i+1)/n*6.2832;mb.poly([[o.x+Math.cos(a)*R,gy+0.12,o.z+Math.sin(a)*R],[o.x+Math.cos(b)*R,gy+0.12,o.z+Math.sin(b)*R],[o.x+Math.cos(b)*(R-1.6),gy+0.12,o.z+Math.sin(b)*(R-1.6)],[o.x+Math.cos(a)*(R-1.6),gy+0.12,o.z+Math.sin(a)*(R-1.6)]],[0,1,0],hex2rgb('#f4f0e6'),MID.cloth);}
      pBox(mb,o.x,gy+0.1,o.z,R*0.7,0.06,0.9,'#f4f0e6',MID.cloth);pBox(mb,o.x,gy+0.1,o.z,0.9,0.06,R*0.7,'#f4f0e6',MID.cloth);pBox(mb,o.x,gy+0.1,o.z,2.2,0.08,2.2,'#d8382a',MID.cloth);
      for(const q of [[R+4,0],[-R-4,0],[0,R+4],[0,-R-4]]){pCyl(mb,[o.x+q[0],gy,o.z+q[1]],[o.x+q[0],gy+5,o.z+q[1]],0.07,0.06,'#3a3a3a',5,MID.metal);pBox(mb,o.x+q[0]+0.7,gy+4,o.z+q[1],0.7,0.9,0.02,'#f0ece2',MID.cloth);}return;}
    if(o.k==='sheet'){const a=o.a||0;pBox(mb,o.x,gy+0.05,o.z,6,0.08,2.5,'#f4f0e6',MID.cloth,a);pBox(mb,o.x,gy+0.1,o.z,1.2,0.06,1.2,'#1a1a1a',MID.cloth,a);pBox(mb,o.x,gy+0.12,o.z,0.45,0.05,0.45,'#f4f0e6',MID.cloth,a);
      for(const q of [-7,7]){pCyl(mb,[o.x+q,gy,o.z],[o.x+q,gy+4,o.z],0.07,0.06,'#3a3a3a',5,MID.metal);pBox(mb,o.x+q+0.6,gy+3.2,o.z,0.6,0.8,0.02,'#d8382a',MID.cloth);}return;}
    if(o.k==='camp'){const rnd=mulberry32(hashStr('c'+Math.round(o.x)+'_'+Math.round(o.z)));const n=o.n||10;for(let i=0;i<n;i++){const x=o.x+((i%5)-2)*7+(rnd()-0.5)*2,z=o.z+Math.floor(i/5)*8+(rnd()-0.5)*2,g2=Math.max(0,fwHgt(S,x,z));
        pCyl(mb,[x,g2,z],[x,g2+3.2,z],2.4,0.05,'#d9d2bc',8,MID.cloth);pCyl(mb,[x,g2+3.1,z],[x,g2+3.6,z],0.05,0.04,'#3a3a3a',4,MID.metal);}
      pCyl(mb,[o.x-20,gy,o.z-6],[o.x-20,gy+8,o.z-6],0.09,0.07,'#3a3a3a',5,MID.metal);pBox(mb,o.x-19.2,gy+6.8,o.z-6,0.9,1.1,0.02,'#2a4a8a',MID.cloth);
      for(let i=0;i<4;i++)pBox(mb,o.x+10+i*3,gy,o.z-10,0.5,1.4,1.1,'#6a5a40',MID.wood);/* повозки */for(let i=0;i<8;i++)pBox(mb,o.x-8+i*2.2,gy,o.z+22,0.22,1.65,0.22,['#4a5038','#3a4030'][i%2],MID.cloth);return;}
    if(o.k==='pylon'){const h=o.h||24;for(let k=0;k<6;k++)pBox(mb,o.x,gy+k*h/6,o.z,0.7,h/6,0.7,k%2?'#f0ece2':'#1a1a1a',MID.paint);pCyl(mb,[o.x,gy+h,o.z],[o.x,gy+h+3,o.z],0.06,0.05,'#2a2a2a',5,MID.metal);pBox(mb,o.x+0.9,gy+h+1.6,o.z,0.9,1.3,0.02,o.col||'#e0402a',MID.cloth);
      if(o.sea){pCyl(mb,[o.x,-0.6,o.z],[o.x,0.6,o.z],4,4,'#5a4a3a',10,MID.wood);}
      FW.col.push({x:o.x,z:o.z,r:1.4,y0:gy-2,y1:gy+h+3,why:'врезался в пилон'});}
    else if(o.k==='gate'){const c=Math.cos(o.a||0),s=Math.sin(o.a||0),w=o.w||60,h=o.h||14;for(const sd of [-1,1]){const x=o.x+c*sd*w/2,z=o.z-s*sd*w/2;for(let k=0;k<4;k++)pBox(mb,x,gy+k*h/4,z,0.5,h/4,0.5,k%2?'#f0ece2':'#c8202a',MID.paint);}
      FW.col.push({x:o.x+c*w/2,z:o.z-s*w/2,r:1,y0:gy,y1:gy+h,why:'врезался в столб'},{x:o.x-c*w/2,z:o.z+s*w/2,r:1,y0:gy,y1:gy+h,why:'врезался в столб'});}
    else if(o.k==='balloon'){const y=o.y||700;pBlob(mb,o.x,y,o.z,6.2,6.2,14,'#b8b090',()=>0.5,1,MID.cloth);for(const a of [0,2.1,4.2])pBlob(mb,o.x+Math.cos(a)*4.5,y+Math.sin(a)*4.5,o.z-11,2.2,2.2,3.5,'#a8a080',()=>0.5,0,MID.cloth);
      pBox(mb,o.x,y-12,o.z+2,0.8,1.1,0.8,'#6a5a40',MID.wood);mb.rod([o.x,y-11,o.z+2],[o.x+30,gy+1,o.z+60],0.06,hex2rgb('#2a2a2a'),MID.metal);pBox(mb,o.x+30,gy,o.z+60,1.2,1.6,2.5,'#4a5038',MID.paint);
      hot.push(o);FW.col.push({k:'ball',x:o.x,z:o.z,y,r:10,why:'врезался в аэростат'});}
    else if(o.k==='depot'||o.k==='station'){const rnd=mulberry32(hashStr('d'+o.x));for(let i=0;i<(o.k==='station'?5:8);i++){const x=o.x+(rnd()-0.5)*120,z=o.z+(rnd()-0.5)*80;fwHouse(mb,x,gy,z,o.a||0,20+rnd()*16,10+rnd()*6,5+rnd()*3,2,'#9a8a78','#5c6068',txLay('brick_wall',1),txLay('roof_slate',1));}
      if(o.k==='station')for(let k=0;k<3;k++)pBox(mb,o.x,gy,o.z+40+k*4,90,0.3,0.4,'#4a4440',MID.metal);hot.push(o);}
    else if(o.k==='ship'){const a=o.a||0,L=o.len||60,c=Math.cos(a),s=Math.sin(a),P=(u,v,w)=>[o.x+u*s+w*c,v,o.z+u*c-w*s];
      mb.poly([P(L/2,0.2,0),P(L*0.3,0.2,L/14),P(-L/2,0.2,L/16),P(-L/2,0.2,-L/16),P(L*0.3,0.2,-L/14)],[0,1,0],hex2rgb('#6a6560'),MID.wood);
      for(const sd of [-1,1])mb.poly([P(L/2,0.2,0),P(L/2,-1.5,0),P(L*0.3,-1.5,sd*L/14),P(L*0.3,0.2,sd*L/14)],[sd*0.3,0,1],hex2rgb('#2a2a2e'),MID.paint);
      for(const sd of [-1,1])mb.poly([P(L*0.3,0.2,sd*L/14),P(L*0.3,-1.5,sd*L/14),P(-L/2,-1.5,sd*L/16),P(-L/2,0.2,sd*L/16)],[0,0,sd],hex2rgb('#2a2a2e'),MID.paint);
      pBox(mb,o.x-s*L*0.05,0.2,o.z-c*L*0.05,L*0.06,4,L*0.16,'#e8e4dc',MID.paint,a);pCyl(mb,P(-L*0.05,4,0),P(-L*0.05,10,0),1.2,1.1,'#2a2a2a',10,MID.metal);if(o.smoke)hot.push(o);}
    else if(o.k==='buoy'){pCyl(mb,[o.x,-0.5,o.z],[o.x,1.2,o.z],0.8,0.5,o.col||'#e0402a',8,MID.paint);}
    else if(o.k==='aa'){pBox(mb,o.x,gy,o.z,2,0.9,3,'#4a5038',MID.paint);mb.rod([o.x,gy+1,o.z],[o.x,gy+4,o.z+2.2],0.25,hex2rgb('#2a2a2a'),MID.metal);hot.push(o);}});
  const g=g3Mesh(mb);FW.hot=hot;return g?{m:g,c:[0,0,0],r:1e6,all:1}:null;}
// все постройки сцены (один раз, при загрузке)
function fwObjects(o){const S=FW.S;FW.objs=[];FW.col=[];
  for(const f of S.fields){if(f.sea){const mb=new MB(),x=f.x-60,z=f.z,gy=Math.max(1.5,fwHgt(S,x-60,z));fwHouse(mb,x-70,gy-0.5,z,0,18,24,6,3,'#b89a74','#5c5a56',txLay('wood_wall',1),txLay('roof_slate',1));
      pBox(mb,x-25,0,z,30,0.8,4,'#7a6a58',MID.wood);const g=g3Mesh(mb);if(g)FW.objs.push({m:g,c:[x,5,z],r:120});continue;}
    const a=fwAirfield(f,S,{stands:o.stands&&f===S.A,crowd:o.crowd,parked:f===S.A?o.parked:[],c:o.c});if(a)FW.objs.push(a);}
  for(const t of S.towns){const m=fwTown(t,S);if(m)FW.objs.push(m);}
  for(const l of S.lm){if(!BLD[l.k])continue;const gy=Math.max(0.5,fwHgt(S,l.x,l.z)),mb=new MB();mb.add(pBld(l.k,0),X3(l.a||0,l.s||1,[l.x,gy,l.z]));const g=g3Mesh(mb);if(g){FW.objs.push({m:g,c:[l.x,gy+60,l.z],r:200*(l.s||1)});FW.col.push({x:l.x,z:l.z,r:(LM_R[l.k]||20)*(l.s||1)*0.7,y0:gy-5,y1:gy+(l.k==='eiffel'?300:60*(l.s||1)),why:'врезался в '+({eiffel:'Эйфелеву башню',castle:'замок',bigben:'башню'}[l.k]||'здание')});}}
  if(FW.extra.length){const m=fwMission(FW.extra,S);if(m)FW.objs.push(m);}}
