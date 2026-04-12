const tutorials = [
	"Chess Basics and Piece Movement",
	"Openings, Tactics, and Midgame Ideas",
	"Endgames and Checkmate Patterns",
];

export default function RulesTutorialsCard() {
	return (
		<div
			className="backdrop-blur-xl border rounded-3xl p-10 shadow-2xl"
			style={{
				backgroundColor: "var(--overlay-light)",
				borderColor: "var(--border-primary)",
			}}
		>
			<h2 className="text-3xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
				Video Tutorials
			</h2>
			<div className="space-y-6">
				{tutorials.map((title) => (
					<div
						key={title}
						className="border rounded-xl p-8"
						style={{
							backgroundColor: "var(--overlay-light)",
							borderColor: "var(--border-secondary)",
						}}
					>
						<h3 className="text-xl font-semibold mb-4" style={{ color: "var(--text-secondary)" }}>
							{title}
						</h3>
						<div
							className="aspect-video rounded-lg flex items-center justify-center border-2 border-dashed"
							style={{
								backgroundColor: "var(--overlay-medium)",
								borderColor: "var(--border-secondary)",
							}}
						>
							<p className="text-center" style={{ color: "var(--text-muted)" }}>
								Video tutorial coming soon...
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
