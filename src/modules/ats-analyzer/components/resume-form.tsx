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
		email: '',
		label: '',
		location: {
			city: '',
			countryCode: '',
			region: '',
		},
		name: '',
		phone: '',
		profiles: [],
	},
	education: [],
	languages: [],
	meta: {
		completionScore: 0,
		template: 'default',
	},
	skills: {
		hard: [],
		soft: [],
		tools: [],
	},
	summary: '',
	work: [],
}

export function ResumeForm({ resumeId, userId, initialData, onSave }: ResumeFormProps) {
	const [isSaving, setIsSaving] = useState(false)

	const form = useForm<ResumeContent>({
		defaultValues: {
			...defaultResumeContent,
			...initialData?.content,
		},
		mode: 'onChange',
		resolver: zodResolver(resumeContentSchema),
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
				content: data,
				title: initialData?.title || 'Untitled Resume',
			})
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<Form {...form}>
			<form className="space-y-8" onSubmit={form.handleSubmit(handleSubmit)}>
				{/* Global validation error summary */}
				{hasErrors && (
					<Card className="border-destructive bg-destructive/5">
						<CardContent className="py-4">
							<p className="font-medium text-destructive text-sm">
								Please fix the validation errors below before saving.
							</p>
							<ul className="mt-2 list-inside list-disc text-destructive text-sm">
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
							A brief overview of your professional background and career goals. This is often the
							first thing recruiters read.
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
				<div className="sticky bottom-4 flex justify-end gap-4 rounded-lg border bg-background/80 p-4 backdrop-blur-sm">
					<div className="flex items-center gap-2 text-muted-foreground text-sm">
						{isDirty && <span className="text-amber-500">• Unsaved changes</span>}
						{!isValid && hasErrors && <span className="text-destructive">• Validation errors</span>}
					</div>
					<Button disabled={isSaving || !isDirty} type="submit">
						<IconDeviceFloppy className="mr-2 h-4 w-4" />
						{isSaving ? 'Saving...' : 'Save Resume'}
					</Button>
				</div>
			</form>
		</Form>
	)
}
