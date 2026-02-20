// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { rehypeInjectBanners } from './src/plugins/rehype-inject-banners';
import {
	BANNER_PLACEMENTS,
	getBannerMap,
} from './src/data/banners';

// https://astro.build/config
export default defineConfig({
	site: 'https://blog.ravia.app',
	build: {
		// Elimina a cadeia crítica HTML → CSS: o CSS vai inline no HTML e melhora LCP no mobile (PageSpeed Insights).
		inlineStylesheets: 'always',
	},
	integrations: [mdx(), sitemap()],
	markdown: {
		rehypePlugins: [
			[
				rehypeInjectBanners,
				{
					inArticle: BANNER_PLACEMENTS.inArticle,
					bannerMap: getBannerMap(),
				},
			],
		],
	},
});
