// 0.32: бот «мастер» — играет как сильный человек: лучшая машина в каждом классе, цена по прибыли, КБ и технологии без простоя,
// цеха и дилеры по спросу, экспорт во все страны, гоночная слава (победы и титулы), по желанию — покупка марок.
// node game/test/pro32.js [сложность=hist] [страна=it] [пионер=custom] [год_конца=1930] [сделки=0|1] [гонки=1|0] [зерно=7] [тихо=0|1]
// node game/test/pro32.js all [сложности=kids,easy,normal,hard,hist] [страны=it,us,fr] [потоков=2] [сделки=0|1]  → матрица
const {spawn}=require('child_process');
const A=process.argv.slice(2);
if(A[0]==='all'){
  const D=(A[1]||'easy,normal,hard,hist').split(','),C=(A[2]||'it,us,fr').split(','),par=+(A[3]||2),deals=A[4]||'0',races=A[5]||'1';
  const jobs=[];D.forEach(d=>C.forEach(c=>jobs.push([d,c,'custom','1930',deals,races,'7','1'])));const out=[];let run=0;const t0=Date.now();
  const next=()=>{if(!jobs.length)return;const j=jobs.shift();run++;const p=spawn(process.execPath,[__filename,...j]);let buf='';p.stdout.on('data',d=>buf+=d);p.stderr.on('data',d=>buf+=d);
    p.on('close',()=>{run--;const L=buf.trim().split('\n').filter(l=>l.startsWith('{')).pop();let r=null;try{r=JSON.parse(L);}catch(e){r={diff:j[0],c:j[1],err:buf.slice(-400)};}out.push(r);
      process.stderr.write(`${j[0]} ${j[1]} → ${r.err?'ОШИБКА '+r.err:'место '+r.place+' очков '+r.total+' стоимость $'+fmt(r.value)+(r.over?' банкрот '+r.overY:'')+' | 1-е место с '+(r.first||'—')} (${Math.round((Date.now()-t0)/1000)} с)\n`);
      if(jobs.length)next();else if(!run)report(out);});};
  for(let i=0;i<par;i++)next();
  function fmt(v){return Math.abs(v)>=1e9?(v/1e9).toFixed(2)+' млрд':Math.abs(v)>=1e6?(v/1e6).toFixed(1)+' млн':Math.round(v/1e3)+' тыс';}
  function report(L){console.log('\nсложность страна  место очков  стоимость     лучший год  1-е место с   масштаб рынок иннов спорт капитал бренд');
    L.sort((a,b)=>D.indexOf(a.diff)-D.indexOf(b.diff)||C.indexOf(a.c)-C.indexOf(b.c)).forEach(r=>{if(r.err){console.log(r.diff,r.c,'ОШИБКА');return;}const P=r.parts||{};
      console.log(r.diff.padEnd(9),r.c.padEnd(7),String(r.place).padEnd(6),String(r.total).padEnd(6),('$'+fmt(r.value)).padEnd(14),String(r.peak).padEnd(11),String(r.first||'—').padEnd(13),
        ['scale','market','innov','sport','capital','brand'].map(k=>String(Math.round(P[k]||0)).padEnd(7)).join(''),r.over?'банкрот '+r.overY:'');});}
  return;
}
const DIFF=A[0]||'hist',CC=A[1]||'it',PION=A[2]||'custom',Y1=+(A[3]||1930),DEALS=+(A[4]||0),RACES=+(A[5]??1),SEED=+(A[6]||7),QUIET=+(A[7]||0);
require('./harness.js')(`
Math.random=(()=>{let a=${SEED}*7919%2147483647||1;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
setupRender=()=>{};setupRaceUI=()=>{};auRaceStart=()=>{};auSfx=()=>{};
if(process.env.DIFFX)Object.assign(DIFFS[${JSON.stringify(DIFF)}],JSON.parse(process.env.DIFFX));
newGame(${JSON.stringify(PION)},${JSON.stringify(CC)},'Мастер',${JSON.stringify(DIFF)},'Первая');
const s=G,DEALS=${DEALS},RACING=${RACES},QUIET=${QUIET};
const MOTO=+(process.env.MOTO||0);
// FRUGAL=1 — бережливый старт в Америке: до 1900 года без проектов КБ, технологий и лишних дилеров; дешёвая машина — с 1899 года
const FRUGAL=+(process.env.FRUGAL||0);
const CLS=()=>{const L=['middle'];if(s.y>=(FRUGAL&&s.country==='us'?1899:1902))L.unshift('people');if(s.y>=1906)L.push('lux');if(sportOpen(s)&&s.y>=1908)L.push('sport');if(s.y>=1912)L.push('van');if(MOTO&&lineOn(s,'moto')){L.push('moto');if(s.y>=1906)L.push('moside');}return L;};
const last={};let firstY=0,overY=0;
function kindOf(m){const k=rivalKind(m);return k==='truck'?'van':k;}
function pickEv(ev){if(!ev.choices||!ev.choices.length)return ev.saga?"saga":"ok";const K=ev.choices.map(c=>c[1]);
  if(K.some(k=>/^ma:/.test(k)))return K.find(k=>/^ma:\\w+:N|^ma:aucSkip|^ok$/.test(k))||K[K.length-1];
  if(K.includes('dxSim'))return 'dxSim';if(K.includes('chalNo')&&s.chal)return s.chal.type==='sales'||s.chal.type==='trial'?'chalYes':'chalNo';
  if(K.includes('tskip')&&s.tenderNow){const o=s.tenderNow,md=s.models.find(m=>m.id===o.md),uc=md?unitCost(md,s):1e9;if(o.bids[0]>=uc*1.15&&s.cash>uc*o.n*0.5)return 'tbid0';return 'tskip';}
  if(K.includes('show0')&&s.showNow){const sh=SHOWS.find(x=>x.id===s.showNow);if(!sh)return 'show0';const c2=standCost(sh,s,true),c1=standCost(sh,s,false);return s.cash>c2*10?'show2':s.cash>c1*6?'show1':'show0';}
  if(K.includes('qRecall'))return 'qRecall';
  return K[0];}
function month(){const act=s.models.filter(m=>m.status==='prod'),dev=s.models.filter(m=>m.status==='dev'),L=s.last;
  // новые модели: по классам эпохи, раз в 3 года или когда новая конструкция заметно лучше
  for(const kind of CLS()){if(dev.some(m=>kindOf(m)===kind))continue;const cur=act.filter(m=>kindOf(m)===kind).sort((a,b)=>b.id-a.id)[0];
    const age=cur?mi(s)-(cur.launched||0):999;if(cur&&age<30)continue;
    // запас — как у разумного хозяина: на обновление устаревшей модели (её почти не берут) денег не жалеют, на расширение линейки — с запасом
    const md=autoDesign(kind,s);const dc=devCost(md,s),urgent=!cur||(cur.lastDem||0)<Math.max(2,(cur.vol||0)*0.3)||age>72;if(s.cash<dc*(urgent?1.15:2)+(urgent?2500:20000)*cpi(s))continue;
    // разумный игрок не делает модель, которая не окупится
    if(!(designValue({...md},s)>0))continue;
    if(cur&&age<48){const v1=designValue({...md},s),v0=designValue({...cur},s);if(!(v1>v0*1.2))continue;}
    s.cash-=dc;const m={...md,id:s.nextId++,name:'М'+s.nextId,paint:kind==='sport'?'#b81c1c':'#2d3a4a',plan:'auto',status:'dev',devLeft:devMonths(md),launched:0,stock:0,backlog:0,lastDem:0,lastSold:0,lastMade:0,totalSold:0,made:0,fc:0};
    m.price=Math.round(refPrice(m,s)/10)*10;s.models.push(m);break;}
  // 0.32: мотостратегия (MOTO=1): мотоцех, когда мотоциклов дома покупают много, и мотоциклы в линейке
  if(MOTO){const mk=L&&L.mk[s.country];if(!lineOn(s,'moto')&&mshopCan(s)&&mk&&(mk.msize||0)>Math.max(60,(mk.size||0)*0.15)&&s.cash>mshopCost(s)*5)mshopStart(s);
    // 0.33: завод один — мотоциклы расширяют общие цеха (правило ниже)
    if(L&&s.m===11){s._mrev=(s._mrev||0);}}
  // убыточная модель полгода — снять (себестоимость выше того, что остаётся с машины)
  act.forEach(m=>{const n=netPer(m,s.country,s),u=unitCost(m,s);m._neg=(n<u*1.02&&(m.lastSold||0)>0)||((m.lastSold||0)<1&&mi(s)-(m.launched||0)>=8)?(m._neg||0)+1:0;if(m._neg>=6&&act.length>1){m.status='sale';}});
  // старые модели — со сцены, когда новая того же класса продаётся
  act.forEach(m=>{const nw=s.models.some(x=>x.status==='prod'&&x.id>m.id&&kindOf(x)===kindOf(m)&&mi(s)-x.launched>=4);if(nw){m.status='off';s.cash+=m.stock*m.price*0.6;m.stock=0;}});
  // цены — по прибыли
  // VOL=1 — игрок «на объём»: цена — себестоимость + 25% чистыми (ради масштаба и доли), а не наибольшая прибыль
  if(s.m%2===0)act.forEach(m=>{if(process.env.VOL&&mi(s)-(m.launched||0)>=3){const u=ucAtVol(m,s,Math.max(m.lastMade||0,(m.vol||0)*2));m.price=Math.round(u*(+process.env.VOL||1.25)/(1-dMargin(s))/10)*10;return;}const bp=bestPriceFor(m,s);if(bp.price)m.price=bp.price;});
  // КБ: проекты без простоя, расширение
  const early=s.y<1903,prof=L&&L.profit>0;
  // экспорт сразу, если дома покупателей мало (Италия, США до 1906 года): импортёр во Франции — главный рынок пионеров
  if(act.length&&(s.country==='it'||s.country==='us'||s.country==='uk')&&!impLv(s,'fr')&&s.cash>impCost(s,'fr',1)*2.5)impUp(s,'fr');
  const lean=FRUGAL&&s.y<1900&&s.country==='us';
  while(!lean&&rdActive(s).length<rdSlots(s)){const pj=suggestProject(s);if(!pj||s.cash<rdCost(pj,s)*(early&&!prof?5:2))break;if(!rdBegin(s,pj))break;}
  if(!lean&&s.rd.lvl<RD_MAX&&s.cash>rdUpCost(s)*5&&L&&L.profit>0){s.cash-=rdUpCost(s);s.rd.lvl++;}
  // технологии
  if(!s.techBuild&&!lean)for(const k of TECH_ORDER){if(!techOpen(s,k))continue;const c=techCost(s,k);if(s.cash>c*(early?4:2.5)){s.cash-=c;s.plantVal+=c*0.7;s.techBuild={k,left:techMonths(s,k)};break;}}
  // оснащение КБ и команды
  for(const g of ['kb','team'])for(const k of KIT[g]){if(kitHas(s,k.id)||k.y>s.y||kitNeed(s,k))continue;if(s.cash>kitCost(s,k)*8&&L&&L.profit>kitUp(s,k)*4)kitBuy(s,k.id);}
  // цеха: спрос не помещается — +35%
  // разумный хозяин не строит цеха в пустоту: только если покупателям не хватило машин два месяца подряд и есть прибыль;
  // полгода загрузка ниже 45% — продаёт пятую часть цехов (иначе содержание огромного завода съедает кассу в спад)
  if(L&&act.length){const util=capUtil(s);s._lowU=util<0.45?(s._lowU||0)+1:0;
    if(s._lowU>=6&&s.cap>10&&!(s.capBuild||[]).length){const n=Math.max(1,Math.round(s.cap*0.2)),v=Math.round(s.plantVal*n/s.cap*0.4);s.cap-=n;s.plantVal-=s.plantVal*n/(s.cap+n);s.cash+=v;s._lowU=0;s._capSold=mi(s);}}
  // 0.35: продал цеха — два года новых не строит (иначе в кризис 1920-х бот с деньгами строил весной и продавал за 40% осенью)
  const capCool=s._capSold!==undefined&&mi(s)-s._capSold<24;
  if(L&&act.length&&!(s.capBuild||[]).length){const lost=act.reduce((a,m)=>a+(m.lostS||0)*(isMoto(m)?0.15:1),0),util=capUtil(s);s._lostC=lost>Math.max(2,L.sold*0.04)?(s._lostC||0)+1:0;
    if((s._lostC>=2||util>0.95)&&!capCool&&s.hist.profit.slice(-3).reduce((a,b)=>a+b,0)>0){const n=Math.max(2,Math.round(s.cap*0.35)),c=n*capUnitCost(s);
      // в долг — не больше половины лимита банка и не в кризис (осторожный хозяин)
      if(s.cash<c*1.3&&loanOpen(s)&&creditState(s).k==='ok'){const room=maxLoan(s)*0.5-s.loan,need=Math.ceil((c*1.3-s.cash)/1000)*1000;if(room>=need){s.loan+=need;s.cash+=need;}}
      if(s.cash>c*1.2)capOrder(s,n,true);}}
  if(L&&(L.dumpN>0||whStock(s)>whCap(s)*0.8)&&!(s.whBuild||[]).length){const n=Math.max(5,Math.round(whCap(s)*0.5)),c=n*whUnitCost(s);if(s.cash>c*1.5)whOrder(s,n,true);}
  // дилеры дома и экспорт
  if(act.length){const c=s.country,need=dealerNeed(c,s),have=dealerCount(s,c);let n=Math.max(dealerGain(s,c),(L&&(L.mk[c]||{}).lostDlr>0.5)?dealersShort(s,c):0);
    // разумный хозяин не держит дилеров впустую: пока машин берут единицы (США до 1900 года), хватает двух-трёх
    const room=Math.min(need*0.4,2+(L?L.sold:0)*1.5);if(have<room)n=Math.max(n,Math.round(room-have));if(n>0&&s.cash>n*dealerCost(s)*3)buyDealers(s,c,n);
    const smallHome=(s.country==='us'&&s.y<1907)||s.country==='it';
    if(s.m%3===1&&L&&(L.profit>0||smallHome))for(const k of Object.keys(COUNTRIES)){if(k===c||tradeBan(s,k))continue;
      if(!impLv(s,k)){if(marketPotential(s,k)>1&&s.cash>impCost(s,k,1)*4)impUp(s,k);continue;}
      const g=dealerGain(s,k);if(g>0&&s.cash>g*dealerCost(s)*4)buyDealers(s,k,g);
      if(impLv(s,k)<4&&s.cash>impCost(s,k,impLv(s,k)+1)*6&&(L.mk[k]||{}).sold>30)impUp(s,k);}}
  // реклама, зарплата
  if(L)s.ad=Math.round(Math.min(adRef(s)*1.2,Math.max(0,(L.rev||0)*0.04)));
  if(s.y>=1910&&L&&L.profit>0&&s.wagePol==='market')s.wagePol='good';
  // долги — гасить, когда денег много
  if(s.loan>0&&s.cash>s.loan*2+50000*cpi(s)){s.cash-=s.loan;s.loan=0;}
  // гонки: сильная команда — победы каждый сезон и титул через год (как у игрока-гонщика), слава моделям
  if(RACING&&s.y>=1897){if(s.m===5){const n=s.y<1905?2:3;for(let i=0;i<n;i++)s.raceLog.push({y:s.y,m:s.m,place:1,major:i===0,name:'бот'});if(s.y>=1906&&s.y%2===0)s.titles.push({id:'bot-t-'+s.y,y:s.y,n:'титул'});}
    if(s.m>=4&&s.m<=9)act.forEach(m=>{m.raceBoost=mi(s)+2;});}
  // покупка марок (по желанию): самая дешёвая на машину выпуска, когда денег втрое больше цены
  if(DEALS&&s.m%3===2&&s.y>=1906&&L&&L.profit>0){const C=[];for(const c of Object.keys(COUNTRIES)){(COMPS[c]||[]).forEach((cp,i)=>{if(dealBlock(s,c,i))return;const V=dealValue(s,c,i),st=dealStat(s,c,i);if(st.v>0)C.push({c,i,V,ppu:V/st.v});});}
    C.sort((a,b)=>a.ppu-b.ppu);for(const o of C){if(s.cash>o.V*1.3*3){const r=dealDo(s,o.c,o.i,'buy',1.3);if(r&&r.ok&&!QUIET)console.log('   КУПЛЕНА',r.nm,o.c,Math.round(r.price));break;}}}
}
const t0=Date.now();
for(let k=0;k<12*(${Y1}-1895)+1&&!s.over;k++){
  let guard=0;while(s.pending.length&&guard++<60){const ev=s.pending[0];resolve(pickEv(ev));}
  if(s.over)break;
  const cb=s.cash;try{month();}catch(e){console.log('bot err',e&&e.stack);}if(process.env.COSTS){s._cY=s._cY||{};s._cY.bot=(s._cY.bot||0)+(cb-s.cash);}
  const y0=s.y;step();if(s.over){overY=s.y;break;}
  // COSTS=1 — статьи доходов и расходов за год (где утекают деньги)
  if(process.env.COSTS&&s.last){const H=s._cY=s._cY||{};for(const k of ['rev','mil','ord','mat','wage','adm','ovh','dlr','ad','sto','int','rd','rdp','drv','team','tool','hire','war','fin','promo','prm','profit'])H[k]=(H[k]||0)+(s.last[k]||0);
    if(s.y!==y0){console.log('   статьи',y0,Object.entries(H).filter(e=>Math.abs(e[1])>=1).map(e=>e[0]+' '+Math.round(e[1])).join(' '),'| рабочих',s.workers,'cap',s.cap,'дилеров',dealerCount(s,s.country));s._cY={};}}if(MOTO&&s.last){const H=s._mrevY=s._mrevY||{};H.m=(H.m||0)+(s.last.mrev||0);H.t=(H.t||0)+(s.last.rev||0);H.n=(H.n||0)+(s.last.msold||0);}
  if(s.y!==y0&&process.env.DUMP&&s.y>=+process.env.DUMP&&!globalThis.__dumped){globalThis.__dumped=1;
    for(const c of Object.keys(COUNTRIES)){if(!(c===s.country||dealerCount(s,c)>0))continue;const t=yf(s),u0=appeal(c,s);
      s.models.filter(m=>m.status==='prod').forEach(md=>{const g=segOf(md),q=mq(md,s,c),P=offerPrice(md,c,s),fair=prefP(segOf(md),c,s)*payK(md),ex=modelExtras(md,c,s),bk=brandK(c,g,s),k=kappa(c,g,s),ct=contest(s,c,g),pw=pwOf(s,c,g);
        const parts={fame:fameCap(repEffect(s)+adEffect(s,c)+showEffect(s,c)+raceEffect(md,s)+duelEffect(s,c)),aw:awU(s,c),nov:novelty(md,s),eq:(typeof eqU==='function'?eqU(md,g,s):0),era:-eraPen(md,c,s),used:-usedPen(md,c,s),foreign:c===s.country?0:-foreignPen(s,c)-tastePen(md,c,s),rel:relBonus(md,s)};
        console.log('  DUMP',c,g,md.name,'S',classScore(md,s,c).toFixed(2),'qual',(AQ*Math.log(q/QG[g])).toFixed(2),'price',(-BR*Math.log(P/fair)).toFixed(2),'P/fair',(P/fair).toFixed(2),'rivPrice',(-BR*Math.log(pw)).toFixed(2),
          'extras',ex.toFixed(2),JSON.stringify(Object.fromEntries(Object.entries(parts).map(([a,b])=>[a,+b.toFixed(2)]))),'brandK-kappa',(bk-k).toFixed(2),'contest',ct.toFixed(2),
          'TOTAL vs rivals',(AQ*Math.log(q/QG[g])-BR*Math.log(P/fair)+BR*Math.log(pw)+ex+bk-k-ct).toFixed(2));});}}
  if(s.y!==y0){const t=legacyTable(s),P=t.me;if(t.place===1&&!firstY)firstY=y0;
    if(MOTO&&!QUIET){const H=s._mrevY||{};console.log('   мото: выручка',Math.round((H.m||0)/1e3)+'k из',Math.round((H.t||0)/1e3)+'k ('+Math.round((H.m||0)/Math.max(1,H.t||0)*100)+'%), продано мотоциклов',fmtN(H.n||0));s._mrevY={};}
    if(!QUIET)console.log(y0,'продано',String(s.peakLast||0).padStart(7),'касса $'+(s.cash/1e6).toFixed(2)+'м','стоим $'+(companyValue(s)/1e6).toFixed(1)+'м','место',String(t.place).padStart(2),'очков',Math.round(P.total),
      '| масш',Math.round(P.scale),'рын',Math.round(P.market),'инн',Math.round(P.innov),'спорт',Math.round(P.sport),'кап',Math.round(P.capital),'бренд',Math.round(P.brand),'| моделей',s.models.filter(m=>m.status==='prod').map(m=>kindOf(m)[0]+':$'+m.price+'/'+Math.round(unitCost(m,s))).join(' '),'КБ',s.rd.lvl,'мощн',Math.round(capEff(s)));
    if(process.env.V){const P=s.cPrev||{},M=s.mPrev||{};console.log('     страны:',Object.keys(COUNTRIES).map(c=>c+' '+Math.round(P[c]||0)+'/'+Math.round(M[c]||0)+' ('+Math.round((P[c]||0)/Math.max(1,M[c]||0)*100)+'%)').join(' '),
      '| rv:',Object.keys(s.rv||{}).map(c=>c+' '+Object.entries(s.rv[c]).filter(e=>e[1]>0.05).map(e=>e[0][0]+e[1].toFixed(1)).join(',')).filter(x=>x.length>3).join(' '),
      '| cut:',Object.keys(s.resp||{}).map(c=>c+' '+Object.entries(s.resp[c]).filter(e=>(e[1].cut||0)>0||respBoost(s,c,e[0])>0.05).map(e=>e[0][0]+(e[1].cut||0).toFixed(2)+'/'+respBoost(s,c,e[0]).toFixed(2)).join(',')).filter(x=>x.length>3).join(' '),
      '| маржа:',s.models.filter(m=>m.status==='prod').map(m=>{const n=netPer(m,s.country,s),u=unitCost(m,s);return kindOf(m)[0]+' S'+classScore(m,s).toFixed(2)+' '+Math.round((n-u)/Math.max(1,n)*100)+'%';}).join(' '),
      '| прибыль/выручка',(()=>{const H=s.hist.profit.slice(-12).reduce((a,b)=>a+b,0);return Math.round(H/1e3)+'k';})());}}
}
const t=legacyTable(s);
console.log(JSON.stringify({diff:${JSON.stringify(DIFF)},c:${JSON.stringify(CC)},place:t.place,total:Math.round(t.me.total),value:Math.round(companyValue(s)),cash:Math.round(s.cash),peak:s.peak.year||0,first:firstY,over:s.over&&s.cash<0,overY,y:s.y,
  parts:Object.fromEntries(['scale','market','innov','sport','capital','brand'].map(k=>[k,Math.round(t.me[k])])),sec:Math.round((Date.now()-t0)/1000)}));
`);
