// 0.44–0.46: соперники всегда живые; господство = больше половины живого мира И больше рекорда эпохи (0.46: по двум категориям) (лучший итог настоящей истории
// 1895–1930 по категории, HIST_ERA_DATA из tools/gen_era.js); первая модель в новой игре — имя легенды. node game/test/v44.js
require('./harness.js')(`{
let bad=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)bad++;};
BOTS_OFF=false;const seed=k=>{let a=k;Math.random=()=>{a=(a*16807)%2147483647;return a/2147483647;};};
seed(5);newGame('custom','fr','Проба','normal','Ласточка');G.helper={on:1};G.botsOff=1;
for(let k=0;k<12*12;k++){while(G.pending.length)resolve(G.pending[0].choices[0][1]);G.over=false;step();}
ok(G.bots&&Object.keys(G.bots).length===12&&botsOn(G),'соперники живые всегда — и в партии, где в 0.41–0.43 было выбрано «по истории» (botsOff)');
ok(!G.world.hist,'помесячного исторического мира (0.44) в сохранении больше нет');
const E=histEra();ok(E===HIST_ERA_DATA&&E.y0===1895&&E.y1===1930,'рекорд эпохи берётся из сборки (16a-era.js), эпоха 1895–1930');
{const t0=Date.now();const F=histEraCompute();const dev=Math.max(...DOM_K.map(k=>Math.abs(F.best[k].v-E.best[k].v)/Math.max(1e-9,E.best[k].v)));ok(dev<0.005&&DOM_K.every(k=>F.best[k].n===E.best[k].n),'сборка не устарела: пересчёт рекорда эпохи совпадает ('+(Date.now()-t0)+' мс, расхождение '+(dev*100).toFixed(2)+' %)');}
const T=domTable(G);ok(DOM_K.every(k=>T[k].hist&&T[k].hist.n&&T[k].hist.v>0),'у каждой категории — рекордсмен эпохи: '+DOM_K.map(k=>k+' '+T[k].hist.n).join(', '));
ok(T.scale.hist.n==='Ford'&&T.scale.hist.v>4e8&&T.sport.hist.n==='Bugatti'&&T.brand.hist.n==='Ford'&&T.capital.hist.n==='Ford','рекорды: Ford — '+domFmt('scale',T.scale.hist.v)+' за эпоху, Bugatti — '+T.sport.hist.v+' очков побед, Ford — '+domFmt('brand',T.brand.hist.v)+' и капитал '+domFmt('capital',T.capital.hist.v));
// условие победы: половина живого мира — мало, нужно больше истории
{const W=G.world,hv=T.scale.hist.v;W.my.hp=Math.max(W.hp,1)*1.2;W.hp=W.my.hp+W.hp;/* игрок — 55 % живого мира */const T2=domTable(G);
  ok(T2.scale.share>=0.5&&!T2.scale.ok&&!T2.scale.histOk,'55 % живого мира в '+G.y+' году ('+domFmt('scale',W.my.hp)+') — не победа: рекорд эпохи Ford '+domFmt('scale',hv)+' не превзойдён');
  W.my.hp=hv*1.01;W.hp=Math.max(W.hp,W.my.hp*2.5);const T3=domTable(G);ok(T3.scale.histOk&&!T3.scale.ok&&T3.scale.share<0.5,'больше рекорда эпохи, но меньше половины живого мира — ещё не победа');
  W.my.hp=Math.max(hv*1.01,W.hp);W.hp=W.my.hp/0.6;const T4=domTable(G);ok(T4.scale.ok&&T4.scale.histOk,'и больше половины живого мира, и больше рекорда эпохи — победа (оба условия)');}
// карточка и экран показывают историю
{const h=domCard(G);ok(/рекорд эпохи [(]1895–1930[)] — /.test(h)&&/u class="hist"/.test(h)&&/два условия/.test(h),'карточка «Господство»: «два условия», строка «рекорд эпохи (1895–1930) — …» и метка рекорда на шкале');
  ok(/рекорд эпохи: /.test(domScreenHTML(G)),'экран итога: «рекорд эпохи: …» в каждой строке');}
// бот тоже должен превзойти историю
{const W=G.world;const b=Object.values(G.bots).find(x=>!x.dead);const o=wco(W,b.n,b.c);o.hp=W.hp*2;W.hp=o.hp+W.hp;W.my.hp=1;const hv=histBest(G,'scale').v;const r=domBots(G);
  ok(!r,'бот с 2/3 живого мира, но ниже рекорда эпохи — не господствует');
  o.hp=Math.max(hv*1.02,W.hp);W.hp=o.hp/0.6;const r2=domBots(G);ok(!r2,'бот выше рекорда эпохи и больше половины мира по масштабу — одной категории мало (0.46: нужны две, см. v45)');
  const mv=histBest(G,'market').v;o.rev=Math.max(mv*1.02,W.rev*2);W.rev=o.rev/0.6;W.my.rev=1;const r3=domBots(G);ok(!!(r3&&r3.n===b.n&&r3.ks.length===2),'…а с рынком — господствует');}
// новая игра: имя первой модели — легенда
ok(startLegendDef('frese','ru')&&startLegendDef('frese','ru').name==='Яковлев и Фрезе'&&startLegendDef('benz','de').name==='Вело'&&!startLegendDef('ford','us')&&!startLegendDef('maybach','de'),'экран новой игры: Фрезе — «Яковлев и Фрезе», Бенц — «Вело», у Форда и Майбаха — «Тип 1»');
console.log(bad?'ОШИБОК: '+bad:'всё в порядке');process.exit(bad?1:0);}`);
