const Piece = ({
    rank,
    file,
    piece,
}) => {

	return (
		<div 
			className={`piece ${piece} pos-${file}${rank}`}
			draggable={true}
			
		/>
	)
}

export default Piece