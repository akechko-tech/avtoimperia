/* ================= RACE ENGINE: track, vehicle physics, AI, lifecycle ================= */
const GRAV=9.81;
// Жёсткость шин (на рад угла увода) и «держалка» для машины игрока — подобраны так, чтобы машина ехала туда, куда смотрит нос
const PHY={tk:11,hold:1};
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
// Покрытия: цвета псевдо-3D, сцепление, качение, живучесть шин, пыль, тряска
const TERR={
  dirt:{road:'#b39a6c',road2:'#a88f62',edge:'#8f7a52',edge2:'#9c865c',g:'#6f8f45',g2:'#67873f',mu:0.82,crr:1.5,tyre:0.7,dust:1,rough:1.3,ruts:1},
  macadam:{road:'#8f887b',road2:'#877f73',edge:'#6f6a60',edge2:'#7a7468',g:'#628b3e',g2:'#5a8338',mu:0.92,crr:1.15,tyre:0.85,dust:0.45,rough:1.0,ruts:1},
  asphalt:{road:'#6e6e70',road2:'#676769',edge:'#b8322a',edge2:'#efefea',line:'#e8e6de',g:'#5f8a3c',g2:'#588236',mu:1.0,crr:1,tyre:1,rough:0.8},
  brick:{road:'#9a4f36',road2:'#914a33',edge:'#efefea',edge2:'#3a3a3a',g:'#5f8a3c',g2:'#588236',mu:0.95,crr:1.1,tyre:0.9,rough:0.9,bricks:1},
  board:{road:'#b8905c',road2:'#ae8753',edge:'#efefea',edge2:'#8a6a44',g:'#7a8a5a',g2:'#728252',mu:0.97,crr:0.9,tyre:1.1,rough:0.7,planks:1},
  concrete:{road:'#a5a39c',road2:'#9d9b94',edge:'#6f6d68',edge2:'#7d7b75',g:'#5f8a3c',g2:'#588236',mu:0.97,crr:1,tyre:1,rough:0.9},
  snow:{road:'#d8dde3',road2:'#cfd5dc',edge:'#aab3bd',edge2:'#b8c0c8',g:'#eef1f4',g2:'#e6eaee',mu:0.55,crr:1.8,tyre:1.2,rough:1.1,ruts:1},
  mud:{road:'#6b5033',road2:'#62492f',edge:'#4d3a26',edge2:'#56422b',g:'#556b3a',g2:'#4e6335',mu:0.62,crr:2,tyre:0.8,rough:1.3,ruts:1},
  sand:{road:'#d9bb7c',road2:'#d1b373',edge:'#c2a263',edge2:'#cbab6b',g:'#e3cc92',g2:'#dcc488',mu:0.72,crr:2.2,tyre:0.8,dust:1.2,rough:1.0},
  mount:{road:'#a8977a',road2:'#9f8e72',edge:'#857658',edge2:'#8f7f60',g:'#7a8a52',g2:'#72824b',mu:0.85,crr:1.3,tyre:0.75,dust:0.9,rough:1.4,ruts:1},
  beach:{road:'#e2cfa0',road2:'#dac795',edge:'#ead9b0',edge2:'#e4d2a6',g:'#d8c28e',g2:'#d2bb86',mu:0.8,crr:1.6,tyre:1,dust:0.4,rough:0.8}
};
// Пейзаж по стране гонки
const SCEN_SETS={
  fr:{trees:['plane','poplar','oak'],alley:'plane',houses:['farm_fr','house_fr'],town:['house_fr','house_fr','cafe','house_fr'],church:'church',extra:['km','hay','vine','bush','cart'],sky:['#6fa0cc','#ecdfc4'],hills:'#7f9a6a',bd:'spire'},
  it:{trees:['cypress','olive','pine','cypress'],alley:'cypress',houses:['house_it'],town:['house_it','house_it','house_it'],church:'campanile',extra:['wall','olive','rock','cart','vine','cactus','agave'],sky:['#4f8ccf','#f1e2c0'],hills:'#9c9a78',mount:1,bd:'campanile'},
  de:{trees:['fir','oak','birch','fir'],alley:'oak',houses:['fachwerk'],town:['fachwerk','fachwerk'],church:'church',extra:['bush','hay','fence'],sky:['#6b94bd','#dfe3e2'],hills:'#5f7f55',bd:'spire'},
  uk:{trees:['oak','elm','oak'],alley:'oak',houses:['cottage','pub'],town:['cottage','pub','cottage'],church:'church_uk',extra:['hedge','wall','bush'],sky:['#7898b4','#dfe2e0'],hills:'#6f8d5c',bd:'square'},
  us:{trees:['elm','oak'],alley:'elm',houses:['farm_us','barn','windmill_us'],town:['farm_us','billboard','farm_us'],church:'church_us',extra:['fence','billboard','hay','pole','windmill_us'],sky:['#5f95c8','#e6ecef'],hills:'#8a9a6a',flat:1,bd:'barn'},
  be:{trees:['fir','birch','oak'],alley:'poplar',houses:['house_fr','fachwerk'],town:['house_fr','cafe'],church:'church',extra:['bush','fence'],sky:['#6f92b4','#dde2e0'],hills:'#5f7f55',bd:'spire'},
  mc:{trees:['palm','pine'],alley:'palm',houses:['villa'],town:['villa','villa','cafe'],church:'campanile',extra:['lamp','bush','agave'],sky:['#4f98d6','#f3ead8'],hills:'#8a8a6a',sea:1,mount:1,bd:'campanile'},
  at:{trees:['fir','fir','birch'],alley:'fir',houses:['fachwerk'],town:['fachwerk'],church:'church_at',extra:['rock','fence'],sky:['#4f86c4','#e8ecef'],hills:'#6a7f60',mount:1,snow:1,bd:'onion_at'},
  ch:{trees:['fir','fir'],alley:'fir',houses:['fachwerk'],town:['fachwerk'],church:'church_at',extra:['rock','fence'],sky:['#4f86c4','#e8ecef'],hills:'#6a7f60',mount:1,snow:1,bd:'onion_at'},
  es:{trees:['pine','olive','cypress'],alley:'pine',houses:['house_it'],town:['house_it','house_it'],church:'campanile',extra:['wall','rock','agave'],sky:['#4f98d6','#f3e6c8'],hills:'#a89a74',mount:1,bd:'campanile'},
  // Россия: берёзы и ели, избы, полосатые вёрсты, колодцы-журавли, стога, мельницы, белые церкви с луковицами
  ru:{trees:['birch','birch','fir','pine','birch'],alley:'birch',houses:['izba','izba','mill_ru'],town:['izba','izba','izba'],church:'church_ru',extra:['well','stog','fence_ru','cart','stog','mill_ru'],sky:['#7a9cc0','#e6e6de'],hills:'#6f8a5a',flat:1,bd:'onion',verst:1},
  // Ирландия: белёные домики под соломой, каменные изгороди, круглые башни
  ie:{trees:['oak','elm','bush','oak'],alley:'elm',houses:['cottage_ie','cottage_ie','farm_fr'],town:['cottage_ie','pub','cottage_ie'],church:'church_uk',extra:['wall','hedge','bush','hay'],sky:['#7898b4','#dfe2e0'],hills:'#6f9a5c',bd:'square'},
  // Северная Африка (Триполи): пальмы, белые дома с плоскими крышами, минареты
  ly:{trees:['palm','palm','olive'],alley:'palm',houses:['house_ly'],town:['house_ly','house_ly','house_ly'],church:'minaret',extra:['wall','rock','cart','agave'],sky:['#5a9ad6','#f3e6c8'],hills:'#c8b07a',grass:'#b8aa78',dry:1,flat:1,bd:'minaret'},
  other:{trees:['birch','fir','birch'],alley:'birch',houses:['izba'],town:['izba','izba'],church:'church',extra:['fence','cart'],sky:['#7a9cc0','#e2e4e0'],hills:'#6f8a5a',flat:1,bd:'spire'}
};
function trackCfg(rc){
  const early=rc.y<1910;
  let c={closed:false,laps:1,len:2400,curvy:0.45,hilly:0.35,crowd:0.25,terr:early?'dirt':rc.y<1920?'macadam':'asphalt',pits:false,night:false,uphill:false,oval:false,town:true,sprint:false,width:early?8:9,host:rc.host||'fr',banked:false};
  if(rc.t==='circuit')Object.assign(c,{closed:true,laps:2,len:1500,curvy:0.6,pits:true});
  if(rc.t==='endurance')Object.assign(c,{closed:true,laps:3,len:1400,curvy:0.45,pits:true,night:rc.id==='lemans'||rc.id==='spa24',town:false});
  if(rc.t==='hill')Object.assign(c,{len:1400,curvy:1,hilly:0.2,uphill:true,terr:'mount',town:false,crowd:0.2,width:7});
  // марафоны: зимой (Нью-Йорк — Париж, ралли Монте-Карло) — снег на первом этапе, в остальное время — грязь и пыль
  if(rc.t==='rally')Object.assign(c,{len:2600,curvy:0.55,hilly:0.6,stages:rc.m<=1||rc.m===11?['snow','mud','dirt']:['dirt','mud','dirt'],crowd:0.06});
  if(rc.t==='oval')Object.assign(c,{closed:true,laps:3,len:1250,oval:true,pits:true,town:false,crowd:0.6,width:14,terr:rc.y<1920?'concrete':'asphalt'});
  if(rc.t==='sprint')Object.assign(c,{len:1100,sprint:true,town:false,crowd:0.5,terr:'beach',width:16});
  if(rc.track==='indy')c.terr='brick';
  if(rc.track==='board'){c.terr='board';c.banked=true;}
  if(rc.track==='brooklands'){c.terr='concrete';c.banked=true;}
  if(rc.track==='monza')Object.assign(c,{curvy:0.35,len:1800});
  if(rc.track==='nurb')Object.assign(c,{curvy:0.95,hilly:0.9,len:1900,host:'de'});
  if(rc.track==='monaco')Object.assign(c,{curvy:1,hilly:0.25,town:true,crowd:0.7,len:1100,width:8,terr:'asphalt',host:'mc'});
  if(rc.track==='lemans')Object.assign(c,{curvy:0.35,len:1700});
  if(rc.track==='targa')Object.assign(c,{curvy:1,hilly:0.9,terr:'mount',host:'it'});
  if(rc.crowd)c.crowd=0.7;
  if(rc.terr){c.terr=rc.terr;if(c.stages)c.stages=[rc.terr,'mud',rc.terr];}
  if(!SCEN_SETS[c.host])c.host='fr';
  return c;
}
/* ---------- track generation ---------- */
function buildTrack(rc,vref){
  // длина под время заезда: 3–4 минуты игрового времени (подъём в гору и спринт — короче)
  const cfg=trackCfg(rc);if(vref){const dur={road:205,circuit:215,endurance:245,hill:175,rally:220,oval:185,sprint:65}[rc.t]||200,total=dur*vref*0.62;cfg.len=clamp(cfg.closed?total/cfg.laps:total+200,cfg.closed?800:700,cfg.closed?3800:9000);if(cfg.sprint)cfg.len=clamp(vref*62,700,2600);cfg.dur=dur;}
  const rnd=mulberry32(hashStr(rc.key)),STEP=4;let pts=[];
  if(cfg.closed){
    const fine=[];const M=3000;
    if(cfg.oval){const Rr=cfg.len*0.11,Ls=(cfg.len-2*Math.PI*Rr)/2;
      for(let i=0;i<M;i++){const u=i/M*cfg.len;let x,z;
        if(u<Ls){x=Rr;z=-Ls/2+u;}else if(u<Ls+Math.PI*Rr){const a=(u-Ls)/Rr;x=Rr*Math.cos(a);z=Ls/2+Rr*Math.sin(a);}
        else if(u<2*Ls+Math.PI*Rr){x=-Rr;z=Ls/2-(u-Ls-Math.PI*Rr);}else{const a=(u-2*Ls-Math.PI*Rr)/Rr;x=-Rr*Math.cos(a);z=-Ls/2-Rr*Math.sin(a);}
        fine.push([x,0,z]);}}
    else{const R0=cfg.len/(2*Math.PI),H=[];let sum=0;for(let k=2;k<=5;k++){const a=rnd()*0.13*cfg.curvy*(k<4?1:0.6);sum+=a;H.push([k,a,rnd()*6.28]);}
      const sc=sum>0.38?0.38/sum:1,Hy=[[1,rnd()*6.28],[2,rnd()*6.28],[3,rnd()*6.28]];
      for(let i=0;i<M;i++){const th=i/M*Math.PI*2;let r=1;H.forEach(([k,a,ph])=>r+=a*sc*Math.cos(k*th+ph));r*=R0;
        let y=0;Hy.forEach(([k,ph],j)=>y+=Math.sin(k*th+ph)*cfg.hilly*(9-j*2.5));fine.push([Math.cos(th)*r,y,Math.sin(th)*r]);}}
    const cum=[0];for(let i=1;i<=M;i++){const a=fine[i-1],b=fine[i%M];cum.push(cum[i-1]+Math.hypot(b[0]-a[0],b[2]-a[2]));}
    const L=cum[M],n=Math.floor(L/STEP);let j=0;
    for(let i=0;i<n;i++){const d=i*L/n;while(cum[j+1]<d)j++;const t=(d-cum[j])/(cum[j+1]-cum[j]||1),a=fine[j],b=fine[(j+1)%M];pts.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]);}
  }else{
    let x=0,y=0,z=0,h=0,slope=0;const push=()=>pts.push([x,y,z]);push();
    const straight=len=>{for(let d=0;d<len;d+=STEP){x+=Math.sin(h)*STEP;z+=Math.cos(h)*STEP;y+=slope*STEP;push();}};
    const arc=(R,ang)=>{const n=Math.max(2,Math.round(Math.abs(ang)*R/STEP)),da=ang/n;for(let i=0;i<n;i++){h+=da;x+=Math.sin(h)*STEP;z+=Math.cos(h)*STEP;y+=slope*STEP;push();}};
    // дорога не должна пересекать себя и подходить к своему же участку ближе, чем позволяет склон между ними
    // (иначе земля верхней петли накрывает нижнюю — дороги не видно); ножки одной шпильки — можно
    const gap=cfg.width+26,clash=s0=>{const n0=pts.length,lim=n0-31;if(lim<=0)return null;const C=40,Gd=new Map();
      for(let j=0;j<lim;j++){const q=pts[j],k=Math.floor(q[0]/C)*100003+Math.floor(q[2]/C);let L=Gd.get(k);if(!L)Gd.set(k,L=[]);L.push(j);}
      for(let i=Math.max(s0,31);i<n0;i++){const p=pts[i],cx=Math.floor(p[0]/C),cz=Math.floor(p[2]/C);
        for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++){const L=Gd.get((cx+a)*100003+cz+b);if(!L)continue;
          for(const j of L){if(j>=i-30)continue;const q=pts[j],dx=p[0]-q[0],dz=p[2]-q[2],g=gap+0.5*Math.min(60,Math.abs(p[1]-q[1]));if(dx*dx+dz*dz<g*g)return q;}}}
      return null;};
    const seg=()=>{slope=cfg.uphill?0.06+rnd()*0.05:(rnd()*2-1)*0.05*cfg.hilly;
      if(cfg.sprint){straight(200);return;}
      const r=rnd(),dir=rnd()<0.5?-1:1;
      if(r<0.35-cfg.curvy*0.2)straight(40+rnd()*160);
      else if(r<0.35+cfg.curvy*0.25){arc(12+rnd()*18,dir*(1.6+rnd()*1.3));straight(20+rnd()*30);}
      else arc(40+rnd()*160,dir*(0.4+rnd()*1.1));
      if(Math.abs(h)>1.75){arc(60,-Math.sign(h)*0.9);}};
    straight(120);
    // участок упёрся в старую дорогу — 8 попыток по-другому, потом шаг назад (отменить прошлый участок)
    const stack=[];let budget=160;
    for(;;){const sv=[x,y,z,h,pts.length];let ok=false;
      if(pts.length*STEP>=cfg.len-160){// финишная прямая (можно с поворотом перед ней)
        for(const a of [0,0.5,-0.5,1,-1]){[x,y,z,h]=sv;pts.length=sv[4];slope=cfg.uphill?0.03:0;if(a)arc(70,a);straight(a?160:200);if(!clash(sv[4])){ok=true;break;}}
        if(ok||budget--<=0||!stack.length)break;
      }else{
        for(let tr=0;tr<8;tr++){if(tr){[x,y,z,h]=sv;pts.length=sv[4];}seg();if(!clash(sv[4])){ok=true;break;}}
        if(ok){stack.push(sv);continue;}
        if(budget--<=0||!stack.length){stack.push(sv);continue;}
      }
      const pv=stack.pop();[x,y,z,h]=pv;pts.length=pv[4];}
  }
  const n=pts.length,closed=cfg.closed,T=[],N=[],K=[];
  for(let i=0;i<n;i++){const a=pts[closed?(i-1+n)%n:Math.max(0,i-1)],b=pts[closed?(i+1)%n:Math.min(n-1,i+1)];let tx=b[0]-a[0],tz=b[2]-a[2];const l=Math.hypot(tx,tz)||1;T.push([tx/l,tz/l]);N.push([-tz/l,tx/l]);}
  for(let i=0;i<n;i++){const a=T[closed?(i-1+n)%n:Math.max(0,i-1)],b=T[closed?(i+1)%n:Math.min(n-1,i+1)];const cr=a[0]*b[1]-a[1]*b[0],dt=a[0]*b[0]+a[1]*b[1];K.push(Math.atan2(cr,dt)/(2*STEP));}
  const W=cfg.width,terrAt=i=>cfg.stages?cfg.stages[Math.min(2,Math.floor(i/n*3))]:cfg.terr;
  const trk={pts,T,N,K,n,step:STEP,closed,len:n*STEP,W,cfg,terrAt,col:[],grid:{},rc,spr:[],bar:[]};
  trk.startIdx=closed?0:30;trk.finishIdx=closed?0:n-40;
  trk.raceLen=closed?cfg.laps*trk.len:(trk.finishIdx-trk.startIdx)*STEP;
  trk.cgrid={};for(let i=0;i<n;i+=2){const k=Math.floor(pts[i][0]/30)+','+Math.floor(pts[i][2]/30);(trk.cgrid[k]=trk.cgrid[k]||[]).push(i);}
  placeScenery(trk,rnd);
  return trk;
}
// Ближе ли точка к оси дороги, чем rad (по отрезкам между точками трассы); skip — не смотреть ±8 точек вокруг своей
function nearTrack(trk,x,z,rad,skip){const cx=Math.floor(x/30),cz=Math.floor(z/30),n=trk.n,P=trk.pts;
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const L=trk.cgrid[(cx+a)+','+(cz+b)];if(!L)continue;
    for(const i of L){if(skip!==undefined&&Math.abs(i-skip)<8)continue;for(const j of [i-1,i]){const j0=trk.closed?(j+n)%n:j,j1=trk.closed?(j+1)%n:j+1;if(j0<0||j1>=n)continue;
      const A=P[j0],B=P[j1],dx=B[0]-A[0],dz=B[2]-A[2],l2=dx*dx+dz*dz||1;let t=((x-A[0])*dx+(z-A[2])*dz)/l2;t=t<0?0:t>1?1:t;const qx=A[0]+dx*t-x,qz=A[2]+dz*t-z;if(qx*qx+qz*qz<rad*rad)return true;}}}
  return false;}
