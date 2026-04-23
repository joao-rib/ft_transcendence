"use client";

import { useEffect, useState } from "react";

export function useGameController() {
  // Safe defaults prevent the UI from breaking before the fetch resolves.
  const [playerName, setPlayerName] = useState("Player");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [playerStats, setPlayerStats] = useState({
    wins: 0,
    losses: 0,
    rank: 0,
  });

  useEffect(() => {
    const loadLobbyPlayerData = async () => {
      try {
        const response = await fetch("/api/lobby/player", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          console.error("[useGameController] Failed to fetch player data");
          return;
        }

        const data = await response.json();
        // Response mapping:
        // Account.username -> playerName
        // Account.avatarUrl -> avatarUrl
        // Score.gamesPlayed/gamesWon/gamesLost -> rank/wins/losses
        setPlayerName(data.playerName ?? "Player");
        setAvatarUrl(data.avatarUrl ?? null);
        setPlayerStats({
          rank: data.playerStats?.rank ?? 0,
          wins: data.playerStats?.wins ?? 0,
          losses: data.playerStats?.losses ?? 0,
        });
      } catch (error) {
        console.error("[useGameController] Error loading player data:", error);
      }
    };

    loadLobbyPlayerData();
  }, []);

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
    avatarUrl,
    playerStats,
    handleDisconnect,
    handleSettings,
    handleRankings,
    handleStartGame,
  };
}