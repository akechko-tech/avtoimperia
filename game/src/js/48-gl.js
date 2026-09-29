/* ================= 3D-ДВИЖОК ГОНКИ (WebGL2): шейдеры, сетки, тени, туман ================= */
// Мир в метрах: x и z — по земле, y — вверх. Смотрим вдоль +z — ось +x справа (как в физике гонки: курс (sin yaw, cos yaw)).
// Свет: солнце с мягкими тенями, небо и земля (полусфера), блики лака и металла, отражение неба, туман, плёночная тональная кривая.
const G3={ok:undefined,gl:null,cv:null,P:{},an:null,anMax:1,sh:null,shFB:null,shS:1024,lost:false,dc:0,tri:0};
function g3Can(){
  if(G3.ok!==undefined)return G3.ok;
  try{const c=document.createElement('canvas'),g=c.getContext('webgl2');G3.ok=!!(g&&g.getParameter(g.MAX_TEXTURE_SIZE)>=2048&&g.getParameter(g.MAX_VERTEX_UNIFORM_VECTORS)>=128);
    const l=g&&g.getExtension('WEBGL_lose_context');if(l)l.loseContext();}catch(_){G3.ok=false;}
  return G3.ok;
}
/* ---------- матрицы 4×4 (по столбцам, как в GL) ---------- */
const m4=()=>{const m=new Float32Array(16);m[0]=m[5]=m[10]=m[15]=1;return m;};
function m4mul(o,a,b){const t=G3.tmp||(G3.tmp=new Float32Array(16));for(let c=0;c<4;c++)for(let r=0;r<4;r++)t[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];o.set(t);return o;}
// Перспектива для левой системы: z вперёд, ближняя плоскость → −1, дальняя → +1
function m4persp(o,fovy,asp,n,f){const t=1/Math.tan(fovy/2);o.fill(0);o[0]=t/asp;o[5]=t;o[10]=(f+n)/(f-n);o[11]=1;o[14]=-2*f*n/(f-n);return o;}
function m4ortho(o,l,r,b,t,n,f){o.fill(0);o[0]=2/(r-l);o[5]=2/(t-b);o[10]=2/(f-n);o[12]=-(r+l)/(r-l);o[13]=-(t+b)/(t-b);o[14]=-(f+n)/(f-n);o[15]=1;return o;}
// Вид из точки e по базису: rt — вправо, up — вверх, fw — вперёд
function m4view(o,e,rt,up,fw){const d=(a)=>-(a[0]*e[0]+a[1]*e[1]+a[2]*e[2]);
  o[0]=rt[0];o[4]=rt[1];o[8]=rt[2];o[12]=d(rt);o[1]=up[0];o[5]=up[1];o[9]=up[2];o[13]=d(up);o[2]=fw[0];o[6]=fw[1];o[10]=fw[2];o[14]=d(fw);o[3]=o[7]=o[11]=0;o[15]=1;return o;}
