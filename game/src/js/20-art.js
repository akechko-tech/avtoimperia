/* ================= ART ================= */
// 0.51: рисунки новых видов техники (вид сбоку, нос вправо). g — опорные точки шасси: rear — задний свес, x0 — передняя стенка кабины,
// railY — верх рамы. Возвращает b — кузов; w — свои колёса (трактор, гусеницы); twin — сдвоенная задняя ось; wx — добавочные колёса
function kindArt(art,g){const {rear,x0,railY,front,paint,dark,glass,metal,driver,R,wy,GY,rx,fx,leather}=g,W=x0-rear,r=(x,y,w,h,f,o)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${f}"${o?` opacity="${o}"`:''}/>`,wood='#6b4a2b';
  const cab=()=>r(x0-24,railY-42,24,42,paint)+r(x0-19,railY-36,14,13,glass,.85),wins=(xa,xb,y,h,n)=>{let o='';const w=(xb-xa-(n+1)*3)/n;for(let i=0;i<n;i++)o+=r(xa+3+i*(w+3),y,w,h,glass,.85);return o;},
    cross=(cx,cy)=>`<circle cx="${cx}" cy="${cy}" r="7" fill="#f4f1e8"/><rect x="${cx-1.6}" y="${cy-5}" width="3.2" height="10" fill="#b3271e"/><rect x="${cx-5}" y="${cy-1.6}" width="10" height="3.2" fill="#b3271e"/>`;
  if(art==='heavy'){let o=cab()+r(rear-10,railY-13,x0-26-rear+10,10,wood);for(let x=rear-8;x<x0-28;x+=11)o+=r(x,railY-30,2,17,wood);o+=r(rear-10,railY-30,x0-26-rear+10,2,wood)+r(rear-10,railY-21,x0-26-rear+10,2,wood);return {b:o,twin:1};}
  if(art==='semi'){const tx=rear-22;let o=cab()+r(tx,railY-46,x0-30-tx,46,paint)+r(tx,railY-48,x0-30-tx,3,dark)+r(tx+4,railY-24,x0-38-tx,2,metal,.6)+r(x0-34,railY-4,10,4,dark);return {b:o,wx:[tx+14]};}
  if(art==='bus'){const xa=rear-6;let o=r(xa,railY-34,x0-xa,34,paint)+wins(xa,x0-2,railY-30,13,5)+r(xa,railY-14,x0-xa,2,metal,.7);
    // империал: лестница сзади, скамьи и поручень наверху
    o+=r(xa-2,railY-37,x0-xa+6,3,dark)+`<path d="M${xa+2},${railY-37} v-13 M${x0},${railY-37} v-13 M${xa+2},${railY-50} H${x0}" stroke="${dark}" stroke-width="1.6" fill="none"/>`;for(let x=xa+10;x<x0-8;x+=14)o+=r(x,railY-46,8,9,leather);
    o+=`<path d="M${xa-2},${railY} l-7,-10 v-27" stroke="${dark}" stroke-width="2" fill="none"/>`+driver(x0+6,railY-28);return {b:o};}
  if(art==='coach'){const xa=rear-8;let o=`<path d="M${xa},${railY} V${railY-30} Q${xa+2},${railY-40} ${xa+14},${railY-40} H${x0-6} Q${x0},${railY-38} ${x0},${railY-28} V${railY}Z" fill="${paint}"/>`+wins(xa+2,x0-2,railY-35,13,6)+r(xa,railY-18,x0-xa,2,metal,.8)+r(xa+10,railY-45,x0-xa-30,4,dark)+r(xa+14,railY-49,22,4,wood)+r(xa+40,railY-49,16,4,leather);return {b:o};}
  if(art==='school'){const xa=rear;let o=r(xa,railY-38,x0-xa,38,paint)+r(xa-1,railY-40,x0-xa+2,3,dark)+wins(xa,x0-2,railY-33,12,5)+r(xa,railY-16,x0-xa,3,dark,.8);return {b:o};}
  if(art==='fire'){let o=r(rear-2,railY-16,x0-rear+2,16,paint)+r(x0-22,railY-22,22,6,paint)+driver(x0-12,railY-36)+driver(x0-34,railY-30);
    o+=`<path d="M${rear-8},${railY-30} H${x0-30} M${rear-8},${railY-36} H${x0-30}" stroke="${wood}" stroke-width="1.8"/>`;for(let x=rear-4;x<x0-32;x+=8)o+=`<line x1="${x}" y1="${railY-36}" x2="${x}" y2="${railY-30}" stroke="${wood}" stroke-width="1.2"/>`;
    o+=`<circle cx="${rear+16}" cy="${railY-22}" r="7" fill="${metal}" stroke="${dark}" stroke-width="1.2"/><circle cx="${rear+16}" cy="${railY-22}" r="2.5" fill="${dark}"/>`+r(rear+30,railY-26,18,10,metal)+`<circle cx="${x0-2}" cy="${railY-30}" r="3.4" fill="${metal}" stroke="${dark}" stroke-width="1"/>`;return {b:o};}
  if(art==='amb'||art==='mail'){const xa=rear;let o=r(xa,railY-44,x0-18-xa,44,art==='amb'?'#ece8dc':paint)+r(xa,railY-46,x0-16-xa,3,dark)+r(x0-18,railY-40,18,3,dark)+r(x0-18,railY-16,18,16,art==='amb'?'#ece8dc':paint)+driver(x0-9,railY-30);
    o+=art==='amb'?cross((xa+x0-18)/2,railY-24)+r(xa+6,railY-38,12,8,glass,.8):r(xa+10,railY-30,22,14,'#f4f1e8')+`<path d="M${xa+10},${railY-30} l11,8 l11,-8" stroke="${dark}" stroke-width="1.4" fill="none"/>`;return {b:o};}
  if(art==='mamb'){const xa=rear-2;let o=cab()+`<path d="M${xa},${railY} V${railY-30} Q${(xa+x0-26)/2},${railY-46} ${x0-26},${railY-30} V${railY}Z" fill="#8c8a6e"/>`+cross((xa+x0-26)/2,railY-20);return {b:o};}
  if(art==='tank'){const xa=rear-4,xb=x0-27;let o=cab()+`<rect x="${xa}" y="${railY-30}" width="${xb-xa}" height="28" rx="13" fill="${paint}"/>`+r(xa+10,railY-30,2,28,dark,.35)+r(xb-12,railY-30,2,28,dark,.35)+r((xa+xb)/2-5,railY-35,10,6,metal)+r(xa+6,railY-18,xb-xa-12,2,metal,.6);return {b:o,twin:1};}
  if(art==='dump'){const xa=rear-6,xb=x0-27;let o=cab()+`<path d="M${xa},${railY-26} L${xb},${railY-14} V${railY-2} H${xa+6}Z" fill="${paint}"/><path d="M${xa+4},${railY-25} q14,-13 30,-3 q10,-6 ${xb-xa-40},9z" fill="#8a7a5c"/>`+`<line x1="${xb-10}" y1="${railY-2}" x2="${xb-24}" y2="${railY-18}" stroke="${metal}" stroke-width="3"/>`;return {b:o,twin:1};}
  if(art==='refuse'){const xa=rear-4,xb=x0-27;let o=cab()+`<path d="M${xa},${railY} V${railY-22} Q${xa},${railY-36} ${xa+16},${railY-36} H${xb-10} Q${xb},${railY-36} ${xb},${railY-26} V${railY}Z" fill="${paint}"/>`;for(let x=xa+10;x<xb-14;x+=20)o+=r(x,railY-32,14,10,dark,.5);o+=r(xa,railY-14,xb-xa,2,metal,.6);return {b:o,twin:1};}
  if(art==='taxi'){const ww=(W-14)/2;let o=r(rear+2,railY-46,W-2,46,paint)+r(rear,railY-48,W+2,4,dark)+r(rear+6,railY-40,ww,16,glass,.85)+r(rear+10+ww,railY-40,ww-2,16,glass,.85);
    for(let x=rear+2,i=0;x<x0-5;x+=5,i++)o+=r(x,railY-21,5,3,i%2?'#f4f1e8':'#e3b524')+r(x,railY-18,5,3,i%2?'#e3b524':'#f4f1e8');o+=r(x0-9,railY-56,7,8,'#b3271e');return {b:o};}
  if(art==='staff'){let o=`<path d="M${rear},${railY} L${rear},${railY-16} Q${rear},${railY-20} ${rear+4},${railY-20} L${x0},${railY-18} L${x0},${railY}Z" fill="#6f6f54"/>`+`<path d="M${rear+18},${railY-20} v-12 q0,-3 3,-3 h10 q3,0 3,3 v12z" fill="${leather}"/><path d="M${x0-30},${railY-19} v-13 q0,-3 3,-3 h10 q3,0 3,3 v13z" fill="${leather}"/>`+driver(x0-16,railY-33)+driver(rear+26,railY-33)
      +`<circle cx="${rear-4}" cy="${railY-14}" r="9" fill="${dark}"/><circle cx="${rear-4}" cy="${railY-14}" r="4" fill="${metal}"/><line x1="${x0+3}" y1="${railY-18}" x2="${x0+3}" y2="${railY-40}" stroke="${dark}" stroke-width="1.4"/><path d="M${x0+3},${railY-40} h11 l-3,3.5 l3,3.5 h-11z" fill="#b3271e"/>`;return {b:o};}
  if(art==='armored'){const xa=rear-4,c='#6b6d58';let o=`<path d="M${xa},${railY+2} V${railY-24} L${xa+10},${railY-34} H${x0-4} L${front-10},${railY-22} L${front-4},${railY-12} V${railY+2}Z" fill="${c}"/>`+`<rect x="${xa+26}" y="${railY-50}" width="30" height="17" rx="5" fill="${c}" stroke="${dark}" stroke-width="1"/><rect x="${xa+54}" y="${railY-44}" width="22" height="3" fill="${dark}"/>`
      +r(x0-18,railY-28,12,3,dark)+r(xa+8,railY-26,10,3,dark);for(let x=xa+8;x<front-12;x+=12)o+=`<circle cx="${x}" cy="${railY-6}" r="1.1" fill="${dark}"/>`;return {b:o,nohood:1};}
  if(art==='tractor'){const RR=R*1.75,rcx=rx+8,fcx=fx-6,fr=R*0.72,sp=(cx,cy,rr,n)=>{let o=`<circle cx="${cx}" cy="${cy}" r="${rr}" fill="none" stroke="${dark}" stroke-width="5"/><circle cx="${cx}" cy="${cy}" r="${rr}" fill="none" stroke="#b3271e" stroke-width="1.6"/><g class="spin" style="transform-origin:${cx}px ${cy}px">`;for(let i=0;i<n;i++){const a=i/n*6.283;o+=`<line x1="${cx}" y1="${cy}" x2="${(cx+Math.cos(a)*rr).toFixed(1)}" y2="${(cy+Math.sin(a)*rr).toFixed(1)}" stroke="#b3271e" stroke-width="1.6"/>`;}return o+`</g><circle cx="${cx}" cy="${cy}" r="3.5" fill="${metal}"/>`;};
    let o=r(rcx+6,railY-20,front-rcx-14,22,paint)+r(front-10,railY-22,6,26,metal)+r(rcx+34,railY-38,3,18,dark)+`<path d="M${rcx-6},${railY-24} q2,-8 12,-6 v10z" fill="${leather}"/>`+driver(rcx+2,railY-38)+`<line x1="${rcx+12}" y1="${railY-26}" x2="${rcx+24}" y2="${railY-20}" stroke="${dark}" stroke-width="2"/>`;
    return {b:o,w:sp(rcx,GY-RR,RR,12)+sp(fcx,GY-fr,fr,8),nohood:1};}
  if(art==='crawler'||art==='ltank'){const xa=rear-6,xb=front-6,ty=GY-22,c=art==='ltank'?'#6b6d58':paint;
    let w=`<rect x="${xa}" y="${ty}" width="${xb-xa}" height="22" rx="11" fill="${dark}"/><rect x="${xa+3}" y="${ty+3}" width="${xb-xa-6}" height="16" rx="8" fill="#3a3c42"/>`;for(let x=xa+12;x<xb-8;x+=15)w+=`<circle cx="${x}" cy="${ty+11}" r="5.5" fill="${dark}"/><circle cx="${x}" cy="${ty+11}" r="2" fill="${metal}"/>`;
    for(let x=xa+6;x<xb-4;x+=7)w+=`<rect x="${x}" y="${ty-1}" width="3" height="2" fill="${metal}" opacity=".6"/>`;
    let o;if(art==='crawler')o=r(xa+34,ty-22,xb-xa-44,22,c)+r(xb-14,ty-24,6,26,metal)+r(xa+60,ty-38,3,16,dark)+`<path d="M${xa+6},${ty-40} H${xa+40} M${xa+8},${ty-40} V${ty} M${xa+38},${ty-40} V${ty-20}" stroke="${dark}" stroke-width="2" fill="none"/>`+r(xa+4,ty-43,40,4,c)+driver(xa+22,ty-24);
    else o=`<path d="M${xa+4},${ty+2} L${xa+12},${ty-18} H${xb-22} L${xb-6},${ty-4} V${ty+2}Z" fill="${c}"/>`+`<rect x="${xa+38}" y="${ty-36}" width="28" height="19" rx="6" fill="${c}" stroke="${dark}" stroke-width="1"/><rect x="${xa+64}" y="${ty-30}" width="24" height="4" fill="${dark}"/>`+r(xa+46,ty-40,10,5,c)+`<path d="M${xa+2},${ty+12} l-16,-4 l2,-6z" fill="${dark}"/>`;
    return {b:o,w,nohood:1};}
  return null;}
