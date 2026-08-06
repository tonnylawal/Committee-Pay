'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ApiDocsPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>('getting-started')

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      content: (
        <div className="space-y-4">
          <p>Alghahim Pay API allows you to integrate payment processing into your internal products.</p>
          <div className="bg-slate-50 p-4 rounded border border-slate-200">
            <h4 className="font-semibold mb-2">Base URL</h4>
            <code className="text-sm">https://pay.iicar.org/api/v1</code>
          </div>
          <div className="bg-slate-50 p-4 rounded border border-slate-200">
            <h4 className="font-semibold mb-2">Authentication</h4>
            <p className="text-sm mb-2">All API requests require an API key passed in the Authorization header:</p>
            <code className="text-sm block">Authorization: Bearer ap_live_xxxxxxxxxxxxxxxxxxxx</code>
          </div>
        </div>
      ),
    },
    {
      id: 'payment-links',
      title: 'Payment Links',
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Create Payment Link</h4>
            <code className="text-sm bg-slate-50 p-3 block rounded border border-slate-200">
              {`POST /payment-links
Content-Type: application/json

{
  "amount_usd": 50,
  "amount_type": "fixed",
  "description": "Premium package",
  "product_slug": "mobile-app"
}`}
            </code>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Response</h4>
            <code className="text-sm bg-slate-50 p-3 block rounded border border-slate-200">
              {`{
  "id": "uuid",
  "custom_path": "premium-package",
  "amount_usd": "50",
  "amount_type": "fixed",
  "payment_url": "https://alghahim.pay/pay/premium-package",
  "created_at": "2024-01-01T00:00:00Z"
}`}
            </code>
          </div>
          <div>
            <h4 className="font-semibold mb-2">List Payment Links</h4>
            <code className="text-sm bg-slate-50 p-3 block rounded border border-slate-200">GET /payment-links</code>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Get Payment Link Details</h4>
            <code className="text-sm bg-slate-50 p-3 block rounded border border-slate-200">
              GET /payment-links/{'{id}'}
            </code>
          </div>
        </div>
      ),
    },
    {
      id: 'payments',
      title: 'Payments',
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">List Payments</h4>
            <code className="text-sm bg-slate-50 p-3 block rounded border border-slate-200">
              GET /payments?status=completed
            </code>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Query Parameters</h4>
            <ul className="text-sm space-y-2">
              <li>
                <strong>status</strong>: pending, completed, failed
              </li>
              <li>
                <strong>product_slug</strong>: Filter by product
              </li>
              <li>
                <strong>limit</strong>: Default 50, max 100
              </li>
              <li>
                <strong>offset</strong>: For pagination
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'webhooks',
      title: 'Webhooks',
      content: (
        <div className="space-y-4">
          <p>Webhooks notify your application about payment events in real-time.</p>
          <div>
            <h4 className="font-semibold mb-2">Register Webhook</h4>
            <code className="text-sm bg-slate-50 p-3 block rounded border border-slate-200">
              {`POST /webhooks
Content-Type: application/json

{
  "url": "https://yourapp.com/webhooks/payments",
  "events": ["payment.completed", "payment.failed"]
}`}
            </code>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Webhook Events</h4>
            <ul className="text-sm space-y-2">
              <li>
                <strong>payment.completed</strong>: Payment successfully processed
              </li>
              <li>
                <strong>payment.failed</strong>: Payment failed
              </li>
              <li>
                <strong>payment.refunded</strong>: Payment refunded
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'errors',
      title: 'Error Responses',
      content: (
        <div className="space-y-4">
          <code className="text-sm bg-slate-50 p-3 block rounded border border-slate-200">
            {`401 Unauthorized
{ "error": "Invalid API key" }

403 Forbidden
{ "error": "Insufficient permissions" }

400 Bad Request
{ "error": "Missing required field: amount_usd" }

404 Not Found
{ "error": "Payment link not found" }`}
          </code>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">API Documentation</h1>
          <p className="text-lg text-slate-600">Integrate Alghahim Pay payment processing into your products</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h3 className="font-semibold text-slate-900 mb-4">Documentation</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setExpandedSection(section.id)}
                    className={`w-full text-left px-4 py-2 rounded transition ${
                      expandedSection === section.id
                        ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-8">
              {sections.map((section) => (
                <div key={section.id} className={expandedSection === section.id ? 'block' : 'hidden'}>
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">{section.title}</h2>
                  <div className="prose prose-sm max-w-none">{section.content}</div>
                </div>
              ))}

              {/* Code Examples */}
              <div className="mt-12 pt-8 border-t border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Integration Example</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">JavaScript/TypeScript</h4>
                    <code className="text-xs bg-slate-900 text-slate-50 p-4 block rounded overflow-x-auto">
                      {`const response = await fetch('https://alghahim.pay/api/v1/payment-links', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ap_live_xxxxxxxxxxxxxxxxxxxx',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount_usd: 50,
    amount_type: 'fixed',
    description: 'Premium subscription'
  })
})

const paymentLink = await response.json()`}
                    </code>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">cURL</h4>
                    <code className="text-xs bg-slate-900 text-slate-50 p-4 block rounded overflow-x-auto">
                      {`curl -X POST https://alghahim.pay/api/v1/payment-links \\
  -H "Authorization: Bearer ap_live_xxxxxxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount_usd": 50,
    "amount_type": "fixed",
    "description": "Premium subscription"
  }'`}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
