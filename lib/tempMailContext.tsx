"use client"

import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import type { MailAccount, Message, ApiError } from "./mailtm"

interface TempMailState {
  account: MailAccount | null
  messages: Message[]
  isLoading: boolean
  error: ApiError | null
  isPolling: boolean
  lastRefresh: Date | null
}

type TempMailAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: ApiError | null }
  | { type: "SET_ACCOUNT"; payload: MailAccount | null }
  | { type: "SET_MESSAGES"; payload: Message[] }
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "UPDATE_MESSAGE"; payload: { id: string; updates: Partial<Message> } }
  | { type: "REMOVE_MESSAGE"; payload: string }
  | { type: "SET_POLLING"; payload: boolean }
  | { type: "SET_LAST_REFRESH"; payload: Date }
  | { type: "RESET" }

const initialState: TempMailState = {
  account: null,
  messages: [],
  isLoading: false,
  error: null,
  isPolling: false,
  lastRefresh: null,
}

function tempMailReducer(state: TempMailState, action: TempMailAction): TempMailState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false }
    case "SET_ACCOUNT":
      return { ...state, account: action.payload }
    case "SET_MESSAGES":
      return { ...state, messages: action.payload, lastRefresh: new Date() }
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [action.payload, ...state.messages],
        lastRefresh: new Date(),
      }
    case "UPDATE_MESSAGE":
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.id ? { ...msg, ...action.payload.updates } : msg,
        ),
      }
    case "REMOVE_MESSAGE":
      return {
        ...state,
        messages: state.messages.filter((msg) => msg.id !== action.payload),
      }
    case "SET_POLLING":
      return { ...state, isPolling: action.payload }
    case "SET_LAST_REFRESH":
      return { ...state, lastRefresh: action.payload }
    case "RESET":
      return initialState
    default:
      return state
  }
}

interface TempMailContextType extends TempMailState {
  createNewAccount: () => Promise<void>
  refreshMessages: () => Promise<void>
  deleteMessage: (id: string) => Promise<void>
  markAsRead: (id: string) => Promise<void>
  deleteAccount: () => Promise<void>
  startPolling: () => void
  stopPolling: () => void
}

const TempMailContext = createContext<TempMailContextType | undefined>(undefined)

export function useTempMail() {
  const context = useContext(TempMailContext)
  if (context === undefined) {
    throw new Error("useTempMail must be used within a TempMailProvider")
  }
  return context
}

interface TempMailProviderProps {
  children: ReactNode
}

