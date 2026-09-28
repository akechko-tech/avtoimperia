// Ранние месяцы за Италию: хватает ли покупателей, чтобы выжить
require('./harness.js')(`
Math.random=(()=>{let a=5;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
function run(label,setup,months,country){newGame(country==='it'?'ferrari':'custom',country||'it','T','normal');setup&&setup();const out=[];
  for(let i=0;i<months;i++){G.pending=[];step();if(i%6===5){const md=G.models[0];out.push(dstr(G)+' cash '+Math.round(G.cash)+' sold/mo '+md.lastSold+' dem '+md.lastDem+' stock '+md.stock+' prof '+Math.round(G.last.profit)+' by '+JSON.stringify(Object.fromEntries(Object.entries(G.last.mk).map(([c,m])=>[c,m.sold||0]))));}if(G.over){out.push('BANKRUPT '+dstr(G));break;}}
  console.log('== '+label);console.log(out.join(String.fromCharCode(10)));}
run('ничего не делать',null,36);
run('цена 1400, дилеры Италия 6 + Франция 10',()=>{G.models[0].price=1400;G.dealers.it=6;G.dealers.fr=10;G.cash-=14*dealerCost(G);},36);
run('цена 1400, Италия 6 + Франция 13 + Германия 8, реклама 60',()=>{G.models[0].price=1400;G.dealers.it=6;G.dealers.fr=13;G.dealers.de=8;G.cash-=33*dealerCost(G);G.ad=60;},36);
run('Франция: ничего не делать',null,24,'fr');
run('США: ничего не делать',null,24,'us');
`);
