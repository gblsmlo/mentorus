'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { updateProfile } from '../actions/profile-actions'
import { type ProfileBasicInfo, profileBasicInfoSchema } from '../schemas/profile-schemas'

interface ProfileBasicFormProps {
	initialData: ProfileBasicInfo
}

export function ProfileBasicForm({ initialData }: ProfileBasicFormProps) {
	const [isSaving, setIsSaving] = useState(false)
	const [lastSaved, setLastSaved] = useState<Date | null>(null)

	const form = useForm<ProfileBasicInfo>({
		defaultValues: initialData,
		mode: 'all',
		resolver: zodResolver(profileBasicInfoSchema),
	})

	useEffect(() => {
		const subscription = form.watch(async (value) => {
			if (!form.formState.isValid || !form.formState.isDirty) {
				return
			}

			setIsSaving(true)

			try {
				await updateProfile(value)
				setLastSaved(new Date())
				form.reset(value)
			} catch (error) {
				toast.error('Failed to save changes', {
					description: error instanceof Error ? error.message : 'Unknown error',
				})
			} finally {
				setIsSaving(false)
			}
		})

		const timeoutId = setTimeout(() => {
			subscription
		}, 1000)

		return () => {
			clearTimeout(timeoutId)
			subscription.unsubscribe()
		}
	}, [form])

	return (
		<div className="space-y-6">
			<Form {...form}>
				<div className="space-y-4">
					<div className="space-y-1">
						<h3 className="font-semibold text-base tracking-tight">Profile</h3>
					</div>
					<Card>
						<CardContent className="space-y-4">
							<div className="grid gap-4">
								<FormField
									control={form.control}
									name="name"
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
									control={form.control}
									name="email"
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
									control={form.control}
									name="phone"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Phone</FormLabel>
											<FormControl>
												<Input placeholder="+1 (555) 123-4567" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="location"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Location</FormLabel>
											<FormControl>
												<Input placeholder="San Francisco, CA" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</CardContent>
					</Card>
				</div>
			</Form>
		</div>
	)
}