// Положение модели: столбцы — оси модели в мире (вправо, вверх, вперёд) и точка
function m4basis(o,rt,up,fw,p){o[0]=rt[0];o[1]=rt[1];o[2]=rt[2];o[3]=0;o[4]=up[0];o[5]=up[1];o[6]=up[2];o[7]=0;o[8]=fw[0];o[9]=fw[1];o[10]=fw[2];o[11]=0;o[12]=p[0];o[13]=p[1];o[14]=p[2];o[15]=1;return o;}
function m4inv(o,m){const a=m,b=new Float32Array(16);
  b[0]=a[5]*a[10]*a[15]-a[5]*a[11]*a[14]-a[9]*a[6]*a[15]+a[9]*a[7]*a[14]+a[13]*a[6]*a[11]-a[13]*a[7]*a[10];
  b[4]=-a[4]*a[10]*a[15]+a[4]*a[11]*a[14]+a[8]*a[6]*a[15]-a[8]*a[7]*a[14]-a[12]*a[6]*a[11]+a[12]*a[7]*a[10];
  b[8]=a[4]*a[9]*a[15]-a[4]*a[11]*a[13]-a[8]*a[5]*a[15]+a[8]*a[7]*a[13]+a[12]*a[5]*a[11]-a[12]*a[7]*a[9];
  b[12]=-a[4]*a[9]*a[14]+a[4]*a[10]*a[13]+a[8]*a[5]*a[14]-a[8]*a[6]*a[13]-a[12]*a[5]*a[10]+a[12]*a[6]*a[9];
  b[1]=-a[1]*a[10]*a[15]+a[1]*a[11]*a[14]+a[9]*a[2]*a[15]-a[9]*a[3]*a[14]-a[13]*a[2]*a[11]+a[13]*a[3]*a[10];
  b[5]=a[0]*a[10]*a[15]-a[0]*a[11]*a[14]-a[8]*a[2]*a[15]+a[8]*a[3]*a[14]+a[12]*a[2]*a[11]-a[12]*a[3]*a[10];
  b[9]=-a[0]*a[9]*a[15]+a[0]*a[11]*a[13]+a[8]*a[1]*a[15]-a[8]*a[3]*a[13]-a[12]*a[1]*a[11]+a[12]*a[3]*a[9];
  b[13]=a[0]*a[9]*a[14]-a[0]*a[10]*a[13]-a[8]*a[1]*a[14]+a[8]*a[2]*a[13]+a[12]*a[1]*a[10]-a[12]*a[2]*a[9];
  b[2]=a[1]*a[6]*a[15]-a[1]*a[7]*a[14]-a[5]*a[2]*a[15]+a[5]*a[3]*a[14]+a[13]*a[2]*a[7]-a[13]*a[3]*a[6];
  b[6]=-a[0]*a[6]*a[15]+a[0]*a[7]*a[14]+a[4]*a[2]*a[15]-a[4]*a[3]*a[14]-a[12]*a[2]*a[7]+a[12]*a[3]*a[6];
  b[10]=a[0]*a[5]*a[15]-a[0]*a[7]*a[13]-a[4]*a[1]*a[15]+a[4]*a[3]*a[13]+a[12]*a[1]*a[7]-a[12]*a[3]*a[5];
  b[14]=-a[0]*a[5]*a[14]+a[0]*a[6]*a[13]+a[4]*a[1]*a[14]-a[4]*a[2]*a[13]-a[12]*a[1]*a[6]+a[12]*a[2]*a[5];
  b[3]=-a[1]*a[6]*a[11]+a[1]*a[7]*a[10]+a[5]*a[2]*a[11]-a[5]*a[3]*a[10]-a[9]*a[2]*a[7]+a[9]*a[3]*a[6];
  b[7]=a[0]*a[6]*a[11]-a[0]*a[7]*a[10]-a[4]*a[2]*a[11]+a[4]*a[3]*a[10]+a[8]*a[2]*a[7]-a[8]*a[3]*a[6];
  b[11]=-a[0]*a[5]*a[11]+a[0]*a[7]*a[9]+a[4]*a[1]*a[11]-a[4]*a[3]*a[9]-a[8]*a[1]*a[7]+a[8]*a[3]*a[5];
  b[15]=a[0]*a[5]*a[10]-a[0]*a[6]*a[9]-a[4]*a[1]*a[10]+a[4]*a[2]*a[9]+a[8]*a[1]*a[6]-a[8]*a[2]*a[5];
  let det=a[0]*b[0]+a[1]*b[4]+a[2]*b[8]+a[3]*b[12];det=det?1/det:0;for(let i=0;i<16;i++)o[i]=b[i]*det;return o;}
// Пирамида видимости: 6 плоскостей из матрицы вид·проекция; шар виден, если не целиком снаружи
function frustumOf(m,out){const P=out||[];const row=i=>[m[i],m[4+i],m[8+i],m[12+i]];const r0=row(0),r1=row(1),r2=row(2),r3=row(3);
  [[1,r0],[-1,r0],[1,r1],[-1,r1],[1,r2],[-1,r2]].forEach(([s,r],k)=>{const p=[r3[0]+s*r[0],r3[1]+s*r[1],r3[2]+s*r[2],r3[3]+s*r[3]],l=Math.hypot(p[0],p[1],p[2])||1;P[k]=[p[0]/l,p[1]/l,p[2]/l,p[3]/l];});return P;}
