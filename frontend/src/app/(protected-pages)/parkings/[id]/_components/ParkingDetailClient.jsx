'use client'
import { useEffect, useState } from 'react'
import { apiGetParkingById } from '@/services/ParkingService'
import { apiGetSlotsByParking } from '@/services/ParkingSlotService'
import { apiCreateReservation } from '@/services/ReservationService'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useRouter } from 'next/navigation'
import {
    PiCarDuotone,
    PiMapPinDuotone,
    PiArrowLeftBold,
    PiClockDuotone,
    PiCurrencyDollarDuotone,
} from 'react-icons/pi'

const slotStatusColor = {
    AVAILABLE: 'bg-emerald-500 hover:bg-emerald-600 cursor-pointer',
    OCCUPIED: 'bg-red-400',
    RESERVED: 'bg-amber-500',
    MAINTENANCE: 'bg-gray-400',
}

const slotTypeIcon = {
    STANDARD: '🅿️',
    HANDICAPPED: '♿',
    VIP: '⭐',
    ELECTRIC: '⚡',
}

const ParkingDetailClient = ({ parkingId }) => {
    const router = useRouter()
    const [parking, setParking] = useState(null)
    const [slots, setSlots] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedSlot, setSelectedSlot] = useState(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [parkingRes, slotsRes] = await Promise.all([
                    apiGetParkingById(parkingId),
                    apiGetSlotsByParking(parkingId),
                ])
                setParking(parkingRes?.data || null)
                setSlots(slotsRes?.data || [])
            } catch (error) {
                console.error('Failed to load parking details', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [parkingId])

    const handleSlotClick = (slot) => {
        if (slot.status !== 'AVAILABLE') return
        setSelectedSlot(slot)
        // Default: 1 hour from now
        const now = new Date()
        const start = new Date(now.getTime() + 60 * 60 * 1000)
        const end = new Date(start.getTime() + 60 * 60 * 1000)
        setStartTime(formatDateTimeLocal(start))
        setEndTime(formatDateTimeLocal(end))
        setDialogOpen(true)
    }

    const formatDateTimeLocal = (date) => {
        const pad = (n) => String(n).padStart(2, '0')
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
    }

    const handleReserve = async () => {
        if (!startTime || !endTime) return
        setSubmitting(true)
        try {
            await apiCreateReservation({
                parkingSlotId: selectedSlot.id,
                startTime: startTime + ':00',
                endTime: endTime + ':00',
            })
            toast.push(
                <Notification title="Reservation Created!" type="success">
                    Slot {selectedSlot.slotNumber} has been reserved successfully.
                </Notification>,
            )
            setDialogOpen(false)
            // Refresh slots
            const slotsRes = await apiGetSlotsByParking(parkingId)
            setSlots(slotsRes?.data || [])
        } catch (error) {
            toast.push(
                <Notification title="Reservation Failed" type="danger">
                    {error?.response?.data?.message || 'Failed to create reservation'}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            </div>
        )
    }

    if (!parking) {
        return (
            <Card>
                <div className="text-center py-12">
                    <p className="text-gray-400">Parking not found</p>
                    <Button className="mt-4" onClick={() => router.push('/parkings')}>
                        Back to Parkings
                    </Button>
                </div>
            </Card>
        )
    }

    // Group slots by floor
    const floors = [...new Set(slots.map(s => s.floor || 'Ground'))].sort()

    return (
        <div className="flex flex-col gap-6">
            <Button
                variant="plain"
                size="sm"
                className="self-start"
                onClick={() => router.push('/parkings')}
            >
                <PiArrowLeftBold className="mr-1" /> Back to Parkings
            </Button>

            {/* Parking Info */}
            <Card>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 rounded-xl p-4">
                            <PiCarDuotone className="text-3xl text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold">{parking.name}</h3>
                            <div className="flex items-center gap-1 text-gray-500 mt-1">
                                <PiMapPinDuotone />
                                <span>{parking.address}</span>
                            </div>
                            {parking.description && (
                                <p className="text-gray-400 text-sm mt-1">{parking.description}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-500">Available</p>
                            <p className="font-bold text-2xl text-emerald-500">{parking.availableSlots}</p>
                            <p className="text-xs text-gray-400">of {parking.totalSlots}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500">Price</p>
                            <p className="font-bold text-2xl text-primary">{parking.pricePerHour}</p>
                            <p className="text-xs text-gray-400">MAD / hour</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Legend */}
            <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-emerald-500" />
                    <span className="text-sm">Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-amber-500" />
                    <span className="text-sm">Reserved</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-400" />
                    <span className="text-sm">Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-400" />
                    <span className="text-sm">Maintenance</span>
                </div>
            </div>

            {/* Slots Grid by Floor */}
            {floors.map((floor) => (
                <Card key={floor}>
                    <h5 className="font-bold mb-4">Floor {floor}</h5>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                        {slots
                            .filter(s => (s.floor || 'Ground') === floor)
                            .map((slot) => (
                                <div
                                    key={slot.id}
                                    onClick={() => handleSlotClick(slot)}
                                    className={`${slotStatusColor[slot.status]} rounded-lg p-3 text-center text-white transition-all ${slot.status === 'AVAILABLE' ? 'transform hover:scale-105' : 'opacity-80'}`}
                                >
                                    <div className="text-lg">{slotTypeIcon[slot.slotType] || '🅿️'}</div>
                                    <div className="font-bold text-sm mt-1">{slot.slotNumber}</div>
                                    <div className="text-xs opacity-80">{slot.slotType}</div>
                                </div>
                            ))}
                    </div>
                </Card>
            ))}

            {/* Reservation Dialog */}
            <Dialog
                isOpen={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onRequestClose={() => setDialogOpen(false)}
            >
                <h5 className="font-bold mb-4">Reserve Slot {selectedSlot?.slotNumber}</h5>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-gray-500">
                        <PiCarDuotone />
                        <span>{parking?.name} - {selectedSlot?.slotType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                        <PiCurrencyDollarDuotone />
                        <span>{parking?.pricePerHour} MAD per hour</span>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Start Time</label>
                        <Input
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">End Time</label>
                        <Input
                            type="datetime-local"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                        />
                    </div>
                    {startTime && endTime && (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Estimated cost:</span>
                                <span className="font-bold text-primary">
                                    {Math.max(1, Math.ceil((new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60))) * (parking?.pricePerHour || 0)} MAD
                                </span>
                            </div>
                        </div>
                    )}
                    <div className="flex gap-2 justify-end mt-2">
                        <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button
                            variant="solid"
                            loading={submitting}
                            onClick={handleReserve}
                        >
                            {submitting ? 'Reserving...' : 'Confirm Reservation'}
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default ParkingDetailClient

