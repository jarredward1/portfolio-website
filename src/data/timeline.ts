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
      "I began my career with the Maryland Department of Public Safety and Correctional Services (DPSCS) in February 2013, working in a housing unit with approximately 120 incarcerated individuals. The environment required me to remain alert, recognize subtle warning signs, and assess situations before they escalated. I learned that access control procedures were only effective when they were enforced consistently and supported by clear documentation. Those responsibilities established the foundation for how I approach risk, controls, and accountability today.",
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
      "By November 2015, I had been selected for the tactical response team based on my professionalism, judgment, and ability to remain composed under pressure. My responsibilities expanded beyond a single housing unit to include the highest-risk incidents throughout the facility, where I coordinated with personnel across an institution housing more than 1,200 individuals. Strict adherence to policies, standards, and procedures was essential to protecting staff, incarcerated individuals, and the integrity of each response. This experience reinforced the importance of staying calm enough in the most difficult moments to make the right decision, rather than simply the fastest one.",
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
      "I was promoted to Tactical Commander in May 2017, a position I held for eight years. I led the tactical team through the facility's most volatile incidents while directing escalations, allocating resources, coordinating personnel, and ensuring each response remained controlled and defensible. I also developed a violence-reduction program that contributed to a 35 percent year-over-year decrease in physical assaults, wrote emergency response plans, and trained officers to carry them out effectively. That experience taught me that strong security depends on both effective response and deliberate prevention.",
  },
  {
    id: 'pivot',
    era: 'pivot',
    dateLabel: 'The pivot',
    title: 'B.S. Cybersecurity · 4.0 GPA',
    org: 'Full Sail University',
    meta: 'Preceded by an A.S. in Information Technology',
    ghost: '4.0',
    story:
      "Throughout my time at DPSCS, coworkers and supervisors often turned to me for technical support, including troubleshooting computers, configuring CCTV workstations, and reviewing security camera footage. Over time, that interest developed into a deliberate transition into cybersecurity. I earned an A.S. in Information Technology and a B.S. in Cybersecurity with a 4.0 GPA, while also completing several industry certifications. The transition did not feel like starting over because I was applying the same discipline I had developed around risk, controls, documentation, accountability, and incident response to a new environment.",
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
      "In May 2025, I entered the cybersecurity field professionally as a Security Analyst at LOG(N) Pacific. Using Microsoft Defender for Endpoint, Microsoft Sentinel, and KQL, I investigated endpoint and identity activity for signs of brute-force attacks, data exfiltration, ransomware, and other malicious behavior. I created custom detection rules, implemented inbound NSG and firewall controls that reduced observed brute-force incidents to zero, and built Sentinel dashboards enriched with threat intelligence. This role allowed me to translate my operational security experience into measurable detection, response, and hardening outcomes.",
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
      "I transitioned into vulnerability management in January 2026, where my prevention-focused mindset found its clearest technical application. I conduct authenticated Tenable scans across Windows and Linux environments, prioritize findings based on severity and business impact, and use PowerShell to support remediation and DISA STIG hardening. Through repeated scan, remediate, and verify cycles, I reduced critical vulnerabilities by 100 percent, high vulnerabilities by 89 percent, and medium vulnerabilities by 83 percent across the assessed server environment. Although the tools are different, the purpose remains the same: identify and close the gap before it becomes an incident.",
  },
  {
    id: 'next',
    era: 'next',
    dateLabel: 'Next',
    title: 'What comes next',
    ghost: 'Now',
    story:
      "Today, I am continuing to build my experience in governance, risk, and compliance while preparing for the CISSP. I want to help organizations translate regulations and security frameworks into practical policies, effective controls, measurable risk decisions, and audit-ready evidence. Over the long term, I plan to specialize in AI governance and help organizations adopt artificial intelligence responsibly while managing security, privacy, ethical, and regulatory risk. My twelve years in corrections gave me the foundation for this work, and everything I am building now continues to expand on it.",
  },
]
