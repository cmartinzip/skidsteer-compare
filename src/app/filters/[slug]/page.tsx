import { notFound } from "next/navigation"
import { machines } from "@/lib/data"
import { supabase } from "@/lib/supabase"
import type { MachinePart, CrossReference } from "@/lib/supabase"
import { ArrowLeft, CheckCircle, Circle, ShoppingCart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"

export function generateStaticParams() {
  return machines.map((m) => ({ slug: m.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const machine = machines.find((m) => m.slug === params.slug)
  if (!machine) return {}
  return {
    title: `${machine.brand} ${machine.model} Filter Cross Reference — OEM & Aftermarket`,
    description: `Complete filter cross reference for the ${machine.brand} ${machine.model}. Find Wix, Baldwin, Donaldson, Fleetguard, and NAPA equivalents for oil, hydraulic, air, and fuel filters.`,
  }
}

const AFTERMARKET_COLORS: Record<string, string> = {
  Wix:        "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Baldwin:    "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Donaldson:  "bg-red-500/10 text-red-400 border-red-500/20",
  Fleetguard: "bg-green-500/10 text-green-400 border-green-500/20",
  NAPA:       "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Fram:       "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Purolator:  "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
}

export default async function FiltersPage({ params }: { params: { slug: string } }) {
  const machine = machines.find((m) => m.slug === params.slug)
  if (!machine) notFound()

  // Fetch all parts for this machine with their cross-references
  const { data: machineParts } = await supabase
    .from("machine_parts")
    .select(`
      part_id, quantity, notes,
      parts (
        id, oem_part_number, brand, part_type_id, description, notes, superseded_by,
        part_types ( id, label, description, sort_order )
      )
    `)
    .eq("machine_slug", params.slug)
    .order("parts(part_types(sort_order))")

  const partIds = (machineParts as MachinePart[] | null)?.map((mp) => mp.parts.oem_part_number) ?? []

  const { data: crossRefs } = await supabase
    .from("cross_references")
    .select("*")
    .in("oem_part_number", partIds)
    .eq("oem_brand", machine.brand)
    .order("aftermarket_brand")

  const crossRefMap = (crossRefs as CrossReference[] | null)?.reduce<Record<string, CrossReference[]>>((acc, ref) => {
    if (!acc[ref.oem_part_number]) acc[ref.oem_part_number] = []
    acc[ref.oem_part_number].push(ref)
    return acc
  }, {}) ?? {}

  // Group parts by type
  const partsByType = (machineParts as MachinePart[] | null)?.reduce<Record<string, MachinePart[]>>((acc, mp) => {
    const typeId = mp.parts.part_type_id
    if (!acc[typeId]) acc[typeId] = []
    acc[typeId].push(mp)
    return acc
  }, {}) ?? {}

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <a
        href={`/models/${machine.slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="size-4" /> {machine.brand} {machine.model}
      </a>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="secondary" className="text-xs text-muted-foreground">{machine.brand}</Badge>
          <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/20">
            {machine.type === "Compact Track Loader" ? "CTL" : "SSL"}
          </Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">
          {machine.brand} {machine.model} <span className="text-primary">Filter Cross Reference</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          OEM part numbers and aftermarket equivalents (Wix, Baldwin, Donaldson, Fleetguard, NAPA) for the {machine.model}.
        </p>
      </div>

      {Object.keys(partsByType).length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>Filter data for this model coming soon.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(partsByType).map(([typeId, mps]) => {
            const typeLabel = mps[0].parts.part_types?.label ?? typeId
            return (
              <div key={typeId} className="rounded-lg border border-border overflow-hidden">
                <div className="bg-card px-4 py-3 border-b border-border">
                  <h2 className="font-semibold text-sm">{typeLabel}</h2>
                </div>

                {mps.map((mp) => {
                  const part = mp.parts
                  const refs = crossRefMap[part.oem_part_number] ?? []
                  return (
                    <div key={part.id} className="px-4 py-4 border-b border-border last:border-b-0">
                      {/* OEM row */}
                      <div className="flex flex-wrap items-start gap-3 mb-3">
                        <div>
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">OEM</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <code className="text-base font-bold text-foreground font-mono">{part.oem_part_number}</code>
                            <Badge variant="secondary" className="text-xs text-muted-foreground">{part.brand}</Badge>
                            {part.superseded_by && (
                              <Badge variant="secondary" className="text-xs text-orange-400 border-orange-500/20 bg-orange-500/10">
                                Superseded → {part.superseded_by}
                              </Badge>
                            )}
                          </div>
                          {part.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{part.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Cross-reference grid */}
                      {refs.length > 0 ? (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Aftermarket Equivalents</p>
                          <div className="flex flex-wrap gap-2">
                            {refs.map((ref) => (
                              <div
                                key={ref.id}
                                className={cn(
                                  "rounded-md border px-3 py-2 flex items-center gap-2",
                                  AFTERMARKET_COLORS[ref.aftermarket_brand] ?? "bg-zinc-700/30 text-zinc-300 border-zinc-600/30"
                                )}
                                title={ref.notes}
                              >
                                {ref.verified
                                  ? <CheckCircle className="size-3 shrink-0" />
                                  : <Circle className="size-3 shrink-0 opacity-50" />
                                }
                                <div>
                                  <div className="text-xs font-semibold">{ref.aftermarket_brand}</div>
                                  <code className="text-xs font-mono">{ref.aftermarket_part_number}</code>
                                </div>
                              </div>
                            ))}
                          </div>
                          {refs.some((r) => !r.verified) && (
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                              <Circle className="size-3" /> Unverified — confirm fitment before ordering
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Cross-references for this part coming soon.</p>
                      )}

                      {part.notes && (
                        <p className="text-xs text-muted-foreground mt-2 italic">{part.notes}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}

      {/* Related links */}
      <div className="mt-10 pt-8 border-t border-border">
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Related</h2>
        <div className="flex flex-wrap gap-3">
          <a href={`/models/${machine.slug}`} className="text-sm text-primary hover:underline">
            {machine.brand} {machine.model} Specs
          </a>
          <a href={`/brands/${machine.brand.toLowerCase().replace(/\s+/g, '-')}/filters`} className="text-sm text-primary hover:underline">
            All {machine.brand} Filter Cross References
          </a>
          <a href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← All Machines
          </a>
        </div>
      </div>
    </div>
  )
}
