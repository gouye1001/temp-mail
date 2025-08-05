"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { type MessageDetail, formatMessageDate, formatFileSize } from "@/lib/mailtm"
import { ArrowLeft, Download, Paperclip, User, Calendar, FileText, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface MessageViewProps {
  messageId: string
  onBack: () => void
}

export function MessageView({ messageId, onBack }: MessageViewProps) {
  const [message, setMessage] = useState<MessageDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showRawSource, setShowRawSource] = useState(false)

  useEffect(() => {
    loadMessage()
  }, [messageId])

  const loadMessage = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("mailTmToken") : null

      if (!token) {
        throw new Error("No authentication token available")
      }

      const response = await fetch(`https://api.mail.tm/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Message fetch failed:", errorText)
        throw new Error(`Failed to load message: ${response.status} ${response.statusText}`)
      }

      const messageDetail = await response.json()
      setMessage(messageDetail)
    } catch (error: any) {
      console.error("Load message error:", error)
      setError(error.message || "Failed to load message")
      toast.error("Failed to load message")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadAttachment = async (attachment: any) => {
    try {
      toast.loading("Downloading attachment...", { id: "download" })

      // Open the download URL in a new tab
      window.open(attachment.downloadUrl, "_blank")

      toast.success("Download started!", { id: "download" })
    } catch (error) {
      toast.error("Failed to download attachment", { id: "download" })
    }
  }

  const handleViewSource = async () => {
    if (!message) return

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("mailTmToken") : null

      if (!token) {
        throw new Error("No authentication token available")
      }

      const response = await fetch(`https://api.mail.tm/sources/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const source = await response.json()

      // Create a new window to display the source
      const newWindow = window.open("", "_blank")
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Message Source - ${message.subject}</title>
              <style>
                body { font-family: monospace; white-space: pre-wrap; padding: 20px; }
              </style>
            </head>
            <body>${source.data}</body>
          </html>
        `)
        newWindow.document.close()
      }
    } catch (error) {
      toast.error("Failed to load message source")
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading message...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !message) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>Error</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error || "Message not found"}</p>
            <Button onClick={onBack} variant="outline">
              Back to Inbox
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-lg">{message.subject || "(No subject)"}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                {message.seen && (
                  <Badge variant="secondary" className="text-xs">
                    Read
                  </Badge>
                )}
                {message.hasAttachments && (
                  <Badge variant="outline" className="text-xs">
                    <Paperclip className="h-3 w-3 mr-1" />
                    {message.attachments.length} attachment{message.attachments.length !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleViewSource}>
              <FileText className="h-4 w-4 mr-1" />
              View Source
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Message Headers */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">From:</span>
            <span className="font-medium">
              {message.from.name ? `${message.from.name} <${message.from.address}>` : message.from.address}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">To:</span>
            <span>
              {message.to.map((recipient, index) => (
                <span key={index}>
                  {recipient.name ? `${recipient.name} <${recipient.address}>` : recipient.address}
                  {index < message.to.length - 1 && ", "}
                </span>
              ))}
            </span>
          </div>

          {message.cc && message.cc.length > 0 && (
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">CC:</span>
              <span>{message.cc.join(", ")}</span>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Date:</span>
            <span>{new Date(message.createdAt).toLocaleString()}</span>
            <span className="text-xs text-gray-400">({formatMessageDate(message.createdAt)})</span>
          </div>
        </div>

        <Separator />

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <>
            <div>
              <h3 className="font-medium mb-3 flex items-center">
                <Paperclip className="h-4 w-4 mr-2" />
                Attachments ({message.attachments.length})
              </h3>
              <div className="space-y-2">
                {message.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-sm">{attachment.filename}</div>
                        <div className="text-xs text-gray-500">
                          {attachment.contentType} • {formatFileSize(attachment.size)}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleDownloadAttachment(attachment)}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Message Content */}
        <div className="space-y-4">
          {message.html && message.html.length > 0 ? (
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: message.html[0] }} className="border rounded-lg p-4 bg-white" />
            </div>
          ) : message.text ? (
            <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg border">{message.text}</div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No message content available</p>
            </div>
          )}
        </div>

        {/* Message Info */}
        <Separator />
        <div className="text-xs text-gray-500 space-y-1">
          <div>Message ID: {message.id}</div>
          <div>Size: {formatFileSize(message.size)}</div>
          {message.verifications && message.verifications.length > 0 && (
            <div>Verifications: {message.verifications.join(", ")}</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
