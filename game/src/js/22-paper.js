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
      :`<figure class="p-fig" style="margin-inline:0">${carSVG(md)}</figure><div class="p-cap">${esc(o.caption||('«'+md.name+'» компании «'+s.company+'»'))}</div>`}
    <div class="p-cols">${paras.map((p,i)=>`<p class="${i===0?'lead':''}">${esc(p)}</p>`).join('')}</div>
    <div class="p-side"><div><b>Также в номере</b>${esc(flavorLine(s))}</div><div><b>Рынок</b>${L?`Продано машин: ${L.sold} · касса ${money(s.cash)}`:'Первые продажи впереди'}</div></div>
    <div class="p-btns">${(o.choices||[['Дальше','close']]).map((c,i)=>`<button class="p-btn ${i?'alt':''}" data-act="${o.act||'paperChoose'}" data-k="${c[1]}">${esc(c[0])}</button>`).join('')}</div>
  </article>`;
}
const PW=document.getElementById('paperWrap');
function showPaper(o,store=true){
  if(store){G.papers.push({d:dstr(G),y:G.y,m:G.m,title:o.title,deck:o.deck||'',text:o.text,kicker:o.kicker||'',img:o.img||''});if(G.papers.length>40)G.papers.shift();save();}
  PW.innerHTML=paperHTML(o,G);PW.hidden=false;PW.scrollTop=0;auSfx('paper',1);
}
function closePaper(){PW.hidden=true;PW.innerHTML='';}

