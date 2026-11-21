/* ================= 0.51, этап 5: ФИРМЫ-СОПЕРНИКИ =================
   Отзыв автора на пробную сборку: «ты не сделал активное участие других игроков, а поставил обычные математические заглушки…
   Вместо того чтобы снимать спрос на мои авто, лучше меняй их экономику в соответствии с реальными действиями».
   Раньше ответ соперников был вычетом из спроса на машины игрока (натиск, модели-ответы, объединение, скидки — до ×0,05),
   часть вычетов не уходила никогда. Теперь вычетов нет. Каждая марка из истории — фирма со своей экономикой:
     • цена — та, что выгодна ей самой при её себестоимости и её доле класса (у крупной марки есть что уступить, у мелкой — нет);
     • себестоимость — падает после перехода на поток (дорого и долго), растёт, когда завод недогружен;
     • машина — модель-ответ перенимает часть перевеса лидера класса, стоит денег, готовится год-два и живёт, пока в производстве;
     • рассрочка, расширение завода — когда это уже возможно в её стране и когда на это есть деньги;
     • касса — убытки копятся, фирма переходит к кредиторам, а потом закрывается.
   Фирма ходит после игрока. Её ход меняет её собственные продажи внутри класса (105-market.js: выбор «класс → марка»), и покупателей
   она отбирает у соседей по классу — у игрока тоже. Без игрока и без ходов фирм рынок совпадает с историей (calib).
   Образцы ходов — claude/issledovanie-soperniki-0.51.md: Chevrolet 490 против Ford T (1915), Morris и цены 1921 года, Opel и поток
   (1924), Essex и закрытый кузов (1922), рассрочка GMAC (1919), провал United States Motor (1910–1912). */
const FIRM_BT=3,          // насколько покупатель грузовика чувствителен к цене марки (у легковых — BR)
  FIRM_FIN=0.14,          // рассрочка: как +15 % покупателей (как у игрока: techLv credit ×1,15)
  FIRM_CAPX=1.3,          // сколько сверх построенных мощностей завод выжимает сверхурочными
  FIRM_AD=0.45,           // предел рекламной кампании и заводской гоночной команды — в единицах славы марки (у игрока слава — до ~1,2)
  FIRM_FOLLOW=globalThis.FIRMFOLLOW??0.5,   // мелкие марки без имени идут за крупными: перенимают половину их перевеса
  FIRM_NET=0.07,          // чистая прибыль фирмы в обычный год, доля выручки
  FIRM_SCALE=0.1,         // недогруз/перегруз завода: выпуск вдвое ниже обычного — себестоимость +7 %
  FIRM_LINE_Y={us:1915,uk:1924,fr:1921,de:1926,it:1924,ru:1931},   // когда поток стал обычным делом в стране (после — он уже в ценах истории)
  FIRM_FIN_Y={us:[1915,1925],uk:[1921,1930],fr:[1921,1930],de:[1924,1931],it:[1924,1931],ru:[1999,1999]};   // рассрочка: с какого года возможна и когда стала обычной
function firmsOn(s){return botsOn(s)&&!globalThis.FIRMOFF;}/* FIRMOFF — замер «без ходов фирм» */
function firmSkill(){const b=botDif();return {iq:b.iq??0.7,bonus:b.bonus??1};}
function firmGet(s,c,i,mo){return s&&s.firms?s.firms[(mo==='k'?'k:':mo?'m:':'')+c+':'+i]:null;}
function firmMake(s,c,i,cp,mo){s.firms=s.firms||{};const F={c,i,n:cp.n,pk:{},md:{},ck:1,cap:1.15,fin:0,st:'ok',bad:0,log:[],rg:{},sh:{}};if(mo)F.mo=1;return s.firms[(mo?'m:':'')+c+':'+i]=F;}
/* 0.51, этап 5б: мотоциклетные марки — тоже фирмы (раньше их ответа не было вовсе: был только вычет из спроса, он снят на этапе 5).
   Домен — откуда брать марки, их продажи и классы. Ключ мотофирмы в s.firms — с приставкой «m:»; закрытие и урезание выпуска — по cpK(cp),
   чтобы мотоциклетный Peugeot не закрыл автомобильный. */
const FD_CAR={mo:0,all:()=>COMPS,recs:(s,c)=>(s.comps&&s.comps[c])||[],segs:()=>[...CARSEG,'truck'],mk:m=>m&&m.segs,skip:(s,c,i,cp)=>cp.imp||pkIs(cp,s)||acqHas(s,c,i),min:8000},
  FD_MOTO={mo:1,all:()=>MCOMPS,recs:(s,c)=>(s.mcomps&&s.mcomps[c])||[],segs:()=>MOTOSEG,mk:m=>m&&m.msegs,skip:(s,c,i,cp)=>cp.imp||pkIs(cp,s)||ownComp(cp,s)||!!mholdOf(s,c,i),min:2500};
function firmList(F){return F&&F.kf?[]:((F&&F.mo?MCOMPS:COMPS)[F.c])||[];}
function firmCp(F){return F&&F.kf?farmCp(F.c,F.n):firmList(F)[F.i];}
function cpK(cp){return cp.fk||cp.n;}
function firmOwner(s,F){return F&&F.own!=null?firmGet(s,F.c,F.own,F.mo):null;}
function firmGrudge(s,c,i){const F=firmGet(s,c,i);return F&&F.gr>0.02?F.gr:0;}
function firmCar(F,pl){return F&&F.kf?(pl?'тракторы':'трактор'):F&&F.mo?(pl?'мотоциклы':'мотоцикл'):(pl?'машины':'машина');}
// фирма живого соперника по имени марки (её домашняя запись) — для экспорта сверх истории
function firmHome(s,bn){const B=s.bots&&s.bots[bn];if(!B||!s.firms)return null;const L=COMPS[B.c]||[];for(let i=0;i<L.length;i++)if(L[i].n===B.n)return s.firms[B.c+':'+i]||null;return null;}
// модель-ответ: её перевес над обычной машиной марки; в последнюю треть срока тает — машина стареет, покупатель это видит
function firmDq(F,g,t){const M=F.md&&F.md[g];if(!M||t<M.from||t>=M.till)return 0;const fade=Math.max(1,(M.till-M.from)/3);return M.q*Math.min(1,(M.till-t)/fade);}
function firmCk(F,t){if(!F.ckTill||F.ck>=1)return 1;if(t>=F.ckTill)return 1;const left=F.ckTill-t;return left>=24?F.ck:1-(1-F.ck)*left/24;}
function firmFin(F,t){return F.fin&&t<(F.finTill||0)?FIRM_FIN:0;}
// реклама и гонки марки: в последний год кампании слава тает
function firmAd(F,t){const A=F.ad;if(!A||t<A.from||t>=A.till)return 0;return A.u*Math.min(1,(A.till-t)/12);}
/* Насколько марка сейчас привлекательнее своей истории в классе. Сама машина и цена (P) — их покупатель сравнивает с соседями по
   классу резче (делится на nestMu); имя марки — реклама, гонки, рассрочка (B) — как у игрока его слава. */
