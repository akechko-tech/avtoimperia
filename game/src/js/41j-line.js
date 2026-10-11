/* ================= 0.32: ГОНОЧНАЯ ТРАЕКТОРИЯ — КАК В КАРТИНГЕ И «ФОРМУЛЕ-1» =================
   Раньше машины соперников ехали по оси дороги и тормозили по её кривизне. Гонщик едет иначе: поворот проходят
   «снаружи — внутрь — наружу» (вход у внешней бровки, апекс у внутренней, выход снова к внешней) — так радиус дуги
   больше, а скорость в повороте выше. Перед длинной прямой апекс поздний: вход позже и круче, зато выход прямее
   и газ раньше — время на прямой важнее доли секунды в самом повороте. Связки поворотов («S», шпилька за шпилькой)
   проходят одной дугой: траектория первого поворота готовит вход во второй.
   Как считается: линия — сдвиг от оси дороги в каждой точке (в пределах ширины, с запасом на кузов). Ищем линию с
   наименьшей кривизной (сумма квадратов вторых разностей — как в алгоритме K1999 Р. Кулома для TORCS): итерации
   «каждая точка — к положению, где кривизна ровнее», сначала крупным шагом (длинные дуги), потом мелким. Затем —
   скорость по линии (сцепление, разгон, торможение) и веса: где машина разгоняется (выход на прямую), кривизна
   «дороже» — линия выпрямляет выход и сдвигает апекс позже. Мастерство пилота и уровень сложности решают,
   насколько точно соперник держит линию, как поздно тормозит и как часто ошибается. */
// запас от края дороги до центра машины: полкузова и немного воздуха
const LINE_EDGE=1.05;
// кривизна окружности через три точки (со знаком): K1999, GetRInverse
function rInv(ax,az,x,z,bx,bz){const x1=bx-x,y1=bz-z,x2=ax-x,y2=az-z,x3=bx-ax,y3=bz-az,det=x1*y2-x2*y1,nnn=Math.sqrt((x1*x1+y1*y1)*(x2*x2+y2*y2)*(x3*x3+y3*y3));return nnn>1e-12?2*det/nnn:0;}
function lineBuild(T){const n=T.n,cl=!!T.closed,P=T.pts,N=T.N,W=T.W||7,B=Math.max(0.25,W/2-LINE_EDGE);
  const lat=new Float32Array(n);if(n<8)return {lat,K:Float32Array.from(T.K||[]),B};
  const ix=j=>cl?((j%n)+n)%n:(j<0?0:j>=n?n-1:j),X=i=>P[i][0]+N[i][0]*lat[i],Z=i=>P[i][2]+N[i][1]*lat[i];
  // точка i — так, чтобы кривизна дуги prev–i–next стала заданной (K1999, AdjustRadius): сначала на прямую prev–next, потом шаг Ньютона
  const adjust=(a,i,b,target,sec)=>{const ax=X(a),az=Z(a),bx=X(b),bz=Z(b),dx=bx-ax,dz=bz-az,cx=P[i][0],cz=P[i][2],nx=N[i][0],nz=N[i][1];
    const den=dx*nz-dz*nx;let l=Math.abs(den)>1e-9?-(dx*(cz-az)-dz*(cx-ax))/den:lat[i];
    const dl=0.05,r0=rInv(ax,az,cx+nx*l,cz+nz*l,bx,bz),r1=rInv(ax,az,cx+nx*(l+dl),cz+nz*(l+dl),bx,bz),dr=(r1-r0)/dl;
    if(Math.abs(dr)>1e-9)l+=(target-r0)/dr;
    const lim=Math.max(0,B-sec);lat[i]=l<-lim?-lim:l>lim?lim:l;};
  const top=cl?n:n-1,steps=[];for(let s=64;s>=1;s>>=1)if(s*6<=n||s===1)steps.push(s);
  for(const s of steps){const it=Math.round((globalThis.LINE_IT??15)*Math.sqrt(s));
    // точки этого уровня
    const pts=[];for(let i=0;i<top;i+=s)pts.push(i);if(!cl&&pts[pts.length-1]!==n-1)pts.push(n-1);const m=pts.length;
    for(let k=0;k<it;k++){
      for(let q=0;q<m;q++){if(!cl&&(q===0||q===m-1))continue;const i=pts[q],pv=pts[(q-1+m)%m],nx2=pts[(q+1)%m],pp=pts[cl?(q-2+m)%m:Math.max(0,q-2)],nn=pts[cl?(q+2)%m:Math.min(m-1,q+2)];
        const r0=pp===pv?0:rInv(X(pp),Z(pp),X(pv),Z(pv),X(i),Z(i)),r1=nn===nx2?0:rInv(X(i),Z(i),X(nx2),Z(nx2),X(nn),Z(nn));
        const lp=Math.hypot(X(i)-X(pv),Z(i)-Z(pv)),ln=Math.hypot(X(nx2)-X(i),Z(nx2)-Z(i)),tgt=(ln*r0+lp*r1)/Math.max(1e-6,ln+lp),sec=lp*ln/800;
        adjust(pv,i,nx2,tgt,sec);}}
    // промежуточные точки: кривизна — от одной точки уровня к следующей плавно (K1999, Interpolate)
    if(s>1)for(let q=0;q<m-(cl?0:1);q++){const i=pts[q],nx2=pts[(q+1)%m],pv=pts[cl?(q-1+m)%m:Math.max(0,q-1)],nn=pts[cl?(q+2)%m:Math.min(m-1,q+2)];
      const r0=pv===i?0:rInv(X(pv),Z(pv),X(i),Z(i),X(nx2),Z(nx2)),r1=nn===nx2?0:rInv(X(i),Z(i),X(nx2),Z(nx2),X(nn),Z(nn));
      const gap=cl?((nx2-i+n)%n||n):nx2-i;
      for(let k=1;k<gap;k++){const j=cl?(i+k)%n:i+k,x=k/gap;lat[j]=lat[i]+(lat[nx2]-lat[i])*x;}
      for(let k=1;k<gap;k++){const j=cl?(i+k)%n:i+k,x=k/gap;adjust(i,j,nx2,x*r1+(1-x)*r0,0);}}}
  if(globalThis.LINE_APEX!==0)lineApex(T,lat);
  const K=lineK(T,lat);return {lat,K,B};}
