---
title: A ChatPDF alternative that keeps the answers in your own notes
description: localmd is a free, open-source alternative to ChatPDF for people whose PDFs already sit in a folder. It reads them in place, without uploading, and saves answers as Markdown notes with citations that click back to the exact paragraph.
updated: 2026-09-17
---

**Short answer.** ChatPDF is the fastest way to ask one PDF a question: drop the
file on the page and type. If that is all you need, use it. localmd is for the
next problem — when there are forty PDFs, they already live in a folder, and you
want what you learned to still exist next month. It is a web page you point at
that folder: it reads the PDFs and EPUBs where they are, and writes answers into
Markdown notes beside them, each claim citing the paragraph it came from. The
app is free and open source (MIT); you bring your own model API key.

## Side by side

| | ChatPDF | localmd |
|---|---|---|
| How a document gets in | You upload it; it is stored, encrypted, on ChatPDF's servers | It stays in your folder; nothing is uploaded to localmd |
| Where the answers end up | In the chat history on ChatPDF | Markdown files in your folder, readable in any editor |
| Working across many documents | Folders and multi-file chat, with an account | The whole folder, as it is on disk |
| Citations | Clickable, and scroll to the source in the uploaded PDF — inside the chat | Clickable, open the exact paragraph of the PDF or EPUB, highlighted — and written into your own notes, so they are still there after the chat is gone |
| Free use | 2 documents a day | The app is free, without limits of its own |
| Paid | ChatPDF Plus subscription | None. You pay your model provider directly for what you use |
| Model | Chosen for you (GPT-4o family) | Your choice: Anthropic, OpenAI, Google Gemini, DeepSeek and others |
| Setup | None — no account needed to try | An API key, past the built-in demo |
| Formats | PDF, Word, PowerPoint, Markdown, text | PDF, EPUB and Markdown with paragraph-level citations; Word is read and cited as a whole document |
| Browsers | Any | Chrome or Edge on a desktop ([why](/why-chrome-only)) |
| Source code | Closed | Open, MIT |

ChatPDF's column is from [chatpdf.com](https://www.chatpdf.com/), read on the
date above.

## The difference that matters: what is left afterwards

A chat about a PDF is useful for ten minutes. Then the tab closes, and what you
worked out is a scroll position in someone else's history.

localmd's agent writes things down. Ask it about a paper and the answer can
become a note in your folder — plain Markdown, linked to your other notes, with
citation tokens like `[[1:b14-3]]` that open the source at that paragraph. Read
ten papers this way and you have ten linked pages and an index, not ten chat
logs. Those files are yours: they open in any editor, with or without localmd.

## What "local" does and does not mean here

Your PDFs are never uploaded to localmd — there is no localmd server to upload
them to. But **the text the agent reads is sent to the model provider you
configured**, under your own key. If a document must not reach any third-party
API, neither tool is the right one.

## What you give up

- **Instant start.** ChatPDF needs nothing. localmd needs an API key once you
  are past the demo, and you pay the provider for usage.
- **PowerPoint files.** Not supported.
- **Any browser, any device.** Opening a real folder needs Chrome or Edge on a
  desktop.
- **Scanned PDFs take an extra step**: a scan has no text layer, so you press
  the OCR button on the document first. It runs on your machine and makes
  mistakes.

## Try it without setting anything up

[The demo](/?demo=1) opens with no folder and no key: a real 43-page paper with
working citations, three linked notes, and a small free model allowance for a
few questions.
