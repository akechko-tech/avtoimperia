/* ================= 0.21: деньги, риски и ответ конкурентов (ТЗ 0.18, раздел 5) =================
   Деньги от дилеров приходят через 1–2 месяца, а детали оплачены сразу: касса может уйти в минус и при прибыли.
   Кредит стоит по-разному в разные годы; в паники 1907 и 1929 годов банки закрывают кредит и требуют вернуть лишнее.
   Цех строится полгода-год, конвейер ставится с провалом выпуска. Низкая зарплата — текучесть; экономия на качестве —
   поломки и газетный скандал. Конкуренты отвечают на ваш успех: снижают цены, готовят модель-ответ, объединяются,
   переманивают дилеров. Журнал объясняет, почему упали продажи. */

/* ---------- кредит ---------- */
// Годовая ставка в спокойное время; в кризисы — надбавка
const LOAN_RATE={1895:0.055,1906:0.055,1908:0.05,1913:0.05,1914:0.06,1919:0.06,1920:0.075,1921:0.07,1922:0.055,1928:0.055,1929:0.06};
function creditState(s,y,m){y=y??s.y;m=m??s.m;
  if((y===1907&&m>=9)||(y===1908&&m<=3))return {k:'panic',add:0.035,lim:0.55,closed:y===1907,t:'Паника 1907 года: банки не дают денег'};
  if(y===1929&&m>=9)return {k:'crash',add:0.035,lim:0.4,closed:true,t:'Биржевой крах: кредит закрыт'};
  if((y===1920&&m>=6)||(y===1921&&m<=8))return {k:'tight',add:0.02,lim:0.55,closed:false,t:'Послевоенный спад: банки урезают кредит'};
  if(isWar(y,m,s.country))return {k:'war',add:0.01,lim:0.85,closed:false,t:'Война: деньги идут на военные займы'};
  return {k:'ok',add:0,lim:1,closed:false,t:''};}
function loanRate(s){const cs=creditState(s);return clamp(tabAt(LOAN_RATE,yf(s))+cs.add+(s.rep>=80?-0.01:s.rep<35?0.015:0)+(DIF().rate||0)+(typeof legalRateAdd==='function'?legalRateAdd(s):0)-((s.rateCut||0)>mi(s)?0.015:0),0.03,0.17);}
function loanOpen(s){return !creditState(s).closed;}
// Банк требует вернуть кредит сверх лимита: в кризис — за 3 месяца, в спокойное время — понемногу за год
// (0.21: в кризис банк решает один раз — лимит на первый месяц кризиса держится до конца: долг по частям не «уменьшает» требование)
function loanRecall(s,r){const cs=creditState(s),hard=cs.k!=='ok'&&cs.k!=='war',held=hard&&s.recall&&s.recall.k===cs.k&&s.recall.lim!=null;
  const lim=held?Math.min(maxLoan(s),s.recall.lim):maxLoan(s),ex=s.loan-lim;if(ex<=Math.max(500,s.loan*0.02)){if(!held)s.recall=null;return;}
  const k=(DIF().recall??1);if(!k||(s.noRecall||0)>mi(s))return;const mo=cs.k==='crash'?2:3;
  if(!s.recall||s.recall.k!==cs.k){s.recall={k:cs.k,t:mi(s),lim:hard?lim:null};
    if(hard&&!s.pending.length)pushEvent({kicker:'Банк',title:'Банк требует вернуть кредит',deck:`${cs.t} · ${money(ex)} за ${mo===2?'два месяца':'три месяца'}`,
      text:`${cs.t}. Залог — завод и склад — подешевел, и банк урезал лимит «${s.company}» до ${money(lim)}${s.loan>0&&levCut(s,cs)<1?' — тем, у кого долг велик по сравнению с прибылью, банки режут кредит сильнее':''}. Сверх него — ${money(ex)}: их нужно вернуть за ${mo===2?'два месяца':'три месяца'}, деньги спишут со счёта сами.\nЧто можно сделать: продать излишки склада со скидкой, сократить выпуск и расходы, отложить стройку. Если касса уйдёт в минус больше допустимого — кредиторы закроют завод.`,choices:[['Понятно','ok']]},false);}
  const left=hard?Math.max(1,mo-(mi(s)-s.recall.t)):12,pay=Math.min(ex,Math.max(ex/left,300)*k);s.loan-=pay;s.cash-=pay;r.recall=pay;}

