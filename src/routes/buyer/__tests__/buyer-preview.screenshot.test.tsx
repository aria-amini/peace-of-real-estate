import '@tests/__mocks__/browser'

import { test } from '@config/test/browser'
import { saveStoredConsumerDraftForFlow } from '@/lib/matching/intake-draft'

import { expectRouteScreenshot } from '@tests/utils/file-routes'

test('buyer preview matches desktop screenshot', async () => {
	await expectRouteScreenshot({
		path: '/buyer/preview',
		name: 'buyer-preview',
		setup: () => {
			saveStoredConsumerDraftForFlow('buyer', {
				zipCode: '78704',
				state: 'TX',
				intent: 'Buy',
				priceRange: '$400k to $750k',
				propertyType: ['Single-Family'],
				experienceLevel: 'First-time client',
				answers: {
					'B.1': 1,
					'B.3': [0],
					'B.4': 0,
					'B.6': 0,
					'B.8': 0,
					'B.9': 0,
					'B.11': 0,
					'B.12': 0,
					'B.14': 0,
				},
			})
		},
	})
}, 10_000)
