import { Suspense, lazy, useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { site } from '../../data/site'
import { webglSupported } from '../Bust/webglSupported'
import BustPoster from '../Bust/BustPoster'
import { ArrowRight, DownloadIcon } from '../ui/Icons'
import s from './Hero.module.css'

const Bust = lazy(() => import('../Bust/Bust'))

export default function Hero() {
  const reduced = useReducedMotion() ?? false
  const [canWebgl, setCanWebgl] = useState(false)

  useEffect(() => {
    setCanWebgl(webglSupported())
  }, [])

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduced ? 0 : 0.09, delayChildren: 0.1 },
    },
  }
  const item = {
    hidden: { opacity: 0, y: reduced ? 0 : 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
    },
  }

  return (
    <section className={s.hero} aria-labelledby="hero-name">
      <div className={s.bustLayer} aria-hidden="true">
        {canWebgl ? (
          <Suspense fallback={null}>
            <Bust reduced={reduced} />
          </Suspense>
        ) : (
          <BustPoster />
        )}
        <div className={s.bustVignette} />
      </div>

      <div className={`container ${s.inner}`}>
        <motion.div
          className={s.content}
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.p className={`mono-label ${s.kicker}`} variants={item}>
            Vulnerability Management · GRC · Atlanta
          </motion.p>

          <h1 id="hero-name" className={s.name}>
            <motion.span className={s.nameLine} variants={item}>
              Jarred
            </motion.span>
            <motion.span className={s.nameLine} variants={item}>
              Ward
            </motion.span>
          </h1>

          <motion.p className={s.lead} variants={item}>
            {site.hook}
          </motion.p>

          <motion.div className={s.actions} variants={item}>
            <a className={s.primary} href="#contact">
              Get in touch
              <ArrowRight size={17} />
            </a>
            <a className={s.secondary} href={site.resumePath} download>
              <DownloadIcon size={16} />
              Download résumé
            </a>
          </motion.div>
        </motion.div>
      </div>

      <motion.a
        href="#timeline"
        className={s.scrollCue}
        aria-label="Scroll to timeline"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 1.4, duration: 0.6 }}
      >
        <span className={s.scrollDot} />
        <span className="mono-label">Scroll</span>
      </motion.a>
    </section>
  )
}
