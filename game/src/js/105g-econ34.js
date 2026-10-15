/* ================= 0.34: экономика, которую видно =================
   ТЗ «экономика, которую видно»: игрок должен видеть, почему продаёт столько, сколько продаёт, и из игры уходят лишние расходы.
   Замеры на test/harness.js:
   • при той же цене продажи растут примерно как S³ (S — «% соперника», classScore; AQ = 3): эластичность по S — 2,9–3,0
     во всех легковых и обоих мотоклассах, при доле класса 30% — 2,5, при 55% — 2,0 (класс насыщается);
   • эластичность по цене при цене класса — от −3 до −5,6: бедным покупателям важнее бюджет (GB·ln(1−P/B)); «типичная цена»
     refPrice (S^1,36) завышает цену хорошей машины — при S = 1,2 продажи не падают до наценки +10–18%, а refPrice даёт +28%;
   • часть спроса — вне S (modelExtras): слабый мотор, открытый кузов и тормоза «как у кареты» в 1920-х, литые шины, мотор сильнее
     рамы, налог на лошадиные силы, цвет, оснащение. Без них S ошибается больше чем в полтора раза в 15–38% замен деталей.
   Коэффициенты рынка (AQ, BR, GB, излом цены на 85%, сила ответа соперников) не менялись — здесь только то, что их показывает. */

/* ---------- цена равного спроса ---------- */
// При этой цене модель продастся столько же, сколько такая же модель с «% соперника» = 100% по цене класса: имя, дилеры, штрафы —
// те же, меняется только качество. Подбор — делением пополам по mkCountry с пробной моделью (полный охват: спрос пропорционален
// охвату, и равенство от него не зависит). Грузовик — против эталона класса (фирмы смотрят на тонно-километр, а не на S).
const EQP=new Map();
function eqPriceKey(md,s,c){return [c,mi(s),md.id,PART_KEYS.map(k=>md[k]).join(','),md.t,(md.eq||[]).join(','),md.paint,md.legend||'',md.launched,Math.round(s.rep),s.ad||0].join('|');}
function eqPrice(md,s,c){c=c||s.country;if(!md)return null;const k=eqPriceKey(md,s,c);if(EQP.has(k))return EQP.get(k);if(EQP.size>400)EQP.clear();
  let r=null;try{r=isTruck(md)?eqPriceTruck(md,s,c):eqPriceCar(md,s,c);}catch(e){console.warn('eqPrice',e);}
  EQP.set(k,r);return r;}
// поиск в ln-цене: секущая по ln-спросу (спрос почти степенной от цены), с вилкой — как деление пополам, если секущая уходит за неё;
// 4–6 расчётов рынка вместо 30
function eqBisect(D,D1,fair,P0){const f=x=>{const d=D(Math.exp(x));return d>0?Math.log(d)-Math.log(D1):30;};
  let lo=Math.log(0.2*fair),hi=Math.log(6*fair);const fh=f(hi);if(fh>=0)return {P:Math.exp(hi),edge:'hi'};const fl=f(lo);if(fl<=0)return {P:Math.exp(lo),edge:'lo'};
  let a=lo,fa=fl,b=hi,fb=fh,x=Math.log(clamp(P0||fair,0.21*fair,5.9*fair)),fx=f(x);
  for(let i=0;i<24&&Math.abs(fx)>0.002;i++){if(fx>0){a=x;fa=fx;}else{b=x;fb=fx;}
    let nx=x-fx*(b-a)/(fb-fa);if(!(nx>a&&nx<b))nx=(a+b)/2;x=nx;fx=f(x);}
  return {P:Math.exp(x),edge:''};}
function eqPriceCar(md,s,c){const g=segOf(md),fair=prefP(g,c,s)*payK(md),S=classScore(md,s,c),e=modelExtras(md,c,s)-contest(s,c,g);
  const D=(q,P)=>{const R=mkCountry(c,s,[{id:-7,probe:{g,q:Math.max(0.05,QG[g]*q),P,fair,e}}],null,null,1);return R.by[-7]||0;};
  const D1=D(1,fair);if(!(D1>1e-9))return null;const b=eqBisect(P=>D(S,P),D1,fair,fair*Math.pow(S,AQ/(BR+1.5)));
  return {P:b.P,fair,S,D1,edge:b.edge,kink:b.P<0.85*fair};}
