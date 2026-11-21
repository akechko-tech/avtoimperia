/* ================= 0.51, этап 6: МИРОВЫЕ РЕКОРДЫ И РЕКОРДНЫЙ ОБРАЗЕЦ =================
   Автор (тема 6 ТЗ): состязания с лошадью и поездом оживляют начало, потом эта тема исчезает; рекорды были медийным событием
   и работали на марку; можно строить особые образцы именно под рекорд — за деньги и время КБ.
   До этого этапа рекорд был только поводом для пари с соперником («спор о скорости», мерная миля у мотоциклов), а проезд быстрее
   мирового рекорда давал «неофициальный рекорд». Теперь:
     • таблица мировых рекордов на всю эпоху: скорость на суше (1898–1929), суточный рекорд (с 1907 года), скорость мотоцикла;
       рекорды авиации — в «Небе», как раньше;
     • попытку объявляет сам игрок, когда захочет: расчёт по машине, гонщику и удаче; итог — газета, шкаф трофеев, слава марки на годы;
     • рекордный образец — особый проект КБ, не для продажи: два мотора или авиамотор, обтекаемый кузов; дорогой, долгий, с риском;
     • соперники берут рекорды по истории: рекорд игрока можно потерять — и газеты об этом напишут.
   Образцы и источники — claude/issledovanie-rekordy-ispytaniya-0.51.md. */
// суточный рекорд, средняя скорость за 24 часа (км/ч): [год+месяц/12, км/ч, кто]
const H24=[[1905.9,73.4,'National (Индианаполис)'],[1907.49,106.1,'Селвин Эдж (Napier, Бруклендс)'],[1924.95,130.8,'AC (Монлери)'],[1925.5,141.0,'Renault 40 CV (Монлери)'],
  [1926.55,173.6,'Renault 40 CV (Монлери)'],[1927.72,183.8,'Voisin (Монлери)']];
const REC_CLS={
  lsr:{n:'Рекорд скорости на суше',un:'км/ч',ic:'🏁',y0:1898,cool:6,boostM:36,boost:0.2,rep:4,where:y=>y<1904?'Ашер под Парижем':y<1922?'Ормонд-Бич, Флорида':y<1927?'пески Пендайна, Уэльс':'Дейтона-Бич, Флорида'},
  h24:{n:'Суточный рекорд',un:'км/ч в среднем',ic:'⏱',y0:1906,cool:6,boostM:18,boost:0.2,rep:3,where:y=>y<1907?'Индианаполис':y<1924?'Бруклендс':'автодром Монлери'},
  mlsr:{n:'Рекорд скорости мотоцикла',un:'км/ч',ic:'🏍',y0:1903,cool:6,boostM:24,boost:0.2,rep:2,where:y=>y<1920?'Ормонд-Бич, Флорида':'Арпажон под Парижем'}};
const REC_ENG={one:{n:'Свой мотор, доведённый',pk:1.15,kg:1,rel:0.82,need:0},two:{n:'Два своих мотора',pk:2.25,kg:1.35,rel:0.68,need:5,y:1904},ae:{n:'Авиамотор',pk:0,kg:1,rel:0.72,need:5,y:1919}},
  REC_BODY={std:{n:'Гоночный кузов',kd:0.92,need:0},stream:{n:'Обтекаемый кузов',kd:0.7,need:4,xp:20,y:1924}};
