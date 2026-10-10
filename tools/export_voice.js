// Все строки, которые читает живой диктор: кинохроника, фильм о герое (рассказчица и роли), вступления к гонкам.
// node tools/export_voice.js → tools/media/voice_lines.json [{h, s, v}] — h как в игре (voiceHash), s — текст, v — голос
const path=require('path'),fs=require('fs');
require(path.join(__dirname,'../game/test/harness.js'))(`
const out=[],seen=new Set();
const add=(t,v)=>{t=String(t||'').replace(/\\s+/g,' ').trim();if(!t||/[{}]/.test(t))return;const h=voiceHash(t,v);if(seen.has(h))return;seen.add(h);out.push({h,s:t,v});};
for(const k in REELS)REELS[k].sh.forEach(sh=>{if(sh.say)add(sh.say,'aidar');});
for(const k in VGEN)add(VGEN[k],'aidar');
// 0.25: у главы бывают варианты (v) — по положению дел в игре; голос нужен всем
const chv=ch=>{(ch.sc||[]).forEach(sc=>{if(sc.who)add(sc.line,voiceOfWho(sc.who));else add(sc.say,SAGA_NARR);});if(ch.q)add(ch.q,SAGA_NARR);(ch.o||[]).forEach(o=>add(o.res,SAGA_NARR));};
for(const p in SAGA)SAGA[p].forEach(ch=>{chv(ch);(ch.v||[]).forEach(chv);});
RACES.forEach(rc=>add(raceIntroText(rc),'aidar'));
// 0.19: исторические сценарии (рассказ перед стартом и титры с голосом) и диктор с трибуны
for(const id in SCN){const S=SCN[id];if(S.b)add(S.b,'aidar');(S.ev||[]).forEach(e=>{if(e.v)add(scnSpeech(e.t),'aidar');});}
annLines().forEach(t=>add(t,'eugene'));
// 0.30: механик рядом с гонщиком — крик в открытой машине (голос eugene, своя обработка: nav)
navLines().forEach(t=>add(t,'nav'));
const by={};out.forEach(o=>{by[o.v]=(by[o.v]||0)+o.s.split(' ').length;});
require('fs').writeFileSync(${JSON.stringify(path.join(__dirname,'media/voice_lines.json'))},JSON.stringify(out,null,0));
console.log('lines',out.length,'words by voice',JSON.stringify(by));
`);
