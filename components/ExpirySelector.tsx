"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EXPIRY_OPTIONS } from "@/lib/expiryStore"

interface ExpirySelectorProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

export function ExpirySelector({ value, onChange, disabled }: ExpirySelectorProps) {
  return (
    <Select value={value.toString()} onValueChange={(val) => onChange(Number.parseInt(val))} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select expiry time" />
      </SelectTrigger>
      <SelectContent>
        {EXPIRY_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value.toString()}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
