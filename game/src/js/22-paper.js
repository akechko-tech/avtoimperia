/* ================= NEWSPAPER ================= */
function flavorLine(s){let f=FLAVOR[0][2];FLAVOR.forEach(x=>{if(x[0]<s.y||(x[0]===s.y&&x[1]<=s.m))f=x[2];});return f;}
function paperHTML(o,s){
  const M=MAST[s.country],md=o.car||(s.models.filter(m=>m.status==='prod').sort((a,b)=>modelR(b,s)-modelR(a,s))[0])||s.models[0];
  const L=s.last,paras=(o.text||'').split('\n').filter(Boolean);
  return `<article class="paper ${REDUCE?'':'spin'}">
    <div class="p-top"><span>${COUNTRIES[s.country].city} · ${MONTHS_N[s.m]} ${s.y}</span><span>№ ${mi(s)+1}</span><span>${M[1]}</span></div>
    <h1 class="p-mast ${M[2]?'frak':''}">${M[0]}</h1><div class="p-rule"></div>
    <div class="p-kick">${esc(o.kicker||'Экстренный выпуск')}</div>
    <h2 class="p-head">${esc(o.title)}</h2>${o.deck?`<div class="p-deck">${esc(o.deck)}</div>`:''}
    ${o.img&&IMG[o.img]?`<figure class="p-fig" style="margin-inline:0"><img src="${IMG[o.img].src}" alt="" referrerpolicy="no-referrer">${credit(IMG[o.img])}</figure><div class="p-cap">${esc(o.imgCap||o.title)}</div>`
      :`<figure class="p-fig" style="margin-inline:0">${carArt(md)}</figure><div class="p-cap">${esc(o.caption||('«'+md.name+'» компании «'+s.company+'»'))}</div>`}
    <div class="p-cols">${paras.map((p,i)=>`<p class="${i===0?'lead':''}">${esc(p)}</p>`).join('')}</div>
    <div class="p-side"><div><b>Также в номере</b>${esc(flavorLine(s))}</div><div><b>Рынок</b>${L?`Продано машин: ${L.sold} · касса ${money(s.cash)}`:'Первые продажи впереди'}</div></div>
    <div class="p-btns">${(o.choices||[['Дальше','close']]).map((c,i)=>`<button class="p-btn ${i?'alt':''}" data-act="${o.act||'paperChoose'}" data-k="${c[1]}">${esc(c[0])}</button>`).join('')}</div>
  </article>`;
}
const PW=document.getElementById('paperWrap');
function showPaper(o,store=true){
  if(store){G.papers.push({d:dstr(G),y:G.y,m:G.m,title:o.title,deck:o.deck||'',text:o.text,kicker:o.kicker||'',img:o.img||'',imgCap:o.imgCap||''});if(G.papers.length>40)G.papers.shift();save();}
  PW.innerHTML=paperHTML(o,G);PW.hidden=false;PW.scrollTop=0;auSfx('paper',1);
}
function closePaper(){PW.hidden=true;PW.innerHTML='';}


/* ---------- газеты об игроке: начало пути, рекорды, новинки, итоги года ---------- */
// Фото из истории автомобиля, которые нужны газетам (загружаются вместе с остальными)
const HIST_PHOTOS=['Benz Patent-Motorwagen','Highland Park Ford Plant','Charles F. Kettering','Austin 7','Ford Model A (1927–1931)','Daimler Motor-Lastwagen','Oldsmobile Curved Dash','Ford Model T'];
const C_GEN={fr:'Франции',de:'Германии',uk:'Британии',us:'Америки',it:'Италии'};
function introPapers(s){const P=PIONEERS[s.pioneer],C=COUNTRIES[s.country],md=s.models[0],p=parts(md),me=P.name==='Свой персонаж',kids=DIF().simple;
  pushEvent({kicker:'Январь 1895',title:'Экипажи без лошадей',deck:'Моторная повозка из диковинки становится делом',img:'Benz Patent-Motorwagen',imgCap:'«Моторваген» Карла Бенца, 1886 год',
    text:'Десять лет назад Карл Бенц проехал по Мангейму на трёхколёсном «моторвагене», и прохожие шарахались от треска мотора. Теперь Панар и Левассор, Пежо и де Дион собирают экипажи, которые обгоняют почтовых лошадей, а газеты пишут о первых состязаниях моторов. Банкиры пожимают плечами, извозчики смеются: «Купите лучше лошадь».\nНо тот, кто сегодня откроет мастерскую, может посадить за руль весь мир.'},true);
  pushEvent({kicker:C.city,title:`«${s.company}» открывает мастерскую`,deck:`${me?'Новый фабрикант':P.name} берётся строить автомобили`,
    text:`В мастерской ${s.workers} рабочих, в кассе ${money(s.cash)}. Первая машина компании — «${md.name}»: ${p.e.name}, ${p.b.name.toLowerCase()}. Её уже продают ${s.dealers[s.country]} дилера в больших городах.\nЦель — к 1930 году стать величайшей автоимперией эпохи и потягаться с Ford, General Motors, Citroën и FIAT.\n`+
      (kids?'Помощник сам ставит цены, открывает дилеров, строит цеха и склад. Ваше дело — придумывать машины (в конструкторе есть кнопка «Подобрать детали повыгоднее»), выигрывать гонки и смотреть, как растёт империя. Советник на вкладке «Завод» подскажет, что делать.'
        :'С чего начать: следите за советником на вкладке «Завод» — у каждого совета есть кнопка. Загрузите конструкторское бюро: улучшения сразу делают машины лучше. Придумайте новую модель — кнопка «Подобрать детали повыгоднее» поможет. Откройте дилеров там, где ваши машины купят. Один ход — один месяц.')},true);}
