import { Button } from '@/components/ui/button'
import { MainContent } from '@/components/ui/main-content'
import { PageDescription, PageHeader, PageTitle } from '@/components/ui/page-header'
import { getUserResumes } from '@/modules/ats-analyzer/actions/resume-actions'
import { ResumeList } from '@/modules/ats-analyzer/components/resume-list'
import { getSessionAction } from '@/modules/auth'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
	description: 'Manage your resumes with version control',
	title: 'My Resumes | ATS Analyzer',
}

export default async function ResumesPage() {
	const session = await getSessionAction()

	if (!session?.user) {
		redirect('/auth/sign-in')
	}

	const resumes = await getUserResumes(session.user.id)

	return (
		<MainContent size="2xl">
			<div className="flex items-center justify-between">
				<PageHeader>
					<PageTitle>My Resumes</PageTitle>
					<PageDescription>Create and manage your resumes with version control</PageDescription>
				</PageHeader>
				<Button asChild>
					<Link href="/resumes/new">Create Resume</Link>
				</Button>
			</div>

			<ResumeList resumes={resumes} userId={session.user.id} />
		</MainContent>
	)
}
