/* ================= МИР ГОНКИ: деревья, дома, трибуны, зрители — объёмные спрайты, свет слева сверху ================= */
// Деревья и мелочь рисуются «живописно»: шары листвы с подсветкой как у сферы, мазки листьев, тени под кроной.
// Дома, трибуны и боксы — настоящие 3D-модели (см. 46-models.js), снятые в три четверти со стороны дороги.
const SUNL=(()=>{const v=[-0.55,-0.62,0.56],l=Math.hypot(...v);return v.map(x=>x/l);})(); // на свет: x вправо, y вниз, z к зрителю
const SCEN_PPM=34;
// Шар листвы: мягкая подложка и сотни мазков-листьев; освещение — от бока шара и от положения в кроне (CR — центр и размер кроны)
let CR=null;
function leafBall(c,rnd,x,y,r,base,dens,ry,rough){
  ry=ry||r;const g=c.createRadialGradient(x-r*0.3,y-ry*0.35,r*0.1,x,y,Math.max(r,ry));
  g.addColorStop(0,shade(base,0.1));g.addColorStop(0.65,base);g.addColorStop(1,shade(base,-0.22));
  c.fillStyle=g;c.beginPath();c.ellipse(x,y,r*0.86,ry*0.86,0,0,7);c.fill();
  const n=Math.round(r*ry*(dens||55)*1.25),sz=rough||1;
  for(let i=0;i<n;i++){const a=rnd()*6.283,d=Math.pow(rnd(),0.42)*1.1,dx=Math.cos(a)*d,dy=Math.sin(a)*d,nz=Math.sqrt(Math.max(0,1-Math.min(1,d*d)));
    let lit=dx*SUNL[0]+dy*SUNL[1]+nz*SUNL[2];if(CR){const X=(x+dx*r-CR[0])/CR[2],Y=(y+dy*ry-CR[1])/CR[3];lit=lit*0.55+(-X*0.55-Y*0.62)*0.6;}
    const s=(0.05+rnd()*0.08)*sz;c.fillStyle=shade(base,clamp(lit*0.34-0.04+(rnd()-0.5)*0.16,-0.5,0.45));c.beginPath();c.ellipse(x+dx*r,y+dy*ry,s*1.35,s,rnd()*3,0,7);c.fill();}
}
// Крона из многих шаров: сначала тёмная глубина всей кроны, затем шары снизу вверх — верхние бросают тень на нижние
function crown(c,rnd,cl,base,dens,rough){
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;cl.forEach(q=>{const ry=q[3]||q[2];x0=Math.min(x0,q[0]-q[2]);x1=Math.max(x1,q[0]+q[2]);y0=Math.min(y0,q[1]-ry);y1=Math.max(y1,q[1]+ry);});
  CR=[(x0+x1)/2,(y0+y1)/2,(x1-x0)/2,(y1-y0)/2];
  c.fillStyle=shade(base,-0.45);cl.forEach(q=>{const ry=q[3]||q[2];c.beginPath();c.ellipse(q[0]+q[2]*0.06,q[1]+ry*0.08,q[2]*0.95,ry*0.95,0,0,7);c.fill();});
  cl.sort((a,b)=>b[1]-a[1]).forEach(q=>leafBall(c,rnd,q[0],q[1],q[2],q[4]||base,dens,q[3],rough));CR=null;}
