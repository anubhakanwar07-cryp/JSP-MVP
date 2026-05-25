import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

interface GenerateOutreachBody {
  yourName?: string
  background: string
  targetRole: string
  achievements?: string
  industry?: string
  location?: string
  companyStage?: string
  remotePreference?: string
  company?: string
  recruiterName: string
  recruiterRole?: string
  recruiterLocation?: string
}

const STAGE_LABELS: Record<string, string> = {
  'seed-a': 'Seed / Series A startup',
  'b-c': 'Series B–C growth-stage company',
  'late': 'late-stage / pre-IPO company',
  'enterprise': 'large enterprise / public company',
  'any': 'company',
}

const REMOTE_LABELS: Record<string, string> = {
  'remote': 'remote',
  'hybrid': 'hybrid',
  'onsite': 'on-site',
  'any': '',
}

function buildPrompt(body: GenerateOutreachBody): string {
  const {
    yourName, background, targetRole, achievements, industry, location,
    companyStage, remotePreference, company, recruiterName,
    recruiterRole, recruiterLocation,
  } = body

  const stageLabel = STAGE_LABELS[companyStage ?? 'any'] ?? 'company'
  const remoteLabel = REMOTE_LABELS[remotePreference ?? 'any'] ?? ''
  const companyName = company || 'the company'
  const recruiterFirst = recruiterName.split(' ')[0] || recruiterName
  const senderName = yourName || 'the candidate'

  const contextLines = [
    `Candidate name: ${senderName}`,
    `Candidate background: ${background}`,
    achievements ? `Key achievements: ${achievements}` : null,
    `Target role: ${targetRole}`,
    industry ? `Industry focus: ${industry}` : null,
    location ? `Candidate location: ${location}` : null,
    remoteLabel ? `Work preference: ${remoteLabel}` : null,
    `Target company: ${companyName} (${stageLabel}${industry ? ` in ${industry}` : ''})`,
    `Recruiter: ${recruiterName}${recruiterRole ? `, ${recruiterRole}` : ''}`,
    recruiterLocation ? `Recruiter location: ${recruiterLocation}` : null,
  ].filter(Boolean).join('\n')

  return `You are writing a cold outreach email from a job seeker to a recruiter. Write a short, genuine, non-salesy email.

Context:
${contextLines}

Rules:
- Open the email with exactly: Hi ${recruiterFirst},
- Keep it under 150 words total
- Sound like a real person, not a template
- Reference the company type (${stageLabel}) naturally if it fits — e.g. growth stage, scale, mission
- If industry is provided, tie the candidate's background to it specifically
- If achievements are provided, pick ONE strong data point and use it — don't list all of them
- Structure: (1) one-line hook — who you are + strongest signal, (2) one sentence on why this company specifically, (3) one low-pressure ask (15-min call / happy to share more)
- Sign off with: Best,\\n${senderName}
- Do NOT use phrases like "I hope this email finds you well", "I wanted to reach out", "I am writing to"
- Do NOT use bullet points in the body
- Subject line: 6–9 words, role and company specific, lead with the candidate's strongest signal (e.g. "Ex-Razorpay engineer — open to SDE2 at Stripe", "30% latency win → interested in infra at Linear"). The recruiter must be able to decide whether to open it based on the subject alone.

Respond with JSON only, no markdown:
{"subject": "...", "body": "..."}`
}

function fallbackTemplate(body: GenerateOutreachBody): { subject: string; body: string } {
  const { yourName, background, targetRole, achievements, company, recruiterName } = body
  const first = recruiterName.split(' ')[0] || 'there'
  const co = company || 'the company'
  const senderName = yourName || 'A candidate'
  const sentences = background.split(/[.!?]+/).filter((s) => s.trim())
  const intro = sentences[0]?.trim() ?? background.trim()
  const extra = sentences[1]?.trim() ?? ''

  const subjects = [
    `${senderName} — ${targetRole} candidate interested in ${co}`,
    `Quick intro: ${targetRole} background, open to ${co}`,
    `${senderName} → ${targetRole} at ${co}?`,
  ]
  const subject = subjects[first.length % subjects.length]

  const body2 = `Hi ${first},\n\n${intro}${extra ? `. ${extra}` : ''}${achievements ? ` — ${achievements.split(/[.]+/)[0].trim()}.` : ''}\n\nI've been following ${co} and think there's a strong fit for a ${targetRole} role — would love to hear if there's anything open or coming up.\n\nHappy to share more or jump on a 15-min call.\n\nBest,\n${senderName}`
  return { subject, body: body2 }
}

export async function POST(request: NextRequest) {
  const body = await request.json() as GenerateOutreachBody
  const { background, targetRole, recruiterName } = body

  if (!background || !targetRole || !recruiterName) {
    return NextResponse.json(
      { error: 'Missing required fields: background, targetRole, recruiterName' },
      { status: 400 }
    )
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: buildPrompt(body) }],
        temperature: 0.8,
        max_tokens: 500,
      })

      const raw = completion.choices[0]?.message?.content?.trim() ?? ''
      const parsed = JSON.parse(raw) as { subject: string; body: string }
      if (parsed.subject && parsed.body) {
        return NextResponse.json(parsed)
      }
    } catch (err) {
      console.error('OpenAI error, falling back to template:', err)
    }
  }

  return NextResponse.json(fallbackTemplate(body))
}
