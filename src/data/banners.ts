import bannerTop from '../assets/banner_top.jpg';

export const BANNERS = [
	{
		id: 'banner_top',
		image: bannerTop,
		link: 'https://ravia.app/',
	},
] as const;

export type BannerId = (typeof BANNERS)[number]['id'];

export const BANNER_PLACEMENTS = {
	home: ['banner_top'] as const,
	inArticle: [
		{ afterParagraph: 2, bannerId: 'banner_top' as BannerId }
	],
};

/** Map of bannerId to { href, src } for use in rehype plugin (resolved at build time). */
export function getBannerMap(): Record<string, { href: string; src: string }> {
	const map: Record<string, { href: string; src: string }> = {};
	for (const b of BANNERS) {
		map[b.id] = {
			href: b.link,
			src: typeof b.image === 'string' ? b.image : (b.image as { src: string }).src,
		};
	}
	return map;
}
