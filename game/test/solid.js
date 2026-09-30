// Твёрдые препятствия: машина игрока едет на дом, дерево, толпу, забор под разными углами — корпус не должен в них заходить
require('./harness.js')(`
Math.random=(()=>{let a=7;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
setupRender=()=>{};setupRaceUI=()=>{};auRaceStart=()=>{};auSfx=()=>{};newGame('renault','fr','T','normal');G.cash=1e6;
// 0.18: удар о дом может закончиться сходом — здесь проверяем только, что корпус не заходит в препятствие
crashResolve=c=>{c.crash=null;};
function trial(key,kinds,ang,v0){
  const rc=RACES.find(r=>r.key===key);const md=G.models[0];{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}md.b=lastOf(BODIES,rc.y,x=>!x.truck).id;
  startRace({rc,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'soft',gear:0}]});const T=R.trk,me=R.me;R.cars=[me];R.t=0.01;me.relK=1;R.hz0=0;me.punctRate=0;
  const obs=T.col.filter(o=>kinds.includes(o.kind));if(!obs.length)return console.log(key,kinds.join('/'),'нет таких препятствий');
  let worst=0,hits=0,tested=0;
  for(const o of obs.slice(0,40)){tested++;
    // ставим машину в 9 м от препятствия носом на него (со сдвигом угла), полный газ
    const a0=Math.random()*6.28,px=o.x+Math.sin(a0)*9,pz=o.z+Math.cos(a0)*9;me.x=px;me.z=pz;me.yaw=Math.atan2(o.x-px,o.z-pz)+ang;me.vx=v0;me.vy=0;me.r=0;me.dmg=0;me.stopT=0;me.dnf=null;me.idx=o.i!==undefined?o.i:me.idx;
    let best=1e9;for(let t=0;t<60;t++){const k=T.col.indexOf(o);me.idx=nearestIdx(T,me.x,me.z);rKeys.gas=true;playerControl(me,1/30);raceTick(1/30);
      const S=carCapsule(me);let d;if(!o.box){const q=segPt(S[0],S[1],S[2],S[3],o.x,o.z);d=Math.hypot(q[0]-o.x,q[1]-o.z)-o.r-CAR_R;}
      else{d=1e9;for(let k2=0;k2<=8;k2++){const tt=k2/8,x=S[0]+(S[2]-S[0])*tt,z=S[1]+(S[3]-S[1])*tt,b=o.box,lx=(x-o.x)*b.ux+(z-o.z)*b.uz,lz=(x-o.x)*b.vx+(z-o.z)*b.vz,cx=clamp(lx,-b.hu,b.hu),cz=clamp(lz,-b.hv,b.hv);d=Math.min(d,Math.hypot(lx-cx,lz-cz)-CAR_R);}}
      best=Math.min(best,d);}
    if(best<-0.05)hits++;worst=Math.min(worst,best);}
  console.log(key.padEnd(14),kinds.join('/').padEnd(22),'угол',(ang*57.3).toFixed(0).padStart(3)+'°','скорость',(v0*3.6).toFixed(0),'| проверено',tested,'| заходов глубже 5 см:',hits,'| худшее',worst.toFixed(2),'м');
  finishRace(true);closeSheet();closePaper();G.pending=[];
}
function nearestIdx(T,x,z){let b=0,bd=1e18;for(let i=0;i<T.n;i++){const p=T.pts[i],d=(p[0]-x)**2+(p[2]-z)**2;if(d<bd){bd=d;b=i;}}return b;}
[[0,15],[0.4,20],[0.9,25]].forEach(([a,v])=>{
  trial('monaco-1929',['house_fr','house_it','villa','cafe','fachwerk'],a,v);
  trial('pbp-1895',['plane','oak','elm','poplar','cypress'],a,v);
  trial('gb1905-1905',['crowd','stand','fence','wall','hedge'],a,v);
  trial('lm1921-1921',['pits','church','cart','billboard','sign','pole','lamp','km'],a,v);});
`);