function carSVG(md,opt={}){
  const p=parts(md),hp=p.e.hp,ei=hp<=3?0:hp<=8?1:hp<=16?2:hp<=25?3:hp<=40?4:hp<=60?5:7,cy=p.c.y,ci=cy<1896?0:cy<1902?1:cy<1910?2:cy<1920?3:4,bid=({b9:'b4',b11:'b4',b10:'b1'})[p.b.id]||p.b.id;
  const paint=md.paint||'#1b1d22',dark='#15161a',leather='#4a2f1f',glass='#a9c6db';
  const hoodL=[0,16,24,30,38,44,40,50][ei],R=[17,17,15,14,13][ci],GY=94,wy=GY-R,railY=wy-3;
  const truck=!!p.b.truck,rx=48,wb=62+hoodL*0.9+((bid==='b3'||bid==='b4'||bid==='b5'||bid==='b9'||bid==='b11')?10:0)+(truck?18:0),fx=rx+wb;
  const front=fx+14,x0=front-hoodL-4,rear=rx-22;
  const metal=ci>=4?'#cfd3da':(md.t==='t0'?'#34363c':'#c9a24a');
  const hoodH=hoodL?12+(ei>=4?4:0)+(ei>=7?2:0):0;
  let b='',KA=null;
  if(ci>=2&&!(p.b.trk||p.b.farm)){const fen=cx=>`<path d="M${cx-R-4},${wy+2} Q${cx-R-4},${wy-R-6} ${cx},${wy-R-6} Q${cx+R+4},${wy-R-6} ${cx+R+4},${wy+2} L${cx+R+1},${wy+2} Q${cx+R},${wy-R-2} ${cx},${wy-R-2} Q${cx-R},${wy-R-2} ${cx-R-1},${wy+2}Z" fill="${ci>=4?paint:dark}"/>`;b+=fen(rx)+fen(fx);if(!truck)b+=`<rect x="${rx+R+2}" y="${wy-2}" width="${fx-rx-2*R-4}" height="3" fill="${dark}"/>`;}
  b+=`<rect x="${rear}" y="${railY-2}" width="${front-rear}" height="4" fill="${dark}"/>`;
  const driver=(x,y)=>`<rect x="${x-5}" y="${y}" width="10" height="11" rx="3" fill="#3c3f47"/><circle cx="${x}" cy="${y-4}" r="4.2" fill="#e0b894"/><path d="M${x-5},${y-5} q5,-6 10,0 z" fill="${dark}"/>`;
  if(bid==='b1'){b+=`<rect x="${rear+4}" y="${railY-14}" width="${x0-rear-4}" height="14" rx="2" fill="${paint}"/><path d="M${rear+6},${railY-14} v-18 q0,-4 4,-4 h14 q4,0 4,4 v18z" fill="${leather}"/>`+driver(rear+22,railY-30)+`<line x1="${x0-2}" y1="${railY-14}" x2="${x0-10}" y2="${railY-30}" stroke="${dark}" stroke-width="2"/><ellipse cx="${x0-10}" cy="${railY-30}" rx="4" ry="1.6" fill="${dark}"/>`;}
  else if(bid==='b2'){b+=`<path d="M${x0},${railY} L${rear+10},${railY} Q${rear-2},${railY} ${rear-2},${railY-12} Q${rear-2},${railY-26} ${rear+12},${railY-26} L${x0},${railY-18}Z" fill="${paint}"/><path d="M${rear+4},${railY-24} v-10 q0,-3 3,-3 h12 q3,0 3,3 v10z" fill="${leather}"/><path d="M${x0-26},${railY-18} v-14 q0,-3 3,-3 h10 q3,0 3,3 v14z" fill="${leather}"/>`+driver(x0-14,railY-32)+`<line x1="${x0-2}" y1="${railY-18}" x2="${x0-8}" y2="${railY-32}" stroke="${dark}" stroke-width="2"/>`;}
  else if(bid==='b3'){b+=`<path d="M${rear},${railY} L${rear},${railY-16} Q${rear},${railY-20} ${rear+4},${railY-20} L${x0},${railY-18} L${x0},${railY}Z" fill="${paint}"/><rect x="${rear-3}" y="${railY-30}" width="18" height="10" rx="4" fill="#2b2620"/><path d="M${rear+18},${railY-20} v-12 q0,-3 3,-3 h10 q3,0 3,3 v12z" fill="${leather}"/><path d="M${x0-30},${railY-19} v-13 q0,-3 3,-3 h10 q3,0 3,3 v13z" fill="${leather}"/>`+driver(x0-16,railY-33)+`<rect x="${x0-3}" y="${railY-40}" width="3" height="22" fill="${glass}" opacity=".55"/><rect x="${x0-3}" y="${railY-40}" width="3" height="2" fill="${metal}"/>`;}
  else if(bid==='b4'){const ww=(x0-rear-14)/2;b+=`<rect x="${rear+2}" y="${railY-46}" width="${x0-rear-2}" height="46" rx="2" fill="${paint}"/><rect x="${rear}" y="${railY-48}" width="${x0-rear+2}" height="4" rx="1" fill="${dark}"/><rect x="${rear+6}" y="${railY-40}" width="${ww}" height="16" fill="${glass}" opacity=".85"/><rect x="${rear+10+ww}" y="${railY-40}" width="${ww-2}" height="16" fill="${glass}" opacity=".85"/><rect x="${rear+2}" y="${railY-20}" width="${x0-rear-2}" height="2" fill="${metal}" opacity=".7"/>`;}
  else if(bid==='b5'){b+=`<path d="M${rear},${railY} L${rear},${railY-18} Q${rear+2},${railY-40} ${rear+24},${railY-42} L${x0-14},${railY-42} Q${x0-3},${railY-40} ${x0},${railY-20} L${x0},${railY}Z" fill="${paint}"/><path d="M${rear+8},${railY-22} Q${rear+10},${railY-36} ${rear+26},${railY-37} L${(rear+x0)/2},${railY-37} L${(rear+x0)/2},${railY-22}Z" fill="${glass}" opacity=".85"/><path d="M${(rear+x0)/2+3},${railY-22} L${(rear+x0)/2+3},${railY-37} L${x0-15},${railY-37} Q${x0-6},${railY-35} ${x0-4},${railY-22}Z" fill="${glass}" opacity=".85"/><rect x="${rear}" y="${railY-16}" width="${x0-rear}" height="2" fill="${metal}" opacity=".8"/>`;}
  else if(bid==='b6'){b+=`<rect x="${rear}" y="${railY-44}" width="${x0-18-rear}" height="44" rx="2" fill="${paint}"/><rect x="${rear+6}" y="${railY-34}" width="${x0-30-rear}" height="3" fill="${metal}"/><rect x="${x0-18}" y="${railY-40}" width="18" height="3" fill="${dark}"/><rect x="${x0-18}" y="${railY-16}" width="18" height="16" fill="${paint}"/>`+driver(x0-9,railY-30);}
  else if(p.b.art&&(KA=kindArt(p.b.art,{rear,x0,railY,front,paint,dark,glass,metal,driver,R,wy,GY,rx,fx,leather}))){b+=KA.b;}
  else{const big=bid==='b8';b+=`<rect x="${x0-24}" y="${railY-42}" width="24" height="42" rx="2" fill="${paint}"/><rect x="${x0-19}" y="${railY-36}" width="14" height="13" fill="${glass}" opacity=".85"/><rect x="${rear-(big?8:4)}" y="${railY-12}" width="${x0-26-rear+(big?8:4)}" height="9" fill="#6b4a2b"/>`;for(let x=rear-(big?6:2);x<x0-28;x+=12)b+=`<rect x="${x}" y="${railY-24}" width="2" height="12" fill="#6b4a2b"/>`;b+=`<rect x="${rear-(big?8:4)}" y="${railY-24}" width="${x0-26-rear+(big?8:4)}" height="2" fill="#6b4a2b"/>`;}
  if(KA&&KA.nohood){}
  else if(hoodL){b+=`<path d="M${x0},${railY} L${x0},${railY-hoodH} L${front-8},${railY-hoodH+2} Q${front-4},${railY-hoodH+3} ${front-4},${railY-hoodH+6} L${front-4},${railY}Z" fill="${paint}"/>`;if(ei>=3)for(let i=0;i<Math.min(6,ei);i++)b+=`<rect x="${x0+6+i*5}" y="${railY-hoodH+5}" width="2" height="${hoodH-9}" fill="${dark}" opacity=".45"/>`;b+=`<rect x="${front-5}" y="${railY-hoodH}" width="5" height="${hoodH}" rx="1" fill="${metal}"/><circle cx="${front+1}" cy="${railY-hoodH+3}" r="3.2" fill="${metal}" stroke="${dark}" stroke-width="1"/>`;}
  else b+=`<circle cx="${x0+2}" cy="${railY-16}" r="3" fill="${metal}" stroke="${dark}" stroke-width="1"/>`;
  const wheel=cx=>{let w=`<circle cx="${cx}" cy="${wy}" r="${R}" fill="${dark}"/>`;if(md.t==='t2'&&ci>=3)w+=`<circle cx="${cx}" cy="${wy}" r="${R-3}" fill="none" stroke="#e8e6df" stroke-width="2.2"/>`;
    if(ci>=4)w+=`<circle cx="${cx}" cy="${wy}" r="${R-5}" fill="#2e3036"/><g class="spin" style="transform-origin:${cx}px ${wy}px"><circle cx="${cx}" cy="${wy}" r="${R-8}" fill="none" stroke="${metal}" stroke-width="1.2" stroke-dasharray="3 3"/></g><circle cx="${cx}" cy="${wy}" r="3" fill="${metal}"/>`;
    else{const wood=ci<=1?'#caa46b':'#8e6f45';w+=`<circle cx="${cx}" cy="${wy}" r="${R-3}" fill="none" stroke="${wood}" stroke-width="2"/><g class="spin" style="transform-origin:${cx}px ${wy}px">`;const n=ci<=1?12:10;for(let i=0;i<n;i++){const a=i/n*Math.PI*2;w+=`<line x1="${cx}" y1="${wy}" x2="${(cx+Math.cos(a)*(R-3)).toFixed(1)}" y2="${(wy+Math.sin(a)*(R-3)).toFixed(1)}" stroke="${wood}" stroke-width="1.4"/>`;}w+=`</g><circle cx="${cx}" cy="${wy}" r="3" fill="${metal}"/>`;}return w;};
  const wheels=KA&&KA.w!==undefined?KA.w:wheel(fx)+(bid==='b8'||(KA&&KA.twin)?wheel(rx-6):'')+wheel(rx)+(KA&&KA.wx?KA.wx.map(wheel).join(''):'');
  const shadow=`<ellipse cx="${(rx+fx)/2}" cy="${GY+2}" rx="${wb/2+34}" ry="3" fill="#000" opacity=".28"/>`;
  const xmlns=opt.standalone?' xmlns="http://www.w3.org/2000/svg" width="220" height="100"':'';
  return `<svg${xmlns} viewBox="0 0 220 100" class="car ${opt.anim?'anim':''}" role="img" aria-label="${esc(md.name||'Автомобиль')}">${shadow}<g class="body">${b}</g>${wheels}</svg>`;
}
function portraitSVG(key){
  const P=PIONEERS[key],init=P.name.split(' ').map(w=>w[0]).join('');
  const hue={us:'#6a5840',de:'#5b5a52',fr:'#6b5a48',uk:'#5a5a4a',it:'#6a5244',ru:'#5e4c3e'}[P.c]||'#5a5048';
  const beard=P.beard?`<path d="M26,44 Q32,58 38,44 Q36,50 32,51 Q28,50 26,44Z" fill="#241c14"/>`:`<path d="M27,44 Q32,47 37,44 Q34,46 32,46 Q30,46 27,44Z" fill="#241c14"/>`;
  return `<svg viewBox="0 0 64 80" aria-hidden="true"><defs><radialGradient id="pg${key}" cx="50%" cy="40%" r="65%"><stop offset="0" stop-color="#d9c8a2"/><stop offset="1" stop-color="${hue}"/></radialGradient></defs>
  <ellipse cx="32" cy="40" rx="30" ry="38" fill="#d9ab52"/><ellipse cx="32" cy="40" rx="27" ry="35" fill="url(#pg${key})"/>
  <path d="M10,74 Q14,56 32,54 Q50,56 54,74 Q44,78 32,78 Q20,78 10,74Z" fill="#241c14"/><path d="M28,54 L32,64 L36,54Z" fill="#e9e1cf"/>
  <ellipse cx="32" cy="38" rx="11" ry="14" fill="#3a2e22"/>${beard}<path d="M21,32 Q22,20 32,20 Q42,20 43,32 Q38,26 32,26 Q26,26 21,32Z" fill="#1d1610"/>
  <text x="32" y="12" text-anchor="middle" font-family="Big Shoulders Display,Impact,sans-serif" font-weight="800" font-size="9" fill="#1c1406">${init}</text></svg>`;
}
function miniCar(x,color,i){return `<g class="roadcar" style="animation-delay:-${(i*2.1).toFixed(1)}s"><g transform="translate(${x},0)"><rect x="0" y="137" width="22" height="7" rx="2" fill="${color}"/><rect x="5" y="131" width="11" height="7" rx="2" fill="${color}"/><circle class="w" cx="5" cy="145" r="3" fill="#15161a"/><circle class="w" cx="17" cy="145" r="3" fill="#15161a"/></g></g>`;}
function factorySVG(s){
  const L=s.last,e=econ(s.y,s.m,s.country),winter=s.m===11||s.m<=1,war=e.war,crash=e.tone==='bad'&&!war;
  const sky=war?['#4c5561','#8e959d']:crash?['#58606c','#a0a7b0']:winter?['#6f8fb0','#cfdce8']:['#3f78b3','#aacbe6'];
  const ground=winter?'#dce5ec':'#56703f',late=s.y>=1920,brick=late?'#9aa0a6':'#8a4b3a',roofC=late?'#5d636b':'#4a3a33';
  const W=360,gy=126,capE=capEff(s),halls=clamp(Math.round(1+Math.log10(Math.max(1,capE))*1.3),1,6),extra=0,busy=L?clamp(capUtil(s),0,1):0.3,conv=techLv(s,'line')>=2;
  let o=`<svg viewBox="0 0 ${W} 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Завод компании"><defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs><rect width="${W}" height="160" fill="url(#sk)"/>`;
  if(!war)for(let i=0;i<3;i++)o+=`<g class="cloud" style="animation-delay:-${i*14}s"><ellipse cx="${60+i*110}" cy="${22+i*9}" rx="26" ry="7" fill="#fff" opacity=".7"/><ellipse cx="${74+i*110}" cy="${17+i*9}" rx="16" ry="7" fill="#fff" opacity=".7"/></g>`;
  o+=`<circle cx="300" cy="${winter?36:28}" r="12" fill="${war?'#c7c9c9':'#f6e7b0'}" opacity="${war?.35:.9}"/>`;
  const nb=6+Math.floor(T(s)/4);for(let i=0;i<nb;i++){const h=10+((i*37)%23)+(late?(i%3)*8:0),x=i*W/nb;o+=`<rect x="${x.toFixed(0)}" y="${gy-h-6}" width="${(W/nb-4).toFixed(0)}" height="${h}" fill="#000" opacity=".12"/>`;}
  o+=`<rect y="${gy}" width="${W}" height="34" fill="${ground}"/><rect y="${gy+12}" width="${W}" height="14" fill="#3b3f45"/>`;
  for(let x=6;x<W;x+=24)o+=`<rect x="${x}" y="${gy+18}" width="12" height="2" fill="#e5e0c8" opacity=".5"/>`;
  o+=`<rect x="8" y="${gy-40}" width="48" height="40" fill="${brick}"/><rect x="24" y="${gy-56}" width="16" height="16" fill="${brick}"/><polygon points="22,${gy-56} 32,${gy-66} 42,${gy-56}" fill="${roofC}"/><circle cx="32" cy="${gy-48}" r="4.5" fill="#f3ead0"/><line x1="32" y1="${gy-48}" x2="32" y2="${gy-51}" stroke="#222"/><line x1="32" y1="${gy-48}" x2="34" y2="${gy-48}" stroke="#222"/>`;
  for(let r=0;r<2;r++)for(let c=0;c<4;c++)o+=`<rect x="${13+c*11}" y="${gy-34+r*14}" width="6" height="8" fill="#f2d98a" opacity=".85"/>`;
  o+=`<line x1="32" y1="${gy-66}" x2="32" y2="${gy-80}" stroke="#ddd"/><rect x="32" y="${gy-80}" width="12" height="7" fill="#d9ab52"/>`;
  if(winter)o+=`<polygon points="22,${gy-56} 32,${gy-66} 42,${gy-56} 40,${gy-58} 32,${gy-63} 24,${gy-58}" fill="#fff"/>`;
  for(let i=0;i<halls;i++){const x=64+i*38,hw=34,hh=30;o+=`<rect x="${x}" y="${gy-hh}" width="${hw}" height="${hh}" fill="${brick}"/>`;
    if(conv){let d=`M${x},${gy-hh}`;for(let k=0;k<3;k++){const a=x+k*hw/3;d+=` L${a},${gy-hh-10} L${a+hw/3},${gy-hh}`;}o+=`<path d="${d}Z" fill="${roofC}"/>`;for(let k=0;k<3;k++)o+=`<rect x="${x+k*hw/3+1}" y="${gy-hh-9}" width="2" height="8" fill="#cfe2f1" opacity=".7"/>`;}
    else o+=`<polygon points="${x-2},${gy-hh} ${x+hw/2},${gy-hh-11} ${x+hw+2},${gy-hh}" fill="${roofC}"/>`;
    if(winter)o+=`<rect x="${x}" y="${gy-hh-2}" width="${hw}" height="2" fill="#fff"/>`;
    for(let k=0;k<3;k++)o+=`<rect x="${x+4+k*10}" y="${gy-hh+7}" width="6" height="8" fill="${busy>0.05?'#f2d98a':'#39424c'}" opacity=".85"/>`;
    o+=`<rect x="${x+12}" y="${gy-12}" width="10" height="12" fill="#2a2b30"/>`;
    if(i%2===0){const cx=x+hw-7,top=gy-hh-30;o+=`<rect x="${cx}" y="${top}" width="5" height="30" fill="${late?'#6c7178':'#7a3b2c'}"/>`;if(busy>0.05)for(let k=0;k<3;k++)o+=`<circle class="smoke" cx="${cx+2.5}" cy="${top-3}" r="${4+busy*3}" fill="${war?'#555':'#d8dde2'}" style="animation-delay:-${(k*1.05).toFixed(2)}s"/>`;}}
  const wx=W-64,stock=s.models.reduce((a,m)=>a+m.stock,0);
  o+=`<path d="M${wx},${gy} L${wx},${gy-22} Q${wx+28},${gy-38} ${wx+56},${gy-22} L${wx+56},${gy}Z" fill="${late?'#7f868d':'#6d5d4f'}"/>`;
  if(winter)o+=`<path d="M${wx},${gy-22} Q${wx+28},${gy-38} ${wx+56},${gy-22} Q${wx+28},${gy-35} ${wx},${gy-22}Z" fill="#fff"/>`;
  o+=`<text x="${wx+28}" y="${gy-7}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" fill="#fff">СКЛАД ${fmtN(stock)}</text>`;
  const color=(s.models.find(m=>m.status==='prod')||{}).paint||'#1b1d22',n=L?Math.min(5,Math.ceil(5*L.sold/Math.max(1,capE))):0;
  for(let i=0;i<n;i++)o+=miniCar(0,i%2?'#e3d6b4':color,i);
  return o+'</svg>';
}

