// 0.30: оснащение КБ и гоночной команды по эпохе: node test/kit30.js
require('./harness.js')(`
SCN_OFF=true;Math.random=(()=>{let a=29;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
setupRender=()=>{};setupRaceUI=()=>{};auRaceStart=()=>{};auSfx=()=>{};
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
newGame('renault','fr','T','normal');G.cash=1e7;G.y=1913;G.rd.lvl=5;G.rdept=2;G.ui=G.ui||{};G.ui.f={kitkb:true,kitteam:true};
// 1) в карточках видно оснащение эпохи; будущее — серым
const kb=kitHTML(G,'kb'),tm=kitHTML(G,'team');
ok(/Тормозной стенд/.test(kb)&&/Испытательный трек/.test(kb)&&!/data-k="tunnel"/.test(kb)&&/Аэродинамическая труба — с 1920/.test(kb),'КБ 1913: стенд и трек можно купить, труба — «с 1920 года»');
ok(/Stepney/.test(tm)&&/бензол/.test(tm)&&!/data-k="jack"/.test(tm),'команда 1913: колесо Stepney и бензол есть, домкратов ещё нет');
// 2) КБ: проект мотора идёт быстрее со стендом
const pj={kind:'upg',id:'e1',ck:'e',need:50,prog:0};G.rd.projs=[pj];const p0=rdPtsOf(G,pj);
ok(kitBuy(G,'dyno'),'купили стенд');const p1=rdPtsOf(G,pj);ok(Math.abs(p1/p0-1.25)<0.01,'проект мотора: '+p0.toFixed(2)+' → '+p1.toFixed(2)+' очк. в месяц');
// 3) трек: надёжность всех своих машин, разработка короче
const md=G.models[0],r0=carBase(md,0,G.y).rel,dm0=devMonths(md);kitBuy(G,'track');const r1=carBase(md,0,G.y).rel;
ok(Math.abs(r1/r0-1.03)<0.002,'надёжность вашей машины '+(r0*100).toFixed(1)+'% → '+(r1*100).toFixed(1)+'%');
const rv=rivalRef(md,G.y).md;ok(carBase(rv,0,G.y).rel===carBase(Object.assign({},rv),0,G.y).rel&&!kitCarK(rv),'эталон соперников не меняется');
ok(devMonths(md)<=dm0,'разработка: '+dm0+' → '+devMonths(md)+' мес.');
// 4) содержание — в расходах месяца
const up=kitUpkeep(G,'kb');ok(up>0,'содержание оснащения КБ '+up+' в месяц');
G.pending=[];step();ok(G.last&&G.last.rd>=up,'в отчёте месяца расходы КБ '+Math.round(G.last.rd)+' включают оснащение');
// 5) команда: запасное колесо, склады, бензол — на машине в гонке
G.drivers=[DRIVERS.find(d=>d.from<=1913&&d.to>=1913).id];
const rc=Object.assign({},RACES.find(r=>r.t==='road'),{y:1913,key:'kit30'});
const run=()=>{startRace({rc,mode:'drive',entries:[{drv:G.drivers[0],md,prep:1,tyre:'hard',gear:0}]});const c=R.cars.find(x=>x.you),o={sp:c.spares,wc:c.wheelChange,pw:c.pw,fk:c.fuelK||1,sk:c.sk};R=null;G.pending=[];return o;};
const a=run();['stepney','depot','benz','recon'].forEach(id=>ok(kitBuy(G,id),'купили: '+KIT_BY[id].name));const b=run();
ok(b.sp===a.sp+1,'запасных колёс: '+a.sp+' → '+b.sp);ok(b.wc<a.wc*0.75,'смена колеса: '+a.wc.toFixed(1)+' → '+b.wc.toFixed(1)+' с');
ok(Math.abs(b.pw/a.pw-1.03)<0.001,'мощность ×'+(b.pw/a.pw).toFixed(3));ok(b.fk===0.6,'заправка у обочины ×'+b.fk);ok(b.sk>a.sk,'мастерство '+a.sk.toFixed(3)+' → '+b.sk.toFixed(3));
// 6) нельзя купить раньше эпохи и без нужного уровня
G.y=1913;ok(!kitBuy(G,'tunnel'),'аэродинамическую трубу в 1913 году не купить');G.y=1925;G.rdept=1;ok(!kitBuy(G,'jack')&&/Нужен гоночный отдел/.test(kitHTML(G,'team')),'домкраты — только с заводской командой');
G.rdept=2;ok(kitBuy(G,'jack'),'с заводской командой — можно');
// 7) менеджер учитывает оснащение
ok(managerPlan(G,Object.assign({},rc,{y:1925,key:'kit30b'}))!==undefined,'менеджер считает план с оснащением');
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');
`);
