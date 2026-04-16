import './PromotionBox.css'

const PromotionBox = () => {
	const options = ['q', 'r', 'b', 'n']
	const color = 'w'

	return <div className='popup-inner promotion-choices'>
		{options.map(option => <div className='piece '>{option}</div>)}
	</div>
}

export default PromotionBox