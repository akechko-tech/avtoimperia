// Сервис (кнопка 🔧), бензин, уклоны и срезки: машина игрока останавливается и обслуживается, пустой бак не «ползёт»,
// в гору и по полю медленнее, срезать через поле нельзя
require('./harness.js')(`
SCN_OFF=true;
Math.random=(()=>{let a=7;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
setupRender=()=>{};setupRaceUI=()=>{};auRaceStart=()=>{};auSfx=()=>{};auRaceTick=()=>{};newGame('renault','fr','T','normal');G.cash=1e6;
const md=G.models[0];
function start(pred){const rc=RACES.find(pred);{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}md.b=lastOf(BODIES,rc.y,x=>!x.truck).id;
  startRace({rc,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'soft',gear:0}]});R.cars=[R.me];R.t=0.01;R.hz0=0;R.me.punctRate=0;return rc;}
function drive(sec,keys,every){const me=R.me,dt=1/60;let out=[];for(let f=0;f<sec*60&&R&&!R.done;f++){const k=keys?keys(f*dt):{};rKeys.gas=k.gas!==undefined?k.gas:true;rKeys.brake=!!k.b;rKeys.left=!!k.l;rKeys.right=!!k.r;
  R.t+=dt;R.time+=dt;playerControl(me,dt);raceTick(dt);if(every&&f%Math.round(every*60)===0)out.push(Math.round(me.vx*3.6));}return out;}
let bad=0;const ok=(c,msg)=>{console.log((c?'OK  ':'FAIL')+' '+msg);if(!c)bad++;};
// 1) прокол → кнопка → остановка → шины
let rc=start(r=>r.t==='circuit'&&r.y>=1906&&r.y<1914);let me=R.me;drive(6);
respawn(me);me.vx=10;trackLocal(R.trk,me);me.tw=[70,70,70,70];twSync(me);twPunct(me,3,R.trk,'nail');me.flat=false;const v0=me.vx;me.svc=1;let t=0;while(me.svc&&t<30){drive(0.1);t+=0.1;}
ok(!me.punct&&me.tyre<1&&t<30,'прокол: сервис за '+t.toFixed(1)+' с (скорость была '+Math.round(v0*3.6)+' км/ч), шины '+me.tyre);
drive(4);ok(me.vx>4,'после сервиса едет: '+Math.round(me.vx*3.6)+' км/ч');
// 2) бензин кончился → сам останавливается и доливает
me.fuel=0.3;t=0;let sawSvc=false;while(t<40){drive(0.1);t+=0.1;if(me.svc)sawSvc=true;if(sawSvc&&!me.svc)break;}
ok(sawSvc&&me.fuel>=99,'пустой бак: сервис сам, бензин '+Math.round(me.fuel)+'%, за '+t.toFixed(1)+' с');
const vA=me.vx;drive(5);ok(me.vx>vA+2,'с полным баком разгоняется: '+Math.round(vA*3.6)+' → '+Math.round(me.vx*3.6)+' км/ч');
finishRace(true);closeSheet();closePaper();G.pending=[];
// 3) уклон: подъём на горе медленнее, чем по ровному
rc=start(r=>r.t==='hill'&&r.y>=1905&&r.y<1912);me=R.me;
const sp=drive(25,null,5);let gr=0,n=0;for(let i=0;i<60;i++){gr+=(R.trk.pts[Math.min(R.trk.n-1,me.idx+1)][1]-R.trk.pts[Math.max(0,me.idx-1)][1])/8;n++;}
ok(me.grade>0.02,'в гору: уклон '+(me.grade*100).toFixed(0)+'%, скорость '+sp.join('/')+' км/ч, vtop '+Math.round(me.vtop*3.6));
finishRace(true);closeSheet();closePaper();G.pending=[];
// 4) срезка: с дороги через поле к другому участку трассы — возвращают туда, где съехали
rc=start(r=>r.t==='road'&&r.y>=1906&&r.y<1914);me=R.me;const TK=R.trk;
// ищем две далёкие по трассе, но близкие по месту точки
let pair=null;for(let i=40;i<TK.n-60&&!pair;i+=2)for(let j=i+25;j<Math.min(TK.n-2,i+400);j+=2){const d=Math.hypot(TK.pts[i][0]-TK.pts[j][0],TK.pts[i][2]-TK.pts[j][2]);if(d>TK.W+6&&d<TK.W/2+22&&!TK.town[i]&&!TK.town[j]&&!TK.bar[i]&&!TK.bar[j]){pair=[i,j,d];break;}}
if(pair){const [i,j,d]=pair;const p=TK.pts[i],q=TK.pts[j];me.idx=i;me.x=p[0];me.z=p[2];me.yaw=Math.atan2(q[0]-p[0],q[2]-p[2]);me.vx=15;me.vy=0;me.r=0;me.lap=0;trackLocal(TK,me);
  let got=false,maxIdx=i;for(let f=0;f<60*8&&!got;f++){rKeys.gas=true;rKeys.left=rKeys.right=false;R.t+=1/60;R.time+=1/60;playerControl(me,1/60);me.steer=0;me.delta=0;raceTick(1/60);maxIdx=Math.max(maxIdx,me.idx);if(R.msg==='СРЕЗАТЬ НЕЛЬЗЯ!')got=true;if(f%30===0&&process.env.DBG)console.log('   t',(f/60).toFixed(1),'idx',me.idx,'lat',me.lat.toFixed(1),'v',(me.vx*3.6).toFixed(0),'prog',me.prog.toFixed(0),'offIdx',me.offIdx,'offDist',me.offDist.toFixed(0),'svc',me.svc,'stopT',me.stopT,'msg',R.msg);}
  ok(got&&me.idx<j-20,'срезка '+i+'→'+j+' ('+d.toFixed(0)+' м по прямой, '+((j-i)*TK.step)+' м по трассе): вернули на '+me.idx+(got?' — «СРЕЗАТЬ НЕЛЬЗЯ»':''));}
else console.log('нет подходящей петли для проверки срезки');
finishRace(true);closeSheet();closePaper();G.pending=[];
// 5) склон горы в 3D-мире: на поле в гору не заехать
rc=start(r=>r.t==='hill'&&/turbie|ventoux|klausen/.test(r.id));me=R.me;const T2=R.trk;R3.on=true;R3.T=T2;R3.F=r3dField(T2);
let best=null;for(let i=60;i<T2.n-60;i+=5)for(const sd of [1,-1]){const nn=T2.N[i],p=T2.pts[i],x=p[0]+nn[0]*sd*(T2.W/2+60),z=p[2]+nn[1]*sd*(T2.W/2+60),h=fH(x,z)-p[1];if(!best||h>best.h)best={i,sd,h};}
{const {i,sd,h}=best,p=T2.pts[i],nn=T2.N[i];me.idx=i;me.x=p[0]+nn[0]*sd*(T2.W/2+3);me.z=p[2]+nn[1]*sd*(T2.W/2+3);me.yaw=Math.atan2(nn[0]*sd,nn[1]*sd);me.vx=14;me.vy=0;me.r=0;trackLocal(T2,me);T2.segCol=[];T2.bar=T2.bar.map(()=>null);
  let maxLat=0,g0=0;for(let f=0;f<60*6;f++){rKeys.gas=true;R.t+=1/60;R.time+=1/60;me.steer=0;me.delta=0;raceTick(1/60);maxLat=Math.max(maxLat,Math.abs(me.lat));g0=Math.max(g0,me.grade);}
  ok(maxLat<T2.W/2+45,'склон горы ('+h.toFixed(0)+' м над дорогой в 60 м): уклон до '+(g0*100).toFixed(0)+'%, отъехал от края дороги на '+(maxLat-T2.W/2).toFixed(1)+' м, скорость '+Math.round(me.vx*3.6)+' км/ч, кузов '+Math.round(100-me.dmg)+'%');}
R3.on=false;finishRace(true);closeSheet();closePaper();G.pending=[];
// 6) прокол у самого финиша: гонщик команды (ИИ) доезжает на спущенном колесе, а не меняет его
{const rc6=RACES.find(r=>r.t==='circuit'&&r.y>=1906&&r.y<1914);{const a=aiCarMd(rc6.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}
  startRace({rc:rc6,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'soft',gear:0},{drv:DRIVERS.find(d=>d.from<=rc6.y&&d.to>=rc6.y).id,md,prep:2,tyre:'hard',gear:0}]});R.t=0.01;R.hz0=0;
  const ai=R.cars.find(c=>c.you&&!c.player),T6=R.trk;ai.punctRate=0;R.cars.forEach(c=>{c.punctRate=0;});
  // ставим его почти на финиш, на ходу, и прокалываем
  ai.lap=T6.cfg.laps-1;ai.idx=T6.closed?Math.max(0,T6.n-Math.round(60/T6.step)):T6.n-Math.round(60/T6.step);const P6=T6.pts[ai.idx],TT6=T6.T[ai.idx];ai.x=P6[0];ai.z=P6[2];ai.yaw=Math.atan2(TT6[0],TT6[1]);ai.vx=25;trackLocal(T6,ai);
  ai.prog=T6.raceLen-60;twPunct(ai,0,T6,'nail');let stopped=0;for(let f=0;f<60*20&&ai.fin===null;f++){R.t+=1/60;R.time+=1/60;raceTick(1/60);if(ai.vx<0.5)stopped++;}
  ok(ai.flat&&ai.fin!==null&&stopped<30,'прокол за 60 м до финиша: ехать дальше — '+ai.flat+', финишировал: '+(ai.fin!==null)+', стоял кадров: '+stopped);
  // а в начале гонки — меняет колесо
  const far=flatRun({...ai,prog:T6.raceLen*0.3},T6);ok(!far,'прокол в начале гонки: менять колесо — '+(!far));
  finishRace(true);closeSheet();closePaper();G.pending=[];}
// 7) бензин: если бака почти хватает на гонку, механики заливают с запасом — до финиша хватает
{const rc7=RACES.find(r=>r.t==='circuit'&&r.y>=1920);{const a=aiCarMd(rc7.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}
  startRace({rc:rc7,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'soft',gear:0}]});const c7=R.me,T7=R.trk,p7=parts(c7.md),range=280/(p7.e.fuel||1),f0=range/Math.max(20,rc7.km);
  const used=c7.fuelRate*T7.raceLen;ok(f0<0.9?used>100:used<=88,'бензин на '+rc7.km+' км: бака на '+Math.round(f0*100)+'% гонки, расход за гонку '+Math.round(used)+'% бака'+(f0<0.9?' — нужна заправка':' — до финиша хватит'));
  finishRace(true);}
console.log(bad?'ОШИБОК: '+bad:'всё в порядке');
`);
