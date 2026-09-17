---
title: A NotebookLM alternative that works on the folder you already have
description: localmd is a free, open-source alternative to NotebookLM (now Gemini Notebook) that reads the PDFs, EPUBs and notes in a folder on your own disk, without uploading them, and writes cited Markdown back into that folder.
updated: 2026-09-17
---

**Short answer.** NotebookLM — Google renamed it Gemini Notebook in 2026 — has
you upload your sources into a notebook in your Google account, and what it
produces stays there. localmd is a web page you point at a folder on your own
disk: it reads the PDFs, EPUBs and Markdown already in it, and writes linked
Markdown notes back into that same folder, with citations that click through to
the exact paragraph. Nothing is uploaded to us, because there is no "us" to
upload to — the app has no backend. It is free and open source (MIT); you bring
your own model API key.

If you want podcast-style audio summaries, a phone app, or you would rather not
deal with an API key, stay with Gemini Notebook. It is very good, and it is
free. If you want the results to be ordinary files you own, read on.

## Side by side

| | NotebookLM / Gemini Notebook | localmd |
|---|---|---|
| Where your sources live | Uploaded to Google, in your Google account | They stay in your folder; nothing is uploaded to localmd |
| Where the answers end up | In the notebook | Markdown files in your folder, readable in any editor |
| Citations | Point into the uploaded copy, inside the notebook | Written into your Markdown; click through to the exact paragraph of the PDF or EPUB, highlighted |
| Source limit | 50 per notebook free, 100 on Plus, 300 on Pro | None set by the app |
| Daily question limit | 50 a day free, 200 on Plus, 500 on Pro | None set by the app — your own key, your provider's limits |
| Account | Google account | None |
| Model | Google's Gemini | Your choice: Anthropic, OpenAI, Google Gemini, DeepSeek, and others, or any OpenAI-compatible endpoint |
| Price | Free tier; higher limits with a Google AI plan | The app is free; you pay your model provider directly for what you use |
| Can it edit your files? | No — it reads sources and keeps its own notes | Yes. Every change is a diff you approve, and an ask-first mode writes nothing until you say so |
| Audio overviews, video overviews, mind maps | Yes | No |
| Browsers | Any modern browser, plus mobile apps | Chrome or Edge on a desktop ([why](/why-chrome-only)) |
| Source code | Closed | Open, MIT |

The limits in the Google column are from
[Google's own help page](https://support.google.com/notebooklm/answer/16213268),
read on the date above. They have changed before and will again — check there
for today's numbers.

## What is actually different

### The output is files, not a notebook

This is the whole point. Ask localmd about a 300-page PDF and the answer can be
saved as a note in your folder: plain Markdown, with `[[wikilinks]]` to your
other notes and citations back to the source. Close the tab, open the folder in
any other editor, and it is all still there. If localmd disappeared tomorrow
you would lose the app, not the work.

### Citations you can keep

A citation in localmd is a short token in your Markdown, like `[[1:b14-3]]`,
that names a document and a paragraph in it. Click it and the PDF or EPUB opens
at that paragraph, highlighted. Because the token lives in your own file, it is
still there next month. Paragraph ids are kept when a document's index is
rebuilt, and where a rebuild could not keep them — the file itself changed, say
— the app stops and tells you which citations are at stake before it does
anything.

This works for PDF, EPUB and Markdown. Word files are read too, but are cited as
a whole document rather than paragraph by paragraph.

### No upload step

There is nothing to gather and upload. You grant the page one folder — your
papers folder, a project directory, an existing notes vault — and the agent
works on what is there, in the layout you already have. It adds notes beside
your material; it does not rearrange your files unless you ask it to.

Be precise about what "local" means, though. **Your files stay in your folder,
but the text the agent reads goes to the model provider you configured**, under
your own key. localmd has no server in the middle, but the model is still
someone's API. "Nothing ever leaves your machine" would be false, and we don't
claim it.

### It is an agent, not only a reader

Gemini Notebook answers questions about sources. localmd's agent can also do
things in the folder: write and link pages, keep an index, search the web, reach
the tabs open in your browser through an optional extension, and use MCP
servers. Git is built in, so every change has history underneath it.

## What you give up

- **Audio and video overviews.** localmd has nothing like them.
- **Zero setup.** Past the built-in demo, you need an API key from a model
  provider, and you pay that provider for what you use.
- **Browser choice and mobile.** Opening a real folder needs Chrome or Edge on a
  desktop. [Here is why](/why-chrome-only).
- **Polish.** Gemini Notebook is a Google product. localmd is a solo project,
  and it has rough edges.
- **Scanned PDFs take an extra step.** A scan has no text layer, so it indexes
  to nothing until you press the OCR button on the document. OCR runs on your
  machine, takes seconds per page, and makes mistakes.

## Try it without setting anything up

[The demo](/?demo=1) opens in the tab with no folder and no key: three linked
notes and a real 43-page paper with working citations, plus a small free model
allowance for a few questions. It runs in any modern browser, because it lives
in memory.

When you want it on your own files, open [localmd.app](/) in Chrome or Edge and
pick a folder.
