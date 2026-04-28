interface GamePlayerSidebarProps {
	playerName: string;
	rank: string;
	wins: number;
	losses: number;
	onSettings: () => void;
	onDisconnect: () => void;
}

export default function GamePlayerSidebar({
	playerName,
	rank,
	wins,
	losses,
	onSettings,
	onDisconnect,
}: GamePlayerSidebarProps) {
	return (
		<aside className="w-96 flex-shrink-0 p-6" style={{ borderRight: `1px solid var(--border-secondary)` }}>
			<div
				className="backdrop-blur-xl rounded-2xl p-6 h-full flex flex-col space-y-6"
				style={{
					backgroundColor: "var(--overlay-light)",
					border: `1px solid var(--border-primary)`,
				}}
			>
				{/* Player Avatar & Name */}
				<div className="text-center space-y-3">
					<div
						className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl font-bold text-slate-900 border-4"
						style={{
							background: `linear-gradient(to bottom right, var(--avatar-start), var(--avatar-mid), var(--avatar-end))`,
							borderColor: "var(--avatar-border)",
						}}
					>
						{playerName.charAt(0).toUpperCase()}
					</div>
					<h2
						className="text-2xl font-bold text-transparent bg-clip-text"
						style={{
							backgroundImage: `linear-gradient(to right, var(--gradient-start), var(--gradient-mid), var(--gradient-end))`,
						}}
					>
						{playerName}
					</h2>
				</div>

				{/* Player Stats */}
				<div className="space-y-3 flex-grow">
					<div
						className="rounded-xl p-4"
						style={{
							backgroundColor: "var(--overlay-light)",
							border: `1px solid var(--border-secondary)`,
						}}
					>
						<p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>
							Rank
						</p>
						{rank}
					</div>
					<div
						className="rounded-xl p-4"
						style={{
							backgroundColor: "var(--overlay-light)",
							border: `1px solid var(--border-secondary)`,
						}}
					>
						<p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>
							Wins
						</p>
						{wins}
					</div>
					<div
						className="rounded-xl p-4"
						style={{
							backgroundColor: "var(--overlay-light)",
							border: `1px solid var(--border-secondary)`,
						}}
					>
						<p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>
							Losses
						</p>
						{losses}
					</div>
				</div>

				{/* Action Buttons */}
				<div className="space-y-3 pt-4" style={{ borderTop: `1px solid var(--border-secondary)` }}>
					<button
						onClick={onSettings}
						className="w-full px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02]"
						style={{
							backgroundColor: "var(--overlay-light)",
							border: `1px solid var(--border-primary)`,
							color: "var(--text-primary)",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.backgroundColor = "var(--overlay-medium)";
							e.currentTarget.style.borderColor = "var(--border-hover)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.backgroundColor = "var(--overlay-light)";
							e.currentTarget.style.borderColor = "var(--border-primary)";
						}}
					>
						⚙️ Settings
					</button>
					<button
						onClick={onDisconnect}
						className="w-full px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02]"
						style={{
							backgroundColor: "var(--danger-bg)",
							border: `1px solid var(--danger-border)`,
							color: "var(--danger-text)",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.backgroundColor = "var(--danger-bg-hover)";
							e.currentTarget.style.borderColor = "var(--danger-border-hover)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.backgroundColor = "var(--danger-bg)";
							e.currentTarget.style.borderColor = "var(--danger-border)";
						}}
					>
						🚪 Disconnect
					</button>
				</div>
			</div>
		</aside>
	);
}