function eqPriceTruck(md,s,c){const R0=rivalRef(md,s.y),fair=prefP('truck',c,s)*payK(R0.md),ref={...R0.md,id:-8,status:'prod',launched:md.launched??mi(s),price:fair};
  const mm={...md,id:-9,status:'prod'},D=(m,P)=>{const R=mkCountry(c,s,[m],{id:m.id,price:P},null,1);return R.by[m.id]||0;};
  const D1=D(ref,fair);if(!(D1>1e-9))return null;const b=eqBisect(P=>D(mm,P),D1,fair);
  return {P:b.P,fair,S:classScore(md,s,c),D1,edge:b.edge,kink:b.P<0.85*fair,truck:1};}
function eqPriceLine(md,s,cls){const E=eqPrice(md,s);if(!E)return '';
  const tail=E.edge==='hi'?' и дороже':E.edge==='lo'?' и дешевле':'';
  return `<p class="small ${cls||'muted'}">Продастся как у соперников при ≈ <b class="num">${money(Math.round(E.P/10)*10)}</b>${tail} <span class="muted">· цена класса ${money(Math.round(E.fair/10)*10)}</span></p>${E.kink?`<p class="small warn">Это ниже 85% цены класса — дальше скидка работает в 2,5 раза слабее: покупатели не верят «слишком дешёвому», соперники отвечают скидками.</p>`:''}`;}

/* ---------- скрытые штрафы: часть спроса вне «% соперника» ---------- */
// По строке на каждое слагаемое modelExtras, которое зависит от конструкции (Δ в полезности покупателя): множитель продаж e^Δ и причина.
// Сумма Δ переводится в «для покупателей ≈ N% соперника»: N = S·e^(Δ/3) (продажи растут как S³).
const ERA_YEAR=y=>y>=1929?1929:y;
function hiddenTerms(md,s,c){c=c||s.country;const g=segOf(md),p=parts(md),L=[],y=s.y,hp=Math.round(engineHp(p.e,md));
  const add=(id,d,txt)=>{if(Math.abs(d)>1e-9)L.push({id,d,mul:Math.exp(d),txt});};
  {const wh=weakHp(md,s,c);if(wh>0){const ref=rivalRef(md,s.y),hr=Math.round(byId(ENGINES,ref.md.e).hp);
    add('hp',-3.5*wh,`Мотор слабый: ${hp} л.с. против ${hr} у соперника — для класса «${SEG[g].name.toLowerCase()}» мало`);}}
  if(p.w.solid&&g!=='truck'&&s.y>=1905)add('solid',-1.5,'Литые шины: с 1905 года покупатели хотят пневматики');
  {const E=eraParts(md,c,s);
    if(E.body)add('body',-E.body,g==='sport'?'Закрытый кузов: спортивную хотят открытую':`Открытый кузов: в ${ERA_YEAR(y)} году покупатели хотят закрытый`);
    if(E.brakes)add('brakes',-E.brakes,`Тормоза не на все четыре колеса: в ${ERA_YEAR(y)} году их ждут`);}
  if(overpower(md))add('over',-0.4,'Мотор сильнее рамы: машины ломаются, о марке говорят плохо (и «% соперника» ниже на 15%)');
  {const ht=hpTax(md,c,s);if(ht>0)add('tax',-ht,`Налог на лошадиные силы: ${hp} л.с. — владелец платит больше`);}
  {const lk=lookU(md,g,s);if(Math.abs(lk)>1e-9)add('look',lk,g==='sport'?(lk>0?'Яркий цвет: спортивную берут охотнее':'Тусклый цвет: спортивную берут хуже'):(lk>0?'Яркий цвет — в моде':'Тёмный цвет — уже не в моде'));}
  if(typeof eqU==='function'){const u=eqU(md,g,s);if(Math.abs(u)>1e-9){const has=eqOf(md),y2=yf(s),miss=EQUIP.filter(e=>!has.includes(e.id)&&!has.some(id=>EQ_BY[id].sup===e.id)&&eqWait(e,g,y2)>0.25).map(e=>e.name.toLowerCase());
    add('eq',u,u>0?`Оснащение: ${has.map(id=>EQ_BY[id]&&EQ_BY[id].name.toLowerCase()).filter(Boolean).join(', ')||'новинки'} — покупатели доплатят`:`Нет того, что ждут покупатели${miss.length?': '+miss.join(', '):''}`);}}
  {const rb=relBonus(md,s);if(rb)add('rel',rb,rb>0?'Слава надёжной машины':'Слухи о поломках');}
  if(c!==s.country){const tp=tastePen(md,c,s);if(tp)add('taste',-tp,'Чужой вкус: машина не похожа на местные');}
  const D=L.reduce((a,x)=>a+x.d,0);return {L,D,mul:Math.exp(D)};}
