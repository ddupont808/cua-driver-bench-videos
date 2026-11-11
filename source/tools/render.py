"""render.py --video NAME [--variant V] [--times t1,t2] [--out DIR] [--workers N] [--numbers FILE]
Frame-by-frame render of one film in headless Chromium (software rendering, no GPU). Every frame is a pure function of time.
Output: renders/<name>/f_00000.png ... (60 fps) or stills with --times."""
import sys, os, time, json, argparse
from pathlib import Path
from multiprocessing import Process
from playwright.sync_api import sync_playwright
ROOT = Path(__file__).resolve().parent.parent; LIB = ROOT / 'lib'
ap = argparse.ArgumentParser()
ap.add_argument('--video', required=True); ap.add_argument('--variant', default=''); ap.add_argument('--times'); ap.add_argument('--out')
ap.add_argument('--workers', type=int, default=10); ap.add_argument('--numbers'); ap.add_argument('--from_', type=int, default=0); ap.add_argument('--to', type=int, default=-1); ap.add_argument('--tag', default='')
a = ap.parse_args()
URL = (LIB / 'stage.html').as_uri() + f'?v={a.video}' + (f'&variant={a.variant}' if a.variant else '')
ARGS = ['--disable-gpu', '--force-color-profile=srgb', '--hide-scrollbars']
NUM = None
nf = Path(a.numbers) if a.numbers else (ROOT / 'numbers.json')
if nf.exists(): NUM = json.loads(nf.read_text(encoding='utf8'))
INIT = ('window.NUMBERS=' + json.dumps(NUM) + ';') if NUM else ''

def open_page(p, vp):
    b = p.chromium.launch(args=ARGS); pg = b.new_page(viewport=vp, device_scale_factor=1)
    if INIT: pg.add_init_script(INIT)
    pg.on('pageerror', lambda e: print('[pageerror]', e))
    pg.on('console', lambda m: print('[console]', m.text) if m.type == 'error' else None)
    pg.goto(URL); pg.wait_for_function('window.__ready===true', timeout=120000)
    return b, pg

def work(jobs, out):
    with sync_playwright() as p:
        b, pg = open_page(p, {'width': 1920, 'height': 1080})
        pg.set_viewport_size({'width': pg.evaluate('window.__W'), 'height': pg.evaluate('window.__H')})
        for name, t in jobs:
            pg.evaluate(f'renderFrame({t})'); pg.screenshot(path=os.path.join(out, name))
        b.close()

if __name__ == '__main__':
    with sync_playwright() as p:
        b, pg = open_page(p, {'width': 800, 'height': 600}); dur = pg.evaluate('window.__dur'); fps = pg.evaluate('window.__fps'); b.close()
    base = a.video + (('-' + a.variant) if a.variant else '')
    if a.times:
        out = a.out or str(ROOT / 'renders' / 'stills' / base); os.makedirs(out, exist_ok=True)
        jobs = [(f's_{float(t):06.2f}.png', float(t)) for t in a.times.split(',')]
    else:
        out = a.out or str(ROOT / 'renders' / 'frames' / base); os.makedirs(out, exist_ok=True)
        n = int(round(dur * fps)); hi = n if a.to < 0 else min(n, a.to)
        jobs = [(f'f_{i:05d}.png', i / fps) for i in range(a.from_, hi)]
    k = max(1, min(a.workers, len(jobs))); chunks = [jobs[i::k] for i in range(k)]
    t0 = time.time(); ps = [Process(target=work, args=(c, out)) for c in chunks]; [q.start() for q in ps]; [q.join() for q in ps]
    print('rendered', len(jobs), 'in', round(time.time() - t0, 1), 's ->', out, '| dur', round(dur, 3), 's @', fps, 'fps')
