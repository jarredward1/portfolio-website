import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useMotionValueEvent,
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
  spark,
}: {
  m: Milestone
  showEra: boolean
  reduced: boolean
  spark: boolean
}) {
  const era = eraLabel[m.era]
  const view = { once: true, margin: '-80px' } as const
  const liRef = useRef<HTMLLIElement>(null)

  // The ghost numeral counter-scrolls a few pixels slower than the page,
  // giving the timeline a depth plane. Skipped under reduced motion.
  const { scrollYProgress: itemProgress } = useScroll({
    target: liRef,
    offset: ['start end', 'end start'],
  })
  const ghostY = useTransform(itemProgress, [0, 1], [38, -38])

  return (
    <li ref={liRef} className={`${s.item} ${s[m.era]}`} data-id={m.id}>
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
        style={reduced ? undefined : { y: ghostY }}
        initial={{ opacity: 0, x: reduced ? 0 : 44 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={view}
        transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
      >
        {m.ghost}
      </motion.span>

      <span className={s.node} aria-hidden="true" data-node>
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
        {spark && !reduced ? (
          <motion.span
            className={s.spark}
            initial={{ opacity: 1, scale: 0.15, rotate: 0 }}
            animate={{ opacity: [1, 1, 0], scale: [0.15, 1.7, 2.9], rotate: 75 }}
            transition={{ duration: 0.85, times: [0, 0.4, 1], ease: 'easeOut' }}
          >
            <span className={s.sparkCross} />
          </motion.span>
        ) : null}
        {m.era === 'pivot' ? (
          <span className={s.orbits} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
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
  const listRef = useRef<HTMLOListElement>(null)

  // The spine draws itself as the list crosses the viewport; a glowing tip
  // rides the fill front. Skipped entirely under reduced motion (static line).
  const { scrollYProgress } = useScroll({
    target: bodyRef,
    offset: ['start 0.78', 'end 0.46'],
  })
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.5 })
  const tipTop = useTransform(fill, (v) => `${Math.min(Math.max(v, 0), 1) * 100}%`)
  const tipOpacity = useTransform(fill, [0, 0.02, 0.97, 1], [0, 1, 1, 0])

  // Node spark: when the tip's fill front passes a node, that node flicks a
  // one-shot spark. Node offsets are measured from the DOM (they shift with
  // era headers and viewport width), re-measured on resize.
  const fractions = useRef<{ id: string; f: number }[]>([])
  const fired = useRef<Record<string, boolean>>({})
  const [sparked, setSparked] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (reduced) return
    const body = bodyRef.current
    const list = listRef.current
    if (!body || !list) return
    const measure = () => {
      const bodyTop = body.getBoundingClientRect().top
      const bh = body.scrollHeight
      if (bh === 0) return
      fractions.current = (Array.from(list.children) as HTMLElement[]).map((li) => {
        const node = li.querySelector<HTMLElement>('[data-node]')
        const top = node
          ? node.getBoundingClientRect().top - bodyTop + 7
          : li.offsetTop + 14
        return { id: li.dataset.id ?? '', f: Math.min(Math.max(top / bh, 0), 1) }
      })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(body)
    return () => ro.disconnect()
  }, [reduced])

  useMotionValueEvent(fill, 'change', (v) => {
    if (reduced) return
    for (const { id, f } of fractions.current) {
      if (id && v >= f && !fired.current[id]) {
        fired.current[id] = true
        setSparked((prev) => ({ ...prev, [id]: true }))
      }
    }
  })

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

          <ol className={s.list} ref={listRef}>
            {milestones.map((m, i) => (
              <TimelineNode
                key={m.id}
                m={m}
                showEra={firstOfEra(i)}
                reduced={reduced}
                spark={!!sparked[m.id]}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