function firmDuP(s,F,g){return firmDq(F,g,mi(s))-(g==='truck'||g==='farm'?FIRM_BT:BR)*Math.log((F.pk&&F.pk[g])||1);}
function firmDuB(s,F){const t=mi(s);return firmFin(F,t)+firmAd(F,t);}
function firmDu(s,F,g){return firmDuP(s,F,g)+firmDuB(s,F);}
function firmWant(s,F,g){return Math.exp(firmDuP(s,F,g)/nestMu(s)+firmDuB(s,F));}   // во сколько раз вырос бы сбыт марки, хватай ей завода
function firmMult(s,F,g){if(!F||F.st==='dead')return 1;return Math.min(firmWant(s,F,g),FIRM_CAPX*(F.cap||1));}
// марки класса с их нынешним перевесом: w — доля по истории, m — перевес, M — перевес всех соперников класса вместе
function firmTerms(s,c,g){const L=compWeights(c,g,s),on=s&&s.firms&&firmsOn(s),mo=isMotoSeg(g);let M=1,sw=0,sd=0;
  L.forEach(o=>{if(o.bot){o.m=on?firmMult(s,firmHome(s,o.bot),g):1;M+=o.w*o.m;return;}/* пришла сверх истории — прибавляется к классу целиком */
    o.m=on?firmMult(s,s.firms[(mo?'m:':'')+c+':'+o.i],g):1;M+=o.w*(o.m-1);sw+=o.w;sd+=o.w*(o.m-1);});
  // мелкие марки без имени («остаток» класса) идут за крупными с половинной силой — иначе большая часть класса не отвечала бы никогда
  if(on&&sw>0.02&&sw<1){const mr=1+clamp(FIRM_FOLLOW*sd/sw,-0.3,6);M+=(1-sw)*(mr-1);L.mRest=mr;}
  return {M:Math.max(0.05,M),L};}
// месяц в году против среднего месяца: сезон и события года — чтобы сравнивать продажи фирмы с её историей помесячно
function firmSeason(s,c){let sf=0;for(let m=0;m<12;m++)sf+=SEASON[m]*econ(s.y,m,c).f;return sf>0?SEASON[s.m]*econ(s.y,s.m,c).f*12/sf:1;}
// классы, в которых фирма работает (от десятой части выпуска)
function firmSegs(cp){return Object.keys(cp.mix||{}).filter(g=>cp.mix[g]>=0.1);}
/* Цена фирмы. Наценка марки — от её доли класса по истории: у крупной марки покупатель менее чувствителен к цене, наценка выше,
   у мелкой — тонкая (firmCost0: при исторической доле выгодна историческая цена — без повода фирма цену не трогает).
   Потеряв долю, фирма уступает в цене: крупная — заметно (ей есть что уступить), мелкая — почти никак; вернув долю — возвращает цену.
   Снижение себестоимости (поток) уходит в цену целиком. Ниже себестоимости с запасом 3 % цену не держат. */
function firmEps(g,sh,mu){return (g==='truck'||g==='farm'?FIRM_BT:BR)/mu*(1-clamp(sh,0,0.9))+0.3;}
function firmCost0(g,wh,mu){const e=firmEps(g,wh,mu);return (e-1)/e;}   // себестоимость — доля цены класса
// загрузка завода: в пределах ±15 % от обычной себестоимость не меняется (и случайный год на цену не влияет)
function firmCostK(F,t){const ld=F.ld==null?1:F.ld,x=ld<0.85?ld/0.85:ld>1.15?ld/1.15:1;return firmCk(F,t)*clamp(Math.pow(Math.max(0.2,x),-FIRM_SCALE),0.9,1.2);}
function firmPriceOpt(F,g,wh,rs,t,mu){const eta=0.1+0.3*clamp(wh,0,0.7),x=Math.abs(rs-1)<0.05?1:clamp(rs,0.3,1.6),ck=firmCk(F,t);
  return clamp(Math.max(firmCost0(g,wh,mu)*firmCostK(F,t)*1.03,ck*Math.pow(x,eta)),0.65,1.2);}
function firmName(s,F){const cp=firmCp(F);return cp?compName(cp,s):F.n;}
function firmNote(s,r,F,o){const n={n:firmName(s,F),bn:F.n,c:F.c,i:F.i,t:o.t,txt:o.txt,w:o.w||1,k:o.k||''};if(F.mo)n.mo=1;if(F.kf)n.kf=1;(r.riv=r.riv||[]).push(n);F.log=F.log||[];F.log.unshift({t:mi(s),txt:o.t,k:o.k||''});if(F.log.length>8)F.log.length=8;}
// историческое имя новой модели, если ответ вышел рядом с настоящей премьерой марки
function firmModelName(cp,y){let b=null;(cp.models||[]).forEach(x=>{if(Math.abs(x[0]-y)<=2&&(!b||Math.abs(x[0]-y)<Math.abs(b[0]-y)))b=x;});return b?b[1]:'';}
function firmLeaderTxt(s,L){return L.you?`«${s.company}»`:L.n;}
/* ---------- месяц фирм: счёт, состояние, ход ---------- */
function firmsMonth(s,r){if(!firmsOn(s))return;s.firms=s.firms||{};r.riv=r.riv||[];firmsDom(s,r,FD_CAR);firmsDom(s,r,FD_MOTO);try{firmsFarm(s,r);}catch(e){console.warn('farm firms',e);}
  try{firmsPeople(s,r);}catch(e){console.warn('firm people',e);}}
