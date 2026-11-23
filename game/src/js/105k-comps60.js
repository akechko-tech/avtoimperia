/* ================= 0.60, этап 4: СОПЕРНИКИ 1930–1960 — правила =================
   1. Выпуск марки после 1929 года — её доля рынка страны × рынок страны (данные и объяснение — 03e-comps60.js).
   2. Классы марки могут меняться со временем (mixT): Packard с 1935 года — средний класс, Renault с 1947-го — народный.
   3. Новый ход фирмы — «выход в соседний класс» (17c-firms.js: программа enter). Здесь — список таких линий и их вес в классе. */
Object.assign(BRAND_GROUP,GROUP60);
// --- классы марки на год часов COMP_CLK (часы ставит compVol: она вызывается перед любым чтением классов марки)
function c60MixAt(cp,y){let m=cp.mix0;(cp.mixT||[]).forEach(x=>{if(y>=x[0])m=x[1];});return m;}
(function(){for(const c in COMPS)COMPS[c].forEach(cp=>{if(!cp.mixT)return;cp.mix0=cp.mix;Object.defineProperty(cp,'mix',{get(){return c60MixAt(this,COMP_CLK);},enumerable:true,configurable:true});});})();
// --- рынок, от которого считается доля марки: легковые; у марки грузовиков — грузовые
function c60Mkt(cp,y){const mx=cp.mixT?c60MixAt(cp,y):cp.mix,tr=((mx&&mx.truck)||0)>=0.5;return Math.max(1,mktAt((tr?MKT_TRUCK:MKT)[cp.c60],y));}
// таблица долей: 1929 год — по последнему числу прежней таблицы выпуска, дальше — опорные точки
function c60Tab(cp){if(cp._sh)return cp._sh;const T={},a=cp.a60||{};
  if(!cp.new60&&!(cp.until&&cp.until<=1930))T[1929]=tabAt(cp.v,1929.5,true)/c60Mkt(cp,1929.5);
  for(const y in a){const v=a[y];T[+y]=v<1?v:v*1000/c60Mkt(cp,+y+0.01);}
  if(!Object.keys(T).length)T[cp.since||1930]=0;
  return cp._sh=T;}
function comp60Share(cp,t){return Math.max(0,tabAt(c60Tab(cp),t));}
// выпуск за год: доля × рынок. Пока доля есть, марка жива и в год без рынка (1943–1945): не меньше одной машины
function comp60Vol(cp,t){const sh=comp60Share(cp,t);return sh>0?Math.max(1,sh*c60Mkt(cp,t)):0;}
/* ---------- выход в соседний класс ----------
   Образцы (claude/issledovanie-soperniki-1930-1960.md): Packard «One Twenty» (1935) — дорогая марка в среднем классе, продажи
   за год выросли больше чем втрое; Plymouth у Chrysler (в таблице выпуска с 1930 года — третья марка Америки к 1932-му).
   Линия — запись F.ext[класс] у фирмы: {from, y}. Её вес в классе — часть обычного выпуска фирмы, но не больше доли класса;
   за три года линия выходит на полный вес. Она — сверх истории и прибавляется к классу целиком, как экспорт живых марок.
   Покупателей линия отбирает у всех марок класса; спрос игрока сам по себе не урезается. */
const EXT_ADJ={people:['middle'],middle:['people','lux'],lux:['middle']},
  EXT_VOL=globalThis.EXTVOL??0.5,      // линия в новом классе — до половины обычного выпуска фирмы
  EXT_CLASS=globalThis.EXTCLASS??0.2,  // и не больше пятой части класса
  EXT_YOU=0.35,                        // повод: одна марка (вы) держит от 35 % класса, где у фирмы машин нет
  EXT_GAP=60,                          // в один класс страны — не чаще раза в пять лет
  EXT_MAX=2,                           // и не больше двух таких линий в классе разом
  EXT_MIN=0.03;                        // фирма должна быть заметной: её линия — от 3 % класса
