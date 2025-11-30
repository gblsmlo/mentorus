import { MainContent } from '@/components/ui/main-content'
import { PageDescription, PageHeader, PageTitle } from '@/components/ui/page-header'
import { getProfile } from '@/modules/user-profile/actions/profile-actions'
import { ProfileForm } from '@/modules/user-profile/components/profile-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	description: 'Manage your personal information and contact details',
	title: 'Account',
}

export default async function Page() {
	const profile = await getProfile()
	const title = String(metadata.title)
	const description = String(metadata.description)

	return (
		<MainContent size="sm">
			<PageHeader>
				<PageTitle>{title}</PageTitle>
				<PageDescription>{description}</PageDescription>
			</PageHeader>

			<ProfileForm initialData={profile.personalInfo} />
		</MainContent>
	)
}
