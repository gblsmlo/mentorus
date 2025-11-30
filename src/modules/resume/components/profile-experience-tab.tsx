'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { IconBriefcase, IconCalendar } from '@tabler/icons-react'
import type { ResumeContent } from '../schemas'

interface ProfileExperienceTabProps {
	resumeId: string
	userId: string
	content: ResumeContent
	isOwner: boolean
}

export function ProfileExperienceTab({
	resumeId,
	userId,
	content,
	isOwner,
}: ProfileExperienceTabProps) {
	const experiences = content.experience || []

	if (experiences.length === 0) {
		return (
			<Card>
				<CardContent className="flex min-h-[200px] items-center justify-center">
					<p className="text-muted-foreground text-sm">
						{isOwner ? 'Add your work experience to get started' : 'No experience added yet'}
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="space-y-6">
			{experiences.map((exp, index) => (
				<Card key={index}>
					<CardHeader>
						<div className="flex items-start justify-between">
							<div className="flex gap-3">
								<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
									<IconBriefcase className="h-6 w-6 text-muted-foreground" />
								</div>
								<div className="flex-1">
									<h3 className="font-semibold text-lg">{exp.title}</h3>
									<p className="text-muted-foreground">{exp.company}</p>
									<div className="mt-1 flex items-center gap-2 text-muted-foreground text-sm">
										<IconCalendar className="h-4 w-4" />
										<span>
											{exp.startDate} - {exp.current ? 'Present' : exp.endDate || 'Present'}
										</span>
									</div>
								</div>
							</div>
						</div>
					</CardHeader>

					{(exp.description || (exp.bullets && exp.bullets.length > 0)) && (
						<CardContent className="space-y-4">
							{exp.description && (
								<>
									<p className="text-sm leading-relaxed">{exp.description}</p>
									{exp.bullets && exp.bullets.length > 0 && <Separator />}
								</>
							)}

							{exp.bullets && exp.bullets.length > 0 && (
								<ul className="space-y-2">
									{exp.bullets.map((bullet, bulletIndex) => (
										<li className="flex gap-2 text-sm" key={bulletIndex}>
											<span className="text-muted-foreground">•</span>
											<span className="flex-1">{bullet}</span>
										</li>
									))}
								</ul>
							)}
						</CardContent>
					)}
				</Card>
			))}
		</div>
	)
}
