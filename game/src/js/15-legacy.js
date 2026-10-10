/* ================= LEGACY: firsts, score, comparison with history ================= */
// Первенства: игрок внедрил технологию или деталь раньше, чем это случилось в истории
// 0.25: кто и когда впервые поставил деталь на машины в настоящей истории (ключи — детали из 01-data.js; прежняя таблица съехала на добавленных деталях)
const PART_HIST={e2:[1898,'Daimler (мотор «Феникс» Майбаха)'],e10:[1903,'Cadillac'],e3:[1903,'Aster'],e9:[1908,'Ford (Model T)'],e4:[1908,'Continental'],e5:[1909,'Daimler из Ковентри (мотор Найта)'],
  e14:[1914,'Dodge Brothers'],e6:[1914,'Cadillac (первый массовый V8)'],e11:[1922,'Austin и Citroën'],e7:[1922,'верхнеклапанные моторы двадцатых'],e8:[1919,'Isotta Fraschini (Tipo 8)'],e12:[1929,'Chevrolet («шестёрка по цене четвёрки»)'],
  g2:[1891,'Panhard et Levassor'],g3:[1899,'Луи Рено'],g4:[1901,'Oldsmobile'],g7:[1928,'Cadillac'],
  k2:[1902,'Луи Рено'],k3:[1910,'Isotta Fraschini'],k6:[1919,'Hispano-Suiza'],k4:[1921,'Duesenberg'],k5:[1927,'Ford (Model A)'],
  c2:[1891,'Panhard et Levassor'],c3:[1901,'Mercedes (Вильгельм Майбах)'],c6:[1908,'Ford (Model T)'],c5:[1906,'Морис Удай (гидравлический амортизатор)'],c7:[1922,'Lancia (Lambda)'],
  w2:[1895,'Michelin'],w3:[1904,'Continental'],w4:[1906,'Michelin (съёмные обода)'],w5:[1908,'Rudge-Whitworth'],w6:[1913,'Goodyear и Palmer'],w7:[1908,'Sankey'],w8:[1923,'Firestone'],
  b4:[1910,'Cadillac (закрытый кузов Fisher)'],b9:[1922,'Essex (Coach)'],b5:[1922,'Dodge Brothers и Budd'],b6:[1896,'Daimler']};
function recordFirst(s,key,name,histY,who){if(!s.firsts)s.firsts={};if(s.firsts[key]||s.y>=histY)return;
  s.firsts[key]={y:s.y,name,hy:histY,who};addLog(`Первыми в мире: ${name} — на ${histY-s.y} г. раньше, чем ${who}.`,'good');pendingToasts.push('🌟 Первыми: '+name);
  const rid=reelGet(key,s)?key:null;if(rid)reelUnlock(s,rid);
  try{trophyAdd(s,{kind:'record',title:`Первыми в мире: ${name}`,sub:`на ${histY-s.y} ${plural(histY-s.y,'год','года','лет')} раньше, чем ${who}`,story:`В настоящей истории это сделал ${who} только в ${histY} году.`,key:'first|'+key,reel:rid||'',pt:'Первыми в мире!'});}catch(_){}
  if(!G.pending.length)pushEvent({own:1,title:'Первыми в мире!',deck:name,text:`«${s.company}» опередила историю на ${histY-s.y} ${plural(histY-s.y,'год','года','лет')}: в настоящем прошлом это сделал ${who} только в ${histY} году. Газеты всего мира пишут о новинке.`,choices:rid?[['Читать дальше','ok'],['▶ Кинохроника','reel:'+rid]]:undefined},true);
  s.rep=clamp(s.rep+4,0,100);}
