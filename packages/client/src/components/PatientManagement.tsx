import React, { useState, useEffect } from 'react'
import { api } from '../services/api'

interface Patient {
  id: number
  firstName: string
  lastName: string
  mrn: string
  dateOfBirth: string
  gender: string
  phone?: string
}

interface Bed {
  id: number
  bedNumber: string
  unitId: number
  status: string
  unit: any
}

interface Unit {
  id: number
  name: string
}

export const PatientManagement: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [beds, setBeds] = useState<Bed[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdmissionForm, setShowAdmissionForm] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<number>(0)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'M',
    phone: '',
    bedId: '',
    clinicalLevel: 'MED_SURG',
    diet: 'Regular',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [patientsRes, unitsRes, bedsRes] = await Promise.all([
        api.get('/patients'),
        api.get('/units'),
        api.get('/beds'),
      ])
      setPatients(patientsRes.data)
      setUnits(unitsRes.data)
      setBeds(bedsRes.data)
      if (unitsRes.data.length > 0) {
        setSelectedUnit(unitsRes.data[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const availableBeds = beds.filter(b => b.status === 'AVAILABLE' && (selectedUnit === 0 || b.unitId === selectedUnit))

  const handleAdmission = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Create patient if new
      const patientRes = await api.post('/patients', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phone: formData.phone,
      })

      // Create admission
      await api.post('/admissions', {
        patientId: patientRes.data.id,
        bedId: Number(formData.bedId),
        clinicalLevel: formData.clinicalLevel,
        diet: formData.diet,
        admissionDate: new Date().toISOString(),
      })

      setShowAdmissionForm(false)
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'M',
        phone: '',
        bedId: '',
        clinicalLevel: 'MED_SURG',
        diet: 'Regular',
      })
      await fetchData()
    } catch (error) {
      console.error('Failed to admit patient:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Patient Admissions</h2>
        <button
          onClick={() => setShowAdmissionForm(!showAdmissionForm)}
          className="button-primary"
        >
          {showAdmissionForm ? 'Cancel' : '+ New Admission'}
        </button>
      </div>

      {showAdmissionForm && (
        <form onSubmit={handleAdmission} className="bg-blue-50 rounded-lg p-6 border-2 border-blue-300">
          <h3 className="text-xl font-bold mb-4">Admit New Patient</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option>M</option>
                <option>F</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Clinical Level *</label>
              <select
                value={formData.clinicalLevel}
                onChange={(e) => setFormData({...formData, clinicalLevel: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ICU">ICU</option>
                <option value="STEP_DOWN">Step Down</option>
                <option value="MED_SURG">Medical/Surgical</option>
                <option value="SKILLED_NURSING">Skilled Nursing</option>
                <option value="OBSERVATION">Observation</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Diet *</label>
              <input
                type="text"
                placeholder="Regular, Diabetic, Low-sodium..."
                value={formData.diet}
                onChange={(e) => setFormData({...formData, diet: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Unit</label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(Number(e.target.value))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {units.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Bed *</label>
              <select
                required
                value={formData.bedId}
                onChange={(e) => setFormData({...formData, bedId: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose available bed...</option>
                {availableBeds.map(b => (
                  <option key={b.id} value={b.id}>{b.bedNumber}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="button-success mt-4">Admit Patient</button>
        </form>
      )}

      {/* Patient List */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left px-4 py-3 font-semibold">Name</th>
              <th className="text-left px-4 py-3 font-semibold">MRN</th>
              <th className="text-left px-4 py-3 font-semibold">Date of Birth</th>
              <th className="text-left px-4 py-3 font-semibold">Phone</th>
              <th className="text-left px-4 py-3 font-semibold">Current Bed</th>
            </tr>
          </thead>
          <tbody>
            {patients.map(patient => {
              const admission = patient.admissions?.[patient.admissions.length - 1]
              return (
                <tr key={patient.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{patient.firstName} {patient.lastName}</td>
                  <td className="px-4 py-3">{patient.mrn}</td>
                  <td className="px-4 py-3">{new Date(patient.dateOfBirth).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{patient.phone || '-'}</td>
                  <td className="px-4 py-3">{admission?.bed?.bedNumber || 'Not admitted'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
