/* ================= 0.25: деньги компании — кредит покупателям, вложения свободных денег, спецакции =================
   Игрок жаловался: «кредит покупателям» стоит денег, хотя своих денег — миллиард; свободные деньги некуда вложить;
   на продажи в чужой стране и классе нечем повлиять. Здесь:
   · кредит покупателям — через банки (комиссия) или своей кредитной компанией (как GMAC с 1919 года);
   · вложения — облигации своей страны и США, акции по индексу Доу-Джонса, свои поставщики (сталь, руда, стекло, лес, каучук, дорога);
   · военные займы — газета с подпиской в начале войны (облигации своей страны);
   · спецакции — реклама, скидка покупателям, пробег-демонстрация в стране и классе. */

/* ---------- кредит покупателям ---------- */
// Рассрочка: покупатель вносит треть цены, остальное платит год. Сколько машин продают в рассрочку — по стране и году
// (в Америке двадцатых — около двух третей, в Европе — заметно меньше)
function creditShare(s,c){const y=yf(s);return c==='us'?tabAt({1915:0.15,1919:0.35,1922:0.5,1925:0.65,1929:0.65},y):tabAt({1915:0.04,1919:0.12,1925:0.3,1929:0.35},y);}
const FIN_BANK=0.06,FIN_ADD=0.08;   // банк берёт ~6% суммы рассрочки; своя компания берёт с покупателя ~8% сверх суммы за год
function finOwn(s){return techLv(s,'credit')>0&&s.finPol==='own';}
function finTotal(s){return (s.finL||[]).reduce((a,b)=>a+b.p,0);}
function finBadRate(s){const k=creditState(s).k;return k==='crash'?0.06:k==='tight'||k==='panic'?0.045:0.015;}
// за месяц: сколько продано в рассрочку (по странам), комиссия банкам или выдача своих денег и возврат с процентами
function finMonth(s,r){r.fin=0;r.finInc=0;r.finBad=0;r.finOut=0;r.finIn=0;
  const L=s.finL=s.finL||[];
  if(L.length){const b=L.shift(),dr=finBadRate(s);r.finInc=b.i*(1-dr);r.finBad=b.p*dr;r.finIn=b.p*(1-dr);}
  if(!techLv(s,'credit'))return;
  let cr=0;for(const c in r.mk){const m=r.mk[c];if(m&&m.rev>0)cr+=m.rev*creditShare(s,c);}
  const F=cr*2/3;r.finCr=cr;
  if(finOwn(s)){r.finOut=F;for(let k=0;k<12;k++){L[k]=L[k]||{p:0,i:0};L[k].p+=F/12;L[k].i+=F*FIN_ADD/12;}}
  else r.fin=F*FIN_BANK;}

