/* ================= AUDIO: music of the era + race sounds ================= */
const AU={ctx:null,on:{music:true,sfx:true},next:0,step:0,timer:0,style:'',race:null};
try{const a=JSON.parse(localStorage.getItem('avt-audio')||'null');if(a)AU.on=a;}catch(e){}
const mtof=n=>440*Math.pow(2,(n-69)/12);
function auInit(){
  if(AU.ctx){if(AU.ctx.state==='suspended')AU.ctx.resume();return;}
  const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
  try{const c=new C();AU.ctx=c;AU.master=c.createGain();AU.master.connect(c.destination);
    AU.mus=c.createGain();AU.mus.connect(AU.master);AU.fx=c.createGain();AU.fx.connect(AU.master);
    const comp=c.createDynamicsCompressor();AU.mus.disconnect();AU.mus.connect(comp);comp.connect(AU.master);
    const b=c.createBuffer(1,c.sampleRate,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;AU.noise=b;
    auApply();AU.next=c.currentTime+0.1;AU.timer=setInterval(auSched,30);}catch(e){}
  musicLoad();
}
function auApply(){try{localStorage.setItem('avt-audio',JSON.stringify(AU.on));}catch(e){}if(AU.ctx)musicPlay();if(!AU.ctx)return;const t=AU.ctx.currentTime;AU.mus.gain.setTargetAtTime(AU.on.music?(R?0.07:0.16):0,t,0.3);AU.fx.gain.setTargetAtTime(AU.on.sfx?0.55:0,t,0.1);}
document.addEventListener('pointerdown',auInit,{capture:true});
document.addEventListener('keydown',auInit,{capture:true});
function env(g,t,a,peak,dec){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+a+dec);}
function vPiano(n,t,dur,v){const c=AU.ctx,o=c.createOscillator(),o2=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();o.type='triangle';o2.type='sine';o.frequency.value=mtof(n);o2.frequency.value=mtof(n+12);o2.detune.value=4;
  const g2=c.createGain();g2.gain.value=0.35;o2.connect(g2);g2.connect(g);o.connect(g);f.type='lowpass';f.frequency.value=2600;g.connect(f);f.connect(AU.mus);env(g,t,0.006,v,dur*1.6);o.start(t);o2.start(t);o.stop(t+dur*1.8);o2.stop(t+dur*1.8);}
