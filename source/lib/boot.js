/* boot.js - loads one video definition (?v=name), builds the layers, exposes renderFrame(t) */
window.VDEFS = []; window.defineVideo = d => { window.VDEF = d; window.VDEFS.push(d); };
(async function () {
  const q = new URLSearchParams(location.search); const n = q.get('v');
  for (const part of n.split(/[+ ]/)) await new Promise((res, rej) => { const s = document.createElement('script'); s.src = `videos/${part}.js`; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  const d = window.VDEF; const W = d.W, H = d.H;
  const stage = document.getElementById('stage'); stage.style.setProperty('--W', W + 'px'); stage.style.setProperty('--H', H + 'px'); stage.style.setProperty('--bg', d.bg || '#0b0e13');
  document.documentElement.style.background = d.bg || '#0b0e13'; document.body.style.background = d.bg || '#0b0e13';
  const layer = el('div', '', null, stage); layer.id = 'layer';
  const overlay = el('div', '', null, stage); overlay.id = 'overlay';
  const ctx = { stage, W, H, layer, overlay, NUMBERS: window.NUMBERS };
  d.init(ctx);
  for (const f of ['600 40px Urbanist', '500 20px "JetBrains Mono"']) await document.fonts.load(f);
  await document.fonts.ready;
  window.__dur = d.dur; window.__fps = d.fps || 60; window.__W = W; window.__H = H;
  window.renderFrame = t => d.frame(t, ctx);
  window.__ready = true;
})();
