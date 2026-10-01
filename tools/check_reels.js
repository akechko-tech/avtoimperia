// Проверка сценариев кинохроники 0.18: node tools/check_reels.js game/src/js/24b-reels-a.js [...]
// Формат: Object.assign(REELS,{'race:pbp':{t,y,mus,sh:[...]}, ...}) — см. tools/REELS_GUIDE.md
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..');
const man=fs.readFileSync(path.join(ROOT,'docs/img/manifest.js'),'utf8');const IMGK=new Set(Object.keys(JSON.parse(man.slice(man.indexOf('{'),man.lastIndexOf('}')+1))));
// 0.25: новые фото для роликов — ключи «x:…», файлы Викисклада перечислены в tools/reels_input/photos_*.json
const XPH={};try{for(const f of fs.readdirSync(path.join(ROOT,'tools/reels_input')))if(/^photos_.*\.json$/.test(f))Object.assign(XPH,JSON.parse(fs.readFileSync(path.join(ROOT,'tools/reels_input',f),'utf8')));}catch(_){}
try{const ex=fs.readFileSync(path.join(ROOT,'docs/img/extra.js'),'utf8');Object.keys(JSON.parse(ex.slice(ex.indexOf('{'),ex.lastIndexOf('}')+1))).forEach(k=>XPH[k]=XPH[k]||1);}catch(_){}
// 0.25: живые чертежи — их список берём из файлов схем
const DIAGS=new Set();for(const f of ['24h-diag-mech.js','24i-diag-chassis.js'])try{const t=fs.readFileSync(path.join(ROOT,'game/src/js',f),'utf8');for(const m of t.matchAll(/DIAG\.([a-z_0-9]+)=/g))DIAGS.add(m[1]);}catch(_){}
const TAGS=new Set(['sf1906','titanic','lindbergh','michelin','balloon_tyre','street1900','street1910','street1920','country_road','race_start','race_run','race_track','race_crowd','race_mountain','factory_work','assembly_line','car_parade','motor_show','expo1900','war_convoy','armistice','train_steam','aviation','zeppelin','jazz_dance','crash1929','horse_cart','fire_engine','bus_taxi','road_build','farm_tractor']);
const MUS=new Set(['rag','march','waltz','cake','tango','fox','charl','jazz']);
let REELS={};global.REELS=REELS;
const files=process.argv.slice(2);let bad=0,warn=0,nReels=0,words=0;
const err=(f,k,m)=>{bad++;console.log('ОШИБКА',path.basename(f),k,'—',m);},wrn=(f,k,m)=>{warn++;console.log('замечание',path.basename(f),k,'—',m);};
for(const f of files){const before=new Set(Object.keys(REELS));
  try{eval(fs.readFileSync(f,'utf8'));}catch(e){err(f,'*','не читается: '+e.message);continue;}
  for(const k of Object.keys(REELS)){if(before.has(k))continue;const R=REELS[k];nReels++;
    if(!R||typeof R.t!=='string'||!Array.isArray(R.sh)){err(f,k,'нет t или sh');continue;}
    if(R.y!==undefined&&!(R.y>=1880&&R.y<=1935))err(f,k,'год y вне 1880–1935');
    if(R.mus&&!MUS.has(R.mus))err(f,k,'mus: '+R.mus);
    let w=0,voiced=0;
    R.sh.forEach((s,i)=>{const id=k+' #'+i;
      const kinds=['c','v','i','plant','car','q','d'].filter(x=>s[x]!==undefined);
      if(s.d!==undefined&&!DIAGS.has(s.d))err(f,id,'нет такого чертежа d: '+s.d);
      if(!kinds.length)err(f,id,'кадр без типа (c/v/i/plant/car/q/d)');
      if(s.v!==undefined&&!TAGS.has(s.v))err(f,id,'неизвестная метка кинохроники v: '+s.v);
      if(s.i!==undefined&&!IMGK.has(s.i)&&!XPH[s.i])err(f,id,'нет такого фото i: '+s.i+(String(s.i).startsWith('x:')?' (впишите файл Викисклада в tools/reels_input/photos_*.json)':''));
      if(s.say!==undefined){const t=String(s.say);voiced++;
        if(/\{(co|city|y|name)\}/.test(t))err(f,id,'в тексте диктора нельзя {co}/{city}/{y}/{name}');
        const dig=t.replace(/\b1[89]\d\d(?=\s*год(?:а|у|ом|ах|ов|ы)?(?![а-яё]))/g,'');
        if(/\d/.test(dig))err(f,id,'цифры в тексте диктора (кроме года перед словом «год»): '+t.slice(0,80));
        if(/[«»"]/.test(t)&&0)wrn(f,id,'кавычки');
        const n=t.split(/\s+/).filter(Boolean).length;w+=n;if(n>70)wrn(f,id,'длинная реплика ('+n+' слов) — лучше разбить на два кадра');}
      if(s.c!==undefined&&typeof s.c!=='string')err(f,id,'c — не строка');});
    words+=w;
    if(R.sh.length<7)wrn(f,k,'мало кадров ('+R.sh.length+')');
    if(w<130)wrn(f,k,'коротко: '+w+' слов (нужно 150–260)');if(w>320)wrn(f,k,'длинно: '+w+' слов');
    if(!R.sh.some(s=>s.v!==undefined))wrn(f,k,'нет ни одного кадра кинохроники (v)');
    if(/^part:/.test(k)&&!R.sh.some(s=>s.d!==undefined))wrn(f,k,'ролик о детали без чертежа (d)');
    if(/^part:/.test(k)&&R.sh.some(s=>s.plant))wrn(f,k,'в ролике о детали не нужен кадр завода игрока: концовку игра добавит сама');}}
console.log(`\nроликов ${nReels}, слов диктора ${words}, ошибок ${bad}, замечаний ${warn}`);process.exit(bad?1:0);
