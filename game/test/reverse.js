// Задний ход и кнопка «Вернуться на трассу»: node test/reverse.js
require('./harness.js')(`
SCN_OFF=true;
Math.random=(()=>{let a=5;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
setupRender=()=>{};setupRaceUI=()=>{};auRaceStart=()=>{};auSfx=()=>{};newGame('renault','fr','T','normal');G.cash=1e6;
const rc=Object.assign({},RACES.find(r=>r.t==='sprint'),{y:1906,key:'rev-test',terr:'macadam'});
const md=G.models[0];{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}md.b=lastOf(BODIES,rc.y,x=>!x.truck).id;
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
function setup(v){
  startRace({rc,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'soft',gear:0}]});
  const me=R.me;R.cars=[me];R.t=3;me.vx=v;me.gear=1;me.lat=0;
  const p=R.trk.pts[40],t=R.trk.T[40];me.idx=40;me.x=p[0];me.z=p[2];me.yaw=Math.atan2(t[0],t[1]);me.punctRate=0;me.tyreRate=0;R.hz0=0;return me;}
function step(me,k,T){const dt=1/60;for(let f=0;f<T*60;f++){rKeys.left=false;rKeys.right=false;rKeys.gas=!!k.gas;rKeys.brake=!!k.brake;R.t+=dt;R.time+=dt;playerControl(me,dt);raceTick(dt);if(!R)return;}}
// 1) стоим, держим тормоз → задний ход, машина едет назад
{const me=setup(0);step(me,{brake:1},0.3);ok(!me.rev,'0.3 с тормоза на месте — ещё не задний ход');
 step(me,{brake:1},0.4);ok(me.rev,'0.7 с тормоза на месте — задний ход включён');
 const x0=me.x,z0=me.z;step(me,{brake:1},2.5);const d=Math.hypot(me.x-x0,me.z-z0);
 ok(me.vx<-1&&me.vx>-2.8,'едет назад: '+(me.vx*3.6).toFixed(1)+' км/ч');ok(d>2,'отъехал назад на '+d.toFixed(1)+' м');
 step(me,{},1.5);ok(Math.abs(me.vx)<0.3,'отпустили — встаёт: '+me.vx.toFixed(2));
 step(me,{gas:1},0.1);ok(!me.rev,'«Газ» стоя — снова вперёд');step(me,{gas:1},2);ok(me.vx>3,'едет вперёд '+(me.vx*3.6).toFixed(0)+' км/ч');
 finishRace(true);closeSheet();closePaper();G.pending=[];}
// 2) на ходу тормоз — просто тормозит, задний не включается, пока не остановились
{const me=setup(15);step(me,{brake:1},0.6);ok(!me.rev&&me.vx>1,'на ходу тормоз тормозит ('+me.vx.toFixed(1)+' м/с), без заднего хода');
 step(me,{brake:1},4);ok(me.rev,'после остановки и удержания — задний ход');finishRace(true);closeSheet();closePaper();G.pending=[];}
// 3) авария с остановкой → после ремонта кнопка «на трассу» появляется, если стоим
{const me=setup(0);me.stopT=0.5;step(me,{},0.52);ok(me.stopT===0,'после ремонта stopT = 0 (не отрицательный)');
 step(me,{},1.5);ok(me.stuck>1.2,'стоим после ремонта — кнопка «Вернуться на трассу» видна (stuck '+me.stuck.toFixed(1)+')');
 me.lat=R.trk.W/2+6;me.vx=0;step(me,{},0.2);respawn(me);ok(me.stuck===0&&Math.abs(me.lat)<1,'нажали — снова на трассе');finishRace(true);closeSheet();closePaper();G.pending=[];}
// 4) после пит-стопа (pitT уходил в минус) кнопка тоже работает
{const me=setup(0);me.pitT=-0.02;step(me,{},1.6);ok(me.stuck>1.2,'pitT<0 не блокирует кнопку');finishRace(true);closeSheet();closePaper();G.pending=[];}
// 5) 0.29: стёртые шины, машина сползает по склону — сервис «стоп…» не зависает: через 2,5 с механик ставит её, ремонт идёт
{const me=setup(0);me.tw=[100,100,100,100];twSync(me);twPunct(me,0,R.trk,'wear');me.flat=false;me.svc=1;let slid=0;
 for(let f=0;f<5*60;f++){const dt=1/60;rKeys.gas=false;rKeys.brake=false;R.t+=dt;R.time+=dt;playerControl(me,dt);if(me.svc===1){me.vx=-1.2;slid++;}raceTick(dt);}
 ok(me.svc===2||me.svc===0,'сползающая машина встала на ремонт (svc '+me.svc+', сползала '+(slid/60).toFixed(1)+' с)');
 ok(slid/60<3,'механик подложил башмаки через '+(slid/60).toFixed(1)+' с');
 step(me,{},20);ok(me.svc===0&&!me.punct,'ремонт закончен, колесо новое');finishRace(true);closeSheet();closePaper();G.pending=[];}
// 6) 0.29: «Газ» отменяет остановку на ремонт, пока машина не встала
{const me=setup(0);twPunct(me,0,R.trk,'nail');me.flat=false;me.svc=1;
 for(let f=0;f<90;f++){const dt=1/60;rKeys.gas=f>40;rKeys.brake=false;R.t+=dt;R.time+=dt;playerControl(me,dt);if(me.svc===1)me.vx=-1.2;raceTick(dt);}
 ok(me.svc===0,'«Газ» — едем дальше без ремонта (svc '+me.svc+')');
 step(me,{},0.5);ok(me.svc===0,'сразу снова на ремонт не встаёт');finishRace(true);closeSheet();closePaper();G.pending=[];}
// 7) 0.29: стоим и не продвигаемся (упёрлись в насыпь между ветками) — кнопка видна, через 20 с маршалы выталкивают на дорогу
{const me=setup(0);step(me,{gas:1},3);const gi=me.goodIdx;ok(gi>=40,'точка «шёл по дороге» запомнена: '+gi);
 step(me,{brake:1},0.4);me.vx=0;me.vy=0;me.lat=R.trk.W/2+5;let pushed=false,shown=false;
 for(let f=0;f<22*60;f++){const dt=1/60;rKeys.gas=false;rKeys.brake=false;R.t+=dt;R.time+=dt;me.vx=0;me.vy=0;raceTick(dt);if(me.npT>4)shown=true;if(/МАРШАЛЫ/.test(R.msg||'')){pushed=true;break;}}
 ok(shown,'нет продвижения больше 4 с — кнопка «Вернуться на трассу» видна');
 ok(pushed&&Math.abs(me.lat)<1.5,'маршалы вытолкнули машину на дорогу (lat '+me.lat.toFixed(1)+')');finishRace(true);closeSheet();closePaper();G.pending=[];}
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');
`);
