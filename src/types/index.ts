export interface Recruiter {
  name: string
  role: string
  email: string
  emailVerified: boolean
  linkedin: string | null
  website: string | null
  company: string
  confidence: number
  location: string
}

export interface OutreachDraft {
  subject: string
  body: string
}

export interface QueueItem {
  recruiter: Recruiter
  outreach: OutreachDraft
  saving: boolean
  saved: boolean
}

export type CompanyStage = 'any' | 'seed-a' | 'b-c' | 'late' | 'enterprise'
export type RemotePreference = 'any' | 'remote' | 'hybrid' | 'onsite'
export type OutreachStatus = 'draft' | 'sent'

export interface CandidateForm {
  yourName: string
  background: string
  targetRole: string
  achievements: string
  industry: string
  location: string
  companyStage: CompanyStage
  remotePreference: RemotePreference
  preferredCompanies: string
}

export interface SaveLeadPayload {
  company_name: string
  role_targeted: string
  recruiter_name?: string
  recruiter_role?: string
  recruiter_email?: string
  outreach_message?: string
  outreach_status?: OutreachStatus
  source?: string
  confidence_score?: number
}
