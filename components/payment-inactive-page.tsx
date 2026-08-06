'use client'

import Link from 'next/link'
import { Lock, Home, Calendar } from 'lucide-react'

export default function PaymentInactivePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-10 w-72 h-72 bg-amber-100 rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-slate-100 rounded-full blur-3xl opacity-20" />
        </div>

        {/* Content */}
        <div className="relative">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center border-2 border-amber-200">
              <Lock className="w-8 h-8 text-amber-600" />
            </div>
          </div>

          {/* Text */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 text-balance">
              Payment Link Deactivated
            </h1>
            <p className="text-slate-600 text-base sm:text-lg mb-2 text-balance">
              This payment link is no longer active and cannot process payments at this time.
            </p>
            <p className="text-slate-500 text-sm">
              The merchant may have deactivated this link or it may have expired.
            </p>
          </div>

          {/* Status badge */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">Link Status</h3>
                <p className="text-sm text-amber-800">
                  This payment link has been deactivated. No payments can be processed through this link.
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mb-8">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
            >
              <Home className="w-4 h-4" />
              <span>Return to Home</span>
            </Link>
          </div>

          {/* Info card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-3 text-sm">Need Help?</h3>
            <p className="text-sm text-slate-600 mb-3">
              If you believe this is an error, please contact the merchant or our support team for assistance.
            </p>
            <div className="space-y-2">
              <a
                href="mailto:support@alghahim.com"
                className="block text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                → Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
