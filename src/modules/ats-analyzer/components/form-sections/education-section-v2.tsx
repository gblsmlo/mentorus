'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	Sortable,
	SortableContent,
	SortableItem,
	SortableItemHandle,
	SortableOverlay,
} from '@/components/ui/sortable'
import { IconGripVertical, IconPlus, IconTrash } from '@tabler/icons-react'
import { type Control, useFieldArray, useWatch } from 'react-hook-form'
import type { ResumeContent, ResumeEducation } from '../../types/resume-content'

interface EducationSectionV2Props {
	control: Control<ResumeContent>
}

const STUDY_TYPES = [
	'High School',
	'Associate',
	'Bachelor',
	'Master',
	'PhD',
	'Certificate',
	'Bootcamp',
	'Other',
] as const

const createEmptyEducation = (): ResumeEducation => ({
	area: '',
	endDate: undefined,
	id: crypto.randomUUID(),
	institution: '',
	startDate: '',
	studyType: '',
})

export function EducationSectionV2({ control }: EducationSectionV2Props) {
	const { fields, append, remove, move } = useFieldArray({
		control,
		name: 'education',
	})

	const educationItems = useWatch({ control, name: 'education' }) || []

	const handleMove = (activeIndex: number, overIndex: number) => {
		move(activeIndex, overIndex)
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-lg">Education</h3>
					<p className="text-muted-foreground text-sm">
						Add your educational background. Drag to reorder.
					</p>
				</div>
				<Button
					onClick={() => append(createEmptyEducation())}
					size="sm"
					type="button"
					variant="outline"
				>
					<IconPlus className="mr-2 h-4 w-4" />
					Add Education
				</Button>
			</div>

			{fields.length === 0 && (
				<Card>
					<CardContent className="py-8">
						<p className="text-center text-muted-foreground">
							No education added yet. Click "Add Education" to get started.
						</p>
					</CardContent>
				</Card>
			)}

			{fields.length > 0 && (
				<Sortable
					getItemValue={(item) => item.id}
					onMove={({ activeIndex, overIndex }) => handleMove(activeIndex, overIndex)}
					orientation="vertical"
					value={fields}
				>
					<SortableContent className="space-y-4">
						{fields.map((field, index) => (
							<SortableItem asChild key={field.id} value={field.id}>
								<Card>
									<CardHeader>
										<div className="flex items-center gap-2">
											<SortableItemHandle asChild>
												<Button
													className="cursor-grab active:cursor-grabbing"
													size="icon"
													type="button"
													variant="ghost"
												>
													<IconGripVertical className="h-4 w-4 text-muted-foreground" />
												</Button>
											</SortableItemHandle>
											<CardTitle className="flex-1 text-base">
												{educationItems[index]?.institution || educationItems[index]?.area
													? `${educationItems[index]?.studyType || 'Degree'} in ${educationItems[index]?.area || 'Field'} at ${educationItems[index]?.institution || 'Institution'}`
													: `Education #${index + 1}`}
											</CardTitle>
											<Button
												onClick={() => remove(index)}
												size="icon"
												type="button"
												variant="ghost"
											>
												<IconTrash className="h-4 w-4" />
											</Button>
										</div>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
											<FormField
												control={control}
												name={`education.${index}.institution`}
												render={({ field }) => (
													<FormItem>
														<FormLabel>Institution *</FormLabel>
														<FormControl>
															<Input placeholder="Stanford University" {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={control}
												name={`education.${index}.area`}
												render={({ field }) => (
													<FormItem>
														<FormLabel>Field of Study *</FormLabel>
														<FormControl>
															<Input placeholder="Computer Science" {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>

										<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
											<FormField
												control={control}
												name={`education.${index}.studyType`}
												render={({ field }) => (
													<FormItem>
														<FormLabel>Degree Type *</FormLabel>
														<Select onValueChange={field.onChange} value={field.value}>
															<FormControl>
																<SelectTrigger>
																	<SelectValue placeholder="Select degree type" />
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																{STUDY_TYPES.map((type) => (
																	<SelectItem key={type} value={type}>
																		{type}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={control}
												name={`education.${index}.startDate`}
												render={({ field }) => (
													<FormItem>
														<FormLabel>Start Date *</FormLabel>
														<FormControl>
															<Input placeholder="2016-09" {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={control}
												name={`education.${index}.endDate`}
												render={({ field }) => (
													<FormItem>
														<FormLabel>End Date</FormLabel>
														<FormControl>
															<Input placeholder="2020-05" {...field} value={field.value ?? ''} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
									</CardContent>
								</Card>
							</SortableItem>
						))}
					</SortableContent>
					<SortableOverlay>
						{({ value }) => {
							const index = fields.findIndex((f) => f.id === value)
							if (index === -1) return null
							return (
								<Card className="opacity-80">
									<CardHeader>
										<CardTitle className="text-base">
											{educationItems[index]?.institution || educationItems[index]?.area
												? `${educationItems[index]?.studyType || 'Degree'} at ${educationItems[index]?.institution || 'Institution'}`
												: `Education #${index + 1}`}
										</CardTitle>
									</CardHeader>
								</Card>
							)
						}}
					</SortableOverlay>
				</Sortable>
			)}
		</div>
	)
}
