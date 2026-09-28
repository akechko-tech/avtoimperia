// Минимальная имитация браузера для прогонов модели в node
const el=()=>new Proxy({style:{},classList:{add(){},remove(){},toggle(){},contains(){return false}},dataset:{},firstChild:{},addEventListener(){},removeEventListener(){},querySelectorAll:()=>[],querySelector:()=>null,getContext:()=>null,hidden:true,appendChild(){},setAttribute(){},getAttribute(){return null}},{get:(t,k)=>k in t?t[k]:undefined,set:(t,k,v)=>{t[k]=v;return true}});
global.document={getElementById:()=>el(),addEventListener(){},querySelectorAll:()=>[],querySelector:()=>null,createElement:()=>el(),body:el()};
global.window={matchMedia:()=>({matches:true}),scrollTo(){},devicePixelRatio:1,addEventListener(){},orientation:0};global.matchMedia=window.matchMedia;
const store={};global.localStorage={getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}};
global.requestAnimationFrame=()=>0;global.cancelAnimationFrame=()=>{};global.performance={now:()=>Date.now()};
global.setTimeout=()=>0;global.setInterval=()=>0;global.clearInterval=()=>{};global.fetch=()=>Promise.reject();global.Audio=function(){return el();};
const fs=require('fs'),path=require('path');
const dir=path.join(__dirname,'../src/js');
const code=fs.readdirSync(dir).filter(f=>f.endsWith('.js')&&f!=='99-boot.js').sort().map(f=>fs.readFileSync(path.join(dir,f),'utf8')).join('\n');
module.exports=function(extra){return eval(code+'\n'+extra);};
