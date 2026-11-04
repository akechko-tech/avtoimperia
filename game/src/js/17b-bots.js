/* ================= 0.41: ЖИВЫЕ СОПЕРНИКИ =================
   Отзыв: «соревновательность — цель нестабильная, за другие бренды играют боты, совершающие активные действия, то есть играя
   параллельно, пошагово»; «бот может и должен стремиться выиграть; уровни сложности как в Цивилизации плюс боты более умные
   на более сложных уровнях». Двенадцать марок — по две великие державы на страну — живут своей игрой: после вашего хода каждая
   смотрит, в какой категории господства она ближе всего к цели, и делает ход: снижает или поднимает цены, выпускает модель,
   расширяет завод, идёт за границу (импортёр → отделение → сборка → завод), усиливает гоночную команду, вкладывается в лабораторию
   (и может опередить историю с новинкой), покупает меньшую марку своей страны. Остальные 44 марки — фон по истории, как раньше.
   Связь с рынком: вес бота в разделе класса = историческая кривая × botK (привлекательность и цена, не больше мощности); экспорт —
   доля чужого рынка по уровню присутствия; натиск бота на вас — через contest (как скидки соперников). Без ботов (s.botsOff или
   партия до 0.41 без s.bots) всё считается как раньше: боты меняют историю ровно на свои действия.
   Сложность (DIFFS.bot): iq — вероятность сделать лучший ход (иначе — ничего или случайный дешёвый), bonus — множитель денег бота. */
const BOT_DEF=[{n:'Ford',c:'us',alt:'Chevrolet'},{n:'Buick',c:'us',alt:'Willys-Overland'},{n:'Peugeot',c:'fr',alt:'De Dion-Bouton'},{n:'Renault',c:'fr',alt:'Panhard et Levassor'},
  {n:'Daimler',c:'de',alt:'Benz & Cie.'},{n:'Opel',c:'de',alt:'Adler'},{n:'Humber',c:'uk',alt:'Wolseley'},{n:'Austin',c:'uk',alt:'Morris'},
  {n:'FIAT',c:'it',alt:'Itala'},{n:'Lancia',c:'it',alt:'Alfa Romeo'},{n:'Руссо-Балт',c:'ru',alt:'Лесснер'},{n:'АМО',c:'ru',alt:'НАМИ'}];
