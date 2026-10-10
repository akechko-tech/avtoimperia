/* ================= 0.24: ВЫЗОВЫ НЕ ТОЛЬКО НА ГОНКАХ =================
   Пари на гонку календаря было единственным частым вызовом. Теперь соперники бросают вызов по-разному — как в истории:
   • матч-гонка один на один: одна машина против одной на ипподроме, автодроме или дороге (Форд — Уинтон, Гросс-Пойнт 1901;
     матчи Бруклендса, где на гонщиков ставили, как на лошадей);
   • спор о скорости: мерная миля с хода (Ашер 1898–99, Ницца, Ормонд-Бич) или рекорд круга на автодроме — каждый едет один, на время;
   • продажи класса: за квартал, за полгода или до конца года — дома и на экспортном рынке; если силы неравны — с форой;
   • пробег на надёжность: по одной серийной машине на долгий маршрут («Тысяча миль» 1900, «Океанский пробег» 1909) —
     судьи считают поломки и время.
   Один вызов за раз; развязка — та же сцена с соперником, газета, счёт и грамота (43d-duel.js). */

/* ---------- где проходят матчи и споры о скорости ---------- */
// k: match — матч-гонка, record — спор о скорости, both — и то и другое; real — файл настоящей местности (terrain/<real>.js);
// sea — месяцы сезона (в остальные зимой не гоняются)
const MATCH_VENUES=[
  {id:'m_narr',c:'us',k:'match',y0:1896,y1:1900,t:'oval',terr:'dirt',km:8,name:'Ипподром Наррагансетт-парк',where:'Род-Айленд',
    hist:'В сентябре 1896 года на этой беговой дорожке для рысаков прошла первая в Америке гонка автомобилей по кругу — публика смеялась: лошади бегали быстрее.'},
  {id:'m_gpointe',c:'us',k:'match',y0:1901,y1:1908,t:'oval',terr:'dirt',km:16,name:'Ипподром Гросс-Пойнт',where:'Детройт',
    hist:'Беговая дорожка под Детройтом. 10 октября 1901 года здесь Генри Форд в 10-мильной гонке обошёл Александра Уинтона, а через год Барни Олдфилд на «999» Форда выиграл Кубок изготовителей.'},
  {id:'m_ormond',c:'us',k:'record',y0:1903,y1:1929,t:'sprint',terr:'beach',real:'daytona',km:1.609,sea:[0,1,2,3],name:'Пляж Ормонд — Дейтона',where:'Флорида',
    hist:'Плотный песок в отлив — лучшая дорога Америки. В 1903 году здесь сошлись «Буллет» Александра Уинтона и олдсмобиль «Пират», с тех пор каждую зиму на пляже меряются скоростью.'},
  {id:'m_indy',c:'us',k:'both',y0:1909,y1:1929,t:'oval',track:'indy',real:'indy',km:16,lap:4.02,name:'Индианаполис',where:'Индиана',
    hist:'Овал Карла Фишера в две с половиной мили; в конце 1909 года его вымостили 3,2 миллиона кирпичей. Между большими гонками здесь устраивают матчи и заезды на рекорд круга.'},
  {id:'m_sheeps',c:'us',k:'match',y0:1915,y1:1919,t:'oval',track:'board',real:'sheepshead',km:16,name:'Шипсхед-Бей',where:'Нью-Йорк',
    hist:'Дощатый овал на месте бывшего ипподрома в Бруклине: виражи из сосновых досок, скорости — под 170 километров в час.'},
  {id:'m_beverly',c:'us',k:'match',y0:1920,y1:1924,t:'oval',track:'board',real:'beverly',km:16,sea:[0,1,2,3,4,5,6,7,8,9,10,11],name:'Беверли-Хиллз',where:'Калифорния',
    hist:'Дощатый трек в Беверли-Хиллз: на трибунах — звёзды Голливуда, на виражах — лучшие гонщики Америки.'},
  {id:'m_amatol',c:'us',k:'match',y0:1926,y1:1928,t:'oval',track:'board',real:'amatol',km:16,name:'Атлантик-Сити (Аматол)',where:'Нью-Джерси',
    hist:'Самый быстрый дощатый трек Америки: машины Миллера проходят круг быстрее, чем где-либо в мире.'},
  {id:'m_bexhill',c:'uk',k:'record',y0:1902,y1:1906,t:'sprint',terr:'macadam',km:1.609,name:'Набережная Бексхилла',where:'Сассекс',
    hist:'19 мая 1902 года граф Де Ла Варр отдал под скоростные заезды набережную своего курорта — первые автомобильные гонки в Британии: на дорогах гоняться запрещено.'},
  {id:'m_brook',c:'uk',k:'both',y0:1907,y1:1929,t:'oval',track:'brooklands',real:'brooklands',km:16,lap:4.43,name:'Бруклендс',where:'Суррей',
    hist:'Первый в мире автодром с бетонными виражами. Матчи один на один — любимое зрелище Бруклендса: на гонщиков ставят, как на скачках, а сами они выходят в цветных шёлковых рубашках, как жокеи.'},
  {id:'m_acheres',c:'fr',k:'record',y0:1898,y1:1902,t:'sprint',terr:'dirt',km:1,name:'Дорога в парке Ашер',where:'под Парижем',
    hist:'В 1898–1899 годах граф Гастон де Шасслу-Лоба и Камиль Женатци шесть раз отнимали друг у друга рекорд скорости на этой прямой. Последний — 105,88 км/ч — остался за электрической «Жаме Контант».'},
  {id:'m_nice',c:'fr',k:'record',y0:1903,y1:1913,t:'sprint',terr:'macadam',km:1,host:'mc',sea:[0,1,2,3,4,10,11],name:'Английская набережная',where:'Ницца',
    hist:'На «Неделе Ниццы» километр с хода меряют прямо на Английской набережной: в апреле 1902 года паровая машина Серполле прошла его со скоростью 120 км/ч.'},
  {id:'m_road_fr',c:'fr',k:'match',y0:1896,y1:1923,t:'road',real:'chartres',km:30,name:'Шоссе на Шартр',where:'равнина Бос',
    hist:'Матч на дороге: две машины уходят со старта вместе, судьи на мотоциклах едут следом, кто первым въедет в Шартр — тот и прав.'},
  {id:'m_montlhery',c:'fr',k:'both',y0:1924,y1:1929,t:'circuit',real:'montlhery',km:12.5,lap:12.5,name:'Монлери',where:'под Парижем',
    hist:'Автодром Монлери открылся осенью 1924 года: бетонное кольцо с виражами и дорожная трасса. Здесь ставят рекорды и меряются силами один на один.'},
  {id:'m_taunus',c:'de',k:'match',y0:1899,y1:1920,t:'road',real:'saalburg',km:30,name:'Дороги Таунуса',where:'под Франкфуртом',
    hist:'Горные дороги, где в 1904 году разыгрывали Кубок Гордона Беннетта. Два экипажа уходят вместе — кто первым у Заальбурга, тот и выиграл.'},
  {id:'m_avus',c:'de',k:'both',y0:1921,y1:1929,t:'oval',track:'avus',real:'avus',km:20,lap:19.6,name:'АФУС',where:'Берлин',
    hist:'Автострада-полигон в лесу Грюневальд: две прямые по девять километров и два разворота. Лучшее место в Германии, чтобы выяснить, чья машина быстрее.'},
  {id:'m_brescia',c:'it',k:'match',y0:1899,y1:1921,t:'road',real:'montichiari',km:30,name:'Шоссе под Брешией',where:'Ломбардия',
    hist:'В Брешии с начала века устраивают «автомобильные недели»: на прямых дорогах Ломбардии меряются скоростью и спорят на деньги.'},
  {id:'m_monza',c:'it',k:'both',y0:1922,y1:1929,t:'circuit',track:'monza',real:'monza',km:10,lap:10,name:'Монца',where:'под Миланом',
    hist:'Автодром в королевском парке под Миланом: дорожное кольцо и скоростной овал с виражами.'}];