/* ---------- оборотные деньги ---------- */
// Дилеры платят заводу не сразу: 55% выручки — через месяц, 45% — через два; с продажей в кредит — ещё дольше
function arSplit(s){const k=DIF().ar??1;if(!k)return [1];return techLv(s,'credit')?[0.35,0.35,0.3]:[0.55,0.45];}
function arTotal(s){return (s.ar||[]).reduce((a,b)=>a+b,0);}
// старое сохранение: часть кассы «в пути» от дилеров — стоимость компании не меняется
function arMigrate(s){if(s.ar)return;s.ar=[];const R=s.last?(s.last.rev||0)+(s.last.ord||0):0;if(R>0&&mi(s)>0){const x=Math.max(0,Math.min(R,s.cash));const sp=arSplit(s);sp.forEach((f,i)=>s.ar[i]=x*f);s.cash-=x;}}
function arCollect(s,R){if(!(DIF().ar??1)){const old=arTotal(s);s.ar=[];return R+old;}arMigrate(s);const A=s.ar,got=A.shift()||0,sp=arSplit(s);sp.forEach((f,i)=>A[i]=(A[i]||0)+R*f);return got;}

/* ---------- стройка ---------- */
// Цех строится 6–12 месяцев: чем больше расширение, тем дольше
function capMonths(s,n){return Math.max(1,Math.round(clamp(6+6*n/Math.max(1,s.cap),6,12)*(DIF().build??1)));}
function capOrder(s,n,quiet){n=Math.max(1,Math.round(n));const c=n*capUnitCost(s);if(s.cash<c)return false;s.cash-=c;s.plantVal+=c;const left=capMonths(s,n);
  (s.capBuild=s.capBuild||[]).push({units:n,left,t:left});if(!quiet)addLog(`Заложен новый цех: +${fmtN(n)} мест, ${money(c)}. Стройка — ${left} мес.`);return true;}
function whMonths(s){return Math.max(1,Math.round(2*(DIF().build??1)));}
function whOrder(s,n,quiet){n=Math.max(1,Math.round(n));const c=n*whUnitCost(s);if(s.cash<c)return false;s.cash-=c;s.plantVal+=c;(s.whBuild=s.whBuild||[]).push({units:n,left:whMonths(s)});
  if(!quiet)addLog(`Строится склад на ${fmtN(n)} машин (${money(c)}), ${whMonths(s)} мес.`);return true;}
// Движущийся конвейер ставят в работающем цеху: пока идёт перестройка, выпуск ниже на четверть
function convRebuild(s){return !!(s.techBuild&&s.techBuild.k==='line'&&techLv(s,'line')===1);}

/* ---------- зарплата и текучесть ---------- */
// Сколько рабочих уходит за месяц: при низкой зарплате — каждый двенадцатый, при «пяти долларах» — почти никто
const QUIT={low:0.08,market:0.04,good:0.02,five:0.006};
function turnover(s,r){const q=(QUIT[s.wagePol||'market']||0.04)*(DIF().quit??1),n=Math.round(s.workers*q);if(n<1)return;
  const c=n*8*cpi(s)*(s.staffAuto?1:0.5);r.turn=(r.turn||0)+c;s.quitN=n;}

/* ---------- скидка дилерам ---------- */
const DPOL={low:{m:0.12,tp:0.85,n:'Маленькая',d:'12% цены: больше денег заводу, но дилеры торгуют вяло и уходят к конкурентам'},
  std:{m:0.16,tp:1,n:'Обычная',d:'16% цены, как у всех'},high:{m:0.2,tp:1.15,n:'Щедрая',d:'20% цены: дилеры держат запас и продают охотнее, никто не уходит'}};
function dMargin(s){s=s||G;return (DPOL[s&&s.dpol]||DPOL.std).m;}
function dTP(s,c){return (DPOL[s&&s.dpol]||DPOL.std).tp;}

/* ---------- качество и скандалы ---------- */
// Дешёвые детали, мотор мощнее рамы, нет контроля качества, низкая зарплата — машины ломаются, пишут газеты
function qualityRisk(md,s){const C=classCompare(md,s),rel=C.by.rel||1;let b=0;
  if(rel<0.9)b+=(0.9-rel)*6;if(overpower(md))b+=1.2;if(!techLv(s,'qc'))b+=s.y>=1905?0.5:0.2;if(s.wagePol==='low')b+=0.35;if(s.y>=1920&&techLv(s,'qc')<2)b+=0.2;return b;}
