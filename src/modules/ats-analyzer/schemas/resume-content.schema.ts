/**
 * ResumeContent Zod Validation Schema
 *
 * Provides validation for the ResumeContent data structure used in the
 * Optimization Cockpit. This schema ensures data integrity across the application.
 *
 * Requirements: 8.1, 8.2, 8.4
 */

import { z } from 'zod';

// Location sub-schema
export const locationSchema = z.object({
  city: z.string().min(1, 'City is required'),
  region: z.string().optional(),
  countryCode: z.string().length(2, 'Country code must be 2 characters'),
});

// Profile sub-schema (LinkedIn, GitHub, etc.)
export const profileSchema = z.object({
  network: z.string().min(1, 'Network name is required'),
  url: z.string().url('Must be a valid URL'),
});

// Basics sub-schema
export const basicsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Must be a valid email'),
  phone: z.string().optional(),
  label: z.string().optional(),
  location: locationSchema,
  profiles: z.array(profileSchema).default([]),
});

// Work experience sub-schema
export const workSchema = z.object({
  id: z.string().uuid(),
  company: z.string().min(1, 'Company is required'),
  position: z.string().min(1, 'Position is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  summary: z.string().min(1, 'Description is required'),
});

// Education sub-schema
export const educationSchema = z.object({
  id: z.string().uuid(),
  institution: z.string().min(1, 'Institution is required'),
  area: z.string().min(1, 'Field of study is required'),
  studyType: z.string().min(1, 'Degree type is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
});


// Hard skill sub-schema
export const hardSkillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  level: z.string().optional(),
});

// Skills sub-schema (hard, soft, tools)
export const skillsSchema = z.object({
  hard: z.array(hardSkillSchema).default([]),
  soft: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
});

// Language sub-schema
export const languageSchema = z.object({
  language: z.string().min(1, 'Language is required'),
  fluency: z.string().min(1, 'Fluency level is required'),
});

// Meta sub-schema
export const metaSchema = z.object({
  template: z.string().default('default'),
  completionScore: z.number().min(0).max(100).default(0),
});

// Complete ResumeContent schema
export const resumeContentSchema = z.object({
  basics: basicsSchema,
  summary: z.string().min(1, 'Summary is required'),
  work: z.array(workSchema).default([]),
  education: z.array(educationSchema).default([]),
  skills: skillsSchema,
  languages: z.array(languageSchema).default([]),
  meta: metaSchema,
});

// Inferred type from schema
export type ResumeContentSchema = z.infer<typeof resumeContentSchema>;

// Re-export individual schema types for convenience
export type LocationSchema = z.infer<typeof locationSchema>;
export type ProfileSchema = z.infer<typeof profileSchema>;
export type BasicsSchema = z.infer<typeof basicsSchema>;
export type WorkSchema = z.infer<typeof workSchema>;
export type EducationSchema = z.infer<typeof educationSchema>;
export type HardSkillSchema = z.infer<typeof hardSkillSchema>;
export type SkillsSchema = z.infer<typeof skillsSchema>;
export type LanguageSchema = z.infer<typeof languageSchema>;
export type MetaSchema = z.infer<typeof metaSchema>;
