/* ================= SEASONS: historical championships, standings, AI results, race outcome ================= */
// Гоночный отдел завода: без него можно выставить только серийную или облегчённую машину
const RDEPT=[
  {name:'Нет гоночного отдела',cost:0,up:0,desc:'Можно выставить серийную или облегчённую машину.'},
  {name:'Гоночная мастерская',cost:2500,up:120,desc:'Свои механики, заводской гоночный кузов.'},
  {name:'Заводская команда',cost:7000,up:320,rel:1.04,pit:0.85,prep:0.8,desc:'Надёжность +4%, пит-стопы и смена колёс на 15% быстрее, подготовка на 20% дешевле.'},
  {name:'Гоночный отдел',cost:18000,up:750,rel:1.08,pit:0.7,prep:0.65,pw:1.03,desc:'Надёжность +8%, мощность +3%, пит-стопы на 30% быстрее, подготовка на 35% дешевле.'}];
function teamUpkeep(s){return Math.round(RDEPT[s.rdept||0].up*cpi(s));}
function rdeptCost(s){const n=RDEPT[(s.rdept||0)+1];return n?Math.round(n.cost*cpi(s)/50)*50:0;}
function prepCost(rc,prep,s){return Math.round(racePrize(rc)*PREP[prep].cost*(RDEPT[s.rdept||0].prep||1)/10)*10;}

