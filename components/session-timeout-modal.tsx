'use client'

import { AlertTriangle, LogOut, Clock } from 'lucide-react'

interface SessionTimeoutModalProps {
  timeRemaining: number
  onLogout: () => void
  onExtend: () => void
}

export default function SessionTimeoutModal({
  timeRemaining,
  onLogout,
  onExtend,
}: SessionTimeoutModalProps) {
  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Session Expiring</h3>
              <p className="text-sm text-slate-600">Your session will end due to inactivity</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Countdown Display */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 mb-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-slate-600" />
              <p className="text-sm font-medium text-slate-600">Time Remaining</p>
            </div>
            <div className="text-3xl font-bold text-amber-600 font-mono">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
          </div>

          <p className="text-sm text-slate-600 text-center mb-6">
            For security reasons, your session will expire due to inactivity. Click below to stay logged in or you will be automatically logged out.
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-2 mb-6 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-1000"
              style={{ width: `${(timeRemaining / 300) * 100}%` }}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onLogout}
              className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
            <button
              onClick={onExtend}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Continue Session
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3">
          <p className="text-xs text-slate-500 text-center">
            Any activity will automatically extend your session
          </p>
        </div>
      </div>
    </div>
  )
}
