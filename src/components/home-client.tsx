"use client"

import { useState, useMemo } from "react"
import { machines } from "@/lib/data"
import { Filters, useFilters } from "@/components/filters"
import { MachineTable } from "@/components/machine-table"
import { CompareBar } from "@/components/compare-bar"

export function HomeClient() {
  const [compareIds, setCompareIds] = useState<string[]>([])
  const {
    selectedBrands,
    selectedType,
    minRoc, maxRoc,
    minHp, maxHp,
  } = useFilters()

  const filtered = useMemo(() => {
    return machines.filter((m) => {
      if (selectedBrands.length > 0 && !selectedBrands.includes(m.brand)) return false
      if (selectedType && m.type !== selectedType) return false
      if (m.ratedOperatingCapacity < minRoc || m.ratedOperatingCapacity > maxRoc) return false
      if (m.engineHp < minHp || m.engineHp > maxHp) return false
      return true
    })
  }, [selectedBrands, selectedType, minRoc, maxRoc, minHp, maxHp])

  const toggleCompare = (slug: string) => {
    setCompareIds((prev) =>
      prev.includes(slug) ? prev.filter((id) => id !== slug) : [...prev, slug].slice(0, 3)
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1">
          Skid Steer <span className="text-primary">Comparison</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          Compare {machines.length} machines across {new Set(machines.map((m) => m.brand)).size} brands.
          Select up to 3 to compare side-by-side.
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className="w-56 shrink-0 hidden lg:block">
          <div className="sticky top-20">
            <Filters />
          </div>
        </aside>

        {/* Table */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">
              {filtered.length} machine{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
          <MachineTable
            data={filtered}
            compareIds={compareIds}
            onToggleCompare={toggleCompare}
          />
        </div>
      </div>

      <CompareBar
        compareIds={compareIds}
        onRemove={(slug) => setCompareIds((p) => p.filter((id) => id !== slug))}
        onClear={() => setCompareIds([])}
      />
    </div>
  )
}