function qualityMonth(s){if(DIF().simple)return;const k=DIF().scandal??1;if(!k||s.pending.length)return;
  s.models.filter(m=>m.status==='prod'&&(m.lastSold||0)>=5).forEach(md=>{if(s.pending.length)return;const b=qualityRisk(md,s);if(b<=0.4)return;
    if((md.scandalAt??-99)>mi(s)-24)return;const p=0.0035*b*k*Math.min(3,Math.log10(1+md.lastSold));if(Math.random()>p)return;
    md.scandalAt=mi(s);const sold=Math.round((md.lastSold||0)*12),cost=Math.round(sold*0.04*md.price*0.5/100)*100,why=[];
    const C=classCompare(md,s);if((C.by.rel||1)<0.9)why.push('дешёвые детали ломаются');if(overpower(md))why.push('рама не держит мотор');if(!techLv(s,'qc'))why.push('на заводе нет контроля качества');if(s.wagePol==='low')why.push('рабочие меняются каждый месяц');
    s.scandalMd=md.id;
    pushEvent({kicker:'Скандал',title:`Покупатели жалуются на «${md.name}»`,deck:why.join(', ')||'Поломки одна за другой',
      text:`Газеты печатают письма владельцев «${md.name}»: ${why.join(', ')||'машины ломаются'}. Клубы автомобилистов советуют не покупать.\nМожно отозвать машины и починить за свой счёт — около ${money(cost)}: репутация пострадает меньше, покупатели вернутся быстрее. Можно отрицать — дешевле сейчас, но газеты не забудут, и спрос упадёт надолго.`,
      choices:[[`Отозвать и починить · ${money(cost)}`,'qRecall'],['Отрицать','qDeny']]},true);});}
function qualityResolve(s,key){const md=s.models.find(m=>m.id===s.scandalMd);s.scandalMd=null;if(!md)return;
  if(key==='qRecall'){const sold=Math.round((md.lastSold||0)*12),cost=Math.round(sold*0.04*md.price*0.5/100)*100;s.cash-=cost;s.rep=clamp(s.rep-3,0,100);md.scandalK=0.15;md.scandalUntil=mi(s)+4;
    addLog(`«${md.name}»: машины отозваны и починены (${money(cost)}). Газеты хвалят честность, но покупатели пока осторожны.`,'bad');}
  else{s.rep=clamp(s.rep-8,0,100);md.scandalK=0.35;md.scandalUntil=mi(s)+9;md.scandalAt=mi(s)-18;addLog(`«${md.name}»: компания отрицает поломки. Репутация упала, продажи тоже.`,'bad');}}
function scandalEffect(md,s){return (md.scandalUntil||0)>mi(s)?Math.log(1-(md.scandalK||0)):0;}

