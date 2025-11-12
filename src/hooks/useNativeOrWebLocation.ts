import { useCallback, useEffect, useState } from "react"
import { Geolocation } from "@capacitor/geolocation"

interface Coordinates {
    lat: number
    lng: number
}

export const useNativeOrWebLocation = () => {
    const [location, setLocation] = useState<Coordinates | null>(null)
    const [error, setError] = useState<string | null>(null)

    const isNative = (): boolean => {
        const globalWin = window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }
        return Boolean(globalWin.Capacitor?.isNativePlatform?.())
    }

    const getLocation = useCallback(async (): Promise<void> => {
        try {
            if (isNative()) {
                const coords = await Geolocation.getCurrentPosition()
                setLocation({
                    lat: coords.coords.latitude,
                    lng: coords.coords.longitude,
                })
            } else if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (pos) =>
                        setLocation({
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude,
                        }),
                    (err) => setError(err.message),
                    { enableHighAccuracy: true }
                )
            } else {
                setError("Geolocation not supported.")
            }
        } catch (e: unknown) {
            if (e instanceof Error) setError(e.message)
            else setError(String(e))
        }
    }, [])

    useEffect(() => {
        void getLocation()
    }, [getLocation])

    return { location, error, refresh: getLocation }
}
