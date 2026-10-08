/* ================= РЕАЛЬНЫЕ ТРАССЫ (ТЗ 0.18, раздел 2): рельеф, реки, леса, города — по открытым картам ================= */
// Для гонок-эталонов трасса строится по настоящей местности: рельеф Copernicus DEM GLO-30, дороги, реки, леса, виноградники,
// города и железные дороги OpenStreetMap, цвет земли — Sentinel-2 (EOX). Данные готовит задание terrain в ветке media
// (tools/media/terrain.py): маршрут по старой схеме гонки — по дорогам, без автомагистралей; города ужаты к году гонки,
// железные дороги — только построенные к нему, водохранилищ, аэродромов и заводов нет. tools/sync_media.py кладёт результат
// в docs/terrain/<id>.js; перед гонкой файл подгружается скриптом (в APK со страницы file:// тоже работает).
// Нет файла (или старый браузер) — прежний генератор сценариев.
// 0.22: гонка → файл данных трассы (terrain/<id>.js): d — один на все годы, v — по годам (Гран-при Франции переезжал из города в город)
const REAL_RACES={pm1903:{},targa:{},gb1903:{},indy:{},
  gpacf:{v:{1906:'gpacf',1907:'dieppe',1908:'dieppe',1913:'amiens',1922:'strasbourg',1923:'tours',1925:'montlhery',1926:'miramas',1927:'montlhery',1928:'comminges',1929:'sarthe'}},
  x80901:{d:'spb_tver'},x87575:{d:'spb_valdai'},pmp:{d:'avignon'},pbp:{d:'chartres'},brighton:{d:'brighton'},turbie:{d:'turbie'},semmering:{d:'semmering'},
  ventoux:{d:'ventoux'},x2844:{d:'tsarskoe'},x17567:{d:'krasnoe'},peking:{d:'nankou'},henry:{d:'rhine'},spa24:{d:'spa'},x80394:{d:'spa'},
  eifel:{d:'nurb'},nurb1927:{d:'nurb'},degp:{d:'nurb'},avus1926:{d:'avus'},
  // 0.22: все остальные гонки — по своим настоящим местам
  chicago:{d:'evanston'},pap:{d:'amstel'},tdf:{d:'aix'},thousand:{d:'shap'},gb1900:{d:'tarare'},pb1901:{d:'potsdam'},pv1902:{d:'arlberg'},ardennes:{d:'bastogne'},
  ormond:{d:'daytona'},daytona1927:{d:'daytona'},gb1904:{d:'saalburg'},kaiser:{d:'saalburg'},vanderbilt:{d:'jericho'},herkomer:{d:'kesselberg'},shelsley:{d:'shelsley'},
  gb1905:{d:'auvergne'},glidden:{d:'crawford'},tt:{v:{1905:'iom',1906:'iom',1907:'iom',1908:'iom',1914:'iom',1922:'iom',1928:'ards',1929:'ards'}},
  dieppe:{d:'dieppe'},x38020:{d:'sarthe'},x13597:{d:'sarthe'},lm1921:{d:'sarthe'},lemans:{d:'sarthe'},lyon1914:{d:'lyon'},europe1924:{d:'lyon'},
  brooklands:{d:'brooklands'},jcc200:{d:'brooklands'},x59677:{d:'brooklands'},bgp1926:{d:'brooklands'},x30443:{d:'brooklands'},x79977:{d:'brooklands'},
  x24910:{v:{1907:'montichiari',1908:'bologna',1914:'targa',1922:'targa',1927:'targa'}},x69903:{d:'montichiari'},brescia:{d:'montichiari'},x15626:{d:'montichiari'},
  nyparis:{d:'hudson'},savannah:{d:'savannah'},santamonica:{d:'santamonica'},alpen:{d:'katschberg'},elgin:{d:'elgin'},
  x30184:{v:{1910:'savannah',1911:'savannah',1912:'milwaukee',1914:'santamonica',1915:'sf1915',1916:'santamonica'}},x51007:{d:'corniche'},
  x87929:{v:{1913:'guadarrama',1923:'terramar',1926:'lasarte',1927:'lasarte',1929:'lasarte'}},x79680:{d:'lasarte'},x81442:{d:'lasarte'},
  x49337:{d:'maywood'},x73534:{d:'maywood'},x20757:{d:'sheepshead'},x60423:{d:'sheepshead'},x55729:{d:'sharonville'},x57075:{d:'uniontown'},
  x78542:{d:'beverly'},board1:{d:'beverly'},board0:{d:'amatol'},pikes:{d:'pikes'},x44688:{d:'giogo'},mille:{d:'futa'},klausen:{d:'klausen'},
  monza1922:{d:'monza'},itgp:{d:'monza'},x6663:{d:'monza'},x95919:{d:'savio'},acerbo1924:{d:'pescara'},acerbo:{d:'pescara'},x42022:{d:'roma'},
  x18018:{d:'gueux'},x38768:{d:'tripoli'},monaco:{d:'monaco'},x22765:{d:'phoenix'}};
