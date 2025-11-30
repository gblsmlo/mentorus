'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ArrowRight, Building2, Calendar, FileText } from 'lucide-react'
import Link from 'next/link'

interface ApplicationCardProps {
	application: {
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
	}
}

const statusColors: Record<string, string> = {
	applied: 'bg-green-100 text-green-700',
	draft: 'bg-slate-100 text-slate-700',
	interviewing: 'bg-purple-100 text-purple-700',
	offer: 'bg-yellow-100 text-yellow-700',
	optimizing: 'bg-blue-100 text-blue-700',
	rejected: 'bg-red-100 text-red-700',
}

export function ApplicationCard({ application }: ApplicationCardProps) {
	return (
		<Card className="group transition-all hover:shadow-md">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between gap-2">
					<CardTitle className="line-clamp-1 font-semibold text-base">
						{application.job.title || 'Untitled Job'}
					</CardTitle>
					<Badge className={cn('capitalize', statusColors[application.status])} variant="secondary">
						{application.status}
					</Badge>
				</div>
				<div className="flex items-center gap-2 text-muted-foreground text-sm">
					<Building2 className="h-3 w-3" />
					<span className="line-clamp-1">{application.job.company || 'Unknown Company'}</span>
				</div>
			</CardHeader>
			<CardContent className="pb-3">
				<div className="space-y-3">
					<div className="flex items-center justify-between text-muted-foreground text-xs">
						<div className="flex items-center gap-1">
							<FileText className="h-3 w-3" />
							<span className="max-w-[120px] truncate">{application.resume.title}</span>
						</div>
						<div className="flex items-center gap-1">
							<Calendar className="h-3 w-3" />
							<span>
								{formatDistanceToNow(new Date(application.updatedAt), { addSuffix: true })}
							</span>
						</div>
					</div>

					{application.matchScore !== null && application.matchScore !== undefined && (
						<div className="space-y-1">
							<div className="flex justify-between text-xs">
								<span>Match Score</span>
								<span
									className={cn(
										'font-medium',
										application.matchScore >= 70
											? 'text-green-600'
											: application.matchScore >= 40
												? 'text-yellow-600'
												: 'text-red-600',
									)}
								>
									{application.matchScore}%
								</span>
							</div>
							<Progress className="h-1.5" value={application.matchScore} />
						</div>
					)}
				</div>
			</CardContent>
			<CardFooter className="pt-0">
				<Button asChild className="w-full" size="sm" variant="outline">
					<Link href={`/dashboard/applications/${application.id}`}>
						Open Cockpit <ArrowRight className="ml-2 h-3 w-3" />
					</Link>
				</Button>
			</CardFooter>
		</Card>
	)
}
