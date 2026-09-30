# Офлайн-рендер звука моторов (AudioWorklet) для проверки: частота вспышек, громкость, отсутствие щелчков
# python3 test/engine_render.py [типы через запятую]
from playwright.sync_api import sync_playwright
import sys, base64, struct, wave, json
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/snd/'
types=(sys.argv[1] if len(sys.argv)>1 else 's1h,t2,i4b,i4,i6,i8sc,v8x,v12aero,steam,elec').split(',')
surf=sys.argv[2] if len(sys.argv)>2 else ''
JS='''async (cfg)=>{
  const sr=48000,secs=cfg.secs,ctx=new OfflineAudioContext(2,sr*secs,sr);
  const src='('+avtEngineWorklet.toString()+')();';
  await ctx.audioWorklet.addModule('data:application/javascript;charset=utf-8,'+encodeURIComponent(src));
  const n=new AudioWorkletNode(ctx,'avt-engine',{numberOfInputs:0,numberOfOutputs:1,outputChannelCount:[2]});n.connect(ctx.destination);
  const T=EN_TYPE[cfg.t],p=Object.assign({kind:'ic',cyc:2},T,enFire(T.c),{type:cfg.t});p.muff=p.open>0.5?1600:900;if(p.open===undefined)p.open=0.55;
  n.port.postMessage({t:'mk',id:1,p});
  const road=cfg.surf?{v:30,g:1,s:cfg.surf,wet:0,sq:cfg.surf==='squeal'?1:0,sc:0,ro:0.3,ty:1}:null;if(road&&road.s==='squeal')road.s='asphalt';
  const st=t=>{const idle=Math.max(p.idle,1),mx=p.max;
    // 0-2 с: холостые; 2-3.5: полный газ стоя; 3.5-9.5: разгон от холостых до максимума; 9.5-12: сброс газа
    if(t<2)return {rpm:idle,ld:0};if(t<3.5)return {rpm:idle+(0.6*mx-idle)*Math.min(1,(t-2)/0.6),ld:1};
    if(t<9.5)return {rpm:idle+(mx-idle)*(t-3.5)/6,ld:1};return {rpm:mx*(1-0.45*(t-9.5)/2.5),ld:0};};
  for(let k=0;k<secs/0.1;k++){const t=k*0.1;ctx.suspend(t).then(()=>{const s=st(t);n.port.postMessage({t:'set',v:[{id:1,rpm:s.rpm,ld:s.ld,g:cfg.surf?0:0.9,pan:0,lp:14000,spd:(s.rpm/p.max)*35}],r:road?Object.assign({},road,{v:road.v*(t/secs)*2}):null});ctx.resume();});}
  const b=await ctx.startRendering(),d=b.getChannelData(0);const i16=new Int16Array(d.length);let pk=0,ss=0;for(let i=0;i<d.length;i++){const x=d[i];pk=Math.max(pk,Math.abs(x));ss+=x*x;i16[i]=Math.max(-32767,Math.min(32767,x*32767));}
  let bin='';const u8=new Uint8Array(i16.buffer);for(let i=0;i<u8.length;i+=8192)bin+=String.fromCharCode.apply(null,u8.subarray(i,i+8192));
  return {pk,rms:Math.sqrt(ss/d.length),b64:btoa(bin),idle:p.idle,max:p.max,cyl:p.fire.length,cyc:p.cyc};}'''
with sync_playwright() as pw:
    b=pw.chromium.launch()
    for t in types:
        pg=b.new_page()
        pg.route(lambda u:not u.startswith('file:'),lambda r:r.abort())
        pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(300)
        r=pg.evaluate(JS,{'t':t,'secs':12,'surf':surf})
        a=base64.b64decode(r['b64'])
        with wave.open(out+('road_'+surf if surf else 'eng_'+t)+'.wav','wb') as w:
            w.setnchannels(1);w.setsampwidth(2);w.setframerate(48000);w.writeframes(a)
        print(surf or t,'peak %.2f rms %.3f idle %d max %d cyl %d'%(r['pk'],r['rms'],r['idle'],r['max'],r['cyl']),flush=True)
        pg.close()
    b.close()
