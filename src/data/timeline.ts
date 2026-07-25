export type Era = 'physical' | 'pivot' | 'digital' | 'next'

export interface Milestone {
  id: string
  era: Era
  dateLabel: string
  title: string
  org?: string
  meta?: string
  /** Oversized background numeral rendered behind the card. */
  ghost: string
  story: string
}

/** Source of truth: Jarred's LinkedIn profile (linkedin.com/in/jarredward1). */
export const milestones: Milestone[] = [
  {
    id: 'co-2013',
    era: 'physical',
    dateLabel: 'Feb 2013',
    title: 'Correctional Officer',
    org: 'Maryland Dept. of Public Safety & Correctional Services',
    meta: 'Baltimore, MD',
    ghost: '2013',
    story:
      "I started at the Maryland Department of Public Safety and Correctional Services (DPSCS) in February 2013, working in the section of the prison that housed 120 of Baltimore's most hardened criminals. The job came down to reading a room before it became a problem: spotting the small signs of risk before they turned into something worse, and responding in real time when they did. I learned early to enforce access control without exception and to document every incident cleanly enough to survive an audit or a court case. That habit of noticing risk and maintaining thorough documentation never left me.",
  },
  {
    id: 'tac-team-2015',
    era: 'physical',
    dateLabel: 'Nov 2015',
    title: 'Tactical Team Member',
    org: 'Maryland Dept. of Public Safety & Correctional Services',
    meta: 'Baltimore, MD',
    ghost: '2015',
    story:
      "By November 2015 I'd been selected for the tactical response team, chosen for my professionalism and how I held up under pressure. The role meant instead of just handling my section, I was responsible for running into the highest-risk incidents everywhere in the entire facility that housed over 1,200 inmates, and making fast, controlled decisions when there was no time to second-guess them. Following policies, standards, and procedures was a requirement that often saved my job, or even my life, and keeping excellent documentation was a must. It sharpened something I'd keep relying on for the rest of my career: staying calm enough in the worst moments to make the right call instead of just a fast one.",
  },
  {
    id: 'tac-cmd-2017',
    era: 'physical',
    dateLabel: 'May 2017 - May 2025',
    title: 'Tactical Commander',
    org: 'Maryland Dept. of Public Safety & Correctional Services',
    meta: 'Baltimore, MD',
    ghost: '2017',
    story:
      "Over the years, I was trusted by my peers and stakeholders to be a reliable and professional leader. I was promoted to a leadership role as the commander of the tactical team in May 2017, and I stayed there for eight years, directing escalation and resource decisions in real time during the facility's most volatile incidents. The work that meant the most to me wasn't the emergencies themselves, it was the program I built to prevent them and keep people safe: a violence-reduction effort that cut physical assaults 35% year over year. I wrote the emergency response plans and trained the officers who'd carry them out, because I'd rather build a system that stops or even prevents the crisis than just be good at reacting to one.",
  },
  {
    id: 'pivot',
    era: 'pivot',
    dateLabel: 'The pivot',
    title: 'B.S. Cybersecurity, 4.0 GPA',
    org: 'Full Sail University',
    meta: 'Preceded by an A.S. in Information Technology',
    ghost: '4.0',
    story:
      "During my tenure at DPSCSC, I was always the person that coworkers and stakeholders came to when they needed IT help, whether it was computer troubleshooting, configuring CCTV workstations, or reviewing security camera footage. I decided to follow my passions and go back to school, earning an A.S. in Information Technology and then a B.S. in Cybersecurity with a 4.0 GPA. I also obtained certifications alongside it: Security+, SC-900, and ISO 27001 Lead Auditor. None of it felt like starting over, instead, it just felt like a natural transition. It was the same discipline of risk, controls, and incident response I'd spent over a decade practicing, just on a different terrain.",
  },
  {
    id: 'logn-sa-2025',
    era: 'digital',
    dateLabel: 'May 2025 - Jan 2026',
    title: 'Security Analyst',
    org: 'LOG(N) Pacific',
    meta: 'Microsoft Defender · Sentinel · KQL',
    ghost: '2025',
    story:
      "I landed my first cybersecurity role at LOG(N) Pacific in May 2025 as a Security Analyst, hunting threats through EDR and learning to recognize indicators of compromise, brute-force attempts, data exfiltration, and ransomware: the digital version of the risk signs I'd spent years reading in person. I built custom detection rules in Microsoft Defender for Endpoint to automate isolation and investigation, went after the brute-force problem directly with inbound NSG and firewall rules until those incidents dropped to zero, and built out Microsoft Sentinel dashboards fed by threat intelligence.",
  },
  {
    id: 'logn-vma-2026',
    era: 'digital',
    dateLabel: 'Jan 2026 - Present',
    title: 'Vulnerability Management Analyst',
    org: 'LOG(N) Pacific',
    meta: 'Tenable · Azure environment',
    ghost: '2026',
    story:
      "In January 2026 I transitioned into vulnerability management, which is where the prevention instinct from my corrections career finally had a direct outlet. I run authenticated Tenable scans across Windows and Linux environments, prioritize what I find by CVSS severity and actual business impact rather than just the number, and automate remediation and DISA STIG hardening with PowerShell to close configuration gaps before they get exploited. Running that scan, remediate, and verify cycle against those environments cut vulnerabilities 100% at critical, 89% at high, and 83% at medium. It's the same job I've always done: find the gap before it becomes an incident.",
  },
  {
    id: 'next',
    era: 'next',
    dateLabel: 'Next',
    title: 'What comes next',
    ghost: 'Now',
    story:
      "Today, I am building toward a career in GRC while preparing for the CISSP. I want to help organizations translate regulations and security frameworks into practical policies, effective controls, measurable risk decisions, and audit-ready evidence. In the long term, my goal is to specialize in AI governance, helping organizations adopt AI responsibly while managing security, privacy, ethical, and regulatory risks. The technology may continue to evolve, but my purpose remains the same: strengthen accountability, reduce uncertainty, and protect the people who depend on these systems. Twelve years in corrections taught me the foundations of this discipline. I'm still building on it.",
  },
]
