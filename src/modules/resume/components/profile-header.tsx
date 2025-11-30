'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { isFailure } from '@/shared/errors/result'
import { IconBriefcase, IconMail, IconPhone, IconShare } from '@tabler/icons-react'
import { updateResumeFieldAction } from '../actions/update-resume-field-action'
import type { ResumeContent } from '../schemas'
import { EditableField } from './editable-field'

interface ProfileHeaderProps {
	resumeId: string
	userId: string
	content: ResumeContent
	isOwner: boolean
}

export function ProfileHeader({ resumeId, userId, content, isOwner }: ProfileHeaderProps) {
	const handleSaveField = async (
		field: keyof ResumeContent,
		value: string | Record<string, unknown>,
	) => {
		const result = await updateResumeFieldAction({
			field,
			resumeId,
			userId,
			value,
		})

		if (isFailure(result)) {
			throw new Error(result.message)
		}
	}

	// Get initials for avatar
	const name = content.basics?.name || 'User'
	const initials = name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2)

	return (
		<div className="space-y-6">
			{/* Header Section */}
			<div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
				{/* Avatar and Info */}
				<div className="flex gap-4">
					<Avatar className="h-20 w-20">
						<AvatarFallback className="text-lg">{initials}</AvatarFallback>
					</Avatar>

					<div className="flex-1 space-y-2">
						<div>
							<EditableField
								canEdit={isOwner}
								className="font-bold text-2xl"
								displayClassName="font-bold text-2xl"
								emptyText="Add your name"
								onSave={(value) => handleSaveField('basics', { ...content.basics, name: value })}
								placeholder="Your name"
								value={content.basics?.name || ''}
							/>
						</div>

						<div className="flex items-center gap-2 text-muted-foreground">
							<IconBriefcase className="h-4 w-4" />
							<EditableField
								canEdit={isOwner}
								displayClassName="text-base"
								emptyText="Add your headline"
								onSave={(value) => handleSaveField('headline', value)}
								placeholder="e.g., Senior Software Engineer"
								value={content.headline}
							/>
						</div>

						{/* Contact Info */}
						{(content.basics?.email || content.basics?.phone) && (
							<div className="flex flex-wrap gap-4 text-muted-foreground text-sm">
								{content.basics?.email && (
									<div className="flex items-center gap-1">
										<IconMail className="h-4 w-4" />
										<span>{content.basics.email}</span>
									</div>
								)}
								{content.basics?.phone && (
									<div className="flex items-center gap-1">
										<IconPhone className="h-4 w-4" />
										<span>{content.basics.phone}</span>
									</div>
								)}
							</div>
						)}
					</div>
				</div>

				{/* Actions */}
				<div className="flex gap-2">
					<Button size="sm" variant="outline">
						<IconShare className="mr-2 h-4 w-4" />
						Share
					</Button>
				</div>
			</div>

			<Separator />
		</div>
	)
}
