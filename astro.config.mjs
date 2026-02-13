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
	site: 'https://example.com',
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
