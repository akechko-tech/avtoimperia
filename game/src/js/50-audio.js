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
  musicLoad();orchLoad();try{insLoad();}catch(e){}try{enLoad();}catch(e){}
}
function auApply(){try{localStorage.setItem('avt-audio',JSON.stringify(AU.on));}catch(e){}if(AU.ctx)musicPlay();if(!AU.ctx)return;const t=AU.ctx.currentTime;AU.mus.gain.setTargetAtTime(AU.on.music?(R?0.07:0.16):0,t,0.3);AU.fx.gain.setTargetAtTime(AU.on.sfx?0.55:0,t,0.1);}
document.addEventListener('pointerdown',auInit,{capture:true});
document.addEventListener('keydown',auInit,{capture:true});
function env(g,t,a,peak,dec){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+a+dec);}
function vPiano(n,t,dur,v){const c=AU.ctx,o=c.createOscillator(),o2=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();o.type='triangle';o2.type='sine';o.frequency.value=mtof(n);o2.frequency.value=mtof(n+12);o2.detune.value=4;
  const g2=c.createGain();g2.gain.value=0.35;o2.connect(g2);g2.connect(g);o.connect(g);f.type='lowpass';f.frequency.value=2600;g.connect(f);f.connect(AU.mus);env(g,t,0.006,v,dur*1.6);o.start(t);o2.start(t);o.stop(t+dur*1.8);o2.stop(t+dur*1.8);}
function vBass(n,t,dur,v){const c=AU.ctx,o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.value=mtof(n);o.connect(g);g.connect(AU.mus);env(g,t,0.01,v,dur*1.2);o.start(t);o.stop(t+dur*1.4);}
function vNoise(t,dur,v,type,freq,dest){const c=AU.ctx,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=AU.noise;f.type=type;f.frequency.value=freq;s.connect(f);f.connect(g);g.connect(dest||AU.mus);env(g,t,0.003,v,dur);s.start(t,Math.random()*0.5);s.stop(t+dur+0.05);}
/* ---------- живые инструменты: сэмплы FluidR3_GM (фортепиано, духовые, струнные, аккордеон, банджо, ударные) ---------- */
// Каждый инструмент — одна «нарезка» mp3: ноты через малую терцию; нужная нота — ближайший сэмпл с поправкой высоты.
// Пока сэмплы не загрузились (или устройство без Web Audio) — играет старый синтезатор.
const INS={idx:null,buf:{},dead:{},loadP:null};
function insLoad(){if(INS.loadP)return INS.loadP;
  INS.loadP=new Promise(res=>{const go=()=>{INS.idx=window.SAMPLES_INDEX||null;if(!INS.idx||!AU.ctx){res(false);return;}
      const L=Object.keys(INS.idx.inst);let left=L.length;
      // сэмпл: из сети (сайт) или из pack.js (приложение открыто с file:// — там fetch не работает)
      const bytes=k=>{const P=window.SAMPLES_PACK;if(P&&P[k]){const s=atob(P[k]),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return Promise.resolve(u.buffer);}
        return fetch('samples/'+INS.idx.inst[k].file).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer();});};
      L.forEach(k=>{const I=INS.idx.inst[k];bytes(k).then(b=>new Promise((ok,no)=>AU.ctx.decodeAudioData(b,ok,no))).then(B=>{INS.buf[k]=B;
          // «пустые» ячейки (нота вне диапазона инструмента) — не брать
          const d=B.getChannelData(0),sr=B.sampleRate,n=(I.notes||I.hits||[]).length,dead=[];for(let q=0;q<n;q++){let e=0,c=0;for(let j=Math.floor(q*I.slot*sr),m=Math.min(d.length,j+Math.floor(0.4*sr));j<m;j+=7){e+=d[j]*d[j];c++;}if(c&&Math.sqrt(e/c)<0.004)dead.push(q);}INS.dead[k]=dead;})
        .catch(()=>{}).finally(()=>{if(--left<=0)res(true);});});};
    const file=location.protocol==='file:',js=(src,cb,fail)=>{try{const s=document.createElement('script');s.src=src;s.async=true;s.onload=cb;s.onerror=fail;document.head.appendChild(s);}catch(e){fail();}};
    const ready=()=>file&&!window.SAMPLES_PACK?js('samples/pack.js',go,go):go();
    if(window.SAMPLES_INDEX){ready();return;}
    js('samples/index.js',ready,()=>res(false));});
  return INS.loadP;}