// Твёрдые предметы: круг (r) или прямоугольник [вдоль дороги, поперёк, сдвиг вдоль, сдвиг к дороге] — как у 3D-моделей
const SOLID={plane:{r:0.5},oak:{r:0.6},elm:{r:0.5},poplar:{r:0.32},cypress:{r:0.3},olive:{r:0.45},pine:{r:0.35},fir:{r:0.35},birch:{r:0.25},palm:{r:0.32},
  bush:{r:1.0},rock:{r:1.6},hay:{r:1.8},dune:{r:3.4},cliff:{box:[6.5,2.2]},fence:{box:[5,0.12]},wall:{box:[5,0.35]},hedge:{box:[5.8,0.8]},vine:{box:[5.5,0.5]},
  pole:{r:0.16},km:{r:0.3},sign:{r:0.14},gstone:{r:0.22},rgate:{r:0.2},rhut:{box:[2.2,1.8]},lamp:{r:0.16},cart:{box:[2.8,0.95,-0.35]},billboard:{box:[4,0.25]},verst:{r:0.2},well:{r:0.8},stog:{r:1.7},fence_ru:{box:[5,0.12]},cactus:{r:0.9},agave:{r:0.7},
  house_fr:{box:[4.5,3.5]},farm_fr:{box:[5.5,3.25]},house_it:{box:[4,3.5]},fachwerk:{box:[4,3.5]},cottage:{box:[4,3]},pub:{box:[4,3.1]},farm_us:{box:[5,4.5,0,1]},barn:{box:[6,4]},izba:{box:[3.9,4.05,0,0.75]},
  church_ru:{box:[12.4,4.6,-4,0.2]},mill_ru:{box:[2.2,2]},campanile:{box:[2.9,2.9]},church_us:{box:[9,4.4,-0.6]},church_uk:{box:[10.2,4.4,-0.8]},church_at:{box:[10.2,4.4,-0.8]},minaret:{box:[5.5,6.3,0,4.2]},house_ly:{box:[4.5,3.5]},cottage_ie:{box:[4.5,3.2]},windmill_us:{box:[2,3,0,-0.6]},
  villa:{box:[6,4]},cafe:{box:[4.5,4.45,0,0.95]},church:{box:[9.4,4,-1.7]},pits:{box:[7.5,2.5]},stand:{box:[8,3.4]},crowd:{box:[2.8,0.6,0,-0.45]},marsh:{r:0.3},gend:{r:0.3},photo:{r:0.6}};
// Препятствие у дороги: форма по типу, оси прямоугольника — вдоль дороги и к ней (как повёрнута 3D-модель)
function solidAt(trk,t,i,off){const S=SOLID[t];if(!S)return null;const p=trk.pts[i],nn=trk.N[i],tt=trk.T[i],x=p[0]+nn[0]*off,z=p[2]+nn[1]*off;
  if(S.r)return {x,z,r:S.r,kind:t};const sd=off>0?1:-1,ux=tt[0]*sd,uz=tt[1]*sd,vx=-nn[0]*sd,vz=-nn[1]*sd,[hu,hv,du,dv]=[S.box[0],S.box[1],S.box[2]||0,S.box[3]||0];
  return {x:x+ux*du+vx*dv,z:z+uz*du+vz*dv,r:Math.hypot(hu,hv),kind:t,box:{ux,uz,vx,vz,hu,hv}};}
// Не мешает ли предмет дороге: центр и углы дальше края дороги (с запасом)
function solidClear(trk,o){const W=trk.W,m=W/2+0.6;if(!o.box)return !nearTrack(trk,o.x,o.z,m+o.r);const b=o.box;
  for(const [a,c] of [[1,1],[1,-1],[-1,1],[-1,-1],[0,0],[1,0],[-1,0]]){const x=o.x+b.ux*b.hu*a+b.vx*b.hv*c,z=o.z+b.uz*b.hu*a+b.vz*b.hv*c;if(nearTrack(trk,x,z,m))return false;}return true;}
function addCollider(trk,x,z,r,kind,i,o){o=o||{x,z,r,kind};trk.col.push(o);if(!trk.segCol)trk.segCol=[];const n=trk.n,sp=Math.ceil((o.r||r)/trk.step)+2;for(let k=-sp;k<=sp;k++){const j=trk.closed?((i+k)%n+n)%n:i+k;if(j<0||j>=n)continue;(trk.segCol[j]=trk.segCol[j]||[]).push(o);}}
// Приметы знаменитых мест: модель, привязка (start, finish или доля трассы), вперёд по трассе (м), вбок от края дороги (м, + влево; 0 — поперёк дороги), с какого года
const LANDMARKS={
  pbp:[['eiffel','start',760,-95]],pmp:[['eiffel','start',740,90]],pap:[['eiffel','start',780,-100]],tdf:[['eiffel','start',740,95]],gb1900:[['eiffel','start',760,-90]],pb1901:[['eiffel','start',740,95]],pv1902:[['eiffel','start',770,-95]],
  brighton:[['bigben','start',300,-38]],thousand:[['bigben','start',310,40]],
  x87575:[['gate_spb','start',60,0],['kremlin','finish',110,-60]],x80901:[['kremlin','start',200,-60],['gate_spb','finish',-50,0]],
  x17567:[['church_ru',0.35,0,-60],['mill_ru',0.6,0,35]],x2844:[['church_ru',0.3,0,60]],peking:[['church_ru',0.5,0,-70]],
  turbie:[['trophy','finish',60,-45]],ventoux:[['observatory','finish',40,-24]],semmering:[['viaduct',0.4,0,-150]],
  gb1904:[['castle',0.3,0,-170]],kaiser:[['castle',0.45,0,180]],herkomer:[['castle',0.6,0,-190]],henry:[['castle',0.35,0,200]],nurb1927:[['castle',0.2,0,-160]],eifel:[['castle',0.2,0,-160]],degp:[['castle',0.2,0,-160]],
  indy:[['pagoda','start',40,24,1913]],avus1926:[['funkturm','start',560,-90]],monaco:[['casino','finish',70,16]],
  x22765:[['obelisk',0.35,0,-110]],gb1903:[['round_tower',0.4,0,-80],['round_tower',0.8,0,95]],x38768:[['minaret','start',130,-24]]};
// Размер пятна примет (м): тут не ставятся деревья и дома
const LM_R={eiffel:72,bigben:12,gate_spb:20,kremlin:40,church_ru:16,mill_ru:7,trophy:16,observatory:14,viaduct:72,castle:22,pagoda:11,funkturm:13,obelisk:15,round_tower:5,minaret:12,casino:24};
// Место приметы: поперёк дороги — в точке трассы; остальные — от привязки по прямой вперёд и вбок (видны со старта), фасадом к дороге
function landmarksOf(trk){const L=LANDMARKS[trk.rc.id]||[],n=trk.n,P=trk.pts,out=[];
  L.forEach(([t,at,fw,off,y0])=>{if(y0&&trk.rc.y<y0)return;const a0=at==='start'?trk.startIdx:at==='finish'?trk.finishIdx:Math.round(at*(n-1)),wrap=i=>trk.closed?((i%n)+n)%n:clamp(i,2,n-3);
    if(!off){const i=wrap(a0+Math.round(fw/trk.step)),p=P[i];out.push({t,i,off:0,x:p[0],z:p[2],r:LM_R[t]||12});return;}
    const a=wrap(a0),p=P[a],tt=trk.T[a],nn=trk.N[a],R=LM_R[t]||12,need=R+trk.W/2+6;
    // другая часть трассы рядом — пробуем по другую сторону, дальше или ближе вдоль
    for(const [kf,ko] of [[1,1],[1,-1],[1,1.5],[1,-1.5],[0.7,1],[1.3,1],[0.7,-1],[1.3,-1],[1,2],[1,-2],[0.5,2.5],[0.5,-2.5]]){
      const o=Math.sign(off)*ko*(trk.W/2+Math.abs(off)),x=p[0]+tt[0]*fw*kf+nn[0]*o,z=p[2]+tt[1]*fw*kf+nn[1]*o;
      let bi=0,bd=1e18;for(let k=0;k<n;k++){const d=(P[k][0]-x)**2+(P[k][2]-z)**2;if(d<bd){bd=d;bi=k;}}
      if(Math.sqrt(bd)<need)continue;const dx=P[bi][0]-x,dz=P[bi][2]-z;out.push({t,i:bi,off:Math.sqrt(bd)*Math.sign(o),x,z,rot:Math.atan2(-dz,dx),r:R,world:1});break;}});
  return out;}
