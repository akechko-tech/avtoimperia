// 0.32: сохранения прежних версий открываются (нет линеек, мотоцеха, мотомарок, риска «не по ТЗ», переносов),
// мотомастерская сохраняется и загружается, все вкладки рисуются.   node game/test/save32.js
const bot=require('./bot.js');
require('./harness.js')(bot+`
Math.random=(()=>{let a=321;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
let fails=0,errs=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
const views=()=>{let good=true;for(const f of [vPlant,vModels,vMarket,vRace,vLog]){try{const h=f();if(!h||h.length<100)good=false;}catch(e){good=false;errs++;console.log('   view err',f.name,e.message);}}return good;};
const play=(n,tag)=>{for(let i=0;i<n;i++){let g=0;while(G.pending.length&&g++<40){const ev=G.pending[0];const k=ev.choices&&ev.choices[0]?ev.choices[0][1]:'ok';try{resolve(k==='chalYes'?'chalNo':k);}catch(e){errs++;console.log('   resolve err',tag,e.message);G.pending.shift();}}
  try{botMonth('grow');step();}catch(e){errs++;console.log('   step err',tag,e.stack.split('\\n').slice(0,3).join(' | '));break;}}};
// 1) «сохранение 0.31»: автомобильная марка 1912 года без полей 0.32
newGame('renault','fr','Рено','normal');G.cash+=30000;play(12*17,'make');
const sv=JSON.parse(JSON.stringify(G));['lines','mcap','mcomps','mfleet','mcapBuild','mshopB','carShopB','myearSold','mhomeY','mhomePrev'].forEach(k=>delete sv[k]);
sv.models.forEach(m=>{delete m.dv;});if(sv.rd){delete sv.rd.flaw;delete sv.rd.xtry;delete sv.rd.done;}if(sv.peak)delete sv.peak.myear;
G=migrate(sv)||sv;ok(G.lines&&G.lines.car&&!G.lines.moto&&G.mcomps&&G.mcomps.fr&&G.mcomps.fr.length===MCOMPS.fr.length,'сохранение '+dstr(G)+' открыто: линейка — автомобили, мотомарки дописаны');
ok(views(),'все вкладки рисуются после загрузки');
play(36,'old');ok(errs===0,'три года после загрузки — без ошибок ('+dstr(G)+')');
ok(!motoVis(G)&&!G.models.some(isMoto),'мотоциклы скрыты, пока мотоцех не построен');
// 2) та же марка строит мотоцех и делает мотоцикл
G.cash+=50000;ok(mshopStart(G),'мотоцех заложен');play(4,'mshop');ok(lineOn(G,'moto')&&G.mcap>0,'мотоцех готов: '+Math.round(mcapUnits(G))+' мотоциклов в месяц');
G.ui.line='moto';ok(views(),'вкладки с фильтром «Мото» рисуются');
openDesigner();ok(draft&&isMoto(draft),'конструктор открылся с мотоциклом');const md={...draft,eq:[]};
G.models.push({...md,id:G.nextId++,name:'Мото-1',price:Math.round(refPrice(md,G)/10)*10,plan:'auto',status:'prod',devLeft:0,launched:mi(G),stock:0,backlog:0,lastDem:0,lastSold:0,lastMade:0,totalSold:0,made:0,fc:0});closeSheet();
play(12,'moto');const L=G.last;ok(errs===0&&(motoSold(G)>0),'мотоцикл продаётся: за год '+fmtN(motoSold(G))+' шт., машины — '+fmtN(L.sold)+' в месяц');
ok(totalSold(G)>0&&totalSold(G)===G.models.reduce((a,m)=>a+(isMoto(m)?0:m.totalSold),0)+(G.milTotal||0),'«продано машин» — без мотоциклов');
// 3) мотомастерская: сохранить — загрузить
newMotoGame('custom','uk','Мото','normal','М1');play(18,'ms');const js=JSON.stringify(G);G=migrate(JSON.parse(js));
ok(G.motoStart&&lineOn(G,'moto')&&!lineOn(G,'car'),'мотомастерская '+dstr(G)+' сохранена и загружена: автомобильного цеха нет');
G.ui.line='car';ok(views(),'вкладки «Авто» у мастерской без автомобиля рисуются');play(12,'ms2');ok(errs===0,'год после загрузки — без ошибок');
console.log(fails||errs?'ОШИБОК: '+(fails+errs):'всё в порядке');if(fails||errs)process.exitCode=1;
`);
