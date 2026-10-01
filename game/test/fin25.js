// 0.25: деньги компании — кредит покупателям (банки или своя кредитная компания), вложения (облигации, акции, поставщики),
// военные займы, спецакции в стране и классе, налог на сверхприбыль по странам. node game/test/fin25.js
const bot=require('./bot.js');
require('./harness.js')(bot+`
Math.random=(()=>{let a=2525;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
const at=(y,m)=>{G.y=y;G.m=m;};
// ---------- 1. кредит покупателям ----------
newGame('ford','us','Форд Мотор','normal');G.cash+=40000;
for(let i=0;i<12*24;i++){G.pending=[];botMonth('grow');G.chal=null;step();}
G.tech.credit=1;G.cash=Math.max(G.cash,5e6);G.pending=[];botMonth('grow');step();
let L=G.last;ok(L.fin>0&&L.finCr>0,dstr(G)+': рассрочка через банки — комиссия '+money(L.fin)+' с '+money(L.finCr)+' продаж в рассрочку ('+pct(L.fin/Math.max(1,L.rev),1)+' выручки)');
setOpen('pl',true);setOpen('finc',true);let h=vPlant();ok(/комиссия банкам/.test(h)&&/около 6% суммы/.test(h),'в отчёте — что это за строка и почему она в минусе');
ok(/Своя кредитная компания/.test(h)&&/data-act="finPol"/.test(h),'выбор: банки или своя кредитная компания');
G.finPol='own';let prof0=0,inc=0,bad=0,out=0,back=0;for(let i=0;i<14;i++){G.pending=[];botMonth('grow');step();L=G.last;inc+=L.finInc;bad+=L.finBad;out+=L.finOut;back+=L.finIn;}
ok(L.fin===0&&inc>0&&out>0&&back>0,'своя кредитная компания: комиссии нет, за 14 мес. выдано '+money(out)+', вернулось '+money(back)+', проценты +'+money(inc)+', невозвраты −'+money(bad));
ok(Math.abs(finTotal(G)-(out-back-bad))<Math.max(5,out*0.002),'портфель рассрочки сходится: '+money(finTotal(G)));
ok(inc>bad,'проценты больше невозвратов в спокойные годы');
{const v0=companyValue(G),f=finTotal(G);ok(f>0&&v0>f,'долги покупателей — в стоимости компании ('+money(f)+')');}
// кризис 1920 года: невозвратов больше
at(1920,7);ok(finBadRate(G)>finBadRate({...G,y:1925,m:3}),'в кризис 1920 года покупатели не платят чаще: '+pct(finBadRate(G),1)+' против '+pct(finBadRate({...G,y:1925,m:3}),1));
// ---------- 2. вложения ----------
newGame('custom','us','Т','normal');at(1910,0);G.cash=1e6;
ok(invBuy(G,'us',100000)&&bondValue(G)>98000,'куплены облигации США: '+money(bondValue(G)));
{const r={};invMonth(G,r);ok(r.invInc>200&&r.invInc<500,'купон за месяц: '+money(r.invInc)+' (3% годовых)');}
ok(invBuy(G,'st',200000),'куплены акции по индексу Доу-Джонса ('+Math.round(djia(G))+')');
at(1914,8);ok(!stocksOpen(G)&&!invBuy(G,'st',1000)&&!invSell(G,'st',1),'осень 1914 года: биржа закрыта — ни купить, ни продать');
at(1929,8);const peak=stockVal(G);at(1929,10);const low=stockVal(G);ok(low<peak*0.6,'крах 1929 года: акции стоили '+money(peak)+' в сентябре, '+money(low)+' в ноябре');
at(1910,0);G.inv=null;G.cash=1e5;invBuy(G,'us',50000);G.cash=-20000;invCover(G);ok(G.cash>=0&&bondValue(G)<30000,'касса в минусе — казначей сам продал облигации');
// Германия: военный заём 1914 года превращается в бумагу
newGame('custom','de','Т','normal');at(1914,8);G.cash=2e5;G.pending=[];worldCheck(G);const ev=G.pending.find(e=>e.world==='loan_de');ok(!!ev&&/Подписаться/.test(ev.choices.map(c=>c[0]).join(' ')),'сентябрь 1914 года: газета «'+(ev&&ev.title)+'» — подписка на заём');
worldResolve(G,'w:loan_de:wLoan10');const v14=bondValue(G);at(1923,10);ok(v14>15000&&bondValue(G)<1,'германский военный заём: '+money(v14)+' в 1914 году — '+money(bondValue(G))+' в 1923-м');
at(1926,0);ok(bondValue(G)>0&&bondValue(G)<v14*0.05,'в 1925 году старые займы выкупили по 2,5% номинала: '+money(bondValue(G)));
// французская рента в долларах: франк падает
ok(bondV('fr',{y:1926,m:6})<0.2&&bondV('us',{y:1926,m:6})>0.95,'рента во франках к 1926 году — '+Math.round(bondV('fr',{y:1926,m:6})*100)+'% номинала в долларах, облигации США — '+Math.round(bondV('us',{y:1926,m:6})*100)+'%');
// ---------- 3. свои поставщики ----------
newGame('ford','us','Форд Мотор','normal');G.cash+=40000;for(let i=0;i<12*20;i++){G.pending=[];botMonth('grow');G.chal=null;step();}
G.cash=Math.max(G.cash,2e7);const md=G.models.find(m=>m.status==='prod'),c0=matCost(md,G),p=supPrice(G,SUPPLY.find(x=>x.k==='steel'));
ok(supBuy(G,'steel')&&matCost(md,G)<c0*0.97,dstr(G)+': куплен сталелитейный завод за '+money(p)+' — деталь «'+md.name+'» '+money(c0)+' → '+money(matCost(md,G)));
ok(supValue(G)>=p*0.99,'завод — в стоимости компании ('+money(supValue(G))+')');
ok(supBuy(G,'rubber')&&supK(G)>0.9,'каучуковая плантация — риск: даёт меньше обещанного (поставщики вместе: детали дешевле на '+pct(1-supK(G),1)+')');
setOpen('inv',true);h=vPlant();ok(/Вложения свободных денег/.test(h)&&/Облигации США/.test(h)&&/Доу-Джонса/.test(h)&&/Сталелитейный/.test(h),'вкладка «Завод» → «Финансы»: облигации, акции, поставщики');
// ---------- 4. спецакции ----------
newGame('custom','uk','Т','normal');G.cash+=40000;for(let i=0;i<12*20;i++){G.pending=[];botMonth('grow');G.chal=null;step();}
const g=segOf(G.models.find(m=>m.status==='prod')),dem0=demandAll(G).tot||0;G.cash=Math.max(G.cash,1e6);
const D0=(()=>{const R=demandAll(G);let t=0;for(const id in R.by)for(const c in R.by[id])t+=R.by[id][c];return t;})();
const cost=promoCost(G,'uk',g,'adv');ok(promoStart(G,'uk',g,'adv')&&!promoStart(G,'uk',g,'adv'),'реклама в Британии, класс «'+SEG[g].name+'» — '+money(cost)+'; вторую такую же не запустить');
const D1=(()=>{const R=demandAll(G);let t=0;for(const id in R.by)for(const c in R.by[id])t+=R.by[id][c];return t;})();
ok(D1>D0*1.05,'спрос вырос: '+D0.toFixed(1)+' → '+D1.toFixed(1)+' в месяц');
ok(promoStart(G,'uk',g,'disc'),'скидка покупателям 7%');G.pending=[];botMonth('grow');step();L=G.last;ok(L.promo>0&&L.prm>=cost*0.99,'в отчёте: скидки −'+money(L.promo)+', реклама −'+money(L.prm));
h=vMarket();ok(/data-act="promoSheet"/.test(h),'«Рынок»: кнопка «Спецакции» у страны');
promoSheet('uk');ok(true,'лист спецакций открывается');
// в карточке пари по продажам — кнопки спецакций
G.chal={type:'sales',mon:1,c:'uk',g,mq:'Austin',ci:0,stake:5000,acc:1,start:mi(G),end:mi(G)+3,per:3,you:10,them:12,n:1,hc:1};ok(/data-act="promo"/.test(chalCardNew(G,G.chal)),'карточка пари по продажам — с кнопками спецакций');G.chal=null;
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');
`);