// Декорации вдоль трассы: t — тип спрайта, off — смещение от оси (м, + влево), v — вариант
function placeScenery(trk,rnd){
  const {n,W,cfg,pts,N}=trk,set=SCEN_SETS[cfg.host],spr=trk.spr;trk.town=new Uint8Array(n);for(let i=0;i<n;i++){spr.push([]);trk.bar.push(null);}
  const LMs=trk.lm=landmarksOf(trk);
  const add=(i,t,off,v,kind,colR)=>{i=((i%n)+n)%n;const p=pts[i],nn=N[i],x=p[0]+nn[0]*off,z=p[2]+nn[1]*off;
    if(LMs.length&&LMs.some(q=>Math.hypot(x-q.x,z-q.z)<q.r+2))return false;
    const o=solidAt(trk,t,i,off);if(o?!solidClear(trk,o):(Math.abs(off)>W/2+1&&nearTrack(trk,x,z,W/2+1.5,i)))return false;
    spr[i].push({t,off,v:v||0,k:kind||'s'});if(o)addCollider(trk,o.x,o.z,o.r,t,i,o);else if(colR)addCollider(trk,x,z,colR,t,i);return true;};
  const sharp=i=>Math.abs(trk.K[((i%n)+n)%n])>1/40;
  planRoute(trk,rnd);const S=trk.segT;
  const townAt=i=>cfg.town&&!cfg.oval&&S[i]===RSEG.town;
  // ограды у сёл и полей — как принято в стране
  const fenceT={uk:'hedge',ie:'wall',fr:'wall',it:'wall',es:'wall',mc:'wall',ly:'wall',ru:'fence_ru',other:'fence_ru'}[cfg.host]||'fence';
  const forestT=(set.mount||cfg.terr==='mount'||cfg.uphill)?['fir','fir','pine','birch']:set.trees.filter(t=>t!=='palm'&&t!=='olive'&&t!=='cactus');
  let alley=0,church=0;
  for(let i=0;i<n;i++){
    const tr=trk.terrAt(i),town=townAt(i)||(trk.rc.track==='monaco');if(town)trk.town[i]=1;const sg=S[i];
    if(cfg.oval){if(i%5===0&&(i%150)<75){add(i,'stand',-(W/2+10),0,'s',0);}if(i%7===3)add(i,'fence',W/2+2,0);if(i%9===0&&rnd()<0.6)add(i,rnd()<0.5?'elm':'oak',W/2+14+rnd()*10,0,'s',0.6);continue;}
    if(tr==='beach'){trk.bar[i]={L:W/2+11};if(i%3===0)add(i,'sea',W/2+14,0);if(i%9===0)add(i,'dune',-(W/2+12+rnd()*8));if(i%11===0&&rnd()<cfg.crowd)add(i,'crowd',-(W/2+4),Math.floor(rnd()*4),'p');continue;}
    if(town){
      trk.bar[i]={L:W/2+2.2,R:W/2+2.2};
      if(i%4===0){[-1,1].forEach(sd=>{const t=set.town[Math.floor(rnd()*set.town.length)];add(i,t,sd*(W/2+7+rnd()*1.5),Math.floor(rnd()*3),'s',3.5);});}
      if(i%150===34)add(i,set.church||'church',-(W/2+9),Math.floor(rnd()*3),'s',4);
      if(set.verst&&i%150===20)add(i,rnd()<0.5?'well':'stog',(rnd()<0.5?-1:1)*(W/2+11),0,'s');
      if(i%6===2)add(i,'lamp',(i%12===2?1:-1)*(W/2+1.8),0,'s',0.25);
      if(rnd()<0.25+cfg.crowd*0.3)add(i,'crowd',(rnd()<0.5?-1:1)*(W/2+2.8),Math.floor(rnd()*4),'p');
      if(i%37===0)add(i,'gend',(rnd()<0.5?-1:1)*(W/2+2.2),0,'p');
      if(i%53===7)add(i,'cart',(rnd()<0.5?-1:1)*(W/2+3.5),0,'s',1.2);
      continue;}
    const tree=(off,kind,v)=>add(i,kind||set.trees[Math.floor(rnd()*set.trees.length)],off,v===undefined?Math.floor(rnd()*3)+(tr==='snow'?1:0):v,'s',Math.abs(off)<W/2+10?0.55:0);
    if(sg===RSEG.bridge){trk.bar[i]={L:W/2+0.55,R:W/2+0.55};continue;}
    if(sg===RSEG.rail){const rl=trk.rails.find(q=>Math.abs(q.i-i)<2);if(rl&&rl.i===i){[1,-1].forEach(sd=>{add(i-2*sd,'rgate',sd*(W/2+1.2),sd>0?0:1,'s',0.2);});add(i+3,'rhut',W/2+9,0,'s',2.5);}continue;}
    // аллеи: ровные ряды деревьев вдоль дороги
    if(sg===RSEG.avenue){if(i%4===0){add(i,set.alley,W/2+2.6,Math.floor(rnd()*3),'s',0.55);add(i,set.alley,-(W/2+2.6),Math.floor(rnd()*3),'s',0.55);}}
    else if(sg===RSEG.forest){// лес у самой дороги: густо с обеих сторон
      for(let k=0;k<3;k++)if(rnd()<0.62){const sd=rnd()<0.5?-1:1,off=sd*(W/2+3.2+Math.pow(rnd(),1.3)*18);tree(off,tr==='snow'?'fir':forestT[Math.floor(rnd()*forestT.length)]);}
      if(rnd()<0.18)add(i,'bush',(rnd()<0.5?-1:1)*(W/2+2.4+rnd()*3),Math.floor(rnd()*3),'s',0);}
    else if(sg===RSEG.village){// село: дома вдоль дороги, перед ними ограды, за ними сады
      const sd=(Math.floor(i/7)%2)?1:-1;
      if(i%7===0&&rnd()<0.85){add(i,set.houses[Math.floor(rnd()*set.houses.length)],sd*(W/2+10+rnd()*3),Math.floor(rnd()*3),'s',0);if(rnd()<0.6)tree(sd*(W/2+21+rnd()*6));}
      if(i%3===0&&(i%7)<5)add(i,fenceT,sd*(W/2+3.4),0,'s',0.4);
      if(i%29===9&&rnd()<0.6)add(i,rnd()<0.5?'cart':set.verst?'well':'bush',-sd*(W/2+4+rnd()*3),0,'s',1.2);
      if(!church&&S[i-20]===RSEG.village&&S[i+20]===RSEG.village&&rnd()<0.08){church=1;add(i,set.church||'church',-sd*(W/2+12),Math.floor(rnd()*3),'s',4);}
      if(rnd()<0.08+cfg.crowd*0.2)add(i,'crowd',(rnd()<0.5?-1:1)*(W/2+3.2),Math.floor(rnd()*4),'p');}
    else if(sg===RSEG.vine){// виноградники: ряды вдоль дороги
      if(i%3===0)[1,-1].forEach(sd=>{for(let k=0;k<5;k++)add(i,'vine',sd*(W/2+5+k*2.6),0,'s',0);});if(i%40===11&&rnd()<0.6)tree((rnd()<0.5?-1:1)*(W/2+22),cfg.host==='it'||cfg.host==='es'?'cypress':'oak');}
    else if(sg===RSEG.serp){// серпантин: у обрыва — столбики-отбойники, у скалы — камни
      const bend=trk.K[i]>0?1:-1;if(i%2===0)add(i,'gstone',-bend*(W/2+1.1),0,'s',0.18);if(i%9===0&&rnd()<0.5)add(i,'rock',bend*(W/2+4+rnd()*3),Math.floor(rnd()*3),'s',1.2);
      if(i%13===0&&rnd()<0.5)tree(bend*(W/2+6+rnd()*10),rnd()<0.6?'fir':'pine');}
    else if(sg===RSEG.coast){const c=trk.coast.find(q=>i>=q.i0&&i<=q.i1),sd=c?c.side:1;// у моря: низкая стена над водой, со стороны суши — сосны, пальмы, виллы
      if(i%3===0)add(i,'wall',sd*(W/2+1.5),0,'s',0.4);if(rnd()<0.2)tree(-sd*(W/2+4+rnd()*14),set.trees.includes('palm')?(rnd()<0.5?'palm':'pine'):rnd()<0.5?'pine':set.trees[0]);
      if(i%41===17&&rnd()<0.6)add(i,set.houses[Math.floor(rnd()*set.houses.length)],-sd*(W/2+14+rnd()*8),Math.floor(rnd()*3),'s',0);}
    else{// поля: редкие деревья, стога, хутора, ограды кусками
      if(rnd()<(tr==='sand'?0.06:0.1)){const sd=rnd()<0.5?-1:1;tree(sd*(W/2+3.5+Math.pow(rnd(),1.4)*40),tr==='snow'?'fir':tr==='mount'&&set.mount&&rnd()<0.45?'rock':undefined);}
      if(i%17===5&&rnd()<0.45&&tr!=='snow'&&tr!=='sand')add(i,set.verst||cfg.host==='de'||cfg.host==='at'?'stog':'hay',(rnd()<0.5?-1:1)*(W/2+16+rnd()*26),0,'s',1.8);
      if(i%47===11&&rnd()<0.7){const sd=rnd()<0.5?-1:1;add(i,set.houses[Math.floor(rnd()*set.houses.length)],sd*(W/2+18+rnd()*18),Math.floor(rnd()*3),'s',0);}
      if(Math.floor(i/60)%3===1&&i%3===0)add(i,fenceT,(Math.floor(i/180)%2?1:-1)*(W/2+2.2),0,'s',0.4);}
    if(i%31===5&&rnd()<0.5&&sg!==RSEG.forest&&sg!==RSEG.serp){const e=set.extra[Math.floor(rnd()*set.extra.length)];const near=e==='km'||e==='wall'||e==='hedge'||e==='fence';add(i,e,(rnd()<0.5?-1:1)*(near?W/2+1.6:W/2+6+rnd()*10),Math.floor(rnd()*4),'s',near?0.4:0);}
    if(i%50===0&&set.extra.includes('km'))add(i,'km',-(W/2+1.3),0,'s',0.25);
    if(set.verst&&i%60===7)add(i,'verst',-(W/2+1.5),0,'s');
    if(i%12===0&&tr!=='sand'&&!cfg.sprint)add(i,'pole',W/2+3,0,'s',0.3);
    if((tr==='mount'||cfg.uphill)&&i%10===0&&set.mount&&sg!==RSEG.serp)add(i,'cliff',(i%20===0?1:-1)*(W/2+9),0,'s',0);
    // зрители, маршалы, фотографы — у поворотов и на старте
    if(sharp(i)&&rnd()<cfg.crowd*0.9){const sd=trk.K[i]>0?-1:1;add(i,'crowd',sd*(W/2+4+rnd()*2),Math.floor(rnd()*4),'p');if(rnd()<0.25)add(i,'marsh',sd*(W/2+2.2),Math.floor(rnd()*2),'p');if(rnd()<0.08)add(i,'photo',sd*(W/2+3),0,'p');}
    else if(rnd()<cfg.crowd*0.06)add(i,'crowd',(rnd()<0.5?-1:1)*(W/2+4),Math.floor(rnd()*4),'p');
    // знак перед крутым поворотом
    const ah=i+14;if((cfg.closed||ah<n)&&Math.abs(trk.K[ah%n])>1/45&&Math.abs(trk.K[i])<1/200&&i%4===0){const sd=trk.K[ah%n]>0?-1:1;add(i,'sign',sd*(W/2+2.4),trk.K[ah%n]>0?0:1,'s',0.3);}
  }
  // деревья по берегам рек (ивы и тополя у воды)
  (trk.rivers||[]).forEach(rv=>{const L=riverLine(trk,rv);for(let q=-26;q<=26;q++){if(Math.abs(q)<3)continue;const s0=q*9+(rnd()-0.5)*5;[1,-1].forEach(sd=>{if(rnd()<0.45)return;
      const m=Math.sin(s0/170+rv.ph)*22*sstep(20,120,Math.abs(s0))+Math.sin(s0/61+rv.ph*2)*6*sstep(20,120,Math.abs(s0)),e=m+sd*(rv.w/2+4+rnd()*6),x=L.p[0]+L.d[0]*s0+L.t[0]*e,z=L.p[2]+L.d[1]*s0+L.t[1]*e;
      let bi=rv.i,bd=1e18;for(let k=Math.max(0,rv.i-60);k<Math.min(n,rv.i+60);k++){const d=(pts[k][0]-x)**2+(pts[k][2]-z)**2;if(d<bd){bd=d;bi=k;}}if(Math.sqrt(bd)<W/2+6)return;
      spr[bi].push({t:rnd()<0.5?'poplar':set.trees.includes('birch')?'birch':'elm',off:0,v:Math.floor(rnd()*3),k:'W',wx:x,wz:z,rot:rnd()*6});});}});
  // старт, финиш, трибуны, боксы
  const fi=trk.finishIdx;spr[fi].push({t:'banner',off:0,v:0,k:'s'});[1,-1].forEach(sd=>{const p=pts[fi],nn=N[fi];addCollider(trk,p[0]+nn[0]*sd*(W/2+1.4),p[2]+nn[1]*sd*(W/2+1.4),0.2,'post',fi);});
  if(!cfg.closed){const si=Math.min(n-1,trk.startIdx+1);[1,-1].forEach(sd=>{const p=pts[si],nn=N[si];addCollider(trk,p[0]+nn[0]*sd*(W/2+1.4),p[2]+nn[1]*sd*(W/2+1.4),0.2,'post',si);});}
  if(cfg.closed||cfg.crowd>0.3){[-9,-4,1].forEach(k=>{const i=((fi+k)%n+n)%n;spr[i].push({t:'stand',off:-(W/2+9),v:0,k:'s'});});for(let k=-8;k<=4;k+=2){const i=((fi+k)%n+n)%n;spr[i].push({t:'crowd',off:W/2+3.5,v:Math.abs(k)%4,k:'p'});}}
  if(cfg.pits){const pi=(n-18)%n;spr[pi].push({t:'pits',off:W/2+8,v:0,k:'s'});}
  // приметы места: большие — вдали, без столкновений; ворота поперёк дороги — колонны твёрдые
  LMs.forEach(q=>{spr[q.i].push(q.world?{t:q.t,off:q.off,v:0,k:'L',wx:q.x,wz:q.z,rot:q.rot}:{t:q.t,off:q.off,v:0,k:'L'});const p=pts[q.i],nn=N[q.i],tt=trk.T[q.i];
    if(q.t==='gate_spb')[6.6,11,15.4].forEach(x=>[-1,1].forEach(sx=>[-2.3,2.3].forEach(zz=>addCollider(trk,p[0]+nn[0]*sx*x+tt[0]*zz,p[2]+nn[1]*sx*x+tt[1]*zz,1.05,'gate',q.i))));
    else if(Math.abs(q.off)<70)addCollider(trk,q.x,q.z,Math.min(q.r*0.55,Math.abs(q.off)-W/2-1.5),q.t,q.i);});
}
/* ---------- машина в гонке ---------- */
// Машина в гонке. Все поля заданы сразу в одном порядке: у всех машин одна «форма» объекта — расчёт быстрее
class RaceCar{constructor(e){
  this.you=!!e.you;this.player=!!e.player;this.name=e.name||'';this.label=e.label||'';this.drvName=e.drvName||'';this.drvId=e.drvId||null;this.sk=e.sk||0.8;
  this.md=e.md;this.prep=e.prep||0;this.tyreType=e.tyre||'hard';this.gearSet=e.gear||0;this.color=e.color||'#333';this.num=e.num||0;this.pw=e.pw||1;this.relK=e.relK||1;this.pitK=e.pitK||1;this.tc=e.tc||'';this.priv=!!e.priv;this.pmy=e.pmy||0;this.spec=!!e.spec;
  this.st=null;this.m=0;this.P=0;this.kd=0;this.crr=0;this.vtop=0;this.gr=null;this.brakeK=0;this.grip=1;this.wearK=1;this.rel=0.8;this.L=2.5;this.a=0;this.b=0;this.h=0.7;this.Iz=1;
  this.x=0;this.z=0;this.y=0;this.gy=0;this.yaw=0;this.vx=0;this.vy=0;this.r=0;this.delta=0;this.gear=1;this.rpm=0;this.shift=0;this.thr=0;this.brk=0;this.steer=0;
  this.idx=0;this.lat=0;this.segT=0;this.lap=0;this.prog=0;this.fin=null;this.lapSeen=-9;this.q=0;this.lane=0;this.laneT=undefined;this.follow=null;
  this.heat=0;this.tyre=0;this.fuel=100;this.eng=0;this.dmg=0;this.punct=false;this.punctN=0;this.dnf=null;this.stopT=0;this.stopWhy='';this.pitT=0;this.order='norm';this.pitCall=false;
  this.slipR=0;this.slipF=0;this.gu=0;this.spinw=0;this.off=0;this.stuck=0;this.lastIdx=0;this.overheat=0;this.limp=false;this.fix=0;this.draft=0;this.hit=0;this.err=0;this.st2=0;this.parked=0;this.outT=0;
  this.tyreRate=0;this.punctRate=0;this.fuelRate=0;this.wheelChange=0;this.style='';this.wheel='';this.mech=false;this.spriteKey='';this.spec3=null;this.angI=0;this.angN=false;this.hold=0;this.punctSaid=0;this.skidSaid=0;this.fuelSaid=0;
  this.svc=0;this.svcT=0;this.svcWhat='';this.offIdx=-1;this.offProg=0;this.offDist=0;this.offLap=0;this.grade=0;}}
