import { skillGroups } from '../../data/skills'
import Reveal from '../ui/Reveal'
import SectionHeader from '../ui/SectionHeader'
import s from './Skills.module.css'

export default function Skills() {
  return (
    <section id="skills" className={`section ${s.section}`} aria-labelledby="skills-title">
      <div className="container">
        <SectionHeader
          kicker="Capabilities"
          title="Skills"
          titleId="skills-title"
          sub="The frameworks, platforms, and practice areas behind the vulnerability-management and GRC work above, grouped the way they show up in a scan cycle or a compliance audit."
        />

        <div className={s.groups}>
          {skillGroups.map((group, i) => {
            const headingId = `skills-cat-${i}`
            return (
              <Reveal key={group.label} delay={i * 0.06} className={s.group}>
                <h3 id={headingId} className={s.category}>
                  {group.label}
                </h3>
                <ul className={s.chips} aria-labelledby={headingId}>
                  {group.skills.map((skill) => (
                    <li key={skill} className={s.chip}>
                      {skill}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