// 0.30: споры о подъёме в гору — рекорд горы (каждый едет один, на время); в каждой стране — своя знаменитая гора
MATCH_VENUES.push(
  {id:'h_gaillon',c:'fr',k:'record',y0:1899,y1:1912,t:'hill',terr:'macadam',km:1,name:'Подъём Гайон',where:'Нормандия',hist:'Прямой километровый подъём у Гайона, над долиной Сены: с 1899 года сюда ездят ставить рекорды скорости в гору — и заводы, и богатые любители.'},
  {id:'h_shelsley',c:'uk',k:'record',y0:1905,y1:1929,t:'hill',real:'shelsley',km:0.914,name:'Шелсли-Уолш',where:'Вустершир',hist:'Короткий крутой подъём в Вустершире — старейшая в мире трасса гонок в гору: с 1905 года здесь каждый год спорят, чья машина сильнее.'},
  {id:'h_kessel',c:'de',k:'record',y0:1905,y1:1929,t:'hill',real:'kesselberg',km:5,name:'Кессельберг',where:'Бавария',hist:'Серпантин над озером Кохельзе в Баварских Альпах: с 1905 года — гонки в гору и споры о рекорде.'},
  {id:'h_susa',c:'it',k:'record',y0:1902,y1:1929,t:'hill',terr:'mount',km:22,name:'Суза — Мон-Сени',where:'Пьемонт',hist:'Подъём от Сузы к перевалу Мон-Сени — одна из первых горных гонок Италии, с 1902 года.'},
  {id:'h_washington',c:'us',k:'record',y0:1904,y1:1929,t:'hill',terr:'mount',km:12,name:'Гора Вашингтон',where:'Нью-Гэмпшир',hist:'«Восхождение к облакам»: гонка по горной дороге на вершину горы Вашингтон, впервые — в июле 1904 года.'});
// настоящая местность для матчей — те же файлы, что у гонок календаря
MATCH_VENUES.forEach(v=>{if(v.real&&typeof REAL_RACES!=='undefined')REAL_RACES[v.id]={d:v.real};});
// мировой рекорд скорости (км/ч) — с какого времени [год+месяц/12, км/ч, кто]
const LSR=[[1898.96,63.15,'граф Шасслу-Лоба (Jeantaud)'],[1899.32,105.88,'Камиль Женатци («Жаме Контант»)'],[1902.29,120.8,'Леон Серполле'],[1902.6,122.4,'Уильям Вандербильт (Mors)'],
  [1903.9,136.4,'Артур Дюре (Gobron-Brillié)'],[1904.0,147.1,'Генри Форд («999», лёд озера Сент-Клэр)'],[1904.5,166.7,'Поль Барас (Darracq)'],[1905.95,175.4,'Виктор Эмери (Darracq)'],
  [1906.05,205.5,'Фред Марриотт (паровой Stanley)'],[1910.2,211.3,'Барни Олдфилд («Блитцен-Бенц»)'],[1922.37,215.2,'Кеннелм Ли Гиннесс (Sunbeam)'],[1924.5,234.98,'Рене Тома (Delage)'],
  [1924.7,242.8,'Малколм Кэмпбелл (Sunbeam)'],[1926.2,245.1,'Генри Сигрейв (Sunbeam)'],[1926.3,272.5,'Джон Пэрри-Томас («Бэбз»)'],[1927.2,327.9,'Генри Сигрейв (Sunbeam 1000 hp)'],
  [1928.15,334.0,'Рэй Кич (White Triplex)'],[1929.2,372.5,'Генри Сигрейв («Золотая стрела»)']];
function lsrAt(y,m){const t=y+m/12;let r=null;LSR.forEach(x=>{if(x[0]<=t)r=x;});return r;}
const MATCH_ST={match:'Матч-гонка',record:'Спор о скорости'};
// своя марка под другим именем (Ford (Манчестер) у Форда) — не соперник
function ownComp(cp,s){return cp.pk===s.pioneer||Object.values(COMPS).some(L=>L.some(b=>b.pk===s.pioneer&&cp.n!==b.n&&cp.n.startsWith(b.n+' (')));}
// детерминированный «жребий»: доска вызовов перерисовывается — предложения в течение месяца не должны прыгать
function chalRnd(s,salt){return mulberry32(hashStr('ch|'+mi(s)+'|'+s.company+'|'+(salt||'')));}
function raceByKey(key){return RACES.find(r=>r.key===key)||(typeof G!=='undefined'&&G&&G.chal&&G.chal.rc&&G.chal.rc.key===key?G.chal.rc:null);}
function chalWhere(C){return C&&['race','match','record'].includes(C.type)?'race':'market';}
// месяц матча: через 2–4 месяца, в сезон площадки, без войны в стране площадки
function matchWhen(s,v,r){const sea=v.sea||[3,4,5,6,7,8,9];for(let k=2;k<=5;k++){const T=mi(s)+k,y=1895+Math.floor(T/12),m=T%12;if(y>v.y1||y<v.y0)continue;
  if(sea.includes(m)&&!isWar(y,m,v.c)&&!isWar(s.y,s.m,v.c)&&r()<0.85)return {T,y,m};}return null;}
// соперник: заводская команда страны площадки (или гостья), в этот год гоняется; ваш основатель — не соперник
function matchTeams(s,c,y){const ok=t=>t.from<=y&&t.to>=y&&!(t.gap&&y>=t.gap[0]&&y<=t.gap[1])&&t.pk!==s.pioneer&&!playerMarque(t.n,s);
  const L=RACE_TEAMS.filter(t=>ok(t)&&t.c===c).sort((a,b)=>b.str-a.str);if(L.length)return L;
  // своих гоночных марок в стране ещё нет (Америка 1896) — местная марка с конструктором-любителем
  return (COMPS[c]||[]).filter(cp=>!ownComp(cp,s)&&cp.since<=y&&(!cp.until||cp.until>=y)&&compVol(cp,s)>0).sort((a,b)=>compVol(b,s)-compVol(a,s)).slice(0,2).map(cp=>({n:compName(cp,s),c,str:0.85,mq:[cp.n]}));}
// пилот соперника: лучший гонщик марки в этот год (гонщики-основатели, что ездили лишь в своих гонках, — нет)
function matchDriver(s,t,y,used){used=used||new Set([...(s.drivers||[]),PIONEERS[s.pioneer].drv].filter(Boolean));DRIVERS.forEach(d=>{if(aiOut(s,d.id))used.add(d.id);});
  const ok=d=>drvAllowed(d,null)&&!used.has(d.id),L=teamDrivers(t,y,used).filter(ok).sort((a,b)=>b.sk-a.sk);
  return L[0]||DRIVERS.filter(x=>x.from<=y&&x.to>=y&&ok(x)&&NAT_C[x.nat]===t.c).sort((a,b)=>b.sk-a.sk)[0]||null;}
