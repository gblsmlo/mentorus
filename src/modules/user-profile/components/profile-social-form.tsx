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
import { type ProfileSocialInfo, profileSocialInfoSchema } from '../schemas/profile-schemas'

interface ProfileSocialFormProps {
	initialData: ProfileSocialInfo
}

export function ProfileSocialForm({ initialData }: ProfileSocialFormProps) {
	const [isSaving, setIsSaving] = useState(false)
	const [lastSaved, setLastSaved] = useState<Date | null>(null)

	const form = useForm<ProfileSocialInfo>({
		defaultValues: initialData,
		mode: 'onChange',
		resolver: zodResolver(profileSocialInfoSchema),
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
			<div className="flex items-center justify-end text-muted-foreground text-sm">
				{isSaving && (
					<div className="flex items-center gap-2">
						<Loader2 className="h-3 w-3 animate-spin" />
						<span>Saving...</span>
					</div>
				)}
				{!isSaving && lastSaved && <span>Last saved at {lastSaved.toLocaleTimeString()}</span>}
			</div>

			<Form {...form}>
				<div className="space-y-4">
					<div className="space-y-1">
						<h3 className="font-semibold text-base tracking-tight">Online Presence</h3>
					</div>
					<Card>
						<CardContent className="space-y-4 pt-6">
							<div className="grid gap-4">
								<FormField
									control={form.control}
									name="linkedin"
									render={({ field }) => (
										<FormItem>
											<FormLabel>LinkedIn</FormLabel>
											<FormControl>
												<Input placeholder="https://linkedin.com/in/..." {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="github"
									render={({ field }) => (
										<FormItem>
											<FormLabel>GitHub</FormLabel>
											<FormControl>
												<Input placeholder="https://github.com/..." {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="website"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Website</FormLabel>
											<FormControl>
												<Input placeholder="https://yoursite.com" {...field} />
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
