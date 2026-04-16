import './PromotionBox.css'

const PromotionBox = () => {
	const options = ['q', 'r', 'b', 'n']
	const color = 'w'

	const x = 7
	const y = 6

	const getPromotionBoxPosition = () => {
		const style = {}

		if (x === 7)
			style.top = '-12.5%'
		else
			style.top = '97.5%'	

		if (y <= 1)
			style.left = '0%'
		else if (y >= 6)
			style.right = '0%'
		else
			style.left = `${12.5 * y - 20}%`

		return style
	}

	return (
    <div
      className="popup--inner promotion-choices"
      style={getPromotionBoxPosition()}
    >
      {options.map((option) => (
        <div
          key={option}
          onClick={() => onClick(option)}
          className={`piece ${color}${option}`}
        />
      ))}
    </div>
  );
}

export default PromotionBox