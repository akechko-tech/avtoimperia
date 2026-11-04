/* ================= 0.42: ЭНЦИКЛОПЕДИЯ В ГАЗЕТЕ И «ЗАЧЕМ ЭТО НУЖНО» =================
   Отзыв 0.41: «новая деталь „двухтактный двигатель 2½ л. с.“ — ровным счётом ничего по сути: добавь сетевой рассказ об этом
   двигателе и других технологиях; я вообще не понимаю, зачем нужен такой двигатель, характеристики ужасные».
   1) У каждой детали, технологии завода и новинки оснащения — статья Википедии (русская, нет — английская): начало статьи
      подгружается в заметку газеты («Энциклопедия»), как фото (21-photos.js), и хранится в телефоне (localStorage) — без сети
      остаётся заводская справка. 2) «Зачем это нужно» — сравнение новинки с тем, что сейчас стоит на ваших машинах: дешевле,
      легче, слабее, надёжнее — и кому такая деталь: дешёвому мотоциклу, гоночной машине, грузовику. */
const PART_WIKI={
  e1:['De Dion-Bouton','De Dion-Bouton'],e2:['Daimler-Motoren-Gesellschaft','Daimler Phönix'],e10:['Cadillac','Cadillac Model A'],e3:['','Ateliers de Construction Mecanique l\'Aster'],e9:['','Monobloc engine'],
  e4:['','Continental Motors Company'],e5:['Бесклапанный двигатель','Sleeve valve'],e14:['Нижнеклапанный двигатель','Flathead engine'],e6:['','Cadillac V8 engine'],e11:['Austin 7','Austin 7'],
  e7:['OHV','Overhead valve engine'],e8:['Рядный восьмицилиндровый двигатель','Straight-eight engine'],e12:['Рядный шестицилиндровый двигатель','Straight-six engine'],
  g1:['Ремённая передача','Belt (mechanical)'],g2:['Panhard','Système Panhard'],g3:['Карданная передача','Drive shaft'],g4:['Планетарная передача','Epicyclic gearing'],g5:['Механическая коробка передач','Manual transmission'],
  g6:['Ford Model A (1927)','Ford Model A (1927–1931)'],g7:['Синхронизатор (коробка передач)','Synchromesh'],
  c1:['Рессора','Leaf spring'],c2:['Panhard','Système Panhard'],c3:['Рама (автомобиль)','Vehicle frame'],c6:['Ford Model T','Ford Model T'],c4:['Рессора','Leaf spring'],c5:['Амортизатор','Shock absorber'],c7:['Lancia Lambda','Lancia Lambda'],
  w1:['','Artillery wheel'],w2:['Michelin','Michelin'],w3:['Протектор (шина)','Tread'],w4:['Michelin','Michelin'],w5:['','Rudge-Whitworth'],w6:['Автомобильная шина','Tire'],w7:['','Budd Company'],w8:['Firestone','Firestone Tire and Rubber Company'],
  k1:['Ленточный тормоз','Band brake'],k2:['Барабанный тормоз','Drum brake'],k3:['Барабанный тормоз','Drum brake'],k6:['Hispano-Suiza H6','Hispano-Suiza H6'],k4:['Тормозная система','Hydraulic brake'],k5:['Барабанный тормоз','Drum brake'],
  b1:['','Runabout (car)'],b2:['Тонно','Tonneau'],b3:['Фаэтон (кузов)','Phaeton body'],b11:['Лимузин','Limousine'],b10:['Родстер','Roadster (automobile)'],b4:['Седан','Sedan (automobile)'],b9:['','Essex (automobile)'],b5:['','Budd Company'],
  b6:['Фургон','Van'],b7:['Грузовой автомобиль','Truck'],b8:['Грузовой автомобиль','Truck'],
  me1:['De Dion-Bouton','De Dion-Bouton'],me2:['Мотоцикл','Motorcycle engine'],me3:['Магнето','Ignition magneto'],me4:['','FN Four'],me5:['V-образный двигатель','V-twin engine'],me6:['Нижнеклапанный двигатель','Flathead engine'],
  me7:['Двухтактный двигатель','Two-stroke engine'],me8:['BMW R32','BMW R32'],me9:['OHV','Overhead valve engine'],me10:['','J. A. Prestwich Industries'],me11:['DKW','DKW'],
  mt1:['Ремённая передача','Belt (mechanical)'],mt2:['Клиноремённая передача','Belt (mechanical)'],mt3:['Цепная передача','Roller chain'],mt4:['Кикстартер','Kick start'],mt5:['Карданная передача','Drive shaft'],
  mf1:['Рама велосипеда','Bicycle frame'],mf2:['','Werner Motors'],mf3:['Мотоциклетная вилка','Motorcycle fork'],mf4:['','Motorcycle frame'],mf5:['','Motorcycle frame'],mf6:['Мотоциклетная вилка','Motorcycle fork'],
  mw1:['Велосипедная шина','Bicycle tire'],mw2:['Автомобильная шина','Tire'],mw3:['','Balloon tire'],mk1:['Ободной тормоз','Rim brake'],mk2:['Барабанный тормоз','Drum brake'],mk3:['Барабанный тормоз','Drum brake'],
  mb0:['Мотоцикл','Motorcycle'],mb1:['Мотоциклетная коляска','Sidecar'],mb2:['Мотоциклетная коляска','Sidecar'],mb3:['Мотоциклетная коляска','Sidecar'],
  // технологии завода (TECH) и новинки оснащения (EQ)
  'tech:tools':['Металлорежущий станок','Machine tool'],'tech:elec':['Электрификация','Electrification'],'tech:parts':['Взаимозаменяемость','Interchangeable parts'],'tech:line':['Конвейерное производство','Assembly line'],
  'tech:school':['Профессиональное образование','Apprenticeship'],'tech:qc':['Контроль качества','Quality control'],'tech:foundry':['Литейное производство','Foundry'],'tech:press':['Штамповка','Stamping (metalworking)'],
  'tech:paint':['Нитроцеллюлозный лак','Duco'],'tech:credit':['Потребительский кредит','General Motors Financial'],
  'eq:ws':['Ветровое стекло','Windshield'],'eq:ac':['Ацетиленовая лампа','Carbide lamp'],'eq:sp':['Спидометр','Speedometer'],'eq:kl':['Клаксон','Vehicle horn'],'eq:el':['Автомобильная фара','Headlamp'],
  'eq:st':['Стартер','Starter (engine)'],'eq:wp':['Стеклоочиститель','Windscreen wiper'],'eq:tr':['Указатель поворота','Automotive lighting'],'eq:ht':['Отопитель салона','Automotive heater']};
