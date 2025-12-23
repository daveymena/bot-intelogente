# Requirements Document

## Introduction

Sistema de agente de ventas universal que se adapta automáticamente a CUALQUIER tipo de negocio. El bot debe ser capaz de entender el contexto del negocio a partir de los productos/servicios agregados y generar respuestas, flujos y plantillas dinámicas sin necesidad de configuración manual extensiva.

## Glossary

- **Tenant**: Usuario del SaaS con su propio negocio
- **Business Context**: Contexto del negocio detectado automáticamente por la IA
- **Dynamic Template**: Plantilla de respuesta generada automáticamente según el contexto
- **Conversation Flow**: Flujo de conversación adaptado dinámicamente
- **Item**: Producto, servicio, o cualquier oferta del tenant
- **Smart Detection**: Detección inteligente del tipo de negocio basada en los items agregados

## Requirements

### Requirement 1

**User Story:** As a SaaS tenant, I want the bot to automatically detect my business type from my products/services, so that I don't need to configure everything manually.

#### Acceptance Criteria

1. WHEN a tenant adds their first products/services THEN the system SHALL analyze names, descriptions and prices to detect business type
2. WHEN the system detects the business type THEN the system SHALL automatically configure appropriate conversation flows
3. WHEN the business context is ambiguous THEN the system SHALL ask the tenant to confirm or clarify
4. WHEN new items are added THEN the system SHALL update the business context if necessary

### Requirement 2

**User Story:** As a tenant with ANY type of business, I want the bot to generate appropriate responses for my industry, so that clients receive relevant information.

#### Acceptance Criteria

1. WHEN a client asks about offerings THEN the system SHALL format responses appropriate to the business type (menu for restaurant, catalog for store, services list for consultants)
2. WHEN a client wants to purchase/book THEN the system SHALL use the appropriate flow (cart for products, booking for services, reservation for restaurants)
3. WHEN a client asks questions THEN the system SHALL answer using context from the tenant's items and business type
4. WHEN the business type is unknown THEN the system SHALL use a generic helpful assistant flow

### Requirement 3

**User Story:** As a service-based business (consultant, plumber, lawyer, doctor, etc.), I want the bot to handle appointments and inquiries appropriately, so that clients can book my services.

#### Acceptance Criteria

1. WHEN items are detected as services THEN the system SHALL enable appointment/booking flow
2. WHEN a client inquires about a service THEN the system SHALL provide description, duration, and price
3. WHEN a client wants to book THEN the system SHALL collect date, time, and contact information
4. WHEN a service requires qualification THEN the system SHALL ask relevant questions before quoting

### Requirement 4

**User Story:** As a product-based business (store, e-commerce), I want the bot to handle product inquiries and sales, so that clients can purchase through WhatsApp.

#### Acceptance Criteria

1. WHEN items are detected as products THEN the system SHALL enable shopping/cart flow
2. WHEN a client asks about a product THEN the system SHALL show details, price, and availability
3. WHEN a client wants to buy THEN the system SHALL handle payment methods and delivery options
4. WHEN products have variants THEN the system SHALL ask for size, color, or other options

### Requirement 5

**User Story:** As a food/restaurant business, I want the bot to handle menu and orders, so that customers can order food.

#### Acceptance Criteria

1. WHEN items are detected as food/menu THEN the system SHALL enable restaurant/order flow
2. WHEN a customer asks for menu THEN the system SHALL display categorized items
3. WHEN a customer orders THEN the system SHALL confirm items and ask delivery/pickup
4. WHEN items have customizations THEN the system SHALL ask for preferences

### Requirement 6

**User Story:** As a tenant, I want to customize the bot's personality without technical knowledge, so that it matches my brand.

#### Acceptance Criteria

1. WHEN configuring the bot THEN the system SHALL provide simple personality options (formal, casual, friendly, professional)
2. WHEN the tenant sets business name THEN the system SHALL use it in greetings and responses
3. WHEN the tenant adds custom responses THEN the system SHALL prioritize them over generated ones
4. WHEN no customization is set THEN the system SHALL use intelligent defaults based on business type

### Requirement 7

**User Story:** As a tenant, I want the bot to automatically create response templates when I add items, so that I don't need to write responses manually.

#### Acceptance Criteria

1. WHEN an item is added THEN the system SHALL generate a product/service card template
2. WHEN a category is created THEN the system SHALL generate category listing template
3. WHEN items have images THEN the system SHALL include them in templates
4. WHEN items have special attributes THEN the system SHALL highlight them in templates

### Requirement 8

**User Story:** As a tenant with location-based services (delivery, home services), I want the bot to handle location and scheduling, so that I can serve clients efficiently.

#### Acceptance Criteria

1. WHEN a service requires location THEN the system SHALL ask for address/zone
2. WHEN scheduling is needed THEN the system SHALL show available times
3. WHEN urgency is indicated THEN the system SHALL flag as priority
4. WHEN service area is limited THEN the system SHALL validate location before proceeding

### Requirement 9

**User Story:** As a tenant, I want the bot to handle any question about my business intelligently, so that clients always get helpful responses.

#### Acceptance Criteria

1. WHEN a client asks any question THEN the system SHALL search items, descriptions, and business context for answers
2. WHEN no specific answer exists THEN the system SHALL use AI to generate helpful response based on context
3. WHEN the question is outside business scope THEN the system SHALL politely redirect to available offerings
4. WHEN the client needs human help THEN the system SHALL offer to connect with the tenant
