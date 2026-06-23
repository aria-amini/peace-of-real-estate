import 'maplibre-gl/dist/maplibre-gl.css'

import { useEffect, useRef, useState } from 'react'
import Map, { Layer, Source } from 'react-map-gl/maplibre'
import type {
	LayerProps,
	MapLayerMouseEvent,
	MapRef,
} from 'react-map-gl/maplibre'
import type { Feature, FeatureCollection } from 'geojson'
import type { StyleSpecification } from 'maplibre-gl'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export type ZipCodeSelectorProps = {
	boundaries: FeatureCollection
	selectedZipCodes: string[]
	onToggleZipCode?: ((zipCode: string) => void) | undefined
	center?: { latitude: number; longitude: number } | undefined
	readOnly?: boolean | undefined
	className?: string | undefined
}

type BBox = {
	minLng: number
	minLat: number
	maxLng: number
	maxLat: number
}

const CARTO_STYLE = {
	version: 8,
	sources: {
		'carto-light': {
			type: 'raster',
			tiles: ['https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'],
			tileSize: 256,
			attribution:
				'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
			maxzoom: 19,
		},
	},
	layers: [
		{
			id: 'carto-light-layer',
			type: 'raster',
			source: 'carto-light',
		},
	],
} satisfies StyleSpecification

const LINE_LAYER = {
	id: 'zip-line',
	type: 'line',
	source: 'zip-codes',
	paint: {
		'line-color': '#9ca3af',
		'line-width': 1,
	},
} satisfies LayerProps

function expandBoundsFromRing(bounds: BBox, ring: unknown) {
	if (!Array.isArray(ring)) return

	for (const point of ring) {
		if (
			!Array.isArray(point) ||
			typeof point[0] !== 'number' ||
			typeof point[1] !== 'number'
		) {
			continue
		}

		const [lng, lat] = point
		bounds.minLng = Math.min(bounds.minLng, lng)
		bounds.minLat = Math.min(bounds.minLat, lat)
		bounds.maxLng = Math.max(bounds.maxLng, lng)
		bounds.maxLat = Math.max(bounds.maxLat, lat)
	}
}

function expandBoundsFromPolygon(
	bounds: BBox,
	coordinates: number[][][] | number[][][][],
) {
	if (!Array.isArray(coordinates)) return

	for (const ringOrPart of coordinates) {
		if (Array.isArray(ringOrPart) && Array.isArray(ringOrPart[0])) {
			if (Array.isArray(ringOrPart[0][0])) {
				expandBoundsFromPolygon(bounds, ringOrPart as number[][][])
			} else {
				expandBoundsFromRing(bounds, ringOrPart)
			}
		}
	}
}

function expandBoundsFromFeature(bounds: BBox, feature: Feature) {
	if (feature.geometry.type === 'Polygon') {
		expandBoundsFromPolygon(bounds, feature.geometry.coordinates)
	} else if (feature.geometry.type === 'MultiPolygon') {
		expandBoundsFromPolygon(bounds, feature.geometry.coordinates)
	}
}

function getBounds(features: FeatureCollection['features']): BBox | undefined {
	const bounds: BBox = {
		minLng: Infinity,
		minLat: Infinity,
		maxLng: -Infinity,
		maxLat: -Infinity,
	}

	for (const feature of features) {
		expandBoundsFromFeature(bounds, feature)
	}

	if (!Number.isFinite(bounds.minLng)) return undefined
	return bounds
}

function ZipCodeMapSkeleton({ className }: { className?: string | undefined }) {
	return (
		<div
			className={cn(
				'relative min-h-64 overflow-hidden rounded-2xl border',
				className,
			)}
		>
			<Skeleton className="absolute inset-0" />
		</div>
	)
}

function ZipCodeMap({
	boundaries,
	selectedZipCodes,
	onToggleZipCode,
	center,
	readOnly,
	className,
}: ZipCodeSelectorProps) {
	const mapRef = useRef<MapRef>(null)
	const [mapLoaded, setMapLoaded] = useState(false)

	const bounds = getBounds(boundaries.features)

	useEffect(() => {
		if (!mapRef.current || !mapLoaded) return

		if (bounds) {
			mapRef.current.fitBounds(
				[
					[bounds.minLng, bounds.minLat],
					[bounds.maxLng, bounds.maxLat],
				],
				{ padding: 24, duration: 0 },
			)
		} else if (center) {
			mapRef.current.flyTo({
				center: [center.longitude, center.latitude],
				zoom: 10,
				duration: 0,
			})
		}
	}, [bounds, center, mapLoaded])

	const fillLayer = {
		id: 'zip-fill',
		type: 'fill',
		source: 'zip-codes',
		paint: {
			'fill-color': [
				'case',
				[
					'boolean',
					['in', ['get', 'ZCTA5'], ['literal', selectedZipCodes]],
					false,
				],
				'#2563eb',
				'#e5e7eb',
			],
			'fill-opacity': 0.5,
		},
	} satisfies LayerProps

	const selectedLineLayer = {
		id: 'zip-line-selected',
		type: 'line',
		source: 'zip-codes',
		filter: ['in', ['get', 'ZCTA5'], ['literal', selectedZipCodes]],
		paint: {
			'line-color': '#2563eb',
			'line-width': 2,
		},
	} satisfies LayerProps

	function handleClick(event: MapLayerMouseEvent) {
		if (!onToggleZipCode) return
		const feature = event.features?.[0]
		const zipCode = feature?.properties?.ZCTA5
		if (typeof zipCode !== 'string') return
		onToggleZipCode(zipCode)
	}

	function handleMouseEnter() {
		if (!mapRef.current) return
		mapRef.current.getCanvas().style.cursor = 'pointer'
	}

	function handleMouseLeave() {
		if (!mapRef.current) return
		mapRef.current.getCanvas().style.cursor = ''
	}

	const interactiveLayerIds = ['zip-fill']

	const initialViewState = center
		? {
				longitude: center.longitude,
				latitude: center.latitude,
				zoom: 10,
			}
		: {
				longitude: -98.5795,
				latitude: 39.8283,
				zoom: 3,
			}

	return (
		<div className={cn('relative h-80 overflow-hidden rounded-2xl', className)}>
			<Map
				ref={mapRef}
				mapStyle={CARTO_STYLE}
				initialViewState={initialViewState}
				dragPan={false}
				dragRotate={false}
				scrollZoom={false}
				doubleClickZoom={false}
				touchZoomRotate={false}
				keyboard={false}
				{...(readOnly ? { interactiveLayerIds: [] } : { interactiveLayerIds })}
				{...(readOnly
					? {}
					: {
							onClick: handleClick,
							onMouseEnter: handleMouseEnter,
							onMouseLeave: handleMouseLeave,
						})}
				onLoad={() => setMapLoaded(true)}
				style={{ width: '100%', height: '100%' }}
			>
				<Source id="zip-codes" type="geojson" data={boundaries} />
				<Layer {...fillLayer} />
				<Layer {...LINE_LAYER} />
				<Layer {...selectedLineLayer} />
			</Map>
		</div>
	)
}

export function ZipCodeSelector(props: ZipCodeSelectorProps) {
	const [Inner, setInner] =
		useState<React.ComponentType<ZipCodeSelectorProps> | null>(null)

	useEffect(() => {
		let cancelled = false

		void import('react-map-gl/maplibre').then(() => {
			if (cancelled) return
			setInner(() => ZipCodeMap)
		})

		return () => {
			cancelled = true
		}
	}, [])

	if (!Inner) {
		return <ZipCodeMapSkeleton className={props.className} />
	}

	return <Inner {...props} />
}
