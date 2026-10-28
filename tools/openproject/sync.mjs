#!/usr/bin/env node
// Mirrors ODD feature documents into OpenProject work packages.
//
//   odd/tasks/<feature>.md          -> Epic "[<feature>] ODD feature"
//   "### Phase N: ..." under Tasks  -> Feature (child of the Epic)
//   "- [ ] <id> <task> | S# | ..."  -> Task (child of the Feature), closed when checked
//   openspec/changes/archive/<name> -> Epic "[<name>] OpenSpec change (archived)", closed
//
// The ODD feature document is the source of truth for active work. Archived
// OpenSpec changes are project history and are mirrored as closed Epics.
// Re-running is safe: work packages are matched by their "[feature <id>]"
// subject prefix, created when missing, and their subject and status updated
// when they differ. Nothing is deleted; dates, comments and assignees are
// never touched.
//
// Usage: node tools/openproject/sync.mjs [--dry-run]
// Reads OPENPROJECT_URL and OPENPROJECT_API_KEY from tools/openproject/.env.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..');
const dryRun = process.argv.includes('--dry-run');

const PROJECT_IDENTIFIER = 'dotanote';
const PROJECT_NAME = 'dotanote';
const SUBJECT_MAX = 255;

function loadEnv() {
  const envPath = join(here, '.env');
  const env = { ...process.env };
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
      if (match && env[match[1]] === undefined) env[match[1]] = match[2];
    }
  }
  return env;
}

// ---------- ODD feature parsing ----------

