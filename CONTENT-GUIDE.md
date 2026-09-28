# Content guide: writeups and blog posts

## One-time setup
1. `hugo version` must show `+extended`. If not: `brew install hugo`.
2. GitHub Desktop: open `site`, Fetch origin, Pull.
3. Open the repo in your editor and a Terminal in the folder (GitHub Desktop: Repository > Open in Terminal).

## New writeup
1. Pick its program slot: seg, siem, atomic, phish, ir, intel, rules, vuln or ctf.
2. `hugo new content writeups/<short-name>/index.md` (lowercase, hyphens; the folder name is the URL).
3. Fill the front matter: title, date, draft, summary (one sentence, shown on cards), project, art (optional),
   skill (detection, response, network, vuln, ctf), tools, attack, source, repo, images (00-cover.png, 1200x630),
   pick and pick_reason (optional, for "Start here").
4. Write it using the sections the template creates. Delete unused sections and screenshot slots.
   Keep Recommendations and Lessons learned.
5. Screenshots: Cmd+Shift+4 (region) or Cmd+Shift+4 then Space (window). Preview > Markup > Rectangle to box
   the key field. Redact real IPs, hostnames, usernames, tenant IDs, tokens. Save in the post folder as
   NN-what-it-shows.png. Fill alt and caption. Required: query plus results, and the detection firing.
6. Put queries, rules and scripts in the investigations repo and paste the folder link into repo.
7. Illustration: set art to an existing key, or ask Claude to draw a new scene for a new topic.
8. To show a slot as drafting on the program map, set its status in data/program.yaml. Published is automatic.
9. Preview: `hugo server -D`, open http://localhost:1313/writeups/. Check the list, map, filters and the
   writeup page in light and dark and in a narrow window. Ctrl+C to stop.
10. Pre-publish: IOCs defanged, no real addresses or hostnames, alt text and captions done, repo link works,
    summary reads as one sentence.
11. Publish: draft: false, confirm the date. GitHub Desktop: review, commit "Add writeup: <title>",
    Push origin. Wait for the green Actions run, then Cmd+Shift+R on the live site.
12. Share on LinkedIn. The cover image becomes the card. RSS updates on its own.

## New blog post
1. `hugo new content blog/<short-name>/index.md` (or a single `blog/<short-name>.md` without images).
2. Front matter: title, date, draft, description (the one-line argument, shown under the title and in RSS),
   tags, doodle (key; blank shows the default), featured (optional, pins it as the lead).
3. Write 3 to 4 minutes of reading. The first sentence becomes the lead quote. Make it count.
4. New doodle: ask Claude with the title; it returns a key.
5. Optional: set "On the stove" in data/blog.yaml (stove: "Next post title"); empty hides it.
6. Preview at http://localhost:1313/blog/, then publish and share exactly as for writeups (steps 9, 11, 12).
