import { test } from './__fixtures__/app'

test.setTimeout(30_000)

test('consumer can complete onboarding flow', async ({ page }) => {
	await page.goto('/')
	await page.getByRole('link', { name: 'Find Your Agent' }).click()
	await page.getByRole('slider').nth(1).fill('5')
	await page.getByRole('link', { name: 'Continue to Questions' }).click()
	await page.getByRole('button', { name: '$1.5M and above' }).click()
	await page.getByRole('button', { name: 'Within 3 months - I have a' }).click()
	await page.getByRole('button', { name: 'Single-family home' }).click()
	await page.getByRole('button', { name: 'This is my first time - I' }).click()
	await page
		.getByRole('button', { name: 'A trusted advisor who stays' })
		.click()
	await page.getByRole('button', { name: 'Text - fast, easy, I can' }).click()
	await page.getByRole('button', { name: 'Email - I like having' }).click()
	await page.getByRole('button', { name: 'The numbers - show me the' }).click()
	await page
		.getByRole('button', { name: 'Give me the facts and options' })
		.click()
	await page.getByRole('button', { name: 'Market expert - know this' }).click()
	await page
		.getByRole('button', { name: 'Calm & low-drama - keeps it' })
		.click()
	await page.getByRole('button', { name: 'Very involved - I want to' }).click()
	await page
		.getByRole('button', { name: 'An agent whose broad market' })
		.click()
	await page.getByRole('button', { name: 'Within 10 minutes - I need' }).click()
	await page
		.getByRole('button', { name: 'I plan to negotiate - I have' })
		.click()
	await page.getByRole('link', { name: 'View Your Matches' }).click()
	await page.getByRole('link', { name: 'Sign up to see results' }).click()
})
