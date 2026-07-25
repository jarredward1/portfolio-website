import { motion, useReducedMotion } from 'motion/react'
import pinned from '../../data/pinned.json'
import { site } from '../../data/site'
import SectionHeader from '../ui/SectionHeader'
import { ArrowUpRight, GitHubIcon } from '../ui/Icons'
import s from './Projects.module.css'

interface Repo {
  name: string
  description: string
  url: string
  stars: number
  pushedAt: string | null
  language: string | null
}

const ACRONYMS = new Set(['pci', 'dss', 'grc', 'nist', 'csf', 'iso', 'edr', 'vm', 'it', 'cmmc'])

function titleize(name: string): string {
  return name
    .split(/[-_]/)
    .map((w) => (ACRONYMS.has(w.toLowerCase()) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}

function updated(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default function Projects() {
  const reduced = useReducedMotion()
  const repos = pinned.repos as Repo[]

  return (
    <section id="projects" className={`section ${s.section}`} aria-labelledby="projects-title">
      <div className="container">
        <SectionHeader
          kicker="Selected work"
          title="Projects, pinned on GitHub"
          titleId="projects-title"
          sub="Documented GRC and vulnerability-management projects. This list mirrors the repositories pinned on GitHub and refreshes on every deploy."
        />

        <ul className={s.grid}>
          {repos.map((repo, i) => (
            <motion.li
              key={repo.name}
              className={s.item}
              initial={{ opacity: 0, y: reduced ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: (i % 2) * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <a className={s.card} href={repo.url} target="_blank" rel="noreferrer">
                <span className={s.corners} aria-hidden="true">
                  <span className={s.cornerTL} />
                  <span className={s.cornerTR} />
                  <span className={s.cornerBL} />
                  <span className={s.cornerBR} />
                </span>
                <span className={s.index} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className={s.cardTop}>
                  <GitHubIcon size={18} />
                </div>
                <h3 className={s.name}>{titleize(repo.name)}</h3>
                <p className={s.repoPath}>{repo.name}</p>
                <p className={s.desc}>{repo.description}</p>
                <div className={s.metaRow}>
                  {repo.language ? <span className={s.lang}>{repo.language}</span> : null}
                  {repo.stars > 0 ? <span>★ {repo.stars}</span> : null}
                  {updated(repo.pushedAt) ? (
                    <span className={s.pushed}>Updated {updated(repo.pushedAt)}</span>
                  ) : null}
                  <ArrowUpRight size={14} className={s.cardArrow} />
                </div>
              </a>
            </motion.li>
          ))}
        </ul>

        <a className={s.allLink} href={site.github} target="_blank" rel="noreferrer">
          All repositories on GitHub
          <ArrowUpRight size={15} />
        </a>
      </div>
    </section>
  )
}