// 0.22: природа и постройки — по стране места (Тверь — Россия, Наньков — Китай, Амстел — Нидерланды)
const REAL_SCEN={ru:'ru',cn:'cn',nl:'nl',us:'us',uk:'uk',ie:'ie',it:'it',de:'de',at:'at',ch:'ch',es:'es',be:'be',mc:'mc',ly:'ly',fr:'fr'};
window.REAL_TRACKS=window.REAL_TRACKS||{};
function realIdOf(rc){if(!rc)return null;const R=REAL_RACES[rc.id];if(!R)return null;if(R.v)return R.v[rc.y]||null;if(R.years&&!R.years.includes(rc.y))return null;return R.d||rc.id;}
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
// 0.23: настоящая вода. В рельефе Copernicus море, бухты и приливные устья — ровно 0 м, польдеры — ниже нуля, пляж и поля у моря — 1–3 м.
// Вода — связные куски «нуля» с ядром (клетка и все соседи — ноль) у береговой линии OSM, или почти целиком под водой по карте
// (реки и озёра на уровне моря). Поля на нуле вдали от берега (Равенна) — суша. Сетка 50 м у дороги, 250 м — до горизонта.
function realWaterMask(D,G,far,nearM){const H=realGridH(G),nx=G.nx,nz=G.nz,N=nx*nz,S=G.S,zero=new Uint8Array(N);let any=0;
  for(let q=0;q<N;q++)if(H[q]===0){zero[q]=1;any=1;}const M=new Uint8Array(N);if(!any)return M;
  // клетки у береговой линии (линии карты — в широте и долготе)
  const k0=D.ll0,KY=110540,KX=Math.cos(k0[0]*Math.PI/180)*111320,near=new Uint8Array(N),rc=Math.ceil((far?450:260)/S);
  ((D.map&&D.map.coast)||[]).forEach(L=>{for(let a=0;a+1<L.length;a++){const p=L[a],b=L[a+1],x0=(p[1]-k0[1])*KX,z0=(p[0]-k0[0])*KY,x1=(b[1]-k0[1])*KX,z1=(b[0]-k0[0])*KY,m=Math.max(1,Math.ceil(Math.hypot(x1-x0,z1-z0)/(S*0.5)));
    for(let t=0;t<=m;t++){const ck=Math.round((x0+(x1-x0)*t/m-G.x0)/S),cj=Math.round((z0+(z1-z0)*t/m-G.z0)/S);
      for(let j=Math.max(0,cj-rc);j<=Math.min(nz-1,cj+rc);j++)for(let k=Math.max(0,ck-rc);k<=Math.min(nx-1,ck+rc);k++)if((k-ck)*(k-ck)+(j-cj)*(j-cj)<=rc*rc)near[j*nx+k]=1;}}});
  const C=!far&&G.cover?realGridC(G):null,seen=new Uint8Array(N),Q=new Int32Array(N),NG=far&&nearM?D.near:null;
  for(let s=0;s<N;s++){if(!zero[s]||seen[s])continue;let qh=0,qt=0,coast=0,w3=0,core=0,link=0;Q[qt++]=s;seen[s]=1;
    while(qh<qt){const q=Q[qh++],k=q%nx,j=(q/nx)|0;if(near[q])coast=1;if(C&&C[q]===3)w3++;
      if(!core&&k>0&&k<nx-1&&j>0&&j<nz-1&&zero[q-1]&&zero[q+1]&&zero[q-nx]&&zero[q+nx]&&zero[q-nx-1]&&zero[q-nx+1]&&zero[q+nx-1]&&zero[q+nx+1])core=1;
      // дальняя сетка: кусок, который у дороги уже признан водой (устье реки за краем подробной карты)
      if(NG&&!link){const kk=Math.round((G.x0+k*S-NG.x0)/NG.S),jj=Math.round((G.z0+j*S-NG.z0)/NG.S);if(kk>=0&&jj>=0&&kk<NG.nx&&jj<NG.nz&&nearM[jj*NG.nx+kk])link=1;}
      if(k>0&&zero[q-1]&&!seen[q-1]){seen[q-1]=1;Q[qt++]=q-1;}if(k<nx-1&&zero[q+1]&&!seen[q+1]){seen[q+1]=1;Q[qt++]=q+1;}
      if(j>0&&zero[q-nx]&&!seen[q-nx]){seen[q-nx]=1;Q[qt++]=q-nx;}if(j<nz-1&&zero[q+nx]&&!seen[q+nx]){seen[q+nx]=1;Q[qt++]=q+nx;}}
    if(!core||qt<(far?3:24))continue;
    if(coast||link){for(let a=0;a<qt;a++)M[Q[a]]=1;continue;}
    // река или озеро у моря: вода — только по карте (и клетка вокруг)
    if(C&&w3>=qt*0.25)for(let a=0;a<qt;a++){const q=Q[a],k=q%nx,j=(q/nx)|0;let w=0;
      for(let dj=-1;dj<=1&&!w;dj++)for(let dk=-1;dk<=1;dk++){const kk=k+dk,jj=j+dj;if(kk>=0&&jj>=0&&kk<nx&&jj<nz&&C[jj*nx+kk]===3){w=1;break;}}if(w)M[q]=1;}}
  return M;}
