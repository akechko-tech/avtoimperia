/* ================= 0.51, этап 5б: ФИРМЫ — ГРУППЫ, ЛЮДИ, ОБИДЫ =================
   Остаток темы 4 ТЗ. Автор (21 ноября): «Что такое концерн? Как он меняет экономику других участников процесса?» —
   раньше «объединение в концерн» было вечным вычетом из спроса игрока. Теперь это ход фирмы:
     • здоровая марка с деньгами покупает соседа в долгах (до того как завод возьмут кредиторы). Купленная марка остаётся отдельной
       маркой, но за ней касса хозяина, а его поток и рассрочка приходят к ней через год-два. Меняется её экономика, а не спрос игрока;
     • фирма, готовя ответ игроку, переманивает его главного конструктора (Fiat, 1922–1923: Бертарионе и Беккиа ушли в Sunbeam,
       Бацци и Яно — в Alfa Romeo); удержать можно прибавкой. Переманивать у фирмы может и игрок;
     • команда-соперник зовёт лучшего гонщика игрока, когда тот выигрывает слишком много;
     • фирма помнит обиду (иск, переманенный инженер): дороже продаётся и раньше отвечает.
   Образцы и источники — claude/issledovanie-sdelki-0.51.md. */
const FIRM_MERGE_P=0.65,     // с какой вероятностью находится покупатель среди фирм, когда он есть
  FIRM_MERGE_PRICE=0.12,     // цена марки в долгах — доля её обычной годовой выручки, плюс 60 % её долгов
  POACH_GAP=60,              // инженера переманивают не чаще (мес.)
  POACH_P=0.4,
  POACH_SLOW=1.15,POACH_SLOW_M=18,   // ушёл главный конструктор: проекты КБ идут дольше
  POACH_GAIN=0.9,POACH_GAIN_M=24,    // переманили чужого: проекты КБ идут быстрее
  POACH_FRAC=0.15,           // модель-ответ фирмы перенимает на столько больше перевеса игрока
  STAR_GAP=36,STAR_WIN=0.4;  // лучшего гонщика зовут, когда игрок выиграл больше этой доли гонок года
const MERGE_SAY={us:'Так в 1928 году Chrysler купил Dodge и одним ходом встал рядом с Ford и General Motors.',uk:'Так в 1927 году Моррис купил Wolseley у управляющего по банкротству, перебив на торгах Остина.',
  de:'Так в 1926 году Daimler и Benz, по отдельности не тянувшие кризис, слились в Daimler-Benz.',fr:'Так в 1925 году Citroën забрал заводы Mors.'};
function buffSet(s,k,v,mo){const B=s.sagaB=s.sagaB||{},now=mi(s),o=B[k];if(o&&now<o.until){o.v=o.v*v;o.until=Math.max(o.until,now+mo);}else B[k]={v,until:now+mo};}
/* ---------- группа: марка под крышей другой фирмы ---------- */
function firmGroupMonth(s,r,F,cp){const O=firmOwner(s,F);if(!O)return;const t=mi(s);
  if(O.st==='dead'){F.own=null;return;}
  if(t-(F.ownT||0)>=24&&firmCk(O,t)<0.97&&firmCk(F,t)>=0.97){F.ck=(1+O.ck)/2;F.lineT=t;F.ckTill=O.ckTill;
    firmNote(s,r,F,{w:3,k:'line',t:`${firmName(s,F)}: завод перестроен по образцу ${firmName(s,O)}`,txt:`${firmName(s,O)} перенесла свой поток на завод ${firmName(s,F)}: себестоимость там упала на ${Math.round((1-F.ck)*100)}%. Отдельно ${firmName(s,F)} на это денег не нашла бы.`});}
  if(t-(F.ownT||0)>=12&&firmFin(O,t)&&!firmFin(F,t)){F.fin=1;F.finTill=O.finTill;
    firmNote(s,r,F,{w:2,k:'fin',t:`${firmName(s,F)} продаёт в рассрочку`,txt:`Кредитная контора ${firmName(s,O)} теперь работает и на ${firmName(s,F)}: машину можно взять с первым взносом.`});}}
