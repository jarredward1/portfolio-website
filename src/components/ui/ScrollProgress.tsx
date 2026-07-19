import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react'
import s from './ScrollProgress.module.css'

/** Hairline gradient along the top of the viewport that fills as you read. */
export default function ScrollProgress() {
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const smooth = useSpring(scrollYProgress, { stiffness: 150, damping: 32, mass: 0.3 })

  return (
    <motion.div
      className={`${s.bar} no-print`}
      aria-hidden="true"
      style={{ scaleX: reduced ? scrollYProgress : smooth }}
    />
  )
}
