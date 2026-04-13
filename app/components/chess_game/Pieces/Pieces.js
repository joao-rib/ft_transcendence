'use client'

import './Pieces.css'
import Piece from './Piece'
import { useState, useRef } from 'react'
import { createPosition, copyPosition } from '../helper'
import { useAppContext } from '@/app/contexts/Context'
import { makeNewMove } from '@/app/contexts/reducer/actions/move'

const Pieces = () => {

	const ref = useRef()
	const {appState, dispatch} = useAppContext()
	const currentPosition = appState.position[appState.position.length - 1]

	 const calculateCoords = e => {
        const {top,left,width} = ref.current.getBoundingClientRect()
        const size = width / 8
        const y = Math.floor((e.clientX - left) / size) 
        const x = 7 - Math.floor((e.clientY - top) / size)

        return {x,y}
    }

	const onDrop = e => {
		e.preventDefault()
		const newPosition = copyPosition(currentPosition)
		const {x,y} = calculateCoords(e)

		const [pos,rank,file] = e.dataTransfer.getData('text').split(',')

		newPosition[rank][file] = ''
		newPosition[x][y] = pos
		dispatch(makeNewMove({newPosition}))
	}
	const onDragOver = e => e.preventDefault()

	return <div
		ref = {ref}
		onDrop={onDrop}
		onDragOver={onDragOver}
		className='pieces'>
		{currentPosition.map((r,rank) => 
			r.map((f,file) =>
				currentPosition[rank][file]
				?	<Piece
						key={rank+'-'+file}
						rank={rank}
						file={file}
						piece={currentPosition[rank][file]}
					/>
				:	null
			)
		)}
	</div>
}

export default Pieces