// Чемпионаты эпохи. Официальные — там, где они были в истории; до них очки считает пресса.
const AIACR_RACES={1925:['indy-1925','x80394-1925','gpacf-1925','itgp-1925'],1926:['indy-1926','gpacf-1926','x81442-1926','bgp1926-1926','itgp-1926'],1927:['indy-1927','gpacf-1927','x87929-1927','itgp-1927','x30443-1927']};
const GBC_IDS=['gb1900','gb1903','gb1904','gb1905'];
const CHAMPS={
  gp:{short:'Сезон',off:false,w:0.5,
    name:y=>y<1906?'Сезон великих гонок':'Сезон Гран-при',title:y=>`Марка сезона ${y} по версии прессы`,
    years:y=>y<=1924||y>=1928,
    has:rc=>rc.host!=='us'&&!['rally','endurance','sprint'].includes(rc.t),
    rules:'Официального чемпионата ещё нет — счёт ведут газеты. За большие гонки 8, 6, 4, 3, 2 и 1 очко, за малые — вдвое меньше. В зачёт идут пять лучших результатов марки.'},
  aiacr:{short:'ЧМ',off:true,w:1,
    name:()=>'Чемпионат мира AIACR',title:y=>`Чемпион мира AIACR ${y}`,
    years:y=>y>=1925&&y<=1927,
    has:rc=>(AIACR_RACES[rc.y]||[]).includes(rc.key),
    rules:'Первый чемпионат мира — для заводов, не для гонщиков. Очки наоборот: победа — 1, второе место — 2, третье — 3, финиш — 4, сход — 5, неявка — 6. Меньше — лучше, в зачёт идут три лучших результата. Обязательны старт в Гран-при Италии и не меньше трёх стартов.'},
  aaa:{short:'AAA',off:true,w:0.5,
    name:()=>'Национальный чемпионат AAA',title:y=>`Чемпион AAA ${y}`,
    years:y=>(y>=1909&&y<=1916)||y>=1920,
    has:rc=>rc.host==='us'&&['oval','road','circuit'].includes(rc.t),
    rules:'Американская автомобильная ассоциация начисляет очки по дистанции: победа в 500-мильной гонке — 1000 очков, в 250-мильной — 500. Очки получают первые десять доехавших до финиша. Сезоны до 1916 года историки восстановили задним числом.'}
};
const champKey=(id,y)=>id+'-'+y;
function champRaces(id,y){const C=CHAMPS[id];return C.years(y)?RACES.filter(r=>r.y===y&&C.has(r)):[];}
function champsOf(y){return Object.keys(CHAMPS).filter(id=>champRaces(id,y).length>0);}
function raceChamps(rc){return Object.keys(CHAMPS).filter(id=>CHAMPS[id].years(rc.y)&&CHAMPS[id].has(rc));}
function champValue(id,rc,place,dnf){
  if(id==='aiacr')return dnf?5:place<=3?place:4;
  if(dnf)return 0;
  if(id==='aaa')return place>10?0:Math.round(2*rc.km/1.609*[1,.8,.7,.6,.5,.4,.3,.2,.1,.05][place-1]/10)*10;
  return place>6?0:[8,6,4,3,2,1][place-1]*(rc.major?1:0.5);
}
// order — машины в порядке финиша (сошедшие в конце): {name, dnf}. Марка получает очки за лучшую машину.
function champRecord(s,rc,order){
  raceChamps(rc).forEach(id=>{
    const k=champKey(id,rc.y),ch=s.season[k]=s.season[k]||{id,y:rc.y,rows:{},races:[],done:false};
    if(ch.races.includes(rc.key))return;ch.races.push(rc.key);
    const seen=new Set();let pos=0;
    order.forEach(o=>{pos++;if(!o.name||o.name==='Частная машина'||seen.has(o.name))return;seen.add(o.name);
      (ch.rows[o.name]=ch.rows[o.name]||{r:{}}).r[rc.key]=champValue(id,rc,pos,!!o.dnf);});
  });
}
function champTotal(id,ch,row){
  if(id==='aiacr')return ch.races.map(k=>row.r[k]!==undefined?row.r[k]:6).sort((a,b)=>a-b).slice(0,3).reduce((a,b)=>a+b,0);
  const v=Object.values(row.r);if(id==='gp')v.sort((a,b)=>b-a).splice(5);
  return v.reduce((a,b)=>a+b,0);
}
function champEligible(id,ch,row){if(id!=='aiacr')return true;const it=ch.races.find(k=>k.startsWith('itgp-'));return (!it||row.r[it]!==undefined)&&Object.keys(row.r).length>=Math.min(3,ch.races.length);}
function champTable(s,id,y){
  const ch=s.season[champKey(id,y)];if(!ch)return [];
  const rows=Object.keys(ch.rows).map(n=>{const row=ch.rows[n],v=Object.values(row.r);return {n,pts:champTotal(id,ch,row),el:champEligible(id,ch,row),starts:v.length,wins:ch.races.filter(k=>id==='aiacr'?row.r[k]===1:row.r[k]===champValue(id,RACES.find(r=>r.key===k),1,false)&&row.r[k]>0).length,you:n===s.company};});
  const inv=id==='aiacr';
  rows.sort((a,b)=>(b.el-a.el)||(inv?a.pts-b.pts:b.pts-a.pts)||(b.wins-a.wins)||(b.starts-a.starts));
  return rows;
}
function fmtPts(id,v){return id==='aiacr'?String(v):Number.isInteger(v)?String(v):v.toFixed(1).replace('.',',');}
function champFinish(s,id,y){
  const k=champKey(id,y),ch=s.season[k];if(!ch||ch.done)return;
  if(!champRaces(id,y).every(r=>s.cres[r.key]))return;
  ch.done=true;const C=CHAMPS[id],tb=champTable(s,id,y),win=tb.find(r=>r.el&&(id==='aiacr'||r.pts>0));
  ch.win=win?win.n:'';const me=tb.findIndex(r=>r.you);
  if(win&&win.you){
    s.titles.push({y,id,name:C.title(y),w:C.w});s.titleBoost=mi(s)+12;s.rep=clamp(s.rep+(C.off?8:5)*bn('raceRep'),0,100);
    const second=tb.find(r=>!r.you&&r.el);
    pushEvent({kicker:'Спорт',title:id==='aiacr'?`«${s.company}» — чемпион мира!`:id==='aaa'?`«${s.company}» — чемпион Америки!`:`«${s.company}» — марка сезона!`,
      deck:`${C.name(y)} ${y}: ${fmtPts(id,win.pts)} ${id==='aiacr'?'штрафных очков':'очков'}`,
      text:`${C.name(y)} ${y} года завершён, и первое место в зачёте марок принадлежит «${s.company}». ${second?`Ближайший соперник — ${second.n} (${fmtPts(id,second.pts)}).`:''}\n${id==='aiacr'?'Титул чемпиона мира — главная награда для автомобильного завода. Покупатели по всему миру знают теперь вашу марку.':'Газеты называют вашу марку лучшей в сезоне. Покупатели охотнее выбирают машины победителя.'}\nСпрос на все модели компании вырос на год вперёд.`},true);
    addLog(`🏆 ${C.title(y)}!`,'good');pendingToasts.push('🏆 '+C.title(y));
  }else if(me>=0)addLog(`${C.name(y)} ${y} завершён. Чемпион — ${ch.win||'не определён'}, «${s.company}» — ${me+1}-е место.`,'hist');
  else if(ch.win)addLog(`${C.name(y)} ${y}: чемпионом стала марка ${ch.win}.`,'hist');
}
// Историческая команда-победитель: если вы не вмешиваетесь, история чаще идёт своим чередом
function histWinnerTeam(rc,teams){if(!rc.win)return null;const w=rc.win.toLowerCase();return teams.find(t=>t.mq.some(m=>w.includes(m.toLowerCase())))||null;}
function simDriver(t,rc,hist){if(hist&&rc.win)return rc.win.split(' (')[0].split(',')[0];const d=teamDrivers(t,rc.y).sort((a,b)=>b.sk-a.sk)[0];return d?d.n:'';}
function simRace(s,rc){
  if(s.cres[rc.key])return;
  if(raceWarBlocked(rc,s)){s.cres[rc.key]={x:1};return;}
  const teams=fieldTeams(rc,s,0),hw=histWinnerTeam(rc,teams),dnf=dnfTarget(rc.y,rc.t)*0.9;
  const rows=teams.map(t=>({name:t.n,t,perf:Math.pow(t.str,1.6)*teamBoost(t,rc)*(t===hw?1.12:1)*(0.92+Math.random()*0.16),dnf:t!==hw&&Math.random()<dnf*clamp(1.4-0.4*t.str,0.6,1.3)?1:0}));
  rows.sort((a,b)=>(a.dnf-b.dnf)||(b.perf-a.perf));
  const w=rows[0];
  s.cres[rc.key]={w:w?w.name:'',d:w?simDriver(w.t,rc,w.t===hw):'',me:0,c:w?w.t.c:''};
  champRecord(s,rc,rows);
}
function seasonTick(s){
  if(!s.cres)s.cres={};if(!s.season)s.season={};
  RACES.forEach(rc=>{if((rc.y<s.y||(rc.y===s.y&&rc.m<s.m))&&rc.y>=s.y-1&&!s.cres[rc.key])simRace(s,rc);});
  [s.y-1,s.y].forEach(y=>champsOf(y).forEach(id=>champFinish(s,id,y)));
  if(s.m===0){Object.keys(s.cres).forEach(k=>{if(+k.split('-').pop()<s.y-2)delete s.cres[k];});Object.keys(s.season).forEach(k=>{if(s.season[k].y<s.y-2)delete s.season[k];});}
}
/* ---------- итоги гонки игрока ---------- */
function fmtRaceTime(sec){sec=Math.max(0,sec);const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),x=Math.floor(sec%60);return h?`${h} ч ${String(m).padStart(2,'0')} мин`:m?`${m} мин ${String(x).padStart(2,'0')} с`:`${(Math.round(sec*10)/10).toFixed(1).replace('.',',')} с`;}
let lastRace=null;
function raceResults(rc,res,mode,info){
  const s=G;if(!s)return;info=info||{};
  const k=rc.km*1000/Math.max(1,info.len||rc.km*1000);   // секунды модели → реальное время на полной дистанции
  const team=res.filter(r=>r.you),fin=team.filter(r=>!r.dnf),best=fin.length?Math.min(...fin.map(r=>r.pos)):0;
  const prize=racePrize(rc);let won=0;
  team.forEach(r=>{if(!r.dnf&&r.pos<=3){r.prize=Math.round(prize*[1,0.5,0.25][r.pos-1]/10)*10;won+=r.prize;}});
  s.cash+=won;
  const major=!!rc.major,rk=bn('raceRep');
  if(best===1)s.rep+=(major?9:5)*rk;else if(best&&best<=3)s.rep+=(major?3:1.5)*rk;else if(best)s.rep+=0.5;else s.rep-=major?2:1;
  s.rep=clamp(s.rep,0,100);
  const bestRow=best?team.find(r=>r.pos===best):team[0],md=bestRow&&bestRow.md&&s.models.find(m=>m.id===bestRow.md.id);
  if(best===1&&md)md.raceBoost=mi(s)+(major?9:6);
  s.raceDone[rc.key]=best||-1;
  s.raceLog.push({y:rc.y,key:rc.key,name:rc.name,model:bestRow?bestRow.label:'',place:best,drv:bestRow?bestRow.drv:'',major,team:team.map(r=>r.dnf?0:r.pos)});
  if(s.raceLog.length>300)s.raceLog.shift();
  const w=res[0];
  s.cres[rc.key]={w:w.you?s.company:w.name,d:w.drv||'',me:best||-1,c:w.you?s.country:(w.tc||'')};
  champRecord(s,rc,res.map(r=>({name:r.you?s.company:r.name,dnf:!!r.dnf})));
  // Кубок Гордона Беннетта: трофей уходит стране победителя
  let cupTitle='';
  if(GBC_IDS.includes(rc.id)){if(best===1){cupTitle=`Кубок Гордона Беннетта ${rc.y}`;s.titles.push({y:rc.y,id:'gbc',name:cupTitle,w:0.5});s.titleBoost=mi(s)+12;s.rep=clamp(s.rep+5*rk,0,100);}
    else addLog(`Кубок Гордона Беннетта ${rc.y} увозит команда страны: ${hostName(s.cres[rc.key].c||'fr')}.`,'hist');}
  raceChamps(rc).forEach(id=>champFinish(s,id,rc.y));
  const dnfN=team.filter(r=>r.dnf).length;
  addLog(`«${rc.name}»: ${best?`лучший результат — ${best}-е место (${bestRow.drv||'пилот'}, «${bestRow.label}»)`:'все машины сошли'}${won?`, призовые ${money(won)}`:''}${dnfN&&best?`, сходов: ${dnfN}`:''}.`,best===1?'good':best?'':'bad');
  lastRace={rc,res,k,won,best,mode,cup:cupTitle};
  openRaceResult();
  if(best===1)showPaper(racePaper(rc,res,bestRow,k,cupTitle),true);
  checkAch();save();render();flushToasts();
}
function racePaper(rc,res,row,k,cup){
  const s=G,second=res.find(r=>r.pos===2),gap=second&&second.fin!=null&&row.fin!=null?(second.fin-row.fin)*k:0;
  const drv=row.player?(PIONEERS[s.pioneer].name+' лично'):(row.drv||'Пилот компании');
  const real=rc.win&&!/^Победителей/.test(rc.win)?rc.win:'',ht=real&&RACE_TEAMS.find(t=>t.from<=rc.y&&t.to>=rc.y&&t.mq.some(m=>real.toLowerCase().includes(m.toLowerCase())));
  const hist=!real?'':ht&&ht.pk===s.pioneer?`Так было и в настоящей истории: в ${rc.y} году здесь победил ${real}.`:`В настоящей истории эту гонку выиграл ${real}. В этот раз история пошла иначе.`;
  return {kicker:cup?'Кубок Гордона Беннетта':'Спорт',title:cup?`Кубок Гордона Беннетта — у «${s.company}»!`:`«${s.company}» выигрывает ${rc.name}!`,
    deck:`${drv} на «${row.label}» — первым на финише${row.fin!=null?` за ${fmtRaceTime(row.fin*k)}`:''}`,
    text:`Гонка «${rc.name}» (${rc.km.toLocaleString('ru-RU')} км) завершилась победой машины «${s.company}». ${second?`Второе место — ${second.you?'тоже у «'+s.company+'»':second.name}${gap>0?`, отставание ${fmtRaceTime(gap)}`:''}.`:''}\n${hist}\nПобеда в гонке — лучшая реклама: покупатели ${rc.major?'по всей стране':'в округе'} только о ней и говорят. Спрос на «${row.label}» вырастет на ближайшие месяцы.`,
    img:rc.img,imgCap:rc.name,act:'paperClose',choices:[['К итогам гонки','close']]};
}
function openRaceResult(){
  const L=lastRace;if(!L)return;const s=G,{rc,res,k,won}=L,lead=res[0];
  const rows=res.filter((r,i)=>i<10||r.you).map(r=>{const t=r.dnf?`<span class="bad">сход${r.dnf&&r.dnf!=='сошёл'?': '+esc(r.dnf):''}</span>`:r.pos===1?fmtRaceTime(r.fin*k):'+'+fmtRaceTime((r.fin-lead.fin)*k);
    return `<tr class="${r.you?'you':''}"><td class="n">${r.dnf?'—':r.pos}</td><td>${esc(r.drv||'—')}<small>${esc(r.you?r.label:r.name)}</small></td><td class="n">${t}${r.prize?`<small class="good">${money(r.prize)}</small>`:''}</td></tr>`;}).join('');
  const champs=raceChamps(rc).map(id=>{const tb=champTable(s,id,rc.y),me=tb.findIndex(r=>r.you),C=CHAMPS[id];
    return `<div class="label" style="margin-top:14px">${C.name(rc.y)} ${rc.y}</div><table class="pl" style="margin-top:4px">${tb.slice(0,4).concat(me>=4?[tb[me]]:[]).map(r=>`<tr class="${r.you?'you':''}"><td class="n">${tb.indexOf(r)+1}</td><td>${esc(r.n)}</td><td class="n">${r.el?'':'['}${fmtPts(id,r.pts)}${r.el?'':']'}</td></tr>`).join('')}</table>`;}).join('');
  openSheet(`<div class="row"><div><span class="label">${MONTHS[rc.m]} ${rc.y} · ${hostName(rc.c)}</span><h2 style="margin-top:2px">Итоги: ${esc(rc.name)}</h2></div><button class="iconbtn" data-act="close" aria-label="Закрыть">×</button></div>
    <p class="small muted" style="margin-top:4px">${RTYPE[rc.t]} · ${rc.km.toLocaleString('ru-RU')} км · время пересчитано на полную дистанцию</p>
    ${L.cup?`<p class="good" style="margin-top:8px"><b>🏆 ${esc(L.cup)}</b></p>`:''}
    <table class="pl res" style="margin-top:10px"><tr><th class="n">#</th><th>Пилот, марка</th><th class="n">Время</th></tr>${rows}</table>
    <p style="margin-top:10px">${L.best?`Лучший результат команды — <b>${L.best}-е место</b>.`:'Ни одна машина команды не добралась до финиша.'}${won?` Призовые: <b class="good">${money(won)}</b>.`:''}</p>
    ${champs}
    <button class="btn primary block" style="margin-top:16px" data-act="close">Дальше</button>`);
}
