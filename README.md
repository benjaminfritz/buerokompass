# Bürokompass

A personal job collection for office and administrative roles in Dortmund and the surrounding area. Bürokompass brings together researched listings from Stepstone, Indeed, and Germany's Federal Employment Agency, with personal bookmarks and a clear distinction between unseen, seen, and dismissed jobs.

[Visit the live application](https://jobs.benjaminfritz.chatgpt.site)

## Features

- Unseen jobs appear first; seen jobs are visually subdued.
- Save favorites and mark unsuitable jobs as not relevant. Dismissed jobs can be restored.
- Search the collection and filter by source or personal status.
- Filter by approximate distance from Dortmund: 0, 5, 10, 20, or 30 km. The default is Dortmund only.
- Display 10 jobs per page.
- Save additional job links, with best-effort extraction of the title, company, and location. Extracted fields remain editable.
- Open searches on the original portals for other occupations or locations.

Distance estimates use municipality centers, not workplace addresses or travel distance. For listings with several locations, the nearest recognized municipality is used. Jobs with unknown locations can be included explicitly.

## Stack

React, TypeScript, and Vinext (Next.js-compatible routing on Vite), with Tailwind CSS, Base UI components, Cloudflare Workers, Cloudflare D1, and Drizzle ORM. The live application is hosted through OpenAI Sites.

## Local development

Requires Node.js **22.13.0 or newer** and npm.

```sh
npm ci
npm run dev
```

Open the URL printed by the development server.

```sh
npm run build      # Build the production Worker and client assets
npm run start      # Run the built application through Wrangler locally
npm run lint       # Run Oxlint
npm run db:generate # Generate migrations after schema changes
```

The source includes a local D1 binding configuration. Personal collection actions additionally require the database schema and the trusted authentication context supplied by Sites. A standalone local server does not provide production ChatGPT sign-in automatically.

## Data and privacy

There are two separate data stores:

| Data | Storage |
| --- | --- |
| Shared researched listings and their original links | `data/jobs.json` |
| Research timestamps and source status | `data/research.json` |
| Municipality coordinates and provenance | `data/location-centers.json` |
| User-added jobs, favorites, seen state, and dismissed state | Cloudflare D1, scoped to the authenticated user |

The repository contains public listing metadata and database schema migrations. It does not contain a production database export or users' personal collections. Personal actions require ChatGPT sign-in on the hosted application.

`app/chatgpt-auth.ts` reads identity headers supplied by the trusted Sites hosting layer. Deploying this application elsewhere requires an authentication integration that preserves that trust boundary; client-supplied identity headers must not be treated as authenticated users.

## Job research

The linked cloud task is configured to run **daily at 09:00 Europe/Berlin**, independently of a local computer. Scheduling is managed outside this repository. The research task updates the collection; the browser's reload button only reloads saved data.

Research covers Dortmund and approximately 30 km around it, using these terms: Büro, Büromanagement, Sachbearbeitung, Büroassistenz, Assistenz, Verwaltung, and kaufmännische Mitarbeit. The UI distance slider and portal search fields do not change this research scope.

Only evidenced, relevant listings with direct original links should be added. Public search results may be incomplete, inaccessible, or stale. The collection is **not a complete crawl** of the portals, and first-discovery timestamps are not publication dates. Check availability on the original portal.

For the evidence requirements and update procedure, see [JOB_RESEARCH.md](JOB_RESEARCH.md). Its legacy references to a local weekday automation, and the corresponding scheduling text currently in the UI, predate the cloud migration; the linked cloud task's saved schedule is authoritative.

### Validate and merge researched jobs

Prepare an input JSON file with `searchedAt`, all three source statuses, and evidenced job records as documented in `JOB_RESEARCH.md`, then run:

```sh
node scripts/update-jobs.mjs work/research-input.json --dry-run
node scripts/update-jobs.mjs work/research-input.json
```

The helper validates portal URLs, merges by stable job ID, and preserves first-discovery timestamps. It does not fetch listings or verify their content. Research and evidence checks must happen before merging. Existing listings are retained so saved links and personal state continue to work. Use `partial` or `failed` honestly when a source cannot be fully researched.

## Project layout

| Path | Purpose |
| --- | --- |
| `app/job-desk.tsx` | Main collection interface |
| `app/api/jobs/` | Personal collection API and link preview |
| `lib/` | Job URL handling, link extraction, distance filtering, and browser tools |
| `data/` | Shared researched data |
| `db/` and `drizzle/` | Database schema, access helpers, and migrations |
| `scripts/update-jobs.mjs` | Validated research merge |
| `.openai/hosting.json` | Existing Sites project association and logical storage binding |

## Hosting and GitHub

The Sites association is intentionally retained. Publishing the application uses the Sites source, build, and deployment workflow; pushing to GitHub alone does not deploy the live application.

The public GitHub repository starts with a snapshot of the application, without the earlier Sites commit history. In the maintainer's existing checkout, `main` retains the Sites history and `github-public` tracks the public GitHub `main` branch through the `github` remote. Updates must preserve this separation to avoid publishing the older private history. GitHub synchronization is currently manual.

Do not commit credentials, environment files, local Worker state, or database exports. To host a separate instance, register its own Sites project and storage rather than reusing the existing production association.
