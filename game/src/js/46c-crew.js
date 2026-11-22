/* ================= ЭКИПАЖ: живые люди вместо «человечков» ================= */
// 0.18: пилот и механик — с настоящими пропорциями: голова меньше и вытянута (лоб, скулы, челюсть, подбородок), нос, уши,
// усы у каждого второго (эпоха!), шея и воротник, широкие плечи и грудь, руки из плеча и предплечья с локтем, перчатки-краги.
// Кожаный шлем с наушниками и швами или кепи (ранние гонщики носили его козырьком назад), очки-консервы с латунными ободками,
// пыльник с поясом и пуговицами, шарф. Механик — в кепи и комбинезоне, одна рука на борту, другая держится за поручень.
function crewLook(S,mech){const r=mulberry32(hashStr('crew|'+(S.num|0)+'|'+(S.mq||'')+(mech?'m':'d')+S.y+(S.drv||'')));
  const skins=typeof pplSkin==='function'?pplSkin(S.cc||'fr'):['#d4a47c','#c8966e','#b98460','#dcae88','#a87452'],hairs=['#2a1f18','#3b2a1e','#5a4028','#1c1714','#6b5a48','#8a8074'],pk=a=>a[Math.floor(r()*a.length)];
  const L={skin:skins[Math.floor(r()*skins.length)],hair:hairs[Math.floor(r()*hairs.length)],stache:r()<(S.y<1915?0.6:0.35)?pk(S.y<1915?[1,2,2,3,1]:[1,4,1,2]):0,beard:S.y<1906&&r()<0.18?pk([1,2,4]):S.y<1915&&r()<0.05?2:0,fw:0.95+r()*0.1,nose:0.85+r()*0.4,grey:mech&&r()<0.15?1:0,
    capBack:!mech&&S.y<1910&&r()<0.5,goggleUp:mech||r()<0.25,scarf:['#ece6d4','#b8322a','#e8e2cc','#2e4a78','#d9c9a0'][Math.floor(r()*5)]};
  // 0.21: лицо пилота — с его исторического фото (усы, борода, брови — уже на снимке); очки подняты, чтобы лицо было видно
  const F=!mech&&S.drv&&typeof faceOf==='function'?faceOf(S.drv):null;if(F){L.face=F;L.stache=false;L.beard=false;L.fw=1;L.grey=0;L.goggleUp=true;L.hair=F.hair||L.hair;L.skin=F.skin||'#d4a882';}
  return L;}
// Лицо с фото — мозаикой по передней части головы: каждый пиксель снимка — маленький четырёхугольник цвета кожи нужной яркости
function mFacePhoto(M,cx,cy,cz,L,s){const F=L.face,W=F.w,H=F.h,px=F.px,XW=0.064,h0=0.012,h1=0.206,sk=hex2rgb(L.skin),dk=[34,26,22],Mt=MATS.skin;
  const row=h=>{let a=HEAD_ROWS[0],b=HEAD_ROWS[HEAD_ROWS.length-1];for(let i=0;i<HEAD_ROWS.length-1;i++)if(h>=HEAD_ROWS[i][0]&&h<=HEAD_ROWS[i+1][0]){a=HEAD_ROWS[i];b=HEAD_ROWS[i+1];break;}
    const k=(h-a[0])/Math.max(1e-6,b[0]-a[0]);return [a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k,a[3]+(b[3]-a[3])*k];};
  const V=[],NV=[],IN=[];for(let j=0;j<=H;j++){const h=h1-(h1-h0)*j/H,[rx,rz,dz]=row(h),r1=[],n1=[],i1=[];
    for(let i=0;i<=W;i++){const x=(0.5-i/W)*2*XW,q=x/rx,inn=Math.abs(q)<0.93,zz=dz+rz*0.96*Math.sqrt(Math.max(0,1-q*q))+0.0016;
      r1.push([cx+x*s,cy+h*s,cz+zz*s]);const nx=x/(rx*rx),nz=(zz-dz)/(rz*rz*0.92),l=Math.hypot(nx,nz)||1;n1.push([nx/l,0.08,nz/l]);i1.push(inn);}V.push(r1);NV.push(n1);IN.push(i1);}
  for(let j=0;j<H;j++)for(let i=0;i<W;i++){if(!(IN[j][i]&&IN[j][i+1]&&IN[j+1][i]&&IN[j+1][i+1]))continue;
    // яркость относительно щёк: средний тон снимка = цвет кожи, тени — темнее (усы, брови, глаза — к тёмным волосам)
    const rel=px[j*W+i]/Math.max(20,F.mean||128),k=clamp(0.12+0.88*rel,0.1,1.35),dd=clamp((0.5-rel)/0.35,0,1),c=[0,1,2].map(q=>Math.round(clamp(sk[q]*k*(1-dd)+dk[q]*dd,0,255)));
    let p=[V[j][i],V[j][i+1],V[j+1][i+1],V[j+1][i]],vn=[NV[j][i],NV[j][i+1],NV[j+1][i+1],NV[j+1][i]],n=newell(p);if(n[2]<0){p=p.reverse();vn=vn.reverse();n=newell(p);}
    M.F.push({p,n,vn,col:c,mat:Mt,two:false,deco:null,w:MTAG.w,l:MTAG.l});}}
