import { relations } from 'drizzle-orm'
import { application } from './application'
import { education } from './education'
import { experience } from './experience'
import { job } from './job'
import { project } from './project'
import { resume } from './resume'
import { resumeEducation } from './resume-education'
import { resumeExperience } from './resume-experience'
import { resumeProject } from './resume-project'
import { resumeSkill } from './resume-skill'
import { skill } from './skill'
import { user } from './user'

export const applicationRelations = relations(application, ({ one }) => ({
	job: one(job, {
		fields: [application.jobId],
		references: [job.id],
	}),
	resume: one(resume, {
		fields: [application.resumeId],
		references: [resume.id],
	}),
	user: one(user, {
		fields: [application.userId],
		references: [user.id],
	}),
}))

// Resume Relations
export const resumeRelations = relations(resume, ({ one, many }) => ({
	educations: many(resumeEducation),
	experiences: many(resumeExperience),
	projects: many(resumeProject),
	skills: many(resumeSkill),
	user: one(user, {
		fields: [resume.userId],
		references: [user.id],
	}),
}))

// Experience Relations
export const experienceRelations = relations(experience, ({ one, many }) => ({
	resumes: many(resumeExperience),
	user: one(user, {
		fields: [experience.userId],
		references: [user.id],
	}),
}))

// Education Relations
export const educationRelations = relations(education, ({ one, many }) => ({
	resumes: many(resumeEducation),
	user: one(user, {
		fields: [education.userId],
		references: [user.id],
	}),
}))

// Project Relations
export const projectRelations = relations(project, ({ one, many }) => ({
	resumes: many(resumeProject),
	user: one(user, {
		fields: [project.userId],
		references: [user.id],
	}),
}))

// Skill Relations
export const skillRelations = relations(skill, ({ one, many }) => ({
	resumes: many(resumeSkill),
	user: one(user, {
		fields: [skill.userId],
		references: [user.id],
	}),
}))

// Junction Table Relations
export const resumeExperienceRelations = relations(resumeExperience, ({ one }) => ({
	experience: one(experience, {
		fields: [resumeExperience.experienceId],
		references: [experience.id],
	}),
	resume: one(resume, {
		fields: [resumeExperience.resumeId],
		references: [resume.id],
	}),
}))

export const resumeEducationRelations = relations(resumeEducation, ({ one }) => ({
	education: one(education, {
		fields: [resumeEducation.educationId],
		references: [education.id],
	}),
	resume: one(resume, {
		fields: [resumeEducation.resumeId],
		references: [resume.id],
	}),
}))

export const resumeProjectRelations = relations(resumeProject, ({ one }) => ({
	project: one(project, {
		fields: [resumeProject.projectId],
		references: [project.id],
	}),
	resume: one(resume, {
		fields: [resumeProject.resumeId],
		references: [resume.id],
	}),
}))

export const resumeSkillRelations = relations(resumeSkill, ({ one }) => ({
	resume: one(resume, {
		fields: [resumeSkill.resumeId],
		references: [resume.id],
	}),
	skill: one(skill, {
		fields: [resumeSkill.skillId],
		references: [skill.id],
	}),
}))
