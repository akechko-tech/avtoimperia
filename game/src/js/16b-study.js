/* ================= RIVAL TECH: машины конкурентов в КБ и «подтягивание» к массовым технологиям ================= */
// Купить машину-эталон класса (с ней покупатели сравнивают ваши машины) и разобрать её в КБ:
// детали, которых ещё нет у поставщиков, — прототипом; доводку соперников — улучшениями; опыт — дешёвой разработкой.
const STUDY_KINDS=['people','middle','lux','sport','van','truck'];
function studyCar(kind,y){if(kind==='sport'&&y<1910)return null;if(kind==='truck'&&y<1910)return null;if(kind==='van'&&y<1896)return null;
  const r=rivalCar(kind,y);return r?{kind,y:r[0],name:r[1],md:{...r[2],t:KIND_TRIM[kind]||'t0'}}:null;}
function studyKey(c){return c.name+'|'+c.y;}
function studyPrice(c,s){const g=c.kind==='van'||c.kind==='truck'?'truck':c.kind,b=byId(BODIES,c.md.b);
  return Math.round(prefP(g,s.country,s)*(b&&b.truck?Math.pow((b.pay||1.5)/1.5,0.6):1)*1.15/10)*10;}
const STUDY_NEED=6;
function studyList(s){const out=[];
  STUDY_KINDS.forEach(kind=>{const c=studyCar(kind,s.y);if(!c||out.some(o=>o.name===c.name))return;
    c.done=((s.rd.studied)||[]).includes(studyKey(c));c.busy=rdActive(s).some(p=>p.kind==='study'&&p.name===c.name);c.price=studyPrice(c,s);out.push(c);});
  return out;}
function studyPartsLine(md){const p=parts(md);return `${p.e.name}, ${p.g.name.toLowerCase()}, ${p.c.name.toLowerCase()}, тормоза: ${p.k.name.toLowerCase()}, ${p.w.name.toLowerCase()}`;}
// Что найдёт КБ: будущие детали (есть у соперника раньше, чем у поставщиков) и доводку, до которой вы ещё не дошли
function studyGain(c,s){const fut=[],ups=[];const rl=clamp(0.3*(s.y-c.y),0,2.5)+copyExtra(c.kind);
  PART_KEYS.forEach(k=>{const x=byId(PART_CATS.find(q=>q.k===k).arr(),c.md[k]);if(x&&x.y>s.y&&!s.rd.early.includes(x.id))fut.push(x);});
  ['e','c','k','g','w','b'].forEach(k=>{const x=byId(PART_CATS.find(q=>q.k===k).arr(),c.md[k]);if(x&&ups.length<2&&upgL(x.id)<Math.floor(rl)&&upgL(x.id)<rdMaxUpg(s))ups.push(x);});
  return {fut,ups};}
function studyStart(s,kind){const c=studyCar(kind,s.y);if(!c)return false;const L=studyList(s).find(o=>o.name===c.name);
  if(!L||L.done||L.busy||rdActive(s).length>=rdSlots(s)||s.cash<L.price)return false;
  s.cash-=L.price;s.rd.projs.push({kind:'study',id:kind,y:c.y,name:c.name,cat:'Машина конкурента',need:STUDY_NEED,prog:0});
  addLog(`Куплен ${c.name} (${money(L.price)}): КБ разбирает машину конкурента.`,'good');return true;}
