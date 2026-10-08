// Детский уровень: игрок только придумывает машины кнопкой «Подобрать детали повыгоднее» раз в несколько лет, остальное делает помощник
require('./harness.js')(`
Math.random=(()=>{let a=9;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
const c=${JSON.stringify(process.argv[2]||'fr')},diff=${JSON.stringify(process.argv[3]||'kids')},every=+${JSON.stringify(process.argv[4]||'4')};
newGame('custom',c,'Малыш',diff,'Ласточка');if(diff!=='kids')G.helper={on:1};
let lastDesign=-99;
for(let k=0;k<35*12;k++){
  // событие: выбираем первый вариант (как ребёнок, который жмёт «дальше»)
  while(G.pending.length){const ev=G.pending[0];const ch=ev.choices[0][1];resolve(ch);}
  const act=G.models.filter(m=>m.status==='prod'),dev=G.models.filter(m=>m.status==='dev');
  if(!dev.length&&mi(G)-lastDesign>=every*12&&mi(G)>=6){const kind=G.y>=1908?'people':'middle',md=autoDesign(kind,G),dc=devCost(md,G);
    if(G.cash>dc*1.5){G.cash-=dc;const m={...md,id:G.nextId++,name:'Модель '+G.nextId,paint:'#333',plan:'auto',status:'dev',devLeft:devMonths(md),launched:0,stock:0,backlog:0,lastDem:0,lastSold:0,lastMade:0,totalSold:0,made:0,fc:0};m.price=Math.round(refPrice(m,G)/10)*10;G.models.push(m);lastDesign=mi(G);
      // старые модели снимаем через год после запуска новой
    }}
  G.models.filter(m=>m.status==='prod').forEach(m=>{const newer=G.models.some(x=>x.status==='prod'&&x.id>m.id&&mi(G)-x.launched>=6);if(newer&&G.models.filter(x=>x.status==='prod').length>2){m.status='off';G.cash+=m.stock*m.price*0.6;m.stock=0;}});
  // 0.28: помощник «Юного магната» сам проекты КБ не ставит — ребёнок раз в квартал жмёт кнопку советника «Начать» (если не KB=0)
  if(process.env.KB!=='0'&&G.m%3===0&&rdActive(G).length<rdSlots(G)){const pj=suggestProject(G);if(pj&&G.cash>rdCost(pj,G)*3)rdBegin(G,pj);}
  step();if(G.over){console.log('КОНЕЦ',dstr(G),money(G.cash));break;}
  if(G.m===0&&(G.y-1)%3===0){const L=G.last;console.log((G.y-1)+': продано '+fmtN(G.peakLast||0)+' · касса '+money(G.cash)+' · кредит '+money(G.loan)+' · доля '+(L.share*100).toFixed(1)+'% · дилеры '+Object.entries(G.dealers).map(([c,n])=>c+n).join(',')+' · цех '+Math.round(capEff(G))+' · склад '+G.wh+' · КБ '+G.rd.lvl+' · реп '+Math.round(G.rep)+' · моделей '+G.models.filter(m=>m.status==='prod').length);}
}
console.log('наследие',Math.round(playerLegacy(G).total),'место',legacyTable(G).place);
`);
