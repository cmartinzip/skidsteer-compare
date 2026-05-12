import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, CheckCircle, Circle, Wrench } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"

const AFTERMARKET_COLORS: Record<string, string> = {
  Wix:        "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Baldwin:    "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Donaldson:  "bg-red-500/10 text-red-400 border-red-500/20",
  Fleetguard: "bg-green-500/10 text-green-400 border-green-500/20",
  NAPA:       "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Fram:       "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Purolator:  "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
}

export async function generateMetadata({ params }: { params: { partNumber: string } }): Promise<Metadata> {
  const num = decodeURIComponent(params.partNumber)
  const { data: part } = await supabase
    .from("parts")
    .select("oem_part_number, brand, description, part_types(label)")
    .eq("oem_part_number", num)
    .single()

  if (!part) return { title: `${num} Cross Reference` }
  return {
    title: `${num} Cross Reference — ${part.brand} ${(part.part_types as unknown as { label: string } | null)?.label ?? "Filter"} Equivalents`,
    description: `Find aftermarket cross references for ${part.brand} part ${num}. Wix, Baldwin, Donaldson, Fleetguard, and NAPA equivalents with fitment notes.`,
  }
}

export default async function PartPage({ params }: { params: { partNumber: string } }) {
  const partNumber = decodeURIComponent(params.partNumber)

  const { data: parts } = await supabase
    .from("parts")
    .select("*, part_types(id, label, description, sort_order)")
    .eq("oem_part_number", partNumber)

  if (!parts || parts.length === 0) notFound()

  const part = parts[0]
  const partType = part.part_types as { id: string; label: string; description: string } | null

  const { data: crossRefs } = await supabase
    .from("cross_references")
    .select("*")
    .eq("oem_part_number", partNumber)
    .order("aftermarket_brand")

  // Find which machines use this part
  const { data: machineParts } = await supabase
    .from("machine_parts")
    .select("machine_slug, machines(slug, brand, model, type)")
    .eq("part_id", part.id)

  const fitsOn = machineParts?.map((mp) => mp.machines).filter(Boolean) as
    | { slug: string; brand: string; model: string; type: string }[]
    | undefined

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <a
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="size-4" /> All Machines
      </a>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-xs text-muted-foreground">{part.brand}</Badge>
          {partType && (
            <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/20">
              {partType.label}
            </Badge>
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight font-mono mb-1">
          {partNumber}
        </h1>
        <p className="text-muted-foreground">{part.description}</p>
        {part.superseded_by && (
          <div className="mt-2 inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-400">
            ⚠ Superseded by <code className="font-mono font-bold">{part.superseded_by}</code>
          </div>
        )}
      </div>

      {/* Cross-references */}
      <div className="rounded-lg border border-border overflow-hidden mb-8">
        <div className="bg-card px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-sm">Aftermarket Cross References</h2>
          <span className="text-xs text-muted-foreground">{crossRefs?.length ?? 0} equivalents</span>
        </div>

        {!crossRefs || crossRefs.length === 0 ? (
          <div className="px-4 py-8 text-center text-muted-foreground text-sm">
            Cross-references for this part coming soon.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {crossRefs.map((ref) => (
              <div key={ref.id} className="px-4 py-3 flex items-center gap-4">
                <div className={cn(
                  "rounded-md border px-3 py-1.5 flex items-center gap-2 min-w-[140px]",
                  AFTERMARKET_COLORS[ref.aftermarket_brand] ?? "bg-zinc-700/30 text-zinc-300 border-zinc-600/30"
                )}>
                  <span className="text-xs font-semibold">{ref.aftermarket_brand}</span>
                </div>
                <code className="font-mono font-bold text-foreground">{ref.aftermarket_part_number}</code>
                <div className="flex items-center gap-1.5 ml-auto">
                  {ref.verified
                    ? <><CheckCircle className="size-3.5 text-green-500" /><span className="text-xs text-green-500">Verified</span></>
                    : <><Circle className="size-3.5 text-muted-foreground" /><span className="text-xs text-muted-foreground">Unverified</span></>
                  }
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fits on */}
      {fitsOn && fitsOn.length > 0 && (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="bg-card px-4 py-3 border-b border-border flex items-center gap-2">
            <Wrench className="size-4 text-muted-foreground" />
            <h2 className="font-semibold text-sm">Fits These Machines</h2>
          </div>
          <div className="divide-y divide-border">
            {fitsOn.map((m) => (
              <a
                key={m.slug}
                href={`/filters/${m.slug}`}
                className="px-4 py-3 flex items-center justify-between hover:bg-secondary/50 transition-colors"
              >
                <div>
                  <span className="text-xs text-muted-foreground">{m.brand}</span>
                  <div className="font-semibold text-sm">{m.model}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={cn("text-xs", m.type === "Compact Track Loader"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-zinc-700/50 text-zinc-300 border-zinc-600/30"
                    )}
                  >
                    {m.type === "Compact Track Loader" ? "CTL" : "SSL"}
                  </Badge>
                  <span className="text-xs text-primary">View all filters →</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