// поздний апекс: у каждого поворота пробуем сдвинуть «рисунок» линии на несколько точек позже (или раньше) и берём то,
// что быстрее на всём круге — с учётом разгона на выходе (так дальше и прямая после поворота: выход важнее входа)
function lineTime(T,lat){const v=lineSpeed(T,lineK(T,lat));let t=0;for(let i=0;i<T.n;i++)t+=T.step/Math.max(1,v[i]);return t;}
function lineApex(T,lat){const n=T.n,cl=!!T.closed,K=lineK(T,lat),cs=[];const W=12;
  for(let i=2;i<n-2;i++){const a=Math.abs(K[i]);if(a>1/160&&a>=Math.abs(K[i-1])&&a>=Math.abs(K[i+1])&&(!cs.length||i-cs[cs.length-1]>W))cs.push(i);}
  let best=lineTime(T,lat);const ix=j=>cl?((j%n)+n)%n:(j<0?0:j>=n?n-1:j);
  for(const ic of cs){let bk=0,bt=best,bl=null;
    for(const k of [3,6,-2]){const cand=Float32Array.from(lat);
      for(let d=-W;d<=W;d++){const i=ix(ic+d),wg=Math.pow(Math.sin(Math.PI*(d+W)/(2*W)),2);cand[i]=lat[i]+wg*(lat[ix(ic+d-k)]-lat[i]);}
      const t=lineTime(T,cand);if(t<bt-0.005){bt=t;bk=k;bl=cand;}}
    if(bl){lat.set(bl);best=bt;}}
  return best;}
