'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ResumeContent } from '../schemas'

interface ProfileSkillsTabProps {
	resumeId: string
	userId: string
	content: ResumeContent
	isOwner: boolean
}

export function ProfileSkillsTab({ resumeId, userId, content, isOwner }: ProfileSkillsTabProps) {
	const skills = content.skills

	// Check if skills object exists and has any data
	const hasSkills =
		skills &&
		((Array.isArray(skills.technical) && skills.technical.length > 0) ||
			(Array.isArray(skills.soft) && skills.soft.length > 0) ||
			(Array.isArray((skills as any).hard) && (skills as any).hard.length > 0) ||
			(Array.isArray((skills as any).tools) && (skills as any).tools.length > 0))

	if (!hasSkills) {
		return (
			<Card>
				<CardContent className="flex min-h-[200px] items-center justify-center">
					<p className="text-muted-foreground text-sm">
						{isOwner ? 'Add your skills to highlight your expertise' : 'No skills added yet'}
					</p>
				</CardContent>
			</Card>
		)
	}

	// Support both legacy (technical/soft) and new (hard/soft/tools) structures
	const technicalSkills = Array.isArray(skills.technical)
		? skills.technical
		: Array.isArray((skills as any).hard)
			? (skills as any).hard.map((s: any) => (typeof s === 'string' ? s : s.name))
			: []

	const softSkills = Array.isArray(skills.soft) ? skills.soft : []
	const toolsSkills = Array.isArray((skills as any).tools) ? (skills as any).tools : []

	return (
		<div className="space-y-6">
			{/* Technical/Hard Skills */}
			{technicalSkills.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Technical Skills</CardTitle>
						<CardDescription>Programming languages, frameworks, and technologies</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-2">
							{technicalSkills.map((skill: string, index: number) => (
								<Badge key={index} variant="default">
									{skill}
								</Badge>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Tools */}
			{toolsSkills.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Tools & Platforms</CardTitle>
						<CardDescription>Software, tools, and platforms you work with</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-2">
							{toolsSkills.map((tool: string, index: number) => (
								<Badge key={index} variant="secondary">
									{tool}
								</Badge>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Soft Skills */}
			{softSkills.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Soft Skills</CardTitle>
						<CardDescription>Interpersonal and professional competencies</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-2">
							{softSkills.map((skill, index) => (
								<Badge key={index} variant="outline">
									{skill}
								</Badge>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
