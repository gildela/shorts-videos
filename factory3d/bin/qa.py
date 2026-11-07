"""Static QA for a FÁBRICA 3D project (script.json rules + caption/word sanity). Prints problems; exit 1 if any.
  python3 qa.py <project> [--pre]      --pre = before the voice (no duration / word checks)
Hard rules (rafa 2026-11-06): ZERO emojis anywhere (the emoji factory is banned), every line is a 3D shot with a known
set / camera / character / prop, no countdown of the time left, no on-screen «Fuente», 40-60 s, «Imagina que…» hook
and a last line that loops back to it, a numbered protocol (pills «1 · …», «2 · …», …), captions 1-3 words with one *word."""
import json, re, sys, unicodedata
from pathlib import Path
P = Path(sys.argv[1]); PRE = '--pre' in sys.argv
S = json.loads((P / 'script.json').read_text())
SRC = (Path(__file__).resolve().parent.parent / 'template/src')
world = (SRC / 'world.js').read_text(); shots = (SRC / 'shots.js').read_text()
SETS = set(re.findall(r'^  (\w+): \(s\) =>', world, re.M))
pblock = world[world.index('const P = {'):world.index('export const PROP_NAMES')]
PROPS = set(re.findall(r'(\w+): \(\) =>', pblock))
CHARS = set(re.findall(r'^  (\w+): \{ skin', world, re.M)) | set(re.search(r"CHAR_NAMES = \[\.\.\.Object\.keys\(LOOKS\), (.*?)\]", world).group(1).replace("'", '').replace(' ', '').split(','))
CAMS = set(re.findall(r'^  (\w+): \{ p:', shots, re.M))
FX = {'shake', 'flash', 'fire', 'smoke', 'rain', 'snow', 'night'}
ACTS = {'idle', 'run', 'walk', 'zombie', 'scared', 'point', 'wave', 'celebrate', 'think', 'hold', 'hide', 'crouch', 'sit', 'lie', 'fall', 'jump', 'talk', 'facepalm', 'roar'}
MOODS = {'calm', 'smile', 'scared', 'shock', 'angry', 'cry', 'cool', 'dead'}
bad = []
EMOJI = re.compile('[\U0001F000-\U0001FAFF☀-➿⬀-⯿️‍]')
raw = (P / 'script.json').read_text()
if EMOJI.search(raw): bad.append('EMOJIS PROHIBIDOS (rafa 2026-11-06): quita todos los emojis de script.json: ' + ' '.join(sorted(set(EMOJI.findall(raw)))))
def norm(w): return re.sub(r"[^\w']", '', unicodedata.normalize('NFD', w.lower()).encode('ascii', 'ignore').decode())
title = S.get('title', '')
if len(title) > 60: bad.append(f'title too long ({len(title)} chars, max 60 incl. #shorts)')
if not S.get('sources'): bad.append('no sources')
if not S.get('genes'): bad.append('no genes')
if S.get('voice', 'em_alex')[:1] != 'e': bad.append('voice must be a Spanish Kokoro voice (em_alex)')
L = S['lines']
if not L or not norm(L[0]['text']).startswith('imagina'): bad.append('line 0 must start with «Imagina que …» (estilo @protocolonocturno)')
elif len(L[0]['text'].split()) > 12: bad.append('line 0 too long (max ~10 words)')
if L and 'imagina' not in norm(L[-1]['text'].replace(' ', '')): bad.append('last line must loop back to line 0 («… imagina que …»)')
if not (L and L[0].get('shot', {}).get('set')): bad.append('line 0 needs shot.set')
pills = []
for i, ln in enumerate(L):
    sh = ln.get('shot') or {}
    for k in ('t', 'e', 'e2', 'e3'):
        if k in sh: bad.append(f'line {i}: "{k}" is a field of the banned emoji factory; use set/cam/who/props')
    if sh.get('set') and sh['set'] not in SETS: bad.append(f'line {i}: unknown set {sh["set"]!r} (sets: {", ".join(sorted(SETS))})')
    if sh.get('cam') and sh['cam'] not in CAMS: bad.append(f'line {i}: unknown cam {sh["cam"]!r} ({", ".join(sorted(CAMS))})')
    if sh.get('cam2') and sh['cam2'] not in CAMS: bad.append(f'line {i}: unknown cam2 {sh["cam2"]!r}')
    for w in sh.get('who', []):
        w = {'c': w} if isinstance(w, str) else w
        if w.get('c') not in CHARS: bad.append(f'line {i}: unknown character {w.get("c")!r} ({", ".join(sorted(CHARS))})')
        if w.get('act') and w['act'] not in ACTS: bad.append(f'line {i}: unknown act {w["act"]!r} ({", ".join(sorted(ACTS))})')
        if w.get('mood') and w['mood'] not in MOODS: bad.append(f'line {i}: unknown mood {w["mood"]!r} ({", ".join(sorted(MOODS))})')
        if w.get('hold') and w['hold'] not in PROPS: bad.append(f'line {i}: unknown hold prop {w["hold"]!r}')
    for p in sh.get('props', []):
        n = p if isinstance(p, str) else p.get('p')
        if n not in PROPS: bad.append(f'line {i}: unknown prop {n!r} (props: {", ".join(sorted(PROPS))})')
    if sh.get('fx') and sh['fx'] not in FX: bad.append(f'line {i}: unknown fx {sh["fx"]!r} ({", ".join(sorted(FX))})')
    if sh.get('card') and sh['card'] not in ('ok', 'error'): bad.append(f'line {i}: card must be "ok" or "error"')
    for k, mx in (('pill', 22), ('head', 16), ('sub', 32), ('cardText', 22), ('say', 22), ('hud', 34)):
        v = str(sh.get(k, ''))
        if len(v) > mx: bad.append(f'line {i}: {k} longer than {mx} chars')
        if re.search(r'fuente', norm(v)): bad.append(f'line {i}: no «Fuente» on screen (sources only in "sources")')
        if k != 'hud' and re.search(r'\b\d{1,2}:\d{2}\b', v): bad.append(f'line {i}: {k} looks like a clock; only the diary HUD may show a story time')
        if re.search(r'\b00:\d{2}\b|quedan|restante|segundos? para', v.lower()): bad.append(f'line {i}: NO countdown of the time left (rafa 2026-11-06)')
    if sh.get('pill'):
        m = re.match(r'\s*(\d+)\s*·', sh['pill'])
        if not m: bad.append(f'line {i}: pill must look like «1 · NO CORRAS»')
        else: pills.append(int(m.group(1)))
    caps = ln.get('caps')
    if not caps: bad.append(f'line {i}: no caps'); continue
    for c in [c.strip() for c in caps.split('|') if c.strip()]:
        ws = c.split()
        if not 1 <= len(ws) <= 3: bad.append(f'line {i}: caption "{c}" has {len(ws)} words (1-3)')
        if sum(w.startswith('*') for w in ws) != 1: bad.append(f'line {i}: caption "{c}" needs exactly one *yellow word')
if len(set(pills)) < 3: bad.append('the numbered protocol needs at least 3 step pills («1 · …», «2 · …», «3 · …»)')
if not PRE:
    lines = json.loads((P / 'data/lines.json').read_text())
    if not 40 <= lines['duration'] <= 60: bad.append(f"duration {lines['duration']:.1f} s (want 40-60)")
print('\n'.join(bad) if bad else 'QA OK'); sys.exit(1 if bad else 0)
