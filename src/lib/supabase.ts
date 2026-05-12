import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type PartType = {
  id: string
  label: string
  description: string
  sort_order: number
}

export type Part = {
  id: string
  oem_part_number: string
  brand: string
  part_type_id: string
  description: string
  notes: string
  superseded_by: string | null
  part_types: PartType
}

export type CrossReference = {
  id: string
  oem_part_number: string
  oem_brand: string
  aftermarket_brand: string
  aftermarket_part_number: string
  verified: boolean
  notes: string
}

export type MachinePart = {
  part_id: string
  quantity: number
  notes: string | null
  parts: Part
}
