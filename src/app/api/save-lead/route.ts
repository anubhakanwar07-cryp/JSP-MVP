import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import type { SaveLeadPayload } from '@/types'

export async function POST(request: NextRequest) {
  const body = await request.json() as SaveLeadPayload

  const {
    company_name,
    role_targeted,
    recruiter_name,
    recruiter_role,
    recruiter_email,
    outreach_message,
    outreach_status,
    source,
    confidence_score,
  } = body

  if (!company_name || !role_targeted) {
    return NextResponse.json(
      { error: 'Missing required fields: company_name, role_targeted' },
      { status: 400 }
    )
  }

  try {
    const { data, error } = await supabase
      .from('outreach_leads')
      .insert([{
        company_name,
        role_targeted,
        recruiter_name: recruiter_name ?? null,
        recruiter_role: recruiter_role ?? null,
        recruiter_email: recruiter_email ?? null,
        outreach_message: outreach_message ?? null,
        outreach_status: outreach_status ?? 'draft',
        source: source ?? 'hunter',
        confidence_score: confidence_score ?? null,
      }])
      .select('id')
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to save lead to database' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, id: data?.id ?? null })
  } catch (err) {
    console.error('Unexpected error in save-lead:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Check your Supabase configuration.' },
      { status: 500 }
    )
  }
}