function blobCl(rnd,cx,cy,rx,ry,n,r0,r1){const out=[];for(let i=0;i<n;i++){const a=rnd()*6.283,d=Math.sqrt(rnd())*0.8;out.push([cx+Math.cos(a)*rx*d,cy+Math.sin(a)*ry*d,r0+rnd()*(r1-r0)]);}return out;}
// Ствол: сужается, чуть изогнут, освещён слева, с бороздами коры
function trunk(c,rnd,x0,y0,x1,y1,w0,w1,col,bend,marks){
  const g=c.createLinearGradient(Math.min(x0,x1)-w0,0,Math.max(x0,x1)+w0,0);g.addColorStop(0,shade(col,0.22));g.addColorStop(0.4,col);g.addColorStop(1,shade(col,-0.5));
  const bx=(x0+x1)/2+(bend||0),by=(y0+y1)/2;c.fillStyle=g;c.beginPath();c.moveTo(x0-w0,y0);c.quadraticCurveTo(bx-(w0+w1)/2,by,x1-w1,y1);c.lineTo(x1+w1,y1);c.quadraticCurveTo(bx+(w0+w1)/2,by,x0+w0,y0);c.closePath();c.fill();
  if(marks!==false){c.lineCap='round';const L=Math.abs(y1-y0),n=Math.round(L*(marks||4));for(let i=0;i<n;i++){const t=rnd(),w=w0+(w1-w0)*t,x=x0+(x1-x0)*t+(bend||0)*4*t*(1-t)+(rnd()-0.5)*w*1.5,y=y0+(y1-y0)*t;c.strokeStyle=shade(col,-0.3-rnd()*0.2);c.lineWidth=0.025+rnd()*0.03;c.beginPath();c.moveTo(x,y);c.lineTo(x+(rnd()-0.5)*0.04,y-0.15-rnd()*0.35);c.stroke();}}
}
function limb(c,x0,y0,x1,y1,w,col,bow){c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(x0,y0);c.quadraticCurveTo((x0+x1)/2+(bow||0),(y0+y1)/2,x1,y1);c.stroke();}
// Мягкая тень на земле (правее и чуть дальше — свет слева)
function gShadow(c,rx,ry,dx,a){c.save();c.translate(dx||rx*0.25,0);c.scale(1,ry/rx);const g=c.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,`rgba(18,28,10,${a||0.36})`);g.addColorStop(0.7,`rgba(18,28,10,${(a||0.36)*0.45})`);g.addColorStop(1,'rgba(18,28,10,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,rx,0,7);c.fill();c.restore();}
function grassTuft(c,rnd,x,y,s,col){c.lineCap='round';for(let i=0;i<7;i++){const a=-Math.PI/2+(rnd()-0.5)*1.3,l=s*(0.5+rnd()*0.6);c.strokeStyle=shade(col,(rnd()-0.4)*0.35);c.lineWidth=s*0.09;c.beginPath();c.moveTo(x+(rnd()-0.5)*s*0.3,y);c.quadraticCurveTo(x+Math.cos(a)*l*0.3,y+Math.sin(a)*l*0.6,x+Math.cos(a)*l,y+Math.sin(a)*l);c.stroke();}}
/* ---------- деревья, кусты, изгороди ---------- */
const SCENERY={
  plane:{w:11,h:15,draw:(c,r,v)=>{gShadow(c,4.5,1.1);trunk(c,r,0,0,0.15,-7.2,0.45,0.3,'#9a947f',0.3,false);
    for(let i=0;i<26;i++){const t=r(),y=-t*7,x=(r()-0.5)*0.6*(1-t*0.35);c.fillStyle=['#d9d3b8','#b8b397','#7d7a62','#c9c5a6'][Math.floor(r()*4)];c.beginPath();c.ellipse(x,y,0.12+r()*0.12,0.18+r()*0.22,0,0,7);c.fill();}
    limb(c,0.1,-6.5,-1.8,-9.2,0.22,'#8d8672',0.3);limb(c,0.15,-6.8,1.9,-9.5,0.2,'#8d8672',-0.3);limb(c,0.15,-7,0.3,-11,0.18,'#8d8672');
    crown(c,r,blobCl(r,0,-10.2,4.3,3.2,11+v,1.3,2.0),['#4d7836','#557d38','#4a7234'][v%3],50);}},
  poplar:{w:4,h:19,draw:(c,r,v)=>{gShadow(c,1.8,0.5);trunk(c,r,0,0,0,-4,0.28,0.2,'#5d4a36');
    const cl=[];for(let i=0;i<26;i++){const t=i/25,y=-3.2-15*t,w=1.25*Math.sin(Math.PI*Math.min(1,0.1+t*0.93))+0.2;cl.push([(r()-0.5)*w*0.9,y,0.4+w*0.4,0.75+w*0.3]);}
    crown(c,r,cl,['#3e6a31','#44713a','#3a6330'][v%3],60,0.85);}},
  cypress:{w:2.8,h:14,draw:(c,r,v)=>{gShadow(c,1.3,0.4);trunk(c,r,0,0,0,-1.4,0.18,0.14,'#4a3a28',0,false);
    const H=12.5+v*0.6,cl=[];for(let i=0;i<14;i++){const t=i/13,w=1.1*Math.pow(Math.sin(Math.PI*(0.08+t*0.92)),0.8)*(1-t*0.35)+0.08;cl.push([(r()-0.5)*0.25,-1.2-t*(H-1.8),Math.max(0.25,w),0.75]);}
    crown(c,r,cl,'#2e4c2f',70,0.75);}},
  olive:{w:6.5,h:6,draw:(c,r,v)=>{gShadow(c,2.8,0.7);trunk(c,r,-0.2,0,-0.5,-2.4,0.38,0.2,'#6a5c4a',0.4);trunk(c,r,0.1,-0.4,0.8,-2.6,0.22,0.14,'#6a5c4a',-0.3);
    crown(c,r,blobCl(r,0,-3.6,2.6,1.3,9,0.8,1.25).map(q=>[q[0],q[1],q[2],q[2]*0.8]),'#7b8a62',48);}},
  pine:{w:8,h:13,draw:(c,r,v)=>{gShadow(c,3.4,0.8,1.2);trunk(c,r,0,0,0.6,-9.6,0.3,0.16,'#7a5a3e',-0.5,5);
    limb(c,0.55,-9.2,-1.8,-10.4,0.14,'#6a4c34',0.2);limb(c,0.6,-9.4,2.6,-10.6,0.14,'#6a4c34',-0.2);
    crown(c,r,blobCl(r,0.5,-10.9,3.4,0.7,9,0.9,1.4).map(q=>[q[0],q[1],q[2],q[2]*0.55]),'#3b5f33',55);}},
  fir:{w:5,h:14,draw:(c,r,v)=>{gShadow(c,2.2,0.55);trunk(c,r,0,0,0,-1.8,0.2,0.16,'#4a3626',0,false);const snow=v===1;
    for(let i=0;i<6;i++){const y0=-1.2-i*1.9,w=2.2-i*0.34,h=3.1-i*0.12,top=y0-h;
      c.fillStyle=vgrad(c,top,y0,[[0,'#2f5d3c'],[1,'#1b3a27']]);c.beginPath();c.moveTo(0,top);
      for(let k=0;k<=8;k++){const t=k/8,x=-w+2*w*t,y=y0-Math.abs(0.5-t)*0.3+(k%2?0.25:0);c.lineTo(x,y);}c.closePath();c.fill();
      c.fillStyle='rgba(120,170,110,.28)';c.beginPath();c.moveTo(0,top);c.lineTo(-w*0.95,y0);c.lineTo(-w*0.2,y0-0.1);c.closePath();c.fill();
      c.strokeStyle='rgba(10,30,18,.35)';c.lineWidth=0.04;for(let k=0;k<10;k++){const t=r(),x=(t-0.5)*2*w*0.9;c.beginPath();c.moveTo(x*0.5,top+h*0.35);c.lineTo(x,y0);c.stroke();}
      if(snow){c.fillStyle='#eef2f6';c.beginPath();c.moveTo(0,top);c.lineTo(-w*0.75,y0-h*0.25);c.quadraticCurveTo(0,y0-h*0.55,w*0.7,y0-h*0.28);c.closePath();c.fill();}}}},
  oak:{w:10,h:11,draw:(c,r,v)=>{gShadow(c,4.3,1.1);trunk(c,r,0,0,0.1,-4.2,0.55,0.4,'#5f4a36',0.2,6);
    limb(c,0,-3.8,-2.4,-6,0.3,'#5a4632',0.4);limb(c,0.1,-4,2.5,-6.3,0.28,'#5a4632',-0.4);limb(c,0.1,-4.1,0.2,-7.5,0.24,'#5a4632');
    crown(c,r,blobCl(r,0,-6.8,4.2,2.9,13+v,1.2,1.9),['#48692f','#4e7034','#43642c'][v%3],50);}},
  elm:{w:9,h:13,draw:(c,r,v)=>{gShadow(c,3.8,1.0);trunk(c,r,0,0,0,-3.6,0.4,0.3,'#5d4a35',0,5);
    [-1,-0.35,0.35,1].forEach(k=>limb(c,0,-3.4,k*2.6,-8.2,0.22,'#58452f',-k*0.4));
    crown(c,r,blobCl(r,0,-9.2,3.9,2.5,12,1.1,1.7).concat(blobCl(r,0,-7.2,2.6,1.2,4,0.9,1.2)),['#557a37','#5b8039'][v%2],50);}},
  palm:{w:7,h:13,draw:(c,r,v)=>{gShadow(c,2.2,0.5,1.5);const top=[0.9,-11.3];
    for(let i=0;i<22;i++){const t=i/22,t2=(i+1)/22,x=0.9*Math.sin(t*1.6)*t,x2=0.9*Math.sin(t2*1.6)*t2,w=0.26-0.08*t;c.fillStyle=i%2?'#8a6c4c':'#9c7c58';c.beginPath();c.moveTo(x-w,-t*11.3);c.lineTo(x2-w*0.98,-t2*11.3-0.04);c.lineTo(x2+w*0.98,-t2*11.3-0.04);c.lineTo(x+w,-t*11.3);c.closePath();c.fill();c.fillStyle='rgba(40,25,10,.35)';c.fillRect(x-w*0.1,-t*11.3-0.05,w*1.1,0.5);}
    for(let i=0;i<11;i++){const a=i/11*6.283+0.3,L=2.6+r()*0.9,back=Math.sin(a)<0,ex=top[0]+Math.cos(a)*L,ey=top[1]+Math.abs(Math.sin(a))*0.6*L*0.5+(back?-0.8:0.6),mx=top[0]+Math.cos(a)*L*0.5,my=top[1]-0.9;
      const col=back?'#2f5a2a':'#4a7a38';c.strokeStyle=shade(col,-0.25);c.lineWidth=0.09;c.beginPath();c.moveTo(top[0],top[1]);c.quadraticCurveTo(mx,my,ex,ey);c.stroke();
      for(let k=1;k<16;k++){const t=k/16,x=(1-t)*(1-t)*top[0]+2*(1-t)*t*mx+t*t*ex,y=(1-t)*(1-t)*top[1]+2*(1-t)*t*my+t*t*ey,ll=0.8*(1-t*0.55);c.strokeStyle=shade(col,(r()-0.4)*0.25);c.lineWidth=0.1;c.lineCap='round';
        [-1,1].forEach(sd=>{c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+sd*ll*0.2,y+ll*0.2,x+sd*ll*0.3*Math.abs(Math.sin(a))+ll*0.12*Math.cos(a),y+ll*0.6);c.stroke();});}}
    leafBall(c,r,top[0],top[1]+0.2,0.35,'#6b5334',30);}},
  birch:{w:4.5,h:13,draw:(c,r,v)=>{gShadow(c,1.9,0.55);trunk(c,r,0,0,0.2,-9.5,0.2,0.1,'#e9e8e0',0.2,false);
    for(let i=0;i<16;i++){const t=r(),y=-t*9,x=0.2*t;c.fillStyle='#2a2622';c.fillRect(x-0.18+r()*0.12,y,0.08+r()*0.18,0.05+r()*0.05);}
    limb(c,0.15,-6,-1.2,-8.3,0.07,'#4a4038',0.2);limb(c,0.2,-7,1.3,-9.4,0.06,'#4a4038',-0.2);
    crown(c,r,blobCl(r,0.2,-9.4,1.9,2.8,12,0.6,1.0),['#79a24b','#83a852'][v%2],42,0.85);}},
  bush:{w:3.4,h:1.9,draw:(c,r,v)=>{gShadow(c,1.6,0.4,0.3);crown(c,r,blobCl(r,0,-0.8,1.3,0.45,6,0.45,0.75),['#4a6f35','#557a3a','#46693a'][v%3],55);}},
  hedge:{w:12,h:1.9,draw:(c,r)=>{gShadow(c,6.2,0.45,0.2);rrect(c,-5.9,-1.5,11.8,1.5,0.6,'#2f4f25');const cl=[];for(let i=0;i<14;i++)cl.push([-5.5+i*0.85+(r()-0.5)*0.2,-1.15-r()*0.25,0.55+r()*0.15,0.5]);crown(c,r,cl,'#46703a',70,0.8);}},
  vine:{w:12,h:1.6,draw:(c,r)=>{for(let i=0;i<6;i++){const x=-5.5+i*2.2;gShadow(c,0.8,0.2,x+0.2);c.fillStyle='#6b5236';c.fillRect(x-0.04,-1.4,0.08,1.4);crown(c,r,blobCl(r,x,-0.85,0.7,0.35,3,0.35,0.5),'#5e8a3a',60,0.7);
    for(let k=0;k<4;k++){c.fillStyle='#3a2a4a';c.beginPath();c.arc(x+(r()-0.5)*0.9,-0.6+r()*0.3,0.07,0,7);c.fill();}}}},
  hay:{w:4.4,h:3.3,draw:(c,r)=>{gShadow(c,2.2,0.5);c.beginPath();c.moveTo(-1.9,0);c.bezierCurveTo(-2.1,-2.2,-1,-3.1,0,-3.1);c.bezierCurveTo(1,-3.1,2.1,-2.2,1.9,0);c.closePath();
    const g=c.createRadialGradient(-0.7,-2.2,0.2,0,-1.2,2.6);g.addColorStop(0,'#f0d887');g.addColorStop(0.6,'#c9a64e');g.addColorStop(1,'#8a6e2c');c.fillStyle=g;c.fill();
    c.lineCap='round';for(let i=0;i<120;i++){const x=(r()-0.5)*3.6,top=-3.1*Math.sqrt(Math.max(0,1-(x/1.95)**2)),y=top+r()*(-top);c.strokeStyle=r()<0.5?'rgba(255,236,160,.5)':'rgba(110,80,30,.4)';c.lineWidth=0.03;c.beginPath();c.moveTo(x,y);c.lineTo(x+(r()-0.5)*0.3,y+0.25);c.stroke();}}},
  rock:{w:4.2,h:2.4,draw:(c,r,v)=>{gShadow(c,2,0.45,0.2);const base='#9c9384';[[0,-0.9,1.8,1.0],[-0.6,-1.3,0.9,0.6],[0.8,-0.6,0.9,0.55]].forEach(([x,y,rx,ry])=>{const g=c.createRadialGradient(x-rx*0.4,y-ry*0.5,0.05,x,y,rx*1.1);g.addColorStop(0,'#cfc6b4');g.addColorStop(0.6,base);g.addColorStop(1,'#5e574c');c.fillStyle=g;c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fill();});
    c.strokeStyle='rgba(60,52,44,.5)';c.lineWidth=0.04;for(let i=0;i<6;i++){c.beginPath();const x=(r()-0.5)*2.4,y=-0.4-r()*1.2;c.moveTo(x,y);c.lineTo(x+(r()-0.5)*0.6,y+0.3);c.stroke();}grassTuft(c,r,-1.5,0,0.5,'#6f8f45');grassTuft(c,r,1.4,0,0.45,'#6f8f45');}},
  cliff:{w:14,h:9.5,draw:(c,r)=>{c.beginPath();c.moveTo(-7,0);c.lineTo(-6.2,-5.6);c.lineTo(-4.4,-7.4);c.lineTo(-2.8,-8.6);c.lineTo(0.6,-7.8);c.lineTo(2.6,-9.1);c.lineTo(5,-7.6);c.lineTo(6.6,-5.4);c.lineTo(7,0);c.closePath();c.fillStyle=hgrad(c,-7,7,[[0,'#c7bca2'],[0.5,'#a39880'],[1,'#6f6553']]);c.fill();
    for(let i=0;i<9;i++){const y=-0.8-i*0.9;c.strokeStyle='rgba(80,70,56,.35)';c.lineWidth=0.08;c.beginPath();c.moveTo(-6.6,y+r()*0.3);for(let x=-6;x<=6.6;x+=1.2)c.lineTo(x,y+(r()-0.5)*0.35);c.stroke();}
    for(let i=0;i<22;i++){const x=(r()-0.5)*12,y=-r()*7.5;c.fillStyle=`rgba(${r()<0.5?'230,220,196':'70,62,50'},.3)`;c.beginPath();c.moveTo(x,y);c.lineTo(x+0.5+r()*0.8,y+0.1);c.lineTo(x+0.3,y+0.6+r()*0.6);c.closePath();c.fill();}
    crown(c,r,blobCl(r,-4,-7.6,1.6,0.4,4,0.35,0.6),'#6f7d4e',60,0.7);crown(c,r,blobCl(r,3,-8.4,1.4,0.3,3,0.3,0.5),'#6f7d4e',60,0.7);}}
};
// Спрайт декорации: холст в метрах, основание — нижний центр (плюс поле под тенью)
function scenSprite(type,variant,side){
  const sd=side<0?-1:1,key='sc|'+type+'|'+variant+'|'+(SCENERY[type]&&SCENERY[type].m3?sd:0);if(SPR.cache[key])return SPR.cache[key];
  const D=SCENERY[type];if(!D)return null;
  if(D.m3){const o=D.m3(variant,sd);SPR.cache[key]=o;return o;}
  const P=D.ppm||SCEN_PPM,pad=D.pad===undefined?0.7:D.pad,W=D.w*P,H=(D.h+pad)*P,cv=mkCanvas(W,H),c=cv.getContext('2d');
  c.translate(W/2,D.h*P);c.scale(P,P);const rnd=mulberry32(hashStr(key));D.draw(c,rnd,variant||0);
  const o={img:cv,wM:D.w,hM:D.h+pad,ax:0.5,ay:D.h/(D.h+pad)};SPR.cache[key]=o;return o;
}
/* ---------- мелочь у дороги: заборы, стены, столбы, знаки, повозки ---------- */
Object.assign(SCENERY,{
  wall:{w:10,h:1.5,draw:(c,r)=>{gShadow(c,5.2,0.35,0.3,0.3);c.fillStyle='#6f685c';c.fillRect(-5,-1.25,10,1.25);
    for(let row=0;row<4;row++){let x=-5+(row%2)*0.3;while(x<5){const w=0.45+r()*0.45,y=-1.2+row*0.3,col=shade(['#b3aa96','#a39a88','#c2b9a5','#968d7c'][Math.floor(r()*4)],0);
      const g=c.createLinearGradient(x,y,x,y+0.27);g.addColorStop(0,shade('#bdb4a0',(r()-0.3)*0.25));g.addColorStop(1,shade('#8f8676',(r()-0.5)*0.2));c.fillStyle=g;rrect(c,x+0.02,y+0.02,Math.min(w,5-x)-0.04,0.26,0.06,c.fillStyle);x+=w;}}
    for(let x=-5;x<5;x+=0.6){rrect(c,x+0.02,-1.45,0.56,0.24,0.05,shade('#cbc3b0',(r()-0.5)*0.15));}
    grassTuft(c,r,-4.2,0,0.4,'#6f8f45');grassTuft(c,r,1.3,0,0.35,'#6f8f45');grassTuft(c,r,3.9,0,0.4,'#6f8f45');}},
  fence:{w:10,h:1.5,draw:(c,r)=>{for(let x=-5;x<=5.01;x+=1.25){gShadow(c,0.3,0.08,x+0.15,0.3);c.fillStyle=hgrad(c,x-0.07,x+0.07,[[0,'#a07e58'],[1,'#5e4630']]);c.fillRect(x-0.07,-1.4,0.14,1.4);c.fillStyle='#7a5c3e';c.beginPath();c.moveTo(x-0.08,-1.4);c.lineTo(x,-1.5);c.lineTo(x+0.08,-1.4);c.fill();}
    [-1.15,-0.62].forEach(y=>{c.fillStyle=vgrad(c,y,y+0.12,[[0,'#a88660'],[1,'#6a5036']]);c.fillRect(-5,y,10,0.12);});
    for(let i=0;i<8;i++)grassTuft(c,r,-5+r()*10,0,0.35,'#6f8f45');}},
  pole:{w:3,h:8.2,draw:(c,r)=>{gShadow(c,0.5,0.12,0.3);c.fillStyle=hgrad(c,-0.11,0.11,[[0,'#7a624a'],[1,'#3e3024']]);c.fillRect(-0.11,-8,0.22,8);
    c.fillStyle=vgrad(c,-7.5,-7.3,[[0,'#6e5842'],[1,'#3e3024']]);c.fillRect(-1.25,-7.5,2.5,0.16);c.fillRect(-0.9,-6.8,1.8,0.13);
    [-1.05,-0.4,0.4,1.05].forEach(x=>{ell(c,x,-7.62,0.07,0.1,'#e6eef2');ell(c,x-0.02,-7.65,0.03,0.05,'#fff');});[-0.7,0.7].forEach(x=>ell(c,x,-6.9,0.06,0.09,'#e6eef2'));
    c.strokeStyle='rgba(30,30,30,.55)';c.lineWidth=0.02;[-1.05,-0.4,0.4,1.05].forEach(x=>{c.beginPath();c.moveTo(x,-7.7);c.quadraticCurveTo(x+0.4,-7.45,x+1.4,-7.2);c.stroke();});grassTuft(c,r,0,0,0.4,'#6f8f45');}},
  km:{w:1,h:1.2,draw:(c,r)=>{gShadow(c,0.45,0.12,0.15);c.fillStyle=hgrad(c,-0.35,0.35,[[0,'#f6f4ec'],[1,'#b9b5a8']]);c.beginPath();c.moveTo(-0.35,0);c.lineTo(-0.35,-0.78);c.quadraticCurveTo(-0.35,-1.08,0,-1.1);c.quadraticCurveTo(0.35,-1.08,0.35,-0.78);c.lineTo(0.35,0);c.closePath();c.fill();
    c.fillStyle=hgrad(c,-0.35,0.35,[[0,'#d8473a'],[1,'#8e2a20']]);c.beginPath();c.moveTo(-0.35,-0.78);c.quadraticCurveTo(-0.35,-1.08,0,-1.1);c.quadraticCurveTo(0.35,-1.08,0.35,-0.78);c.closePath();c.fill();
    c.fillStyle='#222';c.font='bold 0.2px sans-serif';c.textAlign='center';c.fillText(String(3+Math.floor(r()*80)),0,-0.4);grassTuft(c,r,-0.35,0,0.3,'#6f8f45');}},
  sign:{w:2,h:3.1,draw:(c,r,v)=>{gShadow(c,0.4,0.1,0.2);c.fillStyle=hgrad(c,-0.07,0.07,[[0,'#6a5a48'],[1,'#3a2e22']]);c.fillRect(-0.07,-3,0.14,3);
    rrect(c,-0.92,-3.05,1.84,1.14,0.08,'#2a2622');rrect(c,-0.86,-3,1.72,1.04,0.06,'#f2c534');c.fillStyle='rgba(255,255,255,.25)';c.fillRect(-0.86,-3,1.72,0.3);
    c.strokeStyle='#1a1a1a';c.lineWidth=0.16;c.lineJoin='miter';for(let k=0;k<3;k++){const x=-0.5+k*0.5,d=v?1:-1;c.beginPath();c.moveTo(x-0.13*d,-2.78);c.lineTo(x+0.13*d,-2.46);c.lineTo(x-0.13*d,-2.14);c.stroke();}}},
  lamp:{w:1.3,h:5.2,draw:(c,r)=>{gShadow(c,0.35,0.1,0.2);c.fillStyle=hgrad(c,-0.08,0.08,[[0,'#4a4c52'],[1,'#1c1d20']]);c.fillRect(-0.07,-4.4,0.14,4.4);rrect(c,-0.16,-0.5,0.32,0.5,0.04,'#26272b');
    c.fillStyle='#2a2c30';c.beginPath();c.moveTo(-0.28,-4.45);c.lineTo(0.28,-4.45);c.lineTo(0.2,-5.0);c.lineTo(-0.2,-5.0);c.closePath();c.fill();
    const g=c.createRadialGradient(0,-4.72,0.02,0,-4.72,0.25);g.addColorStop(0,'#fff6d0');g.addColorStop(1,'#d8b058');c.fillStyle=g;c.fillRect(-0.18,-4.95,0.36,0.45);c.fillStyle='#2a2c30';c.fillRect(-0.02,-4.95,0.04,0.45);
    c.beginPath();c.moveTo(-0.3,-5);c.lineTo(0.3,-5);c.lineTo(0,-5.18);c.closePath();c.fill();}},
  cart:{w:7.4,h:3,draw:(c,r)=>{gShadow(c,2.6,0.4,0.2);
    // лошадь
    const hc='#6e4a2c';c.fillStyle=vgrad(c,-2,-0.9,[[0,shade(hc,0.15)],[1,shade(hc,-0.25)]]);c.beginPath();c.ellipse(-2.1,-1.45,0.95,0.42,0,0,7);c.fill();
    [[-2.8,0],[-2.55,0],[-1.6,0],[-1.35,0]].forEach(([x])=>{c.fillStyle=shade(hc,-0.2);c.fillRect(x-0.06,-1.25,0.12,1.25);c.fillStyle='#2a1a10';c.fillRect(x-0.07,-0.1,0.14,0.1);});
    c.fillStyle=hc;c.beginPath();c.moveTo(-2.8,-1.6);c.lineTo(-3.25,-2.3);c.lineTo(-3.05,-2.45);c.lineTo(-2.55,-1.75);c.closePath();c.fill();c.beginPath();c.ellipse(-3.28,-2.35,0.3,0.15,-0.5,0,7);c.fill();
    c.fillStyle='#2a1a10';c.beginPath();c.moveTo(-2.75,-1.75);c.lineTo(-3.1,-2.45);c.lineTo(-2.9,-2.5);c.lineTo(-2.55,-1.85);c.closePath();c.fill();c.beginPath();c.moveTo(-1.15,-1.5);c.quadraticCurveTo(-0.9,-1.2,-1.0,-0.7);c.lineWidth=0.08;c.strokeStyle='#2a1a10';c.stroke();
    // телега
    c.strokeStyle='#4a3420';c.lineWidth=0.07;c.beginPath();c.moveTo(-2.4,-1.4);c.lineTo(-0.9,-1.3);c.stroke();
    c.fillStyle=vgrad(c,-2.1,-1.2,[[0,'#a07e58'],[1,'#6a5036']]);c.beginPath();c.moveTo(-1.0,-2.0);c.lineTo(2.2,-2.0);c.lineTo(2.0,-1.15);c.lineTo(-0.85,-1.15);c.closePath();c.fill();
    c.strokeStyle='rgba(40,25,10,.5)';c.lineWidth=0.03;for(let k=1;k<4;k++){c.beginPath();c.moveTo(-0.95,-2+k*0.21);c.lineTo(2.15,-2+k*0.21);c.stroke();}
    crown(c,r,blobCl(r,0.6,-2.15,1.3,0.25,5,0.25,0.4),'#c9a64e',40,0.6);
    [[0.1,0.62],[1.5,0.62]].forEach(([x,R])=>{ell(c,x,-R,R,R,'#3b2a1c');ell(c,x,-R,R*0.82,R*0.82,'#8a6a44');c.strokeStyle='#3b2a1c';c.lineWidth=0.05;for(let k=0;k<8;k++){const a=k/8*6.283;c.beginPath();c.moveTo(x,-R);c.lineTo(x+Math.cos(a)*R*0.8,-R+Math.sin(a)*R*0.8);c.stroke();}ell(c,x,-R,0.1,0.1,'#3b2a1c');});}},
  sea:{w:40,h:1.4,pad:0.2,draw:(c,r)=>{c.fillStyle=vgrad(c,-1.3,0,[[0,'#2f6f98'],[0.6,'#3f86b0'],[1,'#7fb6c8']]);rrect(c,-20,-1.3,40,1.3,0.2,c.fillStyle);
    for(let i=0;i<70;i++){const y=-1.25+r()*1.2,w=0.5+r()*1.4;c.fillStyle=`rgba(255,255,255,${0.25+r()*0.5})`;c.fillRect(-19.5+r()*38,y,w*(0.4+(y+1.3)),0.05);}c.fillStyle='rgba(255,255,255,.75)';c.fillRect(-20,-0.08,40,0.08);}},
  dune:{w:11,h:2.6,draw:(c,r)=>{c.beginPath();c.moveTo(-5.5,0);c.bezierCurveTo(-3.5,-2.6,1.5,-2.8,5.5,0);c.closePath();c.fillStyle=hgrad(c,-5,5,[[0,'#efdcaa'],[0.55,'#d9bf82'],[1,'#b8985c']]);c.fill();
    c.strokeStyle='rgba(150,120,70,.35)';c.lineWidth=0.04;for(let i=0;i<8;i++){c.beginPath();const y=-0.3-i*0.25;c.moveTo(-4+i*0.3,y);c.quadraticCurveTo(0,y-0.3,3.5-i*0.2,y+0.1);c.stroke();}
    for(let i=0;i<9;i++)grassTuft(c,r,-4+r()*8,-r()*1.6,0.45,'#8a9a5a');}},
  billboard:{w:8,h:5.8,draw:(c,r,v)=>{gShadow(c,3.6,0.35,0.3);[-3.1,2.9].forEach(x=>{c.fillStyle=hgrad(c,x,x+0.22,[[0,'#7a624a'],[1,'#3e3024']]);c.fillRect(x,-2.4,0.22,2.4);});
    const ads=[['ШИНЫ','#1f3f7a','#f1e6c8','ПРОЧНЫЕ И БЫСТРЫЕ'],['БЕНЗИН','#b8322a','#f7ecd0','ДЛЯ ГОНОК'],['СВЕЧИ','#2b5a3a','#f1e6c8','ИСКРА ВЕРНАЯ'],['МАСЛО','#3a2a1c','#e8c56a','МОТОР БЕРЕЖЁТ']][v%4];
    rrect(c,-3.95,-5.65,7.9,3.45,0.08,'#e8e0cc');rrect(c,-3.8,-5.5,7.6,3.15,0.05,ads[1]);c.fillStyle='rgba(255,255,255,.12)';c.fillRect(-3.8,-5.5,7.6,1.2);
    c.fillStyle=ads[2];c.font='bold 1.35px Impact,"Arial Black",sans-serif';c.textAlign='center';c.fillText(ads[0],0,-3.6);c.font='bold 0.42px sans-serif';c.fillText(ads[3],0,-2.75);}},
  banner:{w:14,h:7.6,pad:0.3,draw:(c,r)=>{[-6.8,6.5].forEach(x=>{c.fillStyle=hgrad(c,x,x+0.3,[[0,'#6a5a48'],[1,'#2e241a']]);c.fillRect(x,-7.5,0.3,7.5);});
    c.fillStyle='rgba(0,0,0,.25)';c.fillRect(-6.5,-7.25,13.2,1.55);rrect(c,-6.6,-7.45,13.2,1.55,0.05,'#f1ece0');
    for(let k=0;k<22;k++){c.fillStyle=k%2?'#111':'#f1ece0';c.fillRect(-6.6+k*0.6,-6.2,0.6,0.3);c.fillStyle=k%2?'#f1ece0':'#111';c.fillRect(-6.6+k*0.6,-7.45,0.6,0.22);}
    c.fillStyle='#1c1406';c.font='bold 0.95px Impact,"Arial Black",sans-serif';c.textAlign='center';c.fillText('ФИНИШ',0,-6.45);
    [-6.65,6.65].forEach(x=>{c.fillStyle='#b8322a';c.beginPath();c.moveTo(x,-7.5);c.lineTo(x+(x<0?-0.9:0.9),-7.9);c.lineTo(x,-8.2);c.closePath();c.fill();});}}
});
/* ---------- здания: 3D-модели в три четверти со стороны дороги ---------- */
// Фасад смотрит на дорогу: у дома слева от дороги — вправо (+x); дом справа — зеркальная копия
function mMirrorX(M){const mx=q=>[-q[0],q[1],q[2]];M.F.forEach(f=>{f.p=f.p.map(mx).reverse();f.n=[-f.n[0],f.n[1],f.n[2]];if(f.deco)f.deco.forEach(d=>{['a','b','dot'].forEach(k=>{if(d[k])d[k]=mx(d[k]);});if(d.poly)d.poly=d.poly.map(mx);if(d.at){d.at=d.at.map(mx);d.at=[d.at[1],d.at[0],[d.at[2][0]+(d.at[1][0]-d.at[0][0]),d.at[2][1],d.at[2][2]+(d.at[1][2]-d.at[0][2])]];}if(d.ring)d.ring=[-d.ring[0],d.ring[1],d.ring[2],d.ring[3]];});});
  if(M.foot)M.foot=[-M.foot[1],M.foot[1]===undefined?0:-M.foot[0],M.foot[2],M.foot[3]];return M;}
