/* ================= NEWSPAPER ================= */
// «Также в номере»: свежая новость держится пару месяцев, потом газета перебирает события последних полутора лет — не старше
FLAVOR.sort((a,b)=>a[0]*12+a[1]-(b[0]*12+b[1]));
function flavorOf(s){const now=s.y*12+s.m,age=x=>now-(x[0]*12+x[1]),L=FLAVOR.filter(x=>age(x)>=0&&age(x)<=(x[4]||18));
  if(!L.length){const past=FLAVOR.filter(x=>age(x)>=0);return past.length?past[past.length-1]:FLAVOR[0];}
  const fresh=L.filter(x=>age(x)<=2);return fresh.length?fresh[fresh.length-1]:L[mi(s)%L.length];}
function flavorLine(s){return flavorOf(s)[2];}
// «Также в номере» на выпуск: 2–3 заметки своего времени; свежие — первыми, остальные — те, что реже попадались (не повторяем одну и ту же)
function flavorPick(s,y,m,n,seed,mark){const now=y*12+m,age=x=>now-(x[0]*12+x[1]),seen=s.flvSeen||(s.flvSeen={}),lim=mark?2:99;
  // заметка попадает в газеты не больше двух раз; кончились свежие — «как это было» из прошлых лет (по разу), а нет и таких — место под рынок
  let L=FLAVOR.filter(x=>{const a=age(x);return a>=0&&a<=(x[4]||18)&&(seen[x[2]]||0)<lim;});
  if(!L.length)L=FLAVOR.filter(x=>{const a=age(x);return a>=12&&a<=72&&!(seen[x[2]]||0);}).slice(-6);
  const r=mulberry32((seed||0)*7919+now*104729),sc=L.map(x=>{const n0=seen[x[2]]||0;return {x,k:(age(x)<=1&&!n0?-15:0)+n0*6+age(x)/6+r()*4};});sc.sort((a,b)=>a.k-b.k);
  const out=sc.slice(0,n).map(o=>o.x[2]);if(mark)out.forEach(t=>seen[t]=(seen[t]||0)+1);return out;}
