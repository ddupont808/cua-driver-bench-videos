/* C2 "Dear agent": a typed note on screen, then the result with its baseline. 16 s, 120 bpm. */
(function () {
  const BPM = 120, B = 60 / BPM, NB = 32, DUR = NB * B;
  const NOTE = ['Dear agent,', 'please do not touch my cursor.', 'I am typing.', 'Thank you. — me'];
  let paper, lines = [], cap, endEl, base, baseWrap;
  defineVideo({
    W: 1920, H: 1080, fps: 60, dur: DUR, bpm: BPM, bg: C.graphite,
    init(c) {
      const O = c.overlay;
      paper = el('div', '', '', O); paper.style.cssText = 'position:absolute;left:380px;top:150px;width:1160px;height:560px;border-radius:14px;background:#f3f6fa;box-shadow:0 40px 100px rgba(0,0,0,.6);opacity:0';
      NOTE.forEach((t, i) => { const e = el('div', 'disp', '', paper); e.style.cssText = `position:absolute;left:70px;top:${44 + i * 120}px;font-size:${i === 1 ? 84 : 76}px;color:#0f1a2a;white-space:nowrap;${i === 3 ? 'left:520px;color:#4a5668;' : ''}`; lines.push(e); });
      cap = Words(O, 'So we measured whether it listens.', 'position:absolute;left:0;right:0;top:790px;text-align:center;font-size:84px;white-space:nowrap');
      endEl = el('div', '', `<div style="display:flex;align-items:center;gap:30px;justify-content:center">${markSVG(C.paper, 110)}<div class="disp" style="font-size:110px">Cua Driver Bench</div></div><div class="disp" style="font-size:56px;text-align:center;margin-top:16px"><span style="color:${C.signal}">${PCT0()}%</span> of Cua Driver&#39;s macOS background trials fully passed</div>`, O); endEl.style.cssText += ';position:absolute;left:0;right:0;top:90px;opacity:0'; endEl._p = partnerRow(c.overlay);
      baseWrap = el('div', '', '', O); baseWrap.style.cssText = 'position:absolute;left:90px;top:470px;width:1740px;height:300px;opacity:0';
      base = el('div', '', baselineHTML(1740, 1.25) + `<div class="mono" style="position:absolute;left:0;top:215px;font-size:18px;line-height:1.45;color:${C.slate};white-space:nowrap">${BASE_NOTE()}</div>`, baseWrap); base.style.cssText = 'position:absolute;left:0;top:0;width:1740px;height:260px';
    },
    frame(t, c) {
      const T = t / B, dim = 1 - E.io3(P(T, 22.5, 23.5));
      const p = E.out5(P(T, 0.4, 1.8)); paper.style.opacity = p * dim; paper.style.transform = `translateY(${((1 - p) * 70).toFixed(0)}px) rotate(${(-1.2 * p).toFixed(2)}deg)`;
      const starts = [2.5, 5, 9, 11.5];
      lines.forEach((e, i) => { const n = Math.floor(clamp((T - starts[i]) / 2.2) * NOTE[i].length); e.innerHTML = typedHTML(NOTE[i], n); });
      cap.show(T > 14 && T < 23.5); cap.set(t, 15 * B, B / 2, .4, .3, 8); cap.d.style.opacity = dim;
      const e = E.out3(P(T, 24, 25)); endEl.style.opacity = e; endEl._p.style.opacity = endEl.style.opacity; endEl.style.transform = `translateY(${((1 - e) * 20).toFixed(0)}px)`;
      baseWrap.style.opacity = E.out3(P(T, 26, 27)); baselineSet(base, P(T, 26.5, 29));
    },
  });
})();
