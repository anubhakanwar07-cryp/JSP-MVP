import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import type { UpdateLeadPayload } from '@/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  if (!id) return NextResponse.json({ error: 'Missing lead id' }, { status: 400 })

  try {
    const body = await request.json() as UpdateLeadPayload

    if (body.outreach_status === 'sent' && !body.sent_at) {
      const now = new Date()
      body.sent_at = now.toISOString()
      if (!body.followup_due_at) {
        const followupDate = new Date(now)
        followupDate.setDate(followupDate.getDate() + 3)
        body.followup_due_at = followupDate.toISOString()
        body.followup_stage = 'first_followup'
      }
    }

    if (body.outreach_status === 'replied') {
      body.followup_stage = null
      body.followup_due_at = null
    }

    const { data, error } = await supabase
      .from('outreach_leads')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Unexpected error updating lead:', err)
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  if (!id) return NextResponse.json({ error: 'Missing lead id' }, { status: 400 })

  try {
    const { error } = await supabase
      .from('outreach_leads')
      .delete()
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Unexpected error deleting lead:', err)
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 })
  }
}
