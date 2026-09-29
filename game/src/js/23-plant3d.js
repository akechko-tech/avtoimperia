/* ================= ЗАВОД ОБЪЁМОМ: картинка завода в 3D — растёт вместе с компанией ================= */
// Каждое здание — объёмная модель (как дома у трассы), нарисованная в одном ракурсе; вместе — вид на завод с улицы.
// Цеха прибавляются с мощностью, конвейер — длинный цех с пилообразной крышей, склад растёт с местами, КБ — от сарая до института,
// гоночный отдел — испытательный трек за цехами; на площадке — готовые машины ваших цветов, зимой — снег на крышах.
const PLANT3D=new Map();
function plantState(s){const capE=capEff(s),halls=clamp(Math.round(1+Math.log10(Math.max(1,capE))*1.3),1,7),stock=whStock(s),m=s.m;
  return {h:halls,cv:techLv(s,'line')>=2?1:0,era:s.y<1906?0:s.y<1918?1:2,sea:m===11||m<=1?'w':m>=8&&m<=10?'a':'s',war:econ(s.y,s.m,s.country).war?1:0,
    wh:clamp(Math.round(Math.log2(Math.max(12,s.wh||12)/12)),0,6),rd:s.rd?s.rd.lvl:1,team:s.rdept||0,el:techLv(s,'elec'),fo:techLv(s,'foundry'),pr:techLv(s,'press'),
    pa:[...new Set(s.models.filter(x=>x.status==='prod'||x.status==='sale').map(x=>x.paint||'#1b1d22'))].slice(0,3),tr:s.models.some(x=>x.status==='prod'&&isTruck(x))?1:0,
    st:stock<=0?0:stock<5?1:stock<30?2:stock<200?3:4,sz:['Мастерская','Фабрика','Концерн','Автоимперия'].indexOf(rank(companyValue(s))),co:s.company,c:s.country,y:s.y};}
// Сдвинуть модель целиком (грани, рисунок на них, пятно тени)
function mShift(M,dx,dy,dz){const sh=q=>[q[0]+dx,q[1]+dy,q[2]+dz];
  M.F.forEach(f=>{f.p=f.p.map(sh);if(f.deco)f.deco.forEach(d=>{['a','b','dot'].forEach(k=>{if(d[k])d[k]=sh(d[k]);});if(d.poly)d.poly=d.poly.map(sh);if(d.at)d.at=d.at.map(sh);if(d.ring)d.ring=[d.ring[0]+dx,d.ring[1]+dy,d.ring[2]+dz,d.ring[3]];});});
  if(M.foot)M.foot=[M.foot[0]+dx,M.foot[1]+dx,M.foot[2]+dz,M.foot[3]+dz];return M;}
// Двускатная крыша, конёк вдоль z: фронтон смотрит на улицу
function pGable(M,x0,x1,z0,z1,H,rh,ov,col,wall){const xm=(x0+x1)/2,yR=H+rh,X0=x0-ov,X1=x1+ov,yE=H-ov*rh/((x1-x0)/2),Z0=z0-ov*0.6,Z1=z1+ov*0.6,ctr=[xm,H,(z0+z1)/2];
  [X0,X1].forEach(xs=>{const f=mFace(M,[[xs,yE,Z0],[xm,yR,Z0],[xm,yR,Z1],[xs,yE,Z1]],col,'roof',ctr);f.deco=[];for(let k=1;k<7;k++){const t=k/7,x=xs+(xm-xs)*t,y=yE+(yR-yE)*t;f.deco.push({a:[x,y,Z0],b:[x,y,Z1],w:0.06,c:shade(col,-0.25)});}});
  [z0,z1].forEach(zz=>mFace(M,[[x0,H,zz],[x1,H,zz],[xm,yR-0.02,zz]],wall,'wall',ctr));}
// Пилообразная крыша конвейерного цеха: скаты и остеклённые «зубья»
function pSaw(M,x0,x1,z0,z1,H,col,wall){const n=Math.max(2,Math.round((x1-x0)/5)),w=(x1-x0)/n,th=2.4;
  for(let i=0;i<n;i++){const xa=x0+i*w,xb=xa+w,c=[(xa+xb)/2,H,(z0+z1)/2];const f=mFace(M,[[xa,H,z0-0.3],[xb,H+th,z0-0.3],[xb,H+th,z1+0.3],[xa,H,z1+0.3]],col,'roof',[c[0],H-1,c[2]]);
    f.deco=[{a:[(xa+xb)/2,H+th/2,z0-0.3],b:[(xa+xb)/2,H+th/2,z1+0.3],w:0.05,c:shade(col,-0.25)}];
    const gl=mFace(M,[[xb,H,z0-0.3],[xb,H+th,z0-0.3],[xb,H+th,z1+0.3],[xb,H,z1+0.3]],'#8fb0c4','glass',[xa,H+th/2,c[2]]);gl.deco=[];for(let z=z0+1.2;z<z1;z+=1.6)gl.deco.push({a:[xb+0.02,H,z],b:[xb+0.02,H+th,z],w:0.05,c:'#4a4c50'});
    mFace(M,[[xa,H,z0-0.3],[xb,H,z0-0.3],[xb,H+th,z0-0.3]],wall,'wall',[c[0],H,z1]);}}
