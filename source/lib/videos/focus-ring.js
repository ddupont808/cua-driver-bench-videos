/* B2 Focus ring: a person's focus ring stays full while background agents finish tasks. No numbers until the end card. 16 s, 120 bpm. */
(function () {
  const BPM = 120, B = 60 / BPM, NB = 32, DUR = NB * B;
  let ring, doc, text, bgw = [], chips = [], ptrs = [], cap1, cap2, endEl, base, baseWrap;
  const TXT = 'Notes for Friday: finish the slides, then lunch.';
  const POS = [[-700, -230], [700, -230], [-700, 290], [700, 290], [0, 400]];
  const NAMES = ['Mail', 'Calendar', 'Budget', 'Chat', 'Tracker'];
  defineVideo({
    W: 1920, H: 1080, fps: 60, dur: DUR, bpm: BPM, bg: C.graphite,
    init(c) {
      const L = c.layer, O = c.overlay;
      POS.forEach((p, i) => {
        const w = new AppWin(L, { w: 400, h: 250, title: NAMES[i] }); w.setActive(false);
        w.body.innerHTML = [0, 1, 2].map(k => `<div style="position:absolute;left:30px;top:${30 + k * 46}px;width:${300 - k * 50}px;height:13px;border-radius:7px;background:#8e98a3"></div><div data-f${k} style="position:absolute;left:30px;top:${30 + k * 46}px;width:${300 - k * 50}px;height:13px;border-radius:7px;background:#61bcff;transform-origin:left;transform:scaleX(0)"></div>`).join(''); bgw.push(w);
        const ch = el('div', 'chip', `<span style="color:${C.green};font-size:26px">&#10003;</span>Done`, w.win); ch.style.cssText += ';position:absolute;right:10px;top:52px;opacity:0;font-size:20px;padding:4px 14px'; chips.push(ch);
        const pt = el('div', 'c3', AGENT_CURSOR(40, 'Cua Driver'), L); ptrs.push(pt);
      });
      ring = el('div', 'c3', '', L); ring.style.cssText += `;margin-left:-440px;margin-top:-280px;width:880px;height:560px;border-radius:30px;border:8px solid ${C.signal};box-shadow:0 0 60px rgba(97,188,255,.55),inset 0 0 40px rgba(97,188,255,.25);box-sizing:border-box`;
      doc = new AppWin(L, { w: 800, h: 480, title: 'Notes' }); doc.win.style.background = '#fbfcfe';
      text = el('div', '', '', doc.body); text.style.cssText = 'position:absolute;left:44px;top:40px;width:720px;font:600 40px/1.45 Urbanist;color:#0f1a2a';
      cap1 = Words(O, 'You keep your focus.', 'position:absolute;left:0;right:0;top:34px;text-align:center;font-size:76px;white-space:nowrap');
      cap2 = Words(O, 'Agents finish behind it.', 'position:absolute;left:0;right:0;top:34px;text-align:center;font-size:76px;white-space:nowrap');
      endEl = el('div', '', `<div style="display:flex;align-items:center;gap:30px;justify-content:center">${markSVG(C.paper, 120)}<div class="disp" style="font-size:120px">Cua Driver</div></div><div class="disp" style="font-size:60px;text-align:center;margin-top:20px"><span style="color:${C.signal}">${PCT0()}%</span> fully passed on macOS, ${esc(NUM().model)}</div>`, O); endEl.style.cssText += ';position:absolute;left:0;right:0;top:130px;opacity:0'; endEl._p = partnerRow(c.overlay);
      baseWrap = el('div', '', '', O); baseWrap.style.cssText = 'position:absolute;left:90px;top:500px;width:1740px;height:300px;opacity:0';
      base = el('div', '', baselineHTML(1740, 1.25) + `<div class="mono" style="position:absolute;left:0;top:215px;font-size:18px;line-height:1.45;color:${C.slate};white-space:nowrap">${BASE_NOTE()}</div>`, baseWrap); base.style.cssText = 'position:absolute;left:0;top:0;width:1740px;height:260px';
    },
    frame(t, c) {
      const T = t / B, endP = E.io3(P(T, 24, 25)), dim = 1 - endP;
      const dIn = E.out5(P(T, 0.3, 1.8));
      put(doc.root, { x: 0, y: lerp(120, 0, dIn), s: 1, a: dIn * dim });
      put(ring, { x: 0, y: lerp(120, 0, dIn), s: 1 + 0.006 * Math.sin(T * 2), a: P(T, 1.5, 2.5) * dim });
      const n = typedN(T, 2.5, 22, TXT.length); text.innerHTML = typedHTML(TXT, n).replace('<span style="opacity:0">', '<span style="display:inline-block;width:4px;height:1.05em;background:#0f1a2a;vertical-align:-0.16em;margin-left:2px"></span><span style="opacity:0">');
      bgw.forEach((w, i) => {
        const s0 = 5 + i * 2.5, p = E.out5(P(T, 3 + i * 0.3, 4.4 + i * 0.3)); put(w.root, { x: lerp(POS[i][0] * 1.3, POS[i][0], p), y: POS[i][1], s: 0.95, a: p * dim });
        [0, 1, 2].forEach(k => w.body.querySelector(`[data-f${k}]`).style.transform = `scaleX(${clamp((T - (s0 + k * 0.6)) / 0.7)})`);
        chips[i].style.opacity = E.out3(P(T, s0 + 2, s0 + 2.5));
        const a = pathAt(T, [[s0 - 0.5, POS[i][0] + 150, POS[i][1] - 60], [s0 + 0.2, POS[i][0] - 60, POS[i][1] - 40], [s0 + 1.0, POS[i][0] - 20, POS[i][1] + 10], [s0 + 1.8, POS[i][0] + 40, POS[i][1] + 40], [s0 + 2.4, POS[i][0] + 140, POS[i][1] - 70]]);
        put(ptrs[i], { x: a[0] + 12, y: a[1] + 16, s: 1, a: P(T, s0 - 0.5, s0 - 0.2) * (1 - P(T, s0 + 2.2, s0 + 2.6)) * dim });
      });
      cap1.show(T < 8.4); cap1.set(t, 0.8 * B, B / 2, .4, .3, 8); cap1.d.style.opacity = 1 - E.io2(P(T, 7.5, 8.2));
      cap2.show(T >= 8.4 && T < 24.5); cap2.set(t, 9 * B, B / 2, .4, .3, 8); cap2.d.style.opacity = 1 - E.io2(P(T, 22.5, 24));
      const e = E.out3(P(T, 25, 26)); endEl.style.opacity = e; endEl._p.style.opacity = endEl.style.opacity; endEl.style.transform = `translateY(${((1 - e) * 20).toFixed(0)}px)`;
      baseWrap.style.opacity = E.out3(P(T, 26.5, 27.5)); baselineSet(base, P(T, 27, 29.5));
    },
  });
})();
