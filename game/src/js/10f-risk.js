/* ================= 0.32: ТЕХНИЧЕСКИЙ РИСК — ЧЕМ НОВЕЕ ТЕХНОЛОГИЯ, ТЕМ ДАЛЬШЕ ОНА ОТ ТЗ =================
   Раньше новинка «раньше истории» доставалась почти даром: прототип КБ давал в серии ровно то, что обещал, а движущийся
   конвейер в 1909 году работал как у Форда в 1914-м. На деле передний край — это риск: первые моторы с верхними клапанами
   прогорали, первые гидравлические тормоза текли, конвейер Форда налаживали полгода. Зрелая технология (её делают у
   поставщиков годами) даёт ровно то, что обещано.
   • Зрелость детали — по годам «в деле»: прототип КБ раньше истории — 0, деталь только что у поставщиков — 0,2,
     через четыре года — 1 (обкатана).
   • «Детские болезни»: незрелые детали ломаются чаще — надёжность ниже, гарантия дороже, скандал вероятнее; отрасль
     обкатывает деталь, и болезни уходят.
   • Не по ТЗ: когда модель идёт в серию, каждая незрелая деталь может выйти хуже расчёта (мотор слабее, рама слабее,
     тормоза хуже, шины быстрее стираются; ресурс ниже). Отклонение тает по мере доводки в серии (за 2–3 года) или сразу —
     проектом КБ «Доводка».
   • Прототип в КБ на годы раньше истории может потребовать доработки: испытания выявляют недостатки, проект дольше.
   • Заводская технология раньше своего года: наладка затягивается, обходится дороже, выпуск полгода ниже. */
const RISK_PK=['e','g','c','k','w'];
const RISK_NAME={e:'мотор',g:'коробка',c:'рама',k:'тормоза',w:'шины'};
// год, с которого деталь в ходу (у прототипа КБ — её исторический год: до него она «сырая»)
function partMat(x,Y){if(!x)return 1;return clamp((Y-(x.y||1895)+1)/5,0,1);}
// риск, что незрелая деталь в серии выйдет не по ТЗ (прототип — 55%, новинка поставщиков — около 40%, через четыре года — 0)
function partRisk(x,Y){const m=partMat(x,Y);return 0.55*Math.pow(1-m,1.6);}
// риск модели: что хотя бы одна деталь выйдет не по ТЗ
function modelRisk(md,Y){if(!md||md.ref||md.ai)return 0;const p=parts(md);let ok=1;RISK_PK.forEach(k=>{ok*=1-partRisk(p[k],Y);});return 1-ok;}
// 0.33: «детские болезни» — не приговор новинке, а риск. Покупатели и конструктор видят машину по ТЗ; хуже она станет,
// только если при запуске деталь выйдет не по ТЗ (devRoll) — тогда и ломается чаще, пока доводка не исправит.
// (В 0.32 незрелая деталь сразу снимала до 10% надёжности, а надёжность считается через частоту поломок: −19% вероятности
// превращались в поломки в 5–7 раз чаще — новинка в конструкторе выходила «вся в красном».)
function teethK(md,Y){return 1;}
// отклонение детали от ТЗ сейчас: тает с доводкой в серии (половина — за ~1,7 года)
function dvNow(md,k){const d=md&&md.dv&&md.dv[k];if(!d)return 1;const s=G,t=s?mi(s)-(d.t||0):0;return 1-(1-d.k)*Math.exp(-Math.max(0,t)/30);}
function dvRel(md){return 1;}
// 0.33: деталь не по ТЗ ломается чаще: поломок до 2,5 раза больше (по тяжести отклонения), отклонение тает с доводкой в серии
const DV_FAIL=1.5;
function dvFail(md){if(!md||!md.dv)return 1;let f=1;for(const k in md.dv){const d=md.dv[k],left=(1-dvNow(md,k))/Math.max(0.01,1-d.k),sev=d.sev||0.5;f*=1+DV_FAIL*sev*clamp(left,0,1);}return f;}
// что дала серия: отклонения по деталям (при запуске модели)
const DEV_K={e:0.25,g:0.06,c:0.15,k:0.2,w:0.25};
const DEV_TXT={e:(x,k)=>`мотор даёт ${Math.round(engineHp(x)*k)} л.с. вместо ${Math.round(engineHp(x))}`,g:(x,k)=>`коробка теряет больше: КПД ${Math.round(x.eff*k*100)}% вместо ${Math.round(x.eff*100)}%`,
  c:(x,k)=>`рама держит мотор до ${Math.round(x.max*k)} л.с. вместо ${Math.round(x.max)}`,k:(x,k)=>`тормоза слабее расчёта на ${Math.round((1-k)*100)}%`,w:(x,k)=>`шины стираются быстрее, сцепление хуже на ${Math.round((1-k)*100)}%`};
