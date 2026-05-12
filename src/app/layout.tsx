import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "SkidSteer Compare — Find Your Machine",
  description: "Compare skid steers and compact track loaders by specs, capacity, and price.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="border-b border-border sticky top-0 z-50 bg-background/90 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
              <span className="text-primary">⬛</span>
              <span>SkidSteer<span className="text-primary">Compare</span></span>
            </a>
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="/" className="hover:text-foreground transition-colors">Compare</a>
              <a href="/brands/bobcat/filters" className="hover:text-foreground transition-colors">Filters</a>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} SkidSteerCompare · Specs are approximate — verify with dealer
        </footer>
      </body>
    </html>
  )
}
