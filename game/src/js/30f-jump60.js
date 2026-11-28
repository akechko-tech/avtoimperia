/* ================= 0.60, правки 28.11: БЫСТРЫЙ ПЕРЕХОД =================
   Автор: «переосмысли систему управления — в минимальное количество нажатий и скроллинга найти нужную информацию».
   В меню ☰ — все разделы всех вкладок: нажатие открывает вкладку на этом разделе, раскрытым, и прокручивает к нему.
   k — ключ свёрнутой карточки (fc-…) или раздела (sec-…); mk — что выбрать в «Рынке»: своя страна или обзор мира. */
const JUMP60=[
  ['plant','🏭 Завод',[['fin','Финансы: выручка, расходы, прибыль'],['cap','Мощности'],['staffc','Рабочие'],['wh','Склад'],['techc','Технологии завода'],['airShop','Авиацех']]],
  ['models','🚗 Модели',[['planlist','Выпуск'],['orders','Заказы'],['trials','Испытания и госзаказы'],['rdcard','Конструкторское бюро'],['offmodels','Снятые модели']]],
  ['market','📊 Рынок',[['mkhome','Продажи дома',''],['dealers','Нанять дилеров','home'],['deals','Купить марку или долю','home'],['adc','Реклама','home'],['comps','Конкуренты','home'],['shares','Доли рынка','world'],['world','Мир: пошлины, заводы','world']]],
  ['race','🏁 Гонки',[['rcal','Гонки года'],['champs','Чемпионаты'],['trophy','Трофеи'],['annc','Анонс']]],
  ['log','👑 Империя',[['emp','Господство, наследие, титулы'],['film','Фильм и хроника']]]];
function jumpSheetHTML(s){return `<div class="row"><h2>Быстрый переход</h2>${X}</div><p class="small muted" style="margin-top:4px">Раздел откроется сразу — без прокрутки и поиска.</p>`
  +JUMP60.map(([t,n,L])=>`<div class="label" style="margin-top:12px">${n}</div><div class="chips">${L.filter(([k])=>k!=='airShop'||(typeof airOn==='function'&&airOn(s))).map(([k,nm,mk])=>`<button class="chip" data-act="jump" data-t="${t}" data-k="${k}" data-mk="${mk||''}">${esc(nm)}</button>`).join('')}</div>`).join('');}
function openJump(){openSheet(jumpSheetHTML(G));}
function jumpTo(s,t,k,mk){tab=t;if(t==='log'&&typeof subSet==='function'&&(k==='emp'||k==='film')){try{subSet(s,'log',k);}catch(_){}}
  else{setOpen(k,true);if(t==='market'&&typeof mk9Set==='function'){try{mk9Set(s,mk==='world'?'world':s.country);}catch(_){}}}
  save();render();try{const el=document.getElementById('fc-'+k)||document.getElementById('sec-'+k)||document.getElementById(k);if(el&&el.scrollIntoView)el.scrollIntoView({block:'start'});else window.scrollTo(0,0);}catch(_){}}
