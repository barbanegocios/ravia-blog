import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { CATEGORY_SLUGS } from './consts';

const categoryEnum = z.enum(CATEGORY_SLUGS);

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory (supports nested folders e.g. 2026/01/).
	loader: glob({
		base: './src/content/blog',
		pattern: '**/*.{md,mdx}',
		// ID = slug only (filename without extension), so post URLs are always /slug regardless of folder structure.
		// Slugs must be unique across the blog (e.g. avoid same filename in different year/month).
		generateId: ({ entry }) =>
			entry.replace(/\.(md|mdx)$/i, '').split('/').pop() ?? entry,
	}),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			category: categoryEnum,
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
		}),
});

export const collections = { blog };
