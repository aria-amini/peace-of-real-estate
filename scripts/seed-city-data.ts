import { db } from '../src/db/connection'
import { cities, cityZips } from '../src/db/tables'
import * as zipcodes from 'zipcodes'

async function seedCityData() {
	const now = new Date()

	console.log('Seeding cities and city_zips...')

	const cityGroups = new Map<
		string,
		{
			city: string
			state: string
			lats: number[]
			lngs: number[]
			zips: string[]
		}
	>()

	for (const record of Object.values(zipcodes.codes)) {
		if (record.country !== 'US') continue
		const key = `${record.city}|${record.state}`
		let group = cityGroups.get(key)
		if (!group) {
			group = {
				city: record.city,
				state: record.state,
				lats: [],
				lngs: [],
				zips: [],
			}
			cityGroups.set(key, group)
		}
		if (
			typeof record.latitude === 'number' &&
			typeof record.longitude === 'number'
		) {
			group.lats.push(record.latitude)
			group.lngs.push(record.longitude)
		}
		group.zips.push(record.zip)
	}

	const cityRows = []
	const zipRows = []
	for (const group of cityGroups.values()) {
		const id = crypto.randomUUID()
		const centerLat =
			group.lats.length > 0
				? String(group.lats.reduce((a, b) => a + b, 0) / group.lats.length)
				: '0'
		const centerLng =
			group.lngs.length > 0
				? String(group.lngs.reduce((a, b) => a + b, 0) / group.lngs.length)
				: '0'

		cityRows.push({
			id,
			city: group.city,
			state: group.state,
			centerLat,
			centerLng,
			createdAt: now,
		})

		for (const zip of group.zips) {
			zipRows.push({
				id: crypto.randomUUID(),
				city: group.city,
				state: group.state,
				zip,
				createdAt: now,
			})
		}
	}

	await db.delete(cityZips)
	await db.delete(cities)

	const CITY_BATCH = 1000
	for (let i = 0; i < cityRows.length; i += CITY_BATCH) {
		await db.insert(cities).values(cityRows.slice(i, i + CITY_BATCH))
		console.log(
			`  cities ${Math.min(i + CITY_BATCH, cityRows.length)}/${cityRows.length}`,
		)
	}

	const ZIP_BATCH = 2000
	for (let i = 0; i < zipRows.length; i += ZIP_BATCH) {
		await db.insert(cityZips).values(zipRows.slice(i, i + ZIP_BATCH))
		console.log(
			`  city_zips ${Math.min(i + ZIP_BATCH, zipRows.length)}/${zipRows.length}`,
		)
	}

	console.log(
		`Done. Seeded ${cityRows.length} cities and ${zipRows.length} city ZIP mappings.`,
	)
}

seedCityData()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('City seed failed:', error)
		process.exit(1)
	})
