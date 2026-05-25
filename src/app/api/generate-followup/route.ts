import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import type { FollowupStage } from '@/types'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

interface GenerateFollowupBody {
  yourName?: string
  background: string
  targetRole: string
  company: string
  recruiterName: string
  previousSubject?: string
  followupStage?: FollowupStage
}

function fallbackFollowup(body: GenerateFollowupBody): { subject: string; body: string } {
  const { yourName, targetRole, company, recruiterName, followupStage } = body
  const first = recruiterName.split(' ')[0] || 'there'
  const name = yourName || ''
  const isSecond = followupStage === 'second_followup'

  const subject = isSecond
    ? `One last note — ${targetRole} at ${company}`
    : `Following up — ${targetRole} at ${company}`

  const emailBody = `Hi ${first},

${isSecond ? "I know inboxes get busy — just one last note." : "Just following up on my previous message."}

Still very interested in ${targetRole} opportunities at ${company}. Would you be the right person to connect with, or is there someone better to reach?

Happy to keep it to a 10-minute call.

Best,
${name}`

  return { subject, body: emailBody }
}

export async function POST(request: NextRequest) {
  const body = await request.json() as GenerateFollowupBody
  const { yourName, background, targetRole, company, recruiterName, previousSubject, followupStage } = body

  if (!background || !targetRole || !recruiterName || !company) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const first = recruiterName.split(' ')[0] || recruiterName
  const name = yourName || 'the candidate'
  const isSecond = followupStage === 'second_followup'

  if (process.env.OPENAI_API_KEY) {
    try {
      const prompt = `Write a short follow-up email for a job seeker.

Context:
- Candidate: ${name}
- Background: ${background}
- Target role: ${targetRole}
- Target company: ${company}
- Recruiter: ${recruiterName}
- Previous email subject: ${previousSubject ?? '(not provided)'}
- Follow-up number: ${isSecond ? 'second (final)' : 'first'}

Rules:
- Open with exactly: Hi ${first},
- Keep it under 80 words
- Reference the previous outreach briefly
- ${isSecond ? 'Make it clear this is the last follow-up — no pressure' : 'Be casual and brief — just checking in'}
- One gentle ask: 10-min call or right person to talk to
- Sign off: Best,\\n${name}

Respond with JSON only, no markdown:
{"subject": "...", "body": "..."}`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 300,
      })
      const raw = completion.choices[0]?.message?.content?.trim() ?? ''
      const parsed = JSON.parse(raw) as { subject: string; body: string }
      if (parsed.subject && parsed.body) return NextResponse.json(parsed)
    } catch (err) {
      console.error('OpenAI followup error, using template:', err)
    }
  }

  return NextResponse.json(fallbackFollowup(body))
}
