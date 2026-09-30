/* ================= ФОТО-ТЕКСТУРЫ ГОНОК: загрузка tex/tex.js, массивы слоёв, небо, листва ================= */
// Материалы и небо — Poly Haven (polyhaven.com, CC0). Каждый материал — слой двух массивов:
// цвет (с затенением щелей, sRGB) и «данные» (нормаль XY + шероховатость). Листва — атлас с прозрачностью.
const TX={st:0,D:null,L:{},p:null};
// Качество картинки: «Экономно» — мельче текстуры и кадр, «HD» — по умолчанию, «Кино» — всё на максимум
function gfxQ(){const q=AU.on&&AU.on.gq;return q==='eco'||q==='cine'?q:'hd';}
const GQ={eco:{dpr:1.5,floor:0.6,minH:540,tex:256,shadow:1024,ms:2,post:false,veg:0.5,far:650,nrm:false,trees:0.6},
  hd:{dpr:2,floor:0.85,minH:720,tex:512,shadow:2048,ms:4,post:true,veg:1,far:1000,nrm:true,trees:1},
  cine:{dpr:2.6,floor:1,minH:900,tex:512,shadow:2048,ms:4,post:true,veg:1.4,far:1300,nrm:true,trees:1.25,flare:true}};
function gq(){return GQ[gfxQ()];}
// tex.js — большой файл (≈8 МБ): грузится один раз, при первой гонке (или заранее — при открытии заявки)
function texLoad(){
  if(TX.st===2)return Promise.resolve(TX);if(TX.p)return TX.p;
  TX.st=1;
  TX.p=new Promise((res,rej)=>{if(window.TEX_DATA){res(window.TEX_DATA);return;}
      const s=document.createElement('script');s.src='tex/tex.js';s.async=true;
      s.onload=()=>window.TEX_DATA?res(window.TEX_DATA):rej(new Error('tex.js: нет данных'));s.onerror=()=>rej(new Error('tex.js не загрузился'));document.head.appendChild(s);})
    .then(D=>{TX.D=D;D.lay.forEach((l,i)=>{TX.L[l.k]=i;});TX.st=2;return TX;})
    .catch(e=>{console.warn('textures',e);TX.st=-1;TX.p=null;throw e;});
  return TX.p;}
function texPrefetch(){if(TX.st===0&&typeof g3Can==='function'&&g3Can()&&gfxMode()!=='2d')texLoad().catch(()=>{});}
function texLi(k){const i=TX.L[k];return i===undefined?-1:i;}
function texDecode(url){
  if(window.createImageBitmap&&window.fetch)return fetch(url).then(r=>r.blob()).then(b=>createImageBitmap(b,{premultiplyAlpha:'none',colorSpaceConversion:'none'})).catch(()=>texImg(url));
  return texImg(url);}
function texImg(url){return new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src=url;});}
const texClose=im=>{try{if(im&&im.close)im.close();}catch(_){}};
function texPS(gl){gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL,gl.NONE);}
// Картинка нужного размера (для «Экономно» — вдвое мельче)
function texFit(im,S){if(im.width===S&&im.height===S)return im;const c=mkCanvas(S,S),g=c.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(im,0,0,S,S);return c;}
// Средний цвет слоя (линейный) — чтобы окрашивать фото цветом вершины: стены, крыши, трава по краям
function texAvg(im){const c=mkCanvas(8,8),g=c.getContext('2d');g.drawImage(im,0,0,8,8);const d=g.getImageData(0,0,8,8).data,o=[0,0,0];
  for(let i=0;i<64;i++)for(let k=0;k<3;k++)o[k]+=Math.pow(d[i*4+k]/255,2.2)/64;return o;}
// Всё в видеокарту: массивы слоёв и листва (один раз на контекст WebGL)
// Сменили качество — слои другого размера: старые освобождаем, грузим заново
function texFree(){const C=G3.cache,tx=C.tx,gl=G3.gl;C.tx=null;if(!tx||!gl)return;
  try{[tx.alb,tx.dat,tx.fol,...Object.values(tx.sky).map(v=>v&&v.t)].forEach(t=>{if(t)gl.deleteTexture(t);});}catch(e){}}
