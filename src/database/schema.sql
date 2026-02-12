CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan TEXT DEFAULT 'free',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  phone TEXT NOT NULL,
  name TEXT,
  lead_status TEXT DEFAULT 'new',
  purchase_probability NUMERIC DEFAULT 0,
  technical_level TEXT DEFAULT 'basic',
  last_interaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products_static (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  name TEXT NOT NULL,
  description TEXT,
  benefits JSONB DEFAULT '{}',
  price NUMERIC DEFAULT 0,
  promotion TEXT,
  warranty TEXT,
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS products_dynamic (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  category TEXT NOT NULL,
  brand TEXT,
  reference TEXT,
  specs JSONB DEFAULT '{}',
  price NUMERIC DEFAULT 0,
  stock INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  intent TEXT,
  confidence NUMERIC,
  message TEXT,
  response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
