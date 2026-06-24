import { seedCityData } from './seed-city-data'

async function seedReferenceData() {
	console.log('Seeding reference data...')
	await seedCityData()
	console.log('Reference data seeded successfully.')
}

seedReferenceData()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('Reference data seed failed:', error)
		process.exit(1)
	})
