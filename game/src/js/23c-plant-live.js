/* ================= ЗАВОД ВЖИВУЮ (0.18): живая 3D-сцена завода на движке гонки ================= */
// Прежняя картинка была «макетом» из плоских спрайтов. Теперь завод — сцена на том же движке, что и гонка:
// кирпич цехов, бетон 1920-х, черепица и шифер крыш — фото-материалы; небо по сезону, солнце и тени, поля до горизонта.
// Жизнь: из ворот сборочного цеха выкатываются готовые машины ваших моделей (тем чаще, чем больше выпуск) и едут на склад
// или за ворота — к дилерам; по улице проезжают машины эпохи и конные повозки; дым из труб тем гуще, чем полнее загрузка;
// рабочие ходят между цехами, у ворот — сторож; у склада маневровый паровоз толкает вагоны; при гоночном отделе по
// испытательному треку кружит машина. Пальцем (мышью) сцену можно повернуть и приблизить, двойное касание — вернуть вид.
// Рисует видеокарта (холст гонки #rgl), кадр копируется на холст раздела «Завод». Без WebGL — прежняя картинка.
const PLG={cv:null,g:null,key:'',sc:null,raf:0,t:0,last:0,fail:0,ms:16,yaw:0,pit:0,zoom:0,ptr:new Map(),onScr:true,ready:false,busy:false,scale:1,slow:0,io:null,stills:new Map(),frames:0,carM:new Map(),want:'',mood:''};
function plgOK(){return typeof g3Can==='function'&&g3Can()&&gfxMode()!=='2d'&&!(AU.on&&AU.on.plantImg)&&PLG.fail<3&&!G3.lost;}
// Облик выпускаемых моделей (как в гонке и на карточках): по нему катятся машины из цеха и стоят на площадке
function plgSpecs(s){return s.models.filter(x=>x.status==='prod'||x.status==='sale').slice(0,4).map(m=>{try{return Object.assign(modelSpec(m,0,s.y,{mech:false,num:0,country:s.country}),{truck:isTruck(m)});}catch(e){return null;}}).filter(Boolean);}
function plgKey(s){return JSON.stringify([plantState(s),plgSpecs(s).map(x=>x.key)]);}
/* ---------- постройки: те же модели, что у прежней картинки, плюс водонапорная башня, рампа, штабеля ---------- */
function pWaterTower(x,z,S,name){const M=new Mesh(),H=S.era===2?21:18,tank=S.era===2?'#6d737b':'#5d5048';
  if(S.era===0){mLathe(M,[x,0,z],'y',[[3.1,0],[2.9,H*0.55],[2.7,H],[0,H]],12,'#9a4e3a','wall');}
  else{[[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([a,b])=>mBox(M,x+a*2.5-0.2,0,z+b*2.5-0.2,x+a*2.5+0.2,H,z+b*2.5+0.2,'#34373c','metal'));
    [H*0.33,H*0.66].forEach(y=>{mBox(M,x-2.5,y,z-2.62,x+2.5,y+0.22,z-2.38,'#34373c','metal');mBox(M,x-2.5,y,z+2.38,x+2.5,y+0.22,z+2.62,'#34373c','metal');
      mBox(M,x-2.62,y,z-2.5,x-2.38,y+0.22,z+2.5,'#34373c','metal');mBox(M,x+2.38,y,z-2.5,x+2.62,y+0.22,z+2.5,'#34373c','metal');});}
  mLathe(M,[x,H,z],'y',[[0,0],[3.7,0.35],[3.7,5.2],[3.5,5.7],[1.6,6.8],[0,7.1]],18,tank,'metal');
  if(name){const w=Math.min(6.4,name.length*0.62+1.2),b=mBox(M,x-w/2,H+1.7,z-3.92,x+w/2,H+3.3,z-3.74,'#1f2a36','paint',['d']);
    b.b.deco=[{text:name.toUpperCase(),at:[[x-w/2+0.1,H+1.8,z-3.94],[x+w/2-0.1,H+1.8,z-3.94],[x-w/2+0.1,H+3.2,z-3.94]],w:w-0.2,h:1.4,c:'#e8c56a',font:'bold 1px Impact,sans-serif'}];}
  M.foot=[x-4,x+4,z-4,z+4];return M;}
// Арка над воротами с названием компании (на улицу)
function pGateArch(gx,z,S){const M=new Mesh(),col=S.era===2?'#6a6f78':'#2a2c30',w=7.6,sw=Math.min(w-0.4,S.co.length*0.52+1.6);
  mBox(M,gx-w/2,3.55,z-0.12,gx+w/2,3.75,z+0.12,col,'metal');const b=mBox(M,gx-sw/2,3.75,z-0.1,gx+sw/2,4.75,z+0.05,'#f1e6c8','paint',['d']);
  b.b.deco=[{text:S.co.toUpperCase(),at:[[gx-sw/2+0.1,3.8,z-0.115],[gx+sw/2-0.1,3.8,z-0.115],[gx-sw/2+0.1,4.7,z-0.115]],w:sw-0.2,h:0.9,c:'#3a1c10',font:'bold 0.7px Georgia,serif'}];
  M.foot=[gx-4,gx+4,z-1,z+1];return M;}
// Будка сторожа у ворот
function pGuard(x,z,S){const M=new Mesh(),wall=S.era===2?'#c9c2b4':'#8a6a44',W=mBox(M,x-1.1,0,z-1,x+1.1,2.5,z+1,wall,S.era===2?'wall':'wood',['d','t']);
  wWin(W.b,(u,v)=>[u,v,z-1.012],x,1.1,0.8,0.8,{frame:'#e6dcc6'});pGable(M,x-1.1,x+1.1,z-1,z+1,2.5,0.9,0.25,S.sea==='w'?'#e6ecf0':'#5d4a42',wall);M.foot=[x-1.4,x+1.4,z-1.3,z+1.3];return M;}
/* ---------- расстановка: контора, цеха, трубы, склад, КБ, литейка, пресс, станция, башня, трек, ограда ---------- */
function plgLayout(S){
  const it=[],L={it,chim:[],gates:[],doors:[]},add=(M,k)=>{it.push({M,k});return M;},open='#17140f';
  const off=pOffice(-46,2,S);add(off.M,'office');L.off={x0:-46,x1:off.x1,z0:2,z1:11};L.doors.push([(-46+off.x1)/2,2]);
  const gx=off.x1+4.5,hx0=off.x1+9,hw=12,hd=18,hH=S.era===2?10:8,n=S.cv?Math.max(2,S.h):S.h;L.gx=gx;L.hx0=hx0;
  let hz1=6+hd;
  const cw='#aaa498',roofc='#56524e';if(S.cv){const x1=hx0+n*hw-1.2;hz1=6+hd+4;add(pHall(hx0,x1,6,hz1,hH+1,S,{saw:1,sign:'КОНВЕЙЕР',door:open,cw,roofc}),'hall');L.gates.push([(hx0+x1)/2,6]);}
  else for(let i=0;i<n;i++){const a=hx0+i*hw,b=a+hw-1.2;add(pHall(a,b,6,hz1,hH,S,{sign:i===0?'СБОРКА':null,door:open,cw,roofc}),'hall');L.gates.push([(a+b)/2,6]);}
  const xh=hx0+n*hw;L.xh=xh;L.hz1=hz1;
  // трубы котельных — за цехами
  for(let i=0;i<Math.max(1,Math.ceil(n/2));i++){const c=pChimney(hx0+i*hw*2+hw*0.8,hz1+3,S.era===2?32:27,1.05,S);add(c.M,'chim');L.chim.push({p:c.top,k:1});}
  const zb=hz1+7;
  if(S.fo){add(pHall(hx0,hx0+14,zb,zb+14,8,S,{glass:'#e8913a',sign:'ЛИТЕЙКА',wall:'#7a4636',cw:'#8a8074'}),'hall');const c=pChimney(hx0+17,zb+8,36,1.35,S);add(c.M,'chim');L.chim.push({p:c.top,k:2});}
  if(S.pr)add(pHall(hx0+(S.fo?20:0),hx0+(S.fo?36:16),zb,zb+14,10,S,{sign:'ПРЕСС',cw}),'hall');
  const dep=pDepot(xh+4,5,S,{door:open,back:1,wall:S.era===2?'#a8a49a':'#9a4e3a',roof:S.era===0?'#7a6f66':'#9aa0a6',roofMat:'roof'});add(dep.M,'depot');L.dep={x0:xh+4,x1:dep.x1,z0:5,z1:16};L.doors.push([(xh+4+dep.x1)/2,5]);
  if(S.el){add(pPower(-32,zb,S),'power');const c=pChimney(-24+2,zb+8,22,0.6,S);add(c.M,'chim');L.chim.push({p:c.top,k:1.5});}
  const rd=pRD(-50,17,S);add(rd.M,'rd');
  // водонапорная башня — у крупного завода (как у Форда в Хайленд-Парке — с названием на баке)
  if(S.sz>=1||S.era>=1){add(pWaterTower(xh-7,hz1+10,S,S.sz>=2?S.co:''),'tower');}
  // стоянка готовых машин у склада; у большого завода — своя железнодорожная ветка с платформой
  L.lot={x0:dep.x1+1.5,x1:dep.x1+14};L.railX=S.h>=2||S.era>=1||S.sz>=1?dep.x1+21:0;
  let zMax=zb+(S.fo||S.pr?16:4),xMin=-46;it.forEach(q=>{if(q.M.foot){zMax=Math.max(zMax,q.M.foot[3]);xMin=Math.min(xMin,q.M.foot[0]);}});L.zB=zMax;
  if(S.team>0){const tz=zMax+10,x0=xMin+14,x1=Math.max(xh,x0+90);L.track={cx:(x0+x1)/2,cz:tz+17,rx:(x1-x0)/2,rz:15,w:7};add(pTeam(x0-17,tz+10,S),'team');L.doors.push([x0-12.5,tz+10]);zMax=tz+36;}
  L.zMax=zMax;L.X0=xMin-6;L.X1=L.railX?L.railX+6:L.lot.x1+6;
  add(pFence(L.X0+0.5,L.X1-(L.railX?9:0.5),-5.5,gx,S),'fence');add(pGateArch(gx,-5.5,S),'arch');add(pGuard(gx+5.6,-3.4,S),'guard');
  return L;}
// Ограда по периметру: дощатый забор (до 1906), кирпичная стена со столбами, бетон 1920-х
function plgWall(mb,pts,S){const brick=S.era>=1,H=S.era===0?1.8:S.era===1?2.3:2.5,col=S.era===0?'#8a6a44':S.era===1?'#9a4e3a':'#a8a49a';
  mb.e[3]=S.era===0?txLay('wood_wall',1):S.era===1?txLay(texLi('factory')>=0?'factory':'brick_wall',1):txLay('concrete',1);
  for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/L,dz=(b[1]-a[1])/L,ang=Math.atan2(dx,dz),n=Math.max(1,Math.round(L/4.5));
    for(let k=0;k<n;k++){const t0=k/n,t1=(k+1)/n,cx=a[0]+(b[0]-a[0])*(t0+t1)/2,cz=a[1]+(b[1]-a[1])*(t0+t1)/2,hl=L/n/2;
      pBox(mb,cx,0,cz,brick?0.18:0.05,H,hl,col,brick?MID.wall:MID.wood,ang);pBox(mb,a[0]+(b[0]-a[0])*t0,0,a[1]+(b[1]-a[1])*t0,brick?0.3:0.09,H+(brick?0.35:0.15),brick?0.3:0.09,col,brick?MID.wall:MID.wood,ang);
      if(brick)pBox(mb,cx,H,cz,0.24,0.1,hl,S.era===1?'#7a6a5a':'#8a8680',MID.stone,ang);}}
  mb.e[3]=0;}
