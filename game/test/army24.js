// 0.24: из военного заказа (40% мощности) машины — столько, сколько нужно армии, остальное — военная продукция (деньги те же);
// машины армии входят в «Продано». node game/test/army24.js
require('./harness.js')(`
Math.random=(()=>{let a=31;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
function setup(c,y,m,cap){newGame('custom',c,'Т','normal');G.y=y;G.m=m;G.cash=1e9;G.cap=cap;G.workers=cap*40;G.staffAuto=true;G.dealers[c]=Math.round(dealerNeed(c,G)*0.8);
  const d=autoDesign(y>=1912?'people':'middle',G),md=G.models[0];Object.assign(md,d,{id:1,status:'prod',launched:mi(G)-6,stock:0,made:0,vol:0});md.price=Math.round(refPrice(md,G)/10)*10;md.plan='auto';G.military=true;return md;}
// огромный завод в США, 1918: армия берёт не больше, чем ей нужно
{setup('us',1918,0,60000);G.pending=[];step();const L=G.last;
  ok(L.milN>0&&L.milN<=milNeed(G)&&L.milX>0,'США, январь 1918, мощность '+fmtN(Math.round(capEff(G)))+' в месяц: машин армии — '+fmtN(L.milN)+' (нужно армии ≤ '+fmtN(milNeed(G))+'), военной продукции — '+fmtN(L.milX));
  ok(L.milN+L.milX>=Math.floor(capEff(G)*0.4)*0.9,'военный заказ по-прежнему — 40% мощности: '+fmtN(L.milN+L.milX)+' изделий, '+money(L.mil)+' в месяц');
  setOpen('pl',true);ok(/военной продукции/.test(vPlant()),'в отчёте месяца — машины армии и военная продукция отдельно');
  const h=vPlant?vPlant():'';const all=L.sold+L.milN+(L.ordN||0);
  ok(new RegExp(fmtN(all).replace(/\\s/g,'\\\\s')).test(h.replace(/&nbsp;/g,' '))&&/армии/.test(h),'«Продано» на заводе: '+fmtN(all)+' шт. — покупателям '+fmtN(L.sold)+', армии '+fmtN(L.milN));
  ok(totalSold(G)>=L.milN&&G.milTotal===L.milN,'машины для армии — в общем счёте проданных ('+fmtN(totalSold(G))+')');
  ok((G.yearSold||0)>=L.sold+L.milN,'и в итоге года');}
// маленький завод: как раньше — 40% мощности
{setup('fr',1915,3,300);G.pending=[];step();const L=G.last;ok(L.milN>0&&L.milN<=Math.floor(capEff(G)*0.4)+1,'Франция, апрель 1915, мощность '+fmtN(Math.round(capEff(G)))+': армии — '+fmtN(L.milN)+' (до 40% мощности)');}
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');
`);
