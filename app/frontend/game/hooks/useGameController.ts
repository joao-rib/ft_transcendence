"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function useGameController() {
	const router = useRouter();
	const [playerName] = useState("Player");
	const [playerStats] = useState({
		wins: 0,
		losses: 0,
		rank: "Beginner",
	});

	const createGameId = () => {
		if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
			return crypto.randomUUID();
		}

		return `game-${Date.now()}`;
	};

	const handleDisconnect = () => {
		router.push("/");
	};

	const handleSettings = () => {
		router.push("/rules");
	};

	const handleRankings = () => {
		router.push("/rankings");
	};

	const handleStartGame = () => {
		const gameId = createGameId();
		const username = encodeURIComponent(playerName.toLowerCase());
		router.push(`/game?gameId=${gameId}&username=${username}`);
	};

	return {
		playerName,
		playerStats,
		handleDisconnect,
		handleSettings,
		handleRankings,
		handleStartGame,
	};
}