// марка в долгах: до кредиторов её покупает соседняя фирма с деньгами
// Не продаются: марки, уже входящие в концерн по истории (Buick, Oldsmobile, заграничные заводы Форда — за них решает концерн),
// и гордые марки («моё имя на радиаторе не продаётся»). Заграничный завод чужой марки сам никого не покупает.
function firmMergeOk(s,cp){const g=typeof BRAND_GROUP!=='undefined'?BRAND_GROUP[cp.n]:null;if(g!=null&&s.y>=g)return false;const pr=(typeof DEAL_PROUD!=='undefined'&&(DEAL_PROUD[compName(cp,s)]??DEAL_PROUD[cp.n]))||0;return !(pr>0&&maRnd(cp.n+'|proud|'+s.y)<pr);}
function firmMerge(s,r,F,cp,i){if(!firmsOn(s)||F.own!=null||F.mo||F.kf||!firmMergeOk(s,cp))return false;const t=mi(s),R=F.h12,debt=Math.max(0,-F.cash),need=R*FIRM_MERGE_PRICE+debt*0.6;
  let O=null,oi=-1;(COMPS[F.c]||[]).forEach((c2,j)=>{if(j===i||(typeof BRAND_GROUP!=='undefined'&&BRAND_GROUP[c2.n]===0))return;const X=firmGet(s,F.c,j);if(!X||X.st!=='ok'||X.own!=null||holdOf(s,F.c,j))return;if(X.h12<R*0.6||X.cash<need*1.2)return;if(!O||X.cash>O.cash){O=X;oi=j;}});
  if(!O||Math.random()>FIRM_MERGE_P)return false;
  O.cash-=need;F.cash=R*0.05;F.st='ok';F.bad=0;F.own=oi;F.ownT=t;F.turn=1;F.prog=null;F.capP=null;F.pk={};F.rg={};F.rs={};(O.grp=O.grp||[]).push(i);
  const ON=firmName(s,O),N=firmName(s,F),n=O.grp.length+1;
  firmNote(s,r,O,{w:4,k:'merge',t:`${ON} покупает ${N}`,txt:`${N} не выбралась из долгов, и её купила ${ON} — за ${money(need)}, считая долги. ${N} остаётся отдельной маркой, но теперь за ней касса ${ON}: закрыть её стало труднее, а поток и рассрочка хозяина придут и на её завод. Под одной крышей — ${n} ${plural(n,'марка','марки','марок')}. ${MERGE_SAY[F.c]||''}`});
  return true;}
/* ---------- люди ---------- */
function poachCost(s){return Math.max(2000*cpi(s),Math.round((rdUpkeep(s)||0)*6/100)*100);}
// фирма, готовя ответ игроку, зовёт его главного конструктора
function firmPoachEng(s,r,F,g){if(F.mo||DIF().simple||s.mode==='racer'||s.over||s.pending.length||s.poachEng)return false;const t=mi(s);
  if(!s.rd||(s.rd.lvl||0)<2||t-(s.poachEngT??-999)<POACH_GAP||F.cash<=0||Math.random()>POACH_P)return false;
  const N=firmName(s,F),cost=poachCost(s);s.poachEngT=t;s.poachEng={c:F.c,i:F.i,n:N,cost,g};
  pushEvent({kicker:'КБ',own:1,title:`${N} переманивает вашего главного конструктора`,deck:`удержать — ${money(cost)}`,
    text:`${N} готовит ответ вашей машине и начала с людей: вашему главному конструктору предложили вдвое больше и свой отдел.\nУдержать его можно прибавкой и премией — ${money(cost)} сразу. Отпустите — проекты вашего КБ полтора года будут идти на ${Math.round((POACH_SLOW-1)*100)}% дольше, а новая модель ${N} переймёт заметно больше вашего перевеса.\nТак в 1922–1923 годах лучшие инженеры Fiat ушли к соперникам: Бертарионе и Беккиа — в Sunbeam («английский Фиат» выиграл Гран-при Франции 1923 года), Бацци и Яно — в Alfa Romeo. Яно получал 1800 лир в месяц; ему предложили 3500.`,
    choices:[[`Удержать: ${money(cost)}`,'eng:keep'],['Отпустить','eng:let']]},false);return true;}