const BOT_XP=[0,0.008,0.02,0.04,0.075];   // доля чужого рынка класса по уровню присутствия: импортёр, отделение, сборка, завод
const BOT_XP_N=['','импортёра','отделение','сборку из комплектов','завод'],BOT_XP_COST=[0,0.03,0.08,0.25,0.6],BOT_XP_FLOOR=[0,8000,30000,120000,400000];
const BOT_CAP_MAX=2.5,BOT_Q_MAX=0.35;
const BOT_OPEN={us:0.6,uk:1,fr:0.6,de:0.7,it:0.6,ru:1.2};   // открытость рынка для чужих марок: Британия и Россия ввозили много, Франция и Италия — мало
const BOT_ORDER={scale:['cap','model','export','rd','race'],market:['model','export','cap','race','rd'],sport:['race','model','cap','export','rd'],innov:['rd','model','race','cap','export'],capital:['model','cap','export','rd','race'],brand:['export','race','model','cap','rd']};
const BOT_IN={de:'в Германии',fr:'во Франции',uk:'в Британии',us:'в Америке',it:'в Италии',ru:'в России'};
const SEG_LOC={people:'в народном классе',middle:'в среднем классе',lux:'в классе люкс',sport:'в спортивном классе',truck:'в грузовиках'},SEG_GEN={people:'народного класса',middle:'среднего класса',lux:'класса люкс',sport:'спортивного класса',truck:'— грузовик'};
function botDif(){const D=DIF();return D.bot||{iq:0.7,bonus:1};}
function botsOn(s){if(typeof BOTS_OFF!=='undefined'&&BOTS_OFF)return false;/* прогоны калибровки — без ботов */return !!(s&&s.mode!=='racer');}/* 0.44: соперники всегда живые (отзыв); s.botsOff из 0.41–0.43 больше не учитывается */
// бот по имени марки (и по купленным им маркам — их продажи идут в его зачёт)
function botByBrand(s,n){if(!s||!s.bots)return null;const k=coKey(n);if(s.bots[k]&&!s.bots[k].dead)return s.bots[k];const o=s.botAcq&&s.botAcq[n];return o&&s.bots[o]&&!s.bots[o].dead?s.bots[o]:null;}
function botCp(s,B){const L=COMPS[B.c]||[];for(let i=0;i<L.length;i++)if(L[i].n===B.n)return {cp:L[i],i};return null;}
function botMainSeg(B){const cp=(COMPS[B.c]||[]).find(x=>x.n===B.n),mix=(cp&&cp.mix)||{middle:1};let g='middle',b=-1;for(const k in mix)if(mix[k]>b){b=mix[k];g=k;}return g;}
// присутствие бота в стране: дома и там, где у марки по истории был завод (Ford в Манчестере) — завод; иначе — что построил сам
function botPres(s,B,c){if(c===B.c)return 4;if((COMPS[c]||[]).some(cp=>!cp.imp&&coKey(cp.n)===B.n&&compAlive(cp,s)))return 4;return (B.pres&&B.pres[c])||0;}
function botHistRev(s,B){const X=botCp(s,B);if(!X)return 0;let rev=0;const v=compVol(X.cp,s);for(const g in (X.cp.mix||{}))rev+=v*X.cp.mix[g]*prefP(g,B.c,s);return rev;}
function botsInit(s){s.bots={};s.botAcq=s.botAcq||{};s.botFirsts=s.botFirsts||{};s.botNews=s.botNews||[];
  BOT_DEF.forEach((d,i)=>{let n=d.n;const cp0=(COMPS[d.c]||[]).find(x=>x.n===n);if(!cp0||pkIs(cp0,s))n=d.alt;if(!(COMPS[d.c]||[]).some(x=>x.n===n))return;
    const B={n,c:d.c,i,cash:0,pres:{},q:{},pk:{},capK:1,rd:0,race:0,goal:'scale',log:[],xs:{},xy:{},xp:{},sh:{},acq:[],mdY:{},xpY:{},born:mi(s),firsts:0};
    B.cash=botHistRev(s,B)*0.3;s.bots[n]=B;});return s.bots;}
/* ---------- связь с рынком ---------- */
// вес марки-бота в разделе класса: привлекательность (модели) и цена, не больше построенных мощностей
function botK(s,cp,c,g){const B=botByBrand(s,cp.n);if(!B||B.n!==coKey(cp.n))return 1;return Math.min(B.capK||1,Math.exp(1.2*(B.q[g]||0)-Math.log(B.pk[g]||1)));}
// экспорт ботов туда, где марки по истории не было: доля рынка класса по присутствию (compSplit дополняет этим список)
function botExports(s,c,g,S){const out=[];if(!botsOn(s)||!s.bots||isMotoSeg(g))return out;
  for(const n in s.bots){const B=s.bots[n];if(B.dead||B.c===c)continue;const lv=(B.pres&&B.pres[c])||0;if(!lv)continue;
    if((COMPS[c]||[]).some(cp=>!cp.imp&&coKey(cp.n)===B.n))continue;/* по истории марка здесь уже есть (Ford в Манчестере) — её запись и считается */const cp=(COMPS[B.c]||[]).find(x=>x.n===B.n),mx=cp&&cp.mix&&cp.mix[g];if(!mx||!cp||!compAlive(cp,s))continue;
    const v=S*BOT_XP[lv]*(BOT_OPEN[c]||1)*Math.sqrt(mx)*Math.exp(1.2*(B.q[g]||0)-Math.log(B.pk[g]||1));if(v>0)out.push({cp:{n:B.n,bot:1,c:B.c,mix:{[g]:1}},i:-1,bot:B.n,v});}
  return out;}
function botSold(s,n,c,g,units){const B=s.bots&&s.bots[n];if(!B)return;const X=B.xs=B.xs||{};const T=X[c]=X[c]||{};T[g]=(T[g]||0)+units;}
// натиск ботов на вас в классе (в contest, как скидки соперников): доля бота × (привлекательность сверх истории + скидка)
function botPress(s,c,g){if(!botsOn(s)||!s.bots)return 0;let p=0;for(const n in s.bots){const B=s.bots[n];if(B.dead)continue;const sh=B.sh&&B.sh[c]&&B.sh[c][g];if(!sh)continue;
    p+=sh*Math.max(0,1.2*(B.q[g]||0)-Math.log(B.pk[g]||1))*0.4;}return Math.min(0.6,p);}
