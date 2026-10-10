// 0.30: дуэли вживую — экспресс, аэроплан, рысак: node test/dx30.js
require('./harness.js')(`
Math.random=(()=>{let a=5;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
setupRender=()=>{};setupRaceUI=()=>{};auRaceStart=()=>{};auSfx=()=>{};
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
function game(y,c){newGame('renault',c||'fr','T','normal');G.cash=1e6;G.y=y;G.m=5;const md=G.models[0];{const a=aiCarMd(y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}md.b=lastOf(BODIES,y,x=>!x.truck).id;md.status='prod';return md;}
for(const [k,y] of [['train',1912],['plane',1913],['horse',1900]]){
  const md=game(y,k==='plane'?'us':'fr');G.dx=null;let o=null;for(let t=0;t<300&&(!o||o.k!==k);t++)o=dxOffer(G);
  if(!o||o.k!==k){const d=DX_KIND[k];o={k,at:mi(G),stake:500,md:md.id,c:G.country};if(k==='train'){const r=d.route[G.country]||d.route.fr;o.venue=r[0];o.opp=r[1];o.km=r[2];o.trainV=d.opp(y,r);}else{o.venue=d.venue[G.country]||'Ипподром';o.opp=k==='plane'?d.pilot[G.country]||'Бичи':d.horse[G.country]||'рысак';o.km=d.km;}}
  o.acc=1;o.md=md.id;G.dx=o;const rc=dxRc(G,o);ok(rc.dx===k&&rc.t===(k==='train'?'road':'oval'),k+': заезд '+rc.name+' ('+rc.t+', '+rc.terr+')');
  const cash0=G.cash;startRace({rc,mode:'sim',entries:[{drv:'me',md,prep:0,tyre:'hard',gear:0}]});
  ok(!R||R.done,k+': заезд прошёл до конца');ok(!G.dx,k+': дуэль развязана');const ev=G.pending.find(e=>e.kicker==='Дуэль');ok(!!ev,k+': газета — «'+(ev&&ev.title)+'»: '+(ev&&ev.text.slice(0,140)));
  G.pending=[];}
// поезд: путь, переезд, темп
{const md=game(1912,'fr');const d=DX_KIND.train,r=d.route.fr,o={k:'train',at:mi(G),stake:500,md:md.id,c:'fr',venue:r[0],opp:r[1],km:r[2],trainV:d.opp(1912,r),acc:1};G.dx=o;
  const rc=dxRc(G,o);startRace({rc,mode:'drive',entries:[{drv:'me',md,prep:0,tyre:'hard',gear:0}]});const T=R.trk,D=R.dx;
  ok(T.dxRail&&T.dxRail.P.length>100,'рельсы вдоль шоссе: '+(T.dxRail?Math.round(T.dxRail.L)+' м, '+T.dxRail.P.length+' точек':'нет'));
  const rl=T.rails.find(q=>q.duel);ok(!!rl&&T.dxRail.sCross>T.dxRail.sStart,'переезд на '+(rl?Math.round((rl.i-T.startIdx)/(T.finishIdx-T.startIdx)*100):'?')+'% пути');
  let minD=1e9;for(let i=T.startIdx;i<T.finishIdx;i+=3){if(Math.abs(i-rl.i)<40)continue;const p=T.pts[i];for(const q of T.dxRail.P){const dd=Math.hypot(q[0]-p[0],q[2]-p[2]);if(dd<minD)minD=dd;}}
  ok(minD>T.W/2+15,'вдали от переезда рельсы не ближе '+Math.round(minD)+' м к оси шоссе');
  let bad=0;for(let i=0;i<T.n;i++)for(const it of T.spr[i]){if(it.k==='p'||it.t==='rgate'||it.t==='tsign')continue;const p=T.pts[i],nn=T.N[i],x=p[0]+nn[0]*it.off,z=p[2]+nn[1]*it.off;if(Math.abs(it.off)>T.W/2+2&&dxRailNear(T,x,z,4))bad++;}
  ok(bad===0,'на рельсах ничего не стоит (предметов на пути: '+bad+')');
  ok(D&&D.vc>3&&D.T>20,'темп экспресса: крейсерская '+(D?Math.round(D.vc*3.6):0)+' км/ч, время '+(D?Math.round(D.T):0)+' с (пробный заезд '+(D?Math.round(D.tAI):0)+' с ×'+(D?D.f.toFixed(2):0)+')');
  // едем ИИ за игрока: шлагбаум закрывается, когда поезд у переезда
  R.me.player=false;R.t=0.01;let gateMax=0,stopSeen=false;for(let f=0;f<20*600&&R&&!R.done;f++){const dt=1/20;R.t+=dt;R.time+=dt;raceTick(dt);if(!R)break;gateMax=Math.max(gateMax,rl.gate||0);if(f%200===0)console.log('   t',R.time.toFixed(0),'train s',Math.round(D.s),'/',Math.round(D.L),'cross',Math.round(D.cross),'gate',(rl.gate||0).toFixed(2),'me',Math.round(R.me.prog),'v',Math.round(D.v*3.6));if(D.stopLeft!==undefined&&D.stopLeft<D.stopT)stopSeen=true;}
  ok(gateMax>0.9,'шлагбаум на переезде закрывался перед поездом');ok(stopSeen,'поезд стоял у полустанка');
  if(R&&!R.done)finishRace(false);G.pending=[];}
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');
`);
