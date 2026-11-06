// FÁBRICA 3D · shot builder. Each script.json line = one 3D shot (camera cut). Nothing here changes per video.
// line.shot = { set, cam, who:[{c, act, mood, x, z, ry, hold, n, enter}], props:[name | {p,x,z,s,y,ry}], fx, hud, pill, head, sub, say, card, cardText }
import { THREE, SETS, actor, prop, animateFx, rnd } from './world.js';
import { ctx, C, clamp, lerp, seg, eo, eio, eob } from './core/lib.js';
import { L, Le, T, lineWords, norm } from './core/timing.js';

const CAMS = {
  wide: { p: [0, 2.7, 9.5], l: [0, 1.3, 0], fov: 44 },
  medium: { p: [0.5, 2.15, 6.2], l: [0, 1.45, 0], fov: 42 },
  close: { p: [0.3, 2.0, 4.0], l: [0, 1.78, 0], fov: 38, subj: true },
  low: { p: [0.9, 0.45, 4.2], l: [0, 1.7, 0], fov: 48 },
  top: { p: [0, 8.5, 4.2], l: [0, 0, 0], fov: 46 },
  ots: { p: [-1.9, 2.9, 4.3], l: [0.7, 1.4, -3], fov: 44, back: true },
  pov: { p: [0, 1.7, 1.2], l: [0, 1.4, -3], fov: 58, back: true, hideTu: true },
  lado: { p: [6.2, 1.8, 1.2], l: [0, 1.3, 0], fov: 40 },
};
const AUTO = ['medium', 'close', 'wide', 'low', 'medium', 'lado', 'close', 'ots'];
const BIG = new Set(['oso', 'dino', 'tiburon', 'robot']);

function layout(sh, setName) {
  let who = (sh.who || [{ c: 'tu' }]).map((w) => (typeof w === 'string' ? { c: w } : { ...w }));
  const out = [];
  const others = who.filter((w) => w.c !== 'tu');
  const back = CAMS[sh.cam]?.back;
  who.forEach((w, i) => {
    const n = w.c === 'gente' ? (w.n || 5) : 1;
    for (let k = 0; k < n; k++) {
      const a = { ...w, seed: i * 7 + k };
      if (w.c === 'gente' && w.x == null) { a.x = (k - (n - 1) / 2) * 1.15 + (rnd(k + i) - 0.5) * 0.4; a.z = -2.2 - (k % 2) * 1.2 - rnd(k) * 0.5; a.ry = (rnd(k + 3) - 0.5) * 0.8; }
      else if (w.c === 'tu') { a.x ??= others.length ? (back ? 0 : -0.85) : 0; a.z ??= 0; a.ry ??= back ? Math.PI : others.length ? 0.45 : 0; }
      else {
        const j = others.indexOf(w), m = others.length;
        a.x ??= back ? (j - (m - 1) / 2) * 1.6 : 0.95 + j * (BIG.has(w.c) ? 1.9 : 1.1);
        a.z ??= back ? -3.2 : -0.6 - j * 0.3 - (BIG.has(w.c) ? 0.6 : 0);
        a.ry ??= back ? 0 : -0.5;
      }
      out.push(a);
    }
  });
  return out;
}

