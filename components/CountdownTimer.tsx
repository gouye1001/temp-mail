"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

interface CountdownTimerProps {
  expiresAt: number
  onExpired?: () => void
}

export function CountdownTimer({ expiresAt, onExpired }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now()
      const remaining = expiresAt - now

      if (remaining <= 0) {
        setTimeLeft("Expired")
        setIsExpired(true)
        onExpired?.()
        return
      }

      const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000)

      let timeString = ""
      if (days > 0) {
        timeString = `${days}d ${hours}h ${minutes}m`
      } else if (hours > 0) {
        timeString = `${hours}h ${minutes}m ${seconds}s`
      } else if (minutes > 0) {
        timeString = `${minutes}m ${seconds}s`
      } else {
        timeString = `${seconds}s`
      }

      setTimeLeft(timeString)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [expiresAt, onExpired])

  return (
    <div className={`flex items-center space-x-2 ${isExpired ? "text-red-600" : "text-gray-600"}`}>
      <Clock className="h-4 w-4" />
      <span className="font-mono text-sm">{isExpired ? "Expired" : `Expires in ${timeLeft}`}</span>
    </div>
  )
}