/* ---------- вложения: облигации ---------- */
// Цена облигации страны в долларах (цена займа × курс валюты к доллару; 1 — по номиналу) и купон в год. Приближённо, по годам:
// США — «займы свободы» падали до 85 в 1920 году; Британия — консоли и военный заём, фунт в 1920 году — 3,4 доллара;
// Франция — рента, франк с 5,2 до 25,5 за доллар (1926); Италия — лира с 5,2 до 19 (после «квоты 90»);
// Германия — военные займы обесценила инфляция 1923 года, в 1925 году их выкупили по 2,5% номинала.
const BOND={
  us:{n:'Облигации США',d:'казначейство, с 1917 года — «займы свободы»',v:{1895:1,1916:1,1917:0.99,1918:0.97,1919:0.95,1920:0.87,1921:0.9,1922:0.99,1923:1,1929:1},c:{1895:0.03,1917:0.04,1929:0.04}},
  uk:{n:'Британские облигации',d:'консоли, с 1915 года — военный заём',v:{1895:1,1900:0.97,1905:0.93,1910:0.9,1913:0.88,1914:0.86,1916:0.84,1917:0.82,1918:0.83,1919:0.74,1920:0.6,1921:0.66,1922:0.86,1923:0.9,1924:0.88,1925:0.97,1929:0.98},c:{1895:0.028,1913:0.034,1915:0.045,1917:0.05,1929:0.05}},
  fr:{n:'Французская рента',d:'рента 3%, с 1915 года — займы национальной обороны 5%',v:{1895:1,1905:0.99,1913:0.88,1914:0.85,1915:0.78,1916:0.76,1918:0.76,1919:0.53,1920:0.25,1921:0.27,1922:0.28,1923:0.21,1924:0.18,1925:0.15,1926:0.12,1927:0.16,1929:0.17},c:{1895:0.03,1915:0.05,1929:0.05}},
  de:{n:'Германские займы',d:'имперские займы, с 1914 года — военные займы 5%',v:{1895:1,1913:0.95,1914:0.92,1915:0.88,1916:0.8,1917:0.72,1918:0.56,1919:0.18,1920:0.06,1921:0.03,1922:0.004,1923:0,1924.9:0,1925:0.025,1929:0.03},c:{1895:0.035,1914:0.05,1929:0.05}},
  it:{n:'Итальянская рента',d:'рента 3,5%, с 1915 года — национальные займы',v:{1895:1,1913:0.95,1915:0.88,1916:0.8,1917:0.72,1918:0.7,1919:0.5,1920:0.23,1921:0.19,1922:0.21,1923:0.21,1924:0.19,1925:0.17,1926:0.16,1927:0.23,1929:0.24},c:{1895:0.035,1915:0.05,1929:0.05}}};
function bondV(c,s){const B=BOND[c];return B?Math.max(0,tabAt(B.v,yf(s))):0;}
function bondC(c,s){const B=BOND[c];return B?tabAt(B.c,yf(s)):0;}
function bondKinds(s){return s.country==='us'?['us']:[s.country,'us'];}
/* ---------- вложения: акции (индекс Доу-Джонса) ---------- */
// Опорные точки индекса: закрытие года и большие повороты (паники 1901, 1903, 1907, война, спад 1920–1921, бум и крах 1929)
const DJIA=[[1896.4,40.94],[1896.6,28.48],[1896.99,40.45],[1897.99,49.41],[1898.99,60.52],[1899.96,58.27],[1899.99,66.08],[1900.99,70.71],[1901.45,78.26],[1901.99,64.56],[1902.99,64.29],[1903.85,42.15],[1903.99,49.11],
  [1904.99,69.61],[1905.99,96.2],[1906.05,103],[1906.99,94.35],[1907.87,53],[1907.99,58.75],[1908.99,86.15],[1909.88,100.53],[1909.99,99.05],[1910.56,73.62],[1910.99,81.36],[1911.99,81.68],[1912.75,94.15],[1912.99,87.87],
  [1913.44,72.11],[1913.99,78.78],[1914.58,71.42],[1914.96,53.17],[1914.99,54.58],[1915.99,99.15],[1916.89,110.15],[1916.99,95],[1917.96,65.95],[1917.99,74.38],[1918.99,82.2],[1919.84,119.62],[1919.99,107.23],
  [1920.97,66.75],[1920.99,71.95],[1921.64,63.9],[1921.99,81.1],[1922.99,98.73],[1923.99,95.52],[1924.99,120.51],[1925.99,156.66],[1926.99,157.2],[1927.99,202.4],[1928.99,300],[1929.67,381.17],[1929.83,230.07],[1929.87,198.69],[1929.99,248.48],[1930.5,226]];
function djia(s){const t=yf(s)+1/24;if(t<=DJIA[0][0])return DJIA[0][1];for(let i=0;i<DJIA.length-1;i++){const [a,va]=DJIA[i],[b,vb]=DJIA[i+1];if(t<=b){const k=(t-a)/(b-a);return Math.exp(Math.log(va)+(Math.log(vb)-Math.log(va))*k);}}return DJIA[DJIA.length-1][1];}
function divYield(s){return tabAt({1896:0.045,1914:0.045,1916:0.055,1918:0.065,1921:0.065,1923:0.055,1926:0.05,1928:0.04,1929:0.035},yf(s));}
// Нью-Йоркская биржа закрыта с 31 июля по 12 декабря 1914 года: ни купить, ни продать
function exchClosed(s){return s.y===1914&&s.m>=7&&s.m<=10;}
function stocksOpen(s){return s.y>=1896&&!exchClosed(s);}

