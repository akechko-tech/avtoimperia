// 0.46: победа по двум категориям сразу (в каждой — больше половины живого мира И больше рекорда эпохи, то же для ботов); реестр
// первенств эпохи (детали, технологии, оснащение, новинки неба, перелёты) с марками одной компании под одним именем; у всех одна
// мерка бренда (доля покупателей) и капитала (полторы годовые выручки); дочерняя марка с контрольным пакетом — в ваш зачёт. node game/test/v45.js
require('./harness.js')(`{
let bad=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)bad++;};
BOTS_OFF=false;const seed=k=>{let a=k;Math.random=()=>{a=(a*16807)%2147483647;return a/2147483647;};};
/* ---------- реестр первенств ---------- */
{const L=innovLedger(),kinds=L.reduce((a,I)=>{a[I.kind]=(a[I.kind]||0)+1;return a;},{});
  ok(L.length>=86&&kinds.part>=37&&kinds.moto>=10&&kinds.tech>=7&&kinds.eq>=9&&kinds.air>=8&&kinds.flight>=15,'реестр первенств эпохи: '+L.length+' — детали '+kinds.part+', мотодетали '+kinds.moto+', технологии '+kinds.tech+', оснащение '+kinds.eq+', новинки неба '+kinds.air+', перелёты '+kinds.flight);
  const by=innovByCo();const n=x=>(by[x]||[]).length;
  ok(n('Cadillac')===7&&n('Ford')===6&&n('Blériot')===5,'по маркам: Cadillac 7 (мотор 1903, калибры, закрытый кузов, свет и стартер Delco, V8, синхронизатор), Ford 6 (моноблок, ванадиевая рама, конвейер, Ривер-Руж, тормоза A, отопитель), Blériot 5 (фары и перелёты)');
  ok(n('Indian')===2&&n('Harley-Davidson')===2&&n('Fokker')===2&&n('Oldsmobile')===2&&n('Renault')===2&&n('Hudson-Essex')===1&&n('Dodge Brothers')===3&&!by['Olds']&&!by['Луи Рено']&&!by['Ford River Rouge']&&!by['Энтони Фоккер'],'«Indian и Harley-Davidson» — по одному каждому; Olds → Oldsmobile, Луи Рено → Renault, Ford River Rouge → Ford, Фоккер → Fokker, Essex → Hudson-Essex');
  ok(L.filter(I=>!I.cos.length).length===2,'безымянные первенства («английские кузовщики», «верхнеклапанные моторы двадцатых») — миру, но не марке');
  ok(coKey('«Руссо-Балт» (Сикорский)')==='Руссо-Балт'&&coKey('Ford (Манчестер)')==='Ford'&&coKey('Daimler (Coventry)')==='Daimler (Coventry)'&&coKey('SIA / Fiat')==='FIAT'&&coKey('Wright Company')==='Wright'&&coKey('«Илья Муромец»')==='Руссо-Балт','имена компаний: «Руссо-Балт» (Сикорский) и «Илья Муромец» → Руссо-Балт, Ford (Манчестер) → Ford, британский Daimler — отдельно, SIA / Fiat → FIAT, Wright Company → Wright');}
/* ---------- рекорд эпохи ---------- */
{const E=histEra();ok(E===HIST_ERA_DATA&&E.best.innov.n==='Cadillac'&&E.best.innov.v===7&&E.best.scale.n==='Ford'&&E.best.market.n==='Ford'&&E.best.capital.n==='Ford'&&E.best.sport.n==='Bugatti'&&E.best.brand.n==='Ford'&&E.best.brand.v<0.5&&E.best.brand.v>0.4,'рекорд эпохи из сборки: инновации — Cadillac 7, масштаб, рынок, капитал, бренд ('+Math.round(E.best.brand.v*100)+' %) — Ford, спорт — Bugatti '+E.best.sport.v);
  ok(E.world.firsts>=84&&E.world.sport>1500,'мир эпохи: '+E.world.firsts+' первенств, '+E.world.sport+' очков побед, '+domFmt('scale',E.world.hp)+', '+domFmt('market',E.world.rev));
  const t0=Date.now(),F=histEraCompute();const dev=Math.max(...DOM_K.map(k=>Math.abs(F.best[k].v-E.best[k].v)/Math.max(1e-9,E.best[k].v)));ok(dev<0.005&&DOM_K.every(k=>F.best[k].n===E.best[k].n),'сборка не устарела: пересчёт совпадает ('+(Date.now()-t0)+' мс)');}
/* ---------- живой мир: первенства оснащения и перелётов, покупатели мотомарок ---------- */
seed(5);newGame('custom','fr','Проба','normal','Ласточка');G.helper={on:1};
for(let k=0;k<12*15;k++){while(G.pending.length)resolve(G.pending[0].choices[0][1]);G.over=false;step();}
{const W=G.world;ok(W.v===3&&W.fh['eq:sp']&&W.fh['eq:ac']&&W.fh['air_ev_channel-1909']&&W.fh['air_ail']&&W.firsts>=25,'мировой зачёт к '+G.y+' году ('+W.firsts+' первенств): оснащение (спидометр 1903, ацетиленовые фары), перелёт через Ла-Манш, элероны — в счёте');
  const C=worldCo(G),bl=C.find(o=>o.n==='Blériot'),kl=C.find(o=>o.n==='Klaxon');ok(bl&&bl.firsts>=2&&kl&&kl.firsts===1,'Blériot — '+(bl?bl.firsts:0)+' первенства (фары, Ла-Манш), Klaxon — клаксон; у Cadillac мотор 1903 года увели живые соперники ('+((G.botFirsts||{})['part:e10']||{}).n+')');
  const moto=W.co['Peugeot'];ok(moto&&Object.keys(moto.cu).length>0&&W.cu.fr>0,'покупатели мотомарок и авиазаводов — в узнаваемости (Peugeot: машины и мотоциклы под одним именем)');
  const me=worldMine(G);ok(me.aw<=1&&me.val===Math.max(0,(W.my.r12||0)*VAL_K)&&W.my.r12>0,'ваш капитал — полторы годовые выручки ('+money(me.val)+', выручка за год '+money(W.my.r12)+'), узнаваемость — по доле покупателей ('+Math.round(me.aw*100)+' %)');}
/* ---------- две категории ---------- */
{const W=G.world,T0=domTable(G);ok(domHeld(T0).length===0&&!G.dom,'пассивный игрок в '+G.y+' году: ни одной категории');
  // одна категория — ещё не победа
  const hv=T0.scale.hist.v;W.my.hp=Math.max(hv*1.01,W.hp);W.hp=W.my.hp/0.6;const T1=domTable(G);ok(T1.scale.ok&&domHeld(T1).length===1,'масштаб: больше половины мира и больше рекорда эпохи — категория ваша');
  domCheck(G);ok(!G.dom,'одна категория — не победа: нужны две');
  const h2=domCard(G);ok(/1 из 2/.test(h2)&&/Уже ваши: масштаб/.test(h2)&&/господство<\\/span>/.test(h2),'карточка: «1 из 2», «Уже ваши: масштаб», метка «господство» у шкалы');
  // вторая категория — победа
  const mv=T0.market.hist.v;W.my.rev=Math.max(mv*1.01,W.rev);W.rev=W.my.rev/0.6;const T2=domTable(G);ok(T2.market.ok&&domHeld(T2).length===2,'рынок: оба условия — две категории');
  domCheck(G);ok(G.dom&&G.dom.ks&&G.dom.ks.length===2&&G.dom.ks.includes('scale')&&G.dom.ks.includes('market')&&G.dom.k==='scale','победа: господство по масштабу и рынку в '+G.dom.y+' году');
  const ev=G.pending.find(e=>/господствует: масштаб и рынок/.test(e.title||''));ok(!!ev&&/двух из шести/.test(ev.text)&&/Рекорд всей эпохи 1895–1930 — Ford/.test(ev.text),'газета: «господствует: масштаб и рынок», «двух из шести категорий», оба рекорда эпохи позади');
  ok(/Победа: масштаб и рынок/.test(domScreenHTML(G))&&/победа: масштаб и рынок · /.test(domCard(G)),'экран итога и карточка: «Победа: масштаб и рынок»');
  ok((G.trophies||[]).some(t=>t.key==='dom|scale+market'),'трофей «Господство: масштаб и рынок»');}
/* ---------- боту тоже нужны две категории ---------- */
{seed(7);newGame('custom','fr','Проба2','normal','Ласточка');G.helper={on:1};for(let k=0;k<12*12;k++){while(G.pending.length)resolve(G.pending[0].choices[0][1]);G.over=false;step();}
  const W=G.world,b=Object.values(G.bots).find(x=>!x.dead),o=wco(W,b.n,b.c),hv=histBest(G,'scale').v,mv=histBest(G,'market').v;
  o.hp=Math.max(hv*1.02,W.hp*2);W.hp=o.hp/0.6;W.my.hp=1;ok(!domBots(G),'бот с одной категорией (масштаб выше рекорда и половины мира) — ещё не господствует');
  o.rev=Math.max(mv*1.02,W.rev*2);W.rev=o.rev/0.6;W.my.rev=1;const r=domBots(G);ok(!!(r&&r.ks.length===2&&r.ks.includes('scale')&&r.ks.includes('market')&&r.n===b.n),'бот с двумя категориями — господствует: '+(r?r.n+' ('+r.ks.join(', ')+')':'нет'));
  domCheck(G);ok(G.domLost&&G.domLost.ks&&G.domLost.ks.length===2&&G.pending.some(e=>/господствует: масштаб и рынок/.test(e.title||'')),'газета о господстве соперника по двум категориям');}
/* ---------- дочерняя марка — в ваш зачёт; сохранения 0.41–0.45 ---------- */
{seed(9);newGame('custom','us','Проба3','normal','Ласточка');G.helper={on:1};for(let k=0;k<12*10;k++){while(G.pending.length)resolve(G.pending[0].choices[0][1]);G.over=false;step();}
  const W=G.world,i=COMPS.us.findIndex(cp=>!cp.imp&&cp.n==='Oldsmobile');const x=G.comps.us[i];const before=W.my.hp,beforeCo=(W.co['Oldsmobile']||{}).hp||0;
  G.hold=G.hold||[];G.hold.push({c:'us',i,n:'Oldsmobile',mode:'sub',st:0.51,t:mi(G)});x.lg={people:100};x.last=100;worldMonth(G,G.last);
  ok(W.my.hp>before&&((W.co['Oldsmobile']||{}).hp||0)===beforeCo,'Oldsmobile с контрольным пакетом (51 %) — его продажи в ваш зачёт, а не в его собственный');
  G.hold.pop();W.v=2;W.co['Ford (Манчестер)']={hp:1000,rev:5000,sport:0,firsts:0,r12:100,cu:{uk:10},c:'uk'};const f0=(W.co['Ford']||{}).hp||0;worldMonth(G,G.last);
  ok(W.v===3&&!W.co['Ford (Манчестер)']&&W.co['Ford']&&W.co['Ford'].hp>=f0+1000,'сохранение 0.45: «Ford (Манчестер)» слит в Ford');
  G.dom={k:'innov',y:1903,m:5,who:'you'};G.domLost=null;domCheck(G);ok(!G.dom&&G.log.some(l=>/Прежняя победа по одной категории снята/.test(l.t||l.text||JSON.stringify(l))),'сохранение 0.45 с победой по одной категории: победа снята, партия продолжается (запись в журнале)');}
console.log(bad?'ОШИБОК: '+bad:'всё в порядке');process.exit(bad?1:0);}`);
