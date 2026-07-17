import { motion, useReducedMotion } from 'motion/react'
import Reveal from './Reveal'
import s from './SectionHeader.module.css'

interface SectionHeaderProps {
  kicker: string
  title: string
  titleId: string
  sub?: string
}

export default function SectionHeader({ kicker, title, titleId, sub }: SectionHeaderProps) {
  const reduced = useReducedMotion()
  return (
    <header className={s.header}>
      <Reveal>
        <p className="mono-label">{kicker}</p>
        <h2 id={titleId} className="h2">
          {title}
        </h2>
        {sub ? <p className={s.sub}>{sub}</p> : null}
      </Reveal>
      <motion.div
        aria-hidden="true"
        className={s.rule}
        initial={{ scaleX: reduced ? 1 : 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: '-70px' }}
        transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      />
    </header>
  )
}
