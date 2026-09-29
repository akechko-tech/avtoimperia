/* ================= SPRITES: cars from behind, crews, scenery (painted in code) ================= */
const SPR={cache:{}};
function mkCanvas(w,h){const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c;}
function shade(hex,amt){const n=parseInt((hex||'#333333').slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=amt<0?0:255,t=Math.abs(amt);r=Math.round((f-r)*t+r);g=Math.round((f-g)*t+g);b=Math.round((f-b)*t+b);return `rgb(${r},${g},${b})`;}
function mix(a,b,k){const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16);const f=(x,y)=>Math.round(x+(y-x)*k);return `rgb(${f(A>>16,B>>16)},${f(A>>8&255,B>>8&255)},${f(A&255,B&255)})`;}
function vgrad(c,y0,y1,stops){const g=c.createLinearGradient(0,y0,0,y1);stops.forEach(([k,col])=>g.addColorStop(k,col));return g;}
function hgrad(c,x0,x1,stops){const g=c.createLinearGradient(x0,0,x1,0);stops.forEach(([k,col])=>g.addColorStop(k,col));return g;}
function ell(c,x,y,rx,ry,fill){c.beginPath();c.ellipse(x,y,Math.max(0.1,rx),Math.max(0.1,ry),0,0,7);c.fillStyle=fill;c.fill();}
function rrect(c,x,y,w,h,r,fill){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();c.fillStyle=fill;c.fill();}
function poly(c,pts,fill){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fillStyle=fill;c.fill();}
// ---------- облик машины по эпохе, кузову и подготовке ----------
// own — машина игрока: облегчённая остаётся своим кузовом (без крыльев, фонарей и тента), а не превращается в гоночную
function carStyle(md,prep,y,own){
  const p=parts(md),b=p.b.id;
  if(p.b.truck)return b==='b6'?'van':'truck';
  // своя спортивная модель и в заводской подготовке остаётся спортивной (без фар, с номерами)
  const sport=b==='b10'||(b==='b1'&&md.t==='t3'&&y>=1910);
  if(prep===2)return own&&sport?'sport':y<1901?'carriage':y<1907?'gp1901':y<1912?'gp1907':y<1925?'gp1912':'gp1925';
  if(y<1901&&(b==='b1'||!own))return 'carriage';
  if(prep===1&&!own)return y<1912?'gp1901':'sport';
  return b==='b10'||(b==='b1'&&md.t==='t3'&&y>=1910)?'sport':b==='b1'?'runabout':b==='b2'?'tonneau':b==='b3'?'tourer':'sedan';
}
// Облик машины игрока в 3D — тот же, что у модели: её цвет и кузов, капот тем длиннее, чем больше мотор;
// заводской гоночный кузов — узкий гоночный, но в цвете модели с полосой национального гоночного цвета
function modelSpec(md,prep,y,o){o=o||{};const p=parts(md),bid=p.b.id,style=carStyle(md,prep,y,true),hp=engineHp(p.e,md),hpB=hp<=4?0:hp<=10?1:hp<=20?2:hp<=35?3:hp<=60?4:5;
  const color=md.paint||'#23427a',acc=prep===2&&y>=1903&&o.country&&COUNTRIES[o.country]?COUNTRIES[o.country].race:null;
  const wheel=o.wheel||wheelKind(md,y),mech=o.mech!==undefined?!!o.mech:mechanicEra(y),num=o.num||0,strip=(prep===1||(prep===2&&style==='sport'))&&!p.b.truck?1:0,lux=md.t==='t2'?1:0;
  const key=['m',style,color,acc||'',num,wheel,mech?1:0,bid,hpB,strip,lux,y].join('|');
  return {key,style,color,acc,y,wheel,mech,num,b:bid,hp:hpB,strip,lux};}
