// ТЗ 0.18, раздел 5: пять ботов на сложности «Норма» — пассивный, средний, сильный, жадный, экспансия в долг.
// node test/bots18.js <бот> <страна> <зерно> [сложность]  → одна партия, в конце строка JSON с итогом
// node test/bots18.js all [прогонов=20] [потоков=2]         → матрица ботов × прогонов (страны по кругу), сводка по коридорам 5.1
const {spawn}=require('child_process');
const A=process.argv.slice(2);
if(A[0]==='all'){
  const runs=+(A[1]||20),par=+(A[2]||2),bots=(A[3]||'passive,middle,strong,greedy,debt').split(','),C=(A[4]||'us').split(',');
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
const bot0=A[0]||'strong',noexp=bot0.endsWith('-noexp'),bot=bot0.replace('-noexp',''),country=A[1]||'us',seed=+(A[2]||7),diff=A[3]||'normal';
require('./harness.js')(`
Math.random=(()=>{let a=${seed}*7919%2147483647||1;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
const BOT=${JSON.stringify(bot)},CC=${JSON.stringify(country)};if(process.env.USEDK)globalThis.USEDK=+process.env.USEDK;if(process.env.BSUS)globalThis.BSUS=+process.env.BSUS;if(process.env.GHOSTK)globalThis.GHOSTK=+process.env.GHOSTK;
newGame(${JSON.stringify(process.env.PION||'custom')},CC,'Бот','${diff}','Первая');${process.env.PB_OFF?`${JSON.stringify(process.env.PB_OFF.split(','))}.forEach(k=>{delete PIONEERS[G.pioneer].b[k];});`:''}
const NOEXP=${noexp};if(BOT==='strong')G.helper={on:1,noExp:NOEXP?1:0};if(BOT==='debt')G.helper={on:1,keepLoan:1};
let lastDesign=0,overY=0,peakV=0,peakY=0;
const cls=()=>CC==='us'?(G.y>=1908?'people':'middle'):(G.y>=1920?'people':'middle');
// средняя прибыль за год (помесячно): пока убыток — новая модель только при запасе денег
function pAvg(){const pr=G.hist.profit.slice(-12);return pr.length>=6?pr.reduce((a,b)=>a+b,0)/pr.length:0;}
function newModel(kind,cheap){let md=autoDesign(kind,G);
  // жадный экономит на качестве: самые дешёвые шины, тормоза и коробка (мотор, рама и кузов — как у всех)
  if(cheap){['w','k','g'].forEach(k=>{const L=unlockedP(PART_CATS.find(c=>c.k===k).arr(),G).slice().sort((a,b)=>partCost(a,G)-partCost(b,G));for(const x of L){const t={...md,[k]:x.id};if(!overpower(t)){md=t;break;}}});}
  // сильный и «в долг» при нехватке денег берут на новую модель кредит
  const dc=devCost(md,G);if((BOT==='strong'||BOT==='debt')&&G.cash<dc*1.5&&loanOpen(G)){const n=Math.min(Math.max(0,maxLoan(G)-G.loan),Math.ceil((dc*1.5-G.cash)/1000)*1000);if(n>0){G.loan+=n;G.cash+=n;}}
  if(G.cash<dc*(pAvg()>0||BOT==='strong'||BOT==='debt'?1.3:2.5))return null;G.cash-=dc;
  const m={...md,id:G.nextId++,name:'Модель '+G.nextId,paint:'#333',plan:'auto',status:'dev',devLeft:devMonths(md),launched:0,stock:0,backlog:0,lastDem:0,lastSold:0,lastMade:0,totalSold:0,made:0,fc:0};
  m.price=Math.round(refPrice(m,G)*(cheap?1.25:1)/10)*10;G.models.push(m);lastDesign=mi(G);
  if(process.env.DD)console.log('   DESIGN',dstr(G),kind,PART_KEYS.map(k=>m[k]).join(','),'ref $'+Math.round(refPrice(m,G)),'uc@1k',Math.round(ucAtVol(m,G,1000)),'uc@10k',Math.round(ucAtVol(m,G,10000)),'uc@50k',Math.round(ucAtVol(m,G,50000)),'fc',Math.round(forecastDemand(m,G)),'q',classScore(m,G).toFixed(2),'era',eraPen(m,G.country,G).toFixed(2),'cx',complexity(m).toFixed(2),'old:',G.models.filter(x=>x.status==='prod').map(x=>PART_KEYS.map(k=>x[k]).join(',')+' uc'+Math.round(unitCost(x,G))+' $'+x.price+' era'+eraPen(x,G.country,G).toFixed(2)).join('; '));
  return m;}
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
function exportFr(){if(G.country!=='us'&&G.country!=='it'&&G.country!=='uk')return;if(!impLv(G,'fr')&&G.cash>impCost(G,'fr',1)*2.5)impUp(G,'fr');
  const d=dealerCount(G,'fr');if(impLv(G,'fr')&&dealerRoom(G,'fr')>0&&G.last&&(G.last.mk.fr||{}).lostDlr>0.5&&G.cash>dealerCost(G)*4)buyDealers(G,'fr',Math.max(1,Math.round(d*0.2)));}
function month(){const act=G.models.filter(m=>m.status==='prod'),dev=G.models.filter(m=>m.status==='dev');
  if(BOT==='passive')return;if(BOT==='middle'||BOT==='greedy')exportFr();
  // жадный первые десять лет ведёт дела как средний: жадность приходит, когда марка уже известна
  if(BOT==='middle'||BOT==='greedy'&&G.y<1906){if(!dev.length&&(mi(G)-lastDesign>=72||stale()))newModel(cls());retireOld();
    if(G.m%6===0)act.forEach(m=>{if(!(m.lastSold||m.lastDem))return;const bp=bestPriceFor(m,G);if(bp.price)m.price=bp.price;});
    grow(0.25);dealersHome(0.5);if(!rdActive(G).length){const pj=suggestProject(G);if(pj)G.rd.projs.push({...pj,prog:0});}
    if(!G.techBuild)for(const k of TECH_ORDER){if(k==='credit')continue;const nx=techNext(G,k);if(nx&&nx.y<=G.y-2&&techOpen(G,k)){const c=techCost(G,k);if(G.cash>c*3){G.cash-=c;G.plantVal+=c*0.7;G.techBuild={k,left:techMonths(G,k)};break;}}}
    if(G.last)G.ad=Math.round(Math.min(adRef(G)*0.5,(G.last.rev||0)*0.03));
    if(G.cash<0&&G.loan+2000*cpi(G)<=maxLoan(G)){const n=Math.round(2000*cpi(G));G.loan+=n;G.cash+=n;}
    if(G.cash>5e4*cpi(G)&&G.loan>0){const n=Math.min(G.loan,G.cash-5e4*cpi(G));G.loan-=n;G.cash-=n;}
    return;}
  // жадный: цена на 15% выше выгодной (и не ниже рыночной ×1,1), дешёвые детали, низкая зарплата, новая модель раз в 8 лет
  if(BOT==='greedy'){G.wagePol='low';if(!dev.length&&(mi(G)-lastDesign>=96||stale()))newModel(cls(),true);retireOld();
    if(G.m%6===0)act.forEach(m=>{const bp=(m.lastSold||m.lastDem)?bestPriceFor(m,G).price:m.price;const rp=refPrice(m,G);m.price=Math.round(clamp(bp*1.15,rp*1.1,rp*1.35)/10)*10;});grow(0.2);dealersHome(0.3);
    if(G.cash<0&&G.loan+2000*cpi(G)<=maxLoan(G)){const n=Math.round(2000*cpi(G));G.loan+=n;G.cash+=n;}return;}
  // сильный: помощник ведёт цены, цеха, дилеров, КБ, экспорт; бот раз в 4 года делает новую модель
  if(!dev.length&&mi(G)-lastDesign>=48&&mi(G)>=6)newModel(cls());retireOld();
  if(BOT==='debt')debtMonth(act);
}
// «Экспансия в долг»: помощник ведёт дела, а бот держит кредит на пределе и всё, что в кассе сверх тонкого запаса, пускает в рост:
// цеха впрок, дилеры во всех городах, заводы за границей, КБ и технологии
function debtMonth(act){const L=G.last;
  // до 1910 года — как сильный (помощник, кредит по нужде): в долг растут, когда марка уже на ногах
  if(G.y<1910){G.helper.keepLoan=0;return;}G.helper.keepLoan=1;
  if(loanOpen(G)){const room=maxLoan(G)-G.loan;if(room>1000){G.loan+=room;G.cash+=room;}}
  if(!L||!act.length)return;const sold=L.sold||0,res=Math.max(3000*cpi(G),((L.mat||0)+(L.wage||0))*0.1),free=()=>G.cash-res;
  if(sold<8)return; // пока продаж почти нет — растить нечего
  // цеха — впрок, «рынок же растёт»: по +35%, сколько угодно строек сразу, пока в кассе есть деньги
  for(let i=0;i<6&&(G.capBuild||[]).length<14;i++){const n=Math.max(2,Math.round(G.cap*0.35)),c=n*capUnitCost(G);if(free()>c)capOrder(G,n,true);else break;}
  // как Дюрант: покупка марок за границей, если хватает
  if(G.m%6===5&&sold>200)for(const c of Object.keys(COUNTRIES)){if(c===G.country||(G.bought&&G.bought[c]))continue;const C=brandCands(G,c)[0];if(C&&free()>brandPrice(G,c,C)){brandBuy(G,c,C.i);break;}}
  if((L.dumpN>0||whStock(G)>whCap(G)*0.8)&&!(G.whBuild||[]).length){const n=Math.max(5,Math.round(whCap(G)*0.6)),c=n*whUnitCost(G);if(free()>c)whOrder(G,n,true);}
  {const c=G.country,n=Math.min(dealerRoom(G,c),Math.round(dealerNeed(c,G))-dealerCount(G,c),Math.floor(Math.max(0,free())/dealerCost(G)/2));if(n>0)buyDealers(G,c,n);}
  if(G.m%6===3&&sold>60)Object.keys(COUNTRIES).forEach(c=>{if(c===G.country)return;if(impLv(G,c)<4&&free()>impCost(G,c,impLv(G,c)+1)*1.1)impUp(G,c);
    const n=Math.min(dealerRoom(G,c),Math.floor(Math.max(0,free())/dealerCost(G)/3));if(impLv(G,c)&&n>0)buyDealers(G,c,n);});
  if(G.rd.lvl<RD_MAX&&free()>rdUpCost(G)*2){G.cash-=rdUpCost(G);G.rd.lvl++;}
  if(!G.techBuild){const k=TECH_ORDER.find(k=>techOpen(G,k)&&free()>techCost(G,k));if(k){const c=techCost(G,k);G.cash-=c;G.plantVal+=c*0.7;G.techBuild={k,left:techMonths(G,k)};}}}
// выбор в событиях: пассивный, средний и жадный жмут первый вариант; сильный и «в долг» — как помощник
function pickChoice(ev){const K=ev.choices.map(c=>c[1]);if(BOT!=='strong'&&BOT!=='debt')return K[0];
  // заказ: только если цена покрывает себестоимость с запасом и есть деньги на выпуск
  if(K.includes('tskip')&&G.tenderNow){const o=G.tenderNow,md=G.models.find(m=>m.id===o.md),uc=md?unitCost(md,G):1e9,room=G.cash+Math.max(0,maxLoan(G)-G.loan)*0.5;
    if(o.bids[0]>=uc*1.12&&room>uc*o.n*0.6)return 'tbid0';if(o.bids[1]>=uc*1.12&&room>uc*o.n*0.6)return 'tbid1';return 'tskip';}
  // выставка: большой стенд — когда денег много, малый — когда хватает
  if(K.includes('show0')&&G.showNow){const sh=SHOWS.find(x=>x.id===G.showNow);if(!sh||NOEXP&&SHOW_HOST[sh.h].c!==G.country)return 'show0';const c2=standCost(sh,G,true),c1=standCost(sh,G,false);return G.cash>c2*12?'show2':G.cash>c1*8?'show1':'show0';}
  // вызов на гонку бот не примет (он не ездит), на продажи — если идёт впереди
  if(K.includes('chalNo')&&G.chal)return G.chal.type==='sales'?'chalYes':'chalNo';
  // «в долг» верит в рост: в спад цены не снижает, в крах скупает подешевевшее
  if(BOT==='debt'){const r=K.find(k=>/wSlumpWait$|wCrashRisk$/.test(k));if(r)return r;}
  return K[0];}
let fellY=0,wasBig=0;
for(let k=0;k<35*12;k++){
  let guard=0;while(G.pending.length&&guard++<50){const ev=G.pending[0];const ch=pickChoice(ev);if(process.env.EV)console.log('EV',dstr(G),'|',ev.title,'|',ev.choices.map(c=>c[1]).join(','),'→',ch);resolve(ch);}
  if(G.over)break;
  try{month();}catch(e){console.log('bot err',e&&e.stack);}
  const yB=G.y;const ok=step();if(!ok&&!G.pending.length)break;
  if(process.env.V==='3'&&G.last){const L=G.last,Y=globalThis.PL=globalThis.PL||{};const q=Y[yB]=Y[yB]||{};['rev','mat','wage','ovh','dlr','ad','sto','int','rd','tax','profit','sold','homeSold','turn','war','lic','tool'].forEach(k=>q[k]=(q[k]||0)+(L[k]||0));
    if(G.m===0){const f=v=>(v/1e6).toFixed(1),md=G.models.filter(m=>m.status==='prod').sort((a,b)=>(b.lastSold||0)-(a.lastSold||0))[0],o=G.resp&&G.resp[G.country];
      const um=G.models.filter(m=>m.status==='prod');console.log('   used',JSON.stringify(G.pfleet?Object.fromEntries(Object.entries(G.pfleet).map(([c,v])=>[c,Math.round(v/1000)+'k/'+Math.round(fleetOf(G,c)/1000)+'k'])):{}),um.map(m=>m.name+' '+segOf(m)+' pen '+usedPen(m,G.country,G).toFixed(3)+' nov '+novelty(m,G).toFixed(2)).join('; '));
      console.log(yB,'прод',Math.round(q.sold),'выр',f(q.rev),'мат',f(q.mat),'зп',f(q.wage),'накл',f(q.ovh),'дил',f(q.dlr),'рекл',f(q.ad),'тек',f(q.turn),'гар',f(q.war),'%',f(q.int),'КБ',f(q.rd),'нал',f(q.tax),'ПРИБ',f(q.profit),'| касса',f(G.cash),'стоим',f(companyValue(G)),md?'| '+segOf(md)+' $'+md.price+' c'+Math.round(unitCost(md,G))+' q'+classScore(md,G).toFixed(2)+' реп'+Math.round(G.rep):'',o?'| доля '+SEGK.filter(g=>o[g]&&o[g].sh>0.02).map(g=>g+' '+Math.round(o[g].sh*100)+'% −'+Math.round(o[g].cut*100)+'% +'+respBoost(G,G.country,g).toFixed(2)+' rv'+((G.rv&&G.rv[G.country]&&G.rv[G.country][g])||0).toFixed(2)).join(', '):'');}}
  if(process.env.V==='5'&&G.last&&G.y>=(+process.env.VY||1919)&&G.y<=(+process.env.VY||1919)+2){const L=G.last,f=v=>(v/1e6).toFixed(1);console.log(yB+'.'+G.m,'прод',L.sold,'ПРИБ',f(L.profit),'касса',f(G.cash),'кредит',f(G.loan),'лимит',f(maxLoan(G)),'отзыв',f(L.recall||0),'%',f(L.int),'предел долга',f(debtLimit(G)),'завод',f(G.plantVal),'склад',f(stockValue(G)),'кред',creditState(G).k,'cut',levCut(G,creditState(G)).toFixed(2));}
  if(process.env.V==='4'&&G.last&&G.y<(+process.env.VY||1903)){const L=G.last,f=v=>Math.round(v||0);console.log(yB+'.'+G.m,'прод',L.sold,'спрос',Math.round(L.demand||0),'выр',f(L.rev),'мат',f(L.mat),'зп',f(L.wage),'накл',f(L.ovh),'дил',f(L.dlr),'рекл',f(L.ad),'адм',f(L.adm),'КБ',f(L.rd),'%',f(L.int),'тек',f(L.turn),'гар',f(L.war),'ПРИБ',f(L.profit),'| касса',f(G.cash),'кред',G.loan,'раб',G.workers,'цех',G.cap,'склад',G.models.reduce((a,m)=>a+m.stock,0),'дил',JSON.stringify(G.dealers),'КБур',G.rd.lvl,'пр',rdActive(G).length);}
  if(G.last&&yB>=1928){const L=G.last;globalThis.SB=globalThis.SB||{};for(const c in L.mk){const x=L.mk[c];SB[c]=(SB[c]||0)+((x&&x.sold)||0);}globalThis.REV=(globalThis.REV||0)+(L.rev||0);globalThis.PRF=(globalThis.PRF||0)+(L.profit||0);}
  const v=companyValue(G);if(v>peakV){peakV=v;peakY=G.y;}
  if(BOT==='greedy'&&G.y>=1912&&v<peakV*0.5&&!fellY)fellY=G.y;
  if(process.env.VM&&G.m===0&&G.y>=+process.env.VM)G.models.filter(m=>m.status!=='off').forEach(m=>console.log('   MD',G.y,m.name,m.status,segOf(m),'$'+m.price,'uc',Math.round(unitCost(m,G)),'mat',Math.round(matCost(m,G)),'hrs',Math.round(hoursPerCar(m,G)),'vol',m.vol,'made',m.made,'sold',m.lastSold,'dem',m.lastDem,'ref',Math.round(refPrice(m,G)),'q',classScore(m,G).toFixed(2),'cx',complexity(m).toFixed(2),'parts',PART_KEYS.map(k=>m[k]).join(','),'launched',m.launched,'ramp',m.ramp));
  if(G.over){overY=G.y;break;}
  if(G.m===0&&(process.env.V==='2'||G.y%5===0)&&process.env.V)console.log(G.y,'стоимость',Math.round(v),'касса',Math.round(G.cash),'кредит',G.loan,'в пути',Math.round(arTotal(G)),'продано',G.peakLast,'место',legacyTable(G).place,'| цех',Math.round(capEff(G)),'стройка',(G.capBuild||[]).map(b=>b.units+'/'+b.left).join(','),'рабочих',G.workers,'| модели',G.models.filter(m=>m.status==='prod').map(m=>m.name+' '+segOf(m)+' $'+m.price+' c'+Math.round(unitCost(m,G))+' q'+classScore(m,G).toFixed(2)+' d'+Math.round(m.lastDem||0)).join('; '),'| дилеры',JSON.stringify(G.dealers),'имп',JSON.stringify(G.imp||{}),'| ответ',['people','middle'].map(g=>{const o=G.resp&&G.resp[G.country]&&G.resp[G.country][g];return o?g+' доля '+Math.round(o.sh*100)+'% скидка '+Math.round(o.cut*100)+'% модели +'+respBoost(G,G.country,g).toFixed(2):'';}).join(' '));
}
let guard=0;while(G.pending.length&&guard++<50){const ev=G.pending[0];if(ev.choices[0][1]==='final'||ev.choices[0][1]==='restart')break;resolve(ev.choices[0][1]);}
const bankrupt=!!G.over&&G.cash<-debtLimit(G)*0.999||(G.over&&G.y<1930);
const t=legacyTable(G);
console.log(JSON.stringify({bot:BOT,c:CC,seed:${seed},value:Math.round(companyValue(G)),cash:Math.round(G.cash),loan:G.loan,place:t.place,legacy:Math.round(t.me.total),over:bankrupt,overY:bankrupt?overY:0,peakV:Math.round(peakV),peakY,fell:fellY,sold:totalSold(G),best:G.peak.year||0,y:G.y,L:Object.fromEntries(['scale','market','innov','sport','capital','brand'].map(k=>[k,Math.round(t.me[k])])),firsts:Object.keys(G.firsts||{}).length,sb:globalThis.SB?Object.fromEntries(Object.entries(SB).map(([c,v])=>[c,Math.round(v/2)])):null,rev:Math.round((globalThis.REV||0)/2e6),prf:Math.round((globalThis.PRF||0)/2e6),above:t.rows.slice(Math.max(0,t.place-3),t.place+2).map(r=>r.n+' '+Math.round(r.L.total)).join('; ')}));
`);