// «для покупателей ≈ N% соперника»
function buyersPct(md,s,c){const S=classScore(md,s,c),H=hiddenTerms(md,s,c);return {S,N:S*Math.exp(H.D/3),H};}
// строки для карточки модели и конструктора: каждое слагаемое больше 0,05 по модулю — множитель продаж и причина
function hiddenHTML(md,s,inDesigner){if(isTruck(md))return '';const B=buyersPct(md,s),show=B.H.L.filter(x=>Math.abs(x.d)>0.05);if(!show.length)return '';
  const mul=x=>'×'+(x.mul>=10?Math.round(x.mul):x.mul.toFixed(2).replace('.',',').replace(/0$/,''));
  return `<div class="hid">${show.map(x=>`<p class="small ${x.d<0?(inDesigner?'bad':'warn'):'good'}">${x.d<0?'⚠️':'➕'} ${esc(x.txt)} — продажи ${mul(x)}</p>`).join('')}
    <p class="small"><b>Для покупателей ≈ ${Math.round(B.N*100)}% соперника</b> <span class="muted">(«% соперника» ${Math.round(B.S*100)}% с поправкой на то, что выше)</span></p></div>`;}

/* ---------- грузовик: главное — тонно-километр ---------- */
// самая массовая для модели перевозка (где фирмы берут её охотнее всего) и цена тонно-километра против эталона на ней
function truckHead(md,s,P){const c=s.country,PT=prefP('truck',c,s),sh=truckUseSh(c,s);P=P||md.price||refPrice(md,s);let best=null;
  TUSE.forEach(u=>{if(sh[u]<=0)return;const ref=truckRef(u,s.y),Pref=PT*payK(ref),cR=truckCost(ref,u,c,s,Pref).cpk,cp=truckCost(md,u,c,s,P).cpk,
    w=sh[u]*Math.exp(-BTC*Math.log(cp/cR)-TRUCK_USE[u].bp*Math.log(P/Pref)+TQ*truckSoft(md,ref,s.y));if(!best||w>best.w)best={u,w,cp,cR,k:cp/cR};});
  if(!best)return null;const d=Math.round((1-best.k)*100);
  return Object.assign(best,{txt:Math.abs(d)<1?`т·км как у соперника`:`т·км на ${Math.abs(d)}% ${d>0?'дешевле':'дороже'} соперника`,tone:best.k<=0.97?'good':best.k>1.05?'bad':'warn',use:TRUCK_USE[best.u].n.toLowerCase()});}

/* ---------- прибыль после всех расходов ---------- */
// постоянные расходы месяца — как в отчёте (13-turn.js): сеть и представительства, содержание завода, проценты, КБ, команда, реклама
function dlrCostNow(s){return Object.keys(s.dealers||{}).reduce((a,c)=>a+(warCut(s,c)?0:dealerCount(s,c)*dealerUpkeep(s,c)),0)+Object.keys(COUNTRIES).reduce((a,c)=>a+(warCut(s,c)?0:impUpkeep(s,c)),0);}
function fixedNow(s){const L=s.last||{};return {dlr:dlrCostNow(s),ovh:plantOverhead(s)*(s.shifts>1?1.1:1),int:(s.loan||0)*loanRate(s)/12,
  rd:rdUpkeep(s)+(typeof kitUpkeep==='function'?kitUpkeep(s,'kb'):0),team:(typeof teamUpkeep==='function'?teamUpkeep(s)+kitUpkeep(s,'team'):0)+(typeof driverPayroll==='function'?driverPayroll(s):0),ad:s.ad||0,
  // то, что идёт само: кредитная компания, дивиденды дочерних, лицензии — как в прошлом месяце
  fin:(L.finInc||0)-(L.finBad||0)+(L.div||0)+(L.lic||0)+(L.licIn||0)-(L.turn||0),sto:s.models.reduce((a,md)=>a+Math.max(0,md.stock)*matCost(md,s),0)*0.01};}
