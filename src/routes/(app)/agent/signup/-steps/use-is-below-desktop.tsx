import { useEffect, useState } from 'react'

export function useIsBelowDesktop() {
	const [isBelowDesktop, setIsBelowDesktop] = useState(false)

	useEffect(() => {
		const mediaQuery = window.matchMedia('(max-width: 1023px)')
		const update = () => setIsBelowDesktop(mediaQuery.matches)

		update()
		mediaQuery.addEventListener('change', update)
		return () => mediaQuery.removeEventListener('change', update)
	}, [])

	return isBelowDesktop
}
