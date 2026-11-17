// 0.51: замер управляемости на ровном поле без препятствий — торможение с рулём, руль без тормоза, тормозной путь.
// node game/test/handling51.js <год> <км/ч> <car|moto> [покрытие]; V=1 — трасса по шагам; DIFF=hist — «Историк»;
// SRC=<папка src/js другой версии> — тот же замер на старой физике (git archive <коммит> game/src/js | tar -x -C <папка>)
const Y=+(process.argv[2]||1925),KMH=+(process.argv[3]||110),CLS=process.argv[4]||'car',TERRK=process.argv[5]||'asphalt';
require('./harness.js')(`
try{SCN_OFF=true;}catch(_){}
Math.random=(()=>{let a=5;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
setupRender=()=>{};setupRaceUI=()=>{};try{auRaceStart=()=>{};auSfx=()=>{};}catch(_){}
try{newGame('renault','fr','T','normal');}catch(e){newGame('renault','fr','T');}G.cash=1e6;if(process.env.CAP)PHY.cap=+process.env.CAP;if(process.env.TRAIL)PHY.trail=+process.env.TRAIL;if(process.env.RU)PHY.rearUse=+process.env.RU;if(process.env.TH)PHY.trailH=+process.env.TH;if(process.env.WT)PHY.wt=+process.env.WT;if(process.env.TMIN)PHY.trailMin=+process.env.TMIN;if(process.env.DIFF)G.diff=process.env.DIFF;
const rc=Object.assign({},RACES.find(r=>r.t==='sprint'),{y:${Y},key:'handling-test',terr:'${TERRK}'});
const md=G.models[0];{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}md.b=lastOf(BODIES,rc.y,x=>!x.truck&&!x.moto).id;
let mdU=md;
if('${CLS}'==='moto'){mdU=Object.assign({},md,{cls:'moto'});const a=aiMotoMd(rc.y);['e','g','c','k','w'].forEach(k=>{if(a[k]!==undefined)mdU[k]=a[k];});mdU.b=lastOf(BODIES,rc.y,x=>x.moto&&!x.side).id;}
const V0=${KMH}/3.6;
try{const su0=surfUnder;surfUnder=(c,trk,lat)=>su0(c,trk,0);}catch(_){}
try{gradeAt=()=>0;}catch(_){}
try{respawn=()=>{};}catch(_){}try{respawnAt=()=>{};}catch(_){}
function run(name,script,T){
  startRace({rc,mode:'drive',entries:[{drv:'me',md:mdU,prep:2,tyre:'soft',gear:0}]});
  const me=R.me;R.cars=[me];R.t=0.001;R.trk.colG=null;R.trk.bar=[];R.trk.rg=null;me.vx=V0;me.gear=me.gr.length;
  const p=R.trk.pts[40],t=R.trk.T[40];me.idx=40;me.x=p[0];me.z=p[2];me.yaw=Math.atan2(t[0],t[1]);me.punctRate=0;me.tyreRate=0;R.hz0=0;
  const x0=me.x,z0=me.z,yaw0=me.yaw,fx=Math.sin(yaw0),fz=Math.cos(yaw0),rx=Math.cos(yaw0),rz=-Math.sin(yaw0);
  const dt=1/60;let f=0,mxB=0,mxA=0,mxP=0,mxD=0,pC=null,pV=null,t45=null,t90=null,y50=null,y100=null,stop=null,spin=false,dist=0,vmin=V0;const L=[];
  // держим скорость до манёвра газом
  while(f<T*60){f++;const tt=f*dt;const k=script(tt);rKeys.left=false;rKeys.right=!!k.r;rKeys.gas=!!k.g;rKeys.brake=!!k.b;
    R.t+=dt;R.time+=dt;playerControl(me,dt);raceTick(dt);if(!R)break;
    const X=(me.x-x0)*fx+(me.z-z0)*fz,Yy=(me.x-x0)*rx+(me.z-z0)*rz,psi=(me.yaw-yaw0)*57.3,b=Math.atan2(me.vy,Math.max(1,Math.abs(me.vx)))*57.3,a=me.vx*me.r/9.81,sp=Math.hypot(me.vx,me.vy);
    mxB=Math.max(mxB,Math.abs(b));mxA=Math.max(mxA,Math.abs(a));
    // курс = куда реально едет машина (направление скорости)
    const crs=psi+b;if(pC!==null&&tt>0.5&&sp>8){const ap=Math.abs((crs-pC)/57.3/dt)*sp/9.81,ad=(pV-sp)/dt/9.81;mxP+=(Math.max(mxP,ap)-mxP)*1;mxD=Math.max(mxD,ad);}pC=crs;pV=sp;
    if(t45===null&&Math.abs(crs)>=45)t45={t:tt,X,Y:Yy,v:sp*3.6};
    if(t90===null&&Math.abs(crs)>=90)t90={t:tt,X,Y:Yy,v:sp*3.6};
    if(y50===null&&X>=50)y50={Y:Yy,v:sp*3.6};if(y100===null&&X>=100)y100={Y:Yy,v:sp*3.6};
    if(stop===null&&sp<1.5&&tt>0.5)stop={t:tt,X,Y:Yy};
    if(Math.abs(b)>50)spin=true;
    if(f%12===0)L.push(tt.toFixed(1)+' v='+(sp*3.6).toFixed(0)+' ψ='+psi.toFixed(0)+'° β='+b.toFixed(0)+'° X='+X.toFixed(0)+' Y='+Yy.toFixed(0)+' a='+a.toFixed(2)+'g brk='+me.brk.toFixed(2)+' δ='+me.delta.toFixed(3)+' sR='+(me.slipR||0).toFixed(2)+' sF='+(me.slipF||0).toFixed(2));
    if(stop)break;}
  const F=o=>o?('t '+o.t.toFixed(1)+' с, вперёд '+o.X.toFixed(0)+' м, вбок '+o.Y.toFixed(0)+' м, '+o.v.toFixed(0)+' км/ч'):'—';
  console.log(name.padEnd(22)+'| 45°: '+F(t45).padEnd(44)+'| 90°: '+F(t90).padEnd(44)+'| вбок на 50 м: '+(y50?y50.Y.toFixed(1)+' ('+y50.v.toFixed(0)+')':'—').padEnd(11)+' на 100 м: '+(y100?y100.Y.toFixed(1)+' ('+y100.v.toFixed(0)+')':'—').padEnd(11)+'| β '+mxB.toFixed(0)+'° путь вбок '+mxP.toFixed(2)+'g замедл '+mxD.toFixed(2)+'g'+(spin?' РАЗВОРОТ':'')+(stop?' | стоп '+stop.X.toFixed(0)+' м за '+stop.t.toFixed(1)+' с':''));
  if(process.env.V)L.forEach(l=>console.log('    '+l));
  try{finishRace(true);closeSheet();closePaper();}catch(_){}G.pending=[];
}
{startRace({rc,mode:'drive',entries:[{drv:'me',md:mdU,prep:2,tyre:'soft',gear:0}]});const me=R.me;const mu=(TERR[R.trk.terrAt?R.trk.terrAt(40):rc.terr]||TERR.dirt).mu*me.grip;
 console.log('# ${Y} ${CLS} ${KMH} км/ч ${TERRK} | масса '+Math.round(me.m)+' L '+me.L.toFixed(2)+' μ·grip '+mu.toFixed(2)+' fb '+(me.fb===undefined?'?':me.fb)+' brakeK '+(me.brakeK===undefined?'?':me.brakeK.toFixed(2))+' P '+Math.round(me.P/745.7)+' л.с.');try{finishRace(true);closeSheet();closePaper();}catch(_){}G.pending=[];}
run('тормоз прямо',t=>({b:t>0.2}),30);
run('руль (накат)',t=>({r:t>0.2}),14);
run('руль + газ',t=>({r:t>0.2,g:true}),14);
run('тормоз + руль',t=>({r:t>0.2,b:t>0.2}),14);
run('тормоз 1 с, руль',t=>({r:t>1.2,b:t>0.2}),14);
run('руль, тормоз через 1с',t=>({r:t>0.2,b:t>1.2}),14);
run('т+р 1,2 с, отпустил',t=>({r:t>0.2&&t<1.4,b:t>0.2&&t<1.4}),8);
run('т+р 1,2 с, руль держу',t=>({r:t>0.2,b:t>0.2&&t<1.4}),8);
run('тормоз + руль тычками',t=>({r:t>0.2&&(t*1000%300)<150,b:t>0.2}),14);
run('тормоз тычками + руль',t=>({r:t>0.2,b:t>0.2&&(t*1000%400)<200}),14);
`);
