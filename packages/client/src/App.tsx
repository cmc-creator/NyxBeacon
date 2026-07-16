import React, { useState, useEffect } from 'react'
import { BedBoard } from './components/BedBoard'
import { PatientManagement } from './components/PatientManagement'
import { DischargeManagement } from './components/DischargeManagement'
import { CensusExplorer } from './components/CensusExplorer'
import { Header } from './components/Header'

type TabType = 'bedboard' | 'admissions' | 'discharges' | 'census'

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('bedboard')
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Simple health check
    fetch('/api/health')
      .then(() => setIsConnected(true))
      .catch(() => setIsConnected(false))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,119,6,0.1),rgba(255,255,255,0))] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_120%,rgba(59,130,246,0.05),rgba(255,255,255,0))] pointer-events-none" />
      
      <Header isConnected={isConnected} />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-slate-800/50 backdrop-blur-md p-1.5 rounded-xl border border-amber-500/20 shadow-2xl">
          <button
            onClick={() => setActiveTab('bedboard')}
            className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${
              activeTab === 'bedboard'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 shadow-lg shadow-amber-500/50'
                : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            🛏️ Bed Board
          </button>
          <button
            onClick={() => setActiveTab('admissions')}
            className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${
              activeTab === 'admissions'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 shadow-lg shadow-amber-500/50'
                : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            ➕ Admissions
          </button>
          <button
            onClick={() => setActiveTab('discharges')}
            className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${
              activeTab === 'discharges'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 shadow-lg shadow-amber-500/50'
                : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            ✓ Discharges
          </button>
          <button
            onClick={() => setActiveTab('census')}
            className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${
              activeTab === 'census'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 shadow-lg shadow-amber-500/50'
                : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            📊 Census
          </button>
        </div>

        {/* Premium Content Container */}
        <div className="relative">
          {/* Ambient Light Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-600/0 via-amber-500/10 to-amber-600/0 rounded-2xl blur-xl" />
          
          <div className="relative bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-amber-500/20 shadow-2xl overflow-hidden">
            <div className="p-8">
              {activeTab === 'bedboard' && <BedBoard />}
              {activeTab === 'admissions' && <PatientManagement />}
              {activeTab === 'discharges' && <DischargeManagement />}
              {activeTab === 'census' && <CensusExplorer />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