function mkRaceCar(e,y,trk){
  const st=carStats(e.md,e.prep,y),terr=TERR[trk.cfg.terr]||TERR.dirt,c=new RaceCar(e);
  const m=st.kg,P=st.P*(e.pw||1),kd=st.kd,crr=st.crr*(terr.crr||1);
  let v=20;for(let i=0;i<30;i++){const f=kd*v*v*v+crr*m*GRAV*v-P,df=3*kd*v*v+crr*m*GRAV;v=Math.max(3,v-f/df);}
  const ng=y<1905?3:4,L=st.wb;
  c.st=st;c.m=m;c.P=P;c.kd=kd;c.crr=crr;c.vtop=v;c.gr=(ng===3?[0.42,0.7,1.02]:[0.3,0.52,0.76,1.02]).map(g=>g*v*(1+(e.gear||0)*0.06));
  c.brakeK=st.brk;c.grip=st.grip*(e.tyre==='soft'?1.07:0.96);c.wearK=e.tyre==='soft'?1.25:0.8;c.rel=clamp(st.rel*(e.relK||1),0.3,0.995);
  c.L=L;c.a=L*0.46;c.b=L*0.54;c.h=st.cg;c.Iz=m*(L*L+1.9)/12*1.4;
  return c;
}
function trackLocal(trk,c){
  const {pts,n,closed}=trk;let best=c.idx,bd=1e18;
  const win=(k0,k1)=>{for(let k=k0;k<=k1;k++){let i=c.idx+k;if(closed)i=(i+n)%n;else if(i<0||i>=n)continue;const p=pts[i],d=(p[0]-c.x)**2+(p[2]-c.z)**2;if(d<bd){bd=d;best=i;}}};
  win(-5,5);if(Math.abs(best-c.idx)>=5&&Math.abs(best-c.idx)<n-5)win(-14,14);
  if(bd>900){for(let i=0;i<n;i+=3){const p=pts[i],d=(p[0]-c.x)**2+(p[2]-c.z)**2;if(d<bd){bd=d;best=i;}}}
  const p=pts[best],nn=trk.N[best],t=trk.T[best],lat=(c.x-p[0])*nn[0]+(c.z-p[2])*nn[1];
  if(closed){const di=best-c.idx;if(di<-n/2)c.lap++;else if(di>n/2)c.lap--;}
  c.idx=best;c.lat=lat;c.gy=p[1];c.segT=clamp(((c.x-p[0])*t[0]+(c.z-p[2])*t[1])/trk.step,-0.5,0.5);
  c.prog=closed?c.lap*trk.len+(best+c.segT)*trk.step:(best+c.segT-trk.startIdx)*trk.step;
  return lat;
}
// Уклон под машиной вдоль её курса (подъём на метр пути): на дороге — по высоте трассы, за обочиной — по земле 3D-мира
function gradeAt(c,trk,lat){const n=trk.n,i=c.idx,P=trk.pts,a=P[trk.closed?(i-1+n)%n:Math.max(0,i-1)],b=P[trk.closed?(i+1)%n:Math.min(n-1,i+1)];
  const t=trk.T[i],fx=Math.sin(c.yaw),fz=Math.cos(c.yaw);let g=(b[1]-a[1])/(2*trk.step)*(fx*t[0]+fz*t[1]);
  const e=Math.abs(lat)-trk.W/2-1.5;
  if(e>0&&typeof R3!=='undefined'&&R3.on&&R3.F&&R3.T===trk){const w=Math.min(1,e/10),d=2,gt=(fH(c.x+fx*d,c.z+fz*d)-fH(c.x-fx*d,c.z-fz*d))/(2*d);g+=(gt-g)*w;}
  return clamp(g,-0.9,0.9);}
// Сервис у обочины (кнопка 🔧): машина тормозит до остановки, механик меняет шины, доливает бензин, подтягивает поломки
// Прокол у самого финиша: доехать на спущенном колесе быстрее, чем остановиться и менять
function flatRun(c,T){const rem=Math.max(0,T.raceLen-c.prog),vF=Math.max(6,c.vtop*0.45),vN=Math.max(8,c.vtop*0.75);return rem/vF-rem/vN<(c.wheelChange||8)+8;}
// Сколько бензина нужно до финиша (в процентах бака, при обычном газе)
function fuelNeed(c,T){return c.fuelRate?Math.max(0,T.raceLen-c.prog)*c.fuelRate*0.85:0;}
function svcNeed(c){return {tyre:c.punct||c.tyre>20,fuel:!!c.fuelRate&&c.fuel<92,dmg:c.dmg>15||!!c.limp};}
function svcPlan(c){const T=R.trk,need=svcNeed(c),what=[];let t=2.5;
  if(need.tyre){t+=c.wheelChange*(c.punct&&c.tyre<60?1:1.8);what.push('шины');}
  if(need.fuel){t+=1+(100-c.fuel)*0.05;what.push('бензин');}
  if(need.dmg){t+=Math.min(8,c.dmg*0.08);what.push('ремонт');}
  // у боксов на кольце — своя бригада: вдвое быстрее, чем на обочине
  const pit=!!(T.cfg.pits&&T.closed&&(((T.n-c.idx)%T.n)*T.step<70||c.idx*T.step<20));
  return {t:t*(pit?0.6:1)*(c.pitK||1),what,pit};}
function svcDone(c){const need=svcNeed(c);if(need.tyre){c.tyre=0;c.punct=false;}if(need.fuel)c.fuel=100;if(need.dmg){c.dmg=Math.round(c.dmg*0.35);c.limp=false;}c.heat=Math.min(c.heat,45);c.overheat=0;c.fix=0;}
function playerService(c,dt){
  if(c.fuelRate&&c.fuel<=0&&!c.svc&&!(c.pitT>0)){c.svc=1;rMsg('БЕНЗИН КОНЧИЛСЯ — ДОЛЬЁМ ИЗ КАНИСТРЫ',2.6);}
  if(c.punct&&c.vx<1.2&&!c.svc&&!(c.pitT>0)&&!c.flat)c.svc=1;
  if(c.svc===1){c.thr=0;c.brk=1;if(Math.abs(c.vx)<0.6){const S=svcPlan(c);c.svc=2;c.svcT=S.t;c.svcWhat=S.what.join(', ')||'осмотр';rMsg((S.pit?'БОКСЫ: ':'МЕХАНИК: ')+c.svcWhat,1.8);}}
  else if(c.svc===2){c.thr=0;c.brk=1;c.svcT-=dt;if(c.svcT<=0){svcDone(c);c.svc=0;rMsg('ГОТОВО! ПОЕХАЛИ',1.4);}}}
function carStep(c,trk,dt){
  const lat=trackLocal(trk,c),W=trk.W,tr=TERR[trk.terrAt(c.idx)]||TERR.dirt,bar=trk.bar[c.idx];
  let mu=tr.mu*c.grip*(1-0.3*Math.min(1,c.tyre/100))*(c.punct?0.72:1),crr=c.crr*(c.punct?3:1);
  const al=Math.abs(lat);c.off=al>W/2+1.2?1:0;
  if(al>W/2+1.2){mu*=0.6;crr=c.crr*4;}else if(al>W/2){mu*=0.85;crr=c.crr*1.6;}
  const stopped=c.stopT>0||c.pitT>0||c.svc===2||c.dnf||(c.punct&&!c.player&&!c.flat);
  const pw=c.P*(1-c.dmg/250)*(c.overheat>0?0.3:1)*(c.fuel<=0?0.1:1)*(c.draft?1.06:1)*(c.limp?0.65:1);
  const v=c.vx;
  let vg=c.gr[c.gear-1];c.rpm=Math.max(0.12,Math.abs(v)/vg);
  if(c.shift>0)c.shift-=dt;else{if(c.rpm>0.96&&c.gear<c.gr.length){c.gear++;c.shift=0.28;}else if(c.gear>1&&Math.abs(v)<c.gr[c.gear-2]*0.55){c.gear--;c.shift=0.2;}}
  vg=c.gr[c.gear-1];
  const Fzf=c.m*GRAV*c.b/c.L,Fzr=c.m*GRAV*c.a/c.L;
  let Fx=0;const thr=stopped?0:c.thr,brk=stopped?1:c.brk;
  if(brk>0.05&&v>0.3)Fx=-brk*c.brakeK*mu*c.m*GRAV;
  else if(brk>0.05&&v<=0.3&&!stopped){Fx=-brk*c.m*1.8;}
  else if(c.shift<=0&&v<vg*1.02){Fx=thr*pw/Math.max(v,2.2+0.22*vg);}
  if(v<0&&brk<0.05)Fx=Math.max(Fx,c.m*2);
  const Fxmax=mu*Fzr*0.98;let spin=0;if(Fx>Fxmax){spin=(Fx-Fxmax)/Fxmax;Fx=Fxmax+(Fx-Fxmax)*0.2;}
  // уклон: в гору машина теряет скорость, под гору разгоняется; крутой склон шинам не одолеть
  const grade=gradeAt(c,trk,lat);c.grade=grade;
  const drag=c.kd*v*Math.abs(v)+crr*c.m*GRAV*Math.sign(v)+c.m*GRAV*grade/Math.sqrt(1+grade*grade);
  const sp=Math.abs(v);
  if(sp<2.5){c.r=v*Math.tan(c.delta)/c.L;c.vy*=0.85;c.vx+=(Fx-drag)/c.m*dt;c.slipR=0;c.slipF=0;c.gu*=0.9;if(stopped&&Math.abs(c.vx)<0.4)c.vx=0;}
  else{
    const af=Math.atan2(c.vy+c.a*c.r,sp)-c.delta*Math.sign(v),ar=Math.atan2(c.vy-c.b*c.r,sp);
    const sat=(a,Fz,capK)=>{const x=PHY.tk*a;const f=Math.tanh(x)*(1-0.12*Math.min(1,Math.max(0,Math.abs(x)-1.6)/3));return -mu*Fz*capK*f;};
    const rearCap=Math.sqrt(Math.max(0.05,1-Math.pow(Math.min(1,Math.abs(Fx)/(mu*Fzr+1)),2)));
    const Fyf=sat(af,Fzf,1),Fyr=sat(ar,Fzr,1.15*rearCap*(1-Math.min(0.5,spin*0.5)));
    const cd=Math.cos(c.delta),sd=Math.sin(c.delta);
    const dvx=(Fx-Fyf*sd-drag)/c.m+c.vy*c.r,dvy=(Fyf*cd+Fyr)/c.m-c.vx*c.r,dr=(c.a*Fyf*cd-c.b*Fyr)/c.Iz;
    c.vx+=dvx*dt;c.vy+=dvy*dt;c.r+=dr*dt;c.r*=0.9995;c.slipR=Math.abs(ar);c.slipF=Math.abs(af);
    // сколько сцепления шин уже занято (1 — предел): боковая сила по углу увода + тяга или торможение
    const gl=Math.tanh(PHY.tk*Math.max(c.slipF,c.slipR)),gx=Math.min(1.3,Math.abs(Fx)/(mu*c.m*GRAV+1));c.gu+=(Math.min(1.5,Math.hypot(gl,gx)+spin*0.5)-c.gu)*Math.min(1,dt*20);
  }
  c.spinw=spin;
  // за обочиной — кочки, камни и канавы: на скорости бьют подвеску
  if(c.off&&sp>10)c.dmg=Math.min(100,c.dmg+(sp-10)*0.05*(tr.rough||1)*(al>W/2+6?1.5:1)*dt);
  if(Math.abs(c.vx)<0.05&&c.thr<0.05&&c.brk<0.05){c.vx=0;c.vy*=0.5;}
  c.yaw+=c.r*dt;
  const fx=Math.sin(c.yaw),fz=Math.cos(c.yaw),rx=Math.cos(c.yaw),rz=-Math.sin(c.yaw);
  c.x+=(fx*c.vx+rx*c.vy)*dt;c.z+=(fz*c.vx+rz*c.vy)*dt;
  c.y+=((c.gy||0)-(c.y||0))*Math.min(1,dt*12);
  // износ: шины, топливо, мотор — по реальной дистанции гонки
  const dist=sp*dt,ord=c.order==='push'?1.25:c.order==='save'?0.8:1;
  c.tyre+=dist*c.tyreRate*(1+1.5*(c.slipR+c.slipF)+spin*0.8)*c.wearK*ord*(c.off?1.6:1);
  // прокол: свежая шина держит, стёртая лопается чаще; на первых километрах у города дорога хорошая
  const pr=c.punctRate*dist*(c.off?2:1)*(0.25+1.5*Math.min(1,c.tyre/100))*(c.prog<trk.raceLen*0.06?0:1);
  if(!c.punct&&(c.tyre>=100||Math.random()<pr)){c.punct=true;c.punctN=(c.punctN||0)+1;c.flat=flatRun(c,trk);}
  if(!c.punct)c.flat=false;else if(c.flat&&c.vx>2)c.dmg=Math.min(100,c.dmg+dt*0.8);
  if(c.fuelRate)c.fuel=Math.max(0,c.fuel-dist*c.fuelRate*(0.35+0.65*c.thr));
  // мотор: греется от нагрузки, остывает от встречного воздуха; медленный подъём на полном газу — перегрев
  const load=c.thr*(0.35+0.65*Math.min(1,c.rpm)),cool=0.55+0.45*Math.min(1,sp/20),heatT=15+62*load*(1.3-0.5*c.rel)*(c.order==='push'?1.25:c.order==='save'?0.85:1)/cool;
  c.heat+=(heatT-c.heat)*Math.min(1,dt/(heatT>c.heat?7:11));
  if(c.heat>=100){c.overheat=4;c.heat=60;}if(c.overheat>0)c.overheat-=dt;
  if(!c.dnf&&c.fin===null&&sp>3&&c.prog>trk.raceLen*0.08){const stress=1+1.5*Math.max(0,(c.heat-75)/25)+(c.order==='push'?0.4:c.order==='save'?-0.35:0)+c.dmg/100;
    const h=R.hz0*Math.pow((1-c.rel)/R.relRef,1.6)*stress;
    if(Math.random()<h*dt)carFailure(c);}
  // столкновения с декорациями и стенами домов: отскок поперёк, вдоль — скольжение с трением
  const L=trk.segCol&&trk.segCol[c.idx];
  // второй проход: удар разворачивает машину, и нос может задеть стену снова — выталкиваем ещё раз
  if(L)for(let ps=0;ps<2;ps++)for(const o of L){const dx=c.x-o.x,dz=c.z-o.z,rr=o.r+2.6;if(dx*dx+dz*dz>rr*rr)continue;obstacleHit(c,o);}
  if(bar){const lim=lat>0?bar.L:bar.R;if(lim&&Math.abs(lat)>lim){const nn=trk.N[c.idx],sg=Math.sign(lat),ex=Math.abs(lat)-lim;c.x-=nn[0]*sg*ex;c.z-=nn[1]*sg*ex;wallHit(c,-sg*nn[0],-sg*nn[1],0.2,1.1);}}
  // крутой склон горы — как стена: выше дороги по круче машина не въезжает, мягко скатывается назад
  if(c.off&&typeof R3!=='undefined'&&R3.on&&R3.F&&R3.T===trk){const e=1.2,h0=fH(c.x,c.z),gx=(fH(c.x+e,c.z)-fH(c.x-e,c.z))/(2*e),gz=(fH(c.x,c.z+e)-fH(c.x,c.z-e))/(2*e),sl=Math.hypot(gx,gz);
    if(sl>0.5&&h0>trk.pts[c.idx][1]+0.8){const ux=gx/sl,uz=gz/sl,k=Math.min(1,(sl-0.5)*2.5);c.x-=ux*0.04*k;c.z-=uz*0.04*k;wallHit(c,-ux,-uz,0.1,0.25);}}
}
// Машина — капсула вдоль курса (от заднего до переднего свеса), радиус — полширины
const CAR_R=0.78;
function carCapsule(c){const h=Math.max(0.6,(c.L||2.5)/2-0.2),fx=Math.sin(c.yaw),fz=Math.cos(c.yaw);return [c.x-fx*h,c.z-fz*h,c.x+fx*h,c.z+fz*h];}
function segPt(ax,az,bx,bz,px,pz){const dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz||1;let t=((px-ax)*dx+(pz-az)*dz)/l2;t=t<0?0:t>1?1:t;return [ax+dx*t,az+dz*t];}
// Ближайшие точки двух отрезков на плоскости
function segSeg(S,Q){const d1x=S[2]-S[0],d1z=S[3]-S[1],d2x=Q[2]-Q[0],d2z=Q[3]-Q[1],rx=S[0]-Q[0],rz=S[1]-Q[1],a=d1x*d1x+d1z*d1z||1e-9,e=d2x*d2x+d2z*d2z||1e-9,f=d2x*rx+d2z*rz,c=d1x*rx+d1z*rz,b=d1x*d2x+d1z*d2z,den=a*e-b*b;
  let s=den>1e-9?clamp((b*f-c*e)/den,0,1):0,t=(b*s+f)/e;if(t<0){t=0;s=clamp(-c/a,0,1);}else if(t>1){t=1;s=clamp((b-c)/a,0,1);}
  return [S[0]+d1x*s,S[1]+d1z*s,Q[0]+d2x*t,Q[1]+d2z*t];}
