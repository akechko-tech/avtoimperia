/* ================= MODEL ================= */
let G=null,tab='plant',draft=null,auto=null;
const T=s=>(s.y-1895)+s.m/12;
const mi=s=>(s.y-1895)*12+s.m;
const yf=s=>s.y+s.m/12;
const dstr=s=>MONTHS[s.m]+' '+s.y;
const unlocked=(arr,s)=>arr.filter(x=>x.y<=s.y);
const isTruck=md=>!!byId(BODIES,md.b).truck;
const segOf=md=>isTruck(md)?'truck':md.t==='t0'?'people':md.t==='t1'?'middle':'lux';
function DIF(){return DIFFS[(G&&G.diff)||'normal'];}
const upgL=id=>(G&&G.rd&&G.rd.upg[id])||0;
function unlockedP(arr,s){return arr.filter(x=>x.y<=s.y||(s.rd&&s.rd.early.includes(x.id)));}
function rdPoints(s){return s.rd.lvl*bn('rd');}
function rdUpCost(s){return Math.round(4000*s.rd.lvl*cpi(s)*(1+0.05*T(s))/100)*100;}
function rdUpkeep(s){return Math.round(60*Math.pow(s.rd.lvl,1.35)*cpi(s)*(1+0.03*T(s)));}
function rdProjects(s){
  const list=[];
  [[ENGINES,'Двигатель'],[CHASSIS,'Рама'],[BODIES,'Кузов'],[TYRES,'Шины']].forEach(([arr,kind])=>{
    unlockedP(arr,s).forEach(x=>{const l=upgL(x.id);if(l<3)list.push({kind:'upg',id:x.id,cat:kind,name:x.name,lvl:l+1,need:6*(l+1)+Math.round(x.q/8)});});
    const nx=arr.filter(x=>x.y>s.y&&!s.rd.early.includes(x.id)).sort((a,b)=>a.y-b.y)[0];
    if(nx&&nx.y-s.y<=s.rd.lvl+1)list.push({kind:'early',id:nx.id,cat:kind,name:nx.name,need:10+6*(nx.y-s.y),yrs:nx.y-s.y});
  });
  return list;
}
function PB(){return (G&&PIONEERS[G.pioneer]||PIONEERS.custom).b;}
function bn(k,d=1){const b=PB();return b[k]!==undefined?b[k]:d;}
function segBonus(g){const b=PB();return b.seg&&b.seg[g]||1;}
/* ---------- prices, wages, parts ---------- */
function cpi(s){return tabAt(CPI,yf(s));}
function wageBase(s,c){return tabAt(WAGE[c||s.country],yf(s));}
const WAGE_POL={low:{name:'Ниже рынка',k:0.85,prod:0.9,strike:0.045,turn:'высокая'},market:{name:'По рынку',k:1,prod:1,strike:0.02,turn:'обычная'},good:{name:'Выше рынка',k:1.25,prod:1.07,strike:0.008,turn:'низкая'},five:{name:'«Пять долларов в день»',k:2.2,prod:1.28,strike:0.002,turn:'почти нет',y:1914}};
function wageNow(s){return wageBase(s)*WAGE_POL[s.wagePol||'market'].k*(s.shifts>1?1.08:1);}
// В США поставщики рано перешли на поток: с 1903 года детали там заметно дешевле
function partCountry(s){const c=s.country;return c==='us'?(s.y<1903?1:s.y<1910?0.8:0.72):c==='uk'||c==='it'?1.05:1;}
function partCost(x,s){return x.c*cpi(s)*Math.max(0.4,1-0.04*Math.max(0,yf(s)-x.y))*partCountry(s);}
function bestQ(arr,y,f){const a=arr.filter(x=>x.y<=y&&(!f||f(x)));return a.length?Math.max(...a.map(x=>x.q)):0;}
function eraBest(s,truck){let b=bestQ(BODIES,s.y,x=>!!x.truck===!!truck);if(!b)b=bestQ(BODIES,s.y,x=>!x.truck);return bestQ(ENGINES,s.y)+bestQ(CHASSIS,s.y)+bestQ(TYRES,s.y)+b+12;}
const parts=md=>({e:byId(ENGINES,md.e),c:byId(CHASSIS,md.c),b:byId(BODIES,md.b),t:byId(TRIMS,md.t),w:byId(TYRES,md.w||'w2')});
function chassisMax(c){return c.max*bn('chassisTol')*(1+0.15*upgL(c.id));}
function engineHp(e){return e.hp*(1+0.1*upgL(e.id));}
function overpower(md){const p=parts(md);return p.e.hp>chassisMax(p.c);}
function modelQ(md){const p=parts(md);const u=x=>x.q*(1+0.12*upgL(x.id));const q=u(p.e)+u(p.c)+u(p.b)+u(p.w)+p.t.q;return (overpower(md)?q*0.6:q)*bn('quality');}
function modelR(md,s){return Math.min(1.15,modelQ(md)/eraBest(s,isTruck(md)));}
function baseCost(md,s){const p=parts(md);return partCost(p.e,s)+partCost(p.c,s)+partCost(p.b,s)+partCost(p.w,s)+p.t.c*cpi(s);}
function learn(md){return Math.max(0.8,Math.pow(1+(md.made||0)/200,-0.045));}
// Скидка поставщиков за объём: единичные машины дороже, партии в десятки тысяч — дешевле
function volFactor(v){return clamp(1.3-0.13*Math.log10(1+Math.max(0,v)),0.6,1.3);}
function matCost(md,s){const p=parts(md),tc=s.tech||{};let c=baseCost(md,s);
  if(tc.foundry)c-=partCost(p.e,s)*0.18;if(tc.press&&!isTruck(md))c-=partCost(p.b,s)*0.15;
  return Math.max(10,c*volFactor(md.vol||md.lastMade||1)*learn(md)*bn('matCost')*(s.supplyNow||1));}
