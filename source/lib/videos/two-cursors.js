/* Two agents, one cursor: two flat koala bots fight over one cursor while a third, using Cua Driver, works quietly in a corner.
   20 s, 120 bpm, 40 beats. Every frame is a pure function of t. */
(function () {
  const BPM = 120, B = 60 / BPM, NB = 40, DUR = NB * B;
  const W = 1920, H = 1080; const INTRO = new URLSearchParams(location.search).get('variant') === 'intro';
  const CORNER = [700, 310], FX = -300;  // the quiet window (world px from centre)
  const S1 = 0.95;
  let world, svg, bL, bR, bC, cur, win, ptr, chip, caps = [], endEl, sparks = [], fx;
  const eyes = (T, side) => {
    if (T < 5.5) return T < 4 ? '*' : '>';
    if (T < 10) return '>';
    if (T < 12) return 'x';
    if (T < 22) return '+';
    return T < 25 ? '>' : '>';
  };
  const CAPS = [['Two agents. One cursor.', 0.5, 4.2], ['Same cursor. Same fight.', 5.5, 9.6], ['A third agent uses Cua Driver.', 14, 19.3], ['Meanwhile, in the background.', 19.5, 24.6]];
  const star = (r) => { let d = ''; for (let i = 0; i < 8; i++) { const a = Math.PI * i / 4, rr = i % 2 ? r * 0.28 : r; d += (i ? 'L' : 'M') + (Math.cos(a) * rr).toFixed(1) + ',' + (Math.sin(a) * rr).toFixed(1); } return d + 'Z'; };
  defineVideo({
    W, H, fps: 60, dur: DUR, bpm: BPM, bg: C.graphite,
    init(c) {
      const L = c.layer, O = c.overlay;
      world = el('div', '', null, L); world.style.cssText = `position:absolute;left:0;top:0;width:${W}px;height:${H}px;transform-origin:50% 50%`;
      svg = el('div', '', `<svg width="${W}" height="${H}" viewBox="${-W / 2} ${-H / 2} ${W} ${H}" style="position:absolute;left:0;top:0;overflow:visible"><g data-l></g><g data-s></g></svg>`, world);
      fx = svg.querySelector('[data-l]'); sparks = svg.querySelector('[data-s]');
      bL = new KBot(world, '#8b5cf6', '#5b2fc9'); bR = new KBot(world, '#ff7a2f', '#c24e10');
      cur = el('div', 'c3', USER_CURSOR(170), world);
      // the quiet corner
      win = new AppWin(world, { w: 560, h: 360, title: 'Mail' }); win.setActive(false);
      win.body.innerHTML = [0, 1, 2, 3].map(i => `<div style="position:absolute;left:36px;top:${34 + i * 56}px;width:${440 - i * 70}px;height:16px;border-radius:8px;background:#8e98a3"></div><div data-f${i} style="position:absolute;left:36px;top:${34 + i * 56}px;width:${440 - i * 70}px;height:16px;border-radius:8px;background:#61bcff;transform-origin:left;transform:scaleX(0)"></div>`).join('');
      chip = el('div', 'chip', `<span style="color:${C.green};font-size:30px;line-height:1">&#10003;</span>Done`, win.win); chip.style.cssText += ';position:absolute;right:16px;top:56px;opacity:0;font-size:24px';
      ptr = el('div', 'c3', AGENT_CURSOR(70), world);
      bC = new KBot(world, '#61bcff', '#2a7fc4');
      CAPS.forEach(([t, a]) => { const w = Words(O, t, `position:absolute;left:0;right:0;top:92px;text-align:center;font-size:104px;white-space:nowrap`); caps.push(w); });
      endEl = el('div', '', `<div style="display:flex;align-items:center;gap:36px;justify-content:center">${markSVG(C.paper, 150)}<div class="disp" style="font-size:150px">Cua Driver</div></div><div class="disp" style="font-size:62px;text-align:center;margin-top:30px;color:${C.signal}">Computer use in the background.</div><div class="mono" style="font-size:30px;text-align:center;margin-top:34px;color:${C.slate}">cua.ai &middot; github.com/trycua/cua</div>`, O);
      endEl.style.cssText += ';position:absolute;left:0;right:0;top:330px;opacity:0';
    },
    frame(t, c) {
      const T = t / B;
      // camera: fight (0..13), corner (14..22), all (23..)
      const toCorner = E.io3(P(T, 13, 14.6)), back = E.io3(P(T, 22, 23.6));
      const cs = 1 + 0.55 * toCorner * (1 - back);
      const cx = -CORNER[0] * cs * toCorner * (1 - back) * 0.82, cy = -CORNER[1] * cs * toCorner * (1 - back) * 0.82;
      const shake = (T > 10 && T < 10.6) ? Math.sin(T * 120) * 16 * (1 - P(T, 10, 10.6)) : 0;
      world.style.transform = `translate(${(cx + shake).toFixed(1)}px,${(cy + shake * 0.5).toFixed(1)}px) scale(${cs.toFixed(4)})`;
      // ---- the fight
      const enter = E.out5(P(T, 0.2, 1.6)), lunge = E.io3(P(T, 4, 5.4));
      const tug = T > 5.4 && T < 10 ? P(T, 5.4, 7) : (T >= 10 ? 0 : 0);
      const osc = T > 5.4 && T < 10 ? Math.sin((T - 5.4) * Math.PI * 1.0) : 0; // one swing per beat
      const amp = 70 * tug;
      let xL = lerp(-760, -430, enter), xR = lerp(760, 430, enter);
      xL = lerp(xL, -190, lunge); xR = lerp(xR, 190, lunge);
      let cxp = 0, cyp = -40, crot = 0, ca = 1;
      if (T < 2) { cyp = lerp(-700, -40, E.out3(P(T, 1, 2))) ; ca = P(T, 0.9, 1.3); }
      if (T > 5.4 && T < 10) { cxp = osc * 120 * tug; xL += osc * amp * 0.8 - 20 * tug; xR += osc * amp * 0.8 + 20 * tug; crot = osc * 26; cyp = -40 + Math.sin(T * 9) * 10 * tug; }
      // collision at T=10: the bots rush together, slam, and the cursor is launched; then they sit dazed
      if (T >= 9.4) {
        const base = (Tq) => { const o = Math.sin((Tq - 5.4) * Math.PI) , tg = P(Tq, 5.4, 7); return [-190 + o * 70 * tg * .8 - 20 * tg, 190 + o * 70 * tg * .8 + 20 * tg]; };
        const [l0, r0] = base(9.4); const rush = E.in3(P(T, 9.4, 10.05));
        xL = lerp(l0, -70, rush); xR = lerp(r0, 70, rush);
        if (T >= 10.05) { const k = E.out3(P(T, 10.05, 12.4)); xL = lerp(-70, -300, k); xR = lerp(70, 300, k); }
        const flight = P(T, 10.05, 12.2);
        if (T < 10.05) { cxp = lerp(cxp, 0, 1); }
        else { cxp = lerp(0, 380, flight); cyp = lerp(-40, -760, E.in3(flight)) + 140 * Math.sin(flight * Math.PI); crot = 700 * flight; ca = 1 - P(T, 11.6, 12.2); }
      }
      const dazeY = T >= 12.4 ? Math.sin(T * 3) * 6 : 0;
      const idleFight = T > 24 ? Math.sin(T * 8) * 8 : 0;
      bL.draw(eyes(T), T > 3 ? 1 : 0); bR.draw(eyes(T), T > 3 ? 1 : 0);
      const tiltL = T > 5.4 && T < 10 ? -osc * 10 : (T > 12.4 ? -8 : 0), tiltR = T > 5.4 && T < 10 ? -osc * 10 : (T > 12.4 ? 8 : 0);
      put(bL.root, { x: xL + FX + idleFight, y: 120 + dazeY + (T > 12.4 ? 90 : 0), s: S1, rz: tiltL, a: 1 });
      put(bR.root, { x: xR + FX - idleFight, y: 120 + dazeY + (T > 12.4 ? 90 : 0), s: S1, rz: tiltR, a: 1 });
      put(cur, { x: cxp + FX + 34, y: cyp + 42, s: 1, rz: crot, a: ca * (T >= 0.9 ? 1 : 0) });
      // leashes from each bot to the cursor while they tug
      const lash = (T > 4.8 && T < 10) ? 1 : 0;
      fx.innerHTML = lash ? `<line x1="${xL + FX + 80}" y1="${120 - 20}" x2="${cxp + FX + 20}" y2="${cyp + 30}" stroke="#8b5cf6" stroke-width="14" stroke-linecap="round" opacity=".9"/><line x1="${xR + FX - 80}" y1="${120 - 20}" x2="${cxp + FX + 40}" y2="${cyp + 30}" stroke="#ff7a2f" stroke-width="14" stroke-linecap="round" opacity=".9"/>` : '';
      // sparks on collisions
      let sp = '';
      const hits = [[7, -20, 40], [8.5, 30, 20], [10, 0, 60]];
      hits.forEach(([ht, hx, hy]) => { const q = P(T, ht, ht + 0.7); if (q > 0 && q < 1) for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + ht, d = 60 + 170 * E.out3(q); sp += `<path d="${star(34 * (1 - q) + 6)}" transform="translate(${(hx + FX + Math.cos(a) * d).toFixed(1)} ${(hy + Math.sin(a) * d).toFixed(1)}) rotate(${(a * 40).toFixed(0)})" fill="${i % 2 ? '#f3f6fa' : '#ffcb3d'}" opacity="${(1 - q).toFixed(2)}"/>`; } });
      sparks.innerHTML = sp;
      // ---- the quiet corner
      const win_in = E.out5(P(T, 2.6, 4.2));
      put(win.root, { x: CORNER[0], y: CORNER[1] + 10, s: 0.85, a: INTRO ? 0 : win_in });
      const f0 = 14; win.body.querySelectorAll('[data-f0],[data-f1],[data-f2],[data-f3]').forEach((e, i) => e.style.transform = `scaleX(${clamp((T - (f0 + 0.6 + i * 1.1)) / 0.9)})`);
      chip.style.opacity = E.out3(P(T, 19, 19.8));
      const kfp = [[14, CORNER[0] + 400, CORNER[1] - 190], [14.6, CORNER[0] - 120, CORNER[1] - 120], [16, CORNER[0] - 140, CORNER[1] - 40], [17.2, CORNER[0] - 40, CORNER[1] + 20], [18.4, CORNER[0] + 40, CORNER[1] + 90], [19.4, CORNER[0] + 150, CORNER[1] - 90]];
      const ap = pathAt(T, kfp);
      put(ptr, { x: ap[0] + 22, y: ap[1] + 28, s: 1, a: INTRO ? 0 : win_in * P(T, 13.6, 14.2) });
      const calm = T > 14 ? (Math.floor(T * 2) % 7 === 6 ? '-' : '*') : '*';
      bC.draw(T > 19.4 ? '^' : calm, 1);
      put(bC.root, { x: CORNER[0] - 350, y: CORNER[1] + 170 + Math.sin(T * 1.5) * 5, s: 0.55, a: INTRO ? 0 : win_in });
      // ---- captions
      caps.forEach((w, i) => { const [txt, a, b] = CAPS[i]; const vis = (!INTRO || i === 0) && T >= a - .1 && T < b + .5; w.show(vis); if (!vis) return; w.set(t, a * B, B / 2, .4, .3, 8); w.d.style.opacity = 1 - E.io2(P(T, b, b + .4)); });
      // ---- end
      const eP = INTRO ? 0 : E.out3(P(T, 32.5, 33.6)); endEl.style.opacity = eP; endEl.style.transform = `translateY(${((1 - eP) * 26).toFixed(1)}px)`;
      world.style.opacity = INTRO ? 1 : 1 - E.io2(P(T, 31.5, 32.5));
    },
  });
})();
