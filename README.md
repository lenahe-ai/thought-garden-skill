# Thought Garden · Experimental

A reusable agent skill for building a private, visual home for unfinished ideas. Capture a thought, review it, notice connections and explore your own point of view without editing yourself out of it.

**Status: early prototype.** The template has passed a fresh local starter build and basic API checks. A complete new-user hosted setup, sign-in, connector installation, Watch capture and scheduled execution have not yet been verified end to end. Expect some setup with an agent; this is not a one-click app.

Includes a clean app overlay with:

- A visual board, inspiration links, images and a capture review queue.
- Suggested POV buckets that can be customized.
- Threads grounded in your original notes, with feedback and private refinements.
- A writing room linked to captured thoughts, with editable drafts and an assistant handoff.
- A Voice Library for pasted writing, text/Markdown imports, transcripts, source links and influence notes. Finished drafts can become references by explicit choice.
- Ask the garden: save a brief such as “Which of my thoughts contradict each other?” and have your assistant explore it.
- Optional Siri/Apple Watch capture and assistant schedules.

Siri and chat-connector captures enter the review queue. They need human approval before appearing on the board. Manually created board cards are saved directly.

Draft generation uses a prepared assistant request: open it and press Send, then return to load the saved draft. The button does not wake a background agent automatically. Drafts are version-checked so a first-draft response cannot replace human edits.

Nothing publishes to social media. There is no bundled model API, background worker or automatic schedule: exploration runs through your assistant, on demand or through a separately configured automation.

## Install the skill

In Codex, ask:

> Install the skill from https://github.com/lenahe-ai/thought-garden-skill, path `skills/thought-garden`.

Or copy the `skills/thought-garden` folder into your agent's skills directory. In Codex this is normally `~/.codex/skills/thought-garden`. It becomes available on the next turn. Then ask:

> Use $thought-garden to build my private thought board. Help me choose a few buckets and preserve my voice.

## Requirements

The included app overlay targets the **Sites plugin's Vinext starter**, Cloudflare D1, and owner-private Sites authentication. You need access to Sites and an agent capable of using its tools. This is not a standalone app or an independent authentication system. Other agents can read the Markdown skill, but must adapt the hosting/authentication integration before using another platform.

The skill guides your assistant through creating a fresh private Site, installing the overlay, generating a new schema migration and checking the result. Do not deploy the API as an unprotected public Worker. There is one owner's database per garden; multi-user hosting needs additional authorization work.

Bring your own interests, notes and writing samples. No original user's thoughts, voice samples, site IDs, credentials, database, screenshots or schedules are included. Default bucket labels are editable suggestions, not beliefs assigned to you.

## What is in the repository?

`skills/thought-garden/SKILL.md` is the entry point. `assets/site-overlay` contains application source and a schema, to layer onto a fresh supported starter. `scripts/install_overlay.py` installs it with checks against overwriting an existing garden. References describe the API and assistant workflows.

For existing gardens, make bounded changes instead of running the installer again. The original app and database are not modified by this repository.

## Verification

Run `python3 tests/test_install_overlay.py` for installer safety checks. After installing the overlay into a disposable local starter, generating/applying its migration and starting it on loopback, run:

```sh
python3 tests/smoke_capture.py http://127.0.0.1:8791
```

The smoke check writes fictional test cards to that local database. It rejects non-loopback addresses and never runs against your hosted garden. It verifies that both capture paths preserve their text and enter review, and that the connector returns a review receipt. It does not verify hosted authentication or scheduled assistant behavior.

## Privacy and contribution

Use fictional content in issues and pull requests. Never upload garden exports, writing samples, service tokens, credential-bearing shortcuts or screenshots of private notes. The app preserves source notes; assistant suggestions are separate, with stale-write checks and source fingerprints. Authentication depends on the hosting platform.

Contributions and adaptations are welcome under the MIT license. Third-party dependencies and the Sites starter remain governed by their own terms/licenses and are obtained separately.
