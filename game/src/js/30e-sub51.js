/* ================= 0.51, этап 9: разделы без длинной прокрутки — сверху выбор, ниже только выбранное =================
   Отзыв автора: «в „Рынке“ ради дилеров или покупки марки в Германии приходится ползать вверх-вниз».
   Вкладка рисуется как раньше (все карточки на месте, ссылки и кнопки работают), а потом subApply прячет карточки,
   не относящиеся к выбранному подразделу. Сверху — полоса выбора. «Рынок»: полоса стран («Обзор» — отдельной кнопкой),
   под выбранной страной — «Продажи», «Сеть», «Сделки»; одна полоса стран управляет дилерами, долями рынка и сделками
   (раньше у каждой из трёх карточек был свой переключатель стран).
   Ссылка на карточку из другого подраздела (совет, полоса империи, «К модели») сама открывает нужный подраздел: subReveal. */
const SUB51={
  plant:{def:'sum',bar:[['sum','Сводка'],['cap','Мощности'],['ppl','Люди'],['wh','Склад'],['tech','Технологии'],['fin','Финансы']],
    of:{'fc-cap':'cap','fc-staffc':'ppl','fc-wh':'wh','fc-techc':'tech','fc-fin':'fin'}},
  models:{def:'list',bar:[['plan','Выпуск'],['list','Модели'],['rd','Бюро']],of:{'fc-planlist':'plan','fc-rdcard':'rd','fc-trials':'plan'}},
  race:{def:'cal',lead:{cal:'fc-rcal'},bar:[['cal','Календарь'],['champ','Чемпионаты'],['team','Команда'],['rec','Рекорды и трофеи']],
    of:{'fc-rcal':'cal','fc-annc':'cal','fc-champs':'champ','fc-trophy':'rec','sec-team':'team','sec-recs':'rec'}},
  log:{def:'dom',bar:[['dom','Господство'],['leg','Наследие'],['titles','Титулы'],['troph','Вызовы и трофеи'],['film','Фильм и газеты'],['log','Хроника']],
    of:{'sec-dom':'dom','sec-legacy':'leg','sec-titles':'titles','fc-ach':'titles','sec-board':'troph','sec-trophies':'troph','sec-saga':'film','fc-digest':'film','showpol':'film','fc-reels':'film','fc-log':'log'}}
};
// «Рынок»: что показывать в обзоре и в каждом подразделе страны (h — только у домашней страны)
const MK9={map:{'sec-world':1},brands:{'fc-shares':1},misc:{'fc-shows':1,'fc-graphs':1,'fc-sup':1,'fc-msup':1},
  sales:{'fc-mkhome':'h','fc-shares':1,'fc-buyers':'h','fc-comps':'h','fc-mkmoto':'h','fc-mcomps':'h','fc-carshop':'h'},net:{'fc-dealers':1,'fc-adc':'h'},deals:{'fc-deals':1}};
const MK9_SUB=[['sales','Продажи'],['net','Сеть'],['deals','Сделки']];
const MK9_W=[['map','Страны'],['brands','Марки'],['misc','Выставки и графики']];   // подразделы «Обзора»
function mk9W(s){const v=s.ui&&s.ui.mk9w;return MK9_W.some(x=>x[0]===v)?v:'map';}
function mk9Key(s){return mk9C(s)==='world'?mk9W(s):mk9S(s);}
// карточки, ради которых подраздел и открыт: сворачивать их незачем
const SUB_OPEN={deals:1,techc:1,trophy:1,dealers:1,cap:1,staffc:1,wh:1,fin:1,rcal:1,champs:1,log:1,mkhome:1,planlist:1,rdcard:1};
function subForce(k){return !!SUB_OPEN[k]&&typeof G!=='undefined'&&subOn(G)&&(!!SUB51[tab]||tab==='market');}
function subOn(s){return !!s&&s.mode!=='racer'&&!(typeof airOnly==='function'&&airOnly(s))&&!(typeof airSwitchOn==='function'&&airSwitchOn(s)&&typeof uiLine!=='undefined'&&uiLine==='air'&&tab!=='log');}
function subSel(s,t){const D=SUB51[t];if(!D)return '';const v=s.ui&&s.ui.sub&&s.ui.sub[t];return D.bar.some(x=>x[0]===v)?v:D.def;}
function subSet(s,t,k){s.ui=s.ui||{};s.ui.sub=s.ui.sub||{};s.ui.sub[t]=k;}
function mk9C(s){const v=s.ui&&s.ui.mk9;return v==='world'||(v&&COUNTRIES[v])?v:s.country;}
function mk9S(s){const v=s.ui&&s.ui.mk9s;return MK9_SUB.some(x=>x[0]===v)?v:'sales';}
// одна полоса стран ведёт все три прежних переключателя (дилеры, доли рынка, сделки)
function mk9Set(s,c,sub){s.ui=s.ui||{};if(sub&&MK9_W.some(x=>x[0]===sub)){s.ui.mk9w=sub;return;}if(c){s.ui.mk9=c;if(c==='world')s.ui.mkC='world';else{s.ui.dlrC=c;s.ui.mkC=c;s.ui.dealC=c;
    /* страна, где вас ещё нет: в «Продажах» пусто — сразу «Сеть» (импортёр, лицензия) */if(!sub&&c!==s.country&&!dealerCount(s,c)&&!(typeof impLv==='function'&&impLv(s,c))&&mk9S(s)==='sales')s.ui.mk9s='net';}}if(sub)s.ui.mk9s=sub;}