// Ряд окон на фасаде (P(u,v) — точка стены)
function pWins(f,P,u0,u1,step,v,w,h,o){for(let u=u0;u<=u1+0.01;u+=step)wWin(f,P,u,v,w,h,o);}
// Цех: кирпич (потом бетон), высокие арочные окна, ворота; фронтон на улицу
function pHall(x0,x1,z0,z1,H,S,o){o=o||{};const M=new Mesh(),wall=S.era===2?'#b9b4aa':o.wall||'#9a4e3a',roof=S.sea==='w'?'#e6ecf0':S.era===2?'#6d737b':'#5d4a42',glass=o.glass||'#39495a';
  const W=mBox(M,x0,0,z0,x1,H,z1,wall,'wall',['d','t']),F=(u,v)=>[u,v,z0-0.012],Rt=(u,v)=>[x1+0.012,v,u];
  const bw=x1-x0,n=Math.max(1,Math.round(bw/2.6));pWins(W.b,F,x0+bw/(n+1),x1-bw/(n+1)+0.01,bw/(n+1),1.6,1.1,H-3.6,{arch:S.era<2,glass,frame:S.era===2?'#d8d6d0':'#e6dcc6'});
  pWins(W.r,Rt,z0+1.6,z1-1.4,2.3,1.6,1.1,H-3.6,{arch:S.era<2,glass,frame:S.era===2?'#d8d6d0':'#e6dcc6'});
  wDoor(W.b,F,(x0+x1)/2,Math.min(3.4,bw*0.3),Math.min(3.8,H-1.5),S.era===2?'#4a5058':'#4a3a30');
  if(S.era<2){W.b.deco.push({a:F(x0,H-0.35),b:F(x1,H-0.35),w:0.22,c:shade(wall,-0.2)});W.r.deco.push({a:Rt(z0,H-0.35),b:Rt(z1,H-0.35),w:0.22,c:shade(wall,-0.2)});}
  if(o.saw)pSaw(M,x0,x1,z0,z1,H,roof,wall);else pGable(M,x0,x1,z0,z1,H,S.era===2?2.2:3.2,0.45,roof,wall);
  if(o.sign){const sw=Math.min(bw*0.8,o.sign.length*1.0+1),sx=(x0+x1)/2,sy=H+0.1,sb=mBox(M,sx-sw/2,sy,z0-0.2,sx+sw/2,sy+1.3,z0-0.05,'#1f2a36','paint');
    sb.b.deco=[{text:o.sign,at:[[sx-sw/2+0.1,sy+0.1,z0-0.215],[sx+sw/2-0.1,sy+0.1,z0-0.215],[sx-sw/2+0.1,sy+1.2,z0-0.215]],w:sw-0.2,h:1.1,c:'#e8c56a',font:'bold 0.8px Impact,sans-serif'}];}
  M.foot=[x0-0.6,x1+1.4,z0-0.6,z1+0.6];return M;}
// Труба: кирпичная, с поясками и оголовком
function pChimney(x,z,h,r,S){const M=new Mesh(),col=S.era===2?'#8a8580':'#8a3f2c';mBox(M,x-r,0,z-r,x+r,h*0.35,z+r,col,'wall',['d']);const t=mBox(M,x-r*0.8,h*0.35,z-r*0.8,x+r*0.8,h,z+r*0.8,col,'wall',['d']);
  mBox(M,x-r,h,z-r,x+r,h+0.7,z+r,shade(col,-0.25),'matte',['d']);[0.5,0.7,0.9].forEach(k=>{t.b.deco=t.b.deco||[];t.b.deco.push({a:[x-r*0.8,h*k,z-r*0.8-0.01],b:[x+r*0.8,h*k,z-r*0.8-0.01],w:0.18,c:shade(col,-0.3)});});
  M.foot=[x-r-0.5,x+r+2,z-r-0.5,z+r+0.5];return {M,top:[x,h+0.8,z]};}
