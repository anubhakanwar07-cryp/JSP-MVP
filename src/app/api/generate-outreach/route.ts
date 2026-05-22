import { NextRequest, NextResponse } from 'next/server'

interface GenerateOutreachBody {
  background: string
  targetRole: string
  achievements?: string
  company?: string
  recruiterName: string
  recruiterRole?: string
}

function getFirstName(fullName: string): string {
  return fullName ? fullName.split(' ')[0] : 'there'
}

function buildSubjectLine(recruiterFirstName: string, role: string, company: string): string {
  const subjects = [
    `Exploring ${role} opportunities at ${company}`,
    `${role} candidate — would love to connect`,
    `Interest in ${role} role at ${company}`,
    `Reaching out about ${role} at ${company}`,
  ]
  return subjects[recruiterFirstName.length % subjects.length]
}

function buildEmailBody({
  background,
  targetRole,
  achievements,
  company,
  recruiterFirstName,
  recruiterRole,
}: {
  background: string
  targetRole: string
  achievements: string
  company: string
  recruiterFirstName: string
  recruiterRole: string
}): string {
  const yearsMatch = background.match(/(\d+\+?\s+years?(?:\s+of\s+experience)?)/i)
  const yearsPhrase = yearsMatch ? yearsMatch[1] : null

  const sentences = background.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  const firstSentence = sentences[0]?.trim() ?? background.trim()
  const secondSentence = sentences[1]?.trim() ?? ''

  const intro = `Hi ${recruiterFirstName},\n\nI came across ${company} while researching companies I'd genuinely love to work at, and I wanted to reach out directly. I noticed you're ${recruiterRole} there and thought you'd be the right person to connect with about ${targetRole} opportunities.`

  let valueProp = `A bit about my background: ${firstSentence}`
  if (secondSentence) valueProp += `. ${secondSentence}`
  if (achievements?.trim()) {
    valueProp += `.\n\nA few things I'm proud of: ${achievements.trim()}`
  } else if (yearsPhrase) {
    valueProp += `. With ${yearsPhrase} of hands-on experience, I'm confident I could contribute meaningfully to the team at ${company}.`
  } else {
    valueProp += `. I'm genuinely excited about the work ${company} is doing and believe my background aligns well with what you're building.`
  }

  const ask = `I'd love to learn more about whether there's a fit for a ${targetRole} on your team. Even a 15-minute conversation would be incredibly helpful — I'm happy to work around your schedule.`
  const signoff = `Thank you for your time, and I hope to hear from you soon.\n\nBest,\n[Your Name]`

  return `${intro}\n\n${valueProp}\n\n${ask}\n\n${signoff}`
}

export async function POST(request: NextRequest) {
  const body = await request.json() as GenerateOutreachBody
  const { background, targetRole, achievements, company, recruiterName, recruiterRole } = body

  if (!background || !targetRole || !recruiterName) {
    return NextResponse.json(
      { error: 'Missing required fields: background, targetRole, recruiterName' },
      { status: 400 }
    )
  }

  const recruiterFirstName = getFirstName(recruiterName)
  const targetCompany = company || 'the company'

  const subject = buildSubjectLine(recruiterFirstName, targetRole, targetCompany)
  const emailBody = buildEmailBody({
    background,
    targetRole,
    achievements: achievements ?? '',
    company: targetCompany,
    recruiterFirstName,
    recruiterRole: recruiterRole ?? 'recruiter',
  })

  return NextResponse.json({ subject, body: emailBody })
}
