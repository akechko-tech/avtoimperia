/* ================= 0.19: живой звук машин — моторы по числу цилиндров, шины по покрытию =================
   Звук считается в отдельном потоке (AudioWorklet): для каждого цилиндра — вспышка в свой момент оборота,
   выхлопная труба как резонатор (волна бежит по трубе и отражается от среза), глушитель, всасывание,
   стук клапанов, вой нагнетателя, цепь привода; пар — «чух-чух» и гул горелки; электромотор — вой.
   Дорога: шорох протектора, дробь брусчатки и кирпича, гул досок трека, хруст щебня, визг и шипение шин.
   Нет AudioWorklet (старые браузеры) — играет прежний простой звук. */
function avtEngineWorklet(){
  const TAU=Math.PI*2,SR=sampleRate;
  let seed=22222;const nz=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2147483648-1;},rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const opc=fc=>1-Math.exp(-TAU*Math.min(fc,SR*0.45)/SR);
  // двухполюсные фильтры (RBJ): полоса и нижние частоты
  const bq=()=>({b0:0,b1:0,b2:0,a1:0,a2:0,x1:0,x2:0,y1:0,y2:0});
  function bpSet(f,fc,Q){const w=TAU*Math.min(fc,SR*0.45)/SR,al=Math.sin(w)/(2*Q),a0=1+al;f.b0=al/a0;f.b1=0;f.b2=-al/a0;f.a1=-2*Math.cos(w)/a0;f.a2=(1-al)/a0;return f;}
  function lpSet(f,fc,Q){const w=TAU*Math.min(fc,SR*0.45)/SR,al=Math.sin(w)/(2*Q),c=Math.cos(w),a0=1+al;f.b0=(1-c)/2/a0;f.b1=(1-c)/a0;f.b2=(1-c)/2/a0;f.a1=-2*c/a0;f.a2=(1-al)/a0;return f;}
  function run(f,x){const y=f.b0*x+f.b1*f.x1+f.b2*f.x2-f.a1*f.y1-f.a2*f.y2;f.x2=f.x1;f.x1=x;f.y2=f.y1;f.y1=y;return y;}
  function mkVoice(p){
    const nb=p.nb||1,v={p,ph:rnd(),nx:0,n:p.fire.length,jit:new Float32Array(p.fire.length),rpm:p.idle,rT:p.idle,ld:0,lT:0,g:0,gT:0,pan:0,pT:0,lpf:12000,lpT:12000,spd:0,
      pa:new Float32Array(2),pb:new Float32Array(2),pr:new Float32Array(2),en:new Float32Array(2),nl:0,nm:0,mf2:bpSet(bq(),1500,0.7),dl:[],di:[0,0],ls:new Float32Array(2),yp:new Float32Array(2),dc:0,dcx:0,
      muf:lpSet(bq(),p.muff||900,0.85),m1:bpSet(bq(),(p.blk||1)*420,7),m2:bpSet(bq(),(p.blk||1)*980,9),m3:bpSet(bq(),(p.blk||1)*1900,10),kick:0,top:lpSet(bq(),p.open>0.5?5000:3800,0.7),inBP:bpSet(bq(),420,1.6),tkBP:bpSet(bq(),3600,1.8),chBP:bpSet(bq(),2600,2),burn:bpSet(bq(),170,0.9),
      th:0,et:0,tk1:-1,tk2:-1,gph:0,sph:0,scA:0,cph:0,ec:0,ol:0,orr:0,mph:0,dead:false,fade:1,popT:0};
    for(let b=0;b<nb;b++){const L=(p.pipe&&p.pipe[b])||p.pipe[0]||1.2;v.dl.push(new Float32Array(Math.max(8,Math.round(SR*2*L/343))));}
    newCycle(v);return v;}
  function newCycle(v){const p=v.p,n=v.n,j=(p.jit||0.012)*Math.min(1,2.5/n);for(let k=0;k<n;k++){const f=p.fire[k],t=Math.min(0.999,Math.max(0,f+(k?nz()*j:Math.abs(nz())*j*0.5)));v.jit[k]=t-f;}}
  function fire(v,k){const p=v.p,rf=v.rpm/p.max;
    let A=p.amp[k]*(1+nz()*(p.rough||0.08));
    const idleLd=v.rpm<p.idle*1.35?0.28:0,L=0.07+0.93*Math.pow(Math.max(v.ld,idleLd),0.85);A*=L;
    if(p.hm&&v.ld<0.15&&v.rpm<p.idle*1.5&&rnd()<0.5)A*=0.04;        // «тук… тук-тук»: регулятор пропускает вспышки на холостых
    if(p.mis&&rnd()<p.mis*(1.2-rf))A*=0.08;                          // пропуск зажигания у старых моторов
    const b=p.bank?p.bank[k]:0;
    if(v.ld<0.06&&rf>0.45&&p.pop&&rnd()<p.pop){v.en[b]+=2.4;v.pa[b]+=1.2;}   // хлопок в трубе на сбросе газа
    v.pa[b]+=A;v.pr[b]+=A;v.en[b]+=A*(p.noise||0.5)*(0.5+0.5*v.ld);v.kick+=A*(0.6+0.4*v.ld);
    // клапаны: два щелчка между вспышками
    const si=1/(v.n*Math.max(1e-6,v.dph));v.tk1=Math.floor(si*0.3);v.tk2=Math.floor(si*0.62);}
  function voiceBlock(v,oL,oR,N){
    const p=v.p,kind=p.kind||'ic',nb=p.nb||1,elec=kind==='elec',steam=kind==='steam';
    // медленные величины — раз в блок
    const kr=1-Math.exp(-N/(SR*0.045)),kl=1-Math.exp(-N/(SR*0.03)),kg=1-Math.exp(-N/(SR*0.06));
    const r0=v.rpm,l0=v.ld,g0=v.g*v.fade;v.rpm+=(v.rT-v.rpm)*kr;v.ld+=(v.lT-v.ld)*kl;v.g+=(v.gT-v.g)*kg;v.pan+=(v.pT-v.pan)*kg;v.lpf+=(v.lpT-v.lpf)*kg;
    if(v.dead){v.fade*=Math.exp(-N/(SR*0.12));}
    const g1=v.g*v.fade,rpm=v.rpm,rf=rpm/p.max,ld=v.ld;
    const dph=rpm/60/SR/(p.cyc||2);v.dph=dph;
    // выхлопной импульс длится ~25° поворота вала: на низких оборотах — широкий «бух», на высоких — узкий, сливаются в вой
    // импульс: резкий фронт (открылся выпускной клапан) и спад ~12° поворота вала; шум истечения газов — чуть дольше
    const tau=Math.min(0.0042,Math.max(0.00035,(p.tau||2.4)/2.4*12/(6*Math.max(rpm,120)))),dp=Math.exp(-1/(SR*tau)),dr=Math.exp(-1/(SR*0.00022)),dn=Math.exp(-1/(SR*(steam?0.028:tau*1.8)));
    const cLP=opc(p.loss||2200),refl=p.refl===undefined?-0.74:p.refl,open=p.open||0,cTh=opc(95),cOut=opc(v.lpf),det=Math.exp(-1/(SR*0.00035)),dec=Math.exp(-1/(SR*0.0006)),cN=opc(steam?2500:3200),cDC=opc(55),mech=(p.mech||0.035)*(0.4+0.6*Math.min(1.2,rf))*(steam||elec?0.3:1);
    bpSet(v.inBP,300+520*Math.min(1.2,rf),1.5);
    const intake=(p.intake||0.12)*ld*(0.2+0.8*Math.min(1,rf)),valve=(p.valve||0.1)*(0.35+0.65*Math.min(1,rf)),gw=(p.gearW||0)*rf*rf*(0.3+0.7*ld),gf=rpm/60*(p.gearT||19)/SR;
    const scT=p.sc===2?(ld>0.92?1:0):p.sc?0.35+0.65*ld:0,sf=rpm/60*(p.scR||1.3)*4/SR,scG=0.13*Math.pow(Math.min(1.1,rf),1.5);
    const chR=(p.chain||0)>0?v.spd/0.032/SR:0,chA=(p.chain||0)*Math.min(1,v.spd/25);
    const cph=Math.PI/4*(v.pan+1),gl=Math.cos(cph),gr=Math.sin(cph),mf=rpm/60*(p.comm||22)/SR,lvl=p.lvl||1,blk=(p.blkA||0.55)*(steam||elec?0:1);
    for(let i=0;i<N;i++){
      let out=0;
      if(!elec&&rpm>1){
        v.ph+=dph;if(v.ph>=1){v.ph-=1;v.nx=0;newCycle(v);}
        while(v.nx<v.n&&v.ph>=p.fire[v.nx]+v.jit[v.nx]){fire(v,v.nx);v.nx++;}
        if(v.tk1>=0&&v.tk1--===0)v.et+=valve;if(v.tk2>=0&&v.tk2--===0)v.et+=valve*0.8;
      }
      let ex=0,e1s=0;v.nl+=(nz()-v.nl)*cN;const nn=v.nl*1.4;
      for(let b=0;b<nb;b++){
        // импульс давления: вспышка «накачивает» первый каскад, второй даёт плавный горб (t·e^(−t/τ))
        v.pa[b]*=dp;v.pr[b]*=dr;v.en[b]*=dn;const pu=v.pa[b]-v.pr[b];e1s+=v.pa[b];
        const src=pu*(steam?0.2:1)+v.en[b]*nn*(steam?1.6:0.9);
        const buf=v.dl[b],D=buf.length,j=v.di[b],yd=buf[j];v.ls[b]+=(yd-v.ls[b])*cLP;
        const y=src+refl*v.ls[b];buf[j]=y;v.di[b]=j+1===D?0:j+1;
        ex+=y-0.965*v.yp[b];v.yp[b]=y;}
      const m=run(v.muf,ex),t=run(v.top,ex);
      out=t*open+m*(1-open)*1.6;
      v.th+=(e1s-v.th)*cTh;out+=v.th*(p.thump||0.5)*0.35;
      // механика: клапаны, шестерни, цепь ГРМ — шум по всему спектру, чуть пульсирует со вспышками
      out+=run(v.mf2,nz())*mech*(0.7+0.6*Math.min(1.5,e1s));
      // блок цилиндров звенит от каждой вспышки: «рык» и металл старого мотора
      if(v.kick!==0||v.m1.y1!==0){const k=v.kick;v.kick=0;out+=(run(v.m1,k)*1.9+run(v.m2,k)*1.2+run(v.m3,k)*0.6)*blk;}
      if(intake>0.001)out+=run(v.inBP,nz())*(0.25+0.75*Math.min(2,e1s*3))*intake;
      if(v.et>1e-4){out+=run(v.tkBP,nz())*v.et;v.et*=det;}
      if(gw>0.0005){v.gph+=gf;if(v.gph>1)v.gph-=1;out+=Math.sin(TAU*v.gph)*gw;}
      if(p.sc){v.scA+=(scT-v.scA)*(scT>v.scA?0.00012:0.00004);if(v.scA>0.01){v.sph+=sf;if(v.sph>1)v.sph-=1;const s=v.sph*TAU;out+=(Math.sin(s)+0.45*Math.sin(2*s)+0.22*Math.sin(3*s))*v.scA*scG;}}
      if(chR>0){v.cph+=chR;if(v.cph>1){v.cph-=1;v.ec+=chA*(0.5+0.5*rnd());}if(v.ec>1e-4){out+=run(v.chBP,nz())*v.ec;v.ec*=dec;}}
      if(steam)out+=run(v.burn,nz())*(p.burn||0.05)+nz()*0.004;
      if(elec){v.mph+=mf;if(v.mph>1)v.mph-=1;const s=v.mph*TAU,a=(0.25+0.75*ld)*Math.min(1,rf*1.4);out+=(Math.sin(s)*0.1+Math.sin(2*s)*0.04+Math.sin(s*0.37)*0.05)*a+nz()*0.012*rf;}
      // без постоянной составляющей; громкость, «даль» (срез верхов)
      v.dc+=(out-v.dc)*cDC;out=(out-v.dc)*g1*lvl;v.ol+=(out-v.ol)*cOut;
      oL[i]+=v.ol*gl;oR[i]+=v.ol*gr;}
  }
  /* ---------- дорога под колёсами ---------- */
  const SURF_S={// шорох: полоса, громкость; дробь: шаг (м) или случайные удары на метр, частота «звона», сила
    asphalt:{f:900,a:0.5},concrete:{f:1000,a:0.55,jt:7.5},brick:{f:700,a:0.38,sp:0.11,rf:230,rq:3,ra:0.3},pave:{f:600,a:0.34,sp:0.16,rf:150,rq:2.2,ra:0.55,rr:0.7},
    board:{f:820,a:0.3,sp:0.05,rf:330,rq:4,ra:0.34},macadam:{f:1300,a:0.45,po:16,rf:2700,rq:2,ra:0.22},dirt:{f:520,a:0.42,po:3,rf:900,rq:1.5,ra:0.2},
    mount:{f:1100,a:0.42,po:9,rf:1800,rq:2,ra:0.32},mud:{f:340,a:0.5,po:2,rf:380,rq:1.2,ra:0.35,slurp:1},mudhole:{f:320,a:0.6,po:4,rf:340,rq:1.1,ra:0.5,slurp:1},
    sand:{f:2600,a:0.36},beach:{f:2400,a:0.34},snow:{f:2200,a:0.3,po:28,rf:3200,rq:2,ra:0.13},grass:{f:1800,a:0.24,po:4,rf:700,rq:2,ra:0.28},
    field:{f:1500,a:0.28,po:5,rf:600,rq:1.6,ra:0.34},verge:{f:1400,a:0.3,po:6,rf:900,rq:1.8,ra:0.3},forest:{f:1600,a:0.26,po:6,rf:650,rq:1.6,ra:0.3},
    rock:{f:1200,a:0.32,po:7,rf:1500,rq:3,ra:0.5},puddle:{f:1500,a:0.75,wet:1}};
  function mkRoad(){return {v:0,vT:0,g:0,gT:0,s:SURF_S.asphalt,sk:'asphalt',wet:0,wT:0,sq:0,sqT:0,sc:0,scT:0,ro:0,ty:1,
    nbp:bpSet(bq(),900,0.7),rbp:bpSet(bq(),230,3),sq1:bpSet(bq(),1000,18),sq2:bpSet(bq(),1520,14),scb:bpSet(bq(),1300,1.4),hs:bpSet(bq(),5200,0.8),rat:bpSet(bq(),780,6),thp:bpSet(bq(),85,2.5),
    ph:0,nxt:1,dj:0,j2:-1,ri:0,ti:0,rti:0,drift:0,pk:0,sl:0,
    // 0.22: подвеска на кочках, ямы, пестрота покрытия, «гребёнка», оборот колеса (спущенное — «шлёп-шлёп»), вой протектора, камешки по крыльям
    bz:0,bzT:0,tex:0.5,texT:0.5,wash:0,cob:0,flat:0,lr:0,pn:-1,potI:0,potP:0,sus:bpSet(bq(),75,1.1),body:bpSet(bq(),145,2.2),pth:bpSet(bq(),68,1.6),spr:0,sprF:0,sprA:0,
    rev:0,wph:0,whi:0,pg:[bpSet(bq(),2900,26),bpSet(bq(),4100,30),bpSet(bq(),5300,28)],pgE:[0,0,0],pgP:[0,0,0]};}
  function roadBlock(r,oL,oR,N){
    const k=1-Math.exp(-N/(SR*0.05));r.v+=(r.vT-r.v)*k;r.g+=(r.gT-r.g)*k;r.wet+=(r.wT-r.wet)*k*0.4;r.sq+=(r.sqT-r.sq)*(r.sqT>r.sq?k*2:k);r.sc+=(r.scT-r.sc)*k;
    r.bz+=(r.bzT-r.bz)*Math.min(1,k*3);r.tex+=(r.texT-r.tex)*k*0.6;
    const S=r.s,v=r.v,vf=Math.min(1.4,Math.pow(v/25,1.35)),ty=r.ty,tx=r.tex;
    // пестрота покрытия: укатанное — глуше и тише, свежая подсыпка и заплаты — выше и громче
    bpSet(r.nbp,S.f*(0.85+0.3*Math.min(1,v/30))*(0.8+0.45*tx),0.75);if(S.rf)bpSet(r.rbp,S.rf*(0.9+0.2*tx),S.rq||2);
    bpSet(r.sus,62+40*tx,1.1);
    r.drift+=nz()*0.06;r.drift*=0.97;const f1=Math.max(600,880+r.sq*300+v*4+r.drift*120);bpSet(r.sq1,f1,16);bpSet(r.sq2,f1*1.53,12);
    const na=S.a*vf*(ty===0?0.75:1)*(0.78+0.5*tx),impK=ty===0?1.5:ty===1?1.15:0.9,dstep=v/SR,rough=r.ro,ratR=(rough*0.6+0.15+r.bz*0.5)*v/SR*(ty===0?1.6:1),wet=r.wet*Math.min(1,Math.pow(v/18,1.3));
    const sqA=r.sq*0.5,scA=r.sc*0.4*Math.min(1,v/10),thD=Math.exp(-1/(SR*0.004)),slurp=S.slurp?1:0;
    // подвеска: глухие удары на кочках (сила — по скорости подскока колёс), «гребёнка» — дробь с шагом 0,8 м
    const susA=Math.min(1.2,r.bz)*0.55*(ty===0?1.3:1),wsA=Math.min(1.5,(r.wash+r.cob*0.5)/0.012)*Math.min(1,v/12),wsF=v/0.8/SR;
    // оборот колеса (r≈0,42 м): спущенное колесо шлёпает, целое — чуть «дышит»; вой протектора пневматики на скорости
    const rvF=v/2.64/SR,rvD=r.flat?0.85:0.06,whF=v/0.034/SR,whA=ty>=1&&v>9?0.006*Math.min(1,(v-9)/20)*(0.6+0.8*tx):0;
    // камешки из-под колёс бьют по крыльям и днищу: на щебне, грунте, в горах — чем быстрее, тем чаще
    const pgR=(S.po?Math.min(3,S.po/5):0)*Math.max(0,v-5)*0.35*(0.5+tx)/SR,pdD=Math.exp(-1/(SR*0.012)),sprD=Math.exp(-1/(SR*0.09));
    for(let i=0;i<N;i++){
      let o=run(r.nbp,nz())*na,oS=0;
      r.rev+=rvF;if(r.rev>=1){r.rev-=1;if(r.flat&&v>1)r.ti+=0.5*Math.min(1,v/15);}
      o*=1+rvD*Math.sin(TAU*r.rev);
      let si=0;if(wsA>0.01){r.wph+=wsF;if(r.wph>=1)r.wph-=1;const w=Math.sin(TAU*r.wph);o*=1+0.45*wsA*w;si+=(nz()*0.25+w*0.6)*wsA*0.25;}
      if(susA>0.003)si+=nz()*susA;
      if(si!==0||Math.abs(r.sus.y1)>1e-6)oS+=run(r.sus,si);
      // яма: удар в подвеску, лязг кузова и пружинный «бум»
      if(r.potI>0.001){oS+=run(r.body,nz()*r.potI*2.2)+run(r.pth,r.potI*1.6);r.rti+=r.potI*0.05;r.potI*=0.9985;}
      else if(Math.abs(r.pth.y1)>1e-6)oS+=run(r.pth,0);
      if(r.sprA>1e-4){r.spr+=r.sprF/SR;r.sprF*=0.99993;oS+=Math.sin(TAU*r.spr)*r.sprA;r.sprA*=sprD;}
      if(whA>0){r.whi+=whF*(1+0.004*Math.sin(r.rev*TAU*3));if(r.whi>1)r.whi-=1;o+=Math.sin(TAU*r.whi)*whA+Math.sin(TAU*r.whi*2)*whA*0.35;}
      if(pgR>0&&rnd()<pgR){const q=Math.floor(rnd()*3);r.pgE[q]+=0.05+0.12*rnd();r.pgP[q]=rnd()*2-1;}
      let pl=0,pr=0;for(let q=0;q<3;q++)if(r.pgE[q]>1e-4){const x=run(r.pg[q],nz()*r.pgE[q]);r.pgE[q]*=pdD;const a=r.pgP[q];pl+=x*(1-a)*0.5;pr+=x*(1+a)*0.5;}
      if(slurp){r.sl+=0.00004;o*=0.6+0.4*Math.sin(r.sl*TAU*(2+v*0.2));}
      // шаг покрытия: кирпич, брусчатка, доски — ровная дробь с разбросом; щебень, грунт — случайные удары
      if(S.sp&&v>0.5){r.ph+=dstep;if(r.ph>=r.nxt){r.ph=0;r.nxt=S.sp*(0.8+0.4*rnd());r.ri+=S.ra*impK*Math.min(1.2,v/14)*(S.rr?(1-S.rr)+S.rr*rnd():0.7+0.3*rnd());}}
      else if(S.po&&v>0.5&&rnd()<S.po*dstep){r.ri+=S.ra*impK*Math.min(1.2,v/12)*(0.3+0.7*rnd());}
      if(r.ri>1e-5){o+=run(r.rbp,nz()*r.ri+r.ri*0.5);r.ri*=0.992;}
      // бетон: стыки плит — «та-дам» передних и задних колёс
      if(S.jt&&v>1){r.dj+=dstep;if(r.dj>=S.jt){r.dj=0;r.ti+=0.5*Math.min(1,v/20);r.j2=Math.floor(2.7/Math.max(1,v)*SR);}if(r.j2>=0&&r.j2--===0)r.ti+=0.4*Math.min(1,v/20);}
      if(r.ti>1e-5){o+=run(r.thp,r.ti*nz()*0.3+r.ti);r.ti*=thD;}
      // дребезг кузова и крыльев
      if(rnd()<ratR){r.rti+=0.08*(0.4+0.6*rnd())*Math.min(1,v/15);}
      if(r.rti>1e-5){o+=run(r.rat,nz()*r.rti);r.rti*=0.996;}
      if(sqA>0.002){const x=nz();o+=(run(r.sq1,x)*1.0+run(r.sq2,x)*0.55)*sqA;}
      if(scA>0.002)o+=run(r.scb,nz())*scA;
      if(wet>0.002)o+=run(r.hs,nz())*wet*0.32;
      o+=oS;const lr=r.lr*0.25;o*=r.g;pl*=r.g;pr*=r.g;oL[i]+=o*(1-lr)+pl;oR[i]+=o*(1+lr)+pr;}
  }
  class AvtEngine extends AudioWorkletProcessor{
    constructor(){super();this.v=new Map();this.road=null;this.alive=true;this.port.onmessage=e=>this.msg(e.data);}
    msg(d){if(d.t==='mk'){const old=this.v.get(d.id);if(old&&!old.dead)return;this.v.set(d.id,mkVoice(d.p));}
      else if(d.t==='rm'){const v=this.v.get(d.id);if(v)v.dead=true;}
      else if(d.t==='set'){for(const s of d.v){const v=this.v.get(s.id);if(!v)continue;v.rT=s.rpm;v.lT=s.ld;v.gT=s.g;v.pT=s.pan;v.lpT=s.lp;v.spd=s.spd;}
        if(d.r){if(!this.road)this.road=mkRoad();const r=this.road,q=d.r;r.vT=q.v;r.gT=q.g;r.wT=q.wet;r.sqT=q.sq;r.scT=q.sc;r.ro=q.ro;r.ty=q.ty;if(q.s!==r.sk&&SURF_S[q.s]){r.sk=q.s;r.s=SURF_S[q.s];}
          r.bzT=q.bz||0;r.texT=q.tex===undefined?0.5:q.tex;r.wash=q.wash||0;r.cob=q.cob||0;r.flat=q.flat||0;r.lr=q.lr||0;
          if(q.pn!==undefined){if(r.pn>=0&&q.pn>r.pn){const e=Math.min(1.4,0.45+(q.pj||0.5));r.potI+=e;r.sprA=0.05*e;r.sprF=150+60*rnd();r.spr=0;}r.pn=q.pn;}}}
      else if(d.t==='stop'){this.alive=false;}}
    process(ins,outs){const o=outs[0],L=o[0],R=o[1]||o[0],N=L.length;
      for(const [id,v] of this.v){voiceBlock(v,L,R,N);if(v.dead&&v.fade<0.002)this.v.delete(id);}
      if(this.road)roadBlock(this.road,L,R,N);
      // мягкий ограничитель: громкие вспышки не «рвут» звук
      const sc=x=>x>1.5?1:x<-1.5?-1:x-x*x*x/6.75;for(let i=0;i<N;i++){L[i]=sc(L[i]);if(R!==L)R[i]=sc(R[i]);}
      return this.alive;}
  }
  registerProcessor('avt-engine',AvtEngine);
}
/* ---------- профили моторов ---------- */
// Порядок вспышек: доля цикла (4-тактный — два оборота), сила по цилиндрам, ряд (для V-образных — своя труба)
function enFire(kind){switch(kind){
  case 1:return {fire:[0],amp:[1]};
  case 2:return {fire:[0,0.5],amp:[1,0.93]};
  case 'v2':return {fire:[0,0.5625],amp:[1,0.9]};                       // V-2 с развалом 45°: неровный «тук-тук… тук-тук»
  case 4:return {fire:[0,0.25,0.5,0.75],amp:[1,0.94,0.98,0.91]};
  case 'v4':return {fire:[0,0.3,0.5,0.8],amp:[1,0.9,0.97,0.88],bank:[0,1,0,1],nb:2};
  case 6:return {fire:[0,1,2,3,4,5].map(k=>k/6),amp:[1,0.95,0.98,0.94,0.99,0.93]};
  case 8:return {fire:[0,1,2,3,4,5,6,7].map(k=>k/8),amp:[1,0.96,0.99,0.95,0.98,0.94,0.99,0.96]};
  case 'v8f':return {fire:[0,1,2,3,4,5,6,7].map(k=>k/8),amp:[1,0.95,0.98,0.94,0.99,0.95,0.97,0.93],bank:[0,1,0,1,0,1,0,1],nb:2};
  case 'v8x':return {fire:[0,1,2,3,4,5,6,7].map(k=>k/8),amp:[1,0.93,0.98,0.95,0.97,0.92,0.99,0.94],bank:[0,1,0,0,1,1,1,0],nb:2}; // крестообразный вал: «бульканье»
  case 12:return {fire:Array.from({length:12},(_,k)=>k/12),amp:Array.from({length:12},(_,k)=>0.94+0.06*((k*7)%5)/4),bank:Array.from({length:12},(_,k)=>k%2),nb:2};
  case 16:return {fire:Array.from({length:16},(_,k)=>k/16),amp:Array.from({length:16},(_,k)=>0.94+0.06*((k*5)%7)/6),bank:Array.from({length:16},(_,k)=>k%2),nb:2};
  case 'steam':return {fire:[0,0.25,0.5,0.75],amp:[1,0.78,0.95,0.72],cyc:1};
  case 'elec':return {fire:[0],amp:[0],cyc:1};}
  return enFire(4);}