// Фото-материал грани: кирпич цехов — «фабричный», бетон 1920-х, шифер и черепица, железо ангаров, снег зимой
function plgLay(S){return f=>{if(TX.st!==2)return 0;const k=f.mat&&f.mat.k,c=f.col,lum=(c[0]*0.3+c[1]*0.59+c[2]*0.11)/255,red=c[0]>c[1]*1.25&&c[0]>c[2]*1.35,n=f.n||[0,0,1];
  if(k==='wall'){if(red)return txLay(texLi('factory')>=0?'factory':'brick_wall',1);if(lum>0.62)return txLay('plaster',1);return txLay('concrete',1);}
  if(k==='roof'||(k==='metal'&&n[1]>0.25)){if(S.sea==='w'&&n[1]>0.3)return txLay('snow',1);if(k==='metal')return txLay(texLi('metal_roof')>=0?'metal_roof':'roof_slate',1);if(red)return txLay('roof_tiles',1);return txLay('roof_slate',1);}
  if(k==='wood')return txLay('wood_wall',1);
  return 0;};}
/* ---------- земля: поля и луга до горизонта, двор, улица, тротуар, ветка, испытательный трек ---------- */
function plgQuad(mb,x0,z0,x1,z1,y,col,m,nz){plgPolyC(mb,[[x0,y,z0],[x1,y,z0],[x1,y,z1],[x0,y,z1]],[0,1,0],col,m,nz);}
// Многоугольник с цветом в каждой вершине (пятна по шуму nz, м): обход — как у MB.poly
function plgPolyC(mb,P,n,col,m,nz){const g=newell(P),rev=g[0]*n[0]+g[1]*n[1]+g[2]*n[2]<0,k=P.length,i0=mb.n;
  for(let i=0;i<k;i++){const q=P[rev?k-1-i:i],v=nz?0.86+0.28*fbm2(q[0]/nz,q[2]/nz,11,3):1;mb.v(q[0],q[1],q[2],n[0],n[1],n[2],cMul(col,v),m);}for(let i=1;i<k-1;i++)mb.tri(i0,i0+i,i0+i+1);}
function plgGround(mb,S,L){const snow=S.sea==='w',aut=S.sea==='a',dry=['it','es','ly'].includes(S.c),tl=(k,f)=>txLay(texLi(k)>=0?k:f,1);
  const LY={meadow:tl('meadow','grass'),dry:tl('meadow_dry','dry_grass'),plow:txLay('dirt',1),grass:txLay('grass',1),snow:txLay('snow',1)};
  const C={meadow:aut?[132,128,78]:dry?[140,136,88]:[98,124,66],dry:aut?[168,140,84]:[184,160,96],plow:[104,84,62],grass:aut?[120,118,70]:[88,116,60],snow:[214,220,228]};
  const X0=L.X0-12,X1=L.X1+12,Z1=L.zMax+14;
  const field=(x,z)=>{if(x>X0-70&&x<X1+70&&z<Z1+34)return 'meadow';const fx=Math.floor((x+2000)/130),fz=Math.floor((z+2000)/96),h=((fx*73856093)^(fz*19349663))>>>0,q=(h%97)/97;
    return q<0.28?'plow':q<0.52?'dry':q<0.8?'meadow':'grass';};
  const cell=(x0,z0,x1,z1)=>{const k=snow?'snow':field((x0+x1)/2,(z0+z1)/2);mb.e[3]=LY[k];plgQuad(mb,x0,z0,x1,z1,0,C[k],MID.matte,70);};
  for(let z=-200;z<400;z+=10)for(let x=-400;x<400;x+=10)cell(x,z,x+10,z+10);
  for(let z=-800;z<3200;z+=100)for(let x=-3200;x<3200;x+=100){if(x>=-400&&x<400&&z>=-200&&z<400)continue;cell(x,z,x+100,z+100);}
  // двор: гравий (до 1906), брусчатка, бетон 1920-х — вокруг зданий, перед цехами, проезды; остальное — трава
  const yl=S.era===0?txLay('gravel',1):S.era===1?txLay('cobble',1):txLay('concrete',1),yc=snow?[200,202,206]:S.era===0?[150,138,118]:S.era===1?[128,122,114]:[166,164,156];
  const R=[[L.X0+0.5,-5.5,L.X1-0.5,7.5],[L.gx-3.8,-5.5,L.gx+3.8,L.zB+4],[L.hx0-4,L.hz1,L.xh+4,L.hz1+9],[L.lot.x0,-5.5,L.lot.x1,30]];
  L.it.forEach(({M,k})=>{const f=M.foot;if(f&&k!=='fence'&&k!=='arch')R.push([f[0]-2.5,f[2]-2.5,f[1]+2.5,f[3]+2.5]);});if(L.railX)R.push([L.railX-5.5,-5.5,L.railX+3,34]);
  const inY=(x,z)=>R.some(r=>x>=r[0]&&x<=r[2]&&z>=r[1]&&z<=r[3]),cs=3;mb.e[3]=yl;
  for(let z=-5.5;z<L.zMax+6;z+=cs)for(let x=L.X0;x<L.X1;x+=cs)if(inY(x+cs/2,z+cs/2))plgQuad(mb,x,z,x+cs,z+cs,0.025,yc,MID.stone,40);
  // улица и тротуар
  const sl=S.era===0?txLay('dirt_road',1):S.y<1921?txLay('cobble',1):txLay('asphalt',1),stc=snow?[172,174,178]:S.era===0?[140,120,94]:S.y<1921?[118,112,104]:[88,88,90];
  mb.e[3]=sl;for(let x=-600;x<600;x+=10)plgQuad(mb,x,-15,x+10,-7,0.03,stc,MID.stone,30);
  if(S.era>=1){mb.e[3]=S.era===2?txLay('concrete',1):txLay('brick_road',1);const pc=snow?[226,228,232]:S.era===2?[168,166,160]:[128,98,84];
    for(let x=-600;x<600;x+=10){plgQuad(mb,x,-7,x+10,-5.6,0.14,pc,MID.stone,20);plgPolyC(mb,[[x,0.03,-7],[x+10,0.03,-7],[x+10,0.14,-7],[x,0.14,-7]],[0,0,-1],[120,118,112],MID.stone,0);}}
  // испытательный трек: кольцо из отрезков, по краям — белые линии (с 1906)
  if(L.track){const T=L.track,n=80;const tc=snow?[206,208,212]:S.era===2?[92,92,94]:[128,106,82];
    for(let i=0;i<n;i++){const a0=i/n*6.2832,a1=(i+1)/n*6.2832,P=(a,d,y)=>[T.cx+Math.cos(a)*(T.rx+d),y,T.cz+Math.sin(a)*(T.rz+d)],w=T.w/2;
      mb.e[3]=S.era===2?txLay('asphalt',1):txLay('dirt_road',1);plgPolyC(mb,[P(a0,-w,0.04),P(a1,-w,0.04),P(a1,w,0.04),P(a0,w,0.04)],[0,1,0],tc,MID.stone,12);
      if(S.era>=1){mb.e[3]=0;[-w+0.25,w-0.25].forEach(o=>plgPolyC(mb,[P(a0,o-0.12,0.05),P(a1,o-0.12,0.05),P(a1,o+0.12,0.05),P(a0,o+0.12,0.05)],[0,1,0],[236,234,226],MID.paint,0));}}}
  mb.e[3]=0;}
