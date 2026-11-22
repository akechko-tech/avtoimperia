/* ================= 0.60: КАРТА ТРАССЫ В НАСТРОЙКЕ ГОНКИ =================
   Отзыв автора (23 ноября): «при выборе машин, пилотов, в меню гонки покажи карту трассы, чтобы можно было её изучить;
   видеоклип бестолково шаблонный, ни о чём». Ролик хроники из настройки гонки убран (он остаётся в газете и в «Империи»);
   на его месте — схема той самой трассы, по которой пойдёт заезд: она строится тем же построителем, что и гонка (buildTrack),
   поэтому повороты, города, мосты и подъёмы на схеме — настоящие.
   Что на схеме: линия трассы с цветом участков (город, лес, горы, море, тоннель), стрелки направления, старт и финиш,
   отметки пути, крутые повороты; под схемой — профиль высот и строка чисел (длина заезда, кругов, крутых поворотов, перепад).
   Длина игровой трассы зависит от самой быстрой машины на старте; здесь её берём по вашим машинам и типичной машине соперников —
   у настоящих трасс (их данные подгружаются) рисунок от этого не меняется, у остальных может отличаться концовка. */
const SMAP_COL={0:'#d9c89a',1:'#c98a5a',2:'#c9a05a',3:'#6fae6a',4:'#8fbf6a',5:'#9ad0ff',6:'#b0b0b0',7:'#b9a2d8',8:'#5fb6e8',9:'#a9c46a',10:'#555b66'};
const HALO='style="paint-order:stroke;stroke:#10151f;stroke-width:3px;stroke-linejoin:round"';
const SMAP_NAME={1:'город',2:'село',3:'лес',5:'мост',7:'серпантин',8:'у моря',10:'тоннель'};
let SMAP=null;   // {key,vq,html}|{key,vq,wait:1}
function smapVref(s,rc){let v=0;try{v=carStats(aiCarMd(rc.y),aiPrep(rc),rc.y).vmax;}catch(_){}
  try{((typeof RS!=='undefined'&&RS&&RS.entries)||[]).forEach(e=>{const md=s.models.find(m=>m.id===e.car);if(md)v=Math.max(v,carStats(md,e.prep,rc.y).vmax);});}catch(_){}
  return v||30;}
