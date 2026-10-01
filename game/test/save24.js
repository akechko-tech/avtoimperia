// 0.24: сохранение 0.23 (Форд, война, принятые пари старого вида) открывается и играется дальше: вкладки, вызовы, военный заказ.
// node game/test/save24.js
const bot=require('./bot.js');
require('./harness.js')(bot+`
Math.random=(()=>{let a=909;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
let fails=0,errs=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
newGame('ford','us','Форд Мотор','normal');G.cash+=40000;
for(let i=0;i<12*22+11;i++){G.pending=[];botMonth('grow');G.chal=null;step();}
// «сохранение 0.23»: пари старого вида и военный контракт; новых полей нет
const rc=RACES.find(r=>r.y===G.y+1&&r.c==='us')||RACES.find(r=>r.y===G.y+1);
G.chal={type:'sales',g:'people',mq:'Chevrolet',ci:Math.max(0,COMPS.us.findIndex(c=>c.n==='Chevrolet')),y:G.y,stake:5000,acc:1,y0:(G.segY||{}).people||0,r0:0};
G.military=true;const sv=JSON.parse(JSON.stringify(G));delete sv.milTotal;delete sv.chalKind;Object.values(sv.comps).forEach(L=>L.forEach(x=>delete x.lg));
G=migrate(sv)||sv;ok(G.y===1917&&G.chal&&!G.chal.mon,'сохранение '+dstr(G)+' открыто: пари по продажам старого вида на месте');
const tabs=()=>{let ok2=true;for(const f of [vPlant,vModels,vMarket,vRace,vLog]){try{const h=f();if(!h||h.length<100)ok2=false;}catch(e){ok2=false;errs++;console.log('   view err',f.name,e.message);}}return ok2;};
ok(tabs(),'все вкладки рисуются');
let kinds={},scenes=0,mil=0;
for(let i=0;i<40;i++){
  let g=0;while(G.pending.length&&g++<40){const ev=G.pending[0];if(ev.duel)scenes++;if(ev.kicker==='Вызов'&&G.chal)kinds[G.chal.type]=(kinds[G.chal.type]||0)+1;
    const k=ev.choices&&ev.choices[0]?ev.choices[0][1]:'ok';const ch=k==='chalYes'&&G.chal&&['match','record','race'].includes(G.chal.type)?'chalNo':k;try{resolve(ch);}catch(e){errs++;console.log('   resolve err',ev.title,e.message);G.pending.shift();}}
  try{botMonth('grow');step();}catch(e){errs++;console.log('   step err',e.stack.split('\\n').slice(0,3).join(' | '));break;}
  if(G.last&&G.last.milN)mil=Math.max(mil,G.last.milN);
  if(i%6===0&&!tabs())break;}
ok(errs===0,'40 месяцев после загрузки — без ошибок ('+dstr(G)+')');
ok(mil>0&&mil<=milNeed(G),'военный заказ в 1917–1918: до '+fmtN(mil)+' машин в месяц (армии нужно ≤ '+fmtN(milNeed(G))+')');
console.log('   вызовы в газетах: '+JSON.stringify(kinds)+', сцен развязки: '+scenes);
ok(scenes>=1,'старое пари по продажам доиграно до развязки');
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');
`);