// Железнодорожная ветка вдоль склада: насыпь, шпалы, рельсы, упор
function plgRail(mb,x,z0,z1){mb.e[3]=txLay('gravel',1);for(let z=z0;z<z1;z+=8){const a=z,b=Math.min(z1,z+8);mb.poly([[x-1.7,0.22,a],[x+1.7,0.22,a],[x+1.7,0.22,b],[x-1.7,0.22,b]],[0,1,0],[150,146,140],MID.stone);
    [-1,1].forEach(sd=>mb.poly([[x+sd*1.7,0.22,a],[x+sd*2.6,0.02,a],[x+sd*2.6,0.02,b],[x+sd*1.7,0.22,b]],[sd*0.2,1,0],[140,136,130],MID.stone));}
  mb.e[3]=txLay('planks',1);for(let z=z0+0.4;z<Math.min(z1,z0+160);z+=0.75)pBox(mb,x,0.22,z,1.25,0.13,0.12,'#5d4c3c',MID.wood);mb.e[3]=0;
  [-0.72,0.72].forEach(o=>pBox(mb,x+o,0.35,(z0+z1)/2,0.04,0.09,(z1-z0)/2,'#7a7470',MID.metal));
  pBox(mb,x,0.22,z0-0.4,1.0,1.0,0.35,'#5d4c3c',MID.wood);pBox(mb,x,0.9,z0-0.6,0.9,0.3,0.1,'#b8322a',MID.paint);}
// Товарный вагон: дощатый кузов, крыша, раздвижная дверь, колёса
function plgWagon(col){const mb=new MB();mb.e[3]=txLay('wood_wall',1);pBox(mb,0,1.05,0,1.36,2.35,4.0,col,MID.wood);mb.e[3]=0;
  pBox(mb,0,3.4,0,1.46,0.12,4.1,'#3a3836',MID.roof);pBox(mb,0,0.85,0,1.28,0.2,4.15,'#1c1d20',MID.metal);
  [-1,1].forEach(sd=>{pBox(mb,sd*1.37,1.1,0,0.03,2.1,1.0,shade(col,-0.25),MID.wood);[-2.7,2.7].forEach(z=>pWheelX(mb,sd*1.0,0.46,z,0.46,sd,'#2a2a2c'));});
  [-4.2,4.2].forEach(z=>[-0.8,0.8].forEach(x=>pCyl(mb,[x,1.0,z],[x,1.0,z+Math.sign(z)*0.35],0.16,0.16,'#2a2a2c',8,MID.metal)));
  return mb;}
/* ---------- сцена целиком: сетки в видеокарту, надписи, машины, люди, пути ---------- */
function plgLabels(texts){const S=1024,cv=mkCanvas(S,512),g=cv.getContext('2d'),mb=new MB(true);let x=2,y=2,h=0;
  texts.forEach(({d,n,L})=>{const w=Math.min(1000,Math.round(d.w*90)),hh=Math.round(d.h*90);if(x+w>S){x=2;y+=h+3;h=0;}if(y+hh>512)return;
    g.save();g.translate(x,y);g.scale(w/d.w,hh/d.h);g.fillStyle=d.c;g.font=d.font;g.textAlign='center';g.textBaseline='middle';g.fillText(d.text,d.w/2,d.h*0.54);g.restore();
    const u0=x/S,v0=y/512,u1=(x+w)/S,v1=(y+hh)/512,o=q=>[q[0]+n[0]*L*1.4,q[1]+n[1]*L*1.4,q[2]+n[2]*L*1.4],p0=o(d.at[0]),p1=o(d.at[1]),p3=o(d.at[2]),p2=[p1[0]+p3[0]-p0[0],p1[1]+p3[1]-p0[1],p1[2]+p3[2]-p0[2]];
    mb.poly([p0,p1,p2,p3],n,[255,255,255],MID.cloth,[[u0,v1],[u1,v1],[u1,v0],[u0,v0]]);x+=w+3;h=Math.max(h,hh);});
  return {cv,mb};}
// Люди: несколько обликов рабочих эпохи, у каждого 4 кадра шага и «стоит»
function plgPeople(S){const out=[],y=S.y,rnd=mulberry32(hashStr('plgp|'+y+S.c)),work=['#3b4a5e','#4a4a44','#5a4a3a','#34465e','#6a5e4e'];
  for(let k=0;k<6;k++){const o=personLook3(rnd,y,'crowd');Object.assign(o,{type:'man',frock:false,item:'',wave:false,hands:'down',lod:0,y});
    if(k<4){o.coat=work[k%work.length];o.trousers=shade(o.coat,-0.2);o.hat='cap';o.hatc=['#3a3026','#4a4a44','#2a2a2e'][k%3];o.vest=false;}
    else if(k===4){o.coat='#2b2f3a';o.hat=y<1920?'bowler':'cap';o.hatc='#1e1a18';}
    else{o.coat='#e8e2d0';o.trousers='#5a5048';o.hat='cap';o.hatc='#3a3026';}
    const fr=[];for(let f=0;f<5;f++){const M=new Mesh(),q=Object.assign({},o);if(f<4)q.walk=f/4;mPerson3(M,q,0);const mb=new MB();mbFromMesh(mb,M,{lift:0.003,step:0.001});fr.push(g3Mesh(mb));}
    out.push(fr);}
  return out;}
// Машина в видеокарте (кэш по облику): кузов, стёкла, колёса
function plgCar(spec,crew){const key=spec.key+'|'+(crew?1:0);let m=PLG.carM.get(key);if(m)return m;
  const M=carModel(Object.assign({},spec,{lod:'lo',crew:crew?1:0})),op=new MB(),gm=new MB();mbFromMesh(op,M,{lift:0.004,step:0.0016,glass:gm,car:true});
  const wc=new Float32Array(24);(M.wheels||[]).slice(0,6).forEach((w,k)=>wc.set(w,k*4));
  m={op:g3Mesh(op),gl:gm.n?g3Mesh(gm):null,wc,len:M.len||[-1.8,1.8],pivot:M.wheels&&M.wheels[0]?Math.abs(M.wheels[0][3]):0.42};
  if(PLG.carM.size>40){const [k0,v0]=PLG.carM.entries().next().value;g3Free(v0.op);g3Free(v0.gl);PLG.carM.delete(k0);}
  PLG.carM.set(key,m);return m;}
// Машины эпохи на улице: чужие марки, тёмные цвета; до 1920 — иногда конная повозка
function plgStreetSpec(y,r){const st=y<1905?['runabout','tonneau','runabout']:y<1914?['tourer','runabout','tonneau','tourer']:y<1924?['tourer','sedan','tourer']:['sedan','sedan','tourer'];
  const style=r()<(y>=1908?0.22:0)?'truck':st[Math.floor(r()*st.length)],col=['#1b1d22','#23303e','#4a1f1c','#2a3a2a','#3a3a3a','#5a4a3a','#1f2a44','#6a5a3a'][Math.floor(r()*8)];
  const b=style==='truck'?'b7':style==='tourer'?'b3':style==='sedan'?'b4':style==='tonneau'?'b2':'b1',wheel=y<1910?'wood':y<1924?'wire':'disc';
  return {key:'pls|'+style+'|'+col+'|'+y+'|'+wheel,style,color:col,y,wheel,mech:false,num:0,b,hp:2,strip:0,lux:0};}
