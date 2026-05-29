import { Link } from '@tanstack/react-router'
import { Compass, ArrowLeft, MapPin } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function NotFoundComponent() {
	return (
		<div className="flex flex-1 flex-col items-center justify-center px-6 py-24">
			<Card className="mx-auto max-w-xl text-center">
				<CardContent>
					<div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center">
						<Compass className="h-8 w-8" />
					</div>
					<div className="text-muted-foreground mb-4 text-sm">Error 404</div>
					<h1 className="mb-6 text-4xl md:text-5xl">Page Not Found</h1>
					<p className="text-muted-foreground mx-auto mb-10 max-w-md text-lg leading-relaxed">
						The page you're looking for doesn't exist or has been moved. Let's
						get you back on track.
					</p>
					<div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
						<Button asChild>
							<Link to="/">
								<ArrowLeft className="h-4 w-4" />
								Back to Home
							</Link>
						</Button>
						<Button asChild variant="secondary">
							<Link to="/agent/priorities">
								<MapPin className="h-4 w-4" />
								Find an Agent
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
