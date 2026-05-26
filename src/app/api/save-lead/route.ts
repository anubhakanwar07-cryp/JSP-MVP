import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import type { SaveLeadPayload, SaveLeadResponse, FollowupStage, OutreachStatus } from '@/types'

function calculateNextFollowup(
  status: OutreachStatus,
  sentAt: Date
): { followupDate: Date; followupStage: FollowupStage } | null {
  if (status !== 'sent') return null
  const followupDate = new Date(sentAt)
  followupDate.setDate(followupDate.getDate() + 3)
  return { followupDate, followupStage: 'first_followup' }
}

export async function POST(request: NextRequest) {
  const body = await request.json() as SaveLeadPayload

  const {
    company_name,
    role_targeted,
    recruiter_name,
    recruiter_role,
    recruiter_email,
    outreach_message,
    outreach_status = 'draft',
    source,
    confidence_score,
    email_status,
    recruiter_linkedin,
    candidate_name,
    your_name,
    lead_type,
  } = body

  if (!company_name || !role_targeted) {
    return NextResponse.json(
      { error: 'Missing required fields: company_name, role_targeted' },
      { status: 400 }
    )
  }

  const now = new Date()
  const followup = calculateNextFollowup(outreach_status, now)

  try {
    const { data, error } = await supabase
      .from('outreach_leads')
      .insert([{
        company_name,
        role_targeted,
        candidate_name:     candidate_name     ?? null,
        recruiter_name:     recruiter_name     ?? null,
        recruiter_role:     recruiter_role     ?? null,
        recruiter_email:    recruiter_email    ?? null,
        recruiter_linkedin: recruiter_linkedin ?? null,
        outreach_message:   outreach_message   ?? null,
        outreach_status,
        email_status:       email_status       ?? 'unknown',
        source:             source             ?? 'fallback',
        confidence_score:   confidence_score   ?? null,
        sent_at:            outreach_status === 'sent' ? now.toISOString() : null,
        followup_date:      followup?.followupDate.toISOString() ?? null,
        followup_due_at:    followup?.followupDate.toISOString() ?? null,
        followup_stage:     followup?.followupStage ?? null,
        your_name:          your_name ?? null,
        lead_type:          lead_type ?? 'outreach',
      }])
      .select('id')
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to save lead' },
        { status: 500 }
      )
    }

    const response: SaveLeadResponse = {
      success:       true,
      id:            data?.id ?? null,
      followup_date: followup?.followupDate.toISOString() ?? null,
      followup_stage: followup?.followupStage ?? null,
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('Unexpected error in save-lead:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Check your Supabase configuration.' },
      { status: 500 }
    )
  }
}