function inFrustum(P,c,r){for(let k=0;k<6;k++){const p=P[k];if(p[0]*c[0]+p[1]*c[1]+p[2]*c[2]+p[3]<-r)return false;}return true;}
const v3n=v=>{const l=Math.hypot(v[0],v[1],v[2])||1;return [v[0]/l,v[1]/l,v[2]/l];};
const v3x=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const lin=c=>{const v=hex2rgb(c);return [Math.pow(v[0]/255,2.2),Math.pow(v[1]/255,2.2),Math.pow(v[2]/255,2.2)];};
/* ---------- материалы: блеск, гладкость, металл, отражение неба (−1 листва, −3 вода) ---------- */
const MID={matte:0,paint:1,metal:2,glass:3,skin:4,wall:5,roof:6,wood:7,cloth:8,leather:9,leaf:10,stone:11,bark:12,water:13,tyre:14,glow:15};
const MPAR=new Float32Array([.03,6,0,0, .6,70,0,.28, 1,36,1,.5, 1,110,0,.85, .1,10,0,0, .03,6,0,0, .12,14,0,0, .1,14,0,0, .02,4,0,0, .3,24,0,.05, .04,8,0,-1, .05,8,0,0, .03,6,0,0, 1,160,0,-3, .14,12,0,0, 0,1,0,-4]);
/* ---------- шейдеры ---------- */
const G3LIB=`
uniform vec3 u_sun,u_sunC,u_skyC,u_gndC,u_hzC,u_zeC,u_fogS,u_cam;uniform float u_fogD,u_exp,u_time,u_vig;uniform vec2 u_res;
vec3 skyCol(vec3 d){float h=d.y;return h<0.?mix(u_hzC,u_gndC*.9,clamp(-h*3.,0.,1.)):mix(u_hzC,u_zeC,pow(clamp(h,0.,1.),.4));}
vec3 tone(vec3 c){c*=u_exp;c=clamp((c*(2.51*c+.03))/(c*(2.43*c+.59)+.14),0.,1.);c=pow(c,vec3(1./2.2));
  vec2 q=gl_FragCoord.xy/u_res-.5;return c*(1.-u_vig*dot(q,q)*1.3);}
vec3 fogIt(vec3 c,vec3 V,float d){float f=1.-exp(-d*d*u_fogD*u_fogD);vec3 fc=mix(u_hzC,u_fogS,pow(max(dot(-V,u_sun),0.),6.));return mix(c,fc,f);}
`;
const G3VS=`
in vec3 a_pos;in vec4 a_nrm;in vec4 a_col;in vec4 a_ext;
#ifdef UV
in vec2 a_uv;out vec2 v_uv;
#endif
uniform mat4 u_vp,u_model,u_shm;uniform float u_time;uniform vec4 u_mat[16];
#ifdef CAR
uniform vec4 u_wc[6];uniform vec4 u_wr;uniform vec4 u_body;
#endif
out vec3 v_wp;out vec3 v_n;out vec4 v_col;flat out vec4 v_m;out vec4 v_sp;flat out float v_lamp;
void main(){
  vec3 p=a_pos,n=a_nrm.xyz;
#ifdef CAR
  int w=int(a_ext.x+.5);
  if(w>0){vec4 c=u_wc[w-1];vec3 q=p-c.xyz;float an=u_wr.x/abs(c.w),cs=cos(an),sn=sin(an);
    q=vec3(q.x,q.y*cs-q.z*sn,q.y*sn+q.z*cs);n=vec3(n.x,n.y*cs-n.z*sn,n.y*sn+n.z*cs);
    if(c.w<0.){float cd=cos(u_wr.y),sd=sin(u_wr.y);q=vec3(q.x*cd+q.z*sd,q.y,q.z*cd-q.x*sd);n=vec3(n.x*cd+n.z*sd,n.y,n.z*cd-n.x*sd);}
    p=q+c.xyz;}
  else{p.y-=u_body.w;float cp=cos(u_body.y),sp=sin(u_body.y),cr=cos(u_body.x),sr=sin(u_body.x);
    p=vec3(p.x,p.y*cp-p.z*sp,p.z*cp+p.y*sp);n=vec3(n.x,n.y*cp-n.z*sp,n.z*cp+n.y*sp);
    p=vec3(p.x*cr+p.y*sr,p.y*cr-p.x*sr,p.z);n=vec3(n.x*cr+n.y*sr,n.y*cr-n.x*sr,n.z);
    p.y+=u_body.w+u_body.z;
    if(u_wr.z>.5&&abs(a_ext.y-3.)<.5)p=vec3(0.,-50.,0.);}
#endif
  vec4 wp=u_model*vec4(p,1.);
  if(a_ext.z>0.){float s=a_ext.z/255.;wp.x+=s*.12*sin(u_time*1.7+wp.x*.31+wp.z*.23);wp.z+=s*.09*sin(u_time*1.3+wp.z*.27+wp.x*.11);}
  v_n=normalize(mat3(u_model)*n);v_wp=wp.xyz;v_col=a_col;v_lamp=a_ext.y;
#ifdef DECAL
  v_m=u_mat[0];
#else
  v_m=u_mat[int(a_col.w*255.+.5)];
#endif
  v_sp=u_shm*vec4(wp.xyz+v_n*.07,1.);
#ifdef UV
  v_uv=a_uv;
#endif
  gl_Position=u_vp*wp;}`;