// Окно на стене: P(u,v) — точка стены по горизонтали u и высоте v; ставни, рама, переплёт, подоконник
function wWin(f,P,u,v,w,h,o){o=o||{};f.deco=f.deco||[];const d=f.deco,fr=o.frame||'#ece6d8',q=(u0,v0,u1,v1)=>[P(u0,v0),P(u1,v0),P(u1,v1),P(u0,v1)];
  if(o.shut){[-1,1].forEach(s=>{const a=u+s*(w/2+0.04),b=u+s*(w/2+0.04+w*0.48),u0=Math.min(a,b),u1=Math.max(a,b);d.push({poly:q(u0,v,u1,v+h),c:o.shut});for(let k=1;k<7;k++)d.push({a:P(u0+0.03,v+h*k/7),b:P(u1-0.03,v+h*k/7),w:0.022,c:shade(o.shut,-0.35)});});}
  if(o.arch){const pts=[];for(let k=0;k<=10;k++){const a=Math.PI*k/10;pts.push(P(u+Math.cos(a)*(w/2+0.07),v+h+Math.sin(a)*(w/2+0.07)));}d.push({poly:[P(u-w/2-0.07,v-0.07),P(u+w/2+0.07,v-0.07)].concat(pts),c:fr});
    const g=[];for(let k=0;k<=10;k++){const a=Math.PI*k/10;g.push(P(u+Math.cos(a)*w/2,v+h+Math.sin(a)*w/2));}d.push({poly:[P(u-w/2,v),P(u+w/2,v)].concat(g),c:o.glass||'#3a4a5a',gl:1});}
  else{d.push({poly:q(u-w/2-0.07,v-0.07,u+w/2+0.07,v+h+0.07),c:fr});d.push({poly:q(u-w/2,v,u+w/2,v+h),c:o.glass||'#34465a',gl:1});}
  d.push({poly:q(u-w/2+0.04,v+h*0.55,u-0.02,v+h-0.04),c:'#5b7188',gl:1,k:1.15});
  d.push({a:P(u,v),b:P(u,v+h),w:0.045,c:fr});d.push({a:P(u-w/2,v+h*0.6),b:P(u+w/2,v+h*0.6),w:0.045,c:fr});
  d.push({poly:q(u-w/2-0.13,v-0.14,u+w/2+0.13,v-0.05),c:o.sill||'#d9d2c2'});
  if(o.box){d.push({poly:q(u-w/2,v-0.36,u+w/2,v-0.14),c:'#7a4a2a'});for(let k=0;k<7;k++)d.push({dot:P(u-w/2+0.08+k*(w-0.16)/6,v-0.1+((k*7)%3)*0.03),r:0.06,c:['#d8473a','#f0c330','#e87aa0'][k%3]});}
  if(o.bal){const y0=v-0.1,y1=v+h*0.38;d.push({a:P(u-w/2-0.15,y1),b:P(u+w/2+0.15,y1),w:0.04,c:'#2a2a2e'});for(let k=0;k<=8;k++){const uu=u-w/2-0.15+k*(w+0.3)/8;d.push({a:P(uu,y0),b:P(uu,y1),w:0.02,c:'#2a2a2e'});}}}
