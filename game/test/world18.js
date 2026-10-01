// ТЗ 0.18, раздел 4: мировые события в свой год — газета с роликом и выбором, влияние на спрос в журнале,
// затухание к сроку, выбор меняет игру и через месяц отражается в газете. node test/world18.js
require('./harness.js')(`
Math.random=(()=>{let a=313;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
{const nw=WORLD.filter(W=>!W.legal).length,nl=WORLD.filter(W=>W.legal).length;ok(nw>=12&&nw<=20&&nl>=20,'событий в партии: мировых '+nw+', судов, законов и налогов (0.22) '+nl);}
WORLD.forEach(W=>{ok(!W.reel||!!reelGet(W.reel,G||{models:[]}),W.id+': ролик '+W.reel+' есть');});
for(const home of ['fr','us']){console.log('== дом: '+home);
  newGame('custom',home,'Мир','normal');G.cash=5e6;const md=G.models[0];
  const pick=Object.fromEntries(WORLD.filter(W=>W.id!=='warus').map((W,i)=>[W.id,i%2]));pick.warus=0;
  for(const W of WORLD){if(!worldApplies(W,G))continue;const y=W.id==='war'&&home==='it'?1915:W.y,m=W.id==='war'&&home==='it'?4:W.m;
    G.y=y;G.m=m;G.pending=[];G.wseen={};const u0={};['us','fr','de'].forEach(c=>u0[c]=worldU(G,c,'lux')+worldU(G,c,'middle')+worldU(G,c,'truck')+worldU(G,c,'sport'));
    const L0=G.log.length;worldCheck(G);const ev=G.pending.find(e=>e.world===W.id);
    ok(!!ev&&ev.paper&&!!ev.mean&&ev.choices.length>=(W.legal?1:2),W.id+' ('+y+'): газета «'+(ev?ev.title:'—')+'», «что это значит»: '+(ev?ev.mean.slice(0,60)+'…':'нет'));
    ok(G.log.slice(L0).some(l=>l.text.includes(W.title)),W.id+': влияние записано в журнал');
    // ролик — кадром плёнки в газете
    if(ev){const h=paperHTML({...ev,act:'choose'},G);ok(!W.reel||/p-reel/.test(h),W.id+': кадр кинохроники в газете');ok(/p-mean/.test(h),W.id+': карточка «Что это значит для вас»');}
    // выбор
    if(pick[W.id]>=ev.choices.length)pick[W.id]=ev.choices.length-1;
    const ch=ev.choices[pick[W.id]][1],cash0=G.cash,rep0=G.rep,st0=JSON.stringify({m:G.military,imp:G.imp,cut:G.cutUntil,cap:G.capSale,steel:G.steelUntil,ad:G.adFx,rel:G.relFx,rd:G.rd.bpStock,wfx:(G.wfx||[]).length,loan:G.loan,prices:G.models.map(x=>x.price),wp:G.wagePol,wk:G.workers,lg:JSON.stringify(G.legal||{}),ord:(G.orders||[]).length});
    G.pending=[ev];resolve(ch);
    const st1=JSON.stringify({m:G.military,imp:G.imp,cut:G.cutUntil,cap:G.capSale,steel:G.steelUntil,ad:G.adFx,rel:G.relFx,rd:G.rd.bpStock,wfx:(G.wfx||[]).length,loan:G.loan,prices:G.models.map(x=>x.price),wp:G.wagePol,wk:G.workers,lg:JSON.stringify(G.legal||{}),ord:(G.orders||[]).length});
    const changed=st0!==st1||G.cash!==cash0||G.rep!==rep0,noop=/No$|Skip$|Wait$|Ok$|Keep$|Stay$/.test(ch);
    ok(changed||noop,W.id+': выбор «'+ev.choices[pick[W.id]][0]+'» '+(changed?'меняет игру':'— ничего не делать'));
    // через месяц — газета о выборе
    G.m++;if(G.m>11){G.m=0;G.y++;}G.pending=[];worldCheck(G);const f=G.pending.find(e=>/месяц спустя/.test(e.kicker));
    const hasTxt=(G.wnext||[]).length===0;ok(noop&&!f?true:!!f,W.id+': через месяц газета — «'+(f?f.title:'(без газеты: ничего не делали)')+'»');}
  // затухание: влияние к сроку сходит на нет
  G.wfx=[];G.y=1906;G.m=3;wfxAdd(G,'us','truck',0.35,12,'тест');const a=worldU(G,'us','truck');G.m+=6;const b=worldU(G,'us','truck');G.y++;G.m=4;const c=worldU(G,'us','truck');
  ok(a>0.34&&b>0.1&&b<a&&c===0,'влияние затухает: '+a.toFixed(2)+' → '+b.toFixed(2)+' → '+c);}
// спрос: паника 1907 бьёт по дорогим машинам игрока в США
newGame('custom','us','Мир','normal');G.y=1907;G.m=8;G.last={made:200};const lx=autoDesign('lux',G);Object.assign(G.models[0],lx,{id:1,status:'prod',launched:mi(G)-6});G.models[0].price=Math.round(refPrice(G.models[0],G)/10)*10;G.dealers.us=200;
const d0=demandAll(G).by[1].us;G.m=9;G.wseen={};worldCheck(G);const d1=demandAll(G).by[1].us;G.m=8;G.wfx=[];const d0b=demandAll(G).by[1].us;
ok(d1<d0*0.85,'паника 1907: спрос на люкс в США '+d0.toFixed(1)+' → '+d1.toFixed(1)+' в месяц');
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');
`);
