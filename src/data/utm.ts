export const UTM_GROUPS = {
	cta_utm: {
		utm_source: 'blog',
		utm_medium: 'org',
		utm_campaign: 'trial',
		utm_content: 'cta',
	},
	/** In-article banner: utm_term = slug do post onde o banner aparece */
	banner_inline_utm: {
		utm_source: 'blog',
		utm_medium: 'org',
		utm_campaign: 'trial',
		utm_content: 'banner-middle',
	},
} as const;
