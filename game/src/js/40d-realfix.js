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
function realFix(D){if(!D||D._fix!==undefined)return D&&D._fix?D._fix:D;D._fix=null;
  try{const P=D.pts,n=P.length;if(n<20)return D;
    if(D.closed){// круг: вырезать нельзя. Два прохода одной улицы ставим на одну высоту (поздний — на 4 см ниже, чтобы два
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
