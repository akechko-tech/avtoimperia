/* ================= MARKET: households, incomes, cars in use, buyers' choice ================= */
// Рынок считается от покупателей, а не от истории продаж.
// Семьи страны делятся на 11 групп по доходу — от бедной половины до богатейших 0,1%.
// Каждый месяц часть семей присматривается к машине: новые покупатели и владельцы, которые меняют старую.
// Каждая семья сравнивает машины, до которых дотягивается (в её городе есть дилер), по качеству и цене
// с поправкой на свой доход — или пока ничего не покупает. Чем дешевле хорошая машина, тем больше семей
// может её купить. Реальные марки подобраны так, чтобы без игрока они продавали примерно столько,
// сколько в истории (таблица CALIB строится скриптом test/calib.js).

// Семьи, млн
const HH={us:{1895:14.3,1900:16.0,1905:17.9,1910:20.3,1915:22.5,1920:24.4,1925:27.2,1930:29.9},
  uk:{1895:8.3,1900:8.8,1905:9.3,1910:9.8,1915:10.0,1920:10.3,1922:10.0,1925:10.6,1930:11.3},
  fr:{1895:10.6,1900:10.7,1905:10.9,1910:11.1,1915:11.0,1919:11.4,1925:11.8,1930:12.2},
  de:{1895:11.6,1900:12.4,1905:13.5,1910:14.7,1915:15.3,1919:14.6,1925:15.6,1930:17.0},
  it:{1895:7.0,1900:7.2,1905:7.4,1910:7.8,1915:8.0,1920:8.4,1925:8.9,1930:9.6}};
// Средний доход семьи, $ того времени: ВВП на душу × размер семьи × 0,72; в Европе — по курсу к доллару,
// но без провалов курса в 1920-х (франк, лира, марка): машины своих заводов дешевели вместе с валютой
const INC={us:{1895:755,1900:843,1905:991,1910:1157,1913:1297,1915:1266,1916:1480,1917:1840,1918:2210,1919:2340,1920:2584,1921:1997,1922:2105,1923:2361,1925:2406,1927:2408,1929:2554},
  uk:{1895:626,1900:725,1905:693,1910:722,1913:817,1916:1050,1918:1500,1920:1488,1921:1293,1922:1200,1925:1340,1929:1338},
  fr:{1895:404,1900:467,1905:506,1910:570,1913:648,1916:650,1918:800,1920:974,1921:925,1925:1050,1927:1080,1929:1150},
  de:{1895:386,1900:470,1905:512,1910:570,1913:585,1916:550,1918:520,1920:480,1922:480,1923:420,1924:600,1925:703,1927:800,1929:909},
  it:{1895:204,1900:227,1905:262,1910:314,1913:350,1916:340,1918:340,1920:380,1921:420,1925:540,1927:580,1929:641}};
