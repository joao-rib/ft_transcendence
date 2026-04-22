"use client";

import { useState } from "react";
import { useBoardThemeSettings } from "./useBoardThemeSettings";

export function useGameController() {
	const [playerName] = useState("Player");
	const [playerStats] = useState({
		wins: 0,
		losses: 0,
		rank: "Beginner",
	});
	const [isFriendsOpen, setIsFriendsOpen] = useState(false);
	const [friends] = useState([
		{ id: "1", name: "Ana", status: "online" as const },
		{ id: "2", name: "Rui", status: "offline" as const },
		{ id: "3", name: "Marta", status: "online" as const },
	]);
	const {
		boardTheme,
		closeSettings,
		handleBoardThemeChange,
		isSettingsOpen,
		toggleSettings,
	} = useBoardThemeSettings();

	const handleDisconnect = () => {
		console.log("Disconnecting...");
	};

	const handleRankings = () => {
		console.log("Opening rankings...");
	};

	const handleStartGame = () => {
		console.log("Starting game...");
	};

	const handleFriends = () => {
		setIsFriendsOpen((currentValue) => !currentValue);
	};

	const closeFriends = () => {
		setIsFriendsOpen(false);
	};

	return {
		boardTheme,
		closeFriends,
		closeSettings,
		friends,
		handleBoardThemeChange,
		handleDisconnect,
		handleFriends,
		handleRankings,
		handleStartGame,
		handleSettings: toggleSettings,
		isFriendsOpen,
		isSettingsOpen,
		playerName,
		playerStats,
	};
}
