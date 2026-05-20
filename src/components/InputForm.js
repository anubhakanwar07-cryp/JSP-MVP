"use client"

import { useState } from "react"

const STAGE_OPTIONS = [
  { value: "any",        label: "Any Stage" },
  { value: "seed-a",     label: "Seed / Series A" },
  { value: "b-c",        label: "Series B – C" },
  { value: "late",       label: "Late Stage / Pre-IPO" },
  { value: "enterprise", label: "Enterprise / Public" },
]

const REMOTE_OPTIONS = [
  { value: "any",     label: "Any" },
  { value: "remote",  label: "Remote" },
  { value: "hybrid",  label: "Hybrid" },
  { value: "onsite",  label: "On-site" },
]

export default function InputForm({ onSubmit, loading }) {
  // ── Candidate Context ──────────────────────────────────────────────────────
  const [background, setBackground]   = useState("")
  const [targetRole, setTargetRole]   = useState("")
  const [achievements, setAchievements] = useState("")

  // ── Target Segmentation ────────────────────────────────────────────────────
  const [industry, setIndustry]               = useState("")
  const [location, setLocation]               = useState("India")
  const [companyStage, setCompanyStage]       = useState("any")
  const [remotePreference, setRemotePreference] = useState("any")
  const [preferredCompanies, setPreferredCompanies] = useState("")

  const isReady = background.trim() && targetRole.trim()

  function handleSubmit(e) {
    e.preventDefault()
    if (!isReady) return
    onSubmit({
      // Candidate Context
      background: background.trim(),
      targetRole: targetRole.trim(),
      achievements: achievements.trim(),
      // Target Segmentation
      industry: industry.trim(),
      location: location.trim(),
      companyStage,
      remotePreference,
      preferredCompanies: preferredCompanies.trim(),
    })
  }

  const inputStyle = {
    width: "100%",
    backgroundColor: "#0f0f0f",
    border: "1px solid #2a2a2a",
    borderRadius: "6px",
    padding: "10px 14px",
    color: "#e5e5e5",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.15s",
    fontFamily: "inherit",
  }

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: "500",
    color: "#888",
    marginBottom: "6px",
    letterSpacing: "0.02em",
  }

  const focusGreen = (e) => (e.target.style.borderColor = "#4ade80")
  const blurGray   = (e) => (e.target.style.borderColor = "#2a2a2a")

  const sectionHeaderStyle = {
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: "16px",
    paddingBottom: "10px",
    borderBottom: "1px solid #2a2a2a",
  }

  return (
    <form onSubmit={handleSubmit}>

      {/* ── Section 1: Candidate Context ─────────────────────────────────── */}
      <div
        style={{
          backgroundColor: "#1a1a1a",
          border: "1px solid #2a2a2a",
          borderRadius: "10px",
          padding: "24px 28px",
          marginBottom: "12px",
        }}
      >
        <div style={{ ...sectionHeaderStyle, color: "#4ade80" }}>
          About You
          <span style={{ marginLeft: "10px", fontSize: "11px", fontWeight: "400", color: "#555", textTransform: "none", letterSpacing: 0 }}>
            — used to personalize your outreach drafts
          </span>
        </div>

        {/* Background & Expertise */}
        <div style={{ marginBottom: "18px" }}>
          <label htmlFor="background" style={labelStyle}>
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
            style={{ ...inputStyle, resize: "vertical", minHeight: "96px", lineHeight: "1.6" }}
            onFocus={focusGreen}
            onBlur={blurGray}
          />
        </div>

        {/* Target Role */}
        <div style={{ marginBottom: "18px" }}>
          <label htmlFor="targetRole" style={labelStyle}>
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
            style={inputStyle}
            onFocus={focusGreen}
            onBlur={blurGray}
          />
        </div>

        {/* Key Achievements */}
        <div>
          <label htmlFor="achievements" style={labelStyle}>
            Key Achievements
            <Optional />
          </label>
          <textarea
            id="achievements"
            value={achievements}
            onChange={(e) => setAchievements(e.target.value)}
            placeholder="e.g. Reduced p99 latency by 60%. Grew activation rate from 30% to 55%. Led team of 6 engineers."
            disabled={loading}
            rows={3}
            style={{ ...inputStyle, resize: "vertical", minHeight: "76px", lineHeight: "1.6" }}
            onFocus={focusGreen}
            onBlur={blurGray}
          />
          <p style={{ fontSize: "11px", color: "#555", marginTop: "5px" }}>
            Quantified wins get referenced directly in your outreach draft.
          </p>
        </div>
      </div>

      {/* ── Section 2: Target Segmentation ───────────────────────────────── */}
      <div
        style={{
          backgroundColor: "#1a1a1a",
          border: "1px solid #2a2a2a",
          borderRadius: "10px",
          padding: "24px 28px",
          marginBottom: "16px",
        }}
      >
        <div style={{ ...sectionHeaderStyle, color: "#60a5fa" }}>
          Who to Target
          <span style={{ marginLeft: "10px", fontSize: "11px", fontWeight: "400", color: "#555", textTransform: "none", letterSpacing: 0 }}>
            — used to discover and filter recruiter leads
          </span>
        </div>

        {/* Industry / Sector */}
        <div style={{ marginBottom: "18px" }}>
          <label htmlFor="industry" style={labelStyle}>
            Industry / Sector <Optional />
          </label>
          <input
            id="industry"
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g. fintech, B2B SaaS, developer tools, AI/ML, e-commerce"
            disabled={loading}
            style={inputStyle}
            onFocus={focusGreen}
            onBlur={blurGray}
          />
        </div>

        {/* Location */}
        <div style={{ marginBottom: "18px" }}>
          <label htmlFor="location" style={labelStyle}>
            Location / Geography <Optional />
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Bangalore, Mumbai, Delhi NCR, Remote India"
            disabled={loading}
            style={inputStyle}
            onFocus={focusGreen}
            onBlur={blurGray}
          />
          <p style={{ fontSize: "11px", color: "#555", marginTop: "5px" }}>
            Defaults to India. Clear to search globally.
          </p>
        </div>

        {/* Company Stage + Remote — side by side */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "18px" }}>
          <div>
            <label htmlFor="companyStage" style={labelStyle}>Company Stage</label>
            <select
              id="companyStage"
              value={companyStage}
              onChange={(e) => setCompanyStage(e.target.value)}
              disabled={loading}
              style={{
                ...inputStyle,
                cursor: "pointer",
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
                paddingRight: "32px",
              }}
              onFocus={focusGreen}
              onBlur={blurGray}
            >
              {STAGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} style={{ backgroundColor: "#1a1a1a" }}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="remotePreference" style={labelStyle}>Work Preference</label>
            <select
              id="remotePreference"
              value={remotePreference}
              onChange={(e) => setRemotePreference(e.target.value)}
              disabled={loading}
              style={{
                ...inputStyle,
                cursor: "pointer",
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
                paddingRight: "32px",
              }}
              onFocus={focusGreen}
              onBlur={blurGray}
            >
              {REMOTE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} style={{ backgroundColor: "#1a1a1a" }}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Preferred Companies */}
        <div>
          <label htmlFor="preferredCompanies" style={labelStyle}>
            Preferred Companies <Optional />
          </label>
          <input
            id="preferredCompanies"
            type="text"
            value={preferredCompanies}
            onChange={(e) => setPreferredCompanies(e.target.value)}
            placeholder="e.g. Stripe, Linear, Vercel — or leave blank to discover from filters above"
            disabled={loading}
            style={inputStyle}
            onFocus={focusGreen}
            onBlur={blurGray}
          />
          <p style={{ fontSize: "11px", color: "#555", marginTop: "5px" }}>
            Leave blank to discover recruiter leads based on industry and stage filters.
          </p>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !isReady}
        style={{
          width: "100%",
          padding: "12px 20px",
          backgroundColor: loading || !isReady ? "#1f2e22" : "#4ade80",
          color: loading || !isReady ? "#555" : "#0f0f0f",
          border: "none",
          borderRadius: "6px",
          fontSize: "14px",
          fontWeight: "600",
          cursor: loading || !isReady ? "not-allowed" : "pointer",
          transition: "background-color 0.15s",
          fontFamily: "inherit",
        }}
        onMouseEnter={(e) => { if (!loading && isReady) e.currentTarget.style.backgroundColor = "#22c55e" }}
        onMouseLeave={(e) => { if (!loading && isReady) e.currentTarget.style.backgroundColor = "#4ade80" }}
      >
        {loading ? "Discovering Leads..." : "Discover Recruiter Leads →"}
      </button>
    </form>
  )
}

function Required() {
  return <span style={{ color: "#4ade80", marginLeft: "3px", fontSize: "12px" }}>*</span>
}

function Optional() {
  return (
    <span style={{ marginLeft: "8px", fontSize: "11px", color: "#555", fontWeight: "400", letterSpacing: 0, textTransform: "none" }}>
      optional
    </span>
  )
}
