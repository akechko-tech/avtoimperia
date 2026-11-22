# 0.51, этап 10: в настройках — «Что сейчас звучит» (список и «Скопировать»); плейлист отодвигает слышанное в конец.
# python3 game/test/ui51e.py
from playwright.sync_api import sync_playwright
import os
out = '/home/claude/work/ui51e/'
os.makedirs(out, exist_ok=True)
fails = 0
def ok(c, m):
    global fails
    print(('  ok  ' if c else '  FAIL ') + m, flush=True)
    if not c: fails += 1
with sync_playwright() as p:
    b = p.chromium.launch(args=['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'])
    pg = b.new_page(viewport={'width': 412, 'height': 915}, device_scale_factor=1)
    pg.set_default_timeout(120000)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route(lambda u: not u.startswith('file:'), lambda r: r.abort())
    pg.goto('file:///home/claude/avtoimperia/docs/index.html'); pg.wait_for_timeout(1500)
    js = lambda s, a=None: pg.evaluate(s, a) if a is not None else pg.evaluate(s)
    js("localStorage.removeItem('avt-mushist');demoStop();hideMainMenu();newGame('ford','us','Форд Мотор','normal','Модель V');try{sagaStop();}catch(_){};G.pending=[];for(let i=0;i<8;i++)try{closePaper();}catch(_){}")
    js("try{auInit();}catch(_){};musBuild(true)"); pg.wait_for_timeout(1500)
    js("auSfx('click');auFanfare('win');openSettings()"); pg.wait_for_timeout(600)
    h = js("(()=>{const e=document.getElementById('auNow');return {on:!!e,txt:e?e.textContent:'',copy:!!document.querySelector('[data-act=auNowCopy]'),upd:!!document.querySelector('[data-act=auNow]')};})()")
    ok(h['on'] and 'Сейчас звучит:' in h['txt'] and 'звуковой движок' in h['txt'] and 'Последние звуковые события:' in h['txt'] and h['copy'] and h['upd'], 'настройки: блок «Что сейчас звучит» со списком и кнопками')
    ok('звук click' in h['txt'] and 'фанфара win' in h['txt'], 'в списке — последние события: щелчок и фанфара')
    print('    ' + h['txt'].replace('\n', '\n    ')[:900])
    js("document.getElementById('auNow').scrollIntoView({block:'center'})"); pg.wait_for_timeout(300); pg.screenshot(path=out + 'chto_zvuchit.png')
    js("auSfx('coin');document.querySelector('[data-act=auNow]').click()"); pg.wait_for_timeout(300)
    ok('звук coin' in js("document.getElementById('auNow').textContent"), '«Обновить» перечитывает список')
    js("closeSheet()")
    # плейлист: слышанное — в конец
    r = js("""(()=>{AU.on.mode='all';AU.sig='';AU.pl=[];AU.idx=0;MUS_HIST=[];musBuild(true);const n=AU.pl.length,first=AU.pl[0],k0=first&&(first.id||first.title);if(n<4)return {n};MUS_HIST=[];localStorage.removeItem('avt-mushist');musHeard(first);AU.sig='';AU.pl=[];AU.idx=0;musBuild(true);
      return {n,k0,last:AU.pl[AU.pl.length-1]&&(AU.pl[AU.pl.length-1].id||AU.pl[AU.pl.length-1].title),now:AU.pl[0]&&(AU.pl[0].id||AU.pl[0].title),saved:JSON.parse(localStorage.getItem('avt-mushist')||'[]').length};})()""")
    ok(r.get('n', 0) >= 4 and r['last'] == r['k0'] and r['now'] != r['k0'] and r['saved'] >= 1, 'плейлист (%s записей без сети): прозвучавшая запись ушла в конец, первой стоит другая — %s' % (r.get('n'), r))
    ok(not errs, 'ошибок на странице нет' + (': ' + ' | '.join(errs[:3]) if errs else ''))
    b.close()
print('ok' if not fails else 'FAILED %d' % fails)
