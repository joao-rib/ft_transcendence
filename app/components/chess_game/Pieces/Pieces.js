'use client'

import './Pieces.css'
import Piece from './Piece'
import { useState } from 'react'
import { createPosition } from '../helper'

const Pieces = () => {

	const [state,setState] = useState(createPosition())
	const onDrop = e => {
		console.log(e.dataTransfer.getData('text'));
	}
	const onDragOver = e => e.preventDefault()

	return <div
		onDrop={onDrop}
		onDragOver={onDragOver}
		className='pieces'>
		{state.map((r,rank) => 
			r.map((f,file) =>
				state[rank][file]
				?	<Piece
						key={rank+'-'+file}
						rank={rank}
						file={file}
						piece={state[rank][file]}
					/>
				:	null
			)
		)}
	</div>
}

export default Pieces
