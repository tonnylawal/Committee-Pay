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
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Welcome to Committee API</h3>
            <p className="text-slate-700 mb-4">
              Committee provides a unified payment processor API for seamless integration across all your internal products. Process payments programmatically with secure API keys, manage payment links, and track transactions in real-time.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">API Endpoint</h4>
            <code className="text-sm text-blue-900 break-all">https://pay.iicar.org/api/v1</code>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Authentication</h4>
            <p className="text-slate-700 mb-3">All API requests require authentication using an API key in the Authorization header:</p>
            <code className="text-sm bg-slate-900 text-slate-50 p-3 block rounded">
              Authorization: Bearer ap_live_xxxxxxxxxxxxxxxxxxxx
            </code>
            <p className="text-sm text-slate-600 mt-3">
              API keys are generated in your <Link href="/dashboard/api-keys" className="text-blue-600 hover:underline">API Keys dashboard</Link>. Keep your API keys secure and never share them publicly.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Rate Limiting</h4>
            <p className="text-slate-700">
              API rate limits are enforced per API key. Default rate limit is 1000 requests per hour. Rate limit information is included in response headers:
            </p>
            <ul className="text-sm text-slate-700 space-y-2 mt-3">
              <li><code className="bg-slate-100 px-2 py-1 rounded">X-RateLimit-Limit</code>: Total requests allowed per hour</li>
              <li><code className="bg-slate-100 px-2 py-1 rounded">X-RateLimit-Remaining</code>: Remaining requests this hour</li>
              <li><code className="bg-slate-100 px-2 py-1 rounded">X-RateLimit-Reset</code>: Unix timestamp when limit resets</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Response Format</h4>
            <p className="text-slate-700 mb-3">All responses are returned as JSON. Success responses return a 200-299 status code, while errors return 400+ status codes.</p>
            <code className="text-sm bg-slate-900 text-slate-50 p-3 block rounded">
              {`{
  "success": true,
  "data": { /* resource data */ },
  "message": "Operation completed successfully"
}`}
            </code>
          </div>
        </div>
      ),
    },

    {
      id: 'payment-links',
      title: 'Payment Links API',
      content: (
        <div className="space-y-6">
          <p className="text-slate-700">
            Payment Links are shareable URLs that allow users to make payments. They can be fixed-amount or flexible-amount payment links.
          </p>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Create Payment Link</h3>
            <code className="text-sm bg-slate-900 text-slate-50 p-3 block rounded mb-3">
              POST /payment-links
            </code>
            
            <h4 className="font-semibold text-slate-900 mb-2">Request Body</h4>
            <code className="text-sm bg-slate-50 border border-slate-200 p-4 block rounded mb-3 overflow-x-auto">
              {`{
  "amount_usd": 99.99,
  "amount_type": "fixed",
  "description": "Premium package subscription",
  "custom_path": "premium-plan-2024",
  "product_slug": "mobile-app",
  "minimum_amount_usd": 20,
  "is_active": true
}`}
            </code>

            <h4 className="font-semibold text-slate-900 mb-2">Parameters</h4>
            <table className="w-full text-sm border-collapse mb-3">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 font-semibold text-slate-900">Parameter</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-900">Type</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-900">Required</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-900">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-3 px-3"><code className="bg-slate-100 px-2 py-1 rounded">amount_usd</code></td>
                  <td className="py-3 px-3">number</td>
                  <td className="py-3 px-3">Yes</td>
                  <td className="py-3 px-3">Payment amount in USD</td>
                </tr>
                <tr>
                  <td className="py-3 px-3"><code className="bg-slate-100 px-2 py-1 rounded">amount_type</code></td>
                  <td className="py-3 px-3">string</td>
                  <td className="py-3 px-3">Yes</td>
                  <td className="py-3 px-3">"fixed" or "flexible"</td>
                </tr>
                <tr>
                  <td className="py-3 px-3"><code className="bg-slate-100 px-2 py-1 rounded">description</code></td>
                  <td className="py-3 px-3">string</td>
                  <td className="py-3 px-3">No</td>
                  <td className="py-3 px-3">Link description shown to users</td>
                </tr>
                <tr>
                  <td className="py-3 px-3"><code className="bg-slate-100 px-2 py-1 rounded">custom_path</code></td>
                  <td className="py-3 px-3">string</td>
                  <td className="py-3 px-3">No</td>
                  <td className="py-3 px-3">Custom URL path (auto-generated if omitted)</td>
                </tr>
                <tr>
                  <td className="py-3 px-3"><code className="bg-slate-100 px-2 py-1 rounded">product_slug</code></td>
                  <td className="py-3 px-3">string</td>
                  <td className="py-3 px-3">No</td>
                  <td className="py-3 px-3">Associate with a product for tracking</td>
                </tr>
                <tr>
                  <td className="py-3 px-3"><code className="bg-slate-100 px-2 py-1 rounded">minimum_amount_usd</code></td>
                  <td className="py-3 px-3">number</td>
                  <td className="py-3 px-3">No</td>
                  <td className="py-3 px-3">Minimum for flexible payments (default: 20)</td>
                </tr>
              </tbody>
            </table>

            <h4 className="font-semibold text-slate-900 mb-2">Response</h4>
            <code className="text-sm bg-slate-50 border border-slate-200 p-4 block rounded overflow-x-auto">
              {`{
  "id": "c7b8d5e2-4f9a-11ef-a236-0242ac120002",
  "custom_path": "premium-plan-2024",
  "amount_usd": "99.99",
  "amount_type": "fixed",
  "description": "Premium package subscription",
  "product_slug": "mobile-app",
  "payment_url": "https://pay.iicar.org/pay/premium-plan-2024",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}`}
            </code>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">List Payment Links</h3>
            <code className="text-sm bg-slate-900 text-slate-50 p-3 block rounded mb-3">
              GET /payment-links?status=active&product_slug=mobile-app
            </code>
            
            <h4 className="font-semibold text-slate-900 mb-2">Query Parameters</h4>
            <ul className="text-sm text-slate-700 space-y-2">
              <li><code className="bg-slate-100 px-2 py-1 rounded">status</code> - Filter by status: active, inactive</li>
              <li><code className="bg-slate-100 px-2 py-1 rounded">product_slug</code> - Filter by product</li>
              <li><code className="bg-slate-100 px-2 py-1 rounded">limit</code> - Number of results (default: 50, max: 100)</li>
              <li><code className="bg-slate-100 px-2 py-1 rounded">offset</code> - Pagination offset</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Get Payment Link Details</h3>
            <code className="text-sm bg-slate-900 text-slate-50 p-3 block rounded">
              GET /payment-links/c7b8d5e2-4f9a-11ef-a236-0242ac120002
            </code>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Update Payment Link</h3>
            <code className="text-sm bg-slate-900 text-slate-50 p-3 block rounded mb-3">
              PATCH /payment-links/c7b8d5e2-4f9a-11ef-a236-0242ac120002
            </code>
            <p className="text-sm text-slate-700">Update payment link properties like description, status, and amount.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Disable Payment Link</h3>
            <code className="text-sm bg-slate-900 text-slate-50 p-3 block rounded mb-3">
              POST /payment-links/c7b8d5e2-4f9a-11ef-a236-0242ac120002/disable
            </code>
            <p className="text-sm text-slate-700">Disable a payment link to prevent new payments.</p>
          </div>
        </div>
      ),
    },

    {
      id: 'payments',
      title: 'Payments API',
      content: (
        <div className="space-y-6">
          <p className="text-slate-700">
            Retrieve payment transaction data and monitor payment status in real-time.
          </p>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">List Payments</h3>
            <code className="text-sm bg-slate-900 text-slate-50 p-3 block rounded mb-3">
              GET /payments?status=completed&limit=50&offset=0
            </code>

            <h4 className="font-semibold text-slate-900 mb-2">Query Parameters</h4>
            <table className="w-full text-sm border-collapse mb-3">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 font-semibold text-slate-900">Parameter</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-900">Type</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-900">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-3 px-3"><code className="bg-slate-100 px-2 py-1 rounded">status</code></td>
                  <td className="py-3 px-3">string</td>
                  <td className="py-3 px-3">pending, completed, failed, refunded</td>
                </tr>
                <tr>
                  <td className="py-3 px-3"><code className="bg-slate-100 px-2 py-1 rounded">product_slug</code></td>
                  <td className="py-3 px-3">string</td>
                  <td className="py-3 px-3">Filter by product</td>
                </tr>
                <tr>
                  <td className="py-3 px-3"><code className="bg-slate-100 px-2 py-1 rounded">limit</code></td>
                  <td className="py-3 px-3">number</td>
                  <td className="py-3 px-3">Results per page (default: 50, max: 100)</td>
                </tr>
                <tr>
                  <td className="py-3 px-3"><code className="bg-slate-100 px-2 py-1 rounded">offset</code></td>
                  <td className="py-3 px-3">number</td>
                  <td className="py-3 px-3">Pagination offset</td>
                </tr>
              </tbody>
            </table>

            <h4 className="font-semibold text-slate-900 mb-2">Response</h4>
            <code className="text-sm bg-slate-50 border border-slate-200 p-4 block rounded overflow-x-auto">
              {`{
  "payments": [
    {
      "id": "pay_abc123xyz",
      "link_id": "c7b8d5e2-4f9a-11ef-a236-0242ac120002",
      "amount_usd": "99.99",
      "status": "completed",
      "email": "user@example.com",
      "reference": "PAY_2024_001",
      "product_slug": "mobile-app",
      "created_at": "2024-01-15T10:30:00Z",
      "completed_at": "2024-01-15T10:35:00Z"
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}`}
            </code>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Get Payment Details</h3>
            <code className="text-sm bg-slate-900 text-slate-50 p-3 block rounded">
              GET /payments/pay_abc123xyz
            </code>
          </div>
        </div>
      ),
    },

    {
      id: 'api-keys',
      title: 'API Keys Management',
      content: (
        <div className="space-y-6">
          <p className="text-slate-700">
            API keys are used to authenticate your requests to the Committee API. Generate and manage keys from your <Link href="/dashboard/api-keys" className="text-blue-600 hover:underline">API Keys dashboard</Link>.
          </p>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Key Format</h3>
            <p className="text-slate-700 mb-3">API keys follow this format:</p>
            <code className="text-sm bg-slate-50 border border-slate-200 p-3 block rounded">
              ap_live_32randomcharactersandnumbers1234
            </code>
            <ul className="text-sm text-slate-700 space-y-2 mt-3">
              <li><code className="bg-slate-100 px-2 py-1 rounded">ap_live</code> - Production environment prefix</li>
              <li><code className="bg-slate-100 px-2 py-1 rounded">32 characters</code> - Random unique identifier</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Key Permissions</h3>
            <p className="text-slate-700 mb-3">Each API key can be scoped to specific permissions:</p>
            <ul className="text-sm text-slate-700 space-y-2">
              <li><strong>read:payment_links</strong> - Read payment link data</li>
              <li><strong>write:payment_links</strong> - Create and update payment links</li>
              <li><strong>read:payments</strong> - Read payment transaction data</li>
              <li><strong>write:payments</strong> - Update payment status</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Best Practices</h3>
            <ul className="text-sm text-slate-700 space-y-3">
              <li className="flex gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span>Store API keys securely in environment variables</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span>Use separate keys for different environments (development, staging, production)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span>Rotate keys regularly for security</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">✗</span>
                <span>Never commit API keys to version control</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">✗</span>
                <span>Never expose API keys in client-side code</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },

    {
      id: 'errors',
      title: 'Error Handling',
      content: (
        <div className="space-y-6">
          <p className="text-slate-700">
            The API uses standard HTTP status codes and returns detailed error messages to help you troubleshoot issues.
          </p>

          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Error Response Format</h4>
            <code className="text-sm bg-slate-50 border border-slate-200 p-4 block rounded">
              {`{
  "error": "payment_not_found",
  "message": "Payment with ID 'pay_invalid' not found",
  "status_code": 404
}`}
            </code>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Common Status Codes</h4>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-3 font-semibold text-slate-900">Status Code</th>
                  <th className="text-left py-3 px-3 font-semibold text-slate-900">Meaning</th>
                  <th className="text-left py-3 px-3 font-semibold text-slate-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-3 px-3"><strong>200 OK</strong></td>
                  <td className="py-3 px-3">Request succeeded</td>
                  <td className="py-3 px-3">None</td>
                </tr>
                <tr>
                  <td className="py-3 px-3"><strong>400 Bad Request</strong></td>
                  <td className="py-3 px-3">Invalid parameters</td>
                  <td className="py-3 px-3">Check request format</td>
                </tr>
                <tr>
                  <td className="py-3 px-3"><strong>401 Unauthorized</strong></td>
                  <td className="py-3 px-3">Invalid API key</td>
                  <td className="py-3 px-3">Verify API key</td>
                </tr>
                <tr>
                  <td className="py-3 px-3"><strong>403 Forbidden</strong></td>
                  <td className="py-3 px-3">Insufficient permissions</td>
                  <td className="py-3 px-3">Check key permissions</td>
                </tr>
                <tr>
                  <td className="py-3 px-3"><strong>404 Not Found</strong></td>
                  <td className="py-3 px-3">Resource not found</td>
                  <td className="py-3 px-3">Verify resource ID</td>
                </tr>
                <tr>
                  <td className="py-3 px-3"><strong>429 Too Many Requests</strong></td>
                  <td className="py-3 px-3">Rate limit exceeded</td>
                  <td className="py-3 px-3">Wait before retrying</td>
                </tr>
                <tr>
                  <td className="py-3 px-3"><strong>500 Server Error</strong></td>
                  <td className="py-3 px-3">Server error</td>
                  <td className="py-3 px-3">Retry with backoff</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Handling 429 Rate Limit Errors</h4>
            <code className="text-sm bg-slate-900 text-slate-50 p-3 block rounded">
              {`if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After') || '60';
  console.log(\`Rate limited. Retry after \${retryAfter} seconds\`);
  // Implement exponential backoff
}`}
            </code>
          </div>
        </div>
      ),
    },

    {
      id: 'examples',
      title: 'Code Examples',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">JavaScript/TypeScript Example</h3>
            <code className="text-sm bg-slate-900 text-slate-50 p-4 block rounded overflow-x-auto">
              {`// Initialize API client
const API_KEY = 'ap_live_xxxxxxxxxxxxxxxxxxxx';
const API_URL = 'https://pay.iicar.org/api/v1';

async function createPaymentLink(amount, description) {
  try {
    const response = await fetch(\`\${API_URL}/payment-links\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${API_KEY}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount_usd: amount,
        amount_type: 'fixed',
        description: description,
        product_slug: 'my-product'
      })
    });

    if (!response.ok) {
      throw new Error(\`API error: \${response.status}\`);
    }

    const data = await response.json();
    console.log('Payment link created:', data.payment_url);
    return data;
  } catch (error) {
    console.error('Error creating payment link:', error);
  }
}

// Create a $99.99 payment link
await createPaymentLink(99.99, 'Premium subscription');`}
            </code>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">cURL Example</h3>
            <code className="text-sm bg-slate-900 text-slate-50 p-4 block rounded overflow-x-auto">
              {`curl -X POST https://pay.iicar.org/api/v1/payment-links \\
  -H "Authorization: Bearer ap_live_xxxxxxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount_usd": 99.99,
    "amount_type": "fixed",
    "description": "Premium subscription",
    "product_slug": "my-product"
  }'`}
            </code>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Python Example</h3>
            <code className="text-sm bg-slate-900 text-slate-50 p-4 block rounded overflow-x-auto">
              {`import requests

API_KEY = 'ap_live_xxxxxxxxxxxxxxxxxxxx'
API_URL = 'https://pay.iicar.org/api/v1'

headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json'
}

# Create payment link
payload = {
    'amount_usd': 99.99,
    'amount_type': 'fixed',
    'description': 'Premium subscription',
    'product_slug': 'my-product'
}

response = requests.post(
    f'{API_URL}/payment-links',
    json=payload,
    headers=headers
)

data = response.json()
print(f'Payment URL: {data["payment_url"]}')`}
            </code>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <Link href="/" className="text-blue-600 hover:text-blue-700 mb-4 inline-block text-sm sm:text-base">
            ← Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">API Documentation</h1>
          <p className="text-base sm:text-lg text-slate-600">Complete guide to integrating Committee into your products</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 sticky top-4">
              <h3 className="font-semibold text-slate-900 mb-4 text-sm sm:text-base">Documentation</h3>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setExpandedSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition ${
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

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6 sm:p-8">
              {sections.map((section) => (
                <div key={section.id} className={expandedSection === section.id ? 'block' : 'hidden'}>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">{section.title}</h2>
                  <div className="text-slate-700">{section.content}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 sm:mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
          <p className="text-sm text-blue-800">
            For support with API integration, visit your <Link href="/dashboard/api-keys" className="font-medium underline">API Keys dashboard</Link> or contact our support team.
          </p>
        </div>
      </div>
    </div>
  )
}