function vBass(n,t,dur,v){const c=AU.ctx,o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.value=mtof(n);o.connect(g);g.connect(AU.mus);env(g,t,0.01,v,dur*1.2);o.start(t);o.stop(t+dur*1.4);}
function vNoise(t,dur,v,type,freq,dest){const c=AU.ctx,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=AU.noise;f.type=type;f.frequency.value=freq;s.connect(f);f.connect(g);g.connect(dest||AU.mus);env(g,t,0.003,v,dur);s.start(t,Math.random()*0.5);s.stop(t+dur+0.05);}
function vKick(t,v){const c=AU.ctx,o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(120,t);o.frequency.exponentialRampToValueAtTime(45,t+0.12);o.connect(g);g.connect(AU.mus);env(g,t,0.004,v,0.2);o.start(t);o.stop(t+0.3);}
const CH={M:[0,4,7],D:[0,4,7,10],m:[0,3,7],m7:[0,3,7,10],M6:[0,4,7,9]};
const STY={
  rag:{bpm:96,div:4,swing:0,prog:[[0,'M'],[0,'M'],[7,'D'],[7,'D'],[0,'M'],[0,'D'],[5,'M'],[5,'m'],[0,'M'],[9,'D'],[2,'D'],[7,'D'],[0,'M'],[7,'D'],[0,'M'],[0,'M']],key:60},
  march:{bpm:112,div:2,swing:0,prog:[[0,'M'],[0,'M'],[7,'D'],[7,'D'],[7,'D'],[7,'D'],[0,'M'],[0,'M'],[5,'M'],[5,'M'],[0,'M'],[9,'D'],[2,'D'],[7,'D'],[0,'M'],[0,'M']],key:58},
  jazz:{bpm:128,div:2,swing:0.62,prog:[[0,'D'],[5,'D'],[0,'D'],[0,'D'],[5,'D'],[5,'D'],[0,'D'],[9,'D'],[2,'m7'],[7,'D'],[0,'M6'],[7,'D']],key:65}
};
const MUSIC_Q=[
 ['Daisy Bell Bicycle Built for Two Edison',1895,'song'],['Washington Post march',1895,'march'],['Semper Fidelis march',1896,'march'],['Stars and Stripes Forever',1897,'march'],
 ['Maple Leaf Rag',1899,'rag'],['Over the Waves Rosas waltz',1900,'waltz'],['Skaters Waltz Waldteufel',1900,'waltz'],['Peacherine Rag',1901,'rag'],
 ['The Entertainer Joplin',1902,'rag'],['Elite Syncopations',1902,'rag'],['Weeping Willow rag',1903,'rag'],['Entry of the Gladiators',1904,'march'],
 ['In My Merry Oldsmobile',1905,'song'],['Merry Widow Waltz',1906,'waltz'],['Dill Pickles rag',1906,'rag'],['Frog Legs Rag',1906,'rag'],
 ['Pineapple Rag',1908,'rag'],['Black and White Rag',1908,'rag'],['Take Me Out to the Ball Game 1908',1908,'song'],['Shine On Harvest Moon',1909,'song'],
 ['By the Light of the Silvery Moon',1909,'song'],['Solace Joplin',1909,'rag'],['Grace and Beauty rag',1909,'rag'],['Temptation Rag',1909,'rag'],
 ['Come Josephine in My Flying Machine',1910,'song'],['Alexanders Ragtime Band',1911,'song'],['Its a Long Way to Tipperary',1914,'march'],['Colonel Bogey March',1914,'march'],
 ['Keep the Home Fires Burning',1915,'song'],['Pack Up Your Troubles',1915,'song'],['Over There 1917',1917,'march'],['Livery Stable Blues',1917,'jazz'],
 ['Tiger Rag Original Dixieland Jass Band',1918,'jazz'],['Darktown Strutters Ball',1917,'jazz'],['Swanee Jolson',1920,'song'],['Crazy Blues Mamie Smith',1920,'jazz'],
 ['Whispering Paul Whiteman',1920,'jazz'],['Royal Garden Blues',1920,'jazz'],['Aint We Got Fun',1921,'song'],['Yes We Have No Bananas',1923,'song'],
 ['Dipper Mouth Blues',1923,'jazz'],['Wolverine Blues',1923,'jazz'],['Rhapsody in Blue 1924',1924,'jazz'],['Charleston 1925',1925,'jazz'],
 ['Sweet Georgia Brown 1925',1925,'jazz'],['Bye Bye Blackbird Gene Austin',1926,'song'],['Black Bottom Stomp',1926,'jazz'],['West End Blues',1928,'jazz']];
const ST_NAME={rag:'регтайм',march:'марш',jazz:'джаз',song:'песня',waltz:'вальс'},ST_DEFY={rag:1905,march:1915,jazz:1922,song:1910,waltz:1900};
if(!AU.on.mode)AU.on.mode='era';if(AU.on.race===undefined)AU.on.race=true;
AU.tracks={};AU.el=null;AU.pl=[];AU.idx=0;AU.paused=false;AU.synth=null;AU.errs=0;
const musKey=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,' ').split(' ').filter(w=>w.length>3&&!/^(1\d{3}|rag|blues|march|waltz|band|original)$/.test(w));
async function musicLoad(){
  if(window.MUSIC_MANIFEST){AU.tracks=window.MUSIC_MANIFEST;musBuild(true);return;}
  try{const c=JSON.parse(localStorage.getItem('avt-mus')||'null');if(c&&c.v===3&&Date.now()-c.t<20*864e5){AU.tracks=c.tr;musBuild(true);return;}}catch(e){}
  try{
    const api='https://commons.wikimedia.org/w/api.php?format=json&origin=*&action=query';const au=document.createElement('audio');const ogg=!!au.canPlayType('audio/ogg; codecs=vorbis');
    const found=[];let qi=0;
    const worker=async()=>{while(qi<MUSIC_Q.length){const [q,y,st]=MUSIC_Q[qi++];
      try{const sr=await fetch(api+'&list=search&srnamespace=6&srlimit=4&srsearch='+encodeURIComponent(q+' filetype:audio')).then(r=>r.json());
        const kw=musKey(q);const t=((sr.query||{}).search||[]).map(x=>x.title).filter(t=>!/midi|\.mid\b|ringtone|dectalk|slowed|remix|synth|vocoder/i.test(t)&&(!kw.length||kw.some(w=>t.toLowerCase().includes(w))));
        if(t.length)found.push({q,y,st,titles:t.slice(0,2)});}catch(e){}}};
    await Promise.all([0,1,2,3,4,5].map(worker));
    const all=[...new Set(found.flatMap(f=>f.titles))],info={};
    for(let i=0;i<all.length;i+=40){const vi=await fetch(api+'&prop=videoinfo&viprop=url|size|mime|derivatives|extmetadata&titles='+encodeURIComponent(all.slice(i,i+40).join('|'))).then(r=>r.json());
      Object.values((vi.query||{}).pages||{}).forEach(p=>{if(p.videoinfo)info[p.title]=p.videoinfo[0];});}
    const out={};const seen=new Set();
    for(const f of found){for(const t of f.titles){const v=info[t];if(!v||v.size>14e6||seen.has(t))continue;
      const lic=(((v.extmetadata||{}).LicenseShortName||{}).value||'');if(!/public domain|pd|cc/i.test(lic))continue;
      const mp3=(v.derivatives||[]).find(d=>/mpeg|mp3/.test(d.type||'')||d.transcodekey==='mp3');
      const src=mp3?mp3.src:(/mpeg/.test(v.mime)?v.url:(ogg&&/ogg/.test(v.mime)?v.url:null));if(!src)continue;
      seen.add(t);(out[f.st]=out[f.st]||[]).push({src,y:f.y,title:t.replace(/^File:/,'').replace(/\.[a-z0-9]+$/i,'').replace(/_/g,' '),page:v.descriptionurl||('https://commons.wikimedia.org/wiki/'+encodeURIComponent(t))});break;}}
    AU.tracks=out;try{localStorage.setItem('avt-mus',JSON.stringify({v:3,t:Date.now(),tr:out}));}catch(e){}
  }catch(e){}
  musBuild(true);
}
function musAll(){const L=[];for(const st in AU.tracks)(AU.tracks[st]||[]).forEach(t=>L.push(Object.assign({st,y:ST_DEFY[st]||1910},t)));return L;}
function musSynth(){const y=G?G.y:1895,sts=AU.on.mode==='all'?['rag','march','jazz']:[styleFor()],R2=['I','II','III'];
  return [0,1,2].flatMap(v=>sts.map(st=>({synth:true,st,v,y,title:'Оркестрион: '+ST_NAME[st]+' '+R2[v]})));}