// f — прогноз марки (brandFc): выручка, машины, гарантия; контора — по admRate от прогнозной выручки и выпуска
function fcAfter(s,f){const F=fixedNow(s),rev=f.rev||0,admK=admRate(s,{made:Math.round(f.cars||0)}),adm=admK*rev;
  const pre=(f.brand||0)-adm-F.dlr-F.ovh-F.int-F.rd-F.team-F.ad-(f.war||0)-F.sto+F.fin,tax=pre>0?pre*taxRate(s.y):0,part=pre-tax>0&&s.partners&&s.partners.length?(pre-tax)*partnersShare(s):0;
  return {after:pre-tax-part,pre,adm,admK,rev,F,tax,part,fixed:F.dlr+F.ovh+F.int+F.rd+F.team+F.ad};}
// во сколько конторы обходится модель (контора с ней минус контора без неё) и что она приносит (маржа с её продаж)
function modelOffice(md,s,f){f=f||brandFc(md,s,md.price);const self=f.selfRev||0,cars=f.cars||0,mo=isMoto(md);
  const rw=admRate(s,{made:Math.round(cars)}),without=s.models.map(m=>m.id===md.id?{...m,status:'off'}:m);
  const rwo=admRate({...s,models:without},{made:Math.round(Math.max(0,cars-(mo?0:f.d)))});
  return {cost:rw*(f.rev||0)-rwo*Math.max(0,(f.rev||0)-self),contrib:f.pr||0,rate:rw};}

/* ---------- ответ соперников ---------- */
// штраф продаж ×e^−contest и из чего он складывается: натиск (доля выше порога уровня), скидки соперников, модели-ответы, объединение
function contestParts(s,c,g){const D=DIF(),rv=(s.rv&&s.rv[c]&&s.rv[c][g])||0,o=s.resp&&s.resp[c]&&s.resp[c][g],t=mi(s);
  let ms=0,mg=o?(o.mg||0):0;if(o)for(const x of o.ms||[])if(x.at<=t)ms+=x.k*Math.exp(-(t-x.at)/72);
  const cap=D.rboost??RESP_BOOST_MAX,raw=ms+mg,kk=raw>cap?cap/raw:1;ms*=kk;mg*=kk;
  const cut=respCut(s,c,g),cu=cut>0?-BR*Math.log(1-cut):0,tot=rv+ms+mg+cu,sh=o?o.sh:0,pend=o?(o.ms||[]).filter(x=>x.at>t).length:0;
  return {rv,ms,mg,cut,cu,tot,mul:Math.exp(-tot),sh,thrP:D.share||0.2,thrR:D.rshare||0.25,pend};}
function contestTxt(P){const L=[];if(P.rv>0.02)L.push(`натиск ×${xk2(Math.exp(-P.rv))}`);if(P.cu>0.02)L.push(`скидки соперников −${Math.round(P.cut*100)}% (×${xk2(Math.exp(-P.cu))})`);
  if(P.ms>0.02)L.push(`модели-ответы ×${xk2(Math.exp(-P.ms))}`);if(P.mg>0.02)L.push(`объединение ×${xk2(Math.exp(-P.mg))}`);return L.join(', ');}
function xk2(f){return f.toFixed(2).replace('.',',');}
function contestModelLine(md,s){if(isTruck(md))return '';const P=contestParts(s,s.country,segOf(md));if(P.tot<=0.2)return '';
  return `<p class="small warn" style="margin-top:6px">⚔️ Соперники отвечают на вашу долю: спрос ×${xk2(P.mul)} (${contestTxt(P)}). Скидку съест новый ответ — выгоднее поднять цену.</p>`;}

