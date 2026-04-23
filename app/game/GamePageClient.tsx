'use client'

import { useEffect, useReducer, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Board from '@/app/components/chess_game/Board'
import CompactChat from '@/app/components/compact-chat'
import { initGameState, Status } from '../components/chess_game/constants'
import Control from '../components/chess_game/Control/Control'
import TakeBack from '../components/chess_game/Control/bits/TakeBack'
import Resign from '../components/chess_game/Control/bits/Resign'
import { reducer } from '../components/chess_game/reducer/reducer'
import AppContext from '../contexts/Context'
import { useOnlineGameSync } from '../frontend/game/hooks/useOnlineGameSync'
import { applyBoardTheme, getStoredBoardTheme } from '../frontend/game/utils/boardTheme'
import { useCrossTabGameSync } from './useCrossTabGameSync'

export default function GamePageClient() {
  const router = useRouter()
  const hasRedirectedToLobbyRef = useRef(false)
  const searchParams = useSearchParams()
  const gameId = searchParams.get('gameId')
  const playerId = searchParams.get('playerId')
  const playerToken = searchParams.get('playerToken')
  const username = searchParams.get('username')
  const [appState, dispatch] = useReducer(reducer, initGameState)

  useEffect(() => {
    applyBoardTheme(getStoredBoardTheme())
  }, [])

  const onlineGame = useOnlineGameSync({
    appState,
    dispatch,
    gameId,
    playerId,
    playerToken,
    username,
  })

  useCrossTabGameSync(appState, dispatch, !onlineGame.isOnlineGame)

  useEffect(() => {
    const isGameOver = appState.status !== Status.ongoing && appState.status !== Status.promoting

    if (!onlineGame.isOnlineGame || !isGameOver || hasRedirectedToLobbyRef.current) {
      return
    }

    hasRedirectedToLobbyRef.current = true
    router.replace('/game/lobby')
  }, [appState.status, onlineGame.isOnlineGame, router])

  // Don't render the game until online games have received playerColor from server
  const isReadyToRender = !onlineGame.isOnlineGame || (onlineGame.isOnlineGame && onlineGame.playerColor !== null)

  const providerState = {
    appState,
    dispatch,
    onlineGame: {
      ...onlineGame,
      gameId,
      playerId,
      playerToken,
      username,
    },
  }

  return (
    <AppContext.Provider value={providerState}>
      <div className='App'>
        {isReadyToRender ? (
          <>
            <Board />
            <Control>
              {!onlineGame.isOnlineGame ? <TakeBack /> : null}
              <Resign />
              <div style={{ marginTop: '12px', minWidth: '260px' }}>
                <CompactChat maxHeight='max-h-80' />
              </div>
            </Control>
          </>
        ) : (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            Connecting to game...
          </div>
        )}
      </div>
    </AppContext.Provider>
  )
}
