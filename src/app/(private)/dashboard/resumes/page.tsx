import { Button } from '@/components/ui/button'
import { MainContent } from '@/components/ui/main-content'
import {
	PageDescription,
	PageHeader,
	PageHeaderLeft,
	PageHeaderRight,
	PageHeaderWithCTA,
	PageTitle,
} from '@/components/ui/page-header'
import { getSessionAction } from '@/modules/auth'
import { getUserResumesAction, ResumeList } from '@/modules/resume'
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

	const resumes = await getUserResumesAction(session.user.id)

	return (
		<MainContent size="2xl">
			<PageHeaderWithCTA>
				<PageHeaderLeft>
					<PageHeader>
						<PageTitle>My Resumes</PageTitle>
						<PageDescription>Create and manage your resumes with version control</PageDescription>
					</PageHeader>
				</PageHeaderLeft>
				<PageHeaderRight>
					<Button asChild>
						<Link href="/dashboard/resumes/new">New Resume</Link>
					</Button>
				</PageHeaderRight>
			</PageHeaderWithCTA>

			<ResumeList resumes={resumes} userId={session.user.id} />
		</MainContent>
	)
}
