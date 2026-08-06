import Link from 'next/link'
import Image from 'next/image'

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        <Image src="/logo.png" alt="Alghahim Pay" width={120} height={120} className="h-28 w-auto mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Alghahim Pay</h1>
        <p className="text-lg text-blue-600 font-semibold mb-4">Payment Processing • API Integration • Internal</p>
        <p className="text-lg text-slate-600 mb-8">
          Internal payment processor for seamless integration across all your products. Create payment links, manage transactions, and process payments programmatically.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/api-docs"
            className="bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold py-3 px-8 rounded-lg transition"
          >
            API Documentation
          </Link>
        </div>

        <div id="features" className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <div className="text-3xl mb-3">🔗</div>
            <h3 className="font-semibold text-slate-900 mb-2">Payment Links</h3>
            <p className="text-sm text-slate-600">Create unlimited payment links with custom paths, fixed and flexible amounts.</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <div className="text-3xl mb-3">🔑</div>
            <h3 className="font-semibold text-slate-900 mb-2">API Integration</h3>
            <p className="text-sm text-slate-600">Use API keys to programmatically create and manage payments across your products.</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-slate-900 mb-2">Track Payments</h3>
            <p className="text-sm text-slate-600">Monitor all payments with detailed status, analytics, and transaction history.</p>
          </div>
        </div>
      </div>
    </main>
  )
}