function checkFirstParts(md){const s=G,p=parts(md),cp=(s.rd&&s.rd.copied)||{};[p.e,p.g,p.c,p.k,p.b,p.w].forEach(x=>{const h=x&&PART_HIST[x.id];if(h&&s.y<h[0]&&!cp[x.id])recordFirst(s,'part:'+x.id,x.name,h[0],h[1]);});}
function checkFirstTech(k,l){const s=G,lv=TECH[k].lv[l-1];if(lv&&lv.hist)recordFirst(s,'tech:'+k+':'+l,lv.name,lv.hist[0],lv.hist[1]);}
function plural(n,a,b,c){n=Math.abs(n)%100;const n1=n%10;if(n>10&&n<20)return c;if(n1>1&&n1<5)return b;if(n1===1)return a;return c;}
function legacyYear(s){if(!s.lhist)s.lhist=[];s.lhist.push({y:s.y-1,sold:s.peakLast||0,val:Math.round(companyValue(s)),rep:Math.round(s.rep),sh:+(s.shLast||0).toFixed(4)});if(s.lhist.length>40)s.lhist.shift();}
const RACE_W={major:15,normal:5};
// 0.29: наследие копится годами, как счёт в «Цивилизации»: рекорд эпохи нельзя набрать в первые годы.
// Масштаб — лучший год и всё, что выпущено за эпоху; рынок — доля, удержанная годами (15 «долевых лет» — максимум);
// инновации — первенства, которые пошли в серию (а не только на бумаге); бренд — репутация, которой нужно лет двадцать;
// спорт — победы и титулы самой марки (гонки её основателя за чужие заводы — его личная слава, не марки)
function legacyParts(o){
  const scale=0.6*400*Math.log10(1+(o.peak||0)/1000)/Math.log10(1+2000)+0.4*400*Math.log10(1+(o.cum||0)/10000)/Math.log10(1+2100);
  const market=150*Math.min(1,(o.shareYrs||0)/15)+10*(o.abroad||0);
  const innov=30*(o.firsts||0)+(o.techs||0)*4+Math.min(60,10*(o.kingTech||0));
  const sport=Math.min(400,(o.wins||0)*RACE_W.major+(o.minor||0)*RACE_W.normal+(o.titles||0)*60);
  const capital=250*Math.log10(1+Math.max(0,o.val||0)/1e6)/Math.log10(1+4000);
  const mat=clamp((o.age||0)/20,0.1,1),brand=(o.rep||0)*mat+(o.legend||0)+Math.min(40,4*(o.kingClass||0));
  return {scale,market,innov,sport,capital,brand,total:scale+market+innov+sport+capital+brand,mat};
}
function coFoundedY(s){return s.racer&&s.racer.founded?s.racer.founded.y:(s.startY||1895);}
// гонки и титулы самой марки: без личной карьеры гонщика-основателя до основания
function ownRaces(s){return (s.raceLog||[]).filter(r=>!('works' in r)&&!r.rx);}
function ownTitles(s){const fy=s.racer&&s.racer.founded?s.racer.founded.y:0;return (s.titles||[]).filter(t=>!t.rx&&!(fy&&t.y<fy));}
// первенство по детали засчитывается, когда машин с этой деталью продано хотя бы 300 (новинка пошла в серию)
function firstsLive(s){return Object.keys(s.firsts||{}).filter(k=>{if(!/^part:/.test(k))return true;const id=k.slice(5);return s.models.some(m=>PART_KEYS.some(q=>m[q]===id)&&(m.totalSold||0)>=300);}).length;}
function playerLegacy(s){
  const wins=ownRaces(s).filter(r=>r.place===1),major=wins.filter(r=>r.major).length,minor=wins.length-major;
  const bestModel=Math.max(0,...s.models.map(m=>m.totalSold));const longModel=s.models.some(m=>m.launched!==undefined&&m.status!=='dev'&&(mi(s)-m.launched)>=120&&m.totalSold>1000);
  const abroad=Object.keys(s.peak.share||{}).filter(c=>c!==s.country&&s.peak.share[c]>=0.05).length;
  const techs=Math.min(8,Object.values(s.tech||{}).reduce((a,b)=>a+b,0));
  const T=ownTitles(s),kings=T.filter(t=>/^king-/.test(t.id||'')),sportT=T.filter(t=>!/^king-/.test(t.id||'')||t.id==='king-race');
  // доля, удержанная годами: сумма годовых долей дома (старые сохранения — лучшая доля × прожитые годы)
  const LH=(s.lhist||[]).filter(h=>h.sh!=null),age=Math.max(0,s.y-coFoundedY(s));
  const shareYrs=LH.length?LH.reduce((a,h)=>a+h.sh,0):(s.peak.shY!=null?s.peak.shY:((s.peak.share||{})[s.country]||0))*Math.min(age,15)*0.6;
  const L=legacyParts({peak:Math.max(s.peak.year||0,s.yearSold||0),cum:typeof totalSold==='function'?totalSold(s):0,shareYrs,abroad,firsts:firstsLive(s),techs,kingTech:kings.filter(t=>t.id==='king-tech').length,
    kingClass:kings.filter(t=>t.id!=='king-tech'&&t.id!=='king-race').length,wins:major,minor,titles:sportT.reduce((a,t)=>a+(t.w||1),0),val:companyValue(s),rep:s.rep,age,
    legend:(bestModel>=1e6?60:bestModel>=1e5?30:0)+(longModel?20:0)});
  // 0.21: очки наследия, выигранные в пари, — к имени марки
  if(s.legBonus){L.brand+=s.legBonus;L.total+=s.legBonus;}
  return L;
}
function histLegacy(h){const age=1929-h.f;return legacyParts({peak:h.peak,cum:h.cum,shareYrs:h.share*Math.min(15,age),abroad:h.c==='us'?1:0,firsts:h.firsts,techs:8,wins:h.wins,minor:h.wins,titles:h.titles,val:h.val,rep:h.rep,age,legend:h.legend?40:0});}
const LEG_NAMES={scale:'Масштаб',market:'Рынок',innov:'Инновации',sport:'Спорт',capital:'Капитал',brand:'Бренд'};
// марка из истории, которую в этой партии основали вы (играя за Генри Форда, соревнуетесь и с «историческим Ford» — тем, что был на самом деле)
const LEG_TWIN={ford:'Ford',benz:'Mercedes-Benz',renault:'Renault',peugeot:'Peugeot',bugatti:'Bugatti',agnelli:'FIAT'};
function legacyTable(s){
  const me=playerLegacy(s),tw=LEG_TWIN[s.pioneer];const rows=HIST_CO.map(h=>({n:h.n===tw?'исторический '+h.n:h.n,c:h.c,p29:h.p29,val:h.val,note:h.note,L:histLegacy(h)}));
  rows.push({n:s.company,c:s.country,you:1,p29:s.peak.year||0,val:companyValue(s),L:me});
  rows.sort((a,b)=>b.L.total-a.L.total);return {rows,me,place:rows.findIndex(r=>r.you)+1};
}
function legacyTitle(t){
  const me=t.me,cats=['scale','market','innov','sport','capital','brand'],norm={scale:400,market:200,innov:200,sport:300,capital:250,brand:160};
  const top=cats.slice().sort((a,b)=>me[b]/norm[b]-me[a]/norm[a])[0];
  if(t.place===1)return ['Величайшая автоимперия эпохи','Ни одна реальная компания 1929 года не оставила такого следа.'];
  if(top==='scale'&&me.scale>=330)return ['Новый Форд','Ваши машины ездят по всему миру — автомобиль стал вещью для всех.'];
  if(top==='sport'&&me.sport>=200)return ['Бугатти своего времени','Имя компании знают по победам на трассах.'];
  if(top==='brand'&&me.brand>=110)return ['Роллс-Ройс эпохи','Ваша марка — синоним надёжности и роскоши.'];
  if(top==='innov'&&me.innov>=120)return ['Изобретатели эпохи','Вы придумали то, чем потом пользовались все.'];
  if(top==='capital'&&me.capital>=160)return ['Финансовая империя','Как General Motors: сила компании — в деньгах и управлении.'];
  if(t.place<=5)return ['Великая компания','Одна из пяти самых заметных автомобильных компаний эпохи.'];
  if(t.place<=12)return ['Заметная марка','Историки автомобиля знают вашу компанию.'];
  return ['Одна из сотен марок','Из сотен марок 1900-х до 1929 года дожили единицы. Ваша — среди них.'];
}
function finalResults(s,show){
  const t=legacyTable(s),[title,sub]=legacyTitle(t);
  s.final={place:t.place,total:Math.round(t.me.total),title};
  if(!s.fameSaved){s.fameSaved=1;fameAdd({company:s.company,pioneer:s.pioneer,country:s.country,diff:s.diff,score:Math.round(t.me.total),place:t.place,title,year:s.y,sold:totalSold(s),bankrupt:!!(s.cash<-debtLimit(s))});}
  const text=`${sub}\nКомпания «${s.company}» заняла ${t.place}-е место среди ${t.rows.length} автомобильных компаний эпохи. Очки наследия: ${Math.round(t.me.total)}.\nПродано машин: ${totalSold(s).toLocaleString('ru-RU')}. Лучший год: ${fmtN(s.peak.year||0)} машин. Побед в гонках: ${s.raceLog.filter(x=>x.place===1).length}. Титулов: ${(s.titles||[]).length}. Первенств: ${Object.keys(s.firsts||{}).length}. Стоимость компании: ${money(companyValue(s))}.`;
  if(show){openFinal();return;}
  s.pending.push({title:'Итоги эпохи: '+title,deck:`«${s.company}» встречает 1930 год`,text,paper:true,choices:[['Сравнить с историей','final']]});
}
/* ---------- 0.26: наследие в людях — каждая N-я семья, фирма, лимузин, спортивная машина ---------- */
// Ваши машины на дорогах по классам (все страны игры): прибавились проданные, ушли старые
function pflMonth(s,r){const life=tabAt(CAR_LIFE,yf(s)),tl=tabAt(TRUCK_LIFE,yf(s));
  if(!s.pfl){s.pfl={people:0,middle:0,lux:0,sport:0,truck:0};let pf=0;for(const c in (s.pfleet||{}))pf+=s.pfleet[c]||0;const act=s.models.filter(m=>m.status==='prod'&&!isTruck(m));
    const tot=act.reduce((a,m)=>a+(m.totalSold||0),0)||1;act.forEach(m=>{s.pfl[segOf(m)]+=pf*(m.totalSold||0)/tot;});if(!act.length)s.pfl.people+=pf;
    s.models.filter(m=>isTruck(m)).forEach(m=>{s.pfl.truck+=(m.totalSold||0)*0.6;});}
  const add={};s.models.forEach(md=>{if(!md.soldBy)return;const g=isTruck(md)?'truck':segOf(md);for(const c in md.soldBy)add[g]=(add[g]||0)+(md.soldBy[c]||0);});
  for(const g in s.pfl)s.pfl[g]=Math.max(0,s.pfl[g]*(1-1/(12*(g==='truck'?tl:life)))+(add[g]||0));}
