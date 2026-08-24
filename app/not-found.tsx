'use client'

import Link from 'next/link'
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-10 w-72 h-72 bg-red-100 rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-slate-100 rounded-full blur-3xl opacity-20" />
        </div>

        {/* Content */}
        <div className="relative">
          {/* Error code */}
          <div className="text-center mb-6">
            <h1 className="text-7xl sm:text-9xl font-bold text-red-200 mb-2">404</h1>
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-6 -mt-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center border-2 border-red-200">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          {/* Text */}
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 text-balance">
              Page Not Found
            </h2>
            <p className="text-slate-600 text-base sm:text-lg mb-2 text-balance">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <p className="text-slate-500 text-sm">
              Check the URL and try again, or explore our site below.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex-1"
            >
              <Home className="w-4 h-4" />
              <span>Go Home</span>
            </Link>
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-900 font-medium rounded-lg transition flex-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          </div>

          {/* Info card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-3 text-sm">Helpful Links</h3>
            <div className="space-y-2">
              <Link href="/" className="block text-sm text-blue-600 hover:text-blue-700 font-medium">
                → Homepage
              </Link>
              <Link href="/sign-in" className="block text-sm text-blue-600 hover:text-blue-700 font-medium">
                → Sign In
              </Link>
              <a href="mailto:support@committee.com" className="block text-sm text-blue-600 hover:text-blue-700 font-medium">
                → Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
