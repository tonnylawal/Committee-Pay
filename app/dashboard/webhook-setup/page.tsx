import Link from 'next/link'

export default function WebhookSetupPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6 md:p-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-2">Paystack Webhook Configuration</h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 mb-6 sm:mb-8">
            Set up webhooks to receive real-time payment status updates from Paystack
          </p>

          {/* Overview */}
          <section className="mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-slate-200">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">Overview</h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 mb-3 sm:mb-4">
              Webhooks allow Paystack to automatically notify your Alghahim Pay system when a payment is completed, failed, or cancelled. This enables real-time transaction updates without polling.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-900 break-all">
                <strong>Webhook Endpoint:</strong> <br className="sm:hidden" /><code className="bg-white px-1 sm:px-2 py-1 rounded font-mono text-xs">https://pay.iicar.org/api/payments/webhook/paystack</code>
              </p>
            </div>
          </section>

          {/* Steps */}
          <section className="mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-slate-200">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">Setup Instructions</h2>

            <div className="space-y-4 sm:space-y-6">
              {/* Step 1 */}
              <div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 mb-2 sm:mb-3">Step 1: Log in to Paystack Dashboard</h3>
                <ol className="list-decimal list-inside space-y-1 sm:space-y-2 text-xs sm:text-sm md:text-base text-slate-600">
                  <li>Go to <a href="https://dashboard.paystack.com" className="text-blue-600 hover:underline break-all" target="_blank" rel="noopener noreferrer">https://dashboard.paystack.com</a></li>
                  <li>Sign in with your Paystack account</li>
                  <li>Make sure you&apos;re in the correct business/workspace</li>
                </ol>
              </div>

              {/* Step 2 */}
              <div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 mb-2 sm:mb-3">Step 2: Navigate to Webhooks Settings</h3>
                <ol className="list-decimal list-inside space-y-1 sm:space-y-2 text-xs sm:text-sm md:text-base text-slate-600">
                  <li>Click on <strong>Settings</strong> in the left sidebar</li>
                  <li>Select <strong>Webhooks</strong> from the settings menu</li>
                  <li>You should see the webhooks configuration page</li>
                </ol>
              </div>

              {/* Step 3 */}
              <div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 mb-2 sm:mb-3">Step 3: Add Webhook Endpoint</h3>
                <ol className="list-decimal list-inside space-y-1 sm:space-y-2 text-xs sm:text-sm md:text-base text-slate-600 mb-3 sm:mb-4">
                  <li>Click the <strong>&quot;Add URL&quot;</strong> or <strong>&quot;Add Webhook&quot;</strong> button</li>
                  <li>Enter the webhook URL in the URL field:
                    <div className="bg-slate-50 border border-slate-300 rounded p-2 sm:p-3 mt-1 sm:mt-2 font-mono text-xs overflow-x-auto break-all">
                      https://pay.iicar.org/api/payments/webhook/paystack
                    </div>
                  </li>
                </ol>
              </div>

              {/* Step 4 */}
              <div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 mb-2 sm:mb-3">Step 4: Select Events to Listen For</h3>
                <p className="text-xs sm:text-sm md:text-base text-slate-600 mb-2 sm:mb-3">Make sure the following events are selected:</p>
                <div className="bg-slate-50 border border-slate-300 rounded p-3 sm:p-4 space-y-2">
                  <label className="flex items-start sm:items-center gap-2">
                    <input type="checkbox" checked readOnly className="mt-1 sm:mt-0" />
                    <span className="text-xs sm:text-sm md:text-base text-slate-700"><strong>charge.success</strong> - Payment successful</span>
                  </label>
                  <label className="flex items-start sm:items-center gap-2">
                    <input type="checkbox" checked readOnly className="mt-1 sm:mt-0" />
                    <span className="text-xs sm:text-sm md:text-base text-slate-700"><strong>charge.failed</strong> - Payment failed</span>
                  </label>
                </div>
              </div>

              {/* Step 5 */}
              <div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 mb-2 sm:mb-3">Step 5: Save Webhook</h3>
                <ol className="list-decimal list-inside space-y-1 sm:space-y-2 text-xs sm:text-sm md:text-base text-slate-600">
                  <li>Click the <strong>Save</strong> or <strong>Add Webhook</strong> button</li>
                  <li>You should see a confirmation message</li>
                  <li>The webhook is now active and will send real-time updates</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Testing */}
          <section className="mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-slate-200">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">Testing Your Webhook</h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 mb-3 sm:mb-4">
              To test if your webhook is working correctly:
            </p>
            <ol className="list-decimal list-inside space-y-1 sm:space-y-2 md:space-y-3 text-xs sm:text-sm md:text-base text-slate-600">
              <li>In the Paystack Dashboard, go to <strong>Settings → Webhooks</strong></li>
              <li>Find your webhook in the list</li>
              <li>Click the <strong>Test</strong> button to send a test event</li>
              <li>Check your application logs to confirm the webhook was received</li>
              <li>Create a test transaction to verify end-to-end functionality</li>
            </ol>
          </section>

          {/* Troubleshooting */}
          <section className="mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-slate-200">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">Troubleshooting</h2>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 mb-2">Webhook Not Being Received</h3>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm md:text-base text-slate-600">
                  <li>Verify the webhook URL is exactly: <code className="bg-slate-100 px-1 rounded break-all">https://pay.iicar.org/api/payments/webhook/paystack</code></li>
                  <li>Ensure HTTPS is used (not HTTP)</li>
                  <li>Check that the correct events are selected</li>
                  <li>Verify your firewall/security rules allow Paystack&apos;s servers</li>
                  <li>Check application logs for errors</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 mb-2">Payments Not Updating Status</h3>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm md:text-base text-slate-600">
                  <li>Confirm the Paystack signature validation is passing</li>
                  <li>Verify your Paystack secret key is correctly configured</li>
                  <li>Check that your database is accessible and not full</li>
                  <li>Look for permission errors in your application logs</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 mb-2">Signature Validation Errors</h3>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm md:text-base text-slate-600">
                  <li>Ensure you&apos;re using your actual Paystack Secret Key (not the public key)</li>
                  <li>The <code className="bg-slate-100 px-1 rounded break-all">x-paystack-signature</code> header must be present in the webhook request</li>
                  <li>Use a webhook testing tool like Postman to debug signature issues</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Event Details */}
          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">Webhook Event Details</h2>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 mb-2 sm:mb-3">charge.success Event</h3>
                <p className="text-xs sm:text-sm md:text-base text-slate-600 mb-2 sm:mb-3">Sent when a payment is successfully processed.</p>
                <div className="bg-slate-50 border border-slate-300 rounded p-2 sm:p-3 md:p-4 font-mono text-xs overflow-x-auto">
                  <pre className="text-xs sm:text-sm">{`{
  "event": "charge.success",
  "data": {
    "id": 123456,
    "reference": "payment-ref-123",
    "amount": 50000,
    "currency": "KES",
    "status": "success",
    "customer": {
      "email": "customer@example.com"
    }
  }
}`}</pre>
                </div>
              </div>

              <div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 mb-2 sm:mb-3">charge.failed Event</h3>
                <p className="text-xs sm:text-sm md:text-base text-slate-600 mb-2 sm:mb-3">Sent when a payment fails.</p>
                <div className="bg-slate-50 border border-slate-300 rounded p-2 sm:p-3 md:p-4 font-mono text-xs overflow-x-auto">
                  <pre className="text-xs sm:text-sm">{`{
  "event": "charge.failed",
  "data": {
    "id": 123456,
    "reference": "payment-ref-123",
    "amount": 50000,
    "currency": "KES",
    "status": "failed",
    "customer": {
      "email": "customer@example.com"
    }
  }
}`}</pre>
                </div>
              </div>
            </div>
          </section>

          {/* Support */}
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-slate-200">
            <p className="text-xs sm:text-sm md:text-base text-slate-600">
              For more information, visit <a href="https://paystack.com/docs/payments/webhooks/" className="text-blue-600 hover:underline break-all" target="_blank" rel="noopener noreferrer">Paystack Webhooks Documentation</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