const agoTxt=(f,y,m)=>{const a=Math.floor((y*12+m-(f[0]*12+f[1]))/12);return a<1?'':a===1?'Год назад: ':a<5?a+' года назад: ':a+' лет назад: ';};
const flvByTitle=t=>FLAVOR.find(x=>x[2]===t);
// Полная заметка «из того же номера»; назад — к выпуску
function flavorHTML(t){const f=flvByTitle(t);if(!f)return '';const im=f[3]&&IMG[f[3]],txt=FLAVOR_TXT[t]||t,M=MAST[G.country];
  return `<article class="paper">
    <div class="p-top"><span>${MONTHS_N[f[1]]} ${f[0]}</span><span>Также в номере</span><span>${M[1]}</span></div>
    <h1 class="p-mast ${M[2]?'frak':''}">${M[0]}</h1><div class="p-rule"></div>
    <h2 class="p-head">${esc(t)}</h2>
    ${im?`<figure class="p-fig old" style="margin-inline:0"><img src="${im.src}" alt="" referrerpolicy="no-referrer">${credit(im)}</figure>`:''}
    <div class="p-cols">${txt.split('\n').filter(Boolean).map((p,i)=>`<p class="${i===0&&!/^[\d«"—–-]/.test(p)?'lead':''}">${esc(p)}</p>`).join('')}</div>
    <div class="p-btns"><button class="p-btn" data-act="paperBack">← К номеру</button></div></article>`;}
function paperHTML(o,s){
  // своя машина — только в новостях о компании; в остальных — фото события или ничего
  const M=MAST[s.country],own=o.car||o.carId||o.own,md=o.car||(o.carId&&s.models.find(m=>m.id===o.carId))||(own?(s.models.filter(m=>m.status==='prod').sort((a,b)=>modelR(b,s)-modelR(a,s))[0]||s.models[0]):null);
  const L=s.last,paras=(o.text||'').split('\n').filter(Boolean),py=o.y||s.y,pm=o.m===undefined?s.m:o.m,also=(o.also?o.also:flavorPick(s,py,pm,2,o.arch||0,false)).map(flvByTitle).filter(Boolean);
  const fig=o.img&&IMG[o.img]?`<figure class="p-fig old" style="margin-inline:0"><img src="${IMG[o.img].src}" alt="" referrerpolicy="no-referrer">${credit(IMG[o.img])}</figure><div class="p-cap">${esc(o.imgCap||o.title)}</div>`
      :md?`<figure class="p-fig" style="margin-inline:0">${carArt(md,Object.assign({paper:1},o.carOpt||{}))}</figure><div class="p-cap">${esc(o.caption||('«'+md.name+'» компании «'+s.company+'»'))}</div>`:'';
  const hist=o.hist&&IMG[o.hist]?`<div class="p-hist"><img src="${IMG[o.hist].src}" alt="" referrerpolicy="no-referrer"><span>${esc(o.histCap||'Так было в истории')}</span></div>`:'';
  // кинохроника — кадром плёнки прямо в номере (кнопка «▶» запускает ролик, газета остаётся открытой)
  const rid=paperReelId(o),reel=rid?paperReelHTML(rid,s):'',ch=(o.choices||[['Дальше','close']]).filter(c=>!(reel&&/^reel:/.test(c[1])));
  return `<article class="paper ${REDUCE?'':'spin'}">
    <div class="p-top"><span>${COUNTRIES[s.country].city} · ${MONTHS_N[s.m]} ${s.y}</span><span>№ ${mi(s)+1}</span><span>${M[1]}</span></div>
    <h1 class="p-mast ${M[2]?'frak':''}">${M[0]}</h1><div class="p-rule"></div>
    <div class="p-kick">${esc(o.kicker||'Экстренный выпуск')}</div>
    <h2 class="p-head">${esc(o.title)}</h2>${o.deck?`<div class="p-deck">${esc(o.deck)}</div>`:''}
    ${fig}${reel}
    <div class="p-cols">${paras.map((p,i)=>`<p class="${i===0&&!/^[\d«"—–-]/.test(p)?'lead':''}">${esc(p)}</p>`).join('')}</div>${hist}
    <div class="p-side p-alsos">${also.length?'<b class="p-also-h">Также в номере</b>':''}${also.map(f=>{const im=f[3]&&IMG[f[3]];return `<button class="p-also" data-act="paperAlso" data-k="${esc(f[2])}">${im?`<img src="${im.src}" alt="" referrerpolicy="no-referrer">`:''}<span>${agoTxt(f,py,pm)}${esc(f[2])}<i>читать ›</i></span></button>`;}).join('')}
      <div class="p-mkt"><b>Рынок</b>${L?`Продано машин: ${fmtN(L.sold+(L.milN||0)+(L.ordN||0))}${L.milN?` (армии — ${fmtN(L.milN)})`:''} · ${s.over&&s.soldTo?'ваши деньги '+money(s.soldTo.mine):'касса '+money(s.cash)}`:'Первые продажи впереди'}</div></div>
    ${o.arch!==undefined?`<div class="p-nav"><button class="p-btn alt" data-act="reopenPaper" data-k="${o.arch-1}" ${o.arch>0?'':'disabled'}>◀ Раньше</button><span>${o.arch+1} из ${G.papers.length}</span><button class="p-btn alt" data-act="reopenPaper" data-k="${o.arch+1}" ${o.arch<G.papers.length-1?'':'disabled'}>Позже ▶</button></div>`:''}
    ${o.mean?`<div class="p-mean"><b>Что это значит для вас</b><span>${esc(o.mean)}</span></div>`:''}
    <div class="p-btns">${(ch.length?ch:[['Дальше','close']]).map((c,i)=>`<button class="p-btn ${i?'alt':''}" data-act="${o.act||'paperChoose'}" data-k="${c[1]}">${esc(c[0])}</button>`).join('')}</div>
  </article>`;
}
const PW=document.getElementById('paperWrap');
let PAPER_CUR=null;
function showPaper(o,store=true){
  if(store){if(!o.also)o.also=flavorPick(G,G.y,G.m,2,G.papers.length+mi(G),true);
    G.papers.push({d:dstr(G),y:G.y,m:G.m,title:o.title,deck:o.deck||'',text:o.text,kicker:o.kicker||'',img:o.img||'',imgCap:o.imgCap||'',carId:o.carId||(o.car&&o.car.id)||null,carOpt:o.carOpt||null,own:o.own?1:0,caption:o.caption||'',hist:o.hist||'',histCap:o.histCap||'',also:o.also,reel:paperReelId(o)||'',mean:o.mean||''});if(G.papers.length>40)G.papers.shift();save();}
  PAPER_CUR=o;PW.innerHTML=paperHTML(o,G);PW.hidden=false;PW.scrollTop=0;auSfx('paper',1);
}
function closePaper(){PW.hidden=true;PW.innerHTML='';}


/* ---------- газеты об игроке: начало пути, рекорды, новинки, итоги года ---------- */
// Фото из истории автомобиля, которые нужны газетам (загружаются вместе с остальными)
const HIST_PHOTOS=['Benz Patent-Motorwagen','Highland Park Ford Plant','Charles F. Kettering','Austin 7','Ford Model A (1927–1931)','Daimler Motor-Lastwagen','Oldsmobile Curved Dash','Ford Model T'];
const C_GEN={fr:'Франции',de:'Германии',uk:'Британии',us:'Америки',it:'Италии'};
function introPapers(s){const P=PIONEERS[s.pioneer],C=COUNTRIES[s.country],md=s.models[0],p=parts(md),me=P.name==='Свой персонаж',kids=DIF().simple;
  pushEvent({kicker:'Январь 1895',title:'Экипажи без лошадей',deck:'Моторная повозка из диковинки становится делом',img:'Benz Patent-Motorwagen',imgCap:'«Моторваген» Карла Бенца, 1886 год',choices:[['Читать дальше','ok'],['▶ Кинохроника','reel:intro']],
    text:'Десять лет назад Карл Бенц проехал по Мангейму на трёхколёсном «моторвагене», и прохожие шарахались от треска мотора. Теперь Панар и Левассор, Пежо и де Дион собирают экипажи, которые обгоняют почтовых лошадей, а газеты пишут о первых состязаниях моторов. Банкиры пожимают плечами, извозчики смеются: «Купите лучше лошадь».\nНо тот, кто сегодня откроет мастерскую, может посадить за руль весь мир.'},true);
  pushEvent({own:1,kicker:C.city,title:`«${s.company}» открывает мастерскую`,deck:`${me?'Новый фабрикант':P.name} берётся строить автомобили`,
    text:`В мастерской ${s.workers} рабочих, в кассе ${money(s.cash)}. Первая машина компании — «${md.name}»: ${p.e.name}, ${p.b.name.toLowerCase()}. Её уже продают ${s.dealers[s.country]} дилера в больших городах.\nЦель — к 1930 году стать величайшей автоимперией эпохи и потягаться с Ford, General Motors, Citroën и FIAT.\n`+
      (kids?'Помощник сам ставит цены, открывает дилеров, строит цеха и склад. Ваше дело — придумывать машины (в конструкторе есть кнопка «Подобрать детали повыгоднее»), улучшать в КБ моторы и другие детали, выигрывать гонки и смотреть, как растёт империя. Советник на вкладке «Завод» подскажет, что делать.'
        :'С чего начать: следите за советником на вкладке «Завод» — у каждого совета есть кнопка. Загрузите конструкторское бюро: улучшения сразу делают машины лучше. Придумайте новую модель — кнопка «Подобрать детали повыгоднее» поможет. Откройте дилеров там, где ваши машины купят. Один ход — один месяц.')},true);}
const MILES=[[100,'Сотая машина','Сто машин — это сто семей и фирм, которые больше не держат лошадь. Каждая проданная машина — реклама на улицах.'],
  [1000,'Тысячная машина','В 1901 году Oldsmobile продал 425 машин Curved Dash и считался гигантом. Вы уже обошли его рекорд!'],
  [10000,'Десять тысяч машин','Столько Ford T завод Форда собрал за 1909 год. Пора думать о поточной линии и конвейере.'],
  [100000,'Сто тысяч машин','Ford впервые перешагнул сотню тысяч машин в год в 1912 году. Ваша марка — среди великих.'],
  [1000000,'Миллионная машина','Миллионный Ford T сошёл с конвейера в декабре 1915 года. Теперь и у вас миллион!']];
function checkMilestones(s){const n=totalSold(s);s.ms=s.ms||0;const m=MILES[s.ms];if(!m||n<m[0])return;s.ms++;const top=s.models.filter(x=>x.status==='prod').sort((a,b)=>(b.lastSold||0)-(a.lastSold||0))[0];
  pushEvent({own:1,cel:[m[1]+'!',`«${s.company}» · продано ${fmtN(m[0])} машин`,'🚗'],carId:top?top.id:null,kicker:'Рекорд',title:`${m[1]} «${s.company}»!`,deck:`${dstr(s)}: продано ${fmtN(m[0])} машин${top?`, лучше всех идёт «${top.name}»`:''}`,text:m[2]+`\nВ кассе ${money(s.cash)}, репутация ${Math.round(s.rep)} из 100. ${s.rep<50?'Поднимите репутацию надёжными машинами и победами в гонках.':'Покупатели доверяют вашей марке.'}`},true);
  try{trophyAdd(s,{kind:'record',title:m[1],sub:`продано ${fmtN(m[0])} машин`,story:m[2],key:'ms|'+m[0],carId:top?top.id:null,pt:`${m[1]} «${s.company}»!`});}catch(_){}}
function launchPaper(s,md){if(s.pending.length>1)return;const C=classCompare(md,s,s.country),ks=CHAR_K.filter(k=>C.W[k]>0),best=ks.slice().sort((a,b)=>C.by[b]-C.by[a])[0],worst=ks.slice().sort((a,b)=>C.by[a]-C.by[b])[0],ref=refPrice(md,s),pr=md.price/ref-1;
  const verdict=C.S>=1.08?'машина лучше соперников':C.S>=0.9?'машина не хуже соперников':'машина уступает соперникам';
  reelUnlock(s,'model:'+md.id);
  pushEvent({carId:md.id,kicker:'Автомобильное обозрение',title:`Новинка: «${md.name}»`,choices:[['Читать дальше','ok'],['▶ Кинохроника','reel:model:'+md.id]],deck:`${KIND_NAME[rivalKind(md)]} от «${s.company}» · ${money(md.price)}`,
    text:`Обозреватель «${MAST[s.country][0]}» сравнил «${md.name}» с ${C.ref.name}. ${CHAR_NAMES[best]} — ${Math.round(C.by[best]*100)}% от соперника${C.by[best]>1.05?': здесь новинка впереди':''}. ${C.by[worst]<0.95?`Слабое место — ${CHAR_NAMES[worst].toLowerCase()}: ${Math.round(C.by[worst]*100)}%.`:'Слабых мест обозреватель не нашёл.'}\nИтог: ${verdict} (${Math.round(C.S*100)}%). Цена ${money(md.price)} — ${Math.abs(pr)<0.04?'как у похожих машин':pr<0?`на ${Math.round(-pr*100)}% ниже, чем у похожих машин: покупатели заметят`:`на ${Math.round(pr*100)}% выше, чем у похожих машин`}.`},true);}
// Итоги года: место среди марок страны; газета — когда место поменялось, при лидерстве и раз в пять лет
function yearReview(s){const home=s.country;if(!(s.homePrev>0))return;
  const rows=[{n:s.company,v:s.homePrev,you:1},...(COMPS[home]||[]).map((cp,i)=>({cp,o:(s.comps[home]||[])[i]})).filter(x=>!pkIs(x.cp,s)&&x.o&&(x.o.prev||0)>0).map(x=>({n:compName(x.cp,s),v:x.o.prev,img:(compModel(x.cp,s)||[])[2]}))].sort((a,b)=>b.v-a.v);
  const rank=rows.findIndex(r=>r.you)+1,prev=s.lastRank||99,y=s.y-1;s.lastRank=rank;if(rank===prev&&y%5!==0)return;if(s.pending.length>1)return;
  const lead=rows[0],second=rows[1],top=rows.slice(0,5).map((r,i)=>`${i+1}. ${r.n} — ${fmtN(r.v)}`).join('; ');
  const title=rank===1?(prev===1?`«${s.company}» остаётся первой маркой ${C_GEN[home]}`:`«${s.company}» — первая марка ${C_GEN[home]}!`):rank<prev?`«${s.company}» поднялась на ${rank}-е место`:rank>prev&&prev<99?`«${s.company}» опустилась на ${rank}-е место`:`${y} год: «${s.company}» на ${rank}-м месте`;
  const text=`Продажи машин в стране за ${y} год: ${top}${rank>5?`… ${rank}. ${s.company} — ${fmtN(s.homePrev)}`:''}.\n`+(rank===1?`Отрыв от «${second?second.n:'—'}» — ${fmtN(s.homePrev-(second?second.v:0))} машин. Удержаться на вершине труднее, чем подняться: конкуренты ответят новыми моделями и ценами.`
    :`До лидера — «${lead.n}» — не хватает ${fmtN(lead.v-s.homePrev)} машин в год. ${rank<=3?'Ещё рывок — и марка станет первой!':'Новая модель, дилеры в каждом городе и победы в гонках помогут подняться.'}`);
  if(rank===1)try{trophyAdd(s,{kind:'clip',title:`Первая марка ${C_GEN[home]} ${y}`,sub:`${fmtN(s.homePrev)} машин за год`,story:`Продажи машин в стране за ${y} год: ${top}.`,key:'lead|'+y,y,m:11,pt:title});}catch(_){}
  pushEvent({own:1,kicker:'Итоги года',title,deck:`Рынок ${C_GEN[home]}: ${fmtN(rows.reduce((a,r)=>a+r.v,0))} машин за ${y} год`,img:rank>1&&lead.img&&IMG[lead.img]?lead.img:'',imgCap:rank>1?`Лидер рынка: ${lead.n}`:'',text},true);}
