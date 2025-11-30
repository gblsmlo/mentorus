'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IconExternalLink, IconFolder } from '@tabler/icons-react'
import type { ResumeContent } from '../schemas'

interface ProfileProjectsTabProps {
	resumeId: string
	userId: string
	content: ResumeContent
	isOwner: boolean
}

export function ProfileProjectsTab({
	resumeId,
	userId,
	content,
	isOwner,
}: ProfileProjectsTabProps) {
	const projects = content.projects || []

	if (projects.length === 0) {
		return (
			<Card>
				<CardContent className="flex min-h-[200px] items-center justify-center">
					<p className="text-muted-foreground text-sm">
						{isOwner ? 'Add your projects to showcase your work' : 'No projects added yet'}
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="grid gap-6 md:grid-cols-2">
			{projects.map((project, index) => (
				<Card key={index}>
					<CardHeader>
						<div className="flex items-start gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
								<IconFolder className="h-5 w-5 text-muted-foreground" />
							</div>
							<div className="flex-1">
								<CardTitle className="text-lg">{project.name}</CardTitle>
								{project.url && (
									<a
										className="mt-1 flex items-center gap-1 text-primary text-sm hover:underline"
										href={project.url}
										rel="noopener noreferrer"
										target="_blank"
									>
										View Project
										<IconExternalLink className="h-3 w-3" />
									</a>
								)}
							</div>
						</div>
					</CardHeader>

					<CardContent className="space-y-3">
						{project.description && (
							<CardDescription className="text-sm leading-relaxed">
								{project.description}
							</CardDescription>
						)}

						{project.technologies && project.technologies.length > 0 && (
							<div className="flex flex-wrap gap-1">
								{project.technologies.map((tech, techIndex) => (
									<Badge key={techIndex} variant="outline">
										{tech}
									</Badge>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			))}
		</div>
	)
}
