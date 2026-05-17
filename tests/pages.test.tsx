import { test } from '@aamini/config/test/browser'
import type { ComponentType } from 'react'

import './__mocks__/browser-mocks'

import { Route as AgentPrioritiesRoute } from '@/routes/agent/priorities'
import { Route as AgentProfileRoute } from '@/routes/agent/profile'
import { Route as AgentQuizRoute } from '@/routes/agent/quiz'
import { Route as BetaRoute } from '@/routes/beta'
import { Route as ConsumerPrioritiesRoute } from '@/routes/consumer/priorities'
import { Route as ConsumerQuizRoute } from '@/routes/consumer/quiz'
import { Route as ConsumerResultsRoute } from '@/routes/consumer/results'
import { Route as HomeRoute } from '@/routes/index'
import { Route as LoginRoute } from '@/routes/login'
import { Route as MatchActivityRoute } from '@/routes/match-activity'
import { Route as SignupRoute } from '@/routes/signup'

import { expectPageScreenshot } from './__mocks__/visual-page'

const pages = [
	{
		name: 'home',
		path: '/',
		component: HomeRoute.options.component as ComponentType,
		heading: /the most expensive decision of your life, made right/i,
	},
	{
		name: 'consumer-priorities',
		path: '/consumer/priorities',
		component: ConsumerPrioritiesRoute.options.component as ComponentType,
		heading: /set your priorities/i,
	},
	{
		name: 'consumer-quiz',
		path: '/consumer/quiz',
		component: ConsumerQuizRoute.options.component as ComponentType,
		heading: /in what price range are you looking to buy/i,
	},
	{
		name: 'consumer-results',
		path: '/consumer/results',
		component: ConsumerResultsRoute.options.component as ComponentType,
		heading: /your matches/i,
	},
	{
		name: 'agent-priorities',
		path: '/agent/priorities',
		component: AgentPrioritiesRoute.options.component as ComponentType,
		heading: /agent onboarding/i,
	},
	{
		name: 'agent-quiz',
		path: '/agent/quiz',
		component: AgentQuizRoute.options.component as ComponentType,
		heading: /which side of the transaction do you primarily represent/i,
	},
	{
		name: 'agent-profile',
		path: '/agent/profile',
		component: AgentProfileRoute.options.component as ComponentType,
		heading: /create your profile/i,
	},
	{
		name: 'match-activity',
		path: '/match-activity',
		component: MatchActivityRoute.options.component as ComponentType,
		heading: /sarah chen/i,
	},
	{
		name: 'login',
		path: '/login',
		component: LoginRoute.options.component as ComponentType,
		heading: /welcome back/i,
		setup: () => {
			;(LoginRoute as unknown as { useSearch: () => object }).useSearch =
				() => ({})
		},
	},
	{
		name: 'signup',
		path: '/signup',
		component: SignupRoute.options.component as ComponentType,
		heading: /create your account/i,
		setup: () => {
			;(SignupRoute as unknown as { useSearch: () => object }).useSearch =
				() => ({})
		},
	},
	{
		name: 'beta',
		path: '/beta',
		component: BetaRoute.options.component as ComponentType,
		heading: /under construction/i,
	},
] as const

test.each(pages)(
	'$name page matches desktop screenshot',
	async (visualPage) => {
		await expectPageScreenshot({
			...visualPage,
			waitFor: (screen) =>
				screen.getByRole('heading', { name: visualPage.heading }),
		})
	},
)
