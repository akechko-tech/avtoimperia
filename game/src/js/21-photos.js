/* ================= PHOTOS (Wikipedia / Wikimedia Commons) ================= */
const IMG={};let imgTried=false;
// Фото гонщиков — статьи английской Википедии
const DRIVER_WIKI={"levassor": "Émile Levassor", "de_dion": "Jules-Albert de Dion", "charron": "Fernand Charron", "jenatzy": "Camille Jenatzy", "winton": "Alexander Winton", "edge": "Selwyn Edge", "rolls": "Charles Rolls", "l_renault": "Louis Renault (industrialist)", "m_renault": "Marcel Renault", "vanderbilt": "William Kissam Vanderbilt II", "lancia": "Vincenzo Lancia", "nazzaro": "Felice Nazzaro", "h_ford": "Henry Ford", "oldfield": "Barney Oldfield", "wagner": "Louis Wagner (racing driver)", "szisz": "Ferenc Szisz", "l_chevrolet": "Louis Chevrolet", "goux": "Jules Goux", "lautenschlager": "Christian Lautenschlager", "borghese": "Scipione Borghese, 10th Prince of Sulmona", "depalma": "Ralph DePalma", "harroun": "Ray Harroun", "porsche": "Ferdinand Porsche", "rickenbacker": "Eddie Rickenbacker", "milton": "Tommy Milton", "ascari": "Antonio Ascari", "murphy": "Jimmy Murphy (racing driver)", "ferrari": "Enzo Ferrari", "campari": "Giuseppe Campari", "campbell": "Malcolm Campbell", "segrave": "Henry Segrave", "nuvolari": "Tazio Nuvolari", "caracciola": "Rudolf Caracciola", "chiron": "Louis Chiron", "varzi": "Achille Varzi", "birkin": "Tim Birkin", "barnato": "Woolf Barnato", "divo": "Albert Divo", "benoist": "Robert Benoist", "junek": "Eliška Junková", "helle_nice": "Hellé Nice", "g_boillot": "Georges Boillot", "resta": "Dario Resta", "shaw": "Wilbur Shaw", "meyer": "Louis Meyer (racing driver)", "de_knyff": "René de Knyff", "fournier": "Henri Fournier", "thery": "Léon Théry", "h_farman": "Henri Farman", "a_michelin": "André Michelin", "e_michelin": "Édouard Michelin", "jellinek": "Emil Jellinek", "parry_thomas": "J. G. Parry-Thomas", "stuck": "Hans Stuck", "materassi": "Emilio Materassi", "a_maserati": "Alfieri Maserati", "kl_guinness": "Kenelm Lee Guinness", "lockhart": "Frank Lockhart (racing driver)", "w_opel": "Wilhelm von Opel"};
function drvPhoto(d){const im=d&&IMG[DRIVER_WIKI[d.id]];return im?`<img class="drv-ph" src="${im.src}" alt="" loading="lazy" referrerpolicy="no-referrer">`:'';}
// Точные фото машин (файлы Wikimedia Commons). Главное фото статьи о марке бывает логотипом, заводом,
// мостом или машиной совсем другой эпохи — тогда берём снимок нужной модели и года; null — фото не показываем
const PHOTO_FILE={
  'Panhard et Levassor':'Panhard & Levassor Motor Car, 1895 (1).jpg','Panhard':'Panhard & Levassor Motor Car, 1895 (1).jpg',
  'Renault Voiturette':'1898 Renault Type A (46202390725).jpg','Renault AG':'Renault AG-1 Taxi de la Marne 1914 Musée Henri Malartre-3367.jpg',
  'Dodge Brothers':'1914 Dodge model 30 touring car louwman museum (179) (16354656626).jpg','Chrysler':'1924 Chrysler B-70 Phaeton (31660198851).jpg',
  'Packard Twin Six':'Packard Twin Six Model 1-35 1916 D.JPG','Packard':'Packard Model G.jpg',
  'Daimler Motor-Lastwagen':'DMG-Lastwagen von 1896.jpg','Peugeot Type 64':'1905 Camion Peugeot Type 64 photo 1.JPG','Berliet CBA':'Ciężarówka Berliet CBA.jpg',
  'Humber':'Humber Humberette 5 HP Voiturette 1903.jpg','Wolseley Motors':'Wolseley 1902 10 HP on London to Brighton VCR 2013 (10760903696).jpg',
  'Rover Company':'Rover 8 HP (1904).jpg','Daimler Motor Company':'1897 Daimler 4HP Wagonette Front.jpg','Bullnose Morris':'1921 Morris Oxford Bullnose.jpg',
  'De Dietrich':"De Dietrich Grand Duc (1898) in Musée National de l'Automobile (Mulhouse).jpg",'De Dion-Bouton':'Paris - Bonhams 2016 - De Dion-Bouton Vis-à-vis Type D - 1899 - 002.jpg',
  'Berliet':'Berliet voitures legeres 10 CV 16 CV (1902).png','Delage':'Delage F 1908.JPG','Citroën 5CV':'1923 Citroën Type C 5HP.jpg','Citroën AC4':'1928 Citroën AC4 (5127537228).jpg',
  'Bugatti Type 13':'Bugatti Type 13, chassis 365.jpg','Horch':'Horch 10-12 PS.jpg','Opel':'Opel Motorwagen Werbung 1899.jpg',
  'Winton Motor Carriage Company':'Winton auto ad car-1898.jpg','Willys-Overland':'1911 Overland Model 49 Tourer (43919928320).jpg',
  'Nash Motors':'1923 Nash Six Touring Car - Sugarloaf Mountain Region AACA Show 02of20.jpg','Stanley Motor Carriage Company':'Stanley Brothers in one of their steam cars.jpg',
  'Maxwell Motor Company':'Maxwell 1908-1910 A.JPG','Hudson Motor Car Company':'1910 Hudson (5755006199).jpg','Pierce-Arrow':'Pierce 1905 Great Arrow Suburban Ad (14783076205).jpg',
  'Itala 35/45 HP':"1907 Itala 35-45 HP (Pechino-Parigi) Museo Nazionale dell'Automobile Torino.jpg",'Lancia Alpha':'Vettura Lancia Alfa 12 HP Double Paheton, 1907-1909 - san dl SAN IMG-00001301.jpg',
  'Alfa Romeo 6C':'1929 Alfa Romeo 6C 1750 Gran Turismo (35269018545).jpg','Mille Miglia':'1928-04-01 Mille Miglia winner Alfa Romeo 6C 1500 Campari Ramponi.jpg',
  'Ormond Beach, Florida':'Ormond Garage - Side View - ca. 1904.jpg','Mack Trucks':null,'Imperial Institute':null,'Commonwealth Education Trust':null
};
// Старый набор фото (собран до уточнений): чужие снимки убираем — лучше без фото, чем с ошибочным
function fixPhotos(){const nf=f=>String(f||'').replace(/ /g,'_');for(const t in PHOTO_FILE){const f=PHOTO_FILE[t];if(IMG[t]&&(f===null||nf(IMG[t].file)!==nf(f)))delete IMG[t];}}
function allTitles(){const t=new Set();Object.values(DRIVER_WIKI).forEach(x=>t.add(x));Object.values(PIONEERS).forEach(p=>p.wiki&&t.add(p.wiki));Object.values(COMPS).flat().forEach(c=>c.models.forEach(m=>m[2]&&t.add(m[2])));
  HIST.forEach(h=>h.img&&t.add(h.img));RACES.forEach(r=>r.img&&t.add(r.img));Object.values(RIVAL_CAR).flat().forEach(x=>t.add(x[1]));(typeof HIST_PHOTOS!=='undefined'?HIST_PHOTOS:[]).forEach(x=>t.add(x));(typeof SHOWS!=='undefined'?SHOWS:[]).forEach(x=>x.img&&t.add(x.img));t.add('Mercedes-Benz');return [...t];}
