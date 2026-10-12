# 0.34: «как посчитано» — всплывающие окна-таблицы (черты, итог, себестоимость) и кнопка «Передовая модель» в конструкторе.
# python3 game/test/ui34.py
from playwright.sync_api import sync_playwright
import os
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/m34/ui/'
os.makedirs(out,exist_ok=True)
fails=0
def ok(c,m):
    global fails
    print(('  ok  ' if c else '  FAIL ')+m)
    if not c: fails+=1
with sync_playwright() as p:
    b=p.chromium.launch(args=['--enable-unsafe-swiftshader','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append('C:'+m.text) if m.type=='error' and 'net::' not in m.text and 'Failed to load' not in m.text else None)
    pg.route(lambda u:not u.startswith('file:'),lambda r:r.abort())
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(500)
    js=lambda s:pg.evaluate(s)
    pg.click('[data-act=newgame]');pg.click('[data-act=pion][data-v=custom]');pg.click('[data-act=country][data-v=de]');pg.click('[data-act=startgame]');pg.wait_for_timeout(400)
    js("(()=>{for(let i=0;i<6;i++)closePaper();closeSheet();if(SAGAP)try{sagaStop();}catch(_){}G.pending=[];G.y=1920;G.m=4;G.cash=5e5;G.rd.lvl=3;render();})()")
    js("(()=>{openDesigner('truck');})()");pg.wait_for_timeout(400)
    rows=pg.query_selector_all('#sheetBody .cmp-x')
    ok(len(rows)>=4 and all(r.query_selector('.xi') for r in rows),'строки черт — кнопки с ⓘ: '+str(len(rows)))
    el=pg.query_selector('#sheetBody .cmp-x[data-k=rel]');el.scroll_into_view_if_needed();pg.wait_for_timeout(150);el.click();pg.wait_for_timeout(300)
    t=pg.inner_text('#xpop') if pg.query_selector('#xpop') else ''
    ok('Итого' in t and 'Ломается из 100' in t,'окно «Надёжность»: таблица, «ломается из 100», итог')
    bx=pg.query_selector('#xpop').bounding_box();ok(bx and bx['x']>=0 and bx['x']+bx['width']<=390 and bx['y']>=0 and bx['y']+bx['height']<=844,'окно целиком на экране: '+str(bx and [round(bx['x']),round(bx['y']),round(bx['width']),round(bx['height'])]))
    pg.screenshot(path=out+'1_rel.png')
    pg.click('#xpopBg',position={'x':5,'y':5});pg.wait_for_timeout(150);ok(pg.query_selector('#xpop') is None,'тап мимо окна — закрылось')
    pg.query_selector('#sheetBody .qbx').click();pg.wait_for_timeout(300);t=pg.inner_text('#xpop');ok('Тонно-км' in t and 'Итого' in t,'итог грузовика: вклад черт и тонно-километр');js("xpopClose()")
    el=pg.query_selector('#sheetBody .mx');el.scroll_into_view_if_needed();pg.wait_for_timeout(150);el.click();pg.wait_for_timeout(300);t=pg.inner_text('#xpop')
    ok('Детали по прайсу' in t and 'Работа' in t,'себестоимость: детали, работа, итог');js("xpopClose()")
    # «Передовая модель»: класс тот же, итог не ниже, детали — не устаревшие
    js("(()=>{openDesigner('middle');})()");pg.wait_for_timeout(300)
    s0=js("classScore({...draft},G,G.country)");b0=js("draft.b")
    pg.click('#sheetBody [data-act=dfront]');pg.wait_for_timeout(400);pg.screenshot(path=out+'2_front.png')
    s1=js("classScore({...draft},G,G.country)");ok(js("draft.b")==b0 and js("segOf(draft)")=='middle','«Передовая модель»: кузов и класс — те же')
    ok(js("FRONT_KEYS.every(k=>!partObsolete(k,draft[k],G))")==True,'«Передовая модель»: ни одной устаревшей детали ('+js("FRONT_KEYS.map(k=>draft[k]).join(' ')")+')')
    ok(s1>=s0*0.95,'итог против соперника: '+str(round(s0*100))+'% → '+str(round(s1*100))+'%')
    ok('Передовая модель' in (pg.inner_text('.toast') if pg.query_selector('.toast') else pg.content()),'подсказка о передовой модели')
    js("closeSheet()")
    # карточка модели
    js("(()=>{tab='models';setOpen('cmp'+G.models[0].id,true);setOpen('md'+G.models[0].id,true);render();})()");pg.wait_for_timeout(400)
    el=pg.query_selector('.cmp-x[data-k=comf]')
    if el:
        el.scroll_into_view_if_needed();pg.wait_for_timeout(200);el.click();pg.wait_for_timeout(300);t=pg.inner_text('#xpop') if pg.query_selector('#xpop') else ''
        ok('Комфорт' in t and 'Итого' in t and 'Больше всего' not in t,'карточка модели: окно «Комфорт» (без советов — модель уже в серии)');js("xpopClose()")
    else: ok(False,'в карточке модели нет строк с ⓘ')
    ok(len(errs)==0,'без ошибок в консоли: '+'; '.join(errs[:3]))
    b.close()
print('ОШИБОК: '+str(fails) if fails else 'всё в порядке')
