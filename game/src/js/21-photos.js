/* ================= PHOTOS (Wikipedia / Wikimedia Commons) ================= */
const IMG={};let imgTried=false;
function allTitles(){const t=new Set();Object.values(PIONEERS).forEach(p=>p.wiki&&t.add(p.wiki));Object.values(COMPS).flat().forEach(c=>c.models.forEach(m=>m[2]&&t.add(m[2])));
  HIST.forEach(h=>h.img&&t.add(h.img));RACES.forEach(r=>r.img&&t.add(r.img));Object.values(CAR_REF).flat().forEach(x=>t.add(x[1]));t.add('Mercedes-Benz');return [...t];}
async function loadImages(){
  if(imgTried)return;imgTried=true;
  try{const c=JSON.parse(localStorage.getItem('avt-img')||'null');if(c&&c.v===1&&Date.now()-c.t<7*864e5){Object.assign(IMG,c.map);return;}}catch(e){}
  try{
    const titles=allTitles(),map={};
    for(let i=0;i<titles.length;i+=40){
      const chunk=titles.slice(i,i+40);
      const url='https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&prop=pageimages&piprop=thumbnail|name&pithumbsize=480&titles='+encodeURIComponent(chunk.join('|'));
      const j=await fetch(url).then(r=>r.json());const q=j.query||{};const alias={};
      (q.normalized||[]).forEach(n=>alias[n.to]=(alias[n.to]||[]).concat(n.from));
      (q.redirects||[]).forEach(n=>{alias[n.to]=(alias[n.to]||[]).concat(n.from,...(alias[n.from]||[]));});
      Object.values(q.pages||{}).forEach(pg=>{
        if(!pg.thumbnail||!pg.pageimage)return;
        if(!/\/wikipedia\/commons\//.test(pg.thumbnail.source))return;
        if(/logo|map|layout|circuit|coat_of_arms|flag|emblem|\.svg$/i.test(pg.pageimage))return;
        const v={src:pg.thumbnail.source,file:pg.pageimage};map[pg.title]=v;(alias[pg.title]||[]).forEach(a=>map[a]=v);
      });
    }
    Object.assign(IMG,map);
    try{localStorage.setItem('avt-img',JSON.stringify({v:1,t:Date.now(),map}));}catch(e){}
    if(G)render();
  }catch(e){}
}
const credit=im=>`<a class="credit" href="https://commons.wikimedia.org/wiki/File:${encodeURIComponent(im.file)}" target="_blank" rel="noopener">Фото: Wikimedia Commons</a>`;
function photoHTML(title){const im=title&&IMG[title];return im?`<div class="photo"><img src="${im.src}" alt="" loading="lazy" referrerpolicy="no-referrer">${credit(im)}</div>`:'';}
function portraitHTML(key){const P=PIONEERS[key],im=P.wiki&&IMG[P.wiki];return im?`<div class="ph-oval"><img src="${im.src}" alt="${esc(P.name)}" referrerpolicy="no-referrer"></div>`:portraitSVG(key);}

