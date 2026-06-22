import { useEffect, useState } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { ZipCodeMapProps } from './zip-code-map-inner'

export { type ZipCodeMapProps }

export function ZipCodeMap(props: ZipCodeMapProps) {
	const [Inner, setInner] =
		useState<React.ComponentType<ZipCodeMapProps> | null>(null)

	useEffect(() => {
		let cancelled = false

		void import('./zip-code-map-inner').then((module) => {
			if (cancelled) return
			setInner(() => module.ZipCodeMapInner)
		})

		return () => {
			cancelled = true
		}
	}, [])

	if (!Inner) {
		return <ZipCodeMapSkeleton className={props.className} />
	}

	return <Inner {...props} />
}

function ZipCodeMapSkeleton({ className }: { className?: string | undefined }) {
	return (
		<div
			className={cn(
				'relative min-h-64 overflow-hidden rounded-2xl border',
				className,
			)}
		>
			<Skeleton className="absolute inset-0" />
		</div>
	)
}
