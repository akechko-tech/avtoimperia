// 0.51: по подсказке можно доехать. Робот (drive51.js) едет «газ в пол» и тормозит, только когда подсказка говорит «ТОРМОЗИ!» —
// как игрок, который верит экрану. В 0.50 он сходил в первой шпильке Клаузена и Тарга Флорио: тормозной путь в подсказке считался
// по тормозам вдвое сильнее настоящих, а шпильку за плавной дугой подсказка не видела. node game/test/hnd51.js
const cp=require('child_process'),path=require('path');
const runs=[['klausen-1922','car',420],['klausen-1922','moto',520],['ventoux-1913','car',420],['monza1922-1922','car',260],['lyon1914-1914','car',300]];
const one=(k,cls,sec,mode)=>new Promise(res=>{cp.execFile('node',[path.join(__dirname,'drive51.js'),k,cls,String(sec)],{env:Object.assign({},process.env,mode?{MODE:mode}:{}),maxBuffer:1e7},(e,out)=>{
  const l=(out||'').split('\n').find(x=>/\| время /.test(x))||'';const m=l.match(/время (\d+) с/),o=l.match(/вылетов (\d+)/);res({k,cls,mode:mode||'hint',fin:/ФИНИШ/.test(l),dnf:/СХОД/.test(l),t:m?+m[1]:0,off:o?+o[1]:99,line:l.trim()});});});
(async()=>{let ok=0,bad=0;const CK=(c,m)=>{if(c)ok++;else{bad++;console.log('FAIL',m);}};
  const all=await Promise.all(runs.flatMap(r=>[one(r[0],r[1],r[2]),one(r[0],r[1],r[2],'ai')]));
  for(const r of runs){const h=all.find(x=>x.k===r[0]&&x.cls===r[1]&&x.mode==='hint'),a=all.find(x=>x.k===r[0]&&x.cls===r[1]&&x.mode==='ai');
    CK(h.fin&&!h.dnf,r[0]+' '+r[1]+': по подсказке — финиш | '+h.line.slice(0,150));
    CK(h.off<=1,r[0]+' '+r[1]+': вылетов '+h.off+' (в 0.50 — сход или 3–5 вылетов в горах)');
    CK(a.fin&&h.t<=a.t*1.08,r[0]+' '+r[1]+': время '+h.t+' с — не хуже соперника на той же машине больше чем на 8% ('+a.t+' с)');}
  console.log(bad?'FAILED '+bad:'ok '+ok);if(bad)process.exitCode=1;})();
