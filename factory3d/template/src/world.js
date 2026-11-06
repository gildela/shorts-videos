// FÁBRICA 3D · world kit: cartoon 3D characters, props and sets built from primitives (three.js, no assets).
// Everything is a pure function of time: build(spec) once per shot, then pose(lt) each frame.
import * as THREE from './vendor/three.module.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';

export const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const cache = new Map();
const MAT = (color, o = {}) => {
  const k = color + JSON.stringify(o);
  if (!cache.has(k)) cache.set(k, new THREE.MeshStandardMaterial({ color, roughness: o.r ?? 0.62, metalness: o.m ?? 0, emissive: o.e || '#000', emissiveIntensity: o.ei ?? 1, transparent: o.op != null, opacity: o.op ?? 1, flatShading: !!o.flat }));
  return cache.get(k);
};
const G = {};
const geo = (k, f) => G[k] || (G[k] = f());
const sph = () => geo('sph', () => new THREE.SphereGeometry(1, 28, 20));
const box = (w, h, d, r = 0.06) => geo(`rb${w},${h},${d},${r}`, () => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2.01, h / 2.01, d / 2.01)));
const cyl = (a, b, h, n = 20) => geo(`cy${a},${b},${h},${n}`, () => new THREE.CylinderGeometry(a, b, h, n));
const cap = (r, l) => geo(`cp${r},${l}`, () => new THREE.CapsuleGeometry(r, l, 6, 14));
const cone = (r, h, n = 16) => geo(`co${r},${h},${n}`, () => new THREE.ConeGeometry(r, h, n));
const tor = (r, t, arc = Math.PI * 2) => geo(`to${r},${t},${arc}`, () => new THREE.TorusGeometry(r, t, 10, 24, arc));

function M(g, color, o = {}) {
  const m = new THREE.Mesh(g, typeof color === 'string' ? MAT(color, o) : color);
  m.castShadow = o.shadow !== false; m.receiveShadow = true; return m;
}
function at(obj, x = 0, y = 0, z = 0, s = 1, ry = 0) { obj.position.set(x, y, z); if (Array.isArray(s)) obj.scale.set(...s); else obj.scale.setScalar(s); obj.rotation.y = ry; return obj; }
const grp = (...c) => { const g = new THREE.Group(); c.forEach((x) => x && g.add(x)); return g; };

// ---------------------------------------------------------------- characters
// Pixar-ish proportions: big head, big eyes, rounded body. Each returns {root, pose(lt, opts)}.
const LOOKS = {
  tu: { skin: '#f2c29b', top: '#3f9b5a', bottom: '#2f3a56', hair: '#3a2618', hairStyle: 'messy', shoe: '#f4f4f4' },
  chica: { skin: '#e8b48f', top: '#e85d75', bottom: '#33415c', hair: '#6b3b1f', hairStyle: 'long', shoe: '#fff' },
  profe: { skin: '#f0c5a5', top: '#7a6a58', bottom: '#3b3b44', hair: '#9a9a9a', hairStyle: 'bald', shoe: '#2b1d14', glasses: true, tall: 1.06 },
  abuela: { skin: '#f0c5a5', top: '#8e6bb3', bottom: '#5b4a6e', hair: '#e8e8e8', hairStyle: 'bun', shoe: '#2b1d14', glasses: true, tall: 0.92 },
  jefe: { skin: '#d9a07a', top: '#2c3e66', bottom: '#2c3e66', hair: '#1c1c1c', hairStyle: 'short', shoe: '#111', tie: '#c0392b', tall: 1.05 },
  nino: { skin: '#f2c29b', top: '#f2b134', bottom: '#3567b5', hair: '#5a3a22', hairStyle: 'messy', shoe: '#fff', tall: 0.72 },
  medico: { skin: '#c98e6b', top: '#e9f1f5', bottom: '#7fb3c9', hair: '#1c1c1c', hairStyle: 'short', shoe: '#fff' },
  poli: { skin: '#e3ad88', top: '#1f3b73', bottom: '#1a2440', hair: '#2b1d14', hairStyle: 'cap', shoe: '#111' },
  zombi: { skin: '#9cc28a', top: '#6b7a8f', bottom: '#4a4038', hair: '#2b2b20', hairStyle: 'messy', shoe: '#3a3a3a', zombie: true },
  gente: { skin: '#e9b993', top: '#5d8aa8', bottom: '#444', hair: '#3a2618', hairStyle: 'short', shoe: '#ddd' },
};
const CROWD_TOPS = ['#5d8aa8', '#c0504d', '#e0a43a', '#8064a2', '#4bacc6', '#9bbb59', '#f79646', '#d16ba5'];

function face(look, root) {
  const eyes = [], brows = [];
  for (const s of [-1, 1]) {
    const w = M(sph(), '#ffffff', { r: 0.25 }); at(w, s * 0.17, 0.06, 0.38, [0.13, 0.16, 0.08]);
    const iris = M(sph(), look.zombie ? '#d8d65a' : '#3b2a1e', { r: 0.2 }); at(iris, 0, 0, 0.75, [0.55, 0.55, 0.4]); w.add(iris);
    const pupil = M(sph(), '#0b0b0b', { r: 0.1 }); at(pupil, 0, 0, 0.32, [0.55, 0.55, 0.5]); iris.add(pupil);
    const glint = M(sph(), '#ffffff', { e: '#ffffff', ei: 0.6 }); at(glint, 0.3, 0.3, 0.45, 0.22); iris.add(glint);
    root.add(w); eyes.push({ w, iris });
    const b = M(box(0.16, 0.035, 0.04, 0.015), look.hair === '#e8e8e8' ? '#bdbdbd' : '#2b1d14'); at(b, s * 0.17, 0.27, 0.4); root.add(b); brows.push(b);
  }
  const mouth = new THREE.Group(); at(mouth, 0, -0.17, 0.4); root.add(mouth);
  const smile = M(tor(0.09, 0.022, Math.PI), '#5a1e1e'); smile.rotation.z = Math.PI; mouth.add(smile);
  const open = M(sph(), '#4a1414'); at(open, 0, -0.02, 0, [0.09, 0.11, 0.05]); mouth.add(open);
  const flat = M(box(0.14, 0.03, 0.03, 0.012), '#5a1e1e'); mouth.add(flat);
  const nose = M(sph(), look.skin); at(nose, 0, -0.03, 0.43, [0.06, 0.05, 0.05]); root.add(nose);
  if (look.glasses) for (const s of [-1, 1]) { const g = M(tor(0.12, 0.014), '#222'); at(g, s * 0.17, 0.06, 0.45); root.add(g); }
  return { eyes, brows, mouth: { smile, open, flat } };
}
function setFace(F, mood, lt, seed) {
  const blink = (lt * 1.0 + seed) % 3.1 < 0.12 ? 0.12 : 1;
  const wide = { shock: 1.3, scared: 1.2, angry: 0.75, cool: 0.55, cry: 0.9, dead: 0.15 }[mood] ?? 1;
  F.eyes.forEach(({ w, iris }, i) => { w.scale.set(0.13 * (mood === 'shock' ? 1.1 : 1), 0.16 * wide * blink, 0.08); iris.scale.setScalar(mood === 'shock' || mood === 'scared' ? 0.42 : 0.55); iris.position.x = Math.sin(lt * 0.7 + seed) * 0.12; });
  const bAng = { angry: 0.45, scared: -0.4, shock: -0.25, cry: -0.45, cool: 0.1 }[mood] ?? 0;
  F.brows.forEach((b, i) => { b.rotation.z = (i ? -1 : 1) * bAng; b.position.y = 0.27 + (mood === 'shock' ? 0.07 : mood === 'angry' ? -0.03 : 0); });
  const m = F.mouth; m.smile.visible = ['smile', 'calm', 'cool'].includes(mood) || !mood; m.open.visible = ['shock', 'scared', 'cry', 'angry'].includes(mood); m.flat.visible = mood === 'dead';
  if (m.open.visible) m.open.scale.set(mood === 'angry' ? 0.12 : 0.09, (mood === 'shock' ? 0.13 : 0.08) * (1 + 0.15 * Math.sin(lt * 20)), 0.05);
  if (mood === 'calm') m.smile.scale.set(0.7, 0.5, 1); else m.smile.scale.set(1, 1, 1);
}

