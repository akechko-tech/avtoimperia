const CACHE='avtoimperia-v31';
const CORE=['./','./index.html','./manifest.webmanifest','./apple-touch-icon.png','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];
// трассы по настоящей местности (0.22: все ~80 мест, ≈10 МБ): сразу — только первые гонки 1895–1897 годов, остальные — в кэш при первой гонке
const TERRAIN=['chartres','evanston','avignon','brighton','turbie'].map(id=>'./terrain/'+id+'.js');
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE).then(()=>{c.addAll(TERRAIN).catch(()=>{});})).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
const put=(req,res)=>{if(!res||(res.status!==200&&res.type!=='opaque'))return res;const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp)).catch(()=>{});return res;};
const cacheFirst=e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>put(e.request,res))));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  // голос диктора и ролики кинохроники: плеер просит их кусками (Range) — пусть грузит сам браузер
  if(e.request.headers.has('range')||e.request.destination==='audio'||e.request.destination==='video')return;
  const url=new URL(e.request.url),same=url.origin===location.origin;
  if(same&&/\/(film|voice|music|sfx|samples)\/index\.js$/.test(url.pathname)){
    // 0.25: указатели роликов, голоса и музыки меняются с каждой версией — сначала сеть, без сети — кэш
    e.respondWith(fetch(e.request).then(r=>put(e.request,r)).catch(()=>caches.match(e.request)));
  }else if(same&&/\/(tex|samples|sfx)\//.test(url.pathname)){
    // фото-текстуры гонок и живые инструменты: один раз из сети, дальше — из кэша (новая версия игры — новый кэш)
    cacheFirst(e);
  }else if(same&&/\/(film|voice|music|sfx|terrain)\/.+\.(jpg|js)$/.test(url.pathname)){
    // кадры-заставки роликов, списки и настоящие трассы: из кэша
    cacheFirst(e);
  }else if(same||url.hostname==='en.wikipedia.org'||url.hostname==='commons.wikimedia.org'){
    // сначала сеть (обновления игры и списка фото), без сети — кэш
    e.respondWith(fetch(e.request).then(r=>put(e.request,r)).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
  }else if(/googleapis\.com$|gstatic\.com$|wikimedia\.org$/.test(url.hostname)){
    // шрифты и фотографии: сначала кэш
    cacheFirst(e);
  }
});
