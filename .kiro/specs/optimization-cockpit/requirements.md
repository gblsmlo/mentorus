# Requirements Document

## Introduction

The Optimization Cockpit is the core feature of the ATS Analyzer SaaS. It provides a split-screen workflow where users can view a job description on the left panel while editing their resume on the right panel, with real-time ATS compatibility scoring. This feature enables users to optimize their resumes for specific job applications by highlighting keyword matches, identifying gaps, and providing actionable suggestions.

## Glossary

- **Optimization_Cockpit**: The split-view interface that displays job description and resume editor side-by-side with real-time analysis feedback
- **ATS_Score**: A numerical score (0-100) indicating how well a resume matches a job description based on keyword analysis
- **Hard_Skills**: Technical skills with high weight in the matching algorithm (programming languages, frameworks, tools)
- **Soft_Skills**: Interpersonal and behavioral skills with medium weight in the matching algorithm
- **Keyword_Match**: A skill or term from the job description that appears in the resume
- **Keyword_Gap**: A skill or term from the job description that is missing from the resume
- **ResumeContent**: The structured JSON data format storing all resume information (basics, work, education, skills, etc.)
- **Application**: An entity linking a specific job posting with a resume version and tracking application status

## Requirements

### Requirement 1

**User Story:** As a job seeker, I want to view a job description alongside my resume editor, so that I can optimize my resume content while referencing the job requirements.

#### Acceptance Criteria

1. WHEN a user opens an application in the Optimization Cockpit THEN the Optimization_Cockpit SHALL display the job description in a read-only left panel
2. WHEN a user opens an application in the Optimization Cockpit THEN the Optimization_Cockpit SHALL display the resume editor in an editable right panel
3. WHEN the viewport width is below 768 pixels THEN the Optimization_Cockpit SHALL stack panels vertically with job description above resume editor
4. WHEN a user resizes the panel divider THEN the Optimization_Cockpit SHALL persist the panel width ratio for that user session

### Requirement 2

**User Story:** As a job seeker, I want to see a real-time ATS compatibility score, so that I can understand how well my resume matches the job requirements.

#### Acceptance Criteria

1. WHEN the resume content changes THEN the Optimization_Cockpit SHALL recalculate the ATS_Score within 500 milliseconds after the user stops typing
2. WHEN the ATS_Score is calculated THEN the Optimization_Cockpit SHALL display the score as a floating badge visible in both panels
3. WHEN the ATS_Score changes THEN the Optimization_Cockpit SHALL animate the score transition to indicate improvement or decline
4. WHEN calculating the ATS_Score THEN the Optimization_Cockpit SHALL weight Hard_Skills at 60%, Soft_Skills at 30%, and keyword density at 10%

### Requirement 3

**User Story:** As a job seeker, I want to see which keywords from the job description appear in my resume, so that I can verify my resume addresses the job requirements.

#### Acceptance Criteria

1. WHEN keywords are extracted from the job description THEN the Optimization_Cockpit SHALL highlight matching keywords in the resume editor with a success indicator
2. WHEN keywords are extracted from the job description THEN the Optimization_Cockpit SHALL display a list of matched keywords grouped by category (Hard_Skills, Soft_Skills, other)
3. WHEN a user clicks on a matched keyword in the list THEN the Optimization_Cockpit SHALL scroll to and highlight the first occurrence in the resume editor

### Requirement 4

**User Story:** As a job seeker, I want to see which important keywords are missing from my resume, so that I can add relevant skills and experience.

#### Acceptance Criteria

1. WHEN keywords are extracted from the job description THEN the Optimization_Cockpit SHALL display a list of missing keywords (Keyword_Gap) that appear in the job but not in the resume
2. WHEN displaying missing keywords THEN the Optimization_Cockpit SHALL sort them by importance (Hard_Skills first, then Soft_Skills)
3. WHEN a user clicks on a missing keyword THEN the Optimization_Cockpit SHALL highlight the relevant section in the job description where the keyword appears

### Requirement 5

**User Story:** As a job seeker, I want to edit my resume using a structured form, so that I can maintain consistent formatting while optimizing content.

#### Acceptance Criteria

1. WHEN editing the resume THEN the Optimization_Cockpit SHALL provide form sections for: basics, summary, work experience, education, hard skills, soft skills, tools, and languages
2. WHEN editing work experience THEN the Optimization_Cockpit SHALL allow adding, removing, and reordering entries using drag-and-drop
3. WHEN editing skills THEN the Optimization_Cockpit SHALL separate inputs for Hard_Skills, Soft_Skills, and tools as distinct arrays
4. WHEN form data is modified THEN the Optimization_Cockpit SHALL validate against the ResumeContent schema before triggering analysis
5. WHEN validation fails THEN the Optimization_Cockpit SHALL display inline error messages without blocking other form sections

### Requirement 6

**User Story:** As a job seeker, I want my resume changes to be auto-saved, so that I do not lose my optimization work.

#### Acceptance Criteria

1. WHEN the resume content changes THEN the Optimization_Cockpit SHALL auto-save the draft to the server within 2 seconds of the last keystroke
2. WHEN auto-save completes successfully THEN the Optimization_Cockpit SHALL display a subtle "Saved" indicator
3. IF auto-save fails due to network error THEN the Optimization_Cockpit SHALL retry up to 3 times with exponential backoff and display an error notification after final failure
4. WHEN the user navigates away with unsaved changes THEN the Optimization_Cockpit SHALL prompt for confirmation before leaving

### Requirement 7

**User Story:** As a job seeker, I want to create a new resume version when I'm satisfied with my optimizations, so that I can track my changes and revert if needed.

#### Acceptance Criteria

1. WHEN a user clicks "Save Version" THEN the Optimization_Cockpit SHALL prompt for an optional commit message
2. WHEN a new version is saved THEN the Optimization_Cockpit SHALL increment the version number and store the complete ResumeContent snapshot
3. WHEN viewing version history THEN the Optimization_Cockpit SHALL display version number, timestamp, commit message, and ATS_Score at time of save
4. WHEN a user selects a previous version THEN the Optimization_Cockpit SHALL allow restoring that version as the current draft

### Requirement 8

**User Story:** As a job seeker, I want the resume data to be validated consistently, so that I can trust the data integrity across the application.

#### Acceptance Criteria

1. WHEN ResumeContent is saved THEN the Optimization_Cockpit SHALL validate the data against the Zod schema before persisting
2. WHEN ResumeContent is loaded THEN the Optimization_Cockpit SHALL parse and validate the JSON data from the database
3. WHEN serializing ResumeContent to JSON THEN the Optimization_Cockpit SHALL produce valid JSON that can be deserialized back to an equivalent ResumeContent object
4. WHEN invalid data is detected THEN the Optimization_Cockpit SHALL reject the operation and return a descriptive error message

