'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import { type Control, useFieldArray } from 'react-hook-form'
import type { ResumeContent } from '../../types/resume-content'

interface BasicsSectionProps {
	control: Control<ResumeContent>
}

export function BasicsSection({ control }: BasicsSectionProps) {
	const { fields: profileFields, append: appendProfile, remove: removeProfile } = useFieldArray({
		control,
		name: 'basics.profiles',
	})

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Basic Information</CardTitle>
					<CardDescription>Your contact details and professional headline</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<FormField
							control={control}
							name="basics.name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Full Name *</FormLabel>
									<FormControl>
										<Input placeholder="John Doe" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={control}
							name="basics.email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email *</FormLabel>
									<FormControl>
										<Input placeholder="john@example.com" type="email" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<FormField
							control={control}
							name="basics.phone"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Phone</FormLabel>
									<FormControl>
										<Input placeholder="+1 (555) 123-4567" {...field} value={field.value ?? ''} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={control}
							name="basics.label"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Professional Headline</FormLabel>
									<FormControl>
										<Input placeholder="Senior Software Engineer" {...field} value={field.value ?? ''} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Location</CardTitle>
					<CardDescription>Your current location</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						<FormField
							control={control}
							name="basics.location.city"
							render={({ field }) => (
								<FormItem>
									<FormLabel>City *</FormLabel>
									<FormControl>
										<Input placeholder="San Francisco" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={control}
							name="basics.location.region"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Region/State</FormLabel>
									<FormControl>
										<Input placeholder="California" {...field} value={field.value ?? ''} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={control}
							name="basics.location.countryCode"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Country Code *</FormLabel>
									<FormControl>
										<Input placeholder="US" maxLength={2} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Online Profiles</CardTitle>
							<CardDescription>LinkedIn, GitHub, portfolio, etc.</CardDescription>
						</div>
						<Button
							onClick={() => appendProfile({ network: '', url: '' })}
							size="sm"
							type="button"
							variant="outline"
						>
							<IconPlus className="mr-2 h-4 w-4" />
							Add Profile
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{profileFields.length === 0 && (
						<p className="text-center text-muted-foreground text-sm py-4">
							No profiles added yet. Click "Add Profile" to add your online presence.
						</p>
					)}
					{profileFields.map((field, index) => (
						<div key={field.id} className="flex gap-4 items-start">
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2 flex-1">
								<FormField
									control={control}
									name={`basics.profiles.${index}.network`}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Network</FormLabel>
											<FormControl>
												<Input placeholder="LinkedIn" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name={`basics.profiles.${index}.url`}
									render={({ field }) => (
										<FormItem>
											<FormLabel>URL</FormLabel>
											<FormControl>
												<Input placeholder="https://linkedin.com/in/" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<Button
								className="mt-8"
								onClick={() => removeProfile(index)}
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
		</div>
	)
}
