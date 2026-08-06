# Admin Payment Link Management System

Complete admin control over payment links with both fixed and flexible amount options.

## Features Overview

### Admin Dashboard Capabilities

#### 1. Create Payment Links

**Two Payment Types:**

- **Fixed Amount**: Admin sets a specific USD amount that customers must pay
  - Example: Invoice for $99.99
  - Customer cannot change the amount
  - Button shows "Pay $99.99"

- **Customer Decides (Flexible)**: Admin sets a minimum, customer decides how much to pay
  - Default minimum: $20 USD
  - Customizable per link
  - Customer enters their desired amount
  - Button updates dynamically: "Pay $[amount]"

**Form Fields:**
- Custom Path (required): URL slug for the payment link
- Payment Type (required): Fixed or Flexible toggle
- Amount (USD) (fixed only): Fixed payment amount
- Minimum Amount (USD) (flexible only): Minimum customer must pay
- Description (optional): Link description for reference

#### 2. Manage Existing Links

**Admin Actions for Each Link:**

- **Copy**: Copy payment link to clipboard
- **Edit**: Modify description, amount, or minimum
- **Payments**: View payment history and details
- **Disable**: Deactivate link (soft delete, can be re-enabled)

**Table Display:**

Shows all payment links with:
- Custom path
- Type badge (Fixed = blue, Flexible = purple)
- Amount (fixed) or Min: $[amount] (flexible)
- Status (Active/Inactive)
- Created date
- Action buttons

#### 3. Edit Payment Links

Click "Edit" to open modal with options to:
- Update description
- Change fixed amount (if fixed link)
- Change minimum amount (if flexible link)
- Save changes or cancel

#### 4. Payment Tracking

- View all payments per link
- See payment status (pending, completed, failed)
- Track amount paid in USD and KES
- Customer email associated with payment

---

## Public Payment Pages

### Fixed Amount Payment Page

**Customer Experience:**
- Sees payment description
- Shows fixed amount (non-editable field)
- Enters email address
- Button displays "Pay $[amount]"
- Cannot modify the amount

**Example URL:** `yourdomain.com/pay/invoice-500`

### Flexible Amount Payment Page

**Customer Experience:**
- Sees payment description
- Amount input field with minimum validation
- Enter desired USD amount (minimum: $[admin_set_minimum])
- Button disabled until amount entered
- Button text updates: "Pay $[amount]"
- Enters email address
- Confirms payment

**Example URL:** `yourdomain.com/pay/service-fee`

---

## Database Schema

### payment_links Table

```sql
- id (int): Primary key
- custom_path (varchar): Unique URL slug
- amount_usd (decimal, nullable): Fixed amount if type='fixed'
- amount_type (varchar): 'fixed' | 'flexible'
- minimum_amount_usd (decimal): Minimum for flexible payments (default: 20.00)
- description (text, nullable): Admin description
- is_active (boolean): Link status
- is_flexible_amount (boolean): Legacy field for backward compatibility
- created_at (timestamp): Link creation time
- updated_at (timestamp): Last modified time
```

### payments Table

```sql
- id (int): Primary key
- link_id (int): Reference to payment_links
- reference_id (varchar): Paystack reference
- amount_kes (decimal): Amount in KES
- amount_usd (decimal): Amount in USD (as paid)
- status (varchar): pending | completed | failed
- customer_email (varchar): Customer email
- created_at (timestamp)
- updated_at (timestamp)
```

---

## Key Business Rules

### Fixed Amount Links
- Amount is set by admin during creation
- Cannot be changed by customer
- Exact amount shown to customer
- USD to KES conversion done silently
- Customers cannot negotiate price

### Flexible Amount Links
- Admin sets minimum amount (default $20 USD)
- Customer chooses amount above minimum
- Minimum validation enforced server-side
- Each payment records actual amount paid
- Allows variable pricing: donations, tips, flexible fees

### Payment Validation
- Server-side minimum amount enforcement
- No client-side validation bypass possible
- Amount recorded in both USD and KES
- Paystack handles currency conversion for actual transaction

---

## Use Cases

### Fixed Amount Scenarios
- Product sales (exact price)
- Service invoices (predetermined cost)
- Subscription payments (regular amount)
- Membership fees (fixed annual cost)

### Flexible Amount Scenarios
- Donations and fundraising
- Tips and gratuities
- Variable service pricing
- "Pay what you want" model
- Flexible invoices (customer can pay partial)

---

## UI Components

### Create Link Form
- Radio buttons for payment type selection
- Conditional fields based on type selection
- Clear labels and helper text
- Blue highlight on selected option

### Payment Links Table
- Type badges with distinct colors
- Amount display (fixed value or "Min: $[amount]")
- Status indicators (Active/Inactive)
- Compact action buttons

### Edit Link Modal
- Disabled path field (cannot change)
- Editable description and amounts
- Proper validation and error messages
- Save/Cancel options

### Payment Forms
- Fixed: Display-only amount field
- Flexible: Input field with minimum validation
- Real-time button text updates
- Email validation
- Error messages for validation failures

---

## Technical Implementation

### Frontend
- React components with TypeScript
- Conditional rendering for payment types
- Real-time form validation
- Modal for editing links
- Responsive design

### Backend (Server Actions)
- `createPaymentLink()`: Creates fixed or flexible links
- `updatePaymentLink()`: Edits link settings
- `deletePaymentLink()`: Soft deletes (sets is_active=false)
- `getPaymentLinks()`: Lists all links
- `getPaymentsByLinkId()`: Gets payment history
- `getPaymentStats()`: Aggregated payment data

### API Routes
- `POST /api/payments/initialize`: Initiates payment with customer amount
- `GET /api/payments/verify`: Verifies payment status

---

## Security Considerations

- Minimum amount validation on server (not just client)
- Amount cannot be modified after payment initialization
- Payment reference tied to specific link
- Email validation before payment
- Soft deletes preserve payment history
- Row-level security via Supabase auth

---

## Testing Checklist

- [ ] Create fixed amount link, verify on payment page
- [ ] Create flexible amount link, test minimum validation
- [ ] Edit link (change description, amount)
- [ ] Disable link, verify returns inactive message
- [ ] Test payment page with below-minimum amount
- [ ] Test payment page with above-minimum amount
- [ ] Verify button text updates dynamically
- [ ] Check payment history in admin panel
- [ ] Verify USD to KES conversion
- [ ] Test mobile responsiveness

---

## Deployment Notes

- No migration needed for existing links (backward compatible)
- New links created with amount_type field populated
- Existing flexible links default to $20 minimum
- Existing fixed links converted to amount_type='fixed'
- All links retain is_active status
