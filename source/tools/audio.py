"""audio.py NAME...  -> renders/NAME.wav. Synthesised sound bed (no samples, no speech) on a 120 bpm grid; cues in beats.
Instrument functions are the brag-6 generator's, trimmed."""
import sys, os, numpy as np
from scipy.signal import fftconvolve, butter, sosfilt
import soundfile as sf
SR = 44100; rng = np.random.default_rng(11); mid = lambda m: 440.0 * 2 ** ((m - 69) / 12)
def tt(d): return np.arange(int(d * SR)) / SR
def sine(f, d): return np.sin(2 * np.pi * f * tt(d))
def noise(d): return rng.standard_normal(int(d * SR))
def hp(x, fc): return sosfilt(butter(2, fc, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi): return sosfilt(butter(2, [lo, hi], 'band', fs=SR, output='sos'), x)
def put(buf, t, sig, pan=0.0, g=1.0):
    i = int(t * SR)
    if i >= buf.shape[1]: return
    n = min(len(sig), buf.shape[1] - i); buf[0, i:i + n] += sig[:n] * (1 - max(0, pan)) * g; buf[1, i:i + n] += sig[:n] * (1 + min(0, pan)) * g
def pluck(f, d=.9, b=1.):
    t = tt(d); s = sine(f, d) + .35 * b * sine(2 * f, d) * np.exp(-t * 8) + .15 * b * sine(3 * f, d) * np.exp(-t * 14); return s * np.exp(-t * 4.5) * np.minimum(1, t / .004)
def pad(f, d):
    t = tt(d); s = 0
    for det in (-.004, 0, .005):
        for h in range(1, 7): s = s + np.sin(2 * np.pi * f * (1 + det) * h * t + det * 40) / (h ** 1.7)
    return s * np.minimum(1, t / .7) * np.minimum(1, (d - t) / .9)
def bass(f, d): t = tt(d); return (sine(f, d) + .3 * sine(2 * f, d)) * np.minimum(1, t / .01) * np.exp(-t * 2.2) * np.minimum(1, (d - t) / .05)
def kick(d=.3): t = tt(d); ph = 2 * np.pi * np.cumsum(48 + 90 * np.exp(-t * 28)) / SR; return np.sin(ph) * np.exp(-t * 12)
def hat(): d = .05; return hp(noise(d), 7000) * np.exp(-tt(d) * 70)
def bell(f, d=1.4): t = tt(d); m = np.sin(2 * np.pi * f * 2 * t) * 2 * np.exp(-t * 4); return np.sin(2 * np.pi * f * t + m) * np.exp(-t * 3) * np.minimum(1, t / .003)
def whoosh(d): n = noise(d); t = tt(d); o = sum(bp(n, lo, hi) for lo, hi in [(300, 700), (700, 1600), (1600, 3500)]) * .45; return o * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
def boing(d=.5): t = tt(d); ph = 2 * np.pi * np.cumsum(170 + 330 * np.exp(-t * 7) + 22 * np.sin(t * 38)) / SR; return (np.sin(ph) + .3 * np.sin(2 * ph)) * np.exp(-t * 6) * np.minimum(1, t / .004)
def thud(d=.3): return kick(d)[:int(d * SR)] * .9 + bp(noise(d), 80, 600) * np.exp(-tt(d) * 30) * .5
def whack(d=.12): t = tt(d); return bp(noise(d), 300, 3500) * np.exp(-t * 45) * .8 + np.sin(2 * np.pi * (140 + 160 * np.exp(-t * 40)) * t) * np.exp(-t * 30) * .6
def crash(d=1.6): t = tt(d); n = hp(noise(d), 500) * np.exp(-t * 3.2); k = np.zeros(len(n)); kk = kick(.6) * .7; k[:len(kk)] = kk; return n * .8 + k
def tick(): return hp(noise(.012), 2500) * np.exp(-tt(.012) * 300)
def reverb(x, wet, rt):
    n = int(rt * SR); t = np.arange(n) / SR; ir = rng.standard_normal((2, n)) * np.exp(-t * 3.2) * (1 - np.exp(-t * 60))
    o = np.stack([fftconvolve(x[0], ir[0])[:x.shape[1]], fftconvolve(x[1], ir[1])[:x.shape[1]]]); o /= (np.abs(o).max() + 1e-9) / (np.abs(x).max() + 1e-9); return x + wet * o
CH = {'M': [0, 4, 7, 12], 'm': [0, 3, 7, 12]}
def build(name, beats, chords, levels, cues, bpm=120):
    B = 60 / bpm; L = int(beats * B * SR); mus = np.zeros((2, L)); sfx = np.zeros((2, L))
    for bar in range(beats // 4):
        lv = levels[min(bar, len(levels) - 1)]; root, q = chords[bar % len(chords)]; ch = [root + x for x in CH[q]]; t0 = bar * 4 * B
        for i, m in enumerate(ch[:3]): put(mus, t0, pad(mid(m + 12 if i else m), 4 * B + .4) * (.05 + .02 * lv), pan=(i - 1) * .3)
        if lv >= 2:
            for k in (0, 2): put(mus, t0 + k * B, bass(mid(root - 12), 1.6 * B) * .22)
        pat = [0, 2, 1, 3, 2, 1, 3, 2]
        for i in range(0, 8, 1 if lv >= 2 else 2): put(mus, t0 + i * .5 * B, pluck(mid(ch[pat[i]] + 12), .8) * (.06 + .02 * lv), pan=.3 if i % 2 else -.3)
        if lv >= 2:
            for k in ((0, 2) if lv == 2 else (0, 1, 2, 3)): put(mus, t0 + k * B, kick() * (.3 if lv == 2 else .34))
        if lv >= 3:
            for k in range(8): put(mus, t0 + (k + .5) * .5 * B, hat() * .05, pan=.2)
    for cue in cues:
        k, b = cue[0], cue[1]; t = b * B
        if k == 'word': put(sfx, t, pluck(mid(81 + (int(b * 2) % 3) * 2), .35, .6) * .07, pan=.1)
        elif k == 'pop': put(sfx, t, pluck(mid(88), .18, .3) * .08); put(sfx, t, pluck(mid(76), .25, .3) * .04)
        elif k == 'chime': put(sfx, t, bell(mid(84), 1.6) * .07, pan=.15)
        elif k == 'click': put(sfx, t, hp(noise(.03), 1500) * np.exp(-tt(.03) * 120) * .15)
        elif k == 'whoosh': put(sfx, t, whoosh(cue[2] * B) * .05)
        elif k == 'boing': put(sfx, t, boing() * .22)
        elif k == 'thud': put(sfx, t, thud() * .35)
        elif k == 'whack': put(sfx, t, whack() * .18, pan=rng.uniform(-.4, .4))
        elif k == 'crash': put(sfx, t, crash() * .38)
        elif k == 'impact': put(sfx, t, kick(.9) * .45); put(sfx, t, bell(mid(60), 2.2) * .04)
        elif k == 'type':
            for x in np.arange(t, cue[2] * B, B / 4): put(sfx, x, tick() * .10 * (.7 + .3 * rng.random()), pan=.05)
    mus = reverb(mus, .18, 1.8); sfx = reverb(sfx, .28, 1.4); mix = mus * .9 + sfx
    fo = int(.9 * SR); mix[:, -fo:] *= np.linspace(1, 0, fo) ** 1.5; mix[:, :int(.02 * SR)] *= np.linspace(0, 1, int(.02 * SR))
    mix = np.tanh(mix / np.abs(mix).max() * 1.6) / np.tanh(1.6) * .45
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'renders', name + '.wav'); os.makedirs(os.path.dirname(out), exist_ok=True)
    sf.write(out, mix.T.astype(np.float32), SR); print(name, beats * B, 's')
W = lambda a, n, s=.5: [('word', a + s * i) for i in range(n)]
CUES = {
 'hands-off': (32, [(60, 'M'), (55, 'M'), (57, 'm'), (53, 'M')], [1, 2, 2, 2, 3, 3, 2, 1], W(.5, 4) + [('type', 4, 17.5)] + [('pop', x) for x in (5, 5.5, 6)] + [('whoosh', 7, 1.5), ('chime', 9.5), ('whoosh', 11.5, 1.5), ('chime', 14), ('whoosh', 16, 1.5), ('chime', 19)] + W(11.5, 5) + [('impact', 21.5), ('chime', 23), ('impact', 27.5)] + W(28, 3)),
 'hands-off-bumper': (12, [(60, 'M'), (55, 'M')], [2, 2, 3], W(.5, 3) + [('type', 1, 8), ('pop', 1), ('pop', 1.5), ('pop', 2), ('chime', 3.5), ('chime', 5.2), ('chime', 6.9), ('impact', 7.3), ('impact', 9.6)]),
 'race': (30, [(57, 'm'), (53, 'M'), (60, 'M'), (55, 'M')], [1, 2, 2, 2, 3, 3, 3, 2], W(.3, 5) + [('pop', 1), ('pop', 1.35), ('pop', 1.7), ('pop', 2.05)] + [('click', 2.5 + 2.25 * k) for k in range(8)] + [('impact', 20.5), ('chime', 21), ('impact', 25.5)] + W(26, 3)),
 'keynote': (30, [(53, 'M'), (60, 'M'), (50, 'm'), (58, 'M')], [2, 2, 2, 1, 3, 3, 2, 1], W(1, 5) + [('word', 3.5), ('word', 4), ('word', 4.5), ('word', 7), ('word', 8.5), ('whack', 8.5), ('whack', 10), ('crash', 10), ('whack', 10.5), ('whack', 11), ('whack', 11.5), ('thud', 9.5), ('whoosh', 7, 1), ('whoosh', 8.5, 1), ('word', 11), ('word', 11.5), ('word', 12), ('word', 12.5), ('whoosh', 16.5, 1.5), ('chime', 21), ('impact', 23), ('chime', 24)]),
 'two-cursors': (40, [(52, 'm'), (48, 'M'), (55, 'M'), (50, 'M')], [1, 2, 2, 2, 3, 2, 2, 2, 1], W(.5, 4) + [('boing', 4), ('pop', 3), ('whack', 7), ('whack', 8.5), ('thud', 6.5), ('thud', 10), ('crash', 10.05), ('whoosh', 10.2, 1.5), ('whoosh', 13, 1.5)] + W(5.5, 5) + W(14, 6) + [('chime', 19.4), ('click', 17.2)] + W(19.5, 5) + [('impact', 33), ('chime', 34)]),
}
CUES['keynote-vertical'] = CUES['keynote']
_ch = [(57, 'm'), (53, 'M'), (60, 'M'), (55, 'M')]
CUES['scoreboard'] = (32, _ch, [1, 2, 2, 3, 3, 3, 3, 2], W(.5, 3) + [('whoosh', 3, 1)] + [('click', 3 + 2.4 * k) for k in range(8)] + [('impact', 22.4), ('chime', 23), ('impact', 26.6)])
CUES['focus-ring'] = (32, _ch, [1, 2, 2, 2, 3, 2, 2, 1], W(.8, 4) + W(9, 4) + [('chime', 7 + 2.5 * k) for k in range(5)] + [('impact', 25), ('chime', 27)])
CUES['rerun'] = (24, _ch, [1, 2, 2, 2, 2, 2], W(.5, 5) + [('pop', 5), ('type', 6, 8), ('type', 8.3, 12.5), ('pop', 13), ('type', 14, 17), ('pop', 17.5), ('impact', 20.4)])
CUES['desks'] = (32, _ch, [1, 2, 2, 2, 3, 2, 2, 1], W(.5, 4) + [('whoosh', 2, 1), ('whoosh', 2.5, 1), ('whoosh', 3, 1), ('chime', 7), ('chime', 12.5), ('chime', 18), ('impact', 26), ('chime', 28)])
CUES['interruptions'] = (32, _ch, [1, 2, 2, 2, 3, 2, 2, 1], W(.5, 6) + [('click', 8 + 3 * k + .5 * j) for k in range(4) for j in range(4)] + [('impact', 25.5), ('chime', 27)])
CUES['dear-agent'] = (32, _ch, [1, 1, 2, 2, 2, 2, 2, 1], [('type', 2.5, 4.7), ('type', 5, 7.2), ('type', 9, 11.2), ('type', 11.5, 13.7), ('pop', .4)] + W(15, 6) + [('impact', 24), ('chime', 26)])
CUES['ask-room'] = (32, _ch, [1, 2, 2, 2, 3, 2, 2, 1], W(1.2, 7) + [('pop', 8 + 1.1 * i) for i in range(6)] + W(19.5, 6) + [('impact', 24), ('chime', 26)])
CUES['eight-tasks'] = (32, _ch, [1, 2, 2, 2, 3, 2, 2, 1], W(.5, 6) + [('click', 6 + 2 * k) for k in range(8)] + [('impact', 24.5), ('chime', 26.5)])
CUES['driver-or-model'] = (36, _ch, [1, 2, 2, 2, 3, 3, 2, 1], W(.5, 6) + [('pop', 6 + .6 * i) for i in range(6)] + [('pop', 15 + .6 * i) for i in range(6)] + [('impact', 24), ('chime', 25), ('impact', 33)])
CUES['both-ways'] = (36, _ch, [1, 2, 2, 2, 3, 3, 2, 1], W(.5, 5) + [('pop', 5), ('pop', 6.4), ('pop', 14), ('pop', 15.4)] + W(9, 4) + W(18, 4) + [('impact', 18), ('chime', 20)])
CUES['swap-one'] = (36, _ch, [1, 2, 2, 2, 3, 3, 2, 1], W(.5, 4) + [('pop', 5 + .4 * i) for i in range(4)] + [('pop', 13 + .4 * i) for i in range(4)] + W(21, 7) + [('impact', 21)])
for _a in ('a1', 'a2', 'a3'): CUES['hands-off-' + _a] = CUES['hands-off']
CUES['ask-race'] = (42, _ch, [1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 2], [('boing', 1), ('thud', 3), ('crash', 5), ('whoosh', 5.2, 1.5)] + W(8.5, 11) + W(15, 8) + [('click', 20 + 1.5 * k) for k in range(8)] + [('impact', 36), ('chime', 37)])
CUES['ask-score'] = (42, _ch, [1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 2], [('boing', 1), ('thud', 3), ('crash', 5), ('whoosh', 5.2, 1.5)] + W(8.5, 11) + W(15, 8) + [('click', 22 + 1.6 * k) for k in range(8)] + [('impact', 38), ('chime', 39)])

if __name__ == '__main__':
    for n in sys.argv[1:]:
        beats, ch, lv, cues = CUES[n]; build(n, beats, ch, lv, cues)
