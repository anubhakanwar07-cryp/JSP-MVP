'use client'

import { useState } from 'react'
import type { Recruiter, RecruiterSource, EmailStatus } from '@/types'

// ─── Badges ───────────────────────────────────────────────────────────────────

function ConfidenceBadge({ score }: { score: number }) {
  const cfg =
    score >= 80
      ? { cls: 'bg-green-900 text-green-400 border border-green-800', label: 'High' }
      : score >= 65
      ? { cls: 'bg-[#422006] text-orange-400 border border-orange-900', label: 'Med' }
      : { cls: 'bg-[#450a0a] text-red-400 border border-[#7f1d1d]', label: 'Low' }
  return (
    <span className={`${cfg.cls} rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap`}>
      {score}% · {cfg.label}
    </span>
  )
}

const SOURCE_STYLES: Record<RecruiterSource, string> = {
  hunter:           'bg-blue-950 text-blue-400 border-blue-900',
  linkedin_scraper: 'bg-[#0f1f35] text-blue-300 border-[#1e3a5f]',
  fallback:         'bg-[#2a1f00] text-yellow-600 border-[#3d2d00]',
  manual:           'bg-green-950 text-green-400 border-green-900',
}
const SOURCE_LABELS: Record<RecruiterSource, string> = {
  hunter:           'Hunter',
  linkedin_scraper: 'LinkedIn',
  fallback:         'Demo',
  manual:           'Manual',
}

function SourceBadge({ source }: { source: RecruiterSource }) {
  return (
    <span className={`${SOURCE_STYLES[source]} rounded px-1.5 py-0.5 text-[10px] font-semibold border whitespace-nowrap`}>
      {SOURCE_LABELS[source]}
    </span>
  )
}

const EMAIL_STATUS_STYLES: Record<EmailStatus, string> = {
  verified: 'bg-green-900 text-green-400 border-green-800',
  probable: 'bg-[#422006] text-orange-400 border-orange-900',
  unknown:  'bg-[#1a1a1a] text-[#666] border-[#2a2a2a]',
  fallback: 'bg-[#2a1f00] text-yellow-600 border-[#3d2d00]',
}
const EMAIL_STATUS_LABELS: Record<EmailStatus, string> = {
  verified: '✓ Verified',
  probable: 'Probable',
  unknown:  'Unverified',
  fallback: 'Demo data',
}

function EmailStatusBadge({ status }: { status: EmailStatus }) {
  return (
    <span className={`${EMAIL_STATUS_STYLES[status]} rounded px-1.5 py-0.5 text-[10px] font-semibold border whitespace-nowrap`}>
      {EMAIL_STATUS_LABELS[status]}
    </span>
  )
}

// ─── Utility buttons ──────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  async function copy(e: React.MouseEvent) {
    e.stopPropagation()
    try { await navigator.clipboard.writeText(text) } catch { /* omit fallback */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className={`bg-transparent border-none text-[11px] cursor-pointer px-1 py-0.5 font-[inherit] transition-colors ${copied ? 'text-green-400' : 'text-[#555] hover:text-[#888]'}`}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function ExternalLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="text-[11px] text-blue-400 no-underline px-2 py-0.5 rounded border border-[#1e3a5f] bg-[#0f1f35] whitespace-nowrap transition-colors hover:bg-[#162d4a]"
    >
      {label}
    </a>
  )
}

// ─── Recruiter row ────────────────────────────────────────────────────────────