// Сколько машин класса на дорогах всех стран и у каждой марки: продажи за годы службы машины (история рынка)
function worldFleet(s){const t=yf(s),life=Math.round(tabAt(CAR_LIFE,t)),tl=Math.round(tabAt(TRUCK_LIFE,t)),out={tot:{},br:{}};
  for(const c in COUNTRIES)for(const g of SEGK){const L=g==='truck'?tl:life;for(let k=0;k<L;k++){const ss={y:Math.floor(t-k),m:6};if(ss.y<1895)break;const w=1-k/(L+1);
    out.tot[g]=(out.tot[g]||0)+segAnnual(c,g,ss)*w;
    (COMPS[c]||[]).forEach(cp=>{if(cp.pk===s.pioneer)return;const v=compVol(cp,ss)*((cp.mix&&cp.mix[g])||0)*w;if(v>0){const n=compName(cp,s),B=out.br[n]=out.br[n]||{};B[g]=(B[g]||0)+v;}});}}
  return out;}
// «каждая 12-я» — до тысячи; дальше «одна из 16 000»
function oneIn(n,w){const r=Math.round(n);return r<=1?'каждая'+(w?' '+w:''):r<1000?`каждая ${r}-я${w?' '+w:''}`:r<=5e6?`одна${w?' '+w:''} из ${r.toLocaleString('ru-RU')}`:`одна${w?' '+w:''} из миллионов`;}
function humanLegacy(s){const pf=s.pfl||{},W=worldFleet(s),H=Object.keys(COUNTRIES).reduce((a,c)=>a+households(c,s),0);
  const cars=g=>g==='car'?['people','middle','lux','sport'].reduce((a,k)=>a+(pf[k]||0),0):(pf[g]||0),tot=g=>g==='car'?['people','middle','lux','sport'].reduce((a,k)=>a+(W.tot[k]||0),0):(W.tot[g]||0);
  const me={fam:cars('car')>0.5?H/cars('car'):0,car:cars('car')>0.5?tot('car')/cars('car'):0,truck:(pf.truck||0)>0.5?tot('truck')/pf.truck:0,lux:(pf.lux||0)>0.5?tot('lux')/pf.lux:0,sport:(pf.sport||0)>0.5?tot('sport')/pf.sport:0};
  const brs=Object.entries(W.br).map(([n,B])=>({n,car:['people','middle','lux','sport'].reduce((a,k)=>a+(B[k]||0),0),truck:B.truck||0,lux:B.lux||0,sport:B.sport||0}));
  const top=k=>brs.filter(b=>b[k]>0.5).sort((a,b)=>b[k]-a[k]).slice(0,3).map(b=>({n:b.n,v:tot(k==='car'?'car':k)/b[k],fam:k==='car'?H/b[k]:0}));
  return {me,H,top:{car:top('car'),truck:top('truck'),lux:top('lux'),sport:top('sport')}};}
