import { type NextRequest, NextResponse } from "next/server"
import { mailTMClient } from "@/lib/mailtm"

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function getRateLimitKey(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : req.ip
  return ip || "unknown"
}

function checkRateLimit(key: string, limit = 8, windowMs = 1000): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}

export async function GET(request: NextRequest) {
  return handleRequest(request)
}

export async function POST(request: NextRequest) {
  return handleRequest(request)
}

export async function PUT(request: NextRequest) {
  return handleRequest(request)
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request)
}

export async function PATCH(request: NextRequest) {
  return handleRequest(request)
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}

async function handleRequest(request: NextRequest) {
  // Rate limiting
  const rateLimitKey = getRateLimitKey(request)
  if (!checkRateLimit(rateLimitKey)) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        message: "Too many requests. Please wait before trying again.",
      },
      { status: 429 },
    )
  }

  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }

  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")
    const id = searchParams.get("id")
    const page = searchParams.get("page")

    console.log(`API Request: ${action}, ID: ${id}, Page: ${page}`)

    let body = null
    try {
      if (request.method !== "GET" && request.method !== "DELETE") {
        body = await request.json()
      }
    } catch (error) {
      // Body might be empty, that's okay for some requests
      console.log("No body in request")
    }

    switch (action) {
      case "domains":
        try {
          const domains = await mailTMClient.getDomains(Number(page) || 1)
          console.log("Domains response:", domains)
          return NextResponse.json(domains, { headers })
        } catch (error: any) {
          console.error("Domains API error:", error)
          return NextResponse.json(
            { error: "Failed to fetch domains", details: error.message },
            { status: 500, headers },
          )
        }

      case "create-account":
        if (request.method !== "POST") {
          return NextResponse.json({ error: "Method not allowed" }, { status: 405, headers })
        }
        if (!body || !body.address || !body.password) {
          return NextResponse.json({ error: "Missing address or password" }, { status: 400, headers })
        }
        try {
          const account = await mailTMClient.createAccount(body.address, body.password)
          console.log("Account created:", account.address)
          return NextResponse.json(account, { status: 201, headers })
        } catch (error: any) {
          console.error("Create account error:", error)
          return NextResponse.json(
            { error: "Failed to create account", details: error.message },
            { status: 500, headers },
          )
        }

      case "get-token":
        if (request.method !== "POST") {
          return NextResponse.json({ error: "Method not allowed" }, { status: 405, headers })
        }
        if (!body || !body.address || !body.password) {
          return NextResponse.json({ error: "Missing address or password" }, { status: 400, headers })
        }
        try {
          const token = await mailTMClient.getToken(body.address, body.password)
          console.log("Token created for:", body.address)
          return NextResponse.json(token, { headers })
        } catch (error: any) {
          console.error("Get token error:", error)
          return NextResponse.json({ error: "Failed to get token", details: error.message }, { status: 500, headers })
        }

      case "messages":
        const authHeader = request.headers.get("authorization")
        if (!authHeader) {
          return NextResponse.json({ error: "Authorization required" }, { status: 401, headers })
        }
        const authToken = authHeader.replace("Bearer ", "")
        mailTMClient.setToken(authToken)
        try {
          const messages = await mailTMClient.getMessages(Number(page) || 1)
          console.log("Messages fetched:", messages["hydra:totalItems"])
          return NextResponse.json(messages, { headers })
        } catch (error: any) {
          console.error("Get messages error:", error)
          return NextResponse.json(
            { error: "Failed to fetch messages", details: error.message },
            { status: 500, headers },
          )
        }

      case "message":
        const messageAuthHeader = request.headers.get("authorization")
        if (!messageAuthHeader) {
          return NextResponse.json({ error: "Authorization required" }, { status: 401, headers })
        }
        const messageAuthToken = messageAuthHeader.replace("Bearer ", "")
        mailTMClient.setToken(messageAuthToken)

        if (request.method === "GET") {
          try {
            const message = await mailTMClient.getMessageById(id as string)
            return NextResponse.json(message, { headers })
          } catch (error: any) {
            console.error("Get message error:", error)
            return NextResponse.json(
              { error: "Failed to fetch message", details: error.message },
              { status: 500, headers },
            )
          }
        } else if (request.method === "DELETE") {
          try {
            await mailTMClient.deleteMessage(id as string)
            return new NextResponse(null, { status: 204, headers })
          } catch (error: any) {
            console.error("Delete message error:", error)
            return NextResponse.json(
              { error: "Failed to delete message", details: error.message },
              { status: 500, headers },
            )
          }
        } else if (request.method === "PATCH") {
          try {
            const result = await mailTMClient.markMessageAsRead(id as string)
            return NextResponse.json(result, { headers })
          } catch (error: any) {
            console.error("Mark as read error:", error)
            return NextResponse.json(
              { error: "Failed to mark message as read", details: error.message },
              { status: 500, headers },
            )
          }
        }
        break

      case "account":
        const accountAuthHeader = request.headers.get("authorization")
        if (!accountAuthHeader) {
          return NextResponse.json({ error: "Authorization required" }, { status: 401, headers })
        }
        const accountAuthToken = accountAuthHeader.replace("Bearer ", "")
        mailTMClient.setToken(accountAuthToken)

        if (request.method === "GET") {
          try {
            const accountInfo = await mailTMClient.getMe()
            return NextResponse.json(accountInfo, { headers })
          } catch (error: any) {
            console.error("Get account error:", error)
            return NextResponse.json(
              { error: "Failed to fetch account", details: error.message },
              { status: 500, headers },
            )
          }
        } else if (request.method === "DELETE") {
          try {
            await mailTMClient.deleteAccount(id as string)
            return new NextResponse(null, { status: 204, headers })
          } catch (error: any) {
            console.error("Delete account error:", error)
            return NextResponse.json(
              { error: "Failed to delete account", details: error.message },
              { status: 500, headers },
            )
          }
        }
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400, headers })
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400, headers })
  } catch (error: any) {
    console.error("API Error:", error)

    if (error.code) {
      return NextResponse.json(
        {
          error: error.message,
          type: error.type,
        },
        { status: error.code, headers },
      )
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Something went wrong. Please try again later.",
        details: error.message,
      },
      { status: 500, headers },
    )
  }
}
