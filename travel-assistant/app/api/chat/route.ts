import { NextResponse } from "next/server"
import type { Message } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const { messages } = (await request.json()) as { messages: Message[] }

    // Validate environment variables
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT
    const key = process.env.AZURE_OPENAI_KEY
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT

    if (!endpoint || !key || !deployment) {
      console.error("Missing Azure OpenAI configuration")
      return NextResponse.json({ error: "Service configuration error" }, { status: 500 })
    }

    // Add system message if not present
    const systemMessage: Message = {
      role: "system",
      content: "Tu es un expert en voyages. Réponds de manière concise et utile en français.",
    }

    const messagesWithSystem = messages.some((m) => m.role === "system") ? messages : [systemMessage, ...messages]

    // Call Azure OpenAI API
    const response = await fetch(
      `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2023-05-15`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": key,
        },
        body: JSON.stringify({
          messages: messagesWithSystem,
          max_tokens: 800,
          temperature: 0.7,
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Azure OpenAI API error:", errorData)
      return NextResponse.json({ error: "Error communicating with AI service" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json({ reply: data.choices[0].message.content })
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