// Нота инструмента: n — MIDI, t — время, dur — длина, v — громкость (0…1), dest — куда (по умолчанию музыка)
function inst(name,n,t,dur,v,dest){const I=INS.idx&&INS.idx.inst[name],B=INS.buf[name],c=AU.ctx;
  if(!I||!B||!c){if(name==='bass'||name==='tuba'||name==='pizz')vBass(n,t,dur,v*0.9);else vPiano(n,t,dur,v*0.45);return;}
  const notes=I.notes,dead=INS.dead[name]||[];let k=-1,bd=1e9;for(let q=0;q<notes.length;q++){if(dead.includes(q))continue;const d=Math.abs(n-notes[q]);if(d<bd){bd=d;k=q;}}if(k<0)return;
  const src=c.createBufferSource(),g=c.createGain(),rate=Math.pow(2,(n-notes[k])/12);src.buffer=B;src.playbackRate.value=rate;src.connect(g);g.connect(dest||AU.mus);
  const hold=I.hold||1.2,end=Math.min(I.slot-0.06,Math.max(0.12,Math.min(dur,hold)+0.35)),rel=Math.min(0.25,0.06+dur*0.08);
  g.gain.setValueAtTime(v,t);if(dur<hold){g.gain.setValueAtTime(v,t+dur);g.gain.setTargetAtTime(0.0001,t+dur,rel/3);}
  src.start(t,k*I.slot,end);}
// Ударные: kick, snare, rim, hat, hatp, crash, ride, wood, tri, tamb, clap, brush, tom, cym
function drum(name,t,v,dest){const I=INS.idx&&INS.idx.inst.drums,B=INS.buf.drums,c=AU.ctx;
  if(!I||!B||!c){if(name==='kick')vKick(t,v*0.6);else vNoise(t,name==='crash'||name==='cym'?0.4:0.07,v*0.25,name==='snare'||name==='brush'?'bandpass':'highpass',name==='snare'?1800:7000,dest);return;}
  const k=I.hits.indexOf(name);if(k<0)return;const src=c.createBufferSource(),g=c.createGain();src.buffer=B;src.connect(g);g.connect(dest||AU.mus);g.gain.value=v;src.start(t,k*I.slot,I.slot-0.05);}
// Оркестровки танцев эпохи: мелодия, подголосок, аккорды, бас, ударные
const ARR={rag:{mel:'honky',ch:'piano',bass:'piano',dr:0},cake:{mel:'piano',ch:'banjo',bass:'tuba',dr:1},march:{mel:'cornet',mel2:'trumpet',ch:'trombone',bass:'tuba',dr:2},
  waltz:{mel:'violin',ch:'pizz',bass:'bass',dr:0},tango:{mel:'accordion',mel2:'violin',ch:'piano',bass:'bass',dr:0},fox:{mel:'clarinet',ch:'banjo',bass:'tuba',dr:3},
  charl:{mel:'trumpet',mel2:'clarinet',ch:'banjo',bass:'tuba',dr:4},jazz:{mel:'clarinet',mel2:'trumpet',ch:'piano',bass:'bass',dr:5}};
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
// 0.18: в гонке по умолчанию без музыки — слышно мотор, шины и толпу; включается кнопкой ♪ в гонке или в настройках
if(!AU.on.mode)AU.on.mode='era';if(AU.on.race===undefined||!AU.on.v18){AU.on.race=false;AU.on.v18=1;}
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
/* ---------- 0.19: оркестровые записи (военные оркестры США, Musopen, пластинки 1920-х) — вместо оркестриона ---------- */
const ORCH={idx:null,loadP:null};const ORCH_BASE=()=>(location.protocol==='file:'?VOICE_REMOTE:'');
const ORCH_ST={march:'марш',galop:'галоп',waltz:'вальс',rag:'регтайм',cake:'кекуок',jazz:'джаз',fox:'фокстрот',tango:'танго',polka:'полька',classic:'классика',silent:'музыка немого кино'};
// указатель оркестровых записей — с сайта игры; без сети — синтезатор, а через минуту (новая гонка, ролик) пробуем снова
function orchLoad(){if(ORCH.idx)return Promise.resolve(ORCH.idx);if(ORCH.loadP)return ORCH.loadP;
  if(ORCH.failT&&Date.now()-ORCH.failT<60000)return Promise.resolve({});
  ORCH.loadP=new Promise(res=>{if(window.MUSIC_INDEX){ORCH.idx=window.MUSIC_INDEX;res(ORCH.idx);return;}
    const fail=()=>{ORCH.loadP=null;ORCH.failT=Date.now();res({});};
    try{const s=document.createElement('script');s.src=ORCH_BASE()+'music/index.js';s.async=true;
      s.onload=()=>{ORCH.idx=window.MUSIC_INDEX||{};ORCH.failT=0;res(ORCH.idx);AU.sig='';musBuild(false);};s.onerror=()=>{s.remove();fail();};document.head.appendChild(s);}catch(e){fail();}});
  return ORCH.loadP;}