// Столкновение с препятствием: круг (дерево, столб) или прямоугольник (дом, забор, трибуна, толпа)
function obstacleHit(c,o){const [ax,az,bx,bz]=carCapsule(c);
  if(!o.box){const q=segPt(ax,az,bx,bz,o.x,o.z),dx=q[0]-o.x,dz=q[1]-o.z,d=Math.hypot(dx,dz),rr=o.r+CAR_R;if(d>=rr)return;const nx=d>1e-4?dx/d:Math.sin(c.yaw+Math.PI),nz=d>1e-4?dz/d:Math.cos(c.yaw+Math.PI),pen=rr-d;c.x+=nx*pen;c.z+=nz*pen;wallHit(c,nx,nz,0.15,1.3);return;}
  const b=o.box;let best=null;
  for(let k=0;k<=8;k++){const t=k/8,px=ax+(bx-ax)*t,pz=az+(bz-az)*t,lx=(px-o.x)*b.ux+(pz-o.z)*b.uz,lz=(px-o.x)*b.vx+(pz-o.z)*b.vz,cx=clamp(lx,-b.hu,b.hu),cz=clamp(lz,-b.hv,b.hv),dx=lx-cx,dz=lz-cz,d=Math.hypot(dx,dz);let pen,nl;
    if(d>1e-4){if(d>=CAR_R)continue;pen=CAR_R-d;nl=[dx/d,dz/d];}else{const ex=b.hu-Math.abs(lx),ez=b.hv-Math.abs(lz);if(ex<ez){nl=[Math.sign(lx)||1,0];pen=ex+CAR_R;}else{nl=[0,Math.sign(lz)||1];pen=ez+CAR_R;}}
    if(!best||pen>best.pen)best={pen,nl};}
  if(!best)return;const nx=best.nl[0]*b.ux+best.nl[1]*b.vx,nz=best.nl[0]*b.uz+best.nl[1]*b.vz;c.x+=nx*best.pen;c.z+=nz*best.pen;wallHit(c,nx,nz,0.12,1.2);}
// Удар о препятствие с нормалью (nx,nz), направленной к машине: поперечная скорость отражается с потерей,
// продольная теряет лишь трение удара, а сам удар разворачивает машину вдоль стены — она скользит и уходит от неё, а не липнет
function wallHit(c,nx,nz,e,dmgK){
  let fx=Math.sin(c.yaw),fz=Math.cos(c.yaw),rx=Math.cos(c.yaw),rz=-Math.sin(c.yaw);
  const Vx=fx*c.vx+rx*c.vy,Vz=fz*c.vx+rz*c.vy,vn=Vx*nx+Vz*nz;if(vn>=0)return;
  const tx=-nz,tz=nx,vt=Vx*tx+Vz*tz,imp=-vn,vt2=Math.sign(vt)*Math.max(0,Math.abs(vt)-0.3*(1+e)*imp),vn2=imp*e;
  const nVx=nx*vn2+tx*vt2,nVz=nz*vn2+tz*vt2;
  if(Math.abs(vt2)>0.5){const sg=Math.sign(vt2),dir=angWrap(Math.atan2(tx*sg,tz*sg)-c.yaw);
    if(Math.abs(dir)<1.5){c.yaw+=dir*Math.min(0.45,0.05+imp*0.05);c.r+=(clamp(dir*3,-2,2)-c.r)*Math.min(1,0.15+imp*0.12);}else c.r*=0.6;}
  else c.r*=0.6;
  fx=Math.sin(c.yaw);fz=Math.cos(c.yaw);rx=Math.cos(c.yaw);rz=-Math.sin(c.yaw);
  c.vx=nVx*fx+nVz*fz;c.vy=nVx*rx+nVz*rz;
  if(imp>2){c.dmg=Math.min(100,c.dmg+imp*dmgK);c.hit=Math.max(c.hit,imp);}
}
function carFailure(c){
  // у своих машин механик почти всегда успевает починить на обочине; сход — только при тяжёлой поломке или после сильных ударов
  const early=R.rc.y<1906,terminal=Math.random()<(c.you?0.12+Math.min(0.5,c.dmg/200):0.6);
  const what=pick(['мотор','зажигание','цепь привода','подшипник','рессора','карбюратор','радиатор',early?'цепь':'клапан']);
  if(terminal){c.dnf=what;c.thr=0;if(c.you)rMsgT(`${c.drvName||c.label}: СХОД — ${what}`,2.5);}
  else{c.stopT=(R.trk.cfg.dur||110)*(0.05+Math.random()*0.07)*(c.st.mech?0.6:1);c.stopWhy=what;c.limp=Math.random()<0.3;if(c.you)rMsgT(`${c.drvName||c.label}: ${c.st.mech?'механик чинит':'ремонт на обочине'} — ${what}, ~${Math.round(c.stopT)} с`,2.5);}
}
function pick(a){return a[Math.floor(Math.random()*a.length)];}
// Машины — капсулы: сталкиваются корпусами (нос в корму тоже), удар в угол разворачивает
function carsCollide(A,B){const dx0=A.x-B.x,dz0=A.z-B.z;if(dx0*dx0+dz0*dz0>26)return 0;
  const S=carCapsule(A),Q=carCapsule(B),[px,pz,qx,qz]=segSeg(S,Q),ddx=px-qx,ddz=pz-qz,d=Math.hypot(ddx,ddz),rr=CAR_R*2;if(d>=rr)return 0;
  const l0=Math.hypot(dx0,dz0)||1,nx=d>1e-4?ddx/d:dx0/l0,nz=d>1e-4?ddz/d:dz0/l0,push=(rr-d)/2;A.x+=nx*push;A.z+=nz*push;B.x-=nx*push;B.z-=nz*push;
  const V=c=>[Math.sin(c.yaw)*c.vx+Math.cos(c.yaw)*c.vy,Math.cos(c.yaw)*c.vx-Math.sin(c.yaw)*c.vy];
  const va=V(A),vb=V(B),rel=(va[0]-vb[0])*nx+(va[1]-vb[1])*nz;if(rel>=0)return 0;
  const j=-(1.3)*rel/2;const na=[va[0]+j*nx,va[1]+j*nz],nb=[vb[0]-j*nx,vb[1]-j*nz];
  const set=(c,w)=>{const fx=Math.sin(c.yaw),fz=Math.cos(c.yaw),rx=Math.cos(c.yaw),rz=-Math.sin(c.yaw);c.vx=w[0]*fx+w[1]*fz;c.vy=w[0]*rx+w[1]*rz;};set(A,na);set(B,nb);
  // вращение от удара: плечо от центра до точки касания
  const mz=(c,lx,lz,jx,jz)=>{c.r=clamp(c.r+(lz*jx-lx*jz)*12/(1.4*((c.L||2.5)**2+1.9)),-2.5,2.5);};mz(A,px-A.x,pz-A.z,j*nx,j*nz);mz(B,qx-B.x,qz-B.z,-j*nx,-j*nz);
  const imp=-rel,dk=(A.you||B.you)?0.6:0.25;if(imp>1.5){A.dmg=Math.min(100,A.dmg+imp*dk);B.dmg=Math.min(100,B.dmg+imp*dk);}return imp;}
