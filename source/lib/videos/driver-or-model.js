/* D1 Driver or model? Windows, background full pass per model, cua-driver vs agent-desktop, from numbers.json windows. 16 s. */
(function () {
  const BPM = 120, B = 60 / BPM, NB = 36, DUR = NB * B;
  const W = window.NUMBERS.windows, MO = W.models, CU = W.drivers['cua-driver'], AD = W.drivers['agent-desktop'];
  let title, rows = [], sub, foot, endEl, closing;
  const XS = i => 330 + i * 255;
  defineVideo({
    W: 1920, H: 1080, fps: 60, dur: DUR, bpm: BPM, bg: C.graphite,
    init(c) {
      const O = c.overlay;
      title = Words(O, 'Does the model or the driver decide?', 'position:absolute;left:0;right:0;top:44px;text-align:center;font-size:92px;white-space:nowrap');
      sub = el('div', 'mono', 'Windows &middot; background full pass &middot; 40 trials per cell', O); sub.style.cssText = `position:absolute;left:0;right:0;top:170px;text-align:center;font-size:26px;color:${C.slate};opacity:0`;
      [[CU, true], [AD, false]].forEach(([D, hl], r) => {
        const row = el('div', '', `<div class="disp" style="position:absolute;left:0;top:30px;font-size:38px;line-height:1.1;width:280px;color:${hl ? C.paper : '#c4ccd8'}">${esc(D.name)}</div>` + MO.map((m, i) => `<div style="position:absolute;left:${XS(i) - 20}px;top:0;width:240px"><div class="mono" style="font-size:22px;color:${C.slate};white-space:nowrap">${esc(short(m))}</div><div class="disp" data-v style="font-size:96px;line-height:1.05;color:${hl ? C.signal : C.paper}">0<span style="font-size:36px;color:${C.slate}">/40</span></div><div style="height:16px;border-radius:8px;background:rgba(243,246,250,.1);margin-top:4px;width:200px"><div data-b style="height:100%;width:0;border-radius:8px;background:${hl ? C.signal : '#6b7686'}"></div></div></div>`).join(''), O);
        row.style.cssText += `;position:absolute;left:60px;top:${280 + r * 250}px;width:1800px;height:230px;opacity:0`; rows.push({ row, D, hl });
      });
      foot = el('div', 'mono', WIN_NOTE('background full pass'), O); foot.style.cssText = `position:absolute;left:60px;top:930px;font-size:18px;line-height:1.5;color:${C.slate};opacity:0;white-space:nowrap`;
      endEl = el('div', 'disp', 'Same six models. The driver moves the number.', O); endEl.style.cssText = `position:absolute;left:0;right:0;top:820px;text-align:center;font-size:58px;color:${C.signal};opacity:0;white-space:nowrap`;
      closing = closingCard(O);
    },
    frame(t, c) {
      const T = t / B; closingSet(closing, T, 32);
      title.set(t, 0.5 * B, B / 2, .4, .3, 8); sub.style.opacity = E.out3(P(T, 4, 5));
      rows.forEach((o, r) => {
        const s0 = 6 + r * 9, ent = E.out3(P(T, s0 - 1, s0 + .4)); o.row.style.opacity = ent; o.row.style.transform = `translateY(${((1 - ent) * 30).toFixed(0)}px)`;
        const vals = o.row.querySelectorAll('[data-v]'), bars = o.row.querySelectorAll('[data-b]');
        MO.forEach((m, i) => { const [p, n] = o.D.bg[m], q = E.out3(P(T, s0 + i * .6, s0 + i * .6 + 1.6)); vals[i].firstChild.nodeValue = Math.round(p * q); bars[i].style.width = (p / n * 100 * q).toFixed(1) + '%'; });
      });
      foot.style.opacity = E.out3(P(T, 3, 4)); const e = E.out3(P(T, 24, 25)); endEl.style.opacity = e; endEl.style.transform = `translateY(${((1 - e) * 18).toFixed(0)}px)`;
    },
  });
})();