/* ---------- ответ конкурентов ---------- */
// Если вы забираете больше четверти класса в стране (на «Норме»), лидер класса отвечает: снижает цены на 5–15%
// или готовит модель-ответ (через 12–18 месяцев); долго доминируете — слабые марки объединяются против вас
function respOf(s,c,g){s.resp=s.resp||{};const C=s.resp[c]=s.resp[c]||{};return C[g]=C[g]||{sh:0,over:0,cut:0,t:-99,ms:[],mg:0};}
function respCut(s,c,g){const o=s.resp&&s.resp[c]&&s.resp[c][g];return o?Math.min(o.cut||0,0.15*(DIF().cut??1)):0;}
// ответ конкурентов не бесконечен: у лидера класса тоже есть предел — модели-ответы вместе дают не больше +0,6 (ТЗ: цена −5…15%, модель через 12–18 мес.)
const RESP_CUT_MAX=0.15,RESP_BOOST_MAX=0.6;
function respBoost(s,c,g){const o=s.resp&&s.resp[c]&&s.resp[c][g];if(!o)return 0;const t=mi(s);let u=o.mg||0;for(const x of o.ms||[])if(x.at<=t)u+=x.k*Math.exp(-(t-x.at)/72);return Math.min(RESP_BOOST_MAX,u);}
function classLeader(s,c,g){const L=(COMPS[c]||[]).filter(cp=>cp.pk!==s.pioneer&&compAlive(cp,s)&&cp.mix&&cp.mix[g]).map(cp=>({cp,v:compVol(cp,s)*cp.mix[g]})).sort((a,b)=>b.v-a.v);return L;}
function rivalsRespond(s,r){const D=DIF(),T0=D.rshare||0.25,K=D.resp??1,cutK=D.cut??1,gap=D.rgap||12,t=mi(s);if(!K)return;
  for(const c in r.mk){const mk=r.mk[c];if(!mk.segs)continue;
    SEGK.forEach(g=>{const z=mk.segs[g],o=respOf(s,c,g);const sh=z&&z.size>=3?z.you/z.size:0;o.sh=o.sh*0.8+sh*0.2;
      if(o.sh>T0)o.over++;else{o.over=Math.max(0,o.over-1);if(o.sh<T0*0.7&&t-o.t>=12&&o.cut>0)o.cut=Math.max(0,+(o.cut-0.005).toFixed(3));}
      if(o.over<3||t-o.t<gap)return;
      const L=classLeader(s,c,g);if(!L.length)return;const lead=compName(L[0].cp,s),ex=clamp((o.sh-T0)/T0,0,2),home=c===s.country;o.t=t;
      // цена или новая модель: сначала — цена (быстро), потом — модель-ответ; очень долгий перевес — слияние слабых марок
      if(o.cut<RESP_CUT_MAX*cutK-0.001&&(o.ms.length>=o.cut/0.08||Math.random()<0.5)){const cut=Math.min(clamp(0.05+0.05*ex,0.05,0.15)*cutK,RESP_CUT_MAX*cutK-o.cut);o.cut=+Math.min(RESP_CUT_MAX*cutK,o.cut+cut).toFixed(3);
        const txt=`${lead} снижает цены в классе «${SEG[g].name}» на ${Math.round(cut*100)}%${home?'':' ('+COUNTRIES[c].name+')'}: слишком много покупателей ушло к «${s.company}».`;addLog(txt,'bad');
        if(home&&!s.pending.length)pushEvent({kicker:'Рынок',title:`${lead} снижает цены`,deck:`Класс «${SEG[g].name}» · −${Math.round(cut*100)}%`,text:`${txt}\nВаша доля класса — ${Math.round(o.sh*100)}%. Ответ простой: либо снижать цену вслед, либо предложить машину лучше. Дальше конкуренты могут выпустить модель-ответ.`},true);}
      else{const at=t+12+Math.floor(Math.random()*7),k=(0.3+0.2*Math.min(1,ex))*K;o.ms.push({at,k,by:lead,said:0});
        addLog(`${lead} готовит модель-ответ в классе «${SEG[g].name}»${home?'':' ('+COUNTRIES[c].name+')'} — выйдет через ${at-t} мес.`,'bad');}
      if(o.over>=24&&!o.mgd){const W=L.slice(1).filter(x=>x.v>0).slice(-3);if(W.length>=2){o.mgd=1;o.mg=0.25*K;const names=W.map(x=>compName(x.cp,s));
        const txt=`${names.slice(0,-1).join(', ')} и ${names[names.length-1]} объединились в концерн, чтобы выстоять против «${s.company}».`;addLog(txt,'bad');
        if(home&&!s.pending.length)pushEvent({kicker:'Рынок',title:'Конкуренты объединились',deck:`Класс «${SEG[g].name}»`,text:`${txt}\nТак в 1908 году Уильям Дюрант собрал General Motors из Buick, Oldsmobile, а затем Cadillac и Oakland: у слабых марок появились общие деньги, заводы и дилеры. Концерн сильнее каждой марки по отдельности.`},true);}}});
    // модели-ответы выходят — газета
    SEGK.forEach(g=>{const o=s.resp[c]&&s.resp[c][g];if(!o)return;(o.ms||[]).forEach(x=>{if(x.at<=t&&!x.said){x.said=1;const txt=`${x.by} выпустил модель-ответ в классе «${SEG[g].name}»${c===s.country?'':' ('+COUNTRIES[c].name+')'}: покупатели снова смотрят на соперников.`;addLog(txt,'bad');
      if(c===s.country&&!s.pending.length)pushEvent({kicker:'Рынок',title:`${x.by}: ответ «${s.company}»`,deck:`Новая модель в классе «${SEG[g].name}»`,text:`${txt}\nНовинку готовили больше года — после того как «${s.company}» забрала слишком много покупателей класса. Её преимущество будет таять несколько лет.`},true);}});
      o.ms=(o.ms||[]).filter(x=>x.at>t-240);});}}