function partWiki(id){return PART_WIKI[id]||null;}
// статья с сервера: русская Википедия, потом английская; начало статьи (до 5 предложений); в телефоне — хранится
const WK_CACHE={};
function wkKey(w){return 'wk:'+(w[0]||'')+'|'+(w[1]||'');}
function wikiStore(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(_){}}
function wikiLoad(k){if(WK_CACHE[k])return WK_CACHE[k];try{const v=JSON.parse(localStorage.getItem(k)||'null');if(v)WK_CACHE[k]=v;return v;}catch(_){return null;}}
async function wikiFetch1(lang,title){const url=`https://${lang}.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&prop=extracts|info&inprop=url&exintro=1&explaintext=1&exsentences=5&titles=${encodeURIComponent(title)}`;
  const r=await fetch(url,{mode:'cors'});if(!r.ok)throw new Error('http '+r.status);const j=await r.json(),P=j.query&&j.query.pages;if(!P)return null;const pg=Object.values(P)[0];if(!pg||pg.missing||!pg.extract)return null;
  let t=String(pg.extract).replace(/\s+/g,' ').trim();if(t.length>900)t=t.slice(0,900).replace(/\s\S*$/,'')+'…';return {t,title:pg.title,url:pg.fullurl||`https://${lang}.wikipedia.org/wiki/${encodeURIComponent(pg.title)}`,lang};}
