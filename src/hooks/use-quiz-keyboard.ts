import { useCallback, useEffect } from 'react'

export function useQuizKeyboard({
	onNext,
	onPrev,
	onSelect,
	optionCount,
	isEnabled = true,
}: {
	onNext: () => void
	onPrev: () => void
	onSelect: (index: number) => void
	optionCount: number
	isEnabled?: boolean
}) {
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (!isEnabled) return

			// Number keys 1-9 to select options
			if (e.key >= '1' && e.key <= '9') {
				const index = Number.parseInt(e.key, 10) - 1
				if (index < optionCount) {
					e.preventDefault()
					onSelect(index)
				}
				return
			}

			// Arrow right or Enter to go next
			if (e.key === 'ArrowRight' || e.key === 'Enter') {
				e.preventDefault()
				onNext()
				return
			}

			// Arrow left to go back
			if (e.key === 'ArrowLeft') {
				e.preventDefault()
				onPrev()
				return
			}
		},
		[isEnabled, onNext, onPrev, onSelect, optionCount],
	)

	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [handleKeyDown])
}
