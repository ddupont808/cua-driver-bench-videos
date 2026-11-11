/* kit.js - small shared kit for the Cua Driver Bench films: palette, mark, word reveal, flat app windows, cursors. Pure functions of time. */
const C = { graphite: '#0b0e13', paper: '#f3f6fa', signal: '#61bcff', navy: '#0f1a2a', green: '#4fd37e', slate: '#8e98a3', ink: '#1b2433', orange: '#ff7a2f', violet: '#8b5cf6', sky: '#61bcff' };
const markSVG = (color, px, extra = '') => `<svg viewBox="0 0 1500 1500" width="${px}" height="${px}" fill="${color}" style="${extra}">${window.CUA_MARK.map(d => `<path d="${d}"/>`).join('')}</svg>`;
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
function typedHTML(full, n) { n = Math.max(0, Math.min(full.length, Math.floor(n))); return `${esc(full.slice(0, n))}<span style="opacity:0">${esc(full.slice(n))}</span>`; }
const typedN = (t, a, b, len) => clamp((t - a) / (b - a)) * len;
const snapBeat = (x, B) => Math.round(x * 2) / 2 * B;
/** words that reveal one by one (blur-up). */
function Words(parent, text, css, cls = 'disp') {
  const d = el('div', cls, null, parent); if (css) d.style.cssText += ';' + css;
  const ws = text.split(' ').map(w => { const s = el('span', 'w', esc(w), d); s.style.marginRight = '0.26em'; return s; });
  return { d, ws, set(t, t0, gap, dur = 0.45, rise = 0.35, blur = 8) { ws.forEach((s, i) => { const p = E.out3(P(t, t0 + i * gap, t0 + i * gap + dur)); s.style.opacity = p; s.style.transform = `translateY(${((1 - p) * rise * 40).toFixed(1)}px)`; s.style.filter = p < 1 ? `blur(${((1 - p) * blur).toFixed(1)}px)` : 'none'; }); }, show(v) { d.style.visibility = v ? 'visible' : 'hidden'; } };
}
/** a flat app window. body children are positioned absolutely in window px. */
class AppWin {
  constructor(parent, { w, h, title, light = true }) {
    this.w = w; this.h = h;
    this.root = el('div', 'c3', null, parent);
    this.win = el('div', 'win', null, this.root); this.win.style.cssText += `;width:${w}px;height:${h}px`;
    this.tb = el('div', 'tb', `<span class="dot" data-d></span><span class="dot" data-d></span><span class="dot" data-d></span><span style="margin-left:14px;flex:1;text-align:center;margin-right:70px">${esc(title)}</span>`, this.win);
    this.body = el('div', 'body', null, this.win); this.body.style.cssText = `height:${h - 44}px;overflow:hidden`;
    this.setActive(true);
  }
  setActive(a) { const cols = a ? ['#ff5f57', '#febc2e', '#28c840'] : ['#c5ccd6', '#c5ccd6', '#c5ccd6']; this.tb.querySelectorAll('[data-d]').forEach((d, i) => d.style.background = cols[i]); this.win.style.boxShadow = a ? '0 0 0 3px rgba(97,188,255,.9),0 40px 100px rgba(0,0,0,.55)' : '0 30px 80px rgba(0,0,0,.5)'; this.win.style.filter = a ? 'none' : 'saturate(.85) brightness(.96)'; }
}
const USER_CURSOR = (px = 44) => `<svg viewBox="0 0 24 24" width="${px}" height="${px}" style="filter:drop-shadow(0 3px 5px rgba(0,0,0,.5))"><path d="M4.5 2.5 L4.5 19 L8.9 15 L11.8 21.5 L14.6 20.2 L11.7 13.8 L17.6 13.6 Z" fill="#ffffff" stroke="#0b0e13" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
const AGENT_CURSOR = (px = 46, label = 'Cua Driver') => `<svg viewBox="0 0 24 24" width="${px}" height="${px}" style="filter:drop-shadow(0 0 10px rgba(97,188,255,.8))"><path d="M4.5 2.5 L4.5 19 L8.9 15 L11.8 21.5 L14.6 20.2 L11.7 13.8 L17.6 13.6 Z" fill="#61bcff" stroke="#0f1a2a" stroke-width="1.4" stroke-linejoin="round"/></svg><span style="position:absolute;left:${px * .62}px;top:${px * .78}px;white-space:nowrap;background:#61bcff;color:#0b0e13;border-radius:999px;padding:3px 14px;font:600 ${Math.round(px * .42)}px Urbanist">${label}</span>`;
/** piecewise-linear path through [t,x,y] keyframes with ease between */
function pathAt(t, kf) {
  if (t <= kf[0][0]) return [kf[0][1], kf[0][2]];
  for (let i = 1; i < kf.length; i++) if (t <= kf[i][0]) { const a = kf[i - 1], b = kf[i]; const u = E.io3(P(t, a[0], b[0])); return [lerp(a[1], b[1], u), lerp(a[2], b[2], u)]; }
  const l = kf[kf.length - 1]; return [l[1], l[2]];
}
function catmull(pts, u) { const n = pts.length - 1, f = clamp(u) * n, i = Math.min(n - 1, Math.floor(f)), t = f - i; const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)]; const c = k => 0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t * t + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t * t * t); return [c(0), c(1)]; }

/* ---- shared baseline row built from numbers.json (window.NUMBERS): every driver, same scale, with sources ---- */
const NUM = () => window.NUMBERS;
const pctOf = d => Math.round(d.passed * 100 / d.n);
function baselineHTML(w = 1740, big = 1) {
  const N = NUM(), col = Math.floor(w / N.drivers.length);
  return N.drivers.map(d => `<div style="position:absolute;left:${N.drivers.indexOf(d) * col}px;top:0;width:${col - 30}px"><div class="disp" style="font-size:${33 * Math.min(big, 1.05)}px;white-space:nowrap;color:${d.highlight ? '#f3f6fa' : '#c4ccd8'}">${esc(d.name)}</div><div class="disp" data-bp style="font-size:${64 * big}px;line-height:1.05;color:${d.highlight ? '#61bcff' : '#f3f6fa'}">0%</div><div style="height:${14 * big}px;border-radius:8px;background:rgba(243,246,250,.1);margin-top:4px"><div data-bb style="height:100%;width:0;border-radius:8px;background:${d.highlight ? '#61bcff' : '#6b7686'}"></div></div></div>`).join('');
}
function baselineSet(root, p) { const N = NUM(); root.querySelectorAll('[data-bp]').forEach((e, i) => { const d = N.drivers[i], q = E.out3(P(p, 0.05 + i * 0.12, 0.6 + i * 0.12)); e.textContent = Math.round(pctOf(d) * q) + '%'; root.querySelectorAll('[data-bb]')[i].style.width = (d.passed / d.n * 100 * q).toFixed(1) + '%'; }); }
const PCT0 = () => pctOf(window.NUMBERS.drivers[0]);
const BASE_SHORT = () => { const N = NUM(); return `<span style="display:inline-block;white-space:normal;width:1740px">${N.os} &middot; background full pass &middot; ${N.drivers[0].n} trials per driver &middot; ${esc(N.model)} &middot; ${esc(N.source_line)}<br>Not like-for-like with Cua&#39;s own runner &middot; Codex Computer Use is foreground-only on Windows, so no Windows comparison &middot; Cua Driver vs Codex Computer Use is directional</span>`; };
const BASE_NOTE = () => { const N = NUM(); return `<span style="display:inline-block;white-space:normal;width:1740px">${N.os} &middot; background full pass &middot; ${N.drivers[0].n} trials per driver &middot; ${esc(N.model)} &middot; ${esc(N.source_line)}<br>Not like-for-like with Cua&#39;s own runner &middot; Codex Computer Use is foreground-only on Windows, so no Windows comparison is shown &middot; other models rank the drivers differently<br>Four of the five macOS drivers on the board are shown &middot; Cua Driver vs Codex Computer Use is directional (the intervals overlap)</span>`; };

