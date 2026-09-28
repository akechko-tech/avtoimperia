const bot=require('./bot.js');
require('./harness.js')(bot+`
Math.random=(()=>{let a=7;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
newGame('custom','us','T','normal');
for(let k=0;k<27*12;k++){G.pending=[];botMonth('grow');step();
  if(G.y>=1914&&G.y<=1921&&G.m%4===1){const md=G.models.filter(m=>m.status==='prod')[0];const g=segOf(md);const r=segMarket('us',g,G,[md]);
   console.log(G.y,G.m,'sold',md.lastSold,'dem',md.lastDem,'fc',Math.round(md.fc),'stock',md.stock,'made',md.lastMade,'cap',Math.round(capEff(G)),'w',G.workers,md.e,md.c,md.b,md.w,md.t,'$'+md.price,'ref',Math.round(refPrice(md,G)),'u',modelU(md,'us',G).toFixed(2),'K',r.K.toFixed(2),'pot',Math.round(r.pot),'pw',(G.pw[g]||1).toFixed(2),'rep',Math.round(G.rep),'dl',dealerCount(G,'us'),'cash',Math.round(G.cash/1000)+'k');}}
`);
