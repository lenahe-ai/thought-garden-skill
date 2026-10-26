# App contract

## Hosting boundary

The overlay requires the current Sites Vinext starter and D1 binding `DB`. It has no portable public authentication layer. Sites must restrict the entire origin to its owner, including `/api/*` and `/mcp`. Same-origin checks are an additional browser safeguard, not authentication. Local preview binds loopback and is development-only.

Tables are `cards(id,data)`, `settings(key,value)`, `threads(id,data)` and `asks(id,data)`. Values are JSON except settings entries. Fresh installs contain no personal data or writing samples. Generate migrations from `db/schema.ts` in the new starter. Do not copy another installation's migrations or runtime storage.

## Endpoints

Read the included route handlers for exact limits and validation before writing. All paths are relative to the selected owner's Site.

- `GET /api/cards` → `{cards,initialized}`. Cards have `id,text,title,kind,topic,status,pinned,url,image,date,color` and optional `review`. `status:review` is pending human approval; `board` or legacy missing status is approved.
- `POST /api/capture` → JSON `{text,capture_id?}`. Saves into review, returning `{saved,id,message}`. A stable capture_id makes retries idempotent. No link preview fetches.
- `POST /api/cards` saves a complete card; requires same-origin `Origin`. Use it for authorized human edits, not assistant rewrites. `DELETE` is destructive and not part of review.
- `POST /api/review` accepts `{reviews:[{id,expectedText,expectedTitle,expectedTopic,topic,summary,reason,confidence,relatedTopics}]}`, max25. Expected strings must match latest originals exactly. It preserves original fields and queue status, and skips stale writes atomically. `relatedTopics` max2; confidence high/medium/low.
- `GET /api/threads` → `{threads,profile,cards}`.
- `POST /api/threads` with `action:profile,profile:{principles,samples:[{id,text,weight}]}` sets the owner's references. Weight primary/supporting. Never replace a profile on an unattended run.
- `action:suggest,threads:[...]` inserts new threads only; existing IDs and stale sources are skipped. Each thread needs `id,title,theme,why,question,opening,voiceNote,caution,sources:[{id,fingerprint}],voiceReferences:[sampleIds]`. Use 1–8 approved sources. Opening may be empty; do not draft without authorization. Feedback is kept separately by `action:feedback,id,state,note,draft`; leave it to the owner.
- `GET /api/asks` → `{asks}`. `action:create,id,brief` on POST saves an idempotent pending brief. `action:answer,id,expectedBrief,note,results` completes only a matching pending brief. Each result has `title,position,grounding,tension,counterpoint,question,sources:[{id,fingerprint}]`. Existing answers and stale sources return409. Results may be empty when context is insufficient.

## Fingerprints and service access

Use the bundled `app/pov.ts` function exactly: FNV-1a over `JSON.stringify([text,title||'',url||''])`, JavaScript UTF-16 code units, `Math.imul`, unsigned32, lowercase hex without padding. Never hash normalized or summarized text.

For unattended access, use the environment's existing supported service mechanism after confirming owner-private access. On supported Sites this is `OAI-Sites-Authorization: Bearer <existing service token>`. Use it only at that Site's origin. Keep credentials in memory and hidden stdin, never source, shell arguments, logs, repository or artifacts. If a PTY carries large JSON, disable ECHO and ICANON and use small chunks. Stop if supported access is unavailable; do not scrape browser credentials or invent an auth bypass.

Direct Apple Watch capture is optional and requires supported service access configured on the owner's device. The `/watch` page documents it; this package intentionally has no endpoint that returns a bearer token to a browser. Never share credential-bearing shortcuts.
