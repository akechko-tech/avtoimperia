// 0.31: «Дальше: гонка…» ведёт в саму гонку; КБ сворачивается; оснащение — свёрнуто и дорогое: node test/ui31.js
require('./harness.js')(`
Math.random=(()=>{let a=5;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
newGame('renault','fr','Рено','normal');G.cash=5e5;
// месяц, когда открыта запись на гонку
let rc=null;for(let k=0;k<40&&!rc;k++){G.pending=[];step();rc=RACES.find(r=>raceOpen(r,G)&&raceEligible(r,G)&&!raceWarBlocked(r,G)&&!G.cres[r.key]&&G.raceDone[r.key]===undefined);}
ok(!!rc,'открыта запись: «'+(rc&&rc.name)+'» ('+dstr(G)+')');
const NS=nextStep(G);ok(NS.rk===rc.key,'«Дальше» знает гонку: '+NS.text);
const html=empireStrip(G);ok(new RegExp('data-act="raceTo" data-k="'+rc.key+'"').test(html),'кнопка «Дальше» наверху ведёт в гонку (raceTo)');
RS=null;G.pending=[];ACT.raceTo({k:rc.key});ok(RS&&RS.key===rc.key,'нажали — открылась запись на эту гонку');
// КБ сворачивается, оснащение — одной строкой
G.y=1913;G.rd.lvl=5;G.ui=G.ui||{};G.ui.f={};
let h=rdCardHTML(G);ok(/data-k="rdcard"/.test(h)&&/Оснащение бюро/.test(h)&&!/data-act="kitBuy"/.test(h),'КБ: оснащение свёрнуто в строку');
setOpen('rdcard',false);h=rdCardHTML(G);ok(/folded/.test(h)&&!/data-act="rdUp"/.test(h),'КБ свёрнута: одна строка — '+(h.match(/card-sum">([^<]*)/)||[])[1]);
setOpen('rdcard',true);setOpen('kitkb',true);h=rdCardHTML(G);ok(/data-act="kitBuy"/.test(h),'развернули оснащение — кнопки покупки');
const tr=KIT_BY.track,c=kitCost(G,tr);ok(c>=100000,'испытательный трек стоит '+money(c)+' (было $9 000)');
ok(kitCost(G,KIT_BY.dyno)>=4000&&kitUp(G,KIT_BY.track)>=1500,'стенд '+money(kitCost(G,KIT_BY.dyno))+', содержание трека '+money(kitUp(G,KIT_BY.track))+' в месяц');
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');
`);
