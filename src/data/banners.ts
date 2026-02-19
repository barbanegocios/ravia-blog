import bannerTop from '../assets/banners/banner_top.jpg';

export const BANNERS = [
	{
		id: 'banner_top',
		image: bannerTop,
		link: 'https://ravia.app/?utm_source=blog&utm_campaign=cadastro&utm_medium=home&utm_content=org&utm_term=banner-top',
	},
	/** Banners inline: imagens ficam só em public/ (rehype injeta HTML com URL pública) */
	{
		id: 'banner_inline_1',
		imagePublicPath: '/banner_middle-1.jpg',
		link: 'https://ravia.app/[banner_inline_utm]',
	},
	{
		id: 'banner_inline_2',
		imagePublicPath: '/banner_middle-2.jpg',
		link: 'https://ravia.app/[banner_inline_utm]',
	},
	{
		id: 'banner_inline_3',
		imagePublicPath: '/banner_middle-3.jpg',
		link: 'https://ravia.app/[banner_inline_utm]',
	},
] as const;

export type BannerId = (typeof BANNERS)[number]['id'];

export const BANNER_PLACEMENTS = {
	home: ['banner_top'] as const,
	inArticle: [
		{ afterParagraph: 2, bannerId: 'banner_inline_1' as BannerId },
		{ afterParagraph: 14, bannerId: 'banner_inline_2' as BannerId },
		{ afterParagraph: 26, bannerId: 'banner_inline_3' as BannerId },
	],
};

/** Map of bannerId to { href, src } for use in rehype plugin (resolved at build time). */
export function getBannerMap(): Record<string, { href: string; src: string }> {
	const map: Record<string, { href: string; src: string }> = {};
	for (const b of BANNERS) {
		const entry = b as (typeof BANNERS)[number] & { imagePublicPath?: string; image?: { src: string } | string };
		const src =
			entry.imagePublicPath ??
			(typeof entry.image === 'string' ? entry.image : entry.image?.src ?? '');
		map[b.id] = { href: b.link, src };
	}
	return map;
}
