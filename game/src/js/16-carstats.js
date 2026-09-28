/* ================= CAR STATS: physics from components ================= */
// Подготовка к гонке: серийная машина, облегчённая (без тента, крыльев и задних сидений), заводской гоночный кузов
const PREP=[{id:0,name:'Серийная',desc:'как в продаже',cost:0},{id:1,name:'Облегчённая',desc:'без тента, крыльев и фонарей',cost:0.2},{id:2,name:'Заводской гоночный кузов',desc:'узкий кузов, форсированный мотор',cost:0.55}];
function mechanicEra(y){return y<1925;}
function racingCd(y){return y<1906?0.85:y<1914?0.75:y<1922?0.65:0.55;}
function carStats(md,prep,y){
  const p=parts(md);prep=prep||0;y=y||(G?G.y:1895);
  let bodyKg=p.b.kg,cd=p.b.cd,cg=p.b.cg,hpK=1,relK=1;
  if(p.t.id==='t2')bodyKg+=40;else if(p.t.id==='t1')bodyKg+=15;
  if(prep===1){bodyKg*=0.72;cd*=0.88;hpK=1.05;relK=0.98;cg-=0.03;}
  if(prep===2){bodyKg=70+(y<1905?40:0);cd=racingCd(y);cg=0.6;hpK=1.25;relK=0.93;}
  const hp=engineHp(p.e)*hpK,crew=75+(mechanicEra(y)?70:0);
  const m=p.e.kg+p.c.kg*(1-0.05*upgL(p.c.id))+bodyKg+p.w.kg+crew+40;
  const P=hp*745.7*0.82,kd=0.5*1.2*cd,crr=p.w.id==='w1'?0.03:0.016,g=9.81;
  let v=20;for(let i=0;i<30;i++){const f=kd*v*v*v+crr*m*g*v-P,df=3*kd*v*v+crr*m*g;v=Math.max(3,v-f/df);}
  let t=0,vv=0.5,t30=999;const muT=0.75*(p.w.grip||1);while(vv<16.7&&t<120){const a=Math.min(muT*g*0.56,(P/Math.max(vv,3.5)-kd*vv*vv-crr*m*g)/m);if(a<=0.02){t=999;break;}vv+=a*0.05;t+=0.05;if(vv>=8.33&&t30===999)t30=t;}
  const grip=(p.w.grip||1)*(1+0.08*upgL(p.w.id));
  const rel=clamp(p.e.rel*(1+0.02*upgL(p.e.id))*(0.85+0.15*Math.min(1,modelQ(md)/eraBest({y},false)))*relK*(overpower(md)?0.75:1),0.3,0.99);
  return {hp,kg:Math.round(m),P,kd,crr,vmax:v,acc:t,acc30:t30,cd,cg,brk:p.c.brk,grip,rel,wb:p.c.wb+(p.e.hp>40?0.3:0),wire:!!p.c.wire,mech:mechanicEra(y),hpKg:hp/m*1000};
}
function accText(st){return st.acc<999?`0–60 за ${st.acc.toFixed(1).replace('.',',')} с`:st.acc30<999?`0–30 за ${st.acc30.toFixed(1).replace('.',',')} с`:'разгон медленный';}
function statsLine(st){return `${Math.round(st.vmax*3.6)} км/ч · ${accText(st)} · ${st.kg} кг · ${Math.round(st.hp)} л.с.`;}
