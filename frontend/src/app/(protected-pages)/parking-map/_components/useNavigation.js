'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''
const REROUTE_THRESHOLD_METERS = 50 // If user deviates > 50m from route, recalculate

/**
 * Fetch route from Mapbox Directions API
 */
async function fetchRoute(userLng, userLat, destLng, destLat) {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${userLng},${userLat};${destLng},${destLat}?geometries=geojson&overview=full&steps=true&annotations=distance,duration&access_token=${MAPBOX_TOKEN}`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    try {
        const res = await fetch(url, { signal: controller.signal })
        clearTimeout(timeout)
        if (!res.ok) throw new Error(`Route API error: ${res.status}`)

        const data = await res.json()
        if (!data.routes || data.routes.length === 0) throw new Error('No route found')

        const route = data.routes[0]
        const coords = route.geometry.coordinates
        const distanceM = route.distance
        const durationS = route.duration
        const steps = route.legs?.[0]?.steps || []

        return {
            coordinates: coords,
            geometry: route.geometry,
            distanceMeters: distanceM,
            durationSeconds: durationS,
            distanceText: distanceM < 1000
                ? `${Math.round(distanceM)} m`
                : `${(distanceM / 1000).toFixed(1)} km`,
            durationText: durationS < 60
                ? `${Math.round(durationS)} sec`
                : `${Math.round(durationS / 60)} min`,
            steps: steps.map((s) => ({
                instruction: s.maneuver?.instruction || '',
                type: s.maneuver?.type || '',
                modifier: s.maneuver?.modifier || '',
                distanceMeters: s.distance,
                durationSeconds: s.duration,
                location: s.maneuver?.location || null,
            })),
        }
    } catch (e) {
        clearTimeout(timeout)
        if (e.name === 'AbortError') throw new Error('Route request timed out')
        throw e
    }
}

/**
 * Calculate distance from a point to the nearest point on a route polyline
 */
function distanceToRoute(userLng, userLat, coordinates) {
    let minDist = Infinity
    for (const [lng, lat] of coordinates) {
        const dx = (userLng - lng) * 111320 * Math.cos((userLat * Math.PI) / 180)
        const dy = (userLat - lat) * 110540
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < minDist) minDist = dist
    }
    return minDist // meters
}

/**
 * Calculate bearing between two points (for navigation arrow)
 */
function calculateBearing(lat1, lng1, lat2, lng2) {
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const lat1Rad = (lat1 * Math.PI) / 180
    const lat2Rad = (lat2 * Math.PI) / 180

    const x = Math.sin(dLng) * Math.cos(lat2Rad)
    const y = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng)

    return ((Math.atan2(x, y) * 180) / Math.PI + 360) % 360
}

/**
 * Custom hook: useNavigation
 * Manages live navigation state, route fetching, GPS tracking, and rerouting.
 */
export default function useNavigation(parking) {
    const [navigating, setNavigating] = useState(false)
    const [route, setRoute] = useState(null) // { coordinates, distanceText, durationText, steps, ... }
    const [userPos, setUserPos] = useState(null) // { lat, lng, heading }
    const [currentStepIndex, setCurrentStepIndex] = useState(0)
    const [distanceRemaining, setDistanceRemaining] = useState(null)
    const [durationRemaining, setDurationRemaining] = useState(null)
    const [bearing, setBearing] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [arrived, setArrived] = useState(false)

    const watchIdRef = useRef(null)
    const routeRef = useRef(null)
    const lastRerouteTime = useRef(0)
    const parkingRef = useRef(parking)

    useEffect(() => {
        parkingRef.current = parking
    }, [parking])

    useEffect(() => {
        routeRef.current = route
    }, [route])

    /**
     * Fetch and set a new route
     */
    const fetchAndSetRoute = useCallback(async (userLat, userLng) => {
        const p = parkingRef.current
        if (!p) return

        try {
            const r = await fetchRoute(userLng, userLat, p.lng, p.lat)
            setRoute(r)
            setDistanceRemaining(r.distanceText)
            setDurationRemaining(r.durationText)
            setCurrentStepIndex(0)
            setError(null)
            return r
        } catch (e) {
            setError(e.message)
            return null
        }
    }, [])

    /**
     * Start navigation
     */
    const startNavigation = useCallback(async (initialUserLocation) => {
        if (!parking || !MAPBOX_TOKEN) return

        setLoading(true)
        setNavigating(true)
        setArrived(false)
        setError(null)

        const startLat = initialUserLocation?.lat || 31.6295
        const startLng = initialUserLocation?.lng || -7.9811

        setUserPos({ lat: startLat, lng: startLng, heading: 0 })

        try {
            const r = await fetchAndSetRoute(startLat, startLng)

            if (!r) {
                setNavigating(false)
                return
            }

            // Start watching position
            if (navigator.geolocation) {
                watchIdRef.current = navigator.geolocation.watchPosition(
                    (position) => {
                        const { latitude, longitude, heading: h } = position.coords
                        setUserPos({ lat: latitude, lng: longitude, heading: h || 0 })
                    },
                    (err) => {
                        console.warn('Geolocation watch error:', err)
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 1000,
                    }
                )
            }
        } catch (e) {
            console.error('startNavigation error:', e)
            setError(e.message || 'Navigation failed')
            setNavigating(false)
        } finally {
            setLoading(false)
        }
    }, [parking, fetchAndSetRoute])

    /**
     * Stop navigation
     */
    const stopNavigation = useCallback(() => {
        setNavigating(false)
        setRoute(null)
        setArrived(false)
        setCurrentStepIndex(0)
        setDistanceRemaining(null)
        setDurationRemaining(null)
        setError(null)

        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current)
            watchIdRef.current = null
        }
    }, [])

    /**
     * React to user position changes — update route progress, check deviation, check arrival
     */
    useEffect(() => {
        if (!navigating || !userPos || !routeRef.current || !parkingRef.current) return

        const r = routeRef.current
        const p = parkingRef.current

        // Calculate bearing to parking
        const b = calculateBearing(userPos.lat, userPos.lng, p.lat, p.lng)
        setBearing(b)

        // Check arrival (within 30m of destination)
        const dxArr = (userPos.lng - p.lng) * 111320 * Math.cos((userPos.lat * Math.PI) / 180)
        const dyArr = (userPos.lat - p.lat) * 110540
        const distToDest = Math.sqrt(dxArr * dxArr + dyArr * dyArr)

        if (distToDest < 30) {
            setArrived(true)
            setDistanceRemaining('0 m')
            setDurationRemaining('Arrived')
            return
        }

        // Update remaining distance/duration
        const distText = distToDest < 1000
            ? `${Math.round(distToDest)} m`
            : `${(distToDest / 1000).toFixed(1)} km`
        setDistanceRemaining(distText)

        // Estimate duration: assume ~30km/h average city driving
        const etaSeconds = (distToDest / 1000 / 30) * 3600
        const etaText = etaSeconds < 60
            ? `${Math.round(etaSeconds)} sec`
            : `${Math.round(etaSeconds / 60)} min`
        setDurationRemaining(etaText)

        // Update current step
        if (r.steps && r.steps.length > 0) {
            let closestStep = 0
            let closestDist = Infinity
            for (let i = 0; i < r.steps.length; i++) {
                const loc = r.steps[i].location
                if (!loc) continue
                const dx = (userPos.lng - loc[0]) * 111320 * Math.cos((userPos.lat * Math.PI) / 180)
                const dy = (userPos.lat - loc[1]) * 110540
                const d = Math.sqrt(dx * dx + dy * dy)
                if (d < closestDist) {
                    closestDist = d
                    closestStep = i
                }
            }
            setCurrentStepIndex(closestStep)
        }

        // Check route deviation — reroute if user is too far from route
        const deviation = distanceToRoute(userPos.lng, userPos.lat, r.coordinates)
        const now = Date.now()
        if (deviation > REROUTE_THRESHOLD_METERS && now - lastRerouteTime.current > 5000) {
            lastRerouteTime.current = now
            console.log(`Rerouting: user deviated ${Math.round(deviation)}m from route`)
            fetchAndSetRoute(userPos.lat, userPos.lng)
        }
    }, [userPos, navigating, fetchAndSetRoute])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current)
            }
        }
    }, [])

    return {
        navigating,
        route,
        userPos,
        currentStepIndex,
        distanceRemaining,
        durationRemaining,
        bearing,
        loading,
        error,
        arrived,
        startNavigation,
        stopNavigation,
    }
}

