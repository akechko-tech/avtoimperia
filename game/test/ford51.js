// ТЗ 0.51, этап 1: диагноз ранней победы. Бот-игрок «стилем автора» — много гонок, КБ с опережением истории, частые новые модели
// с новейшими деталями, технологии завода сразу, дешёвые качественные машины; рутину (цены, цеха, дилеры, экспорт) ведёт помощник.
// Живые соперники включены, победа считается по правилам игры (16-world.js: domCheck).
//   node game/test/ford51.js <стиль> <сложность> <зерно> [первопроходец=ford] [страна=us]   → помесячная партия, раз в год строка, в конце JSON
//   node game/test/ford51.js all [зёрен=3] [потоков=3] [стили=ford,helper] [сложности=normal,hist]
// Стили: helper — только помощник и новая модель раз в 4 года (прежний «сильный» бот); ford — стиль автора; ford-norace — то же без гонок;
//        ford-nord — то же без опережающего КБ; ford-low — стиль автора и цена на 10 % ниже выгодной (составные: ford-norace-low).
// Окружение: NOBOTS=1 — без живых соперников; END=1913 — остановиться в этом году; SWITCH=1906:hist — сменить сложность с этого года;
//            TIME=1 — строка на каждую гонку (время расчёта, место, шанс по прикидке менеджера); DBG=1900 — помесячно до этого года.
const {spawn}=require('child_process');
const A=process.argv.slice(2);
if(A[0]==='all'){
  const seeds=+(A[1]||3),par=+(A[2]||3),styles=(A[3]||'ford,helper').split(','),diffs=(A[4]||'normal,hist').split(','),pio=A[5]||'ford',cc=A[6]||'us';
  const jobs=[];styles.forEach(st=>diffs.forEach(d=>{for(let i=0;i<seeds;i++)jobs.push([st,d,String(11+i*7),pio,cc]);}));
  const out=[];let run=0,done=0;const t0=Date.now();
  const next=()=>{if(!jobs.length)return;const j=jobs.shift();run++;const p=spawn(process.execPath,[__filename,...j],{env:{...process.env,QUIET:'1'}});let buf='';p.stdout.on('data',d=>buf+=d);p.stderr.on('data',d=>buf+=d);
    p.on('close',()=>{run--;done++;const L=buf.trim().split('\n').filter(l=>l.startsWith('{')).pop();let r=null;try{r=JSON.parse(L);}catch(e){r={style:j[0],diff:j[1],seed:j[2],err:buf.slice(-400)};}
      out.push(r);process.stderr.write(`${done}/${done+jobs.length+run} ${j.join(' ')} → ${r.err?'ОШИБКА '+r.err:(r.win?'победа '+r.win.y+'.'+(r.win.m+1)+' ('+r.win.ks.join('+')+')':r.lost?'победил '+r.lost.n+' '+r.lost.y:'без победы')} (${Math.round((Date.now()-t0)/1000)} с)\n`);
      if(jobs.length)next();else if(!run)report(out);});};
  for(let i=0;i<par;i++)next();
  function report(L){console.log('\nстиль        сложн.  зерно  победа            по отдельности: масштаб рынок спорт инновации капитал бренд   касса/выручка 1915  доля дома 1915  побед/стартов');
    L.sort((a,b)=>(a.style+a.diff+a.seed).localeCompare(b.style+b.diff+b.seed)).forEach(r=>{if(r.err){console.log(r.style,r.diff,r.seed,'ОШИБКА',r.err);return;}
      const f=k=>String(r.first[k]||'—').padEnd(7);
      console.log(r.style.padEnd(12),r.diff.padEnd(7),String(r.seed).padEnd(6),(r.win?r.win.y+'.'+String(r.win.m+1).padStart(2,'0')+' '+r.win.ks.join('+'):r.lost?'бот '+r.lost.n+' '+r.lost.y:'нет').padEnd(34),f('scale'),f('market'),f('sport'),f('innov'),f('capital'),f('brand'),
        String(r.cashRev1915).padEnd(19),String(r.share1915).padEnd(15),r.wins+'/'+r.starts);});
    console.log(JSON.stringify(L));}
  return;
}
const style=A[0]||'ford',diff=A[1]||'normal',seed=+(A[2]||11),pio=A[3]||'ford',country=A[4]||'us';
require('./harness.js')(`
BOTS_OFF=!!process.env.NOBOTS;   // NOBOTS=1 — без живых соперников (сравнение: что они отнимают)
Math.random=(()=>{let a=${seed}*7919%2147483647||1;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
const STYLE=${JSON.stringify(style)},CC=${JSON.stringify(country)},QUIET=!!process.env.QUIET;
const FORD=/^ford/.test(STYLE),RACE=FORD&&!/norace/.test(STYLE),RDX=FORD&&!/nord/.test(STYLE),LOW=/low/.test(STYLE);
newGame(${JSON.stringify(pio)},CC,'','${diff}','Первая');
G.helper={on:1};
let lastDesign=0,starts=0,wins=0,majors=0,spentRace=0;const first={},firstDom={},yr={};
const cls=()=>CC==='us'?(G.y>=1903?'people':'middle'):(G.y>=1912?'people':'middle');
function pAvg(){const pr=G.hist.profit.slice(-12);return pr.length>=6?pr.reduce((a,b)=>a+b,0)/pr.length:0;}
function reserve(){const L=G.last;return Math.max(3000*cpi(G),L?((L.wage||0)+(L.ovh||0)+(L.dlr||0)+(L.ad||0)+(L.rd||0)+(L.int||0))*2:0);}
function free(){return G.cash-reserve();}
// новая модель: сборка по образцу эпохи, затем — стиль автора: всё новейшее, что дало КБ раньше истории, если рама выдержит и оценка не падает
function newModel(kind){let md=autoDesign(kind,G);
  if(RDX)['e','g','c','k','w'].forEach(k=>{const arr=PART_CATS.find(c=>c.k===k).arr().filter(x=>!x.moto&&x.y>G.y&&G.rd.early.includes(x.id)).sort((a,b)=>b.y-a.y);
    for(const x of arr){const t={...md,[k]:x.id};if(overpower(t))continue;let a=0,b=0;try{a=classScore(md,G);b=classScore(t,G);}catch(_){}if(b>=a*0.97){md=t;break;}}});
  const dc=devCost(md,G);if(G.cash<dc*1.3&&loanOpen(G)){const n=Math.min(Math.max(0,maxLoan(G)-G.loan),Math.ceil((dc*1.5-G.cash)/1000)*1000);if(n>0){G.loan+=n;G.cash+=n;}}
  if(G.cash<dc*1.3)return null;G.cash-=dc;
  const m={...md,id:G.nextId++,name:'Модель '+G.nextId,paint:'#333',plan:'auto',status:'dev',devLeft:devMonths(md),launched:0,stock:0,backlog:0,lastDem:0,lastSold:0,lastMade:0,totalSold:0,made:0,fc:0};
  m.price=Math.round(refPrice(m,G)/10)*10;G.models.push(m);lastDesign=mi(G);return m;}
// гоночная машина стилем автора: лучшая рама, самый сильный мотор, который она выдержит (и прототипы КБ), лучшие шины, тормоза, коробка, спортивный кузов
let lastRaceCar=-99;
function raceDesign(){let md=autoDesign('sport',G);const U=k=>unlockedP(PART_CATS.find(c=>c.k===k).arr(),G,false),rk=t=>{try{return rankOf(t,2,G.y);}catch(_){return 0;}};
  const cs=U('c').slice().sort((a,b)=>chassisMax(b,md)-chassisMax(a,md))[0];if(cs)md={...md,c:cs.id};
  const es=U('e').filter(e=>!overpower({...md,e:e.id})).sort((a,b)=>b.hp-a.hp)[0];if(es)md={...md,e:es.id};
  ['w','k','g','b'].forEach(k=>{let best=md,bv=rk(md);U(k).forEach(x=>{if(k==='b'&&!kindBodyOk('sport',x))return;const t={...md,[k]:x.id};if(overpower(t))return;const v=rk(t);if(v>bv*1.002){bv=v;best=t;}});md=best;});
  return md;}
function raceCarMonth(){if(pAvg()<=0||G.models.some(m=>m.status==='dev'))return;const cur=G.models.filter(m=>m.racer&&m.status==='prod').sort((a,b)=>b.id-a.id)[0];
  if(cur&&mi(G)-lastRaceCar<18)return;let md=null;try{md=raceDesign();}catch(e){if(!QUIET)console.log('raceDesign',e.message);return;}
  if(cur){let a=0,b=0;try{a=rankOf(cur,2,G.y);b=rankOf(md,2,G.y);}catch(_){}if(b<a*1.04)return;}
  const dc=devCost(md,G);if(free()<dc*2.5)return;G.cash-=dc;
  const m={...md,id:G.nextId++,name:'Гоночная '+G.nextId,paint:'#a00',plan:'auto',status:'dev',devLeft:devMonths(md),launched:0,stock:0,backlog:0,lastDem:0,lastSold:0,lastMade:0,totalSold:0,made:0,fc:0,racer:1};
  m.price=Math.round(refPrice(m,G)/10)*10;G.models.push(m);lastRaceCar=mi(G);if(cur){cur.status='off';cur.stock=0;}}
function retireOld(){G.models.filter(m=>m.status==='prod'&&!m.from&&!m.racer).forEach(m=>{const newer=G.models.some(x=>x.status==='prod'&&!x.from&&!x.racer&&x.id>m.id&&mi(G)-x.launched>=4);if(newer){m.status='off';G.cash+=m.stock*m.price*0.6;m.stock=0;}});}
// КБ стилем автора: бюро растёт, пока хватает денег; все места заняты; сначала — прототипы будущих деталей, потом улучшения своих
function labMonth(){
  const pa=pAvg();if(pa<=0)return;   // пока завод не кормит себя — как помощник: без опережающих трат
  if(G.rd.lvl<RD_MAX&&pa>rdUpkeep(G)*1.65*1.5&&free()>rdUpCost(G)*1.5){G.cash-=rdUpCost(G);G.rd.lvl++;}
  let guard=0;while(rdActive(G).length<rdSlots(G)&&guard++<8){const P=rdProjects(G),early=P.filter(p=>p.kind==='early'&&!p.moto).sort((a,b)=>({e:0,g:1,c:2,k:3,w:4,b:5}[a.ck]??9)-({e:0,g:1,c:2,k:3,w:4,b:5}[b.ck]??9));
    const pj=early[0]||P.find(p=>p.kind==='eq')||suggestProject(G);if(!pj)break;if(free()<rdCost(pj,G)*1.2||!rdBegin(G,pj))break;}
  KIT.kb.forEach(k=>{if(!kitHas(G,k.id)&&k.y<=G.y&&!kitNeed(G,k)&&free()>kitCost(G,k)*2)kitBuy(G,k.id);});
  if(!G.techBuild){const k=TECH_ORDER.find(k=>techOpen(G,k)&&free()>techCost(G,k)*1.2);if(k){const c=techCost(G,k);G.cash-=c;G.plantVal+=c*0.7;G.techBuild={k,left:techMonths(G,k)};}}}
// гонки стилем автора: все открытые гонки — «Участвовать» (менеджер команды сам берёт состав), лучшие пилоты по контракту, гоночный отдел и оснащение
function raceMonth(){
  const pa=pAvg();
  try{while((G.drivers||[]).length<3){const d=availDrivers(G).sort((a,b)=>b.sk-a.sk)[0];if(!d||free()<driverFee(d,G)*3||pa<(driverPayroll(G)+driverSalary(d,G))*6)break;const n=G.drivers.length;RACE_ACT.hire({k:d.id});if(G.drivers.length===n)break;}}catch(e){if(!QUIET)console.log('hire',e.message);}
  try{if(RDEPT[(G.rdept||0)+1]&&free()>rdeptCost(G)*2&&pa*12>rdeptCost(G)*1.5)RACE_ACT.rdeptUp();}catch(e){}
  try{(KIT.team||[]).forEach(k=>{if(!kitHas(G,k.id)&&k.y<=G.y&&!kitNeed(G,k)&&free()>kitCost(G,k)*2)kitBuy(G,k.id);});}catch(e){}
  RACES.forEach(rc=>{if(!raceOpen(rc,G)||G.raceDone[rc.key]!==undefined||G.pending.length)return;let open=false;try{open=raceStatus(rc,G)[2];}catch(_){}
    if(!open)return;let M=null;try{M=managerPlan(G,rc);}catch(_){}if(!M||!M.entries.length)return;if(M.cost>Math.max(free()*0.3,G.cash*0.08))return;if(!(M.O.win>=0.12||(rc.major&&M.O.win>=0.05)||(M.O.win+M.O.p2+M.O.p3>=0.45)))return;const c0=G.cash,tq=Date.now();try{RACE_ACT.raceQuick({k:rc.key});}catch(e){if(!QUIET)console.log('race err',rc.key,e.message);R=null;return;}
    if(process.env.TIME)console.log('  гонка',rc.key,rc.t,rc.km+'км',Date.now()-tq,'мс, место',G.raceDone[rc.key],'шанс',Math.round(M.O.win*100)+'%','машин',M.entries.length,'цена',M.cost);
    const d=G.raceDone[rc.key];if(d!==undefined){starts++;spentRace+=Math.max(0,c0-G.cash);if(d===1){wins++;if(rc.major)majors++;}}
    let g=0;while(G.pending.length&&g++<20)resolve(pickChoice(G.pending[0]));});}
function month(){const act=G.models.filter(m=>m.status==='prod'),dev=G.models.filter(m=>m.status==='dev');
  const gap=FORD&&pAvg()>0?36:48;if(!dev.length&&mi(G)-lastDesign>=gap&&mi(G)>=6)newModel(cls());retireOld();
  if(RDX)labMonth();if(RACE){raceCarMonth();raceMonth();}
  if(LOW&&G.m%3===1)act.forEach(m=>{const bp=bestPriceFor(m,G).price||m.price,uc=unitCost(m,G);m.price=Math.round(Math.max(uc*1.12/(1-DEALER_MARGIN),bp*0.9)/10)*10;});}
function pickChoice(ev){const K=ev.choices.map(c=>c[1]);
  if(K.includes('domScreen'))return 'ok';
  if(K.some(k=>/^ma:/.test(k)))return K.find(k=>/^ma:\\w+:N|^ma:aucSkip|^ok$/.test(k))||K[K.length-1];
  if(K.includes('dxSim'))return 'dxSim';
  if(K.includes('ru:emig'))return 'ru:emig';if(K.some(k=>/^ru:to:/.test(k)))return 'ru:to:fr';
  if(K.includes('tskip')&&G.tenderNow){const o=G.tenderNow,md=G.models.find(m=>m.id===o.md),uc=md?unitCost(md,G):1e9,room=G.cash+Math.max(0,maxLoan(G)-G.loan)*0.5;
    if(o.bids[0]>=uc*1.12&&room>uc*o.n*0.6)return 'tbid0';if(o.bids[1]>=uc*1.12&&room>uc*o.n*0.6)return 'tbid1';return 'tskip';}
  if(K.includes('show0')&&G.showNow){const sh=SHOWS.find(x=>x.id===G.showNow);if(!sh)return 'show0';const c2=standCost(sh,G,true),c1=standCost(sh,G,false);return G.cash>c2*12?'show2':G.cash>c1*8?'show1':'show0';}
  if(K.includes('chalNo')&&G.chal)return G.chal.type==='sales'||G.chal.type==='trial'?'chalYes':'chalNo';
  return K[0];}
function snap(){const T=domTable(G);if(!T)return null;const o={};DOM_K.forEach(k=>{const t=T[k];o[k]={sh:Math.round(t.share*1000)/10,hist:t.hist?Math.round(t.mine/t.hist.v*1000)/10:null,dom:t.domOk?1:0,ok:t.ok?1:0,mine:t.mine,world:t.world,ripe:t.ripe?1:0,lead:t.lead?t.lead.n:''};
    if(t.ok&&!first[k])first[k]=G.y;if(t.domOk&&!firstDom[k])firstDom[k]=G.y;});return o;}
let cashRev1915=null,share1915=null,winAt=null,lostAt=null;const yrS={sold:0,size:0};
const ENDY=+process.env.END||1931,SW=process.env.SWITCH?process.env.SWITCH.split(':'):null;
for(let k=0;k<35*12+6&&G.y<ENDY;k++){
  let guard=0;while(G.pending.length&&guard++<50){const ev=G.pending[0];if(ev.choices[0][1]==='final'||ev.choices[0][1]==='restart')break;resolve(pickChoice(ev));}
  if(G.over)break;
  if(SW&&G.y>=+SW[0]&&G.diff!==SW[1]){G.diff=SW[1];if(!QUIET)console.log('--- сложность с',G.y,'года:',DIFFS[SW[1]].name);}   // SWITCH=1906:hist — начало на выбранной сложности, дальше — на другой (бот не переживает начало «Историка»)
  try{month();}catch(e){if(!QUIET)console.log('bot err',e&&e.stack);}
  const ok=step();if(!ok&&!G.pending.length)break;
  const S=snap();{const mk=G.last&&G.last.mk&&G.last.mk[G.country];if(mk){yrS.sold+=mk.sold||0;yrS.size+=mk.size||0;}}
  if(process.env.DBG&&G.y<=+process.env.DBG&&G.last){const L=G.last;console.log(dstr(G),'касса',Math.round(G.cash),'кредит',G.loan,'приб',Math.round(L.profit||0),'прод',L.sold,'выр',Math.round(L.rev||0),'КБ',Math.round(L.rd||0),'ком',Math.round(L.team||0),'пил',Math.round(L.drv||0),'модели',G.models.map(m=>m.status[0]+m.id+'$'+m.price).join(','),'проекты',rdActive(G).map(p=>p.kind+':'+p.id).join(','));}
  if(G.dom&&!winAt){winAt={y:G.dom.y,m:G.dom.m,ks:G.dom.ks||[G.dom.k]};if(!QUIET)console.log('*** ПОБЕДА',dstr(G),winAt.ks.join('+'),JSON.stringify(S));}
  if(G.domLost&&!lostAt){lostAt={y:G.domLost.y,n:G.domLost.n,ks:G.domLost.ks};if(!QUIET)console.log('*** победил соперник',dstr(G),JSON.stringify(lostAt));}
  if(G.m===0&&S){const L=G.last||{},rev12=(G.world&&G.world.my&&G.world.my.r12)||0;yrS.sold+=0;const hs=yrS.size>0?yrS.sold/yrS.size:0;yrS.sold=0;yrS.size=0;
    if(G.y===1916){cashRev1915=Math.round(G.cash/Math.max(1,rev12)*100)/100;share1915=Math.round(hs*1000)/10;}
    yr[G.y-1]={cash:Math.round(G.cash),rev12:Math.round(rev12),val:Math.round(companyValue(G)),share:Math.round(hs*1000)/10,rd:G.rd.lvl,firsts:firstsLive(G),sport:S.sport.mine,wins,starts,S};
    if(!QUIET)console.log(G.y-1,'касса',(G.cash/1e6).toFixed(2),'выр12',(rev12/1e6).toFixed(2),'доля',Math.round(hs*100)+'%','КБ',G.rd.lvl,'гонки',wins+'/'+starts,'|',DOM_K.map(k=>k.slice(0,3)+' '+S[k].sh+'%/'+(S[k].hist===null?'—':S[k].hist+'%')+(S[k].ok?'✔':S[k].dom?'·':'')).join('  '));}
  if(G.over)break;
}
console.log(JSON.stringify({style:STYLE,diff:'${diff}',seed:${seed},pio:${JSON.stringify(pio)},win:winAt,lost:lostAt,first,firstDom,cashRev1915,share1915,wins,majors,starts,spentRace:Math.round(spentRace),endY:G.y,over:!!G.over&&G.y<1930,value:Math.round(companyValue(G)),cash:Math.round(G.cash),rd:G.rd.lvl,firsts:firstsLive(G),yr}));
`);
