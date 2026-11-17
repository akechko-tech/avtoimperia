// Робот «игрок по подсказкам»: рулит по дороге, газ в пол, тормозит, когда подсказка говорит «ТОРМОЗИ!» (с задержкой реакции).
// 0.51. node game/test/drive51.js <ключ гонки> <car|moto> [секунд] — вылеты, удары, время. MODE=ai — та же машина под управлением соперника (эталон);
// PW=2 — мотор вдвое мощнее; V=5 — первые вылеты; DBG=1000-1200 — шаги на участке пути; SRC=<папка> — старая версия
const KEY=process.argv[2]||'monza1922-1922',CLS=process.argv[3]||'car',TMAX=+(process.argv[4]||240),MODE=process.env.MODE||'hint',REACT=+(process.env.REACT||0.25);
require('./harness.js')(`
try{SCN_OFF=true;}catch(_){}
Math.random=(()=>{let a=5;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
setupRender=()=>{};setupRaceUI=()=>{};try{auRaceStart=()=>{};auSfx=()=>{};}catch(_){}
try{newGame('renault','fr','T','normal');}catch(e){newGame('renault','fr','T');}G.cash=1e6;
const rc=RACES.find(r=>r.key==='${KEY}');if(!rc)throw new Error('нет гонки ${KEY}');
const md=G.models[0];{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}md.b=lastOf(BODIES,rc.y,x=>!x.truck&&!x.moto).id;
let mdU=md;
if('${CLS}'==='moto'){mdU=Object.assign({},md,{cls:'moto'});const a=aiMotoMd(rc.y);['e','g','c','k','w'].forEach(k=>{if(a[k]!==undefined)mdU[k]=a[k];});mdU.b=lastOf(BODIES,rc.y,x=>x.moto&&!x.side).id;}
let nResp=0;try{const r0=respawn;respawn=c=>{nResp++;r0(c);};}catch(_){}try{const r1=respawnAt;respawnAt=(c,i,l)=>{nResp++;r1(c,i,l);};}catch(_){}
let hits=0,hitLog=[];try{const w0=wallHit;wallHit=function(c){hits++;if(hitLog.length<12&&(!hitLog.length||Math.abs(hitLog[hitLog.length-1].p-c.prog)>15))hitLog.push({p:Math.round(c.prog),v:Math.round(c.vx*3.6),lat:Math.round((c.lat||0)*10)/10,W:R.trk.W,R:Math.round(1/Math.max(1e-4,Math.abs(R.trk.K[c.idx]))),bar:JSON.stringify(R.trk.bar[c.idx]||null).slice(0,60),dmg:Math.round(c.dmg)});return w0.apply(this,arguments);};}catch(_){}
let ohits=0;try{const o0=obstacleHit;obstacleHit=function(){ohits++;return o0.apply(this,arguments);};}catch(_){}
startRace({rc,mode:'drive',entries:[{drv:'me',md:mdU,prep:2,tyre:'soft',gear:0,pw:+(process.env.PW||1)}]});
const me=R.me,TK=R.trk;R.cars=[me];R.hz0=0;me.punctRate=0;
{const k=+(process.env.PW||1);if(k!==1){me.P*=k;let v=me.vtop;for(let i=0;i<30;i++){const f=me.kd*v*v*v+me.crr*me.m*GRAV*v-me.P,df=3*me.kd*v*v+me.crr*me.m*GRAV;v=Math.max(3,v-f/df);}const r=v/me.vtop;me.vtop=v;me.gr=me.gr.map(g=>g*r);}}
if('${MODE}'==='ai'){me.player=false;}
const dt=1/60;let latch=false,f=0,offT=0,offN=0,wasOff=false,maxOut=0,brkOn=false,brkAt=-9,gasOn=true,wantB=false,wantSince=0,vmax=0,stuckT=0,stuckAt=[],late=0,badN=0,wasBad=false,coast=0;
const log=[];
while(R&&f<${TMAX}*60){f++;const tt=f*dt;
  if(R.t<=0){R.t+=dt;if(R.t<=0)continue;}
  if(me.player){
    // руль: точка впереди на оси дороги
    const v=Math.max(0,me.vx),look=6+v*0.75,ai=Math.max(1,Math.round(look/TK.step));let ti=me.idx+ai;if(TK.closed)ti%=TK.n;else ti=Math.min(TK.n-1,ti);
    const tp=TK.pts[ti],dx=tp[0]-me.x,dz=tp[2]-me.z,fx=Math.sin(me.yaw),fz=Math.cos(me.yaw),lz=dx*fx+dz*fz,lx=dx*Math.cos(me.yaw)-dz*Math.sin(me.yaw);
    const kap=2*lx/Math.max(16,lz*lz+lx*lx);let want=Math.atan(me.L*kap);if(v>5)want+=clamp((kap*v-me.r)*0.3,-0.2,0.2);want+=clamp((me.lat||0)*0.02,-0.09,0.09);const mu=me.muNow||me.grip,dmax=Math.min(0.5,1.3*me.L*mu*GRAV/Math.max(1,v*v)+0.09);
    RW.drag=true;RW.target=clamp(want/dmax*1.15,-1,1);
    // педали — по подсказке, с задержкой реакции
    let pn=null;try{pn=paceNote(me);}catch(_){}
    const bad0=!!(pn&&pn.lvl==='bad');if(bad0&&!wasBad)badN++;wasBad=bad0;
    // человек: услышал «тормози» — тормозит, пока скорость не станет той, что на подсказке
    if(bad0)latch=true;else if(!pn||pn.lvl==='ok')latch=false;const bad=latch;
    if(bad!==wantB){wantB=bad;wantSince=tt;}
    if(tt-wantSince>=${REACT})brkOn=wantB;
    rKeys.brake=brkOn;rKeys.gas=!brkOn;rKeys.left=false;rKeys.right=false;
    if(process.env.DBG){const [d0,d1]=process.env.DBG.split('-').map(Number);if(me.prog>=d0&&me.prog<=d1&&f%15===0)console.log('  '+Math.round(me.prog)+' м v='+(v*3.6).toFixed(0)+' K=1/'+(1/Math.max(1e-5,Math.abs(TK.K[me.idx]))).toFixed(0)+' lat='+(me.lat||0).toFixed(1)+' pn='+(pn?pn.lvl+' '+pn.kmh+' через '+pn.dist.toFixed(0)+' нужно '+(pn.need||0).toFixed(0):'нет')+' brk='+me.brk.toFixed(2)+' δ='+me.delta.toFixed(3)+' steer='+me.steer.toFixed(2)+' sR='+(me.slipR||0).toFixed(2)+' sF='+(me.slipF||0).toFixed(2)+' off='+me.off+' mu='+(me.muNow||0).toFixed(2)+' aLat='+(me.vx*me.r/9.81).toFixed(2)+'g');}
    playerControl(me,dt);}
  R.t+=dt;R.time+=dt;raceTick(dt);if(!R)break;
  const out=Math.abs(me.lat||0)-TK.W/2;if(out>maxOut)maxOut=out;
  const off=out>0.6;if(off){offT+=dt;if(!wasOff){offN++;log.push('вылет: '+Math.round(me.prog)+' м, '+(me.vx*3.6).toFixed(0)+' км/ч, кривизна R='+(1/Math.max(1e-4,Math.abs(TK.K[me.idx]))).toFixed(0)+' м');}}wasOff=off;
  vmax=Math.max(vmax,me.vx);
  if(Math.abs(me.vx)<0.6&&tt>6&&me.fin===null&&!me.dnf){stuckT+=dt;if(stuckT>3&&(stuckAt.length===0||Math.abs(stuckAt[stuckAt.length-1].p-me.prog)>30)){stuckAt.push({p:me.prog,t:tt,idx:me.idx,surf:me.surf,grade:me.grade,gear:me.gear,thr:me.thr,brk:me.brk,svc:me.svc,stopT:me.stopT,heat:me.heat,fuel:me.fuel,dmg:me.dmg,push:me.push,mu:me.muNow,wait:me.wait,inWater:me.inWater,rev:me.rev,punct:me.punct,flat:me.flat});}}else stuckT=0;
  if(me.fin!==null||me.dnf)break;}
const tt=f*dt;
console.log('${KEY} ${CLS} ${MODE} | '+(me.fin!==null?'ФИНИШ':'нет финиша')+(me.dnf?' СХОД':'')+' | время '+tt.toFixed(0)+' с, путь '+Math.round(me.prog)+' из '+Math.round(TK.raceLen)+' м, средняя '+(me.prog/Math.max(1,tt)*3.6).toFixed(0)+' км/ч, макс '+(vmax*3.6).toFixed(0)+' | вылетов '+offN+' ('+offT.toFixed(1)+' с), дальше бровки на '+maxOut.toFixed(1)+' м | стены '+hits+', препятствия '+ohits+', возвратов '+nResp+' | повреждения '+Math.round(me.dmg)+' | «тормози» '+badN+' | '+Math.round(me.P/745.7)+' л.с.');
if(process.env.V)log.slice(0,+process.env.V).forEach(l=>console.log('   '+l));
hitLog.forEach(h=>console.log('   СТЕНА: '+JSON.stringify(h)));
stuckAt.forEach(s=>console.log('   СТОИТ: '+JSON.stringify(s,(k,v)=>typeof v==='number'?Math.round(v*100)/100:v)));
`);
