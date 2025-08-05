"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTempMail } from "@/lib/tempMailContext"
import { Mail, RefreshCw, Copy, Trash2, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export function EmailGenerator() {
  const { account, isLoading, error, createNewAccount, deleteAccount } = useTempMail()
  const [copied, setCopied] = useState(false)

  const handleCopyEmail = async () => {
    if (!account?.address) return

    try {
      await navigator.clipboard.writeText(account.address)
      setCopied(true)
      toast.success("Email address copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy email address")
    }
  }

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete this email account? This action cannot be undone.")) {
      await deleteAccount()
      toast.success("Email account deleted successfully")
    }
  }

  if (account) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Mail className="h-6 w-6 text-green-600" />
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Active
            </Badge>
          </div>
          <CardTitle className="text-xl">Your Temporary Email</CardTitle>
          <CardDescription>
            This email address is ready to receive messages. It will be automatically deleted when you close this
            session.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Email Address Display */}
          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border">
            <div className="flex-1 font-mono text-sm break-all">{account.address}</div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyEmail}
              className={copied ? "bg-green-50 border-green-200" : ""}
            >
              {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          {/* Account Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="font-semibold text-blue-900">{account.used}</div>
              <div className="text-blue-600">Messages Received</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="font-semibold text-purple-900">
                {Math.round((account.used / account.quota) * 100) || 0}%
              </div>
              <div className="text-purple-600">Quota Used</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button onClick={createNewAccount} variant="outline" className="flex-1 bg-transparent">
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate New Email
            </Button>
            <Button onClick={handleDeleteAccount} variant="destructive" className="flex-1">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>

          {/* Created Date */}
          <div className="text-xs text-gray-500 text-center">
            Created: {new Date(account.createdAt).toLocaleString()}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl">Generate Temporary Email</CardTitle>
        <CardDescription>
          Create a disposable email address for testing, signups, or verification workflows. No registration required!
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Error:</strong> {error.message}
            </p>
            {error.type === "rate_limit" && (
              <p className="text-xs text-red-600 mt-1">Please wait a moment before trying again.</p>
            )}
          </div>
        )}

        <Button onClick={createNewAccount} disabled={isLoading} className="w-full" size="lg">
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Creating Email...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              Create Temporary Email
            </>
          )}
        </Button>

        <div className="mt-6 text-xs text-gray-500 space-y-2">
          <p>• Email addresses are temporary and will be deleted automatically</p>
          <p>• Perfect for testing, one-time signups, or avoiding spam</p>
          <p>• No personal information required or stored</p>
        </div>
      </CardContent>
    </Card>
  )
}