const G3FS=`
in vec3 v_wp;in vec3 v_n;in vec4 v_col;flat in vec4 v_m;in vec4 v_sp;flat in float v_lamp;
#ifdef UV
in vec2 v_uv;uniform sampler2D u_tex;
#endif
#ifdef TERRAIN
uniform sampler2D u_cmap,u_det;uniform vec4 u_cm;uniform float u_rk;
#endif
uniform vec4 u_lamp;uniform vec3 u_hlP,u_hlD;uniform float u_hl;
uniform highp sampler2DShadow u_sh;uniform vec3 u_shI;
out vec4 o;
${G3LIB}
float shadowF(vec4 sp){if(u_shI.y<.5)return 1.;vec3 p=sp.xyz/sp.w*.5+.5;if(p.z>=1.)return 1.;vec2 e=min(p.xy,1.-p.xy);float f=smoothstep(0.,.07,min(e.x,e.y));if(f<=0.)return 1.;
  float t=u_shI.x,s=0.;p.z-=.0004;
  s+=texture(u_sh,vec3(p.xy+vec2(-.6,-.6)*t,p.z));s+=texture(u_sh,vec3(p.xy+vec2(.6,-.6)*t,p.z));s+=texture(u_sh,vec3(p.xy+vec2(-.6,.6)*t,p.z));s+=texture(u_sh,vec3(p.xy+vec2(.6,.6)*t,p.z));
  return mix(1.,s*.25,f);}
void main(){
  vec3 N=normalize(v_n),V=u_cam-v_wp;float dist=length(V);V/=dist;
  if(!gl_FrontFacing)N=-N;
  vec3 alb=pow(v_col.rgb,vec3(2.2));float alpha=1.;vec4 m=v_m;
#ifdef TERRAIN
  vec2 cu=(v_wp.xz-u_cm.xy)*u_cm.zw;alb=pow(texture(u_cmap,cu).rgb,vec3(2.2));float dt=texture(u_det,v_wp.xz*.31).r;
  // крутые склоны: сверху карта растягивается — рисуем пласты камня по высоте и боковую фактуру
  float stp=1.-smoothstep(.55,.85,N.y);if(stp>0.){float ds=texture(u_det,vec2(v_wp.x+v_wp.z,v_wp.y*1.6)*.12).r;dt=mix(dt,ds,stp);alb*=mix(1.,.86+.2*sin(v_wp.y*1.3+sin(v_wp.x*.05+v_wp.z*.04)*4.),stp*u_rk);}
  alb*=mix(.7+.6*dt,1.,smoothstep(30.,110.,dist)*(1.-stp*.6));
#endif
#ifdef UV
  vec4 tx=texture(u_tex,v_uv);alb*=pow(tx.rgb,vec3(2.2));alpha=tx.a;
#endif
#ifdef ROAD
  alpha*=smoothstep(0.,.05,v_uv.x)*(1.-smoothstep(.95,1.,v_uv.x));
#endif
#ifdef DECAL
  alpha=v_col.a;
#endif
  float sh=shadowF(v_sp);
  if(m.w<-2.5&&m.w>-3.5){float t=u_time;vec3 wn=normalize(vec3(sin(v_wp.x*.9+t*1.3)*.05+sin(v_wp.z*1.7-t*1.1)*.04,1.,cos(v_wp.z*.8+t)*.05+sin(v_wp.x*1.9+t*1.7)*.03));N=wn;}
  float nl=dot(N,u_sun),dif=max(nl,0.);
  if(m.w<-.5&&m.w>-1.5){dif=max((nl+.55)/1.55,0.)*.9;dif+=pow(max(dot(-V,u_sun),0.),3.)*.35;}
  vec3 hemi=mix(u_gndC,u_skyC,N.y*.5+.5);
  vec3 col=alb*(u_sunC*dif*sh+hemi)*(1.-.62*m.z);
  if(m.x>0.){vec3 H=normalize(u_sun+V);float sp=pow(max(dot(N,H),0.),m.y)*m.x*(m.y+8.)*.035;col+=mix(vec3(1.),alb,m.z)*u_sunC*sp*sh*step(0.,nl);
    float ev=m.w<-2.5?.9:m.w;
    if(ev>0.){vec3 R=reflect(-V,N);float fr=m.z>.5?ev:ev*(.04+.96*pow(1.-max(dot(N,V),0.),5.));vec3 ec=skyCol(R)*mix(vec3(1.),alb*1.7,m.z);col=mix(col,ec,clamp(fr,0.,1.));}}
  if(u_hl>0.){vec3 Lh=u_hlP-v_wp;float dh=length(Lh);Lh/=dh;float spot=smoothstep(.8,.95,dot(-Lh,u_hlD))*u_hl/(1.+dh*dh*.0025);col+=alb*vec3(1.,.85,.6)*spot*max(dot(N,Lh),0.)*4.;}
  if(v_lamp>.5){if(v_lamp<1.5)col+=vec3(1.,.07,.03)*(u_lamp.x*4.+u_lamp.y*1.2);else if(v_lamp<2.5)col+=vec3(1.,.88,.6)*u_lamp.y*4.;else if(v_lamp>4.5)col+=vec3(1.,.78,.42)*u_lamp.z*3.;}
  if(m.w<-3.5)col=alb*2.;
  col=fogIt(col,V,dist);
  o=vec4(tone(col),alpha);}`;
// Тени: та же форма (колёса, крен кузова, ветер), только глубина
const G3FS_DEPTH=`out vec4 o;void main(){o=vec4(1.);}`;
// Небо: градиент, солнце, облака и дальние горы по направлению взгляда
const G3VS_SKY=`in vec3 a_pos;out vec2 v_p;void main(){v_p=a_pos.xy;gl_Position=vec4(a_pos.xy,1.,1.);}`;
const G3FS_SKY=`in vec2 v_p;uniform mat4 u_ivp;uniform sampler2D u_pan,u_cld;uniform vec4 u_panR;uniform float u_night;out vec4 o;
${G3LIB}
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
void main(){vec4 w=u_ivp*vec4(v_p,1.,1.);vec3 d=normalize(w.xyz/w.w-u_cam);
  vec3 c=skyCol(d);float sd=max(dot(d,u_sun),0.);
  c+=u_sunC*(smoothstep(.99965,.99985,sd)*9.*(1.-u_night*.7)+pow(sd,14.)*.22+pow(sd,300.)*.6);
  float az=atan(d.x,d.z)*.159155+.5,el=asin(clamp(d.y,-1.,1.));
  if(u_night>.01&&d.y>0.){vec2 g=vec2(az*900.,el*300.);float st=step(.9965,h21(floor(g)));c+=vec3(st)*u_night*(.6+.4*sin(u_time*3.+g.x));}
  float cv=1.-(el-.015)/.5;if(cv>0.&&cv<1.){vec4 cl=texture(u_cld,vec2(az*2.,cv));vec3 cc=mix(u_hzC,u_zeC,.2)*.35+u_sunC*.28+u_skyC*.3;c=mix(c,pow(cl.rgb,vec3(2.2))*cc*2.2,cl.a*.9);}
  float mv=1.-(el-u_panR.x)/u_panR.y;if(mv>0.&&mv<1.){vec4 mt=texture(u_pan,vec2(az*u_panR.z,mv));vec3 mc=pow(mt.rgb,vec3(2.2))*(u_skyC*1.1+u_sunC*.45);c=mix(c,mix(mc,u_hzC,.35),mt.a);}
  c=mix(c,mix(u_hzC,u_fogS,pow(max(dot(d,u_sun),0.),6.)),exp(-max(d.y,0.)*40.)*.35);
  o=vec4(tone(c),1.);}`;
