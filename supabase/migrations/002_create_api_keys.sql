-- Create API keys table
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(255) NOT NULL UNIQUE,
  key_preview VARCHAR(20) NOT NULL, -- First 8 + last 4 chars for display
  product_slug VARCHAR(100),
  permissions JSONB DEFAULT '["read:payment_links", "create:payment_links", "update:payment_links", "delete:payment_links", "read:payments", "webhook:register"]'::jsonb,
  rate_limit_per_hour INTEGER DEFAULT 1000,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_product_slug ON api_keys(product_slug);

-- Extend payment_links table
ALTER TABLE payment_links
ADD COLUMN api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
ADD COLUMN product_slug VARCHAR(100),
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN max_payments INTEGER;

CREATE INDEX idx_payment_links_api_key_id ON payment_links(api_key_id);
CREATE INDEX idx_payment_links_product_slug ON payment_links(product_slug);

-- Create API key audit log table
CREATE TABLE api_key_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  status VARCHAR(20),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_api_key_id ON api_key_audit_logs(api_key_id);
CREATE INDEX idx_audit_logs_created_at ON api_key_audit_logs(created_at);
