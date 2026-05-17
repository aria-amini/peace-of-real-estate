import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'
import { HardHat, Ruler, Lock, ArrowRight } from 'lucide-react'

async function authenticateBeta(password: string) {
	const response = await fetch('/api/beta/auth', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ password }),
	})

	if (!response.ok) return false

	const data = await response.json()
	return data.success
}

export const Route = createFileRoute('/beta')({
	component: BetaLogin,
})

function BetaLogin() {
	const navigate = useNavigate()
	const [password, setPassword] = useState('')
	const [error, setError] = useState(false)
	const [success, setSuccess] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus()
		}
	}, [])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (await authenticateBeta(password)) {
			setError(false)
			setSuccess(true)
			setTimeout(async () => {
				await navigate({ to: '/' })
			}, 800)
		} else {
			setError(true)
			setPassword('')
			inputRef.current?.focus()
		}
	}

	return (
		<div className="beta-blueprint relative flex min-h-dvh w-full items-center justify-center overflow-hidden">
			{/* Blueprint grid background */}
			<div className="beta-grid" />

			{/* Decorative dimension lines */}
			<div className="beta-dimension dimension-top-left" />
			<div className="beta-dimension dimension-top-right" />
			<div className="beta-dimension dimension-bottom-left" />
			<div className="beta-dimension dimension-bottom-right" />

			{/* Corner brackets */}
			<div className="beta-bracket bracket-tl" />
			<div className="beta-bracket bracket-tr" />
			<div className="beta-bracket bracket-bl" />
			<div className="beta-bracket bracket-br" />

			{/* Main content card */}
			<div className="beta-card relative z-10 mx-6 w-full max-w-lg p-px">
				<div className="beta-card-inner">
					{/* Header */}
					<div className="mb-8 flex items-center gap-3">
						<div className="beta-icon-box">
							<HardHat className="h-6 w-6" />
						</div>
						<div className="beta-hairline flex-1" />
						<span className="beta-label text-xs tracking-widest uppercase">
							Beta Access
						</span>
						<div className="beta-hairline flex-1" />
					</div>

					{/* Title */}
					<h1 className="beta-title mb-2 text-center text-4xl font-bold tracking-tight md:text-5xl">
						Under Construction
					</h1>

					{/* Subtitle */}
					<p className="beta-subtitle mx-auto mb-10 max-w-sm text-center text-sm leading-relaxed">
						We are building something special for the future of real estate.
						Only early customers and invited guests may enter.
					</p>

					{/* Construction illustration */}
					<div className="beta-illustration mb-10">
						<div className="beta-house-frame">
							<div className="beta-roof" />
							<div className="beta-wall-left" />
							<div className="beta-wall-right" />
							<div className="beta-door" />
							<div className="beta-window window-left" />
							<div className="beta-window window-right" />
							<Ruler className="beta-ruler" />
						</div>
						<div className="beta-dimension-line" />
						<span className="beta-dimension-text">EST. 2026</span>
					</div>

					{/* Password form */}
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="relative">
							<Lock className="beta-input-icon absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
							<input
								ref={inputRef}
								type="password"
								value={password}
								onChange={(e) => {
									setPassword(e.target.value)
									setError(false)
								}}
								placeholder="Enter beta password"
								className={`beta-input w-full py-3 pr-4 pl-11 text-sm tracking-wide placeholder:tracking-widest placeholder:uppercase ${error ? 'beta-input-error' : ''} ${success ? 'beta-input-success' : ''}`}
							/>
						</div>

						{error && (
							<p className="beta-error-text text-center text-xs tracking-wide">
								Incorrect password. Please try again.
							</p>
						)}

						{success && (
							<p className="beta-success-text text-center text-xs tracking-wide">
								Access granted. Welcome aboard.
							</p>
						)}

						<button
							type="submit"
							disabled={success}
							className="beta-submit group flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold tracking-widest uppercase transition-all duration-200 disabled:opacity-70"
						>
							{success ? 'Entering...' : 'Unlock Access'}
							<ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
						</button>
					</form>

					{/* Footer note */}
					<p className="beta-footer mt-8 text-center text-xs tracking-wide opacity-60">
						Not an early customer?{' '}
						<a
							href="mailto:hello@peaceofrealestate.com"
							className="underline underline-offset-2 transition-opacity hover:opacity-100"
						>
							Request an invite
						</a>
					</p>
				</div>
			</div>

			{/* Blueprint styles */}
			<style>{`
				.beta-blueprint {
					background: #1a3a5c;
					font-family: 'DM Sans Variable', system-ui, sans-serif;
				}

				.beta-grid {
					position: absolute;
					inset: 0;
					background-image:
						linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
						linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
					background-size: 40px 40px;
					background-position: center center;
					pointer-events: none;
				}

				.beta-dimension {
					position: absolute;
					width: 60px;
					height: 60px;
					pointer-events: none;
				}

				.beta-dimension::before,
				.beta-dimension::after {
					content: '';
					position: absolute;
					background: rgba(255,255,255,0.2);
				}

				.dimension-top-left {
					top: 40px;
					left: 40px;
				}
				.dimension-top-left::before {
					width: 1px;
					height: 100%;
					top: 0;
					left: 0;
				}
				.dimension-top-left::after {
					width: 100%;
					height: 1px;
					top: 0;
					left: 0;
				}

				.dimension-top-right {
					top: 40px;
					right: 40px;
				}
				.dimension-top-right::before {
					width: 1px;
					height: 100%;
					top: 0;
					right: 0;
				}
				.dimension-top-right::after {
					width: 100%;
					height: 1px;
					top: 0;
					right: 0;
				}

				.dimension-bottom-left {
					bottom: 40px;
					left: 40px;
				}
				.dimension-bottom-left::before {
					width: 1px;
					height: 100%;
					bottom: 0;
					left: 0;
				}
				.dimension-bottom-left::after {
					width: 100%;
					height: 1px;
					bottom: 0;
					left: 0;
				}

				.dimension-bottom-right {
					bottom: 40px;
					right: 40px;
				}
				.dimension-bottom-right::before {
					width: 1px;
					height: 100%;
					bottom: 0;
					right: 0;
				}
				.dimension-bottom-right::after {
					width: 100%;
					height: 1px;
					bottom: 0;
					right: 0;
				}

				.beta-bracket {
					position: absolute;
					width: 24px;
					height: 24px;
					border-color: rgba(255,255,255,0.25);
					border-style: solid;
					pointer-events: none;
				}

				.bracket-tl {
					top: 24px;
					left: 24px;
					border-width: 2px 0 0 2px;
				}
				.bracket-tr {
					top: 24px;
					right: 24px;
					border-width: 2px 2px 0 0;
				}
				.bracket-bl {
					bottom: 24px;
					left: 24px;
					border-width: 0 0 2px 2px;
				}
				.bracket-br {
					bottom: 24px;
					right: 24px;
					border-width: 0 2px 2px 0;
				}

				.beta-card {
					background: rgba(255,255,255,0.08);
					border: 1px solid rgba(255,255,255,0.15);
					backdrop-filter: blur(8px);
				}

				.beta-card-inner {
					padding: 2.5rem 2rem;
				}

				.beta-icon-box {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 40px;
					height: 40px;
					border: 1px solid rgba(255,255,255,0.25);
					color: rgba(255,255,255,0.9);
				}

				.beta-hairline {
					height: 1px;
					background: rgba(255,255,255,0.15);
				}

				.beta-label {
					color: rgba(255,255,255,0.5);
					font-weight: 500;
					white-space: nowrap;
				}

				.beta-title {
					color: rgba(255,255,255,0.95);
					font-family: Georgia, 'Times New Roman', Cambria, serif;
					letter-spacing: -0.03em;
					line-height: 1.1;
				}

				.beta-subtitle {
					color: rgba(255,255,255,0.55);
					font-family: 'DM Sans Variable', system-ui, sans-serif;
				}

				.beta-illustration {
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 8px;
				}

				.beta-house-frame {
					position: relative;
					width: 120px;
					height: 100px;
				}

				.beta-roof {
					position: absolute;
					top: 0;
					left: 50%;
					transform: translateX(-50%);
					width: 0;
					height: 0;
					border-left: 50px solid transparent;
					border-right: 50px solid transparent;
					border-bottom: 40px solid rgba(255,255,255,0.12);
				}

				.beta-roof::after {
					content: '';
					position: absolute;
					top: 40px;
					left: -50px;
					width: 100px;
					height: 1px;
					background: rgba(255,255,255,0.25);
				}

				.beta-wall-left,
				.beta-wall-right {
					position: absolute;
					bottom: 0;
					width: 1px;
					height: 60px;
					background: rgba(255,255,255,0.25);
				}

				.beta-wall-left {
					left: 10px;
				}

				.beta-wall-right {
					right: 10px;
				}

				.beta-door {
					position: absolute;
					bottom: 0;
					left: 50%;
					transform: translateX(-50%);
					width: 24px;
					height: 36px;
					border: 1px solid rgba(255,255,255,0.2);
					border-bottom: none;
					background: rgba(255,255,255,0.04);
				}

				.beta-window {
					position: absolute;
					top: 48px;
					width: 20px;
					height: 20px;
					border: 1px solid rgba(255,255,255,0.2);
					background: rgba(255,255,255,0.04);
				}

				.beta-window::after {
					content: '';
					position: absolute;
					inset: 0;
					background:
						linear-gradient(to right, transparent 49%, rgba(255,255,255,0.15) 49%, rgba(255,255,255,0.15) 51%, transparent 51%),
						linear-gradient(to bottom, transparent 49%, rgba(255,255,255,0.15) 49%, rgba(255,255,255,0.15) 51%, transparent 51%);
				}

				.window-left {
					left: 18px;
				}

				.window-right {
					right: 18px;
				}

				.beta-ruler {
					position: absolute;
					bottom: -8px;
					left: 50%;
					transform: translateX(-50%);
					color: rgba(255,255,255,0.3);
					width: 140px;
				}

				.beta-dimension-line {
					width: 80px;
					height: 1px;
					background: rgba(255,255,255,0.15);
					position: relative;
				}

				.beta-dimension-line::before,
				.beta-dimension-line::after {
					content: '';
					position: absolute;
					top: -3px;
					width: 1px;
					height: 7px;
					background: rgba(255,255,255,0.2);
				}

				.beta-dimension-line::before {
					left: 0;
				}

				.beta-dimension-line::after {
					right: 0;
				}

				.beta-dimension-text {
					color: rgba(255,255,255,0.35);
					font-size: 0.625rem;
					letter-spacing: 0.15em;
					text-transform: uppercase;
					font-family: 'Courier New', monospace;
				}

				.beta-input {
					background: rgba(255,255,255,0.06);
					border: 1px solid rgba(255,255,255,0.2);
					color: rgba(255,255,255,0.9);
					outline: none;
					transition: all 0.2s ease;
				}

				.beta-input::placeholder {
					color: rgba(255,255,255,0.3);
				}

				.beta-input:focus {
					border-color: rgba(255,255,255,0.45);
					background: rgba(255,255,255,0.1);
				}

				.beta-input-icon {
					color: rgba(255,255,255,0.35);
				}

				.beta-input-error {
					border-color: rgba(196, 112, 90, 0.7) !important;
					background: rgba(196, 112, 90, 0.08) !important;
				}

				.beta-input-success {
					border-color: rgba(107, 123, 74, 0.7) !important;
					background: rgba(107, 123, 74, 0.08) !important;
				}

				.beta-error-text {
					color: rgba(196, 112, 90, 0.9);
				}

				.beta-success-text {
					color: rgba(107, 123, 74, 0.9);
				}

				.beta-submit {
					background: rgba(255,255,255,0.1);
					border: 1px solid rgba(255,255,255,0.25);
					color: rgba(255,255,255,0.9);
				}

				.beta-submit:hover:not(:disabled) {
					background: rgba(255,255,255,0.18);
					border-color: rgba(255,255,255,0.4);
				}

				.beta-footer {
					color: rgba(255,255,255,0.4);
				}

				.beta-footer a {
					color: rgba(255,255,255,0.6);
				}
			`}</style>
		</div>
	)
}