// схема по готовой трассе
function smapSVG(T){const P=T.pts,n=T.n,cl=!!T.closed,W=320,pad=14;let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9,y0=1e9,y1=-1e9;
  for(let i=0;i<n;i++){const p=P[i];x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[2]);z1=Math.max(z1,p[2]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);}
  const sx=x1-x0||1,sz=z1-z0||1,k=Math.min((W-2*pad)/sx,(W-2*pad)/sz),H=Math.max(120,Math.round(sz*k+2*pad)),ox=(W-sx*k)/2,oz=(H-sz*k)/2;
  const X=p=>(ox+(p[0]-x0)*k),Y=p=>(H-oz-(p[2]-z0)*k),f=v=>v.toFixed(1);
  // линия — кусками одного цвета
  const S=T.segT||[],tun=T.tunAt||[],typ=i=>tun[i]?10:(S[i]||0);let path='',halo='M'+f(X(P[0]))+' '+f(Y(P[0]));for(let i=1;i<n;i++)halo+='L'+f(X(P[i]))+' '+f(Y(P[i]));if(cl)halo+='Z';
  let a=0;while(a<n-1){const t=typ(a);let b=a+1;while(b<n-1&&typ(b)===t)b++;let d='M'+f(X(P[a]))+' '+f(Y(P[a]));for(let i=a+1;i<=b;i++)d+='L'+f(X(P[i]))+' '+f(Y(P[i]));
    path+=`<path d="${d}" stroke="${SMAP_COL[t]||SMAP_COL[0]}" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"${t===10?' stroke-dasharray="2 3"':''}/>`;a=b;}
  if(cl)path+=`<path d="M${f(X(P[n-1]))} ${f(Y(P[n-1]))}L${f(X(P[0]))} ${f(Y(P[0]))}" stroke="${SMAP_COL[typ(n-1)]||SMAP_COL[0]}" stroke-width="3.2" fill="none"/>`;
  // стрелки направления
  let arr='';const stepA=Math.max(12,Math.round(n/9));for(let i=Math.round(stepA/2);i<n;i+=stepA){const p=P[i],q=P[Math.min(n-1,i+2)],ang=Math.atan2(-(q[2]-p[2]),q[0]-p[0])*180/Math.PI;
    arr+=`<path d="M-4 -3.4L4 0L-4 3.4Z" fill="#fff" stroke="#10151f" stroke-width=".6" transform="translate(${f(X(p))} ${f(Y(p))}) rotate(${f(ang)})"/>`;}
  // крутые повороты (радиус меньше 40 м): по одному значку на поворот
  let bends='',nb=0;for(let i=0;i<n;i++){if(!(Math.abs(T.K[i])>1/40))continue;let b=i,mx=i;while(b<n&&Math.abs(T.K[b])>1/40){if(Math.abs(T.K[b])>Math.abs(T.K[mx]))mx=b;b++;}nb++;
    bends+=`<circle cx="${f(X(P[mx]))}" cy="${f(Y(P[mx]))}" r="4.6" fill="none" stroke="#ffb14a" stroke-width="1.3"/>`;i=b+6;}
  // отметки пути (четверти) — у открытой трассы и у круга
  let marks='';const len=n*T.step;[0.25,0.5,0.75].forEach(q=>{const i=Math.round(n*q),p=P[Math.min(n-1,i)];const rt=X(p)>W-46;marks+=`<circle cx="${f(X(p))}" cy="${f(Y(p))}" r="2" fill="#10151f" stroke="#fff" stroke-width=".8"/><text x="${f(X(p)+(rt?-6:6))}" y="${f(Math.max(9,Y(p)-5))}" font-size="8" fill="#cfd6e4" text-anchor="${rt?'end':'start'}" ${HALO}>${(len*q/1000).toFixed(1).replace('.',',')} км</text>`;});
  const sI=T.startIdx||0,fI=cl?sI:(T.finishIdx||n-1),ps=P[sI],pf=P[Math.min(n-1,fI)];
  const flag=(p,txt,col,dn)=>{const rt=X(p)>W*0.55,yy=Y(p)+(dn?14:-9);return `<circle cx="${f(X(p))}" cy="${f(Y(p))}" r="4.4" fill="${col}" stroke="#10151f" stroke-width="1"/><text x="${f(X(p)+(rt?-2:2))}" y="${f(clamp(yy,10,H-4))}" font-size="9" font-weight="700" fill="${col}" text-anchor="${rt?'end':'start'}" ${HALO}>${txt}</text>`;};
  const map=`<svg class="smap" viewBox="0 0 ${W} ${H}" role="img" aria-label="Схема трассы"><rect width="${W}" height="${H}" rx="6" fill="#10151f"/><path d="${halo}" stroke="#000" stroke-opacity=".55" stroke-width="6.5" fill="none" stroke-linejoin="round"/>${path}${bends}${arr}${marks}${cl?flag(ps,'СТАРТ / ФИНИШ','#ffd66b',Y(ps)<24):flag(ps,'СТАРТ','#7bd88f',Y(ps)<24)+flag(pf,'ФИНИШ','#ffd66b',Y(pf)<24||Math.abs(Y(pf)-Y(ps))<14&&Math.abs(X(pf)-X(ps))<60)}</svg>`;
  // профиль высот
  const PH=46,dy=Math.max(4,y1-y0);let pr='M0 '+PH;for(let i=0;i<n;i+=Math.max(1,Math.floor(n/160))){pr+='L'+f(i/(n-1)*W)+' '+f(PH-4-(P[i][1]-y0)/dy*(PH-10));}pr+='L'+W+' '+PH+'Z';
  let up=0;for(let i=1;i<n;i++)up+=Math.max(0,P[i][1]-P[i-1][1]);
  const prof=`<svg class="smap" viewBox="0 0 ${W} ${PH}" role="img" aria-label="Профиль высот" style="margin-top:4px"><rect width="${W}" height="${PH}" rx="6" fill="#10151f"/><path d="${pr}" fill="#3d5f8a" fill-opacity=".7" stroke="#8fc0ff" stroke-width="1"/><text x="6" y="11" font-size="8" fill="#cfd6e4" ${HALO}>профиль: перепад ${Math.round(y1-y0)} м, набор за ${cl?'круг':'заезд'} ${Math.round(up)} м</text></svg>`;
  // какие участки есть
  const seen={};for(let i=0;i<n;i++)seen[typ(i)]=(seen[typ(i)]||0)+1;const leg=Object.keys(SMAP_NAME).filter(t=>seen[t]>2).map(t=>`<span style="white-space:nowrap"><i style="display:inline-block;width:10px;height:4px;border-radius:2px;background:${SMAP_COL[t]};vertical-align:middle;margin-right:4px"></i>${SMAP_NAME[t]}</span>`).join(' · ');
  const laps=cl?(T.cfg.laps||1):1,notes=T.real&&typeof realNotes==='function'?realNotes(T):[];
  return {n:nb,html:`${map}${prof}
    <p class="small" style="margin-top:6px">${cl?`Круг ${(len/1000).toFixed(1).replace('.',',')} км × ${laps} ${plural(laps,'круг','круга','кругов')}`:`Заезд ${(len/1000).toFixed(1).replace('.',',')} км`} · крутых поворотов <b>${nb}</b>${cl?' на круге':''} <span class="muted">(кружки на схеме)</span>${T.tunnels&&T.tunnels.length?' · тоннель':''}${T.real?' · трасса по настоящей карте':''}</p>
    ${leg?`<p class="small muted" style="margin-top:2px">${leg} · стрелки — направление</p>`:'<p class="small muted" style="margin-top:2px">Стрелки — направление.</p>'}
    ${notes.length?`<p class="small muted" style="margin-top:2px">${notes.map(q=>`${String(q.km).replace('.',',')} км — ${esc(q.t)}`).join(' · ')}</p>`:''}`};}
