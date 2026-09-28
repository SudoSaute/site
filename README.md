# christiancarrasco.dev

Personal site built with [Hugo](https://gohugo.io) (extended, v0.166.0) and the
[Blowfish](https://github.com/nunocoracao/blowfish) theme, deployed to GitHub Pages by GitHub Actions.
See `DEPLOYMENT-SOP.md` for the domain, DNS and certificate setup.

## Local development

```bash
git clone --recurse-submodules https://github.com/labwithchristian/site.git
cd site
hugo server --buildDrafts
```

Already cloned without submodules? Run `git submodule update --init`.

`--buildDrafts` previews the draft posts in `content/blog/`. Production builds exclude drafts.

## How it's put together

### Theme

Blowfish is a git submodule at `themes/blowfish`, pinned to a specific upstream commit. Nothing inside
it is edited. Every customization lives in this repo's own `layouts/` and `assets/`, which Hugo prefers
over the theme's files.

To update the theme deliberately:

```bash
cd themes/blowfish
git fetch && git checkout <tag-or-commit>
cd ../..
hugo server   # check every page, light and dark, desktop and phone
git add themes/blowfish && git commit -m "Update Blowfish to <version>"
```

### Template overrides (`layouts/`)

| File | What it changes |
|---|---|
| `_default/baseof.html` | Adds `data-astral`, `data-heading-font` and `data-bg-tinted` attributes to `<html>`, and `data-page="ctf"` plus the `dark` class on /ctf |
| `_default/ctf.html` | The /ctf page, rendered from `data/ctf.yaml` (see [CTF record](#ctf-record)) |
| `partials/ctf/next.html` | Returns the next CTF that has not ended, and whether it is upcoming or live. Used by /ctf, the resume line and the homepage row |
| `partials/ctf/signal.html` | The /ctf results panel: an event dropdown (opens on the newest scored event, locks events without scores), the headline "Top X%" with a meter against the whole field, rank, challenges solved and accuracy with their change since the previous run of the same CTF, and one chart of the skills tested. CTF data only |
| `partials/ctf/bar.html` | One skill row in that panel: full name, bar, exact share solved. Bars under the "strong" line use the softer purple |
| `_default/list.html` | Drops the theme's "no articles" line; sections use their own empty states. On a section with no table of contents, the body opens to the full container (`.list-body--roomy`) instead of the theme's 65ch cap |
| `_default/_markup/render-heading.html` | Theme heading markup, but keeps classes set with `{.h-minor}` style attributes, swaps the hover `#` for a drawn chef's toque positioned by `.heading-anchor` in `10-typography.css`, and uses a `span` for the jump target so headings stay valid HTML |
| `partials/header/floating.html`, `header/basic.html` | Compact pill nav with the Home icon. A menu entry can carry its own class through `[main.params] class = "..."` (the /ctf tab uses this) |
| `partials/home/landing.html` | Homepage hero: name, `heroRole` eyebrow, lead, buttons |
| `partials/cta-button.html` | Primary and outline buttons with an arrow (optional `download`) |
| `partials/extend-head.html` | Loads the site stylesheet bundle |
| `partials/extend-head-uncached.html` | Loads the homepage intro script on the homepage only, `assets/css/ctf.css` plus the keep-it-dark guard on /ctf only, and on every page the small script that tags navigations into or out of /ctf for the page transition |
| `partials/extend-footer.html` | Credits line |
| `partials/nav-icons/cc-mark.html` | CC brand mark Home icon (`navHomeIcon` in `params.toml`). `tp-classic.html`, the terminal pot, is kept as an alternative |
| `partials/header/social-links.html` | LinkedIn and GitHub icons at the top right of every page (`navSocial` in `params.toml`, URLs from `languages.en.toml`) |

### Styles (`assets/css/site/`)

Every file in this folder is concatenated in filename order and loaded after the theme's CSS:

| File | Covers |
|---|---|
| `00-fonts.css` | Self-hosted faces and font tokens (`--font-display`, `--font-body`, `--font-mono`) |
| `10-typography.css` | Type scale tokens (`--step--1` to `--step-5`), headings, body copy, link underlines |
| `20-surfaces.css` | Page background, glass surfaces, background pattern |
| `30-nav.css` | Nav pill, mobile dropdown, Home icon |
| `40-hero.css` | Hero name, role eyebrow, lead, buttons |
| `50-home.css` | Skills marquee, highlights, career timeline, core strengths, pipeline, experience cards, certifications, connect |
| `60-pages.css` | whoami portrait and How I work headings, resume page, work-in-progress and coming-soon blocks, network diagram, spec cards |
| `70-footer.css` | Footer menu and credits |
| `80-intro.css` | Homepage intro overlay |
| `85-transitions.css` | The "lights out" transition into /ctf (flicker, black, power on) and "monitor off" on the way out (collapse to a line, then a dot). Cross-document view transitions: Chrome, Edge, Safari 18.2+; other browsers load the page normally. Off for reduced motion |
| `90-print.css` | Print and Save as PDF layout, mainly for the resume |
| `95-spotlight.css` | The lab pages' shared theme (see Lab pages below): tokens, cursor spotlight (the grain background is the same as Home and Resume), lit card borders, aurora titles, illustration motion, light-mode contrast fixes and the keyboard status bar. Every rule is scoped to `html[data-room="lab"]` |

Colors come from the scheme in `assets/css/schemes/nebula-stone.css` (`colorScheme` in `params.toml`).
Use its variables, for example `rgb(var(--color-primary-600))`, rather than hex values, so light and
dark mode stay in step.

### Fonts (`static/fonts/`)

| Role | Face |
|---|---|
| Headings | Fraunces (variable) |
| Body and UI | IBM Plex Sans (variable) |
| Eyebrows, labels, terminal text | IBM Plex Mono 400 and 500 |
| /ctf only | Major Mono Display 400 (title), JetBrains Mono 800 (countdown), Space Grotesk 700 (event name) |

All are latin-subset woff2 files from Fontsource under the SIL Open Font License 1.1, so the site makes no
third-party font requests. The three /ctf faces are declared in `assets/css/ctf.css` and only download on that page.

### Homepage intro

`assets/js/intro.js` plays a short terminal "breach" overlay (about 3.5 seconds) on a visitor's first
homepage visit, then animates the hero name. It's remembered per browser, skippable, and never runs for
visitors who prefer reduced motion. Set `introSequence = false` in `params.toml` to turn it off.

### Icons

Nav and badge icons are drawn in this repo at a 24 unit viewBox and a 1.8 stroke, so they read as one
set. Anything in `assets/icons/` overrides the theme's file of the same name.

| Icon | Where it lives |
|---|---|
| Search | `assets/icons/search.svg`, replacing the theme's filled magnifier: a pan seen from above that doubles as a magnifier, with a hang hole on the handle. Static, and drawn at 1.2rem (the other nav icons are 1rem) through `#search-button` in `30-nav.css` |
| Home | `layouts/partials/nav-icons/cc-mark.html`, the CC brand mark. Set `navHomeIcon = "tp-classic"` to bring back the terminal pot with its blinking cursor |
| Pipeline badges | Drawn inline in `layouts/shortcodes/pipeline.html`: a steaming pan, a lidded stockpot, and a cold pan on an unlit burner |
| Heading anchor | Drawn inline in `layouts/_default/_markup/render-heading.html`: a chef's toque, on the same kitchen metaphor as the rest. Sized by `--anchor-size` and `--anchor-gap` in `10-typography.css`, and carries a slightly heavier stroke because it renders as small as 14px |

Keep to one metaphor. The site is a kitchen: a pot, pans, steam, a toque. Cosmic or abstract marks were
tried here and dropped, because a second metaphor running alongside the first reads as indecision rather
than as range.

Icons are small. Check any change at the size it actually renders (the nav icons are 16px, the heading
anchor beside the whoami eyebrow is about 14px) rather than at the size you drew it: fine interior detail
and punched holes are the first things to close up. Two traps worth knowing, both found the hard way: a
filled circle centred in an ellipse reads as an eye, and a shape whose parts nearly touch will merge into
one blob long before it reaches its final size.

### Brand

The logo lives as two traced SVGs in `assets/img/brand/`: `mark.svg` (the CC symbol) and `lockup.svg`
(symbol plus name). Both use `currentColor`, so CSS sets the colour. The logo's purple, `#4b349d`, is the
scheme's `primary-600`, which is why light mode uses it unchanged and dark mode lifts it to `primary-300`.
`layouts/partials/brand.html` inlines either one: `{{ partial "brand.html" (dict "kind" "lockup" "class" "..." "label" "...") }}`.

| Where | How |
|---|---|
| Browser tab and home screen | `assets/img/brand/favicon.svg`, published as `/icon.svg` (lightens itself in dark browser chrome) plus PNG, `.ico` and `site.webmanifest` fallbacks, linked from `layouts/partials/favicons.html`. These replace Blowfish's default icons. SVGs are cleaned at build time: `brand.html`, `favicons.html` and the `icon.html` override strip comments and any `<metadata>` block, because the file bridge stamps C2PA provenance into SVGs |
| Footer | The lockup above the credits line, linking home. Styled in `70-footer.css` |
| Printed resume | The mark beside the name block, in the logo's purple. Styled in `90-print.css` |
| Link previews | `static/img/og-card.jpg` carries the mark top left |

The nav uses the CC mark as its Home icon (`layouts/partials/nav-icons/cc-mark.html`). It lifts on hover
rather than tilting, so the logo is never shown rotated. The kitchen metaphor carries on in the page icons.

### What each page is for

| Page | Job |
|---|---|
| Home | The 30-second pitch: highlights, core strengths, a short career timeline, certifications |
| Resume | The full record: dated experience, frameworks, tools, certifications, education |
| whoami | How Christian works, and who he is outside of work |
| Homelab | The running reference for the blue team lab: hardware, network, tools, the six projects, constraints. Built on Phase 9 of the [Blue Team Roadmap](https://github.com/keraattin/Blue-Team-Roadmap#phase-9-build-your-portfolio) |
| Writeups | Methodology, decisions and evidence. The lab projects, incident response reports from retired Hack The Box Sherlocks and blue team labs, public breach analysis, detection rules |
| Blog | Shorter pieces: the reasoning behind a decision, the tradeoff, the mistake, and the occasional life update |
| /ctf | Timed, scored competitions: what's next with a live countdown, the archive with proof, a results panel with an event picker (top X% of the field, rank, challenges solved, accuracy, skills tested), and the house rules. Deliberately different from the rest of the site: always dark in its own Graphite theme (colour tokens at the top of `assets/css/ctf.css`), its own menu bar. Practice platforms stay on Homelab and Writeups |

**Writeups or Blog?** The Blog is about Christian and the choices he makes. The Writeups are about
systems and the evidence behind them.

So a certification post covering why he is taking it, how he studied and whether it was worth the
money goes in the Blog: that is reasoning and experience. A post about what studying security
architecture changed in the lab's segmentation is a Writeup, because the subject is the system and the
credential is only the occasion. The same rule puts life updates in the Blog without needing a
category for them.

### Resume: no public download

`content/resume/index.md` is the full resume. There is deliberately no public PDF: Christian tailors his resume to each
role, so the `resume-head` shortcode shows a **Request a tailored resume** button (it opens his LinkedIn) with a
one-line note under it. The button and note are hidden when printing.

To offer a PDF again later: put it in `content/resume/` and add `download="on"` to the `resume-head` shortcode. The
button then reads **Download PDF**, with **Connect on LinkedIn** beside it. `build: publishResources: false` in the
page's front matter keeps any PDF that is not linked out of the build.

A clean copy can still be made from the page: run `hugo server`, open `/resume/` in Chrome in light mode, Print,
Destination "Save as PDF", Paper "Letter", Margins "Default", Background graphics off. `90-print.css` strips the site
chrome and adds the name and links at the top.

### Link previews

`static/img/og-card.jpg` (1200x630) is the image LinkedIn, Slack and X show when the site is shared.
It's set with `images` in `params.toml`. /ctf has its own card, `static/img/og-ctf.jpg` (Graphite, the
backroom title and the NCL headline), set with `images` in `content/ctf.md`. Any page can do the same.

### CTF record

`data/ctf.yaml` is the one place CTF events live. It feeds three things:

| Where | What shows |
|---|---|
| /ctf (`layouts/_default/ctf.html`) | Next event with countdown, the archive, results with an event picker, house rules |
| Resume (`ctf-next` shortcode) | One line while an event is coming up or live, with a link to /ctf. Web only |
| Home (`pipeline ... ctf="true"`) | A What's Cooking row: `Queued`, then `Live now` |

Scope is timed, scored competitions. Retired Hack The Box Sherlocks, CyberDefenders and other practice
labs are homelab and writeups material, not /ctf.

Event states come from the dates: **upcoming** before `start`, **live** until `end`, **closed** after,
**results** once `result` is filled in. The page recomputes them in the browser every second, and the
daily build keeps the resume and homepage in step.

**Adding an event:** copy the Huntress entry at the top of `events`, newest first, and confirm the
start and end times (with their time zone offset) from the registration email.

**When an event closes:**

1. Before the platform goes dark, screenshot the scoreboard: rank, points and solves, with your handle
   visible. Save it in `content/resume/` next to the NCL scorecards.
2. Fill in `result`, `handle`, `proof_url` and `proof_label` in `data/ctf.yaml`, plus `rank` and `field`
   (placement and number of players) when the event publishes them; /ctf works out the top percentage. Point `proof_url` at the
   event's own resume card: give its `job` shortcode an `id` and link `/resume/#that-id`.
3. Check the event's rules on writeups. Publish them under Writeups only when allowed, then set
   `writeup_url`.
4. Add the result to the resume's Education and Competitions section (the `ctf-next` line only covers
   what's next). No em or en dashes.
5. Add `rank`, `field`, `points`, `points_max`, `accuracy` and `completion` where the event publishes
   them, and a `modules` list (`name`, `pct`) if it scores by category, with each short name listed
   under `module_names`. Optional: `league` and `scope` for the headline sentence, `about` for the one
   line on what the event is, and `proof_text` for the proof link. The results panel then opens on this
   event and compares it with the previous event from the same organiser only (NCL with NCL), so a new
   CTF starts as its own baseline. The panel is CTF data only: no study or lab plans.

**Turning /ctf off** (kill switch): set `draft: true` in `content/ctf.md` and comment out the `/ctf`
block in `config/_default/menus.en.toml`. The resume line, homepage row and Writeups link hide
themselves. Set both back to turn it on again.

**Rolling back entirely:** revert the commit that added /ctf (GitHub Desktop: History, right-click the
commit, "Revert Changes in Commit", then Push). `DEPLOYMENT-SOP.md` Phase 8 has the command-line version.

### Lab pages (the spotlight theme)

Writeups, Blog, Homelab and whoami share a look of their own; Home, Resume and /ctf keep theirs.
`layouts/partials/lab/room.html` decides which pages are lab pages, and `baseof.html` then sets
`data-room="lab"` and `data-lab="<page>"` on `<html>`, adds the spotlight layer and the status bar, and
loads `assets/js/spotlight.js`. Each page also gets its own stylesheet from `assets/css/lab/`
(`writeups.css`, `blog.css`, and `sections.css` plus `homelab.css` or `about.css`).

- **Dark by default?** `labDefaultDark` in `params.toml`. `false` follows the visitor's site-wide
  choice; `true` opens lab pages dark until the visitor picks a theme.
- **Spotlight on Home and Resume**: `homeSpotlight` in `params.toml`. `true` gives those two pages the
  cursor glow alone (no other lab styling); `false` takes it off.
- **Keys** (desktop, 760px and up, mouse or trackpad): `j`/`k` next and previous item, `r` random
  (Writeups, Blog), `t` lights on or off, `s` subscribe (Blog), `p` the parrot (whoami), `?` help.
- **Motion**: titles flow, featured illustrations play, list illustrations wait for hover or focus.
  Reduced motion stops everything.
- **Empty states**: while Writeups or Blog has nothing published, the section's `_index.md` renders
  as before (`partials/list-default.html`). The new index takes over with the first published post.
- **Illustrations**: `layouts/partials/art/<key>.svg`, one per program slot. Blog doodles:
  `layouts/partials/doodles/<key>.svg`, with `default.svg` as the fallback.
- **Data**: `data/program.yaml` (the nine-slot lab program on /writeups/) and `data/blog.yaml`
  ("On the stove" on /blog/).

How to write a writeup or a post: [CONTENT-GUIDE.md](CONTENT-GUIDE.md).

## Shortcodes

| Shortcode | Used on | Purpose |
|---|---|---|
| `logos items="slug, slug" speed="45"` | Home | Scrolling Skills & Tools logo marquee. Logos live in `assets/img/logos/`; `text:Label` adds a wordmark |
| `highlights` + `highlight figure label` | Home | Proof-point tiles under the hero. Swap figures for outcome numbers as they're gathered |
| `timeline more` + `timeline-item dates role company` | Home | Career at a glance, with a button to the full resume |
| `timeline-role title dates promoted company` | Home | Inside `timeline-item`, one title of a promotion, newest first. Each title gets its own row and dates; `promoted="2023"` on the newer title draws the promotion comet |
| `resume-head facts="Label :: Value \| ..."` | Resume | Summary, quick facts, Download PDF and LinkedIn buttons, print-only name block |
| `job id company dates location context positions tags` | Resume | One employer: titles held (`"Title :: years \| Title :: years"`), Markdown bullets, tags. Optional `id` makes the card a link target (`/resume/#ncl-2020`), used by the /ctf proof links |
| `role title dates promoted tags` | Resume | Inside `job`, one title with its own bullets and tags, for a promotion (newest first; `promoted="2023"` on the newer title draws the promotion comet) |
| `strengths` + `strength icon title items` | Home | Core Strengths cards |
| `pipeline items="Name :: Status :: Note \| ..."` | Home, Homelab | Status list with cooking-themed badges. The status word picks the icon: a steaming pan for anything else, a lidded stockpot for `Ongoing` or `Continuous`, and a cold pan on an unlit burner for `Planned`, `Queued` or `Target`. Only the first two move. On Homelab it draws spotlight rows instead (pan, or a dashed ring for queued) |
| `xp` | Resume | Wrapper that stacks `job` cards |
| `certs groups="Label :: Cert, Cert \| ..." seal class` | Home, Resume | Labeled pill groups. `seal="false"` for lists that aren't certifications |
| `connect url label` | Home | `> connect --linkedin` card |
| `connect-mini url label` | whoami | `> connect --linkedin` sign-off card at the end of the page |
| `intro image alt` | whoami | Portrait in an aurora halo beside the opening statement |
| `principles` | whoami | Wraps the "How I work" paragraphs; each bold opening line becomes a card heading |
| `off-clock` | whoami | The house scene (doodles, parrot, spring) and the parrot button (`p`) |
| `specs` + `spec role title rows tags` | Homelab | Hardware spec cards. `rows="CPU: ... \| Memory: ..."`. `role` picks the hover icon (`partials/lab/hw/`) |
| `projects keys style` | Homelab | Wraps the Six Projects table and draws each row as a card; links to the writeup once one is published with that `project:`. `style="tools"` (default) shows a security glyph (`partials/lab/kit/`) over the project's tools, with logos from `assets/img/logos/` where a tool has one; the tool list is at the top of the shortcode. `style="art"` uses the writeup illustrations instead |
| `resource-plan cap` | Homelab | Wraps the Resource Plan table and draws each row as a bar against the memory cap |
| `rules file` | Homelab | Wraps the Operating Constraints list as `$ cat /etc/lab/rules.conf` |
| `proof items="Label :: file.jpg :: alt \| ..."` | Resume | Thumbnails at the bottom of a card that open a popup viewer (`assets/js/proof.js`). Images live in the page bundle |
| `network-diagram` | Homelab | Inline SVG network diagram with traffic flowing on the links. Generic by design: no addresses or hostnames. Edit the labels in the shortcode file |
| `vm-loop` | Homelab | Inline SVG of the vulnerability management loop, from inventory to verified fix. Edit the stage labels in the shortcode file |
| `soon title status` | Writeups, Blog, Tags | Coming-soon block |
| `wip title` | Homelab | Work-in-progress block |
| `ctf-next` | Resume | "Competing next: ..." line plus a link to /ctf, from `data/ctf.yaml`. Hidden in print, gone when /ctf is off |
| `ctf-link "text"` | Writeups | Link to /ctf that falls back to plain text when /ctf is off |

`pipeline` also takes `ctf="true"` (Home): it appends the next CTF from `data/ctf.yaml` as `Queued`, then `Live now`, and drops it once the event ends.

### Heading attributes

Section headings can be made smaller with a heading attribute: `## Education {.h-minor}`. On whoami,
`### Area {.area}` renders a small eyebrow for a Core Strengths area, with `####` practices under it.
Both rely on `layouts/_default/_markup/render-heading.html`; the theme's own hook drops the class.

## Adding content

```bash
hugo new content writeups/network-segmentation/index.md
hugo new content blog/some-new-post/index.md
```

The archetypes (`archetypes/writeups.md`, `archetypes/blog.md`) fill in the front matter the lab pages
read. Step by step, with the screenshot checklist: [CONTENT-GUIDE.md](CONTENT-GUIDE.md).

When the first post is published, set `showRecent = true` under `[homepage]` in `params.toml` to bring
back the recent posts list.

### Post thumbnails

Blog and Writeups list posts as a three-column card grid across the full container, and each card shows
a feature image when the post has one. No extra markup is needed: make the post a page bundle and drop
an image in it whose name contains `feature`, `cover` or `thumbnail`.

```
content/blog/the-life-of-one-finding/
  index.md
  feature.jpg
```

A `featureImage` value in the post's front matter overrides that. Hugo resizes the image to 600px wide
for the card, so the source can be larger.

## Continuous integration

`.github/workflows/hugo.yml` runs on every pull request, every push to `main`, and once a day at 13:15 UTC (9:15 am Eastern in summer):

1. Builds the site with Hugo extended.
2. Checks every internal link, anchor, stylesheet, script and image in the build with
   [lychee](https://github.com/lycheeverse/lychee), offline. A broken internal link fails the run.
3. On `main` and the daily run, deploys the build to GitHub Pages.

The daily run exists for date-driven content (the /ctf event states, the resume's "Competing next" line,
the homepage's CTF row), so they stay right without a commit. GitHub pauses scheduled runs after 60
days with no push; any commit, or "Run workflow" on the Actions tab, turns them back on.

Working on a branch and opening a pull request gets the checks without touching the live site.

The upload step stays on `actions/upload-pages-artifact@v3`, which keeps dot folders. From v4 on, hidden files
are dropped, which would silently remove `/.well-known/security.txt`; on v5+ add `include-hidden-files: true`.

## Security

**security.txt.** `static/.well-known/security.txt` (RFC 9116) says how to report a problem with the site.
Its `Expires` line must stay in the future: renew it before **25 September 2027**, then yearly.

**Response headers.** GitHub Pages can't set headers, so they are added at Cloudflare, in front of the site
(Rules, Transform Rules, a response header rule on all requests). The set in use:

| Header | Value |
|---|---|
| Content-Security-Policy | `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests` |
| X-Content-Type-Options | `nosniff` |
| X-Frame-Options | `DENY` |
| Referrer-Policy | `strict-origin-when-cross-origin` |
| Permissions-Policy | `camera=(), microphone=(), geolocation=(), payment=(), usb=()` |
| Strict-Transport-Security | set in SSL/TLS, Edge Certificates, HSTS: max-age 6 months, include subdomains, no preload at first |

Everything the site loads is served from its own domain, so the policy allows only `'self'`. `'unsafe-inline'`
covers the theme's small inline scripts and the style attributes the templates set (bar widths, meter
positions). If a new feature loads anything from another domain (a font, an embed, analytics), add that origin
to the matching directive or the browser will block it.

**No analytics,** by choice: no tracking scripts and no cookies.

## Homelab changelog

Kept here rather than in `content/homelab/_index.md`: an HTML comment in a page still ships in its source.

- **17 September 2026:** Restructured into two phases. Vulnerability management is Phase 1, with detection and the attack range moved to Phase 2.
- **20 September 2026:** Scanner stack set to Greenbone, Nessus Essentials Plus, and Qualys Community Edition.
- **22 September 2026:** Rebuilt as a blue team lab on the Blue Team Roadmap's Phase 9 design: three segments, the roadmap's tool stack, and its six portfolio projects. Elastic Security chosen as the SIEM over Wazuh and Splunk, with Elastic Defend beside Sysmon on the endpoints. Vulnerability management kept as one added project, scanning with Qualys Community Edition alone. ServiceNow Vulnerability Response on hold pending a test, with DefectDojo meanwhile. The offensive Phase 2 (Ludus, GOAD-Light) removed for now.
- **22 September 2026 (later):** Rewritten in first person. Credit to keraattin made explicit.
- **22 September 2026 (later):** Intro notes why I follow a beginner roadmap: to close gaps, refresh concepts and build weaker skills such as Python.
- **24 September 2026:** Intro shortened; it keeps the Blue Team Roadmap credit and why I follow it.

## Parked drafts

Lines taken off the live pages but worth keeping.

- whoami, "How I work": **A detection rule is easy to write and hard to trust.** The skill is one that fires on real adversary behavior, doesn't bury the analyst in false positives, and maps to a technique you can name.
