import axios, { type AxiosResponse } from "axios"

const BASE_URL = "https://api.mail.tm"

// Types based on Mail.tm API documentation
export interface Domain {
  "@id": string
  "@type": string
  "@context": string
  id: string
  domain: string
  isActive: boolean
  isPrivate: boolean
  createdAt: string
  updatedAt: string
}

export interface DomainsResponse {
  "hydra:member": Domain[]
  "hydra:totalItems": number
  "hydra:view": {
    "@id": string
    "@type": string
    "hydra:first": string
    "hydra:last": string
    "hydra:previous": string
    "hydra:next": string
  }
}

export interface MailAccount {
  "@context": string
  "@id": string
  "@type": string
  id: string
  address: string
  quota: number
  used: number
  isDisabled: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface TokenResponse {
  id: string
  token: string
}

export interface MessageSender {
  name: string
  address: string
}

export interface MessageRecipient {
  name: string
  address: string
}

export interface MessageAttachment {
  id: string
  filename: string
  contentType: string
  disposition: string
  transferEncoding: string
  related: boolean
  size: number
  downloadUrl: string
}

export interface Message {
  "@id": string
  "@type": string
  "@context": string
  id: string
  accountId: string
  msgid: string
  from: MessageSender
  to: MessageRecipient[]
  subject: string
  intro?: string
  seen: boolean
  isDeleted: boolean
  hasAttachments: boolean
  size: number
  downloadUrl: string
  createdAt: string
  updatedAt: string
}

export interface MessageDetail extends Omit<Message, "intro"> {
  cc: string[]
  bcc: string[]
  flagged: boolean
  verifications: string[]
  retention: boolean
  retentionDate: string
  text: string
  html: string[]
  attachments: MessageAttachment[]
}

export interface MessagesResponse {
  "hydra:member": Message[]
  "hydra:totalItems": number
  "hydra:view": {
    "@id": string
    "@type": string
    "hydra:first": string
    "hydra:last": string
    "hydra:previous": string
    "hydra:next": string
  }
}

export interface ApiError {
  message: string
  code: number
  type: "network" | "api" | "validation" | "rate_limit" | "unknown"
}

class MailTMClient {
  private baseURL = BASE_URL
  private token: string | null = null

  constructor() {
    // Set up axios defaults
    axios.defaults.timeout = 10000
    axios.defaults.headers.common["Content-Type"] = "application/json"
  }

  private handleError(error: any): ApiError {
    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.message || error.message

      switch (status) {
        case 400:
          return { message: "Bad request - check your input", code: status, type: "validation" }
        case 401:
          return { message: "Unauthorized - invalid token", code: status, type: "api" }
        case 404:
          return { message: "Resource not found", code: status, type: "api" }
        case 405:
          return { message: "Method not allowed", code: status, type: "api" }
        case 418:
          return { message: "Server temporarily unavailable", code: status, type: "api" }
        case 422:
          return { message: "Invalid input data", code: status, type: "validation" }
        case 429:
          return { message: "Rate limit exceeded - please wait", code: status, type: "rate_limit" }
        default:
          return { message: message || "API error occurred", code: status, type: "api" }
      }
    } else if (error.request) {
      return { message: "Network error - check your connection", code: 0, type: "network" }
    } else {
      return { message: error.message || "Unknown error occurred", code: 0, type: "unknown" }
    }
  }

  private getAuthHeaders() {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {}
  }

  setToken(token: string) {
    this.token = token
  }

  clearToken() {
    this.token = null
  }

  async getDomains(page = 1): Promise<DomainsResponse> {
    try {
      const response: AxiosResponse<DomainsResponse> = await axios.get(`${this.baseURL}/domains?page=${page}`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getDomainById(id: string): Promise<Domain> {
    try {
      const response: AxiosResponse<Domain> = await axios.get(`${this.baseURL}/domains/${id}`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async createAccount(address: string, password: string): Promise<MailAccount> {
    try {
      const response: AxiosResponse<MailAccount> = await axios.post(`${this.baseURL}/accounts`, {
        address,
        password,
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getToken(address: string, password: string): Promise<TokenResponse> {
    try {
      const response: AxiosResponse<TokenResponse> = await axios.post(`${this.baseURL}/token`, {
        address,
        password,
      })

      // Store token for subsequent requests
      this.setToken(response.data.token)

      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getAccount(id: string): Promise<MailAccount> {
    try {
      const response: AxiosResponse<MailAccount> = await axios.get(`${this.baseURL}/accounts/${id}`, {
        headers: this.getAuthHeaders(),
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getMe(): Promise<MailAccount> {
    try {
      const response: AxiosResponse<MailAccount> = await axios.get(`${this.baseURL}/me`, {
        headers: this.getAuthHeaders(),
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async deleteAccount(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/accounts/${id}`, {
        headers: this.getAuthHeaders(),
      })
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getMessages(page = 1): Promise<MessagesResponse> {
    try {
      const response: AxiosResponse<MessagesResponse> = await axios.get(`${this.baseURL}/messages?page=${page}`, {
        headers: this.getAuthHeaders(),
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getMessageById(id: string): Promise<MessageDetail> {
    try {
      const response: AxiosResponse<MessageDetail> = await axios.get(`${this.baseURL}/messages/${id}`, {
        headers: this.getAuthHeaders(),
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async deleteMessage(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/messages/${id}`, {
        headers: this.getAuthHeaders(),
      })
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async markMessageAsRead(id: string): Promise<{ seen: boolean }> {
    try {
      const response: AxiosResponse<{ seen: boolean }> = await axios.patch(
        `${this.baseURL}/messages/${id}`,
        {},
        {
          headers: this.getAuthHeaders(),
        },
      )
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getMessageSource(id: string): Promise<{ id: string; downloadUrl: string; data: string }> {
    try {
      const response = await axios.get(`${this.baseURL}/sources/${id}`, {
        headers: this.getAuthHeaders(),
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }
}

// Singleton instance
export const mailTMClient = new MailTMClient()

// Utility functions
export function generateRandomEmail(domain: string): string {
  const randomString = Math.random().toString(36).substring(2, 10)
  const timestamp = Date.now().toString(36)
  return `${randomString}${timestamp}@${domain}`
}

export function generateRandomPassword(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function formatMessageDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInHours * 60)
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours)
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`
  } else {
    const days = Math.floor(diffInHours / 24)
    return `${days} day${days !== 1 ? "s" : ""} ago`
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
