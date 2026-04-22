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

return {
boardTheme,
closeSettings,
handleBoardThemeChange,
handleDisconnect,
handleRankings,
handleStartGame,
handleSettings: toggleSettings,
isSettingsOpen,
playerName,
playerStats,
};
}