function recT(s){return s.y+s.m/12;}
function recHist(k,t){const L=k==='lsr'?LSR:k==='h24'?H24:null;if(k==='mlsr'){const v=mrecWR(t);return v>0?[Math.floor(t),v,'']:null;}let r=null;L.forEach(x=>{if(x[0]<=t)r=x;});return r;}
function recMine(s,k){const R=s.rec&&s.rec[k];return R&&!R.lost?R:null;}
// кому принадлежит рекорд сейчас
function recCur(s,k){const h=recHist(k,recT(s)),m=recMine(s,k);return m&&(!h||m.v>=h[1])?{v:m.v,who:m.who,mine:1}:h?{v:h[1],who:h[2]||'по сводке Международной федерации'}:{v:0,who:'—'};}
// прежние ступени рекорда — строкой календаря
function recPast(k,t){const L=k==='lsr'?LSR:k==='h24'?H24:null;if(!L)return '';const P=L.filter(x=>x[0]<=t).slice(-4,-1).reverse();return P.length?`<br>Раньше: ${P.map(x=>`${Math.floor(x[0])} — ${fmtN(x[1])} (${esc(x[2])})`).join('; ')}`:'';}
/* ---------- рекордный образец: проект КБ ---------- */
function recSolve(P,kd,crr,m){let v=20;for(let i=0;i<40;i++){const f=kd*v*v*v+crr*m*9.81*v-P,df=3*kd*v*v+crr*m*9.81;v=Math.max(3,v-f/df);}return v;}
// основа — самая быстрая своя автомобильная модель (в серии или в КБ)
function recBase(s){let b=null;(s.models||[]).forEach(m=>{if(isMoto(m)||isTruck(m)||!(m.status==='prod'||m.status==='sale'||m.status==='dev'))return;let st=null;try{st=carStats(m,2,s.y);}catch(_){return;}if(!b||st.vmax>b.st.vmax)b={m,st};});return b;}
function recAero(s){if(typeof AIR_ENG==='undefined')return null;const t=tNow(s);let b=null;AIR_ENG.forEach(e=>{if(e.y>t||e.race)return;if(!e.own&&!(s.air&&s.air.lv))return;try{if(!airPartOk(s,e,'e'))return;}catch(_){return;}if(!b||e.hp>b.hp)b=e;});return b;}
function recOptOk(s,kind,id){const o=(kind==='eng'?REC_ENG:REC_BODY)[id];if(!o)return 'нет';if(o.y&&s.y<o.y&&!(o.xp!=null&&xpOf(s,'aero')>=o.xp+20))return o.xp!=null?`с ${o.y} года или с опытом «Аэродинамика» ${o.xp+20}`:`с ${o.y} года`;
  if(o.xp!=null&&xpOf(s,'aero')<o.xp&&s.y<(o.y||0)+3)return `нужен опыт «Аэродинамика» ${o.xp}`;if(id==='ae'&&!recAero(s))return 'авиамотор — у марки с авиацией или своим авиамотором';return '';}
function recBuild(s,sp){const B=recBase(s);if(!B)return null;const ae=sp.eng==='ae'?recAero(s):null,E=sp.eng==='ae'&&!ae?REC_ENG.one:REC_ENG[sp.eng]||REC_ENG.one,Bd=REC_BODY[sp.body]||REC_BODY.std,st=B.st;
  let P=st.P*E.pk,kg=st.kg*E.kg,hp=st.hp*E.pk;if(ae){const k=ae.hp/Math.max(1,st.hp);P=st.P*k;hp=ae.hp;kg=st.kg+ae.kg*1.25;}
  kg*=Bd===REC_BODY.stream?1.05:1;const v=recSolve(P,st.kd*Bd.kd,st.crr,kg),rel=clamp(E.rel-(Bd===REC_BODY.stream?0.03:0)+0.1*xpOf(s,'eng')/100,0.3,0.95);
  return {base:B.m.id,baseName:B.m.name,eng:sp.eng||'one',body:sp.body||'std',ae:ae?ae.name:'',hp:Math.round(hp),kg:Math.round(kg),v:Math.round(v*3.6*10)/10,rel:+rel.toFixed(2),pc:partCost(parts(B.m).e,s)*(sp.eng==='two'?2:1)+(ae?airEngCost(ae,tNow(s),s):0)};}