// кривизна линии (со знаком: > 0 — налево, как у оси дороги)
function lineK(T,lat){const n=T.n,cl=!!T.closed,P=T.pts,N=T.N,K=new Float32Array(n);
  const ix=j=>cl?((j%n)+n)%n:(j<0?0:j>=n?n-1:j),X=i=>P[i][0]+N[i][0]*lat[i],Z=i=>P[i][2]+N[i][1]*lat[i];
  for(let i=0;i<n;i++){const a=ix(i-1),c=ix(i+1);if(a===i||c===i){K[i]=0;continue;}const ax=X(i)-X(a),az=Z(i)-Z(a),bx=X(c)-X(i),bz=Z(c)-Z(i),la=Math.hypot(ax,az)||1e-6,lb=Math.hypot(bx,bz)||1e-6;
    const cr=(ax*bz-az*bx)/(la*lb),dt=(ax*bx+az*bz)/(la*lb);K[i]=Math.atan2(cr,dt)/((la+lb)/2);}
  if(!cl&&n>2){K[0]=K[1];K[n-1]=K[n-2];}
  // знак — как у T.K (там налево — плюс): сверяем по участку, где ось заметно изогнута
  let sg=0;for(let i=0;i<n;i+=3){const k0=T.K[i]||0;if(Math.abs(k0)>1/300)sg+=Math.sign(k0)*Math.sign(K[i]||0);}if(sg<0)for(let i=0;i<n;i++)K[i]=-K[i];
  return K;}
// скорость «типичной машины» по линии: сцепление в повороте, разгон 2,2 м/с², торможение 5 м/с²
// машина эпохи: в 1895 году разгон ~0,8 м/с² и 25 м/с наибольшая, к 1925-му — ~3,5 м/с² и 45 м/с (поздний апекс тем выгоднее, чем сильнее мотор)
function lineSpeed(T,K){const n=T.n,cl=!!T.closed,st=T.step,y=(T.rc&&T.rc.y)||1910,mu=0.85*9.81,top=clamp(25+0.7*(y-1895),25,48),acc=clamp(0.8+0.09*(y-1895),0.8,3.5),dec=clamp(3.5+0.08*(y-1895),3.5,6),v=new Float32Array(n);v.top=top;
  for(let i=0;i<n;i++){const k=Math.abs(K[i])+1e-5;v[i]=Math.min(top,Math.sqrt(mu/k));}
  for(let r=0;r<(cl?2:1);r++){
    for(let i=cl?0:1;i<n;i++){const a=cl?(i-1+n)%n:i-1,vm=Math.sqrt(v[a]*v[a]+2*acc*st);if(v[i]>vm)v[i]=vm;}
    for(let i=cl?n-1:n-2;i>=0;i--){const b=cl?(i+1)%n:i+1,vm=Math.sqrt(v[b]*v[b]+2*dec*st);if(v[i]>vm)v[i]=vm;}}
  return v;}
// трасса гонки строится одинаково (своё зерно) — линию считаем один раз за запуск игры
const LINE_CACHE=new Map();
function lineOf(T){if(!T.line){const key=T.rc&&T.rc.key?T.rc.key+'|'+T.n+'|'+T.W+'|'+(T.rc.y||0):null;const c=key&&LINE_CACHE.get(key);
    if(c)T.line=c;else{try{T.line=lineBuild(T);}catch(e){console.warn('line',e);T.line={lat:new Float32Array(T.n),K:Float32Array.from(T.K),B:0};}if(key){if(LINE_CACHE.size>12)LINE_CACHE.clear();LINE_CACHE.set(key,T.line);}}}
  return T.line;}
// мастерство за рулём: пилот × уровень сложности (только соперники; ваши гонщики — как есть)
function aiSkill(c){const k=c.you?1:(DIF().drv||1);return clamp((c.sk||0.8)*k,0.4,1.02);}
// насколько точно пилот держит гоночную линию: новичок жмётся к середине, мастер берёт всю ширину и поздний апекс
function linePrec(c){if(globalThis.LINE_OFF)return 0;const sk=aiSkill(c);return clamp(0.25+0.75*(sk-0.55)/0.4,0.2,1);}
