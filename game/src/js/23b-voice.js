/* ================= ГОЛОС ДИКТОРА: заранее записанный живой голос (нейросеть Silero) вместо синтезатора телефона ================= */
// Каждая строка текста + голос → ключ (FNV-1a) → voice/<ключ>.mp3; длительности — в voice/index.js (window.VOICE_INDEX).
// Голоса: aidar — диктор кинохроники; baya — рассказчица фильма о герое; eugene — мужские роли, xenia — женские роли.
// Нет записи (например, текст с названием вашей компании) — читает синтезатор устройства.
const VOICE={idx:null,el:null,cb:null,loadP:null,unlocked:false,t:0};
const VOICE_SILENT='data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjYwLjE2LjEwMAAAAAAAAAAAAAAA//NwwAAAAAAAAAAAAEluZm8AAAAPAAAACAAAA/oAR0dHR0dHR0dHR0dHYmJiYmJiYmJiYmJifHx8fHx8fHx8fHx8fJaWlpaWlpaWlpaWlrGxsbGxsbGxsbGxsbHLy8vLy8vLy8vLy8vl5eXl5eXl5eXl5eXl////////////////AAAAAExhdmM2MC4zMQAAAAAAAAAAAAAAACQC1AAAAAAAAAP6yysejgAAAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NCxKMAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NAxKQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80LEowAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80DEpAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsSjAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==';
function voiceHash(text,spk){let h=0x811c9dc5;const s=(spk||'aidar')+'|'+String(text||'').replace(/\s+/g,' ').trim();for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(16).padStart(8,'0');}
function voiceLoad(){if(VOICE.idx)return Promise.resolve(VOICE.idx);if(VOICE.loadP)return VOICE.loadP;
  VOICE.loadP=new Promise(res=>{if(window.VOICE_INDEX){VOICE.idx=window.VOICE_INDEX;res(VOICE.idx);return;}
    try{const s=document.createElement('script');s.src='voice/index.js';s.async=true;s.onload=()=>{VOICE.idx=window.VOICE_INDEX||{};res(VOICE.idx);};s.onerror=()=>{VOICE.idx={};res(VOICE.idx);};document.head.appendChild(s);}catch(e){VOICE.idx={};res(VOICE.idx);}});
  return VOICE.loadP;}
function voiceDur(text,spk){const d=VOICE.idx&&VOICE.idx[voiceHash(text,spk)];return d||0;}
function voiceUrl(text,spk){return 'voice/'+voiceHash(text,spk)+'.mp3';}
// Разрешить звук: браузеры дают играть голос только после нажатия — «разогреваем» проигрыватель прямо в обработчике нажатия
function voiceUnlock(){if(VOICE.unlocked)return;try{const a=VOICE.el||(VOICE.el=new Audio());a.src=VOICE_SILENT;const p=a.play();if(p&&p.then)p.then(()=>{VOICE.unlocked=true;}).catch(()=>{});else VOICE.unlocked=true;}catch(e){}}
// Сказать строку. Возвращает длительность в секундах (0 — голоса нет); onEnd — когда договорит
function voiceSay(text,spk,onEnd){voiceStop();const t=String(text||'').trim();if(!t||!reelVoiceOn())return 0;const d=voiceDur(t,spk);
  if(d){const a=VOICE.el||(VOICE.el=new Audio());a.preload='auto';let done=false;const fin=()=>{if(done)return;done=true;a.onended=a.onerror=null;if(VOICE.cb===fin)VOICE.cb=null;onEnd&&onEnd();};
    a.onended=fin;a.onerror=()=>{if(ttsSay(t,onEnd)){done=true;return;}fin();};a.src=voiceUrl(t,spk);a.volume=1;VOICE.cb=fin;VOICE.t=performance.now();
    const p=a.play();if(p&&p.catch)p.catch(()=>setTimeout(fin,d*1000));return d;}
  if(ttsSay(t,onEnd))return Math.max(2.5,t.length/13);return 0;}
function voicePreload(text,spk){const t=String(text||'').trim();if(!t||!voiceDur(t,spk))return;try{const a=new Audio();a.preload='auto';a.src=voiceUrl(t,spk);VOICE.pre=a;}catch(e){}}
function voiceStop(){try{if(VOICE.el){VOICE.el.onended=VOICE.el.onerror=null;VOICE.el.pause();}}catch(_){}VOICE.cb=null;ttsStop();}
function voicePause(on){try{if(VOICE.el&&VOICE.el.src&&!VOICE.el.src.startsWith('data:')){if(on)VOICE.el.pause();else{const p=VOICE.el.play();if(p&&p.catch)p.catch(()=>{});}}}catch(_){}try{if(window.speechSynthesis){on?speechSynthesis.pause():speechSynthesis.resume();}}catch(_){}}
// Голос героя фильма: женские роли — xenia, мужские — eugene
const VOICE_FEM=/^(Клара|Барбара|Адальджиза|Графиня|Паолина|Баронесса|Княгиня|Королева|Берта|Мерседес|Мари|Мария|Жанна|Анна|Элиза|Эмма|Люси|Джейн|Роза|Кристина|Луиза|Катарина|Жозефина|Маргарита|Эдит|Ирэн|Изабель|Элен|Сюзанна|Аделаида|Каролина|Лаура|Лиза|Софи|Мадлен|Мать|Мама|Жена|Дочь|Сестра|Бабушка|Вдова|Госпожа|Мадам|Миссис|Синьора|Фрау|Хозяйка|Секретарша|Продавщица|Горничная|Служанка|Учительница|Журналистка|Медсестра|Работница|Девушка|Женщина|Дама)/i;
function voiceOfWho(who){return VOICE_FEM.test(String(who||'').trim())?'xenia':'eugene';}
try{setTimeout(()=>voiceLoad(),1500);}catch(e){}