// Контора с часами на башенке и вывеской компании
function pOffice(x0,z0,S){const M=new Mesh(),fl=[1,2,3,4][Math.max(0,S.sz)],L=10+fl*3,D=9,H=fl*3.4+0.6,wall=S.era===2?'#d8d0c0':'#b7654a',x1=x0+L,z1=z0+D,roof=S.sea==='w'?'#e6ecf0':'#4f5660';
  const W=mBox(M,x0,0,z0,x1,H,z1,wall,'wall',['d','t']),F=(u,v)=>[u,v,z0-0.012],Rt=(u,v)=>[x1+0.012,v,u];
  for(let f=0;f<fl;f++)pWins(W.b,F,x0+1.6,x1-1.6,(L-3.2)/Math.max(1,Math.round((L-3.2)/2.2)),0.9+f*3.4,1.0,1.7,{frame:'#efe6d2',glass:'#34465a'});
  for(let f=0;f<fl;f++)pWins(W.r,Rt,z0+1.8,z1-1.8,2.6,0.9+f*3.4,1.0,1.7,{frame:'#efe6d2'});
  wDoor(W.b,F,x0+L/2,1.6,2.6,'#4a3424',{arch:1});
  mBox(M,x0-0.3,H,z0-0.3,x1+0.3,H+0.35,z1+0.3,shade(wall,-0.25),'matte',['d']);
  // скатная крыша-«шатёр»
  const yR=H+2.2+fl*0.3,xm=(x0+x1)/2,zm=(z0+z1)/2;
  const e=[[x0-0.3,H+0.35,z0-0.3],[x1+0.3,H+0.35,z0-0.3],[x1+0.3,H+0.35,z1+0.3],[x0-0.3,H+0.35,z1+0.3]],r0=[xm-L*0.28,yR,zm],r1=[xm+L*0.28,yR,zm];
  mFace(M,[e[0],e[1],r1,r0],roof,'roof',[xm,H,zm]);mFace(M,[e[2],e[3],r0,r1],roof,'roof',[xm,H,zm]);mFace(M,[e[1],e[2],r1],roof,'roof',[xm,H,zm]);mFace(M,[e[3],e[0],r0],roof,'roof',[xm,H,zm]);
  // башенка с часами над входом
  if(fl>=2){const tx=xm,tw=1.4,tb=H,th=4+fl;const T=mBox(M,tx-tw,tb,z0-0.4,tx+tw,tb+th,z0+2.4,wall,'wall',['d']);const E=(u,v)=>[u,v,z0-0.412];
    T.b.deco=[{ring:[tx,tb+th-1.6,z0-0.42,0.9],ax:'z',w:0.14,c:'#2a2a2a'},{dot:[tx,tb+th-1.6,z0-0.43],r:0.85,c:'#f1ece0'},{a:[tx,tb+th-1.6,z0-0.44],b:[tx+0.1,tb+th-1.0,z0-0.44],w:0.09,c:'#222'},{a:[tx,tb+th-1.6,z0-0.44],b:[tx+0.45,tb+th-1.7,z0-0.44],w:0.09,c:'#222'}];
    const top=tb+th+2.6;[[-tw,-0.4],[tw,-0.4],[tw,2.4],[-tw,2.4]].forEach((a,i,A)=>{const b=A[(i+1)%4];mFace(M,[[tx+a[0]*1.1,tb+th,z0+a[1]],[tx+b[0]*1.1,tb+th,z0+b[1]],[tx,top,z0+1]],S.sea==='w'?'#e6ecf0':'#3f4650','roof',[tx,tb+th+1,z0+1]);});
    mBox(M,tx-0.05,top,z0+0.95,tx+0.05,top+2.2,z0+1.05,'#555','metal');mFace(M,[[tx+0.05,top+2.1,z0+1],[tx+1.6,top+1.8,z0+1],[tx+0.05,top+1.4,z0+1]],'#c0343a','cloth',[tx,top,z0+2],true);}
  // вывеска с названием компании на фасаде
  const sw=Math.min(L-2,S.co.length*0.75+1.5),sy=H-1.1,sb=mBox(M,xm-sw/2,sy,z0-0.18,xm+sw/2,sy+1.0,z0-0.04,'#f1e6c8','paint',['d']);
  sb.b.deco=[{text:S.co.toUpperCase(),at:[[xm-sw/2+0.1,sy+0.08,z0-0.195],[xm+sw/2-0.1,sy+0.08,z0-0.195],[xm-sw/2+0.1,sy+0.92,z0-0.195]],w:sw-0.2,h:0.84,c:'#3a1c10',font:'bold 0.62px Georgia,serif'}];
  M.foot=[x0-0.6,x1+1.5,z0-0.6,z1+0.6];return {M,x1};}
