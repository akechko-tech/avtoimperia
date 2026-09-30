// Все строки, которые читает живой диктор: кинохроника, фильм о герое (рассказчица и роли), вступления к гонкам.
// node tools/export_voice.js → tools/media/voice_lines.json [{h, s, v}] — h как в игре (voiceHash), s — текст, v — голос
const path=require('path'),fs=require('fs');
require(path.join(__dirname,'../game/test/harness.js'))(`
const out=[],seen=new Set();
const add=(t,v)=>{t=String(t||'').replace(/\\s+/g,' ').trim();if(!t||/[{}]/.test(t))return;const h=voiceHash(t,v);if(seen.has(h))return;seen.add(h);out.push({h,s:t,v});};
for(const k in REELS)REELS[k].sh.forEach(sh=>{if(sh.say)add(sh.say,'aidar');});
for(const k in VGEN)add(VGEN[k],'aidar');
for(const p in SAGA)SAGA[p].forEach(ch=>{ch.sc.forEach(sc=>{if(sc.who)add(sc.line,voiceOfWho(sc.who));else add(sc.say,SAGA_NARR);});add(ch.q,SAGA_NARR);(ch.o||[]).forEach(o=>add(o.res,SAGA_NARR));});
RACES.forEach(rc=>add(raceIntroText(rc),'aidar'));
const by={};out.forEach(o=>{by[o.v]=(by[o.v]||0)+o.s.split(' ').length;});
require('fs').writeFileSync(${JSON.stringify(path.join(__dirname,'media/voice_lines.json'))},JSON.stringify(out,null,0));
console.log('lines',out.length,'words by voice',JSON.stringify(by));
`);
