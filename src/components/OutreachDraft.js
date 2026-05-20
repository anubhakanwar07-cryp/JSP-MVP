"use client"

import { useState } from "react"

export default function OutreachDraft({ outreach, recruiter, onSave, saving, saved }) {
  const [copied, setCopied] = useState(false)

  const fullEmailText = `Subject: ${outreach.subject}\n\n${outreach.body}`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(fullEmailText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement("textarea")
      el.value = fullEmailText
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function handleCreateDraft() {
    alert("Gmail draft creation coming soon")
  }

  const actionButtonStyle = {
    padding: "9px 16px",
    border: "1px solid #2a2a2a",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "inherit",
    flex: "1",
  }

  return (
    <div
      style={{
        backgroundColor: "#1a1a1a",
        border: "1px solid #2a2a2a",
        borderRadius: "10px",
        padding: "28px",
      }}
    >
      {/* Section title */}
      <h2
        style={{
          fontSize: "16px",
          fontWeight: "600",
          color: "#e5e5e5",
          marginBottom: "6px",
        }}
      >
        Outreach Draft
      </h2>
      {recruiter && (
        <p style={{ fontSize: "13px", color: "#888", marginBottom: "4px" }}>
          To:{" "}
          <span style={{ color: "#e5e5e5", fontWeight: "500" }}>{recruiter.name}</span>
          {" · "}
          <span style={{ color: "#666" }}>{recruiter.role}</span>
          {" · "}
          <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#aaa" }}>{recruiter.email}</span>
        </p>
      )}
      <p style={{ fontSize: "13px", color: "#555", marginBottom: "20px" }}>
        Review and edit before sending. Copy it, create a Gmail draft, or mark as sent.
      </p>

      {/* Subject line */}
      <div style={{ marginBottom: "12px" }}>
        <p
          style={{
            fontSize: "11px",
            fontWeight: "500",
            color: "#555",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "5px",
          }}
        >
          Subject
        </p>
        <p
          style={{
            fontSize: "14px",
            color: "#e5e5e5",
            fontWeight: "500",
            backgroundColor: "#0f0f0f",
            padding: "8px 12px",
            borderRadius: "5px",
            border: "1px solid #2a2a2a",
          }}
        >
          {outreach.subject}
        </p>
      </div>

      {/* Email body */}
      <div style={{ marginBottom: "20px" }}>
        <p
          style={{
            fontSize: "11px",
            fontWeight: "500",
            color: "#555",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "5px",
          }}
        >
          Body
        </p>
        <pre
          style={{
            fontSize: "13px",
            lineHeight: "1.75",
            color: "#d4d4d4",
            backgroundColor: "#0f0f0f",
            padding: "16px",
            borderRadius: "6px",
            border: "1px solid #2a2a2a",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            margin: "0",
            overflowX: "auto",
          }}
        >
          {outreach.body}
        </pre>
      </div>

      {/* Three action buttons in a row */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        {/* Copy button */}
        <button
          onClick={handleCopy}
          style={{
            ...actionButtonStyle,
            backgroundColor: copied ? "#14532d" : "#2a2a2a",
            color: copied ? "#4ade80" : "#e5e5e5",
            borderColor: copied ? "#166534" : "#2a2a2a",
          }}
          onMouseEnter={(e) => {
            if (!copied) {
              e.currentTarget.style.backgroundColor = "#333"
              e.currentTarget.style.borderColor = "#3a3a3a"
            }
          }}
          onMouseLeave={(e) => {
            if (!copied) {
              e.currentTarget.style.backgroundColor = "#2a2a2a"
              e.currentTarget.style.borderColor = "#2a2a2a"
            }
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>

        {/* Create Draft button */}
        <button
          onClick={handleCreateDraft}
          style={{
            ...actionButtonStyle,
            backgroundColor: "#2a2a2a",
            color: "#e5e5e5",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#333"
            e.currentTarget.style.borderColor = "#3a3a3a"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#2a2a2a"
            e.currentTarget.style.borderColor = "#2a2a2a"
          }}
        >
          Create Draft
        </button>

        {/* Mark as Sent button */}
        <button
          onClick={() => onSave("sent")}
          disabled={saving || saved}
          style={{
            ...actionButtonStyle,
            backgroundColor: saved ? "#14532d" : saving ? "#1f2e22" : "#4ade80",
            color: saved ? "#4ade80" : saving ? "#555" : "#0f0f0f",
            borderColor: saved ? "#166534" : saving ? "#1f2e22" : "#4ade80",
            cursor: saving || saved ? "not-allowed" : "pointer",
          }}
          onMouseEnter={(e) => {
            if (!saving && !saved) {
              e.currentTarget.style.backgroundColor = "#22c55e"
            }
          }}
          onMouseLeave={(e) => {
            if (!saving && !saved) {
              e.currentTarget.style.backgroundColor = "#4ade80"
            }
          }}
        >
          {saved ? "Sent!" : saving ? "Saving..." : "Mark as Sent"}
        </button>
      </div>

      {/* Divider */}
      <div
        style={{
          borderTop: "1px solid #2a2a2a",
          marginBottom: "12px",
        }}
      />

      {/* Save as Lead (draft) */}
      <button
        onClick={() => onSave("draft")}
        disabled={saving || saved}
        style={{
          width: "100%",
          padding: "9px 16px",
          backgroundColor: "transparent",
          color: saving || saved ? "#555" : "#888",
          border: "1px solid #2a2a2a",
          borderRadius: "6px",
          fontSize: "13px",
          fontWeight: "500",
          cursor: saving || saved ? "not-allowed" : "pointer",
          transition: "all 0.15s",
          fontFamily: "inherit",
        }}
        onMouseEnter={(e) => {
          if (!saving && !saved) {
            e.currentTarget.style.color = "#e5e5e5"
            e.currentTarget.style.borderColor = "#3a3a3a"
          }
        }}
        onMouseLeave={(e) => {
          if (!saving && !saved) {
            e.currentTarget.style.color = "#888"
            e.currentTarget.style.borderColor = "#2a2a2a"
          }
        }}
      >
        {saving ? "Saving..." : "Save as Lead"}
      </button>

      {/* Success message */}
      {saved && (
        <div
          style={{
            marginTop: "14px",
            padding: "10px 14px",
            backgroundColor: "#14532d",
            border: "1px solid #166534",
            borderRadius: "6px",
            fontSize: "13px",
            color: "#4ade80",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>✓</span>
          Lead saved successfully to your Supabase database.
        </div>
      )}
    </div>
  )
}
