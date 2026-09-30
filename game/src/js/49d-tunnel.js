/* ================= ТОННЕЛЬ СКВОЗЬ СКАЛУ: портал, свод, лампы, темнота, эхо ================= */
// 0.18: раньше дорога могла «въехать в гору» — скала стояла поперёк полотна, машина пропадала в ней и выскакивала.
// Теперь в горах (и в Монако) бывает настоящий тоннель: каменный портал с аркой, свод из дикого камня (у порталов —
// кладка), лампы на стенах, внутри темно — глаза привыкают, горят фары; мотор гудит с эхом. Над тоннелем — скальный гребень с елями.
const TUN={hw:0.6,spr:3.3,rise:2.5};
function tunOf(T,i){if(!T||!T.tunAt||!T.tunAt[i])return null;for(const q of T.tunnels)if(i>=q.i0&&i<=q.i1)return q;return null;}
function tunNear(T,i,d){if(!T||!T.tunAt)return false;const n=T.n;for(let k=-d;k<=d;k++){const j=T.closed?((i+k)%n+n)%n:i+k;if(j>=0&&j<n&&T.tunAt[j])return true;}return false;}
// Темнота под сводом: у портала светло, через ~30 м — темно; у ламп — светлее
function tunDarkAt(T,i){const q=tunOf(T,i);if(!q)return 0;const din=Math.min(i-q.i0,q.i1-i)*T.step;let dk=Math.pow(clamp(din/30,0,1),0.8)*0.97;
  const k=(i-q.i0)%6;if(din>10&&(k===3||k===4))dk*=0.7;return dk;}
// Код темноты для граней (лампа 10..110 — шейдер гасит солнце и небо)
function tunCode(T,i){return tunOf(T,i)?10+Math.round(tunDarkAt(T,i)*100):0;}
function tunDark(c){const T=R&&R.trk;return T&&T.tunAt&&T.tunAt[c.idx]?tunDarkAt(T,c.idx)*0.95:0;}
// Точка на ломаной по доле длины (для соединения контуров портала)
function tunResample(L,M){const d=[0];for(let i=1;i<L.length;i++)d.push(d[i-1]+Math.hypot(L[i][0]-L[i-1][0],L[i][1]-L[i-1][1],L[i][2]-L[i-1][2]));const tot=d[d.length-1]||1,out=[];let j=0;
  for(let m=0;m<M;m++){const s=m/(M-1)*tot;while(j<L.length-2&&d[j+1]<s)j++;const t=clamp((s-d[j])/((d[j+1]-d[j])||1),0,1),a=L[j],b=L[j+1];out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]);}return out;}
function tunFaceN(q,away){const a=q[0],b=q[1],c=q[2],n=v3n(v3x([b[0]-a[0],b[1]-a[1],b[2]-a[2]],[c[0]-a[0],c[1]-a[1],c[2]-a[2]]));const cx=(q[0][0]+q[2][0])/2,cy=(q[0][1]+q[2][1])/2,cz=(q[0][2]+q[2][2])/2;
  const s=(cx-away[0])*n[0]+(cy-away[1])*n[1]+(cz-away[2])*n[2];return s<0?[-n[0],-n[1],-n[2]]:n;}