/* ---------- завод: места ---------- */
// сколько мест на линии занимает одна машина модели (простая машина — 1 место)
function placesOf(md,s){const cx=complexity(md);return isMoto(md)&&motoLv(s)>=2?cx*MSHOP2.cx:cx;}
// мощность в нынешней смеси моделей: сколько ваших машин или мотоциклов поместится (по выпуску прошлого месяца)
function capMix(s){const cap=capEff(s),act=s.models.filter(m=>m.status==='prod');let cw=0,cn=0,mw=0,mn=0;
  act.forEach(m=>{const w=Math.max(1,m.lastMade||m.fc||1),u=placesOf(m,s);if(isMoto(m)){mw+=w*u;mn+=w;}else{cw+=w*u;cn+=w;}});
  return {cap,cars:cn?cap/(cw/cn):0,motos:mn?cap/(mw/mn):(motoVis(s)?cap/Math.max(0.01,motoCx(s)*(motoLv(s)>=2?MSHOP2.cx:1)):0)};}

// строка карточки модели: модель приносит меньше, чем обходится конторе
function officeLine(md,s){if(md.status!=='prod')return '';let O=null;try{O=modelOffice(md,s,priceFc(md,s,md.price));}catch(e){console.warn('office',e);return '';}
  if(!O||O.cost<=Math.max(1,O.contrib))return '';
  return `<p class="small warn" style="margin-top:6px">🏢 Держать модель в линейке стоит ${money(O.cost)} в месяц конторы, она приносит ${money(Math.max(0,O.contrib))}${O.contrib<0?' (маржа в минусе)':''}. Снимите её с производства или поднимите цену.</p>`;}
function placesTxt(x){return x>=10?String(Math.round(x)):x>=1?x.toFixed(1).replace('.',',').replace(/,0$/,''):x.toFixed(2).replace('.',',');}
// «0,08 места», «2,4 места», «1 место», «12 мест»: дробное число — «места»
function placesWord(x){const t=placesTxt(x);return t.includes(',')?'места':plural(+t,'место','места','мест');}

/* ---------- заводы за границей, салоны, уход из страны (ТЗ пп. 5–8) ---------- */
// Свой завод или сборка в стране, где есть поглощённая марка (intIn), лишние: её заводы уже делают машины без пошлины и «чужой марки»
// (localMade, foreignPen). Продажа — на ступень ниже (при купленной марке — сразу до отделения); выручка — 40% цены, как при продаже цехов.
function impDownTo(s,c){const lv=impLv(s,c);if(c===s.country||lv<3||impBuilding(s,c))return 0;return intIn(s,c)?2:lv-1;}
function impSellValue(s,c){const lv=impLv(s,c),to=impDownTo(s,c);if(!to)return 0;let v=0;for(let l=lv;l>to;l--)v+=impCost(s,c,l);return Math.round(v*0.4/1000)*1000;}
function impSell(s,c){const lv=impLv(s,c),to=impDownTo(s,c);if(!to||warCut(s,c))return false;const v=impSellValue(s,c),up0=impUpkeep(s,c);
  s.imp[c]=to;s.cash+=v;const up1=impUpkeep(s,c);
  addLog(`${COUNTRIES[c].name}: ${IMP_LV[lv].n.toLowerCase()} продан${lv===4?'':'а'} за ${money(v)} — теперь ${IMP_LV[to].n.toLowerCase()}, содержание меньше на ${money(up0-up1)} в месяц.${intIn(s,c)?' Машины здесь по-прежнему местные: их делают заводы поглощённой марки.':''}`);return true;}
// «Уйти из страны»: все дилеры закрыты, отделение и заводы проданы; марку там постепенно забывают (узнаваемость тает сама)
function leaveValue(s,c){const lv=impLv(s,c);let v=0;for(let l=lv;l>=3;l--)v+=impCost(s,c,l);return Math.round(v*0.4/1000)*1000;}
function leaveOk(s,c){return c!==s.country&&!(s.lic&&s.lic[c])&&(dealerCount(s,c)>0||impLv(s,c)>0)&&!impBuilding(s,c);}
function leaveCountry(s,c){if(!leaveOk(s,c))return false;const d=dealerCount(s,c),lv=impLv(s,c),v=leaveValue(s,c),save=dealerCount(s,c)*dealerUpkeep(s,c)+impUpkeep(s,c);
  s.dealers[c]=0;if(s.dcap)delete s.dcap[c];if(s.dAdd)delete s.dAdd[c];s.imp=s.imp||{};s.imp[c]=0;if(s.pmk)delete s.pmk[c];s.cash+=v;
  addLog(`${COUNTRIES[c].name}: «${s.company}» уходит из страны — ${fmtN(d)} ${plural(d,'дилер закрыт','дилера закрыты','дилеров закрыто')}${lv>=2?`, ${IMP_LV[lv].n.toLowerCase()} — ${v?'продано за '+money(v):'закрыто'}`:''}. Расходы меньше на ${money(save)} в месяц, контора — без этой страны. Марку там будут забывать.`);return true;}