function mk9Sync(s){const c=mk9C(s);s.ui=s.ui||{};if(c==='world')s.ui.mkC='world';else{s.ui.dlrC=c;s.ui.mkC=c;s.ui.dealC=c;}}
function mk9BarHTML(s){const home=s.country,c0=mk9C(s),L=s.last,cs=[home,...Object.keys(COUNTRIES).filter(c=>c!==home)];
  const chip=c=>{const d=dealerCount(s,c),mk=L&&L.mk&&L.mk[c],n=mk?(mk.sold||0)+(mk.msold||0):0;
    return `<button class="chip ${c===c0?'on':''}" data-act="mk9" data-c="${c}">${COUNTRIES[c].name}${c===home?' · дома':''}<small>${n?`${fmtN(n)} шт. в мес.`:d?`${fmtN(d)} ${plural(d,'дилер','дилера','дилеров')}`:'нет продаж'}</small></button>`;};
  return `<div class="subbar" id="subbar"><div class="chips sub-cc">${cs.map(chip).join('')}<button class="chip ${c0==='world'?'on':''}" data-act="mk9" data-c="world">🌍 Обзор<small>все страны</small></button></div>
    <div class="seg3">${(c0==='world'?MK9_W:MK9_SUB).map(x=>`<button class="${mk9Key(s)===x[0]?'on':''}" data-act="mk9" data-s="${x[0]}">${x[1]}</button>`).join('')}</div></div>`;}
function subBarHTML(s,t){if(t==='market')return mk9BarHTML(s);const D=SUB51[t];if(!D)return '';const sel=subSel(s,t);
  return `<div class="subbar" id="subbar"><div class="chips sub-tabs">${D.bar.map(x=>`<button class="chip ${x[0]===sel?'on':''}" data-act="sub" data-t="${t}" data-k="${x[0]}">${x[1]}</button>`).join('')}</div></div>`;}
// к какому подразделу относится карточка верхнего уровня (null — видна всегда)
function subKeyOf(s,t,el){if(el.id==='subbar'||el.classList.contains('line-switch'))return null;
  if(t==='market'){const c=mk9C(s),k=mk9Key(s),id=el.id;
    if(el.classList.contains('advisor'))return k==='map'||(c===s.country&&k==='sales')?null:'__no';   // советы — в обзоре стран и на первом экране домашнего рынка
    const v=MK9[k][id];if(v!==undefined)return v==='h'&&c!==s.country?'__no':k;
    return Object.keys(MK9).some(x=>MK9[x][id])?'__no':(k==='misc'?null:'__no');}   // карточка без записи в таблице видна в «Обзор → Выставки и графики»
  const D=SUB51[t];if(!D)return null;const k=D.of[el.id];if(k)return k;
  if(el.classList.contains('advisor'))return D.def;   // советы вкладки — на её первом экране
  return D.def;}
function subApply(s){const V=document.getElementById('view');if(!V)return;const t=tab,on=subOn(s)&&(SUB51[t]||t==='market');document.body.classList.toggle('sub9',!!on);if(!on)return;
  const sw=V.querySelector(':scope > .line-switch'),tmp=document.createElement('div');tmp.innerHTML=subBarHTML(s,t);const bar=tmp.firstElementChild;if(!bar)return;
  if(sw&&sw.nextSibling)V.insertBefore(bar,sw.nextSibling);else V.insertBefore(bar,V.firstChild);
  const sel=t==='market'?mk9Key(s):subSel(s,t);
  [...V.children].forEach(el=>{const k=subKeyOf(s,t,el);el.hidden=k!==null&&k!==sel;});
  // главная карточка подраздела — первой после советов (вызовы и прочие карточки без своего подраздела — ниже неё)
  const lead=SUB51[t]&&SUB51[t].lead&&SUB51[t].lead[sel],le=lead&&document.getElementById(lead);
  if(le&&le.parentElement===V){const fv=[...V.children].find(c=>!c.hidden&&c.id!=='subbar'&&!c.classList.contains('line-switch')&&!c.classList.contains('advisor'));if(fv&&fv!==le)V.insertBefore(le,fv);}}
// ссылка ведёт на карточку из другого подраздела — открыть его (карточки уже в документе, только спрятаны)
function subReveal(el){try{const s=G,V=document.getElementById('view');if(!el||!V||!subOn(s))return;let top=el;while(top&&top.parentElement!==V)top=top.parentElement;if(!top||!top.hidden)return;const t=tab;
    if(t==='market'){const id=top.id,k=['sales','net','deals'].find(k=>MK9[k][id]),w=['map','brands','misc'].find(k=>MK9[k][id]);
      if(k&&!(w&&mk9C(s)==='world')){const h=MK9[k][id]==='h';mk9Set(s,h||mk9C(s)==='world'?s.country:mk9C(s),k);}else if(w){mk9Set(s,'world');mk9Set(s,null,w);}else{mk9Set(s,'world');mk9Set(s,null,'misc');}render();return;}
    const D=SUB51[t];if(!D)return;const k=subKeyOf(s,t,top);if(!k)return;subSet(s,t,k);subApply0(s);}catch(e){console.warn('sub reveal',e);}}
function subApply0(s){const V=document.getElementById('view'),b=document.getElementById('subbar');if(b)b.remove();subApply(s);}
// найти карточку по id, открыть её подраздел и вернуть её (после перерисовки — новую)
function subGo(id){const e=id&&document.getElementById(id);if(!e)return null;subReveal(e);return document.getElementById(id);}