function firmsDom(s,r,D){const t=mi(s),y=yf(s),SK=firmSkill(),MU=nestMu(s),ALL=D.all();
  for(const c in ALL){const mk=r.mk&&r.mk[c],SG=D.mk(mk);if(!SG)continue;const fm=firmSeason(s,c),dc=difComp(s),L=ALL[c],recs=D.recs(s,c);
    // доли по истории в каждом классе — один раз на страну
    // сколько класс продаёт соперникам в обычный месяц (по истории): марка получает из этого свою долю — её продажи «как в истории»
    const WH={},HS={};D.segs().forEach(g=>{WH[g]={};const W=compWeights(c,g,s);HS[g]=(W.rest||0)/12*fm*dc;W.forEach(o=>{if(!o.bot)WH[g][o.i]=o.w;});});
    L.forEach((cp,i)=>{if(D.skip(s,c,i,cp))return;const x=recs[i];if(!x)return;const hv=compVol(cp,s);let F=firmGet(s,c,i,D.mo);
      if(hv<=0){if(F&&F.st!=='dead'){F.st='dead';}return;}
      if(!F)F=firmMake(s,c,i,cp,D.mo);if(F.st==='dead')return;const segs=firmSegs(cp);
      // --- счёт месяца ---
      let rev=0,hrev=0,gross=0,fixed=0,units=0;
      segs.forEach(g=>{const u=(x.lg&&x.lg[g])||0,P=prefP(g,c,s),pk=F.pk[g]||1,wh=WH[g]&&WH[g][i]||0,hu=HS[g]*wh,c0=firmCost0(g,wh||0.02,MU),z=SG[g];
        units+=u;rev+=u*P*pk;hrev+=hu*P;gross+=u*P*(pk-c0*firmCostK(F,t));fixed+=hu*P*Math.max(0.02,1-c0-FIRM_NET);
        // rg — продажи против обычных для марки (за год), rs — доля класса против её доли по истории (за полгода)
        F.rg[g]=hu>0.05?(F.rg[g]==null?1:F.rg[g])*11/12+Math.min(4,u/hu)/12:1;F.sh[g]=z&&z.size>0?Math.min(0.95,u/z.size):0;
        (F.rs=F.rs||{})[g]=wh>0.001&&z&&z.size>0?(F.rs[g]==null?1:F.rs[g])*5/6+Math.min(4,F.sh[g]/wh)/6:1;});
      const pft=gross-fixed-(firmFin(F,t)?rev*0.01:0);
      F.r12=(F.r12==null?hrev*12:F.r12)*11/12+rev;F.h12=(F.h12==null?hrev*12:F.h12)*11/12+hrev;F.p12=(F.p12==null?hrev*12*FIRM_NET:F.p12)*11/12+pft;F.u12=(F.u12==null?units*12:F.u12)*11/12+units;
      F.ld=F.h12>0?clamp((F.ld==null?1:F.ld)*0.8+0.2*(F.r12/F.h12),0.1,4):1;
      if(F.cash==null)F.cash=F.h12*0.2;F.cash+=pft>0?pft*0.5*SK.bonus:pft;   // половина прибыли уходит хозяевам и в налоги
      if(F.gr)F.gr=F.gr>0.02?F.gr*0.985:0;   // обида сходит наполовину за четыре года
      if(F.h12<D.min*cpi(s)||y-(cp.since||1895)<3)return;   // мастерская или новичок — пока просто живёт по истории
      firmGroupMonth(s,r,F,cp);   // марка в чужой группе: поток и рассрочка хозяина приходят и к ней
      // --- состояние: убытки → кредиторы → закрытие ---
      if(firmState(s,r,F,cp,i))return;
      // --- готовые программы ---
      if(F.prog&&t>=F.prog.at)firmDone(s,r,F,cp);
      if(F.capP&&t>=F.capP.at){F.capP=null;F.cap=Math.min(12,(F.cap||1)*1.6);firmNote(s,r,F,{w:1,k:'cap',t:`${firmName(s,F)}: новые цеха работают`,txt:`Завод ${firmName(s,F)} расширен: марка может выпускать в полтора раза больше.`});}
      // --- ход: живые великие марки — каждый месяц, остальные — раз в квартал ---
      const bot=!D.mo&&!!(s.bots&&s.bots[coKey(cp.n)]&&!s.bots[coKey(cp.n)].dead&&s.bots[coKey(cp.n)].c===c);
      if(!bot&&(t+i)%3!==0)return;
      firmPrices(s,r,F,cp,i,WH,bot);
      // у мотофирм жребий хода — от даты и имени, а не из общего потока случайных чисел: мир без действий игрока не сдвигается
      if(F.st==='ok'&&(D.mo?maRnd('mf|'+c+'|'+i+'|'+t):Math.random())<SK.iq*(bot?0.5:1))firmPlan(s,r,F,cp,i,SG,bot);});}}
