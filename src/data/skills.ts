export interface SkillGroup {
  label: string
  skills: string[]
}

/**
 * Source of truth: Jarred's LinkedIn profile "Core skills" line, plus SAQ-D.
 * "Vulnerability Management" and "Governance, Risk, and Compliance" are
 * intentionally omitted as chips — each is redundant with its own category
 * label directly above it.
 */
export const skillGroups: SkillGroup[] = [
  {
    label: 'Vulnerability Management',
    skills: ['Tenable.io', 'CVSS', 'DISA STIG'],
  },
  {
    label: 'Frameworks & Standards',
    skills: ['NIST CSF', 'NIST SP 800-37 RMF', 'NIST SP 800-53', 'PCI DSS', 'ISO 27001', 'SAQ-D'],
  },
  {
    label: 'GRC',
    skills: [
      'Risk Assessment',
      'Compliance Auditing',
      'Security Control Mapping',
      'Policy Development',
      'Risk Reporting',
      'Stakeholder Communication',
    ],
  },
  {
    label: 'Platforms & Tools',
    skills: ['Microsoft Azure', 'Microsoft Sentinel', 'Microsoft Defender', 'PowerShell', 'KQL', 'Python'],
  },
]
