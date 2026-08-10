import axios from 'axios'

const PAYSTACK_API_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_BASE_URL = 'https://api.paystack.co'
const USD_TO_KES_RATE = parseFloat(process.env.USD_TO_KES_RATE || '134')

// Lazy initialize Paystack client to avoid errors during build
let paystackClient: ReturnType<typeof axios.create> | null = null

function getPaystackClient() {
  if (!paystackClient) {
    if (!PAYSTACK_API_KEY) {
      throw new Error('PAYSTACK_SECRET_KEY environment variable is not set')
    }
    paystackClient = axios.create({
      baseURL: PAYSTACK_BASE_URL,
      headers: {
        Authorization: `Bearer ${PAYSTACK_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })
  }
  return paystackClient
}

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

export interface PaystackSettlementSummary {
  settledAmountKes: number
  pendingAmountKes: number
}

interface PaystackSettlement {
  amount?: number
  status?: string
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
    const client = getPaystackClient()
    const response = await client.post<InitializeTransactionResponse>('/transaction/initialize', payload)
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
    const client = getPaystackClient()
    const response = await client.get<VerifyTransactionResponse>(`/transaction/verify/${reference}`)
    return response.data
  } catch (error: any) {
    console.error('[Paystack] Transaction verification error:', error.response?.data || error.message)
    throw new Error(`Failed to verify Paystack transaction: ${error.message}`)
  }
}

/**
 * Fetch Paystack settlements and summarize amounts in KES.
 * Paystack amounts are returned in the smallest currency unit (kobo).
 */
export async function getPaystackSettlementSummary(): Promise<PaystackSettlementSummary> {
  try {
    const client = getPaystackClient()
    const pageSize = 100
    let page = 1
    let settledAmountKes = 0
    let pendingAmountKes = 0

    while (true) {
      const response = await client.get<{
        status: boolean
        data?: PaystackSettlement[]
        meta?: { page?: number; perPage?: number; total?: number }
      }>('/settlement', { params: { page, perPage: pageSize } })
      const settlements = response.data.data || []

      for (const settlement of settlements) {
        const amountKes = Number(settlement.amount || 0) / 100
        if (settlement.status === 'pending') {
          pendingAmountKes += amountKes
        } else if (settlement.status === 'success' || settlement.status === 'completed') {
          settledAmountKes += amountKes
        }
      }

      if (settlements.length < pageSize || (response.data.meta?.total && page * pageSize >= response.data.meta.total)) {
        break
      }
      page += 1
    }

    return { settledAmountKes, pendingAmountKes }
  } catch (error: any) {
    console.error('[Paystack] Settlement summary error:', error.response?.data || error.message)
    return { settledAmountKes: 0, pendingAmountKes: 0 }
  }
}

/**
 * Validate Paystack webhook signature
 */
export function validatePaystackSignature(signature: string, body: string): boolean {
  const crypto = require('crypto')
  if (!PAYSTACK_API_KEY) {
    throw new Error('PAYSTACK_SECRET_KEY environment variable is not set')
  }
  const hash = crypto.createHmac('sha512', PAYSTACK_API_KEY).update(body).digest('hex')
  return hash === signature
}
