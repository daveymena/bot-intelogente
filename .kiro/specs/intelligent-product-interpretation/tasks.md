# Implementation Plan: Intelligent Product Interpretation

## Overview

This implementation plan transforms OpenClaw's product search from tag-based keyword matching to semantic understanding with conversational clarification. The implementation follows a bottom-up approach: build core services first, then integrate with the orchestrator, and finally add enhancements.

## Tasks

- [-] 1. Create semantic interpreter service
  - [x] 1.1 Implement intent analysis with AI
    - Create `src/lib/bot/semantic-interpreter.ts`
    - Implement `analyzeIntent()` method using Groq
    - Extract interpretations with confidence scores
    - Calculate ambiguity scores
    - _Requirements: 1.1, 1.2, 1.3, 6.1, 6.2_
  
  - [ ]* 1.2 Write property test for intent analysis completeness
    - **Property 1: Intent Analysis Completeness**
    - **Validates: Requirements 1.1, 1.2**
  
  - [ ] 1.3 Implement intent refinement
    - Create `refineIntent()` method
    - Update confidence scores based on clarification
    - Merge conversation context
    - _Requirements: 1.5, 2.4_
  
  - [ ]* 1.4 Write property test for context refinement
    - **Property 8: Context Refinement**
    - **Validates: Requirements 1.5, 2.4**
  
  - [ ] 1.5 Add conversation context integration
    - Integrate with existing `ConversationContextService`
    - Consider previous messages in analysis
    - _Requirements: 9, 7.1_
  
  - [ ]* 1.6 Write unit tests for edge cases
    - Test empty messages
    - Test very long messages
    - Test special characters
    - Test Spanish-specific patterns
    - _Requirements: 1.1, 1.2_

- [-] 2. Create clarification engine
  - [x] 2.1 Implement question generation
    - Create `src/lib/bot/clarification-engine.ts`
    - Implement `generateQuestions()` method
    - Create question templates for different ambiguity types
    - _Requirements: 2.1, 2.2_
  
  - [ ]* 2.2 Write property test for clarification relevance
    - **Property 3: Clarification Question Relevance**
    - **Validates: Requirements 2.1, 2.2**
  
  - [ ] 2.3 Implement question limit enforcement
    - Ensure max 2 questions per conversation
    - Track clarification history
    - _Requirements: 2.3_
  
  - [ ]* 2.4 Write property test for clarification limit
    - **Property 4: Clarification Limit**
    - **Validates: Requirements 2.3**
  
  - [ ] 2.5 Implement response parsing
    - Create `parseUserResponse()` method
    - Handle flexible answer formats
    - Extract selected options
    - _Requirements: 2.4, 2.5_
  
  - [ ]* 2.6 Write unit tests for question formatting
    - Test Spanish formatting
    - Test multiple choice options
    - Test question types (use_case, budget, specifications)
    - _Requirements: 2.1, 2.2_

- [-] 3. Create product matcher service
  - [x] 3.1 Implement semantic product matching
    - Create `src/lib/bot/product-matcher.ts`
    - Implement `matchProducts()` method
    - Calculate relevance scores
    - _Requirements: 3.1, 3.2_
  
  - [ ]* 3.2 Write property test for semantic ranking
    - **Property 6: Semantic Similarity Ranking**
    - **Validates: Requirements 3.1, 3.2**
  
  - [ ] 3.3 Implement use case filtering
    - Create `filterByUseCase()` method
    - Exclude products that don't match use case
    - _Requirements: 3.4_
  
  - [ ]* 3.4 Write property test for use case filtering
    - **Property 7: Use Case Filtering**
    - **Validates: Requirements 3.4**
  
  - [ ] 3.5 Implement tag-independent search
    - Ensure tags are NOT used as primary filter
    - Use semantic similarity instead
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ]* 3.6 Write property test for tag independence
    - **Property 5: Tag Independence**
    - **Validates: Requirements 5.1, 5.2**
  
  - [ ]* 3.7 Write unit tests for product matching
    - Test with various product types
    - Test budget filtering
    - Test specification matching
    - _Requirements: 3.1, 3.2, 3.5_

- [ ] 4. Create semantic search service
  - [ ] 4.1 Implement AI-based semantic similarity
    - Create `src/lib/bot/semantic-search.ts`
    - Implement `calculateSemanticSimilarity()` using Groq
    - Create prompt for similarity rating
    - _Requirements: 3.1, 5.2_
  
  - [ ] 4.2 Implement batch similarity calculation
    - Process multiple products in parallel
    - Add timeout handling
    - _Requirements: 8.1, 8.3_
  
  - [ ] 4.3 Add caching for similarity scores
    - Cache based on intent + product hash
    - Set 5-minute TTL
    - _Requirements: 8.4_
  
  - [ ]* 4.4 Write property test for response time
    - **Property 11: Response Time Bounds**
    - **Validates: Requirements 8.1, 8.2**
  
  - [ ]* 4.5 Write unit tests for similarity calculation
    - Test with various intents
    - Test with Spanish text
    - Test edge cases (empty descriptions)
    - _Requirements: 3.1, 5.2_

- [ ] 5. Checkpoint - Core services complete
  - Ensure all tests pass, ask the user if questions arise.