function musBuild(start){
  const y=G?G.y:1895;let L=musAll();
  if(AU.on.mode!=='all'){let E=L.filter(t=>t.y<=y+1&&t.y>=y-14);if(E.length<5)E=L.filter(t=>t.y<=y+3).sort((a,b)=>b.y-a.y).slice(0,5);if(E.length<3)E=L.slice().sort((a,b)=>Math.abs(a.y-y)-Math.abs(b.y-y)).slice(0,4);L=E;}
  if(L.length<3)L=L.concat(musSynth());
  const rnd=mulberry32(hashStr(AU.on.mode+y));for(let i=L.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[L[i],L[j]]=[L[j],L[i]];}
  const cur=AU.pl[AU.idx],sig=L.map(t=>t.title).sort().join('|');
  if(sig===AU.sig&&!start)return;AU.sig=sig;AU.pl=L;
  const k=cur?L.findIndex(t=>t.title===cur.title):-1;
  if(k>=0)AU.idx=k;else{AU.idx=0;if(!start&&cur&&!cur.synth&&AU.el&&!AU.el.paused){AU.pl.splice(0,0,cur);}else musicPlay(true);}
  musUI();
}
function musCur(){return AU.pl[AU.idx]||null;}
function musicPlay(force){
  const tr=musCur(),want=AU.on.music&&!AU.paused&&(!R||AU.on.race)&&tr;
  if(!want){if(AU.el&&!AU.el.paused)AU.el.pause();AU.synth=null;AU.real=false;musUI();return;}
  if(tr.synth){if(AU.el&&!AU.el.paused)AU.el.pause();AU.real=false;if(force||!AU.synth||AU.synth.title!==tr.title){AU.synth=tr;AU.step=0;}AU.nowPlaying=null;musUI();return;}
  AU.synth=null;AU.real=true;
  if(!AU.el){AU.el=new Audio();AU.el.preload='auto';AU.el.addEventListener('ended',()=>musNext(1));
    AU.el.addEventListener('playing',()=>{AU.errs=0;});
    AU.el.addEventListener('error',()=>{if(!AU.el.getAttribute('src'))return;AU.errs++;if(AU.errs<Math.min(6,AU.pl.length))musNext(1);else{AU.pl=AU.pl.filter(t=>t.synth).concat(musSynth());AU.idx=0;AU.errs=0;musicPlay(true);}});}
  AU.el.volume=R?0.2:0.5;
  if(force||AU.el.getAttribute('src')!==tr.src){AU.el.src=tr.src;AU.nowPlaying=tr;}
  if(AU.el.paused){const pr=AU.el.play();if(pr&&pr.catch)pr.catch(()=>{});}
  musUI();
}
function musNext(d){if(!AU.pl.length)musBuild(true);const n=AU.pl.length;if(!n)return;AU.idx=((AU.idx+d)%n+n)%n;AU.paused=false;if(!AU.on.music){AU.on.music=true;auApply();}musicPlay(true);}
function musToggle(){if(!AU.on.music){AU.on.music=true;AU.paused=false;auApply();return;}AU.paused=!AU.paused;musicPlay();}
function musMode(){AU.on.mode=AU.on.mode==='all'?'era':'all';try{localStorage.setItem('avt-audio',JSON.stringify(AU.on));}catch(e){}AU.sig='';musBuild(true);toast(AU.on.mode==='all'?'Вся фонотека 1895–1929':'Музыка текущей эпохи');}
function musUI(){const tr=musCur(),on=AU.on.music&&!AU.paused;
  const txt=tr?(tr.synth?tr.title:tr.title.replace(/\s*\(.*?\)/g,' ').replace(/\s+/g,' ').trim().slice(0,60)+(tr.y?' · '+tr.y:'')):'Фонотека загружается…';
  document.querySelectorAll('.plTitle').forEach(e=>{e.textContent=txt;});
  document.querySelectorAll('.plPlay').forEach(e=>{e.textContent=on?'❚❚':'▶';});
  document.querySelectorAll('.plMode').forEach(e=>{e.textContent=AU.on.mode==='all'?'Все':'Эпоха';});
  const sb=document.getElementById('sndBtn');if(sb)sb.style.opacity=AU.on.music?1:0.4;}
