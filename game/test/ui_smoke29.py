# 0.29: дымовой прогон в браузере — все вкладки после сделки; Lancia из пути гонщика: «Тип 51», легенды и имена моделей.
# python3 game/test/ui_smoke29.py
from playwright.sync_api import sync_playwright
import os
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/m29/'
os.makedirs(out,exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':400,'height':860},device_scale_factor=2)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append('C:'+m.text) if m.type=='error' and 'net::' not in m.text and 'Failed to load' not in m.text else None)
    pg.route(lambda u:not u.startswith('file:'),lambda r:r.abort())
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(500)
    js=lambda s:pg.evaluate(s)
    clean="(()=>{for(let i=0;i<6;i++)closePaper();closeSheet();if(SAGAP)try{sagaStop();}catch(_){}G.pending=[];})()"
    pg.click('[data-act=newgame]');pg.click('[data-act=pion][data-v=agnelli]');pg.click('[data-act=startgame]');pg.wait_for_timeout(300);js(clean)
    for i in range(130): js("(()=>{G.pending=[];if(G.cash<3e5)G.cash+=3e5;doStep();closeSheet();closePaper();G.pending=[];if(SAGAP)try{sagaStop();}catch(_){}})()")
    print('date',js("dstr(G)"),'models',js("G.models.map(m=>m.name+':'+m.status).join(', ')"))
    # сделка с итальянской маркой (с гарантией согласия)
    r=js("""(()=>{const L=(COMPS.it||[]).map((cp,i)=>({cp,i})).filter(o=>!dealBlock(G,'it',o.i));if(!L.length)return 'нет марок';const o=L[L.length-1];G.cash+=dealValue(G,'it',o.i)*2;
      const R0=Math.random;Math.random=()=>0.0001;const r=dealDo(G,'it',o.i,'buy',1.2);Math.random=R0;return r?(r.ok?'куплена '+r.nm:'отказ'):'нельзя';})()""")
    print('deal:',r);js(clean)
    for t in ['plant','models','market','race','empire']:
        js(f"(()=>{{tab='{t}';render();window.scrollTo(0,0);}})()");pg.wait_for_timeout(250)
        pg.screenshot(path=out+f'smoke_{t}.png',full_page=(t=='models'))
    # карточка купленной модели: раскрыть и прочитать пометку 🤝
    print('acq note:',js("(()=>{const m=G.models.find(x=>x.acq);if(!m)return 'нет модели';setOpen('md'+m.id,true);tab='models';render();return [...document.querySelectorAll('#view p')].map(p=>p.innerText).filter(t=>/купленной марки/.test(t)).join(' | ').slice(0,200);})()"))
    pg.wait_for_timeout(250);el=pg.query_selector('#view p:has-text("купленной марки")')
    if el: el.scroll_into_view_if_needed();pg.screenshot(path=out+'smoke_acq_note.png')
    for i in range(3): js("(()=>{G.pending=[];doStep();closeSheet();closePaper();G.pending=[];})()")
    print('after deal months ok; acq sales:',js("G.models.filter(m=>m.acq).map(m=>m.name+' '+m.lastSold+'/'+(m.soldBy?JSON.stringify(m.soldBy):'')).join(', ')"))
    # путь гонщика: Лянча основывает Lancia
    js("(()=>{try{G=null;}catch(_){}})()")
    r=js("""(()=>{racerNew('lancia','it',1900,'Винченцо Лянча','normal');const s=G;s.y=1906;s.m=10;s.cash=60000;s.racer.fame=60;
      const ok=racerFound('own','',0);return [ok,G.mode,G.company,G.models.map(m=>m.name).join(','),legendsOf(G).map(l=>l.name).join(','),brandNextName(G)].join(' | ');})()""")
    print('lancia:',r)
    js(clean);js("(()=>{tab='models';render();})()");pg.wait_for_timeout(300);pg.screenshot(path=out+'lancia_models.png',full_page=True)
    print('designer name:',js("(()=>{openDesigner('middle');const v=draft&&draft.name;closeSheet();return v;})()"))
    print('errors',errs[:10])
    b.close()
