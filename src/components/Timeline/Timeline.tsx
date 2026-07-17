import { useRef } from 'react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import { milestones, type Milestone } from '../../data/timeline'
import SectionHeader from '../ui/SectionHeader'
import s from './Timeline.module.css'

const eraLabel: Record<Milestone['era'], string | null> = {
  physical: 'Physical security',
  pivot: 'Cybersecurity',
  digital: null,
  next: null,
}

function firstOfEra(index: number): boolean {
  if (index === 0) return true
  return milestones[index].era !== milestones[index - 1].era
}

const EASE = [0.22, 1, 0.36, 1] as const

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
  const view = { once: true, margin: '-80px' } as const

  return (
    <li className={`${s.item} ${s[m.era]}`}>
      {showEra && era ? (
        <motion.p
          className={s.era}
          initial={{ opacity: 0, letterSpacing: reduced ? '0.14em' : '0.34em' }}
          whileInView={{ opacity: 1, letterSpacing: '0.14em' }}
          viewport={view}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          {era}
        </motion.p>
      ) : null}

      <motion.span
        className={s.ghost}
        aria-hidden="true"
        initial={{ opacity: 0, x: reduced ? 0 : 44 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={view}
        transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
      >
        {m.ghost}
      </motion.span>

      <span className={s.node} aria-hidden="true">
        <span className={s.nodeCore} />
        <motion.span
          className={s.nodeFill}
          initial={{ opacity: reduced ? 1 : 0, scale: reduced ? 1 : 0.4 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={view}
          transition={{ duration: 0.45, delay: 0.28, ease: EASE }}
        />
        {!reduced ? (
          <motion.span
            className={s.ring}
            initial={{ opacity: 0.85, scale: 0.4 }}
            whileInView={{ opacity: 0, scale: 3.1 }}
            viewport={view}
            transition={{ duration: 1.1, delay: 0.25, ease: 'easeOut' }}
          />
        ) : null}
        {m.era === 'pivot' && !reduced ? (
          <motion.span
            className={s.burst}
            initial={{ opacity: 0.7, scale: 0.3 }}
            whileInView={{ opacity: 0, scale: 5 }}
            viewport={view}
            transition={{ duration: 1.5, delay: 0.4, ease: 'easeOut' }}
          />
        ) : null}
      </span>

      <motion.div
        className={s.card}
        initial={{ opacity: 0, y: reduced ? 0 : 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={view}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <p className={s.date}>
          <span className={s.tick} aria-hidden="true" />
          {m.dateLabel}
        </p>
        <h3 className={s.title}>{m.title}</h3>
        {m.org ? (
          <p className={s.org}>
            {m.org}
            {m.meta ? <span className={s.meta}> · {m.meta}</span> : null}
          </p>
        ) : m.meta ? (
          <p className={s.org}>
            <span className={s.meta}>{m.meta}</span>
          </p>
        ) : null}
        <ul className={s.points}>
          {m.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </motion.div>
    </li>
  )
}

export default function Timeline() {
  const reduced = useReducedMotion() ?? false
  const bodyRef = useRef<HTMLDivElement>(null)

  // The spine draws itself as the list crosses the viewport; a glowing tip
  // rides the fill front. Skipped entirely under reduced motion (static line).
  const { scrollYProgress } = useScroll({
    target: bodyRef,
    offset: ['start 0.78', 'end 0.46'],
  })
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.5 })
  const tipTop = useTransform(fill, (v) => `${Math.min(Math.max(v, 0), 1) * 100}%`)
  const tipOpacity = useTransform(fill, [0, 0.02, 0.97, 1], [0, 1, 1, 0])

  return (
    <section id="timeline" className={`section ${s.section}`} aria-labelledby="timeline-title">
      <div className="container">
        <SectionHeader
          kicker="The through-line"
          title="One record, two theaters"
          titleId="timeline-title"
          sub="Read the risk, hold the standard, command the response under pressure. The discipline was built in a correctional facility and now runs across an enterprise attack surface."
        />

        <div className={s.body} ref={bodyRef}>
          <span className={s.track} aria-hidden="true" />
          <motion.span
            className={s.fillLine}
            aria-hidden="true"
            style={reduced ? undefined : { scaleY: fill }}
          />
          {!reduced ? (
            <motion.span
              className={s.tip}
              aria-hidden="true"
              style={{ top: tipTop, opacity: tipOpacity }}
            />
          ) : null}

          <ol className={s.list}>
            {milestones.map((m, i) => (
              <TimelineNode key={m.id} m={m} showEra={firstOfEra(i)} reduced={reduced} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