function orchTracks(){const I=ORCH.idx||{};return Object.keys(I).map(id=>{const m=I[id];return {orch:true,id,src:ORCH_BASE()+'music/'+id+'.m4a',title:m.cap||id,y:m.y||1900,st:m.st||'march',mood:m.mood||'lively',by:m.by||'',lic:m.lic||'',page:m.page||''};});}
// оркестр по настроению и году (для кинохроники): зерно — чтобы у ролика всегда был один и тот же марш
function orchPick(mood,y,seed){const L=orchTracks().filter(t=>t.y<=y+3);if(!L.length)return null;const M=L.filter(t=>t.mood===mood),P=M.length?M:L;return P[hashStr(String(seed||mood)+y)%P.length];}
function musAll(){const L=[];for(const st in AU.tracks)(AU.tracks[st]||[]).forEach(t=>{if(/^LL-Q\d|^[A-Z][a-z](-[a-z]{2})?-/.test(t.title||''))return;L.push(Object.assign({st,y:ST_DEFY[st]||1910},t));});return L.concat(orchTracks());}
function eraStyles(y){return y<1906?['cake','rag','waltz']:y<1912?['rag','waltz','march']:y<1919?['march','tango'].concat(y>=1914?['fox']:['rag']):y<1923?['jazz','fox','tango','waltz']:['jazz','charl','fox','tango'];}
function musSynth(){const y=G?G.y:1895,all=AU.on.mode==='all',sts=all?['rag','march','jazz','waltz','cake','tango','fox','charl']:eraStyles(y),R2=['I','II','III'];
  const L=Object.keys(TUNES).filter(k=>all||TUNES[k].y<=y).map(k=>({synth:true,st:'tune',tune:k,y:TUNES[k].y,title:'Мелодия игры: '+TUNES[k].name}));
  return L.concat((all?[0]:[0,1]).flatMap(v=>sts.map(st=>({synth:true,st,v,y,title:'Оркестрион: '+ST_NAME[st]+' '+R2[v]}))));}