// Типы моторов гоночных машин и массовых моделей: цилиндры, обороты, трубы, глушитель, нагнетатель
const EN_TYPE={
  s1:{lvl:5.5,c:1,idle:420,max:1700,pipe:[1.1],tau:3,noise:0.5,valve:0.22,hm:0,mis:0.02,thump:0.7},            // одноцилиндровый «Де Дион»: частый «тук-тук»
  s1h:{lvl:5.5,c:1,idle:230,max:700,pipe:[1.5],tau:5,noise:0.35,valve:0.25,hm:1,mis:0.04,thump:0.9,loss:2200},   // лежачий цилиндр Бенца: редкие тяжёлые вспышки
  t2:{lvl:4.6,c:2,idle:280,max:900,pipe:[1.3],tau:4.2,noise:0.45,valve:0.2,hm:1,mis:0.03,thump:0.8},            // двухцилиндровый «Феникс» Даймлера
  v2:{lvl:4.4,c:'v2',idle:380,max:1500,pipe:[1.0],tau:3.2,noise:0.5,valve:0.16,thump:0.7},
  i4:{lvl:4.3,c:4,idle:330,max:1500,pipe:[1.6],tau:3,noise:0.5,valve:0.12,thump:0.55},
  i4b:{lvl:2.6,c:4,idle:260,max:1300,pipe:[0.9],tau:4.5,noise:0.6,valve:0.16,thump:0.95,open:1,chain:0.12,pop:0.04,loss:2600}, // гоночные гиганты 10–28 л: тяжёлый «бух-бух», цепь
  i4ohc:{lvl:3.6,c:4,idle:420,max:2600,pipe:[0.9],tau:2.8,noise:0.55,valve:0.1,gearW:0.004,open:1,pop:0.05},
  i4d:{lvl:3.6,c:4,idle:500,max:3000,pipe:[0.85],tau:2.4,noise:0.55,valve:0.12,gearW:0.005,open:1,pop:0.05},
  i4sc:{lvl:3.2,c:4,idle:520,max:4200,pipe:[0.8],tau:2.2,noise:0.55,valve:0.08,gearW:0.004,sc:1,scR:1.5,open:1,pop:0.06},
  op4:{lvl:2.7,c:4,idle:300,max:1300,pipe:[0.9],tau:5,noise:0.55,valve:0.08,thump:1.1,open:1,chain:0.1,pop:0.04},  // Гоброн-Брийе: два поршня в цилиндре
  v4:{lvl:3.2,c:'v4',idle:300,max:1300,pipe:[0.9,1.05],tau:4.2,noise:0.55,valve:0.14,thump:0.9,open:1},
  i6:{lvl:5.0,c:6,idle:380,max:2400,pipe:[1.9],tau:2.3,noise:0.42,valve:0.08,thump:0.45},
  i6r:{lvl:4.0,c:6,idle:420,max:3200,pipe:[1.0],tau:2.1,noise:0.5,valve:0.08,gearW:0.004,open:1,pop:0.05},
  i6sc:{lvl:3.6,c:6,idle:480,max:3600,pipe:[1.0],tau:2.1,noise:0.5,valve:0.07,sc:2,scR:1.4,open:1,pop:0.05},       // «Мерседес» с нагнетателем: визг только в полный газ
  aero6:{lvl:2.5,c:6,idle:220,max:1500,pipe:[0.6],tau:4.5,noise:0.65,valve:0.1,thump:1.1,open:1,chain:0.14,pop:0.06}, // авиамотор на шасси: «Читти-Бэнг-Бэнг»
  i8:{lvl:3.0,c:8,idle:450,max:4200,pipe:[1.1],tau:1.9,noise:0.45,valve:0.07,gearW:0.004,open:1,pop:0.04},
  i8sc:{lvl:2.05,c:8,idle:600,max:5600,pipe:[0.9],tau:1.7,noise:0.5,valve:0.06,gearW:0.005,sc:1,scR:1.25,open:1,pop:0.06},
  i8road:{lvl:4.5,c:8,idle:360,max:3200,pipe:[2.4],tau:2,noise:0.35,valve:0.05,thump:0.4},
  v8f:{lvl:4.2,c:'v8f',idle:380,max:2600,pipe:[1.9,2.0],tau:2.3,noise:0.42,valve:0.07,thump:0.55},
  v8x:{lvl:4.2,c:'v8x',idle:420,max:3400,pipe:[1.7,2.05],tau:2.4,noise:0.45,valve:0.06,thump:0.7},
  v8aero:{lvl:2.6,c:'v8f',idle:300,max:1400,pipe:[0.5,0.55],tau:3.5,noise:0.65,valve:0.1,thump:1,open:1,pop:0.06},
  v12:{lvl:2.6,c:12,idle:480,max:5000,pipe:[1.0,1.08],tau:1.6,noise:0.45,valve:0.05,gearW:0.004,open:1,pop:0.04},
  v12aero:{lvl:2.4,c:12,idle:260,max:1900,pipe:[0.55,0.6],tau:3.2,noise:0.65,valve:0.08,thump:1,open:1,pop:0.07},
  v16:{lvl:2.2,c:16,idle:500,max:4800,pipe:[1.0,1.1],tau:1.4,noise:0.45,valve:0.05,sc:1,scR:1.3,open:1,pop:0.04},
  steam:{lvl:0.8,c:'steam',kind:'steam',idle:0,max:900,pipe:[0.35],refl:-0.3,noise:1,valve:0,thump:0.2,burn:0.06,tau:6},
  elec:{lvl:1.05,c:'elec',kind:'elec',idle:0,max:2400,pipe:[0.3],noise:0,valve:0,comm:22}};
