// 0.23: Первая мировая для американской марки — первая полоса, блокада Германии, замороженная стройка, конфискация в 1917-м;
// легендарная «Модель T» — чёрная. node game/test/war23.js
require('./harness.js')(`
Math.random=(()=>{let a=91;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
const at=(y,m)=>{G.y=y;G.m=m;};
function setup(y,m){newGame('ford','us','Форд Мотор','normal');at(y,m);G.cash=1e8;G.last={made:2000};
  ['uk','fr','de'].forEach(c=>{G.imp[c]=2;G.dealers[c]=Math.round(dealerNeed(c,G)*0.5);});
  const md=G.models[0];md.status='prod';md.launched=mi(G)-6;md.stock=500;md.price=Math.round(refPrice(md,G)/10)*10;return md;}
// 1. Август 1914: американская марка получает первую полосу о войне — с тем, что стало с её рынками
{setup(1914,6);G.pending=[];G.wseen={};const C=brandCands(G,'de')[0];ok(C&&brandBuy(G,'de',C.i),'до войны куплена немецкая марка «'+(C&&C.cp.n)+'»');
  at(1914,7);G.pending=[];worldCheck(G);const ev=G.pending.find(e=>e.world==='warus');
  ok(!!ev,'август 1914: первая полоса «'+(ev&&ev.title)+'» — '+(ev&&ev.deck));
  ok(ev&&/Германия: блокада/.test(ev.text)&&/отрезана/.test(ev.text),'в ней — что стало с Германией: «'+(ev?(ev.text.split('\\n').find(l=>/Германия/.test(l))||''):'')+'»');
  ok(ev&&/Британия|Великобритания/.test(ev.text)&&/Франция/.test(ev.text),'и с рынками Антанты');
  ok(ev&&ev.choices.length===2&&ev.choices[0][1]==='w:warus:wAllies','выбор: заказ Антанты или нейтралитет');}
// 2. Блокада: своя марка в Германии отрезана — продаж, дилеров, вложений нет
{const md=setup(1913,3);const C=brandCands(G,'de')[0];brandBuy(G,'de',C.i);at(1915,10);G.pending=[];
  ok(warCut(G,'de')&&tradeBan(G,'de'),'ноябрь 1915: Германия за блокадой — даже для своей марки');
  const D=demandAll(G).by[md.id];ok(!D.de,'спрос на ваши машины в Германии = 0');
  step();ok(!(G.last.mk.de&&G.last.mk.de.sold),'продано в Германии за месяц: '+((G.last.mk.de&&G.last.mk.de.sold)||0));
  const n0=dealerCount(G,'de');ok(buyDealers(G,'de',10)===0&&dealerCount(G,'de')===n0,'новых дилеров за блокадой не открыть');
  ok(!impUp(G,'de')&&marketPotential(G,'de')===0,'строить и считать прибыль там нельзя');
  const C2=brandCands(G,'fr')[0];ok(!warCut(G,'fr')&&!tradeBan(G,'fr'),'Франция открыта: Америка нейтральна');}
// 3. Стройка за блокадой замирает, после войны — продолжается
{setup(1914,3);G.imp.de=3;G.impB={de:{lv:4,left:5,t:12}};G.pending=[];at(1914,9);for(let k=0;k<3;k++){G.pending=[];tradeMonth(G);}
  ok(G.impB.de&&G.impB.de.left===5&&G.impB.de.frozen,'осень 1914: стройка завода в Германии заморожена (осталось '+(G.impB.de&&G.impB.de.left)+' мес.)');
  newGame('custom','it','Итальянец','normal');at(1914,9);G.imp.de=3;G.impB={de:{lv:4,left:5,t:12}};at(1919,7);G.pending=[];tradeMonth(G);
  ok(G.impB.de&&G.impB.de.left===4&&!G.impB.de.frozen,'август 1919: блокада снята — стройка пошла (осталось '+(G.impB.de&&G.impB.de.left)+' мес.)');}
// 4. Апрель 1917: Америка вступила в войну — немецкую марку конфискуют
{setup(1913,3);const C=brandCands(G,'de')[0];brandBuy(G,'de',C.i);at(1917,3);G.pending=[];warSeize(G);const ev=G.pending.find(e=>/конфискован/.test(e.title));
  ok(!!ev&&!intIn(G,'de'),'апрель 1917: «'+(ev&&ev.title)+'»');}
// 5. Старое сохранение (ноябрь 1915, первой полосы не было) — она приходит сейчас, с пометкой
{setup(1915,10);G.wseen={};G.pending=[];worldCheck(G);const ev=G.pending.find(e=>e.world==='warus');ok(!!ev&&/с августа 1914/.test(ev.deck),'сохранение 1915 года без новости о войне: «'+(ev&&ev.title)+'» — '+(ev&&ev.deck));
  G.pending=[];worldCheck(G);ok(!G.pending.some(e=>e.world==='warus'),'второй раз — не повторяется');
  setup(1919,2);G.wseen={};G.pending=[];worldCheck(G);ok(!G.pending.some(e=>e.world==='warus'),'после перемирия догоняющей новости нет');}
// 6. Заказ Антанты: машины в счёт заказа, срок 9 месяцев
{const md=setup(1914,7);G.orders=[];const t=warAlliesOrder(G);const o=G.orders[0];ok(!!o&&o.n>=20&&o.due===mi(G)+9,'заказ Антанты: '+(o&&o.n)+' машин по $'+(o&&o.price)+' — «'+t.slice(0,90)+'…»');}
// 7. «Модель T» — чёрная с 1914 года, до того — зелёная и синяя
{ok(legendPaint(LEGEND_BY.ford_t,1915)==='#1b1d22'&&legendPaint(LEGEND_BY.ford_t,1909)==='#1f4a36'&&legendPaint(LEGEND_BY.ford_t,1912)==='#23427a','«Модель T»: 1909 — зелёная, 1912 — синяя, 1915 — чёрная');
  setup(1915,5);G.legends={};const L=LEGEND_BY.ford_t;draft=null;const LS=legendState;legendState=()=>'open';const okS=legendStart(G,'ford_t');legendState=LS;const m=G.models.find(x=>x.legend==='ford_t');
  ok(okS&&m&&m.paint==='#1b1d22'&&m.b==='b3','разработка «Модели T» в 1915: '+(m&&PAINTS.find(p=>p.id===m.paint).name)+', кузов '+(m&&BODIES.find(b=>b.id===m.b).name));
  const x={...G,models:G.models.map(q=>q.legend?{...q,paint:'#c9a227'}:q)};delete x.v23paint;migrate(x);ok(x.models.find(q=>q.legend).paint==='#1b1d22','старое сохранение: жёлтая «Модель T» перекрашена в чёрный');}
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');
`);