/* ---------- вложения: свои поставщики ---------- */
// cut — насколько дешевле детали, P — за сколько лет окупается при нынешнем выпуске; покрывает вдвое больше нынешних закупок
const SUPPLY=[
  {k:'timber',n:'Леса и лесопилки',y:1900,cut:0.02,P:3,min:100000,d:'Ясень и клён для колёс и каркасов кузовов — свои. В 1920 году Форд купил огромные леса в Мичигане и построил лесопилки в Айрон-Маунтин.'},
  {k:'steel',n:'Сталелитейный и прокатный завод',y:1905,cut:0.05,P:3,min:400000,d:'Свой прокат для рам, осей и кузовов — по себестоимости. Форд с 1920 года строил домны и прокатный стан на реке Руж, FIAT в 1917 году купил сталелитейные заводы Пьемонта.'},
  {k:'mines',n:'Рудники и угольные шахты',y:1905,cut:0.03,P:4,min:250000,d:'Своя руда для литейки и свой уголь для котельных. В 1920–1921 годах Форд купил железный рудник и угольные шахты в Кентукки.'},
  {k:'glass',n:'Стекольный завод',y:1910,cut:0.015,P:3,min:120000,d:'Стекло для фар, ветровых щитков и закрытых кузовов. В начале двадцатых Форд завёл своё стекло и научился варить его непрерывной лентой.'},
  {k:'rubber',n:'Каучуковая плантация',y:1910,cut:0.025,P:5,min:300000,risk:0.4,d:'Свой каучук для шин — но с риском: в 1928 году Форд заложил в джунглях Бразилии Фордландию, и каучука она так почти и не дала. Плантация даёт меньше, чем обещают.'},
  {k:'rail',n:'Железная дорога',y:1910,cut:0.012,P:4,min:500000,d:'Свои вагоны и пути: детали и машины идут без простоев. Форд в 1920 году купил дорогу Детройт — Толидо — Айронтон.'}];
// закупки деталей в месяц — среднее за последние месяцы (сглажено)
function matSpend(s){return Math.max(1,s.matAvg||(s.last&&s.last.mat)||0);}
function supPrice(s,S,cover){return Math.round(Math.max(S.min*cpi(s),S.cut*(cover||matSpend(s)*2)/2*12*S.P)/1000)*1000;}
function supOf(s){return (s.inv&&s.inv.sup)||{};}
// во сколько обходятся детали со своими поставщиками (1 — без них)
function supK(s){const U=supOf(s),M=matSpend(s);let k=1;for(const S of SUPPLY){const u=U[S.k];if(!u)continue;k-=S.cut*(S.risk||1)*Math.min(1,u.cover/M);}return Math.max(0.75,k);}
function supValue(s){const U=supOf(s);let v=0;for(const k in U)v+=U[k].val||0;return v;}

/* ---------- стоимость вложений и доход за месяц ---------- */
function invOf(s){const I=s.inv=s.inv||{};I.b=I.b||{};I.sup=I.sup||{};I.st=I.st||0;return I;}
function bondValue(s){const I=s.inv;if(!I||!I.b)return 0;let v=0;for(const c in I.b)v+=I.b[c]*bondV(c,s);return v;}
function stockVal(s){const I=s.inv;return I&&I.st?I.st*djia(s):0;}
function invValue(s){return bondValue(s)+stockVal(s)+supValue(s);}
function invMonth(s,r){const I=s.inv;r.invInc=0;if(!I)return;
  let c=0;for(const k in (I.b||{}))c+=I.b[k]*bondV(k,s)*bondC(k,s)/12;const d=stockVal(s)*divYield(s)/12;r.invInc=c+d;r.invB=c;r.invD=d;
  // заводы-поставщики стареют: 2% в год
  for(const k in (I.sup||{})){const u=I.sup[k];u.val=(u.val||0)*(1-0.02/12);}
  s.matAvg=s.matAvg?s.matAvg*0.8+(r.mat||0)*0.2:(r.mat||0);}
