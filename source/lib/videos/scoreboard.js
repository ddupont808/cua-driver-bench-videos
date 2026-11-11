/* B1 Scoreboard: broadcast-style leaderboard, live ranks from numbers.json, a rolling ticker. 16 s, 120 bpm. */
(function () {
  const BPM = 120, B = 60 / BPM, NB = 32, DUR = NB * B;
  const N = window.NUMBERS, D = N.drivers, NT = N.n_tasks;
  const steps = D.map(d => d.per_task && d.per_task.length === NT ? d.per_task.slice() : Array.from({ length: NT }, () => d.passed / NT));
  const LEG0 = 3, LEGD = 2.4, LEGMOVE = 1.6, LAST = LEG0 + (NT - 1) * LEGD + LEGMOVE;
  const ROW0 = 300, RH = 128, TR = [760, 1700];
  let rows = [], bar, tick, lead, endEl, qlab;
  const sig = x => 1 / (1 + Math.exp(-x));
  defineVideo({
    W: 1920, H: 1080, fps: 60, dur: DUR, bpm: BPM, bg: '#07090d',
    init(c) {
      const O = c.overlay;
      bar = el('div', '', `<div style="position:absolute;left:0;top:0;width:1920px;height:120px;background:linear-gradient(90deg,#0f1a2a,#16283f)"></div><div style="position:absolute;left:0;top:0;width:18px;height:120px;background:${C.signal}"></div><div class="disp" style="position:absolute;left:60px;top:18px;font-size:60px;white-space:nowrap">Cua Driver Bench</div><div class="mono" style="position:absolute;left:62px;top:86px;font-size:22px;color:${C.slate}">macOS &middot; background full pass &middot; 8 tasks &times; 5 trials &middot; ${N.model} &middot; AgentEnv runs</div><div data-q class="disp" style="position:absolute;right:60px;top:30px;font-size:46px;color:${C.signal}"></div>`, O); bar.style.cssText += ';position:absolute;left:0;top:0;width:1920px;height:120px';
      qlab = bar.querySelector('[data-q]');
      D.forEach((d, i) => {
        const r = el('div', '', `<div style="position:absolute;left:0;top:0;width:1860px;height:108px;border-radius:14px;background:${d.highlight ? '#12304d' : '#0f141c'};border:2px solid ${d.highlight ? C.signal : 'rgba(243,246,250,.08)'}"></div><div class="disp" data-rank style="position:absolute;left:30px;top:14px;font-size:76px;width:80px;color:${d.highlight ? C.signal : C.slate}">1</div><div class="disp" style="position:absolute;left:130px;top:12px;font-size:48px;white-space:nowrap">${esc(d.name)}</div><div class="mono" style="position:absolute;left:132px;top:70px;font-size:21px;color:${C.slate}">${esc(d.source)}</div><div style="position:absolute;left:${TR[0] - 60}px;top:28px;width:${TR[1] - TR[0]}px;height:52px;border-radius:10px;background:rgba(243,246,250,.07)"><div data-b style="height:100%;width:0;border-radius:10px;background:${d.highlight ? C.signal : '#6b7686'}"></div></div><div class="disp" data-v style="position:absolute;right:30px;top:12px;font-size:70px;text-align:right;width:230px;color:${d.highlight ? C.signal : C.paper}">0%</div>`, O);
        r.style.cssText += `;position:absolute;left:30px;top:0;width:1860px;height:108px`; rows.push(r);
      });
      lead = el('div', 'disp', '', O); lead.style.cssText = `position:absolute;left:60px;top:${ROW0 + D.length * RH + 6}px;font-size:40px;color:${C.green};white-space:nowrap`;
      tick = el('div', '', '', O); tick.style.cssText = 'position:absolute;left:0;top:1000px;width:1920px;height:80px;background:#0f1a2a;overflow:hidden';
      const tx = `FULL PASS = TASK DONE &middot; GUI-ONLY &middot; USER UNDISTURBED &middot; ${esc(N.source_line).toUpperCase()} &middot; ${N.model.toUpperCase()} &middot; ${D[0].n} TRIALS PER DRIVER &middot; NOT LIKE-FOR-LIKE WITH CUA'S OWN RUNNER &middot; FOUR OF THE FIVE MACOS DRIVERS ON THE BOARD ARE SHOWN &middot; CODEX COMPUTER USE IS FOREGROUND-ONLY ON WINDOWS, SO NO WINDOWS COMPARISON &middot; WE BUILD CUA DRIVER &middot; `;
      tick.innerHTML = `<div data-t class="mono" style="position:absolute;top:22px;white-space:nowrap;font-size:30px;color:${C.paper}">${tx}${tx}</div>`;
      endEl = el('div', '', `<div style="display:flex;align-items:center;gap:34px;justify-content:center">${markSVG(C.paper, 130)}<div class="disp" style="font-size:140px">Cua Driver Bench</div></div><div class="disp" style="font-size:54px;text-align:center;margin-top:30px;color:${C.signal}">Can an agent use your apps without disturbing you?</div><div class="mono" style="font-size:28px;text-align:center;margin-top:28px;color:${C.paper}">cua.ai &middot; github.com/trycua/cua</div>`, O); endEl.style.cssText += ';position:absolute;left:0;right:0;top:330px;opacity:0'; endEl._p = partnerRow(c.overlay);
    },
    frame(t, c) {
      const T = t / B, endP = E.io3(P(T, 26, 27)), dim = 1 - endP;
      bar.style.opacity = E.out3(P(T, 0, 1)) * dim; bar.style.transform = `translateY(${((1 - E.out3(P(T, 0, 1))) * -120).toFixed(0)}px)`;
      const leg = clamp(Math.floor((T - LEG0) / LEGD) + 1, 0, NT); qlab.textContent = T < LEG0 ? 'TIP-OFF' : (T >= LAST ? 'FINAL' : `TASK ${leg} OF ${NT}`);
      const vs = D.map((d, i) => { let v = 0; for (let k = 0; k < NT; k++) { const s = LEG0 + k * LEGD; v += steps[i][k] * E.io3(P(T, s, s + LEGMOVE)); } return T >= LAST ? d.passed : v; });
      D.forEach((d, i) => {
        let rank = 0; vs.forEach((vj, j) => { if (j !== i) rank += T >= LAST ? (vj > vs[i] || (vj === vs[i] && j < i) ? 1 : 0) : sig((vj - vs[i]) / 0.35 + (j < i ? 0.05 : -0.05)); });
        const enter = E.out5(P(T, 0.8 + i * 0.3, 2 + i * 0.3)), r = rows[i];
        r.style.top = (ROW0 + rank * RH) + 'px'; r.style.opacity = enter * dim; r.style.transform = `translateX(${((1 - enter) * 200).toFixed(0)}px)`;
        r.querySelector('[data-rank]').textContent = Math.round(rank) + 1;
        const frac = vs[i] / d.n; r.querySelector('[data-b]').style.width = (frac * 100).toFixed(1) + '%';
        r.querySelector('[data-v]').textContent = (T >= LAST ? pctOf(d) : Math.round(frac * 100)) + '%';
      });
      const nx = D[1], cu = D[0];
      lead.textContent = T >= LAST ? `FINAL: ${cu.name.toUpperCase()} ${cu.passed} OF ${cu.n} &middot; ${nx.name.toUpperCase()} ${nx.passed} OF ${nx.n} (DIRECTIONAL: THE INTERVALS OVERLAP)`.replace(/&middot;/g, '|') : '';
      lead.style.opacity = E.out3(P(T, LAST, LAST + 1)) * dim;
      tick.style.opacity = E.out3(P(T, 1, 2)) * dim; tick.querySelector('[data-t]').style.left = (-(t * 180) % 2400) + 'px';
      const eIn = E.out3(P(T, 26.6, 27.8)); endEl.style.opacity = eIn; endEl._p.style.opacity = endEl.style.opacity; endEl.style.transform = `translateY(${((1 - eIn) * 24).toFixed(1)}px)`;
    },
  });
})();
