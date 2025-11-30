import { MainContent } from '@/components/ui/main-content'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getSessionAction } from '@/modules/auth'
import type { ResumeContent } from '@/modules/resume'
import {
	getResumeAction,
	ProfileAboutTab,
	ProfileEducationTab,
	ProfileExperienceTab,
	ProfileHeader,
	ProfileProjectsTab,
	ProfileSkillsTab,
} from '@/modules/resume'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
	title: 'Resume Profile | Mentorus',
}

export default async function ResumePage({ params }: { params: Promise<{ id: string }> }) {
	const session = await getSessionAction()

	if (!session?.user) {
		redirect('/auth/sign-in')
	}

	const { id } = await params
	const resume = await getResumeAction(session.user.id, id)

	if (!resume) {
		redirect('/dashboard/resumes')
	}

	const content = (resume.currentVersion?.content || {}) as ResumeContent
	const isOwner = session.user.id === resume.userId

	return (
		<MainContent size="xl">
			<ProfileHeader
				content={content}
				isOwner={isOwner}
				resumeId={resume.id}
				userId={session.user.id}
			/>

			<Tabs className="w-full" defaultValue="about">
				<TabsList className="grid w-full grid-cols-5">
					<TabsTrigger value="about">About</TabsTrigger>
					<TabsTrigger value="experience">Experience</TabsTrigger>
					<TabsTrigger value="education">Education</TabsTrigger>
					<TabsTrigger value="projects">Projects</TabsTrigger>
					<TabsTrigger value="skills">Skills</TabsTrigger>
				</TabsList>

				<TabsContent className="mt-6" value="about">
					<ProfileAboutTab
						content={content}
						isOwner={isOwner}
						resumeId={resume.id}
						userId={session.user.id}
					/>
				</TabsContent>

				<TabsContent className="mt-6" value="experience">
					<ProfileExperienceTab
						content={content}
						isOwner={isOwner}
						resumeId={resume.id}
						userId={session.user.id}
					/>
				</TabsContent>

				<TabsContent className="mt-6" value="education">
					<ProfileEducationTab
						content={content}
						isOwner={isOwner}
						resumeId={resume.id}
						userId={session.user.id}
					/>
				</TabsContent>

				<TabsContent className="mt-6" value="projects">
					<ProfileProjectsTab
						content={content}
						isOwner={isOwner}
						resumeId={resume.id}
						userId={session.user.id}
					/>
				</TabsContent>

				<TabsContent className="mt-6" value="skills">
					<ProfileSkillsTab
						content={content}
						isOwner={isOwner}
						resumeId={resume.id}
						userId={session.user.id}
					/>
				</TabsContent>
			</Tabs>
		</MainContent>
	)
}
