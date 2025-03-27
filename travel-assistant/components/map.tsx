"use client"

import { useEffect, useRef } from "react"
import { useScript } from "@/hooks/use-script"

interface MapProps {
  center: [number, number]
}

export default function Map({ center }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const status = useScript("https://atlas.microsoft.com/sdk/javascript/mapcontrol/2/atlas.min.js")

  useEffect(() => {
    if (status !== "ready" || !mapRef.current) return

    // Initialize map if it doesn't exist
    if (!mapInstanceRef.current) {
      // Check if we have the Azure Maps key
      if (!process.env.NEXT_PUBLIC_AZURE_MAPS_KEY) {
        console.error("Azure Maps key is missing")
        return
      }

      mapInstanceRef.current = new (window as any).atlas.Map(mapRef.current, {
        authOptions: {
          authType: "subscriptionKey",
          subscriptionKey: process.env.NEXT_PUBLIC_AZURE_MAPS_KEY,
        },
        center: center,
        zoom: 12,
        language: "fr-FR",
      })

      // Add zoom control
      mapInstanceRef.current.controls.add(new (window as any).atlas.control.ZoomControl(), { position: "top-right" })
    } else {
      // Update center if map already exists
      mapInstanceRef.current.setCamera({
        center: center,
      })
    }
  }, [status, center])

  return <div ref={mapRef} className="w-full h-full" />
}

