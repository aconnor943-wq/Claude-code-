// Every config builds cleanly, leaves no placeholder unfilled, and its Code nodes parse.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildClient } from '../scripts/new-client.mjs';
import { validate } from '../scripts/lib.mjs';

for (const file of readdirSync(new URL('../configs/', import.meta.url)).filter((f) => f.endsWith('.json'))) {
  test(`${file} builds with nothing left to fill in`, () => {
    const out = mkdtempSync(join(tmpdir(), 'rd-cfg-'));
    const { out: dir, files, cfg } = buildClient(new URL(`../configs/${file}`, import.meta.url).pathname, out);
    for (const f of files) {
      const text = readFileSync(join(dir, f), 'utf8');
      const left = (text.match(/\{\{(?!\s*JSON\.stringify)[^}]*\}\}/g) || []);
      assert.deepEqual(left, [], `${f} still has ${left.join(', ')}`);
      if (f.startsWith('n8n/') && f.endsWith('.js')) assert.doesNotThrow(() => new Function('$', '$json', '$input', text), `${f} parses`);
      if (f.endsWith('.gs')) assert.doesNotThrow(() => new Function(text), `${f} parses`);
    }
    assert.ok(files.includes('n8n/summary-1-build-request.js'));
    assert.equal(files.includes('n8n/ghl-2-count-by-day.js'), cfg.sources.includes('ghl'));
  });
}

test('validation catches common config mistakes', () => {
  const base = JSON.parse(readFileSync(new URL('../configs/demo-clinic.json', import.meta.url), 'utf8'));
  const broken = structuredClone(base);
  broken.data_start_date = '2026-07-07';                                   // a Tuesday
  broken.metrics.push({ metric: 'leads', label: 'Dup', type: 'count', format: 'number', good_when: 'up', daily: [['raw_ghl', 'nope']] });
  broken.metrics.push({ metric: 'bad_ratio', label: 'R', type: 'ratio', format: 'percent', good_when: 'up', num: 'booking_rate', den: 'missing' });
  const p = validate(broken).join('\n');
  assert.match(p, /Monday/);
  assert.match(p, /appears twice/);
  assert.match(p, /has no column nope/);
  assert.match(p, /must be a count/);
  assert.match(p, /"missing" is not a metric/);
  assert.deepEqual(validate(base), []);
});
