'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useEffect } from 'react'
import { type Control, useFieldArray } from 'react-hook-form'

interface EducationSectionProps {
	control: Control<any>
}

const defaultEmptyEducation = {
	degree: '',
	field: '',
	gpa: '',
	graduationDate: '',
	school: '',
}

export function EducationSection({ control }: EducationSectionProps) {
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'content.education',
	})

	// Auto-add first empty education if array is empty
	useEffect(() => {
		if (fields.length === 0) {
			append(defaultEmptyEducation)
		}
	}, [fields.length, append])

	const addEducation = () => {
		append(defaultEmptyEducation)
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-lg">Education</h3>
					<p className="text-muted-foreground text-sm">Add your educational background</p>
				</div>
				<Button onClick={addEducation} size="sm" type="button" variant="outline">
					Add Education
				</Button>
			</div>

			{fields.map((field, index) => (
				<Card key={field.id}>
					<CardHeader>
						<div className="flex items-start justify-between">
							<CardTitle className="text-base">Education #{index + 1}</CardTitle>
							<Button onClick={() => remove(index)} size="sm" type="button" variant="ghost">
								Remove
							</Button>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<FormField
								control={control}
								name={`content.education.${index}.school`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>School *</FormLabel>
										<FormControl>
											<Input placeholder="Stanford University" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name={`content.education.${index}.degree`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Degree *</FormLabel>
										<FormControl>
											<Input placeholder="Bachelor of Science" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							<FormField
								control={control}
								name={`content.education.${index}.field`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Field of Study</FormLabel>
										<FormControl>
											<Input placeholder="Computer Science" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name={`content.education.${index}.graduationDate`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Graduation Date</FormLabel>
										<FormControl>
											<Input placeholder="May 2020" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name={`content.education.${index}.gpa`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>GPA</FormLabel>
										<FormControl>
											<Input placeholder="3.8/4.0" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	)
}
