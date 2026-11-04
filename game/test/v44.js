// 0.44: соперники всегда живые; господство = половина живого мира, больше любого соперника И больше лучшего показателя настоящей
// истории к этой дате (W.hist — исторический мир теми же месяцами); первая модель в новой игре — имя легенды. node game/test/v44.js
require('./harness.js')(`{
let bad=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)bad++;};
BOTS_OFF=false;const seed=k=>{let a=k;Math.random=()=>{a=(a*16807)%2147483647;return a/2147483647;};};
seed(5);newGame('custom','fr','Проба','normal','Ласточка');G.helper={on:1};G.botsOff=1;
for(let k=0;k<12*12;k++){while(G.pending.length)resolve(G.pending[0].choices[0][1]);G.over=false;step();}
ok(G.bots&&Object.keys(G.bots).length===12&&botsOn(G),'соперники живые всегда — и в партии, где в 0.41–0.43 было выбрано «по истории» (botsOff)');
const H=G.world.hist;ok(H&&H.at===mi(G)-1&&H.hp>1e6&&H.sport>100&&H.firsts>5&&Object.keys(H.co).length>40,'исторический мир копится теми же месяцами: '+Math.round(H.hp/1e6)+' млн л. с., '+H.sport+' очков спорта, '+H.firsts+' первенств, '+Object.keys(H.co).length+' компаний');
const T=domTable(G);ok(DOM_K.every(k=>T[k].hist&&T[k].hist.n&&T[k].hist.v>0),'у каждой категории — лучший в истории: '+DOM_K.map(k=>k+' '+T[k].hist.n).join(', '));
ok(['Ford','Nash','Cadillac','General Motors','Oldsmobile','Buick'].includes(T.scale.hist.n)&&T.scale.hist.v>T.scale.lead.v*0.7,'масштаб: в истории к '+G.y+' году лучший — американская марка ('+T.scale.hist.n+', '+domFmt('scale',T.scale.hist.v)+'; живой лидер '+T.scale.lead.n+' '+domFmt('scale',T.scale.lead.v)+')');
// условие победы: половина живого мира — мало, нужно больше истории
{const W=G.world,hv=T.scale.hist.v;W.my.hp=Math.max(W.hp,1)*1.2;W.hp=W.my.hp+W.hp;/* игрок — 55 % живого мира */const T2=domTable(G);
  ok(T2.scale.share>=0.5&&(T2.scale.ok===(W.my.hp>hv)),'55 % живого мира: победа только если больше исторического Ford ('+domFmt('scale',hv)+') — сейчас '+(T2.scale.ok?'да':'нет')+' ('+domFmt('scale',W.my.hp)+')');
  W.my.hp=hv*1.01;W.hp=Math.max(W.hp,W.my.hp*1.5);const T3=domTable(G);ok(T3.scale.histOk&&!T3.scale.ok&&T3.scale.share<0.5,'больше истории, но меньше половины живого мира — ещё не победа');
  W.my.hp=Math.max(hv*1.01,W.hp);W.hp=W.my.hp/0.6;const T4=domTable(G);ok(T4.scale.ok&&T4.scale.histOk,'и больше половины живого мира, и больше истории — победа');}
// карточка и экран показывают историю
{const h=domCard(G);ok(/в истории к этой дате лучший — /.test(h)&&/u class="hist"/.test(h),'карточка «Господство»: строка «в истории к этой дате лучший — …» и метка истории на шкале');
  ok(/история: /.test(domScreenHTML(G)),'экран итога: «история: …» в каждой строке');}
// бот тоже должен превзойти историю
{const W=G.world;const b=Object.values(G.bots).find(x=>!x.dead);const o=wco(W,b.n,b.c);o.hp=W.hp*2;W.hp=o.hp+W.hp;W.my.hp=1;const hv=histBest(G,'scale').v;const r=domBots(G);
  ok((o.hp>hv)===!!(r&&r.k==='scale'),'бот с 2/3 живого мира господствует, только если превзошёл историю ('+(r?r.n:'нет')+')');}
// старое сохранение без hist — догоняет за один вызов
{delete G.world.hist;const t0=Date.now();const H2=histWorld(G);ok(H2.at===mi(G)&&H2.hp>1e6&&Date.now()-t0<3000,'сохранение 0.43 без исторического мира: пересчёт с начала партии за '+(Date.now()-t0)+' мс');}
// новая игра: имя первой модели — легенда
ok(startLegendDef('frese','ru')&&startLegendDef('frese','ru').name==='Яковлев и Фрезе'&&startLegendDef('benz','de').name==='Вело'&&!startLegendDef('ford','us')&&!startLegendDef('maybach','de'),'экран новой игры: Фрезе — «Яковлев и Фрезе», Бенц — «Вело», у Форда и Майбаха — «Тип 1»');
console.log(bad?'ОШИБОК: '+bad:'всё в порядке');process.exit(bad?1:0);}`);
