# Rebuilds the menu section of menu.html from data.py.
# Usage, from the site folder: python3 tools/menu/build.py menu.html            (no prices)
#                              python3 tools/menu/build.py menu.html --prices   (with prices)
import sys, html, re
sys.path.insert(0, __import__('os').path.dirname(__file__))
from data import FOOD, KIDS, DESSERT, DRINKS
path, PRICES = sys.argv[1], '--prices' in sys.argv
e = html.escape
TAGS = {'GF': 'Gluten-free', 'GFO': 'Gluten-free option', 'A': 'Australian', 'I': 'Imported', 'M': 'Mixed'}

def tags(t):
    return ''.join(f' <abbr class="m-tag" title="{TAGS[x]}">{x}</abbr>' for x in t.split())

def item(name, desc, tg, price, addon, cols):
    d = f'<span class="m-desc">{e(desc)}</span>' if desc else ''
    a = f'<span class="m-add">{e(addon if PRICES else re.sub(r" \+\$[\d.]+$", "", addon))}</span>' if addon else ''
    p = ''
    if PRICES:
        if isinstance(price, list):
            p = ''.join(f'<span class="m-price">{e(x) or "–"}</span>' for x in price)
        elif price:
            p = f'<span class="m-price">{e(price)}</span>'
    elif cols and isinstance(price, list) and cols[0].startswith('Glass'):
        p = '<span class="m-by">Glass or bottle</span>' if price[0] else '<span class="m-by">Bottle</span>'
    return f'<li class="m-item"><span class="m-name">{e(name)}{tags(tg)}</span>{d}{a}{p}</li>'

CHEVRON = '<svg class="m-chev" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 7.5l5 5 5-5"/></svg>'

def inner(s, sub=False):
    sid, title, note, kind, cols, items, *foot = s
    if not PRICES and note and note.startswith('$'): note = None
    out = [f'<h4 class="m-sub">{e(title)}</h4>'] if sub else []
    if note: out.append(f'<p class="m-sec__note">{e(note)}</p>')
    if PRICES and cols:
        out.append('<p class="m-cols" aria-hidden="true">' + ''.join(f'<span>{e(c)}</span>' for c in cols) + '</p>')
    out.append(f'<ul class="m-list m-list--{kind}">' + ''.join(item(*it, cols) for it in items) + '</ul>')
    if foot:
        f = foot[0] if PRICES else re.sub(r' \+\$[\d.]+$', '', foot[0])
        out.append(f'<p class="m-sec__note m-sec__note--after">{e(f)}</p>')
    return '\n'.join(out)

def dropdown(sid, title, body):
    return (f'<details class="m-sec" id="{sid}">\n<summary><h3 class="m-sec__title">{e(title)}</h3>{CHEVRON}</summary>\n'
            f'<div class="m-sec__body">\n{body}\n</div>\n</details>')

def section(s):
    if s[0] == 'group':
        _, sid, title, parts = s
        return dropdown(sid, title, '\n'.join(inner(p, sub=True) for p in parts))
    return dropdown(s[0], s[1], inner(s))

def grouped(secs, groups):
    """Fold the named sections into single dropdowns, in place of the first one."""
    by = {x[0]: x for x in secs}
    folded = {k for _, _, ks in groups for k in ks}
    out = []
    for x in secs:
        for gid, gt, ks in groups:
            if x[0] == ks[0]: out.append(('group', gid, gt, [by[k] for k in ks]))
        if x[0] not in folded: out.append(x)
    return out

DRINKS = grouped(DRINKS, [
    ('beer', 'Beer and cider', ['tap-beer', 'bottled-beer', 'imported-beer', 'cider']),
    ('spirits', 'Spirits', ['rum', 'vodka', 'gin', 'tequila', 'whiskey', 'bourbon', 'cognac', 'digestif']),
])
CHAPTERS = [('food', 'Food', FOOD), ('kids', 'Kids', KIDS), ('desserts', 'Dessert', DESSERT), ('drinks', 'Drinks', DRINKS)]
nav = ''.join(f'<a href="#{cid}">{t}</a>' for cid, t, _ in CHAPTERS)
body = [f'''  <section class="mp" id="menu" aria-labelledby="menu-title">
    <header class="mp__head">
      <h1 id="menu-title" class="mp__title">Menu</h1>
    </header>
    <nav class="mp__nav" aria-label="Menu sections">{nav}<a href="index.html#nights">Weekly specials</a></nav>''']
for cid, t, secs in CHAPTERS:
    body.append(f'    <div class="mp__chapter" id="{cid}">\n      <h2 class="mp__chapter-title">{t}</h2>\n      <div class="mp__grid mp__grid--{cid}">')
    body += ['        ' + section(s).replace('\n', '\n        ') for s in secs]
    body.append('      </div>\n    </div>')
key = ' · '.join(f'{k} {v.lower()}' for k, v in TAGS.items())
body.append(f'''    <footer class="mp__foot">
      <p>{key}</p>
      <p>{'Prices subject to change and availability. ' if PRICES else 'Subject to change and availability. '}A 15% surcharge applies on public holidays.</p>
      <p><a class="pill" href="index.html#book">Book a table</a></p>
    </footer>
  </section>
''')
page = open(path).read()
a = page.index('<main id="top">') + len('<main id="top">\n')
b = page.index('</main>')
open(path, 'w').write(page[:a] + '\n'.join(body) + page[b:])
print('items', sum(len(p[5]) for _, _, secs in CHAPTERS for s in secs for p in (s[3] if s[0] == 'group' else [s])))