function racePrizeOf(t,c,y){return racePrizeBase({t,c,y,major:0});}
// предложение: матч-гонка (kind='match') или спор о скорости (kind='record')
function offerMatch(s,kind){const r=chalRnd(s,kind);if(!raceCarsFor(s).some(m=>!isTruck(m)))return null;
  const V=MATCH_VENUES.filter(v=>(v.k===kind||v.k==='both')&&s.y>=v.y0-1&&s.y<=v.y1&&(v.c===s.country||dealerCount(s,v.c)>0)&&!warCut(s,v.c));
  if(!V.length)return null;const VH=V.filter(x=>x.c===s.country),VF=V.filter(x=>x.c!==s.country),v=VH.length&&(r()<0.55||!VF.length)?VH[Math.floor(r()*VH.length)]:VF.length?VF[Math.floor(r()*VF.length)]:V[0],w=matchWhen(s,v,r);if(!w)return null;
  const T=matchTeams(s,v.c,w.y);if(!T.length)return null;const t=T[Math.floor(r()*Math.min(3,T.length))],d=matchDriver(s,t,w.y);
  const rec=kind==='record',sprint=v.t==='sprint',hill=v.t==='hill',key=(rec?'rec-':'match-')+v.id+'-'+w.T;
  const stake=Math.max(100,Math.round(racePrizeOf(v.t==='sprint'?'oval':v.t,v.c,w.y)*(rec?0.5:0.7)/50)*50);
  const name=rec?(sprint?`${v.km<1.5?'Километр':'Миля'} с хода: ${v.name}`:hill?`Рекорд горы: ${v.name}`:`Рекорд круга: ${v.name}`):`Матч-гонка: ${v.name}`;
  const rc={id:v.id,key,y:w.y,m:w.m,c:v.c,host:v.host||v.c,t:v.t,track:v.track,terr:v.terr,km:rec&&!sprint&&!hill?(v.lap||v.km):v.km,laps:rec&&!sprint?1:0,name,hist:v.hist,img:'',match:1,kind,
    purse:Math.round(stake*0.25/10)*10,dnfK:rec?0.3:0.45,venue:v.name,where:v.where,
    scn:rec?{st:'solo',gap:sprint?10:14,h0:sprint?9:11,span:0.4,gt:sprint?'каждый едет один, на время: разгон и мерный участок':'каждый едет один, на время',b:sprint?'Мерный участок размечен флажками, у его концов — хронометристы с секундомерами. Соперник уходит первым.':'Хронометристы засекают круг от линии до линии. Соперник уходит первым.'}:{st:'grid',h0:15,span:0.6,b:v.t==='road'?'Две машины рядом на шоссе, судья с флагом. Зрители стоят вдоль обочин до самого финиша.':'Две машины рядом на старте, судья с флагом, полные трибуны.'},
    rv:{n:t.n,c:t.c,str:t.str||0.95,mq:t.mq||[t.n],drv:d?d.id:'',dn:d?d.n:''}};
  const C={type:kind,rk:key,rc,mq:t.n,x:stakeExtra(s,t.n,'b'+kind)};
  return {id:kind,kind,title:`${MATCH_ST[kind]} с ${t.n}: ${v.name}`,sub:`${MONTHS[w.m]} ${w.y} · ${rec?(sprint?'каждый едет один, на время':hill?'лучшее время подъёма':'лучшее время круга'):'одна машина против одной'}${d?' · у соперника — '+d.n:''}`,stake,C};}
/* ---------- продажи класса: дома и на экспортном рынке, за квартал, полгода или до конца года ---------- */
const HC_STEPS=[1/4,1/3,1/2,1,2,3,4,5,8,10];
function hcText(hc){return hc===1?'':hc>1?`фора: нужно продать больше, чем у соперника ×${hc}`:`фора вам: хватит больше ${hc===0.5?'половины':hc===1/3?'трети':'четверти'} продаж соперника`;}
function offerSales(s,foreign){const L=s.last;if(!L||!L.mk)return null;const r=chalRnd(s,foreign?'exp':'sales');
  const mkts=foreign?Object.keys(L.mk).filter(c=>c!==s.country&&COUNTRIES[c]&&(L.mk[c].sold||0)>=5&&dealerCount(s,c)>0&&!warCut(s,c)):[s.country];
  const cand=[];mkts.forEach(c=>{const mk=L.mk[c];if(!mk||!mk.segs)return;SEGK.forEach(g=>{const you=(mk.segs[g]&&mk.segs[g].you)||0;if(you<3)return;
    (COMPS[c]||[]).forEach((cp,i)=>{if(ownComp(cp,s)||holdOf(s,c,i)||!compAlive(cp,s))return;const v=compVol(cp,s)*((cp.mix&&cp.mix[g])||0);if(v<=0)return;
      // сколько соперник продал в этом классе за прошлый месяц (13-turn.js); нет данных — по годовому объёму марки
      const lg=((s.comps[c]||[])[i]||{}).lg,v1=lg&&lg[g]>0?lg[g]:v/12;if(v1<0.5)return;
      const ratio=you/v1;cand.push({c,g,cp,i,you,v:v1,ratio,d:Math.abs(Math.log(ratio))});});});});
  if(!cand.length)return null;
  // ровня — лучше всего; если ровни нет — тот, кто ближе, с форой
  cand.sort((a,b)=>a.d-b.d||b.you-a.you);const pool=cand.filter(x=>x.d<=cand[0].d+0.35).slice(0,4),R=pool[Math.floor(r()*pool.length)];
  let hc=1;if(R.ratio>1.6||R.ratio<0.6)hc=HC_STEPS.reduce((a,h)=>Math.abs(Math.log(R.ratio/h))<Math.abs(Math.log(R.ratio/a))?h:a,1);
  const nm=compName(R.cp,s),home=R.c===s.country,left=12-s.m;
  const per=left>=5&&r()<0.4?'year':r()<0.55?3:6,months=per==='year'?left:per,end=mi(s)+months;
  const stake=Math.round(clamp((L.rev||0)*(home?0.15:0.1),200*cpi(s),25000*cpi(s))/50)*50;
  const C={type:'sales',mon:1,c:R.c,g:R.g,ci:R.i,mq:nm,y:s.y,per,end,hc,x:stakeExtra(s,nm,'b'+(foreign?'e':'s'),1)};
  const perT=per==='year'?`до конца ${s.y} года`:`за ${months} ${plural(months,'месяц','месяца','месяцев')}`;
  return {id:foreign?'export':'sales',kind:foreign?'export':'sales',title:`${foreign?'Экспорт':'Продажи'}: класс «${SEG[R.g].name}»${home?'':' — '+COUNTRIES[R.c].name} против ${nm}`,
    sub:`кто продаст больше ${perT}${hc!==1?' · '+hcText(hc):''}`,stake,C,you:R.you};}
