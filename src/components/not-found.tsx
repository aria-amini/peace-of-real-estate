import { Link } from '@tanstack/react-router'
import { Compass, ArrowLeft, MapPin } from 'lucide-react'

export function NotFoundComponent() {
	return (
		<div className="flex flex-1 flex-col items-center justify-center px-6 py-24">
			<div className="relative mx-auto max-w-xl text-center">
				{/* Decorative grid lines */}
				<div className="grid-pattern absolute inset-0 -z-10 opacity-[0.15]" />

				{/* Icon with border */}
				<div className="border-border bg-card mx-auto mb-8 flex h-16 w-16 items-center justify-center border">
					<Compass className="text-muted-foreground h-8 w-8" />
				</div>

				{/* Error code */}
				<div className="data-label mb-4">Error 404</div>

				{/* Heading */}
				<h1 className="mb-6 font-serif text-4xl font-normal tracking-tight md:text-5xl">
					Page Not Found
				</h1>

				{/* Description */}
				<p className="text-muted-foreground mx-auto mb-10 max-w-md text-lg leading-relaxed">
					The page you're looking for doesn't exist or has been moved. Let's get
					you back on track.
				</p>

				{/* Actions */}
				<div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
					<Link to="/" className="btn-primary inline-flex items-center gap-2">
						<ArrowLeft className="h-4 w-4" />
						Back to Home
					</Link>
					<Link
						to="/consumer/priorities"
						className="btn-secondary inline-flex items-center gap-2"
					>
						<MapPin className="h-4 w-4" />
						Find an Agent
					</Link>
				</div>
			</div>
		</div>
	)
}
