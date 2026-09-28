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
function carStyle(md,prep,y){
  const p=parts(md),b=p.b.id;
  if(p.b.truck)return b==='b6'?'van':'truck';
  if(prep===2)return y<1901?'carriage':y<1907?'gp1901':y<1912?'gp1907':y<1925?'gp1912':'gp1925';
  if(y<1901)return 'carriage';
  if(prep===1)return y<1912?'gp1901':'sport';
  return b==='b1'||b==='b10'?(y<1912?'runabout':'sport'):b==='b2'?'tonneau':b==='b3'?'tourer':'sedan';
}
