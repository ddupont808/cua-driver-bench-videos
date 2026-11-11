/* C1 "Count the interruptions" (the cursor-count idea, from real data): how many of 40 background trials raised a window over the
   user's window, per driver, from numbers.json (drivers[].disturbed). Then the baseline of full passes. 16 s, 120 bpm. */
(function () {
  const BPM = 120, B = 60 / BPM, NB = 32, DUR = NB * B;
  const N = window.NUMBERS, D = N.drivers;
  const ORDER = D.map((d, i) => i).sort((a, b) => D[b].disturbed - D[a].disturbed); // most interruptions first
  let cap, cols = [], user, userCur, endEl, base, baseWrap, cap2;
  defineVideo({
    W: 1920, H: 1080, fps: 60, dur: DUR, bpm: BPM, bg: C.graphite,
    init(c) {
      const O = c.overlay;
      cap = Words(O, 'How often is the user disturbed?', 'position:absolute;left:0;right:0;top:50px;text-align:center;font-size:84px;white-space:nowrap');
      cap2 = el('div', 'mono', `out of 40 background trials where the dataset marks the user as disturbed &middot; macOS &middot; ${NUM().model} &middot; AgentEnv runs &middot; not like-for-like with Cua&#39;s own runner`, O); cap2.style.cssText = `position:absolute;left:0;right:0;top:170px;text-align:center;font-size:24px;color:${C.slate}`;
      ORDER.forEach((di, k) => {
        const d = D[di], x = 60 + k * 450;
        const col = el('div', '', `<div class="disp" style="font-size:31px;white-space:nowrap;color:${d.highlight ? C.paper : '#c4ccd8'}">${esc(d.name)}</div><div class="disp" data-n style="font-size:210px;line-height:1.02;color:${d.highlight ? C.signal : C.paper}">0</div><div class="mono" style="font-size:22px;color:${C.slate}">trials with the user disturbed</div><div data-w style="position:relative;height:240px;margin-top:18px"></div>`, O);
        col.style.cssText += `;position:absolute;left:${x}px;top:260px;width:430px`; cols.push({ col, d, n: col.querySelector('[data-n]'), w: col.querySelector('[data-w]') });
        for (let i = 0; i < d.disturbed; i++) { const q = el('div', '', '', cols[k].w); const cx = (i % 10) * 36, cy = Math.floor(i / 10) * 40; q.style.cssText = `position:absolute;left:${cx}px;top:${cy}px;width:28px;height:30px;border-radius:6px;background:${d.highlight ? C.signal : '#f08a4b'};opacity:0;border:2px solid #0b0e13`; }
      });
      endEl = el('div', '', `<div style="display:flex;align-items:center;gap:30px;justify-content:center">${markSVG(C.paper, 110)}<div class="disp" style="font-size:110px">Cua Driver</div></div><div class="disp" style="font-size:60px;text-align:center;margin-top:16px"><span style="color:${C.signal}">${PCT0()}%</span> fully passed on macOS, ${esc(NUM().model)}</div>`, O); endEl.style.cssText += ';position:absolute;left:0;right:0;top:110px;opacity:0'; endEl._p = partnerRow(c.overlay);
      baseWrap = el('div', '', '', O); baseWrap.style.cssText = 'position:absolute;left:90px;top:470px;width:1740px;height:300px;opacity:0';
      base = el('div', '', baselineHTML(1740, 1.25) + `<div class="mono" style="position:absolute;left:0;top:215px;font-size:18px;line-height:1.45;color:${C.slate};white-space:nowrap">${BASE_NOTE()}</div>`, baseWrap); base.style.cssText = 'position:absolute;left:0;top:0;width:1740px;height:260px';
    },
    frame(t, c) {
      const T = t / B, dim = 1 - E.io3(P(T, 24.5, 25.5));
      cap.set(t, 0.5 * B, B / 2, .4, .3, 8); cap.d.style.opacity = dim; cap2.style.opacity = E.out3(P(T, 6, 7)) * dim;
      cols.forEach((o, k) => {
        const s0 = 8 + k * 3, p = P(T, s0, s0 + 2.5), cnt = Math.round(o.d.disturbed * E.out3(p));
        o.col.style.opacity = E.out3(P(T, 2 + k * 0.4, 3.4 + k * 0.4)) * dim; o.n.textContent = cnt;
        [...o.w.children].forEach((q, i) => { q.style.opacity = i < cnt ? 1 : 0; });
      });
      const e = E.out3(P(T, 25.5, 26.5)); endEl.style.opacity = e; endEl._p.style.opacity = endEl.style.opacity; endEl.style.transform = `translateY(${((1 - e) * 20).toFixed(0)}px)`;
      baseWrap.style.opacity = E.out3(P(T, 27, 28)); baselineSet(base, P(T, 27.5, 30));
    },
  });
})();
