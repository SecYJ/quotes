# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **站长**（the owner, one person): hears a good line in a drama, a book, a conversation or a podcast, writes it down later, and comes back to reread by source, by theme, or by searching a half-remembered word.
- **访客** (anyone the owner shares a link with, or who finds the site): reads without logging in. Reading by the owner and reading by visitors matter equally; the site must reward someone rereading for the hundredth time and make sense to someone seeing it for the first time.

## Product Purpose

A public, personal commonplace book of quotes. Every quote keeps where it came from. Success: the owner keeps adding to it, can find any quote again in seconds, and a visitor sent a link understands at once what they're looking at and wants to read on.

## Operating Context

- Quotes are added outside the site: the owner edits a YAML file per source and pushes; the site rebuilds. The site itself is read-only.
- Read on phones, tablets and desktop (including a 3440×1440 ultrawide).
- Collection size: dozens now, a few hundred over time.

## Capabilities and Constraints

- One page only (阅览页): list all quotes, newest first; filter by source and by tag (combinable); keyword search over content and speaker; filter state lives in the URL so a filtered view can be shared.
- A quote has: content (required), source (required; type is drama / book / real life / other), speaker, source detail, note, at least one tag, date added.
- No login, no writing, no features beyond the list above.
- Static site (Astro), hosted on Cloudflare Pages.
- Terms are defined in GLOSSARY.md.
- Product name: **拾句** ("picking up lines", chosen by the owner on 2026-11-14). "Lines" was the working name and survives only as the repo and package name.

## Brand Commitments

- Interface language: Simplified Chinese.
- Quote content is mostly Chinese with some English; both must read well.

## Evidence on Hand

- Content: `src/content/sources/*.yaml` holds the owner's real collection (the test quotes were removed on 2026-11-14). It is still small: a handful of quotes, mostly witty one-liners seen online.

## Product Principles

- The quote is the content; everything else serves finding and reading it.
- Every quote is shown with its source, never alone.
- Finding a quote again must be fast: source, tag and search are first-class, not hidden.
- Nothing on the site pretends to be more than one person's notebook.
