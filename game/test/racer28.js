// 0.28: путь гонщика — бот покупает машину, ездит гонки (быстрый итог), соглашается на контракты, копит капитал,
// основывает марку и доигрывает магнатом до 1930 года.  node test/racer28.js [гонщик] [страна] [год] [вариант основания] [зерно]
const bot=require('./bot.js');
const A=process.argv.slice(2),who=A[0]||'custom',cc=A[1]||'fr',yy=+(A[2]||1900),opt=A[3]||'scratch',seed=+(A[4]||7);
require('./harness.js')(bot+`
Math.random=(()=>{let a=${seed}*7919%2147483647||1;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
SCN_OFF=true;setupRender=()=>{};setupRaceUI=()=>{};auRaceStart=()=>{};
const OPT=${JSON.stringify(opt)};\nfunction RRS0(rc){return G.cash<racerFee(rc)*4;}
racerNew(${JSON.stringify(who)},${JSON.stringify(cc)},${yy},'Тест Гонщик','normal');racerIntro(G);
const out=[],err=[];let founded=null,races=0,guard=0;
function events(){let g=0;while(G.pending.length&&g++<30){const ev=G.pending[0],ks=ev.choices.map(c=>c[1]);
  const k=ks.find(x=>x==='rx:sign')||ks.find(x=>x==='rx:spon')||ks.find(x=>x==='rx:job')||ks.find(x=>x==='rx:garage')||ks[0];if(k==='final'||k==='restart'||k==='rx:final'){if(k==='rx:final')resolve(k);break;}resolve(k);}}
for(let k=0;k<12*36&&!G.over;k++){
  events();if(G.over)break;
  if(G.mode==='racer'){const XR=G.racer;
    // машина: самая дешёвая гоночная, если своей нет; ремонт, когда изношена
    if(!XR.car){const O=racerCarOffers(G).map((o,i)=>({o,i})).filter(z=>z.o.kind!=='new').sort((a,b)=>a.o.val-b.o.val);const b=O.find(z=>G.cash>=z.o.val+300*cpi(G));if(b)racerBuy(b.i);}
    if(XR.car&&XR.car.cond<55&&G.cash>racerRepairCost(G)*2)racerRepair();
    if(!XR.mech&&XR.car&&G.cash>racerMechPay(G)*30)racerMech();
    // гонки месяца: все, куда пускают
    RACES.filter(rc=>rc.y===G.y&&rc.m===G.m&&racerStatus(rc,G)[2]).forEach(rc=>{if(G.pending.length)events();
      const w=racerWorksIn(rc,G);if(!w&&RRS0(rc))return;RRS={key:rc.key,works:w?w.n:'',prep:w?aiPrep(rc):XR.car&&XR.car.prod?1:2,tyre:rc.km>600?'hard':'soft',gear:rc.t==='hill'?-1:0,mode:'sim'};
      if(!w&&!XR.car)return;if(!w&&!racerPrivOk(rc))return;const cs=racerCosts(rc,G);if(G.cash<cs.total+200*cpi(G))return;
      try{racerGo();races++;}catch(e){err.push(rc.key+': '+e.message);}closeSheet();closePaper();evHold=0;events();});
    // своё дело: капитала хватает и имя уже есть
    const op2=OPT==='partner'&&!racerInvestor(G)?'scratch':OPT,need=OPT==='never'?1e18:racerFoundNeed(G,op2)*1.15,inv=op2==='partner'?racerInvestor(G):0;
    if(OPT!=='never'&&XR.fame>=20&&G.cash+racerLoanMax(G)+inv>=need&&G.y>=${yy}+3){
      const loan=Math.min(racerLoanMax(G),Math.max(0,Math.ceil((need-G.cash-inv)/500)*500));
      const r=G.racer,line=G.y+': '+r.name+' основывает марку · капитал '+money(G.cash)+' · кредит '+money(loan)+' · слава '+Math.round(r.fame)+' · побед '+r.wins+' · стартов '+r.starts;
      if(racerFound(op2,'',loan)){founded=line;out.push('ОСНОВАНА: '+line);events();}}
  }else{botMonth('grow');}
  const ok=step();if(!ok&&!G.pending.length&&!G.over){err.push('step false '+dstr(G));break;}
  if(G.mode==='racer'&&G.m===0){const XR=G.racer,tb=dcarTable(G),pl=tb.findIndex(r=>r.me)+1;out.push((G.y-1)+': касса '+money(G.cash)+' · слава '+Math.round(XR.fame)+' · мастерство '+Math.round(XR.sk*100)+' · старты '+XR.starts+' победы '+XR.wins+' подиумы '+XR.pods+' · место '+pl+' · '+(XR.team?'команда '+XR.team.n:XR.car?'машина '+XR.car.name+' '+Math.round(XR.car.cond)+'%':'без машины')+(XR.spons.length?' · спонсоры '+XR.spons.map(o=>o.n).join(','):''));}
  if(G.mode!=='racer'&&G.m===0&&(G.y%4===0)){const t=legacyTable(G);out.push((G.y-1)+': [магнат] касса '+money(G.cash)+' · кредит '+money(G.loan)+' · место в наследии '+t.place+' · модели '+G.models.filter(m=>m.status==='prod').length+' · цех '+Math.round(capEff(G)));}
}
events();
console.log(out.join(String.fromCharCode(10)));
const XR=G.racer,tb=G.dcar?dcarTable(G):[];console.log('ИТОГ',dstr(G),G.mode,'over',G.over,'гонок',races,'стартов',XR.starts,'побед',XR.wins,'подиумов',XR.pods,'заработано',money(XR.earn),'место гонщика',tb.findIndex(r=>r.me)+1,'из',tb.length,founded?'основал':'не основал',G.mode!=='racer'?'наследие: '+legacyTable(G).place+'-е место, стоимость '+money(companyValue(G)):'');
console.log('топ-5 эпохи:',tb.slice(0,5).map(r=>(r.me?'ВЫ':r.n)+' '+r.w+'п/'+fmtPts('gp',r.pts)).join('; '));
if(err.length)console.log('ОШИБКИ',err.slice(0,8).join(' | '));
`);
