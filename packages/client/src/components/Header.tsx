import React from 'react'

interface HeaderProps {
  isConnected: boolean
}

export const Header: React.FC<HeaderProps> = ({ isConnected }) => {
  return (
    <header className="relative z-20 border-b border-amber-500/20 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg blur opacity-75" />
              <div className="relative px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg">
                <img src="/nyxbeaconlogo.png" alt="NyxBeacon" className="h-8 w-8 object-contain" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent tracking-tight">
                NYXBEACON
              </h1>
              <p className="text-xs text-gray-400 tracking-widest uppercase font-semibold">Navigation & Intelligence</p>
            </div>
          </div>

          {/* Status Section */}
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">System Status</div>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`w-3 h-3 rounded-full ${
                  isConnected 
                    ? 'bg-green-500 shadow-lg shadow-green-500/50 animate-pulse' 
                    : 'bg-red-500 shadow-lg shadow-red-500/50'
                }`}></span>
                <span className="font-semibold text-sm text-gray-200">{isConnected ? 'Connected' : 'Offline'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gradient Divider */}
      <div className="h-px bg-gradient-to-r from-amber-500/0 via-amber-500/50 to-amber-500/0" />
    </header>
  )
}
