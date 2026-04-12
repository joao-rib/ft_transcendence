"use client";

import type { FormEvent } from "react";
import { useState } from "react";

export function useGameController() {
	const [playerName, setPlayerName] = useState("Player");
	const [playerStats, setPlayerStats] = useState({
		wins: 0,
		losses: 0,
		rank: "Beginner",
	});

	const handleDisconnect = () => {
		console.log("Disconnecting...");
	};

	const handleSettings = () => {
		console.log("Opening settings...");
	};

	const handleRankings = () => {
		console.log("Opening rankings...");
	};

	const handleStartGame = () => {
		console.log("Starting game...");
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
