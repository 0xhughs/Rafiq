import { describe, expect, it } from 'vitest';
import { NAME_ERRORS, NAME_MAX_CHARS, NAME_MIN_CHARS, validateName } from './names';

describe('validateName', () => {
  it('rejects a blank name with an inline Arabic message', () => {
    const result = validateName('');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe(NAME_ERRORS.blank);
    }
  });

  it('rejects whitespace-only input after trimming', () => {
    const result = validateName('   \n\t  ');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe(NAME_ERRORS.blank);
    }
  });

  it('rejects a single Unicode character', () => {
    const result = validateName('ع');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe(NAME_ERRORS.tooShort);
    }
  });

  it('accepts a two-character Arabic name', () => {
    const result = validateName('علي');
    expect(result).toEqual({ ok: true, name: 'علي' });
  });

  it('trims outer whitespace and preserves inner spaces', () => {
    const result = validateName('  عبد الرحمن  ');
    expect(result).toEqual({ ok: true, name: 'عبد الرحمن' });
  });

  it('preserves mixed Arabic and Latin scripts', () => {
    const result = validateName('Sara علي');
    expect(result).toEqual({ ok: true, name: 'Sara علي' });
  });

  it('preserves markup-like characters as literal text', () => {
    const result = validateName('<b>علي</b>');
    expect(result).toEqual({ ok: true, name: '<b>علي</b>' });
  });

  it('accepts the maximum length bound', () => {
    const name = 'ا'.repeat(NAME_MAX_CHARS);
    const result = validateName(name);
    expect(result).toEqual({ ok: true, name });
  });

  it('rejects more than the maximum Unicode characters', () => {
    const result = validateName('ا'.repeat(NAME_MAX_CHARS + 1));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe(NAME_ERRORS.tooLong);
    }
  });

  it('does not require two words', () => {
    const result = validateName('نورة');
    expect(result).toEqual({ ok: true, name: 'نورة' });
  });

  it('uses inclusive 2–80 Unicode character bounds', () => {
    expect(NAME_MIN_CHARS).toBe(2);
    expect(NAME_MAX_CHARS).toBe(80);
  });
});
