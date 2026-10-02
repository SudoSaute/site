# Deployment SOP: christiancarrasco.dev

Procedure for publishing the Hugo site to GitHub Pages on the already-registered domain.
Roughly 30 minutes hands-on, plus DNS and certificate wait time.

**Domain:** `christiancarrasco.dev`, registered at Cloudflare (purchased, Sept 2026)
**Recurring cost:** ~$12.20/year, domain only. Hosting, TLS, and DNS are $0.

---

## READ THIS FIRST: .dev is HTTPS-only

The entire `.dev` top-level domain sits on the browser **HSTS preload list**. Every major browser
ships with that list baked in, which means:

- Browsers **refuse** to load any `.dev` address over plain HTTP. There is no insecure fallback.
- Until GitHub issues your TLS certificate, the domain will appear **completely broken** in a
  browser, not merely "not secure." This is expected and not a sign you did something wrong.
- Any HTTP-to-HTTPS redirect test will not behave the way it does on a `.com`. The browser upgrades
  the request before it ever leaves the machine.

**Practical consequence:** the certificate step is not a finishing touch on this TLD, it is the step
that makes the site exist at all. The Cloudflare proxy setting in Phase 3 is what most commonly
blocks it. Get that right the first time.

The upside: HTTPS is enforced at browser level with no configuration, and you never have to think
about redirect rules or HSTS headers again. For a security portfolio, that is a reasonable trade.

---

## Phase 0: Prerequisites

| Item | Check |
|---|---|
| GitHub account | `SudoSaute` |
| Git installed | `git --version` |
| Hugo **extended** v0.166.0+ | `hugo version` must show `+extended`. The standard build fails on this theme. |
| Project unzipped | From `site.zip` |

Installing Hugo extended:

- **macOS:** `brew install hugo`
- **Windows:** `winget install Hugo.Hugo.Extended`
- **Linux:** download `hugo_extended_*_linux-amd64.deb` from Hugo's releases. Distro repos usually
  ship the non-extended build.

### Domain settings to confirm now

In the Cloudflare dashboard, while you are thinking about it:

- [ ] **Auto-renew is ON.** Losing this domain after building name-based SEO on it would be costly.
- [ ] WHOIS privacy shows active (on by default, cannot be disabled).
- [ ] Note your renewal date.

### Already handled in the project

No edits needed. These are set to `.dev` already:

- `static/CNAME` -> `christiancarrasco.dev`
- `config/_default/hugo.toml` -> `baseURL = "https://christiancarrasco.dev/"`
- `config/_default/languages.en.toml` -> footer email link

---

## Phase 1: Create and push the repository

1. On GitHub, create a **new public repository** named `site`.
   - Do **not** initialize with README, .gitignore, or licence. The project has them.
   - Do **not** name it `SudoSaute.github.io`. That is a different publishing mode and complicates
     adding a second repo later for your lab artifacts.
   - Must be **public** for Pages on the free tier.

2. The GitHub handle is already set to `SudoSaute` in
   `config/_default/languages.en.toml` and on the whoami page. Nothing to edit.

3. Push:

```bash
cd site
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/SudoSaute/site.git
git push -u origin main
```

4. Confirm the repo shows `config/`, `content/`, `layouts/`, `static/fonts/` (6 woff2 files),
   `assets/`, `.gitmodules`, and `.github/workflows/hugo.yml`.

The Blowfish theme is a git submodule pinned to a specific commit (`themes/blowfish`). Clone with
`git clone --recurse-submodules`, or run `git submodule update --init` after a plain clone. The
workflow checks submodules out automatically.

---

## Phase 2: Enable GitHub Pages and verify the build

1. Repo -> **Settings** -> **Pages**.
2. **Source** -> **GitHub Actions**. Do not pick "Deploy from a branch"; Hugo needs a build step.
3. **Actions** tab. The workflow should be running from your push. Wait for green, 1 to 2 minutes.
   If it did not fire: Actions -> "Build, check and deploy" -> Run workflow.
