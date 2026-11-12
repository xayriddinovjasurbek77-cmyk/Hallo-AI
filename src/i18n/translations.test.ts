import test from 'node:test';
import assert from 'node:assert/strict';
import { TRANSLATIONS, SUPPORTED_LANGUAGES } from './translations';

function collectLeaves(obj: unknown, prefix = ''): Array<{ path: string; value: unknown }> {
  if (typeof obj !== 'object' || obj === null) {
    return [{ path: prefix, value: obj }];
  }
  const entries = Object.entries(obj as Record<string, unknown>);
  const leaves: Array<{ path: string; value: unknown }> = [];
  for (const [key, val] of entries) {
    const nextPath = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(val)) {
      val.forEach((item, idx) => {
        leaves.push(...collectLeaves(item, `${nextPath}[${idx}]`));
      });
    } else if (typeof val === 'object' && val !== null) {
      leaves.push(...collectLeaves(val, nextPath));
    } else {
      leaves.push({ path: nextPath, value: val });
    }
  }
  return leaves;
}

test('all three languages have identical translation keys and non-empty strings', () => {
  const baseLeaves = collectLeaves(TRANSLATIONS.uz);
  const basePaths = baseLeaves.map((l) => l.path);

  for (const lang of SUPPORTED_LANGUAGES) {
    const leaves = collectLeaves(TRANSLATIONS[lang]);
    assert.deepEqual(
      leaves.map((l) => l.path),
      basePaths,
      `Key mismatch for language ${lang}`
    );
    for (const leaf of leaves) {
      assert.equal(typeof leaf.value, 'string', `${lang}.${leaf.path} must be a string`);
      assert.ok((leaf.value as string).trim().length > 0, `${lang}.${leaf.path} must not be empty`);
    }
  }
});