// Вода трассы (один раз на постройку): маски 50 и 250 м и уровень глади в координатах игры. Пляжные гонки (Дейтона) — со своим морем
function realWaterOf(trk){const R=trk.real;if(!R||trk.cfg.terr==='beach'||trk.cfg.sprint)return null;const D=R.d;if(!D.near||!D.far)return null;
  const key='_wm';if(!D[key]){const Mn=realWaterMask(D,D.near,false,null),Mf=realWaterMask(D,D.far,true,Mn);let n=0;for(const v of Mn)n+=v;for(const v of Mf)n+=v;D[key]=n?{near:Mn,far:Mf}:{none:1};}
  const W=D[key];if(W.none)return null;return {near:W.near,far:W.far,y:-R.dy+0.3};}
// Доля воды в точке игры (0…1): у дороги — по сетке 50 м (плавно между клетками), дальше — 250 м
function realWet(T,x,z){const R=T.real,W=R&&R.wm;if(!W)return 0;const D=R.d;
  for(const [G,M] of [[D.near,W.near],[D.far,W.far]]){const fx=(x+R.dx-G.x0)/G.S,fz=(z+R.dz-G.z0)/G.S;if(fx<0||fz<0||fx>G.nx-1||fz>G.nz-1)continue;
    const k=Math.min(G.nx-2,Math.floor(fx)),j=Math.min(G.nz-2,Math.floor(fz)),u=fx-k,v=fz-j,q=j*G.nx+k;
    return (M[q]*(1-u)+M[q+1]*u)*(1-v)+(M[q+G.nx]*(1-u)+M[q+G.nx+1]*u)*v;}
  return 0;}
// Рельеф вдали: в пределах сетки 50 м — по ней (берег точнее), дальше — 250 м
function realFarH2(T,x,z){const R=T.real,G=R.d.near,fx=(x+R.dx-G.x0)/G.S,fz=(z+R.dz-G.z0)/G.S;
  if(fx>=0&&fz>=0&&fx<=G.nx-1&&fz<=G.nz-1)return realGridAt(G,x,z,R.dx,R.dz,R.dy);return realFarH(T,x,z);}
// Кусок маршрута под длину заезда: там, где больше примет (мост, переезд, город, берег, подъём)
const REAL_TY=['fields','town','village','forest','avenue','bridge','rail','serp','coast','vine'];
function realWindow(D,len){const n8=D.pts.length,w=Math.min(n8,Math.round(len/D.step)+1);if(D.closed||w>=n8)return [0,n8];
  // очки куска: мост, переезд, въезд в город — штучно; серпантин и берег — за каждый метр (самое красивое — ехать)
  const sc=new Float32Array(n8);(D.bridges||[]).forEach(b=>sc[b.i]+=4);(D.rails||[]).forEach(r=>sc[r.i]+=2.5);(D.coast||[]).forEach(c=>{for(let k=c.i0;k<=c.i1;k++)sc[k]+=0.02;});
  (D.seg||[]).forEach(s=>{if(s[0]===1)sc[s[1]]+=1.5;if(s[0]===7)for(let k=s[1];k<=s[2];k++)sc[k]+=0.03;if(s[0]===3)for(let k=s[1];k<=s[2];k++)sc[k]+=0.002;});(D.notes||[]).forEach(q=>{if(q.t==='climb'||q.t==='descent')sc[q.i]+=1;});
  let best=0,bi=0;for(let a=0;a+w<=n8;a+=6){let s=0;for(let k=a+8;k<a+w-6;k++)s+=sc[k];s-=a*0.0004;if(s>best+1e-6){best=s;bi=a;}}return [bi,bi+w];}
