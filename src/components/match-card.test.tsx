import { render } from 'vitest-browser-react'
import { page } from 'vite-plus/test/browser'

import { expect, test } from '@config/test/browser'
import { MatchCard, type MatchDetails } from './match-card'

const baseMatch: MatchDetails = {
	id: 'agent-1',
	name: 'Sarah Chen',
	role: 'agent',
	location: 'Austin, TX',
	zipCodes: ['78701', '78702'],
	fitScore: 96,
	status: 'new',
	date: '2026-04-21',
	experience: '12 years',
	agency: 'Horizon Realty Group',
	specialties: ['First-time buyers', 'Luxury homes'],
	about: 'Known for patient guidance and transparent communication.',
	scores: {
		'Working Style': 4.9,
		Communication: 4.7,
		Transparency: 4.8,
		Fit: 4.9,
	},
	contact: {
		phone: '555-123-4567',
		email: 'sarah@horizon.com',
	},
	stats: {
		transactions: 243,
		avgDays: 16,
		satisfaction: 4.8,
	},
	isTopMatch: true,
}

test('match card renders top match with all details', async () => {
	const { container } = await render(
		<div className="mx-auto max-w-2xl p-4">
			<MatchCard match={baseMatch} />
		</div>,
	)

	await expect.element(page.getByText('Sarah Chen')).toBeVisible()
	await expect.element(page.getByText('Top')).toBeVisible()
	await expect.element(page.getByText('96')).toBeVisible()
	await expect
		.element(page.getByRole('button', { name: 'Accept' }))
		.toBeVisible()

	await expect.element(container).toMatchScreenshot('match-card-top-match.png')
})

test('match card renders non-top match', async () => {
	const { container } = await render(
		<div className="mx-auto max-w-2xl p-4">
			<MatchCard match={{ ...baseMatch, isTopMatch: false, fitScore: 82 }} />
		</div>,
	)

	await expect.element(page.getByText('Sarah Chen')).toBeVisible()
	await expect.element(page.getByText('Top')).not.toBeInTheDocument()

	await expect.element(container).toMatchScreenshot('match-card-regular.png')
})

test('match card renders pending status', async () => {
	const { container } = await render(
		<div className="mx-auto max-w-2xl p-4">
			<MatchCard
				match={{ ...baseMatch, status: 'pending', isTopMatch: false }}
			/>
		</div>,
	)

	await expect
		.element(page.getByRole('button', { name: 'Profile' }))
		.toBeVisible()

	await expect.element(container).toMatchScreenshot('match-card-pending.png')
})
