import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/showcase')({
	component: Showcase,
	head: () => ({
		meta: [{ title: 'Freelance Site — Theme Showcase' }],
		links: [
			{ rel: 'preconnect', href: 'https://fonts.googleapis.com' },
			{
				rel: 'preconnect',
				href: 'https://fonts.gstatic.com',
				crossOrigin: 'anonymous',
			},
			{
				rel: 'stylesheet',
				href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=Space+Grotesk:wght@300;400;500;600&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,300&family=Work+Sans:ital,wght@0,300;0,400;0,500;1,300&family=Syne:wght@400;500;600;700&family=Outfit:wght@300;400;500;600&family=Nunito:wght@400;500;600;700&family=Quicksand:wght@400;500;600&family=Sora:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap',
			},
		],
	}),
})

function Showcase() {
	return (
		<div className="bg-neutral-50 text-neutral-800">
			<style>{`
				.font-fairway-head { font-family: 'Cormorant Garamond', serif; }
				.font-fairway-body { font-family: 'DM Sans', sans-serif; }
				.font-links-head { font-family: 'Space Grotesk', sans-serif; }
				.font-links-body { font-family: 'Work Sans', sans-serif; }
				.font-tee-head { font-family: 'Fraunces', serif; }
				.font-tee-body { font-family: 'DM Sans', sans-serif; }
				.font-dew-head { font-family: 'Cormorant Garamond', serif; }
				.font-dew-body { font-family: 'Work Sans', sans-serif; }
				.font-caddie-head { font-family: 'Space Grotesk', sans-serif; }
				.font-caddie-body { font-family: 'DM Sans', sans-serif; }

				.font-signal-head { font-family: 'Syne', sans-serif; }
				.font-signal-body { font-family: 'Outfit', sans-serif; }
				.font-sprout-head { font-family: 'Playfair Display', serif; }
				.font-sprout-body { font-family: 'Nunito', sans-serif; }
				.font-fizz-head { font-family: 'Syne', sans-serif; }
				.font-fizz-body { font-family: 'Quicksand', sans-serif; }
				.font-orbit-head { font-family: 'Outfit', sans-serif; }
				.font-orbit-body { font-family: 'Sora', sans-serif; }
				.font-draft-head { font-family: 'Fraunces', serif; }
				.font-draft-body { font-family: 'Sora', sans-serif; }

				.stripe-bg {
					background: repeating-linear-gradient(
						90deg,
						transparent,
						transparent 60px,
						rgba(0,0,0,0.02) 60px,
						rgba(0,0,0,0.02) 61px
					);
				}
				.dew-shimmer {
					background: linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%);
					background-size: 200% 200%;
					animation: shimmer 6s ease-in-out infinite;
				}
				@keyframes shimmer {
					0%, 100% { background-position: 0% 50%; }
					50% { background-position: 100% 50%; }
				}
				.grain {
					position: relative;
				}
				.grain::before {
					content: '';
					position: absolute;
					inset: 0;
					background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
					pointer-events: none;
					z-index: 1;
				}
				.grain > * {
					position: relative;
					z-index: 2;
				}

				.signal-pulse {
					animation: signalPulse 3s ease-in-out infinite;
				}
				@keyframes signalPulse {
					0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(59, 91, 254, 0.4); }
					50% { opacity: 0.85; box-shadow: 0 0 0 6px rgba(59, 91, 254, 0); }
				}
				.fizz-float {
					animation: fizzFloat 4s ease-in-out infinite;
				}
				@keyframes fizzFloat {
					0%, 100% { transform: translateY(0); }
					50% { transform: translateY(-6px); }
				}
				.orbit-glow {
					box-shadow: 0 0 60px -15px rgba(108, 92, 231, 0.25);
				}
			`}</style>

			{/* Header */}
			<header className="mx-auto max-w-3xl px-6 py-20 text-center">
				<p className="mb-4 text-xs tracking-[0.3em] text-neutral-400 uppercase">
					Theme Exploration
				</p>
				<h1
					className="mb-6 text-5xl font-light text-neutral-900 md:text-6xl"
					style={{ fontFamily: "'Cormorant Garamond', serif" }}
				>
					Ten Directions
				</h1>
				<p className="mx-auto max-w-xl text-lg leading-relaxed text-neutral-500">
					Two collections, one obsession: clean, light, and precise. From quiet
					course mornings to buzzing startup labs.
				</p>
			</header>

			{/* Part One Label */}
			<section className="mx-auto max-w-5xl px-6 pt-8 pb-4">
				<div className="flex items-center gap-4">
					<div className="h-[1px] flex-1 bg-neutral-200" />
					<span className="text-xs tracking-[0.3em] text-neutral-400 uppercase">
						Part One — Course Light
					</span>
					<div className="h-[1px] flex-1 bg-neutral-200" />
				</div>
			</section>

			{/* Theme 1: Fairway Fresh */}
			<section className="relative overflow-hidden bg-[#F6F7F3] px-6 py-24">
				<div className="stripe-bg absolute inset-0 opacity-50" />
				<div className="relative z-10 mx-auto max-w-5xl">
					<div className="mb-12 flex items-baseline gap-4">
						<span className="text-xs tracking-[0.2em] text-[#6B7F5E] uppercase">
							01
						</span>
						<div>
							<h2 className="font-fairway-head text-3xl font-semibold text-[#2D3A25]">
								Fairway Fresh
							</h2>
							<p className="font-fairway-body mt-1 text-sm text-[#6B7F5E]">
								Mowed-grass precision. Sage, cream, sky.
							</p>
						</div>
					</div>

					<div className="grid gap-8 md:grid-cols-2">
						{/* Color swatches */}
						<div className="space-y-4">
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full border border-[#D4D9CF] bg-[#F6F7F3] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#2D3A25]">
										Fairway Cream
									</p>
									<p className="font-mono text-xs text-[#6B7F5E]">#F6F7F3</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full bg-[#6B7F5E] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#2D3A25]">
										Sage Green
									</p>
									<p className="font-mono text-xs text-[#6B7F5E]">#6B7F5E</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full bg-[#87CEEB] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#2D3A25]">
										Tee Box Sky
									</p>
									<p className="font-mono text-xs text-[#6B7F5E]">#87CEEB</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full bg-[#2D3A25] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#2D3A25]">
										Deep Pine
									</p>
									<p className="font-mono text-xs text-[#6B7F5E]">#2D3A25</p>
								</div>
							</div>
						</div>

						{/* Component preview */}
						<div className="rounded-2xl border border-[#E8EBE3] bg-white p-8 shadow-sm">
							<div className="mb-8 flex items-center justify-between">
								<span className="font-fairway-body text-xs tracking-[0.2em] text-[#6B7F5E] uppercase">
									Portfolio
								</span>
								<span className="h-[1px] w-8 bg-[#6B7F5E]" />
							</div>
							<h3 className="font-fairway-head mb-3 text-4xl leading-tight text-[#2D3A25]">
								Built with
								<br />
								precision.
							</h3>
							<p className="font-fairway-body mb-6 text-sm leading-relaxed text-[#6B7F5E]">
								Every project starts on a clean tee box. No clutter, no noise —
								just the work, presented honestly.
							</p>
							<a
								href="/showcase"
								className="font-fairway-body inline-flex items-center gap-2 text-sm font-medium text-[#2D3A25] transition-colors hover:text-[#6B7F5E]"
							>
								View selected work
								<svg
									className="h-4 w-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={1.5}
										d="M17 8l4 4m0 0l-4 4m4-4H3"
									/>
								</svg>
							</a>
							<div className="mt-8 flex gap-4 border-t border-[#E8EBE3] pt-6">
								<div className="h-20 flex-1 rounded-lg border border-[#E8EBE3] bg-[#F6F7F3]" />
								<div className="h-20 flex-1 rounded-lg border border-[#E8EBE3] bg-[#F6F7F3]" />
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Theme 2: Links Minimal */}
			<section className="grain relative bg-[#EDE8E0] px-6 py-24">
				<div className="relative z-10 mx-auto max-w-5xl">
					<div className="mb-12 flex items-baseline gap-4">
						<span className="text-xs tracking-[0.2em] text-[#9E9386] uppercase">
							02
						</span>
						<div>
							<h2 className="font-links-head text-3xl font-medium text-[#3D3832]">
								Links Minimal
							</h2>
							<p className="font-links-body mt-1 text-sm text-[#9E9386]">
								Coastal sand, fog, and driftwood. Texture without weight.
							</p>
						</div>
					</div>

					<div className="grid gap-8 md:grid-cols-2">
						<div className="space-y-4">
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full border border-[#C9C0B6] bg-[#EDE8E0] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#3D3832]">
										Sand Trap
									</p>
									<p className="font-mono text-xs text-[#9E9386]">#EDE8E0</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full bg-[#C9C0B6] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#3D3832]">
										Driftwood
									</p>
									<p className="font-mono text-xs text-[#9E9386]">#C9C0B6</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full bg-[#8BA89B] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#3D3832]">Seafoam</p>
									<p className="font-mono text-xs text-[#9E9386]">#8BA89B</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full bg-[#3D3832] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#3D3832]">
										Wet Stone
									</p>
									<p className="font-mono text-xs text-[#9E9386]">#3D3832</p>
								</div>
							</div>
						</div>

						<div className="rounded-sm border border-[#D8D0C8] bg-[#F5F2EE] p-8 shadow-sm">
							<div className="mb-8 flex items-center gap-3">
								<div className="h-8 w-8 rounded-sm bg-[#3D3832]" />
								<span className="font-links-body text-xs tracking-[0.15em] text-[#9E9386] uppercase">
									Available for projects
								</span>
							</div>
							<h3 className="font-links-head mb-4 text-3xl leading-snug text-[#3D3832]">
								Freelance developer
								<br />& technical lead
							</h3>
							<p className="font-links-body mb-8 max-w-sm text-sm leading-relaxed text-[#9E9386]">
								Ten years shipping products. I work with teams who value clarity
								over complexity and users who deserve interfaces that simply
								work.
							</p>
							<div className="flex gap-3">
								<a
									href="/showcase"
									className="font-links-body rounded-sm bg-[#3D3832] px-5 py-2.5 text-sm font-medium text-[#F5F2EE] transition-colors hover:bg-[#5A534A]"
								>
									Start a conversation
								</a>
								<a
									href="/showcase"
									className="font-links-body rounded-sm border border-[#C9C0B6] px-5 py-2.5 text-sm text-[#3D3832] transition-colors hover:border-[#3D3832]"
								>
									Read case studies
								</a>
							</div>
							<div className="mt-8 grid grid-cols-3 gap-3">
								<div className="h-16 rounded-sm bg-[#EDE8E0]" />
								<div className="h-16 rounded-sm bg-[#C9C0B6]" />
								<div className="h-16 rounded-sm bg-[#8BA89B]" />
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Theme 3: Tee Box Classic */}
			<section className="bg-white px-6 py-24">
				<div className="mx-auto max-w-5xl">
					<div className="mb-12 flex items-baseline gap-4">
						<span className="text-xs tracking-[0.2em] text-[#8B7E6A] uppercase">
							03
						</span>
						<div>
							<h2 className="font-tee-head text-3xl font-semibold text-[#1A1A1A]">
								Tee Box Classic
							</h2>
							<p className="font-tee-body mt-1 text-sm text-[#8B7E6A]">
								Crisp white, warm stone, forest green accent. Maximum breathing
								room.
							</p>
						</div>
					</div>

					<div className="grid gap-8 md:grid-cols-2">
						<div className="space-y-4">
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full border border-[#E5E0D8] bg-white shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#1A1A1A]">
										Flag White
									</p>
									<p className="font-mono text-xs text-[#8B7E6A]">#FFFFFF</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full border border-[#E5E0D8] bg-[#F5F0E8] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#1A1A1A]">
										Bunker Stone
									</p>
									<p className="font-mono text-xs text-[#8B7E6A]">#F5F0E8</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full bg-[#1B4332] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#1A1A1A]">
										Pine Green
									</p>
									<p className="font-mono text-xs text-[#8B7E6A]">#1B4332</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full bg-[#8B7E6A] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#1A1A1A]">
										Fairway Taupe
									</p>
									<p className="font-mono text-xs text-[#8B7E6A]">#8B7E6A</p>
								</div>
							</div>
						</div>

						<div className="rounded-3xl border border-[#EDE9E2] bg-[#FAFAF8] p-10">
							<p className="font-tee-body mb-6 text-xs tracking-[0.25em] text-[#8B7E6A] uppercase">
								Hello, I'm Alex
							</p>
							<h3 className="font-tee-head mb-6 text-5xl leading-[1.1] text-[#1A1A1A]">
								I build
								<br />
								digital products.
							</h3>
							<div className="mb-6 h-[2px] w-12 bg-[#1B4332]" />
							<p className="font-tee-body mb-8 leading-relaxed text-[#8B7E6A]">
								Full-stack engineer with a designer's eye. Currently taking on
								select projects for Q2 2026.
							</p>
							<div className="space-y-3">
								<a
									href="/showcase"
									className="font-tee-body flex items-center justify-between border-b border-[#EDE9E2] py-3 text-[#1A1A1A] transition-colors hover:text-[#1B4332]"
								>
									<span className="text-sm">View my work</span>
									<svg
										className="h-4 w-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1.5}
											d="M17 8l4 4m0 0l-4 4m4-4H3"
										/>
									</svg>
								</a>
								<a
									href="/showcase"
									className="font-tee-body flex items-center justify-between border-b border-[#EDE9E2] py-3 text-[#1A1A1A] transition-colors hover:text-[#1B4332]"
								>
									<span className="text-sm">About my process</span>
									<svg
										className="h-4 w-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1.5}
											d="M17 8l4 4m0 0l-4 4m4-4H3"
										/>
									</svg>
								</a>
								<a
									href="/showcase"
									className="font-tee-body flex items-center justify-between py-3 text-[#1A1A1A] transition-colors hover:text-[#1B4332]"
								>
									<span className="text-sm">Get in touch</span>
									<svg
										className="h-4 w-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1.5}
											d="M17 8l4 4m0 0l-4 4m4-4H3"
										/>
									</svg>
								</a>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Theme 4: Dew Point */}
			<section className="relative overflow-hidden bg-[#EEF1F0] px-6 py-24">
				<div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-white opacity-40 blur-3xl" />
				<div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#C5D5D1] opacity-20 blur-3xl" />
				<div className="relative z-10 mx-auto max-w-5xl">
					<div className="mb-12 flex items-baseline gap-4">
						<span className="text-xs tracking-[0.2em] text-[#7A9191] uppercase">
							04
						</span>
						<div>
							<h2 className="font-dew-head text-3xl font-semibold text-[#2C3E3E]">
								Dew Point
							</h2>
							<p className="font-dew-body mt-1 text-sm text-[#7A9191]">
								Morning mist, silvery blues, pale mint. Serene and luminous.
							</p>
						</div>
					</div>

					<div className="grid gap-8 md:grid-cols-2">
						<div className="space-y-4">
							<div className="flex items-center gap-4">
								<div className="dew-shimmer h-16 w-16 rounded-full border border-[#C5D5D1] bg-[#EEF1F0] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#2C3E3E]">
										Morning Mist
									</p>
									<p className="font-mono text-xs text-[#7A9191]">#EEF1F0</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full bg-[#C5D5D1] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#2C3E3E]">
										Pond Water
									</p>
									<p className="font-mono text-xs text-[#7A9191]">#C5D5D1</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full bg-[#A8C5BF] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#2C3E3E]">
										Pale Mint
									</p>
									<p className="font-mono text-xs text-[#7A9191]">#A8C5BF</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full bg-[#2C3E3E] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#2C3E3E]">
										Evergreen Shadow
									</p>
									<p className="font-mono text-xs text-[#7A9191]">#2C3E3E</p>
								</div>
							</div>
						</div>

						<div className="rounded-2xl border border-white bg-white/60 p-8 shadow-sm backdrop-blur-sm">
							<div className="mb-6 flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-[#A8C5BF]" />
								<span className="font-dew-body text-xs tracking-[0.2em] text-[#7A9191] uppercase">
									Services
								</span>
							</div>
							<h3 className="font-dew-head mb-6 text-3xl leading-tight text-[#2C3E3E]">
								What I can
								<br />
								help you with
							</h3>
							<div className="space-y-4">
								<div className="flex items-start gap-4 rounded-xl border border-[#C5D5D1]/30 bg-white/50 p-4">
									<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#A8C5BF]/20">
										<svg
											className="h-5 w-5 text-[#2C3E3E]"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={1.5}
												d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
											/>
										</svg>
									</div>
									<div>
										<p className="font-dew-body text-sm font-medium text-[#2C3E3E]">
											Frontend Architecture
										</p>
										<p className="font-dew-body mt-0.5 text-xs text-[#7A9191]">
											React, TypeScript, design systems
										</p>
									</div>
								</div>
								<div className="flex items-start gap-4 rounded-xl border border-[#C5D5D1]/30 bg-white/50 p-4">
									<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#A8C5BF]/20">
										<svg
											className="h-5 w-5 text-[#2C3E3E]"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={1.5}
												d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
											/>
										</svg>
									</div>
									<div>
										<p className="font-dew-body text-sm font-medium text-[#2C3E3E]">
											Full-Stack Products
										</p>
										<p className="font-dew-body mt-0.5 text-xs text-[#7A9191]">
											End-to-end from database to UI
										</p>
									</div>
								</div>
								<div className="flex items-start gap-4 rounded-xl border border-[#C5D5D1]/30 bg-white/50 p-4">
									<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#A8C5BF]/20">
										<svg
											className="h-5 w-5 text-[#2C3E3E]"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={1.5}
												d="M13 10V3L4 14h7v7l9-11h-7z"
											/>
										</svg>
									</div>
									<div>
										<p className="font-dew-body text-sm font-medium text-[#2C3E3E]">
											Performance & Scale
										</p>
										<p className="font-dew-body mt-0.5 text-xs text-[#7A9191]">
											Speed audits, infrastructure
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Theme 5: Caddie Notebook */}
			<section className="bg-[#F3F1ED] px-6 py-24">
				<div className="mx-auto max-w-5xl">
					<div className="mb-12 flex items-baseline gap-4">
						<span className="text-xs tracking-[0.2em] text-[#8C857B] uppercase">
							05
						</span>
						<div>
							<h2 className="font-caddie-head text-3xl font-medium text-[#2B2824]">
								Caddie Notebook
							</h2>
							<p className="font-caddie-body mt-1 text-sm text-[#8C857B]">
								Utility and warmth. Cream paper, pencil marks, grid lines.
							</p>
						</div>
					</div>

					<div className="grid gap-8 md:grid-cols-2">
						<div className="space-y-4">
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full border border-[#D4CFC7] bg-[#F3F1ED] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#2B2824]">
										Scorecard Cream
									</p>
									<p className="font-mono text-xs text-[#8C857B]">#F3F1ED</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full bg-[#D4CFC7] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#2B2824]">
										Pencil Lead
									</p>
									<p className="font-mono text-xs text-[#8C857B]">#D4CFC7</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full bg-[#B8A99A] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#2B2824]">
										Leather Grip
									</p>
									<p className="font-mono text-xs text-[#8C857B]">#B8A99A</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full bg-[#2B2824] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#2B2824]">
										Fresh Ink
									</p>
									<p className="font-mono text-xs text-[#8C857B]">#2B2824</p>
								</div>
							</div>
						</div>

						<div
							className="relative bg-white p-8 shadow-sm"
							style={{
								backgroundImage:
									'linear-gradient(#E8E4DE 1px, transparent 1px)',
								backgroundSize: '100% 28px',
							}}
						>
							<div className="absolute top-0 bottom-0 left-8 w-[1px] bg-[#E8E4DE]" />
							<div className="pl-6">
								<p className="font-caddie-body mb-6 text-xs tracking-[0.15em] text-[#8C857B] uppercase">
									Yardage Book
								</p>
								<h3 className="font-caddie-head mb-2 text-2xl text-[#2B2824]">
									Project Notes
								</h3>
								<p className="font-caddie-body mb-8 text-sm text-[#8C857B]">
									A running log of work, thoughts, and useful tools.
								</p>

								<div className="space-y-6">
									<div className="flex items-start gap-4">
										<span className="mt-0.5 font-mono text-xs text-[#B8A99A]">
											01
										</span>
										<div>
											<p className="font-caddie-body text-sm font-medium text-[#2B2824]">
												E-commerce Platform Rebuild
											</p>
											<p className="font-caddie-body mt-1 text-xs text-[#8C857B]">
												Next.js, Stripe, headless CMS — 40% faster checkout
											</p>
										</div>
									</div>
									<div className="flex items-start gap-4">
										<span className="mt-0.5 font-mono text-xs text-[#B8A99A]">
											02
										</span>
										<div>
											<p className="font-caddie-body text-sm font-medium text-[#2B2824]">
												Design System for Fintech
											</p>
											<p className="font-caddie-body mt-1 text-xs text-[#8C857B]">
												40+ components, Storybook, accessibility-first
											</p>
										</div>
									</div>
									<div className="flex items-start gap-4">
										<span className="mt-0.5 font-mono text-xs text-[#B8A99A]">
											03
										</span>
										<div>
											<p className="font-caddie-body text-sm font-medium text-[#2B2824]">
												Real-Time Dashboard
											</p>
											<p className="font-caddie-body mt-1 text-xs text-[#8C857B]">
												WebSockets, D3 charts, 10k concurrent users
											</p>
										</div>
									</div>
								</div>

								<div className="mt-8 border-t border-[#E8E4DE] pt-4">
									<a
										href="/showcase"
										className="font-caddie-body flex items-center gap-2 text-sm text-[#2B2824] transition-colors hover:text-[#B8A99A]"
									>
										See full yardage book
										<span className="text-lg">→</span>
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Collection Divider */}
			<section className="bg-[#0A0E27] px-6 py-24 text-white">
				<div className="mx-auto max-w-4xl text-center">
					<p className="mb-4 text-xs tracking-[0.3em] text-neutral-500 uppercase">
						Collection Two
					</p>
					<h2 className="font-signal-head mb-6 text-4xl font-semibold md:text-5xl">
						Startup Spark
					</h2>
					<p className="mx-auto max-w-xl text-lg leading-relaxed text-neutral-400">
						Modern, sharp, bubbly, and casual. For early innovators who take
						their craft seriously.
					</p>
					<div className="mt-10 flex flex-wrap justify-center gap-3">
						<span className="rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-400">
							Crisp & light ✓
						</span>
						<span className="rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-400">
							Bubbly corners ✓
						</span>
						<span className="rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-400">
							Startup energy ✓
						</span>
						<span className="rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-400">
							Serious craft ✓
						</span>
					</div>
				</div>
			</section>

			{/* Theme 6: Signal */}
			<section className="relative overflow-hidden bg-[#F7F9FC] px-6 py-24">
				<div className="relative z-10 mx-auto max-w-5xl">
					<div className="mb-12 flex items-baseline gap-4">
						<span className="text-xs tracking-[0.2em] text-[#3B5BFE] uppercase">
							06
						</span>
						<div>
							<h2 className="font-signal-head text-3xl font-semibold text-[#0A0E27]">
								Signal
							</h2>
							<p className="font-signal-body mt-1 text-sm text-[#64748B]">
								Sharp, electric, and unapologetically direct.
							</p>
						</div>
					</div>

					<div className="grid gap-8 md:grid-cols-2">
						<div className="space-y-4">
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full border border-[#E2E8F0] bg-[#F7F9FC] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#0A0E27]">
										Ice White
									</p>
									<p className="font-mono text-xs text-[#64748B]">#F7F9FC</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full bg-[#3B5BFE] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#0A0E27]">
										Electric Indigo
									</p>
									<p className="font-mono text-xs text-[#64748B]">#3B5BFE</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full bg-[#FF6B6B] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#0A0E27]">
										Coral Alert
									</p>
									<p className="font-mono text-xs text-[#64748B]">#FF6B6B</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full bg-[#0A0E27] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#0A0E27]">
										Deep Navy
									</p>
									<p className="font-mono text-xs text-[#64748B]">#0A0E27</p>
								</div>
							</div>
						</div>

						<div className="rounded-3xl border border-[#E2E8F0] bg-white p-8 shadow-sm">
							<div className="mb-6 flex items-center gap-2">
								<div className="signal-pulse h-2 w-2 rounded-full bg-[#3B5BFE]" />
								<span className="font-signal-body text-xs tracking-[0.2em] text-[#64748B] uppercase">
									Now Live
								</span>
							</div>
							<h3 className="font-signal-head mb-3 text-4xl leading-tight text-[#0A0E27]">
								Build faster.
								<br />
								<span className="text-[#3B5BFE]">Ship bolder.</span>
							</h3>
							<p className="font-signal-body mb-6 text-sm leading-relaxed text-[#64748B]">
								The platform for teams who don't wait for permission. Deploy,
								iterate, and scale without the noise.
							</p>
							<div className="mb-6 flex gap-3">
								<span className="font-signal-body rounded-full bg-[#3B5BFE]/10 px-3 py-1 text-xs font-medium text-[#3B5BFE]">
									v2.0 Released
								</span>
								<span className="font-signal-body rounded-full bg-[#FF6B6B]/10 px-3 py-1 text-xs font-medium text-[#FF6B6B]">
									99.9% Uptime
								</span>
							</div>
							<a
								href="/showcase"
								className="font-signal-body inline-flex items-center gap-2 rounded-full bg-[#0A0E27] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3B5BFE]"
							>
								Start building
								<svg
									className="h-4 w-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={1.5}
										d="M17 8l4 4m0 0l-4 4m4-4H3"
									/>
								</svg>
							</a>
							<div className="mt-8 flex gap-4 border-t border-[#E2E8F0] pt-6">
								<div className="h-20 flex-1 rounded-2xl border border-[#E2E8F0] bg-[#F7F9FC]" />
								<div className="h-20 flex-1 rounded-2xl border border-[#E2E8F0] bg-[#F7F9FC]" />
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Theme 7: Sprout */}
			<section className="relative overflow-hidden bg-[#F4FBF7] px-6 py-24">
				<div className="relative z-10 mx-auto max-w-5xl">
					<div className="mb-12 flex items-baseline gap-4">
						<span className="text-xs tracking-[0.2em] text-[#2D6A4F] uppercase">
							07
						</span>
						<div>
							<h2 className="font-sprout-head text-3xl font-semibold text-[#081C15]">
								Sprout
							</h2>
							<p className="font-sprout-body mt-1 text-sm text-[#52796F]">
								Organic precision for growth-minded teams.
							</p>
						</div>
					</div>

					<div className="grid gap-8 md:grid-cols-2">
						<div className="space-y-4">
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full border border-[#B7E4C7] bg-[#F4FBF7] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#081C15]">
										Mint Cloud
									</p>
									<p className="font-mono text-xs text-[#52796F]">#F4FBF7</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full bg-[#2D6A4F] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#081C15]">Forest</p>
									<p className="font-mono text-xs text-[#52796F]">#2D6A4F</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full bg-[#95D5B2] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#081C15]">
										Pale Leaf
									</p>
									<p className="font-mono text-xs text-[#52796F]">#95D5B2</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full bg-[#081C15] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#081C15]">
										Deep Pine
									</p>
									<p className="font-mono text-xs text-[#52796F]">#081C15</p>
								</div>
							</div>
						</div>

						<div className="rounded-[2rem] border border-[#B7E4C7] bg-white p-8 shadow-sm">
							<div className="mb-6 flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#95D5B2]/30">
									<svg
										className="h-5 w-5 text-[#2D6A4F]"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1.5}
											d="M12 6v6m0 0v6m0-6h6m-6 0H6"
										/>
									</svg>
								</div>
								<span className="font-sprout-body text-xs tracking-[0.2em] text-[#52796F] uppercase">
									Features
								</span>
							</div>
							<h3 className="font-sprout-head mb-4 text-3xl leading-tight text-[#081C15]">
								Grow with intention.
							</h3>
							<div className="space-y-3">
								<div className="flex items-center gap-3 rounded-xl bg-[#F4FBF7] p-4">
									<div className="h-8 w-8 rounded-full bg-[#2D6A4F]" />
									<div>
										<p className="font-sprout-body text-sm font-medium text-[#081C15]">
											Rooted Analytics
										</p>
										<p className="font-sprout-body text-xs text-[#52796F]">
											Data that grows with you
										</p>
									</div>
								</div>
								<div className="flex items-center gap-3 rounded-xl bg-[#F4FBF7] p-4">
									<div className="h-8 w-8 rounded-full bg-[#95D5B2]" />
									<div>
										<p className="font-sprout-body text-sm font-medium text-[#081C15]">
											Organic Scaling
										</p>
										<p className="font-sprout-body text-xs text-[#52796F]">
											No forced growth, just flow
										</p>
									</div>
								</div>
							</div>
							<div className="mt-6 flex gap-3">
								<a
									href="/showcase"
									className="font-sprout-body rounded-full bg-[#2D6A4F] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#081C15]"
								>
									Plant your idea
								</a>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Theme 8: Fizz */}
			<section className="relative overflow-hidden bg-[#FFFAF5] px-6 py-24">
				<div className="relative z-10 mx-auto max-w-5xl">
					<div className="mb-12 flex items-baseline gap-4">
						<span className="text-xs tracking-[0.2em] text-[#F4A261] uppercase">
							08
						</span>
						<div>
							<h2 className="font-fizz-head text-3xl font-semibold text-[#2A1810]">
								Fizz
							</h2>
							<p className="font-fizz-body mt-1 text-sm text-[#A68A64]">
								Warm, bubbly energy. Serious product, casual vibe.
							</p>
						</div>
					</div>

					<div className="grid gap-8 md:grid-cols-2">
						<div className="space-y-4">
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full border border-[#FDE68A] bg-[#FFFAF5] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#2A1810]">
										Cream Soda
									</p>
									<p className="font-mono text-xs text-[#A68A64]">#FFFAF5</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full bg-[#F4A261] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#2A1810]">
										Tangerine
									</p>
									<p className="font-mono text-xs text-[#A68A64]">#F4A261</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full bg-[#E9C46A] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#2A1810]">Golden</p>
									<p className="font-mono text-xs text-[#A68A64]">#E9C46A</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full bg-[#2A1810] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#2A1810]">Espresso</p>
									<p className="font-mono text-xs text-[#A68A64]">#2A1810</p>
								</div>
							</div>
						</div>

						<div className="fizz-float rounded-3xl border border-[#FDE68A]/50 bg-white p-8 shadow-sm">
							<div className="mb-6 flex items-center justify-between">
								<span className="font-fizz-body text-xs tracking-[0.2em] text-[#A68A64] uppercase">
									Product
								</span>
								<span className="font-fizz-body rounded-full bg-[#F4A261] px-3 py-1 text-xs font-medium text-white">
									Beta
								</span>
							</div>
							<h3 className="font-fizz-head mb-3 text-4xl leading-tight text-[#2A1810]">
								Your ideas,
								<br />
								<span className="text-[#F4A261]">carbonated.</span>
							</h3>
							<p className="font-fizz-body mb-6 text-sm leading-relaxed text-[#A68A64]">
								We take the flat and make it fantastic. Tools for creators who
								don't take themselves too seriously — but ship like they do.
							</p>
							<div className="grid grid-cols-2 gap-3">
								<div className="rounded-2xl bg-[#FFFAF5] p-4 text-center">
									<p className="font-fizz-head text-2xl text-[#F4A261]">2x</p>
									<p className="font-fizz-body text-xs text-[#A68A64]">
										Faster builds
									</p>
								</div>
								<div className="rounded-2xl bg-[#FFFAF5] p-4 text-center">
									<p className="font-fizz-head text-2xl text-[#E9C46A]">100+</p>
									<p className="font-fizz-body text-xs text-[#A68A64]">
										Happy teams
									</p>
								</div>
							</div>
							<div className="mt-6">
								<a
									href="/showcase"
									className="font-fizz-body inline-flex items-center gap-2 rounded-full bg-[#F4A261] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2A1810]"
								>
									Pop the hood
									<svg
										className="h-4 w-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1.5}
											d="M17 8l4 4m0 0l-4 4m4-4H3"
										/>
									</svg>
								</a>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Theme 9: Orbit */}
			<section className="relative overflow-hidden bg-[#F8F6FF] px-6 py-24">
				<div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-[#6C5CE7]/5 blur-3xl" />
				<div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#A29BFE]/10 blur-3xl" />
				<div className="relative z-10 mx-auto max-w-5xl">
					<div className="mb-12 flex items-baseline gap-4">
						<span className="text-xs tracking-[0.2em] text-[#6C5CE7] uppercase">
							09
						</span>
						<div>
							<h2 className="font-orbit-head text-3xl font-semibold text-[#1E1B4B]">
								Orbit
							</h2>
							<p className="font-orbit-body mt-1 text-sm text-[#7C7DBF]">
								Airy, weightless, and forward-facing.
							</p>
						</div>
					</div>

					<div className="grid gap-8 md:grid-cols-2">
						<div className="space-y-4">
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full border border-[#DDD6FE] bg-[#F8F6FF] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#1E1B4B]">
										Lavender Mist
									</p>
									<p className="font-mono text-xs text-[#7C7DBF]">#F8F6FF</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full bg-[#6C5CE7] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#1E1B4B]">Violet</p>
									<p className="font-mono text-xs text-[#7C7DBF]">#6C5CE7</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full bg-[#A29BFE] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#1E1B4B]">
										Periwinkle
									</p>
									<p className="font-mono text-xs text-[#7C7DBF]">#A29BFE</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full bg-[#1E1B4B] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#1E1B4B]">Midnight</p>
									<p className="font-mono text-xs text-[#7C7DBF]">#1E1B4B</p>
								</div>
							</div>
						</div>

						<div className="orbit-glow relative rounded-3xl border border-[#DDD6FE]/50 bg-white/80 p-8 shadow-sm backdrop-blur-sm">
							<div className="mb-6 flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-[#6C5CE7]" />
								<span className="font-orbit-body text-xs tracking-[0.2em] text-[#7C7DBF] uppercase">
									Platform
								</span>
							</div>
							<h3 className="font-orbit-head mb-4 text-3xl leading-tight text-[#1E1B4B]">
								Design at
								<br />
								<span className="text-[#6C5CE7]">light speed.</span>
							</h3>
							<div className="mb-6 flex gap-4">
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6C5CE7]/10">
									<svg
										className="h-5 w-5 text-[#6C5CE7]"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1.5}
											d="M13 10V3L4 14h7v7l9-11h-7z"
										/>
									</svg>
								</div>
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#A29BFE]/20">
									<svg
										className="h-5 w-5 text-[#6C5CE7]"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1.5}
											d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
										/>
									</svg>
								</div>
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#DDD6FE]/30">
									<svg
										className="h-5 w-5 text-[#6C5CE7]"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1.5}
											d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
										/>
									</svg>
								</div>
							</div>
							<p className="font-orbit-body mb-6 text-sm leading-relaxed text-[#7C7DBF]">
								Prototyping, collaboration, and handoff — unified in one
								weightless workspace. No friction, just flow.
							</p>
							<a
								href="/showcase"
								className="font-orbit-body inline-flex items-center gap-2 rounded-full bg-[#6C5CE7] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1E1B4B]"
							>
								Enter orbit
								<svg
									className="h-4 w-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={1.5}
										d="M17 8l4 4m0 0l-4 4m4-4H3"
									/>
								</svg>
							</a>
						</div>
					</div>
				</div>
			</section>

			{/* Theme 10: Draft */}
			<section className="relative overflow-hidden bg-[#FAFAF8] px-6 py-24">
				<div className="relative z-10 mx-auto max-w-5xl">
					<div className="mb-12 flex items-baseline gap-4">
						<span className="text-xs tracking-[0.2em] text-[#E17055] uppercase">
							10
						</span>
						<div>
							<h2 className="font-draft-head text-3xl font-semibold text-[#2D3436]">
								Draft
							</h2>
							<p className="font-draft-body mt-1 text-sm text-[#8D817C]">
								Warm minimalism for the detail-obsessed.
							</p>
						</div>
					</div>

					<div className="grid gap-8 md:grid-cols-2">
						<div className="space-y-4">
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full border border-[#E7E5E4] bg-[#FAFAF8] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#2D3436]">
										Warm Parchment
									</p>
									<p className="font-mono text-xs text-[#8D817C]">#FAFAF8</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full bg-[#E17055] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#2D3436]">
										Terracotta
									</p>
									<p className="font-mono text-xs text-[#8D817C]">#E17055</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full bg-[#FDCB6E] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#2D3436]">Honey</p>
									<p className="font-mono text-xs text-[#8D817C]">#FDCB6E</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-full bg-[#2D3436] shadow-sm" />
								<div>
									<p className="text-sm font-medium text-[#2D3436]">Ink</p>
									<p className="font-mono text-xs text-[#8D817C]">#2D3436</p>
								</div>
							</div>
						</div>

						<div className="rounded-2xl border border-[#E7E5E4] bg-white p-8 shadow-sm">
							<div className="mb-6 flex items-center gap-3">
								<span className="font-draft-body text-xs tracking-[0.2em] text-[#8D817C] uppercase">
									Process
								</span>
								<div className="h-[1px] flex-1 bg-[#E7E5E4]" />
							</div>
							<h3 className="font-draft-head mb-6 text-3xl leading-tight text-[#2D3436]">
								Crafted to perfection.
							</h3>
							<div className="space-y-4">
								<div className="flex items-start gap-4">
									<span className="font-draft-body mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#E17055] text-xs font-medium text-white">
										1
									</span>
									<div>
										<p className="font-draft-body text-sm font-medium text-[#2D3436]">
											Discover
										</p>
										<p className="font-draft-body text-xs text-[#8D817C]">
											Understand the problem deeply
										</p>
									</div>
								</div>
								<div className="flex items-start gap-4">
									<span className="font-draft-body mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#FDCB6E] text-xs font-medium text-[#2D3436]">
										2
									</span>
									<div>
										<p className="font-draft-body text-sm font-medium text-[#2D3436]">
											Prototype
										</p>
										<p className="font-draft-body text-xs text-[#8D817C]">
											Build fast, test early
										</p>
									</div>
								</div>
								<div className="flex items-start gap-4">
									<span className="font-draft-body mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#2D3436] text-xs font-medium text-white">
										3
									</span>
									<div>
										<p className="font-draft-body text-sm font-medium text-[#2D3436]">
											Refine
										</p>
										<p className="font-draft-body text-xs text-[#8D817C]">
											Every detail, considered
										</p>
									</div>
								</div>
							</div>
							<div className="mt-8 border-t border-[#E7E5E4] pt-6">
								<a
									href="/showcase"
									className="font-draft-body inline-flex items-center gap-2 text-sm font-medium text-[#2D3436] transition-colors hover:text-[#E17055]"
								>
									See our work
									<span className="text-lg">→</span>
								</a>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Comparison / Recommendation — Startup Spark */}
			<section className="bg-[#F7F9FC] px-6 py-24">
				<div className="mx-auto max-w-4xl text-center">
					<p className="mb-4 text-xs tracking-[0.3em] text-[#64748B] uppercase">
						My Suggestion
					</p>
					<h2 className="font-signal-head mb-8 text-4xl font-semibold text-[#0A0E27]">
						Startup Spark: <em className="text-[#3B5BFE]">Signal</em> or{' '}
						<em className="text-[#6C5CE7]">Orbit</em>
					</h2>
					<p className="mx-auto mb-12 max-w-2xl leading-relaxed text-[#64748B]">
						Signal is the boldest choice — electric, confident, and impossible
						to ignore. Orbit feels weightless and futuristic without losing
						warmth. Sprout if you want growth-minded energy. Fizz if you want to
						lead with personality. Draft if precision and craft are your brand.
					</p>
					<div className="flex flex-wrap justify-center gap-4 text-sm">
						<span className="rounded-full border border-[#E2E8F0] px-4 py-2 text-[#64748B]">
							Crisp & light ✓
						</span>
						<span className="rounded-full border border-[#E2E8F0] px-4 py-2 text-[#64748B]">
							Bubbly corners ✓
						</span>
						<span className="rounded-full border border-[#E2E8F0] px-4 py-2 text-[#64748B]">
							Startup energy ✓
						</span>
						<span className="rounded-full border border-[#E2E8F0] px-4 py-2 text-[#64748B]">
							Serious craft ✓
						</span>
					</div>
				</div>
			</section>
		</div>
	)
}
