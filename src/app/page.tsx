'use client'

import { useState } from 'react'
import InputForm from '@/components/InputForm'
import RecruiterList from '@/components/RecruiterList'
import OutreachQueue from '@/components/OutreachQueue'
import type { CandidateForm, Recruiter, QueueItem, OutreachStatus, OutreachDraft } from '@/types'

const STEP_LABELS: Record<number, string> = {
  1: 'Your Context',
  2: 'Recruiter Leads',
  3: 'Outreach Queue',
}

export default function HomePage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<CandidateForm>({
    background: '', targetRole: '', achievements: '',
    industry: '', location: 'India', companyStage: 'any',
    remotePreference: 'any', preferredCompanies: '',
  })
  const [recruiters, setRecruiters] = useState<Recruiter[]>([])
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [loadingRecruiters, setLoadingRecruiters] = useState(false)
  const [generatingOutreach, setGeneratingOutreach] = useState(false)
  const [error, setError] = useState('')

  async function handleFormSubmit(data: CandidateForm) {
    setError('')
    setLoadingRecruiters(true)
    setFormData(data)

    try {
      const res = await fetch('/api/find-recruiter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: data.targetRole,
          industry: data.industry,
          location: data.location,
          companyStage: data.companyStage,
          remotePreference: data.remotePreference,
          preferredCompanies: data.preferredCompanies,
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to find recruiters')
      setRecruiters(result)
      setStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoadingRecruiters(false)
    }
  }

  async function handleGenerateForSelected(selectedRecruiters: Recruiter[]) {
    setError('')
    setGeneratingOutreach(true)

    try {
      const drafts = await Promise.all(
        selectedRecruiters.map(async (recruiter): Promise<QueueItem> => {
          const res = await fetch('/api/generate-outreach', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              background: formData.background,
              targetRole: formData.targetRole,
              achievements: formData.achievements,
              company: recruiter.company,
              recruiterName: recruiter.name,
              recruiterRole: recruiter.role,
            }),
          })
          const outreach = await res.json() as OutreachDraft
          if (!res.ok) throw new Error((outreach as { error?: string }).error || `Failed for ${recruiter.name}`)
          return { recruiter, outreach, saving: false, saved: false }
        })
      )
      setQueue(drafts)
      setStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate some outreach drafts.')
    } finally {
      setGeneratingOutreach(false)
    }
  }

  async function handleSaveLead(recruiterEmail: string, status: OutreachStatus) {
    const item = queue.find((i) => i.recruiter.email === recruiterEmail)
    if (!item) return

    setQueue((prev) =>
      prev.map((i) => i.recruiter.email === recruiterEmail ? { ...i, saving: true } : i)
    )

    try {
      const res = await fetch('/api/save-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: item.recruiter.company,
          role_targeted: formData.targetRole,
          recruiter_name: item.recruiter.name,
          recruiter_role: item.recruiter.role,
          recruiter_email: item.recruiter.email,
          outreach_message: `Subject: ${item.outreach.subject}\n\n${item.outreach.body}`,
          outreach_status: status,
          source: 'hunter',
          confidence_score: item.recruiter.confidence,
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to save')

      setQueue((prev) =>
        prev.map((i) => i.recruiter.email === recruiterEmail ? { ...i, saving: false, saved: true } : i)
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save lead.')
      setQueue((prev) =>
        prev.map((i) => i.recruiter.email === recruiterEmail ? { ...i, saving: false } : i)
      )
    }
  }

  function handleBack() {
    setError('')
    if (step === 2) { setStep(1); setRecruiters([]) }
    else if (step === 3) { setStep(2); setQueue([]) }
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] px-4 py-8">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold text-green-400 tracking-tight">JSP</h1>
          <span className="text-[#888] text-sm">Recruiter Lead Discovery</span>
        </div>
        <p className="text-xs text-[#444] mt-1.5">
          Surface recruiter contacts around your expertise · no job posting required
        </p>
      </div>

      {/* Step indicator */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all border ${
                step === s
                  ? 'bg-green-400 text-[#0f0f0f] border-green-400'
                  : step > s
                  ? 'bg-green-900 text-green-400 border-green-800'
                  : 'bg-[#2a2a2a] text-[#888] border-[#2a2a2a]'
              }`}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && (
                <div className={`w-10 h-px mx-1 ${step > s ? 'bg-green-800' : 'bg-[#2a2a2a]'}`} />
              )}
            </div>
          ))}
          <div className="ml-3 text-xs text-[#888]">{STEP_LABELS[step]}</div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto">
        {error && (
          <div className="bg-[#1a1a1a] border border-red-400 rounded-lg px-4 py-3 mb-6 text-red-400 text-sm">
            {error}
          </div>
        )}

        {step > 1 && (
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-[#888] text-[13px] bg-transparent border-none cursor-pointer p-0 mb-5 hover:text-[#e5e5e5] transition-colors font-[inherit]"
          >
            <span className="text-base">←</span> Back
          </button>
        )}

        {step === 1 && <InputForm onSubmit={handleFormSubmit} loading={loadingRecruiters} />}

        {step === 2 && (
          <RecruiterList
            recruiters={recruiters}
            onGenerateForSelected={handleGenerateForSelected}
            generating={generatingOutreach}
          />
        )}

        {step === 3 && <OutreachQueue queue={queue} onSave={handleSaveLead} />}
      </div>
    </main>
  )
}