// гоночная команда бота: бюджет гонок усиливает заводскую команду (fieldTeams)
function botTeam(s,t){if(!botsOn(s)||!s.bots||!t)return t;const B=botByBrand(s,t.n)||(t.mq||[]).map(m=>botByBrand(s,m)).find(Boolean);if(!B||!B.race)return t;return Object.assign({},t,{str:t.str*(1+0.22*B.race),botN:B.n});}
/* ---------- ход бота ---------- */
function botGoal(s,B){try{const L=worldCo(s),W=s.world,me=worldMine(s),o=L.find(x=>x.n===B.n);if(!o||!me)return B.goal||'scale';
    const tot={scale:W.hp,market:W.rev,sport:W.sport,innov:W.firsts+me.firsts,capital:L.reduce((a,x)=>a+x.val,0)+me.val},f={scale:'hp',market:'rev',sport:'sport',innov:'firsts',capital:'val'};
    let best='scale',bs=-1;for(const k in f){const sh=tot[k]>0?o[f[k]]/tot[k]:0;if(sh>bs){bs=sh;best=k;}}if(o.aw>=0.5&&bs<0.35)best='brand';return best;}catch(_){return B.goal||'scale';}}
function botCost(B,k,floor){return Math.max(floor,(B.r12||0)*k);}
function botPrices(s,B,r,y){const cp=(COMPS[B.c]||[]).find(x=>x.n===B.n);if(!cp)return null;const mk=r.mk&&r.mk[B.c];let note=null;const amb=B.goal==='capital'?0.9:B.goal==='scale'||B.goal==='market'?1.35:1.15,hv=compVol(cp,s);
  for(const g in (cp.mix||{})){if(!cp.mix[g])continue;const pk=B.pk[g]||1,sh=(B.sh[B.c]&&B.sh[B.c][g])||0,z=mk&&mk.segs&&mk.segs[g],you=z&&z.size>0?z.you/z.size:0;let nk=pk;
    const S=segAnnual(B.c,g,s),tgt=Math.min(0.6,(S>0?hv*cp.mix[g]/S:0.1)*amb+0.02);/* цель — своя историческая доля с запасом по амбиции */
    if(you>0.25&&you>sh&&B.cash>B.r12*0.05){nk=Math.max(0.85,pk-0.03);if(pk-nk>0.02&&y-(B.warY||0)>=2){B.warY=y;note={w:3,t:`${B.n} снижает цены`,txt:`${B.n} отвечает на успех «${s.company}»: цены ${SEG_LOC[g]||''} ${BOT_IN[B.c]} снижены — у покупателей вашей марки появился соблазн.`};}}
    else if(sh<tgt*0.7&&B.cash>B.r12*0.08)nk=Math.max(0.85,pk-0.02);else if(sh>0.5||B.goal==='capital')nk=Math.min(1.12,pk+0.01);else nk=pk+(1-pk)*0.1;
    B.pk[g]=Math.round(nk*1000)/1000;}return note;}