function buildScene(sh, setName) {
  const scene = new THREE.Scene();
  (SETS[setName] || SETS.estudio)(scene);
  const acts = layout(sh, setName).map((a) => {
    const A = actor(a.c, { seed: a.seed, scale: a.s });
    A.root.position.set(a.x, a.y || 0, a.z); A.root.rotation.y = a.ry;
    if (a.hold && A.held) { const p = prop(a.hold); p.scale.setScalar(a.hold === 'extintor' ? 0.7 : 0.8); p.rotation.x = -0.3; A.held.add(p); }
    scene.add(A.root); return { ...a, A, base: A.root.position.clone() };
  });
  const props = (sh.props || []).map((p, i) => {
    const o = typeof p === 'string' ? { p } : p; const g = prop(o.p);
    const auto = [[1.6, -1.2], [-1.8, -1.0], [2.4, -2.4], [-2.6, -2.2], [0.6, -2.8]][i % 5];
    g.position.set(o.x ?? auto[0], o.y ?? 0, o.z ?? auto[1]); g.scale.setScalar(o.s ?? 1); g.rotation.y = o.ry ?? 0; scene.add(g);
    return { o, g, base: g.position.clone() };
  });
  if (sh.fx === 'fire') { const f = prop('fuego'); f.position.set(1.4, 0, -1.4); f.scale.setScalar(1.6); scene.add(f); }
  if (sh.fx === 'night') scene.traverse((o) => { if (o.isLight) o.intensity *= 0.45; });
  let parts = null;
  if (sh.fx === 'rain' || sh.fx === 'snow' || sh.fx === 'smoke') {
    const n = sh.fx === 'smoke' ? 60 : 500, g = new THREE.BufferGeometry(), pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { pos[i * 3] = (rnd(i) - 0.5) * 16; pos[i * 3 + 1] = rnd(i + 1) * 9; pos[i * 3 + 2] = (rnd(i + 2) - 0.5) * 12 - 1; }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    parts = new THREE.Points(g, new THREE.PointsMaterial({ color: sh.fx === 'rain' ? '#bcd8ff' : sh.fx === 'snow' ? '#ffffff' : '#555555', size: sh.fx === 'smoke' ? 1.2 : sh.fx === 'rain' ? 0.06 : 0.12, transparent: true, opacity: sh.fx === 'smoke' ? 0.35 : 0.85, depthWrite: false }));
    parts.userData.base = pos.slice(); parts.userData.disp = true; scene.add(parts);
  }
  return { scene, acts, props, parts };
}

