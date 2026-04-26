import { Status } from '../../constants';
import { useAppContext }from '@/app/contexts/Context'
import { setupNewGame } from '../../reducer/actions/game';
import './GameEnds.css'

const GameEnds = ({onClosePopup}) => {

    const { appState : {status} , dispatch } = useAppContext();
    
    if (status === Status.ongoing || status === Status.promoting)
        return null

    const newGame = () => {
        dispatch(setupNewGame())
    }

    const backToLobby = () => {
        // Navigate back to lobby
        window.location.href = '/game/lobby';
    }

    const isWin = status.endsWith('wins')

    return <div className="popup--inner popup--inner__center">
        <h1>{isWin ? status : 'Draw'}</h1>
        <p>{!isWin && status}</p>
        <div className={`${status}`}/>
        <div className="game-ends-buttons">
            <button onClick={newGame}>New Game</button>
            <button onClick={backToLobby} className="back-to-lobby">Back to Lobby</button>
        </div>
    </div>
   
}

export default GameEnds