/* Composite opener: a short fight over one cursor (the two-cursors scene at 2x speed), then two question cards, then a data film
   (race or scoreboard) played at SPEED x. Usage: ?v=two-cursors+race+ask&variant=intro  (the middle file picks the data film). */
(function () {
  const [fight, data] = window.VDEFS;
  const BPM = 120, B = 60 / BPM, SPEED = 1.5, INTRO_B = 20, X = INTRO_B * B;
  const DUR = X + data.dur / SPEED;
  let A, Dd, q1, q2;
  defineVideo({
    W: 1920, H: 1080, fps: 60, dur: DUR, bpm: BPM, bg: C.graphite,
    init(c) {
      const mk = (parent) => { const d = el('div', '', '', parent); d.style.cssText = 'position:absolute;inset:0'; return d; };
      A = { layer: mk(c.layer), overlay: mk(c.overlay) }; Dd = { layer: mk(c.layer), overlay: mk(c.overlay) };
      fight.init(Object.assign({}, c, A)); data.init(Object.assign({}, c, Dd));
      q1 = Words(c.overlay, 'How often do you fight with your agent for the cursor?', 'position:absolute;left:160px;right:160px;top:330px;text-align:center;font-size:118px;line-height:1.08');
      q2 = Words(c.overlay, 'We made Cua Driver Bench to find out.', 'position:absolute;left:160px;right:160px;top:370px;text-align:center;font-size:124px;line-height:1.08');
    },
    frame(t, c) {
      const T = t / B;
      const inFight = T < 8.4, inData = t >= X;
      A.layer.style.display = A.overlay.style.display = inFight ? '' : 'none';
      Dd.layer.style.display = Dd.overlay.style.display = inData ? '' : 'none';
      if (inFight) { fight.frame(Math.min(t * 2, 12 * B), Object.assign({}, c, A)); A.layer.style.opacity = A.overlay.style.opacity = 1 - E.io2(P(T, 7, 8.2)); }
      if (inData) data.frame((t - X) * SPEED, Object.assign({}, c, Dd));
      q1.show(T >= 8 && T < 14.6); q1.set(t, 8.5 * B, B / 2, .35, .3, 8); q1.d.style.opacity = 1 - E.io2(P(T, 14, 14.5));
      q2.show(T >= 14.6 && T < 19.9); q2.set(t, 15 * B, B / 2, .35, .3, 8); q2.d.style.opacity = 1 - E.io2(P(T, 19.2, 19.9));
    },
  });
})();
