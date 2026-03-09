'use client'
import { useEffect, useState } from 'react'
import { apiGetAllPayments } from '@/services/AdminService'
import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import { PiCreditCardDuotone } from 'react-icons/pi'

const statusColor = {
    PENDING: 'bg-amber-500',
    COMPLETED: 'bg-emerald-500',
    FAILED: 'bg-red-500',
    REFUNDED: 'bg-blue-500',
}

const AdminPaymentsClient = () => {
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const res = await apiGetAllPayments()
                setPayments(res?.data || [])
            } catch (error) {
                console.error('Failed to load payments', error)
            } finally {
                setLoading(false)
            }
        }
        fetchPayments()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            </div>
        )
    }

    const totalRevenue = payments
        .filter((p) => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + p.amount, 0)

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-bold">All Payments</h3>
                    <p className="text-gray-500">Manage all system payments ({payments.length})</p>
                </div>
                <Card className="!p-3">
                    <div className="text-sm text-gray-500">Total Revenue</div>
                    <div className="font-bold text-lg text-emerald-500">{totalRevenue.toFixed(2)} MAD</div>
                </Card>
            </div>

            {payments.length === 0 ? (
                <Card>
                    <div className="text-center py-12">
                        <PiCreditCardDuotone className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-400">No payments found</p>
                    </div>
                </Card>
            ) : (
                <Card>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="text-left text-gray-500 text-sm border-b dark:border-gray-700">
                                    <th className="pb-3 font-semibold">ID</th>
                                    <th className="pb-3 font-semibold">Reservation #</th>
                                    <th className="pb-3 font-semibold">User ID</th>
                                    <th className="pb-3 font-semibold">Amount</th>
                                    <th className="pb-3 font-semibold">Method</th>
                                    <th className="pb-3 font-semibold">Status</th>
                                    <th className="pb-3 font-semibold">Paid At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((p) => (
                                    <tr key={p.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="py-3">#{p.id}</td>
                                        <td className="py-3">#{p.reservationId}</td>
                                        <td className="py-3">#{p.userId}</td>
                                        <td className="py-3 font-bold">{p.amount} MAD</td>
                                        <td className="py-3">{p.paymentMethod || '—'}</td>
                                        <td className="py-3">
                                            <Tag className={`${statusColor[p.status] || 'bg-gray-500'} text-white border-0`}>
                                                {p.status}
                                            </Tag>
                                        </td>
                                        <td className="py-3 text-sm">
                                            {p.paidAt ? new Date(p.paidAt).toLocaleString() : '—'}
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

export default AdminPaymentsClient

