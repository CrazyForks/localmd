/**
 * The site's other pages: `site/**\/*.md` → `<path>/index.html`, plus the
 * `sitemap.xml` that lists them.
 *
 * The app is one URL, and that is right for an app — but it means everything
 * localmd has to say in public is said on a single page, and a question like
 * "what is different from NotebookLM" has no address of its own for a search
 * engine, an LLM or a person to be sent to. These are those addresses.
 *
 * Plain HTML on purpose: no app bundle, no JS, no service worker. A page like
 * this is read once by someone who has never opened the app, usually arriving
 * from a search result, and by crawlers that do not execute anything. It must
 * be complete as served.
 *
 * What a page SAYS is data: a Markdown file with `title` and `description` in
 * its frontmatter, whose path under `site/` is its URL. Adding a page is adding
 * a file. This module is only the machinery — the template, the sitemap, and a
 * dev-server route so a page can be read while it is being written.
 *
 * The same rule as every other public surface applies to the copy: nothing here
 * may claim what the app does not do (`public/llms.txt` is the reference).
 */
// @ts-expect-error node types are intentionally not installed
import { readdirSync, readFileSync, statSync } from 'node:fs'
// @ts-expect-error node types are intentionally not installed
import { join, relative, sep } from 'node:path'
// @ts-expect-error node types are intentionally not installed
import { fileURLToPath } from 'node:url'
import { marked } from 'marked'
import type { Plugin } from 'vite'
import { splitFrontmatter } from '../src/lib/wiki'
import { SITE_URL, SOURCE_URL } from '../src/lib/links'

const SITE_DIR = fileURLToPath(new URL('../site', import.meta.url))

export interface StaticPage {
  /** URL path without slashes at either end: `alternatives/notebooklm`. */
  path: string
  title: string
  description: string
  /** ISO date the copy was last checked against reality — shown on the page,
   *  because a comparison with someone else's product has a shelf life. */
  updated: string
  html: string
}

