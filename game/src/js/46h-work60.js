/* ================= 0.60, этап 3 (доводка): трёхмерные модели кузовов и видов 1930–1960 =================
   В первой части этапа новые кузова показывались прежними моделями (седан двадцатых, фаэтон, автобус, лёгкий танк).
   Здесь у каждого свой облик — тем же набором приёмов, что у техники 0.51 (46g-work51.js): кузов «по шпангоутам», колёса,
   стёкла, хром, экипаж.
     stream   — обтекаемый седан (1934): покатый нос-«водопад», крыша, сбегающая к хвосту;
     micro    — микролитражка (1936): двухместное купе на короткой базе;
     small    — малый заднемоторный седан (1946): короткий нос без решётки, жалюзи на корме;
     pontoon  — понтонный седан (1948): три объёма, гладкий борт без отдельных крыльев;
     hardtop  — хардтоп (1949): длиннее и ниже, боковое стекло без стойки, светлая крыша, плавнички;
     roadster — спортивный родстер (1948): длинный капот, вырез дверей, низкое ветровое стекло, спицы;
     jeep     — армейский вездеход (1941): плоский капот, щелевая решётка, откидное стекло, запаска сзади;
     offroad  — вездеход (1948): угловатый кузов с жёсткой крышей, запаска на капоте;
     minibus  — микроавтобус (1950): вагонная компоновка, ряд окон, светлый верх;
     mtank    — средний танк (1939): широкие гусеницы с шестью катками, наклонный лоб, башня с длинной пушкой.
   Гоночные облики (prep 2 у соперников) не трогаем: workKind60 отвечает только серийным стилям. */
function workKind60(S){if(!S||!S.b||S.style==='moto'||/^gp|^carriage/.test(S.style||''))return '';
  return {b30:'stream',b31:'micro',b32:'pontoon',b33:'hardtop',b34:'small',b35:'roadster',b36:'jeep',b37:'offroad',b38:'minibus',b39:'mtank'}[S.b]||'';}
// тёмная арка над колесом на гладком борту: полукруг чуть шире шины
function w60Arch(X,x,r,z){const sd=x>=0?1:-1;mLathe(X.M,[x+sd*0.004,r,z],'x',[[r+0.075,0],[0,sd*0.002]],X.hi?14:8,'#0c0c0e','paint',{a0:0,a1:Math.PI,two:true});}
// хромированный бампер: полоса с загнутыми концами
function w60Bumper(X,z,w,yy,dir){const K=X.K;X.tube([[-w,yy,z-dir*0.1],[-w*0.92,yy,z],[w*0.92,yy,z],[w,yy,z-dir*0.1]],0.035,K.bright,K.brightMat,X.hi?6:4);}
/* гладкий кузов: o.st — шпангоуты спереди назад [z, полуширина, верх, низ?, радиус верха?]; o.green — надстройка со стёклами
   {zA,zB,zC,zD — низ лобового, начало крыши, конец крыши, низ заднего стекла; wB,wT — полуширина у пояса и у крыши; yb,yt; wins} */
