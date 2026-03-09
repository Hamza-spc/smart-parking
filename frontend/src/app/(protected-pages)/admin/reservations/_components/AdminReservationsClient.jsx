'use client'
import { useEffect, useState } from 'react'
import { apiGetAllReservations } from '@/services/AdminService'
import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import { PiCalendarCheckDuotone } from 'react-icons/pi'

const statusColor = {
    ACTIVE: 'bg-emerald-500',
    COMPLETED: 'bg-blue-500',
    CANCELLED: 'bg-red-500',
}

const AdminReservationsClient = () => {
    const [reservations, setReservations] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const res = await apiGetAllReservations()
                setReservations(res?.data || [])
            } catch (error) {
                console.error('Failed to load reservations', error)
            } finally {
                setLoading(false)
            }
        }
        fetchReservations()
    }, [])

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
                <h3 className="font-bold">All Reservations</h3>
                <p className="text-gray-500">Manage all system reservations ({reservations.length})</p>
            </div>

            {reservations.length === 0 ? (
                <Card>
                    <div className="text-center py-12">
                        <PiCalendarCheckDuotone className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-400">No reservations found</p>
                    </div>
                </Card>
            ) : (
                <Card>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="text-left text-gray-500 text-sm border-b dark:border-gray-700">
                                    <th className="pb-3 font-semibold">ID</th>
                                    <th className="pb-3 font-semibold">User</th>
                                    <th className="pb-3 font-semibold">Parking</th>
                                    <th className="pb-3 font-semibold">Slot</th>
                                    <th className="pb-3 font-semibold">Start</th>
                                    <th className="pb-3 font-semibold">End</th>
                                    <th className="pb-3 font-semibold">Price</th>
                                    <th className="pb-3 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservations.map((r) => (
                                    <tr key={r.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="py-3">#{r.id}</td>
                                        <td className="py-3 font-medium">{r.userFullName}</td>
                                        <td className="py-3">{r.parkingName}</td>
                                        <td className="py-3">{r.slotNumber}</td>
                                        <td className="py-3 text-sm">{new Date(r.startTime).toLocaleString()}</td>
                                        <td className="py-3 text-sm">{new Date(r.endTime).toLocaleString()}</td>
                                        <td className="py-3 font-bold">{r.totalPrice} MAD</td>
                                        <td className="py-3">
                                            <Tag className={`${statusColor[r.status] || 'bg-gray-500'} text-white border-0`}>
                                                {r.status}
                                            </Tag>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    )
}

export default AdminReservationsClient

