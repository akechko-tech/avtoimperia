/* ================= РЕАЛЬНЫЕ ТРАССЫ (ТЗ 0.18, раздел 2): рельеф, реки, леса, города — по открытым картам ================= */
// Для гонок-эталонов трасса строится по настоящей местности: рельеф Copernicus DEM GLO-30, дороги, реки, леса, виноградники,
// города и железные дороги OpenStreetMap, цвет земли — Sentinel-2 (EOX). Данные готовит задание terrain в ветке media
// (tools/media/terrain.py): маршрут по старой схеме гонки — по дорогам, без автомагистралей; города ужаты к году гонки,
// железные дороги — только построенные к нему, водохранилищ, аэродромов и заводов нет. tools/sync_media.py кладёт результат
// в docs/terrain/<id>.js; перед гонкой файл подгружается скриптом (в APK со страницы file:// тоже работает).
// Нет файла (или старый браузер) — прежний генератор сценариев.
const REAL_RACES={pm1903:{},targa:{},gpacf:{years:[1906]},gb1903:{},indy:{}};
window.REAL_TRACKS=window.REAL_TRACKS||{};
function realIdOf(rc){if(!rc)return null;const R=REAL_RACES[rc.id];if(!R||(R.years&&!R.years.includes(rc.y)))return null;return rc.id;}
function realData(rc){const id=realIdOf(rc);return id?window.REAL_TRACKS[id]||null:null;}
// подгрузить данные трассы до постройки (не дольше 4 с)
function realLoad(rc,cb){const id=realIdOf(rc);if(!id||window.REAL_TRACKS[id]||typeof document==='undefined'||!document.head||!document.head.appendChild){cb();return;}
  let done=false;const fin=()=>{if(done)return;done=true;cb();};
  try{const s=document.createElement('script');s.src='terrain/'+id+'.js';s.onload=fin;s.onerror=fin;document.head.appendChild(s);}catch(_){fin();return;}
  setTimeout(fin,4000);}
// сетка высот: по строкам — первое значение int16, дальше приращения int8 (метры)
function realGridH(G){if(G.H)return G.H;const b=atob(G.h),H=new Float32Array(G.nx*G.nz);let o=0;
  for(let j=0;j<G.nz;j++){let v=b.charCodeAt(o)|(b.charCodeAt(o+1)<<8);if(v>=32768)v-=65536;o+=2;H[j*G.nx]=v;
    for(let k=1;k<G.nx;k++){let d=b.charCodeAt(o++);if(d>=128)d-=256;v+=d;H[j*G.nx+k]=v;}}
  G.H=H;return H;}
function realGridC(G){if(G.C)return G.C;const C=new Uint8Array(G.nx*G.nz);if(G.cover)G.cover.forEach((row,j)=>{let k=0;for(let a=0;a<row.length;a+=2){C.fill(row[a],j*G.nx+k,j*G.nx+k+row[a+1]);k+=row[a+1];}});G.C=C;return C;}
// высота земли (метры над стартом трассы) в точке игры; вне сетки — край сетки
function realGridAt(G,x,z,dx,dz,dy){const H=realGridH(G),fx=clamp((x+dx-G.x0)/G.S,0,G.nx-1.001),fz=clamp((z+dz-G.z0)/G.S,0,G.nz-1.001),k=Math.floor(fx),j=Math.floor(fz),u=fx-k,v=fz-j,q=j*G.nx+k;
  return (H[q]*(1-u)+H[q+1]*u)*(1-v)+(H[q+G.nx]*(1-u)+H[q+G.nx+1]*u)*v-dy;}
function realH(T,x,z){const R=T.real,D=R.d;return realGridAt(D.near,x,z,R.dx,R.dz,R.dy);}
function realFarH(T,x,z){const R=T.real,D=R.d,G=D.far,X1=G.x0+(G.nx-1)*G.S-R.dx,Z1=G.z0+(G.nz-1)*G.S-R.dz;
  if(x<G.x0-R.dx||z<G.z0-R.dz||x>X1||z>Z1)return null;return realGridAt(G,x,z,R.dx,R.dz,R.dy);}
