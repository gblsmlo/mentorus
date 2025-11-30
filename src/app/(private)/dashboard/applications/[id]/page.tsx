import { authServer } from '@/infra/auth/server'
import { OptimizationCockpit } from '@/modules/ats-analyzer/components/optimization-cockpit'
import { applicationRepository } from '@/modules/ats-analyzer/repositories/application-repository'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function ApplicationCockpitPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const session = await authServer.api.getSession({
		headers: await headers(),
	})

	if (!session?.user) {
		redirect('/auth/sign-in')
	}

	const { id } = await params
	const application = await applicationRepository.findById(id)

	if (!application || application.userId !== session.user.id) {
		redirect('/dashboard/applications')
	}

	return (
		<OptimizationCockpit
			application={application}
			job={application.job}
			resume={application.resume}
			userId={session.user.id}
		/>
	)
}