function botPlan(s,B,r,y){const D=botDif(),main=botMainSeg(B),cp=(COMPS[B.c]||[]).find(x=>x.n===B.n);if(!cp)return null;const R=B.r12||0,cpiK=cpi(s);
  const want=Math.exp(1.2*(B.q[main]||0)-Math.log(B.pk[main]||1)),C={};
  if(want>(B.capK||1)*0.9&&(B.capK||1)<BOT_CAP_MAX&&y-(B.capY||0)>=1)C.cap={cost:botCost(B,0.12,20000*cpiK),w:2,
    go(){B.capK=Math.min(BOT_CAP_MAX,(B.capK||1)+0.25);B.capY=y;return {t:`${B.n} расширяет завод`,txt:`${B.n} строит новые цеха ${BOT_IN[B.c]}: мощности выросли на четверть. Марка готова продавать больше, чем в настоящей истории.`};}};
  {let g=null,bs=9;for(const k in cp.mix){if(!cp.mix[k])continue;const age=y-(B.mdY[k]||(cp.since||1895)),sh=(B.sh[B.c]&&B.sh[B.c][k])||0;if(age>=(y>=1920?2:3)&&sh<bs){bs=sh;g=k;}}
    if(g)C.model={cost:botCost(B,0.15,15000*cpiK),w:2,go(){const dq=(0.15+0.1*Math.random())*D.bonus;B.q[g]=Math.min(BOT_Q_MAX,(B.q[g]||0)+dq);B.mdY[g]=y;return {t:`${B.n}: новая модель ${SEG_GEN[g]||''}`.replace(/ — грузовик$/,' — грузовик'),txt:`${B.n} показала новую машину ${SEG_GEN[g]||''}. Покупатели ${BOT_IN[B.c]} считают её на ${Math.round(dq*100)} % привлекательнее прежней.`};}};}
  {const home=(B.sh[B.c]&&B.sh[B.c][main])||0;if(home>=0.15||y>=1908){const mk=c=>(s.mkY&&s.mkY[c])||0;const nX=Object.keys(B.pres||{}).filter(c=>B.pres[c]>0).length,cs=Object.keys(COUNTRIES).filter(c=>c!==B.c&&botPres(s,B,c)<4&&y-(B.xpY[c]||0)>=3&&!isWar(s.y,s.m,c)&&((B.pres&&B.pres[c])||nX<3)).sort((a,b)=>mk(b)-mk(a));
    const c=cs[0];if(c){const lv=((B.pres&&B.pres[c])||0)+1;C.export={cost:botCost(B,BOT_XP_COST[lv],BOT_XP_FLOOR[lv]*cpiK),w:lv>=3?3:1,go(){B.pres=B.pres||{};B.pres[c]=lv;B.xpY[c]=y;
      return {t:`${B.n} ${lv===4?'строит завод':lv===3?'открывает сборку':lv===2?'открывает отделение':'нашла импортёра'} ${BOT_IN[c]}`,txt:`${B.n} ${lv===1?'договорилась с импортёром':lv===2?'открыла своё отделение':lv===3?'начала сборку машин из комплектов':'строит собственный завод'} ${BOT_IN[c]}: в настоящей истории марка туда не шла. ${c===s.country?'Это ваш домашний рынок — ждите борьбы за покупателя.':''}`};}};}}}
  if((B.race||0)<1&&y-(B.rcY||0)>=1)C.race={cost:botCost(B,0.05,4000*cpiK),w:B.goal==='sport'?2:1,go(){B.race=Math.min(1,(B.race||0)+0.25);B.rcY=y;return {t:`${B.n} ${B.race>0.3?'снова усиливает':'усиливает'} гоночную команду`,txt:`${B.n} увеличила бюджет гонок: заводские машины получат лучших гонщиков и моторы — соперник на трассах стал опаснее.`};}};
  if((B.rd||0)<1&&y-(B.rdY||0)>=1)C.rd={cost:botCost(B,0.08,5000*cpiK),w:B.goal==='innov'?2:1,go(){B.rd=Math.min(1,(B.rd||0)+0.2);B.rdY=y;return {t:`${B.n} ${B.rd>0.25?'расширяет':'открывает'} лабораторию`,txt:`${B.n} вкладывается в конструкторское бюро: теперь марка может опередить историю с новинкой — и забрать первенство себе.`};}};
  const order=BOT_ORDER[B.goal]||BOT_ORDER.scale,L=order.map(k=>C[k]&&Object.assign({k},C[k])).filter(Boolean);if(!L.length)return null;
  if(Math.random()<D.iq){const a=L.find(x=>B.cash>=x.cost);return a||null;}
  if(Math.random()<0.5)return null;const cheap=L.filter(x=>B.cash>=x.cost);return cheap.length?cheap[Math.floor(Math.random()*cheap.length)]:null;}