async function texUpload(){
  const C=G3.cache;if(C.tx&&C.tx.S!==gq().tex&&!C.txP)texFree();if(C.tx)return C.tx;if(C.txP)return C.txP;
  const run=async()=>{
    await texLoad();const gl=G3.gl;if(!gl||gl.isContextLost())throw new Error('нет контекста');
    const D=TX.D,n=D.lay.length,S=gq().tex,lv=Math.floor(Math.log2(S))+1;texPS(gl);
    const mk=fmt=>{const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D_ARRAY,t);gl.texStorage3D(gl.TEXTURE_2D_ARRAY,lv,fmt,S,S,n);return t;};
    gl.activeTexture(gl.TEXTURE3);const alb=mk(gl.SRGB8_ALPHA8);gl.activeTexture(gl.TEXTURE4);const dat=mk(gl.RGBA8);
    const lay=new Float32Array(160),avg=new Float32Array(160);
    for(let i=0;i<n;i++){const l=D.lay[i];
      const [a,d]=await Promise.all([texDecode(D.img[l.k+'_a']),texDecode(D.img[l.k+'_d'])]);
      if(!G3.gl||G3.gl!==gl){texClose(a);texClose(d);throw new Error('контекст сменился');}
      gl.activeTexture(gl.TEXTURE3);gl.bindTexture(gl.TEXTURE_2D_ARRAY,alb);gl.texSubImage3D(gl.TEXTURE_2D_ARRAY,0,0,0,i,S,S,1,gl.RGBA,gl.UNSIGNED_BYTE,texFit(a,S));
      gl.activeTexture(gl.TEXTURE4);gl.bindTexture(gl.TEXTURE_2D_ARRAY,dat);gl.texSubImage3D(gl.TEXTURE_2D_ARRAY,0,0,0,i,S,S,1,gl.RGBA,gl.UNSIGNED_BYTE,texFit(d,S));
      const v=texAvg(a);avg.set([v[0],v[1],v[2],1],i*4);lay.set([1/Math.max(0.3,l.m||2.5),0,0,0],i*4);texClose(a);texClose(d);}
    [[3,alb],[4,dat]].forEach(([u,t])=>{gl.activeTexture(gl.TEXTURE0+u);gl.bindTexture(gl.TEXTURE_2D_ARRAY,t);gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D_ARRAY,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D_ARRAY,gl.TEXTURE_WRAP_T,gl.REPEAT);
      if(G3.an)gl.texParameterf(gl.TEXTURE_2D_ARRAY,G3.an.TEXTURE_MAX_ANISOTROPY_EXT,G3.anMax);});
    // листва: цвет + прозрачность из двух картинок
    let fol=null;if(D.img.foliage_c&&D.img.foliage_a){const [c,a]=await Promise.all([texDecode(D.img.foliage_c),texDecode(D.img.foliage_a)]);
      const w=c.width,h=c.height,cv=mkCanvas(w,h),g=cv.getContext('2d');g.drawImage(c,0,0);const id=g.getImageData(0,0,w,h);
      const cv2=mkCanvas(w,h),g2=cv2.getContext('2d');g2.drawImage(a,0,0,w,h);const ad=g2.getImageData(0,0,w,h).data,px=id.data;for(let i=3;i<px.length;i+=4)px[i]=ad[i-3];
      texClose(c);texClose(a);gl.activeTexture(gl.TEXTURE1);fol=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,fol);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.SRGB8_ALPHA8,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,id);gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      if(G3.an)gl.texParameterf(gl.TEXTURE_2D,G3.an.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(4,G3.anMax));}
    gl.activeTexture(gl.TEXTURE0);
    return C.tx={alb,dat,fol,lay,avg,sky:{},n,S};};
  C.txP=run().catch(e=>{C.txP=null;throw e;});return C.txP;}
// Небо: фото нужного настроения — в видеокарту (с мип-уровнями для размытых отражений)
async function texSky(mood){
  const C=G3.cache,tx=C.tx;if(!tx)throw new Error('нет текстур');if(tx.sky[mood])return tx.sky[mood];
  const D=TX.D,url=D.img['sky_'+mood]||D.img.sky_clear;if(!url)return null;
  const im=await texDecode(url),gl=G3.gl;if(!gl)throw new Error('нет контекста');texPS(gl);
  const eco=gfxQ()==='eco',src=eco?(()=>{const c=mkCanvas(1024,512);c.getContext('2d').drawImage(im,0,0,1024,512);return c;})():im;
  gl.activeTexture(gl.TEXTURE5);const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.SRGB8_ALPHA8,gl.RGBA,gl.UNSIGNED_BYTE,src);
  gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.activeTexture(gl.TEXTURE0);
  texClose(im);const w=eco?1024:(im.width||2048);return tx.sky[mood]={t,lv:Math.floor(Math.log2(w))+1};}
// Привязать всё к своим блокам перед кадром (могли перебить студия или обработка кадра)
function texBind(sky){const gl=G3.gl,tx=G3.cache.tx;
  gl.activeTexture(gl.TEXTURE3);gl.bindTexture(gl.TEXTURE_2D_ARRAY,tx?tx.alb:G3.dumA);gl.activeTexture(gl.TEXTURE4);gl.bindTexture(gl.TEXTURE_2D_ARRAY,tx?tx.dat:G3.dumA);
  gl.activeTexture(gl.TEXTURE5);gl.bindTexture(gl.TEXTURE_2D,sky&&sky.t?sky.t:G3.dum2);gl.activeTexture(gl.TEXTURE0);}
// Сразу всё для гонки: слои, листва и небо; по готовности — cb(true), при ошибке — cb(false) (гонка пойдёт по-старому)
function texPrepare(mood,cb){texUpload().then(()=>texSky(mood)).then(()=>cb(true)).catch(e=>{console.warn('tex prepare',e);cb(false);});}
