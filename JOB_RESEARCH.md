# Bürokompass: recurring research

This is the user's existing public jobs site. Always verify that access is still public before publishing. Its root is the directory containing this file. Do not create a new site or another automation. The active local heartbeat is `b-rokompass-neue-jobs-an-werktagen`; its authoritative cadence is Monday–Friday at 09:00 Europe/Berlin. Weekends are excluded. The user selected Codex on their computer, not an external paid service.

## Scope and evidence

Search publicly indexed listings on Stepstone, Indeed and Bundesagentur für Arbeit with the web-search tool. Use Büro, Büromanagement, Sachbearbeitung, Büroassistenz, Assistenz, Verwaltung and kaufmännischer Mitarbeiter in Dortmund and approximately 30 km around it (e.g. Bochum, Lünen, Castrop-Rauxel, Schwerte, Witten, Unna, Kamen, Bergkamen, Herne). Exclude unrelated occupations and jobs clearly outside that area. Do not silently change scope based on the temporary search fields or distance slider in the site. The slider only filters the collection; research continues within 30 km.

Search systematically across the office-job terms and towns within 30 km of Dortmund. Inspect accessible result pages and relevant related-job links; use targeted title/employer searches to recover original listing URLs. There is no fixed quota of 3 results or 20 candidates per source. Continue while new matching candidates are being found; stop an exhausted branch when it yields only already checked results, irrelevant results, or inaccessible pages. Record access gaps and never describe this as the maximum available or a complete portal search. Respect the existing occupational and geographic filters; do not add apprenticeships, unrelated jobs or out-of-radius workplaces to increase counts. Publicly indexed results can be incomplete or stale: do not promise a full crawl or use first-discovery dates as publication dates. Do not bypass access controls or bot challenges. A failed direct fetch may be supplemented with a clearly attributed public search result, not invented contents. Do not keep retrying a blocked endpoint.

Collect only title, company, location, employment type and salary when explicitly evidenced, original link, and an evidence URL. Don't copy descriptions. Preserve all records already in data/jobs.json, every existing ID and addedAt value, including IDs of dismissed jobs. Existing seed IDs are used by the private database for seen, favorite and dismissed state. Never reset them or touch user data in D1. Do not drop old jobs just because they disappear from search results. If an ad is explicitly closed, avoid presenting it as new; retain its record for saved links.

## Validated update path

Read data/jobs.json and data/research.json, then prepare work/research-input.json:

```json
{
  "searchedAt": "actual current UTC timestamp in ISO 8601",
  "sources": [
    {"name":"Stepstone","status":"success"},
    {"name":"Indeed","status":"success"},
    {"name":"Arbeitsagentur","status":"success"}
  ],
  "jobs": [
    {"url":"verified direct job URL","source":"Indeed","title":"verified job title","company":"verified employer","location":"verified location","employment":"","salary":"","evidenceUrl":"HTTPS source page supporting this record"}
  ]
}
```

Use success only when that source was actually researched; use partial or failed for unresolved access or search failures. No new jobs is a valid successful research outcome. Use `node scripts/update-jobs.mjs work/research-input.json --dry-run`, inspect the summary, then run it without --dry-run. The helper validates source URLs, merges by stable portal job ID, retains first-discovery timestamps, and records last successful research separately from attempts. Never mark a source successful merely because its old data is still available.

## Publish and report

Follow the installed sites-building and sites-hosting skills for this same checkout. Keep changes confined to data/jobs.json, data/research.json and data/location-centers.json unless an actual blocker needs a minimal fix. The UI estimates distances from municipality centers in data/location-centers.json. For any new municipality, verify and add its center coordinates and source URL (Open-Meteo/GeoNames), selecting the correct municipality in NRW. Do not invent distances or exact workplace addresses. Unknown locations remain explicitly unknown and can be shown via the filter checkbox. Preserve existing municipality entries. Validate the production build, inspect the diff, commit only the intended changes, obtain a short-lived Sites source-write credential when needed, push, package the validated output, save a version, and deploy the existing public site. Read project_id from .openai/hosting.json and verify that the access mode remains public. The user permanently authorized automatic public publication on 5 September 2026, but only for verified job-content updates produced by this exact recurring research scope. Treat that standing authorization as the required approval for these bounded updates and do not ask again. Never alter access policies, features, design, research terms, sources, geographic scope or filters under this authorization; changes outside job data and honest research status require a separate user request and any approval required by Sites. Keep credentials out of files and output. Never claim an update is live until deployment succeeds. A failed deployment must be retried or clearly reported; do not move a failed run's publication state forward.

No visual browser QA is requested. As a scheduled background task, don't open or replace the user's tabs. Publish a truthful updated research timestamp even when no new jobs were found, but remain quiet in chat if results are unchanged and no action is needed. Notify only for newly discovered matching jobs, a material failure, or required user action. State new-job count and the site link after successful publication. No paid subscriptions, applications, emails, or messages to employers are authorized.
