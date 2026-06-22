import { and, eq, ilike, or, sql } from 'drizzle-orm'
import { createServerFn } from '@tanstack/react-start'

import { getDb } from '@/db/connection'
import { cities, cityZips } from '@/db/tables'
import type { FeatureCollection } from 'geojson'

const TIGERWEB_ZCTA_URL =
	'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer/2/query'

const BATCH_SIZE = 50
const MAX_ZIPS = 200

const TOP_US_CITIES = [
	'New York, NY',
	'Los Angeles, CA',
	'Chicago, IL',
	'Houston, TX',
	'Phoenix, AZ',
	'Philadelphia, PA',
	'San Antonio, TX',
	'San Diego, CA',
	'Dallas, TX',
	'Jacksonville, FL',
]

type CityState = {
	city: string
	state: string
}

async function fetchZipBoundaryBatch(
	zipCodes: string[],
): Promise<FeatureCollection> {
	const list = zipCodes.map((zipCode) => `'${zipCode}'`).join(',')
	const url = new URL(TIGERWEB_ZCTA_URL)
	url.searchParams.set('where', `ZCTA5 IN (${list})`)
	url.searchParams.set('outFields', 'ZCTA5,BASENAME')
	url.searchParams.set('returnGeometry', 'true')
	url.searchParams.set('f', 'geojson')
	url.searchParams.set('outSR', '4326')
	url.searchParams.set('geometryPrecision', '4')
	url.searchParams.set('maxAllowableOffset', '0.0005')

	const response = await fetch(url)
	if (!response.ok) {
		throw new Error(
			`TIGERweb request failed with status ${response.status}: ${await response.text()}`,
		)
	}

	return response.json() as Promise<FeatureCollection>
}

function buildTopCitiesWhereClause() {
	const values = TOP_US_CITIES.map((city) => `'${city}'`).join(', ')
	return sql`${cities.city} || ', ' || ${cities.state} in (${sql.raw(values)})`
}

const loadCitySuggestionsServer = createServerFn({ method: 'GET' })
	.inputValidator((query: string) => query)
	.handler(async ({ data }) => {
		const normalizedQuery = data.trim().toLowerCase()
		if (normalizedQuery.length < 2) {
			const topCities = await getDb()
				.select({
					label: sql<string>`concat(${cities.city}, ', ', ${cities.state})`,
				})
				.from(cities)
				.where(buildTopCitiesWhereClause())
				.orderBy(cities.city)
				.limit(10)

			return topCities.map((row) => row.label)
		}

		const matches = await getDb()
			.select({
				label: sql<string>`concat(${cities.city}, ', ', ${cities.state})`,
			})
			.from(cities)
			.where(
				or(
					ilike(cities.city, `%${normalizedQuery}%`),
					ilike(cities.state, `${normalizedQuery}%`),
					ilike(
						sql`${cities.city} || ', ' || ${cities.state}`,
						`%${normalizedQuery}%`,
					),
				),
			)
			.orderBy(cities.city)
			.limit(10)

		return matches.map((row) => row.label)
	})

const loadCityZipCodesServer = createServerFn({ method: 'GET' })
	.inputValidator((data: CityState) => data)
	.handler(async ({ data }) => {
		const rows = await getDb()
			.select({ zip: cityZips.zip })
			.from(cityZips)
			.where(and(eq(cityZips.city, data.city), eq(cityZips.state, data.state)))
			.orderBy(cityZips.zip)

		return rows.map((row) => row.zip)
	})

const loadCityCenterServer = createServerFn({ method: 'GET' })
	.inputValidator((data: CityState) => data)
	.handler(async ({ data }) => {
		const [row] = await getDb()
			.select({ centerLat: cities.centerLat, centerLng: cities.centerLng })
			.from(cities)
			.where(and(eq(cities.city, data.city), eq(cities.state, data.state)))
			.limit(1)

		if (!row) return undefined
		const latitude = Number.parseFloat(row.centerLat)
		const longitude = Number.parseFloat(row.centerLng)
		if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
			return undefined
		}
		return { latitude, longitude }
	})

const loadZipCodeBoundariesServer = createServerFn({ method: 'GET' })
	.inputValidator((data: CityState) => data)
	.handler(async ({ data }) => {
		const zipRows = await getDb()
			.select({ zip: cityZips.zip })
			.from(cityZips)
			.where(and(eq(cityZips.city, data.city), eq(cityZips.state, data.state)))
			.orderBy(cityZips.zip)
			.limit(MAX_ZIPS)

		const zipCodes = zipRows.map((row) => row.zip)

		if (zipCodes.length === 0) {
			return {
				type: 'FeatureCollection',
				features: [],
			} satisfies FeatureCollection
		}

		const batches: string[][] = []
		for (let index = 0; index < zipCodes.length; index += BATCH_SIZE) {
			batches.push(zipCodes.slice(index, index + BATCH_SIZE))
		}

		const results = await Promise.all(batches.map(fetchZipBoundaryBatch))

		return {
			type: 'FeatureCollection',
			features: results.flatMap((collection) => collection.features),
		} satisfies FeatureCollection
	})

export async function loadCitySuggestions(query: string) {
	return loadCitySuggestionsServer({ data: query })
}

export async function loadCityZipCodes(input: CityState) {
	return loadCityZipCodesServer({ data: input })
}

export async function loadCityCenter(input: CityState) {
	return loadCityCenterServer({ data: input })
}

export async function loadZipCodeBoundaries(input: CityState) {
	return loadZipCodeBoundariesServer({ data: input })
}