function wDoor(f,P,u,w,h,col,o){o=o||{};f.deco=f.deco||[];const d=f.deco,q=(u0,v0,u1,v1)=>[P(u0,v0),P(u1,v0),P(u1,v1),P(u0,v1)];
  if(o.arch){const pts=[];for(let k=0;k<=10;k++){const a=Math.PI*k/10;pts.push(P(u+Math.cos(a)*w/2,h+Math.sin(a)*w/2));}d.push({poly:[P(u-w/2-0.08,0),P(u+w/2+0.08,0),P(u+w/2+0.08,h)].concat(pts.map((p,i)=>P(u+Math.cos(Math.PI*i/10)*(w/2+0.08),h+Math.sin(Math.PI*i/10)*(w/2+0.08)))).concat([P(u-w/2-0.08,h)]),c:o.frame||'#d8d0bc'});d.push({poly:[P(u-w/2,0),P(u+w/2,0)].concat(pts),c:col});}
  else{d.push({poly:q(u-w/2-0.09,0,u+w/2+0.09,h+0.1),c:o.frame||'#d8d0bc'});d.push({poly:q(u-w/2,0,u+w/2,h),c:col});}
  d.push({a:P(u,0.05),b:P(u,h-0.05),w:0.03,c:shade(col,-0.35)});[0.3,0.62].forEach(t=>d.push({poly:q(u-w/2+0.08,h*t,u-0.06,h*t+h*0.26),c:shade(col,-0.12)}));d.push({dot:P(u+w*0.32,h*0.48),r:0.035,c:'#c9a24a'});}
// Двускатная крыша вдоль дороги: скаты, фронтоны, черепица рядами
function bRoof(M,D,L,H,rh,ov,col,wall,o){o=o||{};const x0=-D/2-ov,x1=D/2+ov,z0=-L/2-ov*0.6,z1=L/2+ov*0.6,yR=H+rh,yE=H-ov*rh/(D/2);
  const out=[x0,x1].map((xs,i)=>{const f=mFace(M,[[xs,yE,z0],[0,yR,z0],[0,yR,z1],[xs,yE,z1]],col,o.mat||'roof',[0,H,0]);f.deco=[];const n=o.rows||8;
    for(let k=1;k<n;k++){const t=k/n,x=xs*(1-t),y=yE+(yR-yE)*t;f.deco.push({a:[x,y,z0],b:[x,y,z1],w:0.035,c:shade(col,-0.28)});}
    if(o.tiles)for(let k=0;k<n;k++){const t=(k+0.5)/n,x=xs*(1-t),y=yE+(yR-yE)*t;for(let zz=z0+0.25*(k%2);zz<z1;zz+=0.5)f.deco.push({a:[x,y-0.02,zz],b:[x*(1-0.5/n)/(1-t)*(1-t-0.5/n)/(1-t)||x,y+0.02,zz],w:0.02,c:shade(col,-0.2)});}
    f.deco.push({a:[xs,yE,z0],b:[xs,yE,z1],w:0.07,c:shade(col,-0.45)});return f;});
  [-1,1].forEach(s=>{const g=mFace(M,[[-D/2,H,s*L/2],[D/2,H,s*L/2],[0,yR-0.02,s*L/2]],wall,o.wmat||'wall',[0,H,0]);if(o.gdeco)o.gdeco(g,s);
    const e=mFace(M,[[x0,yE,s*z1],[0,yR,s*z1],[0,yR+0.12,s*z1],[x0,yE+0.12,s*z1]],shade(col,-0.1),'matte',[0,H,0],true);const e2=mFace(M,[[x1,yE,s*z1],[0,yR,s*z1],[0,yR+0.12,s*z1],[x1,yE+0.12,s*z1]],shade(col,-0.1),'matte',[0,H,0],true);});
  mFace(M,[[0,yR,z0],[0,yR+0.12,z0],[0,yR+0.12,z1],[0,yR,z1]],shade(col,-0.3),'matte',[1,0,0],true);
  return out;}
