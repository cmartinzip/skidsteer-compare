"use client"

import { X, GitCompareArrows } from "lucide-react"
import { Button } from "@/components/ui/button"
import { machines } from "@/lib/data"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface CompareBarProps {
  compareIds: string[]
  onRemove: (slug: string) => void
  onClear: () => void
}

export function CompareBar({ compareIds, onRemove, onClear }: CompareBarProps) {
  const router = useRouter()

  if (compareIds.length === 0) return null

  const selected = compareIds.map((id) => machines.find((m) => m.slug === id)).filter(Boolean)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-amber-500/30 bg-zinc-950/95 backdrop-blur-sm px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <GitCompareArrows className="size-4 text-amber-500 shrink-0" />
        <span className="text-sm font-medium text-muted-foreground shrink-0">
          Comparing ({compareIds.length}/3):
        </span>
        <div className="flex-1 flex items-center gap-2 flex-wrap">
          {selected.map((m) => m && (
            <span
              key={m.slug}
              className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-md px-2.5 py-1 text-sm font-medium"
            >
              {m.brand} {m.model}
              <button
                onClick={() => onRemove(m.slug)}
                className="text-amber-400/60 hover:text-amber-400 transition-colors"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
          {Array.from({ length: 3 - compareIds.length }).map((_, i) => (
            <span
              key={i}
              className="inline-flex items-center px-2.5 py-1 rounded-md border border-dashed border-border text-xs text-muted-foreground"
            >
              + Add machine
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground text-xs h-8"
          >
            Clear
          </Button>
          <Button
            size="sm"
            disabled={compareIds.length < 2}
            onClick={() => router.push(`/compare?ids=${compareIds.join(",")}`)}
            className={cn(
              "h-8 text-xs font-semibold",
              compareIds.length >= 2
                ? "bg-amber-500 hover:bg-amber-400 text-black"
                : "opacity-50 cursor-not-allowed"
            )}
          >
            Compare {compareIds.length >= 2 ? "Now" : `(need ${2 - compareIds.length} more)`}
          </Button>
        </div>
      </div>
    </div>
  )
}