// Сборка по частям (между частями идут кадры прежней сцены — без заминки на «Следующий месяц»)
function* plgBuildGen(s,out){
  const S=plantState(s),L=plgLayout(S),rnd=mulberry32(hashStr('plg|'+s.company+S.y+S.c)),texts=[],lay=plgLay(S),mood=plgMood(S);
  // вечером и в пасмурный зимний день в окнах цехов и конторы горит свет
  if(mood==='evening'||(S.sea==='w'&&mood==='overcast')){const pk={hall:0.75,office:0.45,rd:0.5,power:0.6,team:0.5};L.it.forEach(({M,k})=>{const p=pk[k];if(!p)return;M.F.forEach(f=>{let on=false;(f.deco||[]).forEach(d=>{if(!d.gl)return;if(!d.k)on=rnd()<p;if(on){d.l=5;d.c=d.k?'#7a5626':'#5e4020';d.gl=0;}});});});}
  // здания — с окнами, рамами и вывесками; для тени — те же стены без мелочей (иначе рамы окон «пачкают» фасад пятнами)
  const lit=new MB(),bld=new MB(),bldSh=new MB(),leaf=new MB(true),gnd=new MB();
  L.it.forEach(({M})=>{mbFromMesh(bld,M,{lift:0.03,step:0.012,minW:0.03,texts,tex:true,lay});mbFromMesh(bldSh,M,{lift:0.03,noDeco:true});});yield;
  plgGround(gnd,S,L);yield;
  if(L.railX){plgRail(lit,L.railX,-4,700);
    // грузовая платформа вдоль ветки
    lit.e[3]=txLay('concrete',1);pBox(lit,L.railX-3.3,0,18,1.2,1.1,13,'#9a968c',MID.stone);lit.e[3]=0;}
  {const zw=L.zMax+4,xe=L.X1-0.5;plgWall(lit,[[L.X0+0.5,-5.5],[L.X0+0.5,zw]].concat(L.railX?[[L.railX-4.5,zw]]:[[xe,zw],[xe,-5.5]]),S);}
  // мелочи: бочки, ящики, уголь у котельной, фонари вдоль тротуара, повозка у склада
  const crate=(x,z,k)=>{lit.e[3]=txLay('planks',1);pBox(lit,x,0,z,0.6*k,1.1*k,0.6*k,'#8a6a48',MID.wood,rnd()*0.4);lit.e[3]=0;};
  const barrel=(x,z)=>pCyl(lit,[x,0,z],[x,1.05,z],0.36,0.36,rnd()<0.5?'#4a3a2a':'#3a4a5a',10,MID.wood);
  for(let i=0;i<6;i++)crate(L.dep.x0+2+i*1.4,L.dep.z0-1.6-(i%2)*1.3,1);
  for(let i=0;i<5;i++)barrel(L.hx0-3.2+(i%2)*0.8,8+i*0.85);
  L.chim.forEach((c,i)=>{if(i===0){for(let k=0;k<4;k++)pBlob(lit,c.p[0]+3+k*1.2,0.4,c.p[2]+2.5+(k%2),1.6,0.9,1.3,'#1e1c1b',rnd,1,MID.stone);}});
  if(S.era>=1){const lp=pProp('lamp',0);for(let x=-120;x<=L.X1+80;x+=24){if(Math.abs(x-L.gx)<5.5)continue;lit.add(lp,X3(0,1,[x,0.14,-6.1]));}}
  if(S.era===0){const ct=pProp('cart',0);lit.add(ct,X3(Math.PI/2,1,[L.dep.x0-4,0,1.5]));}
  yield;
  // деревья: по краям участка, позади — лесополоса и рощи; зимой лиственные без листвы, осенью — рыжие
  const host=SCEN_SETS[S.c]?S.c:'other',TT=SCEN_SETS[host].trees,winter=S.sea==='w',autumn=S.sea==='a';
  const tree=(t,x,z,sc,lod)=>{const ev=t==='fir'||t==='pine'||t==='cypress'||t==='palm'||t==='olive';if(winter&&!ev)lod=1;const T=fTree(t,Math.floor(rnd()*3),lod),X=X3(rnd()*6.28,sc,[x,0,z]);lit.add(T.w,X);
    if(winter&&!ev)return;const i0=leaf.n;leaf.add(T.l,X);
    // осень: у каждого дерева свой наряд — жёлтый, рыжий или ещё зеленоватый
    if(autumn&&!ev){const q=rnd(),m=q<0.38?[1.62,1.12,0.42]:q<0.72?[1.9,0.82,0.36]:[1.28,1.02,0.66];for(let i=i0;i<leaf.n;i++){const o=i*leaf.st+16,k=0.9+((i*7919)%13)/65;leaf.u[o]=Math.min(255,leaf.u[o]*m[0]*k);leaf.u[o+1]=Math.min(255,leaf.u[o+1]*m[1]);leaf.u[o+2]=leaf.u[o+2]*m[2];}}};
  for(let i=0;i<9;i++)tree(TT[i%TT.length],L.X0-8-rnd()*14,-2+i*9+rnd()*4,0.9+rnd()*0.3,1);
  // через улицу: живая изгородь с проходами, кусты, по краям — деревья
  const dim=(i0,k,sat)=>{for(let i=i0;i<leaf.n;i++){const o=i*leaf.st+16,r0=leaf.u[o],g0=leaf.u[o+1],b0=leaf.u[o+2],l=(r0+g0+b0)/3;leaf.u[o]=(l+(r0-l)*sat)*k;leaf.u[o+1]=(l+(g0-l)*sat)*k;leaf.u[o+2]=(l+(b0-l)*sat)*k;}};
  {const hb=fTree('hedge',0,1),bu=fTree('bush',0,1),hx0=L.X0-40,hx1=L.X1+40,i0=leaf.n;
    // зимой вместо зелёной изгороди — штакетник
    if(winter){const fe=pProp('fence',0);for(let x=hx0;x<hx1;x+=10.2){if(rnd()<0.2)continue;lit.add(fe,X3(Math.PI/2,1,[x,0,-17.6]));}}
    else{for(let x=hx0;x<hx1;x+=11.5){if(rnd()<0.22)continue;const X=X3(Math.PI/2,1,[x,0,-17.6]);lit.add(hb.w,X);leaf.add(hb.l,X);}
      for(let k=0;k<10;k++){const X=X3(rnd()*6,0.8+rnd()*0.5,[hx0+rnd()*(hx1-hx0),0,-21-rnd()*20]);lit.add(bu.w,X);leaf.add(bu.l,X);}dim(i0,autumn?0.72:0.8,autumn?0.6:0.75);}
    for(let k=0;k<6;k++)tree(TT[k%TT.length],(k%2?L.X1+12+rnd()*30:L.X0-14-rnd()*30),-24-rnd()*40,0.9+rnd()*0.3,1);}
  for(let i=0;i<7;i++)tree(TT[(i+1)%TT.length],L.X1+10+rnd()*16,6+i*11+rnd()*5,0.9+rnd()*0.3,1);
  for(let x=L.X0-30;x<L.X1+40;x+=9+rnd()*6)tree(TT[Math.floor(rnd()*TT.length)],x,L.zMax+14+rnd()*8,0.85+rnd()*0.35,0);
  for(let k=0;k<26;k++){const x=(rnd()-0.5)*900,z=L.zMax+60+rnd()*420;tree(TT[Math.floor(rnd()*TT.length)],x,z,0.8+rnd()*0.4,0);}
  // вдали — городок с церковью и чужими трубами
  const set=SCEN_SETS[host],town=(set.town||set.houses).filter(t=>BLD[t]);if(town.length)for(let k=0;k<22;k++){const x=-260+rnd()*620,z=460+rnd()*180;try{lit.add(pBld(town[k%town.length],k%3),X3(rnd()<0.5?0:Math.PI/2,1,[x,0,z]));}catch(e){}}
  try{const ch=BLD[set.church]?set.church:'church';lit.add(pBld(ch,0),X3(0,1.2,[60,0,520]));}catch(e){}
  const far=[];for(let k=0;k<3;k++){const x=-200+k*190+rnd()*60,z=560+rnd()*120,c=pChimney(x,z,30,1.2,S);mbFromMesh(lit,c.M,{lift:0.03,tex:true,lay});far.push({p:c.top,k:0.7});}
  yield;
  // надписи
  const lab=plgLabels(texts);
  const sc={S,L,key:plgKey(s),lit:g3Mesh(lit),bld:g3Mesh(bld),bldSh:g3Mesh(bldSh),leaf:g3Mesh(leaf),gnd:g3Mesh(gnd),sign:g3Mesh(lab.mb),texLab:g3Tex(lab.cv,{cs:true,ct:true}),emit:L.chim.concat(far).map(c=>({p:c.p,k:c.k,acc:Math.random()})),
    cars:[],walk:[],stand:[],parts:[],t:0,tSpawn:{roll:1.5,street:0.5,truck:9,walk:0},lane:{e:-1,w:-1},bb:lit.bb};
  yield;
  // выпускаемые модели; стоят на площадке — по запасу на складе
  const specs=plgSpecs(s);sc.specs=specs.length?specs:[plgStreetSpec(S.y,rnd)];
  const nPark=[0,3,6,10,16][S.st]||0;sc.park=[];for(let i=0;i<nPark;i++){const row=i%2,k=Math.floor(i/2),sp=sc.specs[i%sc.specs.length];sc.park.push({m:plgCar(sp,false),x:row?L.lot.x1-2.4:L.lot.x0+2.4,z:-1+k*2.8,yaw:row?-Math.PI/2:Math.PI/2});}
  // трек гоночного отдела: машина в гоночной подготовке
  if(L.track){const T=L.track,P=[];for(let i=0;i<=64;i++){const a=-i/64*6.2832;P.push([T.cx+Math.cos(a)*T.rx,T.cz+Math.sin(a)*T.rz]);}sc.trackPath=plgPath(P,0);
    const md=s.models.find(x=>x.status==='prod'||x.status==='sale')||s.models[0];let sp=null;try{sp=modelSpec(md,1,S.y,{mech:mechanicEra(S.y),num:7,country:s.country});}catch(e){sp=sc.specs[0];}
    sc.cars.push({m:plgCar(sp,true),pa:sc.trackPath,s:rnd()*100,v:15,vmax:S.era===0?13:S.era===1?17:21,loop:true,spin:0});}
  // поезд: паровоз с тендером и три вагона
  if(L.railX&&(S.h>=2||S.sz>=1)){const TM=r3dTrainMesh(S.y),cols=['#6a3a2a','#5a4a3a','#4a3a30'];sc.train={loco:TM.cars[0],tender:TM.cars[1],wag:cols.map(c=>({m:g3Mesh(plgWagon(c)),len:8.6})),t:rnd()*40};}
  yield;
  // люди эпохи — общие для всех сцен одной эпохи и страны (не пересобираются каждый месяц)
  const pk=(S.y<1906?0:S.y<1919?1:2)+'|'+S.c;if(!PLG.ppl||PLG.ppl.k!==pk){if(PLG.ppl)PLG.ppl.fr.forEach(fr=>fr.forEach(g3Free));PLG.ppl={k:pk,fr:plgPeople(S)};}sc.people=PLG.ppl.fr;
  // сторож у ворот и рабочие, что беседуют у конторы
  sc.stand.push({x:L.gx+3.7,z:-4.7,yaw:Math.PI+0.3,look:4},{x:L.off.x0+4,z:-1.2,yaw:0.9,look:0},{x:L.off.x0+5.1,z:-0.6,yaw:-2.2,look:1},{x:L.gates[0][0]+4.5,z:3.4,yaw:2.8,look:2});
  out.sc=sc;}