function humanLegacyHTML(s){if(!s.pfl)return '';const L=humanLegacy(s),m=L.me,row=(t,v,rv)=>`<div class="hum-row"><span>${t}</span><b class="num">${v}</b>${rv?`<small class="muted">${rv}</small>`:''}</div>`;
  const cmp=(arr,f)=>arr.length?arr.map(b=>`${esc(b.n)} — ${f(b)}`).join(' · '):'';
  const lines=[];
  lines.push(row('Семьи',m.fam?`${oneIn(m.fam,'семья')} ездит на «${esc(s.company)}»`:'ваших машин на дорогах ещё нет',cmp(L.top.car,b=>oneIn(b.fam,'семья'))));
  if(m.car)lines.push(row('Машины на дорогах',`${oneIn(m.car,'машина')} — ваша`,cmp(L.top.car,b=>oneIn(b.v,'машина'))));
  if(m.truck||L.top.truck.length)lines.push(row('Фирмы',m.truck?`${oneIn(m.truck,'фирма')} с грузовиком возит грузы на вашем`:'ваших грузовиков у фирм пока нет',cmp(L.top.truck,b=>oneIn(b.v))));
  if(m.lux||(L.top.lux.length&&s.y>=1900))lines.push(row('Люкс',m.lux?`${oneIn(m.lux)} дорогая машина — ваша`:'ваших дорогих машин пока нет',cmp(L.top.lux,b=>oneIn(b.v))));
  if((m.sport||L.top.sport.length)&&sportAny(s))lines.push(row('Спорт',m.sport?`${oneIn(m.sport)} спортивная машина — ваша`:'ваших спортивных машин пока нет',cmp(L.top.sport,b=>oneIn(b.v))));
  return `<div class="label" style="margin-top:12px">Наследие в людях</div><div class="hum">${lines.join('')}</div><p class="small muted" style="margin-top:4px">Все пять стран игры: семьи, машины и грузовики на дорогах (машина служит ${Math.round(tabAt(CAR_LIFE,yf(s)))} лет). Серым — самые большие марки для сравнения.</p>`;}