/* ---------- пилоты: ИИ и игрок ---------- */
function aiControl(c,trk,dt){
  const {pts,n,closed,step}=trk,sk=c.sk||0.8,v=Math.max(0,c.vx);
  const look=6+v*0.75,ai=Math.round(look/step);let ti=c.idx+ai;if(closed)ti%=n;else ti=Math.min(n-1,ti);
  const tp=pts[ti],tn=trk.N[ti],off=c.laneT!==undefined?c.laneT:(c.lane||0);const tx=tp[0]+tn[0]*off,tz=tp[2]+tn[1]*off;
  const dx=tx-c.x,dz=tz-c.z,fx=Math.sin(c.yaw),fz=Math.cos(c.yaw);const lz=dx*fx+dz*fz,lx=dx*Math.cos(c.yaw)-dz*Math.sin(c.yaw);
  // руль: кривизна дуги до точки впереди + поправка по скорости вращения (шинам нужен угол увода)
  const kap=2*lx/Math.max(16,lz*lz+lx*lx);let want=Math.atan(c.L*kap);if(v>5)want+=clamp((kap*v-c.r)*0.3,-0.2,0.2);
  const dmax=0.6/(1+v/20);c.delta+=clamp(clamp(want,-dmax,dmax)-c.delta,-2.2*dt,2.2*dt);
  const ordK=c.order==='push'?1.03:c.order==='save'?0.91:1;
  const mu=(TERR[trk.terrAt(c.idx)]||TERR.dirt).mu*c.grip*(1-0.3*Math.min(1,c.tyre/100))*(0.8+0.17*sk)*(c.punct?0.5:1)*ordK,muC=mu*0.9;
  const bdec=c.brakeK*mu*GRAV*0.85;let vt=c.vtop*1.05;
  for(let d=0;d<Math.min(170,40+v*4.5);d+=step*2){let j=c.idx+Math.round(d/step);if(closed)j%=n;else if(j>=n)break;const k=Math.abs(trk.K[j])+1e-4,vc=Math.sqrt(muC*GRAV/k),va=Math.sqrt(vc*vc+2*bdec*Math.max(0,d-3));if(va<vt)vt=va;}
  if(c.err>0){c.err-=dt;vt*=1.1;}else if(Math.random()<(1-sk)*0.03*dt)c.err=1.2;
  const kN=trk.K[c.idx]||0,latDem=v*v*Math.abs(kN)/(mu*GRAV+0.01);
  c.thr=v<vt*0.97?(latDem>0.8?0.45:1):v<vt?0.35:0;c.brk=v>vt*1.03?Math.min(1,(v-vt)/4):0;
  // выносит наружу поворота — сбросить газ и подтормозить
  const wide=-Math.sign(kN)*c.lat-(trk.W/2-1.5);if(Math.abs(kN)>1/400&&wide>0&&v>8){c.thr=Math.min(c.thr,0.2);c.brk=Math.max(c.brk,Math.min(0.5,wide*0.15));}
  if(c.heat>82&&c.rpm>0.85)c.thr=Math.min(c.thr,c.order==='push'?0.7:0.5);
  if(c.slipR>0.14&&c.thr>0.5)c.thr=0.5;
  if(c.off&&v>8){c.thr=Math.min(c.thr,0.3);c.brk=Math.max(c.brk,0.2);}
  // боксы: шины, топливо, повреждения или приказ команды
  const cfg=trk.cfg,rem=Math.max(0,trk.raceLen-c.prog);if(cfg.pits&&c.lap<cfg.laps-1&&(c.tyre+rem*c.tyreRate*1.5>97||(c.fuelRate&&c.fuel<rem*c.fuelRate+4)||c.dmg>55||c.pitCall)){const toLine=((n-c.idx)%n)*step;if(toLine<110){c.brk=v>13?0.8:0;c.thr=v<10?0.4:0;}}
  if(c.follow&&!c.punct){c.thr=0;if(c.vx>c.follow.vx+2)c.brk=Math.max(c.brk,0.35);}
  // на спущенном колесе у самого финиша — доезжаем осторожно, иначе останавливаемся менять
  if(c.punct){if(c.flat){const vF=Math.max(6,c.vtop*0.45);c.thr=v<vF?Math.min(c.thr,0.55):0;if(v>vF+1.5)c.brk=Math.max(c.brk,0.3);}else{c.thr=0;c.brk=1;}}
  if(c.fuelRate&&c.fuel<=0&&!(c.pitT>0)&&!c.dnf){c.dnf='кончилось топливо';if(c.you)rMsgT(`${c.drvName||c.label}: СХОД — кончилось топливо`,2.5);}
}
// Движение в потоке: обгон медленной машины впереди, съезд к обочине для ремонта
function aiTraffic(T){
  const W2=T.W/2-1.3;
  R.cars.forEach(c=>{if(c.player||c.dnf||c.fin!==null)return;
    if(c.stopT>0||c.punct||(c.pitT>0)){c.laneT=c.pitT>0?undefined:-W2;return;}
    let blk=null,best=1e9;
    R.cars.forEach(o=>{if(o===c||o.parked||(o.dnf&&Math.abs(o.lat)>T.W/2))return;const gap=o.prog-c.prog;if(gap<=0||gap>8+c.vx*0.9)return;const dl=o.lat-c.lat;if(Math.abs(dl)<2.3&&gap<best){best=gap;blk=o;}});
    if(blk&&blk.vx<c.vx+1){const L=blk.lat+2.9,Rr=blk.lat-2.9,okL=L<=W2,okR=Rr>=-W2;
      c.laneT=okL&&(!okR||Math.abs(L-c.lat)<=Math.abs(Rr-c.lat))?L:okR?Rr:c.lat;
      if(blk.vx>2&&best<5+c.vx*0.25&&Math.abs(blk.lat-c.lat)<1.9&&c.vx>blk.vx){c.follow=blk;}else c.follow=null;}
    else{c.laneT=undefined;c.follow=null;}
  });
}
const rKeys={left:false,right:false,gas:false,brake:false};
// Руль на экране: режим управления (колесо — вести пальцем, кнопки — половинки руля, наклон — датчик), перетаскивание и цель
const RW={mode:'keys',drag:null,target:0};
function playerControl(c,dt){
  const v=Math.max(0,c.vx),hist=G.diff==='hist';
  // руль сам медленно возвращается прямо (как от наклона шкворней): на скорости быстрее, на месте почти стоит
  const back=(1.6+1.4*Math.min(1,v/20))*dt;
  // шины держат дорогу: боковой снос гасится быстрее, машина не «плывёт»
  if(PHY.hold){c.vy*=1-Math.min(0.3,dt*5*PHY.hold);c.r*=1-Math.min(0.2,dt*2.5*PHY.hold);}
  if(R.tilt&&R.tiltVal!==undefined)c.steer+=clamp(clamp(R.tiltVal/22,-1,1)-c.steer,-4*dt,4*dt);
  else if(RW.drag)c.steer+=clamp(RW.target-c.steer,-7*dt,7*dt);
  else{const dir=rKeys.left?-1:rKeys.right?1:0;
    // кнопки крутят руль, а не ставят его: короткое касание — лёгкая поправка, долгое нажатие разгоняет поворот
    if(dir){c.hold+=dt;const rate=0.7+2.1*Math.min(1,c.hold/0.6);c.steer=clamp(c.steer+dir*rate*(c.steer*dir<0?1.8:1)*dt,-1,1);}
    else{c.hold=0;c.steer-=clamp(c.steer,-back,back);}}
  // полный поворот — чуть за пределом сцепления на этой скорости: на прямой руль точный, в шпильке — полный угол колёс
  const mu=(TERR[R.trk.terrAt(c.idx)]||TERR.dirt).mu*c.grip,dmax=Math.min(0.5,(hist?1.7:1.3)*c.L*mu*GRAV/Math.max(1,v*v)+0.09);
  let want=c.steer*dmax;
  // помощник: колёса чуть доворачиваются по ходу заноса (контрруль), вращение гасится, когда задок срывается
  if(!hist&&v>4){want+=clamp(Math.atan2(c.vy,v)*0.7,-0.12,0.12);c.r*=1-Math.min(0.5,dt*15*Math.max(0,c.slipR-0.08));}
  c.delta+=clamp(want-c.delta,-2.6*dt,2.6*dt);
  c.thr+=clamp((rKeys.gas?1:0)-c.thr,-6*dt,4*dt);c.brk+=clamp((rKeys.brake?1:0)-c.brk,-8*dt,6*dt);
  if(!hist&&c.slipR>0.16&&c.thr>0.4)c.thr*=0.6;
}
/* ---------- гонка: старт, такт, финиш ---------- */
let R=null,rRaf=0;
function rMsg(t,dur=1.6){if(R&&R.mode!=='sim'){R.msg=t;R.msgT=dur;}}
function rMsgT(t,dur){if(R&&R.mode!=='sim'){R.msg=t;R.msgT=dur;}}
function dnfTarget(y,t){const base=y<1900?0.5:y<1906?0.45:y<1912?0.38:y<1920?0.32:y<1925?0.27:0.2;return base*({road:1.15,rally:1.2,endurance:1.3,hill:0.4,sprint:0.3,oval:1,circuit:1}[t]||1);}
// Параметры износа машины на конкретной гонке: шины, проколы, топливо
function wearSetup(c,trk,rc){
  const tr=TERR[trk.cfg.terr]||TERR.dirt,p=parts(c.md),km=Math.max(20,rc.km);
  const life=p.w.life*(tr.tyre||1)*(1+0.1*upgOf(c.md,p.w.id));
  const lifeFrac=clamp(life/km,0.7,3);c.tyreRate=100/(lifeFrac*trk.raceLen);
  const expP=clamp(km*p.w.punct*(tr.rough||1)/1100,0,1.4);c.punctRate=expP/trk.raceLen;
  // бака почти хватает на всю гонку — механики заливают с запасом, чтобы доехать без заправки; иначе нужна остановка
  if(trk.cfg.pits){const range=280/(p.e.fuel||1),f0=range/km,frac=f0>=0.9?clamp(Math.max(f0,1.15),1.15,1.6):clamp(f0,0.55,0.9);c.fuelRate=100/(frac*trk.raceLen);}else c.fuelRate=0;
  c.wheelChange=(trk.cfg.dur||110)*(p.w.pit?0.022*p.w.pit/0.35:rc.y<1906?0.055:0.042)*(c.st.mech?1:1.4)*(c.pitK||1);
}
function startRace(setup){
  const s=G,rc=setup.rc,dl=RDEPT[s.rdept||0],pio=PIONEERS[s.pioneer],pd=pio.drv&&DRIVERS.find(d=>d.id===pio.drv);
  const teamCars=setup.entries.map((e,i)=>{const d=e.drv==='me'?null:DRIVERS.find(x=>x.id===e.drv),me=e.drv==='me';
    return {you:true,name:s.company,label:e.md.name,drvName:me?(setup.mode==='drive'?'Вы':pio.name):d.n,drvId:e.drv,sk:me?(pd?pd.sk:0.72):Math.min(0.99,d.sk*moodK(s,d.id)),
    md:e.md,prep:e.prep,tyre:e.tyre,gear:e.gear,color:e.md.paint,num:i+1,player:me&&setup.mode==='drive',pw:(1+bn('race',0))*(dl.pw||1),relK:dl.rel||1,pitK:dl.pit||1};});
  const ai=raceField(rc,s,setup.entries.length,setup.entries.map(e=>e.drv));
  const vref=Math.max(...teamCars.concat(ai).map(e=>carStats(e.md,e.prep,rc.y).vmax));
  const trk=buildTrack(rc,vref);
  const cars=[...ai,...teamCars].map((e,i)=>{const c=mkRaceCar(Object.assign(e,{num:e.num||i+10}),rc.y,trk);c.mech=c.st.mech;
    // ваша машина — такая же, как в конструкторе: её цвет и кузов; соперники — гоночные машины в цветах своих стран
    if(c.you||c.spec){const sp=modelSpec(c.md,c.prep,rc.y,{country:c.you?s.country:c.tc,num:c.num,mech:c.mech});c.style=sp.style;c.wheel=sp.wheel;c.spriteKey=sp.key;c.spec3=sp;}
    else{c.style=carStyle(c.md,c.prep,rc.y);let strip=0;
      // облик по марке: «рейсэбауты» Мерсера и Стаца — как с завода; в 24-часовых гонках 1920-х — спортивные машины с крыльями и фарами (Бентли — туринг)
      if(/^gp/.test(c.style)){if(['Mercer','Stutz'].includes(c.name)&&rc.y>=1911&&rc.y<1920){c.style='sport';strip=1;}else if(rc.t==='endurance'&&rc.y>=1920)c.style=c.name==='Bentley'?'tourer':'sport';}
      c.wheel=rc.y>=1924&&c.style==='gp1925'&&(c.name==='Bugatti'||i%3===0)?'alloy':wheelKind(c.md,rc.y);const bid=parts(c.md).b.id;c.spriteKey=c.style+c.color+c.num+c.wheel+(c.mech?1:0)+bid+'|'+c.name+strip;
      c.spec3={key:c.spriteKey,style:c.style,color:c.color,y:rc.y,wheel:c.wheel,mech:c.mech,num:c.num,b:bid,mq:c.name,strip,hp:3};}
    wearSetup(c,trk,rc);return c;});
  // стартовая решётка: быстрые и опытные впереди, немного случайности
  cars.forEach(c=>c.q=c.vtop*(0.9+0.2*(c.sk||0.8))*(0.94+Math.random()*0.12));cars.sort((a,b)=>b.q-a.q);
  cars.forEach((c,i)=>{const row=Math.floor(i/2),col=i%2?1:-1,back=(row+1)*9;let idx=trk.startIdx-Math.round(back/trk.step);if(trk.closed)idx=(idx+trk.n)%trk.n;else idx=Math.max(0,idx);
    const p=trk.pts[idx],nn=trk.N[idx],t=trk.T[idx];c.idx=idx;c.x=p[0]+nn[0]*col*trk.W*0.22;c.z=p[2]+nn[1]*col*trk.W*0.22;c.y=p[1];c.yaw=Math.atan2(t[0],t[1]);if(trk.closed)c.lap=idx>trk.n/2?-1:0;c.lane=[-1.2,1.2,0,-2,2][i%5]*trk.W/9;trackLocal(trk,c);});
  const me=cars.find(c=>c.player)||null,team=cars.filter(c=>c.you);
  // погода гонки: в дождь шины держат хуже
  const wx=r3dWeather(trk);if(wx.rain)cars.forEach(c=>{c.grip*=0.87;});
  R={rc,trk,cars,all:cars,me,team,follow:me||team[0],mode:setup.mode,t:setup.mode==='sim'?0:-3,time:0,done:false,lastT:performance.now(),msgT:0,msg:'',shake:0,parts:[],tilt:(AU.on.steer||(AU.on.tilt?'tilt':'wheel'))==='tilt',speed:1,setup,wx,
    hz0:-Math.log(1-dnfTarget(rc.y,rc.t))/(0.66*Math.max(40,trk.cfg.dur||120)),relRef:(()=>{const fac=cars.filter(c=>!c.you&&!c.priv);return fac.length?Math.max(0.05,1-fac.reduce((a,c)=>a+c.rel,0)/fac.length):fieldRelRef(rc,s);})()};
  if(setup.mode==='sim'){let f=0;const dt=1/20;while(R&&!R.done&&f<20*900){f++;R.time+=dt;R.t+=dt;raceTick(dt);}if(R&&!R.done)finishRace(false);return;}
  document.getElementById('raceScreen').hidden=false;document.getElementById('rName').textContent=`${rc.name} · ${rc.y}`;
  document.getElementById('fuelBox').style.visibility=trk.cfg.pits?'visible':'hidden';
  document.getElementById('hLapL').firstChild.textContent=trk.cfg.laps>1?'Круг':'Дистанция';
  document.getElementById('rTips').hidden=true;setupRaceUI();setupRender();auRaceStart(rc);R.lastT=performance.now();rRaf=requestAnimationFrame(raceLoop);
}
// Соперники: заводские команды своего года (те же, что и в зачёте сезона), с реальными пилотами
function fieldTeams(rc,s,nTeam){
  const y=rc.y,intl=rc.c==='intl'||rc.major,host=COUNTRIES[rc.c]?rc.c:null;
  let teams=RACE_TEAMS.filter(t=>t.from<=y&&t.to>=y&&!(t.gap&&y>=t.gap[0]&&y<=t.gap[1])&&t.pk!==s.pioneer&&(intl||t.c===host||(!host)));
  if(rc.id==='indy'||rc.track==='board')teams=teams.filter(t=>t.c==='us'||t.str>=1.05);
  if(rc.t==='endurance'||rc.t==='rally'||rc.id==='mille')teams=teams.filter(t=>!['Miller','Duesenberg','Frontenac','Durant'].includes(t.n));
  teams.sort((a,b)=>b.str-a.str);
  if(/^gb\d/.test(rc.id)){const cnt={[s.country]:nTeam};teams=teams.filter(t=>['fr','de','uk','us','it'].includes(t.c)&&(cnt[t.c]=(cnt[t.c]||0)+1)<=3);}
  const want=clamp((rc.major?8:5)-nTeam+2,3,8),out=[];teams.forEach(t=>{if(out.length<want&&!out.some(p=>p.n===t.n))out.push(t);});
  return out;
}
// Гоночная машина соперников: самая прочная рама, самый мощный мотор, который она выдержит, лучшие коробка, тормоза и шины своего года
// Подготовка заводских машин: на выносливость, в марафонах и в «Милле Милья» — серийный кузов, иначе гоночный
function aiPrep(rc){return rc.t==='endurance'||rc.t==='rally'||rc.id==='mille'?1:2;}
function bestPart(arr,y,key,f){return arr.filter(x=>x.y<=y&&(!f||f(x))).reduce((a,x)=>!a||x[key]>a[key]?x:a,null);}
function aiCarMd(y,name){const c=bestPart(CHASSIS,y,'max'),e=bestPart(ENGINES,y,'hp',x=>x.hp<=c.max)||ENGINES[0];
  return {e:e.id,g:bestPart(GEARBOX,y,'eff').id,c:c.id,k:bestPart(BRAKES,y,'brk').id,b:'b1',w:TYRES.filter(x=>x.y<=y&&(!x.solid||y<1895)).reduce((a,x)=>!a||x.grip+(x.pit?0.004:0)>a.grip+(a.pit?0.004:0)?x:a,null).id,t:'t0',paint:'#333',name:name||'',made:0,ai:1};}