function chalPerText(C){if(!C.mon)return `до конца ${C.y} года`;const n=C.end-mi(G);return C.per==='year'?`до конца ${C.y} года`:`ещё ${Math.max(0,n)} ${plural(Math.max(0,n),'месяц','месяца','месяцев')}`;}
// счёт продаж за месяц (13-turn.js): соперник — по своей доле в классе, вы — по проданным машинам
function chalTally(s,c,g,o){const C=s.chal;if(!C||!C.acc||!C.mon||C.c!==c||C.g!==g||o.i!==C.ci)return;const t=mi(s);if(t<(C.start??t)||t>=C.end)return;C.them=(C.them||0)+o.sales;}
function chalTallyYou(s,r){const C=s.chal;if(!C||!C.acc||!C.mon)return;const t=mi(s);if(t<(C.start??t)||t>=C.end)return;const m=r.mk[C.c];C.you=(C.you||0)+((m&&m.segs&&m.segs[C.g]&&m.segs[C.g].you)||0);C.n=(C.n||0)+1;}
/* ---------- пробег на надёжность ---------- */
// маршрут по стране и эпохе: [с какого года, путь, км, история]
const TRIAL_ROUTES={
  us:[[1896,'Нью-Йорк — Олбани — Нью-Йорк',540,''],[1903,'Нью-Йорк — Питтсбург',1300,''],[1909,'Нью-Йорк — Сиэтл',6600,'В июне 1909 года этим путём прошёл «Океанский пробег»: «Модель T» Форда пришла в Сиэтл первой за 22 дня — правда, позже судьи сняли её за замену мотора в пути.'],
    [1914,'Нью-Йорк — Сан-Франциско по дороге Линкольна',5400,'Дорогу Линкольна — первую через всю Америку — размечали красно-бело-синими полосами на столбах и заборах.']],
  uk:[[1897,'Лондон — Эдинбург — Лондон',1600,'Тот же путь весной 1900 года прошло «Испытание тысячи миль»: десятки машин колонной — и Британия поверила в автомобиль.'],[1906,'Глазго — Горная Шотландия — Глазго',1000,''],[1920,'Лондон — Лендс-Энд — Лондон',1100,'']],
  fr:[[1895,'Париж — Лион — Париж',930,''],[1902,'Париж — Ницца — Париж',1900,''],[1910,'Тур Франции',4500,'']],
  de:[[1896,'Берлин — Лейпциг — Берлин',380,''],[1905,'Франкфурт — Мюнхен — Вена',1500,'По этим дорогам шёл Приз Геркомера — испытание туристических машин, которое придумал художник Хуберт фон Геркомер.'],[1920,'Берлин — Мюнхен — Берлин',1300,'']],
  it:[[1897,'Турин — Милан — Турин',280,''],[1905,'Милан — Рим — Милан',1300,''],[1920,'Турин — Неаполь — Турин',2000,'']]};
function trialRoute(c,y){const L=TRIAL_ROUTES[c]||TRIAL_ROUTES.fr;let r=L[0];L.forEach(x=>{if(x[0]<=y)r=x;});return r;}
// ваша машина на пробег: самая надёжная серийная (грузовик — только против грузовика)
function trialCars(s,g){return s.models.filter(m=>(m.status==='prod'||m.status==='sale')&&(g==='truck'?isTruck(m):!isTruck(m)&&segOf(m)===g));}
function trialPick(s,g){return trialCars(s,g).map(m=>({m,r:carBase(m,0,s.y).rel})).sort((a,b)=>b.r-a.r)[0];}
function trialRival(s,C){const cp=(COMPS[s.country]||[])[C.ci],mdl=cp?compModel(cp,s):null,rv=rivalCar(RIVAL_CAR[C.g]?C.g:'people',s.y);
  return {md:{...rv[2],t:TRIM_OF[C.g]||'t1',paint:'#333',name:mdl?mdl[1]:rv[1],made:0,ai:1},name:mdl?String(mdl[1]).replace(/\s*«.*?»/g,''):rv[1]};}
function offerTrial(s){const r=chalRnd(s,'trial');if(isWar(s.y,s.m,s.country)||isWar(s.y,Math.min(11,s.m+2),s.country))return null;
  const L=s.last,mk=L&&L.mk&&L.mk[s.country];if(!mk||!mk.segs)return null;
  const gs=SEGK.filter(g=>g!=='sport'&&trialCars(s,g).length&&((mk.segs[g]&&mk.segs[g].you)||0)>=1);if(!gs.length)return null;const g=gs[Math.floor(r()*gs.length)];
  const cps=(COMPS[s.country]||[]).map((cp,i)=>({cp,i,v:compVol(cp,s)*((cp.mix&&cp.mix[g])||0)})).filter(x=>!ownComp(x.cp,s)&&!acqHas(s,s.country,x.i)&&x.v>0&&compAlive(x.cp,s)).sort((a,b)=>b.v-a.v).slice(0,4);if(!cps.length)return null;
  const R=cps[Math.floor(r()*cps.length)],nm=compName(R.cp,s),rt=trialRoute(s.country,s.y),P=trialPick(s,g);if(!P)return null;
  const stake=Math.round(clamp((L.rev||0)*0.1,150*cpi(s),15000*cpi(s))/50)*50,end=mi(s)+(rt[2]>3000?2:1);
  const C={type:'trial',g,ci:R.i,mq:nm,route:rt[1],km:rt[2],rh:rt[3],md:P.m.id,end,x:stakeExtra(s,nm,'bt',1)};
  return {id:'trial',kind:'trial',title:`Пробег на надёжность с ${nm}: ${rt[1]}`,sub:`${fmtN(rt[2])} км · по одной серийной машине класса «${SEG[g].name}» · судьи считают поломки`,stake,C};}
/* ---------- пари на гонку календаря (как было) ---------- */
function offerRace(s){const L=RACES.filter(rc=>rc.y===s.y&&rc.m>s.m&&rc.m<=s.m+4&&!GBC_IDS.includes(rc.id)&&raceEligible(rc,s)&&!raceWarBlocked(rc,s)&&!s.cres[rc.key]&&s.raceDone[rc.key]===undefined);
  const rc=L.slice().sort((a,b)=>(b.major?1:0)-(a.major?1:0)||a.m-b.m)[0];if(!rc||!raceCarsFor(s).length)return null;
  const T=fieldTeams(rc,s,3).filter(t=>t.mq&&t.mq.length),t=T.find(t=>t.c===s.country&&t.str>=0.95)||T.find(t=>t.c===s.country)||T[0];if(!t)return null;
  return {id:'race',kind:'race',title:`Пари с ${t.n}: «${rc.name}»`,sub:`${MONTHS[rc.m]} ${rc.y} · ваша лучшая машина должна финишировать выше лучшей ${t.n}`,stake:Math.max(100,Math.round(racePrize(rc)*0.6/50)*50),C:{type:'race',rk:rc.key,mq:t.n,x:stakeExtra(s,t.n,'b')}};}
// все вызовы, что можно взять (доска) или получить из газет
function chalOffers(s){const out=[];if(!s||s.over||s.chal)return out;
  [()=>offerRace(s),()=>offerMatch(s,'match'),()=>offerMatch(s,'record'),()=>offerSales(s,false),()=>offerSales(s,true),()=>offerTrial(s),()=>offerEleg(s),()=>offerExped(s)].forEach(f=>{try{const o=f();if(o)out.push(o);}catch(e){console.warn('offer',e);}});
  return out;}
/* ---------- вызов из газеты: соперник сам предлагает пари ---------- */
const CHAL_W={race:1,match:1.3,record:0.9,sales:1.1,export:0.8,trial:0.9,eleg:0.8,exped:0.6};
function chalCheck(s){
  if(s.pending.length||s.chal||mi(s)-(s.chalLast??-99)<4||Math.random()>0.25)return;
  const O=chalOffers(s);if(!O.length)return;const last=s.chalKind||'';
  const o=wpick(O,x=>(CHAL_W[x.kind]||1)*(x.kind===last?0.2:1));chalNews(s,o);}