function complexity(md){const p=parts(md);return p.e.cx*p.c.cx*p.b.cx*p.t.cx;}
/* ---------- factory ---------- */
const TECH={
  tools:{name:'Станочный парк',max:4,lv:[{y:1897,name:'Токарные и фрезерные станки',hrs:0.8,F:800,v:160},{y:1904,name:'Специальные станки под деталь',hrs:0.62,F:3000,v:320},{y:1911,name:'Многошпиндельные автоматы',hrs:0.5,F:9000,v:520},{y:1920,name:'Автоматические линии обработки',hrs:0.42,F:25000,v:700}],
    desc:'Станки делают детали быстрее и точнее — меньше часов на машину.'},
  elec:{name:'Электрификация цехов',max:2,lv:[{y:1900,name:'Групповой привод от электромотора',hrs:0.92,cap:1.05,F:1500,v:120},{y:1910,name:'Свой мотор у каждого станка',hrs:0.85,cap:1.1,F:6000,v:260}],
    desc:'Электромоторы вместо трансмиссий от паровой машины: светлые цеха, гибкая расстановка станков.'},
  parts:{name:'Взаимозаменяемые детали',max:1,lv:[{y:1908,name:'Калибры и допуски',hrs:0.75,F:4000,v:250,need:{tools:2},hist:[1908,'Cadillac']}],
    desc:'Любая деталь подходит к любой машине без подгонки напильником. В 1908 году Cadillac разобрал три машины, смешал детали и собрал снова — и получил за это приз Дьюара.'},
  line:{name:'Сборочная линия',max:2,lv:[{y:1901,name:'Поточная сборка на тележках',hrs:0.82,cap:1.25,F:1500,v:80,hist:[1901,'Olds']},{y:1913,name:'Движущийся конвейер',hrs:0.4,cap:2.0,F:15000,v:420,need:{parts:1,elec:1},hist:[1913,'Ford'],flex:1,y0:1913}],
    desc:'Машина едет к рабочему. Конвейер в разы ускоряет сборку, но каждая дополнительная модель на нём стоит эффективности.'},
  school:{name:'Школа мастеров',max:1,lv:[{y:1905,name:'Обучение рабочих',hrs:0.92,F:3000,v:0,pw:15}],desc:'Обученные рабочие меньше ошибаются и быстрее осваивают новые модели.'},
  qc:{name:'Контроль качества',max:3,lv:[{y:1900,name:'Отдел технического контроля',def:0.05,F:1500,v:30},{y:1908,name:'Испытательный стенд',def:0.03,F:6000,v:60},{y:1920,name:'Заводская лаборатория',def:0.015,F:20000,v:90}],
    desc:'Меньше брака — меньше гарантийных ремонтов и лучше репутация.'},
  foundry:{name:'Литейка и моторный цех',max:1,lv:[{y:1905,name:'Свои отливки и моторы',mat:0.82,F:20000,v:150,hist:[1917,'Ford River Rouge']}],desc:'Моторы делаются на заводе, а не покупаются у поставщика: мотор дешевле на 18%.'},
  press:{name:'Кузовной пресс',max:1,lv:[{y:1914,name:'Штампованный стальной кузов',hrs:0.88,mat:0.85,F:40000,v:260,hist:[1914,'Dodge / Budd']}],desc:'Кузов штампуют из стали, а не собирают из дерева: дешевле и прочнее.'},
  paint:{name:'Быстросохнущая эмаль',max:1,lv:[{y:1924,name:'Нитроэмаль вместо лака',hrs:0.93,cap:1.1,F:8000,v:120,hist:[1924,'General Motors (Duco)']}],desc:'Покраска за часы вместо недель: склады краски и сушильные цеха больше не нужны.'},
  credit:{name:'Продажа в кредит',max:1,lv:[{y:1919,name:'Своя кредитная компания',F:25000,v:0,dem:0.15,hist:[1919,'General Motors (GMAC)']}],desc:'Покупатель платит частями: спрос выше на 15%, но касса ждёт денег дольше.'}
};
const TECH_ORDER=['tools','elec','parts','line','school','qc','foundry','press','paint','credit'];
function techLv(s,k){return (s.tech&&s.tech[k])||0;}
function techNext(s,k){const d=TECH[k],l=techLv(s,k);return l<d.max?d.lv[l]:null;}
function techEarly(s){const l=s.rd?s.rd.lvl:1;return (l>=5?3:l>=4?2:l>=3?1:0)+(bn('convEarly',0)?1:0);}
function techOpen(s,k){const nx=techNext(s,k);if(!nx)return false;if(nx.y>s.y+techEarly(s))return false;if(nx.need)for(const r in nx.need)if(techLv(s,r)<nx.need[r])return false;return true;}
function techCost(s,k){const nx=techNext(s,k);if(!nx)return 0;return Math.round((nx.F+nx.v*s.cap)*cpi(s)*(k==='line'&&techLv(s,k)===1?1/bn('lineCost'):1)/100)*100;}
function techMul(s,key){let m=1;for(const k in TECH){const l=techLv(s,k);for(let i=0;i<l;i++){const v=TECH[k].lv[i][key];if(v!==undefined)m*=v;}}return m;}
function defectRate(s){const l=techLv(s,'qc');return l?TECH.qc.lv[l-1].def:0.08;}
function hoursPerCar(md,s){const conv=techLv(s,'line')===2,act=(s.models||[]).filter(m=>m.status==='prod').length;
  return Math.max(55*complexity(md),4000*complexity(md)*techMul(s,'hrs')*(conv&&act>1?1+0.12*(act-1):1)*Math.max(0.6,Math.pow(1+(md.made||0)/300,-0.09))*(md.ramp>0?1.5:1));}
