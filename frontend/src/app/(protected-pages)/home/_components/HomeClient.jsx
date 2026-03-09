'use client'
import { useEffect, useState } from 'react'
import { apiGetActiveParkings } from '@/services/ParkingService'
import { apiGetMyReservations } from '@/services/ReservationService'
import { apiGetMyPayments } from '@/services/PaymentService'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import Link from 'next/link'
import {
    PiCarDuotone,
    PiCalendarCheckDuotone,
    PiCreditCardDuotone,
    PiMapPinDuotone,
    PiArrowRightBold,
} from 'react-icons/pi'

const statusColor = {
    ACTIVE: 'bg-emerald-500',
    COMPLETED: 'bg-blue-500',
    CANCELLED: 'bg-red-500',
    PENDING: 'bg-amber-500',
}

const HomeClient = () => {
    const [parkings, setParkings] = useState([])
    const [reservations, setReservations] = useState([])
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [parkingRes, reservationRes, paymentRes] = await Promise.all([
                    apiGetActiveParkings().catch(() => ({ data: [] })),
                    apiGetMyReservations().catch(() => ({ data: [] })),
                    apiGetMyPayments().catch(() => ({ data: [] })),
                ])
                setParkings(parkingRes?.data || [])
                setReservations(reservationRes?.data || [])
                setPayments(paymentRes?.data || [])
            } catch (error) {
                console.error('Failed to load dashboard data', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const activeReservations = reservations.filter(r => r.status === 'ACTIVE')
    const totalSpent = payments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0)

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
                <h3 className="font-bold">Dashboard</h3>
                <p className="text-gray-500">Welcome to Smart Parking</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-xl p-3">
                            <PiCarDuotone className="text-2xl text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Available Parkings</p>
                            <h4 className="font-bold">{parkings.length}</h4>
                        </div>
                    </div>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-xl p-3">
                            <PiCalendarCheckDuotone className="text-2xl text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Active Reservations</p>
                            <h4 className="font-bold">{activeReservations.length}</h4>
                        </div>
                    </div>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="bg-amber-100 dark:bg-amber-900/30 rounded-xl p-3">
                            <PiCalendarCheckDuotone className="text-2xl text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Total Reservations</p>
                            <h4 className="font-bold">{reservations.length}</h4>
                        </div>
                    </div>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="bg-purple-100 dark:bg-purple-900/30 rounded-xl p-3">
                            <PiCreditCardDuotone className="text-2xl text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Total Spent</p>
                            <h4 className="font-bold">{totalSpent.toFixed(2)} MAD</h4>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Active Reservations */}
            {activeReservations.length > 0 && (
                <Card>
                    <div className="flex items-center justify-between mb-4">
                        <h5 className="font-bold">Active Reservations</h5>
                        <Link href="/my-reservations">
                            <Button size="sm" variant="plain">
                                View All <PiArrowRightBold className="ml-1" />
                            </Button>
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="text-left text-gray-500 text-sm border-b dark:border-gray-700">
                                    <th className="pb-2 font-semibold">Parking</th>
                                    <th className="pb-2 font-semibold">Slot</th>
                                    <th className="pb-2 font-semibold">Start Time</th>
                                    <th className="pb-2 font-semibold">End Time</th>
                                    <th className="pb-2 font-semibold">Price</th>
                                    <th className="pb-2 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeReservations.slice(0, 5).map((r) => (
                                    <tr key={r.id} className="border-b dark:border-gray-700">
                                        <td className="py-3">{r.parkingName}</td>
                                        <td className="py-3">{r.slotNumber}</td>
                                        <td className="py-3">{new Date(r.startTime).toLocaleString()}</td>
                                        <td className="py-3">{new Date(r.endTime).toLocaleString()}</td>
                                        <td className="py-3 font-semibold">{r.totalPrice} MAD</td>
                                        <td className="py-3">
                                            <Tag className={`${statusColor[r.status]} text-white border-0`}>
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

            {/* Parkings List */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h5 className="font-bold">Available Parkings</h5>
                    <Link href="/parkings">
                        <Button size="sm" variant="plain">
                            View All <PiArrowRightBold className="ml-1" />
                        </Button>
                    </Link>
                </div>
                {parkings.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No parkings available</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {parkings.slice(0, 6).map((p) => (
                            <Link key={p.id} href={`/parkings/${p.id}`}>
                                <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <PiCarDuotone className="text-xl text-primary" />
                                            <h6 className="font-bold">{p.name}</h6>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                            <PiMapPinDuotone />
                                            <span>{p.address}</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-sm">
                                                <span className="text-emerald-500 font-bold">{p.availableSlots}</span> / {p.totalSlots} slots
                                            </span>
                                            <span className="font-bold text-primary">{p.pricePerHour} MAD/h</span>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    )
}

export default HomeClient

