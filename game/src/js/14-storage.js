/* ================= STORAGE: slots, autosave, hall of fame ================= */
// 0.39: 12 слотов (было 3) — слоты лежат в IndexedDB (localStorage тесен), автосохранение — по-прежнему в localStorage;
// при старте слоты читаются в память, поэтому список и загрузка работают сразу; старые слоты 1–3 из localStorage переносятся сами.
// Перенос на другое устройство: «код сохранения» — сжатый (gzip) base64 в буфер обмена, обратно — вставкой.
const SAVE_PREFIX='avt8-',SLOTS=['auto','1','2','3','4','5','6','7','8','9','10','11','12'];
const slotKey=k=>SAVE_PREFIX+'slot-'+k;
const SLOT_MEM={};let SLOT_DB=null;
function slotDb(){if(SLOT_DB)return SLOT_DB;SLOT_DB=new Promise((ok,no)=>{try{if(typeof indexedDB==='undefined'){ok(null);return;}const r=indexedDB.open('avtoimperia-saves',1);r.onupgradeneeded=()=>{r.result.createObjectStore('slots');};r.onsuccess=()=>ok(r.result);r.onerror=()=>ok(null);r.onblocked=()=>ok(null);}catch(e){ok(null);}});return SLOT_DB;}
function slotDbPut(k,txt){return slotDb().then(db=>new Promise(ok=>{if(!db){ok(false);return;}try{const tx=db.transaction('slots','readwrite');tx.objectStore('slots').put(txt,k);tx.oncomplete=()=>ok(true);tx.onerror=()=>ok(false);}catch(e){ok(false);}}));}
function slotDbDel(k){return slotDb().then(db=>new Promise(ok=>{if(!db){ok(false);return;}try{const tx=db.transaction('slots','readwrite');tx.objectStore('slots').delete(k);tx.oncomplete=()=>ok(true);tx.onerror=()=>ok(false);}catch(e){ok(false);}}));}
function slotDbAll(){return slotDb().then(db=>new Promise(ok=>{if(!db){ok({});return;}try{const out={},tx=db.transaction('slots','readonly'),st=tx.objectStore('slots'),req=st.openCursor();req.onsuccess=()=>{const c=req.result;if(c){out[c.key]=c.value;c.continue();}else ok(out);};req.onerror=()=>ok(out);}catch(e){ok({});}}));}
// при старте: слоты из базы — в память; старые слоты из localStorage — в базу
function slotsInit(){return slotDbAll().then(all=>{for(const k in all)SLOT_MEM[k]=all[k];
  SLOTS.forEach(k=>{if(k==='auto')return;try{const t=localStorage.getItem(slotKey(k));if(t&&!SLOT_MEM[k]){SLOT_MEM[k]=t;slotDbPut(k,t).then(okk=>{if(okk)try{localStorage.removeItem(slotKey(k));}catch(_){}});}}catch(_){}});
  if(typeof slotsReady==='function')try{slotsReady();}catch(_){}}).catch(()=>{});}
function save(){if(!G)return;try{localStorage.setItem(slotKey('auto'),JSON.stringify(G));localStorage.setItem(SAVE_PREFIX+'last','auto');}catch(e){}}
function saveTo(k){if(!G)return false;try{G.savedAt=Date.now();const txt=JSON.stringify(G);if(k==='auto'){localStorage.setItem(slotKey(k),txt);}else{SLOT_MEM[k]=txt;slotDbPut(k,txt).then(ok=>{if(!ok)try{localStorage.setItem(slotKey(k),txt);}catch(_){}});}
  try{localStorage.setItem(SAVE_PREFIX+'last',k);}catch(_){}return true;}catch(e){return false;}}
