// 0.29: шины по фазам и износ от стиля езды и покрытия: node test/tyres29.js
require('./harness.js')(`
SCN_OFF=true;Math.random=(()=>{let a=9;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
setupRender=()=>{};setupRaceUI=()=>{};auRaceStart=()=>{};auSfx=()=>{};newGame('renault','fr','T','normal');G.cash=1e6;
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
// 1) фазы сцепления
ok(tyreGripK(0.2)>=0.98&&tyreGripK(0)===1,'зелёная фаза: сцепление полное ('+tyreGripK(0.2).toFixed(3)+')');
ok(tyreGripK(0.65)<0.93&&tyreGripK(0.65)>0.88,'жёлтая: держит хуже ('+tyreGripK(0.65).toFixed(3)+')');
ok(tyreGripK(0.9)<0.8,'красная: сцепление обрывается ('+tyreGripK(0.9).toFixed(3)+')');
{let mono=true;for(let w=0;w<1.2;w+=0.01)if(tyreGripK(w+0.01)>tyreGripK(w)+1e-9)mono=false;ok(mono,'сцепление только падает с износом');}
ok(tyrePhase(0.3)===0&&tyrePhase(0.6)===1&&tyrePhase(0.85)===2,'фазы: зелёная до 50%, жёлтая до 80%, красная дальше');
// 2) стиль езды: ровно против «тормоз-газ» на той же прямой
const rc=Object.assign({},RACES.find(r=>r.t==='sprint'),{y:1906,key:'tyre-test',terr:'macadam'});
const md=G.models[0];{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}md.b=lastOf(BODIES,rc.y,x=>!x.truck).id;
function setup(){startRace({rc,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'soft',gear:0}]});const me=R.me;R.cars=[me];R.t=3;me.vx=0;me.gear=1;me.lat=0;
  const p=R.trk.pts[20],t=R.trk.T[20];me.idx=20;me.x=p[0];me.z=p[2];me.yaw=Math.atan2(t[0],t[1]);me.punctRate=0;me.tyre=0;R.hz0=0;return me;}
function drive(me,fn,T){const dt=1/60;let d0=me.prog;for(let f=0;f<T*60;f++){const k=fn(f*dt,me);rKeys.left=!!k.left;rKeys.right=!!k.right;rKeys.gas=!!k.gas;rKeys.brake=!!k.brake;R.t+=dt;R.time+=dt;playerControl(me,dt);raceTick(dt);if(!R)break;}return me.prog-d0;}
let smooth,harsh;
// ровная езда: держим ~45 км/ч лёгким газом; резкая — та же скорость, но змейкой на пределе сцепления и с торможениями
{const me=setup();drive(me,()=>({gas:1}),4);me.tw=[0,0,0,0];twSync(me);const d=drive(me,(t,m)=>m.vx<12.5?{gas:1}:{},14);smooth=me.tyre/Math.max(1,d);ok(d>120,'ровно: '+Math.round(d)+' м, износ '+me.tyre.toFixed(2)+'%, покрытие '+me.surf);finishRace(true);closeSheet();closePaper();G.pending=[];}
{const me=setup();drive(me,()=>({gas:1}),4);me.tw=[0,0,0,0];twSync(me);let gu=0,n=0;const d=drive(me,(t,m)=>{gu+=m.gu;n++;const q=Math.floor(t/0.3)%6;return Object.assign(m.vx<12.5?{gas:1}:{brake:m.vx>14?1:0},q===1||q===2?{left:1}:q===4||q===5?{right:1}:{});},14);harsh=me.tyre/Math.max(1,d);
 ok(d>30&&Math.abs(me.lat)<R.trk.W,'змейкой на пределе: '+Math.round(d)+' м, износ '+me.tyre.toFixed(2)+'%, средняя загрузка шин '+(gu/n).toFixed(2)+', покрытие '+me.surf);finishRace(true);closeSheet();closePaper();G.pending=[];}
ok(harsh>smooth*1.4,'повороты на пределе и торможения едят шины быстрее на метр: в '+(harsh/smooth).toFixed(2)+' раза');
// 3) покрытие: та же езда по камням рядом с дорогой — быстрее, по траве — медленнее
ok((TYRE_SURF.rock/TYRE_SURF.macadam)>1.5&&TYRE_SURF.grass<TYRE_SURF.macadam,'камни едят протектор быстрее щебня, трава — медленнее');
// 4) соперник в красной фазе далеко от финиша сам меняет шины на обочине
{const me=setup();R.cars=[me];me.player=false;me.tw=[90,88,91,92];twSync(me);me.vx=12;const d0=me.prog;let swapped=false;
 for(let f=0;f<60*60;f++){const dt=1/60;R.t+=dt;R.time+=dt;raceTick(dt);if(!R)break;if(me.tyre<5){swapped=true;break;}}
 ok(swapped,'соперник со стёртыми шинами встал и поставил новые');finishRace(true);closeSheet();closePaper();G.pending=[];}
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');
`);