export function person(kind = 'tu', o = {}) {
  const look = { ...(LOOKS[kind] || LOOKS.gente) };
  if (o.top) look.top = o.top;
  if (kind === 'gente') { look.top = CROWD_TOPS[(o.seed || 0) % CROWD_TOPS.length]; look.hair = ['#3a2618', '#1c1c1c', '#8a5a2b', '#d9b26b'][(o.seed || 0) % 4]; look.skin = ['#f2c29b', '#c98e6b', '#e9b993', '#8d5a3c'][(o.seed || 0) % 4]; }
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const T = look.tall || 1;
  // legs
  const legs = [-1, 1].map((s) => { const hip = new THREE.Group(); at(hip, s * 0.15, 0.78, 0); const l = M(cap(0.12, 0.5), look.bottom); at(l, 0, -0.36, 0); hip.add(l);
    const sh = M(box(0.22, 0.13, 0.32, 0.06), look.shoe); at(sh, 0, -0.72, 0.06); hip.add(sh); body.add(hip); return hip; });
  const torso = new THREE.Group(); at(torso, 0, 0.82, 0); body.add(torso);
  const chest = M(cap(0.3, 0.38), look.top); at(chest, 0, 0.36, 0, [1, 1, 0.82]); torso.add(chest);
  if (kind === 'tu') { const hood = M(tor(0.22, 0.07), look.top); at(hood, 0, 0.72, -0.08); hood.rotation.x = Math.PI / 2.4; torso.add(hood);
    const pocket = M(box(0.34, 0.12, 0.04, 0.03), '#358a4d'); at(pocket, 0, 0.2, 0.26); torso.add(pocket); }
  if (look.tie) { const t = M(box(0.08, 0.36, 0.03, 0.01), look.tie); at(t, 0, 0.48, 0.27); torso.add(t); }
  if (kind === 'medico') { const st = M(tor(0.16, 0.018, Math.PI), '#333'); at(st, 0, 0.62, 0.22); st.rotation.z = Math.PI; torso.add(st); }
  const arms = [-1, 1].map((s) => { const sh = new THREE.Group(); at(sh, s * 0.36, 0.62, 0); const a = M(cap(0.09, 0.42), look.top); at(a, 0, -0.27, 0); sh.add(a);
    const hand = M(sph(), look.skin); at(hand, 0, -0.56, 0, 0.11); sh.add(hand); torso.add(sh); return { sh, hand }; });
  const neck = new THREE.Group(); at(neck, 0, 0.78, 0); torso.add(neck);
  const head = new THREE.Group(); at(head, 0, 0.42, 0); neck.add(head);
  const skull = M(sph(), look.skin, { r: 0.55 }); at(skull, 0, 0, 0, [0.46, 0.44, 0.44]); head.add(skull);
  for (const s of [-1, 1]) { const e = M(sph(), look.skin); at(e, s * 0.45, 0, 0, [0.07, 0.1, 0.06]); head.add(e); }
  // hair
  const H = look.hair, hs = look.hairStyle;
  if (hs === 'messy') { const c = M(sph(), H, { r: 0.8 }); at(c, 0, 0.12, -0.07, [0.48, 0.37, 0.46]); head.add(c);
    for (let i = 0; i < 7; i++) { const t = M(cone(0.1, 0.24, 6), H); const a = -1.2 + i * 0.4; at(t, Math.sin(a) * 0.25, 0.42, 0.12 - Math.abs(a) * 0.05); t.rotation.set(0.5, 0, -a * 0.8); head.add(t); }
    const fr = M(sph(), H); at(fr, 0.05, 0.3, 0.27, [0.3, 0.12, 0.14]); fr.rotation.z = -0.3; head.add(fr); }
  else if (hs === 'long') { const c = M(sph(), H, { r: 0.7 }); at(c, 0, 0.12, -0.06, [0.5, 0.38, 0.48]); head.add(c); const b = M(cap(0.36, 0.5), H); at(b, 0, -0.25, -0.16, [1.25, 1, 0.6]); head.add(b);
    const fr = M(sph(), H); at(fr, -0.1, 0.32, 0.25, [0.32, 0.12, 0.14]); fr.rotation.z = 0.35; head.add(fr); }
  else if (hs === 'short') { const c = M(sph(), H, { r: 0.8 }); at(c, 0, 0.12, -0.07, [0.48, 0.36, 0.46]); head.add(c); }
  else if (hs === 'bun') { const c = M(sph(), H); at(c, 0, 0.16, -0.05, [0.47, 0.32, 0.45]); head.add(c); const b = M(sph(), H); at(b, 0, 0.45, -0.12, 0.17); head.add(b); }
  else if (hs === 'bald') { for (const s of [-1, 1]) { const c = M(sph(), H); at(c, s * 0.4, 0.05, -0.08, [0.1, 0.18, 0.26]); head.add(c); } }
  else if (hs === 'cap') { const c = M(sph(), '#1f3b73'); at(c, 0, 0.2, 0, [0.48, 0.3, 0.47]); head.add(c); const v = M(box(0.4, 0.04, 0.26, 0.02), '#152a52'); at(v, 0, 0.18, 0.42); head.add(v); }
  const F = face(look, head);
  if (look.zombie) { const sc = M(box(0.1, 0.02, 0.02, 0.008), '#7a2a2a'); at(sc, 0.22, 0.22, 0.38); sc.rotation.z = 0.6; head.add(sc); }
  root.scale.setScalar(T * (o.scale || 1));
  const seed = (o.seed || 0) * 1.7;
  const held = new THREE.Group(); arms[1].hand.add(held);
  const pose = (lt, mood = 'calm', act = 'idle') => {
    const br = Math.sin(lt * 2.4 + seed) * 0.02; body.position.set(0, 0, 0); body.rotation.set(0, 0, 0);
    torso.rotation.set(0, 0, 0); torso.position.y = 0.82 + br; neck.rotation.set(0, 0, 0); head.rotation.set(0, 0, 0);
    legs.forEach((l) => l.rotation.set(0, 0, 0)); arms.forEach(({ sh }, i) => sh.rotation.set(0, 0, (i ? 1 : -1) * 0.12));
    const L = arms[0].sh, R = arms[1].sh; let m = mood;
    head.rotation.z = Math.sin(lt * 1.3 + seed) * 0.04; head.rotation.y = Math.sin(lt * 0.9 + seed) * 0.08;
    if (look.zombie && act === 'idle') act = 'zombie';
    switch (act) {
      case 'run': { const w = Math.sin(lt * 14 + seed); legs[0].rotation.x = w * 0.9; legs[1].rotation.x = -w * 0.9; L.rotation.x = -w * 1.0; R.rotation.x = w * 1.0; torso.rotation.x = 0.25; body.position.y = Math.abs(Math.cos(lt * 14 + seed)) * 0.12; break; }
      case 'walk': { const w = Math.sin(lt * 7 + seed); legs[0].rotation.x = w * 0.5; legs[1].rotation.x = -w * 0.5; L.rotation.x = -w * 0.4; R.rotation.x = w * 0.4; body.position.y = Math.abs(Math.cos(lt * 7)) * 0.04; break; }
      case 'zombie': { const w = Math.sin(lt * 4 + seed); legs[0].rotation.x = w * 0.35; legs[1].rotation.x = -w * 0.35; L.rotation.x = -1.45 + w * 0.1; R.rotation.x = -1.5 - w * 0.1; head.rotation.z = 0.25 + w * 0.08; torso.rotation.x = 0.12; break; }
      case 'scared': { const sh = Math.sin(lt * 45) * 0.03; body.position.x = sh; L.rotation.set(-0.3, 0, -2.3); R.rotation.set(-0.3, 0, 2.3); torso.rotation.x = -0.1; m = mood === 'calm' ? 'scared' : mood; break; }
      case 'point': R.rotation.set(-1.5, 0, 0.1); break;
      case 'wave': R.rotation.set(0, 0, 2.6 + Math.sin(lt * 9) * 0.35); break;
      case 'celebrate': { const b = Math.abs(Math.sin(lt * 6)); L.rotation.z = -2.7; R.rotation.z = 2.7; body.position.y = b * 0.22; break; }
      case 'think': R.rotation.set(-2.2, 0, 0.9); head.rotation.z = 0.15; head.rotation.x = -0.1; break;
      case 'hold': R.rotation.set(-1.1, 0, 0.15); L.rotation.set(-1.1, 0, -0.15); break;
      case 'hide': case 'crouch': body.position.y = -0.38; legs.forEach((l, i) => l.rotation.x = -1.3); torso.rotation.x = 0.55; L.rotation.set(-2.6, 0, -0.4); R.rotation.set(-2.6, 0, 0.4); neck.rotation.x = 0.3; break;
      case 'sit': body.position.y = -0.36; legs.forEach((l) => l.rotation.x = -1.5); L.rotation.x = -0.6; R.rotation.x = -0.6; break;
      case 'lie': body.rotation.x = -Math.PI / 2; body.position.set(0, 0.3, 0.85); break;
      case 'fall': { const k = clamp(lt / 0.6); body.rotation.x = -Math.PI / 2 * k; body.position.set(0, 0.3 * k, 0.85 * k); L.rotation.z = -2 * k; R.rotation.z = 2 * k; break; }
      case 'jump': { const p = (lt * 1.6 + seed) % 1; body.position.y = Math.sin(p * Math.PI) * 0.8; L.rotation.z = -2.5; R.rotation.z = 2.5; legs[0].rotation.x = -0.6; legs[1].rotation.x = 0.3; break; }
      case 'talk': R.rotation.set(-0.9, 0, 0.3 + Math.sin(lt * 5) * 0.3); break;
      case 'facepalm': R.rotation.set(-2.6, 0, 0.6); neck.rotation.x = 0.25; break;
    }
    if (m === 'cry') head.rotation.x = 0.15;
    setFace(F, m, lt, seed);
    if (/scared|shock/.test(m) && act !== 'scared') body.position.x += Math.sin(lt * 40) * 0.012;
  };
  return { root, pose, held, head };
}

