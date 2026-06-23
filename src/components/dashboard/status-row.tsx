import { CheckCircle2 } from 'lucide-react'

export type StatusRowProps = {
	label: string
	value: string
}

export function StatusRow({ label, value }: StatusRowProps) {
	return (
		<div className="flex items-center justify-between rounded-xl border px-3 py-2.5">
			<div className="flex items-center gap-2">
				<CheckCircle2 className="text-muted-foreground size-4" />
				<span>{label}</span>
			</div>
			<span className="font-semibold">{value}</span>
		</div>
	)
}