// Зрители и люди у дороги: плоские фигуры, всегда повёрнутые к камере; два кадра — машут руками
const G3VS_BILL=`in vec3 a_pos;in vec4 i_a;in vec4 i_b;in vec4 i_c;uniform mat4 u_vp;uniform vec3 u_camR;uniform float u_time;out vec2 v_uv;out vec3 v_wp;flat out float v_l;
void main(){vec3 wp=i_a.xyz+u_camR*a_pos.x*i_a.w+vec3(0.,a_pos.y*i_b.x,0.);float fr=i_c.y>0.?floor(mod(u_time*2.6+i_a.x*.37+i_a.z*.29,2.)):0.;
  v_uv=vec2(i_b.y+(a_pos.x+.5)*i_b.w+fr*i_b.w,i_b.z+(1.-a_pos.y)*i_c.x);v_wp=wp;v_l=i_c.z;gl_Position=u_vp*vec4(wp,1.);}`;
const G3FS_BILL=`in vec2 v_uv;in vec3 v_wp;flat in float v_l;uniform sampler2D u_tex;uniform float u_bl;out vec4 o;
${G3LIB}
void main(){vec4 t=texture(u_tex,v_uv);if(t.a<.35)discard;vec3 c=pow(t.rgb/max(t.a,.001),vec3(2.2))*u_bl*(v_l>0.?v_l:1.);vec3 V=u_cam-v_wp;float d=length(V);o=vec4(tone(fogIt(c,V/d,d)),t.a);}`;
// Пыль, дым, пар: мягкие клубы (заранее умноженная прозрачность)
const G3VS_PART=`in vec3 a_pos;in vec4 i_a;in vec4 i_b;uniform mat4 u_vp;uniform vec3 u_camR,u_camU;out vec2 v_q;out vec4 v_c;out vec3 v_wp;
void main(){vec3 wp=i_a.xyz+(u_camR*a_pos.x+u_camU*a_pos.y)*i_a.w;v_q=a_pos.xy+.5;v_c=i_b;v_wp=wp;gl_Position=u_vp*vec4(wp,1.);}`;
const G3FS_PART=`in vec2 v_q;in vec4 v_c;in vec3 v_wp;uniform sampler2D u_tex;out vec4 o;
${G3LIB}
void main(){float a=texture(u_tex,v_q).a*v_c.a;if(a<.004)discard;vec3 V=u_cam-v_wp;float d=length(V);vec3 c=tone(fogIt(pow(v_c.rgb,vec3(2.2)),V/d,d));o=vec4(c*a,a);}`;
/* ---------- инициализация ---------- */
function g3Prog(vs,fs,defs){const gl=G3.gl,hd='#version 300 es\nprecision highp float;precision highp int;\n'+(defs||[]).map(d=>'#define '+d+'\n').join('');
  const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,hd+s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS)){const e=gl.getShaderInfoLog(o);throw new Error('shader: '+e+' ['+(defs||[]).join(',')+']');}return o;};
  const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,vs));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,fs));
  ['a_pos','a_nrm','a_col','a_ext','a_uv','i_a','i_b','i_c'].forEach((n,i)=>gl.bindAttribLocation(p,i,n));
  gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error('link: '+gl.getProgramInfoLog(p));
  const u={},n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);for(let i=0;i<n;i++){const a=gl.getActiveUniform(p,i),k=a.name.replace(/\[0\]$/,'');u[k]=gl.getUniformLocation(p,a.name);}
  return {p,u,f:-1};}
