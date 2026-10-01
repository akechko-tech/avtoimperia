/* ================= ПРИМЕТЫ С КАРТЫ: соборы, замки, дворцы, стены, маяки, мельницы — модели по настоящим размерам (OpenStreetMap) ================= */
// lmMesh(o,host,hf) — модель одной приметы у настоящей трассы: сетка Mesh с M.foot=[x0,x1,z0,z1].
// o.k — вид (cathedral, church, castle, …), o.l — длина по оси z, o.w — ширина по x, o.h — высота (м), o.y — год постройки (0 — неизвестен),
// o.n — имя, o.line — линия стены или акведука [[x,z],…] в метрах от начала приметы. host — страна гонки: от неё стиль (камень, крыши, главы).
// hf(dx,dz) — высота земли от начала приметы (если есть): по ней идут стены, акведуки, крепости и монастыри.
// Метры, y — вверх, земля в y=0, длинная ось — z. У храмов западный фасад с башнями и входом — на −z, алтарь — на +z;
// у дворцов, усадеб и вокзалов главный фасад — на +x. Стена и акведук строятся прямо в координатах o.line (ставить без поворота).
const LM_KIND_NAME={cathedral:'Собор',church:'Церковь',chapel:'Часовня',castle:'Замок',palace:'Дворец',manor:'Усадьба',fort:'Крепость',ruins:'Руины',
  monastery:'Монастырь',gate:'Городские ворота',wall:'Крепостная стена',tower:'Башня',lighthouse:'Маяк',windmill:'Ветряная мельница',watermill:'Водяная мельница',
  monument:'Памятник',obelisk:'Обелиск',statue:'Статуя',column:'Колонна',station:'Вокзал',mosque:'Мечеть',pagoda:'Пагода',aqueduct:'Акведук',
  observatory:'Обсерватория',water_tower:'Водонапорная башня'};
// Подпись приметы: имя с карты, иначе — вид по-русски
function lmName(o,host){if(o&&o.n)return o.n;const k=o&&o.k;if(k==='wall'&&host==='cn')return 'Великая Китайская стена';if(k==='manor'&&(host==='uk'||host==='ie'))return 'Поместье';if(k==='palace'&&host==='fr')return 'Замок-дворец';return LM_KIND_NAME[k]||'Достопримечательность';}
MATS.water=MATS.water||{a:0.36,d:0.4,s:0.7,p:40,k:'water'};
// Стиль страны: камень, штукатурка, кирпич, крыша, отделка (камень подобран так, чтобы в 3D лёг фото-камень, кирпич — фото-кирпич)
const LMK_ST={fr:['#b8b09f','#e6dcc4','#a04a36','#59606b','#efe6d2'],be:['#aaa293','#e2dccd','#9c4834','#575d68','#ece4d2'],nl:['#a8a091','#e8e2d4','#98442f','#555b66','#efe9dc'],
  de:['#a39c8e','#ece4d0','#a0452f','#9e432d','#f2ece0'],at:['#b3ab9c','#f0e8d4','#a04a34','#9a3f2c','#f6f1e6'],ch:['#a69a90','#efe6d2','#a04a34','#9c4a32','#f4eee2'],
  it:['#c9bda5','#e3c08e','#a85a3c','#ad5638','#f1e6cf'],mc:['#cdc3ad','#ead2a6','#a85a3c','#ad5638','#f4ead6'],es:['#c4b18c','#ece2cc','#a85a3c','#a9563a','#f2e8d4'],
  uk:['#aaa395','#e4dccb','#9a4532','#4f555e','#e8e0cc'],ie:['#9a958b','#efece2','#984634','#4c5058','#e6e2d6'],us:['#b5ad9c','#f2efe8','#9a4634','#50565f','#ffffff'],
  ru:['#b0a898','#f2eee4','#a8432f','#4f7a5a','#ffffff'],cn:['#8e8b84','#d8d0c0','#8a8680','#4a5058','#b8322a'],ly:['#cbbf9f','#f2ede2','#b07a50','#8a8270','#f8f4ea']};
function lmkS(h){const a=LMK_ST[h]||LMK_ST.fr;return {st:a[0],pl:a[1],br:a[2],rf:a[3],tr:a[4],gl:'#2e3446',dk:'#1d1b20',gold:'#c9a24a'};}
/* ---------- помощники геометрии ---------- */
const lmkG=(hf,x,z)=>{if(!hf)return 0;const v=+hf(x,z);return isFinite(v)?v:0;};
const lmkN=v=>{const l=Math.hypot(v[0],v[1],v[2])||1;return [v[0]/l,v[1]/l,v[2]/l];};
// Грань (выпуклая) с нормалью наружу по подсказке n — обход вершин любой
function lmkQ(M,P,col,mat,n,two){const c=mCenter(P);return mFace(M,P,col,mat||'wall',[c[0]-n[0],c[1]-n[1],c[2]-n[2]],two);}
function lmkAdd(M,Q){Q.F.forEach(f=>M.F.push(f));return M;}
// Брус вдоль отрезка a→b (план [x,z]): ширина w, низ ya0/yb0 и верх ya1/yb1 на концах, откос верха ti с каждой стороны; ends — торцы 'a','b'
function lmkSeg(M,a,b,w,ya0,ya1,yb0,yb1,col,mat,ends,ti){const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1,tx=dx/L,tz=dz/L,nx=-tz,nz=tx,h=w/2,g=h-(ti||0);
  const p=(q,s,y,k)=>[q[0]+nx*s*k,y,q[1]+nz*s*k],A0=p(a,1,ya0,h),A1=p(a,-1,ya0,h),B0=p(b,1,yb0,h),B1=p(b,-1,yb0,h),C0=p(a,1,ya1,g),C1=p(a,-1,ya1,g),D0=p(b,1,yb1,g),D1=p(b,-1,yb1,g);
  const o={l:lmkQ(M,[A0,B0,D0,C0],col,mat,[nx,0,nz]),r:lmkQ(M,[A1,B1,D1,C1],col,mat,[-nx,0,-nz]),t:lmkQ(M,[C0,D0,D1,C1],col,mat,[0,1,0])};
  if(ends&&ends.includes('a'))o.a=lmkQ(M,[A0,A1,C1,C0],col,mat,[-tx,0,-tz]);if(ends&&ends.includes('b'))o.b=lmkQ(M,[B0,B1,D1,D0],col,mat,[tx,0,tz]);return o;}
// Тело вращения вокруг вертикали через c: prof — [[r,y],…] снизу вверх (тогда нормали — наружу), seg — граней по кругу.
// По умолчанию гладко по кругу и с рёбрами по профилю; o.sm — гладко и по профилю (купол), o.fl — плоские грани (восьмерик, шатёр),
// o.fa — плоские по кругу, гладкие по профилю (гранёный купол); o.a0/o.a1 — часть круга (0 — на +x, π/2 — на +z); o.two — с двух сторон
function lmkRev(M,c,prof,seg,col,mat,o){o=o||{};const a0=o.a0||0,a1=o.a1===undefined?a0+Math.PI*2:o.a1,out=[],B=[];
  for(let i=0;i<prof.length-1;i++){const dr=prof[i+1][0]-prof[i][0],dy=prof[i+1][1]-prof[i][1],l=Math.hypot(dr,dy);B.push(l<1e-6?null:[dy/l,-dr/l]);}
  const VN=i=>{const a=B[i-1]||B[i],b=B[i]||B[i-1];const x=a[0]+b[0],y=a[1]+b[1],l=Math.hypot(x,y)||1;return [x/l,y/l];};
  const P=(r,y,t)=>[c[0]+Math.cos(t)*r,c[1]+y,c[2]+Math.sin(t)*r],N=(q,t)=>[q[0]*Math.cos(t),q[1],q[0]*Math.sin(t)];
  for(let i=0;i<B.length;i++){const b=B[i];if(!b)continue;const [r0,y0]=prof[i],[r1,y1]=prof[i+1];if(r0<1e-4&&r1<1e-4)continue;
    const q0=o.sm||o.fa?VN(i):b,q1=o.sm||o.fa?VN(i+1):b,row=[];
    for(let k=0;k<seg;k++){const t0=a0+(a1-a0)*k/seg,t1=a0+(a1-a0)*(k+1)/seg,tm=(t0+t1)/2,u0=o.fa?tm:t0,u1=o.fa?tm:t1;let p,vn;
      if(r0<1e-4){p=[P(0,y0,tm),P(r1,y1,t1),P(r1,y1,t0)];vn=[N(q0,tm),N(q1,u1),N(q1,u0)];}
      else if(r1<1e-4){p=[P(r0,y0,t0),P(r0,y0,t1),P(0,y1,tm)];vn=[N(q0,u0),N(q0,u1),N(q1,tm)];}
      else{p=[P(r0,y0,t0),P(r0,y0,t1),P(r1,y1,t1),P(r1,y1,t0)];vn=[N(q0,u0),N(q0,u1),N(q1,u1),N(q1,u0)];}
      const f=lmkQ(M,p,col,mat,N(b,tm),o.two);if(!o.fl)f.vn=vn;row.push(f);}
    out.push(row);}
  return out;}
// Точка на грани f (для окон): u — вбок от середины грани, v — высота; годится и для наклонных граней (сужающиеся башни, шпили)
function lmkFP(f){const c=mCenter(f.p),n=f.n,h=Math.hypot(n[0],n[2])||1,T=[-n[2]/h,0,n[0]/h];let U=[n[1]*T[2]-n[2]*T[1],n[2]*T[0]-n[0]*T[2],n[0]*T[1]-n[1]*T[0]];if(U[1]<0)U=U.map(x=>-x);
  const k=1/Math.max(0.2,U[1]);return (u,v)=>{const s=(v-c[1])*k;return [c[0]+T[0]*u+U[0]*s+n[0]*0.01,c[1]+U[1]*s+n[1]*0.01,c[2]+T[2]*u+U[2]*s+n[2]*0.01];};}
// Окно или проём: ar 0 — прямое, 1 — полукруглое, 2 — стрельчатое; o.f — наличник (рама), o.g — стекло, o.op — тёмный проём (дверь, звон), o.x — переплёт
function lmkWin(f,P,u,v,w,h,o){o=o||{};f.deco=f.deco||[];const ar=o.ar||0,fw=o.fw===undefined?Math.max(0.08,w*0.12):o.fw;
  const na=w<1.3?4:6,sh=e=>{const hw=w/2+e,q=[P(u-hw,v-e),P(u+hw,v-e)];
    if(ar===1)for(let k=0;k<=na;k++){const a=Math.PI*k/na;q.push(P(u+Math.cos(a)*hw,v+h+Math.sin(a)*hw));}
    else if(ar===2){for(let k=0;k<=3;k++){const a=Math.PI/9*k;q.push(P(u-hw+Math.cos(a)*2*hw,v+h+Math.sin(a)*2*hw));}for(let k=1;k<=3;k++){const a=Math.PI*2/3+Math.PI/9*k;q.push(P(u+hw+Math.cos(a)*2*hw,v+h+Math.sin(a)*2*hw));}}
    else q.push(P(u+hw,v+h+e),P(u-hw,v+h+e));return q;};
  if(o.f)f.deco.push({poly:sh(fw),c:o.f});f.deco.push(o.op?{poly:sh(0),c:o.op}:{poly:sh(0),c:o.g||'#2e3446',gl:1});
  if(o.x){const lw=Math.max(0.05,w*0.07);f.deco.push({a:P(u,v),b:P(u,v+h),w:lw,c:o.x},{a:P(u-w/2,v+h*0.6),b:P(u+w/2,v+h*0.6),w:lw,c:o.x});}return f;}
// Роза (круглое окно): каменный круг, стекло, кольцо и переплёт; ax — 'x' (стена поперёк x) или 'z'
function lmkRose(f,c,R,ax,g,t){f.deco=f.deco||[];f.deco.push({dot:c,r:R*1.2,c:t},{dot:c,r:R,c:g,gl:1},{ring:[c[0],c[1],c[2],R*0.42],ax:ax==='z'?'z':undefined,w:R*0.08,c:t});
  for(let k=0;k<3;k++){const a=Math.PI*k/3,du=Math.cos(a)*R*0.84,dv=Math.sin(a)*R*0.84,Q=(s)=>ax==='z'?[c[0]+du*s,c[1]+dv*s,c[2]]:[c[0],c[1]+dv*s,c[2]+du*s];f.deco.push({a:Q(-1),b:Q(1),w:R*0.06,c:t});}return f;}
// Часы на стене: циферблат с ободом и стрелки
function lmkClock(f,c,R,ax){f.deco=f.deco||[];const Q=(du,dv)=>ax==='z'?[c[0]+du,c[1]+dv,c[2]]:[c[0],c[1]+dv,c[2]+du];
  f.deco.push({dot:c,r:R*1.15,c:'#2a2a2c'},{dot:c,r:R,c:'#f1ece0'},{a:c,b:Q(0,R*0.75),w:R*0.1,c:'#1a1a1a'},{a:c,b:Q(R*0.55,-R*0.2),w:R*0.12,c:'#1a1a1a'});return f;}
// Зубцы по верху стены a→b: ya/yb — верх стены на концах, w — ширина верха, s — сторона (+1 слева по ходу, −1 справа, 0 — по оси), t — толщина зубца, h — высота, st — шаг
function lmkCren(M,a,b,ya,yb,w,s,t,h,st,col,mat,sw){const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);if(L<0.6)return;const tx=dx/L,tz=dz/L,nx=-tz,nz=tx,off=s*(w/2-t/2),n=Math.max(1,Math.round(L/st));
  for(let k=0;k<n;k++){const f0=(k+0.22)/n,f1=(k+0.78)/n,p=f=>[a[0]+dx*f+nx*off,a[1]+dz*f+nz*off],y0=ya+(yb-ya)*f0,y1=ya+(yb-ya)*f1;
    if(sw)lmkSwal(M,p(f0),p(f1),t,y0,y1,h,col,mat||'stone');else lmkSeg(M,p(f0),p(f1),t,y0-0.05,y0+h,y1-0.05,y1+h,col,mat||'stone','ab');}}
// «Ласточкин хвост» (кремлёвский зубец): вырез сверху
function lmkSwal(M,a,b,t,y0,y1,h,col,mat){const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1,tx=dx/L,tz=dz/L,nx=-tz,nz=tx,m=[(a[0]+b[0])/2,(a[1]+b[1])/2],ym=(y0+y1)/2,Q=(q,s,y)=>[q[0]+nx*s*t/2,y,q[1]+nz*s*t/2];
  // лицо с вырезом — один многоугольник; обход уже по нормали, веер из нижнего угла не заливает вырез
  lmkQ(M,[Q(a,1,y0),Q(b,1,y1),Q(b,1,y1+h),Q(m,1,ym+h*0.62),Q(a,1,y0+h)],col,mat,[nx,0,nz]);lmkQ(M,[Q(a,-1,y0),Q(a,-1,y0+h),Q(m,-1,ym+h*0.62),Q(b,-1,y1+h),Q(b,-1,y1)],col,mat,[-nx,0,-nz]);
  lmkQ(M,[Q(a,1,y0+h),Q(m,1,ym+h*0.62),Q(m,-1,ym+h*0.62),Q(a,-1,y0+h)],col,mat,[tx,1,tz]);lmkQ(M,[Q(m,1,ym+h*0.62),Q(b,1,y1+h),Q(b,-1,y1+h),Q(m,-1,ym+h*0.62)],col,mat,[-tx,1,-tz]);
  lmkQ(M,[Q(a,1,y0),Q(a,-1,y0),Q(a,-1,y0+h),Q(a,1,y0+h)],col,mat,[-tx,0,-tz]);lmkQ(M,[Q(b,1,y1),Q(b,-1,y1),Q(b,-1,y1+h),Q(b,1,y1+h)],col,mat,[tx,0,tz]);}
// Зубцы по кругу (верх круглой башни)
function lmkCrenRing(M,x,y,z,R,n,t,h,col,mat){for(let k=0;k<n;k++){const a0=k/n*Math.PI*2,a1=(k+1)/n*Math.PI*2;lmkCren(M,[x+Math.cos(a0)*R,z+Math.sin(a0)*R],[x+Math.cos(a1)*R,z+Math.sin(a1)*R],y,y,t*2,-1,t,h,2*Math.PI*R/n+0.1,col,mat);}}
// Луковичная глава (профиль как у bOnion), seg — граней по кругу
const lmkOnion=(M,x,y,z,r,h,col,seg)=>mLathe(M,[x,y,z],'y',[[r*0.82,0],[r*1.02,h*0.16],[r*1.1,h*0.32],[r*0.96,h*0.5],[r*0.62,h*0.68],[r*0.28,h*0.84],[r*0.1,h*0.94],[0,h]],seg||12,col,'metal');
// Перенос, масштаб и поворот модели вместе с отделкой
function lmkXf(M,fp,fn){M.F.forEach(f=>{f.p=f.p.map(fp);f.n=lmkN(fn(f.n));if(f.vn)f.vn=f.vn.map(q=>lmkN(fn(q)));
  if(f.deco)f.deco.forEach(d=>{['a','b','dot'].forEach(k=>{if(d[k])d[k]=fp(d[k]);});if(d.poly)d.poly=d.poly.map(fp);if(d.at)d.at=d.at.map(fp);if(d.ring){const q=fp([d.ring[0],d.ring[1],d.ring[2]]);d.ring=[q[0],q[1],q[2],d.ring[3]];}});});
  M.lamps=(M.lamps||[]).map(fp);M.foot=null;return M;}
function lmkScale(M,sx,sy,sz){const k=Math.cbrt(sx*sy*sz);lmkXf(M,q=>[q[0]*sx,q[1]*sy,q[2]*sz],n=>[n[0]/sx,n[1]/sy,n[2]/sz]);
  M.F.forEach(f=>{if(f.deco)f.deco.forEach(d=>{if(d.text)return;if(d.w)d.w*=k;if(d.r)d.r*=k;if(d.ring)d.ring[3]*=k;});});return M;}
function lmkMove(M,dx,dy,dz){return lmkXf(M,q=>[q[0]+dx,q[1]+dy,q[2]+dz],n=>n);}
// Поворот вокруг вертикали: местная ось z → направление (dx,dz), местная x → (dz,−dx); кольца отделки верны только при прямых углах
function lmkTurn(M,dx,dz){lmkXf(M,q=>[q[0]*dz+q[2]*dx,q[1],-q[0]*dx+q[2]*dz],n=>[n[0]*dz+n[2]*dx,n[1],-n[0]*dx+n[2]*dz]);
  if(Math.abs(dx)>0.7)M.F.forEach(f=>{if(f.deco)f.deco.forEach(d=>{if(d.ring)d.ax=d.ax==='z'?undefined:'z';});});return M;}
// Часть модели на своей земле: строим в своей сетке и ставим в (x, земля+dy, z)
function lmkAt(M,hf,x,z,build,dy){const Q=new Mesh();build(Q);lmkMove(Q,x,lmkG(hf,x,z)+(dy||0),z);return lmkAdd(M,Q);}
// Чужая модель BLD под размеры с карты: длина — по z, ширина и высота — в разумных пределах от общего масштаба
function lmkBox3(M){let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,z0=1e9,z1=-1e9;M.F.forEach(f=>f.p.forEach(q=>{if(q[0]<x0)x0=q[0];if(q[0]>x1)x1=q[0];if(q[1]<y0)y0=q[1];if(q[1]>y1)y1=q[1];if(q[2]<z0)z0=q[2];if(q[2]>z1)z1=q[2];}));return [x0,y0,z0,x1,y1,z1];}
function lmkFit(B,L,W,H,lo,hi){const b=lmkBox3(B);lo=lo||0.8;hi=hi||1.25;const s=L>0?L/Math.max(1,b[5]-b[2]):H/Math.max(1,b[4]),sx=W>0?clamp(W/Math.max(1,b[3]-b[0]),s*lo,s*hi):s,sy=H>0?clamp(H/Math.max(1,b[4]),s*lo,s*hi):s;
  lmkMove(B,-(b[0]+b[3])/2,0,-(b[2]+b[5])/2);return lmkScale(B,sx,sy,s);}
// Площадь грани
function lmkArea(P){let x=0,y=0,z=0;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];x+=a[1]*b[2]-a[2]*b[1];y+=a[2]*b[0]-a[0]*b[2];z+=a[0]*b[1]-a[1]*b[0];}return Math.hypot(x,y,z)/2;}
// У чужих моделей BLD крупные каменные грани — «стена» (в 3D на них ляжет фото-камень)
function lmkStoneTex(M){M.F.forEach(f=>{if(f.mat===MATS.stone&&lmkArea(f.p)>3)f.mat=MATS.wall;});return M;}
function lmkFoot(M){const b=lmkBox3(M);M.foot=b[0]<1e8?[b[0]-0.3,b[3]+0.3,b[2]-0.3,b[5]+0.3]:[-1,1,-1,1];return M;}
// Цоколь под корпусом — до самой низкой земли под ним (на склоне здание не висит)
function lmkPl(M,x0,x1,z0,z1,hf,col,top){let lo=-0.6;if(hf)[[x0,z0],[x1,z0],[x0,z1],[x1,z1],[(x0+x1)/2,(z0+z1)/2]].forEach(([x,z])=>{lo=Math.min(lo,lmkG(hf,x,z)-0.6);});
  mBox(M,x0-0.15,lo-0.8,z0-0.15,x1+0.15,top===undefined?-0.05:top,z1+0.15,col||'#8a8274','stone',['d']);}
// Плоский выпуклый многоугольник pts ([u,y]) с толщиной: ax 'z' — в плоскости x–y от z=d0 до d1, ax 'x' — в плоскости z–y от x=d0 до d1; noBot — без низа
function lmkExt(M,pts,d0,d1,col,mat,ax,noBot){const P3=(q,d)=>ax==='x'?[d,q[1],q[0]]:[q[0],q[1],d],n=pts.length;let cu=0,cy=0,ym=1e9;pts.forEach(q=>{cu+=q[0]/n;cy+=q[1]/n;ym=Math.min(ym,q[1]);});
  const F=ax==='x'?[1,0,0]:[0,0,1],out={a:lmkQ(M,pts.map(q=>P3(q,d0)),col,mat,F.map(v=>-v)),b:lmkQ(M,pts.map(q=>P3(q,d1)),col,mat,F),s:[]};
  for(let i=0;i<n;i++){const p=pts[i],q=pts[(i+1)%n];if(noBot&&p[1]-ym<1e-3&&q[1]-ym<1e-3)continue;let nu=q[1]-p[1],ny=p[0]-q[0];if(nu*((p[0]+q[0])/2-cu)+ny*((p[1]+q[1])/2-cy)<0){nu=-nu;ny=-ny;}
    out.s.push(lmkQ(M,[P3(p,d0),P3(q,d0),P3(q,d1),P3(p,d1)],col,mat,ax==='x'?[0,ny,nu]:[nu,ny,0]));}return out;}
// Двускатная крыша над x0..x1 × z0..z1: конёк вдоль z (ax 'z') или x; y — карниз, h — подъём, wall — цвет фронтонов (null — без них), ov — свес
function lmkGab(M,x0,x1,z0,z1,y,h,col,wall,ax,ov,mat){ov=ov===undefined?0.4:ov;mat=mat||'roof';
  if(ax==='x'){const zm=(z0+z1)/2,hz=(z1-z0)/2,yE=y-ov*h/hz,X0=x0-ov*0.5,X1=x1+ov*0.5,Z0=z0-ov,Z1=z1+ov;
    const a=lmkQ(M,[[X0,yE,Z0],[X1,yE,Z0],[X1,y+h,zm],[X0,y+h,zm]],col,mat,[0,hz,-h]),b=lmkQ(M,[[X0,yE,Z1],[X1,yE,Z1],[X1,y+h,zm],[X0,y+h,zm]],col,mat,[0,hz,h]);
    const g=wall?[x0,x1].map((x,i)=>lmkQ(M,[[x,y,z0],[x,y,z1],[x,y+h,zm]],wall,'wall',[i?1:-1,0,0])):[];return {a,b,g};}
  const xm=(x0+x1)/2,hx=(x1-x0)/2,yE=y-ov*h/hx,X0=x0-ov,X1=x1+ov,Z0=z0-ov*0.5,Z1=z1+ov*0.5;
  const a=lmkQ(M,[[X0,yE,Z0],[X0,yE,Z1],[xm,y+h,Z1],[xm,y+h,Z0]],col,mat,[-h,hx,0]),b=lmkQ(M,[[X1,yE,Z0],[X1,yE,Z1],[xm,y+h,Z1],[xm,y+h,Z0]],col,mat,[h,hx,0]);
  const g=wall?[z0,z1].map((z,i)=>lmkQ(M,[[x0,y,z],[x1,y,z],[xm,y+h,z]],wall,'wall',[0,0,i?1:-1])):[];return {a,b,g};}