function extList(s,c,g){return (s.extL&&s.extL[c]&&s.extL[c][g])||[];}
function extLive(s,c,g){return extList(s,c,g).filter(i=>{const F=s.firms&&s.firms[c+':'+i];return F&&F.st!=='dead'&&F.ext&&F.ext[g];}).length;}
function extAdd(s,F,g,t,you){F.ext=F.ext||{};F.ext[g]={from:t,y:Math.floor(1895+t/12),you:you||0};const X=s.extL=s.extL||{},A=X[F.c]=X[F.c]||{},L=A[g]=A[g]||[];if(!L.includes(F.i))L.push(F.i);(s.extT=s.extT||{})[F.c+':'+g]=t;}
function extDrop(s,F,g){if(F.ext)delete F.ext[g];const L=extList(s,F.c,g),k=L.indexOf(F.i);if(k>=0)L.splice(k,1);if(F.pk)delete F.pk[g];if(F.md)delete F.md[g];if(F.rs)delete F.rs[g];if(F.rg)delete F.rg[g];if(F.sh)delete F.sh[g];}
// строки для compWeights: линии фирм, вышедших в этот класс сверх истории
function firmExts(s,c,g,S){const I=extList(s,c,g);if(!I.length||!firmsOn(s))return [];const out=[],t=mi(s),L=COMPS[c]||[];
  I.forEach(i=>{const F=s.firms&&s.firms[c+':'+i],cp=L[i];if(!F||!cp||F.st==='dead'||!F.ext||!F.ext[g]||pkIs(cp,s)||acqHas(s,c,i))return;const cv=compVol(cp,s);if(cv<=0)return;
    const ramp=clamp((t-F.ext[g].from+6)/36,0.15,1),v=Math.min(cv*EXT_VOL,S*EXT_CLASS)*ramp;if(v>0)out.push({cp,i,v,ext:1});});
  return out;}
function firmSegsF(F,cp){const L=firmSegs(cp);if(F&&F.ext)for(const g in F.ext)if(!L.includes(g))L.push(g);return L;}
// куда фирме выгодно выйти: соседний класс, где её машин нет, а вы держите от 35 % продаж
function firmEnterPick(s,F,cp,SG){if(globalThis.EXTOFF)return null;/* EXTOFF — замер «без выхода в соседний класс» */const t=mi(s);let best=null;
  firmSegs(cp).forEach(g0=>{if((cp.mix[g0]||0)<0.3)return;(EXT_ADJ[g0]||[]).forEach(g=>{if((cp.mix[g]||0)>0||(F.ext&&F.ext[g]))return;const z=SG&&SG[g];if(!z||!(z.size>0))return;
    const you=(z.you||0)/z.size;if(you<EXT_YOU||extLive(s,F.c,g)>=EXT_MAX)return;const last=s.extT&&s.extT[F.c+':'+g];if(last!=null&&t-last<EXT_GAP)return;
    const S=segAnnual(F.c,g,s);if(S<200)return;   // класса в стране почти нет — выходить некуда
    if(compVol(cp,s)*EXT_VOL<S*EXT_MIN)return;   // мастерская класс не сдвинет: линия должна тянуть хотя бы на 3 % класса
    if(!best||you>best.you)best={g,g0,you};});});
  return best;}
