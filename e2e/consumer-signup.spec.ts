import { expect, test } from './fixtures'
import type { Page, Response } from '@playwright/test'

// =============================================================================
// Config
// =============================================================================

const BETA_PASSWORD = process.env.BETA_PASSWORD ?? 'test123'

function makeTestUser() {
	const timestamp = Date.now()
	const random = Math.random().toString(36).slice(2, 8)

	return {
		name: 'E2E Test Consumer',
		email: `e2e-signup-${timestamp}-${random}@example.com`,
		password: 'TestPassword123!',
	}
}

// =============================================================================
// Helpers
// =============================================================================

async function unlockBeta(page: Page) {
	await page.goto('/beta')

	const passwordInput = page.getByPlaceholder('Enter invite password')
	await expect(passwordInput).toBeVisible({ timeout: 10000 })

	await passwordInput.fill(BETA_PASSWORD)
	const responsePromise = page.waitForResponse((response: Response) =>
		response.url().includes('/api/beta/auth'),
	)
	await page.getByRole('button', { name: /Unlock Preview/i }).click()
	await responsePromise

	await expect(page).toHaveURL('/')
}

async function completeIntake(page: Page) {
	await page.goto('/consumer/intake?reset=true')
	await expect(page.getByRole('heading', { name: 'Your Home' })).toBeVisible()

	await page.getByRole('button', { name: /Location/i }).click()
	await page
		.getByPlaceholder('Search city, state, or ZIP...')
		.fill('Austin, TX')
	await page.getByRole('option', { name: 'Austin, TX' }).first().click()

	await page.getByRole('button', { name: /Under \$400k/i }).click()
	await page.getByRole('button', { name: /Single-Family/i }).click()
	await page.getByRole('button', { name: /Continue/i }).click()

	await expect(
		page.getByRole('heading', { name: 'Your Situation' }),
	).toBeVisible()
	await page.getByRole('button', { name: /Buy/i }).click()
	await page.getByRole('button', { name: /First-time client/i }).click()
	await page.getByRole('button', { name: /Continue/i }).click()

	await expect(
		page.getByText('Preferred method of communication?'),
	).toBeVisible()
	await page.getByRole('button', { name: /Text/i }).click()
	await page.getByText('Involvement level?').waitFor()
	await page.getByRole('button', { name: /Very involved/i }).click()
	await page
		.getByText('When it comes to choosing an agent, which matters more to you?')
		.waitFor()
	await page.getByRole('button', { name: /Exclusive representation/i }).click()
	await page
		.getByText('How do you plan to handle commissions with your agent?')
		.waitFor()
	await page.getByRole('button', { name: /I'm new, explain it to me/i }).click()

	await expect(
		page.getByRole('heading', { name: 'Your Profile' }),
	).toBeVisible()
}

async function signUpWithEmail(
	page: Page,
	testUser: ReturnType<typeof makeTestUser>,
) {
	await page.getByPlaceholder('Jordan Lee').fill(testUser.name)
	await page.getByPlaceholder('you@example.com').fill(testUser.email)
	await page.getByPlaceholder('Choose a password').fill(testUser.password)
	await page.getByRole('button', { name: /Create my account/i }).click()
}

// =============================================================================
// Tests
// =============================================================================

test.describe('E2E smoke: signup flow against BASE_URL', () => {
	test('deployment: BASE_URL is reachable and serves the app', async ({
		request,
	}) => {
		const home = await request.get('/')
		expect(home.ok()).toBeTruthy()
		expect(await home.text()).toContain('Peace of Real Estate')

		const health = await request.get('/api/health')
		expect(health.ok()).toBeTruthy()
		expect(await health.json()).toEqual({ ok: true })
	})

	test('consumer can sign up with email and land on matches', async ({
		page,
		cleanupUser,
	}) => {
		const testUser = makeTestUser()
		cleanupUser.email = testUser.email

		await unlockBeta(page)
		await completeIntake(page)

		await signUpWithEmail(page, testUser)

		// This succeeding implicitly proves:
		// - the deployment is up and reachable
		// - the auth backend created a session
		// - the database persisted the user and profile
		// - the frontend redirects correctly
		await expect(page).toHaveURL('/matches', { timeout: 15000 })
		await expect(page.getByText('Your Top Matches')).toBeVisible()

		// A returning signed-in user should be redirected away from intake.
		await page.goto('/consumer/intake?step=intro')
		await expect(page).toHaveURL('/matches', { timeout: 15000 })
	})

	test('Google sign-in button redirects to Google OAuth', async ({ page }) => {
		await unlockBeta(page)
		await completeIntake(page)

		const googleButton = page.getByRole('button', {
			name: /Continue with Google/i,
		})
		await expect(googleButton).toBeVisible()

		await googleButton.click()

		// Better Auth will either redirect to Google (configured) or surface a
		// toast explaining the provider is not configured. Both outcomes prove
		// the frontend is wired to the auth backend.
		await Promise.race([
			page.waitForURL(/accounts\.google\.com/, { timeout: 10000 }),
			page
				.getByText('Google login is not configured yet')
				.waitFor({ timeout: 10000 }),
		])

		const currentUrl = page.url()
		const redirectedToGoogle = currentUrl.includes('accounts.google.com')
		const notConfigured = await page
			.getByText('Google login is not configured yet')
			.isVisible()
			.catch(() => false)

		expect(redirectedToGoogle || notConfigured).toBe(true)
	})
})
