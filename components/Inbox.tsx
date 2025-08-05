"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTempMail } from "@/lib/tempMailContext"
import { MessageView } from "./MessageView"
import { formatMessageDate } from "@/lib/mailtm"
import { Mail, RefreshCw, Trash2, Eye, EyeOff, Paperclip, Clock, InboxIcon } from "lucide-react"
import { toast } from "sonner"

export function Inbox() {
  const { account, messages, isLoading, error, refreshMessages, deleteMessage, markAsRead, isPolling, lastRefresh } =
    useTempMail()

  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshMessages()
    setIsRefreshing(false)
    toast.success("Inbox refreshed!")
  }

  const handleDeleteMessage = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation()
    if (window.confirm("Are you sure you want to delete this message?")) {
      await deleteMessage(id)
      if (selectedMessageId === id) {
        setSelectedMessageId(null)
      }
      toast.success("Message deleted")
    }
  }

  const handleMarkAsRead = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation()
    await markAsRead(id)
  }

  const handleMessageClick = (id: string) => {
    setSelectedMessageId(id)
    const message = messages.find((m) => m.id === id)
    if (message && !message.seen) {
      markAsRead(id)
    }
  }

  if (!account) {
    return null
  }

  if (selectedMessageId) {
    return <MessageView messageId={selectedMessageId} onBack={() => setSelectedMessageId(null)} />
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <InboxIcon className="h-5 w-5" />
            <CardTitle>Inbox</CardTitle>
            <Badge variant="secondary">
              {messages.length} message{messages.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            {isPolling && (
              <Badge variant="outline" className="text-green-600 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                Auto-refresh
              </Badge>
            )}

            <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline" size="sm">
              <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        <CardDescription>
          Messages sent to {account.address}
          {lastRefresh && (
            <span className="block text-xs text-gray-400 mt-1">Last updated: {lastRefresh.toLocaleTimeString()}</span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Error:</strong> {error.message}
            </p>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
            <p className="text-gray-500 mb-4">Messages sent to your temporary email will appear here automatically.</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Check for Messages
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => (
              <div
                key={message.id}
                onClick={() => handleMessageClick(message.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                  !message.seen ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`font-medium ${!message.seen ? "text-blue-900" : "text-gray-900"}`}>
                        {message.from.name || message.from.address}
                      </span>
                      {!message.seen && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                          New
                        </Badge>
                      )}
                      {message.hasAttachments && <Paperclip className="h-3 w-3 text-gray-400" />}
                    </div>

                    <h4 className={`font-medium mb-1 truncate ${!message.seen ? "text-gray-900" : "text-gray-700"}`}>
                      {message.subject || "(No subject)"}
                    </h4>

                    {message.intro && <p className="text-sm text-gray-600 truncate mb-2">{message.intro}</p>}

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatMessageDate(message.createdAt)}</span>
                      </div>
                      <span>{Math.round(message.size / 1024)} KB</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleMarkAsRead(message.id, e)}
                      className="h-8 w-8"
                      title={message.seen ? "Mark as unread" : "Mark as read"}
                    >
                      {message.seen ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDeleteMessage(message.id, e)}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Delete message"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
