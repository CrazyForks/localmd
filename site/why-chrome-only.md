---
title: Why localmd only works in Chrome and Edge
description: localmd reads and writes a folder on your disk from a web page. The browser API that allows it, the File System Access API, ships only in Chromium browsers. What it is, where each browser stands, and why we did not work around it.
updated: 2026-09-17
---

**Short answer.** localmd is a web page that reads and writes a real folder on
your disk. One browser API makes that possible — the File System Access API,
specifically `showDirectoryPicker()` — and only Chromium browsers ship it:
Chrome, Edge, Opera and their relatives. Firefox and Safari do not, and neither
has announced plans to. We decided that was a limit worth stating plainly rather than
hiding behind an upload button or an installer.

## Where each browser stands

| Browser | Can a page open a folder on disk? |
|---|---|
| Chrome (desktop) | Yes, since version 86 |
| Edge (desktop) | Yes, since version 86 |
| Opera, Brave, Arc and other Chromium browsers | Generally yes; some disable it by default or behind a setting |
| Firefox | No. Mozilla's [published position](https://github.com/mozilla/standards-positions/issues/154) on the specification is negative |
| Safari (macOS and iOS) | No. Safari offers only the origin private file system, described below |

Checked against [caniuse](https://caniuse.com/mdn-api_window_showdirectorypicker)
on the date above.

## What the API does

`showDirectoryPicker()` shows the operating system's own folder dialog. You pick
one folder, and the page receives a handle to that folder and nothing else. With
it, the page can list, read and — after a second, separate permission prompt —
write the files inside.

What matters is what the page does *not* get:

- It cannot see anything outside the folder you picked. There is no path to walk
  up.
- It cannot open a folder by itself. Every grant starts with a dialog you
  answer.
- The browser refuses to hand over certain system folders at all.
- Permission belongs to the site and the folder, and the browser asks again
  when it has lapsed.

For localmd this is the entire security arrangement. There is no account and no
server holding a copy; the browser's permission dialog is the agreement.

## Why not the thing Safari has?

Safari, Firefox and Chrome all support the *origin private file system*. The
name is close and the thing is not. It is a storage area the browser creates for
one website: invisible in Finder or Explorer, unreachable by your other apps,
and erased when you clear the site's data.

Notes kept there are not your files in any useful sense. You cannot open them in
another editor, put them in git from a terminal, or back them up with everything
else. localmd exists so that the result is an ordinary folder that outlives the
app — a private sandbox is the opposite of that.

## Why not work around it?

Each workaround gives up something the product is for.

- **Upload the files.** Then there is a server, a copy of your documents on it,
  and an account to guard the copy. localmd has no backend, deliberately.
- **Ship a desktop app.** That works, and plenty of good tools do it. But
  "nothing to install" is half the point: a URL you can open on a machine you do
  not administer, with the browser's sandbox around it instead of an installer's
  full access.
- **Use a plain file input.** Every browser lets you pick a folder to *read*.
  None lets a page write back through it — and an agent that cannot save a note
  next to your PDFs is a chatbot.

So the honest shape of it is: one capability, in one family of browsers. That is
also why this kind of tool is rare. A company that needs to support every
browser cannot build on an API two of the three engines decline to ship.

## What works everywhere

[The demo](/?demo=1) runs in any modern browser, Firefox and Safari included. It
keeps a small knowledge base in memory — three linked notes and a real 43-page
paper with working citations — so nothing about it touches your disk.

A version for phones is being built. There is no date and nothing to sign up
for; when it is ready it will be at the same address, free and open like the
rest.

## If you are on Firefox or Safari today

Keep your browser. Install Chrome or Edge alongside it and use it for this one
site — the folder localmd writes is plain Markdown, so everything it produces
opens in whatever editor and browser you already use.
