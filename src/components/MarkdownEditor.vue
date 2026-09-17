<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import {
  EditorView,
  keymap,
  gutters,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
} from '@codemirror/view'
import { EditorState, Compartment, Prec, type Extension } from '@codemirror/state'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { yamlFrontmatter } from '@codemirror/lang-yaml'
import { languages } from '@codemirror/language-data'
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  HighlightStyle,
  LanguageDescription,
} from '@codemirror/language'
import { tags } from '@lezer/highlight'
import {
  autocompletion,
  type CompletionContext,
  type CompletionResult,
} from '@codemirror/autocomplete'
import { oneDarkTheme, oneDarkHighlightStyle } from '@codemirror/theme-one-dark'
import { useFilesStore } from '@/stores/files'
import { useThemeStore } from '@/stores/theme'
import { useSettingsStore } from '@/stores/settings'
import { editorScroll } from '@/lib/viewMemory'
import { markdownEditing } from '@/lib/editor/keymap'
import { mediaPaste } from '@/lib/editor/paste'
import { richMarkdown } from '@/lib/editor/richMarkdown'
import * as fs from '@/lib/fs'
import { mimeFor } from '@/lib/filetypes'

const files = useFilesStore()
const theme = useThemeStore()
const settings = useSettingsStore()

const host = ref<HTMLElement | null>(null)
let view: EditorView | null = null
const themeCompartment = new Compartment()
const languageCompartment = new Compartment()

/** Object URLs for images drawn inside the editor, revoked when it goes away. */
const imageUrls = new Map<string, string>()

async function readImage(path: string): Promise<string> {
  const cached = imageUrls.get(path)
  if (cached) return cached
  const buf = await fs.readBinary(path)
  const url = URL.createObjectURL(new Blob([buf], { type: mimeFor(path) }))
  imageUrls.set(path, url)
  return url
}

function richExt(): Extension {
  if (!settings.state.richEditor) return []
  return richMarkdown({
    resolvePath: (href) => files.resolveMarkdownLink(files.currentPath ?? '', href),
    readImage,
    openLink: (href) => {
      if (/^https?:\/\//i.test(href)) {
        window.open(href, '_blank', 'noopener')
        return
      }
      const rel = files.resolveMarkdownLink(files.currentPath ?? '', href)
      if (rel) void files.openFile(rel)
    },
  })
}

/**
 * What oneDark gets wrong for a notes app: it paints headings and property
 * names coral, so every page opens with its own title — and its whole
 * frontmatter block — shouting in red before a word of the writing is read.
 * That is a colour for errors, and a heading is not one.
 *
 * Built from oneDark's own specs with ours appended rather than layered as a
 * second highlighter: two highlighters both emit their class onto the same
 * span, and which colour lands is then a question about the order rules were
 * written into the stylesheet — a coin toss to build a look on. Appended
 * inside ONE style, the later spec for a tag simply replaces the earlier one.
 * The rest of the theme stays as it is: a hand-rolled palette for every tag in
 * every language would be a far larger thing to own. The app's own accent takes
 * the headings, and the frontmatter drops to a comment-grey — it is metadata
 * about the page, not part of it, and reads best as the quietest thing on
 * screen.
 */
const darkHighlight = HighlightStyle.define([
  ...oneDarkHighlightStyle.specs,
  {
    tag: [
      tags.heading,
      tags.heading1,
      tags.heading2,
      tags.heading3,
      tags.heading4,
      tags.heading5,
      tags.heading6,
    ],
    color: 'rgb(var(--c-accent))',
    fontWeight: 'bold',
  },
  {
    tag: [tags.propertyName, tags.definition(tags.propertyName)],
    color: 'rgb(var(--c-fg-3))',
  },
])

function themeExt() {
  return theme.isDark
    ? [oneDarkTheme, syntaxHighlighting(darkHighlight)]
    : syntaxHighlighting(defaultHighlightStyle)
}

