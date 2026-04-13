/* import { Suspense } from "react";
import ChessGame from "@/app/components/chess-game";

interface GamePageProps {
  searchParams: Promise<{ gameId?: string; username?: string }>;
}

export default async function GamePage({ searchParams }: GamePageProps) {
  const { gameId = "default-game", username = "player" } = await searchParams;

  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-7xl px-6 py-10">Loading game...</div>}>
      <ChessGame gameId={gameId} username={username} />
    </Suspense>
  );
} */

'use client'

import { useReducer } from 'react'
import Board from "@/app/components/chess_game/Board";
import { initGameState } from "../components/chess_game/constant"
import AppContext from '../contexts/Context'
import { reducer } from "../components/chess_game/reducer/reducer";

export default function GamePage() {

	const [appState, dispatch] = useReducer(reducer, initGameState)

	const providerState = {
		appState,
		dispatch,
	}

  	return (
		<AppContext.Provider value={ providerState } >
    		<div className='App'>
    	  		<Board/>
    		</div>
		</AppContext.Provider>
  	);
}
