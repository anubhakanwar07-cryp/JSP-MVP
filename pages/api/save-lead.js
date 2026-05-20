// POST /api/save-lead
// Accepts a lead object and inserts it into the outreach_leads table in Supabase.
// Returns: { success: true, id: "..." } or { error: "..." }

import supabase from "../../src/lib/supabaseClient"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." })
  }

  const {
    company_name,
    role_targeted,
    recruiter_name,
    recruiter_role,
    recruiter_email,
    outreach_message,
    outreach_status,
    source,
    confidence_score,
  } = req.body

  // Basic validation
  if (!company_name || !role_targeted) {
    return res.status(400).json({
      error: "Missing required fields: company_name, role_targeted",
    })
  }

  try {
    const { data, error } = await supabase
      .from("outreach_leads")
      .insert([
        {
          company_name,
          role_targeted,
          recruiter_name: recruiter_name || null,
          recruiter_role: recruiter_role || null,
          recruiter_email: recruiter_email || null,
          outreach_message: outreach_message || null,
          outreach_status: outreach_status || "draft",
          source: source || "mock",
          confidence_score: confidence_score || null,
          // created_at is handled by Supabase default
        },
      ])
      .select("id")
      .single()

    if (error) {
      console.error("Supabase insert error:", error)
      return res.status(500).json({
        error: error.message || "Failed to save lead to database",
      })
    }

    return res.status(200).json({
      success: true,
      id: data?.id || null,
    })
  } catch (err) {
    console.error("Unexpected error in save-lead:", err)
    return res.status(500).json({
      error: "An unexpected error occurred. Check your Supabase configuration.",
    })
  }
}
