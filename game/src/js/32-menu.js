/* ================= MAIN MENU ================= */
const GAME_VER='0.21';
const MS=document.getElementById('menuScreen');
function menuArt(){
  // рассвет над дорогой с тополями и гоночный автомобиль начала века
  let t='';for(let i=0;i<9;i++){const x=20+i*44,h=60+(i%3)*14;t+=`<g transform="translate(${x},${150-h})"><rect x="-1.5" y="${h-22}" width="3" height="22" fill="#3b2a1c"/><ellipse cx="0" cy="${h*0.45}" rx="7" ry="${h*0.45}" fill="${i%2?'#35512f':'#2c4628'}"/></g>`;}
  return `<svg viewBox="0 0 400 220" class="menu-art" aria-hidden="true"><defs><linearGradient id="msky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2f4a"/><stop offset=".55" stop-color="#d98c5a"/><stop offset="1" stop-color="#f3d49a"/></linearGradient>
    <radialGradient id="msun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff4d0"/><stop offset="1" stop-color="#fff4d0" stop-opacity="0"/></radialGradient></defs>
    <rect width="400" height="220" fill="url(#msky)"/><circle cx="300" cy="140" r="60" fill="url(#msun)"/><circle cx="300" cy="140" r="18" fill="#fff1c2"/>
    <path d="M0,150 Q60,128 130,142 T260,138 T400,146 L400,220 L0,220Z" fill="#5a6b43"/><path d="M0,160 Q120,146 220,156 T400,152 L400,220 L0,220Z" fill="#46583a"/>
    ${t}<path d="M150,220 L196,150 L204,150 L260,220Z" fill="#b89a6a"/><path d="M198,150 L202,150 L206,220 L194,220Z" fill="#d8c29a" opacity=".5"/>
    <g transform="translate(120,168)"><ellipse cx="42" cy="38" rx="48" ry="5" fill="#000" opacity=".35"/>
      <circle cx="16" cy="28" r="12" fill="#1a1a1a"/><circle cx="16" cy="28" r="8" fill="none" stroke="#c9a24a" stroke-width="1.5"/><circle cx="72" cy="28" r="12" fill="#1a1a1a"/><circle cx="72" cy="28" r="8" fill="none" stroke="#c9a24a" stroke-width="1.5"/>
      <path d="M2,22 L4,12 Q10,8 22,9 L50,9 Q56,6 64,6 L86,8 Q92,10 92,18 L90,22 Z" fill="#1F4E9C"/><rect x="84" y="7" width="7" height="13" rx="1" fill="#c9a24a"/>
      <circle cx="30" cy="2" r="5" fill="#e0b894"/><path d="M25,1 Q30,-6 35,1Z" fill="#4a3524"/><rect x="26" y="0" width="8" height="2" fill="#8fb1c6"/><path d="M34,3 Q44,2 50,6 L46,8 Q40,5 34,5Z" fill="#f2efe4"/>
      <circle cx="44" cy="4" r="4.5" fill="#dcb08c"/><path d="M40,3 Q44,-3 48,3Z" fill="#3a2a1c"/></g>
    <g fill="#f3d49a" opacity=".6"><circle cx="100" cy="190" r="10"/><circle cx="86" cy="186" r="7"/><circle cx="74" cy="182" r="5"/></g></svg>`;
}
function showMainMenu(){
  stopAuto&&stopAuto();closeSheet();closePaper();document.querySelector('.wrap').hidden=true;document.querySelector('.bar-nav').hidden=true;
  const cont=slotInfo('auto'),old=hasOldSave()&&!cont;
  MS.innerHTML=`<div class="menu-in"><div class="menu-hero">${menuArt()}</div>
    <div class="menu-titlebox"><div class="menu-kick">1895 — 1929</div><h1 class="menu-title">Автоимперия</h1><p class="menu-sub">экономическая стратегия и гонки на заре автомобиля</p></div>
    <div class="menu-gap"></div>
    <p class="menu-cap" id="menuCap"></p>
    <div class="stack menu-btns">
      ${cont?`<button class="btn primary block" data-act="continue"><b>Продолжить</b><small>${esc(cont.company)} · ${MONTHS[cont.m]} ${cont.y}${cont.over?' · итоги':''}</small></button>`:''}
      <button class="btn ${cont?'':'primary'} block" data-act="newgame">Новая игра</button>
      <button class="btn block" data-act="loadOpen">Загрузить</button>
      <button class="btn block" data-act="fame">Зал славы</button>
      <button class="btn block" data-act="settings">Звук, графика и управление</button>
      <button class="btn block" data-act="about">Об игре</button></div>
    ${old?'<p class="small muted" style="margin-top:12px;text-align:center">Сохранение версии 0.7 не подходит к новой экономике — начните новую партию.</p>':''}
    <p class="small muted menu-foot">Версия ${GAME_VER} · вдохновлено Motor City / Oldtimer (1994). Музыка, звуки и фото — Wikimedia Commons.</p></div>`;
  MS.hidden=false;
  // живая гонка за меню — чуть позже, чтобы меню появилось сразу
  setTimeout(()=>{if(!MS.hidden&&!R)demoStart();},350);
}
function hideMainMenu(){demoStop();MS.hidden=true;MS.innerHTML='';MS.classList.remove('live','ready');document.querySelector('.wrap').hidden=false;document.querySelector('.bar-nav').hidden=false;}
function openAbout(){openSheet(`<div class="row"><h2>Об игре</h2><button class="iconbtn" data-act="close" aria-label="Закрыть">×</button></div>
  <div class="stack small" style="margin-top:10px"><p>«Автоимперия» — современная версия классических экономических стратегий об автомобильной индустрии начала XX века в духе Motor City / Oldtimer (1994). Название, графика и код — оригинальные.</p>
  <p>Рынки опираются на реальную статистику выпуска машин в США, Франции, Великобритании, Германии и Италии 1895–1929 годов; конкуренты — реальные марки с их объёмами выпуска. Ранние европейские годы и деление по классам — оценки для игры.</p>
  <p>Гонки, пилоты, машины, изобретения — по истории автоспорта и техники. Фотографии — Wikimedia Commons, общественное достояние.</p>
  <p>Фото-текстуры гоночных трасс, неба и листвы — Poly Haven (CC0).</p>
  <p id="abReal">Трассы «Париж — Мадрид», «Тарга Флорио», Гран-при АКФ 1906 года, Кубок Гордона Беннетта в Ирландии и Индианаполис построены по настоящей местности, отмотанной к году гонки: рельеф — Copernicus DEM GLO-30 (© DLR e.V. 2010–2014 и © Airbus Defence and Space GmbH 2014–2018, предоставлено по программе Copernicus Европейским союзом и ЕКА); дороги, реки, леса, города и железные дороги — © участники OpenStreetMap (лицензия ODbL, openstreetmap.org/copyright); цвет земли — Sentinel-2 cloudless 2016 by EOX IT Services GmbH (CC BY 4.0; содержит изменённые данные Copernicus Sentinel 2016).</p>
  <p id="abMus">Оркестр — Wikimedia Commons: ${aboutMusCredits()}. Голос диктора — нейросеть Silero.</p>
  <p id="abSfx">Звуки мира — Wikimedia Commons: ${aboutSfxCredits()}.</p>
  <p id="abFace">Лица ${Object.keys(typeof FACES!=='undefined'?FACES:{}).length} гонщиков на трассе — по их историческим снимкам с Wikimedia Commons: ${aboutFaceCredits()}.</p><p class="muted">Версия ${GAME_VER}</p></div>`);
  // указатели музыки и звуков грузятся с сайта — когда придут, дописываем авторов
  try{Promise.all([typeof orchLoad==='function'?orchLoad():null,typeof ambIndex==='function'?ambIndex():null]).then(()=>{
    const a=document.getElementById('abMus'),b=document.getElementById('abSfx');
    if(a)a.textContent=`Оркестр — Wikimedia Commons: ${aboutMusCredits()}. Голос диктора — нейросеть Silero.`;
    if(b)b.textContent=`Звуки мира — Wikimedia Commons: ${aboutSfxCredits()}.`;}).catch(()=>{});}catch(_){}}