// Вальмовая крыша (конёк вдоль длинной стороны), h — подъём, ov — свес
function lmkHip(M,x0,x1,z0,z1,y,h,col,ov,mat){ov=ov===undefined?0.4:ov;mat=mat||'roof';const X0=x0-ov,X1=x1+ov,Z0=z0-ov,Z1=z1+ov,hx=(X1-X0)/2,hz=(Z1-Z0)/2,xm=(X0+X1)/2,zm=(Z0+Z1)/2,yE=y-ov*h/Math.max(0.5,Math.min(hx,hz)-ov);
  if(hz>=hx){const r=hz-hx,A=[xm,y+h,zm-r],B=[xm,y+h,zm+r];lmkQ(M,[[X0,yE,Z0],[X0,yE,Z1],B,A],col,mat,[-h,hx,0]);lmkQ(M,[[X1,yE,Z0],[X1,yE,Z1],B,A],col,mat,[h,hx,0]);
    lmkQ(M,[[X0,yE,Z0],[X1,yE,Z0],A],col,mat,[0,hx,-h]);lmkQ(M,[[X0,yE,Z1],[X1,yE,Z1],B],col,mat,[0,hx,h]);}
  else{const r=hx-hz,A=[xm-r,y+h,zm],B=[xm+r,y+h,zm];lmkQ(M,[[X0,yE,Z0],[X1,yE,Z0],B,A],col,mat,[0,hz,-h]);lmkQ(M,[[X0,yE,Z1],[X1,yE,Z1],B,A],col,mat,[0,hz,h]);
    lmkQ(M,[[X0,yE,Z0],[X0,yE,Z1],A],col,mat,[-h,hz,0]);lmkQ(M,[[X1,yE,Z0],[X1,yE,Z1],B],col,mat,[h,hz,0]);}}
// Мансарда: крутой нижний скат (подъём h1, отступ d) и пологий верх (h2)
function lmkMans(M,x0,x1,z0,z1,y,h1,d,h2,col,mat){mat=mat||'roof';const c=[[x0,z0],[x1,z0],[x1,z1],[x0,z1]],ci=[[x0+d,z0+d],[x1-d,z0+d],[x1-d,z1-d],[x0+d,z1-d]],N=[[0,-1],[1,0],[0,1],[-1,0]];
  for(let i=0;i<4;i++){const j=(i+1)%4;lmkQ(M,[[c[i][0],y,c[i][1]],[c[j][0],y,c[j][1]],[ci[j][0],y+h1,ci[j][1]],[ci[i][0],y+h1,ci[i][1]]],col,mat,[N[i][0]*h1,d,N[i][1]*h1]);}
  lmkHip(M,x0+d,x1-d,z0+d,z1-d,y+h1,h2,col,0.05,mat);}
// Шатёр, шпиль, конус, купол
const lmkPyr=(M,x,y,z,s,h,col,mat)=>lmkRev(M,[x,y,z],[[s*1.4142,0],[0,h]],4,col,mat||'roof',{fl:1,a0:Math.PI/4});
const lmkSpire=(M,x,y,z,r,h,col,mat,n)=>lmkRev(M,[x,y,z],[[r,0],[0,h]],n||8,col,mat||'roof',{fl:1,a0:-Math.PI/(n||8)});
const lmkCone=(M,x,y,z,r,h,col,mat,seg)=>lmkRev(M,[x,y,z],[[r,0],[0,h]],seg||12,col,mat||'roof');
function lmkDome(M,x,y,z,r,h,col,mat,seg,o){const P=[];for(let i=0;i<=6;i++){const a=Math.PI/2*i/6;P.push([i===6?0:r*Math.cos(a),h*Math.sin(a)]);}return lmkRev(M,[x,y,z],P,seg||16,col,mat||'metal',Object.assign({sm:1},o||{}));}
// Колонна: база и капитель — плиты, ствол с утонением
function lmkCol(M,x,y,z,r,h,col,mat,seg){mat=mat||'stone';mBox(M,x-r*1.3,y,z-r*1.3,x+r*1.3,y+r*0.5,z+r*1.3,col,mat,['d']);lmkRev(M,[x,y+r*0.5,z],[[r,0],[r*0.86,h-r*1.1]],seg||8,col,mat);mBox(M,x-r*1.3,y+h-r*0.6,z-r*1.3,x+r*1.3,y+h,z+r*1.3,col,mat,[]);}
// Карниз-пояс вокруг корпуса
const lmkCorn=(M,x0,x1,z0,z1,y,d,h,col)=>mBox(M,x0-d,y,z0-d,x1+d,y+h,z1+d,col,'stone',[]);
// Корпус x0..x1 × z0..z1 от y0 высотой H: стены панелями (ось × этаж) с окнами; o.sd — стороны с окнами (r +x, l −x, f +z, b −z), o.sk — стороны без стены,
// o.fl — этажей, o.bay — шаг осей, o.win(f,P,v,j,k,n,s) — окно в панели (v — низ этажа, j — этаж, k — ось из n, s — сторона)
function lmkBlk(M,x0,x1,z0,z1,y0,H,o){const fl=o.fl||1,fh=H/fl,out={r:[],l:[],f:[],b:[]},col=o.col,mat=o.mat||'wall';
  const SD={r:[[x1,z0],[x1,z1],[1,0,0]],l:[[x0,z1],[x0,z0],[-1,0,0]],f:[[x1,z1],[x0,z1],[0,0,1]],b:[[x0,z0],[x1,z0],[0,0,-1]]};
  for(const s in SD){if(o.sk&&o.sk.includes(s))continue;const [a,b,n]=SD[s],len=Math.hypot(b[0]-a[0],b[1]-a[1]),w=!!(o.win&&o.sd&&o.sd.includes(s)),nb=w?Math.max(1,Math.round(len/(o.bay||4))):1;
    for(let k=0;k<nb;k++){const t0=k/nb,t1=(k+1)/nb,pa=[a[0]+(b[0]-a[0])*t0,a[1]+(b[1]-a[1])*t0],pb=[a[0]+(b[0]-a[0])*t1,a[1]+(b[1]-a[1])*t1];
      for(let j=0;j<(w?fl:1);j++){const ya=y0+(w?j*fh:0),yb=w?y0+(j+1)*fh:y0+H,f=lmkQ(M,[[pa[0],ya,pa[1]],[pb[0],ya,pb[1]],[pb[0],yb,pb[1]],[pa[0],yb,pa[1]]],col,mat,n);
        if(w)o.win(f,lmkFP(f),ya,j,k,nb,s,len/nb);out[s].push(f);}}}
  if(o.top)lmkQ(M,[[x0,y0+H,z0],[x1,y0+H,z0],[x1,y0+H,z1],[x0,y0+H,z1]],o.top,'stone',[0,1,0]);
  return out;}
// Китайская крыша над x0..x1 × z0..z1 от карниза y: свес с загнутыми вверх углами (виден и снизу), выше — вальма; h — подъём, ov — свес
function lmkCnRoof(M,x0,x1,z0,z1,y,h,ov,col,mat){mat=mat||(col==='#c99a3a'?'paint':'roof');const X0=x0-ov,X1=x1+ov,Z0=z0-ov,Z1=z1+ov,dr=ov*0.42,up=ov*0.55,E=[[X0,Z0],[X1,Z0],[X1,Z1],[X0,Z1]],B=[[x0,z0],[x1,z0],[x1,z1],[x0,z1]],N=[[0,-1],[1,0],[0,1],[-1,0]];
  for(let i=0;i<4;i++){const j=(i+1)%4,em=[(E[i][0]+E[j][0])/2,y-dr,(E[i][1]+E[j][1])/2],bm=[(B[i][0]+B[j][0])/2,y,(B[i][1]+B[j][1])/2],n=[N[i][0],2,N[i][1]];
    lmkQ(M,[[E[i][0],y-dr+up,E[i][1]],em,bm,[B[i][0],y,B[i][1]]],col,mat,n,true);lmkQ(M,[em,[E[j][0],y-dr+up,E[j][1]],[B[j][0],y,B[j][1]],bm],col,mat,n,true);}
  lmkHip(M,x0,x1,z0,z1,y,h,col,0,mat);const zm=(z0+z1)/2,xm=(x0+x1)/2,r=Math.abs((z1-z0)-(x1-x0))/2;
  if(z1-z0>=x1-x0)mBox(M,xm-0.25,y+h-0.1,zm-r-0.3,xm+0.25,y+h+0.45,zm+r+0.3,shade(col,-0.15),mat,['d']);else mBox(M,xm-r-0.3,y+h-0.1,zm-0.25,xm+r+0.3,y+h+0.45,zm+0.25,shade(col,-0.15),mat,['d']);}
// Многогранный карниз с загнутыми углами (ярус пагоды): от стены радиуса rw на высоте y наружу до re
function lmkEaveN(M,cx,y,cz,rw,re,n,a0,col,dr,up){const cm=Math.cos(Math.PI/n);
  for(let k=0;k<n;k++){const t0=a0+k*2*Math.PI/n,t1=t0+2*Math.PI/n,tm=(t0+t1)/2,Q=(t,r,yy)=>[cx+Math.cos(t)*r,yy,cz+Math.sin(t)*r],n2=[Math.cos(tm),2,Math.sin(tm)];
    const Wa=Q(t0,rw,y),Wb=Q(t1,rw,y),Wm=Q(tm,rw*cm,y),Ea=Q(t0,re,y-dr+up),Eb=Q(t1,re,y-dr+up),Em=Q(tm,re*cm,y-dr);
    lmkQ(M,[Wa,Wm,Em,Ea],col,'roof',n2,true);lmkQ(M,[Wm,Wb,Eb,Em],col,'roof',n2,true);}}
// Полумесяц на шпиле (две стороны)
function lmkCresc(M,x,y,z,R,col){const P=(a,r,c)=>[x,y+c+Math.sin(a)*r,z+Math.cos(a)*r];for(let k=0;k<6;k++){const a0=Math.PI*(1.15+k*0.7/6)*1,a1=Math.PI*(1.15+(k+1)*0.7/6);
  lmkQ(M,[P(a0+Math.PI,R,R),P(a1+Math.PI,R,R),P(a1+Math.PI,R*0.72,R*1.25),P(a0+Math.PI,R*0.72,R*1.25)],col,'metal',[1,0,0],true);}mBox(M,x-0.05,y-R*0.6,z-0.05,x+0.05,y+R*0.4,z+0.05,col,'metal');}
// Ломаная: убрать слишком частые точки (не ближе minD)
function lmkSimp(P,minD){if(P.length<3)return P.slice();const out=[P[0]];for(let i=1;i<P.length-1;i++){const q=out[out.length-1];if(Math.hypot(P[i][0]-q[0],P[i][1]-q[1])>=minD)out.push(P[i]);}out.push(P[P.length-1]);return out;}
// Линия стены или акведука: из o.line или прямая вдоль z; cl — замкнута (первая точка = последней)
function lmkLine(o,L0){let P=Array.isArray(o.line)?o.line.filter(p=>p&&p.length>=2).map(p=>[+p[0]||0,+p[1]||0]).filter((p,i,A)=>!i||Math.hypot(p[0]-A[i-1][0],p[1]-A[i-1][1])>0.05):[];
  let l0=0;for(let i=1;i<P.length;i++)l0+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);if(P.length<2||l0<2){const L=clamp(o.l||L0,20,4000);P=[[0,-L/2],[0,L/2]];}
  let cl=false;if(P.length>3&&Math.hypot(P[0][0]-P[P.length-1][0],P[0][1]-P[P.length-1][1])<1.5){cl=true;P.pop();}
  let len=0;for(let i=1;i<P.length;i++)len+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);P=lmkSimp(P,Math.max(5,len/700));return {P,cl,len};}
/* ---------- стены с зубцами и башнями ---------- */
// Стена по ломаной pts ([x,z]; o.cl — замкнутая): куски до 9 м по земле hf, откос ti, зубцы снаружи (o.cr: 'm' — простые, 's' — ласточкин хвост, 'p' — сплошной бруствер),
// o.ip — низкий парапет изнутри; башни o.tow(x,z,tx,tz,side) — на углах круче o.corner (рад), через o.ts м и на концах (o.ends)
function lmkWallLine(M,pts,hf,o){const n=pts.length;if(n<2)return;const H=o.H,t=o.t,ti=o.ti||0,col=o.col,mat=o.mat||'wall',cl=!!o.cl,wt=t-2*ti,G=(x,z)=>lmkG(hf,x,z);
  let side=o.side||1;if(cl){let A=0;for(let i=0;i<n;i++){const p=pts[i],q=pts[(i+1)%n];A+=p[0]*q[1]-q[0]*p[1];}side=A>0?-1:1;}
  const segs=cl?n:n-1,tw=[];let acc=0,nextT=o.ts?o.ts*0.5:1e12;
  for(let i=0;i<segs;i++){const a=pts[i],b=pts[(i+1)%n],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);if(L<0.3)continue;const tx=dx/L,tz=dz/L,nx=-tz,nz=tx,m=Math.max(1,Math.ceil(L/9)),off=(q,d)=>[q[0]+nx*d,q[1]+nz*d];
    for(let k=0;k<m;k++){const e0=k===0&&(cl||i>0)?-wt*0.5:0,e1=k===m-1&&(cl||i<segs-1)?wt*0.5:0,
        p0=[a[0]+dx*k/m+tx*e0,a[1]+dz*k/m+tz*e0],p1=[a[0]+dx*(k+1)/m+tx*e1,a[1]+dz*(k+1)/m+tz*e1],g0=G(p0[0],p0[1]),g1=G(p1[0],p1[1]);
      lmkSeg(M,p0,p1,t,g0-1.6,g0+H,g1-1.6,g1+H,col,mat,(!cl&&i===0&&k===0?'a':'')+(!cl&&i===segs-1&&k===m-1?'b':''),ti);
      if(o.cr==='p')lmkSeg(M,off(p0,side*(wt/2-0.45)),off(p1,side*(wt/2-0.45)),0.9,g0+H-0.1,g0+H+1.15,g1+H-0.1,g1+H+1.15,o.cc||col,mat);
      else if(o.cr)lmkCren(M,p0,p1,g0+H,g1+H,wt,side,o.mt||0.6,o.mh||1.5,o.st||2.4,o.cc||col,o.cm||mat,o.cr==='s');
      if(o.ip)lmkSeg(M,off(p0,-side*(wt/2-0.25)),off(p1,-side*(wt/2-0.25)),0.5,g0+H-0.1,g0+H+0.95,g1+H-0.1,g1+H+0.95,o.cc||col,mat);}
    while(nextT<=acc+L){const f=(nextT-acc)/L;tw.push([a[0]+dx*f,a[1]+dz*f,tx,tz]);nextT+=o.ts;}acc+=L;}
  if(!o.tow)return;
  if(o.corner)for(let i=0;i<n;i++){if(!cl&&(i===0||i===n-1))continue;const p=pts[(i+n-1)%n],c=pts[i],q=pts[(i+1)%n],u=[c[0]-p[0],c[1]-p[1]],v=[q[0]-c[0],q[1]-c[1]],lu=Math.hypot(...u)||1,lv=Math.hypot(...v)||1;
    const turn=Math.acos(clamp((u[0]*v[0]+u[1]*v[1])/lu/lv,-1,1));if(turn>=o.corner)tw.push([c[0],c[1],(u[0]/lu+v[0]/lv)/2,(u[1]/lu+v[1]/lv)/2,1]);}
  if(o.ends&&!cl){const a=pts[0],b=pts[1],c=pts[n-2],d=pts[n-1],l1=Math.hypot(b[0]-a[0],b[1]-a[1])||1,l2=Math.hypot(d[0]-c[0],d[1]-c[1])||1;tw.push([a[0],a[1],(b[0]-a[0])/l1,(b[1]-a[1])/l1],[d[0],d[1],(d[0]-c[0])/l2,(d[1]-c[1])/l2]);}
  // башни не теснее 0.45 шага
  const ok=[];tw.forEach(q=>{if(q[4]||!ok.some(p=>Math.hypot(p[0]-q[0],p[1]-q[1])<(o.ts||40)*0.45)){const l=Math.hypot(q[2],q[3]);ok.push(l>1e-3?[q[0],q[1],q[2]/l,q[3]/l]:[q[0],q[1],0,1]);}});
  ok.forEach(q=>o.tow(q[0],q[1],q[2],q[3],side));}
// Башня стены по стилю (строится в своих осях: z — вдоль стены, +x — наружу) и ставится на землю
function lmkWT(M,hf,sty,o){return (x,z,tx,tz,side)=>{const g=lmkG(hf,x,z),Q=new Mesh(),H=o.H,st=o.st,dk='#1d1b20';
  if(sty==='cn'){const s=o.s||10,Ht=H+5.4,B=mBox(Q,-s/2+0.4,-1.6,-s/2,s/2+0.4,Ht,s/2,st,'wall',['d']);
    ['r','l','f','b'].forEach(k=>{const f=B[k],P=lmkFP(f);[-s*0.28,0,s*0.28].forEach(u=>lmkWin(f,P,u,H+1.1,0.9,1.5,{ar:1,op:dk}));});
    [[-1,-1,1,-1],[1,-1,1,1],[1,1,-1,1],[-1,1,-1,-1]].forEach(([a,b,c,d])=>lmkCren(Q,[a*s/2+0.4,b*s/2],[c*s/2+0.4,d*s/2],Ht,Ht,1.2,-1,0.6,1.5,2.4,st,'wall'));
    if(o.pav)lmkCnRoof(Q,-s*0.3+0.4,s*0.3+0.4,-s*0.3,s*0.3,Ht+2.6,1.8,1.0,'#4a5058'),mBox(Q,-s*0.3+0.4,Ht,-s*0.3,s*0.3+0.4,Ht+2.6,s*0.3,'#8a2a22','wood',['d','t']);}
  else if(sty==='kr'){const s=o.s||8,H1=H*1.5,c=s*0.2,B=mBox(Q,-s/2+c,-1.6,-s/2,s/2+c,H1,s/2,st,'wall',['d']);
    ['r','l','f','b'].forEach(k=>{const f=B[k],P=lmkFP(f);f.deco=f.deco||[];f.deco.push({a:P(-s/2,H1-0.7),b:P(s/2,H1-0.7),w:0.45,c:o.tr},{a:P(-s/2,H*0.95),b:P(s/2,H*0.95),w:0.3,c:o.tr});lmkWin(f,P,0,H*1.1,0.8,1.6,{ar:1,f:o.tr,op:dk});});
    [[-1,-1,1,-1],[1,-1,1,1],[1,1,-1,1],[-1,1,-1,-1]].forEach(([a,b,cc,d])=>lmkCren(Q,[a*s/2+c,b*s/2],[cc*s/2+c,d*s/2],H1,H1,1.0,-1,0.55,1.4,2.4,st,'wall',o.sw!==false));
    const O=lmkRev(Q,[c,H1,0],[[s*0.36,0],[s*0.36,s*0.5]],8,st,'wall',{fl:1,a0:-Math.PI/8});if(o.sw!==false)O[0].forEach((f,i)=>{if(i%2===0)lmkWin(f,lmkFP(f),0,H1+s*0.12,s*0.12,s*0.22,{ar:1,op:dk});});
    const yb=H1+s*0.5+0.3,yt=yb+s*1.5;lmkRev(Q,[c,H1+s*0.5,0],[[s*0.42,0],[s*0.42,0.3],[0,0.3]],8,o.tr,'stone',{fl:1,a0:-Math.PI/8});lmkSpire(Q,c,yb,0,s*0.38,s*1.5,o.rf||'#3f5f4a','roof');
    lmkRev(Q,[c,yt-0.15,0],[[0,0],[0.34,0.3],[0,0.62]],6,'#c9a24a','metal',{fl:1});mBox(Q,c-0.06,yt+0.4,-0.06,c+0.06,yt+1.6,0.06,'#c9a24a','metal');}
  else if(sty==='rd'){const R=o.R||4,Ht=H*(o.k||1.3),c=R*0.45,T=lmkRev(Q,[c,-1.6,0],[[R,0],[R,Ht+1.6]],12,st,'wall');
    T[0].forEach(f=>{if(f.n[0]>0.3)lmkWin(f,lmkFP(f),0,H*0.55,0.35,1.6,{op:dk});});
    if(o.cone){lmkRev(Q,[c,Ht,0],[[R+0.4,0],[R+0.4,0.5],[R*0.9,0.5]],12,shade(st,0.1),'stone');lmkCone(Q,c,Ht+0.5,0,R*1.12,R*2.3,o.rf,'roof');}
    else{lmkRev(Q,[c,Ht,0],[[R+0.3,0],[R+0.3,0.4],[0,0.4]],12,shade(st,0.08),'stone');lmkCrenRing(Q,c,Ht+0.4,0,R+0.3-0.3,10,0.6,1.4,st,'wall');}}
  else{const s=o.s||7,Ht=H*(o.k||1.35),c=s*0.25,B=mBox(Q,-s/2+c,-1.6,-s/2,s/2+c,Ht,s/2,st,'wall',['d']);
    ['r','f','b','l'].forEach(k=>{const f=B[k];lmkWin(f,lmkFP(f),0,H*0.6,0.4,1.7,{op:dk});});
    [[-1,-1,1,-1],[1,-1,1,1],[1,1,-1,1],[-1,1,-1,-1]].forEach(([a,b,cc,d])=>lmkCren(Q,[a*s/2+c,b*s/2],[cc*s/2+c,d*s/2],Ht,Ht,1.0,-1,0.6,1.4,2.0,st,'wall',o.sw));
    if(o.roof)lmkPyr(Q,c,Ht,0,s/2+0.3,s*0.9,o.roof,'roof');}
  lmkTurn(Q,side>0?-tx:tx,side>0?-tz:tz);lmkMove(Q,x,g,z);lmkAdd(M,Q);};}
