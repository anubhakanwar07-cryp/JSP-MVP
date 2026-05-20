"use client"

import { useState } from "react"

export default function RecruiterCard({ recruiter, onGenerateOutreach, loading }) {
  const [emailCopied, setEmailCopied] = useState(false)

  // Determine badge color based on confidence score
  function getConfidenceBadgeStyle(score) {
    if (score >= 80) {
      return {
        backgroundColor: "#14532d",
        color: "#4ade80",
        border: "1px solid #166534",
      }
    } else if (score >= 60) {
      return {
        backgroundColor: "#422006",
        color: "#fb923c",
        border: "1px solid #7c2d12",
      }
    } else {
      return {
        backgroundColor: "#450a0a",
        color: "#f87171",
        border: "1px solid #7f1d1d",
      }
    }
  }

  function getConfidenceLabel(score) {
    if (score >= 80) return "High Match"
    if (score >= 60) return "Medium Match"
    return "Low Match"
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(recruiter.email)
      setEmailCopied(true)
      setTimeout(() => setEmailCopied(false), 2000)
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement("textarea")
      el.value = recruiter.email
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
      setEmailCopied(true)
      setTimeout(() => setEmailCopied(false), 2000)
    }
  }

  const badgeStyle = getConfidenceBadgeStyle(recruiter.confidence)

  return (
    <div
      style={{
        backgroundColor: "#1a1a1a",
        border: "1px solid #2a2a2a",
        borderRadius: "10px",
        padding: "28px",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "20px",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#e5e5e5",
              marginBottom: "4px",
            }}
          >
            {recruiter.name}
          </h2>
          <p style={{ fontSize: "14px", color: "#888", marginBottom: "2px" }}>
            {recruiter.role}
          </p>
          <p style={{ fontSize: "13px", color: "#666" }}>{recruiter.company}</p>
        </div>

        {/* Confidence badge */}
        <div
          style={{
            ...badgeStyle,
            borderRadius: "20px",
            padding: "4px 12px",
            fontSize: "12px",
            fontWeight: "600",
            whiteSpace: "nowrap",
          }}
        >
          {recruiter.confidence}% — {getConfidenceLabel(recruiter.confidence)}
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          borderTop: "1px solid #2a2a2a",
          marginBottom: "20px",
        }}
      />

      {/* Email row */}
      <div style={{ marginBottom: "24px" }}>
        <p
          style={{
            fontSize: "11px",
            fontWeight: "500",
            color: "#555",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "6px",
          }}
        >
          Contact Email
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span
            style={{
              fontSize: "14px",
              color: "#e5e5e5",
              fontFamily: "monospace",
              backgroundColor: "#0f0f0f",
              padding: "6px 12px",
              borderRadius: "5px",
              border: "1px solid #2a2a2a",
            }}
          >
            {recruiter.email}
          </span>
          <button
            onClick={copyEmail}
            style={{
              backgroundColor: emailCopied ? "#14532d" : "#2a2a2a",
              color: emailCopied ? "#4ade80" : "#888",
              border: emailCopied ? "1px solid #166534" : "1px solid #3a3a3a",
              borderRadius: "5px",
              padding: "6px 12px",
              fontSize: "12px",
              cursor: "pointer",
              transition: "all 0.15s",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
            }}
          >
            {emailCopied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Source note */}
      <p
        style={{
          fontSize: "11px",
          color: "#444",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: "6px",
            height: "6px",
            backgroundColor: "#444",
            borderRadius: "50%",
          }}
        />
        Source: Mock Data
      </p>

      {/* Generate outreach button */}
      <button
        onClick={onGenerateOutreach}
        disabled={loading}
        style={{
          width: "100%",
          padding: "11px 20px",
          backgroundColor: loading ? "#1f2e22" : "#4ade80",
          color: loading ? "#555" : "#0f0f0f",
          border: "none",
          borderRadius: "6px",
          fontSize: "14px",
          fontWeight: "600",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background-color 0.15s",
          fontFamily: "inherit",
        }}
        onMouseEnter={(e) => {
          if (!loading) e.currentTarget.style.backgroundColor = "#22c55e"
        }}
        onMouseLeave={(e) => {
          if (!loading) e.currentTarget.style.backgroundColor = "#4ade80"
        }}
      >
        {loading ? "Generating..." : "Generate Outreach Email"}
      </button>
    </div>
  )
}
