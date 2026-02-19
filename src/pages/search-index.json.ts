import { getCollection } from 'astro:content';
import { getCategoryLabel } from '../consts';

/** Converte markdown/MDX bruto em texto puro para indexação de busca. */
function markdownToPlainText(raw: string): string {
	if (!raw || typeof raw !== 'string') return '';
	let text = raw
		// Blocos de código (```...```)
		.replace(/```[\s\S]*?```/g, ' ')
		// Links: [texto](url) -> texto
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		// Imagens: ![alt](url) -> vazio
		.replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
		// Headers: # ## ### etc
		.replace(/^#{1,6}\s+/gm, ' ')
		// Negrito/itálico: ** __ * _
		.replace(/\*{2}([^*]+)\*{2}|_{2}([^_]+)_{2}|\*([^*]+)\*|_([^_]+)_/g, '$1$2$3$4')
		// Código inline: `...`
		.replace(/`([^`]+)`/g, '$1')
		// Referências de link [texto][ref]
		.replace(/\[[^\]]+\](?:\s*\[[^\]]*\])?/g, ' ')
		// MDX/JSX: remove tags e expressões (simplificado)
		.replace(/<[^>]+>/g, ' ')
		.replace(/\{[^}]*\}/g, ' ')
		// Listas e blockquotes
		.replace(/^\s*[-*+]\s+/gm, ' ')
		.replace(/^\s*\d+\.\s+/gm, ' ')
		.replace(/^\s*>\s+/gm, ' ')
		.replace(/^---+$/gm, ' ')
		.replace(/^\*\*\*+$/gm, ' ')
		// Quebras de linha e espaços múltiplos
		.replace(/\s+/g, ' ')
		.trim();
	return text;
}

export async function GET() {
	const posts = await getCollection('blog');
	const index = posts.map((post) => {
		const hero = post.data.heroImage;
		const heroImageSrc =
			hero != null && typeof hero === 'object' && 'src' in hero
				? String((hero as { src: string }).src)
				: null;
		const rawBody = typeof (post as { body?: string }).body === 'string'
			? (post as { body: string }).body
			: '';
		return {
			id: post.id,
			title: post.data.title,
			description: post.data.description,
			category: post.data.category,
			categoryLabel: getCategoryLabel(post.data.category),
			heroImageSrc,
			bodyPlain: markdownToPlainText(rawBody),
		};
	});
	return new Response(JSON.stringify(index), {
		headers: {
			'Content-Type': 'application/json',
		},
	});
}
