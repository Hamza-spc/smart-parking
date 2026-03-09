'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiGetActiveParkings } from '@/services/ParkingService'
import { apiGetAvailableSlots } from '@/services/ParkingSlotService'
import { apiCreateReservation } from '@/services/ReservationService'
import ParkingMap from './ParkingMap'
import ParkingFilters from './ParkingFilters'
import ParkingList from './ParkingList'
import ParkingDetailCard from './ParkingDetailCard'
import ReservationModal from './ReservationModal'
import NavigationMap from './NavigationMap'
import NavigationPanel from './NavigationPanel'
import useNavigation from './useNavigation'
import MapSkeleton from './MapSkeleton'
import { calculateDistance } from './utils'

// Fallback parking data for Marrakech when backend is unavailable
const MARRAKECH_PARKINGS = [
    { id: 'f1', name: 'Parking Jemaa el-Fna', address: 'Place Jemaa el-Fna, Medina', latitude: 31.6258, longitude: -7.9891, totalSlots: 50, availableSlots: 5, pricePerHour: 10, parkingType: 'Outdoor', rating: '4.5' },
    { id: 'f2', name: 'Parking Riad Zitoun', address: 'Rue Riad Zitoun el Jdid, Medina', latitude: 31.6210, longitude: -7.9860, totalSlots: 25, availableSlots: 2, pricePerHour: 7, parkingType: 'Outdoor', rating: '3.8' },
    { id: 'f3', name: 'Parking Bab Agnaou', address: 'Bab Agnaou, Medina', latitude: 31.6195, longitude: -7.9905, totalSlots: 40, availableSlots: 4, pricePerHour: 8, parkingType: 'Outdoor', rating: '3.6' },
    { id: 'f4', name: 'Parking Koutoubia', address: 'Avenue Mohammed V, Medina', latitude: 31.6240, longitude: -7.9935, totalSlots: 80, availableSlots: 8, pricePerHour: 10, parkingType: 'Outdoor', rating: '4.2' },
    { id: 'f5', name: 'Parking Gare Marrakech', address: 'Avenue Hassan II, Gueliz', latitude: 31.6325, longitude: -8.0149, totalSlots: 100, availableSlots: 12, pricePerHour: 8, parkingType: 'Covered', rating: '4.4' },
    { id: 'f6', name: 'Parking Carré Eden', address: 'Boulevard Mohammed V, Gueliz', latitude: 31.6367, longitude: -8.0082, totalSlots: 120, availableSlots: 15, pricePerHour: 12, parkingType: 'EV Charging', rating: '4.1' },
    { id: 'f7', name: 'Parking Plaza Marrakech', address: 'Avenue Mohammed V, Gueliz', latitude: 31.6300, longitude: -7.9950, totalSlots: 80, availableSlots: 6, pricePerHour: 20, parkingType: 'Covered', rating: '3.9' },
    { id: 'f8', name: 'Parking Liberté', address: 'Place de la Liberté, Gueliz', latitude: 31.6350, longitude: -8.0050, totalSlots: 60, availableSlots: 7, pricePerHour: 10, parkingType: 'Outdoor', rating: '3.7' },
    { id: 'f9', name: 'Parking 16 Novembre', address: 'Place du 16 Novembre, Gueliz', latitude: 31.6360, longitude: -8.0100, totalSlots: 90, availableSlots: 10, pricePerHour: 12, parkingType: 'Covered', rating: '4.0' },
    { id: 'f10', name: 'Parking Hivernage', address: 'Avenue Echouhada, Hivernage', latitude: 31.6220, longitude: -8.0100, totalSlots: 70, availableSlots: 8, pricePerHour: 15, parkingType: 'Covered', rating: '4.3' },
    { id: 'f11', name: 'Parking Palais des Congrès', address: 'Avenue de France, Hivernage', latitude: 31.6200, longitude: -8.0060, totalSlots: 150, availableSlots: 20, pricePerHour: 15, parkingType: 'Covered', rating: '4.5' },
    { id: 'f12', name: 'Parking Majorelle', address: 'Rue Yves Saint Laurent', latitude: 31.6417, longitude: -8.0032, totalSlots: 30, availableSlots: 3, pricePerHour: 5, parkingType: 'Outdoor', rating: '3.9' },
    { id: 'f13', name: 'Parking Semlalia', address: 'Avenue Yacoub El Mansour, Semlalia', latitude: 31.6380, longitude: -8.0150, totalSlots: 55, availableSlots: 6, pricePerHour: 7, parkingType: 'Outdoor', rating: '3.5' },
    { id: 'f14', name: 'Parking Menara Mall', address: 'Avenue Mohammed VI', latitude: 31.6340, longitude: -8.0280, totalSlots: 200, availableSlots: 25, pricePerHour: 15, parkingType: 'Covered', rating: '4.6' },
    { id: 'f15', name: 'Parking Menara Gardens', address: 'Avenue de la Menara', latitude: 31.6250, longitude: -8.0220, totalSlots: 100, availableSlots: 15, pricePerHour: 5, parkingType: 'Outdoor', rating: '4.0' },
    { id: 'f16', name: 'Parking Al Mazar', address: "Route de l'Ourika", latitude: 31.6150, longitude: -7.9750, totalSlots: 180, availableSlots: 18, pricePerHour: 12, parkingType: 'Covered', rating: '4.3' },
    { id: 'f17', name: 'Parking Bab Doukkala', address: 'Place Bab Doukkala', latitude: 31.6320, longitude: -7.9960, totalSlots: 60, availableSlots: 5, pricePerHour: 7, parkingType: 'Outdoor', rating: '3.6' },
    { id: 'f18', name: 'Parking Bab Jdid', address: 'Bab Jdid', latitude: 31.6190, longitude: -7.9980, totalSlots: 35, availableSlots: 4, pricePerHour: 6, parkingType: 'Outdoor', rating: '3.4' },
    { id: 'f19', name: 'Parking Palmeraie', address: 'Route de la Palmeraie', latitude: 31.6700, longitude: -8.0050, totalSlots: 50, availableSlots: 10, pricePerHour: 10, parkingType: 'Outdoor', rating: '4.1' },
    { id: 'f20', name: 'Parking Targa', address: 'Route de Fès, Targa', latitude: 31.6500, longitude: -7.9800, totalSlots: 45, availableSlots: 8, pricePerHour: 5, parkingType: 'Outdoor', rating: '3.3' },
    { id: 'f21', name: 'Parking Sidi Ghanem', address: 'Quartier Industriel Sidi Ghanem', latitude: 31.6580, longitude: -8.0250, totalSlots: 70, availableSlots: 12, pricePerHour: 5, parkingType: 'Outdoor', rating: '3.2' },
    { id: 'f22', name: 'Parking Marjane Ménara', address: 'Route de Casablanca', latitude: 31.6420, longitude: -8.0350, totalSlots: 120, availableSlots: 20, pricePerHour: 5, parkingType: 'Covered', rating: '3.8' },
    { id: 'f23', name: 'Parking Bab Ighli', address: 'Bab Ighli', latitude: 31.6120, longitude: -7.9920, totalSlots: 30, availableSlots: 3, pricePerHour: 8, parkingType: 'Outdoor', rating: '3.5' },
    { id: 'f24', name: 'Parking Moulay El Yazid', address: 'Rue de la Kasbah, Medina', latitude: 31.6180, longitude: -7.9930, totalSlots: 30, availableSlots: 4, pricePerHour: 6, parkingType: 'Outdoor', rating: '3.4' },
    { id: 'f25', name: 'Parking Daoudiate', address: 'Quartier Daoudiate', latitude: 31.6450, longitude: -8.0200, totalSlots: 40, availableSlots: 6, pricePerHour: 5, parkingType: 'Outdoor', rating: '3.3' },
    { id: 'f26', name: 'Parking Massira', address: 'Quartier Massira', latitude: 31.6400, longitude: -8.0300, totalSlots: 50, availableSlots: 9, pricePerHour: 4, parkingType: 'Outdoor', rating: '3.1' },
    { id: 'f27', name: 'Parking Royal Tennis', address: 'Rue du Temple, Hivernage', latitude: 31.6190, longitude: -8.0040, totalSlots: 45, availableSlots: 5, pricePerHour: 10, parkingType: 'Covered', rating: '4.0' },
    { id: 'f28', name: 'Parking Bab Nkob', address: 'Rue de Yougoslavie, Gueliz', latitude: 31.6335, longitude: -8.0010, totalSlots: 35, availableSlots: 4, pricePerHour: 8, parkingType: 'Outdoor', rating: '3.5' },
    { id: 'f29', name: 'Parking Royal Agdal', address: 'Avenue Mohammed VI, Agdal', latitude: 31.6050, longitude: -7.9850, totalSlots: 40, availableSlots: 6, pricePerHour: 8, parkingType: 'Outdoor', rating: '3.7' },
    { id: 'f30', name: 'Parking Palmeraie Golf', address: 'Circuit de la Palmeraie', latitude: 31.6650, longitude: -7.9900, totalSlots: 80, availableSlots: 15, pricePerHour: 15, parkingType: 'Covered', rating: '4.4' },
]