const EXT_DIR={'people>middle':'подороже','middle>lux':'подороже','middle>people':'подешевле','lux>middle':'подешевле'};
function firmEnterStart(s,r,F,cp,SG,bot){const E=firmEnterPick(s,F,cp,SG);if(!E)return false;const t=mi(s),N=firmName(s,F),R=F.h12,cost=Math.max(20000*cpi(s),R*0.12),mon=Math.round((18+Math.random()*6)*(bot?0.85:1));
  F.cash-=cost;F.prog={k:'enter',g:E.g,g0:E.g0,at:t+mon,cost,you:E.you};(s.extT=s.extT||{})[F.c+':'+E.g]=t;
  firmNote(s,r,F,{w:3,k:'enter0',t:`${N} готовит машину ${EXT_DIR[E.g0+'>'+E.g]||''} — в ваш класс`,txt:`«${s.company}» держит ${Math.round(E.you*100)}% продаж ${SEG_LOC[E.g]||''} ${BOT_IN[F.c]}, а у ${N} машин этого класса нет. Марка заложила ${money(cost)} на новую модель ${EXT_DIR[E.g0+'>'+E.g]||''} своих и новые цеха под неё — выйдет примерно через ${mon} мес. Так в 1935 году Packard, марка дорогих машин, вывел «One Twenty» в средний класс: за год продажи марки выросли больше чем втрое.`});
  return true;}
function firmEnterDone(s,r,F,cp,P){const t=mi(s),N=firmName(s,F),g=P.g,z=r.mk&&r.mk[F.c]&&r.mk[F.c].segs&&r.mk[F.c].segs[g];
  if(F.st!=='ok'||pkIs(cp,s)||(cp.mix[g]||0)>0)return;extAdd(s,F,g,t,z&&z.size>0?(z.you||0)/z.size:P.you);
  // машину делали против вашей: половину вашего перевеса в качестве новинка перенимает сразу
  const q=clamp(0.5*((z&&z.edgeQ)||0),0,0.6);if(q>0.03)F.md[g]={q,from:t,till:t+60,name:'',who:`«${s.company}»`,you:1};
  const sh=Math.round(Math.min(EXT_CLASS,compVol(cp,s)*EXT_VOL/Math.max(1,segAnnual(F.c,g,s)))*100);
  firmNote(s,r,F,{w:4,k:'enter',t:`${N} вышла ${SEG_INTO[g]||'в новый класс'}`,txt:`${N} начала продавать ${BOT_IN[F.c]} машину ${SEG_GEN[g]||''}. Цеха рассчитаны примерно на ${sh}% класса; на полный выпуск линия выйдет за три года. Покупателей она отбирает у всех марок класса — у вас тоже. Дальше марка ведёт себя здесь как любая другая: отвечает ценой и новой моделью, а если линия не окупится — снимет её.`});}
// линия не окупилась: два с половиной года спустя продаёт меньше половины того, что взяла бы рядовая марка при вашей доле
// на день выхода (вы держали you класса — рядовой марке достаётся её вес × (1 − you)) — снимают
const EXT_FAIL=0.5;
function firmExtCheck(s,r,F,cp){if(!F.ext)return;const t=mi(s);for(const g in F.ext){const E=F.ext[g];if(t-E.from<30)continue;const rs=F.rs&&F.rs[g];if(rs!=null&&rs<EXT_FAIL*(1-clamp(E.you||0,0,0.8))){extDrop(s,F,g);
      firmNote(s,r,F,{w:3,k:'exit',t:`${firmName(s,F)} ушла ${SEG_OUT[g]||'из класса'}`,txt:`Линия ${firmName(s,F)} ${SEG_LOC[g]||''} ${BOT_IN[F.c]} не окупилась: продавали меньше половины расчётного. Марка сняла машину с производства и вернулась к своему классу.`});}}}
const SEG_INTO={people:'в народный класс',middle:'в средний класс',lux:'в класс люкс'},SEG_OUT={people:'из народного класса',middle:'из среднего класса',lux:'из класса люкс'};
// кого не распродают при втором разорении: марку исторического концерна ('grp') и фирму от 5 % рынка своей страны ('big')
function firmKept(s,cp){const g=BRAND_GROUP[cp.n];if(g!=null&&s.y>=g)return 'grp';const c=cp.c60;if(!c)return false;return compVol(cp,s)/((s.compK&&s.compK[cp.fk||cp.n])||1)>=0.05*mktAt(MKT[c],yf(s))?'big':false;}
