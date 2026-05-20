// POST /api/generate-outreach
// Uses CANDIDATE CONTEXT (not segmentation) to personalize the draft.
// Accepts: { background, targetRole, achievements, company, recruiterName, recruiterRole }
// Returns: { subject, body }

function getFirstName(fullName) {
  return fullName ? fullName.split(" ")[0] : "there"
}

function buildSubjectLine(recruiterFirstName, role, company) {
  const subjects = [
    `Exploring ${role} opportunities at ${company}`,
    `${role} candidate — would love to connect`,
    `Interest in ${role} role at ${company}`,
    `Reaching out about ${role} at ${company}`,
  ]
  return subjects[recruiterFirstName.length % subjects.length]
}

function buildEmailBody({ background, targetRole, achievements, company, recruiterFirstName, recruiterRole }) {
  // Extract years of experience from background if present
  const yearsMatch = background.match(/(\d+\+?\s+years?(?:\s+of\s+experience)?)/i)
  const yearsPhrase = yearsMatch ? yearsMatch[1] : null

  // First sentence of background as the intro hook
  const sentences = background.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  const firstSentence = sentences[0] ? sentences[0].trim() : background.trim()
  const secondSentence = sentences[1] ? sentences[1].trim() : ""

  // Paragraph 1: intro
  const intro = `Hi ${recruiterFirstName},\n\nI came across ${company} while researching companies I'd genuinely love to work at, and I wanted to reach out directly. I noticed you're ${recruiterRole} there and thought you'd be the right person to connect with about ${targetRole} opportunities.`

  // Paragraph 2: candidate value prop — built from background + achievements
  let valueProp = `A bit about my background: ${firstSentence}`
  if (secondSentence) valueProp += `. ${secondSentence}`
  if (achievements && achievements.trim()) {
    valueProp += `.\n\nA few things I'm proud of: ${achievements.trim()}`
  } else if (yearsPhrase) {
    valueProp += `. With ${yearsPhrase} of hands-on experience, I'm confident I could contribute meaningfully to the team at ${company}.`
  } else {
    valueProp += `. I'm genuinely excited about the work ${company} is doing and believe my background aligns well with what you're building.`
  }

  // Paragraph 3: ask
  const ask = `I'd love to learn more about whether there's a fit for a ${targetRole} on your team. Even a 15-minute conversation would be incredibly helpful — I'm happy to work around your schedule.`

  const signoff = `Thank you for your time, and I hope to hear from you soon.\n\nBest,\n[Your Name]`

  return `${intro}\n\n${valueProp}\n\n${ask}\n\n${signoff}`
}

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." })
  }

  const { background, targetRole, achievements, company, recruiterName, recruiterRole } = req.body

  if (!background || !targetRole || !recruiterName) {
    return res.status(400).json({
      error: "Missing required fields: background, targetRole, recruiterName",
    })
  }

  const recruiterFirstName = getFirstName(recruiterName)
  const targetCompany = company || "the company"

  const subject = buildSubjectLine(recruiterFirstName, targetRole, targetCompany)
  const body = buildEmailBody({
    background,
    targetRole,
    achievements: achievements || "",
    company: targetCompany,
    recruiterFirstName,
    recruiterRole: recruiterRole || "recruiter",
  })

  setTimeout(() => res.status(200).json({ subject, body }), 500)
}
