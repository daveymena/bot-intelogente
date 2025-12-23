# Design Document: Multi-Service Agent

## Overview

Sistema de agente de ventas universal que detecta automáticamente el tipo de negocio del tenant y adapta sus respuestas, flujos y plantillas dinámicamente. Utiliza IA para analizar los productos/servicios agregados y generar comportamiento apropiado sin configuración manual.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Multi-Service Agent                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ Business Context│  │  Flow Engine    │  │  Template   │ │
│  │    Detector     │  │                 │  │  Generator  │ │
│  └────────┬────────┘  └────────┬────────┘  └──────┬──────┘ │
│           │                    │                   │        │
│           ▼                    ▼                   ▼        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Unified Response Service                   ││
│  └─────────────────────────────────────────────────────────┘│
│           │                    │                   │        │
│           ▼                    ▼                   ▼        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  Product Flow   │  │  Service Flow   │  │ Restaurant  │ │
│  │  (Cart/Buy)     │  │  (Book/Quote)   │  │   Flow      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. BusinessContextDetector

Analiza los items del tenant para detectar el tipo de negocio.

```typescript
interface BusinessContext {
  type: 'STORE' | 'SERVICE' | 'RESTAURANT' | 'HYBRID' | 'UNKNOWN'
  confidence: number // 0-1
  subType?: string // 'electronics', 'consulting', 'fast-food', etc.
  features: {
    hasPhysicalProducts: boolean
    hasDigitalProducts: boolean
    hasServices: boolean
    hasAppointments: boolean
    hasDelivery: boolean
    hasLocation: boolean
  }
}

interface BusinessContextDetector {
  detectFromItems(items: Item[]): Promise<BusinessContext>
  updateContext(currentContext: BusinessContext, newItems: Item[]): Promise<BusinessContext>
  getKeywords(items: Item[]): string[]
}
```

### 2. FlowEngine

Determina qué flujo de conversación usar según el contexto.

```typescript
type FlowType = 
  | 'product_inquiry'    // Consulta de producto
  | 'product_purchase'   // Compra de producto
  | 'service_inquiry'    // Consulta de servicio
  | 'service_booking'    // Agendar servicio
  | 'menu_display'       // Mostrar menú
  | 'food_order'         // Pedido de comida
  | 'quote_request'      // Solicitar cotización
  | 'location_service'   // Servicio a domicilio
  | 'general_inquiry'    // Consulta general

interface FlowEngine {
  detectFlow(message: string, context: BusinessContext, conversationState: ConversationState): FlowType
  getFlowSteps(flowType: FlowType): FlowStep[]
  executeStep(step: FlowStep, userInput: string): FlowResult
}

interface FlowStep {
  id: string
  type: 'ask' | 'show' | 'confirm' | 'collect' | 'complete'
  prompt?: string
  options?: string[]
  validation?: (input: string) => boolean
  nextStep?: string | ((input: string) => string)
}
```

### 3. TemplateGenerator

Genera plantillas de respuesta dinámicas según el tipo de item y negocio.

```typescript
interface TemplateGenerator {
  generateItemCard(item: Item, context: BusinessContext): string
  generateCategoryList(items: Item[], category: string, context: BusinessContext): string
  generateGreeting(context: BusinessContext, tenantName: string): string
  generatePaymentInfo(item: Item, context: BusinessContext): string
  generateBookingConfirmation(booking: Booking): string
  generateOrderSummary(order: Order): string
}

interface TemplateConfig {
  tone: 'formal' | 'casual' | 'friendly' | 'professional'
  useEmojis: boolean
  maxLength: number
  includeImages: boolean
  currency: string
  language: string
}
```

### 4. CategoryAutoGenerator

Crea y organiza categorías automáticamente basándose en los items agregados.

```typescript
interface CategoryAutoGenerator {
  // Detecta categoría para un nuevo item
  detectCategory(item: Item, existingCategories: Category[]): Promise<CategorySuggestion>
  
  // Crea categorías automáticamente al analizar items
  generateCategories(items: Item[]): Promise<Category[]>
  
  // Reorganiza categorías cuando hay cambios significativos
  reorganizeCategories(tenantId: string): Promise<Category[]>
  
  // Sugiere subcategorías basadas en items similares
  suggestSubcategories(category: Category, items: Item[]): Promise<string[]>
}

interface Category {
  id: string
  userId: string
  name: string
  slug: string
  description?: string
  parentId?: string // Para subcategorías
  icon?: string
  order: number
  itemType: 'PRODUCT' | 'SERVICE' | 'FOOD' | 'MIXED'
  
  // Auto-generated
  keywords: string[]
  itemCount: number
  
  // Flow configuration
  flowType?: FlowType
  requiresBooking?: boolean
  requiresLocation?: boolean
  
  createdAt: Date
  updatedAt: Date
}

interface CategorySuggestion {
  category: string
  subcategory?: string
  confidence: number
  isNew: boolean // Si es una categoría nueva a crear
  suggestedIcon?: string
}
```

### 5. UnifiedResponseService

Orquesta todos los componentes para generar respuestas.

