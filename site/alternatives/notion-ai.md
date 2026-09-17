---
title: A Notion AI alternative where your notes are files in your own folder
description: localmd is a free, open-source alternative to Notion AI for people who want an AI agent working on their notes without moving them into someone else's database. Plain Markdown in a local folder, no account, your own model key.
updated: 2026-09-17
---

**Short answer.** Notion AI is an assistant inside Notion: it works on pages
that live in Notion's cloud, and it comes with the Business plan. localmd is an
agent inside a folder on your own disk: your notes are plain Markdown files, the
app is a web page with no backend and no account, and you pay only your model
provider. If your team lives in Notion — shared databases, comments, permissions
— stay there; localmd does none of that. If what you want is an AI that works on
notes you own as files, this is that.

## Side by side

| | Notion AI | localmd |
|---|---|---|
| Where your notes live | Notion's cloud database | Markdown files in a folder on your disk |
| Leaving | Export to Markdown or HTML | Nothing to export — the folder is the data |
| Account | Required | None |
| AI pricing | Included in the Business plan, $20 per seat per month; Free and Plus get a limited trial | The app is free; you pay your model provider directly for what you use |
| Model | Chosen by Notion | Your choice: Anthropic, OpenAI, Google Gemini, DeepSeek and others |
| PDFs and EPUBs | Files you upload into the workspace | The ones already in the folder, with citations that click through to the exact paragraph |
| Changes to your notes | Applied in the workspace, with page history | Every change is a diff you approve; git history underneath |
| Real-time collaboration, comments, permissions | Yes | No |
| Databases, boards, calendars | Yes | No — notes, links, backlinks and a graph |
| Mobile and desktop apps | Yes | No; Chrome or Edge on a desktop ([why](/why-chrome-only)) |
| Source code | Closed | Open, MIT |

Notion's column is from [notion.com/pricing](https://www.notion.com/pricing),
read on the date above.

## Why someone leaves Notion for a folder

Not because Notion is bad. Because the notes are the long-lived thing and the
app is not. Notes in a database are reachable through that product, on that
company's terms; notes in a folder are reachable by everything — your editor,
your backup, git, the next tool you try.

The usual cost of a plain folder is that it does nothing for you: no links kept
up, no index, no one to ask. That is the part localmd's agent takes on. It reads
what is in the folder — notes, PDFs, EPUBs — writes new linked pages beside
them, keeps an index if you want one, and shows you every change as a diff
before it lands. It adds; it does not rearrange your files unless you ask.

## What "local" does and does not mean here

There is no localmd server, so your notes are not stored anywhere but your own
disk. But **the text the agent reads is sent to the model provider you
configured**, under your own key — the same is true of any AI assistant that
uses a hosted model.

## What you give up

- **Teams.** localmd is a single-person tool. Sharing is git: push the folder to
  GitHub and someone else can clone it.
- **Databases and views.** No tables-as-databases, boards or calendars.
- **Phones.** There is no mobile version yet.
- **Zero setup.** Past the demo you need an API key from a model provider.
- **Polish.** It is a solo project with rough edges.

## Try it without setting anything up

[The demo](/?demo=1) opens with no folder and no key: three linked notes, a real
43-page paper with working citations, and a small free model allowance for a few
questions.
