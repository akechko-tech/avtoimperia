# 0.50 в браузере, с настоящими проигрывателями: на церемонии звучит одна мелодия (гимн), граммофон игры на паузе и возвращается после;
# выигранный матч — одна мелодия; гонка кончилась при звучащем гимне — музыка игры не включается поверх.  python3 game/test/ui50.py
from playwright.sync_api import sync_playwright
import json
fails = 0
def ok(c, m):
    global fails
    print(('  ok  ' if c else '  FAIL ') + m, flush=True)
    if not c: fails += 1
with sync_playwright() as p:
    b = p.chromium.launch(args=['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'])
    pg = b.new_page(viewport={'width': 390, 'height': 760}, device_scale_factor=1)
    pg.set_default_timeout(120000)
    errs = []; pg.on('pageerror', lambda e: errs.append('PAGEERR ' + str(e)))
    pg.route(lambda u: not u.startswith('file:'), lambda r: r.abort())
    pg.goto('file:///home/claude/avtoimperia/docs/index.html'); pg.wait_for_timeout(1500)
    js = lambda s: pg.evaluate(s)
    js("demoStop();hideMainMenu();newGame('renault','fr','','normal','');"); pg.wait_for_timeout(800)
    js("try{sagaStop();}catch(_){};for(let i=0;i<8;i++)try{closePaper();}catch(_){};G.pending=[];auInit();AU.on.music=true;AU.on.sfx=true;AU.paused=false;auApply();")
    # граммофон: свои записи оркестра лежат рядом с игрой
    js("AU.pl=Object.keys(OWN_MUSIC).slice(0,3).map(k=>({title:OWN_MUSIC[k].cap,src:'music/'+k+'.m4a',own:1,orch:1,y:1900}));AU.idx=0;AU.sig='t';musicPlay(true);")
    pg.wait_for_timeout(2500)
    st = lambda: json.loads(js("""JSON.stringify({el:AU.el?{p:AU.el.paused,t:+AU.el.currentTime.toFixed(1),v:+AU.el.volume.toFixed(2),src:(AU.el.getAttribute('src')||'').split('/').pop()}:null,
      cues:Object.keys(CUE).filter(k=>CUE[k]&&CUE[k].paused===false&&!CUE[k].ended).map(k=>k+'@'+CUE[k].currentTime.toFixed(1)),cue:AU.cue?{prio:AU.cue.prio,was:AU.cue.was,want:AU.cue.want}:null,synth:!!(AU.synth&&AU.synth.cue)})"""))
    s0 = st(); ok(s0['el'] and not s0['el']['p'] and s0['el']['t'] > 0.5, 'граммофон играет: %s' % s0['el'])
    # 1) победа в гонке: карточка приза, гимн Франции
    js("(()=>{const rc=RACES.find(r=>r.c==='fr'&&r.y>=1906)||RACES[0];window.__aw=awardOf(rc,G);celebrate('Победа!',rc.name,'🏁',null,{award:__aw,place:1});})()")
    pg.wait_for_timeout(1800); s1 = st()
    ok(s1['cues'] == [c for c in s1['cues'] if 'hymn' in c] and len(s1['cues']) == 1, 'церемония: звучит одна мелодия — %s' % s1['cues'])
    ok(s1['el']['p'], 'граммофон игры во время гимна на паузе (а не «тише»): %s' % s1['el'])
    # 2) игра просит музыку (экран сменился, гонка кончилась) — гимн не перебивается
    js("musicPlay();musBuild&&0;"); pg.wait_for_timeout(600); s2 = st()
    ok(s2['el']['p'] and len(s2['cues']) == 1 and s2['cue'] and s2['cue']['want'] >= 1, 'музыка игры ждёт конца гимна: %s' % s2['cue'])
    # 3) следом — ещё праздник с фанфарами (2-е место в другом зачёте): гимн важнее, вторая мелодия не накладывается
    js("celebrate('Рекорд!','проба','🚗')"); pg.wait_for_timeout(900); s3 = st()
    ok(len(s3['cues']) == 1 and 'hymn' in s3['cues'][0], 'фанфары другого праздника поверх гимна не звучат: %s' % s3['cues'])
    # 4) гимн кончился (перематываем к концу) — граммофон продолжает с того же места
    t_before = s1['el']['t']
    js("(()=>{const a=CUE['own_hymn_fr']||Object.values(CUE).find(x=>x&&!x.paused);try{a.currentTime=Math.max(0,a.duration-0.4);}catch(_){a.pause();}})()")
    pg.wait_for_timeout(2600); s4 = st()
    ok(not s4['cues'] and not s4['cue'] and not s4['el']['p'] and s4['el']['src'] == s0['el']['src'] and s4['el']['t'] >= t_before, 'гимн доиграл — музыка игры продолжила с того же места: %s' % s4['el'])
    pg.wait_for_timeout(2500); s4b = st(); ok(s4b['el']['v'] >= 0.3, 'и вернулась к обычной громкости (%.2f)' % s4b['el']['v'])
    # 5) выигранный матч: тема пари и фанфары праздника
    js("try{duelTheme('biz',true,true);}catch(e){window.__e=String(e);}celebrate('Матч выигран!','Ипподром · «Модель 1»','⚔️');"); pg.wait_for_timeout(1500); s5 = st()
    ok(len(s5['cues']) == 1 and s5['el']['p'], 'выигранный матч: одна мелодия, граммофон молчит — %s' % s5['cues'])
    # 6) игрок сам нажал «следующая» — мелодия по поводу смолкла, играет следующая запись
    js("ACT.plNext()"); pg.wait_for_timeout(1500); s6 = st()
    ok(not s6['cues'] and not s6['el']['p'] and s6['el']['src'] != s0['el']['src'], '«следующая»: фанфары смолкли, играет %s' % s6['el']['src'])
    # 7) гонка: музыка в гонке выключена, финиш, гимн, выход из гонки
    js("window.__R=R;R={};AU.on.race=false;musicPlay();"); pg.wait_for_timeout(500); s7 = st()
    js("celebrate('Победа!','проба','🏁',null,{award:__aw,place:1});"); pg.wait_for_timeout(1200)
    js("R=window.__R||null;musicPlay();render();"); pg.wait_for_timeout(1200); s8 = st()
    ok(s7['el']['p'] and s8['el']['p'] and len(s8['cues']) == 1, 'гонка кончилась при звучащем гимне: музыка игры не включилась поверх (было — «каша»): %s' % s8['cues'])
    js("(()=>{const a=Object.values(CUE).find(x=>x&&x.paused===false);try{a.currentTime=Math.max(0,a.duration-0.4);}catch(_){a.pause();}})()"); pg.wait_for_timeout(2600); s9 = st()
    ok(not s9['cues'] and not s9['el']['p'], 'гимн кончился — музыка игры пошла: %s' % s9['el'])
    ok(not errs, 'ошибок нет' + ((': ' + ' | '.join(errs[:3])) if errs else ''))
    b.close()
print('ОШИБОК: %d' % fails if fails else 'всё в порядке')
