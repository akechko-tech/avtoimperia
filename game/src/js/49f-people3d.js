/* ================= 0.21: объёмные люди рядом с камерой =================
   Раньше все зрители были «плакатами» — снимок 3D-модели, всегда повёрнутый к камере: вблизи видно, что они плоские.
   Теперь люди ближе ~34 м рисуются настоящими 3D-моделями (те же, из которых снят атлас): стоят лицом к дороге,
   переминаются, машущие — поднимают руку со шляпой или флажком. Дальше — прежние лёгкие «плакаты» (на телефоне быстро).
   Модели строятся понемногу в свободные мгновения после старта; пока не готовы — все люди остаются «плакатами». */
const P3D={R:34,max:64,near:11,list:[]};
// модели для одной эпохи: у каждого человека атласа — два кадра (стоит / машет)
function r3dPeople3dBuild(budgetMs){const A=R3.atlas,C=G3.cache,era=R3.atlasEra;if(!A||!A.bld)return true;const key='p3d'+era;
  const D=C[key]||(C[key]={i:0,m:[],done:false,all:[]});if(D.done)return true;
  if(!D.all.length)['crowd','marsh','gend','photo'].forEach(k=>(A[k]||[]).forEach(e=>{if(e.bld)D.all.push(e);}));
  const t0=performance.now();
  const mk=(b,fr)=>{const M=new Mesh();b(M,fr);const mb=new MB();mbFromMesh(mb,M,{lift:0.003,step:0.001,car:true});return g3Mesh(mb);};
  while(D.i<D.all.length&&performance.now()-t0<(budgetMs||6)){const e=D.all[D.i++];e.m3=[];e.m3l=[];
    for(let fr=0;fr<(e.anim?2:1);fr++){try{e.m3.push(mk(e.bld,fr));e.m3l.push(e.bld0?mk(e.bld0,fr):e.m3[fr]);}catch(err){console.warn('p3d',err);}}}
  if(D.i>=D.all.length)D.done=true;return D.done;}
function r3dPeople3dReady(){const D=G3.cache&&G3.cache['p3d'+R3.atlasEra];return !!(D&&D.done);}
// кто рядом: ближе R, в кадре; самые близкие — первыми
function r3dPeopleNear(){const P=R3.people,e=R3.eye,R2=P3D.R*P3D.R,L=P3D.list;L.length=0;if(!e)return L;
  for(let i=0;i<P.length;i++){const q=P[i],dx=q[0]-e[0],dz=q[2]-e[2],d2=dx*dx+dz*dz;if(d2>R2||!q[3].m3||!q[3].m3.length)continue;if(!inFrustum(R3.fr,[q[0],q[1]+0.9,q[2]],1.2))continue;L.push([d2,q,i]);}
  L.sort((a,b)=>a[0]-b[0]);if(L.length>P3D.max)L.length=P3D.max;return L;}
function r3dDrawPeople3d(E,bw,bh){if(!R3.p3dOn)return;const L=r3dPeopleNear();if(!L.length)return;const gl=G3.gl,P=r3dUse('car',E,bw,bh),M=R3.p3dM||(R3.p3dM=m4()),t=R3.time;
  if(P.u.u_dirt)gl.uniform4f(P.u.u_dirt,0,0,0,0);if(P.u.u_wc)gl.uniform4f(P.u.u_wc,0,-9,0,1);if(P.u.u_wr)gl.uniform4f(P.u.u_wr,0,0,0,0);if(P.u.u_body)gl.uniform4f(P.u.u_body,0,0,0,0);
  gl.uniform4f(P.u.u_lamp,0,E.hl,0,0);if(P.u.u_dark)gl.uniform1f(P.u.u_dark,0);gl.disable(gl.CULL_FACE);
  const N2=P3D.near*P3D.near;
  for(const [d2,q] of L){const s=q[3],k=q[4],ph=q[0]*0.37+q[2]*0.29,fr=s.anim&&q[5]?Math.floor(((t*2.6+ph)%2+2)%2):0,Ms=d2<N2||!s.m3l||!s.m3l.length?s.m3:s.m3l,m=Ms[Math.min(fr,Ms.length-1)];if(!m)continue;
    // лицом к дороге; чуть переминаются
    const yaw=(q[6]||0)+Math.sin(t*0.7+ph)*0.08,c=Math.cos(yaw),sn=Math.sin(yaw);
    M[0]=c*k;M[1]=0;M[2]=-sn*k;M[3]=0;M[4]=0;M[5]=k;M[6]=0;M[7]=0;M[8]=sn*k;M[9]=0;M[10]=c*k;M[11]=0;M[12]=q[0];M[13]=q[1];M[14]=q[2];M[15]=1;
    gl.uniformMatrix4fv(P.u.u_model,false,M);g3Draw(m);}
  gl.enable(gl.CULL_FACE);}
// каждый кадр: достраиваем модели; когда готовы — «плакаты» ближе R гаснут (их заменили модели)
function r3dPeople3dTick(){if(!R3.atlas||!R3.atlas.bld||R3.lowQ){R3.p3dOn=false;return;}if(!R3.p3dOn){if(r3dPeople3dBuild(R3.ready?5:2))R3.p3dOn=true;}}