/* ---------- переманивание: дилеры и инженеры ---------- */
function poachMonth(s,r){const t=mi(s);
  // маленькая скидка дилерам — часть дилеров уходит к конкурентам
  if(s.dpol==='low'){for(const c in s.dealers){const d=dealerCount(s,c);if(d>=4&&Math.random()<0.25){const n=Math.max(1,Math.round(d*0.03));s.dealers[c]=d-n;
    if(t-(s.poachSaid||-99)>=6){s.poachSaid=t;addLog(`Конкуренты переманили ${fmtN(n)} ${plural(n,'дилера','дилеров','дилеров')}${c===s.country?'':' ('+COUNTRIES[c].name+')'}: у них скидка выше.`,'bad');}}}}
  // касса в минусе — задерживают жалованье: уходят инженеры КБ и часть дилеров
  if(s.cash<0){s.late=(s.late||0)+1;if(s.late>=2){if((s.rd.engOut||0)<=t){s.rd.engOut=t+6;addLog('Жалованье задерживают второй месяц: лучшие инженеры КБ ушли к конкурентам. КБ полгода работает медленнее.','bad');}
    const c=s.country,d=dealerCount(s,c);if(d>=4&&s.late%3===2){const n=Math.max(1,Math.round(d*0.04));s.dealers[c]=d-n;addLog(`Дилеры не получают машин и денег вовремя: ${fmtN(n)} ${plural(n,'ушёл','ушли','ушли')} к конкурентам.`,'bad');}}}
  else s.late=0;}

/* ---------- налог на сверхприбыль («военный налог») ----------
   0.25: настоящие сроки и ставки по странам. Налог брали не со всей прибыли, а со «сверхприбыли» — сверх нормы:
   довоенной прибыли (среднее 1911–1913 годов) или процента на вложенный капитал (в США — 8%). Война кончилась,
   а налог платили ещё годы: казне нужно было гасить военные долги. Закон часто принимали задним числом —
   тогда в месяц принятия приходит счёт за всё время с начала его действия.
   lia — с какого месяца считается, law — когда принят (платёж задним числом), end — последний месяц;
   k — ставки по годам: [на сверхприбыль до 1,5 нормы, на сверхприбыль сверх неё]; norm — процент на капитал в год.
   США: 1917 — 20–60% по доходности; 1918 — 30% и 65%; 1919–1921 — 20% и 40%; отменён с 1922 года (закон 1921 года).
   Британия: Excess Profits Duty с августа 1914 года (принят в сентябре 1915-го) — 50%, 1916 — 60%, 1917–1918 — 80%, 1919 — 40%, 1920 — 60%; отменён в 1921 году.
   Франция: закон 1 июля 1916 года, с августа 1914 года и до середины 1920-го — 50%, на крупную сверхприбыль 60%, потом 80%.
   Италия: декрет ноября 1915 года (задним числом с августа 1914-го) — 10–30%, с 1916 года 20–60% по доходности; в 1920 году — закон о конфискации военных сверхприбылей.
   Германия: Kriegssteuergesetz 1916 года, военные сборы 1918 и 1919 годов (ставки упрощены). */
