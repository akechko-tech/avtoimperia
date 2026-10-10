# 0.29: вкладка «Рынок» — доли рынка по странам и в мире, сворачиваемые разделы, «Сделки»; вкладка «Гонки» — «Участвовать».
# python3 game/test/ui_market29.py
from playwright.sync_api import sync_playwright
import os
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/m29/'
os.makedirs(out,exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':400,'height':860},device_scale_factor=2)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append('C:'+m.text) if m.type=='error' and 'net::' not in m.text and 'Failed to load' not in m.text else None)
    pg.route(lambda u:not u.startswith('file:'),lambda r:r.abort())
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(500)
    pg.click('[data-act=newgame]');pg.click('[data-act=pion][data-v=agnelli]');pg.click('[data-act=startgame]');pg.wait_for_timeout(300)
    pg.evaluate("(()=>{for(let i=0;i<6;i++)closePaper();closeSheet();if(SAGAP)try{sagaStop();}catch(_){}})()")
    pg.evaluate("G.cash+=60000;G.dealers.fr=10;G.dealers.uk=4;")
    for i in range(26): pg.evaluate("(()=>{G.pending=[];doStep();closeSheet();closePaper();G.pending=[];if(SAGAP)try{sagaStop();}catch(_){}})()")
    pg.evaluate("G.cash+=900000;render()")
    pg.click('.tab[data-t=market]');pg.wait_for_timeout(300)
    pg.screenshot(path=out+'market_top.png')
    # доли рынка: мир → Франция
    pg.evaluate("document.querySelector('[data-act=mkC][data-v=fr]').click()");pg.wait_for_timeout(200)
    el=pg.query_selector('section.card:has(.card-h[data-k=shares])')
    if el: el.screenshot(path=out+'shares_fr.png')
    pg.evaluate("document.querySelector('[data-act=mkC][data-v=world]').click()");pg.wait_for_timeout(200)
    el=pg.query_selector('section.card:has(.card-h[data-k=shares])')
    if el: el.screenshot(path=out+'shares_world.png')
    # сделки: открыть карточку, переговоры с первой маркой
    pg.evaluate("document.querySelector('.card-h[data-k=deals]').click()");pg.wait_for_timeout(200)
    pg.evaluate("document.querySelector('[data-act=dealC][data-v=fr]').click()");pg.wait_for_timeout(200)
    el=pg.query_selector('section.card:has(.card-h[data-k=deals])')
    if el: el.screenshot(path=out+'deals.png')
    pg.evaluate("document.querySelector('[data-act=dealOpen]').click()");pg.wait_for_timeout(300)
    pg.screenshot(path=out+'deal_sheet.png')
    print('deal sheet:',pg.evaluate("document.getElementById('sheetBody').innerText.slice(0,300)"))
    pg.evaluate("closeSheet()")
    # свернуть страну в «Дилеры и экспорт»
    n=pg.evaluate("document.querySelectorAll('.net-h').length");print('country headers',n)
    pg.evaluate("document.querySelector('.net-h[data-k=net_fr]')&&document.querySelector('.net-h[data-k=net_fr]').click()");pg.wait_for_timeout(200)
    print('fr folded:',pg.evaluate("!!document.querySelector('.net-row.folded .net-h[data-k=net_fr]')"))
    pg.screenshot(path=out+'market_full.png',full_page=True)
    # гонки: «Участвовать»
    pg.evaluate("(()=>{const rc=RACES.find(r=>r.y===G.y&&!r.match&&raceOpen(r,G))||RACES.find(r=>r.y===G.y+1&&!r.match);if(rc){G.y=rc.y;G.m=Math.max(0,rc.m-1);}render();})()")
    pg.click('.tab[data-t=race]');pg.wait_for_timeout(300)
    has=pg.evaluate("!!document.querySelector('[data-act=raceQuick]')");print('raceQuick button',has)
    if has:
        el=pg.query_selector('.race-item:has([data-act=raceQuick])');el.screenshot(path=out+'race_item.png')
        pg.evaluate("document.querySelector('[data-act=raceQuick]').click()");pg.wait_for_timeout(300)
        pg.screenshot(path=out+'race_quick.png')
        print('quick sheet:',pg.evaluate("document.getElementById('sheetBody').innerText.slice(0,400)"))
        pg.evaluate("document.querySelector('[data-act=raceQuickGo]')&&document.querySelector('[data-act=raceQuickGo]').click()");pg.wait_for_timeout(4000)
        print('result:',pg.evaluate("document.getElementById('sheetBody').innerText.slice(0,300)"))
        pg.screenshot(path=out+'race_result.png')
        pg.evaluate("(()=>{for(let i=0;i<4;i++)closePaper();closeSheet();G.pending=[];tab='race';render();})()");pg.wait_for_timeout(300)
        el=pg.query_selector('section.card:has(h2)')
        print('budget line:',pg.evaluate("[...document.querySelectorAll('.meta')].map(m=>m.innerText).filter(t=>/Гонки/.test(t)).join(' | ').slice(0,200)"))
    print('errors',errs[:10])
    b.close()
