import { useEffect, useRef, useState } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export type PriceRange = {
	min: number
	max: number
}

export const PRICE_MIN = 0
export const PRICE_MAX = 2_000_000
export const PRICE_STEP = 50_000
export const DEFAULT_PRICE_RANGE: PriceRange = { min: 400_000, max: 600_000 }

export const AGENT_PRICE_RANGES: Record<string, PriceRange> = {
	under400k: { min: 0, max: 400_000 },
	'400kTo750k': { min: 400_000, max: 750_000 },
	'750kTo1_5m': { min: 750_000, max: 1_500_000 },
	'1_5mPlus': { min: 1_500_000, max: PRICE_MAX },
}

export function parsePriceRange(value: string | undefined | null): PriceRange {
	if (!value) return { ...DEFAULT_PRICE_RANGE }
	const [minRaw, maxRaw] = value.split('-')
	const min = Number.parseInt(minRaw?.replace(/\D/g, '') ?? '', 10)
	const max = Number.parseInt(maxRaw?.replace(/\D/g, '') ?? '', 10)
	if (Number.isNaN(min) || Number.isNaN(max)) return { ...DEFAULT_PRICE_RANGE }
	return {
		min: Math.max(PRICE_MIN, Math.min(min, max)),
		max: Math.min(PRICE_MAX, Math.max(min, max)),
	}
}

export function serializePriceRange(range: PriceRange): string {
	return `${range.min}-${range.max}`
}

export function formatPriceRange(range: PriceRange): string {
	return `${formatPriceCompact(range.min)} - ${formatPriceCompact(range.max)}`
}

export function formatPrice(value: number): string {
	return `$${value.toLocaleString()}`
}

export function formatPriceCompact(value: number): string {
	if (value >= 1_000_000) {
		const millions = value / 1_000_000
		return `$${millions % 1 === 0 ? millions : millions.toFixed(1)}M`
	}
	return `$${value / 1000}k`
}

export function parseRawPrice(value: string): number | undefined {
	const digits = value.replace(/\D/g, '')
	const parsed = Number.parseInt(digits, 10)
	return Number.isNaN(parsed) ? undefined : parsed
}

export function clampPrice(value: number): number {
	return Math.max(PRICE_MIN, Math.min(value, PRICE_MAX))
}

export function priceRangeOverlaps(
	consumerRange: string | undefined | null,
	agentRange: string | undefined | null,
): boolean {
	const consumer = parsePriceRange(consumerRange)
	const agentSlug = agentRange?.trim() ?? ''
	const agent = AGENT_PRICE_RANGES[agentSlug]
	if (!agent) return false
	return consumer.min < agent.max && consumer.max > agent.min
}

function getMask(digits: string): string {
	return digits.length > 6 ? '0,000,000' : '000,000'
}

function applyMask(digits: string): { typed: string; ghost: string } {
	const mask = getMask(digits)
	if (digits === '') return { typed: '', ghost: mask }

	let lastTypedIndex = -1
	let digitIndex = 0
	for (let i = 0; i < mask.length; i++) {
		if (mask[i] === ',') continue
		if (digitIndex < digits.length) {
			lastTypedIndex = i
			digitIndex++
		}
	}

	let typed = ''
	let ghost = ''
	digitIndex = 0
	for (let i = 0; i < mask.length; i++) {
		if (mask[i] === ',') {
			if (i < lastTypedIndex) typed += ','
			else ghost += ','
			continue
		}
		if (digitIndex < digits.length) {
			typed += digits[digitIndex]
			digitIndex++
		} else {
			ghost += '0'
		}
	}

	return { typed, ghost }
}

export function PriceInput({
	id,
	label,
	value,
	onChange,
}: {
	id?: string
	label?: string
	value: number
	onChange: (value: number) => void
}) {
	const inputRef = useRef<HTMLInputElement>(null)
	const [isFocused, setIsFocused] = useState(false)
	const [typed, setTyped] = useState(() => value.toLocaleString())

	useEffect(() => {
		if (!isFocused) setTyped(value.toLocaleString())
	}, [value, isFocused])

	const digits = typed.replace(/\D/g, '').slice(0, 7)
	const { typed: maskedTyped, ghost } = applyMask(digits)

	const handleFocus = () => {
		setIsFocused(true)
		setTyped(value.toLocaleString())
		requestAnimationFrame(() => inputRef.current?.select())
	}

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const input = event.target
		const nextDigits = input.value.replace(/\D/g, '').slice(0, 7)
		const { typed: nextTyped } = applyMask(nextDigits)
		setTyped(nextTyped)
		requestAnimationFrame(() => {
			input.setSelectionRange(nextTyped.length, nextTyped.length)
		})
	}

	const handleBlur = () => {
		setIsFocused(false)
		const numeric =
			digits === ''
				? 0
				: Number.parseInt(digits.padEnd(Math.max(digits.length, 6), '0'), 10)
		onChange(Math.min(PRICE_MAX, numeric))
	}

	return (
		<div className="space-y-1">
			{label ? (
				<Label
					htmlFor={id}
					className="text-muted-foreground text-xs font-medium"
				>
					{label}
				</Label>
			) : null}
			<div className="relative">
				<span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm font-semibold">
					$
				</span>
				<div className="pointer-events-none absolute inset-y-0 right-6 left-6 flex items-center overflow-hidden text-sm font-semibold">
					<span className="text-foreground">{maskedTyped}</span>
					{isFocused && ghost ? (
						<span className="text-muted-foreground/40">{ghost}</span>
					) : null}
				</div>
				<Input
					ref={inputRef}
					id={id}
					type="text"
					inputMode="numeric"
					value={maskedTyped}
					onChange={handleChange}
					onFocus={handleFocus}
					onBlur={handleBlur}
					className="text-foreground/0 w-full bg-transparent pr-6 pl-6"
					style={{ caretColor: 'hsl(var(--primary))' }}
				/>
			</div>
		</div>
	)
}
