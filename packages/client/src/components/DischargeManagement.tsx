import React, { useState, useEffect } from 'react'
import { api } from '../services/api'

interface Discharge {
  id: number
  scheduledDate: string
  actualDate?: string
  status: string
  dischargeType: string
  admission: {
    id: number
    patient: {
      firstName: string
      lastName: string
    }
    bed: {
      bedNumber: string
    }
  }
}

export const DischargeManagement: React.FC = () => {
  const [discharges, setDischarges] = useState<Discharge[]>([])
  const [admissions, setAdmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [formData, setFormData] = useState({
    admissionId: '',
    scheduledDate: '',
    scheduledTime: '',
    dischargeType: 'HOME',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [dischargesRes, admissionsRes] = await Promise.all([
        api.get('/discharges'),
        api.get('/admissions'),
      ])
      setDischarges(dischargesRes.data)
      // Only show admissions without discharge scheduled
      setAdmissions(admissionsRes.data.filter((a: any) => !a.discharge))
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleDischarge = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const dateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime || '10:00'}`)
      await api.post('/discharges', {
        admissionId: Number(formData.admissionId),
        scheduledDate: dateTime.toISOString(),
        dischargeType: formData.dischargeType,
      })
      setShowScheduleForm(false)
      setFormData({
        admissionId: '',
        scheduledDate: '',
        scheduledTime: '',
        dischargeType: 'HOME',
      })
      await fetchData()
    } catch (error) {
      console.error('Failed to schedule discharge:', error)
    }
  }

  const handleConfirmDischarge = async (dischargeId: number) => {
    try {
      await api.patch(`/discharges/${dischargeId}/confirm`, {})
      await fetchData()
    } catch (error) {
      console.error('Failed to confirm discharge:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Discharge Management</h2>
        <button
          onClick={() => setShowScheduleForm(!showScheduleForm)}
          className="button-primary"
        >
          {showScheduleForm ? 'Cancel' : '+ Schedule Discharge'}
        </button>
      </div>

      {showScheduleForm && (
        <form onSubmit={handleScheduleDischarge} className="bg-yellow-50 rounded-lg p-6 border-2 border-yellow-300">
          <h3 className="text-xl font-bold mb-4">Schedule Patient Discharge</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Patient to Discharge *</label>
              <select
                required
                value={formData.admissionId}
                onChange={(e) => setFormData({...formData, admissionId: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose patient...</option>
                {admissions.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.patient.firstName} {a.patient.lastName} (Bed: {a.bed.bedNumber})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Discharge Date *</label>
              <input
                type="date"
                required
                value={formData.scheduledDate}
                onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Discharge Time</label>
              <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Discharge Type *</label>
              <select
                value={formData.dischargeType}
                onChange={(e) => setFormData({...formData, dischargeType: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="HOME">Home</option>
                <option value="SNF">Skilled Nursing Facility</option>
                <option value="TRANSFER">Hospital Transfer</option>
                <option value="AMA">Against Medical Advice</option>
              </select>
            </div>
          </div>
          <button type="submit" className="button-success mt-4">Schedule Discharge</button>
        </form>
      )}

      {/* Scheduled Discharges */}
      <div>
        <h3 className="text-lg font-bold mb-4 text-gray-800">Scheduled Discharges</h3>
        {discharges.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No scheduled discharges</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left px-4 py-3 font-semibold">Patient Name</th>
                  <th className="text-left px-4 py-3 font-semibold">Bed</th>
                  <th className="text-left px-4 py-3 font-semibold">Scheduled Date/Time</th>
                  <th className="text-left px-4 py-3 font-semibold">Type</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {discharges.map(discharge => (
                  <tr key={discharge.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      {discharge.admission.patient.firstName} {discharge.admission.patient.lastName}
                    </td>
                    <td className="px-4 py-3">{discharge.admission.bed.bedNumber}</td>
                    <td className="px-4 py-3">
                      {new Date(discharge.scheduledDate).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{discharge.dischargeType}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        discharge.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-800' :
                        discharge.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {discharge.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {discharge.status === 'SCHEDULED' && (
                        <button
                          onClick={() => handleConfirmDischarge(discharge.id)}
                          className="button-success text-xs"
                        >
                          Confirm Discharge
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
