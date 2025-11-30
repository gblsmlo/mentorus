'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconDeviceFloppy } from '@tabler/icons-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { resumeContentSchema } from '../schemas/resume-content.schema'
import type { ResumeContent } from '../types/resume-content'
import { BasicsSection } from './form-sections/basics-section'
import { EducationSectionV2 } from './form-sections/education-section-v2'
import { LanguagesSection } from './form-sections/languages-section'
import { SkillsSectionV2 } from './form-sections/skills-section-v2'
import { WorkExperienceSection } from './form-sections/work-experience-section'

interface ResumeFormProps {
	resumeId: string
	userId: string
	initialData?: {
		title?: string
		content?: Partial<ResumeContent>
	}
	onSave?: (data: { title: string; content: ResumeContent }) => Promise<void>
}

const defaultResumeContent: ResumeContent = {
	basics: {
		name: '',
		email: '',
		phone: '',
		label: '',
		location: {
			city: '',
			region: '',
			countryCode: '',
		},
		profiles: [],
	},
	summary: '',
	work: [],
	education: [],
	skills: {
		hard: [],
		soft: [],
		tools: [],
	},
	languages: [],
	meta: {
		template: 'default',
		completionScore: 0,
	},
}

export function ResumeForm({ resumeId, userId, initialData, onSave }: ResumeFormProps) {
	const [isSaving, setIsSaving] = useState(false)

	const form = useForm<ResumeContent>({
		resolver: zodResolver(resumeContentSchema),
		defaultValues: {
			...defaultResumeContent,
			...initialData?.content,
		},
		mode: 'onChange',
	})

	const {
		formState: { errors, isDirty, isValid },
	} = form

	// Calculate if there are any validation errors to display
	const hasErrors = Object.keys(errors).length > 0

	const handleSubmit = async (data: ResumeContent) => {
		if (!onSave) return

		setIsSaving(true)
		try {
			await onSave({
				title: initialData?.title || 'Untitled Resume',
				content: data,
			})
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
				{/* Global validation error summary */}
				{hasErrors && (
					<Card className="border-destructive bg-destructive/5">
						<CardContent className="py-4">
							<p className="text-destructive text-sm font-medium">
								Please fix the validation errors below before saving.
							</p>
							<ul className="mt-2 text-destructive text-sm list-disc list-inside">
								{Object.entries(errors).map(([key, error]) => {
									if (typeof error === 'object' && 'message' in error) {
										return (
											<li key={key}>
												{key}: {error.message as string}
											</li>
										)
									}
									return null
								})}
							</ul>
						</CardContent>
					</Card>
				)}

				{/* Basic Information */}
				<BasicsSection control={form.control} />

				{/* Professional Summary */}
				<Card>
					<CardHeader>
						<CardTitle>Professional Summary</CardTitle>
						<CardDescription>
							A brief overview of your professional background and career goals.
							This is often the first thing recruiters read.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<FormField
							control={form.control}
							name="summary"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Textarea
											className="min-h-[120px]"
											placeholder="Experienced software engineer with 5+ years of expertise in building scalable web applications. Passionate about clean code, user experience, and continuous learning..."
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>
				</Card>

				{/* Work Experience */}
				<WorkExperienceSection control={form.control} />

				{/* Education */}
				<EducationSectionV2 control={form.control} />

				{/* Skills */}
				<SkillsSectionV2 control={form.control} />

				{/* Languages */}
				<LanguagesSection control={form.control} />

				{/* Save Button */}
				<div className="flex justify-end gap-4 sticky bottom-4 bg-background/80 backdrop-blur-sm p-4 rounded-lg border">
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						{isDirty && <span className="text-amber-500">• Unsaved changes</span>}
						{!isValid && hasErrors && (
							<span className="text-destructive">• Validation errors</span>
						)}
					</div>
					<Button type="submit" disabled={isSaving || !isDirty}>
						<IconDeviceFloppy className="mr-2 h-4 w-4" />
						{isSaving ? 'Saving...' : 'Save Resume'}
					</Button>
				</div>
			</form>
		</Form>
	)
}
