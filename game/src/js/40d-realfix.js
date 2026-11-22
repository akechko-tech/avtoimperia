/* ================= 0.51: починка маршрутов настоящих трасс =================
   Отзыв автора (21 ноября): «Гран-при Рима — полный бред: нужно поворачивать в кювет на пересечении дорог, чтобы попасть на путь
   трассы»; «есть ещё трассы, где можно найти дерево на дороге или необходимость проезжать сквозь холм».
   Причина — в данных маршрутов (их строит маршрутизатор по картам): местами он заезжает в переулок и возвращается той же
   дорогой («отросток»), местами делает петлю и второй раз идёт по той же улице. В игре это две дороги одна на другой: обочина
   и кювет одной лежат на полотне другой, высоты проходов разные (до 7 м), на развилке путь уходит «в кювет».
   Осмотр всех 84 трасс нашёл это на пяти: Рим, Страсбург, Сан-Франциско, Тарар, Монако.
   Осмотр на трёх длинах заезда нашёл ещё Ласарте (отросток в 3,7 км).
   Открытый маршрут — петлю и отросток вырезаем (дорога идёт прямо). Круг (Монако: стартовая прямая и набережная сходятся
   и пересекаются) — оба прохода ставим на одну высоту; обочины между ветками срезает branchLims. */
const RFX_NEAR=30,RFX_WIDE=200,RFX_GAP=6;/* дм: «та же дорога» (сошлись вплотную); «идут рядом»; точек между проходами */
function rfxSegD(p,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1;let t=((p[0]-a[0])*dx+(p[1]-a[1])*dz)/l2;t=t<0?0:t>1?1:t;return [Math.hypot(a[0]+dx*t-p[0],a[1]+dz*t-p[1]),t];}
function rfxDir(P,i,closed){const n=P.length,a=P[closed?(i-1+n)%n:Math.max(0,i-1)],b=P[closed?(i+1)%n:Math.min(n-1,i+1)],l=Math.hypot(b[0]-a[0],b[1]-a[1])||1;return [(b[0]-a[0])/l,(b[1]-a[1])/l];}
/* места, где два прохода маршрута сошлись вплотную: для точки i — [отрезок j, доля, косинус между направлениями, расстояние]
   (из нескольких — самый дальний по маршруту); cross — считать и пересечения под углом */
function rfxPairs(P,closed,cross){const n=P.length,cell=80,g=new Map(),out=new Array(n).fill(null);
  for(let i=0;i<n;i++){const k=Math.floor(P[i][0]/cell)+','+Math.floor(P[i][1]/cell);(g.get(k)||g.set(k,[]).get(k)).push(i);}
  for(let i=0;i<n;i++){const cx=Math.floor(P[i][0]/cell),cz=Math.floor(P[i][1]/cell),di=rfxDir(P,i,closed);let best=null;
    for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++){const L=g.get((cx+a)+','+(cz+b));if(!L)continue;for(const j of L){let gap=Math.abs(i-j);if(closed)gap=Math.min(gap,n-gap);if(gap<RFX_GAP)continue;
      const j1=closed?(j+1)%n:j+1;if(j1>=n)continue;const [d,t]=rfxSegD(P[i],P[j],P[j1]);if(d>=RFX_NEAR)continue;const dj=rfxDir(P,j,closed),c=di[0]*dj[0]+di[1]*dj[1];
      if(!cross&&Math.abs(c)<0.5)continue;if(!best||j>best[0])best=[j,t,c,d];}}
    out[i]=best;}
  return out;}
const rfxD=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
/* открытый маршрут: что вырезать — [[i,j],…]: точки i+1…j уходят. Отросток (туда и обратно) режем целиком — от места, где
   два его хода расходятся дальше 20 м; петлю и самопересечение — от первой общей точки до второй */