async function wikiExtract(w){if(!w)return null;const k=wkKey(w),c=wikiLoad(k);if(c)return c.none?null:c;
  if(typeof navigator!=='undefined'&&navigator.onLine===false)return null;let out=null;
  for(const [lang,title] of [['ru',w[0]],['en',w[1]]]){if(!title)continue;try{out=await wikiFetch1(lang,title);}catch(e){out=null;}if(out)break;}
  WK_CACHE[k]=out||{none:1};if(out)wikiStore(k,out);return out;}
// блок «Энциклопедия» в газете: ставится заглушкой, заполняется, когда статья пришла (showPaper → wikiFill)
function wikiBoxHTML(w){if(!w||(!w[0]&&!w[1]))return '';const c=wikiLoad(wkKey(w));
  return `<div class="p-wiki" data-ru="${esc(w[0]||'')}" data-en="${esc(w[1]||'')}"><b>Энциклопедия</b><span class="p-wiki-t">${c&&c.t?esc(c.t):c&&c.none?'Статьи в энциклопедии нет.':'Запрашиваем статью…'}</span>${c&&c.url?`<a class="p-wiki-a" href="${esc(c.url)}" target="_blank" rel="noopener">${c.lang==='en'?'Английская Википедия':'Википедия'}: ${esc(c.title)} ›</a>`:''}</div>`;}
function wikiFill(root){if(!root)return;root.querySelectorAll('.p-wiki').forEach(el=>{if(el.dataset.done)return;el.dataset.done=1;const w=[el.dataset.ru||'',el.dataset.en||''];
  wikiExtract(w).then(r=>{const t=el.querySelector('.p-wiki-t');if(!t)return;if(!r){t.textContent=navigator.onLine===false?'Без сети: статья появится, когда телефон будет в сети.':'Статьи в энциклопедии нет.';return;}
    t.textContent=r.t;if(!el.querySelector('.p-wiki-a')){const a=document.createElement('a');a.className='p-wiki-a';a.href=r.url;a.target='_blank';a.rel='noopener';a.textContent=(r.lang==='en'?'Английская Википедия':'Википедия')+': '+r.title+' ›';el.appendChild(a);}}).catch(()=>{});});}
/* ---------- «Зачем это нужно»: новинка против того, что стоит на ваших машинах ---------- */
const WHY_ATTR={e:[['hp','мощность','л. с.',1,0],['c','цена','$',0,0],['kg','вес','кг',0,0],['rel','надёжность','%',1,0],['fuel','расход','%',0,0]],
  g:[['eff','КПД передачи','%',1,0],['ease','удобство','%',1,0],['c','цена','$',0,0],['kg','вес','кг',0,0],['relK','надёжность','%',1,0]],
  c:[['max','держит мотор до','л. с.',1,0],['ride','плавность хода','%',1,0],['c','цена','$',0,0],['kg','вес','кг',0,0]],
  w:[['grip','сцепление','%',1,0],['life','ресурс','км',1,0],['punct','проколы','%',0,0],['ride','мягкость','%',1,0],['c','цена','$',0,0]],
  k:[['brk','сила торможения','%',1,0],['ease','удобство','%',1,0],['c','цена','$',0,0],['kg','вес','кг',0,0]],
  b:[['seats','мест','шт',1,0],['comf','комфорт','%',1,0],['c','цена','$',0,0],['kg','вес','кг',0,0],['cd','сопротивление воздуха','%',0,0]]};
function partCatK(id){const c=PART_CATS.find(c=>byId(c.arr(),id));return c?c.k:null;}
// с чем сравнивать: та же деталь на вашей лучшей модели того же вида (мотоцикл/машина), иначе — новейшая доступная до новинки
function partRef(s,x){const k=partCatK(x.id);if(!k)return null;const mo=!!x.moto,L=(s.models||[]).filter(m=>m.status==='prod'&&!!isMoto(m)===mo).sort((a,b)=>(b.lastSold||0)-(a.lastSold||0));
  for(const md of L){const pid=md[k];if(pid&&pid!==x.id){const r=ALL_PARTS().find(q=>q.id===pid);if(r)return {r,on:md.name};}}
  const cand=ALL_PARTS().filter(q=>q.id!==x.id&&!!q.moto===mo&&partCatK(q.id)===k&&q.y<=Math.max(x.y,s.y)).sort((a,b)=>b.y-a.y)[0];return cand?{r:cand,on:''}:null;}