function RecruiterRow({
  recruiter,
  selected,
  onToggle,
}: {
  recruiter: Recruiter
  selected: boolean
  onToggle: (r: Recruiter) => void
}) {
  const isFallback = recruiter.source === 'fallback'

  return (
    <div
      onClick={() => onToggle(recruiter)}
      className={`rounded-lg px-4 py-4 cursor-pointer transition-all select-none border ${
        selected
          ? 'bg-[#0f1f18] border-green-800'
          : isFallback
          ? 'bg-[#1a1a1a] border-[#2a2a1a] hover:border-[#3a3a2a] opacity-80'
          : 'bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#3a3a3a]'
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div className={`mt-0.5 w-[18px] h-[18px] rounded shrink-0 flex items-center justify-center transition-all border-2 ${
          selected ? 'bg-green-400 border-green-400' : 'bg-transparent border-[#3a3a3a]'
        }`}>
          {selected && <span className="text-[11px] text-[#0f0f0f] font-bold">✓</span>}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[15px] font-semibold text-[#e5e5e5]">{recruiter.name}</span>
            <SourceBadge source={recruiter.source} />
            <ConfidenceBadge score={recruiter.confidence} />
          </div>

          <div className="text-[13px] text-[#888] mb-2">
            {recruiter.role}
            <span className="text-[#444] mx-1.5">·</span>
            <span className="text-blue-400">{recruiter.company}</span>
            {recruiter.location && (
              <span className="text-[#444] text-xs ml-2">📍 {recruiter.location}</span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs text-[#aaa] font-mono bg-[#0f0f0f] px-2 py-0.5 rounded border border-[#2a2a2a]">
              {recruiter.email}
            </span>
            <EmailStatusBadge status={recruiter.emailStatus} />
            <CopyButton text={recruiter.email} />
          </div>

          <div className="flex gap-2 flex-wrap">
            {(recruiter.linkedin || recruiter.profileUrl) && (
              <ExternalLink href={(recruiter.linkedin ?? recruiter.profileUrl)!} label="↗ LinkedIn" />
            )}
            {recruiter.website && <ExternalLink href={recruiter.website} label="↗ Website" />}
          </div>

          {isFallback && (
            <p className="text-[10px] text-yellow-700 mt-2">
              Demo data — no Hunter API key configured. Emails are illustrative only.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Manual entry form ────────────────────────────────────────────────────────

function ManualEntryForm({ onAdd, onClose }: { onAdd: (r: Recruiter) => void; onClose: () => void }) {
  const [name,    setName]    = useState('')
  const [role,    setRole]    = useState('')
  const [company, setCompany] = useState('')
  const [email,   setEmail]   = useState('')
  const [linkedin, setLinkedin] = useState('')

  const inputCls = 'w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-md px-3 py-2 text-sm text-[#e5e5e5] placeholder:text-[#444] focus:border-green-400 focus:outline-none font-[inherit]'

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !company.trim()) return
    onAdd({
      name:        name.trim(),
      role:        role.trim() || 'Recruiter',
      email:       email.trim(),
      company:     company.trim(),
      location:    '',
      source:      'manual',
      confidence:  60,
      emailVerified: false,
      emailStatus: 'unknown',
      linkedin:    linkedin.trim() || null,
      profileUrl:  linkedin.trim() || null,
      website:     null,
      domain:      null,
    })
    onClose()
  }

  return (
    <form onSubmit={handleAdd} className="bg-[#1a1a1a] border border-green-900 rounded-lg p-4 mb-2">
      <div className="text-[11px] font-semibold text-green-400 tracking-[0.08em] uppercase mb-3">Add Recruiter Manually</div>
      <div className="grid grid-cols-2 gap-2.5 mb-2.5">
        <div>
          <label className="block text-[11px] text-[#666] mb-1">Name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Priya Sharma" required className={inputCls} />
        </div>
        <div>
          <label className="block text-[11px] text-[#666] mb-1">Title</label>
          <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Technical Recruiter" className={inputCls} />
        </div>
        <div>
          <label className="block text-[11px] text-[#666] mb-1">Company *</label>
          <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Razorpay" required className={inputCls} />
        </div>
        <div>
          <label className="block text-[11px] text-[#666] mb-1">Email *</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="p.sharma@company.com" required className={inputCls} />
        </div>
      </div>
      <div className="mb-3">
        <label className="block text-[11px] text-[#666] mb-1">LinkedIn URL</label>
        <input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." className={inputCls} />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="px-3 py-1.5 text-xs font-semibold bg-green-400 text-[#0f0f0f] rounded cursor-pointer border-0 font-[inherit] hover:bg-green-500">
          Add Recruiter
        </button>
        <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs text-[#666] bg-transparent border border-[#2a2a2a] rounded cursor-pointer font-[inherit] hover:text-[#aaa]">
          Cancel
        </button>
      </div>
    </form>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface RecruiterListProps {
  recruiters: Recruiter[]
  onGenerateForSelected: (selected: Recruiter[]) => void
  generating: boolean
  onAddManual: (recruiter: Recruiter) => void
  onBack: () => void
}

export default function RecruiterList({ recruiters, onGenerateForSelected, generating, onAddManual, onBack }: RecruiterListProps) {
  const [selected,        setSelected]        = useState<Recruiter[]>([])
  const [showManualForm,  setShowManualForm]   = useState(false)

  function toggleRecruiter(recruiter: Recruiter) {
    setSelected((prev) => {
      const exists = prev.find((r) => r.email === recruiter.email)
      return exists ? prev.filter((r) => r.email !== recruiter.email) : [...prev, recruiter]
    })
  }

  function selectAll() {
    setSelected(selected.length === recruiters.length ? [] : [...recruiters])
  }

  function handleAddManual(recruiter: Recruiter) {
    onAddManual(recruiter)
    setShowManualForm(false)
  }

  const selectedCount  = selected.length
  const hunterCount    = recruiters.filter((r) => r.source === 'hunter').length
  const fallbackCount  = recruiters.filter((r) => r.source === 'fallback').length

  if (recruiters.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#888] text-sm mb-1">No recruiter leads found for these filters.</p>
        <p className="text-[#555] text-xs mb-4">Try broadening your industry, location, or company stage.</p>
        <button
          onClick={onBack}
          className="text-xs text-[#888] bg-transparent border border-[#2a2a2a] rounded-md px-3 py-1.5 cursor-pointer font-[inherit] hover:text-[#e5e5e5] transition-colors"
        >
          ← Adjust filters
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-base font-semibold text-[#e5e5e5] mb-0.5">Recruiter Leads</h2>
          <p className="text-[13px] text-[#888]">
            {recruiters.length} lead{recruiters.length !== 1 ? 's' : ''} found
            {hunterCount > 0 && <span className="text-blue-400 ml-2">· {hunterCount} from Hunter</span>}
            {fallbackCount > 0 && <span className="text-yellow-700 ml-2">· {fallbackCount} demo</span>}
          </p>
        </div>
        <button
          onClick={selectAll}
          className="text-xs text-[#888] bg-transparent border-none cursor-pointer font-[inherit] p-0 hover:text-[#e5e5e5] transition-colors"
        >
          {selected.length === recruiters.length ? 'Deselect all' : 'Select all'}
        </button>
      </div>

      {showManualForm && (
        <ManualEntryForm onAdd={handleAddManual} onClose={() => setShowManualForm(false)} />
      )}

      <div className="flex flex-col gap-2 mb-3">
        {recruiters.map((r) => (
          <RecruiterRow
            key={r.email}
            recruiter={r}
            selected={!!selected.find((s) => s.email === r.email)}
            onToggle={toggleRecruiter}
          />
        ))}
      </div>

      {!showManualForm && (
        <button
          onClick={() => setShowManualForm(true)}
          className="w-full py-2 text-xs text-[#555] bg-transparent border border-dashed border-[#2a2a2a] rounded-md cursor-pointer font-[inherit] hover:text-[#888] hover:border-[#3a3a3a] transition-colors mb-4"
        >
          + Add Recruiter Manually
        </button>
      )}

      <p className="text-[10px] text-[#444] mb-4">
        · Contacts sourced via Hunter.io · Unverified contacts are pattern-matched and should be confirmed before sending
      </p>

      <button
        onClick={() => onGenerateForSelected(selected)}
        disabled={selectedCount === 0 || generating}
        className="w-full py-3 px-5 rounded-md text-sm font-semibold border-0 transition-colors font-[inherit] cursor-pointer bg-green-400 text-[#0f0f0f] hover:bg-green-500 disabled:bg-[#1f2e22] disabled:text-[#555] disabled:cursor-not-allowed"
      >
        {generating
          ? 'Generating drafts...'
          : selectedCount === 0
          ? 'Select recruiters to generate outreach'
          : `Generate Outreach for ${selectedCount} Recruiter${selectedCount > 1 ? 's' : ''} →`}
      </button>
    </div>
  )
}