function g3Init(cv){
  if(G3.gl&&G3.cv===cv&&!G3.gl.isContextLost())return true;
  const gl=cv.getContext('webgl2',{antialias:true,alpha:false,depth:true,stencil:false,premultipliedAlpha:true,preserveDrawingBuffer:false,powerPreference:'high-performance'});
  if(!gl||gl.isContextLost())return false;G3.gl=gl;G3.cv=cv;G3.lost=false;G3.cache={};
  // телефон может отобрать видеокарту (приложение свернули): эта гонка дорисуется по-простому, следующая снова в 3D
  if(!cv.dataset.g3){cv.dataset.g3=1;cv.addEventListener('webglcontextlost',e=>{e.preventDefault();G3.lost=true;G3.gl=null;},false);cv.addEventListener('webglcontextrestored',()=>{G3.lost=false;G3.gl=null;},false);}
  G3.an=gl.getExtension('EXT_texture_filter_anisotropic');G3.anMax=G3.an?Math.min(8,gl.getParameter(G3.an.MAX_TEXTURE_MAX_ANISOTROPY_EXT)):1;
  const lit=G3VS,fs=G3FS;
  G3.P={lit:g3Prog(lit,fs,[]),car:g3Prog(lit,fs,['CAR']),road:g3Prog(lit,fs,['UV','ROAD']),tex:g3Prog(lit,fs,['UV']),terr:g3Prog(lit,fs,['TERRAIN']),decal:g3Prog(lit,fs,['DECAL']),
    dLit:g3Prog(lit,G3FS_DEPTH,[]),dCar:g3Prog(lit,G3FS_DEPTH,['CAR']),sky:g3Prog(G3VS_SKY,G3FS_SKY,[]),bill:g3Prog(G3VS_BILL,G3FS_BILL,[]),part:g3Prog(G3VS_PART,G3FS_PART,[])};
  // тень солнца: текстура глубины со сравнением (сглаженная выборка «из коробки»)
  const S=G3.shS=Math.min(2048,(window.devicePixelRatio||1)<=1.5&&!/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)?2048:1024);
  const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texStorage2D(gl.TEXTURE_2D,1,gl.DEPTH_COMPONENT24,S,S);
  [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE],[gl.TEXTURE_COMPARE_MODE,gl.COMPARE_REF_TO_TEXTURE],[gl.TEXTURE_COMPARE_FUNC,gl.LEQUAL]].forEach(([k,v])=>gl.texParameteri(gl.TEXTURE_2D,k,v));
  const fb=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,t,0);gl.drawBuffers([gl.NONE]);gl.readBuffer(gl.NONE);
  const okFB=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;gl.bindFramebuffer(gl.FRAMEBUFFER,null);
  G3.sh=okFB?t:null;G3.shFB=okFB?fb:null;
  // пустая текстура тени, если своей нет (сэмплер сравнения должен на что-то указывать)
  if(!okFB){const t2=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t2);gl.texStorage2D(gl.TEXTURE_2D,1,gl.DEPTH_COMPONENT16,1,1);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_COMPARE_MODE,gl.COMPARE_REF_TO_TEXTURE);G3.sh=t2;}
  // квадрат для частиц и людей, треугольник на весь экран для неба
  G3.quad=g3Raw(new Float32Array([-.5,0,0, .5,0,0, .5,1,0, -.5,0,0, .5,1,0, -.5,1,0]));
  G3.quadC=g3Raw(new Float32Array([-.5,-.5,0, .5,-.5,0, .5,.5,0, -.5,-.5,0, .5,.5,0, -.5,.5,0]));
  G3.full=g3Raw(new Float32Array([-1,-1,0, 3,-1,0, -1,3,0]));
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.frontFace(gl.CW);gl.disable(gl.CULL_FACE);
  return true;
}
// Простой буфер позиций (для неба, частиц, людей)
function g3Raw(arr){const gl=G3.gl,vao=gl.createVertexArray(),b=gl.createBuffer();gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,arr,gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,12,0);gl.bindVertexArray(null);return {vao,b,n:arr.length/3};}
/* ---------- сборщик сетки: вершина = позиция, нормаль, цвет + материал, доп. (колесо, лампа, ветер) [+ uv] ---------- */
class MB{
  constructor(uv){this.uvOn=!!uv;this.st=uv?32:24;this.cap=1024;this.ab=new ArrayBuffer(this.cap*this.st);this.bind();this.n=0;this.ix=[];this.X=null;this.bb=[1e9,1e9,1e9,-1e9,-1e9,-1e9];this.e=[0,0,0,0];}
  bind(){this.f=new Float32Array(this.ab);this.b=new Int8Array(this.ab);this.u=new Uint8Array(this.ab);}
  grow(k){if(this.n+k<=this.cap)return;while(this.n+k>this.cap)this.cap*=2;const a=new ArrayBuffer(this.cap*this.st);new Uint8Array(a).set(new Uint8Array(this.ab));this.ab=a;this.bind();}
  // X — перенос модели: {r:[3×3 по строкам], s, t:[x,y,z]}
  v(x,y,z,nx,ny,nz,c,m,u,w){this.grow(1);const X=this.X;
    if(X){const r=X.r,s=X.s;const px=(r[0]*x+r[1]*y+r[2]*z)*s+X.t[0],py=(r[3]*x+r[4]*y+r[5]*z)*s+X.t[1],pz=(r[6]*x+r[7]*y+r[8]*z)*s+X.t[2];
      const qx=r[0]*nx+r[1]*ny+r[2]*nz,qy=r[3]*nx+r[4]*ny+r[5]*nz,qz=r[6]*nx+r[7]*ny+r[8]*nz;x=px;y=py;z=pz;nx=qx;ny=qy;nz=qz;}
    const o=this.n*this.st,fo=o>>2;this.f[fo]=x;this.f[fo+1]=y;this.f[fo+2]=z;
    const l=Math.hypot(nx,ny,nz)||1;this.b[o+12]=Math.round(nx/l*127);this.b[o+13]=Math.round(ny/l*127);this.b[o+14]=Math.round(nz/l*127);this.b[o+15]=0;
    this.u[o+16]=c[0];this.u[o+17]=c[1];this.u[o+18]=c[2];this.u[o+19]=m;const e=this.e;this.u[o+20]=e[0];this.u[o+21]=e[1];this.u[o+22]=e[2];this.u[o+23]=e[3];
    if(this.uvOn){this.f[fo+6]=u||0;this.f[fo+7]=w||0;}
    const bb=this.bb;if(x<bb[0])bb[0]=x;if(y<bb[1])bb[1]=y;if(z<bb[2])bb[2]=z;if(x>bb[3])bb[3]=x;if(y>bb[4])bb[4]=y;if(z>bb[5])bb[5]=z;return this.n++;}
  tri(a,b,c){this.ix.push(a,b,c);}
  // Выпуклый многоугольник с нормалью n: обход подгоняется под нормаль, чтобы лицевая сторона смотрела наружу
  poly(P,n,c,m,uv){const k=P.length;if(k<3)return;const g=newell(P);let rev=g[0]*n[0]+g[1]*n[1]+g[2]*n[2]<0;const i0=this.n;
    for(let i=0;i<k;i++){const q=P[rev?k-1-i:i],t=uv&&uv[rev?k-1-i:i];this.v(q[0],q[1],q[2],n[0],n[1],n[2],c,m,t&&t[0],t&&t[1]);}
    for(let i=1;i<k-1;i++)this.tri(i0,i0+i,i0+i+1);}
  quad(a,b,c,d,n,col,m){this.poly([a,b,c,d],n,col,m);}
  // Линия-ленточка на грани (спица, рамка окна): лежит в плоскости грани с нормалью n
  strip(a,b,w,n,c,m,lift){const d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],s=v3n(v3x(n,d)),h=w/2,L=lift||0.004,o=[n[0]*L,n[1]*L,n[2]*L];
    const P=[[a[0]+s[0]*h+o[0],a[1]+s[1]*h+o[1],a[2]+s[2]*h+o[2]],[b[0]+s[0]*h+o[0],b[1]+s[1]*h+o[1],b[2]+s[2]*h+o[2]],[b[0]-s[0]*h+o[0],b[1]-s[1]*h+o[1],b[2]-s[2]*h+o[2]],[a[0]-s[0]*h+o[0],a[1]-s[1]*h+o[1],a[2]-s[2]*h+o[2]]];
    this.poly(P,n,c,m);}
  // Тонкий брусок в пространстве (обод и спицы руля, колонка)
  rod(a,b,w,c,m){const d=v3n([b[0]-a[0],b[1]-a[1],b[2]-a[2]]),up=Math.abs(d[1])>0.9?[1,0,0]:[0,1,0],s=v3n(v3x(up,d)),t=v3x(d,s),h=w/2;
    const C=(p,i,j)=>[p[0]+(s[0]*i+t[0]*j)*h,p[1]+(s[1]*i+t[1]*j)*h,p[2]+(s[2]*i+t[2]*j)*h];
    [[1,1,1,-1],[1,-1,-1,-1],[-1,-1,-1,1],[-1,1,1,1]].forEach(([i1,j1,i2,j2])=>{const nn=v3n([s[0]*(i1+i2)+t[0]*(j1+j2),s[1]*(i1+i2)+t[1]*(j1+j2),s[2]*(i1+i2)+t[2]*(j1+j2)]);this.poly([C(a,i1,j1),C(b,i1,j1),C(b,i2,j2),C(a,i2,j2)],nn,c,m);});}
  // Добавить готовую заготовку (сетку-прототип) с переносом X
  add(P,X){const k=P.n;if(!k)return;this.grow(k);const i0=this.n,st=this.st,sf=P.f,sb=P.b,su=P.u;
    const r=X.r,s=X.s,t=X.t,bb=this.bb,e=this.e;
    for(let i=0;i<k;i++){const o=i*P.st,fo=o>>2,x=sf[fo],y=sf[fo+1],z=sf[fo+2],nx=sb[o+12],ny=sb[o+13],nz=sb[o+14];
      const px=(r[0]*x+r[1]*y+r[2]*z)*s+t[0],py=(r[3]*x+r[4]*y+r[5]*z)*s+t[1],pz=(r[6]*x+r[7]*y+r[8]*z)*s+t[2];
      const d=(i0+i)*st,df=d>>2;this.f[df]=px;this.f[df+1]=py;this.f[df+2]=pz;
      this.b[d+12]=cl127(r[0]*nx+r[1]*ny+r[2]*nz);this.b[d+13]=cl127(r[3]*nx+r[4]*ny+r[5]*nz);this.b[d+14]=cl127(r[6]*nx+r[7]*ny+r[8]*nz);this.b[d+15]=0;
      this.u[d+16]=su[o+16];this.u[d+17]=su[o+17];this.u[d+18]=su[o+18];this.u[d+19]=su[o+19];
      this.u[d+20]=su[o+20]||e[0];this.u[d+21]=su[o+21]||e[1];this.u[d+22]=su[o+22]||e[2];this.u[d+23]=su[o+23]||e[3];
      if(this.uvOn){this.f[df+6]=P.uvOn?sf[fo+6]:0;this.f[df+7]=P.uvOn?sf[fo+7]:0;}
      if(px<bb[0])bb[0]=px;if(py<bb[1])bb[1]=py;if(pz<bb[2])bb[2]=pz;if(px>bb[3])bb[3]=px;if(py>bb[4])bb[4]=py;if(pz>bb[5])bb[5]=pz;}
    this.n+=k;const ix=P.ix;for(let i=0;i<ix.length;i++)this.ix.push(ix[i]+i0);}
  sphere(){const b=this.bb;return {c:[(b[0]+b[3])/2,(b[1]+b[4])/2,(b[2]+b[5])/2],r:Math.hypot(b[3]-b[0],b[4]-b[1],b[5]-b[2])/2};}
}
const cl127=v=>v>127?127:v<-127?-127:Math.round(v);
// Поворот вокруг вертикали на угол a (для X в MB): модель +x → (cos a, −sin a), +z → (sin a, cos a)
function X3(a,s,t){const c=Math.cos(a),n=Math.sin(a);return {r:[c,0,n, 0,1,0, -n,0,c],s:s||1,t};}
// Загрузка сетки на видеокарту
function g3Mesh(mb,dyn){const gl=G3.gl;if(!mb.n)return null;const vao=gl.createVertexArray(),vb=gl.createBuffer(),ib=gl.createBuffer();gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,new Uint8Array(mb.ab,0,mb.n*mb.st),dyn?gl.DYNAMIC_DRAW:gl.STATIC_DRAW);g3Attrs(mb.st,mb.uvOn);
  const big=mb.n>65535,ix=big?new Uint32Array(mb.ix):new Uint16Array(mb.ix);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,ix,gl.STATIC_DRAW);
  gl.bindVertexArray(null);const s=mb.sphere();return {vao,vb,ib,cnt:mb.ix.length,type:big?gl.UNSIGNED_INT:gl.UNSIGNED_SHORT,c:s.c,r:s.r,tri:mb.ix.length/3};}
