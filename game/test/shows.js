// Выставки: приглашение за месяц, стенд, итоги (заказы, дилеры, репутация, медали), интерес покупателей в рынке
require('./harness.js')(`
Math.random=(()=>{let a=11;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
function play(country,y0,m0,answer,months){
  newGame('renault',country,'T','normal');G.cash=1e6;G.y=y0;G.m=m0;G.models[0].status='prod';G.models[0].launched=mi(G)-6;
  const out=[];for(let k=0;k<months;k++){step();
    while(G.pending.length){const p=G.pending[0];if(p.kicker==='Приглашение на выставку'||p.kicker==='Выставка')out.push(dstr(G)+' | '+p.kicker+' | '+p.title+' | '+p.deck);
      const ch=(p.choices||[])[0];const key=p.kicker==='Приглашение на выставку'?answer:(ch?ch[1]:'ok');resolve(key);}}
  return out;}
console.log('--- Франция 1898: большой стенд на всех выставках');play('fr',1898,3,'show2',30).forEach(l=>console.log(l));
console.log('repo',G.rep,'orders',JSON.stringify(G.orders.map(o=>[o.who,o.n,o.left])),'dealers',JSON.stringify(G.dealers),'medals',JSON.stringify(G.medals),'showFx',JSON.stringify(G.showFx));
console.log('--- Германия 1897: малый стенд');play('de',1897,6,'show1',14).forEach(l=>console.log(l));
console.log('--- США 1900: пропускаем');play('us',1900,8,'show0',6).forEach(l=>console.log(l));
// интерес покупателей: полезность до и после
newGame('renault','fr','T','normal');G.y=1903;G.m=5;G.models[0].status='prod';const md=G.models[0];const u0=showEffect(G,'fr');G.showFx={fr:{u:0.3,t:mi(G)}};
console.log('showEffect сейчас',showEffect(G,'fr').toFixed(3),'через 6 мес',(()=>{G.m+=6;return showEffect(G,'fr').toFixed(3);})());
console.log('всего выставок',SHOWS.length,'по городам',JSON.stringify(SHOWS.reduce((a,s)=>{a[s.h]=(a[s.h]||0)+1;return a;},{})));
`);
