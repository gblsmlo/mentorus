'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { type Control, useFieldArray } from 'react-hook-form'

interface ExperienceSectionProps {
	control: Control<any>
}

const defaultEmptyExperience = {
	bullets: [],
	company: '',
	current: false,
	description: '',
	endDate: '',
	startDate: '',
	title: '',
}

export function ExperienceSection({ control }: ExperienceSectionProps) {
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'content.experience',
	})

	// Auto-add first empty experience if array is empty
	useEffect(() => {
		if (fields.length === 0) {
			append(defaultEmptyExperience)
		}
	}, [fields.length, append])

	const addExperience = () => {
		append(defaultEmptyExperience)
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-lg">Work Experience</h3>
					<p className="text-muted-foreground text-sm">Add your relevant work history</p>
				</div>
				<Button onClick={addExperience} size="sm" type="button" variant="outline">
					Add Experience
				</Button>
			</div>

			{fields.map((field, index) => (
				<Card key={field.id}>
					<CardHeader>
						<div className="flex items-start justify-between">
							<CardTitle className="text-base">Experience #{index + 1}</CardTitle>
							<Button onClick={() => remove(index)} size="sm" type="button" variant="ghost">
								Remove
							</Button>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<FormField
								control={control}
								name={`content.experience.${index}.company`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Company *</FormLabel>
										<FormControl>
											<Input placeholder="Google" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name={`content.experience.${index}.title`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Job Title *</FormLabel>
										<FormControl>
											<Input placeholder="Senior Software Engineer" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							<FormField
								control={control}
								name={`content.experience.${index}.startDate`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Start Date *</FormLabel>
										<FormControl>
											<Input placeholder="Jan 2020" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name={`content.experience.${index}.endDate`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>End Date</FormLabel>
										<FormControl>
											<Input placeholder="Dec 2022" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name={`content.experience.${index}.current`}
								render={({ field }) => (
									<FormItem className="flex items-center space-x-2 space-y-0 pt-8">
										<FormControl>
											<Checkbox checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
										<FormLabel className="!mt-0">Current Position</FormLabel>
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={control}
							name={`content.experience.${index}.description`}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											className="min-h-[80px]"
											placeholder="Brief description of your role and responsibilities..."
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<BulletsField control={control} index={index} />
					</CardContent>
				</Card>
			))}
		</div>
	)
}

function BulletsField({ control, index }: { control: Control<any>; index: number }) {
	const { fields, append, remove } = useFieldArray({
		control,
		name: `content.experience.${index}.bullets`,
	})

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<FormLabel>Key Achievements (Bullet Points)</FormLabel>
				<Button onClick={() => append('')} size="sm" type="button" variant="ghost">
					Add Bullet
				</Button>
			</div>
			{fields.map((bulletField, bulletIndex) => (
				<div className="flex gap-2" key={bulletField.id}>
					<FormField
						control={control}
						name={`content.experience.${index}.bullets.${bulletIndex}`}
						render={({ field }) => (
							<FormItem className="flex-1">
								<FormControl>
									<Input placeholder="Led a team of 5 engineers to deliver..." {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button onClick={() => remove(bulletIndex)} size="sm" type="button" variant="ghost">
						×
					</Button>
				</div>
			))}
		</div>
	)
}