// Склад: ангар с полукруглой крышей
function pDepot(x0,z0,S){const M=new Mesh(),L=10+S.wh*3.4,D=11,R=4.6+S.wh*0.35,x1=x0+L,z1=z0+D,wall=S.era===2?'#9aa0a6':'#7a6452',roof=S.sea==='w'?'#e8eef2':S.era===2?'#7d848c':'#6d5d4f',seg=9;
  const P=(k,z)=>{const a=Math.PI*k/seg;return [x0+L/2-Math.cos(a)*L/2,R*Math.sin(a)*0.9+1.2,z];};
  mBox(M,x0,0,z0,x1,1.2,z1,wall,'wall',['d','t']);
  for(let k=0;k<seg;k++){const f=mFace(M,[P(k,z0),P(k+1,z0),P(k+1,z1),P(k,z1)],roof,'metal',[x0+L/2,0,(z0+z1)/2]);f.deco=[{a:P(k,z0),b:P(k,z1),w:0.05,c:shade(roof,-0.3)}];}
  const front=[];for(let k=0;k<=seg;k++)front.push(P(k,z0));const fw=mFace(M,[[x0,1.2,z0],...front.slice(1,-1),[x1,1.2,z0]],wall,'wall',[x0+L/2,1,z1]);
  const F=(u,v)=>[u,v,z0-0.012];wDoor(fw,F,x0+L/2,Math.min(5,L*0.4),Math.min(4.2,R+0.6),S.era===2?'#4a5058':'#3a2e26');
  fw.deco.push({text:'СКЛАД',at:[F(x0+L/2-2.2,R+1.9),F(x0+L/2+2.2,R+1.9),F(x0+L/2-2.2,R+2.9)],w:4.4,h:1.0,c:'#f1e6c8',font:'bold 0.8px Impact,sans-serif'});
  M.foot=[x0-0.6,x1+1.4,z0-0.6,z1+0.6];return {M,x1};}
// КБ: от чертёжной в сарае до института с куполом
function pRD(x1,z0,S){const M=new Mesh(),lv=S.rd,big=lv>=7,lab=lv>=5,off=lv>=3,L=big?16:lab?12:off?9:6,D=big?11:8,H=big?10:off?6.6:3.8,x0=x1-L,z1=z0+D,roof=S.sea==='w'?'#e6ecf0':'#5a5f66';
  const wall=big?'#e2dccd':lab?'#d8cfbd':off?'#c9a37a':'#8a6a44';const W=mBox(M,x0,0,z0,x1,H,z1,wall,'wall',['d','t']),F=(u,v)=>[u,v,z0-0.012],Rt=(u,v)=>[x1+0.012,v,u];
  const fl=big?3:off?2:1;for(let f=0;f<fl;f++)pWins(W.b,F,x0+1.4,x1-1.4,(L-2.8)/Math.max(1,Math.round((L-2.8)/2)),0.8+f*3.1,1.0,1.6,{frame:'#efe6d2',arch:big&&f===0});
  pWins(W.r,Rt,z0+1.5,z1-1.5,2.4,0.8,1.0,1.6,{});
  if(big){for(let k=0;k<6;k++){const cx=x0+2+k*(L-4)/5;mBox(M,cx-0.3,0,z0-2.2,cx+0.3,H-0.6,z0-1.6,'#efe9dc','wall');}mBox(M,x0+1,H-0.6,z0-2.4,x1-1,H,z0,'#e8e2d4','wall',['d']);
    mFace(M,[[x0+1,H,z0-2.4],[x1-1,H,z0-2.4],[(x0+x1)/2,H+2.2,z0-2.4]],'#e8e2d4','wall',[(x0+x1)/2,H,z0+2]);
    mSphere(M,(x0+x1)/2,H+0.4,(z0+z1)/2+1,3.2,'#7a9a8a','metal',0.8);M.foot=[x0-0.6,x1+1.4,z0-2.8,z1+0.6];}
  else{pGable(M,x0,x1,z0,z1,H,off?2.6:2,0.4,roof,wall);if(lab){mBox(M,x0+L*0.3,H+1.2,z0+1.5,x1-L*0.3,H+3,z1-1.5,'#9fbccc','glass');}M.foot=[x0-0.6,x1+1.4,z0-0.6,z1+0.6];}
  const sw=Math.min(L-1,5),sx=(x0+x1)/2,sy=big?H-1.5:H-1.2,sb=mBox(M,sx-sw/2,sy,z0-(big?2.45:0.16),sx+sw/2,sy+0.9,z0-(big?2.42:0.04),'#1f2a36','paint',['d']);
  sb.b.deco=[{text:big?'ИНСТИТУТ':lab?'ЛАБОРАТОРИЯ':'КБ',at:[[sx-sw/2+0.1,sy+0.08,z0-(big?2.47:0.18)],[sx+sw/2-0.1,sy+0.08,z0-(big?2.47:0.18)],[sx-sw/2+0.1,sy+0.84,z0-(big?2.47:0.18)]],w:sw-0.2,h:0.76,c:'#e8c56a',font:'bold 0.6px Impact,sans-serif'}];
  return {M,x0};}
