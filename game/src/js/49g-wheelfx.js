/* ================= 0.30: ЧТО ЛЕТИТ ИЗ-ПОД КОЛЁС =================
   Из-под ведущих (задних) колёс летит то, по чему едет машина: щебень шоссе, комья земли, песок, снег, дёрн с обочины,
   а в дождь — комья грязи. Комья тяжёлые: взлетают и падают, мелочь — облачком. Больше всего — при пробуксовке и на газу.
   Колесо на ободе: на камне, булыжнике и асфальте — сноп искр (светятся и ночью), на грунте — фонтан земли; спущенная
   шина и обод на скорости дымят. Своя машина бросает меньше — камера сразу за ней, иначе за машиной встаёт стена камней. */
const DEBRIS={dirt:{c:[116,94,64],k:1,s:0.05},macadam:{c:[126,120,110],k:1.1,s:0.04},mount:{c:[132,122,106],k:1.2,s:0.055},rock:{c:[140,135,128],k:0.6,s:0.05},
  sand:{c:[212,188,136],k:1.6,s:0.03},dune:{c:[218,196,146],k:1.7,s:0.03},beach:{c:[222,204,160],k:1.3,s:0.03},snow:{c:[236,240,246],k:1.4,s:0.06},
  mud:{c:[74,58,40],k:1.3,s:0.07},mudhole:{c:[66,52,36],k:1.6,s:0.08},field:{c:[92,74,52],k:1.2,s:0.06},grass:{c:[82,102,52],k:0.7,s:0.05},
  forest:{c:[80,66,46],k:0.8,s:0.05},verge:{c:[104,90,62],k:0.9,s:0.05},pave:{c:[120,112,104],k:0.22,s:0.03}};
const SPARK_SURF={asphalt:1,concrete:1,brick:1,pave:1,macadam:0.8,rock:1,mount:0.5,board:0};
function r3dWheelFx(c,st,fw,rt,v,dt,me,rain){if(R.mode==='sim'||v<2)return;const m=r3dCarMesh(c.spec3,false),cw=m.cw;if(!cw||!st.mat)return;
  const M=st.mat,W=(x,y,z)=>[M[0]*x+M[4]*y+M[8]*z+M[12],M[1]*x+M[5]*y+M[9]*z+M[13],M[2]*x+M[6]*y+M[10]*z+M[14]],sk=c.surf||'',wet=rain||(R.wetK||0)>0.4;
  // 1) частицы покрытия из-под задних колёс
  let D=DEBRIS[sk];if(D&&wet&&(sk==='dirt'||sk==='mount'||sk==='field'||sk==='verge'))D=DEBRIS.mud;
  if(D&&!c.inWater){const spin=c.spinw||0,load=0.45+Math.min(3,spin*3)+(c.thr>0.6?0.5:0)+(c.slipR>0.15?0.6:0),rate=v*D.k*load*(me?0.6:0.8)*Math.min(1,(v-2)/6);
    for(const k of [2,3]){const w=cw[k];if(!w)continue;const ak='db'+k;st[ak]=(st[ak]||0)+dt*rate;if(st[ak]<1)continue;
      const side=(k&1)?1:-1,p=W(w[0],w[1]-w[3]+0.06,w[2]-w[3]*0.6);
      while(st[ak]>=1){st[ak]-=1;const j=0.82+Math.random()*0.3,col=[D.c[0]*j,D.c[1]*j,D.c[2]*j],back=v*(0.12+Math.random()*0.16)+1+Math.random()*2.5,up=0.9+Math.random()*2.6+Math.min(2,spin*2),out=(0.2+Math.random()*1.3)*side;
        r3dPart(p[0],p[1],p[2],-fw[0]*back+rt[0]*out+(Math.random()-0.5)*0.6,up,-fw[2]*back+rt[2]*out+(Math.random()-0.5)*0.6,D.s*(1.2+Math.random()*1.0),0,0.45+Math.random()*0.4,col,0.95,1,2,0.04);}}}
  // 2) спущенные шины и обода: искры, дым, фонтан земли
  if(!c.tp||!c.punct)return;
  for(let k=0;k<4;k++){const tp=c.tp[k];if(!tp)continue;const w=cw[k];if(!w)continue;const side=(k&1)?1:-1,p=W(w[0]+side*0.04,w[1]-w[3]*0.92,w[2]),ak='sp'+k;
    if(tp===2){const hard=SPARK_SURF[sk]||0;
      if(hard>0&&v>3){st[ak]=(st[ak]||0)+dt*v*4.5*hard;while(st[ak]>=1){st[ak]-=1;const hot=Math.random(),col=[255,120+hot*90,30+hot*60],back=v*(0.25+Math.random()*0.35);
          r3dPart(p[0],p[1]+0.03,p[2],-fw[0]*back+rt[0]*side*(0.5+Math.random()*2.2)+(Math.random()-0.5),0.6+Math.random()*2.4,-fw[2]*back+rt[2]*side*(0.5+Math.random()*2.2)+(Math.random()-0.5),0.035+Math.random()*0.03,0,0.16+Math.random()*0.3,col,1,0.55,1,0.03);}}
      else if(D&&v>3){st[ak]=(st[ak]||0)+dt*v*1.8;while(st[ak]>=1){st[ak]-=1;const j=0.8+Math.random()*0.3;
          r3dPart(p[0],p[1]+0.05,p[2],-fw[0]*v*0.2+rt[0]*side*Math.random()*1.5,1.2+Math.random()*2.2,-fw[2]*v*0.2+rt[2]*side*Math.random()*1.5,D.s*1.8,0,0.5+Math.random()*0.4,[D.c[0]*j,D.c[1]*j,D.c[2]*j],0.95,1,2,0.04);}}}
    // дым резины: горит покрышка (спущенная на скорости) и остатки её на ободе
    if(v>(tp===2?4:9)&&Math.random()<dt*(tp===2?9:5)*Math.min(1,v/20))r3dPart(p[0],p[1]+0.25,p[2],(Math.random()-0.5)*0.8-fw[0]*v*0.08,0.5+Math.random()*0.6,(Math.random()-0.5)*0.8-fw[2]*v*0.08,0.3,1.6,1.1,tp===2?[150,150,152]:[205,205,205],tp===2?0.32:0.22);}
  // скрежет обода по камню — короткие звуки (своя машина)
  if(me&&twRimN(c)&&v>3&&(SPARK_SURF[sk]||0)>0.4&&typeof ambCool==='function'&&ambCool('rimScr',0.45))try{auSfx('grind',Math.min(0.9,0.3+v/35));}catch(_){}}