4. Open `https://SudoSaute.github.io/site/` and confirm the site renders.

**Do this before touching DNS.** It separates "the build works" from "DNS and certificates work," so
that if something breaks later you know which half to look at. Styling may look slightly off at this
URL because of the path prefix. That resolves once the custom domain attaches.

---

## Phase 3: DNS at Cloudflare

Cloudflare dashboard -> select `christiancarrasco.dev` -> **DNS** -> **Records**.

Delete any placeholder records Cloudflare created at registration, then add:

| Type | Name | Content | Proxy status |
|---|---|---|---|
| A | `@` | `185.199.108.153` | **DNS only** |
| A | `@` | `185.199.109.153` | **DNS only** |
| A | `@` | `185.199.110.153` | **DNS only** |
| A | `@` | `185.199.111.153` | **DNS only** |
| CNAME | `www` | `SudoSaute.github.io` | **DNS only** |

### The proxy setting is the whole ballgame

Cloudflare turns its proxy (orange cloud) on by default. When proxied, GitHub cannot complete the
ACME challenge Let's Encrypt uses to validate the domain, so the certificate **silently never
issues**. On a `.com` that leaves you with a working-but-insecure site. On `.dev`, because of HSTS
preload, it leaves you with **no site at all**.

Every record above must show the grey cloud, **DNS only**.

If you want Cloudflare's CDN in front of the site later, that is possible, but only after the
certificate exists, and it requires SSL/TLS mode **Full (strict)** or requests loop between
Cloudflare and GitHub. Leave it off for launch.

### Recommended: CAA record

Authorises Let's Encrypt to issue for your domain, so a restrictive default cannot block it:

| Type | Name | Tag | Value |
|---|---|---|---|
| CAA | `@` | `issue` | `letsencrypt.org` |

---

## Phase 4: Attach the domain and get the certificate

1. Repo -> **Settings** -> **Pages** -> **Custom domain**.
2. Enter `christiancarrasco.dev`, save.
3. GitHub runs a DNS check. Passes within minutes if DNS has propagated. If it fails, wait 15
   minutes and re-check rather than changing records.
4. On pass, GitHub automatically requests a Let's Encrypt certificate. Usually minutes, occasionally
   up to 24 hours.
5. When issued, tick **Enforce HTTPS**.

**Expect the domain to look dead between steps 3 and 4.** That is the HSTS behaviour described at the
top, not a misconfiguration. Verify with `curl` (Phase 5) rather than a browser during this window,
because curl will tell you what is actually happening instead of showing a generic error page.

### Why the CNAME file matters

`static/CNAME` ships in the repo and Hugo copies it into the build output. Because this site
publishes from an Actions artifact rather than a branch, a custom domain set only in the GitHub UI
would be **wiped on the next deploy**. The file is what makes it stick. Do not delete it.

---

## Phase 5: Verification

```bash
# Apex resolves to GitHub's four IPs
dig +short christiancarrasco.dev

# www resolves to your Pages host
dig +short www.christiancarrasco.dev

# HTTPS responds 200
curl -sSI https://christiancarrasco.dev | head -1

# Certificate is valid and issued by Let's Encrypt
curl -vsI https://christiancarrasco.dev 2>&1 | grep -iE "subject:|issuer:|expire"

# CNAME file made it into the deployed build
curl -s https://christiancarrasco.dev/CNAME
```

Note: there is no meaningful HTTP redirect test on `.dev`. Skip it.

Browser checklist:

- [ ] Homepage loads: topo background pattern, glass cards, Fraunces headings
- [ ] Nav works: Homelab, Writeups, Blog, whoami, Tags
- [ ] Skills marquee scrolls and pauses on hover
- [ ] Homelab page renders the Mermaid network diagram
- [ ] Padlock present, no mixed-content warnings
- [ ] Dark mode renders correctly (toggle OS appearance)
- [ ] Loads on phone

### Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Domain totally unreachable, browser error page | Certificate not issued yet, HSTS blocking HTTP | Normal during provisioning. If over 24h, apply the proxy fix below. |
| "Certificate not yet created," stuck | Cloudflare proxy is on | Set all GitHub records to DNS only. Then **remove and re-add** the custom domain in Pages settings to force a fresh certificate request. Waiting alone often will not clear it. |
| Enforce HTTPS greyed out | Certificate not issued | Same as above. |
| 404 at the custom domain | CNAME file missing from build | `curl -s https://christiancarrasco.dev/CNAME` should return the bare domain. Confirm `static/CNAME` was committed. |
| Unstyled page | baseURL mismatch | `baseURL` must be exactly `https://christiancarrasco.dev/`, including protocol and trailing slash. |
| Workflow build failure | Theme submodule missing | Confirm `.gitmodules` exists and `themes/blowfish` shows as a submodule link in the repo. Locally: `git submodule update --init`. |
| Workflow fails at "Check internal links" | A page links to something that isn't in the build | Open the job log: lychee lists each missing file or anchor and the page it came from. |
| Fonts fall back to serif | woff2 files missing | Confirm all 10 files in `static/fonts/` were committed. |

---

## Phase 6: Ongoing publishing

Every push to `main` rebuilds and redeploys. No manual step.

```bash
# Preview locally. --buildDrafts shows drafts, which production excludes.
hugo server --buildDrafts

# New content
hugo new content blog/some-post.md
hugo new content writeups/network-segmentation.md

# Publish
git add .
git commit -m "Add writeup on network segmentation"
git push
```

A post stays invisible in production until `draft: false`. Your two stubs in `content/blog/` need
their real text, the draft flag flipped, and the date set.

---

## Phase 7: Post-launch

Within the first week:

1. **Add your headshot.** Square JPEG at `assets/img/author.jpg`. The profile layout picks it up
   automatically and skips gracefully while missing, which is why the site builds without it.
2. **Google Search Console.** Verify via a DNS TXT record in Cloudflare, then submit
   `https://christiancarrasco.dev/sitemap.xml`. This is what makes the site surface when someone
   googles your name, which is the reason for choosing a name-based domain.
3. **Update LinkedIn** featured section and contact info with the URL.
4. **Calendar reminder** ~11 months out to confirm auto-renew is still active.

### Worth knowing about .dev and search

`.dev` carries no SEO penalty versus `.com`. Google treats new gTLDs the same as legacy ones for
ranking. What matters for "Christian Carrasco" queries is that your name is in the domain, which it
is, plus indexing and inbound links from LinkedIn and GitHub.

The one real-world friction: some people will hear the URL and assume `.com`, and a few older
form validators still reject unfamiliar TLDs on email addresses. Neither affects a portfolio site
that people reach by clicking a link.

---

## Phase 8: Rollback and disaster recovery

GitHub is the only source of truth for this site. There is no database and no server state: every
deploy is rebuilt from scratch from whatever `main` points to, so recovery is always a matter of
getting `main` to point at a good commit and letting the existing workflow redeploy it. Nothing here
needs a separate backup system.

### The rule: revert, don't force-push

`main` is shared and the deploy workflow reacts to every push to it. Prefer `git revert`, which adds
a new commit undoing a change: it is safe on a shared branch, keeps history intact, and immediately
triggers a redeploy of the reverted state. Reserve `git reset --hard` plus a force-push for a genuine
emergency (see below), because it rewrites history other clones and the reflog rely on, and needs
everyone else's clone to be reset to match.

### Fastest path: the last push broke the site

1. Find the bad commit:

   ```bash
   git fetch origin
   git log --oneline -10 origin/main
   ```

2. If it was a single, non-merge commit:

   ```bash
   git revert <bad-commit-sha>
   git push origin main
   ```

3. If it was a merged pull request (a merge commit, two parents), revert against the first parent:

   ```bash
   git revert -m 1 <merge-commit-sha>
   git push origin main
   ```

   Concrete example: the `audit-phase2` merge landed as `1d98a93` on top of baseline `0baf568`. To
   undo that whole merge in one step:

   ```bash
   git revert -m 1 1d98a93
   git push origin main
   ```