function rfxCuts(P){const n=P.length,pr=rfxPairs(P,false,true),cuts=[];let i=0,last=-1;
  /* пара видна хотя бы с одной стороны: поздняя точка легла на ранний отрезок — запишем её и ранней */
  for(let k=0;k<n;k++){const q=pr[k];if(q&&q[0]<k){const e=q[0];if(!pr[e]||pr[e][0]<k)pr[e]=[k,0,q[2],q[3]];}}
  while(i<n-RFX_GAP){const q=pr[i];if(!q||q[0]<=i){i++;continue;}let i0=i,j0=Math.min(n-2,q[0]);
    if(q[2]<-0.5)while(i0-1>last&&j0+1<n-1&&rfxD(P[i0-1],P[j0+1])<RFX_WIDE){i0--;j0++;}
    cuts.push([i0,j0]);last=j0;i=j0+1;}
  return cuts;}
/* круг: точки двух проходов одной улицы — для каждой номер парной (или −1) и знак: 1 — встречные, −1 — попутные */
function rfxTwins(P){const n=P.length,pr=rfxPairs(P,true,false),tw=new Int32Array(n).fill(-1),sg=new Int8Array(n);
  for(let i=0;i<n;i++){const q=pr[i];if(!q)continue;const rev=q[2]<0,j=q[0];
    for(const st of [1,-1])for(let k=0;k<n/2;k++){const a=((i+st*k)%n+n)%n,b=((j+(rev?-st:st)*k)%n+n)%n;if(rfxD(P[a],P[b])>=RFX_WIDE)break;let gap=Math.abs(a-b);gap=Math.min(gap,n-gap);if(gap<RFX_GAP)break;
      if(tw[a]<0){tw[a]=b;sg[a]=rev?1:(a<b?1:-1);}if(tw[b]<0){tw[b]=a;sg[b]=rev?1:(b<a?1:-1);}}}
  return {tw,sg};}
/* ================= 0.60: круг, который пересекает сам себя (Монако) =================
   Отзыв автора (23 ноября): «грани при Монако — непонятно куда ехать, поехал левее и врезался в невидимую стену».
   В данных Монако стартовая прямая и набережная — два встречных прохода одного бульвара — сходились до трёх метров и через
   60 м после старта ПЕРЕСЕКАЛИСЬ под острым углом на одной высоте. В 0.51 их поставили на одну высоту и срезали обочины между
   ними; на экране это развилка двух одинаковых дорог, а коридор трассы (±6 м) кончался посреди асфальта невидимой стеной.
   У настоящей гоночной трассы такого пересечения быть не может: маршрутизатор перепутал, по какой из двух параллельных дорог
   идёт какой проход. Чиним в данных:
     1) находим пересечение встречных проходов под острым углом на одной высоте (ровно одно — иначе не трогаем);
     2) меньшую из двух петель проходим в обратную сторону — проходы перестают пересекаться, касаясь в прежней точке;
     3) разводим встречные проходы до RFX_SEP между осями (каждый — на половину, вбок от соседа), сглаживая сдвиг;
     4) старт остаётся у прежнего места, на проходе, который ведёт к первому повороту круга.
   Между проходами в игре ставится видимая стенка (41-race.js, placeScenery), и коридор кончается на ней. */
const RFX_SEP=130;/* дм между осями встречных проходов */
function rfxSegX(a,b,c,d){const rx=b[0]-a[0],rz=b[1]-a[1],sx=d[0]-c[0],sz=d[1]-c[1],den=rx*sz-rz*sx;if(Math.abs(den)<1e-9)return null;
  const t=((c[0]-a[0])*sz-(c[1]-a[1])*sx)/den,u=((c[0]-a[0])*rz-(c[1]-a[1])*rx)/den;return t>=0&&t<1&&u>=0&&u<1?[t,u]:null;}
// пересечения маршрута с самим собой в плане: встречные проходы, острый угол, одна высота
function rfxCross(P){const n=P.length,X=[];
  for(let i=0;i<n;i++){const a=P[i],b=P[(i+1)%n],li=Math.hypot(b[0]-a[0],b[1]-a[1])||1;
    for(let j=i+RFX_GAP;j<n;j++){if(n-(j-i)<RFX_GAP)continue;const c=P[j],d=P[(j+1)%n],t=rfxSegX(a,b,c,d);if(!t)continue;
      const lj=Math.hypot(d[0]-c[0],d[1]-c[1])||1,cs=((b[0]-a[0])*(d[0]-c[0])+(b[1]-a[1])*(d[1]-c[1]))/(li*lj);if(cs>-0.8)continue;
      if(Math.abs(a[2]+(b[2]-a[2])*t[0]-(c[2]+(d[2]-c[2])*t[1]))>30)continue;X.push([i,j]);}}
  return X;}