// Электростанция: машинный зал, тонкая труба, мачты с проводами
function pPower(x0,z0,S){const M=new Mesh(),L=8,D=7,H=6,wall=S.era===2?'#b9b4aa':'#a0533e',x1=x0+L,z1=z0+D;const W=mBox(M,x0,0,z0,x1,H,z1,wall,'wall',['d','t']);
  pWins(W.b,(u,v)=>[u,v,z0-0.012],x0+1.5,x1-1.5,2.5,1.4,1.1,3.2,{arch:1});pGable(M,x0,x1,z0,z1,H,1.8,0.3,S.sea==='w'?'#e6ecf0':'#55504c',wall);
  [x1+2,x1+5].forEach(x=>{mBox(M,x-0.12,0,z0+2-0.12,x+0.12,9,z0+2+0.12,'#5a4a3a','wood');mBox(M,x-1.2,8.4,z0+2-0.08,x+1.2,8.6,z0+2+0.08,'#5a4a3a','wood');});
  M.foot=[x0-0.5,x1+6,z0-0.5,z1+0.5];return M;}
// Гоночный отдел: мастерская с флагами у въезда на испытательный трек
function pTeam(x0,z0,S){const M=new Mesh(),L=9,D=7,H=4.2,x1=x0+L,z1=z0+D;const W=mBox(M,x0,0,z0,x1,H,z1,'#e8e0cc','wall',['d','t']);W.b.deco=[];
  for(let k=0;k<3;k++){const u=x0+1.6+k*2.9;W.b.deco.push({poly:[[u-1.1,0,z0-0.012],[u+1.1,0,z0-0.012],[u+1.1,2.8,z0-0.012],[u-1.1,2.8,z0-0.012]],c:'#2a2622'});}
  mBox(M,x0-0.3,H,z0-0.3,x1+0.3,H+0.3,z1+0.3,'#b8322a','paint',['d']);[x0,x1].forEach(x=>{mBox(M,x-0.05,H+0.3,z0-0.05,x+0.05,H+3.4,z0+0.05,'#3a3a3a','metal');mFace(M,[[x,H+3.3,z0],[x+1.4,H+3.1,z0],[x+1.4,H+2.5,z0],[x,H+2.6,z0]],x===x0?'#f0c330':'#1f4e9c','cloth',[x,H,z0+2],true);});
  M.foot=[x0-0.5,x1+1.2,z0-0.5,z1+0.5];return M;}
// Ограда с воротами вдоль улицы
function pFence(x0,x1,z,gate,S){const M=new Mesh(),post=S.era===2?'#8a8f96':'#6a4a32',H=1.8;
  for(let x=x0;x<=x1;x+=3){if(Math.abs(x-gate)<3.5)continue;mBox(M,x-0.12,0,z-0.12,x+0.12,H+0.2,z+0.12,post,'wall');}
  const rail=(a,b)=>{if(b-a<0.5)return;const f=mFace(M,[[a,0.2,z],[b,0.2,z],[b,H,z],[a,H,z]],S.era===2?'#9aa0a6':'#8a6a44','wood',[0,1,z+1],true);f.deco=[];for(let x=a+0.25;x<b;x+=0.25)f.deco.push({a:[x,0.2,z-0.01],b:[x,H,z-0.01],w:0.04,c:shade(S.era===2?'#9aa0a6':'#8a6a44',-0.35)});};
  rail(x0,gate-3.5);rail(gate+3.5,x1);[gate-3.5,gate+3.5].forEach(x=>{mBox(M,x-0.35,0,z-0.35,x+0.35,3.2,z+0.35,S.era===2?'#b9b4aa':'#9a4e3a','wall');mBox(M,x-0.45,3.2,z-0.45,x+0.45,3.5,z+0.45,'#6a6f78','matte');});
  M.foot=[x0,x1,z-0.3,z+0.3];return M;}