// Типичная ненадёжность соперников: от неё считается частота поломок в гонке
function fieldRelRef(rc,s){const T=fieldTeams(rc,s,1);if(!T.length)return 0.2;const prep=aiPrep(rc),st=carStats(aiCarMd(rc.y),prep,rc.y);return Math.max(0.05,1-T.reduce((a,t)=>a+clamp(st.rel*Math.pow(t.str,0.6),0.3,0.995),0)/T.length);}
function teamBoost(t,rc){return (t.boost&&Object.keys(t.boost).some(k=>rc.y>=+k)?1.06:1)*(rc.t==='endurance'&&t.endur?t.endur:1);}
function teamDrivers(t,y,used){return DRIVERS.filter(d=>d.from<=y&&d.to>=y&&!(used&&used.has(d.id))&&d.mq.some(m=>t.mq.includes(m)));}
function raceField(rc,s,nTeam,taken){
  const y=rc.y,pickT=fieldTeams(rc,s,nTeam),host=COUNTRIES[rc.c]?rc.c:null,PR=privRule(rc);
  const nPriv=Math.min(PR.n+(rc.major&&PR.n>=3?1:0),Math.max(0,14-nTeam-pickT.length));
  while(pickT.length+nPriv<3)pickT.push({n:'Частная машина',c:host||'fr',str:0.85,mq:[]});
  const pio=PIONEERS[s.pioneer],used=new Set([...(s.drivers||[]),...(taken||[]),pio.drv].filter(Boolean)),out=[];
  pickT.forEach((t,i)=>{
    const pool=teamDrivers(t,y,used),any=DRIVERS.filter(d=>d.from<=y&&d.to>=y&&!used.has(d.id)),L=pool.length?pool:any;
    const d=L.sort((a,b)=>b.sk-a.sk)[Math.floor(Math.random()*Math.min(2,L.length))]||{n:'',sk:0.75};if(d.id)used.add(d.id);
    const md=aiCarMd(y,t.n);
    const boost=teamBoost(t,rc)*DIF().race;
    out.push({you:false,name:t.n,label:t.n,drvName:d.n,drvId:d.id||null,sk:d.sk||0.75,md,prep:aiPrep(rc),tyre:Math.random()<0.5?'soft':'hard',gear:0,color:y>=1903?(t.c==='intl'||!COUNTRIES[t.c]?'#F28C00':COUNTRIES[t.c].race):['#2b2320','#3a2a1c','#1f2b3a','#4a1f1a'][i%4],pw:Math.pow(t.str,1.6)*boost,relK:Math.pow(t.str,0.6),tc:t.c});
  });
  return out.concat(privField(rc,s,used,nPriv));
}
/* ---------- частники: любители на купленных машинах ---------- */
// Регламент эпохи: Кубок Гордона Беннетта — только сборные стран, Гран-при до 1925 года — только заводы.
// В открытых гонках по дорогам, в горах, марафонах, на выносливость и в клубных гонках едут и любители — в том числе на ваших машинах.
// k: 'race' — купленная у завода гоночная машина, 'prod' — серийная; my — какие ваши машины покупают частники для этой гонки
const GP_FACTORY=['gpacf','dieppe','lyon1914','lm1921','brescia','monza1922','europe1924','itgp'];
function privRule(rc){
  const id=rc.id,y=rc.y,t=rc.t;
  if(/^gb\d/.test(id))return {n:0,txt:'Кубок наций: до трёх машин от страны, целиком построенных в ней. Частников нет.'};
  if(id==='daytona1927')return {n:0,txt:'Попытка рекорда скорости: на пляже только машины-рекордсмены.'};
  if(GP_FACTORY.includes(id))return y>=1925?{n:1,k:'race',txt:'Гран-при: заявляют заводы, но допускают и частников на купленных гоночных машинах.'}:{n:0,txt:'Гран-при — гонка заводов: заявки принимают только от изготовителей машин. Частников нет.'};
  if(id==='monaco')return {n:3,k:'race',my:'sport',txt:'Свободная формула: больше половины участников — частники на купленных гоночных машинах.'};
  if(id==='savannah'||id==='kaiser'||id==='bgp1926')return {n:1,k:id==='kaiser'?'prod':'race',my:'sport',txt:'В основном заводские команды, частных заявок — единицы.'};
  if(id==='indy'||/^board/.test(id))return {n:id==='indy'?2:1,k:'race',txt:'Правила AAA: многие машины принадлежат самим гонщикам и частным владельцам.'};
  if(t==='road'&&y<1904)return {n:4,k:'race',my:'all',txt:'Открытая гонка: вместе с заводскими машинами едут частники — тяжёлые машины, лёгкие и вуатюретки в одном потоке.'};
  if(t==='rally')return {n:4,k:'prod',my:'all',txt:'Испытание туристических машин: за рулём и заводские экипажи, и владельцы-любители.'};
  if(t==='hill')return {n:3,k:'prod',my:'all',txt:'Гонка в гору открыта всем: и заводам, и любителям на своих машинах.'};
  if(t==='endurance')return {n:3,k:'prod',my:'all',txt:'Серийные машины с полным оснащением: заявляют и заводы, и частные владельцы.'};
  if(id==='mille')return {n:4,k:'prod',my:'all',txt:'Серийные машины на дорогах Италии: большинство экипажей — частники.'};
  if(id==='brooklands'||id==='jcc200')return {n:3,k:'prod',my:'all',txt:'Клубные гонки Бруклендса: много любителей на своих машинах.'};
  if(id==='ormond')return {n:2,k:'race',my:'sport',txt:'Скоростная неделя: рекорды ставят и заводы, и богатые любители.'};
  if(id==='tt')return {n:2,k:'prod',my:'all',txt:'Турист Трофи: туристические машины заводов и частных владельцев.'};
  if(id==='santamonica'||id==='elgin')return {n:2,k:'prod',my:'sport',txt:'Гонка серийных машин: заявляют заводы, дилеры и частные владельцы.'};
  return {n:2,k:y>=1910?'prod':'race',my:'sport',txt:'Заявки принимают и от заводов, и от частных владельцев.'};
}
// «Джентльмены-гонщики» эпохи, которые гонялись на собственных купленных машинах: марка (или [до какого года, марка])
const PRIV_DRV={chasseloup:'De Dion-Bouton',jellinek:'Mercedes',e_zborowski:'Mercedes',de_crawhez:'Panhard et Levassor',rolls:'Panhard et Levassor',vanderbilt:'Mercedes',m_farman:'Panhard et Levassor',h_farman:'Panhard et Levassor',
  jarrott:[[1902,'Panhard et Levassor'],[1904,'De Dietrich']],du_gast:'De Dietrich',de_caters:'Mercedes',levitt:'Napier',poge:'Mercedes',florio:'Itala',moore_brabazon:'Minerva',borghese:'Itala',bragg:'Fiat',
  wishart:[[1912,'Mercedes'],[1914,'Mercer']],nagel:'Руссо-Балт',suvorin:'Benz',l_zborowski:'Aston Martin',g_masetti:[[1921,'Fiat'],[1926,'Mercedes']],materassi:[[1924,'Itala'],[1929,'Bugatti']],junek:'Bugatti',vizcaya:'Bugatti',
  sabipa:'Bugatti',campbell:[[1922,'Sunbeam'],[1935,'Bugatti']],kaye_don:'Sunbeam',etancelin:'Bugatti',williams:'Bugatti',helle_nice:'Bugatti',nuvolari:[[1926,'Bianchi'],[1929,'Bugatti']],stuck:'Austro-Daimler',
  ivanowski:'Alfa Romeo',barnato:'Bentley',birkin:'Bentley',kidston:'Bentley',rubin:'Bentley',benjafield:'Bentley',c_durant:'Miller',woodbury:'Miller',devore:'Miller',souders:'Duesenberg'};
const NAT_C={'Франция':'fr','Бельгия':'fr','Монако':'fr','Испания':'fr','США':'us','Канада':'us','Великобритания':'uk','Австралия':'uk','Германия':'de','Австро-Венгрия':'de','Чехословакия':'de','Швейцария':'de','Венгрия':'de','Россия':'de','Италия':'it'};
const AMATEUR={fr:['Месье','Бертен','Дюбуа','Лефевр','Моро','Жирар','Ренье','Фавр','Лакомб'],uk:['Мистер','Эшворт','Кларк','Хардинг','Беннет','Филдинг','Прайс','Лоуренс'],de:['Герр','Шмидт','Вебер','Краус','Хоффман','Беккер','Ланге','Фогель'],
  us:['Мистер','Келлер','Бёрнс','Мейсон','Прескотт','Картер','Холлоуэй','Рид'],it:['Синьор','Галли','Риччи','Бьянки','Конти','Марини','Фаббри','Серра']};
function playerMarque(m,s){return RACE_TEAMS.some(t=>t.pk===s.pioneer&&(t.n===m||t.mq.includes(m)))||Object.values(COMPS).some(L=>L.some(b=>b.pk===s.pioneer&&(b.n.includes(m)||(b.models||[]).some(x=>x[1].includes(m)))));}
function privMarque(id,y){const v=PRIV_DRV[id];if(typeof v==='string')return v;const x=v.find(a=>y<=a[0]);return x?x[1]:v[v.length-1][1];}
function wpick(a,wf){const w=a.map(wf),t=w.reduce((x,y)=>x+y,0);let r=Math.random()*t;for(let i=0;i<a.length;i++){r-=w[i];if(r<=0)return a[i];}return a[a.length-1];}
const TRIM_OF={people:'t0',middle:'t1',lux:'t2',sport:'t3'};
const brandShort=n=>n.replace(/ & Cie\.| \(.*\)| \/ .*$/g,'');
// Какие ваши машины частники покупают для этой гонки: сколько-то уже продано, не грузовики
function privMyModels(rc,s,PR){if(!PR.my)return [];
  return s.models.filter(m=>(m.status==='prod'||m.status==='sale')&&!isTruck(m)&&(m.totalSold||0)>=10&&(PR.my==='all'||['sport','lux'].includes(segOf(m))));}
// Серийная машина частника: типичная для класса машина эпохи, в цвете владельца
function privProdCar(y,brand,segs){
  let seg=null;if(brand&&brand.mix){const L=segs.filter(g=>brand.mix[g]);if(L.length)seg=wpick(L,g=>brand.mix[g]);}
  if(!seg)seg=wpick(segs,g=>({lux:3,middle:2,sport:3,people:1})[g]);
  const r=rivalCar(seg,y);return {...r[2],t:TRIM_OF[seg],paint:pick(PAINTS).id,name:'',made:0,ai:1};}
