// ТЗ 0.18, раздел 5: пять ботов на сложности «Норма» — пассивный, средний, сильный, жадный, экспансия в долг.
// node test/bots18.js <бот> <страна> <зерно> [сложность]  → одна партия, в конце строка JSON с итогом
// node test/bots18.js all [прогонов=20] [потоков=2]         → матрица ботов × прогонов (страны по кругу), сводка по коридорам 5.1
const {spawn}=require('child_process');
const A=process.argv.slice(2);
if(A[0]==='all'){
  const runs=+(A[1]||20),par=+(A[2]||2),bots=(A[3]||'passive,middle,strong,greedy,debt').split(','),C=['us','fr','uk','de','it'];
  const jobs=[];bots.forEach(b=>{for(let i=0;i<runs;i++)jobs.push([b,C[i%C.length],String(101+i*7)]);});
  const out=[];let run=0,done=0;const t0=Date.now();
  const next=()=>{if(!jobs.length)return;const j=jobs.shift();run++;const p=spawn(process.execPath,[__filename,...j]);let buf='';p.stdout.on('data',d=>buf+=d);p.stderr.on('data',d=>buf+=d);
    p.on('close',()=>{run--;done++;const L=buf.trim().split('\n').filter(l=>l.startsWith('{')).pop();let r=null;try{r=JSON.parse(L);}catch(e){r={bot:j[0],c:j[1],seed:j[2],err:buf.slice(-300)};}
      out.push(r);process.stderr.write(`${done}/${done+jobs.length+run} ${j.join(' ')} → ${r.err?'ОШИБКА':'$'+fmt(r.value)+' место '+r.place+(r.over?' банкрот '+r.overY:'')} (${Math.round((Date.now()-t0)/1000)} с)\n`);
      if(jobs.length)next();else if(!run)report(out);});};
  for(let i=0;i<par;i++)next();
  function fmt(v){return Math.abs(v)>=1e9?(v/1e9).toFixed(2)+' млрд':Math.abs(v)>=1e6?(v/1e6).toFixed(1)+' млн':Math.round(v/1e3)+' тыс';}
  function report(L){const ok={passive:r=>(r.over&&r.overY<1915)||(r.value<5e6&&r.place>10),middle:r=>!r.over&&r.value>=50e6&&r.value<=200e6&&r.place>=5&&r.place<=10,
      strong:r=>!r.over&&r.value>=0.6e9&&r.value<=1.5e9&&r.place<=3,greedy:r=>(r.over&&r.overY>=1912)||(!r.over&&r.place>10&&r.fell),debt:r=>r.over&&((r.overY>=1920&&r.overY<=1921)||r.overY>=1929)};
    let fails=0;console.log('\nбот       страна  стоимость      касса        место  итог');
    bots.forEach(b=>{const R=L.filter(r=>r.bot===b);R.forEach(r=>{if(r.err){console.log(b.padEnd(9),r.c,'ОШИБКА',r.err);fails++;return;}
      console.log(b.padEnd(9),r.c.padEnd(7),('$'+fmt(r.value)).padEnd(14),('$'+fmt(r.cash)).padEnd(12),String(r.place).padEnd(6),r.over?'банкрот '+r.overY:'1930'+(r.fell?' (упал после '+r.fell+')':''),ok[b]&&ok[b](r)?'':'  ← вне коридора');});
      const n=R.filter(r=>!r.err&&ok[b]&&ok[b](r)).length;console.log(`== ${b}: в коридоре ${n} из ${R.length}`);if(n<R.length)fails+=R.length-n;});
    console.log(fails?`ВНЕ КОРИДОРОВ: ${fails}`:'все в коридорах');}
  return;
}
const bot=A[0]||'strong',country=A[1]||'us',seed=+(A[2]||7),diff=A[3]||'normal';
require('./harness.js')(`
Math.random=(()=>{let a=${seed}*7919%2147483647||1;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
const BOT=${JSON.stringify(bot)},CC=${JSON.stringify(country)};
newGame('custom',CC,'Бот','${diff}','Первая');
if(BOT==='strong'||BOT==='debt')G.helper={on:1};
let lastDesign=0,overY=0,peakV=0,peakY=0;
const cls=()=>CC==='us'?(G.y>=1908?'people':'middle'):(G.y>=1920?'people':'middle');
function newModel(kind,cheap){let md=autoDesign(kind,G);
  // жадный экономит на качестве: самые дешёвые шины, тормоза и коробка (мотор, рама и кузов — как у всех)
  if(cheap){['w','k','g'].forEach(k=>{const L=unlockedP(PART_CATS.find(c=>c.k===k).arr(),G).slice().sort((a,b)=>partCost(a,G)-partCost(b,G));for(const x of L){const t={...md,[k]:x.id};if(!overpower(t)){md=t;break;}}});}
  const dc=devCost(md,G);if(G.cash<dc*1.3)return null;G.cash-=dc;
  const m={...md,id:G.nextId++,name:'Модель '+G.nextId,paint:'#333',plan:'auto',status:'dev',devLeft:devMonths(md),launched:0,stock:0,backlog:0,lastDem:0,lastSold:0,lastMade:0,totalSold:0,made:0,fc:0};
  m.price=Math.round(refPrice(m,G)*(cheap?1.25:1)/10)*10;G.models.push(m);lastDesign=mi(G);return m;}
function retireOld(){G.models.filter(m=>m.status==='prod').forEach(m=>{const newer=G.models.some(x=>x.status==='prod'&&x.id>m.id&&mi(G)-x.launched>=4);if(newer){m.status='off';G.cash+=m.stock*m.price*0.6;m.stock=0;}});}
function grow(k){const L=G.last,act=G.models.filter(m=>m.status==='prod');if(!L||!act.length||(G.capBuild||[]).length)return;const util=L.made/Math.max(1,capEff(G)),lost=act.reduce((a,m)=>a+(m.lostS||0),0);
  if(util>0.9&&lost>L.sold*0.05){const n=Math.max(2,Math.round(G.cap*k)),c=n*capUnitCost(G);if(G.cash>c*(BOT==='debt'?1.05:2))capOrder(G,n,true);}
  if((L.dumpN>0||whStock(G)>whCap(G)*0.85)&&!(G.whBuild||[]).length){const n=Math.max(5,Math.round(whCap(G)*0.5)),c=n*whUnitCost(G);if(G.cash>c*1.5)whOrder(G,n,true);}}
// разумные дилеры: новые города — когда нынешние не успевают или хорошо продают
function dealersHome(frac){const c=G.country,need=dealerNeed(c,G),have=dealerCount(G,c),mk=G.last&&G.last.mk[c];if(have>=need*frac||G.m%2)return;
  const n=Math.min(Math.round(need*frac-have),(mk&&(mk.lostDlr||0)>0.5)?dealersShort(G,c):dealerGain(G,c));if(n>0&&G.cash>n*dealerCost(G)*3)buyDealers(G,c,n);}
// устаревшая модель — новая раньше срока (но не чаще раза в 3 года)
function stale(){const act=G.models.filter(m=>m.status==='prod');return act.length&&act.every(m=>classScore(m,G)<0.9)&&mi(G)-lastDesign>=36;}
// дома покупателей мало (США до 1905, Италия) — импортёр во Франции, как советует игра
function exportFr(){if(G.country!=='us'&&G.country!=='it')return;if(!impLv(G,'fr')&&G.cash>impCost(G,'fr',1)*2.5)impUp(G,'fr');
  const d=dealerCount(G,'fr');if(impLv(G,'fr')&&dealerRoom(G,'fr')>0&&G.last&&(G.last.mk.fr||{}).lostDlr>0.5&&G.cash>dealerCost(G)*4)buyDealers(G,'fr',Math.max(1,Math.round(d*0.2)));}
function month(){const act=G.models.filter(m=>m.status==='prod'),dev=G.models.filter(m=>m.status==='dev');
  if(BOT==='passive')return;if(BOT==='middle'||BOT==='greedy')exportFr();
  if(BOT==='middle'){if(!dev.length&&(mi(G)-lastDesign>=72||stale()))newModel(cls());retireOld();
    if(G.m%6===0)act.forEach(m=>{if(!(m.lastSold||m.lastDem))return;const bp=bestPriceFor(m,G);if(bp.price)m.price=bp.price;});
    grow(0.25);dealersHome(0.5);if(!rdActive(G).length){const pj=suggestProject(G);if(pj)G.rd.projs.push({...pj,prog:0});}
    if(!G.techBuild)for(const k of TECH_ORDER){if(k==='credit')continue;const nx=techNext(G,k);if(nx&&nx.y<=G.y-2&&techOpen(G,k)){const c=techCost(G,k);if(G.cash>c*3){G.cash-=c;G.plantVal+=c*0.7;G.techBuild={k,left:techMonths(G,k)};break;}}}
    if(G.last)G.ad=Math.round(Math.min(adRef(G)*0.5,(G.last.rev||0)*0.03));
    if(G.cash<0&&G.loan+2000*cpi(G)<=maxLoan(G)){const n=Math.round(2000*cpi(G));G.loan+=n;G.cash+=n;}
    if(G.cash>5e4*cpi(G)&&G.loan>0){const n=Math.min(G.loan,G.cash-5e4*cpi(G));G.loan-=n;G.cash-=n;}
    return;}
  if(BOT==='greedy'){G.wagePol='low';if(!dev.length&&(mi(G)-lastDesign>=96||stale()))newModel(cls(),true);retireOld();
    if(G.m%6===0)act.forEach(m=>{m.price=Math.round(refPrice(m,G)*1.25/10)*10;});grow(0.2);dealersHome(0.3);
    if(G.cash<0&&G.loan+2000*cpi(G)<=maxLoan(G)){const n=Math.round(2000*cpi(G));G.loan+=n;G.cash+=n;}return;}
  // сильный и «в долг»: помощник ведёт цены, цеха, дилеров, КБ, экспорт; бот раз в 4 года делает новую модель
  if(!dev.length&&mi(G)-lastDesign>=48&&mi(G)>=6)newModel(cls());retireOld();
  if(BOT==='debt'){// кредиты на всё: берём по максимуму и строим вдвое больше
    const room=maxLoan(G)-G.loan;if(room>1000&&loanOpen(G)){G.loan+=room;G.cash+=room;}
    grow(0.6);dealersHome(1.0);
    if(G.m%6===3)Object.keys(COUNTRIES).forEach(c=>{if(c!==G.country&&impLv(G,c)<3)impUp(G,c);});}
}
let fellY=0,wasBig=0;
for(let k=0;k<35*12;k++){
  let guard=0;while(G.pending.length&&guard++<50){const ev=G.pending[0];resolve(ev.choices[0][1]);}
  if(G.over)break;
  try{month();}catch(e){console.log('bot err',e&&e.stack);}
  const yB=G.y;const ok=step();if(!ok&&!G.pending.length)break;
  if(process.env.V==='3'&&G.last){const L=G.last,Y=globalThis.PL=globalThis.PL||{};const q=Y[yB]=Y[yB]||{};['rev','mat','wage','ovh','dlr','ad','sto','int','rd','tax','profit','sold','homeSold','turn','war','lic','tool'].forEach(k=>q[k]=(q[k]||0)+(L[k]||0));
    if(G.m===0){const f=v=>(v/1e6).toFixed(1),md=G.models.filter(m=>m.status==='prod').sort((a,b)=>(b.lastSold||0)-(a.lastSold||0))[0],o=G.resp&&G.resp[G.country];
      console.log(yB,'прод',Math.round(q.sold),'выр',f(q.rev),'мат',f(q.mat),'зп',f(q.wage),'накл',f(q.ovh),'дил',f(q.dlr),'рекл',f(q.ad),'тек',f(q.turn),'гар',f(q.war),'%',f(q.int),'КБ',f(q.rd),'нал',f(q.tax),'ПРИБ',f(q.profit),'| касса',f(G.cash),'стоим',f(companyValue(G)),md?'| '+segOf(md)+' $'+md.price+' c'+Math.round(unitCost(md,G))+' q'+classScore(md,G).toFixed(2)+' реп'+Math.round(G.rep):'',o?'| доля '+SEGK.filter(g=>o[g]&&o[g].sh>0.02).map(g=>g+' '+Math.round(o[g].sh*100)+'% −'+Math.round(o[g].cut*100)+'% +'+respBoost(G,G.country,g).toFixed(2)+' rv'+((G.rv&&G.rv[G.country]&&G.rv[G.country][g])||0).toFixed(2)).join(', '):'');}}
  const v=companyValue(G);if(v>peakV){peakV=v;peakY=G.y;}
  if(BOT==='greedy'&&G.y>=1912&&v<peakV*0.5&&!fellY)fellY=G.y;
  if(G.over){overY=G.y;break;}
  if(G.m===0&&(process.env.V==='2'||G.y%5===0)&&process.env.V)console.log(G.y,'стоимость',Math.round(v),'касса',Math.round(G.cash),'кредит',G.loan,'в пути',Math.round(arTotal(G)),'продано',G.peakLast,'место',legacyTable(G).place,'| цех',Math.round(capEff(G)),'стройка',(G.capBuild||[]).map(b=>b.units+'/'+b.left).join(','),'рабочих',G.workers,'| модели',G.models.filter(m=>m.status==='prod').map(m=>m.name+' '+segOf(m)+' $'+m.price+' c'+Math.round(unitCost(m,G))+' q'+classScore(m,G).toFixed(2)+' d'+Math.round(m.lastDem||0)).join('; '),'| дилеры',JSON.stringify(G.dealers),'имп',JSON.stringify(G.imp||{}),'| ответ',['people','middle'].map(g=>{const o=G.resp&&G.resp[G.country]&&G.resp[G.country][g];return o?g+' доля '+Math.round(o.sh*100)+'% скидка '+Math.round(o.cut*100)+'% модели +'+respBoost(G,G.country,g).toFixed(2):'';}).join(' '));
}
let guard=0;while(G.pending.length&&guard++<50){const ev=G.pending[0];if(ev.choices[0][1]==='final'||ev.choices[0][1]==='restart')break;resolve(ev.choices[0][1]);}
const bankrupt=!!G.over&&G.cash<-debtLimit(G)*0.999||(G.over&&G.y<1930);
const t=legacyTable(G);
console.log(JSON.stringify({bot:BOT,c:CC,seed:${seed},value:Math.round(companyValue(G)),cash:Math.round(G.cash),loan:G.loan,place:t.place,legacy:Math.round(t.me.total),over:bankrupt,overY:bankrupt?overY:0,peakV:Math.round(peakV),peakY,fell:fellY,sold:totalSold(G),best:G.peak.year||0,y:G.y,L:Object.fromEntries(['scale','market','innov','sport','capital','brand'].map(k=>[k,Math.round(t.me[k])])),firsts:Object.keys(G.firsts||{}).length,above:t.rows.slice(Math.max(0,t.place-3),t.place+2).map(r=>r.n+' '+Math.round(r.L.total)).join('; ')}));
`);