// Новая картинка рисуется в свободную минуту: пока — прежняя (без заминки на кнопке «Следующий месяц»)
let PLANT_LAST=null,PLANT_BUSY=false;
function plantHTML(s){try{const key=JSON.stringify(plantState(s));let v=PLANT3D.get(key);
    if(!v&&PLANT_LAST&&!PLANT_BUSY){PLANT_BUSY=true;v=PLANT_LAST;setTimeout(()=>{try{const nv=plantImage(G);PLANT_LAST=nv;const im=document.querySelector('.plant3d>img');if(im)im.src=nv.url;}catch(_){}PLANT_BUSY=false;},60);}
    else if(!v)v=PLANT_LAST&&PLANT_BUSY?PLANT_LAST:plantImage(s);
    if(!v)return factorySVG(s);PLANT_LAST=PLANT_LAST||v;if(PLANT3D.get(key))PLANT_LAST=v;
    const L=s.last,busy=L?clamp(L.made/Math.max(1,capEff(s)),0,1):0.3,sm=busy>0.05?v.smoke.map((p,i)=>[0,1,2].map(k=>`<i class="pl-smoke" style="left:${p[0].toFixed(1)}%;top:${p[1].toFixed(1)}%;animation-delay:-${(k*1.1+i*0.4).toFixed(2)}s;--s:${(0.8+busy*0.6).toFixed(2)}"></i>`).join('')).join(''):'';
    const car=v.car&&L&&L.sold>0?`<img class="pl-car" src="${v.car}" alt="" style="--x0:${v.road[0].toFixed(1)}%;--y0:${v.road[1].toFixed(1)}%;--x1:${v.road[2].toFixed(1)}%;--y1:${v.road[3].toFixed(1)}%;width:${v.carW.toFixed(1)}%">`:'';
    return `<div class="plant3d"><img src="${v.url}" alt="Завод компании">${sm}${car}</div>`;}catch(e){return factorySVG(s);}}
