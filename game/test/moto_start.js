// 0.32: «Мотомастерская» — путь к первому автомобилю (ТЗ: 5–8 игровых лет, боты, 10 зёрен).
// Бот играет как разумный человек: цена по прибыли, новые мотоциклы, КБ без простоя, мотоцех и дилеры по спросу,
// автомобильный цех — как только можно, первая машина — сразу.   node game/test/moto_start.js [страны] [зёрен на страну] [сложность]
const A=process.argv.slice(2),CS=(A[0]||'fr,de,uk,us,it').split(','),N=+(A[1]||2),DIFF=A[2]||'normal';
const res=[];
for(const c of CS)for(let k=0;k<N;k++){
  require('./harness.js')(`
Math.random=(()=>{let a=${(k+1)*7919+c.charCodeAt(0)*31}%2147483647||1;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
newMotoGame('custom','${c}','Мото','${DIFF}','М1');const s=G;let firstCar=0,shopY=0,bank=0,peak=0;
for(let i=0;i<14*12&&!s.over;i++){let g=0;while(s.pending.length&&g++<50){const ev=s.pending[0],K=(ev.choices||[]).map(x=>x[1]);resolve(K.includes('tskip')?'tskip':K.includes('qRecall')?'qRecall':K.find(x=>!/^reel:/.test(x))||'ok');}
  const act=s.models.filter(m=>m.status==='prod'),L=s.last;
  // разумный хозяин мастерской копит на автомобильный цех: новый мотоцикл — когда старый уступает соперникам,
  // КБ — один проект, пока есть прибыль; мотоцех — когда он два месяца подряд не успевает; дилеры — если лавки не справляются
  const kinds=['moto'].concat(s.y>=1908?['moside']:[]),prof=L&&s.hist.profit.slice(-3).reduce((a,b)=>a+b,0)>0;
  if(lineOn(s,'moto'))for(const kind of kinds){if(s.models.some(m=>m.status==='dev'&&rivalKind(m)===kind))continue;const cur=act.filter(m=>rivalKind(m)===kind).sort((a,b)=>b.id-a.id)[0],age=cur?mi(s)-(cur.launched||0):999;
    if(cur&&age<24)continue;if(cur&&classScore(cur,s)>=0.98&&age<54)continue;
    const md=autoDesign(kind,s),dc=devCost(md,s);if(s.cash<dc*1.5)continue;if(cur&&!(classScore(md,s)>classScore(cur,s)*1.04))continue;
    s.cash-=dc;const m={...md,id:s.nextId++,name:'М'+s.nextId,paint:'#5a1f1f',plan:'auto',status:'dev',devLeft:devMonths(md),launched:0,stock:0,backlog:0,lastDem:0,lastSold:0,lastMade:0,totalSold:0,made:0,fc:0};m.price=Math.round(refPrice(m,s)/10)*10;s.models.push(m);
    if(cur)cur._retire=mi(s)+devMonths(md)+2;break;}
  act.forEach(m=>{if(m._retire&&mi(s)>=m._retire){m.status='sale';m.price=Math.round(m.price*0.8/10)*10;}});
  // первая машина: как только строится автомобильный цех
  if((lineOn(s,'car')||s.carShopB)&&!s.models.some(m=>!isMoto(m)&&m.status!=='off')){const kind=s.y>=1906?'people':'middle',md=autoDesign(kind,s),dc=devCost(md,s);
    if(s.cash>dc*1.2){s.cash-=dc;const m={...md,id:s.nextId++,name:'Авто',paint:'#22303a',plan:'auto',status:'dev',devLeft:devMonths(md),launched:0,stock:0,backlog:0,lastDem:0,lastSold:0,lastMade:0,totalSold:0,made:0,fc:0};m.price=Math.round(refPrice(m,s)/10)*10;s.models.push(m);}}
  if(s.m%2===0)act.forEach(m=>{if(m.status!=='prod')return;const bp=bestPriceFor(m,s);if(bp.price)m.price=bp.price;});
  if(prof&&rdActive(s).length<1){const pj=suggestProject(s);if(pj&&s.cash>rdCost(pj,s)*5)rdBegin(s,pj);}
  if(prof&&s.rd.lvl<CARSHOP.kb&&s.cash>rdUpCost(s)*2.5){s.cash-=rdUpCost(s);s.rd.lvl++;}
  if(carShopCan(s)){carShopStart(s);shopY=s.y;}
  {const lost=act.reduce((a,m)=>a+(isMoto(m)?m.lostS||0:0),0),sold=act.reduce((a,m)=>a+(isMoto(m)?m.lastSold||0:0),0);s._lc=lost>Math.max(1,sold*0.1)?(s._lc||0)+1:0;
    if(prof&&s._lc>=2&&lineOn(s,'moto')&&!(s.mcapBuild||[]).length){const n=Math.max(0.5,(s.mcap||1)*0.5);if(s.cash>n*capUnitCost(s)*3){mcapOrder(s,n,true);s._lc=0;}}}
  if(L&&!(s.whBuild||[]).length&&whStock(s)>whCap(s)*0.8&&s.cash>whUnitCost(s)*10)whOrder(s,Math.max(5,Math.round(whCap(s)*0.5)),true);
  {const lost=L&&(L.mk[s.country]||{}).lostDlr||0;if(lost>0.5){const n=dealersShort(s,s.country);if(n>0&&s.cash>n*dealerCost(s)*3)buyDealers(s,s.country,n);}}
  // дома мотоциклов совсем мало — импортёр во Франции, главном рынке мотоциклов
  if(act.length&&s.country!=='fr'&&!impLv(s,'fr')&&s.cash>impCost(s,'fr',1)*4&&((s.last&&s.last.mk[s.country]&&s.last.mk[s.country].msize)||0)<150)impUp(s,'fr');
  if(L)s.ad=Math.round(Math.min(adRef(s)*0.5,Math.max(0,(L.rev||0)*0.02)));
  const c0=s.cash-s.loan;step();if(process.env.V3){const L2=s.last;global.__acc=global.__acc||{p:0,d:0,dev:0};global.__acc.p+=L2.profit;global.__acc.d+=(s.cash-s.loan)-c0;if(s.m===0){const A=global.__acc;console.log('   year',s.y-1,'profit',Math.round(A.p),'net cash change',Math.round(A.d),'other spend',Math.round(A.p-A.d),'rd lvl',s.rd.lvl,'projs',rdActive(s).map(p=>p.name).join('|'),'mcap',s.mcap,'dealers',dealerCount(s,s.country),'imp fr',impLv(s,'fr'));global.__acc={p:0,d:0};}}
  if(!firstCar&&s.models.some(m=>!isMoto(m)&&m.status==='prod'))firstCar=yf(s);
  peak=Math.max(peak,(s.last&&s.last.msold)||0);if(process.env.V2&&s.m===6){const c=s.country;s.models.filter(m=>m.status==='prod'&&isMoto(m)).forEach(md=>{const g=segOf(md),q=mq(md,s,c),P=offerPrice(md,c,s),fair=prefP(g,c,s),ex=modelExtras(md,c,s),bk=brandK(c,g,s),k=kappa(c,g,s),ct=contest(s,c,g);
  const parts={fame:fameCap(repEffect(s)+adEffect(s,c)+showEffect(s,c)+raceEffect(md,s)+duelEffect(s,c)),aw:awU(s,c),nov:novelty(md,s)};
  console.log('  DUMP',s.y,g,md.name,'S',classScore(md,s,c).toFixed(2),'qual',(AQ*Math.log(q/QG[g])).toFixed(2),'price',(-BR*Math.log(P/fair)).toFixed(2),'P/fair',(P/fair).toFixed(2),'extras',ex.toFixed(2),JSON.stringify(parts),'bk-k',(bk-k).toFixed(2),'ct',ct.toFixed(2),'reach',reachOf(s,c).toFixed(2),'bike',bikeReach(s,c).toFixed(2),'share',((s.last.mk[c].msegs[g].you||0)/Math.max(1,s.last.mk[c].msegs[g].size)*100).toFixed(1)+'%');});}
  if(process.env.V&&s.m===0){const L=s.last;console.log(s.y-1,'cash',Math.round(s.cash),'loan',s.loan,'msold',L.msold,'mmade',L.mmade,'rev',Math.round(L.rev),'mat',Math.round(L.mat),'wage',Math.round(L.wage),'ovh',Math.round(L.ovh),'dlr',Math.round(L.dlr),'ad',Math.round(L.ad),'rd',Math.round(L.rd),'adm',Math.round(L.adm||0),'war',Math.round(L.war),'tool',Math.round(L.tool||0),'profit',Math.round(L.profit),'w',s.workers,'models',s.models.filter(m=>m.status==='prod').map(m=>m.name+':'+m.price+'/'+Math.round(unitCost(m,s))+':'+(m.lastSold||0)+':st'+m.stock).join(' '),'wh',whCap(s));}if(firstCar&&s.y>=Math.floor(firstCar)+1)break;}
global.__r={c:'${c}',k:${k},first:firstCar?+(firstCar-motoStartY('${c}')).toFixed(1):null,shopY,made:motoMade(s),cash:Math.round(s.cash),kb:s.rd.lvl,peak,over:s.over};
`);
  const r=global.__r;res.push(r);console.log(`${r.c} #${r.k}: первая машина через ${r.first??'—'} лет (цех заложен ${r.shopY||'—'}), мотоциклов ${r.made}, касса $${r.cash}, КБ ${r.kb}, пик ${r.peak}/мес${r.over?' БАНКРОТ':''}`);}
const ok=res.filter(r=>r.first!=null&&r.first>=5&&r.first<=8.99).length;
console.log(`в коридоре 5–8 лет: ${ok} из ${res.length}`);if(ok<res.length*0.8)process.exitCode=1;
