/* ================= 0.30: СЦЕНЫ ИЗ ХРОНИКИ В 3D =================
   То, о чём говорит титр «ИЗ ХРОНИКИ», стоит у дороги: машина Левассора вверх колёсами в канаве и собака, перебегающая
   дорогу перед вами; разбитая машина у Куэ с жандармом и фотографом; кузница Дюрьеа — дым из трубы, наковальня,
   машина без колеса; караван верблюдов с бидонами бензина в Гоби; механики меняют колесо на съёмном ободе.
   Машины — те же 3D-модели, что в гонке (своего года), только стоят, лежат на боку или клюют носом с моста. */
const CHM=new Float32Array(16),CHM2=new Float32Array(16),CHR=new Float32Array(16);
function chRot(v,ax,a){// поворот вектора v вокруг оси ax (единичной) на угол a
  const c=Math.cos(a),s=Math.sin(a),d=v[0]*ax[0]+v[1]*ax[1]+v[2]*ax[2],x=[ax[1]*v[2]-ax[2]*v[1],ax[2]*v[0]-ax[0]*v[2],ax[0]*v[1]-ax[1]*v[0]];
  return [v[0]*c+x[0]*s+ax[0]*d*(1-c),v[1]*c+x[1]*s+ax[1]*d*(1-c),v[2]*c+x[2]*s+ax[2]*d*(1-c)];}
function r3dChronBuild(T){const L=T.chron;if(!L||!L.length)return null;const out=[],ref=R.cars.find(c=>!c.you&&c.spec3&&!c.pace)||R.cars.find(c=>c.spec3);
  L.forEach((o,k)=>{const i=o.i,p=T.pts[i],nn=T.N[i],t=T.T[i],ry=Math.atan2(t[0],t[1]);
    if(o.kind==='car'){if(!ref)return;const sp=Object.assign({},ref.spec3,{color:o.col,num:0,drv:'',strip:0,key:(ref.spec3.key||'')+'|ch'+k});
      const x=p[0]+nn[0]*o.lat,z=p[2]+nn[1]*o.lat,y=groundAt(i,o.lat)+(o.y||0);
      let fw=[Math.sin(ry+o.yaw),0,Math.cos(ry+o.yaw)],up=[0,1,0],rt=[fw[2],0,-fw[0]];
      if(o.pitch){const ax=rt;fw=chRot(fw,ax,-o.pitch);up=chRot(up,ax,-o.pitch);}
      if(o.roll){const ax=fw;rt=chRot(rt,ax,o.roll);up=chRot(up,ax,o.roll);}
      // на боку или вверх колёсами — кузов ложится на землю, а не уходит под неё
      const lift=o.roll?Math.abs(Math.sin(o.roll))*0.8+Math.max(0,-Math.cos(o.roll))*1.2:o.pitch?Math.abs(Math.sin(o.pitch))*0.9:0;
      const mat=new Float32Array(16);m4basis(mat,rt,up,fw,[x,y+lift,z]);
      out.push({kind:'car',spec:sp,pos:[x,y+lift,z],c:{x,z,spec3:sp,delta:0,brk:0,vx:0},st:{mat,tf:o.tf,dirt:o.dirt,dirtC:[0.32,0.26,0.18],spin:0,roll:0,pitch:0,heave:0,d:0},smoke:o.smoke||0,sm:0});}
    else if(o.kind==='dog')out.push({kind:'dog',i,side:o.side,st:0,t:0,ph:0});
    else if(o.kind==='camel'){const n=o.n||3;for(let q=0;q<n;q++){const j=T.closed?(i+q*2)%T.n:Math.min(T.n-1,i+q*2),pp=T.pts[j],nq=T.N[j],tq=T.T[j],lat=o.lat+(q%2?0.6:-0.3);
        out.push({kind:'camel',pos:[pp[0]+nq[0]*lat,groundAt(j,lat),pp[2]+nq[1]*lat],yaw:Math.atan2(tq[0],tq[1])+(q%2?0.25:-0.15),ph:q*1.7,load:q<n-1});}}
    else if(o.kind==='smoke'){const x=p[0]+nn[0]*o.lat,z=p[2]+nn[1]*o.lat;out.push({kind:'smoke',pos:[x,groundAt(i,o.lat)+o.h,z],rate:o.rate||3,sm:0});}});
  return out.length?out:null;}
// машины сцены — в проходе машин (та же программа: краска, стекло, грязь, спущенные шины)
function r3dChronCars(P,E,glass){const gl=G3.gl,e=R3.eye;for(const o of R3.chron){if(o.kind!=='car')continue;const d=Math.hypot(o.pos[0]-e[0],o.pos[2]-e[2]);if(d>520||!inFrustum(R3.fr,o.pos,3.5))continue;
  const m=r3dCarMesh(o.spec,d<24);if(glass&&!m.gl)continue;r3dCarUniforms(P,o.c,o.st,m);gl.uniform4f(P.u.u_lamp,0,0,0,0);if(P.u.u_dark)gl.uniform1f(P.u.u_dark,0);g3Draw(glass?m.gl:m.op);}}
