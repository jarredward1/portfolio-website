import { motion, useReducedMotion } from 'motion/react'
import { certs } from '../../data/certs'
import SectionHeader from '../ui/SectionHeader'
import s from './Certs.module.css'

export default function Certifications() {
  const reduced = useReducedMotion()

  return (
    <section id="certifications" className={`section ${s.section}`} aria-labelledby="certs-title">
      <div className="container">
        <SectionHeader
          kicker="Credentials"
          title="Certifications"
          titleId="certs-title"
          sub="These certifications validate the knowledge behind my hands-on cybersecurity work and support my continued development."
        />

        <ul className={s.ledger}>
          {certs.map((c, i) => (
            <motion.li
              key={c.name}
              className={`${s.row} ${c.status === 'in-progress' ? s.pending : ''}`}
              initial={{ opacity: 0, y: reduced ? 0 : 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className={s.rowIndex} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className={s.issuer}>{c.issuer}</span>
              <span className={s.name}>{c.name}</span>
              <span className={s.status}>
                {c.status === 'in-progress' ? (
                  <>
                    <span className={s.pulse} aria-hidden="true" />
                    In progress
                  </>
                ) : (
                  <>
                    <span className={s.check} aria-hidden="true" />
                    Active
                  </>
                )}
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
