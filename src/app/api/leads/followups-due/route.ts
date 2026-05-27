import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { sendFollowupReminder } from '@/lib/email/resend'
import type { Lead, FollowupStage } from '@/types'

function getDaysElapsed(sentAt: string): number {
  const diff = Date.now() - new Date(sentAt).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function computeFollowupStage(daysElapsed: number): FollowupStage {
  if (daysElapsed >= 7) return 'going_cold'
  if (daysElapsed >= 5) return 'second_followup'
  return 'first_followup'
}

export async function GET() {
  try {
    const now = new Date().toISOString()

    const { data: leads, error } = await supabase
      .from('outreach_leads')
      .select('*')
      .lte('followup_due_at', now)
      .in('outreach_status', ['sent', 'followup_due'])
      .order('followup_due_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!leads || leads.length === 0) return NextResponse.json([])

    const updatedLeads: Lead[] = []

    for (const lead of leads as Lead[]) {
      if (!lead.sent_at) continue

      const daysElapsed  = getDaysElapsed(lead.sent_at)
      const newStage     = computeFollowupStage(daysElapsed)
      const stageChanged = lead.followup_stage !== newStage

      let newFollowupDate: string | null = lead.followup_due_at
      let newStatus: string = lead.outreach_status

      if (newStage === 'going_cold') {
        newStatus = 'cold'
        newFollowupDate = null
      } else if (newStage === 'second_followup' && lead.followup_stage === 'first_followup') {
        const d = new Date(lead.sent_at)
        d.setDate(d.getDate() + 7)
        newFollowupDate = d.toISOString()
        newStatus = 'followup_due'
      } else if (newStage === 'first_followup' && lead.outreach_status === 'sent') {
        newStatus = 'followup_due'
      }

      const { data: updated } = await supabase
        .from('outreach_leads')
        .update({
          followup_stage:  newStage,
          outreach_status: newStatus,
          followup_due_at: newFollowupDate,
        })
        .eq('id', lead.id)
        .select()
        .single()

      if (updated) updatedLeads.push(updated as Lead)

      if (stageChanged && process.env.RESEND_API_KEY && process.env.USER_NOTIFICATION_EMAIL) {
        await sendFollowupReminder({
          to:            process.env.USER_NOTIFICATION_EMAIL,
          companyName:   lead.company_name,
          recruiterName: lead.recruiter_name ?? 'the recruiter',
          role:          lead.role_targeted,
          daysElapsed,
          stage:         newStage,
          leadId:        lead.id,
        })
      }
    }

    return NextResponse.json(updatedLeads)
  } catch (err) {
    console.error('Followup engine error:', err)
    return NextResponse.json({ error: 'Follow-up check failed' }, { status: 500 })
  }
}
