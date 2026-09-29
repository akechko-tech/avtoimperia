/* ================= ПРИМЕТЫ МЕСТ: церкви по странам, избы, мельницы, версты — и знаменитые виды у исторических трасс ================= */
// Модели в метрах, фасад — на +x (к дороге), ось здания — вдоль z (вдоль дороги). Большие виды (Эйфелева башня, Кремль) ставятся вдали от дороги.
MATS.stone={a:0.6,d:0.5,s:0.04,p:5,k:'stone'};
// Перенести часть модели: строим в отдельной сетке и сдвигаем вместе с отделкой
function mSub(M,dx,dy,dz,build){const S=new Mesh();build(S);const sh=q=>[q[0]+dx,q[1]+dy,q[2]+dz];
  S.F.forEach(f=>{f.p=f.p.map(sh);if(f.deco)f.deco.forEach(d=>{['a','b','dot'].forEach(k=>{if(d[k])d[k]=sh(d[k]);});if(d.poly)d.poly=d.poly.map(sh);if(d.at)d.at=d.at.map(sh);if(d.ring)d.ring=[d.ring[0]+dx,d.ring[1]+dy,d.ring[2]+dz,d.ring[3]];});M.F.push(f);});return S;}
// Луковичная глава, барабан, крест, шатёр
function bOnion(M,x,y,z,r,h,col,mat){mLathe(M,[x,y,z],'y',[[r*0.82,0],[r*1.02,h*0.16],[r*1.1,h*0.32],[r*0.96,h*0.5],[r*0.62,h*0.68],[r*0.28,h*0.84],[r*0.1,h*0.94],[0,h]],12,col,mat||'metal');}
function bDrum(M,x,y,z,r,h,col,seg){mLathe(M,[x,y,z],'y',[[r,0],[r,h],[r*1.1,h],[r*1.1,h+0.22],[0,h+0.22]],seg||12,col,'wall');}
function bCross(M,x,y,z,s,col){col=col||'#d8b85a';const w=s*0.05;mBox(M,x-w,y,z-w,x+w,y+s,z+w,col,'metal');mBox(M,x-w,y+s*0.62,z-s*0.28,x+w,y+s*0.62+w*2,z+s*0.28,col,'metal');mBox(M,x-w,y+s*0.82,z-s*0.14,x+w,y+s*0.82+w*2,z+s*0.14,col,'metal');
  mFace(M,[[x,y+s*0.3,z-s*0.2],[x,y+s*0.3+w*2,z-s*0.2],[x,y+s*0.4+w*2,z+s*0.2],[x,y+s*0.4,z+s*0.2]],col,'metal',null,true);}
function bTent(M,x,y,z,r,h,col,sides,a0){mLathe(M,[x,y,z],'y',[[r,0],[r*0.12,h*0.92],[0,h]],sides||8,col,'roof',a0===undefined?{}:{a0,a1:a0+Math.PI*2});}
// Двускатная крыша над прямоугольником x0..x1 (скаты — к ±x), z0..z1
function bGable(M,x0,x1,z0,z1,y,h,col,wall,ov){ov=ov===undefined?0.3:ov;const xm=(x0+x1)/2,X0=x0-ov,X1=x1+ov,Z0=z0-ov*0.5,Z1=z1+ov*0.5,yE=y-ov*h/((x1-x0)/2);
  const s1=mFace(M,[[X0,yE,Z0],[xm,y+h,Z0],[xm,y+h,Z1],[X0,yE,Z1]],col,'roof',[xm,y,(z0+z1)/2]),s2=mFace(M,[[X1,yE,Z0],[xm,y+h,Z0],[xm,y+h,Z1],[X1,yE,Z1]],col,'roof',[xm,y,(z0+z1)/2]);
  [z0,z1].forEach(zz=>mFace(M,[[x0,y,zz],[x1,y,zz],[xm,y+h,zz]],wall,'wall',[xm,y,(z0+z1)/2]));return [s1,s2];}
// Шатровая (четырёхскатная) крыша над прямоугольником
function bHip(M,x0,x1,z0,z1,y,h,col,ov){ov=ov||0.3;const X0=x0-ov,X1=x1+ov,Z0=z0-ov,Z1=z1+ov,c=[(x0+x1)/2,y+h,(z0+z1)/2],ctr=[c[0],y,c[2]];
  [[[X0,y,Z0],[X1,y,Z0]],[[X1,y,Z0],[X1,y,Z1]],[[X1,y,Z1],[X0,y,Z1]],[[X0,y,Z1],[X0,y,Z0]]].forEach(([a,b])=>mFace(M,[a,b,c],col,'roof',ctr));}
// Зубцы по верху стены вдоль z (у Кремля — «ласточкин хвост»)
function bMerlons(M,x0,x1,z0,z1,y,h,col,swallow){const n=Math.max(1,Math.round((z1-z0)/1.6));for(let k=0;k<n;k++){const a=z0+(k+0.18)*(z1-z0)/n,b=z0+(k+0.82)*(z1-z0)/n;
  if(swallow){const m=(a+b)/2;mBox(M,x0,y,a,x1,y+h*0.6,b,col,'stone',['d']);mBox(M,x0,y+h*0.6,a,x1,y+h,m-0.12,col,'stone',['d']);mBox(M,x0,y+h*0.6,m+0.12,x1,y+h,b,col,'stone',['d']);}
  else mBox(M,x0,y,a,x1,y+h,b,col,'stone',['d']);}}
