'use client'
import { useEffect, useState } from 'react'
import { apiGetAllUsers } from '@/services/AdminService'
import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import { PiUsersDuotone } from 'react-icons/pi'

const AdminUsersClient = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await apiGetAllUsers()
                setUsers(res?.data || [])
            } catch (error) {
                console.error('Failed to load users', error)
            } finally {
                setLoading(false)
            }
        }
        fetchUsers()
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
                <h3 className="font-bold">Users Management</h3>
                <p className="text-gray-500">All registered users ({users.length})</p>
            </div>

            {users.length === 0 ? (
                <Card>
                    <div className="text-center py-12">
                        <PiUsersDuotone className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-400">No users found</p>
                    </div>
                </Card>
            ) : (
                <Card>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="text-left text-gray-500 text-sm border-b dark:border-gray-700">
                                    <th className="pb-3 font-semibold">ID</th>
                                    <th className="pb-3 font-semibold">Full Name</th>
                                    <th className="pb-3 font-semibold">Email</th>
                                    <th className="pb-3 font-semibold">Phone</th>
                                    <th className="pb-3 font-semibold">Role</th>
                                    <th className="pb-3 font-semibold">Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="py-3">#{u.id}</td>
                                        <td className="py-3 font-medium">{u.fullName}</td>
                                        <td className="py-3">{u.email}</td>
                                        <td className="py-3">{u.phone || '—'}</td>
                                        <td className="py-3">
                                            <Tag className={`${u.role === 'ADMIN' ? 'bg-purple-500' : 'bg-blue-500'} text-white border-0`}>
                                                {u.role}
                                            </Tag>
                                        </td>
                                        <td className="py-3 text-sm">
                                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
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

export default AdminUsersClient