/* ---------- храмы ---------- */
// Собор: Россия — пятиглавый, Италия, Монако, Ливия — базилика с куполом и кампанилой, остальные — готический (Австрия — барочный с луковицами)
function lmkCathedral(M,o,h,hf,r,S){if(h==='ru')return lmkSobor(M,o,h,hf,r,S);if(h==='it'||h==='mc'||h==='ly')return lmkDuomo(M,o,h,hf,r,S);return lmkGothic(M,o,h,hf,r,S);}
// Готический собор: неф и боковые нефы, трансепт, апсида с обходом, контрфорсы и аркбутаны, западный фасад с башнями, порталами и розой
function lmkGothic(M,o,h,hf,r,S){
  const L=clamp(o.l||90,30,160),W=clamp(o.w||L*0.36,L*0.26,L*0.5),Hn=clamp(L*0.23,11,38),wn=W*0.38,a=(W-wn)/2,Ha=Hn*0.46,
    bar=h==='at',uk=h==='uk'||h==='ie',one=h==='be'||h==='nl',brick=h==='nl'||(h==='de'&&r()<0.3),
    st=brick?S.br:bar?'#efe8d6':h==='de'?'#8e8a83':S.st,tr=brick?'#d9d1c1':bar?'#ffffff':shade(st,0.16),gl='#2e3448',dk='#1d1b20',
    rf=bar?'#9a3f2c':uk?'#6e7378':h==='ch'?'#9c4a32':h==='es'?'#a9563a':'#59606b',sp=brick?'#5d7f74':h==='de'?'#7d7a74':st,
    top=clamp(o.h>0?o.h:L*0.58,Hn*1.6,Math.max(Hn*1.7,L*1.1)),
    tv=bar?'onion':uk?'pinn':brick&&h==='de'?'hood':h==='nl'?'lant':h==='fr'&&(/нотр|notre/i.test(o.n)||r()<0.5)?'flat':'spire',
    Rh=uk?wn*0.2:bar?wn*0.42:wn*0.62,yr=Ha+a*0.42,z0=-L/2,ts=one?wn*1.12:a,zA=z0+(one?ts*0.75:a),zc=L/2-W/2,zT=zA+(zc-zA)*0.6,tw=wn*1.08,Xt=W/2+a*0.7,
    ar=bar?1:2,nb=Math.max(2,Math.round((zc-zA)/clamp(Hn*0.36,5,10))),bl=(zc-zA)/nb,inT=z=>Math.abs(z-zT)<tw/2+0.4;
  lmkPl(M,-W/2,W/2,z0,L/2,hf,'#8a8274');
  // боковые нефы: наружные стены по пролётам, верхний ряд окон нефа, кровли, контрфорсы и аркбутаны
  [-1,1].forEach(s=>{const X=s*W/2;
    for(let k=0;k<nb;k++){const za=zA+k*bl,zb=za+bl;if(inT((za+zb)/2))continue;
      const f=lmkQ(M,[[X,0,za],[X,0,zb],[X,Ha,zb],[X,Ha,za]],st,'wall',[s,0,0]);lmkWin(f,lmkFP(f),0,Ha*0.2,bl*0.34,Ha*0.48,{ar,f:tr,g:gl});
      const c=lmkQ(M,[[s*wn/2,yr-0.4,za],[s*wn/2,yr-0.4,zb],[s*wn/2,Hn,zb],[s*wn/2,Hn,za]],st,'wall',[s,0,0]);lmkWin(c,lmkFP(c),0,yr+0.6,bl*0.42,(Hn-yr)*0.56,{ar,f:tr,g:gl});
      if(uk)lmkCren(M,[s*(wn/2-0.3),za],[s*(wn/2-0.3),zb],Hn,Hn,0.6,0,0.5,1.0,2.2,st,'wall');}
    [[zA,zT-tw/2],[zT+tw/2,zc]].forEach(([za,zb])=>lmkQ(M,[[X+s*0.5,Ha-0.25,za],[X+s*0.5,Ha-0.25,zb],[s*wn/2,yr,zb],[s*wn/2,yr,za]],rf,'roof',[s*(yr-Ha),W/2-wn/2,0]));
    if(one)lmkQ(M,[[s*ts/2,0,zA],[X,0,zA],[X,Ha,zA],[s*ts/2,Ha+(yr-Ha)*(W/2-ts/2)/(W/2-wn/2),zA]],st,'wall',[0,0,-1]);
    if(!bar)for(let k=1;k<nb;k++){const zb=zA+k*bl;if(inT(zb))continue;const bw=clamp(a*0.26,1,2.6);
      mBox(M,Math.min(X-s*0.2,X+s*bw),0,zb-0.55,Math.max(X-s*0.2,X+s*bw),Ha+1.6,zb+0.55,st,'wall',['d']);lmkPyr(M,X+s*bw*0.45,Ha+1.6,zb,0.5,2.6,st,'wall');
      lmkQ(M,[[X+s*bw*0.3,Ha+0.7,zb],[X+s*bw*0.3,Ha+1.6,zb],[s*wn/2,Hn*0.84+0.9,zb],[s*wn/2,Hn*0.84,zb]],st,'wall',[0,0,1],true);}});
  lmkGab(M,-wn/2,wn/2,zA,zc,Hn,Rh,rf,st,'z',0.5);
  // трансепт: торцы с розой и порталом
  const T=mBox(M,-Xt,0,zT-tw/2,Xt,Hn,zT+tw/2,st,'wall',['d','t']);
  [['r',1],['l',-1]].forEach(([k,s])=>{const f=T[k],P=lmkFP(f);lmkWin(f,P,0,0,tw*0.3,Hn*0.24,{ar,f:tr,op:dk,fw:tw*0.05});lmkRose(f,[s*(Xt+0.01),Hn*0.64,zT],tw*0.27,'x',gl,tr);});
  if(Xt-W/2>2)['f','b'].forEach(k=>{const f=T[k],P=lmkFP(f);[-1,1].forEach(s=>lmkWin(f,P,s*(W/2+(Xt-W/2)/2),Ha*0.3,(Xt-W/2)*0.42,Hn*0.42,{ar,f:tr,g:gl}));});
  lmkGab(M,-Xt,Xt,zT-tw/2,zT+tw/2,Hn,Rh*1.02,rf,st,'x',0.5);if(uk)[-1,1].forEach(s=>lmkCren(M,[-Xt,zT+s*(tw/2-0.3)],[Xt,zT+s*(tw/2-0.3)],Hn,Hn,0.6,0,0.5,1.0,2.2,st,'wall'));
  // апсида и обход с капеллами
  const ap=lmkRev(M,[0,0,zc],[[wn/2,0],[wn/2,Hn]],5,st,'wall',{fl:1,a0:0,a1:Math.PI});ap[0].forEach(f=>lmkWin(f,lmkFP(f),0,yr+0.5,wn*0.12,(Hn-yr)*0.58,{ar,f:tr,g:gl}));
  lmkRev(M,[0,Hn,zc],[[wn/2+0.5,-0.3],[0,Rh]],5,rf,'roof',{fl:1,a0:0,a1:Math.PI});
  const am=lmkRev(M,[0,0,zc],[[W/2,0],[W/2,Ha]],7,st,'wall',{fl:1,a0:0,a1:Math.PI});am[0].forEach(f=>lmkWin(f,lmkFP(f),0,Ha*0.2,W*0.08,Ha*0.48,{ar,f:tr,g:gl}));
  lmkRev(M,[0,Ha,zc],[[W/2+0.5,-0.25],[wn/2,yr-Ha]],7,rf,'roof',{fl:1,a0:0,a1:Math.PI});
  // башни западного фасада
  const Ht=tv==='spire'||tv==='hood'||tv==='lant'?Math.max(Hn*1.3,top*(one?0.56:0.5)):tv==='onion'?Math.max(Hn*1.25,top*0.62):tv==='pinn'?Math.min(top,Math.max(Hn*1.75,L*0.38)):top,hs=ts/2;
  (one?[[0,z0+ts/2]]:[[-(wn/2+a/2),z0+a/2],[wn/2+a/2,z0+a/2]]).forEach(([cx,cz])=>{const B=mBox(M,cx-hs,0,cz-hs,cx+hs,Ht,cz+hs,st,'wall',['d']),e=clamp(ts*0.09,0.6,1.6);
    [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx,sz])=>mBox(M,cx+sx*hs-e/2,0,cz+sz*hs-e/2,cx+sx*hs+e/2,Ht*0.86,cz+sz*hs+e/2,st,'wall',['d']));
    ['r','l','f','b'].forEach(k=>{const f=B[k],P=lmkFP(f);[-1,1].forEach(s=>lmkWin(f,P,s*ts*0.18,Ht*0.68,ts*0.16,Ht*0.18,{ar,f:tr,op:dk}));lmkWin(f,P,0,Ht*0.42,ts*0.16,Ht*0.12,{ar,f:tr,g:gl});});
    lmkWin(B.b,lmkFP(B.b),0,0,ts*(one?0.3:0.42),Hn*(one?0.26:0.2),{ar,f:tr,op:dk,fw:ts*0.05});
    if(one)lmkRose(B.b,[cx,Hn*0.62,cz-hs-0.01],ts*0.22,'z',gl,tr);
    if(tv==='flat'){[[-1,-1,1,-1],[1,-1,1,1],[1,1,-1,1],[-1,1,-1,-1]].forEach(([p,q,u,v])=>lmkCren(M,[cx+p*hs,cz+q*hs],[cx+u*hs,cz+v*hs],Ht,Ht,0.8,-1,0.4,1.1,1.1,st,'wall'));
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx,sz])=>lmkSpire(M,cx+sx*(hs-0.5),Ht,cz+sz*(hs-0.5),0.6,ts*0.22,st,'wall'));}
    else if(tv==='pinn'){[[-1,-1,1,-1],[1,-1,1,1],[1,1,-1,1],[-1,1,-1,-1]].forEach(([p,q,u,v])=>lmkCren(M,[cx+p*hs,cz+q*hs],[cx+u*hs,cz+v*hs],Ht,Ht,1.0,-1,0.5,1.3,1.5,st,'wall'));
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx,sz])=>{mBox(M,cx+sx*hs-0.7,Ht,cz+sz*hs-0.7,cx+sx*hs+0.7,Ht+2.2,cz+sz*hs+0.7,st,'wall',['d']);lmkSpire(M,cx+sx*hs,Ht+2.2,cz+sz*hs,0.9,ts*0.55,st,'wall');});}
    else if(tv==='onion'){const O=lmkRev(M,[cx,Ht,cz],[[hs*0.86,0],[hs*0.86,hs*1.2]],8,st,'wall',{fl:1,a0:-Math.PI/8});O[0].forEach((f,i)=>{if(i%2===0)lmkWin(f,lmkFP(f),0,Ht+hs*0.25,hs*0.3,hs*0.5,{ar:1,f:tr,op:dk});});
      const k2=hs/2.6;mLathe(M,[cx,Ht+hs*1.2,cz],'y',[[3.2,0],[3.4,1.2],[2.6,2.8],[1.1,3.8],[0.7,4.6],[1.3,5.4],[0.9,6.6],[0.3,7.6],[0,8]].map(([x,y])=>[x*k2,y*k2]),8,'#5f8f7a','paint');bCross(M,cx,Ht+hs*1.2+8*k2,cz,hs*0.5,'#c9a24a');}
    else if(tv==='hood'){lmkRev(M,[cx,Ht,cz],[[hs*0.92,0],[hs*0.96,hs*0.6],[hs*0.78,hs*1.25],[hs*0.36,hs*1.65],[hs*0.22,hs*1.95],[0,hs*2.1]],10,'#5f8f7a','paint',{sm:1});mSphere(M,cx,Ht+hs*2.2,cz,hs*0.12,'#c9a24a','metal');}
    else if(tv==='lant'){const yl=Ht+(top-Ht)*0.5,O=lmkRev(M,[cx,Ht,cz],[[hs*0.72,0],[hs*0.72,yl-Ht]],8,st,'wall',{fl:1,a0:-Math.PI/8});O[0].forEach(f=>lmkWin(f,lmkFP(f),0,Ht+(yl-Ht)*0.3,hs*0.3,(yl-Ht)*0.45,{ar,f:tr,op:dk}));
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx,sz])=>lmkSpire(M,cx+sx*(hs-0.6),Ht,cz+sz*(hs-0.6),0.7,hs*0.8,st,'wall'));lmkSpire(M,cx,yl,cz,hs*0.76,top-yl,'#5f8f7a','paint');}
    else{const sh=top-Ht,Sp=lmkSpire(M,cx,Ht,cz,hs*0.9,sh,sp,'wall');Sp[0].forEach(f=>{const P=lmkFP(f);[[0.1,0.3],[0.34,0.2]].forEach(([t,k])=>lmkWin(f,P,0,Ht+sh*t,hs*k*0.55,sh*0.07*k/0.3,{ar:2,op:dk}));});
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx,sz])=>{mBox(M,cx+sx*(hs-0.4)-0.6,Ht,cz+sz*(hs-0.4)-0.6,cx+sx*(hs-0.4)+0.6,Ht+1.6,cz+sz*(hs-0.4)+0.6,st,'wall',['d']);lmkSpire(M,cx+sx*(hs-0.4),Ht+1.6,cz+sz*(hs-0.4),0.75,sh*0.22,st,'wall');});}});
  // фасад между башнями: портал, пояс, роза, галерея (у плоских башен) или щипец
  if(!one){const Hf=tv==='flat'?Ht*0.8:Hn+Rh*0.12,F1=mBox(M,-wn/2,0,z0,wn/2,Hn*0.42,zA,st,'wall',['d','t','f','l','r']),F2=mBox(M,-wn/2,Hn*0.42,z0,wn/2,tv==='flat'?Hn*1.02:Hf,zA,st,'wall',['d','f','l','r']);
    const P1=lmkFP(F1.b);lmkWin(F1.b,P1,0,0,wn*0.34,Hn*0.22,{ar,f:tr,op:dk,fw:wn*0.06});if(!bar)F1.b.deco.push({poly:[P1(-wn*0.26,Hn*0.3),P1(wn*0.26,Hn*0.3),P1(0,Hn*0.41)],c:tr});
    lmkRose(F2.b,[0,Hn*0.68,z0-0.01],wn*0.27,'z',gl,tr);F2.b.deco.push({a:[-wn/2,Hn*0.45,z0-0.01],b:[wn/2,Hn*0.45,z0-0.01],w:0.6,c:tr});
    if(tv==='flat'){const F3=mBox(M,-wn/2,Hn*1.02,z0,wn/2,Hf,zA,st,'wall',['d','f','l','r']),P3=lmkFP(F3.b);for(let k=0;k<6;k++)lmkWin(F3.b,P3,(k-2.5)*wn/6.4,Hn*1.02+(Hf-Hn*1.02)*0.25,wn/14,(Hf-Hn*1.02)*0.45,{ar:2,op:dk});
      lmkCren(M,[-wn/2,z0+0.4],[wn/2,z0+0.4],Hf,Hf,0.8,0,0.4,1.0,1.1,st,'wall');}
    else lmkExt(M,[[-wn/2,Hf],[wn/2,Hf],[0,Hf+Rh*0.95]],z0,zA,st,'wall','z',true);}
  // над средокрестием: флеш, башня (Англия), купол (Австрия) или башенка
  if(uk){const c=wn*0.5,Hc=Hn+Rh+Hn*0.72,B=mBox(M,-c,Hn,zT-c,c,Hc,zT+c,st,'wall',['d']);['r','l','f','b'].forEach(k=>{const f=B[k],P=lmkFP(f);[-1,1].forEach(s=>lmkWin(f,P,s*c*0.4,Hn+Rh+1,c*0.32,Hn*0.42,{ar:2,f:tr,op:dk}));});
    [[-1,-1,1,-1],[1,-1,1,1],[1,1,-1,1],[-1,1,-1,-1]].forEach(([p,q,u,v])=>lmkCren(M,[p*c,zT+q*c],[u*c,zT+v*c],Hc,Hc,1.0,-1,0.5,1.3,1.5,st,'wall'));
    [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx,sz])=>lmkSpire(M,sx*(c-0.5),Hc,zT+sz*(c-0.5),0.8,c*0.9,st,'wall'));if(top>Hc+Hn*0.6)lmkSpire(M,0,Hc,zT,c*0.8,top-Hc,st,'wall');}
  else if(bar){const rd=wn*0.42,yd=Hn+Rh*0.55,D=lmkRev(M,[0,yd,zT],[[rd,0],[rd,Hn*0.32]],8,st,'wall',{fl:1,a0:-Math.PI/8});D[0].forEach(f=>lmkWin(f,lmkFP(f),0,yd+Hn*0.08,rd*0.22,Hn*0.16,{ar:1,f:tr,g:gl}));
    lmkDome(M,0,yd+Hn*0.32,zT,rd*1.04,rd*0.95,'#5f8f7a','paint',12);lmkRev(M,[0,yd+Hn*0.32+rd*0.9,zT],[[rd*0.2,0],[rd*0.2,rd*0.4],[0,rd*0.75]],8,'#5f8f7a','paint',{fl:1});}
  else{const big=h==='fr'||tv==='flat',rr=wn*(big?0.09:0.06),y1=Hn+Rh*0.72;lmkRev(M,[0,y1,zT],[[rr,0],[rr,Rh*0.55]],8,'#7a8088','roof',{fl:1});lmkSpire(M,0,y1+Rh*0.55,zT,rr*1.2,Rh*(big?1.5:0.9)+Hn*(big?0.25:0.1),'#7a8088','roof');}}
// Пятиглавый собор: четверик с закомарами (своды поперёк), лопатки, два яруса окон, три апсиды, барабаны с луковицами, крыльцо
function lmkSobor(M,o,h,hf,r,S,mini){
  const L=clamp(o.l||(mini?26:42),mini?12:20,160),W=clamp(o.w||L*0.78,L*0.55,L),Hw=clamp(L*0.4,mini?6:10,36),wc=S.pl||'#f2eee4',tr=shade(wc,-0.06),
    gold='#c9a24a',big=L>=70,rf=big?'#c8a858':'#4f6f5c',rm=big?'paint':'roof',dom=big||r()<0.6?gold:['#3f7a52','#34569a'][Math.floor(r()*2)],gl='#2c313a',
    Lp=Math.min(L*0.15,W*0.28),Ra=W*0.15,zA=-L/2+Lp,zE=L/2-Ra,Lc=zE-zA,zm=(zA+zE)/2,nL=Lc/W>1.12?4:3,nS=3,bL=Lc/nL,bS=W/nS;
  if(!mini)lmkPl(M,-W/2,W/2,-L/2,L/2,hf,'#9a9284');
  const bay=(X0,Z0,X1,Z1,n,nrm)=>{for(let k=0;k<n;k++){const p0=[X0+(X1-X0)*k/n,Z0+(Z1-Z0)*k/n],p1=[X0+(X1-X0)*(k+1)/n,Z0+(Z1-Z0)*(k+1)/n],bw=Math.hypot(p1[0]-p0[0],p1[1]-p0[1]);
    const f=lmkQ(M,[[p0[0],0,p0[1]],[p1[0],0,p1[1]],[p1[0],Hw,p1[1]],[p0[0],Hw,p0[1]]],wc,'wall',nrm),P=lmkFP(f);
    lmkWin(f,P,0,Hw*(mini?0.3:0.17),bw*0.16,Hw*0.25,{ar:1,f:tr,g:gl});if(!mini)lmkWin(f,P,0,Hw*0.6,bw*0.13,Hw*0.19,{ar:1,f:tr,g:gl});f.deco.push({a:P(-bw/2,Hw*0.5),b:P(bw/2,Hw*0.5),w:0.3,c:tr});
    // лопатка
    const q=[p1[0]+nrm[0]*0.15,p1[1]+nrm[2]*0.15];if(k<n-1)mBox(M,q[0]-0.4,0,q[1]-0.4,q[0]+0.4,Hw,q[1]+0.4,wc,'wall',['d','t']);}};
  bay(W/2,zA,W/2,zE,nL,[1,0,0]);bay(-W/2,zE,-W/2,zA,nL,[-1,0,0]);bay(-W/2,zA,W/2,zA,nS,[0,0,-1]);bay(W/2,zE,-W/2,zE,nS,[0,0,1]);
  // своды поперёк куба: их торцы — закомары длинных стен
  for(let k=0;k<nL;k++){const zc=zA+(k+0.5)*bL,R=bL/2,A=[];for(let i=0;i<=8;i++){const t=Math.PI*i/8;A.push([zc+Math.cos(t)*R,Hw+Math.sin(t)*R*0.9,t]);}
    for(let i=0;i<8;i++){const p=A[i],q=A[i+1],tm=(p[2]+q[2])/2;const f=lmkQ(M,[[-W/2-0.25,p[1],p[0]],[W/2+0.25,p[1],p[0]],[W/2+0.25,q[1],q[0]],[-W/2-0.25,q[1],q[0]]],rf,rm,[0,Math.sin(tm),Math.cos(tm)]);f.vn=[[0,Math.sin(p[2]),Math.cos(p[2])],[0,Math.sin(p[2]),Math.cos(p[2])],[0,Math.sin(q[2]),Math.cos(q[2])],[0,Math.sin(q[2]),Math.cos(q[2])]];}
    [-1,1].forEach(s=>{const f=lmkQ(M,A.map(p=>[s*(W/2+0.25),p[1],p[0]]),wc,'wall',[s,0,0]);f.deco=[];for(let i=0;i<8;i+=2)f.deco.push({a:[s*(W/2+0.27),A[i][1]-0.25,A[i][0]],b:[s*(W/2+0.27),A[i+2][1]-0.25,A[i+2][0]],w:0.35,c:tr});});}
  // закомары торцов
  [[zA,-1],[zE,1]].forEach(([z,s])=>{for(let k=0;k<nS;k++){const u0=-W/2+k*bS,u1=u0+bS,R=bS/2,pts=[[u0,Hw],[u1,Hw]];for(let i=1;i<8;i++){const t=Math.PI*i/8;pts.push([(u0+u1)/2+Math.cos(t)*R,Hw+Math.sin(t)*R*0.9]);}
    lmkExt(M,pts,s<0?z-0.25:z-0.6,s<0?z+0.6:z+0.25,wc,'wall','z',true);}});
  // барабаны и главы
  const ped=Hw+Math.max(bL,bS)*0.45,Rd=Math.min(W,Lc)*(mini?0.16:0.15),five=!mini||(o.five===undefined?r()<0.5:o.five),drum=(x,z,R,hD)=>{mBox(M,x-R*1.15,Hw,z-R*1.15,x+R*1.15,ped,z+R*1.15,wc,'wall',['d']);
    const D=lmkRev(M,[x,ped,z],[[R,0],[R,hD]],12,wc,'wall'),sm=mini&&R<Rd*0.9;if(!sm)D[0].forEach((f,i)=>{if(i%(mini?3:2)===0)lmkWin(f,lmkFP(f),0,ped+hD*0.25,R*0.2,hD*0.42,{ar:1,f:tr,g:gl});});
    lmkRev(M,[x,ped+hD,z],[[R*1.08,0],[R*1.08,R*0.12],[R*0.84,R*0.12]],12,tr,'stone');const yo=ped+hD+R*0.12;lmkOnion(M,x,yo,z,R*1.04,R*2.45,dom,mini?10:12);bCross(M,x,yo+R*2.4,z,R*1.0,gold);};
  drum(0,zm,Rd,Rd*1.7);if(five)[[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx,sz])=>drum(sx*W*0.27,zm+sz*Lc*0.27,Rd*0.6,Rd*1.15));
  // апсиды
  [[0,Ra,Hw*0.72],[-W*0.3,Ra*0.7,Hw*0.6],[W*0.3,Ra*0.7,Hw*0.6]].forEach(([x,R,Hh])=>{const A=lmkRev(M,[x,0,zE],[[R,0],[R,Hh]],8,wc,'wall',{a0:0,a1:Math.PI});
    A[0].forEach((f,i)=>{if(i===3||i===4&&R>3)lmkWin(f,lmkFP(f),0,Hh*0.35,Math.min(1,R*0.18),Hh*0.32,{ar:1,f:tr,g:gl});});
    lmkRev(M,[x,Hh,zE],[[R+0.25,0],[R*0.92,R*0.42],[R*0.6,R*0.72],[0,R*0.86]],8,rf,rm,{sm:1,a0:0,a1:Math.PI});});
  // крыльцо
  const pw=W*0.24,ph=Hw*0.42,Pc=mBox(M,-pw,0,-L/2,pw,ph,zA,wc,'wall',['d','t','f']);lmkWin(Pc.b,lmkFP(Pc.b),0,0,pw*0.55,ph*0.6,{ar:1,f:tr,op:'#4a3424'});lmkGab(M,-pw,pw,-L/2,zA,ph,pw*0.55,rf,wc,'z',0.3,rm);}
// Итальянский собор: базилика под черепицей, фасад-ширма с фронтоном и розой, полосатый мрамор, восьмигранный купол на барабане, кампанила рядом
function lmkDuomo(M,o,h,hf,r,S){
  const L=clamp(o.l||70,26,160),W=clamp(o.w||L*0.42,L*0.3,L*0.55),Hn=clamp(L*0.2,9,32),wn=W*0.44,a=(W-wn)/2,Ha=Hn*0.58,Rh=wn*0.24,yr=Ha+a*0.22,
    wc=h==='it'?'#e9e2d2':h==='ly'?'#f1ece0':'#ece4d2',bd=h==='it'?'#5c7064':null,rf='#ad5638',tr=shade(wc,-0.1),gl='#2c313a',dk='#1d1b20',
    z0=-L/2,ft=1.4,zA=z0+ft,zc=L/2-wn/2,dome=h!=='mc'&&L>=40,zT=zA+(zc-zA)*0.72,tw=wn*1.1,Xt=W/2+a*0.7,nb=Math.max(2,Math.round((zc-zA)/clamp(Hn*0.5,4,9))),bl=(zc-zA)/nb,inT=z=>dome&&Math.abs(z-zT)<tw/2+0.3;
  lmkPl(M,-W/2,W/2,z0,L/2,hf,'#8a8274');
  [-1,1].forEach(s=>{const X=s*W/2;for(let k=0;k<nb;k++){const za=zA+k*bl,zb=za+bl;if(inT((za+zb)/2))continue;
      const f=lmkQ(M,[[X,0,za],[X,0,zb],[X,Ha,zb],[X,Ha,za]],wc,'wall',[s,0,0]),P=lmkFP(f);lmkWin(f,P,0,Ha*0.3,bl*0.24,Ha*0.36,{ar:1,f:tr,g:gl});if(bd)[0.12,0.86].forEach(t=>f.deco.push({a:P(-bl/2,Ha*t),b:P(bl/2,Ha*t),w:0.5,c:bd}));
      const c=lmkQ(M,[[s*wn/2,yr-0.3,za],[s*wn/2,yr-0.3,zb],[s*wn/2,Hn,zb],[s*wn/2,Hn,za]],wc,'wall',[s,0,0]);lmkWin(c,lmkFP(c),0,yr+0.6,bl*0.2,(Hn-yr)*0.42,{ar:1,f:tr,g:gl});}
    [[zA,dome?zT-tw/2:zc],[dome?zT+tw/2:zc,zc]].forEach(([za,zb])=>{if(zb-za>0.5)lmkQ(M,[[X+s*0.4,Ha-0.15,za],[X+s*0.4,Ha-0.15,zb],[s*wn/2,yr,zb],[s*wn/2,yr,za]],rf,'roof',[s*(yr-Ha),a,0]);});});
  lmkGab(M,-wn/2,wn/2,zA,zc,Hn,Rh,rf,wc,'z',0.5);
  // фасад-ширма
  const Fm=lmkExt(M,[[-wn/2,0],[wn/2,0],[wn/2,Hn+1],[0,Hn+Rh+2.4],[-wn/2,Hn+1]],z0,zA,wc,'wall','z',true),P=lmkFP(Fm.a);
  lmkWin(Fm.a,P,0,0,wn*0.24,Hn*0.26,{ar:1,f:tr,op:'#4a3424',fw:wn*0.04});lmkRose(Fm.a,[0,Hn*0.66,z0-0.01],wn*0.17,'z',gl,tr);
  Fm.a.deco.push({a:P(-wn/2,Hn*0.42),b:P(wn/2,Hn*0.42),w:0.6,c:bd||tr},{a:P(-wn/2,Hn+0.6),b:P(wn/2,Hn+0.6),w:0.7,c:bd||tr});
  [-1,1].forEach(s=>{const F=lmkExt(M,[[s*wn/2,0],[s*W/2,0],[s*W/2,Ha+0.6],[s*wn/2,yr+1.3]],z0,zA,wc,'wall','z',true),Q=lmkFP(F.a);lmkWin(F.a,Q,0,0,a*0.36,Ha*0.36,{ar:1,f:tr,op:'#4a3424'});if(bd)F.a.deco.push({a:[s*wn/2,Ha*0.5,z0-0.01],b:[s*W/2,Ha*0.5,z0-0.01],w:0.5,c:bd});});
  // апсида
  lmkRev(M,[0,0,zc],[[wn/2,0],[wn/2,Hn*0.86]],8,wc,'wall',{a0:0,a1:Math.PI}).forEach(row=>row.forEach((f,i)=>{if(i%2)lmkWin(f,lmkFP(f),0,Hn*0.35,wn*0.08,Hn*0.24,{ar:1,f:tr,g:gl});}));
  lmkRev(M,[0,Hn*0.86,zc],[[wn/2+0.4,-0.2],[0,Rh*0.9]],8,rf,'roof',{a0:0,a1:Math.PI});
  if(dome){const T=mBox(M,-Xt,0,zT-tw/2,Xt,Hn,zT+tw/2,wc,'wall',['d','t']);['r','l'].forEach(k=>{const f=T[k],Q=lmkFP(f);lmkWin(f,Q,0,Hn*0.2,tw*0.14,Hn*0.32,{ar:1,f:tr,g:gl});f.deco.push({dot:Q(0,Hn*0.76),r:tw*0.11,c:tr},{dot:Q(0,Hn*0.76),r:tw*0.08,c:gl,gl:1});});
    lmkGab(M,-Xt,Xt,zT-tw/2,zT+tw/2,Hn,Rh,rf,wc,'x',0.5);
    const rd=wn*0.56,yd=Hn+Rh*0.6,hd=Hn*0.36;lmkRev(M,[0,yd,zT],[[rd,0],[rd,hd]],8,wc,'wall',{fl:1,a0:-Math.PI/8})[0].forEach(f=>{const Q=lmkFP(f);f.deco=[{dot:Q(0,yd+hd*0.55),r:rd*0.17,c:tr},{dot:Q(0,yd+hd*0.55),r:rd*0.12,c:gl,gl:1}];});
    const y2=yd+hd,pr=[[rd*1.04,0],[rd*0.98,rd*0.42],[rd*0.82,rd*0.8],[rd*0.52,rd*1.08],[rd*0.18,rd*1.24]];lmkRev(M,[0,y2,zT],[[rd*1.06,-0.3],[rd*1.06,0]],8,tr,'stone',{fl:1,a0:-Math.PI/8});
    lmkRev(M,[0,y2,zT],pr,8,'#b4573a','roof',{fa:1,a0:-Math.PI/8});
    for(let k=0;k<8;k++){const t=-Math.PI/8+k*Math.PI/4,c=Math.cos(t),s2=Math.sin(t),T2=[-s2,0,c];for(let i=0;i<pr.length-1;i++){const A=pr[i],B=pr[i+1],p=(q,e)=>[q[0]*1.012*c+T2[0]*e,y2+q[1]+0.06,zT+q[0]*1.012*s2+T2[2]*e];
      lmkQ(M,[p(A,-0.4),p(B,-0.3),p(B,0.3),p(A,0.4)],'#f1ece0','stone',[c,0.5,s2]);}}
    const yl=y2+rd*1.24;lmkRev(M,[0,yl,zT],[[rd*0.21,0],[rd*0.21,rd*0.32]],8,'#f1ece0','wall',{fl:1,a0:-Math.PI/8});lmkSpire(M,0,yl+rd*0.32,zT,rd*0.24,rd*0.34,'#b4573a','roof');mSphere(M,0,yl+rd*0.7,zT,rd*0.05,'#c9a24a','metal');}
  // кампанила
  const Hc=clamp(Hn*2.3,20,90),k=Hc/28.9,B=BLD.campanile(r,h==='it'?Math.floor(r()*3):1);lmkScale(B,k,k,k);lmkMove(B,W/2+3+2.9*k,0,z0+2.9*k+2);lmkAdd(M,B);}
