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
  points: string[]
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
    points: [
      'Identified security threats and emerging risk indicators, enabling real-time incident response.',
      'Enforced facility access-control protocols and produced audit-ready incident records.',
    ],
  },
  {
    id: 'tac-team-2015',
    era: 'physical',
    dateLabel: 'Nov 2015',
    title: 'Tactical Team Member',
    org: 'Maryland Dept. of Public Safety & Correctional Services',
    meta: 'Baltimore, MD',
    ghost: '2015',
    points: [
      'Selected for the tactical response team on demonstrated judgment and composure under pressure.',
      'Responded to elevated-risk incidents with rapid, controlled decision-making.',
    ],
  },
  {
    id: 'tac-cmd-2017',
    era: 'physical',
    dateLabel: 'May 2017 - May 2025',
    title: 'Tactical Commander',
    org: 'Maryland Dept. of Public Safety & Correctional Services',
    meta: 'Baltimore, MD',
    ghost: '2017',
    points: [
      'Directed real-time escalation and resource-allocation decisions during high-pressure incidents.',
      'Led a violence-reduction program contributing to a 35% year-over-year decrease in physical assaults.',
      'Built emergency response plans and trained officers on tactical response protocols.',
    ],
  },
  {
    id: 'pivot',
    era: 'pivot',
    dateLabel: 'The pivot',
    title: 'B.S. Cybersecurity, 4.0 GPA',
    org: 'Full Sail University',
    meta: 'Preceded by an A.S. in Information Technology',
    ghost: '4.0',
    points: [
      'Certification run: Security+ · Google Cybersecurity · SC-900 · ISO 27001 Lead Auditor.',
      'Same discipline, new terrain: risk, controls, and incident response.',
    ],
  },
  {
    id: 'logn-sa-2025',
    era: 'digital',
    dateLabel: 'May 2025 - Jan 2026',
    title: 'Security Analyst',
    org: 'LOG(N) Pacific',
    meta: 'Microsoft Defender · Sentinel · KQL',
    ghost: '2025',
    points: [
      'Hunted threats with EDR, detecting indicators of compromise from brute-force attacks, data exfiltration, and ransomware.',
      'Built custom detection rules in Microsoft Defender for Endpoint to automate isolation and investigation of compromised systems.',
      'Cut brute-force incidents 100% with inbound NSG and firewall rules, and built Microsoft Sentinel dashboards fed by threat intelligence.',
    ],
  },
  {
    id: 'logn-vma-2026',
    era: 'digital',
    dateLabel: 'Jan 2026 - Present',
    title: 'Vulnerability Management Analyst',
    org: 'LOG(N) Pacific',
    meta: 'Tenable · Azure environment',
    ghost: '2026',
    points: [
      'Cut server-team vulnerabilities 100% (critical), 89% (high), and 83% (medium) through scan, remediate, and verify cycles.',
      'Runs authenticated Tenable scans across Windows and Linux, prioritizing findings by CVSS severity and business impact.',
      'Automates remediation and DISA STIG hardening with PowerShell to close configuration gaps.',
    ],
  },
  {
    id: 'next',
    era: 'next',
    dateLabel: 'Next',
    title: 'CISSP in progress',
    ghost: 'Now',
    points: [
      'Pursuing the CISSP certification through ISC2.',
      'Open to GRC and vulnerability-management roles, with a long-term aim of AI and security product leadership.',
    ],
  },
]
