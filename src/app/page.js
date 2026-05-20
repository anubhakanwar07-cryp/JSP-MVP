"use client"

import { useState } from "react"
import InputForm from "../components/InputForm"
import RecruiterList from "../components/RecruiterList"
import OutreachQueue from "../components/OutreachQueue"

const STEP_LABELS = { 1: "Your Context", 2: "Recruiter Leads", 3: "Outreach Queue" }

export default function HomePage() {
  const [step, setStep] = useState(1)

  const [formData, setFormData] = useState({
    // Candidate Context
    background: "", targetRole: "", achievements: "",
    // Target Segmentation
    industry: "", location: "India", companyStage: "any", remotePreference: "any", preferredCompanies: "",
  })

  const [recruiters, setRecruiters] = useState([])

  // queue = [{ recruiter, outreach, saving, saved }]
  const [queue, setQueue] = useState([])

  const [loadingRecruiters, setLoadingRecruiters] = useState(false)
  const [generatingOutreach, setGeneratingOutreach] = useState(false)
  const [error, setError] = useState("")

  // Step 1 → Step 2: discover recruiter leads
  async function handleFormSubmit(data) {
    setError("")
    setLoadingRecruiters(true)
    setFormData(data)

    try {
      const res = await fetch("/api/find-recruiter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      if (!res.ok) throw new Error(result.error || "Failed to find recruiters")
      setRecruiters(result)
      setStep(2)
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setLoadingRecruiters(false)
    }
  }

  // Step 2 → Step 3: generate outreach for all selected recruiters in parallel
  async function handleGenerateForSelected(selectedRecruiters) {
    setError("")
    setGeneratingOutreach(true)

    try {
      const drafts = await Promise.all(
        selectedRecruiters.map(async (recruiter) => {
          const res = await fetch("/api/generate-outreach", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              background: formData.background,
              targetRole: formData.targetRole,
              achievements: formData.achievements,
              company: recruiter.company,
              recruiterName: recruiter.name,
              recruiterRole: recruiter.role,
            }),
          })
          const outreach = await res.json()
          if (!res.ok) throw new Error(outreach.error || `Failed for ${recruiter.name}`)
          return { recruiter, outreach, saving: false, saved: false }
        })
      )
      setQueue(drafts)
      setStep(3)
    } catch (err) {
      setError(err.message || "Failed to generate some outreach drafts.")
    } finally {
      setGeneratingOutreach(false)
    }
  }

  // Save a specific lead by recruiter email
  async function handleSaveLead(recruiterEmail, status) {
    const item = queue.find((i) => i.recruiter.email === recruiterEmail)
    if (!item) return

    // Mark as saving
    setQueue((prev) =>
      prev.map((i) => i.recruiter.email === recruiterEmail ? { ...i, saving: true } : i)
    )

    try {
      const res = await fetch("/api/save-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: item.recruiter.company,
          role_targeted: formData.targetRole,
          recruiter_name: item.recruiter.name,
          recruiter_role: item.recruiter.role,
          recruiter_email: item.recruiter.email,
          outreach_message: `Subject: ${item.outreach.subject}\n\n${item.outreach.body}`,
          outreach_status: status,
          source: "mock",
          confidence_score: item.recruiter.confidence,
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Failed to save")

      setQueue((prev) =>
        prev.map((i) => i.recruiter.email === recruiterEmail ? { ...i, saving: false, saved: true } : i)
      )
    } catch (err) {
      setError(err.message)
      setQueue((prev) =>
        prev.map((i) => i.recruiter.email === recruiterEmail ? { ...i, saving: false } : i)
      )
    }
  }

  function handleBack() {
    setError("")
    if (step === 2) { setStep(1); setRecruiters([]) }
    else if (step === 3) { setStep(2); setQueue([]) }
  }

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#0f0f0f", padding: "32px 16px" }}>
      {/* Header */}
      <div style={{ maxWidth: "672px", margin: "0 auto 32px auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#4ade80", letterSpacing: "-0.5px" }}>JSP</h1>
          <span style={{ color: "#888", fontSize: "14px" }}>Recruiter Lead Discovery</span>
        </div>
        <p style={{ fontSize: "12px", color: "#444", marginTop: "6px" }}>
          Surface recruiter contacts around your expertise · no job posting required
        </p>
      </div>

      {/* Step indicator */}
      <div style={{ maxWidth: "672px", margin: "0 auto 32px auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ display: "flex", alignItems: "center" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: "600",
                backgroundColor: step === s ? "#4ade80" : step > s ? "#166534" : "#2a2a2a",
                color: step === s ? "#0f0f0f" : step > s ? "#4ade80" : "#888",
                border: step > s ? "1px solid #166534" : "1px solid #2a2a2a",
                transition: "all 0.2s",
              }}>
                {step > s ? "✓" : s}
              </div>
              {s < 3 && <div style={{ width: "40px", height: "1px", backgroundColor: step > s ? "#166534" : "#2a2a2a", margin: "0 4px" }} />}
            </div>
          ))}
          <div style={{ marginLeft: "12px", fontSize: "12px", color: "#888" }}>{STEP_LABELS[step]}</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "672px", margin: "0 auto" }}>
        {error && (
          <div style={{ backgroundColor: "#1a1a1a", border: "1px solid #f87171", borderRadius: "8px", padding: "12px 16px", marginBottom: "24px", color: "#f87171", fontSize: "14px" }}>
            {error}
          </div>
        )}

        {step > 1 && (
          <button
            onClick={handleBack}
            style={{ display: "flex", alignItems: "center", gap: "6px", color: "#888", fontSize: "13px", background: "none", border: "none", cursor: "pointer", padding: "0", marginBottom: "20px" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#e5e5e5")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
          >
            <span style={{ fontSize: "16px" }}>←</span> Back
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
