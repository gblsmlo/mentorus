'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { createResume, updateResume } from '../actions/resume-actions'
import { createResumeSchema, type ResumeContent } from '../schemas'
import { EducationSection } from './form-sections/education-section'
import { ExperienceSection } from './form-sections/experience-section'
import { PersonalInfoSection } from './form-sections/personal-info-section'
import { ProjectsSection } from './form-sections/projects-section'
import { SkillsSection } from './form-sections/skills-section'

interface ResumeFormProps {
	userId: string
	resumeId?: string
	initialData?: {
		title: string
		content: ResumeContent
	}
	onSave?: (data: { title: string; content: ResumeContent }) => Promise<void>
}

export function ResumeForm({ userId, resumeId, initialData, onSave }: ResumeFormProps) {
	const router = useRouter()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [commitMessage, setCommitMessage] = useState('')

	const form = useForm({
		defaultValues: initialData || {
			content: {
				education: [],
				experience: [],
				personalInfo: {
					email: '',
					github: '',
					linkedin: '',
					location: '',
					name: '',
					phone: '',
					website: '',
				},
				projects: [],
				skills: {
					certifications: [],
					languages: [],
					soft: [],
					technical: [],
				},
				summary: '',
			},
			title: '',
		},
		resolver: zodResolver(createResumeSchema),
	})

	async function onSubmit(data: { title: string; content: ResumeContent }) {
		setIsSubmitting(true)
		try {
			if (onSave) {
				await onSave(data)
				return
			}

			if (resumeId) {
				// Update existing resume (creates new version)
				await updateResume(userId, {
					commitMessage: commitMessage || `Update: ${new Date().toLocaleString()}`,
					content: data.content,
					resumeId,
				})
				toast.success('Resume updated successfully!', {
					description: 'A new version has been created.',
				})
			} else {
				// Create new resume
				const result = await createResume(userId, data)
				toast.success('Resume created successfully!')
				router.push(`/resumes/${result.resumeId}`)
			}
		} catch (error) {
			toast.error('Failed to save resume', {
				description: error instanceof Error ? error.message : 'Unknown error',
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Form {...form}>
			<form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
				{/* Resume Title */}
				<Card>
					<CardHeader>
						<CardTitle>Resume Information</CardTitle>
						<CardDescription>Give your resume a descriptive title</CardDescription>
					</CardHeader>
					<CardContent>
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Resume Title</FormLabel>
									<FormControl>
										<Input placeholder="e.g., Software Engineer Resume" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>
				</Card>

				{/* Main Content Tabs */}
				<Tabs className="w-full" defaultValue="personal">
					<TabsList className="grid w-full grid-cols-5">
						<TabsTrigger value="personal">Personal</TabsTrigger>
						<TabsTrigger value="experience">Experience</TabsTrigger>
						<TabsTrigger value="education">Education</TabsTrigger>
						<TabsTrigger value="skills">Skills</TabsTrigger>
						<TabsTrigger value="projects">Projects</TabsTrigger>
					</TabsList>

					<TabsContent value="personal">
						<PersonalInfoSection control={form.control} />
					</TabsContent>

					<TabsContent value="experience">
						<ExperienceSection control={form.control} />
					</TabsContent>

					<TabsContent value="education">
						<EducationSection control={form.control} />
					</TabsContent>

					<TabsContent value="skills">
						<SkillsSection control={form.control} />
					</TabsContent>

					<TabsContent value="projects">
						<ProjectsSection control={form.control} />
					</TabsContent>
				</Tabs>

				{/* Commit Message (only for updates) */}
				{resumeId && (
					<Card>
						<CardHeader>
							<CardTitle>Version Message (Optional)</CardTitle>
							<CardDescription>
								Describe what changed in this version (like a Git commit message)
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Input
								onChange={(e) => setCommitMessage(e.target.value)}
								placeholder="e.g., Added React skills and recent project"
								value={commitMessage}
							/>
						</CardContent>
					</Card>
				)}

				{/* Submit Button */}
				<div className="flex justify-end gap-4">
					<Button
						disabled={isSubmitting}
						onClick={() => router.back()}
						type="button"
						variant="outline"
					>
						Cancel
					</Button>
					<Button disabled={isSubmitting} type="submit">
						{isSubmitting ? 'Saving...' : resumeId ? 'Save New Version' : 'Create Resume'}
					</Button>
				</div>
			</form>
		</Form>
	)
}
