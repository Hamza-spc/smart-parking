'use client'

import { motion } from 'framer-motion'
import { PiMapPinDuotone, PiCurrencyDollarBold, PiCarDuotone, PiBatteryChargingDuotone, PiBuildingsDuotone, PiTreeDuotone } from 'react-icons/pi'

const distanceOptions = [
    { value: 1, label: '1 km' },
    { value: 3, label: '3 km' },
    { value: 5, label: '5 km' },
    { value: 10, label: '10 km' },
]

const typeOptions = [
    { value: 'all', label: 'All Types', icon: PiCarDuotone },
    { value: 'Covered', label: 'Covered', icon: PiBuildingsDuotone },
    { value: 'Outdoor', label: 'Outdoor', icon: PiTreeDuotone },
    { value: 'EV Charging', label: 'EV', icon: PiBatteryChargingDuotone },
]

const ParkingFilters = ({ filters, onFilterChange }) => {
    const updateFilter = (key, value) => {
        onFilterChange({ ...filters, [key]: value })
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-3"
        >
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
                {/* Distance filter */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <PiMapPinDuotone className="text-blue-500 text-lg" />
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-0.5">
                        {distanceOptions.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => updateFilter('distance', opt.value)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                                    filters.distance === opt.value
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 flex-shrink-0" />

                {/* Type filter */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    {typeOptions.map((opt) => {
                        const Icon = opt.icon
                        return (
                            <button
                                key={opt.value}
                                onClick={() => updateFilter('parkingType', opt.value)}
                                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 ${
                                    filters.parkingType === opt.value
                                        ? 'bg-indigo-500 text-white shadow-md'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                <Icon className="text-sm" />
                                <span className="hidden sm:inline">{opt.label}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 flex-shrink-0" />

                {/* Available only toggle */}
                <button
                    onClick={() => updateFilter('availableOnly', !filters.availableOnly)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 flex-shrink-0 ${
                        filters.availableOnly
                            ? 'bg-emerald-500 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                    <span className={`w-2 h-2 rounded-full ${filters.availableOnly ? 'bg-white' : 'bg-emerald-400'}`} />
                    Available
                </button>

                {/* Price range */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <PiCurrencyDollarBold className="text-amber-500 text-lg" />
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={filters.priceMax}
                        onChange={(e) => updateFilter('priceMax', Number(e.target.value))}
                        className="w-20 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 min-w-[50px]">
                        ≤ {filters.priceMax} MAD
                    </span>
                </div>
            </div>
        </motion.div>
    )
}

export default ParkingFilters


