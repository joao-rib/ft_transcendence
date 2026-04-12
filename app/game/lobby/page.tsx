"use client";

import GameBackground from "../../frontend/game/components/GameBackground";
import GameMatchSection from "../../frontend/game/components/GameMatchSection";
import GamePlayerSidebar from "../../frontend/game/components/GamePlayerSidebar";
import { useGameController } from "../../frontend/game/hooks/useGameController";

export default function GamePage() {
	const {
		playerName,
		playerStats,
		handleDisconnect,
		handleSettings,
		handleRankings,
		handleStartGame,
	} = useGameController();

	//TODO: Como fazer redirect do botao de play para a parte do jogo em si?
	//TODO: Como usar getters/setters?

	return (
		<div className="relative min-h-screen overflow-hidden font-sans">
			<GameBackground />

			<div className="relative z-10 flex min-h-screen">
				<GamePlayerSidebar
					playerName={playerName}
					rank={playerStats.rank}
					wins={playerStats.wins}
					losses={playerStats.losses}
					onSettings={handleSettings}
					onDisconnect={handleDisconnect}
				/>
				
				<GameMatchSection
					onRankings={handleRankings}
					onStartGame={handleStartGame}
				/>
			</div>
		</div>
	);
}
