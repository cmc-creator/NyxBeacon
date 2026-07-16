import React, { useState, useEffect } from 'react'
import { api } from '../services/api'

interface Bed {
  id: number
  bedNumber: string
  unitId: number
  status: string
  unit: any
  admission?: any
}

export const BedBoard: React.FC = () => {
  const [beds, setBeds] = useState<Bed[]>([])
  const [units, setUnits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [bedsRes, unitsRes] = await Promise.all([
        api.get('/beds'),
        api.get('/units'),
      ])
      setBeds(bedsRes.data)
      setUnits(unitsRes.data)
      if (unitsRes.data.length > 0) {
        setSelectedUnit(unitsRes.data[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'AVAILABLE': 'bg-green-50 border-green-300 hover:bg-green-100',
      'OCCUPIED': 'bg-blue-50 border-blue-300 hover:bg-blue-100',
      'PENDING_DISCHARGE': 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100',
      'MAINTENANCE': 'bg-red-50 border-red-300 hover:bg-red-100',
      'CLEANING': 'bg-purple-50 border-purple-300 hover:bg-purple-100',
    }
    return colors[status] || 'bg-gray-50 border-gray-300'
  }

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      'AVAILABLE': 'bg-green-100 text-green-800',
      'OCCUPIED': 'bg-blue-100 text-blue-800',
      'PENDING_DISCHARGE': 'bg-yellow-100 text-yellow-800',
      'MAINTENANCE': 'bg-red-100 text-red-800',
      'CLEANING': 'bg-purple-100 text-purple-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const filteredBeds = selectedUnit
    ? beds.filter(bed => bed.unitId === selectedUnit)
    : beds

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Filter by Unit</label>
          <select
            value={selectedUnit || ''}
            onChange={(e) => setSelectedUnit(Number(e.target.value))}
            className="block w-48 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {units.map(unit => (
              <option key={unit.id} value={unit.id}>
                {unit.name} ({unit.beds?.length || 0} beds)
              </option>
            ))}
          </select>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            List View
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          label="Total Beds"
          value={filteredBeds.length}
          color="bg-blue-500"
        />
        <StatCard
          label="Available"
          value={filteredBeds.filter(b => b.status === 'AVAILABLE').length}
          color="bg-green-500"
        />
        <StatCard
          label="Occupied"
          value={filteredBeds.filter(b => b.status === 'OCCUPIED').length}
          color="bg-blue-500"
        />
        <StatCard
          label="Pending"
          value={filteredBeds.filter(b => b.status === 'PENDING_DISCHARGE').length}
          color="bg-yellow-500"
        />
        <StatCard
          label="Maintenance"
          value={filteredBeds.filter(b => b.status === 'MAINTENANCE').length}
          color="bg-red-500"
        />
      </div>

      {/* Bed Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredBeds.map(bed => (
            <BedCard key={bed.id} bed={bed} statusColor={getStatusColor(bed.status)} badgeColor={getStatusBadgeColor(bed.status)} />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left px-4 py-3 font-semibold">Bed</th>
                <th className="text-left px-4 py-3 font-semibold">Unit</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Patient</th>
                <th className="text-left px-4 py-3 font-semibold">Admission Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredBeds.map(bed => (
                <tr key={bed.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{bed.bedNumber}</td>
                  <td className="px-4 py-3">{bed.unit?.name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(bed.status)}`}>
                      {bed.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {bed.admission ? `${bed.admission.patient.firstName} ${bed.admission.patient.lastName}` : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {bed.admission ? new Date(bed.admission.admissionDate).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold mb-3 text-gray-700">Status Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <LegendItem color="bg-green-100" text="Available" />
          <LegendItem color="bg-blue-100" text="Occupied" />
          <LegendItem color="bg-yellow-100" text="Pending Discharge" />
          <LegendItem color="bg-red-100" text="Maintenance" />
          <LegendItem color="bg-purple-100" text="Cleaning" />
        </div>
      </div>
    </div>
  )
}

interface BedCardProps {
  bed: Bed
  statusColor: string
  badgeColor: string
}

const BedCard: React.FC<BedCardProps> = ({ bed, statusColor, badgeColor }) => {
  return (
    <div className={`border-2 rounded-lg p-3 transition cursor-pointer ${statusColor}`}>
      <div className="font-bold text-lg text-gray-800">{bed.bedNumber}</div>
      <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${badgeColor}`}>
        {bed.status.replace(/_/g, ' ')}
      </span>
      {bed.admission && (
        <div className="mt-2 text-xs">
          <div className="font-medium text-gray-800 truncate">
            {bed.admission.patient.firstName} {bed.admission.patient.lastName}
          </div>
          <div className="text-gray-600 mt-1">{bed.unit?.name}</div>
        </div>
      )}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: number
  color: string
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className={`text-3xl font-bold ${color} text-white rounded-lg p-2 inline-block mb-2`}>
        {value}
      </div>
      <div className="text-sm text-gray-600 font-medium">{label}</div>
    </div>
  )
}

interface LegendItemProps {
  color: string
  text: string
}

const LegendItem: React.FC<LegendItemProps> = ({ color, text }) => {
  return (
    <div className="flex items-center space-x-2">
      <div className={`w-4 h-4 rounded ${color}`}></div>
      <span className="text-sm text-gray-700">{text}</span>
    </div>
  )
}