/* ---------- собака и верблюд ---------- */
function chDogMesh(){const C=G3.cache;if(C.chDog)return C.chDog;const b=new MB(),l=new MB(),br='#8a6440',wh='#e8e0cc',dk='#2a1e16';
  pBlob(b,0,0.47,0,0.13,0.15,0.36,br,DXJ,0,MID.skin);pBlob(b,0,0.47,0.24,0.12,0.15,0.14,wh,DXJ,0,MID.skin);
  pTrunk(b,0,0.54,0.3,0,0.66,0.42,0.075,0.06,br,8,MID.skin);pBlob(b,0,0.7,0.47,0.09,0.09,0.11,br,DXJ,0,MID.skin);pBlob(b,0,0.67,0.58,0.05,0.05,0.07,'#6a4a2e',DXJ,0,MID.skin);
  pBlob(b,0,0.68,0.645,0.02,0.02,0.02,dk,DXJ,0,MID.skin);[-1,1].forEach(sd=>pCone(b,sd*0.055,0.76,0.44,0.03,0.08,dk,5,0,MID.skin));
  pTrunk(b,0,0.55,-0.33,0,0.72,-0.52,0.03,0.015,br,5,MID.skin);
  pTrunk(l,0,0,0,0,-0.2,0.02,0.035,0.028,br,6,MID.skin);pTrunk(l,0,-0.2,0.02,0,-0.36,0,0.025,0.022,br,6,MID.skin);pBlob(l,0,-0.37,0.02,0.03,0.02,0.04,dk,DXJ,0,MID.skin);
  return C.chDog={b:g3Mesh(b),l:g3Mesh(l)};}
function chCamelMesh(){const C=G3.cache;if(C.chCamel)return C.chCamel;const b=new MB(),cn=new MB(),l=new MB(),sa='#b8925a',dk='#7a5a34';
  pBlob(b,0,1.78,0,0.42,0.42,0.95,sa,DXJ,0,MID.skin);pBlob(b,0,2.22,-0.05,0.3,0.32,0.42,sa,DXJ,0,MID.skin);
  pTrunk(b,0,1.85,0.8,0,2.15,1.25,0.17,0.12,sa,8,MID.skin);pTrunk(b,0,2.15,1.25,0,2.55,1.45,0.12,0.1,sa,8,MID.skin);pBlob(b,0,2.55,1.62,0.11,0.12,0.24,sa,DXJ,0,MID.skin);
  [-1,1].forEach(sd=>pCone(b,sd*0.07,2.66,1.52,0.025,0.07,dk,5,0,MID.skin));pTrunk(b,0,1.72,-0.92,0,1.15,-1.05,0.04,0.02,dk,5,MID.cloth);
  // вьюк: попона, по бокам — бидоны с бензином
  pBox(cn,0,1.98,-0.05,0.46,0.06,0.5,'#7a2a22',MID.cloth,0);[-1,1].forEach(sd=>{for(let k=0;k<2;k++)pBox(cn,sd*0.52,1.45,-0.32+k*0.36,0.08,0.42,0.13,k?'#5a5a52':'#8a2a20',MID.metal,0);});
  pTrunk(l,0,0,0,0,-0.8,0.04,0.09,0.06,sa,8,MID.skin);pTrunk(l,0,-0.8,0.04,0,-1.55,0,0.06,0.05,sa,8,MID.skin);pBlob(l,0,-1.58,0.03,0.08,0.03,0.1,dk,DXJ,0,MID.skin);
  return C.chCamel={b:g3Mesh(b),c:g3Mesh(cn),l:g3Mesh(l)};}
// собака ждёт у обочины; когда ваша машина в 15–50 м — с лаем бежит через дорогу и садится на той стороне
function chDogTick(o,dt){const T=R3.T,me=R.me||R.follow;if(!me)return;
  if(o.st===0){let d=(o.i-me.idx)*T.step;if(T.closed){const L=T.len;d=((d%L)+L)%L;}if(d>15&&d<50&&(me.vx||0)>6){o.st=1;o.t=0;o.dur=(T.W+4.4)/7.5;
      try{const p=T.pts[o.i];if(typeof ambShot==='function'&&AMB.on)ambShot('dog_bark',[p[0],p[2]],AMB_L.dog,{force:1,r0:3});}catch(_){}
      try{if(typeof navSay==='function'&&navActive())navSay('dog',10,1.2);}catch(_){}}}
  else if(o.st===1){o.t+=dt;o.ph+=dt*16;if(o.t>=o.dur){o.st=2;}}}
