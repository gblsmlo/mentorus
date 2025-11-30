import { MainContent } from '@/components/ui/main-content'
import { PageDescription, PageHeader, PageTitle } from '@/components/ui/page-header'
import { ResumeForm } from '@/modules/ats-analyzer/components/resume-form'
import { getSessionAction } from '@/modules/auth'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
	description: 'Create a new resume with version control',
	title: 'Create Resume | ATS Analyzer',
}

export default async function NewResumePage() {
	const session = await getSessionAction()

	if (!session?.user) {
		redirect('/auth/sign-in')
	}

	return (
		<MainContent size="xl">
			<PageHeader>
				<PageTitle>Create New Resume</PageTitle>
				<PageDescription>Fill in your information to create a resume.</PageDescription>
			</PageHeader>

			<ResumeForm userId={session.user.id} />
		</MainContent>
	)
}