function g3Attrs(st,uv){const gl=G3.gl;gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,st,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,4,gl.BYTE,true,st,12);
  gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,4,gl.UNSIGNED_BYTE,true,st,16);gl.enableVertexAttribArray(3);gl.vertexAttribPointer(3,4,gl.UNSIGNED_BYTE,false,st,20);
  if(uv){gl.enableVertexAttribArray(4);gl.vertexAttribPointer(4,2,gl.FLOAT,false,st,24);}}
function g3Free(m){if(!m||!G3.gl)return;const gl=G3.gl;gl.deleteVertexArray(m.vao);gl.deleteBuffer(m.vb);gl.deleteBuffer(m.ib);}
function g3Draw(m){if(!m)return;const gl=G3.gl;gl.bindVertexArray(m.vao);gl.drawElements(gl.TRIANGLES,m.cnt,m.type,0);G3.dc++;G3.tri+=m.tri;}
// Текстура из холста: мипмапы и анизотропия — дорога чёткая и вдали
function g3Tex(cv,o){o=o||{};const gl=G3.gl,t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!!o.pre);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cv);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,o.cs?gl.CLAMP_TO_EDGE:gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,o.ct?gl.CLAMP_TO_EDGE:gl.REPEAT);
  if(o.mip!==false){gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);if(G3.an&&o.aniso!==false)gl.texParameterf(gl.TEXTURE_2D,G3.an.TEXTURE_MAX_ANISOTROPY_EXT,G3.anMax);}
  else gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);return t;}
// Буфер экземпляров (люди, частицы): i_a, i_b[, i_c] по 4 числа
function g3Inst(nMax,k,quad){const gl=G3.gl,vao=gl.createVertexArray(),b=gl.createBuffer();gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,quad.b);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,12,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,nMax*k*16,gl.DYNAMIC_DRAW);for(let i=0;i<k;i++){gl.enableVertexAttribArray(5+i);gl.vertexAttribPointer(5+i,4,gl.FLOAT,false,k*16,i*16);gl.vertexAttribDivisor(5+i,1);}
  gl.bindVertexArray(null);return {vao,b,k,max:nMax,data:new Float32Array(nMax*k*4),n:0,q:quad};}
function g3InstFree(I){if(!I||!G3.gl)return;G3.gl.deleteVertexArray(I.vao);G3.gl.deleteBuffer(I.b);}
function g3InstDraw(I,n){if(!n)return;const gl=G3.gl;gl.bindVertexArray(I.vao);gl.bindBuffer(gl.ARRAY_BUFFER,I.b);gl.bufferSubData(gl.ARRAY_BUFFER,0,I.data,0,n*I.k*4);gl.drawArraysInstanced(gl.TRIANGLES,0,6,n);G3.dc++;G3.tri+=n*2;}