function r3dTunnels(){const T=R3.T;R3.tuns=[];if(!T.tunnels||!T.tunnels.length)return;
  const L=(k,alt)=>texLi(k)>=0?k:alt,rockL=txLay(L('cliff','rock'),1,1),mossL=txLay(L('rock_moss','rock'),1,1),masL=txLay(L('tunnel','stone_wall'),1),archL=txLay('stone_wall',1);
  T.tunnels.forEach((q,qi)=>{const lit=new MB(),leaf=new MB(true),W=T.W,hw=W/2+TUN.hw,spr=TUN.spr,rise=TUN.rise,town=T.rc.track==='monaco',Lw=W/2+(town?22:34),NI=14,r=mulberry32(hashStr('tunm|'+T.rc.key+'|'+qi));
    // свод: от левой стены (−N) через верх к правой (+N)
    const prof=[[-hw,-0.12],[-hw,1.3],[-hw,spr]];for(let k=1;k<8;k++){const a=Math.PI-k/8*Math.PI;prof.push([Math.cos(a)*hw,spr+Math.sin(a)*rise]);}prof.push([hw,spr],[hw,1.3],[hw,-0.12]);
    const sec=[];
    for(let i=q.i0;i<=q.i1;i++){const p=T.pts[i],nn=T.N[i],t=T.T[i],y0=p[1],u=(i-q.i0)/Math.max(1,q.i1-q.i0),edge=Math.min(i-q.i0,q.i1-i)*T.step,jit=edge<8||town?0:1;
      const W3=(o,h)=>[p[0]+nn[0]*o,y0+h,p[2]+nn[1]*o];
      const inn=prof.map(([o,h],k)=>{if(!jit||k===0||k===prof.length-1)return W3(o,h);const j=(vnz(i*0.9,k*1.7,23)-0.5)*0.5,dx=o,dy=h-spr*0.7,l=Math.hypot(dx,dy)||1;return W3(o+dx/l*j,h+dy/l*j);});
      // гребень над тоннелем: к середине выше, края уходят в землю
      const H=8.4+6.5*Math.pow(Math.sin(Math.PI*u),0.7)+(vnz(i*0.23,0.5,31)-0.5)*3;
      const out=[];for(let k=0;k<=NI;k++){const f=k/NI*2-1,o=f*Lw,a=Math.abs(f),x=p[0]+nn[0]*o,z=p[2]+nn[1]*o,g=fH(x,z)-y0;
        let h=H*Math.pow(Math.max(0,1-a*a),0.9)+(vnz(i*0.31,k*0.9,41)-0.5)*2.4*(1-a*0.5);
        if(a>0.97)h=g-1.5;else h=Math.max(h,g+0.8*(1-a));if(Math.abs(o)<hw+1.6)h=Math.max(h,spr+rise+1.4);out.push([x,y0+h,z]);}
      sec.push({i,p,nn,t,inn,out,edge,y0,ax:W3(0,spr*0.7)});}
    // 1) свод и стены изнутри: у порталов — кладка, дальше — дикий камень; темнота по коду лампы
    for(let s=0;s<sec.length-1;s++){const A=sec[s],B=sec[s+1],mas=town||A.edge<8||B.edge<8;lit.e[1]=tunCode(T,A.i);lit.e[3]=mas?masL:rockL;
      for(let k=0;k<prof.length-1;k++){const qd=[A.inn[k],B.inn[k],B.inn[k+1],A.inn[k+1]],nrm=tunFaceN(qd,A.ax),inw=[-nrm[0],-nrm[1],-nrm[2]];
        const col=mas?[176,168,154]:cMix([122,116,106],[140,132,118],vnz(A.i*0.5,k,5));lit.poly(qd,inw,col,MID.stone);}
      // сток воды у стен: тёмная полоса щебня
      lit.e[3]=0;}
    lit.e[1]=0;lit.e[3]=0;
    // 2) гребень снаружи: круто — голая скала, полого — камень со мхом
    for(let s=0;s<sec.length-1;s++){const A=sec[s],B=sec[s+1];
      for(let k=0;k<NI;k++){const qd=[A.out[k],A.out[k+1],B.out[k+1],B.out[k]],nrm=tunFaceN(qd,A.ax),flat=nrm[1]>0.72;lit.e[3]=flat?mossL:rockL;
        lit.poly(qd,nrm,flat?[124,132,104]:cMix([150,144,134],[132,126,116],vnz(A.i*0.4,k*0.7,9)),MID.stone);}}
    lit.e[3]=0;
    // 3) порталы: скальная стена с аркой (кольцо между сводом и гребнем), кладка арки, карниз, лампа
    [[sec[0],-1],[sec[sec.length-1],1]].forEach(([S,dir])=>{const t=S.t,fw=[t[0]*dir,0,t[1]*dir],M=30,ai=tunResample(S.inn,M),ao=tunResample(S.out,M);
      lit.e[3]=rockL;for(let m=0;m<M-1;m++)lit.poly([ai[m],ai[m+1],ao[m+1],ao[m]],fw,cMix([146,140,130],[128,122,112],vnz(m*0.6,S.i,3)),MID.stone);
      // юбка под порталом до земли (там, где склон ниже)
      [[ai[0],ao[0]],[ai[M-1],ao[M-1]]].forEach(([a,b])=>{for(let k=0;k<8;k++){const u0=k/8,u1=(k+1)/8,P=u=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u],p0=P(u0),p1=P(u1),g0=fH(p0[0],p0[2])-2,g1=fH(p1[0],p1[2])-2;
        if(g0<p0[1]||g1<p1[1])lit.poly([p0,p1,[p1[0],Math.min(g1,p1[1]),p1[2]],[p0[0],Math.min(g0,p0[1]),p0[2]]],fw,[132,126,116],MID.stone);}});
      // арка: камни кладки вокруг проёма, чуть вперёд от стены
      lit.e[3]=archL;const ring=S.inn.slice(1,S.inn.length-1),band=0.85,lift=0.32,dO=[fw[0]*lift,0,fw[2]*lift];
      for(let k=0;k<ring.length-1;k++){const a=ring[k],b=ring[k+1],ca=[a[0]-S.ax[0],a[1]-S.ax[1],a[2]-S.ax[2]],cb=[b[0]-S.ax[0],b[1]-S.ax[1],b[2]-S.ax[2]],la=Math.hypot(...ca)||1,lb=Math.hypot(...cb)||1;
        const a2=[a[0]+ca[0]/la*band,a[1]+ca[1]/la*band,a[2]+ca[2]/la*band],b2=[b[0]+cb[0]/lb*band,b[1]+cb[1]/lb*band,b[2]+cb[2]/lb*band],F=p=>[p[0]+dO[0],p[1],p[2]+dO[2]];
        const c=k%2?[198,190,172]:[186,178,160];lit.poly([F(a),F(b),F(b2),F(a2)],fw,c,MID.stone);lit.poly([a,b,F(b),F(a)],[-ca[0]-cb[0],-ca[1]-cb[1],-ca[2]-cb[2]],cMul(c,0.85),MID.stone);lit.poly([a2,b2,F(b2),F(a2)],[ca[0]+cb[0],ca[1]+cb[1],ca[2]+cb[2]],cMul(c,0.9),MID.stone);}
      // замковый камень и карниз над аркой
      {const top=S.inn[Math.floor(S.inn.length/2)],hd=Math.atan2(t[0],t[1]);pBox(lit,top[0]+fw[0]*0.4,top[1]-0.2,top[2]+fw[2]*0.4,0.34,1.1,0.26,'#cfc6b0',MID.stone,hd);
        pBox(lit,S.p[0]+fw[0]*0.45,S.y0+spr+rise+1.05,S.p[2]+fw[2]*0.45,hw+1.6,0.45,0.32,'#c2b9a3',MID.stone,hd);}
      lit.e[3]=0;
      // валуны у подножия
      for(let k=0;k<3;k++){const sd=r()<0.5?-1:1,o=sd*(hw+2+r()*9),x=S.p[0]+S.nn[0]*o+fw[0]*(1+r()*3),z=S.p[2]+S.nn[1]*o+fw[2]*(1+r()*3);lit.add(pTree('rock',k%3),X3(r()*6.28,1+r()*1.2,[x,fH(x,z)-0.3,z]));}});
    // 4) лампы на стенах через ~24 м (светятся, темнота их не гасит)
    for(const S of sec){const k=(S.i-q.i0)%6;if(k!==3||S.edge<10)continue;const sd=Math.floor((S.i-q.i0)/6)%2?1:-1,hd=Math.atan2(S.t[0],S.t[1]),x=S.p[0]+S.nn[0]*sd*(hw-0.14),z=S.p[2]+S.nn[1]*sd*(hw-0.14);
      pBox(lit,x,S.y0+2.95,z,0.1,0.26,0.16,'#ffe2a8',MID.glow,hd);pBox(lit,S.p[0]+S.nn[0]*sd*(hw-0.05),S.y0+3.25,S.p[2]+S.nn[1]*sd*(hw-0.05),0.06,0.06,0.2,'#2a2a2c',MID.metal,hd);}
    // 5) ели (в Монако — сосны) на гребне
    {const set=SCEN_SETS[T.cfg.host],kinds=town?['pine']:(set.trees.filter(k=>k==='fir'||k==='pine').concat(['fir'])).slice(0,2);
      for(let s=1;s<sec.length-1;s+=2){if(r()<0.35)continue;const S=sec[s],k=2+Math.floor(r()*(NI-3));if(Math.abs(k-NI/2)<2&&r()<0.5)continue;const p=S.out[k],B=sec[s+1].out[k];if(Math.abs(p[1]-B[1])>2.5)continue;
        const P=fTree(kinds[Math.floor(r()*kinds.length)],Math.floor(r()*3),1),X=X3(r()*6.28,0.7+r()*0.4,[p[0],p[1]-0.3,p[2]]);lit.add(P.w,X);leaf.add(P.l,X);}}
    R3.tuns.push({m:g3Mesh(lit),l:g3Mesh(leaf)});});}
// Глаза привыкают: в тоннеле кадр светлее (снаружи — пересвет), фары включены
function r3dTunEnv(E,dt){const F=R.follow,dk=F?tunDark(F):0;R3.adapt=R3.adapt===undefined?1:R3.adapt+((1+1.15*dk)-R3.adapt)*Math.min(1,dt*(dk>0?1.4:2.2));
  if(R3.adapt<1.01&&dk<=0)return E;return Object.assign({},E,{exp:E.exp*R3.adapt,hl:Math.max(E.hl,dk>0.25?1:dk*4)});}
