import { notFound } from "next/navigation"
import { machines, brands } from "@/lib/data"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, CheckCircle, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"

// Map URL slug → display brand name
const BRAND_SLUG_MAP: Record<string, string> = Object.fromEntries(
  brands.map((b) => [b.toLowerCase().replace(/\s+/g, "-"), b])
)

const AFTERMARKET_COLORS: Record<string, string> = {
  Wix:        "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Baldwin:    "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Donaldson:  "bg-red-500/10 text-red-400 border-red-500/20",
  Fleetguard: "bg-green-500/10 text-green-400 border-green-500/20",
  NAPA:       "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Fram:       "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
}

export function generateStaticParams() {
  return brands.map((b) => ({ brand: b.toLowerCase().replace(/\s+/g, "-") }))
}

export async function generateMetadata({ params }: { params: { brand: string } }): Promise<Metadata> {
  const brand = BRAND_SLUG_MAP[params.brand]
  if (!brand) return {}
  const machineCount = machines.filter((m) => m.brand === brand).length
  return {
    title: `${brand} Filter Cross Reference — All ${machineCount} Models`,
    description: `Complete filter cross reference for all ${brand} skid steers and compact track loaders. Find Wix, Baldwin, Donaldson, Fleetguard, and NAPA equivalents for every ${brand} model.`,
  }
}

export default async function BrandFiltersPage({ params }: { params: { brand: string } }) {
  const brand = BRAND_SLUG_MAP[params.brand]
  if (!brand) notFound()

  const brandMachines = machines.filter((m) => m.brand === brand)
  if (brandMachines.length === 0) notFound()

  // Fetch all parts for this brand with cross-references
  const { data: parts } = await supabase
    .from("parts")
    .select("*, part_types(id, label, sort_order)")
    .eq("brand", brand)
    .order("part_types(sort_order)")

  const partNumbers = parts?.map((p) => p.oem_part_number) ?? []

  const { data: crossRefs } = await supabase
    .from("cross_references")
    .select("*")
    .in("oem_part_number", partNumbers)
    .eq("oem_brand", brand)
    .order("aftermarket_brand")

  const crossRefMap = crossRefs?.reduce<Record<string, typeof crossRefs>>((acc, ref) => {
    if (!acc[ref.oem_part_number]) acc[ref.oem_part_number] = []
    acc[ref.oem_part_number].push(ref)
    return acc
  }, {}) ?? {}

  // Which machines use each part?
  const { data: machineParts } = await supabase
    .from("machine_parts")
    .select("part_id, machine_slug")
    .in("machine_slug", brandMachines.map((m) => m.slug))

  const partToMachines = machineParts?.reduce<Record<string, string[]>>((acc, mp) => {
    if (!acc[mp.part_id]) acc[mp.part_id] = []
    acc[mp.part_id].push(mp.machine_slug)
    return acc
  }, {}) ?? {}

  // Group parts by type
  type PartRow = NonNullable<typeof parts>[number]
  const byType = parts?.reduce<Record<string, PartRow[]>>((acc, p) => {
    const key = p.part_type_id
    if (!acc[key]) acc[key] = []
    acc[key].push(p)
    return acc
  }, {}) ?? {}

  const ssl = brandMachines.filter((m) => m.type === "Skid Steer")
  const ctl = brandMachines.filter((m) => m.type === "Compact Track Loader")

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <a
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="size-4" /> All Machines
      </a>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1">
          {brand} <span className="text-primary">Filter Cross Reference</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          OEM part numbers and aftermarket equivalents for all {brandMachines.length} {brand} models.
          Covers Wix, Baldwin, Donaldson, Fleetguard, and NAPA.
        </p>
      </div>

      {/* Machine index */}
      <div className="rounded-lg border border-border overflow-hidden mb-8">
        <div className="bg-card px-4 py-3 border-b border-border">
          <h2 className="font-semibold text-sm">Jump to a specific model</h2>
        </div>
        <div className="p-4 grid sm:grid-cols-2 gap-2">
          {ssl.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Skid Steers</p>
              {ssl.map((m) => (
                <a
                  key={m.slug}
                  href={`/filters/${m.slug}`}
                  className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-secondary/50 transition-colors group"
                >
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">{m.model}</span>
                  <ChevronRight className="size-3.5 text-muted-foreground" />
                </a>
              ))}
            </div>
          )}
          {ctl.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Compact Track Loaders</p>
              {ctl.map((m) => (
                <a
                  key={m.slug}
                  href={`/filters/${m.slug}`}
                  className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-secondary/50 transition-colors group"
                >
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">{m.model}</span>
                  <ChevronRight className="size-3.5 text-muted-foreground" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cross-reference table by filter type */}
      {Object.keys(byType).length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          Filter data for {brand} coming soon.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byType).map(([typeId, typeParts]) => {
            const typeLabel = (typeParts[0].part_types as { label: string } | null)?.label ?? typeId
            return (
              <div key={typeId} className="rounded-lg border border-border overflow-hidden">
                <div className="bg-card px-4 py-3 border-b border-border">
                  <h2 className="font-semibold text-sm">{typeLabel}</h2>
                </div>

                {typeParts.map((part) => {
                  const refs = crossRefMap[part.oem_part_number] ?? []
                  const fittingSlugs = partToMachines[part.id] ?? []
                  const fittingModels = brandMachines.filter((m) => fittingSlugs.includes(m.slug))

                  return (
                    <div key={part.id} className="px-4 py-4 border-b border-border last:border-b-0">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                        <div>
                          <code className="text-base font-bold font-mono text-foreground">{part.oem_part_number}</code>
                          {part.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{part.description}</p>
                          )}
                        </div>
                        {fittingModels.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {fittingModels.map((m) => (
                              <a key={m.slug} href={`/filters/${m.slug}`}>
                                <Badge
                                  variant="secondary"
                                  className="text-xs cursor-pointer hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/20 transition-colors"
                                >
                                  {m.model}
                                </Badge>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>

                      {refs.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {refs.map((ref) => (
                            <a
                              key={ref.id}
                              href={`/parts/${encodeURIComponent(ref.aftermarket_part_number)}`}
                              className={cn(
                                "rounded-md border px-3 py-2 flex items-center gap-2 transition-opacity hover:opacity-80",
                                AFTERMARKET_COLORS[ref.aftermarket_brand] ?? "bg-zinc-700/30 text-zinc-300 border-zinc-600/30"
                              )}
                              title={ref.notes}
                            >
                              {ref.verified && <CheckCircle className="size-3 shrink-0" />}
                              <div>
                                <div className="text-xs font-semibold">{ref.aftermarket_brand}</div>
                                <code className="text-xs font-mono">{ref.aftermarket_part_number}</code>
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}

      {/* Cross-brand insight box */}
      <div className="mt-8 rounded-lg border border-border bg-card p-5">
        <h2 className="font-semibold text-sm mb-2">Cross-Brand Filter Compatibility</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Many aftermarket filters (Baldwin BF7959-D, Donaldson P551105, Wix WIX57035) fit multiple OEM brands
          because they share the same engine platforms — Yanmar, FPT, and Kubota diesels power machines
          across {brand} and other manufacturers. Always verify thread pitch and bypass valve specs before installing.
        </p>
      </div>
    </div>
  )
}