export function TempMailProvider({ children }: TempMailProviderProps) {
  const [state, dispatch] = useReducer(tempMailReducer, initialState)

  // Polling interval ref
  const pollingIntervalRef = React.useRef<NodeJS.Timeout | null>(null)

  const createNewAccount = async () => {
    dispatch({ type: "SET_LOADING", payload: true })
    dispatch({ type: "SET_ERROR", payload: null })

    try {
      // Call Mail.tm API directly
      const domainsResponse = await fetch("https://api.mail.tm/domains")

      if (!domainsResponse.ok) {
        throw new Error(`Failed to fetch domains: ${domainsResponse.status} ${domainsResponse.statusText}`)
      }

      const domainsData = await domainsResponse.json()
      console.log("Domains response:", domainsData)

      // Check if the response has the expected structure
      if (!domainsData || !domainsData["hydra:member"] || !Array.isArray(domainsData["hydra:member"])) {
        console.error("Invalid domains response structure:", domainsData)
        throw new Error("Invalid response from Mail.tm domains API")
      }

      const activeDomains = domainsData["hydra:member"].filter((d: any) => d.isActive && !d.isPrivate)

      if (activeDomains.length === 0) {
        throw new Error("No active domains available from Mail.tm")
      }

      // Use the first active domain
      const domain = activeDomains[0].domain
      const email = `user${Date.now()}@${domain}`
      const password = Math.random().toString(36).substring(2, 15)

      console.log("Creating account:", email)

      // Create account directly with Mail.tm
      const accountResponse = await fetch("https://api.mail.tm/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: email, password }),
      })

      if (!accountResponse.ok) {
        const errorText = await accountResponse.text()
        console.error("Account creation failed:", errorText)
        throw new Error(`Account creation failed: ${accountResponse.status} ${accountResponse.statusText}`)
      }

      const account = await accountResponse.json()
      console.log("Account created:", account)

      // Get token directly from Mail.tm
      const tokenResponse = await fetch("https://api.mail.tm/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: email, password }),
      })

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text()
        console.error("Token creation failed:", errorText)
        throw new Error(`Token creation failed: ${tokenResponse.status} ${tokenResponse.statusText}`)
      }

      const tokenData = await tokenResponse.json()
      console.log("Token created")

      // Store token for future requests
      if (typeof window !== "undefined") {
        localStorage.setItem("mailTmToken", tokenData.token)
      }

      // Add token to account object for easier access
      const accountWithToken = { ...account, token: tokenData.token }

      dispatch({ type: "SET_ACCOUNT", payload: accountWithToken })
      dispatch({ type: "SET_MESSAGES", payload: [] })

      // Start polling for messages
      startPolling()
    } catch (error: any) {
      console.error("Account creation error:", error)
      dispatch({
        type: "SET_ERROR",
        payload: {
          message: error.message || "Failed to create account",
          code: 0,
          type: "unknown",
        },
      })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const refreshMessages = async () => {
    if (!state.account) return

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("mailTmToken") : state.account.token

      if (!token) {
        throw new Error("No authentication token available")
      }

      const response = await fetch("https://api.mail.tm/messages", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status} ${response.statusText}`)
      }

      const messagesResponse = await response.json()

      if (messagesResponse && messagesResponse["hydra:member"]) {
        dispatch({ type: "SET_MESSAGES", payload: messagesResponse["hydra:member"] })
        dispatch({ type: "SET_ERROR", payload: null })
      }
    } catch (error: any) {
      console.error("Messages refresh error:", error)
      dispatch({
        type: "SET_ERROR",
        payload: {
          message: error.message || "Failed to refresh messages",
          code: 0,
          type: "unknown",
        },
      })
    }
  }

  const deleteMessage = async (id: string) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("mailTmToken") : state.account?.token

      if (!token) {
        throw new Error("No authentication token available")
      }

      const response = await fetch(`https://api.mail.tm/messages/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete message: ${response.status}`)
      }

      dispatch({ type: "REMOVE_MESSAGE", payload: id })
    } catch (error: any) {
      console.error("Delete message error:", error)
      dispatch({
        type: "SET_ERROR",
        payload: {
          message: error.message || "Failed to delete message",
          code: 0,
          type: "unknown",
        },
      })
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("mailTmToken") : state.account?.token

      if (!token) {
        throw new Error("No authentication token available")
      }

      const response = await fetch(`https://api.mail.tm/messages/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error(`Failed to mark message as read: ${response.status}`)
      }

      dispatch({ type: "UPDATE_MESSAGE", payload: { id, updates: { seen: true } } })
    } catch (error: any) {
      console.error("Mark as read error:", error)
      dispatch({
        type: "SET_ERROR",
        payload: {
          message: error.message || "Failed to mark message as read",
          code: 0,
          type: "unknown",
        },
      })
    }
  }

  const deleteAccount = async () => {
    if (!state.account) return

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("mailTmToken") : state.account.token

      if (!token) {
        throw new Error("No authentication token available")
      }

      const response = await fetch(`https://api.mail.tm/accounts/${state.account.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete account: ${response.status}`)
      }

      stopPolling()

      // Clear stored token
      if (typeof window !== "undefined") {
        localStorage.removeItem("mailTmToken")
      }

      dispatch({ type: "RESET" })
    } catch (error: any) {
      console.error("Delete account error:", error)
      dispatch({
        type: "SET_ERROR",
        payload: {
          message: error.message || "Failed to delete account",
          code: 0,
          type: "unknown",
        },
      })
    }
  }

  const startPolling = () => {
    if (pollingIntervalRef.current) return // Already polling

    dispatch({ type: "SET_POLLING", payload: true })

    // Poll every 10 seconds
    pollingIntervalRef.current = setInterval(() => {
      refreshMessages()
    }, 10000)
  }

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    dispatch({ type: "SET_POLLING", payload: false })
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [])

  const contextValue: TempMailContextType = {
    ...state,
    createNewAccount,
    refreshMessages,
    deleteMessage,
    markAsRead,
    deleteAccount,
    startPolling,
    stopPolling,
  }

  return <TempMailContext.Provider value={contextValue}>{children}</TempMailContext.Provider>
}