// первенство: бот с лабораторией может опередить историю на 1–3 года — новинка ближайших лет уходит ему
function botFirst(s,B,y){if(!(B.rd>0)||(B.firsts||0)>=3||y-(s.botFirstY||0)<2||Math.random()>(0.05+0.15*B.rd)*botDif().iq)return null;const W=s.world||{},fh=W.fh||{},taken=s.firsts||{},bf=s.botFirsts=s.botFirsts||{};
  const L=Object.keys(PART_HIST).filter(id=>{const h=PART_HIST[id];return h[0]>y&&h[0]<=y+3&&!fh['part:'+id]&&!taken['part:'+id]&&!bf['part:'+id]&&!/^m/.test(id);});if(!L.length)return null;
  const id=L[Math.floor(Math.random()*L.length)],h=PART_HIST[id],P=(typeof ALL_PARTS==='function'?ALL_PARTS():[]).find(q=>q.id===id);
  // имя детали без марки-прародителя («Daimler Phönix, 2 цил. 8 л.с.» → «мотор 2 цил. 8 л.с.»)
  const kind={e:'мотор',g:'коробка передач',c:'шасси',k:'тормоза',b:'кузов',w:'колёса и шины'}[id[0]]||'узел',raw=P?P.name:id,name=/,/.test(raw)?kind+' '+raw.replace(/^[^,]+,\s*/,''):kind+' «'+raw+'»';
  bf['part:'+id]={n:B.n,y:s.y,hy:h[0]};B.firsts=(B.firsts||0)+1;s.botFirstY=y;
  return {w:4,t:`${B.n} первыми в мире: ${name}`,txt:`${B.n} опередила историю на ${h[0]-y} ${plural(h[0]-y,'год','года','лет')}: ${name} — в настоящем прошлом это сделал ${h[1]} только в ${h[0]} году. Первенство теперь не достанется ни вам, ни истории.`};}
// покупка меньшей марки своей страны — раз в четыре года, если касса позволяет
function botMA(s,B,y){if(y<1905||y-(B.maY||0)<4||B.cash<=0||(B.acq||[]).length>=2||!['scale','capital','market'].includes(B.goal)||Math.random()>0.35*botDif().iq)return null;const X=botCp(s,B);if(!X)return null;const myV=compVol(X.cp,s);const L=[];
  (COMPS[B.c]||[]).forEach((cp,i)=>{if(cp.imp||cp===X.cp||pkIs(cp,s)||!compAlive(cp,s)||(s.botAcq&&s.botAcq[cp.n])||(s.bots&&s.bots[coKey(cp.n)]))return;if(typeof dealBlock==='function'&&dealBlock(s,B.c,i))return;if(typeof holdOf==='function'&&holdOf(s,B.c,i))return;/* у вас есть доля — бот не лезет */
    const v=compVol(cp,s);if(v<=0||v>myV*0.5)return;const V=typeof dealValue==='function'?dealValue(s,B.c,i)*2:0;if(V>0&&B.cash>=V*1.2)L.push({cp,i,V});});
  if(!L.length)return null;const d=L[Math.floor(Math.random()*L.length)];B.cash-=d.V;B.maY=y;s.botAcq=s.botAcq||{};s.botAcq[d.cp.n]=B.n;B.acq.push(d.cp.n);
  return {w:4,t:`${B.n} покупает ${compName(d.cp,s)}`,txt:`${B.n} купила марку ${compName(d.cp,s)} за ${money(d.V)}: её заводы и покупатели теперь в зачёте ${B.n}. Так в 1908 году Дюрант собирал General Motors из Buick, Oldsmobile и Cadillac.`};}
