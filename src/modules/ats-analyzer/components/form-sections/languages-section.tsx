'use client'

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
import { IconPlus, IconTrash } from '@tabler/icons-react'
import { type Control, useFieldArray, useWatch } from 'react-hook-form'
import type { ResumeContent, ResumeLanguage } from '../../types/resume-content'

interface LanguagesSectionProps {
	control: Control<ResumeContent>
}

const FLUENCY_LEVELS = ['Native', 'Fluent', 'Professional', 'Intermediate', 'Basic'] as const

const createEmptyLanguage = (): ResumeLanguage => ({
	fluency: '',
	language: '',
})

export function LanguagesSection({ control }: LanguagesSectionProps) {
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'languages',
	})

	const languageItems = useWatch({ control, name: 'languages' }) || []

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Languages</CardTitle>
						<CardDescription>Languages you speak and your proficiency level</CardDescription>
					</div>
					<Button
						onClick={() => append(createEmptyLanguage())}
						size="sm"
						type="button"
						variant="outline"
					>
						<IconPlus className="mr-2 h-4 w-4" />
						Add Language
					</Button>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{fields.length === 0 && (
					<p className="py-4 text-center text-muted-foreground text-sm">
						No languages added yet. Click "Add Language" to get started.
					</p>
				)}

				{fields.map((field, index) => (
					<div className="flex items-start gap-4" key={field.id}>
						<div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
							<FormField
								control={control}
								name={`languages.${index}.language`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Language *</FormLabel>
										<FormControl>
											<Input placeholder="English" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name={`languages.${index}.fluency`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Fluency Level *</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select fluency level" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{FLUENCY_LEVELS.map((level) => (
													<SelectItem key={level} value={level}>
														{level}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<Button
							className="mt-8"
							onClick={() => remove(index)}
							size="icon"
							type="button"
							variant="ghost"
						>
							<IconTrash className="h-4 w-4" />
						</Button>
					</div>
				))}
			</CardContent>
		</Card>
	)
}
