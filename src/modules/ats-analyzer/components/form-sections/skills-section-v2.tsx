'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { IconPlus, IconX } from '@tabler/icons-react'
import { useState } from 'react'
import { type Control, useFieldArray, useWatch } from 'react-hook-form'
import type { ResumeContent, ResumeHardSkill } from '../../types/resume-content'

interface SkillsSectionV2Props {
	control: Control<ResumeContent>
}

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const

export function SkillsSectionV2({ control }: SkillsSectionV2Props) {
	return (
		<div className="space-y-6">
			<HardSkillsInput control={control} />
			<SoftSkillsInput control={control} />
			<ToolsInput control={control} />
		</div>
	)
}

function HardSkillsInput({ control }: { control: Control<ResumeContent> }) {
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'skills.hard',
	})

	const [newSkillName, setNewSkillName] = useState('')
	const [newSkillLevel, setNewSkillLevel] = useState<string>('')

	const handleAddSkill = () => {
		if (newSkillName.trim()) {
			const newSkill: ResumeHardSkill = {
				name: newSkillName.trim(),
				level: newSkillLevel || undefined,
			}
			append(newSkill)
			setNewSkillName('')
			setNewSkillLevel('')
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			handleAddSkill()
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Hard Skills</CardTitle>
				<CardDescription>
					Technical skills like programming languages, frameworks, and methodologies.
					These have the highest weight (60%) in ATS matching.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex gap-2">
					<Input
						placeholder="e.g., React, TypeScript, AWS"
						value={newSkillName}
						onChange={(e) => setNewSkillName(e.target.value)}
						onKeyDown={handleKeyDown}
						className="flex-1"
					/>
					<Select value={newSkillLevel} onValueChange={setNewSkillLevel}>
						<SelectTrigger className="w-[140px]">
							<SelectValue placeholder="Level" />
						</SelectTrigger>
						<SelectContent>
							{SKILL_LEVELS.map((level) => (
								<SelectItem key={level} value={level}>
									{level}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button type="button" onClick={handleAddSkill} size="icon">
						<IconPlus className="h-4 w-4" />
					</Button>
				</div>

				{fields.length > 0 && (
					<div className="flex flex-wrap gap-2">
						{fields.map((field, index) => {
							const skill = useWatch({
								control,
								name: `skills.hard.${index}`,
							})
							return (
								<Badge
									key={field.id}
									variant="secondary"
									className="flex items-center gap-1 px-3 py-1"
								>
									<span>{skill?.name}</span>
									{skill?.level && (
										<span className="text-muted-foreground text-xs">
											({skill.level})
										</span>
									)}
									<button
										type="button"
										onClick={() => remove(index)}
										className="ml-1 hover:text-destructive"
									>
										<IconX className="h-3 w-3" />
									</button>
								</Badge>
							)
						})}
					</div>
				)}

				{fields.length === 0 && (
					<p className="text-center text-muted-foreground text-sm py-2">
						No hard skills added yet. Type a skill and press Enter or click + to add.
					</p>
				)}
			</CardContent>
		</Card>
	)
}

function SoftSkillsInput({ control }: { control: Control<ResumeContent> }) {
	const softSkills = useWatch({ control, name: 'skills.soft' }) || []
	const [newSkill, setNewSkill] = useState('')

	const handleAddSkill = () => {
		if (newSkill.trim() && !softSkills.includes(newSkill.trim())) {
			const updatedSkills = [...softSkills, newSkill.trim()]
			// We need to use setValue through the form context
			// For now, we'll use a controlled approach with FormField
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Soft Skills</CardTitle>
				<CardDescription>
					Interpersonal and behavioral skills like leadership, communication, and teamwork.
					These have medium weight (30%) in ATS matching.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<FormField
					control={control}
					name="skills.soft"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<TagInput
									value={field.value || []}
									onChange={field.onChange}
									placeholder="e.g., Leadership, Communication, Problem-solving"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</CardContent>
		</Card>
	)
}

function ToolsInput({ control }: { control: Control<ResumeContent> }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Tools & Technologies</CardTitle>
				<CardDescription>
					Software tools, platforms, and technologies you're proficient with.
					These are included in hard skills matching.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<FormField
					control={control}
					name="skills.tools"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<TagInput
									value={field.value || []}
									onChange={field.onChange}
									placeholder="e.g., Git, Docker, Jira, Figma"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</CardContent>
		</Card>
	)
}

interface TagInputProps {
	value: string[]
	onChange: (value: string[]) => void
	placeholder?: string
}

function TagInput({ value, onChange, placeholder }: TagInputProps) {
	const [inputValue, setInputValue] = useState('')

	const handleAddTag = () => {
		const trimmed = inputValue.trim()
		if (trimmed && !value.includes(trimmed)) {
			onChange([...value, trimmed])
			setInputValue('')
		}
	}

	const handleRemoveTag = (tagToRemove: string) => {
		onChange(value.filter((tag) => tag !== tagToRemove))
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			handleAddTag()
		} else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
			// Remove last tag when backspace is pressed on empty input
			onChange(value.slice(0, -1))
		}
	}

	return (
		<div className="space-y-3">
			<div className="flex gap-2">
				<Input
					placeholder={placeholder}
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					onKeyDown={handleKeyDown}
					className="flex-1"
				/>
				<Button type="button" onClick={handleAddTag} size="icon">
					<IconPlus className="h-4 w-4" />
				</Button>
			</div>

			{value.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{value.map((tag) => (
						<Badge
							key={tag}
							variant="secondary"
							className="flex items-center gap-1 px-3 py-1"
						>
							<span>{tag}</span>
							<button
								type="button"
								onClick={() => handleRemoveTag(tag)}
								className="ml-1 hover:text-destructive"
							>
								<IconX className="h-3 w-3" />
							</button>
						</Badge>
					))}
				</div>
			)}

			{value.length === 0 && (
				<p className="text-center text-muted-foreground text-sm py-2">
					No items added yet. Type and press Enter or click + to add.
				</p>
			)}
		</div>
	)
}