// Точки трассы игры (шаг 4 м) по реальному маршруту (шаг 8 м); начало куска — в нуле
// 0.28: точки — ровно через 4 м по длине пути. В тугих шпильках (Ла-Тюрби, Мон-Ванту, Монако) соседние точки данных
// стоят ближе 8 м (после скругления поворотов), а подъём между ними прежний — выходила «стена» в 90–117%: машина
// упиралась, камера уходила в склон. Теперь шаг ровный, а продольный уклон не круче 15% (ступень растекается по соседям).
function realPoints(D,cfg){const n8=D.pts.length,len=D.closed?D.pts.length*D.step:cfg.len;const [a,b]=realWindow(D,len),P=D.pts,p0=P[a];
  const dx=p0[0]/10,dz=p0[1]/10,dy=p0[2]/10,src=[],ST=4;
  for(let k=a;k<b;k++){const p=P[k];src.push([p[0]/10-dx,p[2]/10-dy,p[1]/10-dz]);}
  if(D.closed){const p=P[b%n8];src.push([p[0]/10-dx,p[2]/10-dy,p[1]/10-dz]);}
  const cum=[0];for(let k=1;k<src.length;k++)cum.push(cum[k-1]+Math.hypot(src[k][0]-src[k-1][0],src[k][2]-src[k-1][2]));
  const L=cum[cum.length-1]||ST,n=D.closed?Math.max(8,Math.round(L/ST)):Math.max(2,Math.floor(L/ST)+1),ds=D.closed?L/n:ST,out=[];
  let j=0;for(let i=0;i<n;i++){const sd=i*ds;while(j<src.length-2&&cum[j+1]<sd)j++;const A=src[j],B=src[Math.min(src.length-1,j+1)],t=clamp((sd-cum[j])/((cum[j+1]-cum[j])||1),0,1);
    out.push([A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t]);}
  // номер точки игры для каждой точки данных: мосты, сёла, переезды и подсказки привязаны к номерам данных
  const map=new Int32Array(b-a);for(let k=0;k<b-a;k++)map[k]=Math.min(n-1,Math.round(cum[k]/ds));
  realGrade(out,!!D.closed,ds);
  return {pts:out,a,b,dx:dx,dz:dz,dy:dy+D.y0,map,ds};}
// Продольный уклон не круче 15% (Шелсли-Уолш — 1 к 6): ступень в профиле растекается по соседним точкам, общий подъём тот же
function realGrade(P,closed,ds){const n=P.length,lim=0.15*ds;if(n<3)return;
  const relax=()=>{for(let it=0;it<800;it++){let ch=0;const m=closed?n:n-1;
    for(let i=0;i<m;i++){const k=(i+1)%n,d=P[k][1]-P[i][1];if(Math.abs(d)>lim+1e-4){const e=(Math.abs(d)-lim)*0.5*Math.sign(d);P[i][1]+=e;P[k][1]-=e;ch++;}}
    if(!ch)break;}};
  relax();const y=P.map(p=>p[1]);for(let r=0;r<2;r++){for(let i=0;i<n;i++){const u=closed?y[(i-1+n)%n]:y[Math.max(0,i-1)],w=closed?y[(i+1)%n]:y[Math.min(n-1,i+1)];P[i][1]=(u+2*y[i]+w)/4;}for(let i=0;i<n;i++)y[i]=P[i][1];}
  relax();}
// Номер точки игры по номеру точки данных (за краем куска — по 2 точки на точку данных, как раньше)
function realIdx(R,i8,n){const M=R.map,a=R.a;if(!M){const i=(i8-a)*2;return R.d&&R.d.closed&&n?((i%n)+n)%n:i;}
  const k=i8-a;let i=k<0?k*2:k>=M.length?M[M.length-1]+(k-M.length+1)*2:M[k];if(R.d&&R.d.closed&&n)i=((i%n)+n)%n;return i;}
