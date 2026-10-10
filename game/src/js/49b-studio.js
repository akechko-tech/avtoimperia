/* ================= СТУДИЯ: портрет машины для карточки — та же 3D-модель, что в гонке, отрисованная видеокартой ================= */
// Свет как в фотоателье: большой софтбокс сверху, световая полоса по горизонту (блик вдоль кузова), мягкая тень на полу.
// Сглаживание: рисуем вдвое крупнее с многосэмплингом и уменьшаем. Без WebGL2 — прежняя программная отрисовка.
const STU={cache:new Map(),fb:null,cb:null,db:null,rfb:null,rb:null,w:0,h:0,floor:null,fail:0};
function stuGL(){
  if(STU.fail>2)return null;
  if(typeof R!=='undefined'&&R&&R.gl&&!R.done)return null;           // идёт 3D-гонка — видеокарта занята
  const cv=document.getElementById('rgl');if(!cv||!g3Can())return null;
  try{if(!g3Init(cv))return null;}catch(e){STU.fail++;return null;}
  const gl=G3.gl;if(!gl||gl.isContextLost())return null;
  if(!G3.P.scar){try{G3.P.scar=g3Prog(G3VS,G3FS,['CAR','STUDIO']);G3.P.sfloor=g3Prog(G3VS,G3FS,['CATCH']);}catch(e){STU.fail=9;console.warn(e);return null;}}
  return gl;}
// Буферы кадра: многосэмпловый для рисования и обычный — чтобы прочитать картинку
function stuTarget(gl,w,h){
  if(STU.fb&&STU.w===w&&STU.h===h&&STU.gl===gl)return true;
  if(STU.fb&&STU.gl===gl){gl.deleteFramebuffer(STU.fb);gl.deleteRenderbuffer(STU.cb);gl.deleteRenderbuffer(STU.db);gl.deleteFramebuffer(STU.rfb);gl.deleteRenderbuffer(STU.rb);}
  const ms=Math.min(4,gl.getParameter(gl.MAX_SAMPLES)||0);
  const fb=gl.createFramebuffer(),cb=gl.createRenderbuffer(),db=gl.createRenderbuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fb);
  gl.bindRenderbuffer(gl.RENDERBUFFER,cb);if(ms)gl.renderbufferStorageMultisample(gl.RENDERBUFFER,ms,gl.RGBA8,w,h);else gl.renderbufferStorage(gl.RENDERBUFFER,gl.RGBA8,w,h);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.RENDERBUFFER,cb);
  gl.bindRenderbuffer(gl.RENDERBUFFER,db);if(ms)gl.renderbufferStorageMultisample(gl.RENDERBUFFER,ms,gl.DEPTH_COMPONENT24,w,h);else gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT24,w,h);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,db);
  const ok1=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;
  const rfb=gl.createFramebuffer(),rb=gl.createRenderbuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,rfb);gl.bindRenderbuffer(gl.RENDERBUFFER,rb);gl.renderbufferStorage(gl.RENDERBUFFER,gl.RGBA8,w,h);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.RENDERBUFFER,rb);const ok2=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.bindRenderbuffer(gl.RENDERBUFFER,null);
  Object.assign(STU,{fb,cb,db,rfb,rb,w,h,gl});return ok1&&ok2;}
