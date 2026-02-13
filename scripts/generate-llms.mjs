import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

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
].join('\n');

const postBlocks = sections.map(
	(s) => [`## ${s.title}`, `Slug: ${s.slug}`, '', s.body].join('\n')
);

const output = [header, ...postBlocks].join('\n\n---\n\n');

const outPath = path.join(ROOT, 'public', 'llms.txt');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, output, 'utf-8');

console.log(`Wrote ${outPath} (${sections.length} posts)`);
