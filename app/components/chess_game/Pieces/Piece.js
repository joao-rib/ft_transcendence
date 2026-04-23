import arbiter from '../arbiter/arbiter';
import { useAppContext } from "@/app/contexts/Context";
import { generateCandidates } from "../reducer/actions/move";

const Piece = ({
    rank,
    file,
    piece,
}) => {

    const { appState, dispatch, onlineGame } = useAppContext();
    const { turn, castleDirection, position: currentPosition } = appState
    const isOnlineGame = Boolean(onlineGame?.isOnlineGame)
    const playerColor = onlineGame?.playerColor ?? null
    const isOwnPiece = !isOnlineGame || piece[0] === playerColor
    const isDraggable = isOwnPiece && turn === piece[0]

    const onDragStart = e => {
        if (!isDraggable) {
            e.preventDefault()
            return
        }

        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", `${piece},${rank},${file}`)
        setTimeout(() => {
            e.target.style.display = 'none'
        }, 0)

        const candidateMoves =
            arbiter.getValidMoves({
                position: currentPosition[currentPosition.length - 1],
                prevPosition: currentPosition[currentPosition.length - 2],
                castleDirection: castleDirection[turn],
                piece,
                file,
                rank
            })
        dispatch(generateCandidates({ candidateMoves }))

    }
    const onDragEnd = e => {
        e.target.style.display = 'block'
    }

    return (
        <div
            className={`piece ${piece} pos-${file}${rank}`}
            draggable={isDraggable}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}

        />)
}

export default Piece