- [-] 6. Integrate with orchestrator
  - [x] 6.1 Add semantic interpretation to message processing
    - Modify `src/lib/bot/openclaw-orchestrator.ts`
    - Call `SemanticInterpreterService.analyzeIntent()` before tool selection
    - Store analysis in conversation context
    - _Requirements: 7.1, 7.2_
  
  - [ ] 6.2 Implement clarification flow
    - Detect when clarification is needed
    - Generate and send clarification questions
    - Handle clarification responses
    - Update intent based on responses
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.1, 4.2_
  
  - [ ] 6.3 Replace fuzzy search with semantic matching
    - Use `ProductMatcherService` instead of Fuse.js
    - Maintain fallback to fuzzy search on errors
    - _Requirements: 5.1, 5.2, 5.3, 7.4_
  
  - [ ] 6.4 Add multi-category support
    - Identify all relevant categories
    - Group results by category
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [ ]* 6.5 Write property test for multi-category recognition
    - **Property 12: Multi-Category Recognition**
    - **Validates: Requirements 9.1, 9.2**
  
  - [ ]* 6.6 Write integration tests for orchestrator
    - Test ambiguous query flow
    - Test clarification conversation
    - Test direct product match
    - Test fallback behavior
    - _Requirements: 7.1, 7.2, 7.4_

- [ ] 7. Implement error handling and fallbacks
  - [ ] 7.1 Add AI service failure handling
    - Implement retry logic with exponential backoff
    - Add Ollama fallback
    - Add fuzzy search fallback
    - _Requirements: 7.4, 8.5_
  
  - [ ]* 7.2 Write property test for fallback behavior
    - **Property 10: Fallback Behavior**
    - **Validates: Requirements 7.4**
  
  - [ ] 7.3 Handle no-match scenarios
    - Detect when no products match
    - Suggest similar categories
    - Provide helpful response
    - _Requirements: 3.3_
  
  - [ ] 7.4 Handle clarification edge cases
    - Detect ignored clarification questions
    - Handle invalid responses
    - Prevent clarification loops
    - _Requirements: 2.5_
  
  - [ ]* 7.5 Write unit tests for error scenarios
    - Test AI timeout
    - Test empty product list
    - Test invalid clarification response
    - _Requirements: 7.4, 8.5_

- [ ] 8. Add logging and monitoring
  - [ ] 8.1 Implement interpretation logging
    - Log all intent analyses
    - Log confidence scores
    - Log ambiguity decisions
    - _Requirements: 10.1_
  
  - [ ]* 8.2 Write property test for interpretation logging
    - **Property 13: Interpretation Logging**
    - **Validates: Requirements 10.1**
  
  - [ ] 8.3 Implement outcome logging
    - Log product selections
    - Log which interpretation led to selection
    - Log failed interpretations
    - _Requirements: 10.2, 10.3_
  
  - [ ]* 8.4 Write property test for product selection logging
    - **Property 14: Product Selection Logging**
    - **Validates: Requirements 10.2**
  
  - [ ] 8.5 Add performance monitoring
    - Track response times per component
    - Track fallback usage
    - Track clarification effectiveness
    - _Requirements: 8.1, 8.2, 8.3, 10.4_
  
  - [ ]* 8.6 Write unit tests for logging format
    - Test log structure
    - Test PII exclusion
    - Test timestamp accuracy
    - _Requirements: 10.5_

- [ ] 9. Checkpoint - Integration complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Optimize performance
  - [ ] 10.1 Add parallel processing
    - Process intent analysis and product loading in parallel
    - Calculate similarities in parallel
    - _Requirements: 8.1, 8.2_
  
  - [ ] 10.2 Implement caching strategy
    - Cache intent analyses (5 min TTL)
    - Cache similarity scores
    - _Requirements: 8.4_
  
  - [ ] 10.3 Add lazy loading
    - Only analyze intent when needed
    - Only load full product details after matching
    - _Requirements: 8.1, 8.3_
  
  - [ ]* 10.4 Write performance tests
    - Test with large product catalogs
    - Test concurrent requests
    - Verify response time requirements
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 11. Update conversation strategy integration
  - [ ] 11.1 Enhance ConversationStrategyService
    - Modify `src/lib/bot/conversation-strategy.ts`
    - Use semantic interpretation results
    - Maintain existing AIDA flow
    - _Requirements: 7.3, 4.3_
  
  - [ ] 11.2 Add semantic product type detection
    - Replace keyword-based detection with semantic analysis
    - Use intent analysis results
    - _Requirements: 4.1, 4.2_
  
  - [ ]* 11.3 Write integration tests for strategy
    - Test strategy with semantic interpretation
    - Test AIDA flow preservation
    - Test product type detection
    - _Requirements: 7.3, 4.1_

- [ ] 12. Final checkpoint and testing
  - [ ] 12.1 Run full test suite
    - Run all unit tests
    - Run all property tests
    - Run all integration tests
    - _Requirements: All_
  
  - [ ] 12.2 Manual testing with real scenarios
    - Test "teclado" ambiguity case
    - Test "Mega Pack 11" specific case
    - Test "cursos" general case
    - Test "algo para trabajar" vague case
    - Test rejection and alternatives flow
    - _Requirements: All_
  
  - [ ] 12.3 Performance validation
    - Verify response times meet requirements
    - Check memory usage
    - Test under load
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ] 12.4 Documentation update
    - Update README with new features
    - Document configuration options
    - Add troubleshooting guide
    - _Requirements: All_

- [ ] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based and unit tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties with minimum 100 iterations
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end flows
- The implementation maintains backward compatibility with existing orchestrator functionality
