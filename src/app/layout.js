import "./globals.css"

export const metadata = {
  title: "JSP - Job Search Platform",
  description: "Recruiter outreach workflow for candidates",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          backgroundColor: "#0f0f0f",
          color: "#e5e5e5",
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          minHeight: "100vh",
        }}
      >
        {children}
      </body>
    </html>
  )
}
