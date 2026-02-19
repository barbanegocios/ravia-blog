import bannerTop from '../assets/banner_top.jpg';
import bannerMiddle1 from '../assets/banner_middle-1.jpg';
import bannerMiddle2 from '../assets/banner_middle-2.jpg';
import bannerMiddle3 from '../assets/banner_middle-3.jpg';

export const BANNERS = [
	{
		id: 'banner_top',
		image: bannerTop,
		link: 'https://ravia.app/?utm_source=blog&utm_campaign=trial&utm_medium=org&utm_content=home&utm_term=banner-top',
	},
	{
		id: 'banner_inline_1',
		image: bannerMiddle1,
		/** Resolvido no cliente: [banner_inline_utm] vira UTMs + utm_term = slug do post */
		link: 'https://ravia.app/[banner_inline_utm]',
	},
	{
		id: 'banner_inline_2',
		image: bannerMiddle2,
		link: 'https://ravia.app/[banner_inline_utm]',
	},
	{
		id: 'banner_inline_3',
		image: bannerMiddle3,
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
		map[b.id] = {
			href: b.link,
			src: typeof b.image === 'string' ? b.image : (b.image as { src: string }).src,
		};
	}
	return map;
}
