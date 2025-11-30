'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Clock, History, RotateCcw } from 'lucide-react'
import { useState } from 'react'

export interface VersionInfo {
	id: string
	versionNumber: number
	createdAt: Date
	commitMessage?: string | null
	atsScore?: number | null
}

interface VersionHistoryDrawerProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	versions: VersionInfo[]
	currentVersionId?: string
	onRestore: (versionId: string) => void
	isRestoring?: boolean
}

/**
 * Get score color based on ATS score threshold
 */
function getScoreColor(score: number): string {
	if (score >= 70) return 'text-green-600 dark:text-green-400'
	if (score >= 40) return 'text-yellow-600 dark:text-yellow-400'
	return 'text-red-600 dark:text-red-400'
}

/**
 * VersionHistoryDrawer - Side panel for viewing and restoring resume versions
 *
 * Requirements: 7.3, 7.4
 * - Display version number, timestamp, commit message, and ATS score at time of save
 * - Allow selecting and restoring previous versions
 */
export function VersionHistoryDrawer({
	open,
	onOpenChange,
	versions,
	currentVersionId,
	onRestore,
	isRestoring = false,
}: VersionHistoryDrawerProps) {
	const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)

	const handleRestore = (versionId: string) => {
		setSelectedVersionId(versionId)
		onRestore(versionId)
	}

	// Sort versions by version number descending (newest first)
	const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber)

	return (
		<Sheet onOpenChange={onOpenChange} open={open}>
			<SheetContent className="w-[400px] sm:max-w-[400px]" side="right">
				<SheetHeader>
					<SheetTitle className="flex items-center gap-2">
						<History className="h-5 w-5" />
						Version History
					</SheetTitle>
					<SheetDescription>
						View and restore previous versions of your resume.
						{versions.length > 0 && (
							<span className="ml-1">
								{versions.length} version{versions.length !== 1 ? 's' : ''} available.
							</span>
						)}
					</SheetDescription>
				</SheetHeader>

				<Separator className="my-4" />

				<ScrollArea className="h-[calc(100vh-180px)] pr-4">
					{sortedVersions.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<History className="mb-4 h-12 w-12 text-muted-foreground/50" />
							<p className="text-muted-foreground text-sm">No versions saved yet.</p>
							<p className="mt-1 text-muted-foreground text-xs">
								Save a version to start tracking your changes.
							</p>
						</div>
					) : (
						<div className="space-y-3">
							{sortedVersions.map((version, index) => {
								const isCurrent = version.id === currentVersionId || index === 0
								const isSelected = selectedVersionId === version.id

								return (
									<div
										className={cn(
											'rounded-lg border p-4 transition-colors',
											isCurrent && 'border-primary/50 bg-primary/5',
											isSelected && isRestoring && 'opacity-50',
										)}
										key={version.id}
									>
										{/* Version header */}
										<div className="flex items-start justify-between">
											<div className="space-y-1">
												<div className="flex items-center gap-2">
													<span className="font-semibold">Version {version.versionNumber}</span>
													{isCurrent && (
														<Badge className="text-xs" variant="default">
															Current
														</Badge>
													)}
												</div>
												<div className="flex items-center gap-1 text-muted-foreground text-xs">
													<Clock className="h-3 w-3" />
													{format(new Date(version.createdAt), 'MMM d, yyyy h:mm a')}
												</div>
											</div>

											{/* ATS Score */}
											{version.atsScore !== undefined && version.atsScore !== null && (
												<div className="text-right">
													<div className={cn('font-bold text-lg', getScoreColor(version.atsScore))}>
														{version.atsScore}%
													</div>
													<div className="text-muted-foreground text-xs">ATS Score</div>
												</div>
											)}
										</div>

										{/* Commit message */}
										{version.commitMessage && (
											<div className="mt-3 rounded-md bg-muted/50 p-2">
												<p className="text-muted-foreground text-sm">{version.commitMessage}</p>
											</div>
										)}

										{/* Restore button */}
										{!isCurrent && (
											<div className="mt-3 flex justify-end">
												<Button
													disabled={isRestoring}
													onClick={() => handleRestore(version.id)}
													size="sm"
													variant="outline"
												>
													<RotateCcw
														className={cn(
															'mr-2 h-3 w-3',
															isSelected && isRestoring && 'animate-spin',
														)}
													/>
													{isSelected && isRestoring ? 'Restoring...' : 'Restore'}
												</Button>
											</div>
										)}
									</div>
								)
							})}
						</div>
					)}
				</ScrollArea>
			</SheetContent>
		</Sheet>
	)
}