// касса ушла в минус — казначей продаёт облигации и акции, чтобы не звать банк
function invCover(s){const I=s.inv;if(!I||s.cash>=0)return;let need=-s.cash,got=0;
  const sell=(v,fee)=>{const x=Math.min(v,need/(1-fee));need-=x*(1-fee);got+=x*(1-fee);return x;};
  for(const c of Object.keys(I.b||{})){if(need<=0)break;const p=bondV(c,s);if(p<=0||!I.b[c])continue;const x=sell(I.b[c]*p,0.005);I.b[c]=Math.max(0,I.b[c]-x/p);}
  if(need>0&&I.st>0&&stocksOpen(s)){const p=djia(s),x=sell(I.st*p,0.01);I.st=Math.max(0,I.st-x/p);}
  if(got>0){s.cash+=got;addLog(`Касса ушла в минус: казначей продал облигации и акции на ${money(got)}.`,'bad');}}
// покупки и продажи (из интерфейса)
function invBuy(s,kind,amt){amt=Math.round(Math.min(amt,s.cash));if(amt<100)return false;const I=invOf(s);
  if(kind==='st'){if(!stocksOpen(s))return false;I.st+=amt*0.99/djia(s);s.cash-=amt;addLog(`Куплены акции американских компаний на ${money(amt)} (индекс Доу-Джонса ${Math.round(djia(s))}).`);return true;}
  const p=bondV(kind,s);if(!BOND[kind]||p<=0.001)return false;I.b[kind]=(I.b[kind]||0)+amt*0.995/p;s.cash-=amt;addLog(`Куплены облигации (${BOND[kind].n.toLowerCase()}) на ${money(amt)}.`);return true;}
function invSell(s,kind,frac){const I=invOf(s);frac=clamp(frac||1,0,1);
  if(kind==='st'){if(!I.st||!stocksOpen(s))return false;const u=I.st*frac,v=u*djia(s)*0.99;I.st-=u;s.cash+=v;addLog(`Проданы акции на ${money(v)}.`);return true;}
  const u=(I.b[kind]||0)*frac;if(u<=0)return false;const v=u*bondV(kind,s)*0.995;I.b[kind]-=u;s.cash+=v;addLog(`Проданы облигации (${BOND[kind].n.toLowerCase()}) на ${money(v)}.`);return true;}
function supBuy(s,k){const S=SUPPLY.find(x=>x.k===k);if(!S||s.y<S.y)return false;const I=invOf(s),u=I.sup[k],M=matSpend(s);
  if(u&&u.cover>=M*1.6)return false;const cover=M*2,p=u?supPrice(s,S,cover-u.cover):supPrice(s,S,cover);if(s.cash<p)return false;s.cash-=p;
  I.sup[k]={cover,val:(u?u.val:0)+p,t:u?u.t:mi(s)};addLog(`${u?'Расширен':'Куплен'}: ${S.n.toLowerCase()} (${money(p)}). Детали дешевле.`,'good');pendingToasts.push('🏭 '+S.n);return true;}
function supSell(s,k){const I=invOf(s),u=I.sup[k];if(!u)return false;const v=Math.round(u.val*0.6);s.cash+=v;delete I.sup[k];addLog(`Продан${k==='rail'?'а':''} ${SUPPLY.find(x=>x.k===k).n.toLowerCase()} за ${money(v)}.`);return true;}