function w60Body(X,o){const {M,K,hi,col,tube}=X,n=hi?3:1,r=o.r,tw=o.tw;X.setWt(o.wheel||'disc');
  [-1,1].forEach(sd=>{X.WH(sd*o.t/2,r,o.wb/2,r,tw,false,true);X.WH(sd*o.t/2,r,-o.wb/2,r,tw,false,false);});
  const P=a=>({z:a[0],p:rsec(a[1],a[1]*(o.tumble||0.95),a[3]===undefined?o.yb:a[3],a[2],0.06,a[4]===undefined?0.1:a[4],n,'o')});
  const H=o.st.map(P);mLoft2(M,H,col,'paint',{wrap:true});mCap(M,H[0],col,'paint',1);mCap(M,H[H.length-1],col,'paint',-1);
  // арки: на борту у колёс (полуширина борта в этом месте — по шпангоутам)
  const wAt=z=>{for(let k=0;k<o.st.length-1;k++){const a=o.st[k],b=o.st[k+1];if(z<=a[0]&&z>=b[0]){const f=(a[0]-z)/((a[0]-b[0])||1);return a[1]+(b[1]-a[1])*f;}}return o.st[0][1];};
  if(!o.noArch)[-1,1].forEach(sd=>[o.wb/2,-o.wb/2].forEach(z=>w60Arch(X,sd*wAt(z),r,z)));
  const topAt=z=>{for(let k=0;k<o.st.length-1;k++){const a=o.st[k],b=o.st[k+1];if(z<=a[0]&&z>=b[0]){const f=(a[0]-z)/((a[0]-b[0])||1);return a[2]+(b[2]-a[2])*f;}}return o.st[0][2];};
  const g=o.green;if(g){const rc=o.roofCol||col,rt=Math.min(0.13,(g.yt-g.yb)*0.42);
    // надстройка: низ лобового и заднего стекла ложится на кузов — по его ширине и высоте в этом месте
    const yA0=topAt(g.zA),wA0=Math.min(g.wB,wAt(g.zA)*0.93),yD0=topAt(g.zD),wD0=Math.min(g.wB,wAt(g.zD)*0.93);
    const end=(z,w,yy)=>({z,p:rsec(w,w,yy-0.06,yy+0.02,0.02,0.02,n,'o')}),mid=z=>({z,p:rsec(g.wB,g.wT,g.yb-0.03,g.yt,0.02,rt,n,'o')});
    mLoft2(M,[end(g.zA,wA0,yA0),mid(g.zB),mid(g.zC),end(g.zD,wD0,yD0)],rc,'paint',{wrap:true});
    const h=g.yt-g.yb,yA=g.yb+0.07,yB=g.yt-0.13,xAt=yy=>g.wB+(g.wT-g.wB)*((yy-g.yb)/h)+0.007,fr=shade(rc,-0.5);
    // боковые стёкла: у первого и последнего низ вытянут вдоль наклона стоек
    (g.wins||[]).forEach(([za,zb],k,W)=>{const ea=k===0?(g.zA-g.zB)*0.4:0,eb=k===W.length-1?Math.min(0.5,(g.zC-g.zD)*0.4):0;
      [-1,1].forEach(sd=>{const q=[[sd*xAt(yA),yA,za+ea],[sd*xAt(yA),yA,zb-eb],[sd*xAt(yB),yB,zb],[sd*xAt(yB),yB,za]];mFace(M,q,K.glass,'glass',[0,(yA+yB)/2,(za+zb)/2]);
        if(hi)tube(q.concat([q[0]]),0.008,fr,'paint',3);});});
    // лобовое и заднее стекло — на наклонных гранях
    const slope=(z0,y0,w0,z1,f0,f1,k,ref)=>{const dz=z1-z0,dy=g.yt-y0,l=Math.hypot(dz,dy)||1,nz=Math.sign(z0-z1)*dy/l*0.014,ny=Math.abs(dz)/l*0.014,at=f=>[z0+dz*f+nz,y0+dy*f+ny],a=at(f0),b=at(f1),wa=(w0+(g.wT-w0)*f0)*k,wb2=(w0+(g.wT-w0)*f1)*k;
      mFace(M,[[-wa,a[1],a[0]],[wa,a[1],a[0]],[wb2,b[1],b[0]],[-wb2,b[1],b[0]]],K.glass,'glass',ref);};
    slope(g.zA,yA0,wA0,g.zB,0.16,0.88,0.84,[0,g.yb,g.zB-1]);slope(g.zD,yD0,wD0,g.zC,g.rear0===undefined?0.25:g.rear0,0.85,g.rearK||0.62,[0,g.yb,g.zC+1]);}
  return H;}
// экипаж в закрытом или открытом кузове: руль, сиденье, шофёр
function w60Crew(X,x,ys,z,o){o=o||{};if(o.seat!==false)X.seat(x,z,ys,0.24,0.42,0.42,{});if(o.seat2)X.seat(-x,z,ys,0.24,0.42,0.42,{});
  X.steer(x,ys+0.34,z+0.42,0.18,0.85);X.drvF(x,ys-0.03,z,z+0.45,ys+0.34);X.eyeAt(x,ys-0.03,z);}
