'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
	Sortable,
	SortableContent,
	SortableItem,
	SortableItemHandle,
	SortableOverlay,
} from '@/components/ui/sortable'
import { IconGripVertical, IconPlus, IconTrash } from '@tabler/icons-react'
import { type Control, useFieldArray, useWatch } from 'react-hook-form'
import type { ResumeContent, ResumeWorkExperience } from '../../types/resume-content'

interface WorkExperienceSectionProps {
	control: Control<ResumeContent>
}

const createEmptyWorkExperience = (): ResumeWorkExperience => ({
	id: crypto.randomUUID(),
	company: '',
	position: '',
	startDate: '',
	endDate: '',
	isCurrent: false,
	summary: '',
})

export function WorkExperienceSection({ control }: WorkExperienceSectionProps) {
	const { fields, append, remove, move } = useFieldArray({
		control,
		name: 'work',
	})

	const workItems = useWatch({ control, name: 'work' }) || []

	const handleMove = (activeIndex: number, overIndex: number) => {
		move(activeIndex, overIndex)
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-lg">Work Experience</h3>
					<p className="text-muted-foreground text-sm">
						Add your relevant work history. Drag to reorder.
					</p>
				</div>
				<Button
					onClick={() => append(createEmptyWorkExperience())}
					size="sm"
					type="button"
					variant="outline"
				>
					<IconPlus className="mr-2 h-4 w-4" />
					Add Experience
				</Button>
			</div>

			{fields.length === 0 && (
				<Card>
					<CardContent className="py-8">
						<p className="text-center text-muted-foreground">
							No work experience added yet. Click "Add Experience" to get started.
						</p>
					</CardContent>
				</Card>
			)}

			{fields.length > 0 && (
				<Sortable
					value={fields}
					onMove={({ activeIndex, overIndex }) => handleMove(activeIndex, overIndex)}
					getItemValue={(item) => item.id}
					orientation="vertical"
				>
					<SortableContent className="space-y-4">
						{fields.map((field, index) => (
							<SortableItem key={field.id} value={field.id} asChild>
								<Card>
									<CardHeader>
										<div className="flex items-center gap-2">
											<SortableItemHandle asChild>
												<Button
													variant="ghost"
													size="icon"
													className="cursor-grab active:cursor-grabbing"
													type="button"
												>
													<IconGripVertical className="h-4 w-4 text-muted-foreground" />
												</Button>
											</SortableItemHandle>
											<CardTitle className="flex-1 text-base">
												{workItems[index]?.company || workItems[index]?.position
													? `${workItems[index]?.position || 'Position'} at ${workItems[index]?.company || 'Company'}`
													: `Experience #${index + 1}`}
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
												name={`work.${index}.company`}
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
												name={`work.${index}.position`}
												render={({ field }) => (
													<FormItem>
														<FormLabel>Position *</FormLabel>
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
												name={`work.${index}.startDate`}
												render={({ field }) => (
													<FormItem>
														<FormLabel>Start Date *</FormLabel>
														<FormControl>
															<Input placeholder="2020-01" {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={control}
												name={`work.${index}.endDate`}
												render={({ field }) => (
													<FormItem>
														<FormLabel>End Date</FormLabel>
														<FormControl>
															<Input
																placeholder="2022-12"
																{...field}
																value={field.value ?? ''}
																disabled={workItems[index]?.isCurrent}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={control}
												name={`work.${index}.isCurrent`}
												render={({ field }) => (
													<FormItem className="flex items-center space-x-2 space-y-0 pt-8">
														<FormControl>
															<Checkbox
																checked={field.value}
																onCheckedChange={field.onChange}
															/>
														</FormControl>
														<FormLabel className="!mt-0">Current Position</FormLabel>
													</FormItem>
												)}
											/>
										</div>

										<FormField
											control={control}
											name={`work.${index}.summary`}
											render={({ field }) => (
												<FormItem>
													<FormLabel>Description *</FormLabel>
													<FormControl>
														<Textarea
															className="min-h-[100px]"
															placeholder="Describe your responsibilities and achievements..."
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
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
											{workItems[index]?.company || workItems[index]?.position
												? `${workItems[index]?.position || 'Position'} at ${workItems[index]?.company || 'Company'}`
												: `Experience #${index + 1}`}
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