export function buildShots(script, R) {
  const S = [], CUES = [];
  const cue = (t, type, o = {}) => CUES.push({ t: +Math.max(0, t).toFixed(3), type, ...o });
  const cam = new THREE.PerspectiveCamera(42, 1080 / 1920, 0.1, 200);
  let set = 'estudio', hud = '', k = 0;
  script.lines.forEach((ln, i) => {
    const sh = { ...(ln.shot || {}) };
    if (sh.set) set = sh.set; if (sh.hud != null) hud = sh.hud;
    const setName = set, hudTxt = hud;
    const st = i === 0 ? 0 : L(i) - 0.06, en = i < script.lines.length - 1 ? L(i + 1) - 0.06 : T.dur;
    const ws = lineWords(i), star = ((ln.caps || '').match(/\*([^\s|]+)/) || [])[1];
    const hit = star && ws.find((w) => norm(w.w).startsWith(norm(star).slice(0, Math.max(3, norm(star).length - 2))));
    const key = (hit ? hit.s : lerp(L(i), Le(i), 0.4)) - st;
    // one cut per line; a long line (> 3.2 s) gets a second camera angle half way (new image every ~2 s)
    const cams = [sh.cam || AUTO[k++ % AUTO.length]];
    if (en - st > 3.2) cams.push(sh.cam2 || AUTO[(AUTO.indexOf(cams[0]) + 3) % AUTO.length]);
    cams.forEach((cn, h) => {
      const a0 = st + (h ? (en - st) / 2 : 0);
      let built = null;
      const shot = { at: a0, id: `L${i}${h ? 'b' : ''}`, note: `${setName} · ${cn} · ${(sh.who || ['tu']).map((w) => w.c || w).join('+')}${sh.pill ? ' · ' + sh.pill : ''}`,
        build: () => (built ||= buildScene(cn === 'pov' || CAMS[cn]?.hideTu ? { ...sh, cam: cn, who: (sh.who || [{ c: 'tu' }]).filter((w) => (w.c || w) !== 'tu') } : { ...sh, cam: cn }, setName)),
        free: () => { if (built) built.scene.traverse((o) => { if (o.isLight && o.shadow && o.shadow.map) { o.shadow.map.dispose(); o.shadow.map = null; } if (o.userData.disp) { o.geometry.dispose(); o.material.dispose(); } }); built = null; },
        draw: (lt, d, t) => {
          const B = shot.build(), lt0 = t - st; // lt0 = time since the line started (overlays + acting continue across the half cut)
          B.acts.forEach((a, j) => {
            let x = a.base.x, z = a.base.z;
            if (a.enter) { const p = eo(clamp(lt0 / Math.max(0.8, (en - st) * 0.8))); x = lerp(a.base.x + (a.base.x >= 0 ? 4 : -4), a.base.x, p); }
            if (a.act === 'run' && a.c === 'tu' && a.go) { x += lt0 * a.go; }
            a.A.root.position.set(x, a.base.y, z);
            a.A.pose(lt0 + j * 0.37, a.mood || (a.c === 'tu' && lt0 > key ? 'scared' : 'calm'), a.act || (a.c === 'tu' ? 'idle' : 'idle'));
          });
          B.props.forEach(({ o, g, base }) => { if (o.fall) { const p = clamp(lt0 / 0.7); g.position.y = base.y + (1 - p * p) * 6; } if (o.spin) g.rotation.y = lt0 * o.spin; if (o.bob) g.position.y = base.y + Math.sin(lt0 * 3) * 0.15; if (o.come) g.position.z = base.z + lt0 * o.come; });
          if (B.parts) { const p = B.parts.geometry.attributes.position, b = B.parts.userData.base, v = sh.fx === 'rain' ? 9 : sh.fx === 'snow' ? 0.8 : -0.6;
            for (let q = 0; q < p.count; q++) { let y = b[q * 3 + 1] - lt0 * v; y = ((y % 9) + 9) % 9; p.array[q * 3 + 1] = y; } p.needsUpdate = true; }
          animateFx(B.scene, lt0);
          const C0 = CAMS[cn] || CAMS.medium, tu = B.acts.find((a) => a.c === 'tu');
          const ox = C0.subj && tu ? tu.base.x : 0, sc = tu?.s || 1;
          const u = eio(clamp(lt / Math.max(d, 0.1)));
          const push = lerp(1.07, 0.95, u), sway = Math.sin(t * 0.9) * 0.05;
          let sx = 0, sy = 0;
          if (sh.fx === 'shake' || sh.fx === 'flash') { const e = Math.max(0, 1 - Math.abs(lt0 - key) * 1.6); sx = Math.sin(t * 61) * 0.09 * e; sy = Math.cos(t * 47) * 0.07 * e; }
          const l = C0.l, p = C0.p;
          cam.fov = C0.fov; cam.position.set(ox + l[0] + (p[0] - l[0]) * push + sway + sx, l[1] * (C0.subj ? sc : 1) + (p[1] - l[1]) * push + sy, l[2] + (p[2] - l[2]) * push);
          cam.lookAt(ox + l[0] + sx * 0.5, l[1] * (C0.subj ? sc : 1), l[2]); cam.updateProjectionMatrix();
          R.render(B.scene, cam);
          ctx.drawImage(R.domElement, 0, 0, 1080, 1920);
          { const g = ctx.createRadialGradient(540, 900, 520, 540, 900, 1250); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(10,6,0,0.38)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920); }
          if (sh.fx === 'flash') { const e = Math.max(0, 1 - Math.abs(lt0 - key) * 4); if (e > 0) { ctx.fillStyle = '#fffbe8'; ctx.globalAlpha = e * 0.85; ctx.fillRect(0, 0, 1080, 1920); ctx.globalAlpha = 1; } }
          overlays(sh, hudTxt, lt0, key, en - st);
        } };
      S.push(shot);
      cue(a0, 'whoosh', { gain: h ? 0.35 : 0.55 });
    });
    if (sh.head) cue(st + Math.min(key, 0.3), 'pop', { gain: 0.8 });
    if (sh.pill) cue(st + 0.05, 'tock', { gain: 0.9 });
    if (sh.card) cue(st + key, sh.card === 'ok' ? 'sparkle' : 'slam', { gain: 0.8 });
    if (sh.say) cue(st + 0.25, 'boing', { gain: 0.4 });
    if (sh.fx === 'shake' || sh.fx === 'flash') cue(st + key, 'thud', { gain: 0.9 });
  });
  return { shots: S, cues: CUES };
}