// Марка гоночной машины → тип мотора (по годам: [до года, тип])
const EN_MQ={'Panhard et Levassor':[[1895,'t2'],[1999,'i4b']],'Peugeot':[[1896,'t2'],[1911,'i4b'],[1999,'i4d']],"Peugeot «L'Éclair»":'t2','De Dion-Bouton':[[1895,'steam'],[1999,'s1']],
  'Bollée (пар)':'steam','Bollée':'steam','Léon Bollée':'s1h','Duryea':'t2','Riker Electric':'elec','Jeantaud':'elec','La Jamais Contente':'elec','C.G.V.':'i4b','Delahaye':[[1898,'t2'],[1999,'i4']],
  'Bolide':'t2','Mors':[[1898,'t2'],[1999,'i4b']],'Mercedes':[[1913,'i4b'],[1921,'i4ohc'],[1926,'i4sc'],[1933,'i6sc'],[1999,'i8sc']],'Winton':[[1901,'s1h'],[1902,'i4'],[1904,'i8'],[1999,'i6']],
  'Daimler':'i4b','Napier':[[1903,'i4b'],[1999,'i6r']],'Rolls-Royce':[[1904,'t2'],[1999,'i6']],'Hotchkiss':'i4b','Itala':[[1924,'i4b'],[1999,'i6r']],'Decauville':'t2','Richard-Brasier':'i4b','Brasier':'i4b',
  'Renault':'i4b','Benz':[[1899,'s1h'],[1922,'i4b'],[1999,'i6sc']],'Laurin & Klement':'i4','Steyr':'i6r','De Dietrich':'i4b','Darracq':[[1904,'i4'],[1905,'v8aero'],[1999,'i4ohc']],
  'Fiat':[[1921,'i4b'],[1922,'i6r'],[1999,'i8sc']],'Nazzaro':'i4ohc','Ford':'i4','Ford 999':'i4b','Peerless':'i4b','Christie':'v4','Miller':[[1922,'i8'],[1999,'i8sc']],'Gobron-Brillié':'op4',
  'Delage':[[1922,'i4ohc'],[1925,'v12'],[1999,'i8sc']],'Turcat-Méry':'i4b','Ballot':[[1918,'i4d'],[1999,'i8']],'Alfa Romeo':[[1922,'i4ohc'],[1999,'i8sc']],'Clément-Bayard':'i4b','Locomobile':'i4b',
  'Alda':'i4ohc','Simplex':'i4b','Buick':'i4','Frontenac':'i4d','Lion-Peugeot':'v2','Bugatti':[[1921,'i4ohc'],[1925,'i8'],[1999,'i8sc']],'Isotta Fraschini':[[1914,'i4b'],[1999,'i8road']],
  'OM':'i6r','Sunbeam':[[1911,'i4ohc'],[1921,'i6r'],[1925,'i6sc'],[1999,'v12aero']],'Duesenberg':[[1919,'i4ohc'],[1999,'i8']],'Rolland-Pilain':'i8','Sizaire-Naudin':'s1','Minerva':'i4','Case':'i4',
  'Lozier':'i6','Hudson':'i6','Thomas Flyer':'i4b','National':'i4b','Packard':[[1915,'i6'],[1999,'v12']],'Alco':'i6','Marmon':'i6r','Stutz':[[1925,'i4ohc'],[1999,'i8']],'Austro-Daimler':'i4ohc',
  'Opel':'i4b','Mercer':'i4ohc','Durant':'i4','Hispano-Suiza':'i4ohc','Руссо-Балт':'i4','Maxwell':'i4','Talbot':[[1925,'i4ohc'],[1999,'i6r']],'Talbot-Darracq':'i8','SCAT':'i4ohc','Ceirano':'i4',
  'Bentley':[[1927,'i4ohc'],[1999,'i6']],'Chevrolet':'i4','Monroe':'i4ohc','CMN':'i4','Diatto':'i4ohc','Maserati':'i8sc','Mercedes-Benz':[[1933,'i6sc'],[1999,'i8sc']],'Amilcar':[[1925,'i4'],[1999,'i6sc']],
  'Bluebird':'v12aero','AC':'i6r','Lea-Francis':'i4sc','Salmson':'i4d','Chitty Bang Bang':'aero6','Aston Martin':'i4ohc','Chiribiri':'i4ohc','Bianchi':'i4ohc','Leyland':'i8road',
  'Thomas Special «Babs»':'v12aero','Packard Cable Special':'v12aero','Excelsior':'i6','Stutz Black Hawk':'i8','White Triplex':'v12aero','Omega-Six':'i6r',
  'FIAT':[[1921,'i4b'],[1922,'i6r'],[1999,'i8sc']],'Humber':[[1904,'s1'],[1999,'i4']],'Lanchester':[[1905,'t2'],[1910,'i4'],[1999,'i6']],'Horch':[[1926,'i4'],[1999,'i8road']],'Berliet':[[1912,'i4b'],[1999,'i4']],
  'Adler':[[1903,'s1'],[1999,'i4']],'Nash':[[1916,'i4'],[1999,'i6']],'Rover':[[1905,'s1'],[1999,'i4']],'Stanley':'steam','Cadillac':[[1908,'s1h'],[1914,'i4'],[1922,'v8f'],[1999,'v8x']],
  'Pierce-Arrow':[[1906,'i4'],[1999,'i6']],'Singer':'i4','Wolseley':[[1905,'t2'],[1999,'i4']],'Vauxhall':[[1905,'s1'],[1999,'i4ohc']],'Austin':'i4','Oldsmobile':[[1906,'s1h'],[1999,'i4']],
  'Studebaker':[[1917,'i4'],[1999,'i6']],'Brennabor':'i4','Hudson-Essex':'i6','Willys-Overland':'i4','Lancia':[[1921,'i4ohc'],[1999,'v4']],'Morris':'i4','Dodge Brothers':'i4','Citroën':'i4','MG':'i4ohc'};