// Портрет машины: spec — облик (как в гонке), o.w — ширина картинки в пикселях, o.yaw/o.pitch — ракурс, o.crew — с водителем
function stuRender(spec,o){
  o=o||{};const gl=stuGL();if(!gl)return null;
  const W=Math.round(o.w||560),SS=2,yaw=o.yaw===undefined?0.72:o.yaw,pitch=o.pitch===undefined?0.2:o.pitch;
  const M=carModel(Object.assign({},spec,{lod:'hi',crew:o.crew?1:0,studio:1})),op=new MB(),gm=new MB();mbFromMesh(op,M,{lift:0.003,step:0.0012,glass:gm});
  const mOp=g3Mesh(op),mGl=gm.n?g3Mesh(gm):null;if(!mOp)return null;
  const wc=new Float32Array(24);(M.wheels||[]).slice(0,6).forEach((w,k)=>wc.set(w,k*4));const pivot=M.wheels&&M.wheels[0]?Math.abs(M.wheels[0][3]):0.42;
  const bb=op.bb,ctr=[(bb[0]+bb[3])/2,(bb[1]+bb[4])*0.42,(bb[2]+bb[5])/2],rad=Math.hypot(bb[3]-bb[0],bb[4]-bb[1],bb[5]-bb[2])/2;
  // камера: три четверти спереди, чуть сверху, длиннофокусный объектив — без искажений
  const dist=rad*7.5,eye=[ctr[0]+Math.sin(yaw)*Math.cos(pitch)*dist,ctr[1]+Math.sin(pitch)*dist,ctr[2]+Math.cos(yaw)*Math.cos(pitch)*dist];
  const fw=v3n([ctr[0]-eye[0],ctr[1]-eye[1],ctr[2]-eye[2]]),rt=v3n(v3x([0,1,0],fw)),up=v3x(fw,rt);
  const V=m4(),P=m4(),VP=m4();m4view(V,eye,rt,up,fw);m4persp(P,2*Math.atan(rad*1.15/dist),1,dist-rad*3,dist+rad*3);m4mul(VP,P,V);
  // рамка: машина и её тень на полу целиком, с полями
  let x0=9,x1=-9,y0=9,y1=-9;const pr=(x,y,z)=>{const cx=VP[0]*x+VP[4]*y+VP[8]*z+VP[12],cy=VP[1]*x+VP[5]*y+VP[9]*z+VP[13],cw=VP[3]*x+VP[7]*y+VP[11]*z+VP[15];const u=cx/cw,v=cy/cw;if(u<x0)x0=u;if(u>x1)x1=u;if(v<y0)y0=v;if(v>y1)y1=v;};
  for(let i=0;i<8;i++)pr(i&1?bb[3]:bb[0],i&2?bb[4]:bb[1],i&4?bb[5]:bb[2]);
  const sx0=bb[0]-0.25,sx1=bb[3]+0.25,sz0=bb[2]-0.35,sz1=bb[5]+0.2;pr(sx0,0,sz0);pr(sx1,0,sz0);pr(sx0,0,sz1);pr(sx1,0,sz1);
  const padX=0.035,padY=0.05,H=Math.round(clamp(W*(y1-y0)/(x1-x0)*(1+2*padY)/(1+2*padX),W*0.3,W*0.9));
  const ax=2/((x1-x0)*(1+2*padX)),ay=2/((y1-y0)*(1+2*padY)),cxN=(x0+x1)/2,cyN=(y0+y1)/2;
  const A=new Float32Array([ax,0,0,0, 0,ay,0,0, 0,0,1,0, -ax*cxN,-ay*cyN,0,1]),VPf=m4();m4mul(VPf,A,VP);
  const w2=W*SS,h2=H*SS;if(!stuTarget(gl,w2,h2)){STU.fail++;g3Free(mOp);g3Free(mGl);return null;}
  // свет: ключевой — сверху слева спереди, заполняющий — небо софтбокса
  const E={sun:v3n([-0.45,0.95,0.5]),sunC:[2.45,2.38,2.25],skyC:[0.62,0.64,0.68],gndC:[0.2,0.19,0.18],hzC:[0.34,0.35,0.37],zeC:[0.95,0.96,1.0],fogS:[1,1,1]};
  // тень: карта глубины от ключевого света на квадрат вокруг машины
  const SHM=m4();let shOn=!!G3.shFB;
  if(shOn){const S=rad*1.25,f=[-E.sun[0],-E.sun[1],-E.sun[2]],srt=v3n(v3x([0,1,0],f)),sup=v3x(f,srt),se=[ctr[0]-f[0]*20,ctr[1]-f[1]*20,ctr[2]-f[2]*20],SV=m4(),SP=m4();
    m4view(SV,se,srt,sup,f);m4ortho(SP,-S,S,-S,S,1,40);m4mul(SHM,SP,SV);
    gl.bindFramebuffer(gl.FRAMEBUFFER,G3.shFB);gl.viewport(0,0,G3.shS,G3.shS);gl.clear(gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.disable(gl.CULL_FACE);gl.disable(gl.BLEND);gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(2,4);
    const Pd=G3.P.dCar;gl.useProgram(Pd.p);gl.uniformMatrix4fv(Pd.u.u_vp,false,SHM);gl.uniform4fv(Pd.u.u_mat,MPAR);stuCarU(gl,Pd,wc,pivot,o);gl.uniformMatrix4fv(Pd.u.u_model,false,m4());g3Draw(mOp);gl.disable(gl.POLYGON_OFFSET_FILL);}
  gl.bindFramebuffer(gl.FRAMEBUFFER,STU.fb);gl.viewport(0,0,w2,h2);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.disable(gl.CULL_FACE);
  const use=(Pp)=>{const u=Pp.u;gl.useProgram(Pp.p);gl.uniformMatrix4fv(u.u_vp,false,VPf);if(u.u_shm)gl.uniformMatrix4fv(u.u_shm,false,SHM);
    gl.uniform3fv(u.u_sun,E.sun);gl.uniform3fv(u.u_sunC,E.sunC);gl.uniform3fv(u.u_skyC,E.skyC);gl.uniform3fv(u.u_gndC,E.gndC);gl.uniform3fv(u.u_hzC,E.hzC);gl.uniform3fv(u.u_zeC,E.zeC);gl.uniform3fv(u.u_fogS,E.fogS);
    gl.uniform3fv(u.u_cam,eye);gl.uniform1f(u.u_fogD,0);gl.uniform1f(u.u_exp,o.exp||1.05);gl.uniform1f(u.u_time,0);gl.uniform1f(u.u_vig,0);gl.uniform2f(u.u_res,w2,h2);
    if(u.u_mat)gl.uniform4fv(u.u_mat,MPAR);if(u.u_sh){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,G3.sh);gl.uniform1i(u.u_sh,0);gl.uniform3f(u.u_shI,3.2/G3.shS,shOn?1:0,0);}
    if(u.u_hl)gl.uniform1f(u.u_hl,0);if(u.u_lamp)gl.uniform4f(u.u_lamp,0,0,0,0);return u;};
  // пол: только тень и мягкая «пыль» контакта под машиной — остальное прозрачно
  if(!STU.floor||STU.floorGL!==gl){const mb=new MB();mb.poly([[-9,0,-9],[9,0,-9],[9,0,9],[-9,0,9]],[0,1,0],[128,128,128],MID.matte);STU.floor=g3Mesh(mb);STU.floorGL=gl;}
  let u=use(G3.P.sfloor);gl.uniformMatrix4fv(u.u_model,false,m4());gl.uniform4f(u.u_foot,ctr[0],ctr[2],(bb[3]-bb[0])*0.5+0.12,(bb[5]-bb[2])*0.5+0.1);
  gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);g3Draw(STU.floor);gl.depthMask(true);gl.disable(gl.BLEND);
  // машина
  u=use(G3.P.scar);gl.uniformMatrix4fv(u.u_model,false,m4());stuCarU(gl,G3.P.scar,wc,pivot,o);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);g3Draw(mOp);
  if(mGl){gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);g3Draw(mGl);gl.depthMask(true);gl.disable(gl.BLEND);}
  gl.disable(gl.CULL_FACE);
  // сводим сэмплы и читаем картинку
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER,STU.fb);gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,STU.rfb);gl.blitFramebuffer(0,0,w2,h2,0,0,w2,h2,gl.COLOR_BUFFER_BIT,gl.NEAREST);
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER,STU.rfb);const px=new Uint8Array(w2*h2*4);gl.readPixels(0,0,w2,h2,gl.RGBA,gl.UNSIGNED_BYTE,px);
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);g3Free(mOp);g3Free(mGl);
  const big=mkCanvas(w2,h2),bg=big.getContext('2d'),id=bg.createImageData(w2,h2),row=w2*4;for(let yy=0;yy<h2;yy++)id.data.set(px.subarray((h2-1-yy)*row,(h2-yy)*row),yy*row);bg.putImageData(id,0,0);
  const cv=mkCanvas(W,H),c=cv.getContext('2d');c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(big,0,0,W,H);
  return cv;}
