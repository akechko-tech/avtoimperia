// 0.48: капитал — оценка банкиров; трофей снятой победы убран; КБ до 14 уровней с геометрическими расходами; нетто по модели;
// три категории участия в выставке; бак родстера в цвет кузова; тормоза по эпохе (замедление, юз, помощь в повороте). node game/test/v48.js
require('./harness.js')(`{
let bad=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)bad++;};
const seed=k=>{let a=k;Math.random=()=>{a=(a*16807)%2147483647;return a/2147483647;};};
/* ---------- КБ ---------- */
{seed(3);newGame('custom','fr','Проба','normal','Ласточка');const s=G;const up=l=>{s.rd.lvl=l;return rdUpkeep(s);},uc=l=>{s.rd.lvl=l;return rdUpCost(s);};
  ok(RD_MAX===14&&RD_LV.length===15&&RD_LV[14].length>5,'КБ — 14 уровней: '+RD_LV.slice(9).join(', '));
  ok(up(14)>50*up(1)&&up(8)>up(7)*1.5&&uc(14)>300*uc(1)&&uc(10)/uc(9)>1.5,'содержание и расширение растут геометрически: уровень 1 — '+money(up(1))+' в месяц, 8 — '+money(up(8))+', 14 — '+money(up(14))+'; расширение до 14-го — '+money(uc(13)));
  ok(rdHorizon({rd:{lvl:14}})===10&&rdSlots({rd:{lvl:14}})===7&&techEarly({rd:{lvl:10}})>=5,'на 14-м уровне — 7 проектов сразу, прототипы на 10 лет вперёд; с 10-го технологии на 5 лет раньше');
  s.rd.lvl=8;const L=rdProjects(s).filter(p=>p.kind==='upg'&&p.ck==='e');const n0=L.find(p=>p.lvl===1);
  s.rd.upg=s.rd.upg||{};if(n0){s.rd.upg[n0.id]=3;const L2=rdProjects(s).filter(p=>p.kind==='upg'&&p.id===n0.id),n3=L2[0];
    ok(n3&&n3.lvl===4&&n3.need>n0.need*3.5&&rdCost(n3,s)>rdCost(n0,s)*2.5,'ступень улучшения ★4 — в '+(n3?(n3.need/n0.need).toFixed(1):'?')+' раза дольше и в '+(n3?(rdCost(n3,s)/rdCost(n0,s)).toFixed(1):'?')+' раза дороже первой');}else ok(false,'нет проектов улучшения мотора');}
/* ---------- капитал и трофей ---------- */
{seed(5);newGame('custom','us','Проба2','normal','Ласточка');G.helper={on:1};for(let k=0;k<36;k++){while(G.pending.length)resolve(G.pending[0].choices[0][1]);G.over=false;step();}
  const me=worldMine(G);ok(Math.abs(me.val-Math.max(0,companyValue(G)))<1&&me.val>0,'капитал в господстве — оценка банкиров: '+money(me.val));
  G.dom={k:'innov',y:1897,m:5,who:'you'};G.trophies=G.trophies||[];G.trophies.push({kind:'record',title:'Господство: инновации',key:'dom|innov',story:'Рекорд всей эпохи 1895–1930 — Cadillac: 5 — остался позади.'});G.legBonus=100;G.over=false;domCheck(G);
  ok(!G.dom&&!G.trophies.some(t=>/^Господство:/.test(t.title||''))&&G.legBonus===0,'снятая победа 0.45: трофей «Господство: инновации… Cadillac: 5» убран, +100 наследия назад');}
/* ---------- нетто по модели ---------- */
{seed(7);newGame('custom','fr','Проба3','normal','Ласточка');G.helper={on:1};for(let k=0;k<30;k++){while(G.pending.length)resolve(G.pending[0].choices[0][1]);G.over=false;step();}
  const md=G.models.find(m=>m.status==='prod')||G.models[0];const f=brandFc(md,G,md.price),N=modelNet(md,G,f),A=fcAfter(G,f),one=G.models.filter(m=>m.status==='prod'||m.status==='sale').length===1;
  ok(N.sh>0&&N.sh<=1&&Math.abs(N.gross-(f.pr||0))<1&&N.over>0&&(!one||Math.abs(N.net-A.after)<2),'нетто по модели: маржа '+money(N.gross)+' минус доля общих расходов '+money(N.over)+' ('+Math.round(N.sh*100)+' %) = '+money(N.net)+(one?' — у единственной модели совпадает с итогом фирмы ('+money(A.after)+')':''));
  const h=priceLine(md,G),t=priceTable(md,G);ok(/Нетто по модели в месяц/.test(h)&&/доля общих расходов/.test(h)&&/Нетто/.test(t)&&/Вся фирма|После всех/.test(t),'карточка модели: «Нетто по модели в месяц», доля общих расходов, таблица цен со столбцом «Нетто модели»');}
/* ---------- выставки: три категории, плата по масштабу ---------- */
{seed(9);newGame('custom','fr','Проба4','normal','Ласточка');G.cash=5e6;const sh=SHOWS.find(x=>x.h==='paris'&&x.y>=1902);
  const c1=standCost(sh,G,1),c2=standCost(sh,G,2),c3=standCost(sh,G,3);ok(c3>c2*2&&c2>c1*2.5,'Парижский салон '+sh.y+': малый стенд '+money(c1)+', большой '+money(c2)+', павильон марки '+money(c3));
  G.world=G.world||worldInit(G);G.world.my.r12=5e6;const k1=standCost(sh,G,1);G.world.my.r12=1e8;const k2=standCost(sh,G,1);ok(k1>c1*3&&k2>k1*3,'плата растёт с размером компании: при выручке $5 млн в год — '+money(k1)+', при $100 млн — '+money(k2));
  G.world.my.r12=0;G.y=sh.y;G.m=sh.m-1;G.shows={};G.showNow=null;showInvite(G,sh);const ev=G.pending.find(e=>/Приглашение на выставку/.test(e.kicker||''));
  ok(!!ev&&ev.choices.length===4&&/Павильон марки/.test(ev.choices[0][0])&&/павильон марки — своё здание/.test(ev.text),'приглашение: павильон марки, большой стенд, малый стенд, не участвовать');
  const cash0=G.cash;showBook(G,'show3');const e=G.shows[sh.id];ok(e&&e.tier===3&&e.big===1&&cash0-G.cash===c3,'павильон снят: списано '+money(c3));
  G.models[0].status='prod';G.models[0].vol=40;G.last=G.last||{};showRun(G,sh,e);const res=e.res;ok(!!res&&/Павильон марки/.test((G.pending.find(x=>x.kicker==='Выставка')||{}).text||''),'день выставки: «Павильон марки» в газете, заказов '+(res?res.orders:'?')+', репутация +'+(res?res.rep:'?'));}
/* ---------- бак родстера — в цвет кузова ---------- */
{newGame('ford','us','Форд Мотор','normal','Модель R25');const md=G.models[0];md.paint='#9e2b25';md.b='b10';const hx=c=>'#'+c.map(v=>('0'+Math.round(v).toString(16)).slice(-2)).join('');
  const sp=modelSpec(md,0,1906,{country:'us',num:3,mech:true}),M=carModel(Object.assign({},sp,{lod:'hi'}));let red=0,brass=0;M.F.forEach(f=>{const c=hx(f.col);if(c==='#9e2b25')red++;if(c==='#c9a24a')brass++;});
  ok(sp.style==='sport'&&red>=220&&brass<1100,'родстер 1906 года (sport): красных граней '+red+', латунных '+brass+' — бак в цвет кузова, латунь только обручи и горловина');}
/* ---------- тормоза ---------- */
{seed(11);newGame('custom','fr','T','normal');const rc=RACES.find(r=>r.key==='gpacf-1906');G.y=rc.y;G.m=rc.m;G.cash=1e7;raceResults=function(){};const origStep=carStep;let CAP=null;
  const hook=function(c,trk,h){if(!CAP){CAP={trk,cars:R.cars};throw new Error('CAP');}return origStep(c,trk,h);};carStep=hook;
  const trial=(kid,steer)=>{CAP=null;carStep=hook;const md={...G.models[0]};const a=aiCarMd(rc.y);['e','g','c','w'].forEach(k=>md[k]=a[k]);md.k=kid;
    try{startRace({rc,mode:'sim',entries:[{drv:'me',md,prep:2,tyre:'soft',gear:0}]});}catch(e){if(e.message!=='CAP')throw e;}
    const trk=CAP.trk,c=CAP.cars.find(x=>x.you);const K=trk.K,n=trk.n;let best=0,bi=0;for(let i=0;i<n-80;i++){let q=0;for(let j=i;j<i+80;j++){if(Math.abs(K[j])<1/900)q++;else break;}if(q>best){best=q;bi=i;}}
    const P=trk.pts,p0=P[bi],p1=P[bi+1];c.idx=bi;c.x=p0[0];c.z=p0[2];c.yaw=Math.atan2(p1[0]-p0[0],p1[2]-p0[2]);c.vx=16.7;c.vy=0;c.r=0;c.delta=0;c.gu=0;c.gear=2;c.player=true;c.wait=false;
    R={mode:'drive',time:1,t:1,cars:CAP.cars,trk};rKeys.gas=false;rKeys.brake=true;rKeys.left=false;rKeys.right=false;let maxR=0,t=0;const x0=c.x,z0=c.z;
    while(c.vx>0.3&&t<15){c.thr=0;c.brk=1;c.delta=steer;playerControl(c,1/60);c.delta=steer;carStep=origStep;origStep(c,trk,1/60);t+=1/60;maxR=Math.max(maxR,Math.abs(c.r));}
    rKeys.brake=false;R=null;return {dist:Math.hypot(c.x-x0,c.z-z0),t,maxR,dec:brakeDec(c,0.92),c};};
  const a=trial('k1',0),b=trial('k2',0),d=trial('k3',0),e=trial('k4',0);
  ok(a.dec<2.8&&a.dec>2.3&&b.dec<3.6&&d.dec>4.2&&e.dec>5&&e.dec<5.8,'замедление по эпохе на сухом: лента '+a.dec.toFixed(1)+' м/с², задние барабаны '+b.dec.toFixed(1)+', четыре колеса '+d.dec.toFixed(1)+', гидравлика '+e.dec.toFixed(1));
  ok(a.dist>40&&a.dist<56&&b.dist>30&&b.dist<42&&d.dist>24&&d.dist<33&&e.dist>20&&e.dist<28&&[a,b,d,e].every(x=>x.maxR<0.15),'с 60 км/ч по прямой: лента '+a.dist.toFixed(0)+' м, барабаны '+b.dist.toFixed(0)+', четыре колеса '+d.dist.toFixed(0)+', гидравлика '+e.dist.toFixed(0)+' — без разворота');
  const f=trial('k2',0.12),g=trial('k4',0.12);
  ok(f.maxR<1.6&&f.dist>25&&f.c.vx<0.5,'задние барабаны с рулём на тормозе: помощь водителя отпускает тормоз до двух третей сцепления задней оси — машина скользит, но не разворачивается (max рыскание '+f.maxR.toFixed(2)+' рад/с, '+f.dist.toFixed(0)+' м)');
  ok(g.maxR>0.3&&g.maxR<1.2,'тормоза на четыре колеса с рулём: машина поворачивает на тормозе (рыскание '+g.maxR.toFixed(2)+' рад/с), а не идёт по рельсам');
  carStep=origStep;}
console.log(bad?'ОШИБОК: '+bad:'всё в порядке');process.exit(bad?1:0);}`);
