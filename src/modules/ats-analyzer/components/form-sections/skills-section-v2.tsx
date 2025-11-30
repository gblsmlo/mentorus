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
				level: newSkillLevel || undefined,
				name: newSkillName.trim(),
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
					Technical skills like programming languages, frameworks, and methodologies. These have the
					highest weight (60%) in ATS matching.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex gap-2">
					<Input
						className="flex-1"
						onChange={(e) => setNewSkillName(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="e.g., React, TypeScript, AWS"
						value={newSkillName}
					/>
					<Select onValueChange={setNewSkillLevel} value={newSkillLevel}>
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
					<Button onClick={handleAddSkill} size="icon" type="button">
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
									className="flex items-center gap-1 px-3 py-1"
									key={field.id}
									variant="secondary"
								>
									<span>{skill?.name}</span>
									{skill?.level && (
										<span className="text-muted-foreground text-xs">({skill.level})</span>
									)}
									<button
										className="ml-1 hover:text-destructive"
										onClick={() => remove(index)}
										type="button"
									>
										<IconX className="h-3 w-3" />
									</button>
								</Badge>
							)
						})}
					</div>
				)}

				{fields.length === 0 && (
					<p className="py-2 text-center text-muted-foreground text-sm">
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
					Interpersonal and behavioral skills like leadership, communication, and teamwork. These
					have medium weight (30%) in ATS matching.
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
									onChange={field.onChange}
									placeholder="e.g., Leadership, Communication, Problem-solving"
									value={field.value || []}
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
					Software tools, platforms, and technologies you're proficient with. These are included in
					hard skills matching.
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
									onChange={field.onChange}
									placeholder="e.g., Git, Docker, Jira, Figma"
									value={field.value || []}
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
					className="flex-1"
					onChange={(e) => setInputValue(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					value={inputValue}
				/>
				<Button onClick={handleAddTag} size="icon" type="button">
					<IconPlus className="h-4 w-4" />
				</Button>
			</div>

			{value.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{value.map((tag) => (
						<Badge className="flex items-center gap-1 px-3 py-1" key={tag} variant="secondary">
							<span>{tag}</span>
							<button
								className="ml-1 hover:text-destructive"
								onClick={() => handleRemoveTag(tag)}
								type="button"
							>
								<IconX className="h-3 w-3" />
							</button>
						</Badge>
					))}
				</div>
			)}

			{value.length === 0 && (
				<p className="py-2 text-center text-muted-foreground text-sm">
					No items added yet. Type and press Enter or click + to add.
				</p>
			)}
		</div>
	)
}