// ближайшая точка встречного прохода (дальше G точек по маршруту, по высоте не дальше dh дм): [номер, расстояние] или null
function rfxOpp(Q,k,G,rad,dh){const n=Q.length,a=Q[(k-1+n)%n],b=Q[(k+1)%n];let bd=rad,bm=-1;
  for(let m=0;m<n;m++){let g=Math.abs(m-k);g=Math.min(g,n-g);if(g<G)continue;const d=Math.hypot(Q[m][0]-Q[k][0],Q[m][1]-Q[k][1]);if(d>=bd||(dh&&Math.abs(Q[m][2]-Q[k][2])>dh))continue;
    const c=Q[(m-1+n)%n],e=Q[(m+1)%n];if((b[0]-a[0])*(e[0]-c[0])+(b[1]-a[1])*(e[1]-c[1])>=0)continue;bd=d;bm=m;}
  return bm<0?null:[bm,bd];}
function rfxUncross(D){const P=D.pts,n=P.length,X=rfxCross(P);if(X.length!==1)return null;const [i,j]=X[0];let ord=[],rev=[];
  if(j-i<=n/2){for(let k=0;k<=i;k++){ord.push(k);rev.push(0);}for(let k=j;k>i;k--){ord.push(k);rev.push(1);}for(let k=j+1;k<n;k++){ord.push(k);rev.push(0);}}
  else{for(let k=i+1;k<=j;k++){ord.push(k);rev.push(0);}for(let k=i;k>=0;k--){ord.push(k);rev.push(1);}for(let k=n-1;k>j;k--){ord.push(k);rev.push(1);}}
  // на стыках точки могут почти совпасть — лишнюю убираем
  for(let k=ord.length-1;k>=0;k--){const a=P[ord[k]],b=P[ord[(k+1)%ord.length]];if(ord.length>20&&Math.hypot(a[0]-b[0],a[1]-b[1])<D.step*10*0.4){ord.splice(k,1);rev.splice(k,1);}}
  const m=ord.length,Q=ord.map(k=>P[k].slice()),G=RFX_GAP*2;
  // разводим встречные проходы: сторона — по большинству точек участка, сдвиг — вбок от соседа
  for(let it=0;it<14;it++){const N=[],opp=[],lat=new Float32Array(m),dsp=new Float32Array(m);let moved=0;
    for(let k=0;k<m;k++){const a=Q[(k-1+m)%m],b=Q[(k+1)%m],l=Math.hypot(b[0]-a[0],b[1]-a[1])||1;N.push([-(b[1]-a[1])/l,(b[0]-a[0])/l]);}
    for(let k=0;k<m;k++){const o=rfxOpp(Q,k,G,RFX_SEP*2,0);opp.push(o);if(o)lat[k]=(Q[o[0]][0]-Q[k][0])*N[k][0]+(Q[o[0]][1]-Q[k][1])*N[k][1];}
    let k0=0;while(k0<m&&opp[k0])k0++;if(k0>=m)break;/* k0 — точка без соседа: с неё считаем участки по кругу */
    for(let q=1;q<=m;q++){const k=(k0+q)%m;if(!opp[k]||opp[(k-1+m)%m])continue;let e=0,sum=0;while(e<m&&opp[(k+e)%m]){sum+=lat[(k+e)%m];e++;}const S=sum>=0?1:-1;
      for(let w=0;w<e;w++){const c=(k+w)%m,need=RFX_SEP-S*lat[c];if(need>1){dsp[c]=-S*need/2;moved++;}}}
    if(!moved)break;
    for(let p2=0;p2<3;p2++){const c=dsp.slice();for(let k=0;k<m;k++){const av=(c[(k-1+m)%m]+2*c[k]+c[(k+1)%m])/4;dsp[k]=c[k]?Math.sign(c[k])*Math.max(Math.abs(c[k]),Math.abs(av)):av;}}
    for(let k=0;k<m;k++)if(dsp[k]){Q[k][0]+=N[k][0]*dsp[k]*0.7;Q[k][1]+=N[k][1]*dsp[k]*0.7;}}
  // углы на стыках петли — сгладить
  for(let p2=0;p2<2;p2++){const C=Q.map(q=>q.slice());for(let k=0;k<m;k++){if(rev[k]===rev[(k+1)%m]&&rev[k]===rev[(k-1+m)%m]&&rev[k]===rev[(k+2)%m]&&rev[k]===rev[(k-2+m)%m])continue;
      const a=C[(k-1+m)%m],b=C[(k+1)%m];Q[k][0]=C[k][0]*0.5+(a[0]+b[0])*0.25;Q[k][1]=C[k][1]*0.5+(a[1]+b[1])*0.25;}}
  // два прохода бульвара — на одну высоту (у грубой карты высот между ними выходил уступ в несколько метров): участки по обе
  // стороны от прежнего пересечения, пока проходы идут рядом; к краям участка поправка сходит на нет
  {const opp=[];for(let k=0;k<m;k++)opp.push(rfxOpp(Q,k,G,RFX_SEP*2,0));const mark=new Uint8Array(m),w=new Float32Array(m),tg=new Float32Array(m),Rw=6;
    [ord.indexOf(i+1<n?i+1:0),ord.indexOf(j)].forEach(k0=>{if(k0<0)return;for(const st of [1,-1])for(let q=0;q<m;q++){const k=((k0+st*q)%m+m)%m;if(!opp[k]){if(q>3)break;continue;}mark[k]=1;mark[opp[k][0]]=1;}});
    for(let k=0;k<m;k++)if(mark[k]&&opp[k]){const h=(Q[k][2]+Q[opp[k][0]][2])/2;for(let q=-Rw;q<=Rw;q++){const c=((k+q)%m+m)%m,v=1-Math.abs(q)/(Rw+1);if(v>w[c]){w[c]=v;tg[c]=h;}}}
    for(let k=0;k<m;k++)if(w[k]>0)Q[k][2]+=(tg[k]-Q[k][2])*w[k];}
  // старт: у прежнего места; если его проход теперь идёт в обратную сторону — на соседнем (он ведёт к первому повороту)
  let st=ord.indexOf(0);if(st<0){let bd=1e18;for(let k=0;k<m;k++){const d=(Q[k][0]-P[0][0])**2+(Q[k][1]-P[0][1])**2;if(d<bd){bd=d;st=k;}}}
  if(rev[st]){const o=rfxOpp(Q,st,G,RFX_SEP*3,0);if(o)st=o[0];}
  const pts=Q.slice(st).concat(Q.slice(0,st)),ordR=ord.slice(st).concat(ord.slice(0,st)),map=new Int32Array(n).fill(-1);ordR.forEach((o,k)=>{map[o]=k;});
  for(let k=0;k<n;k++)if(map[k]<0){let q=k;while(map[q]<0)q=(q+1)%n;map[k]=map[q];}
  const mp=k=>map[clamp(k,0,n-1)],rng=(a,b)=>{if(b-a>=n*0.9)return [0,m-1];const x=mp(a),y=mp(b);return x<=y?[x,y]:[y,x];};
  const F=Object.assign({},D,{pts,_fix:undefined,_lmK:undefined,_fixed:{uncross:[i,j],was:n,start:ordR[0]}});
  if(D.seg)F.seg=D.seg.map(s=>{const o=s.slice(),r=rng(s[1],s[2]);o[1]=r[0];o[2]=r[1];return o;});
  if(D.bridges)F.bridges=D.bridges.map(b=>Object.assign({},b,{i:mp(b.i),i0:b.i0===undefined?undefined:mp(b.i0),i1:b.i1===undefined?undefined:mp(b.i1)}));
  if(D.rails)F.rails=D.rails.map(r=>Object.assign({},r,{i:mp(r.i)}));
  if(D.coast)F.coast=D.coast.map(q=>{const r=rng(q.i0,q.i1);return Object.assign({},q,{i0:r[0],i1:r[1]});});
  if(D.notes)F.notes=D.notes.map(q=>Object.assign({},q,{i:q.i===0?0:mp(q.i)}));
  if(D.lm)F.lm=D.lm.map(o=>o.i===undefined?o:Object.assign({},o,{i:o.i===0?0:mp(o.i)}));
  return F;}
