// 0.60, этап 1 — каркас «игра до 1960 года»: год конца партии, рекорд эпохи, продление таблиц, старые сохранения.
// node game/test/v60.js
require('./harness.js')(`
let ok=0,bad=0;const CK=(c,m)=>{if(c)ok++;else{bad++;console.log("FAIL",m);}};
const seed=k=>{let a=k;Math.random=()=>{a=(a*16807)%2147483647;return a/2147483647;};};
/* ---------- 1. год конца и рекорд эпохи ---------- */
CK(END_Y===1960&&ERA_END===END_Y&&END_RACER===1930,'партия идёт до '+END_Y+' года; путь гонщика пока до '+END_RACER);
{const E=histEra();CK(E===HIST_ERA_DATA&&E.y0===1895&&E.y1===1960,'рекорд эпохи из сборки — за 1895–'+E.y1);
  CK(E.best.scale.v>1e9&&E.best.market.v>3e10&&E.best.sport.v>0&&E.best.innov.v>0,'рекорд эпохи вырос вместе с эпохой: масштаб '+Math.round(E.best.scale.v/1e6)+' млн л. с. ('+E.best.scale.n+')');}
/* ---------- 2. 1930 год — не конец ---------- */
{seed(60);newGame('ford','us','','normal','Каркас');const s=G;s.cash=5e6;s.pending=[];s.y=1929;s.m=11;let err='';try{step();}catch(e){err=e.message;}
  CK(!err&&s.y===1930&&s.m===0&&!s.over&&!s.final,'декабрь 1929 года → январь 1930-го: партия продолжается'+(err?' — ошибка: '+err:''));
  s.pending=[];let e2='',n=0;try{for(let k=0;k<24&&!s.over;k++){s.pending=[];s.cash=Math.max(s.cash,1e6);step();n++;}}catch(e){e2=e.message;}
  CK(!e2&&n===24&&s.y===1932&&!s.over,'ещё два года идут без ошибок'+(e2?' — '+e2:''));
  CK(isFinite(prefP('people','us',s))&&prefP('people','us',{y:1950,m:0})===prefP('people','us',{y:1929,m:11})&&cpi({y:1955,m:0})===cpi({y:1930,m:0}),'таблицы истории после 1929 года продлены ровно: цена класса и цены 1950-х — как в 1929–1930 годах');
  const mk=s.last&&s.last.mk&&s.last.mk.us;CK(mk&&mk.size>0&&isFinite(mk.size),'рынок 1931 года считается: '+Math.round(mk&&mk.size)+' машин в месяц в США');}
/* ---------- 3. итог — в январе 1960 года ---------- */
{seed(61);newGame('ford','us','','normal','Каркас');const s=G;s.cash=5e6;s.pending=[];s.y=1959;s.m=10;let err='';try{step();}catch(e){err=e.message;}
  CK(!err&&s.y===1959&&s.m===11&&!s.over,'ноябрь 1959 года: ещё не конец'+(err?' — '+err:''));s.pending=[];s.cash=Math.max(s.cash,1e6);try{step();}catch(e){err=e.message;}
  const ev=s.pending.find(p=>/Итоги эпохи/.test(p.title||''));
  CK(!err&&s.y===1960&&s.over&&s.final&&ev&&/встречает 1960 год/.test(ev.deck||''),'январь 1960 года: итог эпохи, «встречает 1960 год»'+(err?' — '+err:''));
  CK(s.hist.cash.length<=(END_Y-1895)*12,'история графиков — до '+(END_Y-1895)*12+' месяцев');}
/* ---------- 4. сохранение, где эпоха кончилась в 1930 году, продолжается ---------- */
{seed(62);newGame('ford','us','','normal','Каркас');const s=G;s.y=1930;s.m=0;s.cash=2e6;s.over=true;s.final={place:3,total:812,title:'Великая компания'};s.fameSaved=1;
  s.pending=[{title:'Итоги эпохи: Великая компания',deck:'x',text:'y',paper:true,choices:[['Сравнить с историей','final']]},{title:'Заметка',text:'z',choices:[['Дальше','ok']]}];
  const x=JSON.parse(JSON.stringify(s)),m=migrate(x);
  CK(m.over===false&&m.final30&&m.final30.total===812&&!m.final&&m.fameSaved===0&&m.cont60===1930,'итог 1930 года сохранён отдельно, партия открыта снова');
  CK(m.pending.length===1&&m.pending[0].title==='Заметка','окно «Итоги эпохи» убрано, прочие остались');
  G=m;let err='';try{G.pending=[];step();}catch(e){err=e.message;}CK(!err&&!G.over&&G.y===1930&&G.m===1,'после загрузки ход идёт дальше: февраль 1930 года'+(err?' — '+err:''));
  const b=JSON.parse(JSON.stringify(s));b.cash=-9e7;CK(migrate(b).over===true,'разорившаяся фирма не оживает');
  const r=JSON.parse(JSON.stringify(s));r.mode='racer';CK(migrate(r).over===true,'законченная карьера гонщика остаётся законченной');
  const so=JSON.parse(JSON.stringify(s));so.soldTo={co:'X',mine:1e6};CK(migrate(so).over===true,'проданная фирма остаётся проданной');
  const y=JSON.parse(JSON.stringify(s));y.y=1921;CK(migrate(y).over===true,'партия, законченная раньше 1930 года, не трогается');}
/* ---------- 5. события без привязки к эпохе идут всю партию ---------- */
{const by=id=>CHANCE.find(e=>e.id===id);CK(by('press').y1===END_Y-1&&by('steel').y1===END_Y-1&&by('maharaja').y1===1929&&by('royal').y1===1914,'«Восторженная статья» — до 1959 года; «Заказ махараджи» и «Королевский двор» — в своих годах');}
console.log(bad?'FAILED '+bad:'ok '+ok);if(bad)process.exitCode=1;
`);
