'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { isFailure } from '@/shared/errors/result'
import { useTransition } from 'react'
import { updateResumeFieldAction } from '../actions/update-resume-field-action'
import type { ResumeContent } from '../schemas'
import { EditableField } from './editable-field'

interface ProfileAboutTabProps {
	resumeId: string
	userId: string
	content: ResumeContent
	isOwner: boolean
}

export function ProfileAboutTab({ resumeId, userId, content, isOwner }: ProfileAboutTabProps) {
	const [isPending, startTransition] = useTransition()

	const handleSaveField = async (field: keyof ResumeContent, value: any) => {
		startTransition(async () => {
			const result = await updateResumeFieldAction({
				field,
				resumeId,
				userId,
				value,
			})

			if (isFailure(result)) {
				throw new Error(result.message)
			}
		})
	}

	return (
		<div className="space-y-6">
			{/* Summary/Bio */}
			<Card>
				<CardHeader>
					<CardTitle>About</CardTitle>
					<CardDescription>Professional summary and background</CardDescription>
				</CardHeader>
				<CardContent>
					<EditableField
						canEdit={isOwner}
						className="min-h-[120px]"
						displayClassName="whitespace-pre-wrap text-sm leading-relaxed"
						emptyText="Add a professional summary to highlight your experience and goals..."
						onSave={(value) => handleSaveField('summary', value)}
						placeholder="Write your professional summary..."
						type="textarea"
						value={content.summary || ''}
					/>
				</CardContent>
			</Card>

			{/* Competencies */}
			{(content.competencies && content.competencies.length > 0) || isOwner ? (
				<Card>
					<CardHeader>
						<CardTitle>Core Competencies</CardTitle>
						<CardDescription>Key skills and areas of expertise</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-2">
							{content.competencies?.map((competency, index) => (
								<Badge key={index} variant="secondary">
									{competency}
								</Badge>
							))}
							{(!content.competencies || content.competencies.length === 0) && isOwner && (
								<p className="text-muted-foreground text-sm italic">
									Add competencies in the edit form
								</p>
							)}
						</div>
					</CardContent>
				</Card>
			) : null}

			{/* Location */}
			{content.basics?.location && (
				<Card>
					<CardHeader>
						<CardTitle>Location</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm">
							{content.basics.location.city}
							{content.basics.location.region && `, ${content.basics.location.region}`}
							{content.basics.location.countryCode && ` • ${content.basics.location.countryCode}`}
						</p>
					</CardContent>
				</Card>
			)}

			{/* Social Profiles */}
			{content.basics?.profiles && content.basics.profiles.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Social Profiles</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{content.basics.profiles.map((profile, index) => (
								<div className="flex items-center gap-2" key={index}>
									<span className="font-medium text-sm">{profile.network}:</span>
									<a
										className="text-primary text-sm hover:underline"
										href={profile.url}
										rel="noopener noreferrer"
										target="_blank"
									>
										{profile.url}
									</a>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