function enMqType(name,y){const m=EN_MQ[name]||EN_MQ[(name||'').split(' ')[0]];if(!m)return null;if(typeof m==='string')return m;for(const [yy,t] of m)if(y<=yy)return t;return m[m.length-1][1];}
function enEraType(y,race){return y<1896?'t2':y<1900?(race?'i4':'t2'):y<1912?(race?'i4b':'i4'):y<1920?(race?'i4ohc':'i4'):y<1926?(race?'i8':'i6'):(race?'i8sc':'i6');}
// Профиль звука машины гонки: для машин игрока — по его мотору (цилиндры, год, гильзы Найта), для соперников — по марке и году
function enProfile(c,y){
  let t=null,cyl=0,sleeve=false,yr=y,eng=null;
  try{if(c.md&&(c.you||c.spec)){eng=parts(c.md).e;cyl=eng.cyl||4;sleeve=!!eng.sleeve;yr=Math.min(y,Math.max(eng.y,y-8));}}catch(_){}
  if(eng){t=cyl===1?(/Cadillac|Бенц|Benz/.test(eng.name)?'s1h':'s1'):cyl===2?'t2':cyl===6?(y>=1920?'i6r':'i6'):cyl===8?(/V8/.test(eng.name)?(y>=1923?'v8x':'v8f'):(y>=1924?'i8':'i8road')):(y<1906?'i4b':y<1920?'i4':'i4ohc');}
  else t=enMqType(c.name,y)||enEraType(y,true);
  const T=Object.assign({},EN_TYPE[t]||EN_TYPE.i4),F=enFire(T.c);
  const p=Object.assign({kind:'ic',cyc:2},T,F,{type:t});
  // обороты растут с годами; мотор игрока — по его мощности: большой тихоходный или маленький оборотистый
  if(eng){const hp=eng.hp||20;p.max=Math.round(p.max*clamp(1.15-hp/260,0.75,1.1));}
  if(sleeve){p.valve=0.015;p.noise*=0.8;}                      // гильзовый Найт — почти беззвучный
  const race=!c.you||(c.prep||0)>=1;if(race&&p.open===undefined&&p.kind==='ic')p.open=0.55;
  if(!race&&p.open)p.open*=0.4;
  p.muff=p.open>0.5?1600:y<1906?1300:900;
  if(c.chain===undefined&&yr<1911&&p.kind==='ic'&&!p.chain&&(t==='i4b'||t==='t2'))p.chain=0.08;
  return p;}