function recRdCost(pj,s){s=s||G;return Math.max(Math.round(ownRdCost(pj,s)*1.5/50)*50,Math.round(bizRev(s)*0.003/50)*50);}
function recPreview(s,sp){const x=recBuild(s,sp);if(!x)return {why:'Нужна своя автомобильная модель — в серии или в КБ'};const E=REC_ENG[x.eng],Bd=REC_BODY[x.body],need=Math.round(12+E.need+Bd.need);
  const pj={kind:'rec',id:'rec',ck:'e',cat:'Рекордный образец',name:sp.name||'',need,yrs:0,pc:x.pc*4+1500*cpi(s),sp:{eng:x.eng,body:x.body,name:sp.name||''}},cost=recRdCost(pj,s),cur=recCur(s,'lsr');let why=recOptOk(s,'eng',x.eng)||recOptOk(s,'body',x.body);
  if(!why&&rdActive(s).length>=rdSlots(s))why='В КБ нет свободного места для проекта';else if(!why&&s.cash<cost)why='Не хватает денег';
  return {x,pj,cost,need,why,cur,months:Math.max(1,Math.ceil(need/Math.max(0.01,rdTotal(s)/(rdActive(s).length+1)))),chance:recChance(x.v,cur.v,x.rel,0.8)};}
function recStart(s,sp){const P=recPreview(s,sp);if(!P||P.why||!P.x)return false;s.recN=(s.recN||0)+1;P.pj.name=(sp.name||'').trim().slice(0,40)||`${s.company} Special № ${s.recN}`;P.pj.sp.name=P.pj.name;P.pj.id='rec'+s.recN;return rdBegin(s,P.pj);}
function recDone(s,pj){const x=recBuild(s,pj.sp);if(!x){addLog(`КБ не смогло закончить «${pj.name}»: основы для образца больше нет.`,'bad');return;}s.recCars=s.recCars||[];
  if(pj.short){x.v=Math.round(x.v*0.95*10)/10;x.rel=+(x.rel-0.05).toFixed(2);}   // на испытаниях вышло не по ТЗ
  x.id='rc'+((s.recId=(s.recId||0)+1));x.name=pj.name;x.y=s.y;x.cost=pj.cost||0;s.recCars.push(x);try{xpAdd(s,'aero',5);xpAdd(s,'eng',4);}catch(_){}
  pushEvent({own:1,noArt:1,kicker:'КБ',title:`Рекордный образец готов: «${x.name}»`,deck:`${fmtN(x.hp)} л.с. · расчётная скорость ${fmtN(Math.round(x.v))} км/ч`,
    text:`«${x.name}» выкатили из опытного цеха: ${fmtN(x.hp)} л.с.${x.ae?` авиамотора ${x.ae}`:x.eng==='two'?' двух моторов':''}, ${x.body==='stream'?'обтекаемый кузов, ':''}${fmtN(x.kg)} кг. Расчётная скорость — ${fmtN(Math.round(x.v))} км/ч; мировой рекорд сейчас — ${fmtN(Math.round(recCur(s,'lsr').v))} км/ч (${recCur(s,'lsr').who}).\nПродавать образец нельзя — он построен ради одной мерной мили. Попытку объявляете вы: «Гонки» → «Мировые рекорды».`,choices:[['К рекордам','rec:open'],['Позже','ok']]},true);}
