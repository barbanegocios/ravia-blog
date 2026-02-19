import { UTM_GROUPS } from '../data/utm';

function getUtmTerm(pathname: string): string {
	const trimmed = pathname.replace(/^\/|\/$/g, '');
	return trimmed || 'home';
}

function resolveHref(href: string, groupName: string, utmTerm: string): string {
	const group = UTM_GROUPS[groupName as keyof typeof UTM_GROUPS];
	if (!group) return href;

	const placeholder = `[${groupName}]`;
	if (!href.includes(placeholder)) return href;

	const cleanHref = href.replace(placeholder, '');
	let url: URL;
	try {
		url = new URL(cleanHref, document.location.origin);
	} catch {
		return href;
	}

	const utmParams: Record<string, string> = {
		...Object.fromEntries(
			Object.entries(group).map(([k, v]) => [k, String(v)])
		),
		utm_term: utmTerm,
	};

	for (const [key, value] of Object.entries(utmParams)) {
		url.searchParams.set(key, value);
	}

	return url.toString();
}

function resolveUtmLinks(): void {
	const utmTerm = getUtmTerm(window.location.pathname);
	const prose = document.querySelector('.prose');
	if (!prose) return;

	const links = prose.querySelectorAll<HTMLAnchorElement>('a[href]');
	const groupNames = Object.keys(UTM_GROUPS);

	for (const link of links) {
		const rawHref = link.getAttribute('href');
		if (!rawHref) continue;
		// Decode so we match [cta_utm] even when the DOM has %5Bcta_utm%5D
		const href = decodeURI(rawHref);

		for (const groupName of groupNames) {
			if (href.includes(`[${groupName}]`)) {
				link.href = resolveHref(href, groupName, utmTerm);
				break;
			}
		}
	}
}

if (typeof document !== 'undefined') {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', resolveUtmLinks);
	} else {
		resolveUtmLinks();
	}
}
