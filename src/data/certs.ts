export interface Cert {
  issuer: string
  name: string
  status: 'active' | 'in-progress'
}

export const certs: Cert[] = [
  { issuer: 'CompTIA', name: 'Security+', status: 'active' },
  { issuer: 'Google', name: 'Cybersecurity Professional Certificate', status: 'active' },
  { issuer: 'Microsoft', name: 'SC-900 · Security, Compliance & Identity', status: 'active' },
  { issuer: 'ISO/IEC', name: '27001 Lead Auditor', status: 'active' },
  { issuer: 'ISC2', name: 'CISSP', status: 'in-progress' },
]
