# Deployment & Status Fixes

## Issues Fixed

### 1. Deployment Errors (Build Failed)
**Problem**: Build was failing with 9 errors about missing Drizzle ORM and schema files
- `Can't resolve '@/lib/db/schema'`
- `Can't resolve 'drizzle-orm'`
- `Export db doesn't exist in target module`

**Root Cause**: Three API routes still used the old Drizzle ORM imports after migration to Supabase

**Solution**: Updated all API routes to use Supabase service role client

### 2. Payment Links Showing Inactive
**Problem**: Newly created payment links were showing as "Inactive" with no way to activate them
- Status badge showed "Inactive" in gray
- No "Activate" button was available
- Only a disabled "Disable" button was shown

**Root Cause**: 
- New links were created with `is_active: false` (incorrect default)
- UI didn't support activation of inactive links
- Property name mismatches between components and database

**Solution**: 
- Set new links to `is_active: true` by default
- Added `activatePaymentLink()` server action
- Implemented toggle button logic in table

---

## Fixed Files

### API Routes
**Files Updated**: 3 critical API routes

#### 1. `/app/api/payment-links/route.ts`
- Removed: `import { db } from '@/lib/db'`, `import { paymentLinks } from '@/lib/db/schema'`, `import { eq } from 'drizzle-orm'`
- Added: Supabase service role client initialization
- Changed database operations from Drizzle syntax to Supabase PostgREST API

#### 2. `/app/api/payments/verify/route.ts`
- Removed: Old database imports and Drizzle queries
- Added: Supabase queries for payment verification
- Fixed column names: `referenceId` → `reference_id`, `amountUsd` → `amount_usd`, `amountKes` → `amount_kes`

#### 3. `/app/api/payments/webhook/route.ts`
- Removed: Old database imports
- Added: Supabase service role client for webhook payment status updates
- Fixed: `referenceId` → `reference_id` in Supabase queries

### Server Actions
**File**: `/app/actions/payment-links.ts`

**Changes**:
- Added `is_active: true` to new link creation (default)
- Split delete function into:
  - `disablePaymentLink(id)` - Soft delete (sets `is_active = false`)
  - `activatePaymentLink(id)` - Reactivates link (sets `is_active = true`)
  - `deletePaymentLink(id)` - Hard delete (permanent removal)

### UI Components
**File**: `/components/payment-links-table.tsx`

**Changes**:
- Added imports: `disablePaymentLink`, `activatePaymentLink`
- Added `handleActivate()` function for reactivating links
- Fixed column name references: `customPath` → `custom_path`, `createdAt` → `created_at`, `isActive` → `is_active`
- Implemented conditional button rendering:
  - Active links: Red "Disable" button
  - Inactive links: Green "Activate" button
- Status badge now correctly reflects link state with color coding

---

## Build Status

✅ **Build Now Passes**
```
✓ Running next.config.mjs took 150ms
✓ Generating static pages using 1 worker (10/10) in 188ms
```

No more errors about missing Drizzle imports or schema files.

---

## Payment Link Lifecycle

### New Link Created
```
1. Admin creates link with form
2. Link saved with is_active: true (ACTIVE)
3. Appears in table with "Active" status badge
4. "Disable" button available
```

### Admin Disables Link
```
1. Admin clicks "Disable" button
2. Soft delete: is_active set to false
3. Link shows "Inactive" status badge
4. "Activate" button now appears
```

### Admin Reactivates Link
```
1. Admin clicks "Activate" button
2. is_active set to true
3. Link returns to "Active" status
4. "Disable" button re-appears
```

### Hard Delete (Permanent)
```
1. Admin deletes permanently
2. Link removed from database entirely
3. Cannot be recovered
```

---

## Database Schema
All payment_links queries now use correct Supabase column names:
- `custom_path` (string) - URL path
- `amount_usd` (decimal | null) - For fixed amounts
- `amount_type` ('fixed' | 'flexible') - Type of payment
- `minimum_amount_usd` (decimal) - Minimum for flexible
- `is_active` (boolean) - Active/Inactive status
- `created_at` (timestamp) - Creation date
- `description` (text | null) - Admin notes

---

## Testing

✅ Local build successful with all fixes
✅ Payment links display correctly with proper status
✅ Activate/Disable buttons toggle as expected
✅ Fixed and Flexible amount types display correctly
✅ All three API routes working with Supabase

Ready for deployment!
