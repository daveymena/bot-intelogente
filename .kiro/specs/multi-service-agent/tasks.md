# Implementation Plan

## Phase 1: Database Schema & Core Models

- [ ] 1. Extend database schema for multi-service support
  - [ ] 1.1 Add BusinessSettings model to Prisma schema
    - Fields: detectedType, businessName, tone, customGreeting, enableBooking, enableCart, workingHours
    - Relation to User model
    - _Requirements: 1.1, 6.1, 6.2_
  - [ ] 1.2 Add Category model to Prisma schema
    - Fields: name, slug, parentId, itemType, flowType, keywords, order
    - Self-relation for subcategories
    - _Requirements: 7.2_
  - [ ] 1.3 Extend Product model with service/food fields
    - Add: itemType, duration, requiresBooking, requiresLocation, qualificationQuestions, variants, customizations
    - _Requirements: 3.1, 4.4, 5.4_
  - [ ] 1.4 Run database migration
    - _Requirements: 1.1_

## Phase 2: Business Context Detection

- [ ] 2. Implement BusinessContextDetector service
  - [ ] 2.1 Create business-context-detector.ts service
    - Implement detectFromItems() using keyword analysis
    - Implement updateContext() for incremental updates
    - _Requirements: 1.1, 1.4_
  - [ ] 2.2 Write property test for business type detection
    - **Property 1: Business Type Detection Consistency**
    - **Validates: Requirements 1.1, 1.2**
  - [ ] 2.3 Implement AI-assisted detection for ambiguous cases
    - Use Groq to analyze item descriptions
    - Return confidence score
    - _Requirements: 1.3_
  - [ ] 2.4 Create keyword extraction utility
    - Extract keywords from item names and descriptions
    - Build searchable index
    - _Requirements: 9.1_

- [ ] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: Category Auto-Generation

- [ ] 4. Implement CategoryAutoGenerator service
  - [ ] 4.1 Create category-auto-generator.ts service
    - Implement detectCategory() for new items
    - Implement generateCategories() for bulk analysis
    - _Requirements: 7.2_
  - [ ] 4.2 Write property test for category auto-creation
    - **Property 9: Category Auto-Creation**
    - **Validates: Requirements 7.2**
  - [ ] 4.3 Implement AI-assisted category naming
    - Generate appropriate category names in Spanish
    - Suggest icons based on category type
    - _Requirements: 7.2_
  - [ ] 4.4 Implement subcategory suggestion
    - Analyze items within category for grouping
    - _Requirements: 7.2_
  - [ ] 4.5 Write property test for category consistency
    - **Property 10: Category Consistency**
    - **Validates: Requirements 1.4, 7.2**

## Phase 4: Flow Engine

- [ ] 5. Implement FlowEngine service
  - [ ] 5.1 Create flow-engine.ts service
    - Define FlowType enum and FlowStep interface
    - Implement detectFlow() based on message and context
    - _Requirements: 2.1, 2.2_
  - [ ] 5.2 Write property test for flow selection
    - **Property 2: Flow Selection Correctness**
    - **Validates: Requirements 2.1, 2.2**
  - [ ] 5.3 Implement product purchase flow
    - Steps: show product → confirm → collect payment → confirm order
    - _Requirements: 4.1, 4.2, 4.3_
  - [ ] 5.4 Implement service booking flow
    - Steps: show service → collect date/time → collect contact → confirm
    - _Requirements: 3.1, 3.2, 3.3_
  - [ ] 5.5 Write property test for booking data collection
    - **Property 5: Booking Flow Collects Required Data**
    - **Validates: Requirements 3.3**
  - [ ] 5.6 Implement restaurant order flow
    - Steps: show menu → take order → customizations → delivery/pickup → confirm
    - _Requirements: 5.1, 5.2, 5.3_
  - [ ] 5.7 Implement location-based service flow
    - Steps: show service → collect location → check area → schedule → confirm
    - _Requirements: 8.1, 8.2, 8.4_
  - [ ] 5.8 Write property test for location services
    - **Property 8: Location Services Request Address**
    - **Validates: Requirements 8.1**

- [ ] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 5: Template Generator

- [ ] 7. Implement TemplateGenerator service
  - [ ] 7.1 Create template-generator.ts service
    - Implement generateItemCard() with business context awareness
    - Implement generateCategoryList() for listings
    - _Requirements: 7.1, 7.3_
  - [ ] 7.2 Write property test for template content
    - **Property 3: Template Contains Required Information**
    - **Validates: Requirements 7.1, 7.3, 7.4**
  - [ ] 7.3 Implement tone-aware templates
    - Formal, casual, friendly, professional variations
    - _Requirements: 6.1_
  - [ ] 7.4 Implement greeting/farewell generators
    - Use business name and custom messages
    - _Requirements: 6.2_
  - [ ] 7.5 Write property test for business name inclusion
    - **Property 7: Business Name Inclusion**
    - **Validates: Requirements 6.2**
  - [ ] 7.6 Write property test for custom settings override
    - **Property 6: Custom Settings Override Defaults**
    - **Validates: Requirements 6.3**

## Phase 6: Unified Response Service

- [ ] 8. Implement UnifiedResponseService
  - [ ] 8.1 Create unified-response-service.ts
    - Orchestrate BusinessContextDetector, FlowEngine, TemplateGenerator
    - Implement processMessage() main entry point
    - _Requirements: 2.1, 2.2, 2.3_
  - [ ] 8.2 Write property test for response context
    - **Property 4: Response Uses Tenant Context**
    - **Validates: Requirements 2.3, 9.1**
  - [ ] 8.3 Implement conversation state management
    - Track flow progress, collected data, current item
    - _Requirements: 3.3, 5.3_
  - [ ] 8.4 Implement AI fallback for unknown queries
    - Use Groq with full business context
    - _Requirements: 9.2_
  - [ ] 8.5 Implement escalation detection
    - Detect when human help is needed
    - _Requirements: 9.4_

- [ ] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 7: Integration with Existing System

- [ ] 10. Integrate with SalesAgentSimple
  - [ ] 10.1 Refactor SalesAgentSimple to use UnifiedResponseService
    - Replace hardcoded flows with FlowEngine
    - Use TemplateGenerator for responses
    - _Requirements: 2.1, 2.2_
  - [ ] 10.2 Update product loading to include new fields
    - Load itemType, category, service-specific fields
    - _Requirements: 3.1, 4.1, 5.1_
  - [ ] 10.3 Implement auto-categorization on product creation
    - Hook into product creation API
    - Auto-detect category and business context
    - _Requirements: 1.1, 7.2_

## Phase 8: Dashboard UI

- [ ] 11. Add business settings UI
  - [ ] 11.1 Create BusinessSettings component
    - Business name, type override, tone selector
    - Custom greeting/farewell inputs
    - _Requirements: 6.1, 6.2, 6.3_
  - [ ] 11.2 Create category management UI
    - View auto-generated categories
    - Edit/merge/delete categories
    - _Requirements: 7.2_
  - [ ] 11.3 Add service-specific fields to product form
    - Duration, booking required, location required
    - Qualification questions editor
    - _Requirements: 3.1, 3.4, 8.1_

- [ ] 12. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
