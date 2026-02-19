export const UTM_GROUPS = {
	cta_utm: {
		utm_source: 'blog',
		utm_medium: 'cta',
		utm_campaign: 'cadastro',
		utm_content: 'org',
	},
	/** In-article banner: utm_term = slug do post onde o banner aparece */
	banner_inline_utm: {
		utm_source: 'blog',
		utm_medium: 'banner-middle',
		utm_campaign: 'cadastro',
		utm_content: 'org',
	},
} as const;
