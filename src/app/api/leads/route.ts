import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import type { Lead } from '@/types'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('outreach_leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data as Lead[])
  } catch (err) {
    console.error('Unexpected error fetching leads:', err)
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  }
}
