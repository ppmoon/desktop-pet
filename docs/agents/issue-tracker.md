# Issue tracker

Issues for this repo are stored as **local markdown files** under `.scratch/<feature-slug>/`.

## Convention

Each issue is a directory:

```
.scratch/<feature-slug>/
├── issue.md      # Issue body (title, description, acceptance criteria)
└── ...           # Supporting files (screenshots, logs, etc.)
```

## Issue file format

`issue.md` uses frontmatter for metadata:

```markdown
---
title: "Brief description of the issue"
status: open
labels: [needs-triage]
created: 2026-05-08
---

Issue body goes here. Use standard markdown.
```

## Statuses

- `open` — active issue
- `closed` — resolved (merged, fixed, or completed)
- `wontfix` — will not be actioned

## Labels

Labels are stored as YAML array in frontmatter. See `docs/agents/triage-labels.md` for the canonical vocabulary.

## Tools

No external CLI is required. Skills read and write these files directly.
