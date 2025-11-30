'use client'

import { ApplicationCard } from './application-card'

interface ApplicationBoardProps {
	applications: Array<{
		id: string
		status: string
		matchScore?: number | null
		updatedAt: Date
		job: {
			title: string | null
			company: string | null
		}
		resume: {
			title: string
		}
	}>
}

const columns = [
	{ id: 'draft', label: 'To Do' },
	{ id: 'optimizing', label: 'Optimizing' },
	{ id: 'applied', label: 'Applied' },
	{ id: 'interviewing', label: 'Interviewing' },
]

export function ApplicationBoard({ applications }: ApplicationBoardProps) {
	const getApplicationsByStatus = (status: string) => {
		return applications.filter((app) => app.status === status)
	}

	return (
		<div className="flex h-full gap-6 overflow-x-auto pb-4">
			{columns.map((column) => (
				<div className="flex w-80 flex-shrink-0 flex-col gap-4" key={column.id}>
					<div className="flex items-center justify-between">
						<h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider">
							{column.label}
						</h3>
						<span className="rounded-full bg-muted px-2 py-0.5 font-medium text-muted-foreground text-xs">
							{getApplicationsByStatus(column.id).length}
						</span>
					</div>

					<div className="flex flex-col gap-3">
						{getApplicationsByStatus(column.id).map((app) => (
							<ApplicationCard application={app} key={app.id} />
						))}
						{getApplicationsByStatus(column.id).length === 0 && (
							<div className="flex h-24 items-center justify-center rounded-lg border-2 border-muted border-dashed text-muted-foreground text-xs">
								No applications
							</div>
						)}
					</div>
				</div>
			))}
		</div>
	)
}
