// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'Ravia Blog';
export const SITE_DESCRIPTION =
	'Marketing inteligente para quem não tem tempo a perder';

export const CATEGORY_SLUGS = [
	'marketing-digital',
	'social-media',
	'inteligencia-artificial',
	'negocios',
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export const CATEGORIES: { label: string; slug: CategorySlug }[] = [
	{ label: 'Marketing Digital', slug: 'marketing-digital' },
	{ label: 'Social Media', slug: 'social-media' },
	{ label: 'Inteligência Artificial', slug: 'inteligencia-artificial' },
	{ label: 'Negócios', slug: 'negocios' },
];

export function getCategoryLabel(slug: CategorySlug): string {
	return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}
