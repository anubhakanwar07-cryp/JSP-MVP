// POST /api/find-recruiter
// Accepts: { targetRole, industry, companyStage, location, preferredCompanies }
// Returns: Array of recruiter leads
//
// Uses Apollo.io People Search API when APOLLO_API_KEY is set.
// Falls back to mock Indian company data if the key is missing.

// ─── Apollo Integration ───────────────────────────────────────────────────────

const RECRUITER_TITLES = [
  "Technical Recruiter",
  "Senior Technical Recruiter",
  "Talent Acquisition",
  "Talent Acquisition Specialist",
  "Talent Acquisition Lead",
  "Engineering Recruiter",
  "Recruiting Manager",
  "Recruiting Lead",
  "Head of Talent",
  "People & Talent",
]

async function searchApollo({ targetRole, industry, location, preferredCompanies }) {
  const body = {
    person_titles: RECRUITER_TITLES,
    page: 1,
    per_page: 8,
  }

  // If user named specific companies, search within them
  if (preferredCompanies && preferredCompanies.trim()) {
    body.organization_names = preferredCompanies
      .split(/[,;]+/)
      .map((c) => c.trim())
      .filter(Boolean)
  } else {
    // Discovery mode — use industry as keyword context
    if (industry && industry.trim()) {
      body.q_keywords = industry.trim()
    }
  }

  // Location filter — default India
  const loc = location && location.trim() ? location.trim() : "India"
  if (loc.toLowerCase() !== "global" && loc.toLowerCase() !== "any") {
    body.person_locations = [loc]
  }

  const response = await fetch("https://api.apollo.io/v1/mixed_people/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": process.env.APOLLO_API_KEY,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message || `Apollo API error: ${response.status}`)
  }

  const data = await response.json()
  const people = data.people || []

  return people.map((person) => {
    const org = person.organization || {}

    // Apollo returns email_status: "verified", "guessed", "unavailable", etc.
    const hasVerifiedEmail = person.email && person.email_status !== "unavailable"
    const confidence = person.email_status === "verified" ? 92
      : person.email_status === "guessed" ? 62
      : person.email ? 75
      : 45

    // If Apollo has no email, build a guessed pattern from name + domain
    const guessedEmail = org.primary_domain
      ? `${person.first_name?.[0]?.toLowerCase()}.${person.last_name?.toLowerCase()}@${org.primary_domain}`
      : null

    const locationParts = [person.city, person.state, person.country].filter(Boolean)

    return {
      name: person.name || `${person.first_name} ${person.last_name}`,
      role: person.title || "Recruiter",
      email: hasVerifiedEmail ? person.email : (guessedEmail || "Email not found"),
      emailVerified: hasVerifiedEmail,
      linkedin: person.linkedin_url || null,
      website: org.website_url || null,
      company: org.name || "Unknown",
      confidence,
      location: locationParts.slice(0, 2).join(", ") || loc,
    }
  })
}

// ─── Mock fallback (used when APOLLO_API_KEY is not set) ──────────────────────