const ParkingMapClient = () => {
    const [parkings, setParkings] = useState([])
    const [filteredParkings, setFilteredParkings] = useState([])
    const [selectedParking, setSelectedParking] = useState(null)
    const [availableSlots, setAvailableSlots] = useState([])
    const [userLocation, setUserLocation] = useState(null)
    const [loading, setLoading] = useState(true)
    const [slotsLoading, setSlotsLoading] = useState(false)
    const [reservationModal, setReservationModal] = useState(false)
    const [reserving, setReserving] = useState(false)
    const [panelOpen, setPanelOpen] = useState(true)
    const hasFetchedRef = useRef(false)
    const [filters, setFilters] = useState({
        distance: 10,
        priceMin: 0,
        priceMax: 100,
        parkingType: 'all',
        availableOnly: false,
    })

    // Navigation hook
    const nav = useNavigation(selectedParking)

    const handleNavigate = useCallback(() => {
        if (selectedParking && userLocation) {
            nav.startNavigation(userLocation)
        }
    }, [selectedParking, userLocation, nav])

    const handleCancelNavigation = useCallback(() => {
        nav.stopNavigation()
    }, [nav])

    // Get user REAL location with live tracking
    useEffect(() => {
        let watchId = null

        if (navigator.geolocation) {
            // First get a quick position
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    })
                },
                (error) => {
                    console.warn('Geolocation error:', error.message)
                    // Fallback to Marrakech center
                    setUserLocation({ lat: 31.6295, lng: -7.9811 })
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
            )

            // Then watch for continuous updates
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    })
                },
                (error) => {
                    console.warn('Geolocation watch error:', error.message)
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
            )
        } else {
            setUserLocation({ lat: 31.6295, lng: -7.9811 })
        }

        return () => {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId)
            }
        }
    }, [])

    // Fetch parkings
    useEffect(() => {
        const fetchParkings = async () => {
            setLoading(true)
            try {
                const res = await apiGetActiveParkings()
                const data = res?.data || []

                let enriched
                if (data.length > 0) {
                    // Use backend data — map latitude/longitude to lat/lng
                    enriched = data.map((p, i) => ({
                        ...p,
                        lat: p.latitude || 31.6295,
                        lng: p.longitude || -7.9811,
                        rating: p.rating || (3.0 + Math.random() * 2).toFixed(1),
                        parkingType: p.parkingType || ['Covered', 'Outdoor', 'EV Charging'][i % 3],
                    }))
                } else {
                    // Fallback to hardcoded Marrakech parkings
                    enriched = MARRAKECH_PARKINGS.map((p) => ({
                        ...p,
                        lat: p.latitude,
                        lng: p.longitude,
                    }))
                }
                setParkings(enriched)
            } catch (error) {
                console.error('Failed to load parkings from backend, using fallback data', error)
                // Use fallback data
                const enriched = MARRAKECH_PARKINGS.map((p) => ({
                    ...p,
                    lat: p.latitude,
                    lng: p.longitude,
                }))
                setParkings(enriched)
            } finally {
                setLoading(false)
            }
        }

        if (userLocation && !hasFetchedRef.current) {
            hasFetchedRef.current = true
            fetchParkings()
        }
    }, [userLocation])

    // Apply filters and sort by distance
    useEffect(() => {
        if (!userLocation || parkings.length === 0) return

        let result = parkings.map((p) => ({
            ...p,
            distance: calculateDistance(userLocation.lat, userLocation.lng, p.lat, p.lng),
        }))

        // Filter by distance
        result = result.filter((p) => p.distance <= filters.distance)

        // Filter by price
        result = result.filter(
            (p) => p.pricePerHour >= filters.priceMin && p.pricePerHour <= filters.priceMax
        )

        // Filter by type
        if (filters.parkingType !== 'all') {
            result = result.filter((p) => p.parkingType === filters.parkingType)
        }

        // Filter available only
        if (filters.availableOnly) {
            result = result.filter((p) => (p.availableSlots || 0) > 0)
        }

        // Sort by distance
        result.sort((a, b) => a.distance - b.distance)

        setFilteredParkings(result)
    }, [parkings, filters, userLocation])

    // Fetch available slots when parking is selected
    const handleSelectParking = useCallback(async (parking) => {
        setSelectedParking(parking)
        setSlotsLoading(true)
        try {
            const res = await apiGetAvailableSlots(parking.id)
            setAvailableSlots(res?.data || [])
        } catch (error) {
            console.error('Failed to load slots', error)
            setAvailableSlots([])
        } finally {
            setSlotsLoading(false)
        }
    }, [])

    const handleReserve = async (slotId, startTime, endTime) => {
        setReserving(true)
        try {
            await apiCreateReservation({
                parkingSlotId: slotId,
                startTime,
                endTime,
            })
            setReservationModal(false)
            setSelectedParking(null)
            // Refresh parkings
            const res = await apiGetActiveParkings()
            const data = res?.data || []
            const enriched = data.map((p, i) => ({
                ...p,
                lat: p.latitude || parkings.find((op) => op.id === p.id)?.lat || 31.6295,
                lng: p.longitude || parkings.find((op) => op.id === p.id)?.lng || -7.9811,
                rating: p.rating || parkings.find((op) => op.id === p.id)?.rating || '4.0',
                parkingType: p.parkingType || parkings.find((op) => op.id === p.id)?.parkingType || 'Outdoor',
            }))
            setParkings(enriched)
            alert('Reservation created successfully!')
        } catch (error) {
            console.error('Failed to create reservation', error)
            alert('Failed to create reservation. Please try again.')
        } finally {
            setReserving(false)
        }
    }

    if (!userLocation || loading) {
        return <MapSkeleton />
    }

    const nearestParking = filteredParkings.length > 0 ? filteredParkings[0] : null

    // ========== NAVIGATION MODE ==========
    if (nav.navigating) {
        const currentStep = nav.route?.steps?.[nav.currentStepIndex] || null
        const nextStep = nav.route?.steps?.[nav.currentStepIndex + 1] || null

        return (
            <div className="relative h-[calc(100vh-80px)] w-full overflow-hidden rounded-2xl bg-gray-900">
                {/* Full-screen navigation map */}
                <NavigationMap
                    route={nav.route}
                    userPos={nav.userPos}
                    parking={selectedParking}
                    bearing={nav.bearing}
                    arrived={nav.arrived}
                />

                {/* Navigation bottom panel */}
                <AnimatePresence>
                    <NavigationPanel
                        parking={selectedParking}
                        distanceRemaining={nav.distanceRemaining}
                        durationRemaining={nav.durationRemaining}
                        currentStep={currentStep}
                        nextStep={nextStep}
                        bearing={nav.bearing}
                        arrived={nav.arrived}
                        onCancel={handleCancelNavigation}
                    />
                </AnimatePresence>

                {/* Loading overlay */}
                <AnimatePresence>
                    {nav.loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                position: 'absolute', inset: 0, zIndex: 60,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                            }}
                        >
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: 48, height: 48, border: '4px solid #4285F4',
                                    borderTopColor: 'transparent', borderRadius: '50%',
                                    animation: 'spin 1s linear infinite', margin: '0 auto 12px',
                                }} />
                                <p style={{ color: 'white', fontSize: 15, fontWeight: 600 }}>Calculating route...</p>
                                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error banner */}
                <AnimatePresence>
                    {nav.error && (
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -50, opacity: 0 }}
                            style={{
                                position: 'absolute', top: 16, left: 16, right: 16, zIndex: 60,
                                background: '#FEE2E2', borderRadius: 16, padding: '12px 20px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            }}
                        >
                            <p style={{ color: '#EF4444', fontSize: 13, fontWeight: 600 }}>⚠ {nav.error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        )
    }

    // ========== NORMAL MAP MODE ==========
    return (
        <div className="relative h-[calc(100vh-80px)] w-full overflow-hidden rounded-2xl bg-white dark:bg-gray-900">
            {/* Filters bar */}
            <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-4">
                <ParkingFilters filters={filters} onFilterChange={setFilters} />
            </div>

            {/* Map */}
            <div className="absolute inset-0">
                <ParkingMap
                    parkings={filteredParkings}
                    userLocation={userLocation}
                    selectedParking={selectedParking}
                    nearestParking={nearestParking}
                    onSelectParking={handleSelectParking}
                />
            </div>

            {/* Selected parking detail card */}
            <AnimatePresence>
                {selectedParking && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="absolute bottom-4 left-4 right-4 z-30 md:left-auto md:right-4 md:bottom-4 md:w-96"
                    >
                        <ParkingDetailCard
                            parking={selectedParking}
                            slotsLoading={slotsLoading}
                            onReserve={() => setReservationModal(true)}
                            onNavigate={handleNavigate}
                            onClose={() => setSelectedParking(null)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom sliding panel - parking list */}
            <div className="absolute bottom-0 left-0 right-0 z-10">
                <motion.div
                    initial={false}
                    animate={{ height: panelOpen ? 280 : 48 }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    className="bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl border-t border-gray-100 dark:border-gray-700 overflow-hidden"
                >
                    {/* Handle bar */}
                    <button
                        onClick={() => setPanelOpen(!panelOpen)}
                        className="w-full flex items-center justify-center py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                        <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                    </button>
                    <div className="px-4 pb-2 flex items-center justify-between">
                        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                            {filteredParkings.length} Parking{filteredParkings.length !== 1 ? 's' : ''} Nearby
                        </h4>
                        <span className="text-xs text-gray-400">Sorted by distance</span>
                    </div>
                    {panelOpen && (
                        <ParkingList
                            parkings={filteredParkings}
                            selectedParking={selectedParking}
                            nearestParking={nearestParking}
                            onSelect={handleSelectParking}
                        />
                    )}
                </motion.div>
            </div>

            {/* Reservation Modal */}
            <AnimatePresence>
                {reservationModal && selectedParking && (
                    <ReservationModal
                        parking={selectedParking}
                        slots={availableSlots}
                        reserving={reserving}
                        onReserve={handleReserve}
                        onClose={() => setReservationModal(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

export default ParkingMapClient




