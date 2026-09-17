import { describe, expect, it } from 'vitest'
// @ts-expect-error node types are intentionally not installed
import { existsSync } from 'node:fs'
// @ts-expect-error node types are intentionally not installed
import { fileURLToPath } from 'node:url'
import { loadStaticPages, renderSitemap, renderStaticPage } from '../../scripts/static-pages'
import { SITE_URL } from './links'

/**
 * The static pages are data (`site/**\/*.md`), so what can go wrong with them is
 * what goes wrong with data: a page that links to one that was renamed, or a
 * description too long to survive a search result. Nothing renders these in a
 * test browser — they are only ever seen after a deploy — so this is the one
 * place a broken link is caught before a crawler finds it.
 */
const pages = loadStaticPages()
const rendered = pages.map((p) => ({ page: p, html: renderStaticPage(p, pages) }))

/** Root-relative targets that are not pages: the app itself and `public/`. */
function resolves(href: string): boolean {
  const path = href.split(/[?#]/)[0].replace(/^\/|\/$/g, '')
  if (path === '') return true
  if (pages.some((p) => p.path === path)) return true
  return existsSync(fileURLToPath(new URL(`../../public/${path}`, import.meta.url)))
}

describe('static pages', () => {
  it('there are some', () => {
    expect(pages.length).toBeGreaterThan(0)
  })

  it.each(rendered)('$page.path links only to things that exist', ({ html }) => {
    const internal = [...html.matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1])
    expect(internal.filter((h) => !resolves(h))).toEqual([])
  })

  it.each(rendered)('$page.path has a description a result page will not cut', ({ page }) => {
    expect(page.description.length).toBeGreaterThan(50)
    expect(page.description.length).toBeLessThanOrEqual(300)
  })

  it.each(rendered)('$page.path names itself as canonical', ({ page, html }) => {
    expect(html).toContain(`<link rel="canonical" href="${SITE_URL}/${page.path}" />`)
    expect(page.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('the sitemap lists the root and every page, once', () => {
    const locs = [...renderSitemap(pages).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
    expect(locs).toEqual([`${SITE_URL}/`, ...pages.map((p) => `${SITE_URL}/${p.path}`)])
  })
})
