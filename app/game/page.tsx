'use client'

import { useEffect, useReducer, useRef } from 'react'
import Board from '@/app/components/chess_game/Board'
import CompactChat from '@/app/components/compact-chat'
import { initGameState } from '../components/chess_game/constants'
import Control from '../components/chess_game/Control/Control'
import TakeBack from '../components/chess_game/Control/bits/TakeBack'
import { reducer } from '../components/chess_game/reducer/reducer'
import actionTypes from '../components/chess_game/reducer/actionTypes'
import AppContext from '../contexts/Context'

const CHANNEL_NAME = 'ft-transcendence-chess-sync-v1'

export default function GamePage() {
  const [appState, dispatch] = useReducer(reducer, initGameState)

  const channelRef = useRef<BroadcastChannel | null>(null)
  const tabIdRef = useRef<string>('')
  const skipNextBroadcastRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
      return
    }

    tabIdRef.current = window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
    const channel = new BroadcastChannel(CHANNEL_NAME)
    channelRef.current = channel

    channel.onmessage = (event) => {
      const payload = event?.data

      if (!payload || payload.senderId === tabIdRef.current || !payload.state) {
        return
      }

      skipNextBroadcastRef.current = true
      dispatch({
        type: actionTypes.NEW_GAME,
        payload: payload.state,
      })
    }

    return () => {
      channel.close()
      channelRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!channelRef.current || !tabIdRef.current) {
      return
    }

    if (skipNextBroadcastRef.current) {
      skipNextBroadcastRef.current = false
      return
    }

    channelRef.current.postMessage({
      senderId: tabIdRef.current,
      state: appState,
    })
  }, [appState])

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
          <div style={{ marginTop: '12px', minWidth: '260px' }}>
            <CompactChat maxHeight='max-h-80' />
          </div>
        </Control>
      </div>
    </AppContext.Provider>
  )
}
