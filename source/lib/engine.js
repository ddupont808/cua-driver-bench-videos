/* engine.js - shared helpers, starfield, 3D keycaps (own projection, SVG). Every function is a pure function of time. */
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const P = (t, a, b) => (b <= a ? (t >= a ? 1 : 0) : clamp((t - a) / (b - a)));
const lerp = (a, b, x) => a + (b - a) * x;
const E = {
  lin: x => x,
  out2: x => 1 - (1 - x) * (1 - x),
  out3: x => 1 - Math.pow(1 - x, 3),
  out5: x => 1 - Math.pow(1 - x, 5),
  in3: x => x * x * x,
  io3: x => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  io2: x => (x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2),
  back: x => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
};
const ep = (f, t, a, b) => f(P(t, a, b)); // eased progress
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function el(tag, cls, html, parent) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; }
const svgNS = 'http://www.w3.org/2000/svg';
function place(e, opt) {
  // o: x,y,z,rx,ry,rz (deg),s,o(opacity), blur
  const { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 1, o = 1, blur = 0 } = opt;
  e.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${z.toFixed(2)}px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) rotateZ(${rz.toFixed(3)}deg) scale(${s.toFixed(4)})`;
  const ch = e.firstElementChild; if (ch) { const w = ch.offsetWidth || parseFloat(ch.getAttribute('width')) || 0, h = ch.offsetHeight || parseFloat(ch.getAttribute('height')) || 0; e.style.width = w + 'px'; e.style.height = h + 'px'; e.style.marginLeft = (-w / 2) + 'px'; e.style.marginTop = (-h / 2) + 'px'; }
  e.style.opacity = o.toFixed(3);
  e.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none';
  e.style.visibility = o <= 0.001 ? 'hidden' : 'visible';
}
// NB: place() reads `o` both as options object and opacity; callers pass opacity as `a`.
function put(e, p) { const q = Object.assign({}, p); const op = p.a == null ? 1 : p.a; delete q.a; q.o = op; place(e, q); }

/* ---------- starfield (canvas) ---------- */
const STARS = (() => {
  const r = mulberry(7); const a = [];
  for (let i = 0; i < 900; i++) a.push({ x: r(), y: r(), r: 0.35 + Math.pow(r(), 3) * 1.5, a: 0.18 + r() * 0.7, d: 0.2 + r() * 1.3, ph: r() * TAU, tw: 0.3 + r() * 1.2 });
  return a;
})();
function drawStars(canvas, t, cam, tint) {
  const ctx = canvas.getContext('2d'); const W = canvas.width, H = canvas.height;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W * .62, H * .45, 0, W * .62, H * .45, Math.max(W, H) * .75);
  g.addColorStop(0, `rgba(${tint || '24,44,70'},.45)`); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (const s of STARS) {
    let x = (s.x * W + cam.x * s.d * 0.06 + W * 4) % W; let y = (s.y * H + cam.y * s.d * 0.06 + H * 4 + t * 0 ) % H;
    const tw = 0.75 + 0.25 * Math.sin(t * s.tw + s.ph);
    ctx.globalAlpha = s.a * tw; ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(x, y, s.r * (W > H ? 1 : 0.9), 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/* ---------- 3D keycaps ---------- */
const KEYCOL = { cream: [222, 212, 194], blue: [82, 168, 224], orange: [198, 98, 56], navy: [32, 46, 78] };
function rotM(rx, ry, rz) {
  const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry), cz = Math.cos(rz), sz = Math.sin(rz);
  // R = Rz * Ry * Rx
  const Rx = [[1, 0, 0], [0, cx, -sx], [0, sx, cx]], Ry = [[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]], Rz = [[cz, -sz, 0], [sz, cz, 0], [0, 0, 1]];
  const mm = (A, B) => A.map((r, i) => [0, 1, 2].map(j => r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j]));
  return mm(Rz, mm(Ry, Rx));
}
const mv = (M, v) => [M[0][0] * v[0] + M[0][1] * v[1] + M[0][2] * v[2], M[1][0] * v[0] + M[1][1] * v[1] + M[1][2] * v[2], M[2][0] * v[0] + M[2][1] * v[1] + M[2][2] * v[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = a => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const LIGHT = norm([-0.55, 0.85, 0.75]);

function glyphSVG(kind) {
  if (kind === 'orange') { // koala, scaled to unit space (-1..1)
    return `<g transform="translate(-0.62,-0.62) scale(${1.24 / 1117.09})" fill="rgba(255,244,230,.92)">${window.LOGO_INNER}</g>`;
  }
  if (kind === 'navy') { // cursor arrow
    return `<path d="M-0.42,-0.5 L0.5,-0.05 L0.08,0.08 L-0.08,0.52 Z" fill="rgba(255,255,255,.95)" stroke="rgba(255,255,255,.95)" stroke-width=".07" stroke-linejoin="round"/>`;
  }
  if (kind === 'blue') { // layered windows with a koala on the front one
    const sq = (x, y, o) => `<rect x="${x}" y="${y}" width=".62" height=".62" rx=".15" fill="rgba(10,28,48,${o})" stroke="rgba(10,28,48,.35)" stroke-width=".02"/>`;
    return `${sq(-.5, -.52, .55)}${sq(-.32, -.34, .75)}${sq(-.14, -.16, .96)}<g transform="translate(.04,-.06) scale(${0.42 / 1117.09})" fill="#bfe3f7">${window.LOGO_INNER}</g>`;
  }
  return '';
}
function shadeCol(base, s, warm) {
  const c = base.map((v, i) => clamp(Math.round(v * s + (warm ? [8, 4, 0][i] : 0)), 0, 255));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
/** Draw one keycap into svg element. k: {kind,rx,ry,rz (rad)}, px: key base width in px. */
function drawKey(svg, k, px, blur, alpha) {
  const D = 3.6, HB = 0.5, HT = 0.34, YB = -0.22, YT = 0.22;
  const M = rotM(k.rx, k.ry, k.rz);
  const loc = (x, y, z) => mv(M, [x, y, z]);
  const B = [[-HB, YB, -HB], [HB, YB, -HB], [HB, YB, HB], [-HB, YB, HB]].map(v => loc(...v));
  const T = [[-HT, YT, -HT], [HT, YT, -HT], [HT, YT, HT], [-HT, YT, HT]].map(v => loc(...v));
  const proj = v => { const f = D / (D - v[2]); return [v[0] * f * px, -v[1] * f * px]; };
  const cam = [0, 0, D];
  const base = KEYCOL[k.kind];
  const faces = [];
  const addFace = (verts, name) => {
    const c = [0, 1, 2].map(i => verts.reduce((s, v) => s + v[i], 0) / verts.length);
    let n = norm(cross(sub(verts[1], verts[0]), sub(verts[2], verts[0])));
    if (dot(n, c) < 0) n = n.map(x => -x);
    const vis = dot(n, sub(cam, c));
    if (vis <= 0) return;
    faces.push({ verts, n, c, name, depth: c[2] });
  };
  addFace(T, 'top');
  for (let i = 0; i < 4; i++) addFace([B[i], B[(i + 1) % 4], T[(i + 1) % 4], T[i]], 'side');
  faces.sort((a, b) => a.depth - b.depth);
  const S = px * 1.75; // svg half size
  let out = '';
  const sw = px * 0.075;
  for (const f of faces) {
    const diff = Math.max(0, dot(f.n, LIGHT));
    const s = 0.44 + 0.80 * Math.pow(diff, 0.85) + (f.name === 'top' ? 0.08 : 0);
    const fill = shadeCol(base, s, k.kind === 'cream');
    const edge = shadeCol(base, Math.min(1.25, s * 1.18 + 0.05), k.kind === 'cream');
    const pts = f.verts.map(proj).map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
    out += `<polygon points="${pts}" fill="${fill}" stroke="${edge}" stroke-width="${sw.toFixed(1)}" stroke-linejoin="round"/>`;
    if (f.name === 'top') {
      const tp = (u, v) => { const w = loc(u * HT, YT, v * HT); return proj(w); };
      const c0 = tp(0, 0), ex = tp(1, 0), ey = tp(0, 1);
      const mx = [(ex[0] - c0[0]) / 1, (ex[1] - c0[1]) / 1], my = [(ey[0] - c0[0]) / 1, (ey[1] - c0[1]) / 1];
      // unit space is (-1..1) -> local coord u*HT ; we mapped u=1 -> HT so matrix scale is per-unit already
      const mat = `matrix(${mx[0].toFixed(3)},${mx[1].toFixed(3)},${my[0].toFixed(3)},${my[1].toFixed(3)},${c0[0].toFixed(2)},${c0[1].toFixed(2)})`;
      const hi = shadeCol(base, Math.min(1.3, s * 1.22), k.kind === 'cream');
      const lo = shadeCol(base, s * 0.78, k.kind === 'cream');
      const gid = 'g' + Math.round(Math.abs(k.id) * 97 + 1);
      // dish: darker centre, lighter lit edge
      out += `<g transform="${mat}"><defs><radialGradient id="${gid}" cx=".5" cy=".5" r=".75" gradientUnits="objectBoundingBox"><stop offset="0" stop-color="${lo}" stop-opacity=".95"/><stop offset=".62" stop-color="${fill}" stop-opacity=".0"/><stop offset="1" stop-color="${hi}" stop-opacity=".5"/></radialGradient></defs>`;
      out += `<rect x="-.82" y="-.82" width="1.64" height="1.64" rx=".34" fill="url(#${gid})"/>`;
      if (k.kind === 'cream') { const r = mulberry(k.id * 13 + 5); for (let i = 0; i < 22; i++) { const x = (r() - .5) * 1.6, y = (r() - .5) * 1.6; out += `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${(0.012 + r() * 0.02).toFixed(3)}" fill="rgba(110,92,70,${(0.15 + r() * 0.25).toFixed(2)})"/>`; } }
      out += glyphSVG(k.kind) + '</g>';
      // specular streak
      const sp = Math.pow(diff, 8) * 0.5;
      if (sp > 0.02) out += `<polygon points="${pts}" fill="rgba(255,255,255,${sp.toFixed(3)})"/>`;
    }
  }
  svg.setAttribute('viewBox', `${-S} ${-S} ${2 * S} ${2 * S}`);
  svg.setAttribute('width', 2 * S); svg.setAttribute('height', 2 * S);
  svg.innerHTML = out;
  svg.style.filter = `blur(${(0.45 + blur).toFixed(2)}px)`;
  svg.style.opacity = alpha;
  return S;
}
/** KeyField: list of keys placed in a layer. spec: {kind,x,y,z,s,rx,ry,rz,vx,vy,vz,bob,ph,fl}  (x,y px from stage centre; z in -1..1 depth: 0 focus) */
class KeyField {
  constructor(layer, specs, W, H) { this.layer = layer; this.W = W; this.H = H; this.keys = specs.map((s, i) => { const svg = document.createElementNS(svgNS, 'svg'); layer.appendChild(svg); return Object.assign({ id: i + 1, bob: 14, ph: i * 1.7, vx: 0.12, vy: -0.09, vz: 0.07, blurK: 14, a: 1, mix: 1 }, s, { svg }); }); }
  update(t, cam, gate) {
    // gate(k,t) -> {a (opacity 0..1), dx, dy, s} for entrance animations
    for (const k of this.keys) {
      const g = gate ? gate(k, t) : { a: 1, dx: 0, dy: 0, sc: 1 };
      if (g.a <= 0.002) { k.svg.style.display = 'none'; continue; } k.svg.style.display = '';
      const rot = { kind: k.kind, id: k.id, rx: k.rx + k.vx * t + (g.rr || 0), ry: k.ry + k.vy * t, rz: k.rz + k.vz * t };
      const par = 1 + k.z * 0.55; // parallax depth
      const cx = this.W / 2 + k.x + cam.x * par * 0.5 + g.dx + Math.sin(t * 0.7 + k.ph) * k.bob * 0.4;
      const cy = this.H / 2 + k.y + cam.y * par * 0.5 + g.dy + Math.sin(t * 0.9 + k.ph * 1.3) * k.bob;
      const px = k.s * (1 + k.z * 0.18) * g.sc;
      const blur = Math.abs(k.z - (k.focus || 0)) * k.blurK;
      const S = drawKey(k.svg, rot, px, blur, g.a * k.a);
      k.svg.style.left = (cx - S) + 'px'; k.svg.style.top = (cy - S) + 'px';
    }
  }
}