function realFix(D){if(!D||D._fix!==undefined)return D&&D._fix?D._fix:D;D._fix=null;
  try{const P=D.pts,n=P.length;if(n<20)return D;
    if(D.closed){const U=rfxUncross(D);if(U)return D._fix=U;   // 0.60: круг пересекает сам себя — распутать и развести проходы
      // круг: вырезать нельзя. Два прохода одной улицы ставим на одну высоту (поздний — на 4 см ниже, чтобы два
      // полотна не мерцали одно сквозь другое); обочины между ними срежет branchLims
      const {tw}=rfxTwins(P);let cnt=0;for(let i=0;i<n;i++)if(tw[i]>=0)cnt++;if(!cnt)return D;const w=new Float32Array(n),tg=new Float32Array(n),R=6;
      for(let i=0;i<n;i++)if(tw[i]>=0){const h=(P[i][2]+P[tw[i]][2])/2-(i>tw[i]?0.4:0);for(let k=-R;k<=R;k++){const q=((i+k)%n+n)%n,v=1-Math.abs(k)/(R+1);if(v>w[q]){w[q]=v;tg[q]=h;}}}
      const out=P.map((p,i)=>w[i]>0?[p[0],p[1],p[2]+(tg[i]-p[2])*w[i]]:p);
      return D._fix=Object.assign({},D,{pts:out,_fix:undefined,_lmK:undefined,_fixed:{twin:cnt}});}
    const cuts=rfxCuts(P);if(!cuts.length)return D;
    let gone=0;cuts.forEach(c=>{gone+=c[1]-c[0];});if(gone>n*0.6)return D;/* вырезать пришлось бы больше половины — данные не трогаем */
    const map=new Int32Array(n),dead=new Uint8Array(n),pts=[];let c=0;
    for(let k=0;k<n;k++){while(c<cuts.length&&k>cuts[c][1])c++;const cut=c<cuts.length&&k>cuts[c][0]&&k<=cuts[c][1];if(cut){dead[k]=1;map[k]=pts.length-1;}else{map[k]=pts.length;pts.push(P[k]);}}
    const m=k=>map[clamp(k,0,n-1)],alive=(a,b)=>{for(let k=a;k<=b;k++)if(!dead[clamp(k,0,n-1)])return true;return false;};
    const F=Object.assign({},D,{pts,_fix:undefined,_lmK:undefined,_fixed:{cuts,gone}});
    if(D.seg)F.seg=D.seg.filter(s=>alive(s[1],s[2])).map(s=>{const o=s.slice();o[1]=m(s[1]);o[2]=m(s[2]);return o;});
    if(D.bridges)F.bridges=D.bridges.filter(b=>!dead[clamp(b.i,0,n-1)]).map(b=>Object.assign({},b,{i:m(b.i),i0:b.i0===undefined?undefined:m(b.i0),i1:b.i1===undefined?undefined:m(b.i1)}));
    if(D.rails)F.rails=D.rails.filter(r=>!dead[clamp(r.i,0,n-1)]).map(r=>Object.assign({},r,{i:m(r.i)}));
    if(D.coast)F.coast=D.coast.filter(q=>alive(q.i0,q.i1)).map(q=>Object.assign({},q,{i0:m(q.i0),i1:m(q.i1)}));
    if(D.notes)F.notes=D.notes.filter(q=>!dead[clamp(q.i,0,n-1)]).map(q=>Object.assign({},q,{i:m(q.i)}));
    if(D.lm)F.lm=D.lm.map(o=>o.i===undefined?o:Object.assign({},o,{i:m(o.i)}));
    return D._fix=F;}
  catch(e){console.warn('realFix',e);return D;}}