function chDogPose(o){const T=R3.T,i=o.i,p=T.pts[i],nn=T.N[i],t=T.T[i],W=T.W,a0=o.side*(W/2+2.0),a1=-o.side*(W/2+2.4),k=o.st===0?0:o.st===2?1:clamp(o.t/o.dur,0,1),lat=a0+(a1-a0)*k,fwd=k*3;
  const x=p[0]+nn[0]*lat+t[0]*fwd,z=p[2]+nn[1]*lat+t[1]*fwd,y=Math.abs(lat)<W/2?(typeof roadY==='function'?roadY(i,lat):groundAt(i,lat)):groundAt(i,lat);
  // бежит поперёк дороги (к другой стороне), сидит — мордой к дороге
  const dir=o.st===1?[-nn[0]*o.side+t[0]*0.3,-nn[1]*o.side+t[1]*0.3]:o.st===2?[nn[0]*o.side,nn[1]*o.side]:[-nn[0]*o.side,-nn[1]*o.side],l=Math.hypot(dir[0],dir[1])||1;
  return {x,y,z,fx:dir[0]/l,fz:dir[1]/l};}
function r3dChronDraw(E,bw,bh,dt){const L=R3.chron;if(!L)return;const gl=G3.gl,e=R3.eye;let P=null;const use=()=>{if(!P){P=r3dUse('lit',E,bw,bh);gl.uniform4f(P.u.u_lamp,0,0,E.lamp,0);}return P;};
  for(const o of L){
    if(o.kind==='dog'){chDogTick(o,dt);const q=chDogPose(o);if(Math.hypot(q.x-e[0],q.z-e[2])>260)continue;const M=chDogMesh();use();const fw=[q.fx,0,q.fz],rt=[fw[2],0,-fw[0]];
      m4basis(CHM,rt,[0,1,0],fw,[q.x,q.y+(o.st===1?Math.abs(Math.sin(o.ph))*0.06:0),q.z]);
      // сидит: задние лапы подогнуты (опущен круп)
      if(o.st!==1){const c=Math.cos(0.35),s=Math.sin(0.35);CHR.set([1,0,0,0,0,c,s,0,0,-s,c,0,0,-0.12,0,1]);m4mul(CHM2,CHM,CHR);gl.uniformMatrix4fv(P.u.u_model,false,CHM2);}else gl.uniformMatrix4fv(P.u.u_model,false,CHM);
      g3Draw(M.b);
      // галоп: передние вместе, задние вместе, в противофазе
      [[0.08,0.4,0.24,0],[-0.08,0.4,0.24,0.4],[0.08,0.4,-0.24,Math.PI],[-0.08,0.4,-0.24,Math.PI+0.4]].forEach(([x,yy,z,ph0])=>{const a=o.st===1?Math.sin(o.ph+ph0)*0.75:(z<0?-0.9:0),c=Math.cos(a),s=Math.sin(a);
        CHR.set([1,0,0,0,0,c,s,0,0,-s,c,0,x,yy,z,1]);m4mul(CHM2,CHM,CHR);gl.uniformMatrix4fv(P.u.u_model,false,CHM2);g3Draw(M.l);});
      // пыль из-под лап
      if(o.st===1&&Math.random()<dt*14)r3dPart(q.x,q.y+0.05,q.z,(Math.random()-0.5)*0.6,0.4,(Math.random()-0.5)*0.6,0.12,0.6,0.8,[150,132,100],0.3);
      continue;}
    if(o.kind==='camel'){if(Math.hypot(o.pos[0]-e[0],o.pos[2]-e[2])>420||!inFrustum(R3.fr,o.pos,3))continue;const M=chCamelMesh();use();o.ph+=dt*0.7;
      const fw=[Math.sin(o.yaw),0,Math.cos(o.yaw)],rt=[fw[2],0,-fw[0]];m4basis(CHM,rt,[0,1,0],fw,o.pos);gl.uniformMatrix4fv(P.u.u_model,false,CHM);g3Draw(M.b);if(o.load)g3Draw(M.c);
      [[0.22,1.6,0.62],[-0.22,1.6,0.62],[0.22,1.6,-0.62],[-0.22,1.6,-0.62]].forEach(([x,yy,z],k)=>{const a=k===0?Math.sin(o.ph)*0.04:0,c=Math.cos(a),s=Math.sin(a);CHR.set([1,0,0,0,0,c,s,0,0,-s,c,0,x,yy,z,1]);m4mul(CHM2,CHM,CHR);gl.uniformMatrix4fv(P.u.u_model,false,CHM2);g3Draw(M.l);});
      continue;}
    // дым: из трубы кузницы — серый столб; над разбитой машиной — тонкая струйка
    const sm=o.kind==='smoke'?o.rate:o.kind==='car'?o.smoke*1.5:0;if(!sm)continue;const d=Math.hypot(o.pos[0]-e[0],o.pos[2]-e[2]);if(d>420)continue;
    o.sm+=dt*sm;while(o.sm>=1){o.sm-=1;const y=o.kind==='smoke'?o.pos[1]:o.pos[1]+0.6;
      r3dPart(o.pos[0]+(Math.random()-0.5)*0.3,y,o.pos[2]+(Math.random()-0.5)*0.3,(Math.random()-0.5)*0.4,0.9+Math.random()*0.5,(Math.random()-0.5)*0.4,o.kind==='smoke'?0.5:0.35,o.kind==='smoke'?2.6:1.6,o.kind==='smoke'?4:2.6,o.kind==='smoke'?[96,94,92]:[70,68,66],o.kind==='smoke'?0.4:0.3);}}
  if(P)gl.uniformMatrix4fv(P.u.u_model,false,m4());}
