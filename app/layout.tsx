'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import "./globals.css"

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      style={{
        padding: "10px 16px",
        borderRadius: 8,
        textDecoration: "none",
        fontWeight: 500,
        background: isActive ? "#000" : "#eee",
        color: isActive ? "white" : "black"
      }}
    >
      {label}
    </Link>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body>
        <div
          style={{
            display: "flex",
            gap: 12,
            padding: 16,
            borderBottom: "1px solid #ddd",
            position: "sticky",
            top: 0,
            background: "white",
            zIndex: 100
          }}
        >
          <NavLink href="/recipes" label="Ricette" />
          <NavLink href="/ingredients" label="Ingredienti" />
        </div>

        <div>{children}</div>
      </body>
    </html>
  )
}