function botLog(B,s,txt){B.log=B.log||[];B.log.unshift({t:mi(s),txt});if(B.log.length>8)B.log.length=8;}
// месяц ботов — после рынка и мирового итога (13-turn.js): продажи, касса, цены, один большой ход, первенства и сделки
function botsMonth(s,r){if(!botsOn(s))return;if(!s.bots)botsInit(s);const D=botDif(),y=yf(s);let news=[];
  Object.values(s.bots).forEach((B,bi)=>{const X=botCp(s,B);if(!X||!compAlive(X.cp,s)||(typeof acqHas==='function'&&acqHas(s,B.c,X.i))){if(!B.dead){B.dead=1;B.deadT=mi(s);}return;}B.dead=0;
    // продажи месяца: свои записи по истории (дома и филиалы), купленные марки, экспорт сверх истории
    let units=0,rev=0;B.sh=B.sh||{};for(const c in COMPS){const L=(s.comps&&s.comps[c])||[];COMPS[c].forEach((cp,i)=>{if(cp.imp)return;const own=coKey(cp.n)===B.n,acq=s.botAcq&&s.botAcq[cp.n]===B.n;if(!own&&!acq)return;const x=L[i];if(!x||!x.lg)return;
        for(const g in x.lg){const n=x.lg[g]||0;if(!n)continue;units+=n;rev+=n*prefP(g,c,s)*(own?(B.pk[g]||1):1);if(own){const z=r.mk&&r.mk[c]&&r.mk[c].segs&&r.mk[c].segs[g];(B.sh[c]=B.sh[c]||{})[g]=z&&z.size>0?Math.min(0.95,n/z.size):0;}}});}
    for(const c in (B.xs||{}))for(const g in B.xs[c]){const n=B.xs[c][g];units+=n;rev+=n*prefP(g,c,s)*(B.pk[g]||1);const z=r.mk&&r.mk[c]&&r.mk[c].segs&&r.mk[c].segs[g];(B.sh[c]=B.sh[c]||{})[g]=z&&z.size>0?Math.min(0.95,n/z.size):0;B.xy[c]=(B.xy[c]||0)+n;}
    B.xs={};B.r12=(B.r12==null?rev*12:B.r12)*11/12+rev;B.u12=(B.u12==null?units*12:B.u12)*11/12+units;
    let pk=0,pw=0;for(const g in X.cp.mix){pk+=(B.pk[g]||1)*X.cp.mix[g];pw+=X.cp.mix[g];}pk=pw?pk/pw:1;
    B.cash+=rev*(0.08+0.5*(pk-0.85))*D.bonus;for(const g in B.q)B.q[g]*=0.985;
    if(s.m===0||!B.goal)B.goal=botGoal(s,B);
    const pn=botPrices(s,B,r,y);if(pn)news.push(Object.assign({B},pn));
    const a=botPlan(s,B,r,y);if(a){B.cash-=a.cost;const o=a.go();if(o){botLog(B,s,o.t);news.push(Object.assign({B,w:a.w},o));}}
    if(s.m===(bi*5+2)%12){const f=botFirst(s,B,y);if(f){botLog(B,s,f.t);news.push(Object.assign({B},f));}}
    if(s.m===(bi*7+5)%12){const m=botMA(s,B,y);if(m){botLog(B,s,m.t);news.push(Object.assign({B},m));}}
    if(s.m===11){B.xp=B.xy;B.xy={};}});
  // газета — не больше одной заметки о соперниках в месяц: самая важная; остальные — в журнал марки
  if(news.length){news.sort((a,b)=>(b.w||1)-(a.w||1));const n=news[0];botNewsAdd(s,n);}
  if(s.botNews&&s.botNews.length>30)s.botNews.splice(0,s.botNews.length-30);}
function botNewsAdd(s,n){s.botNews=s.botNews||[];let t=n.t;if(s.botNews.some(x=>x.t===t))t+=` (${s.y})`;const cp=(COMPS[n.B.c]||[]).find(x=>x.n===n.B.n),m=cp?compModel(cp,s):null;
  s.botNews.push({y:s.y,m:s.m,t,txt:n.txt,img:m&&m[2]&&IMG[m[2]]?m[2]:'',n:n.B.n});addLog(`${n.t}.`,'hist');}
// «Также в номере»: заметки о ходах ботов — как события эпохи (22-paper.js)
function botFlv(s){return ((s&&s.botNews)||[]).map(b=>[b.y,b.m,b.t,b.img||'',8]);}
function botNewsTxt(s,t){const b=((s&&s.botNews)||[]).find(x=>x.t===t);return b?b.txt:'';}
// строка о боте для таблицы «Конкуренты»: цель и последний ход
function botMark(s,n){if(s.botAcq&&s.botAcq[n])return `<span class="pill muted">куплена: ${esc(s.botAcq[n])}</span>`;const B=botByBrand(s,n);if(!B||B.n!==coKey(n))return '';const last=B.log&&B.log[0];return `<span class="pill muted" title="живой соперник: играет сам">живой</span>${last?` <small class="muted">${esc(last.txt)}</small>`:''}`;}
