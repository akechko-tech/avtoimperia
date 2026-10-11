// 0.30: новые вызовы — рекорд горы, конкурс элегантности, экспедиция; вызовы из других стран: node test/chal30.js
require('./harness.js')(`
Math.random=(()=>{let a=17;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
setupRender=()=>{};setupRaceUI=()=>{};auRaceStart=()=>{};auSfx=()=>{};
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
newGame('renault','fr','T','normal');G.cash=1e6;
// играем до 1912 года с помощником, чтобы были модели, дилеры за границей и продажи
G.helper={on:1};for(let k=0;k<12*17&&!G.over;k++){G.pending=[];step();}
ok(!G.over,'партия идёт: '+G.y+', моделей '+G.models.filter(m=>m.status==='prod').length+', дилеры за границей: '+Object.keys(G.dealers||{}).filter(c=>c!==G.country&&G.dealers[c]>0).join(','));
// рекорд горы — зовут только машину, которая тянет подъём (с 0.30): ставим модели мотор и шасси эпохи
{const md=raceCarsFor(G).find(m=>!isTruck(m))||G.models[0],a=aiCarMd(G.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}
let hill=null;for(let t=0;t<60&&!hill;t++){G.m=(G.m+1)%12;const o=offerMatch(G,'record');if(o&&o.C.rc.t==='hill')hill=o;}
ok(!!hill,'рекорд горы: '+(hill?hill.title+' · '+hill.sub:'нет'));
// конкурс элегантности и экспедиция
const e=offerEleg(G);ok(!!e,'конкурс элегантности: '+(e?e.title+' · '+e.sub:'нет'));
const savedY=G.y;G.y=1922;const x=offerExped(G);G.y=savedY;ok(!!x,'экспедиция (1922): '+(x?x.title+' · '+x.sub:'нет'));
// принять и развязать: элегантность
if(e){chalNews(G,e);G.chal.acc=1;chalAccept(G,G.chal);const card=chalCardNew(G,G.chal);ok(/Конкурс элегантности/.test(card),'карточка вызова на доске');const c0=G.cash;G.pending=[];
  const t0=mi(G);while(G.chal&&mi(G)<t0+4){G.pending=[];step();}ok(!G.chal,'смотр прошёл, касса '+(G.cash>c0?'выросла':'уменьшилась'));}
if(x){G.y=1922;chalNews(G,x);G.chal.acc=1;chalAccept(G,G.chal);const aw0=Object.assign({},G.aw);G.pending=[];const t0=mi(G);while(G.chal&&mi(G)<t0+6){G.pending=[];step();}
  ok(!G.chal,'экспедиция завершена; узнаваемость за границей: '+Object.keys(COUNTRIES).filter(c=>c!==G.country).map(c=>c+' '+(aw0[c]||0).toFixed(2)+'→'+(G.aw[c]||0).toFixed(2)).join(', '));}
// вызовы из других стран: среди матчей/рекордов — и чужие площадки, если там дилеры
let foreign=0,tot=0;for(let t=0;t<120;t++){G.m=t%12;['match','record'].forEach(k=>{const o=offerMatch(G,k);if(o){tot++;if(o.C.rc.c!==G.country)foreign++;}});}
ok(tot>0,'матчей и рекордов предложено '+tot+', из них за границей '+foreign);
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');
`);
