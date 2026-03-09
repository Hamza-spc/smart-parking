'use client'

import { useEffect, useRef, useState } from 'react'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''
const MAPBOX_VERSION = '3.4.0'

function loadMapboxFromCDN() {
    return new Promise((resolve, reject) => {
        if (window.mapboxgl) return resolve(window.mapboxgl)
        if (!document.getElementById('mapbox-cdn-css')) {
            const link = document.createElement('link')
            link.id = 'mapbox-cdn-css'
            link.rel = 'stylesheet'
            link.href = `https://api.mapbox.com/mapbox-gl-js/v${MAPBOX_VERSION}/mapbox-gl.css`
            document.head.appendChild(link)
        }
        if (!document.getElementById('mapbox-cdn-js')) {
            const script = document.createElement('script')
            script.id = 'mapbox-cdn-js'
            script.src = `https://api.mapbox.com/mapbox-gl-js/v${MAPBOX_VERSION}/mapbox-gl.js`
            script.onload = () => resolve(window.mapboxgl)
            script.onerror = () => reject(new Error('Failed to load Mapbox'))
            document.head.appendChild(script)
        } else {
            const poll = setInterval(() => {
                if (window.mapboxgl) { clearInterval(poll); resolve(window.mapboxgl) }
            }, 100)
            setTimeout(() => { clearInterval(poll); reject(new Error('Timeout')) }, 10000)
        }
    })
}

function buildNavUserMarker(heading) {
    const el = document.createElement('div')
    el.innerHTML = `
        <div style="position:relative;width:44px;height:44px;">
            <div style="position:absolute;inset:0;border-radius:50%;background:rgba(66,133,244,0.15);animation:navPulse 2s ease infinite;"></div>
            <div style="position:absolute;top:6px;left:6px;width:32px;height:32px;border-radius:50%;background:#4285F4;border:3px solid white;box-shadow:0 2px 12px rgba(66,133,244,0.5);display:flex;align-items:center;justify-content:center;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white" style="transform:rotate(${heading || 0}deg);transition:transform 0.5s ease">
                    <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z"/>
                </svg>
            </div>
        </div>
    `
    return el
}

function buildDestinationMarker() {
    const el = document.createElement('div')
    el.innerHTML = `
        <div style="position:relative;">
            <div style="width:48px;height:48px;background:linear-gradient(135deg,#10B981,#059669);border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(16,185,129,0.4);border:3px solid white;">
                <span style="transform:rotate(45deg);color:white;font-weight:800;font-size:16px;">P</span>
            </div>
            <div style="position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);width:16px;height:4px;border-radius:50%;background:rgba(0,0,0,0.15);"></div>
        </div>
    `
    return el
}

