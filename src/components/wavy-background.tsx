import { useEffect, useRef } from 'react'

export function WavyBackground() {
	const canvasRef = useRef<HTMLCanvasElement>(null)

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		const ctx = canvas.getContext('2d')
		if (!ctx) return

		let animationId: number
		let time = 0

		const resize = () => {
			const parent = canvas.parentElement
			if (parent) {
				canvas.width = parent.clientWidth
				canvas.height = parent.clientHeight
			}
		}

		resize()
		window.addEventListener('resize', resize)

		// Draw a splashy blob shape
		const drawBlob = (
			cx: number,
			cy: number,
			radius: number,
			points: number,
			noise: number,
			speed: number,
			color: string,
			rotationOffset: number = 0,
		) => {
			ctx.beginPath()
			for (let i = 0; i <= points; i++) {
				const angle = (i / points) * Math.PI * 2 + rotationOffset
				const wave1 = Math.sin(angle * 3 + time * speed) * noise
				const wave2 = Math.sin(angle * 5 + time * speed * 1.3) * noise * 0.6
				const wave3 = Math.cos(angle * 2 + time * speed * 0.7) * noise * 0.4
				const r = radius + wave1 + wave2 + wave3
				const x = cx + Math.cos(angle) * r
				const y = cy + Math.sin(angle) * r

				if (i === 0) {
					ctx.moveTo(x, y)
				} else {
					// Use quadratic curves for smooth blob
					const prevAngle = ((i - 1) / points) * Math.PI * 2 + rotationOffset
					const prevWave1 = Math.sin(prevAngle * 3 + time * speed) * noise
					const prevWave2 =
						Math.sin(prevAngle * 5 + time * speed * 1.3) * noise * 0.6
					const prevWave3 =
						Math.cos(prevAngle * 2 + time * speed * 0.7) * noise * 0.4
					const prevR = radius + prevWave1 + prevWave2 + prevWave3
					const prevX = cx + Math.cos(prevAngle) * prevR
					const prevY = cy + Math.sin(prevAngle) * prevR
					const cpX = (prevX + x) / 2
					const cpY = (prevY + y) / 2
					ctx.quadraticCurveTo(prevX, prevY, cpX, cpY)
				}
			}
			ctx.closePath()
			ctx.fillStyle = color
			ctx.fill()
		}

		const drawWave = (
			yOffset: number,
			amplitude: number,
			frequency: number,
			speed: number,
			color: string,
		) => {
			ctx.beginPath()
			ctx.moveTo(0, 0)

			for (let x = 0; x <= canvas.width; x += 3) {
				const y =
					yOffset +
					Math.sin(x * frequency + time * speed) * amplitude +
					Math.sin(x * frequency * 0.6 + time * speed * 1.4) * (amplitude * 0.7)
				ctx.lineTo(x, y)
			}

			ctx.lineTo(canvas.width, 0)
			ctx.lineTo(0, 0)
			ctx.closePath()
			ctx.fillStyle = color
			ctx.fill()
		}

		const animate = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			time += 0.002

			const w = canvas.width
			const h = canvas.height

			// Large gold blob in upper right
			drawBlob(
				w * 0.75,
				h * 0.15,
				Math.min(w, h) * 0.35,
				12,
				Math.min(w, h) * 0.08,
				0.6,
				'rgba(201, 162, 39, 0.25)',
				time * 0.1,
			)

			// Navy blob overlapping
			drawBlob(
				w * 0.55,
				h * 0.22,
				Math.min(w, h) * 0.28,
				10,
				Math.min(w, h) * 0.06,
				0.8,
				'rgba(10, 22, 40, 0.35)',
				-time * 0.15,
			)

			// Gold wave across top
			drawWave(h * 0.32, 80, 0.003, 1.2, 'rgba(201, 162, 39, 0.15)')

			// Cream wave
			drawWave(h * 0.25, 60, 0.004, 0.9, 'rgba(248, 246, 241, 0.55)')

			// Small accent blob lower left
			drawBlob(
				w * 0.15,
				h * 0.75,
				Math.min(w, h) * 0.18,
				8,
				Math.min(w, h) * 0.04,
				1.0,
				'rgba(201, 162, 39, 0.12)',
				time * 0.2,
			)

			animationId = requestAnimationFrame(animate)
		}

		animate()

		return () => {
			window.removeEventListener('resize', resize)
			cancelAnimationFrame(animationId)
		}
	}, [])

	return (
		<canvas
			ref={canvasRef}
			className="pointer-events-none absolute inset-0 z-0 h-full w-full"
		/>
	)
}
