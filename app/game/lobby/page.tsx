"use client";

import GameBackground from "../../frontend/game/components/GameBackground";
import GameFriendsPanel from "../../frontend/game/components/GameFriendsPanel";
import GameMatchSection from "../../frontend/game/components/GameMatchSection";
import GamePlayerSidebar from "../../frontend/game/components/GamePlayerSidebar";
import GameSettingsPanel from "../../frontend/game/components/GameSettingsPanel";
import { useGameController } from "../../frontend/game/hooks/useGameController";

export default function GamePage() {
	const {
		boardTheme,
		closeFriends,
		closeSettings,
		friends,
		handleBoardThemeChange,
		playerName,
		playerStats,
		handleDisconnect,
		handleFriends,
		handleSettings,
		handleRankings,
		handleStartGame,
		isFriendsOpen,
		isSettingsOpen,
	} = useGameController();

	return (
		<div className="relative min-h-screen overflow-hidden font-sans">
			<GameBackground />

			<div className="relative z-10 flex min-h-screen">
				<GamePlayerSidebar
					playerName={playerName}
					rank={playerStats.rank}
					wins={playerStats.wins}
					losses={playerStats.losses}
					onFriends={handleFriends}
					onSettings={handleSettings}
					onDisconnect={handleDisconnect}
				/>

				<div className="relative flex-1">
					<GameMatchSection onRankings={handleRankings} onStartGame={handleStartGame} />
					<GameFriendsPanel isOpen={isFriendsOpen} friends={friends} onClose={closeFriends} />
					<GameSettingsPanel
						isOpen={isSettingsOpen}
						boardTheme={boardTheme}
						onBoardThemeChange={handleBoardThemeChange}
						onClose={closeSettings}
					/>
				</div>
			</div>
		</div>
	);
}
