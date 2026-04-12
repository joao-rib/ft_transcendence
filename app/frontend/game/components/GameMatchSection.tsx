interface GameMatchSectionProps {
	onRankings: () => void;
	onStartGame: () => void;
}

export default function GameMatchSection({ onRankings, onStartGame }: GameMatchSectionProps) {
	return (
		<main className="flex-1 flex items-center justify-center p-12">
			<div className="w-full max-w-2xl space-y-8">
				<h1
					className="text-5xl font-bold text-transparent bg-clip-text text-center mb-12"
					style={{
						backgroundImage: `linear-gradient(to right, var(--gradient-start), var(--gradient-mid), var(--gradient-end))`,
					}}
				>
					♟️ Chess Match! ♟️
				</h1>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Rankings Button */}
					<button
						onClick={onRankings}
						className="group backdrop-blur-xl rounded-3xl p-10 transition-all duration-300 hover:scale-105"
						style={{
							backgroundColor: "var(--overlay-light)",
							border: `1px solid var(--border-primary)`,
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.backgroundColor = "var(--overlay-medium)";
							e.currentTarget.style.borderColor = "var(--border-active)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.backgroundColor = "var(--overlay-light)";
							e.currentTarget.style.borderColor = "var(--border-primary)";
						}}
					>
						<div className="text-6xl mb-4">🏆</div>
						<h2
							className="text-3xl font-bold text-transparent bg-clip-text mb-2"
							style={{
								backgroundImage: `linear-gradient(to right, var(--gradient-start), var(--gradient-end))`,
							}}
						>
							Rankings
						</h2>
						<p style={{ color: "var(--text-muted)" }}>View leaderboard</p>
					</button>

					{/* Start Game Button */}
					<button
						onClick={onStartGame}
						className="group backdrop-blur-xl rounded-3xl p-10 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
						style={{
							background: `linear-gradient(to bottom right, var(--btn-primary-bg), var(--btn-primary-bg))`,
							border: `2px solid var(--btn-primary-border)`,
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.borderColor = "var(--btn-primary-hover-border)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.borderColor = "var(--btn-primary-border)";
						}}
					>
						<div className="text-6xl mb-4">🎮</div>
						<h2
							className="text-3xl font-bold text-transparent bg-clip-text mb-2"
							style={{
								backgroundImage: `linear-gradient(to right, var(--gradient-start), var(--gradient-end))`,
							}}
						>
							Start Game
						</h2>
						<p className="font-medium" style={{ color: "var(--text-primary)" }}>
							Find a match
						</p>
					</button>
				</div>
			</div>
		</main>
	);
}
