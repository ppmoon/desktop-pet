# Triage labels

Five canonical labels for the issue state machine. Applied via frontmatter in `.scratch/<feature-slug>/issue.md`.

## Label vocabulary

| Label | Purpose |
|-------|---------|
| `needs-triage` | Maintainer needs to evaluate and categorize the issue |
| `needs-info` | Waiting on the reporter for more details or clarification |
| `ready-for-agent` | Fully specified — an AFK agent can pick it up with no human context |
| `ready-for-human` | Needs human implementation (complex, sensitive, or requires judgment) |
| `wontfix` | Will not be actioned (out of scope, duplicate, or intentional behavior) |

## State machine

```
needs-triage ──→ needs-info ──→ needs-triage ──→ ready-for-agent
                ↓                                             ↓
              wontfix                                ready-for-human
                                                           ↓
                                                        wontfix
```

## Usage

In an issue file's frontmatter:

```yaml
labels: [needs-triage]
```

Multiple labels are allowed (e.g. an issue may carry both a functional label and a triage label).
