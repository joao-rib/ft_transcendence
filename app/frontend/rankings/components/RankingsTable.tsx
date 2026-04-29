interface LeaderboardEntry {
	rank: number;
	username: string;
	wins: number;
	losses: number;
	rating: number;
	winRate: number;
}

export default function RankingsTable({ leaderboard }: { leaderboard: LeaderboardEntry[] }) {
	return (
		<div
			className="rounded-xl border overflow-hidden"
			style={{
				backgroundColor: "var(--overlay-light)",
				borderColor: "var(--border-secondary)",
			}}
		>
			<table className="w-full">
				<thead>
					<tr style={{ borderBottomColor: "var(--border-secondary)", borderBottomWidth: "1px" }}>
						<th className="px-6 py-4 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>
							Rank
						</th>
						<th className="px-6 py-4 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>
							Player
						</th>
						<th className="px-6 py-4 text-center font-semibold" style={{ color: "var(--text-secondary)" }}>
							Rating
						</th>
						<th className="px-6 py-4 text-center font-semibold" style={{ color: "var(--text-secondary)" }}>
							Wins
						</th>
						<th className="px-6 py-4 text-center font-semibold" style={{ color: "var(--text-secondary)" }}>
							Losses
						</th>
						<th className="px-6 py-4 text-right font-semibold" style={{ color: "var(--text-secondary)" }}>
							Win Rate
						</th>
					</tr>
				</thead>
				<tbody>
					{leaderboard.map((entry, index) => (
						<tr
							key={entry.rank}
							style={{
								borderBottomColor: "var(--border-secondary)",
								borderBottomWidth: index < leaderboard.length - 1 ? "1px" : "0px",
							}}
						>
							<td
								className="px-6 py-4 font-bold text-lg"
								style={{
									color: entry.rank <= 3 ? "var(--text-accent)" : "var(--text-primary)",
								}}
							>
								{entry.rank <= 3 ? ["🥇", "🥈", "🥉"][entry.rank - 1] : entry.rank}
							</td>
							<td
								className="px-6 py-4"
								style={{ color: "var(--text-primary)" }}
							>
								{entry.username}
							</td>
							<td
								className="px-6 py-4 text-center font-semibold"
								style={{ color: "var(--text-accent)" }}
							>
								{entry.rating}
							</td>
							<td
								className="px-6 py-4 text-center"
								style={{ color: "var(--text-primary)" }}
							>
								{entry.wins}
							</td>
							<td
								className="px-6 py-4 text-center"
								style={{ color: "var(--text-secondary)" }}
							>
								{entry.losses}
							</td>
							<td
								className="px-6 py-4 text-right"
								style={{ color: "var(--text-primary)" }}
							>
								{entry.winRate.toFixed(1)}%
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}