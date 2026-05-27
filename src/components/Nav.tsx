'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Nav() {
  const pathname = usePathname()

  const links = [
    { href: '/',         label: 'Outreach' },
    { href: '/pipeline', label: 'Pipeline' },
  ]

  return (
    <nav className="border-b border-[#2a2a2a] bg-[#0f0f0f] sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-green-400 font-bold text-sm tracking-tight">JSP</span>
          <div className="flex items-center gap-1">
            {links.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    active
                      ? 'bg-[#1a1a1a] text-[#e5e5e5] border border-[#2a2a2a]'
                      : 'text-[#666] hover:text-[#aaa]'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
