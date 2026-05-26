import { createFileRoute } from '@tanstack/react-router'
import { LandingPage } from '@/components/landing-page'
import themeCss from '@/themes/theme5.css?url'

export const Route = createFileRoute('/_app/theme5')({
	head: () => ({
		meta: [{ title: 'Peace of Real Estate - Theme 5: Midnight Harbor' }],
		links: [{ rel: 'stylesheet', href: themeCss }],
	}),
	component: LandingPage,
})