// Сценарий по настоящей карте: города с именами, мосты через настоящие реки, переезды, берег, леса и виноградники
function realPlan(trk){const R=trk.real,D=R.d,S=trk.segT,list=trk.seg,n=trk.n,a=R.a,rnd=mulberry32(hashStr('real|'+D.id));
  const map=i8=>realIdx(R,i8,n),inW=i=>i>=0&&i<n;
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
// 0.22: приметы настоящей карты (соборы, замки, дворцы, мельницы, маяки, стены…) — в координатах игры, с поворотом модели.
// Стены и акведуки, которые пересекают дорогу, режутся у полотна (дорога идёт сквозь ворота).
function realMarks(trk){const R=trk.real,D=R.d,P=trk.pts,n=trk.n,W=trk.W,host=trk.cfg.host,out=[];
  const near=(x,z)=>{let bi=0,bd=1e18;for(let k=0;k<n;k++){const d=(P[k][0]-x)**2+(P[k][2]-z)**2;if(d<bd){bd=d;bi=k;}}return [bi,Math.sqrt(bd)];};
  const add=(o,x,z)=>{const [i,d]=near(x,z);if(!o.line&&d>4200)return;const nn=trk.N[i],off=(x-P[i][0])*nn[0]+(z-P[i][2])*nn[1];
    let a=0;if(!o.line){const ux=Math.cos(o.r||0),uz=Math.sin(o.r||0);a=Math.atan2(ux,uz);
      // церковь — фасадом (башнями) на запад; дворец, вокзал, усадьба — фасадом к дороге
      if(['cathedral','church','chapel','monastery'].includes(o.k)){if(ux<0)a+=Math.PI;}
      else if(['palace','station','manor','castle','watermill','monument','statue'].includes(o.k)){const fx=Math.cos(a),fz=-Math.sin(a);if(fx*(P[i][0]-x)+fz*(P[i][2]-z)<0)a+=Math.PI;}}
    out.push({t:'rlm',lm:o,x,z,i,off,rot:a,r:Math.max(o.l||8,o.w||8)/2+2,world:1,name:lmName(o,host),far:d>2600});};
  (D.lm||[]).forEach(o0=>{const x0=o0.x-R.dx,z0=o0.z-R.dz;
    if(o0.line&&o0.line.length>1){// стену режем у дороги: куски дальше W/2+5 м от полотна
      const L=o0.line.map(p=>[p[0]-R.dx,p[1]-R.dz]),runs=[];let cur=[];
      for(let k=0;k<L.length;k++){const [x,z]=L[k];const nearRoad=typeof nearTrack==='function'&&nearTrack(trk,x,z,W/2+5);if(nearRoad){if(cur.length>1)runs.push(cur);cur=[];}else cur.push([x,z]);
        if(k+1<L.length){const [x2,z2]=L[k+1],seg=Math.hypot(x2-x,z2-z);if(seg>12){const m=Math.ceil(seg/10);for(let q=1;q<m;q++){const xx=x+(x2-x)*q/m,zz=z+(z2-z)*q/m;if(typeof nearTrack==='function'&&nearTrack(trk,xx,zz,W/2+5)){if(cur.length>1)runs.push(cur);cur=[];}else cur.push([xx,zz]);}}}}
      if(cur.length>1)runs.push(cur);
      runs.forEach(rn=>{const cx=rn.reduce((a,p)=>a+p[0],0)/rn.length,cz=rn.reduce((a,p)=>a+p[1],0)/rn.length;add(Object.assign({},o0,{line:rn.map(p=>[p[0]-cx,p[1]-cz])}),cx,cz);});return;}
    add(o0,x0,z0);});
  return out;}
function realNotes(trk){const R=trk.real,D=R.d,n=trk.n,out=[],map=i8=>realIdx(R,i8,0);
  (D.notes||[]).forEach(q=>{const i=map(q.i);if(i<0||i>=n)return;const km=Math.max(0,Math.round((i-trk.startIdx)*trk.step/100)/10);
    const t=q.t==='town'?`${q.n} — город на пути`:q.t==='bridge'?`мост через реку ${q.n&&q.n!=='—'?q.n:''}`.trim():q.t==='rail'?'железнодорожный переезд':q.t==='coast'?'дорога вдоль моря':q.t==='climb'?`подъём на ${q.m} м`:q.t==='descent'?`спуск на ${q.m} м`:q.t==='lm'&&q.n?q.n:'';
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
