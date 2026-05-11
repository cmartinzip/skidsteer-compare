import { Suspense } from "react"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { HomeClient } from "@/components/home-client"
import { MachineTableSkeleton } from "@/components/machine-table"

export default function HomePage() {
  return (
    <NuqsAdapter>
      <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><MachineTableSkeleton /></div>}>
        <HomeClient />
      </Suspense>
    </NuqsAdapter>
  )
}
