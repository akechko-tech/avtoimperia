// Звуки мира с места гонщика: едем гонки (машиной правит ИИ) и смотрим, что слышно — где, как громко, на какой скорости.
// node test/amb.js  [ключи гонок]
require('./harness.js')(`
Math.random=(()=>{let a=11;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
setupRender=()=>{};setupRaceUI=()=>{};auRaceStart=()=>{};raceResults=()=>{};
// поддельный WebAudio: параметры сразу принимают цель, узлы ничего не делают
const P=()=>({value:0,setTargetAtTime(v){this.value=v;},setValueAtTime(v){this.value=v;},linearRampToValueAtTime(v){this.value=v;},exponentialRampToValueAtTime(v){this.value=v;},cancelScheduledValues(){}});
const node=()=>({gain:P(),frequency:P(),Q:P(),pan:P(),playbackRate:P(),delayTime:P(),detune:P(),type:'',buffer:null,loop:false,curve:null,connect(){},disconnect(){},start(){},stop(){},onended:null});
let NOW=0;const CTX={get currentTime(){return NOW;},sampleRate:44100,createGain:node,createBiquadFilter:node,createStereoPanner:node,createBufferSource:node,createOscillator:node,createWaveShaper:node,createDelay:node,createConvolver:node,
  createBuffer:(ch,n,sr)=>({length:n,duration:n/sr,sampleRate:sr,numberOfChannels:ch,getChannelData:()=>new Float32Array(n)})};
AU.ctx=CTX;AU.fx=node();AU.on.sfx=true;
const IDS=['crowd_big','crowd_race','crowd_murmur','applause','birds_town','birds_forest','birds_dawn','skylark','blackbird','cuckoo','sparrows','crickets','cicada','bells_city','bells_village',
  'steam_whistle','steam_whistle_us','steam_train','horse_carriage','dog_bark','rooster','rain','thunder','stream','brass_parade','sheep','bugle','fanfare','surf'];
let SH=[],ANNS=[],HORN=[],WH=[];
const shot0=ambShot;ambShot=function(id,pos,L,o){const S=shot0(id,pos,L,o);if(S)SH.push({id,t:R.t,g:S.gv,idx:(R.follow||R.me).idx});return S;};
annPlay=function(text,L,pos){const h=ambHear(L,pos[0],pos[1],3);if(h.g>=0.02)ANNS.push({text,t:R.t,g:h.g,d:h.d});};
hornSfx=function(y,v){if(v>0.004)HORN.push(v);};whistleSfx=function(h){if(h&&h.g>0.006)WH.push(h.g);};
newGame('renault','fr','T','normal');G.cash=1e6;let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
const keys=${JSON.stringify(process.argv.slice(2))};
const RUN=keys.length?keys:['pm1903-1903','monaco-1929','indy-1911','x87575-1908','semmering-1905','lemans-1925','targa-1906','brighton-1896'];
RUN.forEach(key=>{const rc=RACES.find(r=>r.key===key);if(!rc){console.log('нет гонки',key);return;}G.y=rc.y;
  const md=G.models[0];{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}md.b=lastOf(BODIES,rc.y,x=>!x.truck).id;
  startRace({rc,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'soft',gear:0}]});const me=R.me;me.player=false;R.follow=me;
  AMB.buf={};IDS.forEach(id=>AMB.buf[id]={duration:id==='rooster'?4:id==='bugle'?8:id==='dog_bark'?14:30,length:1,sampleRate:44100,numberOfChannels:1});
  NOW=0;SH=[];ANNS=[];HORN=[];WH=[];ambStart();const E=AMB.E,T=R.trk;
  console.log('== '+key+(R.scn?' ('+R.scn.st+', '+scnClockTxt()+')':'')+': трибун '+E.stand.length+', кучек зрителей '+E.crowd.length+', церквей '+E.church.length+', хуторов '+E.farm.length+
    ', повозок '+E.cart.length+', рек '+E.river.length+', моря '+E.sea.length+', оркестров '+E.band.length+', рупоров '+E.pa.length+', жандармов '+E.gend.length+', отар '+E.flock.length);
  // до ближайшей кучки зрителей / трибуны
  const nearD=(L,x,z)=>{let d=1e9;L.forEach(e=>{d=Math.min(d,Math.hypot(e.x-x,e.z-z));});return d;};
  const st={f:0,murNo:0,murNoN:0,murNear:0,bigNo:0,bigNoN:0,bigNear:0,birdSlow:[],birdFast:[],mx:{},shotsMax:0,band:0};
  let f=0;const dt=1/30;R.t=-5;
  while(R&&!R.done&&f<30*300){f++;NOW+=dt;const t0=R.t;R.t+=dt;R.time+=dt;raceTick(dt);if(!R)break;if(t0<0&&R.t>=0)ambEvent('start');if(R.endT!==undefined){R.endT-=dt;if(R.endT<=0)break;}
    ambTick(dt);if(me.fin!==null||me.dnf)break;
    const B=id=>{const b=AMB.beds[id];return b&&b.ch?b.ch.g.gain.value:0;};
    if(typeof CSV!=='undefined'&&f%3===0)CSV.push([key,R.t.toFixed(2),me.idx,(Math.abs(me.vx)*3.6).toFixed(0),AMB.lis.N.toFixed(1),T.segT[me.idx],B('crowd_big').toFixed(3),B('crowd_murmur').toFixed(3),
      Math.max(B('birds_forest'),B('birds_dawn'),B('sparrows'),B('skylark'),B('birds_town'),B('blackbird'),B('cuckoo')).toFixed(3),Math.max(B('crickets'),B('cicada')).toFixed(3),B('horse_carriage').toFixed(3),B('stream').toFixed(3),
      AMB.shots.reduce((m,S)=>Math.max(m,S.gv),0).toFixed(3),AMB.shots.map(S=>S.id||'').join('+')].join(','));Object.keys(AMB.beds).forEach(id=>{st.mx[id]=Math.max(st.mx[id]||0,B(id));});
    st.shotsMax=Math.max(st.shotsMax,AMB.shots.length);
    if(R.t<1)continue;st.f++;const dc=nearD(E.crowd,me.x,me.z),ds=nearD(E.stand,me.x,me.z),v=Math.abs(me.vx);
    if(dc>80){st.murNoN++;if(B('crowd_murmur')>0.02)st.murNo++;}else if(dc<15)st.murNear=Math.max(st.murNear,B('crowd_murmur'));
    if(ds>400){st.bigNoN++;if(B('crowd_big')>0.02)st.bigNo++;}else if(ds<40)st.bigNear=Math.max(st.bigNear,B('crowd_big'));
    const bf=Math.max(B('birds_forest'),B('birds_dawn'),B('sparrows'),B('skylark'),B('birds_town'),B('blackbird'));if(E.treeD[me.idx|0]>0.6||E.openD[me.idx|0]>0.6){if(v<6)st.birdSlow.push(bf);else if(v>22)st.birdFast.push(bf);}}
  const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0,cnt=id=>SH.filter(s=>s.id===id).length;
  const gs={};SH.forEach(s=>{(gs[s.id]=gs[s.id]||[]).push(s.g);});
  console.log('   конец: '+(me.fin!==null?'финиш':me.dnf?'сход ('+me.dnf+')':'время вышло')+'; громкость разовых (средняя/наибольшая): '+Object.entries(gs).map(([k,a])=>k+' '+avg(a).toFixed(2)+'/'+Math.max(...a).toFixed(2)).join(', '));
  console.log('   ехали '+(f/30).toFixed(0)+' с; разовых звуков: '+['crowd_race','dog_bark','rooster','bells_city','bells_village','sheep','brass_parade','thunder','applause','steam_whistle'].map(id=>id+' '+cnt(id)).filter(s=>!/ 0$/.test(s)).join(', ')+
    ' | диктор '+ANNS.length+(ANNS.length?' (дальше всех '+Math.max(...ANNS.map(a=>a.d)).toFixed(0)+' м)':'')+' | клаксоны '+HORN.length+' | свисток '+WH.length+' | одновременно разовых ≤ '+st.shotsMax);
  console.log('   гул зрителей: вдали от них (>80 м) слышен в '+(st.murNoN?(100*st.murNo/st.murNoN).toFixed(1):'—')+'% кадров, рядом (<15 м) до '+st.murNear.toFixed(3)+
    ' | трибуны: дальше 400 м слышны в '+(st.bigNoN?(100*st.bigNo/st.bigNoN).toFixed(1):'—')+'% кадров, рядом до '+st.bigNear.toFixed(3));
  console.log('   птицы (лес/поле): стоя или медленно '+avg(st.birdSlow).toFixed(3)+' ('+st.birdSlow.length+' кадров), на скорости >80 км/ч '+avg(st.birdFast).toFixed(3)+' ('+st.birdFast.length+')');
  console.log('   громче всего: '+Object.entries(st.mx).filter(x=>x[1]>0.003).sort((a,b)=>b[1]-a[1]).map(([k,v])=>k+' '+v.toFixed(2)).join(', '));
  ok(st.murNoN===0||st.murNo/st.murNoN<0.01,key+': гул зрителей не слышен там, где их нет');
  ok(st.bigNoN===0||st.bigNo/st.bigNoN<0.01,key+': трибун не слышно вдали');
  if(st.birdSlow.length>20&&st.birdFast.length>20)ok(avg(st.birdFast)<avg(st.birdSlow)*0.5,key+': на скорости птиц почти не слышно');
  ok(st.shotsMax<=12,key+': разовых звуков не больше 12 сразу');
  ok(ANNS.every(a=>a.d<520),key+': диктора слышно только у трибун и старта (до 500 м, стоя)');
  ambStop();R=null;closeSheet();closePaper();G.pending=[];});
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');
`);
