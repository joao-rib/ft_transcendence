'use client'

import { useReducer } from 'react'
import Board from '@/app/components/chess_game/Board'
import CompactChat from '@/app/components/compact-chat'
import { initGameState } from '../components/chess_game/constants'
import Control from '../components/chess_game/Control/Control'
import TakeBack from '../components/chess_game/Control/bits/TakeBack'
import Resign from '../components/chess_game/Control/bits/Resign'
import { reducer } from '../components/chess_game/reducer/reducer'
import AppContext from '../contexts/Context'
import { useCrossTabGameSync } from './useCrossTabGameSync'

export default function GamePage() {
  const [appState, dispatch] = useReducer(reducer, initGameState)

  useCrossTabGameSync(appState, dispatch)

  const providerState = {
    appState,
    dispatch,
  }

  return (
    <AppContext.Provider value={providerState}>
      <div className='App'>
        <Board />
        <Control>
          <TakeBack />
          <Resign />
          <div style={{ marginTop: '12px', minWidth: '260px' }}>
            <CompactChat maxHeight='max-h-80' />
          </div>
        </Control>
      </div>
    </AppContext.Provider>
  )
}