function salesChalCheck(){}   // 0.24: по продажам вызывают в общем порядке (chalCheck)
function chalNews(s,o){const C=s.chal=Object.assign({},o.C,{stake:o.stake,acc:0});s.chalLast=mi(s);s.chalKind=o.kind;
  const H=rivalHero(C.mq,s),h=rivalHead(C.mq,s.y)||(C.ci!=null?rivalHead(((COMPS[C.c||s.country]||[])[C.ci]||{}).n,s.y):null);C.h=h;
  const who=h?`${h.n}, ${h.role} ${C.mq},`:`Глава марки ${C.mq}`,img=h&&h.wiki&&IMG[h.wiki]?h.wiki:'',cap=h?`${h.n} — ${h.role} ${C.mq}`:'',sc=rivalryScore(s,C.mq),xs=C.x?` А сверху — ${STAKE_X[C.x.k]}.`:'';
  const T=chalNewsText(s,C,who,xs);
  pushEvent({kicker:'Вызов',title:`${h?h.n+' ('+C.mq+')':C.mq} ${T.verb} «${s.company}»`,deck:T.deck+(sc?` · счёт ${sc}`:''),img,imgCap:cap,text:T.text,choices:[['Принять вызов','chalYes'],['Отказаться','chalNo']]},true);}
function chalNewsText(s,C,who,xs){const st=stakeText(C);
  if(C.type==='race'){const rc=RACES.find(r=>r.key===C.rk);
    return {verb:'бросает вызов',deck:`Пари на ${st}: чья машина будет выше в гонке «${rc.name}»`,
      text:`${who} заявил газетам: «Машины "${s.company}" хороши только на афишах. Пусть приедут на "${rc.name}" в ${MONTHS_P[rc.m]} — посмотрим, кто кого!» Он предлагает пари на ${money(C.stake)}: чья лучшая машина финиширует выше, тот и забирает деньги.${xs}\nПринять вызов — значит заявить команду на эту гонку и обогнать лучшую машину ${C.mq}. Победа в пари — слава в газетах и радость гонщиков; проигрыш или неявка — удар по репутации. Отказ газеты тоже заметят.`};}
  if(C.type==='match'||C.type==='record'){const rc=C.rc,rec=C.type==='record',sprint=rc.t==='sprint',dn=rc.rv&&rc.rv.dn;
    return {verb:rec?'спорит о скорости с':'вызывает на матч',deck:`${rc.venue}, ${MONTHS_N[rc.m]} ${rc.y} · ${rec?(sprint?'мерный участок, каждый один':rc.t==='hill'?'рекорд горы':'рекорд круга'):'один на один'} · ставка ${st}`,
      text:`${who} заявил газетам: ${rec?`«Говорят, машины "${s.company}" быстры. Проверим: ${rc.venue}, каждый едет один, на время. Чья скорость выше — тот и прав».`:`«Хватит прятаться в общей толпе. Одна моя машина против одной вашей — ${rc.venue}, ${fmtN(rc.km)} км. Кто первым на финише — тот и прав».`}${dn?` За руль у них сядет ${dn}.`:''} Ставка — ${money(C.stake)}${rc.purse?`, победителю — ещё и сбор с трибун (${money(rc.purse)})`:''}.${xs}\n${rc.hist}\nПринять вызов — выставить одну машину и пилота (можно сесть за руль самому) в ${MONTHS_P[rc.m]}${rc.y!==s.y?' '+rc.y+' года':''}: вкладка «Гонки». Не приедете — пари проиграно.`};}
  if(C.type==='sales'){const home=C.c===s.country,mk=s.last&&s.last.mk&&s.last.mk[C.c],you=(mk&&mk.segs&&mk.segs[C.g]&&mk.segs[C.g].you)||0,per=C.per==='year'?`до Рождества`:`за ${C.per} ${plural(C.per,'месяц','месяца','месяцев')}`;
    return {verb:'бросает вызов',deck:`Кто продаст больше машин класса «${SEG[C.g].name}»${home?'':' — '+COUNTRIES[C.c].name} ${C.per==='year'?'до конца '+C.y+' года':per} · ставка ${st}`,
      text:`${who} заявил газетам: «${per.charAt(0).toUpperCase()+per.slice(1)} наши машины класса "${SEG[C.g].name}" разойдутся ${home?'':'в стране «'+COUNTRIES[C.c].name+'» '}лучше, чем у "${s.company}". Ставлю ${money(C.stake)}!»${C.hc!==1?` ${C.hc>1?`Он знает, что вы продаёте больше, и даёт фору: вы выиграете, только если продадите больше, чем у него ×${C.hc}.`:`Его марка сильнее, и он даёт вам фору: хватит продать больше ${C.hc===0.5?'половины':C.hc===1/3?'трети':'четверти'} того, что продаст он.`}`:''}${xs}\nВ прошлом месяце ваших машин этого класса ${home?'':'там '}купили ${fmtN(you)}. Выиграете — деньги, слава и газетные заголовки; проиграете — заплатите и потеряете немного репутации.`};}
  if(C.type==='trial'){const md=s.models.find(m=>m.id===C.md),rv=trialRival(s,C);
    return {verb:'бросает вызов',deck:`Пробег ${C.route}: ${fmtN(C.km)} км · ставка ${st}`,
      text:`${who} заявил газетам: «Наши машины прочнее. Пусть "${s.company}" выставит свою серийную машину — пройдём ${C.route}, и судьи сосчитают поломки». От «${s.company}» поедет «${md?md.name:'—'}», от ${C.mq} — ${rv.name}. Кто меньше ломался, тот и выиграл, при равенстве — кто быстрее.${xs}\n${C.rh?C.rh+'\n':''}Старт — в ${MONTHS_P[s.m]}, итоги — через ${C.end-mi(s)===1?'месяц':'два месяца'}. Машину для пробега можно сменить на вкладке «Рынок».`};}
  if(C.type==='eleg'||C.type==='exped')return chalNewsText30(s,C,who,xs,st);
  return {verb:'бросает вызов',deck:'',text:''};}
// принять вызов (drvResolve → chalYes): у новых видов — свой учёт
function chalAccept(s,C){
  if(C.type==='sales'&&C.mon){C.start=mi(s);C.end=Math.max(C.end,mi(s)+1);C.you=0;C.them=0;C.n=0;
    addLog(`Вызов принят: кто продаст больше машин класса «${SEG[C.g].name}»${C.c===s.country?'':' ('+COUNTRIES[C.c].name+')'} ${chalPerText(C)} — «${s.company}» или ${C.mq}${C.hc!==1?` (${hcText(C.hc)})`:''}. Пари ${money(C.stake)}.`,'good');return true;}
  if(C.type==='match'||C.type==='record'){const rc=C.rc;addLog(`Вызов принят: ${MATCH_ST[C.type].toLowerCase()} с ${C.mq} — ${rc.venue}, ${MONTHS[rc.m]} ${rc.y}. Пари ${money(C.stake)}. Выставьте машину на вкладке «Гонки».`,'good');return true;}
  if(C.type==='eleg'||C.type==='exped')return chalAccept30(s,C);
  if(C.type==='trial'){const md=s.models.find(m=>m.id===C.md);addLog(`Вызов принят: пробег ${C.route} (${fmtN(C.km)} км) — «${md?md.name:''}» против ${C.mq}. Пари ${money(C.stake)}.`,'good');return true;}
  return false;}