const WAR_TAX={
  us:{lia:[1917,0],law:[1917,9],end:[1921,11],norm:0.08,k:{1917:[0.25,0.45],1918:[0.3,0.65],1919:[0.2,0.4],1920:[0.2,0.4],1921:[0.2,0.4]},
    name:'налог на сверхприбыль (США, 1917–1921)',why:'Военный налог на сверхприбыль: с 1917 по 1921 год — 20–65% прибыли сверх нормы (8% на вложенный капитал или довоенная прибыль). Война кончилась, а долги остались: налог отменят только с 1922 года.'},
  uk:{lia:[1914,7],law:[1915,8],end:[1921,5],norm:0.07,k:{1914:[0.5,0.5],1915:[0.5,0.5],1916:[0.6,0.6],1917:[0.8,0.8],1918:[0.8,0.8],1919:[0.4,0.4],1920:[0.6,0.6],1921:[0.6,0.6]},
    name:'налог на сверхприбыль (Excess Profits Duty)',why:'Excess Profits Duty — налог на сверхприбыль сверх довоенной: с августа 1914 года (закон — сентябрь 1915-го, задним числом) 50%, в 1917–1918 годах 80%, в 1919-м 40%, в 1920-м 60%. Отменён в 1921 году.'},
  fr:{lia:[1914,7],law:[1916,6],end:[1920,5],norm:0.06,k:{1914:[0.5,0.5],1915:[0.5,0.5],1916:[0.5,0.5],1917:[0.5,0.6],1918:[0.5,0.8],1919:[0.5,0.8],1920:[0.5,0.8]},
    name:'военный налог на сверхприбыль',why:'Чрезвычайный налог на военную сверхприбыль: закон 1 июля 1916 года, задним числом с августа 1914-го — 50%, на крупную сверхприбыль до 80%. Действовал до середины 1920 года.'},
  it:{lia:[1914,7],law:[1915,10],end:[1920,11],norm:0.08,k:{1914:[0.15,0.3],1915:[0.15,0.3],1916:[0.3,0.6],1917:[0.3,0.6],1918:[0.3,0.6],1919:[0.3,0.6],1920:[0.5,0.8]},
    name:'налог на военные сверхприбыли',why:'Налог на военные сверхприбыли: декрет ноября 1915 года, задним числом с августа 1914-го — 10–30%, с 1916 года 20–60% (чем выше доходность, тем больше). В 1920 году парламент принял закон о конфискации военных сверхприбылей.'},
  de:{lia:[1914,7],law:[1916,5],end:[1919,11],norm:0.06,k:{1914:[0.3,0.45],1915:[0.3,0.45],1916:[0.3,0.45],1917:[0.3,0.45],1918:[0.3,0.6],1919:[0.4,0.6]},
    name:'военный налог на прирост прибыли',why:'Kriegsgewinnsteuer — военный налог на прирост прибыли и имущества: закон 21 июня 1916 года (задним числом с начала войны), новые сборы в 1918 и 1919 годах.'}};
function warTaxOf(s){return WAR_TAX[s.country]||null;}
function warTaxYears(s){const W=warTaxOf(s);return W?[W.lia[0],W.end[0]]:[1915,1921];}
const ymOf=a=>a[0]*12+a[1];
// облагаемая норма в месяц: довоенная прибыль или процент на вложенный капитал (касса, завод, склад, деньги в пути — минус долг)
function warTaxNorm(s,W){const pre=s.pwN?s.pwP/s.pwN:0,cap=Math.max(0,s.plantVal+stockValue(s)+(typeof arTotal==='function'?arTotal(s):0)+Math.max(0,s.cash)-(s.loan||0));
  return Math.max(pre,cap*W.norm/12,1500*cpi(s));}
function warTax(s,r){const y=s.y;if(y>=1911&&y<=1913){s.pwP=(s.pwP||0)+Math.max(0,r.profit);s.pwN=(s.pwN||0)+1;}
  const W=warTaxOf(s);if(!W)return 0;const t=y*12+s.m;if(t<ymOf(W.lia)||t>ymOf(W.end))return 0;
  let tax=0;if(r.profit>0){const nm=warTaxNorm(s,W),ex=r.profit-nm,k=W.k[y]||W.k[W.end[0]];
    if(ex>0){const lo=Math.min(ex,nm*1.5);tax=lo*k[0]+(ex-lo)*k[1];}}
  // закон принят задним числом: до его принятия налог копится, в месяц принятия — счёт за всё время
  if(t<ymOf(W.law)){s.wtaxDue=(s.wtaxDue||0)+tax;r.wtaxAcc=tax;return 0;}
  if(s.wtaxDue){r.wtaxBack=s.wtaxDue;tax+=s.wtaxDue;s.wtaxDue=0;}
  s.wtaxSum=(s.wtaxSum||0)+tax;return tax;}
// газета: налог ввели (со счётом задним числом) и отменили
function warTaxNews(s){const W=warTaxOf(s);if(!W)return;const t=s.y*12+s.m;s.wtaxSaid=s.wtaxSaid||{};
  if(t===ymOf(W.law)&&!s.wtaxSaid.law){s.wtaxSaid.law=1;const back=s.wtaxDue||0;
    pushEvent({kicker:'Налоги',title:'Налог на сверхприбыль',deck:W.name,text:W.why+(back>1?`\nЗа время с начала действия закона «${s.company}» должна казне ${money(back)} — счёт придёт в этом месяце.`:'\nЗаводы, которые зарабатывают не больше нормы, налога не платят.')},true);}
  if(t===ymOf(W.end)+1&&!s.wtaxSaid.end){s.wtaxSaid.end=1;
    pushEvent({kicker:'Налоги',title:'Налог на сверхприбыль отменён',deck:'Военные налоги уходят в прошлое',text:`${W.why}\nС этого месяца «${s.company}» платит только обычный налог на прибыль.${s.wtaxSum>1?` Всего за эти годы налог на сверхприбыль взял ${money(s.wtaxSum)}.`:''}`},true);}}