function bChimney(M,x,z,yb,h,col){mBox(M,x-0.3,yb,z-0.35,x+0.3,yb+h,z+0.35,col,'matte',['d']);mBox(M,x-0.36,yb+h,z-0.41,x+0.36,yb+h+0.1,z+0.41,shade(col,-0.25),'matte',['d']);}
// Стены-коробка: фасад на +x (r), торец к камере на -z (b)
function bWalls(M,D,L,H,col,mat){return mBox(M,-D/2,0,-L/2,D/2,H,L/2,col,mat||'wall',['d','t']);}
const FAC=(D)=>(u,v)=>[D/2+0.012,v,u],END=(L)=>(u,v)=>[u,v,-L/2-0.012];
// Каталог зданий: возвращают модель с фасадом на +x
const BLD={
  house_fr:(r,v)=>{const M=new Mesh(),D=7,L=9,H=7.4,wc=['#e6dcc4','#d9c9a8','#cbbd9f'][v%3],sh=['#5b7d8a','#6a7f5a','#8a5a44'][v%3];const W=bWalls(M,D,L,H,wc);
    for(let fl=0;fl<2;fl++)[-2.8,0,2.8].forEach(u=>{if(fl===0&&u===0)return;wWin(W.r,FAC(D),u,0.9+fl*3.3,1.0,1.7,{shut:sh,bal:fl===1,box:fl===1&&r()<0.5});});wDoor(W.r,FAC(D),0,1.1,2.3,'#6a4a30');
    [-1.5,1.5].forEach(u=>wWin(W.b,END(L),u,4.2,0.9,1.5,{shut:sh}));W.r.deco.push({poly:[FAC(D)(-L/2,3.05),FAC(D)(L/2,3.05),FAC(D)(L/2,3.25),FAC(D)(-L/2,3.25)],c:shade(wc,-0.12)});
    bRoof(M,D,L,H,2.6,0.35,'#5c6570',wc,{rows:7});[-2.2,2.2].forEach(z=>{const dm=mBox(M,1.2,H+0.3,z-0.55,2.3,H+1.45,z+0.55,wc,'wall',['d','t']);wWin(dm.r,(u,v)=>[2.312,v,u],z,H+0.45,0.6,0.8,{});mFace(M,[[1.1,H+1.4,z-0.68],[2.42,H+1.4,z-0.68],[2.42,H+1.4,z+0.68],[1.1,H+1.4,z+0.68]].map((q,i)=>i===1||i===2?[q[0],q[1],q[2]]:q),'#5c6570','roof',[1.7,H,z]);mFace(M,[[1.1,H+1.4,z-0.68],[2.42,H+1.4,z-0.68],[2.42,H+2.0,z],[1.1,H+2.0,z]],'#5c6570','roof',[1.7,H,z+1]);mFace(M,[[1.1,H+1.4,z+0.68],[2.42,H+1.4,z+0.68],[2.42,H+2.0,z],[1.1,H+2.0,z]],'#5c6570','roof',[1.7,H,z-1]);mFace(M,[[2.42,H+1.4,z-0.68],[2.42,H+1.4,z+0.68],[2.42,H+2.0,z]],wc,'wall',[1.7,H+1.5,z]);});
    bChimney(M,-1.3,2.6,H+1,2.0,'#a89880');M.foot=[-D/2-0.3,D/2+0.8,-L/2-0.3,L/2+0.3];return M;},
  farm_fr:(r,v)=>{const M=new Mesh(),D=6.5,L=11,H=4.2,wc='#d8c7a4';const W=bWalls(M,D,L,H,wc);[-3.3,3.3].forEach(u=>wWin(W.r,FAC(D),u,1.1,0.9,1.3,{shut:'#4f6b52'}));wDoor(W.r,FAC(D),0,1.8,2.6,'#6a4a30',{arch:1});
    wWin(W.b,END(L),0,1.2,0.8,1.2,{shut:'#4f6b52'});bRoof(M,D,L,H,2.6,0.45,'#b0593a',wc,{rows:9,mat:'matte'});bChimney(M,-1,-3,H+1.2,1.6,'#a89880');M.foot=[-D/2-0.4,D/2+0.9,-L/2-0.4,L/2+0.4];return M;},
  house_it:(r,v)=>{const M=new Mesh(),D=7,L=8,H=6.6,wc=['#e0b47a','#d69a6a','#e8cf9c'][v%3];const W=bWalls(M,D,L,H,wc);
    for(let fl=0;fl<2;fl++)[-2.4,0,2.4].forEach(u=>{if(fl===0&&u===0)return;wWin(W.r,FAC(D),u,0.9+fl*3,0.85,1.5,{shut:'#3f6f4a',arch:fl===0,sill:'#efe2c8'});});wDoor(W.r,FAC(D),0,1.1,2.1,'#5a3a24',{arch:1});
    wWin(W.b,END(L),0,3.9,0.8,1.3,{shut:'#3f6f4a'});bRoof(M,D,L,H,1.2,0.5,'#b0553a',wc,{rows:9});M.foot=[-D/2-0.3,D/2+0.8,-L/2-0.3,L/2+0.3];return M;},
  fachwerk:(r,v)=>{const M=new Mesh(),D=7,L=8,H=7,wc='#f2ece0',tb='#4a3020';const W=bWalls(M,D,L,H,wc);
    const beams=(f,P,u0,u1)=>{f.deco=f.deco||[];const d=f.deco,sw=0.2;[0,H/2,H].forEach(v=>d.push({a:P(u0,v),b:P(u1,v),w:sw,c:tb}));for(let u=u0;u<=u1+0.01;u+=(u1-u0)/4)d.push({a:P(u,0),b:P(u,H),w:sw,c:tb});
      [[u0,0,u0+(u1-u0)/4,H/2],[u1,0,u1-(u1-u0)/4,H/2],[u0,H/2,u0+(u1-u0)/4,H],[u1,H/2,u1-(u1-u0)/4,H]].forEach(([a,b,c2,e])=>d.push({a:P(a,b),b:P(c2,e),w:sw*0.8,c:tb}));};
    beams(W.r,FAC(D),-L/2,L/2);beams(W.b,END(L),-D/2,D/2);[-1.9,1.9].forEach(u=>{wWin(W.r,FAC(D),u,1,0.8,1.2,{box:1});wWin(W.r,FAC(D),u,4.4,0.8,1.2,{});});wDoor(W.r,FAC(D),0,1,2.2,'#6a4a30');
    wWin(W.b,END(L),0,4.4,0.8,1.2,{});bRoof(M,D,L,H,3.6,0.4,'#9a3a2a',wc,{rows:10,gdeco:(g,s)=>{g.deco=[{a:[-D/2,H,s*L/2+s*0.013],b:[0,H+3.58,s*L/2+s*0.013],w:0.2,c:tb},{a:[D/2,H,s*L/2+s*0.013],b:[0,H+3.58,s*L/2+s*0.013],w:0.2,c:tb},{a:[0,H,s*L/2+s*0.013],b:[0,H+3.5,s*L/2+s*0.013],w:0.2,c:tb}];}});
    M.foot=[-D/2-0.3,D/2+0.8,-L/2-0.3,L/2+0.3];return M;},
  cottage:(r,v)=>{const M=new Mesh(),D=6,L=8,H=4.4,wc='#b9b2a4';const W=bWalls(M,D,L,H,wc);
    const stones=(f,P,u0,u1)=>{f.deco=f.deco||[];for(let i=0;i<60;i++){const u=u0+r()*(u1-u0-0.6),v=r()*(H-0.3),w=0.35+r()*0.35;f.deco.push({poly:[P(u,v),P(u+w,v),P(u+w,v+0.22),P(u,v+0.22)],c:shade(wc,(r()-0.5)*0.35)});}};
    stones(W.r,FAC(D),-L/2,L/2);stones(W.b,END(L),-D/2,D/2);[-2.2,2.2].forEach(u=>wWin(W.r,FAC(D),u,1.1,0.9,1.1,{box:1}));wDoor(W.r,FAC(D),0,0.95,2.1,'#2f4f3a');
    bRoof(M,D,L,H,2.4,0.35,'#4f5660',wc,{rows:8});bChimney(M,0,3.2,H+1.2,1.4,'#8a4a3a');M.foot=[-D/2-0.3,D/2+0.8,-L/2-0.3,L/2+0.3];return M;},
  pub:(r,v)=>{const M=BLD.cottage(r,v);mBox(M,3.1,2.6,-1.4,3.2,2.7,-0.6,'#2a2a2a','metal');const s=mBox(M,3.05,1.9,-1.25,3.15,2.55,-0.55,'#2b3f2e','paint');
    s.r.deco=[{text:'PUB',at:[[3.16,1.95,-1.23],[3.16,1.95,-0.57],[3.16,2.5,-1.23]],w:0.68,h:0.55,c:'#e8d9a0',font:'bold 0.3px serif'}];return M;},
  farm_us:(r,v)=>{const M=new Mesh(),D=7,L=10,H=5,wc='#efece4';const W=bWalls(M,D,L,H,wc);
    [W.r,W.b].forEach((f,i)=>{f.deco=f.deco||[];const P=i?END(L):FAC(D),u0=i?-D/2:-L/2,u1=-u0;for(let y=0.3;y<H;y+=0.3)f.deco.push({a:P(u0,y),b:P(u1,y),w:0.025,c:'#c9c3b4'});});
    [-3.2,-1.2,1.2,3.2].forEach(u=>wWin(W.r,FAC(D),u,1,0.85,1.4,{shut:'#2f3a4a'}));wDoor(W.r,FAC(D),0,1,2.2,'#3a4a5a');
    // веранда
    mBox(M,D/2,2.7,-L/2+0.6,D/2+2,2.85,L/2-0.6,'#d8d2c4','matte');[-L/2+0.8,-1.5,1.5,L/2-0.8].forEach(z=>mBox(M,D/2+1.8,0,z-0.08,D/2+1.96,2.7,z+0.08,'#efece4','matte'));mBox(M,D/2,0,-L/2+0.6,D/2+2,0.3,L/2-0.6,'#8a8272','matte');
    bRoof(M,D,L,H,2.4,0.4,'#5a5f66',wc,{rows:9});bChimney(M,-1,2,H+1,1.6,'#8a4a3a');M.foot=[-D/2-0.3,D/2+2.4,-L/2-0.3,L/2+0.3];return M;},
  barn:(r,v)=>{const M=new Mesh(),D=8,L=12,H=4.6,wc='#a8342a';const W=bWalls(M,D,L,H,wc);
    [W.r,W.b].forEach((f,i)=>{f.deco=f.deco||[];const P=i?END(L):FAC(D),u0=i?-D/2:-L/2,u1=-u0;for(let u=u0+0.3;u<u1;u+=0.3)f.deco.push({a:P(u,0),b:P(u,H),w:0.02,c:shade(wc,-0.3)});f.deco.push({a:P(u0,0.05),b:P(u1,0.05),w:0.12,c:'#efe6d8'},{a:P(u0,H-0.05),b:P(u1,H-0.05),w:0.12,c:'#efe6d8'});});
    const P=FAC(D);W.r.deco.push({poly:[P(-1.8,0),P(1.8,0),P(1.8,3.6),P(-1.8,3.6)],c:'#8a2a20'},{a:P(-1.8,0),b:P(1.8,3.6),w:0.15,c:'#efe6d8'},{a:P(1.8,0),b:P(-1.8,3.6),w:0.15,c:'#efe6d8'},{a:P(-1.8,3.6),b:P(1.8,3.6),w:0.15,c:'#efe6d8'},{a:P(-1.8,0),b:P(-1.8,3.6),w:0.15,c:'#efe6d8'},{a:P(1.8,0),b:P(1.8,3.6),w:0.15,c:'#efe6d8'});
    const E=END(L);W.b.deco.push({poly:[E(-0.7,5),E(0.7,5),E(0.7,6.2),E(-0.7,6.2)],c:'#3a2a20'});
    // ломаная крыша
    const x0=-D/2-0.3,x1=D/2+0.3,z0=-L/2-0.3,z1=L/2+0.3;[[x0,-1][0],x1].forEach((xs,i)=>{const s=i?1:-1;mFace(M,[[xs,H-0.2,z0],[s*2.6,H+2.2,z0],[s*2.6,H+2.2,z1],[xs,H-0.2,z1]],'#4a4f56','matte',[0,H,0]);mFace(M,[[s*2.6,H+2.2,z0],[0,H+3.1,z0],[0,H+3.1,z1],[s*2.6,H+2.2,z1]],'#555a62','matte',[0,H,0]);});
    [-1,1].forEach(s=>mFace(M,[[-D/2,H,s*L/2],[D/2,H,s*L/2],[2.55,H+2.15,s*L/2],[0,H+3.05,s*L/2],[-2.55,H+2.15,s*L/2]],wc,'matte',[0,H,0]));M.foot=[-D/2-0.3,D/2+0.9,-L/2-0.3,L/2+0.3];return M;},
  izba:(r,v)=>{const M=new Mesh(),D=6,L=7,H=3.6,wc='#8a6a44';const W=bWalls(M,D,L,H,wc);
    [W.r,W.b].forEach((f,i)=>{f.deco=f.deco||[];const P=i?END(L):FAC(D),u0=i?-D/2:-L/2,u1=-u0;for(let y=0.18;y<H;y+=0.36){f.deco.push({a:P(u0,y),b:P(u1,y),w:0.3,c:shade(wc,(y*7%3-1)*0.06)});f.deco.push({a:P(u0,y+0.16),b:P(u1,y+0.16),w:0.03,c:'#4a3420'});}});
    [-1.9,1.9].forEach(u=>{wWin(W.r,FAC(D),u,1.1,0.8,1.0,{frame:'#f1ece0',shut:'#3a6a9a'});});wWin(W.b,END(L),0,1.1,0.8,1.0,{frame:'#f1ece0',shut:'#3a6a9a'});
    bRoof(M,D,L,H,2.4,0.4,'#6a6258',wc,{rows:10,gdeco:(g,s)=>{g.deco=[{a:[-D/2,H,s*L/2+s*0.02],b:[0,H+2.35,s*L/2+s*0.02],w:0.25,c:'#e8e2d0'},{a:[D/2,H,s*L/2+s*0.02],b:[0,H+2.35,s*L/2+s*0.02],w:0.25,c:'#e8e2d0'}];}});M.foot=[-D/2-0.3,D/2+0.8,-L/2-0.3,L/2+0.3];return M;},
  villa:(r,v)=>{const M=new Mesh(),D=8,L=12,H=7,wc='#f1e6d0';const W=bWalls(M,D,L,H,wc);
    for(let fl=0;fl<2;fl++)[-4.2,-1.4,1.4,4.2].forEach(u=>wWin(W.r,FAC(D),u,0.9+fl*3.2,0.9,1.7,{arch:1,shut:'#6a8a5a',bal:fl===1}));[-2,2].forEach(u=>wWin(W.b,END(L),u,4.1,0.9,1.6,{arch:1,shut:'#6a8a5a'}));
    W.r.deco.push({poly:[FAC(D)(-L/2,3.3),FAC(D)(L/2,3.3),FAC(D)(L/2,3.5),FAC(D)(-L/2,3.5)],c:'#e0d2b8'});
    // вальмовая крыша
    const x0=-D/2-0.5,x1=D/2+0.5,z0=-L/2-0.5,z1=L/2+0.5,yE=H-0.1,yR=H+1.8,zr=L/2-2.5,rc='#c0643c';
    [[x0,1],[x1,1]].forEach(([xs])=>{const f=mFace(M,[[xs,yE,z0],[0,yR,-zr],[0,yR,zr],[xs,yE,z1]],rc,'matte',[0,H,0]);f.deco=[];for(let k=1;k<7;k++){const t=k/7;f.deco.push({a:[xs*(1-t),yE+(yR-yE)*t,z0+(-zr-z0)*t],b:[xs*(1-t),yE+(yR-yE)*t,z1+(zr-z1)*t],w:0.04,c:shade(rc,-0.28)});}});
    [z0,z1].forEach(zs=>{const zz=zs<0?-zr:zr;const f=mFace(M,[[x0,yE,zs],[x1,yE,zs],[0,yR,zz]],rc,'matte',[0,H,0]);});
    mBox(M,-D/2-0.1,0,-L/2-0.1,D/2+0.1,0.5,L/2+0.1,'#d8cbb0','matte',['d']);M.foot=[-D/2-0.3,D/2+0.9,-L/2-0.3,L/2+0.3];return M;},
  cafe:(r,v)=>{const M=new Mesh(),D=7,L=9,H=6.8,wc='#e3d6b8';const W=bWalls(M,D,L,H,wc),P=FAC(D);
    W.r.deco=W.r.deco||[];W.r.deco.push({poly:[P(-3.6,0.4),P(3.6,0.4),P(3.6,2.7),P(-3.6,2.7)],c:'#6a3a24'},{poly:[P(-3.4,0.55),P(-0.7,0.55),P(-0.7,2.55),P(-3.4,2.55)],c:'#34465a',gl:1},{poly:[P(0.7,0.55),P(3.4,0.55),P(3.4,2.55),P(0.7,2.55)],c:'#34465a',gl:1});
    wDoor(W.r,P,0,1.1,2.4,'#5a3a24',{frame:'#6a3a24'});[-2.8,0,2.8].forEach(u=>wWin(W.r,P,u,4.1,0.9,1.6,{shut:'#8a5a44',box:1}));
    W.r.deco.push({poly:[P(-2.4,2.95),P(2.4,2.95),P(2.4,3.6),P(-2.4,3.6)],c:'#2b2a28'},{text:'CAFÉ',at:[P(-2.4,2.95),P(2.4,2.95),P(-2.4,3.6)],w:4.8,h:0.65,c:'#e8c56a',font:'bold 0.55px serif'});
    // полосатый навес
    const aw=mFace(M,[[D/2,2.85,-3.8],[D/2,2.85,3.8],[D/2+1.9,2.25,3.8],[D/2+1.9,2.25,-3.8]],'#f1ece0','cloth',[0,0,0],true);aw.deco=[];for(let k=0;k<10;k+=2){const z0=-3.8+k*0.76,z1=z0+0.76;aw.deco.push({poly:[[D/2,2.85,z0],[D/2,2.85,z1],[D/2+1.9,2.25,z1],[D/2+1.9,2.25,z0]],c:'#b8322a'});}
    const val=mFace(M,[[D/2+1.9,2.25,-3.8],[D/2+1.9,2.25,3.8],[D/2+1.9,1.95,3.8],[D/2+1.9,1.95,-3.8]],'#f1ece0','cloth',[0,1,0],true);val.deco=[];for(let k=0;k<10;k+=2){const z0=-3.8+k*0.76;val.deco.push({poly:[[D/2+1.9,2.25,z0],[D/2+1.9,2.25,z0+0.76],[D/2+1.9,1.95,z0+0.76],[D/2+1.9,1.95,z0]],c:'#b8322a'});}
    [-2.6,0.2,2.8].forEach(z=>{mCylZ?0:0;mBox(M,D/2+1.1,0.72,z-0.4,D/2+1.9,0.76,z+0.4,'#e8e2d0','matte');mBox(M,D/2+1.47,0,z-0.04,D/2+1.53,0.72,z+0.04,'#3a3a3a','metal');
      [-0.65,0.65].forEach(dz=>{mBox(M,D/2+1.3,0.42,z+dz-0.18,D/2+1.66,0.46,z+dz+0.18,'#5a3a24','wood');mBox(M,D/2+1.3,0.46,z+dz+(dz>0?0.14:-0.18),D/2+1.66,0.95,z+dz+(dz>0?0.18:-0.14),'#5a3a24','wood');});});
    bRoof(M,D,L,H,2.2,0.35,'#6a6f78',wc,{rows:7});bChimney(M,-1.2,-2.8,H+0.8,1.8,'#a89880');M.foot=[-D/2-0.3,D/2+2.2,-L/2-0.3,L/2+0.3];return M;},
  church:(r,v)=>{const M=new Mesh(),D=8,L=15,H=7,wc='#cfc5ae';const W=bWalls(M,D,L,H,wc),P=FAC(D);
    [-5,-1.7,1.7,5].forEach(u=>wWin(W.r,P,u,2.2,1.0,2.6,{arch:1,glass:'#46406a',frame:'#b8ae96'}));[-5.9,-3.35,0,3.35,5.9].forEach(u=>mBox(M,D/2,0,u-0.3,D/2+0.5,4.8,u+0.3,shade(wc,-0.06),'matte',['d']));
    bRoof(M,D,L,H,4.2,0.3,'#6a6f78',wc,{rows:10});
    // колокольня у ближнего торца
    const tz=-L/2-1.6,tw=1.8,TH=16;const T=mBox(M,-tw,0,tz-tw,tw,TH,tz+tw,shade(wc,0.04),'matte',['d']);
    const E=(u,v)=>[u,v,tz-tw-0.012];wDoor(T.b,E,0,1.5,3,'#5a3f2a',{arch:1});T.b.deco.push({ring:[0,12.4,tz-tw-0.02,0.75],ax:'z',w:0.12,c:'#3a3a3a'},{dot:[0,12.4,tz-tw-0.03],r:0.7,c:'#f1ece0'},{a:[0,12.4,tz-tw-0.04],b:[0.1,12.9,tz-tw-0.04],w:0.07,c:'#222'},{a:[0,12.4,tz-tw-0.04],b:[0.4,12.3,tz-tw-0.04],w:0.07,c:'#222'});
    const F2=(u,v)=>[tw+0.012,v,u];wWin(T.r,F2,tz,9.2,0.7,1.6,{arch:1,glass:'#2a2a30'});wWin(T.b,E,0,8,0.7,1.6,{arch:1,glass:'#2a2a30'});
    const top=TH+7.5;[[-tw,-tw],[tw,-tw],[tw,tw],[-tw,tw]].forEach((a,i,A)=>{const b=A[(i+1)%4];mFace(M,[[a[0]*1.08,TH,tz+a[1]*1.08],[b[0]*1.08,TH,tz+b[1]*1.08],[0,top,tz]],'#555c66','metal',[0,TH+2,tz]);});
    mBox(M,-0.05,top,tz-0.05,0.05,top+1.2,tz+0.05,'#c9a24a','metal');mBox(M,-0.4,top+0.75,tz-0.05,0.4,top+0.85,tz+0.05,'#c9a24a','metal');
    M.foot=[-D/2-0.4,D/2+1.2,tz-tw-0.4,L/2+0.3];return M;},
  pits:(r,v)=>{const M=new Mesh(),D=5,L=15,H=3.6,wc='#d8cdb4';const W=bWalls(M,D,L,H,wc),P=FAC(D);W.r.deco=[];
    for(let k=0;k<6;k++){const u=-6.2+k*2.48;W.r.deco.push({poly:[P(u-1,0),P(u+1,0),P(u+1,2.7),P(u-1,2.7)],c:'#2a2622'},{a:P(u-1,2.7),b:P(u+1,2.7),w:0.1,c:'#8a7a60'},{text:String(k+1),at:[P(u-0.3,2.85),P(u+0.3,2.85),P(u-0.3,3.35)],w:0.6,h:0.5,c:'#2a2622',font:'bold 0.4px sans-serif'});}
    mBox(M,-D/2-0.2,H,-L/2-0.2,D/2+0.2,H+0.25,L/2+0.2,'#b8322a','paint');const b=mBox(M,D/2+0.02,H+0.25,-3,D/2+0.1,H+1.25,3,'#f1ece0','paint');
    b.r.deco=[{text:'БОКСЫ',at:[[D/2+0.11,H+0.3,-2.9],[D/2+0.11,H+0.3,2.9],[D/2+0.11,H+1.2,-2.9]],w:5.8,h:0.9,c:'#1c1406',font:'bold 0.72px Impact,sans-serif'}];
    [-6,6].forEach(z=>{mBox(M,0,H+0.25,z-0.04,0.08,H+3.4,z+0.04,'#3a3a3a','metal');const fl=mFace(M,[[0.04,H+3.35,z],[0.04,H+3.35,z+1.3],[0.04,H+2.6,z+1.3],[0.04,H+2.6,z]],r()<0.5?'#b8322a':'#f0c330','cloth',[0,0,z],true);});
    [[-5.6,0],[-5.2,0.5],[5.4,0.2]].forEach(([z,dx])=>mCylX?mBox(M,D/2+0.8+dx,0,z-0.28,D/2+1.36+dx,0.9,z+0.28,'#3a5a7a','metal'):0);
    M.foot=[-D/2-0.3,D/2+1.6,-L/2-0.3,L/2+0.3];return M;}
};
// Люди: рисунок одной фигуры в метрах, ноги в (0,0). o: тип, одежда, шляпа, жест, кадр
function drawPerson(c,rnd,o){
  const t=o.type,y=o.y||1905,late=y>=1919,woman=t==='woman',child=t==='child',h=(child?1.18:woman?1.62:1.74)*(o.s||1);
  const coat=o.coat,skin=o.skin||['#e3b896','#d6a883','#c9956e','#e8c2a2'][Math.floor(rnd()*4)],u=h/1.74;
  c.save();c.scale(u,u);const lit=(col,x0,x1)=>hgrad(c,x0,x1,[[0,shade(col,0.18)],[0.5,col],[1,shade(col,-0.4)]]);
  // ноги или юбка
  if(woman){const hem=late?-0.38:0,w0=late?0.3:0.36;c.fillStyle=lit(o.skirt,-w0,w0);c.beginPath();c.moveTo(-0.16,-0.98);c.lineTo(0.16,-0.98);c.quadraticCurveTo(w0*0.7,-0.5,w0,hem);c.lineTo(-w0,hem);c.quadraticCurveTo(-w0*0.7,-0.5,-0.16,-0.98);c.closePath();c.fill();
    if(late){c.fillStyle=skin;c.fillRect(-0.12,hem,0.08,-hem);c.fillRect(0.04,hem,0.08,-hem);}ell(c,-0.08,-0.02,0.08,0.035,'#2a1e16');ell(c,0.1,-0.02,0.08,0.035,'#2a1e16');}
  else{const tr=o.trousers||shade(coat,-0.15);[[-0.15,-0.02],[0.03,0.15]].forEach(([a,b],i)=>{c.fillStyle=lit(tr,a,b);c.beginPath();c.moveTo(a,-0.92);c.lineTo(b,-0.92);c.lineTo(b-0.01,-0.04);c.lineTo(a+0.01,-0.04);c.closePath();c.fill();});
    if(o.stripe){c.fillStyle=o.stripe;c.fillRect(-0.15,-0.9,0.025,0.86);c.fillRect(0.125,-0.9,0.025,0.86);}
    ell(c,-0.1,-0.03,0.1,0.045,'#1c1612');ell(c,0.11,-0.03,0.1,0.045,'#1c1612');}
  // корпус: сюртук или жакет
  const sh=-1.43,waist=woman?-0.98:-0.86,long=!woman&&!child&&!late&&o.frock;
  c.fillStyle=lit(coat,-0.25,0.25);c.beginPath();c.moveTo(-0.2,sh+0.02);c.quadraticCurveTo(-0.25,sh+0.05,-0.24,sh+0.2);c.lineTo(woman?-0.14:-0.2,waist);c.lineTo(woman?-0.15:-0.22,long?-0.55:waist+0.12);c.lineTo(woman?0.15:0.22,long?-0.55:waist+0.12);c.lineTo(woman?0.14:0.2,waist);c.lineTo(0.24,sh+0.2);c.quadraticCurveTo(0.25,sh+0.05,0.2,sh+0.02);c.closePath();c.fill();
  if(!woman&&t!=='gend'){c.fillStyle='#ece6da';c.beginPath();c.moveTo(-0.06,sh);c.lineTo(0.06,sh);c.lineTo(0,sh+0.26);c.closePath();c.fill();c.fillStyle=o.tie||'#2a2226';c.fillRect(-0.02,sh+0.02,0.04,0.16);}
  if(t==='gend'){c.fillStyle='#d8c070';[-0.08,0.08].forEach(x=>{c.beginPath();c.arc(x*0.4,sh+0.2,0.018,0,7);c.fill();c.beginPath();c.arc(x*0.4,sh+0.34,0.018,0,7);c.fill();});c.fillStyle='#2a2226';c.fillRect(-0.21,waist-0.02,0.42,0.05);}
  if(t==='marsh'){c.fillStyle='#b8322a';c.fillRect(0.14,sh+0.15,0.1,0.07);}
  // руки
  const arm=(sd,raise)=>{const sx=sd*0.21,sy=sh+0.08;let hx,hy;if(raise){hx=sd*0.34;hy=sh-0.42-(o.frame?0.1:0);}else if(o.hold&&sd>0){hx=sd*0.2;hy=sh+0.42;}else{hx=sd*0.25;hy=sh+0.58;}
    c.strokeStyle=shade(coat,sd<0?0.05:-0.2);c.lineWidth=0.11;c.lineCap='round';c.beginPath();c.moveTo(sx,sy);c.quadraticCurveTo(sx+sd*0.08,(sy+hy)/2,hx,hy);c.stroke();ell(c,hx,hy,0.034,0.04,t==='gend'?'#f1ece0':shade(skin,-0.08));return [hx,hy];};
  arm(-1,o.wave&&o.both);const hand=arm(1,o.wave);
  // голова
  const hy=sh-0.16;ell(c,0,sh-0.02,0.05,0.04,skin);const hg=c.createRadialGradient(-0.035,hy-0.04,0.01,0,hy,0.13);hg.addColorStop(0,shade(skin,0.12));hg.addColorStop(1,shade(skin,-0.25));c.fillStyle=hg;c.beginPath();c.ellipse(0,hy,0.1,0.12,0,0,7);c.fill();
  if(!woman&&!child&&rnd()<0.5){c.fillStyle='#3a2a1e';c.beginPath();c.ellipse(0,hy+0.045,0.045,0.014,0,0,7);c.fill();}
  // шляпа
  const hat=o.hat,hc=o.hatc||'#1e1a18';
  if(hat==='top'){c.fillStyle=hgrad(c,-0.1,0.1,[[0,'#3a3634'],[1,'#0e0c0c']]);c.fillRect(-0.085,hy-0.33,0.17,0.24);ell(c,0,hy-0.09,0.15,0.03,'#141212');}
  else if(hat==='bowler'){c.fillStyle=hc;c.beginPath();c.arc(0,hy-0.08,0.1,Math.PI,0);c.fill();ell(c,0,hy-0.075,0.14,0.028,shade(hc,-0.1));ell(c,-0.03,hy-0.14,0.03,0.02,'rgba(255,255,255,.2)');}
  else if(hat==='boater'){c.fillStyle='#e6d49a';c.fillRect(-0.1,hy-0.17,0.2,0.08);c.fillStyle='#2a2226';c.fillRect(-0.1,hy-0.12,0.2,0.03);ell(c,0,hy-0.09,0.17,0.03,'#d8c486');}
  else if(hat==='cap'){c.fillStyle=hc;c.beginPath();c.ellipse(0,hy-0.08,0.12,0.06,0,Math.PI,0);c.fill();c.fillRect(-0.12,hy-0.09,0.24,0.03);ell(c,0.07,hy-0.075,0.08,0.02,shade(hc,-0.2));}
  else if(hat==='kepi'){c.fillStyle='#1f2b4a';c.fillRect(-0.09,hy-0.22,0.18,0.14);c.fillStyle='#b8322a';c.fillRect(-0.09,hy-0.24,0.18,0.05);ell(c,0.05,hy-0.08,0.09,0.02,'#111');}
  else if(hat==='fhat'){const fc=o.hatc||'#e8d9a0';if(late){c.fillStyle=fc;c.beginPath();c.arc(0,hy-0.05,0.12,Math.PI,0);c.fill();ell(c,0,hy-0.04,0.13,0.03,shade(fc,-0.15));}
    else{ell(c,0,hy-0.1,0.27,0.06,fc);ell(c,0,hy-0.14,0.12,0.06,shade(fc,-0.1));ell(c,-0.1,hy-0.17,0.06,0.05,o.flower||'#b8322a');ell(c,0.06,hy-0.19,0.05,0.04,'#f1ece0');}}
  else if(woman){c.fillStyle='#4a2e1e';c.beginPath();c.arc(0,hy-0.03,0.11,Math.PI,0);c.fill();}
  // в руке: шляпа, флажок, зонтик
  if(o.wave&&o.item==='hat'){c.fillStyle=hc;c.beginPath();c.arc(hand[0],hand[1]-0.04,0.08,Math.PI,0);c.fill();ell(c,hand[0],hand[1]-0.04,0.12,0.025,hc);}
  if(o.item==='flag'){c.strokeStyle='#3a3a3a';c.lineWidth=0.025;c.beginPath();c.moveTo(hand[0],hand[1]);c.lineTo(hand[0]+0.02,hand[1]-0.5);c.stroke();const fy=hand[1]-0.5,fl=o.frame?0.05:-0.03;c.fillStyle=o.flag||'#f0c330';c.beginPath();c.moveTo(hand[0]+0.02,fy);c.quadraticCurveTo(hand[0]+0.25,fy+fl,hand[0]+0.5,fy+0.03);c.lineTo(hand[0]+0.48,fy+0.3);c.quadraticCurveTo(hand[0]+0.25,fy+0.3+fl,hand[0]+0.02,fy+0.3);c.closePath();c.fill();}
  if(o.item==='hanky'){c.fillStyle='#f6f2e8';c.beginPath();c.moveTo(hand[0],hand[1]);c.lineTo(hand[0]+0.14,hand[1]-0.1+(o.frame?0.05:0));c.lineTo(hand[0]+0.06,hand[1]+0.1);c.closePath();c.fill();}
  if(o.item==='umb'){c.strokeStyle='#2a2226';c.lineWidth=0.02;c.beginPath();c.moveTo(0.22,sh+0.4);c.lineTo(0.3,sh-0.62);c.stroke();c.fillStyle=o.umb||'#f1ece0';c.beginPath();c.moveTo(-0.15,sh-0.42);c.quadraticCurveTo(0.3,sh-0.95,0.75,sh-0.42);c.quadraticCurveTo(0.3,sh-0.55,-0.15,sh-0.42);c.fill();c.fillStyle='rgba(0,0,0,.15)';c.beginPath();c.moveTo(0.3,sh-0.66);c.quadraticCurveTo(0.55,sh-0.6,0.75,sh-0.42);c.quadraticCurveTo(0.5,sh-0.5,0.3,sh-0.66);c.fill();}
  c.restore();
}
// Внешность случайного зрителя по эпохе
function personLook(rnd,y,kind){
  const late=y>=1919,woman=kind==='crowd'&&rnd()<0.34,child=!woman&&kind==='crowd'&&rnd()<0.12;
  const coats=late?['#3a3f4a','#5a5048','#7a6a58','#2f3a4a','#8a7e6a','#4a4a44','#a89a80']:['#2b2f3a','#3a302a','#4a3a2a','#2f3a2f','#3a3a42','#5a4a3a'];
  if(kind==='gend')return {type:'gend',coat:'#1f2b4a',trousers:'#8e2a24',hat:'kepi',y};
  if(kind==='marsh')return {type:'man',coat:'#e8e2d0',trousers:'#5a5048',hat:'cap',hatc:'#3a3026',item:'flag',flag:rnd()<0.5?'#f0c330':'#b8322a',wave:1,y};
  if(woman)return {type:'woman',coat:['#f1ece0','#e8d9c0','#c9d6e0','#e6c9c9','#d8d0e8'][Math.floor(rnd()*5)],skirt:['#2b2f3a','#5a3a4a','#3a4a5a','#6a5a48','#8a4a3a','#e8e2d0'][Math.floor(rnd()*6)],hat:'fhat',hatc:['#e8d9a0','#f1ece0','#3a2a2a','#8a4a5a'][Math.floor(rnd()*4)],flower:['#b8322a','#e87aa0','#6a8ad0'][Math.floor(rnd()*3)],item:rnd()<0.28?'umb':rnd()<0.5?'hanky':'',umb:['#f1ece0','#e6c9c9','#c9d6e0'][Math.floor(rnd()*3)],y};
  if(child)return {type:'child',coat:['#3a4a6a','#6a3a2a','#e8e2d0'][Math.floor(rnd()*3)],hat:'cap',hatc:'#3a3026',y};
  const hat=late?['cap','bowler','boater','cap','bowler'][Math.floor(rnd()*5)]:['bowler','top','cap','boater','bowler','top'][Math.floor(rnd()*6)];
  return {type:'man',coat:coats[Math.floor(rnd()*coats.length)],hat,hatc:hat==='cap'?['#3a3026','#4a4a44','#5a4a3a'][Math.floor(rnd()*3)]:'#1e1a18',frock:rnd()<0.3,item:rnd()<0.5?'hat':'',tie:['#2a2226','#6a2a2a','#2a3a5a'][Math.floor(rnd()*3)],y};
}
function peopleSprite(kind,variant,frame){
  const y=R&&R.rc?R.rc.y:1905,era=y<1906?0:y<1919?1:2,key='pp|'+kind+'|'+variant+'|'+frame+'|'+era;if(SPR.cache[key])return SPR.cache[key];
  const P=64,w=kind==='crowd'?6:kind==='photo'?2:1.6,h=2.5,pad=0.3,cv=mkCanvas(w*P,(h+pad)*P),c=cv.getContext('2d');c.translate(w*P/2,h*P);c.scale(P,P);
  const rnd=mulberry32(hashStr('pp|'+kind+'|'+variant+'|'+era));
  if(kind==='crowd'){const L=[];for(let i=0;i<9;i++){const back=i>=5,x=back?-2.3+(i-5)*1.2+(rnd()-0.5)*0.3:-2.5+i*1.25+(rnd()-0.5)*0.25;L.push({x,back,o:Object.assign(personLook(rnd,[1900,1910,1925][era],'crowd'),{wave:rnd()<0.45,frame})});}
    L.filter(q=>q.back).concat(L.filter(q=>!q.back)).forEach(q=>{c.save();c.translate(q.x,q.back?-0.12:0);if(q.back)c.scale(0.94,0.94);gShadow(c,0.35,0.08,0.12,0.3);const r2=mulberry32(hashStr(key+q.x));drawPerson(c,r2,q.o);if(q.back){c.fillStyle='rgba(20,24,30,.12)';}c.restore();});}
  else if(kind==='photo'){gShadow(c,0.8,0.15,0.2,0.3);c.strokeStyle='#3a2a1c';c.lineWidth=0.04;[[-0.62,0],[-0.14,0],[-0.38,0.05]].forEach(([x])=>{c.beginPath();c.moveTo(-0.38,-1.1);c.lineTo(x,0);c.stroke();});
    rrect(c,-0.62,-1.45,0.48,0.38,0.03,'#4a3424');ell(c,-0.66,-1.26,0.06,0.08,'#2a2a2a');c.fillStyle='#111';c.beginPath();c.moveTo(-0.2,-1.45);c.lineTo(0.3,-1.52);c.lineTo(0.35,-1.0);c.lineTo(-0.16,-1.08);c.closePath();c.fill();
    c.save();c.translate(0.35,0);drawPerson(c,rnd,{type:'man',coat:'#3a302a',hat:'cap',hatc:'#3a3026',y,hold:1});c.restore();}
  else{gShadow(c,0.35,0.08,0.12,0.3);drawPerson(c,rnd,Object.assign(personLook(rnd,y,kind),{frame,wave:kind==='marsh'?1:0}));}
  const o={img:cv,wM:w,hM:h+pad,ax:0.5,ay:h/(h+pad)};SPR.cache[key]=o;return o;
}
// Трибуна: ярусы, зрители, навес на столбах, флаги
function standModel(sd){
  const L=16,D=6.4,M=new Mesh(),top=[],wc='#7a6a55',rows=6,step=D/(rows+1.2);
  for(let k=0;k<rows;k++){const x1=D/2-k*step,x0=x1-step,yy=0.55+k*0.5;const b=mBox(M,x0,0,-L/2,x1,yy,L/2,k%2?'#8a7a62':'#9a8a70','wood',['d']);top.push([x0+step*0.55,yy]);}
  mBox(M,-D/2-0.2,0,-L/2,-D/2+0.4,5.2,L/2,wc,'wood',['d']);[-1,1].forEach(s=>mFace(M,[[-D/2,0,s*L/2],[D/2,0,s*L/2],[D/2,0.6,s*L/2],[-D/2,3.8,s*L/2],[-D/2,5.2,s*L/2]],shade(wc,-0.05),'wood',[0,2,0]));
  const R2=new Mesh();[-L/2+0.3,-L/4,0,L/4,L/2-0.3].forEach(z=>mBox(R2,D/2-0.12,0,z-0.09,D/2+0.06,4.9,z+0.09,'#efe8da','paint'));
  const roof=mFace(R2,[[D/2+0.6,4.9,-L/2-0.3],[D/2+0.6,4.9,L/2+0.3],[-D/2-0.3,5.6,L/2+0.3],[-D/2-0.3,5.6,-L/2-0.3]],'#b8322a','paint',[0,0,0],true);roof.deco=[];for(let z=-L/2;z<L/2;z+=1)roof.deco.push({a:[D/2+0.6,4.9,z],b:[-D/2-0.3,5.6,z],w:0.05,c:'#8a2218'});
  const val=mFace(R2,[[D/2+0.6,4.9,-L/2-0.3],[D/2+0.6,4.9,L/2+0.3],[D/2+0.6,4.45,L/2+0.3],[D/2+0.6,4.45,-L/2-0.3]],'#f1ece0','cloth',[0,6,0],true);val.deco=[];for(let z=-L/2-0.3;z<L/2;z+=0.8)val.deco.push({poly:[[D/2+0.61,4.9,z],[D/2+0.61,4.9,z+0.4],[D/2+0.61,4.45,z+0.4],[D/2+0.61,4.45,z]],c:'#b8322a'});
  mBox(R2,D/2-0.05,1.0,-L/2,D/2+0.05,1.08,L/2,'#efe8da','paint');
  [-L/2+1,-L/4,L/4,L/2-1].forEach((z,i)=>{mBox(R2,D/2+0.3,4.9,z-0.03,D/2+0.36,6.6,z+0.03,'#3a3a3a','metal');mFace(R2,[[D/2+0.33,6.55,z],[D/2+0.33,6.55,z+1.1],[D/2+0.33,6.05,z+1.1],[D/2+0.33,6.05,z]],['#1f3f7a','#f1ece0','#b8322a','#2b5a3a'][i],'cloth',[0,0,z-1],true);});
  if(sd<0){mMirrorX(M);mMirrorX(R2);}
  const y=R&&R.rc?R.rc.y:1905,people=[];const rnd=mulberry32(hashStr('stand'+sd+y));
  top.forEach(([x,yy],k)=>{for(let z=-L/2+0.45;z<L/2-0.3;z+=0.62)people.push({p:[x*sd,yy,z+(rnd()-0.5)*0.15],o:Object.assign(personLook(rnd,y,'crowd'),{wave:rnd()<0.2})});});
  M.foot=sd>0?[-D/2-0.5,D/2+1.2,-L/2-0.3,L/2+0.3]:[-D/2-1.2,D/2+0.5,-L/2-0.3,L/2+0.3];
  return {M,R2,people};
}
SCENERY.stand={m3:(v,sd)=>{const {M,R2,people}=standModel(sd),dpr=Math.min(2,window.devicePixelRatio||1),ppm=15*dpr;
  const sp=renderModel(M,sd*0.95,0.1,ppm,{outline:1,blur:0.5,shadow:0.3,lv:[0.35*sd,0.75,-0.55],parts:[{M},{draw:(g,S,X,pp)=>{people.map(q=>({q,z:X(q.p)[2]})).sort((a,b)=>b.z-a.z).forEach(({q})=>{const s=S(X(q.p));g.save();g.translate(s[0],s[1]);g.scale(pp,pp);drawPerson(g,mulberry32(hashStr(''+q.p)),q.o);g.restore();});},ext:[]},{M:R2}]});return sp;}};