// animals & monsters ------------------------------------------------
function eyePair(parent, x, y, z, s = 1, col = '#2a1a10') {
  const out = []; for (const sx of [-1, 1]) { const w = M(sph(), '#fff', { r: 0.2 }); at(w, sx * x, y, z, [0.1 * s, 0.12 * s, 0.07 * s]); const i = M(sph(), col); at(i, 0, 0, 0.8, 0.55); w.add(i); const g = M(sph(), '#fff', { e: '#fff', ei: 0.5 }); at(g, 0.3, 0.3, 0.5, 0.25); i.add(g); parent.add(w); out.push(w); } return out;
}
export function creature(kind, o = {}) {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body); let pose;
  if (kind === 'oso') {
    const c = '#7a4e2d', l = '#c49a6c';
    const b = M(sph(), c, { r: 0.85 }); at(b, 0, 1.25, 0, [0.8, 0.95, 0.7]); body.add(b);
    const belly = M(sph(), l); at(belly, 0, 1.15, 0.38, [0.5, 0.62, 0.35]); body.add(belly);
    const head = new THREE.Group(); at(head, 0, 2.35, 0.1); body.add(head);
    head.add(at(M(sph(), c, { r: 0.85 }), 0, 0, 0, [0.55, 0.5, 0.5])); head.add(at(M(sph(), l), 0, -0.1, 0.42, [0.26, 0.2, 0.2])); head.add(at(M(sph(), '#1a1a1a'), 0, -0.02, 0.6, [0.09, 0.07, 0.06]));
    for (const s of [-1, 1]) { head.add(at(M(sph(), c), s * 0.42, 0.38, -0.05, 0.17)); head.add(at(M(sph(), l), s * 0.42, 0.38, 0.03, 0.09)); }
    const ey = eyePair(head, 0.18, 0.12, 0.42, 0.75);
    const mouth = M(sph(), '#5a1515'); at(mouth, 0, -0.24, 0.5, [0.14, 0.05, 0.05]); head.add(mouth);
    const arms = [-1, 1].map((s) => { const sh = new THREE.Group(); at(sh, s * 0.68, 1.75, 0.1); const a = M(cap(0.2, 0.6), c); at(a, 0, -0.4, 0); sh.add(a);
      for (let k = -1; k <= 1; k++) { const cl = M(cone(0.04, 0.14, 6), '#eee'); at(cl, k * 0.08, -0.9, 0.1); cl.rotation.x = Math.PI; sh.add(cl); } body.add(sh); return sh; });
    for (const s of [-1, 1]) body.add(at(M(cap(0.24, 0.35), c), s * 0.38, 0.35, 0));
    pose = (lt, mood, act) => { const roar = act === 'roar' || mood === 'angry'; mouth.scale.y = roar ? 0.16 + Math.sin(lt * 18) * 0.03 : 0.05;
      arms.forEach((a, i) => a.rotation.set(roar ? -2.2 : -0.2 + Math.sin(lt * 2 + i) * 0.1, 0, (i ? 1 : -1) * (roar ? 0.5 : 0.15)));
      body.position.y = act === 'run' ? Math.abs(Math.sin(lt * 9)) * 0.2 : Math.sin(lt * 2) * 0.02; head.rotation.y = Math.sin(lt * 0.8) * 0.15;
      ey.forEach((e) => e.scale.y = 0.09 * ((lt * 1.1) % 3 < 0.1 ? 0.15 : 1)); };
  } else if (kind === 'tiburon') {
    const c = '#6d8ca8';
    const b = M(sph(), c, { r: 0.4 }); at(b, 0, 0.6, 0, [0.7, 0.6, 1.7]); body.add(b);
    body.add(at(M(sph(), '#e9eef2'), 0, 0.42, 0.2, [0.55, 0.38, 1.4]));
    const fin = M(cone(0.35, 0.9, 4), c); at(fin, 0, 1.35, -0.1); fin.rotation.x = -0.3; body.add(fin);
    const tail = M(cone(0.35, 0.9, 4), c); at(tail, 0, 0.7, -1.9); tail.rotation.x = -Math.PI / 2; body.add(tail);
    const jaw = M(sph(), '#7a1a1a'); at(jaw, 0, 0.42, 1.45, [0.38, 0.12, 0.2]); body.add(jaw);
    for (let k = -3; k <= 3; k++) { const t = M(cone(0.04, 0.1, 4), '#fff'); at(t, k * 0.1, 0.5, 1.55 - Math.abs(k) * 0.03); t.rotation.x = Math.PI; body.add(t); }
    eyePair(body, 0.42, 0.8, 1.15, 0.9);
    pose = (lt) => { body.rotation.y = Math.sin(lt * 3) * 0.12; tail.rotation.y = Math.sin(lt * 6) * 0.5; jaw.scale.y = 0.08 + Math.abs(Math.sin(lt * 4)) * 0.12; body.position.y = Math.sin(lt * 2) * 0.08; };
  } else if (kind === 'dino') {
    const c = '#5fa04e';
    const b = M(sph(), c); at(b, 0, 1.6, 0, [0.7, 0.8, 1.1]); body.add(b);
    const head = new THREE.Group(); at(head, 0, 2.9, 0.7); body.add(head);
    head.add(at(M(box(0.8, 0.6, 1.1, 0.25), c), 0, 0, 0.2)); const jaw = M(box(0.7, 0.2, 0.9, 0.08), '#4e8a3f'); at(jaw, 0, -0.35, 0.25); head.add(jaw);
    for (let k = -2; k <= 2; k++) { const t = M(cone(0.05, 0.14, 4), '#fff'); at(t, k * 0.13, -0.24, 0.7); t.rotation.x = Math.PI; head.add(t); }
    eyePair(head, 0.3, 0.25, 0.3, 0.9, '#a35a00');
    body.add(at(M(cap(0.3, 0.5), c), 0, 2.25, 0.4)); const tail = M(cone(0.4, 2.2, 10), c); at(tail, 0, 1.4, -1.4); tail.rotation.x = -1.8; body.add(tail);
    const legs = [-1, 1].map((s) => { const l = M(cap(0.25, 0.7), c); at(l, s * 0.45, 0.6, 0); body.add(l); return l; });
    for (const s of [-1, 1]) { const a = M(cap(0.08, 0.25), c); at(a, s * 0.45, 1.9, 0.75); a.rotation.x = -1; body.add(a); }
    pose = (lt, mood, act) => { jaw.rotation.x = act === 'roar' || mood === 'angry' ? 0.4 + Math.sin(lt * 15) * 0.1 : Math.abs(Math.sin(lt * 2)) * 0.1; head.rotation.y = Math.sin(lt * 0.7) * 0.2;
      const w = act === 'run' || act === 'walk' ? Math.sin(lt * (act === 'run' ? 10 : 5)) : 0; legs[0].rotation.x = w * 0.6; legs[1].rotation.x = -w * 0.6; tail.rotation.z = Math.sin(lt * 2) * 0.2; };
  } else if (kind === 'alien') {
    const c = '#8fd96b';
    const b = M(cap(0.3, 0.4), '#b7c3d0', { m: 0.4, r: 0.3 }); at(b, 0, 0.9, 0); body.add(b);
    const head = new THREE.Group(); at(head, 0, 1.75, 0); body.add(head);
    head.add(at(M(sph(), c), 0, 0, 0, [0.55, 0.5, 0.5])); eyePair(head, 0.2, 0.05, 0.4, 1.3, '#111');
    for (const s of [-1, 1]) { const an = M(cyl(0.02, 0.02, 0.4, 6), c); at(an, s * 0.18, 0.55, 0); an.rotation.z = -s * 0.3; head.add(an); head.add(at(M(sph(), '#ff5ad1', { e: '#ff5ad1', ei: 0.6 }), s * 0.25, 0.75, 0, 0.07)); }
    for (const s of [-1, 1]) body.add(at(M(cap(0.08, 0.45), c), s * 0.38, 0.95, 0));
    for (const s of [-1, 1]) body.add(at(M(cap(0.1, 0.35), c), s * 0.15, 0.3, 0));
    pose = (lt) => { head.rotation.z = Math.sin(lt * 2) * 0.12; body.position.y = Math.sin(lt * 3) * 0.06 + 0.06; };
  } else if (kind === 'perro' || kind === 'gato') {
    const c = kind === 'perro' ? '#c98b4f' : '#8d8d8d';
    const b = M(cap(0.28, 0.6), c); at(b, 0, 0.6, 0); b.rotation.x = Math.PI / 2; body.add(b);
    const head = new THREE.Group(); at(head, 0, 0.95, 0.55); body.add(head); head.add(at(M(sph(), c), 0, 0, 0, 0.32)); head.add(at(M(sph(), '#222'), 0, -0.02, 0.33, 0.05));
    if (kind === 'perro') { head.add(at(M(sph(), '#f2d0a5'), 0, -0.08, 0.22, [0.17, 0.13, 0.14])); for (const s of [-1, 1]) { const e = M(sph(), '#8a5a2b'); at(e, s * 0.28, 0.02, -0.02, [0.08, 0.2, 0.12]); head.add(e); } }
    else for (const s of [-1, 1]) { const e = M(cone(0.1, 0.2, 4), c); at(e, s * 0.17, 0.3, 0); head.add(e); }
    eyePair(head, 0.12, 0.08, 0.26, 0.7);
    for (const [x, z] of [[-0.16, 0.3], [0.16, 0.3], [-0.16, -0.3], [0.16, -0.3]]) body.add(at(M(cap(0.07, 0.3), c), x, 0.22, z));
    const tail = M(cap(0.05, 0.4), c); at(tail, 0, 0.8, -0.55); tail.rotation.x = -0.7; body.add(tail);
    pose = (lt) => { tail.rotation.z = Math.sin(lt * 12) * 0.6; head.rotation.z = Math.sin(lt * 2) * 0.1; };
  } else if (kind === 'fantasma') {
    const b = M(cap(0.5, 0.8), '#f4f7ff', { op: 0.88, e: '#cfe0ff', ei: 0.25 }); at(b, 0, 1.3, 0); body.add(b);
    eyePair(body, 0.17, 1.65, 0.42, 1.1, '#111');
    pose = (lt) => { body.position.y = Math.sin(lt * 2) * 0.15 + 0.2; body.rotation.z = Math.sin(lt * 1.5) * 0.08; };
  } else if (kind === 'robot') {
    const c = '#c8d0d8';
    body.add(at(M(box(0.8, 0.9, 0.55, 0.12), c, { m: 0.5, r: 0.35 }), 0, 1.1, 0));
    const head = new THREE.Group(); at(head, 0, 1.9, 0); body.add(head); head.add(M(box(0.6, 0.45, 0.5, 0.12), c, { m: 0.5, r: 0.3 }));
    for (const s of [-1, 1]) head.add(at(M(sph(), '#40c4ff', { e: '#40c4ff', ei: 1 }), s * 0.14, 0.03, 0.26, 0.07));
    for (const s of [-1, 1]) body.add(at(M(cap(0.1, 0.5), '#9aa4ae', { m: 0.5 }), s * 0.52, 1.05, 0));
    for (const s of [-1, 1]) body.add(at(M(cap(0.12, 0.45), '#9aa4ae', { m: 0.5 }), s * 0.2, 0.35, 0));
    pose = (lt) => { head.rotation.y = Math.sin(lt * 1.2) * 0.3; };
  } else if (kind === 'paloma' || kind === 'pajaro') {
    const c = kind === 'paloma' ? '#8a93a6' : '#f2c14e';
    body.add(at(M(sph(), c), 0, 0.45, 0, [0.28, 0.25, 0.38])); const head = M(sph(), c); at(head, 0, 0.75, 0.25, 0.17); body.add(head);
    const bk = M(cone(0.05, 0.14, 6), '#f0a020'); at(bk, 0, 0.73, 0.45); bk.rotation.x = Math.PI / 2; body.add(bk); eyePair(body, 0.08, 0.8, 0.38, 0.5);
    pose = (lt) => { head.position.z = 0.25 + Math.sin(lt * 8) * 0.05; };
  } else return null;
  root.scale.setScalar(o.scale || 1);
  return { root, pose: pose || (() => {}), held: null };
}

