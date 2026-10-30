import { describe, expect, it } from 'vitest';
import { isScentTag, scentProfile } from '../../app/lib/scentProfile';

const tags = (...names: string[]) => names.map((name) => ({ name, url: '#' }));

describe('scentProfile', () => {
  it('reads Arabic labels into the notes pyramid and meters', () => {
    const p = scentProfile({
      tags: tags('قمة: زعفران', 'قمة: برغموت', 'قلب: ورد الطائف', 'قاعدة: عود', 'ثبات: ٤', 'فوحان: 3', 'موسم: شتاء'),
    });
    expect(p).toEqual({
      top: ['زعفران', 'برغموت'],
      heart: ['ورد الطائف'],
      base: ['عود'],
      longevity: 4,
      sillage: 3,
      season: ['شتاء'],
      family: [],
    });
  });

  it('reads English labels case-insensitively and clamps meters to 1..5', () => {
    const p = scentProfile({ tags: tags('Top: Bergamot', 'HEART notes: Rose', 'Longevity: 9', 'Family: Woody') });
    expect(p?.top).toEqual(['Bergamot']);
    expect(p?.heart).toEqual(['Rose']);
    expect(p?.longevity).toBe(5);
    expect(p?.family).toEqual(['Woody']);
  });

  it('returns null for products without scent tags and ignores unknown labels', () => {
    expect(scentProfile({ tags: tags('عطور رجالية', 'Colour: gold') })).toBeNull();
    expect(scentProfile({})).toBeNull();
  });

  it('tells scent tags from plain tags', () => {
    expect(isScentTag('قاعدة: مسك')).toBe(true);
    expect(isScentTag('عطور نسائية')).toBe(false);
  });
});