export function parseOddFeature(markdown) {
  const phases = [];
  let current = null;
  let inTasks = false;
  for (const line of markdown.split('\n')) {
    const section = line.match(/^## (.+?)\s*$/);
    if (section) {
      inTasks = section[1] === 'Tasks';
      continue;
    }
    if (!inTasks) continue;
    const phase = line.match(/^### Phase (\d+):\s*(.+)$/);
    if (phase) {
      current = { number: phase[1], title: phase[2].trim(), tasks: [] };
      phases.push(current);
      continue;
    }
    const task = line.match(/^- \[( |x|X)\] (\d+\.\d+)\s+(.+)$/);
    if (task && current) {
      const [text, ...fields] = task[3].split(' | ');
      current.tasks.push({
        id: task[2],
        text: text.trim(),
        done: task[1] !== ' ',
        meta: fields.length ? describeFields(fields) : null,
      });
    }
  }
  return phases;
}

// "S1 | inline | commit: —" -> "Specs: S1 · Route: inline · Commit: —"
function describeFields([specs, route, commit]) {
  return [
    specs && `Specs: ${specs.trim()}`,
    route && `Route: ${route.trim()}`,
    commit && `Commit: ${commit.replace(/^\s*commit:\s*/, '').trim()}`,
  ]
    .filter(Boolean)
    .join(' · ');
}

// ---------- OpenSpec archive parsing ----------

export function parseOpenSpecTasks(markdown) {
  const phases = [];
  let current = null;
  for (const line of markdown.split('\n')) {
    const phase = line.match(/^## Phase (\d+):\s*(.+)$/);
    if (phase) {
      current = { number: phase[1], title: phase[2].trim(), tasks: [] };
      phases.push(current);
      continue;
    }
    const task = line.match(/^- \[( |x|X)\] (\d+\.\d+)\s+(.+)$/);
    if (task && current) {
      current.tasks.push({ id: task[2], text: task[3].trim(), done: task[1] !== ' ' });
    }
  }
  return phases;
}

function findFeatures() {
  const base = join(repoRoot, 'odd', 'tasks');
  if (!existsSync(base)) return [];
  return readdirSync(base, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name)
    .sort()
    .map((file) => ({ name: file.slice(0, -'.md'.length), path: join(base, file) }));
}

function findArchivedChanges() {
  const base = join(repoRoot, 'openspec', 'changes', 'archive');
  if (!existsSync(base)) return [];
  return readdirSync(base, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({ name: entry.name, tasksPath: join(base, entry.name, 'tasks.md') }))
    .filter((change) => existsSync(change.tasksPath))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function truncate(text) {
  return text.length <= SUBJECT_MAX ? text : `${text.slice(0, SUBJECT_MAX - 1)}…`;
}

// ---------- OpenProject API ----------

function createClient(baseUrl, apiKey) {
  const auth = `Basic ${Buffer.from(`apikey:${apiKey}`).toString('base64')}`;
  return async function api(method, path, body) {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`${method} ${path} -> ${response.status}: ${detail.slice(0, 500)}`);
    }
    return response.status === 204 ? null : response.json();
  };
}

async function ensureProject(api) {
  try {
    return await api('GET', `/api/v3/projects/${PROJECT_IDENTIFIER}`);
  } catch (error) {
    if (!String(error.message).includes('404')) throw error;
  }
  if (dryRun) return { id: 0, _links: { self: { href: '/api/v3/projects/0' } } };
  return api('POST', '/api/v3/projects', {
    identifier: PROJECT_IDENTIFIER,
    name: PROJECT_NAME,
    description: {
      format: 'markdown',
      raw: 'Voice transcription tool. Work mirrored from `odd/tasks/*.md` and archived OpenSpec changes.',
    },
  });
}

async function loadLookups(api, project) {
  const types = project.id
    ? (await api('GET', `/api/v3/projects/${project.id}/types`))._embedded.elements
    : (await api('GET', '/api/v3/types'))._embedded.elements;
  const statuses = (await api('GET', '/api/v3/statuses'))._embedded.elements;
  const byName = (list, ...names) =>
    names.map((n) => list.find((item) => item.name.toLowerCase() === n)).find(Boolean);

  if (project.id && types.length === 0) {
    throw new Error(
      `Project "${PROJECT_IDENTIFIER}" has no work package types enabled. Enable Epic, ` +
        `Feature and Task in Project settings -> Work package types, then run again.`
    );
  }
  const task = byName(types, 'task') ?? types[0];
  return {
    types: {
      epic: byName(types, 'epic', 'phase', 'summary task') ?? task,
      feature: byName(types, 'feature', 'phase', 'summary task') ?? task,
      task,
    },
    statuses: {
      open: byName(statuses, 'new') ?? statuses.find((s) => s.isDefault) ?? statuses[0],
      inProgress: byName(statuses, 'in progress') ?? statuses.find((s) => !s.isClosed),
      closed: byName(statuses, 'closed') ?? statuses.find((s) => s.isClosed),
    },
  };
}

async function loadExisting(api, project) {
  if (!project.id) return new Map();
  const filters = encodeURIComponent(JSON.stringify([{ status: { operator: '*', values: [] } }]));
  const result = await api(
    'GET',
    `/api/v3/projects/${project.id}/work_packages?pageSize=1000&filters=${filters}`
  );
  const map = new Map();
  for (const wp of result._embedded.elements) {
    const key = wp.subject.match(/^(\[[^\]]+\])/)?.[1];
    if (key) map.set(key, wp);
  }
  return map;
}

function statusFor(doneCount, total, statuses) {
  if (total > 0 && doneCount === total) return statuses.closed;
  if (doneCount > 0) return statuses.inProgress;
  return statuses.open;
}

async function upsert(api, ctx, { key, subject, description, type, status, parent }) {
  const existing = ctx.existing.get(key);
  if (existing) {
    const body = {};
    const statusChanged = existing._links.status.href !== status._links.self.href;
    if (existing.subject !== subject) body.subject = subject;
    if ((existing.description?.raw ?? '') !== description) {
      body.description = { format: 'markdown', raw: description };
    }
    if (statusChanged) body._links = { status: { href: status._links.self.href } };
    if (Object.keys(body).length > 0) {
      console.log(`update  ${subject}${statusChanged ? ` -> ${status.name}` : ''}`);
      if (!dryRun) {
        await api('PATCH', `/api/v3/work_packages/${existing.id}`, {
          lockVersion: existing.lockVersion,
          ...body,
        });
      }
    }
    return existing;
  }

  console.log(`create  ${subject} [${status.name}]`);
  if (dryRun) return { id: 0, _links: { self: { href: '/api/v3/work_packages/0' } } };

  const created = await api('POST', `/api/v3/projects/${ctx.project.id}/work_packages`, {
    subject,
    description: { format: 'markdown', raw: description },
    _links: {
      type: { href: type._links.self.href },
      ...(parent ? { parent: { href: parent._links.self.href } } : {}),
    },
  });
  if (created._links.status.href !== status._links.self.href) {
    await api('PATCH', `/api/v3/work_packages/${created.id}`, {
      lockVersion: created.lockVersion,
      _links: { status: { href: status._links.self.href } },
    });
  }
  ctx.existing.set(key, created);
  return created;
}

async function syncUnit(api, ctx, { name, kind, archived = false, source, phases }) {
  const all = phases.flatMap((p) => p.tasks);
  const doneAll = all.filter((t) => t.done).length;

  const epic = await upsert(api, ctx, {
    key: `[${name}]`,
    subject: `[${name}] ${kind}${archived ? ' (archived)' : ''}`,
    description: `${kind} \`${name}\`.\n\nSource: \`${source}\``,
    type: ctx.types.epic,
    status: archived ? ctx.statuses.closed : statusFor(doneAll, all.length, ctx.statuses),
  });

  for (const phase of phases) {
    const done = phase.tasks.filter((t) => t.done).length;
    const feature = await upsert(api, ctx, {
      key: `[${name} P${phase.number}]`,
      subject: truncate(`[${name} P${phase.number}] Phase ${phase.number}: ${phase.title}`),
      description: `Phase ${phase.number} of \`${name}\`.\n\nSource: \`${source}\``,
      type: ctx.types.feature,
      status: statusFor(done, phase.tasks.length, ctx.statuses),
      parent: epic,
    });

    for (const task of phase.tasks) {
      await upsert(api, ctx, {
        key: `[${name} ${task.id}]`,
        subject: truncate(`[${name} ${task.id}] ${task.text}`),
        description: `${task.text}\n\n${task.meta ? `${task.meta}\n\n` : ''}Source: \`${source}\`, task ${task.id}`,
        type: ctx.types.task,
        status: task.done ? ctx.statuses.closed : ctx.statuses.open,
        parent: feature,
      });
    }
  }
}

async function main() {
  const env = loadEnv();
  const baseUrl = (env.OPENPROJECT_URL ?? 'http://localhost:8080').replace(/\/$/, '');
  if (!env.OPENPROJECT_API_KEY) {
    throw new Error('OPENPROJECT_API_KEY is missing. Add it to tools/openproject/.env.');
  }

  const api = createClient(baseUrl, env.OPENPROJECT_API_KEY);
  const project = await ensureProject(api);
  const { types, statuses } = await loadLookups(api, project);
  const ctx = { project, types, statuses, existing: await loadExisting(api, project) };

  for (const feature of findFeatures()) {
    await syncUnit(api, ctx, {
      name: feature.name,
      kind: 'ODD feature',
      source: relative(repoRoot, feature.path),
      phases: parseOddFeature(readFileSync(feature.path, 'utf8')),
    });
  }

  for (const change of findArchivedChanges()) {
    await syncUnit(api, ctx, {
      name: change.name,
      kind: 'OpenSpec change',
      archived: true,
      source: relative(repoRoot, change.tasksPath),
      phases: parseOpenSpecTasks(readFileSync(change.tasksPath, 'utf8')),
    });
  }
  console.log(dryRun ? 'Dry run finished.' : 'Sync finished.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