// авторы записей со свободной лицензией (CC BY, CC BY-SA): автор — лицензии
function aboutByLic(I){const M=new Map();Object.values(I||{}).forEach(x=>{if(!/CC BY/i.test(x.lic||''))return;const a=x.by||'Wikimedia Commons';if(!M.has(a))M.set(a,new Set());M.get(a).add(x.lic);});
  return [...M].map(([a,L])=>`${a} (${[...L].join(', ')})`).join(', ');}
function aboutMusCredits(){const I=(typeof ORCH!=='undefined'&&ORCH.idx)||window.MUSIC_INDEX||null,L=aboutByLic(I);
  return 'записи военных оркестров США (общественное достояние), Musopen (CC0), пластинки 1917–1924 годов'+(L?'; '+L:'; музыка в духе немого кино — Kevin MacLeod (incompetech.com), CC BY 3.0/4.0');}
function aboutFaceCredits(){const C=typeof FACE_CREDITS!=='undefined'?FACE_CREDITS:{},L=aboutByLic(C),pd=Object.values(C).filter(x=>!/CC BY/i.test(x.lic||'')).length;
  return `${pd} — общественное достояние${L?'; '+L:''}`;}
function aboutSfxCredits(){const I=(typeof AMB!=='undefined'&&AMB.idx)||window.SFX_INDEX||null,L=aboutByLic(I);
  return L?L+'; остальные — общественное достояние и CC0':'толпа, птицы, колокола, паровоз, дождь — записи в общественном достоянии и со свободными лицензиями (авторы указаны на страницах записей)';}
