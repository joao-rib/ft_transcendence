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
import AppContext from '../contexts/Context'
import { reducer } from "../contexts/reducer/reducer";
import { initGameState } from "../constant"

export default function GamePage() {

	const [appstate,dispatch] = useReducer(reducer, initGameState)

	const providerState = {
		appstate,
		dispatch,
	}

  	return (
		<AppContext.Provider value={{ providerState }} >
    		<div className='App'>
    	  		<Board/>
    		</div>
		</AppContext.Provider>
  	);
}