/**
 * The editor's chrome, quietened: a muted, borderless, transparent gutter that
 * recedes behind the text, and the line you are on marked by its number alone.
 * No band across the writing — the pale line both the base theme and oneDark
 * paint has no counterpart in the preview, and the point of this editor is that
 * the words look the same either side of the toggle.
 *
 * Raised in precedence because position in the extension list does not do it:
 * placed after the theme compartment this lost to oneDark, whose grey gutter
 * and active-line band both showed through in dark mode while light mode, with
 * only the base theme to beat, looked right.
 */
const gutterTheme = Prec.high(
  EditorView.theme({
    '.cm-gutters': {
      backgroundColor: 'transparent',
      border: 'none',
      color: 'rgb(var(--c-fg-3) / 0.45)',
    },
    // The number column fills the gutter, or `textAlign` below has nothing to
    // align within: a gutter is as wide as its widest number otherwise.
    '.cm-lineNumbers': {
      flexGrow: '1',
    },
    '.cm-lineNumbers .cm-gutterElement': {
      color: 'rgb(var(--c-fg-3) / 0.45)',
      fontVariantNumeric: 'tabular-nums',
      // The gutter has a fixed width (main.css); the numbers keep to the text
      // side of it.
      textAlign: 'right',
      paddingRight: '0.5rem',
    },
    '.cm-activeLine': {
      backgroundColor: 'transparent',
    },
    // Spelled out in full: the number rule above is two classes deep, and
    // would otherwise keep the active number as grey as the rest.
    '.cm-lineNumbers .cm-gutterElement.cm-activeLineGutter': {
      backgroundColor: 'rgb(var(--c-accent) / 0.15)',
      color: 'rgb(var(--c-accent))',
    },
  }),
)

/** Language for a file: markdown (with wikilink support) for .md, otherwise the
 *  CodeMirror language matching the filename, or plain text. Keeps the markdown
 *  highlighter from italicising/underlining JSON, YAML and other text files. */
async function langExtFor(path: string | null): Promise<Extension> {
  if (!path) return []
  if (/\.md$/i.test(path)) {
    // The editing keys and media paste ride along with the language, so they
    // are only live in markdown — `![](shot.png)` in a .json file is nonsense.
    return [
      // Frontmatter is yaml, and saying so is not a nicety: to a markdown
      // parser alone, `---` under a block of text is a setext heading, so every
      // page's metadata was parsed — and coloured — as one enormous title.
      yamlFrontmatter({
        content: markdown({ base: markdownLanguage, codeLanguages: languages }),
      }),
      markdownEditing,
      mediaPaste(() => files.currentPath),
      richExt(),
    ]
  }
  const name = path.slice(path.lastIndexOf('/') + 1)
  const desc = LanguageDescription.matchFilename(languages, name)
  if (!desc) return []
  try {
    return await desc.load()
  } catch {
    return []
  }
}

/** Reconfigure the language compartment for `path`. Guarded against races so a
 *  slow async load for a since-closed file can't clobber the current one. */
let langToken = 0
async function applyLanguage(path: string | null): Promise<void> {
  const token = ++langToken
  const ext = await langExtFor(path)
  if (token !== langToken || !view) return
  view.dispatch({ effects: languageCompartment.reconfigure(ext) })
}

/** [[ triggers wikilink completion over the KB's markdown files: stems for
 *  wiki-style targets, full paths as secondary matches. Inserts the closing
 *  ]] unless auto-close already put one after the cursor. */
