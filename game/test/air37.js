// 0.37: путь «Авиатор» — фильмы авиаторов (свой и одиннадцать героев), фото авиации, полёт: взлёт, скорость, брошенная ручка, посадка
require('./harness.js')(`{
let bad=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)bad++;};
/* ---------- фильмы ---------- */
const heroes=Object.keys(PIONEERS).filter(k=>PIONEERS[k].air);
ok(heroes.length===11,'героев-авиаторов: '+heroes.length);
heroes.forEach(k=>ok(Array.isArray(SAGA[k])&&SAGA[k].length>=5,'фильм у героя '+k+': глав '+(SAGA[k]||[]).length));
ok(Array.isArray(SAGA.air)&&SAGA.air.length>=8,'свой авиатор: глав '+(SAGA.air||[]).length);
const okFx=new Set(['cash','afame','b','abroad','rep']);let errs=[];
const chk=(ch,lab)=>{if(!(ch.sc||[]).length)errs.push(lab+': нет сцен');(ch.sc||[]).forEach((x,i)=>{if(!x.say&&!x.line)errs.push(lab+' sc'+i+': нет текста');if(x.who&&!x.line)errs.push(lab+' sc'+i);});
  if(!ch.q||(ch.o||[]).length!==3)errs.push(lab+': вопрос/ответы');(ch.o||[]).forEach((o,i)=>{if(!o.t||!o.res)errs.push(lab+' o'+i);Object.keys(o.fx||{}).forEach(f=>{if(!okFx.has(f))errs.push(lab+' fx '+f);});Object.keys((o.fx||{}).b||{}).forEach(b=>{if(!SAGA_B[b])errs.push(lab+' b '+b);});});};
['air'].concat(heroes).forEach(k=>{const ids=new Set();SAGA[k].forEach(ch=>{if(ids.has(ch.id))errs.push(k+': повтор '+ch.id);ids.add(ch.id);chk(ch,k+'/'+ch.id);(ch.v||[]).forEach((v,j)=>{if(typeof v.if!=='function')errs.push(k+'/'+ch.id+' v'+j+': нет if');chk({...ch,...v},k+'/'+ch.id+' v'+j);});
  if(k!=='air')[ch].concat(ch.v||[]).forEach(c=>(c.sc||[]).forEach(x=>{if(/[{}]/.test(x.say||x.line||''))errs.push(k+'/'+ch.id+': подстановка у героя — живой голос не прочтёт');}));});});
ok(!errs.length,'главы собраны правильно'+(errs.length?': '+errs.slice(0,5).join('; '):''));
// эффекты выбора пишутся по-русски, в том числе авиационные множители
newAirGame('bleriot','fr','','normal','');
ok(/разработка быстрее на 10%/.test(sagaFxText({b:{airDev:[0.9,12]}},G)),'текст эффекта: разработка аэропланов быстрее');
ok(/слава авиатора \\+3/.test(sagaFxText({afame:3},G))&&/военные заказы \\+12%/.test(sagaFxText({b:{airMil:[1.12,36]}},G)),'текст эффекта: слава авиатора и военные заказы');
{const f0=G.air.fame;sagaApply(G,{afame:4,b:{airQ:[1.05,24]}});ok(G.air.fame===f0+4&&Math.abs(bn('airQ')/(PIONEERS.bleriot.b.airQ||1)-1.05)<1e-9,'выбор в фильме меняет славу и качество аэропланов (bn airQ)');}
{newAirGame('fokker','de','','normal','');G.y=1919;G.m=9;sagaApply(G,{abroad:1});ok(G.air.abroad===1,'«Вывезти завод в Голландию»: сборка за границей, Версаль не остановит авиацех');}
// главы приходят по порядку и вовремя у каждого героя; у своего авиатора в России — советские варианты
for(const h of heroes.concat(['custom'])){newAirGame(h,h==='custom'?'ru':PIONEERS[h].c,'','normal','');const s=G,L=sagaList(s);let order=[],guard=0;
  while(s.y<1930&&guard++<400){sagaCheck(s);const p=s.pending.find(x=>x.saga);if(p){order.push(p.saga);sagaAuto(s,p.saga);}s.m++;if(s.m>11){s.m=0;s.y++;}
    if(h==='sikorsky'&&s.y===1918&&s.m===0&&!s.emig&&!s.soviet)s.emig={from:'ru',to:'us',y:1918,m:0};if(h==='custom'&&s.y===1918&&s.m===6&&!s.soviet)s.soviet={t:mi(s),sub:0};}
  const want=L.map(c=>c.id).join(',');ok(order.join(',')===want,h+': все главы по порядку ('+order.length+' из '+L.length+')');
  if(h==='custom'){const v=sagaChapter(s,SAGA.air.find(c=>c.id==='air9'),false);ok(v.t==='Великий перелом','свой авиатор остался в Советской России — 1929 год: «'+v.t+'»');}}
{newAirGame('sikorsky','ru','','normal','');G.y=1923;G.m=6;G.emig={from:'ru',to:'fr',y:1918,m:1};const c=sagaChapter(G,SAGA.sikorsky.find(c=>c.id==='si7'),false);ok(c.t==='На чужбине','Сикорский уехал во Францию — не Лонг-Айленд, а «'+c.t+'»');
  G.emig.to='us';G.saga.var={};const c2=sagaChapter(G,SAGA.sikorsky.find(c=>c.id==='si7'),false);ok(c2.t==='Ферма на Лонг-Айленде','Сикорский в Америке — «'+c2.t+'»');}
{newAirGame('bleriot','fr','','normal','');G.air.ev={'channel-1909':{place:1}};const c=sagaChapter(G,SAGA.bleriot.find(c=>c.id==='bl2'),false);ok(/Дувра/.test(c.sc.map(x=>x.say||x.line).join(' ')),'Блерио перелетел Ла-Манш в игре — фильм о Дувре');
  G.air.ev={};G.saga.var={};const c2=sagaChapter(G,SAGA.bleriot.find(c=>c.id==='bl2'),false);ok(/так и не поднялся/.test(c2.sc.map(x=>x.say||x.line).join(' ')),'не перелетел — фильм не врёт');}
// голос: женские роли — женским голосом, «Эмиль» — мужским
ok(voiceOfWho('Алиса Блерио')==='xenia'&&voiceOfWho('Эми Джонсон')==='xenia'&&voiceOfWho('Кэтрин Райт')==='xenia'&&voiceOfWho('Эмиль Еллинек')==='eugene','голоса ролей: Алиса, Эми, Кэтрин — женские, Эмиль — мужской');
/* ---------- фото: аэропланы, лётчики, кадры фильмов ---------- */
{const T=allTitles();['Louis Blériot','Blériot XI','Fokker D.VII','Sopwith Camel','Hubert Latham','Sikorsky Ilya Muromets','Junkers F 13','Grande Semaine d\\'Aviation de la Champagne'].forEach(t=>ok(T.includes(t),'фото в списке: '+t));}
/* ---------- полёт: каждый исторический аэроплан ---------- */
FL.noFail=true;const land={H:()=>30,surf:()=>'grass',obst:()=>null},sea={H:()=>-5,surf:()=>'water',obst:()=>null};const dt=1/120;let n=0,fails=[];
for(const role of ['sport','race','fight','recon','bomb','sea','pax'])for(const e of (AIR_RIVAL[role]||[])){if(e[0]>1930)continue;const t=e[0],md={...e[2],role,name:e[1]},st=airStats(md,t);globalThis.FW=st.sea?sea:land;n++;
  const ac=flCraft(md,t,{rnd:()=>0.3});flPlace(ac,0,0,0,null);ac.ctl.thr=1;let T=0;
  while(ac.gnd&&T<90&&!ac.crash){if(st.sea||ac.gr.gp<0.05)ac.ctl.sy=ac.V>ac.Vs*0.9?0.9:0;flStep(ac,dt);T+=dt;}
  if(ac.gnd||ac.crash){fails.push(e[1]+': не взлетел ('+(ac.crash||'разбег '+Math.round(ac.dist)+' м')+')');continue;}
  ac.ctl.sy=0;ac.ctl.sx=0;const y0=ac.p[1];let mn=0;for(let i=0;i<120*20&&!ac.crash;i++){flStep(ac,dt);mn=Math.min(mn,ac.p[1]-y0);}
  if(ac.crash||mn<-25)fails.push(e[1]+': брошенная ручка — потеря высоты '+Math.round(-mn)+' м');
  for(let i=0;i<120*40&&!ac.crash;i++){flAuto(ac,{hdg:0,alt:y0+300,thr:1});flStep(ac,dt);}
  const a0=ac.p[1];for(let i=0;i<120*60&&!ac.crash;i++){flAuto(ac,{hdg:0,alt:a0,thr:1});flStep(ac,dt);}
  const v=ac.V*3.6;if(Math.abs(v/st.v-1)>0.08)fails.push(e[1]+': скорость '+Math.round(v)+' км/ч, по расчёту '+Math.round(st.v));}
ok(n>=40&&!fails.length,'исторические аэропланы ('+n+'): взлёт, брошенная ручка, скорость по расчёту'+(fails.length?' — '+fails.slice(0,6).join('; '):''));
console.log(bad?'ОШИБОК: '+bad:'всё в порядке');if(bad)process.exitCode=1;
}`);