function styleFor(){const y=G?G.y:1895;return y<1912?'rag':y<1920?'march':'jazz';}
function auSched(){
  const c=AU.ctx;if(!c)return;
  while(AU.next<c.currentTime+0.15){
    const SY=AU.synth,st=SY?(SY.st==='song'||SY.st==='waltz'?'rag':SY.st):styleFor();if(AU.lastY!==(G&&G.y)){AU.lastY=G&&G.y;if(AU.pl.length)musBuild(false);}
    const S=STY[st],vv=SY?SY.v:0,beat=60/(S.bpm*[1,0.93,1.07][vv]),sub=beat/S.div,stepsBar=S.div*(st==='rag'?2:4);
    const bar=Math.floor(AU.step/stepsBar),pos=AU.step%stepsBar,ch=S.prog[bar%S.prog.length],root=S.key+[0,-3,2][vv]+ch[0],tones=CH[ch[1]];
    let dur=sub;if(S.swing){dur=pos%2===0?beat*S.swing:beat*(1-S.swing);}
    const t=AU.next;
    if(SY&&AU.on.music&&!AU.paused&&(!R||AU.on.race)){
      const rnd=mulberry32(hashStr(st+vv+'-'+(bar%S.prog.length)+'-'+pos+'-'+Math.floor(bar/S.prog.length)%2));
      if(st==='rag'){
        if(pos===0||pos===4)vBass(root-24+(pos===4?7:0),t,beat*0.9,0.28);
        if(pos===2||pos===6)tones.forEach(i=>vPiano(root-12+i,t,beat*0.35,0.07));
        const pat=[1,0,1,1,0,1,0,1];if(pat[pos]&&rnd()<0.9){const deg=tones[Math.floor(rnd()*tones.length)]+(rnd()<0.3?2:0);vPiano(root+12+deg,t,sub*1.3,0.11);}
      }else if(st==='march'){
        if(pos===0||pos===4)vBass(root-24+(pos===4?7:0),t,beat,0.3);
        if(pos===2||pos===6)tones.forEach(i=>vPiano(root-12+i,t,beat*0.4,0.06));
        if(pos===6||pos===7)vNoise(t,0.08,0.05,'bandpass',1800);
        if(pos%2===0||rnd()<0.3){const deg=tones[Math.floor(rnd()*tones.length)];vPiano(root+12+deg,t,sub*(pos%2?1:1.8),0.1);}
      }else{
        if(pos%2===0){const walk=[0,tones[1],tones[2],tones[tones.length-1]][pos/2];vBass(root-24+walk,t,beat*0.9,0.3);}
        if(pos===2||pos===6)tones.slice(1).concat([14]).forEach(i=>vPiano(root-12+i,t,beat*0.3,0.05));
        vNoise(t,pos%2?0.05:0.12,pos%2?0.02:0.04,'highpass',7000);
        if(pos===0)vKick(t,0.1);
        if(rnd()<(pos%2?0.45:0.6)){const bl=[0,3,5,6,7,10][Math.floor(rnd()*6)];vPiano(root+12+bl,t,dur*1.5,0.09);}
      }
    }
    AU.next+=dur;AU.step++;
  }
}
function auSfx(type,v){
  if(!AU.ctx||!AU.on.sfx||(R&&(R.mode==='sim'||R.ff)))return;const t=AU.ctx.currentTime;
  if(type==='crash'){vNoise(t,0.35,0.5*v,'lowpass',700,AU.fx);const o=AU.ctx.createOscillator(),g=AU.ctx.createGain();o.frequency.setValueAtTime(90,t);o.frequency.exponentialRampToValueAtTime(35,t+0.2);o.connect(g);g.connect(AU.fx);env(g,t,0.005,0.6*v,0.3);o.start(t);o.stop(t+0.4);}
  if(type==='bump')vNoise(t,0.15,0.3*v,'lowpass',500,AU.fx);
  if(type==='cheer'){const s=AU.ctx.createBufferSource(),f=AU.ctx.createBiquadFilter(),g=AU.ctx.createGain();s.buffer=AU.noise;s.loop=true;f.type='bandpass';f.frequency.value=1100;f.Q.value=0.6;s.connect(f);f.connect(g);g.connect(AU.fx);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.35,t+0.8);g.gain.exponentialRampToValueAtTime(0.0001,t+3.5);s.start(t);s.stop(t+3.6);}
  if(type==='paper')vNoise(t,0.25,0.12,'highpass',3000,AU.fx);
}
function auRaceStart(rc){
  if(!AU.ctx)return;auApply();
  if(!AU.on.sfx)return;const c=AU.ctx,t=c.currentTime;
  const o1=c.createOscillator(),o2=c.createOscillator(),lfo=c.createOscillator(),lg=c.createGain(),f=c.createBiquadFilter(),g=c.createGain(),am=c.createGain();
  o1.type='sawtooth';o2.type='square';lfo.type='square';f.type='lowpass';f.frequency.value=500;g.gain.value=0;am.gain.value=1;
  o1.connect(f);o2.connect(f);f.connect(am);am.connect(g);g.connect(AU.fx);lfo.connect(lg);lg.connect(am.gain);lg.gain.value=rc.y<1906?0.5:0.15;
  const sc=c.createBufferSource(),sf=c.createBiquadFilter(),sg=c.createGain();sc.buffer=AU.noise;sc.loop=true;sf.type='bandpass';sf.frequency.value=2400;sf.Q.value=4;sg.gain.value=0;sc.connect(sf);sf.connect(sg);sg.connect(AU.fx);
  [o1,o2,lfo,sc].forEach(n=>n.start(t));AU.race={o1,o2,lfo,f,g,sg,sc,early:rc.y<1906};
}
function auRaceTick(){
  const a=AU.race;if(!a||!R||!(R.me||R.follow))return;const t=AU.ctx.currentTime,me=R.me||R.follow,vol=R.me?1:0.6,p=clamp(me.rpm||0,0,1.1),thr=me.thr||0;auScreech(Math.min(1,Math.max(0,(me.slipR||0)-0.1)*4+(me.spinw>0.3?0.3:0)));
  const base=(a.early?30:42)+p*(a.early?80:150)+(me.overheat>0?-15:0);
  a.o1.frequency.setTargetAtTime(base,t,0.05);a.o2.frequency.setTargetAtTime(base*0.5,t,0.05);a.lfo.frequency.setTargetAtTime(base/(a.early?2:4),t,0.05);
  a.f.frequency.setTargetAtTime(350+p*1200+thr*500,t,0.08);a.g.gain.setTargetAtTime((R.t<0?0.05:(0.05+p*0.08+thr*0.07)*(me.overheat>0?0.4:1)*(me.dnf?0.2:1))*vol,t,0.08);
}
function auScreech(v){const a=AU.race;if(a)a.sg.gain.setTargetAtTime(v*0.22,AU.ctx.currentTime,0.05);}
function auRaceStop(){const a=AU.race;if(a){const t=AU.ctx.currentTime;a.g.gain.setTargetAtTime(0,t,0.1);a.sg.gain.setTargetAtTime(0,t,0.05);[a.o1,a.o2,a.lfo,a.sc].forEach(n=>{try{n.stop(t+0.5);}catch(e){}});AU.race=null;}setTimeout(auApply,50);}

