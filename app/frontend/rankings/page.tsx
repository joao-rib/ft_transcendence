"use client";

import Background from "../components/Background";
import { useEffect, useState } from "react";
import RankingsBackLink from "./components/RankingsBackLink";
import RankingsHero from "./components/RankingsHero";
import RankingsLoading from "./components/RankingsLoading";
import RankingsError from "./components/RankingsError";
import RankingsTable from "./components/RankingsTable";

interface LeaderboardEntry {
	rank: number;
	username: string;
	wins: number;
	losses: number;
	rating: number;
	winRate: number;
}

export default function Rankings() {
	const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// TODO: Replace with actual API call to fetch leaderboard from database
		// const fetchLeaderboard = async () => {
		// 	try {
		// 		const response = await fetch("/api/leaderboard");
		// 		const data = await response.json();
		// 		setLeaderboard(data);
		// 		setLoading(false);
		// 	} catch (err) {
		// 		setError("Failed to load leaderboard");
		// 		setLoading(false);
		// 	}
		// };
		// fetchLeaderboard();

		// Mock data for template
		const mockData: LeaderboardEntry[] = [
			{ rank: 1, username: "MasterPlayer", wins: 157, losses: 23, rating: 2450, winRate: 87.2 },
			{ rank: 2, username: "ChessNinja", wins: 142, losses: 38, rating: 2380, winRate: 78.9 },
			{ rank: 3, username: "StrategyKing", wins: 128, losses: 42, rating: 2310, winRate: 75.3 },
			{ rank: 4, username: "TacticalMind", wins: 115, losses: 55, rating: 2210, winRate: 67.6 },
			{ rank: 5, username: "GrandMaster", wins: 103, losses: 47, rating: 2180, winRate: 68.7 },
			{ rank: 6, username: "BoardMaster", wins: 98, losses: 52, rating: 2140, winRate: 65.3 },
			{ rank: 7, username: "QuietMove", wins: 87, losses: 63, rating: 2050, winRate: 58.0 },
			{ rank: 8, username: "PawnPusher", wins: 76, losses: 74, rating: 1980, winRate: 50.7 },
			{ rank: 9, username: "EndgameWizard", wins: 69, losses: 81, rating: 1920, winRate: 46.0 },
			{ rank: 10, username: "OpeningBookworm", wins: 61, losses: 89, rating: 1850, winRate: 40.7 },
		];

		setLeaderboard(mockData);
		setLoading(false);
	}, []);

	return (
		<div className="relative min-h-screen overflow-hidden font-sans">
			<Background />

			<RankingsBackLink />

			<main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-8 py-20">
				<div className="w-full max-w-5xl mx-auto space-y-8">
					<RankingsHero />

					{loading && <RankingsLoading />}

					{error && <RankingsError message={error} />}

					{!loading && !error && <RankingsTable leaderboard={leaderboard} />}
				</div>
			</main>
		</div>
	);
}