/* ---------- люди у стоящей машины: механик меняет колесо, копается в моторе, льёт бензин из канистры ----------
   Раньше было только слово «РЕМОНТ» / «МЕНЯЕМ КОЛЕСО…» — машина просто стояла. Теперь рядом работают двое в робах:
   у пробитого колеса, у капота, у бака; у сошедшей машины стоит пилот. Не больше трёх машин рядом с камерой. */
const CREW_K=6;
function crewAttach(){R3.crewS=R3.people.length;R3.crewN=0;const A=R3.atlas;const L=A&&(A.mech&&A.mech.length?A.mech:A.marsh&&A.marsh.length?A.marsh:A.crowd);if(!L||!L.length)return;
  for(let k=0;k<CREW_K;k++)R3.people.push([0,-999,0,L[k%L.length],1,false,0]);R3.crewN=CREW_K;R3.peopleDirty=true;}
// почему машина стоит и что с ней делают
function crewWhy(c){if(!c||c.fin!==null&&c.fin!==undefined&&!c.dnf)return '';if((c.vx||0)>1.2)return '';
  if(c.dnf)return c.parked?'dnf':'';
  if(c.svc===2){const L=c.svcL;return L&&L.length?'wheel':c.svcWhat&&/бензин/.test(c.svcWhat)?'fuel':'fix';}
  if(c.stopT>0)return /заправка|канистра/.test(c.stopWhy||'')?'fuel':'fix';
  if(c.pitT>0||c.tyreSwap||(c.punct&&!c.flat))return 'wheel';
  return '';}
function crewTick(){if(!R3.crewN||!R)return;const P=R3.people,s0=R3.crewS,e=R3.eye;if(!e)return;let k=0;
  const L=[];for(const c of R.cars){const why=crewWhy(c);if(!why||!c.v3||!c.v3.mat)continue;const d=Math.hypot(c.x-e[0],c.z-e[2]);if(d<170)L.push([d,c,why]);}L.sort((a,b)=>a[0]-b[0]);
  for(const [,c,why] of L.slice(0,3)){const M=c.v3.mat,rt=[M[0],M[1],M[2]],fw=[M[8],M[9],M[10]],p=[M[12],M[13],M[14]];
    const put=(dx,dz,lx,lz)=>{if(k>=R3.crewN)return;const q=P[s0+k++];q[0]=p[0]+rt[0]*dx+fw[0]*dz;q[2]=p[2]+rt[2]*dx+fw[2]*dz;
      q[1]=(typeof fH==='function'?fH(q[0],q[2]):p[1]);if(!isFinite(q[1])||Math.abs(q[1]-p[1])>1.5)q[1]=p[1];
      // лицом к месту работы (колесо, капот, бак)
      const tx=p[0]+rt[0]*lx+fw[0]*lz-q[0],tz=p[2]+rt[2]*lx+fw[2]*lz-q[2];q[6]=Math.atan2(tx,tz);q[5]=why!=='dnf';};
    if(why==='wheel'){const w=c.tp?c.tp.findIndex(x=>x):-1,wk=w<0?3:w,sx=(wk&1)?1:-1,sz=wk<2?1.15:-1.0;put(sx*1.55,sz,sx*0.8,sz);put(sx*1.3,sz+(sz>0?1.4:-1.4),sx*0.8,sz);}
    else if(why==='fuel'){put(0.75,-1.75,0.3,-1.2);put(-1.35,-0.2,0,0);}
    else if(why==='fix'){put(0.55,2.2,0.2,1.6);put(-0.75,2.05,-0.2,1.6);}
    else put(-1.6,0.4,0,0);}
  for(let j=k;j<R3.crewN;j++)P[s0+j][1]=-999;
  if(k||R3.crewWas)r3dPeoplePatch(s0+R3.crewN);R3.crewWas=k;}
