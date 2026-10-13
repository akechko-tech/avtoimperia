// 0.34: голос механика одним файлом — docs/voice/nav.js (base64 всех слов легенды и криков механика, ≈1 МБ).
// В приложении файл вшит (сборка APK копирует его в assets/voice) — механик читает легенду и без сети; на сайте —
// один запрос вместо сотни. Раньше каждое слово грузилось с сайта отдельно, и при медленной сети фразы пропадали.
// Запуск: node tools/nav_voice_pack.js (после python3 tools/sync_media.py voice — там он вызывается сам)
const path=require('path');const root=path.join(__dirname,'..');
require(path.join(root,'game/test/harness.js'))(`
const fs=require('fs'),dir=${JSON.stringify(path.join(root,'docs/voice'))},out={},miss=[];
for(const t of [...new Set(navLines())]){const h=voiceHash(t,'nav'),f=dir+'/'+h+'.mp3';if(fs.existsSync(f))out[h]=fs.readFileSync(f).toString('base64');else miss.push(t);}
fs.writeFileSync(dir+'/nav.js','window.NAV_VOICE='+JSON.stringify(out)+';\\n');
console.log('голос механика: '+Object.keys(out).length+' фраз, '+Math.round(fs.statSync(dir+'/nav.js').size/1024)+' КБ'+(miss.length?'; без записи: '+miss.join(' | '):''));
`);