function plgBuild(s){const out={},it=plgBuildGen(s,out);while(!it.next().done);return out.sc;}
function plgFree(sc){if(!sc||!G3.gl)return;[sc.lit,sc.bld,sc.bldSh,sc.leaf,sc.gnd,sc.sign].forEach(g3Free);if(sc.texLab)G3.gl.deleteTexture(sc.texLab);if(sc.train)sc.train.wag.forEach(w=>g3Free(w.m));}
/* ---------- пути: ломаная со скруглёнными углами, точка и направление по пройденному пути ---------- */
function plgPath(pts,rad){rad=rad===undefined?3.5:rad;const P=[pts[0]];
  for(let i=1;i<pts.length-1;i++){const A=pts[i-1],B=pts[i],C=pts[i+1],dA=Math.hypot(B[0]-A[0],B[1]-A[1])||1,dC=Math.hypot(C[0]-B[0],C[1]-B[1])||1,r=Math.min(rad,dA/2,dC/2);
    if(r<0.05){P.push(B);continue;}const a=[B[0]+(A[0]-B[0])*r/dA,B[1]+(A[1]-B[1])*r/dA],c=[B[0]+(C[0]-B[0])*r/dC,B[1]+(C[1]-B[1])*r/dC];
    for(let k=0;k<=6;k++){const t=k/6,u=1-t;P.push([u*u*a[0]+2*u*t*B[0]+t*t*c[0],u*u*a[1]+2*u*t*B[1]+t*t*c[1]]);}}
  P.push(pts[pts.length-1]);const S=[0];for(let i=1;i<P.length;i++)S.push(S[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));return {p:P,s:S,len:S[S.length-1]};}
function plgPos(pa,s){const S=pa.s,P=pa.p;s=clamp(s,0,pa.len);let lo=0,hi=S.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(S[m]<=s)lo=m;else hi=m;}
  const d=S[hi]-S[lo]||1,t=(s-S[lo])/d;return [P[lo][0]+(P[hi][0]-P[lo][0])*t,P[lo][1]+(P[hi][1]-P[lo][1])*t];}
function plgAt(pa,s,loop){const w=v=>loop?((v%pa.len)+pa.len)%pa.len:v,a=plgPos(pa,w(s-1)),b=plgPos(pa,w(s+1)),p=plgPos(pa,w(s)),dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;return [p[0],p[1],dx/l,dz/l];}
/* ---------- жизнь: машины из цеха, улица, грузовики, рабочие, поезд, дым ---------- */
const PLG_LANE={e:-11.8,w:-8.2};
function plgLaneZ(dir){const left=G&&G.country==='uk';return dir>0?(left?PLG_LANE.w:PLG_LANE.e):(left?PLG_LANE.e:PLG_LANE.w);}
function plgSpawn(sc,kind){const L=sc.L,r=Math.random,S=sc.S,yard=-1.3;
  if(kind==='roll'){// готовая машина из ворот цеха: на склад или за ворота
    const g=L.gates[Math.floor(r()*L.gates.length)],sp=sc.specs[Math.floor(r()*sc.specs.length)],toDep=S.st>0&&r()<0.45,dx=(L.dep.x0+L.dep.x1)/2;
    let pts,gateS=-1,dir=0,lz=0;if(toDep)pts=[[g[0],11],[g[0],yard],[dx,yard],[dx,12]];
    else{dir=r()<0.5?-1:1;lz=plgLaneZ(dir);pts=[[g[0],11],[g[0],yard],[L.gx,yard],[L.gx,lz],[dir*420,lz]];}
    const pa=plgPath(pts,3.6);if(!toDep){let best=1e9;for(let s2=0;s2<pa.len;s2+=0.5){const p=plgPos(pa,s2);if(Math.abs(p[0]-L.gx)<0.6&&Math.abs(p[1]+6)<best){best=Math.abs(p[1]+6);gateS=s2;}}}
    sc.cars.push({m:plgCar(sp,true),pa,s:0,v:0,vmax:toDep?3.2:4,street:toDep?0:1,gateS,spin:0,tdir:dir,tlz:lz});return;}
  if(kind==='street'){const dir=r()<0.5?-1:1,key=dir>0?'e':'w';if(sc.t<(sc.lane[key]||0))return;
    // повозки — у обочины (машины их обгоняют), машины — по своей полосе
    const cart=S.y<1920&&r()<(S.era===0?0.4:0.18),v=cart?3.2:S.era===0?7:S.era===1?9:11,lz=plgLaneZ(dir)+(cart?(plgLaneZ(dir)<-10?-1.5:1.1):0);sc.lane[key]=sc.t+(cart?1.5:4.5);
    const x0=cart?-dir*230:-dir*420,pa=plgPath([[x0,lz],[-x0,lz]],0);sc.cars.push(cart?{cart:1,pa,s:0,v,vmax:v,spin:0,dir,lz,cl:1}:{m:plgCar(plgStreetSpec(S.y,r),true),pa,s:0,v,vmax:v,spin:0,dir,lz});return;}
  if(kind==='truck'){// грузовик: привозит детали к цеху или увозит машины
    const g=L.gates[Math.floor(r()*L.gates.length)],dir=r()<0.5?-1:1,lz=plgLaneZ(-dir),sp=plgStreetSpec(Math.max(1909,S.y),()=>0.01);sp.style='truck';sp.b='b7';sp.key+='|t';
    const pa=plgPath([[dir*420,lz],[L.gx,lz],[L.gx,yard-1.2],[g[0]+1.2,yard-1.2],[g[0]+1.2,11]],3.6);sc.cars.push({m:plgCar(sp,true),pa,s:0,v:8,vmax:8,slowAt:pa.len-60,spin:0});return;}
  if(kind==='walk'){const D=L.doors.concat(L.gates.map(g=>[g[0]-1,g[1]])),a=D[Math.floor(r()*D.length)],gate=r()<0.3;let b=D[Math.floor(r()*D.length)];if(b===a&&!gate)return;
    const zl=-3.6+r()*2.4,pts=[[a[0],a[1]+1.4],[a[0],zl]];
    if(gate){const dir=r()<0.5?-1:1;pts.push([L.gx+0.8,zl],[L.gx+0.8,-6.3],[dir*260,-6.3]);}else pts.push([b[0]+(r()-0.5),zl],[b[0]+(r()-0.5)*0.6,b[1]+1.4]);
    if(r()<0.5&&gate)pts.reverse();
    sc.walk.push({pa:plgPath(pts,1.2),s:0,v:1.15+r()*0.35,look:Math.floor(r()*sc.people.length),ph:r()});}}
function plgUpdate(sc,dt){const S=sc.S,L=sc.L,G0=G;sc.t+=dt;
  const last=G0&&G0.last,cap=G0?Math.max(1,capEff(G0)):1,busy=last?clamp(last.made/cap,0,1):0.3,made=last?last.made:0;
  // выпуск: чем больше машин в месяц, тем чаще выкатываются новые
  sc.tSpawn.roll-=dt;if(sc.tSpawn.roll<=0){sc.tSpawn.roll=clamp(26/(1+Math.sqrt(made)/3),3.2,24)*(0.7+Math.random()*0.6);if(sc.cars.filter(c=>!c.loop).length<14&&made>0)plgSpawn(sc,'roll');}
  sc.tSpawn.street-=dt;if(sc.tSpawn.street<=0){sc.tSpawn.street=(S.era===0?7:S.era===1?4.5:3)*(0.6+Math.random()*0.9);plgSpawn(sc,'street');}
  if(S.y>=1909){sc.tSpawn.truck-=dt;if(sc.tSpawn.truck<=0){sc.tSpawn.truck=24+Math.random()*30;plgSpawn(sc,'truck');}}
  sc.tSpawn.walk-=dt;const nW=Math.min(12,4+S.h+(S.sz>0?2:0));if(sc.tSpawn.walk<=0&&sc.walk.length<nW){sc.tSpawn.walk=0.8+Math.random()*2.2;plgSpawn(sc,'walk');}
  // машины: разгон, у ворот на улицу — пропустить поток
  for(let i=sc.cars.length-1;i>=0;i--){const c=sc.cars[i];let tv=c.vmax;
    if(c.gateS>0&&c.s<c.gateS&&c.s>c.gateS-9){const busyLane=sc.cars.some(o=>o!==c&&o.lz!==undefined&&Math.abs(plgPos(o.pa,o.s)[0]-L.gx)<26);if(busyLane)tv=c.s>c.gateS-2.5?0:Math.min(tv,1.5);}
    if(c.slowAt&&c.s>c.slowAt)tv=Math.min(tv,3);
    if(c.gateS>0&&c.s>c.gateS+6){tv=S.era===0?7:S.era===1?9:11;if(c.lz===undefined&&c.s>c.gateS+9){c.lz=c.tlz;c.dir=c.tdir;}}
    // не наезжать на впереди идущую по той же полосе
    if(c.lz!==undefined){const p=plgPos(c.pa,c.s)[0];sc.cars.forEach(o=>{if(o===c||o.lz!==c.lz||o.dir!==c.dir)return;const q=plgPos(o.pa,o.s)[0],d=(q-p)*c.dir;if(d>0&&d<9)tv=Math.min(tv,o.v*0.9);});}
    c.v+=clamp(tv-c.v,-4*dt,2.2*dt);c.s+=c.v*dt;c.spin+=c.v*dt;
    if(c.loop){if(c.s>c.pa.len)c.s-=c.pa.len;}else if(c.s>=c.pa.len)sc.cars.splice(i,1);}
  for(let i=sc.walk.length-1;i>=0;i--){const w=sc.walk[i];w.s+=w.v*dt;if(w.s>=w.pa.len)sc.walk.splice(i,1);}
  // поезд: маневры туда-обратно с остановками
  if(sc.train){const T=sc.train;T.t+=dt;const ph=(T.t%48)/48,k=ph<0.3?sstep(0,0.3,ph):ph<0.5?1:ph<0.8?1-sstep(0.5,0.8,ph):0,mv=(ph<0.3||(ph>0.5&&ph<0.8));
    const zp=T.z;T.z=6+k*46;T.v=zp===undefined?0:(T.z-zp)/Math.max(dt,1e-3);
    if(mv&&T.ch&&Math.random()<dt*7)plgPart(sc,T.ch[0],T.ch[1],T.ch[2],0.3,1.8,-T.v*0.3,1.0,4.2,3.2,[236,236,236],0.5);}
  // дым: гуще при полной загрузке; литейка — темнее; вдали — чужие заводы
  const wind=[1.5,0,0.6];sc.emit.forEach(e=>{const rate=(0.7+busy*1.9)*e.k*(e.k<1?0.6:1);e.acc+=dt*rate;
    while(e.acc>1){e.acc-=1;const dark=e.k>=2?0.36:e.k<1?0.62:0.5,g=Math.round(220*dark);plgPart(sc,e.p[0]+(Math.random()-0.5)*0.8,e.p[1]+0.4,e.p[2]+(Math.random()-0.5)*0.8,wind[0]*0.4,1.8+Math.random()*0.9,wind[2]*0.4,2.2*Math.max(1,e.k*0.8),10+Math.random()*4,13+Math.random()*5,[g,Math.round(g*0.97),Math.round(g*0.94)],0.62+0.25*busy);}});
  const P=sc.parts;for(let i=P.length-1;i>=0;i--){const p=P[i];p.life-=dt;if(p.life<=0){P.splice(i,1);continue;}p.vx+=(wind[0]-p.vx)*dt*0.25;p.vz+=(wind[2]-p.vz)*dt*0.25;p.vy*=1-dt*0.12;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;}}
