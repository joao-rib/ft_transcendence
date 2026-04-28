export default function GameBackground() {
	return (
		<>
			{/* Background */}
			<div
				className="absolute inset-0"
				style={{
					background: `linear-gradient(to bottom right, var(--bg-primary), var(--bg-secondary), var(--bg-accent))`,
				}}
			></div>

			{/* Subtle grid pattern */}
			<div
				className="absolute inset-0"
				style={{
					opacity: "var(--grid-opacity)",
					backgroundImage: `linear-gradient(var(--grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-color) 1px, transparent 1px)`,
					backgroundSize: "50px 50px",
				}}
			></div>
		</>
	);
}