/* ---------- менеджер: какие машины звучат, громкость, панорама, эффект Доплера ---------- */
const EN={ok:false,loading:null,node:null,slots:new Map(),nid:1,fail:false};
function enLoad(){if(EN.ok||EN.loading||EN.fail||!AU.ctx||!AU.ctx.audioWorklet||typeof AudioWorkletNode==='undefined')return;
  const src='('+avtEngineWorklet.toString()+')();';
  const tryUrl=u=>AU.ctx.audioWorklet.addModule(u);
  let url=null;try{url=URL.createObjectURL(new Blob([src],{type:'application/javascript'}));}catch(_){}
  EN.loading=(url?tryUrl(url):Promise.reject()).catch(()=>tryUrl('data:application/javascript;charset=utf-8,'+encodeURIComponent(src)))
    .then(()=>{EN.ok=true;}).catch(e=>{EN.fail=true;console.warn('engine worklet',e);});}
function enStart(dest){if(!EN.ok||!AU.ctx)return null;if(EN.node)enStop();try{
  const n=new AudioWorkletNode(AU.ctx,'avt-engine',{numberOfInputs:0,numberOfOutputs:1,outputChannelCount:[2]});n.connect(dest);EN.node=n;EN.slots.clear();return n;}catch(e){console.warn(e);return null;}}
