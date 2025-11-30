'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { IconBook, IconCalendar } from '@tabler/icons-react'
import type { ResumeContent } from '../schemas'

interface ProfileEducationTabProps {
	resumeId: string
	userId: string
	content: ResumeContent
	isOwner: boolean
}

export function ProfileEducationTab({
	resumeId,
	userId,
	content,
	isOwner,
}: ProfileEducationTabProps) {
	const education = content.education || []

	if (education.length === 0) {
		return (
			<Card>
				<CardContent className="flex min-h-[200px] items-center justify-center">
					<p className="text-muted-foreground text-sm">
						{isOwner ? 'Add your education to get started' : 'No education added yet'}
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="space-y-6">
			{education.map((edu, index) => (
				<Card key={index}>
					<CardHeader>
						<div className="flex items-start justify-between">
							<div className="flex gap-3">
								<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
									<IconBook className="h-6 w-6 text-muted-foreground" />
								</div>
								<div className="flex-1">
									<h3 className="font-semibold text-lg">{edu.degree}</h3>
									<p className="text-muted-foreground">{edu.school}</p>
									{edu.field && <p className="text-muted-foreground text-sm">{edu.field}</p>}
									<div className="mt-1 flex items-center gap-4 text-muted-foreground text-sm">
										{edu.graduationDate && (
											<div className="flex items-center gap-1">
												<IconCalendar className="h-4 w-4" />
												<span>{edu.graduationDate}</span>
											</div>
										)}
										{edu.gpa && <span>GPA: {edu.gpa}</span>}
									</div>
								</div>
							</div>
						</div>
					</CardHeader>
				</Card>
			))}
		</div>
	)
}
