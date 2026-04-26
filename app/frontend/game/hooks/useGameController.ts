"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useBoardThemeSettings } from "./useBoardThemeSettings";
import { useRandomMatchmaking } from "./useRandomMatchmaking";

export function useGameController() {
  const router = useRouter();

  // Safe defaults prevent the UI from breaking before the fetch resolves.
  const [playerName, setPlayerName] = useState("Player");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [playerStats, setPlayerStats] = useState({
    wins: 0,
    losses: 0,
    rank: 0,
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
  const { isSearching, matchStatus, startMatchmaking } = useRandomMatchmaking();

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

  const handleDisconnect = async () => {
    try {
      // Sign out using NextAuth and redirect to login page
      await signOut({ redirect: false });
      router.push("/");
    } catch (error) {
      console.error("[useGameController] Error disconnecting:", error);
    }
  };

  const handleSettings = () => {
    console.log("Opening settings...");
  };

  const handleRankings = () => {
    console.log("Opening rankings...");
  };


  const handleStartGame = () => {
    startMatchmaking(playerName);
  };

  const handleFriends = () => {
    setIsFriendsOpen((currentValue: boolean) => !currentValue);
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
    isSearching,
    isSettingsOpen,
    matchStatus,
    playerName,
    playerStats,
  };
}