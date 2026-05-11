import { Suspense } from "react"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { CompareClient } from "@/components/compare-client"
import { Skeleton } from "@/components/ui/skeleton"

export default function ComparePage() {
  return (
    <NuqsAdapter>
      <Suspense fallback={<div className="max-w-5xl mx-auto px-4 py-8 space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-96 w-full" /></div>}>
        <CompareClient />
      </Suspense>
    </NuqsAdapter>
  )
}