// Голова: ряды-эллипсы снизу (подбородок) вверх (макушка); лицо смотрит вперёд (+z)
const HEAD_ROWS=[[0,0.022,0.02,0.07],[0.018,0.046,0.045,0.056],[0.045,0.063,0.07,0.034],[0.08,0.071,0.086,0.016],[0.115,0.076,0.095,0.006],[0.15,0.078,0.099,0],[0.18,0.076,0.097,-0.004],[0.205,0.066,0.085,-0.008],[0.222,0.046,0.06,-0.011],[0.232,0.012,0.016,-0.012]];
// 0.51: L.fw — ширина лица, L.stache — усы (1 — щёточка, 2 — «велосипедный руль», 3 — моржовые, 4 — ниточка), L.beard — борода (1 — короткая,
// 2 — эспаньолка, 3 — окладистая, 4 — бакенбарды), L.glasses — очки или пенсне, L.grey — седина, L.woman — губы ярче
function mHead(M,cx,cy,cz,L,hi,scale){const sg=hi?16:7,s=scale||1,fw=L.fw||1,rows=(hi?HEAD_ROWS:HEAD_ROWS.filter((q,i)=>i%2===0||i===HEAD_ROWS.length-1)).map(q=>[q[0],q[1]*fw,q[2],q[3]]);
  if(L.grey&&!L._g){L=Object.assign({},L,{hair:L.grey===2?'#d8d4cc':'#9a958c',_g:1});}
  const G=rows.map(([h,rx,rz,dz])=>{const row=[];for(let k=0;k<sg;k++){const a=k/sg*Math.PI*2,c=Math.cos(a),sn=Math.sin(a);
      // затылок круглее и шире лица; лицо чуть площе
      const back=sn<0?1.05:0.96;row.push([cx+c*rx*s,cy+h*s,cz+(dz+sn*rz*back)*s]);}return row;});
  mGrid(M,G,L.skin,'skin',{wrap:true,ref:(c,i)=>[cx,cy+(rows[i][0]+rows[i+1][0])/2*s,cz+rows[i][3]*s]});
  if(!hi)return;
  if(L.face&&L.face.px){mFacePhoto(M,cx,cy,cz,L,s);// нос и уши остаются объёмными; брови, глаза, рот, усы — со снимка
    const P=(x,y,z)=>[cx+x*s,cy+y*s,cz+z*s];
    [-1,1].forEach(sd=>mLathe(M,P(sd*0.077,0.125,0.0),'x',[[0,-sd*0.004],[0.022,0],[0.018,sd*0.008],[0,sd*0.009]],6,shade(L.skin,-0.06),'skin',{ref:()=>P(sd*0.06,0.125,0)}));
    const hr=HEAD_ROWS.filter(q=>q[0]>=0.09),HG=hr.map(([h,rx,rz,dz])=>{const row=[];for(let k=0;k<=8;k++){const a=Math.PI+k/8*Math.PI,c=Math.cos(a),sn=Math.sin(a);row.push(P(c*rx*1.05,h+0.003,dz+sn*rz*1.1));}return row;});
    mGrid(M,HG,L.hair,'cloth',{ref:()=>P(0,0.14,0)});return;}
  const fz=cz+0.098*s,P=(x,y,z)=>[cx+x*s,cy+y*s,cz+z*s],ns=L.nose||1;
  // нос: клин от переносицы к кончику
  mGrid(M,[[P(-0.004,0.15,0.1),P(0.004,0.15,0.1)],[P(-0.014*ns,0.1,0.1+0.018*ns),P(0.014*ns,0.1,0.1+0.018*ns)],[P(-0.012*ns,0.088,0.106),P(0.012*ns,0.088,0.106)]],shade(L.skin,-0.04),'skin',{ref:()=>P(0,0.11,0.07),two:true});
  // уши
  [-1,1].forEach(sd=>mLathe(M,P(sd*0.077*fw,0.125,0.0),'x',[[0,-sd*0.004],[0.022,0],[0.018,sd*0.008],[0,sd*0.009]],6,shade(L.skin,-0.06),'skin',{ref:()=>P(sd*0.06,0.125,0)}));
  // брови, рот, усы, борода
  [-1,1].forEach(sd=>mTube(M,[P(sd*0.012,0.162,0.097),P(sd*0.03,0.166,0.094),P(sd*0.048,0.162,0.086)],0.005,3,L.hair,'cloth'));
  mTube(M,[P(-0.02,0.066,0.089),P(0,0.064,0.093),P(0.02,0.066,0.089)],L.woman?0.0045:0.0035,3,L.woman?'#a8463e':'#7a4a3a','skin');
  const st=L.stache===true?1:L.stache|0,bd=L.beard===true?1:L.beard|0,R=v=>v*s;
  if(st===2)mTube(M,[P(-0.052,0.086,0.066),P(-0.036,0.07,0.082),P(-0.016,0.079,0.097),P(0,0.081,0.1),P(0.016,0.079,0.097),P(0.036,0.07,0.082),P(0.052,0.086,0.066)],[0.003,0.006,0.008,0.009,0.008,0.006,0.003].map(R),4,L.hair,'cloth');
  else if(st===3)mTube(M,[P(-0.038,0.05,0.076),P(-0.022,0.072,0.095),P(0,0.08,0.1),P(0.022,0.072,0.095),P(0.038,0.05,0.076)],[0.006,0.011,0.012,0.011,0.006].map(R),4,L.hair,'cloth');
  else if(st===4)mTube(M,[P(-0.026,0.076,0.09),P(0,0.079,0.098),P(0.026,0.076,0.09)],R(0.0035),3,L.hair,'cloth');
  else if(st)mTube(M,[P(-0.034,0.07,0.082),P(-0.016,0.08,0.097),P(0,0.082,0.1),P(0.016,0.08,0.097),P(0.034,0.07,0.082)],[0.005,0.008,0.009,0.008,0.005].map(R),4,L.hair,'cloth');
  if(bd===2)mGrid(M,[[P(-0.022,0.052,0.084),P(0,0.052,0.094),P(0.022,0.052,0.084)],[P(-0.015,0.0,0.068),P(0,-0.014,0.082),P(0.015,0.0,0.068)]],L.hair,'cloth',{ref:()=>P(0,0.03,0.02),two:true});
  else if(bd===3)mGrid(M,[[P(-0.064*fw,0.085,0.045),P(-0.03,0.062,0.086),P(0,0.058,0.096),P(0.03,0.062,0.086),P(0.064*fw,0.085,0.045)],[P(-0.058*fw,0.0,0.048),P(-0.028,-0.03,0.082),P(0,-0.045,0.09),P(0.028,-0.03,0.082),P(0.058*fw,0.0,0.048)],[P(-0.03,-0.075,0.05),P(-0.015,-0.095,0.07),P(0,-0.105,0.076),P(0.015,-0.095,0.07),P(0.03,-0.075,0.05)]],L.hair,'cloth',{ref:()=>P(0,0,0),two:true});
  else if(bd===4)[-1,1].forEach(sd=>mGrid(M,[[P(sd*0.074*fw,0.115,0.02),P(sd*0.066*fw,0.115,0.068)],[P(sd*0.07*fw,0.04,0.03),P(sd*0.046,0.032,0.078)]],L.hair,'cloth',{ref:()=>P(0,0.08,0.02),two:true}));
  else if(bd)mGrid(M,[[P(-0.055,0.06,0.06),P(0,0.06,0.09),P(0.055,0.06,0.06)],[P(-0.05,0.02,0.055),P(0,0.0,0.085),P(0.05,0.02,0.055)]],L.hair,'cloth',{ref:()=>P(0,0.05,0.02),two:true});
  // очки или пенсне: два ободка и переносица
  if(L.glasses){const gc=L.glasses===2?'#b89a4a':'#26262a';[-1,1].forEach(sd=>{const C=[];for(let k=0;k<=8;k++){const a=k/8*Math.PI*2;C.push(P(sd*0.031+Math.cos(a)*0.016,0.146+Math.sin(a)*0.014,0.103));}mTube(M,C,R(0.0026),3,gc,'metal');});
    mTube(M,[P(-0.015,0.148,0.104),P(0,0.152,0.107),P(0.015,0.148,0.104)],R(0.0024),3,gc,'metal');
    if(L.glasses!==2)[-1,1].forEach(sd=>mTube(M,[P(sd*0.047,0.148,0.1),P(sd*0.078*fw,0.15,0.01)],R(0.0022),3,gc,'metal'));}
  // глаза (видны, когда очки подняты)
  if(L.goggleUp)[-1,1].forEach(sd=>{mLathe(M,P(sd*0.031,0.146,0.089),'z',[[0.011,-0.002],[0.009,0.004],[0,0.006]],8,'#f2eee6','skin');mLathe(M,P(sd*0.031,0.146,0.095),'z',[[0.0055,0],[0,0.0015]],6,'#2a2018','glass');});
  // волосы: оболочка затылка и макушки
  const hr=HEAD_ROWS.filter(q=>q[0]>=0.09),HG=hr.map(([h,rx,rz,dz])=>{const row=[];for(let k=0;k<=8;k++){const a=Math.PI+k/8*Math.PI,c=Math.cos(a),sn=Math.sin(a);row.push(P(c*rx*1.05,h+0.003,dz+sn*rz*1.1));}return row;});
  mGrid(M,HG,L.hair,'cloth',{ref:()=>P(0,0.14,0)});}