function realCover(T,x,z){const R=T.real,G=R.d.near,k=Math.round((x+R.dx-G.x0)/G.S),j=Math.round((z+R.dz-G.z0)/G.S);if(k<0||j<0||k>=G.nx||j>=G.nz)return 0;return realGridC(G)[j*G.nx+k];}
// Кусок маршрута под длину заезда: там, где больше примет (мост, переезд, город, берег, подъём)
const REAL_TY=['fields','town','village','forest','avenue','bridge','rail','serp','coast','vine'];
function realWindow(D,len){const n8=D.pts.length,w=Math.min(n8,Math.round(len/D.step)+1);if(D.closed||w>=n8)return [0,n8];
  // очки куска: мост, переезд, въезд в город — штучно; серпантин и берег — за каждый метр (самое красивое — ехать)
  const sc=new Float32Array(n8);(D.bridges||[]).forEach(b=>sc[b.i]+=4);(D.rails||[]).forEach(r=>sc[r.i]+=2.5);(D.coast||[]).forEach(c=>{for(let k=c.i0;k<=c.i1;k++)sc[k]+=0.02;});
  (D.seg||[]).forEach(s=>{if(s[0]===1)sc[s[1]]+=1.5;if(s[0]===7)for(let k=s[1];k<=s[2];k++)sc[k]+=0.03;if(s[0]===3)for(let k=s[1];k<=s[2];k++)sc[k]+=0.002;});(D.notes||[]).forEach(q=>{if(q.t==='climb'||q.t==='descent')sc[q.i]+=1;});
  let best=0,bi=0;for(let a=0;a+w<=n8;a+=6){let s=0;for(let k=a+8;k<a+w-6;k++)s+=sc[k];s-=a*0.0004;if(s>best+1e-6){best=s;bi=a;}}return [bi,bi+w];}
// Точки трассы игры (шаг 4 м) по реальному маршруту (шаг 8 м); начало куска — в нуле
function realPoints(D,cfg){const n8=D.pts.length,len=D.closed?D.pts.length*D.step:cfg.len;const [a,b]=realWindow(D,len),P=D.pts,p0=P[a];
  const out=[],dx=p0[0]/10,dz=p0[1]/10,dy=p0[2]/10;
  for(let k=a;k<b;k++){const p=P[k],q=P[D.closed?(k+1)%n8:Math.min(n8-1,k+1)];const x=p[0]/10-dx,z=p[1]/10-dz,y=p[2]/10-dy;out.push([x,y,z]);
    if(k<b-1||D.closed)out.push([(x+q[0]/10-dx)/2,(y+q[2]/10-dy)/2,(z+q[1]/10-dz)/2]);}
  return {pts:out,a,b,dx:dx,dz:dz,dy:dy+D.y0};}
