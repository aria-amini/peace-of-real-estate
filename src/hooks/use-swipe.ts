import { useCallback, useEffect, useRef } from 'react'

export function useSwipe({
	onSwipeLeft,
	onSwipeRight,
	threshold = 50,
	isEnabled = true,
}: {
	onSwipeLeft: () => void
	onSwipeRight: () => void
	threshold?: number
	isEnabled?: boolean
}) {
	const touchStartX = useRef<number | null>(null)
	const touchStartY = useRef<number | null>(null)

	const handleTouchStart = useCallback(
		(e: TouchEvent) => {
			if (!isEnabled) return
			touchStartX.current = e.touches[0]?.clientX ?? null
			touchStartY.current = e.touches[0]?.clientY ?? null
		},
		[isEnabled],
	)

	const handleTouchEnd = useCallback(
		(e: TouchEvent) => {
			if (!isEnabled) return
			if (touchStartX.current == null || touchStartY.current == null) return

			const touchEndX = e.changedTouches[0]?.clientX ?? 0
			const touchEndY = e.changedTouches[0]?.clientY ?? 0

			const diffX = touchStartX.current - touchEndX
			const diffY = touchStartY.current - touchEndY

			// Only handle horizontal swipes (ignore vertical scrolling)
			if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
				if (diffX > 0) {
					onSwipeLeft()
				} else {
					onSwipeRight()
				}
			}

			touchStartX.current = null
			touchStartY.current = null
		},
		[isEnabled, onSwipeLeft, onSwipeRight, threshold],
	)

	useEffect(() => {
		window.addEventListener('touchstart', handleTouchStart, { passive: true })
		window.addEventListener('touchend', handleTouchEnd, { passive: true })
		return () => {
			window.removeEventListener('touchstart', handleTouchStart)
			window.removeEventListener('touchend', handleTouchEnd)
		}
	}, [handleTouchStart, handleTouchEnd])
}