function firmState(s,r,F,cp,i){const t=mi(s),lim=F.h12*0.3,N=firmName(s,F),KN=cpK(cp);
  if(F.st==='ok'){if(F.cash<-lim&&F.p12<0){F.st='bad';F.bad=0;F.prog=null;F.capP=null;firmNote(s,r,F,{w:3,k:'bad',t:`${N} несёт убытки`,txt:`${N} продаёт на ${Math.round((1-clamp(F.ld,0,1))*100)}% меньше обычного и второй год работает в убыток: долг перед банками и поставщиками — ${money(-F.cash)}. Программы новых ${F.mo?'мотоциклов':'машин'} остановлены. Если дела не поправятся, заводом займутся кредиторы.`});}return false;}
  if(F.st==='bad'){F.bad++;
    // у великой марки есть хозяева с деньгами (касса её большой стратегии): закрывают часть долга
    const B=!F.mo&&s.bots&&s.bots[coKey(cp.n)];if(B&&!B.dead&&B.c===F.c&&B.cash>0&&F.cash<-lim*0.3){const x=Math.min(B.cash*0.5,-F.cash-lim*0.2);if(x>0){B.cash-=x;F.cash+=x;}}
    // этап 5б: марку в группе держит касса хозяина — пока у него самого есть деньги
    const O=firmOwner(s,F);if(O&&O.st==='ok'&&O.cash>0&&F.cash<-lim*0.3){const x=Math.min(O.cash*0.5,-F.cash-lim*0.2);if(x>0){O.cash-=x;F.cash+=x;}}
    if(F.cash>=-lim*0.3||(F.p12>0&&F.bad>=12)){F.st='ok';firmNote(s,r,F,{w:2,k:'ok',t:`${N} выбралась из долгов`,txt:`${N} снова работает с прибылью и расплатилась с кредиторами.`});return false;}
    // этап 5б: за три месяца до кредиторов владельцы ищут покупателя — сначала предложение приходит игроку (Wolseley, 1927)
    if(F.bad===15&&!F.mo&&!F.kf)try{maCredOffer(s,r,F,cp,i);}catch(e){console.warn('cred offer',e);}
    // полтора года убытков — завод берут кредиторы: долги списаны, слабые цеха закрыты, новому управляющему дают деньги на одну новую машину.
    // Второй раз спасают только великую марку; остальных распродают.
    if(F.bad>=18){
      if(!F.mo&&!F.kf&&maCredPending(s,F,i))return false;   // игрок ещё думает над предложением кредиторов
      // этап 5б: до кредиторов марку может купить соседняя фирма с деньгами — «концерн» с настоящей экономикой
      if(!B&&!F.mo&&!F.kf){let done=false;try{done=firmMerge(s,r,F,cp,i);}catch(e){console.warn('merge',e);}if(done)return true;}
      if((F.rec||0)>=1&&!B){F.st='dead';s.dead=s.dead||{};s.dead[KN]=t;firmNote(s,r,F,{w:5,k:'dead',t:`${N} закрыта`,txt:F.mo?`Кредиторы распродают завод ${N}: второй раз спасать марку никто не стал. Её покупатели достанутся соседям по классу.`:`Кредиторы распродают завод ${N}: второй раз спасать марку никто не стал. Её покупатели достанутся соседям по классу. В 1920-е так исчезла половина американских автозаводов: в 1921 году их было 88, в 1927-м — 44.`});return true;}
      const cut=(F.rec||0)>=1?0.85:0.75;F.rec=(F.rec||0)+1;F.st='ok';F.bad=0;F.cash=F.h12*0.1;F.pk={};F.prog=null;F.capP=null;F.turn=1;s.compK=s.compK||{};s.compK[KN]=Math.max(0.4,(s.compK[KN]||1)*cut);F.r12*=cut;F.h12*=cut;F.ld=1;F.rg={};F.rs={};
      firmNote(s,r,F,{w:4,k:'rec',t:`${N} — в руках кредиторов`,txt:`Банки взяли ${N} под управление: долги списаны, слабые заводы закрыты, выпуск урезан на ${Math.round((1-cut)*100)}%. Новый управляющий получил деньги на ${F.mo?'один новый мотоцикл':'одну новую машину'}.${F.mo?'':' Так в 1910 году банкиры спасали General Motors, а в 1912-м из развалин United States Motor осталась одна Maxwell.'}`});return true;}
    return false;}
  return false;}
// цена: шаг к выгодной для фирмы цене; о заметном сдвиге — заметка
function firmPrices(s,r,F,cp,i,WH,bot){const t=mi(s),N=firmName(s,F),step=bot?0.02:0.035,MU=nestMu(s);
  firmSegs(cp).forEach(g=>{const wh=WH[g]&&WH[g][i];if(!wh)return;const pk=F.pk[g]||1;
    // в долгах цену ниже обычной не держат; иначе — к выгодной
    let tg=firmPriceOpt(F,g,wh,(F.rs&&F.rs[g])==null?1:F.rs[g],t,MU);if(F.st==='bad')tg=Math.max(tg,Math.min(1,pk+0.02));
    // завод не успевает за спросом — цену поднимают
    if(firmWant(s,F,g)>FIRM_CAPX*(F.cap||1)*1.5)tg=Math.max(tg,pk+0.02);
    const nk=Math.abs(tg-pk)<0.012?pk:pk+clamp(tg-pk,-step,step);if(nk===pk)return;F.pk[g]=Math.round(nk*1000)/1000;
    const said=(F.pkSaid&&F.pkSaid[g])||1,d=F.pk[g]/said-1;if(Math.abs(d)>=0.07){(F.pkSaid=F.pkSaid||{})[g]=F.pk[g];const sh=Math.round((F.sh[g]||0)*100),mg=Math.round((F.pk[g]-firmCost0(g,wh,MU)*firmCostK(F,t))/F.pk[g]*100);
      firmNote(s,r,F,d<0?{w:3,k:'cut',t:`${N} снижает цены на ${Math.round(-d*100)}%`,txt:`${N} снизила цены ${SEG_LOC[g]||''} ${BOT_IN[F.c]} на ${Math.round(-d*100)}%. ${firmCk(F,t)<0.97?'Себестоимость у неё упала после перестройки завода — есть что уступить.':`Её доля класса — ${sh}%: при такой доле держать прежнюю цену невыгодно.`} С машины ей остаётся ${mg}% цены.${F.kf?' Так в 1922 году International Harvester ответила на «Фордзон» за 395 долларов: минус 230 долларов и плуг в придачу.':''}`}
        :{w:2,k:'up',t:`${N} поднимает цены на ${Math.round(d*100)}%`,txt:`${N} подняла цены ${SEG_LOC[g]||''} ${BOT_IN[F.c]} на ${Math.round(d*100)}%: её доля класса — ${sh}%, покупателей хватает.`});}});}
// кто в классе впереди фирмы и чем: игрок (если у него от 5 % класса) или другая марка
function firmLeader(s,F,g,SG){const z=SG[g],t=mi(s),own={q:firmDq(F,g,t),p:-(g==='truck'||g==='farm'?FIRM_BT:BR)*Math.log(F.pk[g]||1),b:firmDuB(s,F)};let L=null;
  if(z&&z.size>0&&z.you/z.size>=0.05&&z.edge!=null){L={you:1,q:(z.edgeQ||0)-own.q,p:(z.edgeP||0)-own.p,b:(z.edgeB||0)-own.b,sh:z.you/z.size};}
  firmList(F).forEach((cp,i)=>{if(i===F.i)return;const O=firmGet(s,F.c,i,F.mo);if(!O||O.st==='dead'||!cp.mix||!cp.mix[g]||(O.sh[g]||0)<0.05)return;
    const q=firmDq(O,g,t)-own.q,p=-(g==='truck'||g==='farm'?FIRM_BT:BR)*Math.log(O.pk[g]||1)-own.p,b=firmDuB(s,O)-own.b;if(q+p+b>0.1&&(!L||q+p+b>L.q+L.p+(L.b||0)))L={n:compName(cp,s),q,p,b,sh:O.sh[g]};});
  return L;}