function slotRaw(k){try{const t=k==='auto'?localStorage.getItem(slotKey(k)):(SLOT_MEM[k]||localStorage.getItem(slotKey(k)));const x=JSON.parse(t||'null');if(x&&x.v===8)return x;}catch(e){}return null;}
function slotInfo(k){const x=slotRaw(k);return x?{company:x.company,y:x.y,m:x.m,cash:x.cash,pioneer:x.pioneer,country:x.country,over:x.over,at:x.savedAt,dir:x.lines&&!x.lines.car&&x.lines.air?'air':x.lines&&!x.lines.car&&x.lines.moto?'moto':'car'}:null;}
function loadSlot(k){const x=slotRaw(k);if(!x)return false;G=migrate(x);try{racerBrandLink();}catch(_){}return true;}
function deleteSlot(k){delete SLOT_MEM[k];try{localStorage.removeItem(slotKey(k));}catch(e){}slotDbDel(k);}
// код сохранения: gzip + base64 (CompressionStream есть в Chrome/WebView с 2020 года; без него — просто base64)
function saveCode(){if(!G)return Promise.resolve('');const txt=JSON.stringify(G),b64=u8=>{let s='';for(let i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(s);};
  const raw=new TextEncoder().encode(txt);if(typeof CompressionStream==='undefined')return Promise.resolve('AVT1:'+b64(raw));
  return new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer().then(ab=>'AVTZ:'+b64(new Uint8Array(ab))).catch(()=>'AVT1:'+b64(raw));}
function loadCode(code){code=String(code||'').trim();const m=/^(AVT1|AVTZ):([A-Za-z0-9+/=\s]+)$/.exec(code);if(!m)return Promise.resolve(false);
  let u8;try{const bin=atob(m[2].replace(/\s+/g,''));u8=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);}catch(e){return Promise.resolve(false);}
  const parse=txt=>{try{const x=JSON.parse(txt);if(!x||x.v!==8)return false;G=migrate(x);try{racerBrandLink();}catch(_){}return true;}catch(e){return false;}};
  if(m[1]==='AVT1')return Promise.resolve(parse(new TextDecoder().decode(u8)));
  if(typeof DecompressionStream==='undefined')return Promise.resolve(false);
  return new Response(new Blob([u8]).stream().pipeThrough(new DecompressionStream('gzip'))).text().then(parse).catch(()=>false);}
