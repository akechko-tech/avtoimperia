// 0.25: фильм о герое не спорит с партией. Богатой фирме не предлагают «искать денег на долг», выкуп акций,
// сделанный в газете, фильм не предлагает снова; решение, которое принимают в главе фильма, газета второй раз не задаёт.
// node game/test/saga25.js
require('./harness.js')(`
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
const ch=(id,fix)=>sagaChapter(G,sagaList(G).find(c=>c.id===id),fix);
const allTxt=c=>c.sc.map(x=>x.say||x.line).join(' ')+' '+c.q+' '+c.o.map(o=>o.t+' '+o.res).join(' ');
// ---------- Форд, 1920: выкупил доли из кассы, миллиард наличными ----------
newGame('ford','us','Форд Мотор','normal');G.y=1920;G.m=8;G.cash=1.1e9;G.loan=0;G.wseen={dodgesuit:1};G.wpick={dodgesuit:'lDodgeBuy'};
let c=ch('ford6');ok(!/Где взять деньги|время платить|найд[её]м у себя/.test(allTxt(c))&&/из своей кассы/.test(allTxt(c)),'Форд, $1,1 млрд, выкуп сделан: «'+c.q+'» — '+c.o.map(o=>o.t).join(' / '));
// старое сохранение: выбор не записан, но дивидендов нет — значит, выкупили
G.wpick={};ok(sagaChose(G,'dodgesuit')==='lDodgeBuy'&&/из своей кассы/.test(allTxt(ch('ford6'))),'старое сохранение (выбор не записан): выкуп узнан по отсутствию дивидендов');
// компаньоны остались (платили дивиденды) — вопрос о выкупе, а не о долге
G.wpick={dodgesuit:'lDodgePay'};c=ch('ford6');ok(/Выкупить доли компаньонов/.test(c.q)&&c.o[0].fx.cashK<0,'платили дивиденды: «'+c.q+'» — выкуп стоит '+sagaFxText(c.o[0].fx,G));
// выкупили, но в долгах — история как была
G.wpick={dodgesuit:'lDodgeBuy'};G.cash=2000;G.loan=90000;c=ch('ford6');ok(/занял семьдесят пять миллионов/.test(allTxt(c))&&c.q==='Где взять деньги?','в долгах: «'+c.q+'»');
// вариант запоминается: повтор главы показывает то же, что видели
G.cash=1.1e9;G.loan=0;G.saga={seen:[],pick:{}};const c1=ch('ford6',true);G.cash=100;G.loan=1e6;ok(ch('ford6').q===c1.q,'вариант главы запомнен: при повторе — «'+ch('ford6').q+'»');
// Гросс-Пойнт: «денег нет» — только когда их нет
G.saga={seen:[],pick:{}};G.cash=50000;G.loan=0;ok(!/денег нет/.test(allTxt(ch('ford3'))),'Гросс-Пойнт при деньгах — без «денег нет»');G.saga={seen:[],pick:{}};G.cash=100;ok(/денег нет/.test(allTxt(ch('ford3'))),'Гросс-Пойнт с пустой кассой — «денег нет»');
// пять долларов: решение в фильме, газета 1914 года не спрашивает второй раз
{const W=WORLD.find(w=>w.id==='fivedollar');ok(!worldApplies(W,G),'газета «Пять долларов в день» для Форда не выходит — решают в главе фильма');
  G.cash=1e5;G.wagePol='market';const o=sagaList(G).find(x=>x.id==='ford5').o[0];sagaApply(G,o.fx);ok(G.wagePol==='five'&&G.wpick.fivedollar==='lFiveYes','выбор «Платить пять долларов» в фильме ставит зарплату «пять долларов» ('+sagaFxText(o.fx,G)+')');}
// ---------- остальные пары «газета — фильм» ----------
for(const [pk,lid,sid] of [['olds','oldsboard','olds4'],['benz','benzboard','benz4'],['maybach','jellinek','maybach4'],['agnelli','fiattrial','agnelli4'],['peugeot','peugsplit','peugeot4'],['lanchester','lanchrcv','lanchester4'],['ferrari','scuderia','ferrari7']]){
  newGame(pk,PIONEERS[pk].c,'Т','normal');const W=WORLD.find(w=>w.id===lid);ok(W&&!worldApplies(W,G)&&sagaList(G).some(c=>c.id===sid),pk+': газета «'+(W&&W.title)+'» не задаёт вопрос — его задаёт глава «'+sagaList(G).find(c=>c.id===sid).t+'»');}
// Майбах: заказ Еллинека, принятый в фильме, приносит аванс и спрос за границей
newGame('maybach','de','Т','normal');G.y=1900;G.m=4;{const c0=G.cash,o=sagaList(G).find(x=>x.id==='maybach4').o[0];sagaApply(G,o.fx);ok(G.cash>c0&&(G.wfx||[]).length>0||G.cash>c0,'«Строить машину его мечты»: аванс Еллинека '+money(G.cash-c0));}
// Ланчестер: кредиторы — только у бедной фирмы
newGame('lanchester','uk','Т','normal');G.y=1904;G.cash=3e5;G.loan=0;ok(!/управлением кредиторов\\./.test(ch('lanchester4').sc.map(x=>x.say||'').join(' '))||/В настоящей истории/.test(allTxt(ch('lanchester4'))),'Ланчестер при деньгах: «'+ch('lanchester4').t+'» — '+ch('lanchester4').q);
G.saga={seen:[],pick:{}};G.cash=500;G.loan=20000;ok(ch('lanchester4').t==='Под опекой кредиторов','Ланчестер в долгах: «Под опекой кредиторов»');
// Пежо: остались в семейной фирме — «семья снова вместе» не выходит
newGame('peugeot','fr','Т','normal');G.wpick={peugsplit:'lPeugStay'};ok(!worldApplies(WORLD.find(w=>w.id==='peugunite'),G),'Пежо остался в семейной фирме — газеты «Семья Пежо снова вместе» нет');
G.wpick={peugsplit:'lPeugOwn'};ok(worldApplies(WORLD.find(w=>w.id==='peugunite'),G),'Пежо ушёл и основал своё общество — через годы семья объединяется');
// Бенц: от слияния 1926 года отказались — финал без общей звезды
newGame('benz','de','Т','normal');G.wpick={dbmerge:'lDbNo'};c=ch('benz7');ok(c.t==='Своей дорогой'&&!/Передать дело объединённой фирме/.test(allTxt(c)),'Бенц отказался от слияния: финал «'+c.t+'»');
// свой персонаж: кризис 1920 года без «банк не продлит кредит», если касса полна
newGame('custom','us','Т','normal');G.y=1920;G.cash=5e5;G.loan=0;ok(!/продлить кредит/.test(allTxt(ch('custom6'))),'свой персонаж с деньгами: кризис без «банк не продлит кредит»');
// без экрана: глава засчитывается вариантом
newGame('ford','us','Форд Мотор','normal');G.y=1920;G.cash=1e9;G.wseen={dodgesuit:1};G.wpick={dodgesuit:'lDodgeBuy'};const c0=G.cash;sagaAuto(G,'ford6');ok(G.saga.var.ford6===1&&G.cash<c0+1,'автоигра: глава «Деньги без банкиров» — вариант богатой фирмы, денег «на долг» не прибавилось');
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');
`);
