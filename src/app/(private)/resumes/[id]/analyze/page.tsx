import { MainContent } from '@/components/ui/main-content'
import { PageDescription, PageHeader, PageTitle } from '@/components/ui/page-header'
import { getResume } from '@/modules/ats-analyzer/actions/resume-actions'
import { AnalysisDashboard } from '@/modules/ats-analyzer/components/analysis-dashboard'
import { getSessionAction } from '@/modules/auth'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
	title: 'Analyze Resume | ATS Analyzer',
}

export default async function AnalyzePage({ params }: { params: Promise<{ id: string }> }) {
	const session = await getSessionAction()

	if (!session?.user) {
		redirect('/auth/sign-in')
	}

	const { id } = await params
	const resume = await getResume(session.user.id, id)

	return (
		<MainContent size="xl">
			<PageHeader>
				<PageTitle>Analyze: {resume.title}</PageTitle>
				<PageDescription>
					Compare your resume against job descriptions to optimize your match score
				</PageDescription>
			</PageHeader>

			<AnalysisDashboard
				currentVersionId={resume.currentVersionId || undefined}
				resumeId={resume.id}
				userId={session.user.id}
			/>
		</MainContent>
	)
}