function studyDone(s,pj){
  const c=studyCar(pj.id,pj.y)||{kind:pj.id,y:pj.y,name:pj.name,md:null};if(!c.md)return;
  const rd=s.rd;rd.studied=rd.studied||[];if(!rd.studied.includes(studyKey(c)))rd.studied.push(studyKey(c));
  rd.know=rd.know||{};rd.copied=rd.copied||{};rd.ins=rd.ins||{};
  const G0=studyGain(c,s);
  G0.fut.forEach(x=>{rd.early.push(x.id);rd.copied[x.id]=1;});
  G0.ups.forEach(x=>{rd.upg[x.id]=(rd.upg[x.id]||0)+1;});
  PART_KEYS.forEach(k=>{rd.know[c.md[k]]=1;});
  rd.ins[c.kind]=mi(s)+36;
  const best=s.models.filter(m=>(m.status==='prod'||m.status==='sale')&&designKind(m)===c.kind).map(m=>({m,C:classCompare(m,s)})).sort((a,b)=>b.C.S-a.C.S)[0];
  const cmp=best&&best.C.ref.name===c.name?`Сравнение с вашей «${best.m.name}» (100% — как у ${c.name}): `+CHAR_K.filter(k=>best.C.W[k]>0).map(k=>`${CHAR_NAMES[k].toLowerCase()} — ${Math.round(best.C.by[k]*100)}%`).join(', ')+'.':'';
  addLog(`КБ разобрало ${c.name}: ${[G0.fut.length?'новые детали — '+G0.fut.map(x=>x.name).join(', '):'',G0.ups.length?'доводка — '+G0.ups.map(x=>x.name+' ★'+upgL(x.id)).join(', '):''].filter(Boolean).join('; ')||'изучены все узлы'}.`,'good');
  pendingToasts.push('🔍 Изучен '+c.name);
  pushEvent({own:1,kicker:'Конструкторское бюро',title:`КБ разобрало ${c.name}`,deck:`Машина соперников ${c.y} года — до последнего винтика`,img:IMG[c.name]?c.name:'',imgCap:`${c.name}, ${c.y}`,
    text:`Инженеры «${s.company}» купили ${c.name} и разобрали его на верстаках: ${studyPartsLine(c.md)}.\n`+
      (G0.fut.length?`Главная находка — ${G0.fut.map(x=>x.name).join(', ')}: у поставщиков такого ещё нет, а теперь КБ умеет делать это само. Деталь уже в конструкторе.\n`:'')+
      (G0.ups.length?`Соперники годами доводили свою машину — эту доводку КБ переняло: ${G0.ups.map(x=>x.name+' ★'+upgL(x.id)).join(', ')}.\n`:'')+
      `Улучшать изученные детали теперь на 40% быстрее. Новую машину класса «${KIND_NAME[c.kind]}» три года можно разрабатывать на 20% дешевле и на месяц быстрее.`+(cmp?'\n'+cmp:'')},true);
}
// Новая модель в изученном классе: разработка дешевле и быстрее
function studyIns(md,s){s=s||G;const I=s&&s.rd&&s.rd.ins;if(!I)return false;const k=designKind(md);return (I[k]||0)>mi(s);}

/* ---------- «подтягивание»: массовые технологии осваивать проще ---------- */
// Детали, которые соперники ставят на свои машины уже не первый год: чертежи и мастера есть на рынке — улучшать их на 20% быстрее
function massParts(y){const S=new Set();STUDY_KINDS.forEach(kind=>{const r=rivalCar(kind,y);if(!r)return;PART_KEYS.forEach(k=>{const x=byId(PART_CATS.find(q=>q.k===k).arr(),r[2][k]);if(x&&x.y<=y-2)S.add(x.id);});});return S;}
function upgCatchK(s,id,MU){return (s.rd.know&&s.rd.know[id]?0.6:1)*((MU||massParts(s.y)).has(id)?0.8:1);}
// Заводские технологии, которые в истории уже стали обычными: станки, мастера и консультанты есть на рынке — внедрение дешевле и быстрее
function techCatch(s,k){const nx=techNext(s,k);if(!nx)return 1;const hy=Math.max(nx.y,nx.hist?nx.hist[0]:0),yrs=s.y-hy;return yrs>=2?clamp(1-0.07*(yrs-1),0.55,1):1;}
function techMonths(s,k){return techCatch(s,k)<=0.86?2:3;}
// Соперники тоже разбирают ваши машины: если ваша модель намного лучше и хорошо продаётся, её устройство копируют
function copyExtra(kind){const C=G&&G.copy;return (C&&C[kind])||0;}
function rivalsCopy(s){s.copy=s.copy||{};s.copySaid=s.copySaid||{};const Y=s.segYPrev||{},YT=s.segYTPrev||{},D=DIF(),mx=Math.min(1,0.55*(D.rvMax||1.3)),step=0.2*(D.rvRate||1);
  STUDY_KINDS.forEach(kind=>{const g=kind==='van'||kind==='truck'?'truck':kind,cur=s.copy[kind]||0;
    const best=s.models.filter(m=>(m.status==='prod'||m.status==='sale')&&designKind(m)===kind).map(m=>({m,S:classScore(m,s)})).sort((a,b)=>b.S-a.S)[0];
    const sh=(YT[g]||0)>0?(Y[g]||0)/YT[g]:0;
    if(best&&best.S>=1.15&&sh>=0.15){s.copy[kind]=Math.min(mx,cur+step);
      if(cur===0&&mi(s)-(s.copySaid[kind]??-99)>=48&&!s.pending.length){s.copySaid[kind]=mi(s);
        pushEvent({kicker:'Рынок',title:`Конкуренты разбирают «${best.m.name}»`,deck:'Лучшую машину класса копируют',carId:best.m.id,
          text:`«${best.m.name}» — ${Math.round((best.S-1)*100)}% впереди соперников класса, и её покупает каждый ${Math.max(2,Math.round(1/Math.max(0.01,sh)))}-й покупатель. Конкуренты купили несколько машин, разобрали и перенимают устройство: их новые машины станут лучше, преимущество начнёт таять.\nТак было всегда: то, что стало массовым, быстро осваивают все. Держитесь впереди — улучшения КБ, прототипы и новые модели.`},true);}}
    else s.copy[kind]=Math.max(0,+(cur-0.2).toFixed(2));});}