/* ---------- военные займы: газета с подпиской ---------- */
// Правительства воюющих стран продавали займы всем — и заводы подписывались первыми: отказ печатали в газетах.
// Германский военный заём к 1923 году превратится в бумагу — игра этого не скрывает (цена в таблице BOND).
const WAR_LOANS=[
  {id:'loan_de',cc:'de',y:1914,m:8,img:'War bond',title:'Военный заём',deck:'Сентябрь 1914 года: первый военный заём Германии — 5% годовых',text:'Рейх собирает деньги на войну: заём под 5% годовых, его покупают банки, заводы и миллионы семей. Плакаты на каждой тумбе, списки подписчиков — в газетах.'},
  {id:'loan_it',cc:'it',y:1915,m:6,img:'War bond',title:'Национальный заём',deck:'Июль 1915 года: Италия воюет и просит денег',text:'Правительство выпускает национальный заём под 4,5% годовых. Подписка — в каждом банке, крупных промышленников ждут первыми.'},
  {id:'loan_fr',cc:'fr',y:1915,m:10,img:'War bond',title:'Заём национальной обороны',deck:'Ноябрь 1915 года: 5% годовых «за Францию»',text:'Первый большой военный заём: 5% годовых, «чтобы победить». Деньги несут и банки, и крестьяне; список крупных подписчиков печатают газеты.'},
  {id:'loan_uk',cc:'uk',y:1917,m:0,img:'War bond',title:'Великий военный заём',deck:'Январь 1917 года: 5% — «заём победы»',text:'Казначейство выпускает военный заём под 5% годовых — крупнейший в истории Британии. Банки дают кредит на подписку, газеты печатают имена фирм.'},
  {id:'loan_us',cc:'us',y:1917,m:4,img:'Liberty bond',title:'Заём свободы',deck:'Май 1917 года: первый «заём свободы» — 3,5% годовых',text:'Америка воюет и продаёт облигации «займа свободы»: плакаты, митинги, кинозвёзды на трибунах. Фирмы, которые не подписались, попадают в газетные списки.'}];
WAR_LOANS.forEach(L=>{WORLD.push(Object.assign({},L,{reel:'',mean:'Подписка — облигации своей страны (их можно продать на вкладке «Завод» → «Финансы»), репутация выше. Отказ заметят газеты.',fx:s=>{},
  ch:[['Подписаться на десятую часть кассы','wLoan10'],['Подписаться скромно','wLoan1'],['Не подписываться','wLoanNo']],
  res:{wLoan10:s=>{const a=Math.max(0,s.cash)*0.1;invBuy(s,s.country,a);s.rep=clamp(s.rep+3,0,100);return `«{co}» подписалась на ${money(a)}: имя фирмы — в первой строке газетного списка.`;},
    wLoan1:s=>{const a=Math.max(0,s.cash)*0.01;invBuy(s,s.country,a);s.rep=clamp(s.rep+1,0,100);return `«{co}» подписалась на ${money(a)}.`;},
    wLoanNo:s=>{s.rep=clamp(s.rep-2,0,100);return 'Газеты напечатали: «{co}» не дала ни цента на войну. Покупатели запомнили.';}}}));});

/* ---------- спецакции: страна × класс ---------- */
// u — сдвиг привлекательности на всё время акции (не затухает); disc — доля цены, которую получает назад покупатель
const PROMO={adv:{n:'Реклама по стране',u:0.12,mo:3,ic:'📣',d:'газеты, плакаты, витрины: о ваших машинах класса узнают все'},
  disc:{n:'Скидка покупателям',u:0.22,mo:3,disc:0.07,ic:'💵',d:'7% цены — назад покупателю, как «возврат» Форда в 1915 году: спрос заметно выше, но каждая продажа дешевле'},
  show:{n:'Пробег-демонстрация',u:0.08,mo:6,ic:'🚗',d:'машины колесят по стране, покупатели садятся за руль у дилеров: интерес держится полгода'}};
// месячный оборот класса в стране (все марки): с ним считается цена рекламы
function classValue(s,c,g){const mk=s.last&&s.last.mk&&s.last.mk[c],z=mk&&mk.segs&&mk.segs[g];const n=z?z.size:(()=>{try{return mkCountry(c,s,[]).segs[g].inc;}catch(_){return 0;}})();return Math.max(0,n)*prefP(g,c,s);}
// цена акции — от ваших продаж класса в этой стране (большая фирма ведёт большую кампанию); нет продаж — от оборота класса
function promoBase(s,c,g){const mk=s.last&&s.last.mk&&s.last.mk[c],z=mk&&mk.segs&&mk.segs[g],you=z?z.you:0,ms=s.models.filter(m=>(m.status==='prod'||m.status==='sale')&&segOf(m)===g);
  const pr=ms.length?ms.reduce((a,m)=>a+m.price,0)/ms.length:prefP(g,c,s);return Math.max(you*pr,classValue(s,c,g)*0.01);}