// большой ход: одна программа за раз — модель-ответ, поток, рассрочка или расширение завода
function firmPlan(s,r,F,cp,i,SG,bot){const t=mi(s),y=yf(s),SK=firmSkill(),N=firmName(s,F),R=F.h12,can=k=>F.cash>=-R*0.3+R*k*0.5;
  // завод не успевает: спрос на марку выше мощностей — стройка идёт отдельно от программ новых машин.
  // Удачная машина растит завод быстро: Chevrolet с моделью «490» — 13,6 тыс. машин в 1915 году, 63 тыс. в 1916-м, 126 тыс. в 1917-м
  const g0=firmSegs(cp).sort((a,b)=>cp.mix[b]-cp.mix[a])[0];
  if(g0&&!F.capP&&firmWant(s,F,g0)>FIRM_CAPX*(F.cap||1)&&(F.cap||1)<12&&can(0.08)){const cost=R*0.08;F.cash-=cost;F.capP={at:t+6,cost};
    firmNote(s,r,F,{w:1,k:'cap0',t:`${N} расширяет завод`,txt:`Спрос на машины ${N} выше, чем успевает завод. Марка строит новые цеха за ${money(cost)} — через полгода выпуск вырастет в полтора раза.`});}
  if(F.prog)return;
  // где потеряно больше всего: и доля класса, и сами продажи (один плохой год или чужой новый покупатель — ещё не повод)
  const RS=F.rs||{};let g=null,loss=0;firmSegs(cp).forEach(k=>{const l=(1-(RS[k]==null?1:RS[k]))*cp.mix[k];if(l>loss){loss=l;g=k;}});
  const turn=!!F.turn;if(turn&&!g)g=g0;
  const gr=F.gr>0.02?F.gr:0;   // помнит обиду — на потерю доли из-за игрока отвечает раньше
  if(!g||(!turn&&((RS[g]||1)>(bot?0.94:0.9)+0.05*gr||(F.rg[g]==null?1:F.rg[g])>(bot?0.97:0.95)+0.03*gr)))return;const L=firmLeader(s,F,g,SG);if(!L)return;F.turn=0;const lost=Math.round((1-RS[g])*100),who=firmLeaderTxt(s,L);
  // 1) машина хуже — модель-ответ
  const mdOld=F.md[g],mdAge=mdOld?t-mdOld.from:999;
  if((L.q>=0.15||(turn&&L.q>=0.05))&&L.q>=L.p*0.7&&mdAge>=30&&can(0.1)){const cost=Math.max(15000*cpi(s),R*0.1*Math.max(0.3,cp.mix[g])),lost0=F.lostT!=null&&t-F.lostT<36,mon=Math.round((14+Math.random()*8)*(bot?0.8:1))+(lost0?6:0),frac=clamp((0.4+0.35*SK.iq)*(0.85+0.3*Math.random())+(L.you?0.1*gr:0)-(lost0?0.1:0),0.3,0.9);
    F.cash-=cost;F.prog={k:'model',g,at:t+mon,cost,q:clamp(firmDq(F,g,t)+L.q*frac,0.05,1.2),frac,who,you:L.you?1:0,lq:L.q,q0:firmDq(F,g,t)};
    if(L.you&&!F.kf)try{firmPoachEng(s,r,F,g);}catch(e){console.warn('poach eng',e);}   // этап 5б: к ответу готовятся и так — переманивают конструктора лидера
    firmNote(s,r,F,{w:2,k:'model0',t:`${N} готовит ответ ${who}`,txt:`${N} потеряла ${lost}% своей доли ${SEG_LOC[g]||''}: ${firmCar(F)} ${who} лучше. Марка заказала новую модель за ${money(cost)} — выйдет примерно через ${mon} мес.`});return;}
  // 2) у лидера цена ниже — перестроить завод на поток (до того как это сделали все)
  if(!F.mo&&!F.kf&&L.p>=0.2&&firmCk(F,t)>=0.97&&t-(F.lineT||-999)>=96&&can(0.25)){const early=y<FIRM_LINE_Y[F.c],cost=R*0.25,mon=bot?15:18;F.cash-=cost;F.prog={k:'line',g,at:t+mon,cost,ck:early?0.8:0.9,who};
    firmNote(s,r,F,{w:2,k:'line0',t:`${N} перестраивает завод`,txt:`${N} потеряла ${lost}% своей доли ${SEG_LOC[g]||''}: у ${who} машина дешевле. Марка вкладывает ${money(cost)} в ${early?'поточное производство':'новые станки и поток'} — на это уйдёт полтора года. Так в 1924 году Opel поставил первый в Германии конвейер за миллион золотых марок.`});return;}
  // 3) у лидера громче имя — реклама и заводская команда на гонках
  if(!F.kf&&(L.b||0)>=0.4&&L.b>=Math.max(L.q,L.p)&&!firmAd(F,t+6)&&can(0.06)){const cost=R*0.06,u=clamp(L.b*0.45,0.12,FIRM_AD);F.cash-=cost;F.prog={k:'ad',g,at:t+3,cost,u,who};
    firmNote(s,r,F,{w:2,k:'ad0',t:`${N} отвечает рекламой`,txt:`${N} потеряла ${lost}% своей доли ${SEG_LOC[g]||''}: имя ${who} у всех на слуху. Марка закладывает ${money(cost)} на газеты, выставки и заводскую команду на гонках — три года кампании.`});return;}
  // 3) рассрочка — когда она в стране уже возможна, но ещё не у всех
  const FY=FIRM_FIN_Y[F.c]||[1999,1999];
  if(!F.mo&&!F.kf&&y>=FY[0]&&y<FY[1]&&!firmFin(F,t)&&can(0.05)){const cost=R*0.05;F.cash-=cost;F.prog={k:'fin',g,at:t+6,cost};
    firmNote(s,r,F,{w:1,k:'fin0',t:`${N} готовит продажу в рассрочку`,txt:`${N} теряет покупателей и открывает кредитную контору: машину можно будет взять с первым взносом, остальное — за год. General Motors сделала это в 1919 году; к 1925-му в рассрочку продавали две трети новых машин Америки.`});return;}}