/* ---------- попытка ---------- */
function recChance(v,cur,rel,sk){if(!(v>0))return 0;const fin=clamp(0.5+0.5*rel,0.3,0.97),z=(v*(0.96+0.04*sk)-cur)/(Math.max(1,v)*0.012);return fin*clamp(0.5+z/3.4,0.02,0.98);}
function recDriver(s){const D=(s.drivers||[]).map(id=>DRIVERS.find(d=>d.id===id)).filter(Boolean).sort((a,b)=>b.sk-a.sk)[0];return D?{n:D.n,sk:D.sk,id:D.id}:{n:(PIONEERS[s.pioneer]||{}).name||'испытатель завода',sk:typeof pioSk==='function'?pioSk(s):0.6,id:null};}
function recFee(s,k){return Math.round(Math.max((k==='lsr'?3000:k==='h24'?2000:800)*cpi(s),bizRev(s)*(k==='lsr'?0.0006:k==='h24'?0.0004:0.00015))/100)*100;}
function recWait(s,k){const t=(s.recTry||{})[k];return t==null?0:Math.max(0,t+REC_CLS[k].cool-mi(s));}
// чем идти на рекорд: {v — расчётная скорость, rel — надёжность 0…1, name, car|md}
function recEntry(s,k){if(k==='lsr'){let b=null;(s.recCars||[]).forEach(c=>{if(!c.out&&(!b||c.v>b.v))b=c;});if(b)return {v:b.v,rel:b.rel,name:b.name,car:b.id,special:1};
    const B=recBase(s);if(!B||B.m.status==='dev')return null;return {v:Math.round(B.st.vmax*3.6*10)/10,rel:0.8,name:B.m.name,md:B.m.id};}
  if(k==='h24'){let b=null;(s.models||[]).forEach(m=>{if(isMoto(m)||isTruck(m)||!(m.status==='prod'||m.status==='sale'))return;let st,ch,rf;try{st=carStats(m,1,s.y);ch=charOf(m,s.y);rf=charOf(rivalRef(m,s.y).md,s.y);}catch(_){return;}
      const rel=clamp(0.55*Math.sqrt(ch.mtbf/Math.max(0.1,rf.mtbf)),0.15,0.95),v=st.vmax*3.6*(0.66+0.2*rel);/* сутки на кольце с виражами: надёжной машине гонщик даёт идти ближе к пределу */if(!b||v*(0.4+rel)>b.v*(0.4+b.rel))b={v:Math.round(v*10)/10,rel:+rel.toFixed(2),name:m.name,md:m.id};});return b;}
  const M=mrecBest(s);return M?{v:Math.round(M.v*10)/10,rel:0.8,name:M.m.name,md:M.m.id}:null;}
function recCan(s,k){const C=REC_CLS[k];if(!C||s.y<C.y0)return `с ${C.y0} года`;if(isWar(s.y,s.m,s.country))return 'в войну рекордов не ставят';const w=recWait(s,k);if(w)return `следующая попытка — через ${w} мес.`;
  const E=recEntry(s,k);if(!E)return k==='mlsr'?'нужен мотоцикл в серии':'нужна машина в серии или рекордный образец';if(s.cash<recFee(s,k))return 'не хватает денег на выезд';return '';}
