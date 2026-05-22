import { NextRequest, NextResponse } from 'next/server'
import type { Recruiter } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CompanyMeta {
  name: string
  role: string
  email: string
  linkedin: string
  website: string
  domain: string
  confidence: number
  company: string
  stage: string
  location: string
  industries: string[]
}

interface HunterEmail {
  value: string
  confidence: number
  first_name: string
  last_name: string
  position: string
  linkedin: string | null
  verification?: { status: string }
}

// ─── Recruiter title detection ────────────────────────────────────────────────

const RECRUITER_TITLE_RE = /recruit|talent\s*acqui|head of talent|staffing|people.*partner|hr\s*manager|human resources/i

function isRecruiterTitle(title: string | undefined): boolean {
  return title ? RECRUITER_TITLE_RE.test(title) : false
}

// ─── Company pool ─────────────────────────────────────────────────────────────

const mockCompanies: Record<string, CompanyMeta> = {
  razorpay:    { name: "Priya Sharma",      role: "Technical Recruiter",              email: "p.sharma@razorpay.com",       linkedin: "https://linkedin.com/in/priya-sharma-razorpay",      website: "https://razorpay.com",     domain: "razorpay.com",     confidence: 72, company: "Razorpay",     stage: "late",       location: "Bangalore", industries: ["fintech", "payments", "saas"] },
  phonePe:     { name: "Rohan Mehta",       role: "Senior Recruiter — Engineering",   email: "r.mehta@phonepe.com",          linkedin: "https://linkedin.com/in/rohan-mehta-phonepe",         website: "https://phonepe.com",      domain: "phonepe.com",      confidence: 68, company: "PhonePe",      stage: "late",       location: "Bangalore", industries: ["fintech", "payments", "upi"] },
  cred:        { name: "Ananya Rao",        role: "Talent Acquisition Lead",          email: "a.rao@cred.club",              linkedin: "https://linkedin.com/in/ananya-rao-cred",             website: "https://cred.club",        domain: "cred.club",        confidence: 75, company: "CRED",         stage: "late",       location: "Bangalore", industries: ["fintech", "consumer", "loyalty"] },
  zepto:       { name: "Karan Bhatia",      role: "Recruiting Lead",                  email: "k.bhatia@zepto.com",           linkedin: "https://linkedin.com/in/karan-bhatia-zepto",          website: "https://zepto.in",         domain: "zepto.in",         confidence: 70, company: "Zepto",        stage: "b-c",        location: "Mumbai",    industries: ["quick-commerce", "logistics", "consumer"] },
  meesho:      { name: "Divya Nair",        role: "Technical Recruiter",              email: "d.nair@meesho.com",            linkedin: "https://linkedin.com/in/divya-nair-meesho",           website: "https://meesho.com",       domain: "meesho.com",       confidence: 66, company: "Meesho",       stage: "late",       location: "Bangalore", industries: ["ecommerce", "social-commerce", "saas"] },
  groww:       { name: "Arjun Kapoor",      role: "Senior Recruiter",                 email: "a.kapoor@groww.in",            linkedin: "https://linkedin.com/in/arjun-kapoor-groww",          website: "https://groww.in",         domain: "groww.in",         confidence: 69, company: "Groww",        stage: "late",       location: "Bangalore", industries: ["fintech", "investing", "wealthtech"] },
  swiggy:      { name: "Sneha Pillai",      role: "Engineering Recruiter",            email: "s.pillai@swiggy.in",           linkedin: "https://linkedin.com/in/sneha-pillai-swiggy",         website: "https://swiggy.com",       domain: "swiggy.in",        confidence: 64, company: "Swiggy",       stage: "late",       location: "Bangalore", industries: ["food-delivery", "logistics", "consumer"] },
  zomato:      { name: "Nikhil Gupta",      role: "Talent Acquisition Specialist",    email: "n.gupta@zomato.com",           linkedin: "https://linkedin.com/in/nikhil-gupta-zomato",         website: "https://zomato.com",       domain: "zomato.com",       confidence: 62, company: "Zomato",       stage: "enterprise", location: "Gurgaon",   industries: ["food-delivery", "restaurant-tech", "consumer"] },
  flipkart:    { name: "Pooja Iyer",        role: "Senior Technical Recruiter",       email: "p.iyer@flipkart.com",          linkedin: "https://linkedin.com/in/pooja-iyer-flipkart",         website: "https://flipkart.com",     domain: "flipkart.com",     confidence: 60, company: "Flipkart",     stage: "enterprise", location: "Bangalore", industries: ["ecommerce", "tech", "logistics"] },
  freshworks:  { name: "Vijay Subramaniam", role: "Recruiting Manager",               email: "v.subramaniam@freshworks.com", linkedin: "https://linkedin.com/in/vijay-subramaniam-freshworks", website: "https://freshworks.com",   domain: "freshworks.com",   confidence: 71, company: "Freshworks",   stage: "enterprise", location: "Chennai",   industries: ["saas", "crm", "b2b"] },
  zoho:        { name: "Meena Krishnan",    role: "Talent Acquisition",               email: "m.krishnan@zohocorp.com",      linkedin: "https://linkedin.com/in/meena-krishnan-zoho",         website: "https://zoho.com",         domain: "zohocorp.com",     confidence: 58, company: "Zoho",         stage: "enterprise", location: "Chennai",   industries: ["saas", "productivity", "b2b"] },
  browserstack:{ name: "Rahul Joshi",       role: "Technical Recruiter",              email: "r.joshi@browserstack.com",     linkedin: "https://linkedin.com/in/rahul-joshi-browserstack",    website: "https://browserstack.com", domain: "browserstack.com", confidence: 74, company: "BrowserStack", stage: "b-c",        location: "Mumbai",    industries: ["devtools", "testing", "saas"] },
  postman:     { name: "Aditya Verma",      role: "Senior Recruiter — Engineering",   email: "a.verma@postman.com",          linkedin: "https://linkedin.com/in/aditya-verma-postman",        website: "https://postman.com",      domain: "postman.com",      confidence: 73, company: "Postman",      stage: "late",       location: "Bangalore", industries: ["devtools", "api", "saas"] },
  darwinbox:   { name: "Riya Choudhary",    role: "Talent Acquisition Lead",          email: "r.choudhary@darwinbox.com",    linkedin: "https://linkedin.com/in/riya-choudhary-darwinbox",    website: "https://darwinbox.com",    domain: "darwinbox.com",    confidence: 67, company: "Darwinbox",    stage: "b-c",        location: "Hyderabad", industries: ["hrtech", "saas", "b2b"] },
  bharatpe:    { name: "Amit Saxena",       role: "Recruiting Lead",                  email: "a.saxena@bharatpe.com",        linkedin: "https://linkedin.com/in/amit-saxena-bharatpe",        website: "https://bharatpe.com",     domain: "bharatpe.com",     confidence: 61, company: "BharatPe",     stage: "b-c",        location: "Delhi",     industries: ["fintech", "payments", "merchant-tech"] },
  navi:        { name: "Shruti Bansal",     role: "Technical Recruiter",              email: "s.bansal@navi.com",            linkedin: "https://linkedin.com/in/shruti-bansal-navi",          website: "https://navi.com",         domain: "navi.com",         confidence: 63, company: "Navi",         stage: "b-c",        location: "Bangalore", industries: ["fintech", "insurance", "lending"] },
  sarvam:      { name: "Deepak Reddy",      role: "Head of Talent",                   email: "d.reddy@sarvam.ai",            linkedin: "https://linkedin.com/in/deepak-reddy-sarvam",         website: "https://sarvam.ai",        domain: "sarvam.ai",        confidence: 78, company: "Sarvam AI",    stage: "seed-a",     location: "Bangalore", industries: ["ai", "llm", "indic-languages"] },
  upgrad:      { name: "Pallavi Singh",     role: "Talent Acquisition Specialist",    email: "p.singh@upgrad.com",           linkedin: "https://linkedin.com/in/pallavi-singh-upgrad",        website: "https://upgrad.com",       domain: "upgrad.com",       confidence: 56, company: "upGrad",       stage: "late",       location: "Mumbai",    industries: ["edtech", "learning", "saas"] },
  unacademy:   { name: "Yash Agarwal",      role: "Senior Recruiter",                 email: "y.agarwal@unacademy.com",      linkedin: "https://linkedin.com/in/yash-agarwal-unacademy",      website: "https://unacademy.com",    domain: "unacademy.com",    confidence: 54, company: "Unacademy",    stage: "late",       location: "Bangalore", industries: ["edtech", "learning", "consumer"] },
  oyo:         { name: "Kavita Menon",      role: "Recruiting Manager",               email: "k.menon@oyorooms.com",         linkedin: "https://linkedin.com/in/kavita-menon-oyo",            website: "https://oyorooms.com",     domain: "oyorooms.com",     confidence: 52, company: "OYO",          stage: "late",       location: "Gurgaon",   industries: ["hospitality", "travel", "marketplace"] },
}