// Кожаный шлем: колпак над лбом и затылком, наушники, ремешок под подбородком, швы
function mHelmet(M,cx,cy,cz,col,hi,s,mat){s=s||1;mat=mat||'leather';const sg=hi?16:7,P=(x,y,z)=>[cx+x*s,cy+y*s,cz+z*s],rows=[[0.12,1.1],[0.15,1.09],[0.18,1.08],[0.205,1.08],[0.222,1.08],[0.236,0.2]];
  const G=rows.map(([h,k])=>{const hr=HEAD_ROWS.reduce((b,q)=>Math.abs(q[0]-h)<Math.abs(b[0]-h)?q:b),row=[];for(let j=0;j<sg;j++){const a=j/sg*Math.PI*2,c=Math.cos(a),sn=Math.sin(a),front=sn>0.55;
      // спереди колпак выше (открыт лоб)
      const hh=front&&h<0.17?0.17:h;row.push(P(c*hr[1]*k,hh,hr[3]+sn*hr[2]*k*(sn<0?1.06:0.97)));}return row;});
  mGrid(M,G,col,mat,{wrap:true,ref:()=>P(0,0.14,0)});
  if(!hi)return;
  [-1,1].forEach(sd=>{mRBox(M,cx+sd*0.084*s-0.013,cy+0.055*s,cz-0.035*s,cx+sd*0.084*s+0.013,cy+0.165*s,cz+0.04*s,0.01,col,'leather');
    mTube(M,[P(sd*0.086,0.06,0.02),P(sd*0.07,0.02,0.05),P(sd*0.03,0.0,0.07)],0.005,3,shade(col,-0.25),'leather');});
  // швы от лба к затылку
  const seam=[];for(let k=0;k<=6;k++){const t=k/6,a=Math.PI*0.5-t*Math.PI*0.95,hr=HEAD_ROWS[6];seam.push(P(0,0.18+Math.sin(Math.min(Math.PI,t*Math.PI))*0.058,Math.sin(a)*hr[2]*1.1));}
  mTube(M,seam,0.004,3,shade(col,-0.35),'leather');}
