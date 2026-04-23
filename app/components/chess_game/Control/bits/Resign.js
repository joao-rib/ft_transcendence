import { useAppContext } from '@/app/contexts/Context'

const Resign = () => {
  const { onlineGame } = useAppContext()

  const handleResign = () => {
    if (onlineGame?.isOnlineGame) {
      onlineGame.resignGame()
      return
    }

    console.log('Resign clicked')
  }

  return (
    <div>
      <button className='resign-btn' onClick={handleResign}>
        Resign
      </button>
    </div>
  )
}

export default Resign