function hoursPerWorker(s){return (s.y<1915?250:s.y<1921?235:215)*WAGE_POL[s.wagePol||'market'].prod*bn('workerEff')*(s.strikeNow?0.5:1);}
function capEff(s){return s.cap*techMul(s,'cap')*(s.shifts>1?1.85:1)*bn('lineCap');}
function capUnitCost(s){return Math.round(1500*cpi(s)*(1+0.12*techLv(s,'tools')+0.08*techLv(s,'elec'))*bn('lineCost'));}
function plantOverhead(s){return s.plantVal*0.009+30*cpi(s)*(1+s.workers/150);}
/* ---------- sales network ---------- */
function dealerNeed(c,s){return tabAt(DEALER_NEED[c],yf(s));}
function dealerTP(s){return tabAt(DEALER_TP,yf(s));}
function dealerCost(s){return Math.round(220*cpi(s)*(1+T(s)*0.02));}
function dealerUpkeep(s){return 10*cpi(s);}
function dealerCount(s,c){return (s.dealers&&s.dealers[c])||0;}
function tariffAt(c,s){return tabAt(TARIFF[c],yf(s));}
function shipCost(s){return 60*cpi(s);}
/* ---------- finance ---------- */
function stockValue(s){return s.models.reduce((a,m)=>a+m.stock*matCost(m,s),0);}
function companyValue(s){const pr=(s.hist.profit||[]).slice(-12),avg=pr.length?pr.reduce((a,b)=>a+b,0)/pr.length:0;return s.cash-s.loan+s.plantVal+stockValue(s)+Math.max(0,avg*12*7);}
function maxLoan(s){return Math.round((0.6*(s.plantVal+stockValue(s))+15000*cpi(s))/1000)*1000;}
function devCost(md,s){s=s||G;return Math.round((1500+modelQ(md)*40)*cpi(s)*(1+T(s)*0.03)*bn('devCost')/100)*100;}
function devMonths(md){return Math.max(1,Math.round((2+Math.ceil(modelQ(md)/30))*bn('devTime')));}
function toolingCost(md,s){return Math.round((800+300*complexity(md))*cpi(s)*(techLv(s,'line')===2?4:techLv(s,'tools')>=2?2:1)/100)*100;}
function qLabel(r){return r<0.45?['Устарела','bad']:r<0.8?['Средняя','warn']:['Передовая','good'];}
function totalSold(s){return s.models.reduce((a,m)=>a+m.totalSold,0);}
function addLog(text,kind=''){G.log.push({d:dstr(G),text,kind});if(G.log.length>400)G.log.shift();}
function hostName(c){return c==='intl'?'Международная':(COUNTRIES[c]?COUNTRIES[c].name:({be:'Бельгия',es:'Испания',mc:'Монако',at:'Австрия',ch:'Швейцария'}[c]||c));}
const fmtN=n=>{n=Math.round(n);return Math.abs(n)>=1e6?(n/1e6).toFixed(n>=1e7?1:2).replace('.',',')+' млн':Math.abs(n)>=1e4?Math.round(n/1000)+' тыс.':n.toLocaleString('ru-RU');};
function lastOf(arr,y,f){const a=arr.filter(x=>x.y<=y&&(!f||f(x)));return a[a.length-1];}
function newGame(pioneer,country,company,diff){
  const C=COUNTRIES[country];
  const comps={};for(const k in COMPS)comps[k]=COMPS[k].map((a,i)=>({name:a.n,color:COMP_COLORS[i%COMP_COLORS.length],last:0}));
  G={v:8,diff:diff||'normal',rd:{lvl:1,proj:null,prog:0,upg:{},early:[]},drivers:[],contracts:{},pioneer,y:1895,m:0,country,company:company||PIONEERS[pioneer].co,cash:0,loan:0,
     cap:3,capBuild:[],plantVal:0,shifts:1,workers:12,staffAuto:true,wagePol:'market',tech:{},techBuild:null,dealers:{[country]:1},ad:30,rep:30,
     military:false,strikeNext:false,supplyNext:1,nextId:2,comps,pw:{},raceDone:{},raceLog:[],season:{},cres:{},rdept:0,titles:[],ach:{},firsts:{},papers:[],
     models:[{id:1,name:'Тип 1',e:'e1',c:'c1',b:'b1',t:'t1',w:'w2',paint:'#1b1d22',price:1000,plan:'auto',status:'prod',devLeft:0,launched:0,stock:0,backlog:0,lastDem:0,lastSold:0,lastMade:0,totalSold:0,made:0,fc:0}],
     hist:{cash:[],sales:[],market:[],profit:[],share:[]},peak:{year:0,share:{}},yearSold:0,last:null,log:[],pending:[],seen:{},over:false};
  G.plantVal=G.cap*capUnitCost(G);
  G.cash=Math.round(C.cash*bn('cash')*DIF().cash);G.rep=bn('rep',30);
  const md=G.models[0];md.price=Math.round(refPrice(md,G)/10)*10;
  G.dealers[country]=Math.max(1,Math.round(dealerNeed(country,G)/3));
  G.fleet={};G.mkY={};for(const c in COUNTRIES){G.fleet[c]=fleetHist(c,1895);const R=mkCountry(c,G,[]);G.mkY[c]=SEGK.reduce((a,g)=>a+R.segs[g].inc,0)*12/SEASON[0];}
  const P=PIONEERS[pioneer];
  addLog(`${P.name==='Свой персонаж'?'Вы основали':P.name+' основал'} компанию «${G.company}», ${C.city}. В мастерской ${G.workers} рабочих, первая модель — «Тип 1», дилеров — ${G.dealers[country]}.`,'hist');
  if(country==='uk')addLog('По закону перед автомобилем должен идти человек с красным флагом. Продажи пока скромные.','hist');
  if(country==='us')addLog('Богатых семей в Америке много, но дороги плохи и машины пока в диковинку. Во Франции они уже в моде — там стоит открыть агентов.','hist');
  if(country==='it')addLog('Богатых семей в Италии немного, и свой рынок крошечный. Покупателей в разы больше во Франции и Германии — откройте там дилеров.','hist');
}
