'use client'

import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface FloatingScoreBadgeProps {
	score: number
	previousScore?: number
	isCalculating?: boolean
	className?: string
}

/**
 * Get color class based on score threshold
 * - Green: score >= 70
 * - Yellow: score >= 40
 * - Red: score < 40
 */
function getScoreColor(score: number): {
	bg: string
	text: string
	border: string
	glow: string
} {
	if (score >= 70) {
		return {
			bg: 'bg-green-500/10',
			border: 'border-green-500/30',
			glow: 'shadow-green-500/20',
			text: 'text-green-600 dark:text-green-400',
		}
	}
	if (score >= 40) {
		return {
			bg: 'bg-yellow-500/10',
			border: 'border-yellow-500/30',
			glow: 'shadow-yellow-500/20',
			text: 'text-yellow-600 dark:text-yellow-400',
		}
	}
	return {
		bg: 'bg-red-500/10',
		border: 'border-red-500/30',
		glow: 'shadow-red-500/20',
		text: 'text-red-600 dark:text-red-400',
	}
}

/**
 * Get trend indicator based on score change
 */
function getTrendIndicator(current: number, previous?: number) {
	if (previous === undefined) return null

	const diff = current - previous
	if (diff > 0) {
		return {
			color: 'text-green-500',
			icon: TrendingUp,
			label: `+${diff}`,
		}
	}
	if (diff < 0) {
		return {
			color: 'text-red-500',
			icon: TrendingDown,
			label: `${diff}`,
		}
	}
	return {
		color: 'text-muted-foreground',
		icon: Minus,
		label: '0',
	}
}

/**
 * FloatingScoreBadge - Displays ATS compatibility score with color coding
 *
 * Requirements: 2.2
 * - Display score as floating badge visible in both panels
 * - Animate score transition to indicate improvement or decline
 * - Color coding: green >= 70, yellow >= 40, red < 40
 */
export function FloatingScoreBadge({
	score,
	previousScore,
	isCalculating = false,
	className,
}: FloatingScoreBadgeProps) {
	const [displayScore, setDisplayScore] = useState(score)
	const [isAnimating, setIsAnimating] = useState(false)
	const prevScoreRef = useRef(score)

	// Animate score changes
	useEffect(() => {
		if (score !== prevScoreRef.current) {
			setIsAnimating(true)
			const startScore = prevScoreRef.current
			const endScore = score
			const duration = 500 // ms
			const startTime = Date.now()

			const animate = () => {
				const elapsed = Date.now() - startTime
				const progress = Math.min(elapsed / duration, 1)

				// Ease out cubic
				const eased = 1 - (1 - progress) ** 3
				const currentScore = Math.round(startScore + (endScore - startScore) * eased)

				setDisplayScore(currentScore)

				if (progress < 1) {
					requestAnimationFrame(animate)
				} else {
					setIsAnimating(false)
					prevScoreRef.current = score
				}
			}

			requestAnimationFrame(animate)
		}
	}, [score])

	const colors = getScoreColor(displayScore)
	const trend = getTrendIndicator(score, previousScore)

	return (
		<motion.div
			animate={{ opacity: 1, scale: 1 }}
			className={cn(
				'fixed z-50 flex items-center gap-2 rounded-full border px-4 py-2 shadow-lg backdrop-blur-sm',
				colors.bg,
				colors.border,
				colors.glow,
				isCalculating && 'animate-pulse',
				className,
			)}
			initial={{ opacity: 0, scale: 0.9 }}
		>
			{/* Score Circle */}
			<div className="relative">
				<svg className="-rotate-90 h-12 w-12" viewBox="0 0 36 36">
					{/* Background circle */}
					<circle
						className="text-muted/20"
						cx="18"
						cy="18"
						fill="none"
						r="15.5"
						stroke="currentColor"
						strokeWidth="3"
					/>
					{/* Progress circle */}
					<motion.circle
						animate={{ strokeDasharray: `${displayScore}, 100` }}
						className={colors.text}
						cx="18"
						cy="18"
						fill="none"
						initial={{ strokeDasharray: '0, 100' }}
						r="15.5"
						stroke="currentColor"
						strokeDasharray={`${displayScore}, 100`}
						strokeLinecap="round"
						strokeWidth="3"
						transition={{ duration: 0.5, ease: 'easeOut' }}
					/>
				</svg>
				{/* Score number */}
				<div
					className={cn(
						'absolute inset-0 flex items-center justify-center font-bold text-sm',
						colors.text,
					)}
				>
					{displayScore}
				</div>
			</div>

			{/* Label and trend */}
			<div className="flex flex-col">
				<span className={cn('font-semibold text-sm', colors.text)}>ATS Score</span>
				<AnimatePresence mode="wait">
					{trend && !isCalculating && (
						<motion.div
							animate={{ opacity: 1, y: 0 }}
							className={cn('flex items-center gap-1 text-xs', trend.color)}
							exit={{ opacity: 0, y: 5 }}
							initial={{ opacity: 0, y: -5 }}
							key={trend.label}
						>
							<trend.icon className="h-3 w-3" />
							<span>{trend.label}</span>
						</motion.div>
					)}
					{isCalculating && (
						<motion.span
							animate={{ opacity: 1 }}
							className="text-muted-foreground text-xs"
							exit={{ opacity: 0 }}
							initial={{ opacity: 0 }}
						>
							Calculating...
						</motion.span>
					)}
				</AnimatePresence>
			</div>
		</motion.div>
	)
}
