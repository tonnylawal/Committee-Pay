import axios from 'axios'

const PAYSTACK_API_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_BASE_URL = 'https://api.paystack.co'
const USD_TO_KES_RATE = parseFloat(process.env.USD_TO_KES_RATE || '134')

if (!PAYSTACK_API_KEY) {
  throw new Error('PAYSTACK_SECRET_KEY environment variable is not set')
}

const paystackClient = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${PAYSTACK_API_KEY}`,
    'Content-Type': 'application/json',
  },
})

export interface InitializeTransactionPayload {
  email: string
  amount: number // in KES
  reference: string
  callback_url?: string
  metadata?: Record<string, any>
}

export interface InitializeTransactionResponse {
  status: boolean
  message: string
  data?: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

export interface VerifyTransactionResponse {
  status: boolean
  message: string
  data?: {
    id: number
    reference: string
    amount: number
    currency: string
    status: string
    customer: {
      id: number
      email: string
    }
    authorization: {
      authorization_code: string
      bin: string
      card_type: string
    }
  }
}

/**
 * Convert USD to KES using fixed rate
 */
export function convertUsdToKes(usdAmount: number): number {
  return Math.round(usdAmount * USD_TO_KES_RATE * 100) / 100
}

/**
 * Initialize Paystack payment transaction
 */
export async function initializePaystackTransaction(
  payload: InitializeTransactionPayload,
): Promise<InitializeTransactionResponse> {
  try {
    const response = await paystackClient.post<InitializeTransactionResponse>('/transaction/initialize', payload)
    return response.data
  } catch (error: any) {
    console.error('[Paystack] Transaction initialization error:', error.response?.data || error.message)
    throw new Error(`Failed to initialize Paystack transaction: ${error.message}`)
  }
}

/**
 * Verify Paystack payment
 */
export async function verifyPaystackTransaction(reference: string): Promise<VerifyTransactionResponse> {
  try {
    const response = await paystackClient.get<VerifyTransactionResponse>(`/transaction/verify/${reference}`)
    return response.data
  } catch (error: any) {
    console.error('[Paystack] Transaction verification error:', error.response?.data || error.message)
    throw new Error(`Failed to verify Paystack transaction: ${error.message}`)
  }
}

/**
 * Validate Paystack webhook signature
 */
export function validatePaystackSignature(signature: string, body: string): boolean {
  const crypto = require('crypto')
  const hash = crypto.createHmac('sha512', PAYSTACK_API_KEY).update(body).digest('hex')
  return hash === signature
}
