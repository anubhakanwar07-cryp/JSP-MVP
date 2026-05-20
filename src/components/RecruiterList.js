"use client"

import { useState } from "react"

function ConfidenceBadge({ score }) {
  const s =
    score >= 80 ? { bg: "#14532d", color: "#4ade80", border: "1px solid #166534", label: "High" }
    : score >= 65 ? { bg: "#422006", color: "#fb923c", border: "1px solid #7c2d12", label: "Med" }
    : { bg: "#450a0a", color: "#f87171", border: "1px solid #7f1d1d", label: "Low" }
  return (
    <span style={{ backgroundColor: s.bg, color: s.color, border: s.border, borderRadius: "20px", padding: "2px 8px", fontSize: "11px", fontWeight: "600", whiteSpace: "nowrap" }}>
      {score}% · {s.label}
    </span>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  async function copy(e) {
    e.stopPropagation()
    try { await navigator.clipboard.writeText(text) } catch { /* fallback omitted for brevity */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} style={{ background: "none", border: "none", color: copied ? "#4ade80" : "#555", fontSize: "11px", cursor: "pointer", padding: "2px 4px", fontFamily: "inherit" }}>
      {copied ? "Copied!" : "Copy"}
    </button>
  )
}

function ExternalLink({ href, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      style={{
        fontSize: "11px",
        color: "#60a5fa",
        textDecoration: "none",
        padding: "2px 8px",
        borderRadius: "4px",
        border: "1px solid #1e3a5f",
        backgroundColor: "#0f1f35",
        whiteSpace: "nowrap",
        transition: "background-color 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#162d4a")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0f1f35")}
    >
      {label}
    </a>
  )
}

function RecruiterRow({ recruiter, selected, onToggle }) {
  return (
    <div
      onClick={() => onToggle(recruiter)}
      style={{
        backgroundColor: selected ? "#0f1f18" : "#1a1a1a",
        border: `1px solid ${selected ? "#166534" : "#2a2a2a"}`,
        borderRadius: "8px",
        padding: "16px 18px",
        cursor: "pointer",
        transition: "all 0.15s",
        userSelect: "none",
      }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.borderColor = "#3a3a3a" }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.borderColor = "#2a2a2a" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
        {/* Checkbox */}
        <div style={{
          marginTop: "2px", width: "18px", height: "18px", borderRadius: "4px", flexShrink: 0,
          backgroundColor: selected ? "#4ade80" : "transparent",
          border: `2px solid ${selected ? "#4ade80" : "#3a3a3a"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.15s",
        }}>
          {selected && <span style={{ fontSize: "11px", color: "#0f0f0f", fontWeight: "700" }}>✓</span>}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Name + badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "15px", fontWeight: "600", color: "#e5e5e5" }}>{recruiter.name}</span>
            <ConfidenceBadge score={recruiter.confidence} />
          </div>

          {/* Role + company */}
          <div style={{ fontSize: "13px", color: "#888", marginBottom: "8px" }}>
            {recruiter.role}
            <span style={{ color: "#444", margin: "0 6px" }}>·</span>
            <span style={{ color: "#60a5fa" }}>{recruiter.company}</span>
            {recruiter.location && (
              <span style={{ color: "#444", fontSize: "12px", marginLeft: "8px" }}>📍 {recruiter.location}</span>
            )}
          </div>

          {/* Email row */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12px", color: "#aaa", fontFamily: "monospace", backgroundColor: "#0f0f0f", padding: "3px 8px", borderRadius: "4px", border: "1px solid #2a2a2a" }}>
              {recruiter.email}
            </span>
            {recruiter.emailVerified && (
              <span style={{ fontSize: "10px", color: "#4ade80", backgroundColor: "#14532d", padding: "2px 6px", borderRadius: "4px", border: "1px solid #166534", fontWeight: "600" }}>
                ✓ Verified
              </span>
            )}
            {!recruiter.emailVerified && recruiter.email !== "Email not found" && (
              <span style={{ fontSize: "10px", color: "#888", backgroundColor: "#1a1a1a", padding: "2px 6px", borderRadius: "4px", border: "1px solid #2a2a2a" }}>
                Guessed
              </span>
            )}
            <CopyButton text={recruiter.email} />
          </div>

          {/* LinkedIn + Website links */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {recruiter.linkedin && (
              <ExternalLink href={recruiter.linkedin} label="↗ LinkedIn" />
            )}
            {recruiter.website && (
              <ExternalLink href={recruiter.website} label="↗ Website" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RecruiterList({ recruiters, onGenerateForSelected, generating }) {
  const [selected, setSelected] = useState([])

  function toggleRecruiter(recruiter) {
    setSelected((prev) => {
      const exists = prev.find((r) => r.email === recruiter.email)
      return exists ? prev.filter((r) => r.email !== recruiter.email) : [...prev, recruiter]
    })
  }

  function selectAll() {
    setSelected(selected.length === recruiters.length ? [] : [...recruiters])
  }

  const selectedCount = selected.length

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "16px" }}>
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#e5e5e5", marginBottom: "3px" }}>
            Recruiter Leads
          </h2>
          <p style={{ fontSize: "13px", color: "#888" }}>
            {recruiters.length} leads found · select to generate outreach drafts
          </p>
        </div>
        <button
          onClick={selectAll}
          style={{ fontSize: "12px", color: "#888", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: "0" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#e5e5e5")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
        >
          {selected.length === recruiters.length ? "Deselect all" : "Select all"}
        </button>
      </div>

      {/* Recruiter rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
        {recruiters.map((r) => (
          <RecruiterRow
            key={r.email}
            recruiter={r}
            selected={!!selected.find((s) => s.email === r.email)}
            onToggle={toggleRecruiter}
          />
        ))}
      </div>

      {/* Generate button */}
      <button
        onClick={() => onGenerateForSelected(selected)}
        disabled={selectedCount === 0 || generating}
        style={{
          width: "100%",
          padding: "12px 20px",
          backgroundColor: selectedCount === 0 || generating ? "#1f2e22" : "#4ade80",
          color: selectedCount === 0 || generating ? "#555" : "#0f0f0f",
          border: "none",
          borderRadius: "6px",
          fontSize: "14px",
          fontWeight: "600",
          cursor: selectedCount === 0 || generating ? "not-allowed" : "pointer",
          transition: "background-color 0.15s",
          fontFamily: "inherit",
        }}
        onMouseEnter={(e) => { if (selectedCount > 0 && !generating) e.currentTarget.style.backgroundColor = "#22c55e" }}
        onMouseLeave={(e) => { if (selectedCount > 0 && !generating) e.currentTarget.style.backgroundColor = "#4ade80" }}
      >
        {generating
          ? "Generating drafts..."
          : selectedCount === 0
          ? "Select recruiters to generate outreach"
          : `Generate Outreach for ${selectedCount} Recruiter${selectedCount > 1 ? "s" : ""} →`
        }
      </button>

      <p style={{ fontSize: "11px", color: "#444", marginTop: "12px" }}>
        · Source: Mock data · LinkedIn URLs are illustrative — real profiles via Apollo/Hunter coming
      </p>
    </div>
  )
}
