import { useAppContext } from '@/app/contexts/Context'
import './PromotionBox.css'

const PromotionBox = () => {
	const options = ['q', 'r', 'b', 'n']

	const {appState} = useAppContext()
	const {promotionSquare} = appState

	if (!promotionSquare)
		return null

	const color = promotingSquare.x === 7 ? 'w' : 'b'

	const getPromotionBoxPosition = () => {
		const style = {}

		if (promotionSquare.x === 7)
			style.top = '-12.5%'
		else
			style.top = '97.5%'	

		if (promotionSquare.y <= 1)
			style.left = '0%'
		else if (promotionSquare.y >= 6)
			style.right = '0%'
		else
			style.left = `${12.5 * promotionSquare.y - 20}%`

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