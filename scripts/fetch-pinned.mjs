/**
 * Build-time fetch of Jarred's pinned GitHub repositories.
 *
 * Runs as `prebuild` (so every Cloudflare Pages deploy refreshes the data).
 * Pinned repos are only exposed via GitHub's GraphQL API, which requires an
 * authenticated request; the token comes from the GITHUB_TOKEN environment
 * variable (a Cloudflare Pages encrypted variable; never committed).
 *
 * Failure policy: this script must NEVER fail the build or empty the section.
 * On any problem it keeps the committed src/data/pinned.json and exits 0.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const OUT = fileURLToPath(new URL('../src/data/pinned.json', import.meta.url))
const LOGIN = 'jarredward1'

const QUERY = `
  query {
    user(login: "${LOGIN}") {
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name
            description
            url
            stargazerCount
            pushedAt
            primaryLanguage { name }
          }
        }
      }
    }
  }
`

async function keepFallback(reason) {
  console.warn(`[fetch-pinned] ${reason}; keeping committed pinned.json fallback.`)
  try {
    const current = JSON.parse(await readFile(OUT, 'utf8'))
    console.warn(`[fetch-pinned] Fallback has ${current.repos?.length ?? 0} repos (source: ${current.source}).`)
  } catch {
    console.warn('[fetch-pinned] WARNING: no readable fallback file found either.')
  }
  process.exit(0)
}

const token = process.env.GITHUB_TOKEN
if (!token) {
  await keepFallback('GITHUB_TOKEN is not set')
}

try {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15_000)

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    signal: controller.signal,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'jarred-ward-portfolio-build',
    },
    body: JSON.stringify({ query: QUERY }),
  })
  clearTimeout(timer)

  if (!res.ok) {
    await keepFallback(`GitHub API responded ${res.status}`)
  }

  const payload = await res.json()
  if (payload.errors?.length) {
    await keepFallback(`GraphQL errors: ${payload.errors.map((e) => e.message).join('; ')}`)
  }

  const nodes = payload.data?.user?.pinnedItems?.nodes
  if (!Array.isArray(nodes) || nodes.length === 0) {
    await keepFallback('No pinned repositories in response')
  }

  const repos = nodes
    .filter((n) => n && typeof n.name === 'string' && typeof n.url === 'string')
    .map((n) => ({
      name: n.name,
      description: n.description ?? '',
      url: n.url,
      stars: n.stargazerCount ?? 0,
      pushedAt: n.pushedAt ?? null,
      language: n.primaryLanguage?.name ?? null,
    }))

  if (repos.length === 0) {
    await keepFallback('Response contained no valid repository nodes')
  }

  const out = {
    generatedAt: new Date().toISOString(),
    source: 'github-graphql',
    repos,
  }
  await writeFile(OUT, JSON.stringify(out, null, 2) + '\n', 'utf8')
  console.log(`[fetch-pinned] Wrote ${repos.length} pinned repos to src/data/pinned.json.`)
} catch (err) {
  await keepFallback(`Fetch failed: ${err?.message ?? err}`)
}