// Церковь: своя модель страны (русская, английская, американская, альпийская, общая), в Италии и Испании — базилика с кампанилой
function lmkChurch(M,o,h,hf,r,S){const L=clamp(o.l||24,10,60);if(h==='it'||h==='es'||h==='mc'||h==='ly')return lmkBasil(M,o,h,hf,r,S);
  const key={ru:'church_ru',uk:'church_uk',ie:'church_uk',us:'church_us',at:'church_at',ch:'church_at',de:r()<0.5?'church_at':'church'}[h]||'church',B=BLD[key](r,Math.floor(r()*3));
  if(key==='church_uk')B.F.forEach(f=>{if(Math.abs(f.n[1])>0.1||!f.p.every(q=>q[2]<-4.95&&Math.abs(q[0])<2.85&&q[1]<15.1))return;const P=lmkFP(f),dk='#1d1b20';
    [-1,1].forEach(s=>lmkWin(f,P,s*0.9,11.2,0.75,1.6,{ar:2,f:'#c8c0ae',op:dk}));if(f.n[2]<-0.9){lmkWin(f,P,0,0,1.3,2.4,{ar:2,f:'#c8c0ae',op:'#4a3424'});lmkWin(f,P,0,6,0.8,1.8,{ar:2,f:'#c8c0ae',g:'#3a3a4a'});}});
  lmkStoneTex(B);lmkFit(B,L,o.w,o.h,0.8,1.25);const b=lmkBox3(B);lmkPl(M,b[0]+0.5,b[3]-0.5,b[2]+0.5,b[5]-0.5,hf,'#8a8274');lmkAdd(M,B);}
// Базилика: неф под пологой черепицей, фасад с фронтоном, окулюсом и порталом, апсида, кампанила сбоку
function lmkBasil(M,o,h,hf,r,S){const L=clamp(o.l||24,10,60),W=clamp(o.w||L*0.45,6,L*0.6),H=clamp(W*0.95,6,18),wc=h==='es'?'#ece2cc':S.pl,tr=shade(wc,-0.1),rf='#ad5638',gl='#2c313a',z1=L/2-W*0.3;
  lmkPl(M,-W/2,W/2,-L/2,L/2,hf,'#8a8274');
  const B=mBox(M,-W/2,0,-L/2+1,W/2,H,z1,wc,'wall',['d','t','b','f']);['r','l'].forEach(k=>{const f=B[k],P=lmkFP(f),n=Math.max(2,Math.round(L/7));for(let i=0;i<n;i++)lmkWin(f,P,(i-(n-1)/2)*(L-2)/n,H*0.5,0.9,H*0.25,{ar:1,f:tr,g:gl});});
  const F=lmkExt(M,[[-W/2-0.3,0],[W/2+0.3,0],[W/2+0.3,H+0.5],[0,H+W*0.3+1],[-W/2-0.3,H+0.5]],-L/2,-L/2+1,wc,'wall','z',true),P=lmkFP(F.a);
  lmkWin(F.a,P,0,0,W*0.22,H*0.36,{ar:1,f:tr,op:'#4a3424'});F.a.deco.push({dot:P(0,H*0.72),r:W*0.1,c:tr},{dot:P(0,H*0.72),r:W*0.075,c:gl,gl:1},{a:P(-W/2-0.3,H+0.25),b:P(W/2+0.3,H+0.25),w:0.45,c:tr});
  lmkGab(M,-W/2,W/2,-L/2+1,z1,H,W*0.26,rf,wc,'z',0.4);lmkRev(M,[0,0,z1],[[W*0.3,0],[W*0.3,H*0.8]],8,wc,'wall',{a0:0,a1:Math.PI});lmkRev(M,[0,H*0.8,z1],[[W*0.3+0.35,-0.2],[0,W*0.18]],8,rf,'roof',{a0:0,a1:Math.PI});
  const Bc=BLD.campanile(r,h==='es'?1:Math.floor(r()*3)),k=clamp(H*2.1/28.9,0.6,2.2);lmkScale(Bc,k,k,k);lmkMove(Bc,W/2+2.9*k+0.6,0,z1-2.9*k);lmkAdd(M,Bc);}
// Часовня: маленький объём, двускатная крыша, апсида; звонница по стране (русская — глава на крыше, альпийская — башенка с луковицей, южная — стенка-звонница)
function lmkChapel(M,o,h,hf,r,S){const L=clamp(o.l||9,5,22),W=clamp(o.w||L*0.62,3.5,L*0.85),H=clamp(W*0.9,3,7.5),ru=h==='ru',south=h==='it'||h==='es'||h==='mc'||h==='ly',alp=h==='at'||h==='ch'||h==='de',
    wc=ru||south||h==='us'||alp?S.pl:S.st,rf=ru?'#4f6f5c':h==='us'?'#50565f':S.rf,tr=shade(wc,-0.1),gl='#2c313a';
  lmkPl(M,-W/2,W/2,-L/2,L/2,hf,'#8a8274',0.15);
  const B=mBox(M,-W/2,0,-L/2,W/2,H,L/2,wc,'wall',['d','t']);['r','l'].forEach(k=>{const f=B[k],P=lmkFP(f);[-L*0.22,L*0.22].forEach(u=>lmkWin(f,P,u,H*0.32,Math.min(0.9,L*0.08),H*0.36,{ar:1,f:tr,g:gl}));});
  lmkWin(B.b,lmkFP(B.b),0,0,Math.min(1.4,W*0.3),Math.min(2.3,H*0.5),{ar:1,f:tr,op:'#4a3424'});
  if(ru){lmkHip(M,-W/2,W/2,-L/2,L/2,H,W*0.32,rf,0.3);const rd=W*0.18,y=H+W*0.26;bDrum(M,0,y,0,rd,rd*1.5,wc,10);bOnion(M,0,y+rd*1.5+0.22,0,rd*1.12,rd*2.4,r()<0.6?'#c9a24a':'#34569a');bCross(M,0,y+rd*3.85,0,rd*1.3);return;}
  lmkGab(M,-W/2,W/2,-L/2,L/2,H,W*(south?0.3:h==='uk'||h==='ie'?0.62:0.55),rf,wc,'z',0.35);
  lmkRev(M,[0,0,L/2],[[W*0.3,0],[W*0.3,H*0.85]],6,wc,'wall',{fl:1,a0:0,a1:Math.PI});lmkRev(M,[0,H*0.85,L/2],[[W*0.3+0.3,-0.2],[0,W*0.24]],6,rf,'roof',{fl:1,a0:0,a1:Math.PI});
  if(south){const F=lmkExt(M,[[-W*0.28,H],[W*0.28,H],[W*0.28,H+W*0.55],[0,H+W*0.75],[-W*0.28,H+W*0.55]],-L/2,-L/2+0.6,wc,'wall','z',true);lmkWin(F.a,lmkFP(F.a),0,H+W*0.14,W*0.2,W*0.24,{ar:1,op:'#2a2622'});}
  else if(alp){mBox(M,-0.8,H,-L/2+1,0.8,H+W*0.75,-L/2+2.6,wc,'wall',['d']);mLathe(M,[0,H+W*0.75,-L/2+1.8],'y',[[1.1,0],[1.2,0.5],[0.9,1.1],[0.35,1.5],[0.5,1.9],[0.25,2.5],[0,2.8]],8,'#5f8f7a','paint');bCross(M,0,H+W*0.75+2.7,-L/2+1.8,0.8,'#c9a24a');}
  else{const s=Math.min(1.1,W*0.2),y=H+W*0.45,Bt=mBox(M,-s,y-1,-L/2+0.4,s,y+s*2,-L/2+0.4+s*2,h==='us'?'#f4f2ec':wc,'wall',['d']);lmkWin(Bt.b,lmkFP(Bt.b),0,y+0.2,s*0.9,s*1.0,{ar:h==='us'?1:2,op:'#2a2622'});
    lmkSpire(M,0,y+s*2,-L/2+0.4+s,s*1.25,s*(h==='us'?4.5:2.6),h==='us'?'#f4f2ec':rf,'roof',h==='us'?8:4);}}