// ---------------------------------------------------------------- props
// Every prop: unit-ish size, origin on the floor. Unknown names fall back to a labelled crate (qa.py warns).
const P = {
  libro: () => grp(at(M(box(0.5, 0.12, 0.7, 0.03), '#c0392b'), 0, 0.06), at(M(box(0.47, 0.1, 0.66, 0.01), '#f5f0e1'), 0.02, 0.06)),
  diccionario: () => grp(at(M(box(0.6, 0.35, 0.85, 0.04), '#1f4e8c'), 0, 0.175), at(M(box(0.57, 0.31, 0.81, 0.01), '#f5f0e1'), 0.02, 0.175)),
  movil: () => grp(at(M(box(0.22, 0.42, 0.04, 0.04), '#1b1b1f'), 0, 0.21), at(M(box(0.19, 0.37, 0.01, 0.01), '#4fc3f7', { e: '#4fc3f7', ei: 0.6 }), 0, 0.21, 0.022)),
  boli: () => grp(at(M(cyl(0.02, 0.02, 0.4, 8), '#1e66d0'), 0, 0.2)),
  mochila: () => grp(at(M(box(0.5, 0.6, 0.3, 0.14), '#e67e22'), 0, 0.3), at(M(box(0.38, 0.22, 0.08, 0.06), '#d35400'), 0, 0.2, 0.17)),
  extintor: () => grp(at(M(cap(0.13, 0.45), '#d32f2f', { r: 0.3 }), 0, 0.36), at(M(cyl(0.04, 0.04, 0.1), '#222'), 0, 0.72), at(M(box(0.18, 0.04, 0.04, 0.01), '#222'), 0.08, 0.76)),
  sarten: () => grp(at(M(cyl(0.3, 0.26, 0.08, 24), '#2b2b2b', { m: 0.6, r: 0.4 }), 0, 0.04), at(M(box(0.45, 0.04, 0.06, 0.02), '#2b2b2b'), 0.5, 0.06)),
  olla: () => grp(at(M(cyl(0.3, 0.28, 0.4, 24), '#9aa4ae', { m: 0.7, r: 0.3 }), 0, 0.2)),
  fuego: () => fire(),
  hoguera: () => grp(...[0, 1, 2, 3].map((i) => { const l = M(cyl(0.06, 0.06, 0.7, 8), '#6b4226'); l.rotation.set(Math.PI / 2, i * 0.8, 0); l.position.y = 0.06; return l; }), fire(0.7)),
  cubo: () => grp(at(M(cyl(0.22, 0.17, 0.4, 20), '#3498db'), 0, 0.2), at(M(cyl(0.2, 0.2, 0.02, 20), '#5dade2', { op: 0.8 }), 0, 0.38)),
  toalla: () => grp(at(M(box(0.9, 0.02, 1.6, 0.01), '#ff6f91'), 0, 0.01), at(M(box(0.9, 0.021, 0.2, 0.01), '#fff'), 0, 0.011, 0.4)),
  sombrilla: () => grp(at(M(cyl(0.03, 0.03, 2.2, 8), '#eee'), 0, 1.1), at(M(cone(1.3, 0.5, 12), '#e74c3c'), 0, 2.3)),
  tabla: () => grp(at(M(cap(0.25, 1.4), '#f7dc6f'), 0, 0.95), at(M(box(0.05, 1.6, 0.06, 0.02), '#e74c3c'), 0, 0.95, 0.24)),
  ola: () => wave(),
  roca: () => grp(at(M(geo('ico', () => new THREE.IcosahedronGeometry(0.6, 1)), '#8d8d8d', { flat: true }), 0, 0.3, 0, [1, 0.6, 0.9])),
  arbol: () => grp(at(M(cyl(0.15, 0.22, 1.6, 10), '#7a5230'), 0, 0.8), at(M(sph(), '#4f9a3e', { r: 0.9 }), 0, 2.1, 0, 0.9), at(M(sph(), '#5fae4a'), 0.4, 1.9, 0.3, 0.6), at(M(sph(), '#448a36'), -0.45, 1.85, -0.1, 0.62)),
  pino: () => grp(at(M(cyl(0.12, 0.16, 0.8, 8), '#6b4a2e'), 0, 0.4), at(M(cone(0.9, 1.4, 9), '#2f6b3a'), 0, 1.3), at(M(cone(0.7, 1.1, 9), '#367a42'), 0, 1.9), at(M(cone(0.45, 0.8, 9), '#3e8a4a'), 0, 2.45)),
  tienda: () => grp(at(M(cone(1.2, 1.4, 4), '#f39c12', { flat: true }), 0, 0.7, 0, 1, Math.PI / 4), at(M(cone(0.42, 0.9, 3), '#7a4a00'), 0, 0.45, 0.62, [1, 1, 0.15])),
  linterna: () => grp(at(M(cyl(0.06, 0.08, 0.35, 12), '#f1c40f'), 0, 0.18), at(M(cyl(0.07, 0.07, 0.02, 12), '#fffbe0', { e: '#fff6c0', ei: 1.5 }), 0, 0.36)),
  nevera: () => grp(at(M(box(0.8, 1.8, 0.7, 0.08), '#eef2f5'), 0, 0.9), at(M(box(0.04, 0.4, 0.05, 0.02), '#999'), 0.3, 1.2, 0.37)),
  coche: () => car('#e74c3c'), bus: () => bus(),
  semaforo: () => grp(at(M(cyl(0.06, 0.06, 2.6, 8), '#333'), 0, 1.3), at(M(box(0.3, 0.8, 0.25, 0.06), '#222'), 0, 2.7), at(M(sph(), '#e74c3c', { e: '#e74c3c', ei: 1 }), 0, 2.95, 0.13, 0.08), at(M(sph(), '#555'), 0, 2.7, 0.13, 0.08), at(M(sph(), '#555'), 0, 2.45, 0.13, 0.08)),
  farola: () => grp(at(M(cyl(0.06, 0.08, 3.2, 8), '#2c3e50'), 0, 1.6), at(M(sph(), '#fff3c4', { e: '#ffe9a0', ei: 1.2 }), 0, 3.25, 0, 0.18)),
  banco: () => grp(at(M(box(1.6, 0.08, 0.45, 0.03), '#a0522d'), 0, 0.45), at(M(box(1.6, 0.4, 0.06, 0.03), '#a0522d'), 0, 0.7, -0.2), ...[-0.7, 0.7].map((x) => at(M(box(0.06, 0.45, 0.4, 0.02), '#333'), x, 0.22))),
  puerta: () => grp(at(M(box(1.0, 2.1, 0.1, 0.03), '#8b5a2b'), 0, 1.05), at(M(sph(), '#f1c40f', { m: 0.8 }), 0.38, 1.0, 0.07, 0.05)),
  mesa: () => grp(at(M(box(1.4, 0.08, 0.8, 0.03), '#b07a4a'), 0, 0.75), ...[[-0.62, -0.32], [0.62, -0.32], [-0.62, 0.32], [0.62, 0.32]].map(([x, z]) => at(M(box(0.06, 0.75, 0.06, 0.02), '#8a5a33'), x, 0.375, z))),
  silla: () => grp(at(M(box(0.45, 0.06, 0.45, 0.02), '#c0392b'), 0, 0.45), at(M(box(0.45, 0.5, 0.05, 0.02), '#c0392b'), 0, 0.72, -0.2), ...[[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].map(([x, z]) => at(M(cyl(0.02, 0.02, 0.45, 6), '#555'), x, 0.22, z))),
  pupitre: () => grp(at(M(box(0.9, 0.05, 0.55, 0.02), '#d9b38c'), 0, 0.72), ...[-0.4, 0.4].map((x) => at(M(box(0.05, 0.72, 0.5, 0.02), '#7f8c8d'), x, 0.36)), at(M(box(0.3, 0.01, 0.4, 0.005), '#fff'), 0.1, 0.75)),
  pizarra: () => grp(at(M(box(3.2, 1.4, 0.06, 0.03), '#2e5d4b'), 0, 1.7), at(M(box(3.35, 1.55, 0.04, 0.03), '#a0784f'), 0, 1.7, -0.03)),
  ordenador: () => grp(at(M(box(0.7, 0.45, 0.04, 0.02), '#222'), 0, 1.05), at(M(box(0.64, 0.39, 0.01, 0.01), '#4aa3df', { e: '#4aa3df', ei: 0.5 }), 0, 1.05, 0.025), at(M(box(0.1, 0.2, 0.06, 0.02), '#333'), 0, 0.82), at(M(box(0.5, 0.02, 0.18, 0.01), '#333'), 0, 0.76, 0.25)),
  cama: () => grp(at(M(box(1.5, 0.45, 2.1, 0.1), '#ecf0f1'), 0, 0.3), at(M(box(1.5, 0.12, 1.4, 0.06), '#5b8def'), 0, 0.56, 0.3), at(M(box(0.6, 0.15, 0.35, 0.07), '#fff'), 0, 0.6, -0.75), at(M(box(1.6, 0.9, 0.1, 0.04), '#8b5a2b'), 0, 0.5, -1.05)),
  sofa: () => grp(at(M(box(2.0, 0.45, 0.85, 0.15), '#c0504d'), 0, 0.3), at(M(box(2.0, 0.6, 0.25, 0.12), '#a8403d'), 0, 0.7, -0.32), ...[-1, 1].map((s) => at(M(box(0.25, 0.6, 0.85, 0.12), '#a8403d'), s * 0.95, 0.45))),
  tele: () => grp(at(M(box(1.6, 0.9, 0.06, 0.03), '#111'), 0, 1.3), at(M(box(1.52, 0.82, 0.01, 0.01), '#3c6fd1', { e: '#5b8ef0', ei: 0.7 }), 0, 1.3, 0.035), at(M(box(1.2, 0.5, 0.4, 0.05), '#6b4a2e'), 0, 0.25)),
  palomitas: () => grp(at(M(cyl(0.18, 0.13, 0.4, 12), '#e74c3c'), 0, 0.2), ...[0, 1, 2, 3, 4, 5].map((i) => at(M(sph(), '#fff4c2'), Math.sin(i) * 0.1, 0.42 + rnd(i) * 0.06, Math.cos(i * 2) * 0.1, 0.07))),
  butaca: () => grp(at(M(box(0.7, 0.4, 0.6, 0.1), '#9b1c2e'), 0, 0.35), at(M(box(0.7, 0.8, 0.15, 0.08), '#9b1c2e'), 0, 0.8, -0.3)),
  maleta: () => grp(at(M(box(0.5, 0.7, 0.25, 0.08), '#2980b9'), 0, 0.4), at(M(tor(0.08, 0.02, Math.PI), '#222'), 0, 0.78)),
  paraguas: () => grp(at(M(cyl(0.02, 0.02, 1.2, 6), '#333'), 0, 0.6), at(M(cone(0.7, 0.35, 10), '#2c3e50'), 0, 1.3)),
  rayo: () => bolt(),
  meteorito: () => grp(at(M(geo('ico', () => new THREE.IcosahedronGeometry(0.6, 1)), '#5a3d2b', { flat: true, e: '#ff5500', ei: 0.4 }), 0, 0.6), fire(1.2)),
  reloj: () => grp(at(M(cyl(0.35, 0.35, 0.08, 28), '#f5f5f5'), 0, 0.35, 0, 1), at(M(tor(0.35, 0.04), '#c0392b'), 0, 0.35, 0)),
  dinero: () => grp(...[0, 1, 2].map((i) => at(M(box(0.5, 0.06, 0.25, 0.01), '#2ecc71'), 0, 0.03 + i * 0.06, 0, 1, i * 0.3))),
  pizza: () => grp(at(M(cyl(0.4, 0.4, 0.05, 24), '#f0b356'), 0, 0.03), at(M(cyl(0.36, 0.36, 0.02, 24), '#e74c3c'), 0, 0.06), ...[0, 1, 2, 3].map((i) => at(M(cyl(0.05, 0.05, 0.02, 10), '#a93226'), Math.sin(i * 1.6) * 0.2, 0.075, Math.cos(i * 1.6) * 0.2))),
  cafe: () => grp(at(M(cyl(0.1, 0.08, 0.2, 14), '#fff'), 0, 0.1), at(M(tor(0.05, 0.015), '#fff'), 0.11, 0.1)),
  botiquin: () => grp(at(M(box(0.5, 0.35, 0.2, 0.05), '#fff'), 0, 0.18), at(M(box(0.22, 0.06, 0.01, 0.01), '#e74c3c'), 0, 0.18, 0.105), at(M(box(0.06, 0.22, 0.01, 0.01), '#e74c3c'), 0, 0.18, 0.106)),
  casco: () => grp(at(M(geo('hemi', () => new THREE.SphereGeometry(0.3, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2)), '#f1c40f'), 0, 0.02)),
  cuerda: () => grp(at(M(tor(0.25, 0.04), '#c8a165'), 0, 0.05, 0, 1), at(M(tor(0.2, 0.04), '#c8a165'), 0, 0.1, 0, 1)),
  escalera: () => grp(...[-0.3, 0.3].map((x) => at(M(box(0.06, 2.4, 0.06, 0.02), '#bdc3c7'), x, 1.2)), ...[0, 1, 2, 3, 4, 5].map((i) => at(M(box(0.6, 0.04, 0.05, 0.01), '#bdc3c7'), 0, 0.3 + i * 0.35))),
  caja: () => grp(at(M(box(0.7, 0.6, 0.7, 0.04), '#c69c6d'), 0, 0.3), at(M(box(0.71, 0.08, 0.2, 0.01), '#a37b4e'), 0, 0.6)),
  examen: () => grp(at(M(box(0.42, 0.01, 0.6, 0.004), '#ffffff'), 0, 0.01), ...[0, 1, 2, 3, 4].map((i) => at(M(box(0.3, 0.005, 0.02, 0.002), '#7f8c8d'), 0, 0.017, -0.2 + i * 0.09))),
  calavera: () => grp(at(M(sph(), '#f2f2f2'), 0, 0.25, 0, 0.25), ...[-1, 1].map((s) => at(M(sph(), '#111'), s * 0.09, 0.27, 0.19, 0.06))),
  bandera: () => grp(at(M(cyl(0.02, 0.02, 1.6, 6), '#999'), 0, 0.8), at(M(box(0.8, 0.5, 0.02, 0.01), '#c0392b'), 0.4, 1.35)),
  agua: () => grp(at(M(cyl(0.08, 0.08, 0.35, 14), '#7fd3ff', { op: 0.7 }), 0, 0.18), at(M(cyl(0.05, 0.05, 0.05, 10), '#1e88e5'), 0, 0.38)),
  salchicha: () => grp(at(M(cyl(0.012, 0.012, 0.9, 6), '#b08a5a'), 0, 0.45), at(M(cap(0.05, 0.22), '#b5442a', { r: 0.4 }), 0, 0.95)),
  espray: () => grp(at(M(cyl(0.07, 0.07, 0.32, 14), '#e67e22'), 0, 0.16), at(M(cyl(0.03, 0.03, 0.06, 8), '#222'), 0, 0.35)),
  bocadillo: () => grp(at(M(cap(0.1, 0.4), '#e2a35b'), 0, 0.1, 0, 1, 0)),
  nube: () => cloud(), sol: () => grp(at(M(sph(), '#ffd54a', { e: '#ffb300', ei: 0.9 }), 0, 0, 0, 0.8)),
  luna: () => grp(at(M(sph(), '#f4f1de', { e: '#f4f1de', ei: 0.4 }), 0, 0, 0, 0.7)),
  ambulancia: () => car('#ffffff', true), cohete: () => rocket(),
  ascensor: () => grp(at(M(box(1.6, 2.4, 0.1, 0.03), '#b8c2cc', { m: 0.6, r: 0.25 }), 0, 1.2), at(M(box(0.02, 2.3, 0.11, 0.01), '#555'), 0, 1.2)),
};
export const PROP_NAMES = Object.keys(P);
export function prop(name) { const f = P[name]; if (!f) return grp(at(M(box(0.6, 0.6, 0.6, 0.05), '#c69c6d'), 0, 0.3)); const g = f(); g.userData.kind = name; return g; }

function fire(s = 1) {
  const g = new THREE.Group(); g.userData.fire = [];
  for (let i = 0; i < 7; i++) { const c = i < 3 ? '#ff7a1a' : i < 5 ? '#ffb000' : '#fff176';
    const f = M(cone(0.22 - i * 0.02, 0.7 - i * 0.04, 8), c, { e: c, ei: 1.4, shadow: false }); at(f, (rnd(i) - 0.5) * 0.3, 0.3, (rnd(i + 5) - 0.5) * 0.3); g.add(f); g.userData.fire.push(f); }
  const light = new THREE.PointLight('#ff8a30', 6, 6, 1.6); light.position.y = 0.6; g.add(light); g.userData.light = light;
  g.scale.setScalar(s); return g;
}
function wave() {
  const g = new THREE.Group(); const m = MAT('#2f8fd6', { r: 0.25 }), f = MAT('#e8f6ff', { r: 0.4 });
  const body = new THREE.Mesh(geo('wv', () => new THREE.CylinderGeometry(3, 3, 12, 40, 1, true, 0, Math.PI * 1.15)), m); body.rotation.set(0, 0, Math.PI / 2); body.position.y = 3; body.material.side = THREE.DoubleSide; g.add(body);
  for (let i = 0; i < 12; i++) { const s = new THREE.Mesh(sph(), f); at(s, -5.5 + i, 5.9 + rnd(i) * 0.3, 0.6 + rnd(i + 3) * 0.6, 0.45 + rnd(i) * 0.3); g.add(s); }
  return g;
}
function bolt() { const g = new THREE.Group(); let p = new THREE.Vector3(0, 8, 0); const m = MAT('#fffbe0', { e: '#cfe8ff', ei: 2.5 });
  for (let i = 0; i < 8; i++) { const q = new THREE.Vector3((rnd(i) - 0.5) * 1.2, 8 - (i + 1), (rnd(i + 2) - 0.5) * 0.4); const d = q.clone().sub(p); const c = new THREE.Mesh(cyl(0.07, 0.07, d.length(), 6), m);
    c.position.copy(p.clone().add(q).multiplyScalar(0.5)); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); g.add(c); p = q; }
  const l = new THREE.PointLight('#cfe8ff', 30, 20); l.position.y = 4; g.add(l); return g; }
