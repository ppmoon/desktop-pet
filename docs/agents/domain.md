# Domain docs

This repo uses a **single-context** layout.

## Layout

```
repo-root/
├── CONTEXT.md       # Domain language, key concepts, naming conventions
└── docs/
    └── adr/         # Architecture Decision Records
```

## Consumer rules

When a skill reads domain docs, it should:

1. **Read `CONTEXT.md` first** — this defines the project's ubiquitous language, module boundaries, and key abstractions. Use its terminology in code, comments, and issue descriptions.

2. **Consult `docs/adr/` for past decisions** — before proposing a new pattern or architecture change, check existing ADRs to avoid revisiting settled questions. Each ADR documents a decision, its context, the alternatives considered, and the trade-offs accepted.

3. **If `CONTEXT.md` doesn't exist yet** — skills that need it should note that domain docs are missing and suggest running `init` to scaffold them, or ask the user to describe the domain.

## Current state

- `CONTEXT.md`: does not yet exist — run the `init` skill or write it manually
- `docs/adr/`: does not yet exist — create as needed for architectural decisions
