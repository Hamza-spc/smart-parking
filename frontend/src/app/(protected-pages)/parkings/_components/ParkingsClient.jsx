'use client'
import { useEffect, useState } from 'react'
import { apiGetAllParkings, apiSearchParkings } from '@/services/ParkingService'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Tag from '@/components/ui/Tag'
import Link from 'next/link'
import { PiCarDuotone, PiMapPinDuotone, PiMagnifyingGlassBold } from 'react-icons/pi'

const ParkingsClient = () => {
    const [parkings, setParkings] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    const fetchParkings = async (query) => {
        setLoading(true)
        try {
            const res = query
                ? await apiSearchParkings(query)
                : await apiGetAllParkings()
            setParkings(res?.data || [])
        } catch (error) {
            console.error('Failed to load parkings', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchParkings()
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchParkings(search)
        }, 400)
        return () => clearTimeout(timer)
    }, [search])

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-bold">Parkings</h3>
                    <p className="text-gray-500">Find and reserve parking spots</p>
                </div>
            </div>

            <div className="relative max-w-md">
                <Input
                    placeholder="Search parkings..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    prefix={<PiMagnifyingGlassBold className="text-lg" />}
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                </div>
            ) : parkings.length === 0 ? (
                <Card>
                    <div className="text-center py-12">
                        <PiCarDuotone className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-400">No parkings found</p>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {parkings.map((parking) => (
                        <Link key={parking.id} href={`/parkings/${parking.id}`}>
                            <Card className="hover:shadow-lg transition-all cursor-pointer border border-gray-200 dark:border-gray-700 h-full">
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-primary/10 rounded-lg p-2">
                                                <PiCarDuotone className="text-xl text-primary" />
                                            </div>
                                            <h5 className="font-bold">{parking.name}</h5>
                                        </div>
                                        <Tag className={`${parking.active ? 'bg-emerald-500' : 'bg-red-500'} text-white border-0`}>
                                            {parking.active ? 'Active' : 'Inactive'}
                                        </Tag>
                                    </div>

                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <PiMapPinDuotone className="flex-shrink-0" />
                                        <span className="truncate">{parking.address}</span>
                                    </div>

                                    {parking.description && (
                                        <p className="text-sm text-gray-400 line-clamp-2">{parking.description}</p>
                                    )}

                                    <div className="border-t dark:border-gray-700 pt-3 mt-1 flex items-center justify-between">
                                        <div className="text-sm">
                                            <span className="text-emerald-500 font-bold text-lg">{parking.availableSlots}</span>
                                            <span className="text-gray-400"> / {parking.totalSlots} slots available</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-primary text-lg">{parking.pricePerHour}</span>
                                            <span className="text-gray-400 text-sm"> MAD/h</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ParkingsClient

