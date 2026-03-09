'use client'
import { useEffect, useState } from 'react'
import { apiGetMyPayments } from '@/services/PaymentService'
import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import { PiCreditCardDuotone } from 'react-icons/pi'

const statusColor = {
    PENDING: 'bg-amber-500',
    COMPLETED: 'bg-emerald-500',
    FAILED: 'bg-red-500',
    REFUNDED: 'bg-blue-500',
}

const MyPaymentsClient = () => {
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const res = await apiGetMyPayments()
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

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h3 className="font-bold">My Payments</h3>
                <p className="text-gray-500">View your payment history</p>
            </div>

            {payments.length === 0 ? (
                <Card>
                    <div className="text-center py-12">
                        <PiCreditCardDuotone className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-400">No payments yet</p>
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

export default MyPaymentsClient