function engResolve(s,key){const P=s.poachEng;if(!P)return;s.poachEng=null;const F=firmGet(s,P.c,P.i);
  if(key==='eng:keep'&&s.cash>=P.cost){s.cash-=P.cost;addLog(`Главный конструктор остаётся: прибавка и премия — ${money(P.cost)}.`,'good');return;}
  buffSet(s,'devTime',POACH_SLOW,POACH_SLOW_M);
  if(F&&F.prog&&F.prog.k==='model'&&F.prog.you){const Pg=F.prog;Pg.frac=Math.min(0.95,Pg.frac+POACH_FRAC);Pg.q=clamp((Pg.q0||0)+(Pg.lq||0)*Pg.frac,0.05,1.2);Pg.poach=1;}
  addLog(`${key==='eng:keep'?'Денег на прибавку не нашлось — главный':'Главный'} конструктор ушёл в ${P.n}. Проекты КБ полтора года идут дольше; новая модель ${P.n} переймёт больше вашего перевеса.`,'bad');}
// игрок переманивает инженера у фирмы (кнопка в карточке соперника)
function rivPoachCost(s,F){return Math.round(Math.max(5000*cpi(s),poachCost(s)*1.5)/1000)*1000;}   // полтора «удержания»: девять месячных бюджетов своего КБ
function rivPoachCan(s,F){return !!(F&&!F.mo&&F.st!=='dead'&&s.rd&&(s.rd.lvl||0)>=2&&mi(s)-(s.poachMyT??-999)>=POACH_GAP&&((F.prog&&F.prog.k==='model')||Object.values(F.md||{}).some(M=>M&&mi(s)<M.till)));}
function rivPoach(s,c,i){const F=firmGet(s,c,i);if(!rivPoachCan(s,F))return false;const cost=rivPoachCost(s,F);if(s.cash<cost)return false;const t=mi(s),N=firmName(s,F);
  s.cash-=cost;s.poachMyT=t;buffSet(s,'devTime',POACH_GAIN,POACH_GAIN_M);F.lostT=t;F.gr=Math.min(1,(F.gr||0)+0.35);F.grWhy=`переманили инженера, ${s.y}`;
  if(F.prog&&F.prog.k==='model'){F.prog.at+=6;F.prog.frac=Math.max(0.3,F.prog.frac-0.1);if(F.prog.q0!=null)F.prog.q=clamp(F.prog.q0+(F.prog.lq||0)*F.prog.frac,0.05,1.2);}
  addLog(`Ведущий инженер ${N} перешёл в ваше КБ за ${money(cost)}: два года проекты идут на ${Math.round((1-POACH_GAIN)*100)}% быстрее. Следующая модель ${N} задержится на полгода. Обиду там запомнят.`,'good');return true;}
// раз в год: команда-соперник зовёт лучшего гонщика, если игрок выигрывает слишком много
function firmsPeople(s,r){if(s.m!==10||DIF().simple||s.mode==='racer'||s.over||s.pending.length||s.poachNow||!(s.drivers||[]).length)return;const t=mi(s);
  if(t-(s.poachStarT??-999)<STAR_GAP)return;const Y=(s.raceLog||[]).filter(x=>x.y===s.y&&x.cls!=='moto');if(Y.length<4)return;const W=Y.filter(x=>x.place===1);if(W.length/Y.length<STAR_WIN)return;
  if(maRnd('star|'+s.y+'|'+s.company)>0.6)return;
  const cnt={};W.forEach(x=>{if(x.drv)cnt[x.drv]=(cnt[x.drv]||0)+1;});const D=s.drivers.map(id=>DRIVERS.find(d=>d.id===id)).filter(Boolean);if(!D.length)return;
  D.sort((a,b)=>((cnt[b.n]||0)-(cnt[a.n]||0))||(b.sk-a.sk));const d=D[0];
  const T=RACE_TEAMS.filter(x=>x.from<=s.y&&x.to>=s.y&&!pkIs(x,s)).sort((a,b)=>b.str-a.str).slice(0,3),tm=T.length?T[Math.floor(maRnd('star2|'+s.y)*T.length)]:{n:'соперники'};
  const cost=Math.round(driverSalary(d,s)*12/10)*10;s.poachStarT=t;s.poachNow={id:d.id,team:tm.n,cost};
  pushEvent({kicker:'Команда',title:`${tm.n} зовёт к себе ${d.n}`,deck:`вы выиграли ${W.length} из ${Y.length} гонок года — соперники отвечают`,img:IMG[DRIVER_WIKI[d.id]]?DRIVER_WIKI[d.id]:'',imgCap:d.n,
    text:`Вы выиграли ${W.length} из ${Y.length} гонок сезона, и команда ${tm.n} решила не догонять вашу машину, а купить вашего гонщика: ${d.n} предложили контракт вдвое дороже.\nУдержать его можно прибавкой и премией — ${money(cost)} сразу. Иначе в следующем сезоне он выйдет на старт против вас.`,
    choices:[[`Удержать: ${money(cost)}`,'poachKeep'],['Отпустить','poachLet']]},false);}
