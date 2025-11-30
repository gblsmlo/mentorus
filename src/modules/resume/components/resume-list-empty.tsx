import { Card, CardContent } from '@/components/ui/card'

export function ResumeListEmpty() {
	return (
		<Card>
			<CardContent>
				<div className="space-y-4 text-center">
					<div>
						<h3 className="font-semibold text-lg">No resumes yet</h3>
						<p className="text-muted-foreground text-sm">
							Create your first resume to get started with ATS analysis
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