function promoCost(s,c,g,k){const P=PROMO[k];if(!P||P.disc)return 0;return Math.round(Math.max(300*cpi(s),promoBase(s,c,g)*(k==='adv'?0.25:0.2))/50)*50;}
function promoActive(s,c,g,k){return (s.promo||[]).find(p=>p.c===c&&p.g===g&&(!k||p.k===k)&&p.until>mi(s));}
function promoDisc(s,c,g){const p=promoActive(s,c,g,'disc');return p?PROMO.disc.disc:0;}
function promoOk(s,c){return dealerCount(s,c)>0&&!(c!==s.country&&typeof warCut==='function'&&warCut(s,c));}
function promoStart(s,c,g,k){const P=PROMO[k];if(!P||!promoOk(s,c)||promoActive(s,c,g,k))return false;const cost=promoCost(s,c,g,k);if(s.cash<cost)return false;
  s.cash-=cost;s.promoPaid=(s.promoPaid||0)+cost;const t=mi(s);(s.promo=s.promo||[]).push({c,g,k,from:t,until:t+P.mo,cost});
  wfxAdd(s,c,g,P.u,P.mo,'спецакция: '+P.n.toLowerCase());const f=s.wfx[s.wfx.length-1];f.flat=1;f.promo=1;
  addLog(`${P.ic} Спецакция «${P.n}» — ${COUNTRIES[c].name}, класс «${SEG[g].name}», ${P.mo} мес.${cost?` (${money(cost)})`:' (7% цены каждой проданной машины)'}.`,'good');pendingToasts.push(P.ic+' '+P.n);return true;}
function promoClean(s){if(s.promo)s.promo=s.promo.filter(p=>p.until>mi(s)-1);}
// кнопки спецакций для страны и класса (рынок, карточка пари)
function promoButtons(s,c,g,small){if(!promoOk(s,c))return '';return Object.keys(PROMO).map(k=>{const P=PROMO[k],on=promoActive(s,c,g,k),cost=promoCost(s,c,g,k);
  return on?`<span class="pill good">${P.ic} ${esc(P.n)} · ещё ${on.until-mi(s)} мес.</span>`:`<button class="btn sm" data-act="promo" data-c="${c}" data-g="${g}" data-k="${k}" ${s.cash<cost?'disabled':''} title="${esc(P.d)}">${P.ic} ${esc(P.n)}${cost?' · '+money(cost):' · −7% цены'}</button>`;}).join('');}
function promoSheet(c){const s=G;if(!s)return;const segs=SEGK.filter(g=>g!=='sport'||sportOpen(s,c)),mk=s.last&&s.last.mk&&s.last.mk[c];
  openSheet(`<div class="row"><h2>Спецакции · ${esc(COUNTRIES[c].name)}</h2>${X}</div>
    <p class="small muted" style="margin-top:6px">Акция поднимает спрос на ваши машины одного класса в одной стране, пока длится. ${Object.values(PROMO).map(P=>`<b>${P.ic} ${esc(P.n)}</b> — ${esc(P.d)}.`).join(' ')}</p>
    ${segs.map(g=>{const z=mk&&mk.segs&&mk.segs[g],you=z?z.you:0,size=z?z.size:0;return `<div class="race-item"><div class="row"><h3>${esc(SEG[g].name)}</h3><span class="small muted num">${fmtD(size)} машин в месяц · ваши ${fmtD(you)}</span></div><div class="btns" style="margin-top:6px">${promoButtons(s,c,g)}</div></div>`;}).join('')}
    <button class="btn block" style="margin-top:12px" data-act="close">Закрыть</button>`);}
