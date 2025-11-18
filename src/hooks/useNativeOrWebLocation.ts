import { useCallback, useEffect, useState } from "react"
import { Geolocation } from "@capacitor/geolocation"
import { Capacitor } from "@capacitor/core"

interface Coordinates {
  lat: number
  lng: number
}

export const useNativeOrWebLocation = () => {
  const [location, setLocation] = useState<Coordinates | null>(null)
  const [error, setError] = useState<string | null>(null)

  const getLocation = useCallback(async () => {
    try {
      const isNative = Capacitor.isNativePlatform()

      if (isNative) {
        // Request permission explicitly
        await Geolocation.requestPermissions()

        const pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 8000,
        })

        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })

        return
      }

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) =>
            setLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            }),
          (err) => setError(err.message),
          { enableHighAccuracy: true }
        )
        return
      }

      setError("Geolocation not supported.")
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message)
      } else if (typeof e === "string") {
        setError(e)
      } else {
        setError("Unknown error")
      }
    }

  }, [])

  useEffect(() => {
    void getLocation()
  }, [getLocation])

  return { location, error, refresh: getLocation }
}
