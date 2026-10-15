// 0.35: свой фильм у пути «Мотомастерская» и у каждого мотогероя (не «доктор» из автомобильной мастерской);
// у финансистов Дюранта и Роллса — свои фильмы; деньги в выборе — по масштабу компании («денег не берут»).
// node game/test/saga35.js
require('./harness.js')(`
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
const quiet=()=>{for(let i=0;i<8;i++)try{closePaper();}catch(_){};G.pending=[];};
// ---------- 1) чей фильм ----------
newMotoGame('custom','fr','Мото','normal','М1');quiet();ok(sagaList(G)===SAGA.moto,'мотомастерская, свой персонаж: фильм «'+SAGA.moto.map(c=>c.t).join(' → ')+'»');
for(const k of ['dedion','morris','wanderer','bianchi']){newMotoGame(k,PIONEERS[k].c,'М','normal','М1');quiet();ok(sagaList(G)===SAGA[k],PIONEERS[k].name+': свой фильм — «'+SAGA[k][0].t+'», «'+SAGA[k][SAGA[k].length-1].t+'»');}
for(const k of ['durant','rolls']){newGame(k,PIONEERS[k].c,'Т','normal');quiet();ok(sagaList(G)===SAGA[k],PIONEERS[k].name+': свой фильм — «'+SAGA[k].map(c=>c.t).join('», «')+'»');}
newGame('custom','fr','Т','normal');quiet();ok(sagaList(G)===SAGA.custom,'автомобильная мастерская, свой персонаж: прежний фильм «'+SAGA.custom[0].t+'»');
// ---------- 2) главы целы: сцены, вопрос, выборы с итогом; ни слова о докторе; фото — в списке для сборки ----------
{const T=new Set(allTitles()),BK=Object.keys(SAGA_B),SK=Object.keys(SEG),FX=['cash','cashK','rep','b','seg','mood','legal','roy','sup'],seen=new Set();let dup=[];
  Object.values(SAGA).forEach(L=>L.forEach(c=>{if(seen.has(c.id))dup.push(c.id);seen.add(c.id);}));ok(!dup.length,'все главы всех фильмов — с разными именами'+(dup.length?': '+dup.join(', '):''));
  for(const k of ['moto','dedion','morris','wanderer','bianchi','durant','rolls']){const bad=[];
    SAGA[k].forEach(c=>[{}].concat(c.v||[]).forEach(v=>{const sc=v.sc||c.sc,o=v.o||c.o,q=v.q||c.q;
      if(!sc||sc.length<3)bad.push(c.id+': мало сцен');if(!q)bad.push(c.id+': нет вопроса');if(!o||o.length<2)bad.push(c.id+': мало выборов');
      (o||[]).forEach(x=>{const f=x.fx||{};if(!x.t||!x.res)bad.push(c.id+': выбор без текста');Object.keys(f).forEach(z=>{if(!FX.includes(z))bad.push(c.id+': fx.'+z);});
        Object.keys(f.b||{}).forEach(z=>{if(!BK.includes(z))bad.push(c.id+': b.'+z);});Object.keys(f.seg||{}).forEach(z=>{if(!SK.includes(z))bad.push(c.id+': seg.'+z);});
        if(!sagaFxText(f,G))bad.push(c.id+': у выбора «'+x.t+'» нет последствий');});
      const txt=JSON.stringify(sc)+JSON.stringify(o)+q;if(/доктор/i.test(txt))bad.push(c.id+': доктор');
      (sc||[]).forEach(x=>{[].concat(x.img&&typeof x.img==='object'?Object.values(x.img):x.img||[]).forEach(k=>{if(!T.has(k))bad.push(c.id+': фото «'+k+'» не в списке');});});}));
    ok(!bad.length,k+': '+SAGA[k].length+' глав — сцены, вопрос, выборы с последствиями, без «доктора»'+(bad.length?' — '+bad.slice(0,5).join('; '):''));}}
// ---------- 3) выбор знает, есть ли у фирмы автомобили ----------
{newMotoGame('dedion','fr','Д','normal','М1');quiet();G.y=1910;const t=()=>sagaChapter(G,SAGA.dedion.find(x=>x.id==='dedion5'),false).o.map(o=>o.t).join(' / ');
  const a=t();G.lines.car=1;const b=t();ok(/автомобильный цех/.test(a)&&!/V8/.test(a)&&/V8/.test(b),'де Дион, 1910: одни мотоциклы — «'+a+'»; есть автомобили — «'+b+'»');
  newMotoGame('morris','uk','М','normal','М1');quiet();G.y=1912;const m=sagaChapter(G,SAGA.morris.find(x=>x.id==='morris4'),false);ok(/четыре колеса/.test(m.q),'Моррис, 1912, без автомобилей: «'+m.q+'»');}
// ---------- 4) деньги — по масштабу компании ----------
{newGame('custom','fr','Т','normal');quiet();G.y=1912;const ci=cpi(G),fx={cash:700},neg={cash:-600};
  G.last={mat:300*ci,wage:200*ci,ovh:150*ci,dlr:0,ad:0,rd:0,int:0};ok(sagaScale(G)===1&&sagaCash(G,fx)===Math.round(700*ci/10)*10,'мастерская (расходы '+money(sagaMonthCost(G))+' в месяц): «+$700» — '+money(sagaCash(G,fx))+', как написано');
  G.last={mat:2.2e5*ci,wage:1.1e5*ci,ovh:4e4*ci,dlr:1e4*ci,ad:5e3*ci,rd:5e3*ci,int:0};G.cash=2e7*ci;const k=sagaScale(G),shown=sagaFxText(fx,G),c0=G.cash;sagaApply(G,fx);const got=G.cash-c0;
  ok(k>300&&got===sagaCash(G,fx)&&got>2e5*ci&&shown.includes(money(got)),'большой завод (расходы '+money(sagaMonthCost(G))+' в месяц, касса '+money(c0)+'): «+$700» мастерской = '+money(got)+' (×'+Math.round(k)+', '+(got/sagaMonthCost(G)).toFixed(1)+' мес. расходов); на кнопке — «'+shown+'»');
  G.cash=2e7*ci;let c1=G.cash;const want=-sagaCash(G,neg);sagaApply(G,neg);ok(c1-G.cash===want&&want>2e5*ci,'и траты тоже: «−$600» у завода с полной кассой — '+money(c1-G.cash));
  G.cash=1e6*ci;c1=G.cash;sagaApply(G,neg);ok(Math.abs(c1-G.cash-0.1*c1)<20,'у того же завода с кассой '+money(c1)+' трата — не больше десятой части: '+money(c1-G.cash)+' (иначе было бы '+money(want)+')');
  G.cash=1e6*ci;c1=G.cash;sagaApply(G,fx);ok(Math.abs(G.cash-c1-0.1*c1)<20,'и доход — не больше десятой части кассы: '+money(G.cash-c1)+' (иначе было бы '+money(got)+')');
  G.last={mat:2000*ci,wage:1000*ci,ovh:300*ci};G.cash=1500*ci;c1=G.cash;sagaApply(G,neg);ok(Math.abs(c1-G.cash-600*ci)<10,'мастерская с пустой кассой: «−$600» — как написано ('+money(c1-G.cash)+')');
  ok(/спрос на мотоциклы с коляской \\+12%/.test(sagaFxText({seg:{moside:[1.12,36]}},G))&&/спрос на мотоциклы −6%/.test(sagaFxText({seg:{moto:[0.94,36]}},G)),'итог выбора по-русски: «'+sagaFxText({seg:{moside:[1.12,36]},b:{}},G)+'», «'+sagaFxText({seg:{moto:[0.94,36]}},G)+'»');}
// ---------- 5) игра идёт: главы приходят по порядку, свои ----------
function play(mk,yEnd){mk();quiet();let n=0;while(G.y<yEnd&&!G.over&&n++<600){let g=0;while(G.pending.length&&g++<50){const ev=G.pending[0],K=(ev.choices||[]).map(x=>x[1]);resolve(K.includes('saga')?'saga':K.includes('tskip')?'tskip':K.find(x=>!/^reel:/.test(x))||'ok');}
  G.cash=Math.max(G.cash,2e5*cpi(G));step();}return (G.saga&&G.saga.seen)||[];}
for(const [k,c] of [['custom','fr'],['dedion','fr'],['morris','uk'],['wanderer','de'],['bianchi','it']]){const seen=play(()=>newMotoGame(k,c,'М','normal','М1'),1930),L=sagaList(G),own=seen.filter(id=>L.some(x=>x.id===id));
  ok(own.length>=5&&own.length===seen.length&&!seen.some(id=>/^custom/.test(id)),(k==='custom'?'свой мотоциклист':PIONEERS[k].name)+', '+c+' 1930: глав '+own.length+' из '+L.length+' — '+own.map(id=>'«'+L.find(x=>x.id===id).t+'»').join(', '));}
for(const k of ['durant','rolls']){const seen=play(()=>newGame(k,PIONEERS[k].c,'Т','normal'),1930),L=sagaList(G);ok(seen.length>=6&&seen.every(id=>L.some(x=>x.id===id)),PIONEERS[k].name+' 1930: глав '+seen.length+' из '+L.length);}
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');
`);
