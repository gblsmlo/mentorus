'use client'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileText, Plus } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { createApplication } from '../actions/application-actions'
import { saveJob } from '../actions/job-actions'

const formSchema = z.object({
	company: z.string().min(1, 'Company name is required'),
	description: z.string().min(10, 'Job description is required'),
	resumeId: z.string().min(1, 'Please select a resume'),
	title: z.string().min(1, 'Job title is required'),
	url: z.string().url().optional().or(z.literal('')),
})

interface AddApplicationDialogProps {
	userId: string
	resumes: Array<{
		id: string
		title: string
	}>
}

export function AddApplicationDialog({ userId, resumes }: AddApplicationDialogProps) {
	const [open, setOpen] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const form = useForm<z.infer<typeof formSchema>>({
		defaultValues: {
			company: '',
			description: '',
			resumeId: '',
			title: '',
			url: '',
		},
		resolver: zodResolver(formSchema),
	})

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsSubmitting(true)
		try {
			// 1. Create Job
			const job = await saveJob(userId, {
				company: values.company,
				description: values.description,
				title: values.title,
				url: values.url,
			})

			// 2. Create Application linked to Job and selected Resume
			await createApplication({
				jobId: job.id,
				resumeId: values.resumeId,
				status: 'draft',
			})

			toast.success('Application created successfully!')
			setOpen(false)
			form.reset()
		} catch (error) {
			toast.error('Failed to create application')
			console.error(error)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="mr-2 h-4 w-4" /> Add Application
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Add New Application</DialogTitle>
					<DialogDescription>
						Add a job description and select a resume to start optimizing.
					</DialogDescription>
				</DialogHeader>

				{resumes.length === 0 ? (
					<div className="flex flex-col items-center justify-center space-y-4 py-6 text-center">
						<div className="rounded-full bg-muted p-4">
							<FileText className="h-8 w-8 text-muted-foreground" />
						</div>
						<div className="space-y-2">
							<h3 className="font-medium">No resumes found</h3>
							<p className="mx-auto max-w-xs text-muted-foreground text-sm">
								You need to create a resume before you can start tracking applications.
							</p>
						</div>
						<Button asChild className="w-full">
							<Link href="/dashboard/resumes/new">Create Resume</Link>
						</Button>
					</div>
				) : (
					<Form {...form}>
						<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Job Title</FormLabel>
										<FormControl>
											<Input placeholder="e.g. Senior Frontend Engineer" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="company"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Company</FormLabel>
										<FormControl>
											<Input placeholder="e.g. Acme Corp" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="url"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Job URL (Optional)</FormLabel>
										<FormControl>
											<Input placeholder="https://..." {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Job Description</FormLabel>
										<FormControl>
											<Textarea
												className="h-32"
												placeholder="Paste the full job description here..."
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="resumeId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Base Resume</FormLabel>
										<Select defaultValue={field.value} onValueChange={field.onChange}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a resume to start with" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{resumes.map((resume) => (
													<SelectItem key={resume.id} value={resume.id}>
														{resume.title}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<DialogFooter>
								<Button disabled={isSubmitting} type="submit">
									{isSubmitting ? 'Creating...' : 'Create Application'}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				)}
			</DialogContent>
		</Dialog>
	)
}