/* ---------- замки, крепости, стены ---------- */
function lmkCastle(M,o,h,hf,r,S){
  const sty=h==='ru'?'kr':h==='cn'?'cn':h==='fr'||h==='be'?'fr':h==='de'||h==='at'||h==='ch'||h==='nl'?'de':h==='it'||h==='mc'?'it':h==='es'||h==='ly'?'es':'uk',
    L=clamp(o.l||60,20,240),W=clamp(o.w||L*0.7,16,L),Hw=clamp(o.h>0?o.h*0.42:Math.min(L,W)*0.2,6,15);
  if(sty==='de'&&L<=70&&W>=L*0.7&&!hf){const B=lmkStoneTex(BLD.castle(r,1)),s=L/36;lmkScale(B,s,s,s);return lmkAdd(M,B);}
  const st=sty==='kr'?'#a8432f':sty==='cn'?'#8d8a83':sty==='it'?'#a85a3c':h==='ly'?'#c9a682':S.st,tr=sty==='kr'?'#ece4d2':shade(st,0.15),rf=sty==='de'?'#9e432d':'#59606b',gl='#2e3440',dk='#1d1b20',
    rd=sty==='fr'||sty==='uk'||sty==='es'||(sty==='de'&&r()<0.6);
  const tow=sty==='kr'?lmkWT(M,hf,'kr',{H:Hw,s:Math.min(9,W*0.2),rf:'#3f5f4a',st,tr}):sty==='cn'?lmkWT(M,hf,'cn',{H:Hw,s:10,st,pav:1}):rd?lmkWT(M,hf,'rd',{H:Hw,R:clamp(Hw*0.42,3,6.5),cone:sty==='fr'||sty==='de',rf,st}):lmkWT(M,hf,'sq',{H:Hw,s:clamp(Hw*0.8,5,10),st,sw:sty==='it'});
  lmkWallLine(M,[[W/2,-L/2],[W/2,L/2],[-W/2,L/2],[-W/2,-L/2]],hf,{H:Hw,t:2.6,col:st,cl:1,cr:sty==='kr'||sty==='it'?'s':'m',st:sty==='kr'?3.4:2.4,ip:sty!=='kr',tow,corner:0.6,ts:L>150?(L+W)/2:0});
  // ворота на +x (к дороге)
  lmkAt(M,hf,W/2,0,Q=>{if(rd&&sty!=='de'){const R=clamp(Hw*0.36,2.6,4.5);[-1,1].forEach(s=>{const T=lmkRev(Q,[R*0.4,-1.6,s*(R+2)],[[R,0],[R,Hw*1.35+1.6]],12,st,'wall');lmkRev(Q,[R*0.4,Hw*1.35,s*(R+2)],[[R+0.3,0],[R+0.3,0.4],[0,0.4]],12,shade(st,0.08),'stone');
        if(sty==='fr')lmkCone(Q,R*0.4,Hw*1.35+0.4,s*(R+2),R*1.12,R*2.3,rf,'roof');else lmkCrenRing(Q,R*0.4,Hw*1.35+0.4,s*(R+2),R,10,0.6,1.3,st,'wall');});
      const B=mBox(Q,-2,-1.6,-2.2,2.6,Hw*1.15,2.2,st,'wall',['d']);lmkWin(B.r,lmkFP(B.r),0,0,2.8,Hw*0.42,{ar:1,f:tr,op:dk});lmkCren(Q,[2.3,-2.2],[2.3,2.2],Hw*1.15,Hw*1.15,0.6,0,0.6,1.3,1.6,st,'wall');}
    else{const s=sty==='cn'?12:9,Hg=Hw*1.7,B=mBox(Q,-s/2+1,-1.6,-s/2,s/2+1,Hg,s/2,st,'wall',['d']);lmkWin(B.r,lmkFP(B.r),0,0,s*0.36,Hw*0.5,{ar:1,f:tr,op:dk});
      if(sty==='cn'){mBox(Q,-s/2+2,Hg,-s/2+1,s/2,Hg+3.2,s/2-1,'#8a2a22','wood',['d','t']);lmkCnRoof(Q,-s/2+2,s/2,-s/2+1,s/2-1,Hg+3.2,2.6,1.6,'#4a5058');}
      else if(sty==='kr'){lmkSpire(Q,1,Hg,0,s*0.48,s*1.4,'#3f5f4a','roof',4);mSphere(Q,1,Hg+s*1.4+0.25,0,0.35,'#c9a24a','metal');}
      else if(sty==='de')lmkPyr(Q,1,Hg,0,s/2+0.3,s*0.9,rf,'roof');else[[-1,-1,1,-1],[1,-1,1,1],[1,1,-1,1],[-1,1,-1,-1]].forEach(([a,b,c,d])=>lmkCren(Q,[a*s/2+1,b*s/2],[c*s/2+1,d*s/2],Hg,Hg,1.0,-1,0.6,1.4,2.0,st,'wall',sty==='it'));}});
  // донжон (или собор кремля, павильон в Китае) и палас
  const ks=clamp(Math.min(L,W)*0.3,8,22),Hk=clamp(o.h>0?o.h:Hw*2.5,Hw*1.5,58);
  if(sty==='kr'){lmkAt(M,hf,-W*0.1,-L*0.05,Q=>lmkSobor(Q,{l:clamp(Math.min(L,W)*0.38,14,40),five:L>=150},'ru',null,r,lmkS('ru'),1));lmkAt(M,hf,W*0.22,L*0.28,Q=>lmkBelfry(Q,0,0,clamp(W*0.12,5,9),clamp(Hk*1.1,22,60),'#f2eee4','#ffffff','#3f5f4a','#c9a24a'));return;}
  if(sty==='cn'){lmkAt(M,hf,-W*0.08,0,Q=>lmkCnHall(Q,-W*0.16,W*0.16,-L*0.2,L*0.2,0,clamp(Hw*0.8,5,9),{}));return;}
  lmkAt(M,hf,-W*0.14,-L*0.16,Q=>{if(sty==='fr'||(sty==='de'&&rd)){const R=ks/2,T=lmkRev(Q,[0,-1.6,0],[[R,0],[R,Hk+1.6]],14,st,'wall');T[0].forEach((f,i)=>{if(i%3===0)lmkWin(f,lmkFP(f),0,Hk*0.55,0.8,1.6,{ar:1,f:tr,g:gl});});
      lmkRev(Q,[0,Hk,0],[[R,0],[R+0.6,0.5],[R+0.6,1.6],[R,1.6]],14,shade(st,0.06),'wall');lmkCone(Q,0,Hk+1.6,0,R+0.8,R*(sty==='fr'?2.0:1.6),rf,'roof',14);}
    else{const s=ks/2,B=mBox(Q,-s,-1.6,-s,s,Hk,s,st,'wall',['d']);['r','l','f','b'].forEach(k=>{const f=B[k],P=lmkFP(f);[0.45,0.7].forEach(t=>lmkWin(f,P,0,Hk*t,0.9,1.8,{ar:1,f:tr,g:gl}));});
      if(sty==='de')lmkPyr(Q,0,Hk,0,s+0.3,s*2.2,rf,'roof');
      else{[[-1,-1,1,-1],[1,-1,1,1],[1,1,-1,1],[-1,1,-1,-1]].forEach(([a,b,c,d])=>lmkCren(Q,[a*s,b*s],[c*s,d*s],Hk,Hk,1.0,-1,0.6,1.4,2.0,st,'wall',sty==='it'));
        if(sty==='uk')[[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([x,z])=>{const B2=mBox(Q,x*s-1.4,Hk,z*s-1.4,x*s+1.4,Hk+3.2,z*s+1.4,st,'wall',['d']);[[-1,-1,1,-1],[1,-1,1,1],[1,1,-1,1],[-1,1,-1,-1]].forEach(([a,b,c,d])=>lmkCren(Q,[x*s+a*1.4,z*s+b*1.4],[x*s+c*1.4,z*s+d*1.4],Hk+3.2,Hk+3.2,0.6,-1,0.4,1.0,1.4,st,'wall'));});
        if(sty==='es')[[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([x,z])=>{lmkRev(Q,[x*s,Hk-3,z*s],[[0,0],[1.3,1.2],[1.3,4.2],[0,4.2]],8,st,'wall');lmkCrenRing(Q,x*s,Hk+1.2,z*s,1.1,6,0.4,0.9,st,'wall');});}}});
  const pd=clamp(W*0.24,6,14),pl=clamp(L*0.45,10,60);lmkAt(M,hf,-W/2+1.4+pd/2,L*0.18,Q=>{const Hp=Hw*1.35,B=lmkBlk(Q,-pd/2,pd/2,-pl/2,pl/2,-1.6,Hp+1.6,{col:st,fl:1,sd:'r',bay:4,win:(f,P,v)=>lmkWin(f,P,0,Hp*0.62,0.9,1.9,{ar:sty==='uk'?2:1,f:tr,g:gl})});
    if(sty==='fr'||sty==='de')lmkGab(Q,-pd/2,pd/2,-pl/2,pl/2,Hp,pd*0.75,rf,st,'z',0.4);else{lmkGab(Q,-pd/2,pd/2,-pl/2,pl/2,Hp,pd*0.35,rf,st,'z',0.2);lmkCren(Q,[pd/2-0.3,-pl/2],[pd/2-0.3,pl/2],Hp,Hp,0.6,0,0.5,1.1,1.6,st,'wall',sty==='it');}});}
// Ярусная колокольня: четверик, восьмерики со звоном, шатёр или глава
function lmkBelfry(M,x,z,s,H,wc,tr,rf,dom){const y1=H*0.38,y2=H*0.58,y3=H*0.74,dk='#2a2622';
  const B=mBox(M,x-s/2,0,z-s/2,x+s/2,y1,z+s/2,wc,'wall',['d']);['r','l','f','b'].forEach(k=>lmkWin(B[k],lmkFP(B[k]),0,y1*0.45,s*0.18,y1*0.3,{ar:1,f:tr,g:'#2c313a'}));
  mBox(M,x-s/2-0.25,y1,z-s/2-0.25,x+s/2+0.25,y1+0.45,z+s/2+0.25,tr,'stone',[]);
  lmkRev(M,[x,y1+0.45,z],[[s*0.48,0],[s*0.48,y2-y1-0.45]],8,wc,'wall',{fl:1,a0:-Math.PI/8})[0].forEach(f=>lmkWin(f,lmkFP(f),0,y1+(y2-y1)*0.25,s*0.2,(y2-y1)*0.4,{ar:1,f:tr,op:dk}));
  lmkRev(M,[x,y2,z],[[s*0.52,0],[s*0.52,0.35],[0,0.35]],8,tr,'stone',{fl:1,a0:-Math.PI/8});
  lmkRev(M,[x,y2+0.35,z],[[s*0.38,0],[s*0.38,y3-y2-0.35]],8,wc,'wall',{fl:1,a0:-Math.PI/8})[0].forEach(f=>lmkWin(f,lmkFP(f),0,y2+(y3-y2)*0.25,s*0.16,(y3-y2)*0.45,{ar:1,f:tr,op:dk}));
  if(dom){lmkSpire(M,x,y3,z,s*0.42,(H-y3)*0.62,rf,'roof',8);const yd=y3+(H-y3)*0.6;bDrum(M,x,yd,z,s*0.08,s*0.3,wc,8);bOnion(M,x,yd+s*0.3+0.2,z,s*0.12,s*0.34,dom,'metal');bCross(M,x,yd+s*0.62,z,s*0.3,'#c9a24a');}
  else{lmkSpire(M,x,y3,z,s*0.42,H-y3,rf,'roof',8);mSphere(M,x,H,z,s*0.05,'#c9a24a','metal');}}
// Крепость с бастионами: низкие стены с откосом и бруствером, пятиугольные бастионы по углам, казармы, пороховой погреб, флаг
function lmkFort(M,o,h,hf,r,S){const L=clamp(o.l||120,30,500),W=clamp(o.w||L*0.75,25,L),Hf=clamp(o.h>0?o.h:7,4,14),b=Math.min(L,W)*0.16,fl=b*0.5,sal=b*1.0,
    st=h==='ru'||h==='nl'||h==='de'&&r()<0.4?S.br:S.st,rf=S.rf,C=[[W/2,-L/2],[W/2,L/2],[-W/2,L/2],[-W/2,-L/2]],pts=[];
  for(let i=0;i<4;i++){const c=C[i],p=C[(i+3)%4],q=C[(i+1)%4],lu=Math.hypot(c[0]-p[0],c[1]-p[1]),lv=Math.hypot(q[0]-c[0],q[1]-c[1]),u=[(c[0]-p[0])/lu,(c[1]-p[1])/lu],v=[(q[0]-c[0])/lv,(q[1]-c[1])/lv],dl=Math.hypot(c[0],c[1]),dg=[c[0]/dl,c[1]/dl];
    const P1=[c[0]-u[0]*b,c[1]-u[1]*b],P5=[c[0]+v[0]*b,c[1]+v[1]*b];pts.push(P1,[P1[0]+u[1]*fl,P1[1]-u[0]*fl],[c[0]+dg[0]*sal*1.6,c[1]+dg[1]*sal*1.6],[P5[0]+v[1]*fl,P5[1]-v[0]*fl],P5);}
  lmkWallLine(M,pts,hf,{H:Hf,t:4,ti:1.1,col:st,cl:1,cr:'p'});
  // ворота
  lmkAt(M,hf,W/2+0.6,0,Q=>{const B=mBox(Q,-3,-1.6,-4,1.6,Hf+2.2,4,shade(st,0.06),'wall',['d']);lmkWin(B.r,lmkFP(B.r),0,0,3,Hf*0.55,{ar:1,f:shade(st,0.2),op:'#1d1b20'});lmkExt(Q,[[-4,Hf+2.2],[4,Hf+2.2],[0,Hf+3.6]],-0.5,1.6,shade(st,0.06),'wall','x',true);});
  // казармы вдоль длинных сторон, погреб, флаг
  [-1,1].forEach(s=>lmkAt(M,hf,s*(W/2-9),0,Q=>{const l=Math.min(L*0.55,70);lmkBlk(Q,-4,4,-l/2,l/2,-1.2,7.2,{col:'#d8cfbb',fl:2,bay:3.8,sd:s>0?'l':'r',win:(f,P,v)=>lmkWin(f,P,0,v+0.9,1,1.5,{f:'#f2ece0',g:'#34465a'})});lmkHip(Q,-4,4,-l/2,l/2,6,2.8,rf,0.4);}));
  lmkAt(M,hf,0,-L*0.15,Q=>{mBox(Q,-4,-1,-3,4,3.6,3,st,'wall',['d']);lmkGab(Q,-4,4,-3,3,3.6,2.6,rf,st,'z',0.3);});
  lmkAt(M,hf,0,L*0.12,Q=>{mBox(Q,-0.09,0,-0.09,0.09,16,0.09,'#8a8f96','metal');const f=lmkQ(Q,[[0,15.9,0.1],[0,15.9,3.3],[0,13.8,3.3],[0,13.8,0.1]],'#f4f2ec','cloth',[1,0,0],true);
    const fc={ru:['#f4f2ec','#2b4f9a','#c8322a'],fr:['#2b4f9a','#f4f2ec','#c8322a'],it:['#2f7a45','#f4f2ec','#c8322a'],de:['#1c1c1c','#c8322a','#e8c24a'],be:['#1c1c1c','#e8c24a','#c8322a'],nl:['#c8322a','#f4f2ec','#2b4f9a']}[h]||['#c8322a','#f4f2ec','#2b4f9a'],vert=h==='fr'||h==='it'||h==='be';
    f.deco=fc.map((c,i)=>({poly:vert?[[0,15.9,0.1+i*1.07],[0,15.9,0.1+(i+1)*1.07],[0,13.8,0.1+(i+1)*1.07],[0,13.8,0.1+i*1.07]]:[[0,15.9-i*0.7,0.1],[0,15.9-i*0.7,3.3],[0,15.9-(i+1)*0.7,3.3],[0,15.9-(i+1)*0.7,0.1]],c}));});}
// Руины: обломки стен разной высоты с пустыми окнами, огрызок башни, камни
function lmkRuins(M,o,h,hf,r,S){const L=clamp(o.l||25,8,120),W=clamp(o.w||L*0.6,6,L),Hm=clamp(o.h>0?o.h:Math.min(14,L*0.45),4,30),st=shade(h==='ru'?'#a8432f':h==='nl'?'#98442f':S.st,-0.05),dk='#1d1b20',G=(x,z)=>lmkG(hf,x,z);
  const C=[[W/2,-L/2],[W/2,L/2],[-W/2,L/2],[-W/2,-L/2]];
  for(let i=0;i<4;i++){const a=C[i],b=C[(i+1)%4],len=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(2,Math.round(len/3.6));let ya=Hm*(0.2+0.8*r());
    for(let k=0;k<n;k++){const yb=Math.max(0.6,Hm*(0.15+0.85*r())*(1-0.5*Math.abs(k/n-0.5)));if(r()<0.16){ya=0.6+r()*1.5;continue;}
      const p0=[a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n],p1=[a[0]+(b[0]-a[0])*(k+1)/n,a[1]+(b[1]-a[1])*(k+1)/n],g0=G(p0[0],p0[1]),g1=G(p1[0],p1[1]),m=[(p0[0]+p1[0])/2,(p0[1]+p1[1])/2],ym=Math.min(ya,yb)*(0.7+0.3*r());
      const s1=lmkSeg(M,p0,m,1.3,g0-1.2,g0+ya,(g0+g1)/2-1.2,(g0+g1)/2+ym,st,'wall','ab'),s2=lmkSeg(M,m,p1,1.3,(g0+g1)/2-1.2,(g0+g1)/2+ym*0.92,g1-1.2,g1+yb,st,'wall','ab');
      if(Math.min(ya,yb)>4)[s1.l,s1.r].forEach(f=>lmkWin(f,lmkFP(f),0,(g0+g1)/2+Math.min(ya,ym)*0.35,1.0,Math.min(ya,ym)*0.32,{ar:1,op:dk}));ya=yb;}}
  // огрызок круглой башни на углу: неровный верх, пусто внутри
  const R=clamp(W*0.22,2.5,6),tx=W/2,tz=-L/2,g=G(tx,tz),n=12,T=[];for(let k=0;k<=n;k++)T.push(Hm*(0.55+0.65*r()));T[n]=T[0];
  for(let k=0;k<n;k++){const a0=k/n*Math.PI*2,a1=(k+1)/n*Math.PI*2,P=(a,rr,y)=>[tx+Math.cos(a)*rr,g+y,tz+Math.sin(a)*rr],am=(a0+a1)/2,nn=[Math.cos(am),0,Math.sin(am)];
    const f=lmkQ(M,[P(a0,R,-1.2),P(a1,R,-1.2),P(a1,R,T[k+1]),P(a0,R,T[k])],st,'wall',nn);if(k%4===1&&T[k]>5)lmkWin(f,lmkFP(f),0,g+T[k]*0.45,0.5,1.6,{ar:1,op:dk});
    lmkQ(M,[P(a0,R-1.4,-1.2),P(a1,R-1.4,-1.2),P(a1,R-1.4,T[k+1]),P(a0,R-1.4,T[k])],shade(st,-0.12),'wall',nn.map(v=>-v));lmkQ(M,[P(a0,R,T[k]),P(a1,R,T[k+1]),P(a1,R-1.4,T[k+1]),P(a0,R-1.4,T[k])],st,'wall',[0,1,0]);}
  for(let i=0;i<9;i++){const x=(r()-0.5)*W*1.2,z=(r()-0.5)*L*1.1,s=0.4+r()*0.9,y=G(x,z);lmkSeg(M,[x-s,z],[x+s,z+(r()-0.5)*s],s*1.3,y-0.5,y+s*0.7,y-0.5,y+s*0.5,shade(st,(r()-0.5)*0.2),'wall','ab');}}
// Монастырь: ограда с башнями, ворота, храм (в России — пятиглавый собор и ярусная колокольня), кельи вдоль стен
function lmkMonast(M,o,h,hf,r,S){const L=clamp(o.l||120,40,320),W=clamp(o.w||L*0.75,30,L),ru=h==='ru',cn=h==='cn',Hw=ru?clamp(L*0.05,5,9):5,
    wc=ru?'#f0ece2':cn?'#9a2a22':S.st,tr=ru?'#ffffff':shade(wc,0.15),rf=ru?'#3f5f4a':cn?'#4a5058':S.rf;
  const tow=ru?lmkWT(M,hf,'kr',{H:Hw,s:7,st:wc,tr:'#e6e0d2',rf,sw:false}):lmkWT(M,hf,'sq',{H:Hw,s:5.5,st:wc,roof:rf,k:1.6});
  lmkWallLine(M,[[W/2,-L/2],[W/2,L/2],[-W/2,L/2],[-W/2,-L/2]],hf,{H:Hw,t:ru?2.4:1.4,col:wc,cl:1,cr:ru?'m':'p',st:3.8,tow,corner:0.6,ts:ru&&L>220?(L+W)/2:0});
  // ворота
  lmkAt(M,hf,W/2,0,Q=>{const s=ru?9:7,Hg=ru?Hw*2.4:Hw*1.6,B=mBox(Q,-s/2,-1.4,-s/2,s/2,Hg,s/2,wc,'wall',['d']);lmkWin(B.r,lmkFP(B.r),0,0,s*0.42,Hg*(ru?0.32:0.5),{ar:1,f:tr,op:'#2a2622'});
    if(ru){lmkWin(B.r,lmkFP(B.r),0,Hg*0.55,s*0.16,Hg*0.18,{ar:1,f:tr,g:'#2c313a'});bDrum(Q,0,Hg+0.2,0,s*0.16,s*0.3,wc,10);bOnion(Q,0,Hg+0.2+s*0.3+0.22,0,s*0.2,s*0.45,'#c9a24a');bCross(Q,0,Hg+s*1.0,0,s*0.25);lmkHip(Q,-s/2,s/2,-s/2,s/2,Hg,s*0.12,rf,0.3);}
    else if(cn)lmkCnRoof(Q,-s/2,s/2,-s/2,s/2,Hg,2.4,1.4,rf);else lmkGab(Q,-s/2,s/2,-s/2,s/2,Hg,s*0.4,rf,wc,'x',0.3);});
  // храм и колокольня
  if(ru){lmkAt(M,hf,-W*0.05,-L*0.06,Q=>lmkSobor(Q,{l:clamp(Math.min(L,W)*0.34,14,40),five:true},'ru',null,r,lmkS('ru'),1));lmkAt(M,hf,W*0.2,L*0.26,Q=>lmkBelfry(Q,0,0,clamp(W*0.1,5,9),clamp(L*0.3,22,70),'#f2eee4','#ffffff',rf,'#c9a24a'));}
  else if(cn){lmkAt(M,hf,-W*0.05,-L*0.1,Q=>lmkCnHall(Q,-W*0.16,W*0.16,-L*0.15,L*0.15,0,7,{}));lmkAt(M,hf,0,L*0.28,Q=>lmkPagoda(Q,{h:clamp(L*0.3,18,45),w:9},'cn',null,r,S));}
  else lmkAt(M,hf,-W*0.05,-L*0.04,Q=>{const k=Math.min(L,W)*0.5;lmkChurch(Q,{l:clamp(k,14,60),w:0,h:0},h,null,r,S);});
  // кельи (двухэтажные корпуса вдоль западной и северной стен)
  const cw=7,cl=L*0.6;lmkAt(M,hf,-W/2+1.4+cw/2,0,Q=>{lmkBlk(Q,-cw/2,cw/2,-cl/2,cl/2,-1.2,7.6,{col:ru?'#f2eee4':S.pl,fl:2,bay:4.2,sd:'r',win:(f,P,v)=>lmkWin(f,P,0,v+1,0.9,1.5,{f:tr,g:'#34465a'})});
    if(cn)lmkCnRoof(Q,-cw/2,cw/2,-cl/2,cl/2,6.4,2.2,1.2,rf);else lmkHip(Q,-cw/2,cw/2,-cl/2,cl/2,6.4,2.6,ru?rf:S.rf,0.4);});
  if(!ru)lmkAt(M,hf,0,L/2-1.4-cw/2,Q=>{const l=W*0.55;lmkBlk(Q,-l/2,l/2,-cw/2,cw/2,-1.2,7.6,{col:ru?'#f2eee4':S.pl,fl:2,bay:4.2,sd:'b',win:(f,P,v)=>lmkWin(f,P,0,v+1,0.9,1.5,{f:tr,g:'#34465a'})});
    if(cn)lmkCnRoof(Q,-l/2,l/2,-cw/2,cw/2,6.4,2.2,1.2,rf);else lmkHip(Q,-l/2,l/2,-cw/2,cw/2,6.4,2.6,ru?rf:S.rf,0.4);});}
// Городские ворота: проезд под аркой между двумя башнями (проезд — вдоль x, башни — по z); в России — кремлёвские с шатрами, в Китае — ворота с павильоном
function lmkGate(M,o,h,hf,r,S){const tri=/триумф/i.test(o.n||'');
  if(tri&&h==='ru'){const B=BLD.gate_spb(r,0);lmkXf(B,q=>[-q[2],q[1],q[0]],n=>[-n[2],n[1],n[0]]);B.F.forEach(f=>{if(f.deco)f.deco.forEach(d=>{if(d.ring)d.ax=d.ax==='z'?undefined:'z';});});const s=o.l>0?clamp(o.l/36,0.6,1.6):1;lmkScale(B,s,s,s);return lmkAdd(M,B);}
  if(tri)return lmkArch(M,o,h,hf,r,S);
  const L=clamp(o.l||26,10,70),D=clamp(o.w||12,6,26),pw=clamp(L*0.24,3.5,7.5),cn=h==='cn',ru=h==='ru',brick=ru||h==='nl'||h==='be'||h==='de'&&r()<0.6,
    st=ru?'#a8432f':cn?'#8d8a83':brick?S.br:S.st,tr=ru||brick?'#ece4d2':shade(st,0.16),Ht=clamp(o.h>0?o.h:L*0.9,10,48),Hb=cn?Ht*0.45:Ht*0.7,ps=Math.min(Hb*0.55,pw*1.2),tz=(L-pw)/2,dk='#1d1b20',
    round=!cn&&!ru&&(brick||h==='fr'||h==='uk'||h==='ie'),rf=h==='de'||h==='at'||h==='ch'?'#9e432d':'#59606b';
  lmkPl(M,-D/2,D/2,-L/2,L/2,hf,'#8a8274',0.1);
  // проезд: свод, торцы над аркой, стенки проезда
  const bz=round?pw/2+tz*0.5:pw/2,N=8,A=[];for(let k=0;k<=N;k++){const a=Math.PI*k/N;A.push([pw/2*Math.cos(a),ps+pw/2*Math.sin(a)]);}
  [-1,1].forEach(s=>{const X=s*D/2;for(let k=0;k<N;k++){const p=A[k],q=A[k+1],f=lmkQ(M,[[X,p[1],p[0]],[X,q[1],q[0]],[X,Hb,q[0]],[X,Hb,p[0]]],st,'wall',[s,0,0]);f.deco=[{a:[X+s*0.01,p[1]+0.35,p[0]*1.08],b:[X+s*0.01,q[1]+0.35,q[0]*1.08],w:0.7,c:tr}];}
    if(round)[-1,1].forEach(sz=>lmkQ(M,[[X,0,sz*pw/2],[X,0,sz*bz],[X,Hb,sz*bz],[X,Hb,sz*pw/2]],st,'wall',[s,0,0]));
    lmkQ(M,[[-D/2,0,s*pw/2],[D/2,0,s*pw/2],[D/2,ps,s*pw/2],[-D/2,ps,s*pw/2]],shade(st,-0.1),'wall',[0,0,-s]);});
  for(let k=0;k<N;k++){const p=A[k],q=A[k+1],m=[(p[0]+q[0])/2,(p[1]+q[1])/2];lmkQ(M,[[-D/2,p[1],p[0]],[D/2,p[1],p[0]],[D/2,q[1],q[0]],[-D/2,q[1],q[0]]],shade(st,-0.12),'wall',[0,ps-m[1],-m[0]]);}
  if(cn){// китайские ворота: массивная кладка и павильон с двойной крышей
    [-1,1].forEach(s=>{const B=mBox(M,-D/2,0,s>0?pw/2:-L/2,D/2,Hb,s>0?L/2:-pw/2,st,'wall',['d','t']);});lmkQ(M,[[-D/2,Hb,-L/2],[D/2,Hb,-L/2],[D/2,Hb,L/2],[-D/2,Hb,L/2]],st,'wall',[0,1,0]);
    lmkCren(M,[D/2-0.3,-L/2],[D/2-0.3,L/2],Hb,Hb,0.6,0,0.6,1.3,2.2,st,'wall');lmkCren(M,[-D/2+0.3,-L/2],[-D/2+0.3,L/2],Hb,Hb,0.6,0,0.6,1.3,2.2,st,'wall');
    lmkCnHall(M,-D*0.34,D*0.34,-L*0.38,L*0.38,Hb,Math.max(5,(Ht-Hb)*0.42),{two:1,noBase:1});return;}
  lmkQ(M,[[-D/2,Hb,-bz],[D/2,Hb,-bz],[D/2,Hb,bz],[-D/2,Hb,bz]],st,'wall',[0,1,0]);
  if(ru){// кремлёвские ворота: две башни с шатрами, белые пояса
    [-1,1].forEach(s=>{const zc=s*(pw/2+tz/2),B=mBox(M,-D/2,0,zc-tz/2,D/2,Ht*0.62,zc+tz/2,st,'wall',['d']);['r','l'].forEach(k=>{const f=B[k],P=lmkFP(f);f.deco=f.deco||[];f.deco.push({a:P(-tz/2,Ht*0.6),b:P(tz/2,Ht*0.6),w:0.5,c:tr},{a:P(-tz/2,Hb*0.95),b:P(tz/2,Hb*0.95),w:0.35,c:tr});lmkWin(f,P,0,Ht*0.4,0.8,1.8,{ar:1,f:tr,g:'#2c313a'});});
      lmkRev(M,[0,Ht*0.62,zc],[[tz*0.4,0],[tz*0.4,Ht*0.1]],8,st,'wall',{fl:1,a0:-Math.PI/8})[0].forEach((f,i)=>{if(i%2===0)lmkWin(f,lmkFP(f),0,Ht*0.64,tz*0.12,Ht*0.05,{ar:1,op:dk});});
      lmkSpire(M,0,Ht*0.72,zc,tz*0.44,Ht*0.26,'#3f5f4a','roof');mSphere(M,0,Ht*0.99,zc,0.4,'#c9a24a','metal');});lmkCren(M,[0,-pw/2],[0,pw/2],Hb,Hb,D,0,0.6,1.4,1.6,st,'wall',true);return;}
  [-1,1].forEach(s=>{const zc=s*(pw/2+tz/2);
    if(round){const R=tz/2,T=lmkRev(M,[0,0,zc],[[R,0],[R,Ht]],14,st,'wall');T[0].forEach(f=>{if(Math.abs(f.n[0])>0.6)[0.35,0.58].forEach(t=>lmkWin(f,lmkFP(f),0,Ht*t,R*0.16,Ht*0.08,{ar:1,f:tr,g:'#2c313a'}));});
      if(h==='uk'||h==='ie'){lmkRev(M,[0,Ht,zc],[[R+0.3,0],[R+0.3,0.5],[0,0.5]],14,shade(st,0.08),'stone');lmkCrenRing(M,0,Ht+0.5,zc,R,12,0.6,1.4,st,'wall');}
      else{lmkRev(M,[0,Ht,zc],[[R+0.25,0],[R+0.25,0.4],[R*0.95,0.4]],14,tr,'stone');lmkCone(M,0,Ht+0.4,zc,R*1.1,R*2.4,rf,'roof',14);mSphere(M,0,Ht+0.4+R*2.4,zc,0.3,'#c9a24a','metal');}}
    else{const B=mBox(M,-D/2,0,zc-tz/2,D/2,Ht,zc+tz/2,st,'wall',['d']);['r','l'].forEach(k=>{const f=B[k],P=lmkFP(f);[0.4,0.66].forEach(t=>lmkWin(f,P,0,Ht*t,tz*0.12,Ht*0.08,{ar:1,f:tr,g:'#2c313a'}));});
      if(h==='de'||h==='at'||h==='ch'){lmkCorn(M,-D/2,D/2,zc-tz/2,zc+tz/2,Ht,0.2,0.4,tr);lmkHip(M,-D/2,D/2,zc-tz/2,zc+tz/2,Ht+0.4,Math.min(D,tz)*1.05,rf,0.3);}
      else[[-1,-1,1,-1],[1,-1,1,1],[1,1,-1,1],[-1,1,-1,-1]].forEach(([a,b,c,d])=>lmkCren(M,[a*D/2,zc+b*tz/2],[c*D/2,zc+d*tz/2],Ht,Ht,1.0,-1,0.6,1.4,1.9,st,'wall',h==='it'));}});
  // над проездом: щипец (север) или зубцы
  if(brick||h==='de'||h==='at'||h==='ch'){lmkGab(M,-D/2,D/2,-bz,bz,Hb,pw*0.9,rf,st,'x',0.2);}else lmkCren(M,[D/2-0.3,-bz],[D/2-0.3,bz],Hb,Hb,0.6,0,0.6,1.3,1.6,st,'wall',h==='it');}
// Триумфальная арка: массив с большим пролётом, антаблемент и аттик
function lmkArch(M,o,h,hf,r,S){const L=clamp(o.l||45,12,60),D=clamp(o.w||L*0.5,5,25),H=clamp(o.h>0?o.h:L*1.0,10,55),pw=L*0.32,ps=H*0.4,Ha=ps+pw/2+H*0.06,st='#bab3a3',tr=shade(st,-0.12),N=8,A=[];
  lmkPl(M,-D/2,D/2,-L/2,L/2,hf,'#8a8274',0.3);
  [-1,1].forEach(s=>{const B=mBox(M,-D/2,0,s>0?pw/2:-L/2,D/2,Ha,s>0?L/2:-pw/2,st,'wall',['d','t']);['r','l'].forEach(k=>{const f=B[k],P=lmkFP(f);f.deco=f.deco||[];f.deco.push({poly:[P(-L*0.12,ps*0.5),P(L*0.12,ps*0.5),P(L*0.12,ps*1.05),P(-L*0.12,ps*1.05)],c:tr},{a:P(-L*0.17,ps),b:P(L*0.17,ps),w:0.6,c:tr});});});
  for(let k=0;k<=N;k++){const a=Math.PI*k/N;A.push([pw/2*Math.cos(a),ps+pw/2*Math.sin(a)]);}
  [-1,1].forEach(s=>{const X=s*D/2;for(let k=0;k<N;k++){const p=A[k],q=A[k+1];lmkQ(M,[[X,p[1],p[0]],[X,q[1],q[0]],[X,Ha,q[0]],[X,Ha,p[0]]],st,'wall',[s,0,0]);}lmkQ(M,[[-D/2,0,s*pw/2],[D/2,0,s*pw/2],[D/2,ps,s*pw/2],[-D/2,ps,s*pw/2]],shade(st,-0.1),'wall',[0,0,-s]);});
  for(let k=0;k<N;k++){const p=A[k],q=A[k+1],m=[(p[0]+q[0])/2,(p[1]+q[1])/2];lmkQ(M,[[-D/2,p[1],p[0]],[D/2,p[1],p[0]],[D/2,q[1],q[0]],[-D/2,q[1],q[0]]],shade(st,-0.12),'wall',[0,ps-m[1],-m[0]]);}
  lmkCorn(M,-D/2,D/2,-L/2,L/2,Ha,0.5,H*0.05,shade(st,0.05));const At=mBox(M,-D/2+0.4,Ha+H*0.05,-L/2+0.4,D/2-0.4,H,L/2-0.4,st,'wall',['d']);[At.r,At.l].forEach(f=>{const P=lmkFP(f);f.deco=[{poly:[P(-L*0.3,Ha+H*0.1),P(L*0.3,Ha+H*0.1),P(L*0.3,H-H*0.05),P(-L*0.3,H-H*0.05)],c:tr}];});}
// Стена по линии: Великая Китайская (откос, зубцы снаружи, парапет изнутри, сторожевые башни), кремлёвская (ласточкин хвост, башни с шатрами), городская
function lmkWall(M,o,h,hf,r,S){const {P,cl,len}=lmkLine(o,200),kr=h==='ru'||/кремл/i.test(o.n||''),cn=h==='cn',ks=clamp(len/1000,1,1.5);
  const H=cn?clamp(o.h>0?o.h:7.5,5,12):kr?clamp(o.h>0?o.h:9,5,19):clamp(o.h>0?o.h:8,4,15),t=cn?5.6:kr?3.6:2.6,
    col=cn?'#8d8a83':kr?'#a8432f':h==='nl'||h==='be'||(h==='de'&&r()<0.4)?S.br:S.st,
    tow=cn?lmkWT(M,hf,'cn',{H,s:10,st:col,pav:0}):kr?lmkWT(M,hf,'kr',{H,s:8,st:col,tr:'#ece4d2',rf:'#3f5f4a'}):h==='it'||h==='es'||h==='ly'||h==='mc'?lmkWT(M,hf,'sq',{H,s:7,st:col,sw:h==='it'}):lmkWT(M,hf,'rd',{H,R:3.4,st:col,cone:h!=='uk'&&h!=='ie'&&h!=='us',rf:h==='de'||h==='at'||h==='ch'?'#9e432d':'#59606b'});
  lmkWallLine(M,P,hf,{H,t,ti:cn?0.5:0.15,col,cl,cr:kr?'s':'m',ip:cn?1:0,st:(cn?2.6:kr?3.0:2.4)*ks,mh:cn?1.7:1.4,mt:cn?0.7:0.6,tow,ts:cn?190:kr?150:110,corner:0.7,ends:1});}
/* ---------- башни, маяки, мельницы ---------- */
function lmkTower(M,o,h,hf,r,S){const s=clamp(Math.min(o.l||8,o.w||o.l||8),4,22),H=clamp(o.h>0?o.h:Math.max(18,s*3),8,95),dk='#1d1b20',gl='#2c313a';
  if(h==='it'||h==='mc'){const B=BLD.campanile(r,Math.floor(r()*3)),k=H/28.9,sx=clamp(s/5.8,k*0.75,k*1.3);lmkScale(B,sx,k,sx);return lmkAdd(M,B);}
  if(h==='ie'&&s<=9){const B=lmkStoneTex(BLD.round_tower(r,0)),k=H/31,sx=clamp(s/6.4,k*0.8,k*1.3);lmkScale(B,sx,k,sx);return lmkAdd(M,B);}
  if(h==='ly')return lmkMinaret(M,0,0,0,H,Math.max(1.6,s*0.25),'#f2ede2','#3f7a5a',1);
  if(h==='cn'){const b=s*1.5,Hb=H*0.42,B=mBox(M,-b/2,-1,-b/2,b/2,Hb,b/2,'#8d8a83','wall',['d']);['r','l'].forEach(k=>lmkWin(B[k],lmkFP(B[k]),0,0,b*0.3,Hb*0.45,{ar:1,op:dk}));lmkCren(M,[b/2-0.3,-b/2],[b/2-0.3,b/2],Hb,Hb,0.6,0,0.5,1.1,1.8,'#8d8a83','wall');
    lmkCnHall(M,-b*0.36,b*0.36,-b*0.36,b*0.36,Hb,Math.max(4,(H-Hb)*0.45),{two:1,noBase:1});return;}
  const ru=h==='ru',st=ru?'#a8432f':h==='nl'||h==='be'?S.br:S.st,tr=ru?'#ece4d2':shade(st,0.15),hs=s/2;lmkPl(M,-hs,hs,-hs,hs,hf,'#8a8274',0.1);
  const Hb=ru?H*0.55:h==='uk'||h==='ie'||h==='es'||h==='us'?H:H*0.72,B=mBox(M,-hs,0,-hs,hs,Hb,hs,st,'wall',['d']);
  ['r','l','f','b'].forEach(k=>{const f=B[k],P=lmkFP(f);lmkWin(f,P,0,Hb*0.82,s*0.2,Hb*0.1,{ar:ru?1:2,f:tr,op:dk});lmkWin(f,P,0,Hb*0.5,s*0.1,Hb*0.08,{ar:1,f:tr,g:gl});if(ru){f.deco.push({a:P(-hs,Hb-0.6),b:P(hs,Hb-0.6),w:0.45,c:tr});}});
  if(k0(h)==='bat'){[[-1,-1,1,-1],[1,-1,1,1],[1,1,-1,1],[-1,1,-1,-1]].forEach(([a,b,c,d])=>lmkCren(M,[a*hs,b*hs],[c*hs,d*hs],Hb,Hb,1.0,-1,0.6,1.4,1.9,st,'wall',h==='es'&&false));
    if(h==='uk'||h==='ie')[[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([x,z])=>lmkSpire(M,x*(hs-0.4),Hb,z*(hs-0.4),0.7,s*0.45,st,'wall'));}
  else if(ru){[[-1,-1,1,-1],[1,-1,1,1],[1,1,-1,1],[-1,1,-1,-1]].forEach(([a,b,c,d])=>lmkCren(M,[a*hs,b*hs],[c*hs,d*hs],Hb,Hb,1.0,-1,0.55,1.3,1.8,st,'wall',true));
    lmkRev(M,[0,Hb,0],[[hs*0.72,0],[hs*0.72,H*0.12]],8,st,'wall',{fl:1,a0:-Math.PI/8})[0].forEach((f,i)=>{if(i%2===0)lmkWin(f,lmkFP(f),0,Hb+H*0.02,s*0.1,H*0.06,{ar:1,op:dk});});lmkSpire(M,0,Hb+H*0.12,0,hs*0.8,H*0.3,'#3f5f4a','roof');mSphere(M,0,Hb+H*0.42+0.25,0,0.35,'#c9a24a','metal');}
  else{const rc=h==='de'||h==='at'||h==='ch'?'#9e432d':'#59606b';lmkCorn(M,-hs,hs,-hs,hs,Hb,0.25,0.4,tr);lmkPyr(M,0,Hb+0.4,0,hs+0.4,H-Hb-0.4,rc,'roof');mSphere(M,0,H,0,0.3,'#c9a24a','metal');}
  function k0(hh){return hh==='uk'||hh==='ie'||hh==='es'||hh==='us'?'bat':'';}}
// Минарет: основание, ствол (восьмигранный или круглый), балкончик, верх, конус и полумесяц
function lmkMinaret(M,x,y,z,H,R,wc,cap,oct){const n=oct?8:12,o2=oct?{fl:1,a0:-Math.PI/8}:{};mBox(M,x-R*1.25,y,z-R*1.25,x+R*1.25,y+H*0.22,z+R*1.25,wc,'wall',['d']);
  lmkRev(M,[x,y+H*0.22,z],[[R,0],[R*0.92,H*0.52]],n,wc,'wall',o2);const yb=y+H*0.74;lmkRev(M,[x,yb,z],[[R*0.9,0],[R*1.6,0.5],[R*1.6,1.1],[R*1.45,1.1]],n,wc,'wall',o2);
  lmkRev(M,[x,yb+1.1,z],[[R*1.6,0],[R*1.6,0.9]],n,wc,'wall',Object.assign({two:1},o2));lmkRev(M,[x,yb+0.5,z],[[R*0.78,0],[R*0.74,H*0.13]],n,wc,'wall',o2);
  const Rc=Math.max(0.3,R*0.28);lmkRev(M,[x,yb+0.5+H*0.13,z],[[R*0.86,0],[0,H*0.13]],n,cap,'roof',o2);lmkCresc(M,x,y+H+0.5+Rc*0.6,z,Rc,'#c9a24a');}
// Маяк: сужающаяся башня (белая, с красными поясами или каменная), галерея с перилами, фонарь со стеклом, купол, домик смотрителя
function lmkLight(M,o,h,hf,r,S){const H=clamp(o.h>0?o.h:24,10,70),rb=clamp((o.w||o.l||H*0.22)/2,2.2,7),rt=rb*0.62,v=Math.floor(r()*3),oct=r()<0.3,n=oct?8:14,o2=oct?{fl:1,a0:-Math.PI/8}:{};
  const sty=h==='fr'||h==='it'||h==='es'?(v?'stone':'white'):h==='us'?(v===2?'band':'white'):h==='uk'||h==='ie'?(v===1?'band':'white'):v===0?'band':'white',
    wc=sty==='stone'?S.st:'#f2f0ea',bc='#b8322a',cap=sty==='band'?'#2a2c30':v===1?'#2a2c30':'#b8322a',gl='#2c313a';
  lmkPl(M,-rb,rb,-rb,rb,hf,'#8a8274',0.15);
  const R=y=>rb+(rt-rb)*y/H;
  if(sty==='band'){const nb=5;for(let i=0;i<nb;i++){const y0=H*i/nb,y1=H*(i+1)/nb;lmkRev(M,[0,y0,0],[[R(y0),0],[R(y1),y1-y0]],n,i%2?bc:wc,'wall',o2);}}
  else{const T=lmkRev(M,[0,0,0],[[rb,0],[rt,H]],n,wc,'wall',o2);T[0].forEach((f,i)=>{if(f.n[0]>0.75){lmkWin(f,lmkFP(f),0,0,Math.min(1.2,rb*0.4),2.2,{ar:1,f:shade(wc,-0.12),op:'#4a3424'});[0.35,0.62].forEach(t=>lmkWin(f,lmkFP(f),0,H*t,0.55,1.1,{ar:1,f:shade(wc,-0.12),g:gl}));}});}
  // галерея, перила, фонарь, купол
  lmkRev(M,[0,H,0],[[rt*0.95,-0.6],[rt+1.1,-0.1],[rt+1.1,0.25],[0,0.25]],n,'#dad6cc','stone',o2);lmkRev(M,[0,H+0.25,0],[[rt+1.0,0],[rt+1.0,1.0]],16,'#2a2c30','metal',{two:1});
  const rl=rt*0.72,yl=H+0.25;lmkRev(M,[0,yl,0],[[rl,0],[rl,0.9]],10,'#2a2c30','metal');const G=lmkRev(M,[0,yl+0.9,0],[[rl,0],[rl,2.3]],10,'#cfe2ea','glass',{fl:1});G[0].forEach(f=>{f.l=5;});
  for(let k=0;k<10;k++){const a=k/10*Math.PI*2;mBox(M,Math.cos(a)*rl-0.06,yl+0.9,Math.sin(a)*rl-0.06,Math.cos(a)*rl+0.06,yl+3.2,Math.sin(a)*rl+0.06,'#2a2c30','metal',['d','t']);}
  lmkRev(M,[0,yl+3.2,0],[[rl*1.18,0],[rl*1.05,0.35],[rl*0.7,0.95],[rl*0.25,1.35],[0,1.45]],10,cap,'metal',{sm:1});mSphere(M,0,yl+4.85,0,0.32,cap,'metal');mBox(M,-0.05,yl+5.1,-0.05,0.05,yl+6.4,0.05,'#2a2c30','metal');
  // домик смотрителя
  const hx=rb+3.6,hw=3.4,hl=4.6,hc=sty==='stone'?S.st:'#f2f0ea';lmkBlk(M,hx-hw,hx+hw,-hl,hl,0,3.8,{col:hc,fl:1,bay:3,sd:'rf',win:(f,P,v,j,k)=>lmkWin(f,P,0,1,0.9,1.4,{f:shade(hc,-0.15),g:'#34465a'})});
  lmkHip(M,hx-hw,hx+hw,-hl,hl,3.8,2.2,h==='fr'||h==='uk'||h==='ie'||h==='us'||h==='nl'||h==='be'?'#59606b':'#ad5638',0.4);}
// Мельница: каменная (кирпичная, белёная) башня с шатром и четырьмя решётчатыми крыльями; в Нидерландах, Бельгии, США — шатровая «смок» на кирпичном цоколе с галереей; в России — столбовка
function lmkWindmill(M,o,h,hf,r,S){if(h==='ru'){const B=BLD.mill_ru(r,0),s=clamp((o.h||12)/12,0.8,1.6);lmkScale(B,s,s,s);return lmkAdd(M,B);}
  const dutch=h==='nl'||h==='be'||h==='us'||(h==='de'&&r()<0.5),H=clamp(o.h>0?o.h:(dutch?20:11),7,32),rb=clamp((o.w||o.l||(dutch?H*0.42:H*0.5))/2,2.6,8),dk='#3a2e24',gl='#2c313a';
  lmkPl(M,-rb,rb,-rb,rb,hf,'#8a8274',0.1);let rt,yc;
  if(dutch){const Hb=H*0.3,base=lmkRev(M,[0,0,0],[[rb,0],[rb,Hb]],8,h==='us'?'#8a857c':S.br,'wall',{fl:1,a0:-Math.PI/8});base[0].forEach(f=>{if(f.n[0]>0.9)lmkWin(f,lmkFP(f),0,0,1.2,2.2,{f:'#e8e2d4',op:'#4a3424'});else if(Math.abs(f.n[2])>0.9)lmkWin(f,lmkFP(f),0,Hb*0.45,0.8,1.0,{f:'#e8e2d4',g:gl});});
    // галерея и перила
    lmkRev(M,[0,Hb,0],[[rb+1.8,0],[rb+1.8,0.3],[0,0.3]],8,'#6a5a48','wood',{fl:1,a0:-Math.PI/8});lmkRev(M,[0,Hb+0.3,0],[[rb+1.7,0],[rb+1.7,1.0]],8,'#4a3a2c','wood',{fl:1,a0:-Math.PI/8,two:1});
    rt=rb*0.58;yc=H;const bc=h==='us'?'#8f8a80':r()<0.5?'#9a8a5c':'#3d4a3e';const Bd=lmkRev(M,[0,Hb+0.3,0],[[rb*0.92,0],[rt,H-Hb-0.3]],8,bc,bc==='#9a8a5c'?'roof':'wood',{fl:1,a0:-Math.PI/8});
    Bd[0].forEach(f=>{if(f.n[0]>0.9)lmkWin(f,lmkFP(f),0,Hb+(H-Hb)*0.45,0.7,1.0,{f:'#e8e2d4',g:gl});});}
  else{rt=rb*0.68;yc=H;const wc=h==='es'||h==='mc'||h==='ly'?'#f2efe8':h==='uk'||h==='ie'?(r()<0.5?S.br:'#3b3633'):S.st,T=lmkRev(M,[0,0,0],[[rb,0],[rt,H]],14,wc,'wall');
    T[0].forEach(f=>{if(f.n[0]>0.85){lmkWin(f,lmkFP(f),0,0,1.0,2.0,{ar:1,f:shade(wc,-0.15),op:'#4a3424'});lmkWin(f,lmkFP(f),0,H*0.62,0.6,0.9,{f:shade(wc,-0.15),g:gl});}else if(f.n[2]>0.85)lmkWin(f,lmkFP(f),0,H*0.35,0.6,0.9,{f:shade(wc,-0.15),g:gl});});}
  // шапка
  const cc=dutch?'#3d4a3e':h==='uk'||h==='ie'?'#ece8dc':h==='es'?'#5a5048':'#4a3a2c';
  if(dutch||h==='uk'||h==='ie'||h==='de'){lmkRev(M,[0,yc,0],[[rt+0.3,0],[rt+0.3,0.4],[rt*0.9,0.4]],12,cc,'wood');lmkGab(M,-rt*1.1,rt*1.2,-rt*0.85,rt*0.85,yc+0.4,rt*1.1,cc,cc,'x',0.2,'wood');
    if(h==='uk'||h==='ie'){mBox(M,-rt*1.1-1.8,yc+0.2,-0.08,-rt*1.1,yc+0.4,0.08,dk,'wood');for(let k=0;k<6;k++){const a=k/6*Math.PI*2;lmkQ(M,[[-rt*1.1-1.8,yc+0.9,0],[-rt*1.1-1.8,yc+0.9+Math.sin(a)*1.2+Math.cos(a)*0.15,Math.cos(a)*1.2-Math.sin(a)*0.15],[-rt*1.1-1.8,yc+0.9+Math.sin(a+0.3)*1.2,Math.cos(a+0.3)*1.2]],'#ece8dc','wood',[1,0,0],true);}}}
  else lmkRev(M,[0,yc,0],[[rt*1.12,0],[rt*1.0,rt*0.5],[0,rt*1.3]],12,cc,'wood');
  lmkSails(M,[rt+0.75,yc+rt*0.45,0],dutch?H*0.62:H*0.66,0.3+r()*0.6,dutch?2.0:1.6,dk,'#e2d8c0');}
// Крылья мельницы: ступица hub, плоскость крыльев — поперёк x (смотрят на +x), R — длина, a — поворот, wd — ширина решётки
function lmkSails(M,hub,R,a,wd,dk,cl){mLathe(M,[hub[0]-0.9,hub[1],hub[2]],'x',[[0.3,0],[0.35,0.9],[0.2,1.0],[0,1.05]],8,dk,'wood');const x=hub[0]+0.1;
  for(let k=0;k<4;k++){const an=a+k*Math.PI/2,ca=Math.cos(an),sa=Math.sin(an),P=(d,w)=>[x,hub[1]+sa*d+ca*w,hub[2]+ca*d-sa*w];
    lmkQ(M,[P(0,-0.17),P(R,-0.1),P(R,0.1),P(0,0.17)],dk,'wood',[1,0,0],true);
    const f=lmkQ(M,[P(R*0.2,0.12),P(R,0.12),P(R,0.12+wd),P(R*0.2,0.12+wd)],cl,'cloth',[1,0,0],true);f.deco=[];const nn=Math.max(4,Math.round(R/1.7));
    for(let i=0;i<=nn;i++){const d=R*0.2+R*0.8*i/nn;f.deco.push({a:P(d,0.12),b:P(d,0.12+wd),w:0.08,c:dk});}f.deco.push({a:P(R*0.2,0.12+wd*0.5),b:P(R,0.12+wd*0.5),w:0.07,c:dk},{a:P(R*0.2,0.12+wd),b:P(R,0.12+wd),w:0.1,c:dk});}}
// Водяная мельница: каменный (фахверковый, бревенчатый) дом и большое колесо на +x у стены, желоб и вода
function lmkWater(M,o,h,hf,r,S){const L=clamp(o.l||14,8,30),D=clamp(o.w||9,6,14),H=clamp(o.h>0?Math.min(o.h,10):7,4.5,10),ru=h==='ru',fw=h==='de'||h==='at'||h==='ch',
    wc=ru?'#8a6a44':fw?'#f2ece0':h==='it'||h==='es'?S.pl:S.st,rf=ru?'#6a6258':S.rf,dk='#4a3a2c',gl='#2c313a';
  lmkPl(M,-D/2,D/2,-L/2,L/2,hf,'#8a8274',0.2);
  const B=lmkBlk(M,-D/2,D/2,-L/2,L/2,0,H,{col:wc,mat:ru?'wood':'wall',fl:2,bay:3.2,sd:'rlb',win:(f,P,v,j,k,n,s)=>{if(s==='r'&&k>=n/2)return;if(j===0&&k===0&&s==='r')lmkWin(f,P,0,0,1.2,2.1,{f:'#d8d0bc',op:'#4a3424'});else lmkWin(f,P,0,v+0.9,0.85,1.2,{f:ru?'#f1ece0':'#d8d0bc',g:gl});}});
  if(fw)[...B.r,...B.b,...B.l].forEach(f=>{const P=lmkFP(f),hw=Math.hypot(f.p[1][0]-f.p[0][0],f.p[1][2]-f.p[0][2])/2;f.deco=f.deco||[];f.deco.unshift({a:P(-hw,f.p[0][1]+0.1),b:P(hw,f.p[0][1]+0.1),w:0.2,c:'#4a3020'},{a:P(-hw,f.p[2][1]-0.1),b:P(hw,f.p[2][1]-0.1),w:0.2,c:'#4a3020'},{a:P(-hw+0.1,f.p[0][1]),b:P(-hw+0.1,f.p[2][1]),w:0.2,c:'#4a3020'});});
  lmkGab(M,-D/2,D/2,-L/2,L/2,H,D*0.55,rf,wc,'z',0.45);
  // колесо: два обода, спицы, лопасти; ось в стене
  const Rw=clamp(H*0.5,2.2,4.6),wx=D/2+0.8,wz=L*0.22,wy=Rw*0.82,ww=1.3,n=16;
  [wx-ww/2,wx+ww/2].forEach(x=>{for(let k=0;k<n;k++){const a0=k/n*Math.PI*2,a1=(k+1)/n*Math.PI*2,P=(a,rr)=>[x,wy+Math.sin(a)*rr,wz+Math.cos(a)*rr];lmkQ(M,[P(a0,Rw),P(a1,Rw),P(a1,Rw-0.3),P(a0,Rw-0.3)],dk,'wood',[1,0,0],true);}
    for(let k=0;k<6;k++){const a=k/6*Math.PI;lmkQ(M,[[x,wy+Math.sin(a)*Rw*0.95+Math.cos(a)*0.09,wz+Math.cos(a)*Rw*0.95-Math.sin(a)*0.09],[x,wy+Math.sin(a)*Rw*0.95-Math.cos(a)*0.09,wz+Math.cos(a)*Rw*0.95+Math.sin(a)*0.09],[x,wy-Math.sin(a)*Rw*0.95-Math.cos(a)*0.09,wz-Math.cos(a)*Rw*0.95+Math.sin(a)*0.09],[x,wy-Math.sin(a)*Rw*0.95+Math.cos(a)*0.09,wz-Math.cos(a)*Rw*0.95-Math.sin(a)*0.09]],dk,'wood',[1,0,0],true);}});
  for(let k=0;k<n;k++){const a=k/n*Math.PI*2,c=Math.cos(a),s=Math.sin(a);lmkQ(M,[[wx-ww/2,wy+s*(Rw-0.05),wz+c*(Rw-0.05)],[wx+ww/2,wy+s*(Rw-0.05),wz+c*(Rw-0.05)],[wx+ww/2,wy+s*(Rw+0.45),wz+c*(Rw+0.45)],[wx-ww/2,wy+s*(Rw+0.45),wz+c*(Rw+0.45)]],'#6a5640','wood',[-s,0.01,c],true);}
  mLathe(M,[D/2,wy,wz],'x',[[0.22,0],[0.22,ww+1.2]],8,'#3a3a3a','metal');
  // вода под колесом и вдоль дома
  lmkQ(M,[[D/2+0.1,0.15,-L/2-2],[D/2+2.6,0.15,-L/2-2],[D/2+2.6,0.15,L/2+3],[D/2+0.1,0.15,L/2+3]],'#3f6f86','water',[0,1,0]);mBox(M,D/2+2.6,-0.5,-L/2-2,D/2+3.1,0.55,L/2+3,'#8a8274','stone',['d']);
  mBox(M,wx-ww/2-0.3,wy+Rw+0.3,wz-0.6,wx+ww/2+0.3,wy+Rw+0.65,-L/2-1.5,'#5a4a3a','wood',[]);}
/* ---------- памятники ---------- */
// Фигура в рост (бронза): ноги, сюртук, руки, голова; h — рост, лицом к +x; pose 0 — рука вперёд, 1 — вверх, 2 — у груди
function lmkFig(M,x,y,z,h,col,pose){const mat='paint',Q=new Mesh();
  [-1,1].forEach(s=>mTube(Q,[[0.01*h,0,s*0.06*h],[0,0.47*h,s*0.065*h]],[0.05*h,0.042*h],6,col,mat));
  const C=new Mesh();lmkRev(C,[0,0.2*h,0],[[0.15*h,0],[0.13*h,0.18*h],[0.12*h,0.36*h],[0.15*h,0.52*h],[0.155*h,0.58*h],[0.08*h,0.64*h],[0,0.65*h]],10,col,mat,{sm:1});lmkScale(C,0.72,1,1);lmkAdd(Q,C);
  mTube(Q,[[0,0.84*h,0],[0,0.88*h,0]],0.035*h,6,col,mat);mSphere(Q,0.005*h,0.925*h,0,0.068*h,col,mat);
  const sh=[0,0.79*h,-0.15*h],sh2=[0,0.79*h,0.15*h];
  mTube(Q,pose===1?[sh,[0.06*h,0.98*h,-0.2*h],[0.12*h,1.16*h,-0.22*h]]:pose===2?[sh,[0.1*h,0.62*h,-0.17*h],[0.13*h,0.72*h,-0.04*h]]:[sh,[0.13*h,0.67*h,-0.2*h],[0.3*h,0.7*h,-0.24*h]],[0.04*h,0.034*h,0.03*h],6,col,mat);
  mTube(Q,[sh2,[0.02*h,0.6*h,0.18*h],[0.05*h,0.46*h,0.17*h]],[0.04*h,0.034*h,0.03*h],6,col,mat);lmkMove(Q,x,y,z);lmkAdd(M,Q);}
// Статуя: гранитный пьедестал с карнизом и доской, бронзовая фигура
function lmkStatue(M,o,h,hf,r,S){const H=clamp(o.h>0?o.h:8,3,30),pb=clamp((o.w||o.l||H*0.32)/2,0.8,6),Hp=H*0.46,fh=H-Hp,gr='#8f8a84',br=r()<0.5?'#6e5a3c':'#5f8a78';
  lmkPl(M,-pb*1.4,pb*1.4,-pb*1.4,pb*1.4,hf,'#8a8274',0.1);mBox(M,-pb*1.4,0,-pb*1.4,pb*1.4,Hp*0.12,pb*1.4,gr,'stone',['d']);const B=mBox(M,-pb,Hp*0.12,-pb,pb,Hp*0.86,pb,gr,'stone',['d']);
  B.r.deco=[{poly:[[pb+0.01,Hp*0.38,-pb*0.6],[pb+0.01,Hp*0.38,pb*0.6],[pb+0.01,Hp*0.62,pb*0.6],[pb+0.01,Hp*0.62,-pb*0.6]],c:'#5a4a30'}];lmkCorn(M,-pb,pb,-pb,pb,Hp*0.86,0.12*pb+0.1,Hp*0.14,gr);
  lmkFig(M,0,Hp,0,fh,br,Math.floor(r()*3));}
// Колонна на пьедестале со статуей наверху (Александрийская — красный гранит и ангел, Вандомская — бронза, Нельсона — светлый камень)
function lmkColumn(M,o,h,hf,r,S){const H=clamp(o.h>0?o.h:30,10,60),R=H*0.042,pb=Math.max(R*2.2,(o.w||0)/2*0.7),Hp=H*0.17,sh=h==='ru'?'#8e5a4c':h==='fr'?'#5e5040':'#cfc6b4',gr=h==='ru'?'#7f7a74':'#a8a092';
  lmkPl(M,-pb*1.5,pb*1.5,-pb*1.5,pb*1.5,hf,'#8a8274',0.1);mBox(M,-pb*1.5,0,-pb*1.5,pb*1.5,Hp*0.18,pb*1.5,gr,'stone',['d']);mBox(M,-pb*1.25,Hp*0.18,-pb*1.25,pb*1.25,Hp*0.32,pb*1.25,gr,'stone',['d']);
  const B=mBox(M,-pb,Hp*0.32,-pb,pb,Hp,pb,gr,'stone',['d']);['r','l','f','b'].forEach(k=>{const P=lmkFP(B[k]);B[k].deco=[{poly:[P(-pb*0.7,Hp*0.45),P(pb*0.7,Hp*0.45),P(pb*0.7,Hp*0.85),P(-pb*0.7,Hp*0.85)],c:'#6a5430'}];});lmkCorn(M,-pb,pb,-pb,pb,Hp,0.2,0.5,gr);
  lmkRev(M,[0,Hp+0.5,0],[[R*1.45,0],[R*1.45,R*0.5],[R*1.15,R*0.65],[R*1.05,R*0.9]],16,sh,'stone');const yc=Hp+0.5+R*0.9,Hs=Math.max(H*0.4,H-yc-R*1.6-H*0.1),S2=lmkRev(M,[0,yc,0],[[R*1.05,0],[R*0.86,Hs]],16,sh,'stone');
  if(h==='fr')S2[0].forEach((f,i)=>{const P=lmkFP(f);f.deco=[];for(let k=0;k<9;k++)f.deco.push({a:P(-R*0.2,yc+Hs*(k+i/16)/9),b:P(R*0.2,yc+Hs*(k+i/16+1/16)/9),w:0.3,c:'#4a3e30'});});
  const yt=yc+Hs;lmkRev(M,[0,yt,0],[[R*0.9,0],[R*1.3,R*0.9],[R*1.3,R*1.1],[0,R*1.1]],12,h==='uk'?'#7a6a48':sh,'stone');mBox(M,-R,yt+R*1.1,-R,R,yt+R*1.6,R,sh,'stone',['d']);
  const yf=yt+R*1.6,fh=Math.max(1.8,H-yf),fc=h==='ru'?'#8a7448':'#6e5a3c';lmkFig(M,0,yf,0,fh,fc,h==='ru'?1:0);
  if(h==='ru')[-1,1].forEach(s=>lmkQ(M,[[-0.1,yf+fh*0.62,s*0.1],[-0.25,yf+fh*1.05,s*fh*0.45],[-0.3,yf+fh*0.62,s*fh*0.38],[-0.15,yf+fh*0.48,s*0.1]],fc,'paint',[-1,0,0],true));}
// Памятник: ступени, пьедестал, стела с доской и венком или бронзовая группа
function lmkMonument(M,o,h,hf,r,S){const H=clamp(o.h>0?o.h:10,3,45),b=clamp((o.w||o.l||H*0.5)/2,1.2,15),gr=r()<0.5?'#8f8a84':'#a8a092',br='#4a4a3c',v=r()<0.55;
  lmkPl(M,-b*1.2,b*1.2,-b*1.2,b*1.2,hf,'#8a8274',0.05);[[1.2,0.12],[1.05,0.12],[0.9,0.12]].reduce((y,[k,hh])=>{mBox(M,-b*k,y,-b*k,b*k,y+H*hh*0.5,b*k,gr,'stone',['d']);return y+H*hh*0.5;},0);
  const y0=H*0.18;if(v){const w=b*0.55,t=Math.max(0.6,b*0.22),Hs=H-y0,B=new Mesh();lmkRev(B,[0,y0,0],[[w*1.414,0],[w*1.15,Hs*0.94],[0,Hs]],4,gr,'stone',{fl:1,a0:Math.PI/4});lmkScale(B,t/w*0.9,1,1);B.F.forEach(f=>{if(f.n[0]>0.7){const P=lmkFP(f);f.deco=[{poly:[P(-w*0.5,y0+Hs*0.2),P(w*0.5,y0+Hs*0.2),P(w*0.5,y0+Hs*0.42),P(-w*0.5,y0+Hs*0.42)],c:'#5a4a30'},{ring:[f.p[0][0]+0.02,y0+Hs*0.6,0,w*0.32],w:w*0.1,c:'#7a6a38'},{dot:P(0,y0+Hs*0.8),r:w*0.1,c:'#c9a24a'}];}});lmkAdd(M,B);}
  else{const pb=b*0.6,Hp=H*0.42,P=mBox(M,-pb,y0,-pb,pb,Hp,pb,gr,'stone',['d']);P.r.deco=[{poly:[[pb+0.01,Hp*0.55,-pb*0.6],[pb+0.01,Hp*0.55,pb*0.6],[pb+0.01,Hp*0.8,pb*0.6],[pb+0.01,Hp*0.8,-pb*0.6]],c:'#5a4a30'}];lmkCorn(M,-pb,pb,-pb,pb,Hp,0.15,0.4,gr);
    const fh=Math.max(2,H-Hp-0.4),bc=r()<0.5?'#6e5a3c':'#5f8a78';lmkFig(M,0,Hp+0.4,-pb*0.35,fh,bc,1);lmkFig(M,-pb*0.2,Hp+0.4,pb*0.45,fh*0.9,bc,2);}}
// Обелиск: ступенчатое основание, ствол с пирамидкой (высокий с большим основанием — модель Веллингтона)
function lmkObelisk(M,o,h,hf,r,S){const H=clamp(o.h>0?o.h:20,5,70),b=(o.w||o.l||0)/2;
  if(H>=40&&b>H*0.12){const B=lmkStoneTex(BLD.obelisk(r,0)),k=H/65.2,sx=clamp(b/13.5,k*0.8,k*1.25);lmkScale(B,sx,k,sx);return lmkAdd(M,B);}
  const st=h==='fr'||h==='it'||h==='ly'?'#c9a87a':'#a8a092',s0=H*0.055,y0=H*0.16,gc='#c9a24a';lmkPl(M,-s0*3,s0*3,-s0*3,s0*3,hf,'#8a8274',0.05);
  [[3,0.04],[2.5,0.04],[1.8,0.08]].reduce((y,[k,hh])=>{mBox(M,-s0*k,y,-s0*k,s0*k,y+H*hh,s0*k,shade(st,-0.1),'stone',['d']);return y+H*hh;},0);
  const s1=s0*0.62,y1=H*0.93;[[-1,-1],[1,-1],[1,1],[-1,1]].forEach((a,i,A)=>{const c=A[(i+1)%4];lmkQ(M,[[a[0]*s0,y0,a[1]*s0],[c[0]*s0,y0,c[1]*s0],[c[0]*s1,y1,c[1]*s1],[a[0]*s1,y1,a[1]*s1]],st,'stone',[a[0]+c[0],0,a[1]+c[1]]);lmkQ(M,[[a[0]*s1,y1,a[1]*s1],[c[0]*s1,y1,c[1]*s1],[0,H,0]],h==='fr'?gc:st,h==='fr'?'paint':'stone',[a[0]+c[0],0.6,a[1]+c[1]]);});}
/* ---------- дворцы, усадьбы, вокзалы ---------- */
// Дворец: длинный корпус в 2–3 этажа, ризалиты, портик с фронтоном или купол; Россия — лазурь, белое, золото (главы домовой церкви),
// Франция — шиферная мансарда (старые — замок с угловыми башнями), Германия и Австрия — жёлтый с черепицей, Англия — камень и балюстрада, Китай — павильон
function lmkPalace(M,o,h,hf,r,S){const L=clamp(o.l||110,30,420),D=clamp(o.w||clamp(L*0.2,14,24),12,40);
  if(h==='cn')return lmkCnHall(M,-D/2,D/2,-L/2,L/2,0,clamp(o.h>0?o.h*0.45:8,6,14),{rf:'#c99a3a',two:L>50});
  const st=h==='ru'?(r()<0.6?'ru':'rg'):h==='fr'||h==='be'?(o.y?(o.y<1650?'ch':'fc'):r()<0.4?'ch':'fc'):h==='de'||h==='at'||h==='ch'||h==='nl'?'de':h==='uk'||h==='ie'?'uk':h==='it'||h==='es'||h==='mc'?'it':h==='us'?'us':h==='ly'?'ly':'fc';
  if(st==='ch')return lmkChateau(M,o,h,hf,r,S,L,D);
  const fl=L>160||o.h>16?3:2,H=clamp(o.h>0?o.h:fl*5.6,9,30),fh=H/fl,gl='#34465a',
    C={ru:['#62a7d4','#f6f3ea','#c9a24a','#7d958e'],rg:['#5e9a7f','#f4f1e8','#c9a24a','#6d7a76'],fc:['#dcd2bc','#f2ead8',null,'#4f5662'],de:['#e8c46a','#f6f1e4',null,'#8f3b2b'],
      uk:['#c9bea6','#e6dfcd',null,'#59606b'],it:['#d9a86a','#f1e6cf',null,'#ad5638'],us:['#ece8de','#ffffff',null,'#59606b'],ly:['#f1ece0','#ffffff',null,'#b8b0a0']}[st],
    [wc,tr,gold,rf]=C,flat=st==='uk'||st==='ly',pil=st==='ru'||st==='rg'||st==='de';
  lmkPl(M,-D/2,D/2,-L/2,L/2,hf,'#8a8274',0.35);
  let nb=Math.max(5,Math.round(L/4.6));const nc=nb>=11?5:3,ne=nb>=15?3:0;if((nb-nc-2*ne)%2)nb++;const bw=L/nb,nw=(nb-nc-2*ne)/2;
  const seg=[];let k0=0;[[ne,1.2,'e'],[nw,0,'w'],[nc,2.4,'c'],[nw,0,'w'],[ne,1.2,'e']].forEach(([n,p,t])=>{if(n>0)seg.push({z0:-L/2+k0*bw,z1:-L/2+(k0+n)*bw,p,t,n});k0+=n;});
  const win=(f,P,v,j,k,n,s,w)=>{const ar=j===(fl===3?1:0)&&st!=='uk',ww=Math.min(1.5,w*0.34),hh=fh*(ar?0.48:0.42);lmkWin(f,P,0,v+fh*(j===0?0.22:0.26),ww,hh,{ar:ar?1:0,f:tr,g:gl});
    if(gold&&j>0)f.deco.push({poly:[P(-ww*0.7,v+fh*0.26+hh+ww*0.62),P(ww*0.7,v+fh*0.26+hh+ww*0.62),P(0,v+fh*0.26+hh+ww*0.95)],c:gold});if(pil&&k>0)f.deco.push({a:P(-w/2,v),b:P(-w/2,v+fh),w:0.55,c:tr});};
  // фасад (+x) по ризалитам, задний фасад, торцы
  seg.forEach(g=>{const X=D/2+g.p;lmkBlk(M,X-0.01-(g.p?g.p+0.3:0),X,g.z0,g.z1,0,H,{col:wc,fl,bay:bw,sd:'r',sk:'lfb',win});
    if(g.p)[[g.z0,-1],[g.z1,1]].forEach(([z,s])=>lmkQ(M,[[D/2,0,z],[X,0,z],[X,H,z],[D/2,H,z]],wc,'wall',[0,0,s]));lmkCorn(M,D/2-0.6,X,g.z0,g.z1,H,0.35,0.6,tr);});
  lmkBlk(M,-D/2,D/2,-L/2,L/2,0,H,{col:wc,fl,bay:bw,sd:'lfb',sk:'r',win:(f,P,v,j)=>lmkWin(f,P,0,v+fh*0.24,Math.min(1.4,bw*0.32),fh*0.42,{g:gl})});lmkCorn(M,-D/2,D/2-0.6,-L/2,L/2,H,0.35,0.6,tr);
  // крыша
  const yR=H+0.6;if(st==='fc'){lmkMans(M,-D/2-0.2,D/2+0.2,-L/2-0.2,L/2+0.2,yR,3.4,1.7,1.4,rf);for(let k=1;k<nb;k+=2){const z=-L/2+(k+0.5)*bw;const Dm=mBox(M,D/2-1.6,yR+0.4,z-0.75,D/2-0.4,yR+2.4,z+0.75,tr,'wall',['d','l']);lmkWin(Dm.r,lmkFP(Dm.r),0,yR+0.6,0.8,1.2,{f:wc,g:gl});lmkGab(M,D/2-1.8,D/2-0.2,z-0.85,z+0.85,yR+2.4,0.9,rf,tr,'x',0.1);}}
  else if(flat){lmkQ(M,[[-D/2,yR,-L/2],[D/2,yR,-L/2],[D/2,yR,L/2],[-D/2,yR,L/2]],'#8a857c','stone',[0,1,0]);[[D/2+0.2,-L/2,D/2+0.2,L/2],[-D/2-0.2,L/2,-D/2-0.2,-L/2],[-D/2,-L/2-0.2,D/2,-L/2-0.2],[D/2,L/2+0.2,-D/2,L/2+0.2]].forEach(([a,b,c,d])=>{
      if(st==='ly')lmkCren(M,[a,b],[c,d],yR,yR,0.6,0,0.5,1.0,2.2,wc,'wall');else lmkSeg(M,[a,b],[c,d],0.5,yR-0.1,yR+1.0,yR-0.1,yR+1.0,tr,'stone','');});}
  else lmkHip(M,-D/2,D/2,-L/2,L/2,yR,D*(st==='de'?0.4:0.26),rf,0.5);
  // середина: портик с фронтоном, купол
  const c=seg.find(g=>g.t==='c'),X=D/2+c.p,zm=(c.z0+c.z1)/2,cw=(c.z1-c.z0)/2,port=st!=='ru'&&st!=='rg'||r()<0.5;
  if(port){const xc=X+2.2,nc2=c.n+1;for(let k=0;k<nc2;k++){const z=c.z0+0.6+(cw*2-1.2)*k/(nc2-1);lmkCol(M,xc,0.35,z,Math.min(0.55,fh*0.09),H-0.35,tr,'stone',8);}
    mBox(M,X-0.2,H,c.z0+0.2,xc+0.8,H+0.7,c.z1-0.2,tr,'stone',['d']);const Pd=lmkExt(M,[[c.z0+0.2,H+0.7],[c.z1-0.2,H+0.7],[zm,H+0.7+cw*0.32]],X-0.2,xc+0.8,tr,'stone','x',true);
    if(gold)Pd.b.deco=[{dot:[xc+0.81,H+0.7+cw*0.12,zm],r:cw*0.1,c:gold}];lmkGab(M,X-1.4,xc+0.8,c.z0+0.2,c.z1-0.2,H+0.7,cw*0.32,rf,null,'x',0.25);}
  else{const A=lmkExt(M,[[c.z0,H],[c.z1,H],[c.z1,H+fh*0.7],[zm,H+fh*0.7+cw*0.28],[c.z0,H+fh*0.7]],X-0.8,X,wc,'wall','x',true);A.b.deco=[{dot:[X+0.01,H+fh*0.5,zm],r:cw*0.16,c:gold||tr}];}
  if(st==='us'||st==='fc'&&r()<0.3){const rd=Math.min(D*0.32,cw*1.3),yd=yR+D*0.18;lmkRev(M,[0,yd-1,0],[[rd*1.15,0],[rd*1.15,1]],16,tr,'stone');const Dr=lmkRev(M,[0,yd,0],[[rd,0],[rd,rd*0.8]],16,tr,'wall');Dr[0].forEach((f,i)=>{if(i%2===0)lmkWin(f,lmkFP(f),0,yd+rd*0.15,rd*0.12,rd*0.4,{ar:1,g:gl});});
    lmkDome(M,0,yd+rd*0.8,0,rd*1.04,rd*0.95,st==='us'?'#ece8de':'#5f8f7a',st==='us'?'wall':'paint',16);lmkRev(M,[0,yd+rd*1.72,0],[[rd*0.18,0],[rd*0.18,rd*0.4],[0,rd*0.55]],8,tr,'stone');}
  // Россия: главы домовой церкви на южном ризалите
  if(gold){const e=seg[seg.length-1],zc=(e.z0+e.z1)/2,rr=clamp(D*0.085,1.4,3),yb=yR+D*0.2,q=rr*2.4;mBox(M,-q*1.25,H,zc-q*1.25,q*1.25,yb,zc+q*1.25,wc,'wall',['d']);lmkHip(M,-q*1.25,q*1.25,zc-q*1.25,zc+q*1.25,yb,0.6,rf,0.2);
    [[0,0,1],[-1,-1,0.6],[1,-1,0.6],[1,1,0.6],[-1,1,0.6]].forEach(([sx,sz,k])=>{const x=sx*q,z=zc+sz*q;bDrum(M,x,yb,z,rr*k,rr*1.9*k,wc,10);bOnion(M,x,yb+rr*1.9*k+0.22,z,rr*1.12*k,rr*2.4*k,gold);bCross(M,x,yb+rr*(1.9+2.4)*k+0.1,z,rr*1.1*k,gold);});}}
// Французский замок эпохи Возрождения: высокий шиферный объём, люкарны, угловые круглые башни с конусами, высокие трубы
function lmkChateau(M,o,h,hf,r,S,L,D){L=Math.min(L,140);D=Math.max(D,12);const H=clamp(o.h>0?o.h*0.55:14,10,24),wc='#e4dccb',tr='#f4eee0',rf='#4f5662',fl=3,fh=H/fl,gl='#34465a',Rt=D*0.26;
  lmkPl(M,-D/2,D/2,-L/2,L/2,hf,'#8a8274',0.3);
  lmkBlk(M,-D/2,D/2,-L/2,L/2,0,H,{col:wc,fl,bay:4.2,sd:'rlfb',win:(f,P,v)=>lmkWin(f,P,0,v+fh*0.22,1.3,fh*0.56,{f:tr,g:gl,x:tr})});lmkCorn(M,-D/2,D/2,-L/2,L/2,H,0.3,0.5,tr);
  lmkHip(M,-D/2,D/2,-L/2,L/2,H+0.5,D*0.62,rf,0.4);const nd=Math.max(2,Math.round(L/8.4));
  for(let k=0;k<nd;k++){const z=-L/2+(k+0.5)*L/nd,y=H+0.5;const Dm=mBox(M,D/2-1.2,y,z-1,D/2+0.1,y+3.2,z+1,tr,'wall',['d','l','t']);lmkWin(Dm.r,lmkFP(Dm.r),0,y+0.4,1.0,1.8,{f:wc,g:gl,x:tr});lmkExt(M,[[z-1.2,y+3.2],[z+1.2,y+3.2],[z,y+4.8]],D/2-1.4,D/2+0.3,tr,'wall','x',true);}
  [[D/2,L/2],[D/2,-L/2],[-D/2,L/2],[-D/2,-L/2]].forEach(([x,z])=>{const T=lmkRev(M,[x,0,z],[[Rt,0],[Rt,H+2.4]],14,wc,'wall');T[0].forEach(f=>{const d=f.n[0]*Math.sign(x)+f.n[2]*Math.sign(z);if(d>1.0)[0.25,0.6].forEach(t=>lmkWin(f,lmkFP(f),0,H*t,0.9,1.6,{f:tr,g:gl}));});
    lmkRev(M,[x,H+2.4,z],[[Rt+0.35,0],[Rt+0.35,0.4],[Rt*0.95,0.4]],14,tr,'stone');lmkCone(M,x,H+2.8,z,Rt*1.1,Rt*2.9,rf,'roof',14);mBox(M,x-0.07,H+2.8+Rt*2.85,z-0.07,x+0.07,H+2.8+Rt*2.85+1.4,z+0.07,'#3a3a3a','metal');});
  [-L*0.32,-L*0.08,L*0.16,L*0.36].forEach(z=>mBox(M,-0.7,H,z-0.9,0.7,H+D*0.62+2.4,z+0.9,wc,'wall',['d']));}
// Усадьба: двухэтажный дом с портиком и фронтоном; Россия — жёлтая с белыми колоннами, зелёной крышей и бельведером; Англия — кирпич; США — белая с колоннадой; Франция — шифер и башенка
function lmkManor(M,o,h,hf,r,S){const L=clamp(o.l||28,12,70),D=clamp(o.w||clamp(L*0.45,10,18),8,24),fl=o.h>11?3:2,H=clamp(o.h>0?Math.min(o.h,fl*4.4):fl*4.2,6,14),fh=H/fl,gl='#34465a';
  const st={ru:'ru',uk:'uk',ie:'uk',us:'us',fr:'fr',be:'fr',nl:'fr',de:'de',at:'de',ch:'de',it:'it',es:'it',mc:'it',ly:'it'}[h]||'fr',
    [wc,tr,rf]={ru:['#e9cf7e','#f6f3ea','#5d7f66'],uk:['#9a4532','#e6dfcd','#59606b'],us:['#f2efe8','#ffffff','#4a5058'],fr:['#d8cfbc','#efe8d8','#4f5662'],de:['#f0e6cf','#ffffff','#9a3f2c'],it:['#dcb27a','#f1e6cf','#ad5638']}[st];
  lmkPl(M,-D/2,D/2,-L/2,L/2,hf,'#8a8274',0.45);
  lmkBlk(M,-D/2,D/2,-L/2,L/2,0,H,{col:wc,fl,bay:3.6,sd:'rlfb',win:(f,P,v,j,k,n,s)=>{if(s==='r'&&j===0&&k===Math.floor(n/2))lmkWin(f,P,0,0,1.4,2.6,{ar:1,f:tr,op:'#4a3424'});else lmkWin(f,P,0,v+fh*0.24,1.05,fh*(j===1&&fl>2?0.52:0.46),{f:tr,g:gl,ar:st==='it'&&j===0?1:0});}});
  lmkCorn(M,-D/2,D/2,-L/2,L/2,H,0.25,0.45,tr);const yR=H+0.45;
  if(st==='fr'){lmkHip(M,-D/2,D/2,-L/2,L/2,yR,D*0.6,rf,0.4);for(let z=-L/2+3;z<L/2-2;z+=6.5){const Dm=mBox(M,D/2-1.2,yR+0.3,z-0.7,D/2-0.1,yR+2.2,z+0.7,tr,'wall',['d','l','t']);lmkWin(Dm.r,lmkFP(Dm.r),0,yR+0.5,0.8,1.2,{g:gl});lmkGab(M,D/2-1.4,D/2+0.1,z-0.85,z+0.85,yR+2.2,0.8,rf,tr,'x',0.1);}
    if(r()<0.6){const R=D*0.2,x=D/2,z=-L/2;lmkRev(M,[x,0,z],[[R,0],[R,H+2]],12,wc,'wall');lmkCone(M,x,H+2,z,R*1.15,R*2.6,rf,'roof',12);}}
  else lmkHip(M,-D/2,D/2,-L/2,L/2,yR,D*(st==='de'?0.45:st==='it'?0.22:0.3),rf,0.45);
  if(st==='uk'||st==='us'||st==='de')[-L*0.3,L*0.3].forEach(z=>mBox(M,-0.6,H,z-0.8,0.6,yR+D*0.3+1.6,z+0.8,st==='uk'?'#9a4532':'#8a7a6a','wall',['d']));
  // портик с колоннами и фронтоном
  if(st!=='fr'&&st!=='de'){const pw=st==='us'?L*0.38:Math.min(L*0.3,10),n=st==='us'?6:4,xc=D/2+2.4,cr=Math.min(0.42,H*0.05);for(let k=0;k<n;k++)lmkCol(M,xc,0.45,-pw/2+pw*k/(n-1),cr,H-0.45,tr,'stone',8);
    mBox(M,D/2-0.2,H,-pw/2-0.4,xc+0.6,H+0.55,pw/2+0.4,tr,'stone',['d']);lmkExt(M,[[-pw/2-0.4,H+0.55],[pw/2+0.4,H+0.55],[0,H+0.55+pw*0.2]],D/2-0.2,xc+0.6,tr,'stone','x',true);lmkGab(M,D/2-1,xc+0.6,-pw/2-0.4,pw/2+0.4,H+0.55,pw*0.2,rf,null,'x',0.2);
    mBox(M,D/2,0,-pw/2-0.6,xc+1.2,0.45,pw/2+0.6,'#b8b0a0','stone',['d']);}
  if(st==='ru'){const rb=D*0.16,yb=yR+D*0.3*0.6;lmkRev(M,[0,yb,0],[[rb,0],[rb,rb*1.1]],8,wc,'wall',{fl:1,a0:-Math.PI/8})[0].forEach(f=>lmkWin(f,lmkFP(f),0,yb+rb*0.2,rb*0.24,rb*0.5,{ar:1,f:tr,g:gl}));lmkDome(M,0,yb+rb*1.1,0,rb*1.08,rb*0.8,rf,'roof',10);mSphere(M,0,yb+rb*1.95,0,rb*0.12,'#c9a24a','metal');}}
// Вокзал: высокий зал с большим арочным окном и часами во фронтоне, двухэтажные крылья, часовая башня, навес над платформой за зданием (на −x), рельсы
function lmkStation(M,o,h,hf,r,S){const L=clamp(o.l||70,20,260),D=clamp(o.w||14,9,30),Hh=clamp(o.h>0?o.h:15,10,32),Hw=Math.min(Hh*0.62,10),Lh=clamp(L*0.28,12,40),
    brick=h==='uk'||h==='de'||h==='nl'||h==='be'||h==='us'||h==='ru',wc=brick?S.br:h==='it'||h==='es'||h==='mc'||h==='ly'?'#dcc08a':S.st,tr=brick?'#e2d8c2':'#efe6d2',rf=h==='it'||h==='es'||h==='mc'?'#ad5638':h==='de'||h==='at'?'#8f3b2b':'#4f5662',gl='#34465a';
  lmkPl(M,-D/2,D/2+1,-L/2,L/2,hf,'#8a8274',0.3);
  // зал
  const Hb=Lh*0.32,Bl=lmkBlk(M,-D/2,D/2+1,-Lh/2,Lh/2,0,Hh*0.24,{col:wc,fl:1,bay:Lh/3,sd:'r',win:(f,P)=>lmkWin(f,P,0,0,2.2,3.2,{ar:1,f:tr,op:'#4a3424'})}),
    Bu=mBox(M,-D/2,Hh*0.24,-Lh/2,D/2+1,Hh,Lh/2,wc,'wall',['d','t']),P=lmkFP(Bu.r),ww=Lh*0.62,wh=Hh*0.42;lmkWin(Bu.r,P,0,Hh*0.3,ww,wh,{ar:1,f:tr,g:gl,fw:0.5});
  [-1,0,1].forEach(k=>Bu.r.deco.push({a:P(k*ww*0.25,Hh*0.3),b:P(k*ww*0.25,Hh*0.3+wh+(k?ww*0.43:ww*0.5)),w:0.25,c:tr}));Bu.r.deco.push({a:P(-ww/2,Hh*0.3+wh),b:P(ww/2,Hh*0.3+wh),w:0.25,c:tr});
  ['f','b'].forEach(k=>lmkWin(Bu[k],lmkFP(Bu[k]),0,Hh*0.4,D*0.3,Hh*0.3,{ar:1,f:tr,g:gl}));lmkCorn(M,-D/2,D/2+1,-Lh/2,Lh/2,Hh,0.35,0.6,tr);
  const G=lmkExt(M,[[-Lh/2,Hh+0.6],[Lh/2,Hh+0.6],[0,Hh+0.6+Hb]],D/2+0.4,D/2+1.2,wc,'wall','x',true);lmkClock(G.b,[D/2+1.21,Hh+0.6+Hb*0.42,0],Math.min(1.6,Hb*0.28),'x');
  lmkGab(M,-D/2,D/2+0.4,-Lh/2,Lh/2,Hh+0.6,Hb,rf,wc,'x',0.4);
  // крылья
  [-1,1].forEach(s=>{const z0=s>0?Lh/2:-L/2,z1=s>0?L/2:-Lh/2;if(z1-z0<3)return;lmkBlk(M,-D/2,D/2,z0,z1,0,Hw,{col:wc,fl:2,bay:4,sd:'rl'+(s>0?'f':'b'),win:(f,P,v,j)=>lmkWin(f,P,0,v+Hw/2*0.22,1.1,Hw/2*0.5,{ar:j===0?1:0,f:tr,g:gl})});
    lmkCorn(M,-D/2,D/2,z0,z1,Hw,0.25,0.45,tr);lmkHip(M,-D/2,D/2,z0,z1,Hw+0.45,D*0.32,rf,0.4);});
  // часовая башня
  if(L>40&&h!=='fr'){const s=4.2,z=L/2-s*1.2,Ht=Hh*1.45,B=mBox(M,-s/2,0,z-s/2,s/2,Ht,z+s/2,wc,'wall',['d']);['r','l','f','b'].forEach(k=>{const f=B[k];const n=f.n;lmkClock(f,[n[0]?n[0]*(s/2+0.01):0,Ht-2.2,n[2]?z+n[2]*(s/2+0.01):z],1.2,n[0]?'x':'z');});
    lmkCorn(M,-s/2,s/2,z-s/2,z+s/2,Ht,0.3,0.4,tr);lmkPyr(M,0,Ht+0.4,z,s/2+0.4,s*1.3,rf,'roof');}
  // платформа с навесом и рельсы
  const xp=-D/2-4.5;mBox(M,-D/2-9,0,-L*0.48,-D/2,0.9,L*0.48,'#9a948a','stone',['d']);const nC=Math.max(2,Math.round(L*0.96/8));
  for(let k=0;k<=nC;k++){const z=-L*0.47+L*0.94*k/nC;mBox(M,xp-0.12,0.9,z-0.12,xp+0.12,5.2,z+0.12,'#4a564e','paint',['d','t']);}
  const cv=lmkQ(M,[[-D/2,6.0,-L*0.48],[-D/2,6.0,L*0.48],[-D/2-9.4,5.0,L*0.48],[-D/2-9.4,5.0,-L*0.48]],'#7a8088','paint',[0,1,0],true);
  mBox(M,-D/2-9.5,4.4,-L*0.48,-D/2-9.3,5.05,L*0.48,'#d8d2c4','wood',['t']);[-D/2-12,-D/2-13.5].forEach(x=>[-0.72,0.72].forEach(dx=>mBox(M,x+dx-0.05,0,-L*0.6,x+dx+0.05,0.18,L*0.6,'#5a5550','metal',['d'])));}
/* ---------- Восток ---------- */
// Мечеть: зал с куполом на барабане, малые купола, аркада у входа, минарет; Россия — татарская (двускатная крыша, минарет над входом)
function lmkMosque(M,o,h,hf,r,S){const L=clamp(o.l||24,10,90),W=clamp(o.w||L*0.85,8,L),H=clamp(o.h>0?Math.min(o.h*0.4,W*0.55):W*0.42,4.5,22),Hm=clamp(o.h>0?o.h:H*2.6,12,80),
    tat=h==='ru',wc=h==='ly'?'#f2ede2':tat?'#efe6d0':'#e8e0cf',dc=h==='ly'?(r()<0.5?'#f2ede2':'#3f7a5a'):tat?'#3f6f4f':'#8a9096',gl='#2c313a';
  lmkPl(M,-W/2,W/2,-L/2,L/2,hf,'#8a8274',0.3);
  lmkBlk(M,-W/2,W/2,-L/2,L/2,0,H,{col:wc,fl:1,bay:3.4,sd:'rlfb',win:(f,P,v,j,k,n,s)=>{if(s==='r'&&k===Math.floor(n/2)&&!tat)lmkWin(f,P,0,0,1.6,2.6,{ar:2,f:'#3f7a5a',op:'#4a3424'});else lmkWin(f,P,0,H*0.3,0.9,H*0.34,{ar:tat?1:2,f:shade(wc,-0.12),g:gl});}});
  if(tat){lmkGab(M,-W/2,W/2,-L/2,L/2,H,W*0.32,dc,wc,'z',0.4);const rb=1.7,z=-L/2+2.5,y=H+W*0.24;lmkRev(M,[0,y-1,z],[[rb,0],[rb,Hm*0.3]],8,wc,'wall',{fl:1,a0:-Math.PI/8});
    const ys=y-1+Hm*0.5,hS=Math.max(4,Hm-ys);lmkRev(M,[0,y-1+Hm*0.3,z],[[rb*1.3,0],[rb*1.3,0.3],[rb*0.8,0.3],[rb*0.8,Hm*0.2]],8,wc,'wall',{fl:1,a0:-Math.PI/8});lmkSpire(M,0,ys,z,rb*0.95,hS,dc,'roof');lmkCresc(M,0,ys+hS+0.27,z,0.45,'#c9a24a');return;}
  lmkQ(M,[[-W/2,H,-L/2],[W/2,H,-L/2],[W/2,H,L/2],[-W/2,H,L/2]],wc,'wall',[0,1,0]);[[W/2+0.1,-L/2,W/2+0.1,L/2],[-W/2-0.1,L/2,-W/2-0.1,-L/2],[-W/2,-L/2-0.1,W/2,-L/2-0.1],[W/2,L/2+0.1,-W/2,L/2+0.1]].forEach(([a,b,c,d])=>lmkCren(M,[a,b],[c,d],H,H,0.4,0,0.4,0.7,1.2,wc,'wall'));
  const rd=Math.min(W,L)*0.3;lmkRev(M,[0,H,0],[[rd,0],[rd,rd*0.45]],16,wc,'wall')[0].forEach((f,i)=>{if(i%2===0)lmkWin(f,lmkFP(f),0,H+rd*0.1,rd*0.1,rd*0.2,{ar:1,g:gl});});
  lmkRev(M,[0,H+rd*0.45,0],[[rd*1.04,0],[rd*0.98,rd*0.42],[rd*0.8,rd*0.78],[rd*0.45,rd*1.02],[0,rd*1.12]],16,dc,'paint',{sm:1});lmkCresc(M,0,H+rd*1.57+Math.max(0.35,rd*0.08)*0.6,0,Math.max(0.35,rd*0.08),'#c9a24a');
  [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx,sz])=>lmkDome(M,sx*W*0.32,H,sz*L*0.32,Math.min(W,L)*0.1,Math.min(W,L)*0.1,dc,'paint',10));
  // аркада у входа
  const xa=W/2+3.2;for(let k=0;k<=4;k++){const z=-L*0.36+L*0.72*k/4;mBox(M,xa-0.3,0,z-0.3,xa+0.3,H*0.62,z+0.3,wc,'wall',['d']);}mBox(M,W/2,H*0.62,-L*0.36-0.3,xa+0.4,H*0.62+0.6,L*0.36+0.3,wc,'wall',['d']);
  for(let k=0;k<4;k++)lmkDome(M,W/2+1.6,H*0.62+0.6,-L*0.36+L*0.72*(k+0.5)/4,1.7,1.4,dc,'paint',8);
  lmkMinaret(M,W/2+1.8,0,-L/2-1.8,Hm,clamp(Hm*0.045,1.2,2.6),wc,h==='ly'?'#3f7a5a':'#8a9096',h==='ly');}
// Китайский павильон: белая терраса, красные столбы и стены с решётками, крыша с загнутыми углами (o.two — двухъярусная)
function lmkCnHall(M,x0,x1,z0,z1,y,H,o){o=o||{};const red='#9a2a22',col='#8a2a22',rf=o.rf||'#4a5058',W=x1-x0,L=z1-z0,yb=o.noBase?y:y+1.4;
  if(!o.noBase){mBox(M,x0-2,y-1.6,z0-2,x1+2,yb,z1+2,'#e6e2d8','stone',['d']);mBox(M,x1+2,y-0.5,(z0+z1)/2-2.2,x1+4.4,yb-0.5,(z0+z1)/2+2.2,'#e6e2d8','stone',['d']);}
  const B=lmkBlk(M,x0+1.2,x1-1.2,z0+1.2,z1-1.2,yb,H,{col:red,fl:1,bay:3.6,sd:'rlfb',win:(f,P,v)=>{lmkWin(f,P,0,v+H*0.12,2.2,H*0.68,{op:'#5a2a1a'});const pts=f.deco[f.deco.length-1].poly;for(let k=1;k<4;k++)f.deco.push({a:P(-1.1+k*0.55,v+H*0.12),b:P(-1.1+k*0.55,v+H*0.8),w:0.07,c:'#c9a24a'});}});
  const nz=Math.max(2,Math.round(L/3.6)),nx=Math.max(2,Math.round(W/3.6));for(let k=0;k<=nz;k++)[x0+0.5,x1-0.5].forEach(x=>{const z=z0+0.5+(L-1)*k/nz;mBox(M,x-0.3,yb,z-0.3,x+0.3,yb+H,z+0.3,col,'paint',['d','t']);});
  for(let k=1;k<nx;k++)[z0+0.5,z1-0.5].forEach(z=>{const x=x0+0.5+(W-1)*k/nx;mBox(M,x-0.3,yb,z-0.3,x+0.3,yb+H,z+0.3,col,'paint',['d','t']);});
  mBox(M,x0+0.2,yb+H-0.6,z0+0.2,x1-0.2,yb+H+0.2,z1-0.2,'#3f6a5a','paint',['d']);const rh=Math.min(W,L)*0.32;
  if(o.two){lmkCnRoof(M,x0,x1,z0,z1,yb+H+0.2,rh*0.35,2.2,rf);const i=Math.min(W,L)*0.16,y2=yb+H+0.2+rh*0.35;mBox(M,x0+i,y2-0.2,z0+i,x1-i,y2+H*0.42,z1-i,red,'wall',['d','t']);lmkCnRoof(M,x0+i-0.4,x1-i+0.4,z0+i-0.4,z1-i+0.4,y2+H*0.42,rh*0.7,2.0,rf);}
  else lmkCnRoof(M,x0,x1,z0,z1,yb+H+0.2,rh,2.4,rf);}
// Пагода: восьмигранные (или квадратные) ярусы с загнутыми карнизами, навершие; в США — гоночная «пагода» Индианаполиса
function lmkPagoda(M,o,h,hf,r,S){if(h==='us'){const B=BLD.pagoda(r,0),k=clamp((o.h||22)/22,0.8,2);lmkScale(B,k,k,k);return lmkAdd(M,B);}
  const H=clamp(o.h>0?o.h:30,10,90),R0=clamp((o.w||o.l||H*0.32)/2,3,14),n=clamp(Math.round(H/(R0*0.7+2.4)),5,13),oct=r()<0.75,sd=oct?8:4,a0=-Math.PI/sd,
    wc=r()<0.5?'#c8b48c':'#9a958c',rf=r()<0.3?'#3f6a4a':'#4a5058',dk='#2a2622';
  lmkRev(M,[0,-1,0],[[R0*1.35,0],[R0*1.35,1.6],[0,1.6]],sd,'#d8d2c4','stone',{fl:1,a0});let y=0.6;const hs=H*0.84;
  for(let i=0;i<n;i++){const ri=R0*(1-0.45*i/n),rn=R0*(1-0.45*(i+1)/n),hi=hs/n*(i===0?1.5:1)*(n/(n+0.5));
    const T=lmkRev(M,[0,y,0],[[ri,0],[ri,hi]],sd,wc,'wall',{fl:1,a0});T[0].forEach((f,k)=>{if(k%2===i%2)lmkWin(f,lmkFP(f),0,y+hi*0.2,ri*0.32,hi*0.45,{ar:1,f:'#9a2a22',op:dk});});
    y+=hi;const re=ri+1.0+R0*0.12;lmkEaveN(M,0,y,0,ri,re,sd,a0,rf,0.35+R0*0.03,0.6+R0*0.04);lmkRev(M,[0,y,0],[[ri+0.05,0],[rn,0.7]],sd,rf,'roof',{fl:1,a0});y+=0.7;}
  lmkRev(M,[0,y,0],[[0.5,0],[0.5,1.2],[0.9,1.3],[0.9,1.6],[0.3,1.7],[0.25,H-y-0.5],[0,H-y]],8,'#c9a24a','metal');}
/* ---------- инженерные: акведук, обсерватория, водонапорная башня ---------- */
// Точки по ломаной через равные доли длины (n отрезков)
function lmkResN(P,n){const S=[0];for(let i=1;i<P.length;i++)S.push(S[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));const L=S[S.length-1],out=[];let j=0;
  for(let k=0;k<=n;k++){const s=L*k/n;while(j<P.length-2&&S[j+1]<s)j++;const t=clamp((s-S[j])/((S[j+1]-S[j])||1),0,1);out.push([P[j][0]+(P[j+1][0]-P[j][0])*t,P[j][1]+(P[j+1][1]-P[j][1])*t]);}return out;}
// Аркада по точкам опор pts (равный шаг): опоры от земли g до верха yT, между ними полуциркульные арки (свод и кладка над ним); w — ширина
function lmkArcade(M,pts,g,yT,w,col,mat){const n=pts.length;if(n<2)return;let sp=0;for(let i=1;i<n;i++)sp+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);sp/=n-1;
  const pt=Math.min(sp*0.3,3.4),dir=i=>{const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)],l=Math.hypot(b[0]-a[0],b[1]-a[1])||1;return [(b[0]-a[0])/l,(b[1]-a[1])/l];};
  for(let k=0;k<n;k++){const [tx,tz]=dir(k),p=pts[k],gy=g(p[0],p[1]);lmkSeg(M,[p[0]-tx*pt/2,p[1]-tz*pt/2],[p[0]+tx*pt/2,p[1]+tz*pt/2],w,gy-1.5,yT,gy-1.5,yT,col,mat,k===0?'a':k===n-1?'b':'');}
  for(let k=0;k<n-1;k++){const a=pts[k],b=pts[k+1],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1,tx=dx/L,tz=dz/L,nx=-tz,nz=tx,c=L/2,R=(L-pt)/2,ys=yT-0.9-R,N=R<3?4:R<6?5:6,
      Pt=(u,v,y)=>[a[0]+tx*u+nx*v,y,a[1]+tz*u+nz*v],ga=Math.max(g(a[0]+tx*(c-R),a[1]+tz*(c-R)),g(a[0]+tx*c,a[1]+tz*c),g(a[0]+tx*(c+R),a[1]+tz*(c+R)));
    if(ys-ga<1.2){lmkSeg(M,[a[0]+tx*(c-R),a[1]+tz*(c-R)],[a[0]+tx*(c+R),a[1]+tz*(c+R)],w,ga-1.5,yT,ga-1.5,yT,col,mat,'');continue;}
    const A=[];for(let i=0;i<=N;i++){const t=Math.PI*i/N;A.push([c-Math.cos(t)*R,ys+Math.sin(t)*R]);}
    for(let i=0;i<N;i++){const p=A[i],q=A[i+1],mm=[(p[0]+q[0])/2,(p[1]+q[1])/2];[1,-1].forEach(sd=>lmkQ(M,[Pt(p[0],sd*w/2,p[1]),Pt(q[0],sd*w/2,q[1]),Pt(q[0],sd*w/2,yT),Pt(p[0],sd*w/2,yT)],col,mat,[nx*sd,0,nz*sd]));
      lmkQ(M,[Pt(p[0],w/2,p[1]),Pt(q[0],w/2,q[1]),Pt(q[0],-w/2,q[1]),Pt(p[0],-w/2,p[1])],shade(col,-0.1),mat,[tx*(c-mm[0]),ys-mm[1]+0.001,tz*(c-mm[0])]);}}}
