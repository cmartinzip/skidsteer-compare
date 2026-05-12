"use client"

/**
 * AffiliateBuyButton — ready to activate.
 *
 * To turn on:
 *   1. Import this component in filters/[slug]/page.tsx and parts/[partNumber]/page.tsx
 *   2. Pass affiliateLinks fetched from Supabase affiliate_links table
 *   3. Set NEXT_PUBLIC_AFFILIATE_ENABLED=true in .env.local + Vercel env vars
 *
 * Nothing renders until NEXT_PUBLIC_AFFILIATE_ENABLED is "true".
 */

import { ShoppingCart, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AffiliateLink {
  part_number: string
  brand: string
  retailer: string
  url: string
  asin: string | null
  affiliate_tag: string | null
}

interface AffiliateBuyButtonProps {
  link: AffiliateLink
  size?: "sm" | "md"
  className?: string
}

const ENABLED = process.env.NEXT_PUBLIC_AFFILIATE_ENABLED === "true"

export function AffiliateBuyButton({ link, size = "md", className }: AffiliateBuyButtonProps) {
  if (!ENABLED) return null

  const affiliateUrl = link.asin && link.affiliate_tag
    ? `https://www.amazon.com/dp/${link.asin}?tag=${link.affiliate_tag}`
    : link.url

  return (
    <a
      href={affiliateUrl}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-md transition-colors",
        "bg-amber-500 hover:bg-amber-400 text-black",
        size === "sm"
          ? "text-xs px-2.5 py-1.5"
          : "text-sm px-3.5 py-2",
        className
      )}
      onClick={() => {
        // Fire analytics event when affiliate enabled
        if (typeof window !== "undefined" && "gtag" in window) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(window as any).gtag("event", "affiliate_click", {
            part_number: link.part_number,
            brand: link.brand,
            retailer: link.retailer,
            asin: link.asin,
          })
        }
      }}
    >
      <ShoppingCart className={cn(size === "sm" ? "size-3" : "size-3.5")} />
      Buy on Amazon
      <ExternalLink className={cn(size === "sm" ? "size-2.5" : "size-3", "opacity-60")} />
    </a>
  )
}

/**
 * AffiliateBuyButtonGroup — renders Buy buttons for all retailers for a given part number.
 * Drop this next to any cross-reference row when ready to activate.
 *
 * Usage:
 *   <AffiliateBuyButtonGroup partNumber="WIX57035" links={affiliateLinks} />
 */
interface AffiliateBuyButtonGroupProps {
  partNumber: string
  links: AffiliateLink[]
  size?: "sm" | "md"
}

export function AffiliateBuyButtonGroup({ partNumber, links, size = "sm" }: AffiliateBuyButtonGroupProps) {
  if (!ENABLED) return null

  const matched = links.filter(
    (l) => l.part_number.toLowerCase() === partNumber.toLowerCase()
  )
  if (matched.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {matched.map((link) => (
        <AffiliateBuyButton key={`${link.retailer}-${link.part_number}`} link={link} size={size} />
      ))}
    </div>
  )
}
