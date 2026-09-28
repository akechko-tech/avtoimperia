// Управляемость машины игрока: сценарии нажатий на прямой трассе, лог курса, вращения и заноса
// node test/handling.js [год] [скорость м/с]
const Y=+(process.argv[2]||1906),V0=+(process.argv[3]||22);
require('./harness.js')(`
Math.random=(()=>{let a=5;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
setupRender=()=>{};setupRaceUI=()=>{};auRaceStart=()=>{};auSfx=()=>{};newGame('renault','fr','T','normal');G.cash=1e6;
const rc=Object.assign({},RACES.find(r=>r.t==='sprint'),{y:${Y},key:'handling-test',terr:'macadam'});
const md=G.models[0];md.e=lastOf(ENGINES,rc.y).id;md.c=lastOf(CHASSIS,rc.y).id;md.w=lastOf(TYRES,rc.y).id;md.b=lastOf(BODIES,rc.y,x=>!x.truck).id;if(overpower(md))md.e=ENGINES.filter(e=>e.y<=rc.y&&e.hp<=byId(CHASSIS,md.c).max).pop().id;
function run(name,script,T,prep){
  startRace({rc,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'soft',gear:0}]});
  const me=R.me;R.cars=[me];R.t=0.001;me.vx=${V0};me.gear=me.gr.length;me.lat=0;
  const p=R.trk.pts[40],t=R.trk.T[40];me.idx=40;me.x=p[0];me.z=p[2];me.yaw=Math.atan2(t[0],t[1]);me.punctRate=0;me.tyreRate=0;R.hz0=0;if(prep)prep(me,R.trk);let hits=0;
  const dt=1/60,log=[];let f=0,maxR=0,maxSlip=0,maxYaw=0;
  while(f<T*60){f++;const tt=f*dt;const k=script(tt);rKeys.left=!!k.l;rKeys.right=!!k.r;rKeys.gas=me.vx<${V0};rKeys.brake=false;
    R.t+=dt;R.time+=dt;playerControl(me,dt);raceTick(dt);if(!R)break;
    const ry=angWrap(me.yaw-Math.atan2(R.trk.T[me.idx][0],R.trk.T[me.idx][1]));maxR=Math.max(maxR,Math.abs(me.r));maxSlip=Math.max(maxSlip,me.slipR);maxYaw=Math.max(maxYaw,Math.abs(ry));if(me.hit){hits++;me.hit=0;}
    if(f%6===0)log.push([tt.toFixed(1),(k.l?'L':k.r?'R':'-'),me.steer.toFixed(2),me.delta.toFixed(3),me.r.toFixed(2),me.vy.toFixed(2),(ry*57.3).toFixed(1),me.lat.toFixed(1),(me.vx*3.6).toFixed(0)].join(' '));}
  console.log('== '+name+'  max|r| '+maxR.toFixed(2)+' max slipR '+maxSlip.toFixed(2)+' max|yaw| '+(maxYaw*57.3).toFixed(1)+'°'+' ударов '+hits+' урон '+me.dmg.toFixed(0));
  console.log('  t   key steer delta  r    vy   yaw°  lat  км/ч');log.forEach(l=>console.log('  '+l));
  finishRace(true);closeSheet();closePaper();G.pending=[];
}
const scen=process.env.SC||'all';
if(scen==='all'||scen==='tap')run('короткое касание вправо 0.15 с',t=>({r:t>0.2&&t<0.35}),3);
if(scen==='all'||scen==='lane')run('перестроение: вправо 0.5 с, пауза, влево 0.5 с',t=>({r:t>0.2&&t<0.7,l:t>1.3&&t<1.8}),4);
if(scen==='all'||scen==='hold')run('держим вправо 1.5 с',t=>({r:t>0.2&&t<1.7}),3.5);
if(scen==='all'||scen==='swerve')run('объезд: влево 0.4 с, сразу вправо 0.8 с, отпустить',t=>({l:t>0.2&&t<0.6,r:t>0.6&&t<1.4}),4);
if(scen==='all'||scen==='wall')run('стена дома слева, курс 20° в стену, газ',t=>({}),3,(me,T)=>{T.bar=T.bar.map(()=>({L:T.W/2+2.5,R:T.W/2+2.5}));T.segCol=[];me.yaw-=0.35;});
if(scen==='all'||scen==='wall2')run('стена слева, курс 45° в стену',t=>({}),3,(me,T)=>{T.bar=T.bar.map(()=>({L:T.W/2+2.5,R:T.W/2+2.5}));T.segCol=[];me.yaw-=0.8;});
if(scen==='all'||scen==='tree')run('дерево чуть левее по курсу',t=>({}),3,(me,T)=>{const i=me.idx+6,p=T.pts[i],nn=T.N[i];const o={x:p[0]+nn[0]*1.2,z:p[2]+nn[1]*1.2,r:0.55,kind:'oak'};T.col.push(o);T.segCol=T.segCol||[];for(let k=-3;k<=3;k++)(T.segCol[i+k]=T.segCol[i+k]||[]).push(o);});
`);
