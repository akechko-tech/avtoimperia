// Бот для прогонов экономики: проектирует модели, подбирает цену, строит завод
module.exports=`
function unitCost(md){return matCost(md,G)+hoursPerCar(md,G)/hoursPerWorker(G)*wageNow(G);}
function bestPrice(md){let best=md.price,bp=-1e18;const ref=refPrice(md,G);for(const k of [0.7,0.8,0.9,1,1.1,1.2,1.35,1.5]){const p=Math.round(ref*k);const d=demandAt(md,G,p);const pr=d*(p*(1-DEALER_MARGIN)-unitCost(md));if(pr>bp){bp=pr;best=p;}}return best;}
function design(seg0){let best=null,bv=-1e18;
  for(const seg of (seg0==='people'?['people','middle']:[seg0])){const t=seg==='people'?'t0':seg==='middle'?'t1':'t2';
  for(const e of unlockedP(ENGINES,G))for(const c of unlockedP(CHASSIS,G))for(const b of unlockedP(BODIES,G).filter(x=>!x.truck))for(const w of unlockedP(TYRES,G)){
    const md={id:-1,e:e.id,c:c.id,b:b.id,w:w.id,t,vol:500,made:0,launched:mi(G),status:'prod',price:0};if(overpower(md))continue;
    const ref=refPrice(md,G);for(const k of [0.85,1,1.15,1.3]){md.price=ref*k;const d=segMarket(G.country,seg,G,[md]).you;const v=d*(md.price*(1-DEALER_MARGIN)-unitCost(md));if(v>bv){bv=v;best=Object.assign({},md);}}}}
  best.id=G.nextId++;best.name='M'+best.id;best.paint='#333';best.plan='auto';best.devLeft=0;best.stock=0;best.backlog=0;best.lastDem=0;best.lastSold=0;best.lastMade=0;best.totalSold=0;best.made=0;best.fc=0;best.vol=0;best.price=Math.round(best.price);return best;}
function botMonth(strat){
  const s=G;const act=s.models.filter(m=>m.status==='prod');
  if(s.m===0){const seg=s.country==='us'?(s.y>=1905?'people':'middle'):(s.y>=1919?'people':'middle');
    if(!act.length||mi(s)-Math.max(...act.map(m=>m.launched))>=48){const nm=design(seg);act.forEach(m=>{m.status='off';s.cash+=m.stock*m.price*0.5;m.stock=0;});s.cash-=devCost(nm,s)+toolingCost(nm,s);s.models.push(nm);}
    if(strat==='clone'&&s.models.filter(m=>m.status==='prod').length<4){const a=s.models.find(m=>m.status==='prod');for(let i=0;i<3;i++){const c=JSON.parse(JSON.stringify(a));c.id=s.nextId++;c.totalSold=0;s.models.push(c);}}
  }
  if(s.m%3===0)s.models.filter(m=>m.status==='prod').forEach(m=>{m.price=strat==='dump'?Math.round(refPrice(m,s)*0.6):bestPrice(m);});
  const L=s.last;if(!L)return;
  const util=L.made/Math.max(1,capEff(s)),pend=s.capBuild.reduce((a,b)=>a+b.units,0),dem=act.reduce((a,m)=>a+m.fc,0);
  if((util>0.85||dem>capEff(s)*0.9)&&!pend){const add=Math.max(2,Math.round(s.cap*0.5)),cost=add*capUnitCost(s);if(s.cash>cost*2){s.cash-=cost;s.plantVal+=cost;s.capBuild.push({units:add,left:2});}}
  const fcT=act.reduce((a,m)=>a+m.fc,0);
  for(const c of [s.country,...(s.country==='us'&&s.y<1901?['fr']:[])]){const need=dealerNeed(c,s),have=dealerCount(s,c),tgt=strat==='nodealers'?1:Math.max(c===s.country?1:3,Math.min(need*0.7,3+fcT*2.5/dealerTP(s)));if(have<tgt){const n=Math.max(1,Math.round((tgt-have)*0.3)),cst=n*dealerCost(s);if(s.cash>cst*2){s.cash-=cst;s.dealers[c]=have+n;}}}
  s.ad=Math.round(Math.min(adRef(s)*0.8,Math.max(0,(L.rev||0)*0.04)));
  if(!s.techBuild)for(const k of TECH_ORDER){if(k==='credit')continue;if(techOpen(s,k)){const c=techCost(s,k);if(s.cash>c*1.5){s.cash-=c;s.plantVal+=c*0.7;s.techBuild={k,left:3};break;}}}
  if(s.cash<0&&s.loan+5000<=maxLoan(s)){s.loan+=5000;s.cash+=5000;}
}
`;
