const bot=require('./bot.js');
require('./harness.js')(bot+`
Math.random=(()=>{let a=7;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
newGame('custom','us','T','normal');
function ub(md,c){const s=G,g=segOf(md),home=c===s.country,P=md.price,r=modelQ(md)/qrefQ(g,s),p=parts(md),hpr=engineHp(p.e)/tabAt(ERA_HP[g],yf(s));
 return {C0:C0(g,s).toFixed(2),q:(ALPHA_Q[g]*Math.log(Math.max(0.05,r))).toFixed(2),obs:(-6*Math.max(0,0.6-r)).toFixed(2),hp:(-3.5*Math.max(0,Math.log(0.65/hpr))).toFixed(2),pr:(-ALPHA_P[g]*Math.log(P/prefP(g,c,s))).toFixed(2),rep:(1.3*(s.rep-50)/50).toFixed(2),ad:adEffect(s,c).toFixed(2),dl:dealerEffect(s,c).toFixed(2),nov:novelty(md,s).toFixed(2)};}
for(let k=0;k<16*12;k++){G.pending=[];botMonth('grow');step();
  if(G.y>=1903&&G.m===5){const md=G.models.filter(m=>m.status==='prod')[0];if(!md){console.log(G.y,'no model');continue;}
   console.log(G.y,segOf(md),md.e,md.c,md.b,md.w,md.t,'$'+md.price,'sold',md.lastSold,'u',modelU(md,'us',G).toFixed(2),JSON.stringify(ub(md,'us')),'cash',Math.round(G.cash/1000));}}
`);
