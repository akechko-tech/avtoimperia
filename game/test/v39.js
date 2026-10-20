// 0.39, пункт 1 «Полёт»: ускорение ×8 (автопилот не режется у земли), «Долететь», мотор стоит — завести/починить/заправиться,
// колёсные тормоза (шасси g3), флаттер на предельной скорости (обшивка рвётся — видно и слышно), пробег «Сесть» с ручкой на себя.
// node game/test/v39.js
require('./harness.js')(`{
let bad=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)bad++;};
const land={H:()=>30,surf:()=>'grass',obst:()=>null,S:{seed:1,fields:[{x:0,z:0,r:450}],towns:[{x:1800,z:0,city:0}]}};FW=land;FL.noFail=true;fwHgt=()=>30;
const mk=(y,role,o)=>{const e=airRefEntry(role,y),md={...e[2],role,name:e[1]};return flCraft(md,y,{rnd:()=>0.3,...(o||{})});};
/* ---------- ускорение ---------- */
{const me=mk(1912,'sport');flPlace(me,0,0,0,{h:40,v:30,thr:0.7});FL.me=me;FL.mi={warpMax:8,warpAuto:16,over:false};FLY.auto=false;FLY.landing=null;
  const wManual=flWarpMax();FLY.auto=true;const wAuto=flWarpMax();me.p[1]=30+400;FLY.auto=false;const wHigh=flWarpMax();FLY.auto=false;
  ok(wManual===2&&wAuto===16&&wHigh===8,'у земли вручную ×2, автопилот у земли ×16 (не режется), в высоте вручную ×8: '+[wManual,wAuto,wHigh].join('/'));
  FL.me=null;FL.mi=null;}
/* ---------- мотор стоит: завести, починить, заправиться ---------- */
{const me=mk(1912,'sport');flPlace(me,0,0,0);me.eng.run=0;me.eng.fail='заглох мотор';
  let O=flEngOpts(me);ok(O.length===1&&O[0].k==='start','на земле заглох — предлагают завести: '+O.map(o=>o.t).join(', '));
  me.rnd=()=>0.99;flEngStart(me);let r;for(let i=0;i<40&&(r=flEngTick(me,0.5))==='wait';i++);ok(r==='fail'&&!me.eng.run&&me.starts===1,'не повезло — не схватывает, попытка учтена');
  me.rnd=()=>0.01;flEngStart(me);for(let i=0;i<40&&(r=flEngTick(me,0.5))==='wait';i++);ok(r==='ok'&&me.eng.run===1&&!me.eng.fail,'со второй попытки мотор схватил');
  me.eng.run=0;me.eng.fail='кончился бензин';me.fuel=0;O=flEngOpts(me);ok(O.length===1&&O[0].k==='fuel'&&/аэродром/.test(O[0].sub),'кончился бензин у аэродрома — «Заправиться»: '+O[0].sub);
  me.p[0]=1700;O=flEngOpts(me);ok(O.length===1&&O[0].k==='fuel'&&/деревня/.test(O[0].sub),'…а у деревни — из деревни: '+O[0].sub);me.p[0]=0;
  const min=flRepair(me,'fuel');ok(min===40&&me.fuel===me.fuelMax&&me.eng.run===1,'заправились за 40 мин, бак полный');
  me.p[0]=20000;me.eng.run=0;me.eng.fail='мотор разбит';O=flEngOpts(me);ok(O.length===1&&O[0].k==='no','мотор разбит в глуши — чинить негде: '+O[0].sub);
  me.p[0]=0;O=flEngOpts(me);ok(O.length===1&&O[0].k==='fix'&&O[0].min===180,'у аэродрома — ремонт 3 ч');const h0=me.haz;flRepair(me,'fix');ok(me.eng.run===1&&me.dmg.eng<0.2&&me.haz>h0,'после ремонта летит, но мотор капризнее');
  // в воздухе заглох — запуск от потока только на скорости
  const a=mk(1912,'sport');flPlace(a,0,0,0,{h:300,v:35,thr:0});a.eng.run=0;a.eng.fail='заглох мотор';a.V=a.Vs*1.5;ok(flEngOpts(a).some(o=>o.k==='start'),'в воздухе на скорости — «запустить» (винт раскручен потоком)');
  a.V=a.Vs*1.05;ok(!flEngOpts(a).length,'на малой скорости в воздухе — не предлагают');
  a.eng.fail='лопнул бензопровод';a.V=a.Vs*1.5;ok(!flEngOpts(a).length,'бензопровод в воздухе не починить');}
/* ---------- тормоза ---------- */
{const roll=(y,brk)=>{const me=mk(y,'sport');flPlace(me,0,0,0);me.v=[0,0,22];me.ctl.thr=0;me.ctl.brk=brk;let T=0;const dt=1/120;while(T<60&&(me.Vg===undefined||me.Vg>0.5)&&!me.crash){flStep(me,dt);T+=dt;}return {d:me.dist,T,brakes:me.brakes,crash:me.crash};};
  const a=roll(1912,1),b=roll(1928,0),c=roll(1928,1);
  ok(!a.brakes&&c.brakes,'у аэроплана 1912 года тормозов нет, у машины 1928 года — есть');
  ok(c.d<b.d*0.8&&!c.crash,'с тормозом пробег короче: '+Math.round(c.d)+' м против '+Math.round(b.d)+' м');}
/* ---------- флаттер ---------- */
{const dive=(me,stop)=>{let T=0,o1=0,o2=0;const dt=1/120;while(T<60&&!me.crash&&me.p[1]>60){me.ctl.sy=T<6?-0.6:-0.35;me.ctl.thr=1;flStep(me,dt);T+=dt;if(me.ovs===1)o1++;if(me.ovs===2)o2++;if(stop&&stop(me))break;}return {T,o1,o2};};
  const me=mk(1912,'sport');flPlace(me,0,0,0,{h:2500,v:me.st.vc/3.6,thr:1});const vm=me.st.v/3.6;const r=dive(me);
  ok(r.o1>0&&r.o2>0&&/флаттер/.test(me.crash||''),'Блерио, пикирование на полном газу: тряска ('+Math.round(r.o1/120)+' с) → обшивка рвётся ('+Math.round(r.o2/120)+' с) → '+(me.crash||'цел'));
  const b=mk(1912,'sport');flPlace(b,0,0,0,{h:2500,v:b.st.vc/3.6,thr:1});dive(b,a=>a.ovs===2&&a.dmg.wing>0.15);let T=0;const dt=1/120,w0=b.dmg.wing;
  while(T<10&&!b.crash){b.ctl.sy=0.9;b.ctl.thr=0;flStep(b,dt);T+=dt;}
  ok(!b.crash&&b.dmg.wing<0.6&&b.V<vm*1.3&&w0>0.15,'убрать газ, ручку на себя — вышел из пикирования: планер '+Math.round((1-b.dmg.wing)*100)+'%, скорость '+Math.round(b.V*3.6)+' км/ч');}
/* ---------- «Сесть»: пробег с ручкой на себя и тормозом ---------- */
{const me=mk(1928,'sport');flPlace(me,0,0,0);me.v=[0,0,20];me.Vg=20;me.ld={st:'roll'};const st=flAutoLand(me,[0,0],30,1/120);
  ok(st==='roll'&&me.ctl.sy>0&&me.ctl.brk===1,'пробег: ручка на себя ('+me.ctl.sy+'), тормоз ('+me.ctl.brk+')');}
/* ---------- «Долететь»: когда останавливается ---------- */
{const me=mk(1912,'sport');flPlace(me,0,0,0,{h:400,v:35,thr:0.8});FL.me=me;FL.mi={over:false,auto:()=>{},rivals:[]};
  ok(flySkipStop()===null,'в полёте с исправным мотором — летим');me.fuel=me.fuelMax*0.05;ok(flySkipStop()==='бензин на исходе','бензин на исходе — лётчик зовёт вас');
  me.fuel=me.fuelMax;me.eng.run=0;ok(flySkipStop()==='мотор стоит','мотор стал — ускорение снимается');FL.me=null;FL.mi=null;}
/* ---------- погода и воздух ---------- */
{const S={seed:3,fields:[{x:0,z:0,r:450}],towns:[{x:2500,z:300,city:0},{x:-3000,z:-900,city:1}],bio:'plain'};FW={H:()=>30,surf:()=>'grass',obst:()=>null,S};
  let seen={rain:0,storm:0,calm:0,fog:0},N=0,maxW=0;for(let k=0;k<400;k++){const wx=wxMake({place:'plain',y:1913,m:k%12,seed:k,A:[-9500,0],B:[9500,0],mood:['clear','cloudy','overcast','morning','evening'][k%5]});N++;if(wx.rain)seen.rain++;if(wx.storm)seen.storm++;if(wx.ws<1.5)seen.calm++;if(wx.vis<12)seen.fog++;maxW=Math.max(maxW,wx.ws);}
  ok(seen.rain>40&&seen.rain<200&&seen.storm>8&&seen.storm<120&&seen.fog>10&&maxW<=13,'400 дней: дождь '+seen.rain+', грозы '+seen.storm+', туман/дымка '+seen.fog+', штиль '+seen.calm+', ветер до '+Math.round(maxW)+' м/с');
  const wx=wxMake({place:'plain',y:1913,m:6,seed:11,A:[-9500,0],B:[9500,0],mood:'clear'});wx.ws=5;wx.wa=0;wx.w0=[0,0,5];wx.gust=0;wx.therm=0;wx.storm=null;FL.wx=wx;
  const w10=wxWindAt(0,40,0,10,0),w1000=wxWindAt(0,1030,0,1000,0);const s10=Math.hypot(w10[0],w10[2]),s1000=Math.hypot(w1000[0],w1000[2]);
  ok(Math.abs(s10-5)<0.1&&s1000>9&&s1000<11&&Math.atan2(w1000[0],w1000[2])>0.2,'профиль ветра: у земли 5 м/с, на 1000 м — '+s1000.toFixed(1)+' м/с и заходит по часовой на '+Math.round(Math.atan2(w1000[0],w1000[2])*57.3)+'°');
  wx.storm={cells:[{x:4000,z:0,r:2000,base:800,top:5000,ph:0,next:5,vx:0,vz:0}]};const under=wxWindAt(4000,300,0,270,0),inside=wxWindAt(4000,1500,0,1470,0),out=wxWindAt(4000+2300,300,0,270,0);
  ok(under[1]<-6&&inside[1]>3&&Math.abs(out[0])>2,'гроза: под ячейкой нисходящий '+under[1].toFixed(1)+' м/с, в облаке восходящий +'+inside[1].toFixed(1)+', на краю шквал от центра '+out[0].toFixed(1)+' м/с');
  ok(wxTurb(500,4000,0)>1.4&&wxTurb(500,0,0)<0.4,'болтанка в грозе '+wxTurb(500,4000,0).toFixed(1)+', вдали '+wxTurb(500,0,0).toFixed(2));
  ok(/ветер 5 м.с с Ю/.test(wxText(wx))&&/гроза/.test(wxText(wx)),'сводка: '+wxText(wx));
  const hot=wxMake({place:'med',y:1920,m:7,seed:5,mood:'clear'});hot.temp=32;hot.sig=288.15/(288.15+(32-15)*0.85);ok(hot.sig<0.96&&hot.sig>0.9,'жара +32°: плотность '+hot.sig.toFixed(3)+' — мотор и крыло слабее');
  // болтанка: термики и порывы не роняют аэроплан — лётчик (автопилот) держит высоту
  wx.storm=null;wx.therm=1;wx.gust=0.6;wx.ws=7;wx.w0=[0,0,7];const me=mk(1912,'sport');flPlace(me,0,0,Math.PI/2,{h:300,v:me.st.vc/3.6,thr:0.8});const dt=1/60;let T=0,maxRoll=0,minH=1e9,maxH=0,tb=0;
  while(T<90&&!me.crash){flAuto(me,{x:30000,z:0,alt:330,spd:me.st.vc/3.6*0.95,bank:0.4});flStep(me,dt);T+=dt;maxRoll=Math.max(maxRoll,Math.abs(flBank(me)));minH=Math.min(minH,me.p[1]);maxH=Math.max(maxH,me.p[1]);tb=Math.max(tb,me.turb||0);}
  ok(!me.crash&&maxRoll<0.6&&minH>230&&maxH<430,'90 с в термиках и порывах: крен до '+Math.round(maxRoll*57.3)+'°, высота '+Math.round(minH)+'…'+Math.round(maxH)+' м, болтанка '+tb.toFixed(2)+(me.crash?' — '+me.crash:''));
  // птицы: стаи у полей и деревень; столкновение
  wxBirdsInit(S);ok(wx.birds.length>=2&&wx.birds.every(b=>b.y>40&&b.y<180),'стай птиц: '+wx.birds.length+' ('+wx.birds.map(b=>b.kind).join(', ')+')');
  const b=wx.birds[0],a=mk(1912,'sport');flPlace(a,b.x,b.z,0,{h:b.y-30,v:30,thr:0.8});a.p[1]=b.y;a.V=30;const R0=Math.random;Math.random=()=>0.01;let hit=0;for(let i=0;i<120&&!hit;i++){wxBirdsTick(1/60,a);if(b.hit)hit=1;}Math.random=R0;
  ok(hit&&(a.dmg.eng>0.2||a.dmg.wing>0.1),'пролёт сквозь стаю: '+(a.dmg.eng>0.2?'птица в винт, мотор '+Math.round(a.dmg.eng*100)+'%':'птица в крыло'));
  // дождь: мокрое поле — пробег длиннее
  const roll=(rain)=>{wx.rain=rain;const m=mk(1928,'sport');flPlace(m,0,0,0);m.v=[0,0,22];m.ctl.thr=0;m.ctl.brk=1;let t=0;while(t<60&&(m.Vg===undefined||m.Vg>0.5)&&!m.crash){flStep(m,1/120);t+=1/120;}return m.dist;};
  const dry=roll(0),wet=roll(0.8);ok(wet>dry*1.15,'пробег с тормозами: сухо '+Math.round(dry)+' м, по мокрой траве '+Math.round(wet)+' м');
  FL.wx=null;}
/* ---------- военные конкурсы с оружием ---------- */
{newAirGame('farman','fr','','normal','');const S={seed:3,fields:[{x:0,z:0,r:450}],towns:[],A:{x:0,z:0,y:0,r:450}};FW={H:()=>0,surf:()=>'grass',obst:()=>null,S,sea:false,parts:[]};fwHgt=()=>0;FL.on=true;FL.t=0;FL.k=1;FL.wx=null;FL.noFail=true;
  const mk2=(y,role,arm)=>{G.y=y;G.m=4;const t=tNow(G);const d=airRefMd(role,t);const md=airNewModel(G,{...d,role,name:'Опытный',a:arm||d.a},{status:'prod',flown:1});md.flown=1;md.status='prod';const ev=airTrialNew(G,role,'fr',12,18,0);G.air.trials=[];
    const P=airBestPilot(G);const M=flMission({kind:'trial',md,pil:P,ev});FL.mi=M;const me=flCraft(md,t,{});FL.me=me;FL.meMesh={len:7,span:10,hit:[]};if(M.init)M.init();return {M,me,md};};
  const b=mk2(1913,'bomb','w8');ok(b.M.bombs&&b.M.tg&&b.M.objs.some(o=>o.k==='aerotarget')&&/Бомбометание/.test(b.M.goal())===false&&b.M.goal().includes('Подъём'),'бомбардировщик 1913: в программе аэро-мишень, сначала подъём: '+b.M.goal().replace(/<[^>]+>/g,' ').trim().slice(0,60));
  b.M.task=2;ok(/Бомбометание/.test(b.M.goal())&&b.M.target()[3]==='аэро-мишень','третье задание — бомбометание, маркер на мишень');
  // сброс: с 200 м над целью, с попутной скоростью 25 м/с — бомба летит вперёд ~160 м; сброс точно над кругом — промах; с упреждением — в круг
  const drop=(dx,h)=>{const me=b.me;flPlace(me,b.M.tg.x+dx,b.M.tg.z,0,{h,v:25,thr:0.8});me.v=[0,0,25];b.M.drops=[];b.M.bombT=0;b.M.bombsLeft=1;FL.bomb=true;let miss=null;frBombs(1/60,b.M,me,(d)=>{miss=d;});FL.bomb=false;let n=0;while(miss===null&&n++<3000)frBombs(1/60,b.M,me,(d)=>{miss=d;});return miss;};
  const m0=drop(0,200),m1=drop(0,200);ok(m0>100&&m0<200,'сброс точно над мишенью с 200 м — бомба перелетает на '+Math.round(m0)+' м (нужно упреждение)');
  let best=1e9,bestDx=0;for(let dx=-60;dx>=-220;dx-=20){b.me.p[2]=b.M.tg.z+dx;const mm=(()=>{const me=b.me;flPlace(me,b.M.tg.x,b.M.tg.z+dx,0,{h:200,v:25,thr:0.8});me.v=[0,0,25];b.M.drops=[];b.M.bombT=0;b.M.bombsLeft=1;FL.bomb=true;let miss=null;frBombs(1/60,b.M,me,(d)=>{miss=d;});FL.bomb=false;let n=0;while(miss===null&&n++<3000)frBombs(1/60,b.M,me,(d)=>{miss=d;});return miss;})();if(mm<best){best=mm;bestDx=dx;}}
  ok(best<15,'с упреждением '+(-bestDx)+' м — в круг: промах '+Math.round(best)+' м');
  const f=mk2(1916,'fight','w5');ok(f.M.guns&&f.M.gtg&&f.me.gun&&f.me.gun.ammo===60&&f.M.objs.some(o=>o.k==='sheet'),'истребитель 1916 с синхронным пулемётом: стрельба по щиту, 60 патронов');
  const f2=mk2(1916,'fight','w2');ok(!f2.M.guns&&f2.M.sc.noGun,'истребитель без курсового пулемёта — стрельбу не зачтут (оценка снижена)');
  const r=mk2(1913,'recon','w0');ok(r.M.pts&&r.M.pts.length===3&&r.M.objs.filter(o=>o.k==='camp').length>=2&&r.M.objs.some(o=>o.k==='aa'),'разведчик 1913: три цели для съёмки — лагерь, батарея, обоз');
  r.M.task=2;const q=r.M.pts[0];flPlace(r.me,q.x,q.z,0,{h:400,v:30,thr:0.8});r.M.tUp=0;FL.t=100;r.M.step(1/60,[q.x,400,q.z]);ok(q.ok===1&&/снято 1 из 3/.test(r.M.goal()),'пролёт над лагерем на 400 м — снимок: '+r.M.goal().replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,90));
  const r0=mk2(1910,'recon','w0');ok(!r0.M.pts&&r0.M.goal().includes('из 3'),'1910 год: оружия в программе ещё нет — три задания');
  FL.on=false;FL.me=null;FL.mi=null;}
/* ---------- герои России: Гаккель и Григорович ---------- */
{const L=ngHeroList('air','ru').map(h=>h.k);ok(L.includes('gakkel')&&L.includes('grigorovich')&&L.includes('sikorsky'),'авиаторы России: '+L.join(', '));
  newAirGame('grigorovich','ru','','normal','');const md=G.air.models[0],st=airStats(md,tNow(G));ok(G.y===1913&&md.role==='sea'&&st.sea&&md.status==='proto','Григорович: 1913 год, первая машина — летающая лодка «'+md.name+'» ('+Math.round(st.v)+' км/ч)');
  ok(sagaList(G).length===6&&sagaList(G)[0].id==='gr1'&&sagaList(G)[0].sc.every(x=>!/\{/.test(x.say||x.line||'')),'сюжет Григоровича: 6 глав, тексты без подстановок');
  ok(Math.abs(bn('airSea')-1.08)<1e-9,'черта героя: лодки +8% ('+bn('airSea').toFixed(2)+')');
  newAirGame('gakkel','ru','','normal','');const m2=G.air.models[0];ok(G.y===1910&&m2.name==='Гаккель-III'&&!airHeroFlies(G)&&airBestPilot(G),'Гаккель: 1910 год, «Гаккель-III», сам не летает — машину поднимет лётчик '+airBestPilot(G).n);
  ok(sagaList(G).length===5&&sagaList(G).every(ch=>ch.o&&ch.o.length===3&&ch.q),'сюжет Гаккеля: 5 глав, в каждой вопрос и три ответа');}
console.log(bad?'ОШИБОК: '+bad:'всё в порядке');if(bad)process.exitCode=1;
}`);
