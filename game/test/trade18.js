// ТЗ 0.18, раздел 6: пошлины, запреты, квоты, сборка на месте. node test/trade18.js
require('./harness.js')(`
Math.random=(()=>{let a=77;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
const at=(y,m)=>{G.y=y;G.m=m;};
function setup(home,y,m){newGame('custom',home,'Экспорт','normal');at(y,m);G.cash=1e7;G.last={made:500};
  Object.keys(COUNTRIES).forEach(c=>{if(c!==home){G.imp[c]=2;G.dealers[c]=Math.round(dealerNeed(c,G)*0.5);}});
  const d=autoDesign(G.y>=1912?'people':'middle',G),md=G.models[0];Object.assign(md,d,{id:1,status:'prod',launched:mi(G)-6,stock:0,made:0,vol:0});md.price=Math.round(refPrice(md,G)/10)*10;return md;}
// 1. Американская машина в Британии 1916 года: +33⅓% и доставка через Атлантику, спрос ниже по формуле
{const md=setup('us',1916,6);const P=md.price,off=offerPrice(md,'uk',G),sh=shipCostTo(G,'uk');
  ok(Math.abs(tariffOf(md,'uk',G)-0.333)<0.001,'США → Британия 1916: пошлина Маккенны 33⅓% ('+Math.round(tariffOf(md,'uk',G)*1000)/10+'%)');
  ok(Math.abs(off-(P*1.333+sh))<1,'цена для покупателя: $'+P+' × 1,333 + доставка $'+Math.round(sh)+' = $'+Math.round(off));
  const D=demandAll(G).by[md.id].uk,D0=demandAll(G,{id:md.id,price:Math.round(P/1.333)}).by[md.id].uk;
  ok(D<D0*0.85,'спрос с пошлиной ниже: '+D.toFixed(1)+' против '+D0.toFixed(1)+' в месяц без неё');
  at(1914,6);ok(tariffOf(md,'uk',G)===0,'до сентября 1915 — свободная торговля');
  at(1924,9);ok(tariffOf(md,'uk',G)===0,'август 1924 — июнь 1925: пошлины отменены');
  at(1925,8);ok(Math.abs(tariffOf(md,'uk',G)-0.333)<0.001,'с июля 1925 — снова 33⅓%');}
// 2. Германия 1922: ввоз запрещён — продаж нет
{const md=setup('fr',1922,4);ok(tradeBan(G,'de'),'Германия 1922: ввоз закрыт');const D=demandAll(G).by[md.id];ok(!D.de,'спрос на французскую машину в Германии = 0');
  step();ok(!(G.last.mk.de&&G.last.mk.de.sold),'продано в Германии за месяц: '+((G.last.mk.de&&G.last.mk.de.sold)||0));
  at(1926,2);ok(!tradeBan(G,'de')&&Math.abs(tariffOf(md,'de',G)-0.4)<0.001,'1926: запрет снят, пошлина 40%');
  at(1922,4);G.imp.de=4;ok(!tradeBan(G,'de')&&tariffOf(md,'de',G)===0&&shipK(G,'de')===0,'свой завод в Германии работает и в годы запрета: пошлины и доставки нет');}
// 3. Канада: сборка из комплектов даёт льготу для стран Империи (2/3 ставки с 1919)
{const md=setup('us',1920,3);const t0=tariffOf(md,'uk',G);G.hub={ca:{at:mi(G)-1}};const t1=tariffOf(md,'uk',G);
  ok(Math.abs(t0-0.333)<0.001&&Math.abs(t1-0.222)<0.002,'США → Британия 1920: напрямую '+Math.round(t0*1000)/10+'%, через Канаду '+Math.round(t1*1000)/10+'%');
  at(1917,3);ok(Math.abs(tariffOf(md,'uk',G)-0.333)<0.001,'до 1919 льготы для Империи ещё нет');}
// 4. Ответные меры: Франция 1923 — 100% на машины из США, для остальных 45%
{let md=setup('us',1923,5);const a=tariffOf(md,'fr',G);md=setup('uk',1923,5);const b=tariffOf(md,'fr',G);ok(a===1&&Math.abs(b-0.45)<0.001,'Франция 1923: из США '+Math.round(a*100)+'%, из Британии '+Math.round(b*100)+'%');}
// 5. Квота: Британия в войну — ввоз по лицензиям
{const md=setup('fr',1917,2);ok(tradeQuota(G,'uk')>0,'Британия 1917: квота '+tradeQuota(G,'uk')+' машин в год');md.stock=1e5;G.cap=5000;G.dealers.uk=5000;G.dcap={uk:3.5};md.price=Math.round(refPrice(md,G)*0.5/10)*10;
  let sold=0;for(let i=0;i<10;i++){G.pending=[];step();sold+=(G.last.mk.uk&&G.last.mk.uk.sold)||0;}ok(sold<=tradeQuota(G,'uk')*10/12+2,'за 10 месяцев продано '+sold+' — не больше квоты');}
// 6. Война: торговли с противником нет, завод противника конфискуют
{const md=setup('fr',1915,3);ok(tradeBan(G,'de'),'Франция → Германия 1915: война');const md2=setup('us',1917,5);G.imp.de=4;G.plantVal=5e6;G.pending=[];warSeize(G);
  ok(G.imp.de===0&&G.pending.some(e=>/конфискован/.test(e.title)),'США вступили в войну: завод в Германии конфискован');}
// 7. Газета предупреждает о пошлине за 3–6 месяцев
{const md=setup('fr',1915,4);G.pending=[];tradeNews(G);const ev=G.pending.find(e=>/Британия|Великобритания/.test(e.title));ok(!!ev&&/33/.test(ev.deck),'апрель 1915: газета предупреждает о пошлинах Маккенны: «'+(ev?ev.title+' — '+ev.deck:'нет')+'»');}
// 8. Сборка из комплектов: пошлина только на детали; свой завод — без пошлины
{const md=setup('us',1926,3);const a=tariffOf(md,'fr',G);G.imp.fr=3;const b=tariffOf(md,'fr',G);G.imp.fr=4;const c=tariffOf(md,'fr',G);ok(b<a&&Math.abs(b-a*0.6)<0.001&&c===0,'Франция: целиком '+Math.round(a*100)+'%, из комплектов '+Math.round(b*100)+'%, свой завод '+Math.round(c*100)+'%');
  G.imp.fr=2;delete G.impB;G.cash=1e9;impUp(G,'fr');ok(G.impB&&G.impB.fr&&G.impB.fr.left>=6&&G.impB.fr.left<=9,'сборку из комплектов строят '+(G.impB&&G.impB.fr&&G.impB.fr.left)+' мес.');
  G.imp.fr=3;delete G.impB;impUp(G,'fr');ok(G.impB&&G.impB.fr&&G.impB.fr.left>=12&&G.impB.fr.left<=24,'свой завод строят '+(G.impB&&G.impB.fr&&G.impB.fr.left)+' мес.');}
// 9. Лицензия: без пошлины, со склада не берут, вам — доля цены
{const md=setup('fr',1925,3);G.imp.it=0;G.dealers.it=0;ok(licStart(G,'it'),'лицензия в Италии продана');G.lic.it.at=mi(G);md.stock=0;let L=null,n=0,lic=0;
  // спрос по лицензии в Италии — пятая часть машины в месяц: ждём первой продажи (до двух лет)
  for(let k=0;k<24&&!n;k++){md.stock=0;G.pending=[];step();L=G.last;n+=(L.mk.it&&L.mk.it.sold)||0;lic+=L.lic||0;}
  ok(lic>0&&n>0,'по лицензии продано '+n+', доход $'+Math.round(lic)+' без машин со склада');}
// 10. Покупка местной марки: её место на рынке — ваше
{const md=setup('us',1925,3);const C=brandCands(G,'fr')[0];const g0=ghostShare('fr','people',G);G.cash=1e9;ok(brandBuy(G,'fr',C.i),'куплена марка «'+C.cp.n+'» за $'+brandPrice(G,'fr',C));
  ok(ghostShare('fr','people',G)>=g0&&tariffOf(md,'fr',G)===0&&foreignPen(G,'fr')===0,'её покупатели и заводы — ваши: без пошлины и без «чужой марки»');}
// 11. Налог на мощность: большой мотор в Британии 1922 года
{const md=setup('us',1922,3);const big={...md,e:'e14'},small={...md,e:'e1'};ok(hpTax(big,'uk',G)>hpTax(small,'uk',G)&&hpTax(big,'us',G)===0,'налог на мощность: большой мотор в Британии '+hpTax(big,'uk',G).toFixed(2)+', дома в США — 0');}
// 12. Гиперинфляция: выручка из Германии 1923 почти обесценена
{setup('fr',1923,5);ok(fxOf(G,'de')<0.3,'1923: марки из Германии стоят '+Math.round(fxOf(G,'de')*100)+'%');}
// 13. Мир без игрока: доля ввоза в Германии (американские машины после снятия запрета)
{newGame('custom','fr','T','normal');G.cash=1e9;G.models[0].status='off';const Y={};for(let k=0;k<35*12;k++){G.pending=[];step();if(G.y<1924)continue;const y=G.m===0?G.y-1:G.y,mk=G.last.mk.de;const i=COMPS.de.findIndex(cp=>cp.imp);
  const tot=mk.size-mk.segs.truck.size;(Y[y]=Y[y]||{t:0,i:0}).t+=tot;}
  const L=G.comps.de;console.log('   Германия, доля ввоза из США (без игрока): '+[1925,1927,1929].map(y=>{const cp=COMPS.de.find(c=>c.imp),v=compVol(cp,{y,m:6,...{}});return y+': '+Math.round(tabAt(cp.v,y+0.5,true)/tabAt(MKT.de,y+0.5,true)*100)+'%';}).join(', ')+' (история: около 1/4 рынка в 1928 году)');}
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');
`);
