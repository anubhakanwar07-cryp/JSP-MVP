import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: 'JSP - Job Search Platform',
  description: 'Recruiter outreach workflow for candidates',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0f0f0f] text-[#e5e5e5] min-h-screen antialiased">
        <Nav />
        {children}
      </body>
    </html>
  )
}
