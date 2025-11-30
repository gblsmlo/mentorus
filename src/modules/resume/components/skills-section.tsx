'use client'

import { Card, CardContent } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { parseCommaSeparated } from '@/lib/parsers'
import type { Control } from 'react-hook-form'

interface SkillsSectionProps {
	control: Control<any>
}

export function SkillsSection({ control }: SkillsSectionProps) {
	return (
		<div className="space-y-8">
			{/* Hard Skills (Technical) */}
			<div className="space-y-4">
				<div className="space-y-1">
					<h3 className="font-semibold text-xl tracking-tight">Hard Skills</h3>
					<p className="text-muted-foreground text-sm">
						Programming languages, frameworks, tools, etc.
					</p>
				</div>
				<Card>
					<CardContent className="pt-6">
						<FormField
							control={control}
							name="content.skills.technical"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											placeholder="e.g., React, TypeScript, Node.js"
											value={field.value?.join(', ') || ''}
											onChange={(e) => {
												const parsed = parseCommaSeparated(e.target.value)
												field.onChange(parsed)
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>
				</Card>
			</div>

			{/* Soft Skills */}
			<div className="space-y-4">
				<div className="space-y-1">
					<h3 className="font-semibold text-xl tracking-tight">Soft Skills</h3>
					<p className="text-muted-foreground text-sm">Leadership, communication, teamwork, etc.</p>
				</div>
				<Card>
					<CardContent className="pt-6">
						<FormField
							control={control}
							name="content.skills.soft"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											placeholder="e.g., Leadership, Communication, Problem-solving"
											value={field.value?.join(', ') || ''}
											onChange={(e) => {
												const parsed = parseCommaSeparated(e.target.value)
												field.onChange(parsed)
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
