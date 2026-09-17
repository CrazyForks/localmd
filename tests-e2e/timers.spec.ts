import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * A running timer counts up from zero, and never passes through a negative.
 *
 * It did. `now` (components/chat/shared) is a one-second tick, while a part's
 * `startedAt` is a real `Date.now()` taken the moment that part began — two
 * clocks with no relationship to each other. A thought or a tool call starting
 * just after a tick is therefore briefly NEWER than the clock reading it, and
 * `Math.floor` of that sub-second negative is `-1`, not `0`. Every thought and
 * every tool call opened on `-1s` and corrected itself on the next tick.
 *
 * What this asserts is the thing the user can see: every value those timers
 * actually rendered, sampled often enough that nothing could come and go
 * between two reads. Unit tests cannot judge it — the arithmetic is right; it
 * is the phase between two clocks that was wrong.
 */

/** Collect every timer string that gets rendered, at 50ms — far below the
 *  up-to-a-second the wrong value stayed on screen. Tool rows render `3s`,
 *  thinking blocks `· 3s`, and a sealed one is `formatDuration`'s `3.4s`, which
 *  the pattern deliberately does not match: this is about the live ones.
 *
 *  Scanned from `body`, not `main`: the chat panel is a SIBLING of the main
 *  pane (AppLayout renders it after `</main>`), so the transcript a `main *`
 *  sweep reaches is empty — which is how the first version of this spec passed
 *  its way into finding no timers at all. */
const SAMPLE_TIMERS = `(() => {
  const seen = new Set()
  window.__timers = seen
  setInterval(() => {
    for (const el of document.body.querySelectorAll('*')) {
      if (el.children.length) continue
      const t = (el.textContent || '').trim()
      if (/^(?:·\\s*)?-?\\d+s$/.test(t)) seen.add(t)
    }
  }, 50)
})()`

async function openScaffolded(page: Page): Promise<void> {
  await page.goto('/?e2e=1')
  await expect(page.getByText('This folder is empty')).toBeVisible({ timeout: 10_000 })
  await page.getByRole('button', { name: /Initialize knowledge base/ }).click()
  await expect(page.getByPlaceholder(/Ask the agent/)).toBeVisible()
}

test('a live timer never reads a negative second', async ({ page }) => {
  test.setTimeout(60_000)
  await openScaffolded(page)
  await page.evaluate(SAMPLE_TIMERS)

  const input = page.getByPlaceholder(/Ask the agent/)

  // A thought long enough to cross several ticks, so the sampler sees the
  // first value (the one that was wrong) and the ones that follow it.
  await input.fill(`think ${'weighing this step of the plan. '.repeat(40)}`)
  await input.press('Enter')
  await expect(page.getByText('Done thinking').last()).toBeVisible({ timeout: 30_000 })

  // And a tool call that sits in `running` on its own row for seconds — the
  // other half of the report, and a part that starts mid-turn rather than at
  // the moment the clock was last set.
  await input.fill('hang 2500')
  await input.press('Enter')
  await expect(page.getByText('Finished the slow thing').last()).toBeVisible({ timeout: 30_000 })

  const seen = (await page.evaluate('Array.from(window.__timers)')) as string[]
  // The sampler caught the timers it is judging. Without this a run that never
  // rendered one would pass while testing nothing.
  expect(seen.length).toBeGreaterThan(2)
  expect(seen.filter((t) => t.includes('-'))).toEqual([])
})