function firmDone(s,r,F,cp){const P=F.prog,t=mi(s),y=yf(s),N=firmName(s,F),g=P.g;F.prog=null;
  if(P.k==='ad'){F.ad={u:P.u,from:t,till:t+36};firmNote(s,r,F,{w:2,k:'ad',t:`${N} — на всех афишах`,txt:`Кампания ${N} началась: полосы в газетах, стенды на выставках, заводские машины на гонках. Покупателей у марки ${BOT_IN[F.c]} станет больше примерно на ${Math.round((Math.exp(P.u)-1)*100)}% — пока кампания идёт.`});}
  else if(P.k==='model'){const life=y<1920?72:48,nm=firmModelName(cp,y),up=Math.round((Math.exp(P.q/AQ)-1)*100);F.md[g]={q:P.q,from:t,till:t+life,name:nm,who:P.who,you:P.you};
    if(P.you&&!F.mo&&!F.kf)try{ownCopied(s,r,F,g);}catch(e){console.warn('own copy',e);}   // 0.51, этап 4в: с машиной игрока перенимают и его свой узел
    firmNote(s,r,F,P.own?{w:3,k:'model',t:`${N}: новая модель${nm?` «${nm}»`:''}`,txt:`${N} вывела ${nm?`«${nm}»`:F.mo?'новый мотоцикл':'новую машину'} ${F.mo?'':SEG_GEN[g]||''} собственной разработки: покупатели считают её на ${up}% лучше прежних ${F.mo?'мотоциклов':'машин'} марки. В производстве она останется до ${Math.floor(1895+(t+life)/12)} года.`}
      :{w:P.you?4:3,k:'model',t:`${N}: новая модель${nm?` «${nm}»`:''} — ответ ${P.who}`,txt:F.kf?`${N} вывела новый трактор. Инженеры разобрали трактор ${P.who} и переняли ${Math.round(P.frac*100)}% его перевеса; фермеры считают новинку на ${up}% лучше прежних тракторов завода. В производстве она останется до ${Math.floor(1895+(t+life)/12)} года. Так International Harvester ответила «Фордзону»: сперва вал отбора мощности, потом пропашной Farmall — и обошла Форда.`:F.mo?`${N} вывела ${nm?`«${nm}»`:'новый мотоцикл'}. Инженеры разобрали мотоцикл ${P.who} и переняли ${Math.round(P.frac*100)}% его перевеса; покупатели считают новинку на ${up}% лучше прежних мотоциклов марки. В производстве она останется до ${Math.floor(1895+(t+life)/12)} года. Так шла гонка «сорок пятых»: Excelsior Super X (1925) — Indian Scout 101 (1928) — Harley-Davidson D (1929).`:`${N} вывела ${nm?`«${nm}»`:'новую машину'} ${SEG_GEN[g]||''}. Инженеры разобрали машину ${P.who} и переняли ${Math.round(P.frac*100)}% её перевеса; покупатели считают новинку на ${up}% лучше прежних машин марки. В производстве она останется до ${Math.floor(1895+(t+life)/12)} года. Так в 1915 году Chevrolet вывел модель «490» против Ford T.`});}
  else if(P.k==='line'){F.ck=P.ck;F.lineT=t;F.ckTill=Math.max(t+72,(FIRM_LINE_Y[F.c]-1895)*12+36);F.cap=Math.min(12,(F.cap||1)*1.5);
    firmNote(s,r,F,{w:4,k:'line',t:`${N} пустила поток: себестоимость −${Math.round((1-P.ck)*100)}%`,txt:`${N} закончила перестройку завода: машина обходится ей на ${Math.round((1-P.ck)*100)}% дешевле, выпуск может вырасти в полтора раза. Теперь ей выгодно снизить цену — ждите этого в ближайшие месяцы. Morris в 1921 году снизил цены на пятую часть и за три года стал первой маркой Британии.`});}
  else if(P.k==='fin'){const FY=FIRM_FIN_Y[F.c]||[1999,1999];F.fin=1;F.finTill=(FY[1]-1895)*12;
    firmNote(s,r,F,{w:3,k:'fin',t:`${N} продаёт в рассрочку`,txt:`${N} открыла кредитную контору: машину ${BOT_IN[F.c]} можно взять с первым взносом. Покупателей у марки станет больше примерно на ${Math.round((Math.exp(FIRM_FIN)-1)*100)}%.`});}}
// лицензия продана местному заводу — чертежи видит и первая марка страны в этом классе: её следующая модель перенимает часть устройства
function firmLeak(s,c,g){if(!s.firms||!firmsOn(s))return;const L=compWeights(c,g,s).filter(o=>!o.bot).sort((a,b)=>b.w-a.w)[0];if(!L)return;const F=s.firms[c+':'+L.i];if(!F||F.st!=='ok'||F.prog)return;
  const t=mi(s);F.prog={k:'model',g,at:t+10,cost:0,q:clamp(firmDq(F,g,t)+0.25,0.05,1.2),frac:0.4,who:`«${s.company}»`,you:1};}
// газета и журнал: всё — в «ход соперников» месяца; в газету — самое важное
function firmNews(s,r){const L=r.riv||[];if(!L.length)return;L.sort((a,b)=>(b.w||1)-(a.w||1));
  s.rivLog=s.rivLog||[];L.forEach(n=>{s.rivLog.push({y:s.y,m:s.m,n:n.n,c:n.c,i:n.i,t:n.t,txt:n.txt,w:n.w,k:n.k});addLog(`${n.t}.`,n.c===s.country&&n.w>=3?'bad':'hist');});if(s.rivLog.length>80)s.rivLog.splice(0,s.rivLog.length-80);
  // заметка в газету: ходы на рынках, где игрок продаёт, важнее чужих
  const mine=c=>c===s.country||dealerCount(s,c)>0,top=L.filter(n=>n.w>=3).sort((a,b)=>((mine(b.c)?2:0)+b.w)-((mine(a.c)?2:0)+a.w))[0];
  if(top){s.botNews=s.botNews||[];let t=top.t;if(s.botNews.some(x=>x.t===t))t+=` (${s.y})`;const cp=((top.mo?MCOMPS:COMPS)[top.c]||[])[top.i],m=cp&&!top.mo?compModel(cp,s):null;
    s.botNews.push({y:s.y,m:s.m,t,txt:top.txt,img:m&&m[2]&&IMG[m[2]]?m[2]:'',n:top.bn});if(s.botNews.length>30)s.botNews.splice(0,s.botNews.length-30);}}
