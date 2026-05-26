import {
	createRootRoute,
	createRoute,
	createRouter,
	RouterContextProvider,
} from '@tanstack/react-router'
import { render } from 'vitest-browser-react'
import { page, userEvent } from 'vite-plus/test/browser'

import { expect, test } from '@config/test/browser'
import { QuestionFlow } from './question-flow'

function createMockRouter() {
	const rootRoute = createRootRoute()
	const indexRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: '/',
	})

	return createRouter({
		routeTree: rootRoute.addChildren([indexRoute]),
	})
}

function MockRouter({ children }: { children: React.ReactNode }) {
	return (
		<RouterContextProvider router={createMockRouter()}>
			{children}
		</RouterContextProvider>
	)
}

test('question flow auto-advances and completes on final answer', async () => {
	await render(
		<QuestionFlow
			completeTo="/done"
			completeLabel="View Matches"
			questions={[
				{
					id: 'q1',
					number: 1,
					category: 'Working Style',
					prompt: 'How fast should your agent reply?',
					options: ['Same day', 'Within 24 hours'],
				},
				{
					id: 'q2',
					number: 2,
					category: 'Fit',
					prompt: 'Anything else to share?',
					inputType: 'open-text',
				},
			]}
		/>,
		{ wrapper: MockRouter },
	)

	await userEvent.click(page.getByRole('button', { name: /same day/i }))

	await expect.element(page.getByText('Question 2 of 2')).toBeVisible()
	await expect
		.element(page.getByPlaceholder(/share a few details/i))
		.toBeVisible()

	await userEvent.fill(
		page.getByPlaceholder(/share a few details/i),
		'Need calm guidance.',
	)
	await expect
		.element(page.getByRole('link', { name: /view matches/i }))
		.toBeVisible()
	await expect
		.element(page.getByRole('button', { name: /previous/i }))
		.toBeEnabled()
	await expect.element(page.getByText('100%')).toBeVisible()
})

test('question flow supports multi-select before completion', async () => {
	await render(
		<QuestionFlow
			completeTo="/done"
			completeLabel="Finish"
			questions={[
				{
					id: 'q1',
					number: 1,
					categories: ['Communication', 'Transparency'],
					prompt: 'Pick two priorities',
					options: ['Clarity', 'Speed', 'Proactive updates'],
					selection: {
						type: 'multiple',
						maxSelections: 2,
					},
				},
			]}
		/>,
		{ wrapper: MockRouter },
	)

	await expect.element(page.getByText('0 of 2 selected')).toBeVisible()
	await expect
		.element(page.getByText('Select up to 2 answers to continue.'))
		.toBeVisible()
	await expect
		.element(page.getByRole('button', { name: /finish/i }))
		.toBeDisabled()

	await expect
		.element(page.getByRole('link', { name: /finish/i }))
		.not.toBeInTheDocument()
	await userEvent.click(page.getByRole('button', { name: /clarity/i }))
	await expect.element(page.getByText('1 of 2 selected')).toBeVisible()
	await expect
		.element(page.getByRole('link', { name: /finish/i }))
		.toBeVisible()
	await userEvent.click(page.getByRole('button', { name: /speed/i }))
	await expect.element(page.getByText('100%')).toBeVisible()
	await expect.element(page.getByText('2 of 2 selected')).toBeVisible()
	await expect
		.element(page.getByRole('link', { name: /finish/i }))
		.toBeVisible()
	await expect
		.element(page.getByRole('button', { name: /finish/i }))
		.not.toBeInTheDocument()
})

test('question flow shows continue when user goes back to answered question', async () => {
	await render(
		<QuestionFlow
			completeTo="/done"
			completeLabel="Finish"
			initialQuestionIndex={2}
			initialAnswers={{ q1: 0, q2: 1 }}
			questions={[
				{
					id: 'q1',
					number: 1,
					category: 'Working Style',
					prompt: 'Question one',
					options: ['A', 'B'],
				},
				{
					id: 'q2',
					number: 2,
					category: 'Communication',
					prompt: 'Question two',
					options: ['A', 'B'],
				},
				{
					id: 'q3',
					number: 3,
					category: 'Fit',
					prompt: 'Question three',
					options: ['A', 'B'],
				},
			]}
		/>,
		{ wrapper: MockRouter },
	)

	await expect.element(page.getByText('Question 3 of 3')).toBeVisible()
	await userEvent.click(
		page.getByRole('button', { name: /previous question/i }),
	)
	await expect.element(page.getByText('Question 2 of 3')).toBeVisible()
	await expect
		.element(page.getByRole('button', { name: /continue/i }))
		.toBeVisible()
	await expect
		.element(page.getByRole('button', { name: /continue/i }))
		.toBeEnabled()
	await userEvent.click(page.getByRole('button', { name: /continue/i }))
	await expect.element(page.getByText('Question 3 of 3')).toBeVisible()
})

test('clicking selected multi-select option deselects it', async () => {
	await render(
		<QuestionFlow
			completeTo="/done"
			completeLabel="Finish"
			questions={[
				{
					id: 'q1',
					number: 1,
					categories: ['Communication', 'Transparency'],
					prompt: 'Pick two priorities',
					options: ['Clarity', 'Speed', 'Proactive updates'],
					selection: {
						type: 'multiple',
						maxSelections: 2,
					},
				},
			]}
		/>,
		{ wrapper: MockRouter },
	)

	await userEvent.click(page.getByRole('button', { name: /clarity/i }))
	await expect.element(page.getByText('1 of 2 selected')).toBeVisible()
	await userEvent.click(page.getByRole('button', { name: /clarity/i }))
	await expect.element(page.getByText('0 of 2 selected')).toBeVisible()
	await expect
		.element(page.getByRole('button', { name: /finish/i }))
		.toBeDisabled()
})
