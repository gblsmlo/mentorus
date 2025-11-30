'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getResumeHistoryAction } from '../actions/get-resume-actions'
import { restoreVersionAction } from '../actions/restore-version-action'

interface Version {
	id: string
	versionNumber: number
	commitMessage: string | null
	createdAt: Date
}

interface VersionHistoryProps {
	userId: string
	resumeId: string
}

export function VersionHistory({ userId, resumeId }: VersionHistoryProps) {
	const [versions, setVersions] = useState<Version[]>([])
	const [loading, setLoading] = useState(true)
	const [restoring, setRestoring] = useState<string | null>(null)

	const loadVersions = useCallback(async () => {
		try {
			const data = await getResumeHistoryAction(userId, resumeId)
			setVersions(data as Version[])
		} catch {
			toast.error('Failed to load version history')
		} finally {
			setLoading(false)
		}
	}, [userId, resumeId])

	useEffect(() => {
		loadVersions()
	}, [loadVersions])

	async function handleRestore(versionId: string, versionNumber: number) {
		const confirmMsg = `Restore to version ${versionNumber}? This will create a new version with the content from v${versionNumber}.`
		if (!confirm(confirmMsg)) return

		setRestoring(versionId)
		try {
			const commitMessage = prompt('Enter a commit message for this restoration:')
			if (!commitMessage) {
				setRestoring(null)
				return
			}

			await restoreVersionAction(userId, {
				commitMessage,
				resumeId,
				sourceVersionId: versionId,
			})

			toast.success('Version restored successfully!')
			loadVersions() // Reload to show new version
		} catch {
			toast.error('Failed to restore version')
		} finally {
			setRestoring(null)
		}
	}

	if (loading) {
		return (
			<Card>
				<CardContent className="py-12 text-center">Loading version history...</CardContent>
			</Card>
		)
	}

	if (versions.length === 0) {
		return (
			<Card>
				<CardContent className="py-12 text-center text-muted-foreground">
					No versions found
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="space-y-4">
			<div className="text-muted-foreground text-sm">
				{versions.length} version{versions.length !== 1 ? 's' : ''} · Latest is version{' '}
				{versions[0]?.versionNumber}
			</div>

			{versions.map((version, index) => (
				<Card key={version.id}>
					<CardHeader>
						<div className="flex items-start justify-between">
							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<CardTitle className="text-base">Version {version.versionNumber}</CardTitle>
									{index === 0 && <Badge>Current</Badge>}
								</div>
								<CardDescription>{format(new Date(version.createdAt), 'PPpp')}</CardDescription>
							</div>
							{index !== 0 && (
								<Button
									disabled={restoring === version.id}
									onClick={() => handleRestore(version.id, version.versionNumber)}
									size="sm"
									variant="outline"
								>
									{restoring === version.id ? 'Restoring...' : 'Restore'}
								</Button>
							)}
						</div>
					</CardHeader>
					{version.commitMessage && (
						<CardContent>
							<div className="text-sm">
								<span className="font-medium">Message:</span> {version.commitMessage}
							</div>
						</CardContent>
					)}
				</Card>
			))}
		</div>
	)
}