/* ---------- что показать игроку ---------- */
// фирма в цифрах — для карточки соперника
function firmInfo(s,c,i,mo){const F=firmGet(s,c,i,mo),cp=((mo?MCOMPS:COMPS)[c]||[])[i];if(!F||!cp)return null;const t=mi(s),segs=firmSegs(cp),g=segs.slice().sort((a,b)=>cp.mix[b]-cp.mix[a])[0];
  const wh=(compWeights(c,g,s).find(o=>o.i===i&&!o.bot)||{}).w||0.02,pk=F.pk[g]||1,cst=firmCost0(g,wh,nestMu(s))*firmCostK(F,t),M=F.md[g]&&t>=F.md[g].from&&t<F.md[g].till?F.md[g]:null;
  return {F,cp,n:compName(cp,s),g,segs,ld:F.ld==null?1:F.ld,pk,margin:(pk-cst)/pk,net:F.r12>0?F.p12/F.r12:0,cash:F.cash||0,r12:F.r12||0,h12:F.h12||0,u12:F.u12||0,ck:firmCk(F,t),fin:firmFin(F,t)>0,ad:firmAd(F,t),md:M,dq:firmDq(F,g,t),du:firmDu(s,F,g),mult:firmMult(s,F,g),cap:F.cap||1,prog:F.prog,st:F.st,rec:F.rec||0,sh:F.sh[g]||0};}
// чем соперники класса сейчас сильнее своей истории — строки для карточки модели и «как посчитано»
function firmClassLines(s,c,g){const out=[];if(!s.firms||!firmsOn(s))return out;const t=mi(s),mo=isMotoSeg(g);
  ((mo?MCOMPS:COMPS)[c]||[]).forEach((cp,i)=>{const F=firmGet(s,c,i,mo);if(!F||F.st==='dead'||!cp.mix||!cp.mix[g]||!compAlive(cp,s))return;const du=firmDu(s,F,g);if(Math.abs(du)<0.05)return;const L=[],pk=F.pk[g]||1,dq=firmDq(F,g,t);
    if(Math.abs(pk-1)>=0.02)L.push(`цена ${pk<1?'−':'+'}${Math.round(Math.abs(1-pk)*100)}%`);if(dq>0.03)L.push(`новая модель${F.md[g].name?` «${F.md[g].name}»`:''} +${Math.round((Math.exp(dq/AQ)-1)*100)}%`);if(firmFin(F,t))L.push('рассрочка');if(firmAd(F,t)>0.05)L.push('реклама и гонки');
    out.push({n:compName(cp,s),i,du,sh:F.sh[g]||0,txt:L.join(', ')});});
  return out.sort((a,b)=>b.du*b.sh-a.du*a.sh);}
function firmClassHTML(s,c,g){const L=firmClassLines(s,c,g).filter(o=>o.du>0&&o.sh>=0.02).slice(0,3);if(!L.length)return '';
  return `<p class="small warn" style="margin-top:6px">⚔️ Ходы соперников в классе: ${L.map(o=>`<b>${esc(o.n)}</b> — ${esc(o.txt)}`).join('; ')}. <button class="link" data-act="rivals" data-c="${c}">Соперники</button></p>`;}
// ходы соперников за прошлый месяц — для полосы на главном экране
function rivMoves(s){const r=s.last;return ((r&&r.riv)||[]).slice().sort((a,b)=>(b.w||1)-(a.w||1));}
/* ---------- экран «Соперники»: их ход после вашего и карточки фирм ---------- */
const RIV_ICON={merge:'🤝',offer:'🏦',poach:'🧑‍🔧',grp:'🏭',model:'🚗',model0:'📐',line:'🏭',line0:'🏗',cut:'🔻',up:'🔺',fin:'💳',fin0:'💳',ad:'📣',ad0:'📣',cap:'🏭',cap0:'🏗',bad:'📉',ok:'📈',rec:'🏦',dead:'✖️',bot:'♟'};
function rivMine(s,c){return c===s.country||dealerCount(s,c)>0;}
// полоса на главном экране: что соперники сделали после вашего хода (на рынках, где вы продаёте)
function rivStrip(s){if(!s||!s.last||s.mode==='racer')return '';const L=rivMoves(s).filter(n=>rivMine(s,n.c)&&n.w>=2);if(!L.length)return '';
  const one=n=>`${RIV_ICON[n.k]||'⚔️'} ${esc(n.t)}`;
  return `<button class="ec-row riv" data-act="rivals" data-c="${L[0].c}"><i>♟</i><span><b>Ход соперников:</b> ${one(L[0])}${L.length>1?` <small>· ещё ${L.length-1}</small>`:''}</span></button>`;}
function firmStateTxt(I){return I.st==='bad'?['в долгах','bad']:I.rec?['после кредиторов','warn']:I.net>0.03?['прибыльна','good']:I.net>-0.01?['на нуле','muted']:['в убытке','warn'];}
function firmCardHTML(s,c,i,open,mo){const I=firmInfo(s,c,i,mo);if(!I)return '';const F=I.F,t=mi(s),st=firmStateTxt(I),yr=m=>Math.floor(1895+m/12),B=!mo&&s.bots&&s.bots[coKey(I.cp.n)]&&s.bots[coKey(I.cp.n)].c===c;
  const L=[];
  L.push(`Продажи за год: <b class="num">${fmtN(Math.round(I.u12))}</b> · ${I.ld>1.05?`на ${Math.round((I.ld-1)*100)}% больше обычного`:I.ld<0.95?`<span class="warn">на ${Math.round((1-I.ld)*100)}% меньше обычного</span>`:'как обычно'}`);
  L.push(`Цена: ${Math.abs(I.pk-1)<0.02?'обычная для класса':`<b>${I.pk<1?'−':'+'}${Math.round(Math.abs(1-I.pk)*100)}%</b> к обычной`} · с ${mo?'мотоцикла':'машины'} остаётся ${Math.round(I.margin*100)}% цены`);
  L.push(`Деньги: ${I.cash>=0?`запас ${money(I.cash)}`:`<span class="${I.st==='bad'?'bad':'warn'}">долг ${money(-I.cash)}</span>`} · прибыль за год ${I.net>=0?'':'−'}${Math.round(Math.abs(I.net)*100)}% выручки`);
  if(I.md)L.push(`${mo?'Мотоцикл':'Машина'}: новая модель${I.md.name?` «${esc(I.md.name)}»`:''} ${yr(I.md.from)} года${I.md.who?` — ответ ${esc(I.md.who)}`:''}, на ${Math.round((Math.exp(I.dq/AQ)-1)*100)}% лучше прежних ${mo?'мотоциклов':'машин'} марки; в производстве до ${yr(I.md.till)}`);
  if(I.ck<0.97)L.push(`Завод: поток с ${yr(F.lineT||t)} года — себестоимость −${Math.round((1-I.ck)*100)}%`);
  if(I.cap>1.3)L.push(`Мощности: в ${(I.cap/1.15).toFixed(1).replace('.',',')} раза больше, чем в истории`);
  if(I.fin)L.push('Продаёт в рассрочку');if(I.ad>0.05)L.push(`Реклама и заводская команда на гонках — до ${yr(F.ad.till)} года`);
  const P=F.prog,pn=P?{model:'новую модель',line:'перестройку завода на поток',fin:'продажу в рассрочку',ad:'рекламную кампанию'}[P.k]:null;
  if(pn)L.push(`<b>Готовит ${pn}</b> — ${P.at-t<=1?'в ближайший месяц':`через ${P.at-t} мес.`}${P.who?` (ответ ${esc(P.who)})`:''}`);
  if(F.capP)L.push(`Строит новые цеха — через ${Math.max(1,F.capP.at-t)} мес.`);
  try{firmCardExtra(s,F,I,L,mo);}catch(e){console.warn('firm card',e);}
  const log=(F.log||[]).slice(0,3).map(x=>`<small class="muted">${MONTHS[x.t%12]} ${yr(x.t)}: ${esc(x.txt)}</small>`).join('<br>');
  return `<div class="tech-row" id="firm${mo?'m':''}${c}${i}"><div class="row"><div><h3>${esc(I.n)}${B?' <span class="pill muted" title="великая марка: ведёт и большую стратегию — заграница, гонки, лаборатория, покупка марок">великая марка</span>':''}</h3><p class="small muted">${I.segs.map(g=>esc((SEG[g]||{name:g}).name)).join(', ')} · доля главного класса ${pct(I.sh,0)}</p></div><span class="pill ${st[1]}">${st[0]}</span></div>
    ${typeof brandAbout==='function'&&brandAbout(I.cp)?`<p class="small muted" style="margin-top:4px">${esc(brandAbout(I.cp))}</p>`:''}<p class="small" style="margin-top:4px">${L.join('<br>')}</p>${log?`<p style="margin-top:6px;line-height:1.35">${log}</p>`:''}${firmCardBtn(s,F,I,mo)}</div>`;}