// салоны поменьше: шаг −0,25 (содержание дилера — пропорционально размеру салона)
function dealerShrink(s,c){const k=dealerMult(s,c);if(k<=1.001)return false;s.dcap=s.dcap||{};s.dcap[c]=+Math.max(1,k-0.25).toFixed(3);if(s.dAdd&&s.dAdd[c])s.dAdd[c]=Math.max(0,s.dAdd[c]-dealerCount(s,c)*0.25);
  addLog(`${COUNTRIES[c].name}: салоны дилеров поменьше — содержание сети меньше на ${money(dealerCount(s,c)*22*cpi(s)*0.25*clamp(0.4+0.06*(yf(s)-1895),0.4,1))} в месяц.`);return true;}
// загрузка сети: сколько продали в прошлом месяце из того, что сеть может продать
function netLoad(s,c){const cap=dealerCapOf(s,c),mk=s.last&&s.last.mk&&s.last.mk[c],sold=(mk&&mk.sold)||0;return {cap,sold,k:cap>0?sold/cap:0};}
// дилеры поглощённой марки — только в свободных городах; салоны там, где ваши дилеры уже есть, продаются — деньгами при сделке
function maDealerSplit(s,c,M){const lv=c===s.country?9:Math.max(impLv(s,c),2),n=dealerNeed(c,s),mx=c===s.country?Math.ceil(n*1.3):Math.max(3,Math.ceil(n*IMP_LV[Math.min(4,lv)].cap));
  const room=Math.max(0,mx-dealerCount(s,c)),add=Math.min(M.dl,room),extra=Math.max(0,M.dl-add);return {add,extra,v:Math.round(extra*dealerCost(s)*0.5/100)*100};}
// охват страны и что дала бы вся сеть (советник и карточка страны: «Во Франции ваши машины видят 1% покупателей…»)
function reachInfo(s,c){const d=dealerCount(s,c),need=Math.round(dealerNeed(c,s)),mx=dealerMax(s,c),r=reachOf(s,c),pot=marketPotential(s,c),miss=Math.max(0,Math.min(need,mx)-d);
  return {d,need,mx,r,pot,miss,cost:miss*dealerCost(s),capLim:mx<need};}
// карточка страны: загрузка сети (меньше пятой части — совет), лишний свой завод при купленной марке, охват за границей, ответ соперников
// что урезать в недогруженной сети, не теряя покупателей: салоны больше обычного — «Салоны поменьше»; дилеров больше, чем городов
// (охват уже полный, лишние его не добавляют) — закрыть лишних; иначе сеть ни при чём — машины мало берут сами (охват, цена, качество): совета нет
function netCut(s,c){const d=dealerCount(s,c);if(!s.last||d<10||warCut(s,c))return null;const NL=netLoad(s,c);if(NL.cap<=0||NL.k>=0.2)return null;
  const k=dealerMult(s,c),need=Math.round(dealerNeed(c,s)),extra=Math.max(0,d-need);
  if(k>1.01)return {how:'salon',NL,k,need,extra};return extra>=Math.max(2,d*0.05)?{how:'extra',NL,k,need,extra}:null;}
function econNetHTML(s,c){const d=dealerCount(s,c);if(!d)return '';const X=netCut(s,c);if(!X)return '';const up=d*dealerUpkeep(s,c);
  return `<p class="small warn" style="margin-top:4px">Сеть продаёт меньше пятой части того, что может: ${fmtN(Math.round(X.NL.sold))} из ${fmtN(Math.round(X.NL.cap))} в месяц, а содержание — ${money(up)}. ${X.how==='salon'?'Салоны поменьше':`Дилеров больше, чем городов (~${fmtN(X.need)}): закройте ${fmtN(X.extra)} лишних`} — сеть станет дешевле, продажи не упадут.</p>`;}
