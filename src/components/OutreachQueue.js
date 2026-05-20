"use client"

import { useState } from "react"

function DraftCard({ item, onSave }) {
  const [copied, setCopied] = useState(false)
  const { recruiter, outreach, saving, saved } = item

  const fullText = `Subject: ${outreach.subject}\n\n${outreach.body}`

  async function handleCopy() {
    try { await navigator.clipboard.writeText(fullText) } catch { /* omit fallback */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const btnBase = {
    padding: "8px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: "500",
    cursor: "pointer", fontFamily: "inherit", border: "1px solid #2a2a2a", transition: "all 0.15s",
  }

  return (
    <div style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "10px", padding: "22px 24px", marginBottom: "12px" }}>
      {/* Recruiter header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#e5e5e5" }}>{recruiter.name}</span>
            <span style={{ fontSize: "12px", color: "#60a5fa" }}>{recruiter.company}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "#666" }}>{recruiter.role}</span>
            <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#888", backgroundColor: "#0f0f0f", padding: "2px 7px", borderRadius: "4px", border: "1px solid #2a2a2a" }}>
              {recruiter.email}
            </span>
          </div>
        </div>
        {saved && (
          <span style={{ fontSize: "12px", color: "#4ade80", backgroundColor: "#14532d", padding: "4px 10px", borderRadius: "20px", border: "1px solid #166534", whiteSpace: "nowrap" }}>
            ✓ Saved
          </span>
        )}
      </div>

      {/* Subject */}
      <div style={{ marginBottom: "10px" }}>
        <p style={{ fontSize: "10px", fontWeight: "600", color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>Subject</p>
        <p style={{ fontSize: "13px", color: "#d4d4d4", backgroundColor: "#0f0f0f", padding: "8px 12px", borderRadius: "5px", border: "1px solid #2a2a2a", fontWeight: "500" }}>
          {outreach.subject}
        </p>
      </div>

      {/* Body */}
      <div style={{ marginBottom: "16px" }}>
        <p style={{ fontSize: "10px", fontWeight: "600", color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>Body</p>
        <pre style={{
          fontSize: "12px", lineHeight: "1.75", color: "#d4d4d4",
          backgroundColor: "#0f0f0f", padding: "14px", borderRadius: "6px",
          border: "1px solid #2a2a2a", whiteSpace: "pre-wrap", wordBreak: "break-word",
          fontFamily: "inherit", margin: "0",
        }}>
          {outreach.body}
        </pre>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button
          onClick={handleCopy}
          style={{ ...btnBase, backgroundColor: copied ? "#14532d" : "#2a2a2a", color: copied ? "#4ade80" : "#e5e5e5", borderColor: copied ? "#166534" : "#2a2a2a" }}
          onMouseEnter={(e) => { if (!copied) e.currentTarget.style.backgroundColor = "#333" }}
          onMouseLeave={(e) => { if (!copied) e.currentTarget.style.backgroundColor = "#2a2a2a" }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>

        <button
          onClick={() => alert("Gmail draft creation coming soon")}
          style={{ ...btnBase, backgroundColor: "#2a2a2a", color: "#e5e5e5" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#333")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2a2a2a")}
        >
          Create Draft
        </button>

        <button
          onClick={() => onSave(recruiter.email, "sent")}
          disabled={saving || saved}
          style={{
            ...btnBase,
            backgroundColor: saved ? "#14532d" : saving ? "#1f2e22" : "#4ade80",
            color: saved ? "#4ade80" : saving ? "#555" : "#0f0f0f",
            borderColor: saved ? "#166534" : saving ? "#1f2e22" : "#4ade80",
            cursor: saving || saved ? "not-allowed" : "pointer",
          }}
          onMouseEnter={(e) => { if (!saving && !saved) e.currentTarget.style.backgroundColor = "#22c55e" }}
          onMouseLeave={(e) => { if (!saving && !saved) e.currentTarget.style.backgroundColor = "#4ade80" }}
        >
          {saved ? "Sent ✓" : saving ? "Saving..." : "Mark as Sent"}
        </button>

        <button
          onClick={() => onSave(recruiter.email, "draft")}
          disabled={saving || saved}
          style={{ ...btnBase, backgroundColor: "transparent", color: saving || saved ? "#444" : "#888", cursor: saving || saved ? "not-allowed" : "pointer" }}
          onMouseEnter={(e) => { if (!saving && !saved) e.currentTarget.style.color = "#e5e5e5" }}
          onMouseLeave={(e) => { if (!saving && !saved) e.currentTarget.style.color = "#888" }}
        >
          Save as Lead
        </button>

        {recruiter.linkedin && (
          <a
            href={recruiter.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...btnBase, backgroundColor: "#0f1f35", color: "#60a5fa", borderColor: "#1e3a5f", textDecoration: "none", display: "inline-flex", alignItems: "center" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#162d4a")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0f1f35")}
          >
            ↗ LinkedIn
          </a>
        )}
      </div>
    </div>
  )
}

export default function OutreachQueue({ queue, onSave }) {
  const savedCount = queue.filter((i) => i.saved).length

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#e5e5e5", marginBottom: "4px" }}>
          Outreach Drafts
        </h2>
        <p style={{ fontSize: "13px", color: "#888" }}>
          {queue.length} draft{queue.length > 1 ? "s" : ""} generated
          {savedCount > 0 && <span style={{ color: "#4ade80", marginLeft: "8px" }}>· {savedCount} saved</span>}
        </p>
      </div>

      {queue.map((item) => (
        <DraftCard key={item.recruiter.email} item={item} onSave={onSave} />
      ))}
    </div>
  )
}