function cloud() { return grp(...[0, 1, 2, 3].map((i) => at(M(sph(), '#ffffff', { r: 0.9 }), (i - 1.5) * 0.7, rnd(i) * 0.3, 0, 0.6 + rnd(i + 1) * 0.3))); }
function car(color, amb) {
  const g = grp(at(M(box(1.9, 0.55, 3.6, 0.22), color, { r: 0.35, m: 0.2 }), 0, 0.6), at(M(box(1.6, 0.6, 1.9, 0.22), color, { r: 0.35 }), 0, 1.1, -0.2),
    at(M(box(1.5, 0.45, 1.92, 0.15), '#9fd3f5', { r: 0.1, m: 0.3 }), 0, 1.13, -0.2, [1.02, 1, 1]),
    ...[[-0.95, 1.1], [0.95, 1.1], [-0.95, -1.15], [0.95, -1.15]].map(([x, z]) => { const w = M(cyl(0.36, 0.36, 0.25, 18), '#1d1d1d'); w.rotation.z = Math.PI / 2; at(w, x, 0.36, z); return w; }),
    ...[-0.6, 0.6].map((x) => at(M(sph(), '#fff8d0', { e: '#fff8d0', ei: 0.8 }), x, 0.7, 1.8, [0.18, 0.12, 0.05])));
  if (amb) { g.add(at(M(box(1.9, 0.12, 3.62, 0.04), '#e74c3c'), 0, 0.75)); g.add(at(M(box(0.5, 0.15, 0.25, 0.05), '#2196f3', { e: '#2196f3', ei: 1 }), 0, 1.5, -0.2)); }
  return g;
}
function bus() { return grp(at(M(box(2.4, 2.6, 8, 0.25), '#f1c40f', { r: 0.4 }), 0, 1.6), at(M(box(2.42, 0.8, 7.2, 0.1), '#9fd3f5', { r: 0.1 }), 0, 2.2, 0.2),
  ...[[-1.2, 2.6], [1.2, 2.6], [-1.2, -2.6], [1.2, -2.6]].map(([x, z]) => { const w = M(cyl(0.5, 0.5, 0.3, 18), '#1d1d1d'); w.rotation.z = Math.PI / 2; at(w, x, 0.5, z); return w; })); }