function plgPart(sc,x,y,z,vx,vy,vz,size,grow,life,col,a){const P=sc.parts;if(P.length>420)P.shift();P.push({x,y,z,vx,vy,vz,s:size,g:grow,life,max:life,c:col,a});}
/* ---------- свет, камера, кадр ---------- */
function plgMood(S){if(S.war)return 'overcast';const r=mulberry32(hashStr('plm|'+S.y+'|'+S.sea+'|'+S.c))();
  if(S.sea==='w')return r<0.5?'overcast':'cloudy';if(S.sea==='a')return r<0.3?'overcast':r<0.65?'cloudy':'evening';return r<0.45?'clear':r<0.82?'cloudy':'morning';}
function plgEnv(S,mood){const host=SCEN_SETS[S.c]?S.c:'other';let E=null;
  try{E=r3dEnvPhoto({cfg:{host,terr:S.sea==='w'?'snow':'dirt'}},{mood,rain:false,az:Math.PI+0.72});}catch(e){E=null;}
  if(!E)E={sun:v3n([-0.5,0.62,-0.6]),sunC:[1.9,1.78,1.55],skyC:[0.36,0.42,0.5],gndC:[0.08,0.08,0.06],hzC:[0.62,0.68,0.74],zeC:[0.3,0.42,0.6],fogS:[0.9,0.86,0.78],fogD:0.0011,exp:0.95,night:0,hl:0,lamp:0,envRot:0,envK:0.6};
  E=Object.assign({},E);E.fogD=Math.max(E.fogD,0.00055);if(S.war){E.sunC=E.sunC.map(v=>v*0.8);E.fogD*=1.3;}
  E.lamp=mood==='evening'?0.12:S.sea==='w'&&mood==='overcast'?0.08:0;return E;}
// Кадр: вся территория с улицей внизу и полосой неба наверху — подбираем расстояние и точку, на которую смотрим
function plgFrameCam(sc,asp){const L=sc.L,pts=[];L.it.forEach(({M,k})=>{const f=M.foot;if(!f||k==='fence'||k==='rd'||k==='team')return;[[f[0],f[2]],[f[1],f[2]],[f[0],f[3]],[f[1],f[3]]].forEach(([x,z])=>pts.push([x,0,z]));});
  sc.L.chim.forEach(c=>pts.push([c.p[0],c.p[1]*0.7,c.p[2]]));pts.push([L.off.x0,0,-10],[L.lot.x1,0,-10]);if(L.track)pts.push([L.track.cx,0,L.track.cz]);
  const yaw=2.74,pit=0.27,fov=0.62,tv=Math.tan(fov/2),th=tv*asp,V=m4(),P=m4(),VP=m4(),fh=[-Math.sin(yaw),0,-Math.cos(yaw)],rh=[fh[2],0,-fh[0]];
  // рамка при расстоянии d и точке C: границы проекции всех точек
  const bounds=(C,d)=>{const eye=[C[0]+Math.sin(yaw)*Math.cos(pit)*d,Math.sin(pit)*d,C[2]+Math.cos(yaw)*Math.cos(pit)*d],fw=v3n([C[0]-eye[0],-eye[1],C[2]-eye[2]]),rt=v3n(v3x([0,1,0],fw)),up=v3x(fw,rt);
    m4view(V,eye,rt,up,fw);m4persp(P,fov,asp,2,8000);m4mul(VP,P,V);let x0=9,x1=-9,y0=9,y1=-9;
    pts.forEach(q=>{const cx=VP[0]*q[0]+VP[4]*q[1]+VP[8]*q[2]+VP[12],cy=VP[1]*q[0]+VP[5]*q[1]+VP[9]*q[2]+VP[13],cw=VP[3]*q[0]+VP[7]*q[1]+VP[11]*q[2]+VP[15];if(cw<=0.1)return;const u=cx/cw,v=cy/cw;x0=Math.min(x0,u);x1=Math.max(x1,u);y0=Math.min(y0,v);y1=Math.max(y1,v);});return [x0,x1,y0,y1];};
  // при заданном расстоянии — сдвигаем точку взгляда, пока середина кадра не встанет на место (низ — улица, верх — небо)
  const centre=d=>{let C=[(L.X0+L.X1)/2,0,(L.zMax-15)/2],b;for(let i=0;i<10;i++){b=bounds(C,d);const ux=(b[0]+b[1])/2,uy=(b[2]+b[3])/2+0.12;
      C=[C[0]+rh[0]*ux*d*th*0.5+fh[0]*uy*d*tv/Math.sin(pit)*0.5,0,C[2]+rh[2]*ux*d*th*0.5+fh[2]*uy*d*tv/Math.sin(pit)*0.5];}return {C,b:bounds(C,d)};};
  let lo=40,hi=900,best=null;for(let i=0;i<16;i++){const d=(lo+hi)/2,r=centre(d),k=Math.max((r.b[1]-r.b[0])/1.96,(r.b[3]-r.b[2])/1.7);if(k>1)lo=d;else{hi=d;best={c:r.C,d};}}
  if(!best){const r=centre(hi);best={c:r.C,d:hi};}
  return {c:best.c,d:best.d,yaw,pit,fov};}
function plgUse(name,W,H){const gl=G3.gl,P=G3.P[name],u=P.u,E=PLG.E;gl.useProgram(P.p);
  gl.uniformMatrix4fv(u.u_vp,false,PLG.VP);if(u.u_shm)gl.uniformMatrix4fv(u.u_shm,false,PLG.SHM);
  gl.uniform3fv(u.u_sun,E.sun);gl.uniform3fv(u.u_sunC,E.sunC);gl.uniform3fv(u.u_skyC,E.skyC);gl.uniform3fv(u.u_gndC,E.gndC);gl.uniform3fv(u.u_hzC,E.hzC);gl.uniform3fv(u.u_zeC,E.zeC);gl.uniform3fv(u.u_fogS,E.fogS);
  gl.uniform3fv(u.u_cam,PLG.eye);gl.uniform1f(u.u_fogD,E.fogD);gl.uniform1f(u.u_exp,E.exp);gl.uniform1f(u.u_time,PLG.t);gl.uniform1f(u.u_vig,0.28);gl.uniform2f(u.u_res,W,H);
  if(u.u_mat)gl.uniform4fv(u.u_mat,MPAR);
  if(u.u_sh){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,G3.sh);gl.uniform1i(u.u_sh,0);gl.uniform3f(u.u_shI,1.2/G3.shS,PLG.shOn?1:0,0);}
  if(u.u_hl)gl.uniform1f(u.u_hl,0);if(u.u_lamp)gl.uniform4f(u.u_lamp,0,0,E.lamp||0,0);if(u.u_dark)gl.uniform1f(u.u_dark,0);if(u.u_dirt)gl.uniform4f(u.u_dirt,0,0,0,0);
  if(u.u_envR)gl.uniform4f(u.u_envR,E.envRot||0,E.envK===undefined?0.78:E.envK,PLG.sky?PLG.sky.lv-1:0,PLG.sky?1:0);
  if(u.u_lay){const tx=G3.cache.tx;if(tx){gl.uniform4fv(u.u_lay,tx.lay);gl.uniform4fv(u.u_lavg,tx.avg);}}
  if(u.u_tq)gl.uniform4f(u.u_tq,gq().nrm?1:0,0,1,1);
  return P;}