// Кепи (козырёк вперёд или назад)
function mFlatCap(M,cx,cy,cz,col,back,hi,s){s=s||1;const P=(x,y,z)=>[cx+x*s,cy+y*s,cz+z*s],dir=back?-1:1;
  mLathe(M,P(0,0.19,-0.005),'y',[[0.088*s,0],[0.094*s,0.025*s],[0.09*s,0.045*s],[0.05*s,0.058*s],[0,0.06*s]],hi?16:7,col,'cloth');
  mGrid(M,[[P(-0.07,0.195,dir*0.07),P(0,0.195,dir*0.095),P(0.07,0.195,dir*0.07)],[P(-0.06,0.185,dir*0.14),P(0,0.183,dir*0.16),P(0.06,0.185,dir*0.14)]],shade(col,-0.15),'cloth',{ref:()=>P(0,0.3,dir*0.1),two:true});}
// Очки-консервы: два стекла в латунных ободках и ремешок; на глазах или поднятые на лоб
function mGoggles(M,cx,cy,cz,up,hi,s){if(!hi)return;s=s||1;const y=up?0.2:0.148,z=up?0.07:0.102,P=(x,yy,zz)=>[cx+x*s,cy+yy*s,cz+zz*s];
  [-1,1].forEach(sd=>{mLathe(M,P(sd*0.034,y,z),'z',[[0.024,-0.014],[0.027,0.004],[0.024,0.012],[0.0,0.013]],10,'#8a6a3a','metal');
    const g=mLathe(M,P(sd*0.034,y,z+0.013),'z',[[0.019,0],[0.0,0.002]],10,'#6f8a98','glass');});
  mTube(M,[P(-0.012,y,z+0.008),P(0.012,y,z+0.008)],0.005,3,'#5a4a30','metal');
  const hr=HEAD_ROWS[up?7:5],strap=[];for(let k=0;k<=8;k++){const a=Math.PI*0.2+k/8*Math.PI*0.6;strap.push(P(-Math.cos(a)*hr[1]*1.12,y+(up?0.002:0.008),-Math.sin(a)*hr[2]*1.1+hr[3]));}
  mTube(M,[P(-0.058,y,z-0.008)].concat(strap).concat([P(0.058,y,z-0.008)]),0.007,3,'#2b1d12','leather');}
