/* ================= 0.51, этап 9: разделы без длинной прокрутки — сверху выбор, ниже только выбранное =================
   Отзыв автора: «в „Рынке“ ради дилеров или покупки марки в Германии приходится ползать вверх-вниз».
   Вкладка рисуется как раньше (все карточки на месте, ссылки и кнопки работают), а потом subApply прячет карточки,
   не относящиеся к выбранному подразделу. Сверху — полоса выбора. «Рынок»: полоса стран («Обзор» — отдельной кнопкой),
   под выбранной страной — «Продажи», «Сеть», «Сделки»; одна полоса стран управляет дилерами, долями рынка и сделками
   (раньше у каждой из трёх карточек был свой переключатель стран).
   Ссылка на карточку из другого подраздела (совет, полоса империи, «К модели») сама открывает нужный подраздел: subReveal. */
/* 0.60, правка автора 23 ноября: «управление ужасное, количество кнопок запутало, с трудом понимаю, где найти ранее известные
   разделы; лучше два-три подразделения (максимум) и только по необходимости; листать вниз было удобнее, чем тыкать в кнопки».
   Было: «Завод» — 6 кнопок, «Модели» — 3, «Гонки» — 4, «Империя» — 6, «Рынок» — полоса стран и под ней ещё по три кнопки.
   Стало: «Завод», «Модели» и «Гонки» — снова одна страница, которую листают (карточки сворачиваются, как до 0.51);
   «Империя» — два подраздела (дела империи отдельно от фильма, газет и длинной хроники);
   «Рынок» — одна полоса стран (она заменила три переключателя стран в карточках), под страной — все её карточки подряд:
   продажи, сеть, сделки. */
const SUB51={
  log:{def:'emp',bar:[['emp','Империя'],['film','Фильм и хроника']],old:{dom:'emp',leg:'emp',titles:'emp',troph:'emp',log:'film'},
    of:{'sec-dom':'emp','sec-legacy':'emp','sec-titles':'emp','fc-ach':'emp','sec-board':'emp','sec-trophies':'emp','sec-saga':'film','fc-digest':'film','showpol':'film','fc-reels':'film','fc-log':'film'}}
};
// «Рынок»: что показывать в обзоре и под страной (h — только у домашней страны)
const MK9={map:{'sec-world':1},brands:{'fc-shares':1},misc:{'fc-shows':1,'fc-graphs':1,'fc-sup':1,'fc-msup':1},
  sales:{'fc-mkhome':'h','fc-shares':1,'fc-buyers':'h','fc-comps':'h','fc-mkmoto':'h','fc-mcomps':'h','fc-carshop':'h'},net:{'fc-dealers':1,'fc-adc':'h'},deals:{'fc-deals':1}};
function mk9In(id,ks){for(const k of ks){const v=MK9[k][id];if(v!==undefined)return v;}return undefined;}
function mk9Key(s){return mk9C(s)==='world'?'world':'c';}
// карточки, ради которых подраздел и открыт: сворачивать их незачем
// 0.60, правки 28.11: дилеры и сделки — свёрнутыми строками «Нанять дилеров», «Купить марку или долю» (раскрываются нажатием):
// раскрытые подряд, они делали «Рынок» длиной в пять экранов
const SUB_OPEN={mkhome:1,trophy:1,log:1};
function subForce(k){return !!SUB_OPEN[k]&&typeof G!=='undefined'&&subOn(G)&&(!!SUB51[tab]||tab==='market');}
function subOn(s){return !!s&&s.mode!=='racer'&&!(typeof airOnly==='function'&&airOnly(s))&&!(typeof airSwitchOn==='function'&&airSwitchOn(s)&&typeof uiLine!=='undefined'&&uiLine==='air'&&tab!=='log');}
function subSel(s,t){const D=SUB51[t];if(!D)return '';let v=s.ui&&s.ui.sub&&s.ui.sub[t];if(D.old&&D.old[v])v=D.old[v];return D.bar.some(x=>x[0]===v)?v:D.def;}
function subSet(s,t,k){s.ui=s.ui||{};s.ui.sub=s.ui.sub||{};s.ui.sub[t]=k;}
function mk9C(s){const v=s.ui&&s.ui.mk9;return v==='world'||(v&&COUNTRIES[v])?v:s.country;}
// одна полоса стран ведёт все три прежних переключателя (дилеры, доли рынка, сделки)
function mk9Set(s,c){s.ui=s.ui||{};if(c){s.ui.mk9=c;if(c==='world')s.ui.mkC='world';else{s.ui.dlrC=c;s.ui.mkC=c;s.ui.dealC=c;}}}
function mk9Sync(s){const c=mk9C(s);s.ui=s.ui||{};if(c==='world')s.ui.mkC='world';else{s.ui.dlrC=c;s.ui.mkC=c;s.ui.dealC=c;}}
function mk9BarHTML(s){const home=s.country,c0=mk9C(s),L=s.last,cs=[home,...Object.keys(COUNTRIES).filter(c=>c!==home)];
  const chip=c=>{const d=dealerCount(s,c),mk=L&&L.mk&&L.mk[c],n=mk?(mk.sold||0)+(mk.msold||0):0;
    return `<button class="chip ${c===c0?'on':''}" data-act="mk9" data-c="${c}">${COUNTRIES[c].name}${c===home?' · дома':''}<small>${n?`${fmtN(n)} шт. в мес.`:d?`${fmtN(d)} ${plural(d,'дилер','дилера','дилеров')}`:'нет продаж'}</small></button>`;};
  return `<div class="subbar" id="subbar"><div class="chips sub-cc">${cs.map(chip).join('')}<button class="chip ${c0==='world'?'on':''}" data-act="mk9" data-c="world">🌍 Обзор<small>все страны</small></button></div></div>`;}