function openRivals(c,fi){const s=G;c=c&&COUNTRIES[c]?c:s.country;const cs=Object.keys(COUNTRIES).filter(k=>rivMine(s,k)),mv=rivMoves(s),here=mv.filter(n=>n.c===c),else_=mv.filter(n=>n.c!==c&&rivMine(s,n.c)&&n.w>=3);
  const r=s.last,when=r?r.label:'';
  const mvHTML=L=>L.map(n=>`<div class="tech-row"><div class="row"><div><h3>${RIV_ICON[n.k]||'⚔️'} ${esc(n.t)}</h3><p class="small muted">${esc(n.txt)}</p></div></div></div>`).join('');
  const firms=(COMPS[c]||[]).map((cp,i)=>({cp,i,F:firmGet(s,c,i)})).filter(o=>o.F&&o.F.st!=='dead'&&!o.cp.imp&&compAlive(o.cp,s)&&(o.F.h12||0)>0).sort((a,b)=>(b.F.r12||0)-(a.F.r12||0));
  const mfirms=(MCOMPS[c]||[]).map((cp,i)=>({cp,i,F:firmGet(s,c,i,1)})).filter(o=>o.F&&o.F.st!=='dead'&&!o.cp.imp&&compAlive(o.cp,s)&&(o.F.h12||0)>=FD_MOTO.min*cpi(s)).sort((a,b)=>(b.F.r12||0)-(a.F.r12||0));
  const dead=Object.values(s.firms||{}).filter(F=>F.c===c&&F.st==='dead'&&s.dead&&s.dead[F.mo?'m:'+F.n:F.n]!=null).map(F=>`${esc(F.n)}${F.mo?' (мотоциклы)':''} (${Math.floor(1895+s.dead[F.mo?'m:'+F.n:F.n]/12)})`);
  const old=(s.rivLog||[]).filter(n=>n.c===c&&!(n.y===s.y&&n.m===(r?((s.m+11)%12):-1))).slice(-10).reverse();
  openSheet(`<div class="row"><h2>♟ Соперники</h2><button class="btn sm" data-act="close">Закрыть</button></div>
    <p class="small muted">Каждая марка — фирма со своей ценой, своей машиной, своим заводом и своей кассой. Она ходит после вас. Её ход меняет её собственные продажи — покупателей она отбирает у соседей по классу, у вас тоже. Вычетов из вашего спроса «за долю рынка» в игре больше нет.</p>
    ${cs.length>1?`<div class="chips" style="margin-top:8px">${cs.map(k=>`<button class="chip ${k===c?'on':''}" data-act="rivals" data-c="${k}">${esc(COUNTRIES[k].name)}</button>`).join('')}</div>`:''}
    <section class="card" style="margin-top:10px"><h2>Их ход${when?` · ${esc(when)}`:''}</h2>${here.length?mvHTML(here):'<p class="small muted">В этом месяце марки этой страны больших ходов не делали.</p>'}
      ${else_.length?`<p class="small muted" style="margin-top:8px">На других ваших рынках:</p>${mvHTML(else_)}`:''}</section>
    <section class="card" style="margin-top:10px"><h2>Фирмы · ${esc(COUNTRIES[c].name)}</h2>${firms.length?firms.map(o=>firmCardHTML(s,c,o.i)).join(''):'<p class="small muted">Пока это мастерские: счёт фирм начнётся, когда марки подрастут.</p>'}
      ${dead.length?`<p class="small muted" style="margin-top:8px">Закрылись в этой партии: ${dead.join(', ')}.</p>`:''}</section>
    ${farmCardHTML(s,c)?`<section class="card" style="margin-top:10px"><h2>Тракторные заводы · ${esc(COUNTRIES[c].name)}</h2>${farmCardHTML(s,c)}</section>`:''}
    ${mfirms.length&&(typeof lineOn!=='function'||lineOn(s,'moto'))?`<section class="card" style="margin-top:10px"><h2>Мотоциклетные фирмы · ${esc(COUNTRIES[c].name)}</h2>${mfirms.map(o=>firmCardHTML(s,c,o.i,false,1)).join('')}</section>`:''}
    ${old.length?`<section class="card" style="margin-top:10px"><h2>Раньше</h2>${old.map(n=>`<p class="small" style="margin-top:4px">${RIV_ICON[n.k]||'⚔️'} <span class="muted">${MONTHS[n.m]} ${n.y}:</span> ${esc(n.t)}</p>`).join('')}</section>`:''}`);
  if(fi!=null){const el=document.getElementById('firm'+c+fi);if(el&&el.scrollIntoView)el.scrollIntoView();}}
