# Implementation Plan

- [x] 1. Set up ResumeContent type definitions and validation
  - [x] 1.1 Create the ResumeContent TypeScript interface
    - Create `src/modules/ats-analyzer/types/resume-content.ts` with the complete interface matching the design spec
    - Include `basics`, `work`, `education`, `skills` (with hard/soft/tools), `languages`, and `meta` sections
    - _Requirements: 8.1, 8.2_

  - [x] 1.2 Create the Zod validation schema for ResumeContent
    - Create `src/modules/ats-analyzer/schemas/resume-content.schema.ts`
    - Implement all sub-schemas: `basicsSchema`, `workSchema`, `educationSchema`, `skillsSchema`, `languageSchema`, `metaSchema`
    - Export the complete `resumeContentSchema` and inferred type
    - _Requirements: 8.1, 8.2, 8.4_

  - [x] 1.3 Write property test for ResumeContent round-trip serialization
    - **Property 8: ResumeContent Round-Trip Serialization**
    - **Validates: Requirements 8.3**
    - Create `src/modules/ats-analyzer/__tests__/properties/serialization.property.test.ts`
    - Create arbitrary generator for valid ResumeContent in `src/modules/ats-analyzer/__tests__/arbitraries/resume-content.arbitrary.ts`

  - [x] 1.4 Write property test for validation error descriptiveness
    - **Property 9: Validation Error Descriptiveness**
    - **Validates: Requirements 8.4**
    - Create `src/modules/ats-analyzer/__tests__/properties/validation.property.test.ts`
    - Create arbitrary generator for invalid ResumeContent

- [x] 2. Implement ATS score calculation with weighted algorithm
  - [x] 2.1 Create the score calculator module
    - Create `src/modules/ats-analyzer/utils/score-calculator.ts`
    - Implement weighted scoring: hard skills (60%), soft skills (30%), keyword density (10%)
    - Return score between 0-100
    - _Requirements: 2.4_

  - [x] 2.2 Write property test for score calculation weighting
    - **Property 1: Score Calculation Weighting**
    - **Validates: Requirements 2.4**
    - Create `src/modules/ats-analyzer/__tests__/properties/score-calculation.property.test.ts`
    - Create job description arbitrary generator

  - [x] 2.3 Update keyword extractor to categorize by skill type
    - Update `src/modules/ats-analyzer/utils/keyword-extractor.ts`
    - Add categorization for hard skills, soft skills, and tools
    - Ensure extracted keywords include category metadata
    - _Requirements: 3.1, 3.2_

  - [x] 2.4 Write property test for keyword matching and categorization
    - **Property 2: Keyword Matching and Categorization**
    - **Validates: Requirements 3.1, 3.2**
    - Create `src/modules/ats-analyzer/__tests__/properties/keyword-matching.property.test.ts`

  - [x] 2.5 Implement gap analysis with priority sorting
    - Update `src/modules/ats-analyzer/utils/resume-matcher.ts`
    - Identify missing keywords (in job but not in resume)
    - Sort by importance: hard skills first, then soft skills, then general
    - _Requirements: 4.1, 4.2_

  - [x] 2.6 Write property test for gap analysis with priority sorting
    - **Property 3: Gap Analysis with Priority Sorting**
    - **Validates: Requirements 4.1, 4.2**
    - Create `src/modules/ats-analyzer/__tests__/properties/gap-analysis.property.test.ts`

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement auto-save and versioning logic
  - [x] 4.1 Create the auto-save hook with debounce and retry
    - Create `src/modules/ats-analyzer/hooks/use-auto-save.ts`
    - Implement 2-second debounce after last keystroke
    - Implement retry logic: 3 attempts with exponential backoff (1s, 2s, 4s)
    - Return status: 'idle' | 'saving' | 'saved' | 'error'
    - _Requirements: 6.1, 6.3_

  - [x] 4.2 Write property test for auto-save retry with exponential backoff
    - **Property 5: Auto-Save Retry with Exponential Backoff**
    - **Validates: Requirements 6.1, 6.3**
    - Create `src/modules/ats-analyzer/__tests__/properties/auto-save.property.test.ts`

  - [x] 4.3 Create the save version server action
    - Create `src/modules/ats-analyzer/actions/save-version-action.ts`
    - Validate content against Zod schema
    - Increment version number (max existing + 1)
    - Store complete ResumeContent snapshot with optional commit message
    - _Requirements: 7.1, 7.2_

  - [x] 4.4 Write property test for version number monotonic increment
    - **Property 6: Version Number Monotonic Increment**
    - **Validates: Requirements 7.2**
    - Create `src/modules/ats-analyzer/__tests__/properties/versioning.property.test.ts`

  - [x] 4.5 Create the restore version server action
    - Create `src/modules/ats-analyzer/actions/restore-version-action.ts`
    - Load content from specified version
    - Create new version with restored content
    - _Requirements: 7.4_

  - [x] 4.6 Write property test for version restoration equivalence
    - **Property 7: Version Restoration Equivalence**
    - **Validates: Requirements 7.4**
    - Add test to `src/modules/ats-analyzer/__tests__/properties/versioning.property.test.ts`

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Build the Resume Form with field arrays
  - [x] 6.1 Create the BasicsSection form component
    - Create `src/modules/ats-analyzer/components/form-sections/basics-section.tsx`
    - Include fields: name, email, phone, label, location (city, region, countryCode), profiles array
    - Use react-hook-form with Zod resolver
    - _Requirements: 5.1_

  - [x] 6.2 Create the WorkExperienceSection with useFieldArray
    - Create `src/modules/ats-analyzer/components/form-sections/work-experience-section.tsx`
    - Implement add, remove, and reorder (drag-and-drop) functionality
    - Fields: company, position, startDate, endDate, isCurrent, summary
    - _Requirements: 5.1, 5.2_

  - [x] 6.3 Write property test for work experience array operations
    - **Property 4: Work Experience Array Invariants**
    - **Validates: Requirements 5.2**
    - Create `src/modules/ats-analyzer/__tests__/properties/array-operations.property.test.ts`

  - [x] 6.4 Create the EducationSection with useFieldArray
    - Create `src/modules/ats-analyzer/components/form-sections/education-section-v2.tsx`
    - Fields: institution, area, studyType, startDate, endDate
    - _Requirements: 5.1_

  - [x] 6.5 Create the SkillsSection with separated inputs
    - Create `src/modules/ats-analyzer/components/form-sections/skills-section-v2.tsx`
    - Three distinct inputs: hard skills (with level), soft skills, tools
    - _Requirements: 5.1, 5.3_

  - [x] 6.6 Create the LanguagesSection with useFieldArray
    - Create `src/modules/ats-analyzer/components/form-sections/languages-section.tsx`
    - Fields: language, fluency
    - _Requirements: 5.1_

  - [x] 6.7 Compose the complete ResumeForm component
    - Update `src/modules/ats-analyzer/components/resume-form.tsx`
    - Integrate all sections with the new ResumeContent schema
    - Add inline validation error display
    - _Requirements: 5.4, 5.5_

