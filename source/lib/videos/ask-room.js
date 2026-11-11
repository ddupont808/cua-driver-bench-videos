/* C3 "Ask the room": a poll-style card, koala bots pile on with "yes" (no percentages), then the bench with its baseline. 16 s, 120 bpm. */
(function () {
  const BPM = 120, B = 60 / BPM, NB = 32, DUR = NB * B;
  const BOTS = [['#8b5cf6', '#5b2fc9', '#0b0e13'], ['#ff7a2f', '#c24e10', '#0b0e13'], ['#61bcff', '#2a7fc4', '#0b0e13'], ['#8e98a3', '#5b6571', '#0b0e13'], ['#e3e7ec', '#7d8793', '#0b0e13'], ['#262a31', '#4b525e', '#f3f6fa']];
  let card, q, bots = [], bubbles = [], endEl, base, baseWrap, cap2;
  defineVideo({
    W: 1920, H: 1080, fps: 60, dur: DUR, bpm: BPM, bg: C.graphite,
    init(c) {
      const O = c.overlay, L = c.layer;
      card = el('div', '', '', O); card.style.cssText = 'position:absolute;left:260px;top:90px;width:1400px;height:230px;border-radius:26px;background:#f3f6fa;box-shadow:0 30px 80px rgba(0,0,0,.55);opacity:0';
      q = Words(card, 'Has an agent ever typed into your email?', 'position:absolute;left:0;right:0;top:56px;text-align:center;font-size:78px;white-space:nowrap;color:#0f1a2a');
      BOTS.forEach(([f, n, ink], i) => { const b = new KBot(L, f, n, ink); bots.push(b); const bb = el('div', 'disp', 'Yes', L); bb.style.cssText = `position:absolute;left:0;top:0;font-size:52px;color:#0b0e13;background:#f3f6fa;border-radius:28px;padding:6px 30px;opacity:0;white-space:nowrap`; bubbles.push(bb); });
      cap2 = Words(O, 'We measured how often it happens.', 'position:absolute;left:0;right:0;top:130px;text-align:center;font-size:96px;white-space:nowrap');
      endEl = el('div', '', `<div style="display:flex;align-items:center;gap:30px;justify-content:center">${markSVG(C.paper, 110)}<div class="disp" style="font-size:110px">Cua Driver Bench</div></div><div class="disp" style="font-size:60px;text-align:center;margin-top:16px"><span style="color:${C.signal}">${PCT0()}%</span> fully passed on macOS, ${esc(NUM().model)}</div>`, O); endEl.style.cssText += ';position:absolute;left:0;right:0;top:110px;opacity:0'; endEl._p = partnerRow(c.overlay);
      baseWrap = el('div', '', '', O); baseWrap.style.cssText = 'position:absolute;left:90px;top:470px;width:1740px;height:300px;opacity:0';
      base = el('div', '', baselineHTML(1740, 1.25) + `<div class="mono" style="position:absolute;left:0;top:215px;font-size:18px;line-height:1.45;color:${C.slate};white-space:nowrap">${BASE_NOTE()}</div>`, baseWrap); base.style.cssText = 'position:absolute;left:0;top:0;width:1740px;height:260px';
    },
    frame(t, c) {
      const T = t / B, dim1 = 1 - E.io3(P(T, 18, 19)), dim = 1 - E.io3(P(T, 22.5, 23.5));
      card.style.opacity = E.out3(P(T, 0.3, 1.3)) * dim1; q.set(t, 1.2 * B, B / 2, .35, .3, 8);
      bots.forEach((b, i) => {
        const s0 = 7 + i * 1.1, p = E.out5(P(T, s0, s0 + 1.2)), x = -730 + i * 290, hop = T > s0 + 1.2 && T < 18 ? Math.abs(Math.sin((T - s0) * 2.2)) * 18 : 0;
        b.draw(T > s0 + 0.8 ? '^' : '*', 1);
        put(b.root, { x, y: lerp(700, 120, p) - hop, s: 0.52, a: dim1 });
        const bb = bubbles[i]; bb.style.left = (960 + x - 55) + 'px'; bb.style.top = (540 - 140 - hop) + 'px'; bb.style.opacity = E.out3(P(T, s0 + 0.9, s0 + 1.4)) * dim1; bb.style.transform = `scale(${(0.7 + 0.3 * E.back(P(T, s0 + 0.9, s0 + 1.5))).toFixed(2)})`;
      });
      cap2.show(T > 19 && T < 23.6); cap2.set(t, 19.5 * B, B / 2, .4, .3, 8); cap2.d.style.opacity = dim;
      const e = E.out3(P(T, 24, 25)); endEl.style.opacity = e; endEl._p.style.opacity = endEl.style.opacity; endEl.style.transform = `translateY(${((1 - e) * 20).toFixed(0)}px)`;
      baseWrap.style.opacity = E.out3(P(T, 26, 27)); baselineSet(base, P(T, 26.5, 29));
    },
  });
})();