function enStop(){if(EN.node){try{EN.node.port.postMessage({t:'stop'});EN.node.disconnect();}catch(_){}EN.node=null;EN.slots.clear();}}
// обороты для звука: по скорости и передаче; стоим — холостые, с газом — «перегазовка» (сцепление выжато)
function enRpm(c,p,thr){const r=clamp(c.rpm||0,0,1.12)*p.max;if(p.kind==='steam'||p.kind==='elec')return Math.max(0,Math.abs(c.vx||0)<0.3?0:r);
  const free=p.idle+thr*(0.62*p.max-p.idle);return Math.abs(c.vx||0)<1.6?Math.max(r,free):Math.max(r,p.idle*(c.shift>0?1.25:1));}
const EN_SURF_TY=y=>y<1906?0:y<1922?1:2;
function enTick(a,me,vol){if(!EN.node||!R)return;const cars=R.cars,T=R.trk,msgs=[],set=[];
  // «уши» — гонщик в кабине (при любом виде камеры): соседей слышно оттуда, где они относительно нашей машины
  const lx=me.x,lz=me.z,rx=Math.cos(me.yaw),rz=-Math.sin(me.yaw);
  const pre=R.t<0,want=[];
  for(const c of cars){if(c===me||c.dnf==='застрял')continue;const d=Math.hypot(c.x-lx,c.z-lz);if(d<150)want.push([d,c]);}
  want.sort((x,y)=>x[0]-y[0]);const pick=new Set([me,...want.slice(0,pre?4:3).map(x=>x[1])]);
  for(const [c,s] of EN.slots)if(!pick.has(c)){msgs.push({t:'rm',id:s.id});EN.slots.delete(c);}
  for(const c of pick){if(!EN.slots.has(c)){const p=c.enP||(c.enP=enProfile(c,R.rc.y)),id=EN.nid++;EN.slots.set(c,{id,p});msgs.push({t:'mk',id,p});}}
  const mvx=Math.sin(me.yaw)*(me.vx||0),mvz=Math.cos(me.yaw)*(me.vx||0);
  for(const [c,s] of EN.slots){const p=s.p;
    let thr=c.shift>0?0:(c.thr||0);
    if(pre){thr=c===R.me?(rKeys.gas?1:0):0.18+0.3*Math.max(0,Math.sin(R.t*2.1+c.num*1.7))*(Math.sin(R.t*0.7+c.num)>0.3?1:0);}
    if(c.dnf||c.fin!==null&&c!==me&&Math.abs(c.vx)<0.5)thr=0;
    let rpm=enRpm(c,p,thr);if(c.dnf&&Math.abs(c.vx)<0.5)rpm=0;
    let g,pan=0,lp=14000;
    if(c===me){g=vol*(c.overheat>0?0.55:1)*(c.dnf?0.15:1);if(R.gl&&typeof R3!=='undefined'&&R3.view===2)lp=6500;}
    else{const dx=c.x-lx,dz=c.z-lz,d=Math.hypot(dx,dz)||1;g=vol*0.95/(1+Math.pow(d/7,1.25));pan=clamp((dx*rx+dz*rz)/d,-1,1)*0.85;lp=clamp(15000/(1+d/22),900,15000);
      // эффект Доплера: приближается — выше, удаляется — ниже
      const cvx=Math.sin(c.yaw)*(c.vx||0),cvz=Math.cos(c.yaw)*(c.vx||0),vr=((cvx-mvx)*-dx+(cvz-mvz)*-dz)/d;rpm*=clamp(343/(343-clamp(vr,-60,60)),0.85,1.2);}
    if(me.tun&&!c.tun)g*=0.5;
    set.push({id:s.id,rpm,ld:thr,g,pan,lp,spd:Math.abs(c.vx||0)});}
  // дорога под нашими колёсами
  let road=null;
  if(R.me||R.follow){const S=me.surf||'asphalt',sp=Math.abs(me.vx||0),soft=/^(dirt|mud|mudhole|sand|beach|snow|grass|field|verge|forest)$/.test(S);
    const skid=sp>3?clamp(Math.max((Math.max(me.slipR||0,(me.slipF||0)*0.8)-0.08)*5,((me.gu||0)-0.8)*3.5)+(me.spinw>0.3?0.25:0),0,1):0;
    const wet=R.wx&&(R.wx.rain||R.wetK)?(me.tun?0:Math.max(R.wetK||0,R.wx.rain?1:0)):0;
    road={v:sp,g:(R.t<0?0:1)*vol*(me.off?1.2:1)*0.5,s:S==='puddle'?'puddle':S,wet:S==='puddle'?1:wet,sq:soft?0:skid,sc:soft?skid:0,ro:me.off?1:0.3,ty:EN_SURF_TY(R.rc.y)};
    // 0.22: кочки, ямы, пестрота покрытия, «гребёнка», спущенное колесо — звук меняется на ходу, а не гудит ровно
    const G=T.rg,st=me.v3;if(G&&!me.off){const i=me.idx;road.wash=G.wash[i];road.cob=G.cob[i];road.tex=roughTex(T,rgS(T,me));}else road.tex=0.5;
    road.bz=clamp((st&&st.bz)||0,0,3)*(me.off?1.5:1);road.pn=me.potN||0;road.pj=clamp((st&&st.bz)||0.5,0,1);road.flat=me.punct?1:0;road.lr=clamp(me.joltSide||0,-1,1)*(me.potN?1:0);}
  msgs.push({t:'set',v:set,r:road});
  for(const m of msgs)EN.node.port.postMessage(m);}
