/**
 * Default media (3D frames, banners, family photos) is served from a public CDN instead of
 * the theme package, which Salla caps at 1 MB for public themes. The tag pins the files, so
 * a published theme always gets the same images.
 */
export const MEDIA_CDN = 'https://cdn.jsdelivr.net/gh/mike-aldrain/dukhoon-oud-docs@media-v1/assets';
