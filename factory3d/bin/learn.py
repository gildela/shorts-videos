"""Self-learning for the daily Short, cheaply. No Claude reasoning here: plain rules.
  python3 learn.py <shorts-dir> [--n 1]
Reads   ledger.jsonl          one row per published Short: {"date","slug","title","yt","tt","buf_yt","buf_tt",
                              "genes":{"cat","hook","pattern","len","viral","lang"},"dur"}
        metrics_buffer.jsonl  appended every day from Buffer list_posts includeMetrics, one row per post:
                              {"date","slug","platform":"youtube|tiktok","views","likes","comments","shares","avg_watch_s"}
        metrics.json          optional YouTube Analytics report (Mondays, Zapier): adds averageViewPercentage
        viral_patterns.md     structures of viral Shorts we studied: lines "- V01 | name | hook | beats | ending | shots | source"
        lessons.md            one line per day: what we learned (written by the daily run)
Writes  playbook.md (the only thing the daily run reads before writing) and metrics_history.jsonl
Score per Short (after 48 h) = mean percentile of: views (YT+TT), retention (avg watch / duration, or YT % viewed),
engagement ((likes+comments+shares)/views). A gene value WINS with >= 3 videos and mean score >= 0.60, LOSES at <= 0.40."""
import json, sys, datetime as dt, re
from pathlib import Path
D = Path(sys.argv[1]); N = int(sys.argv[sys.argv.index('--n') + 1]) if '--n' in sys.argv else 1
MIN_N, WIN, LOSE = 3, 0.60, 0.40
today = dt.date.today()
def jl(p): return [json.loads(l) for l in p.read_text().splitlines() if l.strip()] if p.exists() else []
ledger = jl(D / 'ledger.jsonl')
buf = {}
for r in jl(D / 'metrics_buffer.jsonl'): buf[(r['slug'], r['platform'])] = r   # latest row wins
yt = {}
if (D / 'metrics.json').exists():
    m = json.loads((D / 'metrics.json').read_text())
    if isinstance(m, dict) and 'rows' in m:
        h = [c['name'] for c in m['columnHeaders']]; m = [dict(zip(h, r)) for r in m['rows'] or []]
    elif isinstance(m, dict): m = m.get('results') or m.get('data') or [m]
    for r in m:
        vid = r.get('video') or r.get('video_id') or r.get('id')
        if vid: yt[vid] = float(r.get('averageViewPercentage') or 0)
vids = []
for e in ledger:
    if (today - dt.date.fromisoformat(e['date'])).days < 2: continue
    y, t = buf.get((e['slug'], 'youtube'), {}), buf.get((e['slug'], 'tiktok'), {})
    if not y and not t and e.get('yt') not in yt: continue
    g = lambda k: float(y.get(k) or 0) + float(t.get(k) or 0)
    views = g('views'); dur = float(e.get('dur') or 35)
    ret = yt.get(e.get('yt')) or (100 * float(t.get('avg_watch_s') or 0) / dur if t.get('avg_watch_s') else None)
    eng = (g('likes') + g('comments') + g('shares')) / views if views else 0
    vids.append({**e, 'views': views, 'ytv': float(y.get('views') or 0), 'ttv': float(t.get('views') or 0), 'ret': ret, 'eng': eng})
with open(D / 'metrics_history.jsonl', 'a') as f:
    f.write(json.dumps({'date': str(today), 'videos': {v['slug']: [v['ytv'], v['ttv'], v['ret']] for v in vids}}) + '\n')
def pct(vals):
    s = sorted(vals); return [(s.index(v) + s.count(v) / 2) / len(s) if len(s) > 1 else 0.5 for v in vals]
if vids:
    cols = [pct([v['views'] for v in vids]), pct([v['eng'] for v in vids])]
    if all(v['ret'] is not None for v in vids): cols.append(pct([v['ret'] for v in vids]))
    for i, v in enumerate(vids): v['score'] = sum(c[i] for c in cols) / len(cols)
genes = {}
for v in vids:
    for g_, val in (v.get('genes') or {}).items():
        genes.setdefault(g_, {}).setdefault(str(val), []).append(v['score'])
viral = [l[2:].strip() for l in (D / 'viral_patterns.md').read_text().splitlines() if l.startswith('- V')] if (D / 'viral_patterns.md').exists() else []
used = {str((e.get('genes') or {}).get('viral')) for e in ledger[-5:]}
lessons = [l.strip() for l in (D / 'lessons.md').read_text().splitlines() if l.startswith('- ')] if (D / 'lessons.md').exists() else []
f2 = lambda x: f'{x:.2f}'
out = [f'# Playbook ({today}) · {len(vids)} Shorts with data out of {len(ledger)} published', '']
if vids:
    out.append('## Last results (YT views · TT views · retention % · engagement)')
    out += [f"- {v['slug']} ({v['genes'].get('lang', 'en')}): {int(v['ytv'])} · {int(v['ttv'])} · {'' if v['ret'] is None else f'{v['ret']:.0f}%'} · {v['eng']:.1%} · score {f2(v['score'])}" for v in vids[-5:]]
    out.append('')
win, lose = [], []
for g_, vals in genes.items():
    for val, sc in vals.items():
        m = sum(sc) / len(sc)
        if len(sc) >= MIN_N and m >= WIN: win.append((m, g_, val, len(sc)))
        if len(sc) >= MIN_N and m <= LOSE: lose.append((m, g_, val, len(sc)))
win.sort(reverse=True); lose.sort()
out.append('## What works (repeat)' if win else '## What works: nothing proven yet (needs >= 3 videos per value)')
out += [f'- {g_}={val}: score {f2(m)} (n={n})' for m, g_, val, n in win[:5]]
if lose: out += ['## What does NOT work (avoid)'] + [f'- {g_}={val}: score {f2(m)} (n={n})' for m, g_, val, n in lose[:4]]
top = sorted(vids, key=lambda v: -v['score'])[:2]
if top: out += ['## Our best (copy hook + shot sequence, new topic)'] + [f"- {v['title']} · hook={v['genes'].get('hook')} · pattern={v['genes'].get('pattern')}" for v in top]
fresh = [p for p in viral if p.split('|')[0].strip() not in used]
if viral:
    out += ['## Viral structures to copy (structure only, never text)'] + [f'- {p[:220]}' for p in (fresh or viral)[:3]]
if lessons: out += ['## Recent lessons'] + lessons[-4:]
k = round(N * 0.7) if win else 0
out += ['', f'## Plan ({N} Short{"s" if N > 1 else ""})']
if len(vids) < 10:
    out.append(f'- EXPLORE phase (< 10 Shorts with data): build on a viral structure not used in the last 5 days ({(fresh or viral or ["none yet: research one today"])[0].split("|")[0].strip()}), new topic, and vary cat/hook. Set genes.viral to its id.')
else:
    out += [f'- {k} EXPLOIT: winners above or the best-scoring viral structure.', f'- {N - k} EXPLORE: an untested hook, pattern, category or viral structure.']
MARK = '<!-- AUTO: learn.py rewrites everything below this line; edit only above it -->'
pb = D / 'playbook.md'
pinned = pb.read_text().split(MARK)[0].rstrip() + '\n\n' if pb.exists() and MARK in pb.read_text() else ''
pb.write_text(pinned + MARK + '\n' + '\n'.join(out[:40]) + '\n')
print('\n'.join(out[:40]))
