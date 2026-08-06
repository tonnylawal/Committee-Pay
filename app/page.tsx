import Link from 'next/link'
import Image from 'next/image'

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Alghahim Pay" width={40} height={40} className="h-10 w-auto" />
            <span className="text-xl font-bold text-slate-900">Alghahim Pay</span>
          </div>
          <div className="hidden sm:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-600 hover:text-slate-900 transition">Features</a>
            <a href="#how-it-works" className="text-sm text-slate-600 hover:text-slate-900 transition">How it Works</a>
            <a href="/api-docs" className="text-sm text-slate-600 hover:text-slate-900 transition">Documentation</a>
          </div>
          <Link href="/sign-in" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition">
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-slate-50">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-100 rounded-full blur-3xl opacity-20" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-700 font-medium">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Unified Payment Processing
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Seamless Payments for Every Product
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed">
              Build, manage, and scale payment processing across all your internal products with a unified API. No complex integrations, no vendor lock-in—just reliable payments.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition shadow-lg hover:shadow-xl"
              >
                Get Started
              </Link>
              <Link
                href="/api-docs"
                className="inline-flex items-center justify-center px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold rounded-lg transition"
              >
                API Documentation
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-12 border-t border-slate-200">
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-slate-900">100%</div>
                <div className="text-sm text-slate-600 mt-2">Uptime SLA</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-slate-900">&lt;100ms</div>
                <div className="text-sm text-slate-600 mt-2">API Response</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-slate-900">24/7</div>
                <div className="text-sm text-slate-600 mt-2">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 sm:py-32 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Built for Developers</h2>
            <p className="text-lg text-slate-600">Everything you need to accept payments reliably, from API-first architecture to comprehensive management tools.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl border border-slate-200 p-8 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Lightning Fast</h3>
              <p className="text-slate-600">Sub-100ms API responses with automatic request optimization and intelligent caching.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl border border-slate-200 p-8 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Enterprise Secure</h3>
              <p className="text-slate-600">End-to-end encryption, webhook verification, and compliance with industry standards.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl border border-slate-200 p-8 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4m-4-4l-4 4m4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">API First</h3>
              <p className="text-slate-600">RESTful APIs with comprehensive documentation and SDKs for every language.</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl border border-slate-200 p-8 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Real-time Analytics</h3>
              <p className="text-slate-600">Monitor transactions, revenue, and success rates with detailed insights and dashboards.</p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-xl border border-slate-200 p-8 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">API Key Management</h3>
              <p className="text-slate-600">Generate, rotate, and revoke API keys with granular permission controls and audit logs.</p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-xl border border-slate-200 p-8 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Webhook Events</h3>
              <p className="text-slate-600">Real-time webhooks for payment events with automatic retry and delivery verification.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-lg text-slate-600">Get started in minutes with our simple, three-step process.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="absolute -left-4 top-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
              <div className="ml-8">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Create API Key</h3>
                <p className="text-slate-600 leading-relaxed">Generate an API key from your dashboard. Each key can have custom permissions and rate limits tailored to your needs.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="absolute -left-4 top-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
              <div className="ml-8">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Integrate API</h3>
                <p className="text-slate-600 leading-relaxed">Use our REST API to create payment links programmatically. Full documentation and code examples available in multiple languages.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="absolute -left-4 top-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
              <div className="ml-8">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Monitor & Scale</h3>
                <p className="text-slate-600 leading-relaxed">Track transactions in real-time with webhooks and comprehensive analytics. Scale effortlessly as your business grows.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            Join teams across your organization who are already using Alghahim Pay for seamless, reliable payment processing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              Access Dashboard
            </Link>
            <Link
              href="/api-docs"
              className="inline-flex items-center justify-center px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition border border-slate-700"
            >
              View Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image src="/logo.png" alt="Alghahim Pay" width={32} height={32} className="h-8 w-auto" />
                <span className="font-bold text-slate-900">Alghahim Pay</span>
              </div>
              <p className="text-sm text-slate-600">Unified payment processing for your products.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="/dashboard" className="hover:text-slate-900 transition">Dashboard</Link></li>
                <li><Link href="/api-docs" className="hover:text-slate-900 transition">API Docs</Link></li>
                <li><Link href="/dashboard/transactions" className="hover:text-slate-900 transition">Transactions</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="/dashboard/webhook-setup" className="hover:text-slate-900 transition">Webhook Setup</Link></li>
                <li><Link href="/dashboard/api-keys" className="hover:text-slate-900 transition">API Keys</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Account</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="/sign-in" className="hover:text-slate-900 transition">Sign In</Link></li>
                <li><Link href="/sign-up" className="hover:text-slate-900 transition">Create Account</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-200 pt-8">
            <p className="text-sm text-slate-600 text-center">
              © 2024 Alghahim Pay. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
