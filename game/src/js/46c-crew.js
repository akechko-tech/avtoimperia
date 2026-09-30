/* ================= ЭКИПАЖ: живые люди вместо «человечков» ================= */
// 0.18: пилот и механик — с настоящими пропорциями: голова меньше и вытянута (лоб, скулы, челюсть, подбородок), нос, уши,
// усы у каждого второго (эпоха!), шея и воротник, широкие плечи и грудь, руки из плеча и предплечья с локтем, перчатки-краги.
// Кожаный шлем с наушниками и швами или кепи (ранние гонщики носили его козырьком назад), очки-консервы с латунными ободками,
// пыльник с поясом и пуговицами, шарф. Механик — в кепи и комбинезоне, одна рука на борту, другая держится за поручень.
function crewLook(S,mech){const r=mulberry32(hashStr('crew|'+(S.num|0)+'|'+(S.mq||'')+(mech?'m':'d')+S.y));
  const skins=['#d4a47c','#c8966e','#b98460','#dcae88','#a87452'],hairs=['#2a1f18','#3b2a1e','#5a4028','#1c1714','#6b5a48','#8a8074'];
  return {skin:skins[Math.floor(r()*skins.length)],hair:hairs[Math.floor(r()*hairs.length)],stache:r()<(S.y<1915?0.6:0.35),beard:S.y<1906&&r()<0.18,
    capBack:!mech&&S.y<1910&&r()<0.5,goggleUp:mech||r()<0.25,scarf:['#ece6d4','#b8322a','#e8e2cc','#2e4a78','#d9c9a0'][Math.floor(r()*5)]};}
// Голова: ряды-эллипсы снизу (подбородок) вверх (макушка); лицо смотрит вперёд (+z)
const HEAD_ROWS=[[0,0.022,0.02,0.07],[0.018,0.046,0.045,0.056],[0.045,0.063,0.07,0.034],[0.08,0.071,0.086,0.016],[0.115,0.076,0.095,0.006],[0.15,0.078,0.099,0],[0.18,0.076,0.097,-0.004],[0.205,0.066,0.085,-0.008],[0.222,0.046,0.06,-0.011],[0.232,0.012,0.016,-0.012]];
function mHead(M,cx,cy,cz,L,hi,scale){const sg=hi?16:7,s=scale||1,rows=hi?HEAD_ROWS:HEAD_ROWS.filter((q,i)=>i%2===0||i===HEAD_ROWS.length-1);
  const G=rows.map(([h,rx,rz,dz])=>{const row=[];for(let k=0;k<sg;k++){const a=k/sg*Math.PI*2,c=Math.cos(a),sn=Math.sin(a);
      // затылок круглее и шире лица; лицо чуть площе
      const back=sn<0?1.05:0.96;row.push([cx+c*rx*s,cy+h*s,cz+(dz+sn*rz*back)*s]);}return row;});
  mGrid(M,G,L.skin,'skin',{wrap:true,ref:(c,i)=>[cx,cy+(rows[i][0]+rows[i+1][0])/2*s,cz+rows[i][3]*s]});
  if(!hi)return;
  const fz=cz+0.098*s,P=(x,y,z)=>[cx+x*s,cy+y*s,cz+z*s];
  // нос: клин от переносицы к кончику
  mGrid(M,[[P(-0.004,0.15,0.1),P(0.004,0.15,0.1)],[P(-0.014,0.1,0.118),P(0.014,0.1,0.118)],[P(-0.012,0.088,0.106),P(0.012,0.088,0.106)]],shade(L.skin,-0.04),'skin',{ref:()=>P(0,0.11,0.07),two:true});
  // уши
  [-1,1].forEach(sd=>mLathe(M,P(sd*0.077,0.125,0.0),'x',[[0,-sd*0.004],[0.022,0],[0.018,sd*0.008],[0,sd*0.009]],6,shade(L.skin,-0.06),'skin',{ref:()=>P(sd*0.06,0.125,0)}));
  // брови, рот, усы, борода
  [-1,1].forEach(sd=>mTube(M,[P(sd*0.012,0.162,0.097),P(sd*0.03,0.166,0.094),P(sd*0.048,0.162,0.086)],0.005,3,L.hair,'cloth'));
  mTube(M,[P(-0.02,0.066,0.089),P(0,0.064,0.093),P(0.02,0.066,0.089)],0.0035,3,'#7a4a3a','skin');
  if(L.stache)mTube(M,[P(-0.034,0.07,0.082),P(-0.016,0.08,0.097),P(0,0.082,0.1),P(0.016,0.08,0.097),P(0.034,0.07,0.082)],[0.005,0.008,0.009,0.008,0.005],4,L.hair,'cloth');
  if(L.beard)mGrid(M,[[P(-0.055,0.06,0.06),P(0,0.06,0.09),P(0.055,0.06,0.06)],[P(-0.05,0.02,0.055),P(0,0.0,0.085),P(0.05,0.02,0.055)]],L.hair,'cloth',{ref:()=>P(0,0.05,0.02),two:true});
  // глаза (видны, когда очки подняты)
  if(L.goggleUp)[-1,1].forEach(sd=>{mLathe(M,P(sd*0.031,0.146,0.089),'z',[[0.011,-0.002],[0.009,0.004],[0,0.006]],8,'#f2eee6','skin');mLathe(M,P(sd*0.031,0.146,0.095),'z',[[0.0055,0],[0,0.0015]],6,'#2a2018','glass');});
  // волосы: оболочка затылка и макушки
  const hr=HEAD_ROWS.filter(q=>q[0]>=0.09),HG=hr.map(([h,rx,rz,dz])=>{const row=[];for(let k=0;k<=8;k++){const a=Math.PI+k/8*Math.PI,c=Math.cos(a),sn=Math.sin(a);row.push(P(c*rx*1.05,h+0.003,dz+sn*rz*1.1));}return row;});
  mGrid(M,HG,L.hair,'cloth',{ref:()=>P(0,0.14,0)});}
