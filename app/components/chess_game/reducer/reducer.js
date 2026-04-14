import actionTypes from "./actionTypes"
import { Status } from "../constants"

export const reducer = (state, action) => {

	switch (action.type) {

		case actionTypes.NEW_MOVE : {
	
			let {turn,position} = state

			position = [
				...position,
				action.payload.newPosition
			]
			turn = turn === 'w' ? 'b' : 'w'
			return {
				...state,
				position,
				turn,
			}
		}
		case actionTypes.GENERATE_CANDIDATE_MOVES : {

			return {
				...state,
				candidateMoves : action.payload.candidateMoves
			}
		}

		default :
			return state
	}
}