function musBuild(start){
  const y=G?G.y:1895;let L=musAll();
  if(AU.on.mode!=='all'){let E=L.filter(t=>t.y<=y+1&&(t.orch||t.y>=y-14));if(E.length<5)E=L.filter(t=>t.y<=y+3).sort((a,b)=>b.y-a.y).slice(0,5);if(E.length<3)E=L.slice().sort((a,b)=>Math.abs(a.y-y)-Math.abs(b.y-y)).slice(0,4);L=E;}
  // 0.19: есть оркестровые записи — синтезатор не нужен; без сети — оркестрион и мелодии игры
  {const hasO=L.some(t=>t.orch),S=musSynth(),nR=L.length;L=hasO?L:nR?L.concat(S.slice(0,Math.max(3,Math.ceil(nR/2)))):S;}
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
  const txt=tr?(tr.synth?tr.title:tr.orch?tr.title+(tr.by?' — '+tr.by:''):tr.title.replace(/\s*\(.*?\)/g,' ').replace(/\s+/g,' ').trim().slice(0,60)+(tr.y?' · '+tr.y:'')):'Фонотека загружается…';
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
// Своя мелодия игры: мелодия по нотам, аккомпанемент — по стилю пьесы (живыми инструментами)
function tuneStep(SY,t,play){const T=TUNES[SY.tune],beat=60/T.bpm,sub=beat/T.div,spb=T.div*T.beats,A=ARR[T.sty]||ARR.rag;
  if(!T._m){T._m=T.mel.replace(/\|/g,' ').trim().split(/\s+/);T._c=T.ch.trim().split(/\s+/).map(chordOf);}
  const M=T._m,len=M.length,idx=AU.step%len,pass=Math.floor(AU.step/len),bar=Math.floor(idx/spb),pos=idx%spb,ch=T._c[bar%T._c.length],root=ch[0],tones=CH[ch[1]];
  if(play){
    if(T.sty==='waltz'){if(pos===0)inst('bass',root-24,t,beat*0.9,0.5);else tones.forEach(i=>inst('pizz',root-12+i,t,beat*0.35,0.18));}
    else if(T.sty==='tango'){const hab=[1,0,0,1,1,0,1,0];if(hab[pos])inst('bass',root-24+(pos===3||pos===6?7:0),t,sub*(pos===0?2.6:1.6),0.5);if(pos===4||pos===6)tones.forEach(i=>inst('piano',root-12+i,t,sub*0.7,0.16));}
    else{const h=spb/2;if(pos===0||pos===h)inst(A.bass,root-24+(pos===h?7:0),t,beat*0.9,0.5);if(pos===h/2||pos===h+h/2)tones.forEach(i=>inst(A.ch,root-12+i,t,beat*0.35,0.17));
      if(T.sty==='march'){if(pos===0)drum('kick',t,0.5);if(pos===h)drum('crash',t,0.12);if(pos===spb-2||pos===spb-1)drum('snare',t,0.3);}}
    const tok=M[idx];if(tok!=='-'&&tok!=='.'){let d=1;while(M[(idx+d)%len]==='-'&&d<16)d++;const n=noteMidi(tok),mi2=pass===1&&A.mel2?A.mel2:A.mel;
      inst(mi2,n,t,sub*d*0.95,0.4);if(d>=2||pass===1)inst(T.sty==='march'?'trombone':'piano',n-12,t,sub*d*0.9,pass===1?0.2:0.12);}
    if(AU.step>=len*3-1)musEnd(SY,t+sub);}
  return sub;}
function auSched(){
  const c=AU.ctx;if(!c)return;
  while(AU.next<c.currentTime+0.15){
    if(AU.lastY!==(G&&G.y)){AU.lastY=G&&G.y;if(AU.pl.length)musBuild(false);}
    // под кинохронику — свой танец ролика, тихо
    const RS=AU.reelSty&&typeof REEL!=='undefined'&&REEL?AU.reelSty:null;
    const SY=RS?null:AU.synth,play=RS?AU.on.music:SY&&AU.on.music&&!AU.paused&&(!R||AU.on.race);
    if(SY&&SY.tune&&TUNES[SY.tune]){const d=tuneStep(SY,AU.next,play);AU.next+=d;AU.step++;continue;}
    const st=RS||(SY&&STY[SY.st]?SY.st:styleFor()),A=ARR[st]||ARR.rag;
    const S=STY[st],vv=SY?SY.v||0:0,beat=60/(S.bpm*[1,0.93,1.07][vv]),sub=beat/S.div,stepsBar=S.div*(S.beats||(st==='rag'?2:4));
    const bar=Math.floor(AU.step/stepsBar),pos=AU.step%stepsBar,ch=S.prog[bar%S.prog.length],root=S.key+[0,-3,2][vv]+ch[0],tones=CH[ch[1]];
    let dur=sub;if(S.swing){dur=pos%2===0?beat*S.swing:beat*(1-S.swing);}
    const t=AU.next;
    if(play&&SY&&bar>=S.prog.length*4)musEnd(SY,t);
    if(play){
      const rnd=mulberry32(hashStr(st+vv+'-'+(bar%S.prog.length)+'-'+pos+'-'+Math.floor(bar/S.prog.length)%2)),pass=Math.floor(bar/S.prog.length)%2,mel=pass&&A.mel2?A.mel2:A.mel;
      if(st==='rag'){
        if(pos===0||pos===4)inst('piano',root-24+(pos===4?7:0),t,beat*0.9,0.45);
        if(pos===2||pos===6)tones.forEach(i=>inst('piano',root-12+i,t,beat*0.35,0.16));
        const pat=[1,0,1,1,0,1,0,1];if(pat[pos]&&rnd()<0.9){const deg=tones[Math.floor(rnd()*tones.length)]+(rnd()<0.3?2:0);inst(mel,root+12+deg,t,sub*1.3,0.34);}
      }else if(st==='march'){
        if(pos===0||pos===4)inst('tuba',root-24+(pos===4?7:0),t,beat,0.55);
        if(pos===2||pos===6)tones.forEach(i=>inst('trombone',root-12+i,t,beat*0.4,0.16));
        if(pos===0)drum('kick',t,0.5);if(pos===4)drum('kick',t,0.35);if(pos===6||pos===7)drum('snare',t,0.28);if(pos===0&&bar%4===0)drum('crash',t,0.1);
        if(pos%2===0||rnd()<0.3){const deg=tones[Math.floor(rnd()*tones.length)];inst(mel,root+12+deg,t,sub*(pos%2?1:1.8),0.36);}
      }else if(st==='waltz'){
        if(pos===0)inst('bass',root-24,t,beat*0.9,0.5);else tones.forEach(i=>inst('pizz',root-12+i,t,beat*0.35,0.16));
        if(pos===0){const n=melPick(root,tones,rnd,67,86),long=rnd()<0.55;AU.wl=long;inst('violin',n,t,beat*(long?2.7:0.95),0.36);if(pass)inst('strings',n-12,t,beat*(long?2.7:0.95),0.14);}
        else if(!AU.wl&&rnd()<0.8){const n=melPick(root,tones.concat([2,9]),rnd,67,86);inst('violin',n,t,beat*0.95,0.32);}
      }else if(st==='cake'){
        if(pos===0||pos===4)inst('tuba',root-24+(pos===4?7:0),t,beat*0.8,0.5);
        if(pos===2||pos===6)tones.forEach(i=>inst('banjo',root-12+i,t,beat*0.3,0.18));
        if(pos===2||pos===6)drum('rim',t,0.18);
        const pat=[1,2,0,1,2,0,2,0];if(pat[pos]&&rnd()<0.92){const n=melPick(root,tones,rnd,69,86);inst('piano',n,t,sub*pat[pos]*1.05,0.36);}
      }else if(st==='tango'){
        const hab=[1,0,0,1,1,0,1,0];if(hab[pos])inst('bass',root-24+(pos===3||pos===6?7:0),t,sub*(pos===0?2.6:1.6),0.5);
        if(pos===4||pos===6)tones.forEach(i=>inst('piano',root-12+i,t,sub*0.7,0.15));
        if(pos===0){const n=melPick(root,tones,rnd,64,84);inst(mel,n,t,sub*(rnd()<0.5?5.5:3),0.38);}
        else if((pos===6&&rnd()<0.6)||(pos===7&&rnd()<0.45)){const n=melPick(root,tones.concat([2,5]),rnd,64,84);inst(mel,n,t,sub*1.2,0.33);}
      }else if(st==='fox'){
        if(pos%2===0)inst('tuba',root-24+[0,7,0,7][pos/2],t,beat*0.9,0.5);
        if(pos===2||pos===6){tones.forEach(i=>inst('banjo',root-12+i,t,beat*0.45,0.15));drum('brush',t,0.25);}
        if(pos===0||pos===4)drum('hatp',t,0.2);
        if(pos===0||pos===4){const n=melPick(root,tones,rnd,67,86);inst(mel,n,t,beat*(rnd()<0.5?1.9:0.95),0.36);}
        else if(pos%2===0&&rnd()<0.55){const n=melPick(root,tones.concat([2]),rnd,67,86);inst(mel,n,t,beat*0.9,0.32);}
        else if(pos%2===1&&rnd()<0.18){const n=melPick(root,tones,rnd,67,86);inst(mel,n,t,dur*0.9,0.28);}
      }else if(st==='charl'){
        if(pos===0||pos===3){inst('tuba',root-24+(pos===3?7:0),t,beat*0.8,0.52);tones.forEach(i=>inst('banjo',root-12+i,t,beat*0.3,0.17));}
        if(pos===4||pos===6)drum('hat',t,0.22);if(pos===0)drum('kick',t,0.45);if(pos===3)drum('snare',t,0.22);
        const pat=[1,0,1,1,0,1,1,0];if(pat[pos]&&rnd()<0.8){const n=melPick(root,tones.concat(rnd()<0.3?[3,10]:[]),rnd,67,86);inst(mel,n,t,dur*1.2,0.34);}
      }else{
        if(pos%2===0){const walk=[0,tones[1],tones[2],tones[tones.length-1]][pos/2];inst('bass',root-24+walk,t,beat*0.9,0.55);}
        if(pos===2||pos===6)tones.slice(1).concat([14]).forEach(i=>inst('piano',root-12+i,t,beat*0.3,0.14));
        drum(pos%2?'hat':'ride',t,pos%2?0.14:0.22);if(pos===0)drum('kick',t,0.4);if(pos===2||pos===6)drum('snare',t,0.16);
        if(rnd()<(pos%2?0.45:0.6)){const bl=[0,3,5,6,7,10][Math.floor(rnd()*6)];inst(mel,root+12+bl,t,dur*1.5,0.32);}
      }
    }
    AU.next+=dur;AU.step++;
  }
}
function auSfx(type,v){
  if(!AU.ctx||!AU.on.sfx||(R&&(R.mode==='sim'||R.ff)))return;const t=AU.ctx.currentTime;
  if(type==='crash'){vNoise(t,0.35,0.5*v,'lowpass',700,AU.fx);const o=AU.ctx.createOscillator(),g=AU.ctx.createGain();o.frequency.setValueAtTime(90,t);o.frequency.exponentialRampToValueAtTime(35,t+0.2);o.connect(g);g.connect(AU.fx);env(g,t,0.005,0.6*v,0.3);o.start(t);o.stop(t+0.4);}
  if(type==='bump')vNoise(t,0.15,0.3*v,'lowpass',500,AU.fx);
  if(type==='cheer'&&typeof AMB!=='undefined'&&AMB.on&&AMB.buf.crowd_race){ambOnce('crowd_race',0.5*v,0);return;}
  if(type==='tick'){vNoise(t,0.04,0.12*v,'bandpass',2200,AU.fx);return;}
  if(type==='grind'){const c=AU.ctx,o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter(),lf=c.createOscillator(),lg=c.createGain();o.type='sawtooth';o.frequency.value=620;lf.frequency.value=47;lg.gain.value=0.5;lf.connect(lg);lg.connect(g.gain);f.type='bandpass';f.frequency.value=2300;f.Q.value=3;o.connect(f);f.connect(g);g.connect(AU.fx);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.09*v,t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+0.28);o.start(t);lf.start(t);o.stop(t+0.3);lf.stop(t+0.3);vNoise(t,0.25,0.1*v,'bandpass',3200,AU.fx);return;}
  if(type==='shift'){vNoise(t,0.07,0.16*v,'bandpass',700,AU.fx);vNoise(t+0.03,0.05,0.08*v,'highpass',2500,AU.fx);return;}
  if(type==='cheer'){const s=AU.ctx.createBufferSource(),f=AU.ctx.createBiquadFilter(),g=AU.ctx.createGain();s.buffer=AU.noise;s.loop=true;f.type='bandpass';f.frequency.value=1100;f.Q.value=0.6;s.connect(f);f.connect(g);g.connect(AU.fx);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.35,t+0.8);g.gain.exponentialRampToValueAtTime(0.0001,t+3.5);s.start(t);s.stop(t+3.6);}
  if(type==='paper')vNoise(t,0.25,0.12,'highpass',3000,AU.fx);
  // лужа: всплеск и шелест брызг; грязь — вязкий шлепок; дерево — треск
  if(type==='splash'){vNoise(t,0.55,0.55*v,'bandpass',950,AU.fx);vNoise(t,0.3,0.35*v,'lowpass',320,AU.fx);vNoise(t+0.05,0.7,0.18*v,'highpass',3200,AU.fx);}
  if(type==='mud'){vNoise(t,0.35,0.6*v,'lowpass',260,AU.fx);vNoise(t+0.04,0.22,0.25*v,'bandpass',620,AU.fx);const o=AU.ctx.createOscillator(),g=AU.ctx.createGain();o.type='sine';o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(55,t+0.25);o.connect(g);g.connect(AU.fx);env(g,t,0.01,0.3*v,0.25);o.start(t);o.stop(t+0.35);}
  if(type==='wood'){vNoise(t,0.09,0.5*v,'highpass',1800,AU.fx);vNoise(t+0.02,0.3,0.35*v,'bandpass',420,AU.fx);vNoise(t+0.12,0.5,0.12*v,'bandpass',2600,AU.fx);}
  // гудок паровоза: два тона с дрожанием, долгий и короткий
  if(type==='whistle'&&typeof AMB!=='undefined'&&AMB.on){const us=R&&R.trk&&R.trk.cfg.host==='us';if(ambOnce(us&&AMB.buf.steam_whistle_us?'steam_whistle_us':'steam_whistle',0.7*v,0.4))return;}
  if(type==='whistle'){[[0,1.4],[1.7,0.6]].forEach(([d,l])=>[[587,0.05],[740,0.04],[880,0.02]].forEach(([f,a])=>{const o=AU.ctx.createOscillator(),g=AU.ctx.createGain(),lf=AU.ctx.createOscillator(),lg=AU.ctx.createGain();
    o.type='triangle';o.frequency.value=f;lf.frequency.value=5.5;lg.gain.value=f*0.012;lf.connect(lg);lg.connect(o.frequency);o.connect(g);g.connect(AU.fx);g.gain.setValueAtTime(0.0001,t+d);g.gain.exponentialRampToValueAtTime(a*v,t+d+0.08);g.gain.setValueAtTime(a*v,t+d+l-0.15);g.gain.exponentialRampToValueAtTime(0.0001,t+d+l);
    o.start(t+d);lf.start(t+d);o.stop(t+d+l+0.05);lf.stop(t+d+l+0.05);}));vNoise(t,1.4,0.04*v,'bandpass',2400,AU.fx);}
}
function auRaceStart(rc){
  if(!AU.ctx)return;auApply();try{orchLoad();}catch(_){}
  if(!AU.on.sfx)return;const c=AU.ctx,t=c.currentTime;
  const o1=c.createOscillator(),o2=c.createOscillator(),lfo=c.createOscillator(),lg=c.createGain(),f=c.createBiquadFilter(),g=c.createGain(),am=c.createGain();
  o1.type='sawtooth';o2.type='square';lfo.type='square';f.type='lowpass';f.frequency.value=500;g.gain.value=0;am.gain.value=1;
  o1.connect(f);o2.connect(f);f.connect(am);am.connect(g);g.connect(AU.fx);lfo.connect(lg);lg.connect(am.gain);lg.gain.value=rc.y<1906?0.5:0.15;
  // визг шин: тон с дрожанием + шипящий шум; скрип тормозов: высокий тон; шорох и гул обочины
  const noise=(type,fr,q)=>{const s=c.createBufferSource(),fl=c.createBiquadFilter(),gg=c.createGain();s.buffer=AU.noise;s.loop=true;fl.type=type;fl.frequency.value=fr;fl.Q.value=q;gg.gain.value=0;s.connect(fl);fl.connect(gg);gg.connect(AU.fx);return {s,fl,g:gg};};
  const tone=(type,fr,bp,q,vib,vd)=>{const o=c.createOscillator(),fl=c.createBiquadFilter(),gg=c.createGain(),v=c.createOscillator(),vg=c.createGain();o.type=type;o.frequency.value=fr;fl.type='bandpass';fl.frequency.value=bp;fl.Q.value=q;gg.gain.value=0;v.frequency.value=vib;vg.gain.value=vd;v.connect(vg);vg.connect(o.frequency);o.connect(fl);fl.connect(gg);gg.connect(AU.fx);return {o,v,fl,g:gg};};
  const sq=tone('sawtooth',950,1100,5,9,45),sn=noise('bandpass',1700,1.4),br=tone('sawtooth',2600,2700,9,5,70),bn=noise('bandpass',900,2),rb=noise('lowpass',260,0.7),wd=noise('bandpass',520,0.45);
  // 0.18: дождь (шорох и гул), шипение мокрых шин, хруст щебня, плеск в луже
  const rn=noise('highpass',2800,0.3),rl=noise('lowpass',420,0.5),wh=noise('highpass',1700,0.5),gr=noise('bandpass',2300,0.9),sw=noise('bandpass',800,0.8);
  // эхо тоннеля: свёртка с гулким откликом + короткие повторы
  const ir=c.createBuffer(2,Math.round(c.sampleRate*1.7),c.sampleRate);for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<d.length;i++){const q=i/c.sampleRate;d[i]=(Math.random()*2-1)*Math.exp(-q*3.1)*(q<0.01?q/0.01:1)*(1+0.6*Math.exp(-Math.pow((q-0.09)/0.01,2)));}}
  const cv=c.createConvolver();cv.buffer=ir;const rv=c.createGain();rv.gain.value=0;const dl=c.createDelay(0.6);dl.delayTime.value=0.13;const fb=c.createGain();fb.gain.value=0.3;const dg=c.createGain();dg.gain.value=0;
  g.connect(rv);rv.connect(cv);cv.connect(AU.fx);g.connect(dg);dg.connect(dl);dl.connect(fb);fb.connect(dl);dl.connect(AU.fx);
  [o1,o2,lfo,sq.o,sq.v,sn.s,br.o,br.v,bn.s,rb.s,wd.s,rn.s,rl.s,wh.s,gr.s,sw.s].forEach(n=>n.start(t));AU.race={o1,o2,lfo,f,g,sq,sn,br,bn,rb,wd,rn,rl,wh,gr,sw,rv,dg,early:rc.y<1906,drum:rc.y>=1912};
  // 0.19: живые моторы и шины (AudioWorklet); старый синтезатор молчит
  const wk=enStart(g);if(wk){AU.race.wk=wk;f.disconnect();g.gain.value=1;}
  try{ambStart();}catch(e){console.warn('amb',e);}AU.race.lt=t;
}
function auRaceTick(){
  const a=AU.race;if(!a||!R||!(R.me||R.follow))return;const t=AU.ctx.currentTime,me=R.me||R.follow,vol=R.me?1:0.6,p=clamp(me.rpm||0,0,1.1),thr=me.thr||0,sp=Math.max(0,me.vx||0);
  {const dtA=clamp(t-(a.lt||t),0,0.1);a.lt=t;try{ambTick(dtA);}catch(e){console.warn('amb',e);}}
  // переключение передач: стук рычага; до синхронизаторов (1928) при сбросе иногда скрежет шестерён
  if(R.me&&me===R.me){if(a.gear!==undefined&&me.gear!==a.gear&&sp>2){auSfx('shift',0.6);if(me.gear<a.gear&&R.rc.y<1928&&Math.random()<0.3)auSfx('grind',0.5);}a.gear=me.gear;}
  if(a.wk){try{enTick(a,me,vol);}catch(e){console.warn(e);}}
  else{  const base=(a.early?30:42)+p*(a.early?80:150)+(me.overheat>0?-15:0);
  a.o1.frequency.setTargetAtTime(base,t,0.05);a.o2.frequency.setTargetAtTime(base*0.5,t,0.05);a.lfo.frequency.setTargetAtTime(base/(a.early?2:4),t,0.05);
  a.f.frequency.setTargetAtTime(350+p*1200+thr*500,t,0.08);a.g.gain.setTargetAtTime((R.t<0?0.05:(0.05+p*0.08+thr*0.07)*(me.overheat>0?0.4:1)*(me.dnf?0.2:1))*vol,t,0.08);
  }
  // занос: чем сильнее срыв, тем громче и выше визг; на грунте — больше шороха, на асфальте — чистый тон
  const tr=TERR[R.trk.terrAt(me.idx)]||TERR.dirt,soft=tr.dust||tr===TERR.mud||tr===TERR.snow||tr===TERR.sand||tr===TERR.beach?1:0;
  // шины начинают петь у предела сцепления (с 80% занятого), срываются — визжат во весь голос
  const skid=sp>3?clamp(Math.max((Math.max(me.slipR||0,(me.slipF||0)*0.8)-0.08)*5,((me.gu||0)-0.8)*3.5)+(me.spinw>0.3?0.25:0),0,1):0;
  if(!a.wk){a.sq.o.frequency.setTargetAtTime(760+skid*420+sp*5,t,0.06);a.sq.g.gain.setTargetAtTime(skid*(soft?0.05:0.13)*vol,t,skid>0?0.04:0.08);a.sn.g.gain.setTargetAtTime(skid*(soft?0.2:0.11)*vol,t,0.05);}
  // тормоза скрипят при сильном нажатии на ходу, громче — если машину при этом несёт
  const brk=(me.brk||0)>0.3&&sp>3&&R.t>0?clamp((me.brk-0.3)*1.4*(0.35+0.65*Math.min(1,sp/18))*(1+skid*0.8),0,1):0;
  a.br.o.frequency.setTargetAtTime((a.drum?2500:1900)+brk*500+Math.sin(t*3)*60,t,0.05);a.br.g.gain.setTargetAtTime(brk*(a.drum?0.07:0.035)*vol,t,brk>0?0.03:0.1);a.bn.g.gain.setTargetAtTime(brk*(a.drum?0.03:0.1)*vol,t,0.05);
  // гул и камни на обочине
  a.rb.g.gain.setTargetAtTime(a.wk?0:(me.off?Math.min(1,sp/12)*0.35:soft?Math.min(1,sp/25)*0.04:0)*vol,t,0.1);
  // ветер в открытой машине: на скорости свистит всё громче и выше
  const inT=me.tun?1:0,w=clamp((sp-7)/38,0,1);a.wd.fl.frequency.setTargetAtTime(380+sp*14,t,0.2);a.wd.g.gain.setTargetAtTime(Math.pow(w,1.4)*0.11*vol*(R.t>0?1:0)*(inT?0.35:1),t,0.25);
  // тоннель: гул и эхо мотора
  if(a.rv){a.rv.gain.setTargetAtTime(inT?0.6:0,t,inT?0.12:0.3);a.dg.gain.setTargetAtTime(inT?0.4:0,t,inT?0.12:0.3);}
  if(a.rn){const S=me.surf||'',rain=!!(R.wx&&R.wx.rain);
    // дождь: шорох капель и гул; под сводом почти не слышен
    const rk=(R.rainK!==undefined?R.rainK:rain?1:0)*(typeof AMB!=='undefined'&&AMB.buf.rain?0.35:1);a.rn.g.gain.setTargetAtTime(rk*(inT?0.008:0.075)*vol,t,0.5);a.rl.g.gain.setTargetAtTime(rk*(inT?0.004:0.05)*vol,t,0.5);
    // мокрая дорога: шины шипят и разбрызгивают воду
    a.wh.g.gain.setTargetAtTime(a.wk?0:(rain&&!inT&&!me.off&&S!=='puddle'?1:0)*Math.min(1,sp/25)*0.085*vol,t,0.1);
    // щебень, грунт, булыжник, камни — хруст и дробь (прерывисто)
    const cr=!a.wk&&(S==='macadam'||S==='dirt'||S==='mount'||S==='verge'||S==='rock'||S==='pave'||S==='field')?Math.min(1,sp/14):0;a.gr.g.gain.setTargetAtTime(cr*(S==='pave'?0.05:0.08)*vol*(0.55+0.45*Math.random()),t,0.04);
    // в луже и грязи — плеск
    a.sw.g.gain.setTargetAtTime((S==='puddle'||S==='mudhole'?Math.min(1,sp/9):0)*0.2*vol,t,0.05);}
}
function auScreech(v){}
function auRaceStop(){try{ambStop();}catch(_){}const a=AU.race;if(a&&a.wk){const w=a.wk;a.g.gain.setTargetAtTime(0,AU.ctx.currentTime,0.12);setTimeout(()=>{if(EN.node===w)enStop();else try{w.disconnect();}catch(_){}},600);}if(a){const t=AU.ctx.currentTime;a.g.gain.setTargetAtTime(0,t,0.1);[a.sq,a.sn,a.br,a.bn,a.rb,a.wd,a.rn,a.rl,a.wh,a.gr,a.sw].forEach(x=>x&&x.g.gain.setTargetAtTime(0,t,0.05));if(a.rv){a.rv.gain.setTargetAtTime(0,t,0.05);a.dg.gain.setTargetAtTime(0,t,0.05);}
  [a.o1,a.o2,a.lfo,a.sq.o,a.sq.v,a.sn.s,a.br.o,a.br.v,a.bn.s,a.rb.s,a.wd.s].concat(a.rn?[a.rn.s,a.rl.s,a.wh.s,a.gr.s,a.sw.s]:[]).forEach(n=>{try{n.stop(t+0.5);}catch(e){}});AU.race=null;}setTimeout(auApply,50);}