// Колёса и кузов в студии: стоят ровно, передние чуть повёрнуты к зрителю — как на рекламном снимке
function stuCarU(gl,P,wc,pivot,o){gl.uniform4fv(P.u.u_wc,wc);gl.uniform4f(P.u.u_wr,0.35,o.steer===undefined?-0.22:o.steer,0,0);gl.uniform4f(P.u.u_body,0,0,0,pivot);if(P.u.u_tf)gl.uniform4f(P.u.u_tf,0,0,0,0);}
// Картинка машины для интерфейса: данные-URL (кэш по облику и размеру)
function stuKey(spec,o){return spec.key+'|'+(o.w||560)+'|'+(o.crew?1:0)+'|'+(o.yaw===undefined?'':o.yaw)+'|'+(o.pitch===undefined?'':o.pitch);}
function stuImage(spec,o){o=o||{};const key=stuKey(spec,o);let url=STU.cache.get(key);if(url)return url;
  let cv=null;try{cv=stuRender(spec,o);}catch(e){STU.fail++;console.warn('studio',e);}
  if(!cv)return null;url=cv.toDataURL('image/png');if(STU.cache.size>48)STU.cache.delete(STU.cache.keys().next().value);STU.cache.set(key,url);return url;}
// Холст сразу (для заявки на гонку): видеокарта, а без неё — программная отрисовка
function stuCanvas(spec,o){o=o||{};const key='cv|'+stuKey(spec,o);let cv=STU.cvs&&STU.cvs.get(key);if(cv)return cv;
  try{cv=stuRender(spec,o);}catch(e){STU.fail++;cv=null;}if(!cv)return null;STU.cvs=STU.cvs||new Map();if(STU.cvs.size>12)STU.cvs.delete(STU.cvs.keys().next().value);STU.cvs.set(key,cv);return cv;}
// Очередь: карточки показываются сразу, портрет дорисовывается следом (по 40 мс за раз) и подставляется в <img data-stu>
const STU_BLANK="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='260'/%3E";
STU.q=[];STU.ids=new Map();STU.t=0;
function stuId(key){let id=STU.ids.get(key);if(!id){id='s'+(STU.ids.size+1);STU.ids.set(key,id);}return id;}
function stuQueue(key,spec,o,soft){if(STU.cache.has(key)||STU.q.some(q=>q.key===key))return;STU.q.push({key,spec,o,soft});if(!STU.t)STU.t=setTimeout(stuPump,20);}
function stuPump(){STU.t=0;const t0=performance.now();
  while(STU.q.length&&performance.now()-t0<40){const q=STU.q.shift();let url=stuImage(q.spec,q.o);
    if(!url&&q.soft){try{url=q.soft();}catch(e){url=null;}if(url)STU.cache.set(q.key,url);}
    if(url)document.querySelectorAll('img[data-stu="'+stuId(q.key)+'"]').forEach(im=>{im.src=url;im.classList.add('ready');});}
  if(STU.q.length)STU.t=setTimeout(stuPump,16);}