function recTryNow(s,k){if(recCan(s,k))return null;const C=REC_CLS[k],E=recEntry(s,k),D=recDriver(s),cur=recCur(s,k),fee=recFee(s,k),t=mi(s);s.cash-=fee;(s.recTry=s.recTry||{})[k]=t;
  const fin=clamp(0.5+0.5*E.rel,0.3,0.97),where=C.where(s.y),out={k,fee,cur,E,D,where};
  if(Math.random()>fin){out.res='dnf';const crash=Math.random()<0.2;out.crash=crash;if(E.car){const c=s.recCars.find(x=>x.id===E.car);if(c){if(crash)c.out=1;else{const fix=Math.round((c.cost||0)*0.15/100)*100;s.cash-=fix;out.fix=fix;}}}
    if(D.id)try{moodAdd(s,D.id,-6,'Попытка рекорда сорвалась');}catch(_){}
    pushEvent({own:1,noArt:1,kicker:'Попытка рекорда',title:`${C.n}: ${crash?'авария':'машина не выдержала'}`,deck:`«${E.name}» · ${where}`,
      text:`${D.n} на «${E.name}» ${k==='h24'?'сошёл с дистанции задолго до конца суток':'не прошёл мерный участок'}: ${crash?(E.car?'образец разбит и восстановлению не подлежит':'машина разбита')+'. Гонщик цел.':'мотор не выдержал.'}${out.fix?` Ремонт образца — ${money(out.fix)}.`:''}\nРекорд остался прежним: ${fmtN(Math.round(cur.v))} ${C.un} (${cur.who}). Выезд стоил ${money(fee)}; следующая попытка — через ${C.cool} мес.`,choices:[['Ясно','ok']]},true);return out;}
  const v=Math.round(E.v*(0.96+0.04*D.sk)*(0.985+0.03*Math.random())*10)/10;out.v=v;
  if(v>cur.v){out.res='rec';const who=`${D.n} («${E.name}»)`;s.rec=s.rec||{};s.rec[k]={v,who,y:s.y,m:s.m,t,car:E.car||null,md:E.md||null,until:t+C.boostM};
    s.rep=clamp(s.rep+C.rep*bn('raceRep'),0,100);if(s.aw)for(const c in s.aw)s.aw[c]=+Math.min(0.95,(s.aw[c]||0)+(k==='lsr'?0.08:0.04)).toFixed(4);
    if(E.md){const md=s.models.find(m=>m.id===E.md);if(md)md.raceBoost=Math.max(md.raceBoost||0,t+(k==='h24'?12:6));}
    if(D.id)try{moodAdd(s,D.id,15,'Мировой рекорд');}catch(_){}try{xpAdd(s,k==='h24'?'eng':'aero',6);}catch(_){}
    try{trophyAdd(s,{kind:'record',title:`${C.n}: ${fmtN(v)} ${C.un}`,sub:`${D.n} на «${E.name}» · ${where}`,story:`Прежний рекорд — ${fmtN(Math.round(cur.v*10)/10)} ${C.un} (${cur.who}).`,key:'rec|'+k+'|'+t});}catch(_){}
    pushEvent({own:1,noArt:1,kicker:'Мировой рекорд',title:`${C.n}: ${fmtN(v)} ${C.un}!`,deck:`${D.n} на «${E.name}» · ${where}`,
      text:`Хронометристы подтвердили: ${fmtN(v)} ${C.un}. Прежний рекорд — ${fmtN(Math.round(cur.v*10)/10)} (${cur.who}) — побит.\nОб этом пишут газеты всех стран: имя «${s.company}» ${k==='lsr'?'три года':k==='h24'?'полтора года':'два года'} будет на слуху у покупателей${k==='h24'?`, а «${E.name}» — у всех, кто выбирает машину на годы`:''}. Соперники рекорды не забывают: его можно потерять.`,choices:[['Отлично','ok']]},true);
    try{pendingToasts.push(`${C.ic} Мировой рекорд: ${fmtN(v)} ${C.un}`);}catch(_){}return out;}
  out.res='short';pushEvent({own:1,noArt:1,kicker:'Попытка рекорда',title:`${C.n}: не хватило ${fmtN(Math.round((cur.v-v)*10)/10)} ${k==='h24'?'км/ч':'км/ч'}`,deck:`«${E.name}» — ${fmtN(v)} ${C.un}`,
    text:`${D.n} на «${E.name}» показал ${fmtN(v)} ${C.un} — рекорд (${fmtN(Math.round(cur.v*10)/10)}, ${cur.who}) устоял. Газеты пишут о смелой попытке, но помнят победителей.\nНужна машина быстрее${k==='lsr'?' — рекордный образец с двумя моторами, авиамотором или обтекаемым кузовом':k==='h24'?' и надёжнее':''}. Выезд стоил ${money(fee)}; следующая попытка — через ${C.cool} мес.`,choices:[['Ясно','ok']]},true);return out;}
/* ---------- месяц: соперники берут рекорды по истории ---------- */
function recMonth(s,r){const R=s.rec;if(!R)return;const t=recT(s);
  for(const k in REC_CLS){const m=R[k];if(!m||m.lost)continue;const h=recHist(k,t);if(h&&h[1]>m.v){m.lost=mi(s);m.until=Math.min(m.until||0,mi(s)+6);const C=REC_CLS[k];
      pushEvent({own:1,noArt:1,kicker:'Рекорд отобран',title:`${C.n}: ${fmtN(h[1])} ${C.un}`,deck:h[2]?`${h[2]}`:'новый мировой рекорд',
        text:`Ваш рекорд ${m.y} года — ${fmtN(m.v)} ${C.un} — побит: ${h[2]?h[2]+' — ':''}${fmtN(h[1])} ${C.un}. Слава рекорда сойдёт за полгода.\nВернуть его можно: ${k==='lsr'?'новым рекордным образцом':'машиной быстрее и надёжнее'}.`,choices:[['К рекордам','rec:open'],['Ясно','ok']]},true);}}}