function field(yaml: string, name: string, file: string): string {
  const m = yaml.match(new RegExp(`^${name}:\\s*(.+?)\\s*$`, 'm'))
  if (!m) throw new Error(`static-pages: ${file} has no \`${name}\` in its frontmatter`)
  return m[1].replace(/^(['"])(.*)\1$/, '$2')
}

function walk(dir: string): string[] {
  return (readdirSync(dir) as string[]).flatMap((name) => {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) return walk(full)
    return name.endsWith('.md') ? [full] : []
  })
}

export function loadStaticPages(): StaticPage[] {
  return walk(SITE_DIR)
    .sort()
    .map((file) => {
      const { yaml, body } = splitFrontmatter(readFileSync(file, 'utf8'))
      if (!yaml) throw new Error(`static-pages: ${file} has no frontmatter`)
      return {
        path: relative(SITE_DIR, file).replace(/\.md$/, '').split(sep).join('/'),
        title: field(yaml, 'title', file),
        description: field(yaml, 'description', file),
        updated: field(yaml, 'updated', file),
        html: marked.parse(body, { async: false }) as string,
      }
    })
}

const esc = (t: string) =>
  t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** The app's own palettes (main.css), so the page and the app it leads to are
 *  recognisably the same thing. Copied, not imported: this page loads no bundle. */
const CSS = `
:root{color-scheme:light dark;--bg:#fff;--bg1:#f6f8fa;--fg0:#1f2328;--fg1:#393f46;--fg2:#57606a;--accent:#0969da;--border:#d0d7de}
@media(prefers-color-scheme:dark){:root{--bg:#0d1117;--bg1:#161b22;--fg0:#e6edf3;--fg1:#c9d1d9;--fg2:#8b949e;--accent:#58a6ff;--border:#30363d}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg1);font:16px/1.65 system-ui,-apple-system,"Segoe UI",sans-serif;overflow-wrap:break-word}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
header,main,footer{max-width:46rem;margin:0 auto;padding:0 1.5rem}
header{display:flex;align-items:center;justify-content:space-between;padding-top:1.25rem;padding-bottom:1.25rem}
.brand{display:flex;align-items:center;gap:.5rem;color:var(--fg0);font-weight:600}
.brand img{width:1.5rem;height:1.5rem}
.cta{border:1px solid var(--border);border-radius:6px;padding:.35rem .8rem;font-size:.875rem}
main{padding-top:1.5rem;padding-bottom:3rem}
h1{font-size:2rem;line-height:1.2;color:var(--fg0);margin:0 0 1rem}
h2{font-size:1.35rem;color:var(--fg0);margin:2.5rem 0 .75rem}
h3{font-size:1.1rem;color:var(--fg0);margin:1.75rem 0 .5rem}
.updated{color:var(--fg2);font-size:.875rem;margin:0 0 2rem}
code{font:0.9em ui-monospace,Menlo,monospace;background:var(--bg1);border-radius:4px;padding:.1em .35em}
.table{overflow-x:auto;margin:1.25rem 0}
table{border-collapse:collapse;width:100%;font-size:.925rem}
th,td{border:1px solid var(--border);padding:.5rem .75rem;text-align:left;vertical-align:top}
th{background:var(--bg1);color:var(--fg0)}
blockquote{margin:1.25rem 0;padding-left:1rem;border-left:3px solid var(--border);color:var(--fg2)}
footer{border-top:1px solid var(--border);padding-top:1.5rem;padding-bottom:3rem;color:var(--fg2);font-size:.875rem}
footer p{margin:.4rem 0}
`.replace(/\n/g, '')

export function renderStaticPage(page: StaticPage, all: StaticPage[]): string {
  const url = `${SITE_URL}/${page.path}`
  const title = `${page.title} — localmd`
  const others = all.filter((p) => p.path !== page.path)
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.title,
    description: page.description,
    dateModified: page.updated,
    url,
    author: { '@type': 'Organization', name: 'localmd', url: SITE_URL },
  }
  // A wide table scrolls inside its own box instead of widening the page.
  const body = page.html.replace(/<table>/g, '<div class="table"><table>').replace(/<\/table>/g, '</table></div>')
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="/icon.svg" type="image/svg+xml" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(page.description)}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="localmd" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(page.description)}" />
    <meta property="og:image" content="${SITE_URL}/og.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
    <style>${CSS}</style>
  </head>
  <body>
    <header>
      <a class="brand" href="/"><img src="/icon.svg" alt="" />localmd</a>
      <a class="cta" href="/?demo=1">Try the demo</a>
    </header>
    <main>
      <h1>${esc(page.title)}</h1>
      <p class="updated">Last checked ${esc(page.updated)}</p>
${body}
    </main>
    <footer>
      <p><a href="/">localmd</a> — an agent lives in your folder, a wiki grows around your files. Free, open source (MIT), no account.</p>
      <p><a href="/?demo=1">Try the demo</a> · <a href="${SOURCE_URL}">Source on GitHub</a> · <a href="/llms.txt">llms.txt</a></p>
${others.length ? `      <p>${others.map((p) => `<a href="/${p.path}">${esc(p.title)}</a>`).join('<br />')}</p>\n` : ''}    </footer>
  </body>
</html>
`
}

export function renderSitemap(pages: StaticPage[]): string {
  const urls = [
    `  <url><loc>${SITE_URL}/</loc></url>`,
    ...pages.map(
      (p) => `  <url><loc>${SITE_URL}/${p.path}</loc><lastmod>${p.updated}</lastmod></url>`,
    ),
  ]
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
}

export function staticPages(): Plugin {
  return {
    name: 'localmd-static-pages',
    generateBundle() {
      const pages = loadStaticPages()
      for (const page of pages) {
        this.emitFile({
          type: 'asset',
          fileName: `${page.path}/index.html`,
          source: renderStaticPage(page, pages),
        })
      }
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: renderSitemap(pages) })
    },
    // Read fresh on every request: the point of the dev route is watching a
    // page change as its Markdown is edited.
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = ((req as { url?: string }).url ?? '').split('?')[0].replace(/^\/|\/$/g, '')
        if (path === 'sitemap.xml') {
          res.setHeader('Content-Type', 'application/xml')
          return res.end(renderSitemap(loadStaticPages()))
        }
        const pages = loadStaticPages()
        const page = pages.find((p) => p.path === path)
        if (!page) return next()
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.end(renderStaticPage(page, pages))
      })
    },
  }
}