['house_fr','farm_fr','house_it','fachwerk','cottage','pub','farm_us','barn','izba','villa','cafe','church','pits'].forEach(k=>{SCENERY[k]={m3:(v,sd)=>{const r=mulberry32(hashStr(k+v));const M=BLD[k](r,v||0);if(sd<0)mMirrorX(M);const dpr=Math.min(2,window.devicePixelRatio||1);
  return renderModel(M,sd*0.95,0.1,(k==='church'?11:15)*dpr,{outline:1,blur:0.6,shadow:0.32,lv:[0.35*sd,0.75,-0.55]});}};});
/* ---------- дальний план: горы, холмы с полями, лес и деревни на горизонте; облака ---------- */
function mkBackdrop(set,cfg){
  const W=1600,H=260,rnd=mulberry32(hashStr(cfg.host+cfg.terr)),mount=!!(set.mount||cfg.uphill||cfg.terr==='mount'),snow=!!(set.snow||cfg.terr==='snow');
  const mk=()=>{const c=mkCanvas(W,H);return [c,c.getContext('2d')];},sky1=set.sky[1],hills=set.hills||'#6f8f55';
  const ridge=(base,amp,fr,ph,rough)=>{const Y=[];for(let x=0;x<=W;x+=4){let y=base;fr.forEach((f,i)=>y-=Math.abs(Math.sin(x/f+ph[i]))*amp[i]);y-=(rnd()-0.5)*rough;Y.push(y);}return Y;};
  const fillRidge=(g,Y,fill)=>{g.beginPath();g.moveTo(0,H);Y.forEach((y,i)=>g.lineTo(i*4,y));g.lineTo(W,H);g.closePath();g.fillStyle=fill;g.fill();};
  // дальний: горы или синие холмы, растворяющиеся в дымке
  const [far,f]=mk();let farTop=H-60;
  if(mount){const Y1=ridge(H-60,[70,30,12],[190,77,23],[1.3,0.4,2],3);farTop=Math.min(...Y1)-4;fillRidge(f,Y1,vgrad(f,H-190,H,[[0,mix('#8a97ad',sky1,0.35)],[1,mix('#9aa8b8',sky1,0.6)]]));
    if(snow||set.snow){f.fillStyle='rgba(250,252,255,.9)';Y1.forEach((y,i)=>{if(y<H-150){f.beginPath();f.moveTo(i*4-4,y+2);f.lineTo(i*4,y);f.lineTo(i*4+4,y+2);f.lineTo(i*4+2,y+(H-150-y)*0.6+6);f.lineTo(i*4-2,y+(H-150-y)*0.6+6);f.closePath();f.fill();}});}
    const Y2=ridge(H-40,[45,20,8],[140,53,17],[0.2,1.1,0.7],3);fillRidge(f,Y2,vgrad(f,H-130,H,[[0,mix('#6f7f95',sky1,0.2)],[1,mix('#8595a8',sky1,0.5)]]));
    f.strokeStyle='rgba(255,255,255,.12)';f.lineWidth=1;for(let i=1;i<Y2.length-1;i++){if(Y2[i]<Y2[i-1]&&Y2[i]<Y2[i+1]){f.beginPath();f.moveTo(i*4,Y2[i]);f.lineTo(i*4-18,Y2[i]+30);f.stroke();}}}
  else{const Y1=ridge(H-38,[22,9],[210,61],[0.9,2.1],2);farTop=Math.min(...Y1)-4;fillRidge(f,Y1,mix('#8fa3b3',sky1,0.45));}
  f.fillStyle=vgrad(f,H-70,H,[[0,'rgba(255,255,255,0)'],[1,hexA(sky1,0.55)]]);f.fillRect(0,H-70,W,70);
  // средний: холмы с полями и перелесками
  const [mid,m]=mk();const Ym=ridge(H-30,[set.flat?6:24,6],[260,70],[0.4,1.7],1.5);fillRidge(m,Ym,vgrad(m,H-70,H,[[0,mix(hills,sky1,0.35)],[1,mix(hills,sky1,0.15)]]));
  m.save();m.beginPath();m.moveTo(0,H);Ym.forEach((y,i)=>m.lineTo(i*4,y));m.lineTo(W,H);m.closePath();m.clip();
  const fields=['#b9b36a','#8fa35a','#a7b56e','#7e9651','#c4ad6a','#95a867'];for(let x=0;x<W;){const w=40+rnd()*110,col=mix(fields[Math.floor(rnd()*fields.length)],sky1,0.3);m.fillStyle=col;m.beginPath();m.moveTo(x,H);m.lineTo(x+w*0.4,H-80);m.lineTo(x+w*0.4+w,H-80);m.lineTo(x+w,H);m.closePath();m.fill();
    m.strokeStyle=hexA(mix('#3f5a32',sky1,0.35),0.8);m.lineWidth=1.5;m.setLineDash([2,2]);m.beginPath();m.moveTo(x+w,H);m.lineTo(x+w*1.4,H-80);m.stroke();m.setLineDash([]);x+=w;}
  for(let i=0;i<60;i++){const x=rnd()*W,yy=Ym[Math.min(Ym.length-1,Math.floor(x/4))]+4+rnd()*20;m.fillStyle=mix('#4f6f3f',sky1,0.35);m.beginPath();m.ellipse(x,yy,5+rnd()*8,3+rnd()*3,0,0,7);m.fill();}
  m.restore();m.fillStyle=vgrad(m,H-60,H,[[0,'rgba(255,255,255,0)'],[1,hexA(sky1,0.35)]]);m.fillRect(0,H-60,W,60);
  // ближний: полоса леса, тополя, деревни с колокольней
  const [near,n]=mk();const base=x=>H-14-Math.abs(Math.sin(x/140))*(set.flat?4:12);const tc=shade(hills,-0.3),tc2=shade(hills,-0.12);
  for(let x=-10;x<W+10;x+=4+rnd()*5){const b=base(x),h=10+rnd()*16,r=5+rnd()*6;n.fillStyle=rnd()<0.5?tc:tc2;n.beginPath();n.ellipse(x,b-h*0.6,r,h*0.6,0,0,7);n.fill();n.fillStyle='rgba(255,255,255,.08)';n.beginPath();n.ellipse(x-r*0.3,b-h*0.8,r*0.5,h*0.3,0,0,7);n.fill();}
  const tall=set.alley==='poplar'||set.alley==='cypress'||set.alley==='fir';
  if(tall)for(let x=20;x<W;x+=30+rnd()*90){const b=base(x),h=26+rnd()*14;n.fillStyle=shade(hills,-0.38);n.beginPath();if(set.alley==='fir'){n.moveTo(x,b-h);n.lineTo(x+6,b);n.lineTo(x-6,b);}else n.ellipse(x,b-h/2,3.5,h/2,0,0,7);n.fill();}
  for(let v=0;v<3;v++){const cx=200+v*520+rnd()*200,b=base(cx);for(let k=0;k<6;k++){const x=cx+(k-3)*16+rnd()*6,w=12+rnd()*8,h=8+rnd()*6;n.fillStyle=mix('#d8ccb0',sky1,0.25);n.fillRect(x,b-h,w,h);n.fillStyle=mix(set.host==='it'||set.host==='es'||set.host==='mc'?'#b0553a':'#7a5a4a',sky1,0.2);n.beginPath();n.moveTo(x-2,b-h);n.lineTo(x+w/2,b-h-6);n.lineTo(x+w+2,b-h);n.closePath();n.fill();}
    n.fillStyle=mix('#cfc5ae',sky1,0.25);n.fillRect(cx+4,b-34,7,34);n.fillStyle=mix('#5a606a',sky1,0.2);n.beginPath();n.moveTo(cx+2,b-34);n.lineTo(cx+7.5,b-50);n.lineTo(cx+13,b-34);n.closePath();n.fill();}
  // облака: пухлые, со светлой макушкой и серым низом
  const clouds=[0,1,2,3,4].map(i=>{const cw=260,ch=110,[cv,g]=(()=>{const c=mkCanvas(cw,ch);return [c,c.getContext('2d')];})(),r2=mulberry32(hashStr('cl'+i+cfg.host));
    const puffs=[];for(let k=0;k<9;k++){const t=k/8,x=30+t*200+(r2()-0.5)*20,y=70-Math.sin(t*Math.PI)*28-r2()*14,r=18+Math.sin(t*Math.PI)*22+r2()*8;puffs.push([x,y,r]);}
    g.fillStyle='rgba(150,165,185,.55)';puffs.forEach(([x,y,r])=>{g.beginPath();g.arc(x,y+6,r,0,7);g.fill();});
    puffs.forEach(([x,y,r])=>{const gr=g.createRadialGradient(x-r*0.3,y-r*0.4,r*0.1,x,y,r);gr.addColorStop(0,'rgba(255,255,255,.98)');gr.addColorStop(0.7,'rgba(245,247,250,.92)');gr.addColorStop(1,'rgba(205,214,226,.85)');g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,7);g.fill();});
    g.fillStyle='rgba(170,182,200,.35)';g.fillRect(20,ch-26,220,3);return cv;});
  return {far,mid,near,clouds,W,H,tops:[Math.max(0,Math.floor(farTop)),Math.max(0,Math.floor(Math.min(...Ym)-4)),H-110]};
}
function hexA(col,a){const c=hex2rgb(col);return `rgba(${c[0]},${c[1]},${c[2]},${a})`;}
/* ---------- мелочи на дороге вблизи: камешки, выбоины, швы, кирпичи, трава по краю ---------- */
function roadDetail(c,a,b,tr,HW){
  if(a.z>60||!b.scale)return;const al=clamp(1.4-a.z/45,0,1);if(al<=0.03)return;const j=a.j,rnd=mulberry32(j*7919+13);
  const P=(u,t)=>{const s=a.scale+(b.scale-a.scale)*t;return [a.sx+(b.sx-a.sx)*t-u*s,a.sy+(b.sy-a.sy)*t,s];};
  c.globalAlpha=al;
  if(tr.dust||tr.ruts){const n=4+Math.floor(rnd()*6);for(let i=0;i<n;i++){const u=(rnd()-0.5)*2*HW*0.95,[x,y,s]=P(u,rnd()),r=Math.min(4,(0.02+rnd()*0.045)*s);if(r<0.5)continue;
      const lt=rnd()<0.3;c.fillStyle=lt?'rgba(226,212,180,.4)':'rgba(64,50,34,.42)';c.beginPath();c.ellipse(x,y,r*1.5,r*0.65,0,0,7);c.fill();}
    if(rnd()<0.1){const [x,y,s]=P((rnd()-0.5)*HW*1.3,0.5);c.fillStyle=tr===TERR.mud?'rgba(80,95,110,.45)':'rgba(80,62,42,.3)';c.beginPath();c.ellipse(x,y,(0.5+rnd()*0.5)*s,0.16*s,0,0,7);c.fill();}}
  if(tr===TERR.asphalt||tr===TERR.concrete){if(j%3===0){const [x0,y0,s0]=P(-HW,0.3),[x1,y1]=P(HW,0.3);c.strokeStyle='rgba(25,25,25,.22)';c.lineWidth=Math.max(0.5,0.03*s0);c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();}
    if(rnd()<0.22){const [x,y,s]=P((rnd()-0.5)*HW*1.4,rnd());c.fillStyle='rgba(35,35,35,.16)';c.beginPath();c.ellipse(x,y,(0.4+rnd()*0.6)*s,(0.1+rnd()*0.1)*s,0,0,7);c.fill();}}
  if(tr.bricks){c.strokeStyle='rgba(55,22,10,.3)';for(let k=0;k<4;k++){const [x0,y0,s0]=P(-HW,k/4),[x1,y1]=P(HW,k/4);c.lineWidth=Math.max(0.5,0.025*s0);c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();}}
  if(tr!==TERR.snow&&tr!==TERR.sand&&tr!==TERR.beach){[-1,1].forEach(sd=>{for(let i=0;i<3;i++){const u=sd*(HW*1.12+0.2+rnd()*1.6),[x,y,s]=P(u,rnd()),h=(0.18+rnd()*0.22)*s;if(h<1.5)continue;
    c.strokeStyle=rnd()<0.5?'rgba(52,84,34,.85)':'rgba(96,128,52,.85)';c.lineWidth=Math.max(0.6,0.025*s);c.lineCap='round';for(let k=-2;k<=2;k++){c.beginPath();c.moveTo(x+k*h*0.1,y);c.quadraticCurveTo(x+k*h*0.18,y-h*0.6,x+k*h*0.32,y-h*(0.8+0.2*((k+2)%2)));c.stroke();}
    if(rnd()<0.2){c.fillStyle=['#f1ece0','#e9c46a','#d8473a'][Math.floor(rnd()*3)];c.beginPath();c.arc(x+h*0.3,y-h*0.9,Math.max(0.8,0.03*s),0,7);c.fill();}}});}
  c.globalAlpha=1;
}
// Заготовка декораций трассы, пока идёт отсчёт: сначала то, что у старта
const SCQ=[];
function scenQueue(T){SCQ.length=0;const seen=new Set(),start=T.startIdx||0;const order=[];for(let k=-10;k<T.n;k++)order.push(((start+k)%T.n+T.n)%T.n);
  order.forEach(i=>(T.spr[i]||[]).forEach(it=>{const key=it.k==='p'?'p|'+it.t+'|'+it.v:'s|'+it.t+'|'+it.v+'|'+(SCENERY[it.t]&&SCENERY[it.t].m3?Math.sign(it.off):0);if(seen.has(key))return;seen.add(key);
    SCQ.push(it.k==='p'?()=>{peopleSprite(it.t,it.v,0);peopleSprite(it.t,it.v,1);}:()=>scenSprite(it.t,it.v,it.off));}));}

/* ---------- машина в карточке модели: та же 3D-модель, что и в гонке, в три четверти спереди ---------- */
const CARD3D=new Map();
function carArt(md,opt={}){
  try{const p=parts(md),y=md.launched!=null&&md.status!=='dev'&&md.status!=='draft'?1895+Math.floor(md.launched/12):(G?G.y:1895);
    const style=carStyle(md,0,y),wheel=wheelKind(md,y),col=md.paint||'#23427a',key=['card',style,col,y,p.b.id,p.c.id,p.e.id,wheel,md.t].join('|');
    let url=CARD3D.get(key);
    if(!url){const M=carModel({key,style,color:col,y,wheel,mech:false,num:0,b:p.b.id,lod:'hi'}),dpr=Math.min(2,window.devicePixelRatio||1),sp=renderModel(M,2.1,0.28,52*dpr,{shadow:0.4,blur:0.22});
      url=sp.img.toDataURL('image/png');if(CARD3D.size>40)CARD3D.delete(CARD3D.keys().next().value);CARD3D.set(key,url);}
    return `<img class="car3d${opt.anim?' anim':''}" src="${url}" alt="${esc(md.name||'Автомобиль')}">`;
  }catch(e){return carSVG(md,opt);}
}