/* ---- Windows block (numbers.json windows) ---- */
const WIN = () => NUM().windows;
const WIN_NOTE = (cond) => { const N = NUM(); return `<span style="display:inline-block;white-space:normal;width:1800px">Windows &middot; ${cond} &middot; AgentEnv runs on the CuaDriverBench-AgentEnv dataset, as of ${esc(N.asof)} &middot; directional, few trials per cell<br>Not like-for-like with Cua&#39;s own runner &middot; Codex Computer Use is foreground-only on Windows (no background trials), so it is not in a background comparison &middot; other drivers and systems are in the dataset</span>`; };
const short = m => m.replace('Claude ', '').replace(' 5.5', '');


/* ---- Cua x Scale AI x AgentEnv partner row for end cards. Scale's official horizontal white logo is inlined unmodified; AgentEnv's official icon.svg
   (agentenvframework.com/icon.svg) is inlined with the dark-scheme colours its own stylesheet defines (#E8E7FC, #9E8CFC); the "AgentEnv" text beside it is plain type.
   Layout follows brand.scale.com: vertical dividers centred in 3e gaps, 2e tall, e ~ 0.8 of the Scale logo height. ---- */
function partnerRow(O, top = 905, h = 56) {
  const e = h * 0.8, gap = 3 * e;
  const sc = window.SCALE_WHITE.replace('<svg ', `<svg height="${h}" style="display:block" `);
  const ae = `<svg viewBox="0 0 32 32" width="${h}" height="${h}" style="display:block"><path fill="#E8E7FC" d="M5,2 H11 A3,3 0 0 1 14,5 V11 A3,3 0 0 1 11,14 H5 A3,3 0 0 1 2,11 V5 A3,3 0 0 1 5,2 Z"/><path fill="#9E8CFC" d="M21,2 H27 A3,3 0 0 1 30,5 V11 A3,3 0 0 1 27,14 H21 A3,3 0 0 1 18,11 V5 A3,3 0 0 1 21,2 Z"/><path fill="#E8E7FC" d="M5,18 H11 A3,3 0 0 1 14,21 V27 A3,3 0 0 1 11,30 H5 A3,3 0 0 1 2,27 V21 A3,3 0 0 1 5,18 Z"/></svg>`;
  const div = `<div style="width:3px;height:${2 * e}px;background:rgba(243,246,250,.8);border-radius:2px"></div>`;
  const d = el('div', '', `<div style="display:flex;align-items:center;gap:${(gap - 3) / 2}px;justify-content:center"><div style="display:flex;align-items:center;gap:${h * 0.3}px">${markSVG(C.paper, h * 1.05)}<span class="disp" style="font-size:${h * 0.98}px;font-weight:600;letter-spacing:-.02em;line-height:1">Cua</span></div>${div}<div>${sc}</div>${div}<div style="display:flex;align-items:center;gap:${h * 0.3}px">${ae}<span class="disp" style="font-size:${h * 0.82}px;font-weight:600;letter-spacing:-.02em;line-height:1;color:#E8E7FC">AgentEnv</span></div></div>`, O);
  d.style.cssText += `;position:absolute;left:0;right:0;top:${top}px;opacity:0`; return d;
}
/* a closing card for films that end on a chart: a cover fades over the content, then the Cua Driver Bench lockup and the Cua x Scale AI row */
function closingCard(O) {
  const cover = el('div', '', '', O); cover.style.cssText = 'position:absolute;inset:0;background:#0b0e13;opacity:0';
  const end = el('div', '', `<div style="display:flex;align-items:center;gap:34px;justify-content:center">${markSVG(C.paper, 130)}<div class="disp" style="font-size:140px">Cua Driver Bench</div></div><div class="disp" style="font-size:54px;text-align:center;margin-top:30px;color:${C.signal}">Can an agent use your apps without disturbing you?</div><div class="mono" style="font-size:26px;text-align:center;margin-top:26px;color:${C.paper}">cua.ai &middot; github.com/trycua/cua</div>`, O);
  end.style.cssText += ';position:absolute;left:0;right:0;top:300px;opacity:0'; end._p = partnerRow(O);
  end._cover = cover; return end;
}
function closingSet(end, T, a) { end._cover.style.opacity = E.io3(P(T, a, a + 1)); const e = E.out3(P(T, a + 0.8, a + 2)); end.style.opacity = e; end._p.style.opacity = e; end.style.transform = `translateY(${((1 - e) * 20).toFixed(0)}px)`; }
