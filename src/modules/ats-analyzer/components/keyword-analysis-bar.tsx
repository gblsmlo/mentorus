'use client'

import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import type { CategorizedKeyword } from '../utils/score-calculator'

interface KeywordAnalysisBarProps {
	matchedKeywords: CategorizedKeyword[]
	missingKeywords: CategorizedKeyword[]
	onKeywordClick?: (keyword: string, type: 'matched' | 'missing') => void
	className?: string
}

/**
 * Get display label for keyword category
 */
function getCategoryLabel(category: CategorizedKeyword['category']): string {
	switch (category) {
		case 'hard_skill':
			return 'Hard Skills'
		case 'soft_skill':
			return 'Soft Skills'
		case 'general':
			return 'General'
	}
}

/**
 * Get badge variant for keyword category
 */
function getCategoryVariant(category: CategorizedKeyword['category']): 'default' | 'secondary' | 'outline' {
	switch (category) {
		case 'hard_skill':
			return 'default'
		case 'soft_skill':
			return 'secondary'
		case 'general':
			return 'outline'
	}
}

/**
 * Group keywords by category
 */
function groupByCategory(keywords: CategorizedKeyword[]): Record<CategorizedKeyword['category'], CategorizedKeyword[]> {
	return keywords.reduce(
		(acc, keyword) => {
			acc[keyword.category].push(keyword)
			return acc
		},
		{
			hard_skill: [] as CategorizedKeyword[],
			soft_skill: [] as CategorizedKeyword[],
			general: [] as CategorizedKeyword[],
		}
	)
}

interface KeywordSectionProps {
	title: string
	icon: React.ReactNode
	keywords: CategorizedKeyword[]
	type: 'matched' | 'missing'
	onKeywordClick?: (keyword: string, type: 'matched' | 'missing') => void
	defaultExpanded?: boolean
}

function KeywordSection({
	title,
	icon,
	keywords,
	type,
	onKeywordClick,
	defaultExpanded = true,
}: KeywordSectionProps) {
	const [isExpanded, setIsExpanded] = useState(defaultExpanded)
	const grouped = groupByCategory(keywords)

	if (keywords.length === 0) {
		return null
	}

	return (
		<div className="space-y-2">
			<button
				type="button"
				onClick={() => setIsExpanded(!isExpanded)}
				className="flex w-full items-center justify-between rounded-md px-2 py-1 hover:bg-muted/50 transition-colors"
			>
				<div className="flex items-center gap-2">
					{icon}
					<span className="font-medium text-sm">{title}</span>
					<Badge variant="outline" className="text-xs">
						{keywords.length}
					</Badge>
				</div>
				{isExpanded ? (
					<ChevronUp className="h-4 w-4 text-muted-foreground" />
				) : (
					<ChevronDown className="h-4 w-4 text-muted-foreground" />
				)}
			</button>

			{isExpanded && (
				<div className="space-y-3 pl-2">
					{/* Hard Skills */}
					{grouped.hard_skill.length > 0 && (
						<KeywordGroup
							label={getCategoryLabel('hard_skill')}
							keywords={grouped.hard_skill}
							variant={getCategoryVariant('hard_skill')}
							type={type}
							onKeywordClick={onKeywordClick}
						/>
					)}

					{/* Soft Skills */}
					{grouped.soft_skill.length > 0 && (
						<KeywordGroup
							label={getCategoryLabel('soft_skill')}
							keywords={grouped.soft_skill}
							variant={getCategoryVariant('soft_skill')}
							type={type}
							onKeywordClick={onKeywordClick}
						/>
					)}

					{/* General */}
					{grouped.general.length > 0 && (
						<KeywordGroup
							label={getCategoryLabel('general')}
							keywords={grouped.general}
							variant={getCategoryVariant('general')}
							type={type}
							onKeywordClick={onKeywordClick}
						/>
					)}
				</div>
			)}
		</div>
	)
}

interface KeywordGroupProps {
	label: string
	keywords: CategorizedKeyword[]
	variant: 'default' | 'secondary' | 'outline'
	type: 'matched' | 'missing'
	onKeywordClick?: (keyword: string, type: 'matched' | 'missing') => void
}

function KeywordGroup({ label, keywords, variant, type, onKeywordClick }: KeywordGroupProps) {
	return (
		<div className="space-y-1">
			<span className="text-muted-foreground text-xs">{label}</span>
			<div className="flex flex-wrap gap-1">
				{keywords.map((kw) => (
					<Badge
						key={kw.keyword}
						variant={variant}
						className={cn(
							'cursor-pointer transition-all hover:scale-105',
							type === 'missing' && 'opacity-70 border-dashed'
						)}
						onClick={() => onKeywordClick?.(kw.keyword, type)}
					>
						{kw.keyword}
						{kw.frequency > 1 && (
							<span className="ml-1 text-[10px] opacity-60">×{kw.frequency}</span>
						)}
					</Badge>
				))}
			</div>
		</div>
	)
}

/**
 * KeywordAnalysisBar - Displays matched and missing keywords grouped by category
 * 
 * Requirements: 3.2, 3.3, 4.1, 4.3
 * - Display matched keywords grouped by category (Hard_Skills, Soft_Skills, other)
 * - Display missing keywords sorted by importance (Hard_Skills first, then Soft_Skills)
 * - Clickable keywords for navigation
 */
export function KeywordAnalysisBar({
	matchedKeywords,
	missingKeywords,
	onKeywordClick,
	className,
}: KeywordAnalysisBarProps) {
	// Sort missing keywords by priority (hard_skill > soft_skill > general)
	const sortedMissing = [...missingKeywords].sort((a, b) => {
		const priorityMap: Record<CategorizedKeyword['category'], number> = {
			hard_skill: 1,
			soft_skill: 2,
			general: 3,
		}
		return priorityMap[a.category] - priorityMap[b.category]
	})

	const totalMatched = matchedKeywords.length
	const totalMissing = missingKeywords.length
	const matchRate = totalMatched + totalMissing > 0
		? Math.round((totalMatched / (totalMatched + totalMissing)) * 100)
		: 0

	return (
		<div className={cn('rounded-lg border bg-card', className)}>
			{/* Header with summary */}
			<div className="flex items-center justify-between border-b px-4 py-3">
				<h3 className="font-semibold text-sm">Keyword Analysis</h3>
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<span className="text-green-600 dark:text-green-400">
						{totalMatched} matched
					</span>
					<span>•</span>
					<span className="text-red-600 dark:text-red-400">
						{totalMissing} missing
					</span>
					<span>•</span>
					<span className="font-medium">{matchRate}% coverage</span>
				</div>
			</div>

			{/* Keyword sections */}
			<ScrollArea className="max-h-[300px]">
				<div className="space-y-4 p-4">
					{/* Matched Keywords */}
					<KeywordSection
						title="Matched Keywords"
						icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
						keywords={matchedKeywords}
						type="matched"
						onKeywordClick={onKeywordClick}
					/>

					{matchedKeywords.length > 0 && missingKeywords.length > 0 && (
						<Separator />
					)}

					{/* Missing Keywords */}
					<KeywordSection
						title="Missing Keywords"
						icon={<XCircle className="h-4 w-4 text-red-500" />}
						keywords={sortedMissing}
						type="missing"
						onKeywordClick={onKeywordClick}
					/>

					{/* Empty state */}
					{matchedKeywords.length === 0 && missingKeywords.length === 0 && (
						<div className="py-8 text-center text-muted-foreground text-sm">
							No keywords analyzed yet. Start editing your resume to see keyword matches.
						</div>
					)}
				</div>
			</ScrollArea>
		</div>
	)
}
