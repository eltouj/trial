"use client"

import { useState, useEffect, useRef } from "react"
import { sendMessage } from "@/lib/api"
import type { Message } from "@/lib/types"
import Map from "@/components/map"

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Bonjour ! Où souhaitez-vous voyager ?" },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>([2.3522, 48.8566]) // Paris by default
  const chatMessagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Add user message to chat
    const userMessage = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Send message to API
      const response = await sendMessage(messages.concat(userMessage))

      // Add assistant response to chat
      setMessages((prev) => [...prev, { role: "assistant", content: response.reply }])

      // Try to extract location from user message for map centering
      extractLocationAndUpdateMap(input)
    } catch (error) {
      console.error("Error sending message:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Désolé, une erreur s'est produite. Veuillez réessayer.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const extractLocationAndUpdateMap = (message: string) => {
    // This is a simple implementation - in a real app, you'd use a more sophisticated
    // approach to extract locations, possibly using the AI response
    const commonLocations: Record<string, [number, number]> = {
      paris: [2.3522, 48.8566],
      londres: [-0.1278, 51.5074],
      "new york": [-74.006, 40.7128],
      tokyo: [139.6917, 35.6895],
      rome: [12.4964, 41.9028],
      tunisie: [9.5375, 33.8869],
    }

    const lowercaseMessage = message.toLowerCase()

    for (const [location, coordinates] of Object.entries(commonLocations)) {
      if (lowercaseMessage.includes(location)) {
        setMapCenter(coordinates)
        return
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-center text-3xl font-bold text-[#2a5885] mb-8 flex items-center justify-center gap-2">
        <span className="text-4xl">🌍</span> Travel Assistant
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chat Container */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-[500px]">
          <div className="bg-[#2a5885] text-white p-4 text-center">
            <h2 className="text-xl font-semibold">Assistant Voyage</h2>
          </div>

          <div ref={chatMessagesRef} className="flex-1 p-4 overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-3 p-3 rounded-2xl max-w-[80%] ${
                  message.role === "assistant"
                    ? "bg-[#e3f2fd] self-start mr-auto"
                    : "bg-[#2a5885] text-white self-end ml-auto"
                }`}
              >
                {message.content}
              </div>
            ))}
            {isLoading && (
              <div className="bg-[#e3f2fd] self-start p-3 rounded-2xl max-w-[80%]">
                <div className="flex gap-1">
                  <div
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-200 flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Poser une question..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2a5885]"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className="ml-2 px-5 py-2 bg-[#2a5885] text-white rounded-full hover:bg-[#1e4060] transition-colors disabled:opacity-50"
            >
              Envoyer
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden h-[500px]">
          <Map center={mapCenter} />
        </div>
      </div>
    </div>
  )
}

