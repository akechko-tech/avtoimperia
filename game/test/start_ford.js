// Старт за Форда в США: как играл тестировщик — дилеры во Франции, Англии, Германии и дома, новые модели по ходу
const bot=require('./bot.js');
require('./harness.js')(bot+`
Math.random=(()=>{let a=11;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
const strat=${JSON.stringify(process.argv[2]||'export')};
newGame('ford','us','Форд Мотор','normal');const out=[];
for(let i=0;i<12*8;i++){G.pending=[];
  if(i===2&&strat!=='home'){[['fr',10],['uk',8],['de',6]].forEach(([c,n])=>{const cst=n*dealerCost(G);if(G.cash>cst){G.cash-=cst;G.dealers[c]=(G.dealers[c]||0)+n;}});}
  if(i%6===0){for(const c of Object.keys(G.dealers)){const need=dealerNeed(c,G),have=dealerCount(G,c);if(have&&have<need*0.8&&G.cash>dealerCost(G)*4){G.dealers[c]=have+1;G.cash-=dealerCost(G);}}}
  if(G.m===0&&G.y>=1896&&G.y%2===0&&G.cash>12000){const nm=design(G.y>=1905?'people':'middle');G.cash-=devCost(nm,G)+toolingCost(nm,G);G.models.push(nm);}
  if(G.m%3===0)G.models.filter(m=>m.status==='prod').forEach(m=>{m.price=bestPrice(m);});
  {const act=G.models.filter(m=>m.status==='prod'),dem=act.reduce((a,m)=>a+(m.fc||m.lastDem||0),0),pend=G.capBuild.reduce((a,b)=>a+b.units,0);if(dem>capEff(G)*0.9&&!pend){const add=Math.max(2,Math.round(G.cap*0.5)),cost=add*capUnitCost(G);if(G.cash>cost*1.5){G.cash-=cost;G.plantVal+=cost;G.capBuild.push({units:add,left:2});}}}
  step();
  if(i%6===5){const act=G.models.filter(m=>m.status==='prod'),L=G.last;out.push(dstr(G)+' cash '+Math.round(G.cash/1000)+'k sold/mo '+act.reduce((a,m)=>a+m.lastSold,0)+' dem '+Math.round(act.reduce((a,m)=>a+m.lastDem,0))+' prof '+Math.round(L.profit)+' by '+JSON.stringify(Object.fromEntries(Object.entries(L.mk).map(([c,m])=>[c,Math.round(m.sold||0)])))+' mkt us '+Math.round(L.mk.us&&L.mk.us.size||0)+' models '+act.length+' cap '+Math.round(capEff(G)));}
  if(G.over){out.push('BANKRUPT '+dstr(G));break;}}
console.log(out.join(String.fromCharCode(10)));
`);