/* ---------- карточка фирмы: группа, обида, кнопка ---------- */
function firmCardExtra(s,F,I,L,mo){const O=firmOwner(s,F);if(O)L.push(`Принадлежит <b>${esc(firmName(s,O))}</b> с ${Math.floor(1895+(F.ownT||0)/12)} года: за ней касса хозяина`);
  if(F.grp&&F.grp.length){const N=F.grp.map(j=>firmGet(s,F.c,j,mo)).filter(X=>X&&X.own===F.i&&X.st!=='dead').map(X=>esc(firmName(s,X)));if(N.length)L.push(`Группа: владеет ${N.join(', ')}`);}
  if(F.gr>0.1)L.push(`<span class="warn">Помнит обиду</span>${F.grWhy?` (${esc(F.grWhy)})`:''}: дороже продаётся и раньше отвечает на ваши ходы`);
  if(F.prog&&F.prog.poach)L.push('Над новой моделью работает ваш бывший главный конструктор');}
function firmCardBtn(s,F,I,mo){if(mo||!rivPoachCan(s,F))return '';const c=rivPoachCost(s,F);
  return `<button class="btn sm" style="margin-top:6px" data-act="rivPoach" data-c="${F.c}" data-i="${F.i}" ${s.cash<c?'disabled':''}>Переманить инженера · ${money(c)}</button>`;}
/* ---------- тракторные заводы: фирма и в «своём» пуле фермеров ----------
   На этапе 4 у тракторов соперник был «эталон из истории» — безымянный и неподвижный. Теперь у ведущего тракторного завода страны
   та же экономика, что у марок: цена, модель-ответ, завод, касса. Образец — тракторная война 1922 года: Форд снизил цену «Фордзона»
   с 625 до 395 долларов; International Harvester ответила ценой, потом машиной (вал отбора мощности, Farmall) и обошла Форда.
   Ведущему заводу отдана половина продаж соперников; остальные идут за ним с половинной силой (как мелкие марки в классах). */
const FARM_SH=0.5,
  FARM_FIRM={us:['International Harvester','J. I. Case'],uk:['Austin (тракторы)','Saunderson'],fr:['Renault (тракторы)','Latil'],de:['Lanz','Hanomag'],it:['FIAT (тракторы)','Pavesi'],ru:['Путиловский завод','Харьковский паровозный']};