// слава рекорда в спросе: марка на слуху (в последний год сходит)
function recBoostU(md,s){const R=s&&s.rec;if(!R)return 0;const t=mi(s);let u=0;
  for(const k in REC_CLS){const m=R[k];if(!m||!(m.until>t))continue;const C=REC_CLS[k],f=Math.min(1,(m.until-t)/12),mo=isMoto(md);
    if(k==='mlsr'){if(mo)u+=C.boost*f;}else if(k==='h24'){u+=(md.id===m.md?C.boost:0.06)*f*(mo?0.3:1);}else u+=C.boost*f*(mo?0.5:1);}
  return Math.min(0.35,u);}
function recResolve(s,key){if(key==='rec:open'){try{s.pending.shift();save();render();openRecords();}catch(_){}return true;}return false;}
/* ---------- что показать ---------- */
let recDraft=null;
function recRowHTML(s,k){const C=REC_CLS[k];if(s.y<C.y0)return '';const cur=recCur(s,k),E=recEntry(s,k),why=recCan(s,k),D=recDriver(s),mine=s.rec&&s.rec[k],fee=recFee(s,k),ch=E?recChance(E.v,cur.v,E.rel,D.sk):0;
  return `<div class="race-item"><div class="row"><div><span class="mo">${C.ic} ${C.where(s.y)}</span><h3 style="margin-top:2px">${C.n}</h3></div><span class="pill ${cur.mine?'good':'muted'}">${fmtN(Math.round(cur.v*10)/10)} ${k==='h24'?'км/ч':C.un}</span></div>
    <p class="small muted" style="margin-top:4px">Держит: ${cur.mine?`<b class="good">вы</b> — ${esc(cur.who)}`:esc(cur.who)}${mine&&mine.lost?` · ваш рекорд ${mine.y} года (${fmtN(mine.v)}) побит`:''}${recPast(k,recT(s))}</p>
    ${E?`<p class="small" style="margin-top:4px">Ваша машина: <b>«${esc(E.name)}»</b>${E.special?' (рекордный образец)':''} — расчёт ${fmtN(Math.round(E.v))} ${k==='h24'?'км/ч за сутки':'км/ч'} · шанс ${pct(ch,0)}${E.v<cur.v?' — <span class="warn">медленнее рекорда</span>':''}</p>`:''}
    <div class="btns" style="margin-top:6px"><button class="btn sm ${!why&&ch>=0.25?'primary':''}" data-act="recTry" data-k="${k}" ${why?'disabled':''}>${why?esc(capF(why)):`Попытка · ${money(fee)}`}</button>${k==='lsr'?`<button class="btn sm" data-act="recBuild">Рекордный образец</button>`:''}</div></div>`;}
function openRecords(){const s=G,cars=(s.recCars||[]).filter(c=>!c.out),pj=rdActive(s).filter(p=>p.kind==='rec');
  openSheet(`<div class="row"><h2>🏁 Мировые рекорды</h2><button class="btn sm" data-act="close">Закрыть</button></div>
    <p class="small muted">Рекорд — событие для газет всего мира: имя марки годами на слуху. Попытку объявляете вы; решают машина, гонщик и удача. Соперники берут рекорды по истории — свой можно потерять. Рекорды авиации — в «Небе».</p>
    ${Object.keys(REC_CLS).map(k=>recRowHTML(s,k)).join('')}
    ${cars.length||pj.length?`<div class="label" style="margin-top:10px">Рекордные образцы</div>${cars.map(c=>`<p class="small" style="margin-top:4px">🏁 <b>${esc(c.name)}</b> · ${c.y} · ${fmtN(c.hp)} л.с., ${fmtN(c.kg)} кг · расчёт ${fmtN(Math.round(c.v))} км/ч</p>`).join('')}${pj.map(p=>`<p class="small muted" style="margin-top:4px">В КБ: «${esc(p.name)}» — ${Math.round(100*p.prog/Math.max(1,p.need))}%</p>`).join('')}`:''}`);}