const MILES=[[100,'Сотая машина','Сто машин — это сто семей и фирм, которые больше не держат лошадь. Каждая проданная машина — реклама на улицах.'],
  [1000,'Тысячная машина','В 1901 году Oldsmobile продал 425 машин Curved Dash и считался гигантом. Вы уже обошли его рекорд!'],
  [10000,'Десять тысяч машин','Столько Ford T завод Форда собрал за 1909 год. Пора думать о поточной линии и конвейере.'],
  [100000,'Сто тысяч машин','Ford впервые перешагнул сотню тысяч машин в год в 1912 году. Ваша марка — среди великих.'],
  [1000000,'Миллионная машина','Миллионный Ford T сошёл с конвейера в декабре 1915 года. Теперь и у вас миллион!']];
function checkMilestones(s){const n=totalSold(s);s.ms=s.ms||0;const m=MILES[s.ms];if(!m||n<m[0])return;s.ms++;const top=s.models.filter(x=>x.status==='prod').sort((a,b)=>(b.lastSold||0)-(a.lastSold||0))[0];
  pushEvent({kicker:'Рекорд',title:`${m[1]} «${s.company}»!`,deck:`${dstr(s)}: продано ${fmtN(m[0])} машин${top?`, лучше всех идёт «${top.name}»`:''}`,text:m[2]+`\nВ кассе ${money(s.cash)}, репутация ${Math.round(s.rep)} из 100. ${s.rep<50?'Поднимите репутацию надёжными машинами и победами в гонках.':'Покупатели доверяют вашей марке.'}`},true);}
function launchPaper(s,md){if(s.pending.length>1)return;const C=classCompare(md,s,s.country),ks=CHAR_K.filter(k=>C.W[k]>0),best=ks.slice().sort((a,b)=>C.by[b]-C.by[a])[0],worst=ks.slice().sort((a,b)=>C.by[a]-C.by[b])[0],ref=refPrice(md,s),pr=md.price/ref-1;
  const verdict=C.S>=1.08?'машина лучше соперников':C.S>=0.9?'машина не хуже соперников':'машина уступает соперникам';
  pushEvent({kicker:'Автомобильное обозрение',title:`Новинка: «${md.name}»`,deck:`${KIND_NAME[rivalKind(md)]} от «${s.company}» · ${money(md.price)}`,
    text:`Обозреватель «${MAST[s.country][0]}» сравнил «${md.name}» с ${C.ref.name}. ${CHAR_NAMES[best]} — ${Math.round(C.by[best]*100)}% от соперника${C.by[best]>1.05?': здесь новинка впереди':''}. ${C.by[worst]<0.95?`Слабое место — ${CHAR_NAMES[worst].toLowerCase()}: ${Math.round(C.by[worst]*100)}%.`:'Слабых мест обозреватель не нашёл.'}\nИтог: ${verdict} (${Math.round(C.S*100)}%). Цена ${money(md.price)} — ${Math.abs(pr)<0.04?'как у похожих машин':pr<0?`на ${Math.round(-pr*100)}% ниже, чем у похожих машин: покупатели заметят`:`на ${Math.round(pr*100)}% выше, чем у похожих машин`}.`},true);}
// Итоги года: место среди марок страны; газета — когда место поменялось, при лидерстве и раз в пять лет
function yearReview(s){const home=s.country;if(!(s.homePrev>0))return;
  const rows=[{n:s.company,v:s.homePrev,you:1},...(COMPS[home]||[]).map((cp,i)=>({cp,o:(s.comps[home]||[])[i]})).filter(x=>x.cp.pk!==s.pioneer&&x.o&&(x.o.prev||0)>0).map(x=>({n:compName(x.cp,s),v:x.o.prev,img:(compModel(x.cp,s)||[])[2]}))].sort((a,b)=>b.v-a.v);
  const rank=rows.findIndex(r=>r.you)+1,prev=s.lastRank||99,y=s.y-1;s.lastRank=rank;if(rank===prev&&y%5!==0)return;if(s.pending.length>1)return;
  const lead=rows[0],second=rows[1],top=rows.slice(0,5).map((r,i)=>`${i+1}. ${r.n} — ${fmtN(r.v)}`).join('; ');
  const title=rank===1?(prev===1?`«${s.company}» остаётся первой маркой ${C_GEN[home]}`:`«${s.company}» — первая марка ${C_GEN[home]}!`):rank<prev?`«${s.company}» поднялась на ${rank}-е место`:rank>prev&&prev<99?`«${s.company}» опустилась на ${rank}-е место`:`${y} год: «${s.company}» на ${rank}-м месте`;
  const text=`Продажи машин в стране за ${y} год: ${top}${rank>5?`… ${rank}. ${s.company} — ${fmtN(s.homePrev)}`:''}.\n`+(rank===1?`Отрыв от «${second?second.n:'—'}» — ${fmtN(s.homePrev-(second?second.v:0))} машин. Удержаться на вершине труднее, чем подняться: конкуренты ответят новыми моделями и ценами.`
    :`До лидера — «${lead.n}» — не хватает ${fmtN(lead.v-s.homePrev)} машин в год. ${rank<=3?'Ещё рывок — и марка станет первой!':'Новая модель, дилеры в каждом городе и победы в гонках помогут подняться.'}`);
  pushEvent({kicker:'Итоги года',title,deck:`Рынок ${C_GEN[home]}: ${fmtN(rows.reduce((a,r)=>a+r.v,0))} машин за ${y} год`,img:rank>1&&lead.img&&IMG[lead.img]?lead.img:'',imgCap:rank>1?`Лидер рынка: ${lead.n}`:'',text},true);}
