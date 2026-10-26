# Thought Garden

A reusable agent skill for building a private, visual home for unfinished ideas. Capture a thought, review it, notice connections and explore your own point of view without editing yourself out of it.

Includes a clean app overlay with:

- A visual board, inspiration links, images and a capture review queue.
- Suggested POV buckets that can be customized.
- Threads grounded in your original notes, with feedback and private refinements.
- Your own writing samples as voice references.
- Ask the garden: save a brief such as “Which of my thoughts contradict each other?” and have your assistant explore it.
- Optional Siri/Apple Watch capture and assistant schedules.

Nothing publishes to social media. There is no bundled model API, background worker or automatic schedule: exploration runs through your assistant, on demand or through a separately configured automation.

## Install the skill

In Codex, ask:

> Install the thought-garden skill from this repository, path `skills/thought-garden`.

Or copy the `skills/thought-garden` folder into your agent's skills directory. In Codex this is normally `~/.codex/skills/thought-garden`. It becomes available on the next turn. Then ask:

> Use $thought-garden to build my private thought board. Help me choose a few buckets and preserve my voice.

## Requirements

The included app overlay targets the **Sites plugin's Vinext starter**, Cloudflare D1, and owner-private Sites authentication. You need access to Sites and an agent capable of using its tools. This is not a standalone app or an independent authentication system. Other agents can read the Markdown skill, but must adapt the hosting/authentication integration before using another platform.

The skill guides your assistant through creating a fresh private Site, installing the overlay, generating a new schema migration and checking the result. Do not deploy the API as an unprotected public Worker. There is one owner's database per garden; multi-user hosting needs additional authorization work.

Bring your own interests, notes and writing samples. No original user's thoughts, voice samples, site IDs, credentials, database, screenshots or schedules are included. Default bucket labels are editable suggestions, not beliefs assigned to you.

## What is in the repository?

`skills/thought-garden/SKILL.md` is the entry point. `assets/site-overlay` contains application source and a schema, to layer onto a fresh supported starter. `scripts/install_overlay.py` installs it with checks against overwriting an existing garden. References describe the API and assistant workflows.

For existing gardens, make bounded changes instead of running the installer again. The original app and database are not modified by this repository.

## Privacy and contribution

Use fictional content in issues and pull requests. Never upload garden exports, writing samples, service tokens, credential-bearing shortcuts or screenshots of private notes. The app preserves source notes; assistant suggestions are separate, with stale-write checks and source fingerprints. Authentication depends on the hosting platform.

Contributions and adaptations are welcome under the MIT license. Third-party dependencies and the Sites starter remain governed by their own terms/licenses and are obtained separately.
