/* Hands off: someone types a paragraph while Cua Driver finishes tasks in other apps behind it.
   ?v=hands-off (16 s) or ?v=hands-off&variant=bumper (6 s). 120 bpm. Every frame is a pure function of t. */
(function () {
  const VAR = new URLSearchParams(location.search).get('variant') || ''; const BUMPER = VAR === 'bumper';
  const BPM = 120, B = 60 / BPM, NB = BUMPER ? 12 : 32, DUR = NB * B;
  // ---- timeline in beats
  const TL = BUMPER
    ? { hook: [0.5, 0], docIn: 0.3, typeA: 1, typeB: 8, winIn: [1, 1.4, 1.8], tasks: [2, 3.7, 5.4], tdur: 1.7, badge: 7.3, endA: 9.6, capA: 99, nchars: 110 }
    : { hook: [0.5, 2.6], docIn: 3, typeA: 4, typeB: 18, winIn: [5, 5.5, 6], tasks: [7, 11.5, 16], tdur: 4, badge: 21.5, endA: 27.5, capA: 11.5, nchars: 999 };
  const PARA = "Hi team, the launch plan is in good shape. Pricing review moves to Thursday and the demo to Friday. Send me your edits before lunch and I'll fold them in tonight.";
  const TEXT = BUMPER ? PARA.slice(0, TL.nchars) : PARA;
  const WIN = { w: 620, h: 310 };
  const wc = [[560, -334], [560, 0], [560, 334]]; // window centres (stage px from centre)
  const loc = (i, lx, ly) => [wc[i][0] - WIN.w / 2 + lx, wc[i][1] - WIN.h / 2 + 44 + ly];
  const DOC = { w: 1000, h: 600, cx: -190, cy: 40 };
  let badgeUpd = null, mail, cal, sheet, doc, docText, caps, badge, endEl, hook, userCur, agentCur, chips = [], parts = {}, cap2;
  const grid = (n, w, h, col = 'rgba(15,26,42,.12)') => Array.from({ length: n }, (_, i) => `<div style="position:absolute;left:0;top:${i * h}px;width:${w}px;height:1.5px;background:${col}"></div>`).join('');
  defineVideo({
    W: 1920, H: 1080, fps: 60, dur: DUR, bpm: BPM, bg: C.graphite,
    init(c) {
      const L = c.layer;
      if (VAR === 'a1' || VAR === 'a2' || VAR === 'a3') { L.style.transformOrigin = '50% 0%'; L.style.transform = 'scale(0.78)'; }
      // ---- background apps (windows behind)
      mail = new AppWin(L, { w: WIN.w, h: WIN.h, title: 'Mail' }); cal = new AppWin(L, { w: WIN.w, h: WIN.h, title: 'Calendar' }); sheet = new AppWin(L, { w: WIN.w, h: WIN.h, title: 'Budget' });
      [mail, cal, sheet].forEach(w => w.setActive(false));
      // mail body
      mail.body.innerHTML = `<div style="position:absolute;left:0;top:0;width:176px;height:100%;background:#e9eef5"></div>` +
        [0, 1, 2, 3, 4].map(i => `<div style="position:absolute;left:16px;top:${18 + i * 46}px;width:${i === 1 ? 148 : 120 + (i * 13) % 30}px;height:14px;border-radius:7px;background:${i === 1 ? '#61bcff' : '#c8d1de'}"></div><div style="position:absolute;left:16px;top:${38 + i * 46}px;width:${90 + (i * 17) % 40}px;height:10px;border-radius:5px;background:#d8dfe9"></div>`).join('') +
        `<div style="position:absolute;left:200px;top:18px;width:230px;height:18px;border-radius:9px;background:#0f1a2a"></div><div style="position:absolute;left:200px;top:46px;width:360px;height:12px;border-radius:6px;background:#c8d1de"></div>` +
        `<div style="position:absolute;left:200px;top:96px;width:380px;height:106px;border-radius:14px;background:#fff;border:1.5px solid #c8d1de"></div>` +
        [380 - 50, 330 - 50, 200 - 40].map((w, i) => `<div data-ml${i} style="position:absolute;left:216px;top:${112 + i * 28}px;width:${w}px;height:12px;border-radius:6px;background:#8e98a3;transform-origin:left;transform:scaleX(0)"></div>`).join('') +
        `<div data-send style="position:absolute;left:480px;top:212px;width:100px;height:36px;border-radius:18px;background:#c8d1de;color:#fff;font:600 18px Urbanist;display:flex;align-items:center;justify-content:center">Send</div>`;
      // calendar body
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      cal.body.innerHTML = days.map((d, i) => `<div style="position:absolute;left:${58 + i * 100}px;top:8px;width:100px;text-align:center;font:600 18px Urbanist;color:#4a5668">${d}</div>`).join('') + grid(5, 566, 56).replace(/top:(\d+)px/g, (m, y) => `top:${+y + 36}px`) +
        [0, 1, 2, 3, 4, 5].map(i => `<div style="position:absolute;left:${58 + i * 100 - 1}px;top:36px;width:1.5px;height:230px;background:rgba(15,26,42,.1)"></div>`).join('') +
        `<div data-ev style="position:absolute;left:${58 + 200 + 4}px;top:${36 + 56 + 4}px;width:92px;height:48px;border-radius:10px;background:#61bcff;box-shadow:0 6px 14px rgba(97,188,255,.45)"></div>` +
        `<div data-pop style="position:absolute;left:${58 + 200 + 6}px;top:${36 + 8}px;width:210px;height:70px;border-radius:14px;background:#fff;border:1.5px solid #c8d1de;box-shadow:0 14px 30px rgba(15,26,42,.2);opacity:0"><div data-popa style="position:absolute;left:14px;top:14px;width:84px;height:42px;border-radius:10px;background:#e6ebf2;font:600 20px Urbanist;display:flex;align-items:center;justify-content:center;color:#4a5668">Wed</div><div data-popb style="position:absolute;left:110px;top:14px;width:84px;height:42px;border-radius:10px;background:#e6ebf2;font:600 20px Urbanist;display:flex;align-items:center;justify-content:center;color:#4a5668">Thu</div></div>`;
      // sheet body
      const rows = 7, vals = [[1200, 340, 880], [640, 410, 520], [90, 75, 110], [2310, 190, 400], [310, 860, 140]];
      sheet.body.innerHTML = grid(rows + 1, 566, 33, 'rgba(15,26,42,.1)') + [0, 1, 2, 3].map(i => `<div style="position:absolute;left:${i === 0 ? 0 : 130 + (i - 1) * 145}px;top:0;width:1.5px;height:266px;background:rgba(15,26,42,.1)"></div>`).join('') +
        `<div style="position:absolute;left:0;top:0;width:566px;height:33px;background:#e6ebf2"></div>` + ['', 'Q1', 'Q2', 'Q3'].map((t, i) => `<div style="position:absolute;left:${i === 0 ? 0 : 130 + (i - 1) * 145}px;top:3px;width:${i === 0 ? 130 : 145}px;text-align:center;font:600 18px Urbanist;color:#4a5668">${t}</div>`).join('') +
        ['Rent', 'Tools', 'Travel', 'Ads', 'Misc'].map((t, r) => `<div style="position:absolute;left:14px;top:${36 + r * 33}px;font:600 17px Urbanist;color:#4a5668">${t}</div>` + vals[r].map((v, i) => `<div data-cell="${r * 3 + i}" style="position:absolute;left:${130 + i * 145}px;top:${36 + r * 33}px;width:145px;text-align:right;padding-right:18px;box-sizing:border-box;font:500 17px 'JetBrains Mono';color:#0f1a2a;opacity:0">${v}</div>`).join('')).join('') +
        `<div style="position:absolute;left:0;top:${36 + 5 * 33}px;width:566px;height:33px;background:#e6ebf2"></div><div style="position:absolute;left:14px;top:${39 + 5 * 33}px;font:600 17px Urbanist;color:#0f1a2a">Total</div>` + [0, 1, 2].map(i => `<div data-tot="${i}" style="position:absolute;left:${130 + i * 145}px;top:${39 + 5 * 33}px;width:145px;text-align:right;padding-right:18px;box-sizing:border-box;font:500 17px 'JetBrains Mono';color:#0f1a2a;opacity:0">${vals.reduce((s, r) => s + r[i], 0)}</div>`).join('');
      // done chips on each window
      [mail, cal, sheet].forEach((w, i) => { const t = ['Reply sent', 'Moved to Thursday', 'Totals updated'][i]; const ch = el('div', 'chip', `<span style="color:${C.green};font-size:30px;line-height:1">&#10003;</span>${t}`, w.win); ch.style.cssText += ';position:absolute;right:14px;top:56px;opacity:0;font-size:22px;padding:6px 16px'; chips.push(ch); });
      // ---- the user's window in front
      doc = new AppWin(L, { w: DOC.w, h: DOC.h, title: 'Untitled' });
      doc.win.style.background = '#fbfcfe';
      docText = el('div', '', '', doc.body); docText.style.cssText = 'position:absolute;left:60px;top:44px;width:880px;font:600 38px/1.5 Urbanist;color:#0f1a2a;letter-spacing:-.005em';
      // ---- cursors
      userCur = el('div', 'c3', USER_CURSOR(54), L);
      agentCur = el('div', 'c3', AGENT_CURSOR(50), L); agentCur.firstElementChild.style.position = 'relative';
      // ---- type
      hook = Words(c.overlay, 'You keep typing.', 'position:absolute;left:0;right:0;top:400px;text-align:center;font-size:150px');
      cap2 = Words(c.overlay, 'Cua Driver finishes the rest.', 'position:absolute;left:210px;width:1000px;top:70px;text-align:center;font-size:66px');
      badge = el('div', '', `<div class="disp" style="font-size:128px;line-height:1;display:inline-block;color:${C.signal}">${PCT0()}%</div><div style="display:inline-block;vertical-align:top;margin:6px 0 0 22px"><div class="disp" style="font-size:54px">fully passed on macOS</div><div class="mono" style="font-size:19px;color:${C.slate};margin-top:12px">background tasks &middot; ${NUM().drivers[0].n} trials &middot; ${esc(NUM().model)} &middot; AgentEnv runs</div><div class="mono" style="font-size:17px;color:${C.slate};margin-top:4px">pass = task done, GUI-only, user undisturbed &middot; not like-for-like with Cua&#39;s own runner</div></div>`, c.overlay);
      badge.style.cssText += ';position:absolute;left:290px;top:906px;opacity:0;white-space:nowrap';
      if (VAR === 'a1' || VAR === 'a2' || VAR === 'a3') {
        const N = window.NUMBERS, cu = N.drivers[0], nx = N.drivers[1], ratio = Math.floor(cu.passed / nx.passed * 10) / 10, ratioTxt = Number.isInteger(ratio) ? ratio.toFixed(0) : ratio.toFixed(1);
        badge.style.cssText = 'position:absolute;left:90px;top:858px;width:1740px;height:220px;opacity:0';
        const foot = (txt) => `<div class="mono" style="position:absolute;left:0;top:156px;font-size:16px;line-height:1.4;color:${C.slate};white-space:nowrap">${txt}</div>`;
        if (VAR === 'a1') { badge.innerHTML = `<div style="position:absolute;left:0;top:0;width:1740px;height:150px">${baselineHTML(1740, 1)}</div>` + foot(BASE_SHORT()); badgeUpd = p => baselineSet(badge, p); }
        if (VAR === 'a2') {
          badge.innerHTML = `<div class="disp" style="position:absolute;left:0;top:4px;font-size:92px;white-space:nowrap;color:${C.signal}">more than ${ratioTxt}x</div><div class="disp" style="position:absolute;left:0;top:102px;font-size:44px;white-space:nowrap">${esc(nx.name)}, on macOS</div>` +
            [cu, nx].map((d, i) => `<div style="position:absolute;left:820px;top:${14 + i * 62}px;width:900px;height:52px"><div class="disp" style="position:absolute;left:0;top:6px;font-size:34px;white-space:nowrap">${esc(d.name)}</div><div style="position:absolute;left:380px;top:8px;width:420px;height:36px;border-radius:10px;background:rgba(243,246,250,.1)"><div data-b2="${i}" style="height:100%;width:0;border-radius:10px;background:${i ? '#6b7686' : C.signal}"></div></div><div class="disp" data-v2="${i}" style="position:absolute;left:820px;top:0;font-size:42px;white-space:nowrap">${d.passed}/${d.n}</div></div>`).join('') + foot(BASE_SHORT());
          badgeUpd = p => [cu, nx].forEach((d, i) => { badge.querySelector(`[data-b2="${i}"]`).style.width = (d.passed / d.n * 100 * E.out3(P(p, .05 + i * .15, .7 + i * .15))).toFixed(1) + '%'; });
        }
        if (VAR === 'a3') {
          const grid = (d, i) => `<div style="position:absolute;left:${i * 880}px;top:0;width:840px"><div class="disp" style="font-size:36px;white-space:nowrap">${esc(d.name)} <span class="mono" style="font-size:24px;color:${C.slate}" data-c3="${i}">0 of ${d.n}</span></div><div style="margin-top:10px;display:grid;grid-template-columns:repeat(20,34px);gap:6px">${Array.from({ length: d.n }, (_, k) => `<div data-t="${i}-${k}" style="width:34px;height:34px;border-radius:7px;background:rgba(243,246,250,.1)"></div>`).join('')}</div></div>`;
          badge.innerHTML = [cu, nx].map(grid).join('') + foot('each tile is one background trial that fully passed (green) or did not &middot; ' + BASE_SHORT());
          badgeUpd = p => [cu, nx].forEach((d, i) => { const g = Math.floor(d.passed * E.out3(P(p, .05 + i * .1, .8 + i * .1)) + 1e-6); badge.querySelector(`[data-c3="${i}"]`).textContent = g + ' of ' + d.n; for (let k = 0; k < d.n; k++) { const e = badge.querySelector(`[data-t="${i}-${k}"]`); e.style.background = k < g ? (i ? '#6b7686' : C.green) : 'rgba(243,246,250,.1)'; } });
        }
      }
      endEl = el('div', '', `<div style="display:flex;align-items:center;gap:36px;justify-content:center">${markSVG(C.paper, 130)}<div class="disp" style="font-size:150px">Cua Driver Bench</div></div><div class="disp" style="font-size:54px;text-align:center;margin-top:28px;color:${C.signal}">Can an agent use your apps without disturbing you?</div><div class="mono" style="font-size:28px;text-align:center;margin-top:34px;color:${C.slate}">cua.ai &middot; github.com/trycua/cua</div>`, c.overlay);
      endEl.style.cssText += ';position:absolute;left:0;right:0;top:300px;opacity:0'; endEl._p = partnerRow(c.overlay);
      if (BUMPER) endEl.children[1].style.display = 'none';
    },
    frame(t, c) {
      const T = t / B;
      const hookA = TL.hook[1] ? 1 - E.io2(P(T, TL.hook[1], TL.hook[1] + 1)) : 0;
      hook.show(hookA > 0.01); hook.set(t, TL.hook[0] * B, B / 2, .45, .4, 10); hook.d.style.opacity = hookA;
      const endP = E.io3(P(T, TL.endA, TL.endA + 1));
      const dim = 1 - endP;
      // user's doc
      const dIn = E.out5(P(T, TL.docIn, TL.docIn + 1.5));
      put(doc.root, { x: DOC.cx, y: lerp(DOC.cy + 140, DOC.cy, dIn), s: 1, a: dIn * dim });
      const n = typedN(T, TL.typeA, TL.typeB, TEXT.length);
      const idle = T > TL.typeB;
      const caretOn = !idle || Math.floor(t / 0.5) % 2 === 0;
      docText.innerHTML = typedHTML(TEXT, n).replace('<span style="opacity:0">', (caretOn ? `<span style="display:inline-block;width:4px;height:1.05em;background:${C.ink};vertical-align:-0.16em;margin-left:2px"></span>` : '') + '<span style="opacity:0">');
      // user's pointer: parked, never moves
      put(userCur, { x: 267, y: 236, s: 1, a: dIn * dim });
      // background windows slide in from the right
      [mail, cal, sheet].forEach((w, i) => { const p = E.out5(P(T, TL.winIn[i], TL.winIn[i] + 1.4)); put(w.root, { x: lerp(wc[i][0] + 420, wc[i][0], p), y: wc[i][1], s: 1, a: p * dim }); });
      // ---- the three tasks
      const td = TL.tdur, ts = TL.tasks;
      const prog = i => clamp((T - ts[i]) / td);
      // mail
      let p = prog(0);
      mail.body.querySelectorAll('[data-ml0],[data-ml1],[data-ml2]').forEach((e, i) => e.style.transform = `scaleX(${clamp((p - (0.25 + i * 0.1)) / 0.1)})`);
      mail.body.querySelector('[data-send]').style.background = p > 0.62 ? (p > 0.68 ? '#4fd37e' : '#61bcff') : (p > 0.45 ? '#61bcff' : '#c8d1de');
      chips[0].style.opacity = E.out3(P(p, 0.72, 0.9));
      // calendar
      p = prog(1);
      const ev = cal.body.querySelector('[data-ev]'); const mv = E.io3(P(p, 0.55, 0.75));
      ev.style.transform = `translate(${(100 * mv).toFixed(1)}px,${(-56 * mv).toFixed(1)}px)`;
      const pop = cal.body.querySelector('[data-pop]'); pop.style.opacity = P(p, 0.22, 0.3) * (1 - P(p, 0.58, 0.66));
      cal.body.querySelector('[data-popb]').style.background = p > 0.42 ? '#61bcff' : '#e6ebf2'; cal.body.querySelector('[data-popb]').style.color = p > 0.42 ? '#0b0e13' : '#4a5668';
      chips[1].style.opacity = E.out3(P(p, 0.8, 0.95));
      // sheet
      p = prog(2);
      sheet.body.querySelectorAll('[data-cell]').forEach(e => { const k = +e.dataset.cell; e.style.opacity = P(p, 0.2 + k * 0.03, 0.26 + k * 0.03); });
      sheet.body.querySelectorAll('[data-tot]').forEach((e, i) => e.style.opacity = P(p, 0.65 + i * 0.05, 0.72 + i * 0.05));
      chips[2].style.opacity = E.out3(P(p, 0.82, 0.97));
      // agent cursor: continuous path through the three tasks (stage px)
      const kf = [];
      const add = (i, rel) => rel.forEach(([pp, lx, ly]) => { const [x, y] = loc(i, lx, ly); kf.push([ts[i] + pp * td, x, y]); });
      add(0, [[0, 620, 30], [0.12, 440, 140], [0.3, 440, 150], [0.55, 440, 160], [0.62, 530, 232], [0.68, 530, 232], [0.78, 560, 120]]);
      add(1, [[0, 560, 40], [0.14, 310, 120], [0.2, 306, 118], [0.4, 340, 52], [0.45, 352, 50], [0.56, 352, 50], [0.78, 440, 160]]);
      add(2, [[0, 560, 40], [0.14, 245, 60], [0.3, 240, 110], [0.5, 350, 160], [0.68, 490, 190], [0.9, 540, 70]]);
      const [ax, ay] = pathAt(T, kf);
      const aA = P(T, ts[0] - .3, ts[0] + .2) * (1 - P(T, ts[2] + td * .95, ts[2] + td + .6)) * dim;
      put(agentCur, { x: ax + 15.6, y: ay + 19.8, s: 1, a: aA });
      // captions, badge, end
      const capIn = TL.capA < 90;
      cap2.show(capIn && T > TL.capA - .1 && T < TL.badge + 1); cap2.set(t, TL.capA * B, B / 2, .45, .35, 9);
      cap2.d.style.opacity = capIn ? 1 - E.io2(P(T, TL.badge - .5, TL.badge + .5)) : 0;
      const bp = E.out3(P(T, TL.badge, TL.badge + 1)); badge.style.opacity = bp * dim; if (badgeUpd) badgeUpd(P(T, TL.badge, TL.badge + 3)); badge.style.transform = `translateY(${((1 - bp) * 26).toFixed(1)}px)`;
      const eIn = E.out3(P(T, TL.endA + .6, TL.endA + 1.8)); endEl.style.opacity = eIn; endEl._p.style.opacity = endEl.style.opacity; endEl.style.transform = `translateY(${((1 - eIn) * 24).toFixed(1)}px)`;
    },
  });
})();
