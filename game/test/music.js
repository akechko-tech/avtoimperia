// Оркестрион: новые танцы и свои мелодии игры — ноты звучат, у каждой пьесы есть конец, диапазон нот разумный
require('./harness.js')(`
const notes=[];let now=0;
const param=()=>({value:0,setValueAtTime(){},exponentialRampToValueAtTime(){},linearRampToValueAtTime(){},setTargetAtTime(){}});
const node=()=>({connect(){},disconnect(){},start(){},stop(){},frequency:param(),detune:param(),gain:param(),Q:param(),type:'',buffer:null,loop:false});
const ctx={get currentTime(){return now;},createOscillator(){const o=node();const st=o.start;o.start=t=>{notes.push({t,f:o.frequency.value});};return o;},createGain:node,createBiquadFilter:node,createBufferSource:node,createDynamicsCompressor:node,createBuffer:()=>({getChannelData:()=>new Float32Array(10)}),destination:{},sampleRate:44100};
AU.ctx=ctx;AU.mus=node();AU.fx=node();AU.master=node();AU.noise={};AU.on.music=true;AU.paused=false;
let nextCalled=0;const _mn=musNext;musNext=function(d){nextCalled++;};
global.setTimeout=(f,ms)=>{pend.push({f,at:now+ms/1000});return 1;};const pend=[];
newGame('custom','fr','T','normal');
const tracks=[...Object.keys(TUNES).map(k=>({synth:true,st:'tune',tune:k,title:'tune '+k})),...['rag','march','jazz','waltz','cake','tango','fox','charl'].map(st=>({synth:true,st,v:0,title:'st '+st}))];
tracks.forEach(tr=>{notes.length=0;nextCalled=0;pend.length=0;now=0;AU.next=0.1;AU.step=0;AU.synth=tr;tr.end=0;AU.mel=0;
  let t=0;while(t<600&&!nextCalled){now=t;auSched();pend.filter(p=>p.at<=now).forEach(p=>{p.f();p.done=1;});pend.splice(0,pend.length,...pend.filter(p=>!p.done));t+=0.05;}
  const mel=notes.filter(n=>n.f>300).map(n=>Math.round(69+12*Math.log2(n.f/440)));
  console.log(tr.title.padEnd(12),'длится',t.toFixed(0)+' с','нот',notes.length,'мелодия',mel.length?Math.min(...mel)+'–'+Math.max(...mel):'-','конец',nextCalled?'да':'НЕТ');});
console.log('плейлист эпохи 1900:',(G.y=1900,musSynth().map(x=>x.title).join(' | ')));
console.log('плейлист эпохи 1925:',(G.y=1925,musSynth().map(x=>x.title).join(' | ')));
`);
