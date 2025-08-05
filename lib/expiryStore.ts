export interface FileMetadata {
  fileId: string
  folderId?: string
  fileName: string
  downloadUrl: string
  directLink?: string
  directLinkId?: string
  expiresAt: number
  createdAt: number
  size: number
  mimetype: string
  downloadCount?: number
}

// In-memory store for MVP (replace with database later)
class ExpiryStore {
  private store = new Map<string, FileMetadata>()

  add(metadata: FileMetadata): void {
    this.store.set(metadata.fileId, metadata)
  }

  get(fileId: string): FileMetadata | undefined {
    return this.store.get(fileId)
  }

  getAll(): FileMetadata[] {
    return Array.from(this.store.values())
  }

  getExpired(): FileMetadata[] {
    const now = Date.now()
    return Array.from(this.store.values()).filter((metadata) => metadata.expiresAt <= now)
  }

  remove(fileId: string): boolean {
    return this.store.delete(fileId)
  }

  removeMultiple(fileIds: string[]): void {
    fileIds.forEach((id) => this.store.delete(id))
  }

  clear(): void {
    this.store.clear()
  }

  size(): number {
    return this.store.size
  }

  // Get files expiring within next hour for early warning
  getExpiringSoon(withinMinutes = 60): FileMetadata[] {
    const threshold = Date.now() + withinMinutes * 60 * 1000
    return Array.from(this.store.values()).filter(
      (metadata) => metadata.expiresAt <= threshold && metadata.expiresAt > Date.now(),
    )
  }
}

export const expiryStore = new ExpiryStore()

// Utility functions for expiry times
export const EXPIRY_OPTIONS = [
  { label: "15 minutes", value: 15 * 60 * 1000, display: "15m" },
  { label: "1 hour", value: 60 * 60 * 1000, display: "1h" },
  { label: "6 hours", value: 6 * 60 * 60 * 1000, display: "6h" },
  { label: "1 day", value: 24 * 60 * 60 * 1000, display: "1d" },
  { label: "3 days", value: 3 * 24 * 60 * 60 * 1000, display: "3d" },
  { label: "1 week", value: 7 * 24 * 60 * 60 * 1000, display: "1w" },
] as const

export function getExpiryTimestamp(durationMs: number): number {
  return Date.now() + durationMs
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function formatTimeRemaining(expiresAt: number): string {
  const now = Date.now()
  const remaining = expiresAt - now

  if (remaining <= 0) return "Expired"

  const minutes = Math.floor(remaining / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  return `${minutes}m`
}
