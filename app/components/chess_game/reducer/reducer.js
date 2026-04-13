import actionTypes from "./actionTypes"
import { Status } from "../constants"

export const reducer = (state, action) => {

	switch (action.type) {

		case actionTypes.NEW_MOVE : {
	
			let {turn,position} = state
			turn = turn === 'w' ? 'b' : 'w'

			position = [
				...position,
				action.payload.newPosition
			]
			return {
				...state,
				turn,
				position,
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
