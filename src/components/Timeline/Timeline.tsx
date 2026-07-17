import { motion, useReducedMotion } from 'motion/react'
import { milestones, type Milestone } from '../../data/timeline'
import SectionHeader from '../ui/SectionHeader'
import s from './Timeline.module.css'

const eraLabel: Record<string, string | null> = {
  physical: 'Physical security',
  pivot: null,
  digital: 'Digital security',
  next: null,
}

function firstOfEra(index: number): boolean {
  if (index === 0) return true
  return milestones[index].era !== milestones[index - 1].era
}

export default function Timeline() {
  const reduced = useReducedMotion()

  return (
    <section id="timeline" className="section" aria-labelledby="timeline-title">
      <div className="container">
        <SectionHeader
          kicker="The through-line"
          title="One record, two theaters"
          titleId="timeline-title"
          sub="The same discipline — reading risk, holding a standard, commanding a response under pressure — first in a correctional facility, now across an enterprise attack surface."
        />

        <ol className={s.list}>
          {milestones.map((m, i) => (
            <TimelineNode
              key={m.id}
              m={m}
              showEra={firstOfEra(i)}
              reduced={!!reduced}
            />
          ))}
        </ol>
      </div>
    </section>
  )
}

function TimelineNode({
  m,
  showEra,
  reduced,
}: {
  m: Milestone
  showEra: boolean
  reduced: boolean
}) {
  const era = eraLabel[m.era]
  return (
    <li className={`${s.node} ${s[m.era]}`}>
      <div className={s.spine} aria-hidden="true">
        <span className={s.dot} />
      </div>

      <motion.div
        className={s.card}
        initial={{ opacity: 0, y: reduced ? 0 : 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        {showEra && era ? <p className={s.era}>{era}</p> : null}
        <p className={s.date}>{m.dateLabel}</p>
        <h3 className={s.title}>{m.title}</h3>
        {m.org ? <p className={s.org}>{m.org}</p> : null}
        {m.meta ? <p className={s.meta}>{m.meta}</p> : null}
        <ul className={s.points}>
          {m.points.map((p, idx) => (
            <li key={idx}>{p}</li>
          ))}
        </ul>
      </motion.div>
    </li>
  )
}
