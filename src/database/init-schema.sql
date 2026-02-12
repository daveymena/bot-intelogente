-- Script para aplicar el esquema en la base de datos de EasyPanel
-- Ejecutar: psql -h 157.173.97.41 -U postgres -d botwhatsapp -f src/database/init-schema.sql

-- Crear extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de Tenants (Multi-tenancy)
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'premium', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Clientes
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  name TEXT,
  email TEXT,
  lead_status TEXT DEFAULT 'new' CHECK (lead_status IN ('new', 'warm', 'hot', 'won', 'lost')),
  purchase_probability NUMERIC DEFAULT 0 CHECK (purchase_probability >= 0 AND purchase_probability <= 100),
  technical_level TEXT DEFAULT 'basic' CHECK (technical_level IN ('basic', 'intermediate', 'advanced')),
  last_interaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, phone)
);

-- Tabla de Productos Estáticos
CREATE TABLE IF NOT EXISTS products_static (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  benefits JSONB DEFAULT '{}',
  price NUMERIC DEFAULT 0 CHECK (price >= 0),
  promotion TEXT,
  warranty TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Productos Dinámicos
CREATE TABLE IF NOT EXISTS products_dynamic (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  brand TEXT,
  reference TEXT,
  specs JSONB DEFAULT '{}',
  price NUMERIC DEFAULT 0 CHECK (price >= 0),
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Conversaciones
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  intent TEXT,
  confidence NUMERIC CHECK (confidence >= 0 AND confidence <= 1),
  message TEXT NOT NULL,
  response TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_tenant ON clients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_clients_lead_status ON clients(lead_status);
CREATE INDEX IF NOT EXISTS idx_clients_probability ON clients(purchase_probability DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_client ON conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_static_tenant ON products_static(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_dynamic_tenant ON products_dynamic(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_dynamic_category ON products_dynamic(category);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_static_updated_at ON products_static;
CREATE TRIGGER update_products_static_updated_at BEFORE UPDATE ON products_static
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_dynamic_updated_at ON products_dynamic;
CREATE TRIGGER update_products_dynamic_updated_at BEFORE UPDATE ON products_dynamic
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Datos de ejemplo (opcional)
-- Insertar tenant de prueba
INSERT INTO tenants (name, plan, status) 
VALUES ('Tienda Demo', 'premium', 'active')
ON CONFLICT DO NOTHING;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Esquema aplicado exitosamente';
    RAISE NOTICE '📊 Tablas creadas: tenants, clients, products_static, products_dynamic, conversations';
    RAISE NOTICE '🔍 Índices creados para optimizar consultas';
    RAISE NOTICE '⚡ Triggers configurados para updated_at';
END $$;
