'use client'

import { useCallback, useRef, useState } from 'react'
import type { ResumeContent } from '../types/resume-content'

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export interface UseAutoSaveOptions {
	resumeId: string
	debounceMs?: number // Default: 2000ms
	maxRetries?: number // Default: 3
	onSave: (resumeId: string, content: ResumeContent) => Promise<void>
	onError?: (error: Error) => void
}

export interface UseAutoSaveReturn {
	save: (content: ResumeContent) => void
	status: AutoSaveStatus
	lastSaved: Date | null
	error: Error | null
	retryCount: number
}

/**
 * Exponential backoff delay calculation
 * Returns delays: 1s, 2s, 4s for attempts 0, 1, 2
 */
export function calculateBackoffDelay(attempt: number): number {
	return 2 ** attempt * 1000
}

/**
 * Auto-save hook with debounce and retry logic
 *
 * Requirements: 6.1, 6.3
 * - Auto-saves draft within 2 seconds of last keystroke
 * - Retries up to 3 times with exponential backoff (1s, 2s, 4s)
 */
export function useAutoSave({
	resumeId,
	debounceMs = 2000,
	maxRetries = 3,
	onSave,
	onError,
}: UseAutoSaveOptions): UseAutoSaveReturn {
	const [status, setStatus] = useState<AutoSaveStatus>('idle')
	const [lastSaved, setLastSaved] = useState<Date | null>(null)
	const [error, setError] = useState<Error | null>(null)
	const [retryCount, setRetryCount] = useState(0)

	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
	const pendingContentRef = useRef<ResumeContent | null>(null)
	const isSavingRef = useRef(false)

	const performSave = useCallback(
		async (content: ResumeContent, attempt = 0): Promise<void> => {
			if (isSavingRef.current && attempt === 0) {
				// Queue this content for after current save completes
				pendingContentRef.current = content
				return
			}

			isSavingRef.current = true
			setStatus('saving')
			setRetryCount(attempt)

			try {
				await onSave(resumeId, content)
				setStatus('saved')
				setLastSaved(new Date())
				setError(null)
				setRetryCount(0)
				isSavingRef.current = false

				// Check if there's pending content to save
				if (pendingContentRef.current) {
					const pending = pendingContentRef.current
					pendingContentRef.current = null
					// Schedule the pending save
					performSave(pending, 0)
				}
			} catch (err) {
				const saveError = err instanceof Error ? err : new Error('Save failed')

				if (attempt < maxRetries - 1) {
					// Retry with exponential backoff
					const delay = calculateBackoffDelay(attempt)
					setRetryCount(attempt + 1)

					setTimeout(() => {
						performSave(content, attempt + 1)
					}, delay)
				} else {
					// Final failure after all retries
					setStatus('error')
					setError(saveError)
					isSavingRef.current = false
					onError?.(saveError)
				}
			}
		},
		[resumeId, maxRetries, onSave, onError],
	)

	const save = useCallback(
		(content: ResumeContent) => {
			// Clear any existing debounce timer
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current)
			}

			// Set new debounce timer
			debounceTimerRef.current = setTimeout(() => {
				performSave(content, 0)
			}, debounceMs)
		},
		[debounceMs, performSave],
	)

	return {
		error,
		lastSaved,
		retryCount,
		save,
		status,
	}
}
