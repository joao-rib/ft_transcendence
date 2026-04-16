import { useAppContext } from '@/app/contexts/Context'
import './Popup.css'
import PromotionBox from './PromotionBox/PromotionBox'
import { Status } from '../constants'

const Popup = () => {

	const {appState} = useAppContext()

	if (appState.status === Status.ongoing)
		return null

	return <div className='popup'>
		<PromotionBox/>
	</div>
}

export default Popup