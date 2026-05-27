import { Resend } from 'resend'

interface FollowupReminderParams {
  to: string
  companyName: string
  recruiterName: string
  role: string
  daysElapsed: number
  stage: string
  leadId: string
}

export async function sendFollowupReminder(params: FollowupReminderParams): Promise<void> {
  const { to, companyName, recruiterName, role, daysElapsed, stage, leadId } = params

  const isEscalation = stage === 'second_followup'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const subject = isEscalation
    ? `Still waiting on ${companyName} — going cold soon`
    : `Time to follow up with ${companyName}`

  const body = isEscalation
    ? `You reached out to ${recruiterName} at ${companyName} for a ${role} role ${daysElapsed} days ago. No reply yet — this one's going cold. Send a final follow-up now.`
    : `You reached out to ${recruiterName} at ${companyName} for a ${role} role ${daysElapsed} days ago. Now's a good time to follow up.`

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'JSP <reminders@yourdomain.com>',
      to,
      subject,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #0f0f0f; color: #e5e5e5;">
          <h2 style="color: #4ade80; font-size: 16px; margin: 0 0 16px;">JSP Follow-up Reminder</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #888; margin: 0 0 24px;">${body}</p>
          <a href="${appUrl}/pipeline?lead=${leadId}"
             style="display: inline-block; background: #4ade80; color: #0f0f0f; text-decoration: none;
                    padding: 10px 20px; border-radius: 6px; font-size: 13px; font-weight: 600;">
            View in Pipeline →
          </a>
        </div>
      `,
    })
  } catch (err) {
    // Email failures should never break the main flow
    console.error('Resend email error:', err)
  }
}
