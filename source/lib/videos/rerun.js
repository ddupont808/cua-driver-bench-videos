/* B3 Rerun it yourself: a 12 s card pointing at the CuaDriverBench-AgentEnv dataset on Hugging Face (the one place with instructions per OS and driver).
   Shows exactly the commands taken from the dataset card (the Linux/Docker run, and loading the board). 120 bpm, 24 beats. */
(function () {
  const BPM = 120, B = 60 / BPM, NB = 24, DUR = NB * B;
  const C1 = 'pip install -U agentenv-framework';
  const C2 = 'agent-env run hf://earakely-scale/cua-driver-bench --task cdb-g02-background --model anthropic/claude-sonnet-5-5';
  const C3 = 'load_dataset("earakely-scale/CuaDriverBench-AgentEnv", "board", split="eval")';
  let head, sub, term1, ty1, lab1, term2, ty2, lab2, thanks, endEl, foot;
  const termBox = (O, top) => { const t = el('div', '', '', O); t.style.cssText = `position:absolute;left:150px;top:${top}px;width:1620px;border-radius:20px;background:#10161f;border:1.5px solid rgba(243,246,250,.14);box-shadow:0 30px 80px rgba(0,0,0,.5);opacity:0;padding:26px 34px;box-sizing:border-box`; return t; };
  defineVideo({
    W: 1920, H: 1080, fps: 60, dur: DUR, bpm: BPM, bg: C.graphite,
    init(c) {
      const O = c.overlay;
      head = Words(O, 'Rerun it. Every OS, every driver.', 'position:absolute;left:0;right:0;top:50px;text-align:center;font-size:96px;white-space:nowrap');
      sub = el('div', 'disp', 'huggingface.co/datasets/earakely-scale/CuaDriverBench-AgentEnv', O); sub.style.cssText = `position:absolute;left:0;right:0;top:182px;text-align:center;font-size:44px;color:${C.signal};white-space:nowrap;opacity:0`;
      lab1 = el('div', 'mono', 'Linux with Docker, from the dataset card (the card has the full command):', O); lab1.style.cssText = `position:absolute;left:150px;top:300px;font-size:26px;color:${C.slate};opacity:0;white-space:nowrap`;
      term1 = termBox(O, 345); term1.style.height = '190px'; ty1 = el('div', 'mono', '', term1); ty1.style.cssText = 'font-size:30px;line-height:1.6;color:#f3f6fa;white-space:pre-wrap;word-break:break-all';
      lab2 = el('div', 'mono', 'Load the results (every trial, with its replay):', O); lab2.style.cssText = `position:absolute;left:150px;top:590px;font-size:26px;color:${C.slate};opacity:0;white-space:nowrap`;
      term2 = termBox(O, 635); term2.style.height = '110px'; ty2 = el('div', 'mono', '', term2); ty2.style.cssText = 'font-size:30px;line-height:1.6;color:#f3f6fa;white-space:nowrap';
      foot = el('div', 'mono', 'The dataset card has the instructions for each OS and driver. These are AgentEnv&#39;s runs, not Cua&#39;s own runner; the two are not like-for-like.', O); foot.style.cssText = `position:absolute;left:150px;top:790px;font-size:22px;color:${C.slate};opacity:0;white-space:nowrap`;
      thanks = el('div', 'disp', 'Thanks to Scale AI.', O); thanks.style.cssText = 'position:absolute;left:0;right:0;top:880px;text-align:center;font-size:84px;opacity:0;white-space:nowrap';
      endEl = el('div', '', `<div style="display:flex;align-items:center;gap:34px;justify-content:center">${markSVG(C.paper, 130)}<div class="disp" style="font-size:140px">Cua Driver Bench</div></div><div class="mono" style="font-size:28px;text-align:center;margin-top:30px;color:${C.paper}">huggingface.co/datasets/earakely-scale/CuaDriverBench-AgentEnv</div><div class="mono" style="font-size:26px;text-align:center;margin-top:16px;color:${C.slate}">cua.ai &middot; github.com/trycua/cua</div>`, O); endEl.style.cssText += ';position:absolute;left:0;right:0;top:360px;opacity:0'; endEl._p = partnerRow(c.overlay);
    },
    frame(t, c) {
      const T = t / B, dim = 1 - E.io3(P(T, 19.4, 20.2));
      head.set(t, 0.5 * B, B / 2, .4, .3, 8); head.d.style.opacity = dim;
      sub.style.opacity = E.out3(P(T, 3.5, 4.5)) * dim;
      lab1.style.opacity = E.out3(P(T, 5, 6)) * dim; term1.style.opacity = E.out3(P(T, 5, 6)) * dim;
      const cur = '<span style="display:inline-block;width:5px;height:1.05em;background:#f3f6fa;vertical-align:-0.16em"></span>';
      const n1 = typedN(T, 6, 8, C1.length), n2 = typedN(T, 8.3, 12.5, C2.length);
      ty1.innerHTML = '<span style="color:#61bcff">$</span> ' + typedHTML(C1, n1) + '<br><span style="color:#61bcff">$</span> ' + typedHTML(C2, n2).replace('<span style="opacity:0">', (T < 13.5 ? cur : '') + '<span style="opacity:0">');
      lab2.style.opacity = E.out3(P(T, 13, 14)) * dim; term2.style.opacity = E.out3(P(T, 13, 14)) * dim;
      const n3 = typedN(T, 14, 17, C3.length); ty2.innerHTML = '<span style="color:#61bcff">&gt;&gt;&gt;</span> ' + typedHTML(C3, n3).replace('<span style="opacity:0">', cur + '<span style="opacity:0">');
      foot.style.opacity = E.out3(P(T, 16, 17)) * dim; thanks.style.opacity = E.out3(P(T, 17.5, 18.5)) * dim;
      const e = E.out3(P(T, 20.4, 21.4)); endEl.style.opacity = e; endEl._p.style.opacity = endEl.style.opacity; endEl.style.transform = `translateY(${((1 - e) * 20).toFixed(0)}px)`;
    },
  });
})();