// Акведук: ряд арок вдоль линии (высокий — в два яруса, верхний вдвое чаще), жёлоб с водой наверху на одном уровне
function lmkAqueduct(M,o,h,hf,r,S){const ln=lmkLine(o,240),Q=ln.cl?ln.P.concat([ln.P[0]]):ln.P,Hm=clamp(o.h>0?o.h:18,5,50),w=clamp(o.w||3.2,2.2,7),col=h==='es'?'#a9a293':h==='it'?'#b8b09e':S.st,G=(x,z)=>lmkG(hf,x,z),n=Q.length;
  let gmin=1e9,len=0;for(let i=0;i<n-1;i++){const a=Q[i],b=Q[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),k=Math.max(1,Math.ceil(L/6));len+=L;for(let j=0;j<=k;j++)gmin=Math.min(gmin,G(a[0]+(b[0]-a[0])*j/k,a[1]+(b[1]-a[1])*j/k));}
  const yT=gmin+Hm,two=Hm>22,yM=gmin+Hm*0.56,sp=clamp(Hm*(two?0.4:0.5),5,18),m=Math.max(1,Math.round(len/sp));
  if(two){lmkArcade(M,lmkResN(Q,m),G,yM,w+1.2,col,'wall');lmkArcade(M,lmkResN(Q,m*2),(x,z)=>Math.max(G(x,z),yM+0.6),yT,w,col,'wall');}
  else lmkArcade(M,lmkResN(Q,m),G,yT,w,col,'wall');
  for(let i=0;i<n-1;i++){const a=Q[i],b=Q[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<0.5)continue;const tx=(b[0]-a[0])/L,tz=(b[1]-a[1])/L,ea=i>0?w*0.3:0,eb=i<n-2?w*0.3:0,A=[a[0]-tx*ea,a[1]-tz*ea],B=[b[0]+tx*eb,b[1]+tz*eb],e=(i===0?'a':'')+(i===n-2?'b':'');
    if(two)lmkSeg(M,A,B,w+1.8,yM-0.3,yM+0.6,yM-0.3,yM+0.6,shade(col,0.08),'stone',e);
    lmkSeg(M,A,B,w+0.5,yT-0.1,yT+0.7,yT-0.1,yT+0.7,shade(col,0.08),'stone',e);
    [1,-1].forEach(sd=>{const off=q=>[q[0]-tz*sd*(w/2-0.2),q[1]+tx*sd*(w/2-0.2)];lmkSeg(M,off(A),off(B),0.4,yT+0.6,yT+1.6,yT+0.6,yT+1.6,col,'wall',e);});
    lmkQ(M,[[A[0]-tz*(w/2-0.4),yT+1.25,A[1]+tx*(w/2-0.4)],[B[0]-tz*(w/2-0.4),yT+1.25,B[1]+tx*(w/2-0.4)],[B[0]+tz*(w/2-0.4),yT+1.25,B[1]-tx*(w/2-0.4)],[A[0]+tz*(w/2-0.4),yT+1.25,A[1]-tx*(w/2-0.4)]],'#3f6f86','water',[0,1,0]);}}