// Сценарий по настоящей карте: города с именами, мосты через настоящие реки, переезды, берег, леса и виноградники
function realPlan(trk){const R=trk.real,D=R.d,S=trk.segT,list=trk.seg,n=trk.n,a=R.a,rnd=mulberry32(hashStr('real|'+D.id));
  const map=i8=>{const i=(i8-a)*2;return D.closed?((i%n)+n)%n:i;},inW=i=>i>=0&&i<n;
  const TY={0:RSEG.fields,1:RSEG.town,2:RSEG.village,3:RSEG.forest,4:RSEG.avenue,5:RSEG.bridge,6:RSEG.rail,7:RSEG.serp,8:RSEG.coast,9:RSEG.vine};
  const put=(type,i0,i1,extra)=>{i0=clamp(i0,0,n-1);i1=clamp(i1,0,n-1);if(i1<i0)return null;for(let i=i0;i<=i1;i++)S[i]=type;const o=Object.assign({type,i0,i1,i:Math.round((i0+i1)/2)},extra||{});list.push(o);return o;};
  (D.seg||[]).forEach(e=>{const t=TY[e[0]];if(t===undefined||t===RSEG.bridge||t===RSEG.rail||t===RSEG.coast)return;const i0=map(e[1]),i1=map(e[2]);if(i1<0||i0>=n)return;
    let cap;if(t===RSEG.town)cap=e[3]?`${e[3]}: узкая улица, мостовая, зрители у домов`:null;else if(t===RSEG.village)cap=e[3]?`${e[3]}: деревня у дороги`:undefined;
    // во Франции старые национальные дороги — аллеи платанов: часть полей — аллеи
    if(t===RSEG.fields&&trk.cfg.host==='fr'&&i1-i0>120){let i=i0;while(i<i1){const L=60+Math.floor(rnd()*90),use=rnd()<0.45;put(use?RSEG.avenue:RSEG.fields,i,Math.min(i1,i+L-1));i+=L;}return;}
    put(t,Math.max(0,i0),Math.min(n-1,i1),cap===undefined?{}:{cap});});
  (D.bridges||[]).forEach(b=>{const i=map(b.i);if(!inW(i)||i<6||i>n-6)return;const span=Math.max(9,Math.min(24,(b.i1-b.i0+2)));const nm=b.name&&b.name!=='—'?b.name:'';
    put(RSEG.bridge,i-span,i+span,{cap:nm?`Мост через реку ${nm}`:'Мост через реку',alt:34,w:3});for(let q=i-span;q<=i+span;q++)if(inW(q))trk.bridge[q]=1;
    trk.rivers.push({i,w:14+rnd()*10,d:4.5+rnd()*2,ph:rnd()*6.28,name:nm||'реку'});});
  (D.rails||[]).forEach(r=>{const i=map(r.i);if(!inW(i)||i<8||i>n-8)return;put(RSEG.rail,i-6,i+6,{cap:r.name?`Переезд: ${r.name}`:'Железнодорожный переезд: смотрите на шлагбаум',alt:26,w:2});trk.rails.push({i,ang:clamp(r.ang||0,-0.6,0.6)});});
  (D.coast||[]).forEach(c=>{const i0=map(c.i0),i1=map(c.i1);if(i1<0||i0>=n)return;put(RSEG.coast,Math.max(0,i0),Math.min(n-1,i1),{cap:'Дорога вдоль моря',alt:40,w:4,side:c.side});trk.coast.push({i0:Math.max(0,i0),i1:Math.min(n-1,i1),side:c.side,sea:-R.dy-1.2});});
  // серпантин из данных (два крутых поворота и уклон) — горный, со скалой и обрывом, только среди гор (перепад рельефа вокруг ≥ 60 м, Мадоние);
  // в мягких холмах (Сарта) это просто подъём или спуск с поворотами — без скал и тумб
  list.forEach(o=>{if(o.type!==RSEG.serp)return;const m=trk.pts[o.i];let lo=1e9,hi=-1e9;for(let u=-4;u<=4;u++)for(let v=-4;v<=4;v++){const h=realH(trk,m[0]+u*50,m[2]+v*50);if(h<lo)lo=h;if(h>hi)hi=h;}
    if(hi-lo>=60)return;o.type=RSEG.fields;for(let i=o.i0;i<=o.i1;i++)S[i]=RSEG.fields;o.cap=(trk.pts[o.i1][1]>=trk.pts[o.i0][1]?'Подъём':'Спуск')+' с поворотами: тормозите до поворота';});
  // старт и финиш дорожной гонки — там, где они на карте (город, если он есть)
  list.forEach(o=>{if(o.cap===undefined)o.cap=o.type===RSEG.serp?'Серпантин: скала с одной стороны, обрыв — с другой':o.type===RSEG.forest&&o.i1-o.i0>90?'Лесная дорога: тень и корни':o.type===RSEG.avenue?'Аллея платанов: деревья у самой дороги':o.type===RSEG.vine?'Виноградники по склонам':null;});}
