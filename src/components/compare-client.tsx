"use client"

import { parseAsString, useQueryState } from "nuqs"
import { machines } from "@/lib/data"
import { ArrowLeft, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const SPEC_ROWS = [
  { key: "type", label: "Type" },
  { key: "liftPath", label: "Lift Path" },
  { key: "ratedOperatingCapacity", label: "Rated Operating Capacity", unit: "lbs" },
  { key: "tippingLoad", label: "Tipping Load", unit: "lbs" },
  { key: "engineHp", label: "Engine HP", unit: "HP" },
  { key: "operatingWeight", label: "Operating Weight", unit: "lbs" },
  { key: "bucketWidth", label: "Bucket Width", unit: '"' },
  { key: "travelSpeed", label: "Travel Speed", unit: "mph" },
  { key: "hydraulicFlow", label: "Hydraulic Flow", unit: "gpm" },
  { key: "priceRange", label: "Price Range" },
] as const

function getBest(key: string, machines: typeof import("@/lib/data").machines): Record<string, boolean> {
  const numericKeys = ["ratedOperatingCapacity", "tippingLoad", "engineHp", "hydraulicFlow", "travelSpeed"]
  if (!numericKeys.includes(key)) return {}
  const values = machines.map((m) => (m as unknown as Record<string, unknown>)[key] as number)
  const max = Math.max(...values)
  return Object.fromEntries(machines.map((m) => [m.slug, (m as unknown as Record<string, unknown>)[key] === max]))
}

export function CompareClient() {
  const [idsParam] = useQueryState("ids", parseAsString.withDefault(""))

  const ids = idsParam ? idsParam.split(",").filter(Boolean) : []
  const selected = ids.map((id) => machines.find((m) => m.slug === id)).filter(Boolean)

  if (selected.length < 2) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4">Select at least 2 machines to compare.</p>
        <a href="/" className="text-primary hover:underline">← Back to all machines</a>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <a
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="size-4" /> All Machines
      </a>

      <h1 className="text-2xl font-bold tracking-tight mb-8">
        Side-by-Side <span className="text-primary">Comparison</span>
      </h1>

      <div className="rounded-lg border border-border overflow-hidden">
        {/* Machine headers */}
        <div
          className="grid bg-card border-b border-border"
          style={{ gridTemplateColumns: `200px repeat(${selected.length}, 1fr)` }}
        >
          <div className="p-4 border-r border-border" />
          {selected.map((m) => m && (
            <div key={m.slug} className="p-4 border-r border-border last:border-r-0">
              <div className="text-xs text-muted-foreground mb-0.5">{m.brand}</div>
              <a
                href={`/models/${m.slug}`}
                className="font-bold text-lg hover:text-primary transition-colors"
              >
                {m.model}
              </a>
            </div>
          ))}
        </div>

        {/* Spec rows */}
        {SPEC_ROWS.map((row, i) => {
          const best = getBest(row.key, selected as typeof machines)
          return (
            <div
              key={row.key}
              className={cn(
                "grid border-b border-border last:border-b-0",
                i % 2 === 0 ? "bg-background" : "bg-card"
              )}
              style={{ gridTemplateColumns: `200px repeat(${selected.length}, 1fr)` }}
            >
              <div className="p-4 border-r border-border text-sm text-muted-foreground font-medium">
                {row.label}
              </div>
              {selected.map((m) => {
                if (!m) return null
                const raw = (m as unknown as Record<string, unknown>)[row.key]
                const isBest = best[m.slug]
                const display =
                  typeof raw === "number"
                    ? row.key === "travelSpeed" || row.key === "hydraulicFlow"
                      ? raw.toFixed(1)
                      : raw.toLocaleString()
                    : String(raw)
                const withUnit = "unit" in row ? `${display}${row.unit === "lbs" || row.unit === "HP" || row.unit === "mph" || row.unit === "gpm" ? " " : ""}${row.unit}` : display

                return (
                  <div
                    key={m.slug}
                    className={cn(
                      "p-4 border-r border-border last:border-r-0 flex items-center gap-2",
                      isBest && "bg-amber-500/5"
                    )}
                  >
                    <span className={cn("text-sm font-medium", isBest ? "text-amber-400" : "text-foreground")}>
                      {withUnit}
                    </span>
                    {isBest && <Check className="size-3.5 text-amber-500" />}
                  </div>
                )
              })}
            </div>
          )
        })}

        {/* Highlights */}
        <div
          className="grid bg-card border-t border-border"
          style={{ gridTemplateColumns: `200px repeat(${selected.length}, 1fr)` }}
        >
          <div className="p-4 border-r border-border text-sm text-muted-foreground font-medium">
            Highlights
          </div>
          {selected.map((m) => m && (
            <div key={m.slug} className="p-4 border-r border-border last:border-r-0">
              <ul className="space-y-1">
                {m.highlights.map((h) => (
                  <li key={h} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="text-amber-500 mt-0.5">✓</span> {h}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