function fmtWhy(v,u,dec){if(u==='$')return money(v);if(u==='%')return Math.round(v*100)+' %';if(u==='шт')return fmtN(v);if(u==='л. с.'&&v<10&&v%1)return v.toFixed(1).replace('.',',')+' л. с.';const n=dec?v.toFixed(dec).replace('.',','):fmtN(Math.round(v));return u?n+' '+u:n;}
function partWhy(s,x){if(!x)return '';const k=partCatK(x.id),A=WHY_ATTR[k];if(!A)return '';const R=partRef(s,x);if(!R)return x.note||'';const r=R.r,plus=[],minus=[];
  A.forEach(([f,n,u,good,dec])=>{const a=x[f],b=r[f];if(a==null||b==null||a===b)return;const rel=b?(a-b)/Math.abs(b):0,big=Math.abs(rel)>=0.08||(u==='л. с.'&&Math.abs(a-b)>=1);if(!big)return;
    const up=a>b,isGood=good?up:!up,pct=Math.abs(Math.round(rel*100)),cnt=u==='шт',txt=cnt?`${n} ${up?'больше':'меньше'}: ${fmtWhy(a,u)} против ${fmtWhy(b,u)}`:`${n} ${up?'выше':'ниже'}${pct<400&&u!=='%'?` на ${pct} %`:''} (${fmtWhy(a,u,dec)} против ${fmtWhy(b,u,dec)})`;(isGood?plus:minus).push(txt);});
  const who=(()=>{const cheaper=x.c<r.c*0.85,lighter=x.kg!=null&&r.kg!=null&&x.kg<r.kg*0.85,weaker=k==='e'&&x.hp<r.hp*0.8,stronger=k==='e'&&x.hp>r.hp*1.25,sturdier=(k==='e'&&x.rel>r.rel+0.02)||(k==='g'&&(x.relK||1)>(r.relK||1));
    if(k==='e'&&cheaper&&weaker)return x.moto?'Это мотор для дешёвого лёгкого мотоцикла: его берут те, кому не по карману «твин», — почтальоны, рабочие, молодёжь; на нём держится народный класс.':'Это мотор для дешёвой народной машины — не для скорости, а для цены.';
    if(k==='e'&&stronger)return 'Это мотор для скорости: спортивный класс, гонки и рекорды, люкс с запасом тяги.';if(k==='e'&&sturdier&&!weaker)return 'Это мотор ради надёжности: меньше поломок — выше репутация и спрос в среднем классе и у грузовиков.';
    if(k==='b'&&x.closed&&!r.closed)return 'Закрытый кузов — главное, чего ждут покупатели 1920-х: зимой и в дождь открытая машина не продаётся.';if(k==='b'&&x.truck)return 'Для фирм: грузовик считают по цене тонно-километра, а не по красоте.';
    if(k==='w'&&(x.grip||0)>(r.grip||0))return 'Лучше держит дорогу — быстрее в гонках и безопаснее на мокром.';if(k==='k'&&(x.brk||0)>(r.brk||0))return 'Тормоза сильнее — к концу 1920-х покупатели требуют тормоза на все колёса.';
    if(cheaper)return 'Главное здесь — цена: такая деталь удешевляет машину и открывает её новым покупателям.';if(lighter)return 'Главное — вес: легче машина — быстрее, экономичнее, дешевле в шинах и тормозах.';return '';})();
  return `${plus.length?'Лучше: '+plus.join(', ')+'.':''}${minus.length?` Хуже: ${minus.join(', ')}.`:''}${R.on?` (сравнение с «${R.on}».)`:` (сравнение с ${r.name}.)`}${who?' '+who:''}`.trim();}
