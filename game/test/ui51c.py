# 0.51, этап 8: главное в газете — крупно под заголовком; мелкая новость ложится в «Заметки месяца»; необязательное предложение —
# строка в советах, а не окно; до первого хода газета ничего не прячет.  python3 game/test/ui51c.py
from playwright.sync_api import sync_playwright
import os, json
out = '/home/claude/work/ui51c/'
os.makedirs(out, exist_ok=True)
fails = 0
def ok(c, m):
    global fails
    print(('  ok  ' if c else '  FAIL ') + m, flush=True)
    if not c: fails += 1
with sync_playwright() as p:
    b = p.chromium.launch(args=['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--use-angle=swiftshader'])
    pg = b.new_page(viewport={'width': 420, 'height': 620}, device_scale_factor=1)
    pg.set_default_timeout(120000)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route(lambda u: not u.startswith('file:'), lambda r: r.abort())
    pg.goto('file:///home/claude/avtoimperia/docs/index.html'); pg.wait_for_timeout(1500)
    js = lambda s, a=None: pg.evaluate(s, a) if a is not None else pg.evaluate(s)
    js("demoStop();hideMainMenu();newGame('ford','us','Форд Мотор','normal','Модель V');try{sagaStop();}catch(_){}")
    # до первого хода: вступление — окнами, в заметках пусто
    h = js("({pend:G.pending.length,dig:(G.digest||[]).length,played:!!G.played51})")
    ok(h['dig'] == 0 and not h['played'], 'новая игра: до первого хода в заметки ничего не уходит — %s' % h)
    js("G.pending=[];for(let i=0;i<8;i++)try{closePaper();}catch(_){}")
    # этап 8: вывод заметки крупно, заметки месяца, предложение в советах
    js("for(let i=0;i<6;i++)try{closePaper();}catch(_){};closeSheet();G.pending=[];G.digest=[];G.offers=[];G.stopM=-1;G.played51=1;G.y=1913;G.m=2;pushEvent({own:1,kicker:'Дилеры',title:'Очереди у дилеров',deck:'Заказов больше, чем машин: +120 заказов за месяц',text:'Покупатели ждут. Стройте цеха на вкладке «Завод».'},true);render()"); pg.wait_for_timeout(1800)
    h = js("""(()=>{const g=document.querySelector('.paper .p-gist');if(!g)return {no:1};const cs=getComputedStyle(g),hd=document.querySelector('.paper .p-head').getBoundingClientRect(),r=g.getBoundingClientRect(),col=document.querySelector('.paper .p-cols').getBoundingClientRect();
      return {geo:[Math.round(hd.top),Math.round(hd.bottom),Math.round(r.top),Math.round(r.bottom),Math.round(col.top)],cls:g.className,fs:parseFloat(cs.fontSize),under:document.querySelector('.paper .p-head').nextElementSibling===g&&!!(g.compareDocumentPosition(document.querySelector('.paper .p-cols'))&4),btn:[...document.querySelectorAll('.paper .p-btn')].map(b=>b.textContent)};})()""")
    ok(not h.get('no') and 'good' in h['cls'] and h['fs'] >= 18 and h['under'] and any('Завод' in x for x in h['btn']), 'газета: вывод под заголовком, %s px, зелёный; кнопки: %s · %s' % (h.get('fs'), h.get('btn'), {k: h.get(k) for k in ('cls', 'under', 'no', 'geo')}))
    pg.screenshot(path=out + 'gazeta_glavnoe.png')
    js("[...document.querySelectorAll('.paper .p-btn')].find(b=>/Завод/.test(b.textContent)).click()"); pg.wait_for_timeout(500)
    ok(js("tab==='plant'&&!G.pending.length"), 'кнопка в заметке открывает «Завод»')
    js("pushEvent({kicker:'Кинохроника',title:'Новая лента: Гонка в Дьеппе',text:'Лента в архиве.'},true);pushEvent({own:1,kicker:'Торговля',title:'Франция: пошлина снижена',deck:'ввоз подешевел',text:'Текст.'},true);tab='log';render()"); pg.wait_for_timeout(500)
    h = js("({pend:G.pending.length,dig:G.digest.length,card:!!document.querySelector('[data-act=digestRead]'),txt:document.querySelector('main').textContent.includes('Заметки месяца')})")
    ok(h['pend'] == 0 and h['dig'] == 2 and h['card'] and h['txt'], 'кинохроника и торговая сводка игру не остановили: в «Империи» — «Заметки месяца» (%d)' % h['dig'])
    js("pushEvent({kicker:'Вызов',title:'Панар вызывает «Форд Мотор»',deck:'Париж — Руан · ставка $5 000',text:'Текст.',choices:[['Принять вызов','chalYes'],['Отказаться','chalNo']]},true);tab='plant';render()"); pg.wait_for_timeout(500)
    h = js("({pend:G.pending.length,off:(G.offers||[]).length,adv:document.body.textContent.includes('до конца месяца')})")
    ok(h['pend'] == 0 and h['off'] == 1 and h['adv'], 'вызов не окно: одно предложение в советах — %s' % h)
    pg.screenshot(path=out + 'predlozhenie.png')
    # этап 8б: сюжет по партии — кадр «история и ваша партия», настоящие последствия в ответе, карточка фильма
    js("""(()=>{closeSheet();G.pending=[];G.offers=[];G.y=1904;G.m=3;G.saga={seen:['ford1','ford2'],pick:{},last:-99,t0:12};window.__ts=totalSold;totalSold=()=>2100;sagaCheck(G);totalSold=window.__ts;})()""")
    h = js("({pend:G.pending.filter(p=>p.saga).map(p=>p.saga),pace:(G.saga.pace||{}).ford4})")
    ok(h['pend'] == ['ford4'] and h['pace'] and h['pace'].get('d') == 4, 'продано 2000 машин в 1904 году — глава «Машина для множества» пришла на 4 года раньше истории: %s' % h)
    js("sagaPlay('ford4')"); pg.wait_for_timeout(3600)
    h = js("(()=>{const e=document.querySelector('#sagaScreen .sg-pace');return {on:!!e,txt:e?e.textContent:''};})()")
    ok(h['on'] and 'опередили историю на 4 года' in h['txt'], 'первый кадр главы: «%s»' % h['txt'][:140])
    pg.screenshot(path=out + 'saga_pace.png')
    js("sagaQuestion()"); pg.wait_for_timeout(600)
    h = js("[...document.querySelectorAll('#sagaScreen .sg-o')].map(b=>b.textContent)")
    ok(len(h) == 3, 'после кадра — глава и её вопрос с тремя ответами')
    js("document.querySelector('#sagaScreen .sg-o').click()"); pg.wait_for_timeout(500)
    js("document.querySelector('#sagaScreen .sg-o').click()"); pg.wait_for_timeout(700)
    ok(js("G.saga.seen.includes('ford4')&&!G.pending.some(p=>p.saga)&&!document.querySelector('#sagaScreen:not(.out)')"), 'выбор сделан — глава засчитана')
    js("""(()=>{G.y=1921;G.m=2;G.cash=400000;G.saga.seen=['ford1','ford2','ford3','ford4','ford5'];G.saga.var={ford6:-1};G.pending=[{saga:'ford6',title:'Фильм',text:'',choices:[['Смотреть главу','saga']]}];sagaPlay('ford6');})()"""); pg.wait_for_timeout(3200)
    js("sagaQuestion()"); pg.wait_for_timeout(600)
    h = js("[...document.querySelectorAll('#sagaScreen .sg-o')].map(b=>b.textContent)")
    ok(any('это заём: долг +' in x and 'годовых' in x for x in h), 'ответ «Взять заём у банкиров» называет заём займом: %s' % [x[:110] for x in h if 'заём' in x])
    pg.screenshot(path=out + 'saga_zaem.png')
    l0 = js("G.loan||0")
    js("[...document.querySelectorAll('#sagaScreen .sg-o')].find(b=>/Взять заём/.test(b.textContent)).click()"); pg.wait_for_timeout(500)
    js("document.querySelector('#sagaScreen .sg-o').click()"); pg.wait_for_timeout(700)
    ok(js("G.loan||0") > l0, 'после выбора долг вырос: %s -> %s' % (l0, js("G.loan||0")))
    js("G.pending=[];for(let i=0;i<6;i++)try{closePaper();}catch(_){};tab='empire';render()"); pg.wait_for_timeout(500)
    h = js("(()=>{const c=document.getElementById('sec-saga');return {card:!!c,now:c?/Решения фильма действуют сейчас/.test(c.textContent):false,wait:c?/откроется, когда выйдете на старт/.test(c.textContent):false};})()")
    ok(h['card'] and h['now'], 'в «Империи» карточка фильма показывает, что из решений действует сейчас — %s' % h)
    js("document.getElementById('sec-saga').scrollIntoView()"); pg.wait_for_timeout(300); pg.screenshot(path=out + 'saga_card.png')
    ok(not errs, 'ошибок на странице нет' + (': ' + ' | '.join(errs[:3]) if errs else ''))
    b.close()
print('ok' if not fails else 'FAILED %d' % fails)
