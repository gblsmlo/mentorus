'use client'

import { Card, CardContent } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { parseCommaSeparated } from '@/lib/parsers'
import type { Control } from 'react-hook-form'

interface ResumeInfoSectionProps {
	control: Control<any>
}

export function ResumeInfoSection({ control }: ResumeInfoSectionProps) {
	return (
		<div className="space-y-4">
			<div className="space-y-1">
				<h3 className="font-semibold text-base tracking-tight">Resume information</h3>
			</div>
			<Card>
				<CardContent className="space-y-4">
					<FormField
						control={control}
						name="content.headline"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Headline <span className="text-destructive">*</span>
								</FormLabel>
								<FormControl>
									<Input placeholder="" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={control}
						name="content.summary"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Summary</FormLabel>
								<FormControl>
									<Textarea className="min-h-[120px]" placeholder="" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={control}
						name="content.competencies"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Competencies</FormLabel>
								<FormControl>
									<Input
										onChange={(e) => {
											const parsed = parseCommaSeparated(e.target.value)
											field.onChange(parsed)
										}}
										placeholder="e.g., Project Management, Agile Methodologies, Team Leadership"
										value={field.value?.join(', ') || ''}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</CardContent>
			</Card>
		</div>
	)
}