function workModel60(kind,X){const {M,S,K,hi,y,col,B,tube}=X,n=hi?3:1,chrome=(x0,y0,z0,x1,y1,z1)=>B(x0,y0,z0,x1,y1,z1,K.bright,K.brightMat);
  if(kind==='pontoon'||kind==='hardtop'){const ht=kind==='hardtop',wb=ht?3.1:2.9,t=1.42,r=0.34,tw=0.17,w=0.775,zf=wb/2+0.95,zr=-wb/2-(ht?1.45:1.2);
    const roof=ht?shade(col,0.55):col;
    w60Body(X,{wb,t,r,tw,yb:0.26,roofCol:roof,st:[[zf+0.02,0.58,0.72,0.42,0.12],[zf-0.12,0.74,0.86,0.34],[zf-0.5,w,0.93],[0.85,w,0.97],[-0.9,w,0.95],[zr+0.6,w,ht?0.9:0.92],[zr+0.12,0.72,0.84,0.34],[zr,0.58,0.74,0.42,0.12]],
      green:ht?{zA:0.92,zB:0.42,zC:-0.82,zD:-1.6,wB:0.71,wT:0.6,yb:0.95,yt:1.45,wins:[[0.36,-0.76]],rearK:0.8}:{zA:0.95,zB:0.5,zC:-0.95,zD:-1.5,wB:0.72,wT:0.6,yb:0.95,yt:1.52,wins:[[0.42,-0.2],[-0.28,-0.88]]}});
    // решётка: широкая хромовая полоса; у понтона — «пуля» посередине
    chrome(-0.56,0.5,zf-0.02,0.56,0.58,zf+0.05);chrome(-0.5,0.62,zf-0.03,0.5,0.66,zf+0.04);if(!ht)mLathe(M,[0,0.55,zf+0.04],'z',[[0.09,0],[0.07,0.05],[0,0.09]],hi?12:6,K.bright,K.brightMat);else for(let k=-4;k<=4;k++)chrome(k*0.11-0.012,0.5,zf-0.02,k*0.11+0.012,0.66,zf+0.055);
    [-1,1].forEach(sd=>{X.headlamp(sd*0.6,0.8,zf-0.2,0.1,'bowl');X.tailLamp(sd*0.62,0.72,zr+0.04);if(hi)chrome(sd*(w+0.004)-0.006,0.6,zr+0.5,sd*(w+0.004)+0.006,0.63,zf-0.45);
      if(ht){B(sd*0.7-0.02,0.86,zr+0.1,sd*0.7+0.02,0.97,zr+0.55,col);B(sd*0.7-0.02,0.86,zr+0.55,sd*0.7+0.02,0.92,zr+0.8,col);}});
    w60Bumper(X,zf+0.1,0.82,0.42,1);w60Bumper(X,zr-0.08,0.82,0.42,-1);if(S.num)X.plate([0,0.56,zr-0.012],[0,0,-1],[1,0,0],0.3,0.2);
    w60Crew(X,0.33,ht?0.47:0.52,0.0,{seat2:true});M.exh=[[0.45,0.24,zr+0.05]];return {len:[zr-0.14,zf+0.16],track:t};}
  if(kind==='stream'){const wb=3.0,t=1.42,r=0.36,tw=0.15,w=0.765,zf=wb/2+0.72,zr=-wb/2-1.05;
    w60Body(X,{wb,t,r,tw,yb:0.3,st:[[zf+0.02,0.3,0.84,0.5,0.2],[zf-0.14,0.52,1.02,0.38,0.22],[zf-0.6,0.7,1.07,0.32,0.16],[0.7,w,1.08],[-1.2,w,1.04],[zr+0.6,0.7,0.96,0.32,0.2],[zr+0.12,0.5,0.76,0.38,0.2],[zr,0.34,0.62,0.44,0.18]],
      green:{zA:1.0,zB:0.55,zC:-0.7,zD:-2.3,wB:0.7,wT:0.56,yb:1.05,yt:1.6,wins:[[0.48,-0.08],[-0.16,-0.66]],rearK:0.5,rear0:0.5}});
    // «водопад»: вертикальные хромовые прутья по скруглённому носу
    for(let k=-3;k<=3;k++){const x=k*0.07,zz=zf+0.03-Math.abs(k)*0.035;tube([[x,0.52,zz],[x,0.8,zz-0.02],[x,1.0,zz-0.16]],0.012,K.bright,K.brightMat,3);}
    [-1,1].forEach(sd=>{X.headlamp(sd*0.47,0.88,zf-0.28,0.09,'bowl');X.tailLamp(sd*0.5,0.7,zr+0.22);if(hi)chrome(sd*(w+0.004)-0.006,0.66,-1.6,sd*(w+0.004)+0.006,0.69,1.5);});
    w60Bumper(X,zf+0.1,0.78,0.46,1);w60Bumper(X,zr-0.06,0.6,0.46,-1);if(S.num)X.plate([0,0.6,zr-0.012],[0,0,-1],[1,0,0],0.3,0.2);
    w60Crew(X,0.32,0.6,0.05,{seat2:true});M.exh=[[0.4,0.26,zr+0.1]];return {len:[zr-0.12,zf+0.16],track:t};}
  if(kind==='micro'||kind==='small'){const mi2=kind==='micro',wb=mi2?2.0:2.1,t=mi2?1.1:1.2,r=0.3,tw=mi2?0.12:0.13,w=t/2+tw/2-0.02,zf=wb/2+(mi2?0.55:0.65),zr=-wb/2-(mi2?0.55:0.8);
    w60Body(X,{wb,t,r,tw,yb:0.24,st:mi2?[[zf,0.34,0.62,0.36,0.14],[zf-0.15,0.5,0.76,0.3,0.14],[0.9,w,0.84],[0.3,w,0.88],[-0.9,w,0.84],[zr+0.15,0.5,0.72,0.3,0.14],[zr,0.36,0.6,0.36,0.14]]
        :[[zf,0.4,0.6,0.36,0.14],[zf-0.15,0.56,0.74,0.3],[1.0,w,0.84],[0.45,w,0.9],[-0.9,w,0.88],[zr+0.3,0.6,0.8,0.3],[zr,0.45,0.62,0.36,0.14]],
      green:mi2?{zA:0.55,zB:0.25,zC:-0.55,zD:-1.0,wB:0.54,wT:0.46,yb:0.86,yt:1.36,wins:[[0.2,-0.5]]}:{zA:0.75,zB:0.4,zC:-0.75,zD:-1.35,wB:0.6,wT:0.5,yb:0.9,yt:1.42,wins:[[0.34,-0.14],[-0.22,-0.7]]}});
    if(mi2){for(let k=-2;k<=2;k++)chrome(k*0.06-0.008,0.4,zf-0.02,k*0.06+0.008,0.6,zf+0.03);}   // узкая решётка
    else{[0.5,0.56,0.62].forEach((yy,k)=>chrome(-0.2+k*0.04,yy,zf-0.03,0.2-k*0.04,yy+0.02,zf+0.035));   // «усы» вместо решётки: мотор сзади
      if(hi)for(let k=0;k<5;k++)B(-0.3,0.8-k*0.035,zr+0.02+k*0.05,0.3,0.815-k*0.035,zr+0.06+k*0.05,'#0e0e10','paint');}
    [-1,1].forEach(sd=>{X.headlamp(sd*(mi2?0.4:0.46),mi2?0.72:0.7,zf-0.18,0.08,'bowl');X.tailLamp(sd*(w-0.12),0.62,zr+0.03);});
    w60Bumper(X,zf+0.07,w+0.03,0.38,1);w60Bumper(X,zr-0.05,w+0.03,0.38,-1);if(S.num)X.plate([0,0.5,zr-0.012],[0,0,-1],[1,0,0],0.26,0.18);
    w60Crew(X,mi2?0.24:0.28,mi2?0.38:0.44,mi2?-0.15:0.0,{seat2:true});M.exh=[[0.3,0.22,zr+0.05]];return {len:[zr-0.1,zf+0.12],track:t};}
  if(kind==='roadster'){const wb=2.6,t=1.3,r=0.34,tw=0.14,w=0.7,zf=wb/2+0.85,zr=-wb/2-0.8;
    w60Body(X,{wb,t,r,tw,yb:0.24,wheel:'wire',st:[[zf,0.28,0.56,0.36,0.14],[zf-0.16,0.5,0.72,0.3,0.14],[wb/2,w,0.8],[0.75,w,0.8],[0.42,w,0.76],[0.4,w,0.42],[-0.55,w,0.42],[-0.57,w,0.76],[-wb/2,w,0.78],[zr+0.4,0.58,0.7,0.3],[zr,0.32,0.5,0.36,0.14]]});
    // кабина: тёмный пол, два сиденья, низкое разрезное стекло
    B(-0.62,0.42,-0.54,0.62,0.432,0.39,'#17181b','paint');[-1,1].forEach(sd=>B(sd*(w-0.02)-0.02,0.42,-0.55,sd*(w-0.02)+0.02,0.68,0.4,col));X.windscreen(0.42,0.58,0.77,1.14,{lean:0.16,split:true});
    for(let k=-3;k<=3;k++)tube([[k*0.045,0.4,zf-0.04+0.0],[k*0.045,0.62,zf-0.12]],0.009,K.bright,K.brightMat,3);   // узкая овальная решётка
    [-1,1].forEach(sd=>{X.headlamp(sd*0.44,0.68,zf-0.34,0.09,'bowl');X.tailLamp(sd*0.42,0.56,zr+0.16);});
    if(S.num)X.plate([0,0.42,zr-0.012],[0,0,-1],[1,0,0],0.26,0.18);
    w60Crew(X,0.3,0.52,-0.12,{seat2:true});M.exh=[[0.4,0.22,zr+0.05]];return {len:[zr-0.06,zf+0.06],track:t};}
  if(kind==='jeep'||kind==='offroad'){const jp=kind==='jeep',wb=2.03,t=1.25,r=0.37,tw=0.16,zf=wb/2+0.52,zr=-wb/2-0.6,bw=0.64,yf=0.5,dk=shade(col,-0.35);X.setWt('disc');
    [-1,1].forEach(sd=>{X.WH(sd*t/2,r,wb/2,r,tw,false,true);X.WH(sd*t/2,r,-wb/2,r,tw,false,false);});
    B(-bw,yf,zr,bw,yf+0.1,0.42,col);                                                             // пол
    [-1,1].forEach(sd=>{B(sd*bw-0.03,yf+0.1,zr,sd*bw+0.03,jp?0.98:1.02,-0.42,col);B(sd*bw-0.03,yf+0.1,-0.42,sd*bw+0.03,jp?0.78:1.02,0.2,col);B(sd*bw-0.03,yf+0.1,0.2,sd*bw+0.03,1.0,0.44,col);
      B(sd*0.5-(sd>0?0:0.32),0.8,0.62,sd*0.5+(sd>0?0.32:0),0.84,zf+0.02,col);B(sd*0.82-0.02,0.62,zf-0.04,sd*0.82+0.02,0.84,zf+0.02,col);});   // борта и плоские крылья
    B(-bw,yf+0.1,zr-0.02,bw,jp?0.98:1.02,zr+0.04,col);B(-0.48,yf+0.08,0.44,0.48,1.0,zf-0.08,col);B(-0.48,1.0,0.44,0.48,1.03,zf-0.1,shade(col,0.08));   // задний борт, капот
    B(-0.5,yf+0.04,zf-0.08,0.5,1.02,zf-0.02,col);                                                 // лист решётки
    if(jp){for(let k=-3;k<=3;k++)B(k*0.085-0.022,0.62,zf-0.022,k*0.085+0.022,0.96,zf-0.012,'#0c0c0e','paint');[-1,1].forEach(sd=>X.headlamp(sd*0.37,0.86,zf-0.07,0.065,'bowl'));}
    else{B(-0.3,0.6,zf-0.022,0.3,0.94,zf-0.012,'#0c0c0e','paint');[-1,1].forEach(sd=>X.headlamp(sd*0.2,0.8,zf-0.05,0.06,'bowl'));}
    B(-0.72,yf-0.04,zf-0.02,0.72,yf+0.08,zf+0.06,dk);B(-0.66,yf-0.04,zr-0.08,0.66,yf+0.06,zr-0.02,dk);   // бамперы-швеллеры
    if(jp){X.windscreen(0.44,0.56,1.02,1.46,{lean:0.03,split:true});X.spare(0,0.92,zr-0.1,0.34,0.15,'z');if(hi)B(0.34,0.62,zr-0.2,0.52,0.98,zr-0.06,dk);}   // запаска и канистра сзади
    else{X.cabin(0.44,zr+0.02,bw+0.01,1.02,1.76,{wins:[[0.34,-0.36],[-0.5,zr+0.2]],roofCol:'#d9d5c6'});X.spare(0,1.0,zr-0.1,0.33,0.14,'z');}
    X.seat(0.3,-0.1,yf+0.3,0.22,0.4,0.36,{col:dk});X.seat(-0.3,-0.1,yf+0.3,0.22,0.4,0.36,{col:dk});X.steer(0.3,yf+0.66,0.3,0.18,0.8);X.drvF(0.3,yf+0.27,-0.1,0.3,yf+0.66);X.eyeAt(0.3,yf+0.27,-0.1);
    if(S.num)X.plate([-0.4,0.72,zr-0.03],[0,0,-1],[1,0,0],0.24,0.16);
    X.tailLamp(0.52,0.78,zr-0.02);M.exh=[[0.4,0.3,zr]];return {len:[zr-(jp?0.3:0.1),zf+0.08],track:t};}
  if(kind==='minibus'){const wb=2.4,t=1.37,r=0.33,tw=0.15,w=0.84,zf=wb/2+0.85,zr=-wb/2-0.95,top=shade(col,0.6);
    w60Body(X,{wb,t,r,tw,yb:0.3,tumble:0.97,st:[[zf,0.56,1.1,0.52,0.3],[zf-0.1,0.78,1.14,0.36,0.14],[zf-0.3,w,1.16,0.3,0.06],[zr+0.2,w,1.16,0.3,0.06],[zr,0.76,1.12,0.36,0.14]]});
    // верх другого тона: от пояса до крыши, со скруглённым лбом
    const U=(z,ww,yt,rt)=>({z,p:rsec(ww,ww*0.9,1.13,yt,0.02,rt,n,'o')}),T=[U(zf-0.08,0.72,1.74,0.2),U(zf-0.32,w-0.02,1.9,0.22),U(zr+0.3,w-0.01,1.92,0.2),U(zr+0.02,0.74,1.84,0.2)];
    mLoft2(M,T,top,'paint',{wrap:true});mCap(M,T[0],top,'paint',1);mCap(M,T[3],top,'paint',-1);
    const ya=1.24,yb2=1.62,za0=zr+0.35,L=zf-0.75-za0;for(let k=0;k<5;k++){const za=za0+L*k/5+0.04,zb=za0+L*(k+1)/5-0.04;[-1,1].forEach(sd=>B(sd*(w+0.0)-0.008,ya,za,sd*(w+0.0)+0.008,yb2,zb,'#1e2a33','glass'));}
    [-1,1].forEach(sd=>{mFace(M,[[sd*0.05,1.24,zf-0.072],[sd*0.62,1.24,zf-0.072],[sd*0.6,1.6,zf-0.072],[sd*0.05,1.6,zf-0.072]],'#1e2a33','glass',[0,1.4,zf-1.5]);   // разрезное лобовое
      X.headlamp(sd*0.52,0.82,zf-0.1,0.09,'bowl');X.tailLamp(sd*0.6,0.7,zr+0.02);tube([[0,1.08,zf+0.012],[sd*0.6,1.1,zf-0.12],[sd*0.78,1.12,zf-0.28]],0.012,K.bright,K.brightMat,3);tube([[0,0.6,zf+0.03],[sd*0.3,0.9,zf+0.0],[sd*0.6,1.1,zf-0.12]],0.012,K.bright,K.brightMat,3);});
    mLathe(M,[0,0.86,zf+0.02],'z',[[0.11,0],[0.1,0.012],[0,0.02]],hi?14:8,K.bright,K.brightMat);B(-0.5,1.3,zr-0.004,0.5,1.6,zr+0.012,'#1e2a33','glass');
    w60Bumper(X,zf+0.06,0.84,0.44,1);w60Bumper(X,zr-0.05,0.84,0.44,-1);if(S.num)X.plate([0,0.62,zr-0.012],[0,0,-1],[1,0,0],0.28,0.18);
    X.steer(0.36,1.12,zf-0.5,0.2,0.4);X.drvF(0.36,0.72,zf-0.95,zf-0.5,1.12);X.eyeAt(0.36,0.72,zf-0.95);M.exh=[[0.4,0.26,zr+0.02]];return {len:[zr-0.1,zf+0.12],track:t};}
  if(kind==='mtank'){// средний танк: шесть катков на борт, ленивец спереди, ведущее колесо сзади, полки над гусеницами
    const xT=1.12,wT=0.5,zi=2.55,yi=0.72,ri=0.34,zs=-2.5,ysp=0.74,rs=0.36,loop=wkLoop(zi,yi,ri,zs,ysp,rs,-1.95,1.95,0.14),dk=shade(col,-0.3);
    [-1,1].forEach(sd=>{wkTrack(X,sd*xT,wT,loop,{frame:dk,th:0.07});wkDisc(X,sd*xT,yi,zi,ri-0.05,wT*0.4,'#4a4d52',8);wkDisc(X,sd*xT,ysp,zs,rs-0.05,wT*0.4,'#4a4d52',10);
      [-1.75,-1.05,-0.35,0.35,1.05,1.75].forEach(z=>{mLathe(M,[sd*(xT+wT*0.3),0.36,z],'x',[[0.33,0],[0.3,0.03*sd],[0,0.05*sd]],hi?12:8,dk,'paint',{two:true});});
      B(sd*xT-wT*0.6,1.12,zs-0.2,sd*xT+wT*0.6,1.16,zi+0.2,col);});                                  // надгусеничные полки
    const P=(z,w,yb,yt,twd)=>({z,p:rsec(w,twd===undefined?w*0.9:twd,yb,yt,0.02,0.05,n,'o')});
    const H=[P(2.95,0.84,0.62,0.98),P(2.45,0.86,0.42,1.3,0.8),P(1.5,0.86,0.4,1.55,0.74),P(-1.6,0.86,0.4,1.55,0.74),P(-2.55,0.86,0.44,1.32,0.8),P(-2.95,0.82,0.62,1.05)];mLoft2(M,H,col,'paint',{wrap:true});mCap(M,H[0],col,'paint',1);mCap(M,H[5],col,'paint',-1);
    // башня: гранёная, сдвинута вперёд; маска, длинная пушка, командирская башенка
    const tz=0.35,ty=1.55;mLathe(M,[0,ty,tz],'y',[[0.82,0],[0.86,0.12],[0.8,0.5],[0.62,0.62],[0,0.66]],hi?12:8,col,'paint');
    mRBox(M,-0.28,ty+0.14,tz+0.66,0.28,ty+0.5,tz+0.98,0.05,shade(col,-0.12),'paint');tube([[0,ty+0.32,tz+0.9],[0,ty+0.32,tz+3.15]],0.05,'#2a2b2e','metal',hi?8:5);
    mLathe(M,[0,ty+0.32,tz+3.15],'z',[[0.07,-0.16],[0.07,0],[0,0.01]],8,'#2a2b2e','metal');
    mLathe(M,[-0.3,ty+0.62,tz-0.25],'y',[[0.22,0],[0.22,0.16],[0.16,0.2],[0,0.21]],hi?10:6,shade(col,-0.1),'paint');
    if(hi){mLathe(M,[0.45,1.0,2.6],'z',[[0.05,0],[0.05,0.3],[0,0.31]],6,'#2a2b2e','metal');                 // курсовой пулемёт
      [-1,1].forEach(sd=>{mLathe(M,[sd*0.62,1.5,-2.4],'z',[[0,-0.3],[0.08,-0.28],[0.08,0.3],[0,0.32]],8,'#3a2e28','paint');B(sd*0.6-0.2,1.56,1.9,sd*0.6+0.2,1.6,2.3,dk);});}
    X.eyeAt(0,1.6,1.4);M.exh=[[0.62,1.5,-2.72]];return {len:[-3.0,tz+3.2],track:xT*2+wT};}
  return null;}