function plantImage(s){const S=plantState(s),key=JSON.stringify(S);let v=PLANT3D.get(key);if(v)return v;
  const W=720,H=330,yaw=0.5,pitch=0.43,cv=mkCanvas(W,H),g=cv.getContext('2d'),cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
  const winter=S.sea==='w',autumn=S.sea==='a',rnd=mulberry32(hashStr(key));
  // здания и предметы: каждое — своя модель
  const items=[],smoke=[],addM=(M,z)=>items.push({M,z});
  const off=pOffice(-44,3,S);addM(off.M,3);
  const rd=pRD(-47,24,S);addM(rd.M,24);
  const hx0=off.x1+5,hw=11,hd=16,hH=S.era===2?9:7.5;
  if(S.cv){const n=Math.max(2,S.h);addM(pHall(hx0,hx0+n*hw,6,6+hd+4,hH+1,S,{saw:1,sign:'КОНВЕЙЕР'}),6);}
  else for(let i=0;i<S.h;i++)addM(pHall(hx0+i*hw,hx0+i*hw+hw-1.2,6,6+hd,hH,S,{sign:i===0?'СБОРКА':null}),6+i*0.01);
  const xh=hx0+(S.cv?Math.max(2,S.h):S.h)*hw;
  for(let i=0;i<Math.max(1,Math.ceil(S.h/2));i++){const c=pChimney(hx0+i*hw*2+hw*0.8,6+hd+3,S.era===2?26:22,0.9,S);addM(c.M,6+hd+3);smoke.push(c.top);}
  if(S.fo){const f=pHall(hx0,hx0+14,34,48,8,S,{glass:'#e8913a',sign:'ЛИТЕЙКА',wall:'#7a4636'});addM(f,34);const c=pChimney(hx0+17,42,34,1.3,S);addM(c.M,42);smoke.push(c.top);}
  if(S.pr){addM(pHall(hx0+18,hx0+34,34,48,10,S,{sign:'ПРЕСС'}),34.1);}
  const dep=pDepot(xh+3,5,S);addM(dep.M,5);
  if(S.el){addM(pPower(-30,30,S),30);const c=pChimney(-22,38,20,0.55,S);addM(c.M,38);smoke.push(c.top);}
  let zMax=0;items.forEach(it=>{if(it.M.foot)zMax=Math.max(zMax,it.M.foot[3]);});
  const tz=zMax+10;if(S.team>0){addM(pTeam(xh-8,tz,S),tz);zMax=tz+22;}
  const X0=-62,X1=dep.x1+14;addM(pFence(X0+2,dep.x1+8,-5.5,-34,S),-5.5);
  // кадр: всё хозяйство целиком, над ним — полоса неба
  const R=(x,y,z)=>{const zr=-x*sy+z*cy;return [x*cy+z*sy,y*cp+zr*sp];};let a0=1e9,a1=-1e9,b0=1e9,b1=-1e9;const ext=q=>{if(q[0]<a0)a0=q[0];if(q[0]>a1)a1=q[0];if(q[1]<b0)b0=q[1];if(q[1]>b1)b1=q[1];};
  const zY=zMax+6;items.forEach(it=>it.M.F.forEach(f=>f.p.forEach(q=>ext(R(q[0],q[1],q[2])))));[[X0,-16],[X1,-16],[X0,zY],[X1,zY]].forEach(([x,z])=>ext(R(x,0,z)));
  const top=H*0.15,ppm=clamp(Math.min((W-24)/(a1-a0),(H-top-8)/(b1-b0)),2.6,7.4),OX=W/2-(a0+a1)/2*ppm,OY=top+b1*ppm+Math.max(0,(H-top-8-(b1-b0)*ppm)*0.35);
  const P=(x,y,z)=>{const q=R(x,y,z);return [OX+q[0]*ppm,OY-q[1]*ppm];};
  // небо, солнце, облака
  const sky=S.war?['#56606c','#9aa2ab']:winter?['#7896b4','#d4dfe8']:['#4a82bc','#c4dbeb'];let gr=g.createLinearGradient(0,0,0,H*0.55);gr.addColorStop(0,sky[0]);gr.addColorStop(1,sky[1]);g.fillStyle=gr;g.fillRect(0,0,W,H);
  if(!S.war){g.fillStyle='rgba(255,246,214,.9)';g.beginPath();g.arc(W*0.88,H*0.1,15,0,7);g.fill();}
  for(let i=0;i<5;i++){const x=rnd()*W,y=H*(0.04+rnd()*0.14),r=16+rnd()*22;g.fillStyle=S.war?'rgba(200,204,210,.35)':'rgba(255,255,255,.6)';for(let k=0;k<5;k++){g.beginPath();g.ellipse(x+(k-2)*r*0.55,y+(k%2)*4,r*0.6,r*0.3,0,0,7);g.fill();}}
  const ground=winter?'#dfe7ee':autumn?'#8c8c52':'#6f8f4a',yard=winter?'#d4dce2':S.era===2?'#a2a19a':'#a89478',road=winter?'#c4c8cc':S.era===0?'#8a7a64':S.era===1?'#7c776e':'#5e6064';
  const poly=(pts,col)=>{g.fillStyle=col;g.beginPath();pts.forEach((q,i)=>{const p=P(q[0],q[1]||0,q[2]);i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]);});g.closePath();g.fill();};
  const zF=zY+10,hy=H*0.17;
  // горизонт: дальние холмы и город — ровной полосой, ниже — поля до самой улицы
  g.fillStyle=winter?'#c9d4dc':S.era===2?'#8a9a90':'#86a070';g.beginPath();g.moveTo(0,hy+6);for(let x=0;x<=W;x+=12)g.lineTo(x,hy-6-9*Math.abs(Math.sin(x*0.011+1))-4*Math.sin(x*0.04));g.lineTo(W,hy+6);g.closePath();g.fill();
  g.fillStyle=S.era===2?'rgba(96,106,120,.85)':'rgba(120,108,100,.8)';for(let x=6;x<W;){const w=8+rnd()*16,h=5+rnd()*(S.era===2?20:11);g.fillRect(x,hy-h,w,h+2);if(rnd()<0.14)g.fillRect(x+w/2-1.5,hy-h-14,3,14);x+=w+rnd()*26;}
  g.fillStyle=winter?'#d6dee6':shade(ground,-0.1);g.fillRect(0,hy,W,H-hy);
  poly([[-420,0,zF],[420,0,zF],[420,0,-400],[-420,0,-400]],ground);
  poly([[X0,0,-4],[X1,0,-4],[X1,0,zY],[X0,0,zY]],yard);
  // испытательный трек гоночного отдела
  if(S.team>0){const cx=(X0+X1)/2+10,cz=tz+9,rx=(X1-X0)*0.28,rz=7.5;g.lineWidth=ppm*2.4;g.strokeStyle=winter?'#bcc4ca':'#8a8272';g.beginPath();for(let k=0;k<=48;k++){const a=k/48*6.283,p=P(cx+Math.cos(a)*rx,0,cz+Math.sin(a)*rz);k?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]);}g.stroke();
    g.lineWidth=Math.max(1,ppm*0.22);g.strokeStyle='rgba(255,255,255,.75)';g.stroke();}
  poly([[-420,0,-16],[420,0,-16],[420,0,-8],[-420,0,-8]],road);poly([[-420,0,-8],[420,0,-8],[420,0,-6.2],[-420,0,-6.2]],winter?'#e4e8ec':'#b8b0a0');
  if(S.era>=1){g.strokeStyle='rgba(240,236,220,.55)';g.lineWidth=1.4;g.setLineDash([10,12]);const a=P(-420,0,-12),b=P(420,0,-12);g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();g.setLineDash([]);}
  // деревья: ряд на дальнем краю поля, по бокам и за цехами
  const treeT=S.c==='it'?'cypress':S.c==='us'?'elm':S.c==='de'?'oak':'plane';
  const drawTree=(x,z,i,sc)=>{const t=scenSprite(winter?'birch':treeT,i%3,1);if(!t)return;const p=P(x,0,z),k=ppm/SCEN_PPM*(sc||1)*(0.8+((i*37)%10)/25),w=t.img.width*k,h=t.img.height*k;g.save();if(winter)g.filter='saturate(0.25) brightness(1.08)';else if(autumn)g.filter='hue-rotate(-38deg) saturate(1.3)';g.drawImage(t.img,p[0]-w*t.ax,p[1]-h*t.ay,w,h);g.restore();};
  for(let x=-300,i=0;x<300;x+=9+(i*7)%6,i++)drawTree(x,zF+2,i,0.85);
  const drawItem=it=>{const r=renderModel(it.M,yaw,pitch,ppm,{shadow:0.34,blur:0.25,outline:ppm>4?1.2:0.8});const o=P(0,0,0);g.drawImage(r.img,o[0]-r.ax*r.img.width,o[1]-r.ay*r.img.height);};
  const trees=[[X0-2,-2],[X0+4,zY*0.45],[X0,zY],[X1,-1],[X1+4,zY*0.4],[X1-2,zY],[X0+30,zY+4],[X1-40,zY+5]];
  const zOf=(x,z)=>-x*sy+z*cy;
  // от дальних к ближним — здания и деревья вперемешку
  const all=items.map(it=>({z:zOf(it.M.foot?(it.M.foot[0]+it.M.foot[1])/2:0,it.z),d:()=>drawItem(it)})).concat(trees.map((t,i)=>({z:zOf(t[0],t[1]),d:()=>drawTree(t[0],t[1],i+3)})));
  all.sort((a,b)=>b.z-a.z).forEach(o=>o.d());
  // готовые машины на площадке у склада — ваших цветов; грузовик, если делаете грузовики
  const nCars=[0,2,4,7,10][S.st]||0,paints=S.pa.length?S.pa:['#1b1d22'],style=S.era===0?'runabout':S.era===1?'tourer':'sedan';
  const carSp=(col,st)=>{const k='plc|'+st+'|'+col+'|'+S.y+'|'+ppm.toFixed(2);let r=CARD3D.get(k);if(!r){r=renderModel(carModel({key:k,style:st,color:col,y:S.y,wheel:S.era===0?'wood':'wire',mech:false,num:0,b:st==='truck'?'b7':'b1',lod:'lo'}),yaw+Math.PI/2,pitch,ppm,{shadow:0.3,outline:0.8});CARD3D.set(k,r);}return r;};
  for(let i=0;i<nCars;i++){const x=dep.x1-3-(i%5)*3.6,z=-1.4-Math.floor(i/5)*0.1,r=carSp(paints[i%paints.length],style),p=P(x,0,z+(i>=5?-3.2:0)+3);g.drawImage(r.img,p[0]-r.ax*r.img.width,p[1]-r.ay*r.img.height);}
  if(S.tr){const r=carSp(paints[0],'truck'),p=P(xh-2,0,1);g.drawImage(r.img,p[0]-r.ax*r.img.width,p[1]-r.ay*r.img.height);}
  // рабочие у ворот
  for(let i=0;i<3+S.h;i++){const x=-34+(rnd()-0.5)*9,z=-3.2+rnd()*2.5,p=P(x,0,z),k=ppm*0.95;g.save();g.translate(p[0],p[1]);g.scale(k,k);drawPerson(g,mulberry32(hashStr('w'+i+S.y)),Object.assign(personLook(mulberry32(i*31+S.y),S.y,'crowd'),{frame:i%2}));g.restore();}
  // машина едет по улице (анимация поверх картинки): её путь и спрайт
  const a=P(-160,0,-13.2),b=P(260,0,-13.2),cs=carSp(paints[0],style);
  v={url:cv.toDataURL('image/webp',0.9),smoke:smoke.map(t=>{const p=P(t[0],t[1],t[2]);return [p[0]/W*100,p[1]/H*100];}),road:[a[0]/W*100,a[1]/H*100,b[0]/W*100,b[1]/H*100],car:cs.img.toDataURL('image/png'),carW:cs.img.width/W*100};
  if(PLANT3D.size>6)PLANT3D.delete(PLANT3D.keys().next().value);PLANT3D.set(key,v);return v;}