async function loadImages(){
  if(imgTried)return;imgTried=true;
  try{const c=JSON.parse(localStorage.getItem('avt-img')||'null');if(c&&c.v===3&&Date.now()-c.t<7*864e5){Object.assign(IMG,c.map);return;}}catch(e){}
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
        if(/logo|map|layout|circuit|coat_of_arms|flag|emblem|emblème|blason|wappen|badge|\.svg$/i.test(pg.pageimage))return;
        const v={src:pg.thumbnail.source,file:pg.pageimage};map[pg.title]=v;(alias[pg.title]||[]).forEach(a=>map[a]=v);
      });
    }
    // точные фото: файлы Wikimedia Commons вместо главного фото статьи
    const fx=Object.entries(PHOTO_FILE).filter(([t,f])=>f&&titles.includes(t));
    for(let i=0;i<fx.length;i+=40){const chunk=fx.slice(i,i+40),byFile={};chunk.forEach(([t,f])=>{(byFile['File:'+f]=byFile['File:'+f]||[]).push(t);});
      const url='https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&iiprop=url&iiurlwidth=480&titles='+encodeURIComponent(Object.keys(byFile).join('|'));
      const j=await fetch(url).then(r=>r.json());const q=j.query||{},norm={};(q.normalized||[]).forEach(n=>norm[n.to]=n.from);
      Object.values(q.pages||{}).forEach(pg=>{const ii=pg.imageinfo&&pg.imageinfo[0];if(!ii||!ii.thumburl)return;const ts=byFile[norm[pg.title]||pg.title]||byFile[pg.title]||[];ts.forEach(t=>map[t]={src:ii.thumburl,file:pg.title.replace(/^File:/,'')});});}
    for(const t in PHOTO_FILE)if(PHOTO_FILE[t]===null)delete map[t];
    Object.assign(IMG,map);
    try{localStorage.setItem('avt-img',JSON.stringify({v:3,t:Date.now(),map}));}catch(e){}
    if(G)render();
  }catch(e){}
}
const credit=im=>`<a class="credit" href="https://commons.wikimedia.org/wiki/File:${encodeURIComponent(im.file)}" target="_blank" rel="noopener">Фото: Wikimedia Commons</a>`;
function photoHTML(title){const im=title&&IMG[title];return im?`<div class="photo"><img src="${im.src}" alt="" loading="lazy" referrerpolicy="no-referrer">${credit(im)}</div>`:'';}
function portraitHTML(key){const P=PIONEERS[key],im=P.wiki&&IMG[P.wiki];return im?`<div class="ph-oval"><img src="${im.src}" alt="${esc(P.name)}" referrerpolicy="no-referrer"></div>`:portraitSVG(key);}

