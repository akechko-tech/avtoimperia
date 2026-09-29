// Сравнение управляемости: жёсткость шин и «держалка» игрока. Скорость, угол заноса кузова (β), боковое ускорение
const Y=+(process.argv[2]||1906),V0=+(process.argv[3]||22),TK=+(process.argv[4]||11),HOLD=+(process.argv[5]||1),TERRK=process.argv[6]||'macadam';
require('./harness.js')(`
Math.random=(()=>{let a=5;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
setupRender=()=>{};setupRaceUI=()=>{};auRaceStart=()=>{};auSfx=()=>{};newGame('renault','fr','T','normal');G.cash=1e6;PHY.tk=${TK};PHY.hold=${HOLD};
const rc=Object.assign({},RACES.find(r=>r.t==='sprint'),{y:${Y},key:'handling-test',terr:'${TERRK}'});
const md=G.models[0];{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}md.b=lastOf(BODIES,rc.y,x=>!x.truck).id;
function run(name,script,T){
  startRace({rc,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'soft',gear:0}]});
  const me=R.me;R.cars=[me];R.t=0.001;me.vx=${V0};me.gear=me.gr.length;
  const p=R.trk.pts[40],t=R.trk.T[40];me.idx=40;me.x=p[0];me.z=p[2];me.yaw=Math.atan2(t[0],t[1]);me.punctRate=0;me.tyreRate=0;R.hz0=0;
  const dt=1/60;let f=0,mx={r:0,b:0,a:0,gu:0},tr=null;const mu=(TERR[R.trk.terrAt(me.idx)]||TERR.dirt).mu*me.grip;
  const L=[];
  while(f<T*60){f++;const tt=f*dt;const k=script(tt);rKeys.left=!!k.l;rKeys.right=!!k.r;rKeys.gas=me.vx<${V0};rKeys.brake=!!k.b;
    R.t+=dt;R.time+=dt;playerControl(me,dt);raceTick(dt);if(!R)break;
    const b=Math.atan2(me.vy,Math.max(1,me.vx))*57.3,a=me.vx*me.r/9.81;mx.r=Math.max(mx.r,Math.abs(me.r));mx.b=Math.max(mx.b,Math.abs(b));mx.a=Math.max(mx.a,Math.abs(a));
    if(f%9===0)L.push(tt.toFixed(2)+' '+(k.l?'L':k.r?'R':'-')+' r='+me.r.toFixed(2)+' β='+b.toFixed(1)+'° aLat='+a.toFixed(2)+'g v='+(me.vx*3.6).toFixed(0)+' slipR='+me.slipR.toFixed(2)+' slipF='+me.slipF.toFixed(2));}
  console.log('== '+name+' | tk '+PHY.tk+' hold '+PHY.hold+' | mu*grip '+mu.toFixed(2)+' | max r '+mx.r.toFixed(2)+' max β '+mx.b.toFixed(1)+'° max aLat '+mx.a.toFixed(2)+'g');
  if(process.env.V)L.forEach(l=>console.log('  '+l));
  finishRace(true);closeSheet();closePaper();G.pending=[];
}
run('держим вправо 2 с',t=>({r:t>0.2&&t<2.2}),3.2);
run('перестроение',t=>({r:t>0.2&&t<0.6,l:t>1.2&&t<1.6}),3);
run('тормоз в повороте',t=>({r:t>0.2&&t<2.2,b:t>0.8&&t<1.5}),3);
`);
