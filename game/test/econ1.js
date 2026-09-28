// Рынок без активного игрока: продажи реальных марок против истории (игрок стоит на месте с одной моделью)
require('./harness.js')(`
Math.random=(()=>{let a=11;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
for(const c of ['us','fr','uk','de','it']){newGame('custom',c,'T','normal');G.cash=1e9;G.models[0].status='off';
  const yr={};for(let k=0;k<35*12;k++){G.pending=[];step();const y=G.m===0?G.y-1:G.y;const m=G.last.mk[c];yr[y]=(yr[y]||0)+m.size-m.segs.truck.size;}
  console.log(c,[1896,1900,1905,1910,1913,1916,1920,1925,1929].map(y=>y+': '+Math.round(yr[y])+' / '+Math.round(tabAt(MKT[c],y+0.5,true))).join('  '));}
`);