// Неравенство: показатель Парето для самых богатых 5% семей (чем меньше, тем богаче богатые)
const PARETO={us:{1895:1.5,1929:1.45},uk:{1895:1.45,1913:1.45,1920:1.55,1929:1.6},fr:{1895:1.5,1913:1.5,1920:1.6,1929:1.6},de:{1895:1.55,1929:1.6},it:{1895:1.5,1929:1.55}};
// Какую часть годового дохода семья готова отдать за машину (с конца 1910-х — покупка в рассрочку)
const AFFORD={us:{1895:0.5,1914:0.5,1920:0.65,1925:0.78,1929:0.82},eu:{1895:0.5,1919:0.5,1925:0.62,1929:0.68}};
// Машин на дорогах в начале 1895 года
const FLEET0={us:300,fr:1000,uk:100,de:400,it:60};
// Сколько лет машина ездит до свалки; раз в сколько лет владелец берёт новую (старую продаёт)
const CAR_LIFE={1895:6,1910:7,1920:8,1929:9},HOLD={1895:3,1910:3.5,1920:4,1929:4};
// Насколько машина вообще нужна семье: надёжность, дороги, бензин, мастерские
const APPEAL={1895:-2.2,1900:-0.6,1905:0.6,1910:1.2,1913:1.4,1916:1.4,1920:1.2,1925:1.4,1929:2};
// Грузовики и фургоны покупает бизнес: лавки, пивоварни, почта, стройки. Каждый месяц часть фирм обновляет
// свой транспорт — это доля ВВП; каждая фирма выбирает между лошадью с телегой и мотором.
// Сколько из них возьмут мотор, решают цена, надёжность и дороги эпохи (сила марок подобрана по истории).
const TRUCK_POOL={1895:0.0025,1905:0.0028,1913:0.003,1917:0.0045,1920:0.005,1925:0.0055,1929:0.0065};
const INC_SIG=0.75,INC_TOP=0.05,ZT=1.6449,HAZ=0.15,AQ=3,GB=2,BR=1.5,LAM=0.25,AQT=1.8,BT=4;
// Качество машин конкурентов в классе — доля лучшей машины эпохи
const QG={people:0.62,middle:0.8,lux:1,truck:0.75};
/* ---------- доходы семей ---------- */
function ncdf(z){const t=1/(1+0.2316419*Math.abs(z)),d=0.3989423*Math.exp(-z*z/2),p=d*t*(0.3193815+t*(-0.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));return z>0?1-p:p;}
function ninv(p){const a=[-39.69683028665376,220.9460984245205,-275.9285104469687,138.357751867269,-30.66479806614716,2.506628277459239],b=[-54.47609879822406,161.5858368580409,-155.6989798598866,66.80131188771972,-13.28068155288572],
  c=[-0.007784894002430293,-0.3223964580411365,-2.400758277161838,-2.549732539343734,4.374664141464968,2.938163982698783],d=[0.007784695709041462,0.3224671290700398,2.445134137142996,3.754408661907416];
  const tail=q=>(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  if(p<0.02425)return tail(Math.sqrt(-2*Math.log(p)));if(p>0.97575)return -tail(Math.sqrt(-2*Math.log(1-p)));
  const q=p-0.5,r=q*q;return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q/(((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);}
// Группы семей: доля семей «богаче» на границах групп
const QB=[1,0.5,0.3,0.15,0.08,0.05,0.03,0.015,0.007,0.003,0.001,0];
const BINS=QB.slice(0,-1).map((p,i)=>{const lo=QB[i+1],pm=lo>0?(p+lo)/2:p/2;return {w:p-lo,p:pm,z:pm>INC_TOP?ninv(1-pm):0};});
function households(c,s){return tabAt(HH[c],yf(s))*1e6;}
function affordK(c,s){return tabAt(AFFORD[c==='us'?'us':'eu'],yf(s));}
// Доходы: логнормальное «тело» и хвост Парето у богатейших 5%
function incomeOf(c,s){const t=yf(s),mean=tabAt(INC[c],t),al=tabAt(PARETO[c],t),sg=INC_SIG;
  const med=mean/(Math.exp(sg*sg/2)*ncdf(ZT-sg)+INC_TOP*al/(al-1)*Math.exp(sg*ZT)),xT=med*Math.exp(sg*ZT);
  return {mean,med,al,xT,I:BINS.map(b=>b.p>INC_TOP?med*Math.exp(sg*b.z):xT*Math.pow(b.p/INC_TOP,-1/al))};}
function shareAbove(inc,x){return x>=inc.xT?INC_TOP*Math.pow(x/inc.xT,-inc.al):1-ncdf(Math.log(x/inc.med)/INC_SIG);}
// Сколько семей может купить машину за P
function canAfford(c,s,P){return households(c,s)*shareAbove(incomeOf(c,s),P/affordK(c,s));}
// Свои особенности стран: налоги на роскошь и пошлины в Германии, дороги в Америке до 1906 года
const APPEAL_C={us:0,fr:-0.2,uk:-0.6,de:-1.5,it:0};
function appeal(c,s){const t=yf(s);return tabAt(APPEAL,t)+APPEAL_C[c]+(c==='us'?-1.5*clamp((1906-t)/6,0,1):0);}
function fleetHist(c,t){const tb=CALIB.fleet&&CALIB.fleet[c];return tb&&Object.keys(tb).length?tabAt(tb,t):FLEET0[c];}
function fleetOf(s,c){return s.fleet&&s.fleet[c]!=null?s.fleet[c]:fleetHist(c,yf(s));}
/* ---------- экономика стран ---------- */
function isWar(y,m,c){
  if(c==='us')return (y===1917&&m>=3)||(y===1918&&m<=10);
  if(c==='it')return (y===1915&&m>=4)||(y>=1916&&y<=1917)||(y===1918&&m<=10);
  return (y===1914&&m>=7)||(y>=1915&&y<=1917)||(y===1918&&m<=10);
}
// f — сколько покупателей осталось на рынке: в войну машины реквизируют, бензин по карточкам
function econ(y,m,c){
  let f=1,label='Стабильно',tone='good';const war=isWar(y,m,c);
  if(c==='uk'&&(y<1896||(y===1896&&m<10))){f=0.35;label='Закон о красном флаге';tone='warn';}
  if(war){f=c==='us'?(y===1917?0.85:0.6):y===1914?0.45:0.3;label='Война';tone='bad';}
  if(y===1919||y===1920){label='Послевоенный бум';tone='good';}
  if(y===1921){f=0.85;label='Спад';tone='warn';}
  if(c==='de'&&(y===1922||y===1923)){f=y===1923?0.5:0.85;label='Гиперинфляция';tone='bad';}
  if(y>=1924&&y<=1928){label='Ревущие двадцатые';tone='good';}
  if(y===1929&&m>=9){f=0.55;label='Биржевой крах';tone='bad';}
  return {f,label,tone,war};
}
const SEASON=[0.72,0.76,0.95,1.15,1.25,1.2,1.1,1.02,0.97,0.95,0.8,0.92];
function taxRate(y){return y<1914?0.08:y<=1919?0.25:0.15;}
// История продаж — только для подбора силы конкурентов
function segAnnual(c,g,s){const t=yf(s);if(g==='truck')return tabAt(MKT_TRUCK[c],t,true);const sh=tabAt(c==='us'?SEGSH.us:SEGSH.eu,t);return tabAt(MKT[c],t,true)*sh[{people:0,middle:1,lux:2}[g]];}
function prefP(g,c,s){return tabAt(PREF[g],yf(s))*PREF_C[c][g];}
// Типичная цена машины такого класса и качества — ориентир для игрока
const ALPHA_P={people:5,middle:3.5,lux:1.8,truck:4},ALPHA_Q={people:2.5,middle:2.5,lux:3.5,truck:1.8};
function refPrice(md,s,c){const g=segOf(md);return prefP(g,c||s.country,s)*payK(md)*Math.pow(clamp(classScore(md,s,c),0.3,2),ALPHA_Q[g]/ALPHA_P[g]);}
/* ---------- конкуренты ---------- */
function compVol(cp,s){const t=yf(s);if(t<cp.since||(cp.until&&t>=cp.until))return 0;return tabAt(cp.v,t,true);}
function compAlive(cp,s){return compVol(cp,s)>0;}
function compModel(cp,s){let m=null;(cp.models||[]).forEach(x=>{if(x[0]<=s.y)m=x;});return m;}
function compName(cp,s){if(cp.n==='Daimler'&&s.y>=1926)return 'Mercedes-Benz';if(cp.n==='Maxwell / Chrysler')return s.y>=1925?'Chrysler':'Maxwell';if(cp.n==='Nash'&&s.y<1917)return 'Rambler (Jeffery)';return cp.n;}
function compsOf(c,s){return (COMPS[c]||[]).filter(cp=>cp.pk!==s.pioneer);}
// Доля исторической марки игрока-первопроходца в классе: её место на рынке свободно
function ghostShare(c,g,s){const cp=(COMPS[c]||[]).find(x=>x.pk===s.pioneer);if(!cp||!(cp.mix&&cp.mix[g]))return 0;const S=segAnnual(c,g,s);return S>0?Math.min(0.97,compVol(cp,s)*cp.mix[g]/S):0;}
// Сила конкурентов класса: подобрана по истории (CALIB), плюс сложность игры
function kappa(c,g,s){const tb=CALIB.k&&CALIB.k[c]&&CALIB.k[c][g];let k=tb&&Object.keys(tb).length?tabAt(tb,yf(s)):-6;
  k+=Math.log(DIF().comp||1);const gs=ghostShare(c,g,s);if(gs>0)k+=Math.log(Math.max(0.03,1-gs));return k;}
function pwOf(s,c,g){return (s.pw&&s.pw[c]&&s.pw[c][g])||1;}
// Ответ конкурентов на ваш успех: новые модели, дилеры и реклама делают их машины привлекательнее
function rivalBoost(s,c,g){return (s.rv&&s.rv[c]&&s.rv[c][g])||0;}
// Сколько марок делят класс (обратный индекс Херфиндаля): крупные марки по истории, мелкие мастерские — остаток
function brandsN(c,g,s){const S=segAnnual(c,g,s)*(1-ghostShare(c,g,s));if(S<=0)return 1;let sq=0,sum=0;
  (COMPS[c]||[]).forEach(cp=>{if(cp.pk===s.pioneer)return;const v=compVol(cp,s)*((cp.mix&&cp.mix[g])||0);if(v>0){const x=Math.min(1,v/S);sq+=x*x;sum+=x;}});
  const rest=Math.max(0,1-sum),nr=clamp(3+(yf(s)-1895)*0.8,3,15);return clamp(1/Math.max(1e-6,sq+rest*rest/nr),1,40);}
// Ваша марка — одна из марок своего рынка: те же условия эпохи (дороги, надёжность, мода — поправка класса κ),
// а исходная доля — как у средней новой марки или как у исторической марки основателя, если она была больше.
// Всё остальное решают цена, качество, дилеры, реклама, репутация и гонки.
// Сколько покупателей найдёт новая марка фургонов, пока грузовиков почти нет (в США до 1906 года мешают дороги)
const TRUCK_FLOOR={us:-5.8,fr:-3.6,de:-3.2,uk:-3.5,it:-4.4};
function brandK(c,g,s){const tb=CALIB.k&&CALIB.k[c]&&CALIB.k[c][g];let k=tb&&Object.keys(tb).length?tabAt(tb,yf(s)):-6;
  // грузовиков у конкурентов ещё нет — первые фургоны берут самые смелые фирмы
  let b=g==='truck'&&k<-10?-99:k+Math.log(Math.max(ghostShare(c,g,s),1/(brandsN(c,g,s)+1)));
  if(g==='truck')b=Math.max(b,TRUCK_FLOOR[c]); // смелые фирмы найдутся всегда: лавки, пивоварни, почта
  return b-Math.log(DIF().comp||1);}
// Продажи конкурентов по маркам: доля марки в классе — как в истории
function compSplit(c,g,s,sales){const S=segAnnual(c,g,s),out=[];if(S<=0||sales<=0)return out;let sum=0;
  (COMPS[c]||[]).forEach((cp,i)=>{const mx=(cp.mix&&cp.mix[g])||0;if(!mx||cp.pk===s.pioneer)return;const v=compVol(cp,s)*mx;if(v>0){out.push({cp,i,v});sum+=v;}});
  const gs=ghostShare(c,g,s),rest=Math.max(1e-9,S*(1-gs)),k=sum>rest*0.95?0.95/sum:1/rest;out.forEach(o=>o.sales=sales*o.v*k);return out;}
/* ---------- игрок: дилеры, реклама, репутация ---------- */
// Какую часть покупателей страны видят ваши машины: первые дилеры открываются в больших городах
function reachOf(s,c){const d=dealerCount(s,c);return d?Math.pow(Math.min(1,d/dealerNeed(c,s)),0.7):0;}
function adRef(s,c){c=c||s.country;const y=(s.mkY&&s.mkY[c])||1000;return 100*cpi(s)*Math.pow(1+y/1000,0.75);}
function adEffect(s,c){const a=(s.ad||0)*(c===s.country?1:0.35)*bn('adEff');return 0.55*(1-Math.exp(-a/adRef(s,c)));}
function novelty(md,s){const age=(mi(s)-md.launched)/12;let u=age<1?0.15:0;u-=Math.min(0.3,0.03*Math.max(0,age-6));if(s.y>=1923)u-=Math.min(0.3,0.05*Math.max(0,age-3));return u;}
function raceEffect(md,s){return ((md.raceBoost||0)>mi(s)?0.25:0)+((s.titleBoost||0)>mi(s)?0.3:0);}
// Всё, кроме цены и качества: мощность, шины, репутация, реклама, новизна, гонки, чужая страна
// Слишком слабый мотор отпугивает (в Европе с налогом на лошадиные силы маленький мотор народной машины — норма)
function weakHp(md,s,c){const p=parts(md),ref=rivalRef(md,s.y),hpr=engineHp(p.e,md)/Math.max(1,byId(ENGINES,ref.md.e).hp),thr=c&&c!=='us'&&segOf(md)==='people'?0.45:0.65;return Math.max(0,Math.log(thr/hpr));}
function modelExtras(md,c,s){const g=segOf(md),home=c===s.country,p=parts(md);
  return -3.5*weakHp(md,s,c)-(p.w.solid&&g!=='truck'&&s.y>=1905?1.5:0)+1.3*(s.rep-50)/50+adEffect(s,c)+novelty(md,s)+raceEffect(md,s)+(home?0:-0.3)+Math.log(segBonus(g))+(techLv(s,'credit')?0.15:0)-(overpower(md)?0.4:0);}
// Цена для покупателя: за границей — с пошлиной и доставкой
function offerPrice(md,c,s,price){const home=c===s.country;return (price??md.price)*(home?1:1+tariffAt(c,s))+(home?0:shipCost(s));}
/* ---------- рынок страны ---------- */
// Чем большую часть бюджета съедает машина, тем меньше хочется её брать; дороже бюджета — почти никто
function budget(x){return x<=0.9?Math.log(1-Math.max(0,x)):Math.log(0.1)-10*(x-0.9);}
// models — ваши модели в продаже в этой стране; ov — {id, price}: «а если поставить другую цену»; kap — сила конкурентов вместо таблицы (для подбора)
function mkCountry(c,s,models,ov,kap,rhoOv){
  const t=yf(s),ec=econ(s.y,s.m,c),f=SEASON[s.m]*ec.f,H=households(c,s),inc=incomeOf(c,s),k=affordK(c,s),u0=appeal(c,s),hold=tabAt(HOLD,t);
  const pm=prefP('middle',c,s),rho=rhoOv!=null?rhoOv:models.length?reachOf(s,c):0,K=g=>kap?kap[g]:kappa(c,g,s)+rivalBoost(s,c,g);
  const rivals=['people','middle','lux'].map(g=>({g,q:QG[g],P:prefP(g,c,s)*pwOf(s,c,g),fair:prefP(g,c,s),k:K(g)}));
  const pr=md=>offerPrice(md,c,s,ov&&ov.id===md.id?ov.price:undefined);
  const offs=models.filter(m=>m.probe?m.probe.g!=='truck':!isTruck(m)).map(md=>md.probe?{md,...md.probe}:{md,g:segOf(md),q:mq(md,s,c),P:pr(md),fair:refPrice(md,s,c),e:modelExtras(md,c,s)});
  const BK={};['people','middle','lux'].forEach(g=>BK[g]=brandK(c,g,s));
  const R={c,f,H,inc,k,rho,fleet:fleetOf(s,c),shop:0,buyers:0,segs:{},by:{}};
  SEGK.forEach(g=>R.segs[g]={inc:0,you:0,size:0,price:prefP(g,c,s)});models.forEach(m=>R.by[m.id]=0);
  let own=R.fleet;
  for(let i=BINS.length-1;i>=0;i--){
    const n=H*BINS[i].w,o=Math.min(n,own);own-=o;const I=inc.I[i],B=k*I;
    // богатые меняют машину чаще, у многих их несколько
    const sh=(HAZ*(n-o)+o/hold*clamp(0.25*B/pm,1,4))/12*f;R.shop+=sh;if(sh<=0)continue;
    const U=(q,P,fair)=>u0+AQ*Math.log(q)-BR*Math.log(P/fair)+GB*budget(P/B);
    let Si=0;const ei=rivals.map(x=>{const e=Math.exp(U(x.q,x.P,x.fair)+x.k);Si+=e;return e;});
    // ваши модели: внутри класса похожие машины делят покупателей
    let Sp=0;const nest={};
    offs.forEach(o2=>{o2.v=(U(o2.q,o2.P,o2.fair)+o2.e+BK[o2.g])/LAM;const N=nest[o2.g]=nest[o2.g]||{m:-1e9,list:[]};N.list.push(o2);if(o2.v>N.m)N.m=o2.v;});
    for(const g in nest){const N=nest[g];N.z=N.list.reduce((a,o2)=>a+Math.exp(o2.v-N.m),0);N.A=Math.exp(LAM*(Math.log(N.z)+N.m));Sp+=N.A;}
    const dr=1+Si+Sp,du=1+Si;
    rivals.forEach((x,j)=>{const d=sh*ei[j]*(rho/dr+(1-rho)/du);R.segs[x.g].inc+=d;R.buyers+=d;});
    for(const g in nest){const N=nest[g];N.list.forEach(o2=>{const d=sh*rho*N.A/dr*Math.exp(o2.v-N.m)/N.z;R.by[o2.md.id]+=d;R.segs[g].you+=d;R.buyers+=d;});}
  }
  truckMarket(R,c,s,models.filter(m=>m.probe?m.probe.g==='truck':isTruck(m)),pr,K,u0);
  SEGK.forEach(g=>{const z=R.segs[g];z.size=z.inc+z.you;});
  return R;
}
// Грузовики: покупает бизнес — фирмы выбирают между лошадью и мотором; фургон сравнивают с грузовиком по цене за тонну груза
// в Америке грузовиков на доллар ВВП втрое больше: фермы, большие расстояния, дешёвые Ford TT
function truckPool(c,s){const t=yf(s),ec=econ(s.y,s.m,c);return households(c,s)*tabAt(INC[c],t)/0.72*tabAt(TRUCK_POOL,t)*(c==='us'?3:1)/prefP('truck',c,s)/12*SEASON[s.m]*(ec.war?2.5:ec.f);}
function truckMarket(R,c,s,ms,pr,K,u0){
  // в войну грузовики берёт армия
  const PT=prefP('truck',c,s),pool=truckPool(c,s),z=R.segs.truck;z.pool=pool;if(pool<=0)return;
  const U=(q,P,fair)=>u0-0.5+AQT*Math.log(q/QG.truck)-BT*Math.log(P/fair);
  const ei=Math.exp(U(QG.truck,PT*pwOf(s,c,'truck'),PT)+K('truck'));let m=-1e9;
  const bk=brandK(c,'truck',s),L=ms.map(md=>{const v=(md.probe?U(md.probe.q,md.probe.P,md.probe.fair||PT)+md.probe.e:U(mq(md,s,c),pr(md),PT*payK(md))+modelExtras(md,c,s))/LAM+bk/LAM;if(v>m)m=v;return {md,v};});
  let A=0,zs=0;if(L.length){zs=L.reduce((a,x)=>a+Math.exp(x.v-m),0);A=Math.exp(LAM*(Math.log(zs)+m));}
  const dr=1+ei+A,du=1+ei;z.inc+=pool*ei*(R.rho/dr+(1-R.rho)/du);R.shop+=pool;
  L.forEach(x=>{const d=pool*R.rho*A/dr*Math.exp(x.v-m)/zs;R.by[x.md.id]+=d;z.you+=d;});
}
function marketsOf(s){return Object.keys(COUNTRIES).filter(c=>c===s.country||dealerCount(s,c)>0);}
// Спрос на все модели во всех странах на текущий месяц
function demandAll(s,ov){
  const act=s.models.filter(m=>m.status==='prod');const res={by:{},mk:{}};act.forEach(m=>res.by[m.id]={});
  Object.keys(COUNTRIES).forEach(c=>{const open=c===s.country||dealerCount(s,c)>0,R=mkCountry(c,s,open?act:[],ov);res.mk[c]=R;if(open)act.forEach(m=>res.by[m.id][c]=R.by[m.id]||0);});
  return res;
}
// Спрос на модель при другой цене (подсказка игроку)
function demandAt(md,s,price){const r=demandAll(s,{id:md.id,price});return Object.values(r.by[md.id]||{}).reduce((a,b)=>a+b,0)*(techLv(s,'credit')?1.15:1);}
// Прогноз для новой модели: сколько возьмут дома рядом с вашими нынешними моделями
function forecastDemand(md,s){const o={...md,id:-1},R=mkCountry(s.country,s,[...s.models.filter(m=>m.status==='prod'),o]);return (R.by[-1]||0)*(techLv(s,'credit')?1.15:1);}