function smapBuild(s,rc,vq){const T=buildTrack(rc,vq);return smapSVG(T).html;}
// блок для окна настройки: готовая схема из памяти или заглушка, которая заполнится, когда трасса построится
function raceSetupMapHTML(s,rc){if(!rc||rc.dx)return '';const vq=Math.round(smapVref(s,rc)),head='<div class="label" style="margin-top:12px">Карта трассы</div>';
  if(SMAP&&SMAP.key===rc.key&&SMAP.vq===vq&&SMAP.html)return `${head}<div id="smapBox">${SMAP.html}</div>`;
  if(!(SMAP&&SMAP.key===rc.key&&SMAP.vq===vq&&SMAP.wait)){SMAP={key:rc.key,vq,wait:1};const job=SMAP,go=()=>{if(SMAP!==job)return;let h='';try{h=smapBuild(s,rc,vq);}catch(e){console.warn('smap',e);h='<p class="small muted">Схему трассы построить не удалось.</p>';}
      SMAP={key:rc.key,vq,html:h};try{const b=document.getElementById('smapBox');if(b&&b.dataset&&b.dataset.k===rc.key)b.innerHTML=h;}catch(_){}};
    const run=()=>{try{if(typeof realLoad==='function')realLoad(rc,go);else go();}catch(_){go();}};
    if(typeof requestAnimationFrame==='function'&&typeof window!=='undefined'&&window.setTimeout)window.setTimeout(run,30);else run();}
  if(SMAP&&SMAP.key===rc.key&&SMAP.vq===vq&&SMAP.html)return `${head}<div id="smapBox">${SMAP.html}</div>`;   // построилась сразу
  return `${head}<div id="smapBox" data-k="${esc(rc.key)}"><p class="small muted" style="padding:18px 0">Строю схему трассы…</p></div>`;}