function plgCarU(P,c,m,M){const gl=G3.gl;gl.uniformMatrix4fv(P.u.u_model,false,M);gl.uniform4fv(P.u.u_wc,m.wc);gl.uniform4f(P.u.u_wr,c?c.spin:0,0,0,0);gl.uniform4f(P.u.u_body,0,0,c&&c.v>0.3?(vnz(c.spin*0.9,0.5,3)-0.5)*0.02:0,m.pivot);if(P.u.u_dirt)gl.uniform4f(P.u.u_dirt,0,0,0,0);}
// Все, что рисуется: [сетка, матрица] для машин, людей, поезда (тень и кадр — одним списком)
function plgDyn(sc){const cars=[],ppl=[],lits=[],M=()=>new Float32Array(16),bas=(x,y,z,fx,fz)=>{const m=M(),fw=[fx,0,fz],rt=[fz,0,-fx];m4basis(m,rt,[0,1,0],fw,[x,y,z]);return m;};
  sc.park.forEach(p=>cars.push({m:p.m,M:bas(p.x,0.025,p.z,Math.sin(p.yaw),Math.cos(p.yaw)),c:null}));
  sc.cars.forEach(c=>{const a=plgAt(c.pa,c.s,c.loop),y=c.loop?0.04:0.03;if(c.cart){lits.push({g:plgCart(),M:bas(a[0],y,a[1],a[2],a[3])});return;}cars.push({m:c.m,M:bas(a[0],y,a[1],a[2],a[3]),c});});
  sc.walk.forEach(w=>{const a=plgAt(w.pa,w.s),fr=Math.floor(((w.s/1.5+w.ph)%1)*4);ppl.push({g:sc.people[w.look%sc.people.length][fr],M:bas(a[0],0.03,a[1],a[2],a[3])});});
  sc.stand.forEach(p=>ppl.push({g:sc.people[p.look%sc.people.length][4],M:bas(p.x,0.03,p.z,Math.sin(p.yaw),Math.cos(p.yaw))}));
  if(sc.train){const T=sc.train,x=sc.L.railX;let z=(T.z||6)+40;[...T.wag,{m:T.tender.m,len:5.4},{m:T.loco.m,len:9.2,loco:1}].forEach(c=>{const zc=z-c.len/2;lits.push({g:c.m,M:bas(x,0.36,zc,0,-1)});if(c.loco)T.ch=[x,4.4,zc-2.85];z-=c.len+0.6;});}
  return {cars,ppl,lits};}
function plgCart(){const C=G3.cache;if(!C.plgCart){const mb=new MB();mb.add(pProp('cart',0),X3(0,1,[0,0,0]));C.plgCart=g3Mesh(mb);}return C.plgCart;}
function plgDraw(W,H){const gl=G3.gl,sc=PLG.sc,E=PLG.E,C=G3.cache;
  const cam=sc.cam,yaw=cam.yaw+PLG.yaw,pit=clamp(cam.pit+PLG.pit,0.1,0.75),d=cam.d*(1-PLG.zoom*0.62),tg=sc.cam.c;
  const eye=[tg[0]+Math.sin(yaw)*Math.cos(pit)*d,Math.sin(pit)*d,tg[2]+Math.cos(yaw)*Math.cos(pit)*d],fw=v3n([tg[0]-eye[0],-eye[1],tg[2]-eye[2]]),rt=v3n(v3x([0,1,0],fw)),up=v3x(fw,rt);
  const V=m4(),P=m4();m4view(V,eye,rt,up,fw);m4persp(P,cam.fov,W/H,2,9000);PLG.VP=PLG.VP||m4();m4mul(PLG.VP,P,V);PLG.eye=eye;
  gl.disable(gl.SCISSOR_TEST);gl.disable(gl.SAMPLE_ALPHA_TO_COVERAGE);gl.colorMask(true,true,true,true);
  const dyn=plgDyn(sc);texBind(PLG.sky);gl.activeTexture(gl.TEXTURE6);gl.bindTexture(gl.TEXTURE_2D,G3.dum2);gl.activeTexture(gl.TEXTURE7);gl.bindTexture(gl.TEXTURE_2D,PLG.clr||(PLG.clr=plgClearTex()));gl.activeTexture(gl.TEXTURE0);
  // тень солнца: квадрат над всем заводом
  PLG.shOn=!!G3.shFB&&E.sun[1]>0.1;PLG.SHM=PLG.SHM||m4();
  if(PLG.shOn){const L=sc.L,c=[(L.X0+L.X1)/2,0,(L.zMax-10)/2],Sz=Math.max(L.X1-L.X0,L.zMax+20)*0.62,f=[-E.sun[0],-E.sun[1],-E.sun[2]],srt=v3n(v3x([0,1,0],f)),sup=v3x(f,srt),se=[c[0]-f[0]*300,c[1]-f[1]*300,c[2]-f[2]*300],SV=m4(),SP=m4();
    m4view(SV,se,srt,sup,f);m4ortho(SP,-Sz,Sz,-Sz,Sz,1,700);m4mul(PLG.SHM,SP,SV);
    gl.bindFramebuffer(gl.FRAMEBUFFER,G3.shFB);gl.viewport(0,0,G3.shS,G3.shS);gl.clear(gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.disable(gl.CULL_FACE);gl.disable(gl.BLEND);gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(2.5,6);
    let Pd=G3.P.dLit;gl.useProgram(Pd.p);gl.uniformMatrix4fv(Pd.u.u_vp,false,PLG.SHM);gl.uniform1f(Pd.u.u_time,PLG.t);gl.uniform4fv(Pd.u.u_mat,MPAR);gl.uniformMatrix4fv(Pd.u.u_model,false,m4());g3Draw(sc.bldSh);g3Draw(sc.lit);
    dyn.ppl.concat(dyn.lits).forEach(o=>{gl.uniformMatrix4fv(Pd.u.u_model,false,o.M);g3Draw(o.g);});
    Pd=G3.P.dLeaf;gl.useProgram(Pd.p);gl.uniformMatrix4fv(Pd.u.u_vp,false,PLG.SHM);gl.uniform1f(Pd.u.u_time,PLG.t);gl.uniform4fv(Pd.u.u_mat,MPAR);gl.uniformMatrix4fv(Pd.u.u_model,false,m4());
    gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,C.tx.fol);gl.activeTexture(gl.TEXTURE0);g3Draw(sc.leaf);
    Pd=G3.P.dCar;gl.useProgram(Pd.p);gl.uniformMatrix4fv(Pd.u.u_vp,false,PLG.SHM);gl.uniform4fv(Pd.u.u_mat,MPAR);dyn.cars.forEach(o=>{plgCarU(Pd,o.c,o.m,o.M);g3Draw(o.m.op);});
    gl.disable(gl.POLYGON_OFFSET_FILL);}
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,W,H);gl.clearColor(0.6,0.66,0.72,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.disable(gl.BLEND);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);
  let Pp=plgUse('car',W,H);dyn.cars.forEach(o=>{plgCarU(Pp,o.c,o.m,o.M);g3Draw(o.m.op);});
  gl.disable(gl.CULL_FACE);
  Pp=plgUse('lit',W,H);gl.uniformMatrix4fv(Pp.u.u_model,false,m4());g3Draw(sc.bld);g3Draw(sc.lit);g3Draw(sc.gnd);
  dyn.ppl.concat(dyn.lits).forEach(o=>{gl.uniformMatrix4fv(Pp.u.u_model,false,o.M);g3Draw(o.g);});
  Pp=plgUse('leaf',W,H);gl.uniformMatrix4fv(Pp.u.u_model,false,m4());gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,C.tx.fol);gl.activeTexture(gl.TEXTURE0);
  gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE);g3Draw(sc.leaf);gl.disable(gl.SAMPLE_ALPHA_TO_COVERAGE);
  // надписи на фасадах
  if(sc.sign){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(-1,-2);Pp=plgUse('tex',W,H);gl.uniformMatrix4fv(Pp.u.u_model,false,m4());
    gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,sc.texLab);gl.uniform1i(Pp.u.u_tex,1);gl.activeTexture(gl.TEXTURE0);g3Draw(sc.sign);gl.disable(gl.POLYGON_OFFSET_FILL);gl.disable(gl.BLEND);}
  // небо
  gl.depthMask(false);Pp=plgUse('sky',W,H);const IV=PLG.IV||(PLG.IV=m4());m4inv(IV,PLG.VP);gl.uniformMatrix4fv(Pp.u.u_ivp,false,IV);gl.uniform1f(Pp.u.u_night,0);gl.uniform4f(Pp.u.u_panR,-0.012,0.16,2,0);
  gl.bindVertexArray(G3.full.vao);gl.drawArrays(gl.TRIANGLES,0,3);gl.depthMask(true);
  // стёкла машин
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);Pp=plgUse('car',W,H);dyn.cars.forEach(o=>{if(!o.m.gl)return;plgCarU(Pp,o.c,o.m,o.M);g3Draw(o.m.gl);});gl.depthMask(true);
  // дым
  const Pt=sc.parts;if(Pt.length){const I=PLG.partI||(PLG.partI=g3Inst(440,2,G3.quadC)),dd=I.data,e=eye,Ls=Pt.map(p=>[(p.x-e[0])**2+(p.y-e[1])**2+(p.z-e[2])**2,p]).sort((a,b)=>b[0]-a[0]);let n=0;
    for(const [,p] of Ls){if(n>=I.max)break;const k=1-p.life/p.max,o=n*8;dd[o]=p.x;dd[o+1]=p.y;dd[o+2]=p.z;dd[o+3]=p.s+p.g*k;dd[o+4]=p.c[0]/255;dd[o+5]=p.c[1]/255;dd[o+6]=p.c[2]/255;dd[o+7]=p.a*(1-k)*Math.min(1,k*6+0.2);n++;}
    Pp=plgUse('part',W,H);gl.uniform3fv(Pp.u.u_camR,rt);gl.uniform3fv(Pp.u.u_camU,up);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,C.puff||(C.puff=g3Tex(r3dPuff(),{cs:true,ct:true})));gl.uniform1i(Pp.u.u_tex,1);gl.activeTexture(gl.TEXTURE0);
    gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);g3InstDraw(I,n);gl.depthMask(true);}
  gl.disable(gl.BLEND);gl.bindVertexArray(null);}