/* ================= обочины рядом с другой веткой дороги =================
   У каждого поперечника дороги — обочина на 14 м в обе стороны. На серпантине и у перекрёстка в эти 14 м попадает другая
   ветка той же трассы: обочина верхней ветки накрывала полотно нижней («проезжать сквозь холм»), у перекрёстка кювет одной
   дороги лежал на другой. Теперь обочина кончается на полпути до полотна соседней ветки, а обрыв закрыт откосом до земли. */
function branchLim(T,i,sd){const W=T.W,p=T.pts[i],nn=T.N[i],n=T.n,far=Math.ceil((W+16)/T.step)+2;
  let lim=14;for(let a=0;a<=14;a+=0.5){const o=sd*(W/2+a),x=p[0]+nn[0]*o,z=p[2]+nn[1]*o;if(branchNear(T,x,z,W/2,i,far)){lim=a/2;break;}}return lim;}
/* есть ли у точки (x,z) полотно другой ветки: отрезки дальше far точек по трассе от i */
function branchNear(T,x,z,rad,i,far){const cx=Math.floor(x/30),cz=Math.floor(z/30),n=T.n,P=T.pts;if(!T.cgrid)return false;
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const L=T.cgrid[(cx+a)+','+(cz+b)];if(!L)continue;
    for(const j0 of L)for(const j of [j0-1,j0]){/* в сетке — каждая вторая точка: берём оба отрезка у неё */if(j<0)continue;let g=Math.abs(j-i);if(T.closed)g=Math.min(g,n-g);if(g<far)continue;const j1=T.closed?(j+1)%n:j+1;if(j1>=n)continue;
      const A=P[j],B=P[j1],dx=B[0]-A[0],dz=B[2]-A[2],l2=dx*dx+dz*dz||1;let t=((x-A[0])*dx+(z-A[2])*dz)/l2;t=t<0?0:t>1?1:t;const qx=A[0]+dx*t-x,qz=A[2]+dz*t-z;if(qx*qx+qz*qz<rad*rad)return true;}}
  return false;}