function migrate(x){
  x.tech=x.tech||{};x.dealers=x.dealers||{[x.country]:1};x.capBuild=x.capBuild||[];x.peak=x.peak||{year:0,share:{}};x.firsts=x.firsts||{};x.titles=x.titles||[];
  x.season=x.season||{};x.cres=x.cres||{};x.rdept=x.rdept||0;x.contracts=x.contracts||{};x.hist.share=x.hist.share||[];x.pw=x.pw||{};x.drivers=x.drivers||[];
  x.models.forEach(m=>{if(m.plan===undefined)m.plan='auto';if(m.backlog===undefined)m.backlog=0;if(m.fc===undefined)m.fc=m.lastDem||0;
    // 0.10: коробка передач и тормоза стали отдельными деталями
    const y=m.status==='dev'?x.y:1895+Math.floor((m.launched||0)/12);
    if(!m.g)m.g=defGear(y);if(!m.k)m.k=m.c==='c5'?(y>=1921?'k4':'k3'):y>=1902&&m.c!=='c1'&&m.c!=='c2'?'k2':'k1';});
  // 0.10: несколько проектов КБ, склад, ответ конкурентов, заказы
  const rd=x.rd||(x.rd={lvl:1,upg:{},early:[]});if(!rd.projs){rd.projs=rd.proj?[{...rd.proj,prog:rd.prog||0}]:[];delete rd.proj;delete rd.prog;}
  if(x.wh===undefined){x.wh=Math.max(12,Math.round(x.models.reduce((a,m)=>a+(m.stock||0),0)*1.3),Math.round((x.cap||3)*1.5));x.whBuild=[];}
  if(x.pw&&SEGK.some(g=>typeof x.pw[g]==='number'))x.pw={[x.country]:x.pw};
  x.rv=x.rv||{};x.orders=x.orders||[];x.tenders=x.tenders||[];x.ui=x.ui||{};
  // 0.11: выставки
  x.shows=x.shows||{};x.showFx=x.showFx||{};x.medals=x.medals||[];
  for(const c in x.comps||{})x.comps[c].forEach(o=>{if(o.yr===undefined){o.yr=0;o.prev=0;}});
  // 0.13: новые марки (Stutz, Mercer, Vauxhall, MG, Amilcar) — дописываем в таблицы конкурентов
  x.comps=x.comps||{};for(const k in COMPS){const L=x.comps[k]=x.comps[k]||[];while(L.length<COMPS[k].length){const i=L.length;L.push({name:COMPS[k][i].n,color:COMP_COLORS[i%COMP_COLORS.length],last:0,yr:0,prev:0});}}
  // 0.32: мотомарки (s.mcomps) и линейки марки; у старых сохранений — только автомобили
  x.mcomps=x.mcomps||{};for(const k in MCOMPS){const L=x.mcomps[k]=x.mcomps[k]||[];while(L.length<MCOMPS[k].length){const i=L.length;L.push({name:MCOMPS[k][i].n,color:COMP_COLORS[(i+3)%COMP_COLORS.length],last:0,yr:0,prev:0});}}
  if(!x.lines)x.lines={car:1};if(!x.mhold)x.mhold=[];
  // 0.33: завод один — места мотоцеха 0.32 становятся местами общих цехов, его стройки — общими стройками
  if(x.mcap>0){x.cap=(x.cap||0)+x.mcap;}delete x.mcap;if(x.mcapBuild&&x.mcapBuild.length){x.capBuild=(x.capBuild||[]).concat(x.mcapBuild.map(b=>({...b,units:Math.max(1,Math.round(b.units))})));}delete x.mcapBuild;
  if(x.mshopB&&!x.mshopB.lv)x.mshopB.lv=1;if(x.ui)delete x.ui.line;
  // 0.13: дилеров не больше, чем городов; за границей — импортёр или своё отделение. Сколько машин сеть уже умела продавать — сохраняем
  if(!x.imp){x.imp={};x.dcap={};const t=x.y+x.m/12;
    for(const c in x.dealers){const d=x.dealers[c]||0;if(!d)continue;
      if(c!==x.country)x.imp[c]=d>tabAt(DEALER_NEED[c],t)*0.4?2:1;
      const mx=dealerMax(x,c);if(d>mx){x.dcap[c]=+(d/mx).toFixed(3);x.dealers[c]=mx;}}}
  // 0.23: легенды — в историческом цвете («Модель T» с 1914 года — чёрная); раньше цвет выпадал по счёту моделей
  if(!x.v23paint){x.v23paint=1;if(typeof legendPaint==='function')x.models.forEach(m=>{if(!m.legend||!LEGEND_BY[m.legend])return;const y=m.status==='dev'?x.y:1895+Math.floor((m.launched||0)/12),p=legendPaint(LEGEND_BY[m.legend],y);if(p)m.paint=p;});}
  // 0.30: сделки — дочерние компании и поглощения (вместо s.bought и s.acq); узнаваемость марки по странам
  try{eqMigrate(x);}catch(e){console.warn('eq migrate',e);}try{maMigrate(x);}catch(e){console.warn('ma migrate',e);}try{if(!x.aw)awInit(x,false);}catch(e){console.warn('aw init',e);}
  // 0.31: продажа компании из сохранений 0.30 — деньги и архив для покупки другой марки
  try{rbMigrate(x);}catch(e){console.warn('rb migrate',e);}
  return x;
}
function hasOldSave(){try{return !!localStorage.getItem('avtoimperia-v3');}catch(e){return false;}}
function fameList(){try{return JSON.parse(localStorage.getItem(SAVE_PREFIX+'fame')||'[]');}catch(e){return [];}}
function fameAdd(e){const L=fameList();e.at=Date.now();L.push(e);L.sort((a,b)=>b.score-a.score);try{localStorage.setItem(SAVE_PREFIX+'fame',JSON.stringify(L.slice(0,20)));}catch(_){}}
