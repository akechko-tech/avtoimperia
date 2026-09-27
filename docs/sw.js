const CACHE='avtoimperia-v7';
const CORE=['./','./index.html','./manifest.webmanifest','./apple-touch-icon.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
const put=(req,res)=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp));return res;};
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.origin===location.origin||url.hostname==='en.wikipedia.org'||url.hostname==='commons.wikimedia.org'){
    // сначала сеть (обновления игры и списка фото), без сети — кэш
    e.respondWith(fetch(e.request).then(r=>put(e.request,r)).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
  }else if(/googleapis\.com$|gstatic\.com$|wikimedia\.org$/.test(url.hostname)){
    // шрифты и фотографии: сначала кэш
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>put(e.request,res))));
  }
});
