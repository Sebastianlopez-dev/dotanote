# OpenProject tracking for dotanote

dotanote tracks active work in **ODD feature documents** and mirrors them to OpenProject, which shows the board and timeline. Each tool has one job:

| Tool            | Role                                                                       | Where                                                       |
| --------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **ODD**         | Source of truth for active work: specs, phases, tasks and log, as Markdown | `odd/tasks/<feature>.md`                                    |
| **OpenProject** | Board and timeline: progress, dates, comments, commit links                | `http://localhost:8080` (Docker install in `~/openproject`) |

Tasks are written and checked off in the ODD document. OpenProject is updated from it by a sync script, so every work package points back to its Markdown source.

Archived OpenSpec changes in `openspec/changes/archive/` are project history. They are mirrored as closed Epics and are not edited anymore.

## Task line format

Only lines under `## Tasks` are parsed. Parsing stops at `## Log`.

```md
## Tasks

### Phase 1: Remove bundled API keys

- [ ] 1.2 Remove the bundled key fallbacks | S8 | inline | commit: —
- [x] 1.3 Remove unused env entries | S8 | inline | commit: <sha>
```

## How the ODD maps to OpenProject

| Markdown                                                 | OpenProject work package                                                                           |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `odd/tasks/<feature>.md`                                 | **Epic** `[<feature>] ODD feature`                                                                 |
| `### Phase N: ...` under `## Tasks`                      | **Feature** `[<feature> PN] Phase N: ...` (child of the Epic)                                      |
| `- [ ] <id> <task> \| S# \| route \| commit: <sha or —>` | **Task** `[<feature> <id>] <task>` (child of the Feature); S#, route and commit in its description |
| `- [x] ...`                                              | Same Task with status **Closed**                                                                   |
| `openspec/changes/archive/<name>/tasks.md`               | Epic `[<name>] OpenSpec change (archived)` and children, closed                                    |

The bracketed prefix (`[<feature> <id>]`) is the stable key. The script uses it to find work packages on later runs. The task text is everything before the first `|`.

## First-time setup

OpenProject runs from its own Docker Compose install in `~/openproject` (outside this repo), served at `http://localhost:8080`.

1. Start Docker Desktop; the OpenProject containers start with it (`restart` policy).
2. Create `tools/openproject/.env` (git-ignored by the root `.env*` rule):

   ```bash
   OPENPROJECT_URL=http://localhost:8080
   OPENPROJECT_API_KEY=
   ```

3. Create an API token in OpenProject: avatar → **My account** → **Access tokens** → **API** → **Generate**. Paste it into `OPENPROJECT_API_KEY`. Never commit it or paste it in chats. Use your personal account, not `admin`: work packages are authored by the token's owner.
4. Run the sync once: it creates the `dotanote` project. If it reports that no work package types are enabled, open `http://localhost:8080/projects/dotanote/settings/types`, enable **Epic**, **Feature** and **Task**, save, and run it again.

## Daily workflow

1. Plan or update tasks in `odd/tasks/<feature>.md`.
2. Implement; check the task off (`- [x]`) in the same commit as the code, with the task id in the commit message.
3. Sync the board:

   ```bash
   node tools/openproject/sync.mjs --dry-run   # preview: create/update lines only
   node tools/openproject/sync.mjs             # apply
   ```

4. In OpenProject, add what Markdown does not hold: comments, the commit or PR link, dates on the Gantt chart.

The script creates missing work packages, and updates the subject, description and status of matched ones (the markdown owns them; the description carries the S#, route and commit). It never deletes anything. It does not touch dates, comments or assignees: write personal notes as comments. Active OpenSpec changes are not synced; only the archive is.

## Useful views

- **Work packages** → group by _Parent_ to see Feature → Task.
- **Boards** → create a _Status_ board for a Kanban view.
- **Gantt charts** → add start and finish dates to phases to present the timeline.

## Stop and start

```bash
cd ~/openproject && docker compose stop     # stop (data kept)
cd ~/openproject && docker compose start    # start again
```

Data lives in the Docker volumes `openproject_pgdata` and `openproject_opdata`. Never run `docker compose down -v` there: it deletes them.

## Limits

This instance runs only on this Mac. To show it to someone, share your screen or export views (PDF/CSV from the work package list). Moving to OpenProject Cloud later means re-running the sync script against the cloud URL.