4. Watch the redeploy and re-verify (Phase 5's `curl` checks and browser checklist). A revert commit
   builds and deploys exactly like any other push, no special handling.

### Confirming what "good" looks like before you revert

Check the Actions tab for the last run that was green before things broke, and note its commit SHA
(`git log --oneline` against that same SHA shows what it contained). Don't assume the most recent
commit is the culprit; the site rebuilds fully on every push, so a change two commits back can be
the one that surfaces the failure now.

### Submodule-specific recovery (`themes/blowfish`)

Since the audit-phase2 merge, the theme is a pinned git submodule rather than vendored files. Ways
this can go wrong locally, and the fix:

| Symptom | Fix |
|---|---|
| `themes/blowfish` is an empty folder after `git checkout` or `git pull` | `git submodule update --init --recursive` |
| Wrong commit checked out inside the submodule | `git -C themes/blowfish log --oneline -1` to check, then `git submodule update --init --force` to snap it back to the pin recorded in `.gitmodules` / the parent commit |
| Submodule clone fails because the directory already exists and isn't empty | List what's in there before deleting anything (`find themes/blowfish -mindepth 1`). It should only ever contain the theme's own files. Anything else is unexpected and worth asking about before removing, the same way we handled a stray `.watchfire/` folder found there during the phase-2 merge |
| Need to fully re-pin from scratch | `git submodule deinit -f themes/blowfish && rm -rf .git/modules/themes/blowfish && git submodule update --init --recursive` |

This only affects local working copies. CI always does a fresh `git submodule update --init` on a
clean checkout, so a broken local submodule state can't leak into a deploy.

### Emergency: force-reset main to a known-good commit

Only when a revert isn't fast enough (e.g. the repo is in a state `git revert` can't cleanly express)
and you've confirmed with whoever else might have a clone:

```bash
git fetch origin
git checkout main
git reset --hard <known-good-sha>
git push --force-with-lease origin main
```

`--force-with-lease` (not plain `--force`) refuses the push if someone else has pushed to `main`
since your last fetch, so it fails loudly instead of silently discarding their work.

### Domain and certificate disasters

Covered in Phase 4's walkthrough and the Phase 5 troubleshooting table: a dead-looking `.dev` domain
after a DNS or Pages settings change is almost always the Cloudflare proxy toggle or a custom-domain
mismatch, not a code problem. Diagnose with `curl`/`openssl`, not a browser, since HSTS makes a
provisioning gap look identical to a real outage. No rollback of `main` fixes a certificate issue.

### Known-good checkpoints on record

| Commit | What it is |
|---|---|
| `0baf568` | Last commit before the audit-phase2 restructure: vendored (non-submodule) theme, single `custom.css`. If the submodule/CSS-split approach ever needs to be abandoned entirely, this is the commit to return to. |
| `1d98a93` | The audit-phase2 merge into `main`: submodule theme, split CSS, design polish, CI link check. Current baseline as of 2026-09-16. |

### Local clones

Two independent local clones of this repo exist on this machine: `~/code/site` and
`~/Documents/GitHub/site` (this one, which the audit-phase2 handover was written against). They can
drift out of sync with each other since neither knows about the other's commits until you `git fetch`.
Treat GitHub's `main` as the source of truth, not either local clone, and `git pull` before starting
work in whichever one you use.

---

## Cost summary

| Item | Cost |
|---|---|
| `christiancarrasco.dev`, annual | ~$12.20 at Cloudflare, at registry cost |
| GitHub Pages hosting | $0 |
| TLS certificate | $0, Let's Encrypt via GitHub |
| Cloudflare DNS + DNSSEC + WHOIS privacy | $0 |
| Fonts | $0, self-hosted, no CDN dependency |
| **Recurring total** | **~$12/year** |

Unlike `.com`, `.dev` pricing has been stable. Google Registry has not pushed the annual increases
Verisign applies to `.com`, so this figure should hold.