function devRoll(s,md){md.dv={};const p=parts(md),out=[];
  RISK_PK.forEach(k=>{const x=p[k],r=partRisk(x,s.y);if(r<=0||Math.random()>=r)return;const sev=(0.35+0.65*Math.random())*(1-partMat(x,s.y)),kk=+(1-DEV_K[k]*sev).toFixed(3);
    md.dv[k]={k:kk,t:mi(s),sev:+sev.toFixed(2)};out.push({k,x,kk});});
  if(!out.length)delete md.dv;return out;}
// новость о запуске: что вышло не по ТЗ, и предложение доводки в КБ
function devNews(s,md,out){const txt=out.map(o=>DEV_TXT[o.k](o.x,o.kk)).join('; '),young=out.map(o=>o.x.name).join(', ');
  const fc=fixCost(s,md),fm=fixMonths(md);
  addLog(`«${md.name}»: испытания серии — ${txt}. Причина — незрелые детали (${young}).`,'bad');
  pushEvent({kicker:'КБ · испытания',own:1,title:`«${md.name}»: не всё по ТЗ`,deck:txt,carId:md.id,
    text:`Первые машины серии прошли испытания. ${capF(txt)}; ломается чаще расчётного. Так бывает с новинками: ${young} ещё не обкатаны ни у поставщиков, ни у вас.\nОтклонение будет таять само — рабочие и поставщики научатся (года за два-три). Или КБ займётся доводкой: ${fm} мес., ${money(fc)}.`,
    choices:[[`Доводка в КБ · ${money(fc)}`,'rdfix:'+md.id],['Пусть доводят в серии','ok']]},true);}
function fixCost(s,md){const n=md.dv?Object.keys(md.dv).length:1;return Math.round((1500+1200*n)*cpi(s)/100)*100;}
function fixMonths(md){const n=md.dv?Object.keys(md.dv).length:1;return 3+n;}
// проект «Доводка»: КБ берёт модель с отклонениями и доводит до ТЗ
function fixProject(s,md){return {kind:'fix',id:'fix'+md.id,md:md.id,name:`Доводка «${md.name}»`,need:Math.max(4,Math.round(rdPts(s)*fixMonths(md)*0.5))};}
function rdPts(s){try{return rdTotal(s);}catch(_){return 6;}}
function fixStart(s,id){const md=s.models.find(m=>m.id===+id);if(!md||!md.dv)return false;if(rdActive(s).some(p=>p.kind==='fix'&&p.md===md.id))return false;
  if(rdActive(s).length>=rdSlots(s)){toast('КБ занято: все места для проектов заняты');return false;}const c=fixCost(s,md);if(s.cash<c){toast('Не хватает денег на доводку');return false;}
  s.cash-=c;s.rdPaid=(s.rdPaid||0)+c;s.rd.projs.push({...fixProject(s,md),prog:0,cost:c});addLog(`КБ начало доводку «${md.name}» (${money(c)}).`);return true;}