function openRecBuild(){const s=G;recDraft=recDraft||{eng:'one',body:'std',name:''};const d=recDraft,P=recPreview(s,d),x=P.x;
  const chip=(kind,id,o)=>{const w=recOptOk(s,kind,id);return `<button class="chip ${d[kind]===id?'on':''}" data-act="recOpt" data-k="${kind}" data-v="${id}" ${w?'disabled title="'+esc(w)+'"':''}>${o.n}</button>`;};
  openSheet(`<div class="row"><h2>🏁 Рекордный образец</h2><button class="btn sm" data-act="recBack">Назад</button></div>
    <p class="small muted">Особый проект КБ: машина ради одной мерной мили. Не для продажи. Основа — ваша самая быстрая модель${x?` («${esc(x.baseName)}»)`:''}.</p>
    <div class="label" style="margin-top:8px">Мотор</div><div class="chips sm">${Object.keys(REC_ENG).map(id=>chip('eng',id,REC_ENG[id])).join('')}</div>
    <div class="label" style="margin-top:8px">Кузов</div><div class="chips sm">${Object.keys(REC_BODY).map(id=>chip('body',id,REC_BODY[id])).join('')}</div>
    ${x?`<div class="label" style="margin-top:10px">Что получится</div><p class="small" style="margin-top:4px"><b>${fmtN(x.hp)} л.с.</b>${x.ae?` (${esc(x.ae)})`:''}, ${fmtN(x.kg)} кг · расчётная скорость <b>${fmtN(Math.round(x.v))} км/ч</b> · рекорд сейчас ${fmtN(Math.round(P.cur.v))} км/ч (${esc(P.cur.who)})<br>Шанс рекорда с хорошим гонщиком — ${pct(P.chance,0)} · надёжность ${pct(x.rel,0)}<br>Проект: <b>${money(P.cost)}</b> · около ${P.months} мес. · риск «не по ТЗ» ${pct(protoRisk(P.pj),0)}</p>
    <input id="recname" class="inp" style="margin-top:8px;width:100%" maxlength="40" placeholder="Имя образца" value="${esc(d.name||'')}">`:''}
    <button class="btn primary block" style="margin-top:10px" data-act="recStart" ${P.why?'disabled':''}>${P.why?esc(P.why):`Начать · ${money(P.cost)}`}</button>`);}
// карточка во вкладке «Гонки» и совет помощника
function recCardHTML(s){if(!s||s.mode==='racer'||s.y<1898)return '';const L=Object.keys(REC_CLS).filter(k=>s.y>=REC_CLS[k].y0).map(k=>{const c=recCur(s,k);return `${REC_CLS[k].ic} ${fmtN(Math.round(c.v))}${c.mine?' — <b class="good">ваш</b>':''}`;});
  return `<section class="card"><div class="row"><div><h2>Мировые рекорды</h2><p class="small muted">${L.join(' · ')}</p></div><button class="btn sm" data-act="recOpen">Открыть</button></div></section>`;}
function recAdvice(s,add){if(s.mode==='racer'||isWar(s.y,s.m,s.country))return;const D=recDriver(s);
  for(const k in REC_CLS){if(recCan(s,k))continue;const E=recEntry(s,k),cur=recCur(s,k);if(cur.mine||!E)continue;const ch=recChance(E.v,cur.v,E.rel,D.sk);if(ch<0.4)continue;
    add(38,REC_CLS[k].ic,`«${E.name}» может взять мировой рекорд: ${REC_CLS[k].n.toLowerCase()} — расчёт ${fmtN(Math.round(E.v))} против ${fmtN(Math.round(cur.v))} ${k==='h24'?'км/ч':REC_CLS[k].un}, шанс ${pct(ch,0)}.`,`Попытка · ${money(recFee(s,k))}`,()=>{recTryNow(s,k);},'race');return;}}
