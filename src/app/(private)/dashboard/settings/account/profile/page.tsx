import { MainContent } from '@/components/ui/main-content'
import { PageDescription, PageHeader, PageTitle } from '@/components/ui/page-header'
import { getUserProfile } from '@/modules/ats-analyzer/actions/profile-actions'
import { ProfileForm } from '@/modules/ats-analyzer/components/profile-form'
import { getSessionAction } from '@/modules/auth'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
	description: 'Manage your master profile data',
	title: 'Master Profile | ATS Analyzer',
}

export default async function Page() {
	const session = await getSessionAction()

	if (!session?.user) {
		redirect('/auth/sign-in')
	}

	const profile = await getUserProfile(session.user.id)

	return (
		<MainContent size="xl">
			<PageHeader>
				<PageTitle>Master Profile</PageTitle>
				<PageDescription>
					Update your default information. New resumes will automatically use this data.
				</PageDescription>
			</PageHeader>

			<ProfileForm initialData={profile} userId={session.user.id} />
		</MainContent>
	)
}