function subBarHTML(s,t){if(t==='market')return mk9BarHTML(s);const D=SUB51[t];if(!D)return '';const sel=subSel(s,t);
  return `<div class="subbar" id="subbar"><div class="chips sub-tabs">${D.bar.map(x=>`<button class="chip ${x[0]===sel?'on':''}" data-act="sub" data-t="${t}" data-k="${x[0]}">${x[1]}</button>`).join('')}</div></div>`;}
// к какому подразделу относится карточка верхнего уровня (null — видна всегда)
function subKeyOf(s,t,el){if(el.id==='subbar'||el.classList.contains('line-switch'))return null;
  if(t==='market'){const c=mk9C(s),id=el.id,world=c==='world',inW=mk9In(id,['map','brands','misc']),inC=mk9In(id,['sales','net','deals']);
    if(el.classList.contains('advisor'))return world||c===s.country?null:'__no';   // советы — в обзоре и на домашнем рынке
    if(world)return inW!==undefined||inC===undefined?null:'__no';   // карточка без записи в таблице видна в «Обзоре»
    return inC===undefined||(inC==='h'&&c!==s.country)?'__no':null;}
  const D=SUB51[t];if(!D)return null;const k=D.of[el.id];if(k)return k;
  return D.def;}   // советы и карточки без своего подраздела — на первом экране вкладки
function subApply(s){const V=document.getElementById('view');if(!V)return;const t=tab,on=subOn(s)&&(SUB51[t]||t==='market');document.body.classList.toggle('sub9',!!on);if(!on)return;
  const sw=V.querySelector(':scope > .line-switch'),tmp=document.createElement('div');tmp.innerHTML=subBarHTML(s,t);const bar=tmp.firstElementChild;if(!bar)return;
  if(sw&&sw.nextSibling)V.insertBefore(bar,sw.nextSibling);else V.insertBefore(bar,V.firstChild);
  const sel=t==='market'?null:subSel(s,t);
  [...V.children].forEach(el=>{const k=subKeyOf(s,t,el);el.hidden=k!==null&&k!==sel;});}
// ссылка ведёт на карточку из другого подраздела — открыть его (карточки уже в документе, только спрятаны)
function subReveal(el){try{const s=G,V=document.getElementById('view');if(!el||!V||!subOn(s))return;let top=el;while(top&&top.parentElement!==V)top=top.parentElement;if(!top||!top.hidden)return;const t=tab;
    if(t==='market'){const id=top.id,inC=mk9In(id,['sales','net','deals']);
      if(inC!==undefined)mk9Set(s,inC==='h'||mk9C(s)==='world'?s.country:mk9C(s));else mk9Set(s,'world');render();return;}
    const D=SUB51[t];if(!D)return;const k=subKeyOf(s,t,top);if(!k)return;subSet(s,t,k);subApply0(s);}catch(e){console.warn('sub reveal',e);}}
function subApply0(s){const V=document.getElementById('view'),b=document.getElementById('subbar');if(b)b.remove();subApply(s);}
// найти карточку по id, открыть её подраздел и вернуть её (после перерисовки — новую)
function subGo(id){const e=id&&document.getElementById(id);if(!e)return null;subReveal(e);return document.getElementById(id);}