const mockCompanies = {
  razorpay:    { name: "Priya Sharma",      role: "Technical Recruiter",              email: "p.sharma@razorpay.com",       linkedin: "https://linkedin.com/in/priya-sharma-razorpay",      website: "https://razorpay.com",     confidence: 72, company: "Razorpay",     stage: "late",       location: "Bangalore", industries: ["fintech", "payments", "saas"] },
  phonePe:     { name: "Rohan Mehta",       role: "Senior Recruiter — Engineering",   email: "r.mehta@phonepe.com",          linkedin: "https://linkedin.com/in/rohan-mehta-phonepe",         website: "https://phonepe.com",      confidence: 68, company: "PhonePe",      stage: "late",       location: "Bangalore", industries: ["fintech", "payments", "upi"] },
  cred:        { name: "Ananya Rao",        role: "Talent Acquisition Lead",          email: "a.rao@cred.club",              linkedin: "https://linkedin.com/in/ananya-rao-cred",             website: "https://cred.club",        confidence: 75, company: "CRED",         stage: "late",       location: "Bangalore", industries: ["fintech", "consumer", "loyalty"] },
  zepto:       { name: "Karan Bhatia",      role: "Recruiting Lead",                  email: "k.bhatia@zepto.com",           linkedin: "https://linkedin.com/in/karan-bhatia-zepto",          website: "https://zepto.in",         confidence: 70, company: "Zepto",        stage: "b-c",        location: "Mumbai",    industries: ["quick-commerce", "logistics", "consumer"] },
  meesho:      { name: "Divya Nair",        role: "Technical Recruiter",              email: "d.nair@meesho.com",            linkedin: "https://linkedin.com/in/divya-nair-meesho",           website: "https://meesho.com",       confidence: 66, company: "Meesho",       stage: "late",       location: "Bangalore", industries: ["ecommerce", "social-commerce", "saas"] },
  groww:       { name: "Arjun Kapoor",      role: "Senior Recruiter",                 email: "a.kapoor@groww.in",            linkedin: "https://linkedin.com/in/arjun-kapoor-groww",          website: "https://groww.in",         confidence: 69, company: "Groww",        stage: "late",       location: "Bangalore", industries: ["fintech", "investing", "wealthtech"] },
  swiggy:      { name: "Sneha Pillai",      role: "Engineering Recruiter",            email: "s.pillai@swiggy.in",           linkedin: "https://linkedin.com/in/sneha-pillai-swiggy",         website: "https://swiggy.com",       confidence: 64, company: "Swiggy",       stage: "late",       location: "Bangalore", industries: ["food-delivery", "logistics", "consumer"] },
  zomato:      { name: "Nikhil Gupta",      role: "Talent Acquisition Specialist",    email: "n.gupta@zomato.com",           linkedin: "https://linkedin.com/in/nikhil-gupta-zomato",         website: "https://zomato.com",       confidence: 62, company: "Zomato",       stage: "enterprise", location: "Gurgaon",   industries: ["food-delivery", "restaurant-tech", "consumer"] },
  flipkart:    { name: "Pooja Iyer",        role: "Senior Technical Recruiter",       email: "p.iyer@flipkart.com",          linkedin: "https://linkedin.com/in/pooja-iyer-flipkart",         website: "https://flipkart.com",     confidence: 60, company: "Flipkart",     stage: "enterprise", location: "Bangalore", industries: ["ecommerce", "tech", "logistics"] },
  freshworks:  { name: "Vijay Subramaniam", role: "Recruiting Manager",               email: "v.subramaniam@freshworks.com", linkedin: "https://linkedin.com/in/vijay-subramaniam-freshworks", website: "https://freshworks.com",   confidence: 71, company: "Freshworks",   stage: "enterprise", location: "Chennai",   industries: ["saas", "crm", "b2b"] },
  zoho:        { name: "Meena Krishnan",    role: "Talent Acquisition",               email: "m.krishnan@zohocorp.com",      linkedin: "https://linkedin.com/in/meena-krishnan-zoho",         website: "https://zoho.com",         confidence: 58, company: "Zoho",         stage: "enterprise", location: "Chennai",   industries: ["saas", "productivity", "b2b"] },
  browserstack:{ name: "Rahul Joshi",       role: "Technical Recruiter",              email: "r.joshi@browserstack.com",     linkedin: "https://linkedin.com/in/rahul-joshi-browserstack",    website: "https://browserstack.com", confidence: 74, company: "BrowserStack", stage: "b-c",        location: "Mumbai",    industries: ["devtools", "testing", "saas"] },
  postman:     { name: "Aditya Verma",      role: "Senior Recruiter — Engineering",   email: "a.verma@postman.com",          linkedin: "https://linkedin.com/in/aditya-verma-postman",        website: "https://postman.com",      confidence: 73, company: "Postman",      stage: "late",       location: "Bangalore", industries: ["devtools", "api", "saas"] },
  darwinbox:   { name: "Riya Choudhary",    role: "Talent Acquisition Lead",          email: "r.choudhary@darwinbox.com",    linkedin: "https://linkedin.com/in/riya-choudhary-darwinbox",    website: "https://darwinbox.com",    confidence: 67, company: "Darwinbox",    stage: "b-c",        location: "Hyderabad", industries: ["hrtech", "saas", "b2b"] },
  bharatpe:    { name: "Amit Saxena",       role: "Recruiting Lead",                  email: "a.saxena@bharatpe.com",        linkedin: "https://linkedin.com/in/amit-saxena-bharatpe",        website: "https://bharatpe.com",     confidence: 61, company: "BharatPe",     stage: "b-c",        location: "Delhi",     industries: ["fintech", "payments", "merchant-tech"] },
  navi:        { name: "Shruti Bansal",     role: "Technical Recruiter",              email: "s.bansal@navi.com",            linkedin: "https://linkedin.com/in/shruti-bansal-navi",          website: "https://navi.com",         confidence: 63, company: "Navi",         stage: "b-c",        location: "Bangalore", industries: ["fintech", "insurance", "lending"] },
  sarvam:      { name: "Deepak Reddy",      role: "Head of Talent",                   email: "d.reddy@sarvam.ai",            linkedin: "https://linkedin.com/in/deepak-reddy-sarvam",         website: "https://sarvam.ai",        confidence: 78, company: "Sarvam AI",    stage: "seed-a",     location: "Bangalore", industries: ["ai", "llm", "indic-languages"] },
  upgrad:      { name: "Pallavi Singh",     role: "Talent Acquisition Specialist",    email: "p.singh@upgrad.com",           linkedin: "https://linkedin.com/in/pallavi-singh-upgrad",        website: "https://upgrad.com",       confidence: 56, company: "upGrad",       stage: "late",       location: "Mumbai",    industries: ["edtech", "learning", "saas"] },
  unacademy:   { name: "Yash Agarwal",      role: "Senior Recruiter",                 email: "y.agarwal@unacademy.com",      linkedin: "https://linkedin.com/in/yash-agarwal-unacademy",      website: "https://unacademy.com",    confidence: 54, company: "Unacademy",    stage: "late",       location: "Bangalore", industries: ["edtech", "learning", "consumer"] },
  oyo:         { name: "Kavita Menon",      role: "Recruiting Manager",               email: "k.menon@oyorooms.com",         linkedin: "https://linkedin.com/in/kavita-menon-oyo",            website: "https://oyorooms.com",     confidence: 52, company: "OYO",          stage: "late",       location: "Gurgaon",   industries: ["hospitality", "travel", "marketplace"] },
}