/* номер точки соседней ветки, ближайшей к месту в off метрах вбок от оси (sd — сторона), или −1 */
function branchIdx(T,i,sd,off){const p=T.pts[i],nn=T.N[i],x=p[0]+nn[0]*sd*off,z=p[2]+nn[1]*sd*off,n=T.n,far=Math.ceil((T.W+16)/T.step)+2,cx=Math.floor(x/30),cz=Math.floor(z/30);let bd=1e18,bj=-1;if(!T.cgrid)return -1;
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const L=T.cgrid[(cx+a)+','+(cz+b)];if(!L)continue;for(const j of L){let g=Math.abs(j-i);if(T.closed)g=Math.min(g,n-g);if(g<far)continue;const q=T.pts[j],d=(q[0]-x)*(q[0]-x)+(q[2]-z)*(q[2]-z);if(d<bd){bd=d;bj=j;}}}
  return bj;}
function branchLims(T){if(T.shLim)return T.shLim;const n=T.n,L=new Float32Array(n*2).fill(14);T.shLim=L;let any=0;
  // сперва дёшево: есть ли у точки вообще чужая ветка в 24 м
  for(let i=0;i<n;i++){const p=T.pts[i];if(!branchNear(T,p[0],p[2],T.W+15,i,Math.ceil((T.W+16)/T.step)+2))continue;L[i*2]=branchLim(T,i,1);L[i*2+1]=branchLim(T,i,-1);if(L[i*2]<14||L[i*2+1]<14)any++;}
  T.shLimN=any;return L;}
/* ================= кусты =================
   Отзыв автора: «странно, что я могу врезаться в куст и он реально остановит машину, даже низкий». Куст, виноградная лоза,
   агава и живая изгородь больше не стена: машина продирается сквозь них и теряет скорость. */
const BRUSH={bush:7,vine:6,agave:5,hedge:10};/* замедление, м/с² на скорости 20 м/с */
function brushHit(c,o,dt){const k=BRUSH[o.kind];if(!k)return false;const v=Math.abs(c.vx);if(!dt||v<0.3)return true;
  const dec=k*(0.35+0.65*Math.min(1,v/20))*dt;c.vx-=Math.sign(c.vx)*Math.min(v,dec);c.vy*=Math.max(0,1-3*dt);
  const now=(typeof R!=='undefined'&&R&&R.t)||0;if(c.you&&c.player&&v>6&&!(c.brushAt!==undefined&&now-c.brushAt<4&&now>=c.brushAt)){c.brushAt=now;if(typeof rMsgT==='function')rMsgT(o.kind==='hedge'?'ИЗГОРОДЬ — машина продирается':'КУСТЫ — теряем скорость',1.1);}
  return true;}
