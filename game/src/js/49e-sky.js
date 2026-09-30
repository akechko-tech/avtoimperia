/* ================= 0.19: небо, солнце и погода по ходу гонки =================
   Часы гонки двигают солнце (высота и азимут — по месту, месяцу и часу), в сумерках небо переходит в закатное фото,
   ночью горят фары и окна. Смена погоды — плавный переход между двумя фото неба и светом разных настроений. */
function r3dEnvMood(m){const C=R3.envM||(R3.envM={});if(C[m])return C[m];const W=Object.assign({},R3.W,{mood:m,rain:m==='overcast'});return C[m]=r3dEnvBase(R3.T,W);}
function r3dSkyWant(m){const tx=G3.cache&&G3.cache.tx;if(!tx||!m)return null;if(tx.sky[m])return tx.sky[m];const L=R3.skyLoading||(R3.skyLoading={});
  if(!L[m]){L[m]=1;try{texSky(m).catch(()=>{});}catch(_){}}return null;}
function r3dSkyRot(m,th){const S=TX.D&&TX.D.sky&&TX.D.sky[m];return S?((S.sun[0]/360-th/6.2832+10)%1):0;}
// заранее — все небеса, что понадобятся по сценарию (погода и сумерки)
function r3dSkyPreload(){const S=R.scn;if(!S||!S.wxP)return;const ms=new Set(S.wxP.map(x=>x[1]));
  for(let k=0;k<=12;k++){const h=S.h0+S.span*k/12,e=scnSun(((h%24)+24)%24,(R.rc.m??5),S.lat||47).el*57.3;if(e<12&&e>-6)ms.add(((h%24)+24)%24<12?'morning':'evening');}
  ms.forEach(m=>r3dSkyWant(m));}
function r3dEnvScn(){const S=R.scn,E0=R3.env,W=R3.W;
  const mix=(a,b,t)=>t<=0.001?a:t>=0.999?b:E0.mix(a,b,t);
  const A=r3dEnvMood(S.moodA),B=r3dEnvMood(S.moodB),k=clamp(S.moodK,0,1);
  let e=mix(A.day,B.day,k);
  // солнце по часам
  const hh=((scnHour()%24)+24)%24,sn=scnSun(hh,(R.rc.m??5),S.lat||47),el=sn.el*57.2958,th=(W.az||0)+sn.az;
  const kd=clamp((12-el)/12,0,1),kn=clamp((-2-el)/8,0,1);
  if(kd>0.001)e=mix(e,B.dusk,kd*0.85);if(kn>0.001)e=mix(e,B.night,kn);
  if(e===A.day||e===B.day)e=Object.assign({},e);
  const elc=Math.max(el,2)/57.2958;e.sun=kn>0.6?B.night.sun:v3n([Math.cos(elc)*Math.sin(th),Math.sin(elc),Math.cos(elc)*Math.cos(th)]);
  e.hl=Math.max(e.hl||0,clamp((5-el)/8,0,1));e.lamp=Math.max(e.lamp||0,clamp((3-el)/8,0,1));
  // туман и дымка
  if(R.fogK>0.01){e.fogD=(e.fogD||0.001)*(1+R.fogK*3.2);e.fogS=e.fogS.map(v=>v+(1.05-v)*R.fogK*0.45);}
  // небо: основное фото — погода; второе — сумерки или соседняя погода
  const prim=k<0.5?S.moodA:S.moodB;let sec=null,mx=0;
  if(kd>0.05&&kn<0.95&&prim!=='overcast'){sec=hh<12?'morning':'evening';mx=Math.min(0.92,kd*1.1);if(sec===prim){sec=null;mx=0;}}
  else if(S.moodA!==S.moodB&&k>0.001&&k<0.999){sec=k<0.5?S.moodB:S.moodA;mx=k<0.5?k:1-k;}
  const tx=G3.cache.tx,t1=r3dSkyWant(prim)||R3.sky,t2=sec?r3dSkyWant(sec):null;
  R3.sky=t1;R3.sky2=t2&&mx>0.001?t2:null;e.skyMix=R3.sky2?mx:0;e.envRot=r3dSkyRot(prim,th);e.envRot2=sec?r3dSkyRot(sec,th):0;
  return e;}
