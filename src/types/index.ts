export type RecruiterSource = 'hunter' | 'linkedin_scraper' | 'fallback' | 'manual'
export type EmailStatus = 'verified' | 'probable' | 'unknown' | 'fallback'
export type FollowupStage = 'first_followup' | 'second_followup' | 'going_cold'
export type OutreachStatus = 'draft' | 'sent' | 'followup_due' | 'followed_up' | 'replied' | 'cold' | 'closed'
export type Tone = 'professional' | 'warm' | 'confident'
export type CompanyStage = 'any' | 'seed-a' | 'b-c' | 'late' | 'enterprise'
export type RemotePreference = 'any' | 'remote' | 'hybrid' | 'onsite'

export interface Recruiter {
  name: string
  role: string
  email: string
  emailStatus: EmailStatus
  emailVerified: boolean
  linkedin: string | null
  profileUrl: string | null
  website: string | null
  company: string
  domain: string | null
  confidence: number
  location: string
  source: RecruiterSource
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
  followupDate: string | null
  followupStage: FollowupStage | null
}

export interface CandidateForm {
  yourName: string
  background: string
  targetRole: string
  targetCompany: string
  achievements: string
  industry: string
  location: string
  companyStage: CompanyStage
  remotePreference: RemotePreference
  preferredCompanies: string
  companyDomain: string
  jobLink: string
  jobDescription: string
  tone: Tone
}

export interface CandidateContext {
  yourName: string
  background: string
  targetRole: string
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
  email_status?: EmailStatus
  recruiter_linkedin?: string
  candidate_name?: string
  your_name?: string
  lead_type?: string
}

// Full lead record returned from DB
export interface Lead {
  id: string
  company_name: string
  role_targeted: string
  candidate_name: string | null
  recruiter_name: string | null
  recruiter_role: string | null
  recruiter_email: string | null
  recruiter_linkedin: string | null
  outreach_message: string | null
  outreach_status: OutreachStatus
  email_status: EmailStatus
  followup_date: string | null
  followup_due_at: string | null
  followup_stage: FollowupStage | null
  last_followup_at: string | null
  sent_at: string | null
  your_name: string | null
  lead_type: string
  source: string
  confidence_score: number | null
  notes: string | null
  interview_date: string | null
  created_at: string
}

export interface UpdateLeadPayload {
  outreach_status?: OutreachStatus
  notes?: string
  interview_date?: string | null
  followup_due_at?: string | null
  followup_stage?: FollowupStage | null
  last_followup_at?: string | null
  sent_at?: string | null
}

export type FollowupState = 'pending' | 'reminded' | 'escalated' | 'cold' | 'cleared'

export interface SaveLeadResponse {
  success: boolean
  id: string | null
  followup_date: string | null
  followup_stage: FollowupStage | null
}
