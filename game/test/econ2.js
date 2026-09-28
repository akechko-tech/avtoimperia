const bot=require('./bot.js');
require('./harness.js')(bot+`
Math.random=(()=>{let a=7;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
const args=${JSON.stringify(process.argv.slice(2))};
const country=args[0]||'fr',strat=args[1]||'grow',years=+(args[2]||35),every=+(args[3]||3);
newGame('custom',country,'T','normal');const out=[];
for(let k=0;k<years*12;k++){G.pending=[];if(strat!=='passive')botMonth(strat);step();
  if(G.m===0){const pr=G.hist.profit.slice(-12).reduce((a,b)=>a+b,0),md=G.models.filter(m=>m.status==='prod')[0];
    out.push((G.y-1)+': sold '+fmtN(G.peakLast||0)+' cap '+Math.round(capEff(G))+' w '+G.workers+' cash '+Math.round(G.cash/1000)+'k prof '+Math.round(pr/1000)+'k rep '+Math.round(G.rep)+' sh '+(G.last?(G.last.share*100).toFixed(1):0)+'% dl '+dealerCount(G,G.country)+' val '+Math.round(companyValue(G)/1000)+'k '+(md?('$'+md.price+'/c'+Math.round(unitCost(md))+'/h'+Math.round(hoursPerCar(md,G))):''));}
  if(G.over)break;}
console.log(out.filter((x,i)=>i%every===0||i===out.length-1).join('\\n'));
`);