// Обсерватория: здание и башни с серебристыми куполами (тёмная щель); на Ванту — прежняя модель
function lmkObserv(M,o,h,hf,r,S){if(/ванту/i.test(o.n||'')){const B=BLD.observatory(r,0);return lmkAdd(M,B);}
  const L=clamp(o.l||30,12,90),D=clamp(o.w||12,8,24),H=clamp(o.h>0?o.h*0.5:8,5,14),wc=h==='ru'?'#efe2b6':S.pl,tr=shade(wc,-0.1),gl='#34465a';
  lmkPl(M,-D/2,D/2,-L/2,L/2,hf,'#8a8274',0.3);lmkBlk(M,-D/2,D/2,-L/2,L/2,0,H,{col:wc,fl:2,bay:3.6,sd:'rlfb',win:(f,P,v)=>lmkWin(f,P,0,v+H/2*0.25,1,H/2*0.48,{ar:1,f:tr,g:gl})});lmkCorn(M,-D/2,D/2,-L/2,L/2,H,0.3,0.5,tr);
  lmkHip(M,-D/2,D/2,-L/2,L/2,H+0.5,D*0.22,S.rf,0.3);
  const dome=(x,z,R,y0)=>{lmkRev(M,[x,y0,z],[[R,0],[R,R*0.9]],16,wc,'wall')[0].forEach((f,i)=>{if(i%4===0)lmkWin(f,lmkFP(f),0,y0+R*0.25,R*0.16,R*0.36,{ar:1,f:tr,g:gl});});const y1=y0+R*0.9;
    lmkRev(M,[x,y1,z],[[R*1.06,0],[R*1.06,0.3],[R,0.3]],16,tr,'stone');const pr=[];for(let i=0;i<=6;i++){const a=Math.PI/2*i/6;pr.push([i===6?0:R*Math.cos(a),R*0.95*Math.sin(a)]);}
    lmkRev(M,[x,y1+0.3,z],pr,14,'#d4d8dc','paint',{sm:1,a0:0.12,a1:Math.PI*2-0.12});lmkRev(M,[x,y1+0.3,z],pr,1,'#2a2c30','paint',{sm:1,a0:-0.12,a1:0.12});};
  dome(0,-L/2-D*0.1,D*0.42,H*0.9);if(L>24)dome(0,L/2+D*0.05,D*0.3,H*0.75);}
