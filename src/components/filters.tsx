"use client"

import { parseAsArrayOf, parseAsString, parseAsInteger, useQueryState } from "nuqs"
import { brands, types, machines } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

const MIN_ROC = 0
const MAX_ROC = Math.max(...machines.map((m) => m.ratedOperatingCapacity))
const MIN_HP = 0
const MAX_HP = Math.max(...machines.map((m) => m.engineHp))

export function useFilters() {
  const [selectedBrands, setSelectedBrands] = useQueryState(
    "brands",
    parseAsArrayOf(parseAsString).withDefault([])
  )
  const [selectedType, setSelectedType] = useQueryState("type", parseAsString.withDefault(""))
  const [minRoc, setMinRoc] = useQueryState("minRoc", parseAsInteger.withDefault(MIN_ROC))
  const [maxRoc, setMaxRoc] = useQueryState("maxRoc", parseAsInteger.withDefault(MAX_ROC))
  const [minHp, setMinHp] = useQueryState("minHp", parseAsInteger.withDefault(MIN_HP))
  const [maxHp, setMaxHp] = useQueryState("maxHp", parseAsInteger.withDefault(MAX_HP))

  const resetAll = () => {
    setSelectedBrands([])
    setSelectedType("")
    setMinRoc(MIN_ROC)
    setMaxRoc(MAX_ROC)
    setMinHp(MIN_HP)
    setMaxHp(MAX_HP)
  }

  const hasFilters =
    selectedBrands.length > 0 ||
    selectedType !== "" ||
    minRoc !== MIN_ROC ||
    maxRoc !== MAX_ROC ||
    minHp !== MIN_HP ||
    maxHp !== MAX_HP

  return {
    selectedBrands, setSelectedBrands,
    selectedType, setSelectedType,
    minRoc, setMinRoc,
    maxRoc, setMaxRoc,
    minHp, setMinHp,
    maxHp, setMaxHp,
    resetAll, hasFilters,
    MIN_ROC, MAX_ROC, MIN_HP, MAX_HP,
  }
}

export function Filters() {
  const {
    selectedBrands, setSelectedBrands,
    selectedType, setSelectedType,
    minRoc, setMinRoc,
    maxRoc, setMaxRoc,
    minHp, setMinHp,
    maxHp, setMaxHp,
    resetAll, hasFilters,
    MIN_ROC, MAX_ROC, MIN_HP, MAX_HP,
  } = useFilters()

  const toggleBrand = (brand: string) => {
    setSelectedBrands(
      selectedBrands.includes(brand)
        ? selectedBrands.filter((b) => b !== brand)
        : [...selectedBrands, brand]
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Filters</h2>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={resetAll} className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground">
            <X className="size-3" /> Reset
          </Button>
        )}
      </div>

      {/* Type */}
      <div>
        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Type</p>
        <div className="flex flex-col gap-1.5">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(selectedType === t ? "" : t)}
              className={cn(
                "text-left text-sm px-3 py-1.5 rounded-md transition-colors border",
                selectedType === t
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              {t === "Compact Track Loader" ? "Compact Track Loader (CTL)" : "Skid Steer Loader (SSL)"}
            </button>
          ))}
        </div>
      </div>

      {/* Brand */}
      <div>
        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Brand</p>
        <div className="flex flex-wrap gap-1.5">
          {brands.map((brand) => (
            <Badge
              key={brand}
              variant="secondary"
              onClick={() => toggleBrand(brand)}
              className={cn(
                "cursor-pointer select-none transition-colors text-xs",
                selectedBrands.includes(brand)
                  ? "bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                  : "hover:bg-secondary/80"
              )}
            >
              {brand}
            </Badge>
          ))}
        </div>
      </div>

      {/* ROC Range */}
      <div>
        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
          Rated Operating Capacity
        </p>
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Min (lbs)</label>
              <input
                type="number"
                min={MIN_ROC}
                max={maxRoc}
                step={100}
                value={minRoc}
                onChange={(e) => setMinRoc(Number(e.target.value))}
                className="w-full mt-1 rounded-md border border-border bg-secondary px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Max (lbs)</label>
              <input
                type="number"
                min={minRoc}
                max={MAX_ROC}
                step={100}
                value={maxRoc}
                onChange={(e) => setMaxRoc(Number(e.target.value))}
                className="w-full mt-1 rounded-md border border-border bg-secondary px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* HP Range */}
      <div>
        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Engine HP</p>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground">Min</label>
            <input
              type="number"
              min={MIN_HP}
              max={maxHp}
              step={5}
              value={minHp}
              onChange={(e) => setMinHp(Number(e.target.value))}
              className="w-full mt-1 rounded-md border border-border bg-secondary px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-muted-foreground">Max</label>
            <input
              type="number"
              min={minHp}
              max={MAX_HP}
              step={5}
              value={maxHp}
              onChange={(e) => setMaxHp(Number(e.target.value))}
              className="w-full mt-1 rounded-md border border-border bg-secondary px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