function plantRedundantHTML(s,c){const lv=impLv(s,c);if(lv<3||!intIn(s,c)||impBuilding(s,c))return '';const A=acqIn(s,c)[0],up=impUpkeep(s,c)-IMP_LV[2].up*cpi(s)*impK(s,c);
  return `<p class="small warn" style="margin-top:4px">🏭 ${lv>=4?'Свой завод':'Сборка'} здесь не ${lv>=4?'нужен':'нужна'}: заводы «${esc((A&&(A.nm||A.n))||'купленной марки')}» уже делают ваши машины без пошлины и «чужой марки». Содержание — ${money(up)} в месяц.</p>`;}
// «Во Франции…»: где — для строк про страну
const IN_C={de:'В Германии',fr:'Во Франции',uk:'В Британии',us:'В США',it:'В Италии',ru:'В России'};
function inC(c){return IN_C[c]||`В стране «${esc((COUNTRIES[c]||{}).name||c)}»`;}
function reachHTML(s,c){const I=reachInfo(s,c);if(I.r>=0.3||!I.d)return '';
  return `<p class="small warn" style="margin-top:4px">${inC(c)} ваши машины видят ${Math.max(1,Math.round(I.r*100))}% покупателей. Для всей страны нужно ~${fmtN(I.need)} дилеров${I.miss>0?` (~${money(I.cost)})`:''}${I.capLim?` — ${impLv(s,c)<=1?'импортёр торгует только в больших городах: нужно своё отделение':'больше не даёт способ торговли'}`:''}; будут брать ≈ ${fmtD(I.pot)} в месяц.${s.dpol==='low'?' При скидке дилерам 12% дилеры уходят к конкурентам — охват падает.':''}</p>`;}
function contestHTML(s,c){const mk=s.last&&s.last.mk&&s.last.mk[c];if(!mk)return '';const L=ALLSEG.map(g=>{const P=contestParts(s,c,g);if(P.tot<0.02&&P.sh<P.thrP*0.8)return '';
  return `<p class="small ${P.tot>0.2?'warn':'muted'}" style="margin-top:3px">⚔️ ${esc(SEG[g].name)}: доля ${pct(P.sh,0)} · порог ${pct(P.thrP,0)}${P.thrR!==P.thrP?`/${pct(P.thrR,0)}`:''} · спрос ×${xk2(P.mul)}${P.tot>0.02?` (${contestTxt(P)})`:''}${P.pend?` · готовится ответ: ${P.pend}`:''}</p>`;}).filter(Boolean);
  return L.length?`<div style="margin-top:4px">${L.join('')}<p class="small muted" style="margin-top:2px">Порог — на «${esc((DIFFS[s.diff]||{}).name||'')}»: выше первой доли соперники давят, выше второй — снижают цены и готовят модели-ответы.</p></div>`:'';}
// «Мощности»: сколько мест заняли в прошлом месяце машины, мотоциклы, склад, заказы и армия; мощность в нынешней смеси моделей
function capUseHTML(s){const L=s.last,B=L&&L.capBy,X=capMix(s);if(!B&&!X.cars&&!X.motos)return '';
  const tot=B?B.car+B.moto+B.stock+B.ord+B.mil:0,f=x=>fmtN(Math.round(x));
  const parts=B?[['машины',B.car],['мотоциклы',B.moto],['на склад',B.stock],['заказы',B.ord],['армия',B.mil]].filter(x=>x[1]>=0.5).map(x=>`${x[0]} ${f(x[1])}`).join(' · '):'';
  const mix=[X.cars?`≈ ${fmtN(Math.round(X.cars))} ваших машин`:'',X.motos?`${X.cars?'или ':'≈ '}${fmtN(Math.round(X.motos))} мотоциклов`:''].filter(Boolean).join(' ');
  const per=s.models.filter(m=>m.status==='prod').map(m=>({n:m.name,u:placesOf(m,s)})).sort((a,b)=>b.u-a.u).slice(0,7).map(x=>`«${esc(x.n)}» ${placesTxt(x.u)}`).join(' · ');
  return `${parts?`<p class="small" style="margin-top:4px">Места в прошлом месяце: ${parts}${tot>0?` (из ${f(X.cap)} мест)`:''}.</p>`:''}${mix?`<p class="small muted" style="margin-top:2px">В нынешней смеси моделей завод выпустит ${mix} в месяц.${per?` Мест на одну машину: ${per} — простая машина занимает одно место.`:''}</p>`:''}`;}
