"""Measure what one daily run cost in Claude tokens, from this session's own transcript (measured, not estimated).
  python3 usage.py --from <UTC ISO> [--to <UTC ISO>] --slug <slug> --date <YYYY-MM-DD> [--out <shorts-dir>/usage.jsonl]
Sums every assistant message (deduped by message id) between the two times in ~/.claude/projects/*/*.jsonl.
weighted = input + 1.25*cache_write + 0.1*cache_read + 5*output  (API price ratios; a proxy for plan usage)."""
import json, sys, glob, os
a = sys.argv; g = lambda k, d=None: a[a.index(k) + 1] if k in a else d
t0, t1 = g('--from'), g('--to', '9999'); seen = {}
for f in glob.glob(os.path.expanduser('~/.claude/projects/**/*.jsonl'), recursive=True):
    for l in open(f, errors='ignore'):
        try: d = json.loads(l)
        except Exception: continue
        if d.get('type') != 'assistant' or not (t0 <= d.get('timestamp', '') <= t1): continue
        m = d.get('message') or {}; u = m.get('usage')
        if u and m.get('id'): seen[m['id']] = u
s = {k: sum(int(u.get(k) or 0) for u in seen.values()) for k in ('input_tokens', 'cache_creation_input_tokens', 'cache_read_input_tokens', 'output_tokens')}
row = {'date': g('--date'), 'slug': g('--slug'), 'calls': len(seen), 'input': s['input_tokens'], 'cache_write': s['cache_creation_input_tokens'],
       'cache_read': s['cache_read_input_tokens'], 'output': s['output_tokens'],
       'weighted': round(s['input_tokens'] + 1.25 * s['cache_creation_input_tokens'] + 0.1 * s['cache_read_input_tokens'] + 5 * s['output_tokens']),
       'from': t0, 'to': t1, 'measured': True}
if g('--out'):
    with open(g('--out'), 'a') as f: f.write(json.dumps(row) + '\n')
print(json.dumps(row))