function plgClearTex(){const gl=G3.gl,t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,0]));gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);return t;}
/* ---------- на странице: холст, цикл кадров (только когда виден), жесты ---------- */
function plgCanvas(){if(PLG.cv)return PLG.cv;const cv=document.createElement('canvas');cv.className='pl-live';PLG.cv=cv;PLG.g=cv.getContext('2d');
  cv.addEventListener('pointerdown',e=>{PLG.ptr.set(e.pointerId,[e.clientX,e.clientY]);try{cv.setPointerCapture(e.pointerId);}catch(_){}PLG.pinch=null;});
  cv.addEventListener('pointermove',e=>{const p=PLG.ptr.get(e.pointerId);if(!p)return;const dx=e.clientX-p[0],dy=e.clientY-p[1];PLG.ptr.set(e.pointerId,[e.clientX,e.clientY]);
    if(PLG.ptr.size>=2){const a=[...PLG.ptr.values()],dd=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);if(PLG.pinch)PLG.zoom=clamp(PLG.zoom+(dd-PLG.pinch)/300,0,1);PLG.pinch=dd;return;}
    PLG.yaw=clamp(PLG.yaw-dx*0.006,-1.1,1.1);if(e.pointerType==='mouse')PLG.pit=clamp(PLG.pit+dy*0.003,-0.14,0.4);PLG.kick=performance.now();});
  const up=e=>{PLG.ptr.delete(e.pointerId);if(PLG.ptr.size<2)PLG.pinch=null;};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  cv.addEventListener('wheel',e=>{if(!e.ctrlKey&&Math.abs(e.deltaY)<Math.abs(e.deltaX))return;e.preventDefault();PLG.zoom=clamp(PLG.zoom-e.deltaY*0.0015,0,1);},{passive:false});
  cv.addEventListener('dblclick',()=>{PLG.yaw=0;PLG.pit=0;PLG.zoom=0;});
  if('IntersectionObserver' in window){PLG.io=new IntersectionObserver(es=>{es.forEach(en=>{PLG.onScr=en.isIntersecting;});if(PLG.onScr)plgLoop();});PLG.io.observe(cv);}
  // спит, когда на неё не смотрят: вкладка скрыта или 2 минуты ни одного касания; любое касание будит
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){PLG.kick=performance.now();plgLoop();}});
  ['pointerdown','keydown','wheel','touchstart','scroll'].forEach(ev=>window.addEventListener(ev,()=>{PLG.kick=performance.now();if(!PLG.raf&&PLG.cv&&PLG.cv.isConnected)plgLoop();},{passive:true,capture:true}));
  return cv;}
// Вызывается после отрисовки раздела «Завод»: холст — в рамку, загрузка фото-материалов, сборка сцены
function plgMount(){if(!plgOK())return;const box=document.getElementById('plantBox');if(!box||!G)return;const cv=plgCanvas();if(cv.parentNode!==box)box.appendChild(cv);
  if(PLG.ready){box.classList.add('live');plgHint(box);}PLG.kick=performance.now();PLG.want=plgKey(G);plgPrepare();plgLoop();}
// Подсказка один раз: сцену можно осмотреть
function plgHint(box){try{if(AU.on.plgHint)return;AU.on.plgHint=1;localStorage.setItem('avt-audio',JSON.stringify(AU.on));}catch(e){return;}const h=document.createElement('div');h.className='pl-hint';h.textContent='Проведите пальцем — осмотреть завод; двумя пальцами — приблизить';box.appendChild(h);setTimeout(()=>h.remove(),5200);}
function plgPrepare(){if(PLG.busy)return;const gl=stuGL();if(!gl)return;const S=plantState(G),mood=plgMood(S);
  if(PLG.gl!==gl){PLG.gl=gl;PLG.sc=null;PLG.sky=null;PLG.carM.clear();PLG.ppl=null;PLG.partI=null;PLG.clr=null;PLG.ready=false;}
  // фото-материалы те же, что у гонки (сменили качество — загружаются заново, небо тоже)
  if(!(G3.cache.tx&&TX.st===2&&PLG.sky&&PLG.mood===mood&&PLG.skyTx===G3.cache.tx&&G3.cache.tx.sky[mood]===PLG.sky)){PLG.busy=true;PLG.sky=null;
    texUpload().then(()=>texSky(mood)).then(sky=>{PLG.sky=sky;PLG.skyTx=G3.cache.tx;PLG.mood=mood;PLG.busy=false;if(PLG.sc)PLG.E=plgEnv(PLG.sc.S,mood);plgPrepare();plgLoop();}).catch(e=>{console.warn('plant tex',e);PLG.busy=false;PLG.fail++;});return;}
  if(PLG.sc&&PLG.sc.key===PLG.want)return;
  // сборка — по частям в свободные минуты: кнопка «Следующий месяц» не задерживается
  PLG.busy=true;const out={},it=plgBuildGen(G,out),t0=performance.now();let warm=0;
  const step=()=>{try{if(!out.sc){it.next();setTimeout(step,0);return;}
      const sc=out.sc;// тёплый старт: сцена уже «живёт» — дым поднялся, машины на ходу
      if(warm<60){for(let k=0;k<30;k++,warm++)plgUpdate(sc,0.25);setTimeout(step,0);return;}
      sc.cam=plgFrameCam(sc,PLG.asp||2.18);const old=PLG.sc;PLG.sc=sc;plgFree(old);PLG.E=plgEnv(sc.S,PLG.mood);PLG.build=performance.now()-t0;}
    catch(e){console.warn('plant scene',e);PLG.fail++;}PLG.busy=false;plgLoop();if(PLG.want!==(PLG.sc&&PLG.sc.key))plgPrepare();};
  setTimeout(step,30);}
function plgLoop(){if(PLG.raf)return;PLG.raf=requestAnimationFrame(plgTick);}
function plgTick(now){PLG.raf=0;const cv=PLG.cv;if(!cv||!cv.isConnected||!plgOK()||document.hidden)return;if(typeof R!=='undefined'&&R&&!R.done)return;
  if(!PLG.onScr||(PLG.ready&&now-(PLG.kick||now)>120000)){PLG.last=0;return;}
  const dt=Math.min(0.1,PLG.last?(now-PLG.last)/1000:0.016);
  // не чаще ~30 кадров в секунду: сцене хватает, батарея целее
  if(PLG.last&&now-PLG.last<31){PLG.raf=requestAnimationFrame(plgTick);return;}
  PLG.last=now;const sc=PLG.sc;
  if(sc&&PLG.E&&PLG.sky&&G3.cache.tx){const gl=stuGL();if(!gl){PLG.raf=requestAnimationFrame(plgTick);return;}
    const cw=cv.clientWidth,ch=cv.clientHeight;if(cw>10&&ch>10){const dpr=Math.min(2,window.devicePixelRatio||1)*PLG.scale,W=Math.round(cw*dpr),H=Math.round(ch*dpr);
      if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}PLG.asp=cw/ch;const gc=G3.cv;if(gc.width!==W||gc.height!==H){gc.width=W;gc.height=H;}
      try{PLG.t+=dt;plgUpdate(sc,dt);plgDraw(W,H);PLG.g.drawImage(gc,0,0);PLG.frames++;
        if(!PLG.ready){PLG.ready=true;const box=document.getElementById('plantBox');if(box){box.classList.add('live');plgHint(box);}}}catch(e){console.warn('plant frame',e);PLG.fail++;}
      // медленный телефон (кадры идут реже 22 в секунду) — картинка помельче; быстрый — снова чётче
      PLG.ms=PLG.ms*0.9+Math.min(200,dt*1000)*0.1;if(PLG.frames>20&&PLG.ms>46&&PLG.scale>0.55){PLG.scale=Math.max(0.55,PLG.scale*0.85);PLG.ms=33;}else if(PLG.ms<35&&PLG.scale<1&&PLG.frames%60===0){PLG.scale=Math.min(1,PLG.scale*1.08);}}}
  PLG.raf=requestAnimationFrame(plgTick);}
// Кадр для кинохроники и газеты (тот же вид, что в разделе «Завод»)
function plgStill(s){if(!PLG.ready||!PLG.cv||!PLG.sc||PLG.sc.key!==plgKey(s)||!PLG.cv.width)return null;const k=PLG.sc.key;let u=PLG.stills.get(k);if(u)return u;
  try{u=PLG.cv.toDataURL('image/jpeg',0.86);}catch(e){return null;}if(PLG.stills.size>4)PLG.stills.delete(PLG.stills.keys().next().value);PLG.stills.set(k,u);return u;}
