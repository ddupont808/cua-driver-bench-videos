/* D2 Both ways: Opus 5.5 on Windows, foreground and background, cua-driver vs agent-desktop, from numbers.json windows. 16 s. */
(function () {
  const BPM = 120, B = 60 / BPM, NB = 36, DUR = NB * B;
  const W = window.NUMBERS.windows, M = 'Claude Opus 5.5', CU = W.drivers['cua-driver'], AD = W.drivers['agent-desktop'];
  let title, panels = [], line1, line2, foot, closing;
  defineVideo({
    W: 1920, H: 1080, fps: 60, dur: DUR, bpm: BPM, bg: C.graphite,
    init(c) {
      const O = c.overlay;
      title = Words(O, 'Both ways. Opus 5.5 on Windows.', 'position:absolute;left:0;right:0;top:44px;text-align:center;font-size:92px;white-space:nowrap');
      [['Foreground', 'fg', 50, 90], ['Background', 'bg', 40, 1010]].forEach(([lab, k, n, x]) => {
        const rowsH = [[AD, '#6b7686'], [CU, C.signal]].map(([D, col], i) => `<div style="position:absolute;left:0;top:${80 + i * 170}px;width:800px"><div class="disp" style="font-size:38px;white-space:nowrap">${esc(D.name)}</div><div style="display:flex;align-items:center;gap:20px;margin-top:6px"><div style="width:470px;height:56px;border-radius:12px;background:rgba(243,246,250,.08)"><div data-b="${i}" style="height:100%;width:0;border-radius:12px;background:${col}"></div></div><div class="disp" data-v="${i}" style="font-size:76px;white-space:nowrap;color:${col === C.signal ? C.signal : C.paper}">0<span style="font-size:32px;color:${C.slate}">/${n}</span></div></div></div>`).join('');
        const p = el('div', '', `<div class="disp" style="font-size:56px;color:${C.slate}">${lab}</div>` + rowsH, O); p.style.cssText += `;position:absolute;left:${x}px;top:250px;width:820px;height:440px;opacity:0`; panels.push({ p, k, n });
      });
      line1 = Words(O, 'Foreground: agent-desktop is ahead.', 'position:absolute;left:0;right:0;top:790px;text-align:center;font-size:56px;white-space:nowrap');
      line2 = Words(O, 'Background: the driver decides.', 'position:absolute;left:0;right:0;top:790px;text-align:center;font-size:56px;white-space:nowrap;color:#61bcff');
      foot = el('div', 'mono', WIN_NOTE('Claude Opus 5.5, foreground (of 50) and background (of 40) full pass'), O); foot.style.cssText = `position:absolute;left:60px;top:930px;font-size:18px;line-height:1.5;color:${C.slate};opacity:0;white-space:nowrap`;
      closing = closingCard(O);
    },
    frame(t, c) {
      const T = t / B; closingSet(closing, T, 32);
      title.set(t, 0.5 * B, B / 2, .4, .3, 8);
      panels.forEach((o, i) => {
        const s0 = 5 + i * 9, ent = E.out3(P(T, s0 - 1, s0)); o.p.style.opacity = ent;
        [0, 1].forEach(r => { const D = r ? CU : AD, v = D[o.k][M][0], q = E.out3(P(T, s0 + r * 1.4, s0 + r * 1.4 + 2)); o.p.querySelector(`[data-b="${r}"]`).style.width = (v / o.n * 100 * q).toFixed(1) + '%'; o.p.querySelector(`[data-v="${r}"]`).firstChild.nodeValue = Math.round(v * q); });
      });
      line1.show(T > 8 && T < 17.2); line1.set(t, 9 * B, B / 2, .4, .3, 8); line1.d.style.opacity = 1 - E.io2(P(T, 16, 17));
      line2.show(T > 16.8); line2.set(t, 18 * B, B / 2, .4, .3, 8);
      foot.style.opacity = E.out3(P(T, 3, 4));
    },
  });
})();