/* ---------- месячный учёт: открытие матча, неявка, итоги продаж и пробега ---------- */
function chalMonth(s){const C=s.chal;if(!C||!C.acc)return;const t=mi(s);
  if(C.type==='sales'&&C.mon){if(t>=C.end)chalSalesMon(s);return;}
  if(C.type==='trial'){if(t>=C.end)trialResolve(s);return;}
  if(C.type==='eleg'){if(t>=C.end)elegResolve(s);return;}if(C.type==='exped'){if(t>=C.end)expedResolve(s);return;}
  if(C.type==='match'||C.type==='record'){const rc=C.rc,T=(rc.y-1895)*12+rc.m;
    if(t>T){matchForfeit(s);return;}
    if(t>=T-1&&C.said!==t){C.said=t;addLog(`⚔️ ${MATCH_ST[C.type]} с ${C.mq}: ${rc.venue}, ${MONTHS[rc.m]} — выставьте машину на вкладке «Гонки».`,'good');pendingToasts.push(`⚔️ ${MATCH_ST[C.type]}: вкладка «Гонки»`);}}}
function chalSalesMon(s){const C=s.chal;s.chal=null;const hc=C.hc||1,you=Math.round(C.you||0),them=Math.round(C.them||0),win=you>them*hc,where=C.c===s.country?'':` (${COUNTRIES[C.c].name})`;
  if(win){s.cash+=C.stake;s.rep=clamp(s.rep+(C.per==='year'?3:2),0,100);addLog(`⚔️ Пари по продажам выиграно${where}: ${carsN(you)} против ${fmtN(them)}${hc!==1?' ×'+hc.toFixed(hc<1?2:0).replace('.',',')+' = '+fmtN(Math.round(them*hc)):''} у ${C.mq}. +${money(C.stake)}.`,'good');}
  else{s.cash-=C.stake;s.rep=clamp(s.rep-(C.per==='year'?2:1),0,100);addLog(`Пари по продажам проиграно${where}: ${carsN(you)} против ${fmtN(them)}${hc!==1?' (с форой — '+fmtN(Math.round(them*hc))+')':''} у ${C.mq}. −${money(C.stake)}.`,'bad');}
  try{duelOutcome(s,C,win,{you,them});}catch(e){console.warn('duel',e);}
  return {C,win,you,them};}
/* ---------- пробег: по этапам, поломки и время ---------- */
const TRIAL_BREAK=['рессора','колесо','шина','радиатор','зажигание','цепь','подшипник','карбюратор','тормоза','рулевая тяга'];
function trialSim(s,C,md,rmd,rnd){rnd=rnd||Math.random;const y=s.y,n=clamp(Math.round(C.km/450),3,8),stK=C.km/n,me=carStats(md,0,y),th=carStats(rmd,0,y);
  // надёжность серийной машины: у вас — ещё и отдел испытаний (гоночный отдел), у соперника — машина класса своего года
  const relMe=clamp(me.rel*(1+0.25*((RDEPT[s.rdept||0].rel||1)-1)),0.3,0.995),relTh=th.rel,lam=0.0043*(y<1905?1.4:y<1915?1.1:0.9);
  const rows=[];let pM=0,pT=0;
  for(let i=0;i<n;i++){const bm=rnd()<1-Math.exp(-(1-relMe)*lam*stK),bt=rnd()<1-Math.exp(-(1-relTh)*lam*stK);if(bm)pM++;if(bt)pT++;
    rows.push([i+1,bm?TRIAL_BREAK[Math.floor(rnd()*TRIAL_BREAK.length)]:'',bt?TRIAL_BREAK[Math.floor(rnd()*TRIAL_BREAK.length)]:'']);}
  // средняя скорость на дорогах эпохи: около 40% наибольшей, поломка — минус час с лишним
  const road=y<1905?0.36:y<1915?0.42:0.48,hM=C.km/(me.vmax*3.6*road)+pM*1.3,hT=C.km/(th.vmax*3.6*road)+pT*1.3;
  return {rows,pM,pT,kmhM:Math.round(C.km/hM),kmhT:Math.round(C.km/hT),win:pM<pT||(pM===pT&&hM<hT)};}
function trialResolve(s){const C=s.chal;s.chal=null;let md=s.models.find(m=>m.id===C.md&&(m.status==='prod'||m.status==='sale'));if(!md){const P=trialPick(s,C.g);md=P&&P.m;}
  if(!md){s.cash-=C.stake;s.rep=clamp(s.rep-2,0,100);addLog(`Пробег ${C.route}: «${s.company}» не выставила машину — пари проиграно (−${money(C.stake)}).`,'bad');try{duelOutcome(s,C,false,{forfeit:1});}catch(e){}return;}
  const rv=trialRival(s,C),R=trialSim(s,C,md,rv.md);
  if(R.win){s.cash+=C.stake;s.rep=clamp(s.rep+2.5,0,100);md.raceBoost=Math.max(md.raceBoost||0,mi(s)+3);addLog(`⚔️ Пробег ${C.route} выигран: «${md.name}» — поломок ${R.pM}, у ${C.mq} — ${R.pT}. +${money(C.stake)}.`,'good');}
  else{s.cash-=C.stake;s.rep=clamp(s.rep-1.5,0,100);addLog(`Пробег ${C.route} проигран: «${md.name}» — поломок ${R.pM}, у ${C.mq} — ${R.pT}. −${money(C.stake)}.`,'bad');}
  try{duelOutcome(s,C,R.win,{carId:md.id,trial:{rows:R.rows,pM:R.pM,pT:R.pT,kmhM:R.kmhM,kmhT:R.kmhT,md:md.name,rv:rv.name,route:C.route,km:C.km}});}catch(e){console.warn('duel',e);}
  return R;}
/* ---------- матч-гонка и спор о скорости: соперник на трассе, итоги ---------- */
function matchField(rc,s,taken){const v=rc.rv||{},y=rc.y,t=RACE_TEAMS.find(x=>x.n===v.n&&x.from<=y&&x.to>=y)||{n:v.n,c:v.c,str:v.str||0.9,mq:v.mq||[v.n]};
  const used=new Set([...(s.drivers||[]),...(taken||[]),PIONEERS[s.pioneer].drv].filter(Boolean));DRIVERS.forEach(d=>{if(aiOut(s,d.id))used.add(d.id);});
  let d=v.drv&&!used.has(v.drv)?DRIVERS.find(x=>x.id===v.drv):null;if(!d)d=matchDriver(s,t,y,used);
  const md=aiCarMd(y,t.n),boost=teamBoost(t,rc)*DIF().race;
  return [{you:false,name:t.n,label:t.n,drvName:d?d.n:(v.dn||''),drvId:d?d.id:null,sk:d?d.sk:0.75,md,prep:aiPrep(rc),tyre:rc.t==='sprint'?'soft':Math.random()<0.5?'soft':'hard',gear:rc.t==='sprint'||rc.t==='oval'?1:0,
    color:y>=1903&&COUNTRIES[t.c]?COUNTRIES[t.c].race:'#3a2a1c',pw:Math.pow(t.str||0.9,1.6)*boost,relK:Math.pow(t.str||0.9,0.6),tc:t.c}];}
