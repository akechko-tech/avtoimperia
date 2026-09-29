/* ================= PHOTOS (Wikipedia / Wikimedia Commons) ================= */
const IMG={};let imgTried=false;
// Фото гонщиков — статьи английской Википедии
const DRIVER_WIKI={"levassor": "Émile Levassor", "de_dion": "Jules-Albert de Dion", "charron": "Fernand Charron", "jenatzy": "Camille Jenatzy", "winton": "Alexander Winton", "edge": "Selwyn Edge", "rolls": "Charles Rolls", "l_renault": "Louis Renault (industrialist)", "m_renault": "Marcel Renault", "vanderbilt": "William Kissam Vanderbilt II", "lancia": "Vincenzo Lancia", "nazzaro": "Felice Nazzaro", "h_ford": "Henry Ford", "oldfield": "Barney Oldfield", "wagner": "Louis Wagner (racing driver)", "szisz": "Ferenc Szisz", "l_chevrolet": "Louis Chevrolet", "goux": "Jules Goux", "lautenschlager": "Christian Lautenschlager", "borghese": "Scipione Borghese", "depalma": "Ralph DePalma", "harroun": "Ray Harroun", "porsche": "Ferdinand Porsche", "rickenbacker": "Eddie Rickenbacker", "milton": "Tommy Milton", "ascari": "Antonio Ascari", "murphy": "Jimmy Murphy (racing driver)", "ferrari": "Enzo Ferrari", "campari": "Giuseppe Campari", "campbell": "Malcolm Campbell", "segrave": "Henry Segrave", "nuvolari": "Tazio Nuvolari", "caracciola": "Rudolf Caracciola", "chiron": "Louis Chiron", "varzi": "Achille Varzi", "birkin": "Tim Birkin", "barnato": "Woolf Barnato", "divo": "Albert Divo", "benoist": "Robert Benoist", "junek": "Eliška Junková", "helle_nice": "Hellé Nice", "g_boillot": "Georges Boillot", "resta": "Dario Resta", "shaw": "Wilbur Shaw", "meyer": "Louis Meyer (racing driver)", "de_knyff": "René de Knyff", "fournier": "Henri Fournier", "thery": "Léon Théry", "h_farman": "Henri Farman", "a_michelin": "André Michelin", "e_michelin": "Édouard Michelin", "jellinek": "Emil Jellinek", "parry_thomas": "J. G. Parry-Thomas", "stuck": "Hans Stuck", "materassi": "Emilio Materassi", "a_maserati": "Alfieri Maserati", "kl_guinness": "Kenelm Lee Guinness", "lockhart": "Frank Lockhart (racing driver)", "w_opel": "Wilhelm von Opel"};
function drvPhoto(d){const im=d&&IMG[DRIVER_WIKI[d.id]];return im?`<img class="drv-ph" src="${im.src}" alt="" loading="lazy" referrerpolicy="no-referrer">`:'';}
function allTitles(){const t=new Set();Object.values(DRIVER_WIKI).forEach(x=>t.add(x));Object.values(PIONEERS).forEach(p=>p.wiki&&t.add(p.wiki));Object.values(COMPS).flat().forEach(c=>c.models.forEach(m=>m[2]&&t.add(m[2])));
  HIST.forEach(h=>h.img&&t.add(h.img));RACES.forEach(r=>r.img&&t.add(r.img));Object.values(RIVAL_CAR).flat().forEach(x=>t.add(x[1]));(typeof HIST_PHOTOS!=='undefined'?HIST_PHOTOS:[]).forEach(x=>t.add(x));(typeof SHOWS!=='undefined'?SHOWS:[]).forEach(x=>x.img&&t.add(x.img));t.add('Mercedes-Benz');return [...t];}
async function loadImages(){
  if(imgTried)return;imgTried=true;
  try{const c=JSON.parse(localStorage.getItem('avt-img')||'null');if(c&&c.v===2&&Date.now()-c.t<7*864e5){Object.assign(IMG,c.map);return;}}catch(e){}
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
    try{localStorage.setItem('avt-img',JSON.stringify({v:2,t:Date.now(),map}));}catch(e){}
    if(G)render();
  }catch(e){}
}
const credit=im=>`<a class="credit" href="https://commons.wikimedia.org/wiki/File:${encodeURIComponent(im.file)}" target="_blank" rel="noopener">Фото: Wikimedia Commons</a>`;
function photoHTML(title){const im=title&&IMG[title];return im?`<div class="photo"><img src="${im.src}" alt="" loading="lazy" referrerpolicy="no-referrer">${credit(im)}</div>`:'';}
function portraitHTML(key){const P=PIONEERS[key],im=P.wiki&&IMG[P.wiki];return im?`<div class="ph-oval"><img src="${im.src}" alt="${esc(P.name)}" referrerpolicy="no-referrer"></div>`:portraitSVG(key);}

