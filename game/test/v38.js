// 0.38: новая игра — направление → страна → герой (герой привязан к стране, роль — ярлык); конкурсы министерства
// (соперники без своей фирмы, заказ победителю); просеки под базу и трассу; посадка лётчиком («Сесть»); марш с трио.
// node game/test/v38.js
require('./harness.js')(`{
let bad=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)bad++;};
/* ---------- новая игра ---------- */
{const C=['us','de','fr','uk','it','ru'];let errs=[];
  for(const dir of ['car','moto','air'])for(const c of C){const L=ngHeroList(dir,c);
    if(!L.length)errs.push(dir+'/'+c+': пусто');
    L.forEach(h=>{if(h.c&&h.c!==c)errs.push(dir+'/'+c+': герой '+h.k+' из '+h.c);
      const P=h.kind==='pio'&&PIONEERS[h.k];if(P){if(dir==='air'&&!P.air)errs.push(dir+'/'+c+': '+h.k+' не авиатор');if(dir==='moto'&&!P.moto)errs.push(dir+'/'+c+': '+h.k+' не мотоциклист');if(dir==='car'&&(P.air||P.moto))errs.push(dir+'/'+c+': '+h.k+' не автомобилист');}});
    if(!L.some(h=>h.kind==='custom'))errs.push(dir+'/'+c+': нет своего персонажа');}
  ok(!errs.length,'списки героев: в каждой паре направление–страна только свои герои + свой персонаж'+(errs.length?' — '+errs.slice(0,4).join('; '):''));
  ok(ngHeroList('car','de').some(h=>h.k==='maybach')&&!ngHeroList('car','fr').some(h=>h.k==='maybach')&&!ngHeroList('air','de').some(h=>h.k==='maybach'),'Майбах (Daimler) — только автомобили и только Германия');
  ok(ngHeroList('car','us').some(h=>h.kind==='racer')&&!ngHeroList('air','us').some(h=>h.kind==='racer'),'гонщики — в автомобильном направлении, в авиации их нет');
  const d={dir:'car',country:'fr',hero:{kind:'pio',k:'renault'},company:''};ngSetHero(d,'pio','maybach');
  ok(d.country==='de'&&ngHeroOk(d),'выбор героя ставит его страну: Майбах → Германия');
  d.country='ru';ok(!ngHeroOk(d),'смена страны на Россию: Майбах там не годится — герой сбросится на своего персонажа');
  const tags=Object.values(NG_TAG);ok(tags.includes('Гонщик')&&tags.includes('Финансист')&&tags.includes('Авиатор'),'роль — ярлык на карточке героя: '+tags.join(', '));}
/* ---------- конкурсы министерства ---------- */
{newAirGame('farman','fr','','normal','');G.y=1912;G.m=3;const t=tNow(G);
  const d=airRefMd('recon',t);const md=airNewModel(G,{...d,role:'recon',name:'Разведчик'},{status:'prod',flown:1});md.flown=1;md.status='prod';
  const ev=airTrialNew(G,'recon','fr',12,18,0);
  ok(ev&&ev.dyn&&ev.kind==='trial'&&ev.y===1912&&ev.m===4&&airEvByKey(G,ev.key)===ev&&airEvList(G).includes(ev),'конкурс создан на следующий месяц и виден в списке состязаний: '+ev.name);
  const C=airComps('fr','recon',t,G).map(o=>o.x.n);
  ok(C.length>=3&&!C.includes('Farman'),'соперники в конкурсе — чужие фирмы, своей «Farman» нет: '+C.slice(0,4).join(', '));
  const n0=G.air.ordN||0,pil=airBestPilot(G);
  const res={md:md.id,pil:pil.id,place:1,txt:'все испытания пройдены',field:airEvField(G,ev)};airEvApply(G,ev,res);
  ok((G.air.ordN||0)===n0+1&&(res.order||0)>0&&md.milWon===1&&!G.air.trials.includes(ev),'победа: заказ армии ('+(res.order||0)+' машин), конкурс закрыт, модель — проверенная');
  const ev2=airTrialNew(G,'recon','fr',10,12,0);const res2={md:md.id,pil:pil.id,place:3,txt:'третье место',field:airEvField(G,ev2)};airEvApply(G,ev2,res2);
  ok(!(res2.order>0)&&!G.air.trials.includes(ev2),'третье место в мирное время — без заказа');
  // пока модель не прошла конкурс — министерство объявляет конкурс (весной и осенью); прошедшей — продлевает заказ без конкурса
  {newAirGame('farman','fr','','normal','');G.y=1912;G.m=1;const t2=tNow(G);const d2=airRefMd('recon',t2);const m2=airNewModel(G,{...d2,role:'recon',name:'Разведчик'},{status:'prod',flown:1});m2.flown=1;m2.status='prod';G.air.lv=Math.max(G.air.lv||0,1);
    let trials=0,repeats=0;for(let k=0;k<14;k++){G.pending=[];airCheck(G);const p=G.pending;trials+=p.filter(e=>/объявляет конкурс/.test(e.title||'')).length;repeats+=p.filter(e=>/: ещё \\d+/.test(e.title||'')).length;G.pending=[];G.air.trials=[];G.m++;if(G.m>11){G.m=0;G.y++;}}
    ok(trials>=2&&repeats===0,'новой модели заказ не дают без конкурса: за 14 месяцев конкурсов '+trials+', повторных заказов '+repeats);
    m2.milWon=1;m2.milRep=10;trials=0;repeats=0;G.y=1912;G.m=1;for(let k=0;k<14;k++){G.pending=[];G.air.offer=null;airCheck(G);const p=G.pending;trials+=p.filter(e=>/объявляет конкурс/.test(e.title||'')).length;repeats+=p.filter(e=>/: ещё \\d+/.test(e.title||'')).length;G.pending=[];G.air.trials=[];G.m++;if(G.m>11){G.m=0;G.y++;}}
    ok(repeats>=1,'проверенной модели министерство продлевает заказ без конкурса: повторов '+repeats+', конкурсов '+trials);}}
/* ---------- просеки: база рекорда и трасса без леса ---------- */
{const S={seed:7,forest:1,fields:[{x:0,z:0,r:450,sea:false}],clear:[{a:[2000,0],b:[4000,0],w:420}]};
  let inside=0,n=0,outsideForest=0;for(let x=2000;x<=4000;x+=100)for(let z=-300;z<=300;z+=100){n++;if(fwForest(S,x,z)>0)inside++;}
  for(let x=2000;x<=4000;x+=100)for(const z of [-1200,1200])if(fwForest(S,x,z)>0)outsideForest++;
  ok(inside===0&&outsideForest>0,'в просеке базы леса нет ('+n+' точек), рядом лес есть ('+outsideForest+' точек)');
  ok(fwClear(S,3000,400,0)&&!fwClear(S,3000,500,0)&&fwClear(S,1900,0,150),'fwClear: по ширине просеки и с запасом');}
/* ---------- посадка лётчиком: любой спортивный аэроплан садится в круг ---------- */
{FL.noFail=true;const land={H:()=>30,surf:()=>'grass',obst:()=>null},sea={H:()=>-5,surf:()=>'water',obst:()=>null};const dt=1/120;let fails=[],n=0;
  for(const [y,role] of [[1909,'sport'],[1912,'race'],[1914,'recon'],[1917,'fight'],[1918,'bomb'],[1925,'pax'],[1928,'race']]){const e=airRefEntry(role,y),md={...e[2],role,name:e[1]},isSea=!!airStats(md,y).sea;FW=isSea?sea:land;const gy=isSea?0:30;n++;
    const ac=flCraft(md,y,{rnd:()=>0.3});flPlace(ac,-2600,-2600,Math.PI/4,true);ac.p[1]=gy+160;ac.ctl.thr=0.8;ac.ld=null;
    let st='',T=0;while(T<240&&!ac.crash){st=flAutoLand(ac,[0,0],gy,dt);flStep(ac,dt);T+=dt;if(st==='done')break;}
    const d=Math.hypot(ac.p[0],ac.p[2]);
    if(ac.crash||st!=='done'||d>260)fails.push(e[1]+' ('+y+'): '+(ac.crash||st)+' в '+Math.round(d)+' м за '+Math.round(T)+' с');}
  ok(n===7&&!fails.length,'«Сесть»: '+n+' аэропланов 1909–1928 годов (и гидроаэроплан Шнейдера — на воду) сели сами в круг без поломок'+(fails.length?' — '+fails.join('; '):''));}
/* ---------- марш с трио ---------- */
{const T=TUNES.avto,tok=s=>s.replace(/\\|/g,' ').trim().split(/\\s+/);
  ok(T.div===4&&tok(T.mel).length===256&&T.ch.split(/\\s+/).length===16&&tok(T.trio).length===256&&T.tch.split(/\\s+/).length===16,'марш «Автоимперия»: первая часть и трио — по 16 тактов, 16 аккордов');
  ok(/духовой оркестр/.test(OWN_MUSIC.own_avto.cap),'запись марша подписана «духовой оркестр»');}
/* ---------- названия: месяц без числа, соперник со своей машиной ---------- */
{newAirGame('farman','fr','','normal','');G.y=1912;G.m=3;const ev=airTrialNew(G,'recon','fr',12,18,0);const F=airEvField(G,ev);
  ok(F.length>=3&&!F.some(x=>/^«Farman»/.test(x.n))&&F.every(x=>x.q>0),'состав конкурса: '+F.map(x=>x.n+' — '+x.plane).join('; '));
  ok(F.some(x=>/опытный|своей постройки/.test(x.plane))||F.every(x=>!/MF\\.7/.test(x.plane)||/Farman/.test(x.n)),'у соперника без модели — опытная машина или «своей постройки», а не эталон чужой марки');}
console.log(bad?'ОШИБОК: '+bad:'всё в порядке');if(bad)process.exitCode=1;
}`);
