/* ================= MAIN MENU ================= */
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
      <button class="btn block" data-act="settings">Звук и управление</button>
      <button class="btn block" data-act="about">Об игре</button></div>
    ${old?'<p class="small muted" style="margin-top:12px;text-align:center">Сохранение версии 0.7 не подходит к новой экономике — начните новую партию.</p>':''}
    <p class="small muted menu-foot">Вдохновлено Motor City / Oldtimer (1994). Музыка и фото — общественное достояние.</p></div>`;
  MS.hidden=false;
  // живая гонка за меню — чуть позже, чтобы меню появилось сразу
  setTimeout(()=>{if(!MS.hidden&&!R)demoStart();},350);
}
function hideMainMenu(){demoStop();MS.hidden=true;MS.innerHTML='';MS.classList.remove('live','ready');document.querySelector('.wrap').hidden=false;document.querySelector('.bar-nav').hidden=false;}
function openAbout(){openSheet(`<div class="row"><h2>Об игре</h2><button class="iconbtn" data-act="close" aria-label="Закрыть">×</button></div>
  <div class="stack small" style="margin-top:10px"><p>«Автоимперия» — современная версия классических экономических стратегий об автомобильной индустрии начала XX века в духе Motor City / Oldtimer (1994). Название, графика и код — оригинальные.</p>
  <p>Рынки опираются на реальную статистику выпуска машин в США, Франции, Великобритании, Германии и Италии 1895–1929 годов; конкуренты — реальные марки с их объёмами выпуска. Ранние европейские годы и деление по классам — оценки для игры.</p>
  <p>Гонки, пилоты, машины, изобретения — по истории автоспорта и техники. Фотографии и записи музыки — Wikimedia Commons, общественное достояние.</p></div>`);}