function privField(rc,s,used,n){
  const PR=privRule(rc);if(n===undefined)n=PR.n;if(!PR.n||n<=0)return [];
  const y=rc.y,host=COUNTRIES[rc.c]?rc.c:COUNTRIES[rc.host]?rc.host:'fr',intl=rc.c==='intl'||!!rc.major,out=[],names=new Set(),dr=DIF().race;
  const segs=rc.id==='jcc200'?['people','middle']:['lux','middle'].concat(y>=1910?['sport']:[],rc.id==='mille'||rc.t==='rally'?['people']:[]);
  const amateur=c=>{const L=AMATEUR[c]||AMATEUR[host]||AMATEUR.fr;for(let k=0;k<20;k++){const nm=L[0]+' '+L[1+Math.floor(Math.random()*(L.length-1))];if(!names.has(nm)){names.add(nm);return {n:nm,sk:0.58+Math.random()*0.12,c};}}return {n:'Любитель',sk:0.6,c};};
  // джентльмены своей страны; на международных гонках — и гости из-за границы
  const gent=()=>{const L=DRIVERS.filter(d=>PRIV_DRV[d.id]&&d.from<=y&&d.to>=y&&!used.has(d.id)),H=L.filter(d=>NAT_C[d.nat]===host);
    const reg=c=>c==='us'?1:0,F=L.filter(d=>intl||reg(NAT_C[d.nat]||'fr')===reg(host)),P=H.length&&Math.random()<(intl?0.7:0.9)?H:intl||Math.random()<0.3?F:[];if(!P.length)return null;
    const d=pick(P);used.add(d.id);return {n:d.n,sk:d.sk,id:d.id,c:NAT_C[d.nat]||host,m:privMarque(d.id,y)};};
  const who=()=>Math.random()<0.55&&gent()||amateur(Math.random()<(intl?0.6:0.85)?host:pick(Object.keys(AMATEUR)));
  const col=c=>y>=1903&&COUNTRIES[c]?COUNTRIES[c].race:pick(PAINTS).id;
  // 1) ваши машины: их покупают любители — чем больше вы продаёте в стране гонки, тем вероятнее встретить их на старте
  const my=privMyModels(rc,s,PR);
  const addMy=d=>{const md=wpick(my,m=>1+(m.totalSold||0)+(m.lastSold||0)*6);
    out.push({you:false,priv:1,pmy:md.id,spec:1,name:s.company,label:md.name,drvName:d.n,drvId:d.id||null,sk:d.sk,md,prep:['rally','endurance'].includes(rc.t)?0:1,tyre:'hard',gear:0,color:md.paint,pw:1,relK:0.97,tc:s.country});};
  if(my.length){const mk=s.last&&s.last.mk&&s.last.mk[host],sh=mk&&mk.size>0?mk.sold/mk.size:0,sold=my.reduce((a,m)=>a+(m.totalSold||0),0),here=host===s.country||((s.dealers||{})[host]||0)>0;
    let p=clamp(0.2+sh*3+Math.min(0.3,sold/4000),0,0.85)*(here?1:0.35);
    for(let k=0;k<2&&out.length<n;k++){if(Math.random()>=p)break;p*=0.4;addMy(Math.random()<0.3&&gent()||amateur(host));}}
  // 2) «джентльмены» эпохи и безымянные любители: на купленных гоночных машинах или на серийных
  const teams=RACE_TEAMS.filter(t=>t.from<=y&&t.to>=y&&t.pk!==s.pioneer&&COUNTRIES[t.c]);
  while(out.length<n){const d=who();
    // джентльмен гонялся на марке, которой в этой истории управляете вы: теперь он на вашей машине
    if(d.m&&playerMarque(d.m,s)){if(my.length){addMy(d);continue;}d.m=null;}
    if(PR.k==='race'&&teams.length){
      const t=d.m?(teams.find(t=>t.n===d.m||t.mq.includes(d.m))||{n:d.m,c:d.c,str:0.95}):wpick(teams,t=>t.c===host?3:1);
      out.push({you:false,priv:1,name:t.n,label:t.n,drvName:d.n,drvId:d.id||null,sk:d.sk,md:aiCarMd(Math.max(1894,y-1),t.n),prep:2,tyre:Math.random()<0.5?'soft':'hard',gear:0,color:col(d.c),pw:Math.pow(t.str||0.95,1.6)*0.9*dr,relK:0.95,tc:t.c||d.c});
    }else{
      const pool=[].concat(...Object.keys(COMPS).map(c=>COMPS[c].filter(b=>b.since<=y&&(!b.until||b.until>=y)&&!b.imp&&b.pk!==s.pioneer&&segs.some(g=>b.mix[g])).map(b=>({b,c}))));
      let bc=null;if(d.m)bc=pool.find(x=>x.b.n.includes(d.m)||(x.b.models||[]).some(m=>m[1].includes(d.m)));
      if(!bc&&!d.m&&pool.length)bc=wpick(pool,x=>(x.c===host?3:intl?0.5:0.05)*Math.pow(tabAt(x.b.v,y)||1,0.35));
      const md=privProdCar(y,bc&&bc.b,segs),mm0=bc?(bc.b.models||[]).filter(m=>m[0]<=y&&y-m[0]<=8).pop():null,mm=mm0&&[mm0[0],mm0[1].replace(/\s*«.*?»/g,'')],bnm=bc?brandShort(bc.b.n):d.m||'Серийная машина';
      const w0=bnm.split(/[ -]/)[0].toLowerCase(),label=d.m?d.m:mm?(mm[1].toLowerCase().includes(w0)?mm[1]:bnm.toLowerCase().includes(mm[1].toLowerCase())?bnm:bnm+' '+mm[1]):bnm;md.name=label;
      out.push({you:false,priv:1,spec:1,name:d.m||bnm,label,drvName:d.n,drvId:d.id||null,sk:d.sk,md,prep:['rally','endurance'].includes(rc.t)?0:1,tyre:'hard',gear:0,color:md.paint,pw:Math.pow(dr,0.5),relK:0.97,tc:bc?bc.c:d.c});
    }}
  return out;
}
// Сила частника для быстрого итога гонки (без вас): его машина против заводской гоночной машины эпохи
function rankOf(md,prep,y){const st=carStats(md,prep,y);return st.vmax*(0.55+0.45*st.rel)/(1+st.acc/60);}
function privPerf(e,rc){const pr=aiPrep(rc),ref=rankOf(aiCarMd(rc.y),pr,rc.y);return Math.pow(rankOf(e.md,e.prep,rc.y)/ref,1.6)*Math.pow(e.pw||1,0.8)*(0.8+0.4*((e.sk||0.65)-0.5));}
function raceTick(dt){
  const T=R.trk,cfg=T.cfg;
  if(R.t<0){R.cars.forEach(c=>{c.thr=0;c.brk=1;});return;}
  aiTraffic(T);
  R.cars.forEach(c=>{
    if(c.fin!==null||c.dnf){if(c.dnf&&!c.player){if(c.vx>0.5){c.laneT=-(T.W/2+1.5);aiControl(c,T,dt);}else if(!c.parked){c.parked=1;const p=T.pts[c.idx],nn=T.N[c.idx],o=-(T.W/2+2.4);c.x=p[0]+nn[0]*o;c.z=p[2]+nn[1]*o;c.lat=o;c.vx=c.vy=c.r=0;}}c.thr=0;c.brk=c.dnf?0.6:0.4;if(c.dnf&&!c.outT){c.outT=R.time;}return;}
    if(!c.player||R.mode!=='drive')aiControl(c,T,dt);else playerService(c,dt);
    if(cfg.pits){if(c.pitT>0){c.pitT-=dt;c.thr=0;c.brk=1;if(c.pitT<=0){c.tyre=0;c.punct=false;c.fuel=100;c.heat=0;c.dmg=Math.max(0,c.dmg-35);c.pitCall=false;if(c.you)rMsgT((c.player?'':(c.drvName||c.label)+': ')+'ГОТОВО!',1);}}
      else if(c.lapSeen!==c.lap&&c.lap>=0&&c.idx<6){c.lapSeen=c.lap;if(c.vx<15&&c.lap>0){c.pitT=(4+(c.fuel<60?2:0)+(c.punct||c.tyre>50?c.wheelChange*0.4:0))*(parts(c.md).w.pit||1)*(c.pitK||1);if(c.player)rMsg('БОКСЫ',2);}else if(c.player&&c.lap>0&&c.lap<cfg.laps)rMsg('КРУГ '+(c.lap+1)+'/'+cfg.laps,1.2);}}
    if(c.stopT>0){c.stopT-=dt;c.thr=0;c.brk=1;if(c.stopT<=0&&c.you)rMsgT((c.player?'':(c.drvName||c.label)+': ')+'СНОВА В ПУТИ',1);}
    else if(c.punct&&!c.flat&&c.vx<1.2&&!(cfg.pits&&c.pitT>0)&&!(c.player&&R.mode==='drive')){c.fix=(c.fix||0)+dt;if(c.fix>c.wheelChange){c.punct=false;c.tyre=Math.min(c.tyre,30);c.fix=0;if(c.you)rMsgT((c.player?'':(c.drvName||c.label)+': ')+'КОЛЕСО ЗАМЕНЕНО',1.2);}}
  });
  const sub=R.mode==='sim'?3:4,h=dt/sub;
  for(let k=0;k<sub;k++){R.cars.forEach(c=>{if(!c.dnf||c.vx>0.2)carStep(c,T,h);});for(let i=0;i<R.cars.length;i++)for(let j=i+1;j<R.cars.length;j++){const A=R.cars[i],B=R.cars[j];if(A.dnf&&B.dnf)continue;const imp=carsCollide(A,B);if(imp>1.5&&(A===R.follow||B===R.follow)){R.shake=Math.min(0.6,imp*0.05);auSfx('bump',Math.min(1,imp/10));}}}
  R.cars.forEach(c=>{c.draft=0;if(c.dnf)return;R.cars.forEach(o=>{if(o===c||o.dnf)return;const gap=o.prog-c.prog;if(gap>4&&gap<25){const dx=o.x-c.x,dz=o.z-c.z,fx=Math.sin(c.yaw),fz=Math.cos(c.yaw),latd=Math.abs(dx*fz-dz*fx);if(latd<1.6)c.draft=1;}});});
  const me=R.me;
  if(me){if(me.hit){if(me.hit>6){R.shake=0.6;rMsg('УДАР!',0.9);auSfx('crash',Math.min(1,me.hit/15));}else auSfx('bump',0.5);me.hit=0;}
    if(me.overheat>3.9)rMsg('ПЕРЕГРЕВ!',2);
    if(me.punct&&!me.punctSaid){me.punctSaid=1;rMsg(me.flat?'ПРОКОЛ! ДО ФИНИША БЛИЗКО — ДОТЯНИТЕ':me.tyre>=100?'ШИНЫ СТЁРТЫ! ЖМИТЕ 🔧':'ПРОКОЛ! ЖМИТЕ 🔧',2.2);}if(!me.punct)me.punctSaid=0;
    if(me.slipR>0.22&&me.vx>10&&!me.skidSaid){me.skidSaid=1;rMsg('ЗАНОС!',0.9);}if(me.slipR<0.1)me.skidSaid=0;
    if(me.fuelRate&&me.fin===null&&!me.fuelSaid&&me.fuel<fuelNeed(me,T)&&me.fuel<32){me.fuelSaid=1;rMsg('БЕНЗИНА ДО ФИНИША НЕ ХВАТИТ — ЖМИТЕ 🔧',2.8);}if(me.fuel>60)me.fuelSaid=0;
    {const wr=Math.abs(angWrap(me.yaw-Math.atan2(T.T[me.idx][0],T.T[me.idx][1])))>1.25;me.stuck=(Math.abs(me.lat)>T.W/2+3||me.vx<1.5||wr)&&R.t>2&&!me.stopT&&!me.pitT&&!me.svc&&!me.dnf&&me.fin===null?me.stuck+dt:0;}
    // срезать нельзя: если по трассе «продвинулись» дальше, чем проехали по полю, — назад, туда, где съехали
    if(!me.dnf&&me.fin===null){const off=Math.abs(me.lat)>T.W/2+2.5;
      if(off){if(me.offIdx<0){me.offIdx=me.idx;me.offProg=me.prog;me.offDist=0;me.offLap=me.lap;}me.offDist+=Math.abs(me.vx)*dt;
        if(me.vx>8)R.shake=Math.max(R.shake,0.06+Math.random()*0.08);
        // вылетели на другой участок трассы (петля серпантина, шпилька): ближайшая точка дороги далеко впереди
        const nb=(R.cutT=(R.cutT||0)+dt)>0.2?(R.cutT=0,nearestOnTrack(T,me.x,me.z)):null,di=nb&&nb.d<T.W/2+2?nb.i-me.offIdx:0,ahead=T.closed?((di%T.n)+T.n)%T.n*T.step:di*T.step;
        if(me.prog-me.offProg>me.offDist+16||(ahead>me.offDist+30&&(!T.closed||ahead<T.len*0.7))){respawnAt(me,me.offIdx,me.offLap);rMsg('СРЕЗАТЬ НЕЛЬЗЯ!',1.8);}
        else if(Math.abs(me.lat)>T.W/2+24){respawnAt(me,me.offIdx,me.offLap);rMsg('ВНЕ ТРАССЫ',1.6);}}
      else me.offIdx=-1;}}
  R.cars.forEach(c=>{const wrong=Math.abs(angWrap(c.yaw-Math.atan2(T.T[c.idx][0],T.T[c.idx][1])))>1.1;
    if((!c.player)&&!c.dnf&&!(c.stopT>0)&&!(c.pitT>0)&&!c.punct&&c.fin===null&&R.t>4){const bad=Math.abs(c.lat)>T.W/2+1.5||wrong||c.vx<0.5;
      c.st2=bad?(c.st2||0)+dt:Math.max(0,(c.st2||0)-dt*0.5);if(c.st2>(wrong&&c.vx<6?1.5:3)){respawn(c);c.st2=0;}}
    if(c.fin===null&&!c.dnf&&c.prog>=T.raceLen){c.fin=R.time;if(c.you&&!c.player&&R.mode!=='sim')rMsgT(`${c.drvName||c.label} финишировал!`,1.6);}});
  const live=R.cars.filter(c=>c.fin===null&&!c.dnf),teamLive=R.cars.filter(c=>c.you&&c.fin===null&&!c.dnf);
  if(R.endT===undefined){
    if(me&&(me.fin!==null||me.dnf)){R.endT=me.dnf?2:2.5;if(me.fin!==null){rMsg('ФИНИШ!',3);auSfx('cheer',1);}}
    else if(!me&&(!teamLive.length||!live.length)){R.endT=R.mode==='sim'?0:2;if(R.cars.some(c=>c.you&&c.fin!==null))auSfx('cheer',1);}
    else if(R.time>(T.cfg.dur||120)*4)R.endT=0;}
  if(R.endT!==undefined){R.endT-=dt;if(R.endT<=0){if(!R.replayed&&R.me&&R.me.fin!==null&&R.mode==='drive'&&!R.ff){R.replayed=1;if(replayStart())return;}finishRace(false);return;}}
  if(R.msgT>0)R.msgT-=dt;R.shake=Math.max(0,R.shake-dt*1.5);
}
// Досчитать гонку мгновенно (режим руководителя): та же физика без отрисовки
function raceFastForward(){if(!R||R.done)return;R.ff=true;if(R.t<0)R.t=0;const dt=1/20;let f=0;while(R&&!R.done&&f<20*900){f++;R.time+=dt;R.t+=dt;raceTick(dt);}if(R&&!R.done)finishRace(false);}
function respawn(c){const T=R.trk,p=T.pts[c.idx],t=T.T[c.idx];c.x=p[0];c.z=p[2];c.yaw=Math.atan2(t[0],t[1]);c.vx=0;c.vy=0;c.r=0;c.delta=0;c.stuck=0;}
// Ближайшая точка оси дороги по всей трассе (сетка 30 м): индекс и расстояние
function nearestOnTrack(trk,x,z){const cx=Math.floor(x/30),cz=Math.floor(z/30);let bi=-1,bd=1e18;
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const L=trk.cgrid[(cx+a)+','+(cz+b)];if(!L)continue;for(const i of L){const p=trk.pts[i],d=(p[0]-x)**2+(p[2]-z)**2;if(d<bd){bd=d;bi=i;}}}
  return bi<0?null:{i:bi,d:Math.sqrt(bd)};}
// Вернуть машину на дорогу в точку i (там, где она съехала), с тем же кругом
function respawnAt(c,i,lap){const T=R.trk;c.idx=clamp(i,0,T.n-1);if(lap!==undefined)c.lap=lap;respawn(c);c.offIdx=-1;trackLocal(T,c);}
function raceLoop(now){
  if(!R||R.done)return;
  const dt=clamp((now-R.lastT)/1000,0,0.05);R.lastT=now;
  if(R.loading){rRaf=requestAnimationFrame(raceLoop);return;}
  if(R.hold){renderRace(dt);rRaf=requestAnimationFrame(raceLoop);return;}
  for(let k=0;k<(R.speed||1);k++){R.t+=dt;if(R.t>0){R.time+=dt;if(R.me)playerControl(R.me,dt);}raceTick(dt);if(!R||R.done)break;}
  if(R&&!R.done){if(R.gl)replayRec(dt*(R.speed||1));renderRace(dt);auRaceTick();}
  if(R&&!R.done)rRaf=requestAnimationFrame(raceLoop);
}
function raceOrder(){return R.cars.slice().sort((a,b)=>{const fa=a.fin!==null?a.fin:null,fb=b.fin!==null?b.fin:null;if(fa!==null&&fb!==null)return fa-fb;if(fa!==null)return -1;if(fb!==null)return 1;if(a.dnf&&!b.dnf)return 1;if(b.dnf&&!a.dnf)return -1;return b.prog-a.prog;});}
function finishRace(quit){
  const s=G;if(!R||R.done)return;R.done=true;cancelAnimationFrame(rRaf);if(R.mode!=='sim')auRaceStop();
  const T=R.trk;
  R.cars.forEach(o=>{if(o.fin!==null)o.dnf=null;});
  // незавершённые: игрок, покинувший гонку, сходит; остальных досчитываем — с шансом поломки на оставшейся дистанции
  R.cars.forEach(o=>{if(o.fin!==null||o.dnf)return;if(quit&&o.player){o.dnf='сошёл';return;}
    const left=Math.max(0,T.raceLen-o.prog)/Math.max(o.vtop*0.6,1),h=R.hz0*Math.pow((1-o.rel)/R.relRef,1.6)*1.1*0.6;
    if(Math.random()<1-Math.exp(-h*left))o.dnf=pick(['мотор','зажигание','подшипник','рессора','радиатор']);else o.fin=R.time+left;});
  const order=raceOrder(),rc=R.rc,res=order.map((c,i)=>({pos:i+1,name:c.name,drv:c.drvName,you:!!c.you,player:!!c.player,label:c.label,fin:c.fin,dnf:c.dnf,md:c.you?c.md:null,drvId:c.drvId,tc:c.tc,num:c.num,prep:c.prep,punct:c.punctN||0,priv:c.priv?1:0,pmy:c.pmy||0}));
  document.getElementById('raceScreen').hidden=true;if(R.gl)try{r3dDispose();}catch(_){}
  const mode=R.mode,info={len:T.raceLen,quit:!!quit};R=null;
  raceResults(rc,res,mode,info);
}
