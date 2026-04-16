import { createPosition } from "./helper";

export const Status = {
	'ongoing' : 'Ongoing',
	'promoting' : 'Promotion',
	'white' : 'white wins',
	'black' : 'Black wins'
} 

export const initGameState = {
	position : [createPosition()],
	turn :'w',
	candidateMoves : [],
	status : Status.ongoing,
	promotionSquare : null
}