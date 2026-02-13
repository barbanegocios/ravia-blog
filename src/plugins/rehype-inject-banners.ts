/** HAST root node (rehype tree). */
interface HastRoot {
	type: 'root';
	children: HastNode[];
}

type HastNode =
	| { type: 'element'; tagName: string; properties: Record<string, unknown>; children: HastNode[] }
	| { type: string; children?: HastNode[] };

export interface InArticlePlacement {
	afterParagraph: number;
	bannerId: string;
}

export interface RehypeInjectBannersOptions {
	inArticle: InArticlePlacement[];
	bannerMap: Record<string, { href: string; src: string }>;
}

/** Create a HAST element node for the banner (div.banner-in-article > a > img). */
function createBannerNode(href: string, src: string): HastNode {
	return {
		type: 'element',
		tagName: 'div',
		properties: { className: ['banner-in-article'] },
		children: [
			{
				type: 'element',
				tagName: 'a',
				properties: { href },
				children: [
					{
						type: 'element',
						tagName: 'img',
						properties: {
							src,
							alt: '',
							loading: 'lazy',
						},
						children: [],
					},
				],
			},
		],
	};
}

export function rehypeInjectBanners(options: RehypeInjectBannersOptions) {
	const { inArticle, bannerMap } = options;
	if (inArticle.length === 0) return () => {};

	const placementsByParagraph = new Map<number, string>();
	for (const p of inArticle) {
		placementsByParagraph.set(p.afterParagraph, p.bannerId);
	}

	return (tree: HastRoot) => {
		const root = tree;
		if (root.type !== 'root' || !Array.isArray(root.children)) return;

		let paragraphCount = 0;
		const newChildren: HastNode[] = [];

		for (const node of root.children) {
			newChildren.push(node);

			if (
				node.type === 'element' &&
				node.tagName === 'p'
			) {
				paragraphCount++;
				const bannerId = placementsByParagraph.get(paragraphCount);
				if (bannerId) {
					const banner = bannerMap[bannerId];
					if (banner) {
						newChildren.push(createBannerNode(banner.href, banner.src));
					}
				}
			}
		}

		root.children = newChildren;
	};
}