function farmName(s,c){const L=FARM_FIRM[c]||['Тракторный завод'],w=String(L[0]).split(/[\s(]/)[0].toLowerCase(),co=String((s&&s.company)||'').toLowerCase();return w&&co.includes(w)?L[1]||L[0]:L[0];}
function farmCp(c,n){return {n:n||'Тракторный завод',fk:'k:'+c+':farm',since:1900,mix:{farm:1},models:[]};}
function farmGet(s,c){return s&&s.firms?s.firms['k:'+c+':farm']:null;}
// во сколько раз соперники в тракторах привлекательнее своей истории (ведущий завод и те, кто идёт за ним)
function farmMult(s,c){const F=farmGet(s,c);if(!F||F.st==='dead'||!firmsOn(s))return 1;const m=firmMult(s,F,'farm');return Math.max(0.2,1+(m-1)*(FARM_SH+(1-FARM_SH)*FIRM_FOLLOW));}
function firmsFarm(s,r){const t=mi(s),SK=firmSkill(),MU=nestMu(s);
  for(const c in (r.mk||{})){const Z=r.mk[c]&&r.mk[c].farm;if(!Z||!(Z.h>0))continue;let F=farmGet(s,c);
    if(!F){if(Z.hrev*12*FARM_SH<FD_MOTO.min*cpi(s))continue;F=s.firms['k:'+c+':farm']={c,i:'farm',kf:1,n:farmName(s,c),pk:{},md:{},ck:1,cap:1.15,fin:0,st:'ok',bad:0,log:[],rg:{},sh:{}};}
    if(F.st==='dead')continue;const cp=farmCp(c,F.n),g='farm',u=Z.riv*FARM_SH,hu=Z.h*FARM_SH,P=Z.h>0?Z.hrev/Z.h:0,pk=F.pk[g]||1,c0=firmCost0(g,FARM_SH,MU),tot=Z.riv+Z.you;
    const rev=u*P*pk,hrev=hu*P,gross=u*P*(pk-c0*firmCostK(F,t)),fixed=hrev*Math.max(0.02,1-c0-FIRM_NET),pft=gross-fixed;
    F.rg[g]=hu>0.05?(F.rg[g]==null?1:F.rg[g])*11/12+Math.min(4,u/hu)/12:1;F.sh[g]=tot>0?u/tot:0;(F.rs=F.rs||{})[g]=tot>0?(F.rs[g]==null?1:F.rs[g])*5/6+Math.min(4,(Z.riv/tot))/6:1;
    F.r12=(F.r12==null?hrev*12:F.r12)*11/12+rev;F.h12=(F.h12==null?hrev*12:F.h12)*11/12+hrev;F.p12=(F.p12==null?hrev*12*FIRM_NET:F.p12)*11/12+pft;F.u12=(F.u12==null?u*12:F.u12)*11/12+u;
    F.ld=F.h12>0?clamp((F.ld==null?1:F.ld)*0.8+0.2*(F.r12/F.h12),0.1,4):1;if(F.cash==null)F.cash=F.h12*0.2;F.cash+=pft>0?pft*0.5*SK.bonus:pft;if(F.gr)F.gr=F.gr>0.02?F.gr*0.985:0;
    if(F.h12<FD_MOTO.min*cpi(s))continue;
    if(firmState(s,r,F,cp,'farm'))continue;
    if(F.prog&&t>=F.prog.at)firmDone(s,r,F,cp);
    if(F.capP&&t>=F.capP.at){F.capP=null;F.cap=Math.min(12,(F.cap||1)*1.6);}
    if(t%3!==0)continue;
    firmPrices(s,r,F,cp,'farm',{farm:{farm:FARM_SH}},false);
    if(F.st==='ok'&&maRnd('kf|'+c+'|'+t)<SK.iq)firmPlan(s,r,F,cp,'farm',{farm:{size:tot,you:Z.you,edge:Z.edge,edgeQ:Z.edgeQ||0,edgeP:Z.edgeP||0,edgeB:Z.edgeB||0}},false);}}
function farmCardHTML(s,c){const F=farmGet(s,c);if(!F||F.st==='dead'||!(F.h12>0))return '';const t=mi(s),g='farm',pk=F.pk[g]||1,yr=m=>Math.floor(1895+m/12),M=F.md[g]&&t>=F.md[g].from&&t<F.md[g].till?F.md[g]:null,net=F.r12>0?F.p12/F.r12:0,L=[];
  L.push(`Продажи за год: <b class="num">${fmtN(Math.round(F.u12||0))}</b> тракторов · ${F.ld>1.05?`на ${Math.round((F.ld-1)*100)}% больше обычного`:F.ld<0.95?`<span class="warn">на ${Math.round((1-F.ld)*100)}% меньше обычного</span>`:'как обычно'}`);
  L.push(`Цена: ${Math.abs(pk-1)<0.02?'обычная':`<b>${pk<1?'−':'+'}${Math.round(Math.abs(1-pk)*100)}%</b> к обычной`}`);
  L.push(`Деньги: ${F.cash>=0?`запас ${money(F.cash)}`:`<span class="${F.st==='bad'?'bad':'warn'}">долг ${money(-F.cash)}</span>`} · прибыль за год ${net>=0?'':'−'}${Math.round(Math.abs(net)*100)}% выручки`);
  if(M)L.push(`Трактор: новая модель ${yr(M.from)} года${M.who?` — ответ ${esc(M.who)}`:''}, на ${Math.round((Math.exp(firmDq(F,g,t)/AQ)-1)*100)}% лучше прежних; в производстве до ${yr(M.till)}`);
  if(F.prog&&F.prog.k==='model')L.push(`<b>Готовит новую модель</b> — ${F.prog.at-t<=1?'в ближайший месяц':`через ${F.prog.at-t} мес.`}${F.prog.who?` (ответ ${esc(F.prog.who)})`:''}`);
  const st=F.st==='bad'?['в долгах','bad']:net>0.03?['прибыльна','good']:['на нуле','muted'];
  return `<div class="tech-row" id="firmk${c}"><div class="row"><div><h3>${esc(F.n)}</h3><p class="small muted">тракторы · ведущий завод страны, за ним идут остальные</p></div><span class="pill ${st[1]}">${st[0]}</span></div><p class="small" style="margin-top:4px">${L.join('<br>')}</p></div>`;}
