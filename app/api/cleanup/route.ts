import { type NextRequest, NextResponse } from "next/server"
import { gofileClient } from "@/lib/gofileClient"
import { expiryStore } from "@/lib/expiryStore"

export async function GET(request: NextRequest) {
  // Verify this is a cron job request
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const expiredFiles = expiryStore.getExpired()

    if (expiredFiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No expired files to clean up",
        cleaned: 0,
      })
    }

    const fileIds = expiredFiles.map((f) => f.fileId)
    const results = {
      attempted: fileIds.length,
      successful: 0,
      failed: 0,
      errors: [] as string[],
    }

    // Delete files in batches to avoid rate limits
    const batchSize = 5
    for (let i = 0; i < fileIds.length; i += batchSize) {
      const batch = fileIds.slice(i, i + batchSize)

      try {
        await gofileClient.deleteContent(batch)
        results.successful += batch.length

        // Remove from store
        expiryStore.removeMultiple(batch)

        // Small delay between batches to respect rate limits
        if (i + batchSize < fileIds.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      } catch (error) {
        results.failed += batch.length
        results.errors.push(`Batch ${i}-${i + batchSize}: ${error}`)
        console.error(`Failed to delete batch ${i}-${i + batchSize}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleanup completed: ${results.successful} deleted, ${results.failed} failed`,
      results,
    })
  } catch (error) {
    console.error("Cleanup error:", error)
    return NextResponse.json({ error: "Cleanup failed", details: error }, { status: 500 })
  }
}

// Also allow POST for manual cleanup triggers
export async function POST(request: NextRequest) {
  return GET(request)
}