// Арочные проёмы на грани (тёмные): P(u,v) — точка грани
function bArches(f,P,us,v,w,h,c){f.deco=f.deco||[];us.forEach(u=>{const g=[];for(let k=0;k<=8;k++){const a=Math.PI*k/8;g.push(P(u+Math.cos(a)*w/2,v+h+Math.sin(a)*w/2));}f.deco.push({poly:[P(u-w/2,v),P(u+w/2,v)].concat(g),c:c||'#1e1d22'});});}
// Колонна: база, ствол, капитель
function bColumn(M,x,y,z,r,h,col,mat){mBox(M,x-r*1.25,y,z-r*1.25,x+r*1.25,y+r*0.6,z+r*1.25,col,mat||'stone',['d']);mLathe(M,[x,y+r*0.6,z],'y',[[r,0],[r*0.86,h-r*1.2]],10,col,mat||'stone');mBox(M,x-r*1.2,y+h-r*0.6,z-r*1.2,x+r*1.2,y+h,z+r*1.2,col,mat||'stone',['d']);}
Object.assign(BLD,{
  // Русская церковь: четверик с барабаном и луковицей (или пятиглавие), апсида, трапезная, колокольня с шатром
  church_ru:(r,v)=>{const M=new Mesh(),V=v%3,wc=['#f3efe6','#efe2b6','#f1ece2'][V],tr='#ffffff',dc=['#c9a24a','#3f7a52','#34569a'][V],rf=['#4f7a5a','#4f7a5a','#6a5042'][V],dm=V===0?'metal':'paint',gl='#2c313a';
    const D=8,L=8,H=9,z0=1;const C=mBox(M,-D/2,0,z0-L/2,D/2,H,z0+L/2,wc,'wall',['d']),Pc=(u,y)=>[D/2+0.012,y,z0+u];
    [-2.2,2.2].forEach(u=>{wWin(C.r,Pc,u,1.8,1.0,2.1,{arch:1,frame:tr,glass:gl,sill:tr});wWin(C.r,Pc,u,5.7,0.8,1.3,{arch:1,frame:tr,glass:gl,sill:tr});});
    (C.r.deco=C.r.deco||[]).push({a:Pc(-L/2,H-0.25),b:Pc(L/2,H-0.25),w:0.4,c:tr});[-L/2+0.25,0,L/2-0.25].forEach(u=>(C.r.deco=C.r.deco||[]).push({a:Pc(u,0.05),b:Pc(u,H-0.45),w:0.45,c:tr}));
    bHip(M,-D/2,D/2,z0-L/2,z0+L/2,H,1.5,rf,0.35);
    bDrum(M,0,H+0.6,z0,1.5,3.1,wc);bOnion(M,0,H+3.9,z0,1.75,4.1,dc,dm);bCross(M,0,H+7.9,z0,1.9);
    if(V!==2)[[-2.5,-2.5],[2.5,-2.5],[-2.5,2.5],[2.5,2.5]].forEach(([x,z])=>{bDrum(M,x,H+0.3,z0+z,0.72,1.7,wc,10);bOnion(M,x,H+2.2,z0+z,0.84,2.1,dc,dm);bCross(M,x,H+4.3,z0+z,1.0);});
    mLathe(M,[0,0,z0+L/2],'y',[[3.1,0],[3.1,6.4]],10,wc,'wall',{a0:0,a1:Math.PI});mLathe(M,[0,6.4,z0+L/2],'y',[[3.35,0],[0,1.5]],10,rf,'roof',{a0:0,a1:Math.PI});
    // трапезная
    const t0=z0-L/2-5.2,t1=z0-L/2;const Tq=mBox(M,-3.4,0,t0,3.4,5.2,t1,wc,'wall',['d']),Pt=(u,y)=>[3.412,y,u];[t0+1.5,t0+3.7].forEach(u=>wWin(Tq.r,Pt,u,1.6,0.9,1.8,{arch:1,frame:tr,glass:gl,sill:tr}));
    (Tq.r.deco=Tq.r.deco||[]).push({a:Pt(t0,5.0),b:Pt(t1,5.0),w:0.3,c:tr});bGable(M,-3.4,3.4,t0,t1,5.2,1.9,rf,wc,0.35);
    // колокольня: четверик, звон с арками, шатёр с маковкой
    const bz=t0-1.8;const B1=mBox(M,-1.8,0,bz-1.8,1.8,8.4,bz+1.8,wc,'wall',['d']);wDoor(B1.b,(u,y)=>[u,y,bz-1.812],0,1.4,2.6,'#5a3f2a',{arch:1,frame:tr});wWin(B1.r,(u,y)=>[1.812,y,bz+u],0,4.6,0.7,1.3,{arch:1,frame:tr,glass:gl});
    (B1.r.deco=B1.r.deco||[]).push({a:[1.812,8.2,bz-1.8],b:[1.812,8.2,bz+1.8],w:0.35,c:tr});
    const B2=mBox(M,-1.55,8.4,bz-1.55,1.55,12.2,bz+1.55,wc,'wall',['d']);bArches(B2.r,(u,y)=>[1.562,y,bz+u],[-0.62,0.62],9.0,0.8,1.9);bArches(B2.b,(u,y)=>[u,y,bz-1.562],[-0.62,0.62],9.0,0.8,1.9);bArches(B2.l,(u,y)=>[-1.562,y,bz+u],[-0.62,0.62],9.0,0.8,1.9);bArches(B2.f,(u,y)=>[u,y,bz+1.562],[-0.62,0.62],9.0,0.8,1.9);
    bTent(M,0,12.2,bz,2.0,6.6,rf,8);bDrum(M,0,18.3,bz,0.28,0.5,wc,8);bOnion(M,0,18.9,bz,0.45,1.2,dc,dm);bCross(M,0,20.1,bz,1.1);
    M.foot=[-D/2-0.4,D/2+0.8,bz-2.2,z0+L/2+3.4];return M;},
  // Изба: сруб, резные наличники с «кокошниками», ставни, причелины и «полотенце» на фронтоне, светёлка, крыльцо
  izba:(r,v)=>{const M=new Mesh(),V=v%3,D=6,L=7,H=3.5,wc=['#8a6a44','#7a5c3c','#94744c'][V],tr=['#f1ece0','#9fc0e0','#e8d9a0'][V],sh=['#3a6a9a','#4f7a5a','#9a3a2a'][V],roof=['#7a7266','#a8905c','#6f675c'][V];
    const W=bWalls(M,D,L,H,wc);
    [W.r,W.b].forEach((f,i)=>{f.deco=f.deco||[];const P=i?END(L):FAC(D),u0=i?-D/2:-L/2,u1=-u0;for(let y=0.18;y<H;y+=0.34){f.deco.push({a:P(u0,y),b:P(u1,y),w:0.28,c:shade(wc,((y*7|0)%3-1)*0.06)});f.deco.push({a:P(u0,y+0.15),b:P(u1,y+0.15),w:0.035,c:'#3e2c1a'});}
      // торцы брёвен по углам
      [u0+0.05,u1-0.05].forEach(u=>{for(let y=0.18;y<H;y+=0.34)f.deco.push({dot:P(u,y),r:0.15,c:'#b08a5c'});});});
    const nal=(f,P,u,y)=>{wWin(f,P,u,y,0.7,0.95,{frame:tr,shut:sh,sill:tr});f.deco.push({poly:[P(u-0.62,y+1.02),P(u+0.62,y+1.02),P(u+0.45,y+1.22),P(u,y+1.42),P(u-0.45,y+1.22)],c:tr},{poly:[P(u-0.5,y-0.15),P(u+0.5,y-0.15),P(u,y-0.42)],c:tr});};
    [-2.5,-0.6].forEach(u=>nal(W.r,FAC(D),u,1.05));wDoor(W.r,FAC(D),2.45,0.9,1.95,shade(wc,-0.2),{frame:tr});nal(W.b,END(L),-1.2,1.05);nal(W.b,END(L),1.2,1.05);
    bRoof(M,D,L,H,2.7,0.5,roof,wc,{rows:12,mat:V===1?'matte':'roof',gdeco:(g,s)=>{const z=s*L/2+s*0.03;g.deco=[{a:[-D/2-0.3,H-0.15,z],b:[0,H+2.72,z],w:0.34,c:tr},{a:[D/2+0.3,H-0.15,z],b:[0,H+2.72,z],w:0.34,c:tr},{poly:[[-0.14,H+2.6,z],[0.14,H+2.6,z],[0.14,H+0.9,z],[0,H+0.7,z],[-0.14,H+0.9,z]],c:tr},
      {poly:[[-0.45,H+0.55,z],[0.45,H+0.55,z],[0.45,H+1.45,z],[-0.45,H+1.45,z]],c:'#2c313a',gl:1},{poly:[[-0.6,H+1.45,z],[0.6,H+1.45,z],[0,H+1.85,z]],c:tr}];}});
    // крыльцо со ступенями у фасада
    mBox(M,D/2,0,1.8,D/2+1.3,0.7,3.1,shade(wc,0.1),'wood',['d']);mBox(M,D/2+1.3,0,1.9,D/2+1.8,0.35,3.0,shade(wc,0.1),'wood',['d']);[1.85,3.05].forEach(z=>mBox(M,D/2+1.2,0.7,z-0.06,D/2+1.3,2.5,z+0.06,wc,'wood'));
    mFace(M,[[D/2-0.1,2.6,1.6],[D/2+1.5,2.2,1.6],[D/2+1.5,2.2,3.3],[D/2-0.1,2.6,3.3]],roof,'roof',[D/2,0,2.4],true);
    M.foot=[-D/2-0.3,D/2+2.0,-L/2-0.4,L/2+0.4];return M;},
  // Ветряная мельница-столбовка: козлы, амбарчик на столбе, четыре решётчатых крыла, «хвост» для поворота
  mill_ru:(r,v)=>{const M=new Mesh(),wc='#7a5a3a',dk='#5a4630';
    [[-1.7,-1.7],[1.7,-1.7],[1.7,1.7],[-1.7,1.7]].forEach(([x,z])=>mTube(M,[[x,0,z],[x*0.15,2.6,z*0.15]],0.12,5,dk,'wood'));mTube(M,[[0,0,0],[0,3.4,0]],0.26,6,dk,'wood');
    const B=mBox(M,-1.6,3.2,-1.9,1.6,7.2,1.9,wc,'wood',[]);[B.r,B.l,B.f,B.b].forEach(f=>{f.deco=[];const pts=f.p;for(let k=1;k<10;k++){const t=k/10,y=3.2+4*t;const a=pts[0],b=pts[1];f.deco.push({a:[a[0],y,a[2]],b:[b[0],y,b[2]],w:0.03,c:'#4a3622'});}});
    bGable(M,-1.6,1.6,-1.9,1.9,7.2,1.8,'#6a6258',wc,0.25);
    const hub=[1.75,6.6,0];mTube(M,[[0.8,6.6,0],hub],0.16,6,dk,'wood');const R=5.8;
    for(let k=0;k<4;k++){const a=0.35+k*Math.PI/2,ca=Math.cos(a),sa=Math.sin(a),P=(d,w)=>[hub[0]+0.05,hub[1]+sa*d+ca*w,hub[2]+ca*d-sa*w];
      mFace(M,[P(0,-0.12),P(R,-0.08),P(R,0.08),P(0,0.12)],dk,'wood',[0,6.6,0],true);
      const f=mFace(M,[P(1.1,0.1),P(R,0.1),P(R,1.35),P(1.1,1.35)],'#c8b48c','cloth',[0,6.6,0],true);f.deco=[];for(let d=1.1;d<=R;d+=0.6)f.deco.push({a:P(d,0.1),b:P(d,1.35),w:0.05,c:dk});f.deco.push({a:P(1.1,0.72),b:P(R,0.72),w:0.05,c:dk});}
    mTube(M,[[-1.6,4.2,0],[-5.2,0.6,0]],0.1,5,dk,'wood');mTube(M,[[-1.6,6.4,0],[-3.4,2.6,0]],0.07,4,dk,'wood');
    M.foot=[-5,2.2,-2.2,2.2];return M;},
  // Московские Триумфальные ворота (Петербург, 1838): двенадцать чугунных колонн, аттик с трофеями — дорога проходит насквозь
  gate_spb:(r,v)=>{const M=new Mesh(),c='#40483f',c2='#586255',gold='#c9a24a',H=15.5;
    [6.6,11,15.4].forEach(x=>[-1,1].forEach(sx=>[-2.3,2.3].forEach(z=>{bColumn(M,sx*x,0,z,0.82,H,c,'metal');})));
    const E=mBox(M,-17.6,H,-3.5,17.6,H+2.1,3.5,c2,'metal',['d']);const F2=mBox(M,-17.8,H+2.1,-3.7,17.8,H+3.4,3.7,c,'metal',['d']);
    [E.f,E.b].forEach((f,i)=>{const s=i?-1:1,z=s*(3.5+0.013);f.deco=[{a:[-17.4,H+1.05,z],b:[17.4,H+1.05,z],w:1.5,c:'#343b33'},{text:'ПОБѢДОНОСНЫМЪ РОССIЙСКИМЪ ВОЙСКАМЪ',at:s>0?[[15.5,H+0.45,z],[-15.5,H+0.45,z],[15.5,H+1.65,z]]:[[-15.5,H+0.45,z],[15.5,H+0.45,z],[-15.5,H+1.65,z]],w:31,h:1.2,c:gold,font:'bold 0.95px serif'}];});
    const A=mBox(M,-12,H+3.4,-3,12,H+6.2,3,c2,'metal',['d']);
    // трофеи: доспехи и знамёна на аттике
    [-9,0,9].forEach(x=>{mSphere(M,x,H+7.1,0,1.1,gold,'metal',1.2);mBox(M,x-0.9,H+6.2,-0.9,x+0.9,H+6.6,0.9,c,'metal');[-1,1].forEach(s=>mFace(M,[[x+s*0.4,H+6.4,0],[x+s*2.2,H+9.4,0.1],[x+s*1.7,H+9.9,0.1],[x+s*0.2,H+7.2,0]],c2,'metal',null,true));});
    M.foot=[-18,18,-4,4];return M;},
  // Кремлёвская башня (как Спасская) и прясла стены с «ласточкиными хвостами»
  kremlin:(r,v)=>{const M=new Mesh(),br='#a8412f',wh='#ece4d2',gr='#3f5f4a',gold='#c9a24a';
    const T1=mBox(M,-5,0,-5,5,20,5,br,'wall',['d']),P1=(u,y)=>[5.013,y,u];bArches(T1.r,P1,[0],0,3.6,4.2,'#2a1d18');(T1.r.deco=T1.r.deco||[]).push({a:P1(-5,19.6),b:P1(5,19.6),w:0.8,c:wh},{a:P1(-5,12),b:P1(5,12),w:0.4,c:wh});
    [[-3.2,14],[3.2,14]].forEach(([u,y])=>wWin(T1.r,P1,u,y,0.8,1.8,{arch:1,frame:wh,glass:'#2a2a30'}));
    [-4.6,4.6].forEach(x=>[-4.6,4.6].forEach(z=>{mBox(M,x-0.35,20,z-0.35,x+0.35,22.6,z+0.35,wh,'stone',['d']);bTent(M,x,22.6,z,0.5,1.8,gold,4);}));
    const T2=mBox(M,-3.8,20,-3.8,3.8,27.5,3.8,br,'wall',['d']),P2=(u,y)=>[3.813,y,u];(T2.r.deco=T2.r.deco||[]).push({dot:P2(0,24),r:2.2,c:'#1d2a4a'},{ring:[3.82,24,0,2.25],w:0.25,c:gold},{a:P2(0,24),b:P2(0,25.6),w:0.18,c:gold},{a:P2(0,24),b:P2(1.1,24.4),w:0.18,c:gold});
    [T2.b,T2.f].forEach((f,i)=>{const z=(i?1:-1)*3.813;f.deco=f.deco||[];f.deco.push({dot:[0,24,z],r:2.2,c:'#1d2a4a'},{ring:[0,24,z,2.25],ax:'z',w:0.25,c:gold});});
    mLathe(M,[0,27.5,0],'y',[[3.6,0],[3.6,4.2],[3.9,4.2],[3.9,4.6],[0,4.6]],8,wh,'wall');
    bTent(M,0,32.1,0,3.7,13,gr,8);mSphere(M,0,45.6,0,0.6,gold,'metal');[-1,1].forEach(s=>mFace(M,[[0,46.2,0],[s*1.3,47.6,0.05],[s*0.9,48.1,0.05],[0,46.9,0]],gold,'metal',null,true));mBox(M,-0.1,46.2,-0.1,0.1,48.4,0.1,gold,'metal');
    // стена в обе стороны
    [-1,1].forEach(s=>{const z0=s>0?5:-35,z1=s>0?35:-5;mBox(M,-1.8,0,z0,1.8,11,z1,br,'wall',['d']);bMerlons(M,-1.8,-1.2,z0,z1,11,2.6,br,true);bMerlons(M,1.2,1.8,z0,z1,11,2.6,br,true);});
    M.foot=[-6,6,-36,36];return M;},
  // Эйфелева башня: четыре опоры с арками, три платформы, решётка
  eiffel:(r,v)=>{const M=new Mesh(),c='#7a5f40',dk='#5e4630',lat=(f,n)=>{f.deco=[];const p=f.p;for(let k=0;k<n;k++){const t0=k/n,t1=(k+1)/n,L=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
        const a0=L(p[0],p[3],t0),b0=L(p[1],p[2],t0),a1=L(p[0],p[3],t1),b1=L(p[1],p[2],t1);f.deco.push({a:a0,b:b1,w:0.5,c:dk},{a:b0,b:a1,w:0.5,c:dk},{a:a0,b:b0,w:0.6,c:dk});}};
    const frust=(y0,s0,y1,s1,n,c0,c1)=>{c0=c0||[0,0];c1=c1||c0;const q=(y,s,cc)=>[[cc[0]-s,y,cc[1]-s],[cc[0]+s,y,cc[1]-s],[cc[0]+s,y,cc[1]+s],[cc[0]-s,y,cc[1]+s]],A=q(y0,s0,c0),B=q(y1,s1,c1);
      for(let k=0;k<4;k++){const f=mFace(M,[A[k],A[(k+1)%4],B[(k+1)%4],B[k]],c,'metal',[(c0[0]+c1[0])/2,(y0+y1)/2,(c0[1]+c1[1])/2],true);lat(f,n);}};
    [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx,sz])=>{frust(0,8,30,6.5,5,[sx*56,sz*56],[sx*45,sz*45]);frust(30,6.5,57,5,5,[sx*45,sz*45],[sx*34,sz*34]);});
    [[0,-1],[1,0],[0,1],[-1,0]].forEach(([ax,az])=>{const P=[];for(let k=0;k<=12;k++){const a=Math.PI*k/12,u=-Math.cos(a)*43,y=18+Math.sin(a)*21;P.push(ax?[ax*44,y,u]:[u,y,az*44]);}mTube(M,P,1.1,4,c,'metal');});
    mBox(M,-37,54,-37,37,58,37,c,'metal',[]);mBox(M,-37.5,58,-37.5,37.5,60.5,37.5,dk,'metal',['d']);
    frust(58,27,115,15,7);mBox(M,-17,113,-17,17,117,17,c,'metal',[]);frust(117,11,200,6.5,8);frust(200,6.5,272,3.4,7);
    mBox(M,-4.5,272,-4.5,4.5,277,4.5,c,'metal',[]);mLathe(M,[0,277,0],'y',[[3.6,0],[3.2,4],[1.2,6.5],[0.35,9],[0.3,20]],8,c,'metal');
    M.foot=[-60,60,-60,60];return M;},
  // Биг-Бен: часовая башня Вестминстера
  bigben:(r,v)=>{const M=new Mesh(),st='#c8b184',dk='#8f7c5a',sl='#3d4450',gold='#c9a24a';const w=6;
    const S=mBox(M,-w,0,-w,w,56,w,st,'stone',['d']);[S.r,S.l,S.f,S.b].forEach(f=>{f.deco=[];const p=f.p,L=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
      for(let k=1;k<6;k++){const t=k/6;f.deco.push({a:L(p[0],p[1],t),b:L(p[3],p[2],t),w:0.3,c:dk});}for(let y=8;y<56;y+=8)f.deco.push({a:[p[0][0],y,p[0][2]],b:[p[1][0],y,p[1][2]],w:0.35,c:dk});});
    const C=mBox(M,-w-0.6,56,-w-0.6,w+0.6,72,w+0.6,st,'stone',['d']);[['r',[w+0.613,64,0],'x'],['l',[-w-0.613,64,0],'x'],['f',[0,64,w+0.613],'z'],['b',[0,64,-w-0.613],'z']].forEach(([k,c,ax])=>{const f=C[k];f.deco=[{dot:c,r:3.4,c:gold},{dot:c,r:3.0,c:'#f1ece0'},{ring:[c[0],c[1],c[2],3.1],ax,w:0.3,c:'#222'}];
      const n=f.n,up=[0,1,0],u2=v3x(n,up);f.deco.push({a:c,b:[c[0],c[1]+2.4,c[2]],w:0.22,c:'#1a1a1a'},{a:c,b:[c[0]+u2[0]*1.6,c[1]-0.6,c[2]+u2[2]*1.6],w:0.26,c:'#1a1a1a'});});
    const B=mBox(M,-w+0.2,72,-w+0.2,w-0.2,80,w-0.2,st,'stone',['d']);[['r',(u,y)=>[w-0.187,y,u]],['l',(u,y)=>[-w+0.187,y,-u]],['f',(u,y)=>[-u,y,w-0.187]],['b',(u,y)=>[u,y,-w+0.187]]].forEach(([k,P])=>bArches(B[k],P,[-3,0,3],73.2,1.6,4.2));
    mLathe(M,[0,80,0],'y',[[8.4,0],[5.8,9],[2.8,15],[0.25,20]],4,sl,'roof',{a0:Math.PI/4,a1:Math.PI/4+Math.PI*2});
    [[-w,-w],[w,-w],[w,w],[-w,w]].forEach(([x,z])=>{mBox(M,x-0.5,56,z-0.5,x+0.5,82,z+0.5,st,'stone',['d']);bTent(M,x,82,z,0.7,4,sl,4);});
    mBox(M,-0.12,100,-0.12,0.12,103,0.12,gold,'metal');M.foot=[-8,8,-8,8];return M;},
  // Замок на холме: бергфрид, стена с зубцами, палас с крутой крышей
  castle:(r,v)=>{const M=new Mesh(),st='#8e887b',st2='#7a756a',rf='#5a5048';
    mLathe(M,[0,0,0],'y',[[5.2,0],[5,26],[5.6,26],[5.6,28],[0,28]],12,st,'stone');for(let k=0;k<10;k++){const a=k/10*Math.PI*2;mBox(M,Math.cos(a)*5.1-0.5,28,Math.sin(a)*5.1-0.5,Math.cos(a)*5.1+0.5,29.3,Math.sin(a)*5.1+0.5,st,'stone',['d']);}
    if(v%2)bTent(M,0,28,0,5.4,7,rf,12);
    const R=17;for(let k=0;k<8;k++){const a0=k/8*Math.PI*2,a1=(k+1)/8*Math.PI*2,p0=[Math.cos(a0)*R,Math.sin(a0)*R],p1=[Math.cos(a1)*R,Math.sin(a1)*R],h=k===3?3.5:8.5;
      const f=mFace(M,[[p0[0],0,p0[1]],[p1[0],0,p1[1]],[p1[0],h,p1[1]],[p0[0],h,p0[1]]],st2,'stone',[0,4,0],true);mFace(M,[[p0[0],h,p0[1]],[p1[0],h,p1[1]],[p1[0]*0.9,h,p1[1]*0.9],[p0[0]*0.9,h,p0[1]*0.9]],st2,'stone',[0,0,0]);
      if(h>5)for(let q=0;q<4;q++){const t=(q+0.3)/4,x=p0[0]+(p1[0]-p0[0])*t,z=p0[1]+(p1[1]-p0[1])*t;mBox(M,x-0.55,h,z-0.55,x+0.55,h+1.2,z+0.55,st2,'stone',['d']);}}
    mSub(M,-8,0,6,S=>{const W=mBox(S,-3.5,0,-6,3.5,11,6,'#b8ad98','wall',['d']);[-3,0,3].forEach(u=>wWin(W.r,(uu,y)=>[3.512,y,uu],u,6,0.9,1.8,{arch:1,glass:'#2a2a30'}));bGable(S,-3.5,3.5,-6,6,11,6,rf,'#b8ad98',0.3);});
    M.foot=[-18,18,-18,18];return M;},
  // «Пагода» Индианаполиса (1913): четыре яруса с загнутыми крышами, флагшток
  pagoda:(r,v)=>{const M=new Mesh(),wc='#f1ece2',rf='#3f5a44',tr='#c9a24a';let y=0;
    [[7,5.2],[5.8,3.6],[4.6,3.3],[3.4,3]].forEach(([s,h],k)=>{const W=mBox(M,-s,y,-s,s,y+h,s,wc,'wood',['d']);[W.r,W.b].forEach((f,i)=>{f.deco=f.deco||[];const P=i?(u,yy)=>[u,yy,-s-0.012]:(u,yy)=>[s+0.012,yy,u];for(let u=-s+1;u<s-0.5;u+=1.6)f.deco.push({poly:[P(u,y+h*0.3),P(u+0.9,y+h*0.3),P(u+0.9,y+h*0.85),P(u,y+h*0.85)],c:'#34465a',gl:1});});
      y+=h;const o=s+1.8,yE=y-0.4;[[[-o,yE,-o],[o,yE,-o]],[[o,yE,-o],[o,yE,o]],[[o,yE,o],[-o,yE,o]],[[-o,yE,o],[-o,yE,-o]]].forEach(([a,b])=>{const c=[0,y+1.2,0];const m=[(a[0]+b[0])/2*0.62,y+0.9,(a[2]+b[2])/2*0.62];mFace(M,[a,b,[b[0]*0.6,y+0.9,b[2]*0.6],[a[0]*0.6,y+0.9,a[2]*0.6]],rf,'roof',[0,y-2,0]);});
      mBox(M,-s*0.62,y+0.8,-s*0.62,s*0.62,y+0.95,s*0.62,rf,'roof',['d']);y+=0.9;});
    mBox(M,-0.08,y,-0.08,0.08,y+7,0.08,'#8a8f96','metal');mFace(M,[[0,y+6.9,0],[0,y+6.9,2.6],[0,y+5.4,2.6],[0,y+5.4,0]],'#b8322a','cloth',null,true);
    M.foot=[-8.8,8.8,-8.8,8.8];return M;},
  // Трофей Августа в Ла-Тюрби: подиум и полуразрушенная колоннада
  trophy:(r,v)=>{const M=new Mesh(),st='#d8cfbb',st2='#c2b8a2';mBox(M,-12,0,-12,12,11,12,st2,'stone',['d']);mBox(M,-12.6,11,-12.6,12.6,12.2,12.6,st,'stone',['d']);
    mLathe(M,[0,12.2,0],'y',[[9.4,0],[9.4,2.2],[0,2.2]],16,st2,'stone');for(let k=0;k<16;k++){const a=k/16*Math.PI*2,h=[13,13,9,13,6,13,13,11,4,13,13,13,8,13,12,13][k];bColumn(M,Math.cos(a)*8.4,14.4,Math.sin(a)*8.4,0.62,h,st,'stone');}
    mBox(M,-9,27.4,-9,-2,28.6,0,st,'stone',['d']);mLathe(M,[0,14.4,0],'y',[[6.8,0],[6.4,17],[0,17]],12,st2,'stone');M.foot=[-13,13,-13,13];return M;},
  // Обсерватория на вершине Мон-Ванту: каменное здание с башней и мачтой
  observatory:(r,v)=>{const M=new Mesh(),st='#d9d2c2';const W=mBox(M,-4,0,-7,4,7,7,st,'stone',['d']);[-4,0,4].forEach(u=>wWin(W.r,FAC(8),u,2.2,0.9,1.6,{shut:'#5a6a7a'}));bGable(M,-4,4,-7,7,7,1.6,'#6a6258',st,0.3);
    mLathe(M,[0,0,-10],'y',[[3,0],[3,17],[3.4,17],[3.4,18],[0,18]],12,st,'stone');mLathe(M,[0,18,-10],'y',[[2.6,0],[2.4,2.2],[1.4,3.4],[0,3.8]],12,'#b8bcc2','metal');
    mBox(M,-0.15,21.8,-10.15,0.15,33,-9.85,'#6a6e76','metal');[24,27,30].forEach(y=>mBox(M,-1.2,y,-10.05,1.2,y+0.1,-9.95,'#6a6e76','metal'));M.foot=[-4.5,4.5,-13.5,7.5];return M;},
  // Казино Монте-Карло: фасад с двумя башнями и куполом
  casino:(r,v)=>{const M=new Mesh(),wc='#efe2c4',tr='#e3cfa4',cu='#5f8f7a';const W=mBox(M,-9,0,-20,9,14,20,wc,'wall',['d']),P=FAC(18);
    for(let fl=0;fl<2;fl++)[-15,-10.5,-6,6,10.5,15].forEach(u=>wWin(W.r,P,u,1.4+fl*6,1.6,3.4,{arch:1,frame:tr,glass:'#34465a'}));wDoor(W.r,P,0,4,6.5,'#4a3424',{arch:1,frame:tr});
    (W.r.deco=W.r.deco||[]).push({a:P(-20,13.4),b:P(20,13.4),w:1.0,c:tr},{text:'CASINO',at:[P(-4,9),P(4,9),P(-4,11.2)],w:8,h:2.2,c:'#8a6a2a',font:'bold 1.7px serif'});
    [-16,16].forEach(z=>{mBox(M,-5,14,z-3.5,5,24,z+3.5,wc,'wall',['d']);mLathe(M,[0,24,z],'y',[[4.2,0],[4.2,1.2],[3.6,3.6],[2.2,5.6],[0.9,6.4],[0.9,7.4],[0.5,8.4],[0,8.6]],12,cu,'paint');mBox(M,-0.1,32.6,z-0.1,0.1,34.5,z+0.1,'#c9a24a','metal');});
    mLathe(M,[0,14,0],'y',[[6,0],[6,3],[5.5,6.5],[3.5,9],[0,10]],16,cu,'paint');bHip(M,-9,9,-12.5,12.5,14,2.5,'#6a6f78',0.4);M.foot=[-9.5,9.5,-20.5,20.5];return M;},
  // Обелиск Веллингтона в Феникс-парке (Дублин)
  obelisk:(r,v)=>{const M=new Mesh(),st='#a29d92';[[13,2],[11.5,2],[9.5,5]].reduce((y,[s,h])=>{mBox(M,-s,y,-s,s,y+h,s,st,'stone',['d']);return y+h;},0);
    const y0=9,s0=4.6,s1=2.6,y1=62;[[-1,-1],[1,-1],[1,1],[-1,1]].forEach((a,i,A)=>{const b=A[(i+1)%4];mFace(M,[[a[0]*s0,y0,a[1]*s0],[b[0]*s0,y0,b[1]*s0],[b[0]*s1,y1,b[1]*s1],[a[0]*s1,y1,a[1]*s1]],st,'stone',[0,30,0]);mFace(M,[[a[0]*s1,y1,a[1]*s1],[b[0]*s1,y1,b[1]*s1],[0,y1+3.2,0]],st,'stone',[0,y1,0]);});
    M.foot=[-13.5,13.5,-13.5,13.5];return M;},
  // Ирландская круглая башня
  round_tower:(r,v)=>{const M=new Mesh(),st='#8f8a80';mLathe(M,[0,0,0],'y',[[2.9,0],[2.5,26],[2.7,26.4],[0.1,31]],12,st,'stone');
    [[8,0],[15,1.8],[22,3.6],[24.5,0.6]].forEach(([y,a])=>{const x=Math.cos(a)*2.62,z=Math.sin(a)*2.62;mFace(M,[[x,y,z-0.35],[x,y,z+0.35],[x*1.01,y+1.3,z+0.3],[x*1.01,y+1.3,z-0.3]],'#1e1d22','matte',[0,y,0]);});M.foot=[-3.2,3.2,-3.2,3.2];return M;},
  // Радиобашня Берлина (Функтурм, 1926)
  funkturm:(r,v)=>{const M=new Mesh(),c='#5f646c',dk='#454a52';const leg=(y0,s0,y1,s1,n)=>{[[-1,-1],[1,-1],[1,1],[-1,1]].forEach((a,i,A)=>{const b=A[(i+1)%4];const f=mFace(M,[[a[0]*s0,y0,a[1]*s0],[b[0]*s0,y0,b[1]*s0],[b[0]*s1,y1,b[1]*s1],[a[0]*s1,y1,a[1]*s1]],c,'metal',[0,(y0+y1)/2,0],true);f.deco=[];
      for(let k=0;k<n;k++){const t0=k/n,t1=(k+1)/n,L=(p,q,t)=>[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,p[2]+(q[2]-p[2])*t],P=f.p,a0=L(P[0],P[3],t0),b0=L(P[1],P[2],t0),a1=L(P[0],P[3],t1),b1=L(P[1],P[2],t1);f.deco.push({a:a0,b:b1,w:0.25,c:dk},{a:b0,b:a1,w:0.25,c:dk});}});};
    leg(0,10,52,5,9);mBox(M,-7.5,52,-7.5,7.5,58,7.5,'#d8d2c2','wall',[]);leg(58,5,124,2.2,12);mBox(M,-4,124,-4,4,127,4,'#d8d2c2','wall',[]);leg(127,2.2,142,1.2,4);mBox(M,-0.1,142,-0.1,0.1,150,0.1,c,'metal');M.foot=[-10,10,-10,10];return M;},
  // Ветряк-насос на американской ферме: ажурная вышка, колесо из лопастей, флюгер
  windmill_us:(r,v)=>{const M=new Mesh(),c='#8a8f96',H=11;[[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([x,z])=>mTube(M,[[x*1.6,0,z*1.6],[x*0.3,H,z*0.3]],0.06,4,c,'metal'));
    for(let k=1;k<5;k++){const y=k*H/5,s=1.6-(1.3)*y/H;[[-1,-1,1,-1],[1,-1,1,1],[1,1,-1,1],[-1,1,-1,-1]].forEach(([a,b,cc,d])=>mTube(M,[[a*s,y,b*s],[cc*s,y,d*s]],0.035,3,c,'metal'));}
    const hub=[0.6,H+0.4,0];for(let k=0;k<18;k++){const a=k/18*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a),P=(d,w)=>[hub[0],hub[1]+sa*d+ca*w,hub[2]+ca*d-sa*w];mFace(M,[P(0.5,-0.08),P(1.9,-0.14),P(1.9,0.14),P(0.5,0.08)],'#b8bcc2','metal',null,true);}
    mTube(M,[[0,H+0.4,0],[-2.6,H+0.5,0]],0.05,4,c,'metal');mFace(M,[[-2,H+0.1,0],[-3.4,H+0.1,0],[-3.4,H+1.3,0],[-2,H+0.8,0]],'#b8322a','metal',null,true);M.foot=[-3.5,2.4,-2,2];return M;},
  // Итальянская кампанила: кирпичная башня, звон с арками, пирамидальная крыша
  campanile:(r,v)=>{const M=new Mesh(),wc=['#c99a70','#d8b88a','#b8866a'][v%3],tr='#efe2c8',rf='#a8553a',s=2.4;const S=mBox(M,-s,0,-s,s,19,s,wc,'wall',['d']);
    [S.r,S.l,S.f,S.b].forEach(f=>{f.deco=[];const p=f.p;[6.5,13].forEach(y=>f.deco.push({a:[p[0][0],y,p[0][2]],b:[p[1][0],y,p[1][2]],w:0.25,c:tr}));});wWin(S.r,(u,y)=>[s+0.012,y,u],0,8,0.5,1.2,{arch:1,glass:'#2a2a30'});
    const B=mBox(M,-s-0.15,19,-s-0.15,s+0.15,23.5,s+0.15,wc,'wall',['d']);[['r',(u,y)=>[s+0.162,y,u]],['l',(u,y)=>[-s-0.162,y,-u]],['f',(u,y)=>[-u,y,s+0.162]],['b',(u,y)=>[u,y,-s-0.162]]].forEach(([k,P])=>bArches(B[k],P,[-0.95,0.95],19.6,1.2,2.4));
    bTent(M,0,23.5,0,(s+0.5)*1.414,4.2,rf,4,Math.PI/4);bCross(M,0,27.6,0,1.3,'#3a3a3a');M.foot=[-s-0.5,s+0.5,-s-0.5,s+0.5];return M;},
  // Белая деревянная церковь Новой Англии со шпилем
  church_us:(r,v)=>{const M=new Mesh(),wc='#f4f2ec',rf='#4f555e';const W=mBox(M,-4,0,-6,4,6.5,8,wc,'wall',['d']);[W.r,W.l].forEach(f=>{f.deco=f.deco||[];const p=f.p;for(let y=0.3;y<6.5;y+=0.3)f.deco.push({a:[p[0][0],y,p[0][2]],b:[p[1][0],y,p[1][2]],w:0.03,c:'#d8d4c8'});});
    [-4,-0.5,3,6.3].forEach(u=>wWin(W.r,(uu,y)=>[4.012,y,uu],u,1.6,1.0,2.8,{arch:1,frame:'#ffffff',glass:'#34465a'}));bGable(M,-4,4,-6,8,6.5,3.2,rf,wc,0.35);
    const T=mBox(M,-2,0,-9.2,2,12,-5.2,wc,'wall',['d']);wDoor(T.b,(u,y)=>[u,y,-9.212],0,1.6,3,'#5a3a24',{arch:1,frame:'#ffffff'});mBox(M,-1.6,12,-8.8,1.6,15.5,-5.6,wc,'wall',['d']);
    mLathe(M,[0,15.5,-7.2],'y',[[1.7,0],[0.1,11]],8,wc,'wall');M.foot=[-4.4,4.4,-9.6,8.4];return M;},
  // Английская сельская церковь: каменный неф и башня с зубцами
  church_uk:(r,v)=>{const M=new Mesh(),st='#a8a192',rf='#4c5058';const W=mBox(M,-4,0,-5,4,6.5,9,st,'stone',['d']);[-3,0.5,4,7].forEach(u=>wWin(W.r,(uu,y)=>[4.012,y,uu],u,1.5,0.9,2.6,{arch:1,frame:'#c8c0ae',glass:'#3a3a4a'}));bGable(M,-4,4,-5,9,6.5,4,rf,st,0.3);
    mBox(M,-2.8,0,-10.6,2.8,15,-5,st,'stone',['d']);bMerlons(M,-2.8,2.8,-10.6,-5,15,1.1,st,false);[[-2.8,-10.6],[2.8,-10.6],[2.8,-5],[-2.8,-5]].forEach(([x,z])=>bTent(M,x,15,z,0.5,2.4,st,4));
    M.foot=[-4.4,4.4,-11,9.4];return M;},
  // Церковь Австрии и Швейцарии: белая, с колокольней под барочной «луковицей»
  church_at:(r,v)=>{const M=new Mesh(),wc='#f2eee4',rf=['#8a3a2a','#5a5f66','#7a4a3a'][v%3],cu='#4f7a64';const W=mBox(M,-4,0,-5,4,7,9,wc,'wall',['d']);[-3,0.5,4,7].forEach(u=>wWin(W.r,(uu,y)=>[4.012,y,uu],u,1.8,0.9,2.4,{arch:1,frame:'#e0d8c8',glass:'#3a3a4a'}));bGable(M,-4,4,-5,9,7,4.2,rf,wc,0.35);
    const T=mBox(M,-2.6,0,-10.2,2.6,17,-5,wc,'wall',['d']);wDoor(T.b,(u,y)=>[u,y,-10.212],0,1.5,2.8,'#5a3a24',{arch:1});(T.r.deco=T.r.deco||[]).push({dot:[2.612,14.5,-7.6],r:1.1,c:'#f1ece0'},{ring:[2.62,14.5,-7.6,1.15],w:0.12,c:'#3a3a3a'});
    mLathe(M,[0,17,-7.6],'y',[[3.2,0],[3.4,1.2],[2.6,2.8],[1.1,3.8],[0.7,4.6],[1.3,5.4],[0.9,6.6],[0.3,7.6],[0,8]],8,cu,'paint');bCross(M,0,25,-7.6,1.4,'#c9a24a');M.foot=[-4.4,4.4,-10.6,9.4];return M;},
  // Минарет и мечеть (Триполи)
  minaret:(r,v)=>{const M=new Mesh(),wc='#f1ece0',gr='#3f7a5a';mLathe(M,[0,0,0],'y',[[1.7,0],[1.5,16],[2.3,16],[2.3,16.6],[1.2,16.6],[1.1,21],[1.3,21],[0,24.5]],8,wc,'wall');mLathe(M,[0,21,0],'y',[[1.3,0],[0.05,3.6]],8,gr,'paint');
    mBox(M,2,0,-5,10,6,5,wc,'wall',['d']);mLathe(M,[6,6,0],'y',[[3.6,0],[3.5,1.5],[2.6,3.2],[0,4.2]],12,wc,'wall');M.foot=[-2,10.5,-5.5,5.5];return M;},
  // Белый дом с плоской крышей (Северная Африка)
  house_ly:(r,v)=>{const M=new Mesh(),wc=['#f1ece0','#ece2cc','#f4efe6'][v%3],D=7,L=9,H=4.6+(v%2)*2.4;const W=bWalls(M,D,L,H,wc);mBox(M,-D/2,H,-L/2,D/2,H+0.5,L/2,wc,'wall',['d']);
    [-2.6,0,2.6].forEach(u=>wWin(W.r,FAC(D),u,1.4+(v%2)*2.4,0.8,1.2,{arch:1,frame:wc,glass:'#2a3a4a',shut:v%3===1?'#3a6a9a':undefined}));wDoor(W.r,FAC(D),-1.3,1.1,2.2,'#3a6a9a',{arch:1,frame:wc});
    M.foot=[-D/2-0.3,D/2+0.8,-L/2-0.3,L/2+0.3];return M;},
  // Ирландский беленый домик под соломой
  cottage_ie:(r,v)=>{const M=new Mesh(),D=5.5,L=9,H=2.8,wc='#f4f1e8',th='#b89a5c';const W=bWalls(M,D,L,H,wc);[-2.8,2.8].forEach(u=>wWin(W.r,FAC(D),u,1,0.7,0.9,{frame:'#e8e2d0',glass:'#2e3440'}));wDoor(W.r,FAC(D),0,0.9,1.9,['#b8322a','#2f5a8a','#3f7a4a'][v%3]);
    const yR=H+2.4;[-1,1].forEach(s=>{const f=mFace(M,[[s*(D/2+0.6),H-0.5,-L/2-0.4],[0,yR,-L/2-0.2],[0,yR,L/2+0.2],[s*(D/2+0.6),H-0.5,L/2+0.4]],th,'cloth',[0,H,0]);f.deco=[];for(let k=1;k<6;k++){const t=k/6;f.deco.push({a:[s*(D/2+0.6)*(1-t),H-0.5+(yR-H+0.5)*t,-L/2-0.3],b:[s*(D/2+0.6)*(1-t),H-0.5+(yR-H+0.5)*t,L/2+0.3],w:0.06,c:shade(th,-0.18)});}});
    [-1,1].forEach(s=>mFace(M,[[-D/2,H,s*L/2],[D/2,H,s*L/2],[0,yR-0.1,s*L/2]],wc,'wall',[0,H,0]));bChimney(M,0,L/2-0.6,H+1.4,1.6,'#e8e2d0');M.foot=[-D/2-0.6,D/2+0.8,-L/2-0.5,L/2+0.5];return M;},
  // Виадук Земмерингской железной дороги: два яруса арок на высоких опорах
  viaduct:(r,v)=>{const M=new Mesh(),st='#b0a58e',N=9,S=14,H1=16,H2=13,Lh=N*S/2;
    for(let k=0;k<=N;k++){const z=-Lh+k*S;mBox(M,-3.2,-30,z-1.8,3.2,H1,z+1.8,st,'stone',['d']);mBox(M,-2.8,H1,z-1.4,2.8,H1+H2,z+1.4,st,'stone',['d']);}
    for(let k=0;k<N;k++){const z0=-Lh+k*S;[[3.2,1.8,H1],[2.8,1.4,H1+H2]].forEach(([x,hw,yt])=>{const za=z0+hw,zb=z0+S-hw,m=(za+zb)/2,rr=(zb-za)/2,yc=yt-rr-1.2;
      for(let q=0;q<8;q++){const a0=Math.PI*q/8,a1=Math.PI*(q+1)/8,p0=[yc+Math.sin(a0)*rr,m-Math.cos(a0)*rr],p1=[yc+Math.sin(a1)*rr,m-Math.cos(a1)*rr];
        [-1,1].forEach(sd=>mFace(M,[[sd*x,p0[0],p0[1]],[sd*x,p1[0],p1[1]],[sd*x,yt,p1[1]],[sd*x,yt,p0[1]]],st,'stone',[0,yc,m]));
        mFace(M,[[-x,p0[0],p0[1]],[x,p0[0],p0[1]],[x,p1[0],p1[1]],[-x,p1[0],p1[1]]],shade(st,-0.18),'stone',[0,yt+6,m]);}});}
    mBox(M,-3,H1+H2,-Lh-1.8,3,H1+H2+1.2,Lh+1.8,shade(st,0.05),'stone',['d']);[-2.6,2.6].forEach(x=>mBox(M,x-0.2,H1+H2+1.2,-Lh-1.8,x+0.2,H1+H2+2.2,Lh+1.8,st,'stone',['d']));
    M.foot=[-3.5,3.5,-Lh-2,Lh+2];return M;}
});
// Спрайты для запасной 2D-гонки: те же модели в ракурсе сбоку
['church_ru','izba','mill_ru','campanile','church_us','church_uk','church_at','minaret','house_ly','cottage_ie','windmill_us'].forEach(k=>{SCENERY[k]={m3:(v,sd)=>{const r=mulberry32(hashStr(k+v));const M=BLD[k](r,v||0);if(sd<0)mMirrorX(M);const dpr=Math.min(2,window.devicePixelRatio||1);
  return renderModel(M,sd*0.95,0.1,(/church|campanile|minaret/.test(k)?11:15)*dpr,{outline:1,blur:0.6,shadow:0.32,lv:[0.35*sd,0.75,-0.55]});}};});
