'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { IconCheck, IconEdit, IconX } from '@tabler/icons-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

interface EditableFieldProps {
	value: string
	onSave: (value: string) => Promise<void>
	canEdit: boolean
	type?: 'text' | 'textarea'
	placeholder?: string
	className?: string
	displayClassName?: string
	emptyText?: string
}

export function EditableField({
	value,
	onSave,
	canEdit,
	type = 'text',
	placeholder,
	className = '',
	displayClassName = '',
	emptyText = 'Click to add...',
}: EditableFieldProps) {
	const [isEditing, setIsEditing] = useState(false)
	const [editValue, setEditValue] = useState(value)
	const [isSaving, setIsSaving] = useState(false)
	const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

	useEffect(() => {
		setEditValue(value)
	}, [value])

	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus()
			inputRef.current.select()
		}
	}, [isEditing])

	const handleSave = async () => {
		if (editValue === value) {
			setIsEditing(false)
			return
		}

		setIsSaving(true)
		try {
			await onSave(editValue)
			setIsEditing(false)
			toast.success('Saved successfully')
		} catch (error) {
			toast.error('Failed to save')
			setEditValue(value) // Revert on error
		} finally {
			setIsSaving(false)
		}
	}

	const handleCancel = () => {
		setEditValue(value)
		setIsEditing(false)
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Escape') {
			handleCancel()
		} else if (e.key === 'Enter' && type === 'text') {
			e.preventDefault()
			handleSave()
		}
	}

	if (!canEdit) {
		return (
			<div className={displayClassName || className}>
				{value || <span className="text-muted-foreground italic">{emptyText}</span>}
			</div>
		)
	}

	if (isEditing) {
		const InputComponent = type === 'textarea' ? Textarea : Input

		return (
			<div className="flex items-start gap-2">
				<InputComponent
					className={className}
					disabled={isSaving}
					onChange={(e) => setEditValue(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					ref={inputRef as any}
					value={editValue}
				/>
				<div className="flex gap-1">
					<Button
						disabled={isSaving}
						onClick={handleSave}
						size="icon"
						type="button"
						variant="ghost"
					>
						<IconCheck className="h-4 w-4" />
					</Button>
					<Button
						disabled={isSaving}
						onClick={handleCancel}
						size="icon"
						type="button"
						variant="ghost"
					>
						<IconX className="h-4 w-4" />
					</Button>
				</div>
			</div>
		)
	}

	return (
		<button
			className={`group relative w-full text-left ${displayClassName || className}`}
			onClick={() => setIsEditing(true)}
			type="button"
		>
			{value || <span className="text-muted-foreground italic">{emptyText}</span>}
			<IconEdit className="-translate-y-1/2 absolute top-1/2 right-2 h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
		</button>
	)
}
