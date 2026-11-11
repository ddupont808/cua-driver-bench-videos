/* D3 Swap one thing: Opus 5.5 vs Haiku 5.5, cua-driver vs agent-desktop, Windows. Foreground (of 50) and background (of 40).
   The honest result: in the foreground the model and the driver both move the number; in the background the driver decides. From numbers.json windows. 16 s. */
(function () {
  const BPM = 120, B = 60 / BPM, NB = 36, DUR = NB * B;
  const W = window.NUMBERS.windows, CU = W.drivers['cua-driver'], AD = W.drivers['agent-desktop'];
  const MS = ['Claude Opus 5.5', 'Claude Haiku 5.5'];
  let title, grids = [], deltas = [], cap, foot, closing;
  const v = (D, k, m) => D[k][m][0];
  defineVideo({
    W: 1920, H: 1080, fps: 60, dur: DUR, bpm: BPM, bg: C.graphite,
    init(c) {
      const O = c.overlay;
      title = Words(O, 'Swap one thing. Windows.', 'position:absolute;left:0;right:0;top:44px;text-align:center;font-size:92px;white-space:nowrap');
      [['Foreground, of 50', 'fg', 60], ['Background, of 40', 'bg', 1000]].forEach(([lab, k, x]) => {
        const cells = [[AD, 0], [CU, 1]].map(([D, r]) => MS.map((m, c2) => `<div style="position:absolute;left:${300 + c2 * 270}px;top:${r * 150}px;width:250px;height:130px;border-radius:16px;background:${r ? '#12304d' : '#161d28'};border:2px solid ${r ? C.signal : 'rgba(243,246,250,.1)'}"><div class="disp" data-c style="font-size:84px;text-align:center;margin-top:18px;color:${r ? C.signal : C.paper}">0</div></div>`).join('') + `<div class="disp" style="position:absolute;left:0;top:${r * 150 + 30}px;font-size:30px;line-height:1.1;width:290px">${esc(D.name)}</div>`).join('');
        const g = el('div', '', `<div class="disp" style="font-size:52px;color:${C.slate}">${lab}</div><div class="mono" style="position:absolute;left:300px;top:76px;width:250px;text-align:center;font-size:24px;color:${C.slate}">Opus 5.5</div><div class="mono" style="position:absolute;left:570px;top:76px;width:250px;text-align:center;font-size:24px;color:${C.slate}">Haiku 5.5</div><div style="position:absolute;left:0;top:116px;width:860px;height:320px">${cells}</div>`, O);
        g.style.cssText += `;position:absolute;left:${x}px;top:220px;width:860px;height:460px;opacity:0`; grids.push({ g, k });
        const dl = el('div', 'mono', '', O); dl.style.cssText = `position:absolute;left:${x}px;top:690px;width:860px;font-size:22px;line-height:1.6;color:${C.paper};opacity:0`; deltas.push({ dl, k });
      });
      const sgn = x => (x > 0 ? '+' : x < 0 ? '&minus;' : '') + Math.abs(x);
      deltas.forEach(o => { const k = o.k; o.dl.innerHTML = `Swap the model (Opus &rarr; Haiku): ${esc(CU.name)} ${sgn(v(CU, k, MS[1]) - v(CU, k, MS[0]))}, agent-desktop ${sgn(v(AD, k, MS[1]) - v(AD, k, MS[0]))}<br>Swap the driver (${esc(CU.name)} &rarr; agent-desktop): Opus ${sgn(v(AD, k, MS[0]) - v(CU, k, MS[0]))}, Haiku ${sgn(v(AD, k, MS[1]) - v(CU, k, MS[1]))}`; });
      cap = Words(O, 'Foreground: both matter. Background: the driver does.', 'position:absolute;left:0;right:0;top:830px;text-align:center;font-size:54px;white-space:nowrap');
      foot = el('div', 'mono', WIN_NOTE('foreground (of 50) and background (of 40) full pass'), O); foot.style.cssText = `position:absolute;left:60px;top:950px;font-size:17px;line-height:1.5;color:${C.slate};opacity:0;white-space:nowrap`;
      closing = closingCard(O);
    },
    frame(t, c) {
      const T = t / B; closingSet(closing, T, 32);
      title.set(t, 0.5 * B, B / 2, .4, .3, 8);
      grids.forEach((o, i) => {
        const s0 = 4 + i * 8, ent = E.out3(P(T, s0, s0 + 1)); o.g.style.opacity = ent;
        const cs = o.g.querySelectorAll('[data-c]'); [[AD, 0], [CU, 1]].forEach(([D, r]) => MS.forEach((m, c2) => { cs[r * 2 + c2].textContent = Math.round(v(D, o.k, m) * E.out3(P(T, s0 + 1 + (r * 2 + c2) * .4, s0 + 2.6 + (r * 2 + c2) * .4))); }));
        deltas[i].dl.style.opacity = E.out3(P(T, s0 + 4, s0 + 5));
      });
      cap.show(T > 20.5); cap.set(t, 21 * B, B / 3, .35, .3, 8); foot.style.opacity = E.out3(P(T, 3, 4));
    },
  });
})();