// машина соперника для карточки: мощность и скорость с поправкой на силу команды
function matchRivalStats(rc){const v=rc.rv||{},st=carStats(aiCarMd(rc.y,v.n),aiPrep(rc),rc.y),pw=Math.pow(v.str||0.9,1.6)*DIF().race;return {hp:Math.round(st.hp*pw),kmh:Math.round(st.vmax*3.6*Math.cbrt(pw))};}
function matchForfeit(s){const C=s.chal;s.chal=null;s.cash-=C.stake;s.rep=clamp(s.rep-3,0,100);
  addLog(`Вы приняли вызов ${C.mq}, но не приехали: ${C.rc.name}. Пари проиграно (−${money(C.stake)}), газеты смеются.`,'bad');try{duelOutcome(s,C,false,{forfeit:1});}catch(e){console.warn('duel',e);}}
function matchResults(rc,res,mode,info){const s=G;if(!s)return;info=info||{};const k=rc.km*1000/Math.max(1,info.len||rc.km*1000);
  const C=s.chal&&s.chal.acc&&s.chal.rk===rc.key?s.chal:null,me=res.find(r=>r.you),th=res.find(r=>!r.you);
  const win=!!me&&!me.dnf&&(!th||th.dnf||me.pos<th.pos),rk=bn('raceRep');let won=0;
  if(win){won=rc.purse||0;s.cash+=won;if(me.md){const md=s.models.find(m=>m.id===me.md.id);if(md)md.raceBoost=Math.max(md.raceBoost||0,mi(s)+3);}}
  s.raceMi=mi(s);if(me&&me.drvId&&me.drvId!=='me')moodAdd(s,me.drvId,win?12:me.dnf?-6:-3,win?`Выиграл ${rc.kind==='record'?'спор о скорости':'матч'} у ${rc.rv.n}`:`Проиграл ${rc.kind==='record'?'спор о скорости':'матч'} ${rc.rv.n}`);
  let inj=[];try{inj=injApply(s,rc,res);}catch(e){console.warn(e);}
  // скорость: на мерном участке и на круге — средняя за заезд
  const kmh=r=>r&&!r.dnf&&r.fin>0?Math.round(rc.km/(r.fin*k/3600)):0,vMe=kmh(me),vTh=kmh(th);
  let lsr=null;if(rc.kind==='record'&&rc.t==='sprint'&&vMe>0){const L=lsrAt(rc.y,rc.m);if(L&&vMe>L[1]){lsr={old:L,v:vMe};s.lsr=Math.max(s.lsr||0,vMe);
    trophyAdd(s,{kind:'record',title:`Быстрее мирового рекорда: ${vMe} км/ч`,sub:`${rc.venue} · «${me.label}»`,story:`На мерном участке «${me.label}» прошла со скоростью ${vMe} км/ч — быстрее официального рекорда (${L[1]} км/ч, ${L[2]}). Заезд с места, без судей Автомобильного клуба — газеты называют его «неофициальным рекордом».`,key:'lsr|'+rc.key,carId:me.md?me.md.id:null,prep:me.prep||1,num:me.num||0});
    s.rep=clamp(s.rep+3*rk,0,100);}}
  let chal=null;
  if(C){s.chal=null;
    if(win){s.cash+=C.stake;s.rep=clamp(s.rep+2*rk,0,100);(s.drivers||[]).forEach(id=>moodAdd(s,id,5,`Выиграли пари у ${C.mq}`));addLog(`⚔️ ${MATCH_ST[rc.kind]} с ${C.mq} выиграна: +${money(C.stake)}${won?` и сбор с трибун ${money(won)}`:''}.`,'good');pendingToasts.push(`⚔️ ${MATCH_ST[rc.kind]} выиграна: +${money(C.stake)}`);}
    else{s.cash-=C.stake;s.rep=clamp(s.rep-1.5,0,100);addLog(`${MATCH_ST[rc.kind]} с ${C.mq} проиграна: −${money(C.stake)}.`,'bad');pendingToasts.push(`${MATCH_ST[rc.kind]} проиграна: −${money(C.stake)}`);}
    try{duelOutcome(s,C,win,{me:me?me.pos:9,them:th?th.pos:9,carId:me&&me.md?me.md.id:null,prep:me?me.prep||1:1,num:me?me.num||0:0,match:{vMe,vTh,dnfMe:me&&me.dnf||'',dnfTh:th&&th.dnf||'',drvTh:th?th.drv:'',lsr}});}catch(e){console.warn('duel',e);}
    chal={C,res:win?'win':'lose',me:me?me.pos:9,them:th&&!th.dnf?th.pos:999,match:1};}
  addLog(`${rc.name}: ${win?'победа':me&&me.dnf?'сход ('+me.dnf+')':'второе место'}${vMe?` · ${vMe} км/ч`:''}${vTh?`, у ${rc.rv.n} — ${vTh} км/ч`:''}.`,win?'good':'bad');
  lastRace={rc,res,k,won,best:win?1:me&&!me.dnf?2:0,mode,cup:'',chal,inj,lsr,vMe,vTh};
  evHold=1;openRaceResult();
  if(win){try{celebrate(lsr?'Быстрее мирового рекорда!':rc.kind==='record'?'Скорость ваша!':'Матч выигран!',`${rc.venue} · «${me.label}»${vMe?` · ${vMe} км/ч`:''}`,lsr?'📈':'⚔️');}catch(_){}}
  checkAch();save();render();flushToasts();}