// Водонапорная башня: кирпичный ствол, широкий бак (кирпич с окнами или обшивка), шатёр; в США — стальной бак на ногах
function lmkWTower(M,o,h,hf,r,S){const H=clamp(o.h>0?o.h:24,12,50),R=clamp((o.w||o.l||H*0.3)/2,2.6,8),gl='#2c313a';
  if(h==='us'){const Rt=R*1.2,yl=H*0.62,c='#9aa0a6';for(let k=0;k<6;k++){const a=k/6*Math.PI*2;mTube(M,[[Math.cos(a)*Rt*1.15,0,Math.sin(a)*Rt*1.15],[Math.cos(a)*Rt*0.9,yl,Math.sin(a)*Rt*0.9]],0.22,5,c,'paint');}
    for(let j=1;j<3;j++){const y=yl*j/3,rr=Rt*(1.15-0.25*j/3);for(let k=0;k<6;k++){const a0=k/6*Math.PI*2,a1=(k+1)/6*Math.PI*2;mTube(M,[[Math.cos(a0)*rr,y,Math.sin(a0)*rr],[Math.cos(a1)*rr,y,Math.sin(a1)*rr]],0.08,4,c,'paint');}}
    mTube(M,[[0,0,0],[0,yl,0]],0.5,8,c,'paint');lmkRev(M,[0,yl,0],[[0,0],[Rt,Rt*0.3],[Rt,Rt*0.3+H*0.24],[Rt*1.04,Rt*0.3+H*0.24],[0,Rt*0.3+H*0.24+Rt*0.5]],16,'#b4bac0','paint');
    lmkRev(M,[0,yl+Rt*0.3,0],[[Rt+0.6,0],[Rt+0.6,1.0]],16,'#5a5f66','paint',{two:1});return;}
  const brick=h!=='it'&&h!=='es'&&h!=='mc'&&h!=='ly',wc=brick?S.br:S.pl,tr=brick?'#e8e0cc':shade(wc,-0.1),Hs=H*0.66,oct=r()<0.5,o2=oct?{fl:1,a0:-Math.PI/8}:{},n=oct?8:14;
  lmkPl(M,-R,R,-R,R,hf,'#8a8274',0.1);const T=lmkRev(M,[0,0,0],[[R,0],[R*0.9,Hs]],n,wc,'wall',o2);T[0].forEach(f=>{if(f.n[0]>0.8){lmkWin(f,lmkFP(f),0,0,1.1,2.2,{ar:1,f:tr,op:'#4a3424'});[0.4,0.7].forEach(t=>lmkWin(f,lmkFP(f),0,Hs*t,0.6,1.3,{ar:1,f:tr,g:gl}));}});
  lmkRev(M,[0,Hs,0],[[R*0.9,0],[R*1.3,1.4],[R*1.3,1.8]],n,tr,'stone',o2);const Ht=H*0.2,tk=h==='ru'&&r()<0.5?'#7a5c3c':wc;
  const K=lmkRev(M,[0,Hs+1.8,0],[[R*1.3,0],[R*1.3,Ht]],n,tk,tk===wc?'wall':'wood',o2);K[0].forEach((f,i)=>{if(i%2===0)lmkWin(f,lmkFP(f),0,Hs+1.8+Ht*0.25,0.9,Ht*0.45,{ar:1,f:tr,g:gl});});
  lmkRev(M,[0,Hs+1.8+Ht,0],[[R*1.42,-0.3],[R*1.42,0.1],[0,R*1.1]],n,h==='de'||h==='at'||h==='ch'||h==='ru'?'#8f3b2b':'#59606b','roof',Object.assign({},o2,{fl:1}));}
// Прочее: высокое — башня, низкое — каменный дом под вальмой
function lmkOther(M,o,h,hf,r,S){const L=clamp(o.l||12,4,80),W=clamp(o.w||L*0.7,4,60),H=clamp(o.h>0?o.h:8,3,80);if(H>2*Math.max(L,W))return lmkTower(M,o,h,hf,r,S);
  lmkPl(M,-W/2,W/2,-L/2,L/2,hf,'#8a8274',0.2);const fl=Math.max(1,Math.round(H/4)),wc=S.st;lmkBlk(M,-W/2,W/2,-L/2,L/2,0,H,{col:wc,fl,bay:3.6,sd:'rlfb',win:(f,P,v)=>lmkWin(f,P,0,v+H/fl*0.25,1,H/fl*0.45,{f:shade(wc,0.15),g:'#34465a'})});
  lmkHip(M,-W/2,W/2,-L/2,L/2,H,Math.min(L,W)*0.35,S.rf,0.4);}
/* ---------- главная ---------- */
const LMK_B={cathedral:lmkCathedral,church:lmkChurch,chapel:lmkChapel,castle:lmkCastle,palace:lmkPalace,manor:lmkManor,fort:lmkFort,ruins:lmkRuins,monastery:lmkMonast,gate:lmkGate,
  wall:lmkWall,tower:lmkTower,lighthouse:lmkLight,windmill:lmkWindmill,watermill:lmkWater,monument:lmkMonument,obelisk:lmkObelisk,statue:lmkStatue,column:lmkColumn,station:lmkStation,
  mosque:lmkMosque,pagoda:lmkPagoda,aqueduct:lmkAqueduct,observatory:lmkObserv,water_tower:lmkWTower};
function lmMesh(o,host,hf){o=o||{};const h=LMK_ST[host]?host:'fr',k=o.k||'',O={k,l:+o.l||0,w:+o.w||0,h:+o.h||0,y:+o.y||0,n:o.n||'',line:o.line},
    r=mulberry32(hashStr((O.n)+'|'+k+'|'+h+'|'+Math.round(O.l))),S=lmkS(h),M=new Mesh(),H=typeof hf==='function'?hf:null;
  try{(LMK_B[k]||lmkOther)(M,O,h,H,r,S);}catch(e){console.warn('lmMesh',k,e);M.F.length=0;lmkOther(M,O,h,H,mulberry32(1),S);}
  return lmkFoot(M);}
