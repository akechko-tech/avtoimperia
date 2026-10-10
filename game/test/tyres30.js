// 0.30: четыре шины по отдельности: node test/tyres30.js
require('./harness.js')(`
SCN_OFF=true;Math.random=(()=>{let a=11;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
setupRender=()=>{};setupRaceUI=()=>{};auRaceStart=()=>{};auSfx=()=>{};newGame('renault','fr','T','normal');G.cash=1e6;
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
const rc=Object.assign({},RACES.find(r=>r.t==='sprint'),{y:1908,key:'tyre30',terr:'macadam'});
const md=G.models[0];{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}md.b=lastOf(BODIES,rc.y,x=>!x.truck).id;
function setup(){startRace({rc,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'soft',gear:0}]});const me=R.me;R.cars=[me];R.t=3;me.vx=0;me.gear=1;me.lat=0;
  const p=R.trk.pts[20],t=R.trk.T[20];me.idx=20;me.x=p[0];me.z=p[2];me.yaw=Math.atan2(t[0],t[1]);me.punctRate=0;R.hz0=0;return me;}
function drive(me,fn,T){const dt=1/60;let d0=me.prog;for(let f=0;f<T*60;f++){const k=fn(f*dt,me);rKeys.left=!!k.left;rKeys.right=!!k.right;rKeys.gas=!!k.gas;rKeys.brake=!!k.brake;R.t+=dt;R.time+=dt;playerControl(me,dt);raceTick(dt);if(!R)break;}return me.prog-d0;}
const end=()=>{finishRace(true);closeSheet();closePaper();G.pending=[];};
// 1) у каждой шины свой износ: на газу с пробуксовкой задние стираются быстрее передних
{const me=setup();ok(Array.isArray(me.tw)&&me.tw.length===4&&me.tq.every(q=>q>0.85&&q<1.13),'четыре шины, у каждой своя стойкость: '+me.tq.map(q=>q.toFixed(2)).join(' '));
 drive(me,()=>({gas:1}),12);const f=(me.tw[0]+me.tw[1])/2,r=(me.tw[2]+me.tw[3])/2;ok(r>f,'разгон: задние (ведущие) '+r.toFixed(2)+'% > передние '+f.toFixed(2)+'%');
 ok(me.tyre===Math.max(...me.tw),'«шина» машины — самая стёртая из четырёх');end();}
// 2) змейка вправо-влево неравномерна: в правом повороте нагружены левые — проверим одной стороной
{const me=setup();drive(me,()=>({gas:1}),4);me.tw=[0,0,0,0];me.tq=[1,1,1,1];twSync(me);drive(me,(t,m)=>Object.assign(m.vx<13?{gas:1}:{},{right:1}),5);
 const L=me.tw[0]+me.tw[2],Rr=me.tw[1]+me.tw[3];ok(L>Rr*1.08,'долгий правый поворот: левые (внешние) стёрлись сильнее — '+L.toFixed(2)+' против '+Rr.toFixed(2));end();}
// 3) прокол одного колеса: машину тянет в его сторону, ось держит хуже
{const me=setup();drive(me,()=>({gas:1}),5);const lat0=me.lat,y0=me.yaw;twPunct(me,0,R.trk,'nail');me.flat=true;
 ok(me.punct&&me.tp[0]===1&&me.tp[1]===0&&me.tp[2]+me.tp[3]<=1,'прокол переднего левого: остальные целы ('+me.tp.join('')+')');
 ok(twAxle(me,0,1)<twAxle(me,2,3),'передняя ось держит хуже задней: '+twAxle(me,0,1).toFixed(2)+' / '+twAxle(me,2,3).toFixed(2));
 ok(twPull(me)<0,'спущенное левое тянет влево');let yawMin=0;const yy=me.yaw;drive(me,()=>({gas:1}),2.5);
 ok(angWrap(me.yaw-yy)<-0.02||me.lat>lat0+0.3,'без руля машина уходит влево (рыскание '+angWrap(me.yaw-yy).toFixed(3)+', сдвиг '+(me.lat-lat0).toFixed(2)+' м)');end();}
// 4) на спущенном — до обода: покрышка разлетается, повреждения растут
{const me=setup();drive(me,()=>({gas:1}),4);twPunct(me,3,R.trk,'nail');me.flat=true;me.tpL[3]=60;const d0=me.dmg;drive(me,(t,m)=>m.vx<10?{gas:1}:{},12);
 ok(me.tp[3]===2,'проехали на спущенном заднем правом — покрышка разлетелась, едем на ободе');ok(me.dmg>d0+1,'обод бьёт колесо: повреждения '+d0.toFixed(1)+' → '+me.dmg.toFixed(1));end();}
// 5) механик соперника меняет только пробитое колесо, остальные — со своим износом
{const me=setup();me.player=false;drive(me,()=>({}),0.1);me.tw=[30,32,40,41];twSync(me);twPunct(me,2,R.trk,'nail');me.flat=false;me.vx=0;
 for(let f=0;f<60*90&&me.punct;f++){const dt=1/60;R.t+=dt;R.time+=dt;raceTick(dt);if(!R)break;}
 ok(!me.punct&&me.tw[2]<5&&me.tw[0]>=29&&me.tw[3]>=40,'поменяли одно колесо (заднее левое): износ '+me.tw.map(x=>x.toFixed(0)).join(' / '));ok(me.spares===me.spare0-1,'запасок стало меньше: '+me.spares);end();}
// 6) сервис игрока: пробитое + стёртые (от 45%), время растёт с числом колёс
{const me=setup();me.tw=[50,10,60,20];twSync(me);twPunct(me,1,R.trk,'nail');const P=svcPlan(me);ok(me.svcL&&me.svcL.join()==='0,1,2','сервис: меняем пробитое и стёртые — '+(me.svcL||[]).join(',')+' ('+P.what.join(', ')+')');
 const t1=twTime(me,[1],false),t3=twTime(me,[0,1,2],false);ok(t3>t1*1.4,'три колеса дольше одного: '+t1.toFixed(1)+' → '+t3.toFixed(1)+' с');svcDone(me);ok(!me.punct&&me.tw[3]===20&&me.tw[0]===0,'после сервиса: '+me.tw.map(x=>x.toFixed(0)).join(' / '));end();}
// 7) яма пробивает колесо со своей стороны
{const me=setup();let side=null;for(let i=0;i<400&&!me.punct;i++){potImpact(me,R.trk,{d:0.12},0.12,1,30);}ok(me.punct&&(me.tp[0]||me.tp[2]),'яма слева пробила левое колесо ('+me.tp.join('')+')');end();}
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');
`);