function rocket() { return grp(at(M(cyl(0.4, 0.4, 2.2, 20), '#eceff1'), 0, 1.6), at(M(cone(0.4, 0.9, 20), '#e74c3c'), 0, 3.15), at(M(sph(), '#4fc3f7', { m: 0.4 }), 0, 2.1, 0.36, 0.16), ...[0, 1, 2].map((i) => { const f = M(box(0.06, 0.7, 0.5, 0.02), '#e74c3c'); const a = i * 2.1; at(f, Math.sin(a) * 0.42, 0.7, Math.cos(a) * 0.42, 1, a); return f; }), at(fire(1.2), 0, -0.1)); }

// ---------------------------------------------------------------- sets
// Each set: build(scene) adds floor, walls, furniture, background and its light rig. Hero stands at (0,0,0) facing +z (camera).
const SKY = { dia: ['#7ec8f2', '#d6efff'], tarde: ['#f6a35b', '#ffe0b0'], noche: ['#0e1638', '#2d3a6e'], tormenta: ['#2a3140', '#59657a'], interior: ['#f3e2c7', '#f3e2c7'], espacio: ['#03030c', '#0b0b26'] };
function skyDome(scene, k) {
  const [top, bot] = SKY[k] || SKY.dia; const g = new THREE.SphereGeometry(80, 24, 12);
  const m = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms: { a: { value: new THREE.Color(top) }, b: { value: new THREE.Color(bot) } },
    vertexShader: 'varying float h; void main(){ h = normalize(position).y; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);} ',
    fragmentShader: 'uniform vec3 a; uniform vec3 b; varying float h; void main(){ gl_FragColor = vec4(mix(b,a,clamp(h*1.6+0.1,0.0,1.0)),1.0);} ' });
  const sk = new THREE.Mesh(g, m); sk.userData.disp = true; scene.add(sk);
}
function lights(scene, mode) {
  const L = {
    dia: { hemi: ['#cfe8ff', '#8a6f4e', 1.1], sun: ['#fff1d6', 2.6, [6, 10, 7]], fog: '#cfe7f7' },
    tarde: { hemi: ['#ffd7a8', '#6b4a3a', 1.0], sun: ['#ffb070', 2.8, [-7, 6, 6]], fog: '#f7c99a' },
    noche: { hemi: ['#4a5a9a', '#1a1a2a', 0.7], sun: ['#9fb5ff', 1.0, [5, 9, 4]], fog: '#1a2246' },
    tormenta: { hemi: ['#8a96aa', '#2a2f38', 0.9], sun: ['#c8d4e8', 1.2, [4, 10, 5]], fog: '#4a5466' },
    interior: { hemi: ['#fff1dc', '#7a5a40', 1.15], sun: ['#ffe2b8', 2.2, [3, 8, 6]], fog: null },
    espacio: { hemi: ['#6a7aaa', '#111', 0.5], sun: ['#ffffff', 3, [8, 5, 6]], fog: null },
  }[mode] || {};
  scene.add(new THREE.HemisphereLight(...L.hemi));
  const s = new THREE.DirectionalLight(L.sun[0], L.sun[1]); s.position.set(...L.sun[2]); s.castShadow = true;
  s.shadow.mapSize.set(1024, 1024); Object.assign(s.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 0.5, far: 40 }); s.shadow.bias = -0.0008; s.shadow.radius = 4;
  scene.add(s); scene.add(s.target);
  const fill = new THREE.DirectionalLight('#ffd9b0', 0.5); fill.position.set(-5, 3, 8); scene.add(fill);
  if (L.fog) scene.fog = new THREE.Fog(L.fog, 18, 60);
}
const floor = (scene, c, w = 40, d = 40, o = {}) => { const f = M(geo(`fl${w},${d}`, () => new THREE.PlaneGeometry(w, d)), c, { r: o.r ?? 0.85, m: o.m }); f.rotation.x = -Math.PI / 2; f.castShadow = false; scene.add(f); return f; };
const wall = (scene, c, x, y, z, w, h, ry = 0) => { const m = M(box(w, h, 0.2, 0.02), c, { r: 0.9 }); at(m, x, y, z, 1, ry); m.castShadow = false; scene.add(m); return m; };
const add = (scene, name, x, z, ry = 0, s = 1, y = 0) => { const p = prop(name); at(p, x, y, z, s, ry); scene.add(p); return p; };
function room(scene, wallC, floorC, back = -4, opts = {}) {
  floor(scene, floorC, 30, 30); wall(scene, wallC, 0, 2, back, 16, 4); wall(scene, opts.side || wallC, -6, 2, back + 5, 10, 4, Math.PI / 2); wall(scene, opts.side || wallC, 6, 2, back + 5, 10, 4, -Math.PI / 2);
  const sk = M(box(16, 0.18, 0.06, 0.02), '#fff'); at(sk, 0, 0.09, back + 0.12); scene.add(sk);
  if (opts.window !== false) { const w = M(box(2.4, 1.6, 0.05, 0.03), '#bfe6ff', { e: '#dff3ff', ei: 0.35 }); at(w, opts.wx ?? 3.2, 2.3, back + 0.12); scene.add(w); const fr = M(box(2.6, 1.8, 0.03, 0.03), '#fff'); at(fr, opts.wx ?? 3.2, 2.3, back + 0.1); scene.add(fr); }
}
export const SETS = {
  aula: (s) => { skyDome(s, 'interior'); lights(s, 'interior'); room(s, '#f2d9a8', '#c99a66', -4, { wx: -3.4 }); add(s, 'pizarra', 0.6, -3.85);
    for (const [x, z] of [[-2.4, -1.4], [2.4, -1.4], [-2.4, 1.2], [2.4, 1.2], [-2.4, 3.6], [2.4, 3.6]]) { add(s, 'pupitre', x, z, Math.PI); add(s, 'silla', x, z - 0.55, 0); } },
  pasillo: (s) => { skyDome(s, 'interior'); lights(s, 'interior'); floor(s, '#d6d0c4', 30, 40); wall(s, '#9cc5b0', -2.5, 2, 0, 40, 4, Math.PI / 2); wall(s, '#9cc5b0', 2.5, 2, 0, 40, 4, -Math.PI / 2); wall(s, '#f2e6cc', 0, 2, -14, 6, 4);
    for (let i = 0; i < 6; i++) { const l = M(box(0.9, 2.0, 0.5, 0.04), ['#3b7dd8', '#e74c3c'][i % 2], { m: 0.3, r: 0.4 }); at(l, -2.2, 1, -10 + i * 1.0, 1, Math.PI / 2); s.add(l); } add(s, 'puerta', 2.38, -4, -Math.PI / 2); },
  cocina: (s) => { skyDome(s, 'interior'); lights(s, 'interior'); room(s, '#f7e1b5', '#b98a5e', -3.5, { wx: 2.6 });
    const enc = M(box(5, 0.95, 0.75, 0.05), '#f4f4f4'); at(enc, -1.2, 0.47, -3.0); s.add(enc); const top = M(box(5.05, 0.08, 0.8, 0.03), '#6d4c41'); at(top, -1.2, 0.98, -3.0); s.add(top);
    for (let i = 0; i < 4; i++) { const k = M(box(1.1, 0.7, 0.4, 0.04), '#e8a87c'); at(k, -3.1 + i * 1.25, 2.8, -3.2); s.add(k); }
    add(s, 'sarten', -0.6, -3.0, 0, 0.9, 1.02); add(s, 'olla', -1.8, -3.0, 0, 0.9, 1.02); add(s, 'nevera', 2.0, -3.0); add(s, 'mesa', 0, 1.0); add(s, 'silla', -0.9, 1.0, Math.PI / 2); },
  salon: (s) => { skyDome(s, 'interior'); lights(s, 'interior'); room(s, '#e9d3c0', '#a0785a', -4, { wx: -3 }); add(s, 'sofa', 0, -3.0); add(s, 'tele', 3.6, -0.5, -Math.PI / 2);
    const rug = M(box(3.4, 0.02, 2.2, 0.01), '#d9534f'); at(rug, 0, 0.01, -1.2); s.add(rug); add(s, 'arbol', -4.6, -3.2, 0, 0.6); },
  dormitorio: (s) => { skyDome(s, 'interior'); lights(s, 'interior'); room(s, '#c9d6ef', '#b48a64', -4, { wx: 2.8 }); add(s, 'cama', -1.6, -2.6); add(s, 'mesa', 2.2, -3.2, 0, 0.6); add(s, 'linterna', 2.2, -3.2, 0, 1, 0.48); },
  oficina: (s) => { skyDome(s, 'interior'); lights(s, 'interior'); room(s, '#dfe6ec', '#8d9aa6', -4, { wx: 0 });
    for (const [x, z] of [[-2.6, -2], [2.6, -2], [-2.6, 1.5], [2.6, 1.5]]) { add(s, 'mesa', x, z); add(s, 'ordenador', x, z - 0.15); add(s, 'silla', x, z + 0.7, Math.PI); add(s, 'cafe', x + 0.45, z + 0.1, 0, 1, 0.79); }
    add(s, 'arbol', -5, -3.4, 0, 0.5); },
  ascensor: (s) => { skyDome(s, 'interior'); lights(s, 'interior'); floor(s, '#6d6d6d', 4, 4, { m: 0.3 });
    const m = (x, z, ry) => { const w = M(box(3.4, 3.2, 0.1, 0.02), '#c9d1d9', { m: 0.7, r: 0.25 }); at(w, x, 1.6, z, 1, ry); w.castShadow = false; s.add(w); };
    m(0, -1.6, 0); m(-1.7, 0, Math.PI / 2); m(1.7, 0, -Math.PI / 2); const pan = M(box(0.3, 0.6, 0.05, 0.02), '#333'); at(pan, 1.6, 1.4, -0.6, 1, -Math.PI / 2); s.add(pan);
    for (let i = 0; i < 6; i++) { const b = M(sph(), '#ffcc66', { e: '#ffb300', ei: 0.8 }); at(b, 1.57, 1.25 + (i % 3) * 0.12, -0.66 + Math.floor(i / 3) * 0.12, 0.03); s.add(b); }
    const l = M(box(1.2, 0.04, 1.2, 0.02), '#fff8e0', { e: '#fff8e0', ei: 1 }); at(l, 0, 3.15, 0); s.add(l); const pl = new THREE.PointLight('#ffe8c0', 8, 8); pl.position.set(0, 2.9, 0.4); s.add(pl); },
  cine: (s) => { skyDome(s, 'noche'); lights(s, 'noche'); floor(s, '#3a1f2b', 40, 40); wall(s, '#4a1d2a', 0, 3, -8, 20, 6);
    const sc = M(box(9, 4, 0.05, 0.02), '#e8f1ff', { e: '#b9d4ff', ei: 1 }); at(sc, 0, 3.2, -7.8); s.add(sc); const sl = new THREE.PointLight('#b9d4ff', 18, 16); sl.position.set(0, 3, -6); s.add(sl);
    for (let r = 0; r < 3; r++) for (let c = -3; c <= 3; c++) add(s, 'butaca', c * 0.85, -2.5 + r * 1.6 - (r === 1 && c === 0 ? 99 : 0), Math.PI, 1, r * 0.2); },
  avion: (s) => { skyDome(s, 'interior'); lights(s, 'interior'); floor(s, '#5a6878', 6, 40);
    const tube = new THREE.Mesh(geo('tube', () => new THREE.CylinderGeometry(2.4, 2.4, 40, 32, 1, true)), MAT('#eef1f4', { r: 0.8 })); tube.material.side = THREE.BackSide; tube.rotation.x = Math.PI / 2; tube.position.y = 1.5; s.add(tube);
    for (let i = 0; i < 8; i++) for (const x of [-1.5, -0.9, 0.9, 1.5]) { const c = M(box(0.55, 1.1, 0.55, 0.12), '#2f4f8f'); at(c, x, 0.55, -12 + i * 1.6); s.add(c); }
    for (let i = 0; i < 8; i++) for (const sx of [-1, 1]) { const w = M(box(0.35, 0.5, 0.05, 0.12), '#bfe6ff', { e: '#bfe6ff', ei: 0.6 }); at(w, sx * 2.2, 1.7, -12 + i * 1.6, 1, sx * Math.PI / 2); s.add(w); } },
  super: (s) => { skyDome(s, 'interior'); lights(s, 'interior'); floor(s, '#e6e6e6', 40, 40); wall(s, '#f6f0e0', 0, 2.5, -8, 20, 5);
    for (const x of [-3.2, 3.2]) for (let k = 0; k < 4; k++) { const sh = M(box(0.8, 0.06, 6, 0.02), '#bbb'); at(sh, x, 0.4 + k * 0.55, -3); s.add(sh);
      for (let j = 0; j < 12; j++) { const pr = M(box(0.28, 0.35, 0.3, 0.05), ['#e74c3c', '#f1c40f', '#3498db', '#2ecc71', '#e67e22'][(j + k) % 5]); at(pr, x, 0.62 + k * 0.55, -5.6 + j * 0.45); s.add(pr); } } },
  hospital: (s) => { skyDome(s, 'interior'); lights(s, 'interior'); room(s, '#d7ecef', '#c9d6d9', -4, { wx: -2.8 }); add(s, 'cama', 2.0, -2.5); add(s, 'botiquin', -3.5, -3.6, 0, 1, 1.2); },
  calle: (s) => { skyDome(s, 'dia'); lights(s, 'dia'); floor(s, '#4b4f57', 60, 60); const ac = M(box(60, 0.15, 4, 0.02), '#c8c2b8'); at(ac, 0, 0.07, -5); s.add(ac); const ac2 = M(box(60, 0.15, 4, 0.02), '#c8c2b8'); at(ac2, 0, 0.07, 9); s.add(ac2);
    for (let i = -6; i <= 6; i++) { const l = M(box(1.2, 0.02, 0.15, 0.01), '#f2f2f2'); at(l, i * 2.5, 0.01, 2); s.add(l); }
    const cols = ['#e8b77d', '#d98c6a', '#9cc5b0', '#f2d17b', '#c4a3d6', '#e89b9b'];
    for (let i = -5; i <= 5; i++) { const h = 4 + rnd(i) * 5; const b = M(box(3.6, h, 3, 0.1), cols[(i + 6) % 6], { r: 0.85 }); at(b, i * 3.8, h / 2, -9); s.add(b);
      for (let r = 0; r < Math.floor(h / 1.4); r++) for (const wx of [-0.9, 0.9]) { const w = M(box(0.6, 0.7, 0.05, 0.03), '#bfe6ff', { e: '#9fd0f0', ei: 0.2 }); at(w, i * 3.8 + wx, 1.2 + r * 1.4, -7.48); s.add(w); } }
    add(s, 'farola', -3, -3.6); add(s, 'farola', 5, -3.6); add(s, 'semaforo', 2.2, -3.4); add(s, 'coche', -6, 1, Math.PI / 2); add(s, 'arbol', 8, -4.5, 0, 0.9); },
  parque: (s) => { skyDome(s, 'dia'); lights(s, 'dia'); floor(s, '#6fb34d', 60, 60); const pth = M(box(3, 0.02, 60, 0.01), '#d9c49a'); at(pth, 0, 0.01, 0, 1, 0.3); s.add(pth);
    for (let i = 0; i < 9; i++) add(s, 'arbol', (rnd(i) - 0.5) * 22 + (rnd(i) > 0.5 ? 4 : -4), -4 - rnd(i + 3) * 12, 0, 0.8 + rnd(i) * 0.5); add(s, 'banco', -2.6, -2.5, 0.3); add(s, 'farola', 3, -3); },
  playa: (s) => { skyDome(s, 'dia'); lights(s, 'dia'); floor(s, '#f2d6a2', 60, 60);
    const sea = M(geo('sea', () => new THREE.PlaneGeometry(80, 40, 60, 30)), '#2e9bd6', { r: 0.2, m: 0.1 }); sea.rotation.x = -Math.PI / 2; sea.position.set(0, 0.05, -26); sea.userData.sea = true; s.add(sea);
    const foam = M(box(80, 0.04, 0.6, 0.02), '#ffffff'); at(foam, 0, 0.06, -6.2); s.add(foam);
    add(s, 'sombrilla', 2.6, -1.8); add(s, 'toalla', 2.4, -0.8, 0.2); add(s, 'tabla', -3.4, -2.6, 0.3); add(s, 'sol', 9, 0, 0, 1.5, 12); add(s, 'nube', -6, -30, 0, 3, 10); },
  camping: (s) => { skyDome(s, 'tarde'); lights(s, 'tarde'); floor(s, '#5e8f45', 60, 60);
    for (let i = 0; i < 16; i++) add(s, 'pino', (rnd(i) - 0.5) * 30, -5 - rnd(i + 7) * 14, 0, 1 + rnd(i) * 0.8);
    add(s, 'tienda', -2.4, -2.2, 0.4); add(s, 'hoguera', 1.8, -0.8); add(s, 'roca', 3.2, -3.0, 0, 0.8); add(s, 'mochila', -1.0, -1.4, 0.5); },
  bosque: (s) => { skyDome(s, 'dia'); lights(s, 'dia'); floor(s, '#4f7d3a', 60, 60); for (let i = 0; i < 26; i++) { const x = (rnd(i) - 0.5) * 34; if (Math.abs(x) < 2.5 && rnd(i + 1) < 0.7) continue; add(s, rnd(i + 9) > 0.4 ? 'pino' : 'arbol', x, -2 - rnd(i + 7) * 18, 0, 1 + rnd(i) * 0.9); } add(s, 'roca', 2.5, -1.5, 0, 0.6); },
  nieve: (s) => { skyDome(s, 'dia'); lights(s, 'dia'); floor(s, '#f4f8fc', 60, 60, { r: 0.6 }); for (let i = 0; i < 14; i++) { const p = add(s, 'pino', (rnd(i) - 0.5) * 30, -6 - rnd(i + 7) * 14, 0, 1 + rnd(i) * 0.7); p.traverse((m) => { if (m.isMesh && m.geometry.type === 'ConeGeometry') m.material = MAT('#3d6b56'); }); }
    for (let i = 0; i < 5; i++) { const m = M(cone(6, 7, 6), '#e8eef5', { flat: true }); at(m, -20 + i * 10, 3.4, -40); s.add(m); } },
  montana: (s) => { skyDome(s, 'dia'); lights(s, 'dia'); floor(s, '#7d8a5a', 80, 80); for (let i = 0; i < 6; i++) { const m = M(cone(8 + rnd(i) * 4, 10 + rnd(i) * 6, 7), '#7f8c8d', { flat: true }); at(m, -30 + i * 12, 5, -30 - rnd(i) * 10); s.add(m); const c = M(cone(3, 3.5, 7), '#fafafa', { flat: true }); at(c, -30 + i * 12, 10 + rnd(i) * 3, -30 - rnd(i) * 10); s.add(c); }
    add(s, 'roca', -2.5, -2, 0, 1.2); add(s, 'roca', 3, -3.5, 1, 1.6); },
  espacio: (s) => { skyDome(s, 'espacio'); lights(s, 'espacio'); const st = new THREE.BufferGeometry(); const pts = []; for (let i = 0; i < 900; i++) { const a = rnd(i) * 6.28, b = rnd(i + 1) * 3.14; pts.push(Math.sin(b) * Math.cos(a) * 60, Math.cos(b) * 60, Math.sin(b) * Math.sin(a) * 60); }
    st.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); { const pts = new THREE.Points(st, new THREE.PointsMaterial({ color: '#fff', size: 0.25 })); pts.userData.disp = true; s.add(pts); }
    const pl = M(sph(), '#3f7fd8', { r: 0.6 }); at(pl, 8, -3, -25, 9); s.add(pl); const moon = M(sph(), '#c8c8c8', { flat: true }); at(moon, -9, 6, -20, 2); s.add(moon); },
  tormenta: (s) => { skyDome(s, 'tormenta'); lights(s, 'tormenta'); floor(s, '#4f7a35', 60, 60); for (let i = 0; i < 8; i++) add(s, 'nube', (rnd(i) - 0.5) * 24, -8 - rnd(i) * 6, 0, 2.5, 9 + rnd(i) * 2); add(s, 'arbol', -3.5, -3); },
  noche: (s) => { skyDome(s, 'noche'); lights(s, 'noche'); floor(s, '#2f3d2a', 60, 60); add(s, 'luna', -6, -30, 0, 4, 14); for (let i = 0; i < 12; i++) add(s, 'pino', (rnd(i) - 0.5) * 30, -6 - rnd(i + 7) * 14, 0, 1 + rnd(i) * 0.7); add(s, 'farola', 2.5, -2.5); },
  estudio: (s) => { skyDome(s, 'tarde'); lights(s, 'tarde'); floor(s, '#e9c99a', 60, 60); },
};
export const SET_NAMES = Object.keys(SETS);
export const CHAR_NAMES = [...Object.keys(LOOKS), 'oso', 'tiburon', 'dino', 'alien', 'perro', 'gato', 'fantasma', 'robot', 'paloma', 'pajaro'];
export function actor(kind, o) { return LOOKS[kind] ? person(kind, o) : creature(kind, o) || person('gente', o); }
export function animateFx(scene, lt) {
  scene.traverse((o) => {
    if (o.userData.fire) o.userData.fire.forEach((f, i) => { const k = 1 + Math.sin(lt * 14 + i * 1.7) * 0.18; f.scale.set(k, 1 + Math.sin(lt * 11 + i) * 0.25, k); f.rotation.y = lt * 2 + i; });
    if (o.userData.light && o.userData.fire) o.userData.light.intensity = 5 + Math.sin(lt * 23) * 1.5;
    if (o.userData.sea) o.position.y = 0.05 + Math.sin(lt * 1.5) * 0.04;
  });
}
export { THREE };
