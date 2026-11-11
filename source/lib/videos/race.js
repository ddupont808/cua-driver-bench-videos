/* The race: four drivers over eight tasks, bars end at the final numbers from numbers.json (injected as window.NUMBERS).
   15 s, 120 bpm. Intermediate bar positions are animation; only the end values are data (per_task shapes the steps when present). */
(function () {
  const BPM = 120, B = 60 / BPM, NB = 30, DUR = NB * B;
  const N = window.NUMBERS; if (!N) throw new Error('numbers.json was not injected');
  const D = N.drivers, NT = N.n_tasks;
  const TR = [720, 1780]; // bar track x (px)
  const LANE0 = 330, LANEH = 132;
  const steps = D.map(d => d.per_task && d.per_task.length === NT ? d.per_task.slice() : Array.from({ length: NT }, () => d.passed / NT));
  const LEG0 = 2.5, LEGD = 2.25, LEGMOVE = 1.5; // beats
  const LASTEND = LEG0 + (NT - 1) * LEGD + LEGMOVE;
  let lanes = [], axis, head, sub, counter, foot, endEl;
  defineVideo({
    W: 1920, H: 1080, fps: 60, dur: DUR, bpm: BPM, bg: C.graphite,
    init(c) {
      const O = c.overlay;
      head = Words(O, N.title + '.', 'position:absolute;left:140px;top:64px;font-size:96px;white-space:nowrap');
      sub = el('div', 'mono', esc(N.subtitle), O); sub.style.cssText = `position:absolute;left:144px;top:190px;font-size:26px;color:${C.slate};white-space:nowrap`;
      counter = el('div', 'mono', '', O); counter.style.cssText = `position:absolute;right:140px;top:100px;font-size:34px;color:${C.paper};text-align:right`;
      const ax = el('div', '', [0, 25, 50, 75, 100].map(v => `<div style="position:absolute;left:${TR[0] + (TR[1] - TR[0]) * v / 100}px;top:0;width:1.5px;height:${D.length * LANEH - 20}px;background:rgba(243,246,250,.1)"></div><div class="mono" style="position:absolute;left:${TR[0] + (TR[1] - TR[0]) * v / 100 - 30}px;top:${D.length * LANEH - 14}px;width:60px;text-align:center;font-size:20px;color:${C.slate}">${v}%</div>`).join(''), O);
      axis = ax; ax.style.cssText += `;position:absolute;left:0;top:${LANE0 - 6}px;width:1920px;height:${D.length * LANEH}px`;
      D.forEach((d, i) => {
        const L = el('div', '', '', O); L.style.cssText = `position:absolute;left:0;top:${LANE0 + i * LANEH}px;width:1920px;height:104px`;
        L.innerHTML = `<div class="disp" style="position:absolute;left:140px;top:12px;font-size:42px;white-space:nowrap;color:${d.highlight ? C.paper : '#c4ccd8'}">${esc(d.name)}</div><div class="mono" style="position:absolute;left:142px;top:70px;font-size:20px;color:${C.slate}">${esc(d.source)}</div>` +
          `<div style="position:absolute;left:${TR[0]}px;top:20px;width:${TR[1] - TR[0]}px;height:64px;border-radius:12px;background:rgba(243,246,250,.06)"></div>` +
          `<div data-bar style="position:absolute;left:${TR[0]}px;top:20px;width:0px;height:64px;border-radius:12px;background:${d.highlight ? C.signal : '#6b7686'}"></div>` +
          `<div data-val class="disp" style="position:absolute;top:8px;left:${TR[0]}px;font-size:70px;white-space:nowrap;color:${d.highlight ? C.signal : C.paper}"></div>` +
          `<div data-n class="mono" style="position:absolute;top:82px;left:${TR[0]}px;font-size:22px;color:${C.slate};white-space:nowrap"></div>`;
        lanes.push({ L, bar: L.querySelector('[data-bar]'), val: L.querySelector('[data-val]'), nn: L.querySelector('[data-n]') });
      });
      foot = el('div', 'mono', esc(N.footnote) + '<br>' + esc(N.caveat), O); foot.style.cssText = `position:absolute;left:140px;right:140px;top:${LANE0 + D.length * LANEH + 40}px;font-size:18px;color:${C.slate};line-height:1.4`;
      endEl = el('div', '', `<div style="display:flex;align-items:center;gap:34px;justify-content:center">${markSVG(C.paper, 130)}<div class="disp" style="font-size:140px">Cua Driver Bench</div></div><div class="disp" style="font-size:54px;text-align:center;margin-top:30px;color:${C.signal}">Can an agent use your apps without disturbing you?</div><div class="mono" style="font-size:26px;text-align:center;margin-top:30px;color:${C.slate}">${esc(N.other_os_note || '')}</div><div class="mono" style="font-size:28px;text-align:center;margin-top:26px;color:${C.paper}">cua.ai &middot; github.com/trycua/cua</div>`, O);
      endEl.style.cssText += ';position:absolute;left:0;right:0;top:310px;opacity:0'; endEl._p = partnerRow(c.overlay);
    },
    frame(t, c) {
      const T = t / B;
      const endP = E.io3(P(T, 24.5, 25.5)), dim = 1 - endP;
      head.set(t, 0.3 * B, B / 2, .5, .35, 10); head.d.style.opacity = dim;
      sub.style.opacity = E.out3(P(T, 1.5, 2.5)) * dim;
      const legNow = clamp(Math.floor((T - LEG0) / LEGD) + 1, 0, NT);
      counter.textContent = T < LEG0 ? '' : `task ${Math.min(NT, legNow)} of ${NT}`; counter.style.opacity = dim * P(T, LEG0 - .3, LEG0 + .3);
      foot.style.opacity = E.out3(P(T, 2, 3)) * dim; axis.style.opacity = dim;
      lanes.forEach((ln, i) => {
        const enter = E.out5(P(T, 0.8 + i * 0.35, 2.2 + i * 0.35));
        ln.L.style.opacity = enter * dim; ln.L.style.transform = `translateX(${((1 - enter) * -120).toFixed(1)}px)`;
        let v = 0;
        for (let k = 0; k < NT; k++) { const s = LEG0 + k * LEGD; v += steps[i][k] * E.io3(P(T, s, s + LEGMOVE)); }
        const done = T >= LASTEND;
        if (done) v = D[i].passed;
        const frac = v / D[i].n, w = (TR[1] - TR[0]) * frac;
        ln.bar.style.width = w.toFixed(1) + 'px';
        ln.val.textContent = (done ? Math.round(D[i].passed * 100 / D[i].n) : Math.round(frac * 100)) + '%'; ln.val.style.left = (TR[0] + w + 24) + 'px';
        ln.nn.textContent = `${done ? D[i].passed : Math.round(v)} / ${D[i].n} trials`; ln.nn.style.left = (TR[0] + w + 28) + 'px'; ln.nn.style.opacity = P(T, LEG0, LEG0 + 1);
        const pop = done ? Math.sin(Math.min(1, (T - LASTEND) / 1.2) * Math.PI) : 0;
        ln.val.style.transform = `scale(${(1 + .08 * pop).toFixed(3)})`; ln.val.style.transformOrigin = 'left center';
      });
      const eIn = E.out3(P(T, 25.2, 26.4)); endEl.style.opacity = eIn; endEl._p.style.opacity = endEl.style.opacity; endEl.style.transform = `translateY(${((1 - eIn) * 24).toFixed(1)}px)`;
    },
  });
})();
