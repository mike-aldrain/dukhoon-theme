import { describe, expect, it } from 'vitest';
import { itemsOf } from '../../../app/components/majmar/home/shared';

describe('itemsOf', () => {
  it('strips the collection prefix from keys', () => {
    expect(itemsOf([{ 'looks.title': 'A', 'looks.image': 'x.webp' }], 'looks')).toEqual([{ title: 'A', image: 'x.webp' }]);
  });

  it('drops the blank row the editor saves with a new collection, even with pre-filled numbers', () => {
    const blank = { 'looks.image': '', 'looks.title': { ar: '', en: '' }, 'looks.product': [], 'looks.x': 50, 'looks.y': '50', 'looks.on': true };
    expect(itemsOf([blank], 'looks')).toEqual([]);
  });

  it('keeps a row with any real content', () => {
    expect(itemsOf([{ 'items.image': '', 'items.title': { ar: 'عود', en: '' } }], 'items')).toHaveLength(1);
    expect(itemsOf([{ 'items.url': '/products' }], 'items')).toHaveLength(1);
  });
});