// ---------------------------------------------------------------- 2D overlays (diary HUD, step pill, golden headline, cards, bubble)
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function text(t, x, y, size, fill, o = {}) {
  ctx.save(); ctx.translate(x, y); if (o.sc) ctx.scale(o.sc, o.sc); if (o.rot) ctx.rotate(o.rot);
  ctx.font = `900 ${size}px Inter`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.letterSpacing = o.ls || '0px';
  const w = ctx.measureText(t).width, k = o.maxW && w > o.maxW ? o.maxW / w : 1; if (k < 1) ctx.scale(k, k);
  if (o.stroke) { ctx.lineWidth = o.stroke; ctx.strokeStyle = o.strokeC || '#1A1A1E'; ctx.strokeText(t, 0, 0); }
  ctx.fillStyle = fill; ctx.fillText(t, 0, 0); ctx.restore(); return w * k;
}
export function overlays(sh, hud, lt, key, d) {
  ctx.globalAlpha = 1;
  if (hud) { ctx.font = '900 38px Inter'; ctx.letterSpacing = '1px'; const w = Math.min(ctx.measureText(hud).width, 760) + 48;
    ctx.fillStyle = 'rgba(20,24,36,0.78)'; rr(48, 92, w, 70, 18); ctx.fill(); ctx.fillStyle = '#FFD23F'; rr(48, 92, 10, 70, [18, 0, 0, 18]); ctx.fill();
    text(hud, 48 + 30, 128, 38, '#ffffff', { align: 'left', maxW: 760 }); }
  if (sh.pill) { const p = eob(seg(lt, 0, 0.28)); ctx.font = '900 62px Inter'; const w = Math.min(ctx.measureText(sh.pill).width, 860) + 80;
    ctx.save(); ctx.translate(540, 300); ctx.scale(p, p); ctx.fillStyle = '#D62839'; ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6; rr(-w / 2, -50, w, 100, 50); ctx.fill(); ctx.restore();
    if (p > 0.05) text(sh.pill.toUpperCase(), 540, 302, 62, '#ffffff', { sc: p, maxW: 860 }); }
  if (sh.head) { const at = Math.min(key, 0.3), p = eob(seg(lt, at, at + 0.3)); if (p > 0) {
    const y = sh.pill ? 470 : 380, g = ctx.createLinearGradient(0, y - 70, 0, y + 70); g.addColorStop(0, '#FFF1A8'); g.addColorStop(0.5, '#FFD23F'); g.addColorStop(1, '#F29E1F');
    text(String(sh.head).toUpperCase(), 540, y, 150, g, { sc: p, stroke: 26, maxW: 940, ls: '-3px' });
    if (sh.sub) text(String(sh.sub), 540, y + 110, 56, '#ffffff', { sc: p, stroke: 12, maxW: 900 }); } }
  if (sh.card) { const p = eob(seg(lt, key, key + 0.25)); if (p > 0) { const ok = sh.card === 'ok', t = (sh.cardText || (ok ? 'BIEN' : 'ERROR')).toUpperCase();
    ctx.font = '900 76px Inter'; const w = Math.min(ctx.measureText(t).width, 880) + 90;
    ctx.save(); ctx.translate(540, 760); ctx.rotate(ok ? 0.02 : -0.03); ctx.scale(p, p); ctx.fillStyle = ok ? '#2E9E4F' : '#E0202A'; ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8; rr(-w / 2, -66, w, 132, 22); ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.lineWidth = 6; ctx.strokeStyle = '#ffffff'; rr(-w / 2 + 10, -56, w - 20, 112, 16); ctx.stroke(); ctx.restore();
    text(t, 540, 762, 76, '#ffffff', { sc: p, rot: ok ? 0.02 : -0.03, maxW: 880 }); } }
  if (sh.say) { const p = eob(seg(lt, 0.2, 0.45)); if (p > 0) { const t = String(sh.say); ctx.font = '900 66px Inter'; const w = Math.min(ctx.measureText(t).width, 720) + 80, x = sh.sayX ?? 640, y = sh.sayY ?? 640;
    ctx.save(); ctx.translate(x, y); ctx.scale(p, p); ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#1A1A1E'; ctx.lineWidth = 8; rr(-w / 2, -60, w, 120, 50); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-40, 56); ctx.lineTo(-90, 130); ctx.lineTo(10, 58); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillRect(-46, 46, 62, 14); ctx.restore();
    text(t.toUpperCase(), x, y + 2, 66, '#1A1A1E', { sc: p, maxW: 720 }); } }
}
