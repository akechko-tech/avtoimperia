// 0.34 (ТЗ «экономика, которую видно»): цена равного спроса, скрытые штрафы, прибыль после всех расходов, лишние заводы и салоны,
// требование банка в крах. node test/econ34.js
require('./harness.js')(`
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
const seed=a=>{Math.random=(()=>{let x=a;return()=>{x=(x*16807)%2147483647;return x/2147483647;};})();};
const CTX=[['fr',1905],['fr',1912],['us',1912],['us',1925],['uk',1925],['de',1927]];
const KINDS=['people','middle','lux','sport','moto','moside'];
const mk=(kind,y,extra)=>Object.assign({...rivalDesign(kind,y),id:500,name:'X',paint:'#8a1c1c',status:'prod',launched:mi(G)-24,stock:0,price:0,eq:[]},extra||{});
// ---------- 1. цена равного спроса: спрос по ней — как у модели с S = 1 по цене класса (±5%) ----------
{seed(5);let n=0,worst=0,ms=0,kink=0;
  for(const [c,y] of CTX){newGame('custom',c,'T','normal');G.pending=[];G.y=y;G.m=4;G.rep=55;
    for(const kind of KINDS){if(kind==='sport'&&!sportOpen(G,c))continue;if((kind==='moto'||kind==='moside')&&segAnnual(c,kind,G)<=0)continue;
      for(const v of ['rival','auto','old']){let md=mk(kind,y);if(v==='auto')md={...md,...autoDesign(kind,G),id:500};
        if(v==='old'){const d=rivalDesign(kind,Math.max(1895,y-8));md={...md,...d,id:500};}
        const t0=Date.now(),E=eqPrice(md,G,c);ms+=Date.now()-t0;if(!E)continue;
        const g=segOf(md),e=modelExtras(md,c,G)-contest(G,c,g),D=(q,P)=>mkCountry(c,G,[{id:-7,probe:{g,q:Math.max(0.05,QG[g]*q),P,fair:E.fair,e}}],null,null,1).by[-7];
        const k=E.edge?1:D(E.S,E.P)/D(1,E.fair);worst=Math.max(worst,Math.abs(k-1));n++;if(E.kink)kink++;}}}
  ok(n>=90&&worst<0.05,'цена равного спроса: '+n+' моделей (6 контекстов × классы × 3 конструкции), худшее отклонение спроса '+(worst*100).toFixed(2)+'%, в среднем '+(ms/n).toFixed(1)+' мс'+(kink?', ниже 85% цены класса — '+kink:''));}
// грузовик: по тонно-километру против эталона класса
{newGame('custom','us','T','normal');G.pending=[];G.y=1925;G.m=4;const md={...mk('truck',1925),...autoDesign('truck',G),id:500};const E=eqPrice(md,G);
  const ref={...rivalRef(md,G.y).md,id:-8,status:'prod',launched:md.launched,price:E.fair},D=(m,P)=>mkCountry('us',G,[m],{id:m.id,price:P},null,1).by[m.id];
  ok(E&&E.truck&&Math.abs(D({...md,id:-9},E.P)/D(ref,E.fair)-1)<0.05,'грузовик: цена, при которой его берут как эталон класса ($'+Math.round(E.P)+' против $'+Math.round(E.fair)+')');
  const TH=truckHead(md,G);ok(TH&&/т·км/.test(TH.txt)&&TH.u,'заголовок грузовика: «'+(TH&&TH.txt)+'» ('+(TH&&TH.use)+')');}
// ---------- 2. скрытые штрафы: сходятся с mkCountry на заменах деталей ----------
{seed(9);let n=0,bad=0,errS=0,errN=0;
  for(const [c,y] of CTX){newGame('custom',c,'T','normal');G.pending=[];G.y=y;G.m=4;G.rep=55;
    for(const kind of KINDS){if(kind==='sport'&&!sportOpen(G,c))continue;if((kind==='moto'||kind==='moside')&&segAnnual(c,kind,G)<=0)continue;
      const base=mk(kind,y),mo=isMoto(base),cats=PART_CATS.filter(x=>x.k!=='t');
      for(let it=0;it<30;it++){const cat=cats[Math.floor(Math.random()*cats.length)],L=unlockedP(cat.arr(),G,mo).filter(x=>cat.k!=='b'||(mo?!!x.moto&&((x.seats||1)>1)===(kind==='moside'):!x.truck&&!x.moto&&(kind!=='sport'||bodyOpen(x.id))));if(!L.length)continue;
        const x=L[Math.floor(Math.random()*L.length)],md={...base,[cat.k]:x.id};if(segOf(md)!==segOf(base))continue;
        const dE=modelExtras(md,c,G)-modelExtras(base,c,G),dH=hiddenTerms(md,G,c).D-hiddenTerms(base,G,c).D;n++;if(Math.abs(dE-dH)>1e-9)bad++;
        const P=prefP(segOf(base),c,G),D=m=>mkCountry(c,G,[{...m,id:-3,price:P}],{id:-3,price:P},null,1).by[-3]||0,r=D(md)/Math.max(1e-12,D(base));
        if(r>0&&isFinite(r)){const rS=Math.pow(classScore(md,G,c)/classScore(base,G,c),3),rN=Math.pow(buyersPct(md,G,c).N/buyersPct(base,G,c).N,3);if(Math.max(rS/r,r/rS)>1.5)errS++;if(Math.max(rN/r,r/rN)>1.5)errN++;}}}}
  ok(n>=500&&bad===0,'скрытые штрафы: '+n+' замен деталей — сумма строк равна изменению спроса вне S (modelExtras) во всех');
  ok(errN===0,'«для покупателей ≈ N% соперника» ошибается в продажах больше чем в 1,5 раза: '+errN+' раз (одно «% соперника» — '+errS+' из '+n+')');}
// строки в карточке: открытый кузов в США 1925 года
{newGame('custom','us','T','normal');G.pending=[];G.y=1925;G.m=4;const md=mk('people',1925);const ob=unlockedP(BODIES,G).find(b=>!b.truck&&!b.moto&&!b.closed&&(b.seats||2)>=4)||unlockedP(BODIES,G).find(b=>!b.truck&&!b.moto&&!b.closed);md.b=ob.id;
  const H=hiddenTerms(md,G),row=H.L.find(x=>x.id==='body');ok(row&&row.mul<0.5&&/Открытый кузов: в 1925 году/.test(row.txt),'открытая народная в США 1925 года: «'+(row&&row.txt)+'» ×'+(row&&row.mul.toFixed(2)));
  const h=hiddenHTML(md,G);ok(/Для покупателей ≈ \\d+% соперника/.test(h)&&/продажи ×0,/.test(h),'карточка: строка штрафа и «для покупателей ≈ N% соперника»');}
// ---------- 3. прогноз «после всех расходов» — итог следующего месяца (±10%, без склада) ----------
function stuttgart(){seed(13);newGame('custom','de','Моторные мастерские','hist');G.pending=[];G.y=1929;G.m=0;G.cash=2e8;G.lines={car:1,moto:1};G.rep=70;G.ad=20000;
  G.models=[];['people','middle','lux','sport','truck','van','moto','moside'].forEach((k,i)=>{const d=autoDesign(k,G);const m={...d,id:100+i,name:k,paint:'#8a1c1c',plan:'auto',status:'prod',launched:mi(G)-30,stock:0,backlog:0,lastDem:0,lastSold:0,lastMade:0,totalSold:0,made:0,fc:0,vol:200};m.price=Math.round(refPrice(m,G)/10)*10;G.models.push(m);});
  G.cap=16000;G.plantVal=16000*capUnitCost(G)*0.6;G.staffAuto=true;G.workers=20000;
  G.dealers={de:2600,fr:700,uk:600,us:900,it:250};G.dcap={de:3.5,fr:3.5,uk:3.5,us:3.5,it:3.5};G.imp={fr:4,uk:4,us:4,it:4};G.impSince={fr:mi(G)-200,uk:mi(G)-200,us:mi(G)-200,it:mi(G)-200};
  const nm={fr:'Mors',uk:'Lanchester',us:'Mercer',it:'Itala'};G.hold=Object.keys(nm).map(c=>{const i=(COMPS[c]||[]).findIndex(cp=>cp.n===nm[c]);return {c,i,n:nm[c],nm:nm[c],mode:'int',st:1,t:mi(G)-60,sh0:{},paid:1,pay:'cash',mood:65};}).filter(h=>h.i>=0);}
{stuttgart();for(let k=0;k<3;k++){G.pending=[];step();}let worst=0,n=0;const L=[];
  for(let k=0;k<4&&!G.over;k++){const md=G.models[0],A=fcAfter(G,priceFc(md,G,md.price)),st0=G.models.map(m=>m.stock);G.pending=[];step();
    let adj=0;G.models.forEach((m,i)=>{adj+=(m.stock-st0[i])*unitCost({...m,vol:Math.max(1,m.lastMade||1)},G);});const act=G.last.profit+adj,e=A.after/act-1;worst=Math.max(worst,Math.abs(e));n++;L.push(Math.round(e*1000)/10+'%');}
  ok(n===4&&worst<0.1,'штутгартская партия («Историк», 1929, 8 моделей, 4 страны, салоны ×3,5): прогноз после всех расходов против итога месяца без склада — '+L.join(', '));
  const md=G.models[1],h=priceLine(md,G);ok(/до конторы и сети/.test(h)&&/В месяц после всех расходов/.test(h),'прогноз цены: две строки — до конторы и сети и после всех расходов');
  const t=priceTable(md,G);ok(/После всех/.test(t),'таблица цен: столбец «После всех расходов», лучшая цена — по нему');}
// ---------- 4. продажа завода при купленной марке ----------
{stuttgart();G.pending=[];step();const c='fr',md=G.models[0],up0=impUpkeep(G,c),v=impSellValue(G,c),cash0=G.cash;
  ok(impDownTo(G,c)===2&&v>0,'Франция: свой завод при поглощённой Mors — продать сразу до отделения за '+money(v));
  ok(/не нужен/.test(plantRedundantHTML(G,c)),'карточка страны: «Свой завод здесь не нужен: заводы «Mors» уже без пошлины…»');
  impSell(G,c);ok(impLv(G,c)===2&&G.cash>cash0,'продан: отделение, касса +'+money(G.cash-cash0));
  ok(tariffOf(md,c,G)===0&&foreignPen(G,c)===0&&shipK(G,c)===0,'пошлина 0, «чужая марка» 0, доставка 0 — машины местные (их делает Mors)');
  ok(impUpkeep(G,c)<up0*0.2,'содержание завода ушло: '+money(up0)+' → '+money(impUpkeep(G,c))+' (отделение)');
  // и на ступень ниже в стране без купленной марки
  G.imp.de=0;G.hold=G.hold.filter(h=>h.c!=='it');const lv=impLv(G,'it');ok(lv===4&&impDownTo(G,'it')===3,'Италия без купленной марки: завод → сборка (на ступень ниже)');
  ok(leaveOk(G,'it')&&leaveCountry(G,'it')&&dealerCount(G,'it')===0&&impLv(G,'it')===0,'«Уйти из страны»: дилеры закрыты, отделение и заводы проданы');
  const P=admParts(G,G.last);ok(!P.fmL.includes('it'),'контора — без Италии');
  const k0=dealerMult(G,'us'),u0=dealerUpkeep(G,'us');dealerShrink(G,'us');ok(Math.abs(dealerMult(G,'us')-(k0-0.25))<1e-6&&dealerUpkeep(G,'us')<u0,'«Салоны поменьше»: ×'+k0+' → ×'+dealerMult(G,'us')+', содержание дилера '+money(u0)+' → '+money(dealerUpkeep(G,'us')));
  // совет урезать сеть — только когда покупателей не потеряете: салоны больше обычного или дилеров больше, чем городов
  {const X=netCut(G,'us');ok(X&&X.how==='salon'&&/Салоны поменьше/.test(econNetHTML(G,'us')),'США: сеть продаёт '+pct(netLoad(G,'us').k,1)+' возможного при салонах ×'+dealerMult(G,'us')+' — совет «Салоны поменьше»');
   G.dealers.uk=300;G.dcap.uk=1;G.imp.uk=1;G.hold=G.hold.filter(h=>h.c!=='uk');
   ok(netLoad(G,'uk').k<0.2&&netCut(G,'uk')===null&&econNetHTML(G,'uk')==='','Британия: 300 дилеров на ~'+fmtN(Math.round(dealerNeed('uk',G)))+' городов, салоны обычные (загрузка '+pct(netLoad(G,'uk').k,0)+') — закрывать нечего, совета нет: охват упал бы');
   G.dealers.de=Math.round(dealerNeed('de',G)*1.25);G.dcap.de=1;const Y=netCut(G,'de'),NL=netLoad(G,'de');
   ok(NL.k>=0.2||(Y&&Y.how==='extra'&&Y.extra===dealerCount(G,'de')-Math.round(dealerNeed('de',G))&&/закройте [0-9  ]+ лишних/.test(econNetHTML(G,'de'))),'Германия: дилеров больше, чем городов, салоны обычные (загрузка '+pct(NL.k,1)+') — «закройте '+(Y?fmtN(Y.extra):'?')+' лишних»');}}
// ---------- 5. покупка марки: салоны не растут выше нужного ----------
{seed(21);newGame('renault','fr','Рено','normal');G.pending=[];G.y=1921;G.m=3;G.cash=6e7;G.dealers.fr=Math.ceil(dealerNeed('fr',G)*1.3);const k0=dealerMult(G,'fr'),d0=dealerCount(G,'fr'),c0=G.cash;
  const L=(COMPS.fr||[]).map((cp,i)=>({cp,i})).filter(o=>!dealBlock(G,'fr',o.i)&&maStat(G,'fr',o.i)).sort((a,b)=>maStat(G,'fr',b.i).dl-maStat(G,'fr',a.i).dl);let h=null;
  for(const o of L){for(const k of [1.3,1.8,2.5,3.5]){if(G.dealNo)delete G.dealNo['fr'+o.i];const r=dealDo(G,'fr',o.i,'cash',k);if(r&&r.ok){h=holdOf(G,'fr',o.i);break;}}if(h)break;}
  dealerFit(G);ok(h&&dealerCount(G,'fr')<=dealerMax(G,'fr')&&Math.abs(dealerMult(G,'fr')-k0)<1e-9,'поглотили «'+(h&&h.nm)+'» при сети на все города: дилеров '+d0+' → '+dealerCount(G,'fr')+' (предел '+dealerMax(G,'fr')+'), салоны ×'+dealerMult(G,'fr'));
  ok(h&&h.dlSold>0&&h.dlSoldV>0,'её '+(h&&h.dlSold)+' дилеров в тех же городах — деньгами при сделке: '+money(h&&h.dlSoldV||0));}
// ---------- 6. крах 1929 года: требование банка покрывают облигации и акции ----------
{seed(17);newGame('custom','de','Моторные мастерские','hist');G.pending=[];G.y=1929;G.m=9;G.cash=0;const md=G.models[0];Object.assign(md,autoDesign('middle',G),{status:'prod',launched:mi(G)-20});md.price=Math.round(refPrice(md,G)/10)*10;G.cap=60;G.dealers.de=200;
  G.plantVal=6e6;const lim=maxLoan(G);G.loan=10.2e6;const I=invOf(G);I.b={us:45e6/bondV('us',G)};I.st=40e6/djia(G);let minCash=0;
  for(let i=0;i<2&&!G.over;i++){G.pending=[];step();minCash=Math.min(minCash,G.cash);}
  ok(!G.over&&minCash>=-1000,'крах: кредит $10,2 млн при лимите '+money(lim)+', касса 0, вложения $85 млн — касса не ниже нуля ('+money(minCash)+'), без банкротства');}
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');
`);
