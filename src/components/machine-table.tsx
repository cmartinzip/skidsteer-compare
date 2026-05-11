"use client"

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowUpDown, ArrowUp, ArrowDown, GitCompareArrows } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { SkidSteer } from "@/lib/data"

interface MachineTableProps {
  data: SkidSteer[]
  compareIds: string[]
  onToggleCompare: (slug: string) => void
}

const columns: ColumnDef<SkidSteer>[] = [
  {
    id: "compare",
    header: "",
    cell: () => null, // rendered manually below
    enableSorting: false,
  },
  {
    accessorKey: "brand",
    header: "Brand",
    cell: ({ row }) => (
      <span className="font-medium text-foreground">{row.original.brand}</span>
    ),
  },
  {
    accessorKey: "model",
    header: "Model",
    cell: ({ row }) => (
      <a
        href={`/models/${row.original.slug}`}
        className="font-semibold text-primary hover:underline"
      >
        {row.original.model}
      </a>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge
        variant="secondary"
        className={cn(
          "text-xs whitespace-nowrap",
          row.original.type === "Compact Track Loader"
            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
            : "bg-zinc-700/50 text-zinc-300 border-zinc-600/30"
        )}
      >
        {row.original.type === "Compact Track Loader" ? "CTL" : "SSL"}
      </Badge>
    ),
  },
  {
    accessorKey: "ratedOperatingCapacity",
    header: ({ column }) => (
      <SortHeader label="ROC (lbs)" column={column} />
    ),
    cell: ({ getValue }) => <NumCell value={getValue() as number} />,
  },
  {
    accessorKey: "tippingLoad",
    header: ({ column }) => (
      <SortHeader label="Tip Load (lbs)" column={column} />
    ),
    cell: ({ getValue }) => <NumCell value={getValue() as number} />,
  },
  {
    accessorKey: "engineHp",
    header: ({ column }) => (
      <SortHeader label="HP" column={column} />
    ),
    cell: ({ getValue }) => <NumCell value={getValue() as number} />,
  },
  {
    accessorKey: "operatingWeight",
    header: ({ column }) => (
      <SortHeader label="Weight (lbs)" column={column} />
    ),
    cell: ({ getValue }) => <NumCell value={getValue() as number} />,
  },
  {
    accessorKey: "travelSpeed",
    header: ({ column }) => (
      <SortHeader label="Speed (mph)" column={column} />
    ),
    cell: ({ getValue }) => (
      <span className="tabular-nums text-muted-foreground">{(getValue() as number).toFixed(1)}</span>
    ),
  },
  {
    accessorKey: "hydraulicFlow",
    header: ({ column }) => (
      <SortHeader label="Hyd Flow (gpm)" column={column} />
    ),
    cell: ({ getValue }) => (
      <span className="tabular-nums text-muted-foreground">{(getValue() as number).toFixed(1)}</span>
    ),
  },
  {
    accessorKey: "priceRange",
    header: "Price Range",
    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground whitespace-nowrap">{getValue() as string}</span>
    ),
    enableSorting: false,
  },
]

function SortHeader({
  label,
  column,
}: {
  label: string
  column: { toggleSorting: (desc?: boolean) => void; getIsSorted: () => false | "asc" | "desc" }
}) {
  const sorted = column.getIsSorted()
  return (
    <button
      className="flex items-center gap-1 hover:text-foreground transition-colors whitespace-nowrap"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {label}
      {sorted === "asc" ? (
        <ArrowUp className="size-3" />
      ) : sorted === "desc" ? (
        <ArrowDown className="size-3" />
      ) : (
        <ArrowUpDown className="size-3 opacity-40" />
      )}
    </button>
  )
}

function NumCell({ value }: { value: number }) {
  return (
    <span className="tabular-nums text-muted-foreground">
      {value.toLocaleString()}
    </span>
  )
}

export function MachineTable({ data, compareIds, onToggleCompare }: MachineTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const router = useRouter()

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="border-border bg-card hover:bg-card">
              {hg.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-muted-foreground text-xs uppercase tracking-wider h-10"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-12 text-muted-foreground">
                No machines match your filters.
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => {
              const isSelected = compareIds.includes(row.original.slug)
              const isDisabled = compareIds.length >= 3 && !isSelected
              return (
                <TableRow
                  key={row.id}
                  className={cn(
                    "border-border cursor-pointer transition-colors",
                    isSelected && "bg-amber-500/5 border-l-2 border-l-amber-500"
                  )}
                  onClick={() => router.push(`/models/${row.original.slug}`)}
                >
                  <TableCell
                    onClick={(e) => e.stopPropagation()}
                    className="w-10 pl-3"
                  >
                    <button
                      title={isSelected ? "Remove from compare" : "Add to compare"}
                      disabled={isDisabled}
                      onClick={() => onToggleCompare(row.original.slug)}
                      className={cn(
                        "size-6 rounded flex items-center justify-center transition-colors border",
                        isSelected
                          ? "bg-amber-500 border-amber-500 text-black"
                          : "border-border text-muted-foreground hover:border-amber-500/50",
                        isDisabled && "opacity-30 cursor-not-allowed"
                      )}
                    >
                      <GitCompareArrows className="size-3.5" />
                    </button>
                  </TableCell>
                  {row.getVisibleCells().slice(1).map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export function MachineTableSkeleton() {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="bg-card p-3 border-b border-border">
        <Skeleton className="h-4 w-full" />
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="px-4 py-3 border-b border-border last:border-0 flex gap-4">
          <Skeleton className="h-4 w-6" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-16 ml-auto" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  )
}
