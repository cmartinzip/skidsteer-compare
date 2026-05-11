import { notFound } from "next/navigation"
import { machines } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Gauge, Weight, Zap, Droplets, Ruler, Rocket } from "lucide-react"
import type { Metadata } from "next"

export function generateStaticParams() {
  return machines.map((m) => ({ slug: m.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const m = machines.find((m) => m.slug === params.slug)
  if (!m) return {}
  return {
    title: `${m.brand} ${m.model} Specs & Review — SkidSteerCompare`,
    description: m.description,
  }
}

interface StatProps {
  icon: React.ReactNode
  label: string
  value: string
  highlight?: boolean
}

function Stat({ icon, label, value, highlight }: StatProps) {
  return (
    <div className={`rounded-lg border p-4 flex flex-col gap-2 ${highlight ? "border-amber-500/30 bg-amber-500/5" : "border-border bg-card"}`}>
      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <div className={`text-2xl font-bold tabular-nums ${highlight ? "text-amber-400" : "text-foreground"}`}>
        {value}
      </div>
    </div>
  )
}

export default function ModelPage({ params }: { params: { slug: string } }) {
  const machine = machines.find((m) => m.slug === params.slug)
  if (!machine) notFound()

  const similar = machines
    .filter((m) => m.slug !== machine.slug && m.type === machine.type && m.brand !== machine.brand)
    .slice(0, 3)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <a
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="size-4" /> All Machines
      </a>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-xs text-muted-foreground">
              {machine.brand}
            </Badge>
            <Badge
              variant="secondary"
              className={
                machine.type === "Compact Track Loader"
                  ? "text-xs bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "text-xs bg-zinc-700/50 text-zinc-300 border-zinc-600/30"
              }
            >
              {machine.type === "Compact Track Loader" ? "CTL" : "SSL"}
            </Badge>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            {machine.brand} {machine.model}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl">{machine.description}</p>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Price Range</div>
          <div className="text-2xl font-bold text-primary">{machine.priceRange}</div>
        </div>
      </div>

      {/* Highlights */}
      <div className="flex flex-wrap gap-2 mb-8">
        {machine.highlights.map((h) => (
          <span
            key={h}
            className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full bg-secondary border border-border text-muted-foreground"
          >
            ✓ {h}
          </span>
        ))}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
        <Stat
          icon={<Gauge className="size-3.5" />}
          label="Rated Operating Capacity"
          value={`${machine.ratedOperatingCapacity.toLocaleString()} lbs`}
          highlight
        />
        <Stat
          icon={<Weight className="size-3.5" />}
          label="Tipping Load"
          value={`${machine.tippingLoad.toLocaleString()} lbs`}
        />
        <Stat
          icon={<Zap className="size-3.5" />}
          label="Engine Horsepower"
          value={`${machine.engineHp} HP`}
          highlight
        />
        <Stat
          icon={<Weight className="size-3.5" />}
          label="Operating Weight"
          value={`${machine.operatingWeight.toLocaleString()} lbs`}
        />
        <Stat
          icon={<Rocket className="size-3.5" />}
          label="Travel Speed"
          value={`${machine.travelSpeed} mph`}
        />
        <Stat
          icon={<Droplets className="size-3.5" />}
          label="Hydraulic Flow"
          value={`${machine.hydraulicFlow} gpm`}
        />
        <Stat
          icon={<Ruler className="size-3.5" />}
          label="Bucket Width"
          value={`${machine.bucketWidth}"`}
        />
      </div>

      {/* Similar machines */}
      {similar.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Similar Machines</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {similar.map((m) => (
              <a
                key={m.slug}
                href={`/models/${m.slug}`}
                className="rounded-lg border border-border bg-card p-4 hover:border-amber-500/30 transition-colors group"
              >
                <div className="text-xs text-muted-foreground mb-0.5">{m.brand}</div>
                <div className="font-semibold group-hover:text-primary transition-colors">{m.model}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {m.ratedOperatingCapacity.toLocaleString()} lbs ROC · {m.engineHp} HP
                </div>
                <div className="text-xs text-primary mt-2">{m.priceRange}</div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
