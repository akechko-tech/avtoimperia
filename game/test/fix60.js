// 0.60 — правки по замечаниям автора 28 ноября 2026 (claude/tz-0.60-zamechaniya-28-11.md)
// node game/test/fix60.js
require('./harness.js')(`
let ok=0,bad=0;const CK=(c,m)=>{if(c)ok++;else{bad++;console.log("FAIL",m);}};
const seed=k=>{let a=k;Math.random=()=>{a=(a*16807)%2147483647;return a/2147483647;};};
const at=(s,y,m)=>{s.y=y;s.m=m||0;};
/* ---------- 1. оснащение новой модели не теряется ---------- */
{seed(281);newGame('ford','us','','normal','Оснащение');const s=G;s.pending=[];at(s,1943,11);s.cash=1e9;
  openDesigner('middle');draft.eq=['ws','el','st','sp','kl','wp'];const n0=s.models.length;ACT.startdev();
  const md=s.models[s.models.length-1];
  CK(s.models.length===n0+1&&md.status==='dev','модель начата из конструктора');
  CK(['ws','el','st','sp','kl','wp'].every(id=>eqHas(md,id)),'оснащение из конструктора — в модели: '+eqOf(md).join(','));
  const x=JSON.parse(JSON.stringify(s));eqMigrate(x);const m2=x.models.find(m=>m.id===md.id);
  CK(m2&&m2.eq.length===6,'после сохранения оснащение на месте');
  md.status='prod';md.launched=mi(s);
  const H=hiddenTerms(md,s),e=H.L.find(z=>z.id==='eq');
  CK(!e||e.d>=0,'у новой модели нет строки «Нет того, что ждут покупатели»'+(e?' — '+e.txt:''));}
/* ---------- 1. ацетиленовые фары в 1944 году не ждут ---------- */
{const s={y:1944,m:1,country:'us'};const ac=EQ_BY.ac;
  CK(eqObs(ac,'middle',1944)&&!eqObs(ac,'middle',1912),'ацетиленовые фары: в 1944 году их сменило электрическое освещение, в 1912-м — ещё нет');
  CK(!eqExpected('middle',1944).some(e=>e.id==='ac')&&eqExpected('middle',1944).some(e=>e.id==='el'),'в 1944 году средний класс ждёт электрический свет, а не ацетилен');}
/* ---------- 1. кнопка «Поставить оснащение» ---------- */
{seed(282);newGame('ford','us','','normal','Оснащение');const s=G;s.pending=[];at(s,1943,11);s.cash=1e9;
  openDesigner('middle');draft.eq=[];ACT.startdev();const md=s.models[s.models.length-1];md.status='prod';md.launched=mi(s);
  const H0=hiddenTerms(md,s),e0=H0.L.find(z=>z.id==='eq');
  CK(e0&&e0.d<-0.5&&!/ацетилен/.test(e0.txt),'модель без оснащения: строка есть, ацетилена в ней нет — '+(e0&&e0.txt));
  const P=eqFitPlan(md,s);CK(P&&P.add.includes('el')&&P.add.includes('st')&&!P.L.includes('ac')&&P.cost>0,'план доустановки: '+(P&&P.add.join(','))+' за '+(P&&P.cost));
  const html=hiddenHTML(md,s);CK(/data-act="eqFit"/.test(html),'в карточке кнопка «Поставить оснащение»');
  const nm='«'+md.name+'»',tips=adviceList(s).filter(t=>t.icon==='🔦'&&t.text.includes(nm));CK(tips.length===1,'совет помощника о недостающем оснащении');
  const c0=s.cash;ACT.eqFit({id:md.id});
  CK(eqHas(md,'el')&&eqHas(md,'st')&&s.cash===c0-P.cost&&md.ramp>=1,'оснащение поставлено, деньги списаны, месяц перехода');
  const e1=hiddenTerms(md,s).L.find(z=>z.id==='eq');CK(!e1||e1.d>-0.05,'после доустановки покупатели не наказывают');
  CK(!adviceList(s).some(t=>t.icon==='🔦'&&t.text.includes(nm)),'совет ушёл');
  let err='';try{s.pending=[];step();}catch(x){err=x.message;}CK(!err,'месяц после доустановки идёт без ошибок '+err);}
/* ---------- 1. легенда и купленная марка — с оснащением ---------- */
{seed(283);newGame('ford','us','','normal','Оснащение');const s=G;s.pending=[];at(s,1925,0);s.cash=1e9;
  const md={id:999,e:'e4',g:'g5',c:'c4',k:'k2',b:'b4',t:'t1',w:'w5',status:'dev',launched:0};const x={y:1925,m:0,country:'us',rd:{},models:[md]};eqMigrate(x);
  CK(Array.isArray(md.eq)&&md.eq.includes('st'),'старое сохранение: модель в разработке без списка оснащения получает оснащение своего года — '+md.eq.join(','));}
/* ---------- 1б. спортивный родстер — в спортивном классе ---------- */
{CK(['b1','b2','b3','b10'].every(bodyOpen)&&!['b4','b5','b9','b11','b6','b7'].some(bodyOpen),'открытые кузова до 1930 года — те же, что в прежнем списке');
  CK(bodyOpen('b35')&&!bodyOpen('b33')&&!bodyOpen('b30')&&!bodyOpen('b36'),'родстер 1948 года — открытый; хардтоп, обтекаемый седан и вездеход — нет');
  const cars=BODIES.filter(b=>!b.closed&&!b.truck&&!b.kind&&!b.moto);CK(cars.every(b=>bodyOpen(b.id)),'у каждого легкового кузова без признака «закрытый» доступна спортивная отделка: '+cars.map(b=>b.id).join(','));
  seed(284);newGame('ford','us','','normal','Родстер');const s=G;s.pending=[];at(s,1950,3);s.cash=1e9;
  openDesigner('sport');ACT.pick({k:'b',v:'b35'});CK(draft.b==='b35'&&draft.t==='t3'&&segOf(draft)==='sport','конструктор: родстер со спортивной отделкой остаётся спортивным');
  const n0=s.models.length;ACT.startdev();const md=s.models[s.models.length-1];CK(s.models.length===n0+1&&md.b==='b35'&&segOf(md)==='sport','новая модель — класс «Спортивный»');
  const x=JSON.parse(JSON.stringify(s));const m2=x.models.find(m=>m.id===md.id);CK(m2&&m2.t==='t3','после сохранения класс тот же');
  openDesigner('sport');ACT.pick({k:'b',v:'b35'});ACT.pick({k:'b',v:'b4'});CK(draft.t==='t2'&&dNote&&/только для открытых/.test(dNote.txt),'закрытый кузов при спортивной отделке: класс сменён с заметкой');
  ACT.pick({k:'t',v:'t3'});CK(bodyOpen(draft.b)&&draft.t==='t3'&&dNote&&/кузов сменён/.test(dNote.txt),'спортивная отделка на закрытом кузове: кузов сменён на открытый с заметкой — '+draft.b);
  const old={...md,id:s.nextId++,t:'t2',status:'prod',launched:mi(s)};s.models.push(old);CK(segOf(old)==='lux'&&sportFixable(old)&&/Перевести в спортивный класс/.test(sportFixLine(old,s)),'старая модель-родстер в «Люксе»: в карточке кнопка перевода');
  const c0=s.cash,c=sportFixCost(old,s);ACT.sportFix({id:old.id});CK(segOf(old)==='sport'&&s.cash===c0-c&&!sportFixable(old),'переведена в спортивный класс за '+c);
  const C=classCompare(old,s,'us');CK(C&&C.S>0.3,'против соперника спортивного класса: '+Math.round(C.S*100)+'%');}
/* ---------- 8. мелочи ---------- */
{CK(relSoft(0.9)===0.9&&relSoft(0.985)===0.985&&relSoft(1.0)>relSoft(0.99)&&relSoft(1.2)<0.995&&relSoft(1.2)>0.994,'надёжность у верхнего края: плавно к 99,5 %, а не ровно 99 %');
  const fa=100*(1-relSoft(1.157*0.95)),fr=100*(1-relSoft(0.998*0.95));CK(fr/fa>1.3,'детали лучше — ломается реже и у края: '+fa.toFixed(2)+' против '+fr.toFixed(2)+' из 100');
  const F={r12:12e6};CK(ownLicFee({},F,{k:'e'})===12000&&ownLicFee({},F,{k:'w'})<ownLicFee({},F,{k:'c'})&&ownLicFee({},F,{k:'c'})<12000,'лицензия: мотор дороже рамы, рама дороже шин');
  CK(ownLicFee({},F)===12000,'без узла — прежняя плата');
  CK(/вашей марки/.test(refOwnTag({pioneer:'ford'},'Ford V-8'))&&!refOwnTag({pioneer:'ford'},'Chevrolet 490')&&/вашей марки/.test(refOwnTag({pioneer:'leland'},'Cadillac V-16')),'эталон — историческая машина марки игрока: подпись');
}
{seed(285);global.BOTS_OFF=false;newGame('ford','us','','normal','Война');const s=G;s.pending=[];at(s,1942,5);s.cash=1e8;let err='',nm=0;
  try{for(let k=0;k<12;k++){s.pending=[];s.cash=Math.max(s.cash,1e8);step();const R=s.last&&s.last.riv||[];nm+=R.filter(o=>o.c==='us'&&o.k==='model'&&!o.mo&&!o.kf).length;}}catch(x){err=x.message;}
  CK(!err,'год войны с живыми соперниками идёт без ошибок '+err);CK(nm===0,'в войну фирмы США не выводят новых легковых моделей: '+nm);global.BOTS_OFF=true;}
/* ---------- итог ---------- */
console.log('fix60: '+ok+' ок, '+bad+' ошибок');if(bad)process.exitCode=1;
`);
