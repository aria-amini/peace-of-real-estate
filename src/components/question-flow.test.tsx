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

	await expect.element(page.getByText('2 of 2')).toBeVisible()
	await expect
		.element(page.getByPlaceholder(/share a few details/i))
		.toBeVisible()

	await userEvent.fill(
		page.getByPlaceholder(/share a few details/i),
		'Need calm guidance.',
	)

	// Right arrow should be enabled now that text is entered
	await expect
		.element(page.getByRole('button', { name: /next question/i }))
		.toBeEnabled()
	await expect
		.element(page.getByRole('button', { name: /previous question/i }))
		.toBeEnabled()
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

	await expect.element(page.getByText(/select up to 2 answers/i)).toBeVisible()
	await expect
		.element(page.getByRole('button', { name: /finish/i }))
		.not.toBeInTheDocument()
	await expect
		.element(page.getByRole('link', { name: /finish/i }))
		.not.toBeInTheDocument()

	await userEvent.click(page.getByRole('button', { name: /clarity/i }))
	await expect
		.element(page.getByRole('link', { name: /finish/i }))
		.not.toBeInTheDocument()
	await userEvent.click(page.getByRole('button', { name: /speed/i }))
	// After selecting 2, it should auto-complete and navigate
	await expect
		.element(page.getByRole('link', { name: /finish/i }))
		.not.toBeInTheDocument()
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

	await expect.element(page.getByText('3 of 3')).toBeVisible()
	await userEvent.click(
		page.getByRole('button', { name: /previous question/i }),
	)
	await expect.element(page.getByText('2 of 3')).toBeVisible()
	// Right arrow (next) should be enabled since this question was already answered
	await expect
		.element(page.getByRole('button', { name: /next question/i }))
		.toBeEnabled()
	await userEvent.click(page.getByRole('button', { name: /next question/i }))
	await expect.element(page.getByText('3 of 3')).toBeVisible()
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

	const clarityButton = page.getByRole('button', { name: /clarity/i })
	await userEvent.click(clarityButton)
	// Clarity should be selected
	await expect.element(clarityButton).toHaveClass(/border-primary/)
	await userEvent.click(clarityButton)
	// Clarity should be deselected
	await expect.element(clarityButton).not.toHaveClass(/border-primary/)
})