// Кожаный шлем: колпак над лбом и затылком, наушники, ремешок под подбородком, швы
function mHelmet(M,cx,cy,cz,col,hi,s){s=s||1;const sg=hi?16:7,P=(x,y,z)=>[cx+x*s,cy+y*s,cz+z*s],rows=[[0.12,1.1],[0.15,1.09],[0.18,1.08],[0.205,1.08],[0.222,1.08],[0.236,0.2]];
  const G=rows.map(([h,k])=>{const hr=HEAD_ROWS.reduce((b,q)=>Math.abs(q[0]-h)<Math.abs(b[0]-h)?q:b),row=[];for(let j=0;j<sg;j++){const a=j/sg*Math.PI*2,c=Math.cos(a),sn=Math.sin(a),front=sn>0.55;
      // спереди колпак выше (открыт лоб)
      const hh=front&&h<0.17?0.17:h;row.push(P(c*hr[1]*k,hh,hr[3]+sn*hr[2]*k*(sn<0?1.06:0.97)));}return row;});
  mGrid(M,G,col,'leather',{wrap:true,ref:()=>P(0,0.14,0)});
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
function mCrew3(M,x,seatY,z,kit,mech,S,hand){
  const hi=MLOD===1,sg=hi?14:6,L=crewLook(S,mech),coat=mech?shade(kit.coat,-0.12):kit.coat,y0=seatY+0.02;
  // торс: таз, талия, грудь, плечи (сечения-эллипсы, спина чуть откинута); пыльник — книзу шире
  const lv=[[0,0.18,0.125,0.02],[0.12,0.17,0.115,0],[0.26,0.175,0.112,-0.015],[0.4,0.195,0.115,-0.03],[0.5,0.215,0.112,-0.045],[0.56,0.222,0.1,-0.05],[0.6,0.19,0.086,-0.052],[0.625,0.1,0.065,-0.05],[0.64,0.06,0.052,-0.045]];
  const G=lv.map(([h,wx,wz,dz])=>{const row=[];for(let k=0;k<sg;k++){const a=k/sg*Math.PI*2,c=Math.cos(a),sn=Math.sin(a);row.push([x+c*wx*(1+0.08*Math.max(0,-sn)*(h<0.3?1:0)),y0+h,z+dz+sn*wz]);}return row;});
  mGrid(M,G,coat,'cloth',{wrap:true,ref:(c,i)=>[x,y0+(lv[i][0]+lv[i+1][0])/2,z+lv[i][3]]});
  if(hi){// пояс, пуговицы, воротник
    const bl=[];for(let k=0;k<=sg;k++){const a=k/sg*Math.PI*2;bl.push([x+Math.cos(a)*0.173,y0+0.2,z-0.008+Math.sin(a)*0.117]);}mTube(M,bl,0.014,3,shade(coat,-0.3),'leather');
    for(let k=0;k<3;k++)mLathe(M,[x,y0+0.28+k*0.1,z-0.02+0.118-k*0.004],'z',[[0.008,0],[0.006,0.004],[0,0.005]],6,shade(coat,-0.35),'metal');
    const col=[];for(let k=0;k<=10;k++){const a=Math.PI*0.05+k/10*Math.PI*0.9;col.push([x-Math.cos(a)*0.075,y0+0.66,z-0.05-Math.sin(a)*0.06]);}
    mTube(M,[[x-0.078,y0+0.6,z+0.02]].concat(col).concat([[x+0.078,y0+0.6,z+0.02]]),0.022,4,shade(coat,-0.08),'cloth');}
  // шея и голова
  const hy=y0+0.7,hz=z-0.03;mLathe(M,[x,y0+0.6,hz],'y',[[0.052,0],[0.048,0.06],[0.05,0.11]],hi?10:5,shade(L.skin,-0.05),'skin');
  mHead(M,x,hy-0.02,hz,L,hi,1);
  if(mech||kit.cap==='cap'){mFlatCap(M,x,hy-0.02,hz,kit.hat,!mech&&L.capBack,hi,1);if(hi)mGoggles(M,x,hy-0.02,hz,true,hi,1);}
  else{mHelmet(M,x,hy-0.02,hz,kit.hat,hi,1);mGoggles(M,x,hy-0.02,hz,L.goggleUp,hi,1);}
  // руки: плечо — локоть — кисть в краге (у пилота — на руле, у механика — одна на борту, другая на поручне)
  const sy=y0+0.55,sz=z-0.05;[-1,1].forEach(sd=>{const sx=x+sd*0.2;
    const h=mech?(sd>0?[x+sd*0.3,seatY+0.3,z+0.1]:[x+sd*0.24,seatY+0.58,z+0.18]):[x+sd*0.14,hand[1],hand[2]];
    const el=[(sx+h[0])/2+sd*0.07,(sy+h[1])/2-0.13,(sz+h[2])/2-0.04],wr=[h[0]+(el[0]-h[0])*0.22,h[1]+(el[1]-h[1])*0.22,h[2]+(el[2]-h[2])*0.22];
    mTube(M,[[sx,sy+0.02,sz],[sx+(el[0]-sx)*0.5,sy+(el[1]-sy)*0.5,sz+(el[2]-sz)*0.5],el,wr],[0.056,0.05,0.045,0.043],hi?8:3,coat,'cloth');
    // крага и кисть
    mTube(M,[wr,[wr[0]+(h[0]-wr[0])*0.6,wr[1]+(h[1]-wr[1])*0.6,wr[2]+(h[2]-wr[2])*0.6]],[0.05,0.042],hi?8:3,'#5b3e28','leather');
    mLathe(M,h,'y',[[0,-0.035],[0.033,-0.022],[0.038,0.006],[0.026,0.03],[0,0.036]],hi?8:4,'#6b4a30','leather');
    if(hi&&!mech)mTube(M,[[h[0]-sd*0.02,h[1]+0.01,h[2]-0.01],[h[0]-sd*0.045,h[1]+0.03,h[2]+0.02]],0.013,4,'#6b4a30','leather');});
  // шарф: кольцо на шее и развевающийся конец (у механика — нет)
  if(!mech&&hi){const sc=L.scarf;mTube(M,[[x-0.07,y0+0.625,z-0.05],[x,y0+0.645,z+0.01],[x+0.07,y0+0.625,z-0.05],[x,y0+0.615,z-0.12],[x-0.07,y0+0.625,z-0.05]],0.028,5,sc,'cloth');
    // конец шарфа вьётся по ветру за плечом — узкая лента
    const R=[];for(let k=0;k<=6;k++){const t=k/6,wv=Math.sin(t*7)*0.025;R.push([[x+0.1+t*0.2,y0+0.6+t*0.03+wv,z-0.09-t*0.34],[x+0.1+t*0.2,y0+0.66+t*0.03+wv,z-0.09-t*0.34]]);}
    mGrid(M,R,sc,'cloth',{ref:()=>[x+0.1,y0+1.5,z-0.3],two:true});}
}
