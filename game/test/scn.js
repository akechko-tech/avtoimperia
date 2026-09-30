// Исторические сценарии: старт по одному/парами/с ходу/бегом, часы, погода, итог по времени. node test/scn.js
require('./harness.js')(`
Math.random=(()=>{let a=7;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
setupRender=()=>{};setupRaceUI=()=>{};auRaceStart=()=>{};auSfx=()=>{};raceResults=(rc,res,mode,info)=>{LAST={rc,res,mode,info};};
newGame('renault','fr','T','normal');G.cash=1e6;let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
function run(key,drive){const rc=RACES.find(r=>r.key===key);if(!rc){console.log('нет гонки',key);return;}G.y=rc.y;
  const md=G.models[0];{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}md.b=lastOf(BODIES,rc.y,x=>!x.truck).id;
  LAST=null;const ent=[{drv:'me',md,prep:2,tyre:'soft',gear:0}];
  if(!drive){startRace({rc,mode:'sim',entries:ent});}
  else{startRace({rc,mode:'drive',entries:ent});const S=R.scn;console.log('== '+key+' старт: '+S.st+' часы '+scnClockTxt()+' погода '+S.wxP.map(x=>x[0]+':'+x[1]+(x[2]?'/дождь':'')).join(' '));
    const me=R.me;me.player=false;let f=0,rel=[],rain=0,wet=0,hrs=[];R.t=0.001;
    while(R&&!R.done&&f<60*900){f++;const dt=1/30;R.t+=dt;R.time+=dt;raceTick(dt);if(!R)break;if(R.endT!==undefined){R.endT-=dt;if(R.endT<=0){finishRace(false);break;}}
      if(f%90===0){rain=Math.max(rain,R.rainK);wet=Math.max(wet,R.wetK);hrs.push(scnClockTxt());}
      R.cars.forEach(c=>{if(!c.wait&&c._r===undefined){c._r=R.time;rel.push(c._r.toFixed(1));}});}
    console.log('   выпуск (с): '+rel.slice(0,8).join(' ')+(rel.length>8?' …':'')+' | часы: '+hrs.filter((x,i)=>i%6===0).join(' ')+' | дождь max '+rain.toFixed(2)+' мокро max '+wet.toFixed(2));}
  if(!LAST){finishRace(false);}
  const res=LAST.res,fin=res.filter(r=>r.fin!==null);console.log('   итог: '+res.slice(0,5).map(r=>r.pos+'. '+(r.drv||'').split(' ').pop()+' '+(r.fin!==null?r.fin.toFixed(1):r.dnf)).join(' | '));
  let sorted=true;for(let i=1;i<fin.length;i++)if(fin[i].fin<fin[i-1].fin-0.01)sorted=false;ok(sorted,key+': финишировавшие по возрастанию времени');ok(fin.length>=1,key+': финишировали '+fin.length+' из '+res.length);
  closeSheet();closePaper();G.pending=[];}
['pm1903-1903','indy-1911','lemans-1925','semmering-1905','gpacf-1906','lyon1914-1914','tt-1905','monaco-1929','vanderbilt-1905','pbp-1895'].forEach(k=>run(k,true));
['targa-1906','x51007-1911','brooklands-1908'].forEach(k=>run(k,false));
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');
`);
