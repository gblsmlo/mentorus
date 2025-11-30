import { MainContent } from '@/components/ui/main-content'
import { PageDescription, PageHeader, PageTitle } from '@/components/ui/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getSessionAction } from '@/modules/auth'
import type { ResumeContent } from '@/modules/resume'
import { getResumeAction, UpdateResumeForm } from '@/modules/resume'
import { VersionHistory } from '@/modules/resume/components/version-history'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
	title: 'Edit Resume | ATS Analyzer',
}

export default async function EditResumePage({ params }: { params: Promise<{ id: string }> }) {
	const session = await getSessionAction()

	if (!session?.user) {
		redirect('/auth/sign-in')
	}

	const { id } = await params
	const resume = await getResumeAction(session.user.id, id)

	if (!resume) {
		redirect('/dashboard/resumes')
	}

	return (
		<MainContent size="xl">
			<PageHeader>
				<PageTitle>{resume.headline}</PageTitle>
				<PageDescription>Edit your resume or view version history</PageDescription>
			</PageHeader>

			<Tabs className="w-full" defaultValue="edit">
				<TabsList>
					<TabsTrigger value="edit">Edit</TabsTrigger>
					<TabsTrigger value="history">Version History</TabsTrigger>
				</TabsList>

				<TabsContent className="mt-6" value="edit">
					<UpdateResumeForm
						initialData={{
							content: (resume.currentVersion?.content || {}) as ResumeContent,
							title: resume.headline,
						}}
						resumeId={resume.id}
						userId={session.user.id}
					/>
				</TabsContent>

				<TabsContent className="mt-6" value="history">
					<VersionHistory resumeId={resume.id} userId={session.user.id} />
				</TabsContent>
			</Tabs>
		</MainContent>
	)
}
