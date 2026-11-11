/* koalabot.js - flat Cua koala bots (a flat "koala bots" style): solid head blob, scalloped ears, the mark's own nose, three rays,
   type-mark eyes. No outline, gradient, shading or shadow. Bots never squash or stretch. Pure function of its parameters. */
(function () {
  const K = window.KB; const r4 = x => Math.round(x * 10000) / 10000;
  const EAR_L = K.EAR_R.replace(/(-?\d+\.\d+) (-?\d+\.\d+)/g, (m, x, y) => `${r4(-parseFloat(x))} ${y}`);
  const SW = 0.066, EY = -0.041, EX = 0.5;
  function glyph(g, cx, cy, side, col, h = 0.16) {
    const st = `stroke="${col}" stroke-width="${SW}" fill="none" stroke-linecap="butt" stroke-linejoin="miter"`;
    const P = d => `<path d="${d}" ${st}/>`;
    switch (g) {
      case 'x': return P(`M${cx - h} ${cy - h}L${cx + h} ${cy + h}M${cx + h} ${cy - h}L${cx - h} ${cy + h}`);
      case '+': return P(`M${cx - h} ${cy}L${cx + h} ${cy}M${cx} ${cy - h}L${cx} ${cy + h}`);
      case '*': return P(`M${cx - h} ${cy}L${cx + h} ${cy}M${cx - h * .5} ${cy - h * .87}L${cx + h * .5} ${cy + h * .87}M${cx + h * .5} ${cy - h * .87}L${cx - h * .5} ${cy + h * .87}`);
      case '-': return P(`M${cx - h} ${cy}L${cx + h} ${cy}`);
      case 'o': return `<circle cx="${cx}" cy="${cy}" r="${h * .9}" ${st}/>`;
      case '^': return P(`M${cx - h} ${cy + h * .55}L${cx} ${cy - h * .55}L${cx + h} ${cy + h * .55}`);
      case '>': return P(side < 0 ? `M${cx - h} ${cy - h}L${cx + h} ${cy}L${cx - h} ${cy + h}` : `M${cx + h} ${cy - h}L${cx - h} ${cy}L${cx + h} ${cy + h}`);
      default: return '';
    }
  }
  /** markup in head units (R = 1) centred on the head centroid */
  function botMarkup(face, nose, ink, g, rayOn = 1) {
    const eyes = glyph(g === '><' ? '>' : g, -EX, EY, -1, ink) + glyph(g === '><' ? '>' : g, EX, EY, 1, ink).replace(g === '><' ? '' : '\u0000', '');
    const eR = g === '><' ? glyph('>', -EX, EY, -1, ink) + glyph('>', EX, EY, 1, ink) : glyph(g, -EX, EY, -1, ink) + glyph(g, EX, EY, 1, ink);
    const rays = rayOn > 0.01 ? `<g transform="scale(${(K.K * rayOn).toFixed(6)}) translate(${-K.HX} ${-K.HY})" fill="${nose}">${K.RAYS.map(d => `<path d="${d}"/>`).join('')}</g>` : '';
    return `<path d="${K.EAR_R.replace(/^M/, 'M')}" transform="translate(${K.EAR_AT[0]} ${K.EAR_AT[1]})" fill="${face}"/><path d="${EAR_L}" transform="translate(${-K.EAR_AT[0]} ${K.EAR_AT[1]})" fill="${face}"/>` +
      `<path d="${K.HEAD}" fill="${face}"/><g transform="translate(${r4((K.NOSE_C[0] - K.HX) * K.K)} ${r4((K.NOSE_C[1] - K.HY) * K.K)}) scale(${K.K}) translate(${-K.NOSE_C[0]} ${-K.NOSE_C[1]})"><path d="${K.NOSE}" fill="${nose}"/></g>` + eR + rays;
  }
  class KBot {
    constructor(parent, face, nose, ink = '#0b0e13') {
      this.face = face; this.nose = nose; this.ink = ink;
      this.root = el('div', 'c3', null, parent);
      this.S = 560; this.root.innerHTML = `<svg width="${this.S}" height="${this.S}" viewBox="-1.9 -1.9 3.8 3.8" style="overflow:visible"><g data-b></g></svg>`;
      this.g = this.root.querySelector('[data-b]');
    }
    /** glyph: 'x','>','o','^','-','*','+' ('>' draws > <) */
    draw(glyphName, rayOn = 1) { this.g.innerHTML = botMarkup(this.face, this.nose, this.ink, glyphName === '>' ? '><' : glyphName, rayOn); }
  }
  /** inline avatar markup: the bot's head and ears only, on transparent */
  function botAvatar(face, nose, px, g = '*') {
    return `<svg width="${px}" height="${px}" viewBox="-1.5 -1.45 3 2.9" style="flex:none;overflow:visible">${botMarkup(face, nose, '#0b0e13', g === '>' ? '><' : g, 0)}</svg>`;
  }
  window.KBot = KBot; window.botAvatar = botAvatar;
})();
