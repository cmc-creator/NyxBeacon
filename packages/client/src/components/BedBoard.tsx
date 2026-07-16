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
      'AVAILABLE': 'bg-gradient-to-br from-green-900/40 to-green-800/40 border-green-500/50 hover:from-green-900/60 hover:to-green-800/60 shadow-lg shadow-green-500/20',
      'OCCUPIED': 'bg-gradient-to-br from-blue-900/40 to-blue-800/40 border-blue-500/50 hover:from-blue-900/60 hover:to-blue-800/60 shadow-lg shadow-blue-500/20',
      'PENDING_DISCHARGE': 'bg-gradient-to-br from-amber-900/40 to-amber-800/40 border-amber-500/50 hover:from-amber-900/60 hover:to-amber-800/60 shadow-lg shadow-amber-500/20',
      'MAINTENANCE': 'bg-gradient-to-br from-red-900/40 to-red-800/40 border-red-500/50 hover:from-red-900/60 hover:to-red-800/60 shadow-lg shadow-red-500/20',
      'CLEANING': 'bg-gradient-to-br from-purple-900/40 to-purple-800/40 border-purple-500/50 hover:from-purple-900/60 hover:to-purple-800/60 shadow-lg shadow-purple-500/20',
    }
    return colors[status] || 'bg-gradient-to-br from-slate-700 to-slate-600 border-slate-500/50 shadow-lg shadow-slate-500/10'
  }

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      'AVAILABLE': 'bg-green-500/20 text-green-300 border border-green-500/50',
      'OCCUPIED': 'bg-blue-500/20 text-blue-300 border border-blue-500/50',
      'PENDING_DISCHARGE': 'bg-amber-500/20 text-amber-300 border border-amber-500/50',
      'MAINTENANCE': 'bg-red-500/20 text-red-300 border border-red-500/50',
      'CLEANING': 'bg-purple-500/20 text-purple-300 border border-purple-500/50',
    }
    return colors[status] || 'bg-slate-500/20 text-slate-300 border border-slate-500/50'
  }

  const filteredBeds = selectedUnit
    ? beds.filter(bed => bed.unitId === selectedUnit)
    : beds

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="space-y-4 text-center">
          <div className="animate-spin">
            <div className="w-16 h-16 border-4 border-amber-900/20 border-t-amber-500 rounded-full"></div>
          </div>
          <p className="text-gray-400 text-sm">Loading bed board...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Premium Header with Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-slate-700/50 to-slate-700/30 border border-amber-500/20 rounded-xl p-4 backdrop-blur-sm">
          <div className="text-xs text-gray-400 uppercase tracking-widest">Total Beds</div>
          <div className="text-3xl font-bold text-amber-400">{beds.length}</div>
        </div>
        <div className="bg-gradient-to-br from-slate-700/50 to-slate-700/30 border border-green-500/20 rounded-xl p-4 backdrop-blur-sm">
          <div className="text-xs text-gray-400 uppercase tracking-widest">Available</div>
          <div className="text-3xl font-bold text-green-400">{beds.filter(b => b.status === 'AVAILABLE').length}</div>
        </div>
        <div className="bg-gradient-to-br from-slate-700/50 to-slate-700/30 border border-blue-500/20 rounded-xl p-4 backdrop-blur-sm">
          <div className="text-xs text-gray-400 uppercase tracking-widest">Occupied</div>
          <div className="text-3xl font-bold text-blue-400">{beds.filter(b => b.status === 'OCCUPIED').length}</div>
        </div>
        <div className="bg-gradient-to-br from-slate-700/50 to-slate-700/30 border border-amber-500/20 rounded-xl p-4 backdrop-blur-sm">
          <div className="text-xs text-gray-400 uppercase tracking-widest">Occupancy Rate</div>
          <div className="text-3xl font-bold text-amber-400">{Math.round((beds.filter(b => b.status === 'OCCUPIED').length / beds.length) * 100)}%</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-end gap-6">
        <div className="space-y-2 flex-1">
          <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wider">Filter by Unit</label>
          <select
            value={selectedUnit || ''}
            onChange={(e) => setSelectedUnit(Number(e.target.value))}
            className="w-full px-4 py-3 bg-slate-700/50 border border-amber-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
          >
            {units.map(unit => (
              <option key={unit.id} value={unit.id} className="bg-slate-800">
                {unit.name} ({unit.beds?.length || 0} beds)
              </option>
            ))}
          </select>
        </div>

        <div className="flex space-x-2 bg-slate-700/50 p-1.5 rounded-lg border border-amber-500/20">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
              viewMode === 'grid'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 shadow-lg'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            📊 Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
              viewMode === 'list'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 shadow-lg'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            📋 List
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-4">
          {filteredBeds.map(bed => (
            <BedCard key={bed.id} bed={bed} statusColor={getStatusColor(bed.status)} badgeColor={getStatusBadgeColor(bed.status)} />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto pt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-amber-500/30">
                <th className="text-left px-4 py-4 font-semibold text-gray-300 text-xs uppercase tracking-wider">Bed Number</th>
                <th className="text-left px-4 py-4 font-semibold text-gray-300 text-xs uppercase tracking-wider">Unit</th>
                <th className="text-left px-4 py-4 font-semibold text-gray-300 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-4 font-semibold text-gray-300 text-xs uppercase tracking-wider">Patient</th>
                <th className="text-left px-4 py-4 font-semibold text-gray-300 text-xs uppercase tracking-wider">Admission Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredBeds.map(bed => (
                <tr key={bed.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                  <td className="px-4 py-4 font-semibold text-white">{bed.bedNumber}</td>
                  <td className="px-4 py-4 text-gray-400">{bed.unit?.name}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${getStatusBadgeColor(bed.status)}`}>
                      {bed.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-300">
                    {bed.admission ? `${bed.admission.patient.firstName} ${bed.admission.patient.lastName}` : '—'}
                  </td>
                  <td className="px-4 py-4 text-gray-400">
                    {bed.admission ? new Date(bed.admission.admissionDate).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Premium Legend */}
      <div className="bg-gradient-to-br from-slate-700/50 to-slate-700/30 border border-amber-500/20 rounded-xl p-6 mt-6">
        <h3 className="font-bold text-gray-200 mb-4 text-sm uppercase tracking-wider">Room Status Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <LegendItem color="from-green-900/40 to-green-800/40 border-green-500/50" text="✓ Available" />
          <LegendItem color="from-blue-900/40 to-blue-800/40 border-blue-500/50" text="● Occupied" />
          <LegendItem color="from-amber-900/40 to-amber-800/40 border-amber-500/50" text="⊃ Pending Discharge" />
          <LegendItem color="from-red-900/40 to-red-800/40 border-red-500/50" text="⚠ Maintenance" />
          <LegendItem color="from-purple-900/40 to-purple-800/40 border-purple-500/50" text="◆ Cleaning" />
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
    <div className={`border rounded-xl p-4 transition-all duration-300 hover:scale-105 cursor-pointer backdrop-blur-sm ${statusColor}`}>
      <div className="font-bold text-lg text-white mb-2">{bed.bedNumber}</div>
      <span className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold ${badgeColor}`}>
        {bed.status.replace(/_/g, ' ')}
      </span>
      {bed.admission && (
        <div className="mt-3 space-y-1 text-xs">
          <div className="font-semibold text-gray-100 truncate">
            {bed.admission.patient.firstName} {bed.admission.patient.lastName}
          </div>
          <div className="text-gray-400">{bed.unit?.name}</div>
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
    <div className="bg-gradient-to-br from-slate-700/50 to-slate-700/30 border border-amber-500/20 rounded-xl shadow-lg p-4">
      <div className={`text-3xl font-bold ${color} text-white rounded-lg p-2 inline-block mb-2`}>
        {value}
      </div>
      <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{label}</div>
    </div>
  )
}

interface LegendItemProps {
  color: string
  text: string
}

const LegendItem: React.FC<LegendItemProps> = ({ color, text }) => {
  return (
    <div className="flex items-center space-x-3 p-3 bg-gradient-to-br rounded-lg border border-slate-700/50">
      <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${color}`}></div>
      <span className="text-sm text-gray-300 font-medium">{text}</span>
    </div>
  )
}
