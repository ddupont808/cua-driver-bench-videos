/* B4 One driver, every desk: macOS, Windows and Linux desks, one task each; no scores except the macOS end card with baseline. 16 s, 120 bpm. */
(function () {
  const BPM = 120, B = 60 / BPM, NB = 32, DUR = NB * B;
  const DESKS = [['macOS', 'Mail', 'Reply sent'], ['Windows', 'Calendar', 'Moved to Thursday'], ['Linux', 'Sheet', 'Totals updated']];
  const XS = [-640, 0, 640];
  let desks = [], cap, endEl, base, baseWrap, tag;
  defineVideo({
    W: 1920, H: 1080, fps: 60, dur: DUR, bpm: BPM, bg: C.graphite,
    init(c) {
      const L = c.layer, O = c.overlay;
      cap = Words(O, 'One driver. Every desk.', 'position:absolute;left:0;right:0;top:60px;text-align:center;font-size:110px;white-space:nowrap');
      DESKS.forEach(([os, app, done], i) => {
        const g = { os };
        g.label = el('div', 'disp', os, L); g.label.style.cssText = 'position:absolute;left:0;top:0;font-size:60px;white-space:nowrap';
        g.front = new AppWin(L, { w: 480, h: 300, title: 'Notes' }); g.front.win.style.background = '#fbfcfe'; g.front.body.innerHTML = '<div data-tx style="position:absolute;left:26px;top:26px;width:420px;font:600 26px/1.4 Urbanist;color:#0f1a2a"></div>';
        g.back = new AppWin(L, { w: 440, h: 260, title: app }); g.back.setActive(false);
        g.back.body.innerHTML = [0, 1, 2].map(k => `<div style="position:absolute;left:30px;top:${30 + k * 44}px;width:${300 - k * 50}px;height:13px;border-radius:7px;background:#8e98a3"></div><div data-f${k} style="position:absolute;left:30px;top:${30 + k * 44}px;width:${300 - k * 50}px;height:13px;border-radius:7px;background:#61bcff;transform-origin:left;transform:scaleX(0)"></div>`).join('');
        g.chip = el('div', 'chip', `<span style="color:${C.green};font-size:24px">&#10003;</span>${done}`, g.back.win); g.chip.style.cssText += ';position:absolute;right:10px;top:50px;opacity:0;font-size:19px;padding:4px 14px';
        g.ptr = el('div', 'c3', AGENT_CURSOR(40, 'Cua Driver'), L);
        desks.push(g);
      });
      endEl = el('div', '', `<div style="display:flex;align-items:center;gap:30px;justify-content:center">${markSVG(C.paper, 110)}<div class="disp" style="font-size:110px">Cua Driver</div></div><div class="disp" style="font-size:60px;text-align:center;margin-top:16px"><span style="color:${C.signal}">${PCT0()}%</span> fully passed on macOS, ${esc(NUM().model)}</div>`, O); endEl.style.cssText += ';position:absolute;left:0;right:0;top:110px;opacity:0'; endEl._p = partnerRow(c.overlay);
      baseWrap = el('div', '', '', O); baseWrap.style.cssText = 'position:absolute;left:90px;top:470px;width:1740px;height:300px;opacity:0';
      base = el('div', '', baselineHTML(1740, 1.25) + `<div class="mono" style="position:absolute;left:0;top:215px;font-size:18px;line-height:1.45;color:${C.slate};white-space:nowrap">${BASE_NOTE()}</div>`, baseWrap); base.style.cssText = 'position:absolute;left:0;top:0;width:1740px;height:260px';
    },
    frame(t, c) {
      const T = t / B, endP = E.io3(P(T, 25, 26)), dim = 1 - endP;
      cap.set(t, 0.5 * B, B / 2, .4, .3, 8); cap.d.style.opacity = dim * (1 - E.io2(P(T, 22, 24)) * 0);
      desks.forEach((g, i) => {
        const s0 = 5 + i * 5.5, p = E.out5(P(T, 2 + i * 0.5, 3.6 + i * 0.5)), x = XS[i];
        put(g.front.root, { x, y: lerp(180, 90, p), s: 0.95, a: p * dim });
        put(g.back.root, { x: x + 100, y: lerp(60, -70, p), s: 0.95, a: p * dim });
        g.label.style.opacity = p * dim; g.label.style.left = (960 + x - 100) + 'px'; g.label.style.top = '215px'; g.label.style.width = '200px'; g.label.style.textAlign = 'center';
        const tx = 'Notes for Friday: finish the slides.'; g.front.body.querySelector('[data-tx]').textContent = tx.slice(0, Math.floor(clamp((T - 4) / 18) * tx.length));
        [0, 1, 2].forEach(k => g.back.body.querySelector(`[data-f${k}]`).style.transform = `scaleX(${clamp((T - (s0 + k * 0.6)) / 0.7)})`);
        g.chip.style.opacity = E.out3(P(T, s0 + 2, s0 + 2.5));
        const bx = x + 100 - 220, by = -70 - 130, a = pathAt(T, [[s0 - 0.4, bx + 400, by + 100], [s0 + 0.2, bx + 90, by + 150], [s0 + 1, bx + 130, by + 200], [s0 + 1.8, bx + 200, by + 230], [s0 + 2.4, bx + 380, by + 150]]);
        put(g.ptr, { x: a[0] + 12, y: a[1] + 16, s: 1, a: P(T, s0 - 0.4, s0 - 0.1) * (1 - P(T, s0 + 2.2, s0 + 2.6)) * dim });
      });
      const e = E.out3(P(T, 26, 27)); endEl.style.opacity = e; endEl._p.style.opacity = endEl.style.opacity; endEl.style.transform = `translateY(${((1 - e) * 20).toFixed(0)}px)`;
      baseWrap.style.opacity = E.out3(P(T, 27.5, 28.5)); baselineSet(base, P(T, 28, 30.5));
    },
  });
})();
