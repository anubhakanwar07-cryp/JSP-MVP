'use client'

import { useState } from 'react'
import type { CandidateForm, CompanyStage, RemotePreference } from '@/types'

const STAGE_OPTIONS: { value: CompanyStage; label: string }[] = [
  { value: 'any',        label: 'Any Stage' },
  { value: 'seed-a',     label: 'Seed / Series A' },
  { value: 'b-c',        label: 'Series B – C' },
  { value: 'late',       label: 'Late Stage / Pre-IPO' },
  { value: 'enterprise', label: 'Enterprise / Public' },
]

const REMOTE_OPTIONS: { value: RemotePreference; label: string }[] = [
  { value: 'any',    label: 'Any' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
]

interface InputFormProps {
  onSubmit: (data: CandidateForm) => void
  loading: boolean
}

const inputCls = 'w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-md px-3.5 py-2.5 text-sm text-[#e5e5e5] placeholder:text-[#444] focus:border-green-400 focus:outline-none transition-colors disabled:opacity-50 font-[inherit]'
const labelCls = 'block text-[13px] font-medium text-[#888] mb-1.5 tracking-[0.02em]'

function Required() {
  return <span className="text-green-400 ml-0.5 text-xs">*</span>
}

function Optional() {
  return <span className="ml-2 text-[11px] text-[#555] font-normal tracking-normal lowercase">optional</span>
}

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#888] text-xs">▾</span>
    </div>
  )
}

export default function InputForm({ onSubmit, loading }: InputFormProps) {
  const [background, setBackground]           = useState('')
  const [targetRole, setTargetRole]           = useState('')
  const [achievements, setAchievements]       = useState('')
  const [industry, setIndustry]               = useState('')
  const [location, setLocation]               = useState('India')
  const [companyStage, setCompanyStage]       = useState<CompanyStage>('any')
  const [remotePreference, setRemotePreference] = useState<RemotePreference>('any')
  const [preferredCompanies, setPreferredCompanies] = useState('')

  const isReady = background.trim() && targetRole.trim()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isReady) return
    onSubmit({
      background: background.trim(),
      targetRole: targetRole.trim(),
      achievements: achievements.trim(),
      industry: industry.trim(),
      location: location.trim(),
      companyStage,
      remotePreference,
      preferredCompanies: preferredCompanies.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit}>

      {/* Section 1: Candidate Context */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 mb-3">
        <div className="text-[11px] font-semibold tracking-[0.1em] uppercase pb-2.5 border-b border-[#2a2a2a] mb-4 text-green-400">
          About You
          <span className="ml-2.5 text-[11px] font-normal text-[#555] normal-case tracking-normal">
            — used to personalize your outreach drafts
          </span>
        </div>

        <div className="mb-4">
          <label htmlFor="background" className={labelCls}>
            Background &amp; Expertise <Required />
          </label>
          <textarea
            id="background"
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            placeholder="e.g. 6 years in backend engineering (Go, Postgres). Led infra team at a Series B fintech. Built systems handling 10M+ events/day."
            required
            disabled={loading}
            rows={4}
            className={`${inputCls} resize-y min-h-[96px] leading-relaxed`}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="targetRole" className={labelCls}>
            Target Role <Required />
          </label>
          <input
            id="targetRole"
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Staff Engineer, Senior PM, Engineering Manager"
            required
            disabled={loading}
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="achievements" className={labelCls}>
            Key Achievements <Optional />
          </label>
          <textarea
            id="achievements"
            value={achievements}
            onChange={(e) => setAchievements(e.target.value)}
            placeholder="e.g. Reduced p99 latency by 60%. Grew activation rate from 30% to 55%. Led team of 6 engineers."
            disabled={loading}
            rows={3}
            className={`${inputCls} resize-y min-h-[76px] leading-relaxed`}
          />
          <p className="text-[11px] text-[#555] mt-1.5">Quantified wins get referenced directly in your outreach draft.</p>
        </div>
      </div>

      {/* Section 2: Target Segmentation */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 mb-4">
        <div className="text-[11px] font-semibold tracking-[0.1em] uppercase pb-2.5 border-b border-[#2a2a2a] mb-4 text-blue-400">
          Who to Target
          <span className="ml-2.5 text-[11px] font-normal text-[#555] normal-case tracking-normal">
            — used to discover and filter recruiter leads
          </span>
        </div>

        <div className="mb-4">
          <label htmlFor="industry" className={labelCls}>
            Industry / Sector <Optional />
          </label>
          <input
            id="industry"
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g. fintech, B2B SaaS, developer tools, AI/ML, e-commerce"
            disabled={loading}
            className={inputCls}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="location" className={labelCls}>
            Location / Geography <Optional />
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Bangalore, Mumbai, Delhi NCR, Remote India"
            disabled={loading}
            className={inputCls}
          />
          <p className="text-[11px] text-[#555] mt-1.5">Defaults to India. Clear to search globally.</p>
        </div>

        <div className="grid grid-cols-2 gap-3.5 mb-4">
          <div>
            <label htmlFor="companyStage" className={labelCls}>Company Stage</label>
            <SelectWrapper>
              <select
                id="companyStage"
                value={companyStage}
                onChange={(e) => setCompanyStage(e.target.value as CompanyStage)}
                disabled={loading}
                className={`${inputCls} appearance-none cursor-pointer pr-8`}
              >
                {STAGE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-[#1a1a1a]">{o.label}</option>
                ))}
              </select>
            </SelectWrapper>
          </div>

          <div>
            <label htmlFor="remotePreference" className={labelCls}>Work Preference</label>
            <SelectWrapper>
              <select
                id="remotePreference"
                value={remotePreference}
                onChange={(e) => setRemotePreference(e.target.value as RemotePreference)}
                disabled={loading}
                className={`${inputCls} appearance-none cursor-pointer pr-8`}
              >
                {REMOTE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-[#1a1a1a]">{o.label}</option>
                ))}
              </select>
            </SelectWrapper>
          </div>
        </div>

        <div>
          <label htmlFor="preferredCompanies" className={labelCls}>
            Preferred Companies <Optional />
          </label>
          <input
            id="preferredCompanies"
            type="text"
            value={preferredCompanies}
            onChange={(e) => setPreferredCompanies(e.target.value)}
            placeholder="e.g. Stripe, Linear, Vercel — or leave blank to discover from filters above"
            disabled={loading}
            className={inputCls}
          />
          <p className="text-[11px] text-[#555] mt-1.5">Leave blank to discover recruiter leads based on industry and stage filters.</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !isReady}
        className="w-full py-3 px-5 rounded-md text-sm font-semibold transition-colors font-[inherit] border-0 bg-green-400 text-[#0f0f0f] hover:bg-green-500 cursor-pointer disabled:bg-[#1f2e22] disabled:text-[#555] disabled:cursor-not-allowed"
      >
        {loading ? 'Discovering Leads...' : 'Discover Recruiter Leads →'}
      </button>
    </form>
  )
}
