'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useEffect, useState } from 'react'
import { type Control, useFieldArray } from 'react-hook-form'

interface ProjectsSectionProps {
	control: Control<any>
}

const defaultEmptyProject = {
	description: '',
	name: '',
	technologies: [],
	url: '',
}

export function ProjectsSection({ control }: ProjectsSectionProps) {
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'content.projects',
	})

	// Auto-add first empty project if array is empty
	useEffect(() => {
		if (fields.length === 0) {
			append(defaultEmptyProject)
		}
	}, [fields.length, append])

	const addProject = () => {
		append(defaultEmptyProject)
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-lg">Projects</h3>
					<p className="text-muted-foreground text-sm">
						Showcase your personal or professional projects
					</p>
				</div>
				<Button onClick={addProject} size="sm" type="button" variant="outline">
					Add Project
				</Button>
			</div>

			{fields.map((field, index) => (
				<Card key={field.id}>
					<CardHeader>
						<div className="flex items-start justify-between">
							<CardTitle className="text-base">Project #{index + 1}</CardTitle>
							<Button onClick={() => remove(index)} size="sm" type="button" variant="ghost">
								Remove
							</Button>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<FormField
								control={control}
								name={`content.projects.${index}.name`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Project Name *</FormLabel>
										<FormControl>
											<Input placeholder="E-commerce Platform" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name={`content.projects.${index}.url`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>URL</FormLabel>
										<FormControl>
											<Input placeholder="https://github.com/..." {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={control}
							name={`content.projects.${index}.description`}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											className="min-h-[80px]"
											placeholder="Built a full-stack e-commerce platform with..."
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<TechnologiesField control={control} index={index} />
					</CardContent>
				</Card>
			))}
		</div>
	)
}

function TechnologiesField({ control, index }: { control: Control<any>; index: number }) {
	const [inputValue, setInputValue] = useState('')

	return (
		<FormField
			control={control}
			name={`content.projects.${index}.technologies`}
			render={({ field }) => {
				const technologies = field.value || []

				const addTech = () => {
					if (inputValue.trim() && !technologies.includes(inputValue.trim())) {
						field.onChange([...technologies, inputValue.trim()])
						setInputValue('')
					}
				}

				const removeTech = (tech: string) => {
					field.onChange(technologies.filter((t: string) => t !== tech))
				}

				return (
					<FormItem>
						<FormLabel>Technologies Used</FormLabel>
						<FormControl>
							<div className="space-y-3">
								<div className="flex gap-2">
									<Input
										onChange={(e) => setInputValue(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault()
												addTech()
											}
										}}
										placeholder="e.g., React, Node.js, PostgreSQL"
										value={inputValue}
									/>
									<Button onClick={addTech} size="sm" type="button" variant="outline">
										Add
									</Button>
								</div>
								<div className="flex flex-wrap gap-2">
									{technologies.map((tech: string) => (
										<Badge key={tech} variant="secondary">
											{tech}
											<button
												className="ml-2 hover:text-destructive"
												onClick={() => removeTech(tech)}
												type="button"
											>
												×
											</button>
										</Badge>
									))}
								</div>
							</div>
						</FormControl>
						<FormMessage />
					</FormItem>
				)
			}}
		/>
	)
}
