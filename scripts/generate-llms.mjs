import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

/** Parse UTM_GROUPS from src/data/utm.ts (group name -> { utm_source, utm_medium, utm_campaign, utm_content }). */
function readUtmGroups() {
	const utmPath = path.join(ROOT, 'src', 'data', 'utm.ts');
	let content = fs.readFileSync(utmPath, 'utf-8');
	content = content.replace(/\/\*\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
	const startMarker = 'UTM_GROUPS';
	const startIdx = content.indexOf(startMarker);
	if (startIdx === -1) return {};
	const objStart = content.indexOf('{', startIdx);
	if (objStart === -1) return {};
	let depth = 1;
	let pos = objStart + 1;
	while (pos < content.length && depth > 0) {
		const ch = content[pos];
		if (ch === '{') depth++;
		else if (ch === '}') depth--;
		pos++;
	}
	const objStr = content.slice(objStart, pos);
	const groups = {};
	const groupRegex = /(\w+)\s*:\s*\{/g;
	let m;
	while ((m = groupRegex.exec(objStr)) !== null) {
		const groupName = m[1];
		const innerStart = m.index + m[0].length;
		let innerDepth = 1;
		let innerEnd = innerStart;
		while (innerEnd < objStr.length && innerDepth > 0) {
			const c = objStr[innerEnd];
			if (c === '{') innerDepth++;
			else if (c === '}') innerDepth--;
			innerEnd++;
		}
		const inner = objStr.slice(innerStart, innerEnd - 1);
		const source = inner.match(/utm_source\s*:\s*['"]([^'"]+)['"]/);
		const medium = inner.match(/utm_medium\s*:\s*['"]([^'"]+)['"]/);
		const campaign = inner.match(/utm_campaign\s*:\s*['"]([^'"]+)['"]/);
		const contentVal = inner.match(/utm_content\s*:\s*['"]([^'"]+)['"]/);
		if (source && medium && campaign && contentVal) {
			groups[groupName] = {
				utm_source: source[1],
				utm_medium: medium[1],
				utm_campaign: campaign[1],
				utm_content: contentVal[1],
			};
		}
	}
	return groups;
}

/**
 * Replace URLs containing [groupName] with the full UTM URL (params + utm_term=slug).
 * Matches markdown links ](url) and bare URLs.
 */
function expandUtmLinksInBody(body, slug, utmGroups) {
	const groupNames = Object.keys(utmGroups);
	if (groupNames.length === 0) return body;
	// Match URL (in or out of markdown) that contains [groupName]
	const placeholderRegex = new RegExp(
		'(https?://[^\\s\\]\\)"]*)\\[(' + groupNames.join('|') + ')\\]([^\\s\\]\\)"]*)',
		'g'
	);
	return body.replace(placeholderRegex, (match, prefix, groupName, suffix) => {
		const group = utmGroups[groupName];
		if (!group) return match;
		const base = prefix + suffix;
		const url = new URL(base.startsWith('http') ? base : 'https://example.com/' + base);
		url.searchParams.set('utm_source', group.utm_source);
		url.searchParams.set('utm_medium', group.utm_medium);
		url.searchParams.set('utm_campaign', group.utm_campaign);
		url.searchParams.set('utm_content', group.utm_content);
		url.searchParams.set('utm_term', slug);
		return url.toString();
	});
}

function matchConst(raw, name) {
	const regex = new RegExp(
		`export\\s+const\\s+${name}\\s*=\\s*['"\`]([^'"\`]*)['"\`]`,
		's'
	);
	const m = raw.match(regex);
	if (!m) return null;
	return m[1].trim();
}

function readSiteMeta() {
	const configPath = path.join(ROOT, 'src', 'consts.ts');
	const raw = fs.readFileSync(configPath, 'utf-8');
	const title = matchConst(raw, 'SITE_TITLE');
	const description = matchConst(raw, 'SITE_DESCRIPTION');
	if (!title) throw new Error('SITE_TITLE not found in src/consts.ts');
	if (!description) throw new Error('SITE_DESCRIPTION not found in src/consts.ts');
	const author = matchConst(raw, 'SITE_AUTHOR');
	return { title, description, author: author || 'Ravia' };
}

function collectMdFiles(dir, base = '') {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	const files = [];
	for (const e of entries) {
		const rel = path.join(base, e.name);
		if (e.isDirectory()) {
			files.push(...collectMdFiles(path.join(dir, e.name), rel));
		} else if (e.isFile() && /\.(md|mdx)$/i.test(e.name)) {
			files.push(rel);
		}
	}
	return files;
}

function parsePost(filePath) {
	const raw = fs.readFileSync(filePath, 'utf-8');
	const frontMatterMatch = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
	let title = path.basename(filePath, path.extname(filePath));
	let body = raw;
	let pubDate = null;

	if (frontMatterMatch) {
		const fm = frontMatterMatch[1];
		const t = fm.match(/title:\s*['"\`]?(.+?)['"\`]?\s*$/m);
		if (t) title = t[1].trim();
		const d = fm.match(/pubDate:\s*(\S+)/m);
		if (d) pubDate = new Date(d[1]);
		body = raw.slice(frontMatterMatch[0].length);
	}

	return { title, body: body.trim(), pubDate };
}

const siteMeta = readSiteMeta();
const utmGroups = readUtmGroups();
const contentDir = path.join(ROOT, 'src', 'content', 'blog');
const relativeFiles = collectMdFiles(contentDir);

const sections = relativeFiles.map((rel) => {
	const fullPath = path.join(contentDir, rel);
	const slug = path.basename(rel, path.extname(rel));
	const { title, body, pubDate } = parsePost(fullPath);
	return { slug, title, body, pubDate };
});

sections.sort((a, b) => {
	if (!a.pubDate && !b.pubDate) return 0;
	if (!a.pubDate) return 1;
	if (!b.pubDate) return -1;
	return b.pubDate.getTime() - a.pubDate.getTime();
});

const header = [
	siteMeta.title,
	siteMeta.author,
	siteMeta.description,
	'',
	`Generated on ${new Date().toISOString()}`,
	'Contains the markdown content of each blog post.',
'UTM placeholders in links (e.g. [cta_utm]) are expanded to full URLs with utm_term = post slug.',
].join('\n');

const postBlocks = sections.map((s) => {
	const bodyExpanded = expandUtmLinksInBody(s.body, s.slug, utmGroups);
	return [`## ${s.title}`, `Slug: ${s.slug}`, '', bodyExpanded].join('\n');
});

const output = [header, ...postBlocks].join('\n\n---\n\n');

const outPath = path.join(ROOT, 'public', 'llms.txt');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, output, 'utf-8');

console.log(`Wrote ${outPath} (${sections.length} posts)`);
