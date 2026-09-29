# 0.17: кинохроника в газете, праздник победы, итоги года, настройки графики
from playwright.sync_api import sync_playwright
import sys
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/'
vp=(sys.argv[1] if len(sys.argv)>1 else '412x860').split('x')
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':int(vp[0]),'height':int(vp[1])},device_scale_factor=2)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append('console: '+m.text) if m.type=='error' and 'TUNNEL' not in m.text else None)
    pg.add_init_script("localStorage.setItem('avt-audio',JSON.stringify({music:false,sfx:false,demo:false}))")
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(500)
    pg.click('[data-act=newgame]');pg.click('[data-act=pion][data-v=renault]');pg.click('[data-act=startgame]');pg.wait_for_timeout(1500)
    # первая газета — «Экипажи без лошадей» с кинохроникой прямо в номере
    print('paper:',pg.evaluate("document.querySelector('#paperWrap:not([hidden]) .p-head')?.textContent"),'reel block:',pg.evaluate("!!document.querySelector('#paperWrap .p-reel')"))
    pg.screenshot(path=out+'u17b_paper.png')
    pg.evaluate("document.querySelector('#paperWrap .p-reel')?.scrollIntoView({block:'center'})");pg.wait_for_timeout(300);pg.screenshot(path=out+'u17b_paper_reel.png')
    pg.click('#paperWrap .p-reel');pg.wait_for_timeout(3600);pg.screenshot(path=out+'u17b_reel_play.png')
    pg.evaluate("reelClose()");pg.wait_for_timeout(600)
    print('paper still open:',pg.evaluate("!document.getElementById('paperWrap').hidden"))
    # праздник победы
    pg.evaluate("celebrate('Победа!','Париж — Руан · вы за рулём · «Тип 1»','🏁')");pg.wait_for_timeout(700);pg.screenshot(path=out+'u17b_cel.png')
    pg.wait_for_timeout(3500)
    # итоги года: снимок и ролик
    pg.evaluate("G.raceLog.push({y:1895,key:'pbp-1895',name:'Париж — Бордо — Париж',model:'Тип 1',place:1,drv:'Эмиль Левассор',major:true,team:[1]});G.kings={y:1895,lines:[],mine:['Король гонок']};yearRecord(G,1895);reelUnlock(G,'year:1895')")
    pg.evaluate("showPaper({kicker:'Итоги года · по версии прессы',title:'«Renault» — король гонок 1895 года!',deck:'Проверка',text:'— строка 1\\n— строка 2',choices:[['Читать дальше','close'],['▶ Кинохроника года','reel:year:1895']],act:'paperClose'},true)")
    pg.wait_for_timeout(1200);pg.evaluate("document.querySelector('#paperWrap .p-reel')?.scrollIntoView({block:'center'})");pg.wait_for_timeout(300);pg.screenshot(path=out+'u17b_year_paper.png')
    pg.click('#paperWrap .p-reel');pg.wait_for_timeout(3400);pg.screenshot(path=out+'u17b_year_reel1.png')
    for i in range(3):
        pg.evaluate("reelNext()");pg.wait_for_timeout(1100);pg.screenshot(path=out+f'u17b_year_reel{i+2}.png')
    pg.evaluate("reelClose()");pg.wait_for_timeout(500)
    pg.evaluate("closePaper()")
    # архив: газета с роликом открывается из «Империи»
    print('archive reel:',pg.evaluate("G.papers.filter(p=>p.reel).map(p=>p.reel).join(',')"))
    pg.evaluate("const k=G.papers.findIndex(p=>p.reel==='year:1895');ACT.reopenPaper({k:String(k)})");pg.wait_for_timeout(1200)
    print('archive paper reel block:',pg.evaluate("!!document.querySelector('#paperWrap .p-reel')"))
    pg.evaluate("closePaper()")
    # настройки
    pg.evaluate("openSettings()");pg.wait_for_timeout(500);pg.screenshot(path=out+'u17b_settings.png',full_page=False)
    pg.evaluate("document.querySelector('[data-act=gq][data-v=cine]')?.click()");pg.wait_for_timeout(400)
    print('gq:',pg.evaluate("gfxQ()"))
    pg.evaluate("document.querySelector('[data-act=gq][data-v=hd]')?.click()");pg.wait_for_timeout(300)
    pg.evaluate("closeSheet&&closeSheet()");pg.wait_for_timeout(300)
    pg.screenshot(path=out+'u17b_main.png')
    print('\n'.join(errs[:10]))
    b.close()
