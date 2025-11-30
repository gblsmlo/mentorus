import { Button } from '@/components/ui/button'
import { MainContent } from '@/components/ui/main-content'
import { PageDescription, PageHeader, PageTitle } from '@/components/ui/page-header'
import { authServer } from '@/infra/auth/server'
import { getUserResumes } from '@/modules/ats-analyzer/actions/resume-actions'
import { AddApplicationDialog } from '@/modules/ats-analyzer/components/add-application-dialog'
import { ApplicationBoard } from '@/modules/ats-analyzer/components/application-board'
import { applicationRepository } from '@/modules/ats-analyzer/repositories/application-repository'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function ApplicationsPage() {
	const session = await authServer.api.getSession({
		headers: await headers(),
	})

	if (!session?.user) {
		redirect('/auth/sign-in')
	}

	const applications = await applicationRepository.findAllByUserId(session.user.id)
	const resumes = await getUserResumes(session.user.id)

	return (
		<MainContent className="flex h-[calc(100vh-4rem)] flex-col" size="xl">
			<PageHeader>
				<div className="flex w-full items-center justify-between">
					<div>
						<PageTitle>Job Board</PageTitle>
						<PageDescription>Manage and optimize your job applications</PageDescription>
					</div>
					<AddApplicationDialog resumes={resumes} userId={session.user.id} />
				</div>
			</PageHeader>

			<div className="mt-6 flex-1 overflow-hidden">
				<ApplicationBoard applications={applications} />
			</div>
		</MainContent>
	)
}