function wikilinkCompletions(context: CompletionContext): CompletionResult | null {
  const before = context.matchBefore(/\[\[([^\][\n]*)$/)
  if (!before) return null
  const from = before.from + 2 // after the [[
  const closed = context.state.sliceDoc(context.pos, context.pos + 2) === ']]'
  const seen = new Set<string>()
  const options = files.mdFiles.flatMap((path) => {
    const stem = path.slice(path.lastIndexOf('/') + 1).replace(/\.md$/i, '')
    const target = path.replace(/\.md$/i, '')
    const out = []
    if (!seen.has(stem)) {
      seen.add(stem)
      out.push({ label: stem, detail: path, apply: closed ? stem : `${stem}]]` })
    }
    if (target !== stem && !seen.has(target)) {
      seen.add(target)
      out.push({ label: target, apply: closed ? target : `${target}]]`, boost: -1 })
    }
    return out
  })
  return { from, options, validFor: /^[^\][\n]*$/ }
}

function createView(): void {
  view = new EditorView({
    parent: host.value!,
    state: EditorState.create({
      doc: files.content,
      extensions: [
        // Not sticky: stickiness exists so the numbers survive horizontal
        // scrolling, and this editor wraps its lines, so there is nothing to
        // scroll sideways. Unfixed, the gutter is an ordinary flex child and
        // lays out where the CSS says. Said through `gutters`, because
        // `lineNumbers` takes no such option.
        gutters({ fixed: false }),
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
        languageCompartment.of([]),
        autocompletion({ override: [wikilinkCompletions], icons: false }),
        EditorView.lineWrapping,
        themeCompartment.of(themeExt()),
        gutterTheme,
        EditorView.updateListener.of((u) => {
          if (u.docChanged) files.onEdited(u.state.doc.toString())
        }),
      ],
    }),
  })
}

/** Scroll to and select the first occurrence of `target` (a broken link's raw
 *  text). Used by the health panel to jump straight to the offending link. */
function revealTarget(target: string): void {
  if (!view) return
  const idx = view.state.doc.toString().indexOf(target)
  if (idx < 0) return
  view.dispatch({
    selection: { anchor: idx, head: idx + target.length },
    effects: EditorView.scrollIntoView(idx, { y: 'center' }),
  })
  view.focus()
}

onMounted(() => {
  createView()
  void applyLanguage(files.currentPath)
  shownPath = files.currentPath
  const rev = files.reveal
  if (rev && rev.path === files.currentPath) {
    requestAnimationFrame(() => revealTarget(rev.target))
  } else {
    const saved = shownPath ? (editorScroll.get(shownPath) ?? 0) : 0
    requestAnimationFrame(() => {
      if (view) view.scrollDOM.scrollTop = saved
    })
  }
})

// A reveal request for the already-mounted editor (file already current, or a
// fresh file whose content-replace restores scroll — this rAF runs after it).
watch(
  () => files.reveal?.nonce,
  () => {
    const rev = files.reveal
    if (!rev || rev.path !== files.currentPath || !view) return
    requestAnimationFrame(() => revealTarget(rev.target))
  },
)

onBeforeUnmount(() => {
  if (shownPath && view) editorScroll.set(shownPath, view.scrollDOM.scrollTop)
  view?.destroy()
  view = null
  for (const url of imageUrls.values()) URL.revokeObjectURL(url)
  imageUrls.clear()
})

let shownPath: string | null = null

// Replace the document when a different file is opened (or reloaded from disk).
watch(
  () => [files.currentPath, files.content] as const,
  ([path, content]) => {
    if (!view) return
    if (path !== shownPath) void applyLanguage(path)
    if (view.state.doc.toString() === content) {
      shownPath = path
      return
    }
    if (shownPath) editorScroll.set(shownPath, view.scrollDOM.scrollTop)
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: content } })
    const saved = path ? (editorScroll.get(path) ?? 0) : 0
    requestAnimationFrame(() => {
      if (view) view.scrollDOM.scrollTop = saved
    })
    shownPath = path
  },
)

watch(
  () => theme.isDark,
  () => view?.dispatch({ effects: themeCompartment.reconfigure(themeExt()) }),
)

// Turning live rendering on or off applies to the open file straight away —
// it lives in the language compartment, so reconfigure that.
watch(
  () => settings.state.richEditor,
  () => void applyLanguage(files.currentPath),
)
</script>

<template>
  <!-- The editor is the pane, and everything about where things sit inside it
       is the CSS's business (see the `.cm-scroller` block in main.css): the
       scrollbar at the right edge, the numbers at the left one, the text in the
       preview's column. Two classes that used to be here and may not come back:
       `max-w-3xl` would move the scrollbar in from the edge along with the
       column, and `panel-scroll` would style a scrollbar that never scrolls —
       the scroller inside CodeMirror is the one that does. -->
  <div ref="host" class="h-full selectable" />
</template>