function fixDone(s,pj){const md=s.models.find(m=>m.id===pj.md);if(!md)return;delete md.dv;addLog(`КБ довело «${md.name}» до ТЗ: мотор, рама и тормоза — как в расчёте, ресурс восстановлен.`,'good');pendingToasts.push('🔧 Доводка: «'+md.name+'»');}
// прототип на годы раньше истории: испытания могут выявить недостатки — проект дольше на 40% (один раз)
function protoRisk(pj){return clamp(0.12*(pj.yrs||1),0.08,0.6);}
// заводская технология раньше своего года: риск трудной наладки
function techRisk(s,k){const nx=techNext(s,k);if(!nx)return 0;const e=(nx.y||1895)-s.y;return e>0?clamp(0.2*e,0.15,0.7):0;}
// трудная наладка: выпуск ниже, пока технологию не наладили
function techTroubleK(s){const T=s.techTrouble;return T&&T.until>mi(s)?T.k:1;}
// проверка при завершении: проект КБ — доработать ли прототип
function protoCheck(s,pj){if(pj.kind!=='early'||pj.rk)return false;pj.rk=1;if(Math.random()>=protoRisk(pj))return false;
  const add=Math.round(pj.need*0.4);pj.need+=add;addLog(`Испытания прототипа «${pj.name}» выявили недостатки — опыты ещё на ${add} очк. КБ (новинка на ${pj.yrs} ${plural(pj.yrs||1,'год','года','лет')} раньше истории).`,'bad');
  pendingToasts.push('🔬 Прототип: доработка');return true;}
// проверка при завершении технологии: наладка затягивается
function techCheck(s){const B=s.techBuild;if(!B||B.rk)return false;B.rk=1;const lv=TECH[B.k]&&TECH[B.k].lv[techLv(s,B.k)],e=lv?(lv.y||1895)-s.y:0;if(e<=0)return false;
  const p=clamp(0.2*e,0.15,0.7);if(Math.random()>=p)return false;const add=2+Math.floor(Math.random()*3),over=Math.round(techCost(s,B.k)*0.25/100)*100;
  B.left+=add;s.cash-=over;s.techTrouble={until:mi(s)+add+4,k:0.82};
  addLog(`«${lv.name}»: наладка затянулась на ${add} мес. — технология на ${e} ${plural(e,'год','года','лет')} раньше, чем её освоили в истории. Перерасход ${money(over)}, выпуск полгода ниже.`,'bad');
  pendingToasts.push('🏭 Наладка затянулась');return true;}
// подпись риска для конструктора: что может выйти не по ТЗ и с какой вероятностью (сравнение выше — по ТЗ, как машину увидят покупатели)
function riskHTML(md,s){const p=parts(md),L=RISK_PK.map(k=>({k,x:p[k],r:partRisk(p[k],s.y),m:partMat(p[k],s.y)})).filter(o=>o.r>0.01);
  if(!L.length)return `<p class="small good" style="margin-top:6px">Все детали обкатаны: машина выйдет такой, как в расчёте.</p>`;
  const R=modelRisk(md,s.y),worst=L.reduce((a,o)=>Math.max(a,DEV_K[o.k]),0);
  return `<div class="row small" style="margin-top:10px"><span class="muted">Риск: не по ТЗ</span><span class="num ${R>0.5?'warn':''}">${Math.round(R*100)}%</span></div>
    <p class="small muted" style="margin-top:4px">${L.map(o=>`${RISK_NAME[o.k]} — ${o.x.y>s.y?`прототип, на ${o.x.y-s.y} ${plural(o.x.y-s.y,'год','года','лет')} раньше истории`:o.x.y===s.y?'новинка этого года':`в деле ${s.y-o.x.y} ${plural(s.y-o.x.y,'год','года','лет')}`} (${Math.round(o.r*100)}%)`).join(' · ')}.
    Сравнение выше — по ТЗ: так машину увидят покупатели. Если при запуске не повезёт, деталь выйдет хуже расчёта (до −${Math.round(worst*100)}%) и будет ломаться чаще — пока рабочие не доведут её в серии (2–3 года) или КБ не сделает «Доводку». Обкатанные детали выходят точно по ТЗ.</p>`;}
