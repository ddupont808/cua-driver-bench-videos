/* C4 "Eight tasks": the eight background tasks as stickers peeling onto a laptop, each stamped with Cua Driver's full passes out of 5
   (from numbers.json drivers[0].per_task), including the zeros; then the baseline of all four drivers. 16 s, 120 bpm. */
(function () {
  const BPM = 120, B = 60 / BPM, NB = 32, DUR = NB * B;
  const N = window.NUMBERS, cu = N.drivers[0];
  const TASKS = [['CDB-G02', 'Replan a schedule across four apps'], ['CDB-G03', 'A multi-app workflow'], ['CDB-G04', 'Review a linked case across apps'], ['IR-01', 'A permission sheet'], ['IR-02', 'An update banner'], ['IR-03', 'An unsaved-changes prompt'], ['IR-04', 'A cookie-consent overlay'], ['MB-09', 'Drag to reorder a list']];
  let stickers = [], cap, lap, endEl, base, baseWrap, note;
  defineVideo({
    W: 1920, H: 1080, fps: 60, dur: DUR, bpm: BPM, bg: C.graphite,
    init(c) {
      const O = c.overlay;
      cap = Words(O, 'Eight background tasks. Five trials each.', 'position:absolute;left:0;right:0;top:46px;text-align:center;font-size:84px;white-space:nowrap');
      lap = el('div', '', '', O); lap.style.cssText = 'position:absolute;left:150px;top:190px;width:1620px;height:760px;border-radius:40px;background:#10161f;border:3px solid rgba(243,246,250,.16);opacity:0';
      TASKS.forEach(([id, title], i) => {
        const v = cu.per_task[i], x = 210 + (i % 4) * 390, y = 250 + Math.floor(i / 4) * 330;
        const s = el('div', '', `<div class="mono" style="font-size:26px;color:#4a5668">${id}</div><div class="disp" style="font-size:36px;line-height:1.1;color:#0f1a2a;margin-top:8px">${esc(title)}</div><div data-st class="disp" style="position:absolute;right:16px;bottom:10px;font-size:84px;color:${v ? '#1f9d55' : '#8e98a3'};transform:rotate(-8deg);opacity:0">${v}/5</div>`, O);
        s.style.cssText += `;position:absolute;left:${x}px;top:${y}px;width:350px;height:260px;padding:22px;box-sizing:border-box;border-radius:16px;background:#f3f6fa;box-shadow:0 14px 30px rgba(0,0,0,.4);opacity:0`; stickers.push(s);
      });
      note = el('div', 'mono', 'Cua Driver full passes per task, out of 5 (AgentEnv runs, macOS, Claude Sonnet 5.5; zeros included). The two multi-app tasks CDB-G02 and CDB-G03 and the drag task MB-09 are where it passes least.', O); note.style.cssText = `position:absolute;left:150px;top:970px;font-size:22px;color:${C.slate};white-space:nowrap;opacity:0`;
      endEl = el('div', '', `<div style="display:flex;align-items:center;gap:30px;justify-content:center">${markSVG(C.paper, 110)}<div class="disp" style="font-size:110px">Cua Driver</div></div><div class="disp" style="font-size:60px;text-align:center;margin-top:16px"><span style="color:${C.signal}">${PCT0()}%</span> fully passed on macOS, ${esc(NUM().model)}</div>`, O); endEl.style.cssText += ';position:absolute;left:0;right:0;top:110px;opacity:0'; endEl._p = partnerRow(c.overlay);
      baseWrap = el('div', '', '', O); baseWrap.style.cssText = 'position:absolute;left:90px;top:470px;width:1740px;height:300px;opacity:0';
      base = el('div', '', baselineHTML(1740, 1.25) + `<div class="mono" style="position:absolute;left:0;top:215px;font-size:18px;line-height:1.45;color:${C.slate};white-space:nowrap">${BASE_NOTE()}</div>`, baseWrap); base.style.cssText = 'position:absolute;left:0;top:0;width:1740px;height:260px';
    },
    frame(t, c) {
      const T = t / B, dim = 1 - E.io3(P(T, 23.5, 24.5));
      cap.set(t, 0.5 * B, B / 2, .4, .3, 8); cap.d.style.opacity = dim; lap.style.opacity = E.out3(P(T, 1, 2)) * dim;
      stickers.forEach((s, i) => {
        const s0 = 5 + i * 2, p = E.out5(P(T, s0, s0 + 1)), peel = E.io3(P(T, s0, s0 + 0.9));
        s.style.opacity = p * dim; s.style.transform = `translate(${((1 - p) * 80).toFixed(0)}px,${((1 - p) * -120).toFixed(0)}px) rotate(${((1 - p) * 14).toFixed(1)}deg) scale(${(1.12 - 0.12 * peel).toFixed(3)})`;
        const st = s.querySelector('[data-st]'), q = E.back(P(T, s0 + 1, s0 + 1.6)); st.style.opacity = P(T, s0 + 1, s0 + 1.2) * 1; st.style.transform = `rotate(-8deg) scale(${(2 - q).toFixed(3)})`;
      });
      note.style.opacity = E.out3(P(T, 14, 15)) * dim;
      const e = E.out3(P(T, 24.5, 25.5)); endEl.style.opacity = e; endEl._p.style.opacity = endEl.style.opacity; endEl.style.transform = `translateY(${((1 - e) * 20).toFixed(0)}px)`;
      baseWrap.style.opacity = E.out3(P(T, 26.5, 27.5)); baselineSet(base, P(T, 27, 29.5));
    },
  });
})();
