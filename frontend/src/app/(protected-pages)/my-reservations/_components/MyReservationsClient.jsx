'use client'
import { useEffect, useState } from 'react'
import { apiGetMyReservations, apiCancelReservation } from '@/services/ReservationService'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import Dialog from '@/components/ui/Dialog'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { PiCalendarCheckDuotone, PiXCircleDuotone } from 'react-icons/pi'

const statusColor = {
    ACTIVE: { bg: 'bg-emerald-500', text: 'text-white' },
    COMPLETED: { bg: 'bg-blue-500', text: 'text-white' },
    CANCELLED: { bg: 'bg-red-500', text: 'text-white' },
}

const MyReservationsClient = () => {
    const [reservations, setReservations] = useState([])
    const [loading, setLoading] = useState(true)
    const [cancelDialog, setCancelDialog] = useState(false)
    const [selectedId, setSelectedId] = useState(null)
    const [cancelling, setCancelling] = useState(false)

    const fetchReservations = async () => {
        setLoading(true)
        try {
            const res = await apiGetMyReservations()
            setReservations(res?.data || [])
        } catch (error) {
            console.error('Failed to load reservations', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchReservations()
    }, [])

    const handleCancelClick = (id) => {
        setSelectedId(id)
        setCancelDialog(true)
    }

    const handleConfirmCancel = async () => {
        setCancelling(true)
        try {
            await apiCancelReservation(selectedId)
            toast.push(
                <Notification title="Reservation Cancelled" type="success">
                    Your reservation has been cancelled successfully.
                </Notification>,
            )
            setCancelDialog(false)
            fetchReservations()
        } catch (error) {
            toast.push(
                <Notification title="Cancel Failed" type="danger">
                    {error?.response?.data?.message || 'Failed to cancel reservation'}
                </Notification>,
            )
        } finally {
            setCancelling(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h3 className="font-bold">My Reservations</h3>
                <p className="text-gray-500">View and manage your parking reservations</p>
            </div>

            {reservations.length === 0 ? (
                <Card>
                    <div className="text-center py-12">
                        <PiCalendarCheckDuotone className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-400">No reservations yet</p>
                        <Button className="mt-4" variant="solid" onClick={() => window.location.href = '/parkings'}>
                            Browse Parkings
                        </Button>
                    </div>
                </Card>
            ) : (
                <Card>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="text-left text-gray-500 text-sm border-b dark:border-gray-700">
                                    <th className="pb-3 font-semibold">ID</th>
                                    <th className="pb-3 font-semibold">Parking</th>
                                    <th className="pb-3 font-semibold">Slot</th>
                                    <th className="pb-3 font-semibold">Start Time</th>
                                    <th className="pb-3 font-semibold">End Time</th>
                                    <th className="pb-3 font-semibold">Total Price</th>
                                    <th className="pb-3 font-semibold">Status</th>
                                    <th className="pb-3 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservations.map((r) => (
                                    <tr key={r.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="py-3">#{r.id}</td>
                                        <td className="py-3 font-medium">{r.parkingName}</td>
                                        <td className="py-3">{r.slotNumber}</td>
                                        <td className="py-3 text-sm">{new Date(r.startTime).toLocaleString()}</td>
                                        <td className="py-3 text-sm">{new Date(r.endTime).toLocaleString()}</td>
                                        <td className="py-3 font-bold">{r.totalPrice} MAD</td>
                                        <td className="py-3">
                                            <Tag className={`${statusColor[r.status]?.bg || 'bg-gray-500'} ${statusColor[r.status]?.text || 'text-white'} border-0`}>
                                                {r.status}
                                            </Tag>
                                        </td>
                                        <td className="py-3">
                                            {r.status === 'ACTIVE' && (
                                                <Button
                                                    size="xs"
                                                    variant="plain"
                                                    className="text-red-500 hover:text-red-700"
                                                    onClick={() => handleCancelClick(r.id)}
                                                >
                                                    <PiXCircleDuotone className="text-lg mr-1" /> Cancel
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            <Dialog
                isOpen={cancelDialog}
                onClose={() => setCancelDialog(false)}
                onRequestClose={() => setCancelDialog(false)}
            >
                <h5 className="font-bold mb-4">Cancel Reservation</h5>
                <p className="text-gray-500 mb-6">
                    Are you sure you want to cancel this reservation? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                    <Button onClick={() => setCancelDialog(false)}>No, Keep it</Button>
                    <Button
                        variant="solid"
                        color="red-600"
                        loading={cancelling}
                        className="bg-red-500 hover:bg-red-600 text-white"
                        onClick={handleConfirmCancel}
                    >
                        {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                    </Button>
                </div>
            </Dialog>
        </div>
    )
}

export default MyReservationsClient