const roleToPool: Record<string, string[]> = {
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

function detectRoleCategory(role: string): string {
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

function industryMatches(companyIndustries: string[], seg: string): boolean {
  if (!seg?.trim()) return true
  const terms = seg.toLowerCase().split(/[,\s\/]+/).filter(Boolean)
  return terms.some((t) => companyIndustries.some((ci) => ci.includes(t) || t.includes(ci)))
}

function stageMatches(companyStage: string, filterStage: string): boolean {
  if (!filterStage || filterStage === "any") return true
  return companyStage === filterStage
}

function locationMatches(companyLocation: string, filterLocation: string): boolean {
  if (!filterLocation?.trim()) return true
  const terms = filterLocation.toLowerCase().split(/[,\s\/]+/).filter(Boolean)
  const loc = companyLocation.toLowerCase()
  return terms.some((t) => loc.includes(t) || t.includes(loc))
}

interface PoolParams {
  targetRole: string
  industry: string
  companyStage: string
  location: string
  preferredCompanies: string
}

function getCompanyPool({ targetRole, industry, companyStage, location, preferredCompanies }: PoolParams): CompanyMeta[] {
  if (preferredCompanies?.trim()) {
    const list = preferredCompanies.split(/[,;]+/).map((c) => c.trim()).filter(Boolean)
    return list.map((c) => {
      const key = c.toLowerCase().replace(/[\s\-\.]/g, "")
      return mockCompanies[key] ?? Object.values(mockCompanies).find(
        (co) => co.company.toLowerCase() === c.toLowerCase()
      ) ?? null
    }).filter((c): c is CompanyMeta => c !== null)
  }

  const category = detectRoleCategory(targetRole)
  const keys = roleToPool[category] ?? roleToPool.engineering
  const filtered = keys
    .map((k) => mockCompanies[k])
    .filter((c): c is CompanyMeta =>
      Boolean(c) &&
      industryMatches(c.industries, industry) &&
      stageMatches(c.stage, companyStage) &&
      locationMatches(c.location, location)
    )

  return filtered.length > 0
    ? filtered
    : keys.map((k) => mockCompanies[k]).filter((c): c is CompanyMeta => Boolean(c))
}

// ─── Hunter.io ────────────────────────────────────────────────────────────────

async function fetchHunterDomain(company: CompanyMeta, apiKey: string): Promise<Recruiter[]> {
  const url = `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(company.domain)}&department=hr&limit=10&api_key=${apiKey}`
  const res = await fetch(url)
  if (!res.ok) return []

  const data = await res.json() as { data?: { emails?: HunterEmail[] } }
  const emails = data.data?.emails ?? []

  return emails
    .filter((p) => isRecruiterTitle(p.position))
    .map((p): Recruiter => ({
      name: [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Unknown',
      role: p.position || 'Recruiter',
      email: p.value || 'Email not found',
      emailVerified: p.verification?.status === 'valid' || (p.confidence ?? 0) >= 90,
      linkedin: p.linkedin ?? null,
      website: company.website,
      company: company.company,
      confidence: p.confidence ?? 50,
      location: company.location,
    }))
}

async function searchHunter(companyPool: CompanyMeta[]): Promise<Recruiter[]> {
  const apiKey = process.env.HUNTER_API_KEY!
  const top = companyPool.slice(0, 5)
  const batches = await Promise.all(
    top.map((company) => fetchHunterDomain(company, apiKey).catch(() => [] as Recruiter[]))
  )
  return batches.flat().sort((a, b) => b.confidence - a.confidence)
}

// ─── Mock fallback ────────────────────────────────────────────────────────────

function getMockResults(pool: CompanyMeta[]): Recruiter[] {
  return [...pool].sort((a, b) => b.confidence - a.confidence)
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const body = await request.json() as PoolParams

  if (!body.targetRole) {
    return NextResponse.json({ error: 'Missing required field: targetRole' }, { status: 400 })
  }

  const companyPool = getCompanyPool(body)

  if (process.env.HUNTER_API_KEY) {
    try {
      const results = await searchHunter(companyPool)
      if (results.length > 0) return NextResponse.json(results)
      console.log('Hunter.io returned 0 recruiter results, using mock fallback')
    } catch (err) {
      console.error('Hunter.io error, falling back to mock:', err)
    }
  }

  return NextResponse.json(getMockResults(companyPool))
}