/* ---------- почему упали продажи ---------- */
// Раз в квартал: продажи модели (с поправкой на сезон) против прошлого квартала; если упали больше чем на 20% — причина в журнал
function salesWhy(s){const t=mi(s);
  s.models.filter(m=>m.status==='prod'||m.status==='sale').forEach(md=>{const adj=(md.lastSold||0)/(SEASON[(s.m+11)%12]||1);md.qS=(md.qS||0)+adj;md.qN=(md.qN||0)+1;
    // снимок причин на начало квартала
    if(md.qN<3)return;const q=md.qS/3,prev=md.qPrev,snap=md.qSnap;md.qPrev=q;md.qS=0;md.qN=0;md.qSnap=whySnap(md,s);
    if(!prev||prev<10||q>prev*0.8||!snap)return;const drop=Math.round((1-q/prev)*100),W=[];const now=md.qSnap;
    if(now.price>snap.price*1.03)W.push([now.price/snap.price-1,`вы подняли цену до ${money(md.price)}`]);
    if(now.cut>snap.cut+0.01)W.push([now.cut-snap.cut,`конкуренты снизили цены на ${Math.round((now.cut-snap.cut)*100)}%`]);
    if(now.boost>snap.boost+0.05)W.push([now.boost-snap.boost,'конкуренты выпустили модель-ответ']);
    if(now.f<snap.f*0.92)W.push([1-now.f/snap.f,now.ev||'покупателей стало меньше']);
    if(now.tar>snap.tar+0.03)W.push([now.tar-snap.tar,'за границей подняли пошлину']);
    if(now.sc<snap.sc-0.05)W.push([snap.sc-now.sc,'скандал с качеством']);
    if(now.rep<snap.rep-4)W.push([(snap.rep-now.rep)/50,'репутация упала']);
    if(now.age>=6&&now.age>snap.age)W.push([0.05*(now.age-5),'модель устарела — покупатели ждут новинку']);
    if(now.dl<snap.dl*0.95)W.push([1-now.dl/snap.dl,'дилеров стало меньше']);
    if(now.q<snap.q*0.97)W.push([1-now.q/snap.q,'соперники выпустили машины лучше']);
    if((now.used||0)>(snap.used||0)+0.02)W.push([now.used-(snap.used||0),'у перекупщиков много подержанных машин вашей марки — новая модель отвлечёт от них покупателей']);
    W.sort((a,b)=>b[0]-a[0]);addLog(`Продажи «${md.name}» за квартал упали на ${drop}%: ${W.length?W.slice(0,2).map(x=>x[1]).join('; '):'спрос просто колеблется'}.`,'bad');});}
function whySnap(md,s){const c=s.country,g=segOf(md),ec=econ(s.y,s.m,c);let tar=0,n=0;for(const k in (md.soldBy||{}))if(k!==c){tar+=(typeof tariffOf==='function'?tariffOf(md,k,s):tariffAt(k,s)*impTar(s,k))*md.soldBy[k];n+=md.soldBy[k];}
  return {price:md.price,cut:respCut(s,c,g)+(1-pwOf(s,c,g)),boost:respBoost(s,c,g)+rivalBoost(s,c,g),f:ec.f,ev:ec.label==='Стабильно'?'':ec.label.toLowerCase()+' — покупателей меньше',tar:n?tar/n:0,
    sc:scandalEffect(md,s),used:usedPen(md,c,s),rep:s.rep,age:(mi(s)-(md.launched||0))/12,dl:dealerCount(s,c)||1,q:(()=>{try{return classScore(md,s);}catch(_){return 1;}})()};}

/* ---------- всё за месяц ---------- */
function econMonth(s,r){try{turnover(s,r);}catch(e){console.warn(e);}try{promoClean(s);}catch(e){console.warn(e);}try{rivalsRespond(s,r);}catch(e){console.warn(e);}try{poachMonth(s,r);}catch(e){console.warn(e);}
  try{qualityMonth(s);}catch(e){console.warn(e);}try{salesWhy(s);}catch(e){console.warn(e);}}