```typescript
interface UnifiedResponseService {
  processMessage(
    message: string,
    tenantId: string,
    conversationId: string
  ): Promise<ResponseResult>
  
  getBusinessContext(tenantId: string): Promise<BusinessContext>
  updateBusinessContext(tenantId: string): Promise<void>
}

interface ResponseResult {
  text: string
  flow: FlowType
  stage: string
  sendMedia: boolean
  mediaUrls?: string[]
  quickReplies?: string[]
  requiresInput?: boolean
  inputType?: 'text' | 'location' | 'date' | 'time' | 'options'
}
```

## Data Models

### BusinessSettings (Extension to existing User/Tenant)

```typescript
interface BusinessSettings {
  id: string
  userId: string
  
  // Auto-detected
  detectedType: BusinessContext['type']
  detectedSubType?: string
  confidence: number
  
  // Manual overrides
  manualType?: string
  businessName: string
  businessDescription?: string
  
  // Personality
  tone: 'formal' | 'casual' | 'friendly' | 'professional'
  customGreeting?: string
  customFarewell?: string
  
  // Features enabled
  enableBooking: boolean
  enableCart: boolean
  enableDelivery: boolean
  enableLocation: boolean
  
  // Service area (for location-based)
  serviceAreas?: string[]
  
  // Working hours (for booking)
  workingHours?: WorkingHours
  
  createdAt: Date
  updatedAt: Date
}

interface WorkingHours {
  monday?: { start: string; end: string }
  tuesday?: { start: string; end: string }
  // ... etc
  exceptions?: { date: string; closed: boolean; hours?: { start: string; end: string } }[]
}
```

### Item (Extension to existing Product)

```typescript
interface Item {
  id: string
  userId: string
  
  // Basic info
  name: string
  description?: string
  price: number
  
  // Type detection
  itemType: 'PRODUCT' | 'SERVICE' | 'FOOD' | 'DIGITAL'
  category?: string
  subcategory?: string
  
  // Service-specific
  duration?: number // minutes
  requiresBooking?: boolean
  requiresLocation?: boolean
  qualificationQuestions?: string[]
  
  // Product-specific
  variants?: ItemVariant[]
  stock?: number
  
  // Food-specific
  ingredients?: string[]
  allergens?: string[]
  customizations?: ItemCustomization[]
  
  // Media
  images?: string[]
  
  // Auto-generated
  keywords?: string[]
  searchIndex?: string
  
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'OUT_OF_STOCK'
}

interface ItemVariant {
  name: string // "Talla", "Color"
  options: { value: string; priceModifier?: number }[]
}

interface ItemCustomization {
  name: string // "Sin cebolla", "Extra queso"
  priceModifier?: number
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Business Type Detection Consistency
*For any* set of items with clear characteristics (all products, all services, all food), the BusinessContextDetector should return the corresponding business type with confidence > 0.8
**Validates: Requirements 1.1, 1.2**

### Property 2: Flow Selection Correctness
*For any* detected business type and user intent, the FlowEngine should select a flow that matches the business type (product flows for stores, booking flows for services, order flows for restaurants)
**Validates: Requirements 2.1, 2.2**

### Property 3: Template Contains Required Information
*For any* item and business context, the generated template should contain the item's name, price, and at least one relevant attribute (description, duration, or ingredients)
**Validates: Requirements 7.1, 7.3, 7.4**

### Property 4: Response Uses Tenant Context
*For any* client question about offerings, the response should only reference items that exist in the tenant's database
**Validates: Requirements 2.3, 9.1**

### Property 5: Booking Flow Collects Required Data
*For any* service booking flow completion, the system should have collected: date, time, and at least one contact method (phone or name)
**Validates: Requirements 3.3**

### Property 6: Custom Settings Override Defaults
*For any* tenant with custom greeting configured, the greeting response should match the custom greeting exactly
**Validates: Requirements 6.3**

### Property 7: Business Name Inclusion
*For any* tenant with business name configured, greeting and farewell messages should include the business name
**Validates: Requirements 6.2**

### Property 8: Location Services Request Address
*For any* service marked as requiring location, the booking flow should include an address collection step
**Validates: Requirements 8.1**

### Property 9: Category Auto-Creation
*For any* new item added without category, the system should either assign it to an existing category or create a new appropriate category
**Validates: Requirements 7.2**

### Property 10: Category Consistency
*For any* set of items in the same category, they should share at least one common keyword or characteristic
**Validates: Requirements 1.4, 7.2**

## Error Handling

1. **Unknown Business Type**: Default to generic helpful assistant
2. **Missing Item Data**: Use available data, skip missing fields
3. **AI Detection Failure**: Fall back to keyword-based detection
4. **Flow Interruption**: Save state and allow resumption
5. **Invalid User Input**: Re-prompt with clarification

## Testing Strategy

### Unit Tests
- BusinessContextDetector with various item sets
- FlowEngine flow selection logic
- TemplateGenerator output format

### Property-Based Tests (fast-check)
- Business type detection consistency
- Template content validation
- Flow selection correctness
- Response context validation

### Integration Tests
- Full conversation flows
- Multi-step booking process
- Order completion flow
