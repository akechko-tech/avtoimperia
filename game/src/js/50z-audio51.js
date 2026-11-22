/* ================= 0.51, этап 10: звук — «что сейчас звучит» и плейлист без повторов =================
   Автор: писк и задвоение ещё слышны иногда — «в настройках показать, что сейчас звучит, чтобы прислать список в момент сбоя»;
   музыка однообразна — «шире плейлист эпохи, реже повторы».
   1. auNowList — всё, что играет в эту секунду (запись, синтезатор, сигнал, диктор, мотор, окружение гонки), и последние звуковые
      события с временем. В «Настройках» — список и кнопка «Скопировать».
   2. Плейлист помнит, что уже звучало (и между запусками игры): при каждой пересборке — а она идёт каждый игровой год — недавно
      слышанные записи уходят в конец, давно не звучавшие — вперёд. Раньше порядок каждый год тасовался заново с теми же весами,
      и одни и те же записи возвращались через несколько минут, хотя в эпохе их от 67 (1895) до 272 (1925). */
// ---------- журнал звуковых событий ----------
const AU_LOG=[];
function auLog(what){try{const t=Date.now(),L=AU_LOG[AU_LOG.length-1];if(L&&L.w===what&&t-L.t<4000){L.n=(L.n||1)+1;L.t=t;return;}AU_LOG.push({t,w:String(what).slice(0,70)});if(AU_LOG.length>40)AU_LOG.shift();}catch(_){}}
function auPlaying(a){return !!(a&&a.paused===false&&!a.ended);}
function auNowList(){const L=[],p=(k,v)=>L.push(k+': '+v);let src=0;
  try{const tr=AU.nowPlaying||(typeof musCur==='function'?musCur():null);
    if(auPlaying(AU.el)){src++;p('музыка, запись',(tr&&tr.title||'?')+' · '+Math.round(AU.el.currentTime)+' с · громкость '+(+AU.el.volume).toFixed(2));}
    if(AU.synth){src++;p('музыка, синтезатор',(AU.synth.tune||AU.synth.title||AU.synth.st||'?')+(AU.synth.cue?' (сигнал)':''));}
    if(AU.cue&&auPlaying(AU.cue.a)){src++;p('сигнал',decodeURIComponent(String(AU.cue.a.src||'').split('/').pop()).slice(0,40)+' · '+Math.round(AU.cue.a.currentTime)+' с');}
    if(typeof CUE!=='undefined')Object.keys(CUE).forEach(id=>{const a=CUE[id];if(auPlaying(a)&&!(AU.cue&&AU.cue.a===a)){src++;p('сигнал вне очереди',id);}});
    if(typeof VOICE!=='undefined'&&auPlaying(VOICE.el)){src++;p('диктор',decodeURIComponent(String(VOICE.el.src||'').split('/').pop()).slice(0,40));}
    if(typeof window!=='undefined'&&window.speechSynthesis&&window.speechSynthesis.speaking){src++;p('голос телефона','читает');}
    if(AU.race)p('гонка','мотор и шины');
    if(typeof AMB!=='undefined'&&AMB.on)p('окружение гонки',Object.keys(AMB.beds||{}).filter(k=>AMB.beds[k]).join(', ')||'включено');
    if(typeof REEL!=='undefined'&&REEL)p('кинохроника','идёт');
    if(typeof SAGAP!=='undefined'&&SAGAP)p('фильм','идёт');
    p('звуковой движок',AU.ctx?AU.ctx.state+', '+AU.ctx.sampleRate+' Гц':'не запущен');
    p('настройки','музыка '+(AU.on.music?'вкл':'выкл')+', звуки '+(AU.on.sfx?'вкл':'выкл')+', музыка в гонке '+(AU.on.race?'вкл':'выкл')+(AU.paused?', пауза':''));
  }catch(e){p('ошибка списка',String(e));}
  if(src>1)L.unshift('⚠ одновременно звучит источников: '+src);
  return L;}
function auNowText(){const now=Date.now(),ev=AU_LOG.slice(-25).map(e=>'  −'+Math.round((now-e.t)/1000)+' с  '+e.w+(e.n>1?' ×'+e.n:''));
  return ['Автоимперия '+(typeof GAME_VER!=='undefined'?GAME_VER:'')+' · '+new Date().toLocaleString('ru-RU'),(typeof G!=='undefined'&&G?MONTHS[G.m]+' '+G.y+' · вкладка '+(typeof tab!=='undefined'?tab:'')+(typeof R!=='undefined'&&R?' · гонка':''):'меню'),'Сейчас звучит:'].concat(auNowList().map(x=>'  '+x),['Последние звуковые события:'],ev.length?ev:['  (пусто)']).join('\n');}
function auNowHTML(){return `<div class="label" style="margin-top:14px">Что сейчас звучит</div><p class="small muted" style="margin-top:4px">Услышали писк или две мелодии сразу — откройте настройки, нажмите «Скопировать» и пришлите список.</p><pre class="au-now" id="auNow">${esc(auNowText())}</pre><div class="btns" style="margin-top:6px"><button class="btn" data-act="auNow">Обновить</button><button class="btn" data-act="auNowCopy">Скопировать</button></div>`;}
// события: кто что запустил (обёртки не меняют звук, только записывают)
(function(){const W=(name,fmt)=>{try{const f=eval(name);if(typeof f!=='function')return;const g=function(){try{auLog(fmt.apply(null,arguments));}catch(_){}return f.apply(this,arguments);};eval(name+'=g');}catch(_){}};
  W('auCue',id=>'сигнал '+id);W('auCueSrc',id=>'сигнал '+id);W('auFanfare',k=>'фанфара '+k);W('auSfx',t=>'звук '+t);W('auTuneCue',k=>'мелодия-сигнал '+k);
  W('voiceSay',t=>'диктор: '+String(t||'').slice(0,36));W('auRaceStart',()=>'гонка: старт звука');W('auRaceStop',()=>'гонка: стоп звука');W('musNext',(d,u)=>'следующая запись'+(u?' (кнопкой)':''));})();
// ---------- плейлист без повторов ----------
const MUS_HIST_KEY='avt-mushist';let MUS_HIST=null;
function musHKey(t){return t?(t.id||t.title||''):'';}
function musHist(){if(MUS_HIST)return MUS_HIST;try{MUS_HIST=JSON.parse(localStorage.getItem(MUS_HIST_KEY)||'[]');if(!Array.isArray(MUS_HIST))MUS_HIST=[];}catch(e){MUS_HIST=[];}return MUS_HIST;}
function musHeard(t){const k=musHKey(t);if(!k)return;const H=musHist(),i=H.indexOf(k);if(i>=0)H.splice(i,1);H.push(k);while(H.length>300)H.shift();try{localStorage.setItem(MUS_HIST_KEY,JSON.stringify(H));}catch(e){}auLog('запись: '+String(t.title||k).slice(0,44));}
// свежие (давно или никогда не звучавшие) — вперёд в своём порядке; слышанные — в конец, самые давние из них раньше
function musFresh(L){const H=musHist();if(!H.length||L.length<4)return L;const pos={};H.forEach((k,i)=>pos[k]=i);
  const fresh=L.filter(t=>pos[musHKey(t)]===undefined),old=L.filter(t=>pos[musHKey(t)]!==undefined).sort((a,b)=>pos[musHKey(a)]-pos[musHKey(b)]);return fresh.concat(old);}
