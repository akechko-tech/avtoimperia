/* ================= STORAGE: slots, autosave, hall of fame ================= */
const SAVE_PREFIX='avt8-',SLOTS=['auto','1','2','3'];
const slotKey=k=>SAVE_PREFIX+'slot-'+k;
function save(){if(!G)return;try{localStorage.setItem(slotKey('auto'),JSON.stringify(G));localStorage.setItem(SAVE_PREFIX+'last','auto');}catch(e){}}
function saveTo(k){if(!G)return false;try{G.savedAt=Date.now();localStorage.setItem(slotKey(k),JSON.stringify(G));localStorage.setItem(SAVE_PREFIX+'last',k);return true;}catch(e){return false;}}
function slotRaw(k){try{const x=JSON.parse(localStorage.getItem(slotKey(k))||'null');if(x&&x.v===8)return x;}catch(e){}return null;}
function slotInfo(k){const x=slotRaw(k);return x?{company:x.company,y:x.y,m:x.m,cash:x.cash,pioneer:x.pioneer,country:x.country,over:x.over,at:x.savedAt}:null;}
function loadSlot(k){const x=slotRaw(k);if(!x)return false;G=migrate(x);return true;}
function deleteSlot(k){try{localStorage.removeItem(slotKey(k));}catch(e){}}
function migrate(x){
  x.tech=x.tech||{};x.dealers=x.dealers||{[x.country]:1};x.capBuild=x.capBuild||[];x.peak=x.peak||{year:0,share:{}};x.firsts=x.firsts||{};x.titles=x.titles||[];
  x.season=x.season||{};x.cres=x.cres||{};x.rdept=x.rdept||0;x.contracts=x.contracts||{};x.hist.share=x.hist.share||[];x.pw=x.pw||{};x.drivers=x.drivers||[];
  x.models.forEach(m=>{if(m.plan===undefined)m.plan='auto';if(m.backlog===undefined)m.backlog=0;if(m.fc===undefined)m.fc=m.lastDem||0;});
  return x;
}
function hasOldSave(){try{return !!localStorage.getItem('avtoimperia-v3');}catch(e){return false;}}
function fameList(){try{return JSON.parse(localStorage.getItem(SAVE_PREFIX+'fame')||'[]');}catch(e){return [];}}
function fameAdd(e){const L=fameList();e.at=Date.now();L.push(e);L.sort((a,b)=>b.score-a.score);try{localStorage.setItem(SAVE_PREFIX+'fame',JSON.stringify(L.slice(0,20)));}catch(_){}}
