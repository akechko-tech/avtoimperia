require('./harness.js')(`
Math.random=(()=>{let a=11;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
// 1) без игрока (пассивная игра): продажи конкурентов против истории
for(const c of ['us','fr','uk','de','it']){newGame('custom',c,'T');G.cash=1e9;
  const rows=[];for(let y=1895;y<=1929;y++){G.y=y;G.m=5;const D=demandAll(G);let tot=0;SEGK.forEach(g=>tot+=D.mk[c].segs[g].total);if([1900,1905,1910,1913,1920,1925,1929].includes(y))rows.push(y+':'+Math.round(tot*12/SEASON[5]));}
  console.log(c,rows.join(' '));}
`);