const roleToPool = {
  engineering: ["razorpay", "cred", "browserstack", "postman", "sarvam", "zepto", "meesho"],
  product:     ["cred", "meesho", "groww", "darwinbox", "razorpay", "swiggy"],
  design:      ["swiggy", "zomato", "cred", "meesho", "zepto"],
  data:        ["flipkart", "meesho", "zomato", "swiggy", "groww", "razorpay"],
  ai:          ["sarvam", "freshworks", "zoho", "razorpay", "cred"],
  finance:     ["razorpay", "phonePe", "groww", "bharatpe", "navi", "cred"],
  marketing:   ["zomato", "swiggy", "meesho", "oyo", "unacademy"],
  hrtech:      ["darwinbox", "freshworks", "zoho", "razorpay"],
  devtools:    ["browserstack", "postman", "freshworks", "zoho"],
}

function detectRoleCategory(role) {
  const r = role.toLowerCase()
  if (r.match(/engineer|developer|swe|backend|frontend|fullstack|infra|devops|platform|sre/)) return "engineering"
  if (r.match(/product manager|pm |product lead|head of product/)) return "product"
  if (r.match(/design|ux|ui|visual/)) return "design"
  if (r.match(/data|analyst|scientist|ml |machine learning/)) return "data"
  if (r.match(/ai|llm|nlp/)) return "ai"
  if (r.match(/finance|fintech|banking/)) return "finance"
  if (r.match(/marketing|growth|brand/)) return "marketing"
  if (r.match(/hr|people|talent|recruitment/)) return "hrtech"
  if (r.match(/devtool|api|sdk/)) return "devtools"
  return "engineering"
}

function industryMatches(companyIndustries, seg) {
  if (!seg || !seg.trim()) return true
  const terms = seg.toLowerCase().split(/[,\s\/]+/).filter(Boolean)
  return terms.some((t) => companyIndustries.some((ci) => ci.includes(t) || t.includes(ci)))
}

function stageMatches(companyStage, filterStage) {
  if (!filterStage || filterStage === "any") return true
  return companyStage === filterStage
}

function locationMatches(companyLocation, filterLocation) {
  if (!filterLocation || !filterLocation.trim()) return true
  const terms = filterLocation.toLowerCase().split(/[,\s\/]+/).filter(Boolean)
  const loc = companyLocation.toLowerCase()
  return terms.some((t) => loc.includes(t) || t.includes(loc))
}

function getMockResults({ targetRole, industry, companyStage, location, preferredCompanies }) {
  let results = []

  if (preferredCompanies && preferredCompanies.trim()) {
    const list = preferredCompanies.split(/[,;]+/).map((c) => c.trim()).filter(Boolean)
    results = list.map((c) => {
      const key = c.toLowerCase().replace(/[\s\-\.]/g, "")
      return mockCompanies[key] || Object.values(mockCompanies).find(
        (co) => co.company.toLowerCase() === c.toLowerCase()
      ) || null
    }).filter(Boolean)
  } else {
    const category = detectRoleCategory(targetRole)
    const pool = roleToPool[category] || roleToPool.engineering
    results = pool
      .map((key) => mockCompanies[key])
      .filter((c) =>
        c &&
        industryMatches(c.industries, industry) &&
        stageMatches(c.stage, companyStage) &&
        locationMatches(c.location, location)
      )
    if (results.length === 0) {
      results = pool.map((key) => mockCompanies[key]).filter(Boolean)
    }
  }

  return results.sort((a, b) => b.confidence - a.confidence)
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." })
  }

  const { targetRole, industry, companyStage, location, preferredCompanies } = req.body

  if (!targetRole) {
    return res.status(400).json({ error: "Missing required field: targetRole" })
  }

  // Use Apollo if key is set, otherwise fall back to mock data
  if (process.env.APOLLO_API_KEY) {
    try {
      const results = await searchApollo({ targetRole, industry, location, preferredCompanies })
      return res.status(200).json(results)
    } catch (err) {
      console.error("Apollo API error, falling back to mock:", err.message)
      // Fall through to mock below
    }
  }

  // Mock fallback
  const results = getMockResults({ targetRole, industry, companyStage, location, preferredCompanies })
  setTimeout(() => res.status(200).json(results), 600)
}