// Приметы для заставки: что впереди на этом куске настоящей карты
function realNotes(trk){const R=trk.real,D=R.d,n=trk.n,out=[],map=i8=>(i8-R.a)*2;
  (D.notes||[]).forEach(q=>{const i=map(q.i);if(i<0||i>=n)return;const km=Math.max(0,Math.round((i-trk.startIdx)*trk.step/100)/10);
    const t=q.t==='town'?`${q.n} — город на пути`:q.t==='bridge'?`мост через реку ${q.n&&q.n!=='—'?q.n:''}`.trim():q.t==='rail'?'железнодорожный переезд':q.t==='coast'?'дорога вдоль моря':q.t==='climb'?`подъём на ${q.m} м`:q.t==='descent'?`спуск на ${q.m} м`:'';
    if(t)out.push({km,t});});
  return out.slice(0,5);}
// Карта для заставки: стилизация под карту эпохи — сепия, штриховка рек, города кружками, маршрут гонки красным
function realMapSVG(trk){const D=trk.real.d,M=D.map;if(!M||!M.route||M.route.length<2)return '';
  const [s,w]=M.bbox[0],[nn,e]=M.bbox[1],W=300,Hh=Math.round(W*((nn-s)*110.5)/Math.max(0.1,((e-w)*111.3*Math.cos(s*Math.PI/180))));const H=clamp(Hh,150,300);
  const X=lo=>((lo-w)/(e-w)*W).toFixed(1),Y=la=>((nn-la)/(nn-s)*H).toFixed(1),line=P=>P.map((p,i)=>(i?'L':'M')+X(p[1])+' '+Y(p[0])).join('');
  // кусок гонки на этой карте — по точкам окна
  const a=trk.real.a,b=trk.real.b,pr=D.pts,ll=p=>{const k=D.ll0;return [k[0]+p[1]/10/110540,k[1]+p[0]/10/(Math.cos(k[0]*Math.PI/180)*111320)];},seg=[];for(let k=a;k<b;k+=6)seg.push(ll(pr[k]));seg.push(ll(pr[b-1]));
  const rv=(M.rivers||[]).map(r=>`<path d="${line(r.p)}" stroke="#5f7f9c" stroke-width="1.6" fill="none" opacity=".85"/>`).join('');
  const rl=(M.rails||[]).map(r=>`<path d="${line(r)}" stroke="#3b3024" stroke-width="1.2" fill="none" stroke-dasharray="4 2"/>`).join('');
  const cs=(M.coast||[]).map(r=>`<path d="${line(r)}" stroke="#4f6f8c" stroke-width="2" fill="none"/>`).join('');
  const tw=(M.towns||[]).slice(0,12).map(t=>{const big=t.pl==='city'||t.pl==='town';return `<g><circle cx="${X(t.ll[1])}" cy="${Y(t.ll[0])}" r="${big?4:2.4}" fill="${big?'#7a2e1f':'#5a4a36'}"/><text x="${+X(t.ll[1])+5}" y="${+Y(t.ll[0])-4}" font-size="${big?10:8}" fill="#2e2418" font-family="Georgia,serif" font-style="${big?'normal':'italic'}">${esc(t.n)}</text></g>`;}).join('');
  return `<svg class="rf-map" viewBox="0 0 ${W} ${H}" role="img" aria-label="Карта трассы"><rect width="${W}" height="${H}" fill="#e9dcc0"/><rect x="3" y="3" width="${W-6}" height="${H-6}" fill="none" stroke="#6b5a40" stroke-width="1"/>${cs}${rv}${rl}
    <path d="${line(M.route)}" stroke="#8a6f4a" stroke-width="2" fill="none" opacity=".55"/><path d="${line(seg)}" stroke="#b3261e" stroke-width="3.2" fill="none" stroke-linecap="round"/>
    <circle cx="${X(seg[0][1])}" cy="${Y(seg[0][0])}" r="4" fill="#fff" stroke="#b3261e" stroke-width="2"/>${tw}
    <text x="${W-8}" y="${H-8}" text-anchor="end" font-size="7" fill="#6b5a40" font-family="Georgia,serif">© OpenStreetMap · Copernicus DEM</text></svg>`;}