// 0.51 (тема 10): экипаж — разные фигуры и одежда по эпохе, стране и роду машины (kit — из crewKit51, 46f-people51.js):
// kit.top — coat (пыльник с поясом), leather (кожанка), jersey (вязаная фуфайка с полосой), overall (светлый комбинезон), fur (доха),
// tunic (мундир шофёра, пожарного, военного), shirt (рубаха и комбинезон с лямками); kit.cap — helmet, cloth (полотняный шлем), cap и шляпы mHat;
// фигура — crewBuild: ширина плеч, высота корпуса, живот
function mCrew3(M,x,seatY,z,kit,mech,S,hand){
  const hi=MLOD===1,sg=hi?14:6,L=crewLook(S,mech),B=typeof crewBuild==='function'?crewBuild(S,mech,kit):{bw:1,th:1,belly:0},top=kit.top||'coat',fur=top==='fur';
  const coat=mech&&!kit.own?shade(kit.coat,-0.12):kit.coat,y0=seatY+0.02,bw=B.bw*(fur?1.1:1),th=B.th,bd=1+(bw-1)*0.6,belly=B.belly||0,mat=top==='leather'?'leather':'cloth',bodyC=top==='shirt'?(kit.shirt||'#d8d2c2'):coat;
  const H=v=>y0+v*th,bl=h=>belly*(h>=0.08&&h<=0.34?1:h<0.45?0.5:0);
  // торс: таз, талия, грудь, плечи (сечения-эллипсы, спина чуть откинута); пыльник — книзу шире
  const lv=[[0,0.18,0.125,0.02],[0.12,0.17,0.115,0],[0.26,0.175,0.112,-0.015],[0.4,0.195,0.115,-0.03],[0.5,0.215,0.112,-0.045],[0.56,0.222,0.1,-0.05],[0.6,0.19,0.086,-0.052],[0.625,0.1,0.065,-0.05],[0.64,0.06,0.052,-0.045]];
  const G=lv.map(([h,wx,wz,dz])=>{const b=bl(h),row=[];for(let k=0;k<sg;k++){const a=k/sg*Math.PI*2,c=Math.cos(a),sn=Math.sin(a);row.push([x+c*wx*bw*(1+0.08*Math.max(0,-sn)*(h<0.3?1:0)),H(h),z+dz+sn*(wz*bd+(sn>0?b:0))+b*0.3]);}return row;});
  mGrid(M,G,bodyC,mat,{wrap:true,ref:(c,i)=>[x,H((lv[i][0]+lv[i+1][0])/2),z+lv[i][3]]});
  const fz=h=>z-0.02+0.118*bd+bl(h)*1.25;
  if(hi){const ring=(h,rx,rz,r,col,m)=>{const bl2=[];for(let k=0;k<=sg;k++){const a=k/sg*Math.PI*2,sn=Math.sin(a);bl2.push([x+Math.cos(a)*rx*bw,H(h),z-0.008+sn*(rz*bd+(sn>0?bl(h):0))+bl(h)*0.3]);}mTube(M,bl2,r,3,col,m||'leather');};
    if(top==='coat'||top==='tunic')ring(0.2,0.173,0.117,0.014,kit.belt||shade(coat,-0.3));   // пояс
    if(top==='jersey'){ring(0.42,0.2,0.118,0.03,kit.band||'#f2efe6','cloth');ring(0.34,0.185,0.116,0.012,kit.band||'#f2efe6','cloth');}   // полоса на груди
    if(top==='coat'||top==='fur')for(let k=0;k<3;k++)mLathe(M,[x,H(0.28+k*0.1),fz(0.28+k*0.1)-k*0.004],'z',[[0.008,0],[0.006,0.004],[0,0.005]],6,shade(coat,-0.35),'metal');
    if(top==='leather')[-1,1].forEach(sd=>{for(let k=0;k<3;k++)mLathe(M,[x+sd*0.045*bw,H(0.26+k*0.1),fz(0.26+k*0.1)-k*0.004],'z',[[0.009,0],[0.007,0.004],[0,0.005]],6,'#1a1612','metal');});
    if(top==='tunic')for(let k=0;k<5;k++)mLathe(M,[x,H(0.24+k*0.075),fz(0.24+k*0.075)-k*0.003],'z',[[0.009,0],[0.007,0.004],[0,0.005]],6,kit.brass||'#d8c070','metal');
    if(top==='overall'){for(let k=0;k<4;k++)mLathe(M,[x,H(0.16+k*0.09),fz(0.16+k*0.09)-k*0.003],'z',[[0.006,0],[0,0.004]],6,shade(coat,-0.3),'metal');
      mRBox(M,x-0.12*bw,H(0.38),fz(0.4)-0.022,x-0.04*bw,H(0.46),fz(0.4)-0.008,0.004,shade(coat,-0.08),'cloth');}
    if(top==='shirt'&&kit.bib){// комбинезон поверх рубахи: нагрудник и лямки
      mGrid(M,[[[x-0.1*bw,H(0.5),fz(0.5)-0.012],[x,H(0.5),fz(0.5)-0.004],[x+0.1*bw,H(0.5),fz(0.5)-0.012]],[[x-0.15*bw,H(0.08),fz(0.1)-0.01],[x,H(0.08),fz(0.1)+0.004],[x+0.15*bw,H(0.08),fz(0.1)-0.01]]],kit.bib,'cloth',{ref:()=>[x,H(0.3),z],two:true});
      [-1,1].forEach(sd=>mTube(M,[[x+sd*0.09*bw,H(0.5),fz(0.5)-0.01],[x+sd*0.13*bw,H(0.62),z-0.04],[x+sd*0.1*bw,H(0.5),z-0.15]],0.014,4,kit.bib,'cloth'));}
    // воротник: у пыльника — отложной, у дохи — меховой, у фуфайки — валик, у мундира — стойка
    const col=[];for(let k=0;k<=10;k++){const a=Math.PI*0.05+k/10*Math.PI*0.9;col.push([x-Math.cos(a)*0.075,H(0.66),z-0.05-Math.sin(a)*0.06]);}
    if(top==='tunic'||top==='jersey')mLathe(M,[x,H(0.61),z-0.05],'y',[[0.058,0],[0.056,0.045*th]],10,top==='jersey'?(kit.band||shade(coat,-0.15)):(kit.collar||shade(coat,-0.25)),'cloth');
    else if(top!=='shirt')mTube(M,[[x-0.078,H(0.6),z+0.02]].concat(col).concat([[x+0.078,H(0.6),z+0.02]]),fur?0.036:0.022,4,fur?shade(coat,-0.25):top==='overall'?shade(coat,-0.04):shade(coat,-0.08),'cloth');
    if(top==='overall'&&kit.tie){mGrid(M,[[[x-0.04,H(0.63),z+0.03],[x,H(0.62),z+0.045],[x+0.04,H(0.63),z+0.03]],[[x-0.012,H(0.5),fz(0.5)-0.01],[x,H(0.5),fz(0.5)-0.006],[x+0.012,H(0.5),fz(0.5)-0.01]]],'#f2efe6','cloth',{ref:()=>[x,H(0.56),z-0.1],two:true});
      mTube(M,[[x,H(0.615),z+0.05],[x,H(0.5),fz(0.5)-0.002]],[0.014,0.01],4,kit.tie,'cloth');}
    if(top==='tunic'&&kit.epaul)[-1,1].forEach(sd=>mRBox(M,x+sd*0.18*bw-0.04,H(0.585),z-0.085,x+sd*0.18*bw+0.04,H(0.6),z-0.015,0.005,kit.epaul,'cloth'));}
  // шея и голова
  const hy=H(0.7),hz=z-0.03;mLathe(M,[x,H(0.6),hz],'y',[[0.052,0],[0.048,0.06*th],[0.05,0.11*th]],hi?10:5,shade(L.skin,-0.05),'skin');
  const hs=B.head||1;mHead(M,x,hy-0.02,hz,L,hi,hs);
  const cap=mech&&!kit.own?'cap':kit.cap||'helmet',gog=kit.goggles!==false;
  if(cap==='cap'){mFlatCap(M,x,hy-0.02,hz,kit.hat,!mech&&L.capBack,hi,hs);if(hi&&gog)mGoggles(M,x,hy-0.02,hz,true,hi,hs);}
  else if(cap==='helmet'||cap==='cloth'){mHelmet(M,x,hy-0.02,hz,kit.hat,hi,hs,cap==='cloth'?'cloth':'leather');if(gog)mGoggles(M,x,hy-0.02,hz,L.goggleUp,hi,hs);}
  else{const m0=MLOD;mHat(M,{hat:cap,hatc:kit.hat,band:kit.hband,badge:kit.badge,hx:x,hz},hy-0.02,hs,S.y>=1919);MLOD=m0;if(hi&&gog&&kit.gogUp)mGoggles(M,x,hy-0.02,hz,true,hi,hs);}
  // руки: плечо — локоть — кисть в краге (у пилота — на руле, у механика — одна на борту, другая на поручне)
  const sy=H(0.55),sz=z-0.05,armC=top==='shirt'?(kit.shirt||'#d8d2c2'):coat,glove=kit.glove===0?shade(L.skin,-0.06):kit.glove||'#6b4a30',gm=kit.glove===0?'skin':'leather';[-1,1].forEach(sd=>{const sx=x+sd*0.2*bw;
    const h=mech?(sd>0?[x+sd*0.3,seatY+0.3,z+0.1]:[x+sd*0.24,seatY+0.58,z+0.18]):[x+sd*(hand[3]||0.14),hand[1],hand[2]];
    const el=[(sx+h[0])/2+sd*0.07,(sy+h[1])/2-0.13,(sz+h[2])/2-0.04],wr=[h[0]+(el[0]-h[0])*0.22,h[1]+(el[1]-h[1])*0.22,h[2]+(el[2]-h[2])*0.22],ak=fur?1.15:0.94+(bw-1)*0.8+0.06;
    mTube(M,[[sx,sy+0.02,sz],[sx+(el[0]-sx)*0.5,sy+(el[1]-sy)*0.5,sz+(el[2]-sz)*0.5],el,wr],[0.056*ak,0.05*ak,0.045*ak,0.043*ak],hi?8:3,armC,mat);
    // крага и кисть
    if(kit.glove!==0)mTube(M,[wr,[wr[0]+(h[0]-wr[0])*0.6,wr[1]+(h[1]-wr[1])*0.6,wr[2]+(h[2]-wr[2])*0.6]],[0.05,0.042],hi?8:3,shade(glove,-0.12),'leather');
    mLathe(M,h,'y',[[0,-0.035],[0.033,-0.022],[0.038,0.006],[0.026,0.03],[0,0.036]],hi?8:4,glove,gm);
    if(hi&&!mech)mTube(M,[[h[0]-sd*0.02,h[1]+0.01,h[2]-0.01],[h[0]-sd*0.045,h[1]+0.03,h[2]+0.02]],0.013,4,glove,gm);});
  // шарф: кольцо на шее и развевающийся конец (у механика — нет)
  if(!mech&&hi&&kit.scarf!==0){const sc=kit.scarf||L.scarf;mTube(M,[[x-0.07,H(0.625),z-0.05],[x,H(0.645),z+0.01],[x+0.07,H(0.625),z-0.05],[x,H(0.615),z-0.12],[x-0.07,H(0.625),z-0.05]],0.028,5,sc,'cloth');
    // конец шарфа вьётся по ветру за плечом — узкая лента
    const R=[];for(let k=0;k<=6;k++){const t=k/6,wv=Math.sin(t*7)*0.025;R.push([[x+0.1+t*0.2,H(0.6)+t*0.03+wv,z-0.09-t*0.34],[x+0.1+t*0.2,H(0.66)+t*0.03+wv,z-0.09-t*0.34]]);}
    mGrid(M,R,sc,'cloth',{ref:()=>[x+0.1,y0+1.5,z-0.3],two:true});}
}
