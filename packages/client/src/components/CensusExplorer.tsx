import React, { useState, useEffect } from 'react'
import { api } from '../services/api'

interface CensusData {
  totalBeds: number
  occupiedBeds: number
  availableBeds: number
  pendingDischarges: number
  maintenanceBeds: number
  occupancyRate: number
}

interface UnitCensus {
  id: number
  name: string
  totalBeds: number
  occupiedBeds: number
  availableBeds: number
  occupancyRate: number
}

export const CensusExplorer: React.FC = () => {
  const [censusData, setCensusData] = useState<CensusData | null>(null)
  const [unitCensus, setUnitCensus] = useState<UnitCensus[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedUnit, setSelectedUnit] = useState('all')

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

      const beds = bedsRes.data
      const units = unitsRes.data

      // Calculate overall census
      const totalBeds = beds.length
      const occupiedBeds = beds.filter((b: any) => b.status === 'OCCUPIED').length
      const availableBeds = beds.filter((b: any) => b.status === 'AVAILABLE').length
      const pendingDischarges = beds.filter((b: any) => b.status === 'PENDING_DISCHARGE').length
      const maintenanceBeds = beds.filter((b: any) => b.status === 'MAINTENANCE' || b.status === 'CLEANING').length

      setCensusData({
        totalBeds,
        occupiedBeds,
        availableBeds,
        pendingDischarges,
        maintenanceBeds,
        occupancyRate: (occupiedBeds / totalBeds) * 100,
      })

      // Calculate unit census
      const unitStats = units.map((unit: any) => {
        const unitBeds = unit.beds || []
        const occupied = unitBeds.filter((b: any) => b.status === 'OCCUPIED').length
        const available = unitBeds.filter((b: any) => b.status === 'AVAILABLE').length
        return {
          id: unit.id,
          name: unit.name,
          totalBeds: unitBeds.length,
          occupiedBeds: occupied,
          availableBeds: available,
          occupancyRate: unitBeds.length > 0 ? (occupied / unitBeds.length) * 100 : 0,
        }
      })

      setUnitCensus(unitStats)
    } catch (error) {
      console.error('Failed to fetch census data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    if (!censusData) return

    const csv = [
      ['Census Report', new Date().toLocaleDateString()],
      [],
      ['Metric', 'Count', 'Percentage'],
      ['Total Beds', censusData.totalBeds, '100%'],
      ['Occupied Beds', censusData.occupiedBeds, `${censusData.occupancyRate.toFixed(1)}%`],
      ['Available Beds', censusData.availableBeds, `${((censusData.availableBeds / censusData.totalBeds) * 100).toFixed(1)}%`],
      ['Pending Discharge', censusData.pendingDischarges, `${((censusData.pendingDischarges / censusData.totalBeds) * 100).toFixed(1)}%`],
      ['Maintenance/Cleaning', censusData.maintenanceBeds, `${((censusData.maintenanceBeds / censusData.totalBeds) * 100).toFixed(1)}%`],
      [],
      ['Unit Breakdown'],
      ['Unit Name', 'Total Beds', 'Occupied', 'Available', 'Occupancy Rate'],
      ...unitCensus.map(u => [u.name, u.totalBeds, u.occupiedBeds, u.availableBeds, `${u.occupancyRate.toFixed(1)}%`])
    ]

    const csvContent = csv.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `census-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!censusData) {
    return <div className="text-center py-8 text-red-500">Failed to load census data</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Census Explorer</h2>
        <button
          onClick={handleExport}
          className="button-secondary"
        >
          📊 Export to CSV
        </button>
      </div>

      {/* Overall Census Summary */}
      <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Hospital-Wide Census Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <CensusMetric label="Total Beds" value={censusData.totalBeds} />
          <CensusMetric label="Occupied" value={censusData.occupiedBeds} color="bg-blue-500" />
          <CensusMetric label="Available" value={censusData.availableBeds} color="bg-green-500" />
          <CensusMetric label="Pending Discharge" value={censusData.pendingDischarges} color="bg-yellow-500" />
          <CensusMetric label="Maintenance" value={censusData.maintenanceBeds} color="bg-red-500" />
        </div>
      </div>

      {/* Occupancy Rate */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Occupancy Rate</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium text-gray-700">Overall Occupancy</span>
              <span className="text-2xl font-bold text-blue-600">{censusData.occupancyRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-500 to-red-500 h-3 rounded-full transition-all"
                style={{ width: `${censusData.occupancyRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Unit-Level Census */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Census by Unit</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left px-4 py-3 font-semibold">Unit</th>
                <th className="text-center px-4 py-3 font-semibold">Total Beds</th>
                <th className="text-center px-4 py-3 font-semibold">Occupied</th>
                <th className="text-center px-4 py-3 font-semibold">Available</th>
                <th className="text-center px-4 py-3 font-semibold">Occupancy Rate</th>
              </tr>
            </thead>
            <tbody>
              {unitCensus.map(unit => (
                <tr key={unit.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{unit.name}</td>
                  <td className="px-4 py-3 text-center font-bold">{unit.totalBeds}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                      {unit.occupiedBeds}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                      {unit.availableBeds}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-red-500 h-2 rounded-full"
                          style={{ width: `${unit.occupancyRate}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-gray-700 w-12">{unit.occupancyRate.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-indigo-50 rounded-lg p-6 border-l-4 border-indigo-600">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Key Insights</h3>
        <ul className="space-y-2 text-gray-700">
          <li>• Hospital occupancy is at <strong>{censusData.occupancyRate.toFixed(1)}%</strong> capacity</li>
          <li>• <strong>{censusData.availableBeds}</strong> beds are available for new admissions</li>
          <li>• <strong>{censusData.pendingDischarges}</strong> patients scheduled for discharge</li>
          <li>• <strong>{censusData.maintenanceBeds}</strong> beds are under maintenance or cleaning</li>
          <li>• Unit with highest occupancy: <strong>{unitCensus.reduce((max, u) => u.occupancyRate > max.occupancyRate ? u : max, unitCensus[0] || { name: 'N/A', occupancyRate: 0 }).name}</strong></li>
        </ul>
      </div>
    </div>
  )
}

interface CensusMetricProps {
  label: string
  value: number
  color?: string
}

const CensusMetric: React.FC<CensusMetricProps> = ({ label, value, color = 'bg-blue-500' }) => {
  return (
    <div className="bg-white rounded-lg p-4 text-center shadow">
      <div className={`${color} text-white rounded-lg p-3 inline-block mb-2`}>
        <div className="text-2xl font-bold">{value}</div>
      </div>
      <div className="text-sm text-gray-600 font-medium">{label}</div>
    </div>
  )
}
