// Syncs the Open Source counts in README.md from the same data that powers
// apoorvaverma.in — assets/oss.json in the personal-website repo. Rewrites the
// text between the <!-- OSS:START --> / <!-- OSS:END --> markers.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Pulled from the live site (public) rather than the repo, so it works even
// though personal-website is private.
const SRC = "https://www.apoorvaverma.in/assets/oss.json";
const README = join(dirname(fileURLToPath(import.meta.url)), "..", "README.md");

const short = (nameWithOwner) => nameWithOwner.split("/")[1];
const uniq = (arr) => [...new Set(arr)];

const res = await fetch(SRC);
if (!res.ok) throw new Error("Fetch oss.json failed: " + res.status);
const d = await res.json();

const shipNames = d.shipped.rows.slice(0, 10).map((r) => short(r.repo));
const ansRepos = uniq(d.answered.rows.map((r) => short(r.repo))).slice(0, 10);

const b1 = `- **${d.shipped.prs} merged PRs across ${d.shipped.repos} external projects** — ${shipNames.join(", ")}, and more`;
const b2 = `- **${d.answered.total} accepted answers in GitHub Discussions across ${d.answered.repos} repos** — ${ansRepos.join(", ")}, and more`;
const block = `<!-- OSS:START -->\n${b1}\n${b2}\n<!-- OSS:END -->`;

const md = readFileSync(README, "utf8");
const next = md.replace(/<!-- OSS:START -->[\s\S]*?<!-- OSS:END -->/, block);
if (!/<!-- OSS:START -->/.test(md)) throw new Error("OSS markers not found in README.md");
writeFileSync(README, next);
console.log(`README synced: ${d.shipped.prs} PRs / ${d.shipped.repos} repos, ${d.answered.total} answers.`);
