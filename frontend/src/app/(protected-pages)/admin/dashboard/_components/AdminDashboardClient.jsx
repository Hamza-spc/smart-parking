'use client'
import { useEffect, useState } from 'react'
import { apiGetDashboard } from '@/services/AdminService'
import Card from '@/components/ui/Card'
import {
    PiCarDuotone,
    PiUsersDuotone,
    PiCalendarCheckDuotone,
    PiCreditCardDuotone,
    PiSquaresFourDuotone,
    PiChartBarDuotone,
} from 'react-icons/pi'

const AdminDashboardClient = () => {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await apiGetDashboard()
                setStats(res?.data || null)
            } catch (error) {
                console.error('Failed to load dashboard', error)
            } finally {
                setLoading(false)
            }
        }
        fetchDashboard()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            </div>
        )
    }

    if (!stats) {
        return (
            <Card>
                <div className="text-center py-12">
                    <p className="text-gray-400">Failed to load dashboard data</p>
                </div>
            </Card>
        )
    }

    const statCards = [
        {
            label: 'Total Parkings',
            value: stats.totalParkings,
            icon: <PiCarDuotone className="text-2xl text-blue-600 dark:text-blue-400" />,
            bg: 'bg-blue-100 dark:bg-blue-900/30',
        },
        {
            label: 'Total Slots',
            value: stats.totalSlots,
            icon: <PiSquaresFourDuotone className="text-2xl text-indigo-600 dark:text-indigo-400" />,
            bg: 'bg-indigo-100 dark:bg-indigo-900/30',
        },
        {
            label: 'Available Slots',
            value: stats.availableSlots,
            icon: <PiSquaresFourDuotone className="text-2xl text-emerald-600 dark:text-emerald-400" />,
            bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        },
        {
            label: 'Total Users',
            value: stats.totalUsers,
            icon: <PiUsersDuotone className="text-2xl text-purple-600 dark:text-purple-400" />,
            bg: 'bg-purple-100 dark:bg-purple-900/30',
        },
        {
            label: 'Active Reservations',
            value: stats.activeReservations,
            icon: <PiCalendarCheckDuotone className="text-2xl text-amber-600 dark:text-amber-400" />,
            bg: 'bg-amber-100 dark:bg-amber-900/30',
        },
        {
            label: "Today's Reservations",
            value: stats.todayReservations,
            icon: <PiChartBarDuotone className="text-2xl text-cyan-600 dark:text-cyan-400" />,
            bg: 'bg-cyan-100 dark:bg-cyan-900/30',
        },
        {
            label: 'Total Revenue',
            value: `${(stats.totalRevenue || 0).toFixed(2)} MAD`,
            icon: <PiCreditCardDuotone className="text-2xl text-green-600 dark:text-green-400" />,
            bg: 'bg-green-100 dark:bg-green-900/30',
        },
    ]

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h3 className="font-bold">Admin Dashboard</h3>
                <p className="text-gray-500">Overview of your parking system</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {statCards.map((card) => (
                    <Card key={card.label} className="hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className={`${card.bg} rounded-xl p-3`}>
                                {card.icon}
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">{card.label}</p>
                                <h4 className="font-bold text-xl">{card.value}</h4>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Occupancy Overview */}
            <Card>
                <h5 className="font-bold mb-4">Slot Occupancy</h5>
                <div className="flex items-center gap-4">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                        <div
                            className="bg-emerald-500 h-full rounded-full transition-all"
                            style={{
                                width: stats.totalSlots > 0
                                    ? `${(stats.availableSlots / stats.totalSlots) * 100}%`
                                    : '0%',
                            }}
                        />
                    </div>
                    <span className="font-bold text-sm whitespace-nowrap">
                        {stats.totalSlots > 0
                            ? `${((stats.availableSlots / stats.totalSlots) * 100).toFixed(1)}%`
                            : '0%'} available
                    </span>
                </div>
                <div className="flex gap-6 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span>Available: {stats.availableSlots}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-400" />
                        <span>Occupied/Reserved: {stats.totalSlots - stats.availableSlots}</span>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default AdminDashboardClient

