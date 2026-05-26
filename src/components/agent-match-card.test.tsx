import { render } from 'vitest-browser-react'
import { page } from 'vite-plus/test/browser'

import { expect, test } from '@config/test/browser'
import { AgentMatchCard, type AgentMatch } from './agent-match-card'

const match: AgentMatch = {
	id: 1,
	name: 'Sarah Chen',
	agency: 'Horizon Realty Group',
	location: 'Austin, TX',
	overall: 4.8,
	scores: {
		'Working Style': 4.9,
		Communication: 4.7,
		Transparency: 4.8,
		Fit: 4.9,
	},
	experience: '12 years',
	specialties: ['First-time buyers', 'Luxury homes'],
	about: 'Known for patient guidance and transparent communication.',
	topMatch: true,
}

test('agent match card renders fit details and select CTA', async () => {
	await render(<AgentMatchCard match={match} index={0} />)

	await expect.element(page.getByText('Top Match')).toBeVisible()
	await expect.element(page.getByText('SC')).toBeVisible()
	await expect.element(page.getByText('Horizon Realty Group')).toBeVisible()
	await expect.element(page.getByText('Overall Fit')).toBeVisible()
	await expect.element(page.getByText(/^Communication$/)).toBeVisible()
	await expect.element(page.getByText('Fit Breakdown')).toBeVisible()
	await expect.element(page.getByText('Working Style')).toBeVisible()
	await expect.element(page.getByText('Peace Pact signed')).toBeVisible()
	await expect
		.element(page.getByRole('button', { name: /select agent/i }))
		.toBeVisible()
})

test('agent match card hides top badge when not top match', async () => {
	await render(
		<AgentMatchCard match={{ ...match, topMatch: false }} index={1} />,
	)

	await expect.element(page.getByText('Sarah Chen')).toBeVisible()
	await expect.element(page.getByText('Austin, TX')).toBeVisible()
	await expect.element(page.getByText('12 years')).toBeVisible()
	await expect.element(page.getByText('First-time buyers')).toBeVisible()
	await expect.element(page.getByText('Top Match')).not.toBeInTheDocument()
	await expect
		.element(page.getByRole('button', { name: /select agent/i }))
		.toBeVisible()
})
