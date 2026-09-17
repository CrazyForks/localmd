---
title: localmd and Obsidian AI plugins, and when to use which
description: Obsidian has no built-in AI; you add it with community plugins. localmd is a web page with an agent built in that opens the same folder of Markdown. An honest comparison, and how to use the two side by side on one vault.
updated: 2026-09-17
---

**Short answer.** These are not rivals, and this page will not tell you to leave
Obsidian. An Obsidian vault is a folder of Markdown files, and localmd is a web
page that opens a folder of Markdown files — so the two work on the same notes,
and you can use both. The difference is where the AI comes from. In Obsidian you
assemble it: pick community plugins, install them, give each its keys, and in
some setups install a coding agent for them to drive. In localmd the agent is
part of the page, along with a PDF and EPUB reader whose citations click back to
the exact paragraph. Both are free; localmd is open source (MIT).

## Side by side

| | Obsidian + AI plugins | localmd |
|---|---|---|
| Your notes | Markdown files in a folder | The same — it can open your existing vault |
| Install | The Obsidian app, then each plugin | Nothing. It is a URL |
| Where the AI comes from | Community plugins you choose and configure — for example [Copilot](https://github.com/logancyang/obsidian-copilot) for chat and agents, [Smart Connections](https://github.com/brianpetro/obsidian-smart-connections) for related notes | Built in: one agent that reads, searches, writes and links |
| Keys and accounts | Per plugin: your own provider key, a plugin's paid plan, or an existing Claude Code or Codex install, depending on the plugin | One place: your own provider key |
| Local models | Supported by several plugins | Not something we have verified, so not something we claim |
| PDFs and EPUBs | Depends on the plugin | Indexed by paragraph; answers cite the paragraph and clicking opens it, highlighted |
| Changes to your notes | Depends on the plugin | Always a diff you approve; an ask-first mode writes nothing until you say yes; git underneath |
| Plugins, themes, canvas, the rest of the ecosystem | Thousands | None of that — localmd has skills and MCP servers instead |
| Works offline | Yes, fully, without AI | Reading, writing and search yes; the agent needs a connection |
| Mobile | Yes | Not yet |
| Browsers and platforms | Desktop and mobile apps | Chrome or Edge on a desktop ([why](/why-chrome-only)) |
| Source code | Obsidian is closed; plugins vary | Open, MIT |

The plugin facts are from each project's own README, read on the date above.
Plugins change quickly — check the ones you use.

## Using both on the same vault

Open your vault's folder in localmd and nothing is converted or moved. It
understands `[[wikilinks]]` and backlinks, and it does not impose a layout: an
existing folder keeps its structure, and the agent files new pages according to
how you already organize things.

What it adds to the folder is a `.localmd/` directory holding document indexes,
and whatever notes you ask the agent to write. Obsidian ignores the first and
shows the second like any other note. Citation tokens such as `[[1:b14-3]]` are
plain text in Obsidian; they become clickable when the note is opened in
localmd.

A common split: write and organize in Obsidian as you always have; open the same
folder in localmd when you want to read a book or a stack of papers *into* the
vault, with citations you can follow back.

## When Obsidian's plugins are the better answer

- You want AI inside the editor you already spend the day in.
- You want a local model, fully offline.
- You are on a phone, or on Firefox or Safari.
- You enjoy tuning the setup. Many people do, and the ecosystem rewards it.

## When localmd is

- You do not want to be the integrator — choosing plugins, wiring keys, keeping
  them working across updates.
- Your material is mostly PDFs and EPUBs, and you need citations that land on the
  paragraph.
- You are on a machine where you cannot install software, but you can open a
  URL.
- You want every change the agent makes to arrive as a diff you approve.

## What "local" does and does not mean here

Your files stay in your folder either way. With localmd, **the text the agent
reads is sent to the model provider you configured**, under your own key. There
is no localmd server in between, but a hosted model is still someone's API.

## Try it without setting anything up

[The demo](/?demo=1) opens with no folder and no key: three linked notes, a real
43-page paper with working citations, and a small free model allowance for a few
questions.