const NavigationMap = ({ route, userPos, parking, bearing, arrived }) => {
    const containerRef = useRef(null)
    const mapRef = useRef(null)
    const mapboxglRef = useRef(null)
    const userMarkerRef = useRef(null)
    const destMarkerRef = useRef(null)
    const [ready, setReady] = useState(false)
    const [initialPos, setInitialPos] = useState(null)

    // Capture the first userPos for map initialization (only once)
    useEffect(() => {
        if (!initialPos && userPos) {
            setInitialPos({ lat: userPos.lat, lng: userPos.lng })
        }
    }, [userPos, initialPos])

    // Inject CSS overrides
    useEffect(() => {
        const id = 'nav-map-styles'
        if (!document.getElementById(id)) {
            const s = document.createElement('style')
            s.id = id
            s.textContent = `
                @keyframes navPulse {
                    0% { transform: scale(1); opacity: 0.6; }
                    50% { transform: scale(1.5); opacity: 0.2; }
                    100% { transform: scale(1); opacity: 0.6; }
                }
                .mapboxgl-map { position: relative !important; width: 100% !important; height: 100% !important; overflow: hidden !important; }
                .mapboxgl-canvas-container { position: absolute !important; width: 100% !important; height: 100% !important; overflow: hidden !important; }
                .mapboxgl-canvas { position: absolute !important; left: 0 !important; top: 0 !important; }
                .mapboxgl-canvas:focus { outline: none !important; }
                .mapboxgl-map img { max-width: none !important; }
                .mapboxgl-map canvas { display: block !important; max-width: none !important; }
                .mapboxgl-map *, .mapboxgl-map *::before, .mapboxgl-map *::after { box-sizing: content-box; }
                .mapboxgl-ctrl-group, .mapboxgl-ctrl-group *, .mapboxgl-ctrl-attrib { box-sizing: border-box !important; }
                .mapboxgl-control-container { position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; pointer-events: none !important; }
                .mapboxgl-control-container > * { pointer-events: auto !important; }
                .mapboxgl-marker { position: absolute !important; }
            `
            document.head.appendChild(s)
        }
    }, [])

    // Initialize map ONCE when initialPos is set
    useEffect(() => {
        if (mapRef.current || !initialPos) return

        let cancelled = false

        async function init() {
            try {
                const mapboxgl = await loadMapboxFromCDN()
                if (cancelled) return
                mapboxglRef.current = mapboxgl
                mapboxgl.accessToken = MAPBOX_TOKEN

                const container = containerRef.current
                if (!container) return

                // Wait for container to have dimensions
                await new Promise((r) => {
                    const c = () => {
                        if (container.offsetWidth > 0 && container.offsetHeight > 0) return r()
                        requestAnimationFrame(c)
                    }
                    c()
                })
                if (cancelled) return

                const m = new mapboxgl.Map({
                    container,
                    style: 'mapbox://styles/mapbox/streets-v12',
                    center: [initialPos.lng, initialPos.lat],
                    zoom: 15,
                    pitch: 45,
                    bearing: 0,
                    attributionControl: false,
                })

                m.addControl(new mapboxgl.NavigationControl({ showCompass: true, showZoom: false }), 'top-right')

                m.on('load', () => {
                    if (!cancelled) {
                        setReady(true)
                        m.resize()
                    }
                })

                // Fallback: if 'load' never fires, force ready after 5s
                setTimeout(() => {
                    if (!cancelled && !mapRef.current?._loaded) {
                        console.warn('Map load timeout — forcing ready')
                        setReady(true)
                    }
                }, 5000)

                ;[200, 500, 1000, 2000].forEach((ms) =>
                    setTimeout(() => { if (m && !m._removed) m.resize() }, ms)
                )

                mapRef.current = m
            } catch (e) {
                console.error('Nav map init error:', e)
                // Force ready so loading screen disappears with error visible
                setReady(true)
            }
        }

        init()

        return () => {
            cancelled = true
            if (mapRef.current) {
                mapRef.current.remove()
                mapRef.current = null
            }
        }
    }, [initialPos]) // eslint-disable-line react-hooks/exhaustive-deps

    // Draw/update route polyline
    useEffect(() => {
        const m = mapRef.current
        if (!m || !ready || !route?.geometry) return

        try {
            if (m.getSource('nav-route')) {
                m.getSource('nav-route').setData(route.geometry)
            } else {
                m.addSource('nav-route', {
                    type: 'geojson',
                    data: route.geometry,
                })
                m.addLayer({
                    id: 'nav-route-glow',
                    type: 'line',
                    source: 'nav-route',
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: { 'line-color': '#4285F4', 'line-width': 14, 'line-opacity': 0.15, 'line-blur': 4 },
                })
                m.addLayer({
                    id: 'nav-route-line',
                    type: 'line',
                    source: 'nav-route',
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: { 'line-color': '#4285F4', 'line-width': 6, 'line-opacity': 0.9 },
                })
            }
        } catch (e) {
            console.warn('Route layer error:', e)
        }

        // Fit bounds to show full route
        if (route.coordinates && route.coordinates.length > 1 && mapboxglRef.current) {
            try {
                const bounds = route.coordinates.reduce(
                    (b, c) => b.extend(c),
                    new mapboxglRef.current.LngLatBounds(route.coordinates[0], route.coordinates[0])
                )
                m.fitBounds(bounds, { padding: { top: 120, bottom: 300, left: 60, right: 60 }, duration: 1000 })
            } catch (e) {
                console.warn('fitBounds error:', e)
            }
        }
    }, [route, ready])

    // Update user marker position smoothly
    useEffect(() => {
        const m = mapRef.current
        if (!m || !ready || !userPos || !mapboxglRef.current) return

        if (userMarkerRef.current) {
            userMarkerRef.current.setLngLat([userPos.lng, userPos.lat])
            const arrow = userMarkerRef.current.getElement()?.querySelector('svg')
            if (arrow) arrow.style.transform = `rotate(${userPos.heading || bearing || 0}deg)`
        } else {
            userMarkerRef.current = new mapboxglRef.current.Marker({
                element: buildNavUserMarker(userPos.heading || bearing || 0),
                anchor: 'center',
            }).setLngLat([userPos.lng, userPos.lat]).addTo(m)
        }

        // Follow user
        if (!arrived) {
            m.easeTo({
                center: [userPos.lng, userPos.lat],
                bearing: bearing || 0,
                duration: 1000,
                easing: (t) => t,
            })
        }
    }, [userPos, ready, bearing, arrived])

    // Destination marker
    useEffect(() => {
        const m = mapRef.current
        if (!m || !ready || !parking || !mapboxglRef.current) return

        if (!destMarkerRef.current) {
            destMarkerRef.current = new mapboxglRef.current.Marker({
                element: buildDestinationMarker(),
                anchor: 'bottom',
            }).setLngLat([parking.lng, parking.lat]).addTo(m)
        }
    }, [parking, ready])

    return (
        <div style={{ position: 'absolute', inset: 0 }}>
            <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
            {!ready && (
                <div style={{
                    position: 'absolute', inset: 0, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    background: '#1a1a2e', zIndex: 10,
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: 44, height: 44, border: '4px solid #4285F4',
                            borderTopColor: 'transparent', borderRadius: '50%',
                            animation: 'spin 1s linear infinite', margin: '0 auto 12px',
                        }} />
                        <p style={{ color: '#9CA3AF', fontSize: 14 }}>Loading navigation...</p>
                        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                    </div>
                </div>
            )}
        </div>
    )
}

export default NavigationMap




