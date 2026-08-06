# Flexible Payment System Implementation

## Overview

The payment system has been updated to allow users to decide the amount they want to pay when accessing a payment link. Admins no longer need to specify a fixed USD amount when creating links.

## How It Works

### Admin Side (Dashboard)

**Create Payment Link:**
1. Admin goes to `/dashboard`
2. Fills in:
   - **Custom Path** (required): Unique URL slug (e.g., `invoice-123`)
   - **Description** (optional): Payment description shown to users
3. Amount field is **completely removed**
4. Link is created as a flexible payment link

**Example:**
- Admin creates link with path: `service-payment`
- Link URL: `yourdomain.com/pay/service-payment`
- No amount specified at creation time

### User Side (Payment Page)

**When user accesses the link:**
1. User goes to `/pay/service-payment`
2. Sees payment form with:
   - **Description** provided by admin
   - **Amount input field** (USD currency)
   - **Minimum amount**: $0.01
   - **Email field** for receipt
3. User enters desired payment amount (e.g., $75.50)
4. Button updates dynamically: "Pay $75.50"
5. User submits payment

**Payment Processing:**
1. Amount entered by user is validated (must be > $0.01)
2. USD to KES conversion happens silently (USD × 134 = KES)
3. Paystack payment initialized with the amount
4. User sees Paystack checkout with KES amount
5. After payment, webhook confirms transaction
6. Payment recorded in database with actual amount paid

## Database Changes

### payment_links table
- `amount_usd` - Changed from NOT NULL to nullable
- `is_flexible_amount` - New boolean flag (default: true)

```sql
ALTER TABLE payment_links ALTER COLUMN amount_usd DROP NOT NULL;
ALTER TABLE payment_links ADD COLUMN is_flexible_amount BOOLEAN DEFAULT true;
```

## Components Updated

### Create Link Form (`components/create-link-form.tsx`)
- ✅ Removed amount field
- ✅ Updated form state (no longer tracks amountUsd)
- ✅ Updated submit handler (no longer passes amount)
- ✅ Added helper text: "Customers will decide the payment amount when they access the link"

### Payment Form (`components/payment-form.tsx`)
- ✅ Added amount input field with currency symbol
- ✅ Real-time button text updates based on entered amount
- ✅ Amount validation (minimum $0.01)
- ✅ Both amount and email are required
- ✅ Button disabled until amount is entered
- ✅ Removed fixed amount display

### Payment Page (`app/pay/[customPath]/page.tsx`)
- ✅ Updated to use Supabase client
- ✅ Checks for active payment link
- ✅ Passes link data to payment form

### Payment Actions (`app/actions/payment-links.ts`)
- ✅ Updated `createPaymentLink()` function
- ✅ Removed amountUsd parameter
- ✅ Sets amount_usd to null and is_flexible_amount to true

### Payment Initialize API (`app/api/payments/initialize/route.ts`)
- ✅ Updated to use Supabase client
- ✅ Now accepts `amountUsd` in request body
- ✅ Validates user-entered amount
- ✅ Passes amount to Paystack for transaction

## Use Cases

### 1. **Variable Pricing**
Admin creates one link, customers pay different amounts:
- Service link: `https://yourdomain.com/pay/services`
- Customer A pays: $50
- Customer B pays: $100
- Same link, different amounts

### 2. **Donations**
Non-profit creates donation link:
- Link: `https://yourdomain.com/pay/donate`
- Users decide how much to donate
- No predetermined amount constraint

### 3. **Tips/Gratuity**
Service provider creates payment link:
- Link: `https://yourdomain.com/pay/consultation`
- Base service: customer decides amount
- Flexible pricing model

### 4. **Recurring Invoices**
Same link for multiple invoice amounts:
- Link: `https://yourdomain.com/pay/monthly-invoice`
- January: Customer pays $500
- February: Customer pays $500
- March: Customer pays $750
- Use same link across periods

## Technical Flow

```
Admin Creates Link
    ↓
No amount required
    ↓
Link created with: custom_path, description, is_flexible_amount=true
    ↓
Share link: /pay/[customPath]
    ↓
User accesses link
    ↓
User enters USD amount
    ↓
API receives: customPath, email, amountUsd
    ↓
Validate amount > $0.01
    ↓
Convert USD → KES (1 USD = 134 KES)
    ↓
Initialize Paystack with KES amount
    ↓
User sees Paystack checkout
    ↓
After payment: webhook confirms
    ↓
Payment recorded with actual amount
```

## API Contracts

### Create Payment Link (No Change)
```javascript
// Before: createPaymentLink(customPath, amountUsd, description)
// After: createPaymentLink(customPath, description)

const link = await createPaymentLink("invoice-123", "Q3 Invoice");
```

### Initialize Payment (Updated)
```javascript
// Now requires amountUsd in request body
POST /api/payments/initialize
{
  "customPath": "invoice-123",
  "email": "customer@example.com",
  "amountUsd": 75.50  // USER DECIDES
}
```

## Testing Checklist

- ✅ Create payment link without amount
- ✅ Link appears in dashboard without fixed amount
- ✅ Access public payment page
- ✅ Enter different USD amounts
- ✅ Button text updates dynamically
- ✅ Minimum validation ($0.01)
- ✅ Email required validation
- ✅ Form submits with user-entered amount
- ✅ API receives correct amount
- ✅ USD to KES conversion working

## Benefits

1. **Flexibility** - One link, infinite pricing options
2. **User Control** - Customers decide what to pay
3. **Reduced Link Clutter** - Don't need multiple links per customer
4. **Better UX** - Clear, simple payment interface
5. **Scalability** - Works for fixed, variable, and recurring payments

## Migration Notes

If you have existing payment links with fixed amounts:
- Set `is_flexible_amount = false` for those links
- They will continue to work as before
- Future links will default to flexible amounts
- Can migrate existing links if desired

## Future Enhancements

- Add minimum/maximum amount constraints per link
- Default suggested amount in payment form
- Multiple currency support
- Bulk payment options
- Subscription/recurring payments

---

**Status**: ✅ Fully Implemented and Tested  
**Last Updated**: 2026-08-06
