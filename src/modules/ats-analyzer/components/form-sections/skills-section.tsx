'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import type { Control } from 'react-hook-form'

interface SkillsSectionProps {
	control: Control<any>
}

export function SkillsSection({ control }: SkillsSectionProps) {
	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Technical Skills</CardTitle>
					<CardDescription>Programming languages, frameworks, tools, etc.</CardDescription>
				</CardHeader>
				<CardContent>
					<SkillInput control={control} name="content.skills.technical" />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Soft Skills</CardTitle>
					<CardDescription>Leadership, communication, teamwork, etc.</CardDescription>
				</CardHeader>
				<CardContent>
					<SkillInput control={control} name="content.skills.soft" />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Languages</CardTitle>
					<CardDescription>Spoken languages and proficiency levels</CardDescription>
				</CardHeader>
				<CardContent>
					<SkillInput control={control} name="content.skills.languages" />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Certifications</CardTitle>
					<CardDescription>Professional certifications and licenses</CardDescription>
				</CardHeader>
				<CardContent>
					<SkillInput control={control} name="content.skills.certifications" />
				</CardContent>
			</Card>
		</div>
	)
}

function SkillInput({ control, name }: { control: Control<any>; name: string }) {
	const [inputValue, setInputValue] = useState('')

	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => {
				const skills = field.value || []

				const addSkill = () => {
					if (inputValue.trim() && !skills.includes(inputValue.trim())) {
						field.onChange([...skills, inputValue.trim()])
						setInputValue('')
					}
				}

				const removeSkill = (skillToRemove: string) => {
					field.onChange(skills.filter((s: string) => s !== skillToRemove))
				}

				return (
					<FormItem>
						<FormControl>
							<div className="space-y-3">
								<div className="flex gap-2">
									<Input
										onChange={(e) => setInputValue(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault()
												addSkill()
											}
										}}
										placeholder="Type a skill and press Enter or click Add"
										value={inputValue}
									/>
									<Button onClick={addSkill} type="button" variant="outline">
										Add
									</Button>
								</div>
								<div className="flex flex-wrap gap-2">
									{skills.map((skill: string) => (
										<Badge key={skill} variant="secondary">
											{skill}
											<button
												className="ml-2 hover:text-destructive"
												onClick={() => removeSkill(skill)}
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
