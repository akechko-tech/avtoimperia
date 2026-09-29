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
  jazz:{bpm:128,div:2,swing:0.62,prog:[[0,'D'],[5,'D'],[0,'D'],[0,'D'],[5,'D'],[5,'D'],[0,'D'],[9,'D'],[2,'m7'],[7,'D'],[0,'M6'],[7,'D']],key:65},
  // 0.14: новые танцы эпохи — вальс, кекуок, танго, фокстрот, чарльстон
  waltz:{bpm:160,div:1,beats:3,prog:[[0,'M'],[0,'M'],[7,'D'],[7,'D'],[7,'D'],[7,'D'],[0,'M'],[0,'M'],[5,'M'],[5,'M'],[0,'M'],[0,'M'],[2,'D'],[7,'D'],[0,'M'],[0,'M']],key:62},
  cake:{bpm:94,div:4,beats:2,prog:[[0,'M'],[0,'M'],[7,'D'],[7,'D'],[0,'M'],[0,'M'],[5,'M'],[5,'M'],[0,'M'],[9,'D'],[2,'D'],[7,'D'],[0,'M'],[7,'D'],[0,'M'],[0,'M']],key:65},
  tango:{bpm:116,div:4,beats:2,prog:[[0,'m'],[0,'m'],[7,'D'],[7,'D'],[7,'D'],[7,'D'],[0,'m'],[0,'m'],[5,'m'],[5,'m'],[0,'m'],[0,'m'],[7,'D'],[7,'D'],[0,'m'],[0,'m']],key:57},
  fox:{bpm:116,div:2,beats:4,swing:0.58,prog:[[0,'M6'],[9,'m7'],[2,'m7'],[7,'D'],[0,'M6'],[9,'m7'],[2,'m7'],[7,'D'],[5,'M6'],[5,'m'],[0,'M6'],[9,'D'],[2,'m7'],[7,'D'],[0,'M6'],[0,'M6']],key:63},
  charl:{bpm:132,div:2,beats:4,swing:0.55,prog:[[4,'D'],[4,'D'],[9,'D'],[9,'D'],[2,'D'],[2,'D'],[7,'D'],[7,'D'],[0,'M6'],[0,'M6'],[4,'D'],[4,'D'],[9,'D'],[2,'D'],[7,'D'],[0,'M6']],key:60}
};
// Свои мелодии «Автоимперии» (сочинены для игры): ноты по восьмым (марш), шестнадцатым (регтайм, танго) или четвертям (вальс); «-» — тянуть, «.» — пауза
const TUNES={
  avto:{name:'«Автоимперия», марш',bpm:112,div:2,beats:4,sty:'march',y:1895,
    mel:'G4 - C5 - E5 - G5 - | C6 - - - G5 - E5 - | F5 - A5 - C6 - A5 - | G5 - - - - - . . | E5 - G5 - C6 - E6 - | D6 - C6 - A5 - C6 - | B5 - A5 - F#5 - A5 - | G5 - - - - - . . | A5 - A5 B5 C6 - A5 - | G5 - E5 - C5 - E5 - | F#5 - A5 - D6 - C6 - | B5 - G5 - D5 - . . | E5 - G5 - C6 - - E6 | D6 - C6 - A5 - F5 - | G5 - B5 - D6 - B5 - | C6 - - - - - . .',
    ch:'C C F G C Am D7 G F C D7 G7 C F G7 C'},
  reel:{name:'«Кинохроника», регтайм',bpm:96,div:4,beats:2,sty:'rag',y:1899,
    mel:'A5 - C6 A5 - F5 - . | G5 A5 - F5 - . C5 - | Bb5 - G5 E5 - C5 - . | A5 - - - F5 - . . | A5 - C6 A5 - F5 - A5 | F#5 A5 - D6 - C6 A5 - | Bb5 - G5 D5 - G5 - Bb5 | A5 - - - G5 - . . | D6 - Bb5 F5 - Bb5 - D6 | C6 - A5 F5 - A5 - C6 | B5 - G5 D5 - F5 - B5 | C6 - - - Bb5 - G5 - | A5 - C6 A5 - F5 - A5 | F#5 - A5 D6 - C6 - A5 | G5 - Bb5 E5 - G5 - C5 | F5 - - - - - . .',
    ch:'F F C7 F F D7 Gm C7 Bb F G7 C7 F D7 C7 F'},
  valse:{name:'«Вальс гонщиков»',bpm:150,div:1,beats:3,sty:'waltz',y:1895,
    mel:'A4 D5 F#5 | A5 - - | G5 F#5 E5 | A5 - - | G5 E5 C#5 | E5 - - | F#5 E5 D5 | F#5 - - | B5 - A5 | G5 - D5 | F#5 - E5 | D5 - A4 | B4 D5 G#5 | A5 - G5 | F#5 - E5 | D5 - -',
    ch:'D D A7 A7 A7 A7 D D G G D D E7 A7 D D'},
  tango:{name:'«Танго мотора»',bpm:112,div:4,beats:2,sty:'tango',y:1913,
    mel:'E5 - - A5 - - C6 B5 | A5 - - - - . E5 - | G#5 - - B5 - - D6 C6 | B5 - - - - . E5 - | D6 - - B5 - - G#5 E5 | B5 - - - - . . . | C6 - - A5 - - E5 C5 | A5 - - - - . . . | F5 - - A5 - - D6 C6 | A5 - - - - . F5 - | E5 - - A5 - - C6 E6 | C6 - - - - . . . | B5 - - G#5 - - E5 D5 | E5 - - G#5 - - B5 D6 | C6 - - B5 - - A5 G#5 | A5 - - - - - . .',
    ch:'Am Am E7 E7 E7 E7 Am Am Dm Dm Am Am E7 E7 Am Am'}
};
function noteMidi(t){const m=/^([A-G])(#|b)?(\d)$/.exec(t);if(!m)return 60;return {C:0,D:2,E:4,F:5,G:7,A:9,B:11}[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0)+(+m[3]+1)*12;}
function chordOf(t){const m=/^([A-G])(#|b)?(.*)$/.exec(t);const pc=({C:0,D:2,E:4,F:5,G:7,A:9,B:11}[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0)+12)%12;return [60+pc,({'':'M',m:'m','7':'D',m7:'m7','6':'M6'})[m[3]]||'M'];}
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
 ['Sweet Georgia Brown 1925',1925,'jazz'],['Bye Bye Blackbird Gene Austin',1926,'song'],['Black Bottom Stomp',1926,'jazz'],['West End Blues',1928,'jazz'],
 ['Liberty Bell march Sousa',1895,'march'],['El Capitan march Sousa',1896,'march'],['The Thunderer Sousa',1895,'march'],['Under the Double Eagle march',1897,'march'],
 ['Radetzky March',1900,'march'],['Alte Kameraden',1899,'march'],['National Emblem march',1906,'march'],['Anchors Aweigh',1907,'march'],['Blaze Away march',1902,'march'],
 ['Sambre et Meuse',1905,'march'],['Marche Lorraine',1908,'march'],['Pomp and Circumstance Elgar',1902,'march'],['The Great Little Army Alford',1916,'march'],
 ['Original Rags Joplin',1899,'rag'],['Swipesy cakewalk',1900,'rag'],['At a Georgia Camp Meeting',1898,'rag'],['The Cascades Joplin',1904,'rag'],['The Chrysanthemum Joplin',1904,'rag'],
 ['Gladiolus Rag',1907,'rag'],['Wall Street Rag',1909,'rag'],['Twelfth Street Rag',1914,'rag'],['Magnetic Rag Joplin',1914,'rag'],['Nola Arndt',1916,'rag'],['Kitten on the Keys',1921,'rag'],
 ['Blue Danube waltz',1900,'waltz'],['Emperor Waltz Strauss',1905,'waltz'],['Gold and Silver waltz Lehar',1902,'waltz'],['Estudiantina waltz',1900,'waltz'],['Wiener Blut',1905,'waltz'],
 ['Valse triste Sibelius',1904,'waltz'],['Bethena waltz Joplin',1905,'waltz'],['Destiny waltz Baynes',1912,'waltz'],['Missouri Waltz',1916,'waltz'],
 ['Hello Ma Baby',1899,'song'],['Bill Bailey Wont You Please Come Home',1902,'song'],['Give My Regards to Broadway',1904,'song'],['Yankee Doodle Boy Billy Murray',1904,'song'],
 ['Meet Me in St Louis 1904',1904,'song'],['Wait Till the Sun Shines Nellie',1905,'song'],['Glow Worm Lincke',1907,'song'],['Beside the Seaside',1909,'song'],['Row Row Row 1912',1912,'song'],
 ['Ballin the Jack',1913,'song'],['Poor Butterfly',1917,'song'],['K-K-K-Katy',1918,'song'],['Dardanella',1919,'song'],['Avalon Al Jolson',1920,'song'],['April Showers Jolson',1921,'song'],
 ['Toot Toot Tootsie',1922,'song'],['Tea for Two 1925',1925,'song'],['Aint She Sweet 1927',1927,'song'],
 ['La Madelon',1914,'song'],['Frou-frou chanson',1898,'song'],['La Petite Tonkinoise',1906,'song'],['Sous les ponts de Paris',1913,'song'],['Mon homme Mistinguett',1920,'song'],['Valencia Mistinguett',1926,'song'],
 ['O Sole Mio Caruso',1905,'song'],['Funiculi Funicula',1900,'song'],['Santa Lucia Caruso',1910,'song'],['Vesti la giubba Caruso',1907,'song'],['Torna a Surriento',1905,'song'],
 ['Burlington Bertie',1900,'song'],['Hold Your Hand Out Naughty Boy',1913,'song'],['Berliner Luft Lincke',1904,'song'],
 ['Memphis Blues',1912,'jazz'],['St Louis Blues 1914',1915,'jazz'],['Clarinet Marmalade',1918,'jazz'],['At the Jazz Band Ball',1918,'jazz'],['Fidgety Feet',1918,'jazz'],
 ['Canal Street Blues King Oliver',1923,'jazz'],['King Porter Stomp Morton',1923,'jazz'],['Tin Roof Blues',1923,'jazz'],['Jelly Roll Blues',1924,'jazz'],['Heebie Jeebies Armstrong',1926,'jazz'],
 ['Muskrat Ramble',1926,'jazz'],['Potato Head Blues',1927,'jazz'],['Singin the Blues Bix',1927,'jazz'],['Weather Bird',1928,'jazz'],
 ['In the Good Old Summer Time',1902,'song'],['Sweet Adeline',1903,'song'],['Sidewalks of New York',1895,'song'],['A Hot Time in the Old Town',1896,'song'],['My Wild Irish Rose',1899,'song'],['Hiawatha Moret intermezzo',1902,'rag'],
 ['Creole Belles',1900,'rag'],['Smoky Mokes',1899,'rag'],['Whistling Rufus',1899,'rag'],['Under the Bamboo Tree',1902,'song'],['Oh You Beautiful Doll',1911,'song'],['Everybodys Doin It',1911,'song'],
 ['Waiting for the Robert E Lee',1912,'song'],['When Irish Eyes Are Smiling',1912,'song'],['Peg o My Heart',1913,'song'],['Ragtime Cowboy Joe',1912,'song'],['Too Much Mustard',1913,'rag'],['Castle Walk Europe',1914,'jazz'],
 ['Down Home Rag',1913,'rag'],['El Choclo tango',1913,'tango'],['La Cumparsita',1917,'tango'],['La Morocha tango',1905,'tango'],['Rodriguez Pena tango',1911,'tango'],['El Entrerriano tango',1897,'tango'],
 ['Hindustan 1918',1918,'song'],['Till We Meet Again 1918',1918,'song'],['Smiles 1917',1917,'song'],['Japanese Sandman',1920,'jazz'],['Margie 1920',1920,'song'],['Stumbling Confrey',1922,'jazz'],
 ['Chicago That Toddling Town',1922,'song'],['Three OClock in the Morning waltz',1922,'waltz'],['Somebody Stole My Gal',1923,'jazz'],['Everybody Loves My Baby',1924,'jazz'],['Yes Sir Thats My Baby',1925,'song'],['Five Foot Two Eyes of Blue',1925,'song'],
 ['Amur Waves waltz',1906,'waltz'],['On the Hills of Manchuria waltz',1906,'waltz'],['Farewell of Slavianka',1912,'march'],['Waves of the Danube Ivanovici',1900,'waltz'],['Tales from the Vienna Woods',1900,'waltz'],['Voices of Spring Strauss',1900,'waltz'],
 ['Florentiner March Fucik',1907,'march'],['Invercargill march',1909,'march'],['Caissons Go Rolling Along',1918,'march'],['Mademoiselle from Armentieres',1918,'song'],['St Louis Tickle',1904,'rag'],['Cannon Ball Rag',1905,'rag'],
 ['Nobody Bert Williams',1905,'song']];
const ST_NAME={rag:'регтайм',march:'марш',jazz:'джаз',song:'песня',waltz:'вальс',tango:'танго',cake:'кекуок',fox:'фокстрот',charl:'чарльстон'},ST_DEFY={rag:1905,march:1915,jazz:1922,song:1910,waltz:1900,tango:1914};
if(!AU.on.mode)AU.on.mode='era';if(AU.on.race===undefined)AU.on.race=true;
AU.tracks={};AU.el=null;AU.pl=[];AU.idx=0;AU.paused=false;AU.synth=null;AU.errs=0;
const musKey=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,' ').split(' ').filter(w=>w.length>3&&!/^(1\d{3}|rag|blues|march|waltz|band|original)$/.test(w));
async function musicLoad(){
  if(window.MUSIC_MANIFEST){AU.tracks=window.MUSIC_MANIFEST;musBuild(true);return;}
  try{const c=JSON.parse(localStorage.getItem('avt-mus')||'null');if(c&&c.v===5&&Date.now()-c.t<20*864e5){AU.tracks=c.tr;musBuild(true);return;}}catch(e){}
  try{
    const api='https://commons.wikimedia.org/w/api.php?format=json&origin=*&action=query';const au=document.createElement('audio');const ogg=!!au.canPlayType('audio/ogg; codecs=vorbis');
    const found=[];let qi=0;
    const worker=async()=>{while(qi<MUSIC_Q.length){const [q,y,st]=MUSIC_Q[qi++];
      try{const sr=await fetch(api+'&list=search&srnamespace=6&srlimit=4&srsearch='+encodeURIComponent(q+' filetype:audio')).then(r=>r.json());
        const kw=musKey(q);const t=((sr.query||{}).search||[]).map(x=>x.title).filter(t=>!/midi|\.mid\b|ringtone|dectalk|slowed|remix|synth|vocoder|pronunciation|prononciation|lingua libre/i.test(t)&&!/^File:(LL-Q\d|[A-Z][a-z](-[a-z]{2})?-)/.test(t)&&(!kw.length||kw.filter(w=>t.toLowerCase().includes(w)).length>=(kw.length>=3?2:1)));
        if(t.length)found.push({q,y,st,titles:t.slice(0,2)});}catch(e){}}};
    await Promise.all([0,1,2,3,4,5].map(worker));
    const all=[...new Set(found.flatMap(f=>f.titles))],info={};
    for(let i=0;i<all.length;i+=40){const vi=await fetch(api+'&prop=videoinfo&viprop=url|size|mime|derivatives|extmetadata&titles='+encodeURIComponent(all.slice(i,i+40).join('|'))).then(r=>r.json());
      Object.values((vi.query||{}).pages||{}).forEach(p=>{if(p.videoinfo)info[p.title]=p.videoinfo[0];});}
    const out={};const seen=new Set();
    for(const f of found){for(const t of f.titles){const v=info[t];if(!v||v.size>14e6||v.size<150e3||seen.has(t))continue;
      const lic=(((v.extmetadata||{}).LicenseShortName||{}).value||'');if(!/public domain|pd|cc/i.test(lic))continue;
      const mp3=(v.derivatives||[]).find(d=>/mpeg|mp3/.test(d.type||'')||d.transcodekey==='mp3');
      const src=mp3?mp3.src:(/mpeg/.test(v.mime)?v.url:(ogg&&/ogg/.test(v.mime)?v.url:null));if(!src)continue;
      seen.add(t);(out[f.st]=out[f.st]||[]).push({src,y:f.y,title:t.replace(/^File:/,'').replace(/\.[a-z0-9]+$/i,'').replace(/_/g,' '),page:v.descriptionurl||('https://commons.wikimedia.org/wiki/'+encodeURIComponent(t))});break;}}
    AU.tracks=out;try{localStorage.setItem('avt-mus',JSON.stringify({v:5,t:Date.now(),tr:out}));}catch(e){}
  }catch(e){}
  musBuild(true);
}
function musAll(){const L=[];for(const st in AU.tracks)(AU.tracks[st]||[]).forEach(t=>{if(/^LL-Q\d|^[A-Z][a-z](-[a-z]{2})?-/.test(t.title||''))return;L.push(Object.assign({st,y:ST_DEFY[st]||1910},t));});return L;}
function eraStyles(y){return y<1906?['cake','rag','waltz']:y<1912?['rag','waltz','march']:y<1919?['march','tango'].concat(y>=1914?['fox']:['rag']):y<1923?['jazz','fox','tango','waltz']:['jazz','charl','fox','tango'];}
function musSynth(){const y=G?G.y:1895,all=AU.on.mode==='all',sts=all?['rag','march','jazz','waltz','cake','tango','fox','charl']:eraStyles(y),R2=['I','II','III'];
  const L=Object.keys(TUNES).filter(k=>all||TUNES[k].y<=y).map(k=>({synth:true,st:'tune',tune:k,y:TUNES[k].y,title:'Мелодия игры: '+TUNES[k].name}));
  return L.concat((all?[0]:[0,1]).flatMap(v=>sts.map(st=>({synth:true,st,v,y,title:'Оркестрион: '+ST_NAME[st]+' '+R2[v]}))));}
function musBuild(start){
  const y=G?G.y:1895;let L=musAll();
  if(AU.on.mode!=='all'){let E=L.filter(t=>t.y<=y+1&&t.y>=y-14);if(E.length<5)E=L.filter(t=>t.y<=y+3).sort((a,b)=>b.y-a.y).slice(0,5);if(E.length<3)E=L.slice().sort((a,b)=>Math.abs(a.y-y)-Math.abs(b.y-y)).slice(0,4);L=E;}
  // оркестрион и свои мелодии игры — всегда, между пластинками эпохи
  {const S=musSynth(),nR=L.length;L=nR?L.concat(S.slice(0,Math.max(3,Math.ceil(nR/2)))):S;}
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
  if(tr.synth){if(AU.el&&!AU.el.paused)AU.el.pause();AU.real=false;if(force||!AU.synth||AU.synth.title!==tr.title){AU.synth=tr;AU.step=0;tr.end=0;AU.mel=0;}AU.nowPlaying=null;musUI();return;}
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
// Мелодия новых танцев: ближайший к прошлой ноте звук аккорда — линия идёт плавно, изредка скачет
function melPick(root,tones,rnd,lo,hi){const prev=AU.mel||((lo+hi)>>1),C=[];
  for(let o=-24;o<=36;o+=12)tones.forEach(i=>{const n=root+o+i;if(n>=lo&&n<=hi)C.push(n);});
  if(!C.length)return prev;let best=C[0],bw=-1e9;C.forEach(n=>{const d=Math.abs(n-prev),w=(d===0?0.35:d<=4?1.6:d<=7?0.9:0.25)+rnd()*0.9;if(w>bw){bw=w;best=n;}});
  AU.mel=best;return best;}
// Пьеса кончилась — следующая в плейлисте
function musEnd(SY,t){if(SY.end)return;SY.end=1;setTimeout(()=>{if(AU.synth===SY)musNext(1);},Math.max(0,(t-AU.ctx.currentTime)*1000+400));}
// Своя мелодия игры: мелодия по нотам, аккомпанемент — по стилю пьесы
function tuneStep(SY,t,play){const T=TUNES[SY.tune],beat=60/T.bpm,sub=beat/T.div,spb=T.div*T.beats;
  if(!T._m){T._m=T.mel.replace(/\|/g,' ').trim().split(/\s+/);T._c=T.ch.trim().split(/\s+/).map(chordOf);}
  const M=T._m,len=M.length,idx=AU.step%len,pass=Math.floor(AU.step/len),bar=Math.floor(idx/spb),pos=idx%spb,ch=T._c[bar%T._c.length],root=ch[0],tones=CH[ch[1]];
  if(play){
    if(T.sty==='waltz'){if(pos===0)vBass(root-24,t,beat*0.9,0.28);else tones.forEach(i=>vPiano(root-12+i,t,beat*0.35,0.05));}
    else if(T.sty==='tango'){const hab=[1,0,0,1,1,0,1,0];if(hab[pos])vBass(root-24+(pos===3||pos===6?7:0),t,sub*(pos===0?2.6:1.6),0.3);if(pos===4||pos===6)tones.forEach(i=>vPiano(root-12+i,t,sub*0.7,0.05));}
    else{const h=spb/2;if(pos===0||pos===h)vBass(root-24+(pos===h?7:0),t,beat*0.9,0.28);if(pos===h/2||pos===h+h/2)tones.forEach(i=>vPiano(root-12+i,t,beat*0.35,0.06));if(T.sty==='march'&&(pos===spb-2||pos===spb-1))vNoise(t,0.08,0.05,'bandpass',1800);}
    const tok=M[idx];if(tok!=='-'&&tok!=='.'){let d=1;while(M[(idx+d)%len]==='-'&&d<16)d++;const n=noteMidi(tok);vPiano(n,t,sub*d*0.95,0.12);if(d>=2||pass===1)vPiano(n-12,t,sub*d*0.9,pass===1?0.07:0.035);}
    if(AU.step>=len*3-1)musEnd(SY,t+sub);}
  return sub;}
function auSched(){
  const c=AU.ctx;if(!c)return;
  while(AU.next<c.currentTime+0.15){
    if(AU.lastY!==(G&&G.y)){AU.lastY=G&&G.y;if(AU.pl.length)musBuild(false);}
    const SY=AU.synth,play=SY&&AU.on.music&&!AU.paused&&(!R||AU.on.race);
    if(SY&&SY.tune&&TUNES[SY.tune]){const d=tuneStep(SY,AU.next,play);AU.next+=d;AU.step++;continue;}
    const st=SY&&STY[SY.st]?SY.st:styleFor();
    const S=STY[st],vv=SY?SY.v||0:0,beat=60/(S.bpm*[1,0.93,1.07][vv]),sub=beat/S.div,stepsBar=S.div*(S.beats||(st==='rag'?2:4));
    const bar=Math.floor(AU.step/stepsBar),pos=AU.step%stepsBar,ch=S.prog[bar%S.prog.length],root=S.key+[0,-3,2][vv]+ch[0],tones=CH[ch[1]];
    let dur=sub;if(S.swing){dur=pos%2===0?beat*S.swing:beat*(1-S.swing);}
    const t=AU.next;
    if(play&&bar>=S.prog.length*4)musEnd(SY,t);
    if(play){
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
      }else if(st==='waltz'){
        if(pos===0)vBass(root-24,t,beat*0.9,0.28);else tones.forEach(i=>vPiano(root-12+i,t,beat*0.35,0.05));
        if(pos===0){const n=melPick(root,tones,rnd,67,86),long=rnd()<0.55;AU.wl=long;vPiano(n,t,beat*(long?2.7:0.95),0.11);}
        else if(!AU.wl&&rnd()<0.8){const n=melPick(root,tones.concat([2,9]),rnd,67,86);vPiano(n,t,beat*0.95,0.1);}
      }else if(st==='cake'){
        if(pos===0||pos===4)vBass(root-24+(pos===4?7:0),t,beat*0.8,0.28);
        if(pos===2||pos===6)tones.forEach(i=>vPiano(root-12+i,t,beat*0.3,0.06));
        const pat=[1,2,0,1,2,0,2,0];if(pat[pos]&&rnd()<0.92){const n=melPick(root,tones,rnd,69,86);vPiano(n,t,sub*pat[pos]*1.05,0.11);}
      }else if(st==='tango'){
        const hab=[1,0,0,1,1,0,1,0];if(hab[pos])vBass(root-24+(pos===3||pos===6?7:0),t,sub*(pos===0?2.6:1.6),0.3);
        if(pos===4||pos===6)tones.forEach(i=>vPiano(root-12+i,t,sub*0.7,0.05));
        if(pos===0){const n=melPick(root,tones,rnd,64,84);vPiano(n,t,sub*(rnd()<0.5?5.5:3),0.12);}
        else if((pos===6&&rnd()<0.6)||(pos===7&&rnd()<0.45)){const n=melPick(root,tones.concat([2,5]),rnd,64,84);vPiano(n,t,sub*1.2,0.1);}
      }else if(st==='fox'){
        if(pos%2===0)vBass(root-24+[0,7,0,7][pos/2],t,beat*0.9,0.28);
        if(pos===2||pos===6){tones.forEach(i=>vPiano(root-12+i,t,beat*0.45,0.05));vNoise(t,0.06,0.02,'highpass',6000);}
        if(pos===0||pos===4){const n=melPick(root,tones,rnd,67,86);vPiano(n,t,beat*(rnd()<0.5?1.9:0.95),0.11);}
        else if(pos%2===0&&rnd()<0.55){const n=melPick(root,tones.concat([2]),rnd,67,86);vPiano(n,t,beat*0.9,0.1);}
        else if(pos%2===1&&rnd()<0.18){const n=melPick(root,tones,rnd,67,86);vPiano(n,t,dur*0.9,0.09);}
      }else if(st==='charl'){
        if(pos===0||pos===3){vBass(root-24+(pos===3?7:0),t,beat*0.8,0.3);tones.forEach(i=>vPiano(root-12+i,t,beat*0.3,0.06));}
        if(pos===4||pos===6)vNoise(t,0.05,0.025,'highpass',7000);if(pos===0)vKick(t,0.1);
        const pat=[1,0,1,1,0,1,1,0];if(pat[pos]&&rnd()<0.8){const n=melPick(root,tones.concat(rnd()<0.3?[3,10]:[]),rnd,67,86);vPiano(n,t,dur*1.2,0.1);}
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
  // гудок паровоза: два тона с дрожанием, долгий и короткий
  if(type==='whistle'){[[0,1.4],[1.7,0.6]].forEach(([d,l])=>[[587,0.05],[740,0.04],[880,0.02]].forEach(([f,a])=>{const o=AU.ctx.createOscillator(),g=AU.ctx.createGain(),lf=AU.ctx.createOscillator(),lg=AU.ctx.createGain();
    o.type='triangle';o.frequency.value=f;lf.frequency.value=5.5;lg.gain.value=f*0.012;lf.connect(lg);lg.connect(o.frequency);o.connect(g);g.connect(AU.fx);g.gain.setValueAtTime(0.0001,t+d);g.gain.exponentialRampToValueAtTime(a*v,t+d+0.08);g.gain.setValueAtTime(a*v,t+d+l-0.15);g.gain.exponentialRampToValueAtTime(0.0001,t+d+l);
    o.start(t+d);lf.start(t+d);o.stop(t+d+l+0.05);lf.stop(t+d+l+0.05);}));vNoise(t,1.4,0.04*v,'bandpass',2400,AU.fx);}
}
function auRaceStart(rc){
  if(!AU.ctx)return;auApply();
  if(!AU.on.sfx)return;const c=AU.ctx,t=c.currentTime;
  const o1=c.createOscillator(),o2=c.createOscillator(),lfo=c.createOscillator(),lg=c.createGain(),f=c.createBiquadFilter(),g=c.createGain(),am=c.createGain();
  o1.type='sawtooth';o2.type='square';lfo.type='square';f.type='lowpass';f.frequency.value=500;g.gain.value=0;am.gain.value=1;
  o1.connect(f);o2.connect(f);f.connect(am);am.connect(g);g.connect(AU.fx);lfo.connect(lg);lg.connect(am.gain);lg.gain.value=rc.y<1906?0.5:0.15;
  // визг шин: тон с дрожанием + шипящий шум; скрип тормозов: высокий тон; шорох и гул обочины
  const noise=(type,fr,q)=>{const s=c.createBufferSource(),fl=c.createBiquadFilter(),gg=c.createGain();s.buffer=AU.noise;s.loop=true;fl.type=type;fl.frequency.value=fr;fl.Q.value=q;gg.gain.value=0;s.connect(fl);fl.connect(gg);gg.connect(AU.fx);return {s,fl,g:gg};};
  const tone=(type,fr,bp,q,vib,vd)=>{const o=c.createOscillator(),fl=c.createBiquadFilter(),gg=c.createGain(),v=c.createOscillator(),vg=c.createGain();o.type=type;o.frequency.value=fr;fl.type='bandpass';fl.frequency.value=bp;fl.Q.value=q;gg.gain.value=0;v.frequency.value=vib;vg.gain.value=vd;v.connect(vg);vg.connect(o.frequency);o.connect(fl);fl.connect(gg);gg.connect(AU.fx);return {o,v,fl,g:gg};};
  const sq=tone('sawtooth',950,1100,5,9,45),sn=noise('bandpass',1700,1.4),br=tone('sawtooth',2600,2700,9,5,70),bn=noise('bandpass',900,2),rb=noise('lowpass',260,0.7),wd=noise('bandpass',520,0.45);
  [o1,o2,lfo,sq.o,sq.v,sn.s,br.o,br.v,bn.s,rb.s,wd.s].forEach(n=>n.start(t));AU.race={o1,o2,lfo,f,g,sq,sn,br,bn,rb,wd,early:rc.y<1906,drum:rc.y>=1912};
}
function auRaceTick(){
  const a=AU.race;if(!a||!R||!(R.me||R.follow))return;const t=AU.ctx.currentTime,me=R.me||R.follow,vol=R.me?1:0.6,p=clamp(me.rpm||0,0,1.1),thr=me.thr||0,sp=Math.max(0,me.vx||0);
  const base=(a.early?30:42)+p*(a.early?80:150)+(me.overheat>0?-15:0);
  a.o1.frequency.setTargetAtTime(base,t,0.05);a.o2.frequency.setTargetAtTime(base*0.5,t,0.05);a.lfo.frequency.setTargetAtTime(base/(a.early?2:4),t,0.05);
  a.f.frequency.setTargetAtTime(350+p*1200+thr*500,t,0.08);a.g.gain.setTargetAtTime((R.t<0?0.05:(0.05+p*0.08+thr*0.07)*(me.overheat>0?0.4:1)*(me.dnf?0.2:1))*vol,t,0.08);
  // занос: чем сильнее срыв, тем громче и выше визг; на грунте — больше шороха, на асфальте — чистый тон
  const tr=TERR[R.trk.terrAt(me.idx)]||TERR.dirt,soft=tr.dust||tr===TERR.mud||tr===TERR.snow||tr===TERR.sand||tr===TERR.beach?1:0;
  // шины начинают петь у предела сцепления (с 80% занятого), срываются — визжат во весь голос
  const skid=sp>3?clamp(Math.max((Math.max(me.slipR||0,(me.slipF||0)*0.8)-0.08)*5,((me.gu||0)-0.8)*3.5)+(me.spinw>0.3?0.25:0),0,1):0;
  a.sq.o.frequency.setTargetAtTime(760+skid*420+sp*5,t,0.06);a.sq.g.gain.setTargetAtTime(skid*(soft?0.05:0.13)*vol,t,skid>0?0.04:0.08);a.sn.g.gain.setTargetAtTime(skid*(soft?0.2:0.11)*vol,t,0.05);
  // тормоза скрипят при сильном нажатии на ходу, громче — если машину при этом несёт
  const brk=(me.brk||0)>0.3&&sp>3&&R.t>0?clamp((me.brk-0.3)*1.4*(0.35+0.65*Math.min(1,sp/18))*(1+skid*0.8),0,1):0;
  a.br.o.frequency.setTargetAtTime((a.drum?2500:1900)+brk*500+Math.sin(t*3)*60,t,0.05);a.br.g.gain.setTargetAtTime(brk*(a.drum?0.07:0.035)*vol,t,brk>0?0.03:0.1);a.bn.g.gain.setTargetAtTime(brk*(a.drum?0.03:0.1)*vol,t,0.05);
  // гул и камни на обочине
  a.rb.g.gain.setTargetAtTime((me.off?Math.min(1,sp/12)*0.35:soft?Math.min(1,sp/25)*0.04:0)*vol,t,0.1);
  // ветер в открытой машине: на скорости свистит всё громче и выше
  const w=clamp((sp-7)/38,0,1);a.wd.fl.frequency.setTargetAtTime(380+sp*14,t,0.2);a.wd.g.gain.setTargetAtTime(Math.pow(w,1.4)*0.11*vol*(R.t>0?1:0),t,0.25);
}
function auScreech(v){}
function auRaceStop(){const a=AU.race;if(a){const t=AU.ctx.currentTime;a.g.gain.setTargetAtTime(0,t,0.1);[a.sq,a.sn,a.br,a.bn,a.rb,a.wd].forEach(x=>x.g.gain.setTargetAtTime(0,t,0.05));[a.o1,a.o2,a.lfo,a.sq.o,a.sq.v,a.sn.s,a.br.o,a.br.v,a.bn.s,a.rb.s,a.wd.s].forEach(n=>{try{n.stop(t+0.5);}catch(e){}});AU.race=null;}setTimeout(auApply,50);}