- [x] 7. Build the Optimization Cockpit UI
  - [x] 7.1 Create the FloatingScoreBadge component
    - Create `src/modules/ats-analyzer/components/floating-score-badge.tsx`
    - Display score with color coding (green >= 70, yellow >= 40, red < 40)
    - Position fixed, visible in both panels
    - _Requirements: 2.2_

  - [x] 7.2 Create the KeywordAnalysisBar component
    - Create `src/modules/ats-analyzer/components/keyword-analysis-bar.tsx`
    - Display matched keywords grouped by category
    - Display missing keywords sorted by importance
    - Clickable keywords for navigation
    - _Requirements: 3.2, 3.3, 4.1, 4.3_

  - [x] 7.3 Create the debounced analysis hook
    - Create `src/modules/ats-analyzer/hooks/use-debounced-analysis.ts`
    - Implement 500ms debounce after content changes
    - Trigger analysis and update score/keywords
    - _Requirements: 2.1_

  - [x] 7.4 Update the OptimizationCockpit component
    - Update `src/modules/ats-analyzer/components/optimization-cockpit.tsx`
    - Integrate FloatingScoreBadge, KeywordAnalysisBar
    - Wire up auto-save hook and debounced analysis hook
    - Add unsaved changes confirmation on navigation
    - _Requirements: 1.1, 1.2, 1.4, 6.2, 6.4_

  - [x] 7.5 Create the VersionHistoryDrawer component
    - Create `src/modules/ats-analyzer/components/version-history-drawer.tsx`
    - Display version list with number, timestamp, commit message, ATS score
    - Allow selecting and restoring previous versions
    - _Requirements: 7.3, 7.4_

- [x] 8. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