/* ---------- карточки ---------- */
function chalHeadRow(C,s){const h=C.h||rivalHead(C.mq,s.y);return h?`<div class="row chal-who" style="margin-top:6px;gap:10px;justify-content:flex-start">${headPhoto(h)}<div><b>${esc(h.n)}</b><br><small class="muted">${esc(h.role)} ${esc(C.mq)}</small></div></div>`:'';}
function chalCardNew(s,C){const sc=rivalryScore(s,C.mq),scT=sc?` <small class="muted">· ${esc(rivalryTxt(s,C.mq))}</small>`:'';
  if(C.type==='match'||C.type==='record'){const rc=C.rc,T=(rc.y-1895)*12+rc.m,t=mi(s),open=t>=T-1&&t<=T,rs=matchRivalStats(rc),rec=C.type==='record',sprint=rc.t==='sprint';
    return `<section class="card chal"><div class="row"><span class="label">⚔️ ${MATCH_ST[C.type]}</span><span class="pill warn">${esc(stakeText(C))}</span></div>${chalHeadRow(C,s)}
      <h3 style="margin-top:4px">«${esc(s.company)}» против ${esc(C.mq)}${scT}</h3>
      <p class="small" style="margin-top:4px">${esc(rc.venue)} (${esc(rc.where)}) · ${MONTHS[rc.m]} ${rc.y} · ${rec?(sprint?'мерный участок: каждый едет один, на время':rc.t==='hill'?'рекорд горы: каждый едет один, на время, от подножия до вершины':'рекорд круга: каждый едет один, на время'):`один на один, ${fmtN(rc.km)} км`}${rc.purse?` · победителю — ещё сбор с трибун ${money(rc.purse)}`:''}</p>
      <p class="small muted" style="margin-top:4px">У соперника: заводская гоночная машина ≈${rs.hp} л.с., до ${rs.kmh} км/ч${rc.rv.dn?` · за рулём ${esc(rc.rv.dn)}`:''}.</p>
      <p class="small muted" style="margin-top:4px">${esc(rc.hist)}</p>
      ${open?`<button class="btn primary block" style="margin-top:8px" data-act="raceSetup" data-k="${esc(rc.key)}" ${s.pending.length?'disabled':''}>Выставить машину</button><p class="small warn" style="margin-top:4px">${t===T?'Последний месяц: не приедете — пари проиграно.':'Запись открыта — заезд можно провести в этом месяце или в следующем.'}</p>`
        :`<p class="small" style="margin-top:6px">Запись откроется в ${MONTHS_P[(T-1+1200)%12]}.</p>`}</section>`;}
  if(C.type==='eleg'||C.type==='exped')return chalCard30(s,C,scT);
  if(C.type==='trial'){const md=s.models.find(m=>m.id===C.md),rv=trialRival(s,C),cars=trialCars(s,C.g),rel=m=>Math.round(carBase(m,0,s.y).rel*100),rr=Math.round(carBase(rv.md,0,s.y).rel*100);
    return `<section class="card chal"><div class="row"><span class="label">⚔️ Пробег на надёжность</span><span class="pill warn">${esc(stakeText(C))}</span></div>${chalHeadRow(C,s)}
      <h3 style="margin-top:4px">«${esc(s.company)}» против ${esc(C.mq)}${scT}</h3>
      <p class="small" style="margin-top:4px">${esc(C.route)} · ${fmtN(C.km)} км · итоги — в ${MONTHS_P[C.end%12]}. Судьи считают поломки, при равенстве — время.</p>
      <p class="small" style="margin-top:4px">Ваша: <b>«${esc(md?md.name:'—')}»</b>${md?` (надёжность ${rel(md)}%)`:''} · их: ${esc(rv.name)} (≈${rr}%)</p>
      ${cars.length>1?`<div class="chips" style="margin-top:6px">${cars.map(m=>`<button class="chip ${md&&m.id===md.id?'on':''}" data-act="chalCar" data-k="${m.id}">${esc(m.name)}<small>надёжность ${rel(m)}%</small></button>`).join('')}</div>`:''}
      ${C.rh?`<p class="small muted" style="margin-top:6px">${esc(C.rh)}</p>`:''}</section>`;}
  if(C.type==='sales'&&C.mon){const hc=C.hc||1,you=Math.round(C.you||0),them=Math.round(C.them||0),need=Math.round(them*hc),mx=Math.max(1,you,need),home=C.c===s.country;
    return `<section class="card chal"><div class="row"><span class="label">⚔️ Вызов по продажам${home?'':' · экспорт'}</span><span class="pill warn">${esc(stakeText(C))}</span></div>${chalHeadRow(C,s)}
      <h3 style="margin-top:4px">«${esc(s.company)}» против ${esc(C.mq)}${scT}</h3>
      <p class="small muted" style="margin-top:4px">Класс «${SEG[C.g].name}»${home?', продажи в стране':` · ${COUNTRIES[C.c].name}`} · ${esc(chalPerText(C))}${hc!==1?' · '+esc(hcText(hc)):''}</p>
      <div class="leg-row" style="margin-top:8px"><span>Вы</span><div class="bar"><i style="width:${you/mx*100}%;background:var(--brass)"></i></div><b class="num">${fmtN(you)}</b></div>
      <div class="leg-row"><span>${esc(C.mq.slice(0,12))}${hc!==1?' ×'+(hc<1?hc.toFixed(2).replace('.',','):hc):''}</span><div class="bar"><i style="width:${need/mx*100}%;background:var(--muted)"></i></div><b class="num">${fmtN(need)}</b></div>
      <p class="small ${you>need?'good':'warn'}" style="margin-top:4px">${you>need?'Вы впереди':'Соперник впереди'}${C.n?` · прошло ${C.n} ${plural(C.n,'месяц','месяца','месяцев')}`:''}</p>
      ${(()=>{const c=C.c||s.country,b=typeof promoButtons==='function'?promoButtons(s,c,C.g):'';return b?`<p class="small muted" style="margin-top:8px">Повлиять на продажи класса${home?'':' в этой стране'} — спецакцией, пока идёт пари:</p><div class="btns" style="margin-top:4px">${b}</div>`:(c!==s.country&&!dealerCount(s,c)?'<p class="small muted" style="margin-top:8px">Спецакции возможны там, где у вас есть дилеры.</p>':'');})()}</section>`;}
  return '';}
Object.assign(RACE_ACT,{chalCar:d=>{const s=G,C=s.chal;if(!C||C.type!=='trial')return;const m=s.models.find(x=>x.id===+d.k||String(x.id)===String(d.k));if(!m)return;C.md=m.id;toast(`На пробег поедет «${m.name}»`);rerender();}});
// название события для газеты и трофея
function chalEvName(s,C,rc){if(C.type==='race')return rc?rc.name:'';if(C.type==='match')return `матч-гонка: ${C.rc.venue}`;if(C.type==='record')return `спор о скорости: ${C.rc.venue}`;
  if(C.type==='trial')return `пробег ${C.route}`;if(C.type==='eleg')return `конкурс элегантности: ${C.venue}`;if(C.type==='exped')return `экспедиция ${C.route}`;if(C.type==='sales')return `продажи класса «${SEG[C.g].name}»${C.c&&C.c!==s.country?' ('+COUNTRIES[C.c].name+')':''}`;return '';}
// реванш: тот же вид вызова, ставка в полтора раза выше
function chalRevenge(s,O){const B=O.base;if(!B)return false;
  if(B.type==='match'||B.type==='record'){const o=offerMatch(s,B.type);if(!o){addLog(`Реванш с ${O.mq} отложен: в ближайшие месяцы негде выйти один на один.`);return false;}
    s.chal=Object.assign({},o.C,{mq:O.mq,stake:O.stake,acc:1,x:stakeExtra(s,O.mq,'rev')});const rv=RACE_TEAMS.find(t=>t.n===O.mq&&t.from<=o.C.rc.y&&t.to>=o.C.rc.y);
    if(rv){const d=matchDriver(s,rv,o.C.rc.y);s.chal.rc=Object.assign({},s.chal.rc,{rv:{n:rv.n,c:rv.c,str:rv.str,mq:rv.mq,drv:d?d.id:'',dn:d?d.n:''}});}else if(s.chal.rc.rv.n!==O.mq){s.chal=null;addLog(`Реванш с ${O.mq} отложен: их гоночная команда сейчас не выступает.`);return false;}
    s.chalLast=mi(s);chalAccept(s,s.chal);pendingToasts.push('⚔️ Реванш принят');return true;}
  if(B.type==='trial'){const o=offerTrial(s);if(!o){addLog(`Реванш с ${O.mq} отложен.`);return false;}s.chal=Object.assign({},o.C,{mq:O.mq,ci:B.ci,g:B.g,stake:O.stake,acc:1,x:stakeExtra(s,O.mq,'rev',1)});s.chalLast=mi(s);chalAccept(s,s.chal);pendingToasts.push('⚔️ Реванш принят');return true;}
  if(B.type==='sales'&&B.mon){const per=3;s.chal=Object.assign({},B,{stake:O.stake,acc:1,per,end:mi(s)+per,y:s.y,you:0,them:0,n:0,x:stakeExtra(s,O.mq,'rev',1)});s.chalLast=mi(s);chalAccept(s,s.chal);pendingToasts.push('⚔️ Реванш принят');return true;}
  return null;